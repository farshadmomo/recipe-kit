---
name: devtool-mono
version: 1.0.0
author: farshadmomo
description: Developer-tool SaaS landing — terminal-honest, mono type for real output, benchmarks over adjectives
extends: [./creative-core.md]
routes:
  animation: [animate, animation, motion, transition, hover, stagger, reveal, type, typing, hero, section, page, component, landing, build, nav, navbar, footer, demo]
  copy: [copy, text, headline, tagline, tone, wording, brand, voice, slogan, hero, section, page, landing, docs, pricing]
  seo: [seo, meta, og, sitemap, schema, search, lighthouse, page, landing, docs]
skills:
  # per-prompt nudge — when a channel fires, the hook names these for that prompt
  ui: [ui-ux-pro-max, frontend-design, web-design, impeccable]
  animation: [animejs]
  seo: [seo]
requires:
  ui-ux-pro-max: claude plugin marketplace add nextlevelbuilder/ui-ux-pro-max-skill && claude plugin install ui-ux-pro-max@ui-ux-pro-max-skill
  frontend-design: claude plugin marketplace add anthropics/claude-plugins-official && claude plugin install frontend-design@claude-plugins-official
  impeccable: claude plugin marketplace add pbakaus/impeccable && claude plugin install impeccable@impeccable
  web-design: npx skillfish add aviflombaum/claude-code-in-avinyc/plugins/design-system/skills/web-design --global --yes
  animejs: npx skills add BowTiedSwan/animejs-skills
  seo: claude plugin marketplace add AgriciDaniel/claude-seo && claude plugin install claude-seo@agricidaniel-claude-seo
---

## [always] vibe
A landing page engineers trust on sight. High contrast, decisive grid, mono type for anything that is code or output — and everything mono must be REAL: real commands, real output, real error messages, zero lorem-terminal. One accent color used like syntax highlighting. Dark and light themes both first-class, not an afterthought toggle. Banned: purple gradient hero, fake dashboard illustrations, logo-soup "trusted by" walls, "supercharge/10x/blazingly" verbs, scroll-jacking, AI-generated abstract blobs. Show, never assert: the signature moment demonstrates the product rather than decorating it — the hero IS a working demo, the 404 runs the tool on itself, the pricing page computes your bill live.

## [ui] design
Craft reference if you want it: /ui-ux-pro-max, /frontend-design, and /web-design; an /impeccable pass on finished sections pays off. Follow DESIGN.md. Hero: the install command, copyable, above the fold — that's the CTA. Feature sections pair one claim with one proof (terminal capture, benchmark table, diff view). Docs-quality code blocks everywhere: syntax highlighting, copy buttons, correct overflow scrolling. Pricing as an honest table, limits stated plainly. After each section, run the generic-kill pass. Keyboard and screen-reader clean — your buyers test that.

## [animation] motion
Minimal and precise — motion here is confirmation, not spectacle. CONSULT /animejs for micro-interaction technique. Vocabulary: a typed terminal demo that types real output at believable speed (and is instantly skippable), copy-button feedback, hover states that confirm in under 150ms. No parallax, no floaty cards, nothing eased longer than 300ms. prefers-reduced-motion: the terminal renders complete, everything else is instant.

## [copy] voice
Engineer-to-engineer: state what it does, how fast, and what it costs — with units ("Parses 1.2M rows/s on an M1. MIT licensed."). Benchmarks link to their methodology. Limitations get their own honest section; nothing builds trust faster. No exclamation marks, no "simply".

## [stack] tech
Next.js (App Router) + Tailwind CSS. Anime.js v4 for the little motion there is. next/font (grotesk + a real coding mono), next/image for captures. MDX for docs pages. Fully static. Vercel. No UI kits. Libraries are defaults, not dogma — platform primitives win whenever they hit the same result at 60fps; shipping fewer is the better build.

## [seo] search
Correct schema and meta are non-negotiable; /seo is the reference, scaled to the site: SoftwareApplication JSON-LD (version, OS, license), per-page meta + OG (make the OG card look like the terminal), docs crawlable with semantic headings — engineers arrive from search, docs pages ARE the funnel. Fast is the brand: green Core Web Vitals or the vibe is a lie.

## [testing] checks
The typed-demo sequencer and the pricing calculator get the checks first. Verify both themes and both motion preferences by driving the page.
