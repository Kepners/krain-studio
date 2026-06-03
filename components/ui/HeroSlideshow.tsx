"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useReducedMotion } from "framer-motion";
import { palette } from "@/lib/tokens";

type Slide = { src: string; label: string };

const SLIDES: Slide[] = [
  { src: "/krain/hero.png", label: "Roof eaves · 1:5" },
  { src: "/krain/work-section.png", label: "Section · build-up" },
  { src: "/krain/work-audit.png", label: "Window audit · plan" },
];

const TICKS = [
  { top: 14, left: 14 },
  { top: 14, right: 14 },
  { bottom: 14, left: 14 },
  { bottom: 14, right: 14 },
] as const;

export function HeroSlideshow() {
  const reduce = useReducedMotion();
  const [i, setI] = useState(0);

  useEffect(() => {
    if (reduce) return;
    const t = setInterval(() => setI((p) => (p + 1) % SLIDES.length), 4200);
    return () => clearInterval(t);
  }, [reduce]);

  return (
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
      {SLIDES.map((s, idx) => (
        <Image
          key={s.src}
          src={s.src}
          alt={`Detailed construction drawing — ${s.label}, Krain Studio`}
          fill
          priority={idx === 0}
          sizes="(max-width: 900px) 100vw, 45vw"
          style={{
            objectFit: "cover",
            mixBlendMode: "multiply",
            opacity: idx === i ? 1 : 0,
            transition: "opacity 1s ease",
          }}
        />
      ))}

      {/* mono title-block overlay — top-left label tracks the current slide */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          fontFamily: "var(--font-geist-mono), ui-monospace, monospace",
          fontSize: 10,
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          color: palette.inkSoft,
        }}
      >
        <span style={{ position: "absolute", top: 16, left: 16, opacity: 0.75, transition: "opacity .5s" }}>
          [ {SLIDES[i].label} ]
        </span>
        <span style={{ position: "absolute", bottom: 16, left: 16, opacity: 0.75 }}>Drawn at 1:5</span>
        <span style={{ position: "absolute", bottom: 16, right: 16, opacity: 0.5 }}>Krain · detail</span>
        {TICKS.map((p, idx) => (
          <span
            key={idx}
            style={{
              position: "absolute",
              width: 12,
              height: 12,
              opacity: 0.4,
              top: "top" in p ? p.top : undefined,
              left: "left" in p ? p.left : undefined,
              right: "right" in p ? p.right : undefined,
              bottom: "bottom" in p ? p.bottom : undefined,
              borderTop: idx < 2 ? `1px solid ${palette.ink}` : "none",
              borderBottom: idx >= 2 ? `1px solid ${palette.ink}` : "none",
              borderLeft: idx % 2 === 0 ? `1px solid ${palette.ink}` : "none",
              borderRight: idx % 2 === 1 ? `1px solid ${palette.ink}` : "none",
            }}
          />
        ))}

        {/* slide progress dots */}
        <span style={{ position: "absolute", bottom: 16, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 6, pointerEvents: "none" }}>
          {SLIDES.map((_, idx) => (
            <span
              key={idx}
              style={{
                width: 5,
                height: 5,
                borderRadius: "50%",
                background: idx === i ? palette.accent : "rgba(26,29,51,0.25)",
                transition: "background .5s",
              }}
            />
          ))}
        </span>
      </div>
    </div>
  );
}
