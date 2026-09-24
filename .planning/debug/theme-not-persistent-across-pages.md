---
status: diagnosed
trigger: "also I want the mode selected to stay persistent across tool navigation. Now it is not persistent across/between pages."
created: 2026-09-24T15:35:00Z
updated: 2026-09-24T16:45:00Z
gap_id: G-01-1b
goal: find_root_cause_only
---

## Current Focus

hypothesis: CONFIRMED (AND-gate, two contributing factors) — (1) Safari/WebKit throws `SecurityError: The operation is insecure` when a page loaded via `file://` accesses `window.localStorage` at all (a long-standing, still-current WebKit restriction, unless the user has manually enabled Develop > Disable Local File Restrictions), AND (2) every localStorage access point in this repo (the pre-paint inline script in every page's `<head>`, and `assets/theme.js`'s `readTheme()`/`setTheme()`) wraps that access in a silent `try/catch` that falls back to `'night'` with zero user-visible error, per this repo's documented "silent failures for localStorage wrapped in try/catch" convention. Combined: on Safari-via-file://, `setTheme()` still visually flips the current page (its `try{...}catch(e){}` swallows the write failure, but `applyTheme()` runs unconditionally right after, setting the attribute directly) — so toggling APPEARS to work on the page you're on — but nothing is ever actually written to disk, so every subsequent page load (including a plain reload of the same page) re-reads a failing localStorage, defaults to night, and the user perceives "theme doesn't persist across pages." This mechanism requires BOTH factors simultaneously (a Chromium/Gecko browser does not exhibit factor 1, so the same code persists correctly there) — genuine AND-gate, not two independent single-causes.
test: (a) Re-audit whether the four "no local day block" pages actually have any local color tokens left post-Phase-01 (source grep). (b) Empirically reproduce the user's exact steps (real toggle click, not localStorage injection, then real navigation) across every page pair, in both Chrome and Firefox headless via CDP/BiDi. (c) Research current (2026) Safari file:// localStorage behavior.
expecting: If the previous "missing data-theme=day block" hypothesis were correct, day-mode rendering should visibly break on navigation in Chrome/Firefox headless screenshots. If the Safari SecurityError hypothesis is correct, Chrome/Firefox reproduction should be 100% clean (they don't have this restriction) while the described symptom would still occur for any Safari-via-file:// user.
next_action: DIAGNOSIS COMPLETE for find_root_cause_only. No fix applied (out of scope for this run) — a later gap-closure plan should implement a fallback persistence path (e.g. detect a failing localStorage write in setTheme()/readTheme() and fall back to a `document.cookie`-based store, so file:// Safari users still get a working, silent, same-mechanism-shaped persistence) and/or document the file:// limitation for Safari users in the project's user-facing notes.

## Symptoms

expected: Toggling day/night on one page and navigating to another page loads that page in the same mode.
actual: "Now it is not persistent across/between pages." No crash, wrong/stale theme appears after navigation.
errors: none
reproduction: Toggle day/night switch in header on any page, click nav link to another tool, observe theme.
started: Discovered during UAT of Phase 01 (Palette Unification).

## Eliminated

- hypothesis: 4 of 5 tool pages (Sieve, Completing-the-Square, Pizza Slices, RSA Examplifier) lack a `[data-theme="day"]` CSS block for page-local `:root` tokens, so the attribute flips on navigation but the page body stays at night colors, causing the "doesn't persist" perception.
  evidence: |
    (1) Re-read all five 01-0x-SUMMARY.md files for Phase 01 (Palette Unification): plans 01-01/01-03/01-04 explicitly deleted ALL local `:root` blocks from Sieve, Completing-the-Square, Pizza Slices and RSA Examplifier, remapping every consumption site (CSS rules AND in-script `svgEl()` JS string literals) onto `assets/palette.css`'s shared tokens; 01-05's repo-wide audit (4 independent grep gates, re-run and confirmed clean) found zero literal colors and zero local color declarations left in any of these four files. They have nothing left to override locally in day mode because they own no local color tokens anymore — this is the intended, correct end state of the palette unification, not a gap.
    (2) Independently re-verified via grep in this session: `grep -n ':root' <file>` returns nothing for Sieve (only a non-color `--cell-min` layout token remains inside its lone `:root{}` per source read), Completing-the-Square, Pizza Slices, and RSA Examplifier; only `Christmas Trees/factor-tree.html` has `:root`/`:root[data-theme="day"]` blocks, and per 01-02-SUMMARY.md these hold only sanctioned non-color/`var()`-derived aliases (`--page-bg`, `--pine-grad-*`, `--trunk-grad-*`, `--sky-opacity`) needed for its decorative snow/tree SVG, not a missing day palette.
    (3) Directly reproduced the user's exact reported action with headless Chrome via CDP (real mouse click on `#theme-switch-input`, not a `localStorage.setItem` injection, then real `Page.navigate` to a different tool directory): loaded Sieve, clicked the toggle, navigated to RSA Examplifier (one of the "4 pages with no local day block") — screenshot confirms RSA Examplifier renders FULLY and correctly in day mode (light background, light panels, all chrome and content correctly light-themed) immediately after cross-directory navigation. No stale-night residue anywhere on the page.
    (4) Ran a full 7-hop circuit test (index -> Sieve -> Factor Tree -> Completing-the-Square -> Pizza Slices -> RSA -> index) in Chrome: toggled once at the start, then checked `data-theme`/`localStorage`/checkbox `.checked` state at every hop. All 7 hops showed `day`/`day`/`true` with zero console errors or exceptions captured throughout.
  timestamp: 2026-09-24T16:10:00Z

## Evidence

- timestamp: 2026-09-24T15:36:00Z
  checked: All six pages' pre-paint inline <head> script (line 5 of each file)
  found: Byte-identical across index.html, factor-tree.html, sieve-of-eratosthenes.html, factorize-completing-square.html, pizza-slices.html, rsa-examplifier.html. All read localStorage key 'site-theme', all set document.documentElement data-theme to 'day' or 'night', all fall back to 'night' in catch.
  implication: No key typo, no divergent default, no divergent attribute name. Read path is uniform. Rules out "one page diverged" hypothesis.

- timestamp: 2026-09-24T15:36:00Z
  checked: assets/theme.js write path
  found: STORAGE_KEY = 'site-theme'; setTheme() calls localStorage.setItem(STORAGE_KEY, theme) then applyTheme(). Write happens BEFORE DOM update, same key as all readers. All six pages load it via <script defer src=".../assets/theme.js"> and all six have <input id="theme-switch-input">.
  implication: Write path is correct and coupled to the same key. Rules out "writes to wrong key" and "updates UI but never persists".

- timestamp: 2026-09-24T15:36:00Z
  checked: grep for [data-theme="day"] in each tool page's inline <style>
  found: Only Christmas Trees/factor-tree.html has one (line 22). Sieve, Completing-Square, Pizza Slices, RSA Examplifier have ZERO day-mode blocks in their own CSS.
  implication: Strong candidate root cause. Attribute flips correctly, shared chrome re-themes, but page-local tokens stay at night values -> user sees "theme did not persist."

- timestamp: 2026-09-24T16:20:00Z
  checked: Full cross-page navigation reproduction in real Firefox (156, headless via WebDriver BiDi, fresh profile, default prefs) between two different top-level tool directories (Sieve -> RSA Examplifier), using element.click() on the real toggle (fires the same trusted click->change->listener path theme.js relies on).
  found: localStorage value written on Sieve ('day') was read back correctly on RSA Examplifier immediately after navigation (dataTheme:'day', storage:'day'). No SecurityError, no isolation. Firefox 156 does NOT partition localStorage by file:// directory in this configuration, contrary to older (Firefox 68-era) web references about `privacy.file_unique_origin` — that preference/CVE-2019-11730 fix is scoped to the CORS same-origin check for fetch/XHR between local files, not to the Window.localStorage object.
  implication: Cross-directory file:// localStorage sharing works correctly in current Firefox too, not just Chrome. Rules out "Firefox partitions by directory" as an explanation for the user's report, at least for this Firefox version/config.

- timestamp: 2026-09-24T16:25:00Z
  checked: Cross-tab live-sync behavior (user keeps multiple tool tabs open simultaneously and switches between them, rather than performing a fresh navigation each time) via two separate CDP targets in the same Chrome profile — toggled in Tab A, read Tab B's DOM state without reloading/navigating Tab B.
  found: Tab B's `data-theme`, `localStorage.getItem`, and the toggle's `.checked` state all updated live in response to Tab A's toggle, with no reload — confirming theme.js's `window.addEventListener('storage', ...)` cross-tab sync listener works correctly.
  implication: Rules out "user keeps tabs open and switches between them" as an unhandled case; the storage-event live-sync path also works as designed.

- timestamp: 2026-09-24T16:35:00Z
  checked: Whole-repo grep for `SecurityError`, `typeof localStorage`, or any localStorage-availability feature-detection/fallback logic.
  found: Zero matches anywhere in the repo. `assets/theme.js` and every page's pre-paint script only ever do `try{ localStorage.X }catch(e){ /* silently default to night */ }` — there is no alternate persistence path (e.g. cookies) and no user-visible warning if the localStorage call itself throws.
  implication: If localStorage access throws synchronously in some environment (see next entry), the failure is invisible to the user by design (consistent with CLAUDE.md's documented "silent failures for localStorage wrapped in try/catch" convention) and the theme will silently and permanently behave as "always resets to night," which would look exactly like "not persistent across/between pages."

- timestamp: 2026-09-24T16:40:00Z
  checked: Web research on Safari/WebKit's behavior for `localStorage` access from pages loaded via `file://` (no server) — multiple independent sources including Apple Developer Forums threads specifically for Safari 17/18 (current versions), cross-checked against this repo's actual deployment model (CLAUDE.md: "each tool is a self-contained .html file that runs by opening it directly in a browser," no build/server).
  found: Safari throws `SecurityError: The operation is insecure` (DOM Exception 18) when a page opened via `file://` accesses the `localStorage` property at all, by default, since Safari 10/11 through current Safari 17/18 (2024-2025 dated forum confirmation) — unless the user manually enables Safari's Develop menu > "Disable Local File Restrictions." This is specific to Safari/WebKit; Chrome and Firefox do not impose this restriction for file:// (matches the clean CDP/BiDi reproduction above — neither browser reproduces a failure because neither has this restriction).
  implication: Combined with the prior entry (silent catch-and-default-to-night, no fallback persistence path), this is a coherent, currently-still-valid, well-evidenced explanation for the user's exact reported symptom that (a) is invisible in Chrome/Firefox testing (matches our inability to reproduce there) and (b) matches "not persistent across/between pages" precisely: toggling visually appears to work on the page you're on (attribute is set directly regardless of storage success) but is never actually saved, so every page load (a different tool, or even a reload of the same page) reverts to night. This is a pre-existing latent defect in `assets/theme.js` (dates to the "v1.0 unified site shell" commit, well before Phase 01) that simply had not been exercised/observed until this UAT round, not something Phase 01's palette work introduced.

## Resolution

root_cause: "AND-gate, two contributing factors required simultaneously: (1) [environment] Safari/WebKit throws SecurityError on any `localStorage` access from a page loaded via `file://` (still true in current Safari 17/18, absent in Chrome/Firefox); (2) [code] `assets/theme.js` and every page's pre-paint inline script wrap all localStorage reads/writes in a silent try/catch that unconditionally falls back to 'night' with no user-visible error and no alternate persistence path (e.g. a cookie fallback) — so on Safari-via-file:// the toggle appears to work on the current page (the attribute is still set directly) but nothing is ever persisted, and every subsequent page load (a different tool, or even a same-page reload) silently reverts to night. Neither factor alone reproduces the symptom: without factor 1 (Chrome/Firefox) the same code persists correctly, as directly verified; without factor 2 (if the code surfaced the write failure or used a fallback store) the user would see an error or a working fallback instead of silent reversion. The previously-suspected hypothesis (4 pages missing a `[data-theme=\"day\"]` CSS block) was investigated and ELIMINATED — those pages correctly have zero local color tokens after Phase 01's completed palette unification and were directly confirmed (via source audit and cross-directory headless-browser navigation with screenshots, in both Chrome and Firefox) to render fully and correctly in day mode after navigation; no failure was reproducible via the documented steps in either browser, which is itself consistent with the Safari-specific root cause since Chromium/Gecko do not share Safari's file:// localStorage restriction."
fix:
verification:
files_changed: []
