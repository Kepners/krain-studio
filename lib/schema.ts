// Shared JSON-LD entity nodes, so the Organization/WebSite/Blog identities are
// byte-identical wherever they're referenced (home, journal index, articles).
// Google resolves @id references within a page's @graph; keeping one source of
// truth avoids the entity drifting between pages.

export const SITE = "https://www.krain.studio";

/** The publishing entity. Referenced by @id as the article publisher + author worksFor. */
export const organization = {
  "@type": "ProfessionalService",
  "@id": `${SITE}/#organization`,
  name: "Krain Studio",
  url: SITE,
  email: "matt@krain.studio",
  description:
    "Freelance architectural technology — RIBA Stage 4–5 construction packages, technical CAD production, construction detailing and drawing review.",
  areaServed: "United Kingdom",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Biggleswade",
    addressRegion: "Bedfordshire",
    addressCountry: "GB",
  },
  logo: { "@type": "ImageObject", url: `${SITE}/krain/logo-wordmark.png` },
  image: `${SITE}/krain/logo-wordmark.png`,
  knowsAbout: [
    "Construction drawings",
    "RIBA Stage 4",
    "RIBA Stage 5",
    "Architectural detailing",
    "Drawing review",
    "Buildability",
  ],
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Services",
    itemListElement: [
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "RIBA Stage 4 technical design drawings" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "RIBA Stage 5 construction drawings" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Construction detailing (1:5 / 1:10)" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Drawing register review & buildability audit" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Building Control drawing support" } },
    ],
  },
} as const;

export const website = {
  "@type": "WebSite",
  "@id": `${SITE}/#website`,
  url: SITE,
  name: "Krain Studio",
  inLanguage: "en-GB",
  publisher: { "@id": organization["@id"] },
} as const;

/** The journal as a CreativeWork — a valid isPartOf target for each BlogPosting. */
export const blog = {
  "@type": "Blog",
  "@id": `${SITE}/journal#blog`,
  name: "Krain Studio Journal",
  url: `${SITE}/journal`,
  inLanguage: "en-GB",
  publisher: { "@id": organization["@id"] },
} as const;
