---
quick_id: 260926-mbm
phase: quick-260926-mbm
plan: 01
type: execute
wave: 2
depends_on: ["260926-mbl"]
files_modified:
  - "Venn Diagrams/venn-diagrams.html"
autonomous: true
requirements: ["260926-mbm"]

estimate:
  tokens: 34000
  raw_tokens: 34000
  tasks: 2
  confidence: low

must_haves:
  truths:
    - "The prime picker offers 26 chips covering every prime from 2 through 101, including the 14 newly added ones (41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97, 101)."
    - "Any newly added prime can be armed from the picker and placed into a region in both two-circle and three-circle mode."
    - "A three-digit prime label renders fully inside its picker chip and inside its placed token in both modes (no clipping, no overflow)."
    - "Region products and the intersection/GCD readouts compute and display correctly when a newly added prime is in play."
    - "A saved layout containing a newly added prime survives a page reload (restore validation accepts it)."
  artifacts:
    - "Venn Diagrams/venn-diagrams.html — palette size argument raised so the generated palette ends at 101"
  key_links:
    - "PRIMES <- buildPalette(<count>) -> renderPicker() loop (must stay length-derived, never a hardcoded chip count)"
    - "placed prime -> productOf / gcd / factorize -> product + intersection panel text"
    - "persisted region arrays -> isPrime() validation in restore()/restore3() (accepts every palette member)"
---

<objective>
Extend the Venn Diagram tool's prime palette from its current 12 entries to 26 entries by adding the next 14 primes after the former upper bound: 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97, 101. Then prove that every place deriving UI, geometry, or math from the palette still behaves correctly with a longer palette whose largest labels are three digits wide for the first time.

Purpose: learners currently cannot build factorizations past the low primes, which caps the interesting GCD/intersection examples the tool can demonstrate.
Output: `Venn Diagrams/venn-diagrams.html` with a 26-prime palette and verified length-derived UI.

**Scope discipline — read before editing:**
- Touch ONLY the prime palette and anything genuinely coupled to its length or label width. Do NOT rename the tool, its headings, its page title, its nav entries, or any internal identifier — sibling batch item 260926-mbl owns all naming work in this same file.
- `depends_on: ["260926-mbl"]` is an **ordering constraint only** (both items edit the same file and this run has `use_worktrees: false`), not a logical dependency. Nothing in this plan consumes 260926-mbl's output.
- Do NOT raise `MAX_PER_REGION` / `MAX_PER_REGION3`; those caps are per-region occupancy limits, independent of palette length, and are not in scope.
- Numeric precision of very large region products is a pre-existing property of this tool (`productOf` uses `Number`, and the existing palette already allows products beyond `Number.MAX_SAFE_INTEGER`). Do NOT convert the math to `BigInt` or reformat product output as part of this change.

**Prior investigation already done (do not re-derive):**
- The palette is generated, not literal: `var PRIMES = buildPalette(12);` (one call site, around line 486). `buildPalette(count)` walks integers through the local `isPrime()` and collects the first `count` primes, so raising the argument to 26 yields exactly `2 … 101` — the 26th prime is 101 and the 14 requested primes are precisely primes 13 through 26.
- There is **no** per-prime color mapping and **no** separate legend. Colors come from region roles (`--role-input`, `--role-alt`, `--role-special`), never from a prime index; the picker chips ARE the legend. Do not invent a per-prime color scheme.
- The only palette-length consumer is the `renderPicker()` loop, which already iterates `PRIMES.length` into a `flex-wrap` container. No hardcoded chip count, row count, or grid column count exists.
- `restore()` / `restore3()` validate stored values with `isPrime()`, not palette membership, so no localStorage migration is needed.
- `factorize()` is bounded by `FACTOR_LIMIT = 100000`, which comfortably covers trial division for every new palette member.
</objective>

<execution_context>
@~/.claude/gsd-core/workflows/execute-plan.md
</execution_context>

<context>
@CLAUDE.md
@.claude/CLAUDE.md
@Venn Diagrams/venn-diagrams.html
</context>

<tasks>

<task type="tracer" tdd="true">
  <name>Task 1: Extend the generated palette to 26 primes (2 through 101)</name>
  <files>Venn Diagrams/venn-diagrams.html</files>
  <behavior>
    The assertion script in `<verify>` is the test for this task. Run it BEFORE editing to observe the failing state (it currently reports the effective palette ending at the old upper bound), then make the change and run it again.
    - The effective palette (obtained by evaluating the file's own `isPrime` + `buildPalette` with the file's own call argument) equals exactly: 2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97, 101.
    - `isPrime(101)` returns true, so a restored layout containing 101 passes `isValidStoredRegion`.
    - `productOf([2, 101])` returns 202, so a region holding a new prime multiplies out correctly.
    - `factorize(202)` returns 2 and 101, so the intersection readout can still expand a GCD built from a new prime.
    - `gcd(202, 303)` returns 101, so a new prime shared between two circles surfaces as the intersection value.
  </behavior>
  <action>
    In `Venn Diagrams/venn-diagrams.html`, change the single `buildPalette` call site that initializes `PRIMES` so it requests 26 primes instead of 12: the line becomes `var PRIMES = buildPalette(26);`.

    Change nothing else in this task. Do not replace the generator with a literal array — `buildPalette` plus the local `isPrime` already produce the exact requested sequence, and keeping it generated is what makes the count the single source of truth.

    Do not edit `buildPalette`, `isPrime`, `productOf`, `gcd`, `factorize`, `FACTOR_LIMIT`, or any region cap.
  </action>
  <verify>
    <automated>cd "$(git rev-parse --show-toplevel)" && node -e 'const fs=require("fs");const F="Venn Diagrams/venn-diagrams.html";const src=fs.readFileSync(F,"utf8");const grab=(s)=>{const i=src.indexOf(s);if(i<0)throw new Error("missing "+s);return src.slice(i,src.indexOf("\n  }",i)+4)};const lim=src.match(/var FACTOR_LIMIT = (\d+);/);if(!lim)throw new Error("FACTOR_LIMIT not found");const env=grab("function isPrime(n){")+grab("function buildPalette(count){")+grab("function productOf(list){")+grab("function gcd(a, b){")+"var FACTOR_LIMIT = "+lim[1]+";"+grab("function factorize(n){");const api=new Function(env+"return {isPrime:isPrime,buildPalette:buildPalette,productOf:productOf,gcd:gcd,factorize:factorize};")();const eq=(a,b,w)=>{if(String(a)!==String(b))throw new Error(w+" -> got "+a+" want "+b)};eq(api.isPrime(101),true,"isPrime(101)");eq(api.productOf([2,101]),202,"productOf([2,101])");eq(api.factorize(202).join("*"),"2*101","factorize(202)");eq(api.gcd(202,303),101,"gcd(202,303)");console.log("PASS: three-digit palette primes flow through placement/product/gcd/factor display");const m=src.match(/var PRIMES = buildPalette\((\d+)\)/);if(!m)throw new Error("PRIMES assignment not found");const got=api.buildPalette(Number(m[1]));const want=[2,3,5,7,11,13,17,19,23,29,31,37,41,43,47,53,59,61,67,71,73,79,83,89,97,101];eq(got.join(","),want.join(","),"effective palette");console.log("PASS: palette = 26 primes, 2..101");'</automated>
  </verify>
  <done>The assertion script exits 0, printing both PASS lines. Exactly one `buildPalette` call site exists and it requests 26.</done>
</task>

<task type="auto">
  <name>Task 2: Confirm and harden every palette-length and label-width consumer</name>
  <files>Venn Diagrams/venn-diagrams.html</files>
  <action>
    Audit the tool for anything that assumed the old, shorter, all-two-digit palette, and fix only what is actually broken. Investigation says no code change should be required here — the expected outcome of this task is a clean audit plus the automated gates below wired as regression guards. If an assumption IS found, fix it in the minimal length-agnostic way.

    Check each of these and record the result in the summary:
    1. `renderPicker()` must keep deriving its chip count from `PRIMES.length`. If any literal count, row count, or column count governs the picker, replace it with the length-derived form.
    2. The picker container must keep wrapping (`flex-wrap`) so 26 chips reflow instead of overflowing; confirm no fixed height or column template clips the second row, at desktop width and at the narrow breakpoint where chips grow.
    3. Three-digit labels are new to this tool. Confirm the picker chip box, the two-circle placed-token rect, and the three-circle compact token rect are each wide enough for a three-character monospace label. Only if a box is too small, widen it (and the paired text centering offset) — otherwise change nothing.
    4. `regionAriaLabel` / `regionAriaLabel3` build their text by joining region contents, so they need no change; confirm no aria string hardcodes a palette bound.
    5. Confirm no user-facing copy states how many primes the palette holds or names its largest member, so the lede and picker hint stay accurate with the longer palette. Rewrite any such sentence to be count-agnostic rather than restating a new bound.

    Keep the diff scoped to the palette concern. Do not touch naming, region caps, or product formatting.
  </action>
  <verify>
    <automated>cd "$(git rev-parse --show-toplevel)" && node -e 'const fs=require("fs");const F="Venn Diagrams/venn-diagrams.html";const src=fs.readFileSync(F,"utf8");const blk=(s)=>{const i=src.indexOf(s);if(i<0)throw new Error("missing "+s);return src.slice(i,src.indexOf("}",i))};const num=(t,k)=>{const m=t.match(new RegExp(k+"\\s*:\\s*([0-9.]+)"));if(!m)throw new Error("no "+k);return Number(m[1])};const seg=(a,b)=>{const i=src.indexOf(a),j=src.indexOf(b);if(i<0||j<0)throw new Error("missing "+a);return src.slice(i,j)};const rectW=(t)=>{const m=t.match(/svgEl\(.rect.,\s*\{[^}]*width:\s*(\d+)/);if(!m)throw new Error("no rect width");return Number(m[1])};const chip=blk(".prime-chip{");const cases=[["picker chip",num(chip,"font-size"),num(chip,"width")],["two-circle token",num(blk(".placed-chip text{"),"font-size"),rectW(seg("function renderTokens(){","function ascendingSort"))],["three-circle token",num(blk(".placed-chip.chip-compact text{"),"font-size"),rectW(seg("function renderTokens3(){","function renderProducts3"))]];const digits=3,ADV=0.6;for(const c of cases){const need=digits*c[1]*ADV+6;if(need>c[2])throw new Error(c[0]+": "+digits+"-digit label needs ~"+need.toFixed(1)+"px but box is "+c[2]+"px");console.log("PASS "+c[0]+": needs ~"+need.toFixed(1)+"px, box "+c[2]+"px");}if(!/flex-wrap\s*:\s*wrap/.test(blk(".prime-picker{")))throw new Error("picker no longer wraps");console.log("PASS picker wraps");' && test "$(grep -c 'i < PRIMES.length' 'Venn Diagrams/venn-diagrams.html')" = "1" && test "$(grep -c 'buildPalette(' 'Venn Diagrams/venn-diagrams.html')" = "2" && ! grep -inE 'twelve primes|12 primes|up to 37|through 37|first twelve|largest prime is' 'Venn Diagrams/venn-diagrams.html' && echo "PASS: picker count is length-derived, one generator + one call site, no stale palette-size copy"</automated>
    <human-check>Open `Venn Diagrams/venn-diagrams.html` in a browser. In the picker, confirm all 26 chips are visible and wrap onto additional rows with nothing clipped or cut off at the panel edge. Click 101, place it in the A ∩ B region, and confirm the token shows "101" fully inside its rounded box and that the product row reads A ∩ B with 101 as a factor. Switch to Three circles, place 97 in the centre region, and confirm the compact token shows "97" and the A ∩ B ∩ C readout picks it up. Reload the page and confirm both placements are restored. Narrow the window below the mobile breakpoint and confirm the picker still wraps cleanly with larger chips.</human-check>
  </verify>
  <done>The geometry/wrap script exits 0 printing four PASS lines, the picker chip count is proven length-derived with exactly one generator plus one call site, no copy states a palette size or bound, and the human check confirms 26 chips plus a three-digit token rendering cleanly in both modes.</done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| localStorage -> page | Previously persisted region contents are re-read on load (pre-existing boundary, unchanged by this plan) |

## STRIDE Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation Plan |
|-----------|----------|-----------|----------|-------------|-----------------|
| T-mbm-01 | Tampering | `restore()` / `restore3()` reading `venn-diagrams` localStorage keys | low | accept | No new attack surface introduced. This change only raises a count passed to an existing pure integer generator; it adds no input handling, no network or DOM sink, and no new persisted field. Existing validation (`Array.isArray`, length cap, `isPrime()` per entry) is untouched and still rejects malformed or non-prime stored values, and all rendering of prime values goes through `textContent` / SVG text nodes, never `innerHTML` with user data. |

No installs, no dependencies, and no external service are involved, so the package-legitimacy gate does not apply to this plan.
</threat_model>

<verification>
1. Task 1 assertion script exits 0 (effective palette is exactly the 26 primes 2 through 101, and a three-digit prime flows through the product/GCD/factor path).
2. Task 2 geometry + derivation script exits 0 (three-digit labels fit all three chip boxes, picker still wraps, chip count length-derived, one generator plus one call site, no stale palette-size copy).
3. Human check confirms the visual result in both two-circle and three-circle modes plus the mobile breakpoint.
4. `git diff` is confined to `Venn Diagrams/venn-diagrams.html` and contains no naming, region-cap, or product-formatting changes.
</verification>

<success_criteria>
- The picker offers all 26 primes from 2 through 101, including 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97 and 101.
- Any new prime can be placed and removed in both modes, and its product / intersection readouts are correct.
- Three-digit labels render fully inside picker chips and placed tokens in both modes.
- A layout containing a new prime survives reload.
- No naming change, no region-cap change, no product-format change, no new dependency.
</success_criteria>

<output>
Create `.planning/quick/260926-mbm-in-the-venn-diagram-tool-extend-the-palette-of-primes-which/260926-mbm-SUMMARY.md` when done, recording the Task 2 audit results (which consumers were checked and whether any required a fix).
</output>
