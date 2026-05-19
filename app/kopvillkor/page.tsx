import type { Metadata } from "next";
import { LegalMarkdownPage } from "../components/LegalMarkdownPage";

export const metadata: Metadata = {
  title: "Köpvillkor | Finansanalytik",
};

export default function KopvillkorPage() {
  return <LegalMarkdownPage fileName="01-kopvillkor.md" />;
}
