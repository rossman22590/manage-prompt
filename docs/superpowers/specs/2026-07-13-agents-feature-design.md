# Agents Feature — Design

Status: Approved for spec, pending implementation plan
Sub-project: B of 2 (A = [Model Catalog Refresh & Capability Display](./2026-07-13-model-catalog-refresh-design.md), designed first since this depends on it)

## Context

Workflows are ManagePrompt's existing product: configure a prompt template + model, publish it,
and call it via a secret-key-authenticated API or a public share link. Agents are a new,
parallel feature: configure a system prompt + model (reusing everything Sub-project A adds —
the refreshed model catalog, Structured Output, Reasoning Effort), then talk to it as a
multi-turn chat rather than a single templated prompt. Like Workflows, Agents need both an
in-dashboard "try it" surface and a real external API — but the external surface here is
explicitly **OpenAI Chat-Completions-compatible**, so any existing OpenAI SDK/client library
can point at this app and use an Agent as if it were a model, with zero custom client code.

Billing stays exactly as it is for Workflows: flat 1 credit = 100 tokens, enforced identically
regardless of which model the Agent uses.

## Goals

1. A new `Agent` entity: name, system prompt, model + model settings (the same `ModelSettings`
   type and picker components Sub-project A produces).
2. An in-dashboard chat playground to build and iterate on an agent, using the Vercel AI SDK's
   `useChat`, with the conversation persisted client-side (localStorage) — no server-side
   message storage.
3. A public, secret-key-authenticated API at `/api/v1/chat/completions` that mimics OpenAI's
   Chat Completions API closely enough that the official OpenAI SDK (or any OpenAI-compatible
   client) works against it out of the box, with streaming, non-streaming, and response
   caching.
4. Usage/credit tracking that works the same way it does for Workflows, extended to
   distinguish dashboard testing from real API traffic.

## Non-goals

- No conversation persistence server-side. Message content lives only in the caller's
  browser (dashboard) or the caller's own client (API) — matches how OpenAI's real Chat
  Completions API is itself stateless per request.
- No multiple saved threads per agent in the dashboard playground — one ongoing conversation,
  clearable. (Revisit if a single conversation turns out to be limiting in practice.)
- No branches, tests, or public share-links for Agents — those are Workflow-specific concepts
  this project doesn't carry over.
- No tool-calling / function execution, even though OpenAI's Chat Completions schema supports
  `tools`. Nothing in this app defines callable tools yet.
- No per-model pricing/margin, consistent with Sub-project A. Billing is flat regardless of
  which model an Agent uses.
- No new secret-key type or scope. The same organization-wide `SecretKey` used for Workflows'
  `/api/v1/run` also authenticates `/api/v1/chat/completions`.

## Data model

```prisma
model Agent {
  id              Int          @id @default(autoincrement())
  shortId         String       @unique
  createdBy       String
  ownerId         String
  name            String
  systemPrompt    String
  model           String
  modelSettings   Json?
  published       Boolean      @default(false)
  cacheControlTtl Int?
  createdAt       DateTime     @default(now())
  updatedAt       DateTime     @updatedAt
  user            User         @relation(fields: [createdBy], references: [id], onDelete: Cascade)
  organization    Organization @relation(fields: [ownerId], references: [id], onDelete: Cascade)
  runs            AgentRun[]

  @@index([ownerId])
}

model AgentRun {
  id              Int      @id @default(autoincrement())
  agentId         Int
  source          String   // "dashboard" | "api"
  totalTokenCount Int      @default(0)
  createdBy       String?
  createdAt       DateTime @default(now())
  agent           Agent    @relation(fields: [agentId], references: [id], onDelete: Cascade)
  user            User?    @relation(fields: [createdBy], references: [id], onDelete: Cascade)

  @@index([agentId])
}
```

`User` and `Organization` get matching back-relations (`Agent[]`, `AgentRun[]`), mirroring
their existing `Workflow[]`/`WorkflowRun[]` relations. `published` gates the public API only
(mirrors `Workflow.published`) — the dashboard playground works regardless, same as Workflows'
in-dashboard Tests runner works on unpublished workflows.

`AgentRun` intentionally stores no message content — only enough to power the Usage tab and
billing audit trail. Message content for dashboard conversations lives in the browser; for API
calls, it lives with whatever client made the request (exactly like OpenAI's own API never
stores your messages either, absent their separate stateful "Assistants" product).

## Shared core

`lib/utils/agent-chat.ts` exports `runAgentChat({ agent, messages, settings })`, built on
`streamText` with the `@openrouter/ai-sdk-provider`, mirroring `getStreamingCompletion` in
`lib/utils/ai.ts`:

- Prepends `{ role: "system", content: agent.systemPrompt }` to whatever message array it's
  given.
- Resolves `agent.model` through the same `modelToProviderId`/`AIModelMeta` Sub-project A
  produces.
- Applies `agent.modelSettings` the same way workflows do (temperature, structured output via
  `jsonSchema()` + `generateObject`/`streamObject`, reasoning effort via
  `providerOptions.openrouter.reasoning = { effort }`).
- Returns the raw AI SDK `streamText` result — each of the two routes below formats/streams it
  differently for its own audience.

Both routes call this one function; neither re-implements model resolution, prompt assembly,
or provider-option mapping.

## Route 1: dashboard chat playground (session-authenticated)

`app/api/agents/[agentId]/chat/route.ts`:
- Authenticated via the existing session (`owner()`), not a secret key. Verifies the agent
  belongs to the caller's organization.
- Accepts `{ messages: UIMessage[] }` — exactly the body `useChat`'s default
  `DefaultChatTransport` sends (confirmed: it resends the *full* message history every turn,
  no server-side thread state needed).
- Calls `runAgentChat`, returns `result.toUIMessageStreamResponse()` — the wire format
  `useChat` expects by default, confirmed distinct from plain text streaming.
- Same credit-check-before-generating gate Workflows use (blocks with 402 if the organization
  has 0 credits and no active spend-limit-respecting subscription).
- On finish: `reportUsage` (credit deduction) + `prisma.agentRun.create({ source: "dashboard" })`.

`components/console/agent/agent-chat.tsx` (new `@ai-sdk/react` dependency for `useChat`):
message list + input, backed by `useChat({ api: "/api/agents/{agentId}/chat" })`. Conversation
state syncs to `localStorage` under `agent-chat:{agentId}` (loaded as `useChat`'s initial
messages, written on every update) so it survives a page reload. A "Clear conversation" button
resets both the `useChat` state and the localStorage entry.

## Route 2: public OpenAI-compatible API (secret-key-authenticated)

`app/api/v1/chat/completions/route.ts` — mirrors `/api/v1/run/[workflowId]/route.ts`'s
auth/rate-limit/credit-check structure, but with an OpenAI-shaped wire protocol:

- **Auth**: `Authorization: Bearer <secretKey>`, same `SecretKey` lookup and
  `validateRateLimit(key_{ownerId}_{keyId}, key.rateLimitPerSecond)` Workflows already use.
- **Request body**: `{ model, messages, stream?, temperature?, max_tokens?, response_format? }`
  — standard OpenAI Chat Completions shape. `model`'s value is looked up as an **Agent
  `shortId`** scoped to the calling organization (not a raw provider model id) — this is what
  lets a caller configure the official OpenAI SDK with `baseURL: ".../api/v1"` and
  `model: "<agent shortId>"` and have it just work, with the agent's real underlying model and
  system prompt entirely server-side.
- Rejects with a 404 (OpenAI-shaped error body) if no agent with that shortId is
  `published` and owned by the key's organization.
- **Credits**: same 0-credit / spend-limit block as Workflows, but the error body matches
  OpenAI's shape (`{ error: { message, type, code } }`) instead of this app's usual
  `{ error, success, code }` — compatibility is the point of this specific route, so it
  intentionally departs from the rest of the app's error convention.
- **Caching**: identical mechanism to `getWorkflowCachedResult`/`cacheWorkflowResult` — MD5
  hash of the full request body (model + messages + params) as the Redis key, TTL from
  `agent.cacheControlTtl` (unset = no caching, same default as Workflows).
- **Streaming** (`stream: true`): since the AI SDK has no built-in OpenAI-chunk formatter, this
  route hand-maps `runAgentChat`'s delta stream into real `chat.completion.chunk` SSE lines
  (`data: {"id","object":"chat.completion.chunk","created","model","choices":[{"index":0,
  "delta":{"content":"..."},"finish_reason":null}]}\n\n`), ending with a finish-reason chunk and
  `data: [DONE]\n\n`.
- **Non-streaming**: a single `chat.completion` JSON body (`id`, `object`, `created`, `model`,
  `choices[0].message`, `usage.{prompt,completion,total}_tokens`) built from the awaited
  `text`/`usage`/`finishReason`.
- On finish (both modes): `reportUsage` + `prisma.agentRun.create({ source: "api" })`.
- The agent's detail page gets a code-snippet block (reusing the existing HAR-based
  `ApiCodeSnippet` component Workflows already use) showing a curl and JS example against this
  endpoint.

## Navigation & pages

- New top-level "Agents" tab in the dashboard nav, alongside Workflows/Statistics/Settings.
- `app/(dashboard)/agents/page.tsx` — list (mirrors `workflows/page.tsx`).
- `app/(dashboard)/agents/new/page.tsx` — create form: name, system prompt, model picker +
  Advanced Model Settings (both reused wholesale from Sub-project A), cache TTL, published
  toggle.
- `app/(dashboard)/agents/[agentId]/page.tsx` — the chat playground (primary/default view,
  same role Workflows' main page plays for its test-and-run flow).
- `app/(dashboard)/agents/[agentId]/edit/page.tsx` — edit config.
- `app/(dashboard)/agents/[agentId]/usage/page.tsx` — aggregate usage chart (reusing the
  `getWorkflowRunStats`/`getWorkflowUsage` query patterns against `AgentRun`) plus a recent-
  activity table showing timestamp, source (dashboard/api), and tokens per run — this is the
  only place API traffic against an agent becomes visible, since message content isn't stored.
- Agent-scoped sub-tabs in the nav: Chat / Edit / Usage (mirrors the `workflowId`-scoped tabs,
  minus Branches/Tests/Executions).
- `app/(dashboard)/agents/actions.ts` — `createAgent`, `updateAgent`, `deleteAgent`,
  `toggleAgentPublished`, following the exact server-action patterns in
  `app/(dashboard)/workflows/actions.ts`.

## Testing plan

- Create an agent, chat with it across several turns in the dashboard playground; reload the
  page and confirm the conversation is still there (localStorage); click "Clear conversation"
  and confirm it resets.
- Confirm credits deduct per dashboard chat turn and the Usage tab reflects it.
- Point the real `openai` npm package at this app (`baseURL` + secret key + `model: "<agent
  shortId>"`) and confirm both streaming and non-streaming chat completions work with no
  custom code beyond those three config values.
- Confirm an unpublished agent's API requests are rejected (404/OpenAI-shaped error), and that
  toggling `published` on immediately allows them.
- Confirm a byte-identical repeated request within the cache TTL is served from cache (no
  duplicate OpenRouter call, still logs/deducts usage the same as a live call).
- Confirm a 0-credit organization is blocked on both routes with the right status/error shape
  for each (dashboard's normal error toast vs. the API's OpenAI-shaped error body).
- Confirm Structured Output and Reasoning Effort (from Sub-project A) work correctly through
  an Agent, both in the dashboard playground and via the public API.

## Out of scope / future work

- Server-side conversation persistence / multi-thread history, if a single client-side
  conversation per agent proves limiting.
- Tool-calling / function execution.
- Branches, tests, or public share-links for Agents.
- A dedicated `agents-guide` docs page (mirroring `workflows-guide`), if the inline
  code-snippet block on the agent detail page turns out to be insufficient.
