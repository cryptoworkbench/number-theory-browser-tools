---
phase: quick-261010-qmt
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - Cyclic Groups/cyclic-groups.html
  - assets/i18n/cyclic-groups.js
autonomous: true
requirements: [QUICK-QMT-01]

estimate:
  tokens: 70000
  raw_tokens: 70000
  tasks: 2
  confidence: low

must_haves:
  truths:
    - "The Cyclic Groups page has no Additive Groups / Multiplicative Groups tab strip any more. One page view serves both operations, and the Group panel starts with two editable rows styled like the facts below them, label on the left and control on the right: '% (modulus)' with a number input, then '∗ (group operation)' with a dropdown whose options are '+' (additive) and '×' (multiplicative)"
    - "Picking '×' or '+' in the operation dropdown switches the group exactly as the old tabs did. The diagram, facts, hints, subgroup list, isomorphic-group card, Cayley Table link, the address bar's mode= and the shared group-params store all follow, and the dropdown always shows the active operation, also after a ?mode= deep link, a storage event from another tab or tool, or a language switch"
    - "Typing a modulus in the '% (modulus)' row re-renders live without the input losing focus, because the input never sits inside the #facts list that render() rebuilds. A value outside 2..100 is clamped, and the existing clamped-value note shows on its own line under the row"
    - "The read-only modulus and Operation rows are gone from the facts list. Group, Cardinality, Identity, Generators and Structure remain, and the editable rows plus the facts read as one continuous table with dotted separators"
    - "Per the user's standing rule that Cyclic Groups strings are English-only, the one new visible string opLabelMath ('{op} (group operation)') exists in the en block only, and every other language shows it in English through NT.i18n's fallback. The dropdown's accessible name reuses the existing, fully translated 'Group operation' entry under a new key name (opSelectLabel), so in Dutch the select's aria-label is 'Groepsbewerking'"
    - "Day and night themes use palette tokens only, with no literal colours. In right-to-left languages the number input and the operation dropdown stay left to right, like the other notation controls"
  artifacts:
    - path: "Cyclic Groups/cyclic-groups.html"
      provides: "ul#group-controls (modulus row: label#n-label + input#n-input + p#n-note; operation row: label#op-label + select#op-select) above ul#facts; .facts.group-controls CSS; opSelectEl/opLabelEl wiring (change -> setMode, syncControls/setMode keep select.value = state.mode, renderNNote fills both row labels); mode tabs and their CSS/JS removed; renderFacts no longer emits the modulus and operation rows"
      contains: "id=\"op-select\""
    - path: "assets/i18n/cyclic-groups.js"
      provides: "en-only opLabelMath; the group-operation accessible-name key renamed to opSelectLabel in all 31 blocks; header comment updated"
      contains: "opLabelMath"
  key_links:
    - from: "select#op-select change event"
      to: "setMode(id)"
      via: "opSelectEl.addEventListener('change', ...) calls setMode(opSelectEl.value), which persists the shared group and calls render()"
      pattern: "setMode\\(opSelectEl\\.value\\)"
    - from: "syncControls() / setMode()"
      to: "select#op-select"
      via: "opSelectEl.value = state.mode, so the storage handler, loadState deep links and init all show the active operation"
      pattern: "opSelectEl\\.value = state\\.mode"
    - from: "render() -> renderNNote()"
      to: "label#n-label and label#op-label"
      via: "translateInto with cyclicGroups.nLabelMath / cyclicGroups.opLabelMath on every render, so onLangChange(render) re-labels both rows"
      pattern: "cyclicGroups\\.opLabelMath"
---

<objective>
Merge the Cyclic Groups tool's Additive and Multiplicative views into one page view (QUICK-QMT-01).

User request (verbatim): "Can you merge the multiplicative and additive views into one? It will work like this: The panel "GROUP" will no longer contain it's current field for the modulus (%), instead, I will be able to set the modulus in the '% (modulus) row. I will be able to set the group operation in a row with on the left '* (group operation)' and on the right a dropdown in which I can select between multiplicative and additive by selecting '+' or 'x' in a dropdown menu."

Purpose: the operation stops being a page-level tab and becomes one more parameter of the group, set next to the modulus. This matches how the group is written, ⟨ℤ/%ℤ, ∗⟩.

Output: `Cyclic Groups/cyclic-groups.html` (markup, CSS, JS) and `assets/i18n/cyclic-groups.js` (one en-only key, one key rename, header comment). Work stays on the current branch `cyclic-groups-merged-view`. Do not switch branches.
</objective>

<execution_context>
@~/.claude/gsd-core/workflows/execute-plan.md
@~/.claude/gsd-core/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@CLAUDE.md
@.claude/CLAUDE.md

<interfaces>
All line numbers are at HEAD 9f5b3ed. In `Cyclic Groups/cyclic-groups.html`, everything is closure-scoped in the page IIFE and none of it is an NT export.

CSS:
- Lines 58-63: the mode-tab comment line plus five `.mode-tabs` / `.mode-tab` rules.
- Lines 149-165: `.field` and `.field input, .field select` styling. Line 165 is the themed option rule `.field select option, .sub-order-prompt select option{ color:var(--text); background:var(--bg-1); }`.
- Lines 166-167: `.n-note{ font-size:.82rem; color:var(--role-warn); margin:8px 0 0; }` and `.n-note:empty{ display:none; }`.
- Lines 184-188: `.facts{...}`. `.facts li{ display:flex; flex-wrap:wrap; justify-content:space-between; gap:2px 12px; padding:5px 0; border-bottom:1px dotted var(--panel-border); font-size:.92rem; }`, `.facts li:last-child{ border-bottom:none; }`, then a comment line and `.facts.in-group{ margin-top:12px; padding-top:6px; border-top:1px solid var(--panel-border); }`.
- Lines 231-232: `.fact-label{ color:var(--text-dim); }`, `.fact-value{...}`.
- Line 89: `.panel h2{ ... margin:0 0 12px; }`.
- Line 440: the reduced-motion rule `.mode-tab, .action-btn, .legend, body{ transition:none; }`.
- Lines 443-449: the RTL comment and `:root[dir="rtl"] :is(.diagram-frame, #n-input, #gen-select, #arrange-gen-select, .notice code, .fact-value, .legend-count, .legend-pair, .iso-chip){ direction: ltr; unicode-bidi: isolate; }`.

Markup:
- Lines 544-547: `<div class="mode-tabs" role="tablist" ...>` with buttons #tab-additive and #tab-multiplicative.
- Line 550: `<div class="stage" id="ring-panel" role="tabpanel" aria-labelledby="tab-additive">`. The id stays, because the resize code uses ringPanelEl.
- Lines 621-632: the Group panel: `<h2 data-i18n="cyclicGroups.groupHeading">Group</h2>`, `<div class="field"><label for="n-input" id="n-label">%</label><input type="number" id="n-input" min="2" max="100" step="1" value="12"></div>`, `<p class="n-note" id="n-note"></p>`, `<ul class="facts in-group" id="facts"></ul>`, then `#hint` and `#hint-inverse`.

JS:
- Lines 780-792: DOM refs: `var $ = function(id){ return document.getElementById(id); };`, `nInputEl`, `nNoteEl`, `nLabelEl` (784), `ringPanelEl`, `factsEl`.
- Line 846: `var modeTabs = Array.prototype.slice.call(document.querySelectorAll('.mode-tab'));`.
- Line 720 import: `const { getLang, onLangChange, translate, translateInto } = NT.i18n;`. No new import is needed.
- Math helpers (all hoisted function declarations): `mo(v, tight)` (1342), `mPct()` (1362, the % symbol), `mInline(content, plain)` (1379), `mNum(v)`, `tNode(key, params)` (1387).
- `addFact(labelKey, value)` (2467). `renderFacts(G, factors)` (2482) calls `factsEl.replaceChildren()` and then `addFact` for: the modulus row `addFact(tNode('cyclicGroups.nLabelMath', { n: mInline(mPct(), '%') }), mNum(G.n));` (2487), the operation row (2488), then Group, Cardinality, Identity, Generators and Structure. `var op` (2486) is still needed by `pctLabel`.
- `renderNNote()` (2580): first line `nLabelEl.replaceChildren(mInline(mPct(), '%'));`, then the clamped note via `translateInto(nNoteEl, 'cyclicGroups.nNoteMath', ...)`. render() calls it (3064), and `onLangChange(render)` is at 3346.
- `syncTabs()` (3072-3081) is called from `syncControls()` (3092) and `setMode(id)` (3106). `setMode` returns early when the mode is unchanged, then sets state.mode, calls persistGroup() (writeSharedGroup, skipped when IS_PREVIEW) and render().
- n-input handlers (3225-3229): 'input' calls applyTypedN(value). 'change' calls applyTypedN and then resets the value to state.n.
- Tab click and arrow-key loop: 3309-3322.
- Storage handler (3328-3339) and loadState (3365+) set state.mode directly and call syncControls(). Init calls syncControls() at 3420.

`assets/i18n/cyclic-groups.js`:
- Header comment: lines 1-36. Line 2-3 name "the mode-tab label". Line 14 lists the English-only *Math keys as "(cosetCountMath, nLabelMath, nNoteMath, opAddMath, ..., notice.ruleMath)".
- The en block starts at line 153. `nLabelMath: '{n} (modulus)',` is at line 223.
- The group-operation accessible-name key occurs exactly 31 times, once per language block, each line starting with six spaces (nl 'Groepsbewerking', en 'Group operation', ...).
- `NT.i18n` falls back from the current language to en, then to the raw key. So an en-only key renders English everywhere.

Baselines at HEAD 9f5b3ed (verified):
- `i18n-check --coverage "Cyclic Groups/cyclic-groups.html"`: last line `I18N-CHECK FAIL coverage: 120 finding(s)`. It includes exactly 30 `LANG-KEYSET cyclicGroups.<lang>` lines (English-only keys by user decision), each listing nLabelMath.
- `i18n-check --includes --no-locale-number-format --literals`: includes PASS, no-locale-number-format PASS, literals-markup FAIL 4, literals-js FAIL 8. All are pre-existing and none involves the tabs.
- `--header --switcher-present`: both PASS. `shadow-check.js`: SHADOW-CHECK PASS.
- Headless check: `google-chrome --headless=new --dump-dom` on the file:// URL works. With `?mode=multiplicative&n=15&noshare=1`, #facts holds the Cardinality value whose data-plain contains `φ(%) = φ(15) = 8`.

Known stale dev artifacts, not to be edited: `.planning/quick/261009-d21-.../cyclic-probe.js` and `.planning/quick/261010-i13-.../iso-probe.js` click `#tab-additive` and `#tab-multiplicative`. cyclic-probe.js was already stale, because it still expects the old 'n — modulus' label. Record them in the SUMMARY. Do not update them.
</interfaces>
</context>

<tasks>

<!-- planner-discipline-allow: mode-tab -->
<!-- planner-discipline-allow: modeTabs -->
<!-- planner-discipline-allow: syncTabs -->
<!-- planner-discipline-allow: role="tablist" -->
<!-- planner-discipline-allow: role="tabpanel" -->
<!-- planner-discipline-allow: tablistLabel -->
<!-- planner-discipline-allow: cyclicGroups.fact.operation -->
<!-- planner-discipline-allow: >Operation< -->
<!-- planner-discipline-allow: in-group -->
<!-- planner-discipline-allow: (modulus) -->

<task type="tracer">
  <name>Task 1: The '∗ (group operation)' dropdown replaces the mode tabs, end to end</name>
  <files>Cyclic Groups/cyclic-groups.html, assets/i18n/cyclic-groups.js</files>
  <action>
One path end to end: dictionary, then markup, then CSS, then JS. Picking an operation in a Group-panel dropdown switches the group, and the tab strip is gone.

1. i18n (`assets/i18n/cyclic-groups.js`):
   a. In the en block only, add `opLabelMath: '{op} (group operation)',` on the line right after `nLabelMath: '{n} (modulus)',`. Cyclic Groups strings are English-only (the user's standing rule), so do not add it to any other language block.
   b. Rename the group-operation accessible-name key in all 31 language blocks: every line that starts with six spaces followed by `tablistLabel: ` becomes `opSelectLabel: `, with the value unchanged. Use an anchored sed. Count 31 matches before and 31 `opSelectLabel: ` lines after. Rationale (planner's choice): its value, 'Group operation', is exactly the dropdown's accessible name, and it is already translated in all 31 languages. The old name described the tab strip that this task removes.
   c. Header comment: change the phrase "the mode-tab label" (lines 2-3) to "the group-operation dropdown's accessible name". In the English-only *Math list on line 14, insert `opLabelMath` after `nLabelMath`. Write no other wording about the removed tabs.

2. Markup (`Cyclic Groups/cyclic-groups.html`):
   a. Delete the whole tab-strip block, lines 544-547: the `div.mode-tabs` with role tablist and its two buttons.
   b. Line 550: remove `role="tabpanel"` and `aria-labelledby="tab-additive"` so that it reads `<div class="stage" id="ring-panel">`.
   c. In the Group panel, directly after the closing `</div>` of the `.field` that holds #n-input, and before `p#n-note`, insert `<ul class="facts group-controls" id="group-controls">` with one `<li>` (the operation row). Its contents are `<label for="op-select" id="op-label" class="fact-label">∗</label>` (U+2217; static non-prose fallback until JS fills it; do not write "(group operation)" as static text, or literals-markup flags it), then `<select id="op-select" aria-label="Group operation" data-i18n-aria-label="cyclicGroups.opSelectLabel">`. `id` must be the select's first attribute. The select holds exactly `<option value="additive">+</option>` and `<option value="multiplicative">×</option>` (× is U+00D7), in that order.

3. CSS (tokens only, no literal colour):
   a. Delete lines 58-63: the mode-tab comment and its five rules.
   b. In the reduced-motion rule (line 440), drop the mode-tab selector so that it reads `.action-btn, .legend, body{ transition:none; }`.
   c. After the `.facts` rules (after line 188), add a block headed by a short comment saying that the Group panel's editable rows are styled like the facts beneath them, with the label on the left and the control on the right. Use these rules:
      - `.facts.group-controls li{ align-items:center; }`
      - `.facts.group-controls label{ cursor:pointer; }`
      - `.facts.group-controls input, .facts.group-controls select{ font:inherit; font-family:var(--font-mono); font-size:.92rem; width:5.5em; padding:4px 8px; text-align:right; color:var(--text); background:color-mix(in srgb, var(--text) 6%, transparent); border:1px solid var(--panel-border); border-radius:var(--radius-ctl); }`
      - `.facts.group-controls select{ text-align-last:right; cursor:pointer; }`
      - `.facts.group-controls input:focus-visible, .facts.group-controls select:focus-visible{ outline:2px solid var(--accent); outline-offset:1px; border-color:var(--accent); }`
      The input selectors take effect in Task 2, when #n-input moves into this list.
   d. Extend the themed option rule on line 165 to `.field select option, #op-select option, .sub-order-prompt select option{...}`. The open list then stays readable in the night theme.
   e. In the RTL rule (line 446), insert `#op-select, ` right after `#n-input, `. Extend the comment above it to mention the operation dropdown.

4. JS:
   a. After `var nLabelEl = $('n-label');`, add `var opSelectEl = $('op-select');` and `var opLabelEl = $('op-label');`.
   b. Delete the modeTabs declaration (line 846) and the whole syncTabs function (lines 3072-3081).
   c. In syncControls, replace the `syncTabs();` call with the exact statement `opSelectEl.value = state.mode;`. In setMode, replace its `syncTabs();` call with the same statement.
   d. Delete the tab click and arrow-key loop (lines 3309-3322). Right after the n-input 'change' handler (lines 3226-3229), add `opSelectEl.addEventListener('change', function(){ setMode(opSelectEl.value); });`. setMode already persists the shared group and calls render(), and render() refreshes the Cayley link, the mode= in the address bar and the isomorphic-group links. No other wiring is needed.
   e. In renderFacts, delete the addFact line for the operation row (the one with key cyclicGroups.fact.operation). The dropdown now shows the operation. Keep `var op`, which pctLabel uses. Reword the comment above it so that it no longer says the operation's sign is listed.
   f. In renderNNote, right after the existing nLabelEl line, add `translateInto(opLabelEl, 'cyclicGroups.opLabelMath', { op: mInline(mo('∗', true), '∗') });`. Add a one-line comment saying the operation row's label is ∗, typeset the way the modulus row's % is. render() runs renderNNote and `onLangChange(render)` re-runs render(), so the label follows language switches.
   g. Leave no comment anywhere that names the removed tab strip.

5. Run the verify command. Then commit both files on the current branch with the message `feat(cyclic-groups): pick the group operation in a Group panel row instead of the mode tabs`. The message body ends with the line `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
  </action>
  <verify>
    <automated>cd "$(git rev-parse --show-toplevel)" && node -e "require('vm').runInNewContext(require('fs').readFileSync('assets/i18n/cyclic-groups.js','utf8'),{NT:{i18n:{register:function(ns,d){var L=Object.keys(d);var ok=L.length===31&&d.en.opLabelMath==='{op} (group operation)'&&L.every(function(l){return typeof d[l].opSelectLabel==='string'&&!('tablistLabel' in d[l])&&(l==='en'||!('opLabelMath' in d[l]));});if(!ok)process.exit(1);}}}})" && ! grep -q 'mode-tab' "Cyclic Groups/cyclic-groups.html" && ! grep -q 'modeTabs' "Cyclic Groups/cyclic-groups.html" && ! grep -q 'syncTabs' "Cyclic Groups/cyclic-groups.html" && ! grep -q 'role="tablist"' "Cyclic Groups/cyclic-groups.html" && ! grep -q 'role="tabpanel"' "Cyclic Groups/cyclic-groups.html" && ! grep -q 'cyclicGroups.fact.operation' "Cyclic Groups/cyclic-groups.html" && test "$(grep -o 'opSelectEl.value = state.mode;' "Cyclic Groups/cyclic-groups.html" | wc -l)" -ge 2 && grep -q 'setMode(opSelectEl.value)' "Cyclic Groups/cyclic-groups.html" && grep -q '#n-input, #op-select, ' "Cyclic Groups/cyclic-groups.html" && D="$(mktemp -d)" && B="file://$(python3 -c 'import urllib.parse,os;print(urllib.parse.quote(os.path.abspath("Cyclic Groups/cyclic-groups.html")))')" && dump(){ timeout 60 google-chrome --headless=new --disable-gpu --no-sandbox --user-data-dir="$D/$2" --virtual-time-budget=4000 --dump-dom "$B?$1" 2>/dev/null | tr '\n' ' '; } && M="$(dump 'mode=multiplicative&n=15&noshare=1' m)" && A="$(dump 'mode=additive&n=12&noshare=1&lang=nl' a)" && rm -rf "$D" && F="$(printf '%s' "$M" | sed -n 's/.*id="facts">\(.*\)/\1/p' | sed 's#</ul>.*##')" && printf '%s' "$M" | grep -o 'id="op-label"[^>]*>.\{0,400\}' | sed 's#</label>.*##' | grep -q '∗.*(group operation)' && printf '%s' "$A" | grep -o 'id="op-label"[^>]*>.\{0,400\}' | sed 's#</label>.*##' | grep -q '(group operation)' && printf '%s' "$M" | grep -q '<option value="additive">+</option>' && printf '%s' "$M" | grep -q '<option value="multiplicative">×</option>' && printf '%s' "$A" | grep -q 'id="op-select"[^>]*aria-label="Groepsbewerking"' && printf '%s' "$F" | grep -q 'φ(%) = φ(15) = 8' && ! printf '%s' "$F" | grep -q '>Operation<' && node .planning/phases/07-shared-js-module-refactor/shadow-check.js "Cyclic Groups/cyclic-groups.html"</automated>
  </verify>
  <done>The tab strip, its CSS and its JS are gone, and #ring-panel has no tab roles. The Group panel has an operation row: an MathML ∗ label reading '∗ (group operation)' (English in every language) and a select with '+' / '×'. In Dutch its aria-label is 'Groepsbewerking'. A ?mode=multiplicative deep link renders the multiplicative group (the Cardinality fact shows φ(%) = φ(15) = 8). The select's change event calls setMode. syncControls and setMode keep the select's value equal to state.mode. The Operation fact row is gone. The i18n file parses with 31 languages, en-only opLabelMath, and opSelectLabel in all 31 blocks. shadow-check passes. Committed.</done>
</task>

<task type="auto">
  <name>Task 2: The modulus is set in the '% (modulus)' row, and the Group panel reads as one facts table</name>
  <files>Cyclic Groups/cyclic-groups.html</files>
  <action>
After this task the user sets the modulus in the '% (modulus)' row, which replaces the old stand-alone field. The panel then reads: the Group heading, the modulus row, the operation row, then the Group, Cardinality, Identity, Generators and Structure facts, as one table.

1. Markup (Group panel):
   a. Delete the `.field` div that holds label#n-label and input#n-input. Delete the stand-alone `<p class="n-note" id="n-note"></p>`.
   b. In ul#group-controls, insert a new first `<li>` before the operation row: `<label for="n-input" id="n-label" class="fact-label">%</label>`, then `<input type="number" id="n-input" min="2" max="100" step="1" value="12">`, with the same id and attributes as before, so applyTypedN, the input/change handlers, syncControls and the deep-link/store paths work unchanged. Then add `<p class="n-note" id="n-note"></p>` inside the same li, after the input. The static label text stays just `%`, a non-prose fallback until JS fills it.
   c. Change #facts to `<ul class="facts" id="facts"></ul>` by dropping its in-group class. #facts must stay a separate list after ul#group-controls. render() rebuilds #facts on every keystroke, so a control inside it would lose focus while the user types.

2. CSS (tokens only):
   a. Delete the `.facts.in-group{...}` rule and the comment line above it ("The facts sit at the foot of the Group panel, under its controls.").
   b. Append these rules to Task 1's group-controls block:
      - `.facts.group-controls li:last-child{ border-bottom:1px dotted var(--panel-border); }`, with a comment saying the editable rows and the facts list read as one table, so the last editable row keeps its dotted rule. Its specificity (0,3,1) beats `.facts li:last-child`.
      - `.facts.group-controls .n-note{ flex-basis:100%; margin:0; }`, with a comment saying the clamped-value note takes its own line under the modulus row. Its colour and its empty-hiding come from the existing `.n-note` rules.

3. JS:
   a. In renderFacts, delete the modulus addFact line (the one that passes the nLabelMath tNode and mNum(G.n)). The modulus is now the editable row. Reword the comment above it to say that the facts start with the group the modulus and the operation make, then its cardinality worked out.
   b. In renderNNote, replace its first line (which fills nLabelEl with the bare %) with `translateInto(nLabelEl, 'cyclicGroups.nLabelMath', { n: mInline(mPct(), '%') });`. The row label then reads '% (modulus)', typeset exactly as the old read-only fact was. The label is a sibling of the input, never its ancestor, so re-filling it on every render (including on each keystroke) never takes focus from the input.
   c. Change nothing in applyTypedN, the n-input handlers, the syncControls nInputEl line, loadState or the storage handler.

4. Run the verify command. Then commit on the current branch with the message `feat(cyclic-groups): set the modulus in the Group panel's % (modulus) row`. The message body ends with the line `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
  </action>
  <verify>
    <automated>cd "$(git rev-parse --show-toplevel)" && ! grep -q 'in-group' "Cyclic Groups/cyclic-groups.html" && test "$(grep -o 'id="n-input"' "Cyclic Groups/cyclic-groups.html" | wc -l)" -eq 1 && D="$(mktemp -d)" && B="file://$(python3 -c 'import urllib.parse,os;print(urllib.parse.quote(os.path.abspath("Cyclic Groups/cyclic-groups.html")))')" && dump(){ timeout 60 google-chrome --headless=new --disable-gpu --no-sandbox --user-data-dir="$D/$2" --virtual-time-budget=4000 --dump-dom "$B?$1" 2>/dev/null | tr '\n' ' '; } && M="$(dump 'mode=multiplicative&n=15&noshare=1' m)" && A="$(dump 'mode=additive&n=12&noshare=1&lang=nl' a)" && rm -rf "$D" && C="$(printf '%s' "$M" | sed -n 's/.*id="group-controls">\(.*\)/\1/p' | sed 's#</ul>.*##')" && F="$(printf '%s' "$M" | sed -n 's/.*id="facts">\(.*\)/\1/p' | sed 's#</ul>.*##')" && printf '%s' "$C" | grep -q 'id="n-input".*id="n-note".*id="op-select"' && printf '%s' "$C" | grep -o 'id="n-label"[^>]*>.\{0,400\}' | sed 's#</label>.*##' | grep -q '%.*(modulus)' && printf '%s' "$A" | sed -n 's/.*id="group-controls">\(.*\)/\1/p' | grep -o 'id="n-label"[^>]*>.\{0,400\}' | sed 's#</label>.*##' | grep -q '(modulus)' && ! printf '%s' "$F" | grep -q '(modulus)' && ! printf '%s' "$F" | grep -q '>Operation<' && printf '%s' "$F" | grep -q 'φ(%) = φ(15) = 8' && { COV="$(node .planning/phases/06-multi-language-support/i18n-check.js --coverage "Cyclic Groups/cyclic-groups.html")" || true; } && printf '%s\n' "$COV" | tail -1 | grep -qx 'I18N-CHECK FAIL coverage: 120 finding(s)' && test "$(printf '%s\n' "$COV" | grep '^LANG-KEYSET cyclicGroups\.' | grep 'opLabelMath' | wc -l)" -eq 30 && ! printf '%s\n' "$COV" | grep -q 'opSelectLabel' && test "$(node .planning/phases/06-multi-language-support/i18n-check.js --includes --no-locale-number-format --literals "Cyclic Groups/cyclic-groups.html" | grep '^I18N-CHECK' | tr '\n' '|')" = "I18N-CHECK PASS includes: 1 page(s)|I18N-CHECK PASS no-locale-number-format: 1 page(s)|I18N-CHECK FAIL literals-markup: 4 finding(s)|I18N-CHECK FAIL literals-js: 8 finding(s)|" && node .planning/phases/06-multi-language-support/i18n-check.js --header --switcher-present "Cyclic Groups/cyclic-groups.html" && node .planning/phases/07-shared-js-module-refactor/shadow-check.js "Cyclic Groups/cyclic-groups.html" && git diff --quiet 9f5b3ed -- assets/ ':(exclude)assets/i18n/cyclic-groups.js'</automated>
  </verify>
  <done>The old modulus field is gone. ul#group-controls holds the modulus row (label '% (modulus)' as MathML % plus text, #n-input, #n-note on its own line) and then the operation row. #facts is a plain `.facts` list with no modulus or Operation row, and still renders the Cardinality worked out for the multiplicative group. The two lists share the dotted row rule. i18n coverage stays at 120 findings, and the 30 cyclicGroups lines now also list opLabelMath, an expected English-only key per the user's rule. The literals, includes, no-locale-number-format, header and switcher gates match their baselines. shadow-check passes, and no shared asset other than assets/i18n/cyclic-groups.js changed since 9f5b3ed. Committed.</done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| user controls → page state | The number input and the operation dropdown set state.n / state.mode |
| page → shared `group-params` store | setMode/applyTypedN persist the group, which Cayley Table and Equivalence Wheel read through storage events |
| URL query → page state | `?mode=&n=` deep links set the operation the dropdown must reflect |

## STRIDE Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation Plan |
|-----------|----------|-----------|----------|-------------|-----------------|
| T-qmt-01 | Tampering | `#op-select` change → setMode → persistGroup (NT.store `group-params`) | low | mitigate | The dropdown's only option values are `additive` and `multiplicative`, the same values the removed tabs' data-mode carried, so the store payload shape and key are unchanged (NT.store contract). Receiving pages already validate mode through readSharedGroup |
| T-qmt-02 | Tampering | row labels (#n-label, #op-label) built from dictionary templates | low | mitigate | Filled only through translateInto with MathML nodes from mInline/mo/mPct (text nodes, never innerHTML). The literals-js gate (INNERHTML-PROSE) stays at its baseline of 8 |
| T-qmt-03 | Denial of service | re-render on each keystroke in #n-input | low | accept | Behaviour is unchanged from the old field: applyTypedN clamps to 2..100 before render() |
| T-qmt-SC | Tampering | npm/pip/cargo installs | high | accept | No package installs. Verification uses Node built-ins, the in-repo i18n-check/shadow-check scripts and the system google-chrome already used by earlier probes |
</threat_model>

<verification>
1. Task 1 and Task 2 automated commands both exit 0.
2. `git log --oneline -3` shows the two `feat(cyclic-groups): ...` commits on branch `cyclic-groups-merged-view`. Each message ends with the Co-Authored-By line.
3. The orchestrator's manual browser pass (local `python3 -m http.server 8765 --bind 127.0.0.1` from the repo root, killed afterwards) covers the following:
   - Typing in the % row re-renders live, keeps focus and clamps with the note under the row.
   - '×' / '+' switch the group, and the URL mode= and the Cayley link follow.
   - A second open tab follows through the storage event, and its dropdown updates.
   - Day and night themes, a narrow width, and Arabic (the dropdown and the input stay left to right).
</verification>

<success_criteria>
- One page view: no Additive/Multiplicative tab strip. The operation is chosen with a '+' / '×' dropdown in a '∗ (group operation)' row, and the modulus is set in a '% (modulus)' row. Both rows sit at the top of the Group panel and read as part of its facts table.
- Every path that used to drive the tabs (dropdown change, deep link, storage sync, init, language switch) keeps the dropdown, the diagram, the facts, the URL, the shared store and the cross-links in agreement.
- The new label is English-only per the user's rule. The dropdown's accessible name stays translated in all 31 languages. No i18n gate regresses beyond the expected opLabelMath entry in the 30 existing cyclicGroups coverage lines.
</success_criteria>

<output>
Create `.planning/quick/261010-qmt-cyclic-groups-merge-additive-and-multipl/261010-qmt-SUMMARY.md` when done. Include:
- The two commit hashes.
- The key-rename decision: the old group-operation tab-strip key was renamed to opSelectLabel in all 31 blocks, with its translated values kept.
- Keys this page no longer uses but that stay in the dictionaries: `fact.operation` (already alongside the long-unused opAdd/opMul/opAddMath/opMulMath), and site.js's shared `common.additiveGroups` / `common.multiplicativeGroups`, which other pages still use.
- The i18n gate results before and after.
- The note that the historical dev probes `cyclic-probe.js` (261009-d21) and `iso-probe.js` (261010-i13) reference the removed tab ids and were deliberately left unchanged as point-in-time artifacts.
</output>
