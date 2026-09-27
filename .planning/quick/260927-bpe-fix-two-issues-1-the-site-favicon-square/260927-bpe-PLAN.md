---
phase: quick-260927-bpe
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - assets/favicon.svg
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
requirements: [NAV-01, NAV-02, PAL-02, PAL-04]

estimate:
  tokens: 45000
  raw_tokens: 45000
  tasks: 3
  confidence: low

must_haves:
  truths:
    - "All ten pages (the hub plus all nine tools) carry an icon link that resolves to `assets/favicon.svg` from that page's own directory, so a numbered-tile mark appears in the browser tab everywhere on the site (NAV-01)."
    - "The favicon is a standalone, self-contained SVG asset in `assets/` whose mark is the same 1-2-3-4 numbered square the site-header brand glyph already shows, drawn to stay readable as a small tile at 16-32px."
    - "Every color literal in the favicon is a value already declared in `assets/palette.css`; no new color is invented anywhere in this change (PAL-02)."
    - "The favicon file contains no external reference and no active content of any kind — it is static drawing markup only."
    - "The Congruence Wheel card on the hub shows a two-concentric-ring 12-hour clock face with twelve wedge dividers, one per residue class of the additive group of order 12, plus clock hands — and the food emoji it replaces is gone from the page entirely."
    - "The clock icon takes every color from `var()` references to `assets/palette.css` tokens declared in index.html's own `<style>` block, so index.html still declares zero literal color values (PAL-02, PAL-04)."
    - "The clock icon renders at the same visual size as the eight sibling emoji icons and is hidden from assistive technology, so the card still announces only its heading and description."
    - "Nothing else changes: the other eight cards, the hero, the nav lists and the footer are untouched, every page remains one self-contained HTML file, and the only shared dependencies are still the `assets/` files and Google Fonts (NAV-02)."
  artifacts:
    - "assets/favicon.svg"
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
    - "each page's `<head>` icon link -> its per-page relative prefix (bare `assets/` at the repo root, `../assets/` one directory down) -> assets/favicon.svg. The prefix is the only thing that differs between the ten pages and the one place this silently breaks into a blank tab."
    - "assets/palette.css token values -> the hand-copied literals inside assets/favicon.svg. A favicon is fetched as its own document and cannot resolve the host page's custom properties, so this is the only copy-not-reference color path on the site; the drift gate in <verification> is what keeps the copy honest."
    - "index.html `<style>` `.wheel-icon-*` rules -> `class` attributes on the inline clock SVG's children -> palette tokens. Color lives in the stylesheet, never in an SVG presentation attribute, and that is precisely what keeps index.html literal-color-free."
---

<objective>
Give the site a real browser-tab icon, and replace the Congruence Wheel card's food emoji with an icon that actually depicts what the tool teaches.

Purpose: the tab icon is the site's only identity mark once a visitor has several tools open at once, and the hub's card icons are the first thing that tells a self-learner what each tool is about. A pizza slice says "pizza"; a two-ring 12-hour clock says "arithmetic that wraps around", which is exactly the Congruence Wheel's subject.

Output: a new shared `assets/favicon.svg`, an icon link in all ten pages' `<head>`, and an inline clock SVG on the Congruence Wheel card.

**Investigated root cause (issue 1):** there is no broken favicon path to repair — there is no favicon at all. A repo-wide search for `rel="icon"`, `shortcut icon`, `apple-touch`, `favicon` and `manifest` across every `.html`, `.css` and `.js` file returns zero hits, and the repo contains no `.svg`, `.ico`, `.png` or `.webmanifest` file anywhere. The "square box with the numbers 1, 2, 3, 4" the visitor recognises is the brand glyph U+1F522 in the site-header link text (`... Number Theory Tools`), which is present exactly once in each of the ten pages and was never wired up as a tab icon. So this plan creates the asset and wires it, rather than fixing a path.

**Investigated scope (issue 2):** the Congruence Wheel card lives in index.html's `.card-grid`, and its icon is a single emoji glyph inside `<div class="icon">`. Eight sibling cards use the same emoji-in-a-div pattern, sized only by `.card .icon{ font-size: 1.8rem }`, so swapping one card to an inline SVG needs its own explicit sizing rule to stay visually level with its neighbours.

**Investigated duplication question:** the favicon link must be repeated in each page's own `<head>`. There is no server, no build step and no HTML include mechanism in this repo, and `assets/theme.js` is deferred (it runs after first paint, so injecting the link from JS would both race the tab icon and make the site's identity depend on scripting). Every page already repeats `<link rel="stylesheet" href="../assets/palette.css">` by hand for the same reason; the icon link follows that established convention. Helpfully, all ten pages share an identical head shape — exactly one `<title>` line, immediately followed by the palette stylesheet link — which gives one unambiguous insertion anchor per file.
</objective>

<execution_context>
@~/.claude/gsd-core/workflows/execute-plan.md
@~/.claude/gsd-core/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@CLAUDE.md
@assets/palette.css
@index.html
</context>

<tasks>

<task type="tracer">
  <name>Task 1: End-to-end tab icon — the asset plus one wired page</name>
  <files>assets/favicon.svg, index.html</files>
  <action>
Create the favicon asset and prove the whole chain (asset exists -> page links it -> path resolves -> tab paints) on the hub page alone, before repeating the link across the other nine pages in Task 2.

Create `assets/favicon.svg` as a static, self-contained SVG document: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">`. Draw a rounded tile `<rect x="2" y="2" width="60" height="60" rx="14">` filled with the plate color, then four digits — 1, 2, 3, 4 — as `<text>` elements in a 2x2 grid at centres (21,26), (43,26), (21,50), (43,50), each with `text-anchor="middle"`, `dominant-baseline="central"`, `font-size="26"`, `font-weight="700"` and `font-family="system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"`. This reproduces the numbered-square brand glyph already in every page's header as a vector the tab can render crisply. Use digit characters rather than the emoji glyph itself: every font ships digits, so there is no tofu risk on a machine without a color-emoji font.

Colors: put a `<style>` block inside the SVG that declares two custom properties on `:root` — one for the tile plate, one for the digit ink — and have the rect and text reference them, so the file has a single place where color is set. The plate takes the night value of `--accent` and the ink takes the night value of `--accent-ink`, both copied verbatim from `assets/palette.css`; optionally add a `@media (prefers-color-scheme: light)` block inside that same style element swapping in the day values of those two tokens from the `:root[data-theme="day"]` block. Read the two values out of `assets/palette.css` rather than typing them from memory — they must match character-for-character, because Task 1's verify gate rejects any color literal in this file that does not already appear in `assets/palette.css` (PAL-02). Head the file with a comment stating which palette token each literal copies and why a copy is unavoidable here: a favicon is fetched as its own document, so it cannot resolve the host page's custom properties, which makes this the one file on the site exempt from CLAUDE.md's `var()`-only colour rule.

A light periwinkle plate carrying near-black digits is deliberate: it reads as a distinct tile against both a white and a dark browser tab strip, so the icon never depends on the optional light-scheme block to stay legible. Note in the comment that this icon follows the operating system's color preference, not the site's `localStorage` theme — a favicon has no access to page state — and that both variants are independently legible, so the two diverging is cosmetic.

Keep the file to drawing markup and that one style element: no active content, no embedded or linked resource, no reference out to any other document. Task 1's verify gate enforces this, and `<threat_model>` T-bpe-01 explains why.

Then add exactly one line to `index.html`, immediately after its `<title>` line (line 7) and before the palette stylesheet link, so the tab icon is declared before any stylesheet or font fetch:

`<link rel="icon" type="image/svg+xml" href="assets/favicon.svg">`

Note the bare `assets/` prefix — index.html sits at the repo root. Task 2 adds the same line with a `../assets/` prefix to the nine tool pages, which live one directory down. Declaring the explicit `type` lets the browser skip content sniffing. Do not add an `.ico` or `apple-touch-icon` fallback: both need a binary raster this repo has no tooling to produce, and the site's CSS baseline already requires `color-mix()` (Chrome 111+, Safari 16.2+), which sits above the SVG-favicon support floor, so a single SVG covers every browser the site already targets.
  </action>
  <verify>
    <automated>cd "$(git rev-parse --show-toplevel)" && xmllint --noout assets/favicon.svg && node -e 'const fs=require("fs");const pal=fs.readFileSync("assets/palette.css","utf8").toLowerCase();const fav=fs.readFileSync("assets/favicon.svg","utf8").toLowerCase();const hex=[...new Set(fav.match(/#[0-9a-f]{3,8}/g)||[])];if(!hex.length)throw new Error("favicon declares no colour at all");const orphan=hex.filter(h=>!pal.includes(h));if(orphan.length)throw new Error("colour(s) absent from palette.css: "+orphan.join(" "));console.log("favicon colours all trace to palette.css:",hex.join(" "))' && node -e 'const s=require("fs").readFileSync("assets/favicon.svg","utf8");const bad=[/<script/i,/<foreignObject/i,/<image/i,/<use/i,/xlink:href/i,/@import/i].filter(r=>r.test(s));if(bad.length)throw new Error("forbidden construct(s) present: "+bad.join(" "));console.log("favicon is self-contained static markup")' && grep -qF '<link rel="icon" type="image/svg+xml" href="assets/favicon.svg">' index.html && echo "TASK-1 OK"</automated>
  </verify>
  <done>`assets/favicon.svg` exists, parses as XML, declares at least one color and every color in it is a literal already present in `assets/palette.css`; the file contains no active content and no external reference; index.html carries the icon link with the root-relative `assets/` prefix.</done>
  <reversibility rating="reversible">A new standalone asset plus one link line; deleting both restores the prior state exactly.</reversibility>
</task>

<task type="auto">
  <name>Task 2: Wire the same icon link into all nine tool pages</name>
  <files>Congruence Wheel/congruence-wheel.html, Diffie-Hellman Key Exchange/diffie-hellman-key-exchange.html, Factorize By Completing The Square/factorize-completing-square.html, Factor Tree/factor-tree.html, RSA/rsa.html, Shors Algorithm/shors-algorithm.html, Sieve Of Eratosthenes/sieve-of-eratosthenes.html, Square And Multiply/square-and-multiply.html, Venn Diagrams/venn-diagrams.html</files>
  <action>
Repeat the icon link Task 1 proved, once per tool page, with the one-level-up prefix these pages need:

`<link rel="icon" type="image/svg+xml" href="../assets/favicon.svg">`

Insert it in each file immediately after that file's `<title>` line (line 7 in all nine) and immediately before its existing `<link rel="stylesheet" href="../assets/palette.css">` line, matching the position Task 1 used on the hub. Every one of these files was checked to contain exactly one `<title>` line, so that anchor is unambiguous; use a scoped `Edit` per file rather than rewriting any page.

The `../` prefix is the whole content of this task and the only thing that differs from Task 1's line — each tool page sits in its own top-level directory one level below `assets/`. Directory names contain spaces, so quote any path used on a command line.

Change nothing else in these nine files. In particular leave the pre-paint theme script, the stylesheet links, the deferred `assets/theme.js` tag, the Google Fonts links, each page's own `<style>` block and every nav list exactly as they are — each page stays a single self-contained file whose only shared dependencies are the `assets/` files and Google Fonts (NAV-02).
  </action>
  <verify>
    <automated>cd "$(git rev-parse --show-toplevel)" && miss=0; n=0; for f in index.html */*.html; do d=$(dirname "$f"); h=$(grep -o 'rel="icon"[^>]*href="[^"]*"' "$f" | grep -o 'href="[^"]*"' | cut -d'"' -f2); if [ -z "$h" ]; then echo "NO-LINK: $f"; miss=1; elif [ ! -f "$d/$h" ]; then echo "BAD-PATH: $f -> $h"; miss=1; else n=$((n+1)); echo "OK: $f -> $d/$h"; fi; done; [ "$n" = 10 ] || { echo "expected 10 linked pages, resolved $n"; miss=1; }; [ "$miss" = 0 ] && echo "TASK-2 OK"; exit $miss</automated>
    <human-check>Serve the site over HTTP from the repo root (`python3 -m http.server 8000`) and open http://localhost:8000/ plus any three tool pages. Confirm the numbered 1-2-3-4 tile appears in each browser tab. Use HTTP rather than opening the files directly: Chrome does not reliably paint tab icons for `file://` pages, so a `file://` check can fail while the markup is correct.</human-check>
  </verify>
  <done>Every one of the ten pages declares an icon link whose href resolves to an existing file relative to that page's own directory; the resolution loop reports ten OK lines and no NO-LINK or BAD-PATH line.</done>
</task>

<task type="auto">
  <name>Task 3: Replace the Congruence Wheel card icon with a two-ring 12-hour clock</name>
  <files>index.html</files>
  <action>
In index.html's `.card-grid`, inside the card linking to `Congruence Wheel/congruence-wheel.html`, replace the single emoji glyph in `<div class="icon">` — the pizza-slice food emoji at codepoint U+1F355 — with an inline SVG clock face. Keep the wrapping `<div class="icon">` so the card's flex layout and gap are unchanged. Leave the card's `<h2>`, its description paragraph and its "Open tool" span exactly as written: the prose already says "concentric rings and wedges", which the new icon now matches.

Root element: `<svg class="wheel-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg">`. The `aria-hidden` and `focusable` attributes keep the decoration out of the accessibility tree and out of tab order, so the card still announces just its heading and description.

Geometry, centred on (12,12) — a deliberate echo of the tool's own diagram, which draws concentric ring boundaries between `HOLE_R` and `OUTER_R` with radial wedge dividers at every `360/N` degrees:

- Two ring circles, `class="wheel-icon-ring"`, `fill="none"`, at r=10.4 and r=6.2. These are the two rings; the band between them is where the residue classes live.
- Exactly twelve tick lines, `class="wheel-icon-tick"`, each spanning the band from r=6.2 out to r=10.4 at angle k*30 degrees for k=0..11, measured clockwise from 12 o'clock. Compute endpoints as x = 12 + r*sin(theta), y = 12 - r*cos(theta), rounded to two decimals. SVG's y-axis points down, so the k=0 tick runs straight up, from (12, 5.8) to (12, 1.6) — check your signs against that one before emitting the rest. Twelve dividers is the whole point of the icon: one boundary per residue class of the additive group of order 12.
- One highlighted wedge, `class="wheel-icon-wedge"`, filling the annular sector from the 12 o'clock tick clockwise to the 1 o'clock tick — this is class 0's wedge, echoing the selected-class highlight in the live tool. Use exactly: `d="M 12 1.6 A 10.4 10.4 0 0 1 17.2 2.99 L 15.1 6.63 A 6.2 6.2 0 0 0 12 5.8 Z"`.
- Two hands from the centre, `class="wheel-icon-hand"`: an hour hand `M 12 12 L 12 8.2` pointing at 12, and a longer minute hand `M 12 12 L 16.68 14.7` pointing at 4. Both stay inside the inner ring so they never collide with the tick band, and the 12-and-4 reading hints at stepping by 4 in this group.
- A pivot dot, `class="wheel-icon-pivot"`, `<circle cx="12" cy="12" r="1">`.

Add the matching rules to index.html's existing `<style>` block, near the current `.card .icon` rule. Every color must be a `var()` reference to a token already declared in `assets/palette.css` — the file declares no literal color today and Task 3's verify gate keeps it that way (PAL-02, PAL-04):

- `.wheel-icon{ display:block; width:1.8rem; height:1.8rem; }` — matches the 1.8rem font-size the eight sibling emoji icons render at, so this card's icon sits level with theirs.
- `.wheel-icon-ring{ fill:none; stroke:var(--text-dim); stroke-width:1.1; }`
- `.wheel-icon-tick{ stroke:var(--text-dim); stroke-width:.8; }`
- `.wheel-icon-wedge{ fill:var(--accent-soft); stroke:var(--accent); stroke-width:.8; }` — `--accent-soft` is the palette's own accent-at-16% token, so the highlight stays readable over the card panel in both themes.
- `.wheel-icon-hand{ stroke:var(--accent); stroke-width:1.4; stroke-linecap:round; }`
- `.wheel-icon-pivot{ fill:var(--accent); }`

Set color only through these class rules, never as a presentation attribute on the SVG elements themselves — that is what keeps the hub's colors resolving from `assets/palette.css` in both themes and keeps index.html free of literal color values (PAL-04).
  </action>
  <verify>
    <automated>cd "$(git rev-parse --show-toplevel)" && node -e 'const s=require("fs").readFileSync("index.html","utf8");const n=[...s].filter(c=>c.codePointAt(0)===0x1f355).length;if(n)throw new Error("food glyph still present x"+n);console.log("food glyph removed")' && [ "$(grep -o 'class="wheel-icon-tick"' index.html | wc -l)" = 12 ] && [ "$(grep -o 'class="wheel-icon-ring"' index.html | wc -l)" = 2 ] && [ "$(grep -o 'class="wheel-icon-wedge"' index.html | wc -l)" = 1 ] && [ "$(grep -o 'class="wheel-icon-hand"' index.html | wc -l)" = 2 ] && node -e 'const s=require("fs").readFileSync("index.html","utf8");const m=s.match(/<svg[^>]*class="wheel-icon"[^>]*>/);if(!m)throw new Error("wheel-icon svg root not found");for(const [re,msg] of [[/aria-hidden="true"/,"aria-hidden"],[/focusable="false"/,"focusable=false"],[/viewBox="0 0 24 24"/,"24x24 viewBox"]])if(!re.test(m[0]))throw new Error("wheel-icon svg root lacks "+msg);console.log("wheel-icon svg root ok")' && if grep -nE '#[0-9a-fA-F]{3,8}\b|rgba?\(|hsla?\(' index.html; then echo "FAIL: literal colour value in index.html"; exit 1; fi && echo "index.html still literal-colour-free" && echo "TASK-3 OK"</automated>
    <human-check>Open the hub and toggle between day and night mode. The Congruence Wheel card's icon reads as a two-ring 12-hour clock with twelve dividers and visible hands, the highlighted wedge is discernible against the card panel in both themes, and the icon sits at the same visual size and baseline as the emoji icons on the cards beside it.</human-check>
  </verify>
  <done>The food glyph is absent from index.html; the card contains a `wheel-icon` SVG with exactly 12 tick elements, 2 ring elements, 1 wedge and 2 hands, marked `aria-hidden="true"` and `focusable="false"` on a 24x24 viewBox; index.html contains no hex, `rgb()`/`rgba()` or `hsl()`/`hsla()` color value.</done>
  <reversibility rating="reversible">Markup and stylesheet rules in one file; restoring the single emoji glyph reverts it.</reversibility>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| page `<head>` -> browser icon fetch | A new subresource URL is declared on ten pages; the browser fetches and renders it outside the page's own document |
| `assets/favicon.svg` -> browser image renderer | A new document is parsed by the browser as an image in a non-interactive context |
| `assets/palette.css` -> copied literals in `assets/favicon.svg` | The site's single source of colour truth is duplicated by hand for the first time |

No network boundary is added: both the new asset and the icon links are same-origin relative paths, and no request leaves the origin. No user input reaches either new artifact — the clock SVG and the favicon are entirely author-written static markup.

## STRIDE Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation Plan |
|-----------|----------|-----------|----------|-------------|-----------------|
| T-bpe-01 | Elevation of Privilege | `assets/favicon.svg` parsed by the browser | low | mitigate | SVG is a scriptable format, and this repo has never shipped one before, so a future edit could introduce active content. Browsers refuse to run script in an image-context SVG, giving defence in depth; on top of that, Task 1's verify gate rejects the file if it contains a scripting element, a foreign-object element, an embedded bitmap, a symbol reference, an xlink reference or a stylesheet import — so the asset is machine-checked to be inert drawing markup plus one inline style element |
| T-bpe-02 | Tampering | ten per-page icon links | low | mitigate | Each link is a fixed same-origin relative path with an explicit `type`, assembled from no runtime input; Task 2's gate resolves every href against its own page's directory on disk, so a typo or a wrong prefix fails the build rather than silently pointing elsewhere |
| T-bpe-03 | Denial of Service | broken icon path -> blank tab icon | low | mitigate | The failure mode of a wrong path is a missing tab icon, not a page error; the ten-page resolution loop catches it before commit, and the human-check over HTTP confirms actual paint |
| T-bpe-04 | Information Disclosure | favicon request | low | accept | The request carries no state and the asset embeds nothing but four digits and two palette colours. There is no user data, no credential and no host information anywhere in this change |
| T-bpe-05 | Tampering | palette literals duplicated into `assets/favicon.svg` | low | mitigate | A hand copy can drift from `assets/palette.css` and silently become an off-palette colour. Task 1's gate extracts every colour literal from the favicon and fails unless each one already appears verbatim in `assets/palette.css`, so drift is caught mechanically; the file header records which token each literal copies |
| T-bpe-06 | Tampering | inline clock SVG in index.html | low | accept | Static author-written markup with no interpolation point and no user input; it introduces no injection surface. Colour is confined to `<style>` rules, and the literal-colour gate on index.html keeps it there |
| T-bpe-SC | Tampering | npm/pip/cargo installs | low | accept | This repository has no package manager and this plan adds zero install tasks, so the package-legitimacy gate has no applicable surface. No `<script src>` and no third-party `<link>` is introduced — the only external resource on the site remains Google Fonts, untouched here |
</threat_model>

<verification>
Run from the repo root, after all three tasks:

```bash
cd "$(git rev-parse --show-toplevel)"

# 1. The asset is valid, inert, and palette-faithful.
xmllint --noout assets/favicon.svg
node -e 'const fs=require("fs");const pal=fs.readFileSync("assets/palette.css","utf8").toLowerCase();const fav=fs.readFileSync("assets/favicon.svg","utf8").toLowerCase();const hex=[...new Set(fav.match(/#[0-9a-f]{3,8}/g)||[])];if(!hex.length)throw new Error("favicon declares no colour at all");const orphan=hex.filter(h=>!pal.includes(h));if(orphan.length)throw new Error("colour(s) absent from palette.css: "+orphan.join(" "));console.log("favicon colours:",hex.join(" "))'
node -e 'const s=require("fs").readFileSync("assets/favicon.svg","utf8");const bad=[/<script/i,/<foreignObject/i,/<image/i,/<use/i,/xlink:href/i,/@import/i].filter(r=>r.test(s));if(bad.length)throw new Error("forbidden construct(s): "+bad.join(" "));console.log("favicon inert")'

# 2. All ten pages link it, and every href resolves from its own directory.
miss=0; n=0
for f in index.html */*.html; do
  d=$(dirname "$f")
  h=$(grep -o 'rel="icon"[^>]*href="[^"]*"' "$f" | grep -o 'href="[^"]*"' | cut -d'"' -f2)
  if [ -z "$h" ]; then echo "NO-LINK: $f"; miss=1
  elif [ ! -f "$d/$h" ]; then echo "BAD-PATH: $f -> $h"; miss=1
  else n=$((n+1)); echo "OK: $f -> $d/$h"; fi
done
[ "$n" = 10 ] || { echo "expected 10, got $n"; miss=1; }
[ "$miss" = 0 ] && echo "all ten pages wired"

# 3. The clock icon replaced the food emoji, with the right element counts.
node -e 'const s=require("fs").readFileSync("index.html","utf8");const n=[...s].filter(c=>c.codePointAt(0)===0x1f355).length;if(n)throw new Error("food glyph still present x"+n);console.log("food glyph removed")'
[ "$(grep -o 'class="wheel-icon-tick"' index.html | wc -l)" = 12 ] && echo "12 residue-class dividers"

# 4. Repo colour rule still holds on the page this change touched.
if grep -nE '#[0-9a-fA-F]{3,8}\b|rgba?\(|hsla?\(' index.html; then echo "FAIL: literal colour in index.html"; exit 1; fi
echo "index.html literal-colour-free"

# 5. No page picked up an unexpected dependency.
grep -n 'script src\|stylesheet' index.html */*.html | grep -v 'assets/palette.css\|assets/site.css\|assets/theme.js\|fonts.googleapis.com\|fonts.gstatic.com' || echo "no new external dependency"
```

Manual (end-of-phase): serve with `python3 -m http.server 8000` from the repo root, open the hub and several tool pages, and confirm the numbered tile shows in every tab and that the clock icon reads correctly in both day and night mode.
</verification>

<success_criteria>
- `assets/favicon.svg` exists, parses, is inert static markup, and every colour literal in it appears verbatim in `assets/palette.css`.
- All ten pages declare `<link rel="icon" type="image/svg+xml" ...>` directly after their `<title>`, with the correct per-page prefix, and all ten hrefs resolve to the asset on disk.
- The numbered 1-2-3-4 tile appears in the browser tab on the hub and on the tool pages when served over HTTP.
- The Congruence Wheel card shows a two-ring, twelve-divider clock face with hands and a highlighted class-0 wedge; the food emoji is gone from index.html.
- index.html declares zero literal colour values; every new colour resolves through `var()` against an `assets/palette.css` token.
- No page gains any dependency beyond the existing `assets/` files and Google Fonts; the other eight cards, the hero, the nav lists and the footer are byte-identical apart from the inserted icon link.
</success_criteria>

<output>
Create `.planning/quick/260927-bpe-fix-two-issues-1-the-site-favicon-square/260927-bpe-SUMMARY.md` when done.
</output>
