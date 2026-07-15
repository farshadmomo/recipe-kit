---
name: player-analog
version: 1.0.0
author: farshadmomo
description: Web music player app — warm hardware feel, waveform-first, springy tactile controls, product UI not marketing
routes:
  animation: [animate, animation, motion, transition, hover, stagger, spring, press, scrub, seek, knob, slider, hero, section, page, component, build, nav, player, control]
  copy: [copy, text, label, tone, wording, microcopy, empty, error, tooltip, name]
  seo: [seo, meta, og, schema, search, page, landing]
requires:
  caveman: claude plugin marketplace add JuliusBrussee/caveman && claude plugin install caveman@caveman
  ponytail: claude plugin marketplace add DietrichGebert/ponytail && claude plugin install ponytail@ponytail
  ui-ux-pro-max: claude plugin marketplace add nextlevelbuilder/ui-ux-pro-max-skill && claude plugin install ui-ux-pro-max@ui-ux-pro-max-skill
  frontend-design: claude plugin marketplace add anthropics/claude-plugins-official && claude plugin install frontend-design@claude-plugins-official
  impeccable: claude plugin marketplace add pbakaus/impeccable && claude plugin install impeccable@impeccable
  animejs: npx skills add BowTiedSwan/animejs-skills
  animation-libraries: npx skillfish add itsimonfredlingjack/codex-dev-plugin/.agents/skills/animation-libraries --global --yes
  seo: claude plugin marketplace add AgriciDaniel/claude-seo && claude plugin install claude-seo@agricidaniel-claude-seo
---

## [always] responses
MUST use /caveman for status updates and routine replies, /ponytail for code — smallest working diff, reuse before writing. When explaining design rationale, clarity outranks compression — drop caveman and answer plainly.
Those two are the only mandatory skills. Every other skill this recipe names is optional reference, not a gate: open one when you expect it to change the result — an API you’d otherwise guess at, a domain where being wrong is expensive — and skip it when your own knowledge already covers the job. A build that invokes zero skills is normal, often the best-value one; the work is judged on what ships, not on which skills were opened. Never invoke a skill as ceremony, and never copy a skill’s example layouts or palettes — design from this recipe’s taste through your own judgment.

## [always] vibe
This is a PRODUCT, not a landing page — a music player that feels like well-machined hardware. Warm neutrals (aluminum, cream, one amber glow like a VU meter), surfaces with just enough depth to feel pressable, the waveform as the hero element — big, honest, scrubable. Every control should feel weighted: knobs, toggles, and sliders with real travel. Banned: Spotify-clone dark-green, wall-of-album-cards grid, glassmorphism player chrome, fake vinyl skeuomorphism, visualizer confetti. This concept is the default, not a cage: when the user asks for a different concept or aesthetic, their request wins — keep the craft bar, the creative-risk rule, and the spirit of the bans, rebuild the identity around THEIR concept, and never land on the generic AI-site look (purple gradients, emoji section headers, glass cards, cookie-cutter grids).

## [always] creativity
Creative risk is a requirement. The player gets one signature interaction no template would have — a control that's a joy to fidget with even when nothing plays. If a control looks like the first stock component you'd reach for, discard it and design the second, stranger one. Tactile beats flat; specific beats generic.

## [stack] kickoff
Project-start ritual — ONLY if DESIGN.md does not exist; skip once it does. Produce 3 concept directions that differ on every axis: layout system, type pairing, palette, motion concept, signature interaction. Present each as a compact sheet with the one moment someone would screenshot. No two directions may share an axis value. Ask the user to pick (if unattended, pick the riskier one). Write the winner into DESIGN.md as the design contract — later prompts follow it and never drift back to defaults.

## [ui] design
Craft reference if you want it: /ui-ux-pro-max and /frontend-design; an /impeccable pass on finished views pays off. Follow DESIGN.md. Type: a crisp grotesk for UI plus tabular/mono numerals for time — timestamps must never jitter as they tick. Layout like a device faceplate: player is the fixed instrument, library and queue are what changes around it. Full keyboard support (space, arrows, seek) and visible focus states — a player you can't drive from the keyboard is broken. Empty states are designed, not apologized for.

## [animation] motion
Anime.js v4 springs are the engine — CONSULT /animejs and /animation-libraries for technique, then invent the moves. Vocabulary starters: play button that squashes into pause, scrub handle with spring settle and magnetic snap to track starts, queue items that slide with real mass, volume knob with resistance. Springs snappy, never soupy. Audio drives motion where it's honest (level → glow), not decorative fakery. prefers-reduced-motion: springs become instant state changes.

## [copy] voice
UI microcopy, terse and warm: empty queue says "Nothing queued. Yet." Errors say what happened and what to do, in one line each. Labels are nouns, buttons are verbs. No exclamation marks in chrome.

## [stack] tech
Next.js (App Router) + Tailwind CSS. Web Audio API for playback and analysis — no player library; the state machine is the app, own it. Anime.js v4 for motion. Waveform on canvas, computed once and cached. next/font. Local file/demo tracks first; no backend until accounts genuinely demand one.

## [seo] search
Correct meta is non-negotiable; /seo is the reference, scaled to reality: this is an app — correct meta, OG share card in the hardware art direction, and a crawlable landing view. Skip audit tooling; there's nothing to audit until there are public pages.

## [testing] checks
Per /ponytail: one runnable check per non-trivial logic — the playback state machine first (play/pause/seek/end transitions), then queue ordering. Drive the real UI for feel; don't unit-test springs.
