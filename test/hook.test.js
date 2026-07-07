'use strict';
const test = require('node:test');
const assert = require('node:assert');
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const HOOK = path.join(__dirname, '..', 'src', 'recipe-hook.js');

function tmpProject(recipeText, activeName) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'recipe-hook-'));
  const rdir = path.join(dir, '.claude', 'recipes');
  fs.mkdirSync(rdir, { recursive: true });
  if (recipeText !== null) fs.writeFileSync(path.join(rdir, 'test.md'), recipeText);
  if (activeName !== null) fs.writeFileSync(path.join(rdir, 'active'), activeName + '\n');
  return dir;
}

function runHook(cwd, prompt) {
  return execFileSync(process.execPath, [HOOK], {
    input: JSON.stringify({ prompt, cwd }),
    encoding: 'utf8',
  });
}

const RECIPE = `---
name: modern-ecom
---

## [always] responses
Use /caveman.

## [ui] design
Use /ui-ux-pro-max.
`;

test('injects routed ingredients for a matching prompt', () => {
  const dir = tmpProject(RECIPE, 'test.md');
  const out = runHook(dir, 'build a landing page');
  assert.match(out, /<recipe name="modern-ecom">/);
  assert.match(out, /Use \/caveman\./);
  assert.match(out, /Use \/ui-ux-pro-max\./);
});

test('non-matching prompt gets only always ingredients', () => {
  const dir = tmpProject(RECIPE, 'test.md');
  const out = runHook(dir, 'explain monads');
  assert.match(out, /Use \/caveman\./);
  assert.doesNotMatch(out, /ui-ux-pro-max/);
});

test('no active pointer → silent, exit 0', () => {
  const dir = tmpProject(RECIPE, null);
  assert.equal(runHook(dir, 'build a page'), '');
});

test('malformed recipe → silent stdout, exit 0 (fail open)', () => {
  const dir = tmpProject('not a recipe at all', 'test.md');
  assert.equal(runHook(dir, 'build a page'), '');
});

test('garbage stdin → silent, exit 0', () => {
  const out = execFileSync(process.execPath, [HOOK], { input: '%%%', encoding: 'utf8' });
  assert.equal(out, '');
});
