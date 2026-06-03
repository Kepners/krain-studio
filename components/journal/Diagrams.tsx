import { palette } from "@/lib/tokens";

const MONO = "var(--font-geist-mono), ui-monospace, monospace";

const INK = palette.ink;
const ACCENT = palette.accent;
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
