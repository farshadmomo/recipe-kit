# Recipe — Design Spec

**Date:** 2026-07-05
**Status:** Approved

## One-liner

Skills give the AI *capabilities*; a **recipe** gives it *taste*. A recipe is a shareable
markdown file that turns a lazy prompt ("build me an ecommerce site") into the opinionated,
expert-level prompt the user would have written by hand — injected automatically on every
prompt via a Claude Code `UserPromptSubmit` hook.

## Decisions made

| Decision | Choice |
|---|---|
| Platform | Claude Code first (hook-based); other tools later |
| Injection | Smart routing — per-prompt keyword matching selects only relevant ingredients |
| Distribution | CLI + GitHub (`npx recipe use gh:user/repo`); no hosted registry |

## 1. Recipe file format

One markdown file = one recipe. YAML frontmatter + tagged headings ("ingredients").

```markdown
---
name: modern-ecom
version: 1.0.0
author: momtaz
description: Modern ecommerce builds, heavy motion design, minimal code
extends: []            # optional: recipes to layer under this one
routes:                # optional: override/add channel keywords
  animation: [animate, scroll, motion, hover, transition, parallax]
---

## [always] responses
Use /caveman for responses. Use /ponytail for less code.

## [ui] design
Use /ui-ux-pro-max and /front-end-design for UI/UX.

## [animation] motion
Use /animejs and /animation-libraries. GSAP for scroll animations, Lenis as scroll engine.

## [stack] tech
Next.js + Tailwind CSS. No other CSS frameworks.
```

Rules:

- **Ingredient** = one `## [tag] name` heading + its body text.
- **`[always]`** ingredients inject on every prompt.
- **Channel tags** (`ui`, `animation`, `stack`, `backend`, `testing`, or any custom word)
  inject only when the prompt matches that channel's keyword list.
- **Default routes** ship with the hook (sensible keywords per built-in channel);
  frontmatter `routes:` merges over them. A custom tag with no route entry never fires —
  the hook warns about this at load time.
- **`extends`**: list of recipe refs (local path or `gh:` ref, resolved at install time by
  the CLI, stored locally). Ingredients merge parent→child; a child ingredient with the
  same heading name replaces the parent's.

## 2. Hook mechanics

- Hook event: `UserPromptSubmit`. Single script, no external services, no LLM call.
- Flow: read active recipe → case-insensitive keyword match of the prompt against each
  channel's routes → emit matched ingredients (plus `always`) as additional context,
  wrapped in `<recipe name="...">…</recipe>` for attribution/debuggability.
- No channel matches → only `always` ingredients inject.
- Precedence: project `.claude/recipes/` beats global `~/.claude/recipes/`. Active recipe
  recorded in `.claude/recipes/active` (a filename pointer).
- No active recipe or parse error → emit nothing, never block the prompt (fail open).

## 3. CLI (`npx recipe`)

| Command | Behavior |
|---|---|
| `recipe init` | Install hook into `.claude/settings.json` (idempotent), create `.claude/recipes/` |
| `recipe use gh:user/repo[/path]` | Fetch recipe (and its `extends` chain) from GitHub raw, save, activate |
| `recipe use ./file.md` | Copy local file in, activate |
| `recipe list` | Show installed recipes, mark active |
| `recipe off` | Deactivate (keep files) |
| `recipe new` | Scaffold a template recipe |

A repo containing several recipes is a **cookbook**.

## 4. MVP scope

**Ship:** file format + parser, hook script (~100 lines), `recipe init` / `use` / `list` / `off` / `new`.

**Deliberately skipped (add when the simpler thing measurably falls short):**
registry website, version lockfiles, LLM-based intent routing, adapters for Cursor/Codex,
per-ingredient enable/disable UI.

## 5. Error handling

- Malformed frontmatter / missing headings → hook logs one warning line, injects nothing.
- `extends` fetch failure at install → CLI aborts with the failing ref; never partial-installs.
- Circular `extends` → CLI detects and aborts.

## 6. Testing

- Parser: unit tests over a fixtures dir (good recipe, bad frontmatter, extends chain, override).
- Hook routing: table test — (prompt, recipe) → expected ingredient set.
- CLI: one smoke test per command against a temp dir.
