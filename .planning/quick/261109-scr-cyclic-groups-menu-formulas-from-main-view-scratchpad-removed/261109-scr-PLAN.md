---
quick_id: 261109-scr
description: Cyclic Groups — G menu's subgroup cardinality/index from the main view's formulas (curves too); formula scratchpad deleted
---

# Quick task 261109-scr

## Task
1. menuFormulas builds the subgroup row menu's list itself: group name, cardinality, generator
   count, structure; subgroup name, and its cardinality and index exactly as the main view figures
   them (mapFormula by the formula settings window's maps where the group has them, ecRowFormula
   on a non-cyclic curve, else the notation formulas), so curves get them and what is copied always
   matches the screen.
2. Delete the formula scratchpad: its markup, styles, state, drawing, sizing/moving, copy handler,
   scratchFormulas/scratchCells, FS_PANELS entry, logBasePrompt's noCancel, and the i18n keys only
   it used (scratchClose, scratchCindex, scratchCindexEc). scratchMath survives as formulaPieces
   for the copy submenu's preview.

## Files
- Cyclic Groups/cyclic-groups.html, assets/i18n/cyclic-groups.js
