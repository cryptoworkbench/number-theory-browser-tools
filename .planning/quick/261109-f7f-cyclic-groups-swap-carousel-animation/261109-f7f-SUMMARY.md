---
quick_id: 261109-f7f
status: complete
commit: 9d4a31f
---

# Summary

- The swap button starts a 700 ms carousel: copies of the two rings in a fixed overlay; the left
  copy swings across in front (up to 112%), the right one behind (down to 80%, dimmed to 50%),
  each sized from its own pane's ring to the other's.
- The text and controls keep their values until the copies arrive; then the swap runs. The left
  side snaps at once, and the right side keeps the old frame (ring hidden, copy over it) until the
  new frame loads (about 300 ms in testing). No blank pane.
- Reduced motion: an instant swap as before. A timer finishes the turn if animation frames are
  held back; if the pane doesn't answer within 400 ms the swap happens without animation.
- Verified in Chrome (positions sampled through the turn, the handoff, the old frame held to
  within 1 px, no console errors). Three new i18n literal findings are internal id strings
  (false positives).

## Revision (c2bd0d4): flip instead of carousel

The user wanted option 1, a flip. The two copies now flip over together like one coin about the
dividing line, as a ring flips (flipRing): squashed across the line by |cos θ| with
easeInOutCubic over FLIP_MS (700 ms), sinking by FLIP_SINK at mid-turn; up to edge-on each ring
stands on its own side, then opens out on the other side at the place of the ring it trades with,
never seen reversed. The snapshot, hold-the-old-frame and snap logic is unchanged. Verified in
Chrome: sampled boxes (inner edges stay at the axis x ≈ 761, width → 0 at mid-turn), a frozen
mid-turn screenshot, clean landing, no console errors.

## Fix (c370bc7): no flash on the right after the flip

A new pane first draws in its own colours and turn, then gets the page's colours (isoTellPaints in
the frame's load handler) and turn, and redraws. With Subgroup cardinality as the colour key and a
subgroup-to-group isomorphism, the copy over the right side went at the frame's load, so its beads
showed their own colours (e.g. green) for about 50 ms before turning purple again. Now the host
sends `ringhost: 'drawnwatch'` on load; for two seconds the pane posts `ringwin: 'drawn'` on every
change to itself (a MutationObserver), and the copy goes after 150 ms of stillness (1.5 s cap).
Recorded in Chrome, unlocked and locked, both directions: every colour and rotation change now
lands while the copy is up, and none after.

## Fix (1d7dcf0): no redraw in view on the right after the flip

Still seen by the user: the new pane, revealed at load, then ran the ring flip animation (flipRing,
its direction told by the page after it first drew the one in its query) and redrew its panels in
view. Now:
- the new frame carries `swapin=1` (in RING_DROP) and starts with `paneSettling`, so flipRing takes
  any direction change at once (cleared by `drawnwatch end` on reveal, or after 4 s);
- the frame stays `is-swap-pending` (opacity 0, not visibility hidden, which holds back a frame's
  animation frames) under the old frame until revealed;
- after 150 ms of stillness the host pings; the pane answers after two of its own animation frames,
  and any change meanwhile restarts the wait (1.5 s cap), so work queued for the next frame (the
  merged row's G placement, --g-shift) lands before the reveal.
Recorded in Chrome (animation frames throttled to ~2 fps in the test tab), locked and unlocked:
no flip animation, and no change after the reveal apart from a 1 px --clu-y tweak seconds later.

## Fix (81cd192): no redraw on the left when the subgroup's isomorphic group comes left

Seen with ⟨ℤ/13ℤ, ×⟩ and ⟨ℤ/5ℤ, ×⟩. Recorded on the left from the copies' landing:
- the ring drew ⟨ℤ/5ℤ, ×⟩ in its own colours (2, 3 green), then magenta once the new pane sent its
  paints (it borrows them, being the subgroup end): swapIsoRings now computes those paints itself
  (the old host's own drawn.paint over isoPowers(), exactly what the new pane sends) and sets
  isoPaints before render; isoTakePaints ignores identical paints;
- the bottom bar's right half shrank and grew back: loadIsoFrame resets isoPane*Min; the swap now
  sets them (and isoPane.plotMin) from the old host's own windows;
- the split button and the column between the rings jumped: keepLockClear ran while is-sub-merged
  was momentarily off, then not again until the pane loaded; the swap calls it after render, and
  keepLockClear leaves the column as it stands from the landing until the new frame has loaded
  (its position, from the taller rows of the two groups, is the same after the swap).
After: in both directions the ring is drawn once in its final colours, and no element's position or
any text on the left changes from the landing on; no console errors.

## Fix (e87192e): the pane swaps in place instead of reloading

Still seen: on the left only the values changed at the landing; on the right the first two control
rows, the ring (after landing) and its expression slider were drawn anew, since the swap replaced
the pane's frame. Now swapIsoRings calls swapPaneInPlace: the host resets what it last told the pane
and posts `ringhost: 'swapto'` (the new query, plotOpen); the pane answers `ringwin: 'swapped'`
(until then the host ignores `state` reports, which may name the old group), then runs loadState as
the host's swap does (keeping its own rot/top/autoRotate/autoSpeed/fsetOpen), sets curvePlotOpen and
renders; the host then re-sends shared state, head, top, interlock and keys. The drawnwatch is sent
before swapto, so a direction change in the pane is taken without the flip animation; its ring stays
hidden under the copy until the host's `drawnwatch end` (2 s fallback). The copies now land centre on
centre scaled by their fit to the svg viewBox (both rings use 0 113 760 647 here, not square).
Removed: swapin, is-swap-pending, is-leaving, holdSwapFrame, loadIsoFrame(keepOld).
Recorded in Chrome, ⟨ℤ/13ℤ, ×⟩ with ⟨ℤ/5ℤ, ×⟩ and with ⟨ℤ/6ℤ, +⟩, both directions: the frame is
kept; both sides change only within 100 ms of the landing and not after; under each copy the real
ring's beads are within 0.2 px of the copy's, colours the same; no flip animation visible; no errors.

## Fix (913cd77): the right ring and its copy change places in one step

Reported: on the right the connecting polygon and circle still light up/redraw, not on the left.
Not reproduced as such in the test tab (computed strokes of the ring, the copies and the corner
switches never changed); what differed from the left was the handoff: the pane hid its ring on
ringsnap ~5 ms before the copies went up, and showed it ~5–8 ms after they came down, so a frame
could show neither; and the pane's 2 s fallback from a swap under two seconds before could show its
ring under the copy (see-through polygon and circle drawn twice). Now the host hides/shows the
pane's ring directly via contentDocument in the same task as the layer goes up/down (messages
`ringhide` / `drawnwatch end` only where the pane is out of reach, i.e. file://), and the pane's
fallback timer (paneWatchEnd) is cleared on end and on the next ringsnap. Measured: 0 ms at both
handoffs; four rapid swaps, ~1,500 samples, never both or neither shown.
