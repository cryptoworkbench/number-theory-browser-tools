---
phase: quick-260926-rba
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - RSA/rsa.html
  - RSA/CLAUDE_RESUME_COMMAND
  - index.html
  - Congruence Wheel/congruence-wheel.html
  - Diffie-Hellman Key Exchange/diffie-hellman-key-exchange.html
  - Factor Tree/factor-tree.html
  - Factorize By Completing The Square/factorize-completing-square.html
  - Sieve Of Eratosthenes/sieve-of-eratosthenes.html
  - Venn Diagrams/venn-diagrams.html
  - CLAUDE.md
  - .claude/CLAUDE.md
  - .planning/codebase/ARCHITECTURE.md
  - .planning/codebase/CONCERNS.md
  - .planning/codebase/CONVENTIONS.md
  - .planning/codebase/INTEGRATIONS.md
  - .planning/codebase/STRUCTURE.md
  - .planning/codebase/TESTING.md
files_deleted:
  - RSA Examplifier/rsa-examplifier.html
  - RSA Examplifier/CLAUDE_RESUME_COMMAND
autonomous: true
requirements: [NAV-01, QUICK-NAMING-01]

estimate:
  tokens: 50000
  raw_tokens: 50000
  tasks: 2
  confidence: low

must_haves:
  truths:
    - "The tool lives at `RSA/rsa.html` — directory and filename both match the name the user sees. No shipped `.html` file and no file under `assets/` contains the substring `examplif` in any case."
    - "Every user-visible surface reads `RSA`: the browser tab title (`RSA — Bob, Alice & Eve`), the page `<h1>`, the hub card heading in `index.html`, and the nav label on all eight pages."
    - "All nine in-repo hrefs that point at this tool resolve to a file that exists — clicking `RSA` from any of the other seven pages, or the hub card, opens the tool rather than a 404 — and no other page's links broke in the process."
    - "Git history for both the tool's HTML file and its `CLAUDE_RESUME_COMMAND` survives the move as a rename (git-mv rename detection), and the resume file's content is byte-identical to before."
    - "All eight pages still carry the same eight nav links in the same order, with exactly one marked `is-active` (NAV-01 preserved)."
    - "The tool's behavior is unchanged: no RSA math, no panel copy, no CSS, and no `localStorage` usage is touched. The page has no tool-specific storage key — it only reads the shared `site-theme` preference — so there is no key to rename."
    - "Living docs (`CLAUDE.md`, `.claude/CLAUDE.md`, `.planning/codebase/*.md`) name and path the tool as `RSA` / `RSA/rsa.html`; the ASCII component diagram in ARCHITECTURE.md keeps its column alignment; and the localStorage-convention list no longer claims an `'rsa-examplifier'` key that this page never had."
    - "Historical planning artifacts (`.planning/phases/`, `.planning/quick/`, `.planning/quick-batches/`, `.planning/research/`, `.planning/debug/`) are left untouched — they are dated records, not living docs."
  artifacts:
    - "RSA/rsa.html (git-mv renamed from the retired path, history preserved)"
    - "RSA/CLAUDE_RESUME_COMMAND (moved with the directory, content unchanged)"
    - "index.html"
    - ".planning/codebase/ARCHITECTURE.md"
  key_links:
    - "index.html nav href -> RSA/rsa.html"
    - "index.html hub card href -> RSA/rsa.html"
    - "six sibling tool pages' nav href -> ../RSA/rsa.html"
    - "RSA/rsa.html self nav href -> rsa.html (bare filename, same directory)"
    - "CLAUDE.md / .claude/CLAUDE.md / .planning/codebase/*.md tool inventory -> RSA/rsa.html"
---

<objective>
Rename this repo's RSA tool to plain `RSA` on every surface at once: the directory, the filename, the three self-references inside the page, the nine in-repo hrefs that reach it, and the living docs that inventory it.

Purpose: The tool's public name and its internal name have drifted apart — the page is titled and labelled with a coined word the rest of the site never uses. This item settles on the plain concept name, matching the precedent set by the Christmas Trees to Factor Tree and Pizza Slices to Congruence Wheel renames (commits `018fe19`, `5a65c36`, `481d5d0`).

Output: `RSA/rsa.html` reachable from the hub and every sibling page, plus living docs that path it correctly.

Scope guard: this is rename-only. No RSA math, no narrative copy, no CSS, no `localStorage` behavior changes. Two commits, matching the Pizza Slices precedent exactly — one `feat` commit for the code rename plus link repointing, one `docs` commit for the living docs.

Coordination note for the orchestrator: this plan edits one nav line in `Congruence Wheel/congruence-wheel.html` and `Venn Diagrams/venn-diagrams.html`, which sibling batch items `260926-rb9` and `260926-rb7` also modify, and it renames the file that `260926-rbb` will edit. `depends_on` is empty because this item is the first to touch the RSA tool, but it must not share a wave with `rb7`, `rb9`, or `rbb`.

No task-level TDD: this repo has no test framework or build step (verification is "open the file in a browser", per CLAUDE.md), and neither task adds behavior — both are path and text substitutions. Verification is therefore carried by grep gates and a repo-wide href-resolution gate, which is the strongest automated signal available here.

<!-- planner-discipline-allow: examplif -->
<!-- planner-discipline-allow: Examplifier -->
<!-- planner-discipline-allow: rsa-examplifier -->
<!-- planner-discipline-allow: RSA Examplifier -->
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

Baseline facts established during planning (do not re-derive):

- The old name appears in exactly 16 tracked files outside the historical planning dirs: 8 `.html` files and 8 docs (`CLAUDE.md`, `.claude/CLAUDE.md`, and six files under `.planning/codebase/`). Nothing in `assets/` or `README.md` mentions it — the nav is inlined per page, not enumerated in `assets/site.css`.
- The tool has **no** tool-specific `localStorage` key. Its only storage touch is the shared theme bootstrap reading `site-theme`. Two doc lines claim a `'rsa-examplifier'` key exists; that claim is false and Task 2 corrects it.
- Repo-wide href resolution is currently clean (zero broken in-repo `.html` links) — that is the baseline the Task 1 gate must preserve.
</context>

<tasks>

<task type="tracer">
  <name>Task 1: Rename directory and file to RSA, repoint all nine in-repo hrefs</name>
  <files>RSA/rsa.html, RSA/CLAUDE_RESUME_COMMAND, index.html, Congruence Wheel/congruence-wheel.html, Diffie-Hellman Key Exchange/diffie-hellman-key-exchange.html, Factor Tree/factor-tree.html, Factorize By Completing The Square/factorize-completing-square.html, Sieve Of Eratosthenes/sieve-of-eratosthenes.html, Venn Diagrams/venn-diagrams.html</files>
  <precondition>`git status --porcelain -- '*.html'` reports no modified tracked HTML files, so this rename commit carries only rename-related changes and no in-flight edits from a sibling batch item.</precondition>
  <action>
    Move the tool with git so history is preserved, in two steps so the session-residue file travels with the directory as a pure rename: first `git mv "RSA Examplifier" RSA`, then `git mv RSA/rsa-examplifier.html RSA/rsa.html`. Do not open, edit, or reformat `RSA/CLAUDE_RESUME_COMMAND` — it must stay byte-identical, recorded by git as a 0-change rename, matching how commit 5a65c36 moved the Congruence Wheel's copy.

    In `RSA/rsa.html` change exactly three things and nothing else. The `<title>` keeps its subtitle and becomes `RSA — Bob, Alice &amp; Eve`. The self nav link becomes `href="rsa.html"` with link text `RSA`, keeping its `class="site-nav-link is-active"` and the bare same-directory filename convention the other tools' self-links use. The page-header `<h1>` becomes `RSA`. Leave the header paragraph, the "How this works" panel, every step panel, all CSS, the theme bootstrap script, and the entire script block untouched — the word being removed does not occur anywhere else in the file.

    In `index.html` change three things: the nav link becomes `href="RSA/rsa.html"` with link text `RSA`; the hub card anchor becomes `href="RSA/rsa.html"`; the card's `<h2>` becomes `RSA`. The card's descriptive `<p>` already avoids the old name — leave it as written.

    In each of the six sibling tool pages, rewrite the single RSA nav line to `<a href="../RSA/rsa.html" class="site-nav-link">RSA</a>`, preserving that file's existing indentation and the link's position in the nav order (it stays between Congruence Wheel and Venn Diagram in all six).

    Do not leave any trace of the retired name in a shipped file: no HTML comment, no `title` attribute, no "formerly" prose recording the rename. The commit message is where that history belongs.

    Commit as one atomic change: `feat(260926-rba): rename RSA Examplifier dir/file to RSA, repoint links`, with the run's required `Co-Authored-By` attribution footer.
  </action>
  <verify>
    <automated>out=$(git grep -in 'examplif' -- '*.html' 'assets/' || true); printf '%s\n' "$out"; test -z "$out"</automated>
    <automated>test -f RSA/rsa.html && test -f RSA/CLAUDE_RESUME_COMMAND && test ! -e 'RSA Examplifier'</automated>
    <automated>files=$(git ls-files -- '*.html'); test -n "$files"; broken=$(printf '%s\n' "$files" | while IFS= read -r f; do d=$(dirname "$f"); grep -o 'href="[^"]*\.html"' "$f" | sed 's/^href="//; s/"$//' | while IFS= read -r h; do [ -e "$d/$h" ] || echo "BROKEN: $f -> $h"; done; done); printf '%s\n' "$broken"; n=$(printf '%s\n' "$broken" | awk 'NF' | wc -l | tr -d ' '); test "$n" -eq 0</automated>
    <automated>hrefs=$(git grep -oh 'RSA/rsa\.html' -- '*.html'); n=$(printf '%s\n' "$hrefs" | awk 'NF' | wc -l | tr -d ' '); test "$n" -eq 8</automated>
    <automated>navfiles=$(git grep -l 'class="site-nav-link[^"]*">RSA<' -- '*.html'); n=$(printf '%s\n' "$navfiles" | awk 'NF' | wc -l | tr -d ' '); test "$n" -eq 8</automated>
    <automated>ren=$(git diff --cached --name-status -M); n=$(printf '%s\n' "$ren" | awk '$1 ~ /^R/' | wc -l | tr -d ' '); test "$n" -eq 2</automated>
    <human-check>Open `RSA/rsa.html` in a browser: the tab title reads "RSA — Bob, Alice &amp; Eve", the page heading reads "RSA", and the "RSA" nav pill is the active one. From `index.html`, both the "RSA" nav link and the 🔐 hub card open the tool. The Bob/Alice/Eve walkthrough still generates keypairs as before.</human-check>
  </verify>
  <done>One commit exists renaming the directory and file to `RSA/rsa.html` with git rename detection intact for both moved files. The retired name appears in zero shipped `.html` or `assets/` files. Eight hrefs point at `RSA/rsa.html` plus one bare `rsa.html` self-link (nine total), each resolving to an existing file, and the repo-wide href-resolution gate reports zero broken links. Eight nav labels read `RSA`, one per page.</done>
</task>

<task type="auto">
  <name>Task 2: Repath living docs to RSA/rsa.html and correct the false storage-key claim</name>
  <files>CLAUDE.md, .claude/CLAUDE.md, .planning/codebase/ARCHITECTURE.md, .planning/codebase/CONCERNS.md, .planning/codebase/CONVENTIONS.md, .planning/codebase/INTEGRATIONS.md, .planning/codebase/STRUCTURE.md, .planning/codebase/TESTING.md</files>
  <action>
    Update the eight living docs so they describe the tool at its new name and path. Substitute the directory reference with `RSA`, the filename with `rsa.html`, the full path with `RSA/rsa.html`, and the display name with `RSA` (including in table cells, tree listings, section headings, prose parentheticals, and the `open "..."` example command in TESTING.md). Treat `RSA` as an acronym where a doc lists directory-naming style — it replaces the two-word entry in that example list rather than being rewritten to fit "Title Case with spaces".

    Three spots need care beyond plain substitution.

    First, the ASCII component diagram in ARCHITECTURE.md. Each box cell interior is exactly 13 characters wide and every `│` must stay in its original column, so the rightmost box column is edited by re-padding, not by shortening lines: the second body row's cell (the one carrying the second half of the old two-word name) becomes 13 spaces; the third row's path cell becomes a backtick, `RSA/`, then padding to 13; the fourth row's continuation cell becomes `rsa.html` followed by a backtick, then padding to 13. After editing, the diagram still has 9 multi-box rows whose character lengths are the set {90, 91}.

    Second, the ASCII directory tree in STRUCTURE.md. Its trailing `#` comments all begin at character column 37; shortening the filename shrinks the line, so pad with spaces to keep the `#` at column 37, matching the sibling `congruence-wheel.html` and `CLAUDE_RESUME_COMMAND` rows immediately around it. The directory heading line in that tree loses the second word too.

    Third, the localStorage-convention list that appears in both `.claude/CLAUDE.md` (under "Architectural Smell: Tight Coupling to localStorage Key Name") and `.planning/codebase/ARCHITECTURE.md`. Both list a `'rsa-examplifier'` key for this tool. Planning verified that key does not exist — the page's only storage touch is the shared theme bootstrap reading `site-theme`. Do not rename a key that was never there. Replace each of those two rows with an accurate line: the tool name `RSA`, stating it keeps no tool-specific key and persists nothing beyond the shared `site-theme` preference. Leave the Factor Tree and Congruence Wheel rows, and the surrounding convention guidance, untouched. Record this correction as a finding in the SUMMARY so the stale-docs discovery is not lost.

    Scope guard: do not rewrite anything under `.planning/phases/`, `.planning/quick/`, `.planning/quick-batches/`, `.planning/research/`, or `.planning/debug/`. Those are dated records of what was true when they were written, and the Pizza Slices precedent (commit 481d5d0) deliberately left the equivalent files alone.

    Commit as `docs(260926-rba): repath living docs from RSA Examplifier to RSA`, with the run's required `Co-Authored-By` attribution footer.
  </action>
  <verify>
    <automated>out=$(git grep -in 'examplif' -- ':!.planning/phases' ':!.planning/quick' ':!.planning/quick-batches' ':!.planning/research' ':!.planning/debug' || true); printf '%s\n' "$out"; test -z "$out"</automated>
    <automated>python3 -c "ls=open('.planning/codebase/ARCHITECTURE.md',encoding='utf-8').read().split(chr(10)); rows=[l for l in ls if l.startswith(chr(9474)) and (chr(9474)+' '+chr(9474)) in l]; assert len(rows)==9, len(rows); assert sorted(set(len(r) for r in rows))==[90,91], sorted(set(len(r) for r in rows)); print('diagram alignment OK')"</automated>
    <automated>python3 -c "ls=open('.planning/codebase/STRUCTURE.md',encoding='utf-8').read().split(chr(10)); bad=[l for l in ls if 'rsa.html' in l and '#' in l and l.index('#')!=37]; assert not bad, bad; print('tree comment column OK')"</automated>
    <automated>docs=$(git grep -l 'RSA/rsa\.html' -- CLAUDE.md .claude/CLAUDE.md '.planning/codebase/*.md'); n=$(printf '%s\n' "$docs" | awk 'NF' | wc -l | tr -d ' '); test "$n" -ge 6</automated>
    <automated>hist=$(git grep -il 'rsa-examplifier' -- .planning/phases .planning/research .planning/debug); n=$(printf '%s\n' "$hist" | awk 'NF' | wc -l | tr -d ' '); test "$n" -gt 0</automated>
  </verify>
  <done>A second commit exists updating the eight living docs. The retired name survives nowhere outside the historical planning directories, which are confirmed unmodified. The ARCHITECTURE.md diagram still has 9 multi-box rows with lengths {90, 91}, the STRUCTURE.md tree keeps its `#` comments at column 37, and neither doc claims an `'rsa-examplifier'` localStorage key any more.</done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| browser → static file (`file://` or static host) | The only boundary this item touches. Navigation follows in-repo relative hrefs; there is no server, no request handler, and no user input crossing a network boundary in this change. |
| repo → session-residue file | `CLAUDE_RESUME_COMMAND` is a tracked file holding a session id; the rename relocates it without reading or rewriting it. |

## STRIDE Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation Plan |
|-----------|----------|-----------|----------|-------------|-----------------|
| T-rba-01 | Tampering | in-repo relative hrefs across the eight HTML pages | low | mitigate | Task 1's href-resolution gate walks every tracked `.html`, extracts each `href="*.html"`, and asserts the target exists on disk relative to the containing file — a partial rename that leaves a dangling nav link fails the task. Baseline is verified clean, so any breakage is attributable to this change. |
| T-rba-02 | Denial of Service | the retired `RSA Examplifier/rsa-examplifier.html` path | low | accept | Stale external bookmarks and deep links will 404. This is a static site with no redirect layer — neither `file://` nor plain static hosting can rewrite paths — and adding a stub redirect file would reintroduce the retired name the item exists to remove. The tool stays reachable from the hub card and from every page's nav. Same disposition as the two prior directory renames. |
| T-rba-03 | Information Disclosure | `RSA/CLAUDE_RESUME_COMMAND` (session id residue) | low | accept | Pre-existing tracked file, moved verbatim per the repo convention of leaving session residue as-is. This item does not change its content, visibility, or tracking status, so it neither adds nor reduces exposure. |
| T-rba-SC | Tampering | npm/pip/cargo installs | low | accept | No package installs. The repo has no package manager, lockfile, or build step, and this item adds none — the Package Legitimacy Gate is not applicable. |
</threat_model>

<verification>
Run after both commits land:

- The scoped negative grep from Task 2 passes — the retired name is gone from all shipped code and all living docs.
- Repo-wide href resolution reports zero broken in-repo `.html` links (the Task 1 gate, re-run).
- `hist=$(git log --follow --oneline -- RSA/rsa.html); n=$(printf '%s\n' "$hist" | awk 'NF' | wc -l | tr -d ' '); test "$n" -gt 1` — history survived the move.
- `stat=$(git show --stat HEAD~1); printf '%s\n' "$stat" | grep -q CLAUDE_RESUME_COMMAND` — the session-residue file appears as a 0-change rename.
- `st=$(git status --porcelain -- .planning/phases .planning/quick-batches .planning/research .planning/debug); test -z "$st"` — historical artifacts untouched.
- Exactly two commits produced: one `feat(260926-rba)`, one `docs(260926-rba)`.
</verification>

<success_criteria>
- The tool is at `RSA/rsa.html`; the retired directory no longer exists.
- Tab title, page `<h1>`, hub card heading, and all eight nav labels read `RSA`.
- Nine in-repo hrefs reach the tool and all resolve; no other page's links broke.
- Git history preserved for both moved files; the resume file is byte-identical.
- Eight nav links in the same order on all eight pages, exactly one active per page (NAV-01 intact).
- RSA behavior, copy, CSS, and storage usage unchanged.
- Living docs path the tool correctly with diagram and tree alignment intact, and no longer document a storage key the page never had.
- Historical planning artifacts unmodified.
</success_criteria>

<output>
Create `.planning/quick/260926-rba-rename-the-rsa-examplifier-tool-to-simply-rsa-internal-file/260926-rba-SUMMARY.md` when done.

The SUMMARY must record two findings: (1) the tool had no tool-specific `localStorage` key despite two living-doc lines claiming `'rsa-examplifier'`, and how that was corrected; (2) the nav-line overlap with batch items `260926-rb7`, `260926-rb9`, and the file rename that `260926-rbb` inherits.
</output>
