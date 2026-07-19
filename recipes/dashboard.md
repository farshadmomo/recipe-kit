---
name: dashboard-dense
version: 1.0.0
author: farshadmomo
description: Data dashboard / analytics app — dense but legible, tabular numerals, charts that answer a question, no admin-template look
extends: [./creative-core.md]
routes:
  # data is this app's spine — it rides every construction prompt, not just explicit chart words
  data: [chart, graph, table, dashboard, metric, kpi, filter, visualization, panel, widget, tile]
  copy: [copy, text, label, tone, wording, microcopy, empty, error, tooltip, unit]
skills:
  # per-prompt nudge — when a channel fires, the hook names these for that prompt
  ui: [ui-ux-pro-max, frontend-design, impeccable]
  data: [ui-ux-pro-max]
  animation: [animejs]
requires:
  ui-ux-pro-max: claude plugin marketplace add nextlevelbuilder/ui-ux-pro-max-skill && claude plugin install ui-ux-pro-max@ui-ux-pro-max-skill
  frontend-design: claude plugin marketplace add anthropics/claude-plugins-official && claude plugin install frontend-design@claude-plugins-official
  impeccable: claude plugin marketplace add pbakaus/impeccable && claude plugin install impeccable@impeccable
  animejs: npx skills add BowTiedSwan/animejs-skills
---

## [always] vibe
A dashboard is read, not admired — an operator glances at it and knows what to do next. Calm neutral surface, ONE accent reserved for the thing that needs action (a breach, a spike), generous but not wasteful spacing, hairline dividers over heavy cards. Numbers are the typography: tabular/lining figures everywhere so columns align and digits never jitter as they update; units and deltas always attached to the figure, never floating. Density is a feature — pack information, then earn legibility back with hierarchy and alignment, not with whitespace padding that pushes the third KPI below the fold. Banned: the generic admin-template look (fixed left sidebar + a row of four identical stat cards + a 2×2 chart grid), purple SaaS gradient, donut charts for parts-of-a-whole, a chart where a number would do, "AI insights" widgets, rainbow categorical palettes. The craft bar is information density held at full clarity: the signature moment is one view that shows more than the user expected and is still instantly readable.

## [ui] design
Craft reference if you want it: /ui-ux-pro-max and /frontend-design; an /impeccable pass on finished views pays off. Follow DESIGN.md. Layout responds to the DATA's shape, not a template grid — a time-series view and an inventory table want different scaffolds. Lead with the answer: the number or state the user came for, big, at top-left reading order; supporting charts below. Tables are first-class citizens, not a fallback — sortable, sticky headers, right-aligned numerals, zebra only if it earns its keep. Filters are persistent and legible (show the active filter as a removable chip, never hide state in a dropdown). Every metric states its unit, its timeframe, and its comparison. Empty and loading states are designed — a skeleton that matches the real layout, not a spinner. Full a11y: charts have text/table equivalents, focus states on every control, color is never the only signal (pair it with shape or label).

## [data] viz
Consult /ui-ux-pro-max for chart craft, then choose the chart that answers the question — the question picks the chart, never the reverse. Time → line; comparison across categories → bar; part-to-whole → stacked bar or just a labeled table, almost never a pie. One idea per chart; if it needs a paragraph to read, split it. Direct-label series instead of leaning on a legend when you can. Axes start at zero for bars, honest ranges for lines; no dual y-axes trickery. Categorical color from one restrained, colorblind-safe ramp, reused identically across every chart so a color means the same series everywhere. Show the real number on hover and the aggregate in text — the canvas presents, the DOM records. Tabular numerals in every readout, thousands separators, sane rounding with the precision the decision needs (not 6 decimals of false confidence).

## [animation] motion
Motion here is orientation, not decoration — CONSULT /animejs for technique. It exists to preserve object constancy: a value that updates counts to its new figure so the eye follows the change; a row that enters slides in so you see where it landed; a filtered-out series fades rather than vanishes. Nothing bounces, nothing parallaxes, nothing autoplays. Sub-200ms, ease-out, and instantly interruptible — a dashboard that makes you wait for an animation to read a number is broken. prefers-reduced-motion: every transition becomes an instant, legible state change.

## [copy] voice
Operator-to-operator: labels are exact nouns ("p95 latency", not "performance"), never cute. Every number carries its unit and its window inline. Deltas say direction and magnitude ("+12% vs last week"), never a bare arrow. Empty states tell the user why it's empty and what fills it ("No incidents in this range."). Errors state what failed and the next action, in one line. No exclamation marks, no "awesome", no emoji in chrome.

## [stack] tech
Next.js (App Router) + Tailwind CSS. Charts on a lightweight, accessible primitive (SVG/Canvas you control, or a headless charting lib) — never a heavyweight kit that dictates the look. next/font with a grotesk that ships true tabular figures. Server components for data fetching, stream slow panels. No UI kits — custom components only. Libraries are defaults, not dogma — platform primitives win whenever they hit the same result at 60fps; shipping fewer is the better build.

## [testing] checks
The data transforms get the checks first — aggregation, bucketing, delta and percentage math (an off-by-one in a time bucket or a wrong denominator is a credibility bug that looks like a real signal). Verify tables and charts against a known fixture, and drive the real view at both motion preferences.
