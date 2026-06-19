// One-off: convert the buildability-review source JPGs to optimised web assets.
// Source renders live outside the repo; outputs land in public/krain/journal/.
// Run: node scripts/convert-buildability-images.mjs
import sharp from "sharp";
import path from "node:path";
import { mkdirSync } from "node:fs";

const SRC = "C:/Users/kepne/projects/KRAIN.Studio/source";
const OUT = path.resolve(process.cwd(), "public/krain/journal");
mkdirSync(OUT, { recursive: true });

const HERO = "d6561420-960d-4fe3-8709-d11c9539afcd.jpg";

const jobs = [
  { in: HERO, out: "buildability-review-before-issue-hero.webp" },
  { in: "323114b9-3e47-4912-9d5d-b071a890cb8c.jpg", out: "buildability-review-flow.webp" },
  { in: "17d73332-8960-4b89-9f88-f9782a0088d4.jpg", out: "buildability-risk-buckets.webp" },
  { in: "09806e61-0983-4750-a1aa-d81fae1390bd.jpg", out: "buildability-review-12-questions.webp" },
  { in: "0e536944-c3d8-414b-8a87-991f5c316246.jpg", out: "buildability-review-linkedin-card.webp" },
  { in: "001.jpg", out: "buildability-review-before-issue-hero-alt.webp", resize: 1600 },
];

for (const j of jobs) {
  let img = sharp(path.join(SRC, j.in));
  if (j.resize) img = img.resize({ width: j.resize, withoutEnlargement: true });
  const info = await img.webp({ quality: 82, effort: 6 }).toFile(path.join(OUT, j.out));
  console.log(`${j.out.padEnd(46)} ${info.width}x${info.height}  ${Math.round(info.size / 1024)}KB`);
}

// og:image — cover-crop the hero to the canonical 1200x630, JPG for max share-card compatibility.
const og = await sharp(path.join(SRC, HERO))
  .resize(1200, 630, { fit: "cover", position: "centre" })
  .jpeg({ quality: 86 })
  .toFile(path.join(OUT, "buildability-review-before-issue-og.jpg"));
console.log(`${"buildability-review-before-issue-og.jpg".padEnd(46)} ${og.width}x${og.height}  ${Math.round(og.size / 1024)}KB`);
