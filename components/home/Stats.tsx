import { palette } from "@/lib/tokens";
import { Stat } from "@/components/ui/Stat";
import { siteStats } from "@/lib/siteStats";

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
      <Stat value={siteStats.packages} label="Project packages" />
      <Stat value={siteStats.pdfs} label="PDF files" />
      <Stat value={siteStats.dwgs} label="DWG files" />
      <Stat value={siteStats.nextOpening} label="Next opening" />

      <style>{`
        @media (max-width: 900px) {
          .krain-stats { grid-template-columns: repeat(2, 1fr) !important; row-gap: 32px; }
          .krain-stat:nth-child(2n) { border-right: none !important; }
        }
        @media (max-width: 600px) {
          .krain-stat { padding: 0 16px !important; }
        }
      `}</style>
    </section>
  );
}
