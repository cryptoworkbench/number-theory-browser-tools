# Pitfalls Research

**Domain:** Interactive browser-based math-education visualizations (number theory), single-file HTML tools with a shared site shell
**Researched:** 2026-09-23
**Confidence:** HIGH for implementation/CSS/architecture pitfalls (verified directly against this repo's code); MEDIUM for pedagogy pitfalls (grounded in known math-ed patterns, not user-tested against this project's actual learners)

## Critical Pitfalls

### Pitfall 1: Bare element selectors in a new tool's `<style>` block leak onto shared site chrome

**What goes wrong:**
A new tool's own `<style>` block defines a generic element selector — `a{...}`, `nav{...}`, `input{...}`, `label{...}`, `span{...}` — intending to style something inside its own page body. Because `<link rel="stylesheet" href="../assets/site.css">` loads *before* the page's own `<style>` block in `<head>`, and both rules have identical specificity (element selector = specificity 0,0,1), the page's own rule wins the cascade and silently overrides `assets/site.css` wherever that element also appears inside `.site-header` — which is real markup on every page: `<a class="site-brand">`, five `<a class="site-nav-link">`, `<nav class="site-nav">`, `<label class="theme-switch">`, `<input type="checkbox" id="theme-switch-input">`.

**Why it happens:**
This is not hypothetical — it already happened once this session (`header{...}` leaking onto `<header class="site-header">`, most severely collapsing Pizza Slices' sticky nav to a 68-character column) and was fixed by scoping to `.page-header`. The *pattern* that caused it — page authors reaching for a bare tag selector because "there's only one of these on my page" — is still present today: `Christmas Trees` has `h1{...}`; four of five tools have `button{...}`; three have `footer{...}`; all have `body{...}`. None of those five currently collide with `.site-header`'s actual children (`a`, `nav`, `label`, `input`, `span`), but that's incidental, not enforced — nothing stops the next tool (or a palette-unification edit) from adding `a{ text-decoration: none }` or `input{ ... }` for its own controls.

**How to avoid:**
- Establish (and lint-by-convention, since there's no build step) a hard rule: every per-tool `<style>` block only ever qualifies selectors under a page-local root class (e.g. `.wrap a`, `.controls input`, `.wrap button`) — never a bare element selector at top level. Retroactively rewrite the five existing bare selectors (`h1`, `button`, `footer`, `body` is fine since `.site-header` isn't `<body>`) to scoped equivalents while doing the palette pass, since that CSS is being touched anyway.
- Add a one-line self-check to the tool-building and palette-unification workflows: `grep -nE '^\s*(a|nav|input|label|span|button|footer|h1|h2|h3|ul|li)\s*[,{]' tool.html` before considering a tool/edit done — any hit must be scoped or justified.
- Because `assets/site.css` loads before the page's own `<style>`, the safest structural fix is defensive: give every `.site-header` descendant selector in `assets/site.css` one extra class-level of specificity headroom is not necessary if the "no bare selectors in page styles" rule is followed — prefer the discipline over an specificity arms race.

**Warning signs:**
Visually: the sticky header's link color, spacing, underline, or the theme-toggle switch's appearance changes when navigating between tools (each tool should render an *identical* header). Textually: any grep hit from the check above on a page whose CSS was touched.

**Phase to address:** Both. New-tool-building phase (bake the scoping rule into how the 3 new tools are written) and palette-unification phase (audit + fix the existing bare selectors while every file's `<style>` block is being opened anyway).

---

### Pitfall 2: Naive palette unification deletes semantic/role color-coding that the diagrams rely on to teach

**What goes wrong:**
Three of the five existing tools don't use color purely decoratively — they use it as encoded meaning the learner is expected to read: RSA Examplifier has 25 references to `--bob`/`--alice`/`--eve`/`--dlp` distinguishing *who* holds which key/does which action in the narrative; Sieve of Eratosthenes has `--prime`/`--composite`/`--current`/`--one` distinguishing cell *state* in the algorithm; Christmas Trees distinguishes `--node-fill` (composite) from `--node-one-fill` (the terminal "1" node). If "unify the palette" is executed as "replace every tool's custom properties with one shared set of hex values," these role distinctions get flattened — e.g. Bob and Alice both become "the accent color," or prime and composite cells become visually indistinguishable — and the diagram stops teaching what it's supposed to teach.

**Why it happens:**
"Unify visual identity" reads as "one color scheme," but this codebase currently conflates two different jobs under one set of CSS variables per tool: (a) *site chrome / brand* colors (backgrounds, ink, borders, one UI accent) and (b) *pedagogical role* colors (which are meaningful per-diagram, not brand). Collapsing both into a single flat palette is the natural first instinct and the wrong one.

**How to avoid:**
- Split the unification into two tiers: (1) a shared *structural* palette (bg, ink/text, ink-soft, borders, panel, one site-wide accent for buttons/links/focus rings) that genuinely should be identical across all 8 tools, reusing the tokens already established in `assets/site.css` (`--st-header-*`) as the seed; (2) each tool keeps *derived* role colors that are generated from the shared palette via a consistent formula (e.g. fixed hue rotations off the shared accent, or a small fixed set of "role hues" reused across tools — role-1/role-2/role-3/danger/good) rather than being deleted. Bob/Alice/Eve, prime/composite/current, and pine/gold/node-one all become instances of the same small role-hue system instead of one-off bespoke colors — that *is* unification, just not palette-flattening.
- Before touching each file, list its color-coded distinctions (grep `var(--` usage in the SVG/render logic, not just CSS) so none get silently merged.

**Warning signs:** After a palette pass, any diagram where two previously-distinct elements (two actors, prime vs. composite, node vs. "1"-node) render the same or near-indistinguishable color in either theme.

**Phase to address:** Palette-unification phase. Verification: for each tool with role-coded elements (RSA, Sieve, Christmas Trees at minimum), screenshot both themes post-unification and confirm every previously-distinct role is still visually distinguishable (not just "different hex value" — actually distinguishable at a glance, including for common color-vision deficiencies if achievable).

---

### Pitfall 3: Dangling references to old CSS variable names after the palette rename (silent, no error)

**What goes wrong:**
The five tools currently use three *different* variable-naming conventions for the same concepts: Pizza Slices uses `--bg`/`--ink`/`--accent`; Christmas Trees uses `--page-bg`/`--page-text`; the other three use `--bg-1`/`--bg-2`/`--text`/`--text-dim`. A palette-unification pass will necessarily rename variables in at least 4 of 5 files. CSS custom properties fail *silently* when referenced but undefined — `var(--old-name)` with no fallback just resolves to nothing (effectively `unset`, often rendering as transparent, black, or inherited), producing no console error, no visual break in dev tools unless you specifically inspect computed styles. If even one `var(--page-text)` reference survives in Christmas Trees after `--page-text` is renamed to the unified token name, that element silently goes invisible/wrong-colored in both themes and is easy to miss in a spot-check.

**Why it happens:** Each file has 9–23 unique `var()` references (verified: Christmas Trees 23, RSA 20, Sieve 16, Completing-the-Square 12, Pizza Slices 9) spread across CSS rules *and* inline styles set from JS (SVG fill/stroke attributes often read a CSS var via `getComputedStyle` or hardcode a var reference in a template string) — it's easy to rename the `:root` declaration and miss a usage site, especially ones set dynamically from JavaScript rather than in the `<style>` block.

**How to avoid:** After renaming variables in a file, grep that file for every occurrence of the *old* variable name (`grep -n '\-\-page-bg\|--page-text' file.html`) and confirm zero hits remain, including inside `<script>` (JS often builds SVG attribute strings referencing `var(--x)`). Do this file-by-file immediately after each rename, not as a final batch check across all 8 files.

**Warning signs:** An element renders as black/transparent/browser-default in one or both themes after a palette edit; `getComputedStyle(el).getPropertyValue('--old-name')` returns empty string in devtools.

**Phase to address:** Palette-unification phase, as a mandatory step within each file's edit (not a separate cleanup pass).

---

### Pitfall 4: `color-mix()`-derived tints are load-bearing for contrast in 3 of 5 tools — don't drop or under-support them

**What goes wrong:**
`color-mix()` isn't a one-off RSA-only trick (as the existing codebase concerns doc undersells it) — it's used 20, 25, and 22 times respectively in RSA, Sieve, and Completing-the-Square, to derive hover states, subtle backgrounds, and glows *from* the theme's base colors, which is exactly why those tools' contrast holds up across both day and night themes without hand-tuning every derived shade separately. If palette unification reintroduces per-tool hardcoded tint colors instead of continuing this derive-from-base pattern (e.g. to "simplify" during the retrofit), contrast that currently self-adjusts per theme will need to be manually re-verified per tint, per theme, per tool — much more error-prone. Conversely, if new tools are written using `color-mix()` without checking actual target-browser support, or if it's used somewhere without a fallback and a learner is on an older Safari/iOS device, backgrounds/tints can render as fully transparent or wrong.

**Why it happens:** `color-mix()` is convenient and already proven in this codebase, but it's easy to either (a) abandon it during a "just replace the colors" palette edit because the mechanical find-replace doesn't preserve `color-mix()` call sites cleanly, or (b) extend its use without confirming it's safe for this project's actual audience (self-learners on arbitrary personal devices/browsers, not a controlled environment).

**How to avoid:** Treat `color-mix()`-derived tokens as part of the *pattern* being unified, not incidental CSS to flatten — carry the "derive tints from one base accent via `color-mix()`" approach into the shared palette itself (e.g. a shared `--accent` + `color-mix(in srgb, var(--accent) 10%, transparent)` convention reused by all 8 tools) rather than hardcoding 8 sets of pre-mixed hex tints. Confirm current baseline support (`color-mix()` has been Baseline-widely-available since 2023 in evergreen Chrome/Firefox/Safari) is acceptable for this project's "no build step, no framework, runs by opening the file" philosophy — no polyfill is realistic here, so if support is a concern the fallback is a plain semi-transparent `rgba()` value, not a fallback library.

**Warning signs:** A tint/hover/glow element renders as fully opaque or fully invisible instead of a soft blend; visual diff between "hardcoded hex tint" tools and "color-mix() derived" tools within the same unified site.

**Phase to address:** Palette-unification phase (design the shared token pattern to keep using `color-mix()`), new-tool-building phase (reuse the same pattern for the 3 new tools rather than inventing a fourth palette convention).

---

### Pitfall 5: Euclidean-algorithm-style visualizations scale animation cost with the *quotient*, not the *step count* — a new performance trap distinct from existing tools

**What goes wrong:**
The existing "large SVG + staggered `setTimeout`" performance concern (documented for Factor Tree, where cost scales with tree depth ≈ log₂(n)) gets a much worse cousin in the new Euclidean-algorithm/GCD tool if it uses the classic "repeated subtraction" or "rectangle tiling" geometric visualization: the natural node count for one step of `gcd(a,b)` in that visual metaphor is the *quotient* `⌊a/b⌋`, not the step count. `gcd(1, 999983)` (a prime) is a degenerate but plausible input where naive tiling would try to draw ~999,983 subtraction squares/tiles in a single step, freezing or crashing the tab — a much sharper cliff than anything in the existing five tools, none of which have a code path where user input multiplies animation cost this directly.

**Why it happens:** The division-based Euclidean algorithm (`gcd(a,b) = gcd(b, a mod b)`) is O(log n) steps and safe to animate, but the *pedagogically vivid* geometric visualization of "how many times does b go into a" naturally wants to render the quotient as repeated visual units, and quotients are unbounded by the step count.

**How to avoid:** Decide upfront (new-tool-building phase, before implementation) to cap the number of individually-rendered subtraction units per step (e.g. render at most ~12 tiles, then collapse to a single "×837" grouped/labeled unit) — same mitigation shape as the existing `MAX_ITER`/`MAX_N` caps in Completing-the-Square and Sieve, but must be designed in from the start here rather than retrofitted, since the failure mode is triggered by ordinary-looking inputs (any two numbers with a large quotient in an early step), not just extreme edge-case inputs.

**Warning signs:** Tab freezes or animation stutters severely on inputs like `gcd(2, 500000)` or `gcd(large prime, 1)` during manual testing.

**Phase to address:** New-tool-building phase (Euclidean/GCD tool specifically) — bake the cap into the initial design, not a post-hoc fix.

---

### Pitfall 6: CRT combined-modulus arithmetic overflows `Number` precision faster than any existing tool's inputs do

**What goes wrong:**
The existing "Number loses precision above 2^53" concern is currently contained because each existing tool caps a *single* input (Factor Tree at 10¹², Completing-the-Square at 10⁹) and computes on that one number. A Chinese Remainder Theorem tool inherently *multiplies* several user-chosen moduli together to get the working modulus M — even small, individually-reasonable moduli compound fast (four 4-digit coprime moduli already exceed 2^53; even three 3-digit primes like 997×991×983 ≈ 970 million is fine, but it takes only slightly larger or one more modulus to blow past safe-integer range). Because the moduli are chosen independently and each looks small/safe on its own, this overflow is easy to miss in testing with "reasonable-looking" example inputs, unlike Factor Tree's overflow which requires an obviously huge single input.

**Why it happens:** CRT's core operation (combining residues mod M via modular inverses) is multiplicative across N inputs, so precision risk grows combinatorially with the number/size of moduli, not linearly with a single input field — a fundamentally different risk shape than every existing tool in this repo except RSA (which already solved this with BigInt).

**How to avoid:** Follow the RSA tool's precedent, not the other four: implement the CRT tool's core arithmetic (modular inverse, combining step, final residue mod M) in `BigInt` from the start, even though inputs will typically be small — this sidesteps the whole overflow class rather than needing an ad-hoc cap that's hard to communicate ("why can't I pick 4 moduli?"). Decide this in the new-tool-building phase before writing the math helpers, since retrofitting Number→BigInt after the visualization is built means redoing every arithmetic call site.

**Warning signs:** CRT tool returns a wrong/impossible combined residue when moduli multiply past ~9×10¹⁵, with no error shown — silent wrong-answer, not a crash, which is the worst failure mode for an educational tool (it teaches the wrong thing convincingly).

**Phase to address:** New-tool-building phase (CRT tool), decided before implementation.

---

## Pedagogical Pitfalls (math-education specific)

### Pitfall 7: CRT tool that doesn't validate pairwise-coprime moduli produces a "correct-looking" but mathematically unjustified answer

**What goes wrong:** The classic Chinese Remainder Theorem guarantees a unique solution mod M *only* when the moduli are pairwise coprime. If the tool accepts arbitrary user-chosen moduli (e.g. 4 and 6, which aren't coprime) and still runs a combining algorithm, it will either silently produce a wrong answer, or produce *a* consistent-looking answer that happens to satisfy the inputs by luck — either way the learner isn't told the theorem's precondition failed, and walks away with a false mental model of when CRT applies.

**How to avoid:** Validate pairwise coprimality (`gcd(m_i, m_j) == 1` for all pairs) before running the combine step; when it fails, say so explicitly and explain why (rather than just disabling the "solve" button) — this is itself a teaching moment specific to CRT that the other four tools don't have an equivalent of.

**Phase to address:** New-tool-building phase (CRT tool) — validation and messaging designed alongside the happy-path visualization, not bolted on after.

---

### Pitfall 8: Continued-fraction visualization of irrational inputs silently implies termination or exact convergence due to float precision

**What goes wrong:** A continued-fraction tool that lets users type a decimal approximation of an irrational (√2, φ, π) and then iteratively extracts terms via floating-point arithmetic will, after roughly 15–17 iterations, hit `Number` precision limits and either terminate (looking like the continued fraction "ends," which is false for any irrational) or produce a spurious exact-match convergent. Because continued fractions are the one visualization in this milestone whose *entire pedagogical point* is "this process for irrationals never terminates and convergents approximate but never equal the target," silently terminating due to float noise directly undermines the concept being taught — a subtler and more damaging version of the general Number-precision concern already logged for this codebase, because here it corrupts the *lesson*, not just the numeric answer.

**How to avoid:** Cap iteration depth deliberately (e.g. 10–15 terms) and *label it as a deliberate truncation* ("shown to N terms — the process continues forever for irrational inputs") rather than letting float precision decide when to stop unlabeled. For rational inputs (typed as `p/q`, not decimal), use exact integer/BigInt arithmetic so the algorithm terminates *correctly* and finitely — meaning the tool likely needs two distinct input modes (exact fraction vs. decimal-approximated irrational) with different underlying arithmetic, not one code path.

**Phase to address:** New-tool-building phase (continued fractions tool) — the truncation-labeling and dual input-mode decision belongs in initial design, since it changes the data model (rational-exact vs. irrational-approximated), not just the visualization.

---

### Pitfall 9: Reusing a prior visual metaphor without adding the new concept's specific teaching payload

**What goes wrong:** Continued fractions and the Euclidean algorithm share the same underlying recursive division process, so it's tempting (and reasonable for visual consistency) to reuse the Euclidean-algorithm tool's rectangle-tiling/spiral diagram wholesale for continued fractions. But continued fractions add a specific payload the Euclidean visualization doesn't need to show: the sequence of *convergents* (p_k/q_k) and how each one's error shrinks — that's the actual "why continued fractions matter" content. A continued-fraction tool that only shows the Euclidean-style step-by-step division animation (identical in spirit to the GCD tool) without also surfacing convergents and their approximation error is technically not wrong, but pedagogically redundant with the GCD tool and misses the point of the CF tool existing as a separate concept.

**How to avoid:** Explicitly design a "convergents" sub-view (a running table or plotted list of p_k/q_k with |x − p_k/q_k| shown numerically or as a shrinking error bar) as a first-class part of the tool, not an afterthought — decide this before implementation so it isn't dropped for time.

**Phase to address:** New-tool-building phase (continued fractions tool).

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|--------------------|-----------------|------------------|
| Flatten palette to one hex set instead of shared-structural + derived-role tiers (Pitfall 2) | Faster palette pass, fewer variables to manage | Diagrams lose teaching-relevant color distinctions; requires a second unification pass later to re-differentiate roles | Never — this is the one shortcut this milestone should not take, since "unify identity" was explicitly chosen by the user knowing role colors exist |
| Skip pairwise-coprimality / precondition validation in CRT to ship faster | Simpler happy-path code | Tool teaches CRT's applicability incorrectly; silent wrong answers for a subset of valid-looking inputs | Only acceptable as a documented "known gap" if validation is deferred to a fast-follow phase, never as permanent |
| Use `Number` instead of `BigInt` for CRT combining step | Simpler arithmetic, matches 4 of 5 existing tools' pattern | Silent overflow well within plausible user inputs (Pitfall 6) — worse than the existing tools' overflow risk because it's harder to predict from the UI | Never for CRT specifically; acceptable for GCD/continued-fractions single-value display since those inputs are naturally smaller and bounded the same way existing tools already are |
| Reuse Euclidean-algorithm tiling visual for continued fractions without adding a convergents view (Pitfall 9) | Ships faster, reuses code | Tool feels redundant with the GCD tool; misses the CF-specific teaching point | Acceptable only as an MVP first pass if a convergents view is explicitly planned as a fast-follow within the same phase, not deferred indefinitely |

## Integration Gotchas

This project has no external service integrations (no API, no CDN beyond Google Fonts, no backend) — standard "integration gotchas" don't apply. The closest analog is the shared-asset "integration" between each tool page and `assets/site.css`/`assets/theme.js`:

| Integration | Common Mistake | Correct Approach |
|-------------|-----------------|-------------------|
| Page `<style>` block vs. `assets/site.css` | Assuming page styles are isolated from shared chrome because they're "in a different file/block" — they aren't; same cascade, page styles load later and win ties (Pitfall 1) | Scope every page-local selector under a page-root class; never use bare element selectors at top level |
| New tool's nav entry vs. `index.html` + all other tools' `.site-nav` lists | Adding the new tool's link to `index.html` but forgetting to add it to the other 7 tools' (5 existing + 2 other new) hardcoded nav lists, or vice versa | After adding each new tool, diff the `.site-nav` block across all 8 tool files + `index.html` to confirm all 8 entries and the correct `is-active` class are present everywhere (this is a pre-existing documented concern in CONCERNS.md that gets proportionally worse going from 5 to 8 files) |

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|-----------------|
| Quotient-scaled tile rendering in Euclidean/GCD visualization (Pitfall 5) | Tab freezes/stutters on ordinary-looking inputs like `gcd(2, 500000)` | Cap rendered units per step, collapse excess into a labeled group | Any input pair with a large quotient in an early step — much lower threshold than existing tools' overflow points |
| `setTimeout`-staggered depth/step reveal (existing pattern, documented in CONCERNS.md for Factor Tree) reused for CRT's multi-ring overlay or CF's convergent-by-convergent reveal | Animation stutters, browser event loop stalls on deep/long sequences | Prefer `requestAnimationFrame`-driven reveal over fixed `setTimeout` delays for any new tool's staggered animation; cap the number of simultaneously-animated elements | Deep GCD step chains, CRT with 3+ moduli overlaid, CF with many convergent terms shown at once |
| CRT overlaying 3+ congruence "wheels" (reusing Pizza Slices' ring/wedge visual language) | Diagram becomes visually cluttered/illegible well before it becomes computationally slow | Cap the number of simultaneously-displayed moduli in the primary view (e.g. 2–3), offer additional moduli as a list/table rather than more overlaid rings | Roughly 3+ overlaid rings, well before any performance ceiling is hit — this is a legibility trap, not a compute trap |

## Security Mistakes

This project has no user accounts, no server, no untrusted-input execution surface beyond arithmetic on numbers a user types into their own browser tab — general web security concerns (XSS, auth, injection) are largely inapplicable. The one relevant item is already tracked in CONCERNS.md:

| Mistake | Risk | Prevention |
|---------|------|------------|
| Using `innerHTML` with template-literal-interpolated values for the new tools' result displays (moduli, remainders, convergent fractions like `p/q`) | Currently safe everywhere it's used (values are numeric/`toLocaleString()`), but the pattern itself doesn't distinguish safe from unsafe interpolation — a future edit that interpolates a raw user-typed string (e.g. an error message echoing invalid input verbatim) could introduce real XSS | Keep interpolating only numeric/computed values via `innerHTML`; if any new tool ever needs to echo a raw user-typed string back into the DOM, use `textContent` for that piece instead of `innerHTML`, and keep the existing convention of commenting `/* Safe: numeric, not user input */` near each `innerHTML` call site in new tools too |

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-------------------|
| CRT tool shows only a brute-force "search 0..M-1 and check" reveal, never the constructive algorithm (modular inverses) | Learner concludes CRT *is* brute-force search, missing that the theorem gives a direct construction — undersells why CRT matters computationally (this is a specific instance of Pitfall 9's "technically correct, pedagogically shallow" pattern) | Show both: brute-force check as an intuitive "here's the unique answer, verified" opening, then the constructive combine-via-inverses steps as the "how it's actually computed" — mirrors how RSA Examplifier already narrates both the working path and Eve's brute-force attack as distinct, labeled things |
| New tools silently cap inputs (e.g. max moduli, max CF terms, max GCD magnitude) without telling the user why | User assumes the tool is broken or the input was rejected for no reason when it's actually a deliberate performance/precision guard | Every input cap introduced per Pitfalls 5/6/8 should have a visible, specific message near the input (matches the existing pattern of range-checked inputs in Factor Tree/Completing-the-Square, but CONCERNS.md notes those caps aren't consistently surfaced in the UI today — don't repeat that gap in the 3 new tools) |

## "Looks Done But Isn't" Checklist

- [ ] **Palette unification:** Looks done when all 8 tools *visually* share colors, but check whether every tool's role-coded elements (RSA actors, Sieve cell states, tree node-vs-terminal) are still distinguishable in *both* themes, not just "using the new palette."
- [ ] **New tool CSS:** Looks done when the tool renders correctly on its own page — verify by clicking through to every *other* tool afterward and confirming the shared header still renders identically (catches Pitfall 1 leaks that only show up on other pages, not the page you were editing).
- [ ] **CRT tool:** Looks done when it solves the textbook example correctly — verify with non-coprime moduli input (should reject/explain, not silently answer) and with moduli whose product exceeds 2^53 (should still be exact, via BigInt).
- [ ] **Continued fractions tool:** Looks done when it shows terms for √2 or π — verify it's explicitly labeled as truncated for irrational inputs (not implying termination), and that rational (`p/q`) input mode terminates exactly rather than via float-precision happenstance.
- [ ] **Euclidean/GCD tool:** Looks done when small example inputs animate smoothly — verify with a deliberately large-quotient input (e.g. `gcd(2, 500000)`) to confirm the tile-count cap actually engages rather than just being smooth by luck of the demo inputs chosen.
- [ ] **Site nav across all 8 tools:** Looks done when the 3 new tools link correctly from `index.html` — verify every one of the 8 tool pages' own `.site-nav` block lists all 8 tools with the correct `is-active` class, not just that `index.html` was updated.

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|----------------|------------------|
| Bare-selector CSS leak onto shared header (Pitfall 1) | LOW | Same fix as the already-resolved `header{}` case: identify the colliding bare selector, rescope it under a page-root class, verify visually across all tool pages |
| Flattened role colors post-palette-unification (Pitfall 2) | MEDIUM | Re-derive role colors from the shared accent using the hue-rotation/role-hue convention retroactively per affected tool; requires re-checking distinguishability in both themes again |
| Dangling old-variable-name references (Pitfall 3) | LOW | Grep the affected file for the old variable name, fix each hit; no data/logic impact, purely cosmetic once found |
| CRT `Number` overflow discovered post-ship (Pitfall 6) | HIGH | Requires converting the combining/modular-inverse arithmetic to `BigInt` after the fact, which likely touches every place a moduli/remainder value flows through the visualization layer — this is exactly why it should be decided upfront instead |
| Continued-fraction float-precision mislabeling (Pitfall 8) | MEDIUM | Add explicit truncation labeling and split input modes (exact rational vs. approximated irrational) after the fact — doable without a full rewrite, but touches the core data model |

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|--------------------|----------------|
| Bare-selector CSS leak (1) | Both: new-tool-building phase (write new CSS scoped from the start) and palette-unification phase (audit + fix existing bare selectors) | Grep check for bare top-level element selectors in every touched `<style>` block; click through all 8 pages confirming identical header rendering |
| Palette flattening destroys role color-coding (2) | Palette-unification phase | Screenshot every role-coded tool (RSA, Sieve, Christmas Trees) in both themes; confirm each previously-distinct role remains visually distinguishable |
| Dangling old CSS variable references (3) | Palette-unification phase | Grep each edited file for its old variable names immediately after renaming, before moving to the next file |
| Dropping/mishandling `color-mix()` tint pattern (4) | Palette-unification phase (design shared token pattern) + new-tool-building phase (reuse it for 3 new tools) | Visual check that hover/tint/glow states render as soft blends, not opaque or invisible, in both themes across all 8 tools |
| Quotient-scaled tile rendering blowup (5) | New-tool-building phase (Euclidean/GCD tool) | Manually test a large-quotient input pair (e.g. `gcd(2, 500000)`) before considering the tool done |
| CRT `Number` overflow on combined modulus (6) | New-tool-building phase (CRT tool), decided before writing math helpers | Test with 4+ moduli whose product exceeds 2^53; confirm exact result via BigInt |
| CRT accepts non-coprime moduli silently (7) | New-tool-building phase (CRT tool) | Test with a known non-coprime pair (e.g. 4 and 6); confirm explicit rejection/explanation, not a silent answer |
| CF float-precision implies termination for irrationals (8) | New-tool-building phase (continued fractions tool), decided before implementation | Test with √2/π-style input; confirm explicit truncation labeling and no spurious exact-match convergent |
| CF tool redundant with GCD tool, missing convergents view (9) | New-tool-building phase (continued fractions tool) | Confirm a convergents/error view exists distinct from the step-by-step division animation |
| Nav list drift across 8 files | New-tool-building phase, each time a tool is added | Diff `.site-nav` block content across all 8 tool files + `index.html` |

## Sources

- Direct inspection of this repository's code: `assets/site.css`, `assets/theme.js`, `index.html`, and the `<style>`/`<script>` blocks of all five existing tools (grep counts for `var()` usage, `color-mix()` usage, bare element selectors, and site-header markup structure were verified directly, not assumed).
- `.planning/codebase/CONCERNS.md` — existing documented concerns (Number precision limits, input validation gaps, relative path fragility, animation/performance patterns, SVG accessibility gaps) extended here to the specific new-tool and palette-unification context.
- `.planning/PROJECT.md` — milestone scope and the already-fixed `.page-header` CSS-scoping incident that motivates Pitfall 1.
- General math-education visualization patterns (convergents/error visualization for continued fractions, coprimality preconditions for CRT, subtraction-vs-division framing for Euclidean algorithm) — domain knowledge, not sourced from a specific external post-mortem; flagged MEDIUM confidence accordingly.

---
*Pitfalls research for: interactive browser-based number-theory visualizations (Number Theory & Abstract Algebra Browser Tools)*
*Researched: 2026-09-23*
