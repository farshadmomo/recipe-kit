'use strict';
const fs = require('fs');
const path = require('path');
const { parseRecipe, mergeRecipes } = require('./parser');

// Remote refs are fetched, not read from disk: gh: (a repo file) and mkt: (a
// marketplace slug). Everything else is a local path.
function isRemote(ref) {
  return ref.startsWith('gh:') || ref.startsWith('mkt:');
}

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
// mkt: refs are their own key; locals key by absolute path.
function resolveKey(ref, baseDir) {
  if (ref.startsWith('mkt:')) return ref;
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
  if (isRemote(ref)) {
    if (!fetchRemote) throw new Error(`remote extends (${ref}) — run: recipe reload`);
    text = await fetchRemote(ref);
    // gh base is the containing dir so relative extends rebase against it; mkt
    // has no dir, so its base is the ref itself (any relative extends errors below).
    nextBase = ref.startsWith('gh:') ? ghDir(ref) : ref;
  } else {
    const abs = path.resolve(baseDir, ref);
    text = fs.readFileSync(abs, 'utf8');
    nextBase = path.dirname(abs);
  }
  const recipe = parseRecipe(text);
  let acc = null;
  for (let parentRef of recipe.meta.extends) {
    const relative = !isRemote(parentRef) && !path.isAbsolute(parentRef);
    if (relative && nextBase.startsWith('gh:')) {
      // inside a gh recipe, a relative extends stays inside the repo via the gh base
      parentRef = rebaseGh(nextBase, parentRef);
    } else if (relative && nextBase.startsWith('mkt:')) {
      throw new Error(`mkt recipe ${ref} may only extend gh: or mkt: refs, not ${parentRef}`);
    }
    const parent = await resolveRecipe(parentRef, nextBase, seen, fetchRemote);
    acc = acc ? mergeRecipes(acc, parent) : parent;
  }
  seen.delete(key); // path-based cycle check: keep only the current ancestor chain, so diamonds resolve
  return acc ? mergeRecipes(acc, recipe) : recipe;
}

module.exports = { resolveRecipe, ghDir, rebaseGh, resolveKey };
