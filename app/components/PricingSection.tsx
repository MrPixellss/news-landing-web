import Link from "next/link";
import type { ReactNode } from "react";

import { CheckoutButton } from "./CheckoutButton";

type PlanCardProps = {
  title: string;
  price: string;
  priceNote?: string;
  badge?: string;
  secondaryBadge?: string;
  audience: string;
  features: string[];
  condition: string;
  secondaryText: string;
  action: ReactNode;
  featured?: boolean;
};

const comparisonRows = [
  ["Fullständig rapport", "1 gång", "Dagens rapport", "Ja", "Ja", "Ja"],
  ["Dagliga rapporter", "Nej", "Nej", "Ja", "Ja", "Ja"],
  ["10 analysområden", "Ja", "Ja", "Ja", "Ja", "Ja"],
  ["Veckosammanfattning", "Nej", "Nej", "Ja", "Ja", "Ja"],
  ["Månadsutsikt", "Nej", "Nej", "Ja", "Ja", "Ja"],
  ["Arkivatkomst", "Nej", "Dagens rapport", "När tillgängligt", "När tillgängligt", "Ja"],
  ["E-postleverans", "Ja", "Ja", "Ja", "Ja", "Ja"],
  ["Flera mottagare", "Nej", "Nej", "Nej", "Nej", "Ja"],
  ["Engångsbetalning", "Nej", "Ja", "Nej", "Ja", "Vid behov"],
  ["Prenumeration", "Nej", "Nej", "Ja", "Nej", "Avtal"],
  ["Faktura", "Nej", "Nej", "Nej", "Nej", "Ja"],
];

const faqItems = [
  {
    question: "Är detta investeringsrådgivning?",
    answer:
      "Nej. Finansanalytik är marknadsanalys och informationsbearbetning, inte personlig investeringsrådgivning.",
  },
  {
    question: "Vad får jag i gratisrapporten?",
    answer:
      "Du får en fullständig rapport en gång via e-post, så att du kan bedöma kvaliteten innan du köper.",
  },
  {
    question: "Kan jag avsluta månadsaccess?",
    answer:
      "Ja, månadsaccess kan avslutas enligt köpvillkoren innan nästa period.",
  },
  {
    question: "Vad är skillnaden mellan Dagsrapport och Månadsaccess?",
    answer:
      "Dagsrapport ger tillgång till dagens rapport. Månadsaccess ger löpande dagliga rapporter under aktiv period.",
  },
  {
    question: "Varför välja Halvårsaccess?",
    answer:
      "Halvårsaccess ger samma löpande tillgång som Månadsaccess men till lägre effektiv månadskostnad.",
  },
];

function PlanCard({
  title,
  price,
  priceNote,
  badge,
  secondaryBadge,
  audience,
  features,
  condition,
  secondaryText,
  action,
  featured = false,
}: PlanCardProps) {
  return (
    <article
      className={[
        "flex min-h-[520px] flex-col border p-5 md:p-6",
        featured
          ? "border-emerald-300 bg-[#101821] shadow-[0_0_0_1px_rgba(52,211,153,0.35)]"
          : "border-[#26313d] bg-[#0d1117]",
      ].join(" ")}
    >
      <div className="flex min-h-8 flex-wrap items-center gap-2">
        {badge ? (
          <span className="border border-emerald-300 bg-emerald-300 px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-[#06100c]">
            {badge}
          </span>
        ) : null}
        {secondaryBadge ? (
          <span className="border border-[#3b4a58] px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-emerald-300">
            {secondaryBadge}
          </span>
        ) : null}
      </div>

      <h3 className="mt-5 text-2xl font-bold tracking-[-0.02em]">{title}</h3>
      <p className="mt-3 text-4xl font-black tracking-[-0.04em]">{price}</p>
      {priceNote ? (
        <p className="mt-2 text-sm font-bold leading-6 text-emerald-300">{priceNote}</p>
      ) : null}

      <p className="mt-5 text-sm font-bold leading-6 text-[#d7e1eb]">{audience}</p>

      <ul className="mt-5 space-y-3">
        {features.map((feature) => (
          <li key={feature} className="border-l-2 border-emerald-300/70 pl-3 text-sm leading-6 text-[#c7d1dd]">
            {feature}
          </li>
        ))}
      </ul>

      <p className="mt-5 border-t border-[#26313d] pt-4 text-sm font-bold leading-6 text-[#d7e1eb]">
        {condition}
      </p>
      <p className="mt-3 text-sm leading-6 text-[#8d9aaa]">{secondaryText}</p>

      <div className="mt-auto pt-6">{action}</div>
    </article>
  );
}

export function PricingSection({ primaryTopicSlug }: { primaryTopicSlug: string }) {
  return (
    <section id="pricing" className="border-b border-[#1a222c] py-10">
      <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.26em] text-[#7f91a7]">
            Priser
          </p>
          <h2 className="mt-2 max-w-3xl text-3xl font-bold tracking-[-0.03em] md:text-4xl">
            Välj hur du vill använda Finansanalytik
          </h2>
          <p className="mt-4 max-w-4xl text-base leading-7 text-[#c7d1dd]">
            Börja med en gratis rapport, köp tillgång för en dag eller välj längre access om du vill följa marknaden löpande.
          </p>
        </div>
        <p className="max-w-xl border border-[#26313d] bg-[#0d1117] p-4 text-sm font-bold leading-6 text-[#d7e1eb]">
          Alla rapporter bygger på primärkällor, regelstyrd analys och tydliga marknadssignaler. Inte investeringsrådgivning.
        </p>
      </div>

      <div className="mt-7 grid gap-4 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5">
        <PlanCard
          title="Gratisrapport"
          price="0 kr"
          audience="För dig som vill testa kvaliteten innan du köper."
          features={[
            "1 fullständig rapport via e-post",
            "10 analysområden",
            "Primärkällor och slutsatser",
            "Möjlighet att uppgradera efteråt",
          ]}
          condition="Endast en gratisrapport per e-postadress."
          secondaryText="Ingen betalning krävs."
          action={
            <a
              className="block border border-emerald-300/70 px-4 py-3 text-center text-sm font-black text-emerald-300 transition hover:bg-emerald-300 hover:text-[#06100c]"
              href="#gratis-rapport"
            >
              Få gratisrapport
            </a>
          }
        />

        <PlanCard
          title="Dagsrapport"
          price="49 kr"
          priceNote="moms ingår"
          audience="För dig som vill läsa dagens fulla analys utan abonnemang."
          features={[
            "Dagens kompletta marknadsbriefing",
            "10 analysområden",
            "Full analys, inte bara förhandsvisning",
            "Leverans via e-post",
            "Tillgång till dagens rapport",
          ]}
          condition="Gäller endast dagens rapport."
          secondaryText="Engångsbetalning. Ingen prenumeration."
          action={
            <CheckoutButton
              buttonLabel="Köp dagens rapport"
              priceLabel="49 kr"
              product="day_pass"
              productName="Dagsrapport"
              topicSlug={primaryTopicSlug}
            />
          }
        />

        <PlanCard
          title="Månadsaccess"
          price="249 kr/mån"
          priceNote="moms ingår"
          badge="Populärast"
          audience="För dig som vill följa marknaden varje dag och få löpande signaler."
          features={[
            "Dagliga fullständiga rapporter",
            "Veckosammanfattning",
            "Månadsutsikt med prognos",
            "E-postleverans",
            "Löpande tillgång under aktiv period",
          ]}
          condition="Avsluta när du vill."
          secondaryText="Bäst för löpande marknadsbevakning."
          action={
            <CheckoutButton
              buttonLabel="Starta månadsaccess"
              description="Du får dagliga fullständiga rapporter, veckosammanfattning och månadsutsikt via e-post under aktiv period."
              priceLabel="249 kr/mån"
              product="monthly_access"
              productName="Månadsaccess"
              topicSlug={primaryTopicSlug}
            />
          }
        />

        <PlanCard
          title="Halvårsaccess"
          price="1 199 kr"
          priceNote="för 6 månader, motsvarar 199 kr/mån, moms ingår"
          badge="Mest värde"
          secondaryBadge="Spara cirka 20%"
          audience="För dig som använder marknadsanalys regelbundet och vill ha lägre månadskostnad."
          features={[
            "Allt i Månadsaccess",
            "6 månaders tillgång",
            "Prioriterad e-postleverans",
            "Arkivatkomst när tillgängligt",
            "Lägre effektiv månadskostnad",
          ]}
          condition="Engångsbetalning för 6 månaders access."
          secondaryText="Spara cirka 20% jämfört med månadsaccess."
          featured
          action={
            <CheckoutButton
              buttonLabel="Välj halvårsaccess"
              description="Du får 6 månaders tillgång till Finansanalytik med dagliga rapporter, veckosammanfattning och månadsutsikt via e-post."
              priceLabel="1 199 kr"
              product="half_year_access"
              productName="Halvårsaccess"
              topicSlug={primaryTopicSlug}
            />
          }
        />

        <PlanCard
          title="Företag"
          price="Kontakta oss"
          audience="För företag, CFO:er, analytiker och mindre team som behöver flera mottagare."
          features={[
            "Flera användare eller mottagare",
            "Faktura vid behov",
            "Anpassad bevakning senare",
            "Leverans till flera mottagare",
            "Support för onboarding",
          ]}
          condition="Passar bolag, rådgivare och analysintensiva team."
          secondaryText="Vi sätter upp rätt form av företagsaccess efter behov."
          action={
            <Link
              className="block border border-[#26313d] px-4 py-3 text-center text-sm font-black text-white transition hover:border-emerald-300 hover:text-emerald-300"
              href="/kontakt?intent=team"
            >
              Boka företagsaccess
            </Link>
          }
        />
      </div>

      <div className="mt-8 border border-[#26313d] bg-[#0d1117] p-4 md:p-6">
        <h3 className="text-2xl font-bold tracking-[-0.02em]">Jämför alternativen</h3>
        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[980px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-[#26313d] text-[#d7e1eb]">
                <th className="py-3 pr-4 font-black">Ingår</th>
                <th className="px-4 py-3 font-black">Gratisrapport</th>
                <th className="px-4 py-3 font-black">Dagsrapport</th>
                <th className="px-4 py-3 font-black">Månadsaccess</th>
                <th className="px-4 py-3 font-black text-emerald-300">Halvårsaccess</th>
                <th className="pl-4 py-3 font-black">Företag</th>
              </tr>
            </thead>
            <tbody>
              {comparisonRows.map(([label, free, day, month, halfYear, business]) => (
                <tr key={label} className="border-b border-[#1a222c] last:border-b-0">
                  <td className="py-3 pr-4 font-bold text-[#d7e1eb]">{label}</td>
                  <td className="px-4 py-3 text-[#a8b5c4]">{free}</td>
                  <td className="px-4 py-3 text-[#a8b5c4]">{day}</td>
                  <td className="px-4 py-3 text-[#a8b5c4]">{month}</td>
                  <td className="px-4 py-3 font-bold text-[#d7e1eb]">{halfYear}</td>
                  <td className="pl-4 py-3 text-[#a8b5c4]">{business}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-5">
        {faqItems.map((item) => (
          <div key={item.question} className="border border-[#26313d] bg-[#0d1117] p-5">
            <h3 className="text-base font-black leading-6 text-white">{item.question}</h3>
            <p className="mt-3 text-sm leading-6 text-[#a8b5c4]">{item.answer}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
