---
phase: 06-multi-language-support
reviewed: 2026-10-01T20:46:30Z
depth: standard
files_reviewed: 40
files_reviewed_list:
  - .claude/CLAUDE.md
  - CLAUDE.md
  - Cayley Table/cayley-table.html
  - Chinese Remainder Theorem/chinese-remainder-theorem.html
  - Diffie-Hellman Key Exchange/diffie-hellman-key-exchange.html
  - Elliptic Curve Diffie-Hellman/elliptic-curve-diffie-hellman.html
  - Equivalence Wheel/equivalence-wheel.html
  - Euclidean Algorithm/euclidean-algorithm.html
  - Eulers Totient/eulers-totient.html
  - Factor Tree/factor-tree.html
  - Fermats Method/fermats-method.html
  - Group Isomorphism/group-isomorphism.html
  - RSA/rsa.html
  - Shors Algorithm/shors-algorithm.html
  - Sieve Of Eratosthenes/sieve-of-eratosthenes.html
  - Square And Multiply/square-and-multiply.html
  - Venn Diagram/venn-diagram.html
  - assets/i18n/cayley-table.js
  - assets/i18n/chinese-remainder-theorem.js
  - assets/i18n/diffie-hellman-key-exchange.js
  - assets/i18n/elliptic-curve-diffie-hellman.js
  - assets/i18n/equivalence-wheel.js
  - assets/i18n/euclidean-algorithm.js
  - assets/i18n/eulers-totient.js
  - assets/i18n/factor-tree.js
  - assets/i18n/fermats-method.js
  - assets/i18n/group-isomorphism.js
  - assets/i18n/hub.js
  - assets/i18n/rsa.js
  - assets/i18n/shors-algorithm.js
  - assets/i18n/sieve-of-eratosthenes.js
  - assets/i18n/site.js
  - assets/i18n/square-and-multiply.js
  - assets/i18n/venn-diagram.js
  - assets/nt-bigint.js
  - assets/nt-core.js
  - assets/nt-i18n.js
  - assets/nt-layout.js
  - assets/nt-store.js
  - assets/nt-svg.js
  - assets/site.css
  - index.html
findings:
  critical: 0
  warning: 3
  info: 3
  total: 6
status: issues_found
---

# Phase 06: Code Review Report

**Reviewed:** 2026-10-01T20:46:30Z
**Depth:** standard
**Files Reviewed:** 40
**Status:** issues_found

## Summary

Reviewed the i18n core module (`assets/nt-i18n.js`), all 17 per-page dictionaries under `assets/i18n/`, and the 16 tool pages plus `index.html` that this phase converted to use them, with extra weight on the areas the task called out: XSS via translation/params/URL, state loss or duplication on a live language switch, stale text after a switch, cross-link `?lang=` propagation, and persistence edge cases.

This phase is unusually well executed. Specific things independently verified, not just read:

- **No XSS surface**: every render path in `nt-i18n.js` (`translateInto`/`renderTemplate`, `bindText`, `applyAttr`) writes through `textContent`, `createTextNode`, or `setAttribute` — never `innerHTML`/`insertAdjacentHTML`/`eval`. Grepped every `innerHTML` assignment across all 17 pages — every one is a bare `= ''` clear, never fed translated or user-supplied content.
- **Dictionary completeness**: wrote a small Node harness that loads all 17 `assets/i18n/*.js` files via `vm` and registers them against a stub `NT.i18n.register`. Every namespace has exactly `nl/en/de/fr/es`, and every non-English language has the identical flat key set as `en` — zero missing/extra keys anywhere.
- **Placeholder parity**: same harness extracted every `{name}` placeholder (including `{one}`/`{other}` plural forms) per key per language and diffed the placeholder sets across languages — zero mismatches. A French or Spanish translator renaming `{0}` to something else, which would silently leak a literal `{0}` into the UI, does not happen anywhere.
- **Rich-template wiring**: spot-checked every `data-i18n` element in the markup that has child elements (Sieve/Square-and-Multiply/Diffie-Hellman/ECDH/Shor's/Cayley/Fermat's legend items, `dh.introP1`'s three `<strong>` names, `rsa.introP2`'s nested `<em data-i18n>`) against its dictionary's `{0}`/`{1}`/`{2}` placeholder count and order — all correct, including the nested-`data-i18n`-inside-`data-i18n` case, which works correctly because `querySelectorAll` returns a static, document-order snapshot (parent processed before child).
- **State preservation on language switch**: traced the `onLangChange` handler in every one of the 16 tool pages. Every one re-renders only translated text/labels and explicitly preserves live state (current selection, in-progress playback step index, Eve's revealed-fields, scratchpad, construct-mode state, open preview, etc.) rather than re-running the tool's own "start over" logic. Message/input fields a user has typed into (RSA's plaintext boxes, Diffie-Hellman's prime/exponent fields) are deliberately never rebuilt on a switch.
- **Cross-link `?lang=` propagation**: `decorateLinks` sweeps every `<a>` on the page (nav, home-card grid, brand link) on load and on every switch. The handful of links tools build dynamically *after* load (Cayley↔Equivalence Wheel/Euler's Totient cross-reference links, Euclidean↔Venn) bypass `decorateLinks` entirely and instead append `&lang=' + getLang()` by hand — and every one of those is also re-run from the page's `onLangChange` handler, so the link's language tag never goes stale.
- **No literal colors**: grepped every `<style>` block, every inline `style="..."`, and the new `assets/site.css` rules for the language switcher — zero hex/`rgb()`/`hsl()` literals; everything routes through `var()`, matching CLAUDE.md's palette-token rule.
- **Script load order**: confirmed all 16 pages load `nt-i18n.js` after every other `nt-*.js` module they use and before `assets/i18n/site.js` and their own page dictionary, which loads before the page's own inline `<script>` — consistent with the documented canonical order everywhere.

No BLOCKER-level defects were found. Three WARNING-level robustness/fragility issues and three INFO-level observations are below.

## Warnings

### WR-01: `applyStaticDom`'s rich-template cache can resurrect or silently drop DOM children if a future `data-i18n` element's children are ever mutated outside the i18n pipeline

**File:** `assets/nt-i18n.js:287-343` (the `richChildrenMap`/`applyStaticDom` rich-element branch)

**Issue:** For a `data-i18n` element that has child elements (the "rich" case — e.g. a legend item with a `<span class="swatch">`), `applyStaticDom` captures the element's *current* children into `richChildrenMap` the first time it visits that element, then on every later visit (including every future language switch) it does `el.textContent = ''` (which discards whatever children are *currently* in the element) and re-inserts, by reference, only the children it cached on that very first visit, at the positions the template's `{0}`/`{1}`/… placeholders specify.

This is safe today only because every current rich `data-i18n` element in the codebase (the Sieve/SQM/DH/ECDH/Shor's/Cayley/Fermat's legend items, `dh.introP1`, `rsa.introP2`) is pure static markup that no page script ever mutates after load. The mechanism itself has no guard against the case the comment above `richChildrenMap`'s declaration (line 287-292) implicitly anticipates but does not actually defend against: if a future tool's script appends/removes a child of a rich `data-i18n` element *after* the first `applyStaticDom` pass (e.g. to add a dynamically-computed icon next to translated legend text), the next language switch will:
- silently discard that new child forever (it's not in the cached `kids` array and the template has no placeholder index for it), or
- resurrect a child the page's own code had deliberately removed (since the stale cached reference is reinserted unconditionally).

Neither failure is currently reachable, but nothing stops a future phase from reintroducing it, and the bug it would cause (a vanishing or ghost-reappearing DOM node, only on a language switch) would be very hard to root-cause later without reading this exact code path.

**Fix:** Either (a) document this constraint loudly right at the `richChildrenMap` declaration and at `register()`'s call sites ("a rich `data-i18n` element's children must never be mutated by page code after load — if you need that, give the mutable part its own un-prefixed id and update it directly instead of relying on the `{N}` rich-template mechanism"), or (b) make the cache self-healing: re-capture `el`'s current children into `richChildrenMap` whenever `el.children.length` at visit time doesn't match the cached array's length, instead of trusting the first-visit snapshot forever.

### WR-02: `decorateLinks`'s own-param strip regex is not global, so it only removes the *first* `lang=` occurrence in a href

**File:** `assets/nt-i18n.js:61` (`PARAM_RE`) and `assets/nt-i18n.js:360` (its use in `decorateLinks`)

**Issue:** `PARAM_RE = new RegExp('([?&])' + LANG_PARAM + '=[^&]*&?')` has no `g` flag, and `decorateLinks` does `href.replace(PARAM_RE, '$1')` — a single, non-global replace. `stripUrlParam` (line 426-428) builds its *own* regex with the `g` flag for the same job, so the two code paths are inconsistent. In the current codebase this is harmless because `decorateLinks` always produces at most one `lang=` per href (it strips, then appends exactly one), so a href can never accumulate two. But the inconsistency with `stripUrlParam`'s deliberately-global twin is a maintenance trap: if any future code path ever constructs an href with `lang=` appearing twice before `decorateLinks` sees it, only the first instance is stripped and the href ends up with two `lang=` params (last one wins per browser query-string semantics, but it's fragile and untested).

**Fix:** Add the `g` flag to `PARAM_RE`, matching `stripUrlParam`'s own regex, and make its construction visibly shared (e.g. a single factory function) so the two can't drift again.

### WR-03: `renderMessages()`'s never-rebuild comment is correct but undocumented as a documented invariant other devs could accidentally violate

**File:** `RSA/rsa.html:966-969`, cross-referenced against the `onLangChange` handler at `RSA/rsa.html:1407-1430`

**Issue:** This is working as designed today (confirmed by inspection — the `onLangChange` handler explicitly never calls `renderMessages()`/`buildMsgBlock()`, only the narrower `renderMsgHint`/`renderMsgError` for the two message blocks), but the invariant that keeps a user's typed plaintext from being wiped on a language switch rests entirely on every future contributor remembering that `renderMessages()` must never appear in the `onLangChange` callback, with no structural safeguard (e.g. a lint rule, an assertion, or a naming convention marking "state-destroying" render functions). The same informal invariant exists, unenforced, in Diffie-Hellman Key Exchange (`stage` row rebuild is explicitly described as "never rebuild," line ~1363) and several other tools. A future edit that "simplifies" an `onLangChange` handler by calling a convenient full-rebuild function would regress this silently (an input's typed value disappears on a language switch, easy to miss in manual testing since it's not a crash).

**Fix:** No code change required today; consider a repo-wide convention (e.g. a `// STATE-DESTROYING: do not call from onLangChange` comment directly above every such function, consistently placed) so a future diff reviewer or the author's own future self has something greppable to check against, rather than relying on each page's own prose comments being read and remembered.

## Info

### IN-01: Language-preference cookie omits the `Secure` attribute

**File:** `assets/nt-i18n.js:99` (`persist()`)

**Issue:** `document.cookie = LANG_STORAGE_KEY + '=' + lang + ';path=/;max-age=31536000;samesite=lax';` sets no `Secure` flag. For a static, no-login, no-PII educational site this is a very low-severity observation (the value is a two-letter language code, never sensitive), and it deliberately mirrors `assets/theme.js`'s existing pattern for the `site-theme` cookie, so it's consistent rather than a regression. Noting only because if this site is ever served over HTTPS, adding `Secure` costs nothing and is a reasonable hardening default going forward.

**Fix:** Optional: append `;Secure` when `location.protocol === 'https:'`.

### IN-02: `diff_base` supplied for this review spans more than this phase's actual work

**Issue:** The supplied `diff_base` (the parent of "docs(roadmap): add Phase 6 — Multi-Language Support") predates the creation of `assets/nt-store.js`, `assets/nt-core.js`, `assets/nt-bigint.js`, `assets/nt-svg.js`, and `assets/nt-layout.js` (per `git log -- assets/nt-store.js`, that file was introduced in later "feat(07-03)" commits). As a result the diff against that base shows those five foundational modules as entirely new files, even though they are not part of this phase's i18n work and were not materially changed by it. This review focused its substantive findings on the actual i18n layer and the page conversions per the task brief, and only lightly skimmed the unrelated `nt-*.js` math/layout modules for completeness against the required-reading list; no defects were found in them, but they were not reviewed with the same adversarial depth as the i18n-specific files since they are out of this phase's actual scope.

**Fix:** N/A — process note for whoever computed `diff_base` for this review; no code change implied.

### IN-03: `bindText`'s stored `data-i18n-params` round-trips every param through `String()`, losing numeric type information that is reconstructed ad hoc by each caller

**File:** `assets/nt-i18n.js:274-279` (`bindText`), consumed by `resolveCount`/`pluralCategory` (`assets/nt-i18n.js:174-188`)

**Issue:** `bindText` stringifies every param value before storing it in `data-i18n-params` (so a plural entry's `count: 5` becomes the JSON string `"5"`). This happens to work because `resolveCount` calls `Number(c)` before handing the count to `Intl.PluralRules`/the no-`Intl` fallback, so the string-to-number round-trip is silently absorbed. It is correct today, but it's an implicit contract between `bindText` and `resolveCount` that isn't documented at either call site — a future third caller of the `data-i18n-params` attribute that reads `count` without the same `Number()` coercion would get a truthy non-empty string instead of a plural category.

**Fix:** No change required; consider a one-line comment at `resolveCount` noting that it must tolerate `params.count` arriving as either a `Number` (direct `translate()`/`bindText()` call) or a numeric `String` (round-tripped through `data-i18n-params`), since both occur in practice.

---

_Reviewed: 2026-10-01T20:46:30Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
