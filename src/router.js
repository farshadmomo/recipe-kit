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
  const p = String(prompt);
  const hit = (ch) =>
    (routes[ch] || []).some((kw) => new RegExp(`\\b${escapeRe(kw)}\\b`, 'i').test(p));
  return recipe.ingredients.filter((i) => i.tag === 'always' || hit(i.tag));
}

function renderContext(recipe, ingredients) {
  if (!ingredients.length) return '';
  const body = ingredients.map((i) => `[${i.name}]\n${i.body}`).join('\n\n');
  return `<recipe name="${recipe.meta.name}">\n${body}\n</recipe>`;
}

module.exports = { DEFAULT_ROUTES, selectIngredients, renderContext };
