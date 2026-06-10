import type { Metadata } from "next";
import { Ticker } from "@/components/home/Ticker";
import { Header } from "@/components/home/Header";
import { Footer } from "@/components/home/Footer";
import { MagneticBtn } from "@/components/ui/MagneticBtn";
import { palette } from "@/lib/tokens";
import { channels } from "@/lib/contact";

const MONO = "var(--font-geist-mono), ui-monospace, monospace";
const SANS = "var(--font-geist), sans-serif";

export const metadata: Metadata = {
  title: "Contact — Got a set of plans? | Krain Studio",
  description:
    "Send your current PDF/DWG set, drawing register, schedules and a short note on the issue, deadline or package stage. Email matt@krain.studio.",
};

const INCLUDE = [
  "The current PDF / DWG drawing set",
  "Drawing register and any schedules",
  "The deadline or package stage",
  "A short note on the issue or query",
];

export default function ContactPage() {
  return (
    <main style={{ position: "relative", minHeight: "100vh", overflow: "hidden" }}>
      <Ticker />
      <Header />
      <article style={{ position: "relative", zIndex: 2, padding: "clamp(56px, 9vw, 120px) 32px 120px", maxWidth: 1000, margin: "0 auto" }}>
        <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase", color: palette.accent, marginBottom: 24 }}>
          Contact
        </div>
        <h1 style={{ fontFamily: SANS, fontWeight: 200, fontSize: "clamp(40px, 8vw, 92px)", letterSpacing: "-0.045em", lineHeight: 0.98, margin: "0 0 28px" }}>
          Got a set of plans?
        </h1>
        <p style={{ fontSize: 18, lineHeight: 1.6, opacity: 0.85, maxWidth: 680, margin: "0 0 40px" }}>
          Send the current PDF/DWG set, drawing register, schedules and a short note on the issue,
          deadline or package stage. We’ll come back with a clear view of what’s involved.
        </p>

        <div style={{ display: "flex", gap: 18, alignItems: "center", flexWrap: "wrap", marginBottom: 56 }}>
          {channels().map((c, i) => (
            <MagneticBtn
              key={c.key}
              primary={i === 0}
              href={c.href}
              external={c.external}
              ariaLabel={c.aria}
            >
              {i === 0 ? `${c.value} →` : c.label}
            </MagneticBtn>
          ))}
        </div>

        <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase", color: palette.inkSoft, marginBottom: 18 }}>
          What to include
        </div>
        <ul style={{ listStyle: "none", margin: 0, padding: 0, maxWidth: 620 }}>
          {INCLUDE.map((it) => (
            <li
              key={it}
              style={{
                position: "relative",
                paddingLeft: 22,
                borderTop: `1px solid ${palette.rule}`,
                paddingTop: 14,
                paddingBottom: 14,
                fontSize: 16,
                opacity: 0.82,
              }}
            >
              <span style={{ position: "absolute", left: 0, top: 14, color: palette.accent }}>—</span>
              {it}
            </li>
          ))}
        </ul>

        <p style={{ fontFamily: MONO, fontSize: 12, letterSpacing: "0.18em", textTransform: "uppercase", opacity: 0.55, marginTop: 44 }}>
          Krain Studio · Biggleswade · Bedfordshire
        </p>
      </article>
      <Footer />
    </main>
  );
}
