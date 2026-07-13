import { waitUntil } from "@vercel/functions";
import { convertToModelMessages, type UIMessage } from "ai";
import { type NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { owner } from "@/lib/hooks/useOwner";
import { runAgentChat } from "@/lib/utils/agent-chat";
import { prisma } from "@/lib/utils/db";
import { checkBillingGate, reportUsage } from "@/lib/utils/stripe";

export const maxDuration = 300;

export async function POST(
  req: NextRequest,
  props: { params: Promise<{ agentId: string }> },
) {
  try {
    const params = await props.params;
    const agentId = Number(params.agentId);
    if (!Number.isInteger(agentId)) {
      return NextResponse.json({ error: "Invalid agent id" }, { status: 400 });
    }

    const { ownerId } = await owner();
    if (!ownerId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [agent, organization] = await Promise.all([
      prisma.agent.findFirst({
        where: { id: agentId, ownerId },
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

    const billingGate = await checkBillingGate(organization);
    if (billingGate.blocked) {
      if (billingGate.reason === "spend_limit_exceeded") {
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
            billingGate.reason === "no_subscription"
              ? "Invalid billing. Please contact support."
              : "No credits remaining. Please add credits to continue using the service.",
        },
        { status: 402 },
      );
    }

    const body = (await req.json().catch(() => null)) as {
      messages?: UIMessage[];
    } | null;
    if (!body?.messages || !Array.isArray(body.messages)) {
      return NextResponse.json(
        { error: "Missing or invalid 'messages' field" },
        { status: 400 },
      );
    }

    const subscription = organization.stripe
      ?.subscription as unknown as Stripe.Subscription;

    const result = runAgentChat({
      agent,
      messages: convertToModelMessages(body.messages),
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
  } catch (error) {
    console.error("Agent chat route error:", error);
    return NextResponse.json(
      { error: "Failed to process chat request" },
      { status: 500 },
    );
  }
}
