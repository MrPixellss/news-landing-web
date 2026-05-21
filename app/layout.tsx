import type { Metadata } from "next";
import { CookieConsent } from "./components/CookieConsent";
import { SiteFooter } from "./components/SiteFooter";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://finansanalytik.com"),
  applicationName: "Finansanalytik",
  title: {
    default: "Finansanalytik - daglig marknadsanalys för Sverige",
    template: "%s | Finansanalytik",
  },
  description:
    "AI-stödd svensk marknadsanalys med dagliga rapporter, sparade primärkällor och regelstyrd analys för makro, räntor, aktier, valutor och risk.",
  openGraph: {
    type: "website",
    locale: "sv_SE",
    siteName: "Finansanalytik",
    url: "https://finansanalytik.com",
    title: "Finansanalytik - daglig marknadsanalys för Sverige",
    description:
      "Dagliga svenska marknadsbriefings baserade på primärkällor, nyhetsflöden och regelstyrd analys.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Finansanalytik - daglig marknadsanalys för Sverige",
    description:
      "Dagliga svenska marknadsbriefings baserade på primärkällor, nyhetsflöden och regelstyrd analys.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="sv" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <div className="flex min-h-screen flex-col">
          <div className="flex-1">{children}</div>
          <SiteFooter />
        </div>
        <CookieConsent />
      </body>
    </html>
  );
}
