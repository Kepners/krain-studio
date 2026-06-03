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
import { SITE, organization, blog } from "@/lib/schema";

const MONO = "var(--font-geist-mono), ui-monospace, monospace";
const SANS = "var(--font-geist), sans-serif";

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
  const ogPath = entry.ogImage ?? "/krain/og-default.png";
  const images = [{ url: `${SITE}${ogPath}`, width: 1200, height: 630, alt: entry.title }];

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
      authors: [`${SITE}/about`],
      section: entry.kind,
      tags: entry.keywords,
      images,
    },
    twitter: {
      card: "summary_large_image",
      title: entry.metaTitle,
      description: entry.description,
      images: [`${SITE}${ogPath}`],
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

  const ogImage = `${SITE}${entry.ogImage ?? "/krain/og-default.png"}`;

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
        image: { "@type": "ImageObject", url: ogImage, width: 1200, height: 630 },
        inLanguage: "en-GB",
        articleSection: entry.kind,
        keywords: entry.keywords.join(", "),
        author: {
          "@type": "Person",
          name: "Matt",
          jobTitle: "Architectural Technologist",
          url: `${SITE}/about`,
          worksFor: { "@id": organization["@id"] },
        },
        publisher: { "@id": organization["@id"] },
        mainEntityOfPage: { "@type": "WebPage", "@id": url },
        isPartOf: { "@id": blog["@id"] },
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
      blog,
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
          <AnimLink href="/" color={palette.accentText}>
            Home
          </AnimLink>
          <span aria-hidden style={{ opacity: 0.4 }}>
            /
          </span>
          <AnimLink href="/journal" color={palette.accentText}>
            Journal
          </AnimLink>
          <span aria-hidden style={{ opacity: 0.4 }}>
            /
          </span>
          <span aria-current="page">{entry.title}</span>
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
          <a
            href="/about"
            style={{
              color: palette.accentText,
              textDecoration: "underline",
              textUnderlineOffset: "0.18em",
              textDecorationColor: "rgba(179, 45, 70, 0.5)",
            }}
          >
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
