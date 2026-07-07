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
  if (typeof payload !== 'object' || payload === null) return; // fail open: valid JSON, wrong shape
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
