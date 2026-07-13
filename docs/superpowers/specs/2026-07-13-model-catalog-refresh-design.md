# Model Catalog Refresh & Capability Display — Design

Status: Approved for spec, pending implementation plan
Sub-project: A of 2 (B = Agents feature, to be brainstormed separately after this ships)

## Context

`data/workflow.ts` hand-curates the models offered across Workflows: a friendly label
(`AIModelToLabel`), a mapping to the real OpenRouter slug (`modelToProviderId`), and three
parallel hardcoded `Set`s for vision / large-context / web-search capability. This list has
drifted from reality:

- `grok-3`, `grok-3-mini`, `grok-3-beta`, `grok-4`, `grok-4-fast`, `grok-4.1`, `grok-4.1-fast`
  no longer exist on OpenRouter (confirmed against the live `/api/v1/models` response, 345
  models, pulled 2026-07-13).
- `gemini-3-pro-preview` (text) no longer exists; Google's current Gemini 3 line is
  `gemini-3-flash-preview`, `gemini-3.1-pro-preview`, `gemini-3.1-flash-lite`,
  `gemini-3.5-flash` (the `gemini-3-pro-image`/`gemini-3.1-flash-image` slugs that share the
  `gemini-3-pro` prefix are image-output models, a different modality, out of scope here).
- OpenAI, Anthropic, and xAI have all shipped multiple newer generations
  (`gpt-5.4`/`5.5`/`5.6`, `claude-opus-4.6`/`4.7`/`4.8`, `claude-sonnet-5`, `claude-fable-5`,
  `grok-4.20`/`4.3`/`4.5`) that aren't in the picker at all.
- OpenRouter exposes real per-model capability data (`supported_parameters`,
  `context_length`, `architecture.input_modalities`) that we're not using — instead we
  hand-maintain three separate capability `Set`s that can (and have) drifted from each other
  and from reality.

Billing is a flat conversion (1 credit = 100 tokens, [lib/utils/stripe.ts](../../../lib/utils/stripe.ts)
`reportUsage`) applied identically regardless of model. This is confirmed to stay as-is —
no per-model pricing or margin logic is introduced by this project, and no per-model price
is displayed in the UI, since it wouldn't reflect what a run actually costs the user.

## Goals

1. Refresh the curated model list for every company already represented (OpenAI, Anthropic,
   Google, xAI, Perplexity, Meta/Llama, Mistral, DeepSeek, Qwen, Cohere) with their current
   OpenRouter lineup. No new companies added.
2. Mark models OpenRouter no longer serves as **deprecated**, not deleted — existing saved
   Workflows/WorkflowBranches referencing them must keep working. Deprecated models are
   visually separated in the UI with a warning.
3. Replace the three hand-maintained capability `Set`s with a single per-model metadata
   record derived from OpenRouter's real capability data, and extend it with two capabilities
   we don't track today: **structured output** and **reasoning**.
4. Make Structured Output and Reasoning Effort real, usable options on Workflows (not just
   display badges) — the same options Sub-project B (Agents) will reuse.
5. Update the model picker UI to reflect the larger, grouped list and the new capability
   badges.

## Non-goals

- No per-model or dynamic pricing/margin. Billing stays flat and untouched.
- No live/runtime fetching of OpenRouter data. The catalog is a static, human-reviewed
  snapshot refreshed by re-running a script — consistent with how the list is maintained
  today, just less manual.
- No image-output or audio-output models (e.g. `gpt-5-image`, `gemini-3-pro-image`,
  `gpt-audio`). Those need different input/output handling in the runner and are a separate
  feature.
- No tool-calling / function-execution support. OpenRouter reports `tools` as a supported
  parameter for many models, but nothing in this app defines callable tools yet. Not wired
  up here (revisit if/when Agents needs it).
- Removing genuinely dead models from the codebase. They stay forever as `deprecated`
  entries per the product decision above.

## Data model

`data/workflow.ts` keeps `AIModelToLabel` and `modelToProviderId` as the identity source of
truth (adding new keys, never removing existing ones). A new map replaces the three capability
`Set`s:

```ts
export type ModelCapabilities = {
  vision: boolean;
  largeContextWindow: boolean; // context_length >= 200_000
  webSearch: boolean;          // native web-search tool support (OpenRouter :online routing)
  structuredOutput: boolean;   // supported_parameters includes "structured_outputs"
  reasoning: boolean;          // supported_parameters includes "reasoning"
};

export type ModelMeta = {
  contextLength: number;
  capabilities: ModelCapabilities;
  deprecated?: {
    replacement: AIModel; // which current model to steer users toward
    note: string;         // shown in the UI tooltip
  };
};

export const AIModelMeta: Record<AIModel, ModelMeta> = { /* ... */ };
```

`isVisionCapable`, `hasWebSearch`, `hasLargeContextWindow` keep their existing signatures
(so no call site outside `data/workflow.ts` needs to change) but read from `AIModelMeta`
instead of a `Set.has()`. New helpers: `hasStructuredOutput(model)`, `hasReasoning(model)`,
`isDeprecated(model)`, `getDeprecationInfo(model)`.

## Curation policy (applied during implementation, not enumerated here)

- Per company, include the current flagship generation plus its mini/nano/lite/fast tiers,
  and the prior generation's flagship (continuity for anyone mid-conversation about "the old
  one"). Skip narrow dated snapshots OpenRouter lists mainly for API reproducibility
  (e.g. `gpt-4o-2024-05-13`) when a floating/undated alias already covers them.
- Reasoning-first lines (OpenAI `o`-series, DeepSeek `r1`, Qwen `-thinking` variants) are
  included since Reasoning Effort is a first-class capability this project adds.
- Skip `-codex`, `-image`, `-audio`, and voice variants — different modality/use case, out
  of scope.
- A model is marked `deprecated` if it is absent from OpenRouter's live catalog as of the
  last sync. Today that's: `grok-3`, `grok-3-mini`, `grok-3-beta`, `grok-4`, `grok-4-fast`,
  `grok-4.1`, `grok-4.1-fast`, `gemini-3-pro-preview`.

## Refresh mechanism

A one-off script, `scripts/sync-openrouter-models.ts`, run manually (`npm run sync-models`):

1. Fetches `https://openrouter.ai/api/v1/models` (public, no API key required).
2. For every slug in `modelToProviderId`, looks up the matching entry in the response and
   prints an updated `AIModelMeta` entry (context length + capability flags), or flags the
   slug as newly-deprecated if it's missing.
3. Prints suggested new entries for slugs that exist on OpenRouter under the same
   company prefixes but aren't yet in `modelToProviderId`, for a human to review and fold in.

This is a dev-time tool, not a runtime dependency — the app never calls OpenRouter to render
the model picker, so local testing needs no extra env vars or network access beyond what
running a workflow already requires, and nothing new can go down in production because of
this feature. The 2026-07-13 snapshot already pulled for this design is what seeds the initial
catalog refresh.

## UI changes

**Model picker** ([workflow-form.tsx](../../../components/console/workflow/workflow-form.tsx)):
- `SelectItem`s grouped by company via `SelectGroup`/`SelectLabel` (the list is growing
  large enough that a flat list plus the existing search box isn't quite enough).
- Existing capability icons (Eye = vision, Layers = large context, Globe = web search) now
  driven by `AIModelMeta` instead of the hardcoded Sets, plus two new icons for Structured
  Output and Reasoning.
- A separate, collapsed "Deprecated" group at the bottom of the list, each item with a
  warning-triangle icon; hovering shows the tooltip note and suggested replacement. Existing
  workflows using a deprecated model still show and function normally in their own editor —
  only the *default* picker list excludes them from the top-level groups.
- No price is displayed anywhere, since every run costs the same regardless of model.

**Advanced Model Settings** ([workflow-model-settings.tsx](../../../components/console/workflow/workflow-model-settings.tsx)):
- New "Enable Structured Output" toggle, shown only when `hasStructuredOutput(model)`. When
  on, a textarea accepts a raw JSON Schema (validated with `zod-validation-error` before
  save; invalid schema blocks saving with an inline error, mirroring existing form validation
  patterns in this file).
- New "Reasoning Effort" select (`none` / `low` / `medium` / `high`), shown only when
  `hasReasoning(model)`. Mirrors the existing conditional-rendering pattern already used for
  the web-search toggle.
- Both are additive optional fields on the existing `ModelSettings` type
  (`structuredOutputSchema?: string`, `reasoningEffort?: "none"|"low"|"medium"|"high"`).

## Execution changes

`lib/utils/ai.ts` (`getCompletion` / `getStreamingCompletion`):
- When `modelSettings.structuredOutputSchema` is set, switch from `generateText`/`streamText`
  to `generateObject`/`streamObject`, building the schema via the AI SDK's `jsonSchema()`
  helper (accepts a raw JSON Schema object directly, no zod modeling required for
  user-supplied schemas). The returned object is JSON-stringified into the existing
  `result: string` shape so `WorkflowRun.result` and every downstream consumer
  (public runner, streaming route, PDF/TXT export) keep working unchanged.
- When `modelSettings.reasoningEffort` is set on a reasoning-capable model, pass it through
  as an OpenRouter provider option alongside the existing `providerModelId` /
  `:online`-suffix logic.
- Token accounting (`totalTokenCount`) and credit deduction (`reportUsage`) are unaffected —
  both code paths still resolve to a token count from the AI SDK's `usage` field the same way
  they do today.

## Testing plan

- Model picker renders grouped by company; deprecated group is collapsed by default and
  expandable; capability icons match a known vision model, a known reasoning model, and a
  known structured-output model.
- Save and run a workflow with Structured Output enabled against a JSON Schema; confirm the
  result is valid JSON matching the schema, and that the run still shows up correctly in
  Executions/Usage.
- Save and run a workflow with Reasoning Effort set to `high` against a reasoning-capable
  model; confirm it completes and the response reflects the setting (e.g. visibly more
  thorough reasoning for a hard prompt vs. `low`).
- Open an existing workflow (or create one via direct DB edit / branch) pointing at a
  deprecated model (e.g. `grok-4`); confirm it still loads, displays the deprecation
  warning, and still runs successfully (OpenRouter routes deprecated slugs until fully
  sunset).
- Confirm credit deduction is unchanged: running the same prompt against a cheap model and
  an expensive model deducts the same credits for the same token count.

## Out of scope / future work

- Sub-project B: the Agents feature (chat, system prompt, Vercel AI SDK), to be brainstormed
  and spec'd separately once this ships. It will reuse `AIModelMeta`, `hasStructuredOutput`,
  and `hasReasoning` directly.
- Live/dynamic OpenRouter fetching, if the manual-refresh cadence turns out to be too slow
  in practice.
- Tool-calling execution.
- Image/audio-output model support.
