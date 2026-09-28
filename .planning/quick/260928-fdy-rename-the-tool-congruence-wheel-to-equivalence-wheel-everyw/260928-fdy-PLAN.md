---
phase: quick-260928-fdy
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - Equivalence Wheel/equivalence-wheel.html
  - Equivalence Wheel/CLAUDE_RESUME_COMMAND
  - index.html
  - Cayley Table Generator/cayley-table-generator.html
  - Diffie-Hellman Key Exchange/diffie-hellman-key-exchange.html
  - Factor Tree/factor-tree.html
  - Factorize By Completing The Square/factorize-completing-square.html
  - RSA/rsa.html
  - Sieve Of Eratosthenes/sieve-of-eratosthenes.html
  - Venn Diagrams/venn-diagrams.html
  - Square And Multiply/square-and-multiply.html
  - Shors Algorithm/shors-algorithm.html
  - Euclidean Algorithm/euclidean-algorithm.html
  - CLAUDE.md
files_deleted:
  - Congruence Wheel/congruence-wheel.html
  - Congruence Wheel/CLAUDE_RESUME_COMMAND
autonomous: true
requirements: [NAV-01, NAV-02]

estimate:
  tokens: 65000
  raw_tokens: 65000
  tasks: 2
  confidence: low

must_haves:
  truths:
    - "The tool lives at `Equivalence Wheel/equivalence-wheel.html` — directory and filename both match the display name the user sees. No shipped `.html` file, and no file under `assets/`, contains the substring `congruence` in any case."
    - "Every user-visible surface reads `Equivalence Wheel`: the browser tab title (`The Equivalence Wheel`), the page `<h1>` (`The Equivalence Wheel`), the hub card heading in `index.html` (`The Equivalence Wheel`), and the nav label on all twelve pages (`Equivalence Wheel`, exactly one marked `is-active` — on the tool's own page)."
    - "All fifteen in-repo occurrences of the qualified path (hrefs plus the one code comment that names it) resolve to `Equivalence Wheel/equivalence-wheel.html`, an existing file — clicking `Equivalence Wheel` from any of the other eleven pages, the hub card, or the Cayley Table Generator's dedicated cross-link opens the tool rather than a 404, and no other page's links broke in the process."
    - "Git history for both the tool's HTML file and its `CLAUDE_RESUME_COMMAND` survives the move as a rename (git-mv rename detection), and the resume file's content is byte-identical to before."
    - "All twelve pages (`index.html` plus eleven tool pages) still carry the same twelve nav links in the same relative order, with exactly one marked `is-active` per tool page."
    - "The tool's `localStorage` key is renamed from `congruence-wheel` to `equivalence-wheel` for naming consistency with the new identity; this is a deliberate, pre-approved behavior change — any pre-existing saved N/depth/mode state under the old key is abandoned and the tool falls back to its built-in defaults (N=10, depth=6, additive mode) on next load. No code reads the old key any more."
    - "The Cayley Table Generator's two-way cross-link keeps working in both directions: its dedicated xref paragraph and its `mode`/`n` URL-param-carrying JS href builder (`updateWheelXref`) both point at the new path, and the Equivalence Wheel's own `readModeNParams()` still accepts inbound `?mode=&n=` query params from Cayley completely unchanged (that function's logic is untouched by this rename)."
    - "Downloaded export filenames (PNG/SVG, via `exportFileName`) now read `equivalence-wheel-N<n>-depth<d>-...` instead of `congruence-wheel-...`, matching the tool's new identity."
    - "Root `CLAUDE.md`'s repository-layout listing names the tool `Equivalence Wheel/equivalence-wheel.html`, not the retired name."
    - "GSD-managed docs (`.claude/CLAUDE.md`, all of `.planning/codebase/*.md`) and every dated planning artifact (`.planning/ROADMAP.md`, `.planning/PROJECT.md`, `.planning/REQUIREMENTS.md`, `.planning/STATE.md`, `.planning/phases/`, `.planning/quick/`, `.planning/research/`, `.planning/debug/`) are left untouched by this plan — they are machine-generated (refreshed wholesale by a future `/gsd-map-codebase` run, not hand-patched here) or dated records of decisions made under the old name."
    - "No other tool's math, copy, CSS, or unrelated behavior changed — every edit in this plan is a name/path substitution, nothing else."
  artifacts:
    - "Equivalence Wheel/equivalence-wheel.html (git-mv renamed from the retired path, history preserved)"
    - "Equivalence Wheel/CLAUDE_RESUME_COMMAND (moved with the directory, content unchanged)"
    - "index.html"
    - "Cayley Table Generator/cayley-table-generator.html"
    - "CLAUDE.md"
  key_links:
    - "index.html nav href -> Equivalence Wheel/equivalence-wheel.html"
    - "index.html hub card href -> Equivalence Wheel/equivalence-wheel.html"
    - "nine sibling tool pages' nav href -> ../Equivalence Wheel/equivalence-wheel.html (Diffie-Hellman Key Exchange, Factor Tree, Factorize By Completing The Square, RSA, Sieve Of Eratosthenes, Venn Diagrams, Square And Multiply, Shors Algorithm, Euclidean Algorithm)"
    - "Cayley Table Generator nav href + dedicated xref anchor + JS updateWheelXref() href -> ../Equivalence Wheel/equivalence-wheel.html (the JS one carries ?mode=...&n=...)"
    - "Equivalence Wheel/equivalence-wheel.html self nav href -> equivalence-wheel.html (bare filename, same directory, is-active)"
    - "CLAUDE.md repository-layout bullet -> Equivalence Wheel/equivalence-wheel.html"
---

<objective>
Rename this repo's "Congruence Wheel" tool to "Equivalence Wheel" on every surface at once: the directory, the filename, the three self-references inside the page, its `localStorage` key, its export filename, the eleven in-repo hrefs that reach it (nine plain nav links, the Cayley Table Generator's nav link plus its dedicated two-way cross-link, and the hub card), and the one root living doc (`CLAUDE.md`) that inventories it by path.

Purpose: The tool's display name is being retired in favor of the more precise term for what it actually visualizes — equivalence classes modulo N — matching the naming precedent already set by this repo's other tool renames (Christmas Trees → Factor Tree, Pizza Slices → Congruence Wheel, RSA Examplifier → RSA). This item is independent of, and does not perform, the separate nav-reorder batch item (260928-fdz), which depends on this rename landing first.

Output: `Equivalence Wheel/equivalence-wheel.html` reachable from the hub and every one of the other eleven pages (unchanged nav order), plus the one root doc that paths it correctly.

Scope guard: this is rename-only. No math, no narrative copy, no CSS, and no behavior changes beyond the deliberate `localStorage` key rename (see must_haves). Two commits: one `feat` commit for the directory/file rename plus every shipped-code repoint, one `docs` commit for the single root-doc fix plus the final repo-wide verification sweep.

Explicitly out of scope (do not touch): `.claude/CLAUDE.md` and every file under `.planning/codebase/` are GSD-managed/generated (each carries `<!-- GSD:*-start source:... -->` sync markers, or is the literal source those markers point at) and are already stale in unrelated ways (e.g. `.planning/codebase/STRUCTURE.md` and `ARCHITECTURE.md` currently document only 5 of this repo's 11 tools) — hand-patching just the one line this rename touches would leave them in a worse, partially-stale state than leaving them alone; they get refreshed wholesale by a future `/gsd-map-codebase` run. `.planning/ROADMAP.md`, `.planning/PROJECT.md`, `.planning/REQUIREMENTS.md`, `.planning/STATE.md`, and every file under `.planning/phases/`, `.planning/quick/`, `.planning/research/`, `.planning/debug/` are dated records of decisions made when the tool was still called "Congruence Wheel" — the Christmas-Trees and RSA-Examplifier rename precedents (commits `481d5d0`, and `260926-rba`'s docs commit) both deliberately left the equivalent historical files alone.

<!-- planner-discipline-allow: congruence -->
<!-- planner-discipline-allow: Congruence -->
<!-- planner-discipline-allow: congruence-wheel -->
<!-- planner-discipline-allow: Congruence Wheel -->
</objective>

<execution_context>
@~/.claude/gsd-core/workflows/execute-plan.md
@~/.claude/gsd-core/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/STATE.md
@CLAUDE.md

Baseline facts established during planning (do not re-derive):

- The retired name appears in exactly 12 tracked files outside the historical/generated docs this plan deliberately skips: 12 `.html` files (all of them — this repo has exactly 12 tracked `.html` files: 11 tools + `index.html`) plus `CLAUDE.md`. Nothing under `assets/` mentions it.
- Line-exact baseline (do not re-grep to rediscover these — apply directly): `Equivalence Wheel/equivalence-wheel.html` itself has 6 matching lines (title, h1, self-nav link, localStorage getItem, localStorage setItem, exportFileName's raw string) at pre-rename line numbers 7, 332, 354, 495, 748, 891. `index.html` has 3 matching lines (nav href/label at 153, card href at 201, card `<h2>` at 224). `Cayley Table Generator/cayley-table-generator.html` has 7 matching lines: two prose comments (17, 340), one section-marker comment (105), one path-bearing code comment (381), the nav link (238), the static xref anchor (264), and the JS href builder in `updateWheelXref()` (698). The other nine tool pages (`Diffie-Hellman Key Exchange`, `Factor Tree`, `Factorize By Completing The Square`, `RSA`, `Sieve Of Eratosthenes`, `Venn Diagrams`, `Square And Multiply`, `Shors Algorithm`, `Euclidean Algorithm`) each have exactly one matching line: a nav link of the exact form `<a href="../Congruence Wheel/congruence-wheel.html" class="site-nav-link">Congruence Wheel</a>`.
- Repo-wide baseline counts to preserve (same numbers must hold post-rename, just with the new name): `git grep -o 'Congruence Wheel/congruence-wheel\.html' -- '*.html'` → 15 matches (this pattern also catches the Cayley comment at line 381, which is prose, not a real href). `git grep -o 'class="site-nav-link[^"]*">Congruence Wheel<' -- '*.html'` → 12 matches (one per tracked `.html` file, i.e. one per page). Repo-wide in-repo `.html` href resolution is currently clean (zero broken links) — that is the baseline Task 1's gate must preserve.
- The tool's only `localStorage` key is `'congruence-wheel'` (JSON: `{N, depth, mode}`), read once at load inside a try/catch and written by `persist()`. There is no other consumer of that key anywhere in the repo.
- `Equivalence Wheel/CLAUDE_RESUME_COMMAND` is a stray session-residue file (a `claude --resume <session-id>` command) with no naming content to fix — it travels with the directory unread and unmodified.
</context>

<tasks>

<task type="tracer">
  <name>Task 1: Rename directory and file to Equivalence Wheel, repoint every shipped-code reference</name>
  <files>Equivalence Wheel/equivalence-wheel.html, Equivalence Wheel/CLAUDE_RESUME_COMMAND, index.html, Cayley Table Generator/cayley-table-generator.html, Diffie-Hellman Key Exchange/diffie-hellman-key-exchange.html, Factor Tree/factor-tree.html, Factorize By Completing The Square/factorize-completing-square.html, RSA/rsa.html, Sieve Of Eratosthenes/sieve-of-eratosthenes.html, Venn Diagrams/venn-diagrams.html, Square And Multiply/square-and-multiply.html, Shors Algorithm/shors-algorithm.html, Euclidean Algorithm/euclidean-algorithm.html</files>
  <precondition>`git status --porcelain -- '*.html'` reports no modified tracked HTML files, so this rename commit carries only rename-related changes and no in-flight edits from a sibling batch item (this batch also touches Venn Diagrams and Factorize By Completing The Square under items 260928-fdw and 260928-fdx).</precondition>
  <reversibility rating="reversible">Renaming the `localStorage` key drops any already-saved N/depth/mode for returning visitors, but the tool falls back to its documented defaults with no error — a settings reset, not a data-loss incident, and the calling investigation guidance already pre-approved this exact tradeoff.</reversibility>
  <action>
    Move the tool with git so history is preserved, in two steps so the session-residue file travels with the directory as a pure rename: first `git mv "Congruence Wheel" "Equivalence Wheel"`, then `git mv "Equivalence Wheel/congruence-wheel.html" "Equivalence Wheel/equivalence-wheel.html"`. Do not open, edit, or reformat `Equivalence Wheel/CLAUDE_RESUME_COMMAND` — it must stay byte-identical, recorded by git as a 0-change rename.

    In `Equivalence Wheel/equivalence-wheel.html` change exactly six lines and nothing else: the `<title>` becomes `The Equivalence Wheel`; the self nav link becomes `href="equivalence-wheel.html"` with link text `Equivalence Wheel`, keeping its `class="site-nav-link is-active"` and the bare same-directory filename convention every tool's self-link uses; the page-header `<h1>` becomes `The Equivalence Wheel`; the `localStorage.getItem(...)` restore call and the `localStorage.setItem(...)` call inside `persist()` both switch their key literal from `'congruence-wheel'` to `'equivalence-wheel'`; and `exportFileName`'s leading string literal switches from `'congruence-wheel'` to `'equivalence-wheel'`. Leave every other line — all CSS, the `MODES` config, `render()`, `select()`, `readModeNParams()`, the SVG/PNG/PDF export machinery, the theme bootstrap script, and the Cayley cross-link (`updateCayleyXref`, `xrefCayleyEl`) — completely untouched; none of them contain the retired name.

    In `index.html` change three things: the nav link becomes `href="Equivalence Wheel/equivalence-wheel.html"` with link text `Equivalence Wheel`; the hub card anchor becomes `href="Equivalence Wheel/equivalence-wheel.html"`; the card's `<h2>` becomes `The Equivalence Wheel`. The card's icon SVG (`.wheel-icon-*` classes) and its descriptive `<p>` already avoid the old name — leave both as written.

    In each of the nine sibling tool pages (`Diffie-Hellman Key Exchange`, `Factor Tree`, `Factorize By Completing The Square`, `RSA`, `Sieve Of Eratosthenes`, `Venn Diagrams`, `Square And Multiply`, `Shors Algorithm`, `Euclidean Algorithm`), rewrite the single nav line to `<a href="../Equivalence Wheel/equivalence-wheel.html" class="site-nav-link">Equivalence Wheel</a>`, preserving that file's existing indentation and the link's position in the nav order.

    In `Cayley Table Generator/cayley-table-generator.html` change seven lines: the nav line matches the sibling-page pattern above; the `<p class="xref">` anchor's `href` becomes `../Equivalence Wheel/equivalence-wheel.html` (its `id="xref-wheel"` and its link text, which only says "a wheel" generically, are untouched); the `MAX_N` comment's "exactly double the Congruence Wheel's max=\"60\"" becomes "the Equivalence Wheel's max=\"60\""; the localStorage-guard comment's path citation "Congruence Wheel/congruence-wheel.html:486-491" becomes "Equivalence Wheel/equivalence-wheel.html:486-491" (keep the line-number citation verbatim — correcting its drift is unrelated to this rename); the `:root` comment's "echoing the Congruence Wheel's own triad" becomes "echoing the Equivalence Wheel's own triad"; the section-marker comment "duplicated from Congruence Wheel" becomes "duplicated from Equivalence Wheel"; and `updateWheelXref()`'s href-builder string switches its path segment from `'../Congruence Wheel/congruence-wheel.html?mode='` to `'../Equivalence Wheel/equivalence-wheel.html?mode='`. The `xrefWheelEl` variable name and the `updateWheelXref` function name are left unchanged — they name the visual metaphor ("wheel"), which the renamed tool still is, not the retired word.

    Do not leave any trace of the retired name in a shipped file: no HTML comment, no attribute, no "formerly" prose recording the rename anywhere in code. The commit message is where that history belongs.

    Commit as one atomic change: `feat(260928-fdy): rename Congruence Wheel dir/file to Equivalence Wheel, repoint links`, with the run's required `Co-Authored-By` attribution footer.
  </action>
  <verify>
    <automated>out=$(git grep -in 'congruence' -- '*.html' 'assets/' || true); printf '%s\n' "$out"; test -z "$out"</automated>
    <automated>test -f "Equivalence Wheel/equivalence-wheel.html" && test -f "Equivalence Wheel/CLAUDE_RESUME_COMMAND" && test ! -e "Congruence Wheel"</automated>
    <automated>files=$(git ls-files -- '*.html'); test -n "$files"; broken=$(printf '%s\n' "$files" | while IFS= read -r f; do d=$(dirname "$f"); grep -o 'href="[^"]*\.html"' "$f" | sed 's/^href="//; s/"$//' | while IFS= read -r h; do [ -e "$d/$h" ] || echo "BROKEN: $f -> $h"; done; done); printf '%s\n' "$broken"; n=$(printf '%s\n' "$broken" | awk 'NF' | wc -l | tr -d ' '); test "$n" -eq 0</automated>
    <automated>hrefs=$(git grep -oh 'Equivalence Wheel/equivalence-wheel\.html' -- '*.html'); n=$(printf '%s\n' "$hrefs" | awk 'NF' | wc -l | tr -d ' '); test "$n" -eq 15</automated>
    <automated>navlabels=$(git grep -oh 'class="site-nav-link[^"]*">Equivalence Wheel<' -- '*.html'); n=$(printf '%s\n' "$navlabels" | awk 'NF' | wc -l | tr -d ' '); test "$n" -eq 12</automated>
    <automated>keyhits=$(git grep -oh "'equivalence-wheel'" -- 'Equivalence Wheel/equivalence-wheel.html'); n=$(printf '%s\n' "$keyhits" | awk 'NF' | wc -l | tr -d ' '); test "$n" -eq 2</automated>
    <automated>ren=$(git diff --cached --name-status -M); n=$(printf '%s\n' "$ren" | awk '$1 ~ /^R/' | wc -l | tr -d ' '); test "$n" -eq 2</automated>
    <human-check>Open `Equivalence Wheel/equivalence-wheel.html` in a browser: the tab title reads "The Equivalence Wheel", the page heading reads "The Equivalence Wheel", and the "Equivalence Wheel" nav pill is the active one. Change N and depth, reload, and confirm the new values persist (now under the `equivalence-wheel` key). From `index.html`, both the nav link and the hub card open the tool. From `Cayley Table Generator/cayley-table-generator.html`, its "seen as wedges on a wheel" cross-link opens the Equivalence Wheel pre-set to the same mode and N; the reverse cross-link back to the Cayley table also still works.</human-check>
  </verify>
  <done>One commit exists renaming the directory and file to `Equivalence Wheel/equivalence-wheel.html` with git rename detection intact for both moved files. The retired name appears in zero shipped `.html` or `assets/` files. Fifteen occurrences of the qualified path and twelve nav labels read `Equivalence Wheel`/`Equivalence Wheel/equivalence-wheel.html`, the repo-wide href-resolution gate reports zero broken links, and the tool's `localStorage` key is `equivalence-wheel` in both its read and write sites.</done>
</task>

<task type="auto">
  <name>Task 2: Repath the one root living doc and run the final repo-wide verification sweep</name>
  <files>CLAUDE.md</files>
  <action>
    In root `CLAUDE.md`'s "Repository layout" section, change the one bullet naming this tool from `` `Congruence Wheel/congruence-wheel.html` — "Congruence Wheel," a modular arithmetic visualizer using pizza-slice sectors `` to `` `Equivalence Wheel/equivalence-wheel.html` — "Equivalence Wheel," a modular arithmetic visualizer using pizza-slice sectors ``. Change nothing else in the file — its other four tool bullets, its architecture-pattern section, and its "Repository layout" preamble are unaffected by this rename and already describe conventions this plan follows, not the retired name.

    Do not touch `.claude/CLAUDE.md` or any file under `.planning/codebase/` (GSD-managed/generated — see the objective's scope guard) or any dated planning artifact (`.planning/ROADMAP.md`, `.planning/PROJECT.md`, `.planning/REQUIREMENTS.md`, `.planning/STATE.md`, `.planning/phases/`, `.planning/quick/`, `.planning/research/`, `.planning/debug/`) — those are historical records of decisions made under the old name and are deliberately left as-is, matching the Christmas-Trees and RSA-Examplifier rename precedents.

    Commit as `docs(260928-fdy): repath CLAUDE.md from Congruence Wheel to Equivalence Wheel`, with the run's required `Co-Authored-By` attribution footer.
  </action>
  <verify>
    <automated>out=$(git grep -in 'congruence' -- ':!.planning' || true); printf '%s\n' "$out"; test -z "$out"</automated>
    <automated>doc=$(git grep -l 'Equivalence Wheel/equivalence-wheel\.html' -- CLAUDE.md); test -n "$doc"</automated>
    <automated>files=$(git ls-files -- '*.html'); broken=$(printf '%s\n' "$files" | while IFS= read -r f; do d=$(dirname "$f"); grep -o 'href="[^"]*\.html"' "$f" | sed 's/^href="//; s/"$//' | while IFS= read -r h; do [ -e "$d/$h" ] || echo "BROKEN: $f -> $h"; done; done); printf '%s\n' "$broken"; n=$(printf '%s\n' "$broken" | awk 'NF' | wc -l | tr -d ' '); test "$n" -eq 0</automated>
    <automated>hist=$(git log --follow --oneline -- "Equivalence Wheel/equivalence-wheel.html"); n=$(printf '%s\n' "$hist" | awk 'NF' | wc -l | tr -d ' '); test "$n" -gt 1</automated>
    <automated>st=$(git status --porcelain -- .planning/ROADMAP.md .planning/PROJECT.md .planning/REQUIREMENTS.md .planning/STATE.md .planning/phases .planning/quick .planning/research .planning/debug .claude/CLAUDE.md .planning/codebase); test -z "$st"</automated>
  </verify>
  <done>A second commit exists updating `CLAUDE.md`'s repository-layout bullet. The retired name survives nowhere in the repo outside `.planning/` (confirmed unmodified there). Git history for the moved HTML file spans more than one commit (the move survived as a rename). Repo-wide href resolution remains clean.</done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| browser → static file (`file://` or static host) | The only boundary this item touches. Navigation follows in-repo relative hrefs; there is no server, no request handler, and no user input crossing a network boundary in this change. |
| repo → session-residue file | `CLAUDE_RESUME_COMMAND` is a tracked file holding a session id; the rename relocates it without reading or rewriting it. |
| browser → `localStorage` | The key rename is a client-side-only change; no data leaves the browser, and the old key's stale value (if any) is simply never read again. |

## STRIDE Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation Plan |
|-----------|----------|-----------|----------|-------------|-----------------|
| T-fdy-01 | Tampering | in-repo relative hrefs across twelve HTML pages | low | mitigate | Task 1's href-resolution gate walks every tracked `.html`, extracts each `href="*.html"`, and asserts the target exists on disk relative to the containing file — a partial rename that leaves a dangling nav or cross-link fails the task. Baseline is verified clean, so any breakage is attributable to this change. Task 2 re-runs the same gate as a final sweep. |
| T-fdy-02 | Denial of Service | the retired `Congruence Wheel/congruence-wheel.html` path | low | accept | Stale external bookmarks and deep links will 404. This is a static site with no redirect layer — neither `file://` nor plain static hosting can rewrite paths — and adding a stub redirect file would reintroduce the retired name the item exists to remove. The tool stays reachable from the hub card and from every page's nav, plus the Cayley Table Generator's dedicated cross-link. Same disposition as the RSA-Examplifier and Christmas-Trees rename precedents. |
| T-fdy-03 | Information Disclosure | `Equivalence Wheel/CLAUDE_RESUME_COMMAND` (session id residue) | low | accept | Pre-existing tracked file, moved verbatim per repo convention. This item does not change its content, visibility, or tracking status. |
| T-fdy-04 | Repudiation | `localStorage` key rename silently drops prior saved state | low | accept | Client-side-only, non-destructive to any file or record outside the visitor's own browser; the tool falls back to documented defaults with no error. Pre-approved as acceptable for this internal single-page tool by the calling investigation guidance. |
| T-fdy-SC | Tampering | npm/pip/cargo installs | low | accept | No package installs. The repo has no package manager, lockfile, or build step, and this item adds none — the Package Legitimacy Gate is not applicable. |
</threat_model>

<verification>
Run after both commits land:

- The scoped negative grep from Task 2 passes — the retired name is gone from every file outside `.planning/`.
- Repo-wide href resolution reports zero broken in-repo `.html` links (Task 1's gate, re-run by Task 2).
- `hist=$(git log --follow --oneline -- "Equivalence Wheel/equivalence-wheel.html"); n=$(printf '%s\n' "$hist" | awk 'NF' | wc -l | tr -d ' '); test "$n" -gt 1` — history survived the move.
- `stat=$(git show --stat HEAD~1); case "$stat" in *CLAUDE_RESUME_COMMAND*) true ;; *) false ;; esac` — the session-residue file appears as a 0-change rename in Task 1's commit.
- `st=$(git status --porcelain -- .planning/ROADMAP.md .planning/PROJECT.md .planning/REQUIREMENTS.md .planning/STATE.md .planning/phases .planning/quick .planning/research .planning/debug .claude/CLAUDE.md .planning/codebase); test -z "$st"` — every historical/generated doc untouched.
- Exactly two commits produced: one `feat(260928-fdy)`, one `docs(260928-fdy)`.
</verification>

<success_criteria>
- The tool is at `Equivalence Wheel/equivalence-wheel.html`; the retired directory no longer exists.
- Tab title, page `<h1>`, hub card heading, and all twelve nav labels read `Equivalence Wheel` (or `The Equivalence Wheel` where the original said "The").
- Fifteen qualified-path occurrences and twelve nav-label occurrences all resolve; no other page's links broke.
- Git history preserved for both moved files; the resume file is byte-identical.
- Twelve nav links in the same order on all twelve pages, exactly one active per tool page.
- The Cayley Table Generator's two-way cross-link (static xref anchor and JS `mode`/`n`-carrying href) both work in both directions.
- The tool's `localStorage` key is `equivalence-wheel`; old saved state under `congruence-wheel` is intentionally abandoned.
- Downloaded export filenames read `equivalence-wheel-...`.
- Root `CLAUDE.md` paths the tool correctly.
- `.claude/CLAUDE.md`, `.planning/codebase/`, and every dated planning artifact are unmodified.
- This item does not perform the nav reorder — item 260928-fdz depends on this rename and handles ordering separately.
</success_criteria>

<output>
Create `.planning/quick/260928-fdy-rename-the-tool-congruence-wheel-to-equivalence-wheel-everyw/260928-fdy-SUMMARY.md` when done.

The SUMMARY must record: (1) the exact new path `Equivalence Wheel/equivalence-wheel.html` and the renamed `localStorage` key, so sibling batch item 260928-fdz (nav reorder) and any future work can rely on them; (2) the deliberate scope decision to leave `.claude/CLAUDE.md`, `.planning/codebase/*.md`, and dated planning artifacts untouched, and why; (3) any file-overlap this plan has with sibling batch items `260928-fdw` (Venn Diagrams) or `260928-fdx` (Factorize By Completing The Square rename) if their execution windows overlapped.
</output>
