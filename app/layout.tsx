import type { Metadata } from "next";
import { CookieConsent } from "./components/CookieConsent";
import { SiteFooter } from "./components/SiteFooter";
import "./globals.css";

export const metadata: Metadata = {
  title: "Daglig finansiell analys",
  description: "Regelstyrd marknadsanalys byggd på sparade primärkällor.",
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
