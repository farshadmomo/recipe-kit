'use strict';
const test = require('node:test');
const assert = require('node:assert');
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const HOOK = path.join(__dirname, '..', 'src', 'recipe-hook.js');

function tmpProject(recipeText, activeName, source) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'recipe-hook-'));
  const rdir = path.join(dir, '.claude', 'recipes');
  fs.mkdirSync(rdir, { recursive: true });
  if (recipeText !== null) fs.writeFileSync(path.join(rdir, 'test.md'), recipeText);
  if (activeName !== null) fs.writeFileSync(path.join(rdir, 'active'), activeName + '\n');
  if (source !== undefined) fs.writeFileSync(path.join(rdir, 'source'), source + '\n');
  return dir;
}

// Force the installed snapshot older than its source (no sleeps, deterministic).
function makeSourceNewer(installed, srcFile) {
  const past = new Date(Date.now() - 10000);
  const now = new Date();
  fs.utimesSync(installed, past, past);
  fs.utimesSync(srcFile, now, now);
}

function runHook(cwd, prompt) {
  return execFileSync(process.execPath, [HOOK], {
    input: JSON.stringify({ prompt, cwd }),
    encoding: 'utf8',
    // Hermetic: os.homedir() falls back to HOME/USERPROFILE, so point it at the
    // tmp project dir instead of the real machine's ~/.claude/recipes/active.
    env: { ...process.env, HOME: cwd, USERPROFILE: cwd },
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

test('non-object JSON stdin (null, string) → silent, exit 0', () => {
  for (const input of ['null', '"a string"']) {
    const out = execFileSync(process.execPath, [HOOK], { input, encoding: 'utf8' });
    assert.equal(out, '');
  }
});

// --- auto-reload (Phase C) ---
const SNAPSHOT = '---\nname: test\n---\n\n## [always] a\nsnapshot body\n';

test('edited local source auto-reloads: fresh text injects and the snapshot is rewritten', () => {
  const dir = tmpProject(SNAPSHOT, 'test.md');
  const srcFile = path.join(dir, 'source.md');
  fs.writeFileSync(srcFile, '---\nname: test\n---\n\n## [always] a\nfresh body\n');
  const rdir = path.join(dir, '.claude', 'recipes');
  fs.writeFileSync(path.join(rdir, 'source'), srcFile + '\n');
  const installed = path.join(rdir, 'test.md');
  makeSourceNewer(installed, srcFile);

  const out = runHook(dir, 'anything');
  assert.match(out, /fresh body/); // re-flattened source injected
  assert.match(fs.readFileSync(installed, 'utf8'), /fresh body/); // snapshot rewritten in place
});

test('gh: source keeps snapshot semantics — stale copy served, no network', () => {
  const dir = tmpProject(SNAPSHOT, 'test.md', 'gh:x/y');
  const out = runHook(dir, 'anything');
  assert.match(out, /snapshot body/);
});

test('local source that extends a gh: parent falls open to the snapshot', () => {
  const dir = tmpProject(SNAPSHOT, 'test.md');
  const srcFile = path.join(dir, 'source.md');
  fs.writeFileSync(srcFile, '---\nname: test\nextends: [gh:x/y]\n---\n\n## [always] a\nfresh body\n');
  const rdir = path.join(dir, '.claude', 'recipes');
  fs.writeFileSync(path.join(rdir, 'source'), srcFile + '\n');
  makeSourceNewer(path.join(rdir, 'test.md'), srcFile);

  const out = runHook(dir, 'anything');
  assert.match(out, /snapshot body/); // snapshot kept
  assert.doesNotMatch(out, /fresh body/); // gh: parent never fetched
});

test('missing source pointer serves the snapshot', () => {
  const dir = tmpProject(SNAPSHOT, 'test.md'); // no source file written
  const out = runHook(dir, 'anything');
  assert.match(out, /snapshot body/);
});
