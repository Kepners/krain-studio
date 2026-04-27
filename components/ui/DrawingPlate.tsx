import type { CSSProperties } from "react";
import { palette } from "@/lib/tokens";

type Props = {
  label?: string;
  caption?: string;
  bg?: string;
  ink?: string;
  height?: number;
  ratio?: string;
  style?: CSSProperties;
};

export function DrawingPlate({
  label = "drawing",
  caption,
  bg = "#f3f0e8",
  ink = "rgba(20,20,20,.55)",
  height,
  ratio,
  style,
}: Props) {
  const gridLine = "rgba(20,20,20,.06)";

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        aspectRatio: ratio,
        height,
        background: bg,
        backgroundImage: `linear-gradient(${gridLine} 1px, transparent 1px), linear-gradient(90deg, ${gridLine} 1px, transparent 1px)`,
        backgroundSize: "22px 22px",
        color: ink,
        fontFamily: "var(--font-geist-mono), ui-monospace, monospace",
        fontSize: 10,
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        boxShadow: `0 30px 80px rgba(26,29,51,.18), 0 0 0 1px ${palette.rule}`,
        ...style,
      }}
    >
      {[
        { top: 8, left: 8, rot: 0 },
        { top: 8, right: 8, rot: 90 },
        { bottom: 8, left: 8, rot: -90 },
        { bottom: 8, right: 8, rot: 180 },
      ].map((p, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            width: 10,
            height: 10,
            top: p.top,
            left: p.left,
            right: p.right,
            bottom: p.bottom,
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderTop: `1px solid ${ink}`,
              borderLeft: `1px solid ${ink}`,
              transform: `rotate(${p.rot}deg)`,
            }}
          />
        </div>
      ))}
      <div style={{ position: "absolute", bottom: 10, left: 14, opacity: 0.8 }}>
        [ {label} ]
      </div>
      {caption && (
        <div style={{ position: "absolute", bottom: 10, right: 14, opacity: 0.55 }}>
          {caption}
        </div>
      )}
    </div>
  );
}
