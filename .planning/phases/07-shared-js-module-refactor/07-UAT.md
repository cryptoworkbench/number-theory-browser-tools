---
status: testing
phase: 07-shared-js-module-refactor
source: [07-VERIFICATION.md]
started: 2026-10-01T00:00:00Z
updated: 2026-10-01T00:00:00Z
---

## Current Test

[testing complete]

## Environment for tests 1–4

Run by Claude via Claude in Chrome in the user's real Chrome. The extension refused file:// URLs even with
"Allow access to file URLs" enabled, so the repo was served over http://127.0.0.1:8765 (python3 -m
http.server, localhost only). Same pages, same code paths; tabs share one origin exactly as file:// pages do.

## Tests

### 1. Live cross-tab sync (Cayley Table ⇄ Equivalence Wheel, Euclidean Algorithm ⇄ Venn Diagram)
expected: The other tab updates without a reload, same as pre-phase behavior
result: pass
notes: |
  Cayley→Wheel: mode multiplicative + N=12 arrived, wheel re-rendered. Wheel→Cayley: mode additive arrived
  (12×12 table); slider N=31, 32 arrived (32×32 table). Euclidean→Venn: a=144,b=12 arrived, Venn redrew
  (A=144, B=12). Venn→Euclidean: b=420 and b=4620 arrived and the inputs updated. No console errors.
  Two intermittent misses (Wheel N=30 → Cayley; first Venn b=60 → Euclidean) — the storage event arrived,
  but the receiving tab's readShared() read the cookie first, before the writer's cookie write had
  propagated, saw the old value and returned early. Pre-existing: the read order (cookie, then
  localStorage) and the write order (localStorage, then cookie) are unchanged from BASE (bf658d9). It can
  only occur when cookies work (http hosting); Chrome sets no cookies on file://, so readShared falls back
  to localStorage there. Not a phase-7 regression. Fixed in d0a4092: storage handlers now parse the event's
  newValue instead of re-reading the cookie; re-tested 40/40 rapid updates on each pair (old code: 1 in 20 dropped).

### 2. Venn Diagram pointer-drag of a placed prime between regions
expected: The prime moves regions and the product/overlap labels update, matching pre-phase behavior
result: pass
notes: |
  Dragged 11 from "B only" to "both": message "Moved 11 to the both region.", A = 1584, A ∩ B = 132,
  B = 4620, region composites 12 / 132 / 35; the change also synced live to the Euclidean tab. No console errors.

### 3. Venn Diagram double-click navigation to Factor Tree / Euclidean Algorithm
expected: Navigation occurs and the target tool loads with the correct deep-linked value
result: pass
notes: |
  Hover on composite 132 showed the factor-tree preview; double-click opened Factor Tree ?n=132 (renders
  132 = 2·2·3·11). ArrowDown switched the preview to the Euclidean nested squares (gcd(1584, 4620) = 132);
  double-click opened Euclidean Algorithm ?a=1584&b=4620 with those inputs. No console errors.
  Pre-existing cosmetic bug (unchanged from BASE): openXref() calls window.open(..., 'noopener'), which
  always returns null, so Venn always shows "Your browser blocked the new tab — allow popups…" even
  though the tab opened. Fixed in d0a4092: opens without the feature and clears opener (verified
  window.opener === null); message now reads "Opened a new tab to see this number's Factor Tree."

### 4. Equivalence Wheel Export SVG, Export PNG, and Print
expected: Each completes without a console error, same export/print behavior as pre-phase
result: pass
notes: |
  Real button clicks; only the final hand-off to the browser was intercepted (download anchors captured
  instead of saving to ~/Downloads, window.print stubbed to avoid a blocking modal dialog). SVG: valid
  113 KB image/svg+xml with an XML declaration, filename equivalence-wheel-N32-depth6-a0.svg. PNG: valid
  625 KB image/png (PNG signature), same filename stem. Print: theme flipped night→day for print and was
  restored to night on afterprint. No console errors.

### 5. Triage 07-REVIEW.md's three open findings (WR-01, IN-01, IN-02)
expected: Each finding in 07-REVIEW-DISPOSITION.md gets an explicit fixed / skipped / deferred disposition instead of "open"
result: pass
notes: |
  All three fixed and recorded in 07-REVIEW-DISPOSITION.md. WR-01 (edfc402): each module now locks its own
  slot with Object.defineProperty(NT, NAME, { writable: false, configurable: false }) after freezing the
  namespace; NT stays extensible so later modules can attach. Verified in Node: reassigning or deleting
  NT.core/NT.svg throws in strict mode and is ignored otherwise; all five namespaces load. harness.js PASS
  (2,855,890), shadow-check --all PASS, browser-diff IDENTICAL errors=0 on all 16 pages. IN-01/IN-02 (56dd593):
  import-order rule now says code-point order (all 31 import lines comply), NT-freeze wording corrected,
  bullets added under both anti-pattern headings in ARCHITECTURE.md and the .claude/CLAUDE.md mirror;
  shadow-check --docs PASS.

## Summary

total: 5
passed: 5
issues: 0
pending: 0
skipped: 0
blocked: 0

## Gaps
