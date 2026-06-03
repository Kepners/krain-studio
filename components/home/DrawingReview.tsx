import { palette } from "@/lib/tokens";
import { FadeIn } from "@/components/ui/FadeIn";

const ISSUES = [
  "Missing references",
  "Conflicting details",
  "Unclear notes",
  "Schedule errors",
  "Drainage clashes",
  "Service coordination issues",
  "Buildability risks",
];

const MONO = "var(--font-geist-mono), ui-monospace, monospace";

export function DrawingReview() {
  return (
    <section id="review" style={{ position: "relative", zIndex: 2, padding: "120px 32px" }}>
      <div style={{ maxWidth: 1100 }}>
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
          Drawing review &amp; audit
        </div>

        <FadeIn>
          <h2
            style={{
              fontFamily: "var(--font-geist), sans-serif",
              fontWeight: 200,
              fontSize: "clamp(34px, 6vw, 60px)",
              letterSpacing: "-0.035em",
              lineHeight: 1.04,
              margin: 0,
              maxWidth: 840,
            }}
          >
            Drawing review &amp; technical audit support
          </h2>
        </FadeIn>

        <FadeIn delay={120}>
          <p style={{ fontSize: 17, lineHeight: 1.6, opacity: 0.82, maxWidth: 700, marginTop: 28 }}>
            Not every issue is obvious on first review. Drawing packages can contain missing references,
            conflicting details, unclear notes, schedule errors, drainage clashes, service coordination
            issues and buildability risks.
          </p>
        </FadeIn>
        <FadeIn delay={200}>
          <p style={{ fontSize: 17, lineHeight: 1.6, opacity: 0.82, maxWidth: 700, marginTop: 16 }}>
            Krain Studio reviews architectural drawings, schedules and construction information to produce
            clear mark-ups, comments and action lists so the project team can resolve issues before they
            become site problems.
          </p>
        </FadeIn>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 36 }}>
          {ISSUES.map((it) => (
            <span
              key={it}
              style={{
                fontFamily: MONO,
                fontSize: 11,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: palette.ink,
                opacity: 0.72,
                border: `1px solid ${palette.rule}`,
                borderRadius: 999,
                padding: "8px 14px",
              }}
            >
              {it}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
