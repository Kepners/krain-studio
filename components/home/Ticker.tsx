"use client";

import { useEffect, useState } from "react";
import { palette } from "@/lib/tokens";

// Fictional, representative "current project" names — one per month, so the live
// ticker rotates to a new one each month. These are illustrative only; real
// client work is anonymised (see the Work section note).
const PROJECTS = [
  "Holloway Mews", // Jan
  "Maple Court", // Feb
  "Eastgate House", // Mar
  "Old Mill Yard", // Apr
  "Selwyn House", // May
  "Thornbury Wharf", // Jun
  "Hendell Place", // Jul
  "Carraway Works", // Aug
  "Rookery Lane", // Sep
  "Pennfield Barns", // Oct
  "Aldgate Granary", // Nov
  "Wickham House", // Dec
];

export function Ticker() {
  // PROJECTS[0] on the server / first paint (hydration-safe), then swap to the
  // current month's name on mount — so it advances every month without a rebuild.
  const [project, setProject] = useState(PROJECTS[0]);

  useEffect(() => {
    setProject(PROJECTS[new Date().getMonth() % PROJECTS.length]);
  }, []);

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
        Live — {project}
      </span>
      <span style={{ display: "flex", gap: 28, flexWrap: "wrap" }}>
        <span>RIBA 4–5</span>
        <span>NHBC / LBC</span>
        <span>BGW · BEDS</span>
      </span>
    </div>
  );
}
