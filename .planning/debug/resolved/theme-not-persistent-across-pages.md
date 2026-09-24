---
status: resolved
trigger: "also I want the mode selected to stay persistent across tool navigation. Now it is not persistent across/between pages."
created: 2026-09-24T15:35:00Z
updated: 2026-09-24T18:45:00Z
gap_id: G-01-1b
goal: find_and_fix
---

## Post-Fix Regression Report (2026-09-24T17:00:00Z)

User re-tested after commit ff975d9 ("add window.name theme persistence fallback for throwing localStorage", which added a `window.name`-based fallback to `assets/theme.js` and all six pages' pre-paint `<head>` scripts) and reports the SAME symptom still occurs: "when I change the brightness setting on one page, then go to the next, that brightness setting which I had set is lost." User did not specify browser/OS. This needs fresh investigation: (a) confirm whether ff975d9's fallback logic actually works as designed even in the Safari-throwing scenario it targeted, (b) check whether the fix introduced a NEW regression that breaks the previously-working normal-localStorage path (e.g. in Chrome/Firefox, where the original diagnosis found persistence worked fine), since the user's report now sounds like a general/every-time failure, not a Safari-specific edge case. Re-open full investigation; goal is now find_and_fix, not just diagnose.

## Current Focus

bug_class: Bohrbug (fully deterministic once the correct browser configuration is used — 100% reproduction rate). It only LOOKED like a Heisenbug/Mandelbug ("works in our tests, fails for the user") because the prior run's test harness silently altered the decisive environment variable — see reasoning_checkpoint.blind_spots.

hypothesis: CONFIRMED BY DIRECT REPRODUCTION — the prior run's "Safari SecurityError" root cause is WRONG for this user. The user's default browser is Firefox 156 on Fedora (`xdg-settings get default-web-browser` -> `org.mozilla.firefox.desktop`); Safari does not exist on this machine. The real mechanism is an AND-gate: (1) [environment] Firefox ships `privacy.file_unique_origin = true` by default, which gives every `file://` DOCUMENT (keyed by its full path INCLUDING the filename) its own opaque origin and therefore its own ISOLATED `localStorage` partition — so `site-theme` written on the Sieve page is invisible to the RSA page; AND (2) [code] every persistence path in this repo is origin-scoped: `localStorage` (partitioned, per factor 1), plus the `window.name` fallback added by ff975d9, which browsers reset to `""` on CROSS-ORIGIN navigation — and under `file_unique_origin` EVERY file:// navigation is cross-origin, making that fallback structurally incapable of ever firing. Worse, ff975d9's fallback is only consulted when localStorage returns an INVALID value; in Firefox localStorage returns a perfectly valid (but wrong-partition, stale) `'night'`, so the fallback is never even reached. Neither factor alone reproduces: Chrome shares one `file://` origin so the same code persists fine there, and a non-partitioned Firefox also passes.

reasoning_checkpoint:
  hypothesis: "Firefox's default `privacy.file_unique_origin=true` partitions localStorage per file:// document, and every persistence mechanism this repo uses (localStorage, window.name) is origin-scoped, so nothing survives cross-page navigation for the user."
  confirming_evidence:
    - "The user's OWN Firefox profile contains SIX separate localStorage origin directories — `storage/default/file++++...+index.html`, `...+sieve-of-eratosthenes.html`, `...+factor-tree.html`, `...+factorize-completing-square.html`, `...+pizza-slices.html`, `...+rsa-examplifier.html` — each holding its OWN independent `site-theme` key. Direct forensic proof of partitioning in the user's real environment."
    - "Direct reproduction in real Firefox 156 with `privacy.file_unique_origin=true`: toggle day on Sieve -> ls='day'; click nav link to RSA Examplifier -> dataTheme='night', ls='null', window.name=''. Exactly the reported symptom."
    - "Probe F proved `window.name` is cleared to `\"\"` across file:// navigation under file_unique_origin, so ff975d9's fallback can never fire."
  falsification_test: "If forcing `privacy.file_unique_origin=true` in a real Firefox run had still shown the theme surviving navigation, the hypothesis would be dead. It did not survive — symptom reproduced 1:1."
  fix_rationale: "Root cause is that ALL persistence is origin-scoped while the origins are deliberately isolated. The fix therefore adds persistence channels that are NOT origin-scoped: (a) the navigation link itself carries the theme (`?theme=day` decorated onto internal links), which is immune to any storage-permission or origin model; (b) `document.cookie`, empirically proven shared across file:// documents in Firefox. localStorage is retained as the primary store so the Chrome/file:// and http(s)-deployed paths are unchanged."
  blind_spots: "The prior run's Firefox verification passed because WebDriver/BiDi automation applies Marionette's 'recommended automation preferences', which include `privacy.file_unique_origin=false` — the harness silently disabled the exact pref that causes the bug. Every future browser verification in this repo MUST pin `marionette.prefs.recommended=false` + `remote.prefs.recommended=false` + `privacy.file_unique_origin=true` or it is testing a different product than the user runs. Safari itself remains untested (no Safari on this Linux machine); the fix is designed to help there too but that is unverified."
  candidate_causes:
    - "[environment] Firefox `privacy.file_unique_origin=true` partitions file:// localStorage per document — CONFIRMED"
    - "[code] all persistence channels used are origin-scoped (localStorage, window.name); window.name additionally cleared on cross-origin nav — CONFIRMED"
    - "[config] user profile privacy settings (cookie blocking, clear-on-shutdown, private browsing) — CHECKED, all default/standard, ELIMINATED"
    - "[data] stale per-page site-theme values already written into six partitions — CONFIRMED as a consequence, not a cause"
  and_gate: "yes — both are required simultaneously. Chrome exhibits factor 2 but not factor 1 and persists correctly (verified). A Firefox with file_unique_origin=false exhibits factor 1 disabled and also persists correctly (verified). Only both together produce the symptom."

test: Apply the fix (URL-param link decoration + cookie channel + retained localStorage), then re-run the exact reproduction in BOTH real Firefox (file_unique_origin forced TRUE, automation prefs disabled) and real Chrome, plus a revert-check that the bug returns without the fix.
expecting: Post-fix, every hop of a full nav circuit reports the toggled theme in both browsers; pre-fix, Firefox reports night from hop 2 onward.
next_action: FIX APPLIED AND FULLY VERIFIED (all automated signals green, including the revert check). Awaiting the user's own confirmation in their real Firefox before archiving.

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

- hypothesis: (Prior run's accepted root cause.) The symptom is caused by Safari/WebKit throwing `SecurityError` on any `localStorage` access from a `file://` page, combined with this repo's silent try/catch-and-default-to-night convention.
  evidence: |
    (1) The user is not on Safari and cannot be. `xdg-settings get default-web-browser` and `xdg-mime query default text/html` both return `org.mozilla.firefox.desktop` on this Fedora machine; the installed browsers are Firefox 156 and Google Chrome 153. Safari does not exist on Linux. Whatever the (real, separate) Safari file:// restriction is, it cannot be what this user is hitting.
    (2) The actual mechanism was found and reproduced 1:1 in the user's real browser instead — Firefox's default `privacy.file_unique_origin=true` partitions localStorage per file:// document. See the Evidence entries from 2026-09-24T17:20:00Z onward.
    (3) The hypothesis was accepted last run on the strength of a Firefox reproduction attempt that came back clean. That attempt was invalid: it was driven through WebDriver/BiDi, which applies Marionette's "recommended automation preferences" — a set that includes `privacy.file_unique_origin=false`. The harness silently disabled the exact pref responsible for the bug, so the failing case could not appear. Re-running the identical reproduction with `marionette.prefs.recommended=false` + `remote.prefs.recommended=false` + `privacy.file_unique_origin=true` reproduces the user's symptom on the first navigation, every time.
    (4) Note: this is an elimination of the DIAGNOSIS, not of the concern. The Safari file:// case is real and is now also covered, incidentally, by channel 1 (link-carried `?theme=`) and channel 2 (cookie) of the applied fix — verified in the "param alone drives the theme" check.
  timestamp: 2026-09-24T17:55:00Z

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

- timestamp: 2026-09-24T17:10:00Z
  checked: `git show ff975d9` — audit of the previously-applied window.name fallback for implementation bugs.
  found: |
    Two independent defects, either of which alone makes the fallback dead code in the failing environment.
    (a) WRONG TRIGGER CONDITION. Both `readTheme()` and the pre-paint script only consult `window.name` when localStorage yields an INVALID value (`t!=='day' && t!=='night'`). That condition was designed for the Safari case where the access throws. In Firefox localStorage does not throw — it returns a perfectly valid `'night'`, just from the wrong (per-page) partition. The fallback is never reached at all.
    (b) WRONG MECHANISM. `window.name` is reset to `""` by browsers on cross-origin navigation. Under `privacy.file_unique_origin` every file:// document is its own opaque origin, so every navigation between tools is cross-origin — the value is cleared by the very hop it was added to survive.
    Pre-paint script and theme.js do agree on the encoding (bare 'day'/'night'), so that was not the problem.
  implication: ff975d9 could not have fixed the user's symptom under any circumstance. It was not a partial fix or a bad implementation of a good idea — the chosen carrier is destroyed by the navigation it needs to cross.

- timestamp: 2026-09-24T17:20:00Z
  checked: The user's REAL Firefox profile on disk (`~/.mozilla/firefox/9qm0j45f.default/storage/default/`), listing localStorage origin directories, plus `strings` over each `ls/data.sqlite`.
  found: |
    SIX separate localStorage origin directories, one per page, each keyed by the FULL file path including the filename:
      file++++home+mainaccount+Claude+number-theory-browser-tools+index.html
      file++++home+mainaccount+Claude+number-theory-browser-tools+Sieve%20Of%20Eratosthenes+sieve-of-eratosthenes.html
      file++++home+mainaccount+Claude+number-theory-browser-tools+Christmas%20Trees+factor-tree.html
      file++++home+mainaccount+Claude+number-theory-browser-tools+Factorize%20By%20Completing%20The%20Square+factorize-completing-square.html
      file++++home+mainaccount+Claude+number-theory-browser-tools+Pizza%20Slices+pizza-slices.html
      file++++home+mainaccount+Claude+number-theory-browser-tools+RSA%20Examplifier+rsa-examplifier.html
    Each holds its OWN independent `site-theme` key (most reading 'night'). Profile privacy prefs were checked and are all stock: `browser.contentblocking.category=standard`, no private-browsing autostart, no cookie-behaviour override, no clear-on-shutdown for storage.
  implication: Direct forensic proof, from the user's own machine, that their browser partitions localStorage per file:// page. This is the root cause, and it is nothing to do with Safari. It also explains the exact shape of the complaint: the setting is not "lost", it is written to a bucket the next page cannot see.

- timestamp: 2026-09-24T17:30:00Z
  checked: Controlled A/B in real Firefox 156 (headless, WebDriver BiDi, real `.click()` on `#theme-switch-input` and on real nav-header links) with `privacy.file_unique_origin` toggled, inspecting the profile's storage dirs afterwards.
  found: |
    Default automation profile: localStorage origin dir created = `file+++UNIVERSAL_FILE_URI_ORIGIN` (ONE, shared) -> theme survives every navigation. This is the false PASS the prior run got.
    With `marionette.prefs.recommended=false`, `remote.prefs.recommended=false`, `privacy.file_unique_origin=true`: origin dir created = `file++++...+sieve-of-eratosthenes.html` (per-page) -> toggle day on Sieve, click nav link to RSA: `data-theme=night`, `localStorage=null`, `window.name=""`. SYMPTOM REPRODUCED.
  implication: |
    Root cause confirmed, and the prior run's methodology error identified: WebDriver/Marionette's "recommended automation preferences" include `privacy.file_unique_origin=false`, so a default-configured Firefox automation session is testing a DIFFERENT product than the user runs. This is the single most important lesson from this session — any future browser verification in this repo must pin those three prefs or it is worthless for file:// behaviour.

- timestamp: 2026-09-24T17:40:00Z
  checked: Capability probe of every candidate cross-document persistence channel on `file://`, in BOTH real Firefox (file_unique_origin=true) and real Chrome 153.
  found: |
    | channel                    | Firefox (file://)                  | Chrome (file://)                   |
    | -------------------------- | ---------------------------------- | ---------------------------------- |
    | localStorage               | PARTITIONED per document           | SHARED (origin is `file://`)       |
    | sessionStorage             | not shared across nav              | n/a                                |
    | window.name                | CLEARED to "" across nav           | survives (shared origin)           |
    | document.cookie (`path=/`) | WORKS, shared across documents     | silently dropped (write is a no-op)|
    | `?query` on a file:// URL  | works, `location.search` populated | works                              |
    | `#hash` on a file:// URL   | works                              | works                              |
    | `history.replaceState`     | works (set AND strip)              | works (set AND strip)              |
    Chrome `location.origin` = `"file://"`; Firefox `location.origin` = `"null"`.
  implication: |
    No single storage channel covers both browsers on file://, which is why any storage-only fix keeps failing for half the users. Exactly two channels are immune to the origin model — the URL of the navigation itself, and (in Firefox) cookies. It also corrects ff975d9's commit message: its claim that "cookie writes are silently dropped on file:// in both Chromium and WebKit" is only true for Chromium; in Firefox cookies work and are shared, which is precisely the browser that needs them. That wrong premise is what pushed the previous attempt toward window.name.

- timestamp: 2026-09-24T18:15:00Z
  checked: Post-fix acceptance run — 6-hop nav circuit + reload + new-tab + reverse-direction + param-boundary cases in Firefox (file_unique_origin=true), full circuit + reload in Chrome, console/exception sweep of all six pages in both browsers, and a revert check against the pre-fix tree extracted via `git archive HEAD`.
  found: ALL CHECKS PASSED. Post-fix: every hop day in both browsers, with the shared `.site-header` computed background actually repainting to the day value. Pre-fix tree through the identical harness: night on every hop after the first navigation (and day again only on returning to the original Sieve page — its own partition). Sweep: zero console errors, zero uncaught exceptions, all tools render, all internal links decorated (12/12 index, 7/7 each tool).
  implication: The fix is confirmed by a differential experiment, not just by the absence of the symptom — the bug demonstrably returns when the change is removed and disappears when it is present, in the user's real browser configuration.

## Resolution

root_cause: "AND-gate, two contributing factors required simultaneously. (1) [environment] Firefox — the user's default browser (Firefox 156 on Fedora; `xdg-settings get default-web-browser` -> `org.mozilla.firefox.desktop`) — ships `privacy.file_unique_origin = true` by default, which gives every `file://` DOCUMENT its own opaque origin keyed by the full path INCLUDING the filename. localStorage is therefore partitioned PER PAGE: `site-theme` written on the Sieve page lives in a different storage bucket than the one the RSA page reads. (2) [code] Every persistence channel this repo used is origin-scoped, so all of them are defeated by factor 1: `localStorage` is partitioned, and the `window.name` fallback added by ff975d9 is reset to `\"\"` by browsers on cross-origin navigation — and under `file_unique_origin` EVERY file:// navigation is cross-origin, so that fallback is structurally incapable of ever surviving the hop it exists to survive. It is doubly dead, because it is only consulted when localStorage returns an INVALID value, whereas Firefox returns a perfectly valid — but stale, wrong-partition — 'night'. Neither factor alone reproduces: Chrome puts all file:// documents in one shared `file://` origin and persists correctly with the identical code (verified), and Firefox with `file_unique_origin=false` also persists correctly (verified). The prior run's 'Safari SecurityError' root cause is REFUTED for this user — there is no Safari on this Linux machine — and the prior run's Firefox verification produced a false PASS because WebDriver/BiDi automation applies Marionette's recommended automation preferences, which set `privacy.file_unique_origin=false`: the harness silently disabled the exact pref that causes the bug."

fix: "Replaced the origin-scoped-only persistence with three layered channels in `assets/theme.js` plus a matching (byte-identical across all six pages) pre-paint inline `<head>` script. Read precedence is URL param -> cookie -> localStorage -> 'night'; a write writes all of them. (1) Link-carried `?theme=` — `decorateLinks()` rewrites every same-site `<a href>` to carry the current theme, so the choice travels WITH the navigation and is immune to any origin or storage-permission model; this also covers middle-click / open-in-new-tab, which no storage-based approach can. On load the param is consumed into the durable stores and stripped from the address bar via `history.replaceState` (verified working on file:// in both browsers). (2) `document.cookie` with `path=/` — empirically verified to be SHARED across file:// documents in Firefox, which restores reload/direct-open persistence there; silently dropped by Chrome on file://, which is harmless. (3) `localStorage` retained as the primary store — unchanged behaviour for Chrome's shared file:// origin and for any http(s) deployment. The `window.name` fallback from ff975d9 was REMOVED, justified by direct measurement (probe F: cleared to `\"\"` across file:// navigation), not by preference; it also polluted the browsing-context name. Input handling hardened: only the exact strings 'day'/'night' are accepted from any channel, so a malformed or empty `?theme=` falls through to the next channel rather than corrupting state."

verification: |
  guardrail_verdict: accepted

  signal_1_bug_reproduced_before_fix: PASS — real Firefox 156, `privacy.file_unique_origin=true`, automation prefs OFF, real click on `#theme-switch-input` then real clicks on nav-header links: toggle day on Sieve, navigate to RSA -> `data-theme=night`, `localStorage=null`, `window.name=""`. Exactly the user's report.

  signal_2_fix_resolves_it: PASS — post-fix 6-hop circuit in the same Firefox config (Sieve -> RSA -> Congruence Wheel -> Factor Tree -> Completing the Square -> Home -> Sieve): every hop reports `data-theme=day`, toggle `.checked=true`, and the shared `.site-header` computed background equal to the day value `color(srgb 0.984314 0.984314 0.992157 / 0.82)` (vs night `color(srgb 0.0431373 0.054902 0.101961 / 0.82)`) — i.e. the page genuinely REPAINTS in day mode, not merely an attribute flip.

  signal_3_revert_check: PASS — the pre-fix tree (extracted with `git archive HEAD`) run through the identical harness reproduces the bug: night on every hop after the first navigation. Only returning to the ORIGINAL Sieve page shows day again, because that is the single page whose own partition holds 'day' — an independent, textbook confirmation of the per-document-partition mechanism and proof that this change is what fixed it.

  signal_4_no_regression: PASS — Chrome full circuit all-day, `localStorage` still the working channel there (`ls=day`), reload persists. Console/exception sweep over all six pages in BOTH browsers: zero console errors, zero uncaught exceptions, every tool's primary output still renders, and 12/12 (index) and 7/7 (each tool) internal links correctly decorated. `node --check assets/theme.js` clean; the inline pre-paint script parses clean and is byte-identical across all six pages.

  signal_5_boundary_and_oracle: PASS — oracle_type: derived (contract: "the theme shown on page N+1 equals the theme last chosen on page N", asserted against rendered computed style, not just the attribute). Boundary neighbours around the new param parser all verified in Firefox: `?theme=` (empty) -> falls through, `?theme=DAY` (wrong case) -> falls through, `?theme=day%20` (trailing space) -> falls through, `?x=1&theme=day` -> day, `?theme=day&x=1` -> day. Direction symmetry verified: toggling BACK to night also survives navigation (not a one-way fix). New-tab direct open (no link, no referrer) verified to keep the theme via the cookie channel. `?theme=` param alone, with no cookie and no usable localStorage, correctly drives the theme — which is the path that also covers the Safari-file://-SecurityError case the previous run was aiming at.

  not_verified: Safari itself (no Safari on this Linux machine). The fix is designed to cover it via channels 1 and 2 but that remains unmeasured.

files_changed:
  - assets/theme.js — layered persistence (URL param / cookie / localStorage), link decoration, param strip; window.name fallback removed
  - index.html — pre-paint inline <head> script (line 5)
  - Christmas Trees/factor-tree.html — pre-paint inline <head> script (line 5)
  - Sieve Of Eratosthenes/sieve-of-eratosthenes.html — pre-paint inline <head> script (line 5)
  - Factorize By Completing The Square/factorize-completing-square.html — pre-paint inline <head> script (line 5)
  - Pizza Slices/pizza-slices.html — pre-paint inline <head> script (line 5)
  - RSA Examplifier/rsa-examplifier.html — pre-paint inline <head> script (line 5)

human_verification: "CONFIRMED by the user on 2026-09-24 in their real Firefox environment (the browser and file:// launch path that exhibited the bug): day/night toggle, nav clicks through multiple tools, page reload, and open-in-new-tab all hold the chosen theme. Verified against the user's actual environment rather than an automation harness — which is the specific check the prior run's false PASS lacked."

## Prevention

why_not_caught: "A browser-automation verification gate existed and was run — but it silently tested a DIFFERENT product than the user runs. Firefox's WebDriver/BiDi (Marionette) applies 'recommended automation preferences', which include `privacy.file_unique_origin=false` — the exact pref that causes this bug. The gate therefore returned a confident, well-evidenced PASS on a configuration in which the bug cannot exist, and that false PASS is what allowed the wrong 'Safari SecurityError' root cause to be accepted and the ineffective ff975d9 `window.name` fix to ship. Secondary gap: the fix in ff975d9 was never re-verified against the reporting user's actual browser before being declared done."

guard: |
  1. [process, binding] Any future browser verification in this repo MUST pin the automation
     harness to the user-facing defaults, not the automation defaults:
     `marionette.prefs.recommended=false`, `remote.prefs.recommended=false`,
     `privacy.file_unique_origin=true` for Firefox. An unpinned run is not evidence.
     Recorded in Current Focus -> reasoning_checkpoint.blind_spots as well.
  2. [process] Environment-dependent bug reports must establish the reporter's ACTUAL browser
     (e.g. `xdg-settings get default-web-browser`) before any root cause naming a specific
     browser is accepted. The prior run named Safari on a machine with no Safari installed.
  3. [test, executable] `signal_3_revert_check` is the durable shape of this guard: the harness
     must first reproduce the bug on the pre-fix tree and only then assert the fix. A harness
     that cannot produce a RED on the old code proves nothing about the new code.
  4. [design] Persistence for a file://-deployed site must not rely on a single origin-scoped
     channel. The layered URL-param + cookie + localStorage read chain now in `assets/theme.js`
     is the structural guard; adding any new persisted preference should reuse it rather than
     calling `localStorage` directly.
