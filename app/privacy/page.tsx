import type { Metadata } from "next";
import { ContactBand } from "@/components/home/ContactBand";
import { Footer } from "@/components/home/Footer";
import { Header } from "@/components/home/Header";
import { Ticker } from "@/components/home/Ticker";
import { palette } from "@/lib/tokens";

export const metadata: Metadata = {
  title: "Privacy — Krain Studio",
  description: "How Krain Studio handles personal information and calendar-sync data.",
};

const sectionStyle = { maxWidth: 760, margin: "0 0 30px", fontSize: 17, lineHeight: 1.65, opacity: 0.86 };

export default function PrivacyPage() {
  return (
    <main style={{ position: "relative", minHeight: "100vh", overflow: "hidden" }}>
      <Ticker />
      <Header />
      <article style={{ position: "relative", zIndex: 2, padding: "clamp(56px, 8vw, 100px) clamp(16px, 5vw, 32px) 40px", maxWidth: 1000, margin: "0 auto" }}>
        <div style={{ fontFamily: "var(--font-geist-mono), ui-monospace, monospace", fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase", color: palette.accent, marginBottom: 24 }}>
          Privacy
        </div>
        <h1 style={{ fontFamily: "var(--font-geist), sans-serif", fontWeight: 200, fontSize: "clamp(36px, 6.5vw, 68px)", letterSpacing: "-0.04em", lineHeight: 1.02, margin: "0 0 28px" }}>
          Your data stays private.
        </h1>

        <section style={sectionStyle}>
          Krain Studio uses information you provide to respond to enquiries and deliver architectural technology services.
          We do not sell personal information or use it for advertising.
        </section>
        <section style={sectionStyle}>
          The optional private calendar sync connects one Outlook calendar and one Google calendar chosen by its owner.
          It reads, creates, updates and deletes only the linked calendar events needed to keep those 2 calendars matching.
        </section>
        <section style={sectionStyle}>
          Calendar access tokens and the saved Outlook-to-Google event links are encrypted and stored on Krain Studio’s private server.
          They are not stored in BuildSales, shared with third parties, or used for any purpose other than this calendar sync.
        </section>
        <section style={sectionStyle}>
          You can stop the sync at any time by disconnecting the calendars. Linked sync data can then be removed on request.
          For privacy questions, contact <a href="mailto:matt@krain.studio" style={{ color: "inherit" }}>matt@krain.studio</a>.
        </section>
      </article>
      <ContactBand />
      <Footer />
    </main>
  );
}
