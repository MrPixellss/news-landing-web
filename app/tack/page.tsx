import Link from "next/link";

export default function ThankYouPage() {
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
          Betalning mottagen
        </p>
        <h1 className="mt-5 text-[44px] font-bold leading-[0.96] tracking-[-0.04em] sm:text-6xl">
          Tack. Rapporten skickas till din e-post.
        </h1>
        <p className="mt-7 text-lg leading-8 text-[#c7d1dd]">
          När Stripe har bekräftat betalningen skickar Finansanalytik rapporten
          till e-postadressen du angav i kassan. Det krävs inget konto.
        </p>
        <div className="mt-9 border border-[#26313d] bg-[#0d1117] p-6">
          <p className="text-[11px] font-bold uppercase tracking-[0.26em] text-[#7f91a7]">
            Nästa steg
          </p>
          <p className="mt-3 text-base leading-7 text-[#c7d1dd]">
            Kontrollera inkorgen. Om mejlet inte syns direkt, kontrollera även
            skräppost eller kampanjfliken.
          </p>
        </div>
      </div>
    </main>
  );
}
