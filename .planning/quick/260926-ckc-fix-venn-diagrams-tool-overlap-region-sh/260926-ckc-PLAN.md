---
phase: quick-260926-ckc
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - Venn Diagrams/venn-diagrams.html
autonomous: true
requirements: [QUICK-VENN-GCD-01]

estimate:
  tokens: 30000
  raw_tokens: 30000
  tasks: 2
  confidence: low

must_haves:
  truths:
    - "With no saved state (seed: left holds 2 and 3, overlap holds 5, right holds 7) the left product row reads exactly `Left = 2 * 3 (only) * 5 (shared) = 30` (D-01)"
    - "With the same seed state the right product row reads exactly `Right = 7 (only) * 5 (shared) = 35` (D-02)"
    - "With the same seed state the centre product row reads exactly `Overlap = GCD(30, 35) = 5` (D-03)"
    - "Emptying the overlap region drops the `(shared)` segment from both side rows entirely (no dangling asterisk): left 2,3 / right 7 / overlap empty renders `Left = 2 * 3 (only) = 6`, `Right = 7 (only) = 7`, `Overlap = GCD(6, 7) = 1` (D-01, D-02, D-03)"
    - "A side whose own-region is empty but which has shared primes shows only the shared segment: `Left = 5 (shared) = 5` (D-01)"
    - "All three regions empty renders `Left = (empty) = 1`, `Overlap = GCD(1, 1) = 1`, `Right = (empty) = 1` and no row breaks or disappears"
    - "The value in the centre row equals the Euclidean GCD of the two totals printed in the side rows, and equals the overlap region's own product whenever no prime is duplicated across the two outer regions (D-03)"
    - "The lede states that the two circles are two numbers and that the overlap is their GCD (D-04)"
    - "The SVG caption under the centre lens, every status message, and every aria-label still describe placement zones only, sourced from REGION_NAMES (D-05)"
    - "Placing by click, placing by drag-and-drop, keyboard placement, removing a placed chip, Clear all, the 8-per-region cap, and the localStorage round-trip all behave exactly as before this change (D-06)"
    - "Loading the page and interacting with it produces no console error"
  artifacts:
    - "Venn Diagrams/venn-diagrams.html"
  key_links:
    - "state.regions.{left,overlap,right} -> primesOf() -> formatSide(onlyList, sharedList) -> the three .product-value spans, assigned with textContent only (single render path)"
    - "formatSide's printed total and the two arguments of the GCD row both come from the same productOf() products, so the three rows can never disagree with each other (D-01, D-02, D-03)"
    - "REGION_NAMES stays the single source of truth for the three SVG captions, the status messages, and the region / placed-chip aria-labels (D-05); it is no longer the source of the product-row labels"
    - "The overlap region list is the single source for the `(shared)` segment of BOTH side rows -- one list, two consumers (D-01, D-02)"
---

<objective>
Reframe the Venn Diagram tool's three product rows around GCD: each circle is one whole number whose factorization is split across its own-only region and the shared overlap, and the overlap's product is the GCD of the two circle numbers.

Purpose: The tool currently treats all three regions as independent buckets (`left only = 2 * 3 = 6`, `middle only = 5 = 5`, `right only = 7 = 7`), which teaches the wrong idea. A Venn diagram of prime factorizations means the LEFT CIRCLE is a number (left-only primes times shared primes) and the RIGHT CIRCLE is a number (right-only primes times shared primes), and the lens between them is exactly their GCD. The user has locked the fix as a two-part display (D-01, D-02), an explicit `GCD(...)` label on the centre row (D-03), and a reworded lede (D-04).
Output: One edited file -- `Venn Diagrams/venn-diagrams.html` -- with two new pure helpers (`gcd`, `formatSide`), a rewritten `renderProducts()`, a centre-region placement name that no longer says "only", and a GCD-framed lede.
</objective>

<execution_context>
@~/.claude/gsd-core/workflows/execute-plan.md
@~/.claude/gsd-core/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@CLAUDE.md
@.claude/CLAUDE.md
@Venn Diagrams/venn-diagrams.html
</context>

<user_decisions>

Locked decisions, taken verbatim from the task description. Every one must be satisfied.

| ID | Decision |
|----|----------|
| D-01 | The left circle's product row shows a two-part breakdown -- the left-only factors and the shared (overlap) factors as distinct parts of one product line -- plus the combined total. Shape: `Left = 2 * 3 (only) * 5 (shared) = 30`. |
| D-02 | The right circle's product row: same two-part breakdown, using the right-only factors and the same shared factors. Shape: `Right = 7 (only) * 5 (shared) = 35`. |
| D-03 | The middle/overlap row is relabelled to state explicitly that it is the GCD, using the actual computed left and right totals: `Overlap = GCD(30, 35) = 5`. |
| D-04 | The lede paragraph is rewritten to carry the GCD framing: the left/right circles are two numbers and the overlap is their GCD. |
| D-05 | Region names used for the visual captions and the aria-labels stay literal placement descriptions (they describe where a chip sits, not the mathematics). The GCD framing lives in the product-row text and the lede. |
| D-06 | The visual regions and the drag / click-to-place interaction stay exactly as-is -- only labels, text, and the product-row computation and display change. Do not change `MAX_PER_REGION`, the localStorage format or `STORAGE_KEY`, or the picker mechanics. |
| D-07 | Build on the existing data model and existing helpers (`productOf(list)`, `formatProduct(list)`, `primesOf(region)`; region entries are `{id, p}`). This is a display / labelling fix, not a data-model rewrite. |

</user_decisions>

<coverage_audit>

There is no ROADMAP goal, REQUIREMENTS.md entry, RESEARCH.md, or CONTEXT.md for a quick task; the task description is the whole source. Audit of that source:

| Source item | Covered by | Status |
|-------------|-----------|--------|
| D-01 left two-part row | Task 1 (`formatSide` + `renderProducts`) | COVERED |
| D-02 right two-part row | Task 1 (same helper, second consumer) | COVERED |
| D-03 centre row GCD framing | Task 1 (`gcd` + centre row assignment) | COVERED |
| D-04 lede rewrite | Task 2 | COVERED |
| D-05 placement-only region names / aria-labels | Task 2 (centre name stops claiming "only"; left and right untouched) | COVERED |
| D-06 interaction, cap, storage, picker untouched | `<scope_notes>` do-not-touch table + Task 1 and Task 2 verify gates | COVERED |
| D-07 reuse existing helpers, no data-model rewrite | Task 1 (`productOf` and `primesOf` reused; `state.regions` shape untouched) | COVERED -- see the note on the single-list formatter below |
| Verification step 1 (side rows correct) | Task 1 automated gates (node unit gate + headless DOM gate) | COVERED |
| Verification step 2 (GCD framing, Euclid, hand sanity check) | Task 1 node gate (Euclid cases) + Task 1 human-check | COVERED |
| Verification step 3 (no console errors) | Task 2 automated console gate (proven to catch a real error during planning) | COVERED |
| Verification step 4 (lede reads correctly) | Task 2 automated DOM grep + human-check | COVERED |

No unplanned items. No phase split needed.

**D-07 reuse note (transparency, not a scope reduction):** `productOf(list)` and `primesOf(list)` are reused unchanged. `formatProduct(list)` cannot be reused for a two-part line -- it embeds its own ` = ` and its own single total, so it can only ever render one factor list as a complete line. It is fully superseded by `formatSide(onlyList, sharedList)` and is therefore removed rather than left in the file as an uncalled function. The data model (`state.regions` holding `{id, p}` entries per region) is not touched at all.

</coverage_audit>

<scope_notes>

**In scope:** the three product rows' computation and text, the centre region's placement name, the lede paragraph. Nothing else.

**Explicitly out of scope -- do not touch (D-06):**

| Thing | Why it stays |
|-------|--------------|
| `state.regions` shape, `{id, p}` entries, `state.nextId`, `state.armed` | Data model. D-07 pins this as a display fix. |
| `MAX_PER_REGION`, `STORAGE_KEY`, `persist()`, `restore()`, `isValidStoredRegion()` | D-06 pins these. Already-saved payloads must keep round-tripping. |
| `renderPicker()`, `toggleArm()`, `placePrime()`, `removeToken()`, `clearAll()`, the drag / drop / keydown handlers in `createRegion()` | Interaction. D-06 pins these. |
| SVG geometry: `R`, `CY`, `CXA`, `CXB`, `XM`, `H`, `lensPath()`, `leftOnlyPath()`, `rightOnlyPath()`, `REGION_ANCHOR`, the token grid math in `renderTokens()` | Visual regions stay exactly as-is (D-06). |
| `REGION_NAMES.left` and `REGION_NAMES.right`, and all five call sites that read `REGION_NAMES` (`buildStatic()` captions, `regionAriaLabel()`, the full-region warning, the placed / removed status messages, the placed-chip aria-label) | D-05: these describe placement zones. The left and right values are already correct placement descriptions. |
| `isPrime()`, `buildPalette()`, the `PRIMES` palette, the 12-prime picker | Unrelated. |
| `.products-panel`, `.product-row`, `.product-value` CSS (sizing, spacing, flex, font-size, colors) | The longer two-part line is allowed to wrap inside its row; wrapping needs no CSS change. Matches the precedent set by the previous quick task on this file. **No CSS is edited by this plan at all.** |

**Colors:** this change is prose plus JS. Do not introduce any literal color (no hex, `rgb()`, `hsl()`, or named color) -- per `CLAUDE.md` every color in this repo is consumed via `var()` against `assets/palette.css`. Nothing here needs a color.

**Accepted limits (do not build guards for these):**

1. *Duplicate prime across both outer regions.* If the user puts the same prime in left-only AND right-only and leaves it out of the overlap, the true Euclidean GCD of the two totals is larger than the overlap region's own product. The centre row prints the honest Euclidean GCD of the two totals it displays, because that is what its label claims. The user called this case out and explicitly kept the per-region entry mechanics as-is (D-03, D-06), so no dedupe, no validation, and no warning is added.
2. *Very large products.* With the 8-per-region cap a side total can in principle exceed `Number.MAX_SAFE_INTEGER` (16 chips of 37). That needs deliberate chip-spamming, degrades only cosmetically, and throws nothing. Converting the tool to `BigInt` is out of scope for a display fix -- do not do it, and do not call `BigInt()` on a computed total (that would throw on a non-integer float and break the no-console-error criterion).

**Conventions to hold (from `CLAUDE.md` and `.claude/CLAUDE.md`):** everything stays inside the existing IIFE; `var` and `function` declarations in the file's existing style; 2-space indentation; camelCase function and variable names; pure number-theory helpers at the top of the script in the number-theory section; no new external dependency; no new CSS custom property; single self-contained file.

</scope_notes>

<tasks>

<task type="tracer">
  <name>Task 1: Compute and render the two-part side rows and the GCD centre row, end to end</name>

  <files>Venn Diagrams/venn-diagrams.html</files>

  <reversibility rating="reversible">Single-file, in-repo text change with an atomic commit; `git revert` restores the previous display in one step.</reversibility>

  <behavior>
    `formatSide(onlyList, sharedList)` -- pure, returns a string:
      - formatSide([2, 3], [5])  -> `2 * 3 (only) * 5 (shared) = 30`
      - formatSide([7], [5])     -> `7 (only) * 5 (shared) = 35`
      - formatSide([2, 3], [])   -> `2 * 3 (only) = 6`          (no dangling asterisk, no empty segment)
      - formatSide([], [5])      -> `5 (shared) = 5`            (no dangling asterisk)
      - formatSide([], [])       -> `(empty) = 1`

    `gcd(a, b)` -- pure Euclidean:
      - gcd(30, 35) -> 5 ; gcd(6, 7) -> 1 ; gcd(1, 1) -> 1 ; gcd(12, 18) -> 6 ; gcd(0, 5) -> 5 ; gcd(5, 0) -> 5

    Rendered rows, seed state (left 2 and 3, overlap 5, right 7):
      - left row   -> `Left = 2 * 3 (only) * 5 (shared) = 30`      (D-01)
      - centre row -> `Overlap = GCD(30, 35) = 5`                  (D-03)
      - right row  -> `Right = 7 (only) * 5 (shared) = 35`         (D-02)

    Rendered rows, overlap emptied (left 2 and 3, overlap empty, right 7):
      - `Left = 2 * 3 (only) = 6` / `Overlap = GCD(6, 7) = 1` / `Right = 7 (only) = 7`

    Rendered rows, everything empty:
      - `Left = (empty) = 1` / `Overlap = GCD(1, 1) = 1` / `Right = (empty) = 1`
  </behavior>

  <action>
Read `Venn Diagrams/venn-diagrams.html` in full first -- it is 653 lines and every edit below is a small local replacement. All three edits are in the inline `<script>`.

1. **Add two pure helpers in the number-theory section**, immediately after `productOf(list)` and inside the block that starts with the `/* ---------- number theory ---------- */` marker and ends at the `/* ---------- interaction ---------- */` marker. Both must be plain function declarations that depend on nothing outside that block (a verify gate slices that block out of the file and evaluates it standalone, so neither helper may reference the DOM, `state`, or any variable declared in the interaction section):
   - `gcd(a, b)` -- textbook Euclidean loop: take `Math.abs()` of both arguments, then while `b` is non-zero set `b` to `a % b` and `a` to the old `b`, and return `a`. It must return 5 for both argument orders of 0 and 5.
   - `formatSide(onlyList, sharedList)` -- builds one two-part product line (D-01, D-02) and takes no region key, no state, and no label. Build a list of segments: if `onlyList` is non-empty push its values joined by a space-asterisk-space separator followed by a space and the parenthesised word `only`; if `sharedList` is non-empty push its values joined the same way followed by a space and the parenthesised word `shared`. Join the collected segments with the same space-asterisk-space separator, so a single segment yields no leading or trailing asterisk and two segments yield exactly one asterisk between them. If no segment was collected, the head is the parenthesised word `empty` instead. Return that head, then a space-equals-space separator, then the combined total, computed as `productOf(onlyList) * productOf(sharedList)` -- reusing the existing `productOf` per D-07. Do not call `BigInt()` anywhere.

2. **Remove the now-superseded single-list line formatter.** `renderProducts()` (rewritten in step 3) is its only caller, and `formatSide` fully replaces it. Delete the whole function from the number-theory section. Keep `isPrime`, `productOf`, and `buildPalette` exactly as they are -- `productOf` is called by `formatSide`, and `isPrime` is still called by the drop handler and by `isValidStoredRegion()`.

3. **Rewrite `renderProducts()`** so the three rows come from one shared computation. Read the three prime lists once through the existing `primesOf(...)` helper (D-07) -- one for `state.regions.left`, one for `state.regions.overlap`, one for `state.regions.right` -- and name the overlap list so it reads as the shared factors of both circles. Compute the left circle's total as `productOf(leftOnlyList) * productOf(sharedList)` and the right circle's total as `productOf(rightOnlyList) * productOf(sharedList)`, using the same expression `formatSide` uses internally so the printed totals and the GCD arguments can never disagree. Then assign, using `textContent` and never `innerHTML` (a tampered localStorage payload must not be able to inject markup):
   - `productLeftEl` gets the literal label `Left`, a space-equals-space separator, then `formatSide(leftOnlyList, sharedList)` (D-01).
   - `productOverlapEl` gets the literal label `Overlap`, a space-equals-space separator, then the literal `GCD(`, the left total, a comma and a space, the right total, `)`, a space-equals-space separator, and finally `gcd(leftTotal, rightTotal)` (D-03). With the seed state this must render exactly `Overlap = GCD(30, 35) = 5`.
   - `productRightEl` gets the literal label `Right`, a space-equals-space separator, then `formatSide(rightOnlyList, sharedList)` (D-02).

   The three product-row labels are now literals local to this function, not lookups into `REGION_NAMES` -- that map keeps serving the placement captions, status messages, and aria-labels only (D-05). Do not add, remove, or reorder any element in the `.products-panel` markup: the three existing `.product-value` spans and their ids stay exactly as they are.

Touch nothing listed in the plan's do-not-touch table (D-06).
  </action>

  <verify>
    <automated>
cd "/home/mainaccount/Claude/number-theory-browser-tools" && node -e '
const fs=require("fs");
const s=fs.readFileSync("Venn Diagrams/venn-diagrams.html","utf8");
const A="/* ---------- number theory ---------- */", B="/* ---------- interaction ---------- */";
const i=s.indexOf(A), j=s.indexOf(B);
if(i<0||j<0||j<i) throw new Error("number-theory section markers not found");
const H=new Function(s.slice(i+A.length,j)+"; return {gcd:gcd, formatSide:formatSide, productOf:productOf};")();
const eq=(got,want)=>{ if(got!==want) throw new Error("got ["+got+"] want ["+want+"]"); };
eq(H.formatSide([2,3],[5]), "2 * 3 (only) * 5 (shared) = 30");
eq(H.formatSide([7],[5]), "7 (only) * 5 (shared) = 35");
eq(H.formatSide([2,3],[]), "2 * 3 (only) = 6");
eq(H.formatSide([],[5]), "5 (shared) = 5");
eq(H.formatSide([],[]), "(empty) = 1");
eq(String([H.gcd(30,35),H.gcd(6,7),H.gcd(1,1),H.gcd(12,18),H.gcd(0,5),H.gcd(5,0)]), "5,1,1,6,5,5");
eq(H.productOf([2,3,5]), 30);
console.log("HELPERS_PASS");
'
    </automated>
    <automated>
cd "/home/mainaccount/Claude/number-theory-browser-tools" && F="Venn Diagrams/venn-diagrams.html" && \
D=$(google-chrome --headless --disable-gpu --no-sandbox --user-data-dir="$(mktemp -d)" --virtual-time-budget=4000 --dump-dom "file://$PWD/$F" 2>/dev/null) && \
printf '%s' "$D" | grep -Fq 'id="product-left">Left = 2 * 3 (only) * 5 (shared) = 30' && \
printf '%s' "$D" | grep -Fq 'id="product-overlap">Overlap = GCD(30, 35) = 5' && \
printf '%s' "$D" | grep -Fq 'id="product-right">Right = 7 (only) * 5 (shared) = 35' && \
echo ROWS_PASS
    </automated>
    <automated>
cd "/home/mainaccount/Claude/number-theory-browser-tools" && \
! grep -nEi '#[0-9a-f]{3,8}\b|rgba?\(|hsla?\(' "Venn Diagrams/venn-diagrams.html" | grep -v 'palette.css' && echo NO_LITERAL_COLOR
    </automated>
    <human-check>
Open `Venn Diagrams/venn-diagrams.html` in a browser and confirm, by hand:
1. The three rows read `Left = 2 * 3 (only) * 5 (shared) = 30`, `Overlap = GCD(30, 35) = 5`, `Right = 7 (only) * 5 (shared) = 35`.
2. Sanity-check that GCD by hand: 30 = 2 * 3 * 5, 35 = 5 * 7, shared factor 5, so GCD is 5 -- and 5 is exactly the product of the single prime sitting in the lens.
3. Click the `5` chip in the lens to remove it (overlap now empty). The side rows lose their `(shared)` segment entirely with no stray asterisk, reading `Left = 2 * 3 (only) = 6` and `Right = 7 (only) = 7`, and the centre row reads `Overlap = GCD(6, 7) = 1`.
4. Press Clear all. All three rows survive, reading `Left = (empty) = 1`, `Overlap = GCD(1, 1) = 1`, `Right = (empty) = 1`.
5. Place a prime by click and another by drag-and-drop; both still land, and the rows update on both circles when the prime lands in the lens.
6. Reload -- the placement survives (localStorage still round-trips).
    </human-check>
  </verify>

  <done>
- `gcd(a, b)` and `formatSide(onlyList, sharedList)` exist as pure function declarations inside the number-theory section, reference nothing outside it, and satisfy every case in the `<behavior>` block.
- The superseded single-list line formatter is gone from the file, and no function in the file is left without a caller.
- `renderProducts()` renders `Left = ... (only) * ... (shared) = total` (D-01), `Overlap = GCD(leftTotal, rightTotal) = value` (D-03), and `Right = ... (only) * ... (shared) = total` (D-02), all via `textContent`.
- The printed side totals and the two GCD arguments come from the same `productOf` products, so the rows cannot disagree.
- `productOf` and `primesOf` are reused unchanged; `state.regions` and its `{id, p}` entries are untouched (D-07).
- `HELPERS_PASS`, `ROWS_PASS`, and `NO_LITERAL_COLOR` all print; the human-check list passes.
- Nothing in the do-not-touch table changed (D-06).
  </done>
</task>

<task type="auto">
  <name>Task 2: Carry the GCD framing in the lede, and stop the centre placement name claiming "only"</name>

  <files>Venn Diagrams/venn-diagrams.html</files>

  <action>
Two small text edits. Task 1 must be complete first (this task's DOM gate re-asserts Task 1's three rows, so it also proves the two edits did not disturb them).

1. **Rewrite the lede (D-04).** Replace the entire body of the `<p class="lede">` element in the page header -- the sentence that currently describes each region as independently holding a set of primes whose product sits underneath it -- with this exact prose, keeping the `<p class="lede">` tag, its class, and the surrounding markup untouched, and keeping the em dash written as the `&mdash;` HTML entity as the rest of this file does:

   `The two circles are two numbers, each written out as its prime factorization &mdash; everything inside a circle multiplies to that number. The primes in the overlap are the ones both numbers share, so the overlap multiplies to their GCD.`

   Change no other prose on the page: the `.eyebrow` line, the `h1`, the `picker-panel` heading, the `.picker-hint` instruction, the `Clear all` button label, and the `<svg id="venn">` root `aria-label` all stay exactly as they are.

2. **Fix the centre region's placement name (D-05).** In `REGION_NAMES`, change only the value under the `overlap` key to the single word `overlap`. Leave the three keys and the `left` and `right` values exactly as they are. Rationale to record in the summary: under the new framing the lens is where the *shared* primes sit, so the old value's trailing "only" claimed exclusivity that is now actively wrong; the user's own enumeration of acceptable placement-zone names is "left only" / "overlap" / "right only" (D-05). This map is read by five call sites -- the SVG caption built in `buildStatic()`, `regionAriaLabel()`, the full-region warning in `placePrime()`, the placed and removed status messages, and the placed-chip `aria-label` in `renderTokens()`. Edit none of them; re-read each one after the change and confirm the resulting sentence still reads naturally (for example the removal aria-label becomes "Remove 5 from the overlap region"). These strings stay literal placement descriptions -- the GCD framing lives only in the lede and the product rows (D-05).
  </action>

  <verify>
    <automated>
cd "/home/mainaccount/Claude/number-theory-browser-tools" && F="Venn Diagrams/venn-diagrams.html" && \
D=$(google-chrome --headless --disable-gpu --no-sandbox --user-data-dir="$(mktemp -d)" --virtual-time-budget=4000 --dump-dom "file://$PWD/$F" 2>/dev/null) && \
printf '%s' "$D" | grep -Fq 'so the overlap multiplies to their GCD.' && \
printf '%s' "$D" | grep -Fq 'each written out as its prime factorization' && \
printf '%s' "$D" | grep -Fq '>overlap</text>' && \
printf '%s' "$D" | grep -Fq '>left only</text>' && \
printf '%s' "$D" | grep -Fq '>right only</text>' && \
printf '%s' "$D" | grep -Fq 'id="product-left">Left = 2 * 3 (only) * 5 (shared) = 30' && \
printf '%s' "$D" | grep -Fq 'id="product-overlap">Overlap = GCD(30, 35) = 5' && \
printf '%s' "$D" | grep -Fq 'id="product-right">Right = 7 (only) * 5 (shared) = 35' && \
echo LABELS_PASS
    </automated>
    <automated>
cd "/home/mainaccount/Claude/number-theory-browser-tools" && F="Venn Diagrams/venn-diagrams.html" && E="$(mktemp)" && \
google-chrome --headless --disable-gpu --no-sandbox --enable-logging=stderr --log-level=0 --user-data-dir="$(mktemp -d)" --virtual-time-budget=4000 --dump-dom "file://$PWD/$F" 2>"$E" >/dev/null; \
if grep -qiE 'uncaught|error:console' "$E"; then echo "CONSOLE_DIRTY"; grep -iE 'uncaught|error:console' "$E"; exit 1; else echo CONSOLE_CLEAN; fi
    </automated>
    <automated>
cd "/home/mainaccount/Claude/number-theory-browser-tools" && F="Venn Diagrams/venn-diagrams.html" && \
grep -Fq "var MAX_PER_REGION = 8;" "$F" && \
grep -Fq "var STORAGE_KEY = 'venn-diagrams';" "$F" && \
grep -Fq "var R = 190, CY = 250, CXA = 355, CXB = 545, XM = 450;" "$F" && \
grep -Fq "var REGION_ANCHOR = { left: [275, 250], overlap: [450, 250], right: [625, 250] };" "$F" && \
grep -Fq "function createRegion(key, pathString){" "$F" && \
grep -Fq "function isValidStoredRegion(list){" "$F" && \
grep -Fq "function persist(){" "$F" && \
grep -Fq "function restore(){" "$F" && \
grep -Fq "function renderTokens(){" "$F" && \
grep -Fq "function renderPicker(){" "$F" && \
grep -Fq "font-size:19px;" "$F" && \
echo SCOPE_CLEAN
    </automated>
    <human-check>
Open the page in a browser and confirm in BOTH day and night themes (header toggle):
1. The lede reads as two sentences: the circles are two numbers written as prime factorizations, and the overlap multiplies to their GCD.
2. The caption under the centre lens reads `overlap`; the outer captions still read `left only` and `right only`.
3. Click a prime in the picker, then click the lens -- the status message names the `overlap` region and reads naturally.
4. With devtools open, reload and exercise place / drag / remove / Clear all: the console stays empty.
5. The three product rows are still readable at this width -- a two-part line may wrap inside its row, which is expected and fine.
    </human-check>
  </verify>

  <done>
- The lede is the exact two-sentence GCD framing above, with `&mdash;` preserved as an entity (D-04).
- `REGION_NAMES.overlap` is the single word `overlap`; the `left` and `right` values, all three keys, and all five call sites are unchanged (D-05).
- No other prose, label, or aria-label on the page changed.
- `LABELS_PASS`, `CONSOLE_CLEAN`, and `SCOPE_CLEAN` all print, and Task 1's three rows still assert green.
- The human-check list passes in both themes.
  </done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| localStorage -> page script | The `venn-diagrams` key is writable by anything with same-origin script execution, and its parsed contents flow into the region lists that this change renders into three longer, richer strings. |
| picker / drag payload -> region lists | `dataTransfer` text is user-controlled before it reaches `placePrime()`. |
| region lists -> product-row DOM sink | The new two-part and GCD strings are assembled from those list values and written into the three `.product-value` spans. |

## STRIDE Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation Plan |
|-----------|----------|-----------|----------|-------------|-----------------|
| T-CKC-01 | Tampering | `renderProducts()` product-row sink | low | mitigate | Task 1's action pins `textContent` and forbids `innerHTML` for all three assignments, so a tampered localStorage payload cannot inject markup through the newly lengthened strings. The `LABELS_PASS` gate greps the rendered DOM for the exact expected text, which would also surface a structural surprise. |
| T-CKC-02 | Tampering | `restore()` reading the `venn-diagrams` key | low | accept | Already gated by `isValidStoredRegion()` (array shape, 8-element cap, `isPrime()` per element). This plan adds no new read path and no new parsing, and D-06 forbids touching the storage layer. An attacker able to write localStorage already has same-origin script execution. |
| T-CKC-03 | Denial of service | `formatSide` / `gcd` arithmetic on restored values | low | accept | Inputs are capped at 8 primes per region by the pre-existing `MAX_PER_REGION`, and every value has passed `isPrime()`, so both helpers run in trivially bounded time. The Euclidean loop terminates for all non-negative finite inputs. The oversized-product limit is documented as an accepted cosmetic limit in `<scope_notes>`; Task 1 forbids `BigInt()` on a computed total, which is the one way this path could throw. |
| T-CKC-04 | Information disclosure | The three product rows and the region aria-labels | low | accept | The rows now also display derived totals and a GCD, all computed from primes the user placed locally. Nothing crosses a network boundary -- the page makes no request beyond the Google Fonts `<link>`. |

No package-manager install is performed by this plan, so no package-legitimacy gate applies.
</threat_model>

<verification>
1. All six `<automated>` gates pass: `HELPERS_PASS`, `ROWS_PASS`, `NO_LITERAL_COLOR` (Task 1) and `LABELS_PASS`, `CONSOLE_CLEAN`, `SCOPE_CLEAN` (Task 2).
2. This plan's own commits touch exactly one source file, `Venn Diagrams/venn-diagrams.html` (the repo already carries unrelated working-tree changes under `.planning/` and `.gsd/` from earlier work -- ignore those, and do not stage them).
3. Reviewing this plan's commits (`git show` per commit, not a working-tree diff, since each task commits atomically): no change to `MAX_PER_REGION`, `STORAGE_KEY`, `persist`, `restore`, `isValidStoredRegion`, `renderPicker`, `placePrime`, `removeToken`, `clearAll`, `createRegion`, `REGION_ANCHOR`, the SVG geometry constants, the three path builders, or the token grid math in `renderTokens` (D-06).
4. This plan's commits contain no CSS change and no literal color.
5. Both human-check lists pass, including the by-hand GCD sanity check (30 and 35 share 5) required by the task description.
</verification>

<success_criteria>
- The left and right rows each read as one two-part product line -- own-only factors, shared factors, combined total -- so each circle visibly stands for one whole number (D-01, D-02).
- The centre row explicitly reads `Overlap = GCD(leftTotal, rightTotal) = value`, using the two totals actually printed beside it, and its value agrees with the lens contents in every non-duplicate configuration (D-03).
- The lede tells the reader the circles are two numbers and the overlap is their GCD (D-04).
- Placement captions, status messages, and aria-labels still describe only where a chip sits, and the centre one no longer falsely says "only" (D-05).
- Regions, geometry, drag-and-drop, click-to-place, the 8-per-region cap, the picker, and the localStorage format are behaviourally byte-for-byte unchanged (D-06), and the fix is built on the existing data model and existing helpers (D-07).
- No console error on load or during interaction; no literal color introduced; the file still runs directly from a `file://` URL with no build step.
</success_criteria>

<output>
Create `.planning/quick/260926-ckc-fix-venn-diagrams-tool-overlap-region-sh/260926-ckc-SUMMARY.md` when done.
</output>
