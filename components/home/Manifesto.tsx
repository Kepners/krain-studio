"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { palette } from "@/lib/tokens";
import { FadeIn } from "@/components/ui/FadeIn";
import { RevealWord } from "@/components/ui/RevealWord";

const COPY = [
  "No mood boards, no renderings. Drawings you can build to with confidence.",
  "Every detail is drawn at the scale a tradesperson actually needs. 1:5 at thresholds, 1:10 elsewhere.",
  "We work with architects who'd rather be designing, contractors who want a clean set, clients who've been quoted twice for the same job.",
];

export function Manifesto() {
  const ref = useRef<HTMLElement>(null);
  const [m, setM] = useState({ x: 0.5, y: 0.5 });
  const reduce = useReducedMotion();

  useEffect(() => {
    if (reduce) return;
    const el = ref.current;
    if (!el) return;
    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      setM({
        x: (e.clientX - r.left) / r.width,
        y: (e.clientY - r.top) / r.height,
      });
    };
    el.addEventListener("mousemove", onMove);
    return () => el.removeEventListener("mousemove", onMove);
  }, [reduce]);

  return (
    <section
      ref={ref}
      id="about"
      style={{
        padding: "clamp(88px, 14vw, 140px) clamp(20px, 5vw, 32px)",
        background: palette.ink,
        color: palette.bg,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: -100,
          left: -100,
          width: 500,
          height: 500,
          background: `radial-gradient(circle, ${palette.accent}33 0%, transparent 60%)`,
          filter: "blur(60px)",
          transform: `translate(${(m.x - 0.5) * 30}px, ${(m.y - 0.5) * 30}px)`,
          transition: "transform .4s ease-out",
          pointerEvents: "none",
        }}
      />
      <div style={{ position: "relative", maxWidth: 1100 }}>
        <div
          style={{
            fontSize: 11,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            opacity: 0.55,
            marginBottom: 28,
            fontFamily: "var(--font-geist-mono), ui-monospace, monospace",
          }}
        >
          On the practice
        </div>
        <FadeIn>
          <h2
            style={{
              fontFamily: "var(--font-geist), sans-serif",
              fontWeight: 200,
              fontSize: "clamp(48px, 9vw, 96px)",
              lineHeight: 0.98,
              letterSpacing: "-0.04em",
              margin: 0,
            }}
          >
            A building succeeds or fails in the <RevealWord>junctions.</RevealWord>
          </h2>
        </FadeIn>
        <FadeIn delay={80}>
          <p style={{ fontSize: 18, lineHeight: 1.55, opacity: 0.82, maxWidth: 640, marginTop: 24 }}>
            Krain Studio helps turn design intent into coordinated, buildable information.
          </p>
        </FadeIn>
        <div
          className="krain-manifesto-cols"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: 32,
            marginTop: 60,
          }}
        >
          {COPY.map((p, i) => (
            <FadeIn key={i} delay={i * 100}>
              <p style={{ margin: 0, fontSize: 15, lineHeight: 1.6, opacity: 0.8 }}>{p}</p>
            </FadeIn>
          ))}
        </div>
      </div>
      <style>{`
        @media (max-width: 900px) {
          .krain-manifesto-cols { grid-template-columns: 1fr !important; gap: 28px !important; }
        }
      `}</style>
    </section>
  );
}
