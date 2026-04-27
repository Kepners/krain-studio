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
      <Stat value={30} label="Packages found in archive" />
      <Stat value={1771} label="Drawing PDFs indexed" />
      <Stat value={8} label="Client groups identified" />
      <Stat value="Q3 26" label="Next opening" />

      <style>{`
        @media (max-width: 900px) {
          .krain-stats { grid-template-columns: repeat(2, 1fr) !important; row-gap: 32px; }
        }
      `}</style>
    </section>
  );
}
