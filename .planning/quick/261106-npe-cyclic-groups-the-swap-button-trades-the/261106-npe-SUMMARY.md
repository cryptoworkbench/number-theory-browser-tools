---
phase: quick-261106-npe
plan: 01
subsystem: cyclic-groups
tags: [iso-pane, swap, subgroup-lock, mirrored-panel]
status: complete
commits: 1
plan_head_before: 4870e61de4ffb39da6df9e461def99d8f88fdce6
plan_head_after: 9f0d3859b47f4a9d67fb8c149549c89ce9385d87
key-files:
  modified:
    - Cyclic Groups/cyclic-groups.html
actuals:
  tasks: 3
  commits: 1
---

# Quick 261106-npe: the swap button always trades the two rings

The swap button now shows whenever the pane holds a real group. A subgroup locked to a group (Z/12Z <2> to Z/6Z) swaps into its mirror, still locked: Z/6Z on the left, Z/12Z with <2> on the right. The shared bottom panel then lists Z/12Z's twelve rows with their preimages on the left of the rows inside <2>. Commit 9f0d385, one commit on main touching only `Cyclic Groups/cyclic-groups.html`.

## Decisions as implemented

- **D-1.** `canSwapRings` no longer needs `isoWholeMap()`. The swap classifies the link first (whole, subgroup link, back from a mirror, or none). A pair that is not isomorphic gets a plain trade: pins cleared, `isoPane.link = 'none'`.
- **D-2.** The subgroup-link branch of `swapIsoRings` sets `isoPane.hsub = true`, `isoPane.h` to the old link generator and `isoPane.g` to the old pane generator. The `hsub` branch reverses it. The lock, padlock and merge stay. The rings still turn, colour and light together.
- **D-3.** The mirrored panel has one row per element of the pane's group, a right side on every row, and a left side only inside the subgroup. A row inside the subgroup selects on both rings. A row outside it leaves the left ring with no subgroup and selects on the right ring only. Export isomorphism, Export group and Export subgroup all work in that state.

## Discretion points as implemented

- **DISC-1.** The pane learns the subgroup end through `ISO_SUB` (the `isosub=1` URL param and the `isosub` field of the shared message). `RING_DROP` strips `isosub`. `isoOrder`, `isoFound`, `isoLinked`, `syncIsoLink`, `isoLinksWholeGroups` and `isoImage` honour `hsub`. The holder renders the panel itself (`renderMirroredSubgroups`, with `isoMirrorMap`, `isoMirrored`, `syncMirrorRow`, `pickMirrorRow`). `renderMergedSubgroups` is untouched: the diff has no hunk inside it.
- **DISC-2.** Rows run in the pane group's natural element order. The sort select and its gcd switch are hidden while mirrored, and the pane's "Generator follows the sort" reads as Natural there.
- **DISC-3.** An optional `el` field on the existing `select` message carries a selected pane element outside the subgroup, in both directions, validated on receipt. It is absent in every other state, so whole-group and 261106-m53 messages are unchanged.
- **DISC-4.** In the mirrored state the pane sends its paints and the holder borrows them (`isoPaintsFrom`). `borrowedPaints` no longer calls `isoLinked()` or `isoLinkGen()` on the holder, because `drawn` is stale at the start of the first render after a swap. `isoArrangeAs` returns early when the link is a proper subgroup. The `iso:'paint'` message needed adding to the holder's message-listener routing, which only panes had used.
- **DISC-5, DISC-6.** As specified. An unpinned subgroup link mirrors with its current link generator and keeps its link status and padlock.
- **DISC-7.** The rows carry `data-pane-gen`. Rows outside the subgroup carry `data-gen="-1"` and get no hover or preview. `stepSubRow` walks all mirrored rows, and the inverse step on an outside row goes to the pane group's inverse row.
- **DISC-8.** Mirrored `subExports` use `fixed` rows (`exportRows` returns them first), `psi` on the pane entry, and `isoMirrorLines` for the isomorphism export. The export window accepts entries with `fixed` but no `rows`. The context menu passes the row's `data-pane-gen` as a sixth argument to `setSubCtx`, and a new `addSubExport` helper builds the Export subgroup item. `isoExportImage` and `isoExportImageNode` write the image as `<2>` while mirrored.

## Deviations from the plan

- **[Rule 1] Mirrored signature without the selected row.** The mirrored renderer's signature string leaves out the selected row. Row changes then take the fast path (toggle `is-current`) instead of a full rebuild, as `renderMergedSubgroups` does. The plan listed the row in the signature.
- **[Rule 1] Paint message routing.** `isoReceive` handled `iso:'paint'`, but the holder's window message listener did not route it to `isoReceive`, because only panes had received paints. Added `d.iso === 'paint'` to that list. The `paints` probe failed until this was done.
- **[Probe] `plain` scenario.** The plan's `plain` scenario (post a pane swap to Z/5Z) is ignored by the page, because Z/5Z is not an isomorphism chip of Z/6Z. The probe now unlocks and types a modulus of 5 into the pane's `#n-input`, which yields a real non-isomorphic pair. It still checks that the button shows, that the swap trades places with no link, and that swapping back restores n=12 and gen=2.
- **[Probe] Bead tap.** The `outside` probe's tap needed two fixes. The iframe is scaled (about 0.9), so the bead's frame coordinates are multiplied by `fr.width / f.offsetWidth` to get page coordinates. A bead tap selects only while "Follow bead clicks" is on, so the probe turns that on first.

## Probe results

- **swap-check.mjs, 70 PASS, 0 FAIL, no page exceptions** (`SWAP-CHECK OK`, run with `--compare`):
  - wholeswap, including matches-baseline against `wholeswap-baseline.json`
  - subswap
  - outside
  - roundtrip
  - plain
  - unlockswap
  - noncyclic
  - paints
  - exports
- **subswap before the edit:** 15 FAIL (the button was hidden), so the probe discriminates.
- **m53 probe** (`merged-sub-check.mjs`), full run with `--compare whole-baseline-head.json`: 83 PASS, `MERGED-SUB-CHECK OK`. It also passed at HEAD before the edit, so it had no pre-existing failures.
- **Whole-group round trip at HEAD:** the pre and after2 holder queries are equal once rot / top / autorotate / autospeed are dropped and params are sorted, so no param differs. The subgroup round trip also restores the normalised holder query exactly.
- **`outside`** used a real pointer tap, not the posted message.
- **Old `pane` probes** (formula-map-check, log-base-lock-check, log-base-boxes-check): each has the same one FAIL line at HEAD and after the edit, so nothing new. They fail at their first step ("the pane opens on (Z/13Z)*"). Those probes are stale and never reach their swap click. HEAD outputs came from a throwaway `git worktree` (removed afterwards).
- **i18n gates:** coverage 91, literals-markup 4, literals-js 131, all unchanged.
- **Diff gates:** no `innerHTML` and no colour literal added, and no user-visible string added.

## Known limitation

Neither the probes nor my manual checks tried a subgroup link whose pane generator is not a generator of the old (stale) holder group, for example Z/12Z <3> to Z/4Z. `swapIsoRings` runs `render()` while `drawn` is still the old group, and `isoLinkGen()` may rewrite `isoPane.g` in that case. The same hazard exists today in the whole-group swap, which the baseline covers. I removed it from the new `borrowedPaints` path but not from the rest of the render.

## Self-Check: PASSED

- `Cyclic Groups/cyclic-groups.html`: found, and `HEAD` 9f0d385 is on main.
- `git rev-list --count 4870e61..HEAD` is 1.
- Untracked and left in place: `swap-check.mjs`, `wholeswap-baseline.json`, `whole-baseline-head.json`.
