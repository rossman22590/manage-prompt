import { ModelSettings } from "@/components/console/workflow-model-settings";
import { modelToProviderId } from "@/data/workflow";
import { anthropic } from "@ai-sdk/anthropic";
import { createOpenAI } from "@ai-sdk/openai";
import { UserKey } from "@prisma/client";
import { generateText, streamText } from "ai";

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
  switch (model) {
    case "mistralai/Mixtral-8x7B-Instruct-v0.1":
    case "meta-llama/Llama-2-70b-chat-hf":
    case "google/gemma-7b-it":
      const groq = createOpenAI({
        baseURL: "https://api.groq.com/openai/v1",
        apiKey: process.env.OPENAI_API_KEY,
      });
      completion = await generateText({
        model: groq(modelToProviderId[model] ?? model),
        ...modelParams,
      });
      break;
    case "claude-3-5-sonnet-20240620":
      completion = await generateText({
        model: anthropic(modelToProviderId[model] ?? model),
        ...modelParams,
      });
      break;
    default:
      const openai = createOpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
      completion = await generateText({
        model: openai(modelToProviderId[model] ?? model),
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

  switch (model) {
    case "mistralai/Mixtral-8x7B-Instruct-v0.1":
    case "meta-llama/Llama-2-70b-chat-hf":
    case "google/gemma-7b-it":
      const groq = createOpenAI({
        baseURL: "https://api.groq.com/openai/v1",
        apiKey: process.env.OPENAI_API_KEY,
      });
      completion = await streamText({
        model: groq(modelToProviderId[model] ?? model),
        ...modelParams,
        onFinish,
      });
      break;
    case "claude-3-5-sonnet-20240620":
      completion = await streamText({
        model: anthropic(modelToProviderId[model] ?? model),
        ...modelParams,
        onFinish,
      });
      break;
    default:
      const openai = createOpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
      completion = await streamText({
        model: openai(modelToProviderId[model] ?? model),
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
