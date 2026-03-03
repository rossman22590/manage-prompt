import { type NextRequest, NextResponse } from "next/server";
import type { WorkflowInput } from "@/data/workflow";
import { getStreamingCompletion } from "@/lib/utils/ai";
import {
  ErrorCodes,
  ErrorResponse,
  UnauthorizedResponse,
} from "@/lib/utils/api";
import { prisma } from "@/lib/utils/db";
import { redis } from "@/lib/utils/redis";
import {
  hasExceededSpendLimit,
  isSubscriptionActive,
  reportUsage,
} from "@/lib/utils/stripe";
import {
  cacheWorkflowResult,
  getWorkflowCachedResult,
} from "@/lib/utils/useWorkflow";
import { translateInputs } from "@/lib/utils/workflow";
import { waitUntil } from "@vercel/functions";
import type Stripe from "stripe";

export const maxDuration = 300;

const estimateTokenCount = (input: string, output: string) => {
  const inputWordCount = input.trim()
    ? input.trim().split(/\s+/).length
    : 0;
  const outputWordCount = output.trim()
    ? output.trim().split(/\s+/).length
    : 0;
  return Math.floor((inputWordCount + outputWordCount) * 0.6);
};

export async function OPTIONS() {
  return NextResponse.json(
    {},
    {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "*",
      },
    },
  );
}

export async function POST(
  req: NextRequest,
  props: { params: Promise<{ workflowId: string }> },
) {
  const params = await props.params;
  const searchParams = req.nextUrl.searchParams;
  const token = searchParams.get("token");

  if (!token) {
    return UnauthorizedResponse();
  }

  try {
    const validateToken: { ownerId: string } | null = await redis.get(token);
    if (!validateToken) {
      return UnauthorizedResponse();
    }
    await redis.del(token);

    const [workflow, organization] = await Promise.all([
      prisma.workflow.findUnique({
        where: {
          shortId: params.workflowId,
        },
      }),
      prisma.organization.findUnique({
        where: {
          id: validateToken.ownerId,
        },
        include: {
          stripe: true,
        },
      }),
    ]);
    if (!workflow || !workflow?.published) {
      return ErrorResponse("Workflow not found", 404);
    }
    if (workflow.ownerId !== validateToken.ownerId) {
      return UnauthorizedResponse();
    }
    if (!organization) {
      return UnauthorizedResponse();
    }

    // Block if credits are 0 (regardless of subscription status)
    if ((organization?.credits ?? 0) <= 0) {
      // If no subscription, block with invalid billing
      if (!isSubscriptionActive(organization?.stripe?.subscription)) {
        return ErrorResponse(
          "Invalid billing. Please contact support.",
          402,
          ErrorCodes.InvalidBilling,
        );
      }
      
      // If has subscription but spend limit exceeded, block with spend limit error
      if (
        await hasExceededSpendLimit(
          organization?.spendLimit,
          organization?.stripe?.customerId,
        )
      ) {
        return ErrorResponse(
          "Spend limit exceeded. Please increase your spend limit to continue using the service.",
          402,
          ErrorCodes.SpendLimitReached,
        );
      }
      
      // If has subscription but no spend limit exceeded, still block at 0 credits
      return ErrorResponse(
        "No credits remaining. Please add credits to continue using the service.",
        402,
        ErrorCodes.InvalidBilling,
      );
    }

    const body = (await req.json().catch(() => {})) ?? {};
    const rawBody = JSON.stringify(body);
    const cachedResult = await getWorkflowCachedResult(
      params.workflowId,
      rawBody,
    );
    const subscription = organization?.stripe
      ?.subscription as unknown as Stripe.Subscription;

    if (cachedResult) {
      const cachedTokenCount = estimateTokenCount(rawBody, cachedResult);
      waitUntil(
        reportUsage(organization.id, subscription, cachedTokenCount).catch(
          (error) => {
            console.error(error);
          },
        ),
      );

      const chunks = cachedResult.match(/.{1,1024}/gs) ?? [cachedResult];
      const encoder = new TextEncoder();

      const stream = new ReadableStream({
        async start(controller) {
          for (const chunk of chunks) {
            controller.enqueue(encoder.encode(chunk));
          }
          controller.close();
        },
      });

      return new Response(stream, {
        status: 200,
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "*",
        },
      });
    }

    const model = workflow.model;
    const inputs = workflow.inputs as unknown as WorkflowInput[];
    const { content, imageParts } = await translateInputs({
      inputs,
      inputValues: body,
      template: workflow.template,
    });

    const onFinish = async (evt: any) => {
      const output = evt.text ?? "";

      const inputWordCount = content.split(" ").length;
      const outWordCount = output.split(" ").length;
      const reportedTokens = Number(evt?.usage?.totalTokens);
      const totalTokens = Number.isFinite(reportedTokens)
        ? reportedTokens
        : Math.floor((inputWordCount + outWordCount) * 0.6);

      const runPromise = Promise.all([
        reportUsage(organization.id, subscription, totalTokens ?? 0),
        prisma.workflowRun.create({
          data: {
            result: output,
            rawRequest: JSON.parse(JSON.stringify({ model, content })),
            rawResult: JSON.parse(JSON.stringify({ result: output })),
            totalTokenCount: totalTokens ?? 0,
            user: {
              connect: {
                id: validateToken.ownerId,
              },
            },
            workflow: {
              connect: {
                id: workflow.id,
              },
            },
          },
        }),
        workflow.cacheControlTtl
          ? cacheWorkflowResult(
              params.workflowId,
              JSON.stringify(body),
              output,
              workflow.cacheControlTtl,
            )
          : null,
      ]).catch((error) => {
        console.error(error);
      });

      waitUntil(runPromise);
      await runPromise;
    };

    if (!process.env.OPENROUTER_API_KEY) {
      return ErrorResponse(
        "OpenRouter API key not configured",
        500,
        ErrorCodes.InternalServerError,
      );
    }

    const response = await getStreamingCompletion(
      model,
      content,
      JSON.parse(JSON.stringify(workflow.modelSettings)),
      onFinish,
      imageParts,
    );

    return response;
  } catch (error) {
    console.error("Stream route error:", error);
    console.error("Error details:", {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return ErrorResponse(
      `Failed to run workflow: ${error instanceof Error ? error.message : "Unknown error"}`,
      500,
      ErrorCodes.InternalServerError,
    );
  }
}
