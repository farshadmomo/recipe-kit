---
name: festival-neon
version: 1.0.0
author: farshadmomo
description: Music festival site — rave-poster maximalism, typographic lineup walls, stage-map scroll, ticket drops
routes:
  animation: [animate, animation, scroll, motion, transition, hover, parallax, stagger, gsap, lenis, marquee, ticker, reveal, hero, section, page, component, landing, build, nav, navbar, footer, lineup, schedule]
  threed: [3d, three, webgl, shader, scene, stage, lights, rig, laser, hero]
  copy: [copy, text, headline, tagline, tone, wording, brand, voice, slogan, hero, section, page, landing, lineup, artist]
  seo: [seo, meta, og, sitemap, schema, search, lighthouse, page, landing, event]
  commerce: [ticket, tickets, pass, cart, checkout, order, buy, merch, stock, tier]
requires:
  caveman: claude plugin marketplace add JuliusBrussee/caveman && claude plugin install caveman@caveman
  ponytail: claude plugin marketplace add DietrichGebert/ponytail && claude plugin install ponytail@ponytail
  ui-ux-pro-max: claude plugin marketplace add nextlevelbuilder/ui-ux-pro-max-skill && claude plugin install ui-ux-pro-max@ui-ux-pro-max-skill
  frontend-design: claude plugin marketplace add anthropics/claude-plugins-official && claude plugin install frontend-design@claude-plugins-official
  impeccable: claude plugin marketplace add pbakaus/impeccable && claude plugin install impeccable@impeccable
  gsap-react: npx skills add greensock/gsap-skills@gsap-react
  gsap-performance: npx skills add greensock/gsap-skills@gsap-performance
  gsap-scrolltrigger: npx skills add greensock/gsap-skills@gsap-scrolltrigger
  gsap-timeline: npx skills add greensock/gsap-skills@gsap-timeline
  animejs: npx skills add BowTiedSwan/animejs-skills
  threejs-fundamentals: npx skills add cloudai-x/threejs-skills@threejs-fundamentals
  threejs-loaders: npx skills add cloudai-x/threejs-skills@threejs-loaders
  threejs-lighting: npx skills add cloudai-x/threejs-skills@threejs-lighting
  threejs-postprocessing: npx skills add cloudai-x/threejs-skills@threejs-postprocessing
  ecommerce-kit: claude plugin marketplace add farshadmomo/ecommerce-kit && claude plugin install ecommerce-kit@ecommerce-kit
  seo: claude plugin marketplace add AgriciDaniel/claude-seo && claude plugin install claude-seo@agricidaniel-claude-seo
---

## [always] responses
MUST use /caveman for status updates and routine replies, /ponytail for code — smallest working diff, reuse before writing. When explaining design rationale, clarity outranks compression — drop caveman and answer plainly.
Those two are the only mandatory skills. Every other skill this recipe names is optional reference, not a gate: open one when you expect it to change the result — an API you’d otherwise guess at, a domain where being wrong is expensive — and skip it when your own knowledge already covers the job. A build that invokes zero skills is normal, often the best-value one; the work is judged on what ships, not on which skills were opened. Never invoke a skill as ceremony, and never copy a skill’s example layouts or palettes — design from this recipe’s taste through your own judgment.

## [always] vibe
A music festival site that feels like the poster wall outside the venue — loud, layered, screenshotted. Near-black base, ONE electric lead (acid green or hot pink — pick one, the other is a rare sting), halftone and noise textures, torn-paper and sticker collage edges. Type is the headliner: condensed poster capitals stacked tight, names crashing into each other like a lineup bill. Banned: DJ-with-hands-up stock hero, countdown-clock-as-hero cliché, three-column ticket-tier card grid, purple gradients, glassmorphism. This concept is the default, not a cage: when the user asks for a different concept or aesthetic, their request wins — keep the craft bar, the creative-risk rule, and the spirit of the bans, rebuild the identity around THEIR concept, and never land on the generic AI-site look (purple gradients, emoji section headers, glass cards, cookie-cutter grids).

## [always] creativity
Creative risk is a requirement. Every build gets one signature moment no template would dare — an interaction or layout break someone would clip and share. If a section is the first thing you'd produce by default, discard it and take the second, stranger idea. Loud beats tasteful here — but loud and CONTROLLED, like a good soundsystem.

## [stack] kickoff
Project-start ritual — ONLY if DESIGN.md does not exist; skip once it does. Produce 3 concept directions that differ on every axis: layout system, type pairing, palette, motion concept, signature interaction. Present each as a compact sheet with the one moment someone would screenshot. No two directions may share an axis value. Ask the user to pick (if unattended, pick the riskier one). Write the winner into DESIGN.md as the design contract — later prompts follow it and never drift back to defaults.

## [ui] design
Craft reference if you want it: /ui-ux-pro-max and /frontend-design; an /impeccable pass on finished sections pays off. Follow DESIGN.md. Lineup as a typographic wall — names sized by billing, not a card list. Schedule as a horizontal stage-by-stage timeline you scrub, not a table dump (keep a real table in the DOM for a11y). Diagonal marquee strips between sections. After each section, run the generic-kill pass: name its most templated element and replace it. Contrast on neon must still hit AA.

## [animation] motion
Choreography is yours — invent the moves. Lenis + GSAP ScrollTrigger. If GSAP earns its place over platform primitives: correct setup/cleanup and a pre-ship performance pass are on you (/gsap-react and /gsap-performance when you want the reference) — 60fps or cut the effect. CONSULT /gsap-scrolltrigger and /gsap-timeline for technique, /animejs for micro-interactions. Idea starters, not a list: lineup names that slam in with stagger, a stage map that lights up as you scroll past each act, marquee tickers that reverse on scroll direction, ticket button with a squash worth pressing twice. gsap.matchMedia + prefers-reduced-motion always.

## [threed] scene
At most one hero-grade 3D moment, and only if the chosen concept earns it — skipping 3D entirely is valid. Starters: a stage light-rig that sweeps with pointer, lasers cutting haze. Reference when needed: /threejs-fundamentals for setup, /threejs-loaders for any asset. CONSULT: /threejs-lighting, /threejs-postprocessing (bloom, but restrained). Lazy-load the canvas, static poster fallback for reduced-motion.

## [commerce] tickets
Never hand-roll payment or inventory logic — for ticket tiers, checkout, and stock, reach for /ecommerce-kit: drops sell out, and its stock-hold and oversell patterns are exactly the point. Re-skin the flows to this vibe. One drop timer max, typographic, no red panic banners.

## [copy] voice
Hype without corporate: short slams ("Three days. No headliners. All killers."), artist bios in one punchy line, all-caps reserved for names. No "unforgettable experience", no rocket emojis.

## [stack] tech
Next.js (App Router) + Tailwind CSS. GSAP + Lenis. React Three Fiber + drei if 3D lands. next/font, next/image. Static-first; server actions only for checkout. Vercel. No UI kits. Libraries are defaults, not dogma — platform primitives win whenever they hit the same result at 60fps; shipping fewer is the better build.

## [seo] search
Correct schema and meta are non-negotiable; /seo is the reference, scaled to the site: Festival/MusicEvent JSON-LD with dates, venue geo, and performer list; per-page meta + OG in the poster art direction. The lineup must exist as crawlable text, never only inside canvas or WebGL. Motion never blocks LCP.

## [testing] checks
Per /ponytail: one runnable check per non-trivial logic — ticket math and stock holds first. Verify motion by driving the page at both motion preferences.
