import type { ReactNode } from "react";
import { palette } from "@/lib/tokens";

const MONO = "var(--font-geist-mono), ui-monospace, monospace";
const SANS = "var(--font-geist), sans-serif";

const MEASURE = 720;

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
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
      {children}
    </div>
  );
}

export function Lead({ children }: { children: ReactNode }) {
  return (
    <p
      style={{
        fontFamily: SANS,
        fontSize: 21,
        lineHeight: 1.5,
        letterSpacing: "-0.01em",
        maxWidth: MEASURE,
        color: palette.ink,
        opacity: 0.92,
        margin: "0 0 24px",
      }}
    >
      {children}
    </p>
  );
}

export function P({ children }: { children: ReactNode }) {
  return (
    <p
      style={{
        fontSize: 16.5,
        lineHeight: 1.7,
        maxWidth: MEASURE,
        opacity: 0.82,
        margin: "0 0 18px",
      }}
    >
      {children}
    </p>
  );
}

export function H2({ children, id }: { children: ReactNode; id?: string }) {
  return (
    <h2
      id={id}
      style={{
        fontFamily: SANS,
        fontWeight: 300,
        fontSize: "clamp(26px, 3.6vw, 38px)",
        letterSpacing: "-0.03em",
        lineHeight: 1.1,
        margin: "64px 0 22px",
        scrollMarginTop: 96,
        maxWidth: 860,
      }}
    >
      {children}
    </h2>
  );
}

export function Bullets({ items }: { items: string[] }) {
  return (
    <ul
      style={{
        listStyle: "none",
        margin: "10px 0 24px",
        padding: 0,
        display: "grid",
        gridTemplateColumns: "1fr",
        gap: 0,
        maxWidth: MEASURE,
      }}
    >
      {items.map((it, i) => (
        <li
          key={i}
          style={{
            position: "relative",
            paddingLeft: 24,
            paddingTop: 12,
            paddingBottom: 12,
            fontSize: 15.5,
            lineHeight: 1.55,
            opacity: 0.84,
            borderTop: `1px solid ${palette.rule}`,
          }}
        >
          <span style={{ position: "absolute", left: 0, top: 12, color: palette.accent }}>—</span>
          {it}
        </li>
      ))}
    </ul>
  );
}

export function Quote({ children }: { children: ReactNode }) {
  return (
    <blockquote
      style={{
        borderLeft: `2px solid ${palette.accent}`,
        paddingLeft: 26,
        margin: "30px 0",
        maxWidth: MEASURE,
        fontFamily: SANS,
        fontWeight: 300,
        fontSize: "clamp(20px, 2.6vw, 26px)",
        lineHeight: 1.35,
        letterSpacing: "-0.015em",
        color: palette.ink,
      }}
    >
      {children}
    </blockquote>
  );
}

export function Figure({ children, caption }: { children: ReactNode; caption: string }) {
  return (
    <figure style={{ margin: "48px 0", maxWidth: 940 }}>
      {children}
      <figcaption
        style={{
          fontFamily: MONO,
          fontSize: 11,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          opacity: 0.55,
          marginTop: 16,
          lineHeight: 1.5,
        }}
      >
        {caption}
      </figcaption>
    </figure>
  );
}
