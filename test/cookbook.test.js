'use strict';
const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const { resolveRecipe } = require('../bin/recipe');
const { DEFAULT_ROUTES, skillLine } = require('../src/router');

// Flatten every shipped recipe through the real resolver (extends + merge) and
// assert the invariants the cookbook depends on. Local-only: no recipe here
// extends a gh: ref, so resolveRecipe never networks.
const RECIPES_DIR = path.join(__dirname, '..', 'recipes');
const FILES = fs.readdirSync(RECIPES_DIR).filter((f) => f.endsWith('.md'));

// core blocks that creative-core provides and every extender inherits exactly once
const CORE_BLOCKS = ['responses', 'transfer', 'creativity', 'kickoff', 'check-rule'];

for (const file of FILES) {
  test(`cookbook: ${file} flattens, routes, and stays consistent`, async () => {
    const recipe = await resolveRecipe('./' + file, RECIPES_DIR, new Set());
    const routes = { ...DEFAULT_ROUTES, ...recipe.meta.routes };
    const requires = recipe.meta.requires || {};

    // every non-[always] ingredient tag has a route, or it can never inject
    for (const i of recipe.ingredients) {
      if (i.tag !== 'always') {
        assert.ok(routes[i.tag], `${file}: tag [${i.tag}] ("${i.name}") has no route`);
      }
    }

    // every skills channel is routed, and every named skill is declared in requires
    for (const [ch, names] of Object.entries(recipe.meta.skills || {})) {
      assert.ok(routes[ch], `${file}: skills channel "${ch}" has no route`);
      for (const n of names) {
        assert.ok(requires[n], `${file}: skill "${n}" not declared in requires`);
      }
    }

    // the base-recipe blocks appear exactly once after flatten (override keeps one)
    for (const name of CORE_BLOCKS) {
      const count = recipe.ingredients.filter((i) => i.name === name).length;
      assert.equal(count, 1, `${file}: core block "${name}" appears ${count}× (want 1)`);
    }

    // a UI-bearing recipe must surface its skill line on a plainly-UI prompt
    if (recipe.meta.skills && recipe.meta.skills.ui) {
      assert.match(
        skillLine(recipe, 'build a hero section for the landing page'),
        /skills for this prompt/,
        `${file}: ui recipe did not fire a skill line on a hero prompt`
      );
    }
  });
}

test('cookbook: creative-core defines the base blocks it hands down', async () => {
  const core = await resolveRecipe('./creative-core.md', RECIPES_DIR, new Set());
  for (const name of CORE_BLOCKS) {
    assert.ok(core.ingredients.some((i) => i.name === name), `core missing ${name}`);
  }
  // the base has no ui skills of its own — nothing to nudge
  assert.ok(!(core.meta.skills && core.meta.skills.ui));
});

test('cookbook: api overrides the base kickoff by name', async () => {
  const api = await resolveRecipe('./api.md', RECIPES_DIR, new Set());
  const kickoff = api.ingredients.find((i) => i.name === 'kickoff');
  assert.ok(kickoff);
  assert.match(kickoff.body, /API-DESIGN\.md/); // api's ritual, not the generic DESIGN.md one
});
