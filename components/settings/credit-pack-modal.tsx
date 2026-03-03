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
import { CREDIT_PACKS } from "@/data/credit-packs";
import { CreditCard, Sparkles } from "lucide-react";

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
      <DialogContent className="sm:max-w-[600px] border-gray-200 dark:border-gray-800">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-gray-200">
            Buy Credit Packs
          </DialogTitle>
          <DialogDescription className="text-gray-600 dark:text-gray-400">
            Choose a credit pack to add credits to your account. Credits are
            deducted when you run workflows (1 credit = 100 tokens).
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4 md:grid-cols-2">
          {CREDIT_PACKS.map((pack) => (
            <div
              key={pack.priceId}
              className={`relative rounded-lg border p-6 transition-all ${
                pack.popular
                  ? "border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-[#1a1a1a]"
                  : "border-gray-200 dark:border-gray-800 bg-white dark:bg-black"
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
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-200">
                  {pack.name}
                </h3>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  {pack.description}
                </p>
              </div>

              <div className="mb-4">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-gray-900 dark:text-gray-200">
                    ${pack.price}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    one-time
                  </span>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                  <span className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                    {pack.credits.toLocaleString()} credits
                  </span>
                </div>
              </div>

              <Button
                onClick={() => handleSelect(pack.priceId)}
                disabled={loading === pack.priceId}
                className="w-full bg-pink-500 hover:bg-pink-600 text-white"
                variant="default"
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

