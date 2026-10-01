# Phase 6: Multi-Language Support - Research

**Researched:** 2026-10-01
**Domain:** Client-side i18n for a zero-build, zero-framework, `file://`-safe static site (16 HTML pages)
**Confidence:** MEDIUM (architecture HIGH — grounded directly in this session's reads of the existing codebase; math-terminology glossary LOW-MEDIUM — WebSearch only, needs a native-speaker/human-verify pass before shipping)

## Summary

This phase is not a hard technical problem — it is a **large content-authoring and mechanical-integration** problem wearing a technical hat. The target architecture is fully dictated by this project's own conventions, already proven five times over (`nt-core.js`, `nt-bigint.js`, `nt-svg.js`, `nt-store.js`, `nt-layout.js`): one more classic-script module, `assets/nt-i18n.js`, exporting a frozen `window.NT.i18n` namespace, loaded non-deferred immediately before each page's own inline `<script>`. There is no fetch(), no JSON file, no build step, no npm package — every dictionary lives as a JS object literal inside that one file, because the site must keep working opened directly via `file://` `[CITED: CLAUDE.md]`.

The hard part is volume and mechanical risk, not design: 16 pages (`index.html` + 15 tool pages), a **shared nav header block that is copy-pasted verbatim into all 16 files** (not templated — confirmed by reading `RSA/rsa.html` lines 213-249 against `index.html`), and an estimated **700-1,100 unique translatable strings** before multiplying by 5 languages (≈3,500-5,500 total translated strings). A large fraction of the JS-generated strings are built by **string concatenation of literal fragments** (`'Base a = ' + att.a + ' rejected'`), which cannot be correctly localized fragment-by-fragment — every such call site must become one whole parameterized template per language. This is the single highest-risk pitfall in the phase and should dominate the planner's task breakdown and verification gates.

**Primary recommendation:** Build one `assets/nt-i18n.js` module (data + `t()`/`setLang()`/`applyStaticDom()` API, frozen `NT.i18n`), add one shared switcher control to the shared header markup (propagated to all 16 files, mirroring exactly how `theme-switch` already sits in that header), run a tracer plan that proves the whole pipeline end-to-end on `index.html` + the smallest tool (Sieve of Eratosthenes), then translate the remaining 14 tool pages in parallel waves grouped by file size, with a dev-only Node key-coverage script (modeled directly on Phase 7's `harness.js`/`shadow-check.js` pattern) gating every wave.

## Architectural Responsibility Map

This is a 100% static client-side site — there is no backend, SSR, CDN-distinct tier, or database tier to assign capabilities to. Every capability below lives in the Browser/Client tier; the table exists to record *which* client-side layer owns each concern so the planner doesn't collapse them into one file.

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Language dictionaries (5×) + `t(key, params)` lookup | Browser/Client — `assets/nt-i18n.js` (new shared module) | — | Cross-page concern; CLAUDE.md explicitly names this exact module/namespace pair as the intended home `[CITED: CLAUDE.md]` |
| Language persistence (cookie + localStorage + `?lang=` URL param) | Browser/Client — `assets/nt-i18n.js` | — | Must mirror `assets/theme.js`'s own three-channel pattern (own `STORAGE_KEY`, own `PARAM_RE`), NOT be folded into `NT.store`, whose documented scope is pairwise cross-tool settings, not a site-wide preference (see Architecture Patterns, Pattern 2) |
| Static-markup translation (`data-i18n` scan) | Browser/Client — `assets/nt-i18n.js` provides the scanner; each page's own markup carries the attributes | — | Scanner is shared; attribute authorship is per-page |
| Dynamic/JS-generated string translation (step narratives, computed results) | Browser/Client — each tool's own inline `<script>` | `assets/nt-i18n.js` (`t()` call target) | Each tool owns its own render/narrative functions; only the lookup function is shared |
| Language switcher UI control | Browser/Client — shared header markup (duplicated per page, like `.theme-switch`) | — | Not componentized — this site has no templating; the control's markup, like the whole nav, is copy-pasted into all 16 files `[VERIFIED: RSA/rsa.html:213-249]` |
| `<html lang>` attribute update | Browser/Client — `assets/nt-i18n.js` init | — | Accessibility/SEO; trivial `setAttribute` call alongside `setLang()` |

## Standard Stack

### Core

No third-party library is appropriate or permitted here. `[VERIFIED: CLAUDE.md]` states: *"Vanilla HTML/CSS/JS only, no build tooling, no frameworks"* and *"Only Google Fonts via `<link>` — no other CDN or third-party JS dependency, per existing convention."* An i18n library (i18next, FormatJS/`react-intl`, Polyglot.js, etc.) would require either a bundler or a `<script>` tag pointed at a CDN — both are explicitly out of scope for this project. The correct "stack" is the project's own module system.

| Module | Version | Purpose | Why Standard (for this repo) |
|--------|---------|---------|------------------------------|
| `assets/nt-i18n.js` (new) | n/a (hand-authored) | Dictionaries, `t()`, `setLang()`/`getLang()`, `applyStaticDom()`, `detectDefaultLang()` | Matches the exact classic-script/frozen-namespace pattern of all five existing `nt-*.js` modules; explicitly anticipated by name in `[CITED: CLAUDE.md]` ("assets/nt-NAME.js … e.g. nt-i18n.js / NT.i18n") |

### Supporting

| Browser API | Purpose | When to Use |
|-------------|---------|-------------|
| `navigator.language` / `navigator.languages` | Default-language detection on first visit | `detectDefaultLang()` — map the 2-letter prefix to one of `nl/en/de/fr/es`, else fall back to `en` |
| `CustomEvent` / `window.dispatchEvent` | Notify a page's own script that the language changed, so it can re-run its dynamic render | Fired by `setLang()`; every tool's inline script subscribes once at init |
| `document.cookie`, `localStorage`, `history.replaceState` | Three-channel persistence, cross-tab sync | Identical rationale to `assets/theme.js` — see Pattern 2 |
| `Intl.PluralRules` (optional, ES2020) | Only if string-extraction (Wave 0) finds a genuinely count-dependent message | Don't reach for this unless a real plural case turns up — most of this app's strings are declarative labels, not natural-language counts |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| One `assets/nt-i18n.js` file with all 5 dictionaries inline | Split into `assets/i18n/dict.en.js`, `dict.nl.js`, etc. as separate `<script>` tags | Keeps any single file smaller and lets a translator work one file at a time, but it means more than one file writing into the `NT` namespace's data, which breaks the "one file, one frozen `NT.NAME`" convention `[CITED: CLAUDE.md]` this project has followed for all five existing modules. **Not recommended** unless the single-file size becomes genuinely unworkable (see Code Examples for a size estimate). |
| `data-i18n` attribute scan + `t()` calls | A full virtual-DOM re-render per language switch | Massive overkill for a vanilla-JS, no-framework site; would require rewriting every tool's render pipeline instead of layering a translation step on top of it |
| JS object dictionaries | `fetch()` of per-language `.json` files | Blocked outright: `file://` pages cannot `fetch()` same-origin JSON without CORS failures in most browsers (Chrome refuses local-file XHR/fetch by default); this is why the project's own docs mandate classic scripts, not ES modules, for everything shared |

**Installation:** None — no package manager is used anywhere in this repo. `assets/nt-i18n.js` is a hand-authored file checked into the repo, included via `<script src="../assets/nt-i18n.js"></script>` like its four siblings.

**Version verification:** Not applicable — no package registry is involved. N/A, confirmed by reading `[CITED: CLAUDE.md]`'s explicit "no `package.json`" statement.

## Package Legitimacy Audit

**Not applicable.** This phase installs no external packages. Per `[VERIFIED: CLAUDE.md]` ("no npm, no bundler" / "no external JS dependency beyond Google Fonts"), the implementation is a single hand-authored classic-script module. The Package Legitimacy Gate protocol has no packages to evaluate — skip Steps 1-3 of that protocol for this phase.

## Architecture Patterns

### System Architecture Diagram

```
                         ┌─────────────────────────────┐
                         │   assets/nt-i18n.js          │
                         │   (new shared module)        │
                         │                               │
   navigator.language ──▶│ detectDefaultLang()           │
   ?lang=xx URL param ──▶│ readLang() ── cookie ─────────┼──▶ document.cookie
   localStorage['site-  │           └── localStorage ────┼──▶ localStorage
   lang'] ──────────────▶│                               │
                         │ setLang(lang) ────────────────┼──▶ writes cookie + localStorage
                         │   │                             │    + decorates same-site <a> hrefs
                         │   ├─▶ document.documentElement  │    with &lang=xx (own regex,
                         │   │      .lang = lang           │    independent of theme.js's
                         │   │                             │    own &theme=xx decoration)
                         │   └─▶ dispatchEvent(            │
                         │        'nt-i18n:change')        │
                         │                               │
                         │ t(key, params) ────────────────┼──▶ looks up DICT[lang][key],
                         │   │  falls back to DICT.en      │    substitutes {param} tokens
                         │   │  on a missing key           │
                         │   │                             │
                         │ applyStaticDom(root) ───────────┼──▶ walks [data-i18n] and
                         │                               │    [data-i18n-attr-*] elements,
                         └──────────────┬────────────────┘    sets textContent/attribute
                                        │
                     non-deferred <script src>, loaded
                     immediately before each page's own
                     inline <script>, end of <body>
                                        │
                ┌───────────────────────┼────────────────────────┐
                ▼                       ▼                        ▼
      index.html's hub           Shared header block        Each tool's own
      card grid (data-i18n       (copy-pasted into all       inline <script>:
      on h2/p per card)          16 files) — switcher        - subscribes to
                                 control + nav links          'nt-i18n:change'
                                 carry data-i18n              - re-runs its OWN
                                                               current-state render
                                                               using t() instead of
                                                               literal strings
```

A reader can trace the primary flow: a stored/URL/detected language code enters `nt-i18n.js`, `setLang()` persists it through three channels and fires one event, `applyStaticDom()` relabels markup everywhere a `data-i18n` attribute exists, and the event notifies each tool's own script to re-run whatever function currently redraws its dynamic text — without losing the user's in-progress state (current step, selected cell, playback position), because that state lives in each tool's own closure-scoped `state` object, untouched by the language switch.

### Recommended Project Structure

No new directories — one new file in the existing shared location:

```
assets/
├── nt-core.js       # existing
├── nt-bigint.js     # existing
├── nt-svg.js        # existing
├── nt-store.js      # existing
├── nt-layout.js     # existing
└── nt-i18n.js        # NEW — dictionaries + t()/setLang()/applyStaticDom()
```

Per-page changes (all 16 files): add `<script src="../assets/nt-i18n.js"></script>` (root-relative `assets/nt-i18n.js` for `index.html`) at the position **after** `nt-layout.js` in the existing canonical include order (`core, bigint, svg, store, layout`) and immediately before the page's own inline `<script>`; add the switcher control markup next to `.theme-switch` in the header block; add `data-i18n` attributes to translatable static elements; convert JS string-building call sites to `t(key, params)`.

### Pattern 1: `data-i18n` static-markup scan + whole-sentence `t()` templates for dynamic strings

**What:** Two complementary mechanisms, not one. Static markup (headings, button labels, instructional copy already sitting in HTML) gets a `data-i18n="namespace.key"` attribute and is relabeled by one DOM walk. JS-generated strings (step narratives, computed results) are **never** built by concatenating translated fragments — each call site passes a key and a params object to `t()`, and the *entire* sentence, including word order, lives inside each language's dictionary entry.

**When to use:** `data-i18n` for anything that is static markup at page-load time (even if its *value* might later be swapped by a preset click — the label/button text itself is static). `t(key, params)` for anything assembled in JS from a template plus one or more computed values.

**Example — the non-localizable pattern this phase must eliminate**, verbatim from the current codebase `[VERIFIED: Shors Algorithm/shors-algorithm.html:585,599,603]`:
```javascript
row.textContent = 'Base a = ' + att.a + ' rejected';
verdict.textContent = result.n + ' = ' + result.factors[0] + ' x ' + result.factors[1];
verdict.textContent = 'No factors found for ' + result.n + ' within the attempt budget.';
```
German and Dutch word order, and French/Spanish's different placement of the quantity relative to the verb, cannot be produced by swapping only the English fragments ('Base a = ', ' rejected') for translated fragments and leaving the concatenation order fixed. The fix is one template per language, with the full sentence shaped as that language needs it:
```javascript
// assets/nt-i18n.js
var DICT_EN = { shors: { baseRejected: 'Base a = {a} rejected',
                          factorResult: '{n} = {f1} x {f2}',
                          noFactors: 'No factors found for {n} within the attempt budget.' } };
var DICT_DE = { shors: { baseRejected: 'Basis a = {a} verworfen',
                          factorResult: '{n} = {f1} x {f2}',
                          noFactors: 'Keine Faktoren für {n} innerhalb des Versuchsbudgets gefunden.' } };
// call site, after migration:
row.textContent = t('shors.baseRejected', { a: att.a });
verdict.textContent = t('shors.factorResult', { n: result.n, f1: result.factors[0], f2: result.factors[1] });
```

### Pattern 2: Language persistence mirrors `theme.js`'s own three-channel pattern — not `NT.store`

**What:** `assets/theme.js` already solves "a site-wide preference must survive navigation between `file://` pages with no shared origin" with three layered channels, read in this order: a `?theme=` URL param that every same-site link is rewritten to carry, then `document.cookie`, then `localStorage` `[VERIFIED: assets/theme.js:1-36]`:

> *"These pages are opened straight from disk (file://)… Firefox ships privacy.file_unique_origin=true by default, which gives every file:// DOCUMENT its own opaque origin… Persistence therefore cannot rely on any single origin-scoped store. Layered most-portable first: 1. THEME_PARAM on the link itself… 2. document.cookie… 3. localStorage…"*

Language preference is the *same kind of problem* — a site-wide user preference, not a pairwise tool setting — and should copy this exact pattern with its own `STORAGE_KEY` (e.g. `'site-lang'`) and its own `LANG_PARAM` (e.g. `'lang'`), entirely independent of `assets/theme.js`.

**Why NOT `NT.store`:** `assets/nt-store.js`'s own header comment defines its scope narrowly and explicitly `[VERIFIED: assets/nt-store.js:1-9]`:

> *"NT.store — cross-tool shared-state persistence, shared across sibling tool pairs (Cayley Table <-> Equivalence Wheel's group type + modulus; Euclidean Algorithm <-> Venn Diagram's a/b pair). The concept these functions centralize: a shared setting is ONE value two sibling tools both read and write, not a private per-tool value…"*

A language preference is shared across **all 16 pages**, not one designated sibling pair, and its payload shape (`{ lang: 'es' }`) and persisted key (`site-lang`) would not fit `NT.store`'s documented "sibling pair" contract without redefining that contract's scope. Keep the two concerns separate: `NT.store` stays scoped to its two existing sibling-pair settings; `nt-i18n.js` gets its own persistence functions, parallel in design to `theme.js`'s, but never calling into `theme.js` or `NT.store`.

**Integration risk to flag for the planner:** both `theme.js`'s `decorateLinks()` and the new `nt-i18n.js`'s equivalent will independently rewrite every same-site `<a href>` on the page, each appending its own query param. This is safe **only if each function's regex touches exclusively its own known param name** (`theme.js` already does this: `PARAM_RE = /([?&])theme=[^&]*&?/` strips only `theme=`, never `lang=`). The new function must follow the identical discipline — strip only `lang=` via its own regex, leave any `theme=` already on the href untouched — or the two independent rewrite passes will clobber each other's persisted parameter.

### Pattern 3: Re-render hook via a custom event, not a full page reload

**What:** `setLang()` dispatches one `CustomEvent('nt-i18n:change', { detail: { lang } })` on `window` after persisting. Each tool's inline script registers exactly one listener at init time, calling `NT.i18n.applyStaticDom()` for markup and then re-invoking whatever function the tool already uses to redraw its *current* dynamic state (most tools already have such a function, because playback resume/preset-switch already requires an idempotent redraw-from-state operation).

**When to use:** Every tool page, once, near the bottom of its own inline `<script>`'s event-wiring section (the existing convention already documents an "Event wiring at the bottom" section — this is one more listener there).

**Anti-pattern to avoid — a full `location.reload()` on language switch:** this would satisfy success criterion 2's letter ("re-render… without a full page reload where feasible") not at all — it is explicitly named as something to avoid in the phase's own success criteria, and it would also discard in-progress animation/playback state the project's architecture otherwise treats as precious (the `generation` counter pattern used across Sieve/Fermat/Shor's exists specifically to let state survive a mid-animation restart).

### Anti-Patterns to Avoid

- **String concatenation across a translation boundary:** `t('a') + value + t('b')` is exactly the pattern Pattern 1 eliminates — it reintroduces fixed word order even though each fragment is individually translated. Always pass the whole template key plus a params object to one `t()` call.
- **Locale-aware number formatting on math output:** never call `.toLocaleString()` on a numeric value this site displays (modulus, exponent, RSA key material, continued-fraction convergents, Cayley table entries). European locale formatting swaps `.`/`,` as decimal vs. thousands separators — applying it to e.g. an RSA modulus or a CF decimal approximation would silently corrupt the displayed math, not just its language. Keep every numeral exactly as `Number.prototype.toString()`/`BigInt.prototype.toString()` already renders it, in all 5 languages.
- **Translating a tool's proper name when it functions as a brand/title**, inconsistently with how the rest of the phrase around it translates — see Code Examples' terminology glossary and the Assumptions Log for the specific proper-noun-vs-common-term calls this research could not fully verify.
- **A switcher that doesn't show each language's own autonym:** label the five choices in their own language ("English", "Nederlands", "Deutsch", "Français", "Español"), not translated into whatever language is currently active — a Spanish-only reader must be able to find "Español" in the list even before any translation has loaded. `[ASSUMED]` — standard UX convention for language switchers, not verified against an authoritative source this session.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Default language detection | A hand-written `Accept-Language`-header parser (not available client-side anyway) | `navigator.language` / `navigator.languages[0]`, mapped via a small allow-list function to `nl/en/de/fr/es`, else `en` | `navigator.language` is the only reliable client-side signal; a bespoke parser adds no value |
| Placeholder substitution in templates | A generic ICU MessageFormat engine | A single `String.prototype.replace(/\{(\w+)\}/g, ...)` pass over `params` | This app's templates are simple positional/named substitutions, not plural-select/gender-select trees; a full ICU engine is unjustified complexity for a zero-dependency site |
| Pluralization | A generic plural-rule engine authored from scratch | `Intl.PluralRules` (native, ES2020, zero dependency) **only if** Wave 0's string extraction turns up a genuinely count-dependent message; otherwise skip entirely | Native API already handles the categories (`one`/`few`/`many`/`other`) correctly per locale; hand-rolling English-only `n === 1 ? ... : ...+'s'` logic breaks immediately for Dutch/German/French/Spanish plural rules |
| Cross-tab language sync | A custom polling loop | The existing `window.addEventListener('storage', ...)` pattern `assets/theme.js` already uses for the same reason, applied to the new `site-lang` key | Proven pattern already in this exact codebase; reuse the mechanism, not just the idea |

**Key insight:** Every "don't hand-roll" item above has a zero-dependency, native-browser-API or already-proven-in-this-repo answer. There is no case in this phase where reaching for an external library is actually justified — the project's own architectural constraints (no build step, `file://`-safe) make that true by construction, not by project preference.

## Common Pitfalls

### Pitfall 1: Translating sentence fragments instead of whole templates
**What goes wrong:** A call site like `'Base a = ' + att.a + ' rejected'` gets "translated" by swapping only the two literal fragments, leaving the concatenation order (and thus the sentence's grammar) fixed to English word order.
**Why it happens:** It's the path of least resistance — the fragments are visually easy to find and translate one at a time, and it "looks done" because the new fragments are in the target language.
**How to avoid:** Every concatenation-built string (there are confirmed instances in `Shors Algorithm/shors-algorithm.html` and likely elsewhere — full inventory is a Wave 0 task) becomes one `t(key, params)` call with the entire sentence, placeholders included, authored per-language.
**Warning signs:** Any call site in the audited code that still does `t('x') + value + t('y')` after "migration" has not actually fixed this pitfall.

### Pitfall 2: Locale number formatting corrupting math output
**What goes wrong:** A well-intentioned pass applies `.toLocaleString()` to numeric displays for "proper localization," which silently reformats an RSA modulus or CF decimal using the target locale's decimal/thousands separator convention.
**Why it happens:** `.toLocaleString()` is the generic advice for "localize numbers" and gets applied without realizing this site's numerals are math content, not display formatting.
**How to avoid:** Explicit rule for the planner/executor: **never** call `.toLocaleString()`, `Intl.NumberFormat`, or any locale-aware number formatter on a value this site treats as mathematical data. Keep default `toString()` everywhere, in all 5 languages.
**Warning signs:** A grep for `toLocaleString` or `Intl.NumberFormat` appearing anywhere in a tool's migrated script is an instant fail in the dev check script (see Validation Architecture).

### Pitfall 3: Nav-header edits applied inconsistently across 16 copy-pasted files
**What goes wrong:** The shared header block (brand, nav links, theme toggle, new language switcher) is not templated — it is duplicated verbatim into all 16 HTML files `[VERIFIED: RSA/rsa.html:213-249]`. A `data-i18n` attribute or switcher-markup edit applied to some files and missed in others produces a site where some pages have the feature and some silently don't.
**Why it happens:** No build step means no single source of truth to edit once; every edit to shared chrome is mechanically repeated 16 times by hand (or by scripted find/replace).
**How to avoid:** Treat the header-block edit as one atomic Wave 0 change applied identically to all 16 files in one pass, verified by a dev-only script that diffs the header block's shape (ignoring the per-page `is-active` link and relative `../` paths) across all 16 files and fails if any file's header structure drifts from the canonical template.
**Warning signs:** Any page that loads without visible console errors but is missing the switcher control, or whose switcher doesn't match the others' markup/attributes.

### Pitfall 4: FOUC — a flash of untranslated English before the bottom-of-body script runs
**What goes wrong:** Per this project's own documented convention, `nt-i18n.js` loads as a plain, non-deferred `<script src>` immediately before each page's own inline script, at the **end of `<body>`** `[CITED: CLAUDE.md]` — meaning the full page (written in English in the static HTML) has already been parsed and painted by the time `applyStaticDom()` runs and swaps the text for a non-English user.
**Why it happens:** This is an inherent consequence of following the existing include-order convention; `theme.js` avoids the analogous flash for *color* via a tiny inline `<head>` pre-paint script (because a color flash is highly visually jarring), but no equivalent pre-paint mechanism exists yet for text content.
**How to avoid:** This is a genuine open design tradeoff, not a bug to silently fix — see Open Questions. MVP-appropriate default: accept a brief text-content flash for returning non-English users (English is the static-markup default, so first-time/English visitors see zero flash), consistent with this being an `mode: mvp` phase; document the tradeoff rather than building a `body{visibility:hidden}`-until-ready mechanism, which adds complexity and its own failure mode (a script error would leave the page permanently hidden).
**Warning signs:** User-visible complaint of "page flickers in English before showing my language" — acceptable for MVP, worth a backlog item if it bothers real users.

### Pitfall 5: Forgetting to re-run a tool's *dynamic* render on language change
**What goes wrong:** `applyStaticDom()` correctly relabels static markup, but a tool's last-computed result (e.g., "14 = 2 x 7", a step narrative mid-animation, a Cayley table equation caption) was written by JS directly into `textContent` and is not touched by the static-markup scan — it stays in the previous language until the user triggers a new computation.
**Why it happens:** The two mechanisms (static scan vs. dynamic `t()` calls) are easy to conflate; a developer translating "the visible text" checks static labels and misses that the last narrative string is stale.
**How to avoid:** Every tool's `'nt-i18n:change'` listener must call **both** `applyStaticDom()` **and** the tool's own "redraw from current state" function (most tools already have one, from playback resume).
**Warning signs:** Switch languages mid-animation on any tool and check whether the step narrative/result text updates — a dev check script can automate this only partially (see Validation Architecture); this needs a manual pass per tool.

### Pitfall 6: Math terminology that is technically a valid dictionary word but pedagogically wrong
**What goes wrong:** A literal/machine translation of a term like "totient," "congruence," or "Cayley table" can be grammatically correct but not the term actually used in that language's mathematics curriculum/literature, undermining this project's core value ("the diagram teaches, the text supports it").
**Why it happens:** General-purpose translation tools and even general dictionaries are not curated for domain terminology; WebSearch results this session confirm the well-established terms (e.g. French "indicatrice d'Euler," German "Eulersche Phi-Funktion") but could not confirm others (e.g. a standard Dutch term for Euler's totient function) `[ASSUMED — see Assumptions Log]`.
**How to avoid:** Treat the Terminology Glossary below as a draft requiring a `checkpoint:human-verify` pass (ideally by a speaker with math background in each of the 4 non-English languages) before the phase is considered translation-complete, not just code-complete.
**Warning signs:** Shipping all 5 languages with zero native-speaker review of the glossary terms.

## Terminology Glossary (core cross-tool math terms)

> Status: **DRAFT, not yet native-speaker-verified.** Populated from WebSearch this session; several cells are marked `[ASSUMED]` because the search returned no confident result for that language/term pair. The planner should add an explicit `checkpoint:human-verify` task before any plan marks translation as phase-complete.

| Term (EN) | NL | DE | FR | ES | Confidence |
|-----------|----|----|----|----|-----------|
| Greatest common divisor | grootste gemene deler (ggd) | größter gemeinsamer Teiler (ggT) | plus grand commun diviseur (PGCD) | máximo común divisor (mcd) | `[CITED: en.wiktionary.org, bab.la]` |
| Prime (number) | priemgetal `[ASSUMED]` | Primzahl `[ASSUMED]` | nombre premier `[ASSUMED]` | número primo `[ASSUMED]` | `[ASSUMED]` — standard textbook terms from training knowledge, not re-verified this session |
| Modulus / congruence | modulus / congruentie `[ASSUMED]` | Modul / Kongruenz `[ASSUMED]` | module / congruence `[CITED: dictionary.reverso.net for ES only]` | módulo / congruencia `[CITED: dictionary.reverso.net]` | Mixed — ES confirmed, NL/DE/FR `[ASSUMED]` |
| Euler's totient function | **unconfirmed** `[ASSUMED]` | Eulersche Phi-Funktion | indicatrice d'Euler | función φ de Euler | `[CITED: Wikidata/Wikipedia for DE/FR/ES]`; NL not found this session |
| Cayley table | Cayley-tabel | Verknüpfungstafel (also seen as "Cayley-Tafel") | table de Cayley | tabla de Cayley | `[CITED: Wikimedia Commons category listing]` |
| Group (algebraic) | groep `[ASSUMED]` | Gruppe `[ASSUMED]` | groupe `[ASSUMED]` | grupo `[ASSUMED]` | `[ASSUMED]` — not independently re-verified this session |
| Isomorphism | isomorfisme `[ASSUMED]` | Isomorphismus `[ASSUMED]` | isomorphisme `[ASSUMED]` | isomorfismo `[ASSUMED]` | `[ASSUMED]` |
| Elliptic curve | elliptische kromme `[ASSUMED]` | elliptische Kurve `[ASSUMED]` | courbe elliptique `[ASSUMED]` | curva elíptica `[ASSUMED]` | `[ASSUMED]` |

**Proper nouns — recommend leaving untranslated in all 5 languages (no term exists to translate):** RSA, Diffie-Hellman, Shor's Algorithm (only "Algorithm"/"Algorithme"/"Algoritmo" varies), Euler, Fermat, Cayley, Venn. `[ASSUMED — Claude's discretion, no CONTEXT.md to confirm]`

**Terms with an established per-language translation (recommend translating the common-noun part, keeping the eponym):** "Chinese Remainder Theorem" → NL "Chinese reststelling", DE "Chinesischer Restsatz", FR "théorème des restes chinois", ES "teorema chino del resto". `[ASSUMED]` — training-knowledge terms, not independently re-verified this session; include in the human-verify checkpoint.

## Runtime State Inventory

Not applicable — this is a net-new feature phase (adding a language layer on top of existing tools), not a rename/refactor/migration phase. No existing stored data, service config, OS registration, or secret references the strings being translated by name in a way that a rename would break (translation changes *displayed* text, not any persisted key, filename, or identifier). `NT.store`'s persisted keys (`group-params`, `ab-params`) are untouched by this phase — confirmed by their schema in `[VERIFIED: assets/nt-store.js]` containing no language or text field.

## Code Examples

### `assets/nt-i18n.js` skeleton (original design, following this repo's own module conventions)

```javascript
/* NT.i18n — site-wide language dictionaries, lookup and persistence.
   Classic script, IIFE, "use strict" — loaded non-deferred, immediately
   before a page's own inline <script>, after nt-layout.js in the
   canonical include order, so it works unmodified over file://.
*/
(function () {
  "use strict";

  var SUPPORTED_LANGS = ['en', 'nl', 'de', 'fr', 'es'];
  var STORAGE_KEY = 'site-lang';
  var LANG_PARAM = 'lang';

  // DICT_EN / DICT_NL / DICT_DE / DICT_FR / DICT_ES: one object literal
  // per language, namespaced by page (shared.*, rsa.*, shors.*, ...).
  // Keys must be IDENTICAL across all 5 dictionaries -- the dev-only
  // check script (see Validation Architecture) fails the build if any
  // dictionary is missing a key another one defines.
  var DICT = { en: DICT_EN, nl: DICT_NL, de: DICT_DE, fr: DICT_FR, es: DICT_ES };

  function valid(lang) { return SUPPORTED_LANGS.indexOf(lang) !== -1 ? lang : null; }

  function detectDefaultLang() {
    var langs = (navigator.languages || [navigator.language || 'en']);
    for (var i = 0; i < langs.length; i++) {
      var v = valid(String(langs[i]).slice(0, 2).toLowerCase());
      if (v) return v;
    }
    return 'en';
  }

  // readLang / persist / decorateLinks: same three-channel shape as
  // assets/theme.js's readTheme/persist/decorateLinks, with LANG_PARAM's
  // own regex -- never touching theme.js's THEME_PARAM.
  // ... (full implementation mirrors theme.js structure)

  function t(key, params) {
    var lang = getLang();
    var str = lookup(DICT[lang], key) || lookup(DICT.en, key) || key;
    if (params) {
      str = str.replace(/\{(\w+)\}/g, function (_, name) {
        return Object.prototype.hasOwnProperty.call(params, name) ? params[name] : '{' + name + '}';
      });
    }
    return str;
  }

  function applyStaticDom(root) {
    root = root || document;
    var nodes = root.querySelectorAll('[data-i18n]');
    for (var i = 0; i < nodes.length; i++) {
      nodes[i].textContent = t(nodes[i].getAttribute('data-i18n'));
    }
    var attrNodes = root.querySelectorAll('[data-i18n-attr-placeholder],[data-i18n-attr-title],[data-i18n-attr-aria-label]');
    for (var j = 0; j < attrNodes.length; j++) {
      ['placeholder', 'title', 'aria-label'].forEach(function (attr) {
        var key = attrNodes[j].getAttribute('data-i18n-attr-' + attr);
        if (key) attrNodes[j].setAttribute(attr, t(key));
      });
    }
  }

  function setLang(lang) {
    lang = valid(lang) || 'en';
    persist(lang);
    document.documentElement.lang = lang;
    applyStaticDom(document);
    window.dispatchEvent(new CustomEvent('nt-i18n:change', { detail: { lang: lang } }));
  }

  var NT = window.NT = window.NT || {};
  NT.i18n = Object.freeze({
    SUPPORTED_LANGS: SUPPORTED_LANGS,
    t: t,
    setLang: setLang,
    getLang: getLang,
    detectDefaultLang: detectDefaultLang,
    applyStaticDom: applyStaticDom
  });
  Object.defineProperty(NT, 'i18n', { writable: false, configurable: false });
})();
```

### Switcher markup (added to the shared header block, all 16 files)

```html
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

Placed immediately after the existing `.theme-switch` label, reusing its `margin-left`/`flex:none` spacing rules so it wraps alongside the theme toggle at the existing 760px breakpoint `[VERIFIED: assets/site.css:146-153]`, rather than introducing a new breakpoint.

### `data-i18n` on existing static markup (example from the hub)

```html
<a class="card" href="Euclidean Algorithm/euclidean-algorithm.html">
  <h2 data-i18n="hub.euclid.title">Euclidean Algorithm</h2>
  <p data-i18n="hub.euclid.desc">Divide the larger number by the smaller…</p>
  <span class="go" data-i18n="shared.openTool">Open tool →</span>
</a>
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|---------------|--------|
| No i18n — every page hardcodes English text | `data-i18n` scan + `t()` calls via a new `NT.i18n` module | This phase | First cross-cutting concern after Phase 7's shared-module refactor; follows the exact pattern Phase 7 established |

**Deprecated/outdated:** None — this is additive; nothing existing is being replaced.

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|----------------|
| A1 | Switcher control should be a native `<select>` showing each language's own autonym (English/Nederlands/Deutsch/Français/Español), not flag icons or translated labels | Architecture Patterns / Anti-Patterns | Low — easy to change the control's markup without touching the underlying `NT.i18n` API; purely a UI choice |
| A2 | Tool proper nouns (RSA, Diffie-Hellman, Shor's Algorithm, Euler, Fermat, Cayley, Venn) stay untranslated in nav/titles across all 5 languages | Terminology Glossary | Medium — if wrong, nav labels in non-English languages look inconsistent; cheap to fix later since it's a dictionary-value change, not an architecture change |
| A3 | Common-noun terms in multi-word tool names (e.g. "Chinese Remainder Theorem," "Equivalence Wheel") DO get translated per-language | Terminology Glossary | Medium — same cheap-to-fix profile as A2, but affects the 16-file nav block, so a correction is another full 16-file sweep |
| A4 | Dutch terms for several core concepts (totient, prime, group, isomorphism, modulus/congruence, elliptic curve) were not independently re-verified this session and rely on training knowledge | Terminology Glossary | High (pedagogical) — the project's stated core value is "the diagram teaches, the text supports it"; a wrong or non-standard term undermines that for Dutch learners specifically |
| A5 | Accept a brief FOUC flash of English text for returning non-English-preference users, rather than building a hide-until-ready mechanism, as the MVP-appropriate default | Common Pitfalls / Pitfall 4 | Low-Medium — purely a UX polish tradeoff; reversible in a later phase without touching the dictionary/API architecture |
| A6 | Language preference gets its own persistence implementation in `nt-i18n.js`, structurally parallel to but independent of `assets/theme.js`, rather than reusing `theme.js`'s functions directly or extending `NT.store` | Architecture Patterns / Pattern 2 | Medium — grounded in two files' own documented scope (quoted in Pattern 2), but the "own implementation" vs. "literal code reuse" boundary is a judgment call the planner could reasonably draw differently |
| A7 | Estimated 700-1,100 unique translatable strings across the 15 tool pages (before the ×5 language multiplication) | Summary | Medium — this is a heuristic grep-based estimate (counting `textContent`/`innerHTML` assignments, markup tags, and title/aria/placeholder attributes, with known double-counting), not an exhaustive extraction; actual count could differ meaningfully and change wave sizing |

## Open Questions

1. **Should the FOUC flash (Pitfall 4) be eliminated via a `body{visibility:hidden}`-until-ready pattern, or accepted for MVP?**
   - What we know: `theme.js` solves the analogous color-flash problem with a tiny inline pre-paint `<head>` script; no equivalent exists yet for text.
   - What's unclear: Whether a visible text flash is acceptable given this phase's `mode: mvp` framing, or whether it undermines success criterion 2's "without a full page reload where feasible" framing enough to warrant the extra complexity.
   - Recommendation: Ship the simple non-deferred-script approach (Pitfall 4's default) for MVP; revisit only if a later UAT pass flags it as jarring.

2. **Exact unique-string count and per-page breakdown for wave sizing.**
   - What we know: A heuristic grep gives ~1,400 raw signals across the 15 tool files (with known overlap/double-counting) plus ~50 hub-specific strings plus ~20 shared-chrome strings.
   - What's unclear: The true deduplicated count, and which strings are trivially shared across tools (e.g., "Play"/"Pause"/"Step" playback labels likely repeat identically across Sieve/Fermat's Method/Shor's Algorithm and could share one `shared.*` dictionary key instead of three per-tool keys).
   - Recommendation: Make a dedicated Wave 0 task to run a real string-extraction script (not just this research's heuristic grep) that produces the authoritative key list before translation work is estimated per-wave.

3. **Full terminology glossary needs native-speaker verification before the phase can claim "fully translated… no untranslated fallback strings" (success criterion 3).**
   - What we know: A handful of terms are `[CITED]` from Wikipedia/Wiktionary/Wikimedia; most are `[ASSUMED]` from training knowledge.
   - What's unclear: Whether every glossary term, once actually plugged into full sentences (not just as standalone nouns), reads naturally to a native speaker with a math background.
   - Recommendation: Add an explicit `checkpoint:human-verify` task before the phase-wide sweep, gating final sign-off on the glossary (and ideally full dictionary) being reviewed by a speaker of each non-English language.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Dev-only key-coverage/validation script (never shipped) | ✓ `[VERIFIED: node --version]` | v22.23.1 | — |
| Google Chrome (headless) | Optional browser-diff-style smoke check, reusing Phase 7's pattern | ✓ `[VERIFIED: which google-chrome]` | `/usr/bin/google-chrome` present | Skip headless smoke checks; rely on manual per-page/per-language click-through instead |
| npm / package registry | None — no packages needed this phase | n/a | n/a | n/a |

**Missing dependencies with no fallback:** None.
**Missing dependencies with fallback:** None — both probed dependencies are present.

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | None in project — dev-only Node.js script, following Phase 7's precedent `[VERIFIED: .planning/phases/07-shared-js-module-refactor/07-VALIDATION.md]` |
| Config file | none — Wave 0 writes a new `.planning/phases/06-multi-language-support/i18n-check.js` |
| Quick run command | `node .planning/phases/06-multi-language-support/i18n-check.js "<tool file>"` |
| Full suite command | `node .planning/phases/06-multi-language-support/i18n-check.js --all` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|---------------------|--------------|
| I18N-01 | Every page exposes the switcher in shared header | static DOM check (grep/parse for `#lang-switch-select` across all 16 files) | `node i18n-check.js --switcher-present --all` | ❌ Wave 0 |
| I18N-02 | `t()`/`setLang()`/`applyStaticDom()` resolve keys and fire the re-render event | unit (Node `vm`, mirrors Phase 7's `harness.js` approach) | `node i18n-check.js --api` | ❌ Wave 0 |
| I18N-03 | All 5 dictionaries have identical key sets; no `t()` call site references an undefined key | static key-coverage check (parse `assets/nt-i18n.js` + grep every tool file for `t('...')`/`data-i18n="..."` call sites) | `node i18n-check.js --coverage --all` | ❌ Wave 0 |
| I18N-04 | Language persists via cookie/localStorage/URL param, survives cross-tab `storage` events | unit (cookie/localStorage/URL functions in isolation, `vm`-loaded) + manual cross-tab check | `node i18n-check.js --persistence` | ❌ Wave 0 |
| I18N-05 | No functional regression in existing tool behavior or day/night theming after a language switch | headless differential, reusing Phase 7's `browser-diff.js` harness with an added "switch language, snap, switch back, snap" step | `node .planning/phases/07-shared-js-module-refactor/browser-diff.js "<tool file>"` (extended config) | ❌ Wave 0 (new step config per tool) |
| I18N-06 | `<html lang>` updates on switch; no `toLocaleString`/`Intl.NumberFormat` applied to math output | static grep gate (`toLocaleString`, `Intl.NumberFormat`) + DOM check (`document.documentElement.lang`) | `node i18n-check.js --no-locale-number-format --all` | ❌ Wave 0 |

### Sampling Rate

- **Per task commit:** Run `i18n-check.js --coverage "<tool file>"` for the page just translated, plus `--no-locale-number-format` on that same file.
- **Per wave merge:** Run the full `--all` suite across every page touched so far, plus a manual click-through of 1-2 sampled pages in all 5 languages.
- **Phase gate:** Full `--all` suite green, plus a manual pass switching every one of the 5 languages on every one of the 16 pages (this is the single largest manual QA line item in the phase — consider spreading it across waves rather than deferring entirely to the final gate).

### Wave 0 Gaps

- [ ] `.planning/phases/06-multi-language-support/i18n-check.js` — does not exist yet; needs: switcher-presence check, API unit tests, dictionary key-coverage check, persistence unit tests, locale-number-format grep gate
- [ ] A real string-extraction pass (not this research's heuristic grep) to produce the authoritative per-page key list before wave sizing is finalized (Open Question 2)
- [ ] `browser-diff.js` config additions (`.planning/phases/07-shared-js-module-refactor/browser-diff/<tool>.json`-style per-tool step files) adding a language-switch step, if the planner chooses to reuse Phase 7's differential harness for I18N-05

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|----------------|---------|-------------------|
| V2 Authentication | No | No auth anywhere in this client-only site |
| V3 Session Management | No | No sessions |
| V4 Access Control | No | No access-control boundaries |
| V5 Input Validation | Yes | The `?lang=` URL param must be validated against the exact `SUPPORTED_LANGS` allow-list before use, mirroring `theme.js`'s own `valid(theme)` allow-list function `[VERIFIED: assets/theme.js:39-40]` (`function valid(theme){ return (theme === 'day' || theme === 'night') ? theme : null; }`) |
| V6 Cryptography | No | Unaffected — RSA/DH/ECDH tools' own crypto demos are untouched by this phase |

### Known Threat Patterns for this stack

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|----------------------|
| Reflected/stored param → DOM injection via an unvalidated `?lang=` value | Tampering | Allow-list validation identical to `theme.js`'s `valid()` pattern; never use the raw param value in the DOM or as a dictionary lookup key without passing it through `valid()` first |
| Malformed/corrupted dictionary entry rendering as HTML | Tampering / Information Disclosure | Apply every translated string via `textContent`, never `innerHTML`, in `applyStaticDom()` and in every tool's `t()` call sites — consistent with this project's existing convention of rendering computed text via `textContent` |

## Sources

### Primary (HIGH confidence)

- This project's own codebase, read directly this session: `CLAUDE.md` (project root and `.claude/`), `.planning/REQUIREMENTS.md`, `.planning/ROADMAP.md`, `.planning/STATE.md`, `.planning/config.json`, `assets/nt-store.js`, `assets/theme.js`, `assets/nt-core.js`, `assets/site.css`, `index.html`, `RSA/rsa.html`, `Shors Algorithm/shors-algorithm.html`, `.planning/phases/07-shared-js-module-refactor/07-VALIDATION.md`, `.planning/phases/07-shared-js-module-refactor/checks/namespace.check.js`, `.planning/phases/07-shared-js-module-refactor/harness.js`, `.planning/phases/07-shared-js-module-refactor/browser-diff.js`

### Secondary (MEDIUM confidence)

- [Greatest common divisor — Wiktionary](https://en.wiktionary.org/wiki/greatest_common_divisor)
- [GREATEST COMMON DIVISOR — bab.la German](https://en.bab.la/dictionary/english-german/greatest-common-divisor)
- [GREATEST COMMON DIVISOR — bab.la French](https://en.bab.la/dictionary/english-french/greatest-common-divisor)
- [Euler's totient function — Wikidata](https://www.wikidata.org/wiki/Q190026)
- [Cayley table — Wikimedia Commons category](https://commons.wikimedia.org/wiki/Category:Cayley_tables)
- [CONGRUENCE translation — Reverso Spanish](https://dictionary.reverso.net/english-spanish/congruence)

### Tertiary (LOW confidence)

- Remaining Terminology Glossary cells marked `[ASSUMED]` — training-knowledge mathematical terms not independently re-verified via WebSearch this session; flagged for the mandatory human-verify checkpoint.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — zero-dependency conclusion is directly mandated by `[VERIFIED: CLAUDE.md]`, no ambiguity
- Architecture: HIGH — every pattern (module shape, header duplication, persistence design) is grounded in this session's direct reads of the existing modules, with line-cited quotes
- Pitfalls: MEDIUM — reasoned from the codebase's actual string-building patterns (concatenation examples verified in Shor's Algorithm) but extrapolated to "likely elsewhere" without a full extraction pass
- Terminology glossary: LOW-MEDIUM — partially `[CITED]`, partially `[ASSUMED]`; explicitly gated behind a human-verify checkpoint

**Research date:** 2026-10-01
**Valid until:** No external-ecosystem dependency to go stale (zero packages); the architecture recommendations are stable as long as the project's own `CLAUDE.md` conventions don't change. Re-check the Terminology Glossary's `[ASSUMED]` cells before shipping, not on a calendar basis.
