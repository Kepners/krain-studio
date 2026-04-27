# krain.studio — Build Brief

<!-- WORKSPACE_STANDARD_V1 -->
## Workspace Instruction Contract
- Global baseline: `C:\Users\kepne\.claude\CLAUDE.md`
- Project overlay: `./CLAUDE.md` (this file)
- If rules conflict, project rules win for this repository.

---

You are building **krain.studio**, a premium portfolio website for an architectural
practice that produces RIBA Stage 4–5 packages — construction-stage drawings,
details, and specs.

## Read first

1. [docs/SPEC.md](docs/SPEC.md) — full design specification, tokens, motion specs,
   screen breakdown (this is the handoff README, copied in verbatim).
2. [docs/source/krain/dir-brutalist.jsx](docs/source/krain/dir-brutalist.jsx) — the
   **chosen** design direction (codename: Signal). This is the source of truth for
   layout and motion. Recreate it as a real Next.js codebase; do not ship it as-is.
3. [docs/source/krain/placeholders.jsx](docs/source/krain/placeholders.jsx) — image
   placeholder components to keep until real photos arrive.

`dir-editorial.jsx` and `dir-quiet.jsx` are rejected explorations, included for
context only — do not implement them.

---

## Tech Stack

| Component  | Technology                              |
|------------|-----------------------------------------|
| Framework  | Next.js 16 (App Router) + TypeScript    |
| Styling    | Tailwind CSS v4                         |
| Motion     | Framer Motion v12                       |
| Fonts      | Geist + Geist Mono (via `next/font`)    |
| Hosting    | **Contabo VPS (`94.72.97.251`)** — Docker container behind Caddy, deployed via `/opt/stack` |
| Domain     | `krain.studio` (Porkbun-managed)        |
| Repo       | `github.com/Kepners/krain-studio`       |

> **No Vercel.** This project lives on the Contabo control plane. See the
> [contabo-infra workspace](../../../@Projects/contabo-infra/) (`AGENTS.md`,
> `BRAIN.md`, `PLATFORM.md`, `DNS-REFERENCE.md`) for the deploy and DNS
> source-of-truth. Deploy = git push to `main`, then SSH `contabo` and run
> `/opt/stack/bin/deploy-site.sh --site-dir /opt/stack/sites/krain-studio --service krain --branch main --healthcheck-url https://www.krain.studio`.

---

## Critical things not to lose in translation

- **The coral slash in the hero is the brand**, not decoration. Keep the parallax
  behaviour, the radial glow behind it, and the flicker on the `1:5` numerals.
- **Geist 200 (ultralight)** at 128px+ for headlines. Do not substitute heavier
  weights "to look more legible" — the thinness mirrors the logo's stroke.
- **Magnetic CTA + tilt plates + cursor-driven motion** are the texture that
  makes the site feel premium. Use Framer Motion `useMotionValue` / spring
  transitions for an inertial feel — not CSS transitions.
- Respect `prefers-reduced-motion: reduce` — disable parallax, tilt, magnetic;
  keep fade-ins.
- The **stats bar counter** uses a 2s ease-out tween from 0 to value, triggered
  when the bar enters the viewport (Framer Motion `useInView`).

---

## Design System

The handoff README mentions a "dark Signal" default and a "cream variant", but the
chosen JSX (`dir-brutalist.jsx`) uses **cream as the page background** with deep
navy text and one dark manifesto section. We follow the JSX — it's the explicit
source of truth. The README's dark-default note is treated as out-of-date.

### Palette
```
Page background:  #ece7dd  (warm cream/bone — primary)
Ink (text):       #1a1d33  (deep navy)
Ink soft:         rgba(26,29,51,0.62)  (muted text)
Accent:           #ff4d6e  (coral — the brand "light")
Accent soft:      rgba(255,77,110,0.18)
Rule:             rgba(26,29,51,0.16)  (hairlines)
Plate:            #dfd9ca  (drawing plate, slightly darker than page)
Manifesto bg:     #1a1d33  (the one dark section, text in cream)
```

### Typography
- **Sans:** Geist (weights 200, 300, 400, 500, 600, 700)
- **Mono:** Geist Mono (400, 500)
- Headlines: Geist 200, tight tracking (`-0.045em`)
- Eyebrows / metadata: Geist Mono 11px, 0.22em letter-spacing, uppercase

See [docs/SPEC.md](docs/SPEC.md) for the full type scale and motion timing tables.

---

## Key Files

| File                                | Purpose                                    |
|-------------------------------------|--------------------------------------------|
| [docs/SPEC.md](docs/SPEC.md)        | **Read first** — full design spec          |
| [app/layout.tsx](app/layout.tsx)    | Root layout, fonts, metadata               |
| [app/globals.css](app/globals.css)  | Tailwind v4 theme + design tokens          |
| [app/page.tsx](app/page.tsx)        | Home page composition                      |
| [components/home/](components/home) | Section components                         |
| [components/ui/](components/ui)     | Shared primitives (Magnetic, Tilt, …)      |
| [lib/tokens.ts](lib/tokens.ts)      | Palette and type-scale exports             |
| [public/krain/](public/krain)       | Logo assets                                |

---

## Site Structure (top to bottom)

1. Top status ticker (48px, hairline border)
2. Sticky nav (logo + 6 links + magnetic "Start a brief" CTA)
3. Hero — coral slash, two-col grid, ultralight H1
4. Stats bar (4 columns with counter animation)
5. Selected work (5 project cards, first is featured/spans 2 rows)
6. Manifesto (dark section, "junctions" word reveal)
7. Services (6 cards, A–F)
8. Journal (3 cards)
9. CTA "Got a set of plans?" with mailto + magnetic buttons
10. Footer (© Krain Studio · MMXXVI · Sheffield / London)

---

## Build Rules

- **Read [docs/SPEC.md](docs/SPEC.md) before starting any section**
- Hero is the highest priority — nail the first impression
- Motion must be tasteful and inertial — Framer Motion springs, not CSS
- All copy in refined British-English
- No lorem ipsum — use the realistic project copy from the spec
- Site must look excellent without real photography (placeholders are by-design)
- Mobile-first responsive — stack hero columns at < 900px, reduce H1 to 64px,
  kill cursor-driven motion on touch
- `prefers-reduced-motion` support required

---

## Open items (from handoff, decisions made)

| Item                            | Decision                                              |
|---------------------------------|-------------------------------------------------------|
| Framework                       | Next.js 16 App Router + TypeScript (already in repo)  |
| CMS                             | Hard-coded for v1; revisit Sanity/Contentlayer later  |
| Contact email                   | `matt@krain.studio` (handoff said `matt@krainstudio` — assumed missing TLD; confirm with client) |
| Real photography                | TBD — placeholders shipped; designed to swap in cleanly |
| Other pages (Work, Process, …)  | Home v1 ships first; remaining pages scoped, not built |

---

## Commands

```bash
npm run dev      # localhost:3000
npm run build    # production build (uses Next.js standalone output for Docker)
docker build .   # locally validate the production image
```

---

## Git & Deploy Workflow

**Branch:** `main` (single branch — dev and deploy are the same)

```bash
git add <files>
git commit -m "🤖 feat/fix: description"
git push origin main
```

After push, deploy on Contabo:

```bash
ssh contabo "/opt/stack/bin/deploy-site.sh \
  --site-dir /opt/stack/sites/krain-studio \
  --service krain \
  --branch main \
  --healthcheck-url https://www.krain.studio"
```

The script does git fetch + rebuild + health check + rollback on failure.
Caddy fronts the container with auto-TLS via Let's Encrypt.

---

## Acceptance for Home v1

- [x] Live on production at `https://www.krain.studio/` (apex 301-redirects to www)
- [x] Live preview at `https://preview-krain.buildsales.homes/`
- [x] Let's Encrypt cert via Caddy (auto-renewing)
- [x] `prefers-reduced-motion` honoured
- [x] All motion specs from [docs/SPEC.md](docs/SPEC.md) Motion table implemented
- [ ] Pixel-comparison against `docs/source/krain/dir-brutalist.jsx` at 1440px
- [ ] Lighthouse: Performance ≥ 90, Accessibility ≥ 95, SEO ≥ 95
- [ ] Real photos slot in cleanly (placeholders are easy to swap)
- [ ] Mobile QA pass

---

*Last updated: 2026-04-27 — live on Contabo*
