---
name: museum-vitrine
version: 1.0.0
author: farshadmomo
description: Digital museum / exhibition — archival elegance, wall-plaque typography, slow reverent motion, 3D artifact viewer
routes:
  animation: [animate, animation, scroll, motion, transition, hover, parallax, stagger, gsap, lenis, reveal, zoom, hero, section, page, component, landing, build, nav, navbar, footer, exhibit, gallery]
  threed: [3d, three, webgl, scene, artifact, scan, model, rotate, orbit, viewer, hero]
  copy: [copy, text, headline, tagline, tone, wording, voice, label, plaque, hero, section, page, landing, exhibit, catalog]
  seo: [seo, meta, og, sitemap, schema, search, lighthouse, page, landing, exhibition]
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
  threejs-materials: npx skills add cloudai-x/threejs-skills@threejs-materials
  threejs-lighting: npx skills add cloudai-x/threejs-skills@threejs-lighting
  threejs-interaction: npx skills add cloudai-x/threejs-skills@threejs-interaction
  seo: claude plugin marketplace add AgriciDaniel/claude-seo && claude plugin install claude-seo@agricidaniel-claude-seo
---

## [always] responses
MUST use /caveman for status updates and routine replies, /ponytail for code — smallest working diff, reuse before writing. When explaining design rationale, clarity outranks compression — drop caveman and answer plainly.
Skills come in two tiers. MUST-USE (correctness): /threejs-loaders for any scan/model/texture, /gsap-react for GSAP setup + cleanup, a /gsap-performance pass before shipping motion, /seo for schema and meta. MUST-USE is a checklist, not an autopilot — invoke a skill when its domain genuinely comes up, scaled to the task. CONSULT (craft — creativity stays yours): /ui-ux-pro-max, /frontend-design, /impeccable, /gsap-scrolltrigger, /threejs-materials, /threejs-lighting, /threejs-interaction. Read for technique, then close them and design from your own taste — never copy their example layouts or palettes.

## [always] vibe
A museum that respects the object. Warm gallery white (never sterile #fff), ink text, hairline rules like vitrine edges, a classical serif with real bookish authority for display, neutral sans for wall-plaque labels. Artifact photography enormous, on quiet backgrounds, with deep zoom — the artifact is always the loudest element. Banned: card grid of exhibits, hero slider, parallax applied to artifact images (the object does not wobble), beige-and-gold "heritage" kitsch, thumbnail crops that behead statues.

## [always] creativity
Creative risk is a requirement. Every exhibition gets one signature moment no template would have — a way of encountering an object that only the web can do. If a layout is the first thing you'd produce by default, discard it and take the second, stranger idea. Reverence and boldness are not opposites: be radical about the frame, conservative about the object.

## [stack] kickoff
Project-start ritual — ONLY if DESIGN.md does not exist; skip once it does. Produce 3 concept directions that differ on every axis: layout system, type pairing, palette, motion concept, signature interaction. Present each as a compact sheet with the one moment someone would screenshot. No two directions may share an axis value. Ask the user to pick (if unattended, pick the riskier one). Write the winner into DESIGN.md as the design contract — later prompts follow it and never drift back to defaults.

## [ui] design
Use /ui-ux-pro-max and /frontend-design for craft; /impeccable pass on finished sections. Follow DESIGN.md. Exhibitions as rooms you scroll through — each object gets space, a plaque-style label block (title, date, origin, one-paragraph note), and breathing room before the next. The collection index as a catalog, not a grid: typographic entries with small reference images. After each section, run the generic-kill pass. A11y is curatorial duty: alt text as miniature catalog entries, keyboard access to every viewer control.

## [animation] motion
Slow and reverent — the motion of gallery lighting, not a trailer. Lenis + GSAP ScrollTrigger. MUST: /gsap-react setup/cleanup, /gsap-performance before shipping — 60fps or cut it. CONSULT /gsap-scrolltrigger for technique. Starters, not a list: objects that fade up as you arrive like lights warming, plaque text that settles a beat after its object, a scroll-scrubbed walkthrough of one signature exhibition. Nothing bounces. prefers-reduced-motion: everything appears instantly, already lit.

## [threed] scene
This concept genuinely earns 3D: an artifact viewer for scanned objects — orbit, zoom, inspect. MUST: /threejs-fundamentals for setup, /threejs-loaders for GLTF scans and textures (draco/ktx2 compressed — scans get huge). CONSULT: /threejs-materials and /threejs-lighting (museum lighting: soft key, gentle rim — the scan should look lit, not rendered), /threejs-interaction for orbit controls with sane limits. Lazy-load per artifact, high-res still as fallback. One viewer pattern reused everywhere; no decorative 3D anywhere else.

## [copy] voice
Curatorial but human: plain sentences that carry expertise lightly ("Carved in one sitting, probably by a left-handed maker. Look at the chisel drift."). No academic hedging walls, no marketing wonder-words. Every label answers: what is it, when, why does it matter.

## [stack] tech
Next.js (App Router) + Tailwind CSS. GSAP + Lenis. React Three Fiber + drei for the viewer. next/font, next/image with art-directed crops. Collection as typed local data (JSON/MDX). Fully static. Vercel. No UI kits.

## [seo] search
MUST use /seo scaled to the site: Museum + ExhibitionEvent JSON-LD (dates, hours, geo), per-exhibit VisualArtwork schema, per-page meta + OG in the archival art direction. Catalog text must be crawlable; the 3D viewer never replaces the written record. Motion never blocks LCP.

## [testing] checks
Per /ponytail: one runnable check per non-trivial logic — the catalog data pipeline first. Verify the viewer by driving it (orbit limits, fallback render) at both motion preferences.
