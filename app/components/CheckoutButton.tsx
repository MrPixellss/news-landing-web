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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedImmediateDelivery, setAcceptedImmediateDelivery] = useState(false);
  const [acceptedEmailDelivery, setAcceptedEmailDelivery] = useState(false);
  const [marketingOptIn, setMarketingOptIn] = useState(false);

  const canCheckout =
    acceptedTerms && acceptedImmediateDelivery && acceptedEmailDelivery;

  function openModal() {
    setError("");
    setIsModalOpen(true);
  }

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
    <>
      <button
        className="mt-5 w-full bg-emerald-300 px-5 py-4 text-sm font-black text-[#04100b] transition hover:bg-emerald-200 disabled:cursor-wait disabled:opacity-70"
        disabled={isLoading}
        onClick={openModal}
        type="button"
      >
        Köp dagspass - {displayPrice(priceLabel)}
      </button>

      {isModalOpen ? (
        <div
          aria-modal="true"
          className="fixed inset-0 z-[70] grid place-items-end bg-black/70 p-3 sm:place-items-center"
          role="dialog"
        >
          <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto border border-[#26313d] bg-[#07090b] p-5 text-left text-zinc-50 shadow-2xl sm:p-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.26em] text-[#7f91a7]">
                  Dagspass
                </p>
                <h2 className="mt-2 text-2xl font-bold tracking-[-0.02em]">
                  Bekräfta köp - {displayPrice(priceLabel)}
                </h2>
                <p className="mt-3 text-sm leading-6 text-[#a8b5c4]">
                  Du får dagens fullständiga briefing med alla 10
                  marknadsrapporter levererad via e-post.
                </p>
              </div>
              <button
                className="border border-[#26313d] px-3 py-2 text-sm font-bold hover:border-emerald-300"
                onClick={() => setIsModalOpen(false)}
                type="button"
              >
                Stäng
              </button>
            </div>

            <div className="mt-6 space-y-3">
              <label className="flex gap-3 text-sm leading-6 text-[#d7e1eb]">
                <input
                  checked={acceptedTerms}
                  className="mt-1 size-4 shrink-0 accent-emerald-300"
                  onChange={(event) => setAcceptedTerms(event.target.checked)}
                  type="checkbox"
                />
                <span>
                  Jag godkänner{" "}
                  <Link
                    className="text-emerald-300 underline-offset-4 hover:underline"
                    href="/kopvillkor"
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    Köpvillkoren
                  </Link>{" "}
                  och{" "}
                  <Link
                    className="text-emerald-300 underline-offset-4 hover:underline"
                    href="/integritetspolicy"
                    rel="noopener noreferrer"
                    target="_blank"
                  >
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
                  Jag samtycker till att det digitala innehållet levereras
                  omedelbart efter köp och bekräftar att jag förlorar min
                  ångerrätt när leveransen har påbörjats.
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

            <p className="mt-5 border border-[#26313d] bg-[#0b0f14] p-3 text-xs leading-5 text-[#a8b5c4]">
              Finansanalytik är informations- och utbildningsmaterial baserat
              på AI-stödd analys av aktuella nyheter, offentliga källor och
              marknadssignaler. Det är inte investeringsrådgivning, finansiell
              rådgivning eller en rekommendation att köpa eller sälja
              tillgångar. Betalning och prenumeration hanteras av TVP Byrå.
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-[1fr_auto]">
              <button
                className="bg-emerald-300 px-5 py-4 text-sm font-black text-[#04100b] transition hover:bg-emerald-200 disabled:cursor-wait disabled:opacity-70"
                disabled={isLoading}
                onClick={startCheckout}
                type="button"
              >
                {isLoading ? "Skickar till Stripe..." : "Fortsätt till Stripe"}
              </button>
              <button
                className="border border-[#26313d] px-5 py-4 text-sm font-black text-[#d7e1eb] hover:border-emerald-300"
                disabled={isLoading}
                onClick={() => setIsModalOpen(false)}
                type="button"
              >
                Avbryt
              </button>
            </div>

            {error ? (
              <p className="mt-3 text-sm font-semibold leading-6 text-red-300">
                {error}
              </p>
            ) : null}
          </div>
        </div>
      ) : null}
    </>
  );
}
