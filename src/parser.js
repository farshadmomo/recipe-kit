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
