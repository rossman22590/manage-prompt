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
  
  return headers;
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

  // If images are present, use messages format with parts array
  if (imageParts && imageParts.length > 0) {
    const parts: Array<{ type: 'text' | 'file'; text?: string; url?: string; mediaType?: string }> = [];
    
    // Split content by [IMAGE] placeholders and add text/file parts
    const textParts = content.split('[IMAGE]');
    for (let i = 0; i < textParts.length; i++) {
      if (textParts[i]) {
        parts.push({ type: 'text', text: textParts[i] });
      }
      if (i < imageParts.length) {
        const imagePart = imageParts[i];
        parts.push({
          type: 'file',
          url: imagePart.url,
          mediaType: imagePart.mediaType,
        });
      }
    }

    // Build content array in the correct format for Vercel AI SDK
    const messageContent = parts.map(part => 
      part.type === 'text' 
        ? { type: 'text' as const, text: part.text || '' }
        : { 
            type: 'image' as const, 
            image: part.url || ''
          }
    );

    const completion = await generateText({
      model: openrouter(modelToProviderId[model] ?? model),
      headers: getOpenRouterHeaders(),
      messages: [
        {
          role: 'user' as const,
          content: messageContent,
        },
      ],
      temperature: settings?.temperature ?? 0.5,
      maxTokens: settings?.maxTokens ?? 4096,
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
          (completion as any).experimental_providerMetadata?.perplexity?.citations,
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
  };

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
  imageParts?: Array<{ url: string; mediaType: string; isDataUrl: boolean }>,
) => {
  if (!process.env.OPENROUTER_API_KEY) {
    throw new Error("OPENROUTER_API_KEY is not set");
  }

  const openrouter = createOpenRouter({
    apiKey: process.env.OPENROUTER_API_KEY,
  });

  // If images are present, use messages format with parts array
  if (imageParts && imageParts.length > 0) {
    const parts: Array<{ type: 'text' | 'file'; text?: string; url?: string; mediaType?: string }> = [];
    
    // Split content by [IMAGE] placeholders and add text/file parts
    const textParts = content.split('[IMAGE]');
    for (let i = 0; i < textParts.length; i++) {
      if (textParts[i]) {
        parts.push({ type: 'text', text: textParts[i] });
      }
      if (i < imageParts.length) {
        const imagePart = imageParts[i];
        parts.push({
          type: 'file',
          url: imagePart.url,
          mediaType: imagePart.mediaType,
        });
      }
    }

    // Build content array in the correct format for Vercel AI SDK
    const messageContent = parts.map(part => 
      part.type === 'text' 
        ? { type: 'text' as const, text: part.text || '' }
        : { 
            type: 'image' as const, 
            image: part.url || ''
          }
    );

    const completion = streamText({
      model: openrouter(modelToProviderId[model] ?? model),
      headers: getOpenRouterHeaders(),
      messages: [
        {
          role: 'user' as const,
          content: messageContent,
        },
      ],
      temperature: settings?.temperature ?? 0.5,
      maxTokens: settings?.maxTokens ?? 1024,
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
  };

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
