import { palette } from "@/lib/tokens";

const MONO = "var(--font-geist-mono), ui-monospace, monospace";

const INK = palette.ink;
const ACCENT = palette.accent;
const RULE = "rgba(26, 29, 51, 0.16)";
const PLATE = palette.plate;
const ACCENT_SOFT = palette.accentSoft;

/* ------------------------------------------------------------------ */
/* Hero — Stage 4 (developed) vs Stage 5 (used)                        */
/* ------------------------------------------------------------------ */

export function Stage45HeroDiagram() {
  return (
    <svg
      viewBox="0 0 960 420"
      role="img"
      aria-label="A split view: on the left, Stage 4 technical design — a drawing being coordinated with a plan, a detail callout and a schedule. On the right, Stage 5 — the same package being used to price, order, build and raise queries."
      style={{ width: "100%", height: "auto", display: "block", background: PLATE, border: `1px solid ${RULE}` }}
    >
      <defs>
        <marker id="s45-arrow" markerWidth="10" markerHeight="10" refX="5" refY="5" orient="auto">
          <path d="M1,1 L9,5 L1,9" fill="none" stroke={ACCENT} strokeWidth="1.6" />
        </marker>
      </defs>

      {/* labels */}
      <text x="36" y="48" fontFamily={MONO} fontSize="11" letterSpacing="2.5" fill={INK} opacity="0.55">
        STAGE 4 · TECHNICAL DESIGN
      </text>
      <text x="536" y="48" fontFamily={MONO} fontSize="11" letterSpacing="2.5" fill={ACCENT}>
        STAGE 5 · MANUFACTURE &amp; CONSTRUCTION
      </text>

      {/* LEFT — developed package */}
      {/* plan sheet */}
      <rect x="40" y="86" width="230" height="150" fill={palette.bgRaise} stroke={INK} strokeWidth="1.3" opacity="0.85" />
      <line x1="115" y1="86" x2="115" y2="236" stroke={INK} strokeWidth="1" opacity="0.22" />
      <line x1="195" y1="86" x2="195" y2="236" stroke={INK} strokeWidth="1" opacity="0.22" />
      <line x1="40" y1="161" x2="270" y2="161" stroke={INK} strokeWidth="1" opacity="0.22" />
      {/* detail callout */}
      <circle cx="330" cy="120" r="28" fill="none" stroke={INK} strokeWidth="1.3" opacity="0.7" />
      <line x1="330" y1="92" x2="330" y2="148" stroke={INK} strokeWidth="1" opacity="0.35" />
      <line x1="302" y1="120" x2="358" y2="120" stroke={INK} strokeWidth="1" opacity="0.35" />
      <line x1="270" y1="140" x2="304" y2="124" stroke={INK} strokeWidth="1" opacity="0.4" />
      {/* mini schedule */}
      <rect x="40" y="256" width="320" height="96" fill={palette.bgRaise} stroke={INK} strokeWidth="1.1" opacity="0.85" />
      <line x1="40" y1="284" x2="360" y2="284" stroke={INK} strokeWidth="1" opacity="0.4" />
      <line x1="40" y1="312" x2="360" y2="312" stroke={INK} strokeWidth="1" opacity="0.25" />
      <text x="54" y="276" fontFamily={MONO} fontSize="10" letterSpacing="1.5" fill={INK} opacity="0.5">SCHEDULE</text>
      <text x="54" y="303" fontFamily={MONO} fontSize="11" fill={INK} opacity="0.6">W01 · 1200 × 1500</text>
      <text x="54" y="331" fontFamily={MONO} fontSize="11" fill={INK} opacity="0.6">D01 · 0900 × 2100</text>

      {/* CENTRE divider + arrow */}
      <line x1="480" y1="74" x2="480" y2="356" stroke={INK} strokeWidth="1" strokeDasharray="4 6" opacity="0.3" />
      <line x1="438" y1="210" x2="520" y2="210" stroke={ACCENT} strokeWidth="2" markerEnd="url(#s45-arrow)" />

      {/* RIGHT — used package */}
      <rect x="600" y="150" width="170" height="120" fill={ACCENT_SOFT} stroke={ACCENT} strokeWidth="1.5" />
      <text x="685" y="215" textAnchor="middle" fontFamily={MONO} fontSize="11" letterSpacing="1.5" fill={ACCENT} fontWeight="600">
        ISSUED
      </text>
      <text x="685" y="233" textAnchor="middle" fontFamily={MONO} fontSize="11" letterSpacing="1.5" fill={ACCENT} fontWeight="600">
        PACKAGE
      </text>
      {(
        [
          ["PRICE", 690, 96, 685, 150],
          ["ORDER", 838, 150, 770, 178],
          ["BUILD", 838, 250, 770, 240],
          ["RFI", 540, 250, 600, 240],
        ] as Array<[string, number, number, number, number]>
      ).map(([label, tx, ty, lx, ly]) => (
        <g key={label}>
          <line x1={lx} y1={ly} x2={tx + 28} y2={ty + (ty < 150 ? 14 : -2)} stroke={ACCENT} strokeWidth="1.1" opacity="0.6" />
          <rect x={tx} y={ty} width="84" height="30" rx="15" fill={palette.bgRaise} stroke={ACCENT} strokeWidth="1.2" />
          <text x={tx + 42} y={ty + 20} textAnchor="middle" fontFamily={MONO} fontSize="11" letterSpacing="1.5" fill={ACCENT}>
            {label}
          </text>
        </g>
      ))}
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* What changes — Stage 4 vs Stage 5 columns                          */
/* ------------------------------------------------------------------ */

export function Stage45Compare() {
  const col = (head: string, items: string[], accent: boolean) => (
    <div style={{ flex: "1 1 260px", border: `1px solid ${accent ? ACCENT : RULE}`, background: accent ? ACCENT_SOFT : palette.bgRaise }}>
      <div
        style={{
          fontFamily: MONO,
          fontSize: 12,
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          color: accent ? ACCENT : INK,
          padding: "16px 20px",
          borderBottom: `1px solid ${accent ? ACCENT : RULE}`,
          fontWeight: accent ? 600 : 400,
        }}
      >
        {head}
      </div>
      <div style={{ padding: "6px 20px 14px" }}>
        {items.map((it) => (
          <div key={it} style={{ fontSize: 14.5, lineHeight: 1.5, padding: "11px 0", borderTop: `1px solid ${RULE}`, opacity: 0.85 }}>
            {it}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div
      role="img"
      aria-label="A comparison of Stage 4 and Stage 5. Stage 4: technical design development, drawing coordination, details and schedules, Building Control and warranty information, consultant input. Stage 5: construction use, procurement and supplier input, site queries, buildability checks, revisions and action lists."
      style={{ display: "flex", flexWrap: "wrap", gap: 16, alignItems: "stretch" }}
    >
      {col("Stage 4 — technical design", [
        "Technical design development",
        "Drawing coordination",
        "Details and schedules",
        "Building Control / warranty information",
        "Consultant input",
      ], false)}
      {col("Stage 5 — manufacture & construction", [
        "Construction use",
        "Procurement and supplier input",
        "Site queries",
        "Buildability checks",
        "Revisions and action lists",
      ], true)}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Stage 4 → Stage 5 overlap timeline                                 */
/* ------------------------------------------------------------------ */

export function Stage45OverlapTimeline() {
  return (
    <div
      role="img"
      aria-label="A timeline where Stage 4 technical design overlaps with Stage 5 manufacture and construction. The overlap zone is where drawing reviews, schedule checks, supplier input, site queries and buildability comments happen."
      style={{ display: "flex", flexWrap: "wrap", alignItems: "stretch", border: `1px solid ${RULE}`, background: PLATE }}
    >
      <div style={{ flex: "1 1 180px", padding: "24px 20px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: "0.16em", textTransform: "uppercase", opacity: 0.5, marginBottom: 8 }}>
          Stage 4
        </div>
        <div style={{ fontSize: 15, lineHeight: 1.4, opacity: 0.85 }}>Technical design</div>
      </div>

      <div style={{ flex: "1.4 1 240px", padding: "20px", background: ACCENT_SOFT, borderLeft: `1px solid ${RULE}`, borderRight: `1px solid ${RULE}` }}>
        <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: "0.16em", textTransform: "uppercase", color: ACCENT, marginBottom: 12, fontWeight: 600 }}>
          Overlap
        </div>
        {["Drawing reviews", "Schedule checks", "Supplier input", "Site queries", "Buildability comments"].map((it) => (
          <div key={it} style={{ fontFamily: MONO, fontSize: 12.5, padding: "5px 0", color: INK, opacity: 0.8 }}>
            — {it}
          </div>
        ))}
      </div>

      <div style={{ flex: "1 1 180px", padding: "24px 20px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: "0.16em", textTransform: "uppercase", opacity: 0.5, marginBottom: 8 }}>
          Stage 5
        </div>
        <div style={{ fontSize: 15, lineHeight: 1.4, opacity: 0.85 }}>Manufacture &amp; construction</div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Information becomes action                                          */
/* ------------------------------------------------------------------ */

export function InfoToActionFlow() {
  const steps = [
    "Technical drawings",
    "Drawing review",
    "Action list",
    "Consultant / supplier / client resolution",
    "Construction issue / site use",
  ];

  return (
    <div
      role="img"
      aria-label="A five-step flow: technical drawings, drawing review, action list, consultant supplier or client resolution, then construction issue and site use."
      style={{ display: "flex", flexWrap: "wrap", alignItems: "stretch", border: `1px solid ${RULE}`, background: PLATE }}
    >
      {steps.map((s, i) => {
        const last = i === steps.length - 1;
        return (
          <div
            key={s}
            style={{
              flex: "1 1 150px",
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
