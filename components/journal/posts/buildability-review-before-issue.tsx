import { Lead, P, H2, Bullets, Quote, A, Figure, Img } from "@/components/journal/Prose";
import { JunctionsSection, ContractorQuestions } from "@/components/journal/BuildabilityDiagrams";

const IMG = "/krain/journal";

export function BuildabilityReviewBeforeIssue() {
  return (
    <>
      <Lead>A drawing can look finished and still not be ready to build from.</Lead>

      <P>
        It can have clean linework, a tidy title block, a revision cloud, a drawing number and a
        professional layout. But that does not automatically mean the information is coordinated, complete
        or practical on site.
      </P>
      <P>The real question is not only:</P>
      <Quote>Does the drawing look correct?</Quote>
      <P>The better question is:</P>
      <Quote>Can someone actually build from this without guessing?</Quote>
      <P>That is where buildability review matters.</P>

      <Figure caption="A buildability review reads the whole package the way the site will — testing whether the junctions, levels, drainage, structure and schedules actually resolve before issue.">
        <Img
          src={`${IMG}/buildability-review-before-issue-hero.webp`}
          alt="An architectural drawing package — floor plan, section, detail sheet and schedule — laid out on a dark desk, with review markers flagging the junction, levels, drainage, schedule and structure conditions a buildability review checks before a drawing is issued."
          width={1024}
          height={572}
        />
      </Figure>

      <P>
        A buildability review looks at drawings from the point of view of construction, coordination and
        site use. It checks whether the information is clear enough, whether key junctions are resolved,
        whether related drawings agree, and whether the package raises obvious risks before it is issued.
      </P>
      <P>
        At Krain Studio, buildability review sits alongside{" "}
        <A href="/services#review">technical CAD production, drawing audits</A>, schedule checks and
        construction detailing. The aim is not to replace the architect, engineer, contractor, warranty
        provider or Building Control body. The aim is to identify missing information, unclear details and
        coordination risks before they become site questions.
      </P>
      <P>This article explains the questions we ask before a drawing is issued.</P>

      <Figure caption="How a buildability review runs: the drawing package becomes a marked-up set of risks, then an action list, then resolved information — before it is issued, priced or used on site.">
        <Img
          src={`${IMG}/buildability-review-flow.webp`}
          alt="Buildability review flow diagram: a drawing package goes through a buildability review, which produces marked-up risks, then an action list, then project-team resolution, before the information is issued, priced or used on site."
          width={1024}
          height={559}
        />
      </Figure>

      <H2 id="stands-alone">
        1. Can the drawing be understood by someone who has not been in the meetings?
      </H2>
      <P>This is one of the most important tests.</P>
      <P>
        Many drawings make sense to the person who produced them because they know the project history.
        They remember the design meetings, email decisions, client comments and consultant discussions.
      </P>
      <P>The site team may not.</P>
      <P>
        A contractor or subcontractor may only receive the drawings, schedules and specifications. They may
        not know which assumptions sit behind the drawing. They may not know which decisions are still
        unresolved. They may not know that a note was copied from an older revision and no longer applies.
      </P>
      <P>So the first buildability question is:</P>
      <Quote>Can this drawing stand on its own?</Quote>
      <P>We look for:</P>
      <Bullets
        items={[
          "Clear drawing title",
          "Correct revision information",
          "Readable notes",
          "Clear dimensions",
          "Relevant section and detail references",
          "Obvious drawing status",
          "Clear relationship to other drawings",
          "Unresolved items identified rather than hidden",
          "No reliance on private project knowledge",
        ]}
      />
      <P>
        If a drawing only makes sense to the person who drew it, it is not ready enough for wider issue.
      </P>

      <H2 id="coordinated">2. Are the plans, sections and details coordinated?</H2>
      <P>A buildable package needs joined-up information.</P>
      <P>
        A plan may show one condition. A section may show another. A detail may show a third. Each drawing
        may look acceptable on its own, but the project team needs to know which information applies.
      </P>
      <P>We check whether the drawings agree with each other.</P>
      <P>Typical questions include:</P>
      <Bullets
        items={[
          "Does the section match the plan?",
          "Does the detail match the section?",
          "Does the wall build-up match the notes?",
          "Does the roof detail match the roof plan?",
          "Does the window head detail match the elevation?",
          "Does the threshold detail match the external levels?",
          "Does the drainage route match the floor plan?",
          "Does the door schedule match the plan?",
        ]}
      />
      <P>Many site questions begin with drawing disagreement.</P>
      <P>
        If a contractor has to decide between the plan and the detail, the package is creating unnecessary
        risk.
      </P>

      <H2 id="junctions">3. Are the key junctions resolved?</H2>
      <P>Buildings often succeed or fail at junctions.</P>
      <P>
        The difficult parts are not usually the large open areas of wall or floor. The difficult parts are
        where things meet.
      </P>
      <P>We look closely at junctions such as:</P>
      <Bullets
        items={[
          "Wall to floor",
          "Wall to roof",
          "Roof to parapet",
          "Eaves and verge",
          "Door thresholds",
          "Window heads, cills and jambs",
          "Cavity closers",
          "DPC and DPM continuity",
          "Insulation continuity",
          "Balcony or terrace interfaces",
          "External wall to internal partition",
          "New construction meeting existing construction",
          "Service penetrations through fire or acoustic lines",
        ]}
      />

      <Figure caption="Buildings tend to succeed or fail where things meet — the junctions, not the open spans.">
        <JunctionsSection />
      </Figure>

      <P>
        A general arrangement drawing may show the arrangement in principle, but the junction detail
        explains how it works.
      </P>
      <P>
        If the package has no detail for a critical junction, or if the detail is generic and does not
        match the project, the risk should be flagged before issue.
      </P>

      <H2 id="structure">4. Is there enough space for structure?</H2>
      <P>Architectural drawings need to allow for structure.</P>
      <P>That sounds obvious, but it is a common source of problems.</P>
      <P>
        A ceiling zone may look fine until a steel beam is allowed for. A drainage route may look simple
        until joist directions are checked. A roof detail may look neat until rafter depths, truss zones or
        insulation requirements are added.
      </P>
      <P>We ask:</P>
      <Bullets
        items={[
          "Has the structural zone been allowed for?",
          "Do openings align with structural logic?",
          "Are lintels, beams or padstones likely to clash with other information?",
          "Is there enough ceiling depth for structure and services?",
          "Does the roof build-up allow for actual structural depth?",
          "Do drainage routes pass through structural elements?",
          "Do sections reflect the likely structural arrangement?",
          "Is structural engineer input required before issue?",
        ]}
      />
      <P>
        This is not about doing the engineer&rsquo;s job. It is about identifying where the architectural
        information may not have allowed for the structural reality.
      </P>
      <P>
        If a drawing relies on a beam being impossibly shallow or a pipe passing through a steel without
        coordination, the issue needs to be raised.
      </P>

      <H2 id="drainage">5. Is drainage actually workable?</H2>
      <P>Drainage often looks easy on a plan.</P>
      <P>
        A line is drawn from one point to another. The route appears clear. The drawing moves on.
      </P>
      <P>
        But on site, drainage needs falls, space, access, coordination with structure, coordination with
        fire and acoustic requirements, and a realistic route to a connection point.
      </P>
      <P>We check:</P>
      <Bullets
        items={[
          "Is the drainage route clear?",
          "Is there enough fall?",
          "Is the pipe run too long or too shallow?",
          "Are SVPs sensibly located?",
          "Does drainage clash with joists, steels or foundations?",
          "Are boxing and service voids allowed for?",
          "Are access points shown where needed?",
          "Are penetrations through walls/floors considered?",
          "Does drainage affect fire or acoustic separation?",
          "Does the route depend on assumptions that need confirming?",
        ]}
      />
      <P>
        A buildability review does not replace a drainage designer or contractor, but it can flag obvious
        risks before the drawing is issued.
      </P>
      <P>If drainage cannot physically fit through the zone shown, it is better to find that before site starts.</P>

      <H2 id="levels">6. Are levels and thresholds clear?</H2>
      <P>Levels are one of the most expensive things to get wrong.</P>
      <P>
        A threshold detail might look fine in principle, but it needs to work with external ground levels,
        drainage, door system requirements, DPCs, insulation, accessibility and weathering.
      </P>
      <P>We check:</P>
      <Bullets
        items={[
          "Are finished floor levels clear?",
          "Are external levels clear?",
          "Are steps, ramps or falls shown?",
          "Are level-access requirements identified where relevant?",
          "Does the threshold detail manage water properly?",
          "Does the DPC/DPM arrangement make sense?",
          "Does the door frame fit the build-up?",
          "Are balcony or terrace levels coordinated?",
          "Are drainage channels or falls required?",
          "Is there enough information for site setting out?",
        ]}
      />
      <P>
        Unclear levels create site risk because they affect structure, drainage, access, waterproofing and
        finishes.
      </P>
      <P>
        A drawing package should not leave threshold logic to be solved on site unless that is clearly
        intended and controlled.
      </P>

      <H2 id="schedules">7. Do the schedules match the drawings?</H2>
      <P>Schedules are often where buildability problems hide.</P>
      <P>
        A window or door schedule may appear complete, but it still needs to match the plans, elevations
        and details.
      </P>
      <P>We check:</P>
      <Bullets
        items={[
          "Are all doors and windows scheduled?",
          "Do schedule references match the plans?",
          "Do window marks match the elevations?",
          "Are fire ratings coordinated?",
          "Are security notes clear?",
          "Are external and internal doors separated properly?",
          "Do scheduled sizes match the drawn openings?",
          "Are threshold requirements identified?",
          "Has supplier information been incorporated?",
          "Are old references still present?",
        ]}
      />
      <P>
        Schedules are used for pricing, ordering and installation. If the schedule is wrong, the wrong item
        can be ordered.
      </P>
      <P>
        That is why <A href="/journal/why-window-and-door-schedules-go-wrong">schedule review</A> is part of
        buildability review, not just document control.
      </P>

      <Figure caption="Four ways a drawing package creates buildability risk — missing information, conflicting drawings, unresolved junctions, and site or practical risk.">
        <Img
          src={`${IMG}/buildability-risk-buckets.webp`}
          alt="Four common buildability risk categories shown as labelled panels: missing information, conflicting drawings, unresolved junctions, and site or practical risk, each illustrated with simplified drawing fragments."
          width={1024}
          height={559}
        />
      </Figure>

      <H2 id="supplier">8. Has supplier information been properly coordinated?</H2>
      <P>Supplier information can improve a package, but only if it is properly fed back into the drawings.</P>
      <P>
        A supplier may confirm sizes, frame depths, cill profiles, installation requirements, ventilation
        requirements, fire certification, security certification or system constraints.
      </P>
      <P>The question is:</P>
      <Quote>Has that information changed the drawings?</Quote>
      <P>We look for signs that supplier information is floating outside the package:</P>
      <Bullets
        items={[
          "Supplier dimensions not reflected in the schedule",
          "Frame details not updated",
          "Cill or threshold requirements missing",
          "Product assumptions not noted",
          "Fire or security certificates not coordinated",
          "Specialist drawings referenced but not included",
          "Supplier comments not carried into revisions",
          "Installation requirements not reflected in details",
        ]}
      />
      <P>An email from a supplier is not the same as coordinated construction information.</P>
      <P>
        If the drawing package is going to be used for construction or procurement, important supplier
        information should be visible where the project team needs it.
      </P>

      <H2 id="performance-lines">9. Are fire, acoustic and thermal lines understood?</H2>
      <P>A buildability review should look for the important performance lines in the building.</P>
      <P>
        Fire, acoustic and thermal requirements are not just notes. They affect junctions, penetrations,
        doors, walls, floors, ceilings, service routes and details.
      </P>
      <P>We check whether the drawings make these issues clear enough.</P>
      <P>Questions include:</P>
      <Bullets
        items={[
          "Where are the fire lines?",
          "Where are the acoustic separations?",
          "Where is insulation continuity required?",
          "Do service penetrations affect fire or acoustic performance?",
          "Do doors and walls align with fire strategy requirements?",
          "Are cavity barriers or fire stopping zones considered?",
          "Do details show the intended thermal line?",
          "Are cold bridges or awkward junctions likely?",
          "Do notes match the drawings?",
        ]}
      />
      <P>
        This is not about replacing specialist input. It is about asking whether the architectural drawings
        communicate the intent clearly enough and whether obvious coordination gaps exist.
      </P>
      <P>If a pipe route cuts through a compartment line, someone needs to know before it becomes a site issue.</P>

      <H2 id="copied-notes">10. Are copied notes and standard details still valid?</H2>
      <P>Copied information is one of the quiet risks in technical drawing packages.</P>
      <P>
        Standard details and notes are useful. They save time and promote consistency. But they become
        dangerous when they are copied without being checked against the current project.
      </P>
      <P>We look for:</P>
      <Bullets
        items={[
          "Notes that refer to the wrong wall type",
          "Old project references",
          "Outdated specification notes",
          "Generic details that do not match the plan",
          "Details showing materials not used on the project",
          "Incorrect fire, acoustic or insulation notes",
          "Planning-stage wording left in technical drawings",
          "Revision clouds left from previous issues",
          "Standard details used for non-standard conditions",
        ]}
      />
      <P>
        A copied detail is not automatically wrong. But every standard detail needs to earn its place in
        the package.
      </P>
      <P>The test is simple:</P>
      <Quote>Does this detail match the actual condition being built?</Quote>

      <H2 id="unresolved">11. Is the drawing clear about what still needs confirming?</H2>
      <P>Not every drawing can answer every question.</P>
      <P>
        Sometimes a drawing is issued while waiting for structural input, supplier confirmation, client
        decisions, site information or Building Control comments.
      </P>
      <P>That is normal, but the drawing should be honest about it.</P>
      <P>We look for unresolved items that are hidden rather than identified.</P>
      <P>Examples include:</P>
      <Bullets
        items={[
          "“Subject to structural engineer confirmation”",
          "“Supplier to confirm”",
          "“Site dimension to be checked”",
          "“Existing drainage route to be confirmed”",
          "“Fire strategy to confirm”",
          "“Manufacturer’s details to be incorporated”",
          "“Opening size subject to survey”",
          "“Final specification TBC”",
        ]}
      />
      <P>
        These notes should not be used to avoid coordination, but they can be useful when something
        genuinely remains unresolved.
      </P>
      <P>The important thing is that unresolved items are visible, tracked and actioned.</P>
      <P>Hidden assumptions create problems. Clear assumptions can be managed.</P>

      <H2 id="contractor">12. What would the contractor ask first?</H2>
      <P>This is a useful final test.</P>
      <P>
        Before a drawing is issued, we look at it from the point of view of the person who has to use it.
      </P>
      <P>What would they ask?</P>

      <Figure caption="The fastest readiness check: read the sheet as the person who has to build from it, and answer their questions before they have to ask.">
        <ContractorQuestions />
      </Figure>

      <P>
        If the likely questions are obvious, the drawing package should try to answer them before issue.
      </P>
      <P>A buildability review does not remove every future query, but it should reduce the avoidable ones.</P>

      <H2 id="final-thoughts">Final thoughts</H2>
      <P>A buildability review is not about criticising a drawing package.</P>
      <P>
        It is about asking whether the information is clear, coordinated and practical enough for the next
        use.
      </P>
      <P>
        A drawing can be visually tidy and still contain missing information, broken references, unresolved
        junctions, schedule mismatches or coordination risks. Those issues are much easier to deal with
        before the drawings are issued than after they become site questions.
      </P>

      <Figure caption="The twelve questions behind a buildability review, in one view — the checks that decide whether a sheet is ready to leave the office.">
        <Img
          src={`${IMG}/buildability-review-12-questions.webp`}
          alt="Infographic listing the twelve buildability questions to ask before a drawing is issued, numbered one to twelve, from “can someone understand it without the meeting history?” through drainage, levels, schedules and supplier information to “what would the contractor ask first?”."
          width={1024}
          height={559}
        />
      </Figure>

      <P>
        At Krain Studio, buildability reviews form part of wider freelance architectural technology
        support, including <A href="/journal/how-to-review-architect-drawing-register">drawing audits</A>,
        AutoCAD 2D technical production, construction detailing, schedule checks,{" "}
        <A href="/journal/building-control-drawing-support">Building Control drawing support</A> and{" "}
        <A href="/journal/stage-4-vs-stage-5-drawings">Stage 4/5 package support</A>.
      </P>
    </>
  );
}
