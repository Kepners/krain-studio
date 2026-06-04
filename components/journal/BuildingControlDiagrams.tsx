import { palette } from "@/lib/tokens";

const MONO = "var(--font-geist-mono), ui-monospace, monospace";

const INK = palette.ink;
const ACCENT = palette.accent;
const RULE = "rgba(26, 29, 51, 0.16)";
const PLATE = palette.plate;
const ACCENT_SOFT = palette.accentSoft;
const CREAM = palette.bg;

/* ------------------------------------------------------------------ */
/* Hero — a BC drawing set + the technical areas it must communicate   */
/* ------------------------------------------------------------------ */

export function BCHeroDiagram() {
  const areas = ["Structure", "Fire", "Drainage", "Ventilation", "Access", "Insulation"];

  return (
    <svg
      viewBox="0 0 960 420"
      role="img"
      aria-label="A technical drawing sheet showing a building section, beside a list of the areas a Building Control drawing package needs to communicate: structure, fire, drainage, ventilation, access and insulation."
      style={{ width: "100%", height: "auto", display: "block", background: PLATE, border: `1px solid ${RULE}` }}
    >
      <text x="40" y="52" fontFamily={MONO} fontSize="11" letterSpacing="2.5" fill={INK} opacity="0.55">
        BUILDING CONTROL DRAWING SUPPORT
      </text>

      {/* drawing sheet with a simple building section */}
      <rect x="40" y="84" width="470" height="284" fill={palette.bgRaise} stroke={INK} strokeWidth="1.3" opacity="0.9" />
      {/* ground line */}
      <line x1="70" y1="320" x2="480" y2="320" stroke={INK} strokeWidth="1.4" opacity="0.6" />
      {/* section silhouette: walls + pitched roof */}
      <path
        d="M 150 320 L 150 200 L 275 130 L 400 200 L 400 320"
        fill="none"
        stroke={INK}
        strokeWidth="1.6"
        opacity="0.8"
      />
      {/* floor line */}
      <line x1="150" y1="300" x2="400" y2="300" stroke={INK} strokeWidth="1" opacity="0.35" />
      {/* roof insulation hatch */}
      <line x1="200" y1="183" x2="350" y2="183" stroke={ACCENT} strokeWidth="1" opacity="0.5" strokeDasharray="3 4" />
      {/* window */}
      <rect x="180" y="232" width="44" height="48" fill="none" stroke={INK} strokeWidth="1.2" opacity="0.7" />
      {/* door */}
      <rect x="330" y="248" width="38" height="72" fill="none" stroke={INK} strokeWidth="1.2" opacity="0.7" />
      {/* foundation / drainage hint */}
      <rect x="150" y="320" width="60" height="22" fill="none" stroke={INK} strokeWidth="1" opacity="0.4" />
      <circle cx="430" cy="335" r="9" fill="none" stroke={INK} strokeWidth="1" opacity="0.4" />

      {/* review-areas panel */}
      <rect x="560" y="84" width="360" height="284" fill={CREAM} stroke={INK} strokeWidth="1.2" opacity="0.95" />
      <text x="584" y="120" fontFamily={MONO} fontSize="11" letterSpacing="2" fill={INK} opacity="0.55">
        REVIEW AREAS
      </text>
      {areas.map((a, i) => {
        const y = 150 + i * 34;
        return (
          <g key={a}>
            <circle cx="590" cy={y - 4} r="3.5" fill={ACCENT} />
            <text x="606" y={y} fontFamily={MONO} fontSize="14" fill={INK} opacity="0.82">
              {a}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* What it CAN include                                                 */
/* ------------------------------------------------------------------ */

export function BCIncludesGrid() {
  const items = [
    "Technical plans and sections",
    "Construction details",
    "Build-up notes",
    "Drainage information",
    "Ventilation coordination",
    "Window and door schedules",
    "Drawing register checks",
    "Mark-ups and action lists",
  ];

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        gap: 1,
        background: RULE,
        border: `1px solid ${RULE}`,
      }}
    >
      {items.map((it) => (
        <div
          key={it}
          style={{ background: palette.bgRaise, padding: "18px 20px", display: "flex", alignItems: "flex-start", gap: 12, minHeight: 64 }}
        >
          <span aria-hidden style={{ color: ACCENT, fontFamily: MONO, fontSize: 14, lineHeight: 1.4, flex: "0 0 auto" }}>
            ✓
          </span>
          <span style={{ fontSize: 14, lineHeight: 1.4, opacity: 0.9 }}>{it}</span>
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* What it is NOT — dark boundary block                               */
/* ------------------------------------------------------------------ */

export function BCNotGrid() {
  const items = [
    "Not approval",
    "Not certification",
    "Not Building Control",
    "Not structural engineering",
    "Not fire strategy",
    "Not site inspection",
    "Not warranty approval",
    "Not contract administration",
  ];

  const sep = "rgba(236, 231, 221, 0.16)";

  return (
    <div
      role="img"
      aria-label="What Building Control drawing support is not: not approval, not certification, not Building Control, not structural engineering, not fire strategy, not site inspection, not warranty approval, not contract administration."
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        gap: 1,
        background: sep,
        border: `1px solid ${INK}`,
        backgroundColor: INK,
      }}
    >
      {items.map((it) => (
        <div
          key={it}
          style={{ background: INK, padding: "18px 20px", display: "flex", alignItems: "center", gap: 12, minHeight: 60, boxShadow: `0 0 0 0.5px ${sep}` }}
        >
          <span aria-hidden style={{ color: ACCENT, fontFamily: MONO, fontSize: 15, lineHeight: 1, flex: "0 0 auto" }}>
            ✕
          </span>
          <span style={{ fontSize: 14, lineHeight: 1.4, color: CREAM, opacity: 0.92, fontFamily: MONO, letterSpacing: "0.01em" }}>
            {it}
          </span>
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Support boundary flow                                              */
/* ------------------------------------------------------------------ */

export function BCBoundaryFlow() {
  const steps = [
    "Project drawings + comments",
    "Krain Studio technical support",
    "Clearer drawings + action list",
    "Architect / engineer / Building Control / warranty review",
  ];

  return (
    <div
      role="img"
      aria-label="A boundary flow: project drawings and comments go to Krain Studio technical support, which produces clearer drawings and an action list, which then go to the architect, engineer, Building Control and warranty provider for review."
      style={{ display: "flex", flexWrap: "wrap", alignItems: "stretch", border: `1px solid ${RULE}`, background: PLATE }}
    >
      {steps.map((s, i) => {
        const last = i === steps.length - 1;
        return (
          <div
            key={s}
            style={{
              flex: "1 1 170px",
              padding: "24px 18px",
              borderRight: i < steps.length - 1 ? `1px solid ${RULE}` : "none",
              position: "relative",
              background: last ? ACCENT_SOFT : "transparent",
            }}
          >
            <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: "0.18em", opacity: 0.5, marginBottom: 12 }}>0{i + 1}</div>
            <div style={{ fontFamily: MONO, fontSize: 13, lineHeight: 1.45, letterSpacing: "0.02em", color: last ? ACCENT : INK, fontWeight: last ? 600 : 400 }}>
              {s}
            </div>
            {i < steps.length - 1 && (
              <span aria-hidden style={{ position: "absolute", right: -8, top: "50%", transform: "translateY(-50%)", color: ACCENT, fontSize: 16, fontFamily: MONO, zIndex: 1 }}>
                →
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
