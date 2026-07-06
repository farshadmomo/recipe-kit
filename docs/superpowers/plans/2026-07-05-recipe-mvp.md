# Recipe MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the Recipe MVP — a markdown recipe format, a Claude Code `UserPromptSubmit` hook that injects keyword-routed ingredients into prompts, and a `recipe` CLI (`init/use/list/off/new`).

**Architecture:** One zero-dependency Node package. `src/` holds three files (parser, router, hook) that are copied verbatim into `.claude/hooks/recipe/` by `recipe init`, so the hook runs standalone without `node_modules`. `bin/recipe.js` is the CLI; it resolves `extends` chains at install time and writes a single flattened recipe file, so the hook never deals with inheritance.

**Tech Stack:** Node.js ≥18, CommonJS, `node:test` for tests. No runtime or dev dependencies.

**Spec:** `docs/superpowers/specs/2026-07-05-recipe-design.md`

## Global Constraints

- Zero npm dependencies (runtime and dev). Stdlib only: `fs`, `path`, `os`, `https`, `node:test`.
- Node ≥18, CommonJS modules (`require`/`module.exports`).
- The hook must **fail open**: any error → print nothing to stdout, warn on stderr, exit 0. Never block a prompt.
- Hook files copied to `.claude/hooks/recipe/` must be self-contained as a trio (relative `require('./parser')` only — never require anything outside that directory).
- All file parsing must tolerate CRLF (Windows) line endings: split on `/\r?\n/`.
- Frontmatter is a documented YAML **subset**: `key: scalar`, `key: [a, b]` flow lists, and one-level nested maps of flow lists. No external YAML lib.
- Tests must not hit the network.
- Commit after every task with the message given in the task.

---

## File Structure

```
recipe-kit/
├── package.json
├── README.md                  (Task 7)
├── bin/
│   └── recipe.js              CLI: init/use/list/off/new (Tasks 5-6)
├── src/
│   ├── parser.js              parseRecipe, mergeRecipes, serializeRecipe (Tasks 1-2)
│   ├── router.js              DEFAULT_ROUTES, selectIngredients, renderContext (Task 3)
│   └── recipe-hook.js         UserPromptSubmit hook entry point (Task 4)
└── test/
    ├── parser.test.js
    ├── router.test.js
    ├── hook.test.js
    └── cli.test.js
```

Everything is built inside the repo root `D:\vscode projects\recipe-concept` (the repo root IS the package root — no nested `recipe-kit/` folder; the tree above shows package contents).

---

### Task 1: Package scaffold + recipe parser

**Files:**
- Create: `package.json`
- Create: `src/parser.js`
- Test: `test/parser.test.js`

**Interfaces:**
- Consumes: nothing (first task).
- Produces: `parseRecipe(text: string) → { meta, ingredients }` where `meta = { name: string, version?: string, author?: string, description?: string, extends: string[], routes: Record<string, string[]> }` and `ingredients = [{ tag: string (lowercase), name: string, body: string }]`. Throws `Error` with message prefixed `recipe:` on: missing frontmatter, missing `name`, zero ingredients.

- [ ] **Step 1: Create package.json**

```json
{
  "name": "recipe-kit",
  "version": "0.1.0",
  "description": "Shareable taste for AI coding — recipes injected into Claude Code prompts",
  "license": "MIT",
  "bin": { "recipe": "bin/recipe.js" },
  "files": ["bin", "src", "README.md"],
  "engines": { "node": ">=18" },
  "scripts": { "test": "node --test" }
}
```

(Note for publish time only, not this task: verify the name `recipe-kit` is free on npm; if taken, any `<x>-kit`/scoped name works — the bin stays `recipe`.)

- [ ] **Step 2: Write the failing tests**

Create `test/parser.test.js`:

```js
'use strict';
const test = require('node:test');
const assert = require('node:assert');
const { parseRecipe } = require('../src/parser');

const GOOD = `---
name: modern-ecom
version: 1.0.0
author: momtaz
description: Modern ecommerce builds
extends: []
routes:
  animation: [animate, scroll, parallax]
---

## [always] responses
Use /caveman for responses.

## [ui] design
Use /ui-ux-pro-max.

## [animation] motion
GSAP for scroll, Lenis as scroll engine.
`;

test('parses meta and ingredients from a valid recipe', () => {
  const r = parseRecipe(GOOD);
  assert.equal(r.meta.name, 'modern-ecom');
  assert.equal(r.meta.version, '1.0.0');
  assert.deepEqual(r.meta.extends, []);
  assert.deepEqual(r.meta.routes, { animation: ['animate', 'scroll', 'parallax'] });
  assert.equal(r.ingredients.length, 3);
  assert.deepEqual(r.ingredients[0], {
    tag: 'always', name: 'responses', body: 'Use /caveman for responses.',
  });
  assert.equal(r.ingredients[2].tag, 'animation');
  assert.equal(r.ingredients[2].body, 'GSAP for scroll, Lenis as scroll engine.');
});

test('parses flow-list extends', () => {
  const r = parseRecipe(GOOD.replace('extends: []', 'extends: [gh:a/base, ./local.md]'));
  assert.deepEqual(r.meta.extends, ['gh:a/base', './local.md']);
});

test('tolerates CRLF line endings', () => {
  const r = parseRecipe(GOOD.replace(/\n/g, '\r\n'));
  assert.equal(r.meta.name, 'modern-ecom');
  assert.equal(r.ingredients.length, 3);
});

test('defaults extends/routes when absent', () => {
  const r = parseRecipe('---\nname: x\n---\n## [always] a\nbody\n');
  assert.deepEqual(r.meta.extends, []);
  assert.deepEqual(r.meta.routes, {});
});

test('lowercases tags', () => {
  const r = parseRecipe('---\nname: x\n---\n## [UI] a\nbody\n');
  assert.equal(r.ingredients[0].tag, 'ui');
});

test('throws on missing frontmatter', () => {
  assert.throws(() => parseRecipe('## [always] a\nbody\n'), /missing frontmatter/);
});

test('throws on missing name', () => {
  assert.throws(() => parseRecipe('---\nauthor: x\n---\n## [always] a\nbody\n'), /needs a name/);
});

test('throws when no ingredients', () => {
  assert.throws(() => parseRecipe('---\nname: x\n---\njust prose\n'), /no ingredients/);
});
```

- [ ] **Step 3: Run tests to verify they fail**

Run: `node --test test/parser.test.js`
Expected: FAIL — `Cannot find module '../src/parser'`

- [ ] **Step 4: Implement src/parser.js**

```js
'use strict';

// ponytail: YAML subset — scalars, [flow, lists], one-level maps of flow lists.
// Swap in a real YAML lib only if recipes outgrow this.
function parseFrontmatter(text) {
  const meta = { extends: [], routes: {} };
  let currentMap = null;
  for (const raw of text.split(/\r?\n/)) {
    if (!raw.trim()) continue;
    const nested = raw.match(/^\s+([\w-]+):\s*\[(.*)\]\s*$/);
    if (nested && currentMap) {
      meta[currentMap][nested[1]] = splitFlowList(nested[2]);
      continue;
    }
    const top = raw.match(/^([\w-]+):\s*(.*)$/);
    if (!top) continue;
    const [, key, value] = top;
    if (value === '') {
      currentMap = key;
      meta[key] = {};
      continue;
    }
    currentMap = null;
    const flow = value.match(/^\[(.*)\]$/);
    meta[key] = flow ? splitFlowList(flow[1]) : value.trim();
  }
  return meta;
}

function splitFlowList(inner) {
  return inner.split(',').map((s) => s.trim()).filter(Boolean);
}

function parseRecipe(text) {
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!m) throw new Error('recipe: missing frontmatter');
  const meta = parseFrontmatter(m[1]);
  if (!meta.name) throw new Error('recipe: frontmatter needs a name');
  const body = m[2];
  const headingRe = /^## +\[(\w+)\] +(.+)$/gm;
  const ingredients = [];
  let match, prev = null;
  while ((match = headingRe.exec(body))) {
    if (prev) prev.body = body.slice(prev.end, match.index).trim();
    prev = { tag: match[1].toLowerCase(), name: match[2].trim(), end: headingRe.lastIndex };
    ingredients.push(prev);
  }
  if (prev) prev.body = body.slice(prev.end).trim();
  if (!ingredients.length) throw new Error('recipe: no ingredients (## [tag] name headings)');
  for (const i of ingredients) delete i.end;
  return { meta, ingredients };
}

module.exports = { parseRecipe };
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `node --test test/parser.test.js`
Expected: PASS (8 tests)

- [ ] **Step 6: Commit**

```bash
git add package.json src/parser.js test/parser.test.js
git commit -m "feat: recipe parser — frontmatter subset + tagged ingredients"
```

---

### Task 2: Merge (extends flattening) + serializer

**Files:**
- Modify: `src/parser.js` (add two functions + exports)
- Test: `test/parser.test.js` (append tests)

**Interfaces:**
- Consumes: `parseRecipe` recipe objects from Task 1.
- Produces: `mergeRecipes(parent, child) → recipe` — child ingredient with same `name` replaces parent's (parent's position kept); child meta wins field-by-field; `routes` merged parent←child; result `extends` is always `[]`. `serializeRecipe(recipe) → string` — markdown that round-trips through `parseRecipe`.

- [ ] **Step 1: Append failing tests to test/parser.test.js**

```js
const { mergeRecipes, serializeRecipe } = require('../src/parser');

test('mergeRecipes: child overrides same-named ingredient, keeps parent order', () => {
  const parent = parseRecipe('---\nname: base\nauthor: alice\n---\n## [always] responses\nparent resp\n\n## [ui] design\nparent design\n');
  const child = parseRecipe('---\nname: kid\nextends: [./base.md]\nroutes:\n  ui: [widget]\n---\n## [ui] design\nchild design\n\n## [stack] tech\nnext.js\n');
  const m = mergeRecipes(parent, child);
  assert.equal(m.meta.name, 'kid');
  assert.equal(m.meta.author, 'alice');            // inherited: child has none
  assert.deepEqual(m.meta.extends, []);             // flattened
  assert.deepEqual(m.meta.routes, { ui: ['widget'] });
  assert.deepEqual(m.ingredients.map((i) => [i.name, i.body]), [
    ['responses', 'parent resp'],
    ['design', 'child design'],
    ['tech', 'next.js'],
  ]);
});

test('serializeRecipe round-trips through parseRecipe', () => {
  const r = parseRecipe(GOOD);
  const again = parseRecipe(serializeRecipe(r));
  assert.deepEqual(again, r);
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `node --test test/parser.test.js`
Expected: FAIL — `mergeRecipes is not a function`

- [ ] **Step 3: Implement in src/parser.js**

Add above `module.exports` and update the export line:

```js
function mergeRecipes(parent, child) {
  const meta = {
    ...parent.meta,
    ...child.meta,
    extends: [],
    routes: { ...parent.meta.routes, ...child.meta.routes },
  };
  const byName = new Map(parent.ingredients.map((i) => [i.name, i]));
  for (const i of child.ingredients) byName.set(i.name, i);
  return { meta, ingredients: [...byName.values()] };
}

function serializeRecipe({ meta, ingredients }) {
  const lines = ['---', `name: ${meta.name}`];
  for (const key of ['version', 'author', 'description']) {
    if (meta[key]) lines.push(`${key}: ${meta[key]}`);
  }
  const routes = Object.entries(meta.routes || {});
  if (routes.length) {
    lines.push('routes:');
    for (const [ch, kws] of routes) lines.push(`  ${ch}: [${kws.join(', ')}]`);
  }
  lines.push('---', '');
  for (const i of ingredients) lines.push(`## [${i.tag}] ${i.name}`, '', i.body, '');
  return lines.join('\n');
}

module.exports = { parseRecipe, mergeRecipes, serializeRecipe };
```

Note on `...child.meta` then `extends: []`: a child field that is absent stays inherited from parent (spread only copies present keys); `extends` is forcibly cleared because merged output is flat.

- [ ] **Step 4: Run tests to verify they pass**

Run: `node --test test/parser.test.js`
Expected: PASS (10 tests)

- [ ] **Step 5: Commit**

```bash
git add src/parser.js test/parser.test.js
git commit -m "feat: mergeRecipes (extends flattening) + serializeRecipe"
```

---

### Task 3: Router — keyword routing + context rendering

**Files:**
- Create: `src/router.js`
- Test: `test/router.test.js`

**Interfaces:**
- Consumes: recipe objects from `parseRecipe` (Task 1).
- Produces: `DEFAULT_ROUTES: Record<string, string[]>`; `selectIngredients(recipe, prompt: string) → ingredient[]` (always-tagged + ingredients whose channel keywords match the prompt on word boundaries, case-insensitive; recipe `meta.routes` channels override same-named defaults); `renderContext(recipe, ingredients) → string` — `<recipe name="...">…</recipe>` block, or `''` when `ingredients` is empty.

- [ ] **Step 1: Write the failing tests**

Create `test/router.test.js`:

```js
'use strict';
const test = require('node:test');
const assert = require('node:assert');
const { parseRecipe } = require('../src/parser');
const { DEFAULT_ROUTES, selectIngredients, renderContext } = require('../src/router');

const RECIPE = parseRecipe(`---
name: modern-ecom
routes:
  animation: [animate, scroll, parallax]
---

## [always] responses
Use /caveman.

## [ui] design
Use /ui-ux-pro-max.

## [animation] motion
GSAP + Lenis.

## [backend] server
Fluid compute defaults.
`);

const names = (prompt) => selectIngredients(RECIPE, prompt).map((i) => i.name);

test('always ingredients ride every prompt', () => {
  assert.deepEqual(names('what time is it'), ['responses']);
});

test('ui prompt pulls ui channel', () => {
  assert.deepEqual(names('build a hero section for the landing page'),
    ['responses', 'design']);
});

test('animation uses recipe route override, not defaults', () => {
  assert.deepEqual(names('add a parallax effect'), ['responses', 'motion']);
  // 'hover' is in DEFAULT_ROUTES.animation but the recipe overrode the list
  assert.deepEqual(names('add a hover effect'), ['responses']);
});

test('backend prompt uses default routes', () => {
  assert.deepEqual(names('fix the login api bug'), ['responses', 'server']);
});

test('matching is word-boundary and case-insensitive', () => {
  assert.deepEqual(names('DESIGN me something'), ['responses', 'design']);
  assert.deepEqual(names('redesigning nothing'), ['responses']); // no bare-word match
});

test('default routes cover the built-in channels', () => {
  for (const ch of ['ui', 'animation', 'stack', 'backend', 'testing']) {
    assert.ok(Array.isArray(DEFAULT_ROUTES[ch]) && DEFAULT_ROUTES[ch].length > 0, ch);
  }
});

test('renderContext wraps ingredients in a recipe tag', () => {
  const out = renderContext(RECIPE, selectIngredients(RECIPE, 'build a page'));
  assert.match(out, /^<recipe name="modern-ecom">\n/);
  assert.match(out, /\[responses\]\nUse \/caveman\./);
  assert.match(out, /\[design\]\nUse \/ui-ux-pro-max\./);
  assert.match(out, /<\/recipe>$/);
});

test('renderContext returns empty string for no ingredients', () => {
  assert.equal(renderContext(RECIPE, []), '');
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `node --test test/router.test.js`
Expected: FAIL — `Cannot find module '../src/router'`

- [ ] **Step 3: Implement src/router.js**

```js
'use strict';

const DEFAULT_ROUTES = {
  ui: ['ui', 'ux', 'design', 'component', 'page', 'navbar', 'hero', 'layout',
    'screen', 'button', 'form', 'modal', 'card', 'css', 'style', 'landing',
    'responsive', 'frontend', 'front-end'],
  animation: ['animate', 'animation', 'scroll', 'motion', 'transition', 'hover',
    'parallax', 'stagger'],
  stack: ['build', 'create', 'make', 'setup', 'set up', 'scaffold', 'app',
    'website', 'site', 'project', 'stack'],
  backend: ['api', 'server', 'database', 'db', 'endpoint', 'auth', 'backend',
    'schema', 'migration'],
  testing: ['test', 'tests', 'spec', 'coverage', 'e2e'],
};

function escapeRe(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function selectIngredients(recipe, prompt) {
  const routes = { ...DEFAULT_ROUTES, ...recipe.meta.routes };
  const p = String(prompt).toLowerCase();
  const hit = (ch) =>
    (routes[ch] || []).some((kw) => new RegExp(`\\b${escapeRe(kw)}\\b`).test(p));
  return recipe.ingredients.filter((i) => i.tag === 'always' || hit(i.tag));
}

function renderContext(recipe, ingredients) {
  if (!ingredients.length) return '';
  const body = ingredients.map((i) => `[${i.name}]\n${i.body}`).join('\n\n');
  return `<recipe name="${recipe.meta.name}">\n${body}\n</recipe>`;
}

module.exports = { DEFAULT_ROUTES, selectIngredients, renderContext };
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `node --test test/router.test.js`
Expected: PASS (8 tests)

- [ ] **Step 5: Commit**

```bash
git add src/router.js test/router.test.js
git commit -m "feat: keyword router + context renderer"
```

---

### Task 4: UserPromptSubmit hook script

**Files:**
- Create: `src/recipe-hook.js`
- Test: `test/hook.test.js`

**Interfaces:**
- Consumes: `parseRecipe` (Task 1) via `require('./parser')`; `selectIngredients`, `renderContext`, `DEFAULT_ROUTES` (Task 3) via `require('./router')`. Relative requires ONLY — this trio gets copied to `.claude/hooks/recipe/` by `recipe init`.
- Produces: an executable script. Stdin: Claude Code hook JSON `{ "prompt": "...", "cwd": "..." }`. Stdout: rendered `<recipe>` context or nothing. Always exits 0. Active recipe resolution: `<cwd>/.claude/recipes/active` first, then `~/.claude/recipes/active`; the `active` file contains the recipe's filename.

- [ ] **Step 1: Write the failing tests**

Create `test/hook.test.js`:

```js
'use strict';
const test = require('node:test');
const assert = require('node:assert');
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const HOOK = path.join(__dirname, '..', 'src', 'recipe-hook.js');

function tmpProject(recipeText, activeName) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'recipe-hook-'));
  const rdir = path.join(dir, '.claude', 'recipes');
  fs.mkdirSync(rdir, { recursive: true });
  if (recipeText !== null) fs.writeFileSync(path.join(rdir, 'test.md'), recipeText);
  if (activeName !== null) fs.writeFileSync(path.join(rdir, 'active'), activeName + '\n');
  return dir;
}

function runHook(cwd, prompt) {
  return execFileSync(process.execPath, [HOOK], {
    input: JSON.stringify({ prompt, cwd }),
    encoding: 'utf8',
  });
}

const RECIPE = `---
name: modern-ecom
---

## [always] responses
Use /caveman.

## [ui] design
Use /ui-ux-pro-max.
`;

test('injects routed ingredients for a matching prompt', () => {
  const dir = tmpProject(RECIPE, 'test.md');
  const out = runHook(dir, 'build a landing page');
  assert.match(out, /<recipe name="modern-ecom">/);
  assert.match(out, /Use \/caveman\./);
  assert.match(out, /Use \/ui-ux-pro-max\./);
});

test('non-matching prompt gets only always ingredients', () => {
  const dir = tmpProject(RECIPE, 'test.md');
  const out = runHook(dir, 'explain monads');
  assert.match(out, /Use \/caveman\./);
  assert.doesNotMatch(out, /ui-ux-pro-max/);
});

test('no active pointer → silent, exit 0', () => {
  const dir = tmpProject(RECIPE, null);
  assert.equal(runHook(dir, 'build a page'), '');
});

test('malformed recipe → silent stdout, exit 0 (fail open)', () => {
  const dir = tmpProject('not a recipe at all', 'test.md');
  assert.equal(runHook(dir, 'build a page'), '');
});

test('garbage stdin → silent, exit 0', () => {
  const out = execFileSync(process.execPath, [HOOK], { input: '%%%', encoding: 'utf8' });
  assert.equal(out, '');
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `node --test test/hook.test.js`
Expected: FAIL — execFileSync errors with `Cannot find module ... recipe-hook.js` (module not found → child exits nonzero)

- [ ] **Step 3: Implement src/recipe-hook.js**

```js
#!/usr/bin/env node
'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');
const { parseRecipe } = require('./parser');
const { DEFAULT_ROUTES, selectIngredients, renderContext } = require('./router');

function activeRecipeFile(cwd) {
  const dirs = [
    path.join(cwd, '.claude', 'recipes'),
    path.join(os.homedir(), '.claude', 'recipes'),
  ];
  for (const dir of dirs) {
    const ptr = path.join(dir, 'active');
    if (!fs.existsSync(ptr)) continue;
    const name = fs.readFileSync(ptr, 'utf8').trim();
    if (name) return path.join(dir, name);
  }
  return null;
}

function main() {
  let payload;
  try {
    payload = JSON.parse(fs.readFileSync(0, 'utf8'));
  } catch {
    return; // fail open: bad/missing stdin
  }
  const cwd = payload.cwd || process.cwd();
  const file = activeRecipeFile(cwd);
  if (!file || !fs.existsSync(file)) return;

  let recipe;
  try {
    recipe = parseRecipe(fs.readFileSync(file, 'utf8'));
  } catch (e) {
    process.stderr.write(`${e.message}\n`);
    return; // fail open: broken recipe never blocks a prompt
  }

  const routes = { ...DEFAULT_ROUTES, ...recipe.meta.routes };
  for (const i of recipe.ingredients) {
    if (i.tag !== 'always' && !routes[i.tag]) {
      process.stderr.write(
        `recipe: no route for tag [${i.tag}] — ingredient "${i.name}" will never inject\n`
      );
    }
  }

  const out = renderContext(recipe, selectIngredients(recipe, payload.prompt || ''));
  if (out) process.stdout.write(out);
}

main();
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `node --test test/hook.test.js`
Expected: PASS (5 tests)

- [ ] **Step 5: Run the full suite**

Run: `node --test`
Expected: PASS (23 tests, 0 failures)

- [ ] **Step 6: Commit**

```bash
git add src/recipe-hook.js test/hook.test.js
git commit -m "feat: UserPromptSubmit hook — routed injection, fail-open"
```

---

### Task 5: CLI `init`

**Files:**
- Create: `bin/recipe.js`
- Test: `test/cli.test.js`

**Interfaces:**
- Consumes: the three `src/` files (copied by value at init time).
- Produces: `recipe init` run in a project dir creates `.claude/recipes/`, copies `parser.js`, `router.js`, `recipe-hook.js` into `.claude/hooks/recipe/`, and idempotently registers the hook command `node .claude/hooks/recipe/recipe-hook.js` under `hooks.UserPromptSubmit` in `.claude/settings.json` (preserving existing settings). Also produces the CLI skeleton (`main` dispatcher) that Task 6 extends.

- [ ] **Step 1: Write the failing tests**

Create `test/cli.test.js`:

```js
'use strict';
const test = require('node:test');
const assert = require('node:assert');
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const CLI = path.join(__dirname, '..', 'bin', 'recipe.js');
const HOOK_CMD = 'node .claude/hooks/recipe/recipe-hook.js';

function tmpDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'recipe-cli-'));
}

function run(cwd, ...args) {
  return execFileSync(process.execPath, [CLI, ...args], { cwd, encoding: 'utf8' });
}

test('init creates dirs, copies hook trio, registers hook', () => {
  const dir = tmpDir();
  run(dir, 'init');
  assert.ok(fs.existsSync(path.join(dir, '.claude', 'recipes')));
  for (const f of ['parser.js', 'router.js', 'recipe-hook.js']) {
    assert.ok(fs.existsSync(path.join(dir, '.claude', 'hooks', 'recipe', f)), f);
  }
  const settings = JSON.parse(
    fs.readFileSync(path.join(dir, '.claude', 'settings.json'), 'utf8')
  );
  const cmds = settings.hooks.UserPromptSubmit.flatMap((e) =>
    e.hooks.map((h) => h.command)
  );
  assert.deepEqual(cmds, [HOOK_CMD]);
});

test('init is idempotent and preserves existing settings', () => {
  const dir = tmpDir();
  fs.mkdirSync(path.join(dir, '.claude'), { recursive: true });
  fs.writeFileSync(
    path.join(dir, '.claude', 'settings.json'),
    JSON.stringify({ permissions: { allow: ['Bash(ls:*)'] } })
  );
  run(dir, 'init');
  run(dir, 'init');
  const settings = JSON.parse(
    fs.readFileSync(path.join(dir, '.claude', 'settings.json'), 'utf8')
  );
  assert.deepEqual(settings.permissions, { allow: ['Bash(ls:*)'] });
  const cmds = settings.hooks.UserPromptSubmit.flatMap((e) =>
    e.hooks.map((h) => h.command)
  );
  assert.deepEqual(cmds, [HOOK_CMD]);
});

// execFileSync throws on nonzero exit; CLI output lands on e.stdout/e.stderr,
// not reliably in e.message — assert on those.
function assertFails(fn, stderrRe) {
  try {
    fn();
    assert.fail('expected the command to exit nonzero');
  } catch (e) {
    assert.equal(e.status, 1);
    if (stderrRe) assert.match(String(e.stderr), stderrRe);
  }
}

test('unknown command prints usage and exits 1', () => {
  assertFails(() => run(tmpDir(), 'bogus'));
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `node --test test/cli.test.js`
Expected: FAIL — `Cannot find module ... bin/recipe.js`

- [ ] **Step 3: Implement bin/recipe.js (init + dispatcher only)**

```js
#!/usr/bin/env node
'use strict';
const fs = require('fs');
const path = require('path');

const RECIPES_DIR = path.join('.claude', 'recipes');
const HOOK_DIR = path.join('.claude', 'hooks', 'recipe');
const HOOK_CMD = 'node .claude/hooks/recipe/recipe-hook.js';
const SRC = path.join(__dirname, '..', 'src');

async function main() {
  const [cmd, arg] = process.argv.slice(2);
  const commands = { init };
  if (!commands[cmd]) {
    console.log('usage: recipe <init | use <ref> | list | off | new>');
    process.exit(cmd ? 1 : 0);
  }
  await commands[cmd](arg);
}

function init() {
  fs.mkdirSync(RECIPES_DIR, { recursive: true });
  fs.mkdirSync(HOOK_DIR, { recursive: true });
  for (const f of ['parser.js', 'router.js', 'recipe-hook.js']) {
    fs.copyFileSync(path.join(SRC, f), path.join(HOOK_DIR, f));
  }
  const settingsPath = path.join('.claude', 'settings.json');
  const settings = fs.existsSync(settingsPath)
    ? JSON.parse(fs.readFileSync(settingsPath, 'utf8'))
    : {};
  settings.hooks = settings.hooks || {};
  const entries = (settings.hooks.UserPromptSubmit = settings.hooks.UserPromptSubmit || []);
  const installed = entries.some((e) =>
    (e.hooks || []).some((h) => h.command === HOOK_CMD)
  );
  if (!installed) entries.push({ hooks: [{ type: 'command', command: HOOK_CMD }] });
  fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2) + '\n');
  console.log('recipe: hook installed. Next: recipe use <gh:user/repo | ./file.md>');
}

main().catch((e) => {
  console.error(`recipe: ${e.message}`);
  process.exit(1);
});
```

(Hook command uses a relative path because Claude Code runs hooks with cwd = project dir; forward slashes work in Node on Windows.)

- [ ] **Step 4: Run tests to verify they pass**

Run: `node --test test/cli.test.js`
Expected: PASS (3 tests)

- [ ] **Step 5: Commit**

```bash
git add bin/recipe.js test/cli.test.js
git commit -m "feat: recipe init — hook install into .claude"
```

---

### Task 6: CLI `use` / `list` / `off` / `new` + gh fetch + extends resolution

**Files:**
- Modify: `bin/recipe.js` (add commands to the `commands` map and implement below `init`)
- Test: `test/cli.test.js` (append tests)

**Interfaces:**
- Consumes: `parseRecipe`, `mergeRecipes`, `serializeRecipe` from `../src/parser` (Tasks 1–2); the dispatcher from Task 5.
- Produces: `recipe use <ref>` — ref is a local path or `gh:user/repo[/path/to/file.md]` (default path `recipe.md`, fetched from `https://raw.githubusercontent.com/<user>/<repo>/HEAD/<path>`); resolves the `extends` chain recursively (relative local refs resolve against the referring file's directory; later `extends` entries override earlier; the recipe itself overrides all), detects cycles, aborts on any fetch/parse failure with no partial writes, then writes the flattened recipe to `.claude/recipes/<name>.md` and its filename to `.claude/recipes/active`. `recipe list` — prints installed recipes, `*` marks active. `recipe off` — deletes the `active` pointer, keeps files. `recipe new` — writes a template `recipe.md` in cwd, refuses to overwrite.

- [ ] **Step 1: Append failing tests to test/cli.test.js**

```js
const BASE = `---
name: base-modern
author: alice
---

## [always] responses
Use /caveman.

## [ui] design
parent design
`;

const CHILD = `---
name: my-ecom
extends: [./base.md]
---

## [ui] design
child design

## [stack] tech
next.js + tailwind
`;

test('use ./file.md flattens extends, installs, activates', () => {
  const dir = tmpDir();
  run(dir, 'init');
  fs.writeFileSync(path.join(dir, 'base.md'), BASE);
  fs.writeFileSync(path.join(dir, 'child.md'), CHILD);
  run(dir, 'use', './child.md');
  const rdir = path.join(dir, '.claude', 'recipes');
  assert.equal(fs.readFileSync(path.join(rdir, 'active'), 'utf8').trim(), 'my-ecom.md');
  const flat = fs.readFileSync(path.join(rdir, 'my-ecom.md'), 'utf8');
  assert.match(flat, /name: my-ecom/);
  assert.match(flat, /author: alice/);        // inherited meta
  assert.match(flat, /child design/);          // override won
  assert.doesNotMatch(flat, /parent design/);
  assert.doesNotMatch(flat, /extends:/);       // flattened
});

test('use aborts on circular extends with no partial install', () => {
  const dir = tmpDir();
  run(dir, 'init');
  fs.writeFileSync(path.join(dir, 'a.md'), '---\nname: a\nextends: [./b.md]\n---\n## [always] x\nbody\n');
  fs.writeFileSync(path.join(dir, 'b.md'), '---\nname: b\nextends: [./a.md]\n---\n## [always] y\nbody\n');
  assert.throws(() => run(dir, 'use', './a.md'), /circular/i);
  assert.ok(!fs.existsSync(path.join(dir, '.claude', 'recipes', 'active')));
});

test('use rejects a malformed gh ref before any network call', () => {
  assert.throws(() => run(tmpDir(), 'use', 'gh:justauser'), /bad ref/i);
});

test('list marks the active recipe; off deactivates but keeps files', () => {
  const dir = tmpDir();
  run(dir, 'init');
  fs.writeFileSync(path.join(dir, 'r.md'), BASE);
  run(dir, 'use', './r.md');
  assert.match(run(dir, 'list'), /\* base-modern\.md/);
  run(dir, 'off');
  assert.match(run(dir, 'list'), /^ {2}base-modern\.md/m);
  assert.ok(fs.existsSync(path.join(dir, '.claude', 'recipes', 'base-modern.md')));
});

test('new scaffolds recipe.md that parses, and refuses to overwrite', () => {
  const dir = tmpDir();
  run(dir, 'new');
  const { parseRecipe } = require('../src/parser');
  const r = parseRecipe(fs.readFileSync(path.join(dir, 'recipe.md'), 'utf8'));
  assert.ok(r.meta.name);
  assert.ok(r.ingredients.some((i) => i.tag === 'always'));
  assert.throws(() => run(dir, 'new'), /already exists/);
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `node --test test/cli.test.js`
Expected: FAIL — the new tests hit the usage message / exit 1 (commands not in dispatcher yet)

- [ ] **Step 3: Implement the commands in bin/recipe.js**

Change the dispatcher line to:

```js
  const commands = { init, use, list, off, new: scaffold };
```

Add below `init`:

```js
async function use(ref) {
  if (!ref) throw new Error('usage: recipe use <gh:user/repo[/path] | ./file.md>');
  const recipe = await resolveRecipe(ref, process.cwd(), new Set());
  const { serializeRecipe } = require('../src/parser');
  fs.mkdirSync(RECIPES_DIR, { recursive: true });
  const file = `${recipe.meta.name}.md`;
  fs.writeFileSync(path.join(RECIPES_DIR, file), serializeRecipe(recipe));
  fs.writeFileSync(path.join(RECIPES_DIR, 'active'), file + '\n');
  console.log(`recipe: ${recipe.meta.name} active`);
}

// Later extends entries override earlier ones; the recipe itself overrides all.
async function resolveRecipe(ref, baseDir, seen) {
  const { parseRecipe, mergeRecipes } = require('../src/parser');
  const key = ref.startsWith('gh:') ? ref : path.resolve(baseDir, ref);
  if (seen.has(key)) throw new Error(`circular extends via ${ref}`);
  seen.add(key);
  let text, nextBase;
  if (ref.startsWith('gh:')) {
    text = await fetchGh(ref);
    nextBase = baseDir; // gh recipes may only extend gh: refs or absolute paths
  } else {
    const abs = path.resolve(baseDir, ref);
    text = fs.readFileSync(abs, 'utf8');
    nextBase = path.dirname(abs);
  }
  const recipe = parseRecipe(text);
  let acc = null;
  for (const parentRef of recipe.meta.extends) {
    const parent = await resolveRecipe(parentRef, nextBase, seen);
    acc = acc ? mergeRecipes(acc, parent) : parent;
  }
  return acc ? mergeRecipes(acc, recipe) : recipe;
}

function fetchGh(ref) {
  const parts = ref.slice(3).split('/');
  if (parts.length < 2) return Promise.reject(new Error(`bad ref: ${ref}`));
  const [user, repo, ...rest] = parts;
  const file = rest.length ? rest.join('/') : 'recipe.md';
  const url = `https://raw.githubusercontent.com/${user}/${repo}/HEAD/${file}`;
  return new Promise((resolve, reject) => {
    require('https')
      .get(url, (res) => {
        if (res.statusCode !== 200) {
          res.resume();
          return reject(new Error(`${ref} → HTTP ${res.statusCode} (${url})`));
        }
        let data = '';
        res.on('data', (c) => (data += c));
        res.on('end', () => resolve(data));
      })
      .on('error', reject);
  });
}

function list() {
  if (!fs.existsSync(RECIPES_DIR)) {
    console.log('recipe: none installed (run: recipe init)');
    return;
  }
  const ptr = path.join(RECIPES_DIR, 'active');
  const active = fs.existsSync(ptr) ? fs.readFileSync(ptr, 'utf8').trim() : null;
  const files = fs.readdirSync(RECIPES_DIR).filter((f) => f.endsWith('.md'));
  if (!files.length) {
    console.log('recipe: none installed');
    return;
  }
  for (const f of files) console.log(`${f === active ? '* ' : '  '}${f}`);
}

function off() {
  const ptr = path.join(RECIPES_DIR, 'active');
  if (fs.existsSync(ptr)) fs.unlinkSync(ptr);
  console.log('recipe: off');
}

function scaffold() {
  if (fs.existsSync('recipe.md')) throw new Error('recipe.md already exists');
  fs.writeFileSync('recipe.md', TEMPLATE);
  console.log('recipe: recipe.md created — edit it, then: recipe use ./recipe.md');
}

const TEMPLATE = `---
name: my-recipe
version: 0.1.0
author: you
description: What this recipe is for
---

## [always] responses
House rules that ride every prompt.

## [ui] design
Directives injected when the prompt is about UI.

## [animation] motion
Directives injected when the prompt is about animation.

## [stack] tech
Your stack choices, injected when building things.
`;
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `node --test test/cli.test.js`
Expected: PASS (8 tests)

- [ ] **Step 5: Run the full suite**

Run: `node --test`
Expected: PASS (31 tests, 0 failures)

- [ ] **Step 6: Commit**

```bash
git add bin/recipe.js test/cli.test.js
git commit -m "feat: recipe use/list/off/new — gh fetch + extends flattening"
```

---

### Task 7: README + end-to-end smoke check

**Files:**
- Create: `README.md`

**Interfaces:**
- Consumes: everything above.
- Produces: user-facing docs; a manually verified end-to-end run.

- [ ] **Step 1: Write README.md**

```markdown
# recipe-kit

Skills give your AI *capabilities*. A **recipe** gives it *taste*.

A recipe is one markdown file of house style — which skills to use, which
stack, how to respond — injected automatically into every Claude Code prompt.
Smart routing means UI directives only ride UI prompts, animation directives
only ride animation prompts, and `[always]` ingredients ride everything.

## Quick start

​```bash
npx recipe-kit init            # install the hook into .claude/
npx recipe-kit new             # scaffold recipe.md
npx recipe-kit use ./recipe.md # activate it
​```

Or use someone else's taste:

​```bash
npx recipe-kit use gh:momtaz/modern-ecom
​```

## Recipe format

​```markdown
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
​```

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
​```

(Strip the zero-width escapes around the inner code fences when writing the real file — use plain triple backticks.)

- [ ] **Step 2: End-to-end smoke check in a scratch dir**

```bash
cd "$(mktemp -d)"
node "D:/vscode projects/recipe-concept/bin/recipe.js" init
node "D:/vscode projects/recipe-concept/bin/recipe.js" new
node "D:/vscode projects/recipe-concept/bin/recipe.js" use ./recipe.md
echo '{"prompt":"build a hero section","cwd":"'"$(pwd)"'"}' | node .claude/hooks/recipe/recipe-hook.js
```

Expected: last command prints a `<recipe name="my-recipe">` block containing the `responses`, `design`, and `tech` ingredients (`hero` hits `ui`, `build` hits `stack`) and NOT `motion`.

```bash
echo '{"prompt":"explain monads","cwd":"'"$(pwd)"'"}' | node .claude/hooks/recipe/recipe-hook.js
```

Expected: only the `responses` ingredient inside the recipe block.

- [ ] **Step 3: Full suite one last time**

Run: `node --test` (in the repo root)
Expected: PASS (31 tests, 0 failures)

- [ ] **Step 4: Commit**

```bash
git add README.md
git commit -m "docs: README — quick start, format, commands"
```
