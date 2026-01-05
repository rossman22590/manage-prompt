import { prisma } from "@/lib/utils/db";
import { createId } from "@paralleldrive/cuid2";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2024-12-18.acacia",
});

export async function createOrRetrieveCustomer(
  ownerId: string,
): Promise<string> {
  const organization = await prisma.organization.findUnique({
    include: {
      stripe: true,
    },
    where: {
      id: ownerId,
    },
  });

  if (!organization) {
    throw new Error("Organization not found");
  }

  if (organization?.stripe?.customerId) {
    return organization?.stripe?.customerId;
  }

  const customer = await stripe.customers.create({
    name: organization.name ?? "",
    metadata: {
      organizationId: organization?.id,
    },
  });

  await prisma.stripe.create({
    data: {
      organization: {
        connect: {
          id: organization?.id,
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
    const { url } = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${process.env.APP_BASE_URL}/settings`,
    });

    return url;
  }

  const { url } = await stripe.checkout.sessions.create({
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

      await stripe.subscriptionItems.createUsageRecord(
        item.id,
        {
          quantity,
          timestamp: timestamp,
          action: "increment",
        },
        {
          idempotencyKey: `${subscription.id}-${createId()}`,
        },
      ).catch((error) => {
        console.error("Failed to report usage to Stripe:", error);
        // Don't throw - credits are already deducted
      });
    }
  }
}

export function isSubscriptionActive(subscription: any) {
  if (!subscription) return false;
  // Handle both JSON object and parsed object
  const status = typeof subscription === "string" 
    ? JSON.parse(subscription)?.status 
    : subscription?.status;
  return ["trialing", "active"].includes(status);
}

export function isSubscriptionCancelled(subscription: any) {
  if (!subscription) return false;
  // Handle both JSON object and parsed object
  const status = typeof subscription === "string" 
    ? JSON.parse(subscription)?.status 
    : subscription?.status;
  return status === "canceled";
}

export async function getUpcomingInvoice(
  customer: string,
): Promise<Stripe.Invoice | null> {
  try {
    const invoice = await stripe.invoices.retrieveUpcoming({
      customer,
    });
    return invoice;
  } catch (error: any) {
    if (error?.statusCode !== 404) {
      console.error("Failed to get invoice for cutsomer: ", customer, error);
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
