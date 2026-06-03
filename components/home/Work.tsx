import Image from "next/image";
import { palette } from "@/lib/tokens";

type WorkItem = { name: string; scope: string; code: string; img: string };

// Anonymised, representative samples — cropped from real drawings with all
// title blocks, project names, locations and photos removed (see sync notes).
const PROJECTS: WorkItem[] = [
  { name: "Maple Court", scope: "Residential GA plans", code: "GA-02", img: "/krain/work-01.png" },
  { name: "Eastgate House", scope: "Site plan & elevations", code: "PL-03", img: "/krain/work-02.png" },
  { name: "Old Mill Yard", scope: "Planning & elevations", code: "PL-04", img: "/krain/work-03.png" },
  { name: "Carraway Residence", scope: "Ceiling & lighting details", code: "DT-06", img: "/krain/work-04.png" },
  { name: "Carraway Residence", scope: "Stair sections & details", code: "DT-07", img: "/krain/work-05.png" },
  { name: "Carraway Residence", scope: "Auditorium ceiling details", code: "DT-08", img: "/krain/work-06.png" },
  { name: "Carraway Residence", scope: "Operable partition details", code: "DT-09", img: "/krain/work-07.png" },
  { name: "Carraway Tower", scope: "Pool & ceiling details", code: "DT-10", img: "/krain/work-08.png" },
  { name: "Selwyn House", scope: "Window details & section", code: "DT-11", img: "/krain/work-09.png" },
  { name: "Hendell Place", scope: "Window head/cill & section", code: "DT-12", img: "/krain/work-10.png" },
];

function WorkCard({ p }: { p: WorkItem }) {
  return (
    <a href="#" className="krain-job" style={{ textDecoration: "none", color: palette.ink }}>
      <div
        className="krain-job-plate"
        style={{
          position: "relative",
          width: "100%",
          aspectRatio: "3/2",
          borderRadius: 8,
          overflow: "hidden",
          background: palette.bg,
          boxShadow: `0 18px 50px rgba(26,29,51,.12), 0 0 0 1px ${palette.rule}`,
        }}
      >
        <Image
          src={p.img}
          alt={`${p.scope} — anonymised drawing sample, Krain Studio`}
          fill
          sizes="(max-width: 700px) 100vw, (max-width: 1100px) 50vw, 33vw"
          className="krain-job-img"
          style={{ objectFit: "cover", mixBlendMode: "multiply" }}
        />
        <span
          style={{
            position: "absolute",
            top: 12,
            left: 12,
            fontFamily: "var(--font-geist-mono), ui-monospace, monospace",
            fontSize: 10,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: palette.inkSoft,
            opacity: 0.75,
          }}
        >
          [ {p.scope} ]
        </span>
        <span
          style={{
            position: "absolute",
            bottom: 12,
            right: 12,
            fontFamily: "var(--font-geist-mono), ui-monospace, monospace",
            fontSize: 10,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: palette.inkSoft,
            opacity: 0.5,
          }}
        >
          {p.code}
        </span>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: 14, gap: 12 }}>
        <span style={{ fontFamily: "var(--font-geist), sans-serif", fontSize: 19, fontWeight: 300, letterSpacing: "-0.01em" }}>
          {p.name}
        </span>
        <span
          style={{
            fontSize: 10.5,
            opacity: 0.5,
            letterSpacing: "0.12em",
            fontFamily: "var(--font-geist-mono), ui-monospace, monospace",
            textTransform: "uppercase",
            whiteSpace: "nowrap",
          }}
        >
          Tender · Construction
        </span>
      </div>
    </a>
  );
}

export function Work() {
  return (
    <section id="work" style={{ position: "relative", zIndex: 2, padding: "120px 32px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          gap: 24,
          flexWrap: "wrap",
          marginBottom: 48,
        }}
      >
        <h2 style={{ fontFamily: "var(--font-geist), sans-serif", fontWeight: 200, fontSize: "clamp(40px, 7vw, 64px)", margin: 0, letterSpacing: "-0.04em" }}>
          Selected work
        </h2>
        <span
          style={{
            fontFamily: "var(--font-geist-mono), ui-monospace, monospace",
            fontSize: 11,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: palette.inkSoft,
            opacity: 0.7,
          }}
        >
          Anonymised · representative samples
        </span>
      </div>

      <div className="krain-job-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "44px 28px" }}>
        {PROJECTS.map((p, i) => (
          <WorkCard key={i} p={p} />
        ))}
      </div>

      <p
        style={{
          fontFamily: "var(--font-geist-mono), ui-monospace, monospace",
          fontSize: 12,
          lineHeight: 1.6,
          letterSpacing: "0.02em",
          color: palette.inkSoft,
          opacity: 0.85,
          maxWidth: 680,
          margin: "48px 0 0",
        }}
      >
        Project examples shown on this site are representative and anonymised.
        Project names, locations, client details, title blocks and identifying
        information have been changed or removed to protect confidentiality.
      </p>

      <style>{`
        .krain-job-img { transition: transform .6s cubic-bezier(.2,.7,.2,1); }
        .krain-job:hover .krain-job-img { transform: scale(1.04); }
        .krain-job-plate { transition: box-shadow .4s; }
        .krain-job:hover .krain-job-plate { box-shadow: 0 28px 70px rgba(26,29,51,.2), 0 0 0 1px ${palette.accent}88; }
      `}</style>
    </section>
  );
}
