---
phase: quick-260930-jlm
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - RSA/rsa.html
autonomous: true
requirements: ["quick-260930-jlm"]

estimate:
  tokens: 40000
  raw_tokens: 40000
  tasks: 2
  confidence: low

must_haves:
  truths:
    - "A party's row appears as soon as that party's `chosen e = …` line has scrolled up into readable view from the bottom of the viewport — while that party's key-generation section is still substantially on screen (its rect bottom is still below the viewport top)."
    - "At a scroll position where that line is still below the bottom edge of the viewport, the row stays hidden: reaching the section is not enough, reaching the line is."
    - "The reveal is monotone in scroll-down — once the line has been read past, continuing down past the whole section, the wire diagram and Eve's notebook keeps the row shown — and it reverses when the reader scrolls back up so the line drops below the read point again."
    - "A party with no keypair has no row at any scroll position, because the measured line does not exist until that party's output has been rendered."
    - "Regenerating a keypair with different primes still refreshes that party's row at the new reveal point: the measured line is resolved from the document on every evaluation, so the innerHTML rebuild that destroys the previous line cannot strand the panel."
    - "A viewport resize alone, with no scroll and no change in which sections intersect, re-evaluates the reveal — the read point is viewport-height-relative, which the previous constant threshold was not."
    - "Everything the prior task shipped is behaviourally unchanged at the new, earlier reveal point: the panel is still aria-hidden, still position:fixed with pointer-events:none, still holds zero focusable nodes, still shows only e and n through the page's own formatter, still abbreviates an over-long modulus with its digit count inside the height cap, and still removes itself on a very small viewport."
    - "The panel's markup and the file's entire `<style>` block are byte-identical to the pre-task baseline: this task changes which node is measured and the comparison used, nothing about what the panel looks like or contains."
    - "There is still exactly one update function, one IntersectionObserver construction and one rect measurement in the file — the new resize trigger is a second trigger for the same single predicate, never a second implementation of it, and no scrolled-past flag is reintroduced."
    - "`RSA/rsa.html` is the only modified tracked file; no literal colour and no new external resource is added."
  artifacts:
    - "RSA/rsa.html — the single self-contained tool file, edited in place; the only tracked file this plan changes"
    - "$SP/rsa-chosen-e-harness.js — headless-Chrome behavioural harness in the session scratchpad, written in Task 1 and extended in Task 2, never committed"
  key_links:
    - "The `chosen e =` line inside `renderKeyOutput()`'s template literal (rsa.html:569) — the one place that line is built, and it is built from the same template for both parties. Adding a single party-prefixed id there is what makes the line addressable, and it serves Bob and Alice from one source, so there is no per-party markup to keep in sync."
    - "Resolve that line from the document inside the predicate on every evaluation, never cache the node. `renderKeyOutput()` assigns `out.innerHTML`, which destroys the previous line node on every regeneration; a cached reference would measure a detached node forever and pin the panel to a stale key. Task 1's regeneration assertion is what proves this."
    - "The rAF-throttled window listener is now load-bearing rather than a backstop. The existing `IntersectionObserver` watches `#step-bob`/`#step-alice`, and neither section crosses a threshold while the reader scrolls *inside* it — which is exactly where the new reveal point lies. The observer stays for its initial callback and for section-level changes; the listener is what actually fires the reveal."
    - "`window.innerHeight` enters the predicate, so `resize` joins `scroll` on the same shared throttle. The previous threshold was the constant 0 and had no viewport dependency, so this trigger gap is created by this task, not inherited."
    - "`updateScratchpad()` is already the last statement of `renderKeyOutput()`. That single existing wiring point still covers 'a keypair was just generated', so this task adds no new refresh call site."
---

<objective>
Change the RSA public-key reference panel's reveal trigger from "this party's whole key-generation section has scrolled above the viewport" to "this party's `chosen e = …` line has scrolled up into readable view".

Purpose: the panel exists so a learner reading steps 3-5 can see (e, n) without scrolling back to step 1. As shipped, it does not appear until the entire key-generation section has left the top of the screen — which is a screenful or two after the reader has actually met and read the two numbers. The reader learns "e = 65537" and then watches the reference card stay empty while they scroll. Moving the trigger to the `chosen e` line means the card shows up at the moment the value it mirrors is first legible.

Output: one edited file, `RSA/rsa.html`, plus a scratchpad-only headless-Chrome behavioural harness (not committed).
</objective>

<execution_context>
@~/.claude/gsd-core/workflows/execute-plan.md
@~/.claude/gsd-core/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@RSA/rsa.html
@.planning/quick/260930-fnr-in-the-rsa-tool-add-a-non-editable-scrat/260930-fnr-PLAN.md
</context>

<environment>
Every path in this plan body is repo-root-relative; run every command with the checkout root as cwd.

`node` (v22, `/usr/bin/node`) and `google-chrome` (`/usr/bin/google-chrome`) are both on PATH. This repo has no package manager, no test runner and no build step — verification is a headless-Chrome behavioural harness written to the session scratchpad, exactly as quick tasks `260929-g19`, `260930-ea7` and `260930-fnr` did. Do not install anything.

`$SP` below means this session's scratchpad directory. Export it once at the start of Task 1 and record its real path in the SUMMARY.

**The prior task's harness is very likely still on disk at `$SP/rsa-scratchpad-harness.js`** (this session shares `260930-fnr`'s scratchpad). If it is there, copy it to `$SP/rsa-chosen-e-harness.js` and reuse its scaffolding verbatim — the loopback static server, the `/__driver.html` route, the verdict POST route, the `settle()` helper, the watchdog, and the `google-chrome --headless=new … --window-size=1200,1000` spawn (that window size is required: a small headless window suppressed `IntersectionObserver` callback delivery entirely). Replace only the scenario bodies. If it is absent, rebuild the scaffolding from the `<harness_recipe>` section of `.planning/quick/260930-fnr-in-the-rsa-tool-add-a-non-editable-scrat/260930-fnr-PLAN.md`. Either way do not edit the old harness file in place — the new scenarios assert a different trigger and the old `t1`/`t2` scenarios will legitimately fail after this task.

Line numbers below were read at plan time against a 970-line file. They drift the moment you edit — re-locate by identifier, never by line number alone.
</environment>

<background>
Settled context, not open for re-litigation:

- **This task changes trigger logic only.** The panel's markup, its CSS, its `aria-hidden`, its `pointer-events:none`, the two values it shows, the formatter path they go through, the abbreviation cap and the responsive rules all stay exactly as `260930-fnr` left them. Both task gates compare a checksum of the whole `<style>` block against the baseline and reject any diff line that touches a panel identifier, so "unchanged" is enforced rather than promised.
- **The measured line is dynamic, not static markup.** The brief assumed the `chosen e` line already carries an id. It does not: it is built inside `renderKeyOutput()`'s template literal (rsa.html:566-569) and written with `out.innerHTML`. Adding one party-prefixed id attribute to that existing line is therefore a required enabling change, and it is the only markup edit in this plan. `renderKeyOutput()` has exactly one call site (rsa.html:530, inside `generateKeys()`), so the line is created once per generation and replaced wholesale on each regeneration.
- **The architecture from `260930-fnr` stays.** One `updateScratchpad()`; one predicate helper reading live geometry; the `IntersectionObserver` and the rAF-throttled scroll listener acting only as "something changed, recompute" triggers. Do not reintroduce a per-party scrolled-past flag object — that was the bug `260930-fnr`'s second commit removed, and an instantaneous scroll jump (Home key, a back-to-top control) still defeats it.
- **Do not observe the `chosen e` line with the IntersectionObserver.** It does not exist when `initScratchpad()` runs, and it is destroyed and recreated on every regeneration, so observing it would require an unobserve/re-observe dance on each render for no behavioural gain: the rAF-throttled listener already fires on every scroll frame, and `renderKeyOutput()`'s tail already recomputes after a render. Keep the observer on `#step-bob`/`#step-alice` untouched — those are the stable wrappers that contain the measured lines, and the observer's first callback is still what establishes the initial state without a priming call.
- **`.app{ padding-bottom: 240px }` stays.** `260930-fnr` added it so the old scrolled-past reveal was reachable at common viewport heights. The new trigger fires much earlier and no longer needs that headroom, but it is a CSS rule and the style block is gated byte-identical; it also still keeps the fixed panel clear of the footer text. Leave it.
- **Colour discipline.** `assets/palette.css` is the single source of every colour on this site and this task adds no colour at all. The diff gates still reject any literal colour notation and any newly added external reference on an added line.
</background>

<source_audit>
Sources for this quick task: the user's verbatim intent plus the orchestrator's brief. There is no ROADMAP goal line, no `phase_req_ids`, no RESEARCH.md and no CONTEXT.md, so the GOAL/REQ/RESEARCH/CONTEXT audit collapses to the brief's own items.

| # | Source item (from the brief) | Covered by | Status |
|---|------------------------------|-----------|--------|
| B-1 | Reveal fires as soon as each party's `chosen e` line becomes readable, not when the whole section scrolls past | Task 1 (c), harness `r1` checks B/C | COVERED |
| B-2 | Move the watched/measured node from the outer section down to the specific `chosen e` line | Task 1 (b) + (c) | COVERED |
| B-3 | Change the geometric condition from "fully scrolled past" to "scrolled up to/past this line" | Task 1 (c) | COVERED |
| B-4 | Only `RSA/rsa.html` is modified | both task gates (checksum manifest + working-tree assertion) | COVERED |
| B-5 | Panel markup, styling, read-only/aria-hidden/pointer-events nature, values shown via `fmt()`/`scratchNum()`, responsive behaviour all unchanged | both task gates (style-block checksum, panel-identifier diff gate, `aria-hidden` count) + harness `r2` regression checks | COVERED |
| B-6 | The `chosen e` line must be an identifiable DOM node — locate it | Task 1 (b); **the brief's premise was wrong**, the line has no id today, so Task 1 adds one to the existing line. Flagged here rather than silently assumed. | COVERED (with correction) |
| B-7 | Preserve the single-`updateScratchpad()`-driven-by-both-observer-and-scroll-listener architecture; no stale-flag regression | Task 1 (d) + gates (one observer, one update function, one rect read, zero flag object) | COVERED |
| B-8 | No new external dependencies, no literal colours | both task diff gates | COVERED |

No item is MISSING and nothing is deferred.
</source_audit>

<tasks>

<task type="tracer" tdd="true">
  <name>Task 1: Retarget the reveal to the `chosen e` line, proven end-to-end on Bob's path</name>
  <files>RSA/rsa.html</files>
  <precondition>`node` and `google-chrome` both resolve on PATH and `$SP` is a writable directory; the harness cannot run otherwise.</precondition>
  <reversibility rating="reversible">A trigger-condition change inside one self-contained HTML file with no persisted state and no other consumer — revertible by `git revert` of a single commit.</reversibility>
  <read_first>
    `RSA/rsa.html`, specifically: `renderKeyOutput()`'s template literal around the "Choosing the public exponent e" substep (~565-570) — the exact line to add an id to, and the surrounding `class`/inline-`style`/text you must not disturb; the tail of `renderKeyOutput()` (~594-597) where `updateScratchpad()` is already called; the whole `/* ---------- Public-key reference panel ---------- */` section (~910-963) — the formatter, the predicate helper and its comment block, the update function, and the init function with its observer and rAF-throttled scroll listener; the static id convention on `#bob-p`/`#bob-q`/`#bob-output`/`#step-bob` (~272-296).
    `.planning/quick/260930-fnr-in-the-rsa-tool-add-a-non-editable-scrat/260930-fnr-PLAN.md`'s `<harness_recipe>` — the scaffolding contract, needed only if the prior harness file is missing from `$SP`.
  </read_first>
  <behavior>
    Harness scenario `r1`, driving `/RSA/rsa.html` in a same-origin iframe sized 900x700 over loopback. Every scroll and resize is followed by the settle wait before anything is read.

    Helper the scenario needs: given the measured line's element, `scrollSoLineBottomIs(offsetFromViewportBottom)` — scroll the framed window so the line's `getBoundingClientRect().bottom` sits the requested number of px *above* the viewport bottom (a negative argument puts it below the viewport bottom, i.e. not yet on screen). Compute the target from the element's document offset and the current `innerHeight`, then assert afterwards that the achieved rect is within a few px of the request, so a clamped or short scroll cannot be mistaken for a pass.

    - **No keypair:** on first load at the top of the page, `#bob-chosen-e` does not exist, Bob's row carries no shown-state class, and the panel's computed `visibility` is not `visible`. Scrolled to the very bottom of the document, all three still hold. (Reaching the bottom of the page must not reveal a party who has no key.)
    - **Line present after generation:** back at the top, clicking `#bob-gen-btn` with the page's default primes makes `#bob-chosen-e` exist, and its `textContent` contains the same exponent substring rendered in `#bob-output .keycard.pub`.
    - **(A) Below the read point → hidden:** scrolled so the line's rect bottom sits 40px *below* the viewport bottom, Bob's row carries no shown-state class and the panel is not visible.
    - **(B) Readable → shown, with the section still on screen:** scrolled so the line's rect bottom sits 120px above the viewport bottom, Bob's row and the panel both carry the shown-state class and the panel's computed `visibility` is `visible` — **and in the same measurement, `#step-bob`'s rect bottom is greater than 0**, i.e. the section has *not* scrolled past. This paired assertion is the whole point of the task: it fails against the shipped implementation and passes only after the retarget. Record both numbers in the failure message.
    - **(C) Monotone past the section:** scrolled further, to a position where `#step-bob`'s rect bottom is above the viewport top, Bob's row is still shown. Scrolled further still, to the wire/Eve region, still shown.
    - **(D) Reversal:** scrolled back to the very top, Bob's row and the panel both lose the shown-state class.
    - **(E) Mirror fidelity at the new reveal point:** at state (B), the exponent substring in Bob's row equals the exponent substring read from `#bob-output .keycard.pub`, and likewise for the modulus — compared as rendered substrings, never as re-derived arithmetic.
    - **(F) Exclusion at the new reveal point:** at state (B), Bob's row `textContent` contains neither the private-exponent string read from `#bob-output .keycard.priv` nor the digit strings in `#bob-p` and `#bob-q`. Assert each of the three needles is a non-empty string of at least two characters *before* using it, so the check cannot pass vacuously. This is re-checked here rather than inherited: the new trigger fires while the private keycard is still on screen beside the panel, so the earlier reveal point is a fresh disclosure surface.
    - **(G) Structural invariants at (B):** the panel's computed `position` is `fixed`, its computed `pointer-events` is `none`, it carries `aria-hidden="true"`, it contains zero nodes matching `input, button, a, textarea, select, [tabindex], [contenteditable]`, its rect top is below the sticky header's rect bottom, and `document.elementFromPoint` at the panel's rect centre returns a node that is neither the panel nor a descendant of it.
    - **(H) Regeneration finds the new line:** back at the top, replace `#bob-p` with `71` and `#bob-q` with `59`, click `#bob-gen-btn`, then return to state (B) measured against the *newly rendered* line. Bob's row is shown and its modulus substring equals the newly rendered keycard's modulus — and the harness asserts that string differs from the one captured before the regeneration, so a row left pinned to the destroyed line's value cannot pass. This is the assertion that catches a cached element reference.
  </behavior>
  <action>
**(a) Snapshot the baseline before touching anything.** Copy `RSA/rsa.html` to `$SP/jlm-base.html`. Record checksums of every other tracked file outside `.planning/` into `$SP/jlm-others.sha` (`git ls-files -z` with exclude pathspecs for `RSA/rsa.html` and `.planning/**`, piped through `xargs -0 sha256sum`). Both gates read these; a missing baseline fails the task.

**(b) Make the measured line addressable.** In `renderKeyOutput()`'s template literal, on the existing `div.formula` that holds the `chosen e =` label and its value span, add one attribute: `id="${id}-chosen-e"`. Add nothing else — do not change its class, its inline `margin-top` style, its label text, its value span, or the `substep` and heading around it. Because `renderKeyOutput(id)` already has the party id in scope and both parties render from this one template, this single attribute yields `bob-chosen-e` and `alice-chosen-e`, matching the file's existing party-prefixed id convention (`bob-p`, `bob-output`, `step-bob`). Alice needs no separate work here or in Task 2.

**(c) Retarget and re-threshold the predicate.** Rename the existing one-line predicate helper — `isScrolledPast(id)`, the function directly above `updateScratchpad()` — to `hasReachedChosenE(id)`, and change what it measures and how:

- Resolve `document.getElementById(id + '-chosen-e')` *inside the function, on every call*. Return `false` when it is absent. Do not cache the node in module scope, do not stash it during the render, and do not pass it in as an argument: `renderKeyOutput()` rebuilds the party's whole output with `out.innerHTML`, so any reference held across a regeneration points at a detached node. The absent-node case is also load-bearing in its own right — before a keypair exists the line has not been rendered, so returning `false` is what keeps "no keypair, no row" true structurally rather than by a second check.
- Declare one module-scoped ALL-CAPS constant next to the panel's other panel-section declarations holding the read gutter in px — use `24`. It is the small strip above the viewport's bottom edge that a line has to clear before it counts as readable rather than half-arrived.
- Return whether the element's `getBoundingClientRect().bottom` is at most `viewportHeight - gutter`, where `viewportHeight` is `window.innerHeight` with `document.documentElement.clientHeight` as the fallback. This keeps the comparison the same shape as before — one rect field against one threshold — so the file still contains exactly one `getBoundingClientRect()` call, which a gate asserts. It is monotone in scroll-down: the value only decreases as the reader descends, so the row reveals once and stays revealed, and it reverses cleanly on the way back up.
- Update the call site inside `updateScratchpad()` to the new name. Change nothing else in that function: it still loops both party ids, still tolerates a missing row, still reads only `e` and `n` off `State[id]`, and still writes through `scratchNum()` and `textContent`.
- Rewrite the explanatory comment block above the helper. Keep its substance — a live read rather than a remembered flag, because an instantaneous scroll jump can skip the observer's threshold crossing — and add the two new reasons: the measured line is looked up fresh because the render destroys it, and the threshold is viewport-relative. **Do not write the previous helper's name or its old comparison expression into this or any other comment**; the gate negative-greps the old name, and quoting it in prose would fail the task for no benefit.

**(d) Add the resize trigger, sharing the existing throttle.** In `initScratchpad()`, factor the rAF-throttle that currently wraps the scroll listener into one small named scheduler function, and register that same scheduler for both `scroll` and `resize` on `window`, both `{passive:true}`. One queued flag, one `requestAnimationFrame`, one call to the update function — a second listener, never a second predicate. Note in a brief comment why `resize` is now required: the read point is derived from the viewport height, so a resize can flip the answer with no scroll event and no change in which sections intersect, which the previous constant threshold could not. Leave the `IntersectionObserver` construction and its two `observe()` calls exactly as they are.

**(e) Write the harness and run the RED→GREEN cycle.** Set up `$SP/rsa-chosen-e-harness.js` per `<environment>` (copy and re-scenario the prior harness if present, else rebuild its scaffolding). Run scenario `r1` against the untouched baseline first and confirm check (B) fails naming the section-still-on-screen mismatch — that is the RED proof that the scenario actually discriminates the new trigger from the old one. Then apply (b)-(d) and confirm `r1` passes. Additionally vacuity-check (F) and (H) by temporarily pointing a row value at the private field and by temporarily caching the measured node at render time, confirming the harness reports `FAIL` naming that exact check, then reverting. Record in the SUMMARY that this was done.
  </action>
  <verify>
    <automated>test -s "$SP/jlm-base.html" && node "$SP/rsa-chosen-e-harness.js" r1 && { diff -u "$SP/jlm-base.html" 'RSA/rsa.html' > "$SP/r1.diff"; true; } && grep -E '^[-+]' "$SP/r1.diff" | grep -cE 'pubkey-scratchpad|scratch-row|scratch-title|scratch-who|scratch-kv|scratch-bob|scratch-alice' | grep -qx 0 && [ "$(sed -n '/<style>/,/<\/style>/p' 'RSA/rsa.html' | sha256sum | cut -d' ' -f1)" = "$(sed -n '/<style>/,/<\/style>/p' "$SP/jlm-base.html" | sha256sum | cut -d' ' -f1)" ] && grep -vE '^[-+][[:space:]]*(//|/\*|\*|<!--)' "$SP/r1.diff" | grep -E '^\+' | grep -cE '#[0-9a-fA-F]{3,8}|rgba?\(|hsla?\(|<scr''ipt|<li''nk|htt''ps?://' | grep -qx 0 && sha256sum -c --status "$SP/jlm-others.sha" && [ "$(grep -c 'chosen-e' 'RSA/rsa.html')" -ge 2 ] && [ "$(grep -c 'isScrolledPast' 'RSA/rsa.html')" = 0 ] && [ "$(grep -c 'innerHeight' 'RSA/rsa.html')" -ge 1 ] && [ "$(grep -c 'getBoundingClientRect' 'RSA/rsa.html')" = 1 ] && [ "$(grep -c 'new IntersectionObserver' 'RSA/rsa.html')" = 1 ] && [ "$(grep -c 'function updateScratchpad' 'RSA/rsa.html')" = 1 ] && [ "$(grep -c 'function scratchNum' 'RSA/rsa.html')" = 1 ] && [ "$(grep -c 'aria-hidden' 'RSA/rsa.html')" = "$(grep -c 'aria-hidden' "$SP/jlm-base.html")" ] && [ "$(grep -c 'renderKeyOutput' 'RSA/rsa.html')" = "$(grep -c 'renderKeyOutput' "$SP/jlm-base.html")" ] && GS="$(git status --porcelain --untracked-files=no -- . ':(exclude).planning')" && [ "$(printf '%s\n' "$GS" | grep -c .)" = 1 ] && printf '%s\n' "$GS" | grep -q 'RSA/rsa\.html'</automated>
  </verify>
  <done>Generating Bob's keypair and scrolling down until the `chosen e = …` line is comfortably on screen reveals the bottom-left card with Bob's e and n immediately — while step 1 is still visibly on screen, not a screenful later. Scrolling only far enough that the line is still below the bottom edge reveals nothing; continuing down past the whole section keeps it shown; returning to the top clears it. With no keypair, no scroll position reveals anything. Regenerating with different primes re-points the row at the newly rendered line. The card's digits still mirror the public keycard exactly and still exclude d, p and q at this earlier reveal point, and it is still fixed, aria-hidden, click-transparent, focus-free and clear of the sticky header. The `<style>` block and every panel identifier are byte-identical to the baseline, one rect read and one observer remain, and `RSA/rsa.html` is the only modified tracked file.</done>
</task>

<task type="auto" tdd="true">
  <name>Task 2: Party independence, the resize trigger, and the preserved-invariant regression sweep</name>
  <files>RSA/rsa.html</files>
  <read_first>
    The panel section as Task 1 left it — the read-gutter constant, the renamed predicate, and the shared scheduler in the init function — plus the three panel media queries near the tail of the `<style>` block (~200-208), read to confirm their thresholds for the regression assertions rather than to edit them.
  </read_first>
  <behavior>
    Harness scenario `r2`, same 900x700 iframe and the same settle discipline unless stated. This scenario asserts the edges Task 1's single happy path does not reach; it should need no production change beyond the resize trigger Task 1 already added, and any assertion it fails is a real defect in that work.

    - **Independence:** with both keypairs generated from the page defaults, scrolled so Bob's line sits 120px above the viewport bottom while Alice's line is still below the viewport bottom — Bob's row carries the shown-state class, Alice's does not, and the panel is visible. Scrolled on until Alice's line also sits 120px above the viewport bottom — both rows carry it. Scrolled back to the top — neither does, and the panel is hidden.
    - **Divider correctness:** in the Bob-only state Alice's row computes to `display:none`; in the both-shown state the computed top border width is non-zero on the second shown row and zero on the first.
    - **Alice's mirror fidelity and exclusion:** in the both-shown state, Alice's exponent and modulus substrings equal those rendered in `#alice-output .keycard.pub`, and her row excludes her private-exponent string and her two prime strings, each needle asserted non-empty first.
    - **Resize alone flips the reveal:** with Bob's keypair generated, scroll so Bob's line sits 40px *below* the viewport bottom (hidden, per Task 1's state (A)), then — without scrolling — increase the iframe element's height by 300px, leaving its width alone. Bob's row must become shown. Choose the position and delta so that `#step-bob` is partially intersecting the viewport both before and after and the framed window's `scrollY` is unchanged by the resize (assert both, before reading the panel), so neither the observer's own root-resize re-evaluation nor an incidental scroll event can account for the flip. Vacuity-check this check by temporarily removing the `resize` registration and confirming it reports `FAIL`, then reverting; record that in the SUMMARY.
    - **Abbreviation and the growth cap (regression):** in a fresh frame, enter `2305843009213693951` and `2147483647` as Bob's primes, generate, and scroll to the reveal point — Bob's modulus line is not equal to the keycard's modulus string, it ends with a parenthesised digit count whose number equals the count of digit characters in the keycard's modulus string, and the panel's rect height is at most 220px with its rect bottom inside the viewport.
    - **Narrow viewport (regression):** at the reveal point with Bob's key generated, resize the iframe to 340px wide — the panel computes to `display:none`. Resize to 600px wide — it is displayed again, its rect `left` is at least 0, its rect `right` is at most the viewport width, and it still clears the sticky header. (Re-derive the reveal position after each resize; a width change reflows the framed document and moves the measured line.)
    - Re-running scenario `r1` afterwards still passes unchanged.
  </behavior>
  <action>
**(a) Extend the harness with scenario `r2`** per the behavior block, reusing Task 1's line-position helper, the settle discipline and the verdict plumbing. Add no production code speculatively — run `r2` first and only then fix what it reports.

**(b) If the independence checks fail,** the cause is in the shared loop or the shared template, not in per-party code: the update function already iterates both party ids and the id attribute added in Task 1 already serves both parties from one template. Fix the shared path; do not add a per-party branch, a second id attribute or a second predicate call.

**(c) If the resize check fails,** the scheduler from Task 1 step (d) is not registered for `resize`, or the two listeners are not sharing one queued flag. Fix the registration. Do not add a second throttle, a second scheduler or a `resize`-specific predicate.

**(d) If the abbreviation or narrow-viewport regressions fail,** that is a signal the style block or the formatter was disturbed — diff against `$SP/jlm-base.html` and restore, rather than adjusting CSS or widening the panel to make the assertion pass. Those two behaviours are inherited, not authored here, and the style-block checksum gate must keep passing.

**(e) Record in the SUMMARY** the real `$SP` path, the harness filename and its two scenario names, the read-gutter value chosen, the fact that `resize` was added as a trigger and why, and the results of the three vacuity inversions (Task 1's (F) and (H), and this task's resize check).
  </action>
  <verify>
    <automated>node "$SP/rsa-chosen-e-harness.js" r2 && node "$SP/rsa-chosen-e-harness.js" r1 && { diff -u "$SP/jlm-base.html" 'RSA/rsa.html' > "$SP/r2.diff"; true; } && grep -E '^[-+]' "$SP/r2.diff" | grep -cE 'pubkey-scratchpad|scratch-row|scratch-title|scratch-who|scratch-kv|scratch-bob|scratch-alice' | grep -qx 0 && [ "$(sed -n '/<style>/,/<\/style>/p' 'RSA/rsa.html' | sha256sum | cut -d' ' -f1)" = "$(sed -n '/<style>/,/<\/style>/p' "$SP/jlm-base.html" | sha256sum | cut -d' ' -f1)" ] && grep -vE '^[-+][[:space:]]*(//|/\*|\*|<!--)' "$SP/r2.diff" | grep -E '^\+' | grep -cE '#[0-9a-fA-F]{3,8}|rgba?\(|hsla?\(|<scr''ipt|<li''nk|htt''ps?://' | grep -qx 0 && sha256sum -c --status "$SP/jlm-others.sha" && [ "$(grep -c 'isScrolledPast' 'RSA/rsa.html')" = 0 ] && [ "$(grep -c 'getBoundingClientRect' 'RSA/rsa.html')" = 1 ] && [ "$(grep -c 'new IntersectionObserver' 'RSA/rsa.html')" = 1 ] && [ "$(grep -c 'function updateScratchpad' 'RSA/rsa.html')" = 1 ] && [ "$(grep -c 'function scratchNum' 'RSA/rsa.html')" = 1 ] && [ "$(grep -c 'resize' 'RSA/rsa.html')" -ge 1 ] && [ "$(grep -c 'requestAnimationFrame' 'RSA/rsa.html')" = "$(grep -c 'requestAnimationFrame' "$SP/jlm-base.html")" ] && [ "$(grep -c 'chosen-e' 'RSA/rsa.html')" -ge 2 ] && [ "$(grep -c 'aria-hidden' 'RSA/rsa.html')" = "$(grep -c 'aria-hidden' "$SP/jlm-base.html")" ] && [ "$(grep -c 'keycard' 'RSA/rsa.html')" = "$(grep -c 'keycard' "$SP/jlm-base.html")" ] && [ "$(grep -c 'crt-' 'RSA/rsa.html')" = "$(grep -c 'crt-' "$SP/jlm-base.html")" ] && [ "$(grep -c 'rel="stylesheet"' 'RSA/rsa.html')" = "$(grep -c 'rel="stylesheet"' "$SP/jlm-base.html")" ] && GS="$(git status --porcelain --untracked-files=no -- . ':(exclude).planning')" && [ "$(printf '%s\n' "$GS" | grep -c .)" = 1 ] && printf '%s\n' "$GS" | grep -q 'RSA/rsa\.html'</automated>
    <human-check>Open `RSA/rsa.html` in a browser, generate both keypairs, and scroll slowly from the top. Confirm the bottom-left card fades in for a party right about when you finish reading that party's `chosen e = …` line — not before you reach it, and not a screen later — that Bob appears alone before Alice does, that both stay up through the wire diagram and Eve's notebook, and that scrolling back to the top clears them. Repeat in the other theme, then drag the window shorter and taller without scrolling and confirm the card keeps up with the resize.</human-check>
  </verify>
  <done>Bob's row appears when Bob's `chosen e` line becomes readable and Alice's appears independently when hers does, with the divider drawn only between two shown rows and each row mirroring its own public keycard while excluding its private material. A window resize with no scroll re-evaluates the reveal, verified non-vacuously. The inherited abbreviation cap and narrow-viewport hiding still hold, proving the style block and formatter were untouched. Both harness scenarios pass, every Task 1 gate still holds, and `RSA/rsa.html` is the only modified tracked file.</done>
</task>

</tasks>

<!-- planner-discipline-allow: isScrolledPast -->
<!-- planner-discipline-allow: pubkey-scratchpad -->
<!-- planner-discipline-allow: <scr''ipt -->
<!-- planner-discipline-allow: <li''nk -->
<!-- planner-discipline-allow: htt''ps?:// -->

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| private key material → rendered surface | `State[id]` holds `p`, `q`, `phi` and `d` alongside `e` and `n`; the panel decides which of those reaches the screen, and this task moves *when* it reaches it |
| destroyed-and-rebuilt DOM region → the panel's measurement | the measured line lives inside a subtree `renderKeyOutput()` replaces wholesale via `innerHTML`, so node identity is not stable across a regeneration |
| fixed overlay → page controls | a `position:fixed` layer sits above the scrolling document and now appears earlier in the scroll, over more of the page's controls |
| viewport events → per-frame work | `scroll` and now `resize` both drive the same recompute, on the main thread, during scrolling |

## STRIDE Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation Plan |
|-----------|----------|-----------|----------|-------------|-----------------|
| T-jlm-01 | Information Disclosure | the predicate's earlier reveal point vs. the private keycard | medium | mitigate | the reveal now fires while the party's own private keycard is still on screen, so the exclusion check is re-run at the new point rather than inherited: Task 1 check (F) asserts the row contains none of `d`, `p`, `q` read live off the page, each needle proven non-empty first, and Task 2 repeats it for Alice |
| T-jlm-02 | Tampering | a cached reference to the measured line | medium | mitigate | the node is resolved by id inside the predicate on every evaluation and never cached; Task 1 check (H) regenerates with different primes and asserts the row's modulus changed, and the check is vacuity-proved by temporarily caching the node and confirming FAIL |
| T-jlm-03 | Denial of Service | `scroll` + `resize` recompute on the main thread | low | mitigate | both listeners share one rAF-throttled scheduler and one queued flag (gated: `requestAnimationFrame` occurrence count unchanged from baseline), and the predicate performs exactly one `getBoundingClientRect()` per party per frame (gated: one rect read in the whole file) |
| T-jlm-04 | Denial of Service | the fixed overlay, now shown over more of the page | low | mitigate | `pointer-events:none`, the viewport-clamped width, the 220px height cap, the below-header stacking number and the very-small-viewport hide rule are all unchanged and re-asserted behaviourally (Task 1 (G), Task 2's narrow-viewport and cap regressions) rather than assumed from the prior task |
| T-jlm-05 | Tampering | `assets/palette.css`, the `<style>` block, and every other repo file | low | mitigate | a checksum manifest of all tracked files outside `.planning/` is verified by both gates, the `<style>` block is checksum-compared against the baseline, no diff line may touch a panel identifier, and a working-tree check asserts exactly one modified tracked file |
| T-jlm-SC | Tampering | npm/pip/cargo installs | high | accept | no package-manager install exists in this plan or this repo: no manifest, no lockfile, no dependency step, and the diff gate rejects any newly added external reference on an added line. Nothing to audit, so the legitimacy gate has no input |
</threat_model>

<verification>
1. `node "$SP/rsa-chosen-e-harness.js" r1` and `r2` — both exit 0, after `r1` was first confirmed RED against the untouched baseline on check (B), and after the three vacuity inversions (exclusion, regeneration freshness, resize trigger).
2. Style-block checksum equality between `$SP/jlm-base.html` and `RSA/rsa.html` — the panel's styling is byte-identical, which is the strongest available form of the brief's "styling UNCHANGED" constraint.
3. No `+`/`-` diff line matches any panel markup identifier — the panel's own markup and value-writing lines are untouched; only the template's id attribute, the predicate, its call site and the listener wiring move.
4. `diff -u` added lines contain no literal colour notation and no newly added external reference.
5. `sha256sum -c --status "$SP/jlm-others.sha"` — every other tracked file outside `.planning/` is byte-identical; `assets/palette.css` in particular is untouched.
6. `git status --porcelain --untracked-files=no -- . ':(exclude).planning'` — captured into a variable first so a failing `git` cannot read as clean, then asserted to be exactly one non-empty line naming `RSA/rsa.html`.
7. Single-derivation gates: zero occurrences of the retired predicate name, exactly one `getBoundingClientRect`, one `new IntersectionObserver`, one `updateScratchpad`, one `scratchNum`, and an unchanged `requestAnimationFrame` count (one shared throttle, not two).
8. Occurrence-count stability for `aria-hidden`, `keycard`, `crt-`, `renderKeyOutput` and `rel="stylesheet"` — no collateral edit to the panel's accessibility posture, the keycards, the CRT decryption feature or the page's resource links.
9. The `<human-check>` scroll-through in both themes plus a no-scroll window resize.
</verification>

<success_criteria>
A learner scrolling down the RSA page sees a party's public (e, n) appear in the bottom-left card at the moment that party's `chosen e = …` line becomes readable — while step 1 is still on screen — instead of a screenful later once the whole section has scrolled away. The reveal is per-party, monotone on the way down, reversible on the way up, absent for a party with no keypair, correct after a regeneration, and responsive to a bare window resize. Everything else about the panel — its markup, its entire stylesheet block, its aria-hidden read-only click-transparent nature, the two values it shows and how they are formatted, its growth cap and its responsive rules — is provably unchanged. `RSA/rsa.html` remains a single self-contained file with every colour resolved through `assets/palette.css`, and no other file in the repo changed.
</success_criteria>

<output>
Create `.planning/quick/260930-jlm-in-rsa-rsa-html-change-the-public-key-re/260930-jlm-SUMMARY.md` when done.
</output>
