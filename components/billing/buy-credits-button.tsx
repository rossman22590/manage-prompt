"use client";

import { getCreditPackCheckoutUrl } from "@/app/(dashboard)/settings/actions";
import { CreditPackModal } from "@/components/settings/credit-pack-modal";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export function BuyCreditsButton() {
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSelectPack = async (priceId: string) => {
    setLoading(true);
    try {
      const { url } = await getCreditPackCheckoutUrl(priceId);
      window.location.href = url;
    } catch (error: any) {
      console.error("Error getting checkout URL:", error);
      const errorMessage =
        error?.message ||
        "Failed to start checkout. Please check that the price IDs are configured correctly in Stripe.";
      alert(errorMessage);
    } finally {
      setLoading(false);
      setModalOpen(false);
    }
  };

  return (
    <>
      <Button
        type="button"
        onClick={() => setModalOpen(true)}
        variant="default"
        size="lg"
        className="mt-4 bg-pink-500 hover:bg-[hsl(330,81%,40%)] text-white w-full rounded-full transition-all duration-300 ease-in-out transform hover:scale-105"
      >
        Buy Credits
      </Button>
      <CreditPackModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onSelectPack={handleSelectPack}
      />
    </>
  );
}
