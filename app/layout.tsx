import type { Metadata } from "next";
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
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
