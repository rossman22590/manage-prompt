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
      <button
        type="button"
        onClick={() => setModalOpen(true)}
        className="p-0 m-0 h-auto text-primary-600 hover:text-primary-500 font-medium bg-transparent border-none cursor-pointer"
      >
        Upgrade
      </button>
      <CreditPackModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onSelectPack={handleSelectPack}
      />
    </>
  );
}

