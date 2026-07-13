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
