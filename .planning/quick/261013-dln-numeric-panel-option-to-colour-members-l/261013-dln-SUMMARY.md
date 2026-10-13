---
quick_id: 261013-dln
phase: quick
plan: 261013-dln
subsystem: cyclic-groups
tags: [cyclic-groups, numeric-panel, colours, i18n-english-first]
status: complete
completed: 2026-10-13
key-files:
  modified:
    - Cyclic Groups/cyclic-groups.html
    - _Cyclic Groups/_cyclic-groups.html
    - assets/i18n/cyclic-groups.js
decisions:
  - Chips reuse drawn.paint(a) (bead class + inline --ord), so every colouring and the iso pane's borrowed paints carry over with no new colour logic
  - The colour choice shares the "Sort subgroups by" row (stacked in the merged table's narrow middle column) to save vertical space in the Ring window
  - Full-colour chips use --accent-ink, the bead labels' ink (the plan's --bg is not a declared token)
actuals:
  tasks: 1
  commits: 1
plan_head_before: d7bd9c9
plan_head_after: a424939
---

# Quick 261013-dln: Numeric panel members coloured like their beads

The Numerical panel now has a "Colour members like their beads" select (Off / Soft tint / Bead colour) on both Cyclic Groups tools. With tint or full selected, every member and every generator in `⟨…⟩` sits on a chip painted exactly like its bead on the ring.

## What changed (identical in both pages)
- **Markup:** the select sits in `#sub-sort-row` beside the sort select. The sort select now hides on its own (`#sub-sort-pair`), not the whole row, so the colour choice stays visible for non-cyclic groups. In the merged table the row stacks vertically, so the middle column stays narrow.
- **State and wiring:** `state.subColor` (`off|tint|full`, validated against `SUB_COLORS`) follows the `subPad` path:
  - URL `subcolor=tint|full`, written by `mirrorToUrl` and read with validation;
  - the select is synced in `render()`;
  - a change listener re-renders the list, updates the URL and calls `syncInterlock`;
  - the setting rides on the `numset` iso message (`color`), and the pane's `takeNumset` validates it.
- **Rendering:**
  - `memberMath(x, content)` wraps a member's `mn`/`msup` in an `mrow.sub-chip.sub-chip-<mode>` carrying the bead's class and inline style from `drawn.paint(x)`.
  - It is used for the generator and the members of plain rows and for the left side of merged rows. On the merged right side it is used only while `isoLinked()`; there it paints φ(x) as x, the colour the pane's bead borrows.
  - `memberPaintKey(G)` (the mode plus every bead's paint) joins both `sig` keys, so a change of colouring rebuilds the chips. The merged key also includes the linked flag.
- **CSS** (only `var()`/`color-mix()`):
  - `.sub-chip{padding:.15em .3em;border-radius:.4em}`
  - tint = `color-mix(--ord 30%, transparent)`
  - full = `var(--ord)` with `color:var(--accent-ink)`
- **Strings:** five English-only `cyclicGroups.subColor*` keys: Label, Title, Off, Tint and Full. The file's header comment lists them for the next catch-up translation.
- **Downloads:** `subExports` and the aria-labels are unchanged, so they stay plain text.

## Deviations from Plan
1. **[Rule 1 - Bug] The re-render key includes each bead's paint, not only `state.subColor`.** With only the mode in the key, switching between order, inverse and theme colouring left stale chip colours, because the rows were not rebuilt.
2. **[Rule 1 - Bug] Full mode uses `var(--accent-ink)`, not `var(--bg)`.** `--bg` is not declared in `assets/palette.css`. `--accent-ink` is the ink the bead labels use on these same fills.
3. **[Rule 1 - Visual] The chip padding is `.15em .3em`, not `0 .25em`.** A MathML `mn` box is only the glyph's ink height (10px). With no vertical padding, the white digits in full mode spilled out of the chip.
4. **Layout:** the select goes beside "Sort subgroups by" instead of on a new row below it. This follows the user's standing preference for compact rows in the Ring window. The sort select now hides by its pair, so the row itself stays visible.

## Verification (headless Chrome 153 over file://, CDP harness)
Run on both pages with zero console errors or exceptions in every run, including inside the pane iframe.
- **Chip colours:** Off, tint and full were checked in the order, inverse, website-theme and none colourings, day and night. Every chip's computed background matched its bead's computed fill: equal in full mode, and equal to `color-mix(fill 30%, transparent)` in tint mode, to within ±4/255.
  - Plain list: 89/89 chips in ℤ/12ℤ.
  - Merged ℤ/12ℤ ≅ (ℤ/13ℤ)*: left side against the host's beads and right side against the pane's beads, 89 + 89.
  - Off gives 0 chips. Inverse chips carry the inline style (66), and 6/6/4 distinct colours show.
- **Generator chip:** the first chip in each row is the `data-gen` element, inside `⟨⟩`.
- **Current row:** the highlight background is still present.
- **Padding:** chips show padded values (`00`).
- **Identity colour:** a custom `idcolor=ff00aa` shows on the theme-identity chip.
- **Linked pane, not merged** (ℤ/12ℤ gen 2 → (ℤ/7ℤ)*): the pane's own list follows its borrowed bead classes. After unlinking (gen 3), it follows its own classes. Both match the pane's beads.
- **Numset:** the interlocked pane's select follows the host (off → tint).
- **URL round trip:** loading with `subcolor=full|tint` restores the select and chips. Off removes the parameter.
- **Non-cyclic (ℤ/8ℤ)\*:** the sort select is hidden and the colour select is visible.
- **Languages:** `de` falls back to the English label, and `ar` gives `dir=rtl` with the chips intact.

## i18n checker (before → after)
- `--coverage --all`: PASS → 30 LANG-KEYSET findings. All of them are the five English-first `subColor*` keys missing in the 30 non-English languages, as expected.
- `--literals --all`: 30 findings before and after. They are identical apart from shifted line numbers, and none are new.
- `--header`: PASS → PASS.

## Not verified / notes
- The merged table's "right side plain while unlinked" branch is defensive and cannot be reached from the UI: merging requires `subInterlocked()`, which implies `isoLinked()` on the host. The reachable unlinked case (separate panels) was verified.
- Real-pointer interaction was not checked; all input was synthetic events.
- **Pre-existing, out of scope:** after the iso pane is closed with its ×, the host's list keeps the merged two-sided rows until something else re-renders. HEAD before this change behaves the same.

## Screenshots
- `/tmp/claude-1000/-home-mainaccount-Claude-number-theory-browser-tools/0ebdf1c9-9e6e-417a-ab3e-58b123f581ed/scratchpad/numeric-page-full-day.png`
- `/tmp/claude-1000/-home-mainaccount-Claude-number-theory-browser-tools/0ebdf1c9-9e6e-417a-ab3e-58b123f581ed/scratchpad/numeric-page-tint-night.png`
- `/tmp/claude-1000/-home-mainaccount-Claude-number-theory-browser-tools/0ebdf1c9-9e6e-417a-ab3e-58b123f581ed/scratchpad/numeric-desktop-merged-full-day.png`
- `/tmp/claude-1000/-home-mainaccount-Claude-number-theory-browser-tools/0ebdf1c9-9e6e-417a-ab3e-58b123f581ed/scratchpad/numeric-desktop-merged-tint-night.png`

## Commit
- `a424939` feat(cyclic-groups): colour the Numeric panel's members like their beads

## Self-Check: PASSED
