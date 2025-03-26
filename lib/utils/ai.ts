import type { ModelSettings } from "@/components/console/workflow/workflow-model-settings";
import { modelToProvider, modelToProviderId } from "@/data/workflow";
import { anthropic } from "@ai-sdk/anthropic";
import { google } from "@ai-sdk/google";
import { createOpenAI } from "@ai-sdk/openai";
import { perplexity } from "@ai-sdk/perplexity";
import { createXai } from "@ai-sdk/xai";
import type { UserKey } from "@prisma/client";
import { type LanguageModel, generateText, streamText } from "ai";
import { ByokService } from "./byok-service";

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
    maxTokens: settings?.maxTokens ?? 4096,
    topP: settings?.topP ?? 1,
    frequencyPenalty: settings?.frequencyPenalty ?? 0,
    presencePenalty: settings?.presencePenalty ?? 0,
  };

  let completion = null;
  const providerType = modelToProvider[model] ?? "";
  switch (providerType) {
    case "groq": {
      const groq = createOpenAI({
        baseURL: "https://api.groq.com/openai/v1",
        apiKey: process.env.GROQ_TOKEN,
      });
      completion = await generateText({
        model: groq(modelToProviderId[model] ?? model) as LanguageModel,
        ...modelParams,
      });
      break;
    }
    case "anthropic": {
      completion = await generateText({
        model: anthropic(modelToProviderId[model] ?? model) as LanguageModel,
        ...modelParams,
      });
      break;
    }
    case "xai": {
      const xai = createXai({
        apiKey: process.env.XAI_API_KEY,
      });
      completion = await generateText({
        model: xai(model) as LanguageModel,
        ...modelParams,
      });
      break;
    }
    case "perplexity": {
      completion = await generateText({
        model: perplexity(modelToProviderId[model] ?? model),
        ...modelParams,
        frequencyPenalty: modelParams.frequencyPenalty > 0 ? modelParams.frequencyPenalty : 1,
        providerOptions: {
          perplexity: {
            return_images: false,
          },
        },
      });
      console.log("Perplexity raw response:", completion);
      break;
    }
    case "google": {
      completion = await generateText({
        model: google(modelToProviderId[model] ?? model),
        ...modelParams,
      });
      break;
    }
    default: {
      const userOpenApiKey = new ByokService().get("openai", userKeys);
      const openai = createOpenAI({
        apiKey: userOpenApiKey || process.env.OPENAI_API_KEY,
      });
      completion = await generateText({
        model: openai(modelToProviderId[model] ?? model) as LanguageModel,
        ...modelParams,
      });
    }
  }

  if (!completion.text) throw new Error("No result returned from Provider");

  return {
    result: completion.text,
    rawResult: {
      ...completion,
      citations: (completion as any).citations || (completion as any).experimental_providerMetadata?.perplexity?.citations,
    },
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
  const providerType = modelToProvider[model] ?? "";
  switch (providerType) {
    case "groq": {
      const groq = createOpenAI({
        baseURL: "https://api.groq.com/openai/v1",
        apiKey: process.env.GROQ_TOKEN,
      });
      completion = streamText({
        model: groq(modelToProviderId[model] ?? model) as LanguageModel,
        ...modelParams,
        onFinish,
      });
      break;
    }
    case "anthropic": {
      completion = streamText({
        model: anthropic(modelToProviderId[model] ?? model) as LanguageModel,
        ...modelParams,
        onFinish,
      });
      break;
    }
    case "xai": {
      const xai = createXai({
        apiKey: process.env.XAI_API_KEY,
      });
      completion = streamText({
        model: xai(model) as LanguageModel,
        ...modelParams,
        onFinish,
      });
      break;
    }
    case "perplexity": {
      completion = streamText({
        model: perplexity(modelToProviderId[model] ?? model),
        ...modelParams,
        frequencyPenalty: modelParams.frequencyPenalty > 0 ? modelParams.frequencyPenalty : 1,
        onFinish,
        providerOptions: {
          perplexity: {
            return_images: false,
          },
        },
      });
      break;
    }
    case "google": {
      completion = streamText({
        model: google(modelToProviderId[model] ?? model),
        ...modelParams,
        onFinish,
      });
      break;
    }
    default: {
      const userOpenApiKey = new ByokService().get("openai", userKeys);
      const openai = createOpenAI({
        apiKey: userOpenApiKey || process.env.OPENAI_API_KEY,
      });
      completion = streamText({
        model: openai(modelToProviderId[model] ?? model) as LanguageModel,
        ...modelParams,
        onFinish,
      });
    }
  }

  return completion.toTextStreamResponse({
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "*",
    },
  });
};



// import type { ModelSettings } from "@/components/console/workflow/workflow-model-settings";
// import { modelToProviderId } from "@/data/workflow";
// import { anthropic } from "@ai-sdk/anthropic";
// import { createAzure } from "@ai-sdk/azure";
// import { createOpenAI } from "@ai-sdk/openai";
// import { createXai } from "@ai-sdk/xai";
// import type { UserKey } from "@prisma/client";
// import { type LanguageModel, generateText, streamText } from "ai";
// import { ByokService } from "./byok-service";

// export const getCompletion = async (
//   model: string,
//   content: string,
//   settings?: ModelSettings,
//   userKeys: UserKey[] = [],
// ): Promise<{
//   result: string | undefined;
//   rawResult: any;
//   totalTokenCount: number;
// }> => {
//   const modelParams = {
//     prompt: content,
//     temperature: settings?.temperature ?? 0.5,
//     maxTokens: settings?.maxTokens ?? 1024,
//     topP: settings?.topP ?? 1,
//     frequencyPenalty: settings?.frequencyPenalty ?? 0,
//     presencePenalty: settings?.presencePenalty ?? 0,
//   };

//   let completion = null;
//   switch (model) {
//     case "mistralai/Mixtral-8x7B-Instruct-v0.1":
//     case "meta-llama/-2-70b-chat-hf":
//     case "google/gemma-7b-it": {
//       const groq = createOpenAI({
//         baseURL: "https://api.groq.com/openai/v1",
//         apiKey: process.env.GROQ_TOKEN,
//       });
//       completion = await generateText({
//         model: groq(modelToProviderId[model] ?? model) as LanguageModel,
//         ...modelParams,
//       });
//       break;
//     }
//     case "claude-3-5-sonnet-20240620":
//       completion = await generateText({
//         model: anthropic(modelToProviderId[model] ?? model) as LanguageModel,
//         ...modelParams,
//       });
//       break;
//     case "grok-beta":
//     case "grok-2-latest": {
//       const xai = createXai({
//         apiKey: process.env.XAI_API_KEY,
//       });
//       completion = await generateText({
//         model: xai(model) as LanguageModel,
//         ...modelParams,
//       });
//       break;
//     }
//     default: {
//       const userOpenApiKey = new ByokService().get("openai", userKeys);
//       if (userOpenApiKey) {
//         const openai = createOpenAI({
//           apiKey: userOpenApiKey,
//         });
//         completion = await generateText({
//           model: openai(modelToProviderId[model] ?? model) as LanguageModel,
//           ...modelParams,
//         });
//       } else {
//         const azure = createAzure({
//           resourceName: process.env.AZURE_RESOURCE_NAME,
//           apiKey: process.env.AZURE_API_KEY,
//         });
//         completion = await generateText({
//           model: azure(modelToProviderId[model] ?? model) as LanguageModel,
//           ...modelParams,
//         });
//       }
//     }
//   }

//   if (!completion.text) throw new Error("No result returned from Provider");

//   return {
//     result: completion.text,
//     rawResult: completion,
//     totalTokenCount: completion.usage?.totalTokens ?? 0,
//   };
// };

// export const getStreamingCompletion = async (
//   model: string,
//   content: string,
//   settings?: ModelSettings,
//   userKeys: UserKey[] = [],
//   onFinish?: (evt: any) => Promise<void>,
// ) => {
//   const modelParams = {
//     prompt: content,
//     temperature: settings?.temperature ?? 0.5,
//     maxTokens: settings?.maxTokens ?? 1024,
//     topP: settings?.topP ?? 1,
//     frequencyPenalty: settings?.frequencyPenalty ?? 0,
//     presencePenalty: settings?.presencePenalty ?? 0,
//   };

//   let completion = null;

//   switch (model) {
//     case "mistralai/Mixtral-8x7B-Instruct-v0.1":
//     case "meta-llama/Llama-2-70b-chat-hf":
//     case "google/gemma-7b-it": {
//       const groq = createOpenAI({
//         baseURL: "https://api.groq.com/openai/v1",
//         apiKey: process.env.GROQ_TOKEN,
//       });
//       completion = streamText({
//         model: groq(modelToProviderId[model] ?? model) as LanguageModel,
//         ...modelParams,
//         onFinish,
//       });
//       break;
//     }
//     case "claude-3-5-sonnet-20240620":
//       completion = streamText({
//         model: anthropic(modelToProviderId[model] ?? model) as LanguageModel,
//         ...modelParams,
//         onFinish,
//       });
//       break;
//     case "grok-beta":
//     case "grok-2-latest": {
//       const xai = createXai({
//         apiKey: process.env.XAI_API_KEY,
//       });
//       completion = streamText({
//         model: xai(model) as LanguageModel,
//         ...modelParams,
//         onFinish,
//       });
//       break;
//     }
//     default: {
//       const userOpenApiKey = new ByokService().get("openai", userKeys);
//       if (userOpenApiKey) {
//         const openai = createOpenAI({
//           apiKey: userOpenApiKey,
//         });
//         completion = streamText({
//           model: openai(modelToProviderId[model] ?? model) as LanguageModel,
//           ...modelParams,
//           onFinish,
//         });
//       } else {
//         const azure = createAzure({
//           resourceName: process.env.AZURE_RESOURCE_NAME,
//           apiKey: process.env.AZURE_API_KEY,
//         });
//         completion = streamText({
//           model: azure(modelToProviderId[model] ?? model) as LanguageModel,
//           ...modelParams,
//           onFinish,
//         });
//       }
//     }
//   }

//   return completion.toTextStreamResponse({
//     headers: {
//       "Access-Control-Allow-Origin": "*",
//       "Access-Control-Allow-Methods": "POST, OPTIONS",
//       "Access-Control-Allow-Headers": "*",
//     },
//   });
// };
