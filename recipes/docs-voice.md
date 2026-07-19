---
name: docs-voice
version: 1.0.0
author: farshadmomo
description: Documentation & prose house style — plain human voice, AI-tells banned, docs that respect the reader's time
extends: [./creative-core.md]
---

## [always] vibe
Prose that sounds like a competent human wrote it for one specific reader — not a content model filling a word count. Lead with the point; the reader is busy and already scrolling. Short declarative sentences, concrete nouns, active voice, second person for instructions. Show the thing (a real command, a real snippet, a real screenshot) instead of describing that it exists. Banned outright — the AI tells: "delve", "seamless(ly)", "robust", "leverage", "utilize" (say "use"), "unleash", "elevate", "in today's fast-paced world", "it's important to note", "at the end of the day", "navigate the complexities", em-dash-and-rephrase padding, a summary paragraph that restates the intro, emoji as section headers, and bullet-splosion (a wall of bullets where two sentences would connect the ideas better). Also banned: hedging every claim ("might possibly help in some cases"), and the false-friendly opener ("Great question!"). The signature discipline is subtraction — the second draft is the first draft minus 20%, and it reads better every time.

## [stack] kickoff
Project-start ritual — ONLY if VOICE.md does not exist; skip once it does. Before writing any real docs, pin the voice contract: (1) the reader — who they are, what they already know, what they came to accomplish; (2) person and tense (default: second person, present, active); (3) the terminology table — the ONE canonical name for each concept, and the near-synonyms it must never drift into; (4) the banned-words list (start from the vibe's, add the project's own tells); (5) one gold-standard example paragraph in the target voice that every later page is measured against. Write it all into VOICE.md as the contract — every doc conforms, and a reviewer can point at a line and say "not our voice" with the file open.

## [docs] structure
Follow VOICE.md. Structure by the reader's task, not the software's architecture — the page order is the order someone does the thing, not the order your modules import each other. Every how-to opens with what the reader will have when they finish and what they need before starting. One concept per heading; headings are specific and scannable ("Configure the webhook secret", not "Configuration"). Code samples are complete and runnable — copy-paste works, no `...` hiding the important line, no undeclared variables. Prefer a worked example over an abstract description; prefer a table over prose when comparing options. Link the next step; never dead-end a reader. Keep a real information hierarchy (tutorial vs how-to vs reference vs explanation are different genres — don't blend them on one page).

## [copy] microcopy
UI and doc microcopy in the same voice: buttons are the verb of what happens ("Delete project", not "Submit"). Empty states say why it's empty and the one action that fills it. Errors state what went wrong and the fix, in one plain line — never "An error occurred". Tooltips add information the label can't fit, never repeat the label. Placeholder text is an example, not an instruction. Confirmations name the specific object and are honest about reversibility ("Delete `prod-db`? This can't be undone."). No exclamation marks in chrome, no cutesy 404 poetry unless the brand genuinely earns it.

## [testing] checks
The runnable parts of docs get checked like code, because they are: every code sample must actually execute (extract and run them in CI, or write them as tested files the docs include), and every internal link must resolve (a link checker in CI). A prose linter catches the banned-words list from VOICE.md on every commit — the tells come back the moment nobody's watching. Read the finished page aloud once; anything you'd never say to a colleague gets cut.
