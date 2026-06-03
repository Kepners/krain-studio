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
};

export const JOURNAL: JournalEntry[] = [
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
  },
];

export function getEntry(slug: string): JournalEntry | undefined {
  return JOURNAL.find((entry) => entry.slug === slug);
}
