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
  "claude-sonnet-4.5": "Claude Sonnet 4.5",
  "claude-opus-4.5": "Claude Opus 4.5",
  "claude-haiku-4.5": "Claude Haiku 4.5",

  // xAI models
  "grok-3": "Grok 3",
  "grok-3-mini": "Grok 3 Mini",
  "grok-3-beta": "Grok Beta",
  "grok-4": "Grok 4",
  "grok-4-fast": "Grok 4 Fast",
  "grok-4.1": "Grok 4.1",
  "grok-4.1-fast": "Grok 4.1 Fast",

  // Perplexity models
  "sonar": "Perplexity Sonar",
  "sonar-pro": "Perplexity Sonar Pro",
  "sonar-reasoning": "Perplexity Sonar Reasoning",
  "sonar-reasoning-pro": "Perplexity Sonar Reasoning Pro",

  // Meta / Mistral / DeepSeek models
  "llama3-8b-8192": "Llama 3 8B 8192",
  "llama3-70b-8192": "Llama 3 70B 8192",
  "llama-3.1-8b-instant": "Llama 3.1 8B Instant",
  "llama-3.2-1b-preview": "Llama 3.2 1B Preview",
  "llama-3.2-3b-preview": "Llama 3.2 3B Preview",
  "llama-3.3-70b-versatile": "Llama 3.3 70B Versatile",
  "mixtral-8x7b-32768": "Mixtral 8x7B",
  "mistral-large-latest": "Mistral Large",
  "mistral-small-latest": "Mistral Small",
  "pixtral-12b-2409": "Pixtral 12B",
  "deepseek-r1-distill-llama-70b": "DeepSeek R1 Distill Llama 70B",
  "deepseek-chat-v3": "DeepSeek Chat v3",
  "deepseek-chat-v3-0324": "DeepSeek Chat v3 (Mar 2024)",
  "deepseek-chat-v3.1": "DeepSeek Chat v3.1",
  "deepseek-coder-v2": "DeepSeek Coder v2",
  "deepseek-coder-v2-lite": "DeepSeek Coder v2 Lite",
  
  // Qwen models
  "qwen-2.5-0.5b-instruct": "Qwen 2.5 0.5B Instruct",
  "qwen-2.5-1.5b-instruct": "Qwen 2.5 1.5B Instruct",
  "qwen-2.5-3b-instruct": "Qwen 2.5 3B Instruct",
  "qwen-2.5-7b-instruct": "Qwen 2.5 7B Instruct",
  "qwen-2.5-14b-instruct": "Qwen 2.5 14B Instruct",
  "qwen-2.5-32b-instruct": "Qwen 2.5 32B Instruct",
  "qwen-2.5-72b-instruct": "Qwen 2.5 72B Instruct",
  
  // Cohere models
  "command-r": "Command R",
  "command-r-plus": "Command R+",
  "command-r7b-08-2024": "Command R7B",

  // Google models
  "gemini-2-5-pro": "Gemini 2.5 Pro",
  "gemini-2-5-flash": "Gemini 2.5 Flash",
  "gemini-2-5-flash-lite": "Gemini 2.5 Flash Lite",
  "gemini-3-pro-preview": "Gemini 3 Pro Preview",
  "gemma-2-9b": "Gemma 2 9B",
  "gemma-2-27b": "Gemma 2 27B",
  "gemma-3": "Gemma 3",
  "code-gemma": "Code Gemma",
} as const;

export type AIModel = keyof typeof AIModelToLabel;

export const modelToProviderId: Record<string | AIModel, string> = {
  // OpenAI models
  "gpt-3.5-turbo": "openai/gpt-3.5-turbo",
  "gpt-4": "openai/gpt-4",
  "gpt-4-turbo": "openai/gpt-4-turbo",
  "gpt-4o": "openai/gpt-4o",
  "gpt-4o-mini": "openai/gpt-4o-mini",
  "gpt-4.1": "openai/gpt-4.1",
  "gpt-4.1-mini": "openai/gpt-4.1-mini",
  "gpt-4.1-nano": "openai/gpt-4.1-nano",
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
  "gpt-oss-20b": "openai/gpt-oss-20b",
  "gpt-oss-120b": "openai/gpt-oss-120b",

  // Anthropic models
  "claude-sonnet-4.5": "anthropic/claude-sonnet-4.5",
  "claude-opus-4.5": "anthropic/claude-opus-4.5",
  "claude-haiku-4.5": "anthropic/claude-haiku-4.5",

  // xAI models
  "grok-3": "x-ai/grok-3",
  "grok-3-mini": "x-ai/grok-3-mini",
  "grok-3-beta": "x-ai/grok-3-beta",
  "grok-4": "x-ai/grok-4",
  "grok-4-fast": "x-ai/grok-4-fast",
  "grok-4.1": "x-ai/grok-4.1",
  "grok-4.1-fast": "x-ai/grok-4.1-fast",

  // Perplexity models
  "sonar": "perplexity/sonar",
  "sonar-pro": "perplexity/sonar-pro",
  "sonar-reasoning": "perplexity/sonar-reasoning",
  "sonar-reasoning-pro": "perplexity/sonar-reasoning-pro",

  // Meta / Mistral / DeepSeek models
  "llama3-8b-8192": "meta-llama/llama-3-8b-instruct",
  "llama3-70b-8192": "meta-llama/llama-3-70b-instruct",
  "llama-3.1-8b-instant": "meta-llama/llama-3.1-8b-instruct",
  "llama-3.2-1b-preview": "meta-llama/llama-3.2-1b-instruct",
  "llama-3.2-3b-preview": "meta-llama/llama-3.2-3b-instruct",
  "llama-3.3-70b-versatile": "meta-llama/llama-3.3-70b-instruct",
  "mixtral-8x7b-32768": "mistralai/mixtral-8x7b-instruct",
  "mistral-large-latest": "mistralai/mistral-large-latest",
  "mistral-small-latest": "mistralai/mistral-small-latest",
  "pixtral-12b-2409": "mistralai/pixtral-12b-2409",
  "deepseek-r1-distill-llama-70b": "deepseek/deepseek-r1-distill-llama-70b",
  "deepseek-chat-v3": "deepseek/deepseek-chat-v3",
  "deepseek-chat-v3-0324": "deepseek/deepseek-chat-v3-0324",
  "deepseek-chat-v3.1": "deepseek/deepseek-chat-v3.1",
  "deepseek-coder-v2": "deepseek/deepseek-coder-v2",
  "deepseek-coder-v2-lite": "deepseek/deepseek-coder-v2-lite",
  
  // Qwen models
  "qwen-2.5-0.5b-instruct": "qwen/qwen-2.5-0.5b-instruct",
  "qwen-2.5-1.5b-instruct": "qwen/qwen-2.5-1.5b-instruct",
  "qwen-2.5-3b-instruct": "qwen/qwen-2.5-3b-instruct",
  "qwen-2.5-7b-instruct": "qwen/qwen-2.5-7b-instruct",
  "qwen-2.5-14b-instruct": "qwen/qwen-2.5-14b-instruct",
  "qwen-2.5-32b-instruct": "qwen/qwen-2.5-32b-instruct",
  "qwen-2.5-72b-instruct": "qwen/qwen-2.5-72b-instruct",
  
  // Cohere models
  "command-r": "cohere/command-r",
  "command-r-plus": "cohere/command-r-plus",
  "command-r7b-08-2024": "cohere/command-r7b-08-2024",

  // Google models
  "gemini-2-5-pro": "google/gemini-2.5-pro",
  "gemini-2-5-flash": "google/gemini-2.5-flash",
  "gemini-2-5-flash-lite": "google/gemini-2.5-flash-lite",
  "gemini-3-pro-preview": "google/gemini-3-pro-preview",
  "gemma-2-9b": "google/gemma-2-9b-it",
  "gemma-2-27b": "google/gemma-2-27b-it",
  "gemma-3": "google/gemma-3-12b-it",
  "code-gemma": "google/gemma-3-4b-it",
};

export const AIModels = Object.keys(AIModelToLabel) as Array<AIModel>;

// Models that support image/vision input
export const visionCapableModels: Set<AIModel> = new Set([
  // OpenAI vision models
  "gpt-4o",
  "gpt-4o-mini",
  "gpt-4-turbo",
  "gpt-4",
  "gpt-4.1",
  "gpt-4.1-mini",
  "gpt-4.1-nano",
  "gpt-4.5",
  "gpt-5",
  "gpt-5-pro",
  "gpt-5.2",
  "gpt-5.2-chat",
  "gpt-5.2-pro",
  
  // Anthropic Claude models (all support vision)
  "claude-sonnet-4.5",
  "claude-opus-4.5",
  "claude-haiku-4.5",
  
  // Google Gemini models (all support vision)
  "gemini-2-5-pro",
  "gemini-2-5-flash",
  "gemini-2-5-flash-lite",
  "gemini-3-pro-preview",
  
  // Mistral vision model
  "pixtral-12b-2409",
] as AIModel[]);

export const isVisionCapable = (model: AIModel): boolean => {
  return visionCapableModels.has(model);
};

// Models that support 200k+ token context windows
export const largeContextWindowModels: Set<AIModel> = new Set([
  // 200K context models
  "claude-opus-4.5",
  "claude-haiku-4.5",
  
  // 400K context models
  "gpt-5.2",
  "gpt-5.2-chat",
  "gpt-5.2-pro",
  "gpt-5",
  "gpt-5-pro",
  
  // 1M context models
  "claude-sonnet-4.5",
  "gemini-2-5-pro",
  "gemini-2-5-flash",
  "gemini-3-pro-preview",
] as AIModel[]);

export const hasLargeContextWindow = (model: AIModel): boolean => {
  return largeContextWindowModels.has(model);
};

// Models that support web search capabilities
export const webSearchCapableModels: Set<AIModel> = new Set([
  // Perplexity models (built-in web search)
  "sonar",
  "sonar-pro",
  "sonar-reasoning",
  "sonar-reasoning-pro",
  
  // OpenAI models (web_search tool support)
  "gpt-5",
  "gpt-5-pro",
  "gpt-5.2",
  "gpt-5.2-chat",
  "gpt-5.2-pro",
  
  // Google Gemini models (google_search tool support)
  "gemini-2-5-pro",
  "gemini-2-5-flash",
  "gemini-2-5-flash-lite",
  "gemini-3-pro-preview",
] as AIModel[]);

export const hasWebSearch = (model: AIModel): boolean => {
  return webSearchCapableModels.has(model);
};

// The rest of your code remains unchanged
export const modelHasInstruction: Record<string, boolean> = {};

export type WorkflowInput = {
  name: string;
  type?: WorkflowInputType;
  label?: string;
  value?: string;
  required?: boolean;
  placeholder?: string;
};

export enum WorkflowInputType {
  text = "text",
  textarea = "textarea",
  number = "number",
  url = "url",
  image = "image",
}

export const WorkflowInputTypeToLabel: Record<WorkflowInputType | string, string> = {
  text: "Text",
  textarea: "Text Area",
  number: "Number",
  url: "Webpage content",
  image: "Image",
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
