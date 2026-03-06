# KRAIN STUDIO — Project Guide

<!-- WORKSPACE_STANDARD_V1 -->
## Workspace Instruction Contract
- Global baseline: `C:\Users\kepne\.claude\CLAUDE.md`
- Project overlay: `./CLAUDE.md` (this file)
- If rules conflict, project rules win for this repository.

---

## Project Overview

**KRAIN STUDIO** — Premium brochure website for an architectural practice.

| Item | Value |
|------|-------|
| Type | One-page brochure website |
| Brand | KRAIN STUDIO |
| Industry | Residential architecture / planning drawings |
| Repo | github.com/Kepners/krain-studio |
| Hosting | Vercel (auto-deploy on push) |
| Domain | TBD |

**Full brief:** [docs/SPEC.md](docs/SPEC.md) — read this before building anything.

---

## Tech Stack

| Component | Technology |
|-----------|------------|
| Framework | Next.js 16 (App Router) + TypeScript |
| Styling | Tailwind CSS v4 |
| Animation | Framer Motion v12 |
| Icons | Lucide React (only if needed) |
| Hosting | Vercel |

---

## Design System

### Palette (Dark Graphite + Neon Electric Blue)
```
Background:  #141414  (warm near-black)
Surface:     #1a1a1a  (secondary)
Card:        #1e1e1e
Text:        #e8e4dc  (warm ivory — primary)
Secondary:   #9a9590  (warm stone)
Muted:       #5a5752  (dark grey)
Accent:      Electric blue — TBD precise hex, restrained use only
Border:      rgba(232, 228, 220, 0.08)
```

### Typography
- **Headings:** Cormorant Garamond (serif, 300–400 weight)
- **Body:** Inter (300–400 weight)
- Mix: large serif headlines + small tracked sans labels

### Key Design Rules
- Large margins, generous spacing
- Thin lines and architectural framing details
- No visual clutter
- Motion: soft, quiet, confident — never bouncy or flashy
- See [docs/SPEC.md](docs/SPEC.md) for full animation direction

---

## Key Files

| File | Purpose |
|------|---------|
| [docs/SPEC.md](docs/SPEC.md) | **READ THIS FIRST** — full creative brief |
| `app/layout.tsx` | Root layout, fonts, metadata |
| `app/globals.css` | Design tokens, Tailwind v4 theme |
| `app/page.tsx` | Page composition (all sections) |
| `components/` | Individual section components |

---

## Site Structure

1. Nav (sticky, scroll-aware)
2. Hero (cinematic load animation — most important)
3. Studio Introduction
4. Services (5 services)
5. Process (5 steps)
6. Featured Projects (3 placeholder cards)
7. Why Choose the Practice (3–4 reasons)
8. Contact / Enquiry
9. Footer

---

## Build Rules

- **Read [docs/SPEC.md](docs/SPEC.md) before starting any section**
- Hero is the highest priority — nail the first impression
- Motion must be tasteful and restrained — see spec for direction
- All copy in refined British-English
- No lorem ipsum — use realistic architectural placeholder content
- Site must look excellent without real photography
- Mobile-first responsive
- `prefers-reduced-motion` support required

---

## Commands

```bash
npm run dev      # localhost:3000
npm run build    # production build
git push         # auto-deploys to Vercel
```

---

## Git Workflow

Commit and push after every meaningful change.

```bash
git add -A && git commit -m "emoji: description" && git push
```

---

## Current Status

- [x] GitHub repo created
- [x] Next.js 16 bootstrapped (TypeScript, Tailwind v4, Framer Motion)
- [x] SPEC.md written with full creative brief
- [ ] Design tokens finalised
- [ ] Build started

---

*Created: 2026-03-06*
*Status: SPEC COMPLETE — READY TO BUILD*
