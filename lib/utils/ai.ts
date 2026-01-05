import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { generateText, streamText } from "ai";
import type { ModelSettings } from "@/components/console/workflow/workflow-model-settings";
import { modelToProviderId } from "@/data/workflow";

const getOpenRouterHeaders = () => {
  const appUrl = process.env.APP_BASE_URL ?? "https://manageprompt.com";
  return {
    "HTTP-Referer": appUrl,
    "X-Title": "AI Tutor API",
  };
};

export const getCompletion = async (
  model: string,
  content: string,
  settings?: ModelSettings,
): Promise<{
  result: string | undefined;
  rawResult: any;
  totalTokenCount: number;
}> => {
  const modelParams = {
    prompt: content,
    temperature: settings?.temperature ?? 0.5,
    maxTokens: settings?.maxTokens ?? 4096,
    topP: settings?.topP ?? 1,
    frequencyPenalty: settings?.frequencyPenalty ?? 0,
    presencePenalty: settings?.presencePenalty ?? 0,
  };

  const openrouter = createOpenRouter({
    apiKey: process.env.OPENROUTER_API_KEY,
  });

  const completion = await generateText({
    model: openrouter(modelToProviderId[model] ?? model),
    headers: getOpenRouterHeaders(),
    ...modelParams,
  });

  if (!completion.text) throw new Error("No result returned from Provider");

  return {
    result: completion.text,
    rawResult: {
      ...completion,
      citations:
        (completion as any).citations ||
        (completion as any).experimental_providerMetadata?.perplexity?.citations,
    },
    totalTokenCount: completion.usage?.totalTokens ?? 0,
  };
};

export const getStreamingCompletion = async (
  model: string,
  content: string,
  settings?: ModelSettings,
  onFinish?: (evt: any) => Promise<void>,
) => {
  const modelParams = {
    prompt: content,
    temperature: settings?.temperature ?? 0.5,
    maxTokens: settings?.maxTokens ?? 1024,
    topP: settings?.topP ?? 1,
    frequencyPenalty: settings?.frequencyPenalty ?? 0,
    presencePenalty: settings?.presencePenalty ?? 0,
  };

  const openrouter = createOpenRouter({
    apiKey: process.env.OPENROUTER_API_KEY,
  });

  const completion = streamText({
    model: openrouter(modelToProviderId[model] ?? model),
    headers: getOpenRouterHeaders(),
    ...modelParams,
    onFinish,
  });

  return completion.toTextStreamResponse({
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "*",
    },
  });
};
