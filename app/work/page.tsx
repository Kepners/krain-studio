import type { Metadata } from "next";
import { Ticker } from "@/components/home/Ticker";
import { Header } from "@/components/home/Header";
import { Work } from "@/components/home/Work";
import { ContactBand } from "@/components/home/ContactBand";
import { Footer } from "@/components/home/Footer";
import { palette } from "@/lib/tokens";

const MONO = "var(--font-geist-mono), ui-monospace, monospace";
const SANS = "var(--font-geist), sans-serif";

export const metadata: Metadata = {
  title: "Work — Representative technical drawing samples | Krain Studio",
  description:
    "Anonymised, representative samples of technical CAD production, construction details and sectional drawings by Krain Studio.",
};

export default function WorkPage() {
  return (
    <main style={{ position: "relative", minHeight: "100vh", overflow: "hidden" }}>
      <Ticker />
      <Header />
      <div style={{ position: "relative", zIndex: 2, padding: "clamp(56px, 8vw, 100px) clamp(16px, 5vw, 32px) 56px", maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase", color: palette.accent, marginBottom: 24 }}>
          Work
        </div>
        <h1 style={{ fontFamily: SANS, fontWeight: 200, fontSize: "clamp(36px, 6.5vw, 68px)", letterSpacing: "-0.04em", lineHeight: 1.02, margin: "0 0 24px" }}>
          Selected work
        </h1>
        <p style={{ fontSize: 18, lineHeight: 1.6, opacity: 0.85, maxWidth: 720 }}>
          A representative selection of technical CAD production, construction details and sectional
          drawings. These are anonymised samples that show the type of work — not identifiable projects.
        </p>
      </div>
      <Work embedded />
      <ContactBand />
      <Footer />
    </main>
  );
}
