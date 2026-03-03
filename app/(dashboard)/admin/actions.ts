"use server";

import { revalidatePath } from "next/cache";
import { requireSuperAdmin } from "@/lib/utils/admin";
import { prisma } from "@/lib/utils/db";

export type UpdateCreditsResult = { ok: true } | { ok: false; error: string };

export async function updateUserCredits(
  userId: string,
  delta: number,
): Promise<UpdateCreditsResult> {
  await requireSuperAdmin();

  const safeDelta = Math.round(delta);
  if (safeDelta === 0) {
    return { ok: false, error: "Amount cannot be zero." };
  }

  try {
    const org = await prisma.organization.findUnique({
      where: { id: userId },
    });

    if (org) {
      const newCredits = org.credits + safeDelta;
      if (newCredits < 0) {
        return { ok: false, error: "Credits cannot go below zero." };
      }
      await prisma.organization.update({
        where: { id: userId },
        data: { credits: { increment: safeDelta } },
      });
    } else {
      if (safeDelta < 0) {
        return { ok: false, error: "User has no organization yet; cannot remove credits." };
      }
      await prisma.organization.create({
        data: {
          id: userId,
          name: "Personal",
          rawData: {},
          credits: safeDelta,
          createdByUser: userId,
        },
      });
      const existing = await prisma.organizationToUser.findFirst({
        where: { organizationId: userId, userId },
      });
      if (!existing) {
        await prisma.organizationToUser.create({
          data: { organizationId: userId, userId },
        });
      }
    }

    revalidatePath("/admin");
    return { ok: true };
  } catch (e) {
    console.error("Admin updateUserCredits error:", e);
    return { ok: false, error: "Failed to update credits." };
  }
}
