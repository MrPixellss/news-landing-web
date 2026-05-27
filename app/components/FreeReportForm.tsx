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

  useEffect(() => {
    trackProductEvent("free_report_view", {
      topic_slug: topicSlug,
      source_path: currentSourcePath(sourcePath),
    });
  }, [sourcePath, topicSlug]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    const activeSourcePath = currentSourcePath(sourcePath);

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
        }),
      });
      const payload = (await response.json().catch(() => ({}))) as {
        status?: string;
        already_sent?: boolean;
        message?: string;
        error?: string;
      };

      if (!response.ok) {
        setStatus("error");
        setMessage(payload.error || "Rapporten kunde inte skickas just nu.");
        trackProductEvent("free_report_submit_error", {
          reason: payload.error || "backend_error",
          topic_slug: topicSlug,
          source_path: activeSourcePath,
        });
        return;
      }

      if (payload.already_sent || payload.status === "already_sent") {
        setStatus("already");
        setMessage(payload.message || "Gratisrapporten har redan skickats till den här e-postadressen.");
        trackProductEvent("free_report_submit_success", {
          result: "already_sent",
          topic_slug: topicSlug,
          source_path: activeSourcePath,
        });
        return;
      }

      setStatus("sent");
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
      trackProductEvent("free_report_submit_error", {
        reason: "network_error",
        topic_slug: topicSlug,
        source_path: activeSourcePath,
      });
    }
  }

  if (status === "sent") {
    return (
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
          Den innehåller dagens samlade marknadsbild och analyser inom 10 områden.
        </p>
        <ul className="mt-4 grid gap-2 text-sm leading-6 text-[#a8b5c4]">
          {[
            "Dagens huvudbild",
            "10 analysområden",
            "Kort sammanfattning per område",
            "Tillgång till full rapport via länk",
          ].map((item) => (
            <li key={item} className="border-l-2 border-emerald-300/70 pl-3">
              {item}
            </li>
          ))}
        </ul>
        <div className="mt-5 grid gap-3">
          <CheckoutButton
            buttonClassName="w-full bg-emerald-300 px-5 py-4 text-sm font-black text-[#04100b] transition hover:bg-emerald-200 disabled:cursor-wait disabled:opacity-70"
            buttonLabel="Läs dagens fullständiga analys - 49 kr"
            onOpen={() =>
              trackProductEvent("day_pass_click_from_thank_you", {
                topic_slug: topicSlug,
                source_path: currentSourcePath(sourcePath),
              })
            }
            priceLabel="49 kr"
            topicSlug={topicSlug}
          />
          <Link
            className="border border-[#26313d] px-5 py-4 text-center text-sm font-black text-[#d7e1eb] transition hover:border-emerald-300 hover:text-emerald-300"
            href="/#pricing"
            onClick={() =>
              trackProductEvent("monthly_click_from_thank_you", {
                topic_slug: topicSlug,
                source_path: currentSourcePath(sourcePath),
              })
            }
          >
            Se månadsaccess
          </Link>
        </div>
      </div>
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
