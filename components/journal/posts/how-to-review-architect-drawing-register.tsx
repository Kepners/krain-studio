import { Lead, P, H2, Bullets, Quote, A, Figure } from "@/components/journal/Prose";
import {
  RegisterHeroDiagram,
  RegisterVsFolder,
  MismatchToRiskFlow,
  RegisterChecklist,
} from "@/components/journal/RegisterDiagrams";

export function HowToReviewArchitectDrawingRegister() {
  return (
    <>
      <Lead>A drawing register should be one of the most useful documents in a technical package.</Lead>

      <P>
        It should tell the project team what drawings exist, what revision they are at, what they are
        called, when they were issued, and what information the team should be using.
      </P>
      <P>
        But in practice, drawing registers are often treated as admin rather than technical information.
        They are updated quickly, copied from previous issues, adjusted late, or separated from the actual
        files being issued.
      </P>
      <P>That is where problems start.</P>
      <Quote>A drawing register can look complete while still being wrong.</Quote>

      <Figure caption="A-210 is listed as Revision C on the register, but the PDF in the issue folder is Revision B. Anonymised, illustrative references only.">
        <RegisterHeroDiagram />
      </Figure>

      <P>
        It may list drawings that are missing from the issue folder. It may omit PDFs that have been
        included in the issue. It may show the wrong revision. It may use old drawing titles. It may
        include superseded files. It may not match the actual title blocks. It may list drawings as
        current when they are not suitable for the purpose they are being used for.
      </P>
      <P>
        At Krain Studio, drawing register checks form part of wider{" "}
        <A href="/services#review">drawing reviews and technical audits</A>. The aim is simple: compare
        the register against the actual drawing issue and identify gaps before the package is used for
        pricing, coordination, Building Control, warranty review, procurement or site work.
      </P>
      <P>This article explains how to review an architect&rsquo;s drawing register in a practical way.</P>

      <H2 id="purpose-of-issue">1. Start with the purpose of the issue</H2>
      <P>Before checking the register line by line, confirm what the drawing issue is for.</P>
      <P>
        A set of drawings may be issued for planning, Building Control, tender, pricing, coordination,
        construction, client comment, warranty review or site use. The same drawing number can move
        through different statuses over time, but not every issue is suitable for every purpose.
      </P>
      <P>The first questions are:</P>
      <Bullets
        items={[
          "What is this issue for?",
          "Is it a current issue or a historical record?",
          "Is it for information, review, coordination, approval, pricing or construction?",
          "Who is receiving it?",
          "What will they rely on it for?",
          "Is the drawing register clear about the purpose of issue?",
        ]}
      />
      <P>
        This matters because a drawing that is acceptable for discussion may not be suitable for
        construction. A drawing that is suitable for coordination may not be ready for procurement. A
        preliminary detail may not be suitable for site installation.
      </P>
      <P>
        A register review should therefore check more than drawing numbers. It should check whether the
        information appears suitable for the stated purpose of the issue.
      </P>

      <H2 id="register-vs-folder">2. Compare the register against the actual PDF folder</H2>
      <P>The most important practical check is the simplest one.</P>
      <P>Open the drawing register and compare it against the actual PDFs in the issue folder.</P>
      <P>Do not assume they match.</P>

      <Figure caption="The register says what should exist; the issue folder holds what actually exists. The review lives in the gap between them.">
        <RegisterVsFolder />
      </Figure>

      <P>
        A drawing may be listed on the register but missing from the folder. A PDF may be included in the
        folder but missing from the register. A file may have the right drawing number but the wrong
        revision. A folder may include old drawings that should not have been issued.
      </P>
      <P>Typical issues include:</P>
      <Bullets
        items={[
          "Register lists drawing A, but no PDF exists",
          "PDF exists, but the drawing is not listed on the register",
          "Drawing number matches, but revision differs",
          "File name says one revision, title block says another",
          "Drawing title differs between register and title block",
          "Drawing included twice under slightly different file names",
          "Superseded drawings still present in the issue folder",
          "DWG exports and PDF exports not aligned",
        ]}
      />
      <P>
        This check is basic, but it is one of the highest-value checks in any drawing audit. If the
        register and the files do not match, the issue cannot be fully trusted.
      </P>

      <H2 id="drawing-numbers">3. Check the drawing numbers are consistent</H2>
      <P>Drawing numbers are the backbone of a technical package.</P>
      <P>
        If drawing numbers are wrong, duplicated or inconsistent, the project team cannot reliably refer
        to the information.
      </P>
      <P>We check for:</P>
      <Bullets
        items={[
          "Duplicate drawing numbers",
          "Missing drawing numbers in a sequence",
          "Drawings with similar numbers but different titles",
          "Drawing numbers that do not match the file names",
          "Drawing numbers that do not match the title block",
          "Drawing numbers referenced elsewhere but absent from the register",
          "Old numbering systems carried over from earlier stages",
        ]}
      />
      <P>
        Not every missing number is a problem. Some projects deliberately leave gaps for future drawings.
        But unexplained gaps, duplicates and inconsistent references need to be queried.
      </P>
      <P>
        The register should make it easy to understand what the package contains. It should not require
        detective work.
      </P>

      <H2 id="revisions">4. Check the revision information carefully</H2>
      <P>Revision errors are common and dangerous.</P>
      <P>
        A drawing register may say Revision C, the PDF file name may say Revision B, and the title block
        may show Revision D. That kind of mismatch causes confusion very quickly.
      </P>
      <P>When reviewing revisions, we check:</P>
      <Bullets
        items={[
          "Register revision",
          "PDF file name revision",
          "Title block revision",
          "Revision cloud/note history",
          "Issue date",
          "Revision description",
          "Whether the revision sequence makes sense",
          "Whether old revision clouds have been removed or retained intentionally",
          "Whether all drawings in the package have been updated consistently",
        ]}
      />
      <P>
        The revision letter or number is not the only thing that matters. The issue date, description and
        title block need to make sense together.
      </P>

      <Figure caption="How a single register mismatch becomes a real-world problem at the point of use.">
        <MismatchToRiskFlow />
      </Figure>

      <P>
        A drawing marked as current but containing old revision clouds or old notes can confuse the site
        team. A drawing file named incorrectly can be issued or priced against the wrong information. A
        schedule updated to one revision while the plans remain at another can create procurement risk.
      </P>
      <P>Revision control needs to be checked as part of the full package, not as a standalone label.</P>

      <H2 id="titles">5. Check the drawing titles</H2>
      <P>Drawing titles are often overlooked, but they matter.</P>
      <P>
        If the register says &ldquo;Proposed Ground Floor Plan&rdquo; and the drawing title block says
        &ldquo;General Arrangement Plan&rdquo;, that may not be a major issue. But if the title is
        misleading, outdated or inconsistent, it can create confusion.
      </P>
      <P>We check for:</P>
      <Bullets
        items={[
          "Drawing titles that differ between register and title block",
          "Titles that no longer reflect the drawing content",
          "Copied titles from previous projects",
          "Planning-stage titles still used on technical drawings",
          "Vague titles such as “Details” without enough description",
          "Multiple drawings with near-identical titles",
          "Schedules labelled incorrectly",
          "Floor levels or block names missing from titles",
        ]}
      />
      <P>The title should help the project team identify the drawing quickly and correctly.</P>
      <P>A good drawing title does not need to be long, but it needs to be accurate.</P>

      <H2 id="issue-dates">6. Check issue dates and package logic</H2>
      <P>A drawing register should show a logical issue history.</P>
      <P>
        If one drawing is dated months later than the rest of the package, that may be fine. But it needs
        to make sense. If a drawing appears to have been revised after the issue date, or if key drawings
        are older than the information they refer to, the package may be inconsistent.
      </P>
      <P>We check for:</P>
      <Bullets
        items={[
          "Drawings with issue dates that do not match the issue",
          "Drawings revised after the register date",
          "Old drawings mixed into a current issue",
          "New schedules issued with old plans",
          "Old details issued with updated layouts",
          "Inconsistent dates across related drawings",
          "Missing issue date information",
        ]}
      />
      <P>
        A drawing package should tell a clear story. The dates, revisions and issue purpose should support
        that story.
      </P>
      <P>If the dates do not make sense, it is worth asking whether the correct drawings have been included.</P>

      <H2 id="drawing-types">7. Check whether the register includes the right drawing types</H2>
      <P>A register can be complete in itself but still incomplete for the purpose of the issue.</P>
      <P>
        For example, a technical issue may include plans and elevations but no sections. It may include
        general arrangement drawings but no construction details. It may include door schedules but no{" "}
        <A href="/journal/why-window-and-door-schedules-go-wrong">window schedule</A>. It may include
        drainage layouts but no relevant service or riser details.
      </P>
      <P>
        Depending on the project, we check whether the register includes the expected drawing types, such
        as:
      </P>
      <Bullets
        items={[
          "Location / block / site plans",
          "General arrangement plans",
          "Elevations",
          "Sections",
          "Roof plans",
          "Reflected ceiling plans, where relevant",
          "Drainage layouts",
          "Construction details",
          "Window schedules",
          "Door schedules",
          "Finishes or accommodation schedules, where relevant",
          "Fire strategy or compartmentation drawings, where relevant",
          "Accessibility or Building Regulations information, where relevant",
        ]}
      />
      <P>
        This is not about forcing every project to have every drawing type. It is about asking whether the
        package has the information needed for its intended use.
      </P>
      <P>
        If the issue is for construction or technical coordination, missing sections, details or schedules
        may be a real problem.
      </P>

      <H2 id="referenced-drawings">8. Cross-check referenced drawings</H2>
      <P>A register review should not stop at the register.</P>
      <P>If drawings refer to other drawings, those references need to be checked.</P>
      <P>
        A plan may refer to a construction detail. A section may refer to a wall type. An elevation may
        refer to a window schedule. A door schedule may refer to a plan. A drainage layout may refer to a
        riser detail.
      </P>
      <P>We look for references such as:</P>
      <Bullets
        items={[
          "“Refer to drawing...”",
          "Detail callouts",
          "Section markers",
          "Elevation markers",
          "Schedule references",
          "Standard detail references",
          "Consultant drawing references",
          "Specification references",
        ]}
      />
      <P>Then we ask:</P>
      <Bullets
        items={[
          "Does the referenced drawing exist?",
          "Is it listed on the register?",
          "Is it included in the issue folder?",
          "Is it at the correct revision?",
          "Does the reference still match the drawing content?",
          "Is it clear whether the referenced drawing is by the architect, engineer, supplier or another consultant?",
        ]}
      />
      <P>Broken references are one of the clearest signs that a package has not been fully coordinated.</P>
      <P>
        They also create immediate site questions. If a drawing tells someone to refer to another drawing
        that is missing, old or irrelevant, the package has failed at the point of use.
      </P>

      <H2 id="admin-vs-technical">9. Separate missing files from technical queries</H2>
      <P>A good review should separate administrative problems from technical problems.</P>
      <P>
        Missing PDFs, wrong file names and revision mismatches are document control issues. They need
        fixing, but they are different from technical design queries such as drainage coordination, fire
        ratings, structural clashes or buildability risks.
      </P>
      <P>When reviewing a register, we separate comments into categories:</P>
      <Bullets
        items={[
          "Missing from register",
          "Missing from issue folder",
          "Revision mismatch",
          "Title mismatch",
          "Duplicate reference",
          "Superseded file included",
          "Broken drawing reference",
          "Technical query",
          "Consultant / supplier input required",
        ]}
      />
      <P>This helps the project team respond properly.</P>
      <P>
        A CAD technician can fix some issues. The architect may need to answer others. A structural
        engineer, fire consultant, drainage designer, supplier or Building Control body may need to
        confirm specific items.
      </P>
      <P>A useful review does not just list problems. It helps route them to the right person.</P>

      <H2 id="action-list">10. Produce an action list that someone can actually use</H2>
      <P>The final output of a register review should be clear and actionable.</P>
      <P>
        A vague comment like &ldquo;drawing register needs updating&rdquo; is not enough. The project team
        needs to know exactly what is wrong and where.
      </P>
      <P>A useful action list should include:</P>
      <Bullets
        items={[
          "Drawing number",
          "Drawing title",
          "Register revision",
          "File revision",
          "Title block revision",
          "Issue date, where relevant",
          "Problem identified",
          "Recommended action",
          "Priority or risk level, where useful",
        ]}
      />
      <P>For example:</P>
      <Quote>
        Drawing A-210 listed as Revision C on the register, but PDF file and title block show Revision B.
        Confirm current revision and reissue register/PDF set.
      </Quote>
      <P>That is far more useful than:</P>
      <Quote>Revision issue.</Quote>
      <P>The more precise the review output, the faster the project team can act.</P>

      <H2 id="systematic">11. Do not treat one correct drawing as proof of the whole package</H2>
      <P>
        One of the biggest mistakes in drawing review is checking a few drawings and assuming the rest are
        fine.
      </P>
      <P>
        A package may have ten drawings that are perfectly coordinated and two that are badly wrong. The
        issue is not whether some of the package works. The issue is whether the package can be relied on
        as a set.
      </P>
      <P>That is why a register review needs to be systematic.</P>
      <P>For each drawing, check:</P>
      <Bullets
        items={[
          "Is it listed?",
          "Is the PDF present?",
          "Does the file name match?",
          "Does the title block match?",
          "Does the revision match?",
          "Does the title match?",
          "Does it appear suitable for the issue purpose?",
          "Are its key references present?",
        ]}
      />
      <P>That level of checking is not glamorous, but it is where many problems are found.</P>

      <H2 id="final-thoughts">Final thoughts</H2>
      <P>A drawing register is more than an admin sheet.</P>
      <P>
        It is the map to the drawing package. If the map is wrong, the project team can easily rely on the
        wrong information.
      </P>

      <Figure caption="A register review, end to end — the checks that decide whether a package can be trusted as a set.">
        <RegisterChecklist />
      </Figure>

      <P>
        A good register review checks the relationship between the register, the PDFs, the title blocks,
        the revision history, the file names and the drawing references. It also checks whether the package
        appears suitable for the purpose it is being issued for.
      </P>
      <P>
        The aim is not to create paperwork for the sake of it. The aim is to reduce confusion, avoid wrong
        information being used, and identify missing or conflicting drawings before they cause site,
        procurement or coordination problems.
      </P>
      <P>
        At Krain Studio, drawing register checks form part of wider technical drawing reviews and
        architectural drawing audits.
      </P>
    </>
  );
}
