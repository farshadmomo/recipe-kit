# recipe-kit

Skills give your AI *capabilities*. A **recipe** gives it *taste*.

A recipe is one markdown file of house style — which skills to use, which
stack, how to respond — injected automatically into every Claude Code prompt.
Smart routing means UI directives only ride UI prompts, animation directives
only ride animation prompts, and `[always]` ingredients ride everything.

Today you write:

> Build me a modern ecommerce website

With a recipe active, the AI receives that *plus* your house style — the
opinionated prompt you would have written by hand, every time, automatically.

## Quick start

Not published to npm yet. Clone this repo, then make the `recipe` command
available globally:

```bash
git clone https://github.com/farshadmomo/recipe-kit
cd recipe-kit && npm link
```

Then, in any project:

```bash
recipe init            # install the hook into .claude/
recipe new             # scaffold a creative-web starter recipe.md
# edit recipe.md to your taste
recipe use ./recipe.md # activate it
recipe test "build a hero section"   # see what would inject
```

Or use someone else's taste (the repo must be **public** — see Limitations):

```bash
recipe use gh:farshadmomo/recipe-kit
```

## Recipe format

```markdown
---
name: modern-ecom
version: 1.0.0
author: momtaz
description: Modern ecommerce builds, heavy motion, minimal code
extends: []          # optional: layer on top of other recipes
routes:              # optional: override or add channel keywords
  animation: [animate, scroll, motion, hover, parallax]
  threed: [3d, three, webgl, shader, scene]
---

## [always] responses
MUST use /caveman for responses and /ponytail for code.

## [ui] design
CONSULT /ui-ux-pro-max and /frontend-design for craft, then design from
your own taste.

## [animation] motion
MUST run /gsap-performance before shipping motion. GSAP for scroll,
Lenis as scroll engine — the choreography itself is yours.

## [threed] scene
MUST use /threejs-loaders for any model/texture loading. The scene concept
is yours.

## [stack] tech
Next.js + Tailwind CSS. No other CSS frameworks.
```

- `## [tag] name` defines an **ingredient**.
- `[always]` ingredients inject on every prompt.
- Built-in channels with default keywords: `ui`, `animation`, `stack`,
  `backend`, `testing`. Invent your own (`threed`, `copy`, `seo`) by giving it
  a `routes:` entry — a tag with no route never fires, and the hook warns on
  stderr.
- `name` must be filename-safe (`[A-Za-z0-9._-]`); it becomes the installed
  filename.
- `extends`: later entries override earlier; the recipe itself overrides all.
  Resolved and flattened at install time — share a 5-line overlay instead of a
  full copy. Diamonds resolve; true cycles abort. A repo with several recipes
  is a **cookbook**.

## Commands

| Command | What it does |
|---|---|
| `recipe init` | Install the hook + `.claude/recipes/` (idempotent) |
| `recipe use <gh:user/repo[/path] \| ./file.md>` | Install + activate a recipe |
| `recipe list` | Show installed recipes (`*` = active) |
| `recipe off` | Deactivate (keeps files) |
| `recipe new` | Scaffold a starter `recipe.md` (creative-web defaults) |
| `recipe test <prompt>` | Show which ingredients would inject for a prompt (`+`/`-` per ingredient) |
| `recipe reload` | Re-install the active recipe from its recorded source after edits |

## How it works

`recipe init` registers a `UserPromptSubmit` hook and copies a self-contained
script trio into `.claude/hooks/recipe/`. On every prompt the hook keyword-
matches your prompt against each channel, then injects only the matching
ingredients wrapped in `<recipe name="...">…</recipe>`. No LLM call, no
network, fails open — a broken recipe never blocks a prompt.

Frontmatter is a YAML subset: `key: value`, `key: [flow, lists]`, and
one-level nested maps of flow lists.

## Writing a good recipe

Hard-won from dogfooding:

- **Split skills into two tiers.** MUST-USE skills are about correctness —
  asset loaders, framework setup/cleanup, performance passes, money handling,
  schema — invoking them never constrains design, and skipping them ships
  bugs. CONSULT skills are craft reference — read for technique, then close
  them and design from your own taste; never copy their example layouts or
  palettes. Blanket mandates produce compliance, and compliance kills taste.
  Keep "MUST" only where being wrong is expensive.
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

- **`recipe use` installs a snapshot.** Editing your source `recipe.md` does
  *not* update the active copy — run `recipe reload` after every edit.
- **Verify what's active before judging results.** `recipe list` shows `*`
  beside the active recipe; `recipe test "your prompt"` shows exactly which
  ingredients fire for it.
- **One recipe is active at a time.** Project `.claude/recipes/` beats global
  `~/.claude/recipes/`.

## Limitations

- `gh:` refs fetch from `raw.githubusercontent.com` unauthenticated, so
  **private repos don't work** — publish a cookbook publicly to share it.
- Routing is plain keyword matching, not intent understanding. A prompt that
  never says "scroll" or "animate" won't pull the animation channel, however
  animated the result should be.
- Flow-list values can't contain commas.

## Development

```bash
node --test    # 43 tests, zero dependencies
```

Zero runtime and dev dependencies. Node ≥18, CommonJS. Design notes and the
implementation plan live in `docs/superpowers/`.
