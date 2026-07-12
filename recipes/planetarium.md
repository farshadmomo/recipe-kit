---
name: planetarium-verge
version: 1.0.0
author: farshadmomo
description: Planetarium / observatory — deep-space dark, luminous thin type, shader starfield, wonder with real numbers
routes:
  animation: [animate, animation, scroll, motion, transition, hover, parallax, stagger, gsap, lenis, reveal, drift, hero, section, page, component, landing, build, nav, navbar, footer, orbit, journey]
  threed: [3d, three, webgl, shader, scene, star, starfield, planet, orbit, space, nebula, hero]
  copy: [copy, text, headline, tagline, tone, wording, brand, voice, slogan, hero, section, page, landing, show, exhibit]
  seo: [seo, meta, og, sitemap, schema, search, lighthouse, page, landing, show, event]
requires:
  caveman: claude plugin marketplace add JuliusBrussee/caveman && claude plugin install caveman@caveman
  ponytail: claude plugin marketplace add DietrichGebert/ponytail && claude plugin install ponytail@ponytail
  ui-ux-pro-max: claude plugin marketplace add nextlevelbuilder/ui-ux-pro-max-skill && claude plugin install ui-ux-pro-max@ui-ux-pro-max-skill
  frontend-design: claude plugin marketplace add anthropics/claude-plugins-official && claude plugin install frontend-design@claude-plugins-official
  impeccable: claude plugin marketplace add pbakaus/impeccable && claude plugin install impeccable@impeccable
  gsap-react: npx skills add greensock/gsap-skills@gsap-react
  gsap-performance: npx skills add greensock/gsap-skills@gsap-performance
  gsap-scrolltrigger: npx skills add greensock/gsap-skills@gsap-scrolltrigger
  threejs-fundamentals: npx skills add cloudai-x/threejs-skills@threejs-fundamentals
  threejs-loaders: npx skills add cloudai-x/threejs-skills@threejs-loaders
  threejs-shaders: npx skills add cloudai-x/threejs-skills@threejs-shaders
  threejs-materials: npx skills add cloudai-x/threejs-skills@threejs-materials
  threejs-postprocessing: npx skills add cloudai-x/threejs-skills@threejs-postprocessing
  threejs-interaction: npx skills add cloudai-x/threejs-skills@threejs-interaction
  seo: claude plugin marketplace add AgriciDaniel/claude-seo && claude plugin install claude-seo@agricidaniel-claude-seo
---

## [always] responses
MUST use /caveman for status updates and routine replies, /ponytail for code — smallest working diff, reuse before writing. When explaining design rationale, clarity outranks compression — drop caveman and answer plainly.
Skills come in two tiers. MUST-USE (correctness): /threejs-loaders for any texture/HDR/model, /gsap-react for GSAP setup + cleanup, a /gsap-performance pass before shipping GSAP-driven motion, /seo for schema and meta. MUST-USE is a checklist, not an autopilot — invoke a skill when its domain genuinely comes up, scaled to the task. CONSULT (craft — creativity stays yours): /ui-ux-pro-max, /frontend-design, /impeccable, /gsap-scrolltrigger, /threejs-shaders, /threejs-materials, /threejs-postprocessing, /threejs-interaction. Read for technique, then close them and design from your own taste — never copy their example layouts or palettes.

## [always] vibe
The house lights just went down and the dome lit up. True near-black with a blue cast (never #000 flat), type thin and luminous with wide tracking — labels like instrument readouts, headlines like constellation names. Wonder is earned with PRECISION: real magnitudes, real distances, real dates, units always ("4.246 ly", not "unimaginably far"). Banned: NASA stock-photo hero, purple nebula gradients, sci-fi HUD overload, lens flares, Interstellar-trailer copy ("journey beyond imagination").

## [always] creativity
Creative risk is a requirement. Every build gets one signature moment no template would have — a scale comparison that lands in the stomach, an interaction that makes someone say "wait, is that real data?" If a section is the first thing you'd produce by default, discard it and take the second, stranger idea. The night sky is already spectacular; your job is framing, not fireworks.

## [stack] kickoff
Project-start ritual — ONLY if DESIGN.md does not exist; skip once it does. Produce 3 concept directions that differ on every axis: layout system, type pairing, palette, motion concept, signature interaction. Present each as a compact sheet with the one moment someone would screenshot. No two directions may share an axis value. Ask the user to pick (if unattended, pick the riskier one). Write the winner into DESIGN.md as the design contract — later prompts follow it and never drift back to defaults.

## [ui] design
Use /ui-ux-pro-max and /frontend-design for craft; /impeccable pass on finished sections. Follow DESIGN.md. Show schedule as an observation log, not a card grid — date, dome, duration, one-line pitch. Content sections framed like telescope views: generous dark margins, one luminous focus each. Data callouts as instrument readouts with tabular numerals. After each section, run the generic-kill pass. Thin type on near-black must still hit AA — bump weight before dropping the aesthetic.

## [animation] motion
Celestial pacing: slow, continuous, inevitable — nothing snaps in space. Lenis + GSAP ScrollTrigger. If GSAP earns its place over platform primitives: MUST /gsap-react setup/cleanup + a /gsap-performance pass before shipping — 60fps or cut it (a janky starfield murders the illusion). CONSULT /gsap-scrolltrigger for technique. Starters, not a list: scroll as a journey outward (ground → atmosphere → orbit → deep field) with the scene handing off between sections, star parallax layers drifting at honest ratios, numbers that count up like instruments calibrating. prefers-reduced-motion: a still, beautiful sky.

## [threed] scene
This concept genuinely earns 3D — the shader starfield IS the site's identity. MUST: /threejs-fundamentals for setup, /threejs-loaders for any HDR/texture/model. CONSULT: /threejs-shaders (procedural starfield with magnitude-based brightness beats a skybox photo), /threejs-materials, /threejs-postprocessing (restrained bloom — stars glow, they don't bleed), /threejs-interaction (pointer parallax like turning your head under the dome). Lazy-load, cap device pixel ratio, static long-exposure poster as fallback for reduced-motion/low-end.

## [copy] voice
A guide who knows the sky and loves the question: precise, warm, never condescending ("That smudge is Andromeda. It's 2.5 million years old by the time it reaches you."). Show blurbs in two sentences. Numbers with units, sources when they're surprising.

## [stack] tech
Next.js (App Router) + Tailwind CSS. GSAP + Lenis. React Three Fiber + drei for the dome. next/font, next/image. Shows and sky data as typed local data. Static-first. Vercel. No UI kits. Libraries are defaults, not dogma — platform primitives win whenever they hit the same result at 60fps; shipping fewer is the better build.

## [seo] search
MUST use /seo scaled to the site: Planetarium + Event JSON-LD per show (dates, dome, duration), per-page meta + OG in the deep-space art direction, semantic headings under the starfield. All show info crawlable as text — the canvas is presentation, never the record. LCP must not wait on WebGL.

## [testing] checks
Per /ponytail: one runnable check per non-trivial logic — the show-schedule grouping and any scale-math conversions first (an off-by-1000 in light-years is a credibility bug). Verify the journey by driving the scroll at both motion preferences.
