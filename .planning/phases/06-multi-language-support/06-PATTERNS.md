# Phase 6: Multi-Language Support - Pattern Map

**Mapped:** 2026-10-01
**Files analyzed:** 20 (1 new module, 16 HTML pages' header+body edits, `assets/site.css`, `assets/palette.css` [none needed], 1 new dev-check script, 1 new per-page string-call-site conversion pattern)
**Analogs found:** 5 / 5 strong matches (no files with zero analog)

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|-----------------|---------------|
| `assets/nt-i18n.js` (new) | utility/provider (shared module, frozen `NT` namespace) | transform (key → localized string) + event-driven (change notification) | `assets/theme.js` | exact (persistence: cookie+localStorage+URL-param three-channel) + `assets/nt-store.js` (frozen-namespace module shape) |
| 16× `<html>` head: inline pre-paint `<script>` + `<script src="../assets/nt-i18n.js">` include | config/bootstrap | request-response (sync, pre-first-paint) | `index.html`/`RSA/rsa.html` inline theme pre-paint script (head, lines 5) | exact |
| 16× shared header block: language `<select>` switcher markup | component (duplicated chrome, not templated) | event-driven (`change` → `setLang()`) | `.theme-switch` label block in `RSA/rsa.html` (lines ~236-241) | exact |
| `assets/site.css` `.lang-switch` rules | config (styling) | — | `.theme-switch`/`.theme-switch-track`/`.theme-switch-thumb` rules, `assets/site.css:100-153` | exact |
| Each tool page's inline `<script>`: `'nt-i18n:change'` listener + `data-i18n` attrs on static markup | controller (event wiring) | event-driven | Each tool's existing `window.addEventListener('storage', ...)` cross-tab sync block (pattern already present per-tool, mirrors `theme.js:127-131`) | role-match |
| Each tool page's inline `<script>`: JS-generated string call sites converted to `t(key, params)` | transform | request-response (compute → render text) | `Shors Algorithm/shors-algorithm.html` lines 585, 599, 603 (concatenation sites to be eliminated) — the anti-pattern instance, not a pattern to copy | n/a — target for removal, see Pattern Assignments below |
| `.planning/phases/06-multi-language-support/i18n-check.js` (new, dev-only) | test/utility | batch (static analysis over all 16 files) | `.planning/phases/07-shared-js-module-refactor/harness.js` + `checks/namespace.check.js` | exact (dev-only Node script, same harness/checks split) |

## Pattern Assignments

### `assets/nt-i18n.js` (utility/provider module)

**Analog:** `assets/theme.js` (full file, 139 lines) for persistence/event/lifecycle shape; `assets/nt-store.js` (lines 1-50) for frozen-namespace module header/footer convention.

**Module header/footer pattern** (`assets/nt-store.js` conventions — apply verbatim):
```javascript
(function () {
  "use strict";
  // ... DICT_EN / DICT_NL / ... + t()/setLang()/getLang()/applyStaticDom()/detectDefaultLang()
  var NT = window.NT = window.NT || {};
  NT.i18n = Object.freeze({ /* ... */ });
  Object.defineProperty(NT, 'i18n', { writable: false, configurable: false });
})();
```
Must be a plain, non-deferred `<script src>`, placed after `nt-layout.js` (canonical order: core, bigint, svg, store, layout, i18n), never shadowing `NT.store`'s "sibling-pair" scope — i18n persistence is independent (see below), per `assets/nt-store.js:1-29` header comment on scope boundaries.

**Three-channel persistence pattern** (copy structure from `assets/theme.js:37-72`, own key/param names):
```javascript
var STORAGE_KEY = 'site-lang';
var LANG_PARAM = 'lang';
var PARAM_RE = new RegExp('([?&])' + LANG_PARAM + '=[^&]*&?');

function valid(lang){ return SUPPORTED_LANGS.indexOf(lang) !== -1 ? lang : null; }

function fromUrl(){
  var m = new RegExp('[?&]' + LANG_PARAM + '=([^&#]*)').exec(location.search);
  return m ? valid(decodeURIComponent(m[1])) : null;
}
function fromCookie(){
  try{
    var m = new RegExp('(?:^|; *)' + STORAGE_KEY + '=([^;]*)').exec(document.cookie || '');
    return m ? valid(decodeURIComponent(m[1])) : null;
  }catch(e){ return null; }
}
function fromStorage(){
  try{ return valid(localStorage.getItem(STORAGE_KEY)); }catch(e){ return null; }
}
function readLang(){
  return fromUrl() || fromCookie() || fromStorage() || detectDefaultLang();
}
function persist(lang){
  try{ localStorage.setItem(STORAGE_KEY, lang); }catch(e){}
  try{ document.cookie = STORAGE_KEY + '=' + lang + ';path=/;max-age=31536000;samesite=lax'; }catch(e){}
}
```
**Critical:** `PARAM_RE` must strip only `lang=` — never touch `theme=` (per `assets/theme.js:83-84`'s own `PARAM_RE` discipline). Do not call into `theme.js`'s functions; do not route through `NT.store` (scope mismatch per `assets/nt-store.js:1-29`).

**Link-decoration pattern** (copy from `assets/theme.js:75-87`, `decorateLinks`):
```javascript
function decorateLinks(lang){
  var links = document.getElementsByTagName('a');
  for (var i = 0; i < links.length; i++){
    var href = links[i].getAttribute('href');
    if (!href || href.charAt(0) === '#' || /^[a-z][a-z0-9+.\-]*:/i.test(href)) continue;
    var hash = '', cut = href.indexOf('#');
    if (cut !== -1){ hash = href.slice(cut); href = href.slice(0, cut); }
    href = href.replace(PARAM_RE, '$1').replace(/[?&]$/, '');
    href += (href.indexOf('?') === -1 ? '?' : '&') + LANG_PARAM + '=' + lang;
    links[i].setAttribute('href', href + hash);
  }
}
```

**Cross-tab sync pattern** (copy from `assets/theme.js:127-131`):
```javascript
window.addEventListener('storage', function(e){
  if (e.key === STORAGE_KEY){ applyLang(readLang()); }
});
```

**Init/lifecycle pattern** (copy from `assets/theme.js:114-138`, `init()` + DOMContentLoaded guard): read lang → persist → strip URL param via `history.replaceState` (mirror `theme.js:104-112` `stripUrlParam`) → wire the switcher `<select>`'s `change` event → register `storage` listener.

**New-to-this-module (no direct analog, author fresh per RESEARCH.md Code Examples):** `t(key, params)` placeholder substitution, `applyStaticDom(root)` DOM walk over `[data-i18n]`, `detectDefaultLang()` via `navigator.languages`, and the `CustomEvent('nt-i18n:change', ...)` dispatch in `setLang()`. These have no existing analog in the codebase (first event-driven re-render hook of this kind) — implement per RESEARCH.md's skeleton (lines 259-340 of `06-RESEARCH.md`).

---

### 16× `<head>` pre-paint script + module include

**Analog:** `index.html:5` and `RSA/rsa.html:5` (theme pre-paint inline script) + `RSA/rsa.html:9-11` (stylesheet/script include order).

**Pre-paint pattern** (adapt verbatim shape, new key names, for `<html lang>` only — NOT for swapping text, per RESEARCH.md Pitfall 4 / Open Question 1, which accepts FOUC for MVP):
```html
<script>(function(){function v(t){return t==='day'||t==='night'?t:null;}var t=null,m;try{m=/[?&]theme=([^&#]*)/.exec(location.search);...})();</script>
```
Do NOT replicate this for language (RESEARCH.md explicitly defers a pre-paint text fix to a later phase) — only `<html lang>` gets set later by `nt-i18n.js`'s own non-deferred bottom-of-body script, same as the rest of its init.

**Script include order** (extend the existing canonical list by one, `RSA/rsa.html` doesn't yet import any `nt-*.js` but Phase-7-migrated tools do — e.g. Cayley Table — follow that file's exact include block):
```html
<script src="../assets/nt-core.js"></script>
<script src="../assets/nt-bigint.js"></script>
<script src="../assets/nt-svg.js"></script>
<script src="../assets/nt-store.js"></script>
<script src="../assets/nt-layout.js"></script>
<script src="../assets/nt-i18n.js"></script>
```
(for `index.html`, root-relative: `assets/nt-i18n.js`). Placed immediately before each page's own inline `<script>` at the end of `<body>`.

---

### 16× Shared header block — language switcher markup

**Analog:** `RSA/rsa.html` lines 236-241 (`.theme-switch` label block, duplicated verbatim across all 16 files per RESEARCH.md Pitfall 3).

**Markup pattern** (insert immediately after the existing `.theme-switch` label, inside `.site-header-inner`):
```html
<label class="theme-switch" title="Toggle day and night mode">
  <span class="theme-switch-icon" aria-hidden="true">🌙</span>
  <input type="checkbox" id="theme-switch-input" aria-label="Toggle day and night mode">
  <span class="theme-switch-track"><span class="theme-switch-thumb"></span></span>
  <span class="theme-switch-icon" aria-hidden="true">☀️</span>
</label>
<label class="theme-switch lang-switch" title="Language">
  <select id="lang-switch-select" aria-label="Language">
    <option value="en">English</option>
    <option value="nl">Nederlands</option>
    <option value="de">Deutsch</option>
    <option value="fr">Français</option>
    <option value="es">Español</option>
  </select>
</label>
```
This is the single highest mechanical-risk edit (Pitfall 3) — it must be applied identically, byte-for-byte except per-page relative path depth, to all 16 files in one atomic pass, then verified by `i18n-check.js --switcher-present --all`.

---

### `assets/site.css` `.lang-switch` rules

**Analog:** `assets/site.css:100-153` (`.theme-switch` + related selectors, plus the `@media (max-width: 760px)` wrap breakpoint at line ~147).

**Pattern:** Reuse `.theme-switch`'s `margin-left`/`flex:none`/`display:inline-flex` base styles by sharing the class name (`class="theme-switch lang-switch"`), add only switcher-specific rules for the `<select>` element (no checkbox/track/thumb needed):
```css
.lang-switch select{
  background: transparent;
  color: var(--st-header-text);
  border: 1px solid var(--st-header-border);
  border-radius: 6px;
  padding: 2px 6px;
  font: inherit;
  cursor: pointer;
}
```
No new breakpoint — rely on the existing `@media (max-width: 760px)` block at `assets/site.css:146-153` wrapping `.site-nav`/header items, consistent with RESEARCH.md's explicit recommendation (line 356 of `06-RESEARCH.md`) not to introduce a new breakpoint.

---

### Each tool page's inline `<script>` — `'nt-i18n:change'` listener

**Analog:** Each tool's existing `window.addEventListener('storage', ...)` cross-tab block, structurally identical in shape to `assets/theme.js:127-131` but living inside the tool's own IIFE (pattern repeated per migrated tool; e.g. Cayley Table's and Equivalence Wheel's own `NT.store`-driven storage listeners from Phase 7).

**Pattern** (added to the "Event wiring at the bottom" section every tool already has, per CLAUDE.md's documented tool structure):
```javascript
window.addEventListener('nt-i18n:change', function(){
  // applyStaticDom() already ran inside setLang(); re-run this tool's own
  // "redraw from current state" function so dynamic/computed text updates too
  render(state);          // or whatever this tool's existing redraw-from-state fn is named
});
```
Must call **both** the implicit `applyStaticDom()` (already done by `nt-i18n.js` itself before dispatch) and the tool's own redraw function — per RESEARCH.md Pitfall 5.

---

### Each tool page — converting concatenation-built strings to `t(key, params)`

**Analog (the anti-pattern to eliminate):** `Shors Algorithm/shors-algorithm.html` lines 585, 599, 603:
```javascript
row.textContent = 'Base a = ' + att.a + ' rejected';
verdict.textContent = result.n + ' = ' + result.factors[0] + ' x ' + result.factors[1];
verdict.textContent = 'No factors found for ' + result.n + ' within the attempt budget.';
```
**Target pattern** (per RESEARCH.md Pattern 1, lines 140-150 of `06-RESEARCH.md`):
```javascript
row.textContent = t('shors.baseRejected', { a: att.a });
verdict.textContent = t('shors.factorResult', { n: result.n, f1: result.factors[0], f2: result.factors[1] });
verdict.textContent = t('shors.noFactors', { n: result.n });
```
Every tool file must be grepped for `textContent = ` / `innerHTML = ` assignments built via `+` concatenation (not just Shor's Algorithm — RESEARCH.md flags this as "likely elsewhere," full inventory is a Wave 0 task) and converted one call site at a time, each becoming one dictionary key with the full sentence templated per language, never fragment-translated.

---

### `.planning/phases/06-multi-language-support/i18n-check.js` (dev-only Node script)

**Analog:** `.planning/phases/07-shared-js-module-refactor/harness.js` (toolkit: ROOT, gitShow, vm-based module loading, `ctx.eq`) + `.planning/phases/07-shared-js-module-refactor/checks/namespace.check.js` (one `module.exports = function(ctx){ ... }` per check file, using `ctx.eq(label, actual, expected)` assertions).

**Harness pattern** (reuse `harness.js`'s `ctx` toolkit directly — do not re-author a vm-loading harness from scratch):
```javascript
// checks/*.check.js convention:
module.exports = function (ctx) {
  var NT = ctx.loadNew();       // vm-loads assets/*.js in dependency order
  // ... ctx.eq("label", actual, expected) assertions ...
};
```
**New checks needed** (no direct prior analog — author fresh, following the same file-per-concern split `checks/` already uses): `checks/i18n-switcher.check.js` (switcher-presence grep across all 16 files), `checks/i18n-coverage.check.js` (parse `assets/nt-i18n.js`'s 5 dictionaries for identical key sets; grep every tool file for `t('...')`/`data-i18n="..."` call sites, flag any key referenced but undefined), `checks/i18n-persistence.check.js` (cookie/localStorage/URL functions in isolation, vm-loaded, same style as `namespace.check.js`'s descriptor assertions), `checks/i18n-no-locale-format.check.js` (static grep gate for `toLocaleString`/`Intl.NumberFormat` across all tool files — instant fail per RESEARCH.md Pitfall 2).

Entry-point CLI shape: mirror `harness.js`'s own argv handling (`node harness.js` runs all `checks/*.check.js`; `node harness.js core svg` runs named subsets) — i.e. `node i18n-check.js --all` / `node i18n-check.js --coverage "<tool file>"`.

## Shared Patterns

### Three-channel persistence (cookie + localStorage + URL param)
**Source:** `assets/theme.js` (full file) — every function (`fromUrl`/`fromCookie`/`fromStorage`/`persist`/`decorateLinks`/`stripUrlParam`)
**Apply to:** `assets/nt-i18n.js` only — do NOT reuse `theme.js`'s own `STORAGE_KEY`/`THEME_PARAM`/`PARAM_RE` constants or call its functions; author an independent, structurally-parallel set with `site-lang`/`lang` names, per RESEARCH.md Pattern 2 and Assumption A6.

### Frozen `window.NT.<name>` module convention
**Source:** `assets/nt-store.js` lines 1-50 (header comment + `Object.freeze`/`Object.defineProperty` footer, replicated identically across `nt-core.js`, `nt-bigint.js`, `nt-svg.js`, `nt-layout.js`)
**Apply to:** `assets/nt-i18n.js` — classic script, IIFE, `"use strict"`, non-deferred `<script src>`, frozen export object, `Object.defineProperty(NT, 'i18n', {writable:false, configurable:false})`. Validated by extending `checks/namespace.check.js`'s `moduleNames` array to include `'i18n'` (currently `["core","bigint","svg","store","layout"]`).

### Dev-only Node validation harness (never shipped)
**Source:** `.planning/phases/07-shared-js-module-refactor/harness.js` + `checks/*.check.js` + `.planning/phases/07-shared-js-module-refactor/07-VALIDATION.md`
**Apply to:** `.planning/phases/06-multi-language-support/i18n-check.js` — same dev-only, Node-built-ins-only, `module.exports = function(ctx){...}` per-check convention; never referenced from any shipped `.html` page.

### Textual output always via `textContent`, never `innerHTML`
**Source:** Universal convention across every tool's existing render functions (e.g. `Shors Algorithm/shors-algorithm.html` lines 545-768, all `textContent = ...`)
**Apply to:** `applyStaticDom()` in `nt-i18n.js` and every `t()` call site — security requirement from RESEARCH.md's ASVS V5/Tampering row: never inject a translated or URL-derived string via `innerHTML`.

## No Analog Found

None — every file/edit category in this phase has at least a role-match or exact analog in the existing codebase (`assets/theme.js`, `assets/nt-store.js`, Phase 7's `harness.js`/`checks/`, and the existing `.theme-switch` header block). The only genuinely novel pieces (`t()` placeholder substitution, `applyStaticDom()` DOM scan, `CustomEvent` re-render dispatch) are small, self-contained, and fully specified in RESEARCH.md's Code Examples section rather than needing a codebase analog.

## Metadata

**Analog search scope:** `assets/` (all 5 existing `nt-*.js` modules + `theme.js` + `site.css`), `index.html`, `RSA/rsa.html`, `Shors Algorithm/shors-algorithm.html`, `.planning/phases/07-shared-js-module-refactor/` (harness.js, checks/namespace.check.js, 07-VALIDATION.md)
**Files scanned:** 9 read directly (full or targeted ranges); 16 HTML tool pages assumed structurally identical to `RSA/rsa.html`'s header block per CLAUDE.md's documented "copy-pasted verbatim" convention
**Pattern extraction date:** 2026-10-01
