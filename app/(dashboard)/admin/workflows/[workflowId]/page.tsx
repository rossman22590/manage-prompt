import { notFound } from "next/navigation";
import {
  WorkflowRunItem,
  type WorkflowRunWithUser,
} from "@/components/console/workflow/workflow-run-item";
import PageSection from "@/components/core/page-section";
import PageTitle from "@/components/layout/page-title";
import { Badge } from "@/components/ui/badge";
import { requireSuperAdmin } from "@/lib/utils/admin";
import { prisma } from "@/lib/utils/db";

type Props = {
  params: Promise<{ workflowId: string }>;
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminWorkflowViewerPage({ params }: Props) {
  await requireSuperAdmin();
  const { workflowId } = await params;
  const parsedWorkflowId = Number(workflowId);

  if (Number.isNaN(parsedWorkflowId)) {
    return notFound();
  }

  const workflow = await prisma.workflow.findUnique({
    where: { id: parsedWorkflowId },
    include: {
      organization: {
        select: {
          id: true,
          name: true,
          createdBy: {
            select: {
              email: true,
              name: true,
            },
          },
        },
      },
      branches: {
        where: { status: "open" },
        select: {
          id: true,
          shortId: true,
        },
      },
      _count: {
        select: {
          runs: true,
          tests: true,
        },
      },
    },
  });

  if (!workflow) {
    return notFound();
  }

  const recentRuns = await prisma.workflowRun.findMany({
    where: { workflowId: workflow.id },
    include: {
      user: {
        select: {
          name: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 25,
  });

  return (
    <>
      <PageTitle
        title={`Workflow: ${workflow.name}`}
        subTitle={`Super-admin read-only view • Owner: ${workflow.organization.createdBy.email}`}
        backUrl={`/admin/users/${workflow.organization.id}`}
      />

      <PageSection topInset className="max-w-none">
        <div className="mx-auto w-full max-w-[1500px] space-y-6 p-4 sm:p-6">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-6">
            <InfoCard label="Workflow ID" value={String(workflow.id)} />
            <InfoCard
              label="Status"
              value={workflow.published ? "Published" : "Draft"}
            />
            <InfoCard label="Model" value={workflow.model} />
            <InfoCard label="Branches" value={String(workflow.branches.length)} />
            <InfoCard label="Runs" value={String(workflow._count.runs)} />
            <InfoCard label="Tests" value={String(workflow._count.tests)} />
          </div>

          <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-black p-4 sm:p-5 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                variant="secondary"
                className="bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300"
              >
                Owner org: {workflow.organization.name}
              </Badge>
              {workflow.branches.slice(0, 6).map((branch) => (
                <Badge key={branch.id} variant="outline">
                  Branch: {branch.shortId}
                </Badge>
              ))}
            </div>

            {workflow.instruction ? (
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Instruction
                </p>
                <p className="mt-1 text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                  {workflow.instruction}
                </p>
              </div>
            ) : null}

            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Template
              </p>
              <pre className="mt-1 rounded-md border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#111] p-3 text-xs overflow-x-auto whitespace-pre-wrap">
                {workflow.template}
              </pre>
            </div>
          </div>

          <PageSection className="mx-0 mb-0">
            <div className="border-b px-6 py-4">
              <h2 className="text-lg font-semibold">Recent Runs (25)</h2>
            </div>
            {recentRuns.length ? (
              <ul className="divide-y">
                {recentRuns.map((run) => (
                  <WorkflowRunItem
                    key={run.id}
                    workflowRun={run as WorkflowRunWithUser}
                  />
                ))}
              </ul>
            ) : (
              <div className="px-6 py-8 text-sm text-gray-500 dark:text-gray-400">
                No runs yet.
              </div>
            )}
          </PageSection>
        </div>
      </PageSection>
    </>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-black p-4">
      <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
        {label}
      </p>
      <p className="mt-2 text-lg font-semibold text-gray-900 dark:text-gray-100 break-all">
        {value}
      </p>
    </div>
  );
}
