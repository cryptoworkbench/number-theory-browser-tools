---
phase: quick-260925-pbw
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - Christmas Trees/factor-tree.html
  - Christmas Trees/example_prime_factorization
  - index.html
  - Sieve Of Eratosthenes/sieve-of-eratosthenes.html
  - Factorize By Completing The Square/factorize-completing-square.html
  - Pizza Slices/pizza-slices.html
  - RSA Examplifier/rsa-examplifier.html
  - CLAUDE.md
  - .claude/CLAUDE.md
  - .planning/codebase/STRUCTURE.md
  - .planning/codebase/ARCHITECTURE.md
  - .planning/codebase/CONVENTIONS.md
  - .planning/codebase/CONCERNS.md
  - .planning/codebase/TESTING.md
autonomous: true
requirements: [QUICK-RENAME-01]

estimate:
  tokens: 35000
  raw_tokens: 35000
  tasks: 3
  confidence: low

must_haves:
  truths:
    - "Opening index.html and clicking the Factor Tree nav link or the Prime Factor Tree card loads the factor tree tool."
    - "The Factor Tree nav link in every other tool page (Sieve, Completing the Square, Congruence Wheel, RSA) loads the factor tree tool."
    - "The factor tree page still renders its Mountains of Christmas display font and still resolves ../assets/palette.css, ../assets/site.css and ../assets/theme.js."
    - "git log --follow on the moved HTML file shows the pre-rename history (rename recorded, not delete+add)."
    - "No live source file (.html/.md outside .planning/) still points at the old directory name."
  artifacts:
    - "Factor Tree/factor-tree.html"
    - "Factor Tree/example_prime_factorization"
  key_links:
    - "index.html site-nav-link href -> Factor Tree/factor-tree.html"
    - "index.html card href -> Factor Tree/factor-tree.html"
    - "4 tool pages site-nav-link href -> ../Factor Tree/factor-tree.html"
    - "Factor Tree/factor-tree.html -> ../assets/palette.css, ../assets/site.css, ../assets/theme.js (depth unchanged by rename)"
---

<objective>
Rename the repo directory `Christmas Trees/` to `Factor Tree/` using `git mv` (history preserved), repoint every live reference to the new path, and update the living documentation that describes the repo layout.

Purpose: The directory name is seasonal/thematic and no longer matches the tool it holds (`factor-tree.html`, titled "Prime Factor Tree"). The directory name should say what the tool is.
Output: Renamed directory, 6 corrected hrefs across 5 HTML pages, corrected layout docs, and an automated link-resolution audit proving no page has a broken internal link.
</objective>

<execution_context>
@~/.claude/gsd-core/workflows/execute-plan.md
@~/.claude/gsd-core/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@CLAUDE.md
@.claude/CLAUDE.md
</context>

<scope_notes>
<!-- planner-discipline-allow: Christmas Trees -->

**Rename only the directory. Do not de-theme the tool.** The factor tree page is deliberately Christmas-decorated (pine-tree SVG, snow, fairy lights, 🎄 card icon). These are NOT path references and MUST survive untouched:

| Location | Literal | Why it stays |
|----------|---------|--------------|
| `factor-tree.html:12` | `family=Mountains+of+Christmas` | Google Font name |
| `factor-tree.html:84`, `:175` | `font-family:'Mountains of Christmas', cursive` | Google Font name |
| `index.html` card block | `🎄` icon and the "decorated for the season" copy | product copy, not a path |
| `.planning/PROJECT.md:39` | "Christmas green/gold" | describes the tool's old palette, not a path |

**Out of scope — historical artifacts are not rewritten.** `.planning/phases/`, `.planning/debug/` and `.planning/research/` are point-in-time records of work already completed and verified against the old path; editing them would falsify the record. They keep the old name on purpose. Only *living* docs that describe the repo as it is today get updated: root `CLAUDE.md`, `.claude/CLAUDE.md`, and `.planning/codebase/*.md`.

Every verification grep in this plan therefore excludes `.planning/` and `.git/`.

**Note on the task brief:** the brief expected a stray `CLAUDE_RESUME_COMMAND` file in the directory. The tracked second file is actually `example_prime_factorization` (an ASCII factor-tree sketch). It moves with the directory; leave its contents alone.
</scope_notes>

<tasks>

<task type="tracer">
  <name>Task 1: git mv the directory and repoint every live link</name>
  <files>Christmas Trees/ -> Factor Tree/, index.html, Sieve Of Eratosthenes/sieve-of-eratosthenes.html, Factorize By Completing The Square/factorize-completing-square.html, Pizza Slices/pizza-slices.html, RSA Examplifier/rsa-examplifier.html</files>
  <action>
Run `git mv "Christmas Trees" "Factor Tree"` from the repo root — plain `mv` is forbidden here, the staged rename is what preserves file history for both tracked files.

Then repoint the six hrefs that name the old directory. Use Edit on each file; each is a single attribute-value change from the old directory segment to `Factor Tree`, leaving the filename `factor-tree.html`, the `../` prefix where present, the link text, and the `class` attribute exactly as they are:

- `index.html` line ~121 — the `site-nav-link` whose text is "Factor Tree" (root-relative, no `../`)
- `index.html` line ~151 — the `class="card"` href in the "Prime Factor Tree" card
- `Sieve Of Eratosthenes/sieve-of-eratosthenes.html` line ~361 — `site-nav-link`, has `../` prefix
- `Factorize By Completing The Square/factorize-completing-square.html` line ~243 — `site-nav-link`, has `../` prefix
- `Pizza Slices/pizza-slices.html` line ~237 — `site-nav-link`, has `../` prefix
- `RSA Examplifier/rsa-examplifier.html` line ~160 — `site-nav-link`, has `../` prefix

Do NOT touch `Factor Tree/factor-tree.html` line 312: its self-link is the bare relative `href="factor-tree.html"` and is already correct after the move. Do NOT touch that file's `../assets/*` links — the directory stays at the same depth, so they still resolve.

Do not add any explanatory comment naming the old directory to any HTML file; the rename is recorded in the commit message, not in markup.
  </action>
  <verify>
    <automated>cd /home/mainaccount/Claude/number-theory-browser-tools && test -f "Factor Tree/factor-tree.html" && test -f "Factor Tree/example_prime_factorization" && test ! -e "Christmas Trees" && ST=$(git status --porcelain) && printf '%s\n' "$ST" | grep -q '^R.*Factor Tree/factor-tree\.html' && printf '%s\n' "$ST" | grep -q '^R.*Factor Tree/example_prime_factorization' && [ "$(grep -rl 'Christmas Trees' --include='*.html' . | grep -v '/\.git/' | wc -l)" -eq 0 ] && grep -q 'family=Mountains+of+Christmas' 'Factor Tree/factor-tree.html' && grep -q "font-family:'Mountains of Christmas'" 'Factor Tree/factor-tree.html' && echo PASS</automated>
  </verify>
  <done>The directory is staged as a rename (2 files, `R` status), no `.html` file in the repo names the old directory, and the three Google-Font references on the factor tree page are intact.</done>
</task>

<task type="auto">
  <name>Task 2: Update the living layout documentation</name>
  <files>CLAUDE.md, .claude/CLAUDE.md, .planning/codebase/STRUCTURE.md, .planning/codebase/ARCHITECTURE.md, .planning/codebase/CONVENTIONS.md, .planning/codebase/CONCERNS.md, .planning/codebase/TESTING.md</files>
  <action>
Replace the old directory name with `Factor Tree` in the docs that describe the repo as it exists now. Known occurrences (re-grep to confirm before editing, line numbers may have shifted):

- `CLAUDE.md:13` — repo layout bullet listing the tool path.
- `.claude/CLAUDE.md:96` — the "Directory names use Title Case with spaces" example list. Swap the old name for `Factor Tree`; the list still illustrates Title Case, which `Factor Tree` satisfies.
- `.claude/CLAUDE.md:198` — Component Responsibilities table, File column.
- `.claude/CLAUDE.md:326` — reads "Factor Tree: `'factor-tree'` or `'christmas-trees'`" under the localStorage-key-coupling smell. No such key exists in the tool (its only storage key is the shared `site-theme`); reduce this line to the single plausible key `'factor-tree'`.
- `.planning/codebase/STRUCTURE.md:25` (directory tree), `:62` (per-directory heading), `:108` (entry-point list), `:154` (Title Case naming example — same treatment as `.claude/CLAUDE.md:96`).
- `.planning/codebase/ARCHITECTURE.md:56` — component table File column.
- `.planning/codebase/CONVENTIONS.md:15` — Title Case naming example.
- `.planning/codebase/CONCERNS.md:14, 50, 79, 88, 99, 108` — file lists on six findings. Path prefix only; keep every line/range annotation (e.g. "(lines 436–462)") exactly as written.
- `.planning/codebase/TESTING.md:22` — the `open "…/factor-tree.html"` shell example; `:41` — the "**Factor Tree**" test-checklist heading path.

Leave `.planning/PROJECT.md` alone — its only hit is the palette-history phrase "Christmas green/gold", not a path. Leave `.planning/phases/`, `.planning/debug/` and `.planning/research/` alone per scope_notes.
  </action>
  <verify>
    <automated>cd /home/mainaccount/Claude/number-theory-browser-tools && [ "$(grep -rl 'Christmas Trees' CLAUDE.md .claude/CLAUDE.md .planning/codebase/ | wc -l)" -eq 0 ] && [ "$(grep -rl 'Factor Tree/factor-tree.html' CLAUDE.md .claude/CLAUDE.md .planning/codebase/CONCERNS.md | wc -l)" -eq 3 ] && ! grep -rq 'christmas-trees' .claude/CLAUDE.md && echo PASS</automated>
  </verify>
  <done>Root `CLAUDE.md`, `.claude/CLAUDE.md` and all five `.planning/codebase/*.md` files name the new path; the phantom `'christmas-trees'` storage key is gone; historical phase/debug/research artifacts are unmodified.</done>
</task>

<task type="auto">
  <name>Task 3: Repo-wide link audit and rename commit</name>
  <files>(no new files — audit and commit only)</files>
  <action>
This repo has no test suite, so the standing regression risk of a directory rename is a silently broken relative link. Audit it directly.

1. Run a repo-wide grep for the old directory name across all live files (exclude `.git/` and `.planning/`). Expect zero hits. If a hit appears in a file not covered by tasks 1–2, fix it the same way.

2. Run the internal-link resolution audit below over every HTML page: it extracts each local `href` ending in `.html` or `.css`, resolves it relative to the containing file, and prints a `BROKEN` line for any target that does not exist on disk. Expected output: nothing. This covers the whole site, not just the renamed tool — so it also proves the moved page's `../assets/*` links and every cross-tool nav link still resolve.

3. Confirm history survived the move: `git log --follow --oneline -- "Factor Tree/factor-tree.html" | wc -l` must report more than one commit (the file has prior palette-unification history).

4. Commit as one atomic rename commit. Stage explicitly — do NOT use `git add -A`: the working tree has pre-existing untracked paths (`.gsd/`, `.planning/state.json`, `.planning/ui-reviews/`) that are not part of this change and must stay untracked. Stage exactly the renamed directory plus the files tasks 1–2 touched:

```
git add "Factor Tree" index.html "Sieve Of Eratosthenes/sieve-of-eratosthenes.html" \
  "Factorize By Completing The Square/factorize-completing-square.html" \
  "Pizza Slices/pizza-slices.html" "RSA Examplifier/rsa-examplifier.html" \
  CLAUDE.md .claude/CLAUDE.md .planning/codebase/
```

(the `git mv` already staged the deletion side of the rename). Commit with subject `refactor: rename tool directory to Factor Tree` and a body noting that all six nav/card hrefs and the living layout docs were repointed, and that historical planning artifacts intentionally retain the old path. End the message with the `Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>` attribution line.
  </action>
  <verify>
    <automated>cd /home/mainaccount/Claude/number-theory-browser-tools && OUT=$(find . -name '*.html' -not -path './.git/*' -not -path './.planning/*' -print0 | while IFS= read -r -d '' f; do d=$(dirname "$f"); grep -oE 'href="[^":#]+\.(html|css)"' "$f" | sed 's/^href="//; s/"$//' | while IFS= read -r h; do [ -e "$d/$h" ] || echo "BROKEN $f -> $h"; done; done) && [ -z "$OUT" ] && [ "$(grep -rl 'Christmas Trees' . --exclude-dir=.git --exclude-dir=.planning | wc -l)" -eq 0 ] && LOG=$(git log --follow --oneline -- 'Factor Tree/factor-tree.html') && [ "$(printf '%s\n' "$LOG" | wc -l)" -gt 1 ] && [ -z "$(git status --porcelain --untracked-files=no)" ] && echo PASS</automated>
    <human-check>Open `index.html` in a browser, click the "Factor Tree" nav link and the "Prime Factor Tree" card — both load the tool. On the tool page confirm the header font is still the decorative Mountains of Christmas face and the page is themed (palette.css resolved), then use its nav to hop to another tool and back.</human-check>
  </verify>
  <done>Zero broken internal links site-wide, zero remaining old-path references outside `.git/` and `.planning/`, `git log --follow` shows pre-rename history, and the working tree is clean with the rename committed.</done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| browser -> local filesystem (`file://`) | Pages are opened directly; every internal link is a filesystem path resolved by the browser. A wrong path is a hard 404, not a graceful degradation. |
| repo -> static host (GitHub Pages / any HTTP server) | Directory names become URL path segments; the space in `Factor Tree` is percent-encoded as `%20` by the browser, same as the existing `Pizza Slices` and other spaced directories. |

## STRIDE Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation Plan |
|-----------|----------|-----------|----------|-------------|-----------------|
| T-quick-01 | Denial of Service | internal navigation links across 6 pages | medium | mitigate | Task 3's link-resolution audit walks every local `.html`/`.css` href in every page and fails on any unresolvable target. |
| T-quick-02 | Repudiation | git history of the moved files | medium | mitigate | `git mv` (not `mv`) plus a `git log --follow` assertion in Task 3 verifying pre-rename commits are still reachable. |
| T-quick-03 | Tampering | shared assets (`assets/palette.css`, `site.css`, `theme.js`) | low | accept | The rename preserves directory depth, so `../assets/*` is unchanged; covered incidentally by the Task 3 audit and the human check. |
| T-quick-04 | Information Disclosure | historical planning artifacts | low | accept | Phase/debug/research artifacts keep the old path by design; they are internal records, not published surface. |
| T-quick-SC | Tampering | npm/pip/cargo installs | n/a | accept | No package installs in this plan — the repo has no package manager and this change adds no dependency. |
</threat_model>

<verification>
- `Factor Tree/factor-tree.html` and `Factor Tree/example_prime_factorization` exist; the old directory does not.
- `git status --porcelain` showed two `R` (rename) entries before commit; `git log --follow` on the moved HTML returns more than one commit.
- No file outside `.git/` and `.planning/` contains the old directory name.
- The three `Mountains of Christmas` font references and the 🎄 card icon are untouched.
- Site-wide internal-link audit prints no `BROKEN` lines.
- No modified or staged tracked files remain after a single atomic commit (pre-existing untracked paths `.gsd/`, `.planning/state.json`, `.planning/ui-reviews/` stay untracked and uncommitted).
</verification>

<success_criteria>
The factor tree tool lives at `Factor Tree/factor-tree.html` with its git history intact, all six nav/card links across the five other pages open it, the tool's own styling and assets still load, the living docs describe the new layout, and no internal link anywhere on the site is broken.
</success_criteria>

<output>
Create `.planning/quick/260925-pbw-rename-christmas-trees-folder-to-factor-/260925-pbw-SUMMARY.md` when done.
</output>
