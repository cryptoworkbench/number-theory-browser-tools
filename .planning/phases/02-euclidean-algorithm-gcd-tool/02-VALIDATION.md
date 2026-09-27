---
phase: "02"
slug: "euclidean-algorithm-gcd-tool"
status: ready
nyquist_compliant: true
wave_0_complete: true
created: "2026-09-27"
updated: "2026-09-27"
---

# Phase 02 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | None — this repo has no build system, package manager, or test suite by design (per CLAUDE.md: "verify changes by opening the modified `.html` file directly in a browser"). Verification follows Phase 01's established pattern: inline shell `<automated>` blocks embedded in each plan's `<verify>` tags (grep-based literal-color sweeps, tile-cap engagement checks, script-body-unchanged checks) plus `<human-check>` items for rendered/animated appearance. |
| **Config file** | none — no test framework config exists or is needed |
| **Quick run command** | Each task's own `<automated>` block — see the Per-Task Verification Map below for which gate belongs to which task |
| **Full suite command** | Plan 02-04 Task 2's four-part phase-wide sweep: nav registration across all eleven pages, the literal-color audit over all three touched files plus the JS-attribute sweep, the full seven-preset behavioural harness (row invariants, line counts, answers, tile counts, the 43-rectangle ceiling, the sub-second large-quotient render, and the Bézout identity), and the two-way cross-link check with `test -f` on each resolved href |
| **Estimated runtime** | Grep/awk gates: < 2 seconds. Headless-Chrome behavioural harness: ~5–10 seconds per page load (a scratchpad copy of the tool driven through its real UI, `--virtual-time-budget=9000 --dump-dom`). Worst case for a full sweep: ~30 seconds. No build/compile step exists. |

---

## Sampling Rate

- **After every task commit:** Task's own `<automated>` block (color-literal sweep, and/or targeted functional checks — e.g. tile-cap engaging on a large-quotient input, Bézout identity holding, playback controls firing).
- **After every plan wave:** Re-run the full literal-color and nav-registration sweep across all touched files.
- **Before `/gsd-verify-work`:** Full sweep green, plus the large-quotient tile-cap pitfall explicitly exercised (per `.planning/research/PITFALLS.md` Pitfall 5's own suggested acceptance check: `gcd(2, 500000)`).
- **Max feedback latency:** ~5 seconds (no build/compile step).

---

## Per-Task Verification Map

Every task across all four plans carries at least one `<automated>` gate. Task IDs are `{plan}-T{n}`.

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 02-01-T1 | 02-01 | 1 | GCD-01, GCD-02, GCD-03 | T-02-01, T-02-02 | Error text written with `textContent` only; `MAX_INPUT` + whole-number + negative + both-zero rejection bound the trace loop | shell/grep + headless-Chrome harness | Static identifier/link-order/nav-count sweep; literal-color audit over the extracted style block; 12-assertion harness on the real UI (row invariant `a = q·b + r`, `0 ≤ r < b`, `s·A + t·B = r`, playback controls, four input-rejection cases, clamp announcement, swap note) | ⬜ new file | ⬜ pending |
| 02-01-T2 | 02-01 | 1 | NAV-02 | — | N/A — markup-only nav/hub registration | shell/grep + headless render sweep | Nav-registration sweep across all eleven pages (11 links, exactly 1 active, correct relative hrefs, 10 hub cards, no stale nine-tool wording); no-collateral `git diff --numstat` gate (exactly 1 added line per sibling page); eleven-page headless render sweep for `site-header` and no `Uncaught` | ⬜ | ⬜ pending |
| 02-02-T1 | 02-02 | 2 | GCD-04 | T-02-03 | Preset values reach the trace only through `readInputs()`/`buildRun()`, so a devtools-edited `data-a` hits the same validation as typed input | shell/grep + headless-Chrome harness | Static gate: 7 chips, each required pair present as adjacent `data-a`/`data-b`, dataset read present, `.chain-note` present; literal-color audit; ≥40-assertion harness clicking all seven chips (line counts, first quotient, answer text, row invariants, empty error box, zero-step note) | ⬜ | ⬜ pending |
| 02-02-T2 | 02-02 | 2 | GCD-04 (D-05) | T-02-04 | Both cross-links are same-origin relative paths with no `target`, no `rel`, no query string — nothing about the learner's inputs travels with the navigation | shell/grep + headless render | Cross-link presence and direction gate (both hrefs, Venn anchor positioned after both ledes so it survives a mode switch, no `target` attribute); ranged no-collateral gate on `venn-diagrams.html` (0 deletions, ≤6 insertions, all cross-link-related); Venn literal-color audit; both-pages render gate with `test -f` on each resolved href | ✅ existing | ⬜ pending |
| 02-03-T1 | 02-03 | 3 | GCD-05, NAV-02 | T-02-05, T-02-06 | `TILE_CAP = 40` + per-step (non-cumulative) redraw bound the SVG at 43 rectangles for any accepted input; every SVG label built with `svgEl` and filled with `textContent`, no markup-string assignment into the SVG | shell/grep + headless-Chrome harness with a timing assertion | Static gate: `#tileSvg`/`#tileCaption`/`#tileNote`, `createElementNS`, `svgEl`, `TILE_CAP = 40` used ≥3 times, `--slot-cap` aliased to `--role-warn`, no canvas/charting, no interpolated SVG `innerHTML`, reduced-motion block; literal-color audit extended to JS-written `fill`/`stroke` values; harness asserting per-preset step-0 tile/cap/leftover counts, the ≤43 ceiling, square-and-contiguous geometry, the ≥15-unit legibility floor, the `249960` cap label, and a sub-1000 ms render of `gcd(500000, 2)` | ⬜ | ⬜ pending |
| 02-03-T2 | 02-03 | 3 | GCD-05 | T-02-05 | The cursor redraws one step at a time, so binding the diagram to playback cannot grow the node count; the generation check still gates a superseded advance before it draws | shell/grep + headless-Chrome harness | Static gate: `data-index`, `showStep`, `is-current`, `closest('.eq-line')`, ≥5 `showStep` call sites, `clearTiles` inside the reset path, `pause` inside the click path; 10-assertion cursor harness (load/Reset/Step×3/Instant/click-to-jump/click-while-playing/zero-step) plus the one-current-line invariant in every state; regression re-run of 02-01's row invariants and 02-02's seven chips | ⬜ | ⬜ pending |
| 02-04-T1 | 02-04 | 4 | GCD-06 | T-02-07 | Coefficient spans are filled with `textContent` from integers `euclidSteps` already computed; no second coefficient routine and no new input path | shell/grep + headless-Chrome harness | Static gate: `#extToggle` present and unchecked, `eq-s`/`eq-t`, `show-ext`, `#extCaption`, `--slot-ext` aliased to `--role-special`, exactly one `function euclid`, no duplicate coefficient helper, columns read `step.s`; literal-color + JS-attribute audit; harness asserting off-by-default `display:none`, columns present in the DOM while hidden, the five ground-truth `(s,t)` pairs for `240, 46` in order, `s·A + t·B = r` per line, toggle on/off idempotence, and mid-trace reveal without a re-run | ⬜ | ⬜ pending |
| 02-04-T2 | 02-04 | 4 | GCD-06, GCD-03 | T-02-07, T-02-08 | Coefficient magnitudes are bounded by `MAX_INPUT = 1000000`, so every product stays under 10^12 and inside `Number.MAX_SAFE_INTEGER` — the identity cannot be silently false through rounding | shell/grep + headless-Chrome harness + phase-wide sweep | Static gate: `#identityLine`, populated inside `renderAnswer`, cleared inside `resetPlayback`, `data-gcd`/`data-s`/`data-t` attributes, middle-dot notation; identity harness asserting `s·a + t·b = gcd` from the line's own attributes for all seven presets plus rendered-text agreement, Reset/Instant lifecycle, and hidden-but-present when the toggle is off; then the four-part phase-wide sweep (nav, color, full harness, cross-links) printing `PHASE-SWEEP-COMPLETE` | ⬜ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

**Sampling continuity:** 8 of 8 tasks carry an `<automated>` gate — there is no run of even two consecutive tasks without automated feedback, let alone three.

**Threat coverage:** `T-02-01` through `T-02-08` each appear in at least one task row above. `T-02-SC` (package legitimacy) is carried as `accept` in all four plans' threat registers: this phase installs zero npm/pip/cargo packages, so there is no install task for a legitimacy gate to engage on, and `02-RESEARCH.md`'s Package Legitimacy Audit records the same finding. No security-relevant checkpoint is required at ASVS level 1 for a static client-side visualization with no auth, session, crypto or network surface.

---

## Wave 0 Requirements

*Existing infrastructure covers all phase requirements — every task ships its own automated `<verify>` block; no separate test-framework bootstrap is needed or appropriate for a build-free static-HTML repo, consistent with Phase 01's precedent.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|--------------------|
| Numeric trace + geometric view animate correctly and stay in sync across playback controls (play/pause/step/instant-finish), in both day and night themes | GCD-02, GCD-03, GCD-05 | Grep can assert token/function presence, not that an animation actually plays smoothly and stays synchronized — genuine rendered/timing judgment requires a human or a browser observation | Open the new tool page, run each preset (coprime pair, multiple pair, equal pair, `gcd(a,0)` edge case), exercise play/pause/step/instant-finish, toggle day/night mid-animation, confirm the numeric trace and geometric tiling stay in lockstep and the final GCD is clearly highlighted |
| Extended Euclidean/Bézout mode toggle produces a correct, readable identity | GCD-06 | Correctness of `s, t` values and readability of the added trace columns is a domain + visual judgment | Toggle Extended Euclidean mode on a few preset pairs, confirm `gcd(a,b) = s·a + t·b` holds arithmetically and the added columns read clearly alongside the existing trace |
| Capped-tile badge is visually obvious, not just technically present | GCD-05 | "Is it obvious to a learner that this collapsed tile represents many more tiles" is a visual/pedagogical judgment, not a grep-able property | Click the `500000, 2` preset (PITFALLS.md's own suggested check, as `a, b` so the larger value leads), confirm the geometric view does not freeze/stutter and the `×249960` tile is legible and clearly distinct from a normal square |
| Two-way cross-link reads as a signpost, not as noise, and survives the Venn mode switch | GCD-04 (D-05) | Whether a link is appropriately weighted against the lede, and whether it stays visible when the Venn page swaps its two lede paragraphs, is a rendered judgment | From the Euclidean Algorithm page click through to Venn Diagrams and back; on the Venn page switch between two-circle and three-circle mode with the link on screen; check both links in day and night mode |
| Eleven-link nav header still wraps cleanly rather than pushing the theme toggle off the header | NAV-02 | Layout overflow at the point an eleventh link is added is a rendered judgment; `flex-wrap` being present in CSS does not prove the result reads well | Open `index.html` and three or four tool pages at a narrow and a wide viewport, confirm the nav wraps and the theme toggle stays reachable |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies — 8 of 8 tasks across plans 02-01 through 02-04 carry at least one `<automated>` gate
- [x] Sampling continuity: no 3 consecutive tasks without automated verify — no task lacks one
- [x] Wave 0 covers all MISSING references — no Wave 0 is needed or appropriate: introducing a test runner for one new file, when none of the ten existing tools has one, would be an architectural change outside this phase's boundary (`02-RESEARCH.md` Wave 0 Gaps). Every task instead ships its own throwaway, uncommitted headless-Chrome harness, following Phase 01's precedent.
- [x] No watch-mode flags — no test runner exists to watch
- [x] Feedback latency within budget — grep/awk gates run in under 2 seconds; the headless-Chrome harness takes ~5–10 seconds per page load. The original "< 5s" figure was written before the harness approach was chosen; the revised Test Infrastructure table above records the real numbers. Latency is still far inside the "one command, no build step, answer in seconds" bar this criterion exists to protect.
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** planner sign-off 2026-09-27 — validation contract complete for all four plans (02-01 through 02-04). Statuses in the Per-Task Verification Map stay `⬜ pending` until execution runs each gate.
