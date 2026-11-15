---
quick_id: 261115-cw1
status: complete
commit: 7b24cff
---

# 261115-cw1 Summary

placeCombineCard runs after drawCombineLine/combineCopies/cardCombineLines on every redraw: in 'win' it moves the line nodes (not copies, so live updates keep working) into #combine-win-svg at the ring's screen scale, dropping the plate, blur and card buttons; in 'min' it removes them and shows a bar task. combineText and the copy handler read lines from both places; the window's svg has the lines' context menu. Verified in Chrome: detach opens the window over the card's spot, drag, position kept across ring turns, minimize → task → back to window, dock, aᵏ separate state with live k updates, no console errors.
