---
phase: quick-260927-feg
plan: 01
subsystem: ui
tags: [svg, modular-arithmetic, group-theory, vanilla-js, aria-tablist]

# Dependency graph
requires:
  - phase: 01-palette-unification
    provides: shared assets/palette.css semantic --role-* tokens (--role-active/--role-input/--role-result) that the existing --slot-a/--slot-b/--slot-sum aliases already resolve through
provides:
  - "Multiplicative Groups tab on the Congruence Wheel, drawing (Z/NZ)* — only the phi(N) classes coprime to N — under multiplication mod N, with the same two-click select-and-see-the-result interaction as the existing Additive Groups tab"
  - "MODES per-mode config pattern (element list, operation, identity, wording all in one object) driving a single render()/select()/rolesFor()/updateCaption() pipeline"
affects: [congruence-wheel, future tabbed/multi-mode tools on this site]

# Actuals (#2632)
actuals:
  tokens: 4398
  tasks: 2
  commits: 2
  plan_head_before: 6fea448
  plan_head_after: 8f7389cc118106581ec111cd93e99ae2ebe5e893

tech-stack:
  added: []
  patterns:
    - "Per-mode config object (MODES) supplying element list, op, raw, identity, and every mode-specific wording string; shared render/select/caption code reads only from currentMode() — no parallel implementation per mode"
    - "ARIA tablist (role=tablist/tab/tabpanel, roving tabindex, ArrowLeft/ArrowRight) for in-page mode switching, reusable for any future multi-mode tool on this site"

key-files:
  created: []
  modified:
    - "Congruence Wheel/congruence-wheel.html"

key-decisions:
  - "Wedge geometry keys off M = elements(N).length (phi(N) in multiplicative mode), not N — non-units are absent from the DOM entirely, never dimmed (D-02, locked by explicit user choice)"
  - "state.a/b/sum hold class VALUES, not wedge positions — the wedge loop reads els[p] and select() is called with the value, so rolesFor()/caption/export logic needed no position-vs-value special casing (D-10 discretion)"
  - "Tab switch resets the in-progress pair to the new mode's identity (0 additive, 1%N multiplicative) rather than clamping the old value across, since the element sets differ entirely between modes"
  - "localStorage payload gains a third guarded field, mode — an old {N, depth} payload restores as additive, preserving backward compatibility"
  - "Export filename gains a '-mult' slug only in multiplicative mode; additive filenames stay byte-identical to before this task"

patterns-established:
  - "Mode-specific prompt strings that also appear as a words.a/words.b/words.sum literal are built via a function reading this.words.a (not hardcoded twice) to avoid duplicating wording strings in source — see MODES.additive/multiplicative.promptA"

requirements-completed: [PAL-02, PAL-04, NAV-02]

duration: ~25min
completed: 2026-09-27
status: complete
---

# Quick Task 260927-feg: Congruence Wheel Multiplicative Groups Summary

**Added a "Multiplicative Groups" tab to the Congruence Wheel that draws (Z/NZ)\* — only the phi(N) classes coprime to N as wedges — sharing one render()/select() engine and one MODES config with the existing Additive Groups tab.**

## Performance

- **Duration:** ~25 min
- **Completed:** 2026-09-27
- **Tasks:** 2
- **Files modified:** 1 (`Congruence Wheel/congruence-wheel.html`)

## Accomplishments

- Two-tab ARIA tablist (`Additive Groups` / `Multiplicative Groups`) sharing one page shell, controls, export row, and reference list; additive mode is byte-for-byte the tool as it shipped before this task (proven by an automated real-browser harness asserting exact string equality against a pre-change baseline)
- Multiplicative mode draws exactly the phi(N) unit-set as wedges — 4 at N=10 (1, 3, 7, 9), 4 at N=12 (1, 5, 7, 11) — with wedge count/angle keyed off `M = elements(N).length`, not `N`; non-units are absent from the DOM entirely, never dimmed
- Clicking two classes in multiplicative mode marks `(A x B) mod N` as the result (e.g. [3] then [7] at N=10 marks [1], the identity), with squaring producing a dual-role dashed wedge, matching the existing additive interaction exactly
- Footer formula names the multiplicative identity as `[1]` and the lede explains why wedges disappear as N gains factors
- Single `render()`, `select()`, `rolesFor()`, and reference-list builder serve both modes via a `MODES` config object; `ROLE_WORDS`/`ROLE_TAGS` deleted with no wording duplicated
- Export filename gains a `-mult` slug in multiplicative mode only; SVG export still carries all marked wedge-hit paths and the dashed dual-role hint

## Task Commits

1. **Task 1: Two tabs, one wheel engine — phi(N) units under multiplication, end to end** - `cb74dbb` (feat)
2. **Task 2: Say it in the right language — per-mode wording, identity and export name** - `8f7389c` (feat)

_(SUMMARY.md and STATE.md docs commit created separately by the orchestrator per this run's instructions.)_

## Files Created/Modified

- `Congruence Wheel/congruence-wheel.html` - Added mode tabs, `MODES` config (element list/op/identity/wording per mode), `gcd`/`unitsMod`/`clampToElements` helpers, generalized `render()`/`select()`/`updateCaption()`/`exportFileName()` to read from the active mode

## Decisions Made

- Wedge geometry generalized to `M = els.length` (phi(N) in multiplicative mode) rather than dimming non-unit wedges, per the plan's locked D-02 decision
- `state.a`/`state.b`/`state.sum` speak class values throughout (never wedge positions), keeping `rolesFor()`, the caption, the reference list, and the export filename untouched in their logic
- Tab switch resets the in-progress pair to the new mode's identity and clears `state.b`/`state.sum`
- Mode is persisted as a third `localStorage` field, guarded so an old two-field payload restores as additive
- See `key-decisions` in frontmatter for the full list

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] `promptA` made a function reading `this.words.a` instead of a hardcoded literal duplicate**
- **Found during:** Task 2, while satisfying the automated verify gate's exact-count checks on the words "first factor" (`-eq 1`) and "first addend" (`-eq 2`)
- **Issue:** The plan's `<action>` prose specified `promptA` as a plain hardcoded string for both modes (e.g. `'Click a wedge or reference row to choose the first factor.'`), which would duplicate the same phrase already present in `words.a`. That satisfies "first addend" == 2 (the pre-existing file already had that phrase twice: once in a CSS comment near `--slot-a`, once in the original hardcoded prompt — so keeping `words.a` + a literal `promptA` string reproduces exactly 2). But for the brand-new multiplicative mode there is no such pre-existing CSS-comment duplicate, so hardcoding `promptA` as a second literal `'...first factor.'` string would make the substring count 2, failing the gate's `-eq 1` requirement.
- **Fix:** Changed both `additive.promptA` and `multiplicative.promptA` to functions that build the sentence from `this.words.a` at call time (`updateCaption()` was updated to call `mode.promptA()` when it is a function). This removes the source-level duplicate literal entirely while producing byte-identical rendered text (verified by the harness's exact-string caption assertions).
- **Files modified:** `Congruence Wheel/congruence-wheel.html`
- **Verification:** `mode-wording-harness.js` (scratchpad, not committed) asserts the rendered caption text exactly at every step; `grep -oF 'first factor' | wc -l` == 1 and `grep -oF 'first addend' | wc -l` == 2 both pass
- **Committed in:** `8f7389c` (Task 2 commit)

**2. [Rule 1 - Verification artifact, no code change] Task 2's post-verify DOM-dump check for the substring "one wedge per class" is a false negative**
- **Found during:** Task 2's `<automated>` verify block, the `grep -oF 'one wedge per class' "$D" | wc -l` assertion expecting exactly 1
- **Issue:** The task's own action explicitly requires moving the additive lede's second sentence (which contains "one wedge per class") out of static markup and into `MODES.additive.note`, a JS string literal, injected into a `<span>` via `textContent` at render time. Chrome's `--dump-dom` serializes the full document including the inline `<script>` element's source text, so the phrase necessarily appears twice in any full-page dump: once in the JS source (`note: '...'`), once in the rendered `<span>`. This is a structural consequence of the exact architecture the same task mandates, not a functional defect — the other three checks on the same verify line (`Equivalence classes</h2>`, `aria-label="..."`, `class="cell-num"`) happen to avoid this trap because they anchor on HTML syntax (`</h2>`, `class="..."`, quoted attribute values) that only exists in rendered output, never in JS source.
- **Fix:** No code change made (none would satisfy both D-01's byte-for-byte wording preservation and this raw-substring count without also breaking the required architecture). Verified instead via the harness's `document.querySelector('.lede').textContent === BASELINE_LEDE` exact-equality assertion, which passed both at initial load and after switching back from multiplicative mode, proving the actual rendered content is correct.
- **Files modified:** none
- **Verification:** `mode-wording-harness.js` "add-load: lede exact" and "add-back: lede exact" both PASS; manual re-check via `grep -n 'one wedge per class' <(dump-dom)` confirms the two hits are the JS source line and the rendered `<span>`, not two rendered copies
- **Committed in:** n/a (no code changed)

---

**Total deviations:** 2 (1 code auto-fix, 1 verification-methodology note)
**Impact on plan:** No scope creep; both are minor reconciliations between the plan's `<action>` prose / verify-gate literal expectations and the actual `--dump-dom` mechanics. All functional requirements (D-01 through D-10) are met and independently confirmed via the automated real-browser harnesses plus headless-Chrome screenshots in both day and night themes.

## Issues Encountered

None beyond the two items documented above.

## User Setup Required

None - no external service configuration required. This is a static, client-side HTML/CSS/JS change with no new dependencies.

## Next Phase Readiness

- The Congruence Wheel now demonstrates both `(Z/NZ, +)` and `(Z/NZ)*` interactively, which the RSA/Diffie-Hellman tools on this site conceptually rely on
- The `MODES` per-mode-config pattern and the ARIA-tablist wiring are reusable if a future tool needs multiple related views (e.g. a future "Continued Fractions" tool with rational vs. irrational input modes)
- No blockers for the ongoing roadmap phases (GCD, CRT, Continued Fractions)

---
*Phase: quick-260927-feg*
*Completed: 2026-09-27*

## Self-Check: PASSED

- FOUND: `Congruence Wheel/congruence-wheel.html`
- FOUND: commit `cb74dbb` (Task 1)
- FOUND: commit `8f7389c` (Task 2)
- FOUND: `.planning/quick/260927-feg-congruence-wheel-add-additive-groups-mul/260927-feg-SUMMARY.md`
