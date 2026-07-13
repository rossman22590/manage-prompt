# Agents Feature Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers-extended-cc:subagent-driven-development (recommended) or superpowers-extended-cc:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a new "Agents" feature — configurable chat agents (system prompt + model + options) with a dashboard chat playground (Vercel AI SDK `useChat`, localStorage history) and a public, OpenAI Chat-Completions-compatible API (`/api/v1/chat/completions`) with streaming, caching, and the same flat-rate credit billing Workflows use.

**Architecture:** New `Agent`/`AgentRun` Prisma models mirror `Workflow`/`WorkflowRun`. A shared core (`lib/utils/agent-chat.ts`) builds the actual model call via `streamText` + the OpenRouter provider; two thin routes format/authenticate it differently — a session-authenticated route returning the AI SDK's UI-message-stream (for `useChat`), and a secret-key-authenticated route hand-mapping the same stream into OpenAI's `chat.completion.chunk` SSE format. Message content never touches the database — dashboard history lives in the browser's `localStorage`; the public API is stateless per request, exactly like OpenAI's own API.

**Tech Stack:** Next.js 15 App Router / Prisma / `ai` (Vercel AI SDK v5) + `@ai-sdk/react` (new dependency) + `@openrouter/ai-sdk-provider` / Upstash Redis (existing) / Zod. No test runner configured in this repo — verification is `npx tsc --noEmit`, `npx biome check .`, and manual browser + `curl`/OpenAI-SDK walkthroughs.

**User decisions (already made):**
- Depends on [Model Catalog Refresh & Capability Display](2026-07-13-model-catalog-refresh-plan.md) shipping first — Agents reuse its `AIModelMeta`, `hasStructuredOutput`, `hasReasoning`, and the grouped model picker.
- Both a dashboard playground AND a public API — the public API must be OpenAI Chat-Completions-compatible (streaming + caching), not a bespoke shape.
- Dashboard chat history is a single ongoing conversation per agent, stored in the browser's `localStorage`, not persisted server-side. No multi-thread sidebar.
- Billing stays flat (1 credit = 100 tokens), same as Workflows — no per-model pricing.
- No branches, tests, or public share-links for Agents.

**Worth knowing before you start:** this codebase previously had a "ChatBot"/"ChatBotUserSession" feature that was deliberately removed (commit `44ac4c2`, "Remove chatbot", part of a "Pivotttt!" commit `2af79c5`). Nothing in that history indicates a reason to avoid rebuilding chat-style functionality — just flagging it for awareness since Agents is conceptually adjacent.

---

### Task 1: `Agent` + `AgentRun` Prisma models

**Goal:** Add the two new tables, migrated and generated, mirroring `Workflow`/`WorkflowRun`'s relations.

**Files:**
- Modify: `prisma/schema.prisma`

**Acceptance Criteria:**
- [ ] `Agent` and `AgentRun` models exist with the fields below
- [ ] `User` and `Organization` have back-relations to the new models
- [ ] `npx prisma migrate dev --name add_agents` succeeds and creates a new migration folder
- [ ] `npx prisma generate` succeeds (also runs automatically via this project's `postinstall`/`prebuild` hooks)

**Verify:** `npx prisma migrate dev --name add_agents` → exits 0, new migration folder created under `prisma/migrations/`

**Steps:**

- [ ] **Step 1: Add back-relations to `model User`**

In `prisma/schema.prisma`, in `model User`, right after the existing `WorkflowRun WorkflowRun[]` line, add:

```prisma
  Agent              Agent[]
  AgentRun           AgentRun[]
```

- [ ] **Step 2: Add a back-relation to `model Organization`**

Right after the existing `workflows Workflow[]` line in `model Organization`, add:

```prisma
  agents             Agent[]
```

- [ ] **Step 3: Add the two new models**

Insert this right after the closing brace of `model WorkflowRun { ... }` and before `model Passkey`:

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
  source          String
  totalTokenCount Int      @default(0)
  createdBy       String?
  createdAt       DateTime @default(now())
  agent           Agent    @relation(fields: [agentId], references: [id], onDelete: Cascade)
  user            User?    @relation(fields: [createdBy], references: [id], onDelete: Cascade)

  @@index([agentId])
}
```

- [ ] **Step 4: Generate and apply the migration**

Run: `npx prisma migrate dev --name add_agents`
Expected: exits 0, prints a new migration folder name under `prisma/migrations/`, and regenerates the Prisma client (`generated/prisma-client`).

- [ ] **Step 5: Commit**

```bash
git add prisma/schema.prisma prisma/migrations
git commit -m "Add Agent and AgentRun models"
```

---

### Task 2: Agent data layer (`lib/utils/agent.ts`, `lib/utils/useAgent.ts`)

**Goal:** Zod validation schema plus the DB query/cache helpers Agents need, mirroring `lib/utils/workflow.ts` and `lib/utils/useWorkflow.ts`.

**Files:**
- Create: `lib/utils/agent.ts`
- Create: `lib/utils/useAgent.ts`

**Acceptance Criteria:**
- [ ] `AgentSchema` validates name/model/systemPrompt/modelSettings/cacheControlTtl the same way `WorkflowSchema` does
- [ ] `getAgentsForOwner` paginates/searches the same way `getWorkflowsForOwner` does
- [ ] `getAgentById`, `getAgentUsage`, `getAgentRunStats`, `getAgentRecentActivity` mirror their Workflow analogues
- [ ] `getAgentCachedResult`/`cacheAgentResult` mirror `getWorkflowCachedResult`/`cacheWorkflowResult`'s MD5-hash-of-body → Redis pattern
- [ ] `npx tsc --noEmit` passes

**Verify:** `npx tsc --noEmit` → no errors referencing either new file

**Steps:**

- [ ] **Step 1: Create `lib/utils/agent.ts`**

```typescript
import { z } from "zod";
import { AIModels, type AIModel } from "@/data/workflow";

const zodEnum = <T>(arr: T[]): [T, ...T[]] => arr as [T, ...T[]];

export const AgentSchema = z.object({
  model: z.enum(zodEnum<AIModel>(AIModels)),
  name: z.string().min(2).max(150),
  systemPrompt: z.string().min(1).max(9999),
  modelSettings: z.string().optional().nullable(),
  cacheControlTtl: z.number().int().optional().default(0),
});
```

- [ ] **Step 2: Create `lib/utils/useAgent.ts`**

```typescript
import { createHash } from "node:crypto";
import type { Agent, Prisma } from "@/generated/prisma-client/client";
import { prisma } from "@/lib/utils/db";
import { owner } from "../hooks/useOwner";
import { redisStore } from "./redis";

export const AGENT_LIMIT = 15;

export async function getAgentsForOwner({
  ownerId,
  search,
  page = 1,
}: {
  ownerId: string;
  search?: string;
  page?: number;
}) {
  const safePage = Number.isFinite(page) && page > 0 ? page : 1;
  const dbQuery: Prisma.AgentFindManyArgs = {
    where: { ownerId },
    orderBy: { createdAt: "desc" },
    take: AGENT_LIMIT,
    skip: (safePage - 1) * AGENT_LIMIT,
  };
  if (search) {
    dbQuery.where!.name = { contains: search, mode: "insensitive" };
  }

  const countWhere: Prisma.AgentWhereInput = { ownerId };
  if (search) countWhere.name = { contains: search, mode: "insensitive" };

  const [agents, count] = await prisma.$transaction([
    prisma.agent.findMany(dbQuery),
    prisma.agent.count({ where: countWhere }),
  ]);
  return { agents, count };
}

export async function getAgentById(id: number): Promise<Agent | null> {
  const { ownerId } = await owner();
  if (!ownerId) throw new Error("Owner ID not found");
  return prisma.agent.findFirst({
    where: {
      id: { equals: id },
      organization: { id: { equals: ownerId } },
    },
  });
}

export async function getAgentUsage(
  id: number,
): Promise<{ runs: number; tokens: number }> {
  const runs = await prisma.agentRun.findMany({
    select: { totalTokenCount: true },
    where: {
      agentId: Number(id),
      createdAt: { gte: new Date(new Date().setDate(new Date().getDate() - 30)) },
    },
  });
  return {
    runs: runs.length,
    tokens: runs.reduce((acc, r) => acc + r.totalTokenCount, 0),
  };
}

export async function getAgentRunStats(
  id: number,
): Promise<{ date: string; total: number; tokens: number }[]> {
  return prisma.$queryRaw`
    WITH date_series AS (
      SELECT generate_series(
        NOW()::DATE - INTERVAL '30 days',
        NOW()::DATE,
        '1 day'::INTERVAL
      )::DATE AS date
    )
    SELECT
      ds.date,
      COALESCE(COUNT(ar.id)::INTEGER, 0) AS "total",
      COALESCE(SUM(ar."totalTokenCount")::INTEGER, 0) AS "tokens"
    FROM date_series ds
    LEFT JOIN "AgentRun" ar ON DATE(ar."createdAt") = ds.date AND ar."agentId" = ${id}
    GROUP BY ds.date
    ORDER BY ds.date ASC;
  `;
}

export async function getAgentRecentActivity(id: number, limit = 20) {
  return prisma.agentRun.findMany({
    where: { agentId: id },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export async function getAgentCachedResult(
  agentShortId: string,
  body: string,
): Promise<string | null> {
  try {
    const inputHash = createHash("md5").update(body).digest("hex");
    const cacheKey = `agent-chat-cache:${agentShortId}:${inputHash}`;
    return await redisStore.get(cacheKey);
  } catch (e) {
    console.error(e);
    return null;
  }
}

export async function cacheAgentResult(
  agentShortId: string,
  body: string,
  result: string,
  ttl: number,
) {
  try {
    const inputHash = createHash("md5").update(body).digest("hex");
    const cacheKey = `agent-chat-cache:${agentShortId}:${inputHash}`;
    await redisStore.set(cacheKey, result, { ex: ttl });
  } catch (e) {
    console.error(e);
  }
}
```

- [ ] **Step 3: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors referencing `lib/utils/agent.ts` or `lib/utils/useAgent.ts`

- [ ] **Step 4: Commit**

```bash
git add lib/utils/agent.ts lib/utils/useAgent.ts
git commit -m "Add Agent zod schema and DB query/cache helpers"
```

---

### Task 3: Agent server actions (`app/(dashboard)/agents/actions.ts`)

**Goal:** create/update/delete/toggle-published server actions, mirroring `app/(dashboard)/workflows/actions.ts`.

**Files:**
- Create: `app/(dashboard)/agents/actions.ts`

**Acceptance Criteria:**
- [ ] `createAgent` validates via `AgentSchema`, creates the row scoped to the current user/org, redirects to the new agent
- [ ] `updateAgent`/`deleteAgent`/`toggleAgentPublished` mirror the equivalent Workflow actions
- [ ] `npx tsc --noEmit` passes

**Verify:** `npx tsc --noEmit` → no errors referencing this file

**Steps:**

- [ ] **Step 1: Write the file**

```typescript
"use server";

import { createId } from "@paralleldrive/cuid2";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { fromZodError } from "zod-validation-error";
import { owner } from "@/lib/hooks/useOwner";
import { AgentSchema } from "@/lib/utils/agent";
import { prisma } from "@/lib/utils/db";

export async function createAgent(formData: FormData) {
  const { userId, ownerId } = await owner();
  if (!userId || !ownerId) {
    return { error: "User is missing" };
  }

  const name = formData.get("name") as string;
  const model = formData.get("model") as string;
  const systemPrompt = formData.get("systemPrompt") as string;
  const modelSettings = (formData.get("modelSettings") as string) ?? null;
  const rawCacheTtl = Number(formData.get("cacheControlTtl")) ?? 0;
  const cacheControlTtl = Math.min(Math.max(rawCacheTtl, 0), 86400);

  const validationResult = AgentSchema.safeParse({
    name,
    model,
    systemPrompt,
    modelSettings,
    cacheControlTtl,
  });

  if (!validationResult.success) {
    return { error: fromZodError(validationResult.error).toString() };
  }

  const created = await prisma.agent.create({
    data: {
      user: { connect: { id: userId! } },
      organization: { connect: { id: ownerId } },
      published: true,
      shortId: `agt_${createId()}`,
      name,
      model,
      systemPrompt,
      modelSettings: modelSettings ? JSON.parse(modelSettings) : null,
      cacheControlTtl,
    },
  });

  redirect(`/agents/${created.id}`);
}

export async function updateAgent(formData: FormData) {
  const id = Number(formData.get("id"));

  const name = formData.get("name") as string;
  const model = formData.get("model") as string;
  const systemPrompt = formData.get("systemPrompt") as string;
  const modelSettings = (formData.get("modelSettings") as string) ?? null;
  const rawCacheTtl = Number(formData.get("cacheControlTtl")) ?? 0;
  const cacheControlTtl = Math.min(Math.max(rawCacheTtl, 0), 86400);

  const validationResult = AgentSchema.safeParse({
    name,
    model,
    systemPrompt,
    modelSettings,
    cacheControlTtl,
  });

  if (!validationResult.success) {
    return { error: fromZodError(validationResult.error).toString() };
  }

  await prisma.agent.update({
    where: { id },
    data: {
      name,
      model,
      systemPrompt,
      modelSettings: modelSettings ? JSON.parse(modelSettings) : null,
      cacheControlTtl,
    },
  });

  revalidatePath("/agents");
  revalidatePath(`/agents/${id}/edit`);
  redirect(`/agents/${id}`);
}

export async function deleteAgent(formData: FormData) {
  const id = Number(formData.get("id"));
  await prisma.agent.delete({ where: { id } });
  redirect("/agents");
}

export async function toggleAgentPublished(formData: FormData) {
  const id = Number(formData.get("id"));
  const published = Number(formData.get("published"));

  await prisma.agent.update({
    where: { id },
    data: { published: !published },
  });

  revalidatePath(`/agents/${id}`);
  redirect(`/agents/${id}`);
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors referencing `app/(dashboard)/agents/actions.ts`

- [ ] **Step 3: Commit**

```bash
git add "app/(dashboard)/agents/actions.ts"
git commit -m "Add Agent server actions"
```

---

### Task 4: Extract a shared `<ModelPicker>` component

**Goal:** The grouped/badged model `Select` built in the model-catalog plan's Task 4 lives inline in `workflow-form.tsx`. Now that `agent-form.tsx` (Task 9) needs the identical picker, extract it into a standalone component both forms use — this is the right point to extract (second real consumer), not before.

**Files:**
- Create: `components/console/model-picker.tsx`
- Modify: `components/console/workflow/workflow-form.tsx`

**Acceptance Criteria:**
- [ ] `ModelPicker` accepts `{ value: AIModel; onChange: (model: AIModel) => void }` and renders exactly the grouped/badged/deprecated-aware Select the model-catalog plan built
- [ ] `workflow-form.tsx` uses `<ModelPicker>` instead of its inline `Select`/`SelectContent` JSX; the model search input above it stays in `workflow-form.tsx` (search state stays local to whichever form embeds the picker) and is passed down as a `search` prop
- [ ] Visual behavior is unchanged from the model-catalog plan's Task 4 (grouping, badges, deprecated section, search filtering)
- [ ] `npx tsc --noEmit` passes

**Verify:** `npx tsc --noEmit` → no errors; manual check per Step 3 below

**Steps:**

- [ ] **Step 1: Create `components/console/model-picker.tsx`**

```tsx
"use client";

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
  type AIModel,
  type ModelCompany,
} from "@/data/workflow";
import { AlertTriangle, Braces, BrainCircuit, Eye, Globe, Layers } from "lucide-react";
import { useMemo } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";

const COMPANY_ORDER: ModelCompany[] = [
  "OpenAI", "Anthropic", "Google", "xAI", "Perplexity", "Meta", "Mistral", "DeepSeek", "Qwen", "Cohere",
];

type Props = {
  value: AIModel;
  onChange: (model: AIModel) => void;
  search?: string;
  name?: string;
};

export function ModelPicker({ value, onChange, search = "", name = "model" }: Props) {
  const filteredModels = useMemo(() => {
    return AIModels.filter((m) =>
      AIModelToLabel[m].toLowerCase().includes(search.toLowerCase()),
    );
  }, [search]);

  const groupedModels = useMemo(() => {
    const active = filteredModels.filter((m) => !isDeprecated(m));
    const deprecated = filteredModels.filter((m) => isDeprecated(m));
    const groups = COMPANY_ORDER.map((company) => ({
      company,
      models: active.filter((m) => getModelCompany(m) === company),
    })).filter((g) => g.models.length > 0);
    return { groups, deprecated };
  }, [filteredModels]);

  return (
    <Select name={name} value={value} onValueChange={(val) => onChange(val as AIModel)}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Select a model" />
      </SelectTrigger>
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
    </Select>
  );
}
```

- [ ] **Step 2: Replace `workflow-form.tsx`'s inline picker with `<ModelPicker>`**

Remove the now-unused imports this file only used for the inline picker (`getDeprecationInfo`, `getModelCompany`, `hasLargeContextWindow`, `hasReasoning`, `hasStructuredOutput`, `hasWebSearch`, `isDeprecated`, `type ModelCompany`, the `AlertTriangle`/`Braces`/`BrainCircuit`/`Eye`/`Globe`/`Layers` icons, and `SelectGroup`/`SelectLabel`) — keep `AIModels`, `AIModelToLabel`, `isVisionCapable` only if still used elsewhere in the file (check before removing; `isVisionCapable` is still used later in the file for the image-input-type warning, so keep that one). Remove the `COMPANY_ORDER` and `groupedModels` memo you added in the model-catalog plan's Task 4 (now living in `ModelPicker` instead).

Change the `<Select name="model" ...><SelectTrigger>...</SelectTrigger><SelectContent>...</SelectContent></Select>` block down to:

```tsx
              <ModelPicker
                value={model}
                onChange={(val) => {
                  setModel(val);
                  updateInputs({ model: val });
                }}
                search={modelSearch}
              />
```

and add the import:

```typescript
import { ModelPicker } from "../model-picker";
```

- [ ] **Step 3: Typecheck and manual verification**

Run: `npx tsc --noEmit` → no errors referencing `workflow-form.tsx` or `model-picker.tsx`.

Then `npm run dev`, open `http://localhost:3000/workflows/new`. Confirm the model dropdown behaves identically to before this task: grouped by company, capability badges, collapsed Deprecated group, search box filtering.

- [ ] **Step 4: Commit**

```bash
git add components/console/model-picker.tsx components/console/workflow/workflow-form.tsx
git commit -m "Extract shared ModelPicker component for reuse by Agents"
```

---

### Task 5: Shared chat core (`lib/utils/agent-chat.ts`)

**Goal:** One function both the dashboard route and the public API route call to actually talk to the model.

**Files:**
- Modify: `lib/utils/ai.ts` (export the existing internal `getOpenRouterHeaders`)
- Create: `lib/utils/agent-chat.ts`

**Acceptance Criteria:**
- [ ] `runAgentChat` prepends the agent's system prompt, resolves the real OpenRouter model id (including the `:online` suffix when the model + settings call for web search), applies `reasoningEffort` from the agent's `modelSettings`, and returns the raw `streamText` result
- [ ] An optional `onFinish` callback is threaded through to `streamText`'s own `onFinish` option
- [ ] `npx tsc --noEmit` passes

**Verify:** `npx tsc --noEmit` → no errors referencing either file

**Steps:**

- [ ] **Step 1: Export `getOpenRouterHeaders` from `lib/utils/ai.ts`**

Change:

```typescript
const getOpenRouterHeaders = () => {
```

to:

```typescript
export const getOpenRouterHeaders = () => {
```

- [ ] **Step 2: Create `lib/utils/agent-chat.ts`**

```typescript
import type { ModelSettings } from "@/components/console/workflow/workflow-model-settings";
import { hasWebSearch, modelToProviderId, type AIModel } from "@/data/workflow";
import type { Agent } from "@/generated/prisma-client/client";
import { getOpenRouterHeaders } from "@/lib/utils/ai";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { streamText, type ModelMessage } from "ai";

type FinishEvent = {
  text?: string;
  usage?: { totalTokens?: number };
};

export function runAgentChat({
  agent,
  messages,
  onFinish,
}: {
  agent: Pick<Agent, "model" | "systemPrompt" | "modelSettings">;
  messages: ModelMessage[];
  onFinish?: (event: FinishEvent) => void | Promise<void>;
}) {
  const openrouter = createOpenRouter({ apiKey: process.env.OPENROUTER_API_KEY });
  const settings = (agent.modelSettings as unknown as ModelSettings) ?? undefined;
  const model = agent.model as AIModel;

  let providerModelId = modelToProviderId[model] ?? agent.model;
  const shouldEnableWebSearch = settings?.enableWebSearch !== false;
  if (hasWebSearch(model) && shouldEnableWebSearch && !providerModelId.startsWith("perplexity/")) {
    providerModelId = `${providerModelId}:online`;
  }

  const providerOptions =
    settings?.reasoningEffort && settings.reasoningEffort !== "none"
      ? { openrouter: { reasoning: { effort: settings.reasoningEffort } } }
      : undefined;

  return streamText({
    model: openrouter(providerModelId),
    headers: getOpenRouterHeaders(),
    messages: [{ role: "system", content: agent.systemPrompt }, ...messages],
    temperature: settings?.temperature ?? 0.7,
    topP: settings?.topP ?? 1,
    frequencyPenalty: settings?.frequencyPenalty ?? 0,
    presencePenalty: settings?.presencePenalty ?? 0,
    providerOptions,
    onFinish,
  });
}
```

- [ ] **Step 3: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors referencing `lib/utils/ai.ts` or `lib/utils/agent-chat.ts`

- [ ] **Step 4: Commit**

```bash
git add lib/utils/ai.ts lib/utils/agent-chat.ts
git commit -m "Add shared Agent chat core"
```

---

### Task 6: Dashboard chat route (`app/api/agents/[agentId]/chat/route.ts`)

**Goal:** Session-authenticated streaming endpoint that powers the in-dashboard chat playground.

**Files:**
- Create: `app/api/agents/[agentId]/chat/route.ts`

**Acceptance Criteria:**
- [ ] Requires a valid session (`owner()`) and that the agent belongs to the caller's organization
- [ ] Blocks with 402 when the organization has 0 credits and no active subscription/spend-limit headroom, matching Workflows' exact blocking logic
- [ ] Accepts `{ messages: UIMessage[] }`, converts to model messages, calls `runAgentChat`, returns `toUIMessageStreamResponse()`
- [ ] On finish: deducts credits via `reportUsage` and logs `prisma.agentRun.create({ source: "dashboard" })`
- [ ] `npx tsc --noEmit` passes

**Verify:** `npx tsc --noEmit` → no errors; manual check per Step 3 below

**Steps:**

- [ ] **Step 1: Write the route**

```typescript
import { convertToModelMessages, type UIMessage } from "ai";
import { type NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { waitUntil } from "@vercel/functions";
import { owner } from "@/lib/hooks/useOwner";
import { runAgentChat } from "@/lib/utils/agent-chat";
import { prisma } from "@/lib/utils/db";
import {
  hasExceededSpendLimit,
  isSubscriptionActive,
  reportUsage,
} from "@/lib/utils/stripe";

export const maxDuration = 300;

export async function POST(
  req: NextRequest,
  props: { params: Promise<{ agentId: string }> },
) {
  const params = await props.params;
  const { ownerId } = await owner();
  if (!ownerId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [agent, organization] = await Promise.all([
    prisma.agent.findFirst({
      where: { id: Number(params.agentId), ownerId },
    }),
    prisma.organization.findUnique({
      where: { id: ownerId },
      include: { stripe: true },
    }),
  ]);

  if (!agent) {
    return NextResponse.json({ error: "Agent not found" }, { status: 404 });
  }
  if (!organization) {
    return NextResponse.json({ error: "Organization not found" }, { status: 401 });
  }

  if ((organization.credits ?? 0) <= 0) {
    if (!isSubscriptionActive(organization.stripe?.subscription)) {
      return NextResponse.json(
        { error: "No credits remaining. Please add credits to continue using the service." },
        { status: 402 },
      );
    }
    if (
      await hasExceededSpendLimit(organization.spendLimit, organization.stripe?.customerId)
    ) {
      return NextResponse.json(
        { error: "Spend limit exceeded. Please increase your spend limit to continue using the service." },
        { status: 402 },
      );
    }
    return NextResponse.json(
      { error: "No credits remaining. Please add credits to continue using the service." },
      { status: 402 },
    );
  }

  const { messages }: { messages: UIMessage[] } = await req.json();
  const subscription = organization.stripe?.subscription as unknown as Stripe.Subscription;

  const result = runAgentChat({
    agent,
    messages: convertToModelMessages(messages),
    onFinish: async (event) => {
      const totalTokenCount = event.usage?.totalTokens ?? 0;
      const runPromise = Promise.all([
        reportUsage(ownerId, subscription, totalTokenCount),
        prisma.agentRun.create({
          data: {
            agentId: agent.id,
            source: "dashboard",
            totalTokenCount,
            createdBy: ownerId,
          },
        }),
      ]).catch((error) => console.error(error));
      waitUntil(runPromise);
      await runPromise;
    },
  });

  return result.toUIMessageStreamResponse();
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors referencing this file

- [ ] **Step 3: Manual verification (after Task 7 gives you a UI to drive this with)**

Deferred to Task 7's verification step, since there's no UI to call this route until then.

- [ ] **Step 4: Commit**

```bash
git add "app/api/agents/[agentId]/chat/route.ts"
git commit -m "Add session-authenticated dashboard chat route for Agents"
```

---

### Task 7: Chat playground UI (`components/console/agent/agent-chat.tsx`)

**Goal:** A `useChat`-powered chat UI with localStorage-persisted history and a "Clear conversation" button.

**Files:**
- Modify: `package.json` (add `@ai-sdk/react`)
- Create: `components/console/agent/agent-chat.tsx`

**Acceptance Criteria:**
- [ ] Sending a message streams the assistant's reply into view
- [ ] Reloading the page restores the conversation from `localStorage`
- [ ] "Clear conversation" empties both the visible thread and the stored value
- [ ] `npx tsc --noEmit` passes

**Verify:** `npx tsc --noEmit` → no errors; manual check per Step 3 below

**Steps:**

- [ ] **Step 1: Add the dependency**

Run: `npm install @ai-sdk/react@^2.0.0`

Verified against the npm registry at plan-writing time: `@ai-sdk/react`'s `2.x` line (currently `2.0.212`) is the one built against `ai@5.0.210`, matching this repo's `ai@^5.0.56`. Do **not** install `@ai-sdk/react` without a version range — its `latest` npm tag currently resolves to `4.0.23`, which targets a newer major of `ai` this repo doesn't have and would silently mismatch.

- [ ] **Step 2: Write the component**

```tsx
"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useEffect, useMemo, useState } from "react";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";

type Props = {
  agentId: number;
};

function loadStoredMessages(storageKey: string): UIMessage[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = window.localStorage.getItem(storageKey);
    return stored ? (JSON.parse(stored) as UIMessage[]) : [];
  } catch {
    return [];
  }
}

export function AgentChat({ agentId }: Props) {
  const storageKey = `agent-chat:${agentId}`;
  const [input, setInput] = useState("");
  const initialMessages = useMemo(() => loadStoredMessages(storageKey), [storageKey]);

  const transport = useMemo(
    () => new DefaultChatTransport({ api: `/api/agents/${agentId}/chat` }),
    [agentId],
  );

  const { messages, sendMessage, status, setMessages } = useChat({
    transport,
    messages: initialMessages,
  });

  useEffect(() => {
    window.localStorage.setItem(storageKey, JSON.stringify(messages));
  }, [messages, storageKey]);

  const handleSend = () => {
    if (!input.trim()) return;
    sendMessage({ text: input });
    setInput("");
  };

  const handleClear = () => {
    setMessages([]);
    window.localStorage.removeItem(storageKey);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <Button variant="outline" size="sm" onClick={handleClear}>
          Clear conversation
        </Button>
      </div>
      <div className="flex flex-col gap-3 min-h-[300px]">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`rounded-lg p-3 max-w-[80%] ${
              message.role === "user"
                ? "self-end bg-pink-500 text-white"
                : "self-start bg-slate-100 dark:bg-slate-800"
            }`}
          >
            {message.parts
              .filter((part) => part.type === "text")
              .map((part, i) => (
                <p key={i} className="whitespace-pre-wrap">
                  {(part as { type: "text"; text: string }).text}
                </p>
              ))}
          </div>
        ))}
        {status === "streaming" && (
          <p className="text-sm text-muted-foreground self-start">Thinking…</p>
        )}
      </div>
      <div className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder="Send a message..."
        />
        <Button onClick={handleSend} disabled={status === "streaming"}>
          Send
        </Button>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors referencing this file. (Full manual verification happens in Task 10, once this component is mounted on a real page.)

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json components/console/agent/agent-chat.tsx
git commit -m "Add Agent chat playground UI with localStorage persistence"
```

---

### Task 8: Public OpenAI-compatible API (`app/api/v1/chat/completions/route.ts`)

**Goal:** A secret-key-authenticated endpoint speaking OpenAI's Chat Completions wire format closely enough that the official `openai` SDK works against it unmodified.

**Files:**
- Create: `app/api/v1/chat/completions/route.ts`

**Acceptance Criteria:**
- [ ] `Authorization: Bearer <secretKey>` required; invalid/missing key returns an OpenAI-shaped 401
- [ ] Rate-limited per key the same way `/api/v1/run` is
- [ ] `model` in the request body is looked up as an `Agent.shortId` scoped to the key's organization, and must be `published`
- [ ] 0-credit organizations are blocked with an OpenAI-shaped `insufficient_quota` 402
- [ ] Non-streaming requests return a `chat.completion` JSON body with `choices[0].message` and `usage`
- [ ] Streaming requests (`stream: true`) return real `chat.completion.chunk` SSE lines ending in `data: [DONE]`
- [ ] Identical repeated requests within `agent.cacheControlTtl` are served from cache
- [ ] Every completion (cached or not) deducts credits and logs an `AgentRun{source:"api"}`
- [ ] `npx tsc --noEmit` passes

**Verify:** `npx tsc --noEmit` → no errors; manual check per Step 3 below

**Steps:**

- [ ] **Step 1: Write the route**

```typescript
import type { ModelMessage } from "ai";
import { type NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { waitUntil } from "@vercel/functions";
import { runAgentChat } from "@/lib/utils/agent-chat";
import { prisma } from "@/lib/utils/db";
import { validateRateLimit } from "@/lib/utils/ratelimit";
import {
  hasExceededSpendLimit,
  isSubscriptionActive,
  reportUsage,
} from "@/lib/utils/stripe";
import { cacheAgentResult, getAgentCachedResult } from "@/lib/utils/useAgent";

export const maxDuration = 300;

const openAIError = (message: string, status: number, type = "invalid_request_error") =>
  NextResponse.json({ error: { message, type, code: null } }, { status });

const estimateTokens = (input: string, output: string) => {
  const inputWords = input.trim() ? input.trim().split(/\s+/).length : 0;
  const outputWords = output.trim() ? output.trim().split(/\s+/).length : 0;
  return Math.floor((inputWords + outputWords) * 0.6);
};

const mapFinishReason = (reason: string): string => {
  if (reason === "length") return "length";
  if (reason === "tool-calls") return "tool_calls";
  if (reason === "content-filter") return "content_filter";
  return "stop";
};

const buildChatCompletion = (
  id: string,
  created: number,
  model: string,
  content: string,
  totalTokens: number,
  finishReason = "stop",
) => ({
  id,
  object: "chat.completion",
  created,
  model,
  choices: [
    { index: 0, message: { role: "assistant", content }, finish_reason: finishReason },
  ],
  usage: { prompt_tokens: 0, completion_tokens: totalTokens, total_tokens: totalTokens },
});

const sseChunk = (
  id: string,
  created: number,
  model: string,
  delta: Record<string, unknown>,
  finishReason: string | null,
) =>
  `data: ${JSON.stringify({
    id,
    object: "chat.completion.chunk",
    created,
    model,
    choices: [{ index: 0, delta, finish_reason: finishReason }],
  })}\n\n`;

function streamPlainText(id: string, created: number, model: string, text: string) {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      controller.enqueue(encoder.encode(sseChunk(id, created, model, { role: "assistant" }, null)));
      controller.enqueue(encoder.encode(sseChunk(id, created, model, { content: text }, null)));
      controller.enqueue(encoder.encode(sseChunk(id, created, model, {}, "stop")));
      controller.enqueue(encoder.encode("data: [DONE]\n\n"));
      controller.close();
    },
  });
  return new Response(stream, {
    headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache", Connection: "keep-alive" },
  });
}

export async function POST(req: NextRequest) {
  const authorization = req.headers.get("authorization");
  const token = authorization?.split("Bearer ")[1];
  if (!token) {
    return openAIError("Missing bearer token", 401, "authentication_error");
  }

  const key = await prisma.secretKey.findUnique({
    where: { key: token },
    include: { organization: { include: { stripe: true } } },
  });
  if (!key) {
    return openAIError("Invalid API key", 401, "authentication_error");
  }

  const rateLimitKey = `key_${key.ownerId}_${key.id}`;
  const { success: rateLimitOk } = await validateRateLimit(rateLimitKey, key.rateLimitPerSecond);
  if (!rateLimitOk) {
    return openAIError("Rate limit exceeded", 429, "rate_limit_error");
  }

  const organization = key.organization;
  if ((organization?.credits ?? 0) <= 0) {
    if (!isSubscriptionActive(organization?.stripe?.subscription)) {
      return openAIError("You exceeded your current quota", 402, "insufficient_quota");
    }
    if (
      await hasExceededSpendLimit(organization?.spendLimit, organization?.stripe?.customerId)
    ) {
      return openAIError("Spend limit exceeded", 402, "insufficient_quota");
    }
    return openAIError("You exceeded your current quota", 402, "insufficient_quota");
  }

  const body = await req.json().catch(() => null);
  if (!body?.model || !Array.isArray(body?.messages)) {
    return openAIError("Missing required fields: model, messages", 400);
  }

  const agent = await prisma.agent.findFirst({
    where: { shortId: body.model, ownerId: key.ownerId, published: true },
  });
  if (!agent) {
    return openAIError(
      `The model '${body.model}' does not exist or is not published`,
      404,
      "invalid_request_error",
    );
  }

  const messages: ModelMessage[] = body.messages.map((m: { role: string; content: string }) => ({
    role: m.role,
    content: m.content,
  }));
  const stream = Boolean(body.stream);
  const rawBody = JSON.stringify(body);
  const subscription = organization?.stripe?.subscription as unknown as Stripe.Subscription;
  const created = Math.floor(Date.now() / 1000);
  const completionId = `chatcmpl-${created}-${agent.shortId}`;

  const cached = agent.cacheControlTtl
    ? await getAgentCachedResult(agent.shortId, rawBody)
    : null;

  if (cached) {
    const totalTokenCount = estimateTokens(rawBody, cached);
    waitUntil(
      Promise.all([
        reportUsage(agent.ownerId, subscription, totalTokenCount),
        prisma.agentRun.create({
          data: { agentId: agent.id, source: "api", totalTokenCount },
        }),
      ]).catch((error) => console.error(error)),
    );

    return stream
      ? streamPlainText(completionId, created, agent.shortId, cached)
      : NextResponse.json(buildChatCompletion(completionId, created, agent.shortId, cached, totalTokenCount));
  }

  if (stream) {
    const result = runAgentChat({
      agent,
      messages,
      onFinish: async (event) => {
        const totalTokenCount = event.usage?.totalTokens ?? 0;
        await Promise.all([
          reportUsage(agent.ownerId, subscription, totalTokenCount),
          prisma.agentRun.create({
            data: { agentId: agent.id, source: "api", totalTokenCount },
          }),
          agent.cacheControlTtl
            ? cacheAgentResult(agent.shortId, rawBody, event.text ?? "", agent.cacheControlTtl)
            : null,
        ]);
      },
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        controller.enqueue(
          encoder.encode(sseChunk(completionId, created, agent.shortId, { role: "assistant" }, null)),
        );
        for await (const delta of result.textStream) {
          controller.enqueue(
            encoder.encode(sseChunk(completionId, created, agent.shortId, { content: delta }, null)),
          );
        }
        const finishReason = mapFinishReason(await result.finishReason);
        controller.enqueue(
          encoder.encode(sseChunk(completionId, created, agent.shortId, {}, finishReason)),
        );
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
      },
    });

    return new Response(readable, {
      headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache", Connection: "keep-alive" },
    });
  }

  const result = runAgentChat({ agent, messages });
  const text = await result.text;
  const usage = await result.usage;
  const finishReason = mapFinishReason(await result.finishReason);
  const totalTokenCount = usage?.totalTokens ?? 0;

  waitUntil(
    Promise.all([
      reportUsage(agent.ownerId, subscription, totalTokenCount),
      prisma.agentRun.create({
        data: { agentId: agent.id, source: "api", totalTokenCount },
      }),
      agent.cacheControlTtl
        ? cacheAgentResult(agent.shortId, rawBody, text, agent.cacheControlTtl)
        : null,
    ]).catch((error) => console.error(error)),
  );

  return NextResponse.json(
    buildChatCompletion(completionId, created, agent.shortId, text, totalTokenCount, finishReason),
  );
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors referencing this file

- [ ] **Step 3: Manual verification (needs a real agent — do this once Task 9 gives you a way to create one and a secret key from Settings)**

Install the OpenAI SDK for a one-off test script (not a project dependency): `npm install --no-save openai`. Then, with a real secret key from `/settings` and a published agent's `shortId`:

```javascript
// scratch-test.mjs — run with: node scratch-test.mjs
import OpenAI from "openai";

const client = new OpenAI({
  baseURL: "http://localhost:3000/api/v1",
  apiKey: "YOUR_SECRET_KEY",
});

const nonStreaming = await client.chat.completions.create({
  model: "YOUR_AGENT_SHORT_ID",
  messages: [{ role: "user", content: "Say hello in exactly 3 words." }],
});
console.log("Non-streaming:", nonStreaming.choices[0].message.content);

const streamResp = await client.chat.completions.create({
  model: "YOUR_AGENT_SHORT_ID",
  messages: [{ role: "user", content: "Count from 1 to 5." }],
  stream: true,
});
let streamed = "";
for await (const chunk of streamResp) {
  streamed += chunk.choices[0]?.delta?.content ?? "";
}
console.log("Streamed:", streamed);
```

Expected: both calls succeed with real assistant text, using zero custom request-format code — only `baseURL`, `apiKey`, and `model` needed to be set. Delete `scratch-test.mjs` afterward, it's not part of the repo.

- [ ] **Step 4: Commit**

```bash
git add "app/api/v1/chat/completions/route.ts"
git commit -m "Add OpenAI-compatible public chat completions API for Agents"
```

---

### Task 9: Dashboard CRUD pages (list, new, edit, form, list item)

**Goal:** The Agents equivalent of the Workflows list/new/edit pages, reusing `<ModelPicker>` and `<WorkflowModelSettings>` from the model-catalog plan.

**Files:**
- Create: `components/console/agent/agent-form.tsx`
- Create: `components/console/agent/agent-item.tsx`
- Create: `app/(dashboard)/agents/page.tsx`
- Create: `app/(dashboard)/agents/new/page.tsx`
- Create: `app/(dashboard)/agents/[agentId]/edit/page.tsx`

**Acceptance Criteria:**
- [ ] `/agents` lists the current org's agents with search + pagination, mirroring `/workflows`
- [ ] `/agents/new` creates an agent (name, system prompt, model picker, advanced model settings, cache TTL) and redirects to its detail page
- [ ] `/agents/[agentId]/edit` edits the same fields
- [ ] `npx tsc --noEmit` passes

**Verify:** `npx tsc --noEmit` → no errors; manual check per Step 6 below

**Steps:**

- [ ] **Step 1: `components/console/agent/agent-form.tsx`**

```tsx
"use client";

import type { Agent } from "@/generated/prisma-client/client";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { SaveButton } from "../../form/button";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Textarea } from "../../ui/textarea";
import { ModelPicker } from "../model-picker";
import {
  type ModelSettings,
  WorkflowModelSettings,
} from "../workflow/workflow-model-settings";

interface Props {
  agent?: Agent;
  action: (data: FormData) => Promise<any>;
}

export function AgentForm({ agent, action }: Props) {
  const [model, setModel] = useState(agent?.model ?? "gpt-4o");
  const [modelSearch, setModelSearch] = useState("");
  const [showAdvancedModelParams, setShowAdvancedModelParams] = useState(false);
  const [modelSettings, setModelSettings] = useState(
    (agent?.modelSettings as ModelSettings) ?? {},
  );

  const updateModel = useCallback((val: string) => {
    setModel(val);
  }, []);

  return (
    <form
      className="space-y-12 sm:space-y-16"
      onSubmit={async (e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const result = await action(formData);
        if (result?.error) {
          toast.error(result.error);
        } else {
          toast.success("Agent saved successfully");
        }
      }}
    >
      {agent?.id && (
        <input type="number" name="id" className="hidden" defaultValue={Number(agent.id)} />
      )}

      <div className="space-y-8 border-b pb-12 sm:space-y-0 sm:divide-y sm:border-t sm:pb-0">
        <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:py-6">
          <Label htmlFor="name" className="sm:pt-1.5">Name</Label>
          <div className="mt-2 sm:col-span-2 sm:mt-0">
            <Input id="name" name="name" defaultValue={agent?.name} required minLength={2} maxLength={150} />
          </div>
        </div>

        <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:py-6">
          <Label htmlFor="model" className="sm:pt-1.5">Model</Label>
          <div className="mt-2 sm:col-span-2 sm:mt-0">
            <Input
              type="text"
              placeholder="Search models..."
              value={modelSearch}
              onChange={(e) => setModelSearch(e.target.value)}
              className="mb-2"
            />
            <ModelPicker value={model as any} onChange={updateModel} search={modelSearch} />

            <Button
              className="px-0 mt-2"
              variant="link"
              type="button"
              onClick={() => setShowAdvancedModelParams((prev) => !prev)}
            >
              {showAdvancedModelParams ? "Hide" : "Show"} Advanced Model Params
            </Button>

            {showAdvancedModelParams && (
              <WorkflowModelSettings
                defaultValue={modelSettings}
                onChange={setModelSettings}
                model={model as any}
              />
            )}

            <Input type="hidden" name="modelSettings" value={JSON.stringify(modelSettings)} />
          </div>
        </div>

        <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:py-6">
          <Label htmlFor="systemPrompt" className="sm:pt-1.5">System Prompt</Label>
          <div className="mt-2 sm:col-span-2 sm:mt-0">
            <Textarea
              id="systemPrompt"
              name="systemPrompt"
              rows={8}
              defaultValue={agent?.systemPrompt}
              placeholder="You are a helpful assistant that..."
              required
            />
          </div>
        </div>

        <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:py-6">
          <Label htmlFor="cacheControlTtl" className="sm:pt-1.5">
            Cache TTL (seconds)
          </Label>
          <div className="mt-2 sm:col-span-2 sm:mt-0">
            <Input
              id="cacheControlTtl"
              name="cacheControlTtl"
              type="number"
              min={0}
              max={86400}
              defaultValue={agent?.cacheControlTtl ?? 0}
            />
          </div>
        </div>
      </div>

      <SaveButton />
    </form>
  );
}
```

- [ ] **Step 2: `components/console/agent/agent-item.tsx`**

```tsx
import { ChevronRightIcon } from "lucide-react";
import classNames from "classnames";
import { Badge } from "@/components/ui/badge";
import { type AIModel, AIModelToLabel, isDeprecated } from "@/data/workflow";
import type { Agent } from "@/generated/prisma-client/client";
import { getAgentUsage } from "@/lib/utils/useAgent";

interface Props {
  agent: Pick<Agent, "id" | "name" | "createdAt" | "updatedAt" | "published" | "model">;
}

export async function AgentItem({ agent }: Props) {
  const usage = await getAgentUsage(agent.id);
  const modelLabel = AIModelToLabel[agent.model as AIModel] || agent.model;
  const modelIsDeprecated = isDeprecated(agent.model as AIModel);

  return (
    <div className="relative flex items-center space-x-4 p-4 bg-white hover:bg-gray-50 dark:bg-black dark:hover:bg-[#2a2a2a]">
      <div className="min-w-0 flex-auto">
        <div className="flex items-center gap-x-2">
          <span
            className={classNames(
              agent.published ? "bg-green-100 dark:bg-green-900" : "bg-gray-100 dark:bg-card",
              "h-4 w-4 flex items-center justify-center",
            )}
            aria-hidden="true"
          >
            <span className={classNames(agent.published ? "bg-green-400" : "bg-red-500", "h-2 w-2")} />
          </span>
          <h2 className="min-w-0 font-medium">
            <a href={`/agents/${agent.id}`} className="flex gap-x-2">
              <span className="truncate">{agent.name}</span>
              <span className="absolute inset-0" />
            </a>
          </h2>
        </div>
        <div className="mt-1 ml-6 text-xs md:text-sm flex items-center gap-x-2.5 text-gray-500 dark:text-gray-400">
          <p className="truncate">{Number(usage?.tokens ?? 0).toLocaleString()} tokens</p>
          <svg viewBox="0 0 2 2" className="h-0.5 w-0.5 flex-none fill-gray-300">
            <circle r={1} cx={1} cy={1} />
          </svg>
          <p className="whitespace-nowrap">{Number(usage?.runs ?? 0).toLocaleString()} runs</p>
        </div>
      </div>
      <Badge variant={modelIsDeprecated ? "destructive" : "outline"}>{modelLabel}</Badge>
      <ChevronRightIcon aria-hidden="true" className="h-5 w-5 flex-none" />
    </div>
  );
}
```

- [ ] **Step 3: `app/(dashboard)/agents/page.tsx`**

```tsx
import { AgentItem } from "@/components/console/agent/agent-item";
import EmptyState from "@/components/core/empty-state";
import PageTitle from "@/components/layout/page-title";
import { WorkflowSearch } from "@/components/workflows/workflow-search";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { owner } from "@/lib/hooks/useOwner";
import { cn } from "@/lib/utils";
import { AGENT_LIMIT, getAgentsForOwner } from "@/lib/utils/useAgent";

interface Props {
  searchParams: Promise<{ search: string; page: string }>;
}

export default async function Agents(props: Props) {
  const searchParams = await props.searchParams;
  const { ownerId } = await owner();
  const currentPage = searchParams.page ? Number.parseInt(searchParams.page) : 1;

  const { agents, count } = await getAgentsForOwner({
    ownerId,
    search: searchParams.search,
    page: currentPage,
  });

  const totalPages = Math.ceil(count / AGENT_LIMIT);

  return (
    <>
      <PageTitle
        title={searchParams.search ? `Search '${searchParams.search}'` : "Agents"}
        backUrl={searchParams.search ? "/agents" : undefined}
        actionLabel="New"
        actionLink="/agents/new"
      />
      <div className="flex max-w-7xl px-4 xl:px-0 sm:mx-auto py-4 space-x-4 items-center">
        <div className="flex-1">
          <WorkflowSearch />
        </div>
      </div>
      <div className="mx-auto mt-8 flex max-w-7xl flex-col">
        {agents.length === 0 ? (
          <EmptyState label="agent" show={agents.length === 0} createLink="/agents/new" />
        ) : null}

        {agents.length > 0 ? (
          <div className="divide-y border rounded-md overflow-hidden">
            {agents.map((agent) => (
              // @ts-ignore
              <AgentItem key={agent.id} agent={agent} />
            ))}
          </div>
        ) : null}

        {agents.length > 0 && totalPages > 1 ? (
          <div className="py-4">
            <Pagination>
              <PaginationContent>
                {currentPage > 1 ? (
                  <PaginationItem>
                    <PaginationPrevious href={`/agents?page=${currentPage - 1}`} />
                  </PaginationItem>
                ) : null}
                {Array.from({ length: Math.min(totalPages, 5) }, (_, idx) => {
                  const pageNumber = idx + 1;
                  return (
                    <PaginationItem key={`page-${pageNumber}`}>
                      <PaginationLink
                        href={`/agents?page=${pageNumber}`}
                        className={cn(pageNumber === currentPage && "text-primary font-semibold")}
                      >
                        {pageNumber}
                      </PaginationLink>
                    </PaginationItem>
                  );
                })}
                {(currentPage - 1) * AGENT_LIMIT + agents.length < count ? (
                  <PaginationItem>
                    <PaginationNext href={`/agents?page=${currentPage + 1}`} />
                  </PaginationItem>
                ) : null}
              </PaginationContent>
            </Pagination>
          </div>
        ) : null}
      </div>
    </>
  );
}
```

- [ ] **Step 4: `app/(dashboard)/agents/new/page.tsx`**

```tsx
import { AgentForm } from "@/components/console/agent/agent-form";
import PageTitle from "@/components/layout/page-title";
import { createAgent } from "../actions";

export default function NewAgent() {
  return (
    <>
      <PageTitle title="New Agent" backUrl="/agents" />
      <div className="mx-auto max-w-3xl px-4 xl:px-0 py-8">
        <AgentForm action={createAgent} />
      </div>
    </>
  );
}
```

- [ ] **Step 5: `app/(dashboard)/agents/[agentId]/edit/page.tsx`**

```tsx
import { notFound } from "next/navigation";
import { AgentForm } from "@/components/console/agent/agent-form";
import PageTitle from "@/components/layout/page-title";
import { getAgentById } from "@/lib/utils/useAgent";
import { updateAgent } from "../../actions";

interface Props {
  params: Promise<{ agentId: string }>;
}

export default async function EditAgent(props: Props) {
  const params = await props.params;
  const agent = await getAgentById(Number(params.agentId));
  if (!agent) notFound();

  return (
    <>
      <PageTitle title={`Edit ${agent.name}`} backUrl={`/agents/${agent.id}`} />
      <div className="mx-auto max-w-3xl px-4 xl:px-0 py-8">
        <AgentForm agent={agent} action={updateAgent} />
      </div>
    </>
  );
}
```

- [ ] **Step 6: Typecheck and manual verification**

Run: `npx tsc --noEmit` → no errors referencing any file from this task.

Then `npm run dev`, visit `http://localhost:3000/agents` (empty state should show), click "New", fill in name/system prompt/model, save — confirm redirect to the new agent's detail page (this 404s until Task 10 adds that page; that's expected for now), go back to `/agents` and confirm the new agent is listed, click into "Edit", change the name, save, confirm it persisted.

- [ ] **Step 7: Commit**

```bash
git add components/console/agent app/\(dashboard\)/agents/page.tsx app/\(dashboard\)/agents/new app/\(dashboard\)/agents/\[agentId\]/edit
git commit -m "Add Agent list, create, and edit pages"
```

---

### Task 10: Agent detail (chat playground), usage page, API snippet, navigation

**Goal:** Wire the chat playground into a real page, add the Usage tab, show an API code sample, and add Agents to the dashboard nav.

**Files:**
- Create: `app/(dashboard)/agents/[agentId]/page.tsx`
- Create: `app/(dashboard)/agents/[agentId]/usage/page.tsx`
- Modify: `components/console/navbar.tsx`

**Acceptance Criteria:**
- [ ] `/agents/[agentId]` hosts a Publish/Unpublish toggle (wired to the `toggleAgentPublished` action from Task 3), the `<AgentChat>` playground, and a curl/JS code sample for the public API
- [ ] `/agents/[agentId]/usage` shows a 30-day chart + recent-activity table (timestamp, source, tokens) sourced from `AgentRun`
- [ ] The dashboard nav shows an "Agents" tab alongside Workflows/Statistics/Settings, and Chat/Edit/Usage sub-tabs when viewing a specific agent
- [ ] `npx tsc --noEmit` passes

**Verify:** `npx tsc --noEmit` → no errors; manual check per Step 5 below

**Steps:**

- [ ] **Step 1: `app/(dashboard)/agents/[agentId]/page.tsx`**

```tsx
import { notFound } from "next/navigation";
import { AgentChat } from "@/components/console/agent/agent-chat";
import { ApiCodeSnippet } from "@/components/code/snippet";
import PageTitle from "@/components/layout/page-title";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getAgentById } from "@/lib/utils/useAgent";
import { toggleAgentPublished } from "../actions";

interface Props {
  params: Promise<{ agentId: string }>;
}

export default async function AgentDetail(props: Props) {
  const params = await props.params;
  const agent = await getAgentById(Number(params.agentId));
  if (!agent) notFound();

  const appUrl = process.env.NEXT_PUBLIC_APP_BASE_URL || "https://manageprompt.com";

  return (
    <>
      <PageTitle title={agent.name} backUrl="/agents" />
      <div className="mx-auto max-w-3xl px-4 xl:px-0 py-8 space-y-10">
        <section className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Public API access:</span>
            <Badge variant={agent.published ? "outline" : "destructive"}>
              {agent.published ? "Published" : "Unpublished"}
            </Badge>
          </div>
          <form action={toggleAgentPublished}>
            <input type="hidden" name="id" value={agent.id} />
            <input type="hidden" name="published" value={agent.published ? 1 : 0} />
            <Button type="submit" variant="outline" size="sm">
              {agent.published ? "Unpublish" : "Publish"}
            </Button>
          </form>
        </section>

        <section>
          <h3 className="text-lg font-semibold mb-4">Chat Playground</h3>
          <AgentChat agentId={agent.id} />
        </section>

        <section>
          <h3 className="text-lg font-semibold mb-2">Call it via API</h3>
          <p className="text-sm text-muted-foreground mb-2">
            OpenAI-compatible — point any OpenAI client at this base URL with your secret key,
            using this agent&apos;s ID as the model. Requires the agent to be Published (see toggle above).
          </p>
          <ApiCodeSnippet
            har={{
              method: "POST",
              url: `${appUrl}/api/v1/chat/completions`,
              headers: [
                { name: "Content-Type", value: "application/json" },
                { name: "Authorization", value: "Bearer YOUR_SECRET_KEY" },
              ],
              postData: {
                mimeType: "application/json",
                text: JSON.stringify(
                  {
                    model: agent.shortId,
                    messages: [{ role: "user", content: "Hello!" }],
                  },
                  null,
                  2,
                ),
              },
            }}
          />
        </section>
      </div>
    </>
  );
}
```

- [ ] **Step 2: `app/(dashboard)/agents/[agentId]/usage/page.tsx`**

```tsx
import { notFound } from "next/navigation";
import PageTitle from "@/components/layout/page-title";
import {
  getAgentById,
  getAgentRecentActivity,
  getAgentRunStats,
  getAgentUsage,
} from "@/lib/utils/useAgent";

interface Props {
  params: Promise<{ agentId: string }>;
}

export default async function AgentUsage(props: Props) {
  const params = await props.params;
  const agent = await getAgentById(Number(params.agentId));
  if (!agent) notFound();

  const [usage, stats, activity] = await Promise.all([
    getAgentUsage(agent.id),
    getAgentRunStats(agent.id),
    getAgentRecentActivity(agent.id),
  ]);

  return (
    <>
      <PageTitle title={`${agent.name} — Usage`} backUrl={`/agents/${agent.id}`} />
      <div className="mx-auto max-w-3xl px-4 xl:px-0 py-8 space-y-8">
        <div className="flex gap-8">
          <div>
            <p className="text-sm text-muted-foreground">Runs (30d)</p>
            <p className="text-2xl font-semibold">{usage.runs.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Tokens (30d)</p>
            <p className="text-2xl font-semibold">{usage.tokens.toLocaleString()}</p>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold mb-2">Daily activity</h3>
          <div className="text-xs text-muted-foreground space-y-1">
            {stats
              .filter((s) => s.total > 0)
              .map((s) => (
                <div key={s.date} className="flex justify-between">
                  <span>{s.date}</span>
                  <span>{s.total} runs · {s.tokens} tokens</span>
                </div>
              ))}
            {stats.every((s) => s.total === 0) && <p>No activity in the last 30 days.</p>}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold mb-2">Recent activity</h3>
          <div className="divide-y border rounded-md overflow-hidden">
            {activity.length === 0 && (
              <p className="p-4 text-sm text-muted-foreground">No runs yet.</p>
            )}
            {activity.map((run) => (
              <div key={run.id} className="flex justify-between p-3 text-sm">
                <span>{run.createdAt.toLocaleString()}</span>
                <span className="uppercase text-xs text-muted-foreground">{run.source}</span>
                <span>{run.totalTokenCount.toLocaleString()} tokens</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
```

- [ ] **Step 3: Update `components/console/navbar.tsx`**

Change:

```typescript
    const base = [
      { name: "Workflows",  href: "/workflows",  current: path.startsWith("/workflows") },
      { name: "Statistics", href: "/statistics", current: path === "/statistics" },
      { name: "Settings",   href: "/settings",   current: path === "/settings" },
    ];
```

to:

```typescript
    const base = [
      { name: "Workflows",  href: "/workflows",  current: path.startsWith("/workflows") },
      { name: "Agents",     href: "/agents",     current: path.startsWith("/agents") },
      { name: "Statistics", href: "/statistics", current: path === "/statistics" },
      { name: "Settings",   href: "/settings",   current: path === "/settings" },
    ];
```

and add agent-scoped sub-tabs alongside the existing `workflowId` branch — change:

```typescript
  const tabs = useMemo(() => {
    if ("workflowId" in params) {
      return [
        { name: "Editor",     href: `/workflows/${params.workflowId}`,          current: path === `/workflows/${params.workflowId}` || path === `/workflows/${params.workflowId}/edit` },
        { name: "Branches",   href: `/workflows/${params.workflowId}/branches`, current: path === `/workflows/${params.workflowId}/branches` || path === `/workflows/${params.workflowId}/branches/new` },
        { name: "Tests",      href: `/workflows/${params.workflowId}/tests`,    current: path === `/workflows/${params.workflowId}/tests` },
        { name: "Executions", href: `/workflows/${params.workflowId}/runs`,     current: path === `/workflows/${params.workflowId}/runs` },
        { name: "Usage",      href: `/workflows/${params.workflowId}/usage`,    current: path === `/workflows/${params.workflowId}/usage` },
      ];
    }
```

to:

```typescript
  const tabs = useMemo(() => {
    if ("workflowId" in params) {
      return [
        { name: "Editor",     href: `/workflows/${params.workflowId}`,          current: path === `/workflows/${params.workflowId}` || path === `/workflows/${params.workflowId}/edit` },
        { name: "Branches",   href: `/workflows/${params.workflowId}/branches`, current: path === `/workflows/${params.workflowId}/branches` || path === `/workflows/${params.workflowId}/branches/new` },
        { name: "Tests",      href: `/workflows/${params.workflowId}/tests`,    current: path === `/workflows/${params.workflowId}/tests` },
        { name: "Executions", href: `/workflows/${params.workflowId}/runs`,     current: path === `/workflows/${params.workflowId}/runs` },
        { name: "Usage",      href: `/workflows/${params.workflowId}/usage`,    current: path === `/workflows/${params.workflowId}/usage` },
      ];
    }
    if ("agentId" in params) {
      return [
        { name: "Chat",  href: `/agents/${params.agentId}`,      current: path === `/agents/${params.agentId}` },
        { name: "Edit",  href: `/agents/${params.agentId}/edit`, current: path === `/agents/${params.agentId}/edit` },
        { name: "Usage", href: `/agents/${params.agentId}/usage`, current: path === `/agents/${params.agentId}/usage` },
      ];
    }
```

- [ ] **Step 4: Add the route layout so `params` includes `agentId`**

Next.js's App Router derives `useParams()` from the URL segment names, which already works automatically since the folder is `[agentId]` — no extra layout file is required (`workflowId` works the same way via its `[workflowId]` folder, with no dedicated params-plumbing file beyond the folder name itself). Skip this step if `npx tsc --noEmit` and the manual check below both pass; only add a `layout.tsx` under `app/(dashboard)/agents/[agentId]/` if you find `agentId` isn't reaching the navbar (mirror `app/(dashboard)/workflows/[workflowId]/layout.tsx`'s structure if so).

- [ ] **Step 5: Typecheck and full manual verification**

Run: `npx tsc --noEmit` → no errors.

Then `npm run dev`:
1. Confirm the top nav shows "Agents" and it's highlighted when visiting any `/agents*` route.
2. Open an agent you created in Task 9. Confirm Chat/Edit/Usage sub-tabs appear and switch correctly.
3. On the Chat tab, send several messages, confirm streaming replies appear, reload the page and confirm the conversation is still there, click "Clear conversation" and confirm it empties (and `localStorage.getItem('agent-chat:<id>')` in devtools is gone).
4. Confirm the credit balance (Settings page) decreases after each chat turn.
5. Open the Usage tab and confirm the runs/tokens you just generated show up in "Recent activity" with `source: dashboard`.
6. From Settings, create a secret key. The agent is already Published by default (`createAgent` sets `published: true`, same as Workflows) — confirm the badge on its detail page says "Published", then run Task 8's `scratch-test.mjs` against it and confirm both calls succeed.
7. Re-run the exact same non-streaming `scratch-test.mjs` request twice in a row (same messages) against an agent with a non-zero Cache TTL set via Edit, and confirm the Usage tab's "Recent activity" still logs a new row for the second call (cache still logs usage) while the response content is identical both times.

- [ ] **Step 6: Commit**

```bash
git add "app/(dashboard)/agents/[agentId]/page.tsx" "app/(dashboard)/agents/[agentId]/usage" components/console/navbar.tsx
git commit -m "Add Agent chat playground page, usage page, and navigation"
```

---

### Task 11: Full-feature verification pass

**Goal:** End-to-end confirmation that Agents work correctly alongside Workflows with no regressions, and that Structured Output / Reasoning Effort (from the model-catalog plan) work through an Agent.

**Files:** none (verification only)

**Acceptance Criteria:**
- [ ] `npx tsc --noEmit` and `npx biome check .` both pass clean across the whole repo
- [ ] An agent using a reasoning-capable model with Reasoning Effort set to "high" responds coherently via both the dashboard playground and the public API
- [ ] An unpublished agent's public API calls are rejected; publishing it immediately allows them
- [ ] Workflows still function normally (no regression from the shared `<ModelPicker>`/`getOpenRouterHeaders` extraction)

**Verify:** `npx tsc --noEmit && npx biome check .` → both exit 0; manual walkthrough below

**Steps:**

- [ ] **Step 1: Full typecheck + lint**

Run: `npx tsc --noEmit && npx biome check .`
Expected: both exit 0.

- [ ] **Step 2: Cross-feature regression check**

`npm run dev`, open an existing workflow (from the model-catalog plan's verification) and confirm its model picker and settings panel still work (proving the Task 4 extraction didn't break Workflows).

- [ ] **Step 3: Reasoning Effort through an Agent**

Edit an agent to use a reasoning-capable model (e.g. GPT-5.2) with Reasoning Effort "high". Chat with it in the dashboard playground with a non-trivial question and confirm a coherent response. Then call it via the public API (`scratch-test.mjs` from Task 8) and confirm the same.

- [ ] **Step 4: Publish gate**

On an agent's detail page, click "Unpublish" (the toggle added in Task 10). Call its public API endpoint (`scratch-test.mjs`) and confirm you get the 404 `invalid_request_error` OpenAI-shaped response. Click "Publish" again and confirm the same call now succeeds.
