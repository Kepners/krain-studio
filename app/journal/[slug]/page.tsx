import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Ticker } from "@/components/home/Ticker";
import { Header } from "@/components/home/Header";
import { ContactBand } from "@/components/home/ContactBand";
import { Footer } from "@/components/home/Footer";
import { AnimLink } from "@/components/ui/AnimLink";
import { POST_CONTENT, PUBLISHED } from "@/components/journal/content";
import { getEntry } from "@/lib/journal";
import { palette } from "@/lib/tokens";

const MONO = "var(--font-geist-mono), ui-monospace, monospace";
const SANS = "var(--font-geist), sans-serif";
const SITE = "https://www.krain.studio";

export function generateStaticParams() {
  return PUBLISHED.map((entry) => ({ slug: entry.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const entry = getEntry(slug);
  if (!entry) return {};

  const url = `${SITE}/journal/${entry.slug}`;
  const published = entry.publishedISO ?? entry.dateISO;
  const modified = entry.modifiedISO ?? published;
  const images = entry.ogImage ? [entry.ogImage] : undefined;

  return {
    title: entry.metaTitle,
    description: entry.description,
    keywords: entry.keywords,
    alternates: { canonical: url },
    openGraph: {
      title: entry.metaTitle,
      description: entry.description,
      type: "article",
      url,
      siteName: "Krain Studio",
      publishedTime: published,
      modifiedTime: modified,
      images,
    },
    twitter: {
      card: "summary_large_image",
      title: entry.metaTitle,
      description: entry.description,
      images,
    },
  };
}

export default async function JournalPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const entry = getEntry(slug);
  const Content = POST_CONTENT[slug];

  if (!entry || !Content) notFound();

  const url = `${SITE}/journal/${entry.slug}`;
  const published = entry.publishedISO ?? entry.dateISO;
  const modified = entry.modifiedISO ?? published;

  const organization = {
    "@type": "ProfessionalService",
    "@id": `${SITE}/#organization`,
    name: "Krain Studio",
    url: SITE,
    email: "matt@krain.studio",
    description:
      "Freelance architectural technology — technical CAD production, construction detailing and drawing review for architects, developers, contractors and private clients.",
    areaServed: "United Kingdom",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Biggleswade",
      addressRegion: "Bedfordshire",
      addressCountry: "GB",
    },
    logo: { "@type": "ImageObject", url: `${SITE}/krain/logo-wordmark.png` },
    image: `${SITE}/krain/logo-wordmark.png`,
  };

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BlogPosting",
        "@id": `${url}#article`,
        headline: entry.title,
        description: entry.description,
        datePublished: published,
        dateModified: modified,
        ...(entry.ogImage ? { image: `${SITE}${entry.ogImage}` } : {}),
        inLanguage: "en-GB",
        keywords: entry.keywords.join(", "),
        author: {
          "@type": "Person",
          name: "Matt",
          jobTitle: "Architectural Technologist",
          url: `${SITE}/about`,
          worksFor: { "@id": `${SITE}/#organization` },
        },
        publisher: { "@id": `${SITE}/#organization` },
        mainEntityOfPage: { "@type": "WebPage", "@id": url },
        isPartOf: { "@id": `${url}#breadcrumb` },
        url,
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${url}#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: `${SITE}/` },
          { "@type": "ListItem", position: 2, name: "Journal", item: `${SITE}/journal` },
          { "@type": "ListItem", position: 3, name: entry.title },
        ],
      },
      organization,
    ],
  };

  return (
    <main style={{ position: "relative", minHeight: "100vh", overflow: "hidden" }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <Ticker />
      <Header />

      <article
        style={{
          position: "relative",
          zIndex: 2,
          padding: "clamp(56px, 8vw, 100px) 32px 40px",
          maxWidth: 1000,
          margin: "0 auto",
        }}
      >
        <nav
          aria-label="Breadcrumb"
          style={{
            fontFamily: MONO,
            fontSize: 11,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: palette.inkSoft,
            marginBottom: 28,
            display: "flex",
            flexWrap: "wrap",
            gap: 8,
            alignItems: "center",
          }}
        >
          <AnimLink href="/" color={palette.accent}>
            Home
          </AnimLink>
          <span aria-hidden style={{ opacity: 0.4 }}>
            /
          </span>
          <AnimLink href="/journal" color={palette.accent}>
            Journal
          </AnimLink>
          <span aria-hidden style={{ opacity: 0.4 }}>
            /
          </span>
          <span aria-current="page" style={{ opacity: 0.55 }}>
            {entry.title}
          </span>
        </nav>

        <div
          style={{
            fontFamily: MONO,
            fontSize: 11,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: palette.inkSoft,
            marginBottom: 20,
          }}
        >
          <time dateTime={entry.dateISO}>{entry.date}</time> · {entry.kind} · {entry.readingTime}
        </div>

        <h1
          style={{
            fontFamily: SANS,
            fontWeight: 200,
            fontSize: "clamp(36px, 6.2vw, 66px)",
            lineHeight: 1.04,
            letterSpacing: "-0.04em",
            margin: "0 0 20px",
            maxWidth: 920,
          }}
        >
          {entry.title}
        </h1>

        <div
          style={{
            fontFamily: MONO,
            fontSize: 11,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: palette.inkSoft,
            marginBottom: 40,
          }}
        >
          By{" "}
          <a href="/about" style={{ color: palette.accent, textDecoration: "none" }}>
            Matt
          </a>{" "}
          · Krain Studio
        </div>

        <Content />
      </article>

      <ContactBand />
      <Footer />
    </main>
  );
}
