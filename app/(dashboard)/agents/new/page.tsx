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
