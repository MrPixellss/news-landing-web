import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckoutButton } from "../../components/CheckoutButton";
import { FreeReportForm } from "../../components/FreeReportForm";
import {
  displayDate,
  getTopicReport,
  getTodayTeaser,
  normalizeSwedishCopy,
  orderedTopics,
  shortPreview,
} from "../../lib/report";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type TopicPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

const sectionLabels = new Map([
  ["executive_view", "Slutsats"],
  ["key_signals", "Viktigaste signaler"],
  ["market_read_through", "Marknadstolkning"],
  ["risk_view", "Riskbild"],
  ["scenario_map", "Scenarier"],
]);

const repeatedSectionLabels = new RegExp(
  `^(${Array.from(sectionLabels.values()).join("|")})\\s*[:.-]?\\s*`,
  "i",
);

function uniqueAnalysisHighlights(
  fullReportBody: string,
  preview: string,
  sections: NonNullable<Awaited<ReturnType<typeof getTopicReport>>>["topic"]["sections"],
) {
  const sectionText = sections
    .flatMap((section) => [
      section.body || "",
      ...(Array.isArray(section.items) ? section.items : []),
    ])
    .join(" ");
  const source = [fullReportBody, sectionText, preview].filter(Boolean).join("\n");
  const candidates = source
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?])\s+/)
    .map((sentence) =>
      normalizeSwedishCopy(sentence)
        .replace(repeatedSectionLabels, "")
        .replace(/^[-•]\s*/, "")
        .trim(),
    )
    .map((sentence) =>
      sentence.length > 260 ? `${sentence.slice(0, 257).trim()}...` : sentence,
    )
    .filter((sentence) => sentence.length >= 80);
  const seen = new Set<string>();

  return candidates
    .filter((sentence) => {
      const key = sentence.toLowerCase().replace(/[^a-zåäö0-9]+/gi, " ").trim();
      if (!key || seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    })
    .slice(0, 4);
}

export default async function TopicPage({ params }: TopicPageProps) {
  const { slug } = await params;
  const topic = orderedTopics.find((item) => item.slug === slug);

  if (!topic) {
    notFound();
  }

  const [data, topicReport] = await Promise.all([
    getTodayTeaser(),
    getTopicReport(slug),
  ]);
  const block = data.blocks.find((item) => item.slug === slug);
  const latestTopicReport = topicReport?.topic ? topicReport : null;
  const reportTopic = latestTopicReport?.topic;
  const hasContent = Boolean(reportTopic || block);
  const reportDate = displayDate(
    latestTopicReport?.date || data.date || data.expected_date,
  );
  const headline =
    normalizeSwedishCopy(reportTopic?.headline || block?.headline) ||
    "Analytiken för området bearbetas";
  const fullReportBody =
    normalizeSwedishCopy(reportTopic?.full_report_body || block?.teaser) ||
    "";
  const reportParagraphs = fullReportBody
    .split(/\n{2,}/)
    .map((item) => item.trim())
    .filter(Boolean);
  const sections = reportTopic?.sections || [];
  const previewSource = normalizeSwedishCopy(
    reportTopic?.teaser || block?.teaser || fullReportBody,
  );
  const preview =
    shortPreview(previewSource, 3) ||
    "Områdets analys visas här när tillräckligt många signaler har passerat reglerna.";
  const lockedParagraphs = reportParagraphs.length
    ? reportParagraphs.slice(0, 4)
    : [preview];
  const lockedHighlights = uniqueAnalysisHighlights(
    fullReportBody,
    preview,
    sections,
  );

  return (
    <main className={`min-h-screen bg-[#07090b] text-zinc-50 ${hasContent ? "pb-28 md:pb-0" : ""}`}>
      <div className="mx-auto max-w-[1440px] px-4 py-6 sm:px-6 lg:px-8">
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
                Daglig marknadsanalys
              </span>
            </span>
          </Link>
        </header>

        <section className="pt-9">
          <Link
            href="/"
            className="inline-flex text-base font-bold text-emerald-300 transition hover:text-emerald-200"
          >
            ← Alla områden
          </Link>

          <div className="mt-9 border-b border-[#1a222c] pb-9">
            <p className="font-mono text-sm font-bold tracking-[0.28em] text-emerald-300">
              {reportDate}
            </p>
            <h1 className="mt-5 max-w-5xl text-[44px] font-bold leading-[0.94] tracking-[-0.04em] sm:text-6xl lg:text-[72px]">
              {topic.name}
            </h1>
            <p className="mt-7 max-w-4xl text-xl leading-9 text-[#d3dbe5]">
              {headline}
            </p>
          </div>
        </section>

        <section className="py-8">
          <article className="border border-[#26313d] bg-[#0d1117] p-6 text-center md:p-8">
            <p className="text-[11px] font-bold uppercase tracking-[0.26em] text-[#7f91a7]">
              Snabb slutsats
            </p>
            <h2 className="mx-auto mt-4 max-w-5xl text-3xl font-bold leading-tight tracking-[-0.02em] md:text-4xl">
              {headline}
            </h2>
            <p className="mx-auto mt-6 max-w-4xl text-lg leading-9 text-[#c7d1dd]">
              {preview}
            </p>
          </article>

          {lockedHighlights.length ? (
            <article className="mt-5 border border-[#26313d] bg-[#0d1117] p-6 md:p-8">
              <p className="text-[11px] font-bold uppercase tracking-[0.26em] text-[#7f91a7]">
                I hela rapporten
              </p>
              <div className="mt-5 space-y-4">
                {lockedHighlights.map((highlight, index) => (
                  <div
                    key={highlight}
                    className="grid gap-4 border-l-2 border-emerald-300/70 bg-[#0b0f14] p-4 sm:grid-cols-[42px_minmax(0,1fr)]"
                  >
                    <span className="font-mono text-sm font-bold text-emerald-300">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="text-base leading-7 text-[#c7d1dd]">
                      {highlight}
                    </span>
                  </div>
                ))}
              </div>
            </article>
          ) : null}

          <article className="mt-5 border border-[#26313d] bg-[#0d1117] p-6 md:p-8">
            <p className="text-[11px] font-bold uppercase tracking-[0.26em] text-[#7f91a7]">
              Förhandsvisning
            </p>
            <div className="mx-auto max-w-4xl text-center">
              <h2 className="mt-4 text-2xl font-bold tracking-[-0.02em]">
                Kort utdrag ur analysen
              </h2>
              <p className="mt-5 text-lg leading-9 text-[#c7d1dd]">
                {preview}
              </p>
            </div>

            <div className="relative mt-7 min-h-[430px] overflow-hidden border border-[#26313d] bg-[#0b0f14]">
              <div className="pointer-events-none select-none space-y-5 p-7 blur-[5px]">
                {lockedParagraphs.map((paragraph) => (
                  <p
                    key={paragraph}
                    className="text-base leading-8 text-[#d4dce6]"
                  >
                    {paragraph}
                  </p>
                ))}
                {lockedParagraphs.map((paragraph) => (
                  <p
                    key={`locked-repeat-${paragraph}`}
                    className="text-base leading-8 text-[#d4dce6]"
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
              <div className="absolute inset-0 bg-gradient-to-b from-[#0b0f14]/20 via-[#0b0f14]/72 to-[#0b0f14]" />
              <div className="absolute inset-0 grid place-items-center p-5">
                <div className="w-full max-w-sm border border-emerald-300/55 bg-[#07090b]/95 p-5 text-center shadow-2xl">
                  <p className="text-xl font-black">
                    Lås upp dagens fullständiga briefing
                  </p>
                  <p className="mt-3 text-sm leading-6 text-[#a8b5c4]">
                    Få hela denna analys och dagens övriga 9 marknadsrapporter.
                    Ingen prenumeration krävs.
                  </p>
                  <CheckoutButton
                    priceLabel="49 kr"
                    topicSlug={slug}
                  />
                  <p className="mt-2 text-xs font-bold uppercase tracking-[0.16em] text-emerald-300">
                    Moms ingår
                  </p>
                  <div className="my-4 flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.2em] text-[#7f91a7]">
                    <span className="h-px flex-1 bg-[#26313d]" />
                    <span>eller testa först</span>
                    <span className="h-px flex-1 bg-[#26313d]" />
                  </div>
                  <FreeReportForm
                    compact
                    sourcePath={`/topics/${slug}`}
                    topicSlug={slug}
                  />
                  <p className="mt-3 text-sm leading-6 text-[#8d9aaa]">
                    Efter betalning skickas rapporten till e-postadressen du
                    anger hos Stripe.
                  </p>
                </div>
              </div>
            </div>
          </article>

          {!hasContent ? (
            <p className="mt-5 border border-[#26313d] bg-[#0d1117] p-5 text-sm leading-6 text-[#a8b5c4]">
              Området är aktivt men dagens analys har ännu inte tillräckligt
              många godkända signaler.
            </p>
          ) : null}
        </section>
      </div>
      {hasContent ? (
        <div className="fixed inset-x-0 bottom-0 z-50 border-t border-emerald-300/50 bg-[#07090b]/98 p-4 shadow-[0_-18px_40px_rgba(0,0,0,0.55)] backdrop-blur md:hidden">
          <div className="mx-auto max-w-md border border-[#26313d] bg-[#0d1117] p-3">
            <div className="mb-3 flex items-end justify-between gap-3">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-emerald-300">
                  Dagspass
                </p>
                <p className="mt-1 text-sm font-bold text-zinc-50">
                  Dagens 10 analyser
                </p>
              </div>
              <p className="text-right text-sm font-black text-zinc-50">
                49 kr
                <span className="block text-[10px] font-bold uppercase tracking-[0.14em] text-[#8d9aaa]">
                  moms ingår
                </span>
              </p>
            </div>
            <CheckoutButton
              buttonClassName="w-full bg-emerald-300 px-5 py-5 text-sm font-black text-[#04100b] shadow-lg shadow-emerald-950/40 ring-1 ring-emerald-100/40 transition hover:bg-emerald-200 disabled:cursor-wait disabled:opacity-70"
              buttonLabel="Köp dagspass - 49 kr"
              priceLabel="49 kr"
              topicSlug={slug}
            />
          </div>
        </div>
      ) : null}
    </main>
  );
}
