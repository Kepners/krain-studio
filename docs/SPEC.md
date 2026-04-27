# Handoff: Krain.Studio

Premium portfolio website for an architectural detailed-construction-design practice.
Live build target: **krain.studio**

---

## Overview

Krain.Studio is a small architectural office producing RIBA Stage 4–5 packages —
construction-stage drawings, details, and specs. The site sells precision, quietness,
and follow-through. The chosen visual direction is **"Signal"** — a dark cinematic
home page where coral (the colour pulled from the studio's existing logo render) is
treated as actual *light*, not as decoration.

This handoff covers the **Home** page only. The remaining pages — Work index, Project
case study, Process, Services, Journal, About, Contact — were scoped but not built;
the design system and motion language documented below should be applied to them.

---

## About the Design Files

The files in `source/` are **design references created in HTML** — a working
prototype showing intended look and behaviour. They are NOT production code to copy
directly.

The prototype uses inline-Babel React (single-page, no build) so it can run from a
plain file. Your job is to **recreate this design in a real production codebase** —
typically Next.js 14+ (App Router) with Tailwind, but use whatever framework fits the
hosting environment best. The fonts, palette, motion specs, copy, layout grid, and
component breakdown in this README are the source of truth.

---

## Fidelity

**High-fidelity.** Pixel-perfect mocks with final colours, typography, spacing,
motion timings, and copy. Recreate the layout exactly. Treat the values in
`Design Tokens` below as authoritative.

---

## Suggested Production Stack

If you have a free hand, build it as:

- **Framework:** Next.js 14 (App Router), TypeScript
- **Styling:** Tailwind CSS with the tokens below mapped into `tailwind.config.ts`
- **Motion:** Framer Motion (replaces the hand-rolled `useInView`, `useMagnetic`,
  `useTilt` hooks in the prototype)
- **Fonts:** `next/font/google` for **Geist** and **Geist Mono**
- **CMS for projects/journal:** Sanity or Contentlayer (markdown). Hard-code stats
  and copy on Home for v1 — they change rarely.
- **Hosting:** Vercel, custom domain `krain.studio`
- **Forms:** Resend or Formspree for the "Start a brief" CTA
- **Analytics:** Plausible or Vercel Analytics

---

## Design Tokens

### Palette ("Signal" direction — dark + cream variants)

The prototype implements **two palettes** swappable via a `mode` prop on the root
component. Implement both as theme tokens; ship the **dark "Signal"** palette as the
default.

```ts
// Signal — dark cinematic (DEFAULT)
const signal = {
  bg:        '#0e1020', // deep blue-black, not pure black
  bgRaise:   '#15182b', // raised surfaces, cards
  ink:       '#f4ede0', // warm cream — primary text
  inkSoft:   '#a8a89c', // secondary text, metadata
  accent:    '#ff5a7a', // coral — the brand "light" colour
  accentDim: '#ff7a91', // hover/secondary
  rule:      '#2a2d44', // hairlines, borders
  plate:     '#1a1d33', // image plate background
};

// Cream — light variant (toggle)
const cream = {
  bg:        '#ece7dd', // warm bone
  bgRaise:   '#f4f0e6',
  ink:       '#15182b', // midnight navy
  inkSoft:   '#5a5d75',
  accent:    '#ff5a7a', // same coral
  accentDim: '#ff7a91',
  rule:      '#d8d3c7',
  plate:     '#dfdacf',
};
```

### Typography

- **Sans:** Geist (Google Fonts) — weights 200, 300, 400, 500, 600, 700
- **Mono:** Geist Mono — weights 400, 500
- All headlines use **Geist 200 (ultralight)** with tight tracking (`-0.045em`)
  to mirror the wireframe quality of the logo
- Eyebrows / metadata use **Geist Mono** at 11px / 0.22em letter-spacing / uppercase

### Type scale (Home page)

| Role            | Family    | Size  | Weight | Tracking  | Line height |
|-----------------|-----------|-------|--------|-----------|-------------|
| Hero H1         | Geist     | 128px | 200    | -0.045em  | 0.92        |
| Section H2      | Geist     | 88px  | 200    | -0.04em   | 0.95        |
| Stat number     | Geist     | 64px  | 300    | -0.03em   | 1           |
| Body            | Geist     | 17px  | 400    | normal    | 1.55        |
| Eyebrow / meta  | Geist Mono| 11px  | 500    | 0.22em UC | 1.4         |
| Nav links       | Geist     | 14px  | 400    | -0.01em   | 1           |
| Button label    | Geist     | 14px  | 500    | 0.02em UC | 1           |

### Spacing & layout

- Page padding: `0 32px` desktop, `0 20px` mobile
- Max content width: full bleed (the design relies on edge tension)
- Section vertical padding: `120px` desktop, `80px` mobile
- Grid: native CSS Grid, 12-col implied. Hero uses `grid-template-columns: 1.1fr 1fr`
- Border radii: `4px` for buttons, `8px` for image plates, `0` for hairline rules

### Shadows

```css
/* Image plate (hero photo, project cards) */
box-shadow: 0 30px 80px rgba(26, 29, 51, 0.18), 0 0 0 1px var(--rule);

/* Coral glow (slash, accents) */
box-shadow: 0 0 60px var(--accent), 0 0 120px var(--accent-50);

/* CTA button */
box-shadow: 0 8px 32px rgba(255, 90, 122, 0.35);
```

### Motion

| Element             | Property         | Duration | Easing         |
|---------------------|------------------|----------|----------------|
| Fade-in on scroll   | opacity, y       | 800ms    | cubic-bezier(0.2, 0.8, 0.2, 1) |
| Slash parallax      | transform        | 150ms    | linear         |
| Background glow     | transform        | 300ms    | ease-out       |
| Tilt plate          | transform        | 400ms    | ease           |
| Magnetic CTA        | transform        | 200ms    | cubic-bezier(0.2, 0.8, 0.2, 1) |
| Project card hover  | transform, opacity| 500ms   | ease           |
| Coral flicker       | opacity          | 3s loop  | steps          |
| Stat counter        | numeric tween    | 2000ms   | ease-out       |

All motion respects `prefers-reduced-motion: reduce` — disable the cursor-driven
parallax, tilts, and magnetic pulls; keep fade-ins.

---

## Screens / Views

### Home — `/`

The only fully-designed page. Layout, top to bottom:

#### 1. Top status bar — `48px` tall

- Left: small coral pulse dot + `LIVE — HOLLOWAY MEWS · WK 17` (Geist Mono 11px UC)
- Right: `RIBA 4–5  ·  NBS  ·  DfT  ·  LDN` (Geist Mono 11px UC, 0.22em tracking)
- Hairline border-bottom, `var(--rule)`

#### 2. Header — sticky, `80px` tall

- Left: Krain logo (use `assets/logo.png`, 28px tall on dark / use the dark-bg
  treatment of the logo render at `assets/logo-render.jpg` for reference)
- Center: nav — `Work · Process · Services · Journal · About · Contact`
  (Geist 14px, 32px gap, opacity 0.7 → 1 on hover with coral underline that
  draws in from left over 300ms)
- Right: **Start a brief** CTA — coral pill, magnetic, 14px Geist 500, UC, 0.02em
  - Padding: `14px 24px`, radius `999px`
  - Hover: lifts 2px, glow strengthens
- Border-bottom hairline `var(--rule)`

#### 3. Hero — `120px 32px 140px`

Two-column grid (`1.1fr 1fr`), gap `64px`, vertically centred.

**Left column:**
- Eyebrow: `Detailed construction design / 2018 →` (Mono 11px UC)
- H1 (Geist 200, 128px, line-height 0.92): three lines, fade-in staggered 120ms each
  - Line 1: `Drawn at 1:5.` — the `1:5` is in coral with a duplicated blurred coral
    layer behind it that flickers (3s steps animation, opacity 0.4 ↔ 1)
  - Line 2: `Built without`
  - Line 3: `surprises.`
- Body paragraph (Geist 400, 17px, max-width 520px, opacity 0.82, marginTop 56px):
  > "Krain is a small office that produces RIBA Stage 4–5 packages — the
  > construction-stage drawings, details, and specs that turn a planning
  > permission into a buildable thing."

**Right column:**
- 4:3 image plate. **Currently a placeholder** — striped diagonal fill, corner
  ticks, label `[ HERO PHOTO · drop image of site / detail / drawing here ]`.
  When real photo is supplied, replace the placeholder; keep the 4:3 ratio,
  the `8px` radius, the `0 30px 80px rgba(26,29,51,.18)` shadow, and the
  4° cursor-tilt behaviour.

**Hero motion (positioned absolutely behind the grid):**
- A diagonal coral slash (6px × 620px, rotated 20deg) at `left: 40%, top: 12%`,
  with a blurred coral gradient and outer glow. Translates with the cursor
  (slashX = mouseX × 0.025, slashY = mouseY × 0.04, transition 150ms linear).
- A 900×900 radial coral glow at `left: 30%, top: 5%`, blurred 50px,
  translates with the cursor at half the slash's rate, 300ms ease-out.

#### 4. Stats bar — full-width, `32px` vertical padding

Four columns, hairline borders top + bottom. Each cell:
- Number (Geist 300, 64px, tabular-nums) — animates from 0 on enter view, 2s
- Label (Mono 11px UC, opacity 0.6, marginTop 8px)

Values:
1. `17` — Live + completed projects
2. `1,184` — Sheets issued · 2025
3. `0` — RFIs unanswered today
4. `Q3 26` — Next opening *(static, not animated)*

#### 5. Work — `120px 32px`

- Eyebrow `[ 01 ] Work` (Mono UC) on a separate row, hairline rule full-width
- H2 left-aligned: `Selected packages.` (Geist 200, 88px)
- 2-column grid below, `48px` gap, of project cards:

**Project card** (current prototype shows 4):
- 4:3 image plate (placeholder striped fill, label includes project name)
- Below the image, two-column row:
  - Left: project name (Geist 400, 22px) + meta line in Mono 11px
    (`RIBA 4 · 320m² · 2024–25`)
  - Right: status pill `IN PROGRESS` / `COMPLETED` (Mono 11px, coral if live)
- Hover:
  - Image scales 1.03 over 500ms ease
  - A coral hairline draws from left to full width under the project name
  - A custom cursor follower appears showing `VIEW ↗` in coral
- Click → routes to `/work/[slug]`

Project list (placeholder names, ask client for real):
1. Holloway Mews — RIBA 4 · 320m² · 2024–25 · IN PROGRESS
2. Atelier Renwick — RIBA 5 · 180m² · 2024 · COMPLETED
3. Pier 14 Restoration — RIBA 4 · 1,400m² · 2023–24 · COMPLETED
4. Quay & Co. HQ — RIBA 4 · 620m² · 2025 · IN PROGRESS

#### 6. Process strip

Three horizontally-arranged steps:
1. `Stage 4 — Technical Design`
2. `Stage 5 — Manufacturing & Construction`
3. `Aftercare`

Each: number in Mono UC, title in Geist 300 32px, 2-line description in Geist 400
15px opacity 0.7. Coral hairline beneath the active/hovered step.

#### 7. Footer / contact band — dark `var(--bg-raise)` slab

- Oversized H2 `Start a brief.` (Geist 200, 144px, coral)
- Email link `matt@krainstudio` (Geist 400, 24px, hover coral)
- Three-column footer: contact / links / colophon

---

## Interactions & Behaviour

| Trigger                         | Behaviour                                                  |
|---------------------------------|------------------------------------------------------------|
| Mouse moves in hero             | Slash and glow translate (parallax)                        |
| Element scrolls into view       | Fade + 24px y-translate, IntersectionObserver `--40px`     |
| Cursor enters CTA               | Magnetic pull (0.4 strength, max 12px offset)              |
| Cursor enters image plate       | 4° tilt towards cursor, lift 8px, shadow strengthens       |
| Cursor enters project card      | Custom cursor `VIEW ↗`; image scales; coral underline draws |
| Cursor enters nav link          | Coral underline draws from left, 300ms                     |
| Stat scrolls into view          | Counter animates 0 → value over 2s                         |
| Page load                       | Hero text fades in line-by-line, 120ms stagger             |
| `prefers-reduced-motion: reduce`| Disable parallax, tilt, magnetic; keep fade-ins            |

---

## State Management

For the Home page, only ephemeral UI state. No global store needed.

- Local: `useState` for cursor position, view-in-port flags, counter values
- Server: project list and journal entries (CMS), studio stats (hard-coded ok)
- Client routing: Next.js App Router, prefetch on hover for project cards

---

## Assets

- **`assets/logo.png`** — primary wordmark (KRAIN + Studio), black on transparent.
  Use on light backgrounds. For dark backgrounds, invert to cream (#f4ede0)
  via CSS filter or supply an inverted version.
- **`assets/logo-render.jpg`** — the brand "hero" render of the logo with the
  coral slash. **This is the source of the brand's coral colour and the
  slash motif used throughout the site.** Do not use directly in the UI;
  it's a reference for the brand language.
- **Hero photo + project photos** — NOT YET PROVIDED. The client (Matt) will
  supply. Until then, render the placeholder plates exactly as in the prototype
  so it's obvious what's missing.

---

## Files in this Bundle

```
source/
├── krain.html                 — entry HTML, loads React + the Signal direction
├── design-canvas.jsx          — design canvas helper (prototype only, do not ship)
├── krain-studio.html          — earlier exploration with all 3 directions
└── krain/
    ├── app.jsx                — design canvas root with all 3 directions
    ├── dir-brutalist.jsx      — ★ THE CHOSEN DIRECTION (Signal). Recreate this.
    ├── dir-editorial.jsx      — exploration: Monolith direction (rejected)
    ├── dir-quiet.jsx          — exploration: Atelier direction (rejected)
    └── placeholders.jsx       — shared image-placeholder components
assets/
├── logo.png
└── logo-render.jpg
CLAUDE.md                      — quick orientation for Claude Code
README.md                      — this file
```

**Recreate `dir-brutalist.jsx` only.** The other two directions are included for
context but were not selected.

---

## Open Items / Next Steps

1. **Real photography** — client to supply hero shot + 4–8 project photos
2. **Real project copy** — names, scopes, locations, RIBA stage, square metres,
   year, status. Placeholder list above can stand in.
3. **Remaining pages** — Work index, Project case study, Process, Services,
   Journal, About, Contact. Apply the same design system. Suggested patterns:
   - **Work index:** filterable grid, RIBA stage filter, year filter
   - **Project case study:** long-form, drawing carousels, technical specs sidebar
   - **Process:** vertical timeline with the three RIBA stages
   - **Services:** simple service cards with pricing-on-request CTAs
   - **Journal:** essay index + reading-mode template, mono small-caps dates
   - **About:** single-column long-form, headshot, brief CV
   - **Contact:** "Start a brief" form — name, email, project type (radios:
     residential / commercial / restoration / other), site address, stage
     reached, planning ref, attachments, message
4. **CMS** — wire projects + journal to Sanity or Contentlayer
5. **Domain + email** — `krain.studio`, `matt@krain.studio` (note: client gave
     `matt@krainstudio` without a TLD — confirm before wiring forms)
6. **Analytics + meta** — OG image generation per project, sitemap, robots,
     `<meta name="theme-color">` `#0e1020`
