import Link from "next/link";
import { notFound } from "next/navigation";
import Stripe from "stripe";
import PageSection from "@/components/core/page-section";
import PageTitle from "@/components/layout/page-title";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AIModelToLabel } from "@/data/workflow";
import { requireSuperAdmin } from "@/lib/utils/admin";
import { prisma } from "@/lib/utils/db";

type Props = {
  params: Promise<{ userId: string }>;
};

type CombinedTransaction = {
  id: string;
  type: "subscription" | "payment" | "credit_usage";
  description: string;
  amount: number;
  date: Date;
  status: string;
  workflowName?: string;
  workflowId?: number;
  model?: string;
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminUserDetailsPage({ params }: Props) {
  await requireSuperAdmin();
  const { userId } = await params;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      createdAt: true,
      emailVerified: true,
    },
  });

  if (!user) return notFound();

  const [organization, workflowCount, apiKeyCount, usageAgg, recentRuns] =
    await Promise.all([
      prisma.organization.findUnique({
        where: { id: userId },
        include: { stripe: true },
      }),
      prisma.workflow.count({
        where: { ownerId: userId },
      }),
      prisma.secretKey.count({
        where: { ownerId: userId },
      }),
      prisma.workflowRun.aggregate({
        _count: { _all: true },
        _sum: { totalTokenCount: true },
        where: {
          workflow: {
            ownerId: userId,
          },
        },
      }),
      prisma.workflowRun.findMany({
        where: {
          workflow: {
            ownerId: userId,
          },
        },
        orderBy: { createdAt: "desc" },
        take: 150,
        select: {
          id: true,
          createdAt: true,
          totalTokenCount: true,
          workflow: {
            select: {
              id: true,
              name: true,
              model: true,
            },
          },
        },
      }),
    ]);

  const totalRuns = usageAgg._count._all;
  const totalTokens = usageAgg._sum.totalTokenCount ?? 0;
  const estimatedCreditsUsed = recentRuns.reduce(
    (sum, run) => sum + Math.max(1, Math.ceil(run.totalTokenCount / 100)),
    0,
  );

  let stripeTransactions: CombinedTransaction[] = [];
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (organization?.stripe?.customerId && stripeKey) {
    const stripe = new Stripe(stripeKey, {
      apiVersion: "2025-12-15.clover",
    });
    try {
      const [invoices, paymentIntents] = await Promise.all([
        stripe.invoices.list({
          customer: organization.stripe.customerId,
          limit: 100,
        }),
        stripe.paymentIntents.list({
          customer: organization.stripe.customerId,
          limit: 100,
        }),
      ]);

      stripeTransactions = [
        ...invoices.data.map((invoice) => {
          const isSubscription = Boolean((invoice as { subscription?: string }).subscription);
          return {
            id: invoice.id,
            type: isSubscription ? "subscription" : "payment",
            description:
              invoice.description ??
              invoice.lines.data[0]?.description ??
              "Payment",
            amount: invoice.amount_paid / 100,
            date: new Date(invoice.created * 1000),
            status: invoice.status ?? "paid",
          } as CombinedTransaction;
        }),
        ...paymentIntents.data
          .filter((intent) => intent.status === "succeeded")
          .map(
            (intent) =>
              ({
                id: intent.id,
                type: "payment",
                description: intent.description ?? "Credit Pack Purchase",
                amount: (intent.amount ?? 0) / 100,
                date: new Date(intent.created * 1000),
                status: intent.status,
              }) as CombinedTransaction,
          ),
      ];
    } catch (error) {
      console.error("Admin user details Stripe fetch error:", error);
    }
  }

  const usageTransactions: CombinedTransaction[] = recentRuns.map((run) => {
    const creditsUsed = Math.max(1, Math.ceil(run.totalTokenCount / 100));
    return {
      id: `run-${run.id}`,
      type: "credit_usage",
      description: `Workflow Run - ${run.totalTokenCount.toLocaleString()} tokens (${creditsUsed} credits)`,
      amount: -creditsUsed,
      date: run.createdAt,
      status: "completed",
      workflowName: run.workflow.name,
      workflowId: run.workflow.id,
      model: run.workflow.model,
    };
  });

  const allTransactions = [...stripeTransactions, ...usageTransactions].sort(
    (a, b) => b.date.getTime() - a.date.getTime(),
  );

  const currentCredits = organization?.credits ?? 0;

  return (
    <>
      <PageTitle
        title={`User: ${user.name || user.email}`}
        subTitle={user.email}
        backUrl="/admin"
      />
      <PageSection topInset className="max-w-none">
        <div className="mx-auto w-full max-w-[1500px] space-y-6 p-4 sm:p-6">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-6">
            <InfoCard label="Verified" value={user.emailVerified ? "Yes" : "No"} />
            <InfoCard label="Current Credits" value={currentCredits.toLocaleString()} accent />
            <InfoCard label="Workflows" value={workflowCount.toLocaleString()} />
            <InfoCard label="Runs" value={totalRuns.toLocaleString()} />
            <InfoCard label="Tokens Used" value={totalTokens.toLocaleString()} />
            <InfoCard label="API Keys" value={apiKeyCount.toLocaleString()} />
          </div>

          <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-black p-4 sm:p-5">
            <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">
              Usage overview
            </h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Approximate credits used from recent runs:{" "}
              <span className="font-semibold text-gray-900 dark:text-gray-100">
                {estimatedCreditsUsed.toLocaleString()}
              </span>
            </p>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              User joined{" "}
              {new Date(user.createdAt).toLocaleDateString(undefined, {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
              .
            </p>
          </div>

          <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-black overflow-hidden">
            <div className="border-b border-gray-200 dark:border-gray-800 px-4 sm:px-5 py-3">
              <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                Transactions and usage
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Subscription, payments, and workflow credit usage events.
              </p>
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="hidden md:table-cell">Workflow</TableHead>
                    <TableHead className="hidden lg:table-cell">Model</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="hidden sm:table-cell">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allTransactions.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="text-center py-10 text-gray-500 dark:text-gray-400"
                      >
                        No transactions or usage found for this user.
                      </TableCell>
                    </TableRow>
                  ) : (
                    allTransactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell className="whitespace-nowrap">
                          <div className="flex flex-col">
                            <span>{transaction.date.toLocaleDateString()}</span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {transaction.date.toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="secondary"
                            className={
                              transaction.type === "subscription"
                                ? "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300"
                                : transaction.type === "payment"
                                  ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                                  : "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300"
                            }
                          >
                            {transaction.type === "subscription"
                              ? "Subscription"
                              : transaction.type === "payment"
                                ? "Payment"
                                : "Credit Usage"}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-[360px]">
                          <p className="truncate" title={transaction.description}>
                            {transaction.description}
                          </p>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {transaction.workflowId && transaction.workflowName ? (
                            <Link
                              href={`/workflows/${transaction.workflowId}`}
                              className="text-pink-600 hover:text-pink-700 dark:text-pink-400 dark:hover:text-pink-300"
                            >
                              {transaction.workflowName}
                            </Link>
                          ) : (
                            <span className="text-gray-400 dark:text-gray-500">-</span>
                          )}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          {transaction.model
                            ? (AIModelToLabel[
                                transaction.model as keyof typeof AIModelToLabel
                              ] ?? transaction.model)
                            : "-"}
                        </TableCell>
                        <TableCell
                          className={`text-right font-semibold whitespace-nowrap ${
                            transaction.amount < 0
                              ? "text-red-600 dark:text-red-400"
                              : "text-green-600 dark:text-green-400"
                          }`}
                        >
                          {transaction.amount < 0 ? "-" : "+"}
                          {transaction.type === "credit_usage"
                            ? `${Math.abs(transaction.amount)} credits`
                            : `$${Math.abs(transaction.amount).toFixed(2)}`}
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <span
                            className={`px-2 py-1 rounded text-xs ${
                              ["paid", "succeeded", "completed"].includes(
                                transaction.status,
                              )
                                ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                                : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300"
                            }`}
                          >
                            {transaction.status}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </PageSection>
    </>
  );
}

function InfoCard({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-black p-4">
      <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
        {label}
      </p>
      <p
        className={`mt-2 text-xl font-semibold ${
          accent ? "text-pink-600 dark:text-pink-400" : "text-gray-900 dark:text-gray-100"
        }`}
      >
        {value}
      </p>
    </div>
  );
}
