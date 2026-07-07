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
  const commands = { init };
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

main().catch((e) => {
  console.error(`recipe: ${e.message}`);
  process.exit(1);
});
