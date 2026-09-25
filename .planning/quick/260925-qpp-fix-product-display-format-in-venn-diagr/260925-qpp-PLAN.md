---
phase: quick-260925-qpp
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - Venn Diagrams/venn-diagrams.html
autonomous: true
requirements: [QUICK-VENN-FMT-01]

estimate:
  tokens: 25000
  raw_tokens: 25000
  tasks: 1
  confidence: low

must_haves:
  truths:
    - "Opening Venn Diagrams/venn-diagrams.html with no saved state shows three single-line product rows reading exactly: left only = 2 * 3 = 6 / middle only = 5 = 5 / right only = 7 = 7"
    - "Factors inside a product line are joined by a literal ASCII asterisk surrounded by spaces, not by a multiplication-sign glyph."
    - "A region holding exactly one prime collapses to: name = prime = prime (for example middle only = 5 = 5)."
    - "A region holding zero primes renders as: name = (empty) = 1, and the panel keeps its three rows."
    - "The SVG caption under the centre lens reads middle only, not the old Title Case name."
    - "Status messages and the region / placed-chip aria-labels use the same three lowercase names as the product lines."
    - "Placing a prime by click, placing by drag-and-drop, removing a placed chip, Clear all, and localStorage round-trip all still behave exactly as before this change."
  artifacts:
    - "Venn Diagrams/venn-diagrams.html"
  key_links:
    - "REGION_NAMES -> product lines, SVG region captions, status messages, region aria-labels, placed-chip aria-labels (one source of truth for all five)"
    - "formatProduct(list) stays pure and factor-only; renderProducts() prepends the region name from REGION_NAMES"
---

<objective>
Reformat the Venn Diagram tool's three product rows into one combined line each — `{region name} = {factor} * {factor} = {product}` — and rename the centre region's user-visible name to `middle only`, lowercasing all three region names everywhere they are shown to a user.

Purpose: The user asked for the calculations underneath the diagram to read `left only = 2 * 3 * 5 = 30`, `middle only = 5 = 5`, `right only = 5 * 7 = 35`. Today the panel splits this across a Title Case caption and a separate value line, and multiplies with a multiplication-sign glyph instead of the asterisk the user asked for.
Output: One edited file — `Venn Diagrams/venn-diagrams.html` — with a single-line product row per region, asterisk-joined factors, and `REGION_NAMES` promoted to the single source of truth for every region name shown on screen.
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

<scope_notes>

**In scope — user-visible region names and the product line format only.**

**Explicitly out of scope, do not touch:**

| Thing | Why it stays |
|-------|--------------|
| The internal state keys `left` / `overlap` / `right` (`state.regions.overlap`, `REGION_ANCHOR.overlap`, `regionEls.overlap`, the `persist()` / `restore()` payload keys, the `venn-diagrams` localStorage key, the `region-overlap` element id) | Internal identifiers, never shown to a user. Renaming them is churn, breaks every already-saved localStorage payload, and is out of scope. |
| SVG geometry (`R`, `CY`, `CXA`, `CXB`, `XM`, `H`, `lensPath()`, `leftOnlyPath()`, `rightOnlyPath()`, the token grid math in `renderTokens()`) | Not a formatting concern. |
| Drag-and-drop, click-to-arm, keyboard placement, chip removal, `Clear all`, `persist()` / `restore()` / `isValidStoredRegion()`, the prime picker | Not a formatting concern. |
| The `<p class="lede">` intro sentence that says "so the overlap is exactly the part two numbers share" | Explanatory prose about the concept, not a region name label. Leave the wording alone. |
| The `<svg id="venn">` root `aria-label` ("Two overlapping circles forming three regions holding prime numbers") | Describes the diagram as a whole; names no region. |

**Colors:** this change is markup + JS + one CSS deletion. Do not introduce any literal color (no hex, `rgb()`, `hsl()`, or named color) — per `CLAUDE.md`, every color in this repo is consumed via `var()` against `assets/palette.css`. Nothing here needs a color at all.

**No layout redesign.** Do not change `.products-panel`, `.product-row`, or `.product-value` sizing, spacing, flex behaviour, or colors. The only CSS touched is the deletion of the rule that styled the caption span being removed.

</scope_notes>

<tasks>

<task type="auto">
  <name>Task 1: Combine each product row into one asterisk-joined line and rename the centre region to "middle only"</name>

  <files>Venn Diagrams/venn-diagrams.html</files>

  <behavior>
    With the default seed state (left holds 2 and 3, centre holds 5, right holds 7), the three
    product rows must render exactly:
      - left only = 2 * 3 = 6
      - middle only = 5 = 5
      - right only = 7 = 7

    With the user's own example state (left holds 2, 3, 5; centre holds 5; right holds 5, 7):
      - left only = 2 * 3 * 5 = 30
      - middle only = 5 = 5
      - right only = 5 * 7 = 35

    Edge cases:
      - A region with one prime p renders: name = p = p
      - A region with no primes renders: name = (empty) = 1
      - A region at the 8-prime cap renders all eight factors asterisk-joined; wrapping inside
        the row is acceptable and needs no CSS change.
  </behavior>

  <action>
Make five coordinated edits to `Venn Diagrams/venn-diagrams.html`. Read the whole file first; it is 666 lines and every edit below is a small, local replacement.

1. **`REGION_NAMES` becomes the one source of truth, in lowercase.** In the interaction section, change the `REGION_NAMES` map so its three values are the lowercase display names: `left` maps to `left only`, `overlap` maps to `middle only`, `right` maps to `right only`. Do not rename the three keys. Everything downstream — `regionAriaLabel()`, the full-region warning in `placePrime()`, the placed / removed status messages, and the placed-chip `aria-label` built in `renderTokens()` — already reads through this map, so those five call sites need no edit and must be left alone; re-read them once after the change to confirm each resulting sentence still reads naturally with the new lowercase names.

2. **`formatProduct(list)` joins with an asterisk and stays pure.** In the number-theory section at the top of the IIFE, delete the local variable that holds the multiplication-sign glyph (the one built from a character code) and join the factor list with a space-asterisk-space separator instead. The function keeps its current signature, keeps returning the factors-and-product tail only (no region name), and keeps its existing empty-list return value unchanged.

3. **`renderProducts()` prepends the region name.** Change each of the three assignments so the text written into `productLeftEl` / `productOverlapEl` / `productRightEl` is the matching `REGION_NAMES` value, then a space-equals-space separator, then the `formatProduct(...)` result. Keep using `textContent` — never `innerHTML` — so nothing restored from localStorage can be interpreted as markup.

4. **`buildStatic()` reads its three SVG captions from `REGION_NAMES`.** Replace the three hardcoded caption strings assigned to the `.region-label` text elements with `REGION_NAMES.left`, `REGION_NAMES.overlap`, and `REGION_NAMES.right` respectively, so the captions can never drift from the product lines again. Rename the centre caption's local variable from its old Title-Case-derived name to `labelOverlap` to match the key it renders. Leave the three `x`/`y` coordinates and the `class` attribute exactly as they are.

5. **Collapse each product row to a single element, and drop the dead CSS rule.** In the `.products-panel` markup, remove the uppercase caption `<span>` that sits above each product value, leaving each `.product-row` holding only its single `<span class="product-value" id="product-left|product-overlap|product-right">`. Then delete the now-unreferenced CSS rule in the `<style>` block that styled those caption spans (the rule immediately above `.product-value`, the one with `text-transform:uppercase` and `letter-spacing:.08em`). Do not modify `.products-panel`, `.product-row`, or `.product-value` themselves.

Keep the file's established conventions: everything stays inside the existing IIFE, `var` + `function` declarations in the existing style, 2-space indentation, camelCase names, no new external dependency, no new CSS custom property, and no literal color anywhere.
  </action>

  <verify>
    <automated>
cd "/home/mainaccount/Claude/number-theory-browser-tools" && F="Venn Diagrams/venn-diagrams.html" && \
grep -Fq "join(' * ')" "$F" && \
grep -Fq "middle only" "$F" && \
! grep -Fq "fromCharCode" "$F" && \
! grep -Fq "product-label" "$F" && \
[ "$(grep -Fc 'Both' "$F")" -eq 0 ] && \
D=$(google-chrome --headless --disable-gpu --no-sandbox --user-data-dir="$(mktemp -d)" --virtual-time-budget=4000 --dump-dom "file://$PWD/$F" 2>/dev/null) && \
printf '%s' "$D" | grep -Fq 'id="product-left">left only = 2 * 3 = 6' && \
printf '%s' "$D" | grep -Fq 'id="product-overlap">middle only = 5 = 5' && \
printf '%s' "$D" | grep -Fq 'id="product-right">right only = 7 = 7' && \
printf '%s' "$D" | grep -Fq '>middle only</text>' && \
printf '%s' "$D" | grep -Fq '>left only</text>' && \
printf '%s' "$D" | grep -Fq '>right only</text>' && echo GATE_PASS
    </automated>
    <automated>
cd "/home/mainaccount/Claude/number-theory-browser-tools" && \
! grep -nEi '#[0-9a-f]{3,8}\b|rgba?\(|hsla?\(' "Venn Diagrams/venn-diagrams.html" | grep -v 'palette.css' && echo NO_LITERAL_COLOR
    </automated>
    <human-check>
Open `Venn Diagrams/venn-diagrams.html` in a browser (both day and night theme via the header toggle) and confirm:
1. The three rows under the diagram each read as one line: `left only = ... = ...`, `middle only = ... = ...`, `right only = ... = ...`, with asterisks between factors.
2. The caption under the centre lens in the diagram reads `middle only`.
3. Click a prime in the picker, then click the centre region — the status message names the `middle only` region.
4. Drag a prime onto the left region — it still lands, and `left only = ...` updates.
5. Click a placed chip to remove it; empty a region completely and confirm its row reads `name = (empty) = 1` rather than breaking.
6. Reload the page — the placement survives (localStorage still round-trips).
    </human-check>
  </verify>

  <done>
- `REGION_NAMES` maps `left` / `overlap` / `right` to `left only` / `middle only` / `right only`; the three internal keys are unchanged.
- `formatProduct()` joins factors with `' * '` and no longer constructs a multiplication-sign character.
- `renderProducts()` writes `REGION_NAMES[key] + ' = ' + formatProduct(...)` into each of the three `.product-value` spans via `textContent`.
- `buildStatic()` sources all three `.region-label` captions from `REGION_NAMES`; no region name is hardcoded anywhere outside that map.
- The three `<span class="product-label">` elements and the `.product-label` CSS rule are gone; each `.product-row` holds exactly one child element.
- The string `Both` appears nowhere in the file.
- Both automated gates print their success marker; the human-check list passes in day and night themes.
- No literal color was introduced; no new external dependency; file still opens and runs directly from `file://`.
  </done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| localStorage -> page script | The `venn-diagrams` key is attacker-writable by anything with same-origin script execution, and its parsed contents flow into the region lists that this change now renders into a combined product line. |
| picker / drag payload -> region lists | `dataTransfer` text is user-controlled before it reaches `placePrime()`. |

## STRIDE Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation Plan |
|-----------|----------|-----------|----------|-------------|-----------------|
| T-QPP-01 | Tampering | `renderProducts()` product-line sink | low | mitigate | The new combined line is assigned with `textContent`, never `innerHTML`; task action pins this explicitly, so a tampered localStorage payload cannot inject markup through the newly lengthened string. |
| T-QPP-02 | Tampering | `restore()` reading the `venn-diagrams` key | low | accept | Already gated by `isValidStoredRegion()` (array shape, length cap, `isPrime()` per element). This change adds no new read path and no new parsing. An attacker able to write localStorage already has same-origin script execution. |
| T-QPP-03 | Information disclosure | `regionAriaLabel()` / placed-chip `aria-label` | low | accept | Region names become lowercase text only; the labels expose the same locally-entered primes they already did. No new data crosses any boundary — the page makes no network request beyond the Google Fonts `<link>`. |

No package-manager install is performed by this plan, so no package-legitimacy gate applies.
</threat_model>

<verification>
1. Both `<automated>` gates in Task 1 pass (`GATE_PASS` and `NO_LITERAL_COLOR` printed).
2. `git diff --stat` shows exactly one file changed: `Venn Diagrams/venn-diagrams.html`.
3. `git diff` contains no change to `REGION_ANCHOR`, `lensPath`, `leftOnlyPath`, `rightOnlyPath`, `renderTokens` geometry, `persist`, `restore`, `isValidStoredRegion`, or the picker.
4. The human-check list in Task 1 passes in both day and night themes.
</verification>

<success_criteria>
- The three calculation rows under the diagram read `left only = 2 * 3 * 5 = 30`-style single lines, matching the user's verbatim request.
- The centre region is called `middle only` in the product row, the SVG caption, every status message, and every aria-label.
- All three displayed region names are lowercase.
- Empty regions render `name = (empty) = 1` instead of breaking.
- Nothing else about the tool changed — geometry, interaction, persistence, and palette compliance are byte-for-byte intact in behaviour.
</success_criteria>

<output>
Create `.planning/quick/260925-qpp-fix-product-display-format-in-venn-diagr/260925-qpp-SUMMARY.md` when done.
</output>
