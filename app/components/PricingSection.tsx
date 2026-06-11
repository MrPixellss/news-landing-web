"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useEffect, useRef } from "react";

import { CheckoutButton } from "./CheckoutButton";
import { trackProductEvent } from "../lib/tracking";

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
  muted?: boolean;
};

const faqItems = [
  {
    question: "Hur levereras rapporten?",
    answer:
      "Rapporten skickas via e-post med länk till dagens fullständiga analys.",
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
      "Dagsrapport gäller dagens analys. Månadsaccess är för dig som vill följa marknadsbilden löpande.",
  },
  {
    question: "Varför välja Halvårsaccess?",
    answer:
      "Halvårsaccess passar om du redan vet att du vill följa rapporterna över längre tid.",
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
  muted = false,
}: PlanCardProps) {
  return (
    <article
      className={[
        "flex min-h-[520px] flex-col border p-5 md:p-6",
        featured
          ? "border-emerald-300 bg-[#101821] shadow-[0_0_0_1px_rgba(52,211,153,0.35)]"
          : muted
            ? "border-[#1f2934] bg-[#0b0f14]"
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
  const sectionRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const node = sectionRef.current;
    if (!node) {
      return;
    }

    let tracked = false;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!tracked && entry?.isIntersecting) {
          tracked = true;
          trackProductEvent("pricing_view", {
            source: "pricing",
          });
          observer.disconnect();
        }
      },
      { threshold: 0.35 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} id="pricing" className="border-b border-[#1a222c] py-10">
      <div>
        <div className="max-w-4xl">
          <p className="text-[11px] font-bold uppercase tracking-[0.26em] text-[#7f91a7]">
            Priser
          </p>
          <h2 className="mt-2 max-w-3xl text-3xl font-bold tracking-[-0.03em] md:text-4xl">
            Börja gratis, följ marknaden löpande när du är redo
          </h2>
          <p className="mt-4 max-w-4xl text-base leading-7 text-[#c7d1dd]">
            Gratisrapporten visar kvaliteten. Månadsaccess är enklaste vägen att
            få marknadsbilden varje morgon. Halvårsaccess ger lägre
            månadskostnad för dig som vill följa marknaden löpande. Alla
            rapporter bygger på primärkällor och regelstyrd analys.
          </p>
        </div>
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
              onClick={() =>
                trackProductEvent("free_report_pricing_click", {
                  source: "pricing",
                  product: "free_report",
                })
              }
            >
              Få gratisrapport
            </a>
          }
        />

        <PlanCard
          title="Månadsaccess"
          price="249 kr/mån"
          priceNote="moms ingår"
          badge="Bäst att börja med"
          audience="För dig som vill få marknadsbilden varje morgon utan att binda upp dig."
          features={[
            "Dagliga fullständiga rapporter",
            "Veckosammanfattning",
            "Månadsutsikt",
            "E-postleverans",
            "Avsluta när du vill",
          ]}
          condition="Prenumeration månadsvis. Avsluta inför nästa period."
          secondaryText="Huvudvägen för löpande marknadsöverblick."
          featured
          action={
            <CheckoutButton
              buttonLabel="Starta månadsaccess"
              description="Du får dagliga fullständiga rapporter, veckosammanfattning och månadsutsikt via e-post under aktiv period."
              onOpen={() =>
                trackProductEvent("monthly_click", {
                  product: "monthly_access",
                  productName: "Månadsaccess",
                  priceLabel: "249 kr/mån",
                  topicSlug: primaryTopicSlug,
                  source: "pricing",
                })
              }
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
          priceNote="för 6 månader, moms ingår"
          badge="Mest värde"
          secondaryBadge="Spara cirka 20%"
          audience="För dig som vill följa marknaden löpande och få lägre effektiv månadskostnad."
          features={[
            "Allt i Månadsaccess",
            "6 månaders tillgång",
            "Lägre effektiv månadskostnad",
            "Prioriterad e-postleverans",
            "Samma rapportflöde under hela perioden",
          ]}
          condition="Engångsbetalning för 6 månaders access."
          secondaryText="Value-offer för dig som redan vet att du vill följa rapporterna löpande."
          action={
            <CheckoutButton
              buttonLabel="Välj halvårsaccess"
              description="Du får 6 månaders tillgång till Finansanalytik med dagliga rapporter, veckosammanfattning och månadsutsikt via e-post."
              onOpen={() =>
                trackProductEvent("halfyear_click", {
                  product: "half_year_access",
                  productName: "Halvårsaccess",
                  priceLabel: "1 199 kr",
                  topicSlug: primaryTopicSlug,
                  source: "pricing",
                })
              }
              priceLabel="1 199 kr"
              product="half_year_access"
              productName="Halvårsaccess"
              topicSlug={primaryTopicSlug}
            />
          }
        />

        <PlanCard
          title="Dagsrapport"
          price="49 kr"
          priceNote="moms ingår"
          audience="För dig som bara vill läsa dagens rapport en gång."
          features={[
            "Dagens kompletta marknadsbriefing",
            "10 analysområden",
            "Full analys, inte bara förhandsvisning",
            "Leverans via e-post",
            "Ingen prenumeration",
          ]}
          condition="Gäller endast dagens rapport."
          secondaryText="Fallback för engångsläsning."
          muted
          action={
            <CheckoutButton
              buttonClassName="mt-5 w-full border border-[#26313d] bg-[#111820] px-5 py-4 text-sm font-black text-[#d7e1eb] transition hover:border-emerald-300 hover:text-emerald-300 disabled:cursor-wait disabled:opacity-70"
              buttonLabel="Köp dagens rapport"
              onOpen={() =>
                trackProductEvent("daypass_click", {
                  product: "day_pass",
                  productName: "Dagsrapport",
                  priceLabel: "49 kr",
                  topicSlug: primaryTopicSlug,
                  source: "pricing",
                })
              }
              priceLabel="49 kr"
              product="day_pass"
              productName="Dagsrapport"
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
