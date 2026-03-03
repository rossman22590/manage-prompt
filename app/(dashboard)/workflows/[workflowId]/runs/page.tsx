import {
  WorkflowRunItem,
  type WorkflowRunWithUser,
} from "@/components/console/workflow/workflow-run-item";
import PageSection from "@/components/core/page-section";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { cn } from "@/lib/utils";
import { getWorkflowAndRuns, LIMIT } from "@/lib/utils/useWorkflow";

interface Props {
  params: Promise<{
    workflowId: string;
  }>;
  searchParams: Promise<{
    page: string;
  }>;
}

export default async function WorkflowRunDetails(props: Props) {
  const searchParams = await props.searchParams;
  const params = await props.params;
  const parsedPage = searchParams.page
    ? Number.parseInt(searchParams.page, 10)
    : 1;
  const currentPage =
    Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1;
  const { count, workflowRuns } = await getWorkflowAndRuns({
    id: Number(params.workflowId),
    page: currentPage,
  });
  const totalPages = Math.max(1, Math.ceil(count / LIMIT));
  const hasNextPage = currentPage < totalPages;

  return (
    <>
      <PageSection className="mt-4">
        <ul className="divide-y divide-border/60">
          {workflowRuns.map((run) => (
            <WorkflowRunItem
              key={run.id}
              workflowRun={run as WorkflowRunWithUser}
            />
          ))}
        </ul>
      </PageSection>
      {totalPages > 1 ? (
        <div className="py-4">
          <Pagination>
            <PaginationContent>
              {currentPage > 1 ? (
                <PaginationItem>
                  <PaginationPrevious
                    href={`/workflows/${params.workflowId}/runs?page=${
                      currentPage - 1
                    }`}
                  />
                </PaginationItem>
              ) : null}
              {Array.from({ length: Math.min(totalPages, 5) }, (_, idx) => {
                const pageNumber = idx + 1;
                return (
                  <PaginationItem key={`page-${pageNumber}`}>
                    <PaginationLink
                      href={`/workflows/${params.workflowId}/runs?page=${pageNumber}`}
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
              {hasNextPage ? (
                <PaginationItem>
                  <PaginationNext
                    href={`/workflows/${params.workflowId}/runs?page=${
                      currentPage + 1
                    }`}
                  />
                </PaginationItem>
              ) : null}
            </PaginationContent>
          </Pagination>
        </div>
      ) : null}
    </>
  );
}
