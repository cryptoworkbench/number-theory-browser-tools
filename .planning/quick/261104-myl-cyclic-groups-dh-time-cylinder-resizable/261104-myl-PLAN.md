---
phase: quick-261104-myl
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - Cyclic Groups/cyclic-groups.html
  - assets/i18n/cyclic-groups.js
autonomous: true
requirements: [QUICK-261104-myl]

estimate:
  tokens: 120000
  raw_tokens: 120000
  tasks: 3
  confidence: low

must_haves:
  truths:
    - "The time cylinder window's corner grip resizes it in width and height independently, up to the whole room under the Ring window's rows and above its bottom bar (at 1440x900 at least 1200 px wide and 600 px tall), the picture growing with it both ways while the head, legend and hint text keep their own size"
    - "A fill button in the window's head makes the time cylinder fill that room and, pressed again, puts it back at its earlier size and place; while the cylinder is open the Diffie–Hellman window stays above it, so Back, Step, Play and Instant stay reachable"
    - "The wheel (and a touchpad pinch, a Ctrl wheel) over the picture zooms the cylinder about the pointer, spreading slices and beads apart while dots, lines and step numerals keep their size; the subgroup selection, the address bar and the ring's own zoom are left alone"
    - "A plain drag turns the cylinder sideways and tilts it up and down, the tilt now reaching from a side view to looking straight down the time axis; Shift+drag or a middle-button drag moves the cylinder within the picture; the window itself moves only by its head"
    - "With the picture focused: arrow keys turn and tilt, Shift+arrows move, + and − zoom, 0 or Home resets; the picture's top-right corner holds zoom out, zoom in and reset-view buttons; a double click resets; the hint under the picture names these controls and how to make the window larger"
    - "The change is one commit on dh-cylinder-base carried by cherry-pick (same patch-id) onto dh-cylinder-hop-shared, dh-cylinder-hop-split, dh-cylinder-frame-shared and dh-cylinder-frame-split, each passing the extended probe with its own slice and cylinder counts and zero console errors, the i18n gates at 91 / 4 / 131; main's code is untouched and dh-cylinder-frame-split is checked out at the end"
  artifacts:
    - path: "Cyclic Groups/cyclic-groups.html"
      provides: "plotWindow's free-size option, the #dhc-plot picture wrapper .dhc-view with its .dhc-nav corner buttons, the #dhc-fill head button, zoom and pan in the time cylinder's projection, the wheel / pan / key handlers and the two wheel-handler exemptions"
      contains: "DHC_ZOOM_MAX"
    - path: "assets/i18n/cyclic-groups.js"
      provides: "English-only dhCylFill, dhCylUnfill and dhCylReset, the updated English dhCylHint, all named in the header comment's English-first list"
      contains: "dhCylReset"
  key_links:
    - from: "dhcWin"
      to: "plotWindow free mode"
      via: "plotWindow(dhcPlotEl, $('dhc-grip'), false, null, true): its grip sets width and height apart and the class is-sized, never --plot-scale"
      pattern: "plotWindow\\(dhcPlotEl, \\$\\('dhc-grip'\\), false, null, true\\)"
    - from: "window capture-phase wheel handlers (Generator scroll switch, subgroup stepping)"
      to: "dhcSvgEl wheel listener"
      via: "both handlers return early for a target inside .dhc-svg, as the arrow-key handler already does"
      pattern: "closest\\('\\.dhc-svg'\\)"
    - from: "syncDhCyl signature"
      to: "drawDhCyl"
      via: "zoom and pan join yaw and pitch in the redraw signature"
      pattern: "dhc\\.zoom, dhc\\.panX, dhc\\.panY"
    - from: "drawDhCyl / dhcAt"
      to: "the view (dhc.zoom, dhc.panX, dhc.panY)"
      via: "radius, axis length and cylinder offsets times the zoom, the centre shifted by the pan; viewBox stays 0 0 W DHC_H"
      pattern: "dhc\\.panX"
---

<objective>
Let the user make the Diffie–Hellman time cylinder window much larger, its picture scaling with it, and navigate the cylinder properly: zoom, tilt (wider range), pan and reset, by mouse, keyboard and small corner buttons. The window shell, projection and renderer are shared by all four variants, so the change is ONE commit on dh-cylinder-base, cherry-picked onto each of the four variant branches.

Purpose: at its current size the window can barely grow (its grip keeps the shape and scales the text, so the height runs out at about 2x), and the 32-slice hop variants are too squashed to read; a free resize plus a zoom that spreads the slices apart fixes both.
Output: one new commit on dh-cylinder-base and its cherry-pick on dh-cylinder-hop-shared, dh-cylinder-hop-split, dh-cylinder-frame-shared, dh-cylinder-frame-split (each then base + 3); the untracked probe .planning/quick/261104-myl-cyclic-groups-dh-time-cylinder-resizable/dhc-nav-probe.mjs; an uncommitted SUMMARY in this quick directory; dh-cylinder-frame-split checked out at the end.

Coverage of the request and the locked decisions: resizable much larger with the picture scaling and a fill toggle (Tasks 1, 2); zoom by wheel / Ctrl wheel / buttons / keys (Tasks 1, 2); tilt by vertical drag and Up/Down (exists, range widened in Task 2); pan by Shift-drag / middle-drag / Shift+arrows (Task 2); reset by button / dblclick / Home / 0 (Task 2); the .dhc-svg exemptions in the window handlers (Task 1 wheel, arrow exemption already present); compact controls, no new rows (Task 2: head button + corner overlay); updated hint (Task 2); English-only strings listed in the header comment (Task 2); one base commit cherry-picked onto all four branches, quiet git, repo-style message with trailers, end on dh-cylinder-frame-split, untracked files and the user's stash left alone (Task 3); per-branch parse, i18n gates, probe and large screenshot (Task 3).
</objective>

<execution_context>
@~/.claude/gsd-core/workflows/execute-plan.md
@~/.claude/gsd-core/templates/summary.md
</execution_context>

<context>
@CLAUDE.md
@.claude/CLAUDE.md

Previous task (built this window; its PLAN and SUMMARY are committed on main only): `git show main:.planning/quick/261104-krz-cyclic-groups-diffie-hellman-time-cylind/261104-krz-SUMMARY.md`. Its probe (untracked, keep it unchanged): .planning/quick/261104-krz-cyclic-groups-diffie-hellman-time-cylind/dhc-probe.mjs.

Branch facts (measured by the planner): dh-cylinder-base = 22cd9e4 + 9e5ad75. Each variant = base + 2 commits that are PURE INSERTIONS at two points only: right after the dhcTimeline contract comment (ends "step's pieces for the staggered fade-in.") and right after the dhcLayout contract comment (ends "step }."). drawDhCyl, dhcAt, syncDhCyl and all handlers are identical on all five branches. On dh-cylinder-base alone the cylinder cannot be drawn (no dhcTimeline/dhcLayout), so development and probing happen on dh-cylinder-frame-split's working tree and the finished change is moved to base in Task 3. i18n-check baseline on dh-cylinder-frame-split: --coverage --all 91, --literals-markup --all 4, --literals-js --all 131 (output line "I18N-CHECK FAIL coverage: 91 finding(s)" etc.). main is at 86a406c (22cd9e4 + the krz docs commit). stash@{0} is the user's own ("polygon follows Arrangement generator"): never run git stash.

Code to read (line numbers on dh-cylinder-frame-split; read only these ranges, the page is 22.6k lines):
- Cyclic Groups/cyclic-groups.html 1021-1022 and 1171-1188 (.curve-plot window: flex column, --plot-scale text scaling, .curve-grip bottom-left, .curve-plot-svg width 100% height auto overflow visible), 1078 (.dh-plot width), 1110-1164 (all .dhc-* CSS).
- 3079-3087: #dh-plot head and the #dhc-plot section markup (head h2 + #dhc-close, svg#dhc-svg viewBox 0 0 300 360, .dhc-legend, .dhc-hint with data-i18n cyclicGroups.dhCylHint, #dhc-grip).
- 13325-13634: the whole time cylinder JS (dhcPlotEl, dhcWin, DHC_* constants, dhc state, dhcAt, openDhCyl, closeDhCyl, toggleDhCyl, the slices contract + dhcTimeline, drawDhCyl, the cylinders contract + dhcLayout, syncDhCyl with its signature, dhcTurned, pointer/dblclick/keydown handlers, dhcReset).
- 14399-14512: plotFloor and plotWindow (win.place clamps into body left..workRight and topRowsBottom..floor; win.size(w) sets width, max-height none and --plot-scale = w/300; grip() excludes button and .curve-plot-svg targets; the grip's pointerdown computes room and an aspect-locked maxW; dblclick on the grip calls win.size(null)).
- 6747-6755 workRight and topRowsBottom; 6958-6962 svgIcon(parts); 10488-10498 syncPlotDockBtn (the head-button pattern: icon rebuilt by svgIcon, title/aria-label from translate, aria-pressed).
- 11514-11523: document keydown + / - stepping the ring's zoom (bubble phase, so stopPropagation on the svg keeps it off).
- 17105-17125: window capture keydown for arrows (already returns for shift and for .dhc-svg); 17156-17170 and 17176-17190: the two window capture-phase wheel handlers (Generator scroll switch with stopImmediatePropagation; subgroup stepping) that take the wheel anywhere, each with a line skipping svg.ring-svg while zoomWheelOn.
- Helpers in scope: $, clamp, boxOf, ptX, ptY, num, svgEl, svgIcon, translate, getLang, IS_MOBILE, workRight, topRowsBottom, plotFloor, redrawRing.
- assets/i18n/cyclic-groups.js: header comment 200-212 (English-first list ending "...its legend reuses dhAlice and dhBob). Every other language shows the English value through NT.i18n's fallback meanwhile."), en block from 686 with dhCyl* keys at 1265-1270, ctxZoomIn 'Zoom in' / ctxZoomOut 'Zoom out' at 1273-1274 (present in all 31 languages: reuse them), resizeTitle (grip tooltip, reused as is).
</context>

<tasks>

<task type="tracer">
  <name>Task 1: Free-size window and wheel zoom, end to end on dh-cylinder-frame-split's working tree</name>
  <files>Cyclic Groups/cyclic-groups.html, .planning/quick/261104-myl-cyclic-groups-dh-time-cylinder-resizable/dhc-nav-probe.mjs</files>
  <precondition>dh-cylinder-frame-split is checked out and `git status --porcelain --untracked-files=no` prints nothing.</precondition>
  <action>
Work uncommitted on dh-cylinder-frame-split (Task 3 moves the change to base). Edit only shared code: never the dhcTimeline or dhcLayout function, the two contract comments above them, or the blank line and section-marker line that follow each contract comment (so the cherry-picks in Task 3 stay clean). Palette tokens via var() only, no literal colour of any kind; text only through textContent / setAttribute / translate, no HTML-string assignment.

A. plotWindow gains a fifth parameter, free (extend the comment above it by one or two lines: a free window is sized by its grip in width and height apart, its text left at its own size, and carries the class is-sized while it has a size of its own). Every non-free path stays exactly as it is. In free mode: win.size(w, h) with w null removes width, height, max-height, --plot-scale and is-sized; otherwise sets width w px, height h px, max-height none and adds is-sized, never touching --plot-scale. The grip's pointerdown records the start height too; maxW is the room beside the fixed edge alone (no aspect factor), maxH = plotFloor(body) - topRowsBottom(body) - 8 (never below the current height), minimums 200 wide and 220 tall. Its pointermove sets w = clamp(start w + dir * (start x - ptX(e))) and h = clamp(start h + ptY(e) - start y) independently, then win.size(w, h) and win.place as now. The grip's dblclick keeps calling win.size(null). Change the call site to dhcWin = plotWindow(dhcPlotEl, $('dhc-grip'), false, null, true).

B. Markup: wrap svg#dhc-svg in a new div.dhc-view (Task 2 puts the corner buttons inside it). CSS next to the .dhc rules: .dhc-view position relative, flex 0 1 auto, min-height 0; .dhc-plot.is-sized > .dhc-view flex 1 1 0; .dhc-plot.is-sized .dhc-svg height 100%; .curve-plot-svg.dhc-svg overflow hidden (zoomed or moved geometry must not spill over the head and legend). Keep the viewBox at 0 0 W DHC_H with the default preserveAspectRatio: the browser then fits the base drawing into whatever box the sized window gives the svg, so no ResizeObserver and no measured viewBox are needed.

C. View state in the projection: dhc gains zoom 1, panX 0, panY 0 and w (the layout width of the last draw, set in drawDhCyl, for event maths); add DHC_ZOOM_MIN 0.4 and DHC_ZOOM_MAX 8. In drawDhCyl take Z = dhc.zoom, R = lay.R * Z, the axis length DHC_L * Z (zOf, lo, hi) and the centre OX = W/2 + dhc.panX, OY = DHC_H/2 + dhc.panY; every expression that used W/2 + cyl.cx or DHC_H/2 uses OX + cyl.cx * Z and OY instead: dhcAt's x and y, the walls, both caps, the rims' centre height, the tags' left edge and height (the links go through dhcAt). Leave the mark radius 4.2, halo step 2.6, hop-dot radius 2, the rBead clamp bounds, stroke widths and the tag font unscaled, so zooming spreads slices and beads apart instead of fattening them. Depth expressions stay as they are (they scale consistently). syncDhCyl's signature gains dhc.zoom, dhc.panX, dhc.panY right after dhc.pitch.

D. Zoom: dhcUser(e) returns the pointer's user coordinates from boxOf(dhcSvgEl) and ptX/ptY with the meet fit (scale s = min(box width / dhc.w, box height / DHC_H), the drawing centred in the box), plus s for pixel-to-unit conversions. dhcZoomAt(f, u, v): Z1 = clamp(Z0 * f, DHC_ZOOM_MIN, DHC_ZOOM_MAX); panX = u - dhc.w/2 - (u - (dhc.w/2 + panX)) * Z1 / Z0, the same for panY with DHC_H/2, so the point under the pointer stays put; then dhcTurned(). A wheel listener on dhcSvgEl (passive false, ignored on IS_MOBILE or with no deltaY): preventDefault, dy = deltaMode ? deltaY * 40 : deltaY, f = exp(-dy * (ctrlKey ? 0.01 : 0.0015)) (Ctrl is a touchpad pinch, and taking it keeps the browser from zooming the page), zoom at the pointer.

E. The two window capture-phase wheel handlers (the Generator scroll switch's and the subgroup-stepping one) each get, right after their existing svg.ring-svg line, an early return for a target inside .dhc-svg with a one-line comment (the time cylinder zooms on the wheel itself). Vacuity: run the probe's wheel check once before adding these two lines and confirm it FAILS (the wheel steps the subgroup or swallows the event), then add them.

F. Probe: copy the krz probe to .planning/quick/261104-myl-cyclic-groups-dh-time-cylinder-resizable/dhc-nav-probe.mjs (untracked artifact, never staged), keep every existing check, same --slices / --cyls / --shots arguments, and add a new block right after the existing 'reopens' check: a helper reading the first #dhc-svg .dhc-cap's cx, cy, rx, ry attributes as numbers; a mouseWheel helper (Input.dispatchMouseEvent type mouseWheel with x, y, deltaX 0, deltaY, modifiers); the drag helper taking optional button, buttons and modifiers. Checks: (1) baseline rects of #dhc-plot (P0), #dhc-svg (S0) and the cap's screen width (C0); (2) a grip drag on #dhc-grip by (-700, +400): plot width at least P0.w + 500 and height at least P0.h + 200, svg width at least 2 x S0.w and height at least 1.4 x S0.h, cap screen width at least 1.4 x C0, plot inside the viewport, and the head/legend font-size unchanged (computed font-size of .dhc-legend equal before and after); (3) a dblclick dispatched on #dhc-grip puts the plot back within 2 px of P0; (4) a mouseWheel deltaY -240 at the svg centre raises the cap's rx by over 10 percent while location.search and the data-gen of .subgroup-row.is-current stay the same, deltaY +240 lowers it again, a Ctrl mouseWheel (modifiers 2) also changes rx; (5) regression for non-free windows: a drag on #dh-grip by (-60, +60) leaves #dh-plot with a --plot-scale style property, then a dblclick on #dh-grip clears it. Then continue with the existing '#dh-close hides both' and mobile checks.
  </action>
  <verify>
    <automated>test "$(git rev-parse --abbrev-ref HEAD)" = dh-cylinder-frame-split && test "$(git rev-list --count dh-cylinder-base..HEAD)" = 2 && node -e "const fs=require('fs');const h=fs.readFileSync('Cyclic Groups/cyclic-groups.html','utf8');const re=/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g;let m,i=0;while((m=re.exec(h))){i++;new Function(m[1]);}console.log('parsed',i)" && node .planning/quick/261104-myl-cyclic-groups-dh-time-cylinder-resizable/dhc-nav-probe.mjs --slices 7 --cyls 2</automated>
  </verify>
  <done>On the frame-split working tree (nothing committed): the grip resizes the window freely to most of the desktop with the picture filling it and the text at its own size, the wheel and Ctrl wheel zoom the cylinder about the pointer without touching the subgroup or the address bar, the other plot windows' grips still scale as before, and the probe (all old checks plus the new block) passes with zero console errors.</done>
</task>

<task type="auto">
  <name>Task 2: Pan, keys, wider tilt, reset, corner buttons, fill toggle, hint and English strings</name>
  <files>Cyclic Groups/cyclic-groups.html, assets/i18n/cyclic-groups.js, .planning/quick/261104-myl-cyclic-groups-dh-time-cylinder-resizable/dhc-nav-probe.mjs</files>
  <action>
Same working tree and the same no-touch zones and rules as Task 1.

A. Pan: on pointerdown on dhcSvgEl, button 1 (middle) or button 0 with shiftKey starts a pan (preventDefault, so no autoscroll or paste), plain button 0 a turn as now; dhc.turning records the mode. While panning, pointermove adds the pointer's movement divided by dhcUser's s to panX and panY; the is-turning cursor class applies to both. Clamp panX to plus or minus dhc.w * zoom and panY to plus or minus DHC_H * zoom so the cylinder cannot be lost.

B. Tilt range: replace the literal 0.08 and 1.45 bounds (drag and Up/Down) with DHC_PITCH_MIN 0 and DHC_PITCH_MAX Math.PI / 2, a side view to looking straight down the time axis (where every slice lies on the ring). Nothing divides by sin or cos of the pitch; the probe checks for NaN at both ends.

C. Keys on the focused svg (each handled key preventDefault and stopPropagation; leave keys with Ctrl, Meta or Alt to the browser): Shift+arrows pan by 12 units (scaled by nothing; units are the picture's own); plain arrows turn and tilt as now; + or = zoom in by 1.25 and - or the minus sign (U+2212) zoom out by 1.25, both about the picture's centre (u = dhc.w/2 + panX, v = DHC_H/2 + panY); 0 or Home reset. stopPropagation keeps the document's + / - handler from also zooming the ring.

D. Reset: dhcReset sets yaw, pitch, zoom 1, panX 0, panY 0 (dblclick, Home, 0 and the reset button all use it).

E. Corner buttons (no new row: an overlay in the picture's top-right corner): inside div.dhc-view after the svg, div.dhc-nav holding three button.fs-win-btn elements, #dhc-zoom-out, #dhc-zoom-in and #dhc-reset, each with title and aria-label plus data-i18n-title / data-i18n-aria-label (cyclicGroups.ctxZoomOut, cyclicGroups.ctxZoomIn, cyclicGroups.dhCylReset; English fallback text in the attributes) and an inline 12x12 svg icon like #dhc-close's: a minus line, a plus, and a circular arrow (an open circle with an arrowhead). CSS: .dhc-nav position absolute, top 4px, right 4px, flex row, gap 3px; .dhc-nav > .fs-win-btn 20px square. Clicks: zoom 1.25 in or out about the centre, or dhcReset. Buttons are outside the svg, so they never start a turn, and plotWindow already ignores button targets for window moves.

F. Fill toggle (window-level, in the existing head row): button.fs-win-btn.lap-key-min#dhc-fill between h2#dhc-plot-title and #dhc-close, aria-pressed false, title / aria-label / data-i18n-title / data-i18n-aria-label for cyclicGroups.dhCylFill. syncDhcFill() follows syncPlotDockBtn's pattern: aria-pressed from dhc.filled, both data-i18n-* attributes and title / aria-label set to dhCylUnfill when filled else dhCylFill (title text via translate), and the icon rebuilt with svgIcon: four corner brackets pointing out when not filled, pointing in when filled. dhcFill(on): on = save the window's own state (dhc.unfilled = its inline width and height strings and a copy of dhcWin.at), then measure the room of its .fs-win-body (left b.left + 8, right workRight(body) - 8, top topRowsBottom(body) + 8, bottom plotFloor(body) - 8), dhcWin.size(right - left, bottom - top) and move it there with dhcWin.place(at.x + left - r.left, at.y + top - r.top) from a fresh boxOf; off = restore the saved size (dhcWin.size(null) when it had none) and place it at the saved at; set dhc.filled and call syncDhcFill. Wire: the button toggles; a window resize while filled refits (measure again without re-saving); a pointerdown on #dhc-grip while filled drops the filled state (filled false, unfilled null, syncDhcFill) so the grip carries on from the filled size; closeDhCyl unfills before hiding, so a reopen comes back at the window's own size; openDhCyl calls syncDhcFill. CSS: .fs-win-body.is-ring:has(> .dhc-plot:not([hidden])) > .dh-plot gets z-index 4, so the Diffie–Hellman window stays above its time cylinder however large the cylinder is.

G. i18n (English-only, per the user's English-first rule): in the en block after dhCylKeyLegend add dhCylFill 'Fill the Ring window', dhCylUnfill 'Back to its own size', dhCylReset 'Reset the view: turn, tilt, zoom and position'. Change the English dhCylHint to 'Time runs up the cylinder: each slice is the ring at one moment of the exchange. Drag to turn and tilt it, Shift+drag to move it, scroll to zoom, double-click to reset (keys: arrows, Shift+arrows, + and −, 0). The corner grip or the fill button makes the window larger.' and make the markup fallback text of p.dhc-hint identical. In the header comment, before ". Every other language shows the English value", add: and dhCylFill, dhCylUnfill and dhCylReset (the time cylinder window's head button filling the Ring window with it and back, and its picture's reset-view button; its zoom buttons reuse ctxZoomIn and ctxZoomOut). node --check the file.

H. Probe: extend the new block of dhc-nav-probe.mjs (before '#dh-close hides both'): #dhc-fill, #dhc-zoom-out, #dhc-zoom-in, #dhc-reset exist with non-empty titles; focus the svg and press 0, record the cap baseline (cx, cy, rx, ry); clicking #dhc-fill makes the plot at least 1200 x 600 at 1440x900 with aria-pressed true, and document.elementFromPoint at the centre of .dh-step lands inside #dh-plot; then click .dh-end and, with --shots, capture #dhc-plot as large-end.png at scale 1; clicking #dhc-fill again restores the earlier rect within 2 px with aria-pressed false; #dhc-zoom-in raises rx by about 1.25x and #dhc-zoom-out brings it back; key + raises rx and key - lowers it while #zoom-slider's value is unchanged; a vertical drag (0, +80) changes ry / rx; 25 ArrowUp presses give ry / rx at most 0.02 and 25 ArrowDown presses at least 0.99, with no NaN in #dhc-svg's outerHTML at either end; a Shift drag (modifiers 8) by (+50, 0) moves cx by more than 10 with rx unchanged and #dhc-plot's style.translate unchanged; a middle-button drag moves cx again; Shift+ArrowRight moves cx; key 0 restores the baseline cx, cy, rx, ry within 0.01; after another change, a click on #dhc-reset and a dblclick dispatched on #dhc-svg each restore it too.
  </action>
  <verify>
    <automated>node -e "const fs=require('fs');const h=fs.readFileSync('Cyclic Groups/cyclic-groups.html','utf8');const re=/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g;let m,i=0;while((m=re.exec(h))){i++;new Function(m[1]);}console.log('parsed',i)" && node --check assets/i18n/cyclic-groups.js && node .planning/quick/261104-myl-cyclic-groups-dh-time-cylinder-resizable/dhc-nav-probe.mjs --slices 7 --cyls 2 && node .planning/phases/06-multi-language-support/i18n-check.js --coverage --all 2>&1 | grep -q 'coverage: 91 finding' && node .planning/phases/06-multi-language-support/i18n-check.js --literals-markup --all 2>&1 | grep -q 'literals-markup: 4 finding' && node .planning/phases/06-multi-language-support/i18n-check.js --literals-js --all 2>&1 | grep -q 'literals-js: 131 finding'</automated>
  </verify>
  <done>Still uncommitted on frame-split: pan, keys, the widened tilt, reset, the three corner buttons and the fill toggle all work as the probe asserts, the DH window stays on top of a filled cylinder, the hint names the controls, the three new keys exist only in the en block and are named in the header comment, and the i18n gates stay at 91 / 4 / 131 (if a literals count rises, restructure the new code, never the gate).</done>
</task>

<task type="auto">
  <name>Task 3: One commit on dh-cylinder-base, cherry-picked onto the four variants, swept, back on frame-split</name>
  <files>Cyclic Groups/cyclic-groups.html, assets/i18n/cyclic-groups.js</files>
  <precondition>Tasks 1 and 2 pass on dh-cylinder-frame-split's working tree and the only tracked modifications are the two named files.</precondition>
  <action>
Git stays quiet (-q on checkout; cherry-pick output to /dev/null); never git stash (stash@{0} is the user's), never -A, never rebase or amend existing commits; leave every untracked file alone. Scratch files (patch, screenshots) go in the executor's scratchpad, never the repo.

1. Move the change: write `git diff -- "Cyclic Groups/cyclic-groups.html" assets/i18n/cyclic-groups.js` to a patch in the scratchpad; confirm no removed or added line in it contains "function dhcTimeline" or "function dhcLayout"; restore the two files on frame-split with git checkout -q -- (explicit paths); git checkout -q dh-cylinder-base; git apply --3way the patch (it must apply cleanly: only the variants' inserted functions differ, and the change keeps clear of them); run the inline-script parse and node --check; stage the two files by explicit path and commit in the repo style, for example: feat(cyclic-groups): the time cylinder's window resizes freely up to the Ring window's room, a head button filling it, its picture zooming about the pointer, tilting from side view to top view, moving under a Shift or middle drag and resetting, by mouse, keys and corner buttons. End the message with the two trailer lines Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com> and Claude-Session: https://claude.ai/code/session_019tLocw1DRvHAb1sEExfCcB. Record the SHA.

2. Carry it: for dh-cylinder-hop-shared, dh-cylinder-hop-split, dh-cylinder-frame-shared, dh-cylinder-frame-split in that order: git checkout -q BRANCH, git cherry-pick SHA >/dev/null (no -x, so the trailers stay last). A conflict is not expected; if one appears, resolve keeping both the variant's functions and the new code and finish with git cherry-pick --continue; if a variant needs its own adjustment, make it a small separate follow-up commit on that branch and say so in the SUMMARY.

3. Sweep each variant branch (git checkout -q in turn): the inline-script parse and node --check assets/i18n/cyclic-groups.js; the probe with that branch's numbers (hop-shared --slices 32 --cyls 1, hop-split --slices 32 --cyls 2, frame-shared --slices 7 --cyls 1, frame-split --slices 7 --cyls 2) plus --shots pointing at a per-branch scratchpad folder, then Read large-end.png for a sanity look (cylinder filling the window, Step controls of the DH window visible above it); the three i18n gates at 91 / 4 / 131; exactly one function dhcTimeline and one function dhcLayout in the page; git diff --stat BRANCH~1 BRANCH names only the two files; the branch tip's patch-id equals the base commit's. Finish on dh-cylinder-frame-split (the user's branch) with no tracked changes, and confirm main's code is untouched (git diff --quiet 22cd9e4 main -- "Cyclic Groups" assets).

4. Write .planning/quick/261104-myl-cyclic-groups-dh-time-cylinder-resizable/261104-myl-SUMMARY.md (uncommitted: the orchestrator commits planning docs) with the base SHA and the four cherry-pick SHAs, the probe results and the large-window rects per branch, the gate counts, the controls the user now has (grip, fill button, drag, Shift / middle drag, wheel and Ctrl wheel, corner buttons, keys, double click) and how to try it: git checkout -q BRANCH, open Cyclic Groups/cyclic-groups.html?mode=multiplicative&n=23&gen=5&dh=5,6,15, press Time cylinder in the Diffie–Hellman window.
  </action>
  <verify>
    <automated>BP=$(git show dh-cylinder-base) && BID=$(printf '%s\n' "$BP" | git patch-id --stable) && BID=${BID%% *} && test -n "$BID" && for b in dh-cylinder-hop-shared dh-cylinder-hop-split dh-cylinder-frame-shared dh-cylinder-frame-split; do test "$(git rev-list --count dh-cylinder-base..$b)" = 3 || exit 1; TP=$(git show "$b") || exit 1; TID=$(printf '%s\n' "$TP" | git patch-id --stable) || exit 1; test "${TID%% *}" = "$BID" || exit 1; S=$(git show "$b:Cyclic Groups/cyclic-groups.html") || exit 1; test "$(printf '%s\n' "$S" | grep -c 'function dhcTimeline')" = 1 || exit 1; test "$(printf '%s\n' "$S" | grep -c 'function dhcLayout')" = 1 || exit 1; done && test "$(git rev-list --count 22cd9e4..dh-cylinder-base)" = 2 && git diff --quiet 22cd9e4 main -- "Cyclic Groups" assets && test "$(git rev-parse --abbrev-ref HEAD)" = dh-cylinder-frame-split && git diff --quiet HEAD && D=$(git diff dh-cylinder-base~1 dh-cylinder-base) && test "$(printf '%s\n' "$D" | grep '^+' | grep -c 'innerHTML')" = 0 && test "$(printf '%s\n' "$D" | grep '^+' | grep -cE '#[0-9a-fA-F]{3,8}\b|rgba?\(|hsla?\(')" = 0 && node .planning/quick/261104-myl-cyclic-groups-dh-time-cylinder-resizable/dhc-nav-probe.mjs --slices 7 --cyls 2</automated>
  </verify>
  <done>dh-cylinder-base is 22cd9e4 + 2 (9e5ad75 and the new commit); each variant is base + 3, its tip the cherry-picked commit with the base commit's patch-id; every variant passes the probe with its own counts and zero console errors and the i18n gates at 91 / 4 / 131, with a large end-state screenshot per branch in the scratchpad; main's code untouched; dh-cylinder-frame-split checked out with no tracked changes; the SUMMARY written.</done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| pointer / wheel / keyboard → cylinder | input only changes clamped view numbers (yaw, pitch, zoom, pan) and the window's own size |
| URL query → page | unchanged: dh=g,a,b is validated by the existing dhFromQuery/openDh before any cylinder exists |

## STRIDE Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation Plan |
|-----------|----------|-----------|----------|-------------|-----------------|
| T-myl-01 | Tampering | new button titles, aria-labels, hint | low | mitigate | strings via translate into setAttribute / textContent and static data-i18n attributes; Task 3's gate greps the base commit's added lines for HTML-string assignment and colour literals |
| T-myl-02 | Denial of Service | redraws during wheel, pan and resize | low | mitigate | zoom clamped 0.4..8, pan clamped to the picture's extent, pitch 0..pi/2; redraws stay rAF-coalesced and signature-skipped; window resizing needs no redraw (the viewBox fits itself) |
| T-myl-03 | Tampering | capture-phase wheel handlers | low | mitigate | the .dhc-svg exemption is an early return limited to targets inside the cylinder's svg; the probe checks the subgroup selection and address bar stay unchanged |
| T-myl-SC | Tampering | npm/pip/cargo installs | low | accept | no package installs: the probe uses Node's built-in WebSocket and the system google-chrome |
</threat_model>

<verification>
- On each variant branch: inline scripts parse; assets/i18n/cyclic-groups.js passes node --check; dhc-nav-probe.mjs passes with that branch's counts (32/1, 32/2, 7/1, 7/2) and zero console errors, desktop and ?mobile=1.
- i18n-check --coverage / --literals-markup / --literals-js --all stay at 91 / 4 / 131.
- Branch shape: base = 22cd9e4 + 2; each variant = base + 3 with the base commit's patch-id at its tip; main's code untouched; dh-cylinder-frame-split checked out at the end.
</verification>

<success_criteria>
On any of the four branches the user opens (Z/23Z)* with g = 5, a = 6, b = 15, presses Time cylinder, and can drag the window's corner (or press its fill button) to make the cylinder fill most of the desktop with the DH window's controls still on top, then turn, tilt from side view to top view, zoom about the pointer, move the cylinder and reset the view by mouse, keyboard or the corner buttons.
</success_criteria>

<output>
Create `.planning/quick/261104-myl-cyclic-groups-dh-time-cylinder-resizable/261104-myl-SUMMARY.md` when done (uncommitted; the orchestrator commits planning docs).
</output>
