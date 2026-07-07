#!/usr/bin/env node
'use strict';
const fs = require('fs');
const path = require('path');

const RECIPES_DIR = path.join('.claude', 'recipes');
const HOOK_DIR = path.join('.claude', 'hooks', 'recipe');
const HOOK_CMD = 'node .claude/hooks/recipe/recipe-hook.js';
const SRC = path.join(__dirname, '..', 'src');

async function main() {
  const [cmd, arg] = process.argv.slice(2);
  const commands = { init, use, list, off, new: scaffold };
  if (!commands[cmd]) {
    console.log('usage: recipe <init | use <ref> | list | off | new>');
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
  const entries = (settings.hooks.UserPromptSubmit = settings.hooks.UserPromptSubmit || []);
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
  console.log(`recipe: ${recipe.meta.name} active`);
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
description: What this recipe is for
---

## [always] responses
House rules that ride every prompt.

## [ui] design
Directives injected when the prompt is about UI.

## [animation] motion
Directives injected when the prompt is about animation.

## [stack] tech
Your stack choices, injected when building things.
`;

main().catch((e) => {
  console.error(`recipe: ${e.message}`);
  process.exit(1);
});
