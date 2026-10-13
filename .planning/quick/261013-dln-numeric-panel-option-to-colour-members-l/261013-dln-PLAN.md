---
quick_id: 261013-dln
mode: quick
date: 2026-10-13
---

# Numeric panel: colour each member like its bead

## Context
The Numeric panel (`#subgroups-list-panel`, rows `⟨g⟩ = {…}`) lists every element as plain text. The user wants an option in that panel that gives each written member a background in its bead's colour on the ring, so the list and the circle can be matched by eye. The user asked for both strengths, Off / Soft tint / Full bead colour, on both tools: `Cyclic Groups/cyclic-groups.html` (desktop) and `_Cyclic Groups/_cyclic-groups.html` (page). The two are independent copies, so make the same change in each.

Run it as one `/gsd-quick` task on `main` (no push).

## Reuse
- `beadPainter(G, classes, pairing)` (~line 1654 desktop): returns `{cls, style}` per element. The class sets `--ord` (the `.ord-*` rules, lines 16–44), or the style is an inline `--ord: …`. `render()` stores it as `drawn.paint` (line 7138) before `renderSubgroups(G)` (line 7168), so the list can paint each member exactly as its bead: same class, same inline style. This covers order, inverse, website-theme and no-colour modes, and colours borrowed by a linked iso pane.
- Pattern for a panel option: `subPad`. It has a checkbox in `.sub-ctls-mid`, a field in `state` (line 1381), a `subPadEl` change listener (line 7617) that re-renders and calls `mirrorToUrl` + `syncInterlock`, a `subpad` URL param (lines 6980 / 7715), the `numset` iso message (lines 6578–6595), and a sync in `render()` (line 7156).
- The `#sub-sort-select` row (`.sub-expr-pair` label + select) is the pattern for a labelled select.

## Changes (each page)
1. **Markup:** in `.sub-ctls-mid`, after the sort row, add a `.sub-expr-pair` with a label "Colour members like their beads" and `<select id="sub-color-select">` with options Off / Soft tint / Bead colour, all via `data-i18n`.
2. **State:** add `subColor: 'off'` (one of `'off' | 'tint' | 'full'`). Then:
   - URL param `subcolor=tint|full`, written in `mirrorToUrl` and read with validation next to `subpad`;
   - sync the select in `render()`;
   - a change listener like `subPadEl`'s.
   - Add it to the `numset` message so a linked iso pane follows, like pad and shift.
3. **Rendering:** a helper `memberMath(x, content)` in `renderSubgroups`. When `state.subColor !== 'off'` and `drawn`, it wraps the member's `mn`/`msup` in an `mrow` with class `sub-chip sub-chip-<mode> <cls>` and the paint's inline `style`. Use it for:
   - the generator inside `⟨…⟩` and every member in the plain rows;
   - the left side of `renderMergedSubgroups`;
   - the right side (`φ(x)`) only while the pane is linked (`isoLinked()`), when its beads borrow these colours. Otherwise leave the right side uncoloured.

   Add `state.subColor` to both `sig` strings so toggling re-renders.
4. **CSS** (colours only through `var()` / `color-mix()`):
   - `.sub-chip{ padding:0 .25em; border-radius:.35em; }`
   - `.sub-chip-tint{ background:color-mix(in srgb, var(--ord, var(--text-dim)) 30%, transparent); }`
   - `.sub-chip-full{ background:var(--ord, var(--text-dim)); color:var(--bg); }`

   Keep the existing `.subgroup-row.is-current` / hover backgrounds visible behind the chips.
5. **Strings:** new `cyclicGroups.subColor*` keys (label, title, three options), English only for now per the Cyclic Groups English-first rule. List them in the file header comment for the next catch-up translation.
6. **Downloads** (`subExports`) stay plain text, unchanged.

## Verification
- Run `node .planning/phases/06-multi-language-support/i18n-check.js --coverage --all` and `--literals`, and expect no new findings beyond the English-first keys.
- In Chrome, on both pages:
  - open the Numeric panel and switch Off, Tint and Full;
  - check each number's chip matches its bead in the order, inverse and website-theme colourings, in day and night mode;
  - check the generator is coloured, padding still lines up, and the current-row highlight still shows;
  - with an iso pane linked, the right side is coloured; unlinked, it is plain;
  - a reload keeps the choice through the URL;
  - the console has no errors.

## Tasks
1. **Task 1:** implement the option in both `Cyclic Groups/cyclic-groups.html` and `_Cyclic Groups/_cyclic-groups.html`, plus the English keys in `assets/i18n/cyclic-groups.js`. Commit: `feat(cyclic-groups): colour the Numeric panel's members like their beads`.
