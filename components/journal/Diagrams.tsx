import { palette } from "@/lib/tokens";

const MONO = "var(--font-geist-mono), ui-monospace, monospace";

const INK = palette.ink;
const ACCENT = palette.accent;
const ACCENT_TEXT = palette.accentText;
const RULE = "rgba(26, 29, 51, 0.16)";
const PLATE = palette.plate;
const ACCENT_SOFT = palette.accentSoft;

/* ------------------------------------------------------------------ */
/* Hero — abstract elevation tags vs a schedule table, one mismatch   */
/* ------------------------------------------------------------------ */

export function HeroScheduleDiagram() {
  const rows = [
    { ref: "W01", size: "1200 × 1500", type: "Casement" },
    { ref: "W02", size: "1200 × 1800", type: "Casement", flag: true },
    { ref: "D01", size: "0900 × 2100", type: "Single" },
    { ref: "D02", size: "1800 × 2100", type: "Double" },
  ];

  const tableX = 430;
  const tableW = 490;
  const headTop = 96;
  const headH = 38;
  const rowH = 46;
  const colRef = tableX + 26;
  const colSize = tableX + 170;
  const colType = tableX + 330;

  return (
    <svg
      viewBox="0 0 960 420"
      role="img"
      aria-label="An abstract building elevation with window tags W01 and W02 beside a window and door schedule table. The W02 row is flagged because its size does not match the elevation."
      style={{
        width: "100%",
        height: "auto",
        display: "block",
        background: PLATE,
        border: `1px solid ${RULE}`,
      }}
    >
      <defs>
        <marker id="krain-dot" markerWidth="6" markerHeight="6" refX="3" refY="3">
          <circle cx="3" cy="3" r="3" fill={ACCENT} />
        </marker>
      </defs>

      {/* labels */}
      <text x="40" y="58" fontFamily={MONO} fontSize="11" letterSpacing="3" fill={INK} opacity="0.55">
        DRAWINGS
      </text>
      <text x={tableX} y="58" fontFamily={MONO} fontSize="11" letterSpacing="3" fill={INK} opacity="0.55">
        SCHEDULE
      </text>

      {/* elevation block */}
      <rect x="40" y="96" width="320" height="244" fill="none" stroke={INK} strokeWidth="1.4" opacity="0.7" />
      {/* mullions / transoms */}
      <line x1="160" y1="96" x2="160" y2="340" stroke={INK} strokeWidth="1" opacity="0.25" />
      <line x1="260" y1="96" x2="260" y2="340" stroke={INK} strokeWidth="1" opacity="0.25" />
      <line x1="40" y1="200" x2="360" y2="200" stroke={INK} strokeWidth="1" opacity="0.25" />

      {/* W01 opening */}
      <rect x="74" y="128" width="60" height="50" fill="none" stroke={INK} strokeWidth="1.2" opacity="0.7" />
      <text x="104" y="158" textAnchor="middle" fontFamily={MONO} fontSize="11" fill={INK} opacity="0.7">
        W01
      </text>

      {/* W02 opening — flagged */}
      <rect x="186" y="236" width="60" height="74" fill={ACCENT_SOFT} stroke={ACCENT} strokeWidth="1.6" />
      <text x="216" y="278" textAnchor="middle" fontFamily={MONO} fontSize="11" fill={ACCENT} fontWeight="600">
        W02
      </text>

      {/* connector: W02 elevation -> W02 schedule row */}
      <path
        d={`M 246 273 C 330 273, 350 ${headTop + headH + rowH + rowH / 2}, ${tableX} ${headTop + headH + rowH + rowH / 2}`}
        fill="none"
        stroke={ACCENT}
        strokeWidth="1.4"
        strokeDasharray="5 5"
        markerStart="url(#krain-dot)"
        markerEnd="url(#krain-dot)"
        opacity="0.9"
      />

      {/* schedule table frame */}
      <rect x={tableX} y={headTop} width={tableW} height={headH + rowH * 4} fill={palette.bgRaise} stroke={INK} strokeWidth="1.2" opacity="0.95" />

      {/* header */}
      <line x1={tableX} y1={headTop + headH} x2={tableX + tableW} y2={headTop + headH} stroke={INK} strokeWidth="1.1" opacity="0.6" />
      <text x={colRef} y={headTop + 24} fontFamily={MONO} fontSize="11" letterSpacing="2" fill={INK} opacity="0.55">
        REF
      </text>
      <text x={colSize} y={headTop + 24} fontFamily={MONO} fontSize="11" letterSpacing="2" fill={INK} opacity="0.55">
        SIZE
      </text>
      <text x={colType} y={headTop + 24} fontFamily={MONO} fontSize="11" letterSpacing="2" fill={INK} opacity="0.55">
        TYPE
      </text>

      {/* rows */}
      {rows.map((r, i) => {
        const y = headTop + headH + rowH * i;
        const cy = y + rowH / 2 + 5;
        return (
          <g key={r.ref}>
            {r.flag && <rect x={tableX} y={y} width={tableW} height={rowH} fill={ACCENT_SOFT} />}
            {r.flag && <rect x={tableX} y={y} width={3} height={rowH} fill={ACCENT} />}
            {i > 0 && <line x1={tableX} y1={y} x2={tableX + tableW} y2={y} stroke={RULE} strokeWidth="1" />}
            <text x={colRef} y={cy} fontFamily={MONO} fontSize="14" fill={r.flag ? ACCENT : INK} fontWeight={r.flag ? "600" : "400"}>
              {r.ref}
            </text>
            <text x={colSize} y={cy} fontFamily={MONO} fontSize="14" fill={INK} opacity="0.85">
              {r.size}
            </text>
            <text x={colType} y={cy} fontFamily={MONO} fontSize="14" fill={INK} opacity="0.85">
              {r.type}
            </text>
            {r.flag && (
              <text x={tableX + tableW - 22} y={cy} textAnchor="middle" fontFamily={MONO} fontSize="15" fill={ACCENT} fontWeight="700">
                ≠
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Coordination triangle — Plans / Elevations / Schedule must match   */
/* ------------------------------------------------------------------ */

export function CoordinationTriangle() {
  const apex = { x: 280, y: 64 };
  const left = { x: 78, y: 312 };
  const right = { x: 482, y: 312 };

  const edge = (a: typeof apex, b: typeof apex) => (
    <line
      x1={a.x}
      y1={a.y}
      x2={b.x}
      y2={b.y}
      stroke={INK}
      strokeWidth="1.3"
      opacity="0.4"
      markerStart="url(#krain-arrow)"
      markerEnd="url(#krain-arrow)"
    />
  );

  const Node = ({ x, y, label }: { x: number; y: number; label: string }) => (
    <>
      <circle cx={x} cy={y} r="5" fill={ACCENT} />
      <text
        x={x}
        y={y === apex.y ? y - 16 : y + 28}
        textAnchor="middle"
        fontFamily={MONO}
        fontSize="13"
        letterSpacing="2"
        fill={INK}
      >
        {label.toUpperCase()}
      </text>
    </>
  );

  return (
    <svg
      viewBox="0 0 560 380"
      role="img"
      aria-label="A triangle linking Plans, Elevations and Schedule with two-way arrows on every edge. The centre reads: must match before issue."
      style={{ width: "100%", maxWidth: 560, height: "auto", display: "block", margin: "0 auto" }}
    >
      <defs>
        <marker id="krain-arrow" markerWidth="9" markerHeight="9" refX="4.5" refY="4.5" orient="auto-start-reverse">
          <path d="M1,1 L8,4.5 L1,8" fill="none" stroke={INK} strokeWidth="1.3" opacity="0.7" />
        </marker>
      </defs>

      {edge(apex, left)}
      {edge(apex, right)}
      {edge(left, right)}

      {/* centre callout */}
      <text x="280" y="206" textAnchor="middle" fontFamily={MONO} fontSize="12" letterSpacing="2.5" fill={ACCENT}>
        MUST MATCH
      </text>
      <text x="280" y="226" textAnchor="middle" fontFamily={MONO} fontSize="12" letterSpacing="2.5" fill={ACCENT}>
        BEFORE ISSUE
      </text>

      <Node x={apex.x} y={apex.y} label="Plans" />
      <Node x={left.x} y={left.y} label="Elevations" />
      <Node x={right.x} y={right.y} label="Schedule" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Error -> site problem flow                                          */
/* ------------------------------------------------------------------ */

export function ErrorToSiteFlow() {
  const steps = [
    "Wrong schedule reference",
    "Wrong quote / order",
    "Site query",
    "Delay / cost",
  ];

  return (
    <div
      role="img"
      aria-label="A four-step flow: a wrong schedule reference leads to a wrong quote or order, which leads to a site query, which leads to delay and cost."
      style={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "stretch",
        gap: 0,
        border: `1px solid ${RULE}`,
        background: PLATE,
      }}
    >
      {steps.map((s, i) => {
        const last = i === steps.length - 1;
        return (
          <div
            key={s}
            style={{
              flex: "1 1 160px",
              padding: "26px 20px",
              borderRight: i < steps.length - 1 ? `1px solid ${RULE}` : "none",
              position: "relative",
              background: last ? ACCENT_SOFT : "transparent",
            }}
          >
            <div
              style={{
                fontFamily: MONO,
                fontSize: 11,
                letterSpacing: "0.18em",
                opacity: 0.5,
                marginBottom: 12,
              }}
            >
              0{i + 1}
            </div>
            <div
              style={{
                fontFamily: MONO,
                fontSize: 13.5,
                lineHeight: 1.45,
                letterSpacing: "0.02em",
                color: last ? ACCENT : INK,
                fontWeight: last ? 600 : 400,
              }}
            >
              {s}
            </div>
            {i < steps.length - 1 && (
              <span
                aria-hidden
                style={{
                  position: "absolute",
                  right: -8,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: ACCENT,
                  fontSize: 16,
                  fontFamily: MONO,
                  zIndex: 1,
                }}
              >
                →
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Common errors — eight buckets                                       */
/* ------------------------------------------------------------------ */

export function CommonErrorsGrid() {
  const errors = [
    "Missing references",
    "Duplicate door / window numbers",
    "Plan / elevation mismatch",
    "Wrong revision",
    "Fire rating unclear",
    "PAS / security note missing",
    "Threshold detail unresolved",
    "Supplier info not coordinated",
  ];

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
        gap: 1,
        background: RULE,
        border: `1px solid ${RULE}`,
      }}
    >
      {errors.map((e, i) => (
        <div
          key={e}
          style={{
            background: palette.bgRaise,
            padding: "22px 20px",
            minHeight: 108,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: "0.18em", color: ACCENT }}>
            0{i + 1}
          </div>
          <div style={{ fontSize: 14.5, lineHeight: 1.4, opacity: 0.9, marginTop: 16 }}>{e}</div>
        </div>
      ))}
    </div>
  );
}

/* ================================================================== */
/*  "What I check before a drawing package goes to site" — diagrams    */
/* ================================================================== */

/* ------------------------------------------------------------------ */
/* Hero — a reviewer's annotated set on the board                      */
/* ------------------------------------------------------------------ */

export function DrawingReviewDesk() {
  const pins = [
    { y: 122, label: "REGISTER" },
    { y: 176, label: "REVISION" },
    { y: 230, label: "SCHEDULE" },
    { y: 284, label: "DETAILS" },
    { y: 338, label: "BUILDABILITY" },
  ];

  return (
    <svg
      viewBox="0 0 960 440"
      role="img"
      aria-label="An abstract drawing-review desk: a stack of layered architectural sheets on a CAD grid, with a margin of coral review pins labelled Register, Revision, Schedule, Details and Buildability."
      style={{
        width: "100%",
        height: "auto",
        display: "block",
        background: PLATE,
        border: `1px solid ${RULE}`,
      }}
    >
      <defs>
        <pattern id="krain-grid" width="32" height="32" patternUnits="userSpaceOnUse">
          <path d="M32 0 L0 0 0 32" fill="none" stroke={INK} strokeWidth="0.5" opacity="0.08" />
        </pattern>
      </defs>

      <rect x="0" y="0" width="960" height="440" fill="url(#krain-grid)" />

      <text x="40" y="52" fontFamily={MONO} fontSize="11" letterSpacing="3" fill={INK} opacity="0.55">
        PRE-ISSUE REVIEW
      </text>

      {/* back sheet, slightly skewed */}
      <g transform="rotate(-2.4 300 250)">
        <rect x="92" y="92" width="430" height="300" fill={palette.bgRaise} stroke={INK} strokeWidth="1" opacity="0.5" />
      </g>

      {/* front sheet */}
      <rect x="64" y="104" width="450" height="300" fill={palette.bgRaise} stroke={INK} strokeWidth="1.3" opacity="0.97" />

      {/* faint plan linework on the front sheet */}
      <g stroke={INK} fill="none" opacity="0.42">
        <rect x="98" y="140" width="382" height="206" strokeWidth="1.2" />
        <line x1="250" y1="140" x2="250" y2="346" strokeWidth="0.9" opacity="0.7" />
        <line x1="98" y1="250" x2="480" y2="250" strokeWidth="0.9" opacity="0.7" />
        {/* window openings punched into the top wall */}
        <line x1="150" y1="140" x2="200" y2="140" strokeWidth="3.2" stroke={palette.bgRaise} />
        <line x1="150" y1="140" x2="200" y2="140" strokeWidth="1.2" />
        <line x1="332" y1="140" x2="382" y2="140" strokeWidth="3.2" stroke={palette.bgRaise} />
        <line x1="332" y1="140" x2="382" y2="140" strokeWidth="1.2" />
        {/* door swing */}
        <path d="M300 346 A40 40 0 0 1 340 306" strokeWidth="1" />
        <line x1="300" y1="346" x2="300" y2="306" strokeWidth="1" />
      </g>

      {/* dimension line */}
      <g stroke={INK} opacity="0.32">
        <line x1="98" y1="368" x2="480" y2="368" strokeWidth="0.8" />
        <line x1="98" y1="362" x2="98" y2="374" strokeWidth="0.8" />
        <line x1="480" y1="362" x2="480" y2="374" strokeWidth="0.8" />
      </g>

      {/* title block */}
      <rect x="408" y="356" width="100" height="44" fill="none" stroke={INK} strokeWidth="0.9" opacity="0.4" />
      <line x1="408" y1="372" x2="508" y2="372" stroke={INK} strokeWidth="0.7" opacity="0.4" />

      {/* markup margin */}
      <line x1="600" y1="92" x2="600" y2="392" stroke={RULE} strokeWidth="1" />
      {pins.map((p) => (
        <g key={p.label}>
          <line x1="520" y1={p.y} x2="612" y2={p.y} stroke={ACCENT} strokeWidth="1.2" strokeDasharray="4 4" opacity="0.55" />
          <circle cx="624" cy={p.y} r="9" fill="none" stroke={ACCENT} strokeWidth="1.2" opacity="0.5" />
          <circle cx="624" cy={p.y} r="4" fill={ACCENT} />
          <text x="646" y={p.y + 4} fontFamily={MONO} fontSize="13" letterSpacing="2" fill={INK} opacity="0.85">
            {p.label}
          </text>
        </g>
      ))}
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* The ten checks — at-a-glance jump list (doubles as a mini contents) */
/* ------------------------------------------------------------------ */

const TEN_CHECKS: Array<{ n: string; label: string; anchor: string }> = [
  { n: "01", label: "Register matches the files", anchor: "drawing-register" },
  { n: "02", label: "Plans, elevations & sections agree", anchor: "coordinated-set" },
  { n: "03", label: "Detail references are useful", anchor: "detail-references" },
  { n: "04", label: "Windows & doors match the schedules", anchor: "window-door-schedules" },
  { n: "05", label: "Dimensions are clear enough to build from", anchor: "dimensions" },
  { n: "06", label: "Drainage is coordinated", anchor: "drainage" },
  { n: "07", label: "Structure & architecture are coordinated", anchor: "structure" },
  { n: "08", label: "Building Control & warranty notes checked", anchor: "building-control" },
  { n: "09", label: "Clear to someone who wasn’t in the meetings", anchor: "clarity" },
  { n: "10", label: "A clear action list is issued back", anchor: "output" },
];

export function TenChecksList() {
  return (
    <>
      <style>{`
        .krain-ten-checks { grid-template-columns: 1fr 1fr; }
        .krain-check { transition: background .25s ease; }
        .krain-check:hover { background: ${palette.plate}; }
        .krain-check:hover .krain-check-arrow { opacity: 1; transform: translateX(3px); }
        @media (max-width: 640px) { .krain-ten-checks { grid-template-columns: 1fr; } }
      `}</style>
      <nav
        aria-label="The ten checks — jump to a section"
        className="krain-ten-checks"
        style={{ display: "grid", gap: 1, background: RULE, border: `1px solid ${RULE}` }}
      >
        {TEN_CHECKS.map((c) => (
          <a
            key={c.n}
            href={`#${c.anchor}`}
            className="krain-check"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              background: palette.bgRaise,
              padding: "18px 20px",
              textDecoration: "none",
              color: INK,
            }}
          >
            <span style={{ fontFamily: MONO, fontSize: 11, letterSpacing: "0.16em", color: ACCENT_TEXT, minWidth: 22 }}>
              {c.n}
            </span>
            <span style={{ fontSize: 14.5, lineHeight: 1.35, opacity: 0.9, flex: 1 }}>{c.label}</span>
            <span
              aria-hidden
              className="krain-check-arrow"
              style={{ fontFamily: MONO, fontSize: 14, color: ACCENT, opacity: 0.5, transition: "opacity .25s ease, transform .25s ease" }}
            >
              →
            </span>
          </a>
        ))}
      </nav>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Review process flow — issued set to a resolved, site-ready package  */
/* ------------------------------------------------------------------ */

export function ReviewProcessFlow() {
  const steps = [
    "PDF / DWG set + register + schedules",
    "Technical review",
    "Marked-up drawings + action list",
    "Project-team resolution",
    "Issue / site use",
  ];

  return (
    <div
      role="img"
      aria-label="A five-step flow: the PDF and DWG set with drawing register and schedules goes into a technical review, which produces marked-up drawings and an action list, leading to project-team resolution and finally issue or site use."
      style={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "stretch",
        gap: 0,
        border: `1px solid ${RULE}`,
        background: PLATE,
        overflow: "hidden",
      }}
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
            <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: "0.18em", opacity: 0.5, marginBottom: 12 }}>
              0{i + 1}
            </div>
            <div
              style={{
                fontFamily: MONO,
                fontSize: 13,
                lineHeight: 1.45,
                letterSpacing: "0.02em",
                color: last ? ACCENT : INK,
                fontWeight: last ? 600 : 400,
              }}
            >
              {s}
            </div>
            {i < steps.length - 1 && (
              <span
                aria-hidden
                style={{
                  position: "absolute",
                  right: -8,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: ACCENT,
                  fontSize: 16,
                  fontFamily: MONO,
                  zIndex: 1,
                }}
              >
                →
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Common package risks — four buckets                                 */
/* ------------------------------------------------------------------ */

export function PackageRiskBuckets() {
  const buckets = [
    { t: "Missing information", d: "References, dimensions or notes that simply are not there." },
    { t: "Conflicting drawings", d: "Plans, elevations, sections and details that disagree." },
    { t: "Schedule mismatch", d: "Windows, doors and finishes that don’t tie back to the drawings." },
    { t: "Buildability risk", d: "Details drawn neatly that cannot be built as shown." },
  ];

  return (
    <>
      <style>{`
        .krain-risk-buckets { grid-template-columns: 1fr 1fr; }
        @media (max-width: 560px) { .krain-risk-buckets { grid-template-columns: 1fr; } }
      `}</style>
      <div
        role="img"
        aria-label="Four common drawing-package risk categories: missing information, conflicting drawings, schedule mismatch and buildability risk."
        className="krain-risk-buckets"
        style={{ display: "grid", gap: 1, background: RULE, border: `1px solid ${RULE}` }}
      >
        {buckets.map((b, i) => (
          <div
            key={b.t}
            style={{
              background: palette.bgRaise,
              padding: "24px 22px",
              minHeight: 140,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: "0.18em", color: ACCENT, marginBottom: 16 }}>
              0{i + 1}
            </div>
            <div
              style={{
                fontFamily: "var(--font-geist), sans-serif",
                fontSize: 18,
                fontWeight: 400,
                letterSpacing: "-0.01em",
                marginBottom: 8,
              }}
            >
              {b.t}
            </div>
            <div style={{ fontSize: 14, lineHeight: 1.5, opacity: 0.75 }}>{b.d}</div>
          </div>
        ))}
      </div>
    </>
  );
}
