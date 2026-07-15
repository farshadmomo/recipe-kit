'use strict';
const test = require('node:test');
const assert = require('node:assert');
const { parseRecipe } = require('../src/parser');
const { DEFAULT_ROUTES, selectIngredients, skillLine, renderContext } = require('../src/router');

const RECIPE = parseRecipe(`---
name: modern-ecom
routes:
  animation: [animate, scroll, parallax]
skills:
  ui: [ui-ux-pro-max, frontend-design]
  animation: [gsap-react, frontend-design]
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

test('uppercase keywords in a route override still match', () => {
  const recipe = parseRecipe(`---
name: caps
routes:
  backend: [API]
---

## [backend] server
Stuff.
`);
  assert.deepEqual(
    selectIngredients(recipe, 'the api is broken').map((i) => i.name),
    ['server']);
});

test('renderContext returns empty string for no ingredients', () => {
  assert.equal(renderContext(RECIPE, []), '');
});

test('skillLine names skills only for fired channels', () => {
  assert.equal(skillLine(RECIPE, 'what time is it'), '');
  assert.match(skillLine(RECIPE, 'build a hero section'),
    /skills for this prompt.*\/ui-ux-pro-max, \/frontend-design \(ui\)/);
  assert.match(skillLine(RECIPE, 'add a parallax effect'),
    /\/gsap-react, \/frontend-design \(animation\)/);
});

test('skillLine dedupes a skill listed under several channels', () => {
  const line = skillLine(RECIPE, 'animate the hero design');
  assert.equal(line.match(/\/frontend-design/g).length, 1);
  assert.match(line, /\/gsap-react/);
});

test('renderContext appends the skill line only when a prompt is given', () => {
  const picked = selectIngredients(RECIPE, 'build a page');
  assert.match(renderContext(RECIPE, picked, 'build a page'), /skills for this prompt/);
  assert.doesNotMatch(renderContext(RECIPE, picked), /skills for this prompt/);
});

test('recipes without skills: render no skill line', () => {
  const bare = parseRecipe('---\nname: bare\n---\n\n## [ui] design\nStuff.\n');
  assert.equal(skillLine(bare, 'build a page'), '');
  assert.doesNotMatch(
    renderContext(bare, selectIngredients(bare, 'build a page'), 'build a page'),
    /skills for this prompt/);
});
