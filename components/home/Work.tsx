"use client";

import Image from "next/image";
import { palette } from "@/lib/tokens";
import { AnimLink } from "@/components/ui/AnimLink";

type WorkItem = {
  name: string;
  year: string;
  loc: string;
  sheet: string;
  label: string;
  img: string;
};

const PROJECTS: WorkItem[] = [
  {
    name: "Maple Court",
    year: "2026",
    loc: "London",
    sheet: "WIN-04",
    label: "window elevations · maple court",
    img: "/krain/work-audit.png",
  },
  {
    name: "Eastgate Mews",
    year: "2025",
    loc: "Hillingdon",
    sheet: "DET-12",
    label: "details · eastgate mews",
    img: "/krain/work-section.png",
  },
  {
    name: "Parkside House Types",
    year: "2025",
    loc: "Home Counties",
    sheet: "WD-07",
    label: "working drawings · parkside",
    img: "/krain/hero.png",
  },
  {
    name: "Meadowbrook Phase 4",
    year: "2025",
    loc: "Milton Keynes",
    sheet: "GA-147",
    label: "setting out · plot 147",
    img: "/krain/work-audit.png",
  },
  {
    name: "Rowan Drive",
    year: "2026",
    loc: "St Albans",
    sheet: "PD-16",
    label: "planning · rowan drive",
    img: "/krain/work-section.png",
  },
];

function WorkCard({ p }: { p: WorkItem }) {
  return (
    <a href="#" className="krain-work-card" style={{ flex: "0 0 auto", width: 440, maxWidth: "82vw", textDecoration: "none", color: palette.ink }}>
      <div
        style={{
          position: "relative",
          width: "100%",
          aspectRatio: "4/3",
          borderRadius: 8,
          overflow: "hidden",
          background: palette.bg,
          boxShadow: `0 30px 80px rgba(26,29,51,.18), 0 0 0 1px ${palette.rule}`,
        }}
      >
        <Image
          src={p.img}
          alt={`Technical drawing — ${p.name}`}
          fill
          sizes="440px"
          style={{ objectFit: "cover", mixBlendMode: "multiply" }}
        />
        <span
          style={{
            position: "absolute",
            top: 14,
            left: 14,
            fontFamily: "var(--font-geist-mono), ui-monospace, monospace",
            fontSize: 10,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: palette.inkSoft,
            opacity: 0.75,
          }}
        >
          [ {p.label} ]
        </span>
        <span
          style={{
            position: "absolute",
            bottom: 14,
            right: 14,
            fontFamily: "var(--font-geist-mono), ui-monospace, monospace",
            fontSize: 10,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: palette.inkSoft,
            opacity: 0.5,
          }}
        >
          {p.sheet}
        </span>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: 16, gap: 16 }}>
        <span style={{ fontFamily: "var(--font-geist), sans-serif", fontSize: 20, fontWeight: 300, letterSpacing: "-0.01em" }}>
          {p.name}
        </span>
        <span
          style={{
            fontSize: 11,
            opacity: 0.55,
            letterSpacing: "0.1em",
            fontFamily: "var(--font-geist-mono), ui-monospace, monospace",
            textTransform: "uppercase",
            whiteSpace: "nowrap",
          }}
        >
          {p.year} · {p.loc.toUpperCase()}
        </span>
      </div>
    </a>
  );
}

export function Work() {
  const loop = [...PROJECTS, ...PROJECTS];

  return (
    <section id="work" style={{ position: "relative", zIndex: 2, padding: "120px 0" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          marginBottom: 48,
          gap: 16,
          flexWrap: "wrap",
          padding: "0 32px",
        }}
      >
        <h2 style={{ fontFamily: "var(--font-geist), sans-serif", fontWeight: 200, fontSize: "clamp(40px, 7vw, 64px)", margin: 0, letterSpacing: "-0.04em" }}>
          Selected work
        </h2>
        <AnimLink
          href="#"
          color={palette.accent}
          style={{ fontSize: 12, letterSpacing: "0.16em", textTransform: "uppercase", fontFamily: "var(--font-geist-mono), ui-monospace, monospace" }}
        >
          All projects →
        </AnimLink>
      </div>

      <div
        className="krain-marquee"
        aria-label="Selected work — scrolling gallery"
        style={{
          overflow: "hidden",
          WebkitMaskImage: "linear-gradient(90deg, transparent, #000 7%, #000 93%, transparent)",
          maskImage: "linear-gradient(90deg, transparent, #000 7%, #000 93%, transparent)",
        }}
      >
        <div className="krain-marquee-track" style={{ display: "flex", gap: 28, width: "max-content" }}>
          {loop.map((p, i) => (
            <WorkCard key={i} p={p} />
          ))}
        </div>
      </div>

      <p
        style={{
          fontFamily: "var(--font-geist-mono), ui-monospace, monospace",
          fontSize: 12,
          lineHeight: 1.6,
          letterSpacing: "0.02em",
          color: palette.inkSoft,
          opacity: 0.85,
          maxWidth: 660,
          margin: "44px 0 0",
          padding: "0 32px",
        }}
      >
        Examples are anonymised or representative — live client names, project
        locations, title blocks and original drawings are not published.
      </p>

      <style>{`
        .krain-marquee-track {
          animation: krain-marquee 55s linear infinite;
        }
        .krain-marquee:hover .krain-marquee-track {
          animation-play-state: paused;
        }
        .krain-work-card { transition: opacity .35s ease; }
        .krain-marquee:hover .krain-work-card { opacity: 0.5; }
        .krain-marquee .krain-work-card:hover { opacity: 1; }
        @keyframes krain-marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        @media (max-width: 700px) {
          .krain-marquee-track { animation-duration: 40s; }
        }
        @media (prefers-reduced-motion: reduce) {
          .krain-marquee { overflow-x: auto; }
          .krain-marquee-track { animation: none; }
        }
      `}</style>
    </section>
  );
}
