import { palette } from "@/lib/tokens";
import { Stat } from "@/components/ui/Stat";

export function Stats() {
  return (
    <section
      aria-label="Studio stats"
      className="krain-stats"
      style={{
        position: "relative",
        zIndex: 2,
        padding: "32px 0",
        borderTop: `1px solid ${palette.rule}`,
        borderBottom: `1px solid ${palette.rule}`,
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
      }}
    >
      <Stat value={17} label="Live + completed projects" />
      <Stat value={1184} label="Sheets issued · 2025" />
      <Stat value={0} label="RFIs unanswered today" />
      <Stat value="Q3 26" label="Next opening" />

      <style>{`
        @media (max-width: 900px) {
          .krain-stats { grid-template-columns: repeat(2, 1fr) !important; row-gap: 32px; }
        }
      `}</style>
    </section>
  );
}
