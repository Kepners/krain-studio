import { palette } from "@/lib/tokens";
import { AnimLink } from "@/components/ui/AnimLink";
import { ProjectCard, type Project } from "@/components/home/ProjectCard";

const PROJECTS: Project[] = [
  {
    n: "01",
    name: "Holloway Mews",
    year: "2025",
    loc: "London N7",
    plate: "section 1:50 · holloway mews",
    sheet: "A-300",
    sub: "4-bed terrace · CLT frame · brick rainscreen · 142 sheets",
  },
  {
    n: "02",
    name: "Cobden Yard",
    year: "2025",
    loc: "Margate",
    plate: "site plan · cobden yard",
    sheet: "P-002",
    sub: "Mixed-use · 208 sheets",
  },
  {
    n: "03",
    name: "Bartle Lane",
    year: "2024",
    loc: "Bradford",
    plate: "elevation · bartle lane",
    sheet: "A-201",
    sub: "Residential ×3 · 96 sheets",
  },
  {
    n: "04",
    name: "Quarry House",
    year: "2024",
    loc: "Hebden Bridge",
    plate: "plan · quarry house",
    sheet: "A-101",
    sub: "New-build · 178 sheets",
  },
  {
    n: "05",
    name: "Pelham Workshop",
    year: "2024",
    loc: "Brighton",
    plate: "roof junction · pelham",
    sheet: "D-403",
    sub: "Retrofit · 64 sheets",
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
