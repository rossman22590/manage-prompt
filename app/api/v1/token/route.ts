import { createId } from "@paralleldrive/cuid2";
import { type NextRequest, NextResponse } from "next/server";
import {
  ErrorCodes,
  ErrorResponse,
  UnauthorizedResponse,
} from "@/lib/utils/api";
import { prisma } from "@/lib/utils/db";
import { validateRateLimit } from "@/lib/utils/ratelimit";
import { redis } from "@/lib/utils/redis";
import {
  hasExceededSpendLimit,
  isSubscriptionActive,
} from "@/lib/utils/stripe";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    const authorization = req.headers.get("authorization");
    if (!authorization) {
      return UnauthorizedResponse();
    }

    const token = authorization.split("Bearer ")[1];
    if (!token) {
      return UnauthorizedResponse();
    }

    const key = await prisma.secretKey.findUnique({
      where: {
        key: token,
      },
      include: {
        organization: {
          include: {
            stripe: true,
          },
        },
      },
    });
    if (!key) {
      return UnauthorizedResponse();
    }

    // Rate limit
    const rateLimitKey =
      req.headers.get("x-user-id") ?? `key_${key.ownerId}_${key.id}`;
    const {
      success: keyRateLimitSuccess,
      limit,
      remaining,
    } = await validateRateLimit(rateLimitKey, key.rateLimitPerSecond);
    if (!keyRateLimitSuccess) {
      return ErrorResponse("Rate limit exceeded", 429);
    }

    // Check if the organization has valid billing
    const organization = key.organization;
    
    // Block if credits are 0 (regardless of subscription status)
    if (organization?.credits === 0) {
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

    const pub_token = `pub_tok_${createId()}`;

    const searchParams = req.nextUrl.searchParams;

    const ttlFromQuery = Number(searchParams.get("ttl") ?? 60);
    const ttl = Number.isNaN(ttlFromQuery)
      ? 60
      : Math.min(Math.max(ttlFromQuery, 1), 300);

    try {
      await redis.set(
        pub_token,
        {
          ownerId: organization?.id,
        },
        {
          ex: ttl,
        },
      );
    } catch (redisError: any) {
      console.error("Redis connection error:", redisError);
      // Check if it's a connection/DNS error
      if (
        redisError?.cause?.code === "ENOTFOUND" ||
        redisError?.message?.includes("fetch failed") ||
        redisError?.message?.includes("getaddrinfo")
      ) {
        return ErrorResponse(
          "Redis service unavailable. Please check your UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN environment variables.",
          503,
          ErrorCodes.InternalServerError,
        );
      }
      // Re-throw other Redis errors to be caught by outer catch
      throw redisError;
    }

    return NextResponse.json(
      { success: true, token: pub_token, ttl },
      {
        headers: {
          "x-ratelimit-limit": limit.toString(),
          "x-ratelimit-remaining": remaining.toString(),
        },
      },
    );
  } catch (error) {
    console.error("Token creation error:", error);
    console.error("Error stack:", error instanceof Error ? error.stack : "No stack");
    return ErrorResponse(
      "Failed to create token, please try again or contact support.",
      500,
      ErrorCodes.InternalServerError,
    );
  }
}
