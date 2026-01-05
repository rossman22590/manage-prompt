"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CreditPackModal } from "./credit-pack-modal";
import { getCreditPackCheckoutUrl } from "@/app/(dashboard)/settings/actions";

export function UpgradeButton() {
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
        size="sm"
        className="bg-pink-500 hover:bg-pink-600 text-white"
      >
        Upgrade
      </Button>
      <CreditPackModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onSelectPack={handleSelectPack}
      />
    </>
  );
}

