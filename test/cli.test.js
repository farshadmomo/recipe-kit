'use strict';
const test = require('node:test');
const assert = require('node:assert');
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const CLI = path.join(__dirname, '..', 'bin', 'recipe.js');
const HOOK_CMD = 'node .claude/hooks/recipe/recipe-hook.js';

function tmpDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'recipe-cli-'));
}

function run(cwd, ...args) {
  return execFileSync(process.execPath, [CLI, ...args], { cwd, encoding: 'utf8' });
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
