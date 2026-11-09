---
quick_id: 261109-trb
description: Cyclic Groups — restore workRight and topRowsBottom, cut with the scratchpad (regression: + picker items did not open, middle-line controls misplaced)
---

# Quick task 261109-trb

## Task
261109-scr deleted the scratchpad's placement block, which also defined workRight and
topRowsBottom, still used by keepLockClear (the middle line's controls), the formula cards and
the plots. Opening a pane threw "topRowsBottom is not defined", so the picker's items did not
open and the middle-line controls landed in odd places. Restore both functions.

## Files
- Cyclic Groups/cyclic-groups.html
