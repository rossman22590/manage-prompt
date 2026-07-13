import { waitUntil } from "@vercel/functions";
import { convertToModelMessages, type UIMessage } from "ai";
import { type NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { owner } from "@/lib/hooks/useOwner";
import { runAgentChat } from "@/lib/utils/agent-chat";
import { prisma } from "@/lib/utils/db";
import {
  hasExceededSpendLimit,
  isSubscriptionActive,
  reportUsage,
} from "@/lib/utils/stripe";

export const maxDuration = 300;

export async function POST(
  req: NextRequest,
  props: { params: Promise<{ agentId: string }> },
) {
  const params = await props.params;
  const { ownerId } = await owner();
  if (!ownerId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [agent, organization] = await Promise.all([
    prisma.agent.findFirst({
      where: { id: Number(params.agentId), ownerId },
    }),
    prisma.organization.findUnique({
      where: { id: ownerId },
      include: { stripe: true },
    }),
  ]);

  if (!agent) {
    return NextResponse.json({ error: "Agent not found" }, { status: 404 });
  }
  if (!organization) {
    return NextResponse.json(
      { error: "Organization not found" },
      { status: 401 },
    );
  }

  if ((organization.credits ?? 0) <= 0) {
    if (!isSubscriptionActive(organization.stripe?.subscription)) {
      return NextResponse.json(
        {
          error:
            "No credits remaining. Please add credits to continue using the service.",
        },
        { status: 402 },
      );
    }
    if (
      await hasExceededSpendLimit(
        organization.spendLimit,
        organization.stripe?.customerId,
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Spend limit exceeded. Please increase your spend limit to continue using the service.",
        },
        { status: 402 },
      );
    }
    return NextResponse.json(
      {
        error:
          "No credits remaining. Please add credits to continue using the service.",
      },
      { status: 402 },
    );
  }

  const { messages }: { messages: UIMessage[] } = await req.json();
  const subscription = organization.stripe
    ?.subscription as unknown as Stripe.Subscription;

  const result = runAgentChat({
    agent,
    messages: convertToModelMessages(messages),
    onFinish: async (event) => {
      const totalTokenCount = event.usage?.totalTokens ?? 0;
      const runPromise = Promise.all([
        reportUsage(ownerId, subscription, totalTokenCount),
        prisma.agentRun.create({
          data: {
            agentId: agent.id,
            source: "dashboard",
            totalTokenCount,
            createdBy: ownerId,
          },
        }),
      ]).catch((error) => console.error(error));
      waitUntil(runPromise);
      await runPromise;
    },
  });

  return result.toUIMessageStreamResponse();
}
