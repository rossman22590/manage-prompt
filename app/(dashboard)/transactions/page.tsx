import PageSection from "@/components/core/page-section";
import PageTitle from "@/components/layout/page-title";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { owner } from "@/lib/hooks/useOwner";
import { prisma } from "@/lib/utils/db";
import { notFound } from "next/navigation";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-12-15.clover",
});

export default async function Transactions() {
  const { ownerId } = await owner();

  const organization = await prisma.organization.findUnique({
    where: {
      id: ownerId,
    },
    include: {
      stripe: true,
      workflows: {
        include: {
          runs: {
            orderBy: {
              createdAt: "desc",
            },
            take: 100, // Limit to recent runs per workflow
          },
        },
      },
    },
  });

  if (!organization) {
    return notFound();
  }

  // Get Stripe invoices and payment intents
  let stripeTransactions: Array<{
    id: string;
    type: "subscription" | "payment" | "credit_usage";
    description: string;
    amount: number;
    date: Date;
    status: string;
  }> = [];

  if (organization.stripe?.customerId) {
    try {
      const customerId = organization.stripe.customerId;
      
      // Get invoices
      const invoices = await stripe.invoices.list({
        customer: customerId,
        limit: 100,
      });

      stripeTransactions.push(
        ...invoices.data.map((invoice) => {
          // Check if invoice is for a subscription by looking at subscription field
          const isSubscription = !!(invoice as any).subscription;
          return {
            id: invoice.id,
            type: isSubscription ? ("subscription" as const) : ("payment" as const),
            description: invoice.description || invoice.lines.data[0]?.description || "Payment",
            amount: invoice.amount_paid / 100,
            date: new Date(invoice.created * 1000),
            status: invoice.status || "paid",
          };
        })
      );

      // Get payment intents (one-time payments like credit packs)
      const paymentIntents = await stripe.paymentIntents.list({
        customer: customerId,
        limit: 100,
      });

      stripeTransactions.push(
        ...paymentIntents.data
          .filter((pi) => pi.status === "succeeded")
          .map((pi) => ({
            id: pi.id,
            type: "payment" as const,
            description: pi.description || "Credit Pack Purchase",
            amount: (pi.amount || 0) / 100,
            date: new Date(pi.created * 1000),
            status: pi.status,
          }))
      );
    } catch (error) {
      console.error("Error fetching Stripe transactions:", error);
    }
  }

  // Flatten runs from all workflows and add credit usage transactions
  const allRuns = organization.workflows.flatMap((workflow) => workflow.runs);
  
  // Sort runs by date and take the most recent 100 across all workflows
  const recentRuns = allRuns
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 100);

  const creditUsageTransactions = recentRuns.map((run) => {
    const creditsUsed = Math.max(1, Math.ceil(run.totalTokenCount / 100));
    return {
      id: `run-${run.id}`,
      type: "credit_usage" as const,
      description: `Workflow Run - ${run.totalTokenCount} tokens (${creditsUsed} credits)`,
      amount: -creditsUsed, // Negative for usage
      date: run.createdAt,
      status: "completed",
    };
  });

  // Combine and sort all transactions by date (newest first)
  const allTransactions = [...stripeTransactions, ...creditUsageTransactions].sort(
    (a, b) => b.date.getTime() - a.date.getTime()
  );

  return (
    <>
      <PageTitle title="Transactions" />
      <PageSection topInset>
        <div className="mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
          <div className="mb-6">
            <h2 className="text-base font-semibold leading-7 text-gray-900 dark:text-gray-200">
              Transaction History
            </h2>
            <p className="mt-1 text-sm leading-6 text-gray-500 dark:text-gray-400">
              View all your billing transactions, subscriptions, and credit usage.
            </p>
          </div>

          <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="whitespace-nowrap">Date</TableHead>
                    <TableHead className="whitespace-nowrap">Type</TableHead>
                    <TableHead className="min-w-[200px]">Description</TableHead>
                    <TableHead className="text-right whitespace-nowrap">Amount</TableHead>
                    <TableHead className="whitespace-nowrap">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allTransactions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-gray-500 dark:text-gray-400">
                        No transactions found
                      </TableCell>
                    </TableRow>
                  ) : (
                    allTransactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell className="font-medium whitespace-nowrap">
                          <div className="flex flex-col">
                            <span className="text-sm">{transaction.date.toLocaleDateString()}</span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {transaction.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${
                            transaction.type === "subscription"
                              ? "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300"
                              : transaction.type === "payment"
                              ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                              : "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300"
                          }`}>
                            {transaction.type === "subscription" ? "Subscription" : transaction.type === "payment" ? "Payment" : "Credit Usage"}
                          </span>
                        </TableCell>
                        <TableCell className="max-w-[300px]">
                          <div className="truncate" title={transaction.description}>
                            {transaction.description}
                          </div>
                        </TableCell>
                        <TableCell className={`text-right font-semibold whitespace-nowrap ${
                          transaction.amount < 0 ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400"
                        }`}>
                          {transaction.amount < 0 ? "-" : "+"}
                          {transaction.type === "credit_usage" 
                            ? `${Math.abs(transaction.amount)} credits`
                            : `$${Math.abs(transaction.amount).toFixed(2)}`
                          }
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          <span className={`px-2 py-1 rounded text-xs ${
                            transaction.status === "paid" || transaction.status === "succeeded" || transaction.status === "completed"
                              ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                              : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300"
                          }`}>
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

