import { palette } from "@/lib/tokens";
import { FadeIn } from "@/components/ui/FadeIn";

const MONO = "var(--font-geist-mono), ui-monospace, monospace";
const SANS = "var(--font-geist), sans-serif";

const AUDIENCE: Array<[string, string]> = [
  ["Architectural practices", "needing extra technical capacity"],
  ["Developers & contractors", "needing drawing checks before issue or site use"],
  ["Private clients", "needing help understanding technical drawings or construction issues"],
  ["Project teams", "needing clear mark-ups, action lists and buildability comments"],
];

export function WhoIHelp() {
  return (
    <section id="who" style={{ position: "relative", zIndex: 2, padding: "120px 32px" }}>
      <div
        style={{
          fontFamily: MONO,
          fontSize: 11,
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          color: palette.accent,
          marginBottom: 24,
        }}
      >
        Who we support
      </div>
      <h2
        style={{
          fontFamily: SANS,
          fontWeight: 200,
          fontSize: "clamp(34px, 6vw, 60px)",
          letterSpacing: "-0.04em",
          margin: "0 0 48px",
        }}
      >
        We support
      </h2>

      <div
        className="krain-who-grid"
        style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 28 }}
      >
        {AUDIENCE.map(([t, d], i) => (
          <FadeIn key={t} delay={i * 80}>
            <div style={{ borderTop: `1px solid ${palette.rule}`, paddingTop: 20 }}>
              <div style={{ fontFamily: SANS, fontSize: 20, fontWeight: 300, letterSpacing: "-0.01em", marginBottom: 10 }}>
                {t}
              </div>
              <div style={{ fontSize: 14, lineHeight: 1.55, opacity: 0.7 }}>{d}</div>
            </div>
          </FadeIn>
        ))}
      </div>

      <style>{`
        @media (max-width: 900px) {
          .krain-who-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 32px !important; }
        }
        @media (max-width: 560px) {
          .krain-who-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}
