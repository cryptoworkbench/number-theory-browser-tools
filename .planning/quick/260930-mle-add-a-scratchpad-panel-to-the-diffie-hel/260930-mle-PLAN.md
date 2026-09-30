---
phase: quick-260930-mle
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - "Diffie-Hellman Key Exchange/diffie-hellman-key-exchange.html"
  - "RSA/rsa.html"
autonomous: true
requirements: [QUICK-260930-mle]

estimate:
  tokens: 90000
  raw_tokens: 45000
  tasks: 3
  confidence: low

must_haves:
  truths:
    - "Opening the Diffie-Hellman tool shows a fixed reference panel pinned to the bottom-RIGHT of the viewport listing the public group (p, g, order of g)."
    - "Once the animation reaches Alice's and Bob's public-value steps, the panel also lists A = g^a mod p and B = g^b mod p."
    - "Stepping the DH animation from Reset reveals the panel's rows one at a time, at exactly the steps whose diagram/log entries display those same values."
    - "Pressing Reset (or Build exchange) hides every panel row and the panel itself before the run replays."
    - "The RSA tool's public-key panel sits at the bottom-RIGHT of the viewport, the same distance from the bottom edge as before."
    - "Neither modified file's <style> block contains a literal color (no hex, rgb()/rgba(), hsl()/hsla(), or named color)."
  artifacts:
    - "Diffie-Hellman Key Exchange/diffie-hellman-key-exchange.html (new #dh-scratchpad aside + .scratchpad CSS block + fill/clear JS)"
    - "RSA/rsa.html (.pubkey-scratchpad mirrored to the right edge)"
  key_links:
    - "renderStep() is the single funnel both advanceOne() (Play/Step) and revealAll() (Instant/Build) pass through — the scratchpad fills MUST hang off its existing 'agree' / 'aliceComputesPublic' / 'bobComputesPublic' cases. Hanging them off advanceOne() instead would leave the panel empty after Instant or Build exchange."
    - "rebuild() does NOT call resetPlayback() — the two functions clear mathLog/eveNotebook independently (lines ~938 and ~988). clearScratchpad() must be called from BOTH or a stale row survives a rebuild."
    - "The party row colour tokens must match the tool's own legend swatches (.legend .swatch.alice = var(--role-alt), .swatch.bob = var(--role-input)), which is already the same Alice/Bob role mapping RSA's .scratch-who.alice/.bob uses — the two panels stay visually consistent for free."
---

<objective>
Give the Diffie-Hellman Key Exchange tool a pinned, read-only scratchpad panel modelled on the RSA tool's public-key panel, fed by the animation's own step funnel, and move the RSA panel from the left edge to the right edge so both tools pin their scratchpad to the same corner.

Purpose: the DH animation scrolls its arithmetic log off-screen as it advances, so the public group parameters and the two public values are no longer visible at the moment the learner needs them to follow the next step. A pinned panel keeps them in view. Mirroring RSA's panel to the right makes the two tools read as one system.
Output: a new `#dh-scratchpad` aside (markup + CSS + fill/clear JS) in the DH tool, and a one-property positional change in the RSA tool.
</objective>

<execution_context>
@~/.claude/gsd-core/workflows/execute-plan.md
@~/.claude/gsd-core/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@CLAUDE.md
@.claude/CLAUDE.md

@RSA/rsa.html
@Diffie-Hellman Key Exchange/diffie-hellman-key-exchange.html
@assets/palette.css
</context>

<interface_context>

**RSA/rsa.html — the component being mirrored (read before Task 1):**
- CSS: `/* ---------- Public-key reference panel ---------- */` block, lines 164–208. Rule set is `.app{padding-bottom}`, `.pubkey-scratchpad` (fixed, horizontal + `bottom:` offsets, z-index 900, width, max-height, overflow, radius, padding, `background:var(--surface)`, `border:1px solid color-mix(in srgb, var(--role-result) 35%, transparent)`, `box-shadow:0 8px 24px var(--overlay)`, `pointer-events:none`, `user-select:none`, `opacity:0`, `visibility:hidden`, `transform:translateY(8px)`, transition), `.pubkey-scratchpad.is-shown`, `.scratch-title`, `.scratch-row`, `.scratch-row.is-shown`, `.scratch-row.is-shown ~ .scratch-row.is-shown`, `.scratch-who`, `.scratch-who.bob`, `.scratch-who.alice`, `.scratch-kv`, then three media queries (`max-width:640px` shrink, `max-width:380px`/`max-height:400px` hide, `prefers-reduced-motion` de-animate).
- Markup: `<aside id="pubkey-scratchpad" class="pubkey-scratchpad" aria-hidden="true">` at lines 326–339, sitting AFTER the closing `</div>` of `.app` and BEFORE `<script>`. Inner shape: one `.scratch-title`, then one `.scratch-row` per party containing a `.scratch-who` label span and N `.scratch-kv` value spans.
- JS: `scratchNum(x)` (lines 911–916) — formats a BigInt via `fmt()`, and if the formatted string exceeds 30 chars returns `first8…last8 (digitCount)` instead. `updateScratchpad()` (939–954) toggles `is-shown` per row, writes each value with `textContent`, and toggles `is-shown` on the container iff any row is shown.

**Diffie-Hellman Key Exchange/diffie-hellman-key-exchange.html — the insertion points (read before Task 1):**
- `fmt(x)` (line 310) — BigInt → comma-grouped string. Already present; do not redefine it.
- `shortVal(x)` (lines 390–393) — truncates at 12 chars for SVG labels. NOT suitable for the panel; the panel needs its own `scratchNum`.
- `buildExchange(p,g,a,b)` returns `{ p, g, a, b, publicAlice, publicBob, secretAlice, secretBob, order, steps }` (line 413). `order` is the multiplicative order of g mod p, or `null` when p−1 did not fully factor in-browser (see `multiplicativeOrder`, line 377).
- `renderStep(step, ex, suppressEve)` (lines 654–701) — `switch(step.id)` with existing cases `agree`, `alicePicks`, `bobPicks`, `aliceComputesPublic`, `bobComputesPublic`, `sendAliceToBob`, `sendBobToAlice`, `aliceComputesSecret`, `bobComputesSecret`, `match`.
- `resetPlayback()` (lines 930–947) — clears `mathLog.innerHTML`, `eveNotebook.innerHTML`, `eveProblem`, `aesLine`.
- `rebuild()` (lines 975–999) — separately clears the same four, then calls `instantFinish()` → `revealAll()` → `renderStep()` for every step.
- Step order in the `steps` array (lines 402–411): index 0 `agree`, 1 `alicePicks`, 2 `bobPicks`, 3 `aliceComputesPublic`, 4 `bobComputesPublic`, 5 `sendAliceToBob`, …
- The `<style>` block ends at line 155 with a single `@media (max-width:640px)` rule; `.app` is defined at line 32.
- Body structure: `<div class="app">` opens at line 198 and closes at line 294, immediately before the script.
- Default preset (lines 221–224): p=23, g=5, a=6, b=15 → A=8, B=19, order(g)=22.

**assets/palette.css — tokens this plan consumes (all already declared in both themes):**
`--surface`, `--overlay`, `--panel-border`, `--text`, `--text-dim`, `--role-result`, `--role-input` (Bob), `--role-alt` (Alice).
</interface_context>

<tasks>

<task type="tracer" tdd="true">
  <name>Task 1: End-to-end DH scratchpad — public-group row only</name>
  <files>Diffie-Hellman Key Exchange/diffie-hellman-key-exchange.html</files>
  <read_first>
    RSA/rsa.html lines 164–208 (CSS block), 326–339 (aside markup), 911–954 (scratchNum + updateScratchpad).
    Diffie-Hellman Key Exchange/diffie-hellman-key-exchange.html lines 28–40 (.app rule), 145–155 (end of style block), 285–295 (end of .app div), 654–701 (renderStep), 930–947 (resetPlayback), 975–999 (rebuild).
  </read_first>
  <behavior>
    - On load (rebuild auto-reveals the whole run), the panel is visible and its public-group row reads p = 23, g = 5, order(g) = 22 for the default preset.
    - After pressing Reset, the panel and its row are both un-shown (the `is-shown` class is absent from both).
    - After Reset then one press of Step (which renders the `agree` step), the panel and its public-group row are shown again with the same three values.
    - The panel's right edge sits within 20px of the viewport's right edge, and its bottom edge within 20px of the viewport's bottom edge, at an 800x600 viewport.
    - When `ex.order` is null, the order line reads `order(g) = unknown` rather than `order(g) = null`.
  </behavior>
  <action>
    Wire one complete path — markup, CSS, fill, clear — for a single row, so the fixed-panel geometry and the reveal mechanism are proven before more rows are added.

    (1) MARKUP. Directly after the closing tag of `div.app` and before the `<script>` tag, add an `aside` with id `dh-scratchpad`, class `scratchpad`, and `aria-hidden="true"`. Precede it with an HTML comment stating that it duplicates values already announced by the arithmetic log, which is why it is hidden from the accessibility tree — the same rationale RSA's aside carries. Inside: one `div.scratch-title` reading `Public values — for reference`, then one `div.scratch-row` with id `scratch-row-group` containing a `span.scratch-who.group` reading `Public group` and three empty `span.scratch-kv` elements with ids `scratch-group-p`, `scratch-group-g`, `scratch-group-order`. Author the class attribute before the id attribute on the row, matching RSA, and give the row no class other than `scratch-row` so the runtime result is exactly `class="scratch-row is-shown"`.

    (2) CSS. Append a new `/* ---------- Public values reference panel ---------- */` section at the end of the `<style>` block, after the existing `@media (max-width:640px)` rule at line 151. Copy RSA's rule set property-for-property with these deltas: the container selector is `.scratchpad` (not `.pubkey-scratchpad`) because this panel holds group parameters and public values, not keys; the horizontal offset property is `right`, using the identical `clamp(8px, 2vw, 16px)` value and the identical `bottom` offset (Task 3 mirrors RSA to the same edge); add `.scratch-who.group{ color:var(--text-dim); }` alongside the `.bob` and `.alice` variants — the group row is a heading, not a participant, so it takes the neutral dim token rather than a participant role token. Keep every inner class name verbatim: `scratch-title`, `scratch-row`, `scratch-row.is-shown`, the `~` sibling-divider rule, `scratch-who`, `scratch-kv`, and the `is-shown` state class. Keep all three media queries verbatim. Declare no literal colour — every colour is a `var()` or a `color-mix()` over the tokens named in `<interface_context>`. Also append a `.app{ padding-bottom:240px; }` rule: 240px is the panel's `max-height` ceiling (220px) plus its maximum bottom offset (16px) plus a small margin, so the fixed panel can never sit over the footer's text at any scroll position.

    (3) FILL. Add a `/* ---------- Public values reference panel ---------- */` JS section immediately before the `/* ---------- playback ---------- */` marker at line 710. Define `scratchNum(x)` by duplicating RSA's implementation verbatim (per this repo's deliberate per-file duplication of helpers — do not factor it into a shared module); it already depends only on this file's existing `fmt`. Define `showScratchRow(id)` which looks up `scratch-row-{id}` and adds `is-shown` to it, then adds `is-shown` to `dh-scratchpad`; every element is looked up fresh by id on each call rather than cached at module scope, so the function survives any future innerHTML replacement of the panel. Define `clearScratchpad()` which removes `is-shown` from `dh-scratchpad` and from every `.scratch-row` inside it, and blanks every `.scratch-kv` `textContent`. In `renderStep`'s existing `case 'agree':` branch — after the existing `renderNotebook(ex)` call and before its `break` — write the three values with `textContent` (never `innerHTML`): `p = ` + scratchNum(ex.p), `g = ` + scratchNum(ex.g), and `order(g) = ` + (ex.order === null ? 'unknown' : scratchNum(ex.order)); then call `showScratchRow('group')`. Placing the fill inside `renderStep` (not `advanceOne`) is load-bearing: `revealAll` — the path Instant and Build exchange take — calls `renderStep` directly and never touches `advanceOne`.

    (4) CLEAR. Call `clearScratchpad()` from `resetPlayback()` next to its `mathLog.innerHTML = '';` line, AND from `rebuild()` next to its own separate `mathLog.innerHTML = '';` line. Both call sites are required: `rebuild()` does not delegate to `resetPlayback()`.

    Do not alter any existing DH behaviour: no change to the SVG stage, the arithmetic log, Eve's notebook, the playback engine, or the persisted state shape.
  </action>
  <verify>
    <automated>
# run from repo root
set -e
DH="Diffie-Hellman Key Exchange/diffie-hellman-key-exchange.html"
OUT="$(mktemp -d)"
DUMP(){ google-chrome --headless --disable-gpu --no-sandbox --window-size=800,600 \
  --user-data-dir="$(mktemp -d)" --virtual-time-budget=4000 --dump-dom "$1" > "$2"; }
HARNESS(){ python3 - "$DH" "Diffie-Hellman Key Exchange/.harness-$1.html" "$2" <<'PY'
import sys
src,dst,drv = sys.argv[1],sys.argv[2],sys.argv[3]
h = open(src,encoding='utf-8').read()
i = h.rindex('</body>')
open(dst,'w',encoding='utf-8').write(h[:i] + '<script>' + drv + '</script>\n' + h[i:])
PY
DUMP "file://$PWD/Diffie-Hellman%20Key%20Exchange/.harness-$1.html" "$OUT/$1.html"; }

# A. load state — rebuild() auto-reveals, so the group row must be populated and shown
DUMP "file://$PWD/Diffie-Hellman%20Key%20Exchange/diffie-hellman-key-exchange.html" "$OUT/load.html"

# B. Reset must un-show the panel   C. geometry: force shown, report viewport gaps via title
HARNESS reset "document.getElementById('resetBtn').click();"
HARNESS geom  "var e=document.getElementById('dh-scratchpad');e.classList.add('is-shown');var r=e.getBoundingClientRect();document.title='GAPR='+Math.round(innerWidth-r.right)+' GAPL='+Math.round(r.left)+' GAPB='+Math.round(innerHeight-r.bottom);"

node -e '
const fs=require("fs"), dir=process.argv[1];
const pad = f => { const d=fs.readFileSync(dir+"/"+f,"utf8");
  const m=d.match(/<aside[^>]*id="dh-scratchpad"[\s\S]*?<\/aside>/);
  if(!m) throw new Error(f+": #dh-scratchpad aside not found"); return m[0]; };
const load=pad("load.html");
for(const t of ["p = 23","g = 5","order(g) = 22"])
  if(!load.includes(t)) throw new Error("load: scratchpad missing "+t);
if(!load.includes("scratch-row-group")) throw new Error("load: group row absent");
if(!/class="scratch-row is-shown"/.test(load)) throw new Error("load: group row not revealed");
if(!/id="dh-scratchpad"[^>]*is-shown|is-shown[^>]*id="dh-scratchpad"/.test(load))
  throw new Error("load: panel container not revealed");
const rst=pad("reset.html");
if(/is-shown/.test(rst)) throw new Error("reset: is-shown survived Reset -> "+rst);
const title=fs.readFileSync(dir+"/geom.html","utf8").match(/<title>([^<]*)<\/title>/)[1];
const g=Object.fromEntries(title.trim().split(/\s+/).map(s=>s.split("=")).map(([k,v])=>[k,+v]));
if(!(g.GAPR<=20)) throw new Error("panel not pinned to the right edge: "+title);
if(!(g.GAPB<=20)) throw new Error("panel not pinned to the bottom edge: "+title);
if(!(g.GAPL>=200)) throw new Error("panel still hugging the opposite edge: "+title);
console.log("OK",title);' "$OUT"

rm -f "Diffie-Hellman Key Exchange/.harness-reset.html" "Diffie-Hellman Key Exchange/.harness-geom.html"

# D. no literal colour anywhere in the DH style block
node -e '
const fs=require("fs");
const h=fs.readFileSync(process.argv[1],"utf8");
const css=h.slice(h.indexOf("<style>"),h.indexOf("</style>"));
const m=css.match(/#[0-9a-fA-F]{3,8}\b|\brgba?\(|\bhsla?\(/g);
if(m) throw new Error("literal colour(s) in DH style block: "+m.join(", "));
console.log("OK no literal colours");' "$DH"
    </automated>
    <human-check>Open the DH tool. The reference panel is pinned bottom-right and lists p, g and order(g). Press Reset — it disappears. Press Step once — it returns. Press Play — it stays put while the diagram animates.</human-check>
  </verify>
  <done>The DH tool renders a fixed bottom-right panel whose public-group row fills at the `agree` step via `renderStep`, clears on both Reset and Build exchange, survives Instant and Play identically, and introduces no literal colour.</done>
</task>

<task type="auto" tdd="true">
  <name>Task 2: Expand the DH scratchpad with Alice's and Bob's public exponentiation results</name>
  <files>Diffie-Hellman Key Exchange/diffie-hellman-key-exchange.html</files>
  <read_first>
    Diffie-Hellman Key Exchange/diffie-hellman-key-exchange.html — the `aside#dh-scratchpad` markup, the `.scratchpad` CSS section, and the `showScratchRow`/`clearScratchpad` helpers added by Task 1; plus `renderStep` cases `aliceComputesPublic` and `bobComputesPublic` (lines ~672–677 pre-Task-1).
  </read_first>
  <behavior>
    - On load, the panel shows three rows: public group, Alice, Bob. Alice's row reads `A = g^a mod p = 8` and Bob's reads `B = g^b mod p = 19` for the default preset.
    - After Reset then 3 presses of Step (agree, alicePicks, bobPicks), only the public-group row is shown.
    - After a 4th press of Step (aliceComputesPublic), Alice's row is also shown; after a 5th (bobComputesPublic), Bob's row is too.
    - Rows appear in document order group → Alice → Bob regardless of which step revealed them, and adjacent revealed rows are separated by the existing `.scratch-row.is-shown ~ .scratch-row.is-shown` divider rule.
  </behavior>
  <action>
    Expand the proven single-row panel outward; change nothing about the geometry, the reveal mechanism, or the clear path established in Task 1.

    (1) MARKUP. Inside `aside#dh-scratchpad`, after the existing public-group row, add two more `div.scratch-row` elements with ids `scratch-row-alice` and `scratch-row-bob`. Alice's contains a `span.scratch-who.alice` reading `Alice` and one empty `span.scratch-kv` with id `scratch-alice-a`; Bob's contains a `span.scratch-who.bob` reading `Bob` and one empty `span.scratch-kv` with id `scratch-bob-b`. Author them in that document order so the panel reads top-to-bottom group → Alice → Bob, and author `class` before `id` on each, matching the group row.

    (2) CSS. The `.scratch-who.alice` and `.scratch-who.bob` rules already exist from Task 1's verbatim copy of RSA's rule set — confirm their tokens are `var(--role-alt)` for Alice and `var(--role-input)` for Bob, which is the same mapping this tool's own legend swatches already use. Add no new CSS.

    (3) FILL. In `renderStep`'s existing `case 'aliceComputesPublic':` branch, after the existing `showRow` call and before its `break`, set `scratch-alice-a`'s `textContent` (never `innerHTML`) to `A = g^a mod p = ` + scratchNum(ex.publicAlice), then call `showScratchRow('alice')`. Do the same in `case 'bobComputesPublic':` for `scratch-bob-b` with `B = g^b mod p = ` + scratchNum(ex.publicBob) and `showScratchRow('bob')`. Use the same `showScratchRow` helper Task 1 defined — do not add a second reveal path. `clearScratchpad()` already iterates every `.scratch-row` and every `.scratch-kv` inside the panel, so it covers the two new rows with no edit.

    Do NOT add rows for the two shared-secret steps (`aliceComputesSecret`, `bobComputesSecret`): the shared secret is precisely the value that never becomes public, and pinning it beside the public values would undercut the lesson the tool exists to teach.
  </action>
  <verify>
    <automated>
# run from repo root
set -e
DH="Diffie-Hellman Key Exchange/diffie-hellman-key-exchange.html"
OUT="$(mktemp -d)"
DUMP(){ google-chrome --headless --disable-gpu --no-sandbox --window-size=800,600 \
  --user-data-dir="$(mktemp -d)" --virtual-time-budget=4000 --dump-dom "$1" > "$2"; }
HARNESS(){ python3 - "$DH" "Diffie-Hellman Key Exchange/.harness-$1.html" "$2" <<'PY'
import sys
src,dst,drv = sys.argv[1],sys.argv[2],sys.argv[3]
h = open(src,encoding='utf-8').read()
i = h.rindex('</body>')
open(dst,'w',encoding='utf-8').write(h[:i] + '<script>' + drv + '</script>\n' + h[i:])
PY
DUMP "file://$PWD/Diffie-Hellman%20Key%20Exchange/.harness-$1.html" "$OUT/$1.html"; }

DUMP "file://$PWD/Diffie-Hellman%20Key%20Exchange/diffie-hellman-key-exchange.html" "$OUT/load.html"
HARNESS s3 "var r=document.getElementById('resetBtn'),s=document.getElementById('stepBtn');r.click();for(var i=0;i<3;i++)s.click();"
HARNESS s4 "var r=document.getElementById('resetBtn'),s=document.getElementById('stepBtn');r.click();for(var i=0;i<4;i++)s.click();"
HARNESS s5 "var r=document.getElementById('resetBtn'),s=document.getElementById('stepBtn');r.click();for(var i=0;i<5;i++)s.click();"

node -e '
const fs=require("fs"), dir=process.argv[1];
const pad = f => { const d=fs.readFileSync(dir+"/"+f,"utf8");
  const m=d.match(/<aside[^>]*id="dh-scratchpad"[\s\S]*?<\/aside>/);
  if(!m) throw new Error(f+": #dh-scratchpad aside not found"); return m[0]; };
const shown = s => (s.match(/class="scratch-row is-shown"/g)||[]).length;
const rowOf = (s,id) => { const m=s.match(new RegExp("<div[^>]*"+id+"[^>]*>[\\s\\S]*?</div>"));
  if(!m) throw new Error("row "+id+" missing"); return m[0]; };
const isShown = (s,id) => new RegExp("<div[^>]*"+id+"[^>]*is-shown|is-shown[^>]*"+id).test(s);

const load=pad("load.html");
if(shown(load)!==3) throw new Error("load: expected 3 revealed rows, got "+shown(load));
if(!rowOf(load,"scratch-row-alice").includes("A = g^a mod p = 8"))
  throw new Error("load: Alice row wrong -> "+rowOf(load,"scratch-row-alice"));
if(!rowOf(load,"scratch-row-bob").includes("B = g^b mod p = 19"))
  throw new Error("load: Bob row wrong -> "+rowOf(load,"scratch-row-bob"));
const order=["scratch-row-group","scratch-row-alice","scratch-row-bob"].map(id=>load.indexOf(id));
if(!(order[0]<order[1] && order[1]<order[2])) throw new Error("rows out of document order");

const s3=pad("s3.html"), s4=pad("s4.html"), s5=pad("s5.html");
if(shown(s3)!==1) throw new Error("after 3 steps expected only the group row, got "+shown(s3));
if(isShown(s3,"scratch-row-alice")) throw new Error("Alice revealed too early");
if(shown(s4)!==2 || !isShown(s4,"scratch-row-alice")) throw new Error("after 4 steps Alice must be revealed, got "+shown(s4));
if(isShown(s4,"scratch-row-bob")) throw new Error("Bob revealed too early");
if(shown(s5)!==3 || !isShown(s5,"scratch-row-bob")) throw new Error("after 5 steps Bob must be revealed, got "+shown(s5));

// the value that must never be pinned: the shared secret (2 for the default preset)
if(/secret/i.test(load)) throw new Error("shared secret leaked into the public-values panel");
console.log("OK");' "$OUT"

rm -f "Diffie-Hellman Key Exchange/.harness-s3.html" "Diffie-Hellman Key Exchange/.harness-s4.html" "Diffie-Hellman Key Exchange/.harness-s5.html"
    </automated>
    <human-check>Open the DH tool, press Reset, then Step repeatedly. The panel gains Alice's A line at "Alice computes her public value" and Bob's B line at "Bob computes his public value" — the same moments those values appear in the diagram and the arithmetic log. Press Instant from a fresh Reset: all three rows appear at once.</human-check>
  </verify>
  <done>The DH panel lists the public group and both public exponentiation results, each revealed at exactly the animation step that displays it, through Play, Step, Instant and Build exchange alike; the shared secret is never shown there.</done>
</task>

<task type="auto">
  <name>Task 3: Mirror the RSA public-key panel to the right edge</name>
  <files>RSA/rsa.html</files>
  <read_first>RSA/rsa.html lines 164–208 (the `.pubkey-scratchpad` rule set and its three media queries).</read_first>
  <behavior>
    - At an 800x600 viewport, the RSA panel's right edge is within 20px of the viewport's right edge and its left edge is at least 200px from the viewport's left edge.
    - Its bottom edge is within 20px of the viewport's bottom edge — unchanged from before.
    - Its width, max-height, padding, colours, reveal transition and scroll-triggered `updateScratchpad` behaviour are all byte-identical to before.
  </behavior>
  <action>
    In the `.pubkey-scratchpad` rule (line ~173), rename the horizontal offset property to `right`, keeping the `clamp(8px, 2vw, 16px)` value and the property's position in the rule exactly as-is. This is a one-token edit: the property name changes, nothing else on the line does, and the `bottom` offset immediately below it is untouched so the panel keeps its existing vertical position.

    Change nothing else in the file. Do not touch the aside markup, `scratchNum`, `hasReachedChosenE`, `updateScratchpad`, `initScratchpad`, the `.app{padding-bottom}` rule, or any of the three media queries — none of them constrain the horizontal edge. Do not add a comment to this rule and do not name the previous property anywhere in the file: the mirrored placement is self-evident from the property itself, and prose naming the old declaration would defeat this task's own static gate.
  </action>
  <verify>
    <automated>
# run from repo root
set -e
OUT="$(mktemp -d)"

# static: the horizontal offset now pins the opposite edge, and nothing in the file pins the old one
test "$(grep -c 'left:clamp' RSA/rsa.html)" = "0" || { echo "FAIL: an old-edge clamp offset remains"; exit 1; }
test "$(grep -c 'right:clamp' RSA/rsa.html)" = "1" || { echo "FAIL: expected exactly one right-edge clamp offset"; exit 1; }
test "$(grep -c 'bottom:clamp(8px, 2vw, 16px)' RSA/rsa.html)" = "1" || { echo "FAIL: vertical offset changed"; exit 1; }

# behavioural: measure the panel's real viewport gaps
python3 - RSA/rsa.html RSA/.harness-geom.html \
  "var e=document.getElementById('pubkey-scratchpad');e.classList.add('is-shown');var r=e.getBoundingClientRect();document.title='GAPR='+Math.round(innerWidth-r.right)+' GAPL='+Math.round(r.left)+' GAPB='+Math.round(innerHeight-r.bottom);" <<'PY'
import sys
src,dst,drv = sys.argv[1],sys.argv[2],sys.argv[3]
h = open(src,encoding='utf-8').read()
i = h.rindex('</body>')
open(dst,'w',encoding='utf-8').write(h[:i] + '<script>' + drv + '</script>\n' + h[i:])
PY
google-chrome --headless --disable-gpu --no-sandbox --window-size=800,600 \
  --user-data-dir="$(mktemp -d)" --virtual-time-budget=4000 \
  --dump-dom "file://$PWD/RSA/.harness-geom.html" > "$OUT/geom.html"
rm -f RSA/.harness-geom.html

node -e '
const fs=require("fs");
const t=fs.readFileSync(process.argv[1]+"/geom.html","utf8").match(/<title>([^<]*)<\/title>/)[1];
const g=Object.fromEntries(t.trim().split(/\s+/).map(s=>s.split("=")).map(([k,v])=>[k,+v]));
if(!(g.GAPR<=20)) throw new Error("RSA panel not pinned to the right edge: "+t);
if(!(g.GAPL>=200)) throw new Error("RSA panel still hugging the opposite edge: "+t);
if(!(g.GAPB<=20)) throw new Error("RSA panel vertical position moved: "+t);
console.log("OK",t);' "$OUT"

# unchanged elsewhere: exactly one line differs from HEAD
test "$(git diff --numstat -- RSA/rsa.html | awk '{print $1"/"$2}')" = "1/1" \
  || { echo "FAIL: expected a single-line change; got $(git diff --numstat -- RSA/rsa.html)"; exit 1; }

# no literal colour introduced
node -e '
const fs=require("fs");
const h=fs.readFileSync("RSA/rsa.html","utf8");
const css=h.slice(h.indexOf("<style>"),h.indexOf("</style>"));
const m=css.match(/#[0-9a-fA-F]{3,8}\b|\brgba?\(|\bhsla?\(/g);
if(m) throw new Error("literal colour(s) in RSA style block: "+m.join(", "));
console.log("OK no literal colours");'
    </automated>
    <human-check>Open the RSA tool, generate Bob's and Alice's keys, and scroll until each chosen-e line becomes readable. The reference panel appears in the bottom-RIGHT corner, at the same height above the bottom edge as before, with identical content and reveal timing. Open the DH tool in another tab — its panel sits in the same corner at the same offsets.</human-check>
  </verify>
  <done>RSA's public-key panel is pinned to the bottom-right at the same vertical offset, via a single-line change, with its content, reveal logic and styling otherwise untouched.</done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| user text input → page DOM | `pInput` / `gInput` / `aInput` / `bInput` are free-text fields whose values are parsed and then re-rendered into the page; the new panel is an additional render sink for those values. |

## STRIDE Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation Plan |
|-----------|----------|-----------|----------|-------------|-----------------|
| T-mle-01 | Tampering | `renderStep` scratchpad fills, DH tool | low | mitigate | Every panel value is written with `textContent`, never `innerHTML` — explicitly required in Tasks 1 and 2. Values also pass through `parseBigIntStrict` → BigInt → `fmt` before reaching the panel, so no attacker-controlled string can reach it, but `textContent` keeps the sink inert regardless. |
| T-mle-02 | Information disclosure | DH shared-secret steps | low | mitigate | The shared secret is deliberately excluded from the panel (Task 2 action plus a negative gate asserting no secret text inside the aside); the panel is labelled and scoped to public values only, so the tool cannot appear to teach that the secret is public. |
| T-mle-03 | Denial of service | fixed-position overlay covering page controls | low | mitigate | Panel carries `pointer-events:none` and `user-select:none` (inherited verbatim from RSA's rule set), plus a `.app{padding-bottom:240px}` reserve and a `max-width:380px`/`max-height:400px` hide rule, so it can never occlude or swallow clicks on the tool's own controls. |
| T-mle-SC | Tampering | npm/pip/cargo installs | high | accept | No package-manager installs in this plan — this repo has no package manager, no `package.json`, and no build step; all three tasks edit existing self-contained HTML files. No new external resource of any kind is added. |
</threat_model>

<verification>
Run from repo root, after all three tasks:

1. Both files still open standalone: `google-chrome --headless --disable-gpu --no-sandbox --dump-dom "file://$PWD/RSA/rsa.html" | grep -c pubkey-scratchpad` is non-zero, and the DH equivalent for `dh-scratchpad` likewise.
2. No harness leftovers: `git status --porcelain` shows only the two intended files modified — no `.harness-*.html` survives in `RSA/` or `Diffie-Hellman Key Exchange/`.
3. No external dependency added: the only hosts referenced in the DH file are `fonts.googleapis.com`, `fonts.gstatic.com` and `www.w3.org` — `grep -oE 'https?://[a-z.]+' "Diffie-Hellman Key Exchange/diffie-hellman-key-exchange.html" | sort -u` lists nothing else.
4. No shared JS/CSS module introduced: `ls assets/` is unchanged, and `grep -c 'function scratchNum' RSA/rsa.html "Diffie-Hellman Key Exchange/diffie-hellman-key-exchange.html"` reports 1 for each file (per-file duplication, per repo convention).
5. Both panels pin to the same corner: Task 1's and Task 3's geometry harnesses both report `GAPR<=20` and `GAPB<=20`.
6. Both themes render: flip the day/night toggle on each tool with the panel visible and confirm the panel's border, title and value text all recolour with the theme and stay legible (human-check; no literal colour means this follows from the token layer, but confirm once).
</verification>

<success_criteria>
- The DH tool has a pinned bottom-right reference panel showing the public multiplicative group (p, g, order of g) and both public exponentiation results (A, B), each written at the same animation step that first displays it.
- The panel clears on Reset and on Build exchange, and fills correctly through Play, Step, Instant and initial load alike.
- RSA's public-key panel is pinned bottom-right at its original vertical offset, with unchanged content and reveal logic.
- Both files remain single self-contained HTML tools: no new external dependency, no shared JS module, no literal colour in either `<style>` block.
</success_criteria>

<output>
Create `.planning/quick/260930-mle-add-a-scratchpad-panel-to-the-diffie-hel/260930-mle-SUMMARY.md` when done.
</output>
