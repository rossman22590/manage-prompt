import { type NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { modelToProviderId } from "@/data/workflow";
import { getStreamingCompletion } from "@/lib/utils/ai";
import { ErrorCodes, ErrorResponse } from "@/lib/utils/api";
import { prisma } from "@/lib/utils/db";
import { redis } from "@/lib/utils/redis";
import {
  hasExceededSpendLimit,
  isSubscriptionActive,
} from "@/lib/utils/stripe";

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

    // Derived from the actual incoming request rather than a fixed env var,
    // so the returned streamUrl points back at whichever of our domains the
    // caller actually used, not always one hardcoded domain.
    const baseUrl = req.nextUrl.origin;

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
