import type { Metadata } from "next";
import { Ticker } from "@/components/home/Ticker";
import { Header } from "@/components/home/Header";
import { ContactBand } from "@/components/home/ContactBand";
import { Footer } from "@/components/home/Footer";
import { PUBLISHED } from "@/components/journal/content";
import { palette } from "@/lib/tokens";

const MONO = "var(--font-geist-mono), ui-monospace, monospace";
const SANS = "var(--font-geist), sans-serif";

export const metadata: Metadata = {
  title: "Journal — Notes on technical drawing, detailing & coordination | Krain Studio",
  description:
    "Field notes and technical guides on construction-stage drawings, schedules, detailing and drawing coordination from Krain Studio.",
  alternates: { canonical: "https://www.krain.studio/journal" },
};

export default function JournalIndexPage() {
  return (
    <main style={{ position: "relative", minHeight: "100vh", overflow: "hidden" }}>
      <Ticker />
      <Header />

      <div
        style={{
          position: "relative",
          zIndex: 2,
          padding: "clamp(56px, 8vw, 100px) 32px 24px",
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

      <div
        style={{
          position: "relative",
          zIndex: 2,
          padding: "32px 32px 96px",
          maxWidth: 1100,
          margin: "0 auto",
        }}
      >
        {PUBLISHED.map((entry) => (
          <a
            key={entry.slug}
            href={`/journal/${entry.slug}`}
            style={{
              display: "block",
              textDecoration: "none",
              color: palette.ink,
              borderTop: `1px solid ${palette.rule}`,
              padding: "32px 0",
            }}
          >
            <div
              style={{
                fontFamily: MONO,
                fontSize: 11,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                opacity: 0.55,
                marginBottom: 16,
              }}
            >
              {entry.date} · {entry.kind} · {entry.readingTime}
            </div>
            <div
              style={{
                fontFamily: SANS,
                fontSize: "clamp(26px, 4vw, 38px)",
                fontWeight: 300,
                letterSpacing: "-0.02em",
                lineHeight: 1.12,
                marginBottom: 16,
                maxWidth: 860,
              }}
            >
              {entry.title}
            </div>
            <p style={{ fontSize: 16, lineHeight: 1.6, opacity: 0.78, maxWidth: 680, margin: "0 0 18px" }}>
              {entry.excerpt}
            </p>
            <span
              style={{
                fontFamily: MONO,
                fontSize: 12,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: palette.accent,
              }}
            >
              Read →
            </span>
          </a>
        ))}
      </div>

      <ContactBand />
      <Footer />
    </main>
  );
}
