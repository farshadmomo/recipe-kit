---
name: coffee-creative
version: 1.0.0
author: farshadmomo
description: Modern, very creative specialty coffee shop site — cinematic scroll, tactile motion, editorial type, minimal code
routes:
  # motion is this site's identity — it rides every UI-construction prompt, not just explicit motion words
  animation: [animate, animation, scroll, motion, transition, hover, parallax, stagger, gsap, lenis, reveal, marquee, cursor, spring, smooth, hero, section, page, component, landing, build, nav, navbar, menu, footer]
  threed: [3d, three, webgl, shader, scene, bean, pour, hero]
  copy: [copy, text, headline, tagline, tone, wording, brand, voice, slogan, hero, section, page, landing, menu]
  seo: [seo, meta, og, sitemap, schema, search, lighthouse, page, landing]
skills:
  # per-prompt nudge — when a channel fires, the hook names these for that prompt
  ui: [ui-ux-pro-max, frontend-design, web-design, impeccable]
  animation: [gsap-react, gsap-performance, gsap-scrolltrigger, animejs]
  threed: [threejs-fundamentals, threejs-loaders]
  seo: [seo]
  backend: [ecommerce-kit]
requires:
  # skills this recipe leans on — `recipe use` warns if missing, `recipe setup --yes` installs
  caveman: claude plugin marketplace add JuliusBrussee/caveman && claude plugin install caveman@caveman
  ecommerce-kit: claude plugin marketplace add farshadmomo/ecommerce-kit && claude plugin install ecommerce-kit@ecommerce-kit
  ponytail: claude plugin marketplace add DietrichGebert/ponytail && claude plugin install ponytail@ponytail
  frontend-design: claude plugin marketplace add anthropics/claude-plugins-official && claude plugin install frontend-design@claude-plugins-official
  impeccable: claude plugin marketplace add pbakaus/impeccable && claude plugin install impeccable@impeccable
  ui-ux-pro-max: claude plugin marketplace add nextlevelbuilder/ui-ux-pro-max-skill && claude plugin install ui-ux-pro-max@ui-ux-pro-max-skill
  seo: claude plugin marketplace add AgriciDaniel/claude-seo && claude plugin install claude-seo@agricidaniel-claude-seo
  web-design: npx skillfish add aviflombaum/claude-code-in-avinyc/plugins/design-system/skills/web-design --global --yes
  animejs: npx skills add BowTiedSwan/animejs-skills
  animation-libraries: npx skillfish add itsimonfredlingjack/codex-dev-plugin/.agents/skills/animation-libraries --global --yes
  gsap-core: npx skills add greensock/gsap-skills@gsap-core
  gsap-react: npx skills add greensock/gsap-skills@gsap-react
  gsap-performance: npx skills add greensock/gsap-skills@gsap-performance
  gsap-scrolltrigger: npx skills add greensock/gsap-skills@gsap-scrolltrigger
  gsap-timeline: npx skills add greensock/gsap-skills@gsap-timeline
  gsap-plugins: npx skills add greensock/gsap-skills@gsap-plugins
  threejs-fundamentals: npx skills add cloudai-x/threejs-skills@threejs-fundamentals
  threejs-loaders: npx skills add cloudai-x/threejs-skills@threejs-loaders
  threejs-materials: npx skills add cloudai-x/threejs-skills@threejs-materials
  threejs-lighting: npx skills add cloudai-x/threejs-skills@threejs-lighting
  threejs-shaders: npx skills add cloudai-x/threejs-skills@threejs-shaders
  threejs-interaction: npx skills add cloudai-x/threejs-skills@threejs-interaction
  threejs-postprocessing: npx skills add cloudai-x/threejs-skills@threejs-postprocessing
---

## [always] responses
MUST use /caveman for status updates and routine replies, /ponytail for code — house rules; smallest working diff, reuse before writing, stdlib/platform before libraries. When explaining design rationale or answering a judgment question, clarity outranks compression — drop caveman and answer plainly.
Those two are the only mandatory skills. Every other skill this recipe names is optional reference, not a gate: open one when you expect it to change the result — an API you’d otherwise guess at, a domain where being wrong is expensive — and skip it when your own knowledge already covers the job. A build that invokes zero skills is normal, often the best-value one; the work is judged on what ships, not on which skills were opened. Never invoke a skill as ceremony, and never copy a skill’s example layouts or palettes — design from this recipe’s taste through your own judgment.

## [always] vibe
This is a modern, very creative specialty coffee shop website. It must feel handcrafted and art-directed, never templated. Banned: generic AI-site look (purple gradients, emoji section headers, glassmorphism cards on hero, cookie-cutter three-column features). Direction: warm minimalism — cream/paper background, espresso browns, one electric accent (burnt orange or acid green); oversized editorial typography; grain/noise texture overlays; photography treated like a print magazine, not stock-photo grids. Every interaction should feel tactile, like pulling an espresso shot. This concept is the default, not a cage: when the user asks for a different concept or aesthetic, their request wins — keep the craft bar, the creative-risk rule, and the spirit of the bans, rebuild the identity around THEIR concept, and never land on the generic AI-site look (purple gradients, emoji section headers, glass cards, cookie-cutter grids).

## [always] creativity
Creative risk is a requirement, not a bonus. Every build gets at least one signature moment no template would have — an interaction, layout break, or detail someone would screenshot and share. If a layout or component is the first thing you'd produce by default, discard it and take your second, stranger idea. The vibe above is a starting point to push past, not a ceiling. Bold beats safe; specific beats generic; weird-but-intentional beats polished-but-forgettable.

## [stack] kickoff
Project-start ritual — applies ONLY if DESIGN.md does not exist in the repo root; skip entirely once it does. Before writing any product code, produce 3 concept directions that differ on EVERY axis: layout system, type pairing, palette, motion concept, signature interaction. Present each as a compact sheet — name, one-line concept, the five axes, and the one moment someone would screenshot. No two directions may share an axis value; if two feel even similar, throw one out and go stranger. Ask the user to pick (if unattended, pick the one that feels slightly risky). Write the winner into DESIGN.md as the project's design contract — every later prompt follows DESIGN.md and never silently drifts back to default instincts.

## [ui] design
Craft reference if you want it: /ui-ux-pro-max, /frontend-design, and /web-design; an /impeccable pass on finished sections pays off. Follow DESIGN.md if it exists. After each finished page or section, run the generic-kill pass: name its most templated element and replace it with something specific to this shop before moving on. Typography: variable display serif (e.g. Fraunces) for headlines + grotesk (e.g. General Sans / Space Grotesk) for body, via next/font. Layout: asymmetric editorial grids and bento sections, oversized type that overlaps imagery, generous whitespace, sticky side labels. Menu/products as an art-directed spread, not a card grid. Full a11y basics always: focus states, contrast, semantic landmarks.

## [animation] motion
Creative choreography is yours — invent the moves, don't borrow them, and pick the lightest tool that hits 60fps: CSS keyframes, scroll-snap, and native inputs are wins, not compromises — a signature moment doesn't care what renders it. When scroll choreography earns a library: Lenis synced to GSAP ScrollTrigger (`lenis.on('scroll', ScrollTrigger.update)` + gsap ticker). If GSAP lands: correct setup + cleanup (useGSAP) and a pre-ship performance pass are on you (/gsap-react and /gsap-performance when you want the reference) — 60fps or cut the effect. CONSULT for technique: /gsap-core, /gsap-scrolltrigger, /gsap-timeline, /gsap-plugins (SplitText-style reveals), /animejs and /animation-libraries for micro-interactions. Idea starters only if you're stuck, and best discarded: a scroll-told brewing sequence, drifting parallax, clip-path reveals, a morphing cursor — the best builds use none of these and invent their own moves. Always respect prefers-reduced-motion (and wrap any GSAP work in gsap.matchMedia).

## [threed] scene
At most one hero-grade 3D moment, and only if the chosen concept earns it — a signature 2D or procedural moment beats an obligatory 3D one, and skipping 3D entirely is a valid design decision. The concept is yours (floating bean, slow latte-pour, steam shader are starters, not the menu). Reference when needed: /threejs-loaders for any model, texture, or HDR loading; /threejs-fundamentals for scene/camera/renderer setup. CONSULT for technique: /threejs-materials, /threejs-lighting, /threejs-shaders, /threejs-interaction (pointer parallax), /threejs-postprocessing (bloom, grain). Lazy-load the canvas, static poster fallback for reduced-motion/low-end devices.

## [copy] voice
Brand voice: warm, wry, confident — a barista who knows their craft and doesn't oversell it. Short punchy headlines ("Bitter, in a good way."), no corporate filler, no "elevate your experience". Microcopy has personality (empty cart: "Nothing brewing yet.").

## [stack] tech
Next.js (App Router) + Tailwind CSS. next/font for typography, next/image for media. Static-first (SSG); server actions only if a form/order flow demands it. Deploy on Vercel. No UI kits — every component custom. Motion and 3D libraries are house defaults, not dogma: GSAP + Lenis for scroll choreography, Anime.js v4 for micro-interactions, React Three Fiber + drei for 3D — each earns its place only when platform primitives can't hit the same result at 60fps, and shipping zero of them is a valid (often the best) build.

## [seo] search
Correct schema and meta are non-negotiable; /seo is the reference — scale it to the site: a landing page needs correct schema, meta, and alt text; save the full audit tooling for multi-page builds. JSON-LD CafeOrCoffeeShop schema (hours, geo, menu), per-page meta + OG images matching the art direction, semantic headings, image alt text with brand voice. Target green Core Web Vitals despite heavy motion — motion must never block LCP.

## [backend] server
Keep it static wherever possible: menu/products as typed local data (MDX or JSON). Contact/order form via a Next.js server action. No database until a real ordering feature demands one. If real ordering or money ever lands, never hand-roll it — /ecommerce-kit is the house reference.

## [testing] checks
Per /ponytail: one runnable check per non-trivial logic (cart math, form validation) — no test frameworks beyond node/jest already present, no snapshot suites. Verify animations by driving the page, not by unit-testing tweens.
