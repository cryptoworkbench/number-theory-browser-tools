---
phase: quick-260926-rbb
plan: 01
type: execute
wave: 2
# 260926-rba (same batch) renames `RSA Examplifier/` -> `RSA/` and
# `rsa-examplifier.html` -> `rsa.html`, and rewrites the user-facing name to "RSA".
# This plan edits that same file, so it is sequenced after rba and every path below
# is the POST-RENAME path. Do not create `RSA/rsa.html` yourself if it is missing —
# see Task 1's precondition.
depends_on: [260926-rba]
files_modified:
  - RSA/rsa.html
autonomous: true
requirements: [NAV-02, PAL-02, PAL-04]

estimate:
  tokens: 62000
  raw_tokens: 62000
  tasks: 2
  confidence: low

must_haves:
  truths:
    - "Each decrypt section of the RSA tool (the `Alice decrypts` block of the Bob→Alice exchange and the `Bob decrypts` block of the Alice→Bob exchange) carries its own `Use CRT-assisted decryption` checkbox, unchecked by default."
    - "With the checkbox unchecked, that decrypt block renders exactly what it renders today: the `m = c^d mod n` formula line and the single square-and-multiply step table over the full-size exponent d and modulus n."
    - "Checking the box re-renders that one decrypt block in place — without the user re-clicking the send button and without touching the other exchange's block — and unchecking it restores the direct view."
    - "In CRT mode the block shows the actual numbers for every stage, not just the answer: dP = d mod (p−1), dQ = d mod (q−1), qInv = q inverse mod p (with a `q · qInv mod p = 1` check), m1 = c^dP mod p and m2 = c^dQ mod q each with their own square-and-multiply step table, then h = qInv·(m1 − m2) mod p and the recombination m = m2 + h·q."
    - "The CRT block states, with the live numbers, that it reached the identical message: the direct c^d mod n value is still computed in CRT mode and displayed beside the CRT result with a matches/does-not-match marker, as is the comparison against the original message m."
    - "The CRT block quantifies why this is the faster route using the live values: the bit-length of d against the bit-lengths of dP and dQ, and the direct step count against the summed step counts of the two half-size exponentiations, plus the statement that the operands are half-size so each multiply costs roughly a quarter as much (about 4x less work for the same answer)."
    - "The CRT block names why only the recipient can take this shortcut: the recipient still holds p and q from their own key generation, while Eve only ever saw (e, n) on the wire — recovering p and q is the factoring problem step 4 already demonstrates."
    - "The CRT block carries the two honest caveats: the shortcut assumes gcd(c, n) = 1 (true unless the message shares a factor with n), and real CRT-RSA verifies the recombined result before releasing it because one faulty half leaks p — flagged as one more thing this textbook version skips."
    - "For both default keypairs (Bob p=61 q=53, Alice p=17 q=23) and for larger primes, the CRT route recovers the original message for every message value, including m = 0 and messages that share a factor with n."
    - "All CRT arithmetic is native BigInt reusing the page's existing helpers (extendedGcdSteps for the inverse, modPowSteps for the two exponentiations); no external library and no Number-precision arithmetic is introduced (NAV-02)."
    - "The tool remains one self-contained HTML file with inline `<style>`/`<script>` and no dependency beyond the shared assets and Google Fonts, and the file still declares no literal color value — every new color reference resolves through a shared palette token (NAV-02, PAL-02, PAL-04)."
  artifacts:
    - "RSA/rsa.html"
  key_links:
    - "`sendMessage(fromId,toId)` -> `LastExchange[toId]` -> `renderExchange(toId)` -> `change` listener on `#crt-toggle-{toId}` -> `renderExchange(toId)` — the only re-render path. The listener must be re-attached after every innerHTML write (the pattern `renderEve()` already uses) or the toggle goes dead after one flip."
    - "`crtDecryptSteps` and `modInverseBig` must live in the pure-helper region between `function parseBigIntStrict` and the `/* ---------- App state` section marker, DOM-free: the automated gate slices exactly that region and evaluates it in Node, so moving them below the marker or referencing `document` inside them breaks the gate."
    - "`State[toId].p` / `State[toId].q` -> `crtDecryptSteps` — the CRT path must read the DECRYPTING party's own primes. Passing the sender's p/q yields a wrong m, which the same-result cross-check line would then surface as a mismatch."
    - "`modPowSteps` -> `m1Steps` / `m2Steps` -> existing `renderModPowTable` — reused so the CRT tables inherit the established truncation behaviour for long exponents instead of growing the panel without bound."
    - "The direct `modPowSteps(c, to.d, to.n)` result is kept in BOTH modes -> feeds the same-result cross-check and the step-count comparison. Skipping it in CRT mode turns a checked claim into an unchecked assertion."
---

<objective>
Add an optional Chinese-Remainder-Theorem decryption route to the RSA tool's two decrypt
sections, displayed as step-by-step math rather than computed silently.

Purpose: the recipient of an RSA message knows their own p and q, so they can decrypt with
two half-size exponentiations instead of one full-size one. That is the single biggest
practical speedup in real RSA implementations, and it is invisible in the tool's current
`m = c^d mod n` view. Showing dP, dQ, qInv, m1, m2 and the recombination side by side with
the direct computation makes both the mechanism and the reason it is faster legible — and
reinforces the page's central point, that everything private flows from knowing p and q.

Output: `RSA/rsa.html` gains two BigInt helpers, a per-decrypt-block toggle, and a full CRT
step display that cross-checks itself against the direct computation.
</objective>

<execution_context>
@~/.claude/gsd-core/workflows/execute-plan.md
@~/.claude/gsd-core/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/STATE.md
@./.claude/CLAUDE.md

@RSA/rsa.html
@assets/palette.css
</context>

<tasks>

<task type="tracer">
  <name>Task 1: End-to-end CRT decryption path — one toggle, one number, cross-checked</name>
  <files>RSA/rsa.html</files>
  <precondition>`RSA/rsa.html` exists (item 260926-rba's rename has landed). If instead only `RSA Examplifier/rsa-examplifier.html` is present, halt and report that 260926-rba has not executed yet — do NOT create a second copy of the tool under the new path.</precondition>
  <reversibility rating="reversible">Purely additive change to one self-contained HTML file; reverting is deleting the added helpers, toggle and render branch.</reversibility>
  <read_first>
    RSA/rsa.html — specifically the pure-helper region (`parseBigIntStrict` through `bruteFactorEve`, note `extendedGcdSteps` returning `{gcd, x, y, rows}` and `modPowSteps` returning `{result, steps, bin}`), the `State` declaration and `generateKeys` (which stores `p`, `q`, `n`, `phi`, `e`, `d` per party), `renderMessages`, `renderModPowTable`, `sendMessage`, and `renderEve` (the established "set innerHTML, then re-attach listeners" pattern).
  </read_first>
  <action>
Wire ONE thin path — toggle on, CRT number out, checked against the direct number — through
every layer this feature touches: pure BigInt helper, exchange state, render branch, event
wiring. No step tables and no cost comparison yet; those are Task 2.

1. Pure math, in the existing pure-helper region. Add two DOM-free functions immediately
   after `modPowSteps` and before `bruteFactorEve`, so both sit above the
   `/* ---------- App state` section marker (the automated gate slices the file between
   `function parseBigIntStrict` and that marker and evaluates the slice in Node — anything
   touching `document` there, or placed below the marker, breaks it):
   - `modInverseBig(a, m)`: normalize `a` into the range 0 to m, call the existing
     `extendedGcdSteps(a, m)`, return `null` when the returned gcd is not 1, otherwise
     return the returned `x` reduced into 0 to m. Reuse `extendedGcdSteps` rather than
     writing a second Euclidean routine — the page already displays its table for d.
   - `crtDecryptSteps(c, d, p, q)`: compute `dP` as d mod (p−1), `dQ` as d mod (q−1),
     `qInv` as `modInverseBig(q, p)` (return `null` if that is null), then `m1` via
     `modPowSteps(c mod p, dP, p)` and `m2` via `modPowSteps(c mod q, dQ, q)`. Recombine
     with Garner's form: take the difference m1 − m2 reduced into 0 to p, multiply by
     `qInv` mod p to get `h`, and return the message as `m2 + h*q`. Return an object
     carrying `dP`, `dQ`, `qInv`, `m1`, `m2`, `h`, `m`, `m1Steps` and `m2Steps` (the two
     `steps` arrays), so Task 2 can render tables without recomputing. Every operation is
     native BigInt; never convert to Number.
2. Exchange state. Next to the existing `State` declaration add two module-scoped objects
   keyed by the DECRYPTING party's id: one holding the per-block CRT flag (both false
   initially) and one holding the last sent exchange (both null). Keying by decrypter is
   what makes the two blocks independent, since each exchange has exactly one decrypter.
3. Split the render out of `sendMessage(fromId, toId)`. `sendMessage` keeps the parse,
   the range validation and the `c` computation, then stores `{fromId, toId, m, c}` in the
   last-exchange object under `toId` and calls a new `renderExchange(toId)`. `renderExchange`
   reads that stored exchange (so a later edit of the message input cannot silently change
   an already-sent exchange), recomputes the direct decryption with
   `modPowSteps(c, to.d, to.n)`, and writes the same `msg-{fromId}-result` element with the
   same encrypt substep, wire diagram and Eve notebook markup as today.
4. Toggle markup, inside the decrypt substep (the `{recipient} decrypts` block) so it sits
   in the decrypt section itself, not in the sender's input row. Emit a label wrapping a
   checkbox with id `crt-toggle-{toId}`, reflecting the stored flag as its checked state,
   reading `Use CRT-assisted decryption`, followed by a one-line hint naming that the
   recipient still holds p and q from their own key generation.
5. Event wiring. After `renderExchange` writes innerHTML, attach a `change` listener to
   that checkbox that stores the new flag under `toId` and calls `renderExchange(toId)`
   again — the same re-attach-after-innerHTML pattern `renderEve` uses. Re-rendering one
   block must not disturb the other exchange's block.
6. Render branch, kept deliberately thin for this task. Flag off: render the decrypt
   substep byte-for-byte as it renders today (the `m = c^d mod n` formula line plus
   `renderModPowTable` over the direct steps). Flag on: replace that single table with one
   CRT result line showing the `m` returned by `crtDecryptSteps` for the recipient's own p
   and q, plus one line stating whether it equals the direct `c^d mod n` value and whether
   it equals the original message. Keep the existing recovered-message line and the Eve
   notebook block identical in both modes. Handle a null return from `crtDecryptSteps` by
   falling back to the direct view with a short explanatory line instead of rendering
   nothing.

No literal color values anywhere in this task — it adds no styling; Task 2 owns the CSS.
  </action>
  <verify>
    <automated>cd /home/mainaccount/Claude/number-theory-browser-tools &amp;&amp; node -e 'const s=require("fs").readFileSync("RSA/rsa.html","utf8");const a=s.indexOf("function parseBigIntStrict"),b=s.indexOf("/* ---------- App state");if(!(a>=0&&b>a))throw new Error("helper region markers missing");const H=new Function(s.slice(a,b)+"; return {modPowPlain, extendedGcdSteps, chooseE, crtDecryptSteps, modInverseBig};")();let k=0;for(const pq of [[61n,53n],[17n,23n],[101n,103n],[3n,5n],[7919n,7907n]]){const p=pq[0],q=pq[1],n=p*q,phi=(p-1n)*(q-1n),e=H.chooseE(phi).chosen,eg=H.extendedGcdSteps(e,phi),d=((eg.x%phi)+phi)%phi;if((H.modInverseBig(q,p)*q)%p!==1n)throw new Error("qInv wrong for "+[p,q].join(","));for(let m=0n;60n>m;m++){if(m>=n)break;const c=H.modPowPlain(m,e,n),r=H.crtDecryptSteps(c,d,p,q);k++;if(r.m!==m)throw new Error("CRT != m at "+[p,q,m].join(","));if(r.m!==H.modPowPlain(c,d,n))throw new Error("CRT != direct at "+[p,q,m].join(","));if(r.dP!==d%(p-1n)||r.dQ!==d%(q-1n))throw new Error("dP/dQ wrong");if(!(r.m1Steps.length>0&&r.m2Steps.length>0))throw new Error("missing step tables");}}console.log("CRT math OK, "+k+" cases");'</automated>
    <automated>cd /home/mainaccount/Claude/number-theory-browser-tools &amp;&amp; grep -q 'id="crt-toggle-' RSA/rsa.html &amp;&amp; grep -q 'Use CRT-assisted decryption' RSA/rsa.html &amp;&amp; grep -q 'renderExchange' RSA/rsa.html &amp;&amp; echo "wiring present"</automated>
    <human-check>Open `RSA/rsa.html`, generate both keypairs with the default primes, send both messages. Each decrypt block shows an unchecked `Use CRT-assisted decryption` box and today's single step table. Check Bob's box: that block alone switches to the CRT result line and reports the same value as the direct computation; Alice's block is untouched. Uncheck it: the direct table returns.</human-check>
  </verify>
  <done>The CRT route runs end-to-end from a per-block checkbox to a displayed, cross-checked message value in both decrypt blocks; the unchecked view is unchanged from before; the Node gate proves the CRT math agrees with the direct computation across 255 message/keypair cases.</done>
</task>

<task type="auto">
  <name>Task 2: Expand the CRT result into the full step-by-step display</name>
  <files>RSA/rsa.html</files>
  <read_first>
    RSA/rsa.html as left by Task 1 — the new `crtDecryptSteps` return shape and the CRT branch of `renderExchange`; the existing `.substep` / `.formula` / `.lbl` / `.val` / `.tbl-wrap` / `.msg-hint` markup conventions; the `.dlp-box` rules, which are the page's precedent for presenting an advanced, adjacent idea. `assets/palette.css` — the `--role-*` semantic layer and which role means computed result, which means advanced/special.
  </read_first>
  <action>
Replace Task 1's single CRT result line with the full pedagogical display, all inside one
CRT container rendered in place of the direct step table when the flag is on. Order the
stages so the reader can follow the arithmetic top to bottom, each with its live numbers
formatted through the page's existing thousands-separator helper:

1. What the recipient has that Eve does not — p and q, read from the decrypting party's own
   stored keypair, with one line noting that Eve only ever recorded (e, n) from the wire and
   that turning that into p and q is exactly the factoring problem step 4 demonstrates.
2. Precomputation, three formula lines with values: dP as d mod (p−1); dQ as d mod (q−1);
   qInv as the inverse of q mod p — the last followed by a `q · qInv mod p = 1` check line
   with a tick or cross, and a hint noting the inverse comes from the same extended
   Euclidean algorithm the page already used to derive d.
3. The two half-size exponentiations: a formula line and a `renderModPowTable` step table
   for m1 = c^dP mod p, then the same for m2 = c^dQ mod q, using the `m1Steps` and `m2Steps`
   arrays Task 1 returns. Both tables go through the existing table wrapper class so they
   scroll instead of stretching the panel on a narrow screen.
4. Recombination: a formula line for h = qInv·(m1 − m2) mod p, then the recovered message as
   m = m2 + h·q, marked with the computed-value styling the page already uses for answers.
5. Same-result cross-check: the direct c^d mod n value (still computed in CRT mode) shown
   beside the CRT value with a matches/does-not-match marker, plus the matches-original-m
   marker. This keeps the "identical result" claim measured rather than asserted.
6. Cost comparison, one short block using the live values: the bit-length of d against the
   bit-lengths of dP and dQ, and the direct square-and-multiply step count against the sum
   of the two CRT step counts — followed by the point that the CRT halves not only the
   exponent lengths but the operand sizes, so each multiply costs roughly a quarter as much,
   landing at roughly 4x less work for an identical answer. This is why every production
   RSA implementation decrypts this way.
7. Two caveats, in the page's existing hint voice: the shortcut relies on gcd(c, n) = 1,
   which holds unless the message happens to share a factor with n; and real CRT-RSA
   verifies the recombined result before releasing it, because a single corrupted half
   reveals p to an attacker — one more safeguard this textbook version skips, in the same
   spirit as the page's existing no-padding disclaimer.

Styling: add rules for the toggle row and the CRT container to the inline style block.
Present CRT as the advanced/alternative route the page already reserves its special role
token for (as the discrete-log box does), keep the computed-result role for values via the
existing value class, and tint the checkbox with `accent-color` pointed at a role token.
Every color reference resolves through `var()` against the shared palette tokens; declare no
literal color notation of any kind — the automated gate rejects them. Any locally named
custom property must be either a non-color or built purely from `var()` references.

Leave the unchecked view, the encrypt substep, the wire diagram and the Eve notebook exactly
as they are.
  </action>
  <verify>
    <automated>cd /home/mainaccount/Claude/number-theory-browser-tools &amp;&amp; node -e 'const s=require("fs").readFileSync("RSA/rsa.html","utf8");const a=s.indexOf("function parseBigIntStrict"),b=s.indexOf("/* ---------- App state");if(!(a>=0&&b>a))throw new Error("helper region markers missing");const H=new Function(s.slice(a,b)+"; return {modPowPlain, extendedGcdSteps, chooseE, crtDecryptSteps, modInverseBig};")();let k=0;for(const pq of [[61n,53n],[17n,23n],[101n,103n],[3n,5n],[7919n,7907n]]){const p=pq[0],q=pq[1],n=p*q,phi=(p-1n)*(q-1n),e=H.chooseE(phi).chosen,eg=H.extendedGcdSteps(e,phi),d=((eg.x%phi)+phi)%phi;for(let m=0n;60n>m;m++){if(m>=n)break;const c=H.modPowPlain(m,e,n),r=H.crtDecryptSteps(c,d,p,q);k++;if(r.m!==m)throw new Error("CRT != m at "+[p,q,m].join(","));if((r.m2+((r.qInv*((((r.m1-r.m2)%p)+p)%p))%p)*q)!==r.m)throw new Error("recombination fields inconsistent with m");}}console.log("CRT math still OK, "+k+" cases");'</automated>
    <automated>cd /home/mainaccount/Claude/number-theory-browser-tools &amp;&amp; grep -q 'crtDecryptSteps' RSA/rsa.html &amp;&amp; grep -q 'id="crt-toggle-' RSA/rsa.html &amp;&amp; grep -q 'm1Steps' RSA/rsa.html &amp;&amp; grep -q 'm2Steps' RSA/rsa.html &amp;&amp; grep -q 'accent-color' RSA/rsa.html &amp;&amp; echo "CRT display wired"</automated>
    <automated>cd /home/mainaccount/Claude/number-theory-browser-tools &amp;&amp; test $(grep -c 'renderModPowTable(' RSA/rsa.html) -ge 4 &amp;&amp; echo "renderModPowTable reused for the CRT halves (baseline was 3 lines: definition plus two call sites)"</automated>
    <automated>cd /home/mainaccount/Claude/number-theory-browser-tools &amp;&amp; if grep -qE '#[0-9a-fA-F]{3,8}|rgba?\(|hsla?\(' RSA/rsa.html; then echo "FAIL color literal present"; exit 1; else echo "palette-token only"; fi</automated>
    <automated>cd /home/mainaccount/Claude/number-theory-browser-tools &amp;&amp; if grep -nE 'rel="stylesheet"|defer src=' RSA/rsa.html | grep -vqE 'assets/(palette|site)[.]css|assets/theme[.]js'; then echo "FAIL unexpected external reference"; grep -nE 'rel="stylesheet"|defer src=' RSA/rsa.html; exit 1; else echo "still self-contained (shared assets only)"; fi</automated>
    <human-check>Open `RSA/rsa.html` in both day and night mode. With CRT checked on Bob's decrypt block, confirm every stage is on screen with real numbers — dP, dQ, qInv plus its check, both m1 and m2 step tables, h, the recombined m, the same-result cross-check, the bit-length/step-count comparison, and the two caveats — that the CRT block reads as the advanced path rather than the primary one, that both step tables scroll rather than widening the panel at a narrow window width, and that toggling either block does not disturb the other.</human-check>
  </verify>
  <done>Checking the box in either decrypt block shows the complete CRT derivation with live numbers, a measured same-result cross-check against the direct computation, a quantified cost comparison, and both caveats; the file still declares no literal color and remains self-contained; the Node math gate still passes.</done>
</task>

</tasks>

<verification>
- Both decrypt blocks default to the pre-existing direct view; the diff adds no behaviour to the unchecked path.
- The Node gate evaluates the page's own helper region and proves CRT equals the direct decryption for 255 message/keypair combinations, including m = 0, messages sharing a factor with n, and a keypair large enough that e = 65537 is chosen.
- Toggling one block re-renders only that block, and repeated toggling keeps working (listener re-attached after each innerHTML write).
- `grep -qE '#[0-9a-fA-F]{3,8}|rgba?\(|hsla?\('` finds nothing in the file (it finds nothing today; the change must not regress that).
- The file remains a single self-contained HTML document whose only external references are the shared assets and Google Fonts.
</verification>

<success_criteria>
A reader who has just watched the tool decrypt with `m = c^d mod n` can tick one box in the
same section and see the same message recovered through dP, dQ, qInv, two half-size
exponentiations and a recombination — each stage shown with its own numbers and step table,
the identity of the two results checked on screen rather than claimed, the speedup quantified
from the live bit-lengths and step counts, and the reason only the key owner can do it stated
in terms of p and q. Nothing about the existing direct view changes.
</success_criteria>

<output>
Create `.planning/quick/260926-rbb-in-the-rsa-tool-s-bob-decrypts-alice-decrypts-sections-add-a/260926-rbb-SUMMARY.md` when done
</output>
