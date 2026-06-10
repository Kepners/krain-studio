"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { palette } from "@/lib/tokens";
import { MagneticBtn } from "@/components/ui/MagneticBtn";
import { channels } from "@/lib/contact";

export function ContactBand() {
  const ref = useRef<HTMLElement>(null);
  const [m, setM] = useState({ x: 0.5, y: 0.5 });
  const reduce = useReducedMotion();

  useEffect(() => {
    if (reduce || !window.matchMedia("(pointer: fine)").matches) return;
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
      id="contact"
      style={{
        padding: "clamp(72px, 14vw, 160px) clamp(16px, 5vw, 32px)",
        borderTop: `1px solid ${palette.rule}`,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        aria-hidden
        className="krain-contact-glow"
        style={{
          position: "absolute",
          bottom: -300,
          right: -100,
          width: 900,
          height: 900,
          background: `radial-gradient(circle, ${palette.accent}55 0%, transparent 60%)`,
          filter: "blur(60px)",
          transform: `translate(${(m.x - 0.5) * 60}px, ${(m.y - 0.5) * 40}px)`,
          transition: "transform .4s ease-out",
          pointerEvents: "none",
        }}
      />
      <div style={{ position: "relative" }}>
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
          Commissions — Q3 2026
        </div>
        <h2
          style={{
            fontFamily: "var(--font-geist), sans-serif",
            fontWeight: 200,
            fontSize: "clamp(44px, 9vw, 120px)",
            lineHeight: 0.96,
            letterSpacing: "-0.045em",
            margin: 0,
          }}
        >
          Got a set of plans?
        </h2>
        <p
          style={{
            fontSize: 17,
            lineHeight: 1.6,
            opacity: 0.8,
            maxWidth: 640,
            marginTop: 28,
          }}
        >
          Send the current PDF/DWG set, drawing register, schedules and a short note
          on the issue, deadline or package stage.
        </p>
        <div
          style={{
            marginTop: 28,
            display: "flex",
            gap: 18,
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          {channels().map((c, i) => (
            <MagneticBtn
              key={c.key}
              primary={i === 0}
              href={c.href}
              external={c.external}
              ariaLabel={c.aria}
            >
              {i === 0 ? `${c.value} →` : c.label}
            </MagneticBtn>
          ))}
          <MagneticBtn href="/contact">Start a brief</MagneticBtn>
        </div>
      </div>
      <style>{`
        @media (max-width: 520px) {
          .krain-contact-glow { width: 520px !important; height: 520px !important; right: -120px !important; bottom: -200px !important; }
        }
      `}</style>
    </section>
  );
}
