---
quick_id: 261109-swt
description: Cyclic Groups — Swap for an isomorphic group's submenu as a table of Additive Groups, Multiplicative Groups and Elliptic Curves
---

# Quick task 261109-swt

## Task
setRingSwap lays its groups out as Divide's table does, one row: the groups under +, the groups
of units and the curves, each cell two groups and a + for the rest. The cell builder moves out
of setRingDivide into groupCell(upto, rule, refit), shared by both; setRingCopy clears the table
class so the copy submenus stay plain lists.

## Files
- Cyclic Groups/cyclic-groups.html
