import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Kontakt | Finansanalytik",
};

export default function KontaktPage() {
  return (
    <main className="min-h-screen bg-[#07090b] text-zinc-50">
      <section className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="border border-[#26313d] bg-[#0d1117] p-6 md:p-10">
          <p className="text-[11px] font-bold uppercase tracking-[0.26em] text-[#7f91a7]">
            Kontakt
          </p>
          <h1 className="mt-4 text-4xl font-bold tracking-[-0.03em] md:text-6xl">
            Kontakt
          </h1>

          <div className="mt-8 space-y-5 text-base leading-8 text-[#c7d1dd]">
            <p>Finansanalytik är en digital tjänst som drivs av TVP Byrå.</p>

            <div className="border border-[#26313d] bg-[#0b0f14] p-5">
              <p className="font-bold text-white">TVP Byrå</p>
              <p>Org.nr/personnummer: 960303-6618</p>
              <p>Korrespondensadress: [Postbox24-adress]</p>
              <p>
                E-post:{" "}
                <a className="text-emerald-300" href="mailto:info@tvp-byra.se">
                  info@tvp-byra.se
                </a>
              </p>
              <p>Webbplats/tjänst: finansanalytik.com</p>
            </div>

            <p>
              Korrespondensadressen används endast för skriftlig kommunikation
              och kundärenden. Den är inte en besöksadress.
            </p>

            <p>
              Fysisk post behandlas normalt inom 14 dagar från mottagande. För
              snabbare hantering rekommenderas e-post.
            </p>

            <p>
              Frågor om köp, leverans, support, integritet eller villkor skickas
              till{" "}
              <a className="text-emerald-300" href="mailto:info@tvp-byra.se">
                info@tvp-byra.se
              </a>
              .
            </p>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              className="border border-[#26313d] px-4 py-3 text-sm font-bold text-[#d7e1eb] hover:border-emerald-300 hover:text-emerald-300"
              href="/kopvillkor"
            >
              Köpvillkor
            </Link>
            <Link
              className="border border-[#26313d] px-4 py-3 text-sm font-bold text-[#d7e1eb] hover:border-emerald-300 hover:text-emerald-300"
              href="/integritetspolicy"
            >
              Integritetspolicy
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
