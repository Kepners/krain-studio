import { Lead, P, H2, Bullets, Quote, Figure } from "@/components/journal/Prose";
import {
  HeroScheduleDiagram,
  CoordinationTriangle,
  ErrorToSiteFlow,
  CommonErrorsGrid,
} from "@/components/journal/Diagrams";

export function WhyWindowDoorSchedulesGoWrong() {
  return (
    <>
      <Lead>Window and door schedules look simple until they are wrong.</Lead>

      <P>
        On many projects, the schedule is treated as a supporting document: something that sits behind
        the plans and elevations. But in practice, the window and door schedule is one of the most
        important coordination documents in a technical drawing package.
      </P>
      <P>
        It affects pricing, procurement, Building Control information, warranty review, fire strategy,
        security requirements, manufacturing, site installation and client expectations.
      </P>
      <P>
        A schedule error is not just a drawing issue. It can become a cost issue, a delay issue, a
        compliance issue or a site query.
      </P>

      <Figure caption="A single mismatched row — W02 scheduled at a size the elevation never showed. Anonymised, illustrative references only.">
        <HeroScheduleDiagram />
      </Figure>

      <P>
        At Krain Studio, window and door schedule review is one of the areas where technical drawing
        checks can add real value. The errors are often small, but they can travel a long way through
        the project if nobody catches them early.
      </P>
      <P>
        This article explains why window and door schedules go wrong and what should be checked before
        drawings are issued or relied on for construction.
      </P>

      <Figure caption="How a small reference error travels: from the schedule, into a quote, onto site, and into the programme.">
        <ErrorToSiteFlow />
      </Figure>

      <H2 id="schedule-vs-plans">1. The schedule does not match the plans</H2>
      <P>The most basic problem is also one of the most common.</P>
      <P>
        A plan shows a door reference, but that reference is missing from the schedule. An elevation
        shows a window mark, but the schedule lists a different mark. A window is changed on plan, but
        the old reference remains on the elevation.
      </P>
      <P>This usually happens because drawings change at different times.</P>
      <P>
        The plan may be updated first. The elevation may be updated later. The schedule may be copied
        from a previous issue. The door numbers may be revised after a design change. Somewhere in that
        process, the package stops matching itself.
      </P>
      <P>Typical problems include:</P>
      <Bullets
        items={[
          "Door references shown on plan but missing from the schedule",
          "Window marks shown on elevation but not on plan",
          "Schedule references that no longer appear anywhere",
          "Duplicate door or window numbers",
          "Old references left over from previous revisions",
          "Different naming systems used between plans, elevations and schedules",
          "Schedules issued at a different revision to the drawings",
        ]}
      />
      <P>
        The fix is not complicated, but it takes discipline. Every window and door reference needs to be
        checked across the plan, elevation and schedule as a set.
      </P>
      <P>The question is simple:</P>
      <Quote>
        Does every item shown on the drawings exist in the schedule, and does every scheduled item
        appear on the drawings?
      </Quote>

      <H2 id="elevations-plans">2. Elevations and plans are not coordinated</H2>
      <P>A window or door schedule cannot be checked from the plan alone.</P>
      <P>
        Plans show location and swing. Elevations show appearance, proportion, opening style and
        relationship to external materials. Sections and details may show thresholds, heads, cills,
        reveals and structural zones.
      </P>
      <P>If these drawings do not agree, the schedule becomes unreliable.</P>
      <P>Common examples include:</P>
      <Bullets
        items={[
          "A window size changed on elevation but not updated in the schedule",
          "A door shown as glazed on elevation but described as solid in the schedule",
          "A window opening style shown one way graphically and described another way in text",
          "A double door drawn on elevation but scheduled as a single door",
          "A door swing shown on plan but not coordinated with access, furniture or circulation",
          "A window head height not matching the intended ceiling or lintel zone",
        ]}
      />

      <Figure caption="The coordination triangle: plans, elevations and the schedule all describe the same opening. They must agree before issue.">
        <CoordinationTriangle />
      </Figure>

      <P>
        This is where technical review matters. A drawing may look correct in isolation, but the package
        may still be wrong when the drawings are compared against one another.
      </P>
      <P>
        A schedule should not be treated as a separate spreadsheet-style exercise. It needs to be read
        against the drawings that define the actual building.
      </P>

      <H2 id="fire-ratings">3. Fire ratings get copied without enough thought</H2>
      <P>Door schedules often include fire-rating columns.</P>
      <P>
        That is useful, but it can also create errors if ratings are copied forward from another
        project, another layout or an earlier revision without proper review.
      </P>
      <P>
        A door schedule may include FD30, FD60, smoke seals, self-closers or other fire-related notes.
        Those notes need to align with the building type, fire strategy, compartmentation, protected
        routes, flat entrance requirements, service cupboards, escape routes and any specific Building
        Control or fire consultant input.
      </P>
      <P>Common errors include:</P>
      <Bullets
        items={[
          "Fire ratings applied to doors that do not require them",
          "Fire ratings missing from doors that may require them",
          "Smoke seal notes applied inconsistently",
          "Flat entrance doors not distinguished clearly from internal doors",
          "Service cupboard doors treated the same as normal internal doors",
          "External doors incorrectly given internal fire-door requirements",
          "Old fire-rating notes left in the schedule after a layout change",
        ]}
      />
      <P>
        The important point is not that every door should be fire-rated. The important point is that the
        schedule should reflect the actual fire strategy and project requirements.
      </P>
      <P>
        A technical drawing review can flag inconsistencies, but it should not pretend to replace the
        fire consultant, architect, Building Control body or approved inspector.
      </P>
      <P>The right output is a clear query:</P>
      <Quote>
        This door rating appears inconsistent with the rest of the package. Please confirm requirement.
      </Quote>
      <P>
        That kind of comment helps the project team resolve the issue before it becomes a procurement or
        site problem.
      </P>

      <H2 id="security">4. Security requirements are not clearly identified</H2>
      <P>External doors and accessible windows often carry security requirements.</P>
      <P>
        For new dwellings in England, Approved Document Q gives guidance on security for doors and
        windows. It refers to doorsets and windows tested to PAS 24. The later PAS 24:2022 standard is
        the current BSI-listed enhanced-security performance standard for doorsets and windows.
      </P>
      <P>
        This matters because a vague schedule note such as &ldquo;secure door&rdquo; is not the same as a
        properly coordinated requirement.
      </P>
      <P>Common issues include:</P>
      <Bullets
        items={[
          "PAS 24 notes missing from relevant external doors",
          "PAS 24 notes copied onto doors where they may not apply",
          "Windows requiring security performance not clearly identified",
          "External service doors or cupboard doors not considered properly",
          "Supplier information not matching the schedule notes",
          "Security notes hidden in general notes instead of the relevant schedule line",
        ]}
      />
      <P>Security requirements need to be clear enough for specification, pricing and procurement.</P>
      <P>
        A contractor or supplier should not have to guess whether a particular doorset or window needs
        enhanced security performance. If the requirement applies, it should be visible in the schedule
        and coordinated with the drawings and specification.
      </P>

      <H2 id="external-vs-internal">5. External doors are confused with internal doors</H2>
      <P>External doors and internal doors perform different jobs.</P>
      <P>
        An external doorset may need to address weathering, security, threshold design, thermal
        performance, accessibility, drainage, frame installation, tolerance, airtightness and warranty
        requirements. An internal door may be more focused on fire, acoustic, privacy, durability or
        circulation requirements.
      </P>
      <P>Problems arise when the schedule treats all doors as if they are the same.</P>
      <P>Examples include:</P>
      <Bullets
        items={[
          "External doors missing threshold information",
          "Balcony doors not coordinated with external levels",
          "Service cupboard doors described like internal doors",
          "Entrance doors missing security or weather performance notes",
          "External fire escape doors not clearly distinguished",
          "Internal doors given external door terminology by mistake",
          "Supplier package information not separated properly",
        ]}
      />
      <P>The schedule needs enough structure to distinguish between door types.</P>
      <P>
        A simple &ldquo;door schedule&rdquo; can quickly become unclear if it mixes flat entrance doors,
        internal doors, external doors, service doors, fire doors, cupboard doors and balcony doors
        without a consistent system.
      </P>

      <H2 id="thresholds">6. Thresholds and access are not coordinated</H2>
      <P>Threshold details are a frequent source of site questions.</P>
      <P>
        A door may be correctly scheduled, but the threshold condition may still be unresolved. This is
        especially important at main entrances, accessible entrances, patio doors, balcony doors and
        communal entrances.
      </P>
      <P>
        The schedule may list the door size and type, but the detail needs to answer practical
        questions:
      </P>
      <Bullets
        items={[
          "What is the threshold level?",
          "Is level access required?",
          "How is water managed?",
          "How does the door frame meet the external surface?",
          "Is there enough upstand?",
          "Is the insulation and DPC/DPM continuity clear?",
          "Is the external paving or balcony level coordinated?",
          "Does the detail work with the selected door system?",
        ]}
      />
      <P>
        If threshold information is missing, the installer may have a door, but not a fully resolved
        construction condition.
      </P>
      <P>
        Window and door schedule review should therefore include a check against details, sections and
        external level information, not just a review of the schedule table.
      </P>

      <H2 id="structural-openings">7. Structural openings and scheduled sizes drift apart</H2>
      <P>
        One of the biggest risks with windows and doors is the difference between a scheduled item size
        and the actual structural opening.
      </P>
      <P>
        A schedule might show a frame size. A plan might show an opening. An elevation might show a
        different proportion. A supplier quote might use another dimension altogether.
      </P>
      <P>If nobody clarifies what the schedule dimensions represent, confusion follows.</P>
      <P>Are the dimensions:</P>
      <Bullets
        items={[
          "Structural opening size?",
          "Frame size?",
          "Door leaf size?",
          "Clear opening width?",
          "Manufacturing size?",
          "Rough opening?",
          "Brickwork opening?",
          "Planning / elevation design size?",
        ]}
      />
      <P>
        This needs to be clear. Otherwise, the project team may think they are all talking about the same
        dimension when they are not.
      </P>
      <P>Common issues include:</P>
      <Bullets
        items={[
          "Scheduled sizes not matching elevations",
          "Clear opening requirements not checked",
          "Door leaf sizes confused with overall frame sizes",
          "Window sizes changed for planning but not updated technically",
          "Brick coursing or masonry coordination ignored",
          "Lintel sizes or structural zones not considered",
          "Supplier dimensions not reflected back into the drawings",
        ]}
      />
      <P>
        A good review flags these risks before procurement. Once windows and doors are ordered, errors
        become much more expensive.
      </P>

      <H2 id="supplier-info">8. Supplier information is not fed back into the drawings</H2>
      <P>
        Window and door suppliers often provide useful information, but it does not always get properly
        coordinated back into the architectural package.
      </P>
      <P>
        The supplier may confirm frame depths, cill requirements, coupling details, trickle vent
        requirements, threshold options, restrictors, ironmongery, security certification, fire
        certification or installation requirements.
      </P>
      <P>
        If that information sits only in an email, quote or supplier PDF, the architectural drawings may
        remain incomplete.
      </P>
      <P>Common problems include:</P>
      <Bullets
        items={[
          "Supplier dimensions not reflected in the schedule",
          "Selected systems not noted",
          "Cill / head / reveal details not updated",
          "Trickle ventilation information not coordinated",
          "Frame colour or finish missing",
          "Restrictor or guarding requirements unclear",
          "Fire / security certification not cross-checked",
          "Supplier assumptions not reviewed",
        ]}
      />
      <P>
        The schedule should become more accurate as supplier information is received. It should not
        remain a generic design-stage table if it is being used for construction or procurement.
      </P>

      <H2 id="revisions">9. Revisions are not carried through the whole package</H2>
      <P>Window and door changes often happen late.</P>
      <P>
        A client changes a door. A window is resized. A fire strategy comment changes a rating. A
        Building Control query affects a threshold. A supplier changes a frame detail. A
        value-engineering exercise swaps a product type.
      </P>
      <P>The problem is not the change. The problem is when the change is only made in one place.</P>
      <P>A late window or door change may need to be carried through:</P>
      <Bullets
        items={[
          "Floor plans",
          "Elevations",
          "Sections",
          "Schedules",
          "Construction details",
          "Structural openings",
          "Lintel information",
          "Supplier information",
          "Planning drawings, where relevant",
          "Building Control or warranty drawing packs",
        ]}
      />
      <P>If only one drawing is updated, the package becomes inconsistent.</P>
      <P>
        This is why revision discipline is critical. When reviewing a package, I look for signs that a
        change has been carried through the full set rather than corrected in one isolated location.
      </P>

      <H2 id="written-for-users">10. The schedule is not written for the people using it</H2>
      <P>A schedule is not just a record. It is a working document.</P>
      <P>
        It may be used by the architect, technician, contractor, quantity surveyor, buyer, site manager,
        supplier, Building Control body, warranty provider and client.
      </P>
      <P>That means it needs to be clear.</P>
      <P>A good schedule should make it easy to understand:</P>
      <Bullets
        items={[
          "Where the item is located",
          "What type it is",
          "What size it is",
          "What performance requirements apply",
          "What drawing it relates to",
          "What revision it belongs to",
          "What information is still subject to confirmation",
          "What supplier or specialist input is required",
        ]}
      />
      <P>If the schedule is too vague, people will make assumptions.</P>
      <P>
        If the schedule is overloaded with unclear notes, people will miss important information.
      </P>
      <P>
        The best schedules are structured, consistent and coordinated with the drawings around them.
      </P>

      <H2 id="final-thoughts">Final thoughts</H2>
      <P>
        Window and door schedules go wrong because they sit at the point where many parts of the project
        meet.
      </P>
      <P>
        They connect plans, elevations, sections, details, fire strategy, security requirements,
        Building Control information, warranty requirements, supplier data, procurement and site
        installation.
      </P>
      <P>That is why a schedule review should not be treated as a box-ticking exercise.</P>

      <Figure caption="The recurring failure modes — the buckets a window and door schedule review checks against the rest of the package.">
        <CommonErrorsGrid />
      </Figure>

      <P>The schedule needs to be checked against the whole drawing package.</P>
      <P>
        At Krain Studio, I review window and door information as part of wider technical drawing audits.
        The aim is to identify missing references, conflicting information, unclear notes, schedule gaps
        and buildability risks before issue, procurement or site use.
      </P>
    </>
  );
}
