---
name: arcade-crt
version: 1.0.0
author: farshadmomo
description: Retro arcade / indie game studio — CRT phosphor glow, game-feel micro-interactions, one hidden easter egg
routes:
  animation: [animate, animation, scroll, motion, transition, hover, stagger, spring, bounce, press, shake, hero, section, page, component, landing, build, nav, navbar, footer, game]
  threed: [3d, three, webgl, shader, scene, voxel, cabinet, hero]
  copy: [copy, text, headline, tagline, tone, wording, brand, voice, slogan, hero, section, page, landing, game]
  seo: [seo, meta, og, sitemap, schema, search, lighthouse, page, landing]
requires:
  caveman: claude plugin marketplace add JuliusBrussee/caveman && claude plugin install caveman@caveman
  ponytail: claude plugin marketplace add DietrichGebert/ponytail && claude plugin install ponytail@ponytail
  ui-ux-pro-max: claude plugin marketplace add nextlevelbuilder/ui-ux-pro-max-skill && claude plugin install ui-ux-pro-max@ui-ux-pro-max-skill
  frontend-design: claude plugin marketplace add anthropics/claude-plugins-official && claude plugin install frontend-design@claude-plugins-official
  impeccable: claude plugin marketplace add pbakaus/impeccable && claude plugin install impeccable@impeccable
  animejs: npx skills add BowTiedSwan/animejs-skills
  animation-libraries: npx skillfish add itsimonfredlingjack/codex-dev-plugin/.agents/skills/animation-libraries --global --yes
  threejs-fundamentals: npx skills add cloudai-x/threejs-skills@threejs-fundamentals
  threejs-materials: npx skills add cloudai-x/threejs-skills@threejs-materials
  threejs-interaction: npx skills add cloudai-x/threejs-skills@threejs-interaction
  seo: claude plugin marketplace add AgriciDaniel/claude-seo && claude plugin install claude-seo@agricidaniel-claude-seo
---

## [always] responses
MUST use /caveman for status updates and routine replies, /ponytail for code — smallest working diff, reuse before writing. When explaining design rationale, clarity outranks compression — drop caveman and answer plainly.
Skills come in two tiers. MUST-USE (correctness): /seo for schema and meta. MUST-USE is a checklist, not an autopilot — invoke a skill when its domain genuinely comes up, scaled to the task. CONSULT (craft — creativity stays yours): /ui-ux-pro-max, /frontend-design, /impeccable, /animejs, /animation-libraries, and the three.js skills if a scene lands. Read for technique, then close them and design from your own taste — never copy their example layouts or palettes.

## [always] vibe
An arcade the way you remember it, not the way it looked: black with phosphor green and magenta glow, subtle scanlines and vignette (a whisper, never a filter slapped at 100%), pixel display type for headings ONLY — body text is a clean grotesk because legibility is not retro-optional. Everything responds like a game: states are instant, feedback is physical. Banned: comic-sans-adjacent pixel soup, autoplaying chiptune, 8-bit clipart walls, "PRESS START" used more than once, CRT filter over body text.

## [always] creativity
Creative risk is a requirement. Every build hides one easter egg worth discovering (a Konami code, a playable micro-toy in the 404) and shows one signature moment no template would have. If a component is the first thing you'd produce by default, discard it and take the second, stranger idea. Game-feel beats decoration: juice the interactions, not the backgrounds.

## [stack] kickoff
Project-start ritual — ONLY if DESIGN.md does not exist; skip once it does. Produce 3 concept directions that differ on every axis: layout system, type pairing, palette, motion concept, signature interaction. Present each as a compact sheet with the one moment someone would screenshot. No two directions may share an axis value. Ask the user to pick (if unattended, pick the riskier one). Write the winner into DESIGN.md as the design contract — later prompts follow it and never drift back to defaults.

## [ui] design
Use /ui-ux-pro-max and /frontend-design for craft; /impeccable pass on finished sections. Follow DESIGN.md. Game roster as cabinet marquees or cartridge spines — never a uniform card grid. Stats as score counters with tabular numerals. High-score-table layout for anything list-shaped (team, changelog, leaderboard). After each section, run the generic-kill pass. Glow effects must keep text at AA contrast; the vibe lives in accents, not readability.

## [animation] motion
Game-feel is the discipline — CONSULT /animejs and /animation-libraries for technique, then invent the moves. Vocabulary starters: buttons that squash-and-stretch on press with a 1-frame flash, hover states that blink like a selected menu item, a screen-shake reserved for exactly one moment per page, staggered sprite-style entrances, count-ups that tick like scores. Timing is game-fast (100–250ms, snappy easings). prefers-reduced-motion: all juice becomes instant state changes — the game still plays.

## [threed] scene
Only if the concept earns it — a playable 2D micro-toy often beats a 3D scene here. If it lands: a voxel arcade cabinet you can orbit, procedural — CONSULT /threejs-fundamentals for setup, /threejs-materials, and /threejs-interaction (pointer orbit). Keep it asset-free if possible. Lazy-load, static fallback.

## [copy] voice
Insert-coin energy, dry delivery: "New game. No quarters needed." Error pages in game-over grammar ("CONTINUE? 9…8…"). One arcade-ism per section max — the joke lands because it's rationed.

## [stack] tech
Next.js (App Router) + Tailwind CSS. Anime.js v4. React Three Fiber only if the cabinet lands. next/font (pixel display font subset carefully — they get heavy), next/image. Fully static. Vercel. No UI kits. Libraries are defaults, not dogma — platform primitives win whenever they hit the same result at 60fps; shipping fewer is the better build.

## [seo] search
MUST use /seo scaled to the site: VideoGame/Organization JSON-LD, per-game meta + OG in the phosphor art direction, semantic headings under the glow. Game info must be crawlable text, not pixels. Motion never blocks LCP.

## [testing] checks
Per /ponytail: one runnable check per non-trivial logic — the easter-egg input sequence first (it's a tiny state machine). Verify juice by playing the page at both motion preferences.
