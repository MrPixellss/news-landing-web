import type { Metadata } from "next";
import { LegalMarkdownPage } from "../components/LegalMarkdownPage";

export const metadata: Metadata = {
  title: "Integritetspolicy | Finansanalytik",
};

export default function IntegritetspolicyPage() {
  return <LegalMarkdownPage fileName="02-integritetspolicy.md" />;
}
