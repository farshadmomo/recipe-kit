---
name: drop-press
version: 1.0.0
author: farshadmomo
description: Streetwear brand + drops — brutalist lookbook, garment-tag typography, scarcity done honestly
routes:
  animation: [animate, animation, scroll, motion, transition, hover, parallax, stagger, gsap, marquee, reveal, drag, hero, section, page, component, landing, build, nav, navbar, footer, lookbook]
  copy: [copy, text, headline, tagline, tone, wording, brand, voice, slogan, hero, section, page, landing, product, drop]
  seo: [seo, meta, og, sitemap, schema, search, lighthouse, page, landing, product]
  commerce: [cart, checkout, product, order, shop, buy, stock, drop, release, size, merch]
requires:
  caveman: claude plugin marketplace add JuliusBrussee/caveman && claude plugin install caveman@caveman
  ponytail: claude plugin marketplace add DietrichGebert/ponytail && claude plugin install ponytail@ponytail
  ui-ux-pro-max: claude plugin marketplace add nextlevelbuilder/ui-ux-pro-max-skill && claude plugin install ui-ux-pro-max@ui-ux-pro-max-skill
  frontend-design: claude plugin marketplace add anthropics/claude-plugins-official && claude plugin install frontend-design@claude-plugins-official
  impeccable: claude plugin marketplace add pbakaus/impeccable && claude plugin install impeccable@impeccable
  web-design: npx skillfish add aviflombaum/claude-code-in-avinyc/plugins/design-system/skills/web-design --global --yes
  gsap-react: npx skills add greensock/gsap-skills@gsap-react
  gsap-performance: npx skills add greensock/gsap-skills@gsap-performance
  gsap-scrolltrigger: npx skills add greensock/gsap-skills@gsap-scrolltrigger
  animejs: npx skills add BowTiedSwan/animejs-skills
  ecommerce-kit: claude plugin marketplace add farshadmomo/ecommerce-kit && claude plugin install ecommerce-kit@ecommerce-kit
  seo: claude plugin marketplace add AgriciDaniel/claude-seo && claude plugin install claude-seo@agricidaniel-claude-seo
---

## [always] responses
MUST use /caveman for status updates and routine replies, /ponytail for code — smallest working diff, reuse before writing. When explaining design rationale, clarity outranks compression — drop caveman and answer plainly.
Those two are the only mandatory skills. Every other skill this recipe names is optional reference, not a gate: open one when you expect it to change the result — an API you’d otherwise guess at, a domain where being wrong is expensive — and skip it when your own knowledge already covers the job. A build that invokes zero skills is normal, often the best-value one; the work is judged on what ships, not on which skills were opened. Never invoke a skill as ceremony, and never copy a skill’s example layouts or palettes — design from this recipe’s taste through your own judgment.

## [always] vibe
A streetwear brand that art-directs like a magazine and ships like a warehouse. Raw brutalist lookbook: oversized grotesk in tight stacks, off-grid photo placements that overlap on purpose, hard 1px borders, no border-radius anywhere. Monochrome base with ONE utility accent (safety orange or high-vis yellow). Product data displayed like garment tags — mono type, specs, fabric, care icons. Banned: Shopify-template product grid, SALE badges, hypebeast lightning-bolt emojis, fake urgency banners, more than one drop timer per page. This concept is the default, not a cage: when the user asks for a different concept or aesthetic, their request wins — keep the craft bar, the creative-risk rule, and the spirit of the bans, rebuild the identity around THEIR concept, and never land on the generic AI-site look (purple gradients, emoji section headers, glass cards, cookie-cutter grids).

## [always] creativity
Creative risk is a requirement. Every build gets one signature moment no template would have — a lookbook interaction, a cart detail, a product page break someone would screenshot. If a layout is the first thing you'd produce by default, discard it and take the second, stranger idea. The clothes are the content; the site is the attitude.

## [stack] kickoff
Project-start ritual — ONLY if DESIGN.md does not exist; skip once it does. Produce 3 concept directions that differ on every axis: layout system, type pairing, palette, motion concept, signature interaction. Present each as a compact sheet with the one moment someone would screenshot. No two directions may share an axis value. Ask the user to pick (if unattended, pick the riskier one). Write the winner into DESIGN.md as the design contract — later prompts follow it and never drift back to defaults.

## [ui] design
Craft reference if you want it: /ui-ux-pro-max, /frontend-design, and /web-design; an /impeccable pass on finished sections pays off. Follow DESIGN.md. Lookbook as a drag-to-explore horizontal rail or an editorial spread — never a uniform grid. Product page reads like a spec sheet: huge image, garment-tag data block, size selector as flat typographic buttons with real disabled states for sold sizes. Cart is a drawer with the same tag typography. After each section, run the generic-kill pass. A11y: focus states on everything, size buttons keyboard-operable.

## [animation] motion
Choreography is yours — invent the moves. GSAP for scroll, Anime.js for micro. If GSAP earns its place over platform primitives: correct setup/cleanup and a pre-ship performance pass are on you (/gsap-react and /gsap-performance when you want the reference) — 60fps or cut it. CONSULT /gsap-scrolltrigger and /animejs for technique. Starters, not a list: images that reveal with a hard clip-path wipe (no soft fades — this brand doesn't fade), marquee of the drop name, size buttons that snap on select, add-to-cart that stamps like a price gun. prefers-reduced-motion respected always.

## [commerce] shop
Never hand-roll money or inventory — before writing any cart, checkout, stock, or drop logic, reach for /ecommerce-kit: drops are its exact domain (stock holds, oversell guards, webhook idempotency). Re-skin the flows to garment-tag brutalism. Sold out is stated flat: "GONE." — no waitlist theatrics unless a real waitlist exists.

## [copy] voice
Terse and certain, like the label on good workwear: "Heavyweight. Enzyme-washed. Cut boxy." No superlatives, no lifestyle prose. Drop announcements state date, time, quantity — scarcity is a fact, not a performance.

## [stack] tech
Next.js (App Router) + Tailwind CSS. GSAP + Anime.js v4. next/font, next/image (photography is the payload — art-direct the crops). Postgres via the /ecommerce-kit patterns when the shop lands. Vercel. No UI kits. Libraries are defaults, not dogma — platform primitives win whenever they hit the same result at 60fps; shipping fewer is the better build.

## [seo] search
Correct schema and meta are non-negotiable; /seo is the reference, scaled to the site: Product JSON-LD with offers, availability, and sizes; per-product meta + OG in the lookbook art direction; image alt text that names the garment, not "image". Motion never blocks LCP.

## [testing] checks
Per /ponytail: one runnable check per non-trivial logic — cart math, stock holds, and size availability first. Verify motion by driving the page at both motion preferences.
