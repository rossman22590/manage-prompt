import PageSection from "@/components/core/page-section";
import { ActionButton, DeleteButton } from "@/components/form/button";
import { EditableValue } from "@/components/form/editable-text";
import PageTitle from "@/components/layout/page-title";
import { ShowHideKey } from "@/components/settings/show-hide-key";
import { UpgradeButton } from "@/components/settings/upgrade-button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { SecretKey } from "@/generated/prisma-client/client";
import { getUser, owner } from "@/lib/hooks/useOwner";
import { DateTime } from "@/lib/utils/datetime";
import { prisma } from "@/lib/utils/db";
import {
  getUpcomingInvoice,
  isSubscriptionCancelled,
} from "@/lib/utils/stripe";
import { notFound } from "next/navigation";
import type Stripe from "stripe";
import {
  createSecretKey,
  redirectToBilling,
  removeSpendLimit,
  revokeSecretKey,
  updateKeyName,
  updateRateLimit,
  updateSpendLimit,
  updateUserName,
} from "./actions";

export default async function Settings() {
  const { userId, ownerId } = await owner();

  const [user, organization, secretKeys] = await Promise.all([
    getUser(),
    prisma.organization.findUnique({
      where: {
        id: ownerId,
      },
      include: {
        stripe: true,
      },
    }),
    prisma.secretKey.findMany({
      where: {
        organization: {
          id: {
            equals: ownerId,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    }),
  ]);

  if (!user) {
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
      <PageTitle title="Settings" />
      <PageSection topInset>
        <div className="mx-auto max-w-2xl space-y-16 lg:mx-0 lg:max-w-none p-4 sm:p-6 w-full min-w-0 overflow-x-hidden">
          <div>
            <h2 className="text-base font-semibold leading-7 text-gray-900 dark:text-gray-200">
              Account
            </h2>
            <p className="mt-1 text-sm leading-6 text-gray-500 dark:text-gray-400">
              Manage your account settings and billing information.
            </p>

            <dl className="mt-6 space-y-4 divide-y border-t text-sm leading-6">
              <div className="pt-2 sm:flex">
                <dt className="font-medium text-gray-900 dark:text-gray-200 sm:w-64 sm:flex-none sm:pr-6">
                  Credits
                </dt>
                <dd className="mt-1 flex min-w-0 flex-col gap-2 sm:mt-0 sm:flex-auto sm:flex-row sm:items-center sm:justify-between sm:gap-x-6">
                  <div className="text-gray-900 dark:text-gray-200">
                    {organization?.credits.toLocaleString() ?? 0} credits left
                  </div>
                  {!subscription ? <UpgradeButton /> : null}
                </dd>
              </div>

              <div className="pt-2 sm:flex">
                <dt className="font-medium text-gray-900 dark:text-gray-200 sm:w-64 sm:flex-none sm:pr-6">
                  Billing
                </dt>
                {subscription ? (
                  <dd className="mt-1 flex min-w-0 flex-col gap-3 sm:mt-0 sm:flex-auto sm:flex-row sm:items-start sm:justify-between sm:gap-x-6">
                    <div className="min-w-0 text-gray-900 dark:text-gray-200">
                      <Badge variant="default">
                        {subscription?.status.toUpperCase()}
                      </Badge>
                      {invoice?.amount_remaining && invoice?.period_end ? (
                        <p className="mt-2">
                          <span className="font-bold">Next Invoice:</span>
                          <span className="ml-2 break-words">
                            USD {(invoice.amount_remaining / 100).toFixed(2)} on{" "}
                            {DateTime.fromSeconds(
                              invoice.period_end,
                            ).toDateString()}
                          </span>
                        </p>
                      ) : null}
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <span className="font-semibold">
                          Monthly Spend Limit (USD):
                        </span>
                        <span className="ml-2">
                          <EditableValue
                            id={ownerId}
                            name="spendLimit"
                            type="number"
                            value={organization?.spendLimit ?? "-"}
                            action={updateSpendLimit}
                          />
                        </span>
                        {organization?.spendLimit ? (
                          <form action={removeSpendLimit}>
                            <input type="hidden" name="id" value={ownerId} />
                            <ActionButton
                              className="p-0 m-0 h-5"
                              variant="link"
                              label="Remove"
                              loadingLabel="Removing..."
                            />
                          </form>
                        ) : null}
                      </div>
                    </div>
                    <form action={redirectToBilling}>
                      <ActionButton
                        variant="link"
                        label={
                          isSubscriptionCancelled(subscription)
                            ? "Upgrade"
                            : "Manage"
                        }
                        loadingLabel="Loading..."
                        className="p-0 m-0 h-auto text-primary-600 hover:text-primary-500 font-medium"
                      />
                    </form>
                  </dd>
                ) : (
                  <dd className="mt-1 flex min-w-0 flex-col gap-2 sm:mt-0 sm:flex-auto sm:flex-row sm:items-center sm:justify-between sm:gap-x-6">
                    <div className="text-gray-900 dark:text-gray-200">
                      Pay as you go
                    </div>
                  </dd>
                )}
              </div>

              <div className="pt-2 sm:flex">
                <dt className="font-medium text-gray-900 dark:text-gray-200 sm:w-64 sm:flex-none sm:pr-6">
                  Name
                </dt>
                <dd className="mt-1 flex min-w-0 flex-col gap-2 sm:mt-0 sm:flex-auto sm:flex-row sm:items-center sm:justify-between sm:gap-x-6">
                  <div className="text-gray-900 dark:text-gray-200">
                    <EditableValue
                      id={userId}
                      name="userName"
                      type="text"
                      value={user?.name ?? ""}
                      action={updateUserName}
                    />
                  </div>
                </dd>
              </div>

              {user?.email ? (
                <div className="pt-2 sm:flex">
                  <dt className="font-medium text-gray-900 dark:text-gray-200 sm:w-64 sm:flex-none sm:pr-6">
                    Email address
                  </dt>
                  <dd className="mt-1 flex min-w-0 flex-col gap-2 sm:mt-0 sm:flex-auto sm:flex-row sm:items-center sm:justify-between sm:gap-x-6">
                    <div className="text-gray-900 dark:text-gray-200">
                      {user?.email}
                    </div>
                  </dd>
                </div>
              ) : null}
            </dl>
          </div>

        </div>
      </PageSection>

      <PageSection className="overflow-y-auto">
        <div className="mx-auto max-w-2xl lg:mx-0 lg:max-w-none p-4 sm:p-6 w-full min-w-0 overflow-x-hidden">
          <h2 className="text-base font-semibold leading-7 text-gray-900 dark:text-gray-200">
            API Credentials
          </h2>
          <p className="mt-1 text-sm leading-6 text-gray-500 dark:text-gray-400">
            These keys should be kept secret and not shared publicly. You can
            read more about our API and rate limting{" "}
            <a
              href="https://support.myapps.ai/aitutor-api/aitutor-api-info"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary font-semibold"
            >
              here.
            </a>
            <br />
            You can revoke a key at any time if you believe it has been
            compromised.
          </p>

          <div className="mt-6 w-full">
            {!secretKeys.length ? (
              <div className="mb-6 pb-6 border-b">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  You have not created any secret keys yet.
                </p>
                <form action={createSecretKey} className="inline-block">
                  <ActionButton
                    variant="default"
                    label="Generate Key"
                    loadingLabel="Creating..."
                    className="bg-pink-500 hover:bg-pink-600 text-white"
                  />
                </form>
              </div>
            ) : (
              <div className="mb-6 pb-6 border-b">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  You can create multiple secret keys to use with the API.
                </p>
                <form action={createSecretKey} className="inline-block">
                  <ActionButton
                    variant="default"
                    label="Create Key"
                    loadingLabel="Creating..."
                    className="bg-pink-500 hover:bg-pink-600 text-white"
                  />
                </form>
              </div>
            )}
            <div className="space-y-4 sm:hidden">
              {secretKeys.map((key: SecretKey) => (
                <div
                  key={key.id}
                  className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                        Name
                      </p>
                      <EditableValue
                        id={key.id}
                        name="keyName"
                        type="text"
                        value={key.name ?? "-"}
                        action={updateKeyName}
                      />
                    </div>
                    <form action={revokeSecretKey}>
                      <input type="hidden" name="id" value={key.id} />
                      <DeleteButton label="Revoke" size="sm" />
                    </form>
                  </div>
                  <div className="mt-4 space-y-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                        Key
                      </p>
                      <ShowHideKey keyValue={key.key} />
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                        Rate Limit (Req/sec)
                      </p>
                      <EditableValue
                        id={key.id}
                        name="rateLimitPerSecond"
                        type="number"
                        value={key.rateLimitPerSecond}
                        action={updateRateLimit}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="hidden sm:block">
              <Table className="w-full">
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead className="min-w-0">Key</TableHead>
                    <TableHead>Rate Limit (Req/sec)</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {secretKeys.map((key: SecretKey) => (
                    <TableRow key={key.id}>
                      <TableCell>
                        <EditableValue
                          id={key.id}
                          name="keyName"
                          type="text"
                          value={key.name ?? "-"}
                          action={updateKeyName}
                        />
                      </TableCell>
                      <TableCell className="min-w-0">
                        <ShowHideKey keyValue={key.key} />
                      </TableCell>
                      <TableCell>
                        <EditableValue
                          id={key.id}
                          name="rateLimitPerSecond"
                          type="number"
                          value={key.rateLimitPerSecond}
                          action={updateRateLimit}
                        />
                      </TableCell>
                      <TableCell>
                        <form action={revokeSecretKey}>
                          <input type="hidden" name="id" value={key.id} />
                          <DeleteButton label="Revoke" />
                        </form>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </PageSection>

    </>
  );
}
