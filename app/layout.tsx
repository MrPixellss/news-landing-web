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
    "Daglig svensk marknadsbrief med makro, räntor, börs, valutor, råvaror och riskbild samlat i en kort rapport baserad på primärkällor.",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-48.png", sizes: "48x48", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  openGraph: {
    type: "website",
    locale: "sv_SE",
    siteName: "Finansanalytik",
    url: "https://finansanalytik.com",
    title: "Finansanalytik - daglig marknadsanalys för Sverige",
    description:
      "Daglig svensk marknadsbrief med makro, räntor, börs, valutor, råvaror och riskbild samlat i en kort rapport.",
    images: [
      {
        url: "/og-finansanalytik.png",
        width: 1200,
        height: 630,
        alt: "Finansanalytik daglig marknadsanalys",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Finansanalytik - daglig marknadsanalys för Sverige",
    description:
      "Daglig svensk marknadsbrief med makro, räntor, börs, valutor, råvaror och riskbild samlat i en kort rapport.",
    images: ["/og-finansanalytik.png"],
  },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Finansanalytik",
  url: "https://finansanalytik.com",
  logo: "https://finansanalytik.com/icon-512.png",
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Finansanalytik",
  url: "https://finansanalytik.com",
  publisher: {
    "@type": "Organization",
    name: "Finansanalytik",
    logo: "https://finansanalytik.com/icon-512.png",
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
      </body>
    </html>
  );
}
