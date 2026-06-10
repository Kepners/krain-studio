"use client";

import { useState } from "react";
import { palette } from "@/lib/tokens";
import { AnimLink } from "@/components/ui/AnimLink";

const SERVICES: Array<[string, string, string]> = [
  ["A", "Technical CAD production", "AutoCAD 2D working drawings, general arrangements, construction information and drawing updates."],
  ["B", "Construction details", "1:5 and 1:10 details for junctions, thresholds, eaves, openings, walls, floors and site-specific conditions."],
  ["C", "Stage 4 / 5 documentation", "Technical design, construction information, drawing packages and coordinated issue sets."],
  ["D", "Building Control drawing support", "Drawing support for Building Regulations, warranty and technical package requirements — this does not replace the architect, engineer, warranty provider or Building Control body."],
  ["E", "Drawing audits & buildability reviews", "Checks for missing information, conflicting references, unclear details, schedule issues and coordination gaps."],
  ["F", "Site and query support", "Technical mark-ups, clarification notes, RFI support and action lists to help teams understand what needs resolving."],
];

function ServiceCard({ k, t, d, i }: { k: string; t: string; d: string; i: number }) {
  const [hover, setHover] = useState(false);
  return (
    <a
      href="/services"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        padding: 24,
        borderRadius: 8,
        color: palette.ink,
        textDecoration: "none",
        background: hover ? "rgba(255,77,110,0.08)" : "rgba(26,29,51,0.04)",
        border: `1px solid ${hover ? palette.accent + "88" : palette.rule}`,
        minHeight: 200,
        display: "flex",
        flexDirection: "column",
        transform: hover ? "translateY(-4px)" : "translateY(0)",
        transition:
          "transform .35s cubic-bezier(.2,.7,.2,1), background .35s, border-color .35s, box-shadow .35s",
        boxShadow: hover
          ? `0 24px 60px rgba(0,0,0,.18), 0 0 0 1px ${palette.accent}33`
          : "none",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-geist), sans-serif",
            fontWeight: 200,
            fontSize: 56,
            letterSpacing: "-0.04em",
            lineHeight: 1,
            color: palette.accent,
            transform: hover ? "translateY(-2px)" : "translateY(0)",
            transition: "transform .35s",
          }}
        >
          {k}
        </span>
        <span
          style={{
            fontSize: 10,
            letterSpacing: "0.14em",
            opacity: 0.45,
            fontFamily: "var(--font-geist-mono), ui-monospace, monospace",
          }}
        >
          0{i + 1}/06
        </span>
      </div>
      <div style={{ marginTop: "auto" }}>
        <div
          style={{
            fontFamily: "var(--font-geist), sans-serif",
            fontSize: 22,
            fontWeight: 400,
            letterSpacing: "-0.01em",
            transform: hover ? "translateX(4px)" : "translateX(0)",
            transition: "transform .35s",
          }}
        >
          {t}
        </div>
        <div style={{ fontSize: 13, opacity: 0.6, marginTop: 6 }}>{d}</div>
        <div
          className="krain-learn"
          style={{
            fontSize: 11,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: palette.accent,
            marginTop: 14,
            opacity: hover ? 1 : 0,
            transform: hover ? "translateX(0)" : "translateX(-8px)",
            transition: "opacity .35s, transform .35s",
            fontFamily: "var(--font-geist-mono), ui-monospace, monospace",
          }}
        >
          Learn more →
        </div>
      </div>
    </a>
  );
}

export function Services() {
  return (
    <section id="services" style={{ padding: "clamp(80px, 12vw, 120px) clamp(16px, 5vw, 32px)" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          gap: 24,
          flexWrap: "wrap",
          marginBottom: 48,
        }}
      >
        <div>
          <h2
            style={{
              fontFamily: "var(--font-geist), sans-serif",
              fontWeight: 200,
              fontSize: "clamp(40px, 7vw, 64px)",
              margin: 0,
              letterSpacing: "-0.04em",
            }}
          >
            Services
          </h2>
          <p
            style={{
              fontFamily: "var(--font-geist-mono), ui-monospace, monospace",
              fontSize: 12,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: palette.inkSoft,
              margin: "14px 0 0",
              maxWidth: 540,
            }}
          >
            Freelance architectural technology — drawings, audits, site-issue resolution.
          </p>
        </div>
        <AnimLink
          href="/services"
          color={palette.accent}
          style={{
            fontSize: 12,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            fontFamily: "var(--font-geist-mono), ui-monospace, monospace",
          }}
        >
          Full services →
        </AnimLink>
      </div>
      <div
        className="krain-services-grid"
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}
      >
        {SERVICES.map(([k, t, d], i) => (
          <ServiceCard key={k} k={k} t={t} d={d} i={i} />
        ))}
      </div>

      <style>{`
        @media (max-width: 900px) {
          .krain-services-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 600px) {
          .krain-services-grid { grid-template-columns: 1fr !important; }
        }
        /* Touch devices never hover — keep the "Learn more" affordance visible */
        @media (hover: none) {
          .krain-learn { opacity: 1 !important; transform: translateX(0) !important; }
        }
      `}</style>
    </section>
  );
}
