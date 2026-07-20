<p align="center">
  <img src="https://raw.githubusercontent.com/farshadmomo/recipe-kit/HEAD/images/hero.jpg" alt="recipe-kit — a marketplace of taste. Skills give your AI capabilities; a recipe gives it taste. Install with: npm i -g recipe-kit" width="520">
</p>

<p align="center">
  <b><a href="https://recipe-kit-marketplace.vercel.app">Browse the flavor index →</a></b>
</p>

# recipe-kit

Skills give your AI _capabilities_. A **recipe** gives it _taste_.

A recipe is one markdown file of house style — which skills to use, which
stack, how to respond — injected automatically into every Claude Code prompt.
Smart routing means UI directives only ride UI prompts, animation directives
only ride animation prompts, and `[always]` ingredients ride everything.

Today you write:

> Build me a modern ecommerce website

With a recipe active, the AI receives that _plus_ your house style — the
opinionated prompt you would have written by hand, every time, automatically.

## Quick start

```bash
npm install -g recipe-kit
```

Then, in any project:

```bash
recipe init            # install the hook into .claude/
recipe new             # scaffold a creative-web starter recipe.md
# edit recipe.md to your taste
recipe use ./recipe.md # activate it
recipe test "build a hero section"   # see what would inject
```

The recipe is yours to write — `recipe new` gives you a starting structure,
not a style. Or borrow someone else's taste from any public repo with a
`recipe.md` at its root (or a path to one), or from the marketplace by slug:

```bash
recipe use gh:someuser/their-repo                        # their root recipe.md
recipe use gh:farshadmomo/recipe-kit/recipes/coffee.md   # an example from below
recipe search coffee                                      # browse the marketplace
recipe use mkt:coffee-creative                            # install one by slug
```

## Cookbook (examples)

recipe-kit is the tool; these are just proof of range. `recipes/` holds
fifteen complete house styles — each with its own vibe, banned defaults,
motion identity, and `requires:` block. They all `extends: [./creative-core.md]`,
a base recipe that carries the shared engine (response rules, concept-transfer,
the creative-risk mandate, the project-start ritual); each file is just the
flavor on top. Use one as-is, or copy one, gut it, and make it yours:

```bash
recipe use gh:farshadmomo/recipe-kit/recipes/festival.md
```

> These cookbook recipes `extends: [./creative-core.md]`, so fetching one over
> `gh:` resolves that sibling too — it needs **recipe-kit ≥ 0.3.0**. On older
> clients the extend fails to resolve; upgrade with `npm i -g recipe-kit`.

| recipe            | concept                                                            |
| ----------------- | ------------------------------------------------------------------ |
| `coffee.md`       | specialty coffee shop — warm minimalism, editorial type, tactile motion |
| `festival.md`     | music festival — rave-poster maximalism, lineup walls, ticket drops |
| `cinema.md`       | arthouse cinema — filmic dark, credits-roll type, program not grid  |
| `music-player.md` | player web app — hardware warmth, waveform hero, springy controls   |
| `streetwear.md`   | streetwear drops — brutalist lookbook, garment-tag type, honest scarcity |
| `portfolio.md`    | dev/designer portfolio — quiet confidence, case-study narratives    |
| `arcade.md`       | arcade / game studio — CRT phosphor, game-feel juice, easter egg    |
| `museum.md`       | digital museum — archival elegance, plaque type, 3D artifact viewer |
| `devtool.md`      | dev-tool SaaS — terminal-honest, real output, benchmarks over adjectives |
| `bookstore.md`    | indie bookshop — literary print, covers as objects, margin notes    |
| `planetarium.md`  | planetarium — deep-space dark, shader starfield, wonder with units  |
| `dashboard.md`    | data dashboard — dense but legible, tabular numerals, charts that answer a question |
| `api.md`          | HTTP API house style — resource-first, errors that document themselves, boring by design |
| `docs-voice.md`   | docs & prose voice — plain human register, AI-tells banned, respects the reader's time |
| `cli.md`          | command-line tool — Unix-honest, `--help` as the front door, pipeable output |

The odd ones out are `dashboard`, `api`, `docs-voice`, and `cli` — proof the
anti-template engine generalizes past creative websites to dense UI, backend
contracts, prose, and terminals. `creative-core.md` isn't in the table because
it's the base, not a finished style — you extend it, you don't activate it.

### Base + overlay

`creative-core.md` is the worked example of the intended pattern: put the parts
that never change (the `[always]` house rules, the concept-transfer clause, the
creative-risk mandate, the DESIGN.md kickoff ritual) in a base recipe, and let
each real recipe be a thin overlay that adds only its flavor:

```markdown
---
name: my-shop
extends: [./creative-core.md]
routes:
  commerce: [cart, checkout, drop, stock]
---

## [always] vibe
Bans, palette, one signature moment — the identity, nothing else.

## [commerce] shop
Never hand-roll money; re-skin /ecommerce-kit's flows to the vibe.
```

Ingredients **merge by name**: the base's `responses`, `transfer`,
`creativity`, and `kickoff` flow in untouched, while your overlay adds `vibe`,
`shop`, and the rest. Define an ingredient with the **same name** as a base one
to override it wholesale — `api.md` does exactly this to replace the generic
`kickoff` with an API-shaped ritual. `requires:` and `skills:` deep-merge the
same way, so the base's mandatory `caveman`/`ponytail` are always present.

## Recipe format

```markdown
---
name: modern-ecom
version: 1.0.0
author: momtaz
description: Modern ecommerce builds, heavy motion, minimal code
extends: [] # optional: layer on top of other recipes
routes: # optional: override or add channel keywords
  animation: [animate, scroll, motion, hover, parallax]
  threed: [3d, three, webgl, shader, scene]
skills: # optional: per-prompt skill suggestions per channel
  ui: [ui-ux-pro-max, frontend-design]
  animation: [gsap-react, gsap-performance]
requires: # optional: skills this recipe leans on → install commands
  gsap-performance: npx skills add greensock/gsap-skills@gsap-performance
---

## [always] responses

MUST use /caveman for responses and /ponytail for code.

## [ui] design

CONSULT /ui-ux-pro-max and /frontend-design for craft, then design from
your own taste.

## [animation] motion

GSAP for scroll, Lenis as scroll engine — defaults, not dogma. If GSAP
lands, a /gsap-performance pass before shipping; the choreography is yours.

## [threed] scene

/threejs-loaders is the reference for model/texture loading. The scene
concept is yours.

## [stack] tech

Next.js + Tailwind CSS. No other CSS frameworks.
```

- `## [tag] name` defines an **ingredient**.
- `[always]` ingredients inject on every prompt.
- Built-in channels with default keywords: `ui`, `animation`, `stack`,
  `backend`, `testing`, `copy`, `docs`. Invent your own (`threed`, `seo`,
  `commerce`, `data`) by giving it a `routes:` entry — a tag with no route
  never fires, and the hook warns on stderr.
- `name` must be filename-safe (`[A-Za-z0-9._-]`); it becomes the installed
  filename.
- `extends`: later entries override earlier; the recipe itself overrides all.
  Resolved and flattened at install time — share a 5-line overlay instead of a
  full copy. Diamonds resolve; true cycles abort. A repo with several recipes
  is a **cookbook**.
- `skills`: channel → skill names. When a channel fires, the hook appends
  one line naming exactly those skills for that prompt — the thing you'd
  type by hand ("build a hero using /ui-ux-pro-max"), automated. Suggestions,
  never mandates; a prompt that fires no mapped channel gets no line.
- `requires`: skills this recipe's ingredients mention by name, mapped to
  their install command. `recipe use` warns when any are missing; `recipe
  setup` lists and (with `--yes`) installs them.

## Commands

| Command                                         | What it does                                                              |
| ----------------------------------------------- | ------------------------------------------------------------------------- |
| `recipe init`                                   | Install the hook + `.claude/recipes/` (idempotent)                        |
| `recipe use <gh:user/repo[/path] \| mkt:slug \| ./file.md>` | Install + activate a recipe                                    |
| `recipe search <term>`                          | Search the marketplace; prints installable `mkt:` slugs                   |
| `recipe publish`                                | Open the marketplace publish page in a browser                           |
| `recipe list`                                   | Show installed recipes (`*` = active)                                     |
| `recipe off`                                    | Deactivate (keeps files)                                                  |
| `recipe new`                                    | Scaffold a starter `recipe.md` (creative-web defaults)                    |
| `recipe test <prompt>`                          | Show which ingredients would inject for a prompt (`+`/`-` per ingredient) |
| `recipe lint [ref]`                             | Check a recipe for unroutable tags, bad `requires:`, and dead routes (exit 1 on errors) |
| `recipe discover`                               | Replay this project's past prompts against the active recipe; report per-channel fire-rates and suggest missing keywords |
| `recipe export [--out file]`                    | Flatten the active recipe to plain markdown (every ingredient, no routing) for AGENTS.md / Cursor rules |
| `recipe reload`                                 | Re-install the active recipe from its recorded source after edits         |
| `recipe setup [--yes]`                          | List required skills that aren't installed; `--yes` runs their install commands |

## How it works

`recipe init` registers a `UserPromptSubmit` hook and copies a self-contained
set of scripts into `.claude/hooks/recipe/`. On every prompt the hook keyword-
matches your prompt against each channel, then injects only the matching
ingredients wrapped in `<recipe name="...">…</recipe>`. No LLM call, no
network, fails open — a broken recipe never blocks a prompt.

Frontmatter is a YAML subset: `key: value`, `key: [flow, lists]`, and
one-level nested maps of flow lists or scalars.

## Portability

A recipe is compiled for Claude Code's routing, but the taste inside it isn't
Claude-specific. `recipe export` flattens the active recipe to plain markdown —
`# name`, description, then every ingredient as a `## heading` with its body, no
routing, no skill lines, no `<recipe>` wrapper:

```bash
recipe export > AGENTS.md          # or --out for the file directly
recipe export --out .cursor/rules/house-style.md
```

The result reads as a standalone style guide you can paste into `AGENTS.md`,
Cursor rules, or a system prompt — the same house style, minus the machinery.

## Writing a good recipe

Hard-won from dogfooding:

- **Only identity skills are mandatory.** A voice skill and a code-style
  skill (here `/caveman` and `/ponytail`) are cheap, ride every prompt, and
  are safe to MUST. Every capability skill — motion, 3D, SEO, commerce —
  works better as optional reference: name it, say when it pays off, and let
  the model judge whether opening it will change the result. A dogfood build
  invoked zero skills and shipped the best result of the run — forced
  invocation buys cost and compliance, not quality. Keep the outcomes
  mandatory (correct cleanup, valid schema, 60fps), never the skill.
- **Let the user's concept win.** A vibe written as a cage gets thrown out
  wholesale the first time a request contradicts it — a noir cinema recipe
  asked for a pop-art museum loses its bans along with its palette. Give
  every vibe a transfer clause: the concept is a default; when the user asks
  for something else, keep the craft bar and the bans and rebuild the
  identity around their concept.
- **A recipe is a checklist, not an autopilot.** Tell the AI to scale mandated
  skills to the task — "satisfy the intent, skip the ceremony." A dogfood
  build reported that obeying mandates literally (a full SEO audit for a
  two-section page) would have been pure waste, while the intent (correct
  schema) was cheap to satisfy.
- **Name the traps out loud.** Explicit bans ("no card grid for products, no
  glass cards, no purple") outperform positive direction — a dogfood build
  reported the bans were what actually killed the templated defaults it would
  otherwise have shipped.
- **Mandate outcomes, not tools.** A dogfood build shipped its best motion
  with zero motion libraries — CSS keyframes on one `--beat` variable hit
  60fps, and the minimal-code rule correctly overrode the stack mandate.
  Write stacks as defaults that must earn their place over platform
  primitives; reserve MUST for correctness, never for libraries. Identity
  (vibe, voice, bans) transfers; orders (use X, animate Y) just get obeyed
  or awkwardly overridden.
- **Skill nudges beat skill prose.** Models treat ambient "use /x" prose as
  advice and skip it, but obey the same names when the user types them in
  the prompt. The `skills:` map automates exactly that: one line, per
  prompt, naming only the skills whose channel fired. More precise than a
  mandate, more effective than a mention.
- **Ask for creative risk explicitly.** An AI's first instinct is the
  statistically most likely design. An `[always] creativity` ingredient that
  demands one signature moment per build, and says "discard your first-instinct
  layout, take the second stranger idea," measurably shifts output.
- **`[always]` is precious.** It rides every prompt, including bug fixes. Put
  identity there (voice, taste, banned defaults), not build instructions.
- **A ritual can gate itself.** An ingredient can say "only if `DESIGN.md` does
  not exist" — the hook injects it every time, and the AI skips it once the
  file exists. Cheap way to get a project-start step without new machinery.

## Gotchas

- **Local sources auto-refresh.** Editing the `./recipe.md` you `recipe use`d
  re-flattens the active copy on your next prompt — no `recipe reload` needed.
  `recipe reload` is still required for `gh:` sources, after renaming the source
  file, and after editing a _parent_ that a local recipe `extends` (only the
  root source's timestamp is watched).
- **Verify what's active before judging results.** `recipe list` shows `*`
  beside the active recipe; `recipe test "your prompt"` shows exactly which
  ingredients fire for it.
- **Routing is keyword matching, so tune it.** `recipe discover` replays this
  project's past Claude Code prompts (from `~/.claude/projects/`) against the
  active recipe and reports how often each channel fired. Prompts that fired
  nothing but mention an off-route synonym (e.g. "bounce" for `animation`,
  "login" for `backend`) surface as near-misses, with `routes.<ch> += word`
  suggestions when a word recurs. Offline, no LLM — a word-frequency heuristic,
  not intent understanding, so treat the suggestions as leads to eyeball.
- **One recipe is active at a time.** Project `.claude/recipes/` beats global
  `~/.claude/recipes/`.
- **Hook error mentioning `cjs/loader`?** The hook script wasn't found —
  installs made before v0.2 registered a cwd-relative command that broke when
  the session `cd`'d. Re-run `recipe init` to migrate to the
  `${CLAUDE_PROJECT_DIR}` form.

## Limitations

- `gh:` refs fetch from `raw.githubusercontent.com` unauthenticated, so
  **private repos don't work** — publish a cookbook publicly to share it.
- `recipe search` and `mkt:` refs need the marketplace's public API
  (`recipe-kit-marketplace.vercel.app`); point elsewhere with `RECIPE_MKT_BASE`.
  Both fail cleanly with a nonzero exit if the endpoints aren't reachable.
- Routing is plain keyword matching, not intent understanding. A prompt that
  never says "scroll" or "animate" won't pull the animation channel, however
  animated the result should be.
- Flow-list values can't contain commas.
- A recipe references skills but doesn't ship them. Declare them under
  `requires:` so users get warned; without it, skill mandates silently no-op
  for anyone missing the skill.

## Development

```bash
git clone https://github.com/farshadmomo/recipe-kit
cd recipe-kit && npm link   # makes `recipe` point at your working copy
node --test                 # 120 tests, zero dependencies
```

Zero runtime and dev dependencies. Node ≥18, CommonJS. Design notes and the
implementation plan live in `docs/superpowers/`.
