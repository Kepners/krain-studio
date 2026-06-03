import { Lead, P, H2, Bullets, A, Figure } from "@/components/journal/Prose";
import {
  DrawingReviewDesk,
  TenChecksList,
  ReviewProcessFlow,
  PackageRiskBuckets,
} from "@/components/journal/Diagrams";

export function WhatICheckBeforeDrawingsGoToSite() {
  return (
    <>
      <Lead>Before a drawing package goes to site, it needs more than a quick visual check.</Lead>

      <P>
        A set of architectural drawings may look finished, but that does not always mean the information
        is coordinated, complete or ready for construction use. The problems are often small on paper: a
        missing reference, an old revision, a window mark that does not match the schedule, a drainage run
        that has not been coordinated with structure, or a detail callout that points to the wrong
        drawing.
      </P>
      <P>On site, those small issues become real delays, questions, redesign work and cost.</P>
      <P>That is why drawing review matters.</P>

      <Figure caption="A review reads the whole package as one set — register, revisions, schedules, details and buildability. Anonymised, illustrative linework only.">
        <DrawingReviewDesk />
      </Figure>

      <P>
        At Krain Studio, my focus is not just producing technical drawings. A large part of the value is{" "}
        <A href="/services#review">reviewing information before it is issued</A>, so the project team has a
        clearer understanding of what is missing, what conflicts, and what needs to be resolved before the
        drawings are relied on by contractors, consultants, clients or site teams.
      </P>
      <P>This article explains the main things I check before a drawing package goes to site.</P>

      <Figure caption="The ten checks, at a glance — jump to any section.">
        <TenChecksList />
      </Figure>

      <H2 id="drawing-register">1. Does the drawing register match the actual files?</H2>
      <P>The first check is simple, but it catches a lot of problems.</P>
      <P>
        I compare the drawing register against the actual PDF files being issued. The register may say a
        drawing exists, but the PDF may be missing. A folder may contain extra drawings that are not on
        the register. A drawing may be listed at one revision but the file in the issue folder may be at
        another.
      </P>
      <P>
        This matters because the drawing register is often treated as the formal record of issue. If the
        register and the files do not match, the project team may not know what has actually been issued.
      </P>
      <P>Typical issues include:</P>
      <Bullets
        items={[
          "drawings listed on the register but missing from the folder",
          "PDFs in the folder but not listed on the register",
          "wrong revision letters",
          "duplicate drawing numbers",
          "old superseded drawings included by mistake",
          "drawing titles not matching between the register and title block",
          "files named differently to the register",
        ]}
      />
      <P>
        These are not glamorous checks, but they are important. If the document control is wrong at the
        start, the rest of the package becomes harder to trust.
      </P>

      <H2 id="coordinated-set">2. Are the plans, elevations and sections telling the same story?</H2>
      <P>A drawing package should work as a set.</P>
      <P>
        The floor plans, elevations, sections and details should all describe the same building. If one
        drawing has changed but another has not been updated, the package can start to contradict itself.
      </P>
      <P>I look for mismatches between:</P>
      <Bullets
        items={[
          "floor plans and elevations",
          "plans and sections",
          "elevations and window schedules",
          "details and general arrangements",
          "roof plans and sections",
          "drainage layouts and floor plans",
          "structural zones and architectural layouts",
        ]}
      />
      <P>
        A common example is a window or door changing on plan, but the elevation and schedule still
        showing the previous version. Another example is a section showing a construction build-up that
        does not match the detail reference or specification note elsewhere.
      </P>
      <P>
        These inconsistencies often happen during normal project development. The problem is not that
        drawings change. The problem is when one drawing changes and the connected drawings are not
        carried forward.
      </P>

      <H2 id="detail-references">3. Are the detail references actually useful?</H2>
      <P>Detail references are only useful if they point to the right information.</P>
      <P>
        I check whether detail tags, section markers and callouts lead to real drawings and relevant
        details. A drawing may have plenty of references on it, but that does not mean they are correct.
      </P>
      <P>The questions I ask are:</P>
      <Bullets
        items={[
          "does the referenced detail exist?",
          "is the drawing number correct?",
          "is the detail at the right scale?",
          "does the detail match the condition shown on plan?",
          "has the detail been copied from another project without being adjusted?",
          "does the detail still reflect the current wall, roof, floor or opening build-up?",
          "is the same junction referenced consistently across the package?",
        ]}
      />
      <P>
        Poor detail referencing creates site questions because the contractor cannot tell which detail
        should be followed. It also creates risk when a detail technically exists, but does not match the
        actual condition being built.
      </P>
      <P>
        A drawing package should not just contain details. It should contain the right details, properly
        referenced, in the right places.
      </P>

      <H2 id="window-door-schedules">4. Do the window and door references match the schedules?</H2>
      <P>
        <A href="/journal/why-window-and-door-schedules-go-wrong">Window and door coordination</A> is one
        of the most common areas for errors.
      </P>
      <P>
        I check whether every window and door mark shown on plan and elevation is included in the
        schedule, and whether the schedule information appears to match the drawing intent.
      </P>
      <P>Common problems include:</P>
      <Bullets
        items={[
          "window marks missing from elevations",
          "window references shown on elevation but not in the schedule",
          "doors on plan with no door number",
          "door numbers duplicated",
          "schedule sizes not matching the drawn opening",
          "fire ratings applied inconsistently",
          "external doors treated like internal doors",
          "missing security or performance notes",
          "handing or swing direction not coordinated",
          "old references left over from previous revisions",
        ]}
      />
      <P>
        This is especially important where drawings are being used for pricing, procurement or site
        installation. If the schedule is wrong, the wrong item can be ordered. If the references are
        unclear, the contractor may not know which door or window is intended.
      </P>
      <P>The drawing and the schedule need to work together.</P>

      <H2 id="dimensions">5. Are dimensions clear enough to build from?</H2>
      <P>Drawings can look neat but still fail to communicate enough dimensional information.</P>
      <P>
        I review whether key dimensions are present, readable and useful. That does not mean every drawing
        needs to be over-dimensioned. It means the critical setting-out information needs to be clear.
      </P>
      <P>I look for:</P>
      <Bullets
        items={[
          "missing overall dimensions",
          "missing internal dimensions",
          "dimensions that do not close",
          "inconsistent room sizes",
          "unclear opening positions",
          "missing nibs or reveals",
          "levels that do not relate properly",
          "dimensions hidden by hatches, text or linework",
          "critical construction zones left undefined",
        ]}
      />
      <P>
        A common problem is where a plan has enough information for design discussion, but not enough
        information for construction or checking. At technical stage, drawings need to communicate
        decisions clearly.
      </P>
      <P>If a contractor has to guess, the drawing has not done its job.</P>

      <H2 id="drainage">6. Has drainage been coordinated with the building?</H2>
      <P>Drainage is one of the areas where poor coordination can create major problems later.</P>
      <P>
        A foul drainage route may look acceptable in principle, but it still needs to work with the
        structure, floor zones, ceiling zones, fire compartmentation, acoustics and vertical riser
        positions.
      </P>
      <P>I check for obvious risks such as:</P>
      <Bullets
        items={[
          "long horizontal drainage runs without clear falls",
          "soil vent pipes forced away from sensible vertical routes",
          "drainage routes clashing with steels or joists",
          "pipework crossing compartment lines without proper consideration",
          "drainage passing through areas where acoustic treatment may be needed",
          "unclear boxing or void requirements",
          "layouts that rely on impossible or awkward site routing",
        ]}
      />
      <P>
        Drainage coordination is not just a mechanical or plumbing issue. It affects architecture,
        structure, fire strategy, acoustics and buildability. If it is not considered early enough, it can
        force late changes to ceilings, walls, service voids or structural openings.
      </P>
      <P>A drawing review should flag these risks before the package is treated as site-ready.</P>

      <H2 id="structure">7. Are structure and architecture properly coordinated?</H2>
      <P>Architectural drawings do not exist in isolation.</P>
      <P>
        Openings, joist directions, steel positions, padstones, foundations, lintels, roof structure and
        floor zones all affect whether the architectural intent can actually be built.
      </P>
      <P>I check for signs that the structure has not been properly allowed for, including:</P>
      <Bullets
        items={[
          "drainage or services passing through steels",
          "openings close to structural supports",
          "details that do not allow for structural depth",
          "ceiling zones that are too tight",
          "roof details that ignore rafter or truss requirements",
          "walls drawn without enough information on loadbearing intent",
          "structural notes not reflected in the architectural layouts",
        ]}
      />
      <P>
        The aim is not to replace the structural engineer. The aim is to identify coordination risks
        early, so the right consultant or project team member can resolve them before site work is
        affected.
      </P>

      <H2 id="building-control">8. Are Building Control and warranty notes treated carefully?</H2>
      <P>Building Regulations and warranty requirements need careful handling.</P>
      <P>
        A drawing package may include notes relating to fire, structure, ventilation, drainage,
        insulation, access, security, sound or energy performance. These notes need to be coordinated with
        the actual drawn information.
      </P>
      <P>I look for obvious gaps or contradictions, such as:</P>
      <Bullets
        items={[
          "notes copied from another project",
          "fire-rating notes applied to the wrong doors",
          "ventilation notes not reflected in layouts",
          "insulation notes not matching wall or roof build-ups",
          "access requirements not coordinated with thresholds or door widths",
          "warranty requirements not reflected in the relevant details",
          "missing references to specialist design or calculations where needed",
        ]}
      />
      <P>
        This type of review does not replace the architect, engineer, warranty provider or Building
        Control body. It helps identify where the drawings may need further coordination, clarification or
        specialist input.
      </P>
      <P>
        That distinction matters. A good review should improve the package without overstepping
        professional responsibility.
      </P>

      <H2 id="clarity">9. Are the drawings clear to someone who was not in the design meetings?</H2>
      <P>This is one of the most important tests.</P>
      <P>
        A drawing package may make sense to the person who produced it, because they know the project
        history. But a contractor, consultant or client may only see the issued drawings. They do not
        always know which assumptions were made or which decisions are still unresolved.
      </P>
      <P>I ask:</P>
      <Bullets
        items={[
          "would a new person understand this drawing?",
          "are the notes clear?",
          "are unresolved items identified?",
          "are assumptions visible?",
          "are specialist items clearly marked?",
          "is the drawing status obvious?",
          "is the revision information understandable?",
          "are old comments or clouds still present?",
        ]}
      />
      <P>Technical drawings need to communicate clearly without relying on memory.</P>
      <P>
        If important information only exists in someone’s head, email trail or meeting note, it should
        either be added to the drawing package or listed as an outstanding item.
      </P>

      <H2 id="output">10. What should be issued back after the review?</H2>
      <P>A drawing review is only useful if the output is clear.</P>
      <P>
        The best output is not a vague comment like &ldquo;drawings need checking&rdquo;. The project team
        needs specific, actionable information.
      </P>
      <P>A useful drawing review should return:</P>
      <Bullets
        items={[
          "marked-up drawings",
          "a clear issue list",
          "drawing numbers and revision references",
          "missing information noted by drawing",
          "schedule mismatches identified",
          "buildability risks explained",
          "items requiring architect, engineer, supplier or Building Control input separated clearly",
          "priority items highlighted",
        ]}
      />
      <P>The aim is to make the next action obvious.</P>
      <P>
        Some items may be simple CAD corrections. Some may require consultant input. Some may be
        commercial or design decisions. A good review separates those categories so the right person can
        deal with the right problem.
      </P>

      <Figure caption="How a review runs — from the issued set to a resolved, site-ready package.">
        <ReviewProcessFlow />
      </Figure>

      <H2 id="final-thoughts">Final thoughts</H2>
      <P>
        A drawing package does not need to be perfect before it is reviewed. In fact, that is the point of
        reviewing it.
      </P>
      <P>
        The purpose of a technical drawing review is to catch the gaps, contradictions and risks before
        they become site questions, procurement mistakes or construction delays.
      </P>

      <Figure caption="Where packages tend to go wrong — four buckets to look in first.">
        <PackageRiskBuckets />
      </Figure>

      <P>
        The issues are often small: a missing reference, a wrong revision, a door number not in the
        schedule, a detail that does not match the plan, a drainage run that clashes with structure.
      </P>
      <P>But small drawing errors can create big site problems.</P>
      <P>
        Krain Studio provides{" "}
        <A href="/services">freelance architectural technology support</A> for technical CAD production,{" "}
        <A href="/services#review">drawing review</A>, construction detailing and buildability checks. If
        you have a drawing package that needs a technical review before issue or site use, send the current
        PDF/DWG set, drawing register, schedules and a short note on the issue, deadline or package stage.
      </P>
    </>
  );
}
