import Link from "next/link";
import { CheckoutButton } from "../../components/CheckoutButton";
import {
  displayDate,
  getPaidReport,
  normalizeSwedishCopy,
  orderedTopics,
  shortPreview,
  type FullTopicReport,
  type MarketSnapshotItem,
} from "../../lib/report";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type PaidReportPageProps = {
  params: Promise<{
    token: string;
  }>;
};

const sectionLabels = new Map([
  ["executive_view", "Slutsats"],
  ["key_signals", "Viktigaste signaler"],
  ["market_read_through", "Marknadstolkning"],
  ["risk_view", "Riskbild"],
  ["scenario_map", "Scenarier"],
]);

function topicOrder(topic: FullTopicReport) {
  const index = orderedTopics.findIndex((item) => item.slug === topic.slug);
  return index >= 0 ? index : 999;
}

function paragraphs(text: string) {
  return cleanReportText(text)
    .replace(
      /\s+(Slutsats|Viktigaste signaler|Marknadstolkning|Riskbild|Scenarier)\s+/g,
      "\n\n$1\n",
    )
    .split(/\n{2,}/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function removeSourceBoilerplate(line: string) {
  const sourceMarkers = [
    "Finansinspektionen En stabil",
    "Sveriges Riksbank ",
    "English Prenumerera",
    "Search Options Image Preview",
    "Share this article",
    "Copy link",
  ];
  const markerIndex = sourceMarkers.reduce<number | null>((earliest, marker) => {
    const index = line.toLowerCase().indexOf(marker.toLowerCase());
    if (index < 0) {
      return earliest;
    }
    return earliest === null ? index : Math.min(earliest, index);
  }, null);

  if (markerIndex === null) {
    return line;
  }

  const colonIndex = line.indexOf(":");
  if (colonIndex > 24 && colonIndex < markerIndex) {
    return line.slice(0, colonIndex).trim();
  }

  return line.slice(0, markerIndex).replace(/[:\s-]+$/, "").trim();
}

function cleanReportText(text: string | undefined) {
  return normalizeSwedishCopy(text)
    .split("\n")
    .map((line) => removeSourceBoilerplate(line.trim()))
    .filter((line) => {
      const lower = line.toLowerCase();
      return (
        line.length > 0 &&
        !lower.includes("english prenumerera") &&
        !lower.includes("search options image preview") &&
        !lower.includes("copy link") &&
        !lower.includes("share this article")
      );
    })
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function sectionTitle(section: FullTopicReport["sections"][number]) {
  return sectionLabels.get(section.id || "") || section.title || "Analys";
}

function sectionBodyParagraphs(section: FullTopicReport["sections"][number]) {
  const title = sectionTitle(section);
  const titlePrefix = title.toLowerCase();

  return paragraphs(section.body || "")
    .map((paragraph) => {
      const lower = paragraph.toLowerCase();
      if (lower.startsWith(`${titlePrefix} `)) {
        return paragraph.slice(title.length).replace(/^[:\s-]+/, "").trim();
      }
      return paragraph;
    })
    .filter(Boolean);
}

function sectionItems(section: FullTopicReport["sections"][number]) {
  return (section.items || [])
    .map((item) => cleanReportText(item).replace(/^[-•]\s*/, "").trim())
    .filter(Boolean);
}

function formatMetricValue(item: MarketSnapshotItem) {
  const value = Number(item.latest_value);
  if (!Number.isFinite(value)) {
    return "-";
  }
  const decimals = Math.abs(value) >= 100 ? 1 : 2;
  return `${value.toFixed(decimals)}${item.currency === "%" ? "%" : item.currency ? ` ${item.currency}` : ""}`;
}

function formatChangePct(value: number | null | undefined) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return "";
  }
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
}

function marketInsight(item: MarketSnapshotItem) {
  const change = item.period_change_pct ?? item.daily_change_pct;
  if (typeof change !== "number" || !Number.isFinite(change)) {
    return `${item.label} används som marknadskontroll mot analysen, men saknar tillräcklig förändringsdata för en tydlig slutsats.`;
  }

  const formatted = formatChangePct(change);
  if (change > 2) {
    return `${item.label} har stigit tydligt under mätperioden (${formatted}). Det stärker bilden av att marknaden redan prisar in högre risk eller högre nominella nivåer.`;
  }
  if (change < -2) {
    return `${item.label} har fallit tydligt under mätperioden (${formatted}). Det pekar på svagare riskaptit eller lägre prissättning i den delen av marknaden.`;
  }

  return `${item.label} har rört sig begränsat under mätperioden (${formatted}). Det gör signalen mer neutral och bör läsas tillsammans med källunderlaget.`;
}

function MiniChart({ points }: { points: MarketSnapshotItem["points"] }) {
  const cleanPoints = points
    .filter((point) => typeof point.value === "number" && Number.isFinite(point.value))
    .slice(-48);

  if (cleanPoints.length < 2) {
    return <div className="h-16 border-t border-[#26313d]" />;
  }

  const width = 180;
  const height = 58;
  const values = cleanPoints.map((point) => point.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const path = cleanPoints
    .map((point, index) => {
      const x = (index / (cleanPoints.length - 1)) * width;
      const y = height - ((point.value - min) / span) * height;
      return `${index === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <svg
      aria-hidden="true"
      className="mt-4 h-16 w-full overflow-visible"
      preserveAspectRatio="none"
      viewBox={`0 0 ${width} ${height}`}
    >
      <path d={path} fill="none" stroke="#39e59a" strokeLinecap="round" strokeWidth="3" />
    </svg>
  );
}

export default async function PaidReportPage({ params }: PaidReportPageProps) {
  const { token } = await params;
  const data = await getPaidReport(token);

  if (!data) {
    return (
      <main className="min-h-screen bg-[#07090b] text-zinc-50">
        <div className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center px-5 py-12">
          <Link
            href="/"
            className="mb-10 inline-flex text-base font-bold text-emerald-300 transition hover:text-emerald-200"
          >
            ← Till startsidan
          </Link>
          <p className="font-mono text-sm font-bold uppercase tracking-[0.28em] text-emerald-300">
            Rapportlänk
          </p>
          <h1 className="mt-5 text-[44px] font-bold leading-[0.96] tracking-[-0.04em] sm:text-6xl">
            Länken kunde inte öppnas
          </h1>
          <p className="mt-7 text-lg leading-8 text-[#c7d1dd]">
            Rapportlänken är ogiltig eller hör inte till en bekräftad
            betalning.
          </p>
        </div>
      </main>
    );
  }

  const reportDate = displayDate(data.date);
  const reportType = data.access.report_type || "daily";
  const reportTitle = normalizeSwedishCopy(data.report_title);
  const heroTitle =
    reportType === "weekly" || reportType === "monthly"
      ? reportTitle || "Periodrapport + prognos"
      : "Dagens analyspaket är upplåst";
  const logoSubtitle =
    reportType === "weekly"
      ? "Veckorapport"
      : reportType === "monthly"
        ? "Månadsutsikt"
        : "Daglig marknadsanalys";
  const introFallback =
    reportType === "weekly" || reportType === "monthly"
      ? "Här finns periodrapporten för din månadsaccess, med samlad analys och prognos för alla områden."
      : "Här finns hela dagens analys, byggd på primärkällor som har passerat kvalitetssil, ämnesstyrning och analytikerregler.";
  const primaryTopic =
    data.topics.find((topic) => topic.slug === data.access.primary_topic_slug) ??
    data.topics[0];
  const orderedReportTopics = [
    ...(primaryTopic ? [primaryTopic] : []),
    ...data.topics
      .filter((topic) => topic.slug !== primaryTopic?.slug)
      .sort((a, b) => topicOrder(a) - topicOrder(b)),
  ];
  const showMonthlyUpsell =
    data.access.type !== "monthly_access" &&
    data.access.has_active_subscription !== true &&
    data.access.offer_monthly_access !== false;

  return (
    <main className="min-h-screen bg-[#07090b] text-zinc-50">
      <div className="mx-auto max-w-[1180px] px-4 py-6 sm:px-6 lg:px-8">
        <header className="flex items-center gap-3 border-b border-[#1a222c] pb-5">
          <Link
            href="/"
            className="flex items-center gap-3 transition hover:text-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-300/70"
            aria-label="Till startsidan"
          >
            <span className="grid size-10 place-items-center bg-emerald-300 text-sm font-black text-[#06100c]">
              F
            </span>
            <span>
              <span className="block text-lg font-bold leading-tight">Finansanalytik</span>
              <span className="mt-1 block text-[11px] font-bold uppercase tracking-[0.26em] text-[#7f91a7]">
                {logoSubtitle}
              </span>
            </span>
          </Link>
        </header>

        <section className="border-b border-[#1a222c] py-10 md:py-14">
          <p className="font-mono text-sm font-bold tracking-[0.28em] text-emerald-300">
            {reportDate}
          </p>
          <h1 className="mt-5 max-w-5xl text-[44px] font-bold leading-[0.94] tracking-[-0.04em] sm:text-6xl lg:text-[76px]">
            {heroTitle}
          </h1>
          <p className="mt-6 max-w-4xl text-lg leading-8 text-[#c7d1dd]">
            {normalizeSwedishCopy(data.report_intro) ||
              introFallback}
          </p>
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="border border-[#26313d] bg-[#0d1117] p-5">
              <p className="text-[11px] font-bold uppercase tracking-[0.26em] text-[#7f91a7]">
                Huvudfokus
              </p>
              <p className="mt-3 text-xl font-black">
                {primaryTopic?.name || data.access.primary_topic_name}
              </p>
            </div>
            <div className="border border-[#26313d] bg-[#0d1117] p-5">
              <p className="text-[11px] font-bold uppercase tracking-[0.26em] text-[#7f91a7]">
                Ingår
              </p>
              <p className="mt-3 text-xl font-black">
                {data.access.topic_count} analyser
              </p>
            </div>
          </div>
        </section>

        {showMonthlyUpsell ? (
          <section
            id="manadsaccess"
            className="border-b border-[#1a222c] py-8"
          >
            <div className="grid gap-5 border border-[#26313d] bg-[#0d1117] p-6 md:grid-cols-[1fr_360px] md:p-8">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.26em] text-[#7f91a7]">
                  Följ marknaden varje dag
                </p>
                <h2 className="mt-3 text-3xl font-bold tracking-[-0.03em]">
                  Månadsaccess - 249 kr/mån
                </h2>
                <p className="mt-2 text-sm font-bold text-emerald-300">
                  249 kr/mån, moms ingår
                </p>
                <p className="mt-4 max-w-3xl text-base leading-7 text-[#c7d1dd]">
                  Få dagliga briefings med alla 10 analysområden direkt via
                  e-post. Veckosammanfattning och månadsutsikt ingår när de
                  publiceras.
                </p>
              </div>
              <div className="border border-[#26313d] bg-[#0b0f14] p-5">
                <p className="text-sm leading-6 text-[#a8b5c4]">
                  Ingen användarprofil krävs. Prenumerationen hanteras tryggt i
                  Stripe och kan sägas upp inför kommande perioder.
                </p>
                <CheckoutButton
                  buttonLabel="Starta månadsaccess - 249 kr/mån"
                  checkoutPath="/api/subscription-checkout"
                  description="Du får månadsaccess med dagliga briefings via e-post. Prenumerationen förnyas månadsvis och hanteras av Stripe. Moms ingår i priset."
                  priceLabel="249 kr/mån"
                  productName="Månadsaccess"
                  topicSlug={primaryTopic?.slug || "macro"}
                />
              </div>
            </div>
          </section>
        ) : null}

        <nav className="border-b border-[#1a222c] py-6">
          <p className="text-[11px] font-bold uppercase tracking-[0.26em] text-[#7f91a7]">
            Snabbnavigering
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {orderedReportTopics.map((topic) => (
              <a
                key={topic.slug}
                href={`#${topic.slug}`}
                className="border border-[#26313d] bg-[#0d1117] px-3 py-2 text-sm font-bold text-[#d7e1eb] transition hover:border-emerald-300 hover:text-emerald-300"
              >
                {topic.name}
              </a>
            ))}
          </div>
        </nav>

        <section className="space-y-8 py-8">
          {orderedReportTopics.map((topic, index) => {
            const bodyParagraphs = paragraphs(topic.full_report_body || topic.teaser);
            const structuredSections = topic.sections
              .map((section) => ({
                key: section.id || section.title || `${topic.slug}-section`,
                title: sectionTitle(section),
                paragraphs: sectionBodyParagraphs(section),
                items: sectionItems(section),
              }))
              .filter((section) => section.paragraphs.length || section.items.length);
            const displaySections = structuredSections.length
              ? structuredSections
              : [
                  {
                    key: `${topic.slug}-analysis`,
                    title: "Analys",
                    paragraphs: bodyParagraphs,
                    items: [],
                  },
                ];
            const conclusionSection =
              displaySections.find(
                (section) =>
                  section.key === "executive_view" ||
                  section.title.toLowerCase() === "slutsats",
              ) || null;
            const analysisSections = displaySections.filter(
              (section) => section !== conclusionSection,
            );
            const preview = shortPreview(
              normalizeSwedishCopy(topic.teaser || topic.full_report_body),
              2,
            );
            const finalConclusionParagraphs = [
              preview,
              ...(conclusionSection?.paragraphs || []),
            ].filter((paragraph, paragraphIndex, allParagraphs) => {
              const clean = paragraph.trim();
              return (
                clean.length > 0 &&
                allParagraphs.findIndex((item) => item.trim() === clean) ===
                  paragraphIndex
              );
            });

            return (
              <article
                id={topic.slug}
                key={topic.slug}
                className="scroll-mt-6 border border-[#26313d] bg-[#0d1117] p-6 md:p-8"
              >
                <div className="flex flex-col gap-3 border-b border-[#24303c] pb-6 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.26em] text-[#7f91a7]">
                      Analys {String(index + 1).padStart(2, "0")}
                    </p>
                    <h2 className="mt-4 text-4xl font-bold leading-tight tracking-[-0.03em] md:text-5xl">
                      {topic.name}
                    </h2>
                  </div>
                  {topic.slug === primaryTopic?.slug ? (
                    <span className="inline-flex border border-emerald-300/60 px-3 py-2 text-sm font-black text-emerald-300">
                      Huvudanalys
                    </span>
                  ) : null}
                </div>

                <h3 className="mt-7 max-w-5xl text-2xl font-bold leading-tight md:text-3xl">
                  {normalizeSwedishCopy(topic.headline)}
                </h3>
                {preview ? (
                  <p className="mt-5 max-w-5xl text-lg leading-9 text-[#c7d1dd]">
                    {preview}
                  </p>
                ) : null}

                {topic.market_snapshot?.length ? (
                  <div className="mt-9">
                    <p className="text-[11px] font-bold uppercase tracking-[0.26em] text-[#7f91a7]">
                      Marknadsdata
                    </p>
                    <div className="mt-4 grid gap-4 lg:grid-cols-2">
                      {topic.market_snapshot.slice(0, 6).map((item) => (
                        <div
                          key={item.instrument_id}
                          className="border border-[#26313d] bg-[#0b0f14] p-4"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-sm font-black text-white">
                                {item.label}
                              </p>
                              <p className="mt-1 text-xs font-bold uppercase tracking-[0.18em] text-[#7f91a7]">
                                {item.latest_date}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-black">
                                {formatMetricValue(item)}
                              </p>
                              {formatChangePct(item.period_change_pct) ? (
                                <p
                                  className={[
                                    "mt-1 text-sm font-bold",
                                    (item.period_change_pct ?? 0) >= 0
                                      ? "text-emerald-300"
                                      : "text-red-300",
                                  ].join(" ")}
                                >
                                  {formatChangePct(item.period_change_pct)}
                                </p>
                              ) : null}
                            </div>
                          </div>
                          <MiniChart points={item.points} />
                          <p className="mt-4 border-t border-[#26313d] pt-4 text-sm leading-6 text-[#aebccc]">
                            {marketInsight(item)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}

                <div className="mt-10 max-w-5xl bg-[#0a0e13] px-1 py-1">
                  <div className="border border-[#26313d] bg-[#0b0f14] p-5 md:p-7">
                    <div className="border-b border-[#26313d] pb-5">
                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-[0.26em] text-[#7f91a7]">
                          Analysdokument
                        </p>
                        <h4 className="mt-2 text-2xl font-bold tracking-[-0.02em] text-white">
                          {topic.name}: samlad bedömning
                        </h4>
                      </div>
                    </div>

                    <div className="mt-7 space-y-10 text-lg leading-9 text-[#d7e1eb]">
                      {analysisSections.length ? (
                        <section>
                          <h5 className="text-2xl font-bold leading-tight tracking-[-0.02em] text-white">
                            Analys
                          </h5>
                          <div className="mt-5 space-y-8">
                            {analysisSections.map((section) => (
                              <div key={section.key}>
                                <h6 className="text-base font-black uppercase tracking-[0.18em] text-emerald-300">
                                  {section.title}
                                </h6>
                                {section.paragraphs.length ? (
                                  <div className="mt-3 space-y-4">
                                    {section.paragraphs.map((paragraph) => (
                                      <p key={paragraph}>{paragraph}</p>
                                    ))}
                                  </div>
                                ) : null}
                                {section.items.length ? (
                                  <ul className="mt-4 space-y-4">
                                    {section.items.map((item, itemIndex) => (
                                      <li
                                        key={item}
                                        className="grid gap-3 border-t border-[#1f2934] pt-4 sm:grid-cols-[42px_minmax(0,1fr)]"
                                      >
                                        <span className="font-mono text-sm font-bold text-emerald-300">
                                          {String(itemIndex + 1).padStart(2, "0")}
                                        </span>
                                        <span>{item}</span>
                                      </li>
                                    ))}
                                  </ul>
                                ) : null}
                              </div>
                            ))}
                          </div>
                        </section>
                      ) : null}

                      {finalConclusionParagraphs.length ||
                      conclusionSection?.items.length ? (
                        <section className="border-t border-[#26313d] pt-8">
                          <h5 className="text-2xl font-bold leading-tight tracking-[-0.02em] text-white">
                            Slutsats
                          </h5>
                          {finalConclusionParagraphs.length ? (
                            <div className="mt-4 space-y-4">
                              {finalConclusionParagraphs.map((paragraph) => (
                                <p key={paragraph}>{paragraph}</p>
                              ))}
                            </div>
                          ) : null}
                          {conclusionSection?.items.length ? (
                            <ul className="mt-4 space-y-3">
                              {conclusionSection.items.map((item) => (
                                <li
                                  key={item}
                                  className="border-l-2 border-emerald-300/70 pl-4"
                                >
                                  {item}
                                </li>
                              ))}
                            </ul>
                          ) : null}
                        </section>
                      ) : null}
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      </div>
    </main>
  );
}
