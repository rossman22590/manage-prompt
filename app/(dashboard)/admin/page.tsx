import { ShieldCheck } from "lucide-react";
import PageSection from "@/components/core/page-section";
import PageTitle from "@/components/layout/page-title";
import { requireSuperAdmin } from "@/lib/utils/admin";
import { prisma } from "@/lib/utils/db";
import AdminUsersTable from "@/components/admin/admin-users-table";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminPage() {
  await requireSuperAdmin();

  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      createdAt: true,
      emailVerified: true,
      _count: {
        select: {
          Workflow: true,
          WorkflowRun: true,
          SecretKey: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
  const userIds = users.map((u) => u.id);
  const orgs = await prisma.organization.findMany({
    where: { id: { in: userIds } },
  });
  const orgByUser = new Map(orgs.map((o) => [o.id, o]));

  const rows = users.map((user) => ({
    id: user.id,
    email: user.email,
    name: user.name,
    credits: orgByUser.get(user.id)?.credits ?? 0,
    emailVerified: Boolean(user.emailVerified),
    workflowsCount: user._count.Workflow,
    runsCount: user._count.WorkflowRun,
    apiKeysCount: user._count.SecretKey,
    createdAt: user.createdAt,
  }));
  const totalCredits = rows.reduce((sum, row) => sum + row.credits, 0);
  const totalWorkflows = rows.reduce((sum, row) => sum + row.workflowsCount, 0);
  const totalRuns = rows.reduce((sum, row) => sum + row.runsCount, 0);

  return (
    <>
      <PageTitle
        title="Admin"
        subTitle="Manage users and credits. Super admin only."
      />
      <PageSection topInset className="max-w-none">
        <div className="mx-auto w-full max-w-[1500px] space-y-6 p-4 sm:p-6">
          <div className="flex items-center gap-2 rounded-lg border border-pink-200 dark:border-pink-900/50 bg-pink-50 dark:bg-pink-900/10 px-4 py-3">
            <ShieldCheck
              className="h-5 w-5 text-pink-600 dark:text-pink-400 shrink-0"
              aria-hidden
            />
            <p className="text-sm text-pink-800 dark:text-pink-200">
              Only the super admin can view this page. You can see all users and
              add or remove credits from their accounts.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-black p-4">
              <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Users
              </p>
              <p className="mt-2 text-2xl font-semibold">{rows.length}</p>
            </div>
            <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-black p-4">
              <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Total Credits
              </p>
              <p className="mt-2 text-2xl font-semibold text-pink-600 dark:text-pink-400">
                {totalCredits.toLocaleString()}
              </p>
            </div>
            <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-black p-4">
              <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Workflows
              </p>
              <p className="mt-2 text-2xl font-semibold">
                {totalWorkflows.toLocaleString()}
              </p>
            </div>
            <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-black p-4">
              <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Runs
              </p>
              <p className="mt-2 text-2xl font-semibold">
                {totalRuns.toLocaleString()}
              </p>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              All users ({rows.length})
            </h2>
            <AdminUsersTable users={rows} />
          </div>
        </div>
      </PageSection>
    </>
  );
}
