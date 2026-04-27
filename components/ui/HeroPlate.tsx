import { palette } from "@/lib/tokens";

export function HeroPlate() {
  const ticks = [
    { top: 14, left: 14 },
    { top: 14, right: 14 },
    { bottom: 14, left: 14 },
    { bottom: 14, right: 14 },
  ] as const;

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        aspectRatio: "4/3",
        borderRadius: 8,
        overflow: "hidden",
        boxShadow: `0 30px 80px rgba(26,29,51,.18), 0 0 0 1px ${palette.rule}`,
        background: `repeating-linear-gradient(135deg, ${palette.plate} 0 18px, rgba(26,29,51,.07) 18px 19px)`,
        color: palette.inkSoft,
        fontFamily: "var(--font-geist-mono), ui-monospace, monospace",
        fontSize: 11,
        letterSpacing: "0.14em",
        textTransform: "uppercase",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 16,
          left: 16,
          fontSize: 10,
          letterSpacing: "0.2em",
          opacity: 0.55,
        }}
      >
        [ Hero photo · drop image of site / detail / drawing here ]
      </div>
      <div style={{ position: "absolute", bottom: 16, left: 16 }}>16:12 · replace src</div>
      <div style={{ position: "absolute", bottom: 16, right: 16, opacity: 0.55 }}>
        1600 × 1200
      </div>
      {ticks.map((p, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            width: 14,
            height: 14,
            opacity: 0.4,
            top: "top" in p ? p.top : undefined,
            left: "left" in p ? p.left : undefined,
            right: "right" in p ? p.right : undefined,
            bottom: "bottom" in p ? p.bottom : undefined,
            borderTop: i < 2 ? `1px solid ${palette.ink}` : "none",
            borderBottom: i >= 2 ? `1px solid ${palette.ink}` : "none",
            borderLeft: i % 2 === 0 ? `1px solid ${palette.ink}` : "none",
            borderRight: i % 2 === 1 ? `1px solid ${palette.ink}` : "none",
          }}
        />
      ))}
    </div>
  );
}
