"use client";

import { useRef, useState } from "react";
import { palette } from "@/lib/tokens";
import { DrawingPlate } from "@/components/ui/DrawingPlate";

export type Project = {
  n: string;
  name: string;
  year: string;
  loc: string;
  plate: string;
  sheet: string;
  sub: string;
};

type Props = {
  project: Project;
  featured?: boolean;
};

export function ProjectCard({ project, featured = false }: Props) {
  const ref = useRef<HTMLAnchorElement>(null);
  const [hover, setHover] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  const onMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    setPos({ x: e.clientX - r.left, y: e.clientY - r.top });
  };

  return (
    <a
      ref={ref}
      href="#"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onMouseMove={onMove}
      style={{
        display: "block",
        textDecoration: "none",
        color: palette.ink,
        position: "relative",
        gridRow: featured ? "span 2" : "auto",
      }}
    >
      <div
        style={{
          position: "relative",
          borderRadius: 6,
          overflow: "hidden",
          cursor: hover ? "none" : "pointer",
        }}
      >
        <div
          style={{
            transition:
              "transform .9s cubic-bezier(.2,.7,.2,1), filter .5s",
            transform: hover ? "scale(1.04)" : "scale(1)",
            filter: hover ? "brightness(1.05)" : "brightness(1)",
          }}
        >
          <DrawingPlate
            label={project.plate}
            caption={project.sheet}
            ratio={featured ? undefined : "4/3"}
            height={featured ? 580 : undefined}
            bg="#e6e0d2"
            ink="rgba(26,29,51,.5)"
          />
        </div>

        {featured && (
          <div
            style={{
              position: "absolute",
              top: 16,
              left: 16,
              background: palette.accent,
              color: palette.bg,
              padding: "6px 12px",
              fontSize: 10,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              fontWeight: 600,
              borderRadius: 999,
              boxShadow: hover ? `0 0 30px ${palette.accent}` : "none",
              transition: "box-shadow .35s",
              fontFamily: "var(--font-geist-mono), ui-monospace, monospace",
            }}
          >
            Featured
          </div>
        )}

        <div
          aria-hidden
          style={{
            position: "absolute",
            left: pos.x,
            top: pos.y,
            transform: `translate(-50%,-50%) scale(${hover ? 1 : 0})`,
            width: 86,
            height: 86,
            borderRadius: "50%",
            background: palette.accent,
            color: palette.bg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 11,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            fontWeight: 600,
            transition: "transform .25s cubic-bezier(.2,.7,.2,1)",
            boxShadow: `0 12px 40px ${palette.accent}88`,
            pointerEvents: "none",
            fontFamily: "var(--font-geist-mono), ui-monospace, monospace",
          }}
        >
          VIEW →
        </div>

        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            background: `linear-gradient(120deg, transparent 30%, ${palette.accent}22 50%, transparent 70%)`,
            transform: hover ? "translateX(0%)" : "translateX(-100%)",
            transition: "transform .8s cubic-bezier(.2,.7,.2,1)",
            pointerEvents: "none",
          }}
        />
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          marginTop: 18,
          gap: 16,
        }}
      >
        <div
          style={{
            fontFamily: "var(--font-geist), sans-serif",
            fontSize: featured ? 34 : 22,
            fontWeight: 300,
            letterSpacing: "-0.02em",
            transform: hover ? "translateX(8px)" : "translateX(0)",
            transition: "transform .35s cubic-bezier(.2,.7,.2,1)",
          }}
        >
          {project.name}
        </div>
        <div
          style={{
            fontSize: 12,
            opacity: 0.55,
            letterSpacing: "0.1em",
            fontFamily: "var(--font-geist-mono), ui-monospace, monospace",
            textTransform: "uppercase",
            whiteSpace: "nowrap",
          }}
        >
          {project.year} · {project.loc.toUpperCase()}
        </div>
      </div>
      <div style={{ fontSize: 13, opacity: 0.65, marginTop: 4 }}>{project.sub}</div>
    </a>
  );
}
