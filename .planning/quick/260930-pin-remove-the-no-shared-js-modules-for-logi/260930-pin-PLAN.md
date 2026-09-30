---
phase: quick-260930-pin
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - "CLAUDE.md"
  - ".planning/PROJECT.md"
  - ".planning/codebase/ARCHITECTURE.md"
  - ".planning/codebase/CONVENTIONS.md"
  - ".claude/CLAUDE.md"
autonomous: true
requirements: [QUICK-260930-pin]

estimate:
  tokens: 32000
  raw_tokens: 16000
  tasks: 3
  confidence: low

must_haves:
  truths:
    - "Root CLAUDE.md's number-theory-helper bullet still explains why duplication was originally chosen, but states that duplication is the default rather than a prohibition, and that a shared JS logic module under `assets/` is allowed."
    - "The Architecture constraint bullet in .planning/PROJECT.md permits shared JS logic modules under `assets/`, not only shared site chrome."
    - ".planning/codebase/ARCHITECTURE.md's `Dependency isolation` constraint and its `Copy-Paste Math Functions` anti-pattern remedy both state the duplication rule is no longer hard."
    - ".planning/codebase/CONVENTIONS.md's Import Organization bullet says math helpers are duplicated per-file *by default*, with a shared JS logic module permitted."
    - ".claude/CLAUDE.md's three constraint lines are byte-identical to their generation sources (PROJECT.md line for Architecture, CONVENTIONS.md line for math utilities, ARCHITECTURE.md line for Dependency isolation), so a future `/gsd-docs-update` regeneration cannot revert the policy change."
    - "No tool `.html` file is modified and no file is created or changed under `assets/` — this change is documentation wording only."
    - "The historical rationale for duplication survives in every edited file; no `Why it's wrong` / maintenance-burden explanation is deleted."
  artifacts:
    - "CLAUDE.md (final `Working with this codebase` bullet reworded)"
    - ".planning/PROJECT.md (Context `Repo convention` bullet + Constraints `Architecture` bullet reworded)"
    - ".planning/codebase/ARCHITECTURE.md (`Dependency isolation` bullet + `Do this instead` paragraph reworded)"
    - ".planning/codebase/CONVENTIONS.md (Import Organization math-utility bullet reworded)"
    - ".claude/CLAUDE.md (three generated mirror lines resynced)"
  key_links:
    - ".claude/CLAUDE.md is machine-generated between GSD markers: lines inside `GSD:project-*` come from .planning/PROJECT.md, `GSD:conventions-*` from .planning/codebase/CONVENTIONS.md, `GSD:architecture-*` from .planning/codebase/ARCHITECTURE.md. Editing .claude/CLAUDE.md alone is NOT sufficient — the source must carry the identical string or the next regeneration restores the old constraint."
    - ".planning/PROJECT.md line 44 and .claude/CLAUDE.md line 14 are currently the SAME sentence. They must stay the same sentence after the edit; Task 3's sync gate diffs them."
    - "The repo is full of historical artifacts (.planning/phases/**, .planning/quick/**, .planning/research/**, STATE.md log rows) that quote the old rule. Those are immutable records of past sessions and are explicitly OUT of scope — rewriting them would falsify the history of why prior tools were built the way they were."
---

<objective>
Retire the "no shared JS modules for logic" rule from this repo's living policy documentation, so that extracting logic into a shared module under `assets/` becomes an allowed engineering choice rather than a prohibited one. The existing per-file duplication stays the documented *default*; it stops being a hard constraint.

Purpose: an upcoming Phase 6 (Multi-Language Support) needs one shared translation dictionary consumed by all ~16 pages. Under the current documented rule a planner is obliged to duplicate every translation string into every tool file, which is the wrong engineering answer for content that must stay identical site-wide. The rule has to move before the phase is planned, or the phase will be planned against the old constraint.

Output: five documentation files reworded. Zero code changes — no tool `.html` touched, no shared module actually created.

**Scope note (why five files, not the three the task names).** `.claude/CLAUDE.md` is GSD-generated between `<!-- GSD:*-start source:... -->` markers. Two of its three constraint statements are verbatim mirrors of `.planning/codebase/CONVENTIONS.md` and `.planning/codebase/ARCHITECTURE.md`; a third mirrors `.planning/PROJECT.md`. Editing only the generated file would leave the old rule in the sources, and the next `/gsd-docs-update` or `/gsd-map-codebase` run would quietly restore it. Additionally, the `Architectural Smell: Copy-Paste Math Functions` section that the task names is heading-only in `.claude/CLAUDE.md` — its actual body prose (which instructs "duplication is intentional, do not extract") lives only in `.planning/codebase/ARCHITECTURE.md`. The two `.planning/codebase/` files are therefore in scope and are the same class of change: documentation wording.

**Explicit non-targets.** Do not touch: any `*.html`; anything under `assets/`; `.planning/phases/**`; `.planning/quick/**` (including this plan's own directory beyond the SUMMARY); `.planning/research/**`; `.planning/STATE.md` narrative rows; `.planning/codebase/CONVENTIONS.md` line ~255 (`**SVG Helper (duplicated per-file):**` — a factual label on a code sample describing current code, not a rule); `.planning/PROJECT.md` line 39's Cayley-milestone clause (`duplicated code, shared visual grammar — not a shared module`) — that is a retrospective record of a decision made for one already-shipped tool, not a repo-wide rule, and Task 1 gates on it surviving unchanged.
</objective>

<execution_context>
@~/.claude/gsd-core/workflows/execute-plan.md
@~/.claude/gsd-core/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/STATE.md
@CLAUDE.md
@.claude/CLAUDE.md
@.planning/codebase/ARCHITECTURE.md
@.planning/codebase/CONVENTIONS.md
</context>

<tasks>

<task type="tracer">
  <name>Task 1: Reword the two human-authored policy docs (CLAUDE.md + PROJECT.md)</name>
  <files>CLAUDE.md, .planning/PROJECT.md</files>
  <reversibility rating="reversible">Prose-only wording change in two tracked markdown files; a single `git revert` restores the prior policy text with no code or data consequence.</reversibility>
  <action>
These two files are the human-authored source of the rule; every other occurrence in the repo is either generated from them or is a historical record. Read both files first so the `Edit` old_string matches exactly — do not retype the current text from this plan.

**Edit 1 — `CLAUDE.md`.** In the `## Working with this codebase` section, the final bullet (currently the last line of the file, beginning `- Number-theory helper functions (primality testing, factorization, modular exponentiation, GCD) are duplicated per-file`) is replaced in full by exactly this bullet:

`- Number-theory helper functions (primality testing, factorization, modular exponentiation, GCD) are duplicated per-file today — a deliberate choice that kept each tool a self-contained single file. That is no longer a hard constraint: a shared JS logic module (under `assets/`, alongside `theme.js`) is allowed when sharing is the better engineering call — for example content that must stay byte-identical across every page, such as a site-wide translation dictionary. Duplication stays the default for a tool's own math helpers; reach for a shared module deliberately, and say so in the commit message.`

Leave the preceding bullets in that section (the no-build-step/browser-verification bullet, the new-tool bullet, and the `assets/palette.css` `var()`-only colour bullet) byte-identical.

**Edit 2 — `.planning/PROJECT.md`, `## Context` section.** The bullet beginning `- Repo convention (see root `CLAUDE.md`): number-theory/algebra helper functions` is replaced in full by exactly this bullet:

`- Repo convention (see root `CLAUDE.md`): number-theory/algebra helper functions (`primeFactors`, `isPrime`, `bigGcd`, `modPowPlain`, `gcd`, `unitsMod`, etc.) are duplicated per-file — originally chosen to keep each tool self-contained, and still the default for a tool's own math helpers. It is no longer a hard rule: a shared JS logic module under `assets/` is permitted when sharing is the better engineering call.`

**Edit 3 — `.planning/PROJECT.md`, `## Constraints` section.** The bullet beginning `- **Architecture**: One top-level directory per tool, one self-contained `.html` file` is replaced in full by exactly this bullet:

`- **Architecture**: One top-level directory per tool, one self-contained `.html` file — new tools must match this. Shared modules under `assets/` are permitted: site chrome (`palette.css`, `site.css`, `theme.js`) is the long-established case, and a shared JS logic module is allowed too when logic genuinely needs to stay identical across pages (e.g. a site-wide translation dictionary). A tool's own math and rendering logic still defaults to living in that tool's own file.`

Record this replacement text verbatim — Task 3 must place the identical sentence into `.claude/CLAUDE.md` and diffs the two.

Do not touch the `**Tech stack**` or `**External resources**` constraint bullets, the `## Out of Scope` bullet about build systems, the Cayley-milestone context bullet that immediately follows Edit 2's bullet, or any row of the Key Decisions table.
  </action>
  <verify>
    <automated>test $(grep -cF 'shared JS logic module' CLAUDE.md) -eq 1 && test $(grep -cF 'unless explicitly asked' CLAUDE.md) -eq 0 && test $(grep -cF 'shared JS logic module' .planning/PROJECT.md) -eq 2 && test $(grep -cF 'one intentional exception' .planning/PROJECT.md) -eq 0 && test $(grep -cF 'not extracted into a shared module' .planning/PROJECT.md) -eq 0 && test $(grep -cF 'duplicated code, shared visual grammar' .planning/PROJECT.md) -eq 1 && test $(grep -cF 'single-file-per-tool pattern is intentional' .planning/PROJECT.md) -eq 1 && test $(git diff --name-only HEAD -- '*.html' | wc -l) -eq 0 && echo T1-OK</automated>
  </verify>
  <done>`CLAUDE.md` and `.planning/PROJECT.md` each permit a shared JS logic module under `assets/`, each still carry the historical reason duplication was chosen, the prohibition phrasing is gone from both, the Cayley-milestone clause and the Out-of-Scope build-system clause are untouched, and no `.html` file changed.</done>
</task>

<task type="auto">
  <name>Task 2: Reword the two codebase-map sources that generate .claude/CLAUDE.md</name>
  <files>.planning/codebase/ARCHITECTURE.md, .planning/codebase/CONVENTIONS.md</files>
  <action>
These are the generation sources for the `GSD:architecture-*` and `GSD:conventions-*` blocks of `.claude/CLAUDE.md`. Read both files first so the `Edit` old_string matches exactly.

**Edit 1 — `.planning/codebase/CONVENTIONS.md`, `## Import Organization` section (around line 80).** The bullet beginning `- Math utility functions (primeFactors, isPrime, modPow) are duplicated per-file` is replaced in full by exactly:

`- Math utility functions (primeFactors, isPrime, modPow) are duplicated per-file by default; a shared JS logic module under `assets/` is permitted when logic must stay identical across pages`

Leave the adjacent bullets (shared stylesheet, shared theme script, Google Fonts, theme-detection script, `Single-file design precludes import/require statements`, `SVG helper function `svgEl()` is repeated verbatim across tools`) byte-identical. Do NOT touch the `**SVG Helper (duplicated per-file):**` label further down in `## Shared Patterns` — it describes what the code currently does, not what is required.

**Edit 2 — `.planning/codebase/ARCHITECTURE.md`, `## Architectural Constraints` section (around line 231).** The bullet beginning `- **Dependency isolation:** Each tool is self-contained; math functions duplicated per-file` is replaced in full by exactly:

`- **Dependency isolation:** Each tool is self-contained; math functions are duplicated per-file by default, the original single-file rationale. That is no longer a hard constraint — a shared JS logic module under `assets/` is permitted when sharing is the better engineering call.`

Record this replacement text verbatim — Task 3 places the identical sentence into `.claude/CLAUDE.md` and diffs the two. Leave the Threading / Global state / Circular imports / No build step / BigInt support / SVG rendering bullets byte-identical.

**Edit 3 — `.planning/codebase/ARCHITECTURE.md`, `### Architectural Smell: Copy-Paste Math Functions` (around line 243).** Keep the section heading, the `**What happens:**` paragraph, and the `**Why it's wrong:**` maintenance-burden paragraph exactly as they are — the smell is still real and the rationale is still the useful historical context. Replace only the `**Do this instead:**` lead-in paragraph (the one sentence pair ending in a colon, immediately above the numbered list) with exactly:

`**Do this instead:** Duplication is the historical default, chosen to keep each tool self-contained — it is no longer a hard rule, and extracting a shared JS logic module under `assets/` is allowed when sharing is the better engineering call. While a function is still duplicated, if you discover a bug in one copy:`

Leave the four numbered steps beneath it unchanged — they are still the correct procedure for a function that remains duplicated. Do not rename the section heading and do not touch the `Monolithic Tool File` or `Tight Coupling to localStorage Key Name` smells that follow.
  </action>
  <verify>
    <automated>test $(grep -cF 'shared JS logic module' .planning/codebase/CONVENTIONS.md) -eq 1 && test $(grep -cF 'shared JS logic module' .planning/codebase/ARCHITECTURE.md) -eq 2 && test $(grep -cF '(intentional, per CLAUDE.md)' .planning/codebase/ARCHITECTURE.md) -eq 0 && test $(grep -cF 'duplication is *intentional*' .planning/codebase/ARCHITECTURE.md) -eq 0 && test $(grep -cF 'Maintenance burden' .planning/codebase/ARCHITECTURE.md) -eq 1 && test $(grep -cF 'SVG Helper (duplicated per-file)' .planning/codebase/CONVENTIONS.md) -eq 1 && test $(grep -cF 'Port the fix to all instances' .planning/codebase/ARCHITECTURE.md) -eq 1 && test $(git diff --name-only HEAD -- '*.html' | wc -l) -eq 0 && echo T2-OK</automated>
  </verify>
  <done>Both codebase-map sources permit a shared JS logic module, the prohibition phrasing is gone from both, the anti-pattern section keeps its heading / `What happens` / `Why it's wrong` / four numbered steps, the `SVG Helper` descriptive label survives, and no `.html` file changed.</done>
</task>

<task type="auto">
  <name>Task 3: Resync the three generated mirror lines in .claude/CLAUDE.md</name>
  <files>.claude/CLAUDE.md</files>
  <action>
`.claude/CLAUDE.md` restates the rule in three places, each inside a GSD-generated block. Each must become byte-identical to the source sentence Tasks 1 and 2 wrote, so a future regeneration is a no-op rather than a revert.

1. Inside the `<!-- GSD:project-start source:PROJECT.md -->` block, `### Constraints` section: replace the `- **Architecture**: ...` bullet with the exact bullet Task 1's Edit 3 wrote into `.planning/PROJECT.md`. Copy it from that file rather than retyping it.

2. Inside the `<!-- GSD:conventions-start source:CONVENTIONS.md -->` block, `## Import Organization` section: replace the `- Math utility functions (primeFactors, isPrime, modPow) ...` bullet with the exact bullet Task 2's Edit 1 wrote into `.planning/codebase/CONVENTIONS.md`.

3. Inside the `<!-- GSD:architecture-start source:ARCHITECTURE.md -->` block, `## Architectural Constraints` section: replace the `- **Dependency isolation:** ...` bullet with the exact bullet Task 2's Edit 2 wrote into `.planning/codebase/ARCHITECTURE.md`.

Do not add, remove, or move any `<!-- GSD:*-start -->` / `<!-- GSD:*-end -->` marker. Leave the heading-only `### Architectural Smell: Copy-Paste Math Functions` in this file exactly as-is — it carries no body prose here, so there is nothing to reword; its body lives in the ARCHITECTURE.md source Task 2 already fixed. Leave the `GSD:skills-*`, `GSD:workflow-*`, and `GSD:profile-*` blocks untouched.

Finally confirm the whole change set is documentation-only: no tracked `.html` differs from HEAD, and `assets/` has neither a modified nor an untracked new file.
  </action>
  <verify>
    <automated>diff <(grep -F '**Architecture**: One top-level directory per tool' .planning/PROJECT.md) <(grep -F '**Architecture**: One top-level directory per tool' .claude/CLAUDE.md) && diff <(grep -F 'Math utility functions (primeFactors, isPrime, modPow)' .planning/codebase/CONVENTIONS.md) <(grep -F 'Math utility functions (primeFactors, isPrime, modPow)' .claude/CLAUDE.md) && diff <(grep -F '**Dependency isolation:**' .planning/codebase/ARCHITECTURE.md) <(grep -F '**Dependency isolation:**' .claude/CLAUDE.md) && test $(grep -cF 'shared JS logic module' .claude/CLAUDE.md) -eq 3 && test $(grep -cF 'one intentional exception' .claude/CLAUDE.md) -eq 0 && test $(grep -cF '(intentional, per CLAUDE.md)' .claude/CLAUDE.md) -eq 0 && test $(grep -c 'GSD:' .claude/CLAUDE.md) -eq 14 && test $(git diff --name-only HEAD -- '*.html' | wc -l) -eq 0 && test $(git status --porcelain -- assets/ | wc -l) -eq 0 && echo T3-OK</automated>
  </verify>
  <done>All three mirror lines in `.claude/CLAUDE.md` are byte-identical to their generation sources, the prohibition phrasing is gone from the file, all 14 GSD markers are intact, no `.html` file changed, and `assets/` is clean.</done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| documentation → future planner/executor agents | These files are read as binding instructions by every subsequent GSD agent; wording here becomes machine behaviour later. |
| generated file ↔ generation source | `.claude/CLAUDE.md` is rewritten from `.planning/PROJECT.md` and `.planning/codebase/*.md`; a divergence silently reverts policy. |

## STRIDE Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation Plan |
|-----------|----------|-----------|----------|-------------|-----------------|
| T-pin-01 | Tampering | `.claude/CLAUDE.md` generated blocks | medium | mitigate | Task 3's `diff` sync gates prove each mirror line is byte-identical to its source, so `/gsd-docs-update` regeneration cannot restore the retired constraint. |
| T-pin-02 | Repudiation | historical artifacts under `.planning/phases/**`, `.planning/quick/**`, `.planning/research/**` | medium | mitigate | Declared explicit non-targets in `<objective>`; those files record why past tools were built under the old rule and rewriting them would falsify that record. |
| T-pin-03 | Elevation of Privilege | scope creep from docs into `assets/` or tool `.html` files | high | mitigate | Every task's `<verify>` asserts zero tracked `.html` diffs; Task 3 additionally asserts `git status --porcelain -- assets/` is empty, catching a new untracked shared module. |
| T-pin-04 | Information Disclosure | none — no secrets, credentials, or user data touched | low | accept | Change is prose in tracked public documentation; nothing sensitive enters the diff. |
| T-pin-SC | Tampering | npm/pip/cargo installs | high | mitigate | package-legitimacy gate + blocking human checkpoint for [ASSUMED]/[SUS] — not triggered: this plan installs nothing and this repo has no package manager. |
</threat_model>

<verification>
Run from the checkout root after all three tasks:

1. Policy inverted in all five living docs — `for f in CLAUDE.md .planning/PROJECT.md .planning/codebase/ARCHITECTURE.md .planning/codebase/CONVENTIONS.md .claude/CLAUDE.md; do grep -qF 'shared JS logic module' "$f" || echo "MISSING: $f"; done` prints nothing.
2. Prohibition phrasing retired — `grep -nF -e 'unless explicitly asked' -e 'one intentional exception' -e 'not extracted into a shared module' -e '(intentional, per CLAUDE.md)' CLAUDE.md .planning/PROJECT.md .planning/codebase/ARCHITECTURE.md .planning/codebase/CONVENTIONS.md .claude/CLAUDE.md` returns no hits.
3. Generated file matches its sources — the three `diff` commands in Task 3's verify all exit 0.
4. Historical record intact — `git diff --name-only HEAD` lists no path under `.planning/phases/`, `.planning/research/`, or `.planning/quick/` other than this plan's own directory.
5. Documentation-only — `git status --porcelain` shows no change under `assets/` and no `*.html` path.
</verification>

<success_criteria>
- A future planner reading any of the five living docs concludes that a shared JS logic module under `assets/` is an available option, and that per-file duplication is the default rather than a prohibition.
- Phase 6 (Multi-Language Support) can be planned with one shared translation dictionary without contradicting a documented constraint.
- The historical explanation of why duplication was originally chosen is still present in `CLAUDE.md`, `.planning/PROJECT.md`, and `.planning/codebase/ARCHITECTURE.md`.
- `.claude/CLAUDE.md` is regeneration-stable: re-running the doc generator would produce the same three lines it now contains.
- Zero behavioural change to the site — no tool `.html`, no `assets/` file, and no shared module created.
</success_criteria>

<output>
Create `.planning/quick/260930-pin-remove-the-no-shared-js-modules-for-logi/260930-pin-SUMMARY.md` when done.
</output>
