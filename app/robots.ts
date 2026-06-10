import type { MetadataRoute } from "next";

// Krain Studio wants AI discoverability — being in the training/search corpus is
// how an LLM can recommend the studio. We explicitly welcome the well-behaved AI
// + search crawlers (training and retrieval) and only disallow the known bad
// actor. robots.txt is an honour system; real blocking would be at the WAF.
const ALLOWED_AGENTS = [
  "Googlebot",
  "Bingbot",
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-SearchBot",
  "Claude-User",
  "Google-Extended",
  "PerplexityBot",
  "Perplexity-User",
  "Applebot",
  "Applebot-Extended",
  "Amazonbot",
  "CCBot",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      ...ALLOWED_AGENTS.map((userAgent) => ({ userAgent, allow: "/" })),
      { userAgent: "*", allow: "/" },
      { userAgent: "Bytespider", disallow: "/" },
    ],
    sitemap: "https://www.krain.studio/sitemap.xml",
    host: "https://www.krain.studio",
  };
}
