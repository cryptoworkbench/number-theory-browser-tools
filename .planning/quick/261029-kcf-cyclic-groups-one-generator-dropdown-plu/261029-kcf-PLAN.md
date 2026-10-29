---
quick_id: 261029-kcf
mode: quick
---
# Cyclic Groups: one Generator dropdown plus a Sequential button in the Arrangement row

1. Replace `#arrange-select` (Sequential / By powers) and the separate `#arrange-gen-select` pair with one always-shown Generator dropdown followed by a `Sequential` toggle button (`#arrange-seq`).
2. `syncArrange`: additive + Sequential → dropdown on 1, disabled, padlocked; multiplicative + Sequential (or a group with no generator) → "Not applicable", padlocked; non-cyclic → button pressed and disabled; EC → button invisible but keeping its room, dropdown lists only generating points.
3. `setEcMode` remembers the Sequential state on entering a curve and restores it on leaving; URL load keeps a curve arranged by a generator.
4. CSS: fixed-width dropdown in the Ring window so it does not move between modes; 40px tap height on mobile. New strings English-first.
