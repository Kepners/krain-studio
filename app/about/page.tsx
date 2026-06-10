import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Ticker } from "@/components/home/Ticker";
import { Header } from "@/components/home/Header";
import { ContactBand } from "@/components/home/ContactBand";
import { Footer } from "@/components/home/Footer";
import { palette } from "@/lib/tokens";

const MONO = "var(--font-geist-mono), ui-monospace, monospace";
const SANS = "var(--font-geist), sans-serif";

export const metadata: Metadata = {
  title: "About — Freelance architectural technology support | Krain Studio",
  description:
    "Krain Studio is a freelance architectural technology service — 20+ years of technical CAD production, construction detailing, drawing review and construction support. Based in Biggleswade, Bedfordshire.",
};

function P({ children }: { children: ReactNode }) {
  return <p style={{ fontSize: 17, lineHeight: 1.65, opacity: 0.82, maxWidth: 720, margin: "0 0 18px" }}>{children}</p>;
}

function H2({ children }: { children: ReactNode }) {
  return (
    <h2 style={{ fontFamily: SANS, fontWeight: 300, fontSize: "clamp(24px, 4vw, 34px)", letterSpacing: "-0.02em", margin: "56px 0 20px" }}>
      {children}
    </h2>
  );
}

export default function AboutPage() {
  return (
    <main style={{ position: "relative", minHeight: "100vh", overflow: "hidden" }}>
      <Ticker />
      <Header />
      <article style={{ position: "relative", zIndex: 2, padding: "clamp(56px, 8vw, 100px) clamp(16px, 5vw, 32px) 40px", maxWidth: 1000, margin: "0 auto" }}>
        <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase", color: palette.accent, marginBottom: 24 }}>
          About
        </div>
        <h1 style={{ fontFamily: SANS, fontWeight: 200, fontSize: "clamp(36px, 6.5vw, 68px)", letterSpacing: "-0.04em", lineHeight: 1.02, margin: "0 0 28px", maxWidth: 880 }}>
          Freelance architectural technology support.
        </h1>
        <p style={{ fontSize: 19, lineHeight: 1.6, opacity: 0.9, maxWidth: 720, margin: "0 0 28px" }}>
          Krain Studio provides technical CAD production, construction detailing, drawing review and
          construction support for architectural practices, developers, contractors and private clients.
        </p>

        <P>
          With over 20 years’ experience across residential, commercial and mixed-use projects, we
          understand how drawings are used by architects, developers, contractors, consultants and site
          teams.
        </P>
        <P>
          We help project teams turn design intent into coordinated, buildable information — producing
          clear drawings, reviewing technical information, identifying coordination gaps and helping
          resolve construction or site-related issues before they become costly problems.
        </P>
        <P>
          The aim is not to replace the architect, structural engineer, Building Control body, warranty
          provider, principal designer or contract administrator. It is to provide experienced technical
          support so the right questions are asked early and the project team has clearer information to
          work from.
        </P>

        <H2>Confidential project work</H2>
        <P>
          Much of our work is carried out on live architectural and construction projects where client
          confidentiality, drawing copyright and project information must be protected. We do not publish
          identifiable client drawings, project locations, title blocks or original design material. Any
          examples shown are representative and anonymised.
        </P>

        <H2>Where we’re based</H2>
        <P>Based in Biggleswade, Bedfordshire — working with project teams across the UK.</P>
      </article>
      <ContactBand />
      <Footer />
    </main>
  );
}
