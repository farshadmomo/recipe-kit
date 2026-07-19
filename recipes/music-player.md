---
name: player-analog
version: 1.0.0
author: farshadmomo
description: Web music player app — warm hardware feel, waveform-first, springy tactile controls, product UI not marketing
extends: [./creative-core.md]
routes:
  animation: [animate, animation, motion, transition, hover, stagger, spring, press, scrub, seek, knob, slider, hero, section, page, component, build, nav, player, control]
  copy: [copy, text, label, tone, wording, microcopy, empty, error, tooltip, name]
  seo: [seo, meta, og, schema, search, page, landing]
skills:
  # per-prompt nudge — when a channel fires, the hook names these for that prompt
  ui: [ui-ux-pro-max, frontend-design, impeccable]
  animation: [animejs, animation-libraries]
  seo: [seo]
requires:
  ui-ux-pro-max: claude plugin marketplace add nextlevelbuilder/ui-ux-pro-max-skill && claude plugin install ui-ux-pro-max@ui-ux-pro-max-skill
  frontend-design: claude plugin marketplace add anthropics/claude-plugins-official && claude plugin install frontend-design@claude-plugins-official
  impeccable: claude plugin marketplace add pbakaus/impeccable && claude plugin install impeccable@impeccable
  animejs: npx skills add BowTiedSwan/animejs-skills
  animation-libraries: npx skillfish add itsimonfredlingjack/codex-dev-plugin/.agents/skills/animation-libraries --global --yes
  seo: claude plugin marketplace add AgriciDaniel/claude-seo && claude plugin install claude-seo@agricidaniel-claude-seo
---

## [always] vibe
This is a PRODUCT, not a landing page — a music player that feels like well-machined hardware. Warm neutrals (aluminum, cream, one amber glow like a VU meter), surfaces with just enough depth to feel pressable, the waveform as the hero element — big, honest, scrubable. Every control should feel weighted: knobs, toggles, and sliders with real travel. Banned: Spotify-clone dark-green, wall-of-album-cards grid, glassmorphism player chrome, fake vinyl skeuomorphism, visualizer confetti. Tactile beats flat: the signature interaction is a control that's a joy to fidget with even when nothing plays.

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
The playback state machine gets the check first (play/pause/seek/end transitions), then queue ordering. Drive the real UI for feel; don't unit-test springs.
