import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Ticker } from "@/components/home/Ticker";
import { Header } from "@/components/home/Header";
import { ContactBand } from "@/components/home/ContactBand";
import { Footer } from "@/components/home/Footer";
import { palette } from "@/lib/tokens";

export const metadata: Metadata = {
  title: "Services — Technical CAD, Drawing Review & Construction Support | Krain Studio",
  description:
    "Freelance architectural technology — AutoCAD 2D technical drawing production, Stage 4/5 documentation, Building Control drawing support, drawing package audits, buildability reviews and site-issue resolution for architects, developers, contractors and private clients.",
};

const MONO = "var(--font-geist-mono), ui-monospace, monospace";
const SANS = "var(--font-geist), sans-serif";

function Eyebrow({ children }: { children: ReactNode }) {
  return (
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
      {children}
    </div>
  );
}

function H2({ children, id }: { children: ReactNode; id?: string }) {
  return (
    <h2
      id={id}
      style={{
        fontFamily: SANS,
        fontWeight: 300,
        fontSize: "clamp(28px, 4vw, 40px)",
        letterSpacing: "-0.03em",
        margin: "72px 0 24px",
        scrollMarginTop: 96,
      }}
    >
      {children}
    </h2>
  );
}

function Lead({ children }: { children: ReactNode }) {
  return (
    <p style={{ fontSize: 18, lineHeight: 1.6, maxWidth: 720, color: palette.ink, opacity: 0.9, margin: "0 0 20px" }}>
      {children}
    </p>
  );
}

function P({ children }: { children: ReactNode }) {
  return (
    <p style={{ fontSize: 16, lineHeight: 1.65, maxWidth: 720, opacity: 0.78, margin: "0 0 16px" }}>
      {children}
    </p>
  );
}

function Bullets({ items, cols = 1 }: { items: string[]; cols?: number }) {
  return (
    <ul
      style={{
        listStyle: "none",
        margin: "8px 0 24px",
        padding: 0,
        display: "grid",
        gridTemplateColumns: cols === 2 ? "repeat(auto-fit, minmax(280px, 1fr))" : "1fr",
        gap: "12px 32px",
        maxWidth: cols === 2 ? 880 : 720,
      }}
    >
      {items.map((it, i) => (
        <li
          key={i}
          style={{
            position: "relative",
            paddingLeft: 22,
            fontSize: 15,
            lineHeight: 1.55,
            opacity: 0.82,
            borderTop: `1px solid ${palette.rule}`,
            paddingTop: 12,
          }}
        >
          <span style={{ position: "absolute", left: 0, top: 12, color: palette.accent }}>—</span>
          {it}
        </li>
      ))}
    </ul>
  );
}

const WHAT_I_DO = [
  "AutoCAD 2D technical drawing production",
  "Construction details and working drawings",
  "Stage 4 and Stage 5 technical documentation",
  "Building Control drawing support",
  "Drawing package audits",
  "Buildability reviews",
  "Window, door, schedule and specification checks",
  "Technical mark-ups, comments and action lists",
  "Site query support and drawing interpretation",
  "Coordination with architects, consultants, contractors and clients",
];

const REVIEW_FINDS = [
  "Missing or conflicting information",
  "Coordination gaps between drawings",
  "Buildability concerns",
  "Unclear construction details",
  "Window, door and schedule inconsistencies",
  "Drainage, service or structural coordination issues",
  "Areas requiring clarification from architects, engineers, Building Control or warranty providers",
];

export default function ServicesPage() {
  return (
    <main style={{ position: "relative", minHeight: "100vh", overflow: "hidden" }}>
      <Ticker />
      <Header />

      <article
        style={{
          position: "relative",
          zIndex: 2,
          padding: "clamp(64px, 9vw, 120px) 32px 40px",
          maxWidth: 1000,
          margin: "0 auto",
        }}
      >
        <Eyebrow>Services</Eyebrow>
        <h1
          style={{
            fontFamily: SANS,
            fontWeight: 200,
            fontSize: "clamp(36px, 6.5vw, 68px)",
            lineHeight: 1.02,
            letterSpacing: "-0.04em",
            margin: "0 0 24px",
            maxWidth: 900,
          }}
        >
          Technical CAD production, drawing review &amp; construction support.
        </h1>
        <p
          style={{
            fontFamily: MONO,
            fontSize: 13,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: palette.inkSoft,
            margin: "0 0 48px",
          }}
        >
          Freelance architectural technology — drawings, audits, site-issue resolution.
        </p>

        <Lead>
          Krain Studio provides freelance architectural technology, technical CAD production and drawing
          review support for architectural practices, developers, contractors and private clients.
        </Lead>
        <P>
          The focus is practical technical support: producing clear drawings, reviewing architectural
          information, identifying coordination gaps and helping project teams resolve specific
          construction or site-related issues before they become costly problems.
        </P>

        <H2>What we do</H2>
        <P>
          We can be brought in to produce technical drawings, construction details and working drawing
          information, or to review existing architectural drawings where a project team needs greater
          confidence in the information being used.
        </P>
        <Bullets items={WHAT_I_DO} cols={2} />

        <H2>Service categories</H2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "28px 36px",
            margin: "8px 0 8px",
            maxWidth: 900,
          }}
        >
          {(
            [
              ["Technical CAD production", "AutoCAD 2D working drawings, general arrangements, construction information and drawing updates."],
              ["Construction details", "1:5 and 1:10 details for junctions, thresholds, eaves, openings, walls, floors and site-specific conditions."],
              ["Stage 4/5 documentation", "Support with technical design, construction information, drawing packages and coordinated issue sets."],
              ["Building Control drawing support", "Drawing support for Building Regulations, warranty and technical package requirements. This does not replace the architect, engineer, warranty provider or Building Control body."],
              ["Drawing audits & buildability reviews", "Checks for missing information, conflicting references, unclear details, schedule issues and coordination gaps."],
              ["Site and query support", "Technical mark-ups, clarification notes, RFI support and action lists to help teams understand what needs resolving."],
            ] as Array<[string, string]>
          ).map(([t, d]) => (
            <div key={t} style={{ borderTop: `1px solid ${palette.rule}`, paddingTop: 16 }}>
              <div style={{ fontFamily: SANS, fontSize: 19, fontWeight: 400, letterSpacing: "-0.01em", marginBottom: 8 }}>{t}</div>
              <div style={{ fontSize: 14.5, lineHeight: 1.55, opacity: 0.78 }}>{d}</div>
            </div>
          ))}
        </div>

        <H2 id="review">Drawing review &amp; technical audit support</H2>
        <P>
          Not every issue is obvious on first review. Drawing packages can contain missing references,
          conflicting details, unclear specification notes, coordination gaps or buildability risks that
          only become visible when someone experienced checks the information properly.
        </P>
        <P>
          Krain Studio can review architectural drawings, schedules, specifications and construction
          details to help identify:
        </P>
        <Bullets items={REVIEW_FINDS} />
        <P>
          The output can be a clear set of mark-ups, comments and action points that help the project
          team understand the risk and move forward with better information.
        </P>

        <H2>Construction detail &amp; site issue support</H2>
        <P>
          We can also assist with specific technical details or site-related construction issues where
          drawings need interpretation, clarification or further technical input.
        </P>
        <P>
          This may include reviewing a junction, checking how a detail is intended to work, identifying
          where information is missing, or helping the client or contractor understand what needs to be
          clarified by the design team.
        </P>
        <P>
          The aim is not to replace the architect, engineer or Building Control body. The aim is to
          provide experienced technical support so that the right questions are asked early and the
          project team has clearer information to work from.
        </P>

        <H2>Confidential project work</H2>
        <P>
          Much of our work is carried out on live architectural and construction projects where client
          confidentiality, drawing copyright and project information must be protected.
        </P>
        <P>
          For that reason, we do not publish identifiable client drawings, project locations, title blocks
          or original design material. Any examples shown are anonymised, recreated or representative
          samples used to demonstrate the type of technical work carried out.
        </P>

        <H2>Why bring us in?</H2>
        <P>
          With over 20 years’ experience across residential, commercial and mixed-use projects, we
          understand how drawings are used by architects, developers, contractors, consultants and site
          teams.
        </P>
        <P>
          We help teams produce clearer information, find weak points earlier and reduce uncertainty before
          or during construction.
        </P>
        <Lead>
          The goal is simple: better drawings, clearer coordination and greater confidence in the
          information being used.
        </Lead>
      </article>

      <ContactBand />
      <Footer />
    </main>
  );
}
