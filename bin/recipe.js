#!/usr/bin/env node
'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');

const RECIPES_DIR = path.join('.claude', 'recipes');
const HOOK_DIR = path.join('.claude', 'hooks', 'recipe');
const HOOK_CMD = 'node "${CLAUDE_PROJECT_DIR:-.}/.claude/hooks/recipe/recipe-hook.js"';
const SRC = path.join(__dirname, '..', 'src');

async function main() {
  const [cmd, ...rest] = process.argv.slice(2);
  const arg = rest.join(' ');
  const commands = { init, use, list, off, new: scaffold, test: testPrompt, reload, setup };
  if (!cmd || !Object.hasOwn(commands, cmd)) {
    console.log('usage: recipe <init | use <ref> | list | off | new | test <prompt> | reload | setup [--yes]>');
    process.exit(cmd ? 1 : 0);
  }
  await commands[cmd](arg);
}

function init() {
  fs.mkdirSync(RECIPES_DIR, { recursive: true });
  fs.mkdirSync(HOOK_DIR, { recursive: true });
  for (const f of ['parser.js', 'router.js', 'recipe-hook.js']) {
    fs.copyFileSync(path.join(SRC, f), path.join(HOOK_DIR, f));
  }
  const settingsPath = path.join('.claude', 'settings.json');
  const settings = fs.existsSync(settingsPath)
    ? JSON.parse(fs.readFileSync(settingsPath, 'utf8'))
    : {};
  settings.hooks = settings.hooks || {};
  settings.hooks.UserPromptSubmit = settings.hooks.UserPromptSubmit || [];
  // migrate stale installs: drop old-format recipe hook commands, keep everything else
  for (const e of settings.hooks.UserPromptSubmit) {
    e.hooks = (e.hooks || []).filter(
      (h) => !(String(h.command || '').includes('.claude/hooks/recipe/recipe-hook.js') && h.command !== HOOK_CMD)
    );
  }
  const entries = (settings.hooks.UserPromptSubmit = settings.hooks.UserPromptSubmit.filter(
    (e) => e.hooks.length > 0
  ));
  const installed = entries.some((e) =>
    (e.hooks || []).some((h) => h.command === HOOK_CMD)
  );
  if (!installed) entries.push({ hooks: [{ type: 'command', command: HOOK_CMD }] });
  fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2) + '\n');
  console.log('recipe: hook installed. Next: recipe use <gh:user/repo | ./file.md>');
}

async function use(ref) {
  if (!ref) throw new Error('usage: recipe use <gh:user/repo[/path] | ./file.md>');
  const recipe = await resolveRecipe(ref, process.cwd(), new Set());
  const { serializeRecipe } = require('../src/parser');
  fs.mkdirSync(RECIPES_DIR, { recursive: true });
  const file = `${recipe.meta.name}.md`;
  fs.writeFileSync(path.join(RECIPES_DIR, file), serializeRecipe(recipe));
  fs.writeFileSync(path.join(RECIPES_DIR, 'active'), file + '\n');
  const source = ref.startsWith('gh:') ? ref : path.resolve(process.cwd(), ref);
  fs.writeFileSync(path.join(RECIPES_DIR, 'source'), source + '\n');
  console.log(`recipe: ${recipe.meta.name} active`);
  const missing = missingSkills(recipe.meta.requires || {});
  if (missing.length) {
    console.log(`⚠ ${missing.length} required skill(s) not installed: ${missing.map(([n]) => n).join(', ')}`);
    console.log('  run: recipe setup');
  }
}

// installed if SKILL.md exists directly, or as an installed plugin's skill.
function skillInstalled(name) {
  if (process.env.RECIPE_SKILLS_DIRS) {
    return process.env.RECIPE_SKILLS_DIRS.split(path.delimiter)
      .some((dir) => fs.existsSync(path.join(dir, name, 'SKILL.md')));
  }
  const roots = [
    path.join('.claude', 'skills', name),
    path.join(os.homedir(), '.claude', 'skills', name),
  ];
  if (roots.some((r) => fs.existsSync(path.join(r, 'SKILL.md')))) return true;
  try {
    // cache layout: <marketplace>/<plugin>/<version>/skills/<name>/SKILL.md
    const cacheDir = path.join(os.homedir(), '.claude', 'plugins', 'cache');
    for (const marketplace of fs.readdirSync(cacheDir, { withFileTypes: true })) {
      if (!marketplace.isDirectory()) continue;
      const mpDir = path.join(cacheDir, marketplace.name);
      for (const plugin of fs.readdirSync(mpDir, { withFileTypes: true })) {
        if (!plugin.isDirectory()) continue;
        const pluginDir = path.join(mpDir, plugin.name);
        for (const version of fs.readdirSync(pluginDir, { withFileTypes: true })) {
          if (!version.isDirectory()) continue;
          // some plugins keep skills under skills/, others under .claude/skills/
          for (const sub of ['skills', path.join('.claude', 'skills')]) {
            if (fs.existsSync(path.join(pluginDir, version.name, sub, name, 'SKILL.md'))) return true;
          }
        }
      }
    }
  } catch {} // missing/unreadable plugin cache is not an error
  return false;
}

function missingSkills(requires) {
  return Object.entries(requires).filter(([name]) => !skillInstalled(name));
}

function setup(arg) {
  const { activeRecipeFile } = require('../src/recipe-hook');
  const { parseRecipe } = require('../src/parser');
  const file = activeRecipeFile(process.cwd());
  if (!file || !fs.existsSync(file)) {
    console.log('recipe: no active recipe');
    return;
  }
  const recipe = parseRecipe(fs.readFileSync(file, 'utf8'));
  const missing = missingSkills(recipe.meta.requires || {});
  if (!missing.length) {
    console.log('recipe: all required skills installed');
    return;
  }
  for (const [name, cmd] of missing) console.log(`  ${name}  →  ${cmd}`);
  if (arg !== '--yes') {
    console.log('re-run with --yes to execute these commands');
    return;
  }
  // commands come straight from the recipe file — always printed before
  // execution so the user sees exactly what runs (consent surface).
  for (const [name, cmd] of missing) {
    console.log(`recipe: installing ${name}: ${cmd}`);
    try {
      require('child_process').execSync(cmd, { stdio: 'inherit', shell: true });
    } catch {
      console.log(`recipe: install failed for ${name} — stopping`);
      process.exit(1);
    }
  }
}

async function reload() {
  const src = path.join(RECIPES_DIR, 'source');
  if (!fs.existsSync(src)) throw new Error('no source recorded — run: recipe use <ref>');
  await use(fs.readFileSync(src, 'utf8').trim());
}

function testPrompt(prompt) {
  if (!prompt) throw new Error('usage: recipe test <prompt>');
  const { activeRecipeFile } = require('../src/recipe-hook');
  const { parseRecipe } = require('../src/parser');
  const { selectIngredients, skillLine } = require('../src/router');
  const file = activeRecipeFile(process.cwd());
  if (!file || !fs.existsSync(file)) {
    console.log('recipe: no active recipe');
    return;
  }
  const recipe = parseRecipe(fs.readFileSync(file, 'utf8'));
  const picked = new Set(selectIngredients(recipe, prompt));
  console.log(`recipe: ${recipe.meta.name}`);
  for (const i of recipe.ingredients) {
    console.log(`${picked.has(i) ? '+' : '-'} [${i.tag}] ${i.name}`);
  }
  const line = skillLine(recipe, prompt);
  if (line) console.log(line);
}

// Later extends entries override earlier ones; the recipe itself overrides all.
async function resolveRecipe(ref, baseDir, seen) {
  const { parseRecipe, mergeRecipes } = require('../src/parser');
  const key = ref.startsWith('gh:') ? ref : path.resolve(baseDir, ref);
  if (seen.has(key)) throw new Error(`circular extends via ${ref}`);
  seen.add(key);
  let text, nextBase;
  if (ref.startsWith('gh:')) {
    text = await fetchGh(ref);
    nextBase = baseDir; // gh recipes may only extend gh: refs or absolute paths
  } else {
    const abs = path.resolve(baseDir, ref);
    text = fs.readFileSync(abs, 'utf8');
    nextBase = path.dirname(abs);
  }
  const recipe = parseRecipe(text);
  let acc = null;
  for (const parentRef of recipe.meta.extends) {
    const parent = await resolveRecipe(parentRef, nextBase, seen);
    acc = acc ? mergeRecipes(acc, parent) : parent;
  }
  seen.delete(key); // path-based cycle check: keep only the current ancestor chain, so diamonds resolve
  return acc ? mergeRecipes(acc, recipe) : recipe;
}

function fetchGh(ref) {
  const parts = ref.slice(3).split('/');
  if (parts.length < 2) return Promise.reject(new Error(`bad ref: ${ref}`));
  const [user, repo, ...rest] = parts;
  const file = rest.length ? rest.join('/') : 'recipe.md';
  const url = `https://raw.githubusercontent.com/${user}/${repo}/HEAD/${file}`;
  return new Promise((resolve, reject) => {
    require('https')
      .get(url, (res) => {
        if (res.statusCode !== 200) {
          res.resume();
          return reject(new Error(`${ref} → HTTP ${res.statusCode} (${url})`));
        }
        let data = '';
        res.on('data', (c) => (data += c));
        res.on('end', () => resolve(data));
      })
      .on('error', reject);
  });
}

function list() {
  if (!fs.existsSync(RECIPES_DIR)) {
    console.log('recipe: none installed (run: recipe init)');
    return;
  }
  const ptr = path.join(RECIPES_DIR, 'active');
  const active = fs.existsSync(ptr) ? fs.readFileSync(ptr, 'utf8').trim() : null;
  const files = fs.readdirSync(RECIPES_DIR).filter((f) => f.endsWith('.md'));
  if (!files.length) {
    console.log('recipe: none installed');
    return;
  }
  for (const f of files) console.log(`${f === active ? '* ' : '  '}${f}`);
}

function off() {
  const ptr = path.join(RECIPES_DIR, 'active');
  if (fs.existsSync(ptr)) fs.unlinkSync(ptr);
  console.log('recipe: off');
}

function scaffold() {
  if (fs.existsSync('recipe.md')) throw new Error('recipe.md already exists');
  fs.writeFileSync('recipe.md', TEMPLATE);
  console.log('recipe: recipe.md created — edit it, then: recipe use ./recipe.md');
}

const TEMPLATE = `---
name: my-recipe
version: 0.1.0
author: you
description: Creative web builds — bold design, smooth motion, minimal code
# skills: channel → names. When a channel fires, the hook appends one line
# suggesting exactly these skills for that prompt (never forced).
skills:
  ui: [ui-ux-pro-max, frontend-design]
  animation: [gsap-react, gsap-performance, animejs]
# requires:            # optional: skills this recipe leans on → install commands
#   caveman: <install command>
---

## [always] responses
MUST use /caveman for responses and /ponytail for code — non-negotiable house rules.
Those two are the only mandatory skills. Every other skill this recipe names is optional reference, not a gate: open one when you expect it to change the result, skip it when your own knowledge covers the job — a build that invokes zero skills is normal. Never copy a skill's example layouts, palettes, or components; creative decisions are always yours.

## [always] creativity
Creative risk is required: every build gets at least one signature moment no template would have. If a layout or component is your first default instinct, discard it and take the second, stranger idea. Bold beats safe; specific beats generic.

## [ui] design
CONSULT /ui-ux-pro-max and /frontend-design for craft, then design from your own taste.

## [animation] motion
Creative choreography is yours — invent the moves, with the lightest tool that hits 60fps. GSAP + Lenis for scroll, /animejs for micro-interactions — defaults, not dogma. If GSAP lands, correct setup/cleanup and a pre-ship performance pass are on you (/gsap-react and /gsap-performance are the reference). Always respect prefers-reduced-motion.

## [stack] tech
Next.js + Tailwind CSS. No UI kits — custom components only.
`;

main().catch((e) => {
  console.error(`recipe: ${e.message}`);
  process.exit(1);
});
