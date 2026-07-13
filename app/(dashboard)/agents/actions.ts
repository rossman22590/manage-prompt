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
