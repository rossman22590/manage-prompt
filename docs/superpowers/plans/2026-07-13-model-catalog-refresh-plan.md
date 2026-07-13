# Model Catalog Refresh & Capability Display Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers-extended-cc:subagent-driven-development (recommended) or superpowers-extended-cc:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refresh the curated OpenRouter model catalog with the current lineup (dropping 27 stale mappings, adding 41 current models), replace the three hand-maintained capability `Set`s with a single `AIModelMeta` record driven by real OpenRouter data, and make Structured Output + Reasoning Effort real, usable Workflow options.

**Architecture:** `data/workflow.ts` keeps `AIModelToLabel`/`modelToProviderId` as the identity source of truth (every existing key preserved, none renamed or removed) and gains a new `AIModelMeta` record (company, context length, capability flags, deprecation info) that replaces the three old `Set`s. `workflow-model-settings.tsx` and `workflow-form.tsx` read from the new helpers instead of hardcoded logic. `lib/utils/ai.ts` gains structured-output and reasoning-effort execution paths. A new dev-only script lets a human re-sync the catalog later.

**Tech Stack:** Next.js 15 / TypeScript / Zod / `@openrouter/ai-sdk-provider` + `ai` (Vercel AI SDK v5) / Radix Select. No test runner is configured in this repo (no jest/vitest) — verification is `npx tsc --noEmit`, `npx biome check .`, and manual browser walkthroughs via the dev server, consistent with how the rest of this codebase is verified.

**User decisions (already made):**
- Keep billing flat (1 credit = 100 tokens for every model) — no per-model pricing or margin logic, and no price is displayed anywhere in the UI.
- Retired models are marked `deprecated` and kept in the map forever (existing workflows must keep working) — shown in a collapsed, warning-flagged group at the bottom of the picker, not deleted.
- Model catalog data is refreshed via a manually-run script, not fetched live at runtime — no new runtime dependency on OpenRouter's API being reachable.

---

## Before you start: source data

This plan's model list was generated from OpenRouter's live `/api/v1/models` response, pulled 2026-07-13. Every provider id below was verified to exist in that response at plan-writing time (or explicitly marked `deprecated` because it did not). Task 1's code blocks are the direct output of that verification — paste them as given, don't re-derive them.

---

### Task 1: Refresh the model catalog data (`data/workflow.ts`)

**Goal:** Replace the model identity + capability section of `data/workflow.ts` with the refreshed catalog (111 total model keys: 89 active, 22 deprecated) and a single `AIModelMeta` source of truth, while keeping every existing exported symbol name working for current call sites.

**Files:**
- Modify: `data/workflow.ts:1-267` (everything from `export type AIProvider` through `hasWebSearch`'s closing brace — leave `modelHasInstruction` at line 269 and everything after it untouched)

**Acceptance Criteria:**
- [ ] Every one of the 70 original `AIModel` keys still exists in `AIModelToLabel` and `modelToProviderId` (none renamed or removed)
- [ ] 41 new model keys added across the same 10 companies already represented (no new companies)
- [ ] `AIModelMeta` has exactly one entry per `AIModel` key (111 total), each with `company`, `contextLength`, `capabilities`, and `deprecated` where applicable
- [ ] `isVisionCapable`, `hasLargeContextWindow`, `hasWebSearch` keep their exact existing function signatures (`(model: AIModel) => boolean`) so `workflow-form.tsx` and `workflow-model-settings.tsx` keep compiling unchanged until Tasks 3/4 update them
- [ ] New exports: `hasStructuredOutput`, `hasReasoning`, `isDeprecated`, `getDeprecationInfo`, `getModelCompany`, plus `ModelCompany`/`ModelCapabilities`/`ModelMeta` types
- [ ] `npx tsc --noEmit` passes with no new errors

**Verify:** `npx tsc --noEmit` → no errors mentioning `data/workflow.ts`

**Steps:**

- [ ] **Step 1: Replace lines 1-267 of `data/workflow.ts`** with the following (this is real, generated data — every provider id was checked against OpenRouter's live catalog on 2026-07-13):

```typescript
export type AIProvider = "openrouter";

export const AIModelToLabel = {
  // OpenAI
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
  "o1": "o1",
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
  "o3": "o3",

  // Anthropic
  "claude-sonnet-4.5": "Claude Sonnet 4.5",
  "claude-opus-4.5": "Claude Opus 4.5",
  "claude-haiku-4.5": "Claude Haiku 4.5",
  "claude-opus-4.6": "Claude Opus 4.6",
  "claude-opus-4.7": "Claude Opus 4.7",
  "claude-opus-4.8": "Claude Opus 4.8",
  "claude-sonnet-4.6": "Claude Sonnet 4.6",
  "claude-sonnet-5": "Claude Sonnet 5",
  "claude-fable-5": "Claude Fable 5",

  // xAI
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

  // Perplexity
  "sonar": "Perplexity Sonar",
  "sonar-pro": "Perplexity Sonar Pro",
  "sonar-reasoning-pro": "Perplexity Sonar Reasoning Pro",
  "sonar-reasoning": "Perplexity Sonar Reasoning",
  "sonar-deep-research": "Perplexity Sonar Deep Research",

  // Meta / Llama
  "llama-3.1-8b-instant": "Llama 3.1 8B Instant",
  "llama-3.2-1b-preview": "Llama 3.2 1B Preview",
  "llama-3.2-3b-preview": "Llama 3.2 3B Preview",
  "llama-3.3-70b-versatile": "Llama 3.3 70B Versatile",
  "llama3-8b-8192": "Llama 3 8B 8192",
  "llama3-70b-8192": "Llama 3 70B 8192",
  "llama-4-scout": "Llama 4 Scout",
  "llama-4-maverick": "Llama 4 Maverick",

  // Mistral
  "mistral-large-latest": "Mistral Large",
  "mistral-small-latest": "Mistral Small",
  "mixtral-8x7b-32768": "Mixtral 8x7B",
  "pixtral-12b-2409": "Pixtral 12B",
  "mistral-medium-3.5": "Mistral Medium 3.5",

  // DeepSeek
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

  // Qwen
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

  // Cohere
  "command-r": "Command R",
  "command-r-plus": "Command R+",
  "command-r7b-08-2024": "Command R7B",
  "command-a": "Command A",

  // Google
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
  "o1": "openai/o1",
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
  "o3": "openai/o3",
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
  "sonar": "perplexity/sonar",
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
  "gpt-3.5-turbo": { company: "OpenAI", contextLength: 16385, capabilities: { vision: false, largeContextWindow: false, webSearch: false, structuredOutput: true, reasoning: false } },
  "gpt-4": { company: "OpenAI", contextLength: 8191, capabilities: { vision: false, largeContextWindow: false, webSearch: false, structuredOutput: true, reasoning: false } },
  "gpt-4-turbo": { company: "OpenAI", contextLength: 128000, capabilities: { vision: true, largeContextWindow: false, webSearch: false, structuredOutput: true, reasoning: false } },
  "gpt-4o": { company: "OpenAI", contextLength: 128000, capabilities: { vision: true, largeContextWindow: false, webSearch: false, structuredOutput: true, reasoning: false } },
  "gpt-4o-mini": { company: "OpenAI", contextLength: 128000, capabilities: { vision: true, largeContextWindow: false, webSearch: false, structuredOutput: true, reasoning: false } },
  "gpt-4.1": { company: "OpenAI", contextLength: 1047576, capabilities: { vision: true, largeContextWindow: true, webSearch: false, structuredOutput: true, reasoning: false } },
  "gpt-4.1-mini": { company: "OpenAI", contextLength: 1047576, capabilities: { vision: true, largeContextWindow: true, webSearch: false, structuredOutput: true, reasoning: false } },
  "gpt-4.1-nano": { company: "OpenAI", contextLength: 1047576, capabilities: { vision: true, largeContextWindow: true, webSearch: false, structuredOutput: true, reasoning: false } },
  "gpt-4.5": { company: "OpenAI", contextLength: 1047576, capabilities: { vision: true, largeContextWindow: true, webSearch: false, structuredOutput: true, reasoning: false } },
  "gpt-5": { company: "OpenAI", contextLength: 400000, capabilities: { vision: true, largeContextWindow: true, webSearch: true, structuredOutput: true, reasoning: true } },
  "gpt-5-pro": { company: "OpenAI", contextLength: 400000, capabilities: { vision: true, largeContextWindow: true, webSearch: true, structuredOutput: true, reasoning: true } },
  "gpt-5.2": { company: "OpenAI", contextLength: 400000, capabilities: { vision: true, largeContextWindow: true, webSearch: true, structuredOutput: true, reasoning: true } },
  "gpt-5.2-chat": { company: "OpenAI", contextLength: 128000, capabilities: { vision: true, largeContextWindow: false, webSearch: true, structuredOutput: true, reasoning: false } },
  "gpt-5.2-pro": { company: "OpenAI", contextLength: 400000, capabilities: { vision: true, largeContextWindow: true, webSearch: true, structuredOutput: true, reasoning: true } },
  "o1": { company: "OpenAI", contextLength: 200000, capabilities: { vision: true, largeContextWindow: true, webSearch: false, structuredOutput: true, reasoning: true } },
  "o1-mini": { company: "OpenAI", contextLength: 200000, capabilities: { vision: true, largeContextWindow: true, webSearch: false, structuredOutput: true, reasoning: true } },
  "o1-preview": { company: "OpenAI", contextLength: 200000, capabilities: { vision: true, largeContextWindow: true, webSearch: false, structuredOutput: true, reasoning: true } },
  "o3-mini": { company: "OpenAI", contextLength: 200000, capabilities: { vision: false, largeContextWindow: true, webSearch: false, structuredOutput: true, reasoning: true } },
  "o3-pro": { company: "OpenAI", contextLength: 200000, capabilities: { vision: true, largeContextWindow: true, webSearch: false, structuredOutput: true, reasoning: true } },
  "o4-mini": { company: "OpenAI", contextLength: 200000, capabilities: { vision: true, largeContextWindow: true, webSearch: false, structuredOutput: true, reasoning: true } },
  "gpt-oss-120b": { company: "OpenAI", contextLength: 131072, capabilities: { vision: false, largeContextWindow: false, webSearch: false, structuredOutput: true, reasoning: true } },
  "gpt-oss-20b": { company: "OpenAI", contextLength: 131072, capabilities: { vision: false, largeContextWindow: false, webSearch: false, structuredOutput: true, reasoning: true } },
  "gpt-5.4": { company: "OpenAI", contextLength: 1050000, capabilities: { vision: true, largeContextWindow: true, webSearch: true, structuredOutput: true, reasoning: true } },
  "gpt-5.4-mini": { company: "OpenAI", contextLength: 400000, capabilities: { vision: true, largeContextWindow: true, webSearch: false, structuredOutput: true, reasoning: true } },
  "gpt-5.4-nano": { company: "OpenAI", contextLength: 400000, capabilities: { vision: true, largeContextWindow: true, webSearch: false, structuredOutput: true, reasoning: true } },
  "gpt-5.4-pro": { company: "OpenAI", contextLength: 1050000, capabilities: { vision: true, largeContextWindow: true, webSearch: true, structuredOutput: true, reasoning: true } },
  "gpt-5.5": { company: "OpenAI", contextLength: 1050000, capabilities: { vision: true, largeContextWindow: true, webSearch: true, structuredOutput: true, reasoning: true } },
  "gpt-5.5-pro": { company: "OpenAI", contextLength: 1050000, capabilities: { vision: true, largeContextWindow: true, webSearch: true, structuredOutput: true, reasoning: true } },
  "gpt-5.6-luna": { company: "OpenAI", contextLength: 1050000, capabilities: { vision: true, largeContextWindow: true, webSearch: true, structuredOutput: true, reasoning: true } },
  "gpt-5.6-luna-pro": { company: "OpenAI", contextLength: 1050000, capabilities: { vision: true, largeContextWindow: true, webSearch: true, structuredOutput: true, reasoning: true } },
  "gpt-5.6-terra": { company: "OpenAI", contextLength: 1050000, capabilities: { vision: true, largeContextWindow: true, webSearch: true, structuredOutput: true, reasoning: true } },
  "gpt-5.6-terra-pro": { company: "OpenAI", contextLength: 1050000, capabilities: { vision: true, largeContextWindow: true, webSearch: true, structuredOutput: true, reasoning: true } },
  "gpt-5.6-sol": { company: "OpenAI", contextLength: 1050000, capabilities: { vision: true, largeContextWindow: true, webSearch: true, structuredOutput: true, reasoning: true } },
  "gpt-5.6-sol-pro": { company: "OpenAI", contextLength: 1050000, capabilities: { vision: true, largeContextWindow: true, webSearch: true, structuredOutput: true, reasoning: true } },
  "o3": { company: "OpenAI", contextLength: 200000, capabilities: { vision: true, largeContextWindow: true, webSearch: false, structuredOutput: true, reasoning: true } },

  "claude-sonnet-4.5": { company: "Anthropic", contextLength: 1000000, capabilities: { vision: true, largeContextWindow: true, webSearch: false, structuredOutput: true, reasoning: true } },
  "claude-opus-4.5": { company: "Anthropic", contextLength: 200000, capabilities: { vision: true, largeContextWindow: true, webSearch: false, structuredOutput: true, reasoning: true } },
  "claude-haiku-4.5": { company: "Anthropic", contextLength: 200000, capabilities: { vision: true, largeContextWindow: true, webSearch: false, structuredOutput: true, reasoning: true } },
  "claude-opus-4.6": { company: "Anthropic", contextLength: 1000000, capabilities: { vision: true, largeContextWindow: true, webSearch: false, structuredOutput: true, reasoning: true } },
  "claude-opus-4.7": { company: "Anthropic", contextLength: 1000000, capabilities: { vision: true, largeContextWindow: true, webSearch: false, structuredOutput: true, reasoning: true } },
  "claude-opus-4.8": { company: "Anthropic", contextLength: 1000000, capabilities: { vision: true, largeContextWindow: true, webSearch: false, structuredOutput: true, reasoning: true } },
  "claude-sonnet-4.6": { company: "Anthropic", contextLength: 1000000, capabilities: { vision: true, largeContextWindow: true, webSearch: false, structuredOutput: true, reasoning: true } },
  "claude-sonnet-5": { company: "Anthropic", contextLength: 1000000, capabilities: { vision: true, largeContextWindow: true, webSearch: false, structuredOutput: true, reasoning: true } },
  "claude-fable-5": { company: "Anthropic", contextLength: 1000000, capabilities: { vision: true, largeContextWindow: true, webSearch: false, structuredOutput: true, reasoning: true } },

  "grok-3": { company: "xAI", contextLength: 131072, capabilities: { vision: false, largeContextWindow: false, webSearch: false, structuredOutput: true, reasoning: false }, deprecated: { replacement: "grok-4.5", note: "Retired by OpenRouter. Switch to Grok 4.5." } },
  "grok-3-mini": { company: "xAI", contextLength: 131072, capabilities: { vision: false, largeContextWindow: false, webSearch: false, structuredOutput: true, reasoning: true }, deprecated: { replacement: "grok-4.20", note: "Retired by OpenRouter. Switch to Grok 4.20." } },
  "grok-3-beta": { company: "xAI", contextLength: 131072, capabilities: { vision: false, largeContextWindow: false, webSearch: false, structuredOutput: true, reasoning: false }, deprecated: { replacement: "grok-4.5", note: "Retired by OpenRouter. Switch to Grok 4.5." } },
  "grok-4": { company: "xAI", contextLength: 256000, capabilities: { vision: true, largeContextWindow: true, webSearch: false, structuredOutput: true, reasoning: true }, deprecated: { replacement: "grok-4.5", note: "Retired by OpenRouter. Switch to Grok 4.5." } },
  "grok-4-fast": { company: "xAI", contextLength: 2000000, capabilities: { vision: true, largeContextWindow: true, webSearch: false, structuredOutput: true, reasoning: true }, deprecated: { replacement: "grok-4.20", note: "Retired by OpenRouter. Switch to Grok 4.20." } },
  "grok-4.1": { company: "xAI", contextLength: 2000000, capabilities: { vision: true, largeContextWindow: true, webSearch: false, structuredOutput: true, reasoning: true }, deprecated: { replacement: "grok-4.3", note: "Retired by OpenRouter. Switch to Grok 4.3." } },
  "grok-4.1-fast": { company: "xAI", contextLength: 2000000, capabilities: { vision: true, largeContextWindow: true, webSearch: false, structuredOutput: true, reasoning: true }, deprecated: { replacement: "grok-4.20", note: "Retired by OpenRouter. Switch to Grok 4.20." } },
  "grok-4.20": { company: "xAI", contextLength: 2000000, capabilities: { vision: true, largeContextWindow: true, webSearch: false, structuredOutput: true, reasoning: true } },
  "grok-4.3": { company: "xAI", contextLength: 1000000, capabilities: { vision: true, largeContextWindow: true, webSearch: false, structuredOutput: true, reasoning: true } },
  "grok-4.5": { company: "xAI", contextLength: 500000, capabilities: { vision: true, largeContextWindow: true, webSearch: false, structuredOutput: true, reasoning: true } },

  "sonar": { company: "Perplexity", contextLength: 127072, capabilities: { vision: true, largeContextWindow: false, webSearch: true, structuredOutput: false, reasoning: false } },
  "sonar-pro": { company: "Perplexity", contextLength: 200000, capabilities: { vision: true, largeContextWindow: true, webSearch: true, structuredOutput: false, reasoning: false } },
  "sonar-reasoning-pro": { company: "Perplexity", contextLength: 128000, capabilities: { vision: true, largeContextWindow: false, webSearch: true, structuredOutput: false, reasoning: true } },
  "sonar-reasoning": { company: "Perplexity", contextLength: 128000, capabilities: { vision: true, largeContextWindow: false, webSearch: true, structuredOutput: false, reasoning: true }, deprecated: { replacement: "sonar-reasoning-pro", note: "Retired by OpenRouter. Switch to Sonar Reasoning Pro." } },
  "sonar-deep-research": { company: "Perplexity", contextLength: 128000, capabilities: { vision: false, largeContextWindow: false, webSearch: true, structuredOutput: false, reasoning: true } },

  "llama-3.1-8b-instant": { company: "Meta", contextLength: 131072, capabilities: { vision: false, largeContextWindow: false, webSearch: false, structuredOutput: true, reasoning: false } },
  "llama-3.2-1b-preview": { company: "Meta", contextLength: 131072, capabilities: { vision: false, largeContextWindow: false, webSearch: false, structuredOutput: false, reasoning: false } },
  "llama-3.2-3b-preview": { company: "Meta", contextLength: 131072, capabilities: { vision: false, largeContextWindow: false, webSearch: false, structuredOutput: true, reasoning: false } },
  "llama-3.3-70b-versatile": { company: "Meta", contextLength: 131072, capabilities: { vision: false, largeContextWindow: false, webSearch: false, structuredOutput: true, reasoning: false } },
  "llama3-8b-8192": { company: "Meta", contextLength: 8192, capabilities: { vision: false, largeContextWindow: false, webSearch: false, structuredOutput: false, reasoning: false }, deprecated: { replacement: "llama-3.1-8b-instant", note: "Retired by OpenRouter. Switch to Llama 3.1 8B Instant." } },
  "llama3-70b-8192": { company: "Meta", contextLength: 8192, capabilities: { vision: false, largeContextWindow: false, webSearch: false, structuredOutput: false, reasoning: false }, deprecated: { replacement: "llama-3.3-70b-versatile", note: "Retired by OpenRouter. Switch to Llama 3.3 70B Versatile." } },
  "llama-4-scout": { company: "Meta", contextLength: 10000000, capabilities: { vision: true, largeContextWindow: true, webSearch: false, structuredOutput: true, reasoning: false } },
  "llama-4-maverick": { company: "Meta", contextLength: 1048576, capabilities: { vision: true, largeContextWindow: true, webSearch: false, structuredOutput: true, reasoning: false } },

  "mistral-large-latest": { company: "Mistral", contextLength: 262144, capabilities: { vision: true, largeContextWindow: true, webSearch: false, structuredOutput: true, reasoning: false } },
  "mistral-small-latest": { company: "Mistral", contextLength: 262144, capabilities: { vision: true, largeContextWindow: true, webSearch: false, structuredOutput: true, reasoning: true } },
  "mixtral-8x7b-32768": { company: "Mistral", contextLength: 32768, capabilities: { vision: false, largeContextWindow: false, webSearch: false, structuredOutput: false, reasoning: false }, deprecated: { replacement: "mistral-small-latest", note: "Retired by OpenRouter. Switch to Mistral Small." } },
  "pixtral-12b-2409": { company: "Mistral", contextLength: 128000, capabilities: { vision: true, largeContextWindow: false, webSearch: false, structuredOutput: false, reasoning: false }, deprecated: { replacement: "mistral-small-latest", note: "Retired by OpenRouter. Switch to Mistral Small (now vision-capable)." } },
  "mistral-medium-3.5": { company: "Mistral", contextLength: 262144, capabilities: { vision: true, largeContextWindow: true, webSearch: false, structuredOutput: true, reasoning: true } },

  "deepseek-r1-distill-llama-70b": { company: "DeepSeek", contextLength: 128000, capabilities: { vision: false, largeContextWindow: false, webSearch: false, structuredOutput: false, reasoning: true } },
  "deepseek-chat-v3-0324": { company: "DeepSeek", contextLength: 163840, capabilities: { vision: false, largeContextWindow: false, webSearch: false, structuredOutput: true, reasoning: false } },
  "deepseek-chat-v3.1": { company: "DeepSeek", contextLength: 163840, capabilities: { vision: false, largeContextWindow: false, webSearch: false, structuredOutput: true, reasoning: true } },
  "deepseek-chat-v3": { company: "DeepSeek", contextLength: 163840, capabilities: { vision: false, largeContextWindow: false, webSearch: false, structuredOutput: true, reasoning: false }, deprecated: { replacement: "deepseek-v3.2", note: "Retired by OpenRouter. Switch to DeepSeek v3.2." } },
  "deepseek-coder-v2": { company: "DeepSeek", contextLength: 128000, capabilities: { vision: false, largeContextWindow: false, webSearch: false, structuredOutput: false, reasoning: false }, deprecated: { replacement: "deepseek-v4-flash", note: "Retired by OpenRouter; dedicated coder line discontinued. Switch to DeepSeek v4 Flash." } },
  "deepseek-coder-v2-lite": { company: "DeepSeek", contextLength: 128000, capabilities: { vision: false, largeContextWindow: false, webSearch: false, structuredOutput: false, reasoning: false }, deprecated: { replacement: "deepseek-v4-flash", note: "Retired by OpenRouter; dedicated coder line discontinued. Switch to DeepSeek v4 Flash." } },
  "deepseek-v3.2": { company: "DeepSeek", contextLength: 131072, capabilities: { vision: false, largeContextWindow: false, webSearch: false, structuredOutput: true, reasoning: true } },
  "deepseek-v4-flash": { company: "DeepSeek", contextLength: 1048576, capabilities: { vision: false, largeContextWindow: true, webSearch: false, structuredOutput: true, reasoning: true } },
  "deepseek-v4-pro": { company: "DeepSeek", contextLength: 1048576, capabilities: { vision: false, largeContextWindow: true, webSearch: false, structuredOutput: true, reasoning: true } },
  "deepseek-r1-0528": { company: "DeepSeek", contextLength: 163840, capabilities: { vision: false, largeContextWindow: false, webSearch: false, structuredOutput: true, reasoning: true } },

  "qwen-2.5-7b-instruct": { company: "Qwen", contextLength: 131072, capabilities: { vision: false, largeContextWindow: false, webSearch: false, structuredOutput: true, reasoning: false } },
  "qwen-2.5-72b-instruct": { company: "Qwen", contextLength: 131072, capabilities: { vision: false, largeContextWindow: false, webSearch: false, structuredOutput: true, reasoning: false } },
  "qwen-2.5-0.5b-instruct": { company: "Qwen", contextLength: 32768, capabilities: { vision: false, largeContextWindow: false, webSearch: false, structuredOutput: false, reasoning: false }, deprecated: { replacement: "qwen3-8b", note: "Retired by OpenRouter. Switch to Qwen3 8B." } },
  "qwen-2.5-1.5b-instruct": { company: "Qwen", contextLength: 32768, capabilities: { vision: false, largeContextWindow: false, webSearch: false, structuredOutput: false, reasoning: false }, deprecated: { replacement: "qwen3-8b", note: "Retired by OpenRouter. Switch to Qwen3 8B." } },
  "qwen-2.5-3b-instruct": { company: "Qwen", contextLength: 32768, capabilities: { vision: false, largeContextWindow: false, webSearch: false, structuredOutput: false, reasoning: false }, deprecated: { replacement: "qwen3-8b", note: "Retired by OpenRouter. Switch to Qwen3 8B." } },
  "qwen-2.5-14b-instruct": { company: "Qwen", contextLength: 131072, capabilities: { vision: false, largeContextWindow: false, webSearch: false, structuredOutput: false, reasoning: false }, deprecated: { replacement: "qwen3-14b", note: "Retired by OpenRouter. Switch to Qwen3 14B." } },
  "qwen-2.5-32b-instruct": { company: "Qwen", contextLength: 131072, capabilities: { vision: false, largeContextWindow: false, webSearch: false, structuredOutput: false, reasoning: false }, deprecated: { replacement: "qwen3-32b", note: "Retired by OpenRouter. Switch to Qwen3 32B." } },
  "qwen3-8b": { company: "Qwen", contextLength: 131072, capabilities: { vision: false, largeContextWindow: false, webSearch: false, structuredOutput: false, reasoning: true } },
  "qwen3-14b": { company: "Qwen", contextLength: 131702, capabilities: { vision: false, largeContextWindow: false, webSearch: false, structuredOutput: true, reasoning: true } },
  "qwen3-32b": { company: "Qwen", contextLength: 131072, capabilities: { vision: false, largeContextWindow: false, webSearch: false, structuredOutput: true, reasoning: true } },
  "qwen3-max": { company: "Qwen", contextLength: 262144, capabilities: { vision: false, largeContextWindow: true, webSearch: false, structuredOutput: true, reasoning: false } },
  "qwen3-coder": { company: "Qwen", contextLength: 1048576, capabilities: { vision: false, largeContextWindow: true, webSearch: false, structuredOutput: true, reasoning: false } },

  "command-r": { company: "Cohere", contextLength: 128000, capabilities: { vision: false, largeContextWindow: false, webSearch: false, structuredOutput: true, reasoning: false } },
  "command-r-plus": { company: "Cohere", contextLength: 128000, capabilities: { vision: false, largeContextWindow: false, webSearch: false, structuredOutput: true, reasoning: false } },
  "command-r7b-08-2024": { company: "Cohere", contextLength: 128000, capabilities: { vision: false, largeContextWindow: false, webSearch: false, structuredOutput: true, reasoning: false } },
  "command-a": { company: "Cohere", contextLength: 256000, capabilities: { vision: false, largeContextWindow: true, webSearch: false, structuredOutput: true, reasoning: false } },

  "gemini-2-5-pro": { company: "Google", contextLength: 1048576, capabilities: { vision: true, largeContextWindow: true, webSearch: true, structuredOutput: true, reasoning: true } },
  "gemini-2-5-flash": { company: "Google", contextLength: 1048576, capabilities: { vision: true, largeContextWindow: true, webSearch: true, structuredOutput: true, reasoning: true } },
  "gemini-2-5-flash-lite": { company: "Google", contextLength: 1048576, capabilities: { vision: true, largeContextWindow: true, webSearch: true, structuredOutput: true, reasoning: true } },
  "gemma-2-27b": { company: "Google", contextLength: 8192, capabilities: { vision: false, largeContextWindow: false, webSearch: false, structuredOutput: true, reasoning: false } },
  "gemma-3": { company: "Google", contextLength: 131072, capabilities: { vision: true, largeContextWindow: false, webSearch: false, structuredOutput: true, reasoning: false } },
  "code-gemma": { company: "Google", contextLength: 131072, capabilities: { vision: true, largeContextWindow: false, webSearch: false, structuredOutput: true, reasoning: false } },
  "gemini-3-pro-preview": { company: "Google", contextLength: 1048576, capabilities: { vision: true, largeContextWindow: true, webSearch: true, structuredOutput: true, reasoning: true }, deprecated: { replacement: "gemini-3.1-pro-preview", note: "Retired by OpenRouter. Switch to Gemini 3.1 Pro Preview." } },
  "gemma-2-9b": { company: "Google", contextLength: 8192, capabilities: { vision: false, largeContextWindow: false, webSearch: false, structuredOutput: true, reasoning: false }, deprecated: { replacement: "gemma-3", note: "Retired by OpenRouter. Switch to Gemma 3." } },
  "gemini-3.1-pro-preview": { company: "Google", contextLength: 1048576, capabilities: { vision: true, largeContextWindow: true, webSearch: true, structuredOutput: true, reasoning: true } },
  "gemini-3-flash-preview": { company: "Google", contextLength: 1048576, capabilities: { vision: true, largeContextWindow: true, webSearch: true, structuredOutput: true, reasoning: true } },
  "gemini-3.1-flash-lite": { company: "Google", contextLength: 1048576, capabilities: { vision: true, largeContextWindow: true, webSearch: true, structuredOutput: true, reasoning: true } },
  "gemini-3.5-flash": { company: "Google", contextLength: 1048576, capabilities: { vision: true, largeContextWindow: true, webSearch: true, structuredOutput: true, reasoning: true } },
  "gemma-4-31b-it": { company: "Google", contextLength: 262144, capabilities: { vision: true, largeContextWindow: true, webSearch: false, structuredOutput: true, reasoning: true } },
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
```

- [ ] **Step 2: Confirm nothing else in the file changed**

The rest of `data/workflow.ts` (starting at `// The rest of your code remains unchanged` / `export const modelHasInstruction`) must be byte-identical to before this task — this task only replaces the model-catalog section.

- [ ] **Step 3: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors referencing `data/workflow.ts`. (Pre-existing unrelated errors elsewhere in the repo, if any, are not this task's concern — only confirm no *new* errors from this file.)

- [ ] **Step 4: Commit**

```bash
git add data/workflow.ts
git commit -m "Refresh OpenRouter model catalog with current lineup and capability metadata"
```

---

### Task 2: Dev-only catalog sync script

**Goal:** A manually-run script that a human can re-execute later to check the curated catalog against OpenRouter's live models and surface what's changed, without the app ever depending on this at runtime.

**Files:**
- Create: `scripts/sync-openrouter-models.ts`
- Modify: `package.json` (add an `sync-models` script entry)

**Acceptance Criteria:**
- [ ] Running the script prints, for every `modelToProviderId` entry, whether it's still live on OpenRouter
- [ ] For entries already marked `deprecated` in `AIModelMeta`, the script confirms they're still absent (flags it if OpenRouter brought a slug back, so a human can un-deprecate it)
- [ ] For entries NOT marked `deprecated` that are missing live, the script prints a warning (a live model went away since this catalog was written) instead of silently doing nothing
- [ ] For each of the 10 curated companies, the script lists any live OpenRouter model ids under that company's prefix that aren't in `modelToProviderId` yet, for a human to review

**Verify:** `npx tsx scripts/sync-openrouter-models.ts` → prints a report, exits 0

**Steps:**

- [ ] **Step 1: Write the script**

```typescript
// scripts/sync-openrouter-models.ts
// Dev-only tool: re-run manually (npm run sync-models) to check the curated model
// catalog in data/workflow.ts against OpenRouter's live /api/v1/models response.
// This script is never imported or run by the app itself.

import { AIModelMeta, AIModels, modelToProviderId } from "../data/workflow";

const CURATED_COMPANY_PREFIXES: Record<string, string> = {
  OpenAI: "openai/",
  Anthropic: "anthropic/",
  Google: "google/",
  xAI: "x-ai/",
  Perplexity: "perplexity/",
  Meta: "meta-llama/",
  Mistral: "mistralai/",
  DeepSeek: "deepseek/",
  Qwen: "qwen/",
  Cohere: "cohere/",
};

type OpenRouterModel = { id: string };
type OpenRouterModelsResponse = { data: OpenRouterModel[] };

async function main() {
  const res = await fetch("https://openrouter.ai/api/v1/models");
  if (!res.ok) {
    console.error(`Failed to fetch OpenRouter models: HTTP ${res.status}`);
    process.exit(1);
  }
  const body = (await res.json()) as OpenRouterModelsResponse;
  const liveIds = new Set(body.data.map((m) => m.id));

  console.log(`Fetched ${liveIds.size} live models from OpenRouter.\n`);

  console.log("=== Curated model status ===");
  for (const key of AIModels) {
    const providerId = modelToProviderId[key];
    const isLive = liveIds.has(providerId);
    const meta = AIModelMeta[key];
    const alreadyDeprecated = Boolean(meta?.deprecated);

    if (isLive && alreadyDeprecated) {
      console.log(`⚠ ${key} (${providerId}) is marked deprecated but IS live again — consider un-deprecating.`);
    } else if (!isLive && !alreadyDeprecated) {
      console.log(`✗ ${key} (${providerId}) is NOT live and NOT marked deprecated — mark it deprecated.`);
    } else if (!isLive && alreadyDeprecated) {
      console.log(`  ${key} (${providerId}) still deprecated, confirmed absent.`);
    }
    // isLive && !alreadyDeprecated: healthy, nothing to print
  }

  console.log("\n=== New models available per curated company (not yet in the catalog) ===");
  const curatedProviderIds = new Set(Object.values(modelToProviderId));
  for (const [company, prefix] of Object.entries(CURATED_COMPANY_PREFIXES)) {
    const newOnes = [...liveIds].filter(
      (id) => id.startsWith(prefix) && !curatedProviderIds.has(id) && !id.startsWith("~"),
    );
    if (newOnes.length > 0) {
      console.log(`${company}:`);
      newOnes.forEach((id) => console.log(`  ${id}`));
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
```

- [ ] **Step 2: Add a `tsx` devDependency and the `sync-models` script**

`tsx` isn't currently a devDependency (this repo runs TypeScript only through Next.js's own build, no standalone script runner). Install it:

Run: `npm install --save-dev tsx`

Then add this line to `package.json`'s `"scripts"` block (alongside the existing `"lint"` entry):

```json
"sync-models": "tsx scripts/sync-openrouter-models.ts"
```

- [ ] **Step 3: Run it and confirm it reports the catalog as healthy**

Run: `npm run sync-models`
Expected: no `✗` lines (everything not marked deprecated is confirmed live), and the 22 models this plan marked `deprecated` in Task 1 each print as `still deprecated, confirmed absent`.

- [ ] **Step 4: Commit**

```bash
git add scripts/sync-openrouter-models.ts package.json package-lock.json
git commit -m "Add manual OpenRouter catalog sync script"
```

---

### Task 3: Structured Output + Reasoning Effort settings UI

**Goal:** Add "Enable Structured Output" (JSON Schema textarea) and "Reasoning Effort" (select) controls to the Advanced Model Settings panel, shown only for capable models.

**Files:**
- Modify: `components/console/workflow/workflow-model-settings.tsx`

**Acceptance Criteria:**
- [ ] `ModelSettings` type gains `structuredOutputSchema?: string` and `reasoningEffort?: "none" | "low" | "medium" | "high"`
- [ ] The Structured Output toggle + textarea only render when `hasStructuredOutput(model)` is true
- [ ] The Reasoning Effort select only renders when `hasReasoning(model)` is true
- [ ] Invalid JSON typed into the schema textarea shows an inline error and does not call `onChange` with a broken value
- [ ] `npx tsc --noEmit` passes

**Verify:** `npx tsc --noEmit` → no errors; manual check per Step 4 below

**Steps:**

- [ ] **Step 1: Update imports and the `ModelSettings` type**

In `components/console/workflow/workflow-model-settings.tsx`, change:

```typescript
import { hasWebSearch } from "@/data/workflow";
import type { AIModel } from "@/data/workflow";
```

to:

```typescript
import { hasWebSearch, hasStructuredOutput, hasReasoning } from "@/data/workflow";
import type { AIModel } from "@/data/workflow";
```

and change the `ModelSettings` type from:

```typescript
export type ModelSettings = {
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  enableWebSearch?: boolean;
};
```

to:

```typescript
export type ModelSettings = {
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  enableWebSearch?: boolean;
  structuredOutputSchema?: string;
  reasoningEffort?: "none" | "low" | "medium" | "high";
};
```

- [ ] **Step 2: Add local state, near the existing `enableWebSearch` state**

```typescript
  const [structuredOutputEnabled, setStructuredOutputEnabled] = useState(
    Boolean(defaultValue?.structuredOutputSchema),
  );
  const [structuredOutputSchema, setStructuredOutputSchema] = useState(
    defaultValue?.structuredOutputSchema ?? "",
  );
  const [schemaError, setSchemaError] = useState<string | null>(null);
  const [reasoningEffort, setReasoningEffort] = useState<ModelSettings["reasoningEffort"]>(
    defaultValue?.reasoningEffort ?? "none",
  );
```

- [ ] **Step 3: Include the new fields in `triggerChange`'s dependency array and payload**

Change:

```typescript
  const triggerChange = useCallback(
    (val: any) => {
      onChange({
        temperature,
        maxTokens,
        topP,
        frequencyPenalty,
        presencePenalty,
        enableWebSearch,
        ...val,
      });
    },
    [temperature, maxTokens, topP, frequencyPenalty, presencePenalty, enableWebSearch, onChange],
  );
```

to:

```typescript
  const triggerChange = useCallback(
    (val: any) => {
      onChange({
        temperature,
        maxTokens,
        topP,
        frequencyPenalty,
        presencePenalty,
        enableWebSearch,
        structuredOutputSchema: structuredOutputEnabled ? structuredOutputSchema : undefined,
        reasoningEffort,
        ...val,
      });
    },
    [
      temperature,
      maxTokens,
      topP,
      frequencyPenalty,
      presencePenalty,
      enableWebSearch,
      structuredOutputEnabled,
      structuredOutputSchema,
      reasoningEffort,
      onChange,
    ],
  );
```

- [ ] **Step 4: Add the two new controls to the JSX**, right after the existing web-search `Switch` block (which ends with `)}` before the closing `</div>` of `.grid`):

```tsx
          {model && hasStructuredOutput(model) && (
            <div className="flex flex-col space-y-1.5">
              <div className="flex items-center justify-between space-x-2">
                <div className="flex flex-col space-y-1">
                  <Label htmlFor="structured-output">Enable Structured Output</Label>
                  <CardDescription>
                    Force the model to return JSON matching a schema you provide.
                  </CardDescription>
                </div>
                <Switch
                  id="structured-output"
                  checked={structuredOutputEnabled}
                  onCheckedChange={(checked) => {
                    setStructuredOutputEnabled(checked);
                    if (!checked) {
                      setSchemaError(null);
                      triggerChange({ structuredOutputSchema: undefined });
                    }
                  }}
                />
              </div>
              {structuredOutputEnabled && (
                <>
                  <textarea
                    id="structured-output-schema"
                    className="flex min-h-[120px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm font-mono shadow-sm"
                    placeholder='{"type": "object", "properties": {"answer": {"type": "string"}}, "required": ["answer"]}'
                    value={structuredOutputSchema}
                    onChange={(e) => {
                      const value = e.target.value;
                      setStructuredOutputSchema(value);
                      try {
                        JSON.parse(value);
                        setSchemaError(null);
                        triggerChange({ structuredOutputSchema: value });
                      } catch {
                        setSchemaError("Invalid JSON — schema was not saved.");
                      }
                    }}
                  />
                  {schemaError && (
                    <p className="text-sm text-red-500">{schemaError}</p>
                  )}
                </>
              )}
            </div>
          )}

          {model && hasReasoning(model) && (
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="reasoning-effort">Reasoning Effort</Label>
              <Select
                value={reasoningEffort}
                onValueChange={(value: ModelSettings["reasoningEffort"]) => {
                  setReasoningEffort(value);
                  triggerChange({ reasoningEffort: value });
                }}
              >
                <SelectTrigger id="reasoning-effort" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
              <CardDescription>
                Higher effort spends more time reasoning before answering, at higher cost and latency.
              </CardDescription>
            </div>
          )}
```

This uses `Select`/`SelectTrigger`/`SelectValue`/`SelectContent`/`SelectItem` from `../../ui/select` — add that import alongside the existing `Card`/`Input`/`Label`/`Slider`/`Switch` imports at the top of the file:

```typescript
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
```

- [ ] **Step 5: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors referencing `workflow-model-settings.tsx`

- [ ] **Step 6: Manual verification**

Run: `npm run dev`, open `http://localhost:3000/workflows/new`, select a model known to support both (e.g. GPT-5.2, `hasStructuredOutput` and `hasReasoning` both true per Task 1's data), click "Show Advanced Model Params". Confirm: both new controls appear; typing invalid JSON into the schema textarea shows the inline error; typing valid JSON clears it; switching to a model with neither capability (e.g. Command R) hides both controls.

- [ ] **Step 7: Commit**

```bash
git add components/console/workflow/workflow-model-settings.tsx
git commit -m "Add Structured Output and Reasoning Effort controls to model settings"
```

---

### Task 4: Grouped, badge-rich model picker with a deprecated section

**Goal:** Group the model `Select` by company, add Structured-Output/Reasoning badges alongside the existing Eye/Layers/Globe icons, and move deprecated models into a collapsed bottom group with a warning icon and tooltip.

**Files:**
- Modify: `components/console/workflow/workflow-form.tsx`
- Modify: `components/console/workflow/workflow-item.tsx`

**Acceptance Criteria:**
- [ ] Non-deprecated models render grouped under a `SelectLabel` per company, in this order: OpenAI, Anthropic, Google, xAI, Perplexity, Meta, Mistral, DeepSeek, Qwen, Cohere
- [ ] Deprecated models render in a final group labeled "Deprecated", each with a warning-triangle icon; hovering shows the deprecation note and suggested replacement
- [ ] A model with `hasStructuredOutput`/`hasReasoning` true shows the corresponding new icon next to the existing Eye/Layers/Globe icons
- [ ] The existing search box still filters across all groups (including deprecated)
- [ ] The workflow list's model badge uses the real `isDeprecated` helper instead of the dead label-substring check
- [ ] `npx tsc --noEmit` passes

**Verify:** `npx tsc --noEmit` → no errors; manual check per Step 5 below

**Steps:**

- [ ] **Step 1: Update imports**

Change:

```typescript
import {
  AIModels,
  AIModelToLabel,
  hasLargeContextWindow,
  hasWebSearch,
  isVisionCapable,
  modelHasInstruction,
  type WorkflowInput,
  WorkflowInputType,
  WorkflowInputTypeToLabel,
} from "@/data/workflow";
import type { Workflow } from "@/generated/prisma-client/client";
import { Eye, Globe, Layers } from "lucide-react";
```

to:

```typescript
import {
  AIModels,
  AIModelToLabel,
  getDeprecationInfo,
  getModelCompany,
  hasLargeContextWindow,
  hasReasoning,
  hasStructuredOutput,
  hasWebSearch,
  isDeprecated,
  isVisionCapable,
  type ModelCompany,
  modelHasInstruction,
  type WorkflowInput,
  WorkflowInputType,
  WorkflowInputTypeToLabel,
} from "@/data/workflow";
import type { Workflow } from "@/generated/prisma-client/client";
import { AlertTriangle, Braces, BrainCircuit, Eye, Globe, Layers } from "lucide-react";
```

and add `SelectGroup, SelectLabel` to the existing `../../ui/select` import:

```typescript
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
```

- [ ] **Step 2: Replace the `filteredModels` memo** with a grouped version. Change:

```typescript
  const filteredModels = useMemo(() => {
    return AIModels.filter((m) =>
      AIModelToLabel[m].toLowerCase().includes(modelSearch.toLowerCase())
    );
  }, [modelSearch]);
```

to:

```typescript
  const COMPANY_ORDER: ModelCompany[] = [
    "OpenAI", "Anthropic", "Google", "xAI", "Perplexity", "Meta", "Mistral", "DeepSeek", "Qwen", "Cohere",
  ];

  const filteredModels = useMemo(() => {
    return AIModels.filter((m) =>
      AIModelToLabel[m].toLowerCase().includes(modelSearch.toLowerCase())
    );
  }, [modelSearch]);

  const groupedModels = useMemo(() => {
    const active = filteredModels.filter((m) => !isDeprecated(m));
    const deprecated = filteredModels.filter((m) => isDeprecated(m));
    const groups = COMPANY_ORDER.map((company) => ({
      company,
      models: active.filter((m) => getModelCompany(m) === company),
    })).filter((g) => g.models.length > 0);
    return { groups, deprecated };
  }, [filteredModels]);
```

- [ ] **Step 3: Replace the `SelectContent` block's model list**. Change:

```tsx
                <SelectContent className="max-h-60 overflow-y-auto">
                  <TooltipProvider>
                    {filteredModels.map((m) => (
                      <SelectItem key={m} value={m}>
                        <div className="flex items-center gap-2">
                          <span>{AIModelToLabel[m]}</span>
                          {isVisionCapable(m) && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Eye className="h-4 w-4 text-pink-500 dark:text-pink-400 cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Supports image input</p>
                              </TooltipContent>
                            </Tooltip>
                          )}
                          {hasLargeContextWindow(m) && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Layers className="h-4 w-4 text-pink-500 dark:text-pink-400 cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Supports 200k+ context window</p>
                              </TooltipContent>
                            </Tooltip>
                          )}
                          {hasWebSearch(m) && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Globe className="h-4 w-4 text-pink-500 dark:text-pink-400 cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Supports web search</p>
                              </TooltipContent>
                            </Tooltip>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </TooltipProvider>
                </SelectContent>
```

to:

```tsx
                <SelectContent className="max-h-60 overflow-y-auto">
                  <TooltipProvider>
                    {groupedModels.groups.map(({ company, models }) => (
                      <SelectGroup key={company}>
                        <SelectLabel>{company}</SelectLabel>
                        {models.map((m) => (
                          <SelectItem key={m} value={m}>
                            <div className="flex items-center gap-2">
                              <span>{AIModelToLabel[m]}</span>
                              {isVisionCapable(m) && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Eye className="h-4 w-4 text-pink-500 dark:text-pink-400 cursor-help" />
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Supports image input</p>
                                  </TooltipContent>
                                </Tooltip>
                              )}
                              {hasLargeContextWindow(m) && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Layers className="h-4 w-4 text-pink-500 dark:text-pink-400 cursor-help" />
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Supports 200k+ context window</p>
                                  </TooltipContent>
                                </Tooltip>
                              )}
                              {hasWebSearch(m) && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Globe className="h-4 w-4 text-pink-500 dark:text-pink-400 cursor-help" />
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Supports web search</p>
                                  </TooltipContent>
                                </Tooltip>
                              )}
                              {hasStructuredOutput(m) && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Braces className="h-4 w-4 text-pink-500 dark:text-pink-400 cursor-help" />
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Supports structured (JSON schema) output</p>
                                  </TooltipContent>
                                </Tooltip>
                              )}
                              {hasReasoning(m) && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <BrainCircuit className="h-4 w-4 text-pink-500 dark:text-pink-400 cursor-help" />
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Supports reasoning effort control</p>
                                  </TooltipContent>
                                </Tooltip>
                              )}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    ))}
                    {groupedModels.deprecated.length > 0 && (
                      <SelectGroup>
                        <SelectLabel>Deprecated</SelectLabel>
                        {groupedModels.deprecated.map((m) => {
                          const info = getDeprecationInfo(m);
                          return (
                            <SelectItem key={m} value={m}>
                              <div className="flex items-center gap-2">
                                <span className="text-muted-foreground">{AIModelToLabel[m]}</span>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <AlertTriangle className="h-4 w-4 text-amber-500 cursor-help" />
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>
                                      {info?.note}
                                      {info?.replacement && ` Suggested: ${AIModelToLabel[info.replacement]}.`}
                                    </p>
                                  </TooltipContent>
                                </Tooltip>
                              </div>
                            </SelectItem>
                          );
                        })}
                      </SelectGroup>
                    )}
                  </TooltipProvider>
                </SelectContent>
```

- [ ] **Step 4: Fix the workflow list's dead deprecation check**

`components/console/workflow/workflow-item.tsx` already has an `isDeprecated` check, but it's a broken heuristic: `const isDeprecated = modelLabel.toLowerCase().includes("deprecated")` — since no label text actually contains the word "deprecated", this is always `false` and the destructive `Badge` styling never triggers. Now that Task 1 provides a real `isDeprecated(model)` helper, fix it. Change:

```typescript
import { type AIModel, AIModelToLabel } from "@/data/workflow";
```

to:

```typescript
import { type AIModel, AIModelToLabel, isDeprecated } from "@/data/workflow";
```

and change:

```typescript
  const modelLabel = AIModelToLabel[workflow.model as AIModel] || workflow.model;
  const isDeprecated = modelLabel.toLowerCase().includes("deprecated");
```

to:

```typescript
  const modelLabel = AIModelToLabel[workflow.model as AIModel] || workflow.model;
  const modelIsDeprecated = isDeprecated(workflow.model as AIModel);
```

and update the `Badge` usage further down from `variant={isDeprecated ? "destructive" : "outline"}` to `variant={modelIsDeprecated ? "destructive" : "outline"}`.

- [ ] **Step 5: Typecheck and manual verification**

Run: `npx tsc --noEmit` → no errors referencing `workflow-form.tsx` or `workflow-item.tsx`.

Then `npm run dev`, open `http://localhost:3000/workflows/new`, open the model dropdown. Confirm: models are grouped under company headers in the specified order; a "Deprecated" group appears at the bottom (e.g. containing "Grok 3", "Grok 4"); hovering the warning icon on a deprecated entry shows its note and suggested replacement; selecting GPT-5.2 shows Eye/Layers/Globe/Braces/BrainCircuit icons (it's vision+large-context+websearch+structured+reasoning capable per Task 1's data); typing "grok" in the search box still filters correctly across both active and deprecated groups. Then open the Workflows list page and confirm a workflow on a deprecated model (e.g. the one you'll create in Task 6) shows the red "destructive" badge instead of the plain outline badge.

- [ ] **Step 6: Commit**

```bash
git add components/console/workflow/workflow-form.tsx components/console/workflow/workflow-item.tsx
git commit -m "Group model picker by company, add capability badges, deprecated section, and fix dead deprecation badge"
```

---

### Task 5: Wire Structured Output and Reasoning Effort into execution

**Goal:** `getCompletion`/`getStreamingCompletion` in `lib/utils/ai.ts` actually use the two new settings when calling the model.

**Files:**
- Modify: `lib/utils/ai.ts`

**Acceptance Criteria:**
- [ ] When `modelSettings.structuredOutputSchema` is set and valid JSON, the non-streaming path uses `generateObject` with `jsonSchema()` and returns the object JSON-stringified in the existing `result: string` shape
- [ ] When `modelSettings.structuredOutputSchema` is set for the streaming path, it uses `streamObject` and still returns a `Response` compatible with the existing `StreamingText` component (plain text chunks of the growing JSON string)
- [ ] When `modelSettings.reasoningEffort` is set to anything other than `"none"`, it's passed as `providerOptions.openrouter.reasoning = { effort }`
- [ ] Existing non-structured-output, non-reasoning call paths are unchanged (no behavior regression for todays' workflows)
- [ ] `npx tsc --noEmit` passes

**Verify:** `npx tsc --noEmit` → no errors; manual check per Step 5 below

**Steps:**

- [ ] **Step 1: Update imports** in `lib/utils/ai.ts`. Change:

```typescript
import { generateText, streamText } from "ai";
```

to:

```typescript
import { generateObject, generateText, jsonSchema, streamObject, streamText } from "ai";
```

- [ ] **Step 2: Add a shared helper** right after `getOpenRouterHeaders`, to build the reasoning provider option:

```typescript
const buildReasoningProviderOptions = (settings?: ModelSettings) => {
  if (!settings?.reasoningEffort || settings.reasoningEffort === "none") return undefined;
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
```

- [ ] **Step 3: Branch `getCompletion`'s no-images path on structured output.** Change the existing tail of `getCompletion` (the `modelParams`/`generateText` block after the `imageParts` early-return) from:

```typescript
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
        (completion as any).experimental_providerMetadata?.perplexity?.citations,
    },
    totalTokenCount: completion.usage?.totalTokens ?? 0,
  };
};
```

to:

```typescript
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
        (completion as any).experimental_providerMetadata?.perplexity?.citations,
    },
    totalTokenCount: completion.usage?.totalTokens ?? 0,
  };
};
```

- [ ] **Step 4: Branch `getStreamingCompletion`'s no-images path the same way.** Change its tail from:

```typescript
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
    model: openrouter(providerModelId),
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
```

to:

```typescript
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
        ? (evt) => onFinish({ text: JSON.stringify(evt.object), usage: evt.usage })
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
```

- [ ] **Step 5: Typecheck and manual verification**

Run: `npx tsc --noEmit` → no errors referencing `lib/utils/ai.ts`.

Then `npm run dev`. Create a workflow using GPT-5.2 with Structured Output enabled and a schema like `{"type":"object","properties":{"answer":{"type":"string"}},"required":["answer"]}`, template `Answer: {{question}}`, input `question`. Run it from the workflow's Tests tab (or the editor's inline runner) with `question = "What is 2+2?"` and confirm the result is valid JSON matching the schema (e.g. `{"answer":"4"}`). Then create a second workflow on the same model with Reasoning Effort set to "high" and confirm it still completes successfully.

- [ ] **Step 6: Commit**

```bash
git add lib/utils/ai.ts
git commit -m "Wire Structured Output and Reasoning Effort into workflow execution"
```

---

### Task 6: Full-feature verification pass

**Goal:** Confirm the whole refreshed catalog and new options work together end-to-end, including the deprecated-model backward-compatibility guarantee.

**Files:** none (verification only)

**Acceptance Criteria:**
- [ ] A brand-new workflow can be created against a newly-added model (e.g. Claude Sonnet 5) and runs successfully
- [ ] An existing workflow pointed at a now-deprecated model (simulated per Step 2 below) still loads in the editor, shows the deprecation warning, and still runs successfully
- [ ] `npx tsc --noEmit` and `npx biome check .` both pass clean

**Verify:** manual walkthrough below; `npx tsc --noEmit && npx biome check .` → both exit 0

**Steps:**

- [ ] **Step 1: Full typecheck + lint**

Run: `npx tsc --noEmit && npx biome check .`
Expected: both exit 0 with no errors.

- [ ] **Step 2: Simulate an existing workflow on a deprecated model**

Run: `npm run dev`, create a new workflow, pick "Grok 4" from the Deprecated group (confirming it's selectable — deprecated models must still work, only default visibility is de-emphasized), template `Say hello`, save it, then run it from the editor. Confirm: it saves without error, the deprecation warning is visible when you reopen it for editing, and running it returns a successful completion (OpenRouter still routes retired slugs until fully sunset).

- [ ] **Step 3: Create and run a workflow on a brand-new model**

Create a workflow using "Claude Sonnet 5", template `Say hello`, save and run it. Confirm it completes successfully and the model label displays correctly in the workflow list.

- [ ] **Step 4: Confirm credit deduction is unchanged**

Check the organization's credit balance (Settings page) before and after running the two workflows above. Confirm the credits deducted for both runs are consistent with the flat token-based rate (same formula regardless of which model was used) — no per-model price differences in what's charged.
