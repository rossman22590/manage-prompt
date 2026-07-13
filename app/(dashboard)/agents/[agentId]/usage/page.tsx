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
      <PageTitle
        title={`${agent.name} — Usage`}
        backUrl={`/agents/${agent.id}`}
      />
      <div className="mx-auto max-w-3xl px-4 xl:px-0 py-8 space-y-8">
        <div className="flex gap-8">
          <div>
            <p className="text-sm text-muted-foreground">Runs (30d)</p>
            <p className="text-2xl font-semibold">
              {usage.runs.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Tokens (30d)</p>
            <p className="text-2xl font-semibold">
              {usage.tokens.toLocaleString()}
            </p>
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
                  <span>
                    {s.total} runs · {s.tokens} tokens
                  </span>
                </div>
              ))}
            {stats.every((s) => s.total === 0) && (
              <p>No activity in the last 30 days.</p>
            )}
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
                <span className="uppercase text-xs text-muted-foreground">
                  {run.source}
                </span>
                <span>{run.totalTokenCount.toLocaleString()} tokens</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
