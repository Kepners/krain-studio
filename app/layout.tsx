import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geist = Geist({
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700"],
  variable: "--font-geist",
  display: "swap",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-geist-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Krain Studio — Detailed construction design",
  description:
    "Krain is a small office producing RIBA Stage 4–5 packages — construction-stage drawings, details, and specs that turn a planning permission into a buildable thing.",
  keywords: [
    "architecture",
    "construction drawings",
    "RIBA Stage 4",
    "RIBA Stage 5",
    "technical design",
    "building details",
    "NHBC specification",
    "Biggleswade architect",
    "Bedfordshire architect",
  ],
  metadataBase: new URL("https://krain.studio"),
  openGraph: {
    title: "Krain Studio — Detailed construction design",
    description:
      "RIBA Stage 4–5 construction packages. Drawings that turn permission into a buildable thing without a clipboard of RFIs.",
    type: "website",
    url: "https://krain.studio",
    siteName: "Krain Studio",
  },
  twitter: {
    card: "summary_large_image",
    title: "Krain Studio — Detailed construction design",
    description:
      "RIBA Stage 4–5 construction packages. Drawings that turn permission into a buildable thing.",
  },
};

export const viewport = {
  themeColor: "#ece7dd",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geist.variable} ${geistMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
