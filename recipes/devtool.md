---
name: devtool-mono
version: 1.0.0
author: farshadmomo
description: Developer-tool SaaS landing — terminal-honest, mono type for real output, benchmarks over adjectives
routes:
  animation: [animate, animation, motion, transition, hover, stagger, reveal, type, typing, hero, section, page, component, landing, build, nav, navbar, footer, demo]
  copy: [copy, text, headline, tagline, tone, wording, brand, voice, slogan, hero, section, page, landing, docs, pricing]
  seo: [seo, meta, og, sitemap, schema, search, lighthouse, page, landing, docs]
requires:
  caveman: claude plugin marketplace add JuliusBrussee/caveman && claude plugin install caveman@caveman
  ponytail: claude plugin marketplace add DietrichGebert/ponytail && claude plugin install ponytail@ponytail
  ui-ux-pro-max: claude plugin marketplace add nextlevelbuilder/ui-ux-pro-max-skill && claude plugin install ui-ux-pro-max@ui-ux-pro-max-skill
  frontend-design: claude plugin marketplace add anthropics/claude-plugins-official && claude plugin install frontend-design@claude-plugins-official
  impeccable: claude plugin marketplace add pbakaus/impeccable && claude plugin install impeccable@impeccable
  web-design: npx skillfish add aviflombaum/claude-code-in-avinyc/plugins/design-system/skills/web-design --global --yes
  animejs: npx skills add BowTiedSwan/animejs-skills
  seo: claude plugin marketplace add AgriciDaniel/claude-seo && claude plugin install claude-seo@agricidaniel-claude-seo
---

## [always] responses
MUST use /caveman for status updates and routine replies, /ponytail for code — smallest working diff, reuse before writing. When explaining design rationale, clarity outranks compression — drop caveman and answer plainly.
Those two are the only mandatory skills. Every other skill this recipe names is optional reference, not a gate: open one when you expect it to change the result — an API you’d otherwise guess at, a domain where being wrong is expensive — and skip it when your own knowledge already covers the job. A build that invokes zero skills is normal, often the best-value one; the work is judged on what ships, not on which skills were opened. Never invoke a skill as ceremony, and never copy a skill’s example layouts or palettes — design from this recipe’s taste through your own judgment.

## [always] vibe
A landing page engineers trust on sight. High contrast, decisive grid, mono type for anything that is code or output — and everything mono must be REAL: real commands, real output, real error messages, zero lorem-terminal. One accent color used like syntax highlighting. Dark and light themes both first-class, not an afterthought toggle. Banned: purple gradient hero, fake dashboard illustrations, logo-soup "trusted by" walls, "supercharge/10x/blazingly" verbs, scroll-jacking, AI-generated abstract blobs. This concept is the default, not a cage: when the user asks for a different concept or aesthetic, their request wins — keep the craft bar, the creative-risk rule, and the spirit of the bans, rebuild the identity around THEIR concept, and never land on the generic AI-site look (purple gradients, emoji section headers, glass cards, cookie-cutter grids).

## [always] creativity
Creative risk is a requirement. Every build gets one signature moment no template would have — and here it must demonstrate the product, not decorate it: the hero IS a working demo, the 404 runs the tool on itself, the pricing page computes your bill live. If a section is the first thing you'd produce by default, discard it and take the second, stranger idea. Show, never assert.

## [stack] kickoff
Project-start ritual — ONLY if DESIGN.md does not exist; skip once it does. Produce 3 concept directions that differ on every axis: layout system, type pairing, palette, motion concept, signature interaction. Present each as a compact sheet with the one moment someone would screenshot. No two directions may share an axis value. Ask the user to pick (if unattended, pick the riskier one). Write the winner into DESIGN.md as the design contract — later prompts follow it and never drift back to defaults.

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
Per /ponytail: one runnable check per non-trivial logic — the typed-demo sequencer and the pricing calculator first. Verify both themes and both motion preferences by driving the page.
