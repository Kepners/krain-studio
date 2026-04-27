import { Ticker } from "@/components/home/Ticker";
import { Header } from "@/components/home/Header";
import { Hero } from "@/components/home/Hero";
import { Stats } from "@/components/home/Stats";
import { Work } from "@/components/home/Work";
import { Manifesto } from "@/components/home/Manifesto";
import { Services } from "@/components/home/Services";
import { Journal } from "@/components/home/Journal";
import { ContactBand } from "@/components/home/ContactBand";
import { Footer } from "@/components/home/Footer";
import { AmbientGlow } from "@/components/home/AmbientGlow";

export default function Home() {
  return (
    <main style={{ position: "relative", minHeight: "100vh", overflow: "hidden" }}>
      <AmbientGlow />
      <div style={{ position: "relative", zIndex: 1 }}>
        <Ticker />
        <Header />
        <Hero />
        <Stats />
        <Work />
        <Manifesto />
        <Services />
        <Journal />
        <ContactBand />
        <Footer />
      </div>
    </main>
  );
}
