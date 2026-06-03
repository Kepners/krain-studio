import { palette } from "@/lib/tokens";
import { AnimLink } from "@/components/ui/AnimLink";
import { ProjectCard, type Project } from "@/components/home/ProjectCard";

const PROJECTS: Project[] = [
  {
    n: "01",
    name: "Maple Court",
    year: "2026",
    loc: "London",
    plate: "window elevations · maple court",
    sheet: "WIN-04",
    sub: "Main contractor (residential) · Stage 5 drafting, drawing review and window schedule support for a London housing scheme.",
  },
  {
    n: "02",
    name: "Eastgate Mews",
    year: "2025",
    loc: "Hillingdon",
    plate: "details · eastgate mews",
    sheet: "DET-12",
    sub: "Architect-led · Wall, floor, ceiling and roof type package with cladding and structural coordination for a residential developer.",
  },
  {
    n: "03",
    name: "Parkside House Types",
    year: "2025",
    loc: "Home Counties",
    plate: "working drawings · parkside",
    sheet: "WD-07",
    sub: "National housebuilder · Site plan and house-type working drawing updates for timber-frame and masonry packs.",
  },
  {
    n: "04",
    name: "Meadowbrook Phase 4",
    year: "2025",
    loc: "Milton Keynes",
    plate: "setting out · plot 147",
    sheet: "GA-147",
    sub: "National housebuilder · GA and setting-out plans for a closed-panel timber-frame house type.",
  },
  {
    n: "05",
    name: "Rowan Drive",
    year: "2026",
    loc: "St Albans",
    plate: "planning · rowan drive",
    sheet: "PD-16",
    sub: "Design studio · Planning package covering existing/proposed plans, elevations, site and block plans for a house extension.",
  },
];

export function Work() {
  return (
    <section
      id="work"
      style={{ position: "relative", zIndex: 2, padding: "120px 32px" }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          marginBottom: 48,
          gap: 16,
          flexWrap: "wrap",
        }}
      >
        <h2
          style={{
            fontFamily: "var(--font-geist), sans-serif",
            fontWeight: 200,
            fontSize: "clamp(40px, 7vw, 64px)",
            margin: 0,
            letterSpacing: "-0.04em",
          }}
        >
          Selected work
        </h2>
        <AnimLink
          href="#"
          color={palette.accent}
          style={{
            fontSize: 12,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            fontFamily: "var(--font-geist-mono), ui-monospace, monospace",
          }}
        >
          All projects →
        </AnimLink>
      </div>

      <div
        className="krain-work-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "1.6fr 1fr 1fr",
          gap: "56px 24px",
        }}
      >
        <ProjectCard project={PROJECTS[0]} featured />
        <ProjectCard project={PROJECTS[1]} />
        <ProjectCard project={PROJECTS[2]} />
        <ProjectCard project={PROJECTS[3]} />
        <ProjectCard project={PROJECTS[4]} />
      </div>

      <style>{`
        @media (max-width: 1100px) {
          .krain-work-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
        @media (max-width: 700px) {
          .krain-work-grid {
            grid-template-columns: 1fr !important;
            gap: 40px !important;
          }
        }
      `}</style>
    </section>
  );
}
