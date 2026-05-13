import Link from "next/link";
import {
  confidenceLabel,
  getTodayTeaser,
  orderedTopics,
  shortPreview,
} from "./lib/report";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function HomePage() {
  const data = await getTodayTeaser();
  const blocksBySlug = new Map(data.blocks.map((block) => [block.slug, block]));
  const hasReportContent = data.blocks.length > 0;

  return (
    <main className="min-h-screen bg-[#0b0c0f] text-zinc-50">
      <section className="border-b border-white/10 bg-[#111318]">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-5 py-7 md:px-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-300">
              {data.date}
            </p>
            <h1 className="mt-3 max-w-4xl text-3xl font-semibold tracking-tight md:text-5xl">
              {hasReportContent ? data.title : "Dagens analys förbereds"}
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-6 text-zinc-300 md:text-base">
              {hasReportContent
                ? data.intro
                : "Analysen visas här när dagens primärkällor har passerat kvalitetssil, topic routing och analytikerregler."}
            </p>
          </div>

          <div className="flex min-w-48 items-center justify-between gap-4 border-t border-white/10 pt-4 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                Daglig rapport
              </p>
              <p className="mt-1 text-2xl font-semibold">
                {data.daily_price_eur} €
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                Teman
              </p>
              <p className="mt-1 text-2xl font-semibold">
                {data.blocks.length || orderedTopics.length}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-6 md:px-8 md:py-8">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {orderedTopics.map((topic, index) => {
            const block = blocksBySlug.get(topic.slug);
            const headline = block?.headline || "Analytiken för temat bearbetas";
            const preview =
              shortPreview(block?.teaser || "") ||
              "När signalerna är klara visas en kort förhandsvisning här.";

            return (
              <Link
                key={topic.slug}
                href={`/topics/${topic.slug}`}
                className="group min-h-64 border border-white/10 bg-white/[0.035] p-5 transition hover:border-emerald-300/40 hover:bg-white/[0.06] focus:outline-none focus:ring-2 focus:ring-emerald-300/70"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                      Tema {String(index + 1).padStart(2, "0")}
                    </p>
                    <h2 className="mt-3 text-xl font-semibold leading-tight">
                      {topic.name}
                    </h2>
                  </div>
                  <span className="shrink-0 border border-white/10 px-2 py-1 text-xs font-medium text-zinc-300">
                    {confidenceLabel(block?.confidence)}
                  </span>
                </div>

                <p className="mt-5 text-base font-semibold leading-6 text-zinc-50">
                  {headline}
                </p>

                <p className="mt-4 line-clamp-4 text-sm leading-6 text-zinc-400">
                  {preview}
                </p>

                <p className="mt-6 text-sm font-semibold text-emerald-300 transition group-hover:text-emerald-200">
                  Läs preview
                </p>
              </Link>
            );
          })}
        </div>
      </section>
    </main>
  );
}
