"use client";

import { useState } from "react";
import { palette } from "@/lib/tokens";
import { AnimLink } from "@/components/ui/AnimLink";
import type { JournalEntry } from "@/lib/journal";

const MONO = "var(--font-geist-mono), ui-monospace, monospace";
const SANS = "var(--font-geist), sans-serif";

function FeaturedCard({ entry }: { entry: JournalEntry }) {
  const [hover, setHover] = useState(false);
  return (
    <a
      href={`/journal/${entry.slug}`}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: "block",
        textDecoration: "none",
        color: palette.ink,
        borderTop: `1px solid ${hover ? palette.accent : palette.rule}`,
        paddingTop: 28,
        transition: "border-color .35s",
      }}
    >
      <div
        style={{
          fontFamily: MONO,
          fontSize: 11,
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          opacity: 0.55,
          marginBottom: 18,
        }}
      >
        {entry.date} · {entry.kind} · {entry.readingTime}
      </div>
      <div
        style={{
          fontFamily: SANS,
          fontSize: "clamp(28px, 4.4vw, 44px)",
          lineHeight: 1.1,
          fontWeight: 300,
          letterSpacing: "-0.025em",
          maxWidth: 860,
          transform: hover ? "translateX(8px)" : "translateX(0)",
          transition: "transform .45s cubic-bezier(.2,.7,.2,1)",
        }}
      >
        {entry.title}
      </div>
      <p
        style={{
          fontSize: 16.5,
          lineHeight: 1.6,
          opacity: 0.78,
          maxWidth: 660,
          margin: "20px 0 0",
        }}
      >
        {entry.excerpt}
      </p>
      <div
        style={{
          fontFamily: MONO,
          fontSize: 12,
          marginTop: 24,
          color: palette.accent,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          opacity: hover ? 1 : 0.7,
          transition: "opacity .35s",
        }}
      >
        Read →
      </div>
    </a>
  );
}

function CompactCard({ entry }: { entry: JournalEntry }) {
  const [hover, setHover] = useState(false);
  return (
    <a
      href={`/journal/${entry.slug}`}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: "block",
        textDecoration: "none",
        color: palette.ink,
        borderTop: `1px solid ${hover ? palette.accent : palette.rule}`,
        paddingTop: 24,
        transition: "border-color .35s",
      }}
    >
      <div
        style={{
          fontFamily: MONO,
          fontSize: 11,
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          opacity: 0.55,
        }}
      >
        {entry.date} · {entry.readingTime}
      </div>
      <div
        style={{
          fontFamily: SANS,
          fontSize: 26,
          lineHeight: 1.18,
          marginTop: 16,
          fontWeight: 300,
          letterSpacing: "-0.01em",
          transform: hover ? "translateX(8px)" : "translateX(0)",
          transition: "transform .45s cubic-bezier(.2,.7,.2,1)",
        }}
      >
        {entry.title}
      </div>
      <div
        style={{
          fontFamily: MONO,
          fontSize: 12,
          marginTop: 18,
          color: palette.accent,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          opacity: hover ? 1 : 0.7,
          transition: "opacity .35s",
        }}
      >
        Read →
      </div>
    </a>
  );
}

export function Journal({ entries }: { entries: JournalEntry[] }) {
  const [featured, ...rest] = entries;
  if (!featured) return null;

  return (
    <section id="journal" style={{ padding: "60px 32px 120px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          marginBottom: 40,
          gap: 16,
          flexWrap: "wrap",
        }}
      >
        <h2
          style={{
            fontFamily: SANS,
            fontWeight: 200,
            fontSize: "clamp(40px, 7vw, 64px)",
            margin: 0,
            letterSpacing: "-0.04em",
          }}
        >
          Journal
        </h2>
        <AnimLink
          href="/journal"
          color={palette.accent}
          style={{
            fontFamily: MONO,
            fontSize: 12,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
          }}
        >
          All entries →
        </AnimLink>
      </div>

      <FeaturedCard entry={featured} />

      {rest.length > 0 && (
        <div
          className="krain-journal-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 24,
            marginTop: 56,
          }}
        >
          {rest.map((entry) => (
            <CompactCard key={entry.slug} entry={entry} />
          ))}
        </div>
      )}

      <style>{`
        @media (max-width: 900px) {
          .krain-journal-grid { grid-template-columns: 1fr !important; gap: 32px !important; }
        }
      `}</style>
    </section>
  );
}
