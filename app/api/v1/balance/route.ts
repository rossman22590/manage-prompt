import { type NextRequest, NextResponse } from "next/server";
import {
  ErrorCodes,
  ErrorResponse,
  UnauthorizedResponse,
} from "@/lib/utils/api";
import { prisma } from "@/lib/utils/db";
import { validateRateLimit } from "@/lib/utils/ratelimit";

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
        organization: true,
      },
    });
    if (!key) {
      return UnauthorizedResponse();
    }

    const rateLimitKey = `balance_${key.ownerId}_${key.id}`;
    const {
      success: rateLimitSuccess,
      limit,
      remaining,
    } = await validateRateLimit(rateLimitKey, key.rateLimitPerSecond);
    if (!rateLimitSuccess) {
      return ErrorResponse("Rate limit exceeded", 429);
    }

    const credits = key.organization?.credits ?? 0;

    return NextResponse.json(
      { success: true, credits },
      {
        headers: {
          "x-ratelimit-limit": limit.toString(),
          "x-ratelimit-remaining": remaining.toString(),
        },
      },
    );
  } catch (error) {
    console.error("Balance check error:", error);
    return ErrorResponse(
      "Failed to retrieve balance, please try again or contact support.",
      500,
      ErrorCodes.InternalServerError,
    );
  }
}
