import { ModelSettings } from "@/components/console/workflow-model-settings";
import { modelToProviderId } from "@/data/workflow";
import { anthropic } from "@ai-sdk/anthropic";
import { createAzure } from "@ai-sdk/azure";
import { createOpenAI } from "@ai-sdk/openai";
import { UserKey } from "@prisma/client";
import { generateText, LanguageModel, streamText } from "ai";
import { getUserKeyFor } from "./encryption";

export const getCompletion = async (
  model: string,
  content: string,
  settings?: ModelSettings,
  userKeys: UserKey[] = []
): Promise<{
  result: string | undefined;
  rawResult: any;
  totalTokenCount: number;
}> => {
  const modelParams = {
    prompt: content,
    temperature: settings?.temperature ?? 0.5,
    maxTokens: settings?.maxTokens ?? 1024,
    topP: settings?.topP ?? 1,
    frequencyPenalty: settings?.frequencyPenalty ?? 0,
    presencePenalty: settings?.presencePenalty ?? 0,
  };

  let completion = null;

  const openApiKey = process.env.OPENAI_API_KEY || getUserKeyFor("openai", userKeys);

  if (openApiKey) {
    const openai = createOpenAI({
      apiKey: openApiKey,
    });
    completion = await generateText({
      model: openai(modelToProviderId[model] ?? model),
      ...modelParams,
    });
  } else {
    const azure = createAzure({
      resourceName: process.env.AZURE_RESOURCE_NAME,
      apiKey: process.env.AZURE_API_KEY,
    });
    completion = await generateText({
      model: azure(modelToProviderId[model] ?? model) as LanguageModel,
      ...modelParams,
    });
  }

  if (!completion.text) throw new Error("No result returned from Provider");

  return {
    result: completion.text,
    rawResult: completion,
    totalTokenCount: completion.usage?.totalTokens ?? 0,
  };
};

export const getStreamingCompletion = async (
  model: string,
  content: string,
  settings?: ModelSettings,
  userKeys: UserKey[] = [],
  onFinish?: (evt: any) => Promise<void>
) => {
  const modelParams = {
    prompt: content,
    temperature: settings?.temperature ?? 0.5,
    maxTokens: settings?.maxTokens ?? 1024,
    topP: settings?.topP ?? 1,
    frequencyPenalty: settings?.frequencyPenalty ?? 0,
    presencePenalty: settings?.presencePenalty ?? 0,
  };

  let completion = null;

  const openApiKey = process.env.OPENAI_API_KEY || getUserKeyFor("openai", userKeys);

  if (openApiKey) {
    const openai = createOpenAI({
      apiKey: openApiKey,
    });
    completion = await streamText({
      model: openai(modelToProviderId[model] ?? model),
      ...modelParams,
      onFinish,
    });
  } else {
    const azure = createAzure({
      resourceName: process.env.AZURE_RESOURCE_NAME,
      apiKey: process.env.AZURE_API_KEY,
    });
    completion = await streamText({
      model: azure(modelToProviderId[model] ?? model) as LanguageModel,
      ...modelParams,
      onFinish,
    });
  }

  return completion.toTextStreamResponse({
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "*",
    },
  });
};
