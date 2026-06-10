import { palette } from "@/lib/tokens";

const MONO = "var(--font-geist-mono), ui-monospace, monospace";

const INK = palette.ink;
const ACCENT = palette.accent;
const RULE = "rgba(26, 29, 51, 0.16)";
const PLATE = palette.plate;
const ACCENT_SOFT = palette.accentSoft;

/* ------------------------------------------------------------------ */
/* Hero — a tidy sheet that "looks finished" but raises questions      */
/* ------------------------------------------------------------------ */

export function BuildabilityHero() {
  const flags = [
    ["Junction?", 250, 150],
    ["Level?", 250, 300],
    ["Which detail?", 470, 120],
    ["Fits structure?", 470, 250],
  ] as Array<[string, number, number]>;

  return (
    <svg
      viewBox="0 0 960 420"
      role="img"
      aria-label="A tidy drawing sheet with clean linework and a title block that looks finished, overlaid with coral query flags asking whether junctions, levels, details and structure are actually resolved."
      style={{ width: "100%", height: "auto", display: "block", background: PLATE, border: `1px solid ${RULE}` }}
    >
      <text x="40" y="52" fontFamily={MONO} fontSize="11" letterSpacing="2.5" fill={INK} opacity="0.55">
        LOOKS FINISHED
      </text>
      <text x="200" y="52" fontFamily={MONO} fontSize="11" letterSpacing="2.5" fill={ACCENT}>
        — BUT IS IT READY TO BUILD?
      </text>

      {/* the "finished-looking" sheet */}
      <rect x="40" y="78" width="600" height="302" fill={palette.bgRaise} stroke={INK} strokeWidth="1.3" />
      {/* tidy plan linework */}
      <rect x="90" y="120" width="220" height="150" fill="none" stroke={INK} strokeWidth="1.2" opacity="0.7" />
      <rect x="90" y="120" width="120" height="90" fill="none" stroke={INK} strokeWidth="1" opacity="0.4" />
      <line x1="210" y1="120" x2="210" y2="270" stroke={INK} strokeWidth="1" opacity="0.3" />
      <line x1="90" y1="210" x2="310" y2="210" stroke={INK} strokeWidth="1" opacity="0.3" />
      {/* a section strip */}
      <path d="M 360 270 L 360 180 L 440 140 L 520 180 L 520 270" fill="none" stroke={INK} strokeWidth="1.3" opacity="0.7" />
      <line x1="360" y1="270" x2="520" y2="270" stroke={INK} strokeWidth="1.2" opacity="0.5" />
      {/* dimension line */}
      <line x1="90" y1="292" x2="310" y2="292" stroke={INK} strokeWidth="0.8" opacity="0.4" />
      <text x="200" y="286" textAnchor="middle" fontFamily={MONO} fontSize="10" fill={INK} opacity="0.45">— ? —</text>
      {/* title block */}
      <rect x="470" y="300" width="150" height="64" fill="none" stroke={INK} strokeWidth="1" opacity="0.6" />
      <line x1="470" y1="324" x2="620" y2="324" stroke={INK} strokeWidth="0.8" opacity="0.4" />
      <line x1="470" y1="344" x2="620" y2="344" stroke={INK} strokeWidth="0.8" opacity="0.4" />
      <text x="478" y="318" fontFamily={MONO} fontSize="9" fill={INK} opacity="0.5">KRAIN · GA PLAN</text>
      <text x="478" y="338" fontFamily={MONO} fontSize="9" fill={INK} opacity="0.5">REV C · 1:50</text>

      {/* query flags */}
      {flags.map(([label, x, y]) => (
        <g key={label}>
          <circle cx={x} cy={y} r="13" fill={ACCENT_SOFT} stroke={ACCENT} strokeWidth="1.4" />
          <text x={x} y={y + 4} textAnchor="middle" fontFamily={MONO} fontSize="13" fill={ACCENT} fontWeight="700">?</text>
          <line x1={x + 13} y1={y} x2={x + 40} y2={y} stroke={ACCENT} strokeWidth="1" strokeDasharray="3 3" opacity="0.7" />
          <text x={x + 46} y={y + 4} fontFamily={MONO} fontSize="12" fill={ACCENT}>{label}</text>
        </g>
      ))}

      {/* verdict chip */}
      <rect x="680" y="170" width="232" height="80" fill="transparent" stroke={ACCENT} strokeWidth="1.4" />
      <text x="796" y="205" textAnchor="middle" fontFamily={MONO} fontSize="12" letterSpacing="1.5" fill={ACCENT} fontWeight="600">CAN SOMEONE BUILD</text>
      <text x="796" y="225" textAnchor="middle" fontFamily={MONO} fontSize="12" letterSpacing="1.5" fill={ACCENT} fontWeight="600">FROM THIS — WITHOUT</text>
      <text x="796" y="245" textAnchor="middle" fontFamily={MONO} fontSize="12" letterSpacing="1.5" fill={ACCENT} fontWeight="600">GUESSING?</text>
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Where buildings fail — the junctions                               */
/* ------------------------------------------------------------------ */

export function JunctionsSection() {
  const dots = [
    ["Ridge", 280, 96],
    ["Eaves", 150, 176],
    ["Window head / cill", 360, 250],
    ["Threshold", 250, 330],
    ["Wall / floor", 150, 318],
  ] as Array<[string, number, number]>;

  return (
    <svg
      viewBox="0 0 560 380"
      role="img"
      aria-label="A building cross-section with the critical junctions flagged: ridge, eaves, window head and cill, threshold, and wall-to-floor. Buildings tend to succeed or fail where things meet."
      style={{ width: "100%", maxWidth: 560, height: "auto", display: "block", margin: "0 auto" }}
    >
      {/* ground */}
      <line x1="40" y1="340" x2="520" y2="340" stroke={INK} strokeWidth="1.4" opacity="0.6" />
      {/* section silhouette */}
      <path d="M 130 340 L 130 176 L 280 86 L 430 176 L 430 340" fill="none" stroke={INK} strokeWidth="1.8" opacity="0.85" />
      {/* floor */}
      <line x1="130" y1="318" x2="430" y2="318" stroke={INK} strokeWidth="1" opacity="0.4" />
      {/* window */}
      <rect x="340" y="226" width="46" height="50" fill="none" stroke={INK} strokeWidth="1.2" opacity="0.65" />
      {/* door */}
      <rect x="210" y="262" width="40" height="78" fill="none" stroke={INK} strokeWidth="1.2" opacity="0.65" />

      {dots.map(([label, x, y]) => {
        const right = x > 280;
        return (
          <g key={label}>
            <circle cx={x} cy={y} r="5.5" fill={ACCENT} />
            <line
              x1={x}
              y1={y}
              x2={right ? x + 18 : x - 18}
              y2={y}
              stroke={ACCENT}
              strokeWidth="1"
              opacity="0.6"
            />
            <text
              x={right ? x + 24 : x - 24}
              y={y + 4}
              textAnchor={right ? "start" : "end"}
              fontFamily={MONO}
              fontSize="12"
              fill={INK}
              opacity="0.82"
            >
              {label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Buildability checklist                                             */
/* ------------------------------------------------------------------ */

export function BuildabilityChecklist() {
  const items = [
    "Stands on its own",
    "Plans / sections / details agree",
    "Key junctions resolved",
    "Space for structure",
    "Drainage actually works",
    "Levels & thresholds clear",
    "Schedules match the drawings",
    "Supplier info coordinated",
    "Fire / acoustic / thermal lines",
    "Copied notes still valid",
    "Unresolved items visible",
    "Contractor’s first questions answered",
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
          style={{ background: palette.bgRaise, padding: "16px 20px", display: "flex", alignItems: "center", gap: 12, minHeight: 58 }}
        >
          <span aria-hidden style={{ color: ACCENT, fontFamily: MONO, fontSize: 14, lineHeight: 1, flex: "0 0 auto" }}>
            ✓
          </span>
          <span style={{ fontSize: 14, lineHeight: 1.4, opacity: 0.9 }}>{it}</span>
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* What the contractor asks first — question chips                    */
/* ------------------------------------------------------------------ */

export function ContractorQuestions() {
  const questions = [
    "Which revision?",
    "Which detail applies?",
    "What’s the opening size?",
    "Where’s the threshold detail?",
    "Is this wall fire-rated?",
    "Where does this pipe go?",
    "Finished floor level?",
    "Has the supplier confirmed?",
    "Pricing or construction?",
    "Who confirms this item?",
  ];

  return (
    <div
      role="img"
      aria-label="The questions a contractor asks first when they open a drawing cold: which revision, which detail applies, opening size, threshold detail, fire rating, pipe route, finished floor level, supplier confirmation, pricing or construction, and who confirms the item."
      style={{ border: `1px solid ${RULE}`, background: PLATE, padding: "22px 22px 24px" }}
    >
      <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: ACCENT, marginBottom: 18 }}>
        What the contractor asks first
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
        {questions.map((q) => (
          <span
            key={q}
            style={{
              fontFamily: MONO,
              fontSize: 13,
              color: INK,
              opacity: 0.85,
              border: `1px solid ${RULE}`,
              background: palette.bgRaise,
              borderRadius: 999,
              padding: "8px 14px",
              whiteSpace: "nowrap",
            }}
          >
            <span style={{ color: ACCENT, marginRight: 6 }}>?</span>
            {q}
          </span>
        ))}
      </div>
    </div>
  );
}
