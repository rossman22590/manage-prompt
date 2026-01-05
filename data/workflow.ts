export type AIProvider = "openrouter";

export const AIModelToLabel = {
  // OpenAI models
  "gpt-4o": "GPT-4o",
  "gpt-4.1": "GPT-4.1",
  "gpt-4.1-mini": "GPT-4.1 mini",
  "gpt-4.1-nano": "GPT-4.1 nano",
  "gpt-4o-mini": "GPT-4o mini",
  "gpt-4-turbo": "GPT-4 Turbo",
  "gpt-4": "GPT-4",
  "gpt-3.5-turbo": "GPT-3.5 Turbo",
  "gpt-4.5": "GPT-4.5",
  "gpt-5": "GPT-5",
  "gpt-5-pro": "GPT-5 Pro",
  "gpt-5.2": "GPT-5.2",
  "gpt-5.2-chat": "GPT-5.2 Chat",
  "gpt-5.2-pro": "GPT-5.2 Pro",
  "o1": "o1",
  "o1-mini": "o1 Mini",
  "o1-preview": "o1 Preview",
  "o3-mini": "o3 Mini",
  "o3-pro": "o3 Pro",
  "o4-mini": "o4 Mini",
  "gpt-oss-120b": "GPT OSS 120B",
  "gpt-oss-20b": "GPT OSS 20B",

  // Anthropic models
  "claude-3-opus-20240229": "Claude 3 Opus",
  "claude-3-5-sonnet-20240620": "Claude 3.5 Sonnet",
  "claude-3-5-sonnet-20241022": "Claude 3.5 Sonnet",
  "claude-3-7-sonnet-20250219": "Claude 3.7 Sonnet",
  "claude-3-5-haiku-20241022": "Claude 3.5 Haiku",
  "claude-3-5-haiku": "Claude 3.5 Haiku",
  "claude-3-7-sonnet": "Claude 3.7 Sonnet",
  "claude-4-sonnet": "Claude 4 Sonnet",
  "claude-4-opus": "Claude 4 Opus",
  "claude-4-1-opus": "Claude 4.1 Opus",
  "claude-sonnet-4.5": "Claude Sonnet 4.5",
  "claude-opus-4.5": "Claude Opus 4.5",
  "claude-haiku-4.5": "Claude Haiku 4.5",

  // xAI models
  "grok-2-latest": "Grok 2",
  "grok-2-1212": "Grok 2 (Dec 2024)",
  "grok-3": "Grok 3",
  "grok-3-mini": "Grok 3 Mini",
  "grok-4": "Grok 4",
  "grok-4-heavy": "Grok 4 Heavy",
  "grok-beta": "Grok Beta",

  // Perplexity models
  "sonar-reasoning-pro": "Perplexity Sonar Reasoning Pro",
  "sonar-reasoning": "Perplexity Sonar Reasoning",
  "sonar-pro": "Perplexity Sonar Pro",
  "sonar": "Perplexity Sonar",

  // Meta / Mistral / DeepSeek models
  "meta-llama/Llama-2-70b-chat-hf": "Meta Llama 2 70B",
  "mistralai/Mixtral-8x7B-Instruct-v0.1": "Mixtral 8x7B",
  "mixtral-8x7b-32768": "Mixtral 8x7B 32768",
  "deepseek-r1-distill-llama-70b": "DeepSeek R1 Distill Llama 70B",
  "llama-3.1-8b-instant": "Llama 3.1 8B Instant",
  "llama-3.2-1b-preview": "Llama 3.2 1B Preview",
  "llama-3.2-3b-preview": "Llama 3.2 3B Preview",
  "llama-3.3-70b-specdec": "Llama 3.3 70B SpecDec",
  "llama-3.3-70b-versatile": "Llama 3.3 70B Versatile",
  "llama3-70b-8192": "Llama 3 70B 8192",
  "llama3-8b-8192": "Llama 3 8B 8192",

  // Google models
  "gemini-1.5-flash": "Gemini 1.5 Flash",
  "gemini-1.5-flash-latest": "Gemini 1.5 Flash",
  "gemini-1.5-flash-8b": "Gemini 1.5 Flash 8B",
  "gemini-1.5-flash-8b-latest": "Gemini 1.5 Flash 8B",
  "gemini-2.0-flash-001": "Gemini 2.0 Flash",
  "gemini-2-0-flash": "Gemini 2.0 Flash",
  "gemini-2-0-flash-lite": "Gemini 2.0 Flash Lite",
  "gemini-2-0-pro-experimental": "Gemini 2.0 Pro Experimental",
  "gemini-2-5-pro": "Gemini 2.5 Pro",
  "gemini-2-5-flash": "Gemini 2.5 Flash",
  "gemini-2-5-flash-lite": "Gemini 2.5 Flash Lite",
  "gemini-1-5-pro": "Gemini 1.5 Pro",
  "gemini-1-5-flash": "Gemini 1.5 Flash",
  "gemma-3": "Gemma 3",
  "gemma-2-9b": "Gemma 2 9B",
  "gemma-2-27b": "Gemma 2 27B",
  "code-gemma": "Code Gemma",
  "med-gemma": "Med Gemma",
  "tx-gemma": "TX Gemma",
  "google/gemma-7b-it": "Google Gemma 7B IT",
} as const;

export type AIModel = keyof typeof AIModelToLabel;

export const modelToProviderId: Record<string | AIModel, string> = {
  // OpenAI models
  "gpt-4o": "openai/gpt-4o",
  "gpt-4.1": "openai/gpt-4.1",
  "gpt-4.1-mini": "openai/gpt-4.1-mini",
  "gpt-4.1-nano": "openai/gpt-4.1-nano",
  "gpt-4o-mini": "openai/gpt-4o-mini",
  "gpt-4-turbo": "openai/gpt-4-turbo",
  "gpt-4": "openai/gpt-4",
  "gpt-3.5-turbo": "openai/gpt-3.5-turbo",
  "gpt-4.5": "openai/gpt-4.1",
  "gpt-5": "openai/gpt-5",
  "gpt-5-pro": "openai/gpt-5-pro",
  "gpt-5.2": "openai/gpt-5.2",
  "gpt-5.2-chat": "openai/gpt-5.2-chat",
  "gpt-5.2-pro": "openai/gpt-5.2-pro",
  "o1": "openai/o1",
  "o1-mini": "openai/o1",
  "o1-preview": "openai/o1",
  "o3-mini": "openai/o3-mini",
  "o3-pro": "openai/o3-pro",
  "o4-mini": "openai/o4-mini",
  "gpt-oss-120b": "openai/gpt-oss-120b",
  "gpt-oss-20b": "openai/gpt-oss-20b",

  // Anthropic models
  "claude-3-opus-20240229": "anthropic/claude-3-opus",
  "claude-3-5-sonnet-20240620": "anthropic/claude-3.5-sonnet",
  "claude-3-5-sonnet-20241022": "anthropic/claude-3.5-sonnet",
  "claude-3-7-sonnet-20250219": "anthropic/claude-3.7-sonnet",
  "claude-3-5-haiku-20241022": "anthropic/claude-3.5-haiku-20241022",
  "claude-3-5-haiku": "anthropic/claude-3.5-haiku",
  "claude-3-7-sonnet": "anthropic/claude-3.7-sonnet",
  "claude-4-sonnet": "anthropic/claude-sonnet-4",
  "claude-4-opus": "anthropic/claude-opus-4",
  "claude-4-1-opus": "anthropic/claude-opus-4.1",
  "claude-sonnet-4.5": "anthropic/claude-sonnet-4.5",
  "claude-opus-4.5": "anthropic/claude-opus-4.5",
  "claude-haiku-4.5": "anthropic/claude-haiku-4.5",

  // xAI models
  "grok-2-latest": "x-ai/grok-3",
  "grok-2-1212": "x-ai/grok-3",
  "grok-3": "x-ai/grok-3",
  "grok-3-mini": "x-ai/grok-3-mini",
  "grok-4": "x-ai/grok-4",
  "grok-4-heavy": "x-ai/grok-4",
  "grok-beta": "x-ai/grok-3-beta",

  // Perplexity models
  "sonar-reasoning-pro": "perplexity/sonar-reasoning-pro",
  "sonar-reasoning": "perplexity/sonar-reasoning",
  "sonar-pro": "perplexity/sonar-pro",
  "sonar": "perplexity/sonar",

  // Meta / Mistral / DeepSeek models
  "meta-llama/Llama-2-70b-chat-hf": "meta-llama/llama-3-70b-instruct",
  "mistralai/Mixtral-8x7B-Instruct-v0.1": "mistralai/mixtral-8x7b-instruct",
  "mixtral-8x7b-32768": "mistralai/mixtral-8x7b-instruct",
  "deepseek-r1-distill-llama-70b": "deepseek/deepseek-r1-distill-llama-70b",
  "llama-3.1-8b-instant": "meta-llama/llama-3.1-8b-instruct",
  "llama-3.2-1b-preview": "meta-llama/llama-3.2-1b-instruct",
  "llama-3.2-3b-preview": "meta-llama/llama-3.2-3b-instruct",
  "llama-3.3-70b-specdec": "meta-llama/llama-3.3-70b-instruct",
  "llama-3.3-70b-versatile": "meta-llama/llama-3.3-70b-instruct",
  "llama3-70b-8192": "meta-llama/llama-3-70b-instruct",
  "llama3-8b-8192": "meta-llama/llama-3-8b-instruct",

  // Google models
  "gemini-1.5-flash": "google/gemini-2.5-flash",
  "gemini-1.5-flash-latest": "google/gemini-2.5-flash",
  "gemini-1.5-flash-8b": "google/gemini-2.5-flash-lite",
  "gemini-1.5-flash-8b-latest": "google/gemini-2.5-flash-lite",
  "gemini-2.0-flash-001": "google/gemini-2.0-flash-001",
  "gemini-2-0-flash": "google/gemini-2.0-flash-001",
  "gemini-2-0-flash-lite": "google/gemini-2.0-flash-lite-001",
  "gemini-2-0-pro-experimental": "google/gemini-2.5-pro",
  "gemini-2-5-pro": "google/gemini-2.5-pro",
  "gemini-2-5-flash": "google/gemini-2.5-flash",
  "gemini-2-5-flash-lite": "google/gemini-2.5-flash-lite",
  "gemini-1-5-pro": "google/gemini-2.5-pro",
  "gemini-1-5-flash": "google/gemini-2.5-flash",
  "gemma-3": "google/gemma-3-12b-it",
  "gemma-2-9b": "google/gemma-2-9b-it",
  "gemma-2-27b": "google/gemma-2-27b-it",
  "code-gemma": "google/gemma-3-4b-it",
  "med-gemma": "google/gemma-3-4b-it",
  "tx-gemma": "google/gemma-3-4b-it",
  "google/gemma-7b-it": "google/gemma-2-9b-it",
};

export const AIModels = Object.keys(AIModelToLabel) as Array<AIModel>;

// The rest of your code remains unchanged
export const modelHasInstruction: Record<string, boolean> = {};

export type WorkflowInput = {
  name: string;
  type?: WorkflowInputType;
  label?: string;
  value?: string;
};

export enum WorkflowInputType {
  text = "text",
  textarea = "textarea",
  number = "number",
  url = "url",
}

export const WorkflowInputTypeToLabel: Record<WorkflowInputType | string, string> = {
  text: "Text",
  textarea: "Text Area",
  number: "Number",
  url: "Webpage content",
} as const;

export const WorkflowTestCondition: Record<string, string> = {
  equals: "equals",
  notEquals: "not equals",
  contains: "contains",
  doesNotContain: "does not contain",
  isGreaterThan: "is greater than",
  isLessThan: "is less than",
  isValidJson: "is valid JSON",
} as const;


// export type AIProvider = "openai" | "groq" | "anthropic" | "xai";

// export const AIModelToLabel = {
//   // "gpt-4": "GPT-4",
//   "gpt-4o": "GPT-4o",
//   "gpt-4o-mini": "GPT-4o mini",
//   // "o1-mini": "o1 Mini",
//   "meta-llama/Llama-2-70b-chat-hf": "Meta Llama 2 70b",
//   "mistralai/Mixtral-8x7B-Instruct-v0.1": "Mixtral 8x7B",
//   "google/gemma-7b-it": "Google Gemma 7B",
//   "claude-3-5-sonnet-20240620": "Claude 3.5 Sonnet",
//   "grok-2-latest": "Grok 2",
//   "grok-beta": "Grok Beta",
// } as const;

// export const modelToProviderId: Record<string | AIModel, string> = {
//   "google/gemma-7b-it": "gemma-7b-it",
//   "meta-llama/Llama-2-70b-chat-hf": "llama3-8b-8192",
//   "mistralai/Mixtral-8x7B-Instruct-v0.1": "mixtral-8x7b-32768",
// };

// export const modelToProvider: Record<string | AIModel, AIProvider> = {
//   // "gpt-4": "openai",
//   "gpt-4o": "openai",
//   "gpt-4o-mini": "openai",
//   // "o1-mini": "openai",
//   "meta-llama/Llama-2-70b-chat-hf": "groq",
//   "mistralai/Mixtral-8x7B-Instruct-v0.1": "groq",
//   "google/gemma-7b-it": "groq",
//   "claude-3-5-sonnet-20240620": "anthropic",
//   "grok-2-latest": "xai",
//   "grok-beta": "xai",
// };

// export type AIModel = keyof typeof AIModelToLabel;
// export const AIModels = Object.keys(AIModelToLabel) as Array<AIModel>;

// export const modelHasInstruction: Record<string, boolean> = {};

// export type WorkflowInput = {
//   name: string;
//   type?: WorkflowInputType;
//   label?: string;
//   value?: string;
// };

// export enum WorkflowInputType {
//   text = "text",
//   textarea = "textarea",
//   number = "number",
//   url = "url",
// }

// export const WorkflowInputTypeToLabel: Record<
//   WorkflowInputType | string,
//   string
// > = {
//   text: "Text",
//   textarea: "Text Area",
//   number: "Number",
//   url: "Webpage content",
// } as const;

// export const WorkflowTestCondition: Record<string, string> = {
//   equals: "equals",
//   notEquals: "not equals",
//   contains: "contains",
//   doesNotContain: "does not contain",
//   isGreaterThan: "is greater than",
//   isLessThan: "is less than",
//   isValidJson: "is valid JSON",
// } as const;
