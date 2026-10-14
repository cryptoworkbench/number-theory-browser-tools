---
phase: 261014-ttj-qr-code-page-linking-to-the-github-pages
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - QR Code/qr-code.html
  - assets/i18n/qr-code.js
  - .planning/phases/06-multi-language-support/i18n-check.js
  - .planning/phases/06-multi-language-support/i18n-config/qr-code.json
  - CLAUDE.md
  - index.html
  - assets/i18n/hub.js
  - assets/i18n/site.js
  - Sieve Of Eratosthenes/sieve-of-eratosthenes.html
  - Factor Tree/factor-tree.html
  - Venn Diagram/venn-diagram.html
  - Euclidean Algorithm/euclidean-algorithm.html
  - Least Common Multiple/least-common-multiple.html
  - Chinese Remainder Theorem/chinese-remainder-theorem.html
  - Equivalence Wheel/equivalence-wheel.html
  - Eulers Totient/eulers-totient.html
  - Cayley Table/cayley-table.html
  - Cyclic Groups/cyclic-groups.html
  - Group Isomorphism/group-isomorphism.html
  - Square And Multiply/square-and-multiply.html
  - Diffie-Hellman Key Exchange/diffie-hellman-key-exchange.html
  - Elliptic Curve Diffie-Hellman/elliptic-curve-diffie-hellman.html
  - RSA/rsa.html
  - Fermats Method/fermats-method.html
  - Shors Algorithm/shors-algorithm.html
autonomous: true
requirements: [QUICK-261014-ttj]

estimate:
  tokens: 145000
  raw_tokens: 145000
  tasks: 3
  confidence: low

must_haves:
  truths:
    - "Opening QR Code/qr-code.html shows a QR code whose modules equal, one for one, the output of qrencode -l M for https://cryptoworkbench.github.io/number-theory-browser-tools/ (version 4, 33x33 modules)"
    - "The QR code shows dark modules on a light plate, with a light 4-module quiet zone, in both the day and the night theme. It is never inverted."
    - "The QR page's tab title, heading, caption and QR aria-label follow the language switcher in all 31 languages. The URL link (text = href = the Pages URL) is identical in every language and stays LTR in he/ar/ckb."
    - "Branch qr-hub = main + 2 commits: (1) the QR page commit, (2) a hub card on index.html linking to the QR page. There is no Tools-menu entry for the QR page on qr-hub."
    - "Branch qr-nav = main + 2 commits: (1) a cherry-pick of qr-hub's first commit with an identical tree, (2) a QR Code Tools-menu entry on every page's header, marked active on the QR page itself. There is no hub card on qr-nav."
    - "On each branch, i18n-check --all reports no finding beyond the 112 pre-existing Cyclic Groups (English-first) ones. --api, --persistence and --smoke pass."
    - "The run ends checked out on main with main unchanged. Nothing is pushed, and the untracked undefined-*.png files are untouched."
  artifacts:
    - path: "QR Code/qr-code.html"
      provides: "QR page: canonical header, inline SVG QR (one path), translated heading/caption/title/aria-label, URL link"
      contains: "class=\"qr-modules\""
    - path: "assets/i18n/qr-code.js"
      provides: "the 'qr' namespace (title, heading, caption, imgLabel) in all 31 languages"
      contains: "NT.i18n.register('qr'"
    - path: ".planning/phases/06-multi-language-support/i18n-check.js"
      provides: "PAGES row for the QR page; QR acronym on both Latin-notation allow-lists; ACTIVE-LINK rule for pages without a nav link; nav-link counts derived from the site catalog"
      contains: "qr-code.html"
    - path: ".planning/phases/06-multi-language-support/i18n-config/qr-code.json"
      provides: "allowLiteral entry for the untranslated URL link text"
    - path: "index.html (branch qr-hub only)"
      provides: "QR Code hub card in its own final tool-group section"
    - path: "assets/i18n/site.js (branch qr-nav only)"
      provides: "the site.nav QR label in all 31 languages"
  key_links:
    - from: "QR Code/qr-code.html"
      to: "assets/i18n/qr-code.js"
      via: "plain <script src> after ../assets/nt-i18n.js and ../assets/i18n/site.js; data-i18n / data-i18n-aria-label bindings"
      pattern: "assets/i18n/qr-code.js"
    - from: "i18n-check.js PAGES"
      to: "QR Code/qr-code.html + assets/i18n/qr-code.js"
      via: "{ file, dataFile, ns: 'qr', slug: 'qr-code' } row so --all covers the page"
      pattern: "slug: \"qr-code\""
    - from: "index.html card (qr-hub) / every header nav (qr-nav)"
      to: "QR Code/qr-code.html"
      via: "relative href (QR Code/qr-code.html from root, ../QR Code/qr-code.html from tool dirs)"
      pattern: "QR Code/qr-code.html"
---

<objective>
Add a QR-code page to the site and deliver it on two independent branches forked from `main`, so the user can compare the two placements:
- `qr-hub`: the QR page plus a hub card.
- `qr-nav`: the identical QR page commit plus a Tools-menu entry on every page.

The page's centrepiece encodes https://cryptoworkbench.github.io/number-theory-browser-tools/ (the live GitHub Pages URL, verified via `gh api`). It is generated once at authoring time with `/usr/bin/qrencode` and embedded as inline SVG. There is no runtime QR JS.

Purpose: a visitor at a desk can open the site on their phone by scanning the code. The two branches let the user choose where that page is surfaced.
Output: branch `qr-hub` (2 commits), branch `qr-nav` (2 commits), repo left on `main`.

Locked implementation decisions (from the orchestrator's planning context, there is no CONTEXT.md for this quick task). Each is referenced below as L-NN:
- L-01: QR generated once with qrencode, embedded as inline SVG, a single compact path. EC level M, 4-module quiet zone, `shape-rendering="crispEdges"`. No external or runtime JS.
- L-02: dark-on-light in BOTH themes via palette tokens through `var()`. No literal colour in the page `<style>`. The style block ends with a `:root[dir="rtl"]` rule.
- L-03: the page shows the URL as a clickable link (untranslated) plus a minimal translated set: title, heading, caption, and the QR aria-label.
- L-04: full canonical pattern: palette.css + site.css, theme pre-paint script, canonical header copied from the Sieve, nt-i18n.js + site.js + the new qr-code.js data file in 31 languages, and a PAGES row. i18n-check must pass on both branches.
- L-05: branch mechanics. qr-hub commit 1 = page + data file + PAGES row and nothing hub- or nav-specific. Commit 2 = hub card. qr-nav = `git checkout -q -b qr-nav main` + cherry-pick of commit 1 + nav commit. End on main, no push, untracked png files untouched.
- L-06: conventional commit messages ending with the attribution trailer.
</objective>

<execution_context>
@~/.claude/gsd-core/workflows/execute-plan.md
@~/.claude/gsd-core/templates/summary.md
</execution_context>

<context>
@CLAUDE.md
@.claude/CLAUDE.md
@.planning/STATE.md

# Canonical page pattern + header to copy (head lines 1-15, header block)
@Sieve Of Eratosthenes/sieve-of-eratosthenes.html
# Static page with no inline tool script: the hub's include tail (nt-i18n.js, site.js, hub.js), card markup + hub-icon CSS
@index.html
# Data-file shape (header comment, register call, 31 language blocks in switcher order)
@assets/i18n/site.js
@assets/i18n/hub.js
@assets/palette.css

Checker facts (all verified against main during planning; the checker is `.planning/phases/06-multi-language-support/i18n-check.js`, ~4190 lines, so read only the ranges named):
- The usage line is ~4145. With no arguments it prints usage and exits 1, so the static suite is `--all` (optionally `--report`). The other modes are `--api`, `--persistence` and `--smoke` (headless Chrome, takes about 1 minute).
- Baseline on main:
  - `--all --report` gives exactly 112 findings, every one about Cyclic Groups (English-first strings, per the user's standing preference). Filtering out lines containing `cyclicGroups` or `Cyclic Groups` leaves only the REPORT line.
  - `--api` passes (1292 assertions) and `--persistence` passes (561).
  - `--smoke` FAILS before launching Chrome: `buildExpected: expected 19 nav hrefs, extracted 18`. The stale 19 was left behind by commit 0655f1a, which removed the `_Cyclic Groups` nav entry. With the count corrected, smoke passes (135 assertions, mutant detected, cross-session OK).
- PAGES table: ~line 2378, rows `{ file, dataFile, ns, slug }`.
- SCRIPT_LATIN_NOTATION is ~line 2493 and ZGH_KEEP ~line 2547. Both are sorted by code point and both lack "QR". Every non-Latin SCRIPT_RULES entry (ru el he hi sa ar ckb zh ja ko) uses SCRIPT_LATIN_NOTATION, and zgh-Tfng uses ZGH_KEEP.
- `checkSwitcherPresent` (~3334) hard-codes `navRefs.length !== 18`, and `buildExpected` (~364) hard-codes `navHrefs.length !== 19`.
- `checkHeader` (~3370):
  - It compares each page's header, normalised (hrefs resolved to repo-root paths, ` is-active` stripped, whitespace collapsed), with the Sieve's.
  - It then requires exactly 1 `is-active` nav link that resolves to the page itself. A page absent from the nav therefore fails today.
  - `assets/theme.js:161` already falls back to the first nav link when no link is active, so a page with no active link is safe at runtime.
- `readConfig(slug)` loads `.planning/phases/06-multi-language-support/i18n-config/<slug>.json`. Its `allowLiteral` map is keyed by the exact trimmed text, with a reason string as the value. A prose text node with no `data-i18n` and no allowLiteral entry is an UNTRANSLATED-MARKUP finding. The URL text counts as prose.
- `decorateLinks` in `assets/nt-i18n.js` skips hrefs with a scheme, so the absolute https link is never given `?lang=`.
- `module.exports` includes `PAGES` and `zghTransliterate(run)`. The latter transliterates ONE letter run (it keeps ZGH_KEEP words Latin). Apply it per run with `value.replace(/[\p{L}ʷ]+/gu, w => zghTransliterate(w))` to derive each zgh-Tfng value from its zgh-Latn value.
- `Cyclic Groups/zz-old.html` is a tracked stale backup that carries the header but is not in PAGES. Precedent commits 9b40e4b and 0655f1a changed the nav on every page but never touched it, so leave it untouched.
- The palette has no theme-invariant light/dark pair. In night: `--text` #e6e8ec is light and `--bg-1` #111318 is dark. In day: `--surface` #ffffff is light and `--text` #1b1f27 is dark.
- Tools: `/usr/bin/qrencode` 4.1.1 and `/usr/bin/google-chrome` are present. `zbarimg` is absent, so correctness is proven by the module round-trip below.
- The `-l M -m 0 -t ASCII` output for this 62-byte URL is 33 rows ("##" = dark module, two spaces = light) with 591 dark modules.
</context>

<tasks>

<task type="tracer">
  <name>Task 1: QR page end to end on branch qr-hub (commit 1, cherry-pickable)</name>
  <files>QR Code/qr-code.html, assets/i18n/qr-code.js, .planning/phases/06-multi-language-support/i18n-check.js, .planning/phases/06-multi-language-support/i18n-config/qr-code.json, CLAUDE.md</files>
  <read_first>Sieve Of Eratosthenes/sieve-of-eratosthenes.html (lines 1-15 and the header block), index.html (style block 14-210 and the last 10 lines), assets/i18n/shors-algorithm.js (first 25 lines: header comment + register shape), assets/palette.css, i18n-check.js ranges 2378-2400, 2493-2551, 3334-3410, 355-367</read_first>
  <action>
**Branch (L-05).**
1. Confirm `git branch --show-current` is `main`.
2. Confirm that neither `qr-hub` nor `qr-nav` exists (`git rev-parse --verify -q <name>` fails for both). If either exists, STOP and report; never overwrite a branch.
3. Run `git checkout -q -b qr-hub main`.

**QR geometry (L-01).**
1. Run `qrencode -l M -m 0 -t ASCII 'https://cryptoworkbench.github.io/number-theory-browser-tools/'`.
2. Convert its 33 rows with a throwaway Node script in the session scratchpad (never committed) into one SVG path `d` string:
   - For every maximal horizontal run of dark modules in row y, starting at column x with length w, append `M{x} {y}h{w}v1h-{w}z`.
   - All values are integers, with a single space between x and y. No commas, no separators between runs, and rows in top-to-bottom order.
   - The Task 1 verify command parses exactly this run format.

**`QR Code/qr-code.html` (L-02, L-03, L-04).** A new top-level directory and page.

Head:
- Copy the Sieve's head order exactly: `<!DOCTYPE html>`, `<html lang="en">`, the `meta charset`, the identical one-line theme pre-paint `<script>`, the viewport meta, `<title data-i18n="qr.title">QR Code — Number Theory Tools</title>`, `<link rel="icon" ... href="../assets/favicon.svg">`, `../assets/palette.css` then `../assets/site.css`, `<script defer src="../assets/theme.js">`, the same Google Fonts preconnect + stylesheet link, then the page `<style>`.
- There is no meta description, because no other page has one.

Body:
1. The canonical header, copied byte-for-byte from the Sieve with these changes:
   - The brand href stays `../index.html`.
   - The Sieve link becomes `../Sieve Of Eratosthenes/sieve-of-eratosthenes.html`.
   - Every other nav href keeps its `../<Dir>/<file>.html` form.
   - ` is-active` is removed, so there is NO active link: the QR page has no nav entry on this branch.
   - Do not add a nav link for the QR page here; that belongs to Task 3 only.
2. A `<main class="qr-page">` containing:
   - `<h1 data-i18n="qr.heading">Open this site on your phone</h1>`.
   - A figure/div `.qr-plate` holding the inline SVG `<svg class="qr-svg" viewBox="-4 -4 41 41" shape-rendering="crispEdges" role="img" aria-label="QR code for the address of this site" data-i18n-aria-label="qr.imgLabel" focusable="false" xmlns="http://www.w3.org/2000/svg">`. It contains `<rect class="qr-quiet" x="-4" y="-4" width="41" height="41"/>`, which paints the 4-module quiet zone plus the background light, then `<path class="qr-modules" d="…"/>`, with `class` written BEFORE `d`. The SVG has no `<title>` child (a text node would need its own key) and no fill/stroke attributes, because colour comes from CSS.
   - `<p class="qr-caption" data-i18n="qr.caption">Point your phone's camera at the code to open every tool there.</p>`.
   - `<a class="qr-url" href="https://cryptoworkbench.github.io/number-theory-browser-tools/" translate="no">https://cryptoworkbench.github.io/number-theory-browser-tools/</a>`. Its text is the URL itself, not translated. There is no `target` attribute.
3. The body ends like index.html: `<script src="../assets/nt-i18n.js"></script>`, `<script src="../assets/i18n/site.js"></script>`, `<script src="../assets/i18n/qr-code.js"></script>`. There is no inline tool script, because the page has no dynamic text (hub precedent). Each script is plain and non-deferred.

Style block (no literal colour anywhere, no hex, `rgb()`, `hsl()` or named colour; every value is `var()` or `color-mix()` of palette tokens):
- Declare the page-local alias pair: `:root{ --qr-light: var(--text); --qr-dark: var(--bg-1); }` and `:root[data-theme="day"]{ --qr-light: var(--surface); --qr-dark: var(--text); }`. This keeps dark modules on a light plate in BOTH themes. Never invert the code for night mode, because many phone scanners fail on light-on-dark QR codes. This is the CLAUDE.md "local alias built entirely from var()" pattern.
- `.qr-quiet{ fill: var(--qr-light) }` and `.qr-modules{ fill: var(--qr-dark) }`.
- `.qr-plate`: `display:inline-block`, `line-height:0`, `background: var(--qr-light)`, `border: 1px solid var(--panel-border)`, `border-radius: var(--radius-card)`, `overflow:hidden`.
- `.qr-svg`: `display:block`, `width:min(328px, 78vw)`, `height:auto`, `aspect-ratio:1`. 328 = 8 px per module across 41.
- `.qr-page`: centred column, `max-width ~560px`, `text-align:center`, padding like the hub hero.
- h1: `var(--font-serif)`, about `clamp(1.75rem, 4vw, 2.5rem)`, with no letter-spacing, so Arabic-script headings stay joined.
- `.qr-caption`: `color: var(--text-dim)`.
- `.qr-url`: `var(--font-mono)`, `color: var(--accent)`, `overflow-wrap:anywhere`, so it wraps at 375px.
- The LAST rule of the style block keeps the diagram and URL left-to-right, per the per-page convention: `:root[dir="rtl"] .qr-plate, :root[dir="rtl"] .qr-url{ direction: ltr; unicode-bidi: isolate; }`. site.css already keeps SVG LTR.

**`assets/i18n/qr-code.js`.**
- A header comment in the style of the other data files: the 'qr' namespace, its four keys, classic script, the load-order note.
- Then an IIFE with `"use strict"` whose only statement is `NT.i18n.register('qr', { … })`.
- Language blocks in switcher order: nl en de fr es it pl pt-BR pt-PT sv nb ro hu lv ru el he hi ar sq sw zh ja ko id zgh-Latn zgh-Tfng ku ckb sa la.
- Each block has exactly the keys `title`, `heading`, `caption`, `imgLabel`. The English values are exactly the markup texts above. `imgLabel` is "QR code for the address of this site".

Translate all 31 languages with these rules:
- Every value is plain text with no markup and no digits.
- "QR" stays Latin uppercase in every language. It becomes legal notation once it is added to the allow-lists below.
- Script and letter rules per language:
  - ru, el, he, hi, sa, ar, ckb, zh, ja and ko values use their own script apart from "QR".
  - zh/ja use full-width punctuation only in prose.
  - ckb uses the Sorani letters ک ی ە ھ, never ك ي ة ه.
  - ar is unvocalized, with no tatweel.
  - ku uses Hawar letters.
  - la uses ASCII only, with v for consonantal u and never j.
  - sa uses the Classical Devanagari repertoire, and the danda । ends caption and imgLabel sentences.
  - zgh-Latn uses IRCAM Latin letters, and every zgh-Tfng value is derived from zgh-Latn with `zghTransliterate` per letter run (see context).
- No translated value may equal its English value (IDENTICAL-TO-EN).
- There are no formulas, so he/ar/ckb values need no bidi isolates.

**`.planning/phases/06-multi-language-support/i18n-config/qr-code.json`.**
- `{ "allowLiteral": { "https://cryptoworkbench.github.io/number-theory-browser-tools/": "<reason>" } }`.
- The reason: the link text is the site's own address, the same string as the href and the QR payload, kept identical in every language (like a URL or code identifier).

**`i18n-check.js` (generic rules only; nothing hub- or nav-specific, so this commit cherry-picks cleanly):**
- (a) Append the PAGES row `{ file: "QR Code/qr-code.html", dataFile: "assets/i18n/qr-code.js", ns: "qr", slug: "qr-code" }` after the Shor row.
- (b) Insert "QR" into SCRIPT_LATIN_NOTATION and into ZGH_KEEP, right after "QFT" in each to keep code-point order. It is an acronym like RSA/SVG.
- (c) Generalise the ACTIVE-LINK rule in `checkHeader`:
  - Compute the page's repo-relative POSIX path. Call the page "nav-linked" when the normalised Sieve header contains `href="<that path>"`.
  - A nav-linked page keeps today's rule unchanged: exactly 1 is-active link whose basename is the page.
  - A page that is not nav-linked must carry 0 is-active links. Otherwise push `ACTIVE-LINK <relPath>: page has no nav link, expected 0 is-active nav links, found N`.
  - Update the surrounding comment to say this.
- (d) Replace the two hard-coded nav counts (18 in `checkSwitcherPresent`, the stale 19 in `buildExpected`, in both the comparison and the message) with one memoised helper defined near the page table, e.g. `expectedNavLinkCount()`. It counts the keys of `loadCatalog().site.en` that start with `nav.`, excluding `nav.label`, and loads the catalog once per process. It is 18 on main and qr-hub, and follows automatically on qr-nav. This also repairs the pre-existing `--smoke` failure on both branches.

**`CLAUDE.md`:** add one bullet to the "Repository layout" tool list, after the Cyclic Groups bullet: `QR Code/qr-code.html` is a QR code of the site's live GitHub Pages address for opening the site on a phone. It is static markup, and its inline SVG was generated once with qrencode.

**Check and commit.**
1. Run the Task 1 verify.
2. Capture screenshots for the visual check:
   - `google-chrome --headless=new --disable-gpu --hide-scrollbars --window-size=900,1000 --screenshot=<scratchpad>/qr-<theme>-<lang>.png "file://$PWD/QR%20Code/qr-code.html?theme=<theme>&lang=<lang>"` for night/en, day/en and night/ar.
   - Read each PNG and confirm the following. If any fails, fix it and re-check.
     - The plate is light with dark modules in both themes.
     - The quiet zone is visibly light all round.
     - The header shows no active item.
     - ar is right-to-left with the QR and URL unmirrored.
3. Commit with `git add` of EXACTLY these 5 paths (never `-A` or `.`; the `.planning/quick/` files and `undefined-*.png` must stay out):
   - `QR Code/qr-code.html`
   - `assets/i18n/qr-code.js`
   - `.planning/phases/06-multi-language-support/i18n-check.js`
   - `.planning/phases/06-multi-language-support/i18n-config/qr-code.json`
   - `CLAUDE.md`
4. Commit message (L-06):
   - Subject: `feat(qr-code): a QR code page for opening the site on a phone`.
   - Body bullets: the page and its 31-language data file; QR generated once with qrencode (level M, version 4, quiet zone 4) as one inline SVG path, dark on light in both themes; i18n-check gets the PAGES row, QR on the notation allow-lists, the no-nav-link ACTIVE-LINK rule, and nav counts derived from the catalog (fixing the stale smoke count).
   - End with the attribution trailer lines from the executor's own system reminder (at minimum `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`).
5. Record the commit SHA as C1 for Task 3.
  </action>
  <verify>
    <automated>node -e 'const fs=require("fs"),cp=require("child_process");const U="https://cryptoworkbench.github.io/number-theory-browser-tools/";const html=fs.readFileSync("QR Code/qr-code.html","utf8");const m=/<path[^>]*class="qr-modules"[^>]*\sd="([^"]+)"/.exec(html);if(!m){console.log("NO qr-modules path");process.exit(1);}const got=new Set();for(const r of m[1].matchAll(/M(\d+) (\d+)h(\d+)v1h-\3z/g)){for(let i=0;i<+r[3];i++)got.add((+r[1]+i)+","+r[2]);}const rows=cp.execFileSync("qrencode",["-l","M","-m","0","-t","ASCII",U]).toString().split("\n").filter(Boolean);const want=new Set();rows.forEach((row,y)=>{for(let x=0;x<row.length/2;x++)if(row.substr(2*x,2)==="##")want.add(x+","+y);});const same=got.size===want.size&&[...want].every(k=>got.has(k));const vb=new RegExp("viewBox=\"-4 -4 "+(rows.length+8)+" "+(rows.length+8)+"\"").test(html);const link=html.split(U).length-1===2;console.log(same&&vb&&link?"QR-MATCH "+rows.length+"x"+rows.length+" modules="+want.size:"QR-MISMATCH got="+got.size+" want="+want.size+" viewBox="+vb+" urlx2="+link);process.exit(same&&vb&&link?0:1)'</automated>
    <automated>node -e 'const h=require("fs").readFileSync("QR Code/qr-code.html","utf8");const s=(h.match(/<style>([\s\S]*?)<\/style>/)||[])[1]||"";const svg=(h.match(/<svg class="qr-svg"[\s\S]*?<\/svg>/)||[""])[0];const bad=(s.match(/#[0-9a-fA-F]{3,8}\b|\brgba?\(|\bhsla?\(|:\s*(white|black|red|blue|green|gray|grey|silver)\b/g)||[]).concat(svg.match(/\b(fill|stroke)="/g)||[]);const rtlLast=/:root\[dir="rtl"\][^{}]*\{[^{}]*\}\s*$/.test(s.trim());const crisp=/shape-rendering="crispEdges"/.test(svg);if(bad.length||!rtlLast||!crisp){console.log("STYLE-FAIL",bad,"rtlLast="+rtlLast,"crisp="+crisp);process.exit(1)}console.log("STYLE-OK")'</automated>
    <automated>R="$(node .planning/phases/06-multi-language-support/i18n-check.js --all --report)" && echo "$R" | grep -q '^I18N-CHECK REPORT' && test "$(echo "$R" | grep -v -e cyclicGroups -e 'Cyclic Groups' -e '^I18N-CHECK REPORT' | wc -l)" -eq 0 && node .planning/phases/06-multi-language-support/i18n-check.js --header --includes --no-locale-number-format --literals "QR Code/qr-code.html" && node .planning/phases/06-multi-language-support/i18n-check.js --api && node .planning/phases/06-multi-language-support/i18n-check.js --persistence && node .planning/phases/06-multi-language-support/i18n-check.js --smoke</automated>
    <automated>test "$(git branch --show-current)" = qr-hub && test "$(git rev-list --count main..qr-hub)" -eq 1 && test "$(git diff-tree --no-commit-id --name-only -r HEAD)" = "$(printf '%s\n' '.planning/phases/06-multi-language-support/i18n-check.js' '.planning/phases/06-multi-language-support/i18n-config/qr-code.json' 'CLAUDE.md' 'QR Code/qr-code.html' 'assets/i18n/qr-code.js')" && git log --oneline main..qr-hub</automated>
    <human-check>End of phase: with the QR page open on screen, scan it with a phone camera and confirm it opens https://cryptoworkbench.github.io/number-theory-browser-tools/ in both the day and the night theme.</human-check>
  </verify>
  <done>
- Branch qr-hub exists with exactly 1 commit over main, containing exactly the 5 listed files.
- The embedded path equals qrencode's level-M matrix module for module, inside a 41-unit viewBox with a 4-module light quiet zone.
- The page style block has no literal colour, and its last rule is the `:root[dir="rtl"]` LTR rule.
- The static i18n suite shows only the 112 pre-existing Cyclic Groups findings. --header/--includes/--literals pass for the QR page, and --api, --persistence and --smoke pass.
- The screenshots show dark-on-light in both themes and an unmirrored QR/URL in Arabic.
  </done>
</task>

<task type="auto">
  <name>Task 2: Hub card for the QR page on branch qr-hub (commit 2)</name>
  <files>index.html, assets/i18n/hub.js</files>
  <read_first>index.html (hub-icon CSS block ~158-200, the crypto section ~495-583), assets/i18n/hub.js (header comment and the en block's card.shor lines)</read_first>
  <action>
Still on qr-hub (L-05).

**index.html:**
- Add a new final `<section class="tool-group" aria-labelledby="hub-card-qr-title">` after the closing tag of the crypto section and before `<p class="hub-note">`.
  - The section has no h2 group title. This is Claude's discretion: it keeps the hub to the two keys named in the planning context. The existing `.tool-group` border-top already separates it from the crypto group.
  - It holds one `<div class="card-grid">` with one `<a class="card" href="QR Code/qr-code.html">` built exactly like the other cards:
    - `<div class="icon">` holding an `<svg class="hub-icon qr-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg">`, a line-diagram mini QR:
      - three finder squares as outlined rects with class `qr-icon-finder`, each with a small filled centre with class `qr-icon-eye`, at the top-left, top-right and bottom-left;
      - a handful of small module squares with class `qr-icon-module` in the bottom-right quadrant.
    - `<h3 id="hub-card-qr-title" data-i18n="hub.card.qr.title">QR Code</h3>`.
    - `<p data-i18n="hub.card.qr.desc">A QR code of this site's address — scan it with your phone's camera and every tool opens there.</p>`.
- In the hub-icon CSS block, add role-token-only rules after the shor-icon rules:
  - `.qr-icon-finder{ fill:none; stroke:var(--text-dim); stroke-width:1.2; }`
  - `.qr-icon-eye{ fill:var(--role-input); }`
  - `.qr-icon-module{ fill:var(--role-result); }`
- Use no literal colours. Leave the hero lede and footer counts ("seventeen tools") unchanged, because the QR page is not a tool.

**assets/i18n/hub.js:**
- In all 31 language blocks, add `'card.qr.title'` and `'card.qr.desc'` right after that block's `'card.shor.desc'` line, fixing the trailing comma on the previous line.
- English values are exactly the markup texts above. Translate the rest under the same per-language rules as Task 1: QR stays Latin, own script, ckb letters, sa danda ending the desc sentence, la ASCII with no j, no digits, no value identical to English.
- zgh-Tfng values are transliterated from zgh-Latn per letter run with `zghTransliterate`.
- Update the file's header comment to mention the QR Code card (`card.qr.title` / `card.qr.desc`) besides the seventeen tool cards.

**Commit.**
1. Run the Task 2 verify.
2. Screenshot index.html at `?theme=night&lang=en` and `?theme=day&lang=ja` with the same headless-Chrome command shape as Task 1, using `--window-size=1200,2600`. Read both and confirm that the QR card renders as a peer of the other cards with its icon visible.
3. `git add index.html assets/i18n/hub.js` (only these two).
4. Commit with subject `feat(site): a hub card for the QR code page`, a short body (the card, its own section after the crypto group, the hub keys in all thirty-one languages), and the same attribution trailer as Task 1.
  </action>
  <verify>
    <automated>R="$(node .planning/phases/06-multi-language-support/i18n-check.js --all --report)" && echo "$R" | grep -q '^I18N-CHECK REPORT' && test "$(echo "$R" | grep -v -e cyclicGroups -e 'Cyclic Groups' -e '^I18N-CHECK REPORT' | wc -l)" -eq 0 && node .planning/phases/06-multi-language-support/i18n-check.js --header --includes --literals index.html "QR Code/qr-code.html" && node .planning/phases/06-multi-language-support/i18n-check.js --smoke</automated>
    <automated>test "$(grep -o "'card.qr.title'" assets/i18n/hub.js | wc -l)" -eq 31 && test "$(grep -o "'card.qr.desc'" assets/i18n/hub.js | wc -l)" -eq 31 && test "$(grep -o 'href="QR Code/qr-code.html"' index.html | wc -l)" -eq 1 && node -e 'const h=require("fs").readFileSync("index.html","utf8");const s=(h.match(/<style>([\s\S]*?)<\/style>/)||[])[1]||"";const bad=s.match(/#[0-9a-fA-F]{3,8}\b|\brgba?\(|\bhsla?\(/g);if(bad){console.log("LITERAL-COLOR",bad);process.exit(1)}console.log("INDEX-STYLE-OK")'</automated>
    <automated>test "$(git branch --show-current)" = qr-hub && test "$(git rev-list --count main..qr-hub)" -eq 2 && test "$(git diff --name-only qr-hub~1 qr-hub)" = "$(printf '%s\n' 'assets/i18n/hub.js' 'index.html')" && ! git grep -q "nav.qr" qr-hub -- index.html assets/i18n/site.js "QR Code/qr-code.html" && git log --oneline main..qr-hub</automated>
  </verify>
  <done>
- qr-hub = main + 2 commits. The second touches only index.html and assets/i18n/hub.js.
- The hub shows a QR Code card in its own final section linking to `QR Code/qr-code.html`, with its title and desc in all 31 languages.
- There is no Tools-menu entry anywhere on qr-hub.
- The i18n suite shows no new findings, and smoke passes.
  </done>
</task>

<!-- planner-discipline-allow: nav.qr -->
<!-- planner-discipline-allow: card.qr -->
<task type="auto">
  <name>Task 3: Branch qr-nav: cherry-pick the QR page, add the Tools-menu entry everywhere, return to main</name>
  <files>assets/i18n/site.js, index.html, QR Code/qr-code.html, Sieve Of Eratosthenes/sieve-of-eratosthenes.html, Factor Tree/factor-tree.html, Venn Diagram/venn-diagram.html, Euclidean Algorithm/euclidean-algorithm.html, Least Common Multiple/least-common-multiple.html, Chinese Remainder Theorem/chinese-remainder-theorem.html, Equivalence Wheel/equivalence-wheel.html, Eulers Totient/eulers-totient.html, Cayley Table/cayley-table.html, Cyclic Groups/cyclic-groups.html, Group Isomorphism/group-isomorphism.html, Square And Multiply/square-and-multiply.html, Diffie-Hellman Key Exchange/diffie-hellman-key-exchange.html, Elliptic Curve Diffie-Hellman/elliptic-curve-diffie-hellman.html, RSA/rsa.html, Fermats Method/fermats-method.html, Shors Algorithm/shors-algorithm.html</files>
  <read_first>assets/i18n/site.js (header comment and the nav.shor line of each language block)</read_first>
  <action>
**Branch (L-05).**
1. Run `git checkout -q -b qr-nav main`.
2. Run `git cherry-pick C1`, the SHA recorded in Task 1, i.e. `qr-hub~1`. Commit 1 touches no file that main changed, so it must apply cleanly. If it conflicts, abort and report.
3. Do not bring over anything from qr-hub's second commit.

**assets/i18n/site.js:**
- In all 31 language blocks, insert `'nav.qr': '<label>',` on the line right after that block's `'nav.shor'` line. The English label is `QR Code`.
- Translate it as a short noun phrase for "QR code" in each language, under the same per-language rules as Task 1:
  - QR stays Latin.
  - ru/el/he/hi/sa/ar/ckb/zh/ja/ko are in their own script.
  - No value is identical to English "QR Code".
  - zgh-Tfng is transliterated from zgh-Latn via `zghTransliterate` per run.
- Update the header comment: "nav labels for all eighteen pages" becomes nineteen, and add a sentence saying the QR Code label (`nav.qr`) was added by quick task 261014-ttj in all thirty-one languages.

**Nav link on every page.** Use a throwaway Node script in the session scratchpad (never committed). For each `file` in `require('./.planning/phases/06-multi-language-support/i18n-check.js').PAGES`, which is now index.html, the 17 tool pages and the QR page:
- Find the single line containing `data-i18n="site.nav.shor"`.
- Insert directly after it a line with the same indentation: `<a href="HREF" class="site-nav-link" data-i18n="site.nav.qr">QR Code</a>`, where HREF is:
  - `QR Code/qr-code.html` for index.html;
  - `qr-code.html` for `QR Code/qr-code.html`, whose class is `site-nav-link is-active` because it is the page's own entry;
  - `../QR Code/qr-code.html` for every other page.
- The script asserts exactly one anchor line per file and fails loudly otherwise.
- Leave `Cyclic Groups/zz-old.html` untouched (not in PAGES; see context).
- Nothing in i18n-check.js changes on this branch. The nav count derived in Task 1 becomes 19 automatically, and the QR page is now nav-linked, so it must carry exactly one active link.

**Check and commit.**
1. Run the Task 3 verify.
2. Screenshot the QR page at `?theme=night&lang=en` with the Tools menu closed. Read it and confirm the header renders normally.
3. `git add` exactly `assets/i18n/site.js` and the 19 PAGES html files. Never `-A`.
4. Commit with subject `feat(site): the QR code page in the Tools menu on every page`, a short body (the nav label in all thirty-one languages, the link after Shor's Algorithm on every page and active on the QR page, zz-old.html left as is), and the same attribution trailer as Task 1.
5. Finally run `git checkout -q main`. Do not push and do not touch `undefined-*.png`.
  </action>
  <verify>
    <automated>test "$(git branch --show-current)" = qr-nav && R="$(node .planning/phases/06-multi-language-support/i18n-check.js --all --report)" && echo "$R" | grep -q '^I18N-CHECK REPORT' && test "$(echo "$R" | grep -v -e cyclicGroups -e 'Cyclic Groups' -e '^I18N-CHECK REPORT' | wc -l)" -eq 0 && node .planning/phases/06-multi-language-support/i18n-check.js --header --all && node .planning/phases/06-multi-language-support/i18n-check.js --api && node .planning/phases/06-multi-language-support/i18n-check.js --persistence && node .planning/phases/06-multi-language-support/i18n-check.js --smoke</automated>
    <automated>test "$(grep -o "'nav.qr'" assets/i18n/site.js | wc -l)" -eq 31 && node -e 'const fs=require("fs");const P=require("./.planning/phases/06-multi-language-support/i18n-check.js").PAGES;let bad=0;for(const p of P){const h=fs.readFileSync(p.file,"utf8");const n=(h.match(/data-i18n="site\.nav\.qr"/g)||[]).length;if(n!==1){console.log("NAV-COUNT",p.file,n);bad++;}}const q=fs.readFileSync("QR Code/qr-code.html","utf8");if(!/<a href="qr-code\.html" class="site-nav-link is-active" data-i18n="site\.nav\.qr">/.test(q)){console.log("QR-NOT-ACTIVE");bad++;}console.log(bad?"NAV-FAIL":"NAV-OK "+P.length+" pages");process.exit(bad?1:0)'</automated>
    <automated>test "$(git rev-list --count main..qr-nav)" -eq 2 && git diff --quiet qr-hub~1 qr-nav~1 && test "$(git log -1 --format=%s qr-hub~1)" = "$(git log -1 --format=%s qr-nav~1)" && test "$(git merge-base qr-hub qr-nav)" = "$(git rev-parse main)" && ! git grep -q "card.qr" qr-nav -- index.html assets/i18n/hub.js && [[ "$(git diff --shortstat qr-nav~1 qr-nav)" == " 20 files changed"* ]] && git log --oneline main..qr-nav</automated>
    <automated>git checkout -q main && test "$(git branch --show-current)" = main && test -z "$(git status --porcelain --untracked-files=no)" && test "$(git status --porcelain -- undefined-closed.png undefined-open.png)" = "$(printf '?? undefined-closed.png\n?? undefined-open.png')" && git log --oneline main..qr-hub && git log --oneline main..qr-nav</automated>
  </verify>
  <done>
- qr-nav = main + 2 commits. The first is tree-identical to qr-hub's first commit. The second touches exactly assets/i18n/site.js plus the 19 PAGES html files (20 files).
- Every page's header lists QR Code after Shor's Algorithm, active on the QR page. The nav label exists in all 31 languages.
- There is no hub card on qr-nav. The full i18n suite (--all with only the 112 Cyclic Groups findings, --api, --persistence, --smoke) passes.
- The repo is back on main with a clean tracked tree, the two untracked png files are still present, and nothing is pushed.
  </done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| page → phone scanner | the QR payload leaves the site and is executed by whoever scans it, so a wrong payload sends visitors elsewhere |
| dictionary data → DOM | the 31-language strings in assets/i18n/*.js reach the DOM through NT.i18n's static binding |
| author machine → repo | the authoring-time tool (qrencode) produces markup that ships |

## STRIDE Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation Plan |
|-----------|----------|-----------|----------|-------------|-----------------|
| T-261014-ttj-01 | Tampering | `QR Code/qr-code.html` `.qr-modules` path | high | mitigate | The Task 1 verify regenerates qrencode's level-M matrix for the exact gh-api-verified URL and requires a module-for-module match with the embedded path and the 41-unit viewBox. The same verify requires the URL to appear exactly twice (href + link text). A phone-scan human-check at end of phase confirms it. |
| T-261014-ttj-02 | Spoofing | `.qr-url` link | low | mitigate | The absolute `https://` address is on the repo owner's own github.io Pages site, with no `target="_blank"` (no reverse tabnabbing). `decorateLinks` skips scheme URLs, so the href is never rewritten. |
| T-261014-ttj-03 | Tampering | qr/hub/site dictionary values → DOM | medium | mitigate | Values land only through `data-i18n`/`data-i18n-aria-label` static binding (textContent/setAttribute, never innerHTML). The QR page has no inline script. The checker's DICT-MARKUP rule (run in every verify) rejects markup in any value. |
| T-261014-ttj-04 | Information Disclosure | QR page | low | accept | Static page: no new storage key, cookie, network call or tracking. It reads only the existing site-theme-choice/site-lang preferences through the shared scripts. |
| T-261014-ttj-SC | Tampering | npm/pip/cargo installs | high | accept | No package installs in this plan. qrencode 4.1.1 is already installed at /usr/bin, runs only at authoring time and ships nothing; its output is independently checked by T-261014-ttj-01's round trip. No package-legitimacy checkpoint is needed. |
</threat_model>

<verification>
Whole-task checks (each task's verify runs on its own branch, because the working tree must be on that branch):
- qr-hub: `node .planning/phases/06-multi-language-support/i18n-check.js --all --report` shows only Cyclic Groups findings (112). `--api`, `--persistence` and `--smoke` pass. `git log --oneline main..qr-hub` shows 2 commits (QR page, hub card).
- qr-nav: the same suite passes. `git log --oneline main..qr-nav` shows 2 commits (QR page cherry-pick, nav entry). `git diff --quiet qr-hub~1 qr-nav~1`.
- The branches are independent: merge-base(qr-hub, qr-nav) == main.
- Final state: on main, main unchanged, nothing pushed, `undefined-closed.png` and `undefined-open.png` still untracked.
- Human (end of phase): scan the on-screen QR with a phone in both themes; compare the hub-card and Tools-menu placements by checking out each branch.
</verification>

<success_criteria>
- The QR page encodes exactly https://cryptoworkbench.github.io/number-theory-browser-tools/ (module round trip against qrencode -l M), dark on light in both themes, with a 4-module quiet zone, crispEdges, and no literal colours.
- The QR page is fully translated (title, heading, caption, aria-label) in 31 languages, with the URL link verbatim.
- qr-hub: QR page + hub card, no nav entry. qr-nav: identical QR page commit + nav entry on all 19 PAGES pages, no hub card.
- i18n-check passes on both branches (static suite at the 112-finding Cyclic Groups baseline, plus --api, --persistence and --smoke, the last repaired by the derived nav count).
- Repo left on main, nothing pushed, untracked png files untouched.
</success_criteria>

<output>
Create `.planning/quick/261014-ttj-qr-code-page-linking-to-the-github-pages/261014-ttj-SUMMARY.md` when done (on main, uncommitted, for the orchestrator's docs commit). Record:
- the four commit SHAs (qr-hub: C1, C2; qr-nav: C1', C3);
- the per-language label choices for any language where wording was a judgement call;
- the i18n-check outputs on each branch.
</output>
