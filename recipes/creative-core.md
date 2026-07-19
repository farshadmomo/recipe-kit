---
name: creative-core
version: 1.0.0
author: farshadmomo
description: Base recipe every cookbook style extends — house response rules, concept-transfer, the creative-risk mandate, and the project-start ritual
requires:
  # the only two mandatory skills — every recipe that extends this inherits them
  caveman: claude plugin marketplace add JuliusBrussee/caveman && claude plugin install caveman@caveman
  ponytail: claude plugin marketplace add DietrichGebert/ponytail && claude plugin install ponytail@ponytail
---

## [always] responses
MUST use /caveman for status updates and routine replies, /ponytail for code — house rules; smallest working diff, reuse before writing, stdlib/platform before libraries. When explaining design rationale or answering a judgment question, clarity outranks compression — drop caveman and answer plainly.
Those two are the only mandatory skills. Every other skill this recipe names is optional reference, not a gate: open one when you expect it to change the result — an API you’d otherwise guess at, a domain where being wrong is expensive — and skip it when your own knowledge already covers the job. A build that invokes zero skills is normal, often the best-value one; the work is judged on what ships, not on which skills were opened. Never invoke a skill as ceremony, and never copy a skill’s example layouts or palettes — design from this recipe’s taste through your own judgment.

## [always] transfer
This concept is the default, not a cage: when the user asks for a different concept or aesthetic, their request wins — keep the craft bar, the creative-risk rule, and the spirit of the bans, rebuild the identity around THEIR concept, and never land on the generic AI-site look (purple gradients, emoji section headers, glass cards, cookie-cutter grids).

## [always] creativity
Creative risk is a requirement, not a bonus. Every build gets at least one signature moment no template would have — an interaction, layout break, or detail someone would screenshot and share. If a layout or component is the first thing you'd produce by default, discard it and take your second, stranger idea. The recipe's vibe is a starting point to push past, not a ceiling. Bold beats safe; specific beats generic; weird-but-intentional beats polished-but-forgettable.

## [stack] kickoff
Project-start ritual — ONLY if DESIGN.md does not exist; skip once it does. Produce 3 concept directions that differ on every axis: layout system, type pairing, palette, motion concept, signature interaction. Present each as a compact sheet with the one moment someone would screenshot. No two directions may share an axis value. Ask the user to pick (if unattended, pick the riskier one). Write the winner into DESIGN.md as the design contract — later prompts follow it and never drift back to defaults.

## [testing] check-rule
Per /ponytail: one runnable check per non-trivial logic — the smallest thing that fails if the logic breaks. No test frameworks beyond what's already present, no snapshot suites; verify motion and interaction by driving the real page, never by unit-testing tweens.
