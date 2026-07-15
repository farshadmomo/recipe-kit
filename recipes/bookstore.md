---
name: bookstore-margin
version: 1.0.0
author: farshadmomo
description: Independent bookshop — literary print warmth, covers as objects, staff picks with handwriting in the margins
routes:
  animation: [animate, animation, scroll, motion, transition, hover, stagger, reveal, underline, hero, section, page, component, landing, build, nav, navbar, footer, shelf]
  copy: [copy, text, headline, tagline, tone, wording, brand, voice, slogan, hero, section, page, landing, blurb, review, pick]
  seo: [seo, meta, og, sitemap, schema, search, lighthouse, page, landing, book]
  commerce: [cart, checkout, order, shop, buy, stock, book, isbn, preorder]
skills:
  # per-prompt nudge — when a channel fires, the hook names these for that prompt
  ui: [ui-ux-pro-max, frontend-design, web-design, impeccable]
  animation: [animejs]
  commerce: [ecommerce-kit]
  seo: [seo]
requires:
  caveman: claude plugin marketplace add JuliusBrussee/caveman && claude plugin install caveman@caveman
  ponytail: claude plugin marketplace add DietrichGebert/ponytail && claude plugin install ponytail@ponytail
  ui-ux-pro-max: claude plugin marketplace add nextlevelbuilder/ui-ux-pro-max-skill && claude plugin install ui-ux-pro-max@ui-ux-pro-max-skill
  frontend-design: claude plugin marketplace add anthropics/claude-plugins-official && claude plugin install frontend-design@claude-plugins-official
  impeccable: claude plugin marketplace add pbakaus/impeccable && claude plugin install impeccable@impeccable
  web-design: npx skillfish add aviflombaum/claude-code-in-avinyc/plugins/design-system/skills/web-design --global --yes
  animejs: npx skills add BowTiedSwan/animejs-skills
  ecommerce-kit: claude plugin marketplace add farshadmomo/ecommerce-kit && claude plugin install ecommerce-kit@ecommerce-kit
  seo: claude plugin marketplace add AgriciDaniel/claude-seo && claude plugin install claude-seo@agricidaniel-claude-seo
---

## [always] responses
MUST use /caveman for status updates and routine replies, /ponytail for code — smallest working diff, reuse before writing. When explaining design rationale, clarity outranks compression — drop caveman and answer plainly.
Those two are the only mandatory skills. Every other skill this recipe names is optional reference, not a gate: open one when you expect it to change the result — an API you’d otherwise guess at, a domain where being wrong is expensive — and skip it when your own knowledge already covers the job. A build that invokes zero skills is normal, often the best-value one; the work is judged on what ships, not on which skills were opened. Never invoke a skill as ceremony, and never copy a skill’s example layouts or palettes — design from this recipe’s taste through your own judgment.

## [always] vibe
A bookshop you can smell through the screen. Cream paper background, near-black ink, a serif chosen for LONG-FORM reading comfort (this site actually gets read), humanist sans only for wayfinding. Covers treated as physical objects — spines on a shelf, front-face stacks, a jacket you almost turn over — never flattened into thumbnails. A second voice in the margins: a handwriting-style annotation face for staff picks, used like real marginalia. Banned: Amazon-style grid with star ratings, bestseller badges, cover carousels, "curl up with a good book" copy, sepia-toned stock photos of coffee on books. This concept is the default, not a cage: when the user asks for a different concept or aesthetic, their request wins — keep the craft bar, the creative-risk rule, and the spirit of the bans, rebuild the identity around THEIR concept, and never land on the generic AI-site look (purple gradients, emoji section headers, glass cards, cookie-cutter grids).

## [always] creativity
Creative risk is a requirement. Every build gets one signature moment no template would have — an encounter with a book that only this shop would stage. If a layout is the first thing you'd produce by default, discard it and take the second, stranger idea. The register is quiet, so the risk must be structural: break the layout, not the calm.

## [stack] kickoff
Project-start ritual — ONLY if DESIGN.md does not exist; skip once it does. Produce 3 concept directions that differ on every axis: layout system, type pairing, palette, motion concept, signature interaction. Present each as a compact sheet with the one moment someone would screenshot. No two directions may share an axis value. Ask the user to pick (if unattended, pick the riskier one). Write the winner into DESIGN.md as the design contract — later prompts follow it and never drift back to defaults.

## [ui] design
Craft reference if you want it: /ui-ux-pro-max, /frontend-design, and /web-design; an /impeccable pass on finished sections pays off. Follow DESIGN.md. The front table is the homepage: a hand-arranged spread of what the shop loves NOW, each with a shelf-talker note — not a grid, an arrangement. Book pages set like a well-made title page: cover as object, publication details in a colophon block, the staff note in the margin voice. Sections read like shop rooms (Fiction, Poetry, Strange & Wonderful). After each section, run the generic-kill pass. Reading measure 60–75ch, always.

## [animation] motion
Gentle, paper-weight motion — CONSULT /animejs for technique, then invent the moves. Vocabulary starters: underlines that draw themselves like a pen, a cover that lifts a few degrees on hover as if picked up, shelf-talker notes that slide out from behind covers, page-turn hints on chapter navigation. Nothing bounces, nothing floats on parallax. 250–400ms, soft easings. prefers-reduced-motion: everything is simply, calmly there.

## [commerce] shop
Never hand-roll money or inventory — before writing any cart, checkout, or stock logic, reach for /ecommerce-kit and re-skin its flows to the print vibe (the cart is a "stack", checkout a "counter"). Signed and first editions have quantity 1 — its stock-hold pattern matters exactly there. Out of stock reads "Sold — ask us to find another."

## [copy] voice
A bookseller who read the book: staff picks in first person, two sentences, concrete ("Read the first page standing up; you'll buy it. I did."). Category blurbs with personality, no publisher marketing paste. Microcopy stays in the shop's voice — empty cart: "Nothing in your stack yet."

## [stack] tech
Next.js (App Router) + Tailwind CSS. Anime.js v4. next/font (subset the handwriting face hard — it's decoration, not body), next/image for covers. Inventory as typed local data until the shop lands, then Postgres via /ecommerce-kit patterns. Vercel. No UI kits. Libraries are defaults, not dogma — platform primitives win whenever they hit the same result at 60fps; shipping fewer is the better build.

## [seo] search
Correct schema and meta are non-negotiable; /seo is the reference, scaled to the site: Book JSON-LD with ISBN, author, and offer per title; BookStore schema with hours and geo; per-page meta + OG in the print art direction (OG cards like little book jackets). Alt text in the shop's voice. The catalog must be crawlable text.

## [testing] checks
Per /ponytail: one runnable check per non-trivial logic — cart math and the quantity-1 stock hold first. Verify motion by driving the page at both motion preferences.
