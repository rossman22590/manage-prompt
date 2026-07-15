import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import {
  generateObject,
  generateText,
  jsonSchema,
  streamObject,
  streamText,
} from "ai";
import type { ModelSettings } from "@/components/console/workflow/workflow-model-settings";
import { hasWebSearch, modelToProviderId } from "@/data/workflow";

export const getOpenRouterHeaders = () => {
  // Try multiple env vars for app URL
  const appUrl =
    process.env.APP_BASE_URL ||
    process.env.NEXT_PUBLIC_APP_BASE_URL ||
    "https://workflows.myapps.ai";

  // Allow custom site name via env var
  const siteName = process.env.OPENROUTER_SITE_NAME || "AI Tutor API";

  const headers: Record<string, string> = {
    "HTTP-Referer": appUrl,
    "X-OpenRouter-Title": siteName,
    // X-Title is kept alongside the newer header name for backwards
    // compatibility, per OpenRouter's app attribution docs.
    "X-Title": siteName,
  };

  return headers;
};

const buildReasoningProviderOptions = (settings?: ModelSettings) => {
  if (!settings?.reasoningEffort || settings.reasoningEffort === "none")
    return undefined;
  return {
    openrouter: {
      reasoning: { effort: settings.reasoningEffort },
    },
  };
};

const parseStructuredOutputSchema = (settings?: ModelSettings) => {
  if (!settings?.structuredOutputSchema) return null;
  try {
    return jsonSchema(JSON.parse(settings.structuredOutputSchema));
  } catch {
    return null;
  }
};

export const getCompletion = async (
  model: string,
  content: string,
  settings?: ModelSettings,
  imageParts?: Array<{ url: string; mediaType: string; isDataUrl: boolean }>,
): Promise<{
  result: string | undefined;
  rawResult: any;
  totalTokenCount: number;
}> => {
  const openrouter = createOpenRouter({
    apiKey: process.env.OPENROUTER_API_KEY,
  });

  // Get provider ID and append :online for identified web search capable models
  // Only if enableWebSearch is true (defaults to true if not specified)
  // Note: While :online works for any model on OpenRouter, we only enable it for models we've identified
  // Perplexity models have built-in search, so they don't need :online suffix
  let providerModelId = modelToProviderId[model] ?? model;
  const isPerplexityModel = providerModelId.startsWith("perplexity/");
  const shouldEnableWebSearch = settings?.enableWebSearch !== false; // Default to true
  if (
    hasWebSearch(model as any) &&
    !isPerplexityModel &&
    shouldEnableWebSearch
  ) {
    // Append :online suffix for identified models (uses native search for OpenAI/Gemini, Exa for others)
    providerModelId = `${providerModelId}:online`;
  }

  // If images are present, use messages format with parts array
  if (imageParts && imageParts.length > 0) {
    const parts: Array<{
      type: "text" | "file";
      text?: string;
      url?: string;
      mediaType?: string;
    }> = [];

    // Split content by [IMAGE] placeholders and add text/file parts
    const textParts = content.split("[IMAGE]");
    for (let i = 0; i < textParts.length; i++) {
      if (textParts[i]) {
        parts.push({ type: "text", text: textParts[i] });
      }
      if (i < imageParts.length) {
        const imagePart = imageParts[i];
        parts.push({
          type: "file",
          url: imagePart.url,
          mediaType: imagePart.mediaType,
        });
      }
    }

    // Build content array in the correct format for Vercel AI SDK
    const messageContent = parts.map((part) =>
      part.type === "text"
        ? { type: "text" as const, text: part.text || "" }
        : {
            type: "image" as const,
            image: part.url || "",
          },
    );

    const completion = await generateText({
      model: openrouter(providerModelId),
      headers: getOpenRouterHeaders(),
      messages: [
        {
          role: "user" as const,
          content: messageContent,
        },
      ],
      temperature: settings?.temperature ?? 0.5,
      topP: settings?.topP ?? 1,
      frequencyPenalty: settings?.frequencyPenalty ?? 0,
      presencePenalty: settings?.presencePenalty ?? 0,
    });

    if (!completion.text) throw new Error("No result returned from Provider");

    return {
      result: completion.text,
      rawResult: {
        ...completion,
        citations:
          (completion as any).citations ||
          (completion as any).experimental_providerMetadata?.perplexity
            ?.citations,
      },
      totalTokenCount: completion.usage?.totalTokens ?? 0,
    };
  }

  // No images, use prompt format
  const modelParams = {
    prompt: content,
    temperature: settings?.temperature ?? 0.5,
    maxTokens: settings?.maxTokens ?? 4096,
    topP: settings?.topP ?? 1,
    frequencyPenalty: settings?.frequencyPenalty ?? 0,
    presencePenalty: settings?.presencePenalty ?? 0,
    providerOptions: buildReasoningProviderOptions(settings),
  };

  const schema = parseStructuredOutputSchema(settings);
  if (schema) {
    const completion = await generateObject({
      model: openrouter(providerModelId),
      headers: getOpenRouterHeaders(),
      schema,
      ...modelParams,
    });

    return {
      result: JSON.stringify(completion.object),
      rawResult: completion,
      totalTokenCount: completion.usage?.totalTokens ?? 0,
    };
  }

  const completion = await generateText({
    model: openrouter(providerModelId),
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
        (completion as any).experimental_providerMetadata?.perplexity
          ?.citations,
    },
    totalTokenCount: completion.usage?.totalTokens ?? 0,
  };
};

export const getStreamingCompletion = async (
  model: string,
  content: string,
  settings?: ModelSettings,
  onFinish?: (evt: any) => Promise<void>,
  imageParts?: Array<{ url: string; mediaType: string; isDataUrl: boolean }>,
) => {
  if (!process.env.OPENROUTER_API_KEY) {
    throw new Error("OPENROUTER_API_KEY is not set");
  }

  const openrouter = createOpenRouter({
    apiKey: process.env.OPENROUTER_API_KEY,
  });

  // Get provider ID and append :online for identified web search capable models
  // Only if enableWebSearch is true (defaults to true if not specified)
  // Note: While :online works for any model on OpenRouter, we only enable it for models we've identified
  // Perplexity models have built-in search, so they don't need :online suffix
  let providerModelId = modelToProviderId[model] ?? model;
  const isPerplexityModel = providerModelId.startsWith("perplexity/");
  const shouldEnableWebSearch = settings?.enableWebSearch !== false; // Default to true
  if (
    hasWebSearch(model as any) &&
    !isPerplexityModel &&
    shouldEnableWebSearch
  ) {
    // Append :online suffix for identified models (uses native search for OpenAI/Gemini, Exa for others)
    providerModelId = `${providerModelId}:online`;
  }

  // If images are present, use messages format with parts array
  if (imageParts && imageParts.length > 0) {
    const parts: Array<{
      type: "text" | "file";
      text?: string;
      url?: string;
      mediaType?: string;
    }> = [];

    // Split content by [IMAGE] placeholders and add text/file parts
    const textParts = content.split("[IMAGE]");
    for (let i = 0; i < textParts.length; i++) {
      if (textParts[i]) {
        parts.push({ type: "text", text: textParts[i] });
      }
      if (i < imageParts.length) {
        const imagePart = imageParts[i];
        parts.push({
          type: "file",
          url: imagePart.url,
          mediaType: imagePart.mediaType,
        });
      }
    }

    // Build content array in the correct format for Vercel AI SDK
    const messageContent = parts.map((part) =>
      part.type === "text"
        ? { type: "text" as const, text: part.text || "" }
        : {
            type: "image" as const,
            image: part.url || "",
          },
    );

    const completion = streamText({
      model: openrouter(providerModelId),
      headers: getOpenRouterHeaders(),
      messages: [
        {
          role: "user" as const,
          content: messageContent,
        },
      ],
      temperature: settings?.temperature ?? 0.5,
      topP: settings?.topP ?? 1,
      frequencyPenalty: settings?.frequencyPenalty ?? 0,
      presencePenalty: settings?.presencePenalty ?? 0,
      onFinish,
    });

    return completion.toTextStreamResponse({
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "*",
      },
    });
  }

  // No images, use prompt format
  const modelParams = {
    prompt: content,
    temperature: settings?.temperature ?? 0.5,
    maxTokens: settings?.maxTokens ?? 1024,
    topP: settings?.topP ?? 1,
    frequencyPenalty: settings?.frequencyPenalty ?? 0,
    presencePenalty: settings?.presencePenalty ?? 0,
    providerOptions: buildReasoningProviderOptions(settings),
  };

  const responseHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "*",
  };

  const schema = parseStructuredOutputSchema(settings);
  if (schema) {
    const completion = streamObject({
      model: openrouter(providerModelId),
      headers: getOpenRouterHeaders(),
      schema,
      ...modelParams,
      onFinish: onFinish
        ? (evt) =>
            onFinish({ text: JSON.stringify(evt.object), usage: evt.usage })
        : undefined,
    });

    return completion.toTextStreamResponse({ headers: responseHeaders });
  }

  const completion = streamText({
    model: openrouter(providerModelId),
    headers: getOpenRouterHeaders(),
    ...modelParams,
    onFinish,
  });

  return completion.toTextStreamResponse({ headers: responseHeaders });
};
