import { palette } from "@/lib/tokens";

export function Ticker() {
  return (
    <div
      style={{
        position: "relative",
        zIndex: 2,
        padding: "12px 32px",
        display: "flex",
        justifyContent: "space-between",
        gap: 24,
        flexWrap: "wrap",
        fontSize: 11,
        letterSpacing: "0.18em",
        textTransform: "uppercase",
        borderBottom: `1px solid ${palette.rule}`,
        color: palette.inkSoft,
        fontFamily: "var(--font-geist-mono), ui-monospace, monospace",
      }}
    >
      <span>
        <span className="krain-pulse" style={{ color: palette.accent }}>
          ●{" "}
        </span>
        Representative package · fictional project name
      </span>
      <span style={{ display: "flex", gap: 28, flexWrap: "wrap" }}>
        <span>RIBA 4–5</span>
        <span>NHBC / LBC</span>
        <span>BGW · BEDS</span>
      </span>
    </div>
  );
}
