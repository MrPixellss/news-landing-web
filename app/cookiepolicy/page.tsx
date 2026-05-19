import type { Metadata } from "next";
import { LegalMarkdownPage } from "../components/LegalMarkdownPage";

export const metadata: Metadata = {
  title: "Cookiepolicy | Finansanalytik",
};

export default function CookiepolicyPage() {
  return <LegalMarkdownPage fileName="03-cookiepolicy.md" />;
}
