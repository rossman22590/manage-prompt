import { waitUntil } from "@vercel/functions";
import type { ModelMessage } from "ai";
import { type NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { runAgentChat } from "@/lib/utils/agent-chat";
import { prisma } from "@/lib/utils/db";
import { isAgentsFeatureEnabled } from "@/lib/utils/feature-flags";
import { validateRateLimit } from "@/lib/utils/ratelimit";
import {
  hasExceededSpendLimit,
  isSubscriptionActive,
  reportUsage,
} from "@/lib/utils/stripe";
import { cacheAgentResult, getAgentCachedResult } from "@/lib/utils/useAgent";

export const maxDuration = 300;

const openAIError = (
  message: string,
  status: number,
  type = "invalid_request_error",
) => NextResponse.json({ error: { message, type, code: null } }, { status });

const estimateTokens = (input: string, output: string) => {
  const inputWords = input.trim() ? input.trim().split(/\s+/).length : 0;
  const outputWords = output.trim() ? output.trim().split(/\s+/).length : 0;
  return Math.floor((inputWords + outputWords) * 0.6);
};

const mapFinishReason = (reason: string): string => {
  if (reason === "length") return "length";
  if (reason === "tool-calls") return "tool_calls";
  if (reason === "content-filter") return "content_filter";
  return "stop";
};

const buildChatCompletion = (
  id: string,
  created: number,
  model: string,
  content: string,
  totalTokens: number,
  finishReason = "stop",
) => ({
  id,
  object: "chat.completion",
  created,
  model,
  choices: [
    {
      index: 0,
      message: { role: "assistant", content },
      finish_reason: finishReason,
    },
  ],
  usage: {
    prompt_tokens: 0,
    completion_tokens: totalTokens,
    total_tokens: totalTokens,
  },
});

const sseChunk = (
  id: string,
  created: number,
  model: string,
  delta: Record<string, unknown>,
  finishReason: string | null,
) =>
  `data: ${JSON.stringify({
    id,
    object: "chat.completion.chunk",
    created,
    model,
    choices: [{ index: 0, delta, finish_reason: finishReason }],
  })}\n\n`;

function streamPlainText(
  id: string,
  created: number,
  model: string,
  text: string,
) {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      controller.enqueue(
        encoder.encode(
          sseChunk(id, created, model, { role: "assistant" }, null),
        ),
      );
      controller.enqueue(
        encoder.encode(sseChunk(id, created, model, { content: text }, null)),
      );
      controller.enqueue(
        encoder.encode(sseChunk(id, created, model, {}, "stop")),
      );
      controller.enqueue(encoder.encode("data: [DONE]\n\n"));
      controller.close();
    },
  });
  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}

export async function POST(req: NextRequest) {
  if (!isAgentsFeatureEnabled()) {
    return openAIError(
      "The Agents API is currently disabled",
      404,
      "invalid_request_error",
    );
  }

  const authorization = req.headers.get("authorization");
  const token = authorization?.split("Bearer ")[1];
  if (!token) {
    return openAIError("Missing bearer token", 401, "authentication_error");
  }

  const key = await prisma.secretKey.findUnique({
    where: { key: token },
    include: { organization: { include: { stripe: true } } },
  });
  if (!key) {
    return openAIError("Invalid API key", 401, "authentication_error");
  }

  const rateLimitKey = `key_${key.ownerId}_${key.id}`;
  const { success: rateLimitOk } = await validateRateLimit(
    rateLimitKey,
    key.rateLimitPerSecond,
  );
  if (!rateLimitOk) {
    return openAIError("Rate limit exceeded", 429, "rate_limit_error");
  }

  const organization = key.organization;
  if ((organization?.credits ?? 0) <= 0) {
    if (!isSubscriptionActive(organization?.stripe?.subscription)) {
      return openAIError(
        "You exceeded your current quota",
        402,
        "insufficient_quota",
      );
    }
    if (
      await hasExceededSpendLimit(
        organization?.spendLimit,
        organization?.stripe?.customerId,
      )
    ) {
      return openAIError("Spend limit exceeded", 402, "insufficient_quota");
    }
    return openAIError(
      "You exceeded your current quota",
      402,
      "insufficient_quota",
    );
  }

  const body = await req.json().catch(() => null);
  if (!body?.model || !Array.isArray(body?.messages)) {
    return openAIError("Missing required fields: model, messages", 400);
  }

  const agent = await prisma.agent.findFirst({
    where: { shortId: body.model, ownerId: key.ownerId, published: true },
  });
  if (!agent) {
    return openAIError(
      `The model '${body.model}' does not exist or is not published`,
      404,
      "invalid_request_error",
    );
  }

  const messages: ModelMessage[] = body.messages.map(
    (m: { role: string; content: string }) => ({
      role: m.role,
      content: m.content,
    }),
  );
  const stream = Boolean(body.stream);
  const rawBody = JSON.stringify(body);
  const subscription = organization?.stripe
    ?.subscription as unknown as Stripe.Subscription;
  const created = Math.floor(Date.now() / 1000);
  const completionId = `chatcmpl-${created}-${agent.shortId}`;

  const cached = agent.cacheControlTtl
    ? await getAgentCachedResult(agent.shortId, rawBody)
    : null;

  if (cached) {
    const totalTokenCount = estimateTokens(rawBody, cached);
    waitUntil(
      Promise.all([
        reportUsage(agent.ownerId, subscription, totalTokenCount),
        prisma.agentRun.create({
          data: { agentId: agent.id, source: "api", totalTokenCount },
        }),
      ]).catch((error) => console.error(error)),
    );

    return stream
      ? streamPlainText(completionId, created, agent.shortId, cached)
      : NextResponse.json(
          buildChatCompletion(
            completionId,
            created,
            agent.shortId,
            cached,
            totalTokenCount,
          ),
        );
  }

  if (stream) {
    const result = runAgentChat({
      agent,
      messages,
      onFinish: async (event) => {
        const totalTokenCount = event.usage?.totalTokens ?? 0;
        await Promise.all([
          reportUsage(agent.ownerId, subscription, totalTokenCount),
          prisma.agentRun.create({
            data: { agentId: agent.id, source: "api", totalTokenCount },
          }),
          agent.cacheControlTtl
            ? cacheAgentResult(
                agent.shortId,
                rawBody,
                event.text ?? "",
                agent.cacheControlTtl,
              )
            : null,
        ]);
      },
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        controller.enqueue(
          encoder.encode(
            sseChunk(
              completionId,
              created,
              agent.shortId,
              { role: "assistant" },
              null,
            ),
          ),
        );
        for await (const delta of result.textStream) {
          controller.enqueue(
            encoder.encode(
              sseChunk(
                completionId,
                created,
                agent.shortId,
                { content: delta },
                null,
              ),
            ),
          );
        }
        const finishReason = mapFinishReason(await result.finishReason);
        controller.enqueue(
          encoder.encode(
            sseChunk(completionId, created, agent.shortId, {}, finishReason),
          ),
        );
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  }

  const result = runAgentChat({ agent, messages });
  const text = await result.text;
  const usage = await result.usage;
  const finishReason = mapFinishReason(await result.finishReason);
  const totalTokenCount = usage?.totalTokens ?? 0;

  waitUntil(
    Promise.all([
      reportUsage(agent.ownerId, subscription, totalTokenCount),
      prisma.agentRun.create({
        data: { agentId: agent.id, source: "api", totalTokenCount },
      }),
      agent.cacheControlTtl
        ? cacheAgentResult(agent.shortId, rawBody, text, agent.cacheControlTtl)
        : null,
    ]).catch((error) => console.error(error)),
  );

  return NextResponse.json(
    buildChatCompletion(
      completionId,
      created,
      agent.shortId,
      text,
      totalTokenCount,
      finishReason,
    ),
  );
}
