"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";
import { palette } from "@/lib/tokens";
import { FadeIn } from "@/components/ui/FadeIn";
import { TiltPlate } from "@/components/ui/TiltPlate";
import { HeroPlate } from "@/components/ui/HeroPlate";

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const [mouse, setMouse] = useState({ x: 0.5, y: 0.5 });

  const { scrollY } = useScroll();
  const slashScrollY = useSpring(useTransform(scrollY, [0, 1000], [0, -150]), {
    stiffness: 80,
    damping: 20,
  });
  const glowScrollY = useSpring(useTransform(scrollY, [0, 1000], [0, -120]), {
    stiffness: 80,
    damping: 20,
  });

  useEffect(() => {
    if (reduce) return;
    const el = sectionRef.current;
    if (!el) return;
    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      setMouse({
        x: (e.clientX - r.left) / r.width,
        y: (e.clientY - r.top) / r.height,
      });
    };
    el.addEventListener("mousemove", onMove);
    return () => el.removeEventListener("mousemove", onMove);
  }, [reduce]);

  const slashX = (mouse.x - 0.5) * 40;
  const slashY = (mouse.y - 0.5) * 40;
  const glowX = (mouse.x - 0.5) * 80;
  const glowY = (mouse.y - 0.5) * 60;

  return (
    <section
      ref={sectionRef}
      style={{
        position: "relative",
        padding: "120px 32px 140px",
        overflow: "hidden",
      }}
    >
      {/* coral slash */}
      <motion.div
        aria-hidden
        style={{
          position: "absolute",
          top: "12%",
          left: "40%",
          width: 6,
          height: 620,
          background: `linear-gradient(180deg, transparent, ${palette.accent} 28%, ${palette.accent} 72%, transparent)`,
          x: slashX,
          y: reduce ? 0 : slashScrollY,
          translateY: slashY,
          rotate: 20,
          boxShadow: `0 0 60px ${palette.accent}, 0 0 120px ${palette.accent}88`,
          filter: "blur(0.5px)",
          transition: "transform .15s linear",
          zIndex: 2,
          pointerEvents: "none",
        }}
      />
      {/* radial glow */}
      <motion.div
        aria-hidden
        style={{
          position: "absolute",
          top: "5%",
          left: "30%",
          width: 900,
          height: 900,
          background: `radial-gradient(ellipse at center, ${palette.accent}33 0%, transparent 50%)`,
          x: glowX,
          y: reduce ? 0 : glowScrollY,
          translateY: glowY,
          rotate: 20,
          filter: "blur(50px)",
          pointerEvents: "none",
          transition: "transform .3s ease-out",
        }}
      />

      <div
        className="krain-hero-grid"
        style={{
          position: "relative",
          display: "grid",
          gridTemplateColumns: "1.1fr 1fr",
          gap: 64,
          alignItems: "center",
        }}
      >
        <div>
          <div
            style={{
              fontSize: 11,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: palette.inkSoft,
              marginBottom: 36,
              fontFamily: "var(--font-geist-mono), ui-monospace, monospace",
            }}
          >
            <FadeIn as="span">Detailed construction design / 2018 →</FadeIn>
          </div>
          <h1
            className="krain-hero-h1"
            style={{
              fontFamily: "var(--font-geist), sans-serif",
              fontWeight: 200,
              fontSize: "clamp(56px, 11vw, 128px)",
              lineHeight: 0.92,
              letterSpacing: "-0.045em",
              margin: 0,
            }}
          >
            <FadeIn>
              <span>
                Drawn at{" "}
                <span style={{ color: palette.accent, fontWeight: 300, position: "relative" }}>
                  1:5
                  <span
                    aria-hidden
                    className="krain-flicker"
                    style={{
                      position: "absolute",
                      inset: 0,
                      color: palette.accent,
                      filter: "blur(20px)",
                    }}
                  >
                    1:5
                  </span>
                </span>
                .
              </span>
            </FadeIn>
            <FadeIn delay={120}>
              <span>Built without</span>
            </FadeIn>
            <FadeIn delay={240}>
              <span>surprises.</span>
            </FadeIn>
          </h1>
          <FadeIn delay={420}>
            <p
              style={{
                fontSize: 17,
                lineHeight: 1.55,
                opacity: 0.82,
                maxWidth: 520,
                marginTop: 56,
              }}
            >
              Krain is a small office that produces RIBA Stage 4–5 packages — the
              construction-stage drawings, details, and specs that turn a planning
              permission into a buildable thing.
            </p>
          </FadeIn>
        </div>

        <FadeIn delay={300}>
          <TiltPlate max={4} style={{ width: "100%" }}>
            <HeroPlate
              src="/krain/hero.png"
              alt="Detailed construction drawing — 1:5 roof eaves junction, Krain Studio"
            />
          </TiltPlate>
        </FadeIn>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .krain-hero-grid {
            grid-template-columns: 1fr !important;
            gap: 48px !important;
          }
          .krain-hero-h1 {
            font-size: clamp(48px, 14vw, 64px) !important;
          }
        }
      `}</style>
    </section>
  );
}
