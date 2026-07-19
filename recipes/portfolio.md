---
name: portfolio-signal
version: 1.0.0
author: farshadmomo
description: Creative developer/designer portfolio — quiet confidence, type-led, case studies that read like narratives
extends: [./creative-core.md]
routes:
  animation: [animate, animation, scroll, motion, transition, hover, parallax, stagger, gsap, reveal, cursor, hero, section, page, component, landing, build, nav, navbar, footer, project, case]
  threed: [3d, three, webgl, shader, scene, hero, signature]
  copy: [copy, text, headline, tagline, tone, wording, voice, bio, about, hero, section, page, landing, case, study]
  seo: [seo, meta, og, sitemap, schema, search, lighthouse, page, landing]
skills:
  # per-prompt nudge — when a channel fires, the hook names these for that prompt
  ui: [ui-ux-pro-max, frontend-design, impeccable]
  animation: [gsap-react, gsap-performance, gsap-scrolltrigger, gsap-plugins]
  threed: [threejs-fundamentals, threejs-loaders]
  seo: [seo]
requires:
  ui-ux-pro-max: claude plugin marketplace add nextlevelbuilder/ui-ux-pro-max-skill && claude plugin install ui-ux-pro-max@ui-ux-pro-max-skill
  frontend-design: claude plugin marketplace add anthropics/claude-plugins-official && claude plugin install frontend-design@claude-plugins-official
  impeccable: claude plugin marketplace add pbakaus/impeccable && claude plugin install impeccable@impeccable
  gsap-react: npx skills add greensock/gsap-skills@gsap-react
  gsap-performance: npx skills add greensock/gsap-skills@gsap-performance
  gsap-scrolltrigger: npx skills add greensock/gsap-skills@gsap-scrolltrigger
  gsap-timeline: npx skills add greensock/gsap-skills@gsap-timeline
  gsap-plugins: npx skills add greensock/gsap-skills@gsap-plugins
  threejs-fundamentals: npx skills add cloudai-x/threejs-skills@threejs-fundamentals
  threejs-loaders: npx skills add cloudai-x/threejs-skills@threejs-loaders
  seo: claude plugin marketplace add AgriciDaniel/claude-seo && claude plugin install claude-seo@agricidaniel-claude-seo
---

## [always] vibe
A portfolio whose confidence is in the restraint. One decisive base (near-white paper OR near-black — kickoff decides), one accent used like a signature, enormous whitespace, and typography doing the heavy lifting: a characterful grotesk at scale, serif italic only for asides. The work is the loudest thing on every page. Banned: "Hi, I'm X 👋" hero, skill progress bars, testimonial carousels, three-card services grid, stock "let's work together" gradients, tech-logo walls. One remarkable moment beats ten decorations — this site IS the work sample; its signature interaction becomes its identity, the thing another developer opens devtools to figure out.

## [ui] design
Craft reference if you want it: /ui-ux-pro-max and /frontend-design; an /impeccable pass on finished sections pays off. Follow DESIGN.md. The index is a statement, not a menu: name treatment at absurd scale, work list as typographic entries with hover previews — no thumbnail card grid. Case studies read like narratives: problem, decisions, outcome, each with real artifacts (screens, sketches, metrics) in generous rhythm. After each section, run the generic-kill pass. Perfect focus states — this site gets inspected by people who notice.

## [animation] motion
Choreography is yours — invent the moves. GSAP throughout. If GSAP earns its place over platform primitives: correct setup/cleanup and a pre-ship performance pass are on you (/gsap-react and /gsap-performance when you want the reference) — 60fps or cut it. CONSULT /gsap-scrolltrigger, /gsap-timeline, /gsap-plugins (SplitText-style reveals) for technique. Starters, not a list: page transitions that carry an element between routes, the name treatment that reacts to cursor, work entries whose preview follows the pointer with lag, headings that assemble on first scroll. Motion must feel authored, never installed. prefers-reduced-motion always.

## [threed] scene
Only if the concept earns it — a small persistent signature (a generative mark that lives in the corner, a hero object with pointer physics) beats a big obligatory scene. Skipping 3D entirely is a valid identity. Reference when needed: /threejs-fundamentals for setup, /threejs-loaders for any asset. Lazy-load, static fallback.

## [copy] voice
First person, plain, specific: "I design systems and then break their grids on purpose." Case studies state decisions and tradeoffs, not buzzwords. Bio is three sentences a human would say aloud. No "passionate", no "crafting digital experiences".

## [stack] tech
Next.js (App Router) + Tailwind CSS. GSAP. React Three Fiber only if the signature lands. next/font, next/image, MDX for case studies. Fully static (SSG). Vercel. No UI kits. Libraries are defaults, not dogma — platform primitives win whenever they hit the same result at 60fps; shipping fewer is the better build.

## [seo] search
Correct schema and meta are non-negotiable; /seo is the reference, scaled to the site: Person + CreativeWork JSON-LD, per-case-study meta + OG in the site's art direction, semantic headings under the theatrics. The work list must be crawlable text. Motion never blocks LCP.

## [testing] checks
The case-study MDX pipeline gets the check first. Verify transitions by driving the routes at both motion preferences.
