import { getUserStatistics } from "@/lib/utils/analytics";
import { AIModelToLabel } from "@/data/workflow";
import StatisticsDashboard from "./statistics-dashboard";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function StatisticsPage() {
  const stats = await getUserStatistics();

  const models = stats.activeModels.map((m) => ({
    ...m,
    label:
      AIModelToLabel[m.name as keyof typeof AIModelToLabel] ?? m.name,
  }));

  return (
    <StatisticsDashboard
      totalCalls={stats.totalCalls}
      totalTokens={stats.totalTokens}
      successRate={stats.successRate}
      activeModels={models}
      callsByDay={stats.callsByDay}
      callsByHour={stats.callsByHour}
      recentRuns={stats.recentRuns.map((r) => ({
        ...r,
        modelLabel:
          AIModelToLabel[r.model as keyof typeof AIModelToLabel] ?? r.model,
        createdAt: r.createdAt.toISOString(),
      }))}
      activeKeyCount={stats.activeKeyCount}
    />
  );
}
