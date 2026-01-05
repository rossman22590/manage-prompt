import { BuyCreditsButton } from "@/components/billing/buy-credits-button";
import PageSection from "@/components/core/page-section";
import PageTitle from "@/components/layout/page-title";
import { UpgradeButton } from "@/components/settings/upgrade-button";
import { Button } from "@/components/ui/button";
import { owner } from "@/lib/hooks/useOwner";
import { prisma } from "@/lib/utils/db";
import { getUpcomingInvoice } from "@/lib/utils/stripe";
import { CheckIcon } from "lucide-react";
import { notFound, redirect } from "next/navigation";
import type Stripe from "stripe";
import { getEnterprisePlanCheckoutUrl } from "../settings/actions";

export default async function Billing() {
  const { ownerId } = await owner();

  const organization = await prisma.organization.findUnique({
    where: {
      id: ownerId,
    },
    include: {
      stripe: true,
    },
  });

  if (!organization) {
    return notFound();
  }

  const subscription = organization?.stripe
    ?.subscription as unknown as Stripe.Subscription;

  const invoice: Stripe.Invoice | null =
    organization?.stripe?.customerId && subscription?.id
      ? await getUpcomingInvoice(
          organization?.stripe?.customerId,
          subscription.id,
        )
      : null;

  return (
    <>
      <PageTitle title="Billing" />
      <PageSection topInset>
        <div className="mx-auto max-w-5xl space-y-8 p-6">
          {/* Current Credits */}
          <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-black p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-200">
                  Current Credits
                </h3>
                <p className="mt-1 text-3xl font-bold text-pink-600 dark:text-pink-400">
                  {organization?.credits.toLocaleString() ?? 0}
                </p>
              </div>
              {!subscription && <UpgradeButton />}
            </div>
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            {/* Buy Credits Card */}
            <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-black overflow-hidden">
              <div className="p-8 sm:p-10">
                <h3 className="text-xl font-semibold tracking-tight text-gray-900 dark:text-gray-200">
                  Buy Credit Packs
                </h3>
                <p className="mt-4 text-sm leading-6 text-gray-600 dark:text-gray-400">
                  Purchase credit packs to add credits to your account. Credits are deducted when you run workflows (1 credit = 100 tokens).
                </p>
                <div className="mt-8 flex items-center gap-x-4">
                  <h4 className="flex-none text-sm font-medium leading-6 text-gray-700 dark:text-gray-300">
                    Available Packs
                  </h4>
                  <div className="h-px flex-auto bg-gray-200 dark:bg-gray-800" />
                </div>
                <ul
                  role="list"
                  className="mt-6 space-y-3 text-sm leading-6 text-gray-600 dark:text-gray-400"
                >
                  <li className="flex gap-x-3 items-center">
                    <CheckIcon className="h-5 w-5 flex-none text-gray-500 dark:text-gray-400" aria-hidden="true" />
                    Starter Pack: $25 for 1,000 credits
                  </li>
                  <li className="flex gap-x-3 items-center">
                    <CheckIcon className="h-5 w-5 flex-none text-gray-500 dark:text-gray-400" aria-hidden="true" />
                    Pro Pack: $50 for 2,500 credits
                  </li>
                </ul>
              </div>
              <div className="border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#1a1a1a] py-8 text-center">
                <div className="mx-auto max-w-xs px-8">
                  <BuyCreditsButton />
                </div>
              </div>
            </div>

            {/* Enterprise Subscription Card */}
            {!subscription && (
              <div className="rounded-3xl ring-2 ring-pink-500 dark:ring-pink-600 bg-white dark:bg-black shadow-xl overflow-hidden">
                <div className="p-8 sm:p-10">
                  <div className="flex items-center gap-2 mb-4">
                    <h3 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-200">
                      Enterprise AI Tutor API Plan
                    </h3>
                    <span className="rounded-full bg-pink-100 dark:bg-pink-900 px-3 py-1 text-xs font-semibold text-pink-600 dark:text-pink-300">
                      Popular
                    </span>
                  </div>
                  <p className="text-base leading-7 text-gray-600 dark:text-gray-400">
                    Get access to our powerful AI Tutor API with all the features you need to create intelligent tutoring systems.
                  </p>
                  <div className="mt-10 flex items-center gap-x-4">
                    <h4 className="flex-none text-sm font-semibold leading-6 text-pink-600 dark:text-pink-400">
                      What&apos;s included
                    </h4>
                    <div className="h-px flex-auto bg-purple-200 dark:bg-purple-800" />
                  </div>
                  <ul
                    role="list"
                    className="mt-8 space-y-4 text-sm leading-6 text-gray-600 dark:text-gray-400"
                  >
                    {[
                      "Unlimited workflows",
                      "Models by OpenAI, Meta, Google, Mixtral and Anthropic",
                      "Email support",
                    ].map((feature) => (
                      <li key={feature} className="flex gap-x-3 items-center">
                        <CheckIcon className="h-6 w-5 flex-none text-pink-600 dark:text-pink-400" aria-hidden="true" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-2xl bg-purple-50 dark:bg-purple-900/20 py-10 text-center ring-1 ring-inset ring-purple-200 dark:ring-purple-800">
                  <div className="mx-auto max-w-xs px-8">
                    <p className="text-base font-semibold text-gray-600 dark:text-gray-400">Billed Monthly</p>
                    <p className="mt-6 flex items-baseline justify-center gap-x-2">
                      <span className="text-5xl font-bold tracking-tight text-gray-900 dark:text-gray-200">$150</span>
                      <span className="text-sm font-semibold leading-6 tracking-wide text-gray-600 dark:text-gray-400">/10M tokens</span>
                    </p>
                    <form action={async () => {
                      'use server';
                      const { url } = await getEnterprisePlanCheckoutUrl();
                      redirect(url);
                    }}>
                      <Button
                        type="submit"
                        variant="default"
                        size="lg"
                        className="mt-10 bg-pink-500 hover:bg-[hsl(330,81%,40%)] text-white w-full rounded-full transition-all duration-300 ease-in-out transform hover:scale-105"
                      >
                        Subscribe to Enterprise
                      </Button>
                    </form>
                  </div>
                </div>
              </div>
            )}

            {/* Current Subscription Info */}
            {subscription && (
              <div className="rounded-3xl ring-1 ring-purple-200 dark:ring-purple-900 bg-white dark:bg-black shadow-xl overflow-hidden">
                <div className="p-8 sm:p-10">
                  <h3 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-200">
                    Current Subscription
                  </h3>
                  <div className="mt-6 space-y-4">
                    <div>
                      <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">Status:</span>
                      <span className="ml-2 text-lg font-bold text-gray-900 dark:text-gray-200">
                        {subscription?.status.toUpperCase()}
                      </span>
                    </div>
                    {invoice?.amount_remaining && invoice?.period_end && (
                      <div>
                        <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">Next Invoice:</span>
                        <span className="ml-2 text-lg text-gray-900 dark:text-gray-200">
                          USD {(invoice.amount_remaining / 100).toFixed(2)} on{" "}
                          {new Date(invoice.period_end * 1000).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </PageSection>
    </>
  );
}

