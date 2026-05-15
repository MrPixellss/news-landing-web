import Link from "next/link";
import {
  displayDate,
  getTodayTeaser,
  normalizeSwedishCopy,
  orderedTopics,
  shortPreview,
} from "./lib/report";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function HomePage() {
  const data = await getTodayTeaser();
  const hasFreshReport = data.is_fresh !== false && data.blocks.length > 0;
  const blocksBySlug = new Map(
    hasFreshReport ? data.blocks.map((block) => [block.slug, block]) : [],
  );
  const reportDate = displayDate(
    hasFreshReport ? data.date : data.expected_date || data.date,
  );
  const focusItems = orderedTopics
    .map((topic) => ({
      topic,
      block: blocksBySlug.get(topic.slug),
    }))
    .filter((item) => item.block)
    .slice(0, 3);

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
          <h1 className="mt-5 max-w-5xl text-[44px] font-bold leading-[0.94] tracking-[-0.04em] sm:text-6xl lg:text-[82px]">
            {hasFreshReport ? data.title : "Dagens analys förbereds"}
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-[#c7d1dd]">
            {hasFreshReport
              ? normalizeSwedishCopy(data.intro)
              : "Analysen visas här när dagens primärkällor har passerat kvalitetssil, ämnesstyrning och analytikerregler."}
          </p>
        </section>

        <section className="py-9">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.26em] text-[#7f91a7]">
              I fokus idag
            </p>
            <h2 className="mt-2 text-2xl font-bold tracking-[-0.02em]">
              Dagens tre viktigaste områden
            </h2>
          </div>

          <div className="mt-5 grid gap-3 lg:grid-cols-3">
            {(focusItems.length
              ? focusItems
              : orderedTopics.slice(0, 3).map((topic) => ({ topic, block: null }))
            ).map(({ topic, block }, index) => (
              <Link
                key={topic.slug}
                href={`/topics/${topic.slug}`}
                className="grid min-h-[150px] grid-cols-[46px_1fr] gap-4 border border-[#26313d] bg-[#0d1117] p-5 transition hover:border-emerald-300/60 hover:bg-[#111820] focus:outline-none focus:ring-2 focus:ring-emerald-300/70"
              >
                <span
                  className={[
                    "grid size-[46px] place-items-center text-sm font-black text-[#06100c]",
                    index === 0
                      ? "bg-emerald-300"
                      : index === 1
                        ? "bg-sky-300"
                        : "bg-[#e4c369]",
                  ].join(" ")}
                >
                  {index + 1}
                </span>
                <span>
                  <span className="block text-lg font-bold leading-snug">
                    {normalizeSwedishCopy(block?.headline) || topic.name}
                  </span>
                  <span className="mt-3 block text-sm leading-6 text-[#a8b5c4]">
                    {shortPreview(normalizeSwedishCopy(block?.teaser), 1) ||
                      "Analysen publiceras när tillräckligt många signaler har passerat reglerna."}
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </section>

        <section className="pb-14">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.26em] text-[#7f91a7]">
              Analysområden
            </p>
            <h2 className="mt-2 text-2xl font-bold tracking-[-0.02em]">
              Alla dagliga analysområden
            </h2>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
            {orderedTopics.map((topic, index) => {
              const block = blocksBySlug.get(topic.slug);
              const headline =
                normalizeSwedishCopy(block?.headline) ||
                "Analytiken för området bearbetas";
              const preview =
                shortPreview(normalizeSwedishCopy(block?.teaser)) ||
                "När signalerna är klara visas en kort förhandsvisning här.";

              return (
                <Link
                  key={topic.slug}
                  href={`/topics/${topic.slug}`}
                  className="group flex min-h-[254px] flex-col border border-[#26313d] bg-[#0d1117] p-5 transition hover:-translate-y-0.5 hover:border-emerald-300/60 hover:bg-[#111820] focus:outline-none focus:ring-2 focus:ring-emerald-300/70"
                >
                  <p className="text-[11px] font-bold uppercase tracking-[0.26em] text-[#7f91a7]">
                    Område {String(index + 1).padStart(2, "0")}
                  </p>
                  <h3 className="mt-6 min-h-12 text-xl font-bold leading-tight tracking-[-0.02em]">
                    {topic.name}
                  </h3>
                  <p className="mt-5 text-[15px] font-bold leading-6">
                    {headline}
                  </p>
                  <p className="mt-3 line-clamp-3 text-sm leading-6 text-[#a8b5c4]">
                    {preview}
                  </p>
                  <p className="mt-auto pt-5 text-sm font-bold text-emerald-300 transition group-hover:text-emerald-200">
                    Läs förhandsvisning →
                  </p>
                </Link>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}
