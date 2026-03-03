import { prisma } from "@/lib/utils/db";
import { getCreditsForCreditPackPriceId } from "@/data/credit-packs";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import type Stripe from "stripe";

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const secret = process.env.STRIPE_WEBHOOK_SECRET || "";

function getRawDataObject(rawData: unknown): Record<string, unknown> {
  if (!rawData || typeof rawData !== "object" || Array.isArray(rawData)) {
    return {};
  }
  return rawData as Record<string, unknown>;
}

function getProcessedSessionIds(rawData: unknown): string[] {
  const object = getRawDataObject(rawData);
  const value = object.processedCreditCheckoutSessionIds;
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(_: Request) {
  return new Response("Hello!", {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.text();

    const signature = (await headers()).get("stripe-signature");

    const event = stripe.webhooks.constructEvent(body, signature, secret);

    switch (event.type) {
      case "customer.subscription.created": {
        const createdSubscription: Stripe.Subscription = event.data.object;
        await prisma.stripe.update({
          where: {
            customerId: String(createdSubscription.customer),
          },
          data: {
            subscriptionId: createdSubscription.id,
            subscription: JSON.parse(JSON.stringify(createdSubscription)),
          },
        });
        break;
      }
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const updatedSubscription: Stripe.Subscription = event.data.object;
        await prisma.stripe.update({
          where: {
            subscriptionId: updatedSubscription.id,
          },
          data: {
            subscriptionId: updatedSubscription.id,
            subscription: JSON.parse(JSON.stringify(updatedSubscription)),
          },
        });
        break;
      }
      case "checkout.session.completed": {
        const session: Stripe.Checkout.Session = event.data.object;
        if (session.mode !== "payment" || session.payment_status !== "paid") {
          break;
        }

        const customerId =
          typeof session.customer === "string" ? session.customer : null;
        if (!customerId) {
          break;
        }

        const stripeRecord = await prisma.stripe.findUnique({
          where: {
            customerId,
          },
          select: {
            ownerId: true,
          },
        });

        if (!stripeRecord) {
          break;
        }

        let creditsToAdd = Number(session.metadata?.creditPackCredits ?? 0);
        if (!Number.isFinite(creditsToAdd) || creditsToAdd <= 0) {
          const priceIdFromMetadata = session.metadata?.creditPackPriceId;
          if (priceIdFromMetadata) {
            creditsToAdd = getCreditsForCreditPackPriceId(priceIdFromMetadata);
          }
        }

        if (!Number.isFinite(creditsToAdd) || creditsToAdd <= 0) {
          const lineItems = await stripe.checkout.sessions.listLineItems(
            session.id,
            { limit: 10 },
          );
          const firstPriceId = lineItems.data[0]?.price?.id;
          if (firstPriceId) {
            creditsToAdd = getCreditsForCreditPackPriceId(firstPriceId);
          }
        }

        if (!Number.isFinite(creditsToAdd) || creditsToAdd <= 0) {
          console.warn(
            `Credit pack checkout session ${session.id} had no known price mapping.`,
          );
          break;
        }

        await prisma.$transaction(async (tx) => {
          const org = await tx.organization.findUnique({
            where: {
              id: stripeRecord.ownerId,
            },
            select: {
              id: true,
              rawData: true,
            },
          });

          if (!org) return;

          const processedIds = getProcessedSessionIds(org.rawData);
          if (processedIds.includes(session.id)) {
            return;
          }

          const rawDataObject = getRawDataObject(org.rawData);
          await tx.organization.update({
            where: {
              id: org.id,
            },
            data: {
              credits: {
                increment: Math.round(creditsToAdd),
              },
              rawData: {
                ...rawDataObject,
                processedCreditCheckoutSessionIds: [...processedIds, session.id],
                lastCreditTopUp: {
                  sessionId: session.id,
                  creditsAdded: Math.round(creditsToAdd),
                  at: new Date().toISOString(),
                },
              },
            },
          });
        });
        break;
      }
      default:
        console.log(`Unhandled event type ${event.type}`, event);
        break;
    }

    return NextResponse.json({ result: event, ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        message: "something went wrong",
        ok: false,
      },
      { status: 500 },
    );
  }
}
