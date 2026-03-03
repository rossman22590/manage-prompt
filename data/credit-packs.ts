export const CREDIT_PACKS = [
  {
    name: "Starter Pack",
    price: 25,
    priceId: "price_1QzO922D5LvztGUlhIuJKycE",
    credits: 1000,
    description: "Perfect for getting started",
  },
  {
    name: "Pro Pack",
    price: 50,
    priceId: "price_1QzO922D5LvztGUl0dxarHwk",
    credits: 2500,
    description: "Best value for power users",
    popular: true,
  },
] as const;

export function getCreditsForCreditPackPriceId(priceId: string): number {
  const pack = CREDIT_PACKS.find((item) => item.priceId === priceId);
  return pack?.credits ?? 0;
}
