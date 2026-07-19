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
  copy: ['copy', 'headline', 'tagline', 'microcopy', 'wording', 'tone', 'voice',
    'slogan', 'cta'],
  docs: ['docs', 'documentation', 'readme', 'changelog', 'docstring', 'tutorial',
    'guide'],
};

function escapeRe(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function hit(routes, ch, prompt) {
  return (routes[ch] || []).some((kw) => new RegExp(`\\b${escapeRe(kw)}\\b`, 'i').test(prompt));
}

function selectIngredients(recipe, prompt) {
  const routes = { ...DEFAULT_ROUTES, ...recipe.meta.routes };
  const p = String(prompt);
  return recipe.ingredients.filter((i) => i.tag === 'always' || hit(routes, i.tag, p));
}

// One line naming the skills whose channels fired — mirrors what a user
// would type by hand ("build a hero using /ui-ux-pro-max"), which models
// obey far more than ambient prose mentions.
function skillLine(recipe, prompt) {
  const routes = { ...DEFAULT_ROUTES, ...recipe.meta.routes };
  const p = String(prompt);
  const seen = new Set();
  const parts = [];
  for (const [ch, names] of Object.entries(recipe.meta.skills || {})) {
    if (ch !== 'always' && !hit(routes, ch, p)) continue;
    const fresh = names.filter((n) => !seen.has(n) && seen.add(n));
    if (fresh.length) parts.push(`${fresh.map((n) => `/${n}`).join(', ')} (${ch})`);
  }
  if (!parts.length) return '';
  return `skills for this prompt — invoke the ones that change the result, skip the rest: ${parts.join(' · ')}`;
}

function renderContext(recipe, ingredients, prompt) {
  if (!ingredients.length) return '';
  const body = ingredients.map((i) => `[${i.name}]\n${i.body}`).join('\n\n');
  const line = prompt === undefined ? '' : skillLine(recipe, prompt);
  return `<recipe name="${recipe.meta.name}">\n${body}${line ? `\n\n${line}` : ''}\n</recipe>`;
}

module.exports = { DEFAULT_ROUTES, selectIngredients, skillLine, renderContext };
