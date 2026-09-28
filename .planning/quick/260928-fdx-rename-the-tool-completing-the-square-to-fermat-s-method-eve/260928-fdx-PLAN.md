---
phase: quick-260928-fdx
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - Fermats Method/fermats-method.html
  - Fermats Method/CLAUDE_RESUME_COMMAND
  - index.html
  - Congruence Wheel/congruence-wheel.html
  - Sieve Of Eratosthenes/sieve-of-eratosthenes.html
  - Factor Tree/factor-tree.html
  - Venn Diagrams/venn-diagrams.html
  - RSA/rsa.html
  - Shors Algorithm/shors-algorithm.html
  - Diffie-Hellman Key Exchange/diffie-hellman-key-exchange.html
  - Square And Multiply/square-and-multiply.html
  - Cayley Table Generator/cayley-table-generator.html
  - Euclidean Algorithm/euclidean-algorithm.html
  - CLAUDE.md
  - .claude/CLAUDE.md
  - assets/palette.css
  - .planning/codebase/ARCHITECTURE.md
  - .planning/codebase/CONCERNS.md
  - .planning/codebase/STACK.md
  - .planning/codebase/TESTING.md
  - .planning/codebase/STRUCTURE.md
  - .planning/codebase/INTEGRATIONS.md
files_deleted:
  - Factorize By Completing The Square/factorize-completing-square.html
  - Factorize By Completing The Square/CLAUDE_RESUME_COMMAND
autonomous: true
requirements: [NAV-01, TOOL-RENAME-01]

estimate:
  tokens: 80000
  raw_tokens: 80000
  tasks: 3
  confidence: low

must_haves:
  truths:
    - "The tool lives at `Fermats Method/fermats-method.html` — a Title-Case-with-spaces directory and a kebab-case filename, apostrophe dropped from both path components exactly as the existing `Shors Algorithm/shors-algorithm.html` precedent drops it from Shor's. No shipped `.html` file and no file under `assets/` contains the substring `completing` in any case."
    - "Every user-visible surface reads `Fermat's Method` (apostrophe kept in display text): the browser tab title, the page `<h1>`, the hub card heading in `index.html`, and the nav label on all twelve site pages (the renamed tool plus its ten siblings plus the hub)."
    - "All twelve in-repo hrefs that point at this tool resolve to a file that exists — clicking `Fermat's Method` from any of the other eleven pages, or the hub card, opens the tool rather than a 404 — and no other page's links broke in the process."
    - "Git history for both the tool's HTML file and its `CLAUDE_RESUME_COMMAND` survives the move as a rename (git-mv rename detection), and the resume file's content is byte-identical to before."
    - "All twelve pages keep the same nav entries in the same relative order they had before this item ran — the Fermat's Method entry's position is unchanged on every page, and exactly one link per page is still marked `is-active`. Nav reordering is item 260928-fdz's job, not this one's."
    - "The tool's behavior is unchanged: no factoring math, no panel copy beyond the renamed title/heading, no CSS, and no `localStorage` usage is touched — the page has no tool-specific storage key, it only reads the shared `site-theme` preference."
    - "Living docs (`CLAUDE.md`, `.claude/CLAUDE.md`, `.planning/codebase/*.md`) name and path the tool as `Fermat's Method` / `Fermats Method/fermats-method.html`; the ASCII component diagram in ARCHITECTURE.md keeps its per-row character-length alignment (the 9 multi-box body rows keep lengths in {90, 91}), and STRUCTURE.md's directory tree keeps its trailing `#` comments at column 37."
    - "Historical planning records — `STATE.md`'s changelog rows, `PROJECT.md`'s milestone checklist, `ROADMAP.md`'s completed-plan descriptions, and everything under `.planning/phases/`, `.planning/quick/`, `.planning/quick-batches/`, `.planning/research/`, `.planning/debug/` — are left untouched. They are dated records of what was true when written, matching the precedent set by the RSA Examplifier → RSA rename (260926-rba), whose own `STATE.md` row still says 'RSA Examplifier' today."
  artifacts:
    - "Fermats Method/fermats-method.html (git-mv renamed from the retired path, history preserved)"
    - "Fermats Method/CLAUDE_RESUME_COMMAND (moved with the directory, content unchanged)"
    - "index.html"
    - ".planning/codebase/ARCHITECTURE.md"
  key_links:
    - "index.html nav href -> Fermats Method/fermats-method.html"
    - "index.html hub card href -> Fermats Method/fermats-method.html"
    - "ten sibling tool pages' nav href -> ../Fermats Method/fermats-method.html"
    - "Fermats Method/fermats-method.html self nav href -> fermats-method.html (bare filename, same directory)"
    - "CLAUDE.md / .claude/CLAUDE.md / .planning/codebase/*.md tool inventory -> Fermats Method/fermats-method.html"
---

<objective>
Rename this repo's "Completing The Square" tool to "Fermat's Method" on every live surface at once: the directory, the filename, the three self-references inside the page, the twelve in-repo hrefs that reach it, and the living docs (project CLAUDE.md files and the `.planning/codebase/` map) that inventory it.

Purpose: sibling batch item 260928-fdz will reorder the site nav by name, and it depends on this rename already being applied — "Fermat's Method" must exist as a real path before that item can place it. This item also follows the exact precedent already set in this repo by the RSA Examplifier → RSA rename (260926-rba): directory/file via `git mv`, every cross-link repointed, living docs repathed, historical planning records left alone.

Output: `Fermats Method/fermats-method.html` reachable from the hub and every sibling page, plus living docs that path and name it correctly.

Scope guard: this is rename-only. No factoring math, no narrative copy beyond the renamed title/heading, no CSS, no `localStorage` behavior changes, and no nav reordering (that is 260928-fdz's job — this item preserves each page's existing nav order). Three commits: one `feat` for the directory/file rename plus the tool's own self-references and the hub page, one `feat` for the ten sibling cross-links, one `docs` for CLAUDE.md/.claude/CLAUDE.md/assets/palette.css/`.planning/codebase/*.md`.

Coordination note for the orchestrator: this plan edits one nav line in `Congruence Wheel/congruence-wheel.html`, which sibling batch item 260928-fdy (renaming Congruence Wheel to Equivalence Wheel) also modifies, and it is the rename that 260928-fdz's reorder depends on. `depends_on` is empty because this item is the first to touch the Fermat's Method tool, but it must not share a wave with `fdy` or `fdz`.

No task-level TDD: this repo has no test framework or build step (verification is "open the file in a browser", per CLAUDE.md), and none of the three tasks add behavior — all are path and text substitutions. Verification is carried by grep gates, a repo-wide href-resolution gate, and a character-length gate on the one ASCII diagram this item edits.

<!-- planner-discipline-allow: completing -->
<!-- planner-discipline-allow: Completing -->
<!-- planner-discipline-allow: factorize-completing-square -->
<!-- planner-discipline-allow: Factorize By Completing The Square -->
</objective>

<execution_context>
@~/.claude/gsd-core/workflows/execute-plan.md
@~/.claude/gsd-core/templates/summary.md
</execution_context>

<context>
@CLAUDE.md
@.claude/CLAUDE.md

Baseline facts established during planning (do not re-derive):

- The old name (the substring `completing`, case-insensitive — every spelling of the old name, "Factorize By Completing The Square", "Completing the Square", "completing-the-square", "Completing-the-Square", "Completing Square", contains it) currently appears in exactly 21 tracked files outside historical planning records and the untracked scratch note: 11 `.html` files (the tool itself plus index.html plus 10 named siblings — Congruence Wheel, Sieve Of Eratosthenes, Factor Tree, Venn Diagrams, RSA, Shors Algorithm, Diffie-Hellman Key Exchange, Square And Multiply, Cayley Table Generator, Euclidean Algorithm), `assets/palette.css`, `CLAUDE.md`, `.claude/CLAUDE.md`, and six files under `.planning/codebase/` (ARCHITECTURE.md, CONCERNS.md, STACK.md, TESTING.md, STRUCTURE.md, INTEGRATIONS.md) — 47 matching lines total.
- `STATE.md`, `PROJECT.md`, and `ROADMAP.md` also mention the old name, but only inside dated changelog/checklist entries describing work already completed under that name. Those three files are historical records, not living docs — leave them untouched, exactly as `STATE.md`'s still-unedited "RSA Examplifier" row from 260926-rba demonstrates this repo's own precedent for that distinction.
- The untracked root file `claude_remark_scratchpad` also mentions the old name (it is the user's own session note listing this batch's tasks) — it is not part of the shipped site or living docs and is out of this item's scope, matching how `CLAUDE_RESUME_COMMAND` stray files are left alone per CLAUDE.md.
- The tool has **no** tool-specific `localStorage` key. Its only storage touch is the shared theme bootstrap reading `site-theme`.
- The site currently has 12 HTML pages total (11 tools + `index.html`), each carrying its own fully inlined copy of the site nav bar — there is no separate nav-include file, so every page needs its own edit.
- Repo-wide href resolution is currently clean (zero broken in-repo `.html` links) — that is the baseline the Task 2 gate must preserve.
- The `Shors Algorithm/shors-algorithm.html` pair is this repo's own precedent for possessive-apostrophe tool names: directory and filename drop the apostrophe ("Shors Algorithm", "shors-algorithm.html"), display text keeps it ("Shor's Algorithm"). This item follows that pattern: directory `Fermats Method`, file `fermats-method.html`, display text `Fermat's Method`.
</context>

<tasks>

<task type="tracer">
  <name>Task 1: Rename directory and file to Fermats Method, update the tool's own self-references and the hub page</name>
  <files>Fermats Method/fermats-method.html, Fermats Method/CLAUDE_RESUME_COMMAND, index.html</files>
  <precondition>`git status --porcelain -- '*.html'` reports no modified tracked HTML files, so this rename commit carries only rename-related changes and no in-flight edits from a sibling batch item.</precondition>
  <action>
    Move the tool with git so history is preserved, in two steps so the session-residue file travels with the directory as a pure rename: first `git mv "Factorize By Completing The Square" "Fermats Method"`, then `git mv "Fermats Method/factorize-completing-square.html" "Fermats Method/fermats-method.html"`. Do not open, edit, or reformat `Fermats Method/CLAUDE_RESUME_COMMAND` — it must stay byte-identical, recorded by git as a 0-change rename, matching how commit 5a65c36 moved the Congruence Wheel's copy and how 260926-rba moved RSA's.

    In `Fermats Method/fermats-method.html` change exactly three things and nothing else. The `<title>` keeps its subtitle and becomes `Fermat's Method — Interactive Visualizer`. The self nav link becomes `href="fermats-method.html"` with link text `Fermat's Method`, keeping its `class="site-nav-link is-active"` and the bare same-directory filename convention the other tools' self-links use. The page-header `<h1>` becomes `Fermat's Method`. Leave the header paragraph (it already reads "Fermat's method: every odd number N can be written as..." and already uses the verb "complete the square" to describe the actual algebra — that sentence is teaching the technique, not naming the tool, so it stays as written), every trial-table label, every banner message, all CSS, the theme bootstrap script, and the entire script block untouched — none of them name the tool by its old title.

    In `index.html` change three things: the nav link becomes `href="Fermats Method/fermats-method.html"` with link text `Fermat's Method`; the hub card anchor becomes `href="Fermats Method/fermats-method.html"`; the card's `<h2>` becomes `Fermat's Method`. The card's descriptive `<p>` already reads "Fermat's factoring method: search for a² − N = b²..." and never named the old tool title — leave it as written.

    Commit as one atomic change: `feat(260928-fdx): rename Factorize By Completing The Square dir/file to Fermats Method, repoint hub links`, with the run's required `Co-Authored-By` attribution footer.
  </action>
  <verify>
    <automated>test -f "Fermats Method/fermats-method.html" && test -f "Fermats Method/CLAUDE_RESUME_COMMAND" && test ! -e "Factorize By Completing The Square"</automated>
    <automated>grep -qF "Fermat's Method — Interactive Visualizer" "Fermats Method/fermats-method.html"</automated>
    <automated>grep -qF "<a href=\"fermats-method.html\" class=\"site-nav-link is-active\">Fermat's Method</a>" "Fermats Method/fermats-method.html"</automated>
    <automated>grep -qF "<h1>Fermat's Method</h1>" "Fermats Method/fermats-method.html"</automated>
    <automated>grep -qF "<a href=\"Fermats Method/fermats-method.html\" class=\"site-nav-link\">Fermat's Method</a>" index.html && grep -qF "<a class=\"card\" href=\"Fermats Method/fermats-method.html\">" index.html && grep -qF "<h2>Fermat's Method</h2>" index.html</automated>
    <automated>hrefs=$(git grep -oh 'Fermats Method/fermats-method\.html' -- '*.html'); n=$(printf '%s\n' "$hrefs" | awk 'NF' | wc -l | tr -d ' '); test "$n" -eq 2</automated>
  </verify>
  <done>`Fermats Method/fermats-method.html` exists and the old directory is gone; its own `<title>`, self nav link, and `<h1>` all read `Fermat's Method`; `index.html`'s nav link, card href, and card `<h2>` all point at and name `Fermat's Method`; exactly two in-repo hrefs to `Fermats Method/fermats-method.html` exist at this point (index.html's nav and card) — the ten sibling pages are Task 2's job.</done>
</task>

<task type="auto">
  <name>Task 2: Repoint the ten sibling tool pages' nav links to Fermats Method/fermats-method.html</name>
  <files>Congruence Wheel/congruence-wheel.html, Sieve Of Eratosthenes/sieve-of-eratosthenes.html, Factor Tree/factor-tree.html, Venn Diagrams/venn-diagrams.html, RSA/rsa.html, Shors Algorithm/shors-algorithm.html, Diffie-Hellman Key Exchange/diffie-hellman-key-exchange.html, Square And Multiply/square-and-multiply.html, Cayley Table Generator/cayley-table-generator.html, Euclidean Algorithm/euclidean-algorithm.html</files>
  <action>
    Each of these ten pages carries its own fully inlined copy of the site nav bar with exactly one `<a class="site-nav-link">` entry that reaches this tool by its old relative path and old label: `href="../Factorize By Completing The Square/factorize-completing-square.html"` with link text `Completing the Square` (found at Congruence Wheel/congruence-wheel.html:331, Sieve Of Eratosthenes/sieve-of-eratosthenes.html:372, Factor Tree/factor-tree.html:323, Venn Diagrams/venn-diagrams.html:336, RSA/rsa.html:183, Shors Algorithm/shors-algorithm.html:155, Diffie-Hellman Key Exchange/diffie-hellman-key-exchange.html:175, Square And Multiply/square-and-multiply.html:162, Cayley Table Generator/cayley-table-generator.html:237, Euclidean Algorithm/euclidean-algorithm.html:258).

    In each of the ten files, rewrite that one nav entry's href to `../Fermats Method/fermats-method.html` and its link text to `Fermat's Method`, preserving the entry's exact position in that page's nav list, its indentation, and every other nav entry untouched. Nav ordering is out of scope for this item — 260928-fdz handles reordering.

    Commit as one atomic change: `feat(260928-fdx): repoint sibling tool nav links to Fermats Method/fermats-method.html`, with the run's required `Co-Authored-By` attribution footer.
  </action>
  <verify>
    <automated>files=$(git grep -l 'Fermats Method/fermats-method\.html' -- 'Congruence Wheel/congruence-wheel.html' 'Sieve Of Eratosthenes/sieve-of-eratosthenes.html' 'Factor Tree/factor-tree.html' 'Venn Diagrams/venn-diagrams.html' 'RSA/rsa.html' 'Shors Algorithm/shors-algorithm.html' 'Diffie-Hellman Key Exchange/diffie-hellman-key-exchange.html' 'Square And Multiply/square-and-multiply.html' 'Cayley Table Generator/cayley-table-generator.html' 'Euclidean Algorithm/euclidean-algorithm.html'); n=$(printf '%s\n' "$files" | awk 'NF' | wc -l | tr -d ' '); test "$n" -eq 10</automated>
    <automated>hrefs=$(git grep -oh 'Fermats Method/fermats-method\.html' -- '*.html'); n=$(printf '%s\n' "$hrefs" | awk 'NF' | wc -l | tr -d ' '); test "$n" -eq 12</automated>
    <automated>navfiles=$(git grep -l "class=\"site-nav-link[^\"]*\">Fermat's Method<" -- '*.html'); n=$(printf '%s\n' "$navfiles" | awk 'NF' | wc -l | tr -d ' '); test "$n" -eq 12</automated>
    <automated>files=$(git ls-files -- '*.html'); test -n "$files"; broken=$(printf '%s\n' "$files" | while IFS= read -r f; do d=$(dirname "$f"); grep -o 'href="[^"]*\.html"' "$f" | sed 's/^href="//; s/"$//' | while IFS= read -r h; do [ -e "$d/$h" ] || echo "BROKEN: $f -> $h"; done; done); printf '%s\n' "$broken"; n=$(printf '%s\n' "$broken" | awk 'NF' | wc -l | tr -d ' '); test "$n" -eq 0</automated>
    <human-check>Open `index.html` in a browser: the "Fermat's Method" nav pill and the 🧩 hub card both open `Fermats Method/fermats-method.html`, whose tab title reads "Fermat's Method — Interactive Visualizer" and whose own "Fermat's Method" nav pill is the active one. From any of the ten sibling pages (e.g. RSA or Shor's Algorithm), the "Fermat's Method" nav link opens the same page — no 404s, no stale "Completing the Square" label anywhere.</human-check>
  </verify>
  <done>All ten sibling pages' nav bars link to `Fermats Method/fermats-method.html` under the label `Fermat's Method`, in their prior nav position. Twelve total in-repo hrefs point at the tool (index.html's nav + card, ten sibling nav links), all twelve pages carry a `Fermat's Method` nav label, and the repo-wide href-resolution gate reports zero broken `.html` links.</done>
</task>

<task type="auto">
  <name>Task 3: Repath living docs (CLAUDE.md, .claude/CLAUDE.md, palette.css, .planning/codebase/*.md) and confirm zero old-name references remain</name>
  <files>CLAUDE.md, .claude/CLAUDE.md, assets/palette.css, .planning/codebase/ARCHITECTURE.md, .planning/codebase/CONCERNS.md, .planning/codebase/STACK.md, .planning/codebase/TESTING.md, .planning/codebase/STRUCTURE.md, .planning/codebase/INTEGRATIONS.md</files>
  <action>
    Update the nine living docs so every mention of the tool uses its new name and path. Throughout, `Factorize By Completing The Square/factorize-completing-square.html` becomes `Fermats Method/fermats-method.html`, a bare `factorize-completing-square.html` becomes `fermats-method.html`, and the shorthand identifier `Completing-the-Square` / `Completing Square` (used mid-sentence as a stand-in for the tool's name, e.g. "Completing-the-Square has MAX_ITER = 50000") becomes `Fermat's Method`. Where a doc's own prose explains the underlying algebra generically rather than naming the tool (only two such spots exist, called out below), reword instead of leaving the retired phrase in place — every doc in scope should end up mentioning `Fermat's Method` and nothing containing `completing`.

    In `CLAUDE.md`: the repository-layout bullet (line 14) becomes `` - `Fermats Method/fermats-method.html` — visualizes integer factoring via Fermat's method (search for a² − N = b²) ``; the playback-controls parenthetical later in the file (line 31, "Sieve and Completing-the-Square tools") becomes "Sieve and Fermat's Method tools".

    In `.claude/CLAUDE.md`: the Key Dependencies bullet (line 46, "Sieve tool, Completing-the-Square tool") becomes "Sieve tool, Fermat's Method tool"; the Component Responsibilities table row (line 199) becomes `` | Fermat's Method Tool | Visualize Fermat's factoring method via algebra → geometry | `Fermats Method/fermats-method.html` | `` — the Responsibility cell already names Fermat's method correctly and does not change.

    In `assets/palette.css`: the `--role-warn`, `--role-special`, and `--role-result` custom properties (lines 46, 47, 53) each carry a trailing comment naming this tool once, alongside Sieve/tree/RSA, as a usage example. Replace each tool-name mention with `Fermat's Method`, changing only that one phrase per line — leave every other named tool, the property values, and the rest of each comment's wording untouched.

    In `.planning/codebase/ARCHITECTURE.md`, two spots:
    First, the System Overview ASCII diagram's third box column (between the Factor Tree and Congruence Wheel boxes, 16 characters of interior width per row, rows 25–33). Row 25 currently reads " Completing the " and becomes " Fermat's       " (1 leading space, then `Fermat's`, then trailing spaces to fill 16). Row 26 " Square         " becomes " Method         " (1 leading space, `Method`, pad to 16). Row 27 (currently a space, a backtick, "Factorize", then padding to 16) becomes a space, a backtick, "Fermats", then padding to 16 — i.e. exactly the 16-character string: space, backtick, F-e-r-m-a-t-s, then 7 trailing spaces. Row 28 (currently 2 spaces, "By.../...", a backtick, then padding to 16) becomes 2 spaces, "Method/...", a backtick, then 3 trailing spaces — again exactly 16 characters total. Row 29 is blank and stays 16 spaces. Row 30 " · Completing   " becomes " · Fermat's     " (1 leading space, then `· Fermat's`, pad to 16). Row 31 "   square viz   " becomes " factoring      " (1 leading space, `factoring`, pad to 16). Row 32 " · Animation    " becomes " · Geometric    " (1 leading space, then `· Geometric`, pad to 16). Row 33 "   controls     " becomes " picture        " (1 leading space, `picture`, pad to 16). Every other column on every one of those 9 rows is untouched, so each row's total character length stays exactly what it was — the 9 multi-box body rows must still measure lengths in {90, 91} after the edit.
    Second, the Component Responsibilities table row (line 57) becomes `` | Fermat's Method Tool | Visualize Fermat's factoring method via algebra → geometry | `Fermats Method/fermats-method.html` | ``.

    In `.planning/codebase/CONCERNS.md`, apply the path and shorthand substitutions described above at every one of its ten occurrences (lines 14, 23, 40, 41, 50, 52, 69, 71, 117, 127) — these are file-path lists and two "Completing-the-Square has/caps ..." sentences (lines 52, 71) plus one "Completing-the-Square: Trial loop runs..." sentence (line 127); nothing else on those lines changes.

    In `.planning/codebase/STACK.md` (line 51), "Sieve tool, Completing-the-Square tool" becomes "Sieve tool, Fermat's Method tool".

    In `.planning/codebase/TESTING.md`: the `open "..."` example command (line 26) gets the path substitution; the section heading (line 74) `**Factorize by Completing the Square** (\`Factorize By Completing The Square/factorize-completing-square.html\`):` becomes `**Fermat's Method** (\`Fermats Method/fermats-method.html\`):` — leave the bullet list under that heading as-is even though it already looks stale (it describes coefficient inputs this tool doesn't have); that inaccuracy predates this item and is out of scope.

    In `.planning/codebase/STRUCTURE.md`: the directory-tree heading line (28) `├── Factorize By Completing The Square/` becomes `├── Fermats Method/`; the file line directly under it (29) currently reads `` │   ├── factorize-completing-square.html  # Fermat's factoring method viz `` with its `#` at column 42 — replace it with `` │   ├── fermats-method.html          # Fermat's factoring method viz `` (ten spaces between the filename and the `#`), which lands the `#` back at column 37, matching every sibling row in that tree. The subheading (69) `` **`Factorize By Completing The Square/`:** `` becomes `` **`Fermats Method/`:** ``. The purpose line (71) currently reads "Purpose: Fermat's factoring method via completing-the-square algebra" — reword to "Purpose: Fermat's factoring method — searches for a² − N = b² and turns the algebra into a picture" (this is the second of the two generic-phrasing spots; it is not naming the tool, it is describing the technique, but the retired phrase still has to go). The key-files line (73) gets the bare-filename substitution. The Entry Points inventory line (111) `` - `Factorize By Completing The Square/factorize-completing-square.html` — Completing square tool `` becomes `` - `Fermats Method/fermats-method.html` — Fermat's Method tool ``. The modPow bullet (124) "(RSA tool, Completing square tool)" becomes "(RSA tool, Fermat's Method tool)".

    In `.planning/codebase/INTEGRATIONS.md` (line 20), "(Factor Tree, Completing-the-Square tools)" becomes "(Factor Tree, Fermat's Method tools)".

    Do not touch `STATE.md`, `PROJECT.md`, `ROADMAP.md`, or anything under `.planning/phases/`, `.planning/quick/`, `.planning/quick-batches/`, `.planning/research/`, `.planning/debug/` — those are dated records of what was true when written, not living docs, matching the precedent 260926-rba set for this exact distinction.

    Commit as one atomic change: `docs(260928-fdx): repath living docs from Completing The Square to Fermat's Method`, with the run's required `Co-Authored-By` attribution footer.
  </action>
  <verify>
    <automated>python3 -c "ls=open('.planning/codebase/ARCHITECTURE.md',encoding='utf-8').read().split(chr(10)); rows=[l for l in ls if l.startswith(chr(9474)) and (chr(9474)+' '+chr(9474)) in l]; assert len(rows)==9, len(rows); assert sorted(set(len(r) for r in rows))==[90,91], sorted(set(len(r) for r in rows)); print('diagram alignment OK')"</automated>
    <automated>python3 -c "ls=open('.planning/codebase/STRUCTURE.md',encoding='utf-8').read().split(chr(10)); bad=[l for l in ls if 'fermats-method.html' in l and '#' in l and l.index('#')!=37]; assert not bad, bad; print('tree comment column OK')"</automated>
    <automated>docs=$(git grep -l "Fermat" -- CLAUDE.md .claude/CLAUDE.md assets/palette.css '.planning/codebase/*.md'); n=$(printf '%s\n' "$docs" | awk 'NF' | wc -l | tr -d ' '); test "$n" -eq 9</automated>
    <automated>out=$(grep -rniI "completing" --exclude-dir=.git --exclude-dir=.gsd --exclude-dir=quick --exclude-dir=quick-batches --exclude-dir=phases --exclude-dir=research --exclude-dir=debug --exclude=claude_remark_scratchpad --exclude=STATE.md --exclude=PROJECT.md --exclude=ROADMAP.md . || true); printf '%s\n' "$out"; test -z "$out"</automated>
  </verify>
  <done>All nine living docs name and path the tool as `Fermat's Method` / `Fermats Method/fermats-method.html` (all nine contain "Fermat" after the edit). The ARCHITECTURE.md diagram's 9 multi-box body rows still measure lengths in {90, 91}; STRUCTURE.md's tree keeps its `#` comments at column 37. The repo-wide scan (excluding `.git`, `.gsd`, historical planning directories, `STATE.md`/`PROJECT.md`/`ROADMAP.md`, and the untracked scratch note) finds zero remaining occurrences of the old name in any casing or hyphenation.</done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|--------------|
| browser → static file (`file://` or static host) | The only boundary this item touches. Navigation follows in-repo relative hrefs; there is no server, no request handler, and no user input crossing a network boundary in this change. |
| repo → session-residue file | `CLAUDE_RESUME_COMMAND` is a tracked file holding a session id; the rename relocates it without reading or rewriting it. |

## STRIDE Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation Plan |
|-----------|----------|-----------|----------|-------------|------------------|
| T-fdx-01 | Tampering | in-repo relative hrefs across all twelve HTML pages | low | mitigate | Task 2's href-resolution gate walks every tracked `.html` file, extracts each `href="*.html"`, and asserts the target exists on disk relative to the containing file — a partial rename that leaves a dangling nav link fails the task. Baseline is verified clean, so any breakage is attributable to this change. |
| T-fdx-02 | Denial of Service | the retired `Factorize By Completing The Square/factorize-completing-square.html` path | low | accept | Stale external bookmarks and deep links will 404. This is a static site with no redirect layer — neither `file://` nor plain static hosting can rewrite paths — and adding a stub redirect file would reintroduce the retired name this item exists to remove. The tool stays reachable from the hub card and from every page's nav. Same disposition as the RSA Examplifier → RSA and prior directory renames. |
| T-fdx-03 | Information Disclosure | `Fermats Method/CLAUDE_RESUME_COMMAND` (session id residue) | low | accept | Pre-existing tracked file, moved verbatim per the repo convention of leaving session residue as-is. This item does not change its content, visibility, or tracking status, so it neither adds nor reduces exposure. |
| T-fdx-SC | Tampering | npm/pip/cargo installs | low | accept | No package installs. The repo has no package manager, lockfile, or build step, and this item adds none — the Package Legitimacy Gate is not applicable. |
</threat_model>

<verification>
Run after all three commits land:

- The Task 3 repo-wide scoped negative grep passes — the retired name is gone from every shipped file and every living doc.
- Repo-wide href resolution reports zero broken in-repo `.html` links (the Task 2 gate, re-run).
- `hist=$(git log --follow --oneline -- "Fermats Method/fermats-method.html"); n=$(printf '%s\n' "$hist" | awk 'NF' | wc -l | tr -d ' '); test "$n" -gt 1` — history survived the move.
- `stat=$(git show --stat HEAD~2); printf '%s\n' "$stat" | grep -q CLAUDE_RESUME_COMMAND` — the session-residue file appears as a 0-change rename in the Task 1 commit.
- `st=$(git status --porcelain -- STATE.md PROJECT.md ROADMAP.md .planning/phases .planning/quick .planning/quick-batches .planning/research .planning/debug); test -z "$st"` — historical/dated artifacts untouched.
- Exactly three commits produced: two `feat(260928-fdx)` and one `docs(260928-fdx)`.
</verification>

<success_criteria>
- The tool is at `Fermats Method/fermats-method.html`; the retired directory no longer exists.
- Tab title, page `<h1>`, hub card heading, and all twelve nav labels read `Fermat's Method`.
- Twelve in-repo hrefs reach the tool and all resolve; no other page's links broke.
- Git history preserved for both moved files; the resume file is byte-identical.
- Every page keeps its prior nav order and exactly one `is-active` link (nav reordering deferred to 260928-fdz).
- Tool behavior, copy beyond the renamed title/heading, CSS, and storage usage unchanged.
- Living docs (CLAUDE.md, .claude/CLAUDE.md, assets/palette.css, .planning/codebase/*.md) name and path the tool correctly, with diagram and tree alignment intact.
- Historical planning records (STATE.md, PROJECT.md, ROADMAP.md, and dated `.planning/` subdirectories) unmodified.
</success_criteria>

<output>
Create `.planning/quick/260928-fdx-rename-the-tool-completing-the-square-to-fermat-s-method-eve/260928-fdx-SUMMARY.md` when done.

The SUMMARY must record: (1) the file-overlap coordination with sibling batch items 260928-fdy (also edits `Congruence Wheel/congruence-wheel.html`) and 260928-fdz (its reorder depends on this rename's `Fermats Method/fermats-method.html` path existing); (2) the pre-existing inaccuracy noted but left untouched in `.planning/codebase/TESTING.md` (its Fermat's Method section describes quadratic-coefficient inputs the tool doesn't have); (3) the historical-vs-living-doc distinction applied to `STATE.md`/`PROJECT.md`/`ROADMAP.md`, matching the 260926-rba precedent.
</output>
