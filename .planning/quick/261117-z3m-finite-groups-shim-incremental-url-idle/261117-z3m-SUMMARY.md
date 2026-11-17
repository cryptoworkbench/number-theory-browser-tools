---
quick_id: 261117-z3m
status: complete
---

# 261117-z3m Summary

Canvas vs svg numbers, first step, user's Chrome, alternated: worst frame 75b23bd 817/744/510 ms vs 7da315d 356/425/368 ms; time in frames > 50 ms 1417/1462/1077 vs 674/742/702. The canvas stays.

Changes:
- hasShim: candidates kept up incrementally (`addFrom` on added page elements, `dropGone` on removals) instead of `findAll` over the document (20–29 ms headless per first step). Exact because all 29 anchors are compound selectors reading only class, id and hidden.
- hasShim bug fixed (present since 2b4731a): `sync` ended with `mo.takeRecords()`, which also threw away page changes not yet delivered to the observer when a queued sync ran first; e.g. `.fs-win-body` gaining `is-clu-on-ring` on entering left `:has(> #expr-slot)` off until the next full sync. `sync` now takes those records in first (`note`) and then syncs every rule.
- `mirrorToUrl`: the replaceState / ring-window report and `syncIsoLinks` deferred to `requestIdleCallback` (timeout 500 ms; setTimeout 200 without it), flushed by `isoHref` and on pagehide (`flushMirror`).

Checks (user's Chrome, test copy exposing hasShim): candidates and hs- classes equal a fresh `querySelectorAll` + `matches(':has(…)')` after entering, picking bead 56, formula settings, Cayley table, a run to k = 3, hovering the top band and the bottom panel (HEAD failed the check right after entering: the bug above); URL combinek follows; all 19 chip hrefs carry the current combinek, wheelthick, arrangegen. No page errors.

Performance, first step:
- headless CPU profile, alternated: busiest block HEAD 182/201/212 ms vs 156/141/191 ms;
- user's Chrome, 4 alternated pairs: worst frame HEAD 494/418/401/422 vs 418/272/396/354 ms; long frame 514/444/431/460 vs 448/301/422/383 ms; time in frames > 50 ms 828/751/685/723 vs 785/706/646/688 ms.

Left in the first step (headless ~150–190 ms): drawNecklace ~56 (refitRingWheel/ringWheelFill forced layout ~17–30), fillText ~32, renderCombineKey ~30 (the wheel's style recalc lands on its getComputedStyle), renderSubgroups ~11, renderIso ~11; the zoom runs the whole `render()`.
