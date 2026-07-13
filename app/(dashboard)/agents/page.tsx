import { AgentItem } from "@/components/console/agent/agent-item";
import { AgentSearch } from "@/components/console/agent/agent-search";
import EmptyState from "@/components/core/empty-state";
import PageTitle from "@/components/layout/page-title";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { owner } from "@/lib/hooks/useOwner";
import { cn } from "@/lib/utils";
import { AGENT_LIMIT, getAgentsForOwner } from "@/lib/utils/useAgent";

interface Props {
  searchParams: Promise<{ search: string; page: string }>;
}

export default async function Agents(props: Props) {
  const searchParams = await props.searchParams;
  const { ownerId } = await owner();
  const currentPage = searchParams.page
    ? Number.parseInt(searchParams.page)
    : 1;

  const { agents, count } = await getAgentsForOwner({
    ownerId,
    search: searchParams.search,
    page: currentPage,
  });

  const totalPages = Math.ceil(count / AGENT_LIMIT);

  return (
    <>
      <PageTitle
        title={
          searchParams.search ? `Search '${searchParams.search}'` : "Agents"
        }
        backUrl={searchParams.search ? "/agents" : undefined}
        actionLabel="New"
        actionLink="/agents/new"
      />
      <div className="flex max-w-7xl px-4 xl:px-0 sm:mx-auto py-4 space-x-4 items-center">
        <div className="flex-1">
          <AgentSearch />
        </div>
      </div>
      <div className="mx-auto mt-8 flex max-w-7xl flex-col">
        {agents.length === 0 ? (
          <EmptyState
            label="agent"
            show={agents.length === 0}
            createLink="/agents/new"
          />
        ) : null}

        {agents.length > 0 ? (
          <div className="divide-y border rounded-md overflow-hidden">
            {agents.map((agent) => (
              // @ts-ignore
              <AgentItem key={agent.id} agent={agent} />
            ))}
          </div>
        ) : null}

        {agents.length > 0 && totalPages > 1 ? (
          <div className="py-4">
            <Pagination>
              <PaginationContent>
                {currentPage > 1 ? (
                  <PaginationItem>
                    <PaginationPrevious
                      href={`/agents?page=${currentPage - 1}`}
                    />
                  </PaginationItem>
                ) : null}
                {Array.from({ length: Math.min(totalPages, 5) }, (_, idx) => {
                  const pageNumber = idx + 1;
                  return (
                    <PaginationItem key={`page-${pageNumber}`}>
                      <PaginationLink
                        href={`/agents?page=${pageNumber}`}
                        className={cn(
                          pageNumber === currentPage &&
                            "text-primary font-semibold",
                        )}
                      >
                        {pageNumber}
                      </PaginationLink>
                    </PaginationItem>
                  );
                })}
                {(currentPage - 1) * AGENT_LIMIT + agents.length < count ? (
                  <PaginationItem>
                    <PaginationNext href={`/agents?page=${currentPage + 1}`} />
                  </PaginationItem>
                ) : null}
              </PaginationContent>
            </Pagination>
          </div>
        ) : null}
      </div>
    </>
  );
}
