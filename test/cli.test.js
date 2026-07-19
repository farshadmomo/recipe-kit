'use strict';
const test = require('node:test');
const assert = require('node:assert');
const { execFileSync, execFile } = require('node:child_process');
const http = require('node:http');
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

function runWithEnv(cwd, extraEnv, ...args) {
  return execFileSync(process.execPath, [CLI, ...args], {
    cwd,
    encoding: 'utf8',
    env: { ...process.env, HOME: cwd, USERPROFILE: cwd, ...extraEnv },
  });
}

test('init creates dirs, copies hook scripts, registers hook', () => {
  const dir = tmpDir();
  run(dir, 'init');
  assert.ok(fs.existsSync(path.join(dir, '.claude', 'recipes')));
  for (const f of ['parser.js', 'router.js', 'recipe-hook.js', 'resolver.js']) {
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

// --- lint (Phase D) --- errors → stderr + exit 1; warnings → stdout + exit 0.
test('lint passes a clean recipe (exit 0)', () => {
  const dir = tmpDir();
  run(dir, 'init');
  fs.writeFileSync(path.join(dir, 'r.md'), BASE); // [always] + [ui] (default-routed), no skills/requires
  const out = run(dir, 'lint', './r.md'); // execFileSync throws on nonzero exit
  assert.match(out, /clean/);
});

test('lint flags an unrouted ingredient tag (exit 1 + message)', () => {
  const dir = tmpDir();
  run(dir, 'init');
  fs.writeFileSync(path.join(dir, 'r.md'), '---\nname: broken\n---\n\n## [always] a\nbody\n\n## [nope] orphan\nbody\n');
  assertFails(() => run(dir, 'lint', './r.md'), /no route/);
});

test('lint warns without failing on a dead route (exit 0)', () => {
  const dir = tmpDir();
  run(dir, 'init');
  // declares a `ghost` route but no [ghost] ingredient and no skills: entry fires it
  fs.writeFileSync(path.join(dir, 'r.md'), '---\nname: warns\nroutes:\n  ghost: [nothing, here]\n---\n\n## [always] a\nbody\n');
  const out = run(dir, 'lint', './r.md');
  assert.match(out, /warn:.*ghost/);
});

test('lint resolves extends so a parent-declared route covers a child tag', () => {
  const dir = tmpDir();
  run(dir, 'init');
  // [special] is unrouted in the child alone, routed by the parent — lint must
  // fully resolve extends (exit 0), not just parse the child (would exit 1).
  fs.writeFileSync(path.join(dir, 'lparent.md'), '---\nname: lparent\nroutes:\n  special: [special, magic]\n---\n\n## [always] a\nbody\n');
  fs.writeFileSync(path.join(dir, 'lchild.md'), '---\nname: lchild\nextends: [./lparent.md]\n---\n\n## [special] thing\nbody\n');
  run(dir, 'lint', './lchild.md'); // throws if it exits 1
});

test('lint with no ref, no active recipe, no ./recipe.md prints a clean message', () => {
  const dir = tmpDir();
  run(dir, 'init');
  assert.match(run(dir, 'lint'), /nothing to lint/i);
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

const NEEDS_SKILL = `---
name: needs-skills
requires:
  caveman: node -e "require('fs').writeFileSync('MARKER.txt','done')"
---

## [always] a
body
`;

test('use warns on missing required skill, stays quiet once RECIPE_SKILLS_DIRS has it', () => {
  const dir = tmpDir();
  run(dir, 'init');
  fs.writeFileSync(path.join(dir, 'r.md'), NEEDS_SKILL);
  const skillsDir = fs.mkdtempSync(path.join(os.tmpdir(), 'recipe-skills-'));

  const missing = runWithEnv(dir, { RECIPE_SKILLS_DIRS: skillsDir }, 'use', './r.md');
  assert.match(missing, /⚠ 1 required skill\(s\) not installed: caveman/);
  assert.match(missing, /run: recipe setup/);

  fs.mkdirSync(path.join(skillsDir, 'caveman'), { recursive: true });
  fs.writeFileSync(path.join(skillsDir, 'caveman', 'SKILL.md'), '# caveman');
  const present = runWithEnv(dir, { RECIPE_SKILLS_DIRS: skillsDir }, 'use', './r.md');
  assert.doesNotMatch(present, /required skill/);
});

test('setup without --yes lists install commands but does not execute them', () => {
  const dir = tmpDir();
  run(dir, 'init');
  fs.writeFileSync(path.join(dir, 'r.md'), NEEDS_SKILL);
  run(dir, 'use', './r.md');
  const out = run(dir, 'setup');
  assert.match(out, /caveman/);
  assert.match(out, /re-run with --yes/);
  assert.ok(!fs.existsSync(path.join(dir, 'MARKER.txt')));
});

test('setup with no active recipe says so', () => {
  const dir = tmpDir();
  run(dir, 'init');
  assert.match(run(dir, 'setup'), /no active recipe/);
});

// --- gh-relative extends (Phase A) ---
// A local http server keyed by URL path stands in for raw.githubusercontent.com;
// RECIPE_GH_BASE points fetchGh at it, so these tests never touch the network.
// URL shape: /<user>/<repo>/HEAD/<file>  (bare gh:u/r defaults <file> to recipe.md).
// The CLI is spawned with async execFile — execFileSync would block this process's
// event loop and deadlock the in-process server (parent can't accept the child's socket).
function runAsync(cwd, extraEnv, ...args) {
  return new Promise((resolve, reject) => {
    execFile(
      process.execPath,
      [CLI, ...args],
      { cwd, encoding: 'utf8', env: { ...process.env, HOME: cwd, USERPROFILE: cwd, ...extraEnv } },
      (err, stdout, stderr) => {
        if (err) {
          err.stdout = stdout;
          err.stderr = stderr;
          return reject(err);
        }
        resolve(stdout);
      }
    );
  });
}

async function withGhServer(fixtures, fn) {
  const server = http.createServer((req, res) => {
    const body = fixtures[req.url];
    if (body === undefined) {
      res.statusCode = 404;
      res.end('not found');
      return;
    }
    res.statusCode = 200;
    res.end(body);
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  try {
    return await fn(`http://127.0.0.1:${server.address().port}`);
  } finally {
    server.close();
  }
}

async function assertRejects(promise, stderrRe) {
  try {
    await promise;
    assert.fail('expected the command to exit nonzero');
  } catch (e) {
    assert.equal(e.code, 1);
    if (stderrRe) assert.match(String(e.stderr), stderrRe);
  }
}

test('gh: relative extends fetches a sibling in the same repo', async () => {
  const dir = tmpDir();
  run(dir, 'init');
  await withGhServer(
    {
      '/u/r/HEAD/child.md': '---\nname: ghchild\nextends: [./core.md]\n---\n\n## [ui] design\nchild design\n',
      '/u/r/HEAD/core.md': '---\nname: ghcore\n---\n\n## [always] base\ncore base body\n',
    },
    async (base) => {
      await runAsync(dir, { RECIPE_GH_BASE: base }, 'use', 'gh:u/r/child.md');
      const flat = fs.readFileSync(path.join(dir, '.claude', 'recipes', 'ghchild.md'), 'utf8');
      assert.match(flat, /core base body/); // parent sibling merged in
      assert.match(flat, /child design/);
    }
  );
});

test('gh: relative extends that escapes the repo is a bad ref', async () => {
  const dir = tmpDir();
  run(dir, 'init');
  await withGhServer(
    { '/u/r/HEAD/child.md': '---\nname: ghchild\nextends: [../../escape.md]\n---\n\n## [ui] design\nx\n' },
    (base) => assertRejects(runAsync(dir, { RECIPE_GH_BASE: base }, 'use', 'gh:u/r/child.md'), /bad ref/i)
  );
});

test('gh: cross-form self-extends (gh:u/r ≡ gh:u/r/recipe.md) is caught as circular', async () => {
  const dir = tmpDir();
  run(dir, 'init');
  await withGhServer(
    { '/u/r/HEAD/recipe.md': '---\nname: ghc\nextends: [gh:u/r]\n---\n\n## [always] x\nbody\n' },
    (base) => assertRejects(runAsync(dir, { RECIPE_GH_BASE: base }, 'use', 'gh:u/r/recipe.md'), /circular/i)
  );
});

test('gh: diamond extends resolves (not a false cycle)', async () => {
  const dir = tmpDir();
  run(dir, 'init');
  await withGhServer(
    {
      '/u/r/HEAD/r.md': '---\nname: ghr\nextends: [./a.md, ./b.md]\n---\n\n## [always] r\nr body\n',
      '/u/r/HEAD/a.md': '---\nname: gha\nextends: [./c.md]\n---\n\n## [ui] a\na body\n',
      '/u/r/HEAD/b.md': '---\nname: ghb\nextends: [./c.md]\n---\n\n## [stack] b\nb body\n',
      '/u/r/HEAD/c.md': '---\nname: ghc\n---\n\n## [always] x\nbase body\n',
    },
    async (base) => {
      await runAsync(dir, { RECIPE_GH_BASE: base }, 'use', 'gh:u/r/r.md');
      const flat = fs.readFileSync(path.join(dir, '.claude', 'recipes', 'ghr.md'), 'utf8');
      assert.match(flat, /a body/);
      assert.match(flat, /b body/);
      assert.match(flat, /r body/);
      assert.match(flat, /base body/); // shared grandparent merged once
    }
  );
});
