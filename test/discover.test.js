'use strict';
const test = require('node:test');
const assert = require('node:assert');
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const CLI = path.join(__dirname, '..', 'bin', 'recipe.js');

function tmpDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'recipe-discover-'));
}

// HOME/USERPROFILE → cwd, so discover's ~/.claude/projects resolves under the tmp dir.
function run(cwd, ...args) {
  return execFileSync(process.execPath, [CLI, ...args], {
    cwd,
    encoding: 'utf8',
    env: { ...process.env, HOME: cwd, USERPROFILE: cwd },
  });
}

// Same slug the CLI computes from process.cwd() — build fixtures under it.
function transcriptDir(cwd) {
  const slug = cwd.replace(/[^A-Za-z0-9]/g, '-');
  const dir = path.join(cwd, '.claude', 'projects', slug);
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

// The real user-prompt shape: obj.message.content is a plain string.
function userLine(text) {
  return JSON.stringify({ type: 'user', message: { content: text } });
}

function writeJsonl(dir, name, lines) {
  fs.writeFileSync(path.join(dir, name), lines.join('\n') + '\n');
}

const RECIPE = `---
name: disc
---

## [always] responses
Use /caveman.

## [ui] design
design body

## [animation] motion
motion body
`;

test('discover reports per-channel fire-rate for a mixed prompt set', () => {
  const dir = tmpDir();
  run(dir, 'init');
  fs.writeFileSync(path.join(dir, 'r.md'), RECIPE);
  run(dir, 'use', './r.md');
  const td = transcriptDir(dir);
  writeJsonl(td, 'a.jsonl', [
    userLine('build a landing page'), // ui
    userLine('add a scroll animation'), // animation
    userLine('explain monads'), // nothing
  ]);
  const out = run(dir, 'discover');
  assert.match(out, /3 prompts scanned/);
  assert.match(out, /ui: fired 1 \(33%\)/);
  assert.match(out, /animation: fired 1 \(33%\)/);
  assert.match(out, /1 prompts fired nothing beyond \[always\]/);
});

// Recipe with only a [testing] channel → "make the login page bounce" fires
// nothing, so its off-route words (bounce=animation, login=backend) are near-misses.
const RECIPE_TESTING = `---
name: discb
---

## [always] responses
Use /caveman.

## [testing] checks
checks body
`;

test('discover surfaces near-miss suggestions for recurring off-route keywords', () => {
  const dir = tmpDir();
  run(dir, 'init');
  fs.writeFileSync(path.join(dir, 'r.md'), RECIPE_TESTING);
  run(dir, 'use', './r.md');
  const td = transcriptDir(dir);
  writeJsonl(td, 'a.jsonl', [
    userLine('make the login page bounce'),
    userLine('make the login page bounce harder'),
  ]);
  const out = run(dir, 'discover');
  assert.match(out, /suggest: routes\.animation \+= bounce/);
  assert.match(out, /suggest: routes\.backend \+= login/);
});

test('discover skips garbage and tool-result lines without crashing', () => {
  const dir = tmpDir();
  run(dir, 'init');
  fs.writeFileSync(path.join(dir, 'r.md'), RECIPE);
  run(dir, 'use', './r.md');
  const td = transcriptDir(dir);
  writeJsonl(td, 'a.jsonl', [
    'this is not json {{{',
    JSON.stringify({ type: 'user', isMeta: true, message: { content: [{ type: 'text', text: 'meta noise' }] } }),
    JSON.stringify({ type: 'user', message: { content: [{ type: 'tool_result', content: 'x' }] } }),
    JSON.stringify({ type: 'assistant', message: { content: 'ignored' } }),
    userLine('build a landing page'), // the only real prompt
  ]);
  const out = run(dir, 'discover');
  assert.match(out, /1 prompts scanned/);
  assert.match(out, /ui: fired 1 \(100%\)/);
});

test('discover prints a friendly message when no transcript dir exists', () => {
  const dir = tmpDir();
  run(dir, 'init');
  assert.match(run(dir, 'discover'), /no transcripts found/i);
});
