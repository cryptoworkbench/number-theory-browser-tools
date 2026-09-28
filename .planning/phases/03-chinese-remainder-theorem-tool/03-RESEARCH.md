# Phase 3: Chinese Remainder Theorem Tool - Research

**Researched:** 2026-09-28
**Domain:** Client-side vanilla-JS educational visualization (number theory — simultaneous congruences), matching an established single-file-per-tool repo pattern
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**D-01 (Residue-class visualization, CRT-03):** Represent each congruence as a horizontal number-line strip (one row per congruence, 2 or 3 rows stacked), with cells/ticks along a shared x-axis from 0 up to at least `lcm(moduli)` (capped for readability — see D-06). Cells at positions `x ≡ a_i (mod m_i)` are highlighted in that row's own color; a synchronized column at the bottom shows where all rows agree (the simultaneous solution). This mirrors the Sieve of Eratosthenes' grid/strip visual language already established in the repo, and makes "solution = intersection of residue classes" directly legible as a vertical alignment across rows rather than requiring a new diagram vocabulary (e.g. overlapping circles) that isn't in the repo yet.

**D-02 (Color roles, CRT-03):** Use `--role-input` for a row's plain highlighted cells (the residue class itself), `--role-active` for the current brute-force scan cursor column, and `--role-result` for the final solution column once found. Non-coprime validation state uses `--role-warn`. The Extended-Euclidean "faster alternative" reveal uses `--role-special`, matching how Fermat's Method and RSA already use that token for an advanced/optional path. — Reversibility: reversible — pure CSS token mapping, easy to re-map later.

**D-03 (Brute-force scan animation, CRT-04):** Reuse the existing playback-control shape from the Euclidean Algorithm and Sieve tools (play/pause/step/instant-finish, a `generation` counter to invalidate stale animation callbacks, `setTimeout`-staggered reveals) rather than inventing a new animation primitive. The scan advances `x` from 0 upward, testing each row's congruence at that `x`, and stops at the first `x` where all rows agree — that is the CRT solution in `[0, lcm)`. *(See this document's Common Pitfall #2 for a session-verified correction: the actual `generation`+`setTimeout` shape lives in Fermat's Method, not the Sieve; the Sieve uses `requestAnimationFrame` with no generation guard.)*

**D-04 (Extended-Euclidean construction, CRT-05):** After the brute-force scan lands on the solution, show a "Reveal faster method" toggle (echoing the Euclidean Algorithm tool's existing Extended Euclidean toggle framing) that walks through the standard CRT construction: for each modulus `m_i`, compute `M_i = lcm/m_i`, its modular inverse `y_i` mod `m_i` via the extended Euclidean algorithm, then `x = Σ a_i * M_i * y_i mod lcm`. This is presented as a second, optional explanation path — the brute-force scan is the default/primary teaching path, matching how GCD-06's Extended Euclidean mode is opt-in on top of the primary reduction trace.

**D-05 (Coprimality validation, CRT-02):** Validate pairwise `gcd(m_i, m_j)` for every pair of entered moduli on every input change. When any pair is non-coprime, show a clear inline warning (using `--role-warn`, matching the existing validation-error pattern in every other tool's message area) explaining CRT's standard form doesn't apply, rather than silently computing a wrong or partial answer. The tool does not attempt the generalized (non-coprime) CRT variant — that's out of scope (see REQUIREMENTS.md "Out of Scope": no N>3 general solver, and pairwise-coprime is the documented precondition).

**D-06 (Congruence count toggle, CRT-06):** A 2-vs-3 congruence toggle adds/removes the third input row and its number-line strip, matching the interaction shape of the Venn Diagram tool's existing 2-circle/3-circle toggle (same "add a set" UX the user already has in the repo). Modulus and remainder inputs are range-validated and capped (small moduli, e.g. up to 20-30) to keep the number-line strip and the scan animation readable and fast — the same "cap the input range for readability" principle already applied to GCD's rectangle-tiling view and documented in REQUIREMENTS.md's Out-of-Scope table. *(This document's Common Pitfall #5 recommends tightening this cap to ~12-15; see Open Question #1.)*

**D-07 (Presets, CRT-07):** Ship preset chips covering: (1) the classic Sun Tzu "remainders riddle" (`x≡2 mod 3, x≡3 mod 5, x≡2 mod 7`, solution 23) as the signature preset, (2) a simple 2-congruence coprime example, and (3) a non-coprime pair that triggers the CRT-02 validation warning, so the warning path is discoverable via a preset rather than only by accident. Mirrors the Euclidean Algorithm tool's preset-chip pattern (GCD-04): coprime case, edge case, and here also an invalid-input case since that's a first-class requirement (CRT-02).

**D-08 (Cross-link to GCD tool, CRT-08):** One-directional deep link from the CRT tool to the Euclidean Algorithm tool, passing a chosen modulus pair as `?a=&b=` (the existing, already-shared param contract read by `Euclidean Algorithm/euclidean-algorithm.html`'s `readABParams()`). Extend `euclidean-algorithm.html` with a new optional URL param (e.g. `?ext=1`) that auto-enables its existing Extended Euclidean toggle on load, so the CRT tool's link lands the user directly on the modular-inverse step rather than requiring a manual toggle click afterward. This is a small, additive change to the existing tool's load-time param handling (same shape as its current `?a=&b=` handling), not a redesign. — Reversibility: reversible — additive URL param, no existing behavior changes if the param is absent. Unlike Task 1 (Euclidean Algorithm ⟷ Venn Diagram, which got the full bidirectional shared-localStorage-store treatment), CRT-08 only requires one direction (CRT → GCD) per its own wording — no reverse link, no shared persistent store.

### Claude's Discretion
- Exact color assignment per row (2nd vs 3rd congruence) beyond the role-token mapping in D-02.
- Exact riddle preset wording/flavor text (a rabbits/eggs/soldiers framing) — pick whichever reads well against the site's existing playful preset copy (see Euclidean Algorithm's and Sieve's chip labels).
- Exact moduli/remainder input ceiling — pick a value that keeps the number-line strip's cell count on-screen without horizontal scrolling at common viewport widths, following the same "shrink-then-scroll" instinct already used by the Cayley Table (05-03-PLAN.md). *(This document's Common Pitfall #5 and Open Question #1 give a concrete recommendation: ~12-15 per modulus.)*

### Deferred Ideas (OUT OF SCOPE)
- General N>3 congruence solver — explicitly out of scope per REQUIREMENTS.md, tracked as CRT-V2-01 for a future release.
- A bidirectional, persistent shared-state link between CRT and the Euclidean Algorithm tool (the Task-1-style `localStorage`+cookie shared store) — not required by CRT-08's wording; a one-directional URL-param deep link suffices. Revisit only if a future requirement asks for two-way sync.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-------------------|
| CRT-01 | User can input two or three congruences of the form `x ≡ a (mod m)` | Architecture Patterns (residue-strip DOM structure per row), Common Pitfall #6 (remainder-range handling), Code Examples (input validation shape mirrors Euclidean's `readInputs()`) |
| CRT-02 | User receives a clear validation warning if the moduli are not pairwise coprime, rather than a silently wrong answer | Code Examples ("Pairwise coprimality gate"), Don't Hand-Roll (`gcd()` reuse pattern), Security Domain (V5 Input Validation) |
| CRT-03 | User sees a visual representation of each modulus's residue class, with the simultaneous solution shown as their intersection | Architecture Patterns Pattern 1 (CSS-Grid residue strip), Common Pitfall #5 (render-cap vs. search-cap distinction) |
| CRT-04 | User can watch an animated brute-force scan that finds and lands on the simultaneous solution | Architecture Patterns Patterns 2 & 3 (generation-guarded rAF + events-per-frame speed ramp), Common Pitfalls #2 & #3 |
| CRT-05 | User can reveal an Extended-Euclidean-based construction method as an advanced/faster alternative to the brute-force scan | Code Examples ("Extended-Euclidean-derived modular inverse", "CRT construction"), Don't Hand-Roll (modular-inverse reuse), Sources (cp-algorithms.com cross-check) |
| CRT-06 | User can toggle between 2 and 3 simultaneous congruences | Architecture Patterns Pattern 4 (parallel-DOM-structure mode toggle, Venn Diagram precedent) |
| CRT-07 | User can pick preset examples, including a classic "remainders riddle" framing | Locked Decision D-07 above (verbatim from CONTEXT.md); Architecture Patterns preset-chip wiring precedent (Euclidean Algorithm) |
| CRT-08 | User can navigate from the CRT tool to the GCD tool's modular-inverse step | Architecture Patterns Pattern 5 (URL-param cross-link), Common Pitfall #1 (the `?ext=1` param must be newly built in `euclidean-algorithm.html`, not just read) |
</phase_requirements>

## Summary

This phase ships one new self-contained tool, `Chinese Remainder Theorem/chinese-remainder-theorem.html`, into a repo that already has eleven tools built to one proven architecture: inline `<style>`/`<script>`, no build step, no external JS dependency beyond Google Fonts, all color via `var()` against `assets/palette.css`'s `--role-*` tokens. Nothing about this phase requires a new technical pattern — every piece it needs (playback controls with a `generation` counter, a preset-chip UI, a 2-vs-3-mode toggle, a URL-param cross-link, a CSS-Grid cell strip with a shrink-then-scroll sizing ladder) already exists in a sibling tool and should be mirrored, not invented. The one genuinely new visual element is the residue-class number-line strip (CONTEXT.md D-01); the closest and correct precedent for it is the Sieve of Eratosthenes's plain-DOM-div `.cell` grid (`display:grid; grid-template-columns: repeat(auto-fill, minmax(var(--cell-min), 1fr))`), not an SVG diagram — CRT-03's "row of cells" language maps directly onto that CSS Grid idiom.

Two concrete corrections to CONTEXT.md's canonical_refs are documented below (Common Pitfalls #1 and #2): the `?ext=1` load param CRT-08 needs does **not** yet exist in `euclidean-algorithm.html` and must be added as new code, not "read"; and the "generation counter + `setTimeout`" playback shape CONTEXT.md attributes to the Sieve tool actually lives in Fermat's Method — the Sieve itself uses `requestAnimationFrame` with no generation guard, and the Euclidean Algorithm tool (the closer structural match for a step-by-step reveal) uses `requestAnimationFrame` **with** a generation guard. This phase should copy the Euclidean Algorithm tool's rAF+generation shape for the discrete "step" reveal, and additionally copy the Sieve's exponential events-per-frame speed ramp for the brute-force scan specifically, because a per-step dwell time (Euclidean's model) does not scale to a scan that can run into the thousands of `x` values.

A load-bearing scoping finding: with moduli capped for UI readability (CONTEXT.md D-06, ~20-30 ceiling under discretion), the combined modulus `lcm(moduli)` stays in the low thousands at worst — nowhere near `Number.MAX_SAFE_INTEGER` (9×10^15). STATE.md's Phase 3 blocker note ("implement CRT's core arithmetic in BigInt from day one") predates this modulus-cap decision and does not apply once the cap is enforced; plain JS `Number` arithmetic is sufficient and matches every non-RSA/non-Diffie-Hellman tool in the repo. Using BigInt here would be unjustified complexity for values under 100,000.

**Primary recommendation:** Copy `Euclidean Algorithm/euclidean-algorithm.html` wholesale as the structural skeleton (playback controls, preset chips, extended-Euclidean-style math helper, cross-link plumbing), replace its rectangle-tiling diagram with a Sieve-style CSS-Grid residue-strip per congruence row, and extend `euclidean-algorithm.html` with one small additive `?ext=1` load param.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Congruence input + validation (CRT-01, CRT-02) | Browser / Client | — | Pure client-side form validation, no network, mirrors every existing tool's `readInputs()` pattern |
| Pairwise coprimality check (CRT-02) | Browser / Client | — | Pure arithmetic (`gcd` loop), computed synchronously on every input change |
| Residue-class visualization (CRT-03) | Browser / Client | — | DOM/CSS Grid rendering, no server involved |
| Brute-force scan animation (CRT-04) | Browser / Client | — | `requestAnimationFrame`-driven state machine, all in-page |
| Extended-Euclidean construction reveal (CRT-05) | Browser / Client | — | Pure arithmetic + DOM reveal toggle |
| 2-vs-3 congruence toggle (CRT-06) | Browser / Client | — | DOM show/hide of a third row, mirrors Venn Diagram's mode toggle |
| Preset examples (CRT-07) | Browser / Client | — | Static chip data wired to the same input-filling function used by manual entry |
| Cross-link to GCD tool (CRT-08) | Browser / Client | — | `<a href>` with URL query params; no shared backend state |

There is no Frontend-Server/API/Database tier in this project — the whole site is static HTML served via `file://` or any static host (CLAUDE.md, PROJECT.md). All eight CRT-0x capabilities are Browser/Client-only.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Vanilla JS (ES2020+) | native (browser) | All logic: math, DOM, SVG-free rendering | Repo-wide convention (`CLAUDE.md`, `.claude/CLAUDE.md`); zero dependencies is a deliberate architectural constraint, not an oversight |
| CSS custom properties via `assets/palette.css` | n/a (existing file, read this session) | All color | PAL-01/02/04 — locked repo-wide convention; every tool consumes `--role-*` tokens, never literal colors `[VERIFIED: assets/palette.css:42-61]` |
| Google Fonts (`Fraunces`, `Source Sans 3`, `JetBrains Mono`) | current hosted version | Type | The only external resource any tool loads (`CLAUDE.md` explicit rule); every sibling tool loads the identical `<link>` `[VERIFIED: Euclidean Algorithm/euclidean-algorithm.html:12-13]` |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `assets/site.css` | existing file | Shared nav header, theme-switch chrome | Linked by every tool before its own `<style>` block `[VERIFIED: Euclidean Algorithm/euclidean-algorithm.html:9-10]` |
| `assets/theme.js` | existing file | Day/night theme persistence + cross-tab sync | Loaded `defer` by every tool `[VERIFIED: Euclidean Algorithm/euclidean-algorithm.html:11]` |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Plain-DOM-div CSS Grid residue strip | SVG-rendered strip (`svgEl()` helper, matching Euclidean's tile diagram) | SVG buys per-cell hover tooltips and crisper scaling at extreme cell counts, but the Sieve's own grid — the tool CONTEXT.md explicitly cites as the visual precedent — is plain DOM, and plain DOM is simpler to build/debug for a rectangular cell strip with no diagonal/curved geometry |
| Per-`x` dwell-time playback (Euclidean's model) | Sieve's events-per-frame speed ramp for the scan phase | Dwell-time-per-step is fine for a handful of steps (GCD traces are usually <20 steps) but does not scale to a scan of up to ~lcm(moduli) values; see Common Pitfall #3 |
| Number arithmetic | BigInt (RSA/Diffie-Hellman's pattern) | BigInt is required only when values can exceed 2^53; with moduli capped ≤30, worst-case lcm is in the tens of thousands — plain Number is correct and simpler here (see Common Pitfall #4) |

**Installation:**
```bash
# None — no package manager, no build step (CLAUDE.md constraint). Create the file directly:
mkdir -p "Chinese Remainder Theorem"
touch "Chinese Remainder Theorem/chinese-remainder-theorem.html"
```

**Version verification:** N/A — no packages to verify. This phase installs zero external dependencies. See Package Legitimacy Audit below.

## Package Legitimacy Audit

**Not applicable.** This phase, like every phase in this repo, installs no external packages — no npm/pip/cargo dependency of any kind. The only external resource is a Google Fonts `<link>` tag, which is not a package and has been used identically and safely across all eleven existing tools. The Package Legitimacy Gate protocol (registry lookups, `npm view`, postinstall-script checks) does not apply because there is no package manager in this project by explicit architectural decision (`CLAUDE.md`: "There is no build system, package manager, or test suite").

**Packages removed due to [SLOP] verdict:** none — none considered.
**Packages flagged as suspicious [SUS]:** none — none considered.

## Architecture Patterns

### System Architecture Diagram

```
User types/selects congruences (2 or 3 rows)
        │
        ▼
readInputs() — validate each (a_i, m_i): integer, m_i ≥ 1, 0 ≤ a_i < m_i or auto-reduce
        │
        ▼
pairwiseCoprimeCheck(moduli) ──► NOT coprime ──► render --role-warn banner, STOP (no solve)
        │
        │ coprime
        ▼
computeLcm(moduli) + capCheck(lcm) ──► exceeds render ceiling ──► shrink-then-scroll strip (Cayley Table pattern)
        │
        ▼
buildResidueStrips(congruences, lcm) — one CSS-Grid row per congruence, cells x ≡ a_i (mod m_i) tinted --role-input
        │
        ▼
Brute-force scan (Play/Pause/Step/Instant, generation-guarded rAF loop, Sieve-style events/frame ramp)
   advances cursor x = 0, 1, 2, … ; tests each row; highlights column --role-active
        │
        ▼
First x where ALL rows agree ──► lock column --role-result, stop scan, render "x ≡ solution (mod lcm)"
        │
        ▼
"Reveal faster method" toggle (--role-special, mirrors Euclidean's Extended-Euclidean toggle)
   for each i: M_i = lcm/m_i → y_i = modInverse(M_i, m_i) via extended-Euclidean loop → x = Σ a_i·M_i·y_i mod lcm
        │
        ▼
Cross-link: pick a modulus pair → deep-link to euclidean-algorithm.html?a=&b=&ext=1
   (lands directly on that tool's Extended Euclidean / Bézout-coefficient step)
```

### Recommended Project Structure
```
Chinese Remainder Theorem/
└── chinese-remainder-theorem.html    # single self-contained file: <style>, markup, <script>
```
No other new files. `index.html` and every existing tool's nav header gain one new `<a>` entry (12 tools total after this phase).

### Pattern 1: Residue-class strip as CSS Grid (not SVG)
**What:** One row per congruence; a CSS Grid of plain `<div class="cell">` elements, cell count driven by `lcm(moduli)` (or a capped render window), matching the Sieve's `.grid`/`.cell` idiom.
**When to use:** For CRT-03's "residue class as highlighted cells" and CRT-04's "scan cursor moves across cells."
**Example:**
```css
/* Source: Sieve Of Eratosthenes/sieve-of-eratosthenes.html:225-226, 244 [VERIFIED] */
.grid{
  display:grid;
  grid-template-columns: repeat(auto-fill, minmax(var(--cell-min), 1fr));
}
.cell{ /* per-cell base style, see sieve-of-eratosthenes.html:244 for the full rule */ }
```
CRT should declare one `.crt-row` grid per congruence (not one shared grid across all rows) so each row's cells align in a shared column index by construction (same `grid-template-columns` value/count across rows), giving the "solution = vertical alignment" effect CONTEXT.md D-01 describes for free from CSS Grid column alignment, no manual pixel math needed.

### Pattern 2: `generation`-guarded `requestAnimationFrame` playback (Euclidean Algorithm's shape)
**What:** A monotonically-incrementing `generation` counter, bumped on every reset, checked inside any deferred callback before it mutates the DOM.
**When to use:** For the brute-force scan's Play/Pause/Step/Instant controls (CRT-04).
**Example:**
```js
// Source: Euclidean Algorithm/euclidean-algorithm.html:428-436, 895-905 [VERIFIED]
var playing = false, rafId = null, generation = 0;
function advanceOne(){
  var myGen = generation;
  // ...append/update DOM for this step...
  if (myGen !== generation) return; // abandoned mid-call; bail
  // ...continue...
}
function resetPlayback(){
  generation++; // invalidate any in-flight callback from the abandoned run
  // ...clear DOM...
}
```

### Pattern 3: Exponential events-per-frame speed ramp (Sieve's shape) — use for the scan, not Euclidean's per-step dwell
**What:** At high playback speed, process many `x` values per animation frame instead of one per fixed dwell time.
**When to use:** Any time total step count can be large and unbounded by a small constant (CRT-04's scan can run to `lcm(moduli) - 1` in the worst case).
**Example:**
```js
// Source: Sieve Of Eratosthenes/sieve-of-eratosthenes.html:658-661 [VERIFIED]
function speedToEventsPerFrame(v){
  const table = {1:1,2:2,3:4,4:8,5:16,6:35,7:75,8:160,9:400,10:100000};
  return table[v] || 1;
}
```

### Pattern 4: 2-vs-3 mode toggle as parallel DOM structures with `.hidden`/attribute toggling
**What:** Both the 2-congruence and 3-congruence forms exist in the DOM simultaneously; `setMode()` toggles which is visible and re-renders.
**When to use:** CRT-06.
**Example:**
```js
// Source: Venn Diagram/venn-diagram.html:1578-1591 [VERIFIED]
function setMode(mode){
  state.mode = mode;
  var isThree = mode === 'three';
  if (frameTwo) frameTwo.hidden = isThree;
  if (frameThree) frameThree.hidden = !isThree;
  if (modeTwoBtn) modeTwoBtn.setAttribute('aria-pressed', isThree ? 'false' : 'true');
  if (modeThreeBtn) modeThreeBtn.setAttribute('aria-pressed', isThree ? 'true' : 'false');
  render();
}
```
Given CRT's per-row markup is much smaller than Venn's per-region SVG content, a simpler variant — one congruence-row template function called 2 or 3 times, with the 3rd row's container `hidden` toggled — is equally valid and less duplicative; either satisfies CRT-06.

### Pattern 5: URL-param cross-link, read-on-load only (no shared persistent store)
**What:** A `readABParams()`-style regex-based query-string reader, invoked once on `window.addEventListener('load', ...)`; the target tool's own field/state is updated from it if present.
**When to use:** CRT-08 (CRT → Euclidean Algorithm, one direction only per D-08).
**Example:**
```js
// Source: Euclidean Algorithm/euclidean-algorithm.html:502-521 [VERIFIED]
function readABParams(){
  var ma, mb;
  try{
    ma = /[?&]a=([^&#]*)/.exec(location.search);
    mb = /[?&]b=([^&#]*)/.exec(location.search);
  }catch(e){ return null; }
  if (!ma || !mb) return null;
  var a, b;
  try{
    a = parseInt(decodeURIComponent(ma[1]), 10);
    b = parseInt(decodeURIComponent(mb[1]), 10);
  }catch(e){ return null; }
  if (!isFinite(a) || !isFinite(b) || a < 0 || b < 0) return null;
  if (a === 0 && b === 0) return null;
  return { a: a, b: b };
}
```
CRT's outbound link function mirrors `updateXrefLink(a, b)` (`Euclidean Algorithm/euclidean-algorithm.html:483-486`) / `updateEuclidXref(a, b)` (`Venn Diagram/venn-diagram.html:1377-1385`) — build `href` string, no shared storage.

### Anti-Patterns to Avoid
- **Reusing Euclidean's `readABParams`/`euclidSteps` by import:** This repo's convention is per-file duplication of math and param helpers (`CLAUDE.md`: "Number-theory helper functions ... are duplicated per-file rather than shared"). Write CRT's own `gcd()`, `extGcd()`, `readABParam()`-equivalent, and coprimality checker in `chinese-remainder-theorem.html` even though nearly identical functions exist elsewhere.
- **Literal color values:** Every color must resolve through `var()` against `assets/palette.css` tokens, per PAL-01/04 and the project's explicit style-block constraint (`CLAUDE.md`: "declares no literal color"). A new tool may declare a local alias only if it's a non-color custom property (e.g. `--cell-min`) or built purely from `var()`/`color-mix()`.
- **One shared grid spanning all congruence rows:** Building the residue strip as one big grid with rows/cols manually indexed (instead of N independent `.crt-row` grids sharing the same `grid-template-columns` cell count) risks the rows drifting out of alignment if row heights differ — CSS Grid's per-row `display:grid` with an identical column template is simpler and self-aligning.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|--------------|-----|
| GCD / pairwise coprimality | A from-scratch factorization-based coprimality test | The one-line Euclidean `gcd()` loop already proven at `Equivalence Wheel/equivalence-wheel.html:570` `[VERIFIED: Equivalence Wheel/equivalence-wheel.html:570]`: `function gcd(a, b){ while (b){ var t = a % b; a = b; b = t; } return a; }` | Simpler, faster, and already the repo's own precedent — factorization is unnecessary overhead for a coprimality check |
| Modular inverse | A custom brute-force search for `y` such that `M_i·y ≡ 1 (mod m_i)` | The extended-Euclidean forward recurrence already proven at `Euclidean Algorithm/euclidean-algorithm.html:373-389` `[VERIFIED: Euclidean Algorithm/euclidean-algorithm.html:373-389]`, adapted to return just `s` (the Bézout coefficient), then normalized `((s % m_i) + m_i) % m_i` | Brute force is O(m_i) per inverse and teaches nothing beyond what CRT-05 already wants to show (the Extended Euclidean construction) — reuse the same recurrence shape, don't add a second algorithm |
| Cell-count/sizing math for the residue strip | A bespoke pixel-math layout system | The `cellMinPx(M)` breakpoint-ladder idiom proven at `Cayley Table/cayley-table.html:325-332` `[VERIFIED: Cayley Table/cayley-table.html:325-332]`, re-derived (not copied) for the strip's own cell-count curve, wrapped in a `.table-scroll`-style `overflow:auto` container (`Cayley Table/cayley-table.html:127-129` `[VERIFIED]`) as the fallback once shrinking bottoms out | This exact "shrink-then-scroll" idiom is the repo's proven answer to "many cells might not fit a comfortable viewport" — CONTEXT.md's own discretion note points at it |

**Key insight:** Every mathematical or layout primitive this phase needs already has a working, tested implementation somewhere in this eleven-tool repo. The task is disciplined adaptation (same *pattern*, per-file duplicated code, per repo convention), not invention.

## Runtime State Inventory

Not applicable — this is a greenfield tool addition, not a rename/refactor/migration phase. No existing runtime state (localStorage keys, stored data, OS registrations) is being renamed or moved.

## Common Pitfalls

### Pitfall 1: CONTEXT.md's `?ext=1` cross-link param does not exist yet — it must be built, not "extended from existing handling"
**What goes wrong:** A planner reading CONTEXT.md's phrasing ("Extend `euclidean-algorithm.html` with a new optional URL param ... same shape as its current `?a=&b=` handling") could assume the `?ext=1`-equivalent plumbing is a small tweak to code that's already halfway there.
**Why it happens:** CONTEXT.md's D-08 describes the *target* shape correctly, but a literal read of `euclidean-algorithm.html` this session confirms `readABParams()` (`Euclidean Algorithm/euclidean-algorithm.html:502-521`) only reads `a`/`b`, and the `window.addEventListener('load', ...)` handler (`Euclidean Algorithm/euclidean-algorithm.html:1098-1106`) never checks any `ext` param or touches `extToggle`/`appEl.classList` at load time — only the checkbox's own `change` listener does (`Euclidean Algorithm/euclidean-algorithm.html:1047-1049`).
**How to avoid:** Plan a real, if small, task against `euclidean-algorithm.html`: add a `readExtParam()`-style regex reader and, inside the existing `load` handler, `if (readExtParam()) { extToggle.checked = true; appEl.classList.add('show-ext'); }` before or after `buildRun()`.
**Warning signs:** If the plan's task list has zero explicit edits to `euclidean-algorithm.html`, CRT-08's "lands directly on the modular-inverse step" success criterion will not be met — the user will land on the plain GCD trace and have to click the checkbox manually.

### Pitfall 2: The "Sieve-style setTimeout+generation" playback shape CONTEXT.md cites is misattributed
**What goes wrong:** Following CONTEXT.md's canonical_refs literally ("Sieve Of Eratosthenes ... grid/strip animation and playback-loop shape to mirror") for the *animation-loop mechanics* specifically (as opposed to the grid/strip visual, which Sieve is the right precedent for) could lead a planner to look for a `setTimeout` + `generation` pattern in the Sieve file that isn't there.
**Why it happens:** Verified this session: `grep -n "generation" "Sieve Of Eratosthenes/sieve-of-eratosthenes.html"` returns only an unrelated comment (`// ---------- sieve event generation ----------`, line 530); the Sieve's actual playback (`Sieve Of Eratosthenes/sieve-of-eratosthenes.html:664-680`) uses `requestAnimationFrame` with no generation guard at all — it relies on rebuilding the whole grid on reset instead. The `generation`-counter idiom lives in `Euclidean Algorithm/euclidean-algorithm.html:428-436` (rAF-based) and `Fermats Method/fermats-method.html:589,662-672` (`setTimeout`-based, variable name `diagramGen`).
**How to avoid:** For CRT's scan, use the Euclidean Algorithm's `generation`+rAF shape (closer structural match: discrete indexed steps with a chain-line UI) combined with the Sieve's events-per-frame speed table (Pattern 3 above) for the per-frame throughput, since the scan can run far longer than Euclidean's typical <20-step traces.
**Warning signs:** A plan task that says "grep the Sieve tool for its generation-counter pattern" will fail to find one.

### Pitfall 3: A naive one-`x`-per-dwell-time scan does not scale to CRT's worst-case step count
**What goes wrong:** Euclidean Algorithm's playback dwells `SPEED_MS[speed]` (90ms–2600ms, `Euclidean Algorithm/euclidean-algorithm.html:439`) per *single* step, which works because a GCD trace rarely exceeds ~20 steps even in the documented Fibonacci worst case. CRT's brute-force scan searches `x = 0, 1, 2, …` up to `lcm(moduli) - 1` in the worst case before landing on the solution — with moduli capped per D-06 (~20-30), a worst-case pairwise-coprime triple's `lcm` can reach the high thousands to low tens-of-thousands. At Euclidean's slowest "instant-ish" dwell (90ms/step) that is tens of minutes of animation for a single scan.
**Why it happens:** Copying Euclidean's playback constants verbatim without noticing the two tools' step-count distributions are fundamentally different shapes (small-and-bounded vs. potentially-large-and-modulus-dependent).
**How to avoid:** Use Sieve's exponential events-per-frame table (Pattern 3) for the scan's Play speed, and additionally cap the number-line strip's rendered range independent of the underlying search (see Pitfall 5) so Instant-finish is O(1) regardless of `lcm` size (compute the solution directly rather than iterating to it, matching how `instantFinish()` in every playback tool always has a closed-form or pre-computed fast path).
**Warning signs:** A UAT session where pressing Play on a 3-congruence preset near the modulus ceiling appears to hang or never finish within a reasonable demo timeframe.

### Pitfall 4: Do not introduce BigInt — the modulus cap makes it unnecessary, unlike RSA/Diffie-Hellman
**What goes wrong:** STATE.md's own Phase 3 blocker note says "CRT's combined modulus can overflow `Number` precision even with small individual moduli — implement CRT's core arithmetic in `BigInt` from day one." Taken literally, this pushes a plan toward RSA's `BigInt`-based math helpers.
**Why it happens:** That blocker was written before CONTEXT.md's D-06 locked in a UI-readability modulus cap (~20-30 per modulus, "Claude's Discretion" for the exact value). Once that cap is enforced, the worst-case product of three pairwise-coprime moduli near 30 is on the order of 2×10^4–3×10^4 — many orders of magnitude below `Number.MAX_SAFE_INTEGER` (2^53 ≈ 9×10^15) `[ASSUMED: standard IEEE-754 double-precision safe-integer bound, not verified against a spec this session]`. The construction formula's largest intermediate term, `a_i · M_i · y_i` summed over up to 3 terms, stays under ~30 × 30,000 × 30 ≈ 2.7×10^7 per term — still trivially safe.
**How to avoid:** Use plain `Number`/`parseInt` arithmetic throughout, exactly as every non-cryptography tool in the repo does (Euclidean Algorithm, Venn Diagram, Cayley Table, Equivalence Wheel all use plain Number). Reserve `BigInt` for RSA/Diffie-Hellman-style tools where key sizes are the entire point.
**Warning signs:** If a plan task proposes `BigInt` literals (`0n`) or `typeof x === 'bigint'` checks anywhere in the CRT tool, that's a signal the modulus cap either wasn't enforced or wasn't communicated to that task.

### Pitfall 5: The render cap on the number-line strip and the search-space cap for the scan are two different numbers — don't conflate them
**What goes wrong:** D-01 says the strip renders "from 0 up to at least `lcm(moduli)` (capped for readability — see D-06)." If the *visual* cap and the *actual solution search range* are the same variable, a solution whose `x` lands beyond the rendered cap (a real possibility even for a small-looking `lcm`, since the CRT solution is uniformly distributed across `[0, lcm)`) will animate off the visible strip or never appear to land, defeating CRT-04's "watch the scan land on the solution" success criterion.
**Why it happens:** The natural first implementation ties "how many cells to draw" and "how far to search" to the same loop bound.
**How to avoid:** Guarantee the CRT solution always exists within `[0, lcm)` (a theorem, not an implementation choice) and set the strip's rendered-cell ceiling to always cover the full `lcm` for the enforced modulus cap's worst case — i.e., choose the modulus cap (D-06's Claude's-discretion value) low enough that its worst-case `lcm` is itself within the strip's shrink-then-scroll comfort zone (mirroring Cayley Table's node-count reasoning at `Cayley Table/cayley-table.html:336-341` `[VERIFIED]`, which explicitly ties its `MAX_N` choice to "comfortably under the 20,000-node ceiling the Sieve already ships"). Concretely: capping each modulus at a smaller value than "20-30" (e.g., ~12-15) keeps worst-case 3-modulus pairwise-coprime products in the low hundreds, matching the signature riddle preset's own `lcm(3,5,7)=105` in order of magnitude, and keeps the entire `lcm` on-strip without needing horizontal scroll for any preset.
**Warning signs:** A UAT session where a 3-congruence, near-ceiling, coprime combination shows the scan "finish" with no visible solution column, or where the strip has to scroll far right to find it.

### Pitfall 6: A_i not pre-reduced mod m_i
**What goes wrong:** If a user enters `x ≡ 7 (mod 3)` (a valid congruence, since 7 ≡ 1 mod 3), a naive cell-highlighter that does `cells[a_i]` instead of `cells[a_i % m_i]` will try to highlight a cell index outside the row's own modulus-`m_i` residue pattern, or miscompute the "does row agree at x" check if it compares `x === a_i` instead of `x % m_i === a_i % m_i`.
**Why it happens:** Congruence notation conventionally allows `a_i` to be any integer, not just `0 ≤ a_i < m_i`, and Euclidean Algorithm's own input validation (accepting any non-negative integer via regex `^-?\d+$`, `Euclidean Algorithm/euclidean-algorithm.html:449`) is a plausible model to copy without adding the extra `mod` reduction step.
**How to avoid:** Either (a) constrain each remainder input's UI range to `[0, m_i - 1]` (simplest, avoids ambiguity, matches teaching-tool clarity), or (b) accept any integer and display the reduced form (`a_i mod m_i`) explicitly, always testing `x % m_i === ((a_i % m_i) + m_i) % m_i` in the scan. Either is valid; document which was chosen.
**Warning signs:** A preset or manual entry with `a_i ≥ m_i` produces a strip highlighting the wrong cells or a scan that never terminates.

## Code Examples

### Extended-Euclidean-derived modular inverse (for CRT-05's construction step)
```js
// Adapted from the proven recurrence at Euclidean Algorithm/euclidean-algorithm.html:373-389 [VERIFIED]
// Returns y such that (M * y) % m === 1, assuming gcd(M, m) === 1 (guaranteed by
// the CRT-02 pairwise-coprimality gate having already passed).
function modInverse(M, m){
  var r0 = M, r1 = m;
  var s0 = 1, s1 = 0;
  while (r1 !== 0){
    var q = Math.floor(r0 / r1);
    var r2 = r0 - q * r1;
    var s2 = s0 - q * s1;
    r0 = r1; r1 = r2;
    s0 = s1; s1 = s2;
  }
  // r0 is now gcd(M, m), expected to be 1; s0 is the Bezout coefficient for M.
  return ((s0 % m) + m) % m; // normalize into [0, m)
}
```

### CRT construction (the "faster alternative" CRT-05 reveals)
```js
// Standard construction [CITED: cp-algorithms.com/algebra/chinese-remainder-theorem.html,
// cross-checked against CONTEXT.md D-04's identical formula this session]
function crtConstruct(congruences){ // [{a, m}, ...], pairwise coprime m's
  var lcm = congruences.reduce(function(acc, c){ return acc * c.m; }, 1);
  var x = 0;
  congruences.forEach(function(c){
    var Mi = lcm / c.m;
    var yi = modInverse(Mi, c.m);
    x += c.a * Mi * yi;
  });
  return ((x % lcm) + lcm) % lcm;
}
```

### Pairwise coprimality gate (CRT-02)
```js
// gcd() shape verified at Equivalence Wheel/equivalence-wheel.html:570
function gcd(a, b){ while (b){ var t = a % b; a = b; b = t; } return a; }
function firstNonCoprimePair(moduli){
  for (var i = 0; i < moduli.length; i++){
    for (var j = i + 1; j < moduli.length; j++){
      if (gcd(moduli[i], moduli[j]) !== 1) return [i, j];
    }
  }
  return null;
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|---------------|--------|
| N/A | N/A | N/A | This is a stable, decades-old area of elementary number theory; no "current best practice" churn applies to the CRT algorithm itself. The only "state of the art" consideration is this repo's own evolving internal conventions (palette unification, shared-role tokens, shrink-then-scroll sizing), all of which are already captured above. |

**Deprecated/outdated:** none.

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|----------------|
| A1 | `Number.MAX_SAFE_INTEGER` (2^53 ≈ 9×10^15) is the correct safe-integer bound to reason against for "does this need BigInt" | Common Pitfalls #4 | Low — this is a well-known JS spec fact; even if the exact bound were mis-cited, the actual worst-case values here (≤10^5) are so far below any plausible safe-integer bound that the conclusion (no BigInt needed) is robust to the exact cutoff |
| A2 | Recommending a modulus cap of ~12-15 (tighter than CONTEXT.md's own "~20-30" example) keeps worst-case `lcm` in a strip-friendly range | Common Pitfalls #5, Standard Stack alternatives | Medium — this is presented as a strong recommendation for Claude's-Discretion territory, not a locked decision; if the planner instead picks a cap near 30, it must also decide how the strip handles a `lcm` in the low tens of thousands (scroll, truncate-with-note, or a second lower "scan-cap" distinct from the modulus cap) |
| A3 | A CSS Grid (`display:grid`) residue strip is preferable to an SVG-rendered one for this phase | Architecture Patterns, Pattern 1 | Low — CONTEXT.md itself points at the Sieve's grid/strip as the precedent to mirror, and the Sieve is confirmed (this session) to be plain-DOM CSS Grid, not SVG |
| A4 | Users will enter `0 ≤ a_i < m_i` remainders (or the tool should enforce this) rather than freely allowing `a_i ≥ m_i` | Common Pitfalls #6 | Medium — affects input-field `max` attribute and one modulo-reduction line; easy to get wrong silently if not made an explicit task |

## Open Questions

1. **Exact modulus/remainder input ceiling (CONTEXT.md's own Claude's-Discretion item)**
   - What we know: CONTEXT.md suggests "up to 20-30"; this research recommends tightening to ~12-15 so worst-case `lcm` stays strip-friendly without a second scan-vs-render cap split (see Pitfall 5, Assumption A2).
   - What's unclear: Whether the planner/user would rather keep a higher per-modulus ceiling (closer to "20-30") and accept a shrink-then-scroll strip for edge-case combinations, trading a slightly less bounded worst case for a more generous-feeling input range.
   - Recommendation: Plan for the tighter cap (~12-15) as the default; if UAT feedback wants a higher ceiling, the shrink-then-scroll fallback (Cayley Table pattern) is already documented above as the escape hatch.

2. **Should `a_i ≥ m_i` be allowed as input, or should the field be constrained to `[0, m_i-1]`?**
   - What we know: Congruence notation permits any integer `a_i`; the tool's teaching goal is clarity.
   - What's unclear: Whether allowing `a_i ≥ m_i` (and displaying its reduction) adds pedagogical value or just adds a corner case to validate.
   - Recommendation: Constrain the input field to `[0, m_i-1]` for simplicity (matches how Cayley Table and Equivalence Wheel constrain their modular inputs), unless the planner has a specific reason to allow the general case.

3. **Nav/hub placement order for the new tool**
   - What we know: The current nav order (11 tools, `[VERIFIED: index.html:156-167]`) is Home, Sieve, Factor Tree, Venn Diagram, Euclidean Algorithm, Equivalence Wheel, Cayley Table, Square and Multiply, Diffie-Hellman, RSA, Fermat's Method, Shor's Algorithm — most recently fixed by quick task 260928-fdz.
   - What's unclear: CONTEXT.md doesn't specify where CRT slots into this order.
   - Recommendation: Insert immediately after "Euclidean Algorithm" and before "Equivalence Wheel," since CRT depends on and cross-links to the Euclidean Algorithm tool specifically (same adjacency logic quick task 260928-r1w used for Cayley Table ↔ Equivalence Wheel).

## Environment Availability

Skipped — this phase has no external tool/service/runtime dependency beyond a modern browser, which every other tool in this repo already assumes and which cannot be probed from this environment in a way that adds information (CLAUDE.md already documents the runtime target: "Modern web browsers (Chrome, Firefox, Safari, Edge)").

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | None — this repo has no test suite, no `package.json`, and no test files anywhere `[VERIFIED: repo search this session — find . -iname "*.test.*" -o -iname "*spec*" and find . -maxdepth 1 -iname "package.json" both returned nothing]` |
| Config file | none |
| Quick run command | Open the file directly in a browser: `open "Chinese Remainder Theorem/chinese-remainder-theorem.html"` (matches `CLAUDE.md`'s documented verification method) |
| Full suite command | Manually exercise: 2-congruence and 3-congruence modes, every preset (including the non-coprime one), the coprimality warning path, Play/Pause/Step/Instant on the scan, the Extended-Euclidean reveal toggle, the cross-link to Euclidean Algorithm (confirm `?ext=1` lands on the Bézout step), nav on all 12 pages, day/night toggle |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|--------------------|-------------|
| CRT-01 | Input 2 or 3 congruences `x ≡ a (mod m)` | manual-only | — (open file, type values in both modes) | N/A — no test infra by design |
| CRT-02 | Non-coprime moduli trigger a clear warning, not a wrong answer | manual-only | — (use the non-coprime preset, confirm `--role-warn` banner and no solve) | N/A |
| CRT-03 | Residue-class visualization with solution as intersection | manual-only | — (visually confirm each row's highlighted cells and the aligned solution column) | N/A |
| CRT-04 | Animated brute-force scan lands on the solution | manual-only | — (press Play, confirm scan advances and stops at the correct `x`) | N/A |
| CRT-05 | Reveal Extended-Euclidean construction as faster alternative | manual-only | — (toggle reveal, confirm `M_i`, `y_i`, and final sum match the scan's answer) | N/A |
| CRT-06 | Toggle between 2 and 3 congruences | manual-only | — (click toggle, confirm third row appears/disappears and re-solves) | N/A |
| CRT-07 | Preset examples including the classic riddle | manual-only | — (click each preset chip, confirm correct fill and solve) | N/A |
| CRT-08 | Navigate to GCD tool's modular-inverse step | manual-only | — (click cross-link, confirm `euclidean-algorithm.html` loads with Extended Euclidean mode already on) | N/A |

**Manual-only justification:** This repo has zero test infrastructure by explicit, repeated design choice (`CLAUDE.md`: "There is no build system, package manager, or test suite"). All eleven prior tool phases in this project were verified the same way (open in browser, exercise controls) — see `.planning/phases/05-cayley-table-generator/05-RESEARCH.md`'s identical justification for the immediately preceding phase.

### Sampling Rate
- **Per task commit:** Open the modified file in a browser and exercise the specific control just changed.
- **Per wave merge:** Full manual pass through all CRT-01–08 behaviors listed above.
- **Phase gate:** Full manual pass across both modes, all presets (including the non-coprime one), and the cross-link, before `/gsd-verify-work`.

### Wave 0 Gaps
None — no test infrastructure gap to fill, consistent with every prior phase in this repo.

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|----------------|---------|--------------------|
| V2 Authentication | No | No accounts/auth anywhere in this repo |
| V3 Session Management | No | No sessions; this tool needs no persisted state at all (D-08 explicitly rules out a shared store) |
| V4 Access Control | No | Fully public static page, no access boundaries |
| V5 Input Validation | Yes | Validate every `a_i`/`m_i` field the same way every existing tool does: regex-test the raw string (`^-?\d+$`, `Euclidean Algorithm/euclidean-algorithm.html:449` `[VERIFIED]`), `parseInt(..., 10)`, then range-check/clamp before use. Also validate the URL query params (`a`, `b`, and the new `ext`) the same defensive way `readABParams()` does (`Euclidean Algorithm/euclidean-algorithm.html:502-521` `[VERIFIED]`) — reject non-finite, negative, or malformed values rather than trusting the query string. |
| V6 Cryptography | No | No cryptographic operations in this tool (unlike RSA/Diffie-Hellman); this is a pure teaching visualization |

### Known Threat Patterns for this stack

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|-------------------------|
| Malformed/adversarial URL query params (`?a=`, `?b=`, `?ext=`) crashing the page or corrupting the deep-linked state | Tampering | Defensive regex + `isFinite`/range checks before use, exactly as `readABParams()` already does (`Euclidean Algorithm/euclidean-algorithm.html:502-521` `[VERIFIED]`); on any parse failure, fall back to the tool's own default state silently (no error thrown) |
| Unbounded moduli/`lcm` causing a client-side DoS (excessive DOM node creation for the residue strip) | Denial of Service | Enforce the modulus input cap (D-06 + Pitfall 5's recommendation) before calling any render function, mirroring the Sieve's `if (size > 20000) size = 20000;` clamp (`Sieve Of Eratosthenes/sieve-of-eratosthenes.html:754` `[VERIFIED]`) and Cayley Table's `MAX_N = 120` (`Cayley Table/cayley-table.html:341` `[VERIFIED]`) |
| `innerHTML` string-concatenation for equation/identity display (XSS if any interpolated value were ever attacker-controlled) | Tampering / Injection | Not a real risk here — every interpolated value is a computed integer (`a_i`, `m_i`, `x`, `lcm`), never raw user text, matching Euclidean Algorithm's identical `identityLine.innerHTML` pattern (`Euclidean Algorithm/euclidean-algorithm.html:561-570`); no change needed, but do not extend this pattern to any future free-text field without escaping |

## Sources

### Primary (HIGH confidence)
- `assets/palette.css` (read in full this session) — `--role-*` semantic token layer
- `Euclidean Algorithm/euclidean-algorithm.html` (read in full this session, 1111 lines) — playback controls, preset chips, extended-Euclidean recurrence, cross-link functions
- `Venn Diagram/venn-diagram.html` (relevant sections read this session, lines 1330-1630) — 2-vs-3 mode toggle, `readABParams`/`updateEuclidXref`
- `Sieve Of Eratosthenes/sieve-of-eratosthenes.html` (relevant sections read this session, lines 400-803) — CSS-Grid cell strip, `cellMinPx`, events-per-frame speed ramp
- `Cayley Table/cayley-table.html` (relevant sections read this session) — `cellMinPx(M)` shrink ladder, `MAX_N` ceiling reasoning, `.table-scroll` fallback, shared-group-params cross-link
- `Equivalence Wheel/equivalence-wheel.html` (relevant sections read this session) — `gcd()`, `clamp()` helpers
- `index.html` (relevant sections read this session) — nav header order, card structure
- `assets/site.css` (read in full this session) — shared nav/theme chrome
- `.planning/REQUIREMENTS.md`, `.planning/STATE.md`, `03-CONTEXT.md` (read in full this session)

### Secondary (MEDIUM confidence)
- [cp-algorithms.com — Chinese Remainder Theorem](https://cp-algorithms.com/algebra/chinese-remainder-theorem.html) — cross-checked this session via WebSearch; confirms the `x = Σ a_i·M_i·y_i mod M` construction formula matches CONTEXT.md D-04 exactly

### Tertiary (LOW confidence)
- None used as a basis for any claim in this document.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — zero new dependencies; every pattern verified by reading the actual source files this session
- Architecture: HIGH — every pattern cited has a verbatim, line-cited precedent in this repo
- Pitfalls: HIGH for the repo-specific corrections (Pitfalls 1, 2, 4 — all verified by direct file reads); MEDIUM for the CRT-domain-specific sizing recommendation (Pitfall 5, Assumption A2 — a reasoned recommendation, not a locked spec)

**Research date:** 2026-09-28
**Valid until:** 2026-10-28 (30 days — this is a stable internal-conventions domain; re-check sooner only if the repo's shared `assets/palette.css` role tokens or nav list change before planning happens)
