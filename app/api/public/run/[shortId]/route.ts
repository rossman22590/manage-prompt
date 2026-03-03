import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/utils/db";
import { getStreamingCompletion } from "@/lib/utils/ai";
import { modelToProviderId } from "@/data/workflow";
import { isSubscriptionActive, hasExceededSpendLimit } from "@/lib/utils/stripe";
import type Stripe from "stripe";
import { ErrorCodes, ErrorResponse } from "@/lib/utils/api";
import { redis } from "@/lib/utils/redis";

export const maxDuration = 300;

export async function POST(
  req: NextRequest,
  props: { params: Promise<{ shortId: string }> },
) {
  const params = await props.params;

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

    // Check if share link has expired
    if (workflow.shareExpiresAt && workflow.shareExpiresAt < new Date()) {
      return ErrorResponse("This share link has expired", 410);
    }

    const organization = workflow.organization;

    // Block if credits are 0 (regardless of subscription status)
    if ((organization?.credits ?? 0) <= 0) {
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

    const token = `pub_${crypto.randomUUID()}`;
    await redis.set(token, { shortId: params.shortId }, { ex: 60 });

    const baseUrl =
      process.env.APP_BASE_URL ||
      process.env.NEXT_PUBLIC_APP_BASE_URL ||
      "http://localhost:3000";

    const streamUrl = `${baseUrl}/api/public/run/${params.shortId}/stream?token=${token}`;

    return NextResponse.json({ streamUrl });
  } catch (error: any) {
    console.error("Error in public workflow run:", error);
    return ErrorResponse(
      "Failed to run workflow",
      500,
      ErrorCodes.InternalServerError,
    );
  }
}

