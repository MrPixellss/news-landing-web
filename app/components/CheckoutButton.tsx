"use client";

import Link from "next/link";
import { useState } from "react";

type CheckoutButtonProps = {
  topicSlug: string;
  priceLabel: string;
};

function displayPrice(priceLabel: string) {
  return priceLabel || "49 kr";
}

export function CheckoutButton({ topicSlug, priceLabel }: CheckoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedImmediateDelivery, setAcceptedImmediateDelivery] = useState(false);
  const [acceptedEmailDelivery, setAcceptedEmailDelivery] = useState(false);
  const [marketingOptIn, setMarketingOptIn] = useState(false);

  const canCheckout =
    acceptedTerms && acceptedImmediateDelivery && acceptedEmailDelivery;

  async function startCheckout() {
    if (isLoading) {
      return;
    }

    if (!canCheckout) {
      setError("Du behöver godkänna de obligatoriska villkoren före betalning.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topicSlug, marketingOptIn }),
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
    <div className="mt-4 text-left">
      <div className="space-y-3">
        <label className="flex gap-3 text-sm leading-6 text-[#d7e1eb]">
          <input
            checked={acceptedTerms}
            className="mt-1 size-4 shrink-0 accent-emerald-300"
            onChange={(event) => setAcceptedTerms(event.target.checked)}
            type="checkbox"
          />
          <span>
            Jag godkänner{" "}
            <Link className="text-emerald-300 underline-offset-4 hover:underline" href="/kopvillkor">
              Köpvillkoren
            </Link>{" "}
            och{" "}
            <Link className="text-emerald-300 underline-offset-4 hover:underline" href="/integritetspolicy">
              Integritetspolicyn
            </Link>
            .
          </span>
        </label>

        <label className="flex gap-3 text-sm leading-6 text-[#d7e1eb]">
          <input
            checked={acceptedImmediateDelivery}
            className="mt-1 size-4 shrink-0 accent-emerald-300"
            onChange={(event) => setAcceptedImmediateDelivery(event.target.checked)}
            type="checkbox"
          />
          <span>
            Jag samtycker till att det digitala innehållet levereras omedelbart
            efter köp och bekräftar att jag förlorar min ångerrätt när
            leveransen har påbörjats.
          </span>
        </label>

        <label className="flex gap-3 text-sm leading-6 text-[#d7e1eb]">
          <input
            checked={acceptedEmailDelivery}
            className="mt-1 size-4 shrink-0 accent-emerald-300"
            onChange={(event) => setAcceptedEmailDelivery(event.target.checked)}
            type="checkbox"
          />
          <span>
            Jag samtycker till att få den köpta rapporten skickad till min
            e-postadress.
          </span>
        </label>

        <label className="flex gap-3 text-sm leading-6 text-[#9facbb]">
          <input
            checked={marketingOptIn}
            className="mt-1 size-4 shrink-0 accent-emerald-300"
            onChange={(event) => setMarketingOptIn(event.target.checked)}
            type="checkbox"
          />
          <span>
            Jag vill få produktnyheter och erbjudanden via e-post. Jag kan
            avregistrera mig när som helst.
          </span>
        </label>
      </div>

      <p className="mt-4 border border-[#26313d] bg-[#0b0f14] p-3 text-xs leading-5 text-[#a8b5c4]">
        Finansanalytik är informations- och utbildningsmaterial baserat på
        AI-stödd analys av aktuella nyheter, offentliga källor och
        marknadssignaler. Det är inte investeringsrådgivning, finansiell
        rådgivning eller en rekommendation att köpa eller sälja tillgångar.
        Betalning och prenumeration hanteras av TVP Byrå.
      </p>

      <button
        className="mt-4 w-full bg-emerald-300 px-5 py-4 text-sm font-black text-[#04100b] transition hover:bg-emerald-200 disabled:cursor-wait disabled:opacity-70"
        disabled={isLoading}
        onClick={startCheckout}
        type="button"
      >
        {isLoading ? "Skickar till Stripe..." : `Köp dagspass - ${displayPrice(priceLabel)}`}
      </button>
      {error ? (
        <p className="mt-3 text-sm font-semibold leading-6 text-red-300">{error}</p>
      ) : null}
    </div>
  );
}
