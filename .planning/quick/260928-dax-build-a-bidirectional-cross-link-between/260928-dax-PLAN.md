---
phase: quick-260928-dax
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - Congruence Wheel/congruence-wheel.html
  - Cayley Table Generator/cayley-table-generator.html
autonomous: true
requirements: [CAYLEY-07, NAV-02]

estimate:
  tokens: 60000
  raw_tokens: 60000
  tasks: 2
  confidence: low

must_haves:
  truths:
    - "The Cayley Table Generator's `The same two group operations, seen as wedges on a wheel instead of rows in a table` anchor carries the page's CURRENT operation and modulus as `?mode=<additive|multiplicative>&n=<N>` on its `href`, refreshed on every N change and every mode change, not just at first paint."
    - "The Congruence Wheel's `The same group, read as a full operation table` anchor carries the page's CURRENT operation and modulus as `?mode=<additive|multiplicative>&n=<N>` on its `href`, refreshed on every N change, depth change, mode change and wedge selection, not just at first paint."
    - "Loading `Congruence Wheel/congruence-wheel.html?mode=multiplicative&n=7` opens the wheel on the multiplicative tab at N=7 — the `#n-range` slider reads 7, `#n-display` reads 7, `#tab-multiplicative` is the selected tab, and the reference list holds the phi(7)=6 unit classes — all through the page's own `render()`, never by bypassing it."
    - "Loading `Cayley Table Generator/cayley-table-generator.html?mode=multiplicative&n=9` opens the table on the multiplicative tab at N=9 — `#n-input` reads 9, `#tab-multiplicative` is selected, and `#cayley-table` holds a phi(9)=6 by 6 body — all through the page's own single `buildTable()` call, which still runs exactly once at load."
    - "An N that is legal on the sending page but past the receiving page's ceiling is CLAMPED into range on arrival, never rejected: `congruence-wheel.html?mode=additive&n=120` opens at N=60 (the wheel's `max`), and `cayley-table-generator.html?mode=additive&n=300` opens at N=120 (`MAX_N`). Both pages render normally at the clamped value."
    - "Only truly malformed params fall back to today's default behaviour: an unrecognised `mode`, a non-numeric `n`, an `n` below 1, or a missing half of the pair leaves each page exactly as it loads today (wheel: N=10 additive; Cayley: N=6 additive), with no error text shown for the rejected params."
    - "A URL param beats a localStorage-restored value on both pages: with `congruence-wheel` storage holding N=33 multiplicative, loading `?mode=additive&n=8` opens at N=8 additive; with `cayley-table` storage holding N=30 multiplicative, loading `?mode=additive&n=8` opens at N=8 additive."
    - "A round trip is stable: arriving on either page via `?mode=multiplicative&n=15`, that page's own outbound anchor reads `?mode=multiplicative&n=15`."
    - "Every pre-existing behaviour on both pages is untouched — default loads, the wheel's N and depth sliders and wedge selection, the Cayley N input and its clamp note, both pages' mode tabs, both pages' localStorage persistence, the wheel's SVG/PNG/PDF export, and every caption."
    - "Both files remain build-step-free and self-contained: no new file, no new external script, no shared JS module between them, each still carrying exactly one `<script>` element with a `src` (the deferred `assets/theme.js`) (NAV-02)."
    - "Neither file gains a literal colour value — this change touches no CSS at all, and both `<style>` blocks are byte-identical afterwards."
  artifacts:
    - "Congruence Wheel/congruence-wheel.html"
    - "Cayley Table Generator/cayley-table-generator.html"
  key_links:
    - "`buildTable()` -> `updateWheelXref()` on the Cayley page: `buildTable()` is the single render function every state-mutating path already reaches (`regenerate()` for N, `setMode()` for the tabs, and the `load` listener for first paint). Refreshing the anchor anywhere else — or from a second call site — creates a second source of truth that goes stale after a mode switch."
    - "`render()` -> `updateCayleyXref()` on the wheel page: same seam, same reason. `render()` is reached from the `n-range` input listener, the `depth-range` input listener, `setMode()`, `select()`, and the bare `render()` call at the bottom of the IIFE. Hanging the updater off `setMode()` alone would leave a stale `n` after a slider drag."
    - "Wheel inbound ordering: the param application must land AFTER the `localStorage` restore `try`/`catch` (so params win) and BEFORE `state.a = currentMode().identity(state.N);` (so the initial selected class is the identity of the param's mode, not the stored mode's). Both halves matter; this is a three-line window with no room to drift."
    - "Wheel slider sync: `nRange.value = state.N` and `nDisplay.textContent = state.N` run far below the restore block, near the input listeners. Because the param write lands in `state.N` above them, the slider and its readout pick the param value up for free. Writing to `nRange.value` at the param site instead would be overwritten by that later sync."
    - "Cayley inbound ordering: the param application must land inside the EXISTING `load` listener, ahead of the existing `syncTabs(); buildTable();` pair, so `syncTabs()` paints the param's tab and the one existing `buildTable()` renders the param's table. A second `buildTable()` call would rebuild up to 14,400 cells twice at load."
    - "Cayley inbound selection recompute: `initSelection()` has already fixed `state.ri`/`state.ci` from the STORED N and mode by the time the `load` listener runs. When params change either one, the default selection must be recomputed with `defaultSelection(currentMode().elements(state.N))` — the same four-line idiom `setMode()` and `regenerate()` already use — or the landing page opens on a clamped leftover cell instead of its intended example."
    - "`WHEEL_MAX_N` on the wheel page and `MAX_N` on the Cayley page are the two arrival ceilings. They are deliberately different (60 vs 120) and must each stay tied to their own page's input `max` attribute. `WHEEL_MAX_N` is introduced precisely so the wheel's ceiling has one name instead of three scattered literals."
    - "Both pages name their reader `readModeNParams` and both emit `mode` before `n`, mirroring the Venn/Euclidean pair's identical-name-in-both-files convention. The repo forbids a shared JS module, so these are two independent copies that must be kept in the same shape by hand."
---

<objective>
Make the existing Congruence Wheel <-> Cayley Table Generator cross-link carry state, so switching tools keeps the group operation and the modulus the learner is already looking at, in both directions.

Purpose: Both tools show the same two groups — Z/NZ under addition and (Z/NZ)* under multiplication — one as wedges on a wheel, one as a full operation table. Today the link between them is a plain path: a learner studying multiplication mod 15 on the wheel lands on additive mod 6 in the table, and has to re-pick the tab and retype the modulus before the two views line up. Requirement CAYLEY-07 already delivered the two-way link; this closes the state it should have been carrying.

Output: Two edited files — an id-tagged anchor, an outbound updater called from the page's shared render function, and an inbound param reader wired into the page's own load path, on each side.
</objective>

<execution_context>
@~/.claude/gsd-core/workflows/execute-plan.md
@~/.claude/gsd-core/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@CLAUDE.md
@.claude/CLAUDE.md

@Congruence Wheel/congruence-wheel.html
@Cayley Table Generator/cayley-table-generator.html
</context>

<tasks>

<task type="tracer" tdd="true">
  <name>Task 1: Carry mode and N from the Cayley Table Generator to the Congruence Wheel</name>
  <files>Cayley Table Generator/cayley-table-generator.html, Congruence Wheel/congruence-wheel.html</files>
  <precondition>Both target files are clean at `HEAD` (`dd2cc6d`) while `Venn Diagrams/venn-diagrams.html`, `Euclidean Algorithm/euclidean-algorithm.html` and `.planning/config.json` carry unrelated uncommitted working-tree changes. Confirm with `git status --porcelain -- "Congruence Wheel/congruence-wheel.html" "Cayley Table Generator/cayley-table-generator.html"` printing nothing before editing; if either target is already dirty, halt and report rather than editing on top of unknown changes. Every commit in this plan must name its files explicitly — never `git commit -a` — or the unrelated Venn/Euclidean edits get swept in.</precondition>
  <read_first>
    Read these exact regions first. The Venn Diagrams <-> Euclidean Algorithm pair is the precedent this task mirrors; read it before either target so the shape is in hand.

    Precedent (read, do not edit):
    - `Euclidean Algorithm/euclidean-algorithm.html` lines 483-507 (`updateXrefLink()` then `readABParams()` — the exact encode / regex-probe / try-catch / bail-to-null shape to copy) and lines 1083-1091 (the `load` listener: read params, write the inputs, then the ONE pre-existing entry-point call).
    - `Venn Diagrams/venn-diagrams.html` lines 1272-1287 (the `renderProducts()` tail calling `updateEuclidXref()` — the render-function seam) and lines 1492-1505 (params consulted immediately alongside the storage restore, params winning).

    Cayley target (outbound half):
    - line 264 (the `<p class="xref">` anchor, currently with no `id`), line 341 (`var MAX_N = 120;`), line 311 (`function clamp(v, lo, hi)`), lines 376-386 (`state` and the localStorage restore), lines 402-407 (`initSelection()`), lines 411-421 (the `$('...')` element lookups, ending at `cellNotesEl`), lines 466-553 (`buildTable()` — note it ends with `applyHighlights(); updateCaption(); updateNotes();`), lines 690-692 (`persist()`), lines 696-717 (`syncTabs()` and `setMode()`), lines 728-743 (`lastHandledRaw` and `regenerate()`), lines 792-795 (the `load` listener).

    Wheel target (inbound half):
    - line 356 (the `<p class="xref">` anchor), line 368 (`<input type="range" id="n-range" min="1" max="60" ...>` — the ceiling this task names), lines 422-432 (the `document.getElementById` lookups), line 479 (`state`), lines 491-497 (the localStorage restore `try`/`catch` followed by `state.a = currentMode().identity(state.N);` — the exact three-line window the param write goes into), line 526 (`clamp`), lines 532-701 (`render()`, ending with `updateCaption();`), lines 741-743 (`persist()`), lines 983-986 (the slider/readout sync), lines 1021-1031 (`setMode()`), lines 1048-1049 (`syncTabs(); render();` at the bottom of the IIFE — this page has no `load` listener).

    Note both pages already spell the two operations exactly `additive` and `multiplicative` in their `MODES` keys, their tab `data-mode` attributes and their storage guards, so the value crosses unchanged.
  </read_first>
  <behavior>
    Cayley outbound `href`, asserted after each named action (fresh profile, empty storage each time):
    - Default load: `#xref-wheel` href query is `?mode=additive&n=6`, and its path component still resolves to the Congruence Wheel page.
    - After writing `12` into `#n-input` and dispatching `input`: href query is `?mode=additive&n=12`.
    - After then clicking `#tab-multiplicative`: href query is `?mode=multiplicative&n=12` — the mode moved and the modulus survived.
    - After typing `999` into `#n-input` (which the page's own `readN()` clamps to 120 and announces in `#n-note`): href query is `?mode=multiplicative&n=120` — the link carries the clamped value the table is actually showing, never the rejected input.

    Wheel inbound, asserted after the page settles:
    - `?mode=multiplicative&n=7`: `#n-range` value is `7`, `#n-display` text is `7`, `#tab-multiplicative` has `aria-selected="true"`, `#ref-list` holds 6 entries (phi(7)), and `#wheel-dynamic` has rendered children.
    - `?mode=additive&n=120`: `#n-range` value is `60` and `#n-display` is `60` — clamped to the wheel's own ceiling, still rendering, not rejected.
    - `?mode=additive&n=1`: `#n-range` value is `1` — the floor is inclusive and renders.
    - No params: `#n-range` value is `10`, `#tab-additive` selected — today's behaviour, unchanged.
    - `?mode=bogus&n=7`, `?mode=additive&n=abc`, `?mode=additive&n=0`, `?mode=additive&n=-5`, and `?mode=additive` with no `n`: every one falls back to `10` / additive, and no page text announces an error.
    - localStorage for key `congruence-wheel` pre-seeded with `{"N":33,"depth":4,"mode":"multiplicative"}` before the page's own script runs, then loaded with `?mode=additive&n=8`: `#n-range` is `8` and `#tab-additive` is selected — the params win. Loaded with no params against that same seed: `#n-range` is `33` and `#tab-multiplicative` is selected — the storage path still works.
    - No uncaught error is recorded by a `window.onerror` handler installed before the page's own script, in any case above.
  </behavior>
  <action>
    Two edits, one per file, both in each file's own existing style: ES5 `var` and `function` declarations, 2-space indent, `try`/`catch` around anything that can throw, no arrow functions, no template literals, no new external dependency, and no shared module between the files.

    **`Cayley Table Generator/cayley-table-generator.html` — outbound:**

    1. Give the anchor on line 264 an `id` of `xref-wheel`. Change nothing else on that line — not its class, not its link text, not its `href`, which stays the plain relative path and remains what the updater writes when the element is missing.

    2. Alongside the other `$('...')` lookups (after `cellNotesEl`, line 421), add a lookup for that anchor into a variable named `xrefWheelEl`.

    3. Add a function `updateWheelXref()` taking no arguments, placed next to `persist()` in the persistence section. It returns immediately when `xrefWheelEl` is falsy. Otherwise it assigns `xrefWheelEl.href` from the plain relative path to the Congruence Wheel page with a query string appended: the `mode` key carrying `state.mode` and the `n` key carrying `state.N`, both passed through `encodeURIComponent`, `mode` first. Read the values straight off `state` — do not take arguments and do not recompute them. There is no suppression case here: unlike the Venn precedent, every reachable `(mode, N)` pair is meaningful on the wheel, so the query string is always appended.

    4. Call it once, as the final statement of `buildTable()`, directly after the existing `updateNotes();` on line 552. Add no other call site — `buildTable()` is already reached by `regenerate()`, `setMode()` and the `load` listener, which is every path that can move `state.N` or `state.mode`.

    **`Congruence Wheel/congruence-wheel.html` — inbound:**

    5. Directly above the localStorage restore `try` on line 491, declare `var WHEEL_MAX_N = 60;` with a short comment saying it mirrors the `max` attribute of the `n-range` input and is the ceiling an inbound modulus is clamped to. Then replace the bare `60` inside the restore guard on line 493 with `WHEEL_MAX_N`. That substitution is value-identical and must stay so — the guard's comparisons, its bounds and its order do not change.

    6. Add a function `readModeNParams()` taking no arguments. Mirror the Euclidean page's `readABParams()` near-verbatim: two regex probes against `location.search` inside a `try`/`catch` that bails to `null`, one matching a `mode` key and one matching an `n` key, each anchored so the key must follow a `?` or `&` and each capturing up to the next `&` or `#`; bail to `null` when either probe found nothing; then a second `try`/`catch` that `decodeURIComponent`s the mode and `decodeURIComponent` plus `parseInt` base 10 the modulus, bailing to `null` on throw. Reject with `null` unless the mode is exactly one of the two `MODES` keys, and reject with `null` unless the parsed modulus is finite and at least 1. Do not clamp inside this function — it reports what the URL said, and the caller decides the range. Place it next to `persist()`; it is a hoisted function declaration, so it is callable from the restore window above.

    7. In the three-line window between the restore `try`/`catch` closing on line 496 and `state.a = currentMode().identity(state.N);` on line 497, call the reader into a local and, when it is non-null, assign the mode onto `state.mode`, assign `clamp` of the modulus between 1 and `WHEEL_MAX_N` onto `state.N`, and then call `persist()`. Placing it here is what makes params beat storage and what lets the untouched `state.a` line below compute the identity of the arriving mode. Do not touch `state.depth` — the wheel's ring depth is not carried across the link and its stored value must survive. Do not write to `nRange.value` here; the existing sync near line 983 already copies `state.N` into the slider and its readout.

    Commit both files together in one commit naming both paths explicitly.
  </action>
  <verify>
    <automated>Static gate, cwd at the checkout root. Set `W="Congruence Wheel/congruence-wheel.html"` and `C="Cayley Table Generator/cayley-table-generator.html"`. Cayley side: `grep -qF 'id="xref-wheel"' "$C" || echo NO-XREF-ID`; count OCCURRENCES, never lines, so a same-line repeat cannot hide — `[ "$(grep -oF 'id="xref-wheel"' "$C" | wc -l)" = 1 ] || echo XREF-ID-DUP`; `grep -qF 'function updateWheelXref' "$C" || echo NO-UPDATER`; `grep -qF '../Congruence Wheel/congruence-wheel.html' "$C" || echo PATH-LOST`; exactly one declaration plus one call, occurrence-counted over comment-stripped lines so neither a same-line repeat nor a stray `//` note can skew it — `[ "$(grep -v '^[[:space:]]*//' "$C" | grep -oF 'updateWheelXref' | wc -l)" = 2 ] || echo CALLSITE-COUNT`; the call sits inside `buildTable()` — `awk '/^function buildTable/{f=1} f&&/updateWheelXref\(\);/{print "OK"; exit} f&&/^\}/{exit}' "$C" | grep -q OK || echo CALL-NOT-IN-BUILDTABLE`; `buildTable` is still called exactly once in the load listener — `[ "$(awk "/addEventListener\('load'/{f=1} f&&/buildTable\(\);/{c++} END{print c+0}" "$C")" = 1 ] || echo BUILDTABLE-COUNT`. Wheel side: `grep -qF 'function readModeNParams' "$W" || echo NO-READER`; `grep -qF 'WHEEL_MAX_N' "$W" || echo NO-CEILING`; the ceiling agrees with the slider's own `max` — `cw=$(grep -oE 'WHEEL_MAX_N[[:space:]]*=[[:space:]]*[0-9]+' "$W" | grep -oE '[0-9]+$' | head -1); cm=$(grep -F 'id="n-range"' "$W" | grep -oE 'max="[0-9]+"' | grep -oE '[0-9]+'); [ -n "$cw" ] && [ "$cw" = "$cm" ] || echo CEILING-MISMATCH`; the restore guard now names the constant instead of a bare literal — `awk '/localStorage.getItem..congruence-wheel/{f=1} f&&/saved.N/{print; exit}' "$W" | grep -q 'WHEEL_MAX_N' || echo GUARD-NOT-CONSTANT`; the param write sits after the restore and before the identity line — `awk '/localStorage.getItem..congruence-wheel/{f=1} f&&/readModeNParams\(\)/{r=NR} f&&/state.a = currentMode\(\).identity/{if(r&&NR>r) print "OK"; exit}' "$W" | grep -q OK || echo ORDER-WRONG`; the depth restore is untouched — `grep -qF 'saved.depth >= 2 && saved.depth <= 10' "$W" || echo DEPTH-GUARD-CHANGED`. Both files: no new external script, occurrence-counted — `[ "$(grep -oE '<script[^>]*src=' "$W" | wc -l)" = 1 ] && [ "$(grep -oE '<script[^>]*src=' "$C" | wc -l)" = 1 ] || echo SCRIPT-TAG-ADDED`. Print `T1-STATIC-COMPLETE` when every check above is silent.</automated>
    <automated>Behavioural gate via headless Chrome, harness built in the scratchpad. `SP="$(mktemp -d)"; cp -r assets "$SP/assets"; mkdir -p "$SP/Congruence Wheel" "$SP/Cayley Table Generator"`, then with `node` write a copy of each page that has (a) a recorder `<script>` as the FIRST element in `<head>` installing `window.onerror` into an array and, for the storage cases only, seeding `localStorage` for the page's own key, and (b) an assertion `<script>` appended before `</body>` that schedules itself from its own `load` listener plus a `setTimeout` of 0, so it runs after the page's own initialisation, and writes `PASS <n>` or `FAIL <case> expected <x> got <y>` into `document.body.dataset.xrefCheck`. Build each file URL with `node -e 'const p=process.argv[1];console.log("file://"+p.split("/").map(encodeURIComponent).join("/"))'` and append the query string AFTER that encoding so `?` and `&` stay live. Run each case as `google-chrome --headless=new --disable-gpu --no-sandbox --user-data-dir="$(mktemp -d)" --virtual-time-budget=8000 --dump-dom "$url"` — a fresh profile per case so no storage leaks between them — and assert with `grep -q 'data-xref-check="PASS' "$dump" || { grep -o 'data-xref-check="[^"]*"' "$dump"; exit 1; }`. Cayley cases read `document.getElementById('xref-wheel').getAttribute('href')`: (1) no params -> query is `?mode=additive&n=6` and the path still ends in the wheel's filename; (2) set `#n-input` value to `12` and dispatch a bubbling `input` event, then re-read -> `?mode=additive&n=12`; (3) from case 2's state click `#tab-multiplicative`, then re-read -> `?mode=multiplicative&n=12`; (4) from case 3's state set `#n-input` to `999`, dispatch `input`, then re-read -> `?mode=multiplicative&n=120` and `#n-note` is non-empty. Wheel cases read `#n-range`.value, `#n-display`.textContent, `#tab-multiplicative`'s `aria-selected`, `#ref-list`.children.length and `#wheel-dynamic`.children.length: (5) `?mode=multiplicative&n=7` -> `7`, `7`, `true`, 6 reference entries, non-zero wheel children; (6) `?mode=additive&n=120` -> `60` and `60`; (7) `?mode=additive&n=1` -> `1` with non-zero wheel children; (8) no params -> `10` with `#tab-additive` selected; (9) through (13) `?mode=bogus&n=7`, `?mode=additive&n=abc`, `?mode=additive&n=0`, `?mode=additive&n=-5`, `?mode=additive` -> each `10` with additive selected; (14) storage seeded `{"N":33,"depth":4,"mode":"multiplicative"}` plus `?mode=additive&n=8` -> `8` with additive selected; (15) that same seed with no params -> `33` with multiplicative selected. In all fifteen the recorded error array must be empty. Prove non-vacuity by pointing case (6)'s expectation at `120` once and confirming it reports `FAIL` — that single flip is what distinguishes a clamp from a passthrough. Print `T1-BEHAVIOUR-COMPLETE` with the total assertion count.</automated>
    <automated>Confinement gate. Pin the revision range explicitly rather than relying on a bare `git diff`, which reports nothing once the work is committed and so passes vacuously: `if git diff --quiet -- "$W" "$C"; then SHA="$(git log -1 --format=%H -- "$W" "$C")"; RANGE="$SHA^..$SHA"; else RANGE=""; fi`. Never leave a fallible `git` in a non-final pipeline stage — redirect to a file and check its status before reading: `git diff --numstat $RANGE -- "$W" "$C" > "$SP/t1stat.txt" || { echo GIT-FAILED; exit 1; }` and `git diff -U0 $RANGE -- "$W" "$C" > "$SP/t1diff.txt" || { echo GIT-FAILED; exit 1; }`. From `t1stat.txt` assert at most 2 deleted lines across both files (the anchor line on each side, plus the rewritten restore-guard line on the wheel) and at most 28 inserted. Then extract the changed lines from the saved diff with `grep '^[-+]' "$SP/t1diff.txt" | grep -v '^[-+][-+]' > "$SP/t1lines.txt"`, and that file must contain no `#` hex literal of 3, 4, 6 or 8 digits, no `rgb`/`rgba`/`hsl`/`hsla`/`hwb`/`lab`/`lch`/`oklab`/`oklch` followed by an open paren, and no CSS named hue as a whole word. Prove the sweep is live by running the same three regexes over `assets/palette.css`, which must report hits. Print `T1-CONFINE-COMPLETE`.</automated>
  </verify>
  <done>Clicking the Cayley Table Generator's wheel link lands on the Congruence Wheel already showing the same operation and the same modulus, clamped into the wheel's 1-60 range when the table was past it, rendered entirely through the wheel's own `render()`. Malformed or half-supplied params leave both pages exactly as they load today, URL params beat stored state, and neither file gained a colour, a script or a shared module.</done>
</task>

<task type="auto" tdd="true">
  <name>Task 2: Carry mode and N from the Congruence Wheel to the Cayley Table Generator</name>
  <files>Congruence Wheel/congruence-wheel.html, Cayley Table Generator/cayley-table-generator.html</files>
  <precondition>Task 1 is committed, so `Cayley Table Generator/cayley-table-generator.html` already declares `updateWheelXref` and `Congruence Wheel/congruence-wheel.html` already declares `readModeNParams` and `WHEEL_MAX_N`. Confirm with `grep -qF 'function updateWheelXref' "Cayley Table Generator/cayley-table-generator.html" && grep -qF 'function readModeNParams' "Congruence Wheel/congruence-wheel.html"`; if either probe fails, halt — this task mirrors machinery Task 1 was supposed to land.</precondition>
  <read_first>
    Re-read only what Task 1 just wrote, plus the two insertion points this task needs; everything else is already in hand from Task 1.
    - `Cayley Table Generator/cayley-table-generator.html`: the `updateWheelXref` function Task 1 added (the outbound shape to mirror on the wheel side), and lines 792-795, the `load` listener holding `syncTabs(); buildTable();`. Also re-read lines 402-407 (`initSelection()`), 707-717 (`setMode()`) and 730-743 (`regenerate()`) — the last two both hold the four-line "recompute the default selection for the current elements" idiom this task repeats verbatim inside the load listener.
    - `Congruence Wheel/congruence-wheel.html`: the `readModeNParams` function Task 1 added (the inbound shape to mirror on the Cayley side), line 356 (the anchor, still with no `id`), lines 422-432 (the element lookups), and lines 696-701 (the tail of `render()`, ending `updateCaption();` then the closing brace).
  </read_first>
  <behavior>
    Wheel outbound `href`, asserted after each named action (fresh profile, empty storage each time):
    - Default load: `#xref-cayley` href query is `?mode=additive&n=10`, and its path component still resolves to the Cayley page.
    - After setting `#n-range` to `20` and dispatching `input`: href query is `?mode=additive&n=20`.
    - After then clicking `#tab-multiplicative`: href query is `?mode=multiplicative&n=20`.
    - After then clicking a wedge in `#wheel-dynamic` and after moving `#depth-range`: href query is still `?mode=multiplicative&n=20` — neither selection nor ring depth is carried, and neither is allowed to corrupt the link.

    Cayley inbound, asserted after the page settles:
    - `?mode=multiplicative&n=9`: `#n-input` value is `9`, `#tab-multiplicative` has `aria-selected="true"`, `#cayley-table` body holds 6 rows (phi(9)), `#group-summary` names 9, and `#n-note` is empty.
    - `?mode=additive&n=300`: `#n-input` value is `120` and the body holds 120 rows — clamped to `MAX_N`, still rendering.
    - `?mode=additive&n=1`: `#n-input` value is `1` and the body holds 1 row.
    - No params: `#n-input` value is `6`, `#tab-additive` selected, 6 rows — today's behaviour, unchanged.
    - `?mode=bogus&n=9`, `?mode=additive&n=abc`, `?mode=additive&n=0`, and `?mode=multiplicative` with no `n`: each falls back to `6` / additive / 6 rows, with `#n-note` empty.
    - localStorage for key `cayley-table` pre-seeded with `{"N":30,"mode":"multiplicative"}` before the page's own script runs, then loaded with `?mode=additive&n=8`: `#n-input` is `8`, additive selected, 8 rows. Loaded with no params against that same seed: 30 is in effect (phi(30)=8 rows, multiplicative selected) — the storage path still works.
    - Round trip, both directions: loading either page with `?mode=multiplicative&n=15` leaves that page's own outbound anchor reading `?mode=multiplicative&n=15`.
    - No uncaught error is recorded by a `window.onerror` handler installed before the page's own script, in any case above.
  </behavior>
  <action>
    Two edits, one per file, mirroring the halves Task 1 landed in the opposite direction. Same ES5 style rules as Task 1.

    **`Congruence Wheel/congruence-wheel.html` — outbound:**

    1. Give the anchor on line 356 an `id` of `xref-cayley`, changing nothing else on that line.

    2. Alongside the other `document.getElementById` lookups (after `refHeading`, line 432), add a lookup for that anchor into a variable named `xrefCayleyEl`.

    3. Add a function `updateCayleyXref()` taking no arguments, placed next to `persist()`. It returns immediately when `xrefCayleyEl` is falsy. Otherwise it assigns `xrefCayleyEl.href` from the plain relative path to the Cayley page with a query string appended: the `mode` key carrying `state.mode` and the `n` key carrying `state.N`, both through `encodeURIComponent`, `mode` first — the same construction `updateWheelXref` uses on the Cayley side. Read `state` directly; take no arguments. Carry nothing else: `state.depth`, `state.a`, `state.b` and `state.sum` are wheel-only and have no meaning in a Cayley table.

    4. Call it once, as the final statement of `render()`, directly after the existing `updateCaption();` on line 700. Add no other call site — `render()` already covers the `n-range` listener, the `depth-range` listener, `setMode()`, `select()` and the initial paint at the bottom of the IIFE.

    **`Cayley Table Generator/cayley-table-generator.html` — inbound:**

    5. Add a function `readModeNParams()` next to `persist()`, byte-for-byte the same logic as the one Task 1 put on the wheel page: two anchored regex probes against `location.search` for a `mode` key and an `n` key inside a `try`/`catch` bailing to `null`, `null` when either probe found nothing, a second `try`/`catch` around `decodeURIComponent` and `parseInt` base 10 bailing to `null`, `null` unless the mode is exactly one of the two `MODES` keys, and `null` unless the parsed modulus is finite and at least 1. Do not clamp inside it. The repo forbids a shared JS module, so this is a deliberate second copy — keep it identical in shape so the pair stays reviewable side by side.

    6. Inside the EXISTING `load` listener on line 792, ahead of the existing `syncTabs();` call, read the params into a local and, when non-null: assign the mode onto `state.mode`; assign `clamp` of the modulus between 1 and `MAX_N` onto `state.N`; write that clamped `state.N` into `nInputEl.value` so the visible input agrees with the table it is about to render; recompute the default selection into `state.ri` and `state.ci` using `defaultSelection(currentMode().elements(state.N))`, the identical four-line idiom `setMode()` and `regenerate()` already use; then call `persist()`. Leave the existing `syncTabs(); buildTable();` pair exactly where it is so the tabs repaint for the arriving mode and the table builds exactly once. Do not add a second `buildTable()` call, do not add a second `load` listener, and do not call `regenerate()` or `setMode()` here — either would trigger a second full table build, up to 14,400 cells at the ceiling.

    7. Leave `lastHandledRaw` alone. It starts null by design, and the first `change` event after a user focuses and blurs the input behaves exactly as it does today; touching it here would alter behaviour outside this task's scope.

    Commit both files together in one commit naming both paths explicitly.
  </action>
  <verify>
    <automated>Static gate, cwd at the checkout root, same `W` and `C` variables as Task 1. Wheel side: `grep -qF 'id="xref-cayley"' "$W" || echo NO-XREF-ID`; occurrence-counted, never line-counted — `[ "$(grep -oF 'id="xref-cayley"' "$W" | wc -l)" = 1 ] || echo XREF-ID-DUP`; `grep -qF 'function updateCayleyXref' "$W" || echo NO-UPDATER`; `grep -qF '../Cayley Table Generator/cayley-table-generator.html' "$W" || echo PATH-LOST`; one declaration plus one call, occurrence-counted over comment-stripped lines — `[ "$(grep -v '^[[:space:]]*//' "$W" | grep -oF 'updateCayleyXref' | wc -l)" = 2 ] || echo CALLSITE-COUNT`; the call sits inside `render()` — `awk '/^  function render\(\)/{f=1} f&&/updateCayleyXref\(\);/{print "OK"; exit} f&&/^  \}/{exit}' "$W" | grep -q OK || echo CALL-NOT-IN-RENDER`. Cayley side: `grep -qF 'function readModeNParams' "$C" || echo NO-READER`; the read happens inside the load listener and ahead of the build — `awk "/addEventListener\('load'/{f=1} f&&/readModeNParams\(\)/{r=NR} f&&/buildTable\(\);/{if(r&&NR>r) print \"OK\"; exit}" "$C" | grep -q OK || echo ORDER-WRONG`; still exactly one build and one listener — `[ "$(awk "/addEventListener\('load'/{f=1} f&&/buildTable\(\);/{c++} END{print c+0}" "$C")" = 1 ] || echo BUILDTABLE-COUNT` and `[ "$(grep -oF "addEventListener('load'" "$C" | wc -l)" = 1 ] || echo LISTENER-COUNT`; the clamp uses the page's own ceiling — `awk "/addEventListener\('load'/{f=1} f&&/clamp\(/{print; exit}" "$C" | grep -q 'MAX_N' || echo CLAMP-CEILING-WRONG`; `lastHandledRaw` untouched, occurrence-counted against the three uses that exist at `HEAD` (declaration, comparison, assignment) — `[ "$(grep -oF 'lastHandledRaw' "$C" | wc -l)" = 3 ] || echo LASTHANDLED-TOUCHED`. Both readers agree: extract each file's `readModeNParams` body with `awk '/function readModeNParams/{f=1} f{print} f&&/^[[:space:]]*\}[[:space:]]*$/{exit}'`, strip leading whitespace and blank lines from both, and `diff` them — they must be identical. Both files still carry exactly one `<script>` with a `src`. Print `T2-STATIC-COMPLETE` when every check is silent.</automated>
    <automated>Behavioural gate via headless Chrome, same harness construction, URL encoding, fresh-profile-per-case and `data-xref-check` reporting protocol as Task 1. Wheel cases read `document.getElementById('xref-cayley').getAttribute('href')`: (1) no params -> query is `?mode=additive&n=10` and the path still ends in the Cayley filename; (2) set `#n-range` value to `20` and dispatch a bubbling `input` event, re-read -> `?mode=additive&n=20`; (3) from case 2 click `#tab-multiplicative`, re-read -> `?mode=multiplicative&n=20`; (4) from case 3 click the first `g` child of `#wheel-dynamic` that carries a click handler, then set `#depth-range` to `8` and dispatch `input`, re-read -> still `?mode=multiplicative&n=20`. Cayley cases read `#n-input`.value, `#tab-multiplicative`'s `aria-selected`, `#cayley-table tbody tr` count, `#group-summary`.textContent and `#n-note`.textContent: (5) `?mode=multiplicative&n=9` -> `9`, `true`, 6 rows, summary contains `9`, note empty; (6) `?mode=additive&n=300` -> `120`, 120 rows; (7) `?mode=additive&n=1` -> `1`, 1 row; (8) no params -> `6`, additive selected, 6 rows; (9) through (12) `?mode=bogus&n=9`, `?mode=additive&n=abc`, `?mode=additive&n=0`, `?mode=multiplicative` -> each `6`, additive selected, 6 rows, note empty; (13) storage seeded `{"N":30,"mode":"multiplicative"}` plus `?mode=additive&n=8` -> `8`, additive selected, 8 rows; (14) that same seed with no params -> multiplicative selected with 8 rows (phi(30)) and the summary naming 30. Round-trip cases: (15) the wheel at `?mode=multiplicative&n=15` reports its own `#xref-cayley` query as `?mode=multiplicative&n=15`; (16) the Cayley page at `?mode=multiplicative&n=15` reports its own `#xref-wheel` query as `?mode=multiplicative&n=15`. In all sixteen the recorded error array must be empty. Prove non-vacuity by pointing case (3)'s expectation at `?mode=additive&n=20` once and confirming it reports `FAIL` — that flip is what catches an updater hung off the slider listener instead of `render()`. Print `T2-BEHAVIOUR-COMPLETE` with the total assertion count.</automated>
    <automated>Confinement gate, same shape and same two hygiene rules as Task 1's. Pin the range explicitly instead of a bare `git diff`, which goes silent once committed and passes vacuously: `if git diff --quiet -- "$W" "$C"; then SHA="$(git log -1 --format=%H -- "$W" "$C")"; RANGE="$SHA^..$SHA"; else RANGE=""; fi`. Keep every fallible `git` out of a non-final pipeline stage by redirecting first and checking status before reading: `git diff --numstat $RANGE -- "$W" "$C" > "$SP/t2stat.txt" || { echo GIT-FAILED; exit 1; }` and `git diff -U0 $RANGE -- "$W" "$C" > "$SP/t2diff.txt" || { echo GIT-FAILED; exit 1; }`. From `t2stat.txt` assert at most 1 deleted line per file (the anchor line on the wheel, zero on the Cayley side) and at most 30 inserted across both. From `t2diff.txt` extract the added and removed lines and assert they carry no hex literal, no `rgb`/`rgba`/`hsl`/`hsla`/`hwb`/`lab`/`lch`/`oklab`/`oklch` call and no CSS named hue as a whole word. Then assert each file's `<style>` block is unchanged: extract it from the pinned base revision (`git show "${RANGE%%..*}:<path>" > "$SP/base.html"`, status-checked before use) and from the current file with `node`, and compare. Prove the colour sweep is live against `assets/palette.css`. Print `T2-CONFINE-COMPLETE`.</automated>
  </verify>
  <done>Clicking the Congruence Wheel's operation-table link lands on the Cayley Table Generator already showing the same operation and the same modulus, clamped into 1-120 when needed, built by the page's single existing `buildTable()` call with its input, tabs, summary and selection all agreeing. The round trip is stable in both directions, malformed params fall back to today's defaults, and the wheel's depth and wedge selection are deliberately not carried.</done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| URL query string -> page state | `location.search` on both pages is fully attacker-authored (a crafted `file://` or hosted link). Both pages now parse `mode` and `n` from it and write the results into state that drives rendering. |
| Page A's outbound `href` -> Page B's state | Each page composes a URL the other parses. The values are drawn from the sending page's own validated state, but the receiving page must not trust their type or range. |
| localStorage -> page state | Pre-existing on both pages and untouched here, but the new param path now takes precedence over it, so the precedence order itself is a security-relevant behaviour (a link cannot be made to silently inherit a stale stored modulus). |

## STRIDE Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation Plan |
|-----------|----------|-----------|----------|-------------|-----------------|
| T-dax-01 | Tampering | `readModeNParams()` on both pages | medium | mitigate | `mode` is accepted only when it is exactly one of the two `MODES` keys — an allowlist comparison, never used to index `MODES` before that check, so no prototype key (`__proto__`, `constructor`) can be reached. `n` is `parseInt`-ed and rejected unless finite and at least 1, then clamped to the page's own ceiling before it reaches `state`. Neither value ever touches a markup-parsing sink: the modulus reaches only `state.N`, `clamp()` and `nInputEl.value`, and the mode reaches only `state.mode` and an attribute comparison. |
| T-dax-02 | Tampering | `updateWheelXref()` / `updateCayleyXref()` | medium | mitigate | Both values pass through `encodeURIComponent` before concatenation and the base path is a fixed relative literal, so a crafted value cannot alter the link target, inject a third param, or escape into the fragment. The values originate from the page's own already-validated `state`, never from raw user text. |
| T-dax-03 | Denial of Service | Cayley inbound modulus | medium | mitigate | `MAX_N` (120) is applied to the inbound modulus with the same `clamp()` the page's own `readN()` uses, capping the table at 14,641 nodes. A crafted `?n=100000` renders a 120-element table, not a hundred-thousand-element one. The wheel's inbound modulus is capped identically at `WHEEL_MAX_N` (60). |
| T-dax-04 | Spoofing | Cross-page link target | low | accept | Both anchors keep their fixed relative `href` path and are same-tab, same-origin navigations within the repo. No `target`, no `rel` change, no redirect indirection is introduced. |
| T-dax-05 | Information Disclosure | Params in browser history | low | accept | The only data crossing is a group operation name and a small modulus — the same two values already visible on screen and already persisted in `localStorage`. Nothing private is added to URLs, history or referrers. |
| T-dax-SC | Tampering | npm/pip/cargo installs | high | mitigate | Not applicable in practice — this plan installs no package and the repo has no package manager or build step. No install task exists, so the package-legitimacy gate and its blocking human checkpoint are vacuously satisfied; if any install is proposed during execution, halt and run the legitimacy protocol first. |
</threat_model>

<verification>
Phase-level checks, run after both tasks are committed, cwd at the checkout root:

1. **Cross-link symmetry sweep.** Each page carries exactly one `class="xref"` paragraph, each anchor now carries exactly one `id` (`xref-cayley` on the wheel, `xref-wheel` on the Cayley page), each anchor's `href` path resolves to a real file when resolved against its own page's directory (`test -f`), and each page has exactly one updater writing that `href`, called from exactly one place inside that page's shared render function. Neither anchor opts out of same-tab navigation.
2. **Reader-parity sweep.** The `readModeNParams` bodies extracted from both files are identical after whitespace normalisation, and both emit `mode` before `n` in their outbound query strings, so the pair cannot drift into two different param contracts.
3. **Ceiling sweep.** `WHEEL_MAX_N` equals the `max` attribute of `#n-range` (60) and `MAX_N` equals the `max` attribute of `#n-input` (120), and each page clamps its inbound modulus against its own constant — not the other page's.
4. **Self-containment sweep (NAV-02).** Each edited file still carries exactly one `<script>` element with a `src` (the deferred `assets/theme.js`), no new file appears in the repo (`git status --porcelain` shows only the two target paths plus the pre-existing unrelated Venn / Euclidean / config modifications plus `.planning/`), and the only external origins referenced remain `fonts.googleapis.com` / `fonts.gstatic.com`.
5. **No-collateral sweep.** Both files' `<style>` blocks are byte-identical to `HEAD` before this plan, the repo-wide literal-colour sweep over both files is clean (with `assets/palette.css` reporting hits to prove it is live), and the wheel's export controls (SVG / PNG / print-to-PDF), its depth slider and its wedge-selection captions all still behave as before.
6. **Consolidated round-trip replay.** Re-run Task 1's fifteen and Task 2's sixteen headless-Chrome cases in a single harness run against the committed files, reporting one `PASS <n>`, including the two stability cases that assert each page re-emits the params it arrived with.
</verification>

<success_criteria>
- Clicking the Cayley Table Generator's wheel link opens the Congruence Wheel on the same operation and modulus; clicking the Congruence Wheel's operation-table link opens the Cayley Table Generator on the same operation and modulus.
- A modulus legal on the sender but past the receiver's ceiling arrives clamped and rendering (120 -> 60 into the wheel; anything above 120 -> 120 into the table), never rejected and never silently dropped.
- Only genuinely malformed input — an unknown operation name, a non-numeric or sub-1 modulus, or a missing half of the pair — falls back, and it falls back to exactly today's default load with no error text.
- URL params beat localStorage on both pages, and the stored-state path still works untouched when no params are present.
- Every other behaviour on both pages is unchanged, both files remain single-file and dependency-free, and neither gained a literal colour or a shared module.
- All six phase-level verification sweeps report green.
</success_criteria>

<output>
Create `.planning/quick/260928-dax-build-a-bidirectional-cross-link-between/260928-dax-SUMMARY.md` when done.
</output>
