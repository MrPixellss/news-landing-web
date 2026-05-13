import Link from "next/link";
import { notFound } from "next/navigation";
import {
  confidenceLabel,
  getTodayTeaser,
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

export default async function TopicPage({ params }: TopicPageProps) {
  const { slug } = await params;
  const topic = orderedTopics.find((item) => item.slug === slug);

  if (!topic) {
    notFound();
  }

  const data = await getTodayTeaser();
  const block = data.blocks.find((item) => item.slug === slug);
  const hasBlock = Boolean(block);
  const headline = block?.headline || "Analytiken för temat bearbetas";
  const preview =
    shortPreview(block?.teaser || "", 3) ||
    "Temats analys visas här när tillräckligt många signaler har passerat reglerna.";

  return (
    <main className="min-h-screen bg-[#0b0c0f] text-zinc-50">
      <section className="border-b border-white/10 bg-[#111318]">
        <div className="mx-auto max-w-5xl px-5 py-7 md:px-8">
          <Link
            href="/"
            className="text-sm font-medium text-zinc-400 transition hover:text-emerald-300"
          >
            Till alla teman
          </Link>

          <div className="mt-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-300">
                {data.date}
              </p>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight md:text-5xl">
                {topic.name}
              </h1>
            </div>

            <div className="flex gap-2 text-sm">
              <span className="border border-white/10 px-3 py-2 text-zinc-300">
                {confidenceLabel(block?.confidence)}
              </span>
              <span className="border border-white/10 px-3 py-2 text-zinc-300">
                {data.daily_price_eur} €
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-5xl gap-6 px-5 py-7 md:px-8 lg:grid-cols-[1fr_20rem]">
        <article className="min-w-0">
          <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
            Snabb slutsats
          </p>
          <h2 className="mt-3 text-2xl font-semibold leading-tight md:text-3xl">
            {headline}
          </h2>

          <div className="mt-6 border-y border-white/10 py-6">
            <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
              Förhandsvisning
            </p>
            <p className="mt-3 text-base leading-8 text-zinc-300">
              {preview}
            </p>
          </div>

          <div className="relative mt-6 overflow-hidden border border-white/10 bg-white/[0.035] p-5">
            <div className="max-h-40 select-none space-y-4 overflow-hidden blur-[5px]">
              <p className="text-base leading-8 text-zinc-300">
                {block?.teaser || preview}
              </p>
              <p className="text-base leading-8 text-zinc-300">
                Rapporten väger signalstyrka, upprepning mellan källor,
                marknadspåverkan, riktning och osäkerhet innan slutsatsen
                formuleras för dagens läge.
              </p>
            </div>
            <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#0f1116] to-transparent" />
          </div>
        </article>

        <aside className="border border-white/10 bg-white/[0.035] p-5 lg:sticky lg:top-6 lg:self-start">
          <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
            Full analys
          </p>
          <p className="mt-3 text-sm leading-6 text-zinc-300">
            Köp dagens rapport för {data.daily_price_eur} € och få hela
            analysen skickad via e-post.
          </p>
          <button
            className="mt-5 w-full bg-emerald-300 px-4 py-3 text-sm font-semibold text-zinc-950 opacity-70"
            disabled
            type="button"
          >
            Köp full analys
          </button>
          <p className="mt-3 text-xs leading-5 text-zinc-500">
            Betalning och e-postleverans aktiveras i nästa produktsteg.
          </p>

          {!hasBlock ? (
            <p className="mt-5 border-t border-white/10 pt-5 text-sm leading-6 text-zinc-400">
              Temat är aktivt men dagens analys har inte tillräckligt med
              godkända signaler ännu.
            </p>
          ) : null}
        </aside>
      </section>
    </main>
  );
}
