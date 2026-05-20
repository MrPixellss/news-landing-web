"use client";

import Link from "next/link";
import { useState } from "react";

type CheckoutButtonProps = {
  topicSlug: string;
  priceLabel: string;
  productName?: string;
  buttonLabel?: string;
  description?: string;
  checkoutPath?: string;
  buttonClassName?: string;
};

function displayPrice(priceLabel: string) {
  return priceLabel || "49 kr";
}

export function CheckoutButton({
  topicSlug,
  priceLabel,
  productName = "Dagspass",
  buttonLabel,
  description = "Du får dagens fullständiga briefing med alla 10 marknadsrapporter levererad via e-post.",
  checkoutPath = "/api/checkout",
  buttonClassName = "mt-5 w-full bg-emerald-300 px-5 py-4 text-sm font-black text-[#04100b] transition hover:bg-emerald-200 disabled:cursor-wait disabled:opacity-70",
}: CheckoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState("");
  const [acceptedPurchaseConsent, setAcceptedPurchaseConsent] = useState(false);
  const [marketingOptIn, setMarketingOptIn] = useState(false);

  const canCheckout = acceptedPurchaseConsent;
  const visibleButtonLabel =
    buttonLabel || `Köp dagspass - ${displayPrice(priceLabel)}`;

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
      const response = await fetch(checkoutPath, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topicSlug,
          marketingOptIn,
          returnPath: window.location.pathname + window.location.search,
        }),
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
        className={buttonClassName}
        disabled={isLoading}
        onClick={openModal}
        type="button"
      >
        {visibleButtonLabel}
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
                  {productName}
                </p>
                <h2 className="mt-2 text-2xl font-bold tracking-[-0.02em]">
                  Bekräfta köp - {displayPrice(priceLabel)}
                </h2>
                <p className="mt-3 text-sm leading-6 text-[#a8b5c4]">
                  {description}
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

            <div className="mt-6 space-y-5">
              <div>
                <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.24em] text-[#7f91a7]">
                  Krävs för köp
                </p>
                <label className="flex gap-3 text-sm leading-6 text-[#d7e1eb]">
                  <input
                    checked={acceptedPurchaseConsent}
                    className="mt-1 size-4 shrink-0 accent-emerald-300"
                    onChange={(event) => setAcceptedPurchaseConsent(event.target.checked)}
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
                    , inklusive omedelbar leverans av digitalt innehåll via
                    e-post och att ångerrätten går förlorad när leveransen har
                    påbörjats.
                  </span>
                </label>
              </div>

              <div>
                <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.24em] text-[#7f91a7]">
                  Valfritt
                </p>
                <label className="flex gap-3 text-sm leading-6 text-[#9facbb]">
                  <input
                    checked={marketingOptIn}
                    className="mt-1 size-4 shrink-0 accent-emerald-300"
                    onChange={(event) => setMarketingOptIn(event.target.checked)}
                    type="checkbox"
                  />
                  <span>
                    Jag vill få produktnyheter, erbjudanden och marknadsföring
                    via e-post. Jag kan avregistrera mig när som helst.
                  </span>
                </label>
              </div>
            </div>

            <p className="mt-5 border border-[#26313d] bg-[#0b0f14] p-3 text-xs leading-5 text-[#a8b5c4]">
              Finansanalytik är AI-stödd nyhetsanalys för informationsändamål.
              Det är inte investeringsrådgivning eller en rekommendation att
              köpa eller sälja tillgångar. Betalning hanteras av TVP Byrå.
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
