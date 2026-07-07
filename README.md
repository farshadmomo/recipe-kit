# recipe-kit

Skills give your AI *capabilities*. A **recipe** gives it *taste*.

A recipe is one markdown file of house style — which skills to use, which
stack, how to respond — injected automatically into every Claude Code prompt.
Smart routing means UI directives only ride UI prompts, animation directives
only ride animation prompts, and `[always]` ingredients ride everything.

## Quick start

```bash
npx recipe-kit init            # install the hook into .claude/
npx recipe-kit new             # scaffold recipe.md
npx recipe-kit use ./recipe.md # activate it
```

Or use someone else's taste:

```bash
npx recipe-kit use gh:momtaz/modern-ecom
```

## Recipe format

```markdown
---
name: modern-ecom
version: 1.0.0
author: momtaz
description: Modern ecommerce builds, heavy motion, minimal code
extends: []          # optional: layer on top of other recipes
routes:              # optional: override channel keywords
  animation: [animate, scroll, motion, hover, parallax]
---

## [always] responses
Use /caveman for responses. Use /ponytail for less code.

## [ui] design
Use /ui-ux-pro-max and /front-end-design for UI/UX.

## [animation] motion
Use /animejs. GSAP for scroll animations, Lenis as scroll engine.

## [stack] tech
Next.js + Tailwind CSS. No other CSS frameworks.
```

- `## [tag] name` defines an **ingredient**.
- `[always]` ingredients inject on every prompt.
- Built-in channels with default keywords: `ui`, `animation`, `stack`,
  `backend`, `testing`. Any other tag needs a `routes:` entry or it never fires
  (the hook warns on stderr).
- `extends`: later entries override earlier; the recipe itself overrides all.
  Resolved and flattened at install time — share a 5-line overlay instead of a
  full copy. A repo with several recipes is a **cookbook**.

## Commands

| Command | What it does |
|---|---|
| `recipe init` | Install the hook + `.claude/recipes/` (idempotent) |
| `recipe use <gh:user/repo[/path] \| ./file.md>` | Install + activate a recipe |
| `recipe list` | Show installed recipes (`*` = active) |
| `recipe off` | Deactivate (keeps files) |
| `recipe new` | Scaffold a template `recipe.md` |

## How it works

`recipe init` registers a `UserPromptSubmit` hook and copies a self-contained
script trio into `.claude/hooks/recipe/`. On every prompt the hook keyword-
matches your prompt against each channel, then injects only the matching
ingredients wrapped in `<recipe name="...">…</recipe>`. No LLM call, no
network, fails open — a broken recipe never blocks a prompt.

Frontmatter is a YAML subset: `key: value`, `key: [flow, lists]`, and
one-level nested maps of flow lists.
