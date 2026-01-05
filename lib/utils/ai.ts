import type { ModelSettings } from "@/components/console/workflow/workflow-model-settings";
import { modelToProviderId } from "@/data/workflow";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { generateText, streamText } from "ai";

const getOpenRouterHeaders = () => {
  // Try multiple env vars for app URL
  const appUrl = 
    process.env.APP_BASE_URL || 
    process.env.NEXT_PUBLIC_APP_BASE_URL || 
    "https://manageprompt.com";
  
  // Allow custom site name via env var
  const siteName = process.env.OPENROUTER_SITE_NAME || "AI Tutor API";
  
  const headers: Record<string, string> = {
    "HTTP-Referer": appUrl,
    "X-Title": siteName,
  };
  
  // Log in development to verify headers are being set
  if (process.env.NODE_ENV === "development") {
    console.log("OpenRouter headers being sent:", JSON.stringify(headers, null, 2));
    console.log("Site Name:", siteName);
    console.log("App URL:", appUrl);
  }
  
  return headers;
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
  if (!process.env.OPENROUTER_API_KEY) {
    throw new Error("OPENROUTER_API_KEY is not set");
  }

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
