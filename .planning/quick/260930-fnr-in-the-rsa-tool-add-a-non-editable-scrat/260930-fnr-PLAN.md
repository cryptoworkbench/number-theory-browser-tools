---
phase: quick-260930-fnr
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - RSA/rsa.html
autonomous: true
requirements: ["quick-260930-fnr"]

estimate:
  tokens: 60000
  raw_tokens: 60000
  tasks: 2
  confidence: low

must_haves:
  truths:
    - "The RSA page carries one read-only reference panel pinned to the bottom-left corner of the viewport, outside the scrolling content, that holds nothing but public-key material."
    - "At the top of the page, and before any keypair has been generated, the panel is not visible at all."
    - "Once a party's key-generation section has scrolled fully above the top of the viewport AND that party's keypair exists, that party's row appears in the panel showing their public exponent and their modulus, and it keeps showing them for the rest of the scroll down the page."
    - "Scrolling back up so the section re-enters the viewport hides that party's row again; the panel itself is only visible while at least one row is."
    - "Bob's row and Alice's row are independent: passing step 1 with step 2 still on screen shows Bob's row alone."
    - "The digits in a row are byte-identical to the digits on that party's own public keycard, because both go through the page's existing thousands-separator formatter."
    - "A row never contains that party's private exponent, primes or totient — only the two values that cross the wire."
    - "The panel holds no form control, no editable node and no tab stop, and it never intercepts a pointer event: a click aimed at whatever sits under it reaches that element."
    - "Regenerating a keypair with different primes refreshes the row's digits; an absurdly long modulus is abbreviated with its digit count rather than growing the panel past its fixed cap."
    - "The panel always fits inside the viewport width, never overlaps the sticky site header, and removes itself entirely on a very small viewport."
    - "Every colour the panel introduces resolves through var() against an existing assets/palette.css token, in both day and night themes; no literal colour, no new external resource, no new stylesheet or script file, and no other repo file changes."
  artifacts:
    - "RSA/rsa.html — the single self-contained tool file, edited in place; the only tracked file this plan changes"
    - "$SP/rsa-scratchpad-harness.js — headless-Chrome behavioural harness in the session scratchpad, written in Task 1 and extended in Task 2, never committed"
  key_links:
    - "`renderKeyOutput(id)`'s tail (rsa.html:534) — the single existing place the public keycards are (re)built. Refreshing the panel from there, not from `generateKeys()`, keeps one derivation point for 'what the public key currently is', so a regeneration can never leave a stale row behind."
    - "`State[id]` — the panel reads exactly two fields off it, `e` and `n`. That narrow read is what makes 'public material only' structural rather than incidental, and Task 1's per-row exclusion assertion is what proves it."
    - "`fmt()` (rsa.html:293) — the existing thousands-separator formatter. The panel must route its digits through it, because the harness's mirror-fidelity assertion compares the row against the rendered keycard character for character."
    - "`#step-bob` / `#step-alice` as the observed elements, with `entry.boundingClientRect.bottom <= 0` as the discriminator. Plain `!isIntersecting` is wrong: at load on a short viewport step 2 is already off-screen *below*, and the panel must stay hidden then."
    - "`.site-header` in assets/site.css carries `position:sticky; z-index:1000`. The panel sits below that number so the two can never fight, and the harness asserts their rects do not overlap."
---

<objective>
Pin a read-only public-key reference panel to the bottom-left of the RSA page, revealed per party once that party's key-generation section has scrolled out of view above.

Purpose: steps 3, 4 and 5 of this page all talk about "e" and "n" — the wire diagram, Eve's notebook, the factoring attempt, every encryption formula — while the keycards holding the actual values are one or two full screens back up the page. A learner following the argument currently has to scroll up, memorise two numbers, and scroll back down. The panel keeps the two public numbers on screen for exactly as long as they are being referred to.

Output: one edited file, `RSA/rsa.html`, plus a scratchpad-only headless-Chrome behavioural harness (not committed).
</objective>

<execution_context>
@~/.claude/gsd-core/workflows/execute-plan.md
@~/.claude/gsd-core/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@RSA/rsa.html
@assets/palette.css
</context>

<environment>
Every path in this plan is repo-root-relative; run every command with the checkout root as cwd.

`node` and `google-chrome` are both on PATH (`/usr/bin/node`, `/usr/bin/google-chrome`, node v22). This repo has no package manager, no test runner and no build step — verification is a headless-Chrome behavioural harness written to the session scratchpad, exactly as quick tasks `260929-g19`, `260929-p80`, `260929-qqt` and `260930-ea7` did. Reuse that recipe (`<harness_recipe>` below); do not invent a second one and do not install anything.

`$SP` below means this session's scratchpad directory. Export it once at the start of Task 1 and record its real path in the SUMMARY.

Line numbers below were read at plan time against an 852-line file. They drift as soon as you edit — re-locate by identifier, never by line number alone.
</environment>

<background>
Constraints that are already settled and must not be re-litigated:

- **Colour discipline.** `assets/palette.css` is the single source of every colour on this site. This file's own `<style>` block already declares zero literal colours — it composes `var(--surface)`, `var(--text)`, `var(--text-dim)`, `var(--panel-border)`, `var(--panel-border-strong)`, `var(--overlay)`, `var(--role-input)`, `var(--role-alt)`, `var(--role-result)` and `color-mix(in srgb, var(--token) N%, transparent)`. Every rule you add composes the same way. Both per-task gates reject any literal colour notation on an added line.
- **Single-file tool.** All new markup, CSS and JS goes inside `RSA/rsa.html`. No new file, no new external resource, no shared module. `assets/palette.css` is consumed, never edited.
- **Party colours already have names.** `.name.bob` uses `var(--role-input)` and `.name.alice` uses `var(--role-alt)`; `.keycard.pub h4` and `.formula .val` use `var(--role-result)`. The panel reuses those three mappings so it reads as the same design, not a new one.
- **The public/private split is the page's whole teaching point.** Step 4 exists to show that (e, n) is all Eve ever gets. A reference panel that leaked d, p, q or the totient would contradict the lesson on the same screen, which is why the exclusion assertion is a gate and not a nicety.
- **`renderKeyOutput()` is the one place public keys are displayed.** `generateKeys()` calls it, and `checkUnlocks()` re-renders steps 3-5 from `State`. Hang the panel refresh off `renderKeyOutput()`'s tail; do not add a second refresh call anywhere else.
</background>

<tasks>

<task type="tracer" tdd="true">
  <name>Task 1: One pinned read-only public-key panel, wired end-to-end from the observed section to Bob's row</name>
  <files>RSA/rsa.html</files>
  <precondition>`node` and `google-chrome` both resolve on PATH, and `$SP` is a writable directory; the harness cannot run otherwise.</precondition>
  <read_first>
    `RSA/rsa.html`, specifically: the `<style>` block's tail (~151-163, where `.result-box`, `.msg-flow` and `footer` live) for the rule shape and indentation to match; `.keycard` / `.keycard.pub` / `.keycard .kv` (~104-110); `.name.bob` / `.name.alice` (~62-63) and `.formula .val` (~93) for the three colour mappings to reuse; the `.app` container's opening and closing (~206, 278) and the page's inline script start (~280); `#step-bob` and `#step-alice` (~226, 240); `fmt()` (~293); the `State` literal (~441); `generateKeys()` (~447-471); `renderKeyOutput()` in full, especially its `.keycards` block and its closing lines (~477-535); and the two bottom-of-script listener registrations (~848-849).
    `assets/palette.css` in full — the token list the panel's colours must resolve against.
    `assets/site.css` lines 19-28 — the sticky header's stacking number, which bounds the panel's own.
  </read_first>
  <behavior>
    Harness scenario `t1`, driving `/RSA/rsa.html` in a same-origin iframe sized 900x700 over loopback:
    - On first load, scrolled to the top, with no keypair generated: the panel element exists, carries no shown-state class, computes to a hidden state (its computed `visibility` is not `visible`), and contains zero nodes matching `input, button, a, textarea, select, [tabindex], [contenteditable]`.
    - Scrolled well past the bottom of `#step-bob` with still no keypair generated: the panel remains hidden. (This is the assertion that separates "has scrolled past" from "exists".)
    - Back at the top, after clicking `#bob-gen-btn` with the page's default primes: the panel is still hidden, because `#step-bob` is on screen.
    - Scrolled so that `#step-bob`'s rect bottom is above the viewport top: the panel and Bob's row both carry the shown-state class, and the panel's computed `visibility` is `visible`.
    - Mirror fidelity: the digit-and-separator string in Bob's row for the exponent equals the one read from `#bob-output .keycard.pub` for the exponent, and likewise for the modulus — compared as the exact rendered substrings, not as re-computed arithmetic.
    - Exclusion: the row's `textContent` does not contain the private-exponent string read from `#bob-output .keycard.priv`, nor the digit strings in `#bob-p` and `#bob-q`. The harness first asserts each of those three needles is a non-empty string of at least two characters, so the check cannot pass vacuously.
    - Placement: the panel's computed `position` is `fixed` and its computed `pointer-events` is `none`; its rect sits within 40px of the viewport's left edge and within 40px of the viewport's bottom edge; its `right` is at most the viewport width and its `top` is below the sticky header's rect bottom.
    - Click pass-through: `document.elementFromPoint` at the panel's rect centre returns a node that is neither the panel nor a descendant of it.
    - Scrolled back to the very top: the panel loses the shown-state class again.
  </behavior>
  <action>
**(a) Snapshot the baseline before touching anything.** Copy `RSA/rsa.html` to `$SP/fnr-base.html`. Record checksums of every other tracked file outside `.planning/` into `$SP/fnr-others.sha` (`git ls-files -z` with exclude pathspecs for `RSA/rsa.html` and `.planning/**`, piped through `xargs -0 sha256sum`). Both gates read these; a missing baseline fails the task.

**(b) Add the panel markup.** Place one `aside` element, id `pubkey-scratchpad`, class `pubkey-scratchpad`, immediately after the `.app` container's closing tag and immediately before the page's inline script element — outside `.app` so the panel is not a flex child of the scrolling column. Give it `aria-hidden="true"`: every value inside it is a verbatim duplicate of a keycard that is already in the accessibility tree, so announcing it twice would be noise rather than help. Note that reason in a short comment above the element.

Inside it put a caption element (class `scratch-title`) reading `Public keys — for reference`, then one row element for Bob: class `scratch-row`, id `scratch-row-bob`, holding a party-name element (classes `scratch-who bob`, text `Bob`) and two value elements (class `scratch-kv`, ids `scratch-bob-e` and `scratch-bob-n`) left empty in the markup and filled by JS. Use only non-interactive elements — no form control, no anchor, no `tabindex`, no `contenteditable`. Alice's row is Task 2; do not add it here.

**(c) Add the CSS, at the tail of the existing `<style>` block, after the `footer`/`.pillbar` rules.** Every colour is a `var()` reference or a `color-mix(in srgb, var(--token) N%, transparent)` over an existing palette token — no literal colour notation of any kind, and no new custom property (this panel needs no local alias: it has no non-colour value to name and no gradient to alias).

The panel rule: `position:fixed`; `left` and `bottom` each a `clamp()` of a small gutter; a stacking number below the sticky header's 1000 (use 900); `width:min(260px, calc(100vw - 24px))` so it can never exceed the viewport; `max-height:min(40vh, 220px)` with `overflow:hidden` as the hard cap on growth; `border-radius` and `padding` in the same register as `.keycard`; `background:var(--surface)` — opaque, unlike `.panel`'s translucent fill, because this floats over scrolling text and must stay legible in both themes; a 1px border in `color-mix(in srgb, var(--role-result) 35%, transparent)`, echoing `.keycard.pub`'s public-key framing; a soft drop shadow using `var(--overlay)`; `pointer-events:none` and `user-select:none`, which together are what make it non-interactive and click-transparent; and a hidden resting state of `opacity:0`, `visibility:hidden`, a few px of downward `translateY`, with a short `transition` over opacity, transform and visibility.

The shown state `.pubkey-scratchpad.is-shown` sets `opacity:1`, `visibility:visible`, `transform:none`.

The caption: small, uppercase, letter-spaced, `color:var(--role-result)`, a little bottom margin — the same treatment `.keycard h4` already gives a card heading.

Rows: `.scratch-row{ display:none; }`, `.scratch-row.is-shown{ display:block; }`. Separate consecutive *shown* rows with `.scratch-row.is-shown ~ .scratch-row.is-shown`, giving it a top margin, top padding and a 1px `var(--panel-border)` top edge. Use that combinator rather than `+`, so a hidden Bob row cannot leave Alice's row wearing a divider with nothing above it.

The party name: block, bold, small; `.scratch-who.bob{ color:var(--role-input); }` — the same mapping `.name.bob` already uses. Alice's mapping is Task 2.

The value lines: block, the monospace stack the rest of this file uses, slightly dimmer than body text via `var(--text-dim)` for the label part is not needed — keep the whole line `var(--text)` and set `overflow-wrap:anywhere` so a long modulus wraps instead of overflowing.

**(d) Add the panel's JS, as one section directly above the bottom-of-script listener registrations**, marked with this file's `/* ---------- Title ---------- */` section-comment convention.

Declare one module-scoped object recording, per party id, whether that party's section is currently scrolled past — same two-key shape as the existing `CrtFlag` and `LastExchange` objects, initialised false.

Write one formatter, `scratchNum(x)`: run the value through the existing `fmt()`; return that string unchanged when it is at most 30 characters; otherwise return its first 8 characters, an ellipsis, its last 8 characters, and the value's own digit count in parentheses. The threshold exists so the panel's fixed cap is never reached by a legitimately huge modulus. Do not duplicate `fmt()`'s separator logic — call it.

Write `updateScratchpad()`: for each party id, resolve the row element and `State[id]`, decide `shown` as "a keypair exists for this party AND its section is scrolled past", toggle the shown-state class on the row, and when shown write the exponent and modulus lines via `textContent` (never `innerHTML`) as a label plus `scratchNum(...)` of `State[id].e` and `State[id].n` respectively. Read nothing else off `State[id]` — not `d`, not `p`, not `q`, not `phi`. Finally toggle the shown-state class on the panel itself according to whether any row ended up shown. Guard against a row element that does not exist yet so the same function survives Task 2 adding Alice.

Write `initScratchpad()`: if `IntersectionObserver` is not a function, return immediately and leave the panel permanently hidden — a graceful no-op is the whole fallback, since this page already requires a BigInt-era browser and a scroll-listener re-implementation would be a second derivation of the same predicate. Otherwise construct exactly one observer with `{threshold: 0}` whose callback, for each entry, derives the party id from the observed element's own id (strip the section prefix), sets that party's scrolled-past flag to `entry.isIntersecting === false && entry.boundingClientRect.bottom <= 0`, and calls `updateScratchpad()` once after the entry loop. The `bottom` term is load-bearing: a section that has simply not been reached yet is also non-intersecting, and must not reveal the panel. Observe `#step-bob` only in this task.

**(e) Wire the two call sites.** Append a call to `updateScratchpad()` as the last statement of `renderKeyOutput()`, after the line that reveals the output container — that is the single existing derivation point for "what this party's public key is", so a regeneration refreshes the row for free. Then call `initScratchpad()` once beside the two existing bottom-of-script click registrations. The observer's own first callback establishes the initial state, so no extra priming call is needed.
  </action>
  <verify>
    <automated>test -s "$SP/fnr-base.html" && node "$SP/rsa-scratchpad-harness.js" t1 && { diff -u "$SP/fnr-base.html" 'RSA/rsa.html' > "$SP/t1.diff"; true; } && grep -vE '^[-+][[:space:]]*(//|/\*|\*|<!--)' "$SP/t1.diff" | grep -E '^\+' | grep -cE '#[0-9a-fA-F]{3,8}|rgba?\(|hsla?\(|<scr''ipt|<li''nk|htt''ps?://' | grep -qx 0 && sha256sum -c --status "$SP/fnr-others.sha" && [ "$(grep -c 'new IntersectionObserver' 'RSA/rsa.html')" = 1 ] && [ "$(grep -c 'function updateScratchpad' 'RSA/rsa.html')" = 1 ] && [ "$(grep -c 'keycard' 'RSA/rsa.html')" = "$(grep -c 'keycard' "$SP/fnr-base.html")" ] && [ "$(grep -c 'crt-' 'RSA/rsa.html')" = "$(grep -c 'crt-' "$SP/fnr-base.html")" ] && [ "$(grep -c 'lock-note' 'RSA/rsa.html')" = "$(grep -c 'lock-note' "$SP/fnr-base.html")" ] && [ "$(grep -c 'rel="stylesheet"' 'RSA/rsa.html')" = "$(grep -c 'rel="stylesheet"' "$SP/fnr-base.html")" ] && GS="$(git status --porcelain --untracked-files=no -- . ':(exclude).planning')" && [ "$(printf '%s\n' "$GS" | grep -c .)" = 1 ] && printf '%s\n' "$GS" | grep -q 'RSA/rsa\.html'</automated>
  </verify>
  <done>Loading the page shows no panel. Generating Bob's keypair and scrolling until step 1 has left the top of the viewport reveals a small pinned card at the bottom-left carrying Bob's name, his public exponent and his modulus, digit-for-digit identical to his public keycard and containing none of his private material; scrolling back up hides it again, and with no keypair generated scrolling past step 1 reveals nothing. The card is `position:fixed`, holds no focusable node, lets a click through to whatever is beneath it, and sits clear of the sticky header. The single-file, no-literal-colour, no-new-external-resource and no-collateral-change gates all hold, and `RSA/rsa.html` is the only modified tracked file.</done>
</task>

<task type="auto" tdd="true">
  <name>Task 2: Alice's independent row, long-modulus abbreviation, and small-viewport behaviour</name>
  <files>RSA/rsa.html</files>
  <read_first>
    The panel markup, CSS block and JS section as Task 1 left them, plus the existing `@media (max-width:640px)` rule on `.keycards` (~103) and the file's existing reduced-motion handling if any, so the new media queries sit in the same idiom.
  </read_first>
  <behavior>
    Harness scenario `t2`, same 900x700 iframe unless stated:
    - Independence: with both keypairs generated from the page defaults, scrolled so `#step-bob`'s rect bottom is above the viewport top while `#step-alice` is still intersecting — Bob's row carries the shown-state class, Alice's does not, and the panel is visible. Scrolled further, past `#step-alice` too — both rows carry it. Scrolled back to the top — neither does, and the panel is hidden.
    - Divider correctness: in the Bob-only state, Alice's row computes to `display:none`; in the both-shown state, the computed top border width on the second shown row is non-zero and on the first shown row is zero.
    - Mirror fidelity for Alice: her row's exponent and modulus substrings equal the ones rendered in `#alice-output .keycard.pub`, and her row excludes her private-exponent string and her two prime strings (each needle asserted non-empty first).
    - Freshness: back at the top, replace `#bob-p` with `71` and `#bob-q` with `59`, click `#bob-gen-btn`, scroll past both sections — Bob's row now matches the *newly* rendered keycard, and the harness asserts the new modulus string differs from the one captured before the regeneration, so a stale row cannot pass.
    - Abbreviation and the growth cap: reload a fresh frame, enter `2305843009213693951` and `2147483647` as Bob's primes (both prime), generate, scroll past step 1 — Bob's modulus line is not equal to the keycard's modulus string, it ends with a parenthesised digit count whose number equals the count of digit characters in the keycard's modulus string, and the panel's rect height is at most 220px with its rect bottom inside the viewport.
    - Narrow viewport: resize the iframe to 340px wide — the panel computes to `display:none`. Resize to 600px wide — it is displayed again, its rect `left` is at least 0, its rect `right` is at most the viewport width, and it still clears the sticky header.
    - Re-running scenario `t1` afterwards still passes unchanged.
  </behavior>
  <action>
**(a) Add Alice's row to the markup**, immediately after Bob's row inside the panel: same structure, ids `scratch-row-alice`, `scratch-alice-e`, `scratch-alice-n`, classes `scratch-who alice`, text `Alice`.

**(b) Add her colour mapping** beside Bob's: `.scratch-who.alice{ color:var(--role-alt); }` — the same token `.name.alice` already uses. One declaration; no other CSS change in this step.

**(c) Observe her section.** Extend `initScratchpad()` so the one existing observer also observes `#step-alice`. Do not construct a second observer and do not duplicate the callback — the callback already derives the party id from the observed element's id, so both sections share one code path. `updateScratchpad()` already loops both party ids and already tolerates a missing row, so it needs no change for this step; confirm that by reading it rather than by editing it.

**(d) Add the two viewport rules**, at the tail of the panel's CSS block:
- `@media (max-width:640px)`: narrow the panel's `width` `min()` to a smaller first term, trim its `padding`, and drop its `font-size` a notch. Nothing else.
- `@media (max-width:380px), (max-height:400px)`: `display:none` on the panel. Below those sizes a pinned card is more obstruction than reference, and the user's brief allows hiding it outright. Because the shown-state class only touches opacity, transform and visibility, this `display:none` wins with no specificity fight.
- Also add a `@media (prefers-reduced-motion:reduce)` rule zeroing the panel's `transition` and `transform`, matching what eight other tools in this repo already do for their own animated affordances.

**(e) Verify the abbreviation path end-to-end rather than by inspection.** `scratchNum()` already exists from Task 1; this step adds no production code for it. Drive it through the harness with the two large primes named in `<behavior>` and confirm the panel stays inside its cap. If the abbreviation does not trigger at that size, fix the threshold comparison in `scratchNum()` — do not widen the panel and do not remove the cap.

**(f) Record in the SUMMARY** the real `$SP` path, the two harness scenario names, and the fact that the panel deliberately reads only `e` and `n` off `State[id]`.
  </action>
  <verify>
    <automated>node "$SP/rsa-scratchpad-harness.js" t2 && node "$SP/rsa-scratchpad-harness.js" t1 && { diff -u "$SP/fnr-base.html" 'RSA/rsa.html' > "$SP/t2.diff"; true; } && grep -vE '^[-+][[:space:]]*(//|/\*|\*|<!--)' "$SP/t2.diff" | grep -E '^\+' | grep -cE '#[0-9a-fA-F]{3,8}|rgba?\(|hsla?\(|<scr''ipt|<li''nk|htt''ps?://' | grep -qx 0 && sha256sum -c --status "$SP/fnr-others.sha" && [ "$(grep -c 'new IntersectionObserver' 'RSA/rsa.html')" = 1 ] && [ "$(grep -c 'function updateScratchpad' 'RSA/rsa.html')" = 1 ] && [ "$(grep -c 'function scratchNum' 'RSA/rsa.html')" = 1 ] && [ "$(grep -c 'scratch-row' 'RSA/rsa.html')" -ge 4 ] && [ "$(grep -c 'keycard' 'RSA/rsa.html')" = "$(grep -c 'keycard' "$SP/fnr-base.html")" ] && [ "$(grep -c 'crt-' 'RSA/rsa.html')" = "$(grep -c 'crt-' "$SP/fnr-base.html")" ] && [ "$(grep -c 'renderKeyOutput' 'RSA/rsa.html')" = "$(grep -c 'renderKeyOutput' "$SP/fnr-base.html")" ] && [ "$(grep -c 'rel="stylesheet"' 'RSA/rsa.html')" = "$(grep -c 'rel="stylesheet"' "$SP/fnr-base.html")" ] && GS="$(git status --porcelain --untracked-files=no -- . ':(exclude).planning')" && [ "$(printf '%s\n' "$GS" | grep -c .)" = 1 ] && printf '%s\n' "$GS" | grep -q 'RSA/rsa\.html'</automated>
    <human-check>Open `RSA/rsa.html` in a browser, generate both keypairs, and scroll slowly from the top to the footer in night mode and then in day mode. Confirm the card fades in at the bottom-left as each step leaves the top of the screen, that its text is legible against the page's gradient in both themes, that it never covers a control you want to click, and that it disappears when you scroll back up. Then narrow the window to phone width and confirm it steps aside rather than crowding the page.</human-check>
  </verify>
  <done>Both rows work independently: passing step 1 shows Bob alone, passing step 2 adds Alice below a divider, returning to the top clears both. Each row mirrors its own public keycard exactly and carries none of that party's private material. Regenerating a keypair updates the row. A 29-digit modulus abbreviates with its digit count and the card's height stays inside its 220px cap. At 340px wide the card removes itself; at 600px it fits the viewport and clears the header. Reduced-motion users get no transition. Both harness scenarios pass and every gate from Task 1 still holds.</done>
</task>

</tasks>

<harness_recipe>
Write `$SP/rsa-scratchpad-harness.js` once in Task 1 and extend it in Task 2. Node standard library only — no install, no dependency, nothing added to the repo.

It takes one scenario argument (`t1`, `t2`), serves the checkout root (its own cwd) over an ephemeral loopback port, serves one in-memory `/__driver.html` route, and accepts one POST route on which it records the verdict. The driver page hosts the tool in a same-origin iframe (default 900x700, explicit width and height styles so the media queries have a definite viewport), runs the scenario's assertions against `iframe.contentWindow` / `contentDocument`, and POSTs `PASS` or `FAIL` with the check count and, on failure, the first mismatch.

Scroll by calling `iframeWin.scrollTo(0, y)` with `y` computed from the observed section's `offsetTop + offsetHeight + margin`; the tool page scrolls inside the iframe because its content far exceeds 700px once a keypair is generated. **After every scroll and every resize, wait two animation frames plus ~320ms before reading anything** — the observer callback is async and the panel's own transition is ~180ms. Read the shown-state class and the non-animated computed properties (`position`, `pointer-events`, `display`) for structural assertions, and computed `visibility` only after that settle.

Resize for the narrow-viewport checks by setting the iframe element's `style.width` and letting the media queries in the framed document respond to their own viewport; wait the same settle before reading.

Derive every expected digit string from the page itself — read `#bob-output .keycard.pub` and `.keycard.priv` and compare substrings — rather than re-deriving RSA arithmetic in the harness. That makes the assertion a mirror-fidelity check, immune to the page's own exponent-selection policy. Assert every exclusion needle is a non-empty string of at least two characters *before* using it, so no exclusion check can pass vacuously.

Spawn Chrome as `google-chrome --headless=new --disable-gpu --no-sandbox --user-data-dir="$(mktemp -d)" "<loopback driver URL>"`, wait for the POST, kill Chrome, print the verdict, exit 0 only on `PASS`. Deliberately omit `--virtual-time-budget` here, unlike the earlier hover-panel harnesses: this scenario depends on real scroll and intersection timing, and a virtual clock can retire the settle waits before the observer has delivered a callback. If a scenario hangs instead of reporting, add a wall-clock watchdog in the harness that POSTs `FAIL` with the last completed check, rather than reaching for a virtual clock.

<!-- planner-discipline-allow: <scr''ipt -->
<!-- planner-discipline-allow: <li''nk -->
<!-- planner-discipline-allow: htt''ps?:// -->
The loopback URL belongs to the harness and is never written into `RSA/rsa.html`; the per-task diff gate reads the diff only, so the two cannot collide. The three external-resource needles in the gates are written split so the gate's own pattern text cannot be mistaken for a match target inside this plan.

**Vacuity-check every scenario before declaring it passing.** For each of the three central assertions — panel reveal on scroll-past, mirror fidelity, private-material exclusion — temporarily invert the corresponding production line (e.g. negate the scrolled-past predicate, point a row at the private field), confirm the harness reports `FAIL` naming that check, then revert. Record in the SUMMARY that this was done.
</harness_recipe>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| user input → page DOM | prime and message fields are typed by the user and parsed into BigInt before any render |
| private key material → rendered surface | `State[id]` holds `p`, `q`, `phi`, `d` alongside `e` and `n`; every render decides which of those reaches the screen |
| fixed overlay → page controls | a `position:fixed` layer sits above the scrolling document and could intercept pointer events destined for real controls |

## STRIDE Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation Plan |
|-----------|----------|-----------|----------|-------------|-----------------|
| T-fnr-01 | Information Disclosure | `updateScratchpad()` reading `State[id]` | medium | mitigate | the function reads exactly `e` and `n`; both tasks assert per-row that the party's private-exponent and prime strings, read live off the page, are absent from the row, with each needle proven non-empty first |
| T-fnr-02 | Tampering | the row's value nodes | low | mitigate | values are BigInts routed through `fmt()`/`scratchNum()` (digits, separators and an ellipsis only) and assigned with `textContent`, never `innerHTML`, so no user-typed string is ever HTML-parsed |
| T-fnr-03 | Denial of Service | the fixed overlay covering page controls | low | mitigate | `pointer-events:none`, a viewport-clamped `width`, a `max-height` cap, a stacking number below the sticky header, and a hide rule on very small viewports; the harness asserts `elementFromPoint` at the panel centre resolves outside the panel and that the panel's rect clears the header |
| T-fnr-04 | Tampering | `assets/palette.css` and every other repo file | low | mitigate | a checksum manifest of all tracked files outside `.planning/` (excluding the one edited file) is verified by both task gates, and a working-tree check asserts exactly one modified tracked file |
| T-fnr-SC | Tampering | npm/pip/cargo installs | high | accept | no package-manager install exists in this plan or this repo: there is no manifest, no lockfile and no dependency step, and the diff gate rejects any newly added external reference on an added line. Nothing to audit, so the legitimacy gate has no input |
</threat_model>

<verification>
1. `node "$SP/rsa-scratchpad-harness.js" t1` and `t2` — both exit 0, after both were vacuity-checked by temporary inversion.
2. `diff -u "$SP/fnr-base.html" 'RSA/rsa.html'` — added lines contain no literal colour notation and no newly added external reference.
3. `sha256sum -c --status "$SP/fnr-others.sha"` — every other tracked file outside `.planning/` is byte-identical; `assets/palette.css` in particular is untouched.
4. `git status --porcelain --untracked-files=no -- . ':(exclude).planning'` — captured into a variable first so a failing `git` cannot read as clean, then asserted to be exactly one non-empty line naming `RSA/rsa.html`.
5. Occurrence-count stability for `keycard`, `crt-`, `lock-note`, `renderKeyOutput` and `rel="stylesheet"` between the baseline and the edited file — no collateral edit to the keycards, the CRT decryption feature, the step-locking overlay or the page's resource links.
6. Single-derivation gates: exactly one observer construction, one `updateScratchpad`, one `scratchNum`.
7. The `<human-check>` scroll-through in both themes plus a phone-width narrowing.
</verification>

<success_criteria>
A learner reading step 4's factoring argument can see Bob's and Alice's public exponents and moduli in a small pinned card at the bottom-left, without scrolling back to step 1. The card is absent at the top of the page, absent for a party whose keypair does not exist, and absent on a very small viewport. It is unreadable-from and unwritable-to: no control, no tab stop, no pointer capture, and no private key material. Its digits always agree with the keycards they mirror, including after a regeneration. `RSA/rsa.html` remains a single self-contained file with every colour resolved through `assets/palette.css`, and no other file in the repo changed.
</success_criteria>

<output>
Create `.planning/quick/260930-fnr-in-the-rsa-tool-add-a-non-editable-scrat/260930-fnr-SUMMARY.md` when done.
</output>
