import { Lead, P, H2, Bullets, Quote, A, Figure } from "@/components/journal/Prose";
import {
  Stage45HeroDiagram,
  Stage45Compare,
  Stage45OverlapTimeline,
  InfoToActionFlow,
} from "@/components/journal/Stage45Diagrams";

export function Stage4VsStage5Drawings() {
  return (
    <>
      <Lead>Stage 4 and Stage 5 are often talked about as separate project stages.</Lead>

      <P>In simple terms, Stage 4 is technical design. Stage 5 is manufacturing and construction.</P>
      <P>That sounds clear on paper, but real projects are rarely that neat.</P>

      <Figure caption="Stage 4 develops the coordinated package; Stage 5 is where that same package gets priced, ordered, built from and questioned.">
        <Stage45HeroDiagram />
      </Figure>

      <P>
        On many jobs, Stage 4 information is still being coordinated while Stage 5 activity is beginning.
        Drawings are being issued for tender, pricing, Building Control, warranty review, supplier input,
        procurement, site setup or early works. At the same time, details are still being refined,
        schedules are still being checked, supplier information is still arriving, and site queries are
        starting to come back.
      </P>
      <P>That is where technical drawing support becomes valuable.</P>
      <P>
        A drawing package may be developed enough to issue, but that does not always mean it is fully
        coordinated, buildable or suitable for every purpose people want to use it for.
      </P>
      <P>
        At Krain Studio, much of the work sits around this transition: helping turn design intent and
        technical drawings into clearer, more coordinated, more usable construction information.
      </P>
      <P>
        This article explains the practical difference between Stage 4 and Stage 5 drawings, and what
        actually changes as information moves towards site use.
      </P>

      <H2 id="stage-4-technical-design">1. Stage 4 is where technical design is developed</H2>
      <P>Stage 4 is the point where the design needs to become technically resolved.</P>
      <P>
        The architectural drawings are no longer just describing the shape, layout and appearance of the
        building. They need to explain how the building is intended to be constructed.
      </P>
      <P>That usually means developing or coordinating information such as:</P>
      <Bullets
        items={[
          "General arrangement plans",
          "Elevations",
          "Sections",
          "Roof plans",
          "Construction details",
          "Wall, floor and roof build-ups",
          "Window and door schedules",
          "Drainage layouts",
          "Fire strategy information",
          "Accessibility information",
          "Building Regulations information",
          "Warranty-related information",
          "Consultant and supplier coordination",
          "Specification notes",
          "Drawing registers and issue information",
        ]}
      />
      <P>
        The aim is to produce enough technical information for the next purpose of issue. That may be
        tender, pricing, Building Control, warranty review, procurement or construction.
      </P>
      <P>But Stage 4 is not just about producing more drawings. It is about resolving decisions.</P>
      <P>The drawings need to show how the design works technically.</P>

      <H2 id="stage-5-tested">2. Stage 5 is where drawings are tested by reality</H2>
      <P>Stage 5 is when the information starts being used in a much harder environment.</P>
      <P>
        Contractors, subcontractors, suppliers, site managers, quantity surveyors and consultants start
        relying on the drawings to make decisions.
      </P>
      <P>That is when unresolved issues become visible.</P>
      <P>
        A missing reference that was not noticed during design can become a site query. A schedule error
        can become a procurement problem. A drainage route that looked acceptable on plan can clash with
        structure. A detail copied from another project can fail to match the actual wall build-up. A
        threshold shown in principle can become difficult when levels, drainage and door system
        requirements are checked properly.
      </P>
      <P>Stage 5 is where the drawings meet:</P>
      <Bullets
        items={[
          "Site conditions",
          "Supplier requirements",
          "Lead-in times",
          "Build sequence",
          "Structural openings",
          "Drainage falls",
          "Tolerances",
          "Fire stopping",
          "Acoustic requirements",
          "Warranty inspections",
          "Building Control queries",
          "Contractor requests for information",
        ]}
      />
      <P>The drawing package may still be the same package, but the way it is used changes.</P>
      <P>
        At Stage 5, drawings are no longer just explaining the design. They are being used to build from,
        order from, price from and question from.
      </P>

      <Figure caption="The same package, two jobs: what Stage 4 develops, Stage 5 puts to work.">
        <Stage45Compare />
      </Figure>

      <H2 id="responsibility">
        3. The biggest change is the level of responsibility attached to the information
      </H2>
      <P>A Stage 4 drawing may be part of the technical design process.</P>
      <P>A Stage 5 drawing may be relied on for construction decisions.</P>
      <P>That difference matters.</P>
      <P>
        When drawings are used for construction, unclear information can have real consequences. If a door
        schedule is wrong, the wrong item may be ordered. If a section does not match the plan, someone
        has to decide which drawing takes priority. If a drainage route is not coordinated, the issue may
        only become obvious when structure or ceiling zones are considered.
      </P>
      <P>
        That does not mean every Stage 4 drawing is incomplete or every Stage 5 drawing is perfect. It
        means the risk profile changes as soon as people start relying on the information to build,
        procure or coordinate specialist packages.
      </P>
      <P>
        This is why <A href="/services#review">drawing reviews and technical audits</A> are useful before
        information is issued for site use.
      </P>
      <P>The review helps identify:</P>
      <Bullets
        items={[
          "Missing drawings",
          "Broken references",
          "Revision mismatches",
          "Schedule gaps",
          "Unclear notes",
          "Unresolved details",
          "Buildability risks",
          "Coordination issues requiring consultant or supplier input",
        ]}
      />
      <P>
        The purpose is not to make unrealistic promises. The purpose is to reduce avoidable confusion
        before the information is used more widely.
      </P>

      <H2 id="connected">4. Drawings become more connected as the project moves forward</H2>
      <P>At earlier design stages, drawings can sometimes be understood individually.</P>
      <P>At technical and construction stages, drawings need to work as a coordinated set.</P>
      <P>
        A plan must match the elevation. The elevation must match the window schedule. The schedule must
        match the supplier information. The section must match the construction detail. The detail must
        match the wall build-up. The drainage layout must work with structure and floor zones. The fire
        notes must align with the fire strategy. The accessibility notes must be reflected in the actual
        layout and thresholds.
      </P>
      <P>This is where many issues appear.</P>
      <P>The drawings may each look acceptable on their own, but fail when read together.</P>
      <P>Examples include:</P>
      <Bullets
        items={[
          "Plans updated but elevations not carried forward",
          "Window references changed but schedules not updated",
          "Sections showing old wall build-ups",
          "Details copied from a previous project",
          "Door fire ratings applied inconsistently",
          "Drainage shown without enough fall or void depth",
          "Supplier information received but not reflected in the drawings",
          "Structural zones not allowed for in architectural details",
        ]}
      />
      <P>The closer a package gets to construction, the more important this cross-checking becomes.</P>
      <P>Stage 5 does not forgive isolated drawing thinking. The package has to coordinate.</P>

      <H2 id="register">5. The drawing register becomes more important</H2>
      <P>At Stage 4 and Stage 5, the drawing register is not just admin.</P>
      <P>It becomes the map to the package.</P>
      <P>The register should make clear:</P>
      <Bullets
        items={[
          "What drawings exist",
          "What revision each drawing is at",
          "What each drawing is called",
          "When it was issued",
          "What status or purpose the issue has",
          "Which drawings have been superseded",
          "Which drawings are included in the current package",
        ]}
      />
      <P>If the drawing register is wrong, the project team may rely on the wrong information.</P>
      <P>
        A common problem is where the register lists one revision, the PDF file name shows another, and
        the title block shows another. Another common problem is where a drawing is listed on the register
        but missing from the issue folder.
      </P>
      <P>
        At Stage 5, these mistakes matter because people may be using the issue to price work, order
        materials, raise queries or carry out construction.
      </P>
      <P>
        A technical review should{" "}
        <A href="/journal/how-to-review-architect-drawing-register">
          compare the register against the actual PDF/DWG issue
        </A>
        , not just assume that the list is correct.
      </P>

      <H2 id="schedules">6. Schedules become more than supporting documents</H2>
      <P>
        Schedules can look like background information, but they become critical as the project moves
        towards construction.
      </P>
      <P>
        Door schedules, window schedules, accommodation schedules, finishes schedules and other technical
        schedules often drive pricing, procurement and installation.
      </P>
      <P>A schedule issue can therefore become a real project issue.</P>
      <P>Common problems include:</P>
      <Bullets
        items={[
          "Door numbers missing from the schedule",
          "Window marks not matching the elevations",
          "Old references left in the schedule",
          "Fire ratings not coordinated",
          "External door requirements unclear",
          "Security notes missing",
          "Supplier assumptions not checked",
          "Schedule revision not matching the drawings",
          "Sizes not clear enough for procurement",
        ]}
      />
      <P>
        At Stage 4, schedules may be developing. At Stage 5, those schedules may be used by contractors
        and suppliers.
      </P>
      <P>That shift is important.</P>
      <P>
        The schedule needs to be{" "}
        <A href="/journal/why-window-and-door-schedules-go-wrong">checked against the drawings</A> before
        people rely on it.
      </P>

      <H2 id="details">7. Details need to move from generic to project-specific</H2>
      <P>A generic detail may be acceptable as a starting point.</P>
      <P>It is rarely enough as final construction information.</P>
      <P>
        As the project moves towards Stage 5, details need to reflect the actual conditions of the
        building. That includes wall build-ups, floor depths, roof forms, openings, thresholds, insulation
        continuity, cavity barriers, DPCs, fire stopping, acoustic requirements, structural zones and
        supplier systems.
      </P>
      <P>The question is not simply:</P>
      <Quote>Does a detail exist?</Quote>
      <P>The better question is:</P>
      <Quote>Does this detail match this project, this location and this construction condition?</Quote>
      <P>Common problems include:</P>
      <Bullets
        items={[
          "Standard details not adjusted to the project",
          "Details that do not match the plan",
          "Details that refer to old wall build-ups",
          "Threshold details not coordinated with external levels",
          "Eaves or verge details not matching the roof form",
          "Window head/cill details not matching the chosen frame",
          "Fire or acoustic requirements not shown clearly",
          "Missing specialist input notes where required",
        ]}
      />
      <P>
        Stage 5 information needs to be usable. A detail that exists but does not match the condition can
        be worse than no detail, because it gives false confidence.
      </P>

      <H2 id="consultant-supplier">
        8. Consultant and supplier information starts to affect the drawings
      </H2>
      <P>As a project moves forward, more information comes from outside the architectural team.</P>
      <P>
        Structural engineers, drainage designers, fire consultants, M&amp;E consultants, window
        suppliers, door suppliers, warranty providers and Building Control bodies may all provide comments
        or information that affects the architectural package.
      </P>
      <P>The issue is making sure that information is carried through properly.</P>
      <P>
        Supplier information sitting in an email is not the same as coordinated construction information. A
        structural comment in a PDF is not useful if the architectural drawings still show the old
        arrangement. A fire strategy note is not fully useful if the door schedule has not been updated.
      </P>
      <P>Stage 5 coordination often involves checking whether external information has been reflected in:</P>
      <Bullets
        items={[
          "Plans",
          "Sections",
          "Elevations",
          "Details",
          "Schedules",
          "Specifications",
          "Drawing registers",
          "Revision notes",
        ]}
      />
      <P>The architectural package becomes the place where many pieces of information meet.</P>
      <P>That is why technical coordination is so important.</P>

      <H2 id="site-queries">9. Site queries expose unclear information</H2>
      <P>A site query is often a symptom.</P>
      <P>
        Sometimes it is caused by an unexpected site condition. Sometimes it is caused by a genuine design
        decision that still needs to be made. But often, the query appears because the drawings do not
        explain something clearly enough.
      </P>
      <P>Common examples include:</P>
      <Bullets
        items={[
          "Which detail applies here?",
          "What is the current revision?",
          "Is this door fire-rated?",
          "Does this window match the schedule?",
          "How does this drainage route work with the joists?",
          "What is the threshold build-up?",
          "Where is the structural opening dimension?",
          "Has Building Control commented on this?",
          "Is this supplier drawing approved for use?",
          "Does this note still apply?",
        ]}
      />
      <P>At Stage 5, the drawings need to help answer those questions.</P>
      <P>
        A good drawing package will not remove every query. Construction always involves coordination and
        judgement. But a better package reduces avoidable questions caused by missing, conflicting or
        unclear information.
      </P>

      <H2 id="drawings-to-actions">10. The output changes from drawings to actions</H2>
      <P>At Stage 4, the focus is often on producing the information.</P>
      <P>At Stage 5, the focus shifts towards resolving what the information means in practice.</P>
      <P>
        That is why a technical review should not just return marked-up drawings. It should also return a
        clear action list.
      </P>

      <Figure caption="A review turns a package into a set of next actions, each routed to whoever can resolve it.">
        <InfoToActionFlow />
      </Figure>

      <P>A useful action list might separate:</P>
      <Bullets
        items={[
          "CAD corrections",
          "Missing information",
          "Revision issues",
          "Schedule mismatches",
          "Drawing coordination issues",
          "Buildability risks",
          "Consultant input required",
          "Supplier input required",
          "Building Control or warranty queries",
          "Client or design decisions required",
        ]}
      />
      <P>This helps the project team understand what needs to happen next.</P>
      <P>
        Some items can be fixed quickly by updating drawings. Other items need confirmation from the
        architect, engineer, supplier, contractor, client or Building Control body.
      </P>
      <P>The value is in making the next action clear.</P>

      <H2 id="not-a-hard-wall">11. Stage 4 and Stage 5 should not be treated as a hard wall</H2>
      <P>In theory, Stage 4 comes before Stage 5.</P>
      <P>In practice, there is often overlap.</P>

      <Figure caption="In practice the stages overlap — and the overlap is exactly where review, coordination and queries cluster.">
        <Stage45OverlapTimeline />
      </Figure>

      <P>
        Some packages move into construction while technical information is still being completed. Some
        projects have early works while later details are still being developed. Some suppliers need
        information before every drawing is fully resolved. Some contractors start asking questions while
        revisions are still moving.
      </P>
      <P>That is normal, but it needs control.</P>
      <P>
        The danger is when the project team treats developing information as if it is fully coordinated
        construction information.
      </P>
      <P>
        A drawing can be useful without being complete. A package can be issued without being suitable for
        every use. A schedule can support pricing without being ready for final order. A detail can show
        design intent while still needing supplier input.
      </P>
      <P>The key is clarity.</P>
      <P>
        Everyone needs to understand what the information is for, what is resolved, what is still subject
        to confirmation, and what should not yet be relied on for final construction or procurement.
      </P>

      <H2 id="final-thoughts">Final thoughts</H2>
      <P>The difference between Stage 4 and Stage 5 is not just a label.</P>
      <P>It is a shift in how drawings are used.</P>
      <P>
        At Stage 4, the team is developing the technical design. At Stage 5, that information is being
        tested by manufacturing, procurement, site conditions, construction sequencing and real project
        decisions.
      </P>
      <P>
        That is why technical drawing review, schedule checking, buildability review and site-query
        support can make such a difference at this point in a project.
      </P>
      <P>
        The aim is not to replace the architect, engineer, contractor, warranty provider or Building
        Control body. The aim is to help identify missing information, conflicting drawings, unclear
        details and coordination risks before they become bigger problems.
      </P>
      <P>
        Krain Studio provides freelance architectural technology support for technical CAD production,
        drawing review, construction detailing and{" "}
        <A href="/services">Stage 4/5 technical package support</A>.
      </P>
    </>
  );
}
