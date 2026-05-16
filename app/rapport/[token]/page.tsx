import Link from "next/link";
import {
  displayDate,
  getPaidReport,
  normalizeSwedishCopy,
  orderedTopics,
  shortPreview,
  type FullTopicReport,
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
  return normalizeSwedishCopy(text)
    .split(/\n{2,}/)
    .map((item) => item.trim())
    .filter(Boolean);
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
  const primaryTopic =
    data.topics.find((topic) => topic.slug === data.access.primary_topic_slug) ??
    data.topics[0];
  const orderedReportTopics = [
    ...(primaryTopic ? [primaryTopic] : []),
    ...data.topics
      .filter((topic) => topic.slug !== primaryTopic?.slug)
      .sort((a, b) => topicOrder(a) - topicOrder(b)),
  ];

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

        <section className="border-b border-[#1a222c] py-10 md:py-14">
          <p className="font-mono text-sm font-bold tracking-[0.28em] text-emerald-300">
            {reportDate}
          </p>
          <h1 className="mt-5 max-w-5xl text-[44px] font-bold leading-[0.94] tracking-[-0.04em] sm:text-6xl lg:text-[76px]">
            Dagens analyspaket är upplåst
          </h1>
          <p className="mt-6 max-w-4xl text-lg leading-8 text-[#c7d1dd]">
            {normalizeSwedishCopy(data.report_intro) ||
              "Här finns hela dagens analys, byggd på primärkällor som har passerat kvalitetssil, ämnesstyrning och analytikerregler."}
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
            const preview = shortPreview(
              normalizeSwedishCopy(topic.teaser || topic.full_report_body),
              2,
            );

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
                  <p className="mt-5 max-w-4xl text-lg leading-9 text-[#c7d1dd]">
                    {preview}
                  </p>
                ) : null}

                {topic.sections.length ? (
                  <div className="mt-6 flex flex-wrap gap-2">
                    {topic.sections.map((section) => (
                      <span
                        key={section.id || section.title}
                        className="border border-[#26313d] bg-[#0b0f14] px-3 py-2 text-xs font-bold uppercase tracking-[0.18em] text-[#9eacbb]"
                      >
                        {sectionLabels.get(section.id || "") ||
                          section.title ||
                          "Analysdel"}
                      </span>
                    ))}
                  </div>
                ) : null}

                <div className="mt-7 max-w-4xl space-y-5 text-lg leading-9 text-[#d7e1eb]">
                  {bodyParagraphs.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              </article>
            );
          })}
        </section>
      </div>
    </main>
  );
}
