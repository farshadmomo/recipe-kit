'use strict';
const test = require('node:test');
const assert = require('node:assert');
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const CLI = path.join(__dirname, '..', 'bin', 'recipe.js');
const HOOK_CMD = 'node "${CLAUDE_PROJECT_DIR:-.}/.claude/hooks/recipe/recipe-hook.js"';

function tmpDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'recipe-cli-'));
}

function run(cwd, ...args) {
  return execFileSync(process.execPath, [CLI, ...args], {
    cwd,
    encoding: 'utf8',
    // hermetic: `recipe test` falls back to ~/.claude/recipes like the hook does
    env: { ...process.env, HOME: cwd, USERPROFILE: cwd },
  });
}

test('init creates dirs, copies hook trio, registers hook', () => {
  const dir = tmpDir();
  run(dir, 'init');
  assert.ok(fs.existsSync(path.join(dir, '.claude', 'recipes')));
  for (const f of ['parser.js', 'router.js', 'recipe-hook.js']) {
    assert.ok(fs.existsSync(path.join(dir, '.claude', 'hooks', 'recipe', f)), f);
  }
  const settings = JSON.parse(
    fs.readFileSync(path.join(dir, '.claude', 'settings.json'), 'utf8')
  );
  const cmds = settings.hooks.UserPromptSubmit.flatMap((e) =>
    e.hooks.map((h) => h.command)
  );
  assert.deepEqual(cmds, [HOOK_CMD]);
});

test('init is idempotent and preserves existing settings', () => {
  const dir = tmpDir();
  fs.mkdirSync(path.join(dir, '.claude'), { recursive: true });
  fs.writeFileSync(
    path.join(dir, '.claude', 'settings.json'),
    JSON.stringify({ permissions: { allow: ['Bash(ls:*)'] } })
  );
  run(dir, 'init');
  run(dir, 'init');
  const settings = JSON.parse(
    fs.readFileSync(path.join(dir, '.claude', 'settings.json'), 'utf8')
  );
  assert.deepEqual(settings.permissions, { allow: ['Bash(ls:*)'] });
  const cmds = settings.hooks.UserPromptSubmit.flatMap((e) =>
    e.hooks.map((h) => h.command)
  );
  assert.deepEqual(cmds, [HOOK_CMD]);
});

test('init migrates an old-format hook command', () => {
  const dir = tmpDir();
  fs.mkdirSync(path.join(dir, '.claude'), { recursive: true });
  fs.writeFileSync(
    path.join(dir, '.claude', 'settings.json'),
    JSON.stringify({
      hooks: {
        UserPromptSubmit: [
          { hooks: [{ type: 'command', command: 'node .claude/hooks/recipe/recipe-hook.js' }] },
          { hooks: [{ type: 'command', command: 'echo hi' }] },
        ],
      },
    })
  );
  run(dir, 'init');
  const settings = JSON.parse(
    fs.readFileSync(path.join(dir, '.claude', 'settings.json'), 'utf8')
  );
  const cmds = settings.hooks.UserPromptSubmit.flatMap((e) =>
    e.hooks.map((h) => h.command)
  );
  assert.deepEqual(cmds, ['echo hi', HOOK_CMD]);
});

// execFileSync throws on nonzero exit; CLI output lands on e.stdout/e.stderr,
// not reliably in e.message — assert on those.
function assertFails(fn, stderrRe) {
  try {
    fn();
    assert.fail('expected the command to exit nonzero');
  } catch (e) {
    assert.equal(e.status, 1);
    if (stderrRe) assert.match(String(e.stderr), stderrRe);
  }
}

test('unknown command prints usage and exits 1', () => {
  assertFails(() => run(tmpDir(), 'bogus'));
});

test('bare invocation prints usage and exits 0', () => {
  const out = run(tmpDir()); // execFileSync throws on nonzero exit
  assert.match(out, /usage: recipe/);
});

test('prototype-member command name fails instead of silently exiting 0', () => {
  assertFails(() => run(tmpDir(), 'constructor'));
});

const BASE = `---
name: base-modern
author: alice
---

## [always] responses
Use /caveman.

## [ui] design
parent design
`;

const CHILD = `---
name: my-ecom
extends: [./base.md]
---

## [ui] design
child design

## [stack] tech
next.js + tailwind
`;

test('use ./file.md flattens extends, installs, activates', () => {
  const dir = tmpDir();
  run(dir, 'init');
  fs.writeFileSync(path.join(dir, 'base.md'), BASE);
  fs.writeFileSync(path.join(dir, 'child.md'), CHILD);
  run(dir, 'use', './child.md');
  const rdir = path.join(dir, '.claude', 'recipes');
  assert.equal(fs.readFileSync(path.join(rdir, 'active'), 'utf8').trim(), 'my-ecom.md');
  const flat = fs.readFileSync(path.join(rdir, 'my-ecom.md'), 'utf8');
  assert.match(flat, /name: my-ecom/);
  assert.match(flat, /author: alice/);        // inherited meta
  assert.match(flat, /child design/);          // override won
  assert.doesNotMatch(flat, /parent design/);
  assert.doesNotMatch(flat, /extends:/);       // flattened
});

test('use aborts on circular extends with no partial install', () => {
  const dir = tmpDir();
  run(dir, 'init');
  fs.writeFileSync(path.join(dir, 'a.md'), '---\nname: a\nextends: [./b.md]\n---\n## [always] x\nbody\n');
  fs.writeFileSync(path.join(dir, 'b.md'), '---\nname: b\nextends: [./a.md]\n---\n## [always] y\nbody\n');
  assert.throws(() => run(dir, 'use', './a.md'), /circular/i);
  assert.ok(!fs.existsSync(path.join(dir, '.claude', 'recipes', 'active')));
});

test('use resolves diamond extends (not a false cycle)', () => {
  const dir = tmpDir();
  run(dir, 'init');
  fs.writeFileSync(path.join(dir, 'c.md'), '---\nname: c\n---\n## [always] x\nbase body\n');
  fs.writeFileSync(path.join(dir, 'a.md'), '---\nname: a\nextends: [./c.md]\n---\n## [ui] a\na body\n');
  fs.writeFileSync(path.join(dir, 'b.md'), '---\nname: b\nextends: [./c.md]\n---\n## [stack] b\nb body\n');
  fs.writeFileSync(path.join(dir, 'r.md'), '---\nname: r\nextends: [./a.md, ./b.md]\n---\n## [always] r\nr body\n');
  run(dir, 'use', './r.md');
  const flat = fs.readFileSync(path.join(dir, '.claude', 'recipes', 'r.md'), 'utf8');
  assert.match(flat, /a body/);
  assert.match(flat, /b body/);
  assert.match(flat, /r body/);
});

test('use rejects a malformed gh ref before any network call', () => {
  assert.throws(() => run(tmpDir(), 'use', 'gh:justauser'), /bad ref/i);
});

test('list marks the active recipe; off deactivates but keeps files', () => {
  const dir = tmpDir();
  run(dir, 'init');
  fs.writeFileSync(path.join(dir, 'r.md'), BASE);
  run(dir, 'use', './r.md');
  assert.match(run(dir, 'list'), /\* base-modern\.md/);
  run(dir, 'off');
  assert.match(run(dir, 'list'), /^ {2}base-modern\.md/m);
  assert.ok(fs.existsSync(path.join(dir, '.claude', 'recipes', 'base-modern.md')));
});

test('test command shows + for injected and - for skipped ingredients', () => {
  const dir = tmpDir();
  run(dir, 'init');
  fs.writeFileSync(path.join(dir, 'r.md'), BASE);
  run(dir, 'use', './r.md');
  const hit = run(dir, 'test', 'build a landing page');
  assert.match(hit, /recipe: base-modern/);
  assert.match(hit, /\+ \[always\] responses/);
  assert.match(hit, /\+ \[ui\] design/);
  const miss = run(dir, 'test', 'explain monads');
  assert.match(miss, /\+ \[always\] responses/);
  assert.match(miss, /- \[ui\] design/);
});

test('test with no active recipe says so', () => {
  const dir = tmpDir();
  run(dir, 'init');
  assert.match(run(dir, 'test', 'anything'), /no active recipe/);
});

test('reload re-installs from the recorded source', () => {
  const dir = tmpDir();
  run(dir, 'init');
  fs.writeFileSync(path.join(dir, 'r.md'), BASE);
  run(dir, 'use', './r.md');
  fs.writeFileSync(path.join(dir, 'r.md'), BASE.replace('parent design', 'edited design'));
  run(dir, 'reload');
  const flat = fs.readFileSync(path.join(dir, '.claude', 'recipes', 'base-modern.md'), 'utf8');
  assert.match(flat, /edited design/);
});

test('reload without a recorded source fails cleanly', () => {
  const dir = tmpDir();
  run(dir, 'init');
  assertFails(() => run(dir, 'reload'), /no source recorded/);
});

test('new scaffolds recipe.md that parses, and refuses to overwrite', () => {
  const dir = tmpDir();
  run(dir, 'new');
  const { parseRecipe } = require('../src/parser');
  const r = parseRecipe(fs.readFileSync(path.join(dir, 'recipe.md'), 'utf8'));
  assert.ok(r.meta.name);
  assert.ok(r.ingredients.some((i) => i.tag === 'always'));
  assert.throws(() => run(dir, 'new'), /already exists/);
});
