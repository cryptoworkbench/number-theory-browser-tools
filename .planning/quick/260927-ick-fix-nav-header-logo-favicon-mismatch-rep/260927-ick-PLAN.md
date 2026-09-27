---
phase: quick-260927-ick
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - assets/site.css
  - index.html
  - Congruence Wheel/congruence-wheel.html
  - Diffie-Hellman Key Exchange/diffie-hellman-key-exchange.html
  - Factorize By Completing The Square/factorize-completing-square.html
  - Factor Tree/factor-tree.html
  - RSA/rsa.html
  - Shors Algorithm/shors-algorithm.html
  - Sieve Of Eratosthenes/sieve-of-eratosthenes.html
  - Square And Multiply/square-and-multiply.html
  - Venn Diagrams/venn-diagrams.html
autonomous: true
requirements: [PAL-02, PAL-03, NAV-01, NAV-02]

estimate:
  tokens: 42000
  raw_tokens: 42000
  tasks: 2
  confidence: low

must_haves:
  truths:
    - "The nav-header brand mark on all ten pages is the same numbered 1-2-3-4 tile the browser tab shows: same plate rectangle and corner radius, same four digit positions, same digit weight and size, read out of `assets/favicon.svg` rather than retyped — so tab icon and header icon read as one mark and the reported mismatch is gone."
    - "The header mark follows the site's own day/night toggle: its plate resolves through `var()` to the palette's accent token and its digits to the accent-ink token, so the two themes produce two different computed fills on the same markup (PAL-03)."
    - "`assets/favicon.svg` is byte-for-byte untouched and keeps following the operating system's color-scheme preference — the header copy is a sibling of it, not a replacement for it."
    - "No page and no shared stylesheet gains a literal color value: every color in the new mark is a `var()` reference to a token declared in `assets/palette.css` (PAL-02)."
    - "The glyph U+1F522 no longer appears in any `.html` file in the repository — all ten occurrences are replaced, none is missed."
    - "Adding the mark leaves every page's header height byte-identical to its pre-change value at desktop (1280px) and phone (400px) widths in both themes, and the brand link still announces only `Number Theory Tools` to assistive technology with the icon hidden from it (NAV-01)."
    - "The site keeps its architecture: one self-contained HTML file per tool, shared chrome only in `assets/`, no new external dependency, no build step, no committed tooling (NAV-02)."
  artifacts:
    - "assets/site.css"
    - "index.html"
    - "Congruence Wheel/congruence-wheel.html"
    - "Diffie-Hellman Key Exchange/diffie-hellman-key-exchange.html"
    - "Factorize By Completing The Square/factorize-completing-square.html"
    - "Factor Tree/factor-tree.html"
    - "RSA/rsa.html"
    - "Shors Algorithm/shors-algorithm.html"
    - "Sieve Of Eratosthenes/sieve-of-eratosthenes.html"
    - "Square And Multiply/square-and-multiply.html"
    - "Venn Diagrams/venn-diagrams.html"
  key_links:
    - "`assets/site.css` `.brand-icon-plate` / `.brand-icon-digit` rules -> the `class` attributes on the inline SVG in all ten pages -> `--st-header-accent` / `--st-header-accent-ink` -> `assets/palette.css` accent tokens. Color lives only in the shared stylesheet; a class-name typo in one page silently drops that page's mark to the SVG default black fill, which is exactly what the computed-fill gate catches."
    - "`assets/favicon.svg` geometry (rect x/y/width/height/rx, the four text x/y pairs, font-size, font-weight) -> the inline header copy's geometry. This is the connection the bug report is about, so the gate parses those numbers out of the favicon at verify time rather than trusting this plan's text; a future favicon edit that is not mirrored into the header fails the gate."
    - "The `.site-brand` flex row (`gap: 8px`, `white-space: nowrap`) -> the new svg flex item's `flex: none` and em-relative box. This is the one place the change can regress layout: too large a box grows the sticky header on every page at once, and a shrinkable box deforms the mark at 400px."
---

<objective>
Replace the emoji in the site-header brand link, on all ten pages, with an inline SVG twin of `assets/favicon.svg`, so the mark in the nav header and the mark in the browser tab are the same design.

Purpose: the user reported that the 1-2-3-4 box logo in the menu bar differs from the 1-2-3-4 box logo in the browser tab. It does: the tab shows `assets/favicon.svg`, a hand-drawn rounded tile with a 2x2 digit grid, while the header shows the stock glyph U+1F522, whose rendering is whatever the operating system's emoji font draws. They are unrelated artwork that happen to both be "a box with 1 2 3 4 in it".

Output: one new pair of CSS rules plus one new token in `assets/site.css`, and the same six-line markup swap inside the `.site-brand` anchor of all ten pages.

**Investigated scope.** The brand anchor is `<a class="site-brand" href="...">` followed by the glyph, a space and the words `Number Theory Tools`, and it occurs exactly once per page in all ten pages (index.html line 124 with `href="index.html"`; the nine tool pages with `href="../index.html"` at factorize-completing-square.html:240, factor-tree.html:309, congruence-wheel.html:314, square-and-multiply.html:148, sieve-of-eratosthenes.html:358, shors-algorithm.html:141, venn-diagrams.html:319, diffie-hellman-key-exchange.html:161, rsa.html:169). The glyph appears exactly once per file and nowhere else in the repo. No page overrides `.site-brand` in its own `<style>` block, so the styling for the new icon belongs in `assets/site.css` — the shared-chrome file that already owns every `.site-brand` and `.site-nav` rule — and is written once, not ten times.

**Why an inline copy rather than reusing the favicon file.** `assets/favicon.svg` is fetched by the browser as its own standalone document, so it cannot resolve the host page's custom properties; that is why its own header comment documents it as the single file on the site exempt from the `var()`-only color rule, and why it follows `prefers-color-scheme` instead of the site's `localStorage` toggle. Referencing that file from an `<img>` in the header would import that OS-driven behaviour into a page that has its own day/night switch, and the mark would then disagree with the header around it whenever the two preferences differ. An inline copy styled from `assets/site.css` re-themes with the site. The two files therefore share geometry, not colors, and the geometry is machine-compared at verify time so they cannot drift apart again. `assets/favicon.svg` itself is not edited by this plan, and a blob-hash gate enforces that.

**Chosen sizing.** The existing `.site-brand` box measures exactly 20.00px tall at 1280px width (measured headlessly on index.html before any change), driven by the brand text's line box, and the emoji sits inside it. A `1.3em` icon on a `0.95rem` brand is 19.76px — the largest square that still fits inside that 20px line box, so the sticky header's height on all ten pages is unchanged rather than merely "close".
</objective>

<execution_context>
@~/.claude/gsd-core/workflows/execute-plan.md
@~/.claude/gsd-core/templates/summary.md
</execution_context>

<context>
@CLAUDE.md
@.claude/CLAUDE.md
@assets/favicon.svg
@assets/site.css
@assets/palette.css
</context>

<tasks>

<task type="tracer">
  <name>Task 1: Brand-icon styling in shared chrome, wired end-to-end on index.html, with a measurement harness</name>
  <files>assets/site.css, index.html</files>
  <precondition>`google-chrome` and `node` are both on PATH (the verify gates drive headless Chrome over `file://` URLs); confirm with `command -v google-chrome node` before starting.</precondition>
  <action>
This is the thin end-to-end slice: shared stylesheet plus one page, proven visually and by computed style, before the same markup is repeated across the other nine pages in Task 2.

**Step A — build the throwaway check tooling first, and capture the pre-change baseline before editing anything.** Nothing here is committed: create it under `S="${TMPDIR:-/tmp}/brand-icon-260927-ick"` (`mkdir -p "$S"`), never inside the repository working tree. Three artifacts:

1. `"$S"/probe.html` — a harness page that takes `?w=<px>&theme=<night|day>` from its own query string, then walks the ten repo pages in turn in a single iframe whose CSS width is `w` (an iframe establishes its own viewport, so each page's `@media (max-width: 760px)` rule responds to `w`). Build each iframe `src` with `encodeURI` over the absolute `file:///` path — six of the ten paths contain spaces and an unencoded space silently fails to load. Append `?theme=<theme>` to each src; `assets/theme.js` reads a `theme` URL parameter before any stored preference, so this is how a theme is forced. On each iframe `load`, read `contentDocument` and log exactly one line per page of the form `MEASURE <json>`, where the JSON object carries: `page` (repo-relative path), `width`, `theme` (read back from the iframe document's `data-theme` attribute, not from the request, so a failed theme forcing is visible), `header` (`.site-header` bounding-rect height), `brand` (`.site-brand` bounding-rect height), `icon` (`.brand-icon` bounding-rect `{w,h}`, or `null` when the element is absent, which is the expected baseline state), `plateFill` (computed `fill` of `.brand-icon-plate`, or `null`), `digitFill` (computed `fill` of the first `.brand-icon-digit`, or `null`), `digitFontSize` and `digitFontWeight` (computed, or `null`). Then advance to the next page; after the last one, log `MEASURE-DONE`.
2. `"$S"/measure.sh <label>` — runs headless Chrome four times, once per `width` in `1280 400` crossed with `theme` in `night day`, using the flag set this repo has used successfully before: `google-chrome --headless --disable-gpu --no-sandbox --user-data-dir="$(mktemp -d)" --virtual-time-budget=20000 --enable-logging=stderr --log-level=0 --dump-dom "file://$S/probe.html?w=<w>&theme=<t>"`, capturing stderr. Collect every `MEASURE <json>` line from all four runs into a JSON array at `"$S"/<label>.json`, and fail loudly unless the array holds exactly 40 records (10 pages x 2 widths x 2 themes) and every run reached `MEASURE-DONE`. If one combined run stalls (a page with a long-running timer can exhaust the virtual-time budget), fall back to one Chrome invocation per page — slower, same records.
3. `"$S"/check-brand.js <page...>` — the static gate, described in Step D below.

With the tooling in place and the working tree still clean, run `bash "$S"/measure.sh baseline`. If you have already edited a file by the time you read this, recover the baseline with `git stash`, measure, then `git stash pop` — do not fabricate it, because Task 1 and Task 2 both compare against it.

**Step B — add the styling to `assets/site.css`.** In the existing `:root` block (which already declares `--st-header-accent: var(--accent)`), add one paired token, `--st-header-accent-ink: var(--accent-ink)`, with a short comment that it is the legible ink for text sitting on an `--st-header-accent` fill. Then, immediately after the `.site-brand:hover` rule, add the mark's rules under a comment explaining that this is an inline twin of `assets/favicon.svg` carrying the same geometry, that its colors resolve through `var()` so it follows the site's own toggle, and that the favicon keeps its literal colors because it is fetched as its own document:

- `.brand-icon` — `display: block` (so no inline baseline gap is added to the header), `flex: none` (so the square never shrinks or stretches in the `.site-brand` flex row), `width: 1.3em`, `height: 1.3em`.
- `.brand-icon-plate` — `fill: var(--st-header-accent);`
- `.brand-icon-digit` — `fill: var(--st-header-accent-ink);` plus the four typography declarations restated from the favicon's own internal style block so the inline copy rasterises identically: the same `font-family` stack the favicon lists, `font-weight: 700`, `font-size: 26px`, `text-anchor: middle`, `dominant-baseline: central`. Read those values out of `assets/favicon.svg` rather than from this paragraph — Step D's gate compares the two files and rejects any divergence. A class selector is used deliberately: it outranks any bare `text { ... }` rule a tool page declares in its own later-cascading `<style>` block.

No literal color may appear anywhere in this edit; `assets/site.css` contains zero today and the gate keeps it at zero.

**Step C — swap the markup in `index.html` (line 124).** Replace the anchor's single text run with an SVG element, then a span, keeping `class="site-brand"` and `href="index.html"` exactly as they are, the anchor indented at its current four spaces and its children at six:

- `<svg class="brand-icon" viewBox="0 0 64 64" aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg">` — the viewBox is copied from the favicon; `aria-hidden` plus `focusable="false"` follows the `wheel-icon` precedent added to this same file in quick task 260927-bpe, so the link keeps announcing just its text.
- `<rect class="brand-icon-plate" x="2" y="2" width="60" height="60" rx="14"/>` — every number taken verbatim from the favicon's rect.
- four `<text class="brand-icon-digit" x="…" y="…">n</text>` elements reproducing the favicon's four digit positions and their digits in the favicon's own order, again verbatim.
- `<span class="site-brand-label">Number Theory Tools</span>` — wrapping the words in an element makes them one clean flex item so the existing `gap: 8px` is the only spacing between mark and wordmark, and gives the gate something unambiguous to assert.

Copy the geometry numbers by reading `assets/favicon.svg`, not from memory. Do not touch `assets/favicon.svg`, and do not adjust the favicon's digit placement to "look better centred" here — reproducing it exactly is the whole point of the fix, and any perceived imbalance is a property of the mark that belongs to a separate change to both files at once.

**Step D — write `"$S"/check-brand.js`, the static gate.** For each page path passed as an argument it must: isolate the `<a class="site-brand" …>…</a>` slice; fail if that slice contains a hex, `rgb`/`rgba` or `hsl`/`hsla` color value; parse the slice's `rect` and four `text` elements and require every geometry attribute (`x`, `y`, `width`, `height`, `rx` on the rect; `x`, `y` and the digit text content on each text element, in order) to equal the corresponding attribute parsed out of `assets/favicon.svg`; require the svg root to carry the favicon's own `viewBox` string plus `aria-hidden="true"` and `focusable="false"`; require the classes `brand-icon`, `brand-icon-plate` and `brand-icon-digit` (four of the last); require the label span with the exact text; require the anchor's `href` to be `index.html` for the root page and `../index.html` for any page in a subdirectory; and fail if the codepoint U+1F522 appears anywhere in the file. It must also check, once, that the `.brand-icon-digit` rule in `assets/site.css` restates the favicon's `font-size` and `font-weight` values (compare with whitespace stripped) along with `text-anchor:middle` and `dominant-baseline:central`. Exit non-zero with the offending page and field named on the first failure.

**Step E — write `"$S"/compare.js`, the rendered gate.** It reads `"$S"/baseline.json` and `"$S"/after.json`, and for every `(page, width, theme)` key present in both: requires `header` to be exactly equal between the two (the header must not grow or shrink anywhere), and requires the baseline record's `theme` to equal the requested one. For records whose page has already been converted, it additionally requires `icon.w` to equal `icon.h`, `icon.h` to be greater than zero and no greater than the baseline `brand` height, and `digitFontSize`/`digitFontWeight` to match the favicon's values. For color it parses `assets/palette.css` for `--accent` and `--accent-ink` in the default `:root` block and in the `[data-theme="day"]` block, converts each hex to the `rgb(r, g, b)` form Chrome reports, and requires `plateFill` and `digitFill` on each converted page to equal the accent and accent-ink of that record's theme — and separately requires the night and day `plateFill` values to differ, which is the actual proof that the mark rides the site's toggle rather than being frozen. Pass the set of already-converted pages in as arguments so the same script serves both tasks.

Then run `bash "$S"/measure.sh after` and let the verify block below run the gates.
  </action>
  <verify>
    <automated>cd "$(git rev-parse --show-toplevel)" && S="${TMPDIR:-/tmp}/brand-icon-260927-ick" && test -s "$S/baseline.json" && node "$S/check-brand.js" index.html && bash "$S/measure.sh" after && node "$S/compare.js" index.html && grep -q -- "--st-header-accent-ink" assets/site.css && test "$(git hash-object assets/favicon.svg)" = "ad4099aaac8f2ccb9ef1532c8bc5ec098c922939" && ! grep -nE '#[0-9a-fA-F]{3,8}|rgba?\(|hsla?\(' assets/site.css && GS=$(git status --porcelain --untracked-files=all) && test -z "$(printf '%s\n' "$GS" | grep '^??' | grep -vE '^\?\? (\.planning/|\.gsd/)')" && echo "TASK-1 OK"</automated>
    <human-check>Capture `index.html` headlessly at both widths and both themes into the scratchpad — `google-chrome --headless --disable-gpu --no-sandbox --user-data-dir="$(mktemp -d)" --virtual-time-budget=4000 --hide-scrollbars --window-size=1280,900 --screenshot="$S/hub-1280-night.png" "file://$PWD/index.html?theme=night"` and the same for `?theme=day` and for `--window-size=400,900` — then view the four images. In each one the header shows a filled rounded tile carrying 1 2 over 3 4, sitting on the text baseline beside the words, the nav links land where they did before, and at 400px the brand row is not wrapped or clipped.</human-check>
  </verify>
  <done>`assets/site.css` declares the paired ink token and the three `.brand-icon` rules with no literal color; `index.html`'s brand anchor carries the inline SVG whose every geometry number is equal to the favicon's; the static gate passes for `index.html`; the rendered gate confirms the header height is unchanged at both widths in both themes and that the plate and digit fills resolve to the palette's accent and accent-ink for the active theme and differ between themes; `assets/favicon.svg` still hashes to its pre-change blob; no new file is left untracked in the repository.</done>
  <reversibility rating="reversible">Two additive rules in a shared stylesheet plus one anchor's inner markup; reverting the commit restores the previous glyph exactly.</reversibility>
</task>

<task type="auto">
  <name>Task 2: Propagate the identical brand mark to the nine tool pages</name>
  <files>Congruence Wheel/congruence-wheel.html, Diffie-Hellman Key Exchange/diffie-hellman-key-exchange.html, Factorize By Completing The Square/factorize-completing-square.html, Factor Tree/factor-tree.html, RSA/rsa.html, Shors Algorithm/shors-algorithm.html, Sieve Of Eratosthenes/sieve-of-eratosthenes.html, Square And Multiply/square-and-multiply.html, Venn Diagrams/venn-diagrams.html</files>
  <action>
Apply the exact markup Task 1 settled on in `index.html` to the brand anchor of the remaining nine pages. The only per-page difference is the anchor's `href`, which stays `../index.html` on every one of them — do not rewrite it, and do not re-derive the SVG: take the six-line block from `index.html` verbatim so all ten pages are character-identical inside the anchor.

The nine anchors are at congruence-wheel.html:314, diffie-hellman-key-exchange.html:161, factorize-completing-square.html:240, factor-tree.html:309, rsa.html:169, shors-algorithm.html:141, sieve-of-eratosthenes.html:358, square-and-multiply.html:148, venn-diagrams.html:319; each file contains the glyph U+1F522 exactly once and the brand anchor exactly once, so an exact-string replacement of the anchor's inner text run is unambiguous. A scripted pass over the nine files is preferable to nine hand edits precisely because it cannot leave one page behind; whichever route you take, the gate below is what proves all ten landed.

Add no CSS: `assets/site.css` already carries the rules and these nine pages already link it. Touch nothing else in these files — no tool markup, no script, no `<style>` block. `Congruence Wheel/congruence-wheel.html` legitimately contains a runtime-built `rgb(...)` string inside its PNG-export code and an `&#8469;` HTML entity in its prose; both predate this task, both are outside the brand anchor, and the gate is scoped to the anchor slice so neither is disturbed or falsely flagged.

Then rerun the measurement pass (`bash "$S"/measure.sh after`, with `S="${TMPDIR:-/tmp}/brand-icon-260927-ick"`) so the rendered gate now covers all ten converted pages against the same pre-change baseline.
  </action>
  <verify>
    <automated>cd "$(git rev-parse --show-toplevel)" && S="${TMPDIR:-/tmp}/brand-icon-260927-ick" && PAGES=$(node -e 'const fs=require("fs");const p=["index.html"].concat(fs.readdirSync(".",{withFileTypes:true}).filter(d=>d.isDirectory()&&!d.name.startsWith(".")).flatMap(d=>fs.readdirSync(d.name).filter(f=>f.endsWith(".html")).map(f=>d.name+"/"+f)));if(p.length!==10)throw new Error("expected 10 pages, found "+p.length+": "+p.join(", "));console.log(p.join("\n"))') && echo "$PAGES" | tr '\n' '\0' | xargs -0 node "$S/check-brand.js" && bash "$S/measure.sh" after && echo "$PAGES" | tr '\n' '\0' | xargs -0 node "$S/compare.js" && test "$(grep -rlF "$(printf '\xf0\x9f\x94\xa2')" --include=*.html . | wc -l)" = 0 && test "$(grep -rl 'class="brand-icon"' --include=*.html . | wc -l)" = 10 && test "$(git hash-object assets/favicon.svg)" = "ad4099aaac8f2ccb9ef1532c8bc5ec098c922939" && GS=$(git status --porcelain --untracked-files=all) && test -z "$(printf '%s\n' "$GS" | grep '^??' | grep -vE '^\?\? (\.planning/|\.gsd/)')" && echo "TASK-2 OK"</automated>
    <human-check>Serve the repo over HTTP (`python3 -m http.server 8000` from the repo root) and open the hub plus three tool pages, including Congruence Wheel and one long page such as Sieve of Eratosthenes. Use HTTP rather than `file://`: Chrome does not reliably paint tab icons for `file://` pages. On each page, hold the header mark and the tab icon side by side — same tile, same corner rounding, same 1 2 / 3 4 layout. Flip the day/night toggle: the header mark recolors with the header while the tab icon does not move, which is expected. Narrow the window to roughly 400px on two of them and confirm the brand row still reads as one line with the mark intact.</human-check>
  </verify>
  <done>All ten pages carry a character-identical brand SVG inside their `.site-brand` anchor with their own correct `href`; the static gate passes for all ten; the rendered gate reports the header height unchanged for all ten pages at 1280px and 400px in both themes and the plate and digit fills resolving to the palette's accent and accent-ink per theme; the glyph U+1F522 appears in no HTML file; `assets/favicon.svg` still hashes to its pre-change blob; nothing new is left untracked in the repository.</done>
  <reversibility rating="reversible">Nine identical inner-markup edits; reverting the commit restores the previous glyph on every page.</reversibility>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| repo files -> browser renderer | Every page is static markup opened directly by the user's browser; there is no server, no input and no data crossing into this change |
| throwaway check tooling -> repository working tree | The verification harness runs headless Chrome with `--allow-file-access-from-files` over local files and must not leave artifacts behind in the repo |

## STRIDE Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation Plan |
|-----------|----------|-----------|----------|-------------|-----------------|
| T-ick-01 | Elevation of Privilege | inline `<svg>` added to ten pages | low | mitigate | The inserted markup is static drawing elements only — one `rect`, four `text`, no scripting element, no external reference, no `xlink:href`, no embedded image. Being inline it is parsed in the page's own context, so the absence of active content is what keeps it inert; the static gate asserts the exact element and attribute set on every page, so a later edit that adds anything else fails before commit |
| T-ick-02 | Tampering | `assets/favicon.svg` | low | mitigate | The tab icon is deliberately out of scope and both tasks assert its committed blob hash is unchanged, so an accidental "helpful" edit to the file the user is comparing against cannot slip through |
| T-ick-03 | Tampering | throwaway harness scripts under `$TMPDIR` | low | mitigate | The harness is written outside the working tree and both tasks gate on `git status` reporting no new untracked path outside `.planning/` and `.gsd/`, so no unreviewed tooling is committed into a repo that deliberately has no build system |
| T-ick-SC | Tampering | npm/pip/cargo installs | high | mitigate | Not applicable in practice: this plan installs no package and adds no dependency — the repo has no package manager and the change uses only the browser's own SVG support. Should any install become necessary, the package-legitimacy gate and its blocking human checkpoint apply before it runs |
</threat_model>

<verification>
- `assets/favicon.svg` hashes to `ad4099aaac8f2ccb9ef1532c8bc5ec098c922939`, its pre-change blob.
- All ten pages carry one `brand-icon` SVG whose rect and four text geometry attributes equal the favicon's, parsed from the favicon at verify time.
- The glyph U+1F522 is absent from every `.html` file in the repo.
- `assets/site.css` contains no hex, `rgb`/`rgba` or `hsl`/`hsla` value, and neither does any brand anchor slice on any page.
- Headless measurement over 10 pages x {1280px, 400px} x {night, day} reports each page's header height exactly equal to its pre-change baseline.
- Computed `fill` on the plate equals the palette's accent for the active theme and on the digits equals accent-ink, with the night and day plate values differing.
- `git status` shows no new untracked path outside `.planning/` and `.gsd/`.
</verification>

<success_criteria>
The mark in the menu bar and the mark in the browser tab are the same design on all ten pages; the header copy recolors with the site's day/night toggle while the favicon is untouched; no literal color and no new dependency enters the repo; every page's header geometry is unchanged at desktop and phone widths in both themes.
</success_criteria>

<output>
Create `.planning/quick/260927-ick-fix-nav-header-logo-favicon-mismatch-rep/260927-ick-SUMMARY.md` when done
</output>
