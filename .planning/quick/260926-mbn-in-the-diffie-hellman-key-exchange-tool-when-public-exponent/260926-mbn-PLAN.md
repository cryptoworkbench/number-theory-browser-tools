---
phase: quick-260926-mbn
plan: 01
type: execute
wave: 2
# 260926-mbl is a repo-wide naming audit that will very likely rewrite this same file
# (its nav carries the "Pizza Slices" path that mbl targets). Sequenced after it so the
# new code in this plan is authored against already-corrected naming.
depends_on: [260926-mbl]
files_modified:
  - Diffie-Hellman Key Exchange/diffie-hellman-key-exchange.html
autonomous: true
requirements: [NAV-02, PAL-02, PAL-04]

estimate:
  tokens: 55000
  raw_tokens: 55000
  tasks: 2
  confidence: low

must_haves:
  truths:
    - "Stepping or playing onto the A-send step shows two moving packets: one crossing the Alice↔Bob wire as it always did, and a copy that peels off where Eve's tap meets the wire and travels down that dashed tap line into Eve's notebook box."
    - "Eve's notebook still reads `A = —` for the whole time the siphoned copy is in flight; the A row inside Eve's box and the `A = <value>` line in her notebook both appear at the moment the copy lands, not at the moment the send step fires."
    - "The same is true of B on the Bob→Alice send step: a copy siphons down the tap and only then is `B = <value>` recorded."
    - "The Alice→Bob and Bob→Alice wire packets are visually unchanged — same start and end points on the wire, same label, same easing, same duration as before this change."
    - "Instant, page load, and Reset-then-Instant all still leave Eve's notebook fully populated with p, g, A and B, with no packet left on the stage — the animated reveal path never becomes the only way Eve's values get recorded."
    - "With `prefers-reduced-motion: reduce` no packet animates at all and Eve's values are recorded at the moment of their send step, so a reduced-motion visitor never ends up with a permanently empty notebook."
    - "Pressing Reset or Build exchange while packets are mid-flight removes every in-flight packet from the stage, and no stale callback from the abandoned run writes into the rebuilt stage."
    - "At the fastest speeds, where a later step can fire before an earlier interception lands, a value already recorded in Eve's notebook is never regressed back to a dash."
    - "The siphoned copy reads as Eve's — it is tinted with the warning/eavesdropper role the rest of the page already uses for Eve — and the file still declares no literal color."
    - "The tool is still one self-contained HTML file with inline `<style>`/`<script>` and no external dependency beyond the shared assets and Google Fonts (NAV-02)."
  artifacts:
    - "Diffie-Hellman Key Exchange/diffie-hellman-key-exchange.html"
  key_links:
    - "advanceOne() -> sendPacket({tapped, delay, onArrive}) -> onArrive -> recordEveIntercept() -> eveRevealed -> renderNotebook() + showRow() — the only path by which Eve's A/B are revealed during animated playback"
    - "revealAll() -> renderStep(step, ex, false) -> recordEveIntercept() — the instant/page-load path, which bypasses packets entirely and must keep working unchanged"
    - "generation counter + in-flight packet registry -> cancelPackets(), called from resetPlayback(), rebuild() and instantFinish()"
    - "TAP_X / WIRE_Y constants -> both the dashed tap line drawn in buildStage() and the siphoned packet's travel path — if these disagree the copy floats off the line it is supposed to follow"
    - "packetDuration() -> the wire leg's duration AND the siphon's launch delay, so the copy peels off exactly as the wire packet passes the tap"
---

<objective>
Make Eve's interception visible. Today, when a public value crosses the Alice↔Bob wire, the animation shows the packet travelling — but Eve's copy of that value appears in her notebook instantly, at the moment the send step fires, with nothing shown travelling to her. This plan adds a second packet that peels off where Eve's dashed tap line meets the wire and travels down that line into her notebook box, and defers the recording of the value until that copy lands.

Purpose: the whole teaching point of this page is that Eve gets everything that crosses the wire and still cannot compute the secret. A value that teleports into her notebook reads as bookkeeping; a value she visibly siphons off the wire reads as eavesdropping. The animation should be the thing that teaches it.
Output: `Diffie-Hellman Key Exchange/diffie-hellman-key-exchange.html` — the same single self-contained file, with a generalised two-dimensional packet tween, a monotonic record of what Eve has intercepted, and the Eve leg wired into both wire sends.
</objective>

<execution_context>
@~/.claude/gsd-core/workflows/execute-plan.md
@~/.claude/gsd-core/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@CLAUDE.md
@./.claude/CLAUDE.md
@Diffie-Hellman Key Exchange/diffie-hellman-key-exchange.html
</context>

<interface_context>
Everything below was read off the current file and is the ground truth this plan builds on. The line numbers are from the file as it stands before Task 1.

**The existing tween — `sendPacket(fromX, toX, y, label, myGen)` (lines 705-742).** Creates a `<g class="packet">` holding a `<rect x=-32 y=-12 width=64 height=24 rx=6>` and a `<text x=0 y=4 text-anchor=middle font-size=11>`, appends it to `stageSvg`, and moves it by setting `transform="translate(x,y)"`. Horizontal only — `y` is fixed for the whole tween. Duration is `Math.max(200, (SPEED_MS[speed] || 800) * 0.8)`. Easing is `easeInOutCubic`. Start time is taken with `performance.now()` at spawn while the per-frame time comes from the rAF callback argument — two different clock sources. The generation guard is `if (myGen !== generation) { tweenFrame = null; return; }` at the top of `frame`, and note that this bail-out path does NOT remove the group from the DOM. On completion (`t >= 1`) the group IS removed. There is a single module-scoped `tweenFrame` handle, which is correct only because exactly one packet has ever been in flight at a time.

**The reduced-motion branch (lines 719-723).** `reduceMotion` is read from `window.matchMedia('(prefers-reduced-motion: reduce)').matches`. When set, the group is placed at `toX` and immediately removed — no animation, no frames. Any state change that gets attached to packet arrival must also happen on this branch or reduced-motion visitors lose it.

**The two launch sites — `advanceOne()` (lines 744-755).** `sendPacket(300, 600, 120, shortVal(ex.publicAlice), myGen)` for `sendAliceToBob`, and `sendPacket(600, 300, 120, shortVal(ex.publicBob), myGen)` for `sendBobToAlice`. `myGen` is captured before `renderStep` runs.

**Stage geometry — `buildStage()` (lines 457-503).** Alice's box `x=30..280, y=40..340`. Bob's box `x=620..870`. The wire is a dashed line from `(300,120)` to `(600,120)`. Eve's box is `x=330..570, y=350..430`. Eve's dashed tap line runs from `(450,120)` to `(450,350)` — so the tap meets the wire at exactly the wire's midpoint. Eve's four text rows are created at `x=340` with baselines: `svgEveP` y=365, `svgEveG` y=380, `svgEveA` y=395, `svgEveB` y=410.

**How Eve's values are revealed today — `renderStep()` (lines 634-681).** The `sendAliceToBob` case calls `showRow('svgBobReceived', ...)` then `showRow('svgEveA', ...)` then `renderNotebook(ex, {p:true, g:true, a:true, b:false})`, all synchronously. The `sendBobToAlice` case is the mirror image with `{...a:true, b:true}`. The `agree` case reveals `svgEveP`/`svgEveG` and calls `renderNotebook(ex, {p:true, g:true, a:false, b:false})`.

**`renderNotebook(ex, revealed)` (lines 517-530).** Rewrites `eveNotebook.innerHTML` wholesale from the four booleans on `revealed`, printing `fmt(value)` or an em-dash per slot. Because each call reconstructs the whole notebook from whatever flags it was handed, a late call with stale flags can un-reveal a value a newer call already revealed.

**`showRow(id, text)` (lines 510-515).** Sets `textContent`, sets `style.opacity = '1'`, adds `is-active`. `clearActive()` strips `is-active` from every row at the top of each `renderStep`.

**The two reveal paths.** `advanceOne()` (Play and Step) calls `renderStep` and then launches packets. `revealAll()` (lines 683-688) loops `renderStep` directly with no packets at all — and `rebuild()` calls `instantFinish()` on every build, which means the page as first loaded has always been produced by the packet-free path. Any deferral of Eve's reveal onto packet arrival must leave this path revealing immediately.

**Playback teardown.** `resetPlayback()` (lines 813-830) bumps `generation`, cancels `tweenFrame`, resets `.svg-row` opacity and clears `eveNotebook`. `rebuild()` (lines 858-883) bumps `generation`, cancels `rafId` and `tweenFrame`, then calls `buildStage()` (which wipes the SVG wholesale via `innerHTML = ''`) and `instantFinish()`. `instantFinish()` (lines 806-811) cancels nothing — pressing Instant mid-flight currently leaves a packet running.

**Existing packet CSS (lines 110-111).** `.packet rect{ fill:var(--overlay); stroke:var(--panel-border-strong); }` and `.packet text{ fill:var(--text); }`.

**Palette tokens available in `assets/palette.css`.** `--role-warn`, `--role-warn-soft`, `--role-active`, `--role-alt`, `--role-input`, `--overlay`, `--panel-border-strong`, `--text`, `--text-dim`. Eve is `--role-warn` everywhere on this page already (her avatar, her box stroke, her notebook border, her legend swatch), so that is the role the siphoned copy must use — that is PAL-04, not a free choice.

**Verification tooling, confirmed present on this machine.** `node` at `/usr/bin/node`, `google-chrome` at `/usr/bin/google-chrome`, `python3` at `/usr/bin/python3`. Headless Chrome with `--virtual-time-budget` fast-forwards `setTimeout` but does NOT advance rAF timestamps between frames, so a rAF tween freezes at its first frame under the gate. Both gates below are built on that measured behaviour: a `setTimeout`-scheduled launch is observable, and a frozen tween is exactly how the gate proves the value has not been recorded yet. `--force-prefers-reduced-motion` works and is how the reduced-motion branch gets covered.
</interface_context>

<tasks>

<!-- planner-discipline-allow: class="packet -->
<!-- Justification: the LEFTOVER-PACKETS check counts occurrences in the *Chrome DOM dump* of the
     settled page (the `$D` variable holds headless output), never in the source HTML, so no amount
     of comment or prose in the tool file can influence its count. The literal has to appear in the
     action bodies because the executor must be told which class the packet group carries and that
     the tapped modifier is appended to it rather than replacing it. -->

<task type="tracer" tdd="true">
  <name>Task 1: Siphon the A value down Eve's tap before recording it — one leg, end to end</name>
  <files>Diffie-Hellman Key Exchange/diffie-hellman-key-exchange.html</files>
  <precondition>`node`, `google-chrome` and `python3` are on PATH — this task's gates run `node --check`, build a throwaway harness copy with `python3`, and drive it in headless Chrome.</precondition>
  <read_first>
    Read `Diffie-Hellman Key Exchange/diffie-hellman-key-exchange.html` lines 100-152 (the `.packet` and `.notebook` CSS), 457-530 (`buildStage`, `clearActive`, `showRow`, `renderNotebook`), 634-688 (`renderStep`, `revealAll`) and 690-830 (the whole playback section: `sendPacket`, `advanceOne`, `frameStep`, `play`, `pause`, `stepOnce`, `instantFinish`, `resetPlayback`). The `<interface_context>` above already states what each of those does; read them to get the exact surrounding code you are editing, not to rediscover the structure.
  </read_first>
  <behavior>
    Observable through the headless harness gate in `<verify>`, which drives the page with Reset then seven Step clicks and snapshots the stage 60 ms and 700 ms into each step:
    - At 60 ms into the `sendAliceToBob` step: exactly one packet on the stage (the wire packet), and Eve's notebook reads `A = —`. Today it reads `A = 8` here — that is the bug.
    - At 700 ms into the same step: two packets on the stage. The second carries `class="packet tapped"`, the same label as the wire packet, and sits at `translate(450,120)` — the point where the tap line meets the wire. Eve's notebook still reads `A = —`, because the copy has not landed yet.
    - Under `--force-prefers-reduced-motion`: zero packets on the stage at any point, and Eve's notebook reads `A = 8` from the `sendAliceToBob` step onward — the reduced-motion visitor still gets the record, immediately.
    - On a plain page load with no harness (the instant path): Eve's notebook holds `p = 23`, `g = 5`, `A = 8` and `B = 19`, and there are zero packet elements left on the stage.
  </behavior>
  <action>
GEOMETRY — introduce named constants for the stage coordinates the packets use, declared once near the top of the playback section, and make `buildStage()` draw the wire and the tap line from those same constants so the drawn line and the travelled path can never drift apart (this is the `TAP_X / WIRE_Y` key link): `WIRE_Y` = 120, `ALICE_X` = 300, `BOB_X` = 600, `TAP_X` = 450, and `EVE_BOX_TOP` = 350. Also declare the baseline y of each of Eve's four rows as named values (365, 380, 395, 410) and use them both in `buildStage()`'s `row(...)` calls and as the siphon's landing target, so the arriving copy lands on the row it is about to fill. The packet's own `<text>` sits at y=4 relative to the group's translate, so a copy landing on the `svgEveA` row translates to a y of that row's baseline minus 4.

DURATION HELPER — extract the duration expression currently inlined in `sendPacket` into a `packetDuration()` function returning `Math.max(200, (SPEED_MS[parseInt(speedInput.value, 10)] || 800) * 0.8)`. Both legs and the siphon's launch delay derive from it, so everything scales with the speed slider exactly as the wire packet already does.

GENERALISE THE TWEEN — rewrite `sendPacket` to take a single options object instead of five positional arguments, supporting: `fromX`, `fromY`, `toX`, `toY`, `label`, `gen`, and the three new ones `tapped`, `delay` and `onArrive`, plus an optional `duration` defaulting to `packetDuration()`. Tween both axes (the existing call sites become `fromY` equal to `toY` equal to `WIRE_Y`, which reproduces today's horizontal-only motion exactly). Keep `easeInOutCubic`, keep the rect/text geometry, keep the `class="packet"` group. When `tapped` is set, the group's class attribute must be the two words `packet tapped` in that order. Derive the tween's start time from the timestamp the rAF callback hands you on its first frame rather than from a `performance.now()` call taken at spawn time — one clock source instead of two. This is deliberate and load-bearing twice over: it removes a latent mismatch between the spawn clock and the frame clock, and it is what makes the packet's position assertable in the headless gate.

DELAYED LAUNCH — when `delay` is greater than zero, schedule the whole spawn (group creation included) with `setTimeout`, so nothing appears on the stage until the delay elapses. Use `setTimeout`, not a progress callback fired from inside the wire packet's frame loop: the siphon's launch must not depend on the wire tween's frames surviving, and a timer-driven launch is what the headless gate can observe. Re-check the generation guard when the timer fires and abandon the spawn if the run has been superseded.

ARRIVAL CALLBACK — `onArrive`, when supplied, fires exactly once, immediately before the group is removed from the DOM on completion. It must ALSO fire on the reduced-motion branch, where the packet is placed and removed with no animation — otherwise a reduced-motion visitor never gets the value recorded at all. It must NOT fire when the generation guard bails out.

TRACK EVERY IN-FLIGHT PACKET — the single module-scoped `tweenFrame` handle only works while at most one packet exists; this change puts two or more in flight at once, and at the fastest speeds several. Replace it with a registry holding the pending `setTimeout` ids, the pending `requestAnimationFrame` ids and the packet group nodes, and add a `cancelPackets()` that clears all three (cancel the timers, cancel the frames, remove the nodes, empty the registry). Call `cancelPackets()` from `resetPlayback()` and `rebuild()` in place of the `tweenFrame` cancellations they do today, and add a call to `instantFinish()`, which currently cancels nothing and so leaves packets running when Instant is pressed mid-flight. Removing the nodes explicitly also fixes the case where the generation guard bails out of a frame and leaves an orphaned group frozen on the stage — Reset does not wipe the SVG the way `buildStage()` does.

MONOTONIC RECORD OF WHAT EVE HAS — add a module-scoped record of which of p, g, A and B Eve has intercepted so far, and change `renderNotebook(ex)` to read it instead of taking a `revealed` argument. This is required for correctness, not tidiness: once the A reveal is deferred onto packet arrival, a fast speed can fire the B step before the A copy lands, and a notebook rebuilt from a stale argument object would un-reveal a value the newer step already revealed. Flags only ever go from unset to set within a run; `resetPlayback()` and `rebuild()` clear all four. Update the `agree` case to set the p and g flags and then call `renderNotebook(ex)`.

ONE PLACE THAT RECORDS AN INTERCEPT — add `recordEveIntercept(ex, which)` where `which` selects A or B. It sets that flag, calls `showRow` on the matching Eve row, and calls `renderNotebook(ex)`. After this task, this must be the only place in the file that reveals `svgEveA`.

DEFER IT ON THE ANIMATED PATH ONLY — give `renderStep` a third parameter that suppresses the Eve-facing half of the two send cases. The recipient's own row (`svgBobReceived` / `svgAliceReceived`) is still revealed synchronously by the step, exactly as now — only Eve's row and notebook line move. `advanceOne()` passes the suppressing value and takes ownership of the intercept; `revealAll()` passes the non-suppressing value so the instant path, Reset-then-Instant, and the page as first loaded all record Eve's values immediately with no packets involved. This is the single highest-risk part of the change: `rebuild()` calls `instantFinish()` on every build, so if `revealAll()` loses the ability to record Eve's values, the page will load with a permanently empty notebook.

WIRE THE A LEG — in `advanceOne()`, for `sendAliceToBob`, keep the existing wire packet (`ALICE_X` to `BOB_X` along `WIRE_Y`, unchanged in every visible respect) and add a second packet carrying the same label: from `(TAP_X, WIRE_Y)` straight down to `(TAP_X, svgEveA's baseline minus 4)`, `tapped` set, `delay` of half `packetDuration()`, `duration` of half `packetDuration()`, and an `onArrive` that calls `recordEveIntercept` for A. Those two halves are chosen so the copy peels off exactly as the wire packet passes the tap and lands at the same instant the wire packet completes — the whole interception fits inside one dwell at every speed from 1 to 9. At speed 10 the 200 ms duration floor exceeds the 90 ms dwell and the interception will finish a little into the next step; the monotonic record and the generation guard make that safe, and it is preferable to a siphon too fast to see. Leave `sendBobToAlice` alone in this task — it still reveals B synchronously, and Task 2 gives it the same treatment.

STYLE THE COPY — add CSS beside the existing `.packet` rules giving `.packet.tapped` its rect a `var(--role-warn-soft)` fill and a `var(--role-warn)` stroke, and its text a `var(--role-warn)` fill. Eve is `--role-warn` everywhere else on this page, so the copy reads as hers on sight. Declare no literal color — every value goes through `var()` against a token `assets/palette.css` already defines (PAL-02, PAL-04).

Keep everything inside the one file, inline, with no new external dependency (NAV-02). Do not touch the number-theory section, `buildExchange`'s step list, or any of `play` / `pause` / `stepOnce` / `frameStep`.
  </action>
  <verify>
    <automated>cd /home/mainaccount/Claude/number-theory-browser-tools &amp;&amp; F="Diffie-Hellman Key Exchange/diffie-hellman-key-exchange.html"; T=$(mktemp -d); awk '/^\(function\(\)[{]/{f=1} f{print} /^[}]\)\(\);/{if(f)exit}' "$F" | tee "$T/dh.js" | wc -l; node --check "$T/dh.js" &amp;&amp; echo SCRIPT-PARSES; rm -rf "$T"</automated>
    <automated>cd /home/mainaccount/Claude/number-theory-browser-tools &amp;&amp; F="Diffie-Hellman Key Exchange/diffie-hellman-key-exchange.html"; awk '/---------- number theory ----------/{f=1;next} /---------- state ----------/{f=0} f' "$F" | node -e "const fs=require('fs');eval(fs.readFileSync(0,'utf8'));const ex=buildExchange(23n,5n,6n,15n);if(ex.publicAlice!==8n||ex.publicBob!==19n)throw new Error('PUBLICS-REGRESSED');if(ex.secretAlice!==ex.secretBob||ex.secretAlice!==2n)throw new Error('SECRET-REGRESSED');if(ex.steps.map(s=>s.id).join(',')!=='agree,alicePicks,bobPicks,aliceComputesPublic,bobComputesPublic,sendAliceToBob,sendBobToAlice,aliceComputesSecret,bobComputesSecret,match')throw new Error('STEP-IDS-REGRESSED');for(let t=0;t&lt;25;t++){const p=1019n,a=randomBigIntInRange(2n,p-2n),b=randomBigIntInRange(2n,p-2n);const r=buildExchange(p,2n,a,b);if(r.secretAlice!==r.secretBob)throw new Error('RANDOM-MISMATCH');}console.log('MATH-STILL-OK')"</automated>
    <automated>cd /home/mainaccount/Claude/number-theory-browser-tools &amp;&amp; F="Diffie-Hellman Key Exchange/diffie-hellman-key-exchange.html"; S=$(grep -v "^[[:space:]]*//" "$F"); for t in SPEED_LABELS SPEED_MS generation requestAnimationFrame cancelAnimationFrame easeInOutCubic sendPacket advanceOne frameStep instantFinish resetPlayback revealAll STORAGE_KEY prefers-reduced-motion packetDuration cancelPackets recordEveIntercept onArrive; do printf '%s\n' "$S" | grep -q "$t" || echo "MISSING $t"; done; n=$(printf '%s\n' "$S" | grep -oF "showRow('svgEveA'" | wc -l); [ "$n" = 1 ] || echo "EVE-A-REVEAL-SITES $n"; r=$(grep -n 'function recordEveIntercept' "$F" | head -1 | cut -d: -f1); e=$(grep -n "showRow('svgEveA'" "$F" | head -1 | cut -d: -f1); { [ -n "$r" ] &amp;&amp; [ -n "$e" ] &amp;&amp; [ "$e" -gt "$r" ]; } || echo EVE-A-REVEAL-NOT-IN-RECORDER; k=$(printf '%s\n' "$S" | grep -oF 'cancelPackets' | wc -l); [ "$k" -ge 4 ] || echo "CANCELPACKETS-CALLSITES $k (want the definition plus calls from resetPlayback, rebuild and instantFinish)"; printf '%s\n' "$S" | grep -qF 'packet tapped' || echo NO-TAPPED-CLASS; printf '%s\n' "$S" | grep -qF '.packet.tapped' || echo NO-TAPPED-CSS; printf '%s\n' "$S" | grep -q 'TAP_X' || echo NO-TAP-CONSTANT; printf '%s\n' "$S" | grep -q 'WIRE_Y' || echo NO-WIRE-CONSTANT; printf '%s\n' "$S" | grep -q 'setTimeout' || echo NO-DELAYED-LAUNCH; echo WIRING-CHECKED</automated>
    <automated>cd /home/mainaccount/Claude/number-theory-browser-tools &amp;&amp; F="Diffie-Hellman Key Exchange/diffie-hellman-key-exchange.html"; grep -nEi '#[0-9a-f]{3}\b|#[0-9a-f]{6}\b|rgba?\([0-9]|hsla?\(' "$F" | grep -vE ':[[:space:]]*(/\*|\*|//)' | grep -v 'fonts.googleapis\|fonts.gstatic' | sed 's/^/FILE-LITERAL /'; grep -nE '^[[:space:]]*--[a-z0-9-]+[[:space:]]*:' "$F" | sed 's/^/LOCAL-TOKEN /'; grep -qF 'var(--role-warn' "$F" || echo NO-WARN-ROLE-USE; echo FILE-SWEPT</automated>
    <automated>cd /home/mainaccount/Claude/number-theory-browser-tools; D=$(timeout 180 google-chrome --headless=new --disable-gpu --no-sandbox --virtual-time-budget=6000 --dump-dom "file:///home/mainaccount/Claude/number-theory-browser-tools/Diffie-Hellman%20Key%20Exchange/diffie-hellman-key-exchange.html" 2>/dev/null); N=$(printf '%s' "$D" | grep -o 'id="eveNotebook".*' | head -1); printf '%s' "$N" | grep -qF '&lt;div&gt;p = 23&lt;/div&gt;' || echo INSTANT-P-MISSING; printf '%s' "$N" | grep -qF '&lt;div&gt;g = 5&lt;/div&gt;' || echo INSTANT-G-MISSING; printf '%s' "$N" | grep -qF '&lt;div&gt;A = 8&lt;/div&gt;' || echo INSTANT-A-MISSING; printf '%s' "$N" | grep -qF '&lt;div&gt;B = 19&lt;/div&gt;' || echo INSTANT-B-MISSING; printf '%s' "$D" | grep -qF '&gt;A = 8&lt;' || echo SVG-EVE-A-ROW-MISSING; printf '%s' "$D" | grep -qF '&gt;B = 19&lt;' || echo SVG-EVE-B-ROW-MISSING; L=$(printf '%s' "$D" | grep -oF 'class="packet' | wc -l); [ "$L" = 0 ] || echo "LEFTOVER-PACKETS $L"; echo INSTANT-PATH-CHECKED</automated>
    <automated>cd /home/mainaccount/Claude/number-theory-browser-tools; F="Diffie-Hellman Key Exchange/diffie-hellman-key-exchange.html"; H="Diffie-Hellman Key Exchange/.dh-eve-harness.html"; U="file:///home/mainaccount/Claude/number-theory-browser-tools/Diffie-Hellman%20Key%20Exchange/.dh-eve-harness.html"; T=$(mktemp -d); trap 'rm -f "$H"; rm -rf "$T"' EXIT; cat &gt; "$T/drv.html" &lt;&lt;'JS'
&lt;script&gt;
(function(){
  var L=[];
  function snap(tag){
    var nb=(document.getElementById('eveNotebook').textContent||'').replace(/\s+/g,' ');
    var m=/A = ([^BS]*)B = ([^S]*)/.exec(nb);
    var pk=document.querySelectorAll('#stageSvg .packet'), o=[];
    for(var j=0;j&lt;pk.length;j++) o.push('{'+(pk[j].textContent||'')+'|'+pk[j].getAttribute('class')+'|'+pk[j].getAttribute('transform')+'}');
    L.push(tag+' PK'+pk.length+o.join('')+' EVE&lt;A='+(m?m[1].trim():'?')+' B='+(m?m[2].trim():'?')+'&gt;');
  }
  window.addEventListener('load',function(){
    setTimeout(function(){
      document.getElementById('resetBtn').click();
      var i=0;
      function step(){
        document.getElementById('stepBtn').click(); i++;
        setTimeout(function(){ snap('s'+i+'+60'); },60);
        setTimeout(function(){ snap('s'+i+'+700'); },700);
        if(i&lt;7) setTimeout(step,1500); else setTimeout(function(){ document.title='GATE::'+L.join(' ;; '); },2500);
      }
      step();
    },400);
  });
})();
&lt;/script&gt;
JS
python3 -c 'import io,sys;s=io.open(sys.argv[1],encoding="utf-8").read();d=io.open(sys.argv[2],encoding="utf-8").read();io.open(sys.argv[3],"w",encoding="utf-8").write(s.replace("&lt;/body&gt;",d+"&lt;/body&gt;"))' "$F" "$T/drv.html" "$H"; run(){ timeout 180 google-chrome --headless=new --disable-gpu --no-sandbox $1 --virtual-time-budget=40000 --dump-dom "$U" 2&gt;/dev/null | grep -o 'GATE::[^&lt;]*' | sed 's/ ;; /\n/g; s/&amp;lt;/&lt;/g; s/&amp;gt;/&gt;/g'; }; M=$(run ""); R=$(run "--force-prefers-reduced-motion"); [ -n "$M" ] || echo HARNESS-NO-OUTPUT-MOTION; [ -n "$R" ] || echo HARNESS-NO-OUTPUT-REDUCED; A60=$(printf '%s\n' "$M" | grep -F 's6+60'); A700=$(printf '%s\n' "$M" | grep -F 's6+700'); printf '%s\n' "$A60" | grep -qF 'EVE&lt;A=— B=—&gt;' || echo EVE-A-RECORDED-AT-SEND-INSTEAD-OF-ON-ARRIVAL; printf '%s\n' "$A700" | grep -qF ' PK2' || echo NO-SECOND-PACKET-AT-TAP-FOR-A; printf '%s\n' "$A700" | grep -qF '|packet tapped|translate(450,120)}' || echo NO-EVE-BOUND-PACKET-FOR-A; printf '%s\n' "$A700" | grep -qF 'EVE&lt;A=— B=—&gt;' || echo EVE-A-RECORDED-WHILE-STILL-IN-FLIGHT; printf '%s\n' "$R" | grep -F 's6+700' | grep -qF ' PK0 EVE&lt;A=8 B=—&gt;' || echo REDUCED-MOTION-A-NOT-RECORDED; rm -f "$H"; test -f "$H" &amp;&amp; echo HARNESS-NOT-CLEANED; echo EVE-TRAVEL-A-CHECKED</automated>
  </verify>
  <done>
    - Every gate above ends with its sentinel (`SCRIPT-PARSES`, `MATH-STILL-OK`, `WIRING-CHECKED`, `FILE-SWEPT`, `INSTANT-PATH-CHECKED`, `EVE-TRAVEL-A-CHECKED`) and prints no line prefixed `MISSING`, `NO-`, `EVE-A-`, `CANCELPACKETS-`, `INSTANT-`, `SVG-EVE-`, `LEFTOVER-PACKETS`, `REDUCED-MOTION-`, `HARNESS-`, `FILE-LITERAL` or `LOCAL-TOKEN`.
    - The A-send step puts two packets on the wire-and-tap: the unchanged wire packet, and a warn-tinted copy that starts where the tap meets the wire.
    - Eve's notebook shows `A = —` for as long as that copy is in flight, and `A = <value>` from the moment it lands.
    - The instant path (page load, Instant, Reset-then-Instant) still fills Eve's notebook with p, g, A and B and leaves no packet on the stage.
    - `prefers-reduced-motion: reduce` animates nothing and records A at its send step.
    - The `.dh-eve-harness.html` scratch file the gate builds no longer exists in the tool directory.
  </done>
  <reversibility rating="reversible">Confined to one file's inline script and style; `git checkout` of that single path undoes it completely, and nothing outside the file depends on any of the new internals.</reversibility>
</task>

<task type="auto" tdd="true">
  <name>Task 2: Give the B value the same siphon, and make the captions name the interception</name>
  <files>Diffie-Hellman Key Exchange/diffie-hellman-key-exchange.html</files>
  <precondition>Task 1 is committed — this task reuses the options-object `sendPacket`, `recordEveIntercept`, the monotonic Eve record and `cancelPackets()` exactly as Task 1 built them, and adds no new mechanism.</precondition>
  <behavior>
    Observable through the same harness gate, extended to the Bob→Alice send:
    - At 60 ms into the `sendBobToAlice` step: Eve's notebook still reads `B = —`, while `A = 8` (recorded earlier) is untouched.
    - At 700 ms into that step: a `class="packet tapped"` copy carrying B's label sits at `translate(450,120)`, and Eve's notebook still reads `B = —`.
    - Under `--force-prefers-reduced-motion`: zero packets throughout, and Eve's notebook reads `A = 8 B = 19` from the `sendBobToAlice` step onward.
    - On a plain page load: the notebook is fully populated and the stage carries no leftover packets.
  </behavior>
  <action>
WIRE THE B LEG — in `advanceOne()`, for `sendBobToAlice`, mirror what Task 1 did for A: keep the existing wire packet (`BOB_X` to `ALICE_X` along `WIRE_Y`, unchanged) and add a `tapped` copy carrying B's label travelling from `(TAP_X, WIRE_Y)` straight down to `(TAP_X, svgEveB's baseline minus 4)`, with the same half-duration delay, the same half duration, and an `onArrive` that calls `recordEveIntercept` for B. Then remove the last synchronous Eve reveal from `renderStep`'s `sendBobToAlice` case, exactly as Task 1 did for `sendAliceToBob` — after this task, `recordEveIntercept` is the only place in the file that reveals either of Eve's A and B rows, and the suppressing parameter governs both send cases symmetrically.

NAME THE INTERCEPTION — the two wire steps' captions in `buildExchange`'s step list currently end with a note that Eve is watching, which was accurate when nothing visibly reached her and is now underselling what the user can see. Reword both so they describe the tap copying the value down as it passes — the caption and the animation should be telling the same story. Change only the `caption` strings of the `sendAliceToBob` and `sendBobToAlice` entries; leave every `id` and `owner` exactly as it is, because the step ids are asserted by the math gate and are switched on in three places.

RELABEL THE EVE LEGEND ITEM — the legend's Eve entry currently reads just her name. Extend that one label so it also accounts for the siphoned copy the user now sees moving down her tap line. Reuse the existing `.swatch.eve` element and class — do not add a swatch and do not introduce a color; the copy is already warn-tinted, which is what that swatch shows.

Change nothing else. Do not touch the number-theory section, the step ids, `sendPacket`, `recordEveIntercept`, the monotonic Eve record, `cancelPackets()`, or any of `play` / `pause` / `stepOnce` / `frameStep` / `instantFinish` / `resetPlayback` / `rebuild`.
  </action>
  <verify>
    <automated>cd /home/mainaccount/Claude/number-theory-browser-tools &amp;&amp; F="Diffie-Hellman Key Exchange/diffie-hellman-key-exchange.html"; T=$(mktemp -d); awk '/^\(function\(\)[{]/{f=1} f{print} /^[}]\)\(\);/{if(f)exit}' "$F" | tee "$T/dh.js" | wc -l; node --check "$T/dh.js" &amp;&amp; echo SCRIPT-PARSES; rm -rf "$T"</automated>
    <automated>cd /home/mainaccount/Claude/number-theory-browser-tools &amp;&amp; F="Diffie-Hellman Key Exchange/diffie-hellman-key-exchange.html"; awk '/---------- number theory ----------/{f=1;next} /---------- state ----------/{f=0} f' "$F" | node -e "const fs=require('fs');eval(fs.readFileSync(0,'utf8'));const ex=buildExchange(23n,5n,6n,15n);if(ex.publicAlice!==8n||ex.publicBob!==19n)throw new Error('PUBLICS-REGRESSED');if(ex.secretAlice!==ex.secretBob||ex.secretAlice!==2n)throw new Error('SECRET-REGRESSED');if(ex.steps.map(s=>s.id).join(',')!=='agree,alicePicks,bobPicks,aliceComputesPublic,bobComputesPublic,sendAliceToBob,sendBobToAlice,aliceComputesSecret,bobComputesSecret,match')throw new Error('STEP-IDS-REGRESSED');if(ex.steps.length!==10)throw new Error('STEP-COUNT-REGRESSED');if(aesSentence(7n)!=='Now Alice and Bob can use 7 as the key used for symmetric encryption using an algorithm like AES, Blowfish, etc.')throw new Error('AES-LINE-REGRESSED');for(let t=0;t&lt;25;t++){const p=1019n,a=randomBigIntInRange(2n,p-2n),b=randomBigIntInRange(2n,p-2n);const r=buildExchange(p,2n,a,b);if(r.secretAlice!==r.secretBob)throw new Error('RANDOM-MISMATCH');}console.log('MATH-STILL-OK')"</automated>
    <automated>cd /home/mainaccount/Claude/number-theory-browser-tools &amp;&amp; F="Diffie-Hellman Key Exchange/diffie-hellman-key-exchange.html"; S=$(grep -v "^[[:space:]]*//" "$F"); for t in SPEED_LABELS SPEED_MS generation requestAnimationFrame cancelAnimationFrame easeInOutCubic sendPacket advanceOne frameStep instantFinish resetPlayback revealAll STORAGE_KEY prefers-reduced-motion packetDuration cancelPackets recordEveIntercept onArrive TAP_X WIRE_Y; do printf '%s\n' "$S" | grep -q "$t" || echo "MISSING $t"; done; for id in svgEveA svgEveB; do n=$(printf '%s\n' "$S" | grep -oF "showRow('$id'" | wc -l); [ "$n" = 1 ] || echo "EVE-REVEAL-SITES $id=$n"; done; r=$(grep -n 'function recordEveIntercept' "$F" | head -1 | cut -d: -f1); for id in svgEveA svgEveB; do e=$(grep -n "showRow('$id'" "$F" | head -1 | cut -d: -f1); { [ -n "$r" ] &amp;&amp; [ -n "$e" ] &amp;&amp; [ "$e" -gt "$r" ]; } || echo "EVE-REVEAL-NOT-IN-RECORDER $id"; done; c=$(printf '%s\n' "$S" | grep -oF 'tapped:true' | wc -l); [ "$c" = 2 ] || echo "TAPPED-LAUNCH-COUNT $c"; k=$(printf '%s\n' "$S" | grep -oF 'cancelPackets' | wc -l); [ "$k" -ge 4 ] || echo "CANCELPACKETS-CALLSITES $k"; printf '%s\n' "$S" | grep -qF '.packet.tapped' || echo NO-TAPPED-CSS; a=$(grep -o 'site-nav-link' "$F" | wc -l); [ "$a" = 8 ] || echo "NAV-COUNT $a"; g=$(grep -o 'class="swatch eve"' "$F" | wc -l); [ "$g" = 1 ] || echo "EVE-SWATCH-COUNT $g"; echo WIRING-CHECKED</automated>
    <automated>cd /home/mainaccount/Claude/number-theory-browser-tools &amp;&amp; F="Diffie-Hellman Key Exchange/diffie-hellman-key-exchange.html"; grep -nEi '#[0-9a-f]{3}\b|#[0-9a-f]{6}\b|rgba?\([0-9]|hsla?\(' "$F" | grep -vE ':[[:space:]]*(/\*|\*|//)' | grep -v 'fonts.googleapis\|fonts.gstatic' | sed 's/^/FILE-LITERAL /'; grep -nEi '(fill|stroke|color|background|border|outline|shadow)[^;]*\b(whi''te|bla''ck|red|blue|green|gold|yellow|orange|purple|pink|gray|grey|silver|cyan|magenta|navy|teal|lime|brown|violet)\b' "$F" | grep -vE ':[[:space:]]*(/\*|\*|//)' | sed 's/^/NAMED-COLOR /'; grep -nE '^[[:space:]]*--[a-z0-9-]+[[:space:]]*:' "$F" | sed 's/^/LOCAL-TOKEN /'; echo FILE-SWEPT</automated>
    <automated>cd /home/mainaccount/Claude/number-theory-browser-tools; D=$(timeout 180 google-chrome --headless=new --disable-gpu --no-sandbox --virtual-time-budget=6000 --dump-dom "file:///home/mainaccount/Claude/number-theory-browser-tools/Diffie-Hellman%20Key%20Exchange/diffie-hellman-key-exchange.html" 2&gt;/dev/null); N=$(printf '%s' "$D" | grep -o 'id="eveNotebook".*' | head -1); printf '%s' "$N" | grep -qF '&lt;div&gt;p = 23&lt;/div&gt;' || echo INSTANT-P-MISSING; printf '%s' "$N" | grep -qF '&lt;div&gt;g = 5&lt;/div&gt;' || echo INSTANT-G-MISSING; printf '%s' "$N" | grep -qF '&lt;div&gt;A = 8&lt;/div&gt;' || echo INSTANT-A-MISSING; printf '%s' "$N" | grep -qF '&lt;div&gt;B = 19&lt;/div&gt;' || echo INSTANT-B-MISSING; printf '%s' "$D" | grep -qF '&gt;A = 8&lt;' || echo SVG-EVE-A-ROW-MISSING; printf '%s' "$D" | grep -qF '&gt;B = 19&lt;' || echo SVG-EVE-B-ROW-MISSING; L=$(printf '%s' "$D" | grep -oF 'class="packet' | wc -l); [ "$L" = 0 ] || echo "LEFTOVER-PACKETS $L"; echo INSTANT-PATH-CHECKED</automated>
    <automated>cd /home/mainaccount/Claude/number-theory-browser-tools; F="Diffie-Hellman Key Exchange/diffie-hellman-key-exchange.html"; H="Diffie-Hellman Key Exchange/.dh-eve-harness.html"; U="file:///home/mainaccount/Claude/number-theory-browser-tools/Diffie-Hellman%20Key%20Exchange/.dh-eve-harness.html"; T=$(mktemp -d); trap 'rm -f "$H"; rm -rf "$T"' EXIT; cat &gt; "$T/drv.html" &lt;&lt;'JS'
&lt;script&gt;
(function(){
  var L=[];
  function snap(tag){
    var nb=(document.getElementById('eveNotebook').textContent||'').replace(/\s+/g,' ');
    var m=/A = ([^BS]*)B = ([^S]*)/.exec(nb);
    var pk=document.querySelectorAll('#stageSvg .packet'), o=[];
    for(var j=0;j&lt;pk.length;j++) o.push('{'+(pk[j].textContent||'')+'|'+pk[j].getAttribute('class')+'|'+pk[j].getAttribute('transform')+'}');
    L.push(tag+' PK'+pk.length+o.join('')+' EVE&lt;A='+(m?m[1].trim():'?')+' B='+(m?m[2].trim():'?')+'&gt;');
  }
  window.addEventListener('load',function(){
    setTimeout(function(){
      document.getElementById('resetBtn').click();
      var i=0;
      function step(){
        document.getElementById('stepBtn').click(); i++;
        setTimeout(function(){ snap('s'+i+'+60'); },60);
        setTimeout(function(){ snap('s'+i+'+700'); },700);
        if(i&lt;7) setTimeout(step,1500); else setTimeout(function(){ document.title='GATE::'+L.join(' ;; '); },2500);
      }
      step();
    },400);
  });
})();
&lt;/script&gt;
JS
python3 -c 'import io,sys;s=io.open(sys.argv[1],encoding="utf-8").read();d=io.open(sys.argv[2],encoding="utf-8").read();io.open(sys.argv[3],"w",encoding="utf-8").write(s.replace("&lt;/body&gt;",d+"&lt;/body&gt;"))' "$F" "$T/drv.html" "$H"; run(){ timeout 180 google-chrome --headless=new --disable-gpu --no-sandbox $1 --virtual-time-budget=40000 --dump-dom "$U" 2&gt;/dev/null | grep -o 'GATE::[^&lt;]*' | sed 's/ ;; /\n/g; s/&amp;lt;/&lt;/g; s/&amp;gt;/&gt;/g'; }; M=$(run ""); R=$(run "--force-prefers-reduced-motion"); [ -n "$M" ] || echo HARNESS-NO-OUTPUT-MOTION; [ -n "$R" ] || echo HARNESS-NO-OUTPUT-REDUCED; A60=$(printf '%s\n' "$M" | grep -F 's6+60'); A700=$(printf '%s\n' "$M" | grep -F 's6+700'); B60=$(printf '%s\n' "$M" | grep -F 's7+60'); B700=$(printf '%s\n' "$M" | grep -F 's7+700'); printf '%s\n' "$A60" | grep -qF 'EVE&lt;A=— B=—&gt;' || echo EVE-A-RECORDED-AT-SEND-INSTEAD-OF-ON-ARRIVAL; printf '%s\n' "$A700" | grep -qF '|packet tapped|translate(450,120)}' || echo NO-EVE-BOUND-PACKET-FOR-A; printf '%s\n' "$A700" | grep -qF 'EVE&lt;A=— B=—&gt;' || echo EVE-A-RECORDED-WHILE-STILL-IN-FLIGHT; printf '%s\n' "$B60" | grep -qF ' B=—&gt;' || echo EVE-B-RECORDED-AT-SEND-INSTEAD-OF-ON-ARRIVAL; printf '%s\n' "$B700" | grep -qF '{19|packet tapped|translate(450,120)}' || echo NO-EVE-BOUND-PACKET-FOR-B; printf '%s\n' "$B700" | grep -qF ' B=—&gt;' || echo EVE-B-RECORDED-WHILE-STILL-IN-FLIGHT; printf '%s\n' "$R" | grep -F 's6+700' | grep -qF ' PK0 EVE&lt;A=8 B=—&gt;' || echo REDUCED-MOTION-A-NOT-RECORDED; printf '%s\n' "$R" | grep -F 's7+700' | grep -qF ' PK0 EVE&lt;A=8 B=19&gt;' || echo REDUCED-MOTION-B-NOT-RECORDED; rm -f "$H"; test -f "$H" &amp;&amp; echo HARNESS-NOT-CLEANED; echo EVE-TRAVEL-CHECKED</automated>
  </verify>
  <done>
    - Every gate above ends with its sentinel (`SCRIPT-PARSES`, `MATH-STILL-OK`, `WIRING-CHECKED`, `FILE-SWEPT`, `INSTANT-PATH-CHECKED`, `EVE-TRAVEL-CHECKED`) and prints no line prefixed `MISSING`, `NO-`, `EVE-A-`, `EVE-B-`, `EVE-REVEAL-`, `TAPPED-LAUNCH-COUNT`, `CANCELPACKETS-`, `EVE-SWATCH-COUNT`, `NAV-COUNT`, `INSTANT-`, `SVG-EVE-`, `LEFTOVER-PACKETS`, `REDUCED-MOTION-`, `HARNESS-`, `FILE-LITERAL`, `NAMED-COLOR` or `LOCAL-TOKEN`.
    - Both wire sends now put a warn-tinted copy down Eve's tap line, and neither value appears in her notebook until its copy lands.
    - The two wire-step captions describe the tap copying the value as it passes, and the legend's Eve entry accounts for the siphoned copy.
    - All ten step ids, the ten-step count, the AES closing sentence and the both-sides-agree property are unchanged.
  </done>
  <reversibility rating="reversible">Same single file as Task 1; the caption and legend edits are text-only and the B leg is a mirror of an already-proven mechanism.</reversibility>
</task>

</tasks>

<threat_model>
`workflow.security_enforcement` is active for this project (ASVS level 1, block on high), so this block is mandatory. It is short because the change genuinely has no attack surface.

This item is a purely visual/animation change to a client-side educational demo. It adds no input handling (no new field, no new parser, no new `readInputs` branch), no new data source, no network call, no storage key or persisted field, no new dependency, and no real cryptography — the page's own copy states it is a teaching demo using `Math.random` for private exponents and displays the raw shared secret rather than deriving a key. Everything the new code moves is a value the page already computes and already displays; the change alters only *when* and *along what path* an already-public number becomes visible. There is no privilege boundary in a single static file loaded over `file://` with no backend.

## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| *(none introduced)* | The only pre-existing boundary is the user's own keyboard into the p/g/a/b fields, which this plan does not touch. All values animated are already rendered on the page by the unchanged instant path. |

## STRIDE Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation Plan |
|-----------|----------|-----------|----------|-------------|-----------------|
| T-mbn-01 | Information disclosure | The siphoned packet's label | low | accept | The packet carries `shortVal()` of a public value the page already prints in Eve's box, her notebook and the arithmetic log. Nothing private (a, b, or the shared secret) is ever passed to a packet, and the plan forbids it: only `ex.publicAlice` and `ex.publicBob` are launched. |
| T-mbn-02 | Denial of service | Unbounded packet accumulation from repeated Build/Reset/Step | low | mitigate | `cancelPackets()` cancels every pending timer and frame and removes every packet node, and is called from `resetPlayback()`, `rebuild()` and `instantFinish()`. The generation guard is retained as a second line of defence. Task 1's `LEFTOVER-PACKETS` gate asserts the stage carries zero packet nodes on a settled page. |
| T-mbn-03 | Tampering | Package-manager installs | n/a | n/a | None. No `npm`/`pip`/`cargo` install, no `package.json`, no new external resource — the file stays self-contained per NAV-02, so the package-legitimacy gate does not apply. |

No threat is rated medium or above, so the `security_block_on: high` threshold is not engaged.
</threat_model>

<verification>
Run both tasks' `<automated>` gates again after the final commit, in task order, and confirm each ends with its sentinel and emits none of the failure prefixes its `<done>` lists.

Then the one thing no gate can judge — whether the interception *reads* right:

<human-check>
Open `Diffie-Hellman Key Exchange/diffie-hellman-key-exchange.html` in a browser, press Reset, then Play at the default `brisk` speed and watch the two send steps. Confirm: the copy visibly peels off the wire at the tap rather than appearing at Eve's end; it travels along the dashed tap line, not beside it; it lands on the notebook row it then fills; and the value appears in Eve's notebook when the copy arrives, not before. Then drag the speed slider to `glacial` and to `blazing` and step through both sends at each end of the range, confirming the siphon is legible at slow speed and that nothing in Eve's notebook flickers back to a dash at fast speed. Finally press Build exchange and Reset mid-flight and confirm no packet is left stranded on the stage.
</human-check>

`workflow.human_verify_mode` is `end-of-phase`, so this is a `<human-check>` at verification time, not a blocking checkpoint task inside `<tasks>`.
</verification>

<success_criteria>
- Both wire sends spawn a second, warn-tinted packet that starts where Eve's tap meets the wire and travels down that tap line into her notebook box.
- Neither `A` nor `B` appears in Eve's notebook (or in her row on the stage) until its siphoned copy lands; the headless gate proves the value still reads as a dash while the copy is in flight.
- The Alice→Bob and Bob→Alice wire packets are unchanged in start point, end point, label, easing and duration.
- Page load, Instant and Reset-then-Instant still produce a fully populated notebook (p, g, A, B) with zero packets left on the stage.
- `prefers-reduced-motion: reduce` animates nothing and records both values at their send steps.
- Reset and Build exchange mid-flight leave no stranded packet and no stale callback writing to the rebuilt stage.
- The file declares no literal color, still carries exactly eight nav links with one active, and remains one self-contained HTML file with no new external dependency (NAV-02, PAL-02, PAL-04).
- All ten step ids, the ten-step count, the AES closing sentence and the both-sides-agree property survive unchanged.
</success_criteria>

<output>
Create `.planning/quick/260926-mbn-in-the-diffie-hellman-key-exchange-tool-when-public-exponent/260926-mbn-SUMMARY.md` when done.
</output>
