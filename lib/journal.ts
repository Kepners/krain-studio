export type JournalEntry = {
  /** URL slug under /journal/<slug> */
  slug: string;
  /** On-page H1 (sentence case to match site voice) */
  title: string;
  /** Display date, e.g. "Jun 2026" */
  date: string;
  /** Machine date for <time> / schema, e.g. "2026-06-03" */
  dateISO: string;
  /** Category label, e.g. "Technical guide" */
  kind: string;
  /** e.g. "12 min read" */
  readingTime: string;
  /** Teaser used on the homepage + journal index */
  excerpt: string;
  /** <title> tag for the post */
  metaTitle: string;
  /** Meta description for the post */
  description: string;
  /** SEO keywords */
  keywords: string[];
  /** ISO-8601 with offset for datePublished / og:published_time, e.g. "2026-06-03T09:00:00+01:00" */
  publishedISO?: string;
  /** ISO-8601 with offset for dateModified — bump only on a real edit */
  modifiedISO?: string;
  /** Social share image (1200×630), absolute-from-root, e.g. "/krain/journal/<slug>-og.png" */
  ogImage?: string;
};

export const JOURNAL: JournalEntry[] = [
  {
    slug: "stage-4-vs-stage-5-drawings",
    title: "Stage 4 vs Stage 5 drawings: what actually changes?",
    date: "Jun 2026",
    dateISO: "2026-06-04",
    publishedISO: "2026-06-04T10:00:00+01:00",
    modifiedISO: "2026-06-04T10:00:00+01:00",
    kind: "Technical guide",
    readingTime: "14 min read",
    excerpt:
      "Stage 4 and Stage 5 are often described as separate project stages, but real projects are rarely that neat. This guide explains what changes when technical design information starts being used for manufacturing, procurement, construction and site queries.",
    metaTitle: "Stage 4 vs Stage 5 Drawings: What Actually Changes? | Krain Studio",
    description:
      "A practical guide to the difference between Stage 4 technical design drawings and Stage 5 construction information, including drawing registers, schedules, details, buildability and site-query risk.",
    keywords: [
      "RIBA Stage 4",
      "RIBA Stage 5",
      "technical design drawings",
      "construction information",
      "drawing register",
      "window and door schedules",
      "buildability review",
      "drawing coordination",
      "construction drawings",
      "architectural technologist",
    ],
    ogImage: "/krain/journal/stage-4-vs-stage-5-drawings-og.png",
  },
  {
    slug: "how-to-review-architect-drawing-register",
    title: "How to review an architect's drawing register",
    date: "Jun 2026",
    dateISO: "2026-06-04",
    publishedISO: "2026-06-04T09:00:00+01:00",
    modifiedISO: "2026-06-04T09:00:00+01:00",
    kind: "Technical guide",
    readingTime: "13 min read",
    excerpt:
      "A drawing register should tell the project team exactly what drawings exist, what revision they are at and what information can be relied on. This guide explains how to review a register against the actual drawing package before issue or site use.",
    metaTitle: "How to Review an Architect's Drawing Register | Krain Studio",
    description:
      "A practical guide to reviewing an architect's drawing register, including missing PDFs, revision mismatches, title block checks, issue dates, drawing references and action lists.",
    keywords: [
      "drawing register",
      "drawing register review",
      "architect drawing register",
      "revision control",
      "title block check",
      "drawing issue document control",
      "RIBA Stage 4 Stage 5",
      "technical drawing audit",
      "architectural drawing review",
      "drawing coordination",
    ],
    ogImage: "/krain/journal/how-to-review-architect-drawing-register-og.png",
  },
  {
    slug: "what-i-check-before-drawings-go-to-site",
    title: "What I check before a drawing package goes to site",
    date: "Jun 2026",
    dateISO: "2026-06-03",
    publishedISO: "2026-06-03T09:00:00+01:00",
    modifiedISO: "2026-06-03T09:00:00+01:00",
    kind: "Technical guide",
    readingTime: "13 min read",
    excerpt:
      "Before architectural drawings go to site, they need more than a quick visual check. This article explains the key checks behind a proper technical drawing review, from drawing registers and revisions to schedules, drainage, structure and buildability.",
    metaTitle: "What I Check Before a Drawing Package Goes to Site | Krain Studio",
    description:
      "A practical guide to architectural drawing review, covering drawing registers, revisions, schedules, detail references, buildability, drainage coordination and site-readiness checks.",
    keywords: [
      "architectural drawing review",
      "drawing package review",
      "construction drawings",
      "drawing register",
      "drawing revisions",
      "buildability review",
      "drainage coordination",
      "RIBA Stage 4 Stage 5",
      "technical drawing audit",
      "site-readiness check",
    ],
    ogImage: "/krain/journal/what-i-check-before-drawings-go-to-site-og.png",
  },
  {
    slug: "why-window-and-door-schedules-go-wrong",
    title: "Why window and door schedules go wrong",
    date: "Jun 2026",
    dateISO: "2026-06-03",
    kind: "Technical guide",
    readingTime: "12 min read",
    excerpt:
      "Window and door schedules look simple until they are wrong. A practical guide to the coordination errors that travel through plans, elevations, fire ratings, security notes, thresholds and supplier information — and what to check before issue.",
    metaTitle: "Why Window and Door Schedules Go Wrong | Krain Studio",
    description:
      "A practical guide to common window and door schedule errors, including missing references, fire ratings, PAS 24 notes, threshold details, supplier information and drawing coordination issues.",
    keywords: [
      "window and door schedule",
      "door schedule errors",
      "window schedule",
      "PAS 24",
      "Approved Document Q",
      "fire door rating FD30 FD60",
      "drawing coordination",
      "RIBA Stage 4 Stage 5",
      "buildability review",
      "technical drawing audit",
    ],
    publishedISO: "2026-06-03T09:00:00+01:00",
    modifiedISO: "2026-06-03T09:00:00+01:00",
    ogImage: "/krain/journal/why-window-and-door-schedules-go-wrong-og.png",
  },
];

export function getEntry(slug: string): JournalEntry | undefined {
  return JOURNAL.find((entry) => entry.slug === slug);
}
