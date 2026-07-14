export type AIProvider = "openrouter";

export const AIModelToLabel = {
  "gpt-3.5-turbo": "GPT-3.5 Turbo",
  "gpt-4": "GPT-4",
  "gpt-4-turbo": "GPT-4 Turbo",
  "gpt-4o": "GPT-4o",
  "gpt-4o-mini": "GPT-4o mini",
  "gpt-4.1": "GPT-4.1",
  "gpt-4.1-mini": "GPT-4.1 mini",
  "gpt-4.1-nano": "GPT-4.1 nano",
  "gpt-4.5": "GPT-4.5",
  "gpt-5": "GPT-5",
  "gpt-5-pro": "GPT-5 Pro",
  "gpt-5.2": "GPT-5.2",
  "gpt-5.2-chat": "GPT-5.2 Chat",
  "gpt-5.2-pro": "GPT-5.2 Pro",
  o1: "o1",
  "o1-mini": "o1 Mini",
  "o1-preview": "o1 Preview",
  "o3-mini": "o3 Mini",
  "o3-pro": "o3 Pro",
  "o4-mini": "o4 Mini",
  "gpt-oss-120b": "GPT OSS 120B",
  "gpt-oss-20b": "GPT OSS 20B",
  "gpt-5.4": "GPT-5.4",
  "gpt-5.4-mini": "GPT-5.4 Mini",
  "gpt-5.4-nano": "GPT-5.4 Nano",
  "gpt-5.4-pro": "GPT-5.4 Pro",
  "gpt-5.5": "GPT-5.5",
  "gpt-5.5-pro": "GPT-5.5 Pro",
  "gpt-5.6-luna": "GPT-5.6 Luna",
  "gpt-5.6-luna-pro": "GPT-5.6 Luna Pro",
  "gpt-5.6-terra": "GPT-5.6 Terra",
  "gpt-5.6-terra-pro": "GPT-5.6 Terra Pro",
  "gpt-5.6-sol": "GPT-5.6 Sol",
  "gpt-5.6-sol-pro": "GPT-5.6 Sol Pro",
  o3: "o3",
  "claude-sonnet-4.5": "Claude Sonnet 4.5",
  "claude-opus-4.5": "Claude Opus 4.5",
  "claude-haiku-4.5": "Claude Haiku 4.5",
  "claude-opus-4.6": "Claude Opus 4.6",
  "claude-opus-4.7": "Claude Opus 4.7",
  "claude-opus-4.8": "Claude Opus 4.8",
  "claude-sonnet-4.6": "Claude Sonnet 4.6",
  "claude-sonnet-5": "Claude Sonnet 5",
  "claude-fable-5": "Claude Fable 5",
  "grok-3": "Grok 3",
  "grok-3-mini": "Grok 3 Mini",
  "grok-3-beta": "Grok Beta",
  "grok-4": "Grok 4",
  "grok-4-fast": "Grok 4 Fast",
  "grok-4.1": "Grok 4.1",
  "grok-4.1-fast": "Grok 4.1 Fast",
  "grok-4.20": "Grok 4.20",
  "grok-4.3": "Grok 4.3",
  "grok-4.5": "Grok 4.5",
  sonar: "Perplexity Sonar",
  "sonar-pro": "Perplexity Sonar Pro",
  "sonar-reasoning-pro": "Perplexity Sonar Reasoning Pro",
  "sonar-reasoning": "Perplexity Sonar Reasoning",
  "sonar-deep-research": "Perplexity Sonar Deep Research",
  "llama-3.1-8b-instant": "Llama 3.1 8B Instant",
  "llama-3.2-1b-preview": "Llama 3.2 1B Preview",
  "llama-3.2-3b-preview": "Llama 3.2 3B Preview",
  "llama-3.3-70b-versatile": "Llama 3.3 70B Versatile",
  "llama3-8b-8192": "Llama 3 8B 8192",
  "llama3-70b-8192": "Llama 3 70B 8192",
  "llama-4-scout": "Llama 4 Scout",
  "llama-4-maverick": "Llama 4 Maverick",
  "mistral-large-latest": "Mistral Large",
  "mistral-small-latest": "Mistral Small",
  "mixtral-8x7b-32768": "Mixtral 8x7B",
  "pixtral-12b-2409": "Pixtral 12B",
  "mistral-medium-3.5": "Mistral Medium 3.5",
  "deepseek-r1-distill-llama-70b": "DeepSeek R1 Distill Llama 70B",
  "deepseek-chat-v3-0324": "DeepSeek Chat v3 (Mar 2024)",
  "deepseek-chat-v3.1": "DeepSeek Chat v3.1",
  "deepseek-chat-v3": "DeepSeek Chat v3",
  "deepseek-coder-v2": "DeepSeek Coder v2",
  "deepseek-coder-v2-lite": "DeepSeek Coder v2 Lite",
  "deepseek-v3.2": "DeepSeek v3.2",
  "deepseek-v4-flash": "DeepSeek v4 Flash",
  "deepseek-v4-pro": "DeepSeek v4 Pro",
  "deepseek-r1-0528": "DeepSeek R1 (0528)",
  "qwen-2.5-7b-instruct": "Qwen 2.5 7B Instruct",
  "qwen-2.5-72b-instruct": "Qwen 2.5 72B Instruct",
  "qwen-2.5-0.5b-instruct": "Qwen 2.5 0.5B Instruct",
  "qwen-2.5-1.5b-instruct": "Qwen 2.5 1.5B Instruct",
  "qwen-2.5-3b-instruct": "Qwen 2.5 3B Instruct",
  "qwen-2.5-14b-instruct": "Qwen 2.5 14B Instruct",
  "qwen-2.5-32b-instruct": "Qwen 2.5 32B Instruct",
  "qwen3-8b": "Qwen3 8B",
  "qwen3-14b": "Qwen3 14B",
  "qwen3-32b": "Qwen3 32B",
  "qwen3-max": "Qwen3 Max",
  "qwen3-coder": "Qwen3 Coder",
  "command-r": "Command R",
  "command-r-plus": "Command R+",
  "command-r7b-08-2024": "Command R7B",
  "command-a": "Command A",
  "gemini-2-5-pro": "Gemini 2.5 Pro",
  "gemini-2-5-flash": "Gemini 2.5 Flash",
  "gemini-2-5-flash-lite": "Gemini 2.5 Flash Lite",
  "gemma-2-27b": "Gemma 2 27B",
  "gemma-3": "Gemma 3",
  "code-gemma": "Code Gemma",
  "gemini-3-pro-preview": "Gemini 3 Pro Preview",
  "gemma-2-9b": "Gemma 2 9B",
  "gemini-3.1-pro-preview": "Gemini 3.1 Pro Preview",
  "gemini-3-flash-preview": "Gemini 3 Flash Preview",
  "gemini-3.1-flash-lite": "Gemini 3.1 Flash Lite",
  "gemini-3.5-flash": "Gemini 3.5 Flash",
  "gemma-4-31b-it": "Gemma 4 31B",
  "gemma-4-26b-a4b-it": "Gemma 4 26B A4B",
  "sonar-pro-search": "Perplexity Sonar Pro Search",
  "ministral-14b-latest": "Ministral 14B",
  "ministral-8b-latest": "Ministral 8B",
  "ministral-3b-latest": "Ministral 3B",
  "qwen3.5-9b": "Qwen3.5 9B",
  "qwen3.6-27b": "Qwen3.6 27B",
  "qwen3.6-35b-a3b": "Qwen3.6 35B A3B",
  "qwen3.7-max": "Qwen3.7 Max",
  "qwen3.7-plus": "Qwen3.7 Plus",
  "qwen3-coder-next": "Qwen3 Coder Next",
  "north-mini-code": "North Mini Code",
} as const;

export type AIModel = keyof typeof AIModelToLabel;

export const modelToProviderId: Record<string | AIModel, string> = {
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
  o1: "openai/o1",
  "o1-mini": "openai/o1",
  "o1-preview": "openai/o1",
  "o3-mini": "openai/o3-mini",
  "o3-pro": "openai/o3-pro",
  "o4-mini": "openai/o4-mini",
  "gpt-oss-120b": "openai/gpt-oss-120b",
  "gpt-oss-20b": "openai/gpt-oss-20b",
  "gpt-5.4": "openai/gpt-5.4",
  "gpt-5.4-mini": "openai/gpt-5.4-mini",
  "gpt-5.4-nano": "openai/gpt-5.4-nano",
  "gpt-5.4-pro": "openai/gpt-5.4-pro",
  "gpt-5.5": "openai/gpt-5.5",
  "gpt-5.5-pro": "openai/gpt-5.5-pro",
  "gpt-5.6-luna": "openai/gpt-5.6-luna",
  "gpt-5.6-luna-pro": "openai/gpt-5.6-luna-pro",
  "gpt-5.6-terra": "openai/gpt-5.6-terra",
  "gpt-5.6-terra-pro": "openai/gpt-5.6-terra-pro",
  "gpt-5.6-sol": "openai/gpt-5.6-sol",
  "gpt-5.6-sol-pro": "openai/gpt-5.6-sol-pro",
  o3: "openai/o3",
  "claude-sonnet-4.5": "anthropic/claude-sonnet-4.5",
  "claude-opus-4.5": "anthropic/claude-opus-4.5",
  "claude-haiku-4.5": "anthropic/claude-haiku-4.5",
  "claude-opus-4.6": "anthropic/claude-opus-4.6",
  "claude-opus-4.7": "anthropic/claude-opus-4.7",
  "claude-opus-4.8": "anthropic/claude-opus-4.8",
  "claude-sonnet-4.6": "anthropic/claude-sonnet-4.6",
  "claude-sonnet-5": "anthropic/claude-sonnet-5",
  "claude-fable-5": "anthropic/claude-fable-5",
  "grok-3": "x-ai/grok-3",
  "grok-3-mini": "x-ai/grok-3-mini",
  "grok-3-beta": "x-ai/grok-3-beta",
  "grok-4": "x-ai/grok-4",
  "grok-4-fast": "x-ai/grok-4-fast",
  "grok-4.1": "x-ai/grok-4.1",
  "grok-4.1-fast": "x-ai/grok-4.1-fast",
  "grok-4.20": "x-ai/grok-4.20",
  "grok-4.3": "x-ai/grok-4.3",
  "grok-4.5": "x-ai/grok-4.5",
  sonar: "perplexity/sonar",
  "sonar-pro": "perplexity/sonar-pro",
  "sonar-reasoning-pro": "perplexity/sonar-reasoning-pro",
  "sonar-reasoning": "perplexity/sonar-reasoning",
  "sonar-deep-research": "perplexity/sonar-deep-research",
  "llama-3.1-8b-instant": "meta-llama/llama-3.1-8b-instruct",
  "llama-3.2-1b-preview": "meta-llama/llama-3.2-1b-instruct",
  "llama-3.2-3b-preview": "meta-llama/llama-3.2-3b-instruct",
  "llama-3.3-70b-versatile": "meta-llama/llama-3.3-70b-instruct",
  "llama3-8b-8192": "meta-llama/llama-3-8b-instruct",
  "llama3-70b-8192": "meta-llama/llama-3-70b-instruct",
  "llama-4-scout": "meta-llama/llama-4-scout",
  "llama-4-maverick": "meta-llama/llama-4-maverick",
  "mistral-large-latest": "mistralai/mistral-large-2512",
  "mistral-small-latest": "mistralai/mistral-small-2603",
  "mixtral-8x7b-32768": "mistralai/mixtral-8x7b-instruct",
  "pixtral-12b-2409": "mistralai/pixtral-12b-2409",
  "mistral-medium-3.5": "mistralai/mistral-medium-3-5",
  "deepseek-r1-distill-llama-70b": "deepseek/deepseek-r1-distill-llama-70b",
  "deepseek-chat-v3-0324": "deepseek/deepseek-chat-v3-0324",
  "deepseek-chat-v3.1": "deepseek/deepseek-chat-v3.1",
  "deepseek-chat-v3": "deepseek/deepseek-chat-v3",
  "deepseek-coder-v2": "deepseek/deepseek-coder-v2",
  "deepseek-coder-v2-lite": "deepseek/deepseek-coder-v2-lite",
  "deepseek-v3.2": "deepseek/deepseek-v3.2",
  "deepseek-v4-flash": "deepseek/deepseek-v4-flash",
  "deepseek-v4-pro": "deepseek/deepseek-v4-pro",
  "deepseek-r1-0528": "deepseek/deepseek-r1-0528",
  "qwen-2.5-7b-instruct": "qwen/qwen-2.5-7b-instruct",
  "qwen-2.5-72b-instruct": "qwen/qwen-2.5-72b-instruct",
  "qwen-2.5-0.5b-instruct": "qwen/qwen-2.5-0.5b-instruct",
  "qwen-2.5-1.5b-instruct": "qwen/qwen-2.5-1.5b-instruct",
  "qwen-2.5-3b-instruct": "qwen/qwen-2.5-3b-instruct",
  "qwen-2.5-14b-instruct": "qwen/qwen-2.5-14b-instruct",
  "qwen-2.5-32b-instruct": "qwen/qwen-2.5-32b-instruct",
  "qwen3-8b": "qwen/qwen3-8b",
  "qwen3-14b": "qwen/qwen3-14b",
  "qwen3-32b": "qwen/qwen3-32b",
  "qwen3-max": "qwen/qwen3-max",
  "qwen3-coder": "qwen/qwen3-coder",
  "command-r": "cohere/command-r-08-2024",
  "command-r-plus": "cohere/command-r-plus-08-2024",
  "command-r7b-08-2024": "cohere/command-r7b-12-2024",
  "command-a": "cohere/command-a",
  "gemini-2-5-pro": "google/gemini-2.5-pro",
  "gemini-2-5-flash": "google/gemini-2.5-flash",
  "gemini-2-5-flash-lite": "google/gemini-2.5-flash-lite",
  "gemma-2-27b": "google/gemma-2-27b-it",
  "gemma-3": "google/gemma-3-12b-it",
  "code-gemma": "google/gemma-3-4b-it",
  "gemini-3-pro-preview": "google/gemini-3-pro-preview",
  "gemma-2-9b": "google/gemma-2-9b-it",
  "gemini-3.1-pro-preview": "google/gemini-3.1-pro-preview",
  "gemini-3-flash-preview": "google/gemini-3-flash-preview",
  "gemini-3.1-flash-lite": "google/gemini-3.1-flash-lite",
  "gemini-3.5-flash": "google/gemini-3.5-flash",
  "gemma-4-31b-it": "google/gemma-4-31b-it",
  "gemma-4-26b-a4b-it": "google/gemma-4-26b-a4b-it",
  "sonar-pro-search": "perplexity/sonar-pro-search",
  "ministral-14b-latest": "mistralai/ministral-14b-2512",
  "ministral-8b-latest": "mistralai/ministral-8b-2512",
  "ministral-3b-latest": "mistralai/ministral-3b-2512",
  "qwen3.5-9b": "qwen/qwen3.5-9b",
  "qwen3.6-27b": "qwen/qwen3.6-27b",
  "qwen3.6-35b-a3b": "qwen/qwen3.6-35b-a3b",
  "qwen3.7-max": "qwen/qwen3.7-max",
  "qwen3.7-plus": "qwen/qwen3.7-plus",
  "qwen3-coder-next": "qwen/qwen3-coder-next",
  "north-mini-code": "cohere/north-mini-code:free",
};

export const AIModels = Object.keys(AIModelToLabel) as Array<AIModel>;

export type ModelCompany =
  | "OpenAI"
  | "Anthropic"
  | "Google"
  | "xAI"
  | "Perplexity"
  | "Meta"
  | "Mistral"
  | "DeepSeek"
  | "Qwen"
  | "Cohere";

export type ModelCapabilities = {
  vision: boolean;
  largeContextWindow: boolean;
  webSearch: boolean;
  structuredOutput: boolean;
  reasoning: boolean;
};

export type ModelMeta = {
  company: ModelCompany;
  contextLength: number;
  capabilities: ModelCapabilities;
  deprecated?: {
    replacement: AIModel;
    note: string;
  };
};

export const AIModelMeta: Record<AIModel, ModelMeta> = {
  "gpt-3.5-turbo": {
    company: "OpenAI",
    contextLength: 16385,
    capabilities: {
      vision: false,
      largeContextWindow: false,
      webSearch: false,
      structuredOutput: true,
      reasoning: false,
    },
    deprecated: {
      replacement: "gpt-5.4-mini",
      note: "Superseded by the current GPT-5.x generation. Switch to GPT-5.4 Mini.",
    },
  },
  "gpt-4": {
    company: "OpenAI",
    contextLength: 8191,
    capabilities: {
      vision: false,
      largeContextWindow: false,
      webSearch: false,
      structuredOutput: true,
      reasoning: false,
    },
    deprecated: {
      replacement: "gpt-5.5",
      note: "Superseded by the current GPT-5.x generation. Switch to GPT-5.5.",
    },
  },
  "gpt-4-turbo": {
    company: "OpenAI",
    contextLength: 128000,
    capabilities: {
      vision: true,
      largeContextWindow: false,
      webSearch: false,
      structuredOutput: true,
      reasoning: false,
    },
    deprecated: {
      replacement: "gpt-5.5",
      note: "Superseded by the current GPT-5.x generation. Switch to GPT-5.5.",
    },
  },
  "gpt-4o": {
    company: "OpenAI",
    contextLength: 128000,
    capabilities: {
      vision: true,
      largeContextWindow: false,
      webSearch: false,
      structuredOutput: true,
      reasoning: false,
    },
    deprecated: {
      replacement: "gpt-5.5",
      note: "Superseded by the current GPT-5.x generation. Switch to GPT-5.5.",
    },
  },
  "gpt-4o-mini": {
    company: "OpenAI",
    contextLength: 128000,
    capabilities: {
      vision: true,
      largeContextWindow: false,
      webSearch: false,
      structuredOutput: true,
      reasoning: false,
    },
    deprecated: {
      replacement: "gpt-5.4-mini",
      note: "Superseded by the current GPT-5.x generation. Switch to GPT-5.4 Mini.",
    },
  },
  "gpt-4.1": {
    company: "OpenAI",
    contextLength: 1047576,
    capabilities: {
      vision: true,
      largeContextWindow: true,
      webSearch: false,
      structuredOutput: true,
      reasoning: false,
    },
    deprecated: {
      replacement: "gpt-5.5",
      note: "Superseded by the current GPT-5.x generation. Switch to GPT-5.5.",
    },
  },
  "gpt-4.1-mini": {
    company: "OpenAI",
    contextLength: 1047576,
    capabilities: {
      vision: true,
      largeContextWindow: true,
      webSearch: false,
      structuredOutput: true,
      reasoning: false,
    },
    deprecated: {
      replacement: "gpt-5.4-mini",
      note: "Superseded by the current GPT-5.x generation. Switch to GPT-5.4 Mini.",
    },
  },
  "gpt-4.1-nano": {
    company: "OpenAI",
    contextLength: 1047576,
    capabilities: {
      vision: true,
      largeContextWindow: true,
      webSearch: false,
      structuredOutput: true,
      reasoning: false,
    },
    deprecated: {
      replacement: "gpt-5.4-nano",
      note: "Superseded by the current GPT-5.x generation. Switch to GPT-5.4 Nano.",
    },
  },
  "gpt-4.5": {
    company: "OpenAI",
    contextLength: 1047576,
    capabilities: {
      vision: true,
      largeContextWindow: true,
      webSearch: false,
      structuredOutput: true,
      reasoning: false,
    },
    deprecated: {
      replacement: "gpt-5.5",
      note: "Retired by OpenAI (2026-06-27) and no longer on OpenRouter. Switch to GPT-5.5.",
    },
  },
  "gpt-5": {
    company: "OpenAI",
    contextLength: 400000,
    capabilities: {
      vision: true,
      largeContextWindow: true,
      webSearch: true,
      structuredOutput: true,
      reasoning: true,
    },
    deprecated: {
      replacement: "gpt-5.5",
      note: "Superseded by the current GPT-5.x generation. Switch to GPT-5.5.",
    },
  },
  "gpt-5-pro": {
    company: "OpenAI",
    contextLength: 400000,
    capabilities: {
      vision: true,
      largeContextWindow: true,
      webSearch: true,
      structuredOutput: true,
      reasoning: true,
    },
    deprecated: {
      replacement: "gpt-5.6-luna-pro",
      note: "Superseded by the current GPT-5.6 generation. Switch to GPT-5.6 Luna Pro.",
    },
  },
  "gpt-5.2": {
    company: "OpenAI",
    contextLength: 400000,
    capabilities: {
      vision: true,
      largeContextWindow: true,
      webSearch: true,
      structuredOutput: true,
      reasoning: true,
    },
    deprecated: {
      replacement: "gpt-5.5",
      note: "Superseded by the current GPT-5.x generation. Switch to GPT-5.5.",
    },
  },
  "gpt-5.2-chat": {
    company: "OpenAI",
    contextLength: 128000,
    capabilities: {
      vision: true,
      largeContextWindow: false,
      webSearch: true,
      structuredOutput: true,
      reasoning: false,
    },
    deprecated: {
      replacement: "gpt-5.5",
      note: "Superseded by the current GPT-5.x generation. Switch to GPT-5.5.",
    },
  },
  "gpt-5.2-pro": {
    company: "OpenAI",
    contextLength: 400000,
    capabilities: {
      vision: true,
      largeContextWindow: true,
      webSearch: true,
      structuredOutput: true,
      reasoning: true,
    },
    deprecated: {
      replacement: "gpt-5.6-luna-pro",
      note: "Superseded by the current GPT-5.6 generation. Switch to GPT-5.6 Luna Pro.",
    },
  },
  o1: {
    company: "OpenAI",
    contextLength: 200000,
    capabilities: {
      vision: true,
      largeContextWindow: true,
      webSearch: false,
      structuredOutput: true,
      reasoning: true,
    },
    deprecated: {
      replacement: "gpt-5.5",
      note: "Superseded by the current GPT-5.x generation (native reasoning). Switch to GPT-5.5.",
    },
  },
  "o1-mini": {
    company: "OpenAI",
    contextLength: 200000,
    capabilities: {
      vision: true,
      largeContextWindow: true,
      webSearch: false,
      structuredOutput: true,
      reasoning: true,
    },
    deprecated: {
      replacement: "gpt-5.4-mini",
      note: "Retired by OpenAI and no longer on OpenRouter. Switch to GPT-5.4 Mini.",
    },
  },
  "o1-preview": {
    company: "OpenAI",
    contextLength: 200000,
    capabilities: {
      vision: true,
      largeContextWindow: true,
      webSearch: false,
      structuredOutput: true,
      reasoning: true,
    },
    deprecated: {
      replacement: "gpt-5.5",
      note: "Retired by OpenAI and no longer on OpenRouter. Switch to GPT-5.5.",
    },
  },
  "o3-mini": {
    company: "OpenAI",
    contextLength: 200000,
    capabilities: {
      vision: false,
      largeContextWindow: true,
      webSearch: false,
      structuredOutput: true,
      reasoning: true,
    },
    deprecated: {
      replacement: "gpt-5.5",
      note: "Superseded by the current GPT-5.x generation (native reasoning). Switch to GPT-5.5.",
    },
  },
  "o3-pro": {
    company: "OpenAI",
    contextLength: 200000,
    capabilities: {
      vision: true,
      largeContextWindow: true,
      webSearch: false,
      structuredOutput: true,
      reasoning: true,
    },
    deprecated: {
      replacement: "gpt-5.6-luna-pro",
      note: "Superseded by the current GPT-5.6 generation (native reasoning). Switch to GPT-5.6 Luna Pro.",
    },
  },
  "o4-mini": {
    company: "OpenAI",
    contextLength: 200000,
    capabilities: {
      vision: true,
      largeContextWindow: true,
      webSearch: false,
      structuredOutput: true,
      reasoning: true,
    },
    deprecated: {
      replacement: "gpt-5.4-mini",
      note: "Superseded by the current GPT-5.x generation (native reasoning). Switch to GPT-5.4 Mini.",
    },
  },
  "gpt-oss-120b": {
    company: "OpenAI",
    contextLength: 131072,
    capabilities: {
      vision: false,
      largeContextWindow: false,
      webSearch: false,
      structuredOutput: true,
      reasoning: true,
    },
  },
  "gpt-oss-20b": {
    company: "OpenAI",
    contextLength: 131072,
    capabilities: {
      vision: false,
      largeContextWindow: false,
      webSearch: false,
      structuredOutput: true,
      reasoning: true,
    },
  },
  "gpt-5.4": {
    company: "OpenAI",
    contextLength: 1050000,
    capabilities: {
      vision: true,
      largeContextWindow: true,
      webSearch: true,
      structuredOutput: true,
      reasoning: true,
    },
  },
  "gpt-5.4-mini": {
    company: "OpenAI",
    contextLength: 400000,
    capabilities: {
      vision: true,
      largeContextWindow: true,
      webSearch: false,
      structuredOutput: true,
      reasoning: true,
    },
  },
  "gpt-5.4-nano": {
    company: "OpenAI",
    contextLength: 400000,
    capabilities: {
      vision: true,
      largeContextWindow: true,
      webSearch: false,
      structuredOutput: true,
      reasoning: true,
    },
  },
  "gpt-5.4-pro": {
    company: "OpenAI",
    contextLength: 1050000,
    capabilities: {
      vision: true,
      largeContextWindow: true,
      webSearch: true,
      structuredOutput: true,
      reasoning: true,
    },
    deprecated: {
      replacement: "gpt-5.6-luna-pro",
      note: "Superseded by the current GPT-5.6 generation. Switch to GPT-5.6 Luna Pro.",
    },
  },
  "gpt-5.5": {
    company: "OpenAI",
    contextLength: 1050000,
    capabilities: {
      vision: true,
      largeContextWindow: true,
      webSearch: true,
      structuredOutput: true,
      reasoning: true,
    },
  },
  "gpt-5.5-pro": {
    company: "OpenAI",
    contextLength: 1050000,
    capabilities: {
      vision: true,
      largeContextWindow: true,
      webSearch: true,
      structuredOutput: true,
      reasoning: true,
    },
    deprecated: {
      replacement: "gpt-5.6-luna-pro",
      note: "Superseded by the current GPT-5.6 generation. Switch to GPT-5.6 Luna Pro.",
    },
  },
  "gpt-5.6-luna": {
    company: "OpenAI",
    contextLength: 1050000,
    capabilities: {
      vision: true,
      largeContextWindow: true,
      webSearch: true,
      structuredOutput: true,
      reasoning: true,
    },
  },
  "gpt-5.6-luna-pro": {
    company: "OpenAI",
    contextLength: 1050000,
    capabilities: {
      vision: true,
      largeContextWindow: true,
      webSearch: true,
      structuredOutput: true,
      reasoning: true,
    },
  },
  "gpt-5.6-terra": {
    company: "OpenAI",
    contextLength: 1050000,
    capabilities: {
      vision: true,
      largeContextWindow: true,
      webSearch: true,
      structuredOutput: true,
      reasoning: true,
    },
  },
  "gpt-5.6-terra-pro": {
    company: "OpenAI",
    contextLength: 1050000,
    capabilities: {
      vision: true,
      largeContextWindow: true,
      webSearch: true,
      structuredOutput: true,
      reasoning: true,
    },
  },
  "gpt-5.6-sol": {
    company: "OpenAI",
    contextLength: 1050000,
    capabilities: {
      vision: true,
      largeContextWindow: true,
      webSearch: true,
      structuredOutput: true,
      reasoning: true,
    },
  },
  "gpt-5.6-sol-pro": {
    company: "OpenAI",
    contextLength: 1050000,
    capabilities: {
      vision: true,
      largeContextWindow: true,
      webSearch: true,
      structuredOutput: true,
      reasoning: true,
    },
  },
  o3: {
    company: "OpenAI",
    contextLength: 200000,
    capabilities: {
      vision: true,
      largeContextWindow: true,
      webSearch: false,
      structuredOutput: true,
      reasoning: true,
    },
    deprecated: {
      replacement: "gpt-5.5",
      note: "Superseded by the current GPT-5.x generation (native reasoning). Switch to GPT-5.5.",
    },
  },
  "claude-sonnet-4.5": {
    company: "Anthropic",
    contextLength: 1000000,
    capabilities: {
      vision: true,
      largeContextWindow: true,
      webSearch: false,
      structuredOutput: true,
      reasoning: true,
    },
    deprecated: {
      replacement: "claude-sonnet-5",
      note: "Superseded by the Sonnet 5 generation. Switch to Claude Sonnet 5.",
    },
  },
  "claude-opus-4.5": {
    company: "Anthropic",
    contextLength: 200000,
    capabilities: {
      vision: true,
      largeContextWindow: true,
      webSearch: false,
      structuredOutput: true,
      reasoning: true,
    },
    deprecated: {
      replacement: "claude-opus-4.8",
      note: "Superseded by the Opus 4.8 generation. Switch to Claude Opus 4.8.",
    },
  },
  "claude-haiku-4.5": {
    company: "Anthropic",
    contextLength: 200000,
    capabilities: {
      vision: true,
      largeContextWindow: true,
      webSearch: false,
      structuredOutput: true,
      reasoning: true,
    },
  },
  "claude-opus-4.6": {
    company: "Anthropic",
    contextLength: 1000000,
    capabilities: {
      vision: true,
      largeContextWindow: true,
      webSearch: false,
      structuredOutput: true,
      reasoning: true,
    },
    deprecated: {
      replacement: "claude-opus-4.8",
      note: "Superseded by the Opus 4.8 generation. Switch to Claude Opus 4.8.",
    },
  },
  "claude-opus-4.7": {
    company: "Anthropic",
    contextLength: 1000000,
    capabilities: {
      vision: true,
      largeContextWindow: true,
      webSearch: false,
      structuredOutput: true,
      reasoning: true,
    },
    deprecated: {
      replacement: "claude-opus-4.8",
      note: "Superseded by the Opus 4.8 generation. Switch to Claude Opus 4.8.",
    },
  },
  "claude-opus-4.8": {
    company: "Anthropic",
    contextLength: 1000000,
    capabilities: {
      vision: true,
      largeContextWindow: true,
      webSearch: false,
      structuredOutput: true,
      reasoning: true,
    },
  },
  "claude-sonnet-4.6": {
    company: "Anthropic",
    contextLength: 1000000,
    capabilities: {
      vision: true,
      largeContextWindow: true,
      webSearch: false,
      structuredOutput: true,
      reasoning: true,
    },
    deprecated: {
      replacement: "claude-sonnet-5",
      note: "Superseded by the Sonnet 5 generation. Switch to Claude Sonnet 5.",
    },
  },
  "claude-sonnet-5": {
    company: "Anthropic",
    contextLength: 1000000,
    capabilities: {
      vision: true,
      largeContextWindow: true,
      webSearch: false,
      structuredOutput: true,
      reasoning: true,
    },
  },
  "claude-fable-5": {
    company: "Anthropic",
    contextLength: 1000000,
    capabilities: {
      vision: true,
      largeContextWindow: true,
      webSearch: false,
      structuredOutput: true,
      reasoning: true,
    },
  },
  "grok-3": {
    company: "xAI",
    contextLength: 131072,
    capabilities: {
      vision: false,
      largeContextWindow: false,
      webSearch: false,
      structuredOutput: true,
      reasoning: false,
    },
    deprecated: {
      replacement: "grok-4.5",
      note: "Retired by OpenRouter. Switch to Grok 4.5.",
    },
  },
  "grok-3-mini": {
    company: "xAI",
    contextLength: 131072,
    capabilities: {
      vision: false,
      largeContextWindow: false,
      webSearch: false,
      structuredOutput: true,
      reasoning: true,
    },
    deprecated: {
      replacement: "grok-4.5",
      note: "Retired by OpenRouter. Switch to Grok 4.5.",
    },
  },
  "grok-3-beta": {
    company: "xAI",
    contextLength: 131072,
    capabilities: {
      vision: false,
      largeContextWindow: false,
      webSearch: false,
      structuredOutput: true,
      reasoning: false,
    },
    deprecated: {
      replacement: "grok-4.5",
      note: "Retired by OpenRouter. Switch to Grok 4.5.",
    },
  },
  "grok-4": {
    company: "xAI",
    contextLength: 256000,
    capabilities: {
      vision: true,
      largeContextWindow: true,
      webSearch: false,
      structuredOutput: true,
      reasoning: true,
    },
    deprecated: {
      replacement: "grok-4.5",
      note: "Retired by OpenRouter. Switch to Grok 4.5.",
    },
  },
  "grok-4-fast": {
    company: "xAI",
    contextLength: 2000000,
    capabilities: {
      vision: true,
      largeContextWindow: true,
      webSearch: false,
      structuredOutput: true,
      reasoning: true,
    },
    deprecated: {
      replacement: "grok-4.5",
      note: "Retired by OpenRouter. Switch to Grok 4.5.",
    },
  },
  "grok-4.1": {
    company: "xAI",
    contextLength: 2000000,
    capabilities: {
      vision: true,
      largeContextWindow: true,
      webSearch: false,
      structuredOutput: true,
      reasoning: true,
    },
    deprecated: {
      replacement: "grok-4.5",
      note: "Retired by OpenRouter. Switch to Grok 4.5.",
    },
  },
  "grok-4.1-fast": {
    company: "xAI",
    contextLength: 2000000,
    capabilities: {
      vision: true,
      largeContextWindow: true,
      webSearch: false,
      structuredOutput: true,
      reasoning: true,
    },
    deprecated: {
      replacement: "grok-4.5",
      note: "Retired by OpenRouter. Switch to Grok 4.5.",
    },
  },
  "grok-4.20": {
    company: "xAI",
    contextLength: 2000000,
    capabilities: {
      vision: true,
      largeContextWindow: true,
      webSearch: false,
      structuredOutput: true,
      reasoning: true,
    },
    deprecated: {
      replacement: "grok-4.5",
      note: "Superseded by the current Grok generation. Switch to Grok 4.5.",
    },
  },
  "grok-4.3": {
    company: "xAI",
    contextLength: 1000000,
    capabilities: {
      vision: true,
      largeContextWindow: true,
      webSearch: false,
      structuredOutput: true,
      reasoning: true,
    },
    deprecated: {
      replacement: "grok-4.5",
      note: "Superseded by the current Grok generation. Switch to Grok 4.5.",
    },
  },
  "grok-4.5": {
    company: "xAI",
    contextLength: 500000,
    capabilities: {
      vision: true,
      largeContextWindow: true,
      webSearch: false,
      structuredOutput: true,
      reasoning: true,
    },
  },
  sonar: {
    company: "Perplexity",
    contextLength: 127072,
    capabilities: {
      vision: true,
      largeContextWindow: false,
      webSearch: true,
      structuredOutput: false,
      reasoning: false,
    },
  },
  "sonar-pro": {
    company: "Perplexity",
    contextLength: 200000,
    capabilities: {
      vision: true,
      largeContextWindow: true,
      webSearch: true,
      structuredOutput: false,
      reasoning: false,
    },
  },
  "sonar-reasoning-pro": {
    company: "Perplexity",
    contextLength: 128000,
    capabilities: {
      vision: true,
      largeContextWindow: false,
      webSearch: true,
      structuredOutput: false,
      reasoning: true,
    },
  },
  "sonar-reasoning": {
    company: "Perplexity",
    contextLength: 128000,
    capabilities: {
      vision: true,
      largeContextWindow: false,
      webSearch: true,
      structuredOutput: false,
      reasoning: true,
    },
    deprecated: {
      replacement: "sonar-reasoning-pro",
      note: "Retired by OpenRouter. Switch to Sonar Reasoning Pro.",
    },
  },
  "sonar-deep-research": {
    company: "Perplexity",
    contextLength: 128000,
    capabilities: {
      vision: false,
      largeContextWindow: false,
      webSearch: true,
      structuredOutput: false,
      reasoning: true,
    },
  },
  "llama-3.1-8b-instant": {
    company: "Meta",
    contextLength: 131072,
    capabilities: {
      vision: false,
      largeContextWindow: false,
      webSearch: false,
      structuredOutput: true,
      reasoning: false,
    },
  },
  "llama-3.2-1b-preview": {
    company: "Meta",
    contextLength: 131072,
    capabilities: {
      vision: false,
      largeContextWindow: false,
      webSearch: false,
      structuredOutput: false,
      reasoning: false,
    },
  },
  "llama-3.2-3b-preview": {
    company: "Meta",
    contextLength: 131072,
    capabilities: {
      vision: false,
      largeContextWindow: false,
      webSearch: false,
      structuredOutput: true,
      reasoning: false,
    },
  },
  "llama-3.3-70b-versatile": {
    company: "Meta",
    contextLength: 131072,
    capabilities: {
      vision: false,
      largeContextWindow: false,
      webSearch: false,
      structuredOutput: true,
      reasoning: false,
    },
    deprecated: {
      replacement: "llama-4-scout",
      note: "Superseded by the Llama 4 generation. Switch to Llama 4 Scout.",
    },
  },
  "llama3-8b-8192": {
    company: "Meta",
    contextLength: 8192,
    capabilities: {
      vision: false,
      largeContextWindow: false,
      webSearch: false,
      structuredOutput: false,
      reasoning: false,
    },
    deprecated: {
      replacement: "llama-3.1-8b-instant",
      note: "Retired by OpenRouter. Switch to Llama 3.1 8B Instant.",
    },
  },
  "llama3-70b-8192": {
    company: "Meta",
    contextLength: 8192,
    capabilities: {
      vision: false,
      largeContextWindow: false,
      webSearch: false,
      structuredOutput: false,
      reasoning: false,
    },
    deprecated: {
      replacement: "llama-4-scout",
      note: "Retired by OpenRouter. Switch to Llama 4 Scout.",
    },
  },
  "llama-4-scout": {
    company: "Meta",
    contextLength: 10000000,
    capabilities: {
      vision: true,
      largeContextWindow: true,
      webSearch: false,
      structuredOutput: true,
      reasoning: false,
    },
  },
  "llama-4-maverick": {
    company: "Meta",
    contextLength: 1048576,
    capabilities: {
      vision: true,
      largeContextWindow: true,
      webSearch: false,
      structuredOutput: true,
      reasoning: false,
    },
  },
  "mistral-large-latest": {
    company: "Mistral",
    contextLength: 262144,
    capabilities: {
      vision: true,
      largeContextWindow: true,
      webSearch: false,
      structuredOutput: true,
      reasoning: false,
    },
  },
  "mistral-small-latest": {
    company: "Mistral",
    contextLength: 262144,
    capabilities: {
      vision: true,
      largeContextWindow: true,
      webSearch: false,
      structuredOutput: true,
      reasoning: true,
    },
  },
  "mixtral-8x7b-32768": {
    company: "Mistral",
    contextLength: 32768,
    capabilities: {
      vision: false,
      largeContextWindow: false,
      webSearch: false,
      structuredOutput: false,
      reasoning: false,
    },
    deprecated: {
      replacement: "mistral-small-latest",
      note: "Retired by OpenRouter. Switch to Mistral Small.",
    },
  },
  "pixtral-12b-2409": {
    company: "Mistral",
    contextLength: 128000,
    capabilities: {
      vision: true,
      largeContextWindow: false,
      webSearch: false,
      structuredOutput: false,
      reasoning: false,
    },
    deprecated: {
      replacement: "mistral-small-latest",
      note: "Retired by OpenRouter. Switch to Mistral Small (now vision-capable).",
    },
  },
  "mistral-medium-3.5": {
    company: "Mistral",
    contextLength: 262144,
    capabilities: {
      vision: true,
      largeContextWindow: true,
      webSearch: false,
      structuredOutput: true,
      reasoning: true,
    },
  },
  "deepseek-r1-distill-llama-70b": {
    company: "DeepSeek",
    contextLength: 128000,
    capabilities: {
      vision: false,
      largeContextWindow: false,
      webSearch: false,
      structuredOutput: false,
      reasoning: true,
    },
  },
  "deepseek-chat-v3-0324": {
    company: "DeepSeek",
    contextLength: 163840,
    capabilities: {
      vision: false,
      largeContextWindow: false,
      webSearch: false,
      structuredOutput: true,
      reasoning: false,
    },
    deprecated: {
      replacement: "deepseek-v4-flash",
      note: "Superseded by the DeepSeek v4 generation. Switch to DeepSeek v4 Flash.",
    },
  },
  "deepseek-chat-v3.1": {
    company: "DeepSeek",
    contextLength: 163840,
    capabilities: {
      vision: false,
      largeContextWindow: false,
      webSearch: false,
      structuredOutput: true,
      reasoning: true,
    },
    deprecated: {
      replacement: "deepseek-v4-flash",
      note: "Superseded by the DeepSeek v4 generation. Switch to DeepSeek v4 Flash.",
    },
  },
  "deepseek-chat-v3": {
    company: "DeepSeek",
    contextLength: 163840,
    capabilities: {
      vision: false,
      largeContextWindow: false,
      webSearch: false,
      structuredOutput: true,
      reasoning: false,
    },
    deprecated: {
      replacement: "deepseek-v4-flash",
      note: "Retired by OpenRouter. Switch to DeepSeek v4 Flash.",
    },
  },
  "deepseek-coder-v2": {
    company: "DeepSeek",
    contextLength: 128000,
    capabilities: {
      vision: false,
      largeContextWindow: false,
      webSearch: false,
      structuredOutput: false,
      reasoning: false,
    },
    deprecated: {
      replacement: "deepseek-v4-flash",
      note: "Retired by OpenRouter; dedicated coder line discontinued. Switch to DeepSeek v4 Flash.",
    },
  },
  "deepseek-coder-v2-lite": {
    company: "DeepSeek",
    contextLength: 128000,
    capabilities: {
      vision: false,
      largeContextWindow: false,
      webSearch: false,
      structuredOutput: false,
      reasoning: false,
    },
    deprecated: {
      replacement: "deepseek-v4-flash",
      note: "Retired by OpenRouter; dedicated coder line discontinued. Switch to DeepSeek v4 Flash.",
    },
  },
  "deepseek-v3.2": {
    company: "DeepSeek",
    contextLength: 131072,
    capabilities: {
      vision: false,
      largeContextWindow: false,
      webSearch: false,
      structuredOutput: true,
      reasoning: true,
    },
    deprecated: {
      replacement: "deepseek-v4-flash",
      note: "Superseded by the DeepSeek v4 generation. Switch to DeepSeek v4 Flash.",
    },
  },
  "deepseek-v4-flash": {
    company: "DeepSeek",
    contextLength: 1048576,
    capabilities: {
      vision: false,
      largeContextWindow: true,
      webSearch: false,
      structuredOutput: true,
      reasoning: true,
    },
  },
  "deepseek-v4-pro": {
    company: "DeepSeek",
    contextLength: 1048576,
    capabilities: {
      vision: false,
      largeContextWindow: true,
      webSearch: false,
      structuredOutput: true,
      reasoning: true,
    },
  },
  "deepseek-r1-0528": {
    company: "DeepSeek",
    contextLength: 163840,
    capabilities: {
      vision: false,
      largeContextWindow: false,
      webSearch: false,
      structuredOutput: true,
      reasoning: true,
    },
    deprecated: {
      replacement: "deepseek-v4-pro",
      note: "Superseded by the DeepSeek v4 generation (native reasoning). Switch to DeepSeek v4 Pro.",
    },
  },
  "qwen-2.5-7b-instruct": {
    company: "Qwen",
    contextLength: 131072,
    capabilities: {
      vision: false,
      largeContextWindow: false,
      webSearch: false,
      structuredOutput: true,
      reasoning: false,
    },
    deprecated: {
      replacement: "qwen3.5-9b",
      note: "Superseded by the current Qwen generation. Switch to Qwen3.5 9B.",
    },
  },
  "qwen-2.5-72b-instruct": {
    company: "Qwen",
    contextLength: 131072,
    capabilities: {
      vision: false,
      largeContextWindow: false,
      webSearch: false,
      structuredOutput: true,
      reasoning: false,
    },
    deprecated: {
      replacement: "qwen3.6-27b",
      note: "Superseded by the current Qwen generation. Switch to Qwen3.6 27B.",
    },
  },
  "qwen-2.5-0.5b-instruct": {
    company: "Qwen",
    contextLength: 32768,
    capabilities: {
      vision: false,
      largeContextWindow: false,
      webSearch: false,
      structuredOutput: false,
      reasoning: false,
    },
    deprecated: {
      replacement: "qwen3.5-9b",
      note: "Retired by OpenRouter. Switch to Qwen3.5 9B.",
    },
  },
  "qwen-2.5-1.5b-instruct": {
    company: "Qwen",
    contextLength: 32768,
    capabilities: {
      vision: false,
      largeContextWindow: false,
      webSearch: false,
      structuredOutput: false,
      reasoning: false,
    },
    deprecated: {
      replacement: "qwen3.5-9b",
      note: "Retired by OpenRouter. Switch to Qwen3.5 9B.",
    },
  },
  "qwen-2.5-3b-instruct": {
    company: "Qwen",
    contextLength: 32768,
    capabilities: {
      vision: false,
      largeContextWindow: false,
      webSearch: false,
      structuredOutput: false,
      reasoning: false,
    },
    deprecated: {
      replacement: "qwen3.5-9b",
      note: "Retired by OpenRouter. Switch to Qwen3.5 9B.",
    },
  },
  "qwen-2.5-14b-instruct": {
    company: "Qwen",
    contextLength: 131072,
    capabilities: {
      vision: false,
      largeContextWindow: false,
      webSearch: false,
      structuredOutput: false,
      reasoning: false,
    },
    deprecated: {
      replacement: "qwen3.6-27b",
      note: "Retired by OpenRouter. Switch to Qwen3.6 27B.",
    },
  },
  "qwen-2.5-32b-instruct": {
    company: "Qwen",
    contextLength: 131072,
    capabilities: {
      vision: false,
      largeContextWindow: false,
      webSearch: false,
      structuredOutput: false,
      reasoning: false,
    },
    deprecated: {
      replacement: "qwen3.6-27b",
      note: "Retired by OpenRouter. Switch to Qwen3.6 27B.",
    },
  },
  "qwen3-8b": {
    company: "Qwen",
    contextLength: 131072,
    capabilities: {
      vision: false,
      largeContextWindow: false,
      webSearch: false,
      structuredOutput: false,
      reasoning: true,
    },
    deprecated: {
      replacement: "qwen3.5-9b",
      note: "Superseded by the current Qwen generation. Switch to Qwen3.5 9B.",
    },
  },
  "qwen3-14b": {
    company: "Qwen",
    contextLength: 131702,
    capabilities: {
      vision: false,
      largeContextWindow: false,
      webSearch: false,
      structuredOutput: true,
      reasoning: true,
    },
    deprecated: {
      replacement: "qwen3.6-27b",
      note: "Superseded by the current Qwen generation. Switch to Qwen3.6 27B.",
    },
  },
  "qwen3-32b": {
    company: "Qwen",
    contextLength: 131072,
    capabilities: {
      vision: false,
      largeContextWindow: false,
      webSearch: false,
      structuredOutput: true,
      reasoning: true,
    },
    deprecated: {
      replacement: "qwen3.6-27b",
      note: "Superseded by the current Qwen generation. Switch to Qwen3.6 27B.",
    },
  },
  "qwen3-max": {
    company: "Qwen",
    contextLength: 262144,
    capabilities: {
      vision: false,
      largeContextWindow: true,
      webSearch: false,
      structuredOutput: true,
      reasoning: false,
    },
    deprecated: {
      replacement: "qwen3.7-max",
      note: "Superseded by the current Qwen generation. Switch to Qwen3.7 Max.",
    },
  },
  "qwen3-coder": {
    company: "Qwen",
    contextLength: 1048576,
    capabilities: {
      vision: false,
      largeContextWindow: true,
      webSearch: false,
      structuredOutput: true,
      reasoning: false,
    },
  },
  "command-r": {
    company: "Cohere",
    contextLength: 128000,
    capabilities: {
      vision: false,
      largeContextWindow: false,
      webSearch: false,
      structuredOutput: true,
      reasoning: false,
    },
  },
  "command-r-plus": {
    company: "Cohere",
    contextLength: 128000,
    capabilities: {
      vision: false,
      largeContextWindow: false,
      webSearch: false,
      structuredOutput: true,
      reasoning: false,
    },
  },
  "command-r7b-08-2024": {
    company: "Cohere",
    contextLength: 128000,
    capabilities: {
      vision: false,
      largeContextWindow: false,
      webSearch: false,
      structuredOutput: true,
      reasoning: false,
    },
  },
  "command-a": {
    company: "Cohere",
    contextLength: 256000,
    capabilities: {
      vision: false,
      largeContextWindow: true,
      webSearch: false,
      structuredOutput: true,
      reasoning: false,
    },
  },
  "gemini-2-5-pro": {
    company: "Google",
    contextLength: 1048576,
    capabilities: {
      vision: true,
      largeContextWindow: true,
      webSearch: true,
      structuredOutput: true,
      reasoning: true,
    },
    deprecated: {
      replacement: "gemini-3.1-pro-preview",
      note: "Superseded by the current Gemini generation. Switch to Gemini 3.1 Pro Preview.",
    },
  },
  "gemini-2-5-flash": {
    company: "Google",
    contextLength: 1048576,
    capabilities: {
      vision: true,
      largeContextWindow: true,
      webSearch: true,
      structuredOutput: true,
      reasoning: true,
    },
    deprecated: {
      replacement: "gemini-3.5-flash",
      note: "Superseded by the current Gemini generation. Switch to Gemini 3.5 Flash.",
    },
  },
  "gemini-2-5-flash-lite": {
    company: "Google",
    contextLength: 1048576,
    capabilities: {
      vision: true,
      largeContextWindow: true,
      webSearch: true,
      structuredOutput: true,
      reasoning: true,
    },
    deprecated: {
      replacement: "gemini-3.1-flash-lite",
      note: "Superseded by the current Gemini generation. Switch to Gemini 3.1 Flash Lite.",
    },
  },
  "gemma-2-27b": {
    company: "Google",
    contextLength: 8192,
    capabilities: {
      vision: false,
      largeContextWindow: false,
      webSearch: false,
      structuredOutput: true,
      reasoning: false,
    },
    deprecated: {
      replacement: "gemma-4-31b-it",
      note: "Superseded by the current Gemma generation. Switch to Gemma 4 31B.",
    },
  },
  "gemma-3": {
    company: "Google",
    contextLength: 131072,
    capabilities: {
      vision: true,
      largeContextWindow: false,
      webSearch: false,
      structuredOutput: true,
      reasoning: false,
    },
    deprecated: {
      replacement: "gemma-4-31b-it",
      note: "Superseded by the current Gemma generation. Switch to Gemma 4 31B.",
    },
  },
  "code-gemma": {
    company: "Google",
    contextLength: 131072,
    capabilities: {
      vision: true,
      largeContextWindow: false,
      webSearch: false,
      structuredOutput: true,
      reasoning: false,
    },
    deprecated: {
      replacement: "gemma-4-26b-a4b-it",
      note: "Superseded by the current Gemma generation (no dedicated CodeGemma model remains). Switch to Gemma 4 26B A4B.",
    },
  },
  "gemini-3-pro-preview": {
    company: "Google",
    contextLength: 1048576,
    capabilities: {
      vision: true,
      largeContextWindow: true,
      webSearch: true,
      structuredOutput: true,
      reasoning: true,
    },
    deprecated: {
      replacement: "gemini-3.1-pro-preview",
      note: "Retired by OpenRouter. Switch to Gemini 3.1 Pro Preview.",
    },
  },
  "gemma-2-9b": {
    company: "Google",
    contextLength: 8192,
    capabilities: {
      vision: false,
      largeContextWindow: false,
      webSearch: false,
      structuredOutput: true,
      reasoning: false,
    },
    deprecated: {
      replacement: "gemma-4-31b-it",
      note: "Retired by OpenRouter. Switch to Gemma 4 31B.",
    },
  },
  "gemini-3.1-pro-preview": {
    company: "Google",
    contextLength: 1048576,
    capabilities: {
      vision: true,
      largeContextWindow: true,
      webSearch: true,
      structuredOutput: true,
      reasoning: true,
    },
  },
  "gemini-3-flash-preview": {
    company: "Google",
    contextLength: 1048576,
    capabilities: {
      vision: true,
      largeContextWindow: true,
      webSearch: true,
      structuredOutput: true,
      reasoning: true,
    },
  },
  "gemini-3.1-flash-lite": {
    company: "Google",
    contextLength: 1048576,
    capabilities: {
      vision: true,
      largeContextWindow: true,
      webSearch: true,
      structuredOutput: true,
      reasoning: true,
    },
  },
  "gemini-3.5-flash": {
    company: "Google",
    contextLength: 1048576,
    capabilities: {
      vision: true,
      largeContextWindow: true,
      webSearch: true,
      structuredOutput: true,
      reasoning: true,
    },
  },
  "gemma-4-31b-it": {
    company: "Google",
    contextLength: 262144,
    capabilities: {
      vision: true,
      largeContextWindow: true,
      webSearch: false,
      structuredOutput: true,
      reasoning: true,
    },
  },
  "gemma-4-26b-a4b-it": {
    company: "Google",
    contextLength: 262144,
    capabilities: {
      vision: true,
      largeContextWindow: true,
      webSearch: false,
      structuredOutput: true,
      reasoning: true,
    },
  },
  "sonar-pro-search": {
    company: "Perplexity",
    contextLength: 200000,
    capabilities: {
      vision: true,
      largeContextWindow: true,
      webSearch: true,
      structuredOutput: true,
      reasoning: true,
    },
  },
  "ministral-14b-latest": {
    company: "Mistral",
    contextLength: 262144,
    capabilities: {
      vision: true,
      largeContextWindow: true,
      webSearch: false,
      structuredOutput: true,
      reasoning: false,
    },
  },
  "ministral-8b-latest": {
    company: "Mistral",
    contextLength: 262144,
    capabilities: {
      vision: true,
      largeContextWindow: true,
      webSearch: false,
      structuredOutput: true,
      reasoning: false,
    },
  },
  "ministral-3b-latest": {
    company: "Mistral",
    contextLength: 131072,
    capabilities: {
      vision: true,
      largeContextWindow: false,
      webSearch: false,
      structuredOutput: true,
      reasoning: false,
    },
  },
  "qwen3.5-9b": {
    company: "Qwen",
    contextLength: 262144,
    capabilities: {
      vision: true,
      largeContextWindow: true,
      webSearch: false,
      structuredOutput: true,
      reasoning: true,
    },
  },
  "qwen3.6-27b": {
    company: "Qwen",
    contextLength: 262144,
    capabilities: {
      vision: true,
      largeContextWindow: true,
      webSearch: false,
      structuredOutput: true,
      reasoning: true,
    },
  },
  "qwen3.6-35b-a3b": {
    company: "Qwen",
    contextLength: 262144,
    capabilities: {
      vision: true,
      largeContextWindow: true,
      webSearch: false,
      structuredOutput: true,
      reasoning: true,
    },
  },
  "qwen3.7-max": {
    company: "Qwen",
    contextLength: 1000000,
    capabilities: {
      vision: false,
      largeContextWindow: true,
      webSearch: false,
      structuredOutput: true,
      reasoning: true,
    },
  },
  "qwen3.7-plus": {
    company: "Qwen",
    contextLength: 1000000,
    capabilities: {
      vision: true,
      largeContextWindow: true,
      webSearch: false,
      structuredOutput: true,
      reasoning: true,
    },
  },
  "qwen3-coder-next": {
    company: "Qwen",
    contextLength: 262144,
    capabilities: {
      vision: false,
      largeContextWindow: true,
      webSearch: false,
      structuredOutput: true,
      reasoning: false,
    },
  },
  "north-mini-code": {
    company: "Cohere",
    contextLength: 256000,
    capabilities: {
      vision: false,
      largeContextWindow: true,
      webSearch: false,
      structuredOutput: false,
      reasoning: true,
    },
  },
};

export const isVisionCapable = (model: AIModel): boolean =>
  AIModelMeta[model]?.capabilities.vision ?? false;

export const hasLargeContextWindow = (model: AIModel): boolean =>
  AIModelMeta[model]?.capabilities.largeContextWindow ?? false;

export const hasWebSearch = (model: AIModel): boolean =>
  AIModelMeta[model]?.capabilities.webSearch ?? false;

export const hasStructuredOutput = (model: AIModel): boolean =>
  AIModelMeta[model]?.capabilities.structuredOutput ?? false;

export const hasReasoning = (model: AIModel): boolean =>
  AIModelMeta[model]?.capabilities.reasoning ?? false;

export const isDeprecated = (model: AIModel): boolean =>
  Boolean(AIModelMeta[model]?.deprecated);

export const getDeprecationInfo = (model: AIModel) =>
  AIModelMeta[model]?.deprecated ?? null;

export const getModelCompany = (model: AIModel): ModelCompany =>
  AIModelMeta[model]?.company ?? "OpenAI";

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

export const WorkflowInputTypeToLabel: Record<
  WorkflowInputType | string,
  string
> = {
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
