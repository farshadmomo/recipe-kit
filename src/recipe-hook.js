#!/usr/bin/env node
'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');

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

// Local sources auto-refresh: if the recipe's source file is newer than the
// installed snapshot, re-flatten it in place. ponytail: rewrites the installed
// snapshot only — never the active/source pointers, so a source *rename* still
// needs `recipe reload`. And only the root source's mtime is checked, not its
// extended parents' — edit a parent, then reload (or touch the child).
async function maybeReload(installed) {
  const src = fs.readFileSync(path.join(path.dirname(installed), 'source'), 'utf8').trim();
  // gh:/mkt: sources keep snapshot semantics; path.isAbsolute cleanly rejects
  // them on both platforms (local sources are always path.resolve'd by `use`).
  if (!path.isAbsolute(src)) return;
  if (fs.statSync(src).mtimeMs <= fs.statSync(installed).mtimeMs) return;
  const { resolveRecipe } = require('./resolver');
  const { serializeRecipe } = require('./parser');
  // fetchRemote=null: a local source that extends a gh: parent throws here, so
  // the caller falls open to the existing snapshot rather than networking.
  const recipe = await resolveRecipe(src, path.dirname(src), new Set(), null);
  fs.writeFileSync(installed, serializeRecipe(recipe));
}

async function main() {
  let parseRecipe, DEFAULT_ROUTES, selectIngredients, renderContext;
  try {
    ({ parseRecipe } = require('./parser'));
    ({ DEFAULT_ROUTES, selectIngredients, renderContext } = require('./router'));
  } catch {
    return; // fail open: hook siblings missing/corrupt must never block a prompt
  }

  let payload;
  try {
    payload = JSON.parse(fs.readFileSync(0, 'utf8'));
  } catch {
    return; // fail open: bad/missing stdin
  }
  if (typeof payload !== 'object' || payload === null) return; // fail open: valid JSON, wrong shape
  const cwd = process.env.CLAUDE_PROJECT_DIR || payload.cwd || process.cwd();
  const file = activeRecipeFile(cwd);
  if (!file || !fs.existsSync(file)) return;

  try {
    await maybeReload(file);
  } catch {
    // fail open: missing source, gh: parent, parse/IO error — serve the snapshot.
  }

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

  const prompt = payload.prompt || '';
  const out = renderContext(recipe, selectIngredients(recipe, prompt), prompt);
  if (out) process.stdout.write(out);
}

if (require.main === module) main();

module.exports = { activeRecipeFile };
