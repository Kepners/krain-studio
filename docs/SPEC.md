# KRAIN STUDIO — Project Specification

**Status:** READY TO BUILD
**Created:** 2026-03-06
**Type:** Premium brochure website — architectural practice

---

## Overview

Build a premium brochure website for an architectural practice called **KRAIN STUDIO**.

The site should feel timeless, precise, tactile, and quietly confident. An architecture practice with a modern edge — classic in tone, with subtle high-end micro-animations. The experience should feel excellent the moment the page loads: smooth, considered, calm, premium, and slightly cinematic. Avoid generic SaaS visuals and avoid trendy startup clichés.

---

## Brand

| Item | Value |
|------|-------|
| Brand name | KRAIN STUDIO |
| Industry | Architecture / architectural design / planning drawings / residential architecture |
| Audience | Homeowners, self-build clients, developers, people looking for a thoughtful architect |
| Positioning | Individual architect / small practice — credible now, scalable later |
| Tone | Restrained, intelligent, exacting, calm, premium, modern-classic |
| Mood words | Architectural, editorial, tactile, quiet luxury, precision, atmosphere, crafted |

---

## Creative Direction

### Feeling

The site should feel closer to a refined design practice than a cheap lead-gen site.

**Reference sites to interpret (capture the feeling, do NOT copy literally):**
- `get-ryze.ai` — immediate polish, motion quality, and confidence
- `techne.blog/features` — classy, restrained, premium
- `buildsales.homes` — clarity, rhythm, and confidence

Capture: strong rhythm, premium spacing, subtle motion, clear sections, satisfying first impression.

### Design Language

- **Background:** warm off-black, charcoal, stone, deep graphite, or soft architectural neutrals
- **Text:** warm white / muted ivory / soft grey
- **Accent:** very restrained — muted brass, pale concrete, or desaturated steel blue — subtle only
- Large margins and elegant spacing
- Strong grid
- Thin lines, dividers, panels, and subtle framing details
- No visual clutter
- Premium serif-sans pairing OR refined sans-serif with editorial hierarchy
- Layout: deliberate and architectural, not playful
- Overall tone: "classic with motion" — not futuristic

### Typography Direction

Display the brand as:
```
KRAIN
Studio
```
or
```
KRAIN STUDIO
```

The typography should carry a lot of the brand feel. Identity should feel like an architecture practice, not an agency or AI startup. Consider Cormorant Garamond or similar for headings, Inter/DM Sans for body.

---

## Tech Stack

| Component | Technology |
|-----------|------------|
| Framework | Next.js (App Router) + TypeScript |
| Styling | Tailwind CSS |
| Animation | Framer Motion |
| Icons | Lucide (only if needed) |
| Hosting | Vercel |

**Requirements:**
- Production-quality, easy to extend
- Mobile-first, then desktop
- Prioritise performance and accessibility
- Clean component structure, sensible folder layout

---

## Animation Direction

**This is extremely important.** Micro-animations everywhere — tasteful and restrained.

### Use:
- Soft fade/slide reveals on scroll
- Subtle parallax only where elegant
- Text reveal animations with good timing
- Hover states that feel crisp and intentional
- Image/panel movement that gives depth
- Slight line drawing or divider expansion on reveal
- Buttons with premium hover response
- Nav transitions that feel smooth and expensive
- Section entrances that reward scrolling without becoming distracting

### Avoid:
- Bouncy animations
- Exaggerated springiness
- Flashy neon effects
- Obvious startup gimmicks
- Anything game-like or juvenile

### Motion should feel:
smooth · quiet · confident · expensive · architectural · tactile

---

## Site Structure

One-page website with the following sections:

### 1. Header / Nav
- Sticky navigation
- Transparent on load → subtle frosted glass on scroll
- Brand wordmark (typographic, architectural)
- Nav links + "Enquire" CTA button
- Mobile hamburger menu

### 2. Hero
The hero must feel amazing on first load.

**Content:**
- Strong typographic headline (see copy direction below)
- Minimal supporting copy
- One primary CTA + one secondary CTA
- Visually rich but restrained right-side or background composition
  - Could use: abstract architectural imagery, layered gridlines, project fragments, drawing crops, subtle panels, or atmospheric textures
- Premium load animation (immediate, confident)

**Copy direction — avoid:**
- "We build dreams"
- "Innovative solutions"

**Copy direction — aim for:**
- Precise, understated, confident, architectural, modern British studio tone

**Headline ideas (directional only, write strong final copy):**
- Architecture with clarity.
- Thoughtful design, carefully drawn.
- Residential architecture, precisely considered.
- Design that feels resolved.

**Hero layout:**
- Strong headline left
- Architectural composition right (gridlines, panel fragments, abstract depth)
- CTAs below headline
- Subtle scroll indicator

### 3. Studio Introduction
Introduce KRAIN STUDIO as a practice focused on thoughtful residential architecture, planning drawings, and carefully resolved design. Concise, intelligent, trustworthy. Personal but not sentimental.

### 4. Services
3–5 service cards/blocks:
- Architectural Design
- Planning Drawings
- Home Extensions & Alterations
- Feasibility / Early Design
- Design for Self-Build or Developers

Each card: premium, concise, subtle hover motion.

### 5. Process
Calm, credible process steps:
1. Brief
2. Design
3. Planning
4. Technical Development
5. Delivery / Support

Presentation: elegant, minimal. Timeline-based or grid-based. Ordered and reassuring.

### 6. Featured Projects Preview
3 placeholder featured projects. Cards with:
- Project title
- Location
- Short descriptor
- Image placeholder (CSS/shape/panel — no real photos needed initially)
- Subtle hover movement

Should feel like an architecture portfolio preview. Easy to replace with real projects later.

### 7. Why Clients Choose the Practice
3–4 reasons that feel grown-up and credible:
- Clear communication
- Precise drawings
- Calm guidance through planning
- Thoughtful design decisions

Avoid cheesy trust signals.

### 8. Contact / Enquiry Section
Premium enquiry section:
- Short invitation to discuss a project
- Email link
- Phone placeholder
- Optional simple contact form

Elegant, not salesy.

### 9. Footer
Minimal, refined, architectural:
- KRAIN STUDIO
- Architectural Design
- Contact details
- Copyright
- Small social placeholder (only if tasteful)

---

## Copy Direction

**Voice:** refined British-English, clear, human, restrained, premium.

**Do not use:**
- Hype language
- Startup jargon
- Fake grandiosity
- Cheesy architecture clichés

---

## Interaction Details

- Buttons: polished hover and focus states
- Cards: subtle lift or shift on hover
- Images: slight scale or pan on hover
- Dividers: animate in on scroll reveal
- Text: editorial reveal on scroll
- Sticky nav: background/opacity changes subtly on scroll
- Section transitions: cohesive throughout

---

## Accessibility & Performance

- Strong contrast ratios
- Semantic HTML
- Keyboard accessible
- `prefers-reduced-motion` support
- Responsive typography
- Fast load — no heavy unnecessary libraries

---

## Content Notes

- Write all copy in a refined British-English tone
- Use realistic placeholder content that fits architecture — not lorem ipsum
- Images: use CSS shapes, panels, gradient placeholders until real photography is available
- Site should look excellent without custom photography

---

## Most Important Outcome

The site should feel premium and memorable within 2 seconds.
It should feel like an architecture practice with taste.
Motion quality should feel deliberate and satisfying.
It should not feel like a generic template.

---

## Current Status

- [x] Project bootstrapped (Next.js 16, TypeScript, Tailwind v4, Framer Motion)
- [x] GitHub repo created: `github.com/Kepners/krain-studio`
- [ ] Design tokens / colour system defined
- [ ] Component architecture planned
- [ ] Build started

## Next Steps

1. Define final colour palette (dark graphite + neon electric blue accent)
2. Choose typography pairing
3. Build component architecture
4. Implement hero first — nail the first impression
5. Build remaining sections in order
6. Deploy to Vercel
7. Connect domain
