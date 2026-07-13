import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { type ModelMessage, streamText } from "ai";
import type { ModelSettings } from "@/components/console/workflow/workflow-model-settings";
import { type AIModel, hasWebSearch, modelToProviderId } from "@/data/workflow";
import type { Agent } from "@/generated/prisma-client/client";
import { getOpenRouterHeaders } from "@/lib/utils/ai";

type FinishEvent = {
  text?: string;
  usage?: { totalTokens?: number };
};

export function runAgentChat({
  agent,
  messages,
  onFinish,
}: {
  agent: Pick<Agent, "model" | "systemPrompt" | "modelSettings">;
  messages: ModelMessage[];
  onFinish?: (event: FinishEvent) => void | Promise<void>;
}) {
  const openrouter = createOpenRouter({
    apiKey: process.env.OPENROUTER_API_KEY,
  });
  const settings =
    (agent.modelSettings as unknown as ModelSettings) ?? undefined;
  const model = agent.model as AIModel;

  let providerModelId = modelToProviderId[model] ?? agent.model;
  const shouldEnableWebSearch = settings?.enableWebSearch !== false;
  if (
    hasWebSearch(model) &&
    shouldEnableWebSearch &&
    !providerModelId.startsWith("perplexity/")
  ) {
    providerModelId = `${providerModelId}:online`;
  }

  const providerOptions =
    settings?.reasoningEffort && settings.reasoningEffort !== "none"
      ? { openrouter: { reasoning: { effort: settings.reasoningEffort } } }
      : undefined;

  return streamText({
    model: openrouter(providerModelId),
    headers: getOpenRouterHeaders(),
    messages: [{ role: "system", content: agent.systemPrompt }, ...messages],
    temperature: settings?.temperature ?? 0.7,
    topP: settings?.topP ?? 1,
    frequencyPenalty: settings?.frequencyPenalty ?? 0,
    presencePenalty: settings?.presencePenalty ?? 0,
    providerOptions,
    onFinish,
  });
}
