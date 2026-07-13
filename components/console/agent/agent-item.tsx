import classNames from "classnames";
import { ChevronRightIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { type AIModel, AIModelToLabel, isDeprecated } from "@/data/workflow";
import type { Agent } from "@/generated/prisma-client/client";
import { getAgentUsage } from "@/lib/utils/useAgent";

interface Props {
  agent: Pick<
    Agent,
    "id" | "name" | "createdAt" | "updatedAt" | "published" | "model"
  >;
}

export async function AgentItem({ agent }: Props) {
  const usage = await getAgentUsage(agent.id);
  const modelLabel = AIModelToLabel[agent.model as AIModel] || agent.model;
  const modelIsDeprecated = isDeprecated(agent.model as AIModel);

  return (
    <div className="relative flex items-center space-x-4 p-4 bg-white hover:bg-gray-50 dark:bg-black dark:hover:bg-[#2a2a2a]">
      <div className="min-w-0 flex-auto">
        <div className="flex items-center gap-x-2">
          <span
            className={classNames(
              agent.published
                ? "bg-green-100 dark:bg-green-900"
                : "bg-gray-100 dark:bg-card",
              "h-4 w-4 flex items-center justify-center",
            )}
            aria-hidden="true"
          >
            <span
              className={classNames(
                agent.published ? "bg-green-400" : "bg-red-500",
                "h-2 w-2",
              )}
            />
          </span>
          <h2 className="min-w-0 font-medium">
            <a href={`/agents/${agent.id}`} className="flex gap-x-2">
              <span className="truncate">{agent.name}</span>
              <span className="absolute inset-0" />
            </a>
          </h2>
        </div>
        <div className="mt-1 ml-6 text-xs md:text-sm flex items-center gap-x-2.5 text-gray-500 dark:text-gray-400">
          <p className="truncate">
            {Number(usage?.tokens ?? 0).toLocaleString()} tokens
          </p>
          <svg
            viewBox="0 0 2 2"
            className="h-0.5 w-0.5 flex-none fill-gray-300"
          >
            <circle r={1} cx={1} cy={1} />
          </svg>
          <p className="whitespace-nowrap">
            {Number(usage?.runs ?? 0).toLocaleString()} runs
          </p>
        </div>
      </div>
      <Badge variant={modelIsDeprecated ? "destructive" : "outline"}>
        {modelLabel}
      </Badge>
      <ChevronRightIcon aria-hidden="true" className="h-5 w-5 flex-none" />
    </div>
  );
}
