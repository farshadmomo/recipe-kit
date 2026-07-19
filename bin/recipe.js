#!/usr/bin/env node
'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');

const RECIPES_DIR = path.join('.claude', 'recipes');
const HOOK_DIR = path.join('.claude', 'hooks', 'recipe');
const HOOK_CMD = 'node "${CLAUDE_PROJECT_DIR:-.}/.claude/hooks/recipe/recipe-hook.js"';
const SRC = path.join(__dirname, '..', 'src');
const { resolveRecipe, ghDir, rebaseGh } = require('../src/resolver');

async function main() {
  const [cmd, ...rest] = process.argv.slice(2);
  const arg = rest.join(' ');
  const commands = { init, use, list, off, new: scaffold, test: testPrompt, lint, reload, setup, discover, export: exportRecipe };
  if (!cmd || !Object.hasOwn(commands, cmd)) {
    console.log('usage: recipe <init | use <ref> | list | off | new | test <prompt> | lint [ref] | discover | export [--out file] | reload | setup [--yes]>');
    process.exit(cmd ? 1 : 0);
  }
  // rest (raw arg array) lets export read --out; other commands ignore it.
  await commands[cmd](arg, rest);
}

function init() {
  fs.mkdirSync(RECIPES_DIR, { recursive: true });
  fs.mkdirSync(HOOK_DIR, { recursive: true });
  // resolver.js rides along so the hook can auto-reload edited local sources.
  for (const f of ['parser.js', 'router.js', 'recipe-hook.js', 'resolver.js']) {
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
  const recipe = await resolveRecipe(ref, process.cwd(), new Set(), fetchGh);
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

// Static-analyze a recipe: explicit ref → full resolve (extends + gh:); else the
// active flattened recipe; else ./recipe.md. Errors (unroutable tag/channel, bad
// requires) exit 1; warnings never do. Errors print to stderr, warnings to stdout.
async function lint(ref) {
  const { parseRecipe } = require('../src/parser');
  const { DEFAULT_ROUTES } = require('../src/router');
  let recipe;
  if (ref) {
    recipe = await resolveRecipe(ref, process.cwd(), new Set(), fetchGh);
  } else {
    const { activeRecipeFile } = require('../src/recipe-hook');
    const active = activeRecipeFile(process.cwd());
    const file = active && fs.existsSync(active) ? active : fs.existsSync('recipe.md') ? 'recipe.md' : null;
    if (!file) {
      console.log('recipe: nothing to lint (no ref, no active recipe, no ./recipe.md)');
      return;
    }
    recipe = parseRecipe(fs.readFileSync(file, 'utf8'));
  }

  const routes = { ...DEFAULT_ROUTES, ...(recipe.meta.routes || {}) };
  const skills = recipe.meta.skills || {};
  const requires = recipe.meta.requires || {};
  const errors = [];
  const warnings = [];

  for (const i of recipe.ingredients) {
    if (i.tag !== 'always' && !routes[i.tag]) {
      errors.push(`ingredient [${i.tag}] "${i.name}" has no route — it can never inject`);
    }
  }
  for (const ch of Object.keys(skills)) {
    if (ch !== 'always' && !routes[ch]) errors.push(`skills channel "${ch}" has no route`);
  }
  for (const [name, cmd] of Object.entries(requires)) {
    if (typeof cmd !== 'string' || !cmd.trim()) {
      errors.push(`requires "${name}" has an empty or non-string install command`);
    }
  }

  for (const [ch, names] of Object.entries(skills)) {
    for (const n of names) {
      if (!Object.hasOwn(requires, n)) warnings.push(`skill "${n}" (channel "${ch}") is not in requires:`);
    }
  }
  const alwaysWords = recipe.ingredients
    .filter((i) => i.tag === 'always')
    .reduce((n, i) => n + i.body.split(/\s+/).filter(Boolean).length, 0);
  if (alwaysWords > 500) {
    warnings.push(`[always] bodies total ${alwaysWords} words — they ride every prompt, keep them lean`);
  }
  const seen = new Set();
  for (const i of recipe.ingredients) {
    if (seen.has(i.name)) warnings.push(`duplicate ingredient name "${i.name}"`);
    seen.add(i.name);
  }
  // dead route: only channels the recipe itself declares (not defaults) with no
  // [tag] ingredient and no skills: entry to fire them.
  const tags = new Set(recipe.ingredients.map((i) => i.tag));
  for (const ch of Object.keys(recipe.meta.routes || {})) {
    if (!tags.has(ch) && !skills[ch]) warnings.push(`route "${ch}" fires nothing — no [${ch}] ingredient or skills: entry`);
  }

  for (const e of errors) console.error(`error: ${e}`);
  for (const w of warnings) console.log(`warn: ${w}`);
  if (!errors.length && !warnings.length) console.log(`recipe: ${recipe.meta.name} — clean`);
  if (errors.length) process.exit(1);
}

// Curated words deliberately NOT in any route, grouped by the channel they'd
// belong to. discover suggests promoting them when they recur in prompts that
// currently fire nothing.
const SYNONYMS = {
  ui: ['screen', 'view', 'widget', 'panel', 'interface'],
  animation: ['bounce', 'slide', 'fade', 'spin', 'wiggle'],
  backend: ['login', 'signup', 'query', 'route', 'storage'],
  testing: ['verify', 'check', 'assert'],
  copy: ['reword', 'phrase', 'rewrite'],
  docs: ['explain', 'document'],
};

// Offline route-tuning report: replay this project's past prompts against the
// active recipe's routes and show what fired, what didn't, and which near-miss
// keywords keep showing up. ponytail: the whole feature is a word-frequency
// heuristic over local transcripts — no LLM, no network.
function discover() {
  const { hit } = require('../src/router');
  const slug = process.cwd().replace(/[^A-Za-z0-9]/g, '-');
  const dir = path.join(os.homedir(), '.claude', 'projects', slug);
  if (!fs.existsSync(dir)) {
    console.log('recipe: no transcripts found for this project');
    return;
  }
  const { activeRecipeFile } = require('../src/recipe-hook');
  const { parseRecipe } = require('../src/parser');
  const { DEFAULT_ROUTES } = require('../src/router');
  const file = activeRecipeFile(process.cwd());
  if (!file || !fs.existsSync(file)) {
    console.log('recipe: no active recipe — run: recipe use <ref>');
    return;
  }
  const recipe = parseRecipe(fs.readFileSync(file, 'utf8'));
  const routes = { ...DEFAULT_ROUTES, ...recipe.meta.routes };
  const channels = [...new Set(recipe.ingredients.map((i) => i.tag).filter((t) => t !== 'always'))];

  const prompts = [];
  for (const f of fs.readdirSync(dir).filter((f) => f.endsWith('.jsonl'))) {
    for (const line of fs.readFileSync(path.join(dir, f), 'utf8').split(/\r?\n/)) {
      if (!line.trim()) continue;
      let obj;
      try { obj = JSON.parse(line); } catch { continue; }
      if (obj.type !== 'user' || obj.isMeta) continue;
      const c = obj.message && obj.message.content;
      let text = typeof c === 'string'
        ? c
        : Array.isArray(c)
          ? c.filter((p) => p && p.type === 'text').map((p) => p.text).join(' ')
          : '';
      text = text.trim();
      if (!text || text.startsWith('<') || text.startsWith('/')) continue;
      prompts.push(text);
    }
  }

  const fired = Object.fromEntries(channels.map((ch) => [ch, 0]));
  const zeroFire = [];
  for (const text of prompts) {
    let any = false;
    for (const ch of channels) {
      if (hit(routes, ch, text)) { fired[ch]++; any = true; }
    }
    if (!any) zeroFire.push(text);
  }

  console.log(`recipe: ${recipe.meta.name}`);
  console.log(`${prompts.length} prompts scanned`);
  for (const ch of channels) {
    const pct = prompts.length ? Math.round((fired[ch] / prompts.length) * 100) : 0;
    console.log(`  ${ch}: fired ${fired[ch]} (${pct}%)`);
  }
  console.log(`${zeroFire.length} prompts fired nothing beyond [always]`);

  // Near-miss: which off-route words recur in zero-fire prompts?
  const counts = {}; // ch -> { word -> n }
  const snippets = [];
  for (const text of zeroFire) {
    let near = false;
    for (const ch of Object.keys(SYNONYMS)) {
      if (!hit(SYNONYMS, ch, text)) continue;
      near = true;
      counts[ch] = counts[ch] || {};
      for (const w of SYNONYMS[ch]) {
        if (hit({ _: [w] }, '_', text)) counts[ch][w] = (counts[ch][w] || 0) + 1;
      }
    }
    if (near && snippets.length < 10) snippets.push(text.slice(0, 80));
  }
  if (snippets.length) {
    console.log('\nnear-misses (prompts that fired nothing but mention off-route keywords):');
    for (const s of snippets) console.log(`  · ${s}`);
  }
  for (const ch of Object.keys(counts)) {
    const words = Object.entries(counts[ch])
      .filter(([, n]) => n >= 2)
      .sort((a, b) => b[1] - a[1])
      .map(([w]) => w);
    if (words.length) console.log(`suggest: routes.${ch} += ${words.join(', ')}`);
  }
}

// Flatten the active recipe to plain markdown — every ingredient, no routing,
// no <recipe> wrapper, no skill line — for pasting into AGENTS.md / Cursor rules.
function exportRecipe(arg, rest) {
  const { activeRecipeFile } = require('../src/recipe-hook');
  const { parseRecipe } = require('../src/parser');
  const file = activeRecipeFile(process.cwd());
  if (!file || !fs.existsSync(file)) {
    console.log('recipe: no active recipe');
    return;
  }
  const recipe = parseRecipe(fs.readFileSync(file, 'utf8'));
  const lines = [`# ${recipe.meta.name}`];
  if (recipe.meta.description) lines.push('', recipe.meta.description);
  for (const i of recipe.ingredients) lines.push('', `## ${i.name}`, '', i.body);
  const md = lines.join('\n') + '\n';
  const outIdx = rest.indexOf('--out');
  const out = outIdx >= 0 ? rest[outIdx + 1] : null;
  if (out) {
    fs.writeFileSync(out, md);
    console.log(`recipe: exported to ${out}`);
  } else {
    process.stdout.write(md);
  }
}

function fetchGh(ref) {
  const parts = ref.slice(3).split('/');
  if (parts.length < 2) return Promise.reject(new Error(`bad ref: ${ref}`));
  const base = process.env.RECIPE_GH_BASE || 'https://raw.githubusercontent.com';
  const [user, repo, ...rest] = parts;
  const file = rest.length ? rest.join('/') : 'recipe.md';
  const url = `${base}/${user}/${repo}/HEAD/${file}`;
  const httpMod = url.startsWith('https:') ? require('https') : require('http');
  return new Promise((resolve, reject) => {
    httpMod
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

if (require.main === module) {
  main().catch((e) => {
    console.error(`recipe: ${e.message}`);
    process.exit(1);
  });
}

module.exports = { resolveRecipe, fetchGh, ghDir, rebaseGh };
