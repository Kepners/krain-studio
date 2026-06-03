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

const SITE = "https://www.krain.studio";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

const orgJsonLd = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  "@id": `${SITE}/#organization`,
  name: "Krain Studio",
  url: SITE,
  email: "matt@krain.studio",
  description:
    "Freelance architectural technology — RIBA Stage 4–5 construction packages, technical CAD production, construction detailing and drawing review.",
  areaServed: "United Kingdom",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Biggleswade",
    addressRegion: "Bedfordshire",
    addressCountry: "GB",
  },
  logo: { "@type": "ImageObject", url: `${SITE}/krain/logo-wordmark.png` },
  image: `${SITE}/krain/logo-wordmark.png`,
  knowsAbout: [
    "Construction drawings",
    "RIBA Stage 4",
    "RIBA Stage 5",
    "Architectural detailing",
    "Drawing review",
    "Buildability",
  ],
};

export default function Home() {
  return (
    <main style={{ position: "relative", minHeight: "100vh", overflow: "hidden" }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd).replace(/</g, "\\u003c") }}
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
