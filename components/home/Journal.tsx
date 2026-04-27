"use client";

import { useState } from "react";
import { palette } from "@/lib/tokens";
import { AnimLink } from "@/components/ui/AnimLink";

const ENTRIES: Array<[string, string, string]> = [
  ["Feb 2026", "On drawing what cannot be photographed", "Essay · 8 min"],
  ["Feb 2026", "A short defence of the section", "Note · 4 min"],
  ["Jan 2026", "EPDM, in three positions", "Detail study · 6 min"],
];

function JournalCard({ d, t, m }: { d: string; t: string; m: string }) {
  const [hover, setHover] = useState(false);
  return (
    <a
      href="#"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: "block",
        textDecoration: "none",
        color: palette.ink,
        borderTop: `1px solid ${hover ? palette.accent : palette.rule}`,
        paddingTop: 24,
        position: "relative",
        transition: "border-color .35s",
      }}
    >
      <div
        style={{
          fontSize: 11,
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          opacity: 0.55,
          fontFamily: "var(--font-geist-mono), ui-monospace, monospace",
        }}
      >
        {d} · {m}
      </div>
      <div
        style={{
          fontFamily: "var(--font-geist), sans-serif",
          fontSize: 26,
          lineHeight: 1.18,
          marginTop: 16,
          fontWeight: 300,
          letterSpacing: "-0.01em",
          transform: hover ? "translateX(8px)" : "translateX(0)",
          transition: "transform .45s cubic-bezier(.2,.7,.2,1)",
        }}
      >
        {t}
      </div>
      <div
        style={{
          fontSize: 12,
          marginTop: 18,
          color: palette.accent,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          opacity: hover ? 1 : 0.7,
          transition: "opacity .35s",
          fontFamily: "var(--font-geist-mono), ui-monospace, monospace",
        }}
      >
        Read →
      </div>
    </a>
  );
}

export function Journal() {
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
            fontFamily: "var(--font-geist), sans-serif",
            fontWeight: 200,
            fontSize: "clamp(40px, 7vw, 64px)",
            margin: 0,
            letterSpacing: "-0.04em",
          }}
        >
          Journal
        </h2>
        <AnimLink
          href="#"
          color={palette.accent}
          style={{
            fontSize: 12,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            fontFamily: "var(--font-geist-mono), ui-monospace, monospace",
          }}
        >
          All entries →
        </AnimLink>
      </div>
      <div
        className="krain-journal-grid"
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 24 }}
      >
        {ENTRIES.map(([d, t, m], i) => (
          <JournalCard key={i} d={d} t={t} m={m} />
        ))}
      </div>
      <style>{`
        @media (max-width: 900px) {
          .krain-journal-grid { grid-template-columns: 1fr !important; gap: 32px !important; }
        }
      `}</style>
    </section>
  );
}
