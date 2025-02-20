import { RAGChat, openai } from "@upstash/rag-chat";
import { Index } from "@upstash/vector";

// Create the chat instance with support for both models
export const ragChat = new RAGChat({
  model: openai("gpt-4o" as any),
});

// Function to get model instance
export const getModelInstance = (model: "gpt-4o" | "o3-mini") => {
  return new RAGChat({
    model: openai(model as any),
  });
};

export const index = new Index({
  url: process.env.UPSTASH_VECTOR_REST_URL!,
  token: process.env.UPSTASH_VECTOR_REST_TOKEN!,
});

export type ChatBotTokenMetadata = {
  ownerId: string;
  chatbotId: string;
  sessionId: string;
};


// import { RAGChat, openai } from "@upstash/rag-chat";
// import { Index } from "@upstash/vector";

// export const ragChat = new RAGChat({
//   model: openai("gpt-4o"),
// });

// export const index = new Index({
//   url: process.env.UPSTASH_VECTOR_REST_URL!,
//   token: process.env.UPSTASH_VECTOR_REST_TOKEN!,
// });

// export type ChatBotTokenMetadata = {
//   ownerId: string;
//   chatbotId: string;
//   sessionId: string;
// };
