"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CreditCard, Sparkles } from "lucide-react";

const CREDIT_PACKS = [
  {
    name: "Starter Pack",
    price: 25,
    priceId: "price_1QzO922D5LvztGUlhIuJKycE",
    credits: 1000, // You can adjust this
    description: "Perfect for getting started",
  },
  {
    name: "Pro Pack",
    price: 50,
    priceId: "price_1QzO922D5LvztGUl0dxarHwk",
    credits: 2500, // You can adjust this
    description: "Best value for power users",
    popular: true,
  },
];

interface CreditPackModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectPack: (priceId: string) => void;
}

export function CreditPackModal({
  open,
  onOpenChange,
  onSelectPack,
}: CreditPackModalProps) {
  const [loading, setLoading] = useState<string | null>(null);

  const handleSelect = async (priceId: string) => {
    setLoading(priceId);
    try {
      onSelectPack(priceId);
    } catch (error) {
      console.error("Error selecting pack:", error);
    } finally {
      setLoading(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] border-pink-200 dark:border-pink-800">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl text-pink-600 dark:text-pink-400">
            <Sparkles className="h-6 w-6 text-pink-500" />
            Buy Credit Packs
          </DialogTitle>
          <DialogDescription className="text-pink-600/80 dark:text-pink-400/80">
            Choose a credit pack to add credits to your account. Credits are
            deducted when you run workflows (1 credit = 100 tokens).
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4 md:grid-cols-2">
          {CREDIT_PACKS.map((pack) => (
            <div
              key={pack.priceId}
              className={`relative rounded-lg border-2 p-6 transition-all hover:shadow-lg ${
                pack.popular
                  ? "border-pink-500 bg-pink-50 dark:bg-pink-950/20"
                  : "border-pink-200 dark:border-pink-800 bg-background"
              }`}
            >
              {pack.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="rounded-full bg-pink-500 px-3 py-1 text-xs font-semibold text-white">
                    POPULAR
                  </span>
                </div>
              )}

              <div className="mb-4">
                <h3 className="text-xl font-bold text-pink-700 dark:text-pink-300">
                  {pack.name}
                </h3>
                <p className="mt-1 text-sm text-pink-600/70 dark:text-pink-400/70">
                  {pack.description}
                </p>
              </div>

              <div className="mb-4">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-pink-600 dark:text-pink-400">
                    ${pack.price}
                  </span>
                  <span className="text-sm text-pink-500/70 dark:text-pink-400/70">
                    one-time
                  </span>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-pink-500" />
                  <span className="text-lg font-semibold text-pink-700 dark:text-pink-300">
                    {pack.credits.toLocaleString()} credits
                  </span>
                </div>
              </div>

              <Button
                onClick={() => handleSelect(pack.priceId)}
                disabled={loading === pack.priceId}
                className={`w-full ${
                  pack.popular
                    ? "bg-pink-500 hover:bg-pink-600 text-white border-pink-500"
                    : "bg-pink-50 hover:bg-pink-100 text-pink-700 dark:bg-pink-950/30 dark:hover:bg-pink-900/40 dark:text-pink-300 border-pink-300 dark:border-pink-700"
                }`}
                variant={pack.popular ? "default" : "outline"}
              >
                {loading === pack.priceId ? (
                  "Processing..."
                ) : (
                  <>
                    <CreditCard className="mr-2 h-4 w-4" />
                    Buy Now
                  </>
                )}
              </Button>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

