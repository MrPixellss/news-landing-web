"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type MetaAd = {
  angle?: string;
  headline?: string;
  primaryText?: string;
  cta?: string;
  destinationUrl?: string;
};

type MetaDraft = {
  id: number;
  status: string;
  goal: string;
  positioning: string;
  offer: string;
  geo: string;
  language: string;
  dailyBudgetSek: number;
  durationDays: number;
  audience?: Record<string, unknown>;
  creative?: {
    campaignName?: string;
    ads?: MetaAd[];
  };
  compliance?: {
    status?: string;
    warnings?: string[];
    blockedClaims?: string[];
  };
  expectedKpi?: Record<string, string | number>;
  metaCampaignId?: string;
  metaStatus?: string;
  createdAt?: string;
  updatedAt?: string;
};

type MetaLead = {
  id: number;
  email?: string;
  name?: string;
  source?: string;
  campaign_id?: string;
  ad_id?: string;
  interest?: string;
  status?: string;
  created_at?: string;
};

const ADMIN_KEY_STORAGE = "finansanalytik_admin_api_key";

async function apiRequest<T>(
  path: string,
  adminKey: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await fetch(`/api/meta-admin${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "X-Admin-API-Key": adminKey,
      ...(options.headers || {}),
    },
    cache: "no-store",
  });
  const payload = (await response.json().catch(() => ({}))) as T & {
    error?: string;
    detail?: string | object;
  };
  if (!response.ok) {
    const detail =
      typeof payload.detail === "string"
        ? payload.detail
        : payload.error || "Åtgärden misslyckades.";
    throw new Error(detail);
  }
  return payload;
}

function StatusBadge({ status }: { status?: string }) {
  const isLive = status === "published" || status === "ACTIVE";
  const isBlocked = status === "rejected" || status === "blocked";
  return (
    <span
      className={[
        "inline-flex border px-2 py-1 text-[11px] font-black uppercase tracking-[0.18em]",
        isLive
          ? "border-emerald-300 text-emerald-300"
          : isBlocked
            ? "border-red-300 text-red-200"
            : "border-[#334155] text-[#a8b5c4]",
      ].join(" ")}
    >
      {status || "unknown"}
    </span>
  );
}

export function MetaCampaignDashboard() {
  const [adminKey, setAdminKey] = useState("");
  const [status, setStatus] = useState<Record<string, unknown> | null>(null);
  const [drafts, setDrafts] = useState<MetaDraft[]>([]);
  const [leads, setLeads] = useState<MetaLead[]>([]);
  const [budget, setBudget] = useState(100);
  const [duration, setDuration] = useState(3);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [performanceByDraft, setPerformanceByDraft] = useState<Record<number, unknown>>({});

  const canUse = useMemo(() => adminKey.trim().length > 0, [adminKey]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        setAdminKey(window.localStorage.getItem(ADMIN_KEY_STORAGE) || "");
      } catch {
        setAdminKey("");
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  async function refresh(nextKey = adminKey) {
    if (!nextKey.trim()) {
      return;
    }
    setIsLoading(true);
    setError("");
    try {
      const [statusPayload, draftPayload, leadPayload] = await Promise.all([
        apiRequest<Record<string, unknown>>("/meta/admin/status", nextKey),
        apiRequest<MetaDraft[]>("/meta/campaign-drafts", nextKey),
        apiRequest<MetaLead[]>("/meta/leads", nextKey),
      ]);
      setStatus(statusPayload);
      setDrafts(draftPayload);
      setLeads(leadPayload);
      setMessage("Uppdaterat.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kunde inte hämta data.");
    } finally {
      setIsLoading(false);
    }
  }

  function saveKey() {
    try {
      window.localStorage.setItem(ADMIN_KEY_STORAGE, adminKey.trim());
    } catch {
      // Do not block admin work if local storage is unavailable.
    }
    refresh(adminKey.trim());
  }

  async function createDraft(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canUse) {
      setError("Ange admin key först.");
      return;
    }
    setIsLoading(true);
    setError("");
    try {
      await apiRequest<MetaDraft>("/meta/campaign-drafts", adminKey, {
        method: "POST",
        body: JSON.stringify({
          goal: "lead_generation",
          positioning: "financial_media",
          offer: "gratisrapport",
          geo: "SE",
          language: "sv",
          dailyBudgetSek: budget,
          durationDays: duration,
        }),
      });
      setMessage("Campaign draft skapad. Ingen kampanj har publicerats.");
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Draft kunde inte skapas.");
    } finally {
      setIsLoading(false);
    }
  }

  async function act(path: string, body: Record<string, string> = {}) {
    setIsLoading(true);
    setError("");
    try {
      await apiRequest(path, adminKey, {
        method: "POST",
        body: JSON.stringify(body),
      });
      setMessage("Åtgärden genomförd.");
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Åtgärden misslyckades.");
    } finally {
      setIsLoading(false);
    }
  }

  async function loadPerformance(draftId: number) {
    setIsLoading(true);
    setError("");
    try {
      const payload = await apiRequest<Record<string, unknown>>(
        `/meta/campaign-drafts/${draftId}/performance`,
        adminKey,
      );
      setPerformanceByDraft((current) => ({ ...current, [draftId]: payload }));
      setMessage("Performance hämtad.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Performance kunde inte hämtas.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#07090b] px-4 py-8 text-zinc-50 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-[1440px]">
        <div className="border-b border-[#26313d] pb-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.28em] text-emerald-300">
                Intern admin
              </p>
              <h1 className="mt-3 text-4xl font-black tracking-[-0.03em] md:text-6xl">
                Campaign Drafts
              </h1>
            </div>
            <a
              className="border border-[#26313d] px-4 py-3 text-xs font-black uppercase tracking-[0.14em] text-[#d7e1eb]"
              href="/admin/meta/logout"
            >
              Logga ut
            </a>
          </div>
          <p className="mt-4 max-w-4xl text-base leading-7 text-[#a8b5c4]">
            AI får bara skapa förslag. Meta-kampanjer skapas först efter approve
            och alltid i pausat läge. Publish kräver manuell bekräftelse.
          </p>
        </div>

        <div className="mt-6 grid gap-4 border border-[#26313d] bg-[#0d1117] p-4 lg:grid-cols-[minmax(0,1fr)_auto]">
          <label className="block text-sm font-bold text-[#d7e1eb]">
            Admin API key
            <input
              className="mt-2 w-full border border-[#26313d] bg-[#07090b] px-3 py-3 text-sm text-white outline-none focus:border-emerald-300"
              onChange={(event) => setAdminKey(event.target.value)}
              placeholder="Klistra in admin key"
              type="password"
              value={adminKey}
            />
          </label>
          <div className="flex items-end gap-2">
            <button
              className="bg-emerald-300 px-5 py-3 text-sm font-black text-[#06100c] disabled:opacity-60"
              disabled={isLoading || !canUse}
              onClick={saveKey}
              type="button"
            >
              Spara och ladda
            </button>
            <button
              className="border border-[#26313d] px-5 py-3 text-sm font-black text-[#d7e1eb] disabled:opacity-60"
              disabled={isLoading || !canUse}
              onClick={() => refresh()}
              type="button"
            >
              Uppdatera
            </button>
          </div>
        </div>

        {message ? (
          <p className="mt-4 border border-emerald-300/50 bg-emerald-950/20 px-4 py-3 text-sm font-bold text-emerald-200">
            {message}
          </p>
        ) : null}
        {error ? (
          <p className="mt-4 border border-red-300/50 bg-red-950/20 px-4 py-3 text-sm font-bold text-red-200">
            {error}
          </p>
        ) : null}

        <div className="mt-8 grid gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
          <aside className="space-y-6">
            <form
              className="border border-[#26313d] bg-[#0d1117] p-5"
              onSubmit={createDraft}
            >
              <p className="text-[11px] font-black uppercase tracking-[0.24em] text-[#7f91a7]">
                Nytt test
              </p>
              <h2 className="mt-2 text-2xl font-black">Gratisrapport SE</h2>
              <div className="mt-5 grid gap-4">
                <label className="block text-sm font-bold text-[#d7e1eb]">
                  Daglig budget, SEK
                  <input
                    className="mt-2 w-full border border-[#26313d] bg-[#07090b] px-3 py-3 text-sm text-white outline-none focus:border-emerald-300"
                    max={5000}
                    min={50}
                    onChange={(event) => setBudget(Number(event.target.value))}
                    type="number"
                    value={budget}
                  />
                </label>
                <label className="block text-sm font-bold text-[#d7e1eb]">
                  Testlängd, dagar
                  <input
                    className="mt-2 w-full border border-[#26313d] bg-[#07090b] px-3 py-3 text-sm text-white outline-none focus:border-emerald-300"
                    max={60}
                    min={1}
                    onChange={(event) => setDuration(Number(event.target.value))}
                    type="number"
                    value={duration}
                  />
                </label>
              </div>
              <button
                className="mt-5 w-full bg-emerald-300 px-5 py-4 text-sm font-black text-[#06100c] disabled:opacity-60"
                disabled={isLoading || !canUse}
                type="submit"
              >
                Skapa draft
              </button>
              <p className="mt-4 text-xs leading-5 text-[#8d9aaa]">
                Positionering: svenskt analysmedia för marknadsöverblick. Inga
                aktietips, trading-signaler eller avkastningslöften.
              </p>
            </form>

            <div className="border border-[#26313d] bg-[#0d1117] p-5">
              <p className="text-[11px] font-black uppercase tracking-[0.24em] text-[#7f91a7]">
                Setup
              </p>
              <pre className="mt-4 overflow-x-auto whitespace-pre-wrap text-xs leading-6 text-[#c7d1dd]">
                {status ? JSON.stringify(status.meta || status, null, 2) : "Ingen data laddad."}
              </pre>
            </div>
          </aside>

          <div className="space-y-6">
            <section className="border border-[#26313d] bg-[#0d1117] p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.24em] text-[#7f91a7]">
                    Drafts
                  </p>
                  <h2 className="mt-2 text-2xl font-black">Campaign approval</h2>
                </div>
                <StatusBadge status={isLoading ? "loading" : "ready"} />
              </div>

              <div className="mt-5 space-y-4">
                {drafts.length ? (
                  drafts.map((draft) => (
                    <article key={draft.id} className="border border-[#26313d] bg-[#07090b] p-4">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="text-xs font-black uppercase tracking-[0.2em] text-[#7f91a7]">
                            Draft #{draft.id}
                          </p>
                          <h3 className="mt-2 text-xl font-black">
                            {draft.creative?.campaignName || "Finansanalytik campaign"}
                          </h3>
                          <p className="mt-2 text-sm leading-6 text-[#a8b5c4]">
                            {draft.dailyBudgetSek} SEK/dag · {draft.durationDays} dagar · {draft.geo}/{draft.language}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <StatusBadge status={draft.status} />
                          <StatusBadge status={draft.compliance?.status} />
                          {draft.metaStatus ? <StatusBadge status={draft.metaStatus} /> : null}
                        </div>
                      </div>

                      <div className="mt-4 grid gap-3">
                        {(draft.creative?.ads || []).map((ad, index) => (
                          <div key={`${draft.id}-${index}`} className="border border-[#1f2937] p-3">
                            <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-300">
                              {ad.angle || `Creative ${index + 1}`}
                            </p>
                            <p className="mt-2 text-base font-black text-white">{ad.headline}</p>
                            <p className="mt-2 text-sm leading-6 text-[#c7d1dd]">{ad.primaryText}</p>
                            <p className="mt-2 text-xs text-[#8d9aaa]">
                              {ad.cta} · {ad.destinationUrl}
                            </p>
                          </div>
                        ))}
                      </div>

                      {draft.compliance?.warnings?.length || draft.compliance?.blockedClaims?.length ? (
                        <p className="mt-4 border border-amber-300/40 bg-amber-950/20 p-3 text-sm leading-6 text-amber-100">
                          Warnings: {[...(draft.compliance.blockedClaims || []), ...(draft.compliance.warnings || [])].join(", ")}
                        </p>
                      ) : null}

                      <div className="mt-4 flex flex-wrap gap-2">
                        <button
                          className="bg-emerald-300 px-4 py-3 text-xs font-black text-[#06100c] disabled:opacity-50"
                          disabled={isLoading || !["draft", "changes_requested", "approved"].includes(draft.status)}
                          onClick={() => act(`/meta/campaign-drafts/${draft.id}/approve`, { approved_by: "owner" })}
                          type="button"
                        >
                          Approve
                        </button>
                        <button
                          className="border border-[#26313d] px-4 py-3 text-xs font-black text-[#d7e1eb] disabled:opacity-50"
                          disabled={isLoading || !["draft", "changes_requested"].includes(draft.status)}
                          onClick={() => act(`/ai/meta/propose-creatives`, { draft_id: String(draft.id) })}
                          type="button"
                        >
                          New creatives
                        </button>
                        <button
                          className="border border-[#26313d] px-4 py-3 text-xs font-black text-[#d7e1eb] disabled:opacity-50"
                          disabled={isLoading || ["created_in_meta", "published"].includes(draft.status)}
                          onClick={() => act(`/meta/campaign-drafts/${draft.id}/request-changes`, { note: "Needs owner changes." })}
                          type="button"
                        >
                          Request changes
                        </button>
                        <button
                          className="border border-red-300/50 px-4 py-3 text-xs font-black text-red-100 disabled:opacity-50"
                          disabled={isLoading || draft.status === "published"}
                          onClick={() => act(`/meta/campaign-drafts/${draft.id}/reject`, { approved_by: "owner" })}
                          type="button"
                        >
                          Reject
                        </button>
                        <button
                          className="border border-emerald-300 px-4 py-3 text-xs font-black text-emerald-300 disabled:opacity-50"
                          disabled={isLoading || draft.status !== "approved"}
                          onClick={() => act(`/meta/campaign-drafts/${draft.id}/create-in-meta`)}
                          type="button"
                        >
                          Create in Meta as paused
                        </button>
                        <button
                          className="border border-amber-300 px-4 py-3 text-xs font-black text-amber-200 disabled:opacity-50"
                          disabled={isLoading || draft.status !== "created_in_meta"}
                          onClick={() => {
                            if (window.confirm("Publicera kampanjen? Detta kan börja spendera budget.")) {
                              act(`/meta/campaigns/${draft.id}/publish`, { confirm: "PUBLISH" });
                            }
                          }}
                          type="button"
                        >
                          Publish after owner approval
                        </button>
                        <button
                          className="border border-[#26313d] px-4 py-3 text-xs font-black text-[#d7e1eb] disabled:opacity-50"
                          disabled={isLoading || !draft.metaCampaignId}
                          onClick={() => act(`/meta/campaigns/${draft.id}/pause`, { confirm: "PAUSE" })}
                          type="button"
                        >
                          Pause
                        </button>
                        <button
                          className="border border-[#26313d] px-4 py-3 text-xs font-black text-[#d7e1eb] disabled:opacity-50"
                          disabled={isLoading || !draft.metaCampaignId}
                          onClick={() => loadPerformance(draft.id)}
                          type="button"
                        >
                          Performance
                        </button>
                      </div>

                      {performanceByDraft[draft.id] ? (
                        <pre className="mt-4 max-h-80 overflow-auto border border-[#1f2937] bg-[#020617] p-3 text-xs leading-5 text-[#c7d1dd]">
                          {JSON.stringify(performanceByDraft[draft.id], null, 2)}
                        </pre>
                      ) : null}
                    </article>
                  ))
                ) : (
                  <p className="border border-[#26313d] p-5 text-sm leading-6 text-[#a8b5c4]">
                    Inga drafts ännu.
                  </p>
                )}
              </div>
            </section>

            <section className="border border-[#26313d] bg-[#0d1117] p-5">
              <p className="text-[11px] font-black uppercase tracking-[0.24em] text-[#7f91a7]">
                Leads
              </p>
              <h2 className="mt-2 text-2xl font-black">Senaste leads</h2>
              <div className="mt-5 overflow-x-auto">
                <table className="w-full min-w-[760px] border-collapse text-left text-sm">
                  <thead className="text-xs uppercase tracking-[0.18em] text-[#7f91a7]">
                    <tr>
                      <th className="border-b border-[#26313d] py-3 pr-4">Email</th>
                      <th className="border-b border-[#26313d] py-3 pr-4">Källa</th>
                      <th className="border-b border-[#26313d] py-3 pr-4">Interest</th>
                      <th className="border-b border-[#26313d] py-3 pr-4">Status</th>
                      <th className="border-b border-[#26313d] py-3 pr-4">Campaign</th>
                    </tr>
                  </thead>
                  <tbody className="text-[#c7d1dd]">
                    {leads.length ? (
                      leads.map((lead) => (
                        <tr key={lead.id}>
                          <td className="border-b border-[#1f2937] py-3 pr-4">{lead.email || "-"}</td>
                          <td className="border-b border-[#1f2937] py-3 pr-4">{lead.source || "-"}</td>
                          <td className="border-b border-[#1f2937] py-3 pr-4">{lead.interest || "-"}</td>
                          <td className="border-b border-[#1f2937] py-3 pr-4">{lead.status || "-"}</td>
                          <td className="border-b border-[#1f2937] py-3 pr-4">{lead.campaign_id || "-"}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td className="py-4 text-[#8d9aaa]" colSpan={5}>
                          Inga leads sparade ännu.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        </div>
      </section>
    </main>
  );
}
