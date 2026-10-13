---
quick_id: 261013-fka
mode: quick
date: 2026-10-13
---

# Per-pane Numerical buttons; one centred button while linked

## Context
When a ring holds an isomorphism pane, only the left ring shows a "Numerical" button (`#split-btn`). The pane's copy is hidden by `:root.is-isopane :is(#split-btn, …){ display:none !important; }`, and the pane's `splitOn` follows the host's via the shared payload (`applyIsoShared`: `if (flag(d.split)) splitOn = d.split;`).

The user wants:
- **Not linked** (no isomorphism, or the padlock is open, i.e. `isoLinked()` false on the host and `is-iso-unlinked` on the pane): each pane has its own Numerical button, toggling its own list independently.
- **Linked** (padlock closed): a single Numerical button sits centred on the vertical line between the two panes, like the padlock (`.iso-lock`, absolutely positioned at `left:0` in `#iso-pane`, `translate:-50% …`). It sits at the height of the row where the per-pane buttons are (the generator/"gen" row), not at the padlock's mid-height, and does what the host button does today: toggles both splits together (merged table when the whole groups are interlocked).

Applies to both independent copies: `Cyclic Groups/cyclic-groups.html` (windowed desktop) and `_Cyclic Groups/_cyclic-groups.html` (page layout).

## Tasks
1. **Task 1: implement on both pages.**
   - **Pane button:**
     - Show the pane's own `#split-btn` while it is unlinked.
     - In the pane, `toggleSplit` toggles its own `splitOn` locally, without telling the host.
     - `applyIsoShared` only adopts the host's `split` while linked (`d.linked === true`).
     - When the link is made again, the pane takes the host's split (the forced `postIsoShared(true)` in `answerIsoAsk`).
     - The F8 handler in the pane toggles locally when unlinked.
   - **Centred button while linked:** move the host's own `#split-btn` (or reposition it via CSS) so it is centred horizontally on the divider line between the panes, at the gen row's height. Hide the pane's button.
     - Reuse the padlock's idea: an element absolutely positioned at the pane's left edge.
     - Measure the host's split button row `top` relative to `#iso-pane` in JS, written to a non-colour CSS custom property, if the row height can't be matched in pure CSS.
     - Keep it above the iframe (z-index like `.iso-lock`).
     - When unlinked, the host button returns to its normal place in the gen row.
   - **Re-sync:** run the button placement and the split state again on every link change: `syncIsoKeys`, `unlinkAfterUnlock`, `answerIsoAsk`, pane close (`closeIsoPane`), and the pane's `is-iso-unlinked` toggle in `applyIsoShared`.
   - **Keep working:**
     - the split-align logic (`splitAlignOn`/`alignSplits`/`applySplitAlign`/`reportPaneSplit`) when both splits are on;
     - the merged table (`syncInterlock`), which still hides the pane's own list while interlocked (`syncSplit`'s `!(IS_ISOPANE && isoInterlockOn)`);
     - RTL;
     - no literal colours.
   - Commit: `feat(cyclic-groups): each pane has its own Numerical button, one centred on the divider while linked`.

## Verification
Headless Chrome, using the scratchpad's `cdp.js`, on both pages:
- **Linked** (open an iso chip, padlock closed):
  - exactly one visible Numerical button, horizontally centred on the divider (centre x within 2px of the pane's left edge);
  - its vertical centre is within the left ring's gen row;
  - clicking it opens the merged table; clicking again closes it.
- **Open the padlock:**
  - two visible buttons, one per pane, in their gen rows;
  - each toggles only its own list (host list visible and pane list hidden, and vice versa).
- **Close the padlock again:** back to one centred button, and the splits are in step.
- **Close the pane:** the host button is back in its normal place.
- No console errors.
- Screenshots of the linked and unlinked states go to the scratchpad.
