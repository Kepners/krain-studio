import { Lead, P, H2, Bullets, Quote, A, Figure } from "@/components/journal/Prose";
import {
  BCHeroDiagram,
  BCIncludesGrid,
  BCNotGrid,
  BCBoundaryFlow,
} from "@/components/journal/BuildingControlDiagrams";

export function BuildingControlDrawingSupport() {
  return (
    <>
      <Lead>Building Control drawing support is often misunderstood.</Lead>

      <P>
        Some clients think it means &ldquo;getting drawings approved&rdquo;. Some think it means producing
        a complete construction package. Some think it means checking everything against every regulation.
        Some think it replaces the architect, structural engineer, designer, contractor or Building Control
        body.
      </P>
      <P>It does not.</P>
      <P>
        Building Control drawing support is best understood as a technical drawing service that helps
        prepare, coordinate and review information that may be needed for a Building Regulations application
        or Building Control review.
      </P>
      <P>It can be very useful, but it has a clear boundary.</P>

      <Figure caption="A Building Control package has to communicate the technical areas a reviewer needs to understand — not just the shape of the building.">
        <BCHeroDiagram />
      </Figure>

      <P>
        At Krain Studio, Building Control drawing support sits within wider{" "}
        <A href="/services">freelance architectural technology support</A>. That may include AutoCAD 2D
        technical drawings, construction details, schedule checks, drawing reviews, buildability comments
        and coordination support.
      </P>
      <P>The aim is to make the drawing package clearer, more complete and easier for the project team to review.</P>
      <P>It is not a statutory approval service.</P>

      <H2 id="what-building-control-cares-about">1. What Building Control is actually concerned with</H2>
      <P>
        Building Control is concerned with whether building work meets the requirements of the Building
        Regulations.
      </P>
      <P>
        Those requirements cover a wide range of technical areas, including structure, fire safety,
        resistance to moisture, ventilation, drainage, energy performance, access, electrical safety and
        other matters depending on the project.
      </P>
      <P>
        The Approved Documents provide guidance on ways to meet the Building Regulations. They are commonly
        used by designers, contractors and Building Control bodies, but they still need to be applied
        correctly to the specific project.
      </P>
      <P>A drawing package for Building Control therefore needs to do more than show the shape of a building.</P>
      <P>It may need to communicate:</P>
      <Bullets
        items={[
          "Proposed plans, elevations and sections",
          "Construction build-ups",
          "Insulation information",
          "Fire safety information",
          "Structural information or engineer’s references",
          "Drainage information",
          "Ventilation proposals",
          "Access and threshold information",
          "Stairs, guarding and escape information",
          "Window and door information",
          "Relevant notes and specifications",
          "Details for key junctions",
          "Supporting consultant or specialist information",
        ]}
      />
      <P>
        The drawings need to help the reviewer understand what is proposed and how the project intends to
        address the relevant technical requirements.
      </P>

      <H2 id="what-it-can-include">2. What Building Control drawing support can include</H2>
      <P>Building Control drawing support can include a range of practical technical tasks.</P>
      <P>
        Depending on the project, it may involve producing new drawings, updating existing drawings, adding
        technical notes, preparing construction details, reviewing missing information or coordinating
        schedules.
      </P>
      <P>Typical support can include:</P>

      <Figure caption="A practical scope — the kinds of technical drawing tasks the support can cover.">
        <BCIncludesGrid />
      </Figure>

      <Bullets
        items={[
          "AutoCAD 2D technical drawing production",
          "Plans, elevations and sections for Building Regulations information",
          "Construction details",
          "Wall, floor and roof build-up notes",
          "Insulation and thermal line information",
          "Drainage layouts and notes",
          "Basic ventilation layout coordination",
          "Window and door schedule coordination",
          "Fire and escape annotation, where directed by the project requirements",
          "Accessibility and threshold information",
          "Drawing register review",
          "Mark-ups and action lists",
          "Review of missing or inconsistent information",
        ]}
      />
      <P>
        This support is useful because Building Control drawings often sit between design intent and
        construction information. They need enough technical content to explain the proposal, but they also
        need to stay coordinated with the wider project information.
      </P>
      <P>A drawing that looks fine visually may still be missing critical information.</P>

      <H2 id="what-it-is-not">3. What Building Control drawing support is not</H2>
      <P>This boundary is important.</P>
      <P>Building Control drawing support is not the same as Building Control approval.</P>
      <P>
        It is not a guarantee that the work complies with every part of the Building Regulations. It is not
        a substitute for a structural engineer. It is not a fire strategy. It is not a warranty approval. It
        is not site inspection. It is not contract administration. It is not professional certification of
        the completed work.
      </P>
      <P>Building Control drawing support should not be described as:</P>

      <Figure caption="The boundary, stated plainly. The support prepares and coordinates information — it does not approve or certify it.">
        <BCNotGrid />
      </Figure>

      <Bullets
        items={[
          "Approving drawings",
          "Certifying compliance",
          "Replacing Building Control",
          "Replacing the architect",
          "Replacing the structural engineer",
          "Replacing a fire consultant",
          "Replacing the principal designer",
          "Replacing the contractor’s responsibility",
          "Replacing site inspection",
          "Guaranteeing approval",
        ]}
      />
      <P>The safer and more accurate position is this:</P>
      <Quote>
        Building Control drawing support helps prepare and coordinate drawings and information for review by
        the relevant project team and Building Control route.
      </Quote>
      <P>That distinction protects the client and the person providing the technical support.</P>

      <H2 id="why-it-matters">4. Why this distinction matters</H2>
      <P>The distinction matters because different people have different responsibilities.</P>
      <P>
        A technician can prepare and coordinate drawings. An architect or designer may hold design
        responsibility. A structural engineer is responsible for structural calculations and structural
        design. A fire consultant may advise on fire strategy. A contractor is responsible for carrying out
        the work properly. A Building Control body checks the work against the Building Regulations process.
      </P>
      <P>If those responsibilities are blurred, the project becomes risky.</P>
      <P>
        For example, a drawing may show a steel beam, but the beam still needs structural design by a
        competent structural engineer. A drawing may show fire-rated doors, but the rating should align with
        the fire strategy and Building Control requirements. A drawing may show drainage runs, but the pipe
        sizes, falls, connections and site conditions may require specialist input or contractor
        confirmation.
      </P>
      <P>Good technical support helps show what is proposed and where further confirmation is needed.</P>
      <P>It should not pretend that all responsibility sits in one drawing.</P>

      <H2 id="what-a-good-package-communicates">
        5. What a useful Building Control drawing package should communicate
      </H2>
      <P>A useful Building Control drawing package should be clear, coordinated and specific to the project.</P>
      <P>It should not be a planning package with a few generic notes added.</P>
      <P>A good package may need to show:</P>
      <Bullets
        items={[
          "Existing and proposed layouts",
          "Sections through important parts of the building",
          "Construction build-ups",
          "Structural zones or references to engineer’s information",
          "Escape routes and fire-related information",
          "Drainage routes and connection points",
          "Ventilation strategy or extract locations",
          "Insulation continuity",
          "Wall, floor and roof build-ups",
          "Foundation or substructure information, where relevant",
          "Access, thresholds and level changes",
          "Stairs and guarding",
          "Window and door information",
          "Key construction details",
          "Notes that match the actual project rather than generic copied text",
        ]}
      />
      <P>The level of detail depends on the project.</P>
      <P>
        A small domestic extension does not need the same information as an apartment conversion or larger
        residential scheme. But in every case, the package should be clear enough for the intended review
        and not rely on vague assumptions.
      </P>

      <H2 id="common-problems">6. Common problems with Building Control drawing sets</H2>
      <P>Many Building Control drawing sets fail because they are not properly coordinated.</P>
      <P>The drawings may contain plenty of information, but the information may not match.</P>
      <P>Common problems include:</P>
      <Bullets
        items={[
          "Planning-stage drawings reused without enough technical development",
          "Generic notes copied from previous projects",
          "Sections missing through critical areas",
          "Wall build-ups not matching details",
          "Insulation notes not coordinated with drawings",
          "Drainage shown without enough fall or route information",
          "Structural openings shown without engineer input",
          "Fire notes not reflected in door schedules",
          "Ventilation notes not shown on plans",
          "Thresholds not detailed clearly",
          "Window and door schedules missing or inconsistent",
          "Drawing register not matching the issued PDFs",
          "Old revisions included in the package",
        ]}
      />
      <P>
        These are exactly the kinds of issues that a{" "}
        <A href="/journal/how-to-review-architect-drawing-register">technical drawing review</A> can help
        identify.
      </P>
      <P>The aim is not to criticise the original drawing package. The aim is to make the next issue clearer and more reliable.</P>

      <H2 id="warranty-not-the-same">
        7. Building Control support and warranty support are not the same thing
      </H2>
      <P>Building Control and warranty review are related, but they are not identical.</P>
      <P>Building Control is concerned with compliance with the Building Regulations process.</P>
      <P>
        Warranty providers, such as NHBC or LABC Warranty, may have their own technical standards, risk
        management requirements, inspection processes and information expectations.
      </P>
      <P>A new-build residential project may therefore need to consider both:</P>
      <Bullets items={["Building Regulations information", "Warranty provider technical requirements"]} />
      <P>
        A drawing note that helps with Building Control may not be enough for warranty review. Equally, a
        warranty detail may not cover every Building Regulations issue.
      </P>
      <P>This is why technical packages need to be coordinated carefully.</P>
      <P>
        If the project is registered with a warranty provider, the drawings may need to show information
        relevant to that provider&rsquo;s standards, inspection requirements and technical expectations.
        That information should be coordinated with the Building Control drawing package rather than treated
        as a separate afterthought.
      </P>

      <H2 id="where-it-adds-value">8. Where technical drawing support adds value</H2>
      <P>
        Technical drawing support adds value by turning scattered project information into clearer drawings,
        mark-ups and action lists.
      </P>
      <P>That can include taking information from:</P>
      <Bullets
        items={[
          "Architect’s drawings",
          "Engineer’s comments",
          "Building Control comments",
          "Warranty provider comments",
          "Supplier information",
          "Site queries",
          "Client decisions",
          "Contractor mark-ups",
          "Previous revisions",
        ]}
      />
      <P>And then helping convert it into clearer drawing information.</P>

      <Figure caption="The support sits in the middle: it coordinates inputs into clearer drawings and a routed action list — the review still sits with the project team.">
        <BCBoundaryFlow />
      </Figure>

      <P>Typical outputs may include:</P>
      <Bullets
        items={[
          "Updated AutoCAD drawings",
          "Revised plans, elevations and sections",
          "Construction details",
          "Coordinated notes",
          "Updated schedules",
          "Marked-up review comments",
          "Drawing register checks",
          "Issue lists",
          "Action lists for the project team",
        ]}
      />
      <P>The value is not just drawing production.</P>
      <P>
        The value is knowing what to look for, where drawings often fail, and how to separate a simple CAD
        correction from an issue that needs architect, engineer, supplier, contractor or Building Control
        input.
      </P>

      <H2 id="what-to-send">9. What should be sent before starting</H2>
      <P>The quality of the support depends on the quality of the starting information.</P>
      <P>Before asking for Building Control drawing support, it helps to send:</P>
      <Bullets
        items={[
          "Current PDF drawing set",
          "DWG files, if available",
          "Drawing register",
          "Existing and proposed plans",
          "Elevations and sections",
          "Any current construction details",
          "Door and window schedules",
          "Structural engineer information, if available",
          "Drainage information, if available",
          "Building Control comments, if already received",
          "Warranty provider comments, if relevant",
          "Planning approval drawings, if relevant",
          "A short note explaining the issue, deadline and intended use of the package",
        ]}
      />
      <P>This allows the review to start from the real project information rather than guessing from isolated drawings.</P>
      <P>
        If the purpose is only to update a small item, the file set can be smaller. If the purpose is to
        review a full package, the register, PDFs and schedules become much more important.
      </P>

      <H2 id="good-output">10. What a good output should look like</H2>
      <P>A good Building Control drawing support output should be useful to the project team.</P>
      <P>It may include revised drawings, but it should also identify what remains unresolved.</P>
      <P>A clear output should separate:</P>
      <Bullets
        items={[
          "Items updated",
          "Missing information",
          "Drawing coordination issues",
          "Schedule issues",
          "Items requiring architect confirmation",
          "Items requiring structural engineer input",
          "Items requiring fire consultant input",
          "Items requiring supplier confirmation",
          "Items requiring Building Control or warranty provider response",
        ]}
      />
      <P>This makes the next step easier.</P>
      <P>A vague comment such as &ldquo;needs Building Control information&rdquo; does not help much.</P>
      <P>
        A precise comment such as &ldquo;Proposed roof build-up shown on section does not match detail
        reference D-302; confirm intended insulation build-up before issue&rdquo; is much more useful.
      </P>

      <H2 id="safest-description">11. The safest way to describe the service</H2>
      <P>The safest way to describe Building Control drawing support is clear and modest.</P>
      <P>It should be described as:</P>
      <Quote>
        Technical drawing support to help prepare, coordinate and review information for Building Regulations
        and Building Control review.
      </Quote>
      <P>It should not be described as:</P>
      <Quote>Building Control approval.</Quote>
      <P>This is more than legal caution. It is honest and professional.</P>
      <P>
        A good technician can improve the clarity and coordination of the drawing package. They can identify
        missing information, inconsistent notes, unclear details and likely queries. They can prepare
        drawings that help the project team communicate the proposal.
      </P>
      <P>
        But the formal Building Control process still sits with the relevant Building Control route, and
        design responsibility must remain properly allocated.
      </P>

      <H2 id="final-thoughts">Final thoughts</H2>
      <P>Building Control drawing support is valuable when it is clearly understood.</P>
      <P>
        It helps convert design intent, consultant input and technical requirements into clearer drawings
        and coordinated information. It can reduce confusion, identify missing details, improve schedules and
        support the project team before information is submitted, reviewed or used on site.
      </P>
      <P>
        But it is not approval, certification or a replacement for the architect, engineer, contractor,
        warranty provider or Building Control body.
      </P>
      <P>That boundary is important.</P>
      <P>
        At Krain Studio, Building Control drawing support forms part of wider freelance architectural
        technology services, including AutoCAD 2D technical drawing production, construction detailing,{" "}
        <A href="/services#review">drawing review</A>, schedule checks and buildability comments.
      </P>
    </>
  );
}
