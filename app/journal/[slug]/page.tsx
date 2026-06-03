import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Ticker } from "@/components/home/Ticker";
import { Header } from "@/components/home/Header";
import { ContactBand } from "@/components/home/ContactBand";
import { Footer } from "@/components/home/Footer";
import { AnimLink } from "@/components/ui/AnimLink";
import { POST_CONTENT } from "@/components/journal/content";
import { JOURNAL, getEntry } from "@/lib/journal";
import { palette } from "@/lib/tokens";

const MONO = "var(--font-geist-mono), ui-monospace, monospace";
const SANS = "var(--font-geist), sans-serif";
const SITE = "https://krain.studio";

export function generateStaticParams() {
  return JOURNAL.map((entry) => ({ slug: entry.slug }));
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
      publishedTime: entry.dateISO,
    },
    twitter: {
      card: "summary_large_image",
      title: entry.metaTitle,
      description: entry.description,
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
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: entry.title,
    description: entry.description,
    datePublished: entry.dateISO,
    dateModified: entry.dateISO,
    keywords: entry.keywords.join(", "),
    author: { "@type": "Organization", name: "Krain Studio", url: SITE },
    publisher: {
      "@type": "Organization",
      name: "Krain Studio",
      url: SITE,
      logo: { "@type": "ImageObject", url: `${SITE}/krain/logo-wordmark.png` },
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    url,
  };

  return (
    <main style={{ position: "relative", minHeight: "100vh", overflow: "hidden" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
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
        <AnimLink
          href="/journal"
          color={palette.accent}
          style={{
            fontFamily: MONO,
            fontSize: 11,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            display: "inline-block",
            marginBottom: 28,
          }}
        >
          ← Journal
        </AnimLink>

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
            margin: "0 0 36px",
            maxWidth: 920,
          }}
        >
          {entry.title}
        </h1>

        <Content />
      </article>

      <ContactBand />
      <Footer />
    </main>
  );
}
