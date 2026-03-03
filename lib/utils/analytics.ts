"use server";
import { prisma } from "./db";
import { owner } from "../hooks/useOwner";

export type WorkflowRunStat = {
  date: number | string;
  total: number;
  tokens: number;
};

export type UserStatistics = {
  totalCalls: number;
  totalTokens: number;
  successRate: number;
  activeModels: { name: string; calls: number }[];
  callsByDay: { date: string; total: number; tokens: number }[];
  callsByHour: { hour: number; calls: number }[];
  recentRuns: {
    id: number;
    workflowShortId: string;
    model: string;
    tokens: number;
    createdAt: Date;
  }[];
  activeKeyCount: number;
};

export async function getUserStatistics(): Promise<UserStatistics> {
  const { ownerId } = await owner();
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [runs, keyCount, workflows] = await Promise.all([
    prisma.workflowRun.findMany({
      where: {
        createdBy: ownerId,
        createdAt: { gte: thirtyDaysAgo },
      },
      select: {
        id: true,
        totalTokenCount: true,
        rawRequest: true,
        createdAt: true,
        workflow: {
          select: { shortId: true, model: true },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.secretKey.count({
      where: { ownerId },
    }),
    prisma.workflow.findMany({
      where: { ownerId },
      select: { id: true },
    }),
  ]);

  const totalCalls = runs.length;
  const totalTokens = runs.reduce((acc, r) => acc + r.totalTokenCount, 0);

  const modelCounts = new Map<string, number>();
  for (const run of runs) {
    const model =
      (run.rawRequest as any)?.model ?? run.workflow.model ?? "unknown";
    modelCounts.set(model, (modelCounts.get(model) ?? 0) + 1);
  }

  const activeModels = Array.from(modelCounts.entries())
    .map(([name, calls]) => ({ name, calls }))
    .sort((a, b) => b.calls - a.calls)
    .slice(0, 10);

  const dayMap = new Map<string, { total: number; tokens: number }>();
  const hourMap = new Map<number, number>();

  for (const run of runs) {
    const dateKey = run.createdAt.toISOString().slice(0, 10);
    const existing = dayMap.get(dateKey) ?? { total: 0, tokens: 0 };
    existing.total += 1;
    existing.tokens += run.totalTokenCount;
    dayMap.set(dateKey, existing);

    const hour = run.createdAt.getHours();
    hourMap.set(hour, (hourMap.get(hour) ?? 0) + 1);
  }

  const callsByDay = Array.from(dayMap.entries())
    .map(([date, data]) => ({ date, ...data }))
    .sort((a, b) => a.date.localeCompare(b.date));

  const callsByHour = Array.from({ length: 24 }, (_, i) => ({
    hour: i,
    calls: hourMap.get(i) ?? 0,
  }));

  const recentRuns = runs.slice(0, 10).map((r) => ({
    id: r.id,
    workflowShortId: r.workflow.shortId,
    model: (r.rawRequest as any)?.model ?? r.workflow.model ?? "unknown",
    tokens: r.totalTokenCount,
    createdAt: r.createdAt,
  }));

  return {
    totalCalls,
    totalTokens,
    successRate: totalCalls > 0 ? 100 : 0,
    activeModels,
    callsByDay,
    callsByHour,
    recentRuns,
    activeKeyCount: keyCount,
  };
}

export async function getWorkflowUsage(id: number | string): Promise<{
  runs: number;
  tokens: number;
}> {
  const workflowRuns = await prisma.workflowRun.findMany({
    select: {
      totalTokenCount: true,
    },
    where: {
      workflowId: Number(id),
      createdAt: {
        gte: new Date(new Date().setDate(new Date().getDate() - 30)),
      },
    },
  });

  return {
    runs: workflowRuns.length,
    tokens: workflowRuns.reduce((acc, val) => acc + val?.totalTokenCount, 0),
  };
}

export async function getWorkflowRunStats(
  id: number,
): Promise<WorkflowRunStat[]> {
  const result: WorkflowRunStat[] = await prisma.$queryRaw`
  WITH date_series AS (
    SELECT generate_series(
      NOW()::DATE - INTERVAL '30 days', 
      NOW()::DATE, 
      '1 day'::INTERVAL
    )::DATE AS date
  )
  SELECT 
    ds.date,
    COALESCE(COUNT(wr.id)::INTEGER, 0) AS "total",
    COALESCE(SUM(wr."totalTokenCount")::INTEGER, 0) AS "tokens"
  FROM date_series ds
  LEFT JOIN "WorkflowRun" wr ON DATE(wr."createdAt") = ds.date AND wr."workflowId" = ${id}
  GROUP BY ds.date
  ORDER BY ds.date ASC;
`;

  return result;
}
