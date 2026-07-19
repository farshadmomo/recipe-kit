---
name: cli-honest
version: 1.0.0
author: farshadmomo
description: Command-line tool house style — Unix-honest, --help as the front door, pipeable output, exit codes that mean something
extends: [./creative-core.md]
routes:
  cli: [cli, terminal, command, flag, subcommand, tui, stdout, stderr, exit code, help, prompt, shell, argv]
  copy: [copy, text, message, wording, help, usage, error, hint, label]
skills:
  # per-prompt nudge — when a channel fires, the hook names these for that prompt
  ui: [ui-ux-pro-max, frontend-design, impeccable]
requires:
  ui-ux-pro-max: claude plugin marketplace add nextlevelbuilder/ui-ux-pro-max-skill && claude plugin install ui-ux-pro-max@ui-ux-pro-max-skill
  frontend-design: claude plugin marketplace add anthropics/claude-plugins-official && claude plugin install frontend-design@claude-plugins-official
  impeccable: claude plugin marketplace add pbakaus/impeccable && claude plugin install impeccable@impeccable
---

## [always] vibe
A CLI is a conversation in a language the user already speaks, so speak it fluently: follow Unix convention instead of inventing your own dialect. The terminal is honest — there's no chrome to hide behind, every character on the line is doing work or wasting the user's attention. Output that a human reads is friendly; output a pipe reads is clean data, and the tool knows which is which (color and spinners to stderr and only when stdout is a TTY, plain machine-readable text when it's piped). The signature artifact is `--help`: it's the front door, the docs most users ever read, and it should be so clear that someone can use the tool correctly from `--help` alone — usage line, grouped flags with real one-line descriptions, two or three copy-pasteable examples of actual use. Banned: swallowing errors and exiting 0, progress bars written to stdout, color codes leaking into pipes, a wall of emoji, "Loading..." with no way to tell it's stuck, flags that do nothing without a value silently, and a --help that just dumps the source of truth nobody structured.

## [cli] interface
Unix conventions, not house inventions: `-h/--help` and `--version` always; long flags with short aliases for the common ones; `--` ends flag parsing; read from stdin when no file arg and stdin is piped; `-` means stdin/stdout explicitly. Exit codes carry meaning — 0 success, non-zero failure, and distinct codes for distinct failure classes a script might branch on (document them). Errors go to stderr with a clear message and, when useful, the fix or the flag that would have helped; never a raw stack trace unless `--debug`. Everything a human does interactively must also be scriptable non-interactively (a `--yes`/`--json`/env-var path) — a prompt with no non-interactive escape hatch breaks automation. Respect `NO_COLOR`, `--no-color`, and non-TTY. Subcommands are verbs under a noun tool (`tool build`, `tool deploy`); keep the tree shallow and discoverable. Long operations show progress on stderr and stay quiet on success (`--verbose` opts into more) — the well-behaved tool that succeeds says nothing.

## [ui] design
For any web surface (landing page, docs site, generated help): craft reference if you want it — /ui-ux-pro-max and /frontend-design, with an /impeccable pass on finished sections. Follow DESIGN.md if it exists. The hero is the install command and one real invocation, copyable, above the fold — that's the pitch. Show the tool as it actually appears: a real terminal capture with real output, monospace, honest colors, never a faked pretty screenshot. Docs are task-ordered and every code block is a complete, runnable command. The text UI itself is design too: align columns, group related flags, use whitespace in help output the way a print layout uses margins. Full a11y on any web surface — semantic structure, focus states, contrast.

## [copy] voice
Terse and exact, the register of a good man page: say what the command does, what it needs, what it returns. Help descriptions are one line, imperative, no marketing ("Publish the build to the registry", not "Effortlessly ship your amazing build"). Error messages name what failed and the next move ("config not found — run `tool init` first"). Hints are earned, not chatty. No exclamation marks, no "simply", no "just" (if it were simple they wouldn't be reading the error).

## [stack] tech
Match the ecosystem the tool ships into (a Node CLI in npm, a Go binary for a single static file, Rust/Python where the users live). Use the platform's real arg parser rather than hand-rolling flag parsing — correct `--` handling, aliases, and help generation are exactly what you should not reinvent. Ship `--help` and `--version` from the parser, single-binary or single-command install where possible, and no runtime dependency the user has to install first. Test the tool as a black box: run it, assert stdout/stderr/exit code.

## [testing] checks
Argument parsing and exit codes get the checks first: run the built command as a subprocess and assert on stdout, stderr, and exit code for the happy path, a bad-flag path (non-zero, message on stderr), and the piped/non-TTY path (clean data, no color codes). Verify `--help` and `--version` exit 0 and print. One golden-output check on the primary command catches accidental format drift that would break someone's script.
