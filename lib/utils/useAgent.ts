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
    where: {
      ownerId,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: AGENT_LIMIT,
    skip: (safePage - 1) * AGENT_LIMIT,
  };

  if (search) {
    dbQuery.where!.name = {
      contains: search,
      mode: "insensitive",
    };
  }

  const countWhere: Prisma.AgentWhereInput = {
    ownerId,
  };

  if (search) {
    countWhere.name = {
      contains: search,
      mode: "insensitive",
    };
  }

  const [agents, count] = await prisma.$transaction([
    prisma.agent.findMany(dbQuery),
    prisma.agent.count({
      where: countWhere,
    }),
  ]);

  return { agents, count };
}

export async function getAgentById(id: number): Promise<Agent | null> {
  const { ownerId } = await owner();
  if (!ownerId) throw new Error("Owner ID not found");

  return prisma.agent.findFirst({
    where: {
      id: {
        equals: id,
      },
      organization: {
        id: {
          equals: ownerId,
        },
      },
    },
  });
}

export async function getAgentUsage(
  id: number,
): Promise<{ runs: number; tokens: number }> {
  const runs = await prisma.agentRun.findMany({
    select: {
      totalTokenCount: true,
    },
    where: {
      agentId: Number(id),
      createdAt: {
        gte: new Date(new Date().setDate(new Date().getDate() - 30)),
      },
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
      ds.date::TEXT AS "date",
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
    where: {
      agentId: id,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: limit,
  });
}

export async function getAgentCachedResult(
  agentShortId: string,
  body: string,
): Promise<string | null> {
  try {
    const inputHash = createHash("md5").update(body).digest("hex");
    const resultCacheKey = `agent-chat-cache:${agentShortId}:${inputHash}`;
    const cachedResult: string | null = await redisStore.get(resultCacheKey);
    return cachedResult;
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
    const resultCacheKey = `agent-chat-cache:${agentShortId}:${inputHash}`;
    await redisStore.set(resultCacheKey, result, {
      ex: ttl,
    });
  } catch (e) {
    console.error(e);
  }
}
