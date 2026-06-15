"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { CheckoutButton } from "./CheckoutButton";
import {
  metaTrackingContext,
  trackGoogleAdsLeadConversion,
  trackMetaEvent,
  trackProductEvent,
} from "../lib/tracking";
import {
  isTurnstileEnabled,
  readTurnstileToken,
  resetTurnstile,
  TurnstileField,
} from "./TurnstileField";

type FreeReportFormProps = {
  topicSlug?: string;
  sourcePath?: string;
  compact?: boolean;
};

const consentText =
  "Jag samtycker till att få en gratis rapport och produktrelaterade e-postmeddelanden från Finansanalytik. Jag kan avregistrera mig när som helst.";
const consentVersion = "free-report-consent.v1";

function validEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function readUtmParams() {
  if (typeof window === "undefined") {
    return {};
  }

  const params = new URLSearchParams(window.location.search);
  return {
    utmSource: params.get("utm_source") || undefined,
    utmMedium: params.get("utm_medium") || undefined,
    utmCampaign: params.get("utm_campaign") || undefined,
    utmContent: params.get("utm_content") || undefined,
  };
}

function currentSourcePath(fallback: string) {
  if (typeof window === "undefined") {
    return fallback;
  }

  return window.location.pathname + window.location.search + window.location.hash;
}

export function FreeReportForm({
  topicSlug = "macro",
  sourcePath = "/",
  compact = false,
}: FreeReportFormProps) {
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "already" | "error">("idle");
  const [message, setMessage] = useState("");
  const [introOfferToken, setIntroOfferToken] = useState("");

  useEffect(() => {
    trackProductEvent("free_report_view", {
      topic_slug: topicSlug,
      source_path: currentSourcePath(sourcePath),
    });
  }, [sourcePath, topicSlug]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const cleanEmail = email.trim().toLowerCase();
    const activeSourcePath = currentSourcePath(sourcePath);
    const companyWebsite = String(formData.get("companyWebsite") || "").trim();
    const turnstileToken = readTurnstileToken(form);

    if (!validEmail(cleanEmail)) {
      setStatus("error");
      setMessage("Ange en giltig e-postadress.");
      trackProductEvent("free_report_submit_error", {
        reason: "invalid_email",
        topic_slug: topicSlug,
        source_path: activeSourcePath,
      });
      return;
    }

    if (!consent) {
      setStatus("error");
      setMessage("Du behöver godkänna e-postsamtycket för att få gratisrapporten.");
      trackProductEvent("free_report_submit_error", {
        reason: "missing_consent",
        topic_slug: topicSlug,
        source_path: activeSourcePath,
      });
      return;
    }

    if (isTurnstileEnabled() && !turnstileToken) {
      setStatus("error");
      setMessage("Bekräfta säkerhetskontrollen för att fortsätta.");
      trackProductEvent("free_report_submit_error", {
        reason: "missing_turnstile",
        topic_slug: topicSlug,
        source_path: activeSourcePath,
      });
      return;
    }

    setStatus("loading");
    setMessage("");
    const tracking = metaTrackingContext("Lead");
    const eventSourceUrl = window.location.href;

    try {
      const response = await fetch("/api/free-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: cleanEmail,
          consentAccepted: consent,
          consentText,
          consentVersion,
          sourcePath: activeSourcePath,
          topicSlug,
          ...readUtmParams(),
          ...tracking,
          eventSourceUrl,
          turnstileToken,
          companyWebsite,
        }),
      });
      const payload = (await response.json().catch(() => ({}))) as {
        status?: string;
        already_sent?: boolean;
        message?: string;
        error?: string;
        access_token?: string;
        intro_offer_url?: string;
      };

      if (!response.ok) {
        setStatus("error");
        setMessage(payload.error || "Rapporten kunde inte skickas just nu.");
        resetTurnstile();
        trackProductEvent("free_report_submit_error", {
          reason: payload.error || "backend_error",
          topic_slug: topicSlug,
          source_path: activeSourcePath,
        });
        return;
      }

      if (payload.already_sent || payload.status === "already_sent") {
        setIntroOfferToken(payload.access_token || "");
        setStatus("already");
        setMessage(payload.message || "Gratisrapporten har redan skickats till den här e-postadressen.");
        resetTurnstile();
        trackProductEvent("free_report_duplicate", {
          result: "blocked",
          topic_slug: topicSlug,
          source_path: activeSourcePath,
        });
        return;
      }

      if (payload.status === "unsubscribed") {
        setStatus("error");
        setMessage(
          payload.message ||
            "E-postadressen är avregistrerad. Kontakta support@tvp-byra.se om du vill aktivera utskick igen.",
        );
        resetTurnstile();
        trackProductEvent("free_report_submit_error", {
          reason: "unsubscribed",
          topic_slug: topicSlug,
          source_path: activeSourcePath,
        });
        return;
      }

      setStatus("sent");
      setIntroOfferToken(payload.access_token || "");
      setMessage(payload.message || "Rapporten har skickats till din e-postadress.");
      trackProductEvent("free_report_submit_success", {
        result: "sent",
        topic_slug: topicSlug,
        source_path: activeSourcePath,
      });
      trackProductEvent("thank_you_view", {
        topic_slug: topicSlug,
        source_path: activeSourcePath,
      });
      trackMetaEvent("Lead", {
        email: cleanEmail,
        eventSourceUrl,
        eventId: tracking.trackingEventId,
        skipServer: true,
      });
      trackGoogleAdsLeadConversion({
        eventId: tracking.trackingEventId,
      });
    } catch {
      setStatus("error");
      setMessage("Rapporten kunde inte skickas just nu.");
      resetTurnstile();
      trackProductEvent("free_report_submit_error", {
        reason: "network_error",
        topic_slug: topicSlug,
        source_path: activeSourcePath,
      });
    }
  }

  if (status === "already") {
    return (
      <div
        className={[
          "border border-amber-300/45 bg-[#0b0f14]",
          compact ? "p-4" : "p-5 md:p-6",
        ].join(" ")}
      >
        <p className="text-[11px] font-bold uppercase tracking-[0.26em] text-amber-200">
          Gratisrapport redan använd
        </p>
        <h3 className="mt-3 text-2xl font-bold tracking-[-0.02em]">
          Den här e-postadressen har redan fått gratisrapporten.
        </h3>
        <p className="mt-3 text-base leading-7 text-[#c7d1dd]">
          {message ||
            "Gratisrapporten kan bara skickas en gång per e-postadress. Du kan fortsätta med betald access nedan."}
        </p>
        <div className="mt-5 grid gap-3">
          <CheckoutButton
            buttonClassName="w-full bg-emerald-300 px-5 py-4 text-sm font-black text-[#04100b] transition hover:bg-emerald-200 disabled:cursor-wait disabled:opacity-70"
            buttonLabel={introOfferToken ? "Prova 7 dagar - 9,99 kr" : "Starta månadsaccess - 249 kr/mån"}
            checkoutPath={introOfferToken ? "/api/intro-week-checkout" : "/api/subscription-checkout"}
            description={
              introOfferToken
                ? "Du provar Månadsaccess i 7 dagar för 9,99 kr. Därefter fortsätter prenumerationen för 249 kr/mån tills du avslutar. Moms ingår."
                : "Du får dagliga fullständiga rapporter, veckosammanfattning och månadsutsikt via e-post under aktiv period."
            }
            offerToken={introOfferToken || undefined}
            onOpen={() =>
              trackProductEvent("free_report_duplicate_monthly_click", {
                topic_slug: topicSlug,
                source_path: currentSourcePath(sourcePath),
                placement: "free_report_duplicate",
              })
            }
            priceLabel={introOfferToken ? "9,99 kr" : "249 kr/mån"}
            product={introOfferToken ? "monthly_intro_week" : "monthly_access"}
            productName={introOfferToken ? "Månadsaccess provvecka" : "Månadsaccess"}
            topicSlug={topicSlug}
          />
          <CheckoutButton
            buttonClassName="w-full border border-[#26313d] px-5 py-3 text-sm font-black text-[#c7d1dd] transition hover:border-emerald-300 hover:text-emerald-300 disabled:cursor-wait disabled:opacity-70"
            buttonLabel="Läs bara dagens rapport - 49 kr"
            onOpen={() =>
              trackProductEvent("free_report_duplicate_daypass_click", {
                topic_slug: topicSlug,
                source_path: currentSourcePath(sourcePath),
                placement: "free_report_duplicate",
              })
            }
            priceLabel="49 kr"
            product="day_pass"
            productName="Dagsrapport"
            topicSlug={topicSlug}
          />
        </div>
      </div>
    );
  }

  if (status === "sent") {
    return (
      <>
        <div
          className={[
            "border border-emerald-300/50 bg-[#0b0f14]",
            compact ? "p-4" : "p-5 md:p-6",
          ].join(" ")}
        >
          <p className="text-[11px] font-bold uppercase tracking-[0.26em] text-emerald-300">
            Rapporten är skickad
          </p>
          <h3 className="mt-3 text-2xl font-bold tracking-[-0.02em]">
            Din kostnadsfria marknadsbrief har skickats till din e-post.
          </h3>
          <p className="mt-3 text-base leading-7 text-[#c7d1dd]">
            Den innehåller en öppen exempelanalys och previews för dagens övriga områden.
          </p>
          <ul className="mt-4 grid gap-2 text-sm leading-6 text-[#a8b5c4]">
            {[
              "Dagens huvudbild",
              "1 fullständig exempelanalys",
              "Preview av övriga analysområden",
              "Tydlig väg till hela briefen",
            ].map((item) => (
              <li key={item} className="border-l-2 border-emerald-300/70 pl-3">
                {item}
              </li>
            ))}
          </ul>
          <div className="mt-5 grid gap-3">
            <p className="text-sm leading-6 text-[#c7d1dd]">
              Vill du få hela marknadsbilden varje morgon? Prova Månadsaccess
              i 7 dagar för 9,99 kr. Därefter 249 kr/mån tills du avslutar.
            </p>
            <CheckoutButton
              buttonClassName="w-full bg-emerald-300 px-5 py-4 text-sm font-black text-[#04100b] transition hover:bg-emerald-200 disabled:cursor-wait disabled:opacity-70"
              buttonLabel={introOfferToken ? "Prova 7 dagar - 9,99 kr" : "Starta månadsaccess - 249 kr/mån"}
              checkoutPath={introOfferToken ? "/api/intro-week-checkout" : "/api/subscription-checkout"}
              description={
                introOfferToken
                  ? "Du provar Månadsaccess i 7 dagar för 9,99 kr. Därefter fortsätter prenumerationen för 249 kr/mån tills du avslutar. Moms ingår."
                  : "Du får dagliga fullständiga rapporter, veckosammanfattning och månadsutsikt via e-post under aktiv period."
              }
              offerToken={introOfferToken || undefined}
              onOpen={() =>
                trackProductEvent("thank_you_monthly_click", {
                  topic_slug: topicSlug,
                  source_path: currentSourcePath(sourcePath),
                  placement: "free_report_success",
                })
              }
              priceLabel={introOfferToken ? "9,99 kr" : "249 kr/mån"}
              product={introOfferToken ? "monthly_intro_week" : "monthly_access"}
              productName={introOfferToken ? "Månadsaccess provvecka" : "Månadsaccess"}
              topicSlug={topicSlug}
            />
            <CheckoutButton
              buttonClassName="w-full border border-[#26313d] px-5 py-3 text-sm font-black text-[#c7d1dd] transition hover:border-emerald-300 hover:text-emerald-300 disabled:cursor-wait disabled:opacity-70"
              buttonLabel="Läs bara dagens rapport - 49 kr"
              onOpen={() => {
                trackProductEvent("day_pass_click_from_thank_you", {
                  topic_slug: topicSlug,
                  source_path: currentSourcePath(sourcePath),
                });
                trackProductEvent("thank_you_daypass_click", {
                  topic_slug: topicSlug,
                  source_path: currentSourcePath(sourcePath),
                });
              }}
              priceLabel="49 kr"
              product="day_pass"
              productName="Dagsrapport"
              topicSlug={topicSlug}
            />
          </div>
        </div>
        <div className="h-24 md:hidden" />
        <div className="fixed inset-x-0 bottom-0 z-50 border-t border-emerald-300/50 bg-[#07090b]/98 p-4 shadow-[0_-18px_40px_rgba(0,0,0,0.55)] backdrop-blur md:hidden">
          <CheckoutButton
            buttonClassName="w-full bg-emerald-300 px-5 py-4 text-sm font-black text-[#04100b] transition hover:bg-emerald-200 disabled:cursor-wait disabled:opacity-70"
            buttonLabel={introOfferToken ? "Prova 7 dagar - 9,99 kr" : "Starta månadsaccess"}
            checkoutPath={introOfferToken ? "/api/intro-week-checkout" : "/api/subscription-checkout"}
            description={
              introOfferToken
                ? "Du provar Månadsaccess i 7 dagar för 9,99 kr. Därefter fortsätter prenumerationen för 249 kr/mån tills du avslutar. Moms ingår."
                : "Du får dagliga fullständiga rapporter, veckosammanfattning och månadsutsikt via e-post under aktiv period."
            }
            offerToken={introOfferToken || undefined}
            onOpen={() =>
              trackProductEvent("thank_you_monthly_click", {
                topic_slug: topicSlug,
                source_path: currentSourcePath(sourcePath),
                placement: "mobile_sticky",
              })
            }
            priceLabel={introOfferToken ? "9,99 kr" : "249 kr/mån"}
            product={introOfferToken ? "monthly_intro_week" : "monthly_access"}
            productName={introOfferToken ? "Månadsaccess provvecka" : "Månadsaccess"}
            topicSlug={topicSlug}
          />
        </div>
      </>
    );
  }

  return (
    <form
      className={[
        "border border-[#26313d] bg-[#0b0f14]",
        compact ? "p-4" : "p-5 md:p-6",
      ].join(" ")}
      onSubmit={submit}
    >
      <div className={compact ? "grid gap-3" : "grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]"}>
        <input
          aria-hidden="true"
          autoComplete="off"
          className="hidden"
          name="companyWebsite"
          tabIndex={-1}
          type="text"
        />
        <label className="sr-only" htmlFor={`free-report-email-${topicSlug}`}>
          E-postadress
        </label>
        <input
          id={`free-report-email-${topicSlug}`}
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="din@email.se"
          className="min-h-12 border border-[#26313d] bg-[#07090b] px-4 text-base font-bold text-white outline-none transition placeholder:text-[#657489] focus:border-emerald-300"
          autoComplete="email"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="min-h-12 bg-emerald-300 px-5 text-sm font-black text-[#06100c] transition hover:bg-emerald-200 disabled:cursor-wait disabled:opacity-70"
        >
          {status === "loading" ? "Skickar..." : "Få gratisrapport"}
        </button>
      </div>

      <label className="mt-4 grid cursor-pointer grid-cols-[20px_minmax(0,1fr)] gap-3 text-sm leading-6 text-[#a8b5c4]">
        <input
          type="checkbox"
          checked={consent}
          onChange={(event) => setConsent(event.target.checked)}
          className="mt-1 size-4 accent-emerald-300"
        />
        <span>
          {consentText} Läs vår{" "}
          <Link className="text-emerald-300 hover:text-emerald-200" href="/integritetspolicy">
            integritetspolicy
          </Link>
          .
        </span>
      </label>

      <TurnstileField compact={compact} />

      {message ? (
        <p
          aria-live="polite"
          className={[
            "mt-4 border px-4 py-3 text-sm font-bold leading-6",
            status === "error"
              ? "border-red-300/50 bg-red-950/20 text-red-200"
              : "border-emerald-300/50 bg-emerald-950/20 text-emerald-200",
          ].join(" ")}
        >
          {message}
        </p>
      ) : null}
    </form>
  );
}
