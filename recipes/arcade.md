---
name: arcade-crt
version: 1.0.0
author: farshadmomo
description: Retro arcade / indie game studio — CRT phosphor glow, game-feel micro-interactions, one hidden easter egg
extends: [./creative-core.md]
routes:
  animation: [animate, animation, scroll, motion, transition, hover, stagger, spring, bounce, press, shake, hero, section, page, component, landing, build, nav, navbar, footer, game]
  threed: [3d, three, webgl, shader, scene, voxel, cabinet, hero]
  copy: [copy, text, headline, tagline, tone, wording, brand, voice, slogan, hero, section, page, landing, game]
  seo: [seo, meta, og, sitemap, schema, search, lighthouse, page, landing]
skills:
  # per-prompt nudge — when a channel fires, the hook names these for that prompt
  ui: [ui-ux-pro-max, frontend-design, impeccable]
  animation: [animejs, animation-libraries]
  threed: [threejs-fundamentals, threejs-materials, threejs-interaction]
  seo: [seo]
requires:
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

## [always] vibe
An arcade the way you remember it, not the way it looked: black with phosphor green and magenta glow, subtle scanlines and vignette (a whisper, never a filter slapped at 100%), pixel display type for headings ONLY — body text is a clean grotesk because legibility is not retro-optional. Everything responds like a game: states are instant, feedback is physical. Banned: comic-sans-adjacent pixel soup, autoplaying chiptune, 8-bit clipart walls, "PRESS START" used more than once, CRT filter over body text. Every build hides one easter egg worth discovering — a Konami code, a playable micro-toy in the 404 — and game-feel beats decoration: juice the interactions, not the backgrounds.

## [ui] design
Craft reference if you want it: /ui-ux-pro-max and /frontend-design; an /impeccable pass on finished sections pays off. Follow DESIGN.md. Game roster as cabinet marquees or cartridge spines — never a uniform card grid. Stats as score counters with tabular numerals. High-score-table layout for anything list-shaped (team, changelog, leaderboard). After each section, run the generic-kill pass. Glow effects must keep text at AA contrast; the vibe lives in accents, not readability.

## [animation] motion
Game-feel is the discipline — CONSULT /animejs and /animation-libraries for technique, then invent the moves. Vocabulary starters: buttons that squash-and-stretch on press with a 1-frame flash, hover states that blink like a selected menu item, a screen-shake reserved for exactly one moment per page, staggered sprite-style entrances, count-ups that tick like scores. Timing is game-fast (100–250ms, snappy easings). prefers-reduced-motion: all juice becomes instant state changes — the game still plays.

## [threed] scene
Only if the concept earns it — a playable 2D micro-toy often beats a 3D scene here. If it lands: a voxel arcade cabinet you can orbit, procedural — CONSULT /threejs-fundamentals for setup, /threejs-materials, and /threejs-interaction (pointer orbit). Keep it asset-free if possible. Lazy-load, static fallback.

## [copy] voice
Insert-coin energy, dry delivery: "New game. No quarters needed." Error pages in game-over grammar ("CONTINUE? 9…8…"). One arcade-ism per section max — the joke lands because it's rationed.

## [stack] tech
Next.js (App Router) + Tailwind CSS. Anime.js v4. React Three Fiber only if the cabinet lands. next/font (pixel display font subset carefully — they get heavy), next/image. Fully static. Vercel. No UI kits. Libraries are defaults, not dogma — platform primitives win whenever they hit the same result at 60fps; shipping fewer is the better build.

## [seo] search
Correct schema and meta are non-negotiable; /seo is the reference, scaled to the site: VideoGame/Organization JSON-LD, per-game meta + OG in the phosphor art direction, semantic headings under the glow. Game info must be crawlable text, not pixels. Motion never blocks LCP.

## [testing] checks
The easter-egg input sequence gets the check first (it's a tiny state machine). Verify juice by playing the page at both motion preferences.
