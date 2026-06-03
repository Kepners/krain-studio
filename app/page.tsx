import type { Metadata } from "next";
import { Ticker } from "@/components/home/Ticker";
import { Header } from "@/components/home/Header";
import { Hero } from "@/components/home/Hero";
import { Stats } from "@/components/home/Stats";
import { WhoIHelp } from "@/components/home/WhoIHelp";
import { Services } from "@/components/home/Services";
import { DrawingReview } from "@/components/home/DrawingReview";
import { Work } from "@/components/home/Work";
import { Manifesto } from "@/components/home/Manifesto";
import { Journal } from "@/components/home/Journal";
import { ContactBand } from "@/components/home/ContactBand";
import { Footer } from "@/components/home/Footer";
import { AmbientGlow } from "@/components/home/AmbientGlow";
import { PUBLISHED } from "@/components/journal/content";
import { organization, website } from "@/lib/schema";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [organization, website],
};

export default function Home() {
  return (
    <main style={{ position: "relative", minHeight: "100vh", overflow: "hidden" }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <AmbientGlow />
      <div style={{ position: "relative", zIndex: 1 }}>
        <Ticker />
        <Header />
        <Hero />
        <Stats />
        <WhoIHelp />
        <Services />
        <DrawingReview />
        <Work />
        <Manifesto />
        <Journal entries={PUBLISHED} />
        <ContactBand />
        <Footer />
      </div>
    </main>
  );
}
