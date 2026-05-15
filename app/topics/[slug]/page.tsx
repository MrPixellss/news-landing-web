import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckoutButton } from "../../components/CheckoutButton";
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

export default async function TopicPage({ params }: TopicPageProps) {
  const { slug } = await params;
  const topic = orderedTopics.find((item) => item.slug === slug);

  if (!topic) {
    notFound();
  }

  const data = await getTodayTeaser();
  const topicReport = await getTopicReport(slug);
  const block = data.blocks.find((item) => item.slug === slug);
  const freshBlock = data.is_fresh !== false ? block : undefined;
  const freshTopicReport = topicReport?.is_fresh !== false ? topicReport : null;
  const reportTopic = freshTopicReport?.topic;
  const hasContent = Boolean(reportTopic || freshBlock);
  const reportDate = displayDate(
    freshTopicReport?.date ||
      (data.is_fresh !== false ? data.date : data.expected_date || data.date),
  );
  const headline =
    normalizeSwedishCopy(reportTopic?.headline || freshBlock?.headline) ||
    "Analytiken för området bearbetas";
  const fullReportBody =
    normalizeSwedishCopy(reportTopic?.full_report_body || freshBlock?.teaser) ||
    "";
  const reportParagraphs = fullReportBody
    .split(/\n{2,}/)
    .map((item) => item.trim())
    .filter(Boolean);
  const sections = reportTopic?.sections || [];
  const previewSource = normalizeSwedishCopy(
    reportTopic?.teaser || freshBlock?.teaser || fullReportBody,
  );
  const preview =
    shortPreview(previewSource, 3) ||
    "Områdets analys visas här när tillräckligt många signaler har passerat reglerna.";
  const lockedParagraphs = reportParagraphs.length
    ? reportParagraphs.slice(0, 4)
    : [preview];

  return (
    <main className="min-h-screen bg-[#07090b] text-zinc-50">
      <div className="mx-auto max-w-[1440px] px-4 py-6 sm:px-6 lg:px-8">
        <header className="flex items-center gap-3 border-b border-[#1a222c] pb-5">
          <div className="grid size-10 place-items-center bg-emerald-300 text-sm font-black text-[#06100c]">
            F
          </div>
          <div>
            <p className="text-lg font-bold leading-tight">Finansanalytik</p>
            <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.26em] text-[#7f91a7]">
              Daglig marknadsanalys
            </p>
          </div>
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
          <article className="border border-[#26313d] bg-[#0d1117] p-6 md:p-8">
            <p className="text-[11px] font-bold uppercase tracking-[0.26em] text-[#7f91a7]">
              Snabb slutsats
            </p>
            <h2 className="mt-4 max-w-5xl text-3xl font-bold leading-tight tracking-[-0.02em] md:text-4xl">
              {headline}
            </h2>
            <p className="mt-6 max-w-4xl text-lg leading-9 text-[#c7d1dd]">
              {preview}
            </p>
          </article>

          {sections.length ? (
            <div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
              {sections.map((section) => (
                <div
                  key={section.id || section.title}
                  className="border border-[#26313d] bg-[#0d1117] px-4 py-3 text-center text-sm font-semibold text-[#c4cfdb]"
                >
                  {sectionLabels.get(section.id || "") ||
                    section.title ||
                    "Analysdel"}
                </div>
              ))}
            </div>
          ) : null}

          <article className="mt-5 border border-[#26313d] bg-[#0d1117] p-6 md:p-8">
            <p className="text-[11px] font-bold uppercase tracking-[0.26em] text-[#7f91a7]">
              Förhandsvisning
            </p>
            <h2 className="mt-4 text-2xl font-bold tracking-[-0.02em]">
              Öppen del av analysen
            </h2>
            <p className="mt-5 max-w-4xl text-lg leading-9 text-[#c7d1dd]">
              {preview}
            </p>

            <div className="relative mt-7 min-h-72 overflow-hidden border border-[#26313d] bg-[#0b0f14]">
              <div className="max-h-72 select-none space-y-5 overflow-hidden p-7 blur-[5px]">
                {lockedParagraphs.map((paragraph) => (
                  <p
                    key={paragraph}
                    className="text-base leading-8 text-[#d4dce6]"
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
              <div className="absolute inset-x-0 bottom-0 grid min-h-40 place-items-center bg-gradient-to-t from-[#0b0f14] via-[#0b0f14]/95 to-transparent p-6">
                <div className="w-full max-w-md border border-emerald-300/45 bg-[#07090b]/90 p-5 text-center">
                  <p className="text-lg font-bold">Hela analysen är låst</p>
                  <CheckoutButton
                    priceEur={data.daily_price_eur}
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
    </main>
  );
}
