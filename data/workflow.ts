export type AIProvider = "openai" | "groq" | "anthropic" | "xai" | "perplexity" | "google";

export const AIModelToLabel = {
  // OpenAI models
  "gpt-4o": "GPT-4o",
  "gpt-4o-mini": "GPT-4o mini",
  "gpt-4-turbo": "GPT-4 Turbo",
  "gpt-4": "GPT-4",
  "gpt-3.5-turbo": "GPT-3.5 Turbo",
  "o1": "o1",
  "o1-mini": "o1 Mini",
  "o1-preview": "o1 Preview",
  "o3-mini": "o3 Mini",
  // Groq models 
  "mistralai/Mixtral-8x7B-Instruct-v0.1": "Mixtral 8x7B",
  "google/gemma-7b-it": "Google Gemma 7B",
  "deepseek-r1-distill-llama-70b": "DeepSeek R1 Distill Llama 70B",
  "gemma2-9b-it": "Gemma 2 9B IT",
  "llama-3.1-8b-instant": "Llama 3.1 8B Instant",
  "llama-3.2-11b-vision-preview": "Llama 3.2 11B Vision Preview",
  "llama-3.2-1b-preview": "Llama 3.2 1B Preview",
  "llama-3.2-3b-preview": "Llama 3.2 3B Preview",
  "llama-3.2-90b-vision-preview": "Llama 3.2 90B Vision Preview",
  "llama-3.3-70b-specdec": "Llama 3.3 70B SpecDec",
  "llama-3.3-70b-versatile": "Llama 3.3 70B Versatile",
  "llama3-70b-8192": "Llama 3 70B 8192",
  "llama3-8b-8192": "Llama 3 8B 8192",
  "mixtral-8x7b-32768": "Mixtral 8x7B 32768",
  // Anthropic models
  "claude-3-opus-20240229": "Claude 3 Opus",
  "claude-3-sonnet-20240229": "Claude 3 Sonnet",
  "claude-3-5-sonnet-20241022": "Claude 3.5 Sonnet",
  "claude-3-7-sonnet-20250219": "claude-3-7-sonnet-20250219",
  "claude-3-5-haiku-20241022": "Claude 3.5 Haiku",
  // Xai models
  "grok-2-latest": "Grok 2",
  "grok-beta": "Grok Beta",
  // Perplexity models
  "sonar-reasoning-pro": "Perplexity Sonar Reasoning Pro",
  "sonar-reasoning": "Perplexity Sonar Reasoning",
  "sonar-pro": "Perplexity Sonar Pro",
  "sonar": "Perplexity Sonar",
  // Google Generative AI models
  // "gemini-1.5-pro-latest": "Gemini 1.5 Pro",
  // "gemini-1.5-pro": "Gemini 1.5 Pro",
  "gemini-1.5-flash": "Gemini 1.5 Flash",
  "gemini-1.5-flash-latest": "Gemini 1.5 Flash",
  "gemini-1.5-flash-8b": "Gemini 1.5 Flash 8B",
  "gemini-1.5-flash-8b-latest": "Gemini 1.5 Flash 8B",
  "gemini-2.0-flash-001": "Gemini 2.0 Flash",
} as const;

export type AIModel = keyof typeof AIModelToLabel;

export const modelToProviderId: Record<string | AIModel, string> = {
  // OpenAI models
  "gpt-4o": "gpt-4o",
  "gpt-4o-mini": "gpt-4o-mini",
  "gpt-4-turbo": "gpt-4-turbo-preview",
  "gpt-4": "gpt-4",
  "gpt-3.5-turbo": "gpt-3.5-turbo",
  "o1": "o1",
  "o1-mini": "o1-mini",
  "o1-preview": "o1-preview",
  "o3-mini": "o3-mini",
  // Groq models
  "google/gemma-7b-it": "gemma-7b-it",
  "mistralai/Mixtral-8x7B-Instruct-v0.1": "mixtral-8x7b-32768",
  "deepseek-r1-distill-llama-70b": "deepseek-r1-distill-llama-70b",
  "gemma2-9b-it": "gemma2-9b-it",
  "llama-3.1-8b-instant": "llama-3.1-8b-instant",
  "llama-3.2-11b-vision-preview": "llama-3.2-11b-vision-preview",
  "llama-3.2-1b-preview": "llama-3.2-1b-preview",
  "llama-3.2-3b-preview": "llama-3.2-3b-preview",
  "llama-3.2-90b-vision-preview": "llama-3.2-90b-vision-preview",
  "llama-3.3-70b-specdec": "llama-3.3-70b-specdec",
  "llama-3.3-70b-versatile": "llama-3.3-70b-versatile",
  "llama3-70b-8192": "llama3-70b-8192",
  "llama3-8b-8192": "llama3-8b-8192",
  "mixtral-8x7b-32768": "mixtral-8x7b-32768",
  // Anthropic models
  "claude-3-opus-20240229": "claude-3-opus-20240229",
  // "claude-3-sonnet-20240229": "claude-3-sonnet-20240229",
  "claude-3-5-sonnet-20241022": "claude-3-5-sonnet-20241022",
  "claude-3-7-sonnet-20250219": "claude-3-7-sonnet-20250219",
  "claude-3-5-haiku-20241022": "claude-3-5-haiku-20241022",
  // Perplexity models
  "sonar-reasoning-pro": "sonar-reasoning-pro",
  "sonar-reasoning": "sonar-reasoning",
  "sonar-pro": "sonar-pro",
  "sonar": "sonar",
  // Google Generative AI models
  // "gemini-1.5-pro-latest": "gemini-1.5-pro-latest",
  // "gemini-1.5-pro": "gemini-1.5-pro",
  "gemini-1.5-flash": "gemini-1.5-flash",
  "gemini-1.5-flash-latest": "gemini-1.5-flash-latest",
  "gemini-1.5-flash-8b": "gemini-1.5-flash-8b",
  "gemini-1.5-flash-8b-latest": "gemini-1.5-flash-8b-latest",
  "gemini-2.0-flash-001": "gemini-2.0-flash-001",
};

export const modelToProvider: Record<string | AIModel, AIProvider> = {
  // OpenAI models
  "gpt-4o": "openai",
  "gpt-4o-mini": "openai",
  "gpt-4-turbo": "openai",
  "gpt-4": "openai",
  "gpt-3.5-turbo": "openai",
  "o1": "openai",
  "o1-mini": "openai",
  "o1-preview": "openai",
  "o3-mini": "openai",
  // Groq models
  "mistralai/Mixtral-8x7B-Instruct-v0.1": "groq",
  "google/gemma-7b-it": "groq",
  "deepseek-r1-distill-llama-70b": "groq",
  "gemma2-9b-it": "groq",
  "llama-3.1-8b-instant": "groq",
  "llama-3.2-11b-vision-preview": "groq",
  "llama-3.2-1b-preview": "groq",
  "llama-3.2-3b-preview": "groq",
  "llama-3.2-90b-vision-preview": "groq",
  "llama-3.3-70b-specdec": "groq",
  "llama-3.3-70b-versatile": "groq",
  "llama3-70b-8192": "groq",
  "llama3-8b-8192": "groq",
  "mixtral-8x7b-32768": "groq",
  // Anthropic models
  "claude-3-opus-20240229": "anthropic",
  // "claude-3-sonnet-20240229": "anthropic",
  "claude-3-5-sonnet-20241022": "anthropic",
  "claude-3-5-haiku-20241022": "anthropic",
  "claude-3-7-sonnet-20250219": "anthropic",
  // Xai models
  "grok-2-latest": "xai",
  "grok-beta": "xai",
  // Perplexity models
  "sonar-reasoning-pro": "perplexity",
  "sonar-reasoning": "perplexity",
  "sonar-pro": "perplexity",
  "sonar": "perplexity",
  // Google Generative AI models
  "gemini-1.5-pro-latest": "google",
  "gemini-1.5-pro": "google",
  "gemini-1.5-flash": "google",
  "gemini-1.5-flash-latest": "google",
  "gemini-1.5-flash-8b": "google",
  "gemini-1.5-flash-8b-latest": "google",
  "gemini-2.0-flash-001": "google",
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

export const WorkflowInputTypeToZapierFieldType: Record<WorkflowInputType | string, string> = {
  text: "string",
  textarea: "text",
  number: "number",
  url: "string",
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

// export const WorkflowInputTypeToZapierFieldType: Record<
//   WorkflowInputType | string,
//   string
// > = {
//   text: "string",
//   textarea: "text",
//   number: "number",
//   url: "string",
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
