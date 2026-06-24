import type { Metadata, Viewport } from "next";
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
    "Krain Studio produces RIBA Stage 4–5 packages — construction-stage drawings, details and specs you can build to with confidence.",
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
  metadataBase: new URL("https://www.krain.studio"),
  openGraph: {
    title: "Krain Studio — Detailed construction design",
    description:
      "RIBA Stage 4–5 construction packages — drawings you can build to with confidence.",
    type: "website",
    url: "https://www.krain.studio",
    siteName: "Krain Studio",
    images: [{ url: "/krain/og-default.png", width: 1200, height: 630, alt: "Krain Studio — Detailed construction design" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Krain Studio — Detailed construction design",
    description:
      "RIBA Stage 4–5 construction packages — drawings you can build to with confidence.",
    images: ["/krain/og-default.png"],
  },
};

export const viewport: Viewport = {
  themeColor: "#ece7dd",
  colorScheme: "light",
  width: "device-width",
  initialScale: 1,
  // Lets the dark manifesto / footer / CTA bands run edge-to-edge under the
  // notch; safe-area-inset padding is applied where content touches the edge.
  // Zoom is intentionally left enabled (no maximumScale/userScalable) for a11y.
  viewportFit: "cover",
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
