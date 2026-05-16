"use client";

import { useState } from "react";

type CheckoutButtonProps = {
  topicSlug: string;
  priceLabel: string;
};

export function CheckoutButton({ topicSlug, priceLabel }: CheckoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  async function startCheckout() {
    if (isLoading) {
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topicSlug }),
      });
      const payload = (await response.json()) as {
        checkout_url?: string;
        error?: string;
      };

      if (!response.ok || !payload.checkout_url) {
        throw new Error(payload.error || "Betalningen kunde inte startas.");
      }

      window.location.href = payload.checkout_url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Betalningen kunde inte startas.");
      setIsLoading(false);
    }
  }

  return (
    <>
      <button
        className="mt-4 w-full bg-emerald-300 px-5 py-4 text-sm font-black text-[#04100b] transition hover:bg-emerald-200 disabled:cursor-wait disabled:opacity-70"
        disabled={isLoading}
        onClick={startCheckout}
        type="button"
      >
        {isLoading ? "Skickar till Stripe..." : `Lås upp analyspaketet för ${priceLabel}`}
      </button>
      {error ? (
        <p className="mt-3 text-sm font-semibold leading-6 text-red-300">{error}</p>
      ) : null}
    </>
  );
}
