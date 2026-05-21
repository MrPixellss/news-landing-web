"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

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

export function FreeReportForm({
  topicSlug = "macro",
  sourcePath = "/",
  compact = false,
}: FreeReportFormProps) {
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "already" | "error">("idle");
  const [message, setMessage] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleanEmail = email.trim().toLowerCase();

    if (!validEmail(cleanEmail)) {
      setStatus("error");
      setMessage("Ange en giltig e-postadress.");
      return;
    }

    if (!consent) {
      setStatus("error");
      setMessage("Du behöver godkänna e-postsamtycket för att få gratisrapporten.");
      return;
    }

    setStatus("loading");
    setMessage("");

    try {
      const response = await fetch("/api/free-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: cleanEmail,
          consentAccepted: consent,
          consentText,
          consentVersion,
          sourcePath,
          topicSlug,
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
        return;
      }

      if (payload.already_sent || payload.status === "already_sent") {
        setStatus("already");
        setMessage(payload.message || "Gratisrapporten har redan skickats till den här e-postadressen.");
        return;
      }

      setStatus("sent");
      setMessage(payload.message || "Rapporten har skickats till din e-postadress.");
    } catch {
      setStatus("error");
      setMessage("Rapporten kunde inte skickas just nu.");
    }
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
