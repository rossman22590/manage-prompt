import Stripe from "stripe";
import { prisma } from "@/lib/utils/db";

// Lazily constructed: `new Stripe()` throws synchronously if given a falsy
// apiKey. Building this eagerly at module scope meant every route importing
// from this file — including ones that reject a request before reaching any
// billing logic (missing bearer token, invalid input, etc.) — would 500 the
// instant STRIPE_SECRET_KEY is unset, rather than let those earlier checks run.
let stripeClient: Stripe | null = null;

function getStripe(): Stripe {
  if (!stripeClient) {
    stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
      apiVersion: "2025-12-15.clover",
    });
  }
  return stripeClient;
}

export async function createOrRetrieveCustomer(
  ownerId: string,
): Promise<string> {
  const organization = await prisma.organization.findUnique({
    include: {
      stripe: true,
      createdBy: true, // Include user to get name and email
    },
    where: {
      id: ownerId,
    },
  });

  if (!organization) {
    throw new Error("Organization not found");
  }

  // If customer ID exists, verify it exists in Stripe
  if (organization?.stripe?.customerId) {
    try {
      // Verify customer exists in Stripe
      await getStripe().customers.retrieve(organization.stripe.customerId);
      return organization.stripe.customerId;
    } catch (error: any) {
      // If customer doesn't exist in Stripe, delete the record and create a new one
      if (error?.code === "resource_missing") {
        console.log(
          `Customer ${organization.stripe.customerId} not found in Stripe, creating new customer`,
        );
        await prisma.stripe.delete({
          where: {
            customerId: organization.stripe.customerId,
          },
        });
      } else {
        throw error;
      }
    }
  }

  // Get user name and email
  const userName = organization.createdBy?.name || organization.name || "";
  const userEmail = organization.createdBy?.email || "";

  // Create new customer in Stripe with name and email
  const customer = await getStripe().customers.create({
    name: userName,
    email: userEmail || undefined, // Only include email if it exists
    metadata: {
      organizationId: organization.id,
      userId: organization.createdByUser,
    },
  });

  // Create or update Stripe record in database
  await prisma.stripe.upsert({
    where: {
      ownerId: organization.id,
    },
    update: {
      customerId: customer.id,
    },
    create: {
      organization: {
        connect: {
          id: organization.id,
        },
      },
      customerId: customer.id,
    },
  });

  return customer.id;
}

export async function getCheckoutSession(customerId: string): Promise<string> {
  const stripeCustomer = await prisma.stripe.findUnique({
    where: {
      customerId,
    },
  });

  if (
    stripeCustomer?.subscriptionId &&
    !isSubscriptionCancelled(stripeCustomer?.subscription)
  ) {
    const { url } = await getStripe().billingPortal.sessions.create({
      customer: customerId,
      return_url: `${process.env.APP_BASE_URL}/settings`,
    });

    if (!url) {
      throw new Error("Failed to create billing portal session");
    }

    return url;
  }

  const { url } = await getStripe().checkout.sessions.create({
    customer: customerId,
    billing_address_collection: "auto",
    line_items: [
      {
        price: process.env.STRIPE_WORKFLOW_RUN_PRICE_ID,
      },
    ],
    mode: "subscription",
    // allow_promotion_codes: true,
    discounts: [
      {
        coupon: process.env.STRIPE_COUPON_ID,
      },
    ],
    success_url: `${process.env.APP_BASE_URL}/settings?payment_success=true`,
    cancel_url: `${process.env.APP_BASE_URL}/settings?payment_canceled=true`,
  });

  if (!url) {
    throw new Error("Failed to create checkout session");
  }

  return url;
}

export async function getCreditPackCheckoutSession(
  customerId: string,
  priceId: string,
): Promise<string> {
  const { url } = await getStripe().checkout.sessions.create({
    customer: customerId,
    billing_address_collection: "auto",
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: `${process.env.APP_BASE_URL}/settings?payment_success=true`,
    cancel_url: `${process.env.APP_BASE_URL}/settings?payment_canceled=true`,
  });

  if (!url) {
    throw new Error("Failed to create checkout session");
  }

  return url;
}

export async function getSubscriptionCheckoutSession(
  customerId: string,
  priceId: string,
): Promise<string> {
  const { url } = await getStripe().checkout.sessions.create({
    customer: customerId,
    billing_address_collection: "auto",
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    mode: "subscription",
    success_url: `${process.env.APP_BASE_URL}/billing?payment_success=true`,
    cancel_url: `${process.env.APP_BASE_URL}/billing?payment_canceled=true`,
  });

  if (!url) {
    throw new Error("Failed to create checkout session");
  }

  return url;
}

export async function reportUsage(
  ownerId: string,
  subscription: Stripe.Subscription | null,
  quantity: number,
) {
  if (!ownerId) {
    throw new Error("[reportUsage]: Owner ID not found");
  }

  // Always deduct credits from database based on actual token usage
  // Convert tokens to credits (1 credit = 100 tokens)
  const creditsToDeduct = Math.max(1, Math.ceil(quantity / 100));

  await prisma.organization.update({
    where: {
      id: ownerId,
    },
    data: {
      credits: {
        decrement: creditsToDeduct,
      },
    },
  });

  // If there's an active subscription, also report usage to Stripe
  if (isSubscriptionActive(subscription) && subscription) {
    console.log(
      `Report usage for subscription ${subscription.id}, quantity ${quantity}`,
    );
    const item = subscription.items?.data.find(
      (item) => item.price.id === process.env.STRIPE_WORKFLOW_RUN_PRICE_ID,
    );

    if (item) {
      const timestamp = Number.parseInt(`${Date.now() / 1000}`);

      try {
        // Note: Usage records API may have changed in newer Stripe versions
        // Credits are already deducted from database above
        // Stripe usage reporting is optional and can be handled via webhooks
        console.log(
          `Usage for subscription ${subscription.id}, item ${item.id}, quantity ${quantity}`,
        );
        // TODO: Re-implement Stripe usage reporting when API is confirmed
      } catch (error: any) {
        console.error("Failed to report usage to Stripe:", error);
        // Don't throw - credits are already deducted
      }
    }
  }
}

export function isSubscriptionActive(subscription: any) {
  if (!subscription) return false;
  // Handle both JSON object and parsed object
  const status =
    typeof subscription === "string"
      ? JSON.parse(subscription)?.status
      : subscription?.status;
  return ["trialing", "active"].includes(status);
}

export function isSubscriptionCancelled(subscription: any) {
  if (!subscription) return false;
  // Handle both JSON object and parsed object
  const status =
    typeof subscription === "string"
      ? JSON.parse(subscription)?.status
      : subscription?.status;
  return status === "canceled";
}

export async function getUpcomingInvoice(
  customer: string,
  subscriptionId?: string,
): Promise<Stripe.Invoice | null> {
  try {
    // Only get upcoming invoice if there's an active subscription
    if (!subscriptionId) {
      return null;
    }

    // Use createPreview to get upcoming invoice preview
    const invoice = await getStripe().invoices.createPreview({
      customer,
      subscription: subscriptionId,
    });
    return invoice;
  } catch (error: any) {
    if (error?.statusCode !== 404) {
      console.error("Failed to get invoice for customer: ", customer, error);
    }
    return null;
  }
}

export async function hasExceededSpendLimit(
  spendLimit: number | null | undefined,
  stripeCustomerId: string | null | undefined,
): Promise<boolean> {
  if (spendLimit && stripeCustomerId) {
    const invoice = await getUpcomingInvoice(stripeCustomerId);
    if (!invoice) return false;
    return invoice.amount_due / 100 > spendLimit;
  }
  return false;
}

export type BillingGateReason =
  | "no_subscription"
  | "spend_limit_exceeded"
  | "zero_credits";

export type BillingGateResult =
  | { blocked: false }
  | { blocked: true; reason: BillingGateReason };

/**
 * Shared 0-credit blocking decision used by every run/chat route. Returns
 * *which* case applies (no_subscription / spend_limit_exceeded / zero_credits)
 * without an opinion on response shape or wording — callers differ on both
 * (owner-facing routes vs. the anonymous public share-link route), so each
 * call site maps `reason` to its own message and response envelope.
 */
export async function checkBillingGate(
  organization:
    | {
        credits?: number | null;
        spendLimit?: number | null;
        stripe?: { subscription?: unknown; customerId?: string | null } | null;
      }
    | null
    | undefined,
): Promise<BillingGateResult> {
  if ((organization?.credits ?? 0) > 0) {
    return { blocked: false };
  }
  if (!isSubscriptionActive(organization?.stripe?.subscription)) {
    return { blocked: true, reason: "no_subscription" };
  }
  if (
    await hasExceededSpendLimit(
      organization?.spendLimit,
      organization?.stripe?.customerId,
    )
  ) {
    return { blocked: true, reason: "spend_limit_exceeded" };
  }
  return { blocked: true, reason: "zero_credits" };
}
