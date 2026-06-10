import type { Metadata } from "next";
import { Ticker } from "@/components/home/Ticker";
import { Header } from "@/components/home/Header";
import { ContactBand } from "@/components/home/ContactBand";
import { Footer } from "@/components/home/Footer";
import { Journal } from "@/components/home/Journal";
import { PUBLISHED } from "@/components/journal/content";
import { palette } from "@/lib/tokens";
import { SITE, organization, blog } from "@/lib/schema";

const MONO = "var(--font-geist-mono), ui-monospace, monospace";
const SANS = "var(--font-geist), sans-serif";

export const metadata: Metadata = {
  title: "Journal — Notes on technical drawing, detailing & coordination | Krain Studio",
  description:
    "Field notes and technical guides on construction-stage drawings, schedules, detailing and drawing coordination from Krain Studio.",
  alternates: { canonical: `${SITE}/journal` },
  openGraph: {
    title: "Journal — Krain Studio",
    description:
      "Field notes and technical guides on construction-stage drawings, schedules, detailing and drawing coordination.",
    type: "website",
    url: `${SITE}/journal`,
    siteName: "Krain Studio",
    images: [{ url: `${SITE}/krain/og-default.png`, width: 1200, height: 630, alt: "Krain Studio — Journal" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Journal — Krain Studio",
    description:
      "Field notes and technical guides on construction-stage drawings, schedules, detailing and drawing coordination.",
    images: [`${SITE}/krain/og-default.png`],
  },
};

export default function JournalIndexPage() {
  const blogNode = {
    ...blog,
    blogPost: PUBLISHED.map((e) => ({
      "@type": "BlogPosting",
      "@id": `${SITE}/journal/${e.slug}#article`,
      headline: e.title,
      url: `${SITE}/journal/${e.slug}`,
      datePublished: e.publishedISO ?? e.dateISO,
    })),
  };
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      blogNode,
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: `${SITE}/` },
          { "@type": "ListItem", position: 2, name: "Journal" },
        ],
      },
      organization,
    ],
  };

  return (
    <main style={{ position: "relative", minHeight: "100vh", overflow: "hidden" }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <Ticker />
      <Header />

      <div
        style={{
          position: "relative",
          zIndex: 2,
          padding: "clamp(56px, 8vw, 100px) clamp(16px, 5vw, 32px) 24px",
          maxWidth: 1100,
          margin: "0 auto",
        }}
      >
        <div
          style={{
            fontFamily: MONO,
            fontSize: 11,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: palette.accent,
            marginBottom: 24,
          }}
        >
          Journal
        </div>
        <h1
          style={{
            fontFamily: SANS,
            fontWeight: 200,
            fontSize: "clamp(36px, 6.5vw, 68px)",
            letterSpacing: "-0.04em",
            lineHeight: 1.02,
            margin: "0 0 24px",
          }}
        >
          Notes from the drawing board
        </h1>
        <p style={{ fontSize: 18, lineHeight: 1.6, opacity: 0.85, maxWidth: 720 }}>
          Practical writing on construction-stage drawings — detailing, schedules, coordination and the
          small errors that become site problems.
        </p>
      </div>

      <Journal embedded entries={PUBLISHED} />

      <ContactBand />
      <Footer />
    </main>
  );
}
