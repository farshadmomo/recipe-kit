---
name: cinema-noir
version: 1.0.0
author: farshadmomo
description: Independent arthouse cinema — filmic dark, credits-roll typography, grain, showtimes that read like a program
routes:
  animation: [animate, animation, scroll, motion, transition, hover, parallax, stagger, gsap, lenis, reveal, flicker, hero, section, page, component, landing, build, nav, navbar, footer, credits]
  threed: [3d, three, webgl, shader, scene, projector, beam, hero]
  copy: [copy, text, headline, tagline, tone, wording, brand, voice, slogan, hero, section, page, landing, synopsis, program]
  seo: [seo, meta, og, sitemap, schema, search, lighthouse, page, landing, showtime, screening]
skills:
  # per-prompt nudge — when a channel fires, the hook names these for that prompt
  ui: [ui-ux-pro-max, frontend-design, impeccable]
  animation: [gsap-react, gsap-performance, gsap-scrolltrigger]
  threed: [threejs-fundamentals, threejs-loaders]
  seo: [seo]
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
  gsap-plugins: npx skills add greensock/gsap-skills@gsap-plugins
  threejs-fundamentals: npx skills add cloudai-x/threejs-skills@threejs-fundamentals
  threejs-loaders: npx skills add cloudai-x/threejs-skills@threejs-loaders
  threejs-lighting: npx skills add cloudai-x/threejs-skills@threejs-lighting
  seo: claude plugin marketplace add AgriciDaniel/claude-seo && claude plugin install claude-seo@agricidaniel-claude-seo
---

## [always] responses
MUST use /caveman for status updates and routine replies, /ponytail for code — smallest working diff, reuse before writing. When explaining design rationale, clarity outranks compression — drop caveman and answer plainly.
Those two are the only mandatory skills. Every other skill this recipe names is optional reference, not a gate: open one when you expect it to change the result — an API you’d otherwise guess at, a domain where being wrong is expensive — and skip it when your own knowledge already covers the job. A build that invokes zero skills is normal, often the best-value one; the work is judged on what ships, not on which skills were opened. Never invoke a skill as ceremony, and never copy a skill’s example layouts or palettes — design from this recipe’s taste through your own judgment.

## [always] vibe
An independent cinema that takes film more seriously than marketing. Charcoal-to-black backgrounds, bone-white type, film grain over everything, stills presented letterboxed like frames the projectionist saved. Typography does what a title sequence does: elegant serif display with real presence, tracked small-caps for labels, credits-style hierarchies. The site should feel like the lights just went down. Banned: Netflix-style poster carousels, star-rating widgets, red-velvet-and-gold clichés, popcorn iconography, autoplay trailers with sound. This concept is the default, not a cage: when the user asks for a different concept or aesthetic, their request wins — keep the craft bar, the creative-risk rule, and the spirit of the bans, rebuild the identity around THEIR concept, and never land on the generic AI-site look (purple gradients, emoji section headers, glass cards, cookie-cutter grids).

## [always] creativity
Creative risk is a requirement. Every build gets one signature moment no template would have — a transition, a reveal, a detail a cinephile would notice. If a section is the first thing you'd produce by default, discard it and take the second, stranger idea. Restraint is the register here: one perfect cut beats ten effects.

## [stack] kickoff
Project-start ritual — ONLY if DESIGN.md does not exist; skip once it does. Produce 3 concept directions that differ on every axis: layout system, type pairing, palette, motion concept, signature interaction. Present each as a compact sheet with the one moment someone would screenshot. No two directions may share an axis value. Ask the user to pick (if unattended, pick the riskier one). Write the winner into DESIGN.md as the design contract — later prompts follow it and never drift back to defaults.

## [ui] design
Craft reference if you want it: /ui-ux-pro-max and /frontend-design; an /impeccable pass on finished sections pays off. Follow DESIGN.md. This-week's program as a printed cinema program, not a grid of posters — dates as chapter heads, films as entries with time, hall, and one-line note from the programmer. Film pages built like title cards: still, credits block, synopsis in readable measure. After each section, run the generic-kill pass. Light-on-dark contrast stays AA; grain never sits over body text.

## [animation] motion
Choreography is yours — invent the cuts. Lenis + GSAP ScrollTrigger. If GSAP earns its place over platform primitives: correct setup/cleanup and a pre-ship performance pass are on you (/gsap-react and /gsap-performance when you want the reference) — 60fps or cut it. CONSULT /gsap-scrolltrigger, /gsap-timeline, and /gsap-plugins (SplitText-style) for technique. Starters, not a list: a projector-flicker reveal the first time each still enters, an about page that plays as a slow credits roll, section transitions that cut like scene changes (hard, confident, no easing soup). gsap.matchMedia + prefers-reduced-motion always — reduced motion gets clean fades.

## [threed] scene
Only if the concept earns it — this vibe usually doesn't need 3D, and skipping it is the default assumption. If it lands: a single projector beam in haze, pointer-reactive. Reference when needed: /threejs-fundamentals for setup, /threejs-loaders for any texture. CONSULT /threejs-lighting. Lazy-load, poster fallback.

## [copy] voice
The programmer's voice: dry, knowledgeable, in love with film and slightly tired of explaining it ("Tarkovsky. Bring patience."). Synopses in two sentences, no spoilers, no "masterpiece". Microcopy stays in character — sold out reads "Full house."

## [stack] tech
Next.js (App Router) + Tailwind CSS. GSAP + Lenis. React Three Fiber only if the beam lands. next/font, next/image. Showtimes as typed local data (JSON/MDX) — static-first, revalidate daily. Vercel. No UI kits. Libraries are defaults, not dogma — platform primitives win whenever they hit the same result at 60fps; shipping fewer is the better build.

## [seo] search
Correct schema and meta are non-negotiable; /seo is the reference, scaled to the site: ScreeningEvent JSON-LD per showtime (film, start time, hall), MovieTheater schema with hours and geo, per-film meta + OG stills in the letterboxed art direction. Showtimes must be crawlable text. Motion never blocks LCP.

## [testing] checks
Per /ponytail: one runnable check per non-trivial logic — the showtime date/grouping logic first. Verify motion by driving the page at both motion preferences.
