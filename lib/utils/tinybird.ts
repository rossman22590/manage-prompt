// We'll keep this enum as it might be used elsewhere in the codebase
export enum EventName {
  RunWorkflow = "run_workflow",
}

// Replace logEvent with a console.log
export async function logEvent(eventName: string, payload: any) {
  console.log(`[Event Log] ${eventName}:`, payload);
}

export type WorkflowRunStat = {
  hour: number | string;
  total: number;
  tokens: number;
};

// Replace Tinybird-based implementation with a stub
export async function getWorkflowUsage(id: number | string): Promise<{
  runs: number;
  tokens: number;
}> {
  console.log(`[Stub] getWorkflowUsage called for id: ${id}`);
  return { runs: 0, tokens: 0 };
}

// Replace Tinybird-based implementation with a stub
export async function getWorkflowRunStats(
  id: number | string
): Promise<WorkflowRunStat[]> {
  console.log(`[Stub] getWorkflowRunStats called for id: ${id}`);
  const now = new Date();
  const last24Hours = Array.from({ length: 24 }, (_, i) => {
    const d = new Date(now);
    d.setHours(d.getUTCHours() - i);
    return d.getHours();
  });

  return last24Hours
    .map((hour) => ({ hour, total: 0, tokens: 0 }))
    .reverse();
}
