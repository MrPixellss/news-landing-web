"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";

type SubscriptionPayload = {
  product_name: string;
  plan_name: string;
  plan: string;
  status: string;
  cancel_at_period_end: boolean;
  current_period_start?: string | null;
  current_period_end?: string | null;
  next_renewal_date?: string | null;
  access_until?: string | null;
  is_recurring: boolean;
  can_cancel: boolean;
  support_email: string;
};

type ManagementResponse = {
  subscription: SubscriptionPayload;
  confirmation_email_sent?: boolean;
};

function formatDate(value?: string | null) {
  if (!value) {
    return "Ej tillgängligt";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value.slice(0, 10);
  }

  return new Intl.DateTimeFormat("sv-SE", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

function statusLabel(subscription: SubscriptionPayload) {
  if (subscription.cancel_at_period_end) {
    return "Avslutas vid periodens slut";
  }
  if (subscription.status === "active") {
    return "Aktiv";
  }
  if (subscription.status === "trialing") {
    return "Prova-på-period";
  }
  if (subscription.status === "past_due") {
    return "Betalning kräver åtgärd";
  }
  if (subscription.status === "canceled") {
    return "Avslutad";
  }

  return subscription.status || "Okänd";
}

export default function SubscriptionManagementClient({ token }: { token: string }) {
  const [data, setData] = useState<ManagementResponse | null>(null);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [requestMessage, setRequestMessage] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(Boolean(token));
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!token) {
      return;
    }

    let alive = true;

    fetch(`/api/subscription-management?token=${encodeURIComponent(token)}`, {
      cache: "no-store",
    })
      .then(async (response) => {
        const payload = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(payload.error || "Prenumerationslänken kunde inte öppnas.");
        }
        return payload as ManagementResponse;
      })
      .then((payload) => {
        if (alive) {
          setData(payload);
        }
      })
      .catch((cause) => {
        if (alive) {
          setError(cause instanceof Error ? cause.message : "Länken kunde inte öppnas.");
        }
      })
      .finally(() => {
        if (alive) {
          setLoading(false);
        }
      });

    return () => {
      alive = false;
    };
  }, [token]);

  const subscription = data?.subscription;
  const accessUntil = useMemo(
    () => formatDate(subscription?.access_until || subscription?.current_period_end),
    [subscription?.access_until, subscription?.current_period_end],
  );
  const nextRenewal = useMemo(
    () => formatDate(subscription?.next_renewal_date),
    [subscription?.next_renewal_date],
  );

  async function requestLink(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setRequestMessage("");
    setError("");

    try {
      const response = await fetch("/api/subscription-management", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "request_link", email }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload.error || "Länken kunde inte skickas.");
      }
      setRequestMessage(
        payload.message ||
          "Om en aktiv prenumeration finns för den angivna e-postadressen skickar vi en säker länk.",
      );
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Länken kunde inte skickas.");
    } finally {
      setSubmitting(false);
    }
  }

  async function cancelSubscription() {
    setSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/subscription-management", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "cancel", token }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload.error || "Prenumerationen kunde inte avslutas.");
      }
      setData(payload as ManagementResponse);
      setConfirming(false);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Prenumerationen kunde inte avslutas.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#07090b] text-zinc-50">
      <div className="mx-auto max-w-4xl px-5 py-8 sm:px-6 lg:px-8">
        <header className="border-b border-[#1a222c] pb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-3 transition hover:text-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-300/70"
            aria-label="Till startsidan"
          >
            <span className="grid size-10 place-items-center bg-emerald-300 text-sm font-black text-[#06100c]">
              F
            </span>
            <span>
              <span className="block text-lg font-bold leading-tight">Finansanalytik</span>
              <span className="mt-1 block text-[11px] font-bold uppercase tracking-[0.26em] text-[#7f91a7]">
                Prenumeration
              </span>
            </span>
          </Link>
        </header>

        <section className="py-10 sm:py-14">
          <p className="font-mono text-sm font-bold uppercase tracking-[0.28em] text-emerald-300">
            Hantera prenumeration
          </p>
          <h1 className="mt-5 text-[44px] font-bold leading-[0.96] sm:text-6xl">
            Din prenumeration
          </h1>

          {loading ? (
            <div className="mt-10 border border-[#22303d] bg-[#0b1016] p-6 text-[#c7d1dd]">
              Hämtar prenumerationen...
            </div>
          ) : subscription ? (
            <div className="mt-10 grid gap-5">
              <div className="border border-[#22303d] bg-[#0b1016] p-6">
                <dl className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <dt className="font-mono text-xs font-bold uppercase tracking-[0.24em] text-[#7f91a7]">
                      Produkt
                    </dt>
                    <dd className="mt-2 text-2xl font-bold">{subscription.product_name}</dd>
                  </div>
                  <div>
                    <dt className="font-mono text-xs font-bold uppercase tracking-[0.24em] text-[#7f91a7]">
                      Plan
                    </dt>
                    <dd className="mt-2 text-2xl font-bold">{subscription.plan_name}</dd>
                  </div>
                  <div>
                    <dt className="font-mono text-xs font-bold uppercase tracking-[0.24em] text-[#7f91a7]">
                      Status
                    </dt>
                    <dd className="mt-2 text-xl font-bold text-emerald-300">
                      {statusLabel(subscription)}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-mono text-xs font-bold uppercase tracking-[0.24em] text-[#7f91a7]">
                      Tillgång gäller till
                    </dt>
                    <dd className="mt-2 text-xl font-bold">{accessUntil}</dd>
                  </div>
                  {subscription.is_recurring ? (
                    <div className="sm:col-span-2">
                      <dt className="font-mono text-xs font-bold uppercase tracking-[0.24em] text-[#7f91a7]">
                        Nästa betalning
                      </dt>
                      <dd className="mt-2 text-xl font-bold">
                        {subscription.cancel_at_period_end ? "Ingen ny betalning planerad" : nextRenewal}
                      </dd>
                    </div>
                  ) : (
                    <div className="sm:col-span-2">
                      <dt className="font-mono text-xs font-bold uppercase tracking-[0.24em] text-[#7f91a7]">
                        Förnyelse
                      </dt>
                      <dd className="mt-2 text-lg leading-8 text-[#c7d1dd]">
                        Detta är en förbetald åtkomstperiod som gäller till {accessUntil}. Den
                        förnyas inte automatiskt.
                      </dd>
                    </div>
                  )}
                </dl>
              </div>

              {subscription.cancel_at_period_end ? (
                <div className="border border-emerald-300/50 bg-emerald-300/10 p-6">
                  <h2 className="text-2xl font-bold">Prenumerationen är avslutad</h2>
                  <p className="mt-3 text-lg leading-8 text-[#d7e1eb]">
                    Din tillgång fortsätter till {accessUntil}. Du debiteras inte igen efter den
                    här perioden.
                  </p>
                  {data?.confirmation_email_sent ? (
                    <p className="mt-3 text-base text-[#aebccc]">
                      En bekräftelse har skickats till din e-postadress.
                    </p>
                  ) : null}
                </div>
              ) : confirming ? (
                <div className="border border-[#394958] bg-[#0b1016] p-6">
                  <h2 className="text-2xl font-bold">Avsluta prenumerationen?</h2>
                  <p className="mt-3 text-lg leading-8 text-[#d7e1eb]">
                    Du behåller tillgången till Finansanalytik till {accessUntil}. Du debiteras
                    inte igen efter den här perioden.
                  </p>
                  <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                    <button
                      type="button"
                      onClick={cancelSubscription}
                      disabled={submitting}
                      className="bg-emerald-300 px-5 py-4 text-base font-black text-[#06100c] transition hover:bg-emerald-200 disabled:cursor-wait disabled:opacity-60"
                    >
                      {submitting ? "Avslutar..." : "Bekräfta avslut"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirming(false)}
                      disabled={submitting}
                      className="border border-[#2b3a48] px-5 py-4 text-base font-black text-[#d7e1eb] transition hover:border-emerald-300 hover:text-emerald-300"
                    >
                      Behåll prenumerationen
                    </button>
                  </div>
                </div>
              ) : subscription.can_cancel ? (
                <div className="border border-[#22303d] bg-[#0b1016] p-6">
                  <h2 className="text-2xl font-bold">Avsluta framtida förnyelser</h2>
                  <p className="mt-3 text-lg leading-8 text-[#c7d1dd]">
                    Du kan avsluta framtida förnyelser när som helst. Om du avslutar
                    prenumerationen behåller du tillgången till slutet av den betalda perioden.
                  </p>
                  <button
                    type="button"
                    onClick={() => setConfirming(true)}
                    className="mt-6 border border-emerald-300 px-5 py-4 text-base font-black text-emerald-300 transition hover:bg-emerald-300 hover:text-[#06100c]"
                  >
                    Avsluta framtida förnyelser
                  </button>
                </div>
              ) : null}
            </div>
          ) : (
            <div className="mt-10 border border-[#22303d] bg-[#0b1016] p-6">
              <h2 className="text-2xl font-bold">Skicka ny säker länk</h2>
              <p className="mt-3 text-lg leading-8 text-[#c7d1dd]">
                Ange din e-postadress så skickar vi en ny säker länk för att hantera din
                prenumeration.
              </p>
              <form onSubmit={requestLink} className="mt-6 grid gap-3 sm:grid-cols-[1fr_auto]">
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="din@email.se"
                  className="min-h-14 border border-[#2b3a48] bg-[#07090b] px-4 text-base text-white outline-none transition placeholder:text-[#728196] focus:border-emerald-300"
                  required
                />
                <button
                  type="submit"
                  disabled={submitting}
                  className="min-h-14 bg-emerald-300 px-5 text-base font-black text-[#06100c] transition hover:bg-emerald-200 disabled:cursor-wait disabled:opacity-60"
                >
                  Skicka länk
                </button>
              </form>
              {requestMessage ? (
                <p className="mt-4 text-base leading-7 text-emerald-300">{requestMessage}</p>
              ) : null}
            </div>
          )}

          {error ? (
            <p className="mt-5 border border-red-400/40 bg-red-500/10 p-4 text-base leading-7 text-red-100">
              {error}
            </p>
          ) : null}

          <p className="mt-8 text-sm leading-7 text-[#8192a6]">
            Marketingutskick och serviceleverans är separata. Att avsluta prenumerationen stoppar
            framtida betalningar, men påverkar inte redan betald tillgång. Vid frågor, kontakta{" "}
            <a href="mailto:support@tvp-byra.se" className="text-emerald-300 underline">
              support@tvp-byra.se
            </a>
            .
          </p>
        </section>
      </div>
    </main>
  );
}
