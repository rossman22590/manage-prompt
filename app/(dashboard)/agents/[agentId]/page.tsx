import { notFound } from "next/navigation";
import { ApiCodeSnippet } from "@/components/code/snippet";
import { AgentChat } from "@/components/console/agent/agent-chat";
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

  const appUrl =
    process.env.NEXT_PUBLIC_APP_BASE_URL || "https://manageprompt.com";

  return (
    <>
      <PageTitle title={agent.name} backUrl="/agents" />
      <div className="mx-auto max-w-3xl px-4 xl:px-0 py-8 space-y-10">
        <section className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              Public API access:
            </span>
            <Badge variant={agent.published ? "outline" : "destructive"}>
              {agent.published ? "Published" : "Unpublished"}
            </Badge>
          </div>
          <form action={toggleAgentPublished}>
            <input type="hidden" name="id" value={agent.id} />
            <input
              type="hidden"
              name="published"
              value={agent.published ? 1 : 0}
            />
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
            OpenAI-compatible — point any OpenAI client at this base URL with
            your secret key, using this agent&apos;s ID as the model. Requires
            the agent to be Published (see toggle above).
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
