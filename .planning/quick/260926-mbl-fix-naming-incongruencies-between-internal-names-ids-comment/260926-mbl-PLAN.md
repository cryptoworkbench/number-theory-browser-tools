---
phase: quick-260926-mbl
plan: 01
type: execute
wave: 2
depends_on: [260926-mbm, 260926-mbn]
files_modified:
  - index.html
  - Congruence Wheel/congruence-wheel.html
  - Congruence Wheel/CLAUDE_RESUME_COMMAND
  - Venn Diagrams/venn-diagrams.html
  - Sieve Of Eratosthenes/sieve-of-eratosthenes.html
  - Factor Tree/factor-tree.html
  - Factorize By Completing The Square/factorize-completing-square.html
  - RSA Examplifier/rsa-examplifier.html
  - Diffie-Hellman Key Exchange/diffie-hellman-key-exchange.html
  - CLAUDE.md
  - .claude/CLAUDE.md
  - .planning/codebase/ARCHITECTURE.md
  - .planning/codebase/STRUCTURE.md
  - .planning/codebase/CONVENTIONS.md
  - .planning/codebase/CONCERNS.md
  - .planning/codebase/TESTING.md
  - .planning/codebase/STACK.md
  - .planning/codebase/INTEGRATIONS.md
files_deleted:
  - Pizza Slices/pizza-slices.html
  - Pizza Slices/CLAUDE_RESUME_COMMAND
autonomous: true
requirements: [NAV-01, QUICK-NAMING-01]

estimate:
  tokens: 55000
  raw_tokens: 55000
  tasks: 3
  confidence: low

must_haves:
  truths:
    - "The Venn tool is called `Venn Diagram` on every user-visible surface: its browser tab title, its `<h1>`, its hub card heading, and its nav label on all eight pages. The string `Prime Venn Diagram` appears nowhere in any shipped `.html` file, and no nav label reads the plural `Venn Diagrams`."
    - "The Congruence Wheel tool lives at `Congruence Wheel/congruence-wheel.html`; the directory and filename now match the name the user sees. No shipped `.html` file contains the substring `pizza` in any case."
    - "Every nav link and the hub card that point at the Congruence Wheel resolve to the new path — clicking `Congruence Wheel` from any of the other seven pages opens the tool rather than a 404."
    - "The Congruence Wheel's `localStorage` key stays `congruence-wheel` (it already matched the public name), so a returning user's saved N and depth survive this change untouched."
    - "The Venn tool's three `localStorage` keys keep their legacy plural slugs on purpose, each carrying a comment at its declaration saying why, so a returning user's placed primes and two/three-circle mode survive this change untouched."
    - "All eight pages still carry the same eight nav links with exactly one marked `is-active` (NAV-01 preserved)."
    - "Living docs (`CLAUDE.md`, `.claude/CLAUDE.md`, `.planning/codebase/*.md`) name and path the Congruence Wheel correctly, and carry no stale `Christmas Trees` directory reference left over from the earlier Factor Tree rename."
  artifacts:
    - "Congruence Wheel/congruence-wheel.html (git-mv renamed from Pizza Slices/pizza-slices.html, history preserved)"
    - "index.html"
    - "Venn Diagrams/venn-diagrams.html"
  key_links:
    - "index.html nav + hub card href -> Congruence Wheel/congruence-wheel.html"
    - "six sibling tool pages' nav href -> ../Congruence Wheel/congruence-wheel.html"
    - "Congruence Wheel/congruence-wheel.html self nav href -> congruence-wheel.html (bare, same directory)"
    - "id=\"wheel-caption\" in markup -> document.getElementById('wheel-caption') in the tool's IIFE"
    - "CLAUDE.md / .claude/CLAUDE.md / .planning/codebase/*.md tool inventory -> Congruence Wheel/congruence-wheel.html"
---

<objective>
Align every internal name, path, and element id in this repo with the tool name the user actually sees, and settle the one grammatical drift in the Venn tool's public name.

The audit found three real divergences and two deliberate non-changes:

| Surface | Now | After | Why |
|---|---|---|---|
| Venn page `<title>`, `<h1>`, hub card `<h2>` | `Prime Venn Diagram` | `Venn Diagram` | item text: never "Prime Venn Diagram" |
| Venn nav label, all 8 pages | `Venn Diagrams` (plural) | `Venn Diagram` | canonical name is singular; nav must not use a different grammatical form of it |
| Congruence Wheel directory + filename | `Pizza Slices/pizza-slices.html` | `Congruence Wheel/congruence-wheel.html` | the last place the pre-rename name survives |
| Congruence Wheel caption element id | `slice-caption` | `wheel-caption` | joins the file's existing `wheel` / `wheel-dynamic` id family |
| Congruence Wheel `localStorage` key | `congruence-wheel` | unchanged | already correct — nothing to flag, no state break |
| Venn `localStorage` keys | `venn-diagrams`, `venn-diagrams-three`, `venn-diagrams-mode` | unchanged, commented | renaming would silently drop returning users' placed primes and mode |

Purpose: a self-learner who bookmarks a tool, and an agent who greps for it later, should find one name for it — not the name it had during the session that built it.
Output: eight retitled/repointed `.html` files, one `git mv`-renamed tool directory, and living docs that path to it correctly.

**Two deliberate non-renames, flagged rather than done silently:**
1. The Venn directory and filename stay `Venn Diagrams/venn-diagrams.html`. Renaming them would (a) break any existing deep link the same way, for a plural-vs-singular nit rather than a wrong name, and (b) collide head-on with sibling batch item `260926-mbm`, which is editing that exact file. Recorded as a possible follow-up, not done here.
2. The Venn tool's three `localStorage` keys stay on their plural slugs. Renaming them is a compatibility break: a returning user's placed primes and their two/three-circle mode choice would silently reset. Fixed in every user-visible surface instead, with a comment at the declaration explaining the tradeoff.
</objective>

<execution_context>
@~/.claude/gsd-core/workflows/execute-plan.md
@~/.claude/gsd-core/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/STATE.md
@./CLAUDE.md
@./.claude/CLAUDE.md

# Directory-rename precedent in this repo: "Christmas Trees/" -> "Factor Tree/" via git mv,
# with every nav/card href repointed and living docs updated in one commit.
@.planning/quick/260925-pbw-rename-christmas-trees-folder-to-factor-/260925-pbw-SUMMARY.md
</context>

<tasks>

<task type="tracer">
  <name>Task 1: Venn tool reads "Venn Diagram" on every surface, all eight pages</name>
  <files>Venn Diagrams/venn-diagrams.html, index.html, Sieve Of Eratosthenes/sieve-of-eratosthenes.html, Factor Tree/factor-tree.html, Factorize By Completing The Square/factorize-completing-square.html, Pizza Slices/pizza-slices.html, RSA Examplifier/rsa-examplifier.html, Diffie-Hellman Key Exchange/diffie-hellman-key-exchange.html</files>
  <action>
Establish the canonical public name `Venn Diagram` (singular, no qualifier) across every surface that renders it. This task deliberately touches all eight pages at once — it is the thin end-to-end slice that proves the whole sweep pattern (page title -> page heading -> hub card -> shared nav -> grep gate) before Task 2 expands it to paths and ids.

In `Venn Diagrams/venn-diagrams.html`:
- Line 7 `<title>`: drop the leading qualifier so the browser tab reads exactly `Venn Diagram`.
- Line 329 `<h1>`: same, exactly `Venn Diagram`.
- Line 313: the self nav anchor (the one carrying `is-active`) — its link text becomes `Venn Diagram`. Leave its `href="venn-diagrams.html"` alone.
- Above the `var STORAGE_KEY = 'venn-diagrams';` declaration (line 474) add a one-line comment, in the `/* ... */` or `//` style already used in that file, recording that this key and the two below keep their legacy plural slug on purpose: renaming them would silently drop a returning user's saved primes, so the plural survives in storage only, never in anything the user reads.
- Add the same one-line note above the pair `var STORAGE_KEY3 = 'venn-diagrams-three';` / `var MODE_STORAGE_KEY = 'venn-diagrams-mode';` (lines 598-599).
- Leave every `venn` / `venn-static` / `venn-dynamic` / `venn3*` element id and the `svg#venn, svg#venn3` CSS selector untouched — those are already singular and already agree with the canonical name.

In `index.html`:
- Line 183, the Venn hub card `<h2>`: exactly `Venn Diagram`.
- Line 125, the Venn nav anchor's link text: `Venn Diagram`. Leave the `href` alone.
- Leave the card's body paragraph (line 184) as written — it names no tool.

In each of the other six tool pages, change only the link text of the single nav anchor whose `href` ends in `venn-diagrams.html`, to `Venn Diagram`. Leave every `href` alone. The anchors are: `Sieve Of Eratosthenes/sieve-of-eratosthenes.html:365`, `Factor Tree/factor-tree.html:316`, `Factorize By Completing The Square/factorize-completing-square.html:247`, `Pizza Slices/pizza-slices.html:241`, `RSA Examplifier/rsa-examplifier.html:164`, `Diffie-Hellman Key Exchange/diffie-hellman-key-exchange.html:166`.

Note on ordering: this task edits the Congruence Wheel page at its current path (`Pizza Slices/pizza-slices.html`); Task 2 performs the `git mv`. Do Task 1 first, then Task 2 — do not reorder.

Change no `href`, no element id, and no CSS in this task. Link-text, heading, title, and two comments only.
  </action>
  <verify>
    <automated>cd "$(git rev-parse --show-toplevel)" && test -z "$(grep -lE 'Prime Venn|>Venn Diagrams<' *.html */*.html)" && test "$(grep -lF '>Venn Diagram<' *.html */*.html | wc -l)" -eq 8 && test "$(grep -lF 'venn-diagrams.html' *.html */*.html | wc -l)" -eq 8 && echo PASS</automated>
  </verify>
  <done>No shipped `.html` file contains `Prime Venn` or a `>Venn Diagrams<` label; all eight `.html` files render the exact label `Venn Diagram`; all eight still link to `venn-diagrams.html` (no href was disturbed); the three Venn storage-key declarations each carry the compatibility note.</done>
</task>

<task type="auto">
  <name>Task 2: Rename the Congruence Wheel directory, file, and caption id to match its public name</name>
  <files>Congruence Wheel/congruence-wheel.html, index.html, Sieve Of Eratosthenes/sieve-of-eratosthenes.html, Factor Tree/factor-tree.html, Factorize By Completing The Square/factorize-completing-square.html, RSA Examplifier/rsa-examplifier.html, Venn Diagrams/venn-diagrams.html, Diffie-Hellman Key Exchange/diffie-hellman-key-exchange.html</files>
  <action>
The Congruence Wheel's `localStorage` key already reads `congruence-wheel`, its `<title>` and `<h1>` already read `The Congruence Wheel`, and no comment or variable in the file carries the old name. The only surviving divergence is its own directory and filename. Close it with `git mv`, following the precedent this repo already set when `Christmas Trees/` became `Factor Tree/`.

Step 1 — rename, preserving tracked-file history (quote the paths; they contain spaces):
- `git mv "Pizza Slices" "Congruence Wheel"`
- `git mv "Congruence Wheel/pizza-slices.html" "Congruence Wheel/congruence-wheel.html"`
The stray `CLAUDE_RESUME_COMMAND` file rides along with the directory move. Leave its contents untouched, per the repo's CLAUDE.md.

Step 2 — repoint every link. Nine references, in eight files:
- `index.html:123` nav anchor `href` and `index.html:167` hub card `href` both become `Congruence Wheel/congruence-wheel.html`.
- In `Congruence Wheel/congruence-wheel.html`, the self nav anchor (line 239, the `is-active` one) `href` becomes the bare `congruence-wheel.html` — same directory, no prefix, matching how every other tool page self-links.
- In `Sieve Of Eratosthenes/sieve-of-eratosthenes.html:363`, `Factor Tree/factor-tree.html:314`, `Factorize By Completing The Square/factorize-completing-square.html:245`, `RSA Examplifier/rsa-examplifier.html:162`, `Venn Diagrams/venn-diagrams.html:311`, and `Diffie-Hellman Key Exchange/diffie-hellman-key-exchange.html:164`, the `href` becomes `../Congruence Wheel/congruence-wheel.html`.
- Every one of these nine anchors already reads `Congruence Wheel` as its link text. Do not change the link text; change only the `href`.

Step 3 — the one internal id still carrying the old vocabulary. In `Congruence Wheel/congruence-wheel.html`, rename the caption element from `slice-caption` to `wheel-caption` in both places: the `<p class="caption" id="slice-caption" aria-live="polite">` in markup (line 284) and the `document.getElementById('slice-caption')` that binds it (line 314). This joins the `wheel` / `wheel-dynamic` id family already used in that file. Nothing else references it.

Step 4 — one word of hub copy. `index.html:170` describes the wheel as having "one slice per class"; the tool's own lede (line 258 of the tool) says "one wedge per class", and every CSS class in the tool is `wedge`. Change the hub card's word to `wedge` so hub and tool use one term for one thing.

Step 5 — leave the `congruence-wheel` `localStorage` key exactly as it is, in both the read (line 321) and the write (line 514). It already matches the public name, so there is no compatibility break here and nothing to flag. Add no comment to it.

Leave the 🍕 hub-card icon and the "annular sector" geometry helpers alone — an icon is not a name, and the sector vocabulary describes the shape being drawn, not the tool.

Do not rename the Venn directory or filename in this task or any other; see the objective for why.
  </action>
  <verify>
    <automated>cd "$(git rev-parse --show-toplevel)" && test -f "Congruence Wheel/congruence-wheel.html" && test ! -e "Pizza Slices" && test -z "$(grep -liE 'pizza' *.html */*.html)" && test "$(grep -lF 'Congruence Wheel/congruence-wheel.html' *.html */*.html | wc -l)" -eq 7 && grep -qF 'href="congruence-wheel.html"' "Congruence Wheel/congruence-wheel.html" && test -z "$(grep -nF 'slice-caption' "Congruence Wheel/congruence-wheel.html")" && grep -qF "getElementById('wheel-caption')" "Congruence Wheel/congruence-wheel.html" && grep -qF 'id="wheel-caption"' "Congruence Wheel/congruence-wheel.html" && grep -qF "localStorage.getItem('congruence-wheel')" "Congruence Wheel/congruence-wheel.html" && echo PASS</automated>
  </verify>
  <done>`Congruence Wheel/congruence-wheel.html` exists and the old directory is gone; no shipped `.html` file contains the substring `pizza` in any case; exactly seven `.html` files carry the full new path (the tool self-links bare); the caption id is `wheel-caption` in both markup and script; the `congruence-wheel` storage key is untouched.</done>
</task>

<task type="auto">
  <name>Task 3: Repath the living docs and run the repo-wide naming gate</name>
  <files>CLAUDE.md, .claude/CLAUDE.md, .planning/codebase/ARCHITECTURE.md, .planning/codebase/STRUCTURE.md, .planning/codebase/CONVENTIONS.md, .planning/codebase/CONCERNS.md, .planning/codebase/TESTING.md, .planning/codebase/STACK.md, .planning/codebase/INTEGRATIONS.md</files>
  <action>
After Task 2 the living docs point at a path that no longer exists, which is actively harmful — the next agent that greps them gets a dead path. Sweep them, the same way the `Christmas Trees/` -> `Factor Tree/` rename did.

Apply these three substitutions across `CLAUDE.md`, `.claude/CLAUDE.md`, and every file in `.planning/codebase/`:
1. The full old path (directory + `/` + old filename) becomes `Congruence Wheel/congruence-wheel.html`.
2. Any remaining occurrence of the old Title Case directory name becomes `Congruence Wheel`.
3. Any remaining bare occurrence of the old filename becomes `congruence-wheel.html`.

Known hits to cover: `CLAUDE.md:15`; `.claude/CLAUDE.md` lines 94, 96, 200; `.planning/codebase/ARCHITECTURE.md` lines 27, 58, 265, 279; `.planning/codebase/STRUCTURE.md` lines 31, 32, 76, 80, 110, 154, 186; `.planning/codebase/CONVENTIONS.md` lines 13, 15; `.planning/codebase/CONCERNS.md` lines 14, 23, 31, 50, 79, 108, 117; `.planning/codebase/TESTING.md` lines 23, 57, 147; `.planning/codebase/STACK.md:95`; `.planning/codebase/INTEGRATIONS.md` lines 16, 17, 18, 44. Re-grep afterwards rather than trusting this list — sibling batch items may have shifted line numbers.

Two things in those docs are prose about the *visual metaphor*, not the tool's name, and must survive verbatim: the phrase describing the wheel as drawn from sector wedges in `CLAUDE.md:15` and in the `annularSectorPath(...)` bullets (`.claude/CLAUDE.md:278`, `.planning/codebase/ARCHITECTURE.md:188`). The tool draws sector shapes; that is a true description of the geometry. Only names and paths change.

Also fix the one stale cell left over from the earlier Factor Tree rename, and the Congruence Wheel cell, in the ASCII component diagram at `.planning/codebase/ARCHITECTURE.md` lines 27-28. Replace those two lines with exactly:

Line 27: `│ `Sieve Of.../       │ │ `Factor      │ │ `Factorize     │ │ `Congruence │ │ `RSA        │`
Line 28: `│  sieve-of-...html` │ │  Tree/...`   │ │  By.../...`    │ │  Wheel/..`  │ │  Exampl.`   │`

Those replacements keep each cell's interior character width identical to what is there now, so the diagram stays as aligned as it already is (its top border row was already approximate — do not try to re-align the whole box).

Leave every `Mountains of Christmas` mention alone in `.planning/codebase/INTEGRATIONS.md:19`, `.planning/codebase/STACK.md:45`, and `.planning/codebase/STRUCTURE.md:170` — that is a Google Font family name and a theme description, not a stale directory.

Finally, grep `CLAUDE.md`, `.claude/CLAUDE.md`, and `.planning/codebase/` for any place they name the Venn tool, and align it to `Venn Diagram` — but leave the literal directory path `Venn Diagrams/venn-diagrams.html` intact, since Task 1 deliberately did not rename it. The audit found no such mention (those docs predate the Venn tool), so expect a no-op; confirm rather than assume.

The final automated gate below is the whole-repo acceptance check for this plan. Run it and do not close the task until it prints PASS.
  </action>
  <verify>
    <automated>cd "$(git rev-parse --show-toplevel)" && test -z "$(grep -rnE 'Pizza Slices|pizza-slices|Christmas Trees' CLAUDE.md .claude/CLAUDE.md .planning/codebase/)" && test -n "$(grep -rlF 'Congruence Wheel/congruence-wheel.html' CLAUDE.md .claude/CLAUDE.md .planning/codebase/)" && test -z "$(grep -liE 'pizza|Prime Venn|>Venn Diagrams<' *.html */*.html)" && test "$(grep -lF '>Venn Diagram<' *.html */*.html | wc -l)" -eq 8 && test -z "$(grep -LF 'site-nav-link is-active' *.html */*.html)" && test "$(ls -1 *.html */*.html | wc -l)" -eq 8 && echo PASS</automated>
  </verify>
  <done>No living doc references the old directory name, the old filename, or the stale `Christmas Trees` path; at least one living doc carries the new full path; no shipped `.html` contains `pizza`, `Prime Venn`, or a plural `Venn Diagrams` label; all eight pages render `Venn Diagram`; every one of the eight pages still carries an active nav marker (this plan adds and removes no `is-active` attribute, so "at least one" is sufficient to show NAV-01 survived); the repo still holds exactly eight `.html` files.</done>
</task>

</tasks>

<!-- planner-discipline-allow: Pizza Slices -->
<!-- planner-discipline-allow: pizza-slices -->
<!-- planner-discipline-allow: Prime Venn -->
<!-- The three literals above appear in task actions because the executor must search for them.
     Every negative gate in this plan is path-scoped to shipped `*.html` files or to an explicit
     living-doc file list (CLAUDE.md, .claude/CLAUDE.md, .planning/codebase/) — none of which
     includes this plan, which lives at .planning/quick/. The gates cannot match this file. -->

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| (none crossed) | This change adds no input handling, no network call, and no new storage write. Every edit is static text: page titles, heading text, nav link text, `href` values, one element id, and doc prose. |

## STRIDE Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation Plan |
|-----------|----------|-----------|----------|-------------|-----------------|
| T-mbl-01 | Denial of Service | Congruence Wheel deep links after the `Pizza Slices/` -> `Congruence Wheel/` `git mv` | low | accept | Availability-only, and only for a stale bookmark or external deep link to the old URL, which now 404s. Accepted because (a) the repo already made exactly this tradeoff renaming `Christmas Trees/` -> `Factor Tree/`, (b) it is a static educational site with no published permalink contract, and (c) every in-repo link is repointed and gated in Task 2. No redirect stub is added, because that would leave a second `.html` in a tool directory and break the one-file-per-tool rule in CLAUDE.md. |
| T-mbl-02 | Tampering | Per-tool `localStorage` state (`congruence-wheel`, `venn-diagrams*`) | low | mitigate | No key is renamed. The Congruence Wheel key already matched the public name; the three Venn keys are deliberately left on their legacy plural slug so a returning user's placed primes and mode are not silently reset, with the reason recorded in a comment at each declaration (Task 1). The Task 2 gate asserts the Congruence Wheel read path still uses the original key. |
| T-mbl-03 | Tampering | npm/pip/cargo installs | n/a | accept | No package manager exists in this repo and this plan installs nothing. No supply-chain surface. |

No new attack surface: no user input is parsed, no value is interpolated into the DOM, no request is made, and no stored data changes shape or key.
</threat_model>

<verification>
Automated (the Task 3 gate is the acceptance check for the whole plan):

The `*.html */*.html` glob pair enumerates exactly the eight shipped pages and, because every GSD/tooling directory here is dot-prefixed, can never pick up a transient `.html` under `.planning/` or `.gsd/` — which is why the gates use it rather than `grep -r .`.

```bash
cd "$(git rev-parse --show-toplevel)"
# no stale tool name anywhere in shipped pages
grep -liE 'pizza|Prime Venn|>Venn Diagrams<' *.html */*.html   # expect: no output
# canonical Venn label on every page, every page still self-marks in the nav
grep -lF '>Venn Diagram<' *.html */*.html | wc -l              # expect: 8
grep -LF 'site-nav-link is-active' *.html */*.html             # expect: no output
# the rename landed and tracked-file history followed it
test -f "Congruence Wheel/congruence-wheel.html" && echo "file ok"
HIST=$(git log --follow --oneline -- "Congruence Wheel/congruence-wheel.html"); test -n "$HIST" && echo "history ok"
# living docs path to the new location
grep -rnE 'Pizza Slices|pizza-slices|Christmas Trees' CLAUDE.md .claude/CLAUDE.md .planning/codebase/  # expect: no output
```

Human check (this project has no test runner; browser is the only runtime). Deferred to end-of-phase per `workflow.human_verify_mode`:

<human-check>
Open `index.html` from the file system. Confirm the hub shows seven cards, that the Venn card heading reads `Venn Diagram`, and that the nav lists `Venn Diagram` (singular). Click `Congruence Wheel` in the nav — the wheel tool must load at its new path, not 404. Once there, move the N and depth sliders, reload the page, and confirm the values persisted (proves the storage key was left alone). Then click `Venn Diagram` from the wheel's nav, confirm the tab title reads `Venn Diagram`, and confirm any primes you had previously placed are still there (proves the Venn storage keys were left alone). Finally, visit each of the remaining five tools and confirm its nav highlights itself and that the `Congruence Wheel` link works from each.
</human-check>
</verification>

<success_criteria>
- One name per tool: `Venn Diagram` and `Congruence Wheel` each read identically in page title, page heading, hub card, and nav label across all eight pages.
- The Congruence Wheel's directory and filename match its public name, renamed with `git mv` so tracked-file history follows, with all nine in-repo links repointed and none broken.
- `id="wheel-caption"` replaces the last pre-rename internal identifier in that tool, and the hub card and the tool agree on the word `wedge`.
- No `localStorage` key changed value: returning users lose nothing. The one key that was already correct is untouched; the three that carry a legacy slug are documented in place as a deliberate compatibility tradeoff.
- Living docs path to the new location; the stale `Christmas Trees` reference in the component diagram is gone; the Google Font name `Mountains of Christmas` and the sector-geometry prose survive verbatim.
- NAV-01 holds: eight pages, eight nav links each, every page still marking itself active. No `is-active` attribute and no nav `href` other than the Congruence Wheel's is altered by this plan.
- Two flagged non-changes are recorded in the SUMMARY as possible follow-ups, not silently dropped: renaming `Venn Diagrams/venn-diagrams.html` to the singular form, and renaming the three `venn-diagrams*` storage keys.
</success_criteria>

<output>
Create `.planning/quick/260926-mbl-fix-naming-incongruencies-between-internal-names-ids-comment/260926-mbl-SUMMARY.md` when done.

The SUMMARY must record, under key-decisions, both flagged non-changes and why, so the developer can decide on them later:
1. The Venn directory and filename keep their plural form (URL-break risk for a plural-vs-singular nit, plus a direct file collision with sibling batch item `260926-mbm`).
2. The three `venn-diagrams*` `localStorage` keys keep their legacy slug (renaming them silently resets a returning user's placed primes and circle-mode choice).
And it must record that the Congruence Wheel directory rename does break any pre-existing bookmark of the old URL — accepted on the precedent of the earlier `Christmas Trees/` -> `Factor Tree/` rename.
</output>
