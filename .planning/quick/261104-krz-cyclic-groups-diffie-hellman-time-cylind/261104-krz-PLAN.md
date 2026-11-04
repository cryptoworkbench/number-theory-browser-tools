---
phase: quick-261104-krz
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - Cyclic Groups/cyclic-groups.html
  - assets/i18n/cyclic-groups.js
autonomous: true
requirements: [QUICK-261104-krz]

estimate:
  tokens: 170000
  raw_tokens: 170000
  tasks: 3
  confidence: low

must_haves:
  truths:
    - "The Diffie–Hellman window has a Time cylinder button that opens (and closes) a separate movable window, placed clear of the DH window and the other ring windows, showing a see-through cylinder: time runs up the axis and each slice is the ring at one moment of the exchange, its beads in the ring's own arrangement"
    - "Reset, Back, Play, Step, Instant and typing a secret in the DH window update the cylinder: only slices up to the current step are drawn, the current step's slice(s) highlighted, newly revealed pieces fading in hop by hop"
    - "Dragging inside the cylinder's picture (or the arrow keys on it) turns the cylinder without moving the window; dragging the window's head moves the window"
    - "Four branches off main each hold exactly one variant: dh-cylinder-hop-shared (32 slices, 1 cylinder for (Z/23Z)*, g=5, a=6, b=15), dh-cylinder-hop-split (32 slices, 2 cylinders), dh-cylinder-frame-shared (7 slices, 1 cylinder), dh-cylinder-frame-split (7 slices, 2 cylinders)"
    - "Each branch loads ?mode=multiplicative&n=23&gen=5&dh=5,6,15 with no console error and main is left at 22cd9e4 untouched"
  artifacts:
    - path: "Cyclic Groups/cyclic-groups.html"
      provides: "#dhc-plot window markup, .dhc-* CSS, the Diffie–Hellman time cylinder JS section (shell, renderer, drag, sync) plus one dhcTimeline and one dhcLayout per variant branch"
      contains: "Diffie–Hellman time cylinder"
    - path: "assets/i18n/cyclic-groups.js"
      provides: "English-only dhCyl* keys, listed in the header comment"
      contains: "dhCylTitle"
  key_links:
    - from: "drawDhRing"
      to: "syncDhCyl(G, place, m)"
      via: "last line of drawDhRing, so the cylinder uses the ring's exact place map on every ring draw"
      pattern: "syncDhCyl\\(G, place, m\\)"
    - from: "buildDhPlot .dh-ctl"
      to: "toggleDhCyl"
      via: "btn('dh-cyl', toggleDhCyl), aria-pressed kept by syncDhCtl"
      pattern: "dh-cyl"
    - from: "closeDh / drawDhPlot shut path"
      to: "closeDhCyl"
      via: "the cylinder closes whenever the exchange closes"
      pattern: "closeDhCyl\\(\\)"
    - from: "ringWins / FS_PANELS / tellPlotsOver / plotsOverMo"
      to: "#dhc-plot"
      via: "the new window joins every window list the DH window is in"
      pattern: "dhc-plot"
    - from: "drawDhCyl"
      to: "dhcTimeline(G) and dhcLayout(tl)"
      via: "the two per-variant functions behind the base's anchor sections"
      pattern: "dhcTimeline\\(|dhcLayout\\("
---

<objective>
Add a Diffie–Hellman time cylinder window to Cyclic Groups (the user's idea: the exchange's moments kept as 2D ring slices stacked in a see-through 3D cylinder), and ship it as four comparable variants on four git branches off main: (slice per hop | slice per frame) x (one shared cylinder | two cylinders, Alice's and Bob's).

Purpose: the ring shows one moment of the exchange at a time; the cylinder keeps every moment, so a learner sees the whole history at once and can compare four ways of laying it out.
Output: branch dh-cylinder-base (one common commit) and branches dh-cylinder-hop-shared, dh-cylinder-hop-split, dh-cylinder-frame-shared, dh-cylinder-frame-split, each the base plus exactly its two variant commits; main untouched; a SUMMARY in this quick directory.
</objective>

<execution_context>
@~/.claude/gsd-core/workflows/execute-plan.md
@~/.claude/gsd-core/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@CLAUDE.md
@.claude/CLAUDE.md

Code to read (targeted ranges only; the page is 22k lines):
- Cyclic Groups/cyclic-groups.html lines 12939-13254: the Diffie–Hellman section (dh state, DH_LAST=6, openDh, closeDh, setDhStep, drawDhPlot, buildDhPlot's btn helper and .dh-ctl row, syncDhPlot, syncDhCtl, drawDhRing, dhReach, dhValues, scalarOf usage). The new section goes right after isoTakeDh, before the "the Cayley table" section marker.
- Same file lines 14033-14160: plotWindow (its grip() excludes targets inside .curve-plot-svg, so a drag in such an svg never moves the window), unstack, tellPlotsOver and the plotsOverMo observer list.
- Same file line 11119 ringWins(), line 6866 FS_PANELS 'ring' ids (contains 'dh-plot'), lines 3023-3026 the #dh-plot section markup (copy its head/close-button/grip pattern), lines 1024-1027 and 1078-1104 the DH CSS (palette roles: Alice --role-alt, Bob --role-input, key --role-result and --role-result-soft, public/g --text), lines 1132-1133 .curve-plot-svg CSS.
- Same file lines 5038-5043 (drawRing: place[a] = i, angle dirSign()*360*i/m clockwise from the top via polar) and line 5155 (the drawDhRing call).
- Helpers already in scope: $, clamp, randomInt, svgEl, polar, num, translate, translateInto, getLang, lap(G, gen, len, start), scalarOf(G, a, k), dirSign(), ptX(e)/ptY(e), boxOf, IS_MOBILE, drawn, redrawRing.
- assets/i18n/cyclic-groups.js: header comment lines 1-225 (the English-first key list ends "...skipLog and skipLogTip (the generator control's Skip logarithm use checkbox). Every other language shows the English value through NT.i18n's fallback meanwhile."), the en block starts line 683, the dh* keys at lines 1243-1261 (dhAlice, dhBob, dhClose already exist and are reused).

Baseline gate counts on main 22cd9e4 (re-measure before the first edit): i18n-check --coverage --all 91 findings, --literals-markup --all 4, --literals-js --all 131.
</context>

<tasks>

<task type="tracer">
  <name>Task 1: Base window shell on dh-cylinder-base, then variant 1 (dh-cylinder-hop-shared) end to end</name>
  <files>Cyclic Groups/cyclic-groups.html, assets/i18n/cyclic-groups.js, .planning/quick/261104-krz-cyclic-groups-diffie-hellman-time-cylind/dhc-probe.mjs</files>
  <action>
Git: run i18n-check --coverage/--literals-markup/--literals-js with --all on main and note the three counts. Then `git checkout -q main` and `git checkout -q -b dh-cylinder-base` (the user asked for branches here, overriding the usual work-on-main rule). Stage only the two named files with explicit paths, never -A (the tree has many untracked files; leave them alone). Every commit message is in the repo style, feat(cyclic-groups): ..., and ends with the two trailer lines Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com> and Claude-Session: https://claude.ai/code/session_019tLocw1DRvHAb1sEExfCcB.

A. BASE COMMIT (on dh-cylinder-base). It holds everything common to the four variants; it calls dhcTimeline(G) and dhcLayout(tl) but defines neither (each variant supplies them), so on this branch alone the page loads clean but the cylinder cannot be drawn: say so in the commit body.

A1 Markup: right after the #dh-plot section add section.curve-plot.dhc-plot#dhc-plot (aria-labelledby dhc-plot-title, hidden) copying #dh-plot's pattern: a .lap-key-head with h2#dhc-plot-title (filled by script) and a close button #dhc-close identical to #dh-close (same X svg, data-i18n-title/aria-label cyclicGroups.dhClose); then svg.curve-plot-svg.dhc-svg#dhc-svg (viewBox 0 0 300 360, role img, tabindex 0); then p.dhc-legend with three items, each a span.dhc-sw.is-alice / is-bob / is-key swatch followed by a span bound with data-i18n cyclicGroups.dhAlice, cyclicGroups.dhBob, cyclicGroups.dhCylKeyLegend (English fallback text inside); then p.dh-note.dhc-hint with data-i18n cyclicGroups.dhCylHint; then div.curve-grip#dhc-grip with the same aria-hidden/title/data-i18n-title as #dh-grip.

A2 CSS (palette tokens via var() only, no literal colour of any kind; local custom properties only built from var()): next to the DH rules add :root.is-mobile .dhc-plot display none important; .fs-win-body.is-ring > .dhc-plot width min(340px, 44%); :root:not(.is-mobile) .dhc-svg cursor grab plus touch-action none (that selector is needed to beat the .curve-plot-svg cursor rule), .dhc-svg.is-turning cursor grabbing, .dhc-svg:focus-visible outline 2px solid var(--accent); .dhc-wall and .dhc-cap (stroke var(--panel-border), no fill); .dhc-rim (no fill, stroke var(--text-dim), thin, opacity about .5), .dhc-rim.is-back (dashed, opacity about .22), .dhc-rim.is-now (stroke var(--text), opacity 1, thicker); .dhc-bead (fill var(--text-dim)), .dhc-bead.is-far (opacity .3); .dhc-mark.is-alice/.is-bob/.is-key filled with --role-alt/--role-input/--role-result, extra halos as unfilled rings in the same colour, .dhc-mark.is-g (no fill, stroke var(--text), dashed); .dhc-thread (no fill, round caps, width about 2.2) coloured per is-alice/is-bob, .dhc-thread.is-now wider; .dhc-line (thin) coloured per is-alice/is-bob/is-key/is-pub (pub = var(--text)), .dhc-line.is-link dashed; .dhc-dot (hop dots) per who colour; .dhc-tag (fill var(--text-dim), small sans font, text-anchor end); every .is-back mark/thread/line/bead at reduced opacity; .dhc-legend (flex row, wrap, centred, small, var(--text-dim)) and .dhc-sw (inline swatch, border-top 3px solid var(--sw), with --sw set to the three roles per is-*); @keyframes dhc-in from opacity 0, .dhc-svg .is-fresh animation dhc-in .35s ease-out both, and inside @media (prefers-reduced-motion: reduce) no animation. No :root[dir="rtl"] change is needed (assets/site.css keeps SVG left to right).

A3 i18n (per D-i18n user decision: en block only): after dhNew in the en block add dhCylButton 'Time cylinder', dhCylButtonTitle 'Show the whole exchange as slices of the ring stacked in a see-through cylinder', dhCylTitle 'Diffie–Hellman over time in {group}', dhCylAria 'The Diffie–Hellman exchange in {group} as ring slices stacked up a cylinder', dhCylHint 'Time runs up the cylinder: each slice is the ring at one moment of the exchange. Drag the picture, or use the arrow keys, to turn it.', dhCylKeyLegend 'Shared key K'. In the header comment, extend the English-first list right after the skipLog/skipLogTip parenthetical with: and dhCylButton, dhCylButtonTitle, dhCylTitle, dhCylAria, dhCylHint and dhCylKeyLegend (the Diffie–Hellman window's Time cylinder button and the time cylinder window it opens; its legend reuses dhAlice and dhBob). Run node --check on the file.

A4 JS, a new section right after isoTakeDh, in five sub-sections each opened by the project's section-marker comment style, in this order:
(1) Marker "Diffie–Hellman time cylinder", a short comment saying what it is, then: dhcPlotEl, dhcSvgEl, dhcWin = plotWindow(dhcPlotEl, $('dhc-grip')); constants DHC_H 360, DHC_L 230 (axis length), DHC_YAW -0.6, DHC_PITCH 0.38 (radians), DHC_RIM_CAP 120, DHC_BEAD_CAP 160; state dhc = { open false, yaw, pitch, last null (G, place, m from the latest ring draw), built '' (render signature), shown null (exchange id + step of the last render), raf 0, turning null }. dhcAt(cyl, R, W, pos, z, m): alpha = dirSign()*2*PI*pos/m + dhc.yaw (pos may be fractional), sx = W/2 + cyl.cx + R sin alpha, sy = DHC_H/2 - z cos(pitch) - R cos(alpha) sin(pitch), front = -R cos alpha (y' toward the viewer), depth = front cos(pitch) + z sin(pitch); so at pitch 90 degrees the slice reads exactly like the ring (position 0 at the top, clockwise for dirSign 1). openDhCyl(): if IS_MOBILE or no dh, return; set open, clear built, unhide, call redrawRing() (which reaches syncDhCyl and draws it), then dhcWin.place(dhcWin.at.x, dhcWin.at.y) and unstack(dhcPlotEl, dhcWin, w) against every ringWins() window but itself, exactly as openDh does for its window; syncDhCtl(). closeDhCyl(): open false, hidden true, cancel raf, syncDhCtl() when dhParts exist; idempotent. toggleDhCyl() switches between them.
(2) Marker "the time cylinder's slices" followed by a comment of at least four lines stating the dhcTimeline(G) contract (the variant defines the function right after this comment): it returns { slices, marks, threads, lines, swap }. slices: bottom to top, each { step (the DH step 0..6 from which it shows), full (draw every bead), tag ('' or the step numeral(s) printed beside it) }, at least two slices. marks: { slice, x (element), who alice|bob|key, owner alice|bob|pub, step, hop }. threads: { who, owner, pts: [{ slice, x, step, hop }] }, a person's state over time, the piece into pts[k] shown from pts[k].step. lines: { slice, from, to, who, owner, step, hop }, chords lying in one slice's plane. swap: { slice, A, B, step }. owner pub means drawn in every cylinder; hop orders a step's pieces for the staggered fade-in.
(3) Marker "drawing the time cylinder": drawDhCyl() renders from dhc.last into dhcSvgEl (replaceChildren, then svgEl only; text via textContent). tl = dhcTimeline(G), lay = dhcLayout(tl); viewBox 0 0 lay.w DHC_H; n = slices.length, dz = DHC_L/(n-1) (so any number of hop slices squashes to fit the fixed axis), slice i at z = -DHC_L/2 + i*dz; visible = slice.step <= dh.step; a mark, line or thread piece shows when its step <= dh.step. Positions come from place (the ring's own map) with m from the ring. now-slices: visible slices holding a mark, line or thread point whose step equals dh.step; if none, the topmost visible slice; their rims get is-now, and thread pieces/lines/marks of the current step get is-now. For each cylinder of lay.cyls (filter every item by cyl.owners including item.owner): the two walls (vertical lines at sx = W/2 + cx +- R, spanning the whole axis) and the bottom and top caps (full ellipses) always; each visible slice's rim as two half-ellipse arcs (centre W/2+cx, DHC_H/2 - z cos(pitch), rx R, ry R sin(pitch); upper half is-back, lower half is-front; when more than DHC_RIM_CAP slices are visible, rims only on full or tagged slices, now-slices and every k-th slice with k = ceil(visible/DHC_RIM_CAP)); on visible full slices every bead as a small dot (radius clamp(1.3, 3.4, 1.15*R*PI/m)) unless m > DHC_BEAD_CAP, is-far for beads dhReach(G) leaves out, and a dashed is-g ring at dh.g; marks as dots (radius about 4.2), a second or third mark on the same bead and slice as halo rings 2.6 units further out each, like drawDhRing's halos; lines as straight segments between the two projected beads; thread pieces: from position p to q the shorter way round (d = ((q - p) mod m + m) mod m, minus m when over m/2), z linear, sampled max(4, ceil(|d|*360/m/15)) steps, a straight rise where p equals q, split into separate paths wherever the sign of front changes; a small .dhc-dot at each thread point that moved from the previous one, only while visible slices <= DHC_RIM_CAP; lay.links as dashed .dhc-line.is-link straight segments between their two projected points (each end on its own cylinder); tags (.dhc-tag text) 8 units left of the leftmost cylinder's rim at the slice's centre height. Every primitive carries a depth (rims: z sin(pitch) -+ R cos(pitch) for back/front, others their own or midpoint depth) and is-back when its front value is negative; sort ascending by depth and append. Fresh fade-in: when dhc.shown names the same exchange (G.key, g, a, b) and dh.step equals its step + 1, give every piece whose step equals dh.step the class is-fresh and an animation-delay of hop * stagger ms, stagger = min(70, 1100/(largest such hop + 1)); a render for any other reason (turn, secrets, language) has no fresh pieces. Then set dhc.shown. Set the title h2 via translate('cyclicGroups.dhCylTitle', { group: G.label }) into textContent and the svg aria-label via setAttribute with dhCylAria.
(4) Marker "the time cylinder's cylinders" followed by a comment of at least four lines stating the dhcLayout(tl) contract (the variant defines it right after): returns { w (viewBox width), R (radius), cyls: [{ cx (axis offset from the viewBox centre), owners }], links: [{ from: { cyl, slice, x }, to: { cyl, slice, x }, who, step }] }.
(5) Marker "turning the time cylinder": syncDhCyl(G, place, m): store dhc.last; return unless dhc.open; signature = G.key, dh.g, dh.a, dh.b, dh.step, m, the place positions of G.els in order, dirSign(), yaw, pitch, getLang(); redraw only when it differs from dhc.built. Pointer drag on dhcSvgEl (button 0, not IS_MOBILE): setPointerCapture, class is-turning, yaw += dx*0.012, pitch = clamp(pitch + dy*0.008, 0.08, 1.45) using ptX/ptY deltas, redraw coalesced through requestAnimationFrame; dblclick on the svg resets yaw/pitch; keydown on the svg: ArrowLeft/ArrowRight yaw -+0.15, ArrowUp/ArrowDown pitch -+0.1 (clamped), Home resets, each with preventDefault and stopPropagation (other keys untouched). $('dhc-close') click closes it.

A5 Hooks into existing code: last line of drawDhRing calls syncDhCyl(G, place, m); closeDh calls closeDhCyl(); drawDhPlot's shut path becomes: when !dh, closeDhCyl() and return; buildDhPlot adds parts.cyl = btn('dh-cyl', toggleDhCyl) after renew, text from cyclicGroups.dhCylButton and title attribute from dhCylButtonTitle (the minimal entry point, inside the DH window's own control row, per the user's "opened from the DH window"); syncDhCtl sets its aria-pressed from dhc.open; ringWins() gains $('dhc-plot'); FS_PANELS 'ring' ids gain 'dhc-plot' right after 'dh-plot'; tellPlotsOver's list and the plotsOverMo observer list gain dhcPlotEl. Commit on dh-cylinder-base.

B. HOP SLICES COMMIT: `git checkout -q -b dh-cylinder-hop-shared`. Insert function dhcTimeline(G) (with its own short comment) immediately after the slices contract comment and nothing else anywhere. With v = dhValues(G), e = G.identity, a = dh.a, b = dh.b, M = max(a, b), S = M + 1 (the swap slice), T = 2M + 1 (top), n = 2M + 2 slices; Alice and Bob walk concurrently, side by side in time. Slices: 0 (step 0, full, tag '0'); t = 1..M (step 2 when t <= a else 3, not full; tag '2' where t = a, '3' where t = b, both numerals in one tag string when a = b); S (step 4, full, tag '4'); S+t for t = 1..M (step 5 when t <= a else 6; tag '5' where t = a, '6' where t = b; T is full). Marks: slice 0 e for alice (owner alice) and e for bob (owner bob), step 0; slice a v.A (alice/alice, step 2, hop a); slice b v.B (bob/bob, step 3, hop b); slice S v.A (alice/pub) and v.B (bob/pub), step 4; slice S+a v.K (alice/alice, step 5, hop a); slice T v.K (key/pub, step 6). Threads (four, built with lap()): Alice walk one: (t, g^t, step 2, hop t) for t = 0..a, then holds (t, v.A, step 3, hop t) for t = a+1..M, then (S, v.A, step 4); Bob walk one: (t, g^t, step 3, hop t) for t = 0..b, holds (t, v.B, step 3, hop t) for t = b+1..M, then (S, v.B, step 4); Alice walk two from the identity on the swap slice: (S, e), (S+t, B^t, step 5, hop t) for t = 1..a, holds (S+t, v.K, step 6, hop t) for t = a+1..M; Bob walk two: (S, e), (S+t, A^t, step 6, hop t) for t = 1..b, holds (S+t, v.K, step 6, hop t) for t = b+1..M. lines: none. swap: { slice S, A v.A, B v.B, step 4 }. Commit: one slice per hop, the walks rising side by side, squashed to fit.

C. SHARED CYLINDER COMMIT (still on dh-cylinder-hop-shared): insert function dhcLayout(tl) immediately after the cylinders contract comment and nothing else: { w 300, R 100, cyls [{ cx 0, owners alice, bob, pub }], links [{ from { cyl 0, slice tl.swap.slice, x tl.swap.A }, to { cyl 0, same slice, x tl.swap.B }, who 'pub', step tl.swap.step }] }. Commit: one cylinder Alice and Bob share, their threads meeting on K.

D. PROBE: write .planning/quick/261104-krz-cyclic-groups-diffie-hellman-time-cylind/dhc-probe.mjs (verification artifact, untracked, never staged): Node 22 with its global WebSocket and google-chrome (--headless=new, --remote-debugging-port=0, a mkdtemp profile under os.tmpdir(), window 1440x900; read the port from the profile's DevToolsActivePort). Enable Runtime and Log before navigating to the working tree's page by pathToFileURL plus ?mode=multiplicative&n=23&gen=5&dh=5,6,15; collect Runtime.exceptionThrown and console errors; wait for load plus about 2.5 s; if the intro hides the desktop, click #cg-enter (tolerate only a fullscreen-request rejection). Arguments --slices N --cyls C. Assert, printing PASS/FAIL lines and exiting non-zero on any FAIL: #dh-plot visible and .dh-ctl .dh-cyl present with text; clicking it unhides #dhc-plot, its rect does not overlap #dh-plot's; .dhc-wall count is 2*C; .dhc-rim.is-front count is C at step 0; after clicking .dh-end it is C*N and every cylinder has a .dhc-mark.is-key; a real mouse drag (Input.dispatchMouseEvent) across the svg changes the svg's outerHTML but not #dhc-plot's style.translate, a drag on #dhc-plot .lap-key-head changes style.translate; clicking .dh-cyl again hides #dhc-plot, clicking #dh-close hides both; zero errors. Also load the same URL plus &mobile=1 and assert zero errors and #dhc-plot hidden.
  </action>
  <verify>
    <automated>test "$(git rev-parse --abbrev-ref HEAD)" = dh-cylinder-hop-shared && test "$(git rev-list --count main..dh-cylinder-hop-shared)" = 3 && test "$(git rev-list --count main..dh-cylinder-base)" = 1 && node -e "const fs=require('fs');const h=fs.readFileSync('Cyclic Groups/cyclic-groups.html','utf8');const re=/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g;let m,i=0;while((m=re.exec(h))){i++;new Function(m[1]);}console.log('parsed',i)" && node --check assets/i18n/cyclic-groups.js && node .planning/quick/261104-krz-cyclic-groups-diffie-hellman-time-cylind/dhc-probe.mjs --slices 32 --cyls 1</automated>
  </verify>
  <done>dh-cylinder-base is main plus one commit; dh-cylinder-hop-shared is base plus the hop-slices and shared-cylinder commits; the probe passes with 32 slices and 1 cylinder and zero console errors; git diff main dh-cylinder-base added lines contain no colour literal and no HTML-string assignment; the six dhCyl* keys exist only in the en block and are named in the header comment; i18n --coverage stays at the main count (only LANG-KEYSET missing lists grow), --literals-markup and --literals-js do not exceed their main counts (restructure new code, never the gate, if they rise).</done>
</task>

<task type="auto">
  <name>Task 2: Variant 3 (dh-cylinder-frame-shared): one slice per frame, shared cylinder cherry-picked</name>
  <files>Cyclic Groups/cyclic-groups.html</files>
  <action>
`git checkout -q -b dh-cylinder-frame-shared dh-cylinder-base`. Insert function dhcTimeline(G) (own short comment) immediately after the slices contract comment, nothing else; commit it (one slice per frame, the exchange's seven steps). With v = dhValues(G), e = G.identity: slices s = 0..6, slice s has step s, full true, tag String(s). States per slice: Alice [e, e, A, A, A, K, K], Bob [e, e, e, B, B, B, K]. Marks (step = the slice's s, hop 0): slices 0-1 e (alice/alice) and e (bob/bob); slice 2 v.A (alice/alice) and e (bob/bob); slice 3 v.A (alice/alice) and v.B (bob/bob); slice 4 v.A (alice/pub) and v.B (bob/pub); slice 5 v.K (alice/alice) and v.B (bob/bob); slice 6 v.K (key/pub). Threads: Alice's pts are her state on slices 0..6 with step = slice index (owner alice), Bob's likewise (owner bob). Lines, the walk each step performs drawn in its own slice as chords between consecutive beads of lap(G, step, hops + 1) with hops = min(secret, order of the step element), hop k on the k-th chord: slice 2 by dh.g, a hops (alice/alice, step 2); slice 3 by dh.g, b hops (bob/bob, step 3); slice 5 by v.B, a hops (alice/alice, step 5); slice 6 by v.A, b hops (bob/bob, step 6). swap: { slice 4, A v.A, B v.B, step 4 }.
Then `git cherry-pick dh-cylinder-hop-shared >/dev/null` (the shared-cylinder commit; no -x, so the message keeps its trailers last). The two insertions sit in different anchored sub-sections with the renderer between them, so it should apply cleanly; if it conflicts, keep both sides' own functions and finish with git cherry-pick --continue. Run the probe with --slices 7 --cyls 1.
  </action>
  <verify>
    <automated>test "$(git rev-parse --abbrev-ref HEAD)" = dh-cylinder-frame-shared && test "$(git rev-list --count dh-cylinder-base..dh-cylinder-frame-shared)" = 2 && node -e "const fs=require('fs');const h=fs.readFileSync('Cyclic Groups/cyclic-groups.html','utf8');const re=/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g;let m,i=0;while((m=re.exec(h))){i++;new Function(m[1]);}console.log('parsed',i)" && test "$(grep -c 'function dhcTimeline' 'Cyclic Groups/cyclic-groups.html')" = 1 && test "$(grep -c 'function dhcLayout' 'Cyclic Groups/cyclic-groups.html')" = 1 && node .planning/quick/261104-krz-cyclic-groups-diffie-hellman-time-cylind/dhc-probe.mjs --slices 7 --cyls 1</automated>
  </verify>
  <done>dh-cylinder-frame-shared is base plus the frame-slices commit plus the cherry-picked shared-cylinder commit; it has exactly one dhcTimeline (the frame one) and one dhcLayout; the probe passes with 7 slices and 1 cylinder.</done>
</task>

<task type="auto">
  <name>Task 3: Variants 2 and 4 (two cylinders), four-branch sweep, back to main</name>
  <files>Cyclic Groups/cyclic-groups.html</files>
  <action>
Variant 2: `git checkout -q -b dh-cylinder-hop-split dh-cylinder-base`, `git cherry-pick dh-cylinder-hop-shared~1 >/dev/null` (the hop-slices commit). Insert function dhcLayout(tl) (own short comment) immediately after the cylinders contract comment, nothing else, and commit (two cylinders side by side, Alice's and Bob's, the swap bridging them): { w 400, R 78, cyls [{ cx -94, owners alice, pub }, { cx 94, owners bob, pub }], links [{ from { cyl 0, slice tl.swap.slice, x tl.swap.A }, to { cyl 1, same slice, x tl.swap.A }, who 'alice', step tl.swap.step }, { from { cyl 1, same slice, x tl.swap.B }, to { cyl 0, same slice, x tl.swap.B }, who 'bob', step tl.swap.step }] } (A travels from Alice's cylinder to Bob's, B the other way; both cylinders turn about their own axes by the same yaw). Probe: --slices 32 --cyls 2.
Variant 4: `git checkout -q -b dh-cylinder-frame-split dh-cylinder-base`, `git cherry-pick dh-cylinder-frame-shared~1 >/dev/null` then `git cherry-pick dh-cylinder-hop-split >/dev/null`. Probe: --slices 7 --cyls 2.
Sweep, for each of the four variant branches in turn (git checkout -q): the inline-script parse and node --check assets/i18n/cyclic-groups.js; the probe with that branch's numbers; exactly one function dhcTimeline and one function dhcLayout in the page; git diff --stat dh-cylinder-base..BRANCH names only Cyclic Groups/cyclic-groups.html; i18n-check --coverage/--literals-markup/--literals-js --all at the counts noted in Task 1 (coverage equal to main, the literals counts not above main). Then `git checkout -q main` and confirm HEAD is still 22cd9e4 with no tracked changes. Write .planning/quick/261104-krz-cyclic-groups-diffie-hellman-time-cylind/261104-krz-SUMMARY.md on main (not committed: the orchestrator commits planning docs) listing the five branches with their commit SHAs, the probe results per branch, the gate counts before and after, and how to compare: git checkout -q BRANCH, then open the page with ?mode=multiplicative&n=23&gen=5&dh=5,6,15 and press Time cylinder in the DH window.
  </action>
  <verify>
    <automated>for b in dh-cylinder-hop-shared dh-cylinder-hop-split dh-cylinder-frame-shared dh-cylinder-frame-split; do git rev-parse -q --verify "$b" >/dev/null || exit 1; test "$(git rev-list --count dh-cylinder-base..$b)" = 2 || exit 1; S=$(git show "$b:Cyclic Groups/cyclic-groups.html") || exit 1; test "$(printf '%s\n' "$S" | grep -c 'function dhcTimeline')" = 1 || exit 1; test "$(printf '%s\n' "$S" | grep -c 'function dhcLayout')" = 1 || exit 1; done && test "$(git rev-parse --abbrev-ref HEAD)" = main && test "$(git rev-parse --short HEAD)" = 22cd9e4 && git diff --quiet HEAD && D=$(git diff main..dh-cylinder-base) && test "$(printf '%s\n' "$D" | grep '^+' | grep -c 'innerHTML')" = 0 && test "$(printf '%s\n' "$D" | grep '^+' | grep -cE '#[0-9a-fA-F]{3,8}\b|rgba?\(|hsla?\(')" = 0</automated>
  </verify>
  <done>All four variant branches exist, each base plus exactly two commits, each with exactly one dhcTimeline and one dhcLayout, each passing the probe (hop-shared 32/1, hop-split 32/2, frame-shared 7/1, frame-split 7/2) with zero console errors and the i18n gates at their main counts; the working tree is back on main at 22cd9e4 with no tracked changes; the SUMMARY is written.</done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| URL query → page | dh=g,a,b and the group params are untrusted text; already validated by dhFromQuery/openDh before any DH state exists |
| pointer/keyboard → cylinder | drag and arrow keys only change two clamped camera angles |

## STRIDE Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation Plan |
|-----------|----------|-----------|----------|-------------|-----------------|
| T-krz-01 | Tampering | dhc-svg text (title, aria-label, tags) | low | mitigate | every string lands via textContent/setAttribute on svgEl-built nodes; the verify gate greps the base diff for HTML-string assignment |
| T-krz-02 | Denial of Service | drawDhCyl with large secrets in a big group | medium | mitigate | dz squashes to the fixed axis; DHC_RIM_CAP thins rims and drops hop dots past 120 visible slices; DHC_BEAD_CAP skips bead dots past 160 elements; the render signature skips redundant redraws and drags are coalesced through requestAnimationFrame |
| T-krz-03 | Tampering | camera state from input | low | accept | yaw is free, pitch clamped to 0.08..1.45 rad; no persistence, nothing leaves the page |
| T-krz-SC | Tampering | npm/pip/cargo installs | low | accept | no package installs: the probe uses Node 22's built-in WebSocket and the system google-chrome |
</threat_model>

<verification>
- Each variant branch: the three inline scripts parse; assets/i18n/cyclic-groups.js passes node --check; the probe passes with that branch's slice and cylinder counts and zero console errors (desktop and ?mobile=1).
- i18n-check --coverage --all equals the main count (English-only keys only lengthen LANG-KEYSET missing lists); --literals-markup and --literals-js do not exceed main.
- Branch shape: dh-cylinder-base = main + 1; every variant = base + 2, exactly one dhcTimeline and one dhcLayout; main untouched at 22cd9e4.
</verification>

<success_criteria>
The user can check out any of the four branches, open (Z/23Z)* with g = 5, a = 6, b = 15, press Time cylinder in the Diffie–Hellman window, and see a separate movable window with a see-through cylinder of ring slices that follows the exchange step by step, turns under a drag, and shows that branch's variant (per hop or per frame, one shared cylinder or Alice's and Bob's side by side).
</success_criteria>

<output>
Create `.planning/quick/261104-krz-cyclic-groups-diffie-hellman-time-cylind/261104-krz-SUMMARY.md` when done (on main, uncommitted).
</output>
