---
quick_id: 261029-wlz
mode: quick
---
# Cyclic Groups: main-view formula right-click switches GCD ⇄ LCM form

1. `Cyclic Groups/cyclic-groups.html` — `syncFormulaCtx` adds, after Hide, "Switch to LCM form" / "Switch to GCD form" for the formula line under the pointer (both lines when between them and in the same form; omitted for a non-cyclic group of units, which has no lcm form). `switchRingFormulaForm` updates `state.subLcmRing` (host: `barFormulasChanged`; Ring window: new `lcm-ring` message to the host, which sets `subLcmRingR`).
2. `assets/i18n/cyclic-groups.js` — `formulaToGcd`, `formulaToLcm` (English first, listed in the header).
