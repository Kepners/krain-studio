import { palette } from "@/lib/tokens";

// Static credibility points (no numeric counters — see brief phase 2).
const POINTS = [
  "20+ years technical experience",
  "AutoCAD 2D technical drawing support",
  "Stage 4/5 package support",
  "Drawing audits & buildability reviews",
];

export function Stats() {
  return (
    <section
      aria-label="Credibility"
      className="krain-cred"
      style={{
        position: "relative",
        zIndex: 2,
        padding: "40px 0",
        borderTop: `1px solid ${palette.rule}`,
        borderBottom: `1px solid ${palette.rule}`,
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
      }}
    >
      {POINTS.map((p, i) => (
        <div
          key={i}
          className="krain-cred-cell"
          style={{
            padding: "0 28px",
            borderRight: i < POINTS.length - 1 ? `1px solid ${palette.rule}` : "none",
            display: "flex",
            alignItems: "center",
            gap: 12,
            minHeight: 56,
          }}
        >
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: palette.accent, flex: "0 0 auto" }} />
          <span
            style={{
              fontFamily: "var(--font-geist), sans-serif",
              fontSize: 16,
              fontWeight: 400,
              lineHeight: 1.3,
              letterSpacing: "-0.01em",
            }}
          >
            {p}
          </span>
        </div>
      ))}

      <style>{`
        @media (max-width: 900px) {
          .krain-cred { grid-template-columns: repeat(2, 1fr) !important; row-gap: 8px; }
          .krain-cred-cell:nth-child(2n) { border-right: none !important; }
        }
        @media (max-width: 540px) {
          .krain-cred { grid-template-columns: 1fr !important; }
          .krain-cred-cell { border-right: none !important; }
        }
      `}</style>
    </section>
  );
}
