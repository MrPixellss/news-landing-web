"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  metaTrackingContext,
  trackPaidIntentEvent,
  trackMetaEvent,
  trackProductEvent,
} from "../lib/tracking";

type CheckoutButtonProps = {
  topicSlug: string;
  priceLabel: string;
  product?: "day_pass" | "monthly_access" | "half_year_access" | "monthly_intro_week";
  productName?: string;
  buttonLabel?: string;
  description?: string;
  checkoutPath?: string;
  buttonClassName?: string;
  offerToken?: string;
  onOpen?: () => void;
  trackingPlacement?: string;
  externalOpenEventName?: string;
};

type CheckoutOpenEventDetail = {
  placement?: string;
  properties?: Record<string, unknown>;
};

const TAX_COUNTRIES = [
  ["SE", "Sverige"],
  ["NO", "Norge"],
  ["DK", "Danmark"],
  ["FI", "Finland"],
  ["DE", "Tyskland"],
  ["NL", "Nederländerna"],
  ["BE", "Belgien"],
  ["BG", "Bulgarien"],
  ["CY", "Cypern"],
  ["FR", "Frankrike"],
  ["GR", "Grekland"],
  ["HR", "Kroatien"],
  ["HU", "Ungern"],
  ["ES", "Spanien"],
  ["IT", "Italien"],
  ["CZ", "Tjeckien"],
  ["SK", "Slovakien"],
  ["SI", "Slovenien"],
  ["PL", "Polen"],
  ["AT", "Österrike"],
  ["IE", "Irland"],
  ["PT", "Portugal"],
  ["RO", "Rumänien"],
  ["LU", "Luxemburg"],
  ["MT", "Malta"],
  ["EE", "Estland"],
  ["LV", "Lettland"],
  ["LT", "Litauen"],
  ["IS", "Island"],
  ["LI", "Liechtenstein"],
  ["GB", "Storbritannien"],
  ["CH", "Schweiz"],
  ["US", "USA"],
  ["CA", "Kanada"],
] as const;

const TAX_COUNTRY_CODES = new Set<string>(TAX_COUNTRIES.map(([code]) => code));

function displayPrice(priceLabel: string) {
  return priceLabel || "49 kr";
}

export function CheckoutButton({
  topicSlug,
  priceLabel,
  product = "day_pass",
  productName = "Dagspass",
  buttonLabel,
  description = "Du får dagens fullständiga briefing med alla 10 marknadsrapporter levererad via e-post.",
  checkoutPath = "/api/checkout",
  buttonClassName = "mt-5 w-full bg-emerald-300 px-5 py-4 text-sm font-black text-[#04100b] transition hover:bg-emerald-200 disabled:cursor-wait disabled:opacity-70",
  offerToken,
  onOpen,
  trackingPlacement = "checkout_button",
  externalOpenEventName,
}: CheckoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState("");
  const [customerEmail, setCustomerEmail] = useState(() => {
    if (typeof window === "undefined") {
      return "";
    }
    try {
      return window.localStorage.getItem("finansanalytik_checkout_email") || "";
    } catch {
      return "";
    }
  });
  const [showCustomerEmailError, setShowCustomerEmailError] = useState(false);
  const [acceptedPurchaseConsent, setAcceptedPurchaseConsent] = useState(false);
  const [showPurchaseConsentError, setShowPurchaseConsentError] = useState(false);
  const [marketingOptIn, setMarketingOptIn] = useState(false);
  const [customerCountry, setCustomerCountry] = useState("SE");
  const [billingPostalCode, setBillingPostalCode] = useState("");
  const [activeTrackingPlacement, setActiveTrackingPlacement] =
    useState(trackingPlacement);

  const canCheckout = acceptedPurchaseConsent;
  const priceWithTax = `${displayPrice(priceLabel)}, moms ingår`;
  const introWeekSummary =
    product === "monthly_intro_week"
      ? "7 dagar för 9,99 kr. Därefter 249 kr/mån tills du avslutar."
      : "";
  const usesOfferToken = Boolean(offerToken);
  const visibleButtonLabel =
    buttonLabel || `Köp dagspass - ${displayPrice(priceLabel)}`;
  const normalizedCustomerEmail = customerEmail.trim().toLowerCase();
  const isCustomerEmailValid =
    usesOfferToken ||
    /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(
      normalizedCustomerEmail,
    );

  const trackingPayload = useCallback(() => {
    return {
      product,
      productName,
      priceLabel,
      topicSlug,
      sourcePath:
        typeof window === "undefined"
          ? ""
          : window.location.pathname + window.location.search + window.location.hash,
    };
  }, [priceLabel, product, productName, topicSlug]);

  const trackPaidCheckoutEvent = useCallback((eventName: string, properties: Record<string, unknown> = {}) => {
    trackPaidIntentEvent(eventName, {
      ...trackingPayload(),
      ...properties,
    });
  }, [trackingPayload]);

  useEffect(() => {
    let isMounted = true;

    async function loadCountry() {
      try {
        const response = await fetch("/api/geo-country", { cache: "no-store" });
        const payload = (await response.json()) as { country?: string };
        const country = payload.country?.trim().toUpperCase();
        if (isMounted && country && TAX_COUNTRY_CODES.has(country)) {
          setCustomerCountry(country);
        }
      } catch {
        // Sweden is the primary market and remains the safe fallback.
      }
    }

    loadCountry();
    return () => {
      isMounted = false;
    };
  }, []);

  const openModal = useCallback((placementOverride?: string, properties: Record<string, unknown> = {}) => {
    const placement = placementOverride?.trim() || trackingPlacement;
    setActiveTrackingPlacement(placement);
    onOpen?.();
    setError("");
    setShowCustomerEmailError(false);
    setShowPurchaseConsentError(false);
    setIsModalOpen(true);
    trackProductEvent("checkout_open", {
      ...trackingPayload(),
      placement,
    });
    trackPaidCheckoutEvent("paid_cta_click", {
      ...properties,
      placement,
      uses_offer_token: usesOfferToken,
    });
    trackPaidCheckoutEvent("checkout_modal_open", {
      ...properties,
      placement,
      uses_offer_token: usesOfferToken,
    });
    if (usesOfferToken && product === "monthly_intro_week" && offerToken) {
      fetch("/api/free-report-funnel-event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: offerToken,
          eventName: "intro_offer_clicked",
          product,
          sourcePath: window.location.pathname + window.location.search + window.location.hash,
          metadata: { placement: "checkout_button_modal_open" },
        }),
      }).catch(() => {
        // Tracking must not block the checkout modal.
      });
    }
  }, [
    offerToken,
    onOpen,
    product,
    trackingPayload,
    trackingPlacement,
    trackPaidCheckoutEvent,
    usesOfferToken,
  ]);

  useEffect(() => {
    if (!externalOpenEventName) {
      return;
    }

    function handleExternalOpen(event: Event) {
      const detail = (event as CustomEvent<CheckoutOpenEventDetail>).detail;
      openModal(detail?.placement, detail?.properties || {});
    }

    window.addEventListener(externalOpenEventName, handleExternalOpen);
    return () => window.removeEventListener(externalOpenEventName, handleExternalOpen);
  }, [externalOpenEventName, openModal]);

  async function startCheckout() {
    if (isLoading) {
      return;
    }

    const placement = activeTrackingPlacement || trackingPlacement;
    trackPaidCheckoutEvent("checkout_submit_attempt", {
      placement,
      email_present: usesOfferToken || Boolean(normalizedCustomerEmail),
      email_valid: isCustomerEmailValid,
      purchase_consent: canCheckout,
      marketing_opt_in: marketingOptIn,
      customer_country: customerCountry,
      postal_code_present: Boolean(billingPostalCode.trim()),
      uses_offer_token: usesOfferToken,
    });

    if (!usesOfferToken && !isCustomerEmailValid) {
      setShowCustomerEmailError(true);
      setError("Ange en giltig e-postadress för leverans.");
      trackProductEvent("checkout_error", {
        ...trackingPayload(),
        placement,
        reason: "invalid_email",
      });
      trackPaidCheckoutEvent("checkout_submit_blocked", {
        placement,
        reason: "invalid_email",
        email_present: Boolean(normalizedCustomerEmail),
        email_valid: false,
      });
      return;
    }

    if (!canCheckout) {
      setShowPurchaseConsentError(true);
      setError("Du behöver godkänna de obligatoriska villkoren före betalning.");
      trackProductEvent("checkout_error", {
        ...trackingPayload(),
        placement,
        reason: "missing_purchase_consent",
      });
      trackPaidCheckoutEvent("checkout_submit_blocked", {
        placement,
        reason: "missing_purchase_consent",
        email_present: usesOfferToken || Boolean(normalizedCustomerEmail),
        email_valid: isCustomerEmailValid,
        purchase_consent: false,
      });
      return;
    }

    setIsLoading(true);
    setError("");
    const tracking = metaTrackingContext("InitiateCheckout");

    try {
      const response = await fetch(checkoutPath, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topicSlug,
          product,
          offerToken,
          marketingOptIn,
          customerEmail: usesOfferToken ? undefined : normalizedCustomerEmail,
          customerCountry,
          billingPostalCode: billingPostalCode.trim(),
          returnPath: window.location.pathname + window.location.search,
          ...tracking,
        }),
      });
      const payload = (await response.json()) as {
        checkout_url?: string;
        session_id?: string;
        error?: string;
      };

      if (!response.ok || !payload.checkout_url) {
        throw new Error(payload.error || "Betalningen kunde inte startas.");
      }

      if (!usesOfferToken) {
        try {
          window.localStorage.setItem(
            "finansanalytik_checkout_email",
            normalizedCustomerEmail,
          );
        } catch {
          // Do not block checkout if persistence is unavailable.
        }
      }

      trackMetaEvent("InitiateCheckout", {
        email: usesOfferToken ? undefined : normalizedCustomerEmail,
        eventSourceUrl: window.location.href,
        eventId: tracking.trackingEventId,
        currency: "SEK",
      });

      trackProductEvent("stripe_redirect", {
        ...trackingPayload(),
        placement,
        checkoutUrlCreated: true,
      });
      trackPaidCheckoutEvent("stripe_redirect", {
        placement,
        checkout_url_created: true,
        stripe_session_id: payload.session_id,
        uses_offer_token: usesOfferToken,
      });
      window.location.href = payload.checkout_url;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Betalningen kunde inte startas.";
      setError(message);
      trackProductEvent("checkout_error", {
        ...trackingPayload(),
        placement,
        reason: "backend_or_stripe_error",
        message,
      });
      trackPaidCheckoutEvent("checkout_error", {
        placement,
        reason: "backend_or_stripe_error",
        message,
        uses_offer_token: usesOfferToken,
      });
      setIsLoading(false);
    }
  }

  return (
    <>
      <button
        className={buttonClassName}
        disabled={isLoading}
        onClick={() => openModal()}
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
                <p className="mt-2 text-sm font-bold text-emerald-300">
                  {priceWithTax}
                </p>
                {introWeekSummary ? (
                  <p className="mt-2 text-sm font-bold leading-6 text-[#d7e1eb]">
                    {introWeekSummary}
                  </p>
                ) : null}
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
              {usesOfferToken ? (
                <div className="border border-[#26313d] bg-[#0b0f14] p-4">
                  <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#7f91a7]">
                    E-post
                  </p>
                  <p className="mt-2 text-sm leading-6 text-[#d7e1eb]">
                    Vi använder e-postadressen från din gratisrapport för Stripe
                    och rapportleverans.
                  </p>
                </div>
              ) : (
                <div
                  className={
                    showCustomerEmailError
                      ? "border border-red-300/70 bg-red-950/20 p-4"
                      : ""
                  }
                >
                  <label className="block text-sm font-bold text-[#d7e1eb]">
                    E-post för leverans
                    <input
                      autoComplete="email"
                      className={`mt-2 w-full border bg-[#0b0f14] px-3 py-3 text-sm text-[#d7e1eb] outline-none placeholder:text-[#596678] focus:border-emerald-300 ${
                        showCustomerEmailError
                          ? "border-red-300"
                          : "border-[#26313d]"
                      }`}
                      onChange={(event) => {
                        setCustomerEmail(event.target.value);
                        if (showCustomerEmailError) {
                          setShowCustomerEmailError(false);
                          setError("");
                        }
                      }}
                      onFocus={() =>
                        trackPaidCheckoutEvent("checkout_email_focus", {
                          placement: activeTrackingPlacement || trackingPlacement,
                          email_present: Boolean(normalizedCustomerEmail),
                          uses_offer_token: false,
                        })
                      }
                      placeholder="namn@exempel.se"
                      type="email"
                      value={customerEmail}
                    />
                    <span className="mt-2 block text-xs font-normal leading-5 text-[#8d9aaa]">
                      Vi använder samma e-post hos Stripe och för rapportleverans.
                    </span>
                  </label>
                  {showCustomerEmailError ? (
                    <p className="mt-3 text-sm font-bold leading-6 text-red-300">
                      Ange en giltig e-postadress för att fortsätta.
                    </p>
                  ) : null}
                </div>
              )}

              <div
                className={
                  showPurchaseConsentError
                    ? "border border-red-300/70 bg-red-950/20 p-4"
                    : ""
                }
              >
                <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.24em] text-[#7f91a7]">
                  Krävs för köp
                </p>
                <label className="flex gap-3 text-sm leading-6 text-[#d7e1eb]">
                  <input
                    checked={acceptedPurchaseConsent}
                    className={`mt-1 size-4 shrink-0 accent-emerald-300 ${
                      showPurchaseConsentError ? "outline outline-2 outline-red-300" : ""
                    }`}
                    onChange={(event) => {
                      setAcceptedPurchaseConsent(event.target.checked);
                      if (event.target.checked) {
                        setShowPurchaseConsentError(false);
                        setError("");
                      }
                    }}
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
                {showPurchaseConsentError ? (
                  <p className="mt-3 text-sm font-bold leading-6 text-red-300">
                    Markera rutan för att fortsätta till betalning.
                  </p>
                ) : null}
              </div>

              <details className="border border-[#26313d] bg-[#0b0f14] p-4">
                <summary className="cursor-pointer text-sm font-bold text-[#d7e1eb]">
                  Faktureringsuppgifter vid behov
                </summary>
                <p className="mt-3 text-xs leading-5 text-[#8d9aaa]">
                  Land används för moms. Postnummer är valfritt här; Stripe kan
                  fylla i eller fråga vid betalning om det behövs.
                </p>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <label className="block text-sm font-bold text-[#d7e1eb]">
                    Land
                    <select
                      className="mt-2 w-full border border-[#26313d] bg-[#07090b] px-3 py-3 text-sm text-[#d7e1eb] outline-none focus:border-emerald-300"
                      onChange={(event) => setCustomerCountry(event.target.value)}
                      value={customerCountry}
                    >
                      {TAX_COUNTRIES.map(([code, name]) => (
                        <option key={code} value={code}>
                          {name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="block text-sm font-bold text-[#d7e1eb]">
                    Faktureringspostnummer
                    <input
                      className="mt-2 w-full border border-[#26313d] bg-[#07090b] px-3 py-3 text-sm text-[#d7e1eb] outline-none placeholder:text-[#596678] focus:border-emerald-300"
                      maxLength={24}
                      onChange={(event) => setBillingPostalCode(event.target.value)}
                      placeholder="Valfritt"
                      type="text"
                      value={billingPostalCode}
                    />
                  </label>
                </div>
              </details>

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
              Priset visas i SEK och moms ingår.
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-[1fr_auto]">
              <button
                className="bg-emerald-300 px-5 py-4 text-sm font-black text-[#04100b] transition hover:bg-emerald-200 disabled:cursor-wait disabled:opacity-70"
                disabled={isLoading}
                onClick={startCheckout}
                type="button"
              >
                {isLoading ? "Skickar till Stripe..." : "Fortsätt till Stripe för betalning"}
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
              <p aria-live="polite" className="mt-3 text-sm font-semibold leading-6 text-red-300">
                {error}
              </p>
            ) : null}
          </div>
        </div>
      ) : null}
    </>
  );
}
