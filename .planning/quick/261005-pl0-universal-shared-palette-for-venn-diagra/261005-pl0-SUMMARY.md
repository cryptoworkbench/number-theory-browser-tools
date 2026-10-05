---
phase: quick-261005-pl0
plan: 01
subsystem: shared-state, factor-tree, venn-diagram, sieve-of-eratosthenes
tags: [nt-store, palette, i18n, cross-tool-sync]
requires: []
provides:
  - "NT.store number-palette API: SHARED_PALETTE_KEY, SHARED_PALETTE_MAX, SHARED_PALETTE_MAX_N, readSharedPalette, loadSharedPalette, addToSharedPalette, removeFromSharedPalette"
  - "Venn Diagram Add field, bin and Delete removal; composite chips place as prime factors"
  - "Sieve 'Add found primes to palette' button"
affects:
  - assets/nt-store.js
  - Factor Tree/factor-tree.html
  - Venn Diagram/venn-diagram.html
  - Sieve Of Eratosthenes/sieve-of-eratosthenes.html
tech-stack:
  added: []
  patterns: ["read-modify-write shared store with legacy-key migration", "storage/pageshow reconcile without write-back"]
key-files:
  created:
    - .planning/quick/261005-pl0-universal-shared-palette-for-venn-diagra/shared-palette-probe.js
  modified:
    - assets/nt-store.js
    - assets/i18n/factor-tree.js
    - assets/i18n/venn-diagram.js
    - assets/i18n/sieve-of-eratosthenes.js
    - Factor Tree/factor-tree.html
    - Venn Diagram/venn-diagram.html
    - Sieve Of Eratosthenes/sieve-of-eratosthenes.html
    - .planning/phases/07-shared-js-module-refactor/checks/store.check.js
    - .planning/phases/07-shared-js-module-refactor/shadow-check.js
key-decisions:
  - "One persisted key number-palette (ascending integer array, 2..1e12, max 1000 entries, duplicates allowed, [] valid) drives Factor Tree and Venn; the Sieve merges into it"
  - "Oversized payloads expire the cookie and ride localStorage only"
  - "Venn places a composite as its prime factors in one commitRegions gesture; a gesture that grows a circle's number past 2^53 is refused"
requirements-completed: [QUICK-PALETTE-01, QUICK-PALETTE-02]
status: complete
commits: 3
plan_head_before: ad0db731508bdf7d8a06f0496b769d6fb2956efb
plan_head_after: 353a1542094cf9009d80338f431a1be463f0a89f
actuals:
  tokens: 24700
  tasks: 3
  commits: 3
completed: 2026-10-05
---

# Quick 261005-pl0: Universal shared palette for Factor Tree, Venn Diagram and the Sieve

Factor Tree and Venn Diagram now render one shared, persisted number palette (`number-palette` in NT.store), Venn gained Factor Tree's Add behaviour plus a bin and Delete removal, and the Sieve of Eratosthenes can merge its found primes into the palette uniquely.

## Commits

| Task | Commit | Summary |
| ---- | ------ | ------- |
| 1 (tracer) | d659667 | NT.store palette API with legacy-key migration and oversized-cookie guard; Factor Tree and Venn read and write it; probe N1-N8, C1, C2 |
| 2 | 15ff7c5 | Venn Add field, bin drop target, Delete removal, composite-to-prime-factor placement, exact-integer guard; Factor Tree palette-full message; 16-language i18n; probe V1-V6, F1 |
| 3 | 353a154 | Sieve button plus translated status line (16 languages, plural shapes); shadow-check watch-list; probe S1-S5 |

## Verification

- `shared-palette-probe.js`: PL0-PROBE PASS (24 scenarios: N1-N8, C1a/C1b/C2, V1-V6, F1, S1-S4, S5a/S5b). It runs real headless Chrome with a shared profile per sequence, so cross-page persistence is exercised, not mocked.
- `i18n-check.js --all`: all PASS. `shadow-check.js --all`: all PASS. `harness.js`: HARNESS PASS (store key-set check includes the seven new exports).
- Enter probe (`261005-edj`): PASS (9 scenarios).
- Scope guard: nt-core, nt-bigint, nt-svg, nt-layout, nt-i18n, site.js, hub.js and index.html are byte-identical to ad0db73.
- Screenshots of the Venn and Sieve pages taken in headless Chrome and inspected; the layout looks right.

## Verification not passing or not done (honest report)

- Older probes already fail at the base commit (ad0db73), identically before and after this plan, so they were NOT changed and are not caused by this work:
  - `261005-kaz .../palette-probe.js`: 23 pass / 10 fail (P4, P8, P9, P12, P13 in the default and reduced runs). The failure set is byte-identical to a run from a `git archive` of ad0db73.
  - `261005-dn2 .../dblclick-probe.js`: 7 pass / 1 fail (S8 two-overlap-tree-preview), same at base.
  These look like stale expectations left by later Factor Tree and Venn tasks. No expectation updates were needed for this plan's changes (the chip-count and heading changes do not touch what those probes assert). Out of scope; candidates for a separate cleanup.
- The plan's human check was NOT done: a real-mouse HTML5 drag onto the Venn bin and regions in a visible browser, and real cross-page navigation in Chrome and Firefox over file://. The probe dispatches synthetic DragEvents and KeyboardEvents, which proves the handlers but not native drag feel. Firefox was not tested at all.

## Notes for the user

- **Palette cap (PD-6).** The 1000-number limit is Factor Tree's existing palette-read limit, carried over, not a new one. It is reachable: a full N=20000 sieve finds 2262 primes, so Add found primes fills the palette (30 default + 970 smallest new primes) and the status line reports 1262 primes not added. Probe S4/S5 covers exactly this.
- **Firefox file:// limitation (PD-2).** A palette whose encoded JSON is over 3800 characters cannot ride a cookie, so `writeShared` expires the cookie and localStorage alone carries it. On Firefox over file://, where localStorage is per document, such a palette only syncs within one page's own origin. Documented in the nt-store.js header. Small palettes (a few hundred small numbers) still use the cookie.
- **Doc follow-up.** CLAUDE.md's NT.store persisted-key sentence (currently names `group-params` and `ab-params`) should also mention `number-palette` and its payload shape. Not edited, per the plan.
- **Migration.** Factor Tree's old per-tool `factor-tree-palette` key is merged into `number-palette` on first load (max-count multiset merge when both exist) and then removed.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] `effectAllowed = 'copyMove'` tripped i18n-check literals-js**
- **Found during:** Task 2
- **Fix:** used `'all'`, which still permits both the copy (regions) and move (bin) drop effects.
- **Files modified:** Venn Diagram/venn-diagram.html
- **Commit:** 15ff7c5

**2. [Rule 2 - Missing critical] Region drop handlers accepted any parsed integer**
- **Issue:** with composites placeable, a dropped text such as a 22-digit number would hit unbounded trial division in `primeFactors`.
- **Fix:** `isPlaceable` caps dropped and armed values at `SHARED_PALETTE_MAX_N` (1e12) and requires an integer >= 2.
- **Commit:** 15ff7c5

**3. [Rule 2 - Missing critical] Wide palette numbers could overlap placed tokens**
- **Issue:** the plan sizes placed token rects with `badgeWidth`; two long rects in one two-column row would overlap.
- **Fix:** two-circle regions fall back to one token per row when any token is wider than 62px (more than 4 digits). Numbers up to 4 digits keep their two-column layout; 4-digit tokens are 60px wide instead of 54px (the plan's "up to 4 digits look unchanged" is exact only up to 3 digits).
- **Commit:** 15ff7c5

**4. [Note] Probe sequence design**
- Plan scenario S5 is reported as two lines (S5a Factor Tree, S5b Venn), so the probe reports 24 scenario lines for the plan's N1-N8, C1-C2, V1-V6, F1, S1-S5 set. C1 is likewise split into C1a and C1b.

**5. [Note] Commits on main**
- The caller instructed work in place on `main` (this project's `git.branching_strategy` is "none" and recent history commits to main), so the pre-commit protected-branch assertion's default-branch refusal was not applied. No other branch was involved.

## Known Stubs

None.

## Threat Flags

None. The new surface (number-palette store key, storage-event listeners, Add inputs) is the one the plan's threat model already covers: values are validated through `readSharedPalette`, receivers never write back, and text reaches the DOM only via `textContent`/`translate`.

## Self-Check: PASSED

- Files exist: assets/nt-store.js, shared-palette-probe.js, the three tool pages and three i18n files (all modified or created above).
- Commits exist on HEAD: d659667, 15ff7c5, 353a154 (3 commits since ad0db73, measured with `git rev-list --count`).
