import Link from "next/link";
import { CheckoutButton } from "../components/CheckoutButton";
import { ProductEvent } from "../components/ProductEvent";

type ThankYouPageProps = {
  searchParams?: Promise<{
    subscription?: string;
    product?: string;
  }>;
};

export default async function ThankYouPage({ searchParams }: ThankYouPageProps) {
  const params = await searchParams;
  const product = params?.product || "";
  const isIntroWeek = product === "monthly_intro_week";
  const isHalfYearAccess = product === "half_year_access";
  const isMonthlyAccess =
    !isHalfYearAccess &&
    (isIntroWeek || product === "monthly_access" || params?.subscription === "success");
  const isDayPass = !isMonthlyAccess && !isHalfYearAccess;

  const title = isIntroWeek
    ? "Tack. Din provvecka är aktiverad."
    : isMonthlyAccess
    ? "Tack. Din månadsaccess aktiveras."
    : isHalfYearAccess
      ? "Tack. Din halvårsaccess aktiveras."
      : "Tack. Analyspaketet skickas till din e-post.";

  const intro = isIntroWeek
    ? "När Stripe har bekräftat betalningen skickar Finansanalytik dagens analyspaket till e-postadressen från din gratisrapport. Månadsaccess fortsätter därefter för 249 kr/mån tills du avslutar."
    : isMonthlyAccess
    ? "När Stripe har bekräftat prenumerationen skickar Finansanalytik dagens analyspaket till e-postadressen du angav i kassan."
    : isHalfYearAccess
      ? "När Stripe har bekräftat betalningen aktiveras din access för 6 månader och dagens analyspaket skickas till din e-post. Prenumerationen förnyas var sjätte månad tills du avslutar."
      : "När Stripe har bekräftat betalningen skickar Finansanalytik en privat länk till dagens tio analyser till e-postadressen du angav i kassan. Det krävs inget konto.";

  const nextSteps = isIntroWeek
    ? [
        "Dagens rapport skickas till din e-post.",
        "Du har Månadsaccess under provveckan.",
        "Efter 7 dagar fortsätter prenumerationen för 249 kr/mån om du inte avslutar.",
        "Du kan hantera prenumerationen via länken i e-postmeddelandet.",
      ]
    : isMonthlyAccess
    ? [
        "Dagens rapport skickas till din e-post.",
        "Kommande rapporter skickas löpande under aktiv period.",
        "Du kan hantera prenumerationen via länken i e-postmeddelandet.",
        "Kontakta support om rapporten inte kommit fram.",
      ]
    : isHalfYearAccess
      ? [
          "Din access gäller i 6 månader.",
          "Rapporten skickas till e-postadressen du angav.",
          "Kommande rapporter levereras under aktiv period.",
          "Halvårsaccess förnyas var sjätte månad om du inte avslutar inför nästa period.",
          "Support: support@tvp-byra.se.",
        ]
      : [
          "Dagens rapport skickas till din e-post.",
          "Ingen prenumeration startas.",
          "Kontrollera även skräppost eller kampanjfliken om mejlet inte syns direkt.",
          "Vill du få rapporten varje morgon kan du välja Månadsaccess.",
        ];

  return (
    <main className="min-h-screen bg-[#07090b] text-zinc-50">
      <ProductEvent
        eventName="thank_you_view"
        properties={{
          product: isMonthlyAccess
            ? isIntroWeek
              ? "monthly_intro_week"
              : "monthly_access"
            : isHalfYearAccess
              ? "half_year_access"
              : "day_pass",
          source: "stripe_success",
        }}
      />
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
          {title}
        </h1>
        <p className="mt-7 text-lg leading-8 text-[#c7d1dd]">{intro}</p>

        <div className="mt-9 border border-[#26313d] bg-[#0d1117] p-6">
          <p className="text-[11px] font-bold uppercase tracking-[0.26em] text-[#7f91a7]">
            Vad händer nu?
          </p>
          <ul className="mt-4 space-y-3">
            {nextSteps.map((item) => (
              <li key={item} className="border-l-2 border-emerald-300/70 pl-3 text-base leading-7 text-[#c7d1dd]">
                {item}
              </li>
            ))}
          </ul>
          <p className="mt-5 text-base leading-7 text-[#c7d1dd]">
            Vid frågor kontaktar du oss på{" "}
            <a className="text-emerald-300" href="mailto:support@tvp-byra.se">
              support@tvp-byra.se
            </a>
            .
          </p>
        </div>

        {isDayPass ? (
          <div className="mt-5 border border-[#26313d] bg-[#0d1117] p-6">
            <p className="text-[11px] font-bold uppercase tracking-[0.26em] text-[#7f91a7]">
              Vill du få rapporten varje morgon?
            </p>
            <h2 className="mt-3 text-2xl font-bold">Månadsaccess samlar allt löpande</h2>
            <p className="mt-3 text-base leading-7 text-[#c7d1dd]">
              Dagliga rapporter, veckosammanfattning och månadsutsikt levereras
              via e-post under aktiv period.
            </p>
            <CheckoutButton
              buttonLabel="Se månadsaccess"
              description="Du får dagliga fullständiga rapporter, veckosammanfattning och månadsutsikt via e-post under aktiv period."
              priceLabel="249 kr/mån"
              product="monthly_access"
              productName="Månadsaccess"
              topicSlug="macro"
            />
          </div>
        ) : null}
      </div>
    </main>
  );
}
