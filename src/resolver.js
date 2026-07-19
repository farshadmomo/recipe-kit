'use strict';
const fs = require('fs');
const path = require('path');
const { parseRecipe, mergeRecipes } = require('./parser');

// gh:u/r/recipes/x.md → gh:u/r/recipes; bare gh:u/r → itself (the repo IS the dir).
function ghDir(ref) {
  const parts = ref.slice(3).split('/');
  return parts.length <= 2 ? ref : `gh:${parts.slice(0, -1).join('/')}`;
}

// Resolve a relative extends against a gh: base, staying inside the repo.
// path.posix so Windows backslashes never leak into the raw URL.
function rebaseGh(ghBase, rel) {
  const joined = path.posix.normalize(path.posix.join(ghBase.slice(3), rel));
  if (joined.startsWith('..') || joined.split('/').length < 2) {
    throw new Error(`bad ref: ${rel} escapes ${ghBase}`);
  }
  return `gh:${joined}`;
}

// Cycle key: gh:u/r and gh:u/r/recipe.md fetch the same file — canonicalize both.
function resolveKey(ref, baseDir) {
  if (!ref.startsWith('gh:')) return path.resolve(baseDir, ref);
  const parts = ref.slice(3).split('/');
  return parts.length === 2 ? `${ref}/recipe.md` : ref;
}

// Later extends entries override earlier ones; the recipe itself overrides all.
// Remote (gh:) refs are fetched via fetchRemote; a null fetchRemote (the hook,
// which must never network) turns any remote extend into a clear error.
async function resolveRecipe(ref, baseDir, seen, fetchRemote) {
  const key = resolveKey(ref, baseDir);
  if (seen.has(key)) throw new Error(`circular extends via ${ref}`);
  seen.add(key);
  let text, nextBase;
  if (ref.startsWith('gh:')) {
    if (!fetchRemote) throw new Error(`remote extends (${ref}) — run: recipe reload`);
    text = await fetchRemote(ref);
    nextBase = ghDir(ref); // gh base — relative extends rebase against it below
  } else {
    const abs = path.resolve(baseDir, ref);
    text = fs.readFileSync(abs, 'utf8');
    nextBase = path.dirname(abs);
  }
  const recipe = parseRecipe(text);
  let acc = null;
  for (let parentRef of recipe.meta.extends) {
    // inside a gh recipe, a relative extends stays inside the repo via the gh base
    if (nextBase.startsWith('gh:') && !parentRef.startsWith('gh:') && !path.isAbsolute(parentRef)) {
      parentRef = rebaseGh(nextBase, parentRef);
    }
    const parent = await resolveRecipe(parentRef, nextBase, seen, fetchRemote);
    acc = acc ? mergeRecipes(acc, parent) : parent;
  }
  seen.delete(key); // path-based cycle check: keep only the current ancestor chain, so diamonds resolve
  return acc ? mergeRecipes(acc, recipe) : recipe;
}

module.exports = { resolveRecipe, ghDir, rebaseGh, resolveKey };
