---
quick_id: 261102-cw1
status: complete
branch: formula-settings-window
commit: 242bad3
---

# Summary: Cyclic Groups formula settings window

Done in commit 242bad3 on branch `formula-settings-window`:

- One complexity for all formulas: the bottom bar's slider ↔ the Complexity slider's top
  line (formulaLevel / alignToken / linkComplexity / linkRefused). Map clicks, sliders, the
  checkbox and the bottom bar all move each other; the pane's complexity sets the host's
  level. mapSettle now keeps the column (a2 and SLS fall back to the row's short form).
- Main view (desktop): Form preference slider per formula, a gear under the first one,
  the generator control. At No derivation only the formulas and the gear.
- "Skip logarithm use" checkbox in the generator control (ℤ/nℤ at Compact): ticked = compact
  SLS for both formulas, boxes dimmed; refused with a red flash while a form is neither.
- Formula map window → "Formula settings" with Map / Sliders tabs (arrow keys, Home, End),
  each with a copy of the generator control (own radio name); flashes, padlock alarms,
  forced bases, focus restore, knob carry and the wheel switch cover both copies.
- The window's drag grip no longer captures presses on the sliders or the generator control.

Verified in Chrome (127.0.0.1 server): bottom slider ↔ sliders ↔ map ↔ checkbox, refusal
flash, units group (no checkbox, SLS greyed), old link normalized, phone layout, standalone
pane load; no console errors. i18n-check --literals: no new findings.

Not done / deviations:
- The pane keeps its maps inline (opened by its gear or menu); it does not open its
  settings in the host's window.
- The bottom-bar refusal (only reachable from No derivation with a remembered "neither"
  the base has since shut) flashes the form slider and boxes, not the bottom slider.
- The generator control's intro sentence stays visible while Skip logarithm use is ticked.
