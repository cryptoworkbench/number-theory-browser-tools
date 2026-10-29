---
quick_id: 261029-kcf
status: complete
commit: 99aafc7
---
# Summary

Arrangement row now holds one Generator dropdown (fixed 11.5em in the Ring window, same x in +, × and EC — measured 845.8px in all three) and a Sequential toggle after it.

- Additive + Sequential: dropdown on 1, disabled, padlock (ctlLock).
- Multiplicative + Sequential: "Not applicable", disabled, padlock in the same spot; non-cyclic unit groups keep Sequential pressed and disabled.
- EC: button invisible (keeps its room), dropdown = Follow + generating points; non-cyclic curve shows Not applicable.
- Unpressing restores the remembered generator; EC → +/× restores the button's prior state (seqBeforeEc).
- Choosing 1 in an additive group no longer flips to Sequential.
- New en-only keys arrangeNotApplicable, arrangeNotApplicableTitle; removed unused arrangeByPowers (all languages) and arrangeGenSequential (en).
- Verified headless (CDP) on desktop Ring window, iso pane open, and ?mobile=1 at 390px; no console exceptions; i18n-check smoke passes, coverage shows only the expected en-only keys.
