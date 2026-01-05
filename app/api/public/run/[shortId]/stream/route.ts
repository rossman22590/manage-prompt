import { modelToProviderId } from "@/data/workflow";
import { ErrorCodes, ErrorResponse } from "@/lib/utils/api";
import { prisma } from "@/lib/utils/db";
import { hasExceededSpendLimit, isSubscriptionActive, reportUsage } from "@/lib/utils/stripe";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { streamText } from "ai";
import { NextRequest } from "next/server";
import type Stripe from "stripe";

const getOpenRouterHeaders = () => {
  const appUrl =
    process.env.APP_BASE_URL ||
    process.env.NEXT_PUBLIC_APP_BASE_URL ||
    "https://manageprompt.com";

  const siteName = process.env.OPENROUTER_SITE_NAME || "AI Tutor API";

  const headers: Record<string, string> = {
    "HTTP-Referer": appUrl,
    "X-Title": siteName,
  };
  return headers;
};

export async function POST(
  req: NextRequest,
  props: { params: Promise<{ shortId: string }> },
) {
  const params = await props.params;
  const searchParams = req.nextUrl.searchParams;
  const token = searchParams.get("token");

  if (!token) {
    return ErrorResponse("Token required", 401);
  }

  try {
    // Find the workflow by shortId
    const workflow = await prisma.workflow.findUnique({
      where: {
        shortId: params.shortId,
      },
      include: {
        organization: {
          include: {
            stripe: true,
          },
        },
      },
    });

    if (!workflow || !workflow.published) {
      return ErrorResponse("Workflow not found or not published", 404);
    }

    const organization = workflow.organization;

    // Block if credits are 0 (regardless of subscription status)
    if (organization?.credits === 0) {
      // If no subscription, block with invalid billing
      if (!isSubscriptionActive(organization?.stripe?.subscription)) {
        return ErrorResponse(
          "This workflow is temporarily unavailable. Please contact the workflow owner.",
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
          "This workflow is temporarily unavailable due to billing limits.",
          402,
          ErrorCodes.SpendLimitReached,
        );
      }

      // If has subscription but no spend limit exceeded, still block at 0 credits
      return ErrorResponse(
        "This workflow is temporarily unavailable. Please contact the workflow owner.",
        402,
        ErrorCodes.InvalidBilling,
      );
    }

    const body = (await req.json().catch(() => ({}))) ?? {};

    // Build the prompt from template
    let prompt = workflow.template;
    Object.keys(body).forEach((key) => {
      prompt = prompt.replace(`{{${key}}}`, body[key]);
    });

    // Build instruction if present
    let instruction = workflow.instruction ?? "";
    Object.keys(body).forEach((key) => {
      instruction = instruction.replace(`{{${key}}}`, body[key]);
    });

    const model = modelToProviderId[workflow.model] ?? workflow.model;
    const subscription = organization?.stripe
      ?.subscription as unknown as Stripe.Subscription | null;

    const openrouter = createOpenRouter({
      apiKey: process.env.OPENROUTER_API_KEY,
    });

    const modelSettings = (workflow.modelSettings as any) ?? {};

    // Note: maxTokens is not supported by OpenRouter provider in Vercel AI SDK
    // OpenRouter models have their own default token limits
    const completion = streamText({
      model: openrouter(model),
      headers: getOpenRouterHeaders(),
      prompt,
      system: instruction || undefined,
      temperature: modelSettings.temperature ?? 0.7,
      topP: modelSettings.topP ?? 1,
      frequencyPenalty: modelSettings.frequencyPenalty ?? 0,
      presencePenalty: modelSettings.presencePenalty ?? 0,
      onFinish: async (result) => {
        const totalTokens = result.usage?.totalTokens ?? 0;
        if (totalTokens > 0) {
          await reportUsage(organization.id, subscription, totalTokens);
        }
      },
    });

    return completion.toTextStreamResponse({
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "*",
      },
    });
  } catch (error: any) {
    console.error("Error in public workflow stream:", error);
    return ErrorResponse(
      error?.message || "Failed to stream workflow",
      500,
      ErrorCodes.InternalServerError,
    );
  }
}

