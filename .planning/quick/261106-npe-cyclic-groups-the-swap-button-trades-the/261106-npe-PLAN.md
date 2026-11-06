---
phase: quick-261106-npe
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - Cyclic Groups/cyclic-groups.html
  - .planning/quick/261106-npe-cyclic-groups-the-swap-button-trades-the/swap-check.mjs
  - .planning/quick/261106-npe-cyclic-groups-the-swap-button-trades-the/wholeswap-baseline.json
  - .planning/quick/261106-npe-cyclic-groups-the-swap-button-trades-the/whole-baseline-head.json
autonomous: true
requirements: [QUICK-261106-npe]

estimate:
  tokens: 190000
  raw_tokens: 190000
  tasks: 3
  confidence: low

must_haves:
  truths:
    - "Per D-1, #iso-swap shows whenever the pane holds a real group (not blank, not hostBlank): linked or not, locked or unlocked, whole-group isomorphic, subgroup-to-group, or not isomorphic at all."
    - "Per D-2, start from Z/12Z with <2> locked to the Z/6Z chip and click #iso-swap. The left ring then holds Z/6Z (the whole group), and the right ring holds Z/12Z with <2> selected. The padlock stays closed, the panel stays merged (is-sub-merged on the holder, is-pane-merged in the pane), and the root has no is-iso-whole. The rings still turn, colour and light together: the holder's beads take the pane's paints for their images, and the pane is told isogen=2 with isosub=1."
    - "Per D-3, the merged panel in that state is the mirror of the 261106-m53 panel. It has 12 rows, one per element y of Z/12Z in order 0..11 (data-pane-gen). Every row has a right side {members of <y>} = <y>, padded to Z/12Z's width, for example {00, 08, 04} = <08>. Only the even rows (the rows inside S' = <2>) have a left side <psi(y)> = {psi(members)}; with h0 = 1, row 08 reads <4> = {0, 4, 2}."
    - "Per D-3, clicking a row inside S' (04) selects psi(4) on the left ring and <04> on the right ring. Clicking a row outside S' (03, or 01) leaves the left ring with no subgroup and selects <03> or <01> on the right ring. Tapping one of the pane's own beads outside S' highlights that row in the panel. The lock never breaks and the panel stays merged."
    - "Per D-2, clicking #iso-swap again restores the pre-swap state: the groups, both selections, the lock, the isoPane.sub pin, the 261106-m53 merged panel and the holder's query (formula choices included)."
    - "A pair that is not isomorphic swaps as a plain trade of places, with no link and no merge. The whole-group swap matches wholeswap-baseline.json, captured from the unmodified page. The 261106-m53 whole-group panel matches whole-baseline-head.json, also captured before any edit."
    - "Per D-3, in the mirrored state the right-click menu offers Export isomorphism <Z/6Z, +> ≌ <2>…, whose preview has 12 lines: a right part on every line and a left part on the even lines only. Export group works for both groups. Export subgroup is offered on any row's right half and on the left half of a row inside S'."
    - "The work lands as one feat(cyclic-groups) commit on main that touches only Cyclic Groups/cyclic-groups.html. No user-visible string is added, the i18n gates stay at 91 / 4 / 131, no HTML-string assignment or colour literal is added, and the probe and baselines stay untracked."
  artifacts:
    - path: "Cyclic Groups/cyclic-groups.html"
      provides: "isoPane.hsub / isoPane.row (holder), ISO_SUB and isosub=1 (pane), the pane-side subgroup end honoured by isoOrder / isoFound / isoLinked / syncIsoLink / isoLinksWholeGroups / isoImage, the four-branch swapIsoRings with the relaxed canSwapRings, renderMirroredSubgroups with isoMirrorMap / syncMirrorRow / pickMirrorRow, an optional el field on the select message, reversed paints, and mirrored subExports with their export consumers"
      contains: "renderMirroredSubgroups"
    - path: ".planning/quick/261106-npe-cyclic-groups-the-swap-button-trades-the/swap-check.mjs"
      provides: "headless CDP probe (untracked): scenarios wholeswap / subswap / outside / roundtrip / plain / unlockswap / noncyclic / paints / exports, plus --baseline and --compare for wholeswap"
      contains: "data-pane-gen"
  key_links:
    - from: "swapIsoRings() subgroup-link branch"
      to: "isoPane.hsub"
      via: "a holder subgroup link becomes a pane subgroup link (isoPane.h = old link gen, isoPane.g = old pane gen, isoPane.sub = null, isoPane.hsub = true); the hsub branch reverses it"
      pattern: "isoPane\\.hsub = true"
    - from: "isoPaneSrc() / isoSharedPayload()"
      to: "pane ISO_SUB, read by pane-side isoOrder()"
      via: "isosub=1 in the frame URL and isosub in the shared message; the pane's isoOrder is then drawn.G.orders[ISO_GEN]"
      pattern: "isosub"
    - from: "renderSubgroups(G) dispatch"
      to: "renderMirroredSubgroups(G)"
      via: "merged and isoPane.hsub === true; renderMergedSubgroups stays byte-identical"
      pattern: "renderMirroredSubgroups\\(G\\)"
    - from: "syncInterlock() select message"
      to: "isoReceive 'select' on both roles"
      via: "the optional el field carries a selected pane element outside S' (holder: isoPane.row, pane: state.gen), validated on receipt"
      pattern: "el: "
---

<objective>
In Cyclic Groups, the user must always be able to swap the left and right rings (the ring holding the iso pane, and the pane), including in the locked subgroup-to-group isomorphism mode. The user's words: "Make sure that I can always swap the left and right pane, even if its locked subgroup to group iso mode".

Purpose: today #iso-swap exists only while the two whole groups are isomorphic (canSwapRings needs isoWholeMap()). A subgroup lock such as Z/12Z <2> to Z/6Z cannot be swapped, because the link's subgroup end can sit only on the holder.

Output: one commit on main touching only `Cyclic Groups/cyclic-groups.html`. Also produced, all untracked: the probe `swap-check.mjs`, two baselines captured before any edit, and the SUMMARY.

Decisions (orchestrator's, LOCKED for this plan; record them in the SUMMARY, the user may override later):
- D-1: Swap is offered whenever the pane holds a real group (not blank, not hostBlank), whether the rings are linked, locked, isomorphic as whole groups, subgroup-to-group, or not isomorphic at all. A pair that is not isomorphic gets a plain trade of places with no link. Whole-group swap behaviour stays exactly as today. Implemented in Task 1 (canSwapRings, swapIsoRings) and checked by `wholeswap` / `plain` (Tasks 1-2).
- D-2: Swapping a subgroup-to-group lock keeps it locked and gives its mirror. The left ring holds the whole group (Z/6Z), and the right ring holds the big group (Z/12Z) with the locked subgroup <2> selected. The rings still turn, colour and light together through phi^-1. Swapping again returns to the original state: groups, selections, lock, pin and formula choices. Implemented in Task 1 (link generalisation, swap branches) and Task 2 (paints, round trip), and checked by `subswap` / `roundtrip` / `paints`.
- D-3: The merged bottom panel in the swapped state is the mirror of the 261106-m53 panel. Its rows are the pane's (the big group's) rows. Every row of Z/12Z has a right side {…} = <g>. Only the rows inside the locked subgroup have a left side <psi(g)> = {…}, where psi = phi^-1 onto Z/6Z; the other rows have none. Row clicks mirror D-01 of 261106-m53: a row inside the subgroup selects on both rings; a row outside it selects on the right ring only, and the left ring shows no subgroup; the lock never breaks. Export isomorphism (4870e61) and Export group/subgroup keep working in the mirrored state, the label reading "Export isomorphism <Z/6Z, +> ≌ <2>…". Implemented in Tasks 1 and 3, checked by `subswap` / `outside` / `exports`.

Claude's discretion, decided here (record each in the SUMMARY as implemented):
- DISC-1 (approach): generalise the link so that the PANE can hold the subgroup end. The holder records it as isoPane.hsub === true, with isoPane.h the pane's subgroup generator and isoPane.g the holder's whole-group generator, so the holder's end is then always its whole group. The pane learns it as ISO_SUB through isosub=1 and the shared message. The holder renders the mirrored panel itself from H = isoPaneGroup() (renderMirroredSubgroups), the same way it renders the 261106-m53 panel today. No CSS mirroring of the page layout; the holder stays the left ring.
- DISC-2 (row order): the mirrored rows run in H's natural element order (H.els). Each row lists the members of <y> in power order y^0, y^1, … The sort select and its gcd switch (the #sub-sort-pair span) are hidden while mirrored. The holder's stored sort and gcd settings are left untouched and apply again once swapped back. Auto-shift does not reorder mirrored members. The pane's "Generator follows the sort" reads as Natural there.
- DISC-3 (selection): the holder keeps the authority. isoPane.row is the pane element whose row is selected in the mirrored panel. A selection outside S' travels as an optional `el` field on the existing 'select' message, in both directions, validated on receipt. The field is absent whenever the state is not mirrored, so the whole-group and 261106-m53 messages are unchanged.
- DISC-4 (colours and layout): in the mirrored state the paints flow the other way. The pane, the subgroup end, sends its S' paints, and the holder borrows them for its whole group, mirroring today's holder-to-pane flow. Bead re-layout ('spread') is not mirrored: the pane ignores spread while its link is a proper subgroup, and each ring keeps its own bead arrangement. Right after a swap they match, because each ring carries its own query across.
- DISC-5 (plain trade): when the rings are not isomorphic, the groups and settings trade places through the same state moves as today. The pins (g, sub, hsub, row) are cleared, isoPane.h becomes the old holder's link generator (or the old group's identity), and isoPane.link is reset to 'none', so syncIsoLink asks again if the new pair turns out isomorphic.
- DISC-6 (unpinned subgroup links): a subgroup link that is found but not pinned (asking, declined, or unlocked) counts as a subgroup link. It is mirrored with its current link generator as the pane's subgroup, and its link status and padlock are kept.
- DISC-7 (mirrored rows): rows inside S' carry data-gen = psi(y), so that hover, preview, row paths, the row formula and the cosets item work through the holder's element. Rows outside S' carry data-gen="-1" and get no hover or preview. Every row carries data-pane-gen = y. Arrow-key stepping walks all mirrored rows. The inverse step on a selected outside row goes to H's inverse row.
- DISC-8 (mirrored exports): subExports[0] (holder) lists the S' rows through psi, with lines null outside S'. subExports[1] (pane) lists every H row, carries psi (and no phi), and both entries' lines are index-aligned with the panel rows. Export isomorphism writes all pane rows, with the left part only on S' rows. Its names read "holder group label ≌ <h>". File names keep today's pattern.
</objective>

<execution_context>
@~/.claude/gsd-core/workflows/execute-plan.md
@~/.claude/gsd-core/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@CLAUDE.md
@.claude/CLAUDE.md
@.planning/quick/261106-m53-cyclic-groups-merge-the-bottom-panels-in/261106-m53-SUMMARY.md

The page is about 23.7k lines. Never read it whole. Find each anchor with grep -n and read a sed -n range around it. Line numbers are approximate, at HEAD 4870e61.
- Pane flags: ISO_GEN ~3860 (add ISO_SUB beside it). RING_DROP ~7041. queryGroup ~7054.
- Controls: syncSubExpr ~4875 (subSortPairEl holds #sub-sort-select and #sub-gcd). syncMergedExpr ~4911.
- isoLinksWholeGroups ~10938.
- Lists: rowMembers ~17480. syncRowPaths ~17612. renderSubgroups ~17762 (the dispatch line is its 3rd line). renderMergedSubgroups ~17842 (your model for the mirrored renderer; do not edit it). currentRowEl ~18063. hoverRow and the subgroupsEl mousemove listener ~18112-18124. pickGen ~18275. stepSubRow ~18301.
- Pane lifecycle: isoPaneSrc ~18760. openIsoPane ~18773. loadIsoFrame ~18822. The canSwapRings / swapIsoRings comment and code ~18947-18993.
- Shared messages: isoSharedPayload ~19343 (isogen field). applyIsoShared ~19393 (isogen ~19443, the linked branch right after it).
- Link logic: isoFound ~19569. isoLinked ~19583. syncIsoLink ~19601. isoLinkGen ~19803. isoOrder ~19821.
- Paints and layout: borrowedPaints ~19877. isoTellPaints ~19883. isoTakePaints ~19896. isoTellTop ~19908. isoArrangeAs ~19975.
- isoReceive ~20022 (the 'paint' line, the 'select' branch ~20066). isoImage ~20117. isoWholeMap ~20153. subInterlocked ~20231. syncInterlock ~20244. selKey ~20300. The holder's pane-message listener ~20356 ('subpick' ~20394, 'subinv' right after).
- render ~21138: the paint consumer ~21150 and `if (!IS_ISOPANE) isoTellTop(false);` ~21222.
- Exports: exportRows ~21415. isoExportLines / exportHead / isoExportName / isoExportNameNode ~21440-21481. openExportWin ~21483 (its isoExportGroup head ~21496). setSubCtx ~21719 (the Export subgroup block ~21763, the Export isomorphism item ~21790). The panel contextmenu listener ~22009. The swap button visibility ~22729.
- Probe harness to copy (connect, openPage, P.load, P.enter, P.ev, P.mouseTap, noErrors, openScenario, snap, sel, inFrame, clickRow, exportPreviews, deepDiff): .planning/quick/261106-m53-cyclic-groups-merge-the-bottom-panels-in/merged-sub-check.mjs (440 lines; it uses port 9347, so use 9361). Its `swaps` scenario shows how to post a pane message from the frame window ({isopane:'swap', spec:{mode, n, curve:null, label:'x'}}).
- Whole-group swap regression probes, each with a `pane` scenario that clicks #iso-swap: .planning/quick/261031-m2b-cyclic-groups-2-d-formula-map-control-fo/formula-map-check.mjs, .planning/quick/261031-uya-cyclic-groups-padlock-freezes-the-main-f/log-base-lock-check.mjs, .planning/quick/261031-pm3-cyclic-groups-generator-boxes-replace-th/log-base-boxes-check.mjs. They were written before later changes, so some of their checks may already fail at HEAD. Only new FAIL lines count.

Project rules that bind every task:
- Vanilla JS in the page. No new user-visible string (none is needed; every label reuses an existing key). Text goes in through textContent, translate or translateInto and the existing mInline / DOM construction, never as an HTML string. No colour literals.
- Any new JS string literal is an all-lowercase token or a hyphenated one ('isosub', 'data-pane-gen', '1'). The literals-js gate counts camelCase string literals such as 'leftR', so write none.
- Prose comments in the file's style, with no task or version wording.
- Commit directly on main with quiet git and do not push (user memory).
</context>

<tasks>

<task type="tracer">
  <name>Task 1: Tracer — swap Z/12Z <2> locked to Z/6Z into its locked mirror, one mirrored merged panel, row clicks on both sides of S' (D-1, D-2, D-3)</name>
  <files>Cyclic Groups/cyclic-groups.html, .planning/quick/261106-npe-cyclic-groups-the-swap-button-trades-the/swap-check.mjs, .planning/quick/261106-npe-cyclic-groups-the-swap-button-trades-the/wholeswap-baseline.json, .planning/quick/261106-npe-cyclic-groups-the-swap-button-trades-the/whole-baseline-head.json</files>
  <read_first>.planning/quick/261106-m53-cyclic-groups-merge-the-bottom-panels-in/merged-sub-check.mjs (whole file, once). Then, in "Cyclic Groups/cyclic-groups.html", sed -n ranges around: var ISO_GEN, var RING_DROP, function isoLinksWholeGroups, function renderSubgroups (first 5 lines), function renderMergedSubgroups (whole function), function isoPaneSrc, function canSwapRings and function swapIsoRings, function isoSharedPayload, the isogen line in applyIsoShared, function isoFound, function isoLinked, function syncIsoLink, function isoLinkGen, function isoOrder, function isoReceive (whole function), function isoImage, function syncInterlock (whole function), function selKey, function syncSubExpr.</read_first>
  <action>
Step 0: probe and baselines, BEFORE touching the page. Check that `git diff --quiet HEAD -- "Cyclic Groups/cyclic-groups.html"` holds.
(a) Run `node .planning/quick/261106-m53-cyclic-groups-merge-the-bottom-panels-in/merged-sub-check.mjs whole --baseline .planning/quick/261106-npe-cyclic-groups-the-swap-button-trades-the/whole-baseline-head.json`. This is a fresh whole-group panel baseline at HEAD. It already includes 4870e61's Export isomorphism menu item. Leave the old m53 whole-baseline.json as it is.
(b) Run the full m53 probe with `--compare` against whole-baseline-head.json and note the result. Every scenario is expected to pass. If one fails at HEAD, it is pre-existing: name it in the SUMMARY, leave it alone, and keep comparing against its HEAD output from then on.
(c) Create swap-check.mjs as an ES module that uses built-ins only. Copy the m53 harness and its helpers listed in the context section, on port 9361. It takes scenario names (none means all) and `--baseline FILE` / `--compare FILE`, which apply to `wholeswap` only. It exits 1 on any FAIL and prints `SWAP-CHECK OK` on success. Every scenario ends with zero Runtime exceptions. Add these helpers:
- swap(P): click #iso-swap, then poll up to 10 s for a frame carrying the class is-loaded whose src differs from the one before, and sleep 1200 ms.
- state(P): the holder's location.search; the frame's src; the holder's `#gen-switch` aria-checked; the holder's current row's data-gen and data-pane-gen; the pane's current row's data-gen in its own hidden list (through contentDocument); the pane's `#gen-switch`; #group-controls is-locked; root is-sub-merged / is-iso-whole; the frame root's is-pane-merged; whether #iso-swap is hidden.
- mrows(P): walk `#subgroups .subgroup-row` in order and give { pg: data-pane-gen, gen: data-gen, cur: is-current, aria, l, r }, with l and r being the data-plain texts of `.sub-row-l > math` / `.sub-row-r > math` joined with '', or null when the span is absent.
- clickPaneRow(P, y): click `#subgroups .subgroup-row[data-pane-gen="y"]`, then wait 900 ms.
Scenario `wholeswap`: open('mode=additive&n=12&gen=1', '[data-iso-mode="multiplicative"][data-iso-n="13"]'). Record pre = { state, snap (m53's) }, swap, record after1, swap, record after2. With --baseline, write the JSON; with --compare, deep-diff it and FAIL on the first difference, printing its path. Run `node .planning/quick/261106-npe-cyclic-groups-the-swap-button-trades-the/swap-check.mjs wholeswap --baseline .planning/quick/261106-npe-cyclic-groups-the-swap-button-trades-the/wholeswap-baseline.json` on the unmodified page. Look at whether its pre and after2 holder queries agree once rot / top / autorotate / autospeed are dropped and the params are sorted, and note any params that differ (needed for `roundtrip` in Task 2).
Scenario `subswap`: open('mode=additive&n=12&gen=2', '[data-iso-mode="additive"][data-iso-n="6"]'), and read h0 = the chip's data-iso-gen. Define psi(2k) = (k·h0) mod 6 on even y, memb(y) = [k·y mod 12 for k = 0 .. ord(y)-1], and pad2 as in m53. Assert #iso-swap is not hidden, then swap and assert:
- The holder query has mode=additive and n=6. The frame src has n=12, isogen=2 and isosub=1.
- Locked, is-sub-merged, no is-iso-whole, and the frame root has is-pane-merged. The pane's current row is 2 and its gen-switch is 'true'.
- mrows gives 12 rows with pg '0' .. '11' in order. Every row's r equals '{' + memb(y).map(pad2).join(', ') + '} = ⟨' + pad2(y) + '⟩'.
- l is present exactly on the even y and equals '⟨' + psi(y) + '⟩ = {' + memb(y).map(psi).join(', ') + '}'.
- gen is String(psi(y)) on the even rows and '-1' on the odd rows. The current row is pg '2'.
- No aria-label contains 'undefined' or 'NaN'. #iso-swap is still shown.
Then clickPaneRow 4, 3, 1, 10, 2 in turn and check state after each. For y inside S': the holder's gen-switch is 'true' with current data-gen psi(y), and the pane's current row is y. For y outside S' (3, 1): the holder's gen-switch is 'false', the panel's current pg is y, and the pane's current row is y. After every click: still locked and merged.
Run `subswap` now and expect it to FAIL: today #iso-swap is hidden in this state, so the probe discriminates.
(d) Run the `pane` scenario of the three regression probes in the context section on the unmodified page. Save each output to a file in your scratchpad directory, outside the repo, for the diff in Task 3.

Step 1: the pane can hold the subgroup end (DISC-1). All reads use `isoPane.hsub === true`, so the existing isoPane literals need no new field.
(a) Pane flag. Beside ISO_GEN, declare ISO_SUB = IS_ISOPANE and the URL's isosub param equals '1'. In isoPaneSrc, set isosub=1 when isoPane.hsub === true. Add 'isosub' to RING_DROP. In isoSharedPayload, add `isosub: !!(isoPane && isoPane.hsub === true)` next to isogen. In applyIsoShared, next to the isogen line, take ISO_SUB = d.isosub when flag(d.isosub).
(b) Pane-side isoOrder. While ISO_SUB is set, the link is not marked unlinked and ISO_GEN is in drawn.G.els, m is drawn.G.orders[ISO_GEN], with no cyclic requirement on the pane's group. Otherwise the existing whole-group expression applies unchanged.
(c) Holder side:
- isoLinksWholeGroups returns false while isoPane.hsub === true; put that check right after the blank guard.
- isoFound: while hsub, return H non-null, k > 0, isoPane.h in H.els and H.orders[isoPane.h] === k. Otherwise the existing return applies.
- isoLinked: the clause H.orders[isoPane.h] === H.order holds trivially while hsub.
- syncIsoLink: right after the existing sub-drop line, drop hsub when it is set and isoFound() is false (isoPane.hsub = false, isoPane.row = null). Guard the `isoPane.h = H.generators[0]` reset with `isoPane.hsub !== true`.
- isoImage: while hsub, build hp with gp.length powers instead of H.order. The whole and 261106-m53 paths keep H.order.
- syncInterlock on-branch: the subgroup pin line pins isoPane.sub only when isoPane.hsub !== true. The whole-group pin line is unchanged.
- Add the helper isoMirrorMap(G), which returns { H, phi, psi, inS }. Its gp is isoPowers() (the holder's g^k) and its hp is lap(H, isoPane.h, gp.length) (the pane's S' powers). phi(x) is hp[gp.indexOf(x)], psi(y) is gp[hp.indexOf(y)] (undefined outside S'), and inS(y) is hp.indexOf(y) !== -1.
- Add isoMirrored(): !IS_ISOPANE && isoPane && isoPane.hsub === true && subInterlocked().

Step 2: swap always (D-1) and into the mirror (D-2, DISC-5, DISC-6).
- canSwapRings drops its `!!isoWholeMap()` term and keeps the rest.
- Reword the comment above isoSwapEl: the button trades the rings' places whatever links them; a subgroup lock becomes its mirror, still locked; rings that are not isomorphic just trade places.
- swapIsoRings: classify BEFORE loadState, from the pre-swap drawn and state.
  - whole = !!isoWholeMap().
  - back = !whole && isoPane.hsub === true.
  - subLink = !whole && !back && (Number.isInteger(isoPane.sub) || (isoFound() && !isoLinksWholeGroups())).
  - Also keep oldSel = state.noSub ? null : state.gen, and oldId = drawn.G.identity.
  - Leave every existing statement up to and including `isoPane.q = hostQ.toString();` exactly as it is.
- Then branch:
  - whole: the existing `isoPane.h = g; isoPane.g = h;`, untouched.
  - subLink: isoPane.h = g, isoPane.g = h, isoPane.gAuto = false, isoPane.sub = null, isoPane.hsub = true, isoPane.row = oldSel.
  - back: isoPane.sub = h, isoPane.h = g, isoPane.g = null, isoPane.gAuto = false, isoPane.hsub = false, isoPane.row = null.
  - Otherwise (plain trade): isoPane.g = null, gAuto = false, sub = null, hsub = false, row = null, isoPane.h = g === null ? oldId : g, isoPane.link = 'none'.
- Finish with the existing loadIsoFrame(); syncControls(); render();. Keep isoPane.unlocked and isoPane.link as they are in the whole, subLink and back branches.

Step 3: the mirrored panel (D-3, DISC-2, DISC-7).
(a) In renderSubgroups, the dispatch line calls renderMirroredSubgroups(G) instead of renderMergedSubgroups(G) while isoPane.hsub === true. renderMergedSubgroups itself stays untouched.
(b) syncMirrorRow(): reconciles and returns isoPane.row. With a subgroup on show (!state.noSub), the row is phi(state.gen), or null if that is undefined. With no subgroup on show and the row inside S', the row becomes null. An outside row is kept.
(c) renderMirroredSubgroups(G), modelled on renderMergedSubgroups and built only from its helpers:
- mm = isoMirrorMap(G), H = mm.H, row = syncMirrorRow().
- The holder's formats come from lg / rg exactly as there (fl, fr with widthG). The pane's formats come from isoPane.subExpr, with SUB_SORT read as null (DISC-2), through hfl / hfr with widthH and paneNatOff as there.
- rows: H.els.map(y => { y, members: lap(H, y, H.orders[y]) }).
- leftText: '⟨' + fl.p(psi(y)) + '⟩ = {' + members.map(x => fr.p(psi(x))).join(', ') + '}', for S' rows only.
- rightText: '{' + members.map(hfr.p).join(', ') + '} = ⟨' + hfl.p(y) + '⟩'.
- Signature string: prefix 'R ', then lang, G.key, H.key, isoPane.h, row, lg, rg, hl, hr, isoOrder(), widthG, widthH, expWidth, subPad, natExpOff, paneNatOff, the signed and reveal flags as in the merged sig, memberPaintKey(G) and isoLinked(). On a match, take the fast path: toggle is-current / aria-pressed by Number(data-pane-gen) === row, then call syncRowPaths, syncSubFormula, syncGenExp, focus and keepCurrentRowInView as renderMergedSubgroups's fast path does.
- Each row is a button with class 'subgroup-row is-merged' (plus is-current), data-gen = String(psi(y)) inside S' or '-1' outside, data-pane-gen = String(y), aria-pressed, and aria-label = leftText + '; ' + rightText inside S' or rightText alone outside.
- A `.sub-row-l` span (S' rows only) is built like the merged left span, with memberMath(psi(x), fr.r(psi(x))) for its members and angle(memberMath(psi(y), fl.r(psi(y)))) for its generator.
- A `.sub-row-r` span (every row) is built like the merged right span: '{' members '} = ⟨y⟩', each member painted through memberMath(psi(x), …) when linked and x is in S', plain otherwise.
- Tooltips use subRowGcdTitle as there: H with y on the right, G with psi(y) on the left.
- click: if followRefused(), stop; else pickMirrorRow(y) and focusCurrentRow(). mouseenter / focus / blur go through hoverRow / setPreview with psi(y), on S' rows only.
- No gcd dividers, no folding.
- Set subExports per DISC-8:
  - [0] = { G, fixed: the S' rows mapped through psi ({ g: psi(y), members: members.map(psi) }), gens: rows.map(S' ? psi(y) : null), exprs: [lg, rg], lines: rows.map(S' ? asciiText(leftText) : null) }.
  - [1] = { G: H, fixed: rows.map({ g: y, members }), gens: rows.map(y), psi, exprs: [hl, hr], natOff: paneNatOff, lines: rows.map(asciiText('⟨' + hfl.p(y) + '⟩ = {' + members.map(hfr.p).join(', ') + '}')) }.
- End with rowAnchor / restoreRowAnchor, syncRowPaths, syncSubFormula, syncGenExp, focus, keepCurrentRowInView and syncSubMore, as the merged renderer does.
(d) pickMirrorRow(y): set isoPane.row = y. If y is in S', call selectGen(panelGen = psi(y)). Otherwise, if !state.noSub, set state.noSub = true and render(); else render().
(e) syncSubExpr: subSortPairEl is also hidden while merged and isoPane.hsub === true (DISC-2). syncMergedExpr needs no change, since phi from the generalised isoImage is defined on the whole holder group.

Step 4: the selection protocol for rows outside S' (DISC-3).
(a) selKey gains an optional 4th argument, el, appended to the key only when it is an integer, so every existing key string stays the same.
(b) syncInterlock's select part, after its early return: on the holder, call syncMirrorRow() while hsub. Compute el:
- holder: isoPane.hsub === true, k === -1 and isoPane.row an integer → isoPane.row;
- pane: ISO_SUB, k === -1 and !state.noSub → state.gen;
- otherwise null.
Use el in the selKey comparison. Add `el` to the select message only when it is an integer.
(c) isoReceive 'select':
- Validate el. Holder: an integer in isoMirrorMap(drawn.G).H.els and outside S', while hsub. Pane: an integer in drawn.G.els with isoPowers().indexOf(el) === -1, while ISO_SUB. Any other el counts as absent.
- Use the validated el in isoSelSent.
- For d.k < 0 with a valid el: the pane calls selectGen(el) when it is not already showing it. The holder sets isoPane.row = el and goes to no subgroup (state.noSub = true; render()), or re-renders when only the row changed.
- For d.k < 0 without el on the holder while hsub: set isoPane.row = null before the existing noSub handling, and re-render if it changed.
- The k >= 0 path is unchanged.

Run the parse check, then `wholeswap --compare`, then `subswap`, then the m53 whole and sub scenarios against whole-baseline-head.json.
  </action>
  <verify>
    <automated>node -e "const fs=require('fs');const h=fs.readFileSync('Cyclic Groups/cyclic-groups.html','utf8');const re=/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g;let m,i=0;while((m=re.exec(h))){i++;new Function(m[1]);}console.log('parsed',i)" && test -s .planning/quick/261106-npe-cyclic-groups-the-swap-button-trades-the/wholeswap-baseline.json && test -s .planning/quick/261106-npe-cyclic-groups-the-swap-button-trades-the/whole-baseline-head.json && node .planning/quick/261106-npe-cyclic-groups-the-swap-button-trades-the/swap-check.mjs wholeswap subswap --compare .planning/quick/261106-npe-cyclic-groups-the-swap-button-trades-the/wholeswap-baseline.json && node .planning/quick/261106-m53-cyclic-groups-merge-the-bottom-panels-in/merged-sub-check.mjs whole sub --compare .planning/quick/261106-npe-cyclic-groups-the-swap-button-trades-the/whole-baseline-head.json</automated>
  </verify>
  <done>The Z/12Z <2> to Z/6Z lock swaps into the mirror: Z/6Z on the left, Z/12Z with <2> on the right, still locked and merged, the pane told isogen=2 / isosub=1. The mirrored panel lists the 12 rows of Z/12Z with right sides on every row and left sides on the even rows only, as D-3 states. Clicking 4 / 3 / 1 / 10 / 2 selects on both rings or on the right ring only while the lock holds. The whole-group swap and the m53 panels match the baselines captured before the edit. No exceptions.</done>
</task>

<task type="auto">
  <name>Task 2: Expand — round trip, plain trade, unlocked swap, non-cyclic holder, pane-side picks, keyboard stepping, colours together (D-1, D-2, DISC-4..7)</name>
  <files>Cyclic Groups/cyclic-groups.html, .planning/quick/261106-npe-cyclic-groups-the-swap-button-trades-the/swap-check.mjs</files>
  <read_first>In "Cyclic Groups/cyclic-groups.html", sed -n ranges around: function borrowedPaints, function isoTellPaints, function isoTakePaints, function isoTellTop, function isoArrangeAs, the paint consumer in render (grep -n "isoBorrowed = borrowedPaints"), the `isoTellTop(false)` line in render, the linked branch of applyIsoShared, function loadIsoFrame (its first 15 lines), function stepSubRow, the subgroupsEl mousemove listener (grep -n "hoverRow(row, Number"), the holder's 'subinv' handler (grep -n "isopane === 'subinv'"), and the stepSubRow callers (grep -n "stepSubRow(").</read_first>
  <action>
A. Colours together (DISC-4). Add isoPaintsFrom(): on the pane it returns ISO_SUB, on the holder it returns !(isoPane && isoPane.hsub === true). This is the side whose paints the other ring borrows.
- isoTellPaints returns at once unless isoPaintsFrom() and isoOrder() > 0. isoTellTop's `if (!IS_ISOPANE) isoTellPaints(force);` becomes an unconditional isoTellPaints(force) call; the gate now lives inside isoTellPaints, so the holder's behaviour is unchanged.
- In render, next to `if (!IS_ISOPANE) isoTellTop(false);`, have the pane call isoTellPaints(false) while ISO_SUB, because the pane does not run isoTellTop after its render.
- isoReceive's 'paint' line takes the paints on the side where isoPaintsFrom() is false.
- borrowedPaints returns null when isoPaintsFrom() is true or isoPaints is null. It also returns null when the link is off: on the pane, the is-iso-unlinked class as today; on the holder, !isoLinked(). It requires G.cyclic, G.orders[isoLinkGen()] === G.order and isoPaints.length === G.order, and maps lap(G, isoLinkGen(), G.order). On the pane isoLinkGen() is ISO_GEN, so its whole-group path evaluates exactly as before.
- loadIsoFrame clears isoPaints (the holder's copy) together with its other resets.
- In applyIsoShared's linked branch, the pane resets isoSentPaints to null while ISO_SUB, so a relock sends the paints again.
- isoArrangeAs returns early when isoOrder() !== drawn.G.order. A pane whose link is a proper subgroup keeps its own bead layout; the whole-group and 261106-m53 panes have m === order and are unaffected.

B. Rows outside S' and stepping (DISC-7).
- The subgroupsEl mousemove listener skips a row whose Number(data-gen) is negative.
- stepSubRow, on the holder while isoMirrored(): after the pane relay and followRefused lines, step through the mirrored rows (the data-pane-gen values in DOM order). Start from isoPane.row, wrap around at both ends as the existing code does, set keyNav = true, call pickMirrorRow(next) and return true. If next equals the current row, return false.
- The holder's 'subinv' handler: while isoMirrored() with no subgroup on show and an integer isoPane.row, call pickMirrorRow(H.inv[isoPane.row]), with H = isoPaneGroup(). Otherwise the existing call applies.
- No change is needed in pickGen: a pane bead outside S' is selected locally, and Task 1's el field carries it to the holder.

C. Probe scenarios, added to swap-check.mjs:
- `outside`: subswap setup and swap. Then tap the pane's bead 3 with a real pointer: take its circle.bead[data-el="3"] rectangle in the frame's contentDocument, add the iframe's getBoundingClientRect offset, and call P.mouseTap. Expect the panel's current pg 3, the holder's gen-switch 'false', the pane's current row 3, still locked and merged. If the tap cannot hit the bead, post {iso:'select', k:-1, el:3, order:6, follow:false, beads:false} from the frame window instead and say which you used in the SUMMARY. Then press the row-stepping key found through the stepSubRow callers, with a panel row focused. Expect the panel's current pg 4, the holder's current data-gen psi(4) and the pane's current row 4.
- `roundtrip`: run subswap's steps, ending on row 2. Before the first swap, take pre = { state, snap, holder query normalised (drop rot / top / autorotate / autospeed, sort the params) }. Swap twice and compare:
  - snap items' gen / aria / l / r and cls must be deep-equal;
  - sel must be deep-equal, holder 2 and pane φ(2);
  - the normalised holder queries must be equal, apart from any params that already differed on wholeswap's own round trip at HEAD (noted in Task 1 Step 0 (c)); list such params in the SUMMARY;
  - the frame src must have isosub absent and isogen = h0;
  - right spans on 0, 2, 4, 6, 8 and 10 again (the 261106-m53 panel).
- `plain`: subswap setup. Post {isopane:'swap', spec:{mode:'additive', n:5, curve:null, label:'x'}} from the frame window as m53's `swaps` does, and wait 3.5 s. Expect not merged and #iso-swap shown (it was hidden here before this plan). Swap: the holder query has mode=additive&n=5, the frame src has n=12 with no isosub, nothing is merged, and nothing throws. Swap again: the holder has n=12 and gen=2, and the frame has n=5.
- `unlockswap`: subswap setup. Dispatch dblclick on #group-controls and wait 3 s. Expect not merged and #iso-swap shown. Swap: the holder has n=6, nothing is merged, and #iso-lock is shown with is-open. Click #iso-lock and wait 2 s: locked and merged again, with the mirrored rows (12 pg, l on the even rows only).
- `noncyclic`: open('mode=multiplicative&n=8&gen=3', '[data-iso-mode="additive"][data-iso-n="2"]') and swap. The holder has mode=additive&n=2. The mirrored pg run 1, 3, 5, 7, with r on all four and l on 1 and 3 only. Row 3: r '{1, 3} = ⟨3⟩', l '⟨1⟩ = {0, 1}'. Row 1: r '{1} = ⟨1⟩', l '⟨0⟩ = {0}'. clickPaneRow 5: the holder's gen-switch is 'false', the pane's current row is 5, still locked.
- `paints`: open('mode=additive&n=12&gen=2&colorby=distinct', SUB_CHIP) and swap. For each holder element x of Z/6Z, compare the paint-derived parts of `#ring-svg circle.bead[data-el=x]` and of the pane's bead phi(x) = 2·((x·h0^-1) mod 6). Read which classes and style drawn.paint writes onto a bead from beadPainter, and compare only those, not selection or hover classes. Expect equal for all six.
Run every scenario except `exports`, plus `wholeswap --compare` and the full m53 probe with --compare whole-baseline-head.json.
  </action>
  <verify>
    <automated>node -e "const fs=require('fs');const h=fs.readFileSync('Cyclic Groups/cyclic-groups.html','utf8');const re=/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g;let m,i=0;while((m=re.exec(h))){i++;new Function(m[1]);}console.log('parsed',i)" && node .planning/quick/261106-npe-cyclic-groups-the-swap-button-trades-the/swap-check.mjs wholeswap subswap outside roundtrip plain unlockswap noncyclic paints --compare .planning/quick/261106-npe-cyclic-groups-the-swap-button-trades-the/wholeswap-baseline.json && node .planning/quick/261106-m53-cyclic-groups-merge-the-bottom-panels-in/merged-sub-check.mjs --compare .planning/quick/261106-npe-cyclic-groups-the-swap-button-trades-the/whole-baseline-head.json</automated>
  </verify>
  <done>Swapping twice restores the 261106-m53 state. A non-isomorphic pair trades places with no link. An unlocked subgroup lock swaps and relocks into the mirror. A non-cyclic holder mirrors. The pane's own beads outside S' and arrow-key stepping move the mirrored selection. The holder's beads wear the pane's paints for their images. The whole-group swap and every m53 scenario are unchanged. No exceptions.</done>
</task>

<task type="auto">
  <name>Task 3: Exports in the mirrored state (D-3, DISC-8), gates, regression probes, one commit on main</name>
  <files>Cyclic Groups/cyclic-groups.html, .planning/quick/261106-npe-cyclic-groups-the-swap-button-trades-the/swap-check.mjs</files>
  <read_first>In "Cyclic Groups/cyclic-groups.html", sed -n ranges around: function exportRows, function isoExportLines, function exportHead, function isoExportName, function isoExportNameNode, function openExportWin (its first 30 lines), function setSubCtx (through the Export isomorphism item), the panel contextmenu listener (grep -n "setSubCtx(true"). Then review `git diff -- "Cyclic Groups/cyclic-groups.html"` once, whole.</read_first>
  <action>
A. Export consumers (DISC-8):
- exportRows returns ex.fixed when it is set, before anything else. The existing entries have no fixed, so they behave as before.
- isoExportLines: when w.exR.psi is set, it takes rows = w.exR.fixed (every pane row). The left columns come from exportCols(w.ex.G, the inS rows mapped through psi, w.left, w.right, w.width, w.natOff), and the right columns from exportCols(w.exR.G, rows, w.leftR, w.rightR, w.width, w.natOffR). A row inside S' is its left string padded to the widest left plus 4 spaces, followed by padTextStart(right, widest right). A row outside S' is the same blank run (the widest left plus 4 spaces) followed by the padded right string. The phi path is unchanged.
- isoExportName and isoExportNameNode return G.label / groupNameNode(G) while isoPane.hsub === true, since the holder's end is its whole group.
- Add isoExportImage(H) and isoExportImageNode(H). While hsub they return '⟨' + elText(H, isoPane.h) + '⟩'. Otherwise they return H.label / groupNameNode(H), which is exactly what is used today.
- Use them for the image in exportHead, in openExportWin's isoExportGroup head and in the context menu's isoExportDots label. The Export isomorphism item is offered when subExports[1] has phi or psi.
- The contextmenu listener passes a 6th argument to setSubCtx: the row's data-pane-gen as a Number when present, else null. In setSubCtx, while that paneGen is an integer and subExports[1].psi is set, compute at = subExports[1].gens.indexOf(paneGen). Offer the Export subgroup item for the clicked side even when h is -1 (a row outside S', right half). The cosets item stays under the existing h guard. Outside the mirrored state the menu is built exactly as before.

B. Probe scenario `exports`: subswap setup and swap.
- Right-click row 4's `.sub-row-r` (bubbling, cancelable contextmenu at its centre) and read the `#sub-ctx .fs-menu-item` texts. Expect an Export subgroup item, two Export group items, and an Export isomorphism item whose text matches /ℤ\/6ℤ.*≌.*⟨2⟩/.
- Click the three aria-haspopup="dialog" items in turn, closing or reloading between them as m53's exportPreviews does. Read pre.export-win-preview:
  - group 0: a header, a blank line and 6 lines matching /^<[0-5]> = \{[0-5](, [0-5])*\}$/;
  - group 1: 12 lines matching /^<\d{1,2}> = \{\d{1,2}(, \d{1,2})*\}$/;
  - isomorphism: a header containing '<2>', a blank line and 12 lines, each ending in /\{[^}]*\} = <\d{1,2}>$/. Line y starts with '<' for even y and with a space for odd y.
- Right-click row 3's `.sub-row-r` and row 4's `.sub-row-l`: both menus offer the Export subgroup item.
Run the m53 `export` scenario too; it is unchanged.

C. Review the diff once:
- comments are prose in the file's style;
- no leftover debug code;
- no new user-visible string;
- every new string literal is an all-lowercase or hyphenated token;
- renderMergedSubgroups is unchanged (`git diff` shows no hunk inside it).
Rerun the three regression probes' `pane` scenarios, diff their FAIL lines against the Task 1 Step 0 (d) outputs, and allow no new FAIL. Run the full swap-check (with --compare), the full m53 probe and the three i18n gates. Optionally screenshot the mirrored panel with row 03 selected into your scratchpad and check it by eye.

D. Commit on main (no branch, quiet git, no push), staging only "Cyclic Groups/cyclic-groups.html". The probe, the baselines and the screenshots stay untracked. Message: `feat(cyclic-groups): the swap button always trades the two rings, a subgroup locked to a group swapping into its mirror, still locked, the shared bottom panel listing the right ring's rows with their preimages on the left`, then a blank line and the two lines `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>` and `Claude-Session: https://claude.ai/code/session_019tLocw1DRvHAb1sEExfCcB`.
  </action>
  <verify>
    <automated>node .planning/quick/261106-npe-cyclic-groups-the-swap-button-trades-the/swap-check.mjs --compare .planning/quick/261106-npe-cyclic-groups-the-swap-button-trades-the/wholeswap-baseline.json && node .planning/quick/261106-m53-cyclic-groups-merge-the-bottom-panels-in/merged-sub-check.mjs --compare .planning/quick/261106-npe-cyclic-groups-the-swap-button-trades-the/whole-baseline-head.json && node .planning/phases/06-multi-language-support/i18n-check.js --coverage --all 2>&1 | grep -q 'coverage: 91 finding' && node .planning/phases/06-multi-language-support/i18n-check.js --literals-markup --all 2>&1 | grep -q 'literals-markup: 4 finding' && node .planning/phases/06-multi-language-support/i18n-check.js --literals-js --all 2>&1 | grep -q 'literals-js: 131 finding' && test "$(git rev-parse --abbrev-ref HEAD)" = main && git diff --quiet HEAD -- 'Cyclic Groups' assets && test "$(git diff --name-only 4870e61 HEAD -- 'Cyclic Groups' assets)" = "Cyclic Groups/cyclic-groups.html" && C=$(git log --format=%H 4870e61..HEAD -- 'Cyclic Groups/cyclic-groups.html') && test "$(printf '%s\n' "$C" | grep -c .)" = 1 && MSG=$(git log -1 --format=%B -- 'Cyclic Groups/cyclic-groups.html') && printf '%s\n' "$MSG" | head -1 | grep -q '^feat(cyclic-groups): ' && printf '%s\n' "$MSG" | grep -q '^Claude-Session: https://claude.ai/code/session_019tLocw1DRvHAb1sEExfCcB$' && D=$(git diff 4870e61 HEAD -- 'Cyclic Groups/cyclic-groups.html') && test "$(printf '%s\n' "$D" | grep '^+' | grep -c 'innerHTML')" = 0 && test "$(printf '%s\n' "$D" | grep '^+' | grep -cE '#[0-9a-fA-F]{3,8}\b|rgba?\(|hsla?\(')" = 0 && test -z "$(git ls-files .planning/quick/261106-npe-cyclic-groups-the-swap-button-trades-the/swap-check.mjs)"</automated>
  </verify>
  <done>In the mirrored state, the menu offers Export isomorphism <Z/6Z, +> ≌ <2>… with 12 lines (left parts on the even rows only), Export group for both groups, and Export subgroup on every right half and on the S' left halves. One feat(cyclic-groups) commit on main changes only the page. Every swap-check and m53 scenario passes against the baselines captured before the edit, and the three older probes show no new FAIL. The gates read 91 / 4 / 131. Nothing is pushed.</done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| holder window <-> pane iframe (postMessage) | Existing channel; each side hears only its peer window. This plan adds the optional `el` field to 'select' and lets the holder receive 'paint' in the mirrored state. |
| URL query -> pane flags | `isosub` is read once at load; RING_DROP strips it from every stored ring query. |

## STRIDE Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation Plan |
|-----------|----------|-----------|----------|-------------|-----------------|
| T-npe-01 | Tampering | 'select' message `el` | low | mitigate | Accepted only as an integer in the receiving ring's group (H.els on the holder, drawn.G.els on the pane), outside the link subgroup, and only while that side is mirrored (hsub / ISO_SUB); otherwise ignored. The existing k range check (-1 <= k < isoOrder()) and d.order match still gate the message. |
| T-npe-02 | Tampering | 'paint' message now taken by the holder | low | mitigate | Reuses isoTakePaints' existing validation (length === isoOrder(), cls matching /^[a-z0-9 -]{0,40}$/, style starting with '--ord: ' and free of ; { } < >). The holder accepts it only while isoPaintsFrom() is false (hsub), and borrows it only while linked with a matching length. |
| T-npe-03 | Tampering | isosub URL param / shared flag | low | mitigate | Compared with === '1' / typeof boolean. It only changes how the pane computes isoOrder, which the holder's order check must still match; RING_DROP keeps it out of saved queries. |
| T-npe-04 | Tampering | mirrored row text and export lines | low | mitigate | Built with the existing mInline / textContent / translateInto and asciiText paths. Task 3's gate greps the added lines for HTML-string assignment and colour literals. |
| T-npe-SC | Tampering | npm/pip/cargo installs | low | accept | No package installs: the probe uses Node's built-in WebSocket / fetch and the system google-chrome. |
</threat_model>

<verification>
- swap-check.mjs: all scenarios pass. `wholeswap` matches wholeswap-baseline.json, captured from the unmodified page. `subswap` failed before the edit (swap hidden), so the probe discriminates.
- merged-sub-check.mjs: all scenarios pass against whole-baseline-head.json, captured at HEAD 4870e61 before the edit.
- The `pane` scenarios of formula-map-check, log-base-lock-check and log-base-boxes-check show no FAIL line that was absent at HEAD.
- Manual check, file:// in a browser: open "Cyclic Groups/cyclic-groups.html?mode=additive&n=12&gen=2" and click the Z/6Z chip beside <2>. Click the swap button: Z/6Z is on the left, and Z/12Z with <2> is on the right, padlock closed. The panel lists <00>..<11> on the right, with left sides on the even rows. Click <03>: the left ring shows no subgroup, and the right ring shows <03>. Swap again: back to the 261106-m53 panel.
- The i18n gates read 91 / 4 / 131, and one commit on main touches only the page.
</verification>

<success_criteria>
- D-1: the swap button is there for every pane holding a real group. Non-isomorphic pairs trade places with no link, and the whole-group swap is unchanged against its pre-edit baseline.
- D-2: a subgroup-to-group lock swaps into its locked mirror (whole group on the left, the big group with the locked subgroup on the right), turning, colouring and lighting together, and swapping back restores the original state.
- D-3: the mirrored merged panel lists the right ring's rows with their preimages on the left only inside the subgroup. Row clicks select on both rings or on the right ring only without breaking the lock, and Export isomorphism / group / subgroup all work there.
</success_criteria>

<output>
Create `.planning/quick/261106-npe-cyclic-groups-the-swap-button-trades-the/261106-npe-SUMMARY.md` when done, and leave it uncommitted (the orchestrator commits planning docs). It records:
- D-1 to D-3 and DISC-1 to DISC-8 as implemented;
- which pre-existing FAIL lines, if any, the old probes or the m53 probe showed at HEAD;
- which query params, if any, differ on a whole-group round trip at HEAD;
- whether `outside` used a real tap or the posted message;
- each probe's scenario results;
- the commit hash.
</output>
