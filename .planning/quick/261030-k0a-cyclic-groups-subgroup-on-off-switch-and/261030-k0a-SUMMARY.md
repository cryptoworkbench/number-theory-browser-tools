---
phase: quick-261030-k0a
plan: 01
subsystem: cyclic-groups
tags: [cyclic-groups, subgroup, ui, i18n-pending]
requires: []
provides:
  - "vertical on/off switch #gen-switch on the SUBGROUP row (replaces the G dropdown)"
  - "Follow bead clicks / Follow point clicks button #gen-beads and elementTap tap router"
  - "sub=beads URL state (sub=plot legacy maps to it)"
affects: ["Cyclic Groups/cyclic-groups.html", "assets/i18n/cyclic-groups.js"]
tech-stack:
  added: []
  patterns: ["one shared tap router (elementTap) for ring beads, polygon corners and curve plot points", "beads flag carried on the iso 'select' message"]
key-files:
  created:
    - .planning/quick/261030-k0a-cyclic-groups-subgroup-on-off-switch-and/follow-check.mjs
  modified:
    - "Cyclic Groups/cyclic-groups.html"
    - assets/i18n/cyclic-groups.js
key-decisions:
  - "Switch OFF is exactly the old None (sub=none); switch ON is exactly the old Follow bottom-panel."
  - "state.genPlot became state.genBeads; Follow bead clicks keeps G following taps of beads, polygon corners and curve points, never combining while pressed."
  - "G picked by a row click does not end bead-following; the slider follow, or switching the subgroup off, does."
  - "The iso 'select' message gained a beads flag (read as === true, only with k >= 0 and no follow) so both interlocked rings mirror the button."
status: complete
commits: 3
plan_head_before: 197bd26817ffb628e84f3fa7a1c065f4571089b8
plan_head_after: fd945cef1d7c93a82ffb8a2a849b9711873c833f
actuals:
  tokens: 16000
  tasks: 3
  commits: 3
metrics:
  duration: "about 40 minutes"
  completed: 2026-10-30
---

# Phase quick-261030-k0a Plan 01: Cyclic Groups subgroup on/off switch and Follow bead clicks Summary

The SUBGROUP row's G dropdown is replaced by a small vertical on/off switch right of the row name, plus a "Follow bead clicks" button (reading "Follow point clicks" on an elliptic curve) that makes bead, polygon-corner and curve-point taps pick G instead of combining.

## What was built

- **Switch (D-01, D-02, D-03):** `#gen-switch` (`role="switch"`, up = ON, default ON) sits directly after the SUBGROUP name inside a new `.gen-head` wrapper. OFF does what None did (no G, empty tail, `sub=none`); ON does what Follow bottom-panel did (G from the panel's last pick, identity the first time, row focused, blink).
- **Follow bead clicks (D-03..D-06):** `#gen-beads`, shown only while the switch is ON, toggles `state.genBeads`. Pressed, `elementTap(x)` calls `pickGen(x)` (so it relays through the holding ring when a pane is interlocked) and never combines or opens the a ∗ a field; unpressed, taps combine as before. Row clicks keep setting G with the button staying pressed. It and Follow expression slider release each other. The a ∗ b / aᵏ switch is untouched (D-07).
- **URL (D-10):** `sub=none` / `sub=follow` / `sub=beads`; an old `sub=plot` link opens ON with the button pressed and is written back as `sub=beads`.
- **Curves and polygon:** the plot's `.curve-o` and points are pickable while pressed (`is-picks-g`), polygon corners go through `elementTap`, and the wheel steps the panel rows whenever the subgroup is ON and the slider is not followed.
- **Iso pane and mobile (D-09):** the iso `'select'` message carries `beads`; `isoSelNow`, `takeFlipSel`, the receiver, `syncInterlock` and `selKey` handle it. Mobile has a 40px tap box for the switch and the button.
- **CSS:** palette `var()`/`color-mix()` only; `.gen-beads` shares the `.arrange-seq` toggle rules; dead `.gen-pair`/`.gen-g` rules and the old dropdown's id in the font and RTL rules were removed.
- **i18n (D-08):** five English-only keys added to the `en` block: `genSwitch`, `genBeads`, `genBeadsTitle`, `genBeadsEc`, `genBeadsEcTitle`, listed in the header's English-first list. **Translations of these five keys into the other 30 languages are pending** (the next catch-up translation). `subPanelFollow` and `subPlotFollow` were kept, unused, in all 31 languages.

## Verification

- Inline scripts parse; `node --check assets/i18n/cyclic-groups.js` passes; no leftover of the old dropdown (`gen-select`, `genSelectEl`, `genPlot`, `SUB_PLOT`, `SUB_PANEL`, `genNamed`).
- `follow-check.mjs` (headless Chrome via CDP; scenarios desktop, ec, poly, mobile, iso) prints only PASS lines and exits 0, with no page exceptions in the top-level page of any scenario. Real mouse taps were used on desktop and touch taps on mobile.
- `i18n-check.js --coverage`: 30 findings, all `LANG-KEYSET` for the non-English blocks (the expected English-only keys, now including the five new ones). `--literals-markup`: 4 (baseline). `--literals-js`: 108 (baseline 109; my first version added 2, which I removed, and replacing the `':follow'` suffix in `selKey` took one off).

## Deviations from Plan

- **Task split:** the curve plot, polygon corner, wheel and `is-picks-g` code changes belong to Task 2 but were written alongside the Task 1 tracer, so they landed in the first commit; the Task 2 commit holds the comment rewording and the probe's ec/poly scenarios (the ec and poly scenarios themselves ran only after the Task 1 commit).
- **[Rule 1 - own mistake, repaired]** While measuring the literals-js baseline I copied the old page to `Cyclic Groups/zz-old.html`, which turned out to be a file already tracked in the repo (from an older commit); my `rm` deleted it. Restored with `git checkout -- "Cyclic Groups/zz-old.html"`; the working tree is clean for that file and no commit touched it.
- **Pressing the button no longer opens or blinks the curve plot**, as the plan specified (the old Follow plot did).

## Skipped or weak checks (stated honestly)

- Exceptions inside the iso pane's iframe are not captured by the probe (it only listens on the top-level page's CDP session); the iso scenario checks that the pane renders its own `#gen-switch` and mirrors the pressed button and the switch both ways, but not the pane's console.
- `mobile-check.mjs` in `.planning/quick/261014-v9c-*` still queries `#gen-select`, which no longer exists, so its tap-size and font checks on that id would now fail or skip. I did not touch that older probe.
- Visual checks were two screenshots (desktop Ring window row, mobile Subgroup panel); right-to-left languages, the Hebrew/Arabic layouts and the dark theme were not inspected.

## Known Stubs

None.

## Threat Flags

None. The new message field is read as `d.beads === true` and only with `k >= 0` and no follow (T-k0a-02); `sub` is only compared against fixed strings (T-k0a-01); the button text is set through `translate()` and `textContent`/`setAttribute` (T-k0a-03).

## Commits

- a967928 feat(cyclic-groups): the subgroup row gets an on/off switch and a Follow bead clicks button
- b4beac8 feat(cyclic-groups): curve, polygon and wheel follow the subgroup switch; comments no longer name the dropdown
- fd945ce feat(cyclic-groups): the interlocked rings share the subgroup switch and Follow bead clicks

## Self-Check: PASSED

- FOUND: Cyclic Groups/cyclic-groups.html, assets/i18n/cyclic-groups.js, follow-check.mjs
- FOUND commits a967928, b4beac8, fd945ce on main (3 commits since plan_head_before)
