---
quick_id: 261110-nem
status: complete
commit: 3757533
---

# 261110-nem summary

natExpTick builds the tick for both menus; syncSignCtx puts it at the main menu's top at Natural;
the slider's contextmenu opens nothing unless exprBy is null, and its menu lost Points as multiples
(still at the main menu's top on a cyclic curve). Verified in Chrome on Z/12Z: at Natural the slider
menu is the tick alone and the main menu has it; at a generator the slider opens no menu and the
main menu lacks it; the main menu's tick toggles natexp.
