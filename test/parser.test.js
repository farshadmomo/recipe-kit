'use strict';
const test = require('node:test');
const assert = require('node:assert');
const { parseRecipe } = require('../src/parser');

const GOOD = `---
name: modern-ecom
version: 1.0.0
author: momtaz
description: Modern ecommerce builds
extends: []
routes:
  animation: [animate, scroll, parallax]
---

## [always] responses
Use /caveman for responses.

## [ui] design
Use /ui-ux-pro-max.

## [animation] motion
GSAP for scroll, Lenis as scroll engine.
`;

test('parses meta and ingredients from a valid recipe', () => {
  const r = parseRecipe(GOOD);
  assert.equal(r.meta.name, 'modern-ecom');
  assert.equal(r.meta.version, '1.0.0');
  assert.deepEqual(r.meta.extends, []);
  assert.deepEqual(r.meta.routes, { animation: ['animate', 'scroll', 'parallax'] });
  assert.equal(r.ingredients.length, 3);
  assert.deepEqual(r.ingredients[0], {
    tag: 'always', name: 'responses', body: 'Use /caveman for responses.',
  });
  assert.equal(r.ingredients[2].tag, 'animation');
  assert.equal(r.ingredients[2].body, 'GSAP for scroll, Lenis as scroll engine.');
});

test('parses flow-list extends', () => {
  const r = parseRecipe(GOOD.replace('extends: []', 'extends: [gh:a/base, ./local.md]'));
  assert.deepEqual(r.meta.extends, ['gh:a/base', './local.md']);
});

test('tolerates CRLF line endings', () => {
  const r = parseRecipe(GOOD.replace(/\n/g, '\r\n'));
  assert.equal(r.meta.name, 'modern-ecom');
  assert.equal(r.ingredients.length, 3);
});

test('defaults extends/routes when absent', () => {
  const r = parseRecipe('---\nname: x\n---\n## [always] a\nbody\n');
  assert.deepEqual(r.meta.extends, []);
  assert.deepEqual(r.meta.routes, {});
});

test('lowercases tags', () => {
  const r = parseRecipe('---\nname: x\n---\n## [UI] a\nbody\n');
  assert.equal(r.ingredients[0].tag, 'ui');
});

test('throws on missing frontmatter', () => {
  assert.throws(() => parseRecipe('## [always] a\nbody\n'), /missing frontmatter/);
});

test('throws on missing name', () => {
  assert.throws(() => parseRecipe('---\nauthor: x\n---\n## [always] a\nbody\n'), /needs a name/);
});

test('throws when no ingredients', () => {
  assert.throws(() => parseRecipe('---\nname: x\n---\njust prose\n'), /no ingredients/);
});
