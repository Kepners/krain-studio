import { palette } from "@/lib/tokens";

const MONO = "var(--font-geist-mono), ui-monospace, monospace";

const INK = palette.ink;
const ACCENT = palette.accent;
const RULE = "rgba(26, 29, 51, 0.16)";
const PLATE = palette.plate;
const ACCENT_SOFT = palette.accentSoft;

/* ------------------------------------------------------------------ */
/* Hero — drawing register vs issue folder, one revision mismatch     */
/* ------------------------------------------------------------------ */

export function RegisterHeroDiagram() {
  const tableX = 40;
  const tableW = 380;
  const headTop = 96;
  const headH = 38;
  const rowH = 46;
  const noX = tableX + 22;
  const titleX = tableX + 116;
  const revX = tableX + 312;

  const rows = [
    { no: "A-100", title: "GA Plan", rev: "C" },
    { no: "A-101", title: "Section", rev: "B" },
    { no: "A-200", title: "Details", rev: "C" },
    { no: "A-210", title: "Window Sch", rev: "C", flag: true },
  ];

  const sheetX = 580;
  const sheetW = 332;
  const sheetTop = 100;
  const sheetH = 60;
  const sheetGap = 18;

  const sheets = [
    { name: "A-100", rev: "Rev C" },
    { name: "A-101", rev: "Rev B" },
    { name: "A-200", rev: "Rev C" },
    { name: "A-210", rev: "Rev B", flag: true },
  ];

  const regFlagY = headTop + headH + rowH * 3 + rowH / 2;
  const sheetFlagY = sheetTop + (sheetH + sheetGap) * 3 + sheetH / 2;

  return (
    <svg
      viewBox="0 0 960 420"
      role="img"
      aria-label="A drawing register table beside the issue folder of PDFs. Drawing A-210 is listed as Revision C on the register but the PDF in the folder is Revision B — the mismatch is flagged."
      style={{ width: "100%", height: "auto", display: "block", background: PLATE, border: `1px solid ${RULE}` }}
    >
      <defs>
        <marker id="reg-dot" markerWidth="6" markerHeight="6" refX="3" refY="3">
          <circle cx="3" cy="3" r="3" fill={ACCENT} />
        </marker>
      </defs>

      <text x={tableX} y="58" fontFamily={MONO} fontSize="11" letterSpacing="3" fill={INK} opacity="0.55">
        REGISTER
      </text>
      <text x={sheetX} y="58" fontFamily={MONO} fontSize="11" letterSpacing="3" fill={INK} opacity="0.55">
        ISSUE FOLDER
      </text>

      {/* register table */}
      <rect x={tableX} y={headTop} width={tableW} height={headH + rowH * 4} fill={palette.bgRaise} stroke={INK} strokeWidth="1.2" />
      <line x1={tableX} y1={headTop + headH} x2={tableX + tableW} y2={headTop + headH} stroke={INK} strokeWidth="1.1" opacity="0.6" />
      <text x={noX} y={headTop + 24} fontFamily={MONO} fontSize="11" letterSpacing="2" fill={INK} opacity="0.55">NO.</text>
      <text x={titleX} y={headTop + 24} fontFamily={MONO} fontSize="11" letterSpacing="2" fill={INK} opacity="0.55">TITLE</text>
      <text x={revX} y={headTop + 24} fontFamily={MONO} fontSize="11" letterSpacing="2" fill={INK} opacity="0.55">REV.</text>

      {rows.map((r, i) => {
        const y = headTop + headH + rowH * i;
        const cy = y + rowH / 2 + 5;
        return (
          <g key={r.no}>
            {r.flag && <rect x={tableX} y={y} width={tableW} height={rowH} fill={ACCENT_SOFT} />}
            {r.flag && <rect x={tableX} y={y} width={3} height={rowH} fill={ACCENT} />}
            {i > 0 && <line x1={tableX} y1={y} x2={tableX + tableW} y2={y} stroke={RULE} strokeWidth="1" />}
            <text x={noX} y={cy} fontFamily={MONO} fontSize="14" fill={r.flag ? ACCENT : INK} fontWeight={r.flag ? "600" : "400"}>{r.no}</text>
            <text x={titleX} y={cy} fontFamily={MONO} fontSize="13" fill={INK} opacity="0.8">{r.title}</text>
            <text x={revX} y={cy} fontFamily={MONO} fontSize="14" fill={r.flag ? ACCENT : INK} fontWeight={r.flag ? "700" : "400"}>{r.rev}</text>
          </g>
        );
      })}

      {/* issue folder — PDF sheets */}
      {sheets.map((s, i) => {
        const y = sheetTop + (sheetH + sheetGap) * i;
        const fold = 14;
        return (
          <g key={s.name}>
            <path
              d={`M ${sheetX} ${y} H ${sheetX + sheetW - fold} L ${sheetX + sheetW} ${y + fold} V ${y + sheetH} H ${sheetX} Z`}
              fill={s.flag ? ACCENT_SOFT : palette.bgRaise}
              stroke={s.flag ? ACCENT : INK}
              strokeWidth={s.flag ? "1.6" : "1.1"}
              opacity={s.flag ? "1" : "0.92"}
            />
            <path d={`M ${sheetX + sheetW - fold} ${y} V ${y + fold} H ${sheetX + sheetW}`} fill="none" stroke={s.flag ? ACCENT : INK} strokeWidth="1" opacity="0.5" />
            <text x={sheetX + 18} y={y + sheetH / 2 + 5} fontFamily={MONO} fontSize="14" fill={s.flag ? ACCENT : INK} fontWeight={s.flag ? "600" : "400"}>
              {s.name}
            </text>
            <text x={sheetX + sheetW - 24} y={y + sheetH / 2 + 5} textAnchor="end" fontFamily={MONO} fontSize="13" fill={s.flag ? ACCENT : INK} fontWeight={s.flag ? "700" : "400"} opacity={s.flag ? "1" : "0.8"}>
              {s.rev}
            </text>
          </g>
        );
      })}

      {/* mismatch connector */}
      <path
        d={`M ${tableX + tableW} ${regFlagY} C 500 ${regFlagY}, 520 ${sheetFlagY}, ${sheetX} ${sheetFlagY}`}
        fill="none"
        stroke={ACCENT}
        strokeWidth="1.4"
        strokeDasharray="5 5"
        markerStart="url(#reg-dot)"
        markerEnd="url(#reg-dot)"
      />
      <text x="500" y={(regFlagY + sheetFlagY) / 2 - 8} textAnchor="middle" fontFamily={MONO} fontSize="14" fill={ACCENT} fontWeight="700">≠</text>
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Register vs issue folder — do they match?                          */
/* ------------------------------------------------------------------ */

export function RegisterVsFolder() {
  const Panel = ({ label, sub, items }: { label: string; sub: string; items: string[] }) => (
    <div style={{ flex: "1 1 240px", border: `1px solid ${RULE}`, background: palette.bgRaise, padding: "22px 22px 18px" }}>
      <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: ACCENT, marginBottom: 6 }}>
        {label}
      </div>
      <div style={{ fontFamily: MONO, fontSize: 11.5, letterSpacing: "0.04em", opacity: 0.55, marginBottom: 16 }}>{sub}</div>
      {items.map((it) => (
        <div key={it} style={{ fontFamily: MONO, fontSize: 13.5, padding: "8px 0", borderTop: `1px solid ${RULE}`, opacity: 0.85 }}>
          {it}
        </div>
      ))}
    </div>
  );

  return (
    <div
      role="img"
      aria-label="A comparison: the drawing register lists the drawings that should exist; the issue folder holds the PDFs that actually exist. The question between them is: do they match?"
      style={{ display: "flex", flexWrap: "wrap", alignItems: "stretch", gap: 16 }}
    >
      <Panel label="Drawing register" sub="What should exist" items={["A-100", "A-101", "A-200", "A-210"]} />
      <div
        style={{
          flex: "0 0 auto",
          alignSelf: "center",
          fontFamily: MONO,
          fontSize: 12,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: ACCENT,
          padding: "10px 14px",
          border: `1px solid ${ACCENT}`,
          background: ACCENT_SOFT,
          textAlign: "center",
        }}
      >
        Do they
        <br />
        match?
      </div>
      <Panel label="Issue folder" sub="What actually exists" items={["A-100.pdf", "A-101.pdf", "A-200.pdf", "A-210.pdf"]} />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* From mismatch to risk                                              */
/* ------------------------------------------------------------------ */

export function MismatchToRiskFlow() {
  const steps = [
    "Wrong revision on register",
    "Wrong PDF issued",
    "Team uses outdated information",
    "Site / procurement query",
  ];

  return (
    <div
      role="img"
      aria-label="A four-step flow: a wrong revision on the register leads to the wrong PDF being issued, the team using outdated information, and a site or procurement query."
      style={{ display: "flex", flexWrap: "wrap", alignItems: "stretch", border: `1px solid ${RULE}`, background: PLATE }}
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
            <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: "0.18em", opacity: 0.5, marginBottom: 12 }}>0{i + 1}</div>
            <div style={{ fontFamily: MONO, fontSize: 13.5, lineHeight: 1.45, letterSpacing: "0.02em", color: last ? ACCENT : INK, fontWeight: last ? 600 : 400 }}>
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

/* ------------------------------------------------------------------ */
/* Drawing register review checklist                                  */
/* ------------------------------------------------------------------ */

export function RegisterChecklist() {
  const items = [
    "Register matches PDF folder",
    "Drawing numbers checked",
    "Revisions match",
    "Titles match",
    "Issue dates make sense",
    "Missing drawings flagged",
    "Extra PDFs identified",
    "Broken references found",
    "Superseded files removed",
    "Action list issued",
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
          style={{
            background: palette.bgRaise,
            padding: "18px 20px",
            display: "flex",
            alignItems: "flex-start",
            gap: 12,
            minHeight: 64,
          }}
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
