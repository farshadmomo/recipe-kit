'use strict';

// ponytail: YAML subset — scalars, [flow, lists], one-level maps of flow lists or scalars.
// Swap in a real YAML lib only if recipes outgrow this.
function parseFrontmatter(text) {
  const meta = { extends: [], routes: {}, requires: {}, skills: {} };
  let currentMap = null;
  for (const raw of text.split(/\r?\n/)) {
    if (!raw.trim()) continue;
    const nested = raw.match(/^\s+([\w-]+):\s*\[(.*)\]\s*$/);
    if (nested && currentMap) {
      meta[currentMap][nested[1]] = splitFlowList(nested[2]);
      continue;
    }
    const nestedScalar = raw.match(/^\s+([\w-]+):\s*(.+)$/);
    if (nestedScalar && currentMap) {
      meta[currentMap][nestedScalar[1]] = nestedScalar[2].trim();
      continue;
    }
    const top = raw.match(/^([\w-]+):\s*(.*)$/);
    if (!top) continue;
    const [, key, value] = top;
    if (value === '' || value.startsWith('#')) { // bare key or trailing comment opens a map
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
  if (typeof meta.name !== 'string' || !/^[A-Za-z0-9._-]+$/.test(meta.name)) {
    throw new Error('recipe: name must be a filename-safe string (letters, digits, . _ -)');
  }
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

function mergeRecipes(parent, child) {
  const meta = {
    ...parent.meta,
    ...child.meta,
    extends: [],
    routes: { ...parent.meta.routes, ...child.meta.routes },
    requires: { ...(parent.meta.requires || {}), ...(child.meta.requires || {}) },
    skills: { ...(parent.meta.skills || {}), ...(child.meta.skills || {}) },
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
  if (meta.extends && meta.extends.length) lines.push(`extends: [${meta.extends.join(', ')}]`);
  const routes = Object.entries(meta.routes || {});
  if (routes.length) {
    lines.push('routes:');
    for (const [ch, kws] of routes) lines.push(`  ${ch}: [${kws.join(', ')}]`);
  }
  const skills = Object.entries(meta.skills || {});
  if (skills.length) {
    lines.push('skills:');
    for (const [ch, names] of skills) lines.push(`  ${ch}: [${names.join(', ')}]`);
  }
  const requires = Object.entries(meta.requires || {});
  if (requires.length) {
    lines.push('requires:');
    for (const [name, cmd] of requires) lines.push(`  ${name}: ${cmd}`);
  }
  lines.push('---', '');
  for (const i of ingredients) lines.push(`## [${i.tag}] ${i.name}`, '', i.body, '');
  return lines.join('\n');
}

module.exports = { parseRecipe, mergeRecipes, serializeRecipe };
