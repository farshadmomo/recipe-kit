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
