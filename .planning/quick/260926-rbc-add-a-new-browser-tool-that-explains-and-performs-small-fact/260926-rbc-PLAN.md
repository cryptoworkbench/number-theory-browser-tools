---
phase: quick-260926-rbc
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - Shors Algorithm/shors-algorithm.html
  - index.html
  - Sieve Of Eratosthenes/sieve-of-eratosthenes.html
  - Factor Tree/factor-tree.html
  - Factorize By Completing The Square/factorize-completing-square.html
  - Congruence Wheel/congruence-wheel.html
  - RSA Examplifier/rsa-examplifier.html
  - Venn Diagrams/venn-diagrams.html
  - Diffie-Hellman Key Exchange/diffie-hellman-key-exchange.html
autonomous: true
requirements: [QUICK-260926-rbc, NAV-01, NAV-02, PAL-01, PAL-02, PAL-04]

estimate:
  tokens: 95000
  raw_tokens: 95000
  tasks: 3
  confidence: low

must_haves:
  truths:
    - "Opening `Shors Algorithm/shors-algorithm.html` shows a completed Shor's run on the seeded example N = 15, ending in the verdict 15 = 3 x 5, with every one of the algorithm's stages named on the page."
    - "The order-finding stage is labelled, in the page's own prose, as the step a quantum computer would perform with quantum phase estimation and an inverse QFT, simulated classically here by walking the cycle a^1, a^2, ... mod N directly because there is no quantum hardware in a browser — the page never claims to do real quantum computation."
    - "Entering an N above the hard ceiling of 4096 never starts a computation: the run button is disabled, and a message explains the ceiling exists because the classical stand-in costs up to N modular multiplications per attempt (and a faithful quantum-register simulation would need about N^2 amplitudes) instead of real Shor's polynomial cost in log N."
    - "The ceiling is enforced on every entry path — the number input, the Enter key, the preset chips, a restored localStorage value, and a `?n=` link — through one parse function, not per-call-site checks."
    - "A base that fails Shor's post-processing tests is shown failing and is retried with a new base rather than hidden: on N = 3233 with base a = 2 the page shows a^(r/2) = -1 mod N rejecting that base, then reaches 3233 = 53 x 61 on a later base."
    - "The classical pre-checks run before any order finding and are shown as such: an even N yields the factor 2, a perfect power N yields its root, and a prime N is reported as having nothing to factor."
    - "Play, Pause, Step, Instant and Reset walk the stages one at a time exactly as the Sieve and Diffie-Hellman tools do, and restarting mid-animation never lets a stale callback write into the rebuilt stage."
    - "The order of a mod N is drawn as a ring of the successive values a^x mod N closing back on 1, with the base, the midpoint value a^(r/2) and the closing 1 distinguished; a period larger than the display cap truncates the ring visibly and says so rather than emitting thousands of nodes."
    - "The page declares no literal color and re-themes with the shared day/night toggle: every color resolves through var() against assets/palette.css, including its --role-* layer."
    - "The hub shows a Shor's Algorithm card, and all nine pages carry the same nine nav links with exactly one marked active and every href resolving to a file that exists."
  artifacts:
    - "Shors Algorithm/shors-algorithm.html"
    - "index.html (eighth card + nav entry + updated tool-count wording)"
  key_links:
    - "shors-algorithm.html -> ../assets/palette.css, then ../assets/site.css, then the tool's own <style>"
    - "shors-algorithm.html -> ../assets/theme.js plus the verbatim pre-paint inline theme script"
    - "every input path (field, Enter, chips, ?n= / ?a= query params, restored localStorage) -> parseNStrict() -> the single guard -> runShor()"
    - "runShor().steps -> playback engine (play/pause/step/instant/reset) guarded by the generation counter -> step log + cycle ring + verdict element"
    - "runShor() order search -> MAX_ORDER_STEPS budget; base retry loop -> MAX_BASE_ATTEMPTS cap; ring render -> CYCLE_RENDER_CAP"
    - "index.html card href and all-page nav hrefs -> Shors Algorithm/shors-algorithm.html"
---

<objective>
Add an eighth browser tool that teaches Shor's algorithm honestly and factors small N with it, then register it in the hub and in every page's nav.

Purpose: Shor's algorithm is the reason RSA is considered mortal, and the existing RSA and Diffie-Hellman tools both end on "this is the hard problem that protects you." This tool shows what breaks that assumption — and does it without lying to the learner: the quantum order-finding step is replaced by a classical cycle walk that is labelled as a stand-in, and the hard input ceiling that stand-in forces is explained as the price of not having a quantum computer.

Output: `Shors Algorithm/shors-algorithm.html` (one self-contained page, zero dependencies beyond Google Fonts), plus a card and nav entry on the hub and a nav entry on the seven existing tool pages.
</objective>

<execution_context>
@~/.claude/gsd-core/workflows/execute-plan.md
@~/.claude/gsd-core/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/STATE.md
@CLAUDE.md

Pattern source to imitate (most recent tool, same shape, same playback engine, same persistence and guard idioms):
@Diffie-Hellman Key Exchange/diffie-hellman-key-exchange.html

Shared chrome and the color contract:
@assets/palette.css
@assets/site.css

Hub to register into:
@index.html
</context>

<contracts>

## Pure math API (lives in the `/* ---------- number theory ---------- */` section, DOM-free)

The number-theory section must be a contiguous block between the marker comment
`/* ---------- number theory ---------- */` and the next marker comment
`/* ---------- state ---------- */`, must reference no DOM object, and must
declare each entry point with a `function` declaration (not an arrow assigned to
a `const`) so the extract-and-eval verify harness can call them:

```js
function limits()            // -> { N_MAX: 4096, MAX_ORDER_STEPS: 4096, MAX_BASE_ATTEMPTS: 24, CYCLE_RENDER_CAP: 96 }
function parseNStrict(str)   // -> { ok:true, n } | { ok:false, guard:'nan'|'too-small'|'ceiling', message }
function gcdSmall(a, b)
function modPowSmall(a, e, m)     // square-and-multiply
function isPrimeSmall(n)          // trial division; n <= N_MAX
function perfectPower(n)          // -> [base, exp] | null
function multiplicativeOrder(a,n) // -> r, or -1 if the MAX_ORDER_STEPS budget is exhausted
function cycleValues(a, n, r, cap)// -> first min(r, cap) values of a^x mod n, x = 1..
function runShor(n, opts)         // opts: { bases?: number[] forced first bases, rng?: () => number }
```

`runShor(n, opts)` returns:

```js
{
  guard: 'ok',                       // guard results never reach runShor; callers gate on parseNStrict
  n,
  route: 'even'|'perfect-power'|'prime'|'lucky-gcd'|'order'|'exhausted',
  factors: [p, q] | null,            // ascending, p * q === n when non-null
  base: number|null,                 // the base that succeeded
  r: number|null,                    // its order
  attempts: [ { a, g, r, x, outcome:'lucky-gcd'|'odd-order'|'minus-one'|'success'|'budget' } ],
  steps: [ { id, label, detail, sim?: true } ]
}
```

`steps[].id` in order: `precheck`, `pickBase`, `gcdCheck`, `orderFind` (this one
carries `sim: true`), `parityCheck`, `rootCheck`, `factorGcd`, `verdict`. A
retried base re-emits `pickBase` through `rootCheck` for the next attempt.

## DOM verification contract (machine-checkable state on the page)

| Element | Attribute | Values |
|---------|-----------|--------|
| `#guardBox` | `data-guard` | `ok` \| `nan` \| `too-small` \| `ceiling` |
| `#guardBox` | `data-can-run` | `true` \| `false` (the run button's `disabled` is set from this same flag) |
| `#verdict` | `data-route` | one of `runShor().route`, or `none` before a run |
| `#verdict` | `data-factors` | `""` when no factor pair was produced, else `"p,q"` ascending |
| `#verdict` | `data-attempts` | integer count of bases tried |
| `#orderPanel` | `data-sim` | `classical-stand-in` (constant — this is the honesty marker) |
| `#cycleRing` | `data-r`, `data-rendered`, `data-truncated` | order, nodes drawn, `true` \| `false` |

## Grounded facts this plan is built on (measured at plan time, do not re-derive)

- The largest multiplicative order of any base modulo any N below 4096 is **4092**, so one order search is at most ~4092 modular multiplications — microseconds. An exhaustive sweep of *every* coprime base of the worst-case N measured 8–32 ms in node.
- Running the whole pipeline once on **every** odd non-prime-power composite below 4096 (1444 numbers) measured **15–40 ms** total against a reference implementation, with a worst case of **8 base attempts** (at n = 4037) — comfortably inside `MAX_BASE_ATTEMPTS = 24`. The 5-second budget asserted in Task 1's sweep therefore has ~100x headroom; if it trips, the implementation is wrong, not the budget.
- `N_MAX^2 = 16,777,216`, far below `2^53`, so plain `Number` arithmetic is exact throughout. `BigInt` is not needed and must not be used here (it would only slow the cycle walk).
- A faithful quantum-register simulation would need `Q = 2^ceil(2*log2 N)` amplitudes (about `N^2`): 2^24 ≈ 16.8 million complex amplitudes at N = 4096. This is the second half of the ceiling justification in the user-facing copy.
- Semiprime presets and their deterministic outcomes: 15 → 3 x 5; 21 → 3 x 7; 91 → 7 x 13; 143 → 11 x 13; 3233 → 53 x 61 (the textbook RSA modulus); 3599 → 59 x 61.
- Retry demos: base 2 on N = 3233 gives r = 780 and a^(r/2) = 3232 = -1 mod N (rejected); base 3 on N = 143 gives odd r = 15 (rejected); base 3 on N = 3233 gives r = 260, x = 794, gcd(793, 3233) = 61 and gcd(795, 3233) = 53.
- Long-period demo: base 2 on N = 3599 gives r = 1740, which exceeds `CYCLE_RENDER_CAP` and must exercise the truncated-ring path.
- Non-semiprime N do not have a single canonical factor pair (N = 4095 with base 2 yields 63 x 65), so only semiprimes may be used in equality assertions.
</contracts>

<tasks>

<task type="tracer" tdd="true">
  <name>Task 1: End-to-end Shor's run on one page — math core, hard ceiling, text verdict</name>
  <files>Shors Algorithm/shors-algorithm.html</files>
  <read_first>
    Read `Diffie-Hellman Key Exchange/diffie-hellman-key-exchange.html` lines 1–13 (pre-paint theme script, palette/site.css/theme.js link order, Google Fonts link), lines 156–180 (shared nav header block), lines 278–300 (IIFE opening and the `/* ---------- number theory ---------- */` marker style), and lines 930–960 (`STORAGE_KEY`, `persistState`/`restoreState` try/catch idiom). Read `assets/palette.css` for the `--role-*` meanings.
  </read_first>
  <behavior>
    The extract-and-eval harness in this task's verify must hold for the math core:
    - `limits()` returns `N_MAX` 4096, `MAX_ORDER_STEPS` 4096, `MAX_BASE_ATTEMPTS` 24, `CYCLE_RENDER_CAP` 96.
    - `parseNStrict('15').n === 15`; `parseNStrict('4096').ok === true`; `parseNStrict('4097').guard === 'ceiling'`; `parseNStrict('99999999').guard === 'ceiling'`; `parseNStrict('2').guard === 'too-small'`; `parseNStrict('abc').guard === 'nan'`; `parseNStrict('1e9').guard === 'nan'`; `parseNStrict(' 91 ').n === 91`.
    - Every `parseNStrict` failure message is non-empty, and the `ceiling` message contains both `4096` and the word `quantum`.
    - `multiplicativeOrder(2,15) === 4`; `multiplicativeOrder(3,91) === 6`; `multiplicativeOrder(3,3233) === 260`; `multiplicativeOrder(2,3599) === 1740`.
    - `modPowSmall(3,260,3233) === 1`; `modPowSmall(3,130,3233) === 794`.
    - `perfectPower(9)` is `[3,2]`; `perfectPower(3375)` is `[15,3]`; `perfectPower(15)` is null.
    - `isPrimeSmall(3233) === false`; `isPrimeSmall(4093) === true`; `isPrimeSmall(1) === false`.
    - `runShor(15,{bases:[2]})` → route `order`, factors `[3,5]`, r 4, attempts length 1.
    - `runShor(91,{bases:[3]})` → factors `[7,13]`, r 6.
    - `runShor(143,{bases:[3]})` → attempts[0].outcome `odd-order`, and factors still `[11,13]` from a later base.
    - `runShor(3233,{bases:[2]})` → attempts[0].outcome `minus-one`, attempts.length >= 2, factors `[53,61]`.
    - `runShor(3599,{bases:[2]})` → factors `[59,61]`, r 1740.
    - `runShor(8,{})` → route `even`, factors `[2,4]`; `runShor(9,{})` → route `perfect-power`, factors `[3,3]`; `runShor(13,{})` → route `prime`, factors null.
    - `runShor(15,{bases:[6]})` → attempts[0].outcome `lucky-gcd` (gcd(6,15) = 3), factors `[3,5]`.
    - `steps.map(s => s.id)` on a successful order run starts `precheck,pickBase,gcdCheck,orderFind` and ends `verdict`; exactly the `orderFind` steps carry `sim: true`.
    - Invariant sweep: for every odd composite n from 9 to 4095 that is not a prime power, `runShor(n,{})` returns two factors whose product is n and both strictly between 1 and n; the whole sweep finishes in under 5 seconds (this is the empirical proof the ceiling keeps the stand-in near-instant).
  </behavior>
  <precondition>`google-chrome` is on PATH (confirmed at plan time at /usr/bin/google-chrome) for the DOM-level verify commands; if it is absent, record that and fall back to the `<human-check>` for the DOM assertions only — the node-based math and structure checks must still pass.</precondition>
  <action>
    Create the directory `Shors Algorithm/` and the single self-contained file `Shors Algorithm/shors-algorithm.html`, following the Diffie-Hellman tool's structure exactly: the verbatim pre-paint inline theme script, `<link rel="stylesheet" href="../assets/palette.css">` then `../assets/site.css` then the Google Fonts link then the page's own `<style>` block, `<script defer src="../assets/theme.js"></script>`, the shared `.site-header` nav block (copy the current nav list out of `index.html` at execution time, rewrite each href with a `../` prefix, add the new entry labelled `Shor's Algorithm` pointing at `shors-algorithm.html` and mark that one `is-active`), body markup, then one IIFE `<script>` at the end of `<body>` opening at column 0 with `(function(){` and closing with `})();`.

    Declare no literal color anywhere in the file: every color resolves through `var()` against `assets/palette.css`, using its documented `--role-*` meanings — `--role-input` for the base a and the user's N, `--role-result` (with `--role-result-ink` for text on filled result surfaces) for recovered factors and the successful verdict, `--role-active` for the stage currently being narrated, `--role-inert`/`--role-inert-text` for rejected base attempts, `--role-warn` for the ceiling refusal and other guard messages, `--role-special` for the quantum-stand-in caption and the "what the quantum part really does" panel, `--role-alt` for the a^(r/2) midpoint value. A locally named custom property is allowed only for a non-color (a length) or when its value is built entirely out of `var()`/`color-mix()` references.

    Implement the pure math core per `<contracts>` in the `/* ---------- number theory ---------- */` section, DOM-free, using plain `Number` arithmetic (not `BigInt` — `N_MAX^2` is far below `2^53`, so `Number` is exact and faster here). `runShor` follows real Shor's structure in real Shor's order: classical pre-checks first (n even yields 2 and n/2, then n = b^e yields b and n/b, then n prime is reported as nothing to factor), then per attempt pick a base a in [2, n-2] (honoring `opts.bases` in order before falling back to `opts.rng` or `Math.random`), compute g = gcd(a, n) and take the lucky classical factor if g > 1, otherwise find the order r of a mod n, reject an odd r, compute x = a^(r/2) mod n and reject x === n-1, otherwise take gcd(x-1, n) and gcd(x+1, n) as the factors and record the attempt as `success`. Every rejection appends an attempt with its outcome and loops to a fresh base; exhausting `MAX_BASE_ATTEMPTS` returns route `exhausted` with factors null rather than looping. `multiplicativeOrder` counts its multiplications and returns -1 once it passes `MAX_ORDER_STEPS`, so no input and no bug can spin the loop forever; an attempt whose order search returns -1 is recorded with outcome `budget`.

    Build the safeguard as one gate, not per-call-site checks (this is the user's mandatory requirement, and defense in depth): the number field carries `min="3"` and `max="4096"`; `parseNStrict` is the only path from a string to an n, and the run button, the Enter key, the preset chips, the restored localStorage value and the `?n=` query param all go through it; while its result is not ok, `#guardBox` carries the failing `data-guard` value with `data-can-run="false"` and the run button is `disabled`, so the UI cannot start an oversized run at all. The `ceiling` message must state the number 4096 and explain the reason in the learner's terms: this page substitutes a classical cycle walk for the quantum order-finding step, that walk costs up to N modular multiplications per base attempt (and a faithful simulation of the quantum register would need about N^2 amplitudes — roughly 16.8 million at N = 4096), whereas real Shor's runs that step on quantum hardware at a cost polynomial in log N; larger N is refused because there is no quantum computer on this page, not because the arithmetic is hard.

    Support `?n=` (and optional `?a=` to force the first base) parsed with a strict all-digits test before any conversion; a `?n=` link runs through the same guard and, when it passes, resolves the run immediately with no animation so the finished state is in the DOM on first paint.

    For this tracer, render the result as the honest text spine only — no SVG yet: the page header and title `Shor's Algorithm`, a "How this works" panel naming the five stages, the controls panel (N field with `id="factorBtn"` run button written with `id` as its first attribute, `#guardBox`), a step log panel that prints each `steps[]` entry's label and detail in the Diffie-Hellman tool's `.formula` idiom, the `#orderPanel` wrapper around the order-finding step carrying `data-sim="classical-stand-in"` and the caption naming quantum phase estimation and the inverse QFT as what real hardware would do here, a rejected-attempts list, and `#verdict` carrying `data-route`, `data-factors` and `data-attempts` with the plain sentence `N = p x q`. Write every dynamic value into the DOM with `textContent` or through created element nodes — never by interpolating a parsed input into an `innerHTML` string (T-rbc-01). Seed N = 15 and resolve it on `window` load so the page is never empty.
  </action>
  <verify>
    <automated>R="$(git rev-parse --show-toplevel)"; cd "$R" &amp;&amp; F="Shors Algorithm/shors-algorithm.html"; test -f "$F" || echo MISSING-FILE; T=$(mktemp -d); awk '/^\(function\(\)[{]/{f=1} f{print} /^[}]\)\(\);/{if(f)exit}' "$F" | tee "$T/shor.js" | wc -l; node --check "$T/shor.js" &amp;&amp; echo SCRIPT-PARSES</automated>
    <automated>R="$(git rev-parse --show-toplevel)"; cd "$R" &amp;&amp; F="Shors Algorithm/shors-algorithm.html"; awk '/---------- number theory ----------/{f=1;next} /---------- state ----------/{f=0} f' "$F" | node -e "const fs=require('fs');eval(fs.readFileSync(0,'utf8'));function eq(got,want,tag){const g=JSON.stringify(got),w=JSON.stringify(want);if(g!==w)throw new Error(tag+' got'+g+' want'+w);}const L=limits();eq(L.N_MAX,4096,'N_MAX');eq(L.MAX_ORDER_STEPS,4096,'STEP_BUDGET');eq(L.MAX_BASE_ATTEMPTS,24,'ATTEMPT_CAP');eq(L.CYCLE_RENDER_CAP,96,'RENDER_CAP');eq(parseNStrict('15').n,15,'P15');eq(parseNStrict('4096').ok,true,'P-AT-CAP');eq(parseNStrict('4097').guard,'ceiling','P-OVER');eq(parseNStrict('99999999').guard,'ceiling','P-WAY-OVER');eq(parseNStrict('2').guard,'too-small','P-SMALL');eq(parseNStrict('abc').guard,'nan','P-NAN');eq(parseNStrict('1e9').guard,'nan','P-EXP');eq(parseNStrict(' 91 ').n,91,'P-TRIM');const cm=parseNStrict('5000').message;if(!/4096/.test(cm)||!/quantum/i.test(cm))throw new Error('CEILING-MSG-THIN ['+cm+']');eq(multiplicativeOrder(2,15),4,'ORD-15');eq(multiplicativeOrder(3,91),6,'ORD-91');eq(multiplicativeOrder(3,3233),260,'ORD-3233');eq(multiplicativeOrder(2,3599),1740,'ORD-3599');eq(modPowSmall(3,260,3233),1,'MODPOW-1');eq(modPowSmall(3,130,3233),794,'MODPOW-794');eq(perfectPower(9),[3,2],'PP9');eq(perfectPower(3375),[15,3],'PP3375');eq(perfectPower(15),null,'PP15');eq(isPrimeSmall(3233),false,'PRIME-F');eq(isPrimeSmall(4093),true,'PRIME-T');eq(isPrimeSmall(1),false,'PRIME-1');const a15=runShor(15,{bases:[2]});eq(a15.route,'order','R15-ROUTE');eq(a15.factors,[3,5],'R15');eq(a15.r,4,'R15-R');eq(a15.attempts.length,1,'R15-N');eq(runShor(91,{bases:[3]}).factors,[7,13],'R91');eq(runShor(91,{bases:[3]}).r,6,'R91-R');const a143=runShor(143,{bases:[3]});eq(a143.attempts[0].outcome,'odd-order','R143-ODD');eq(a143.factors,[11,13],'R143');const a3233=runShor(3233,{bases:[2]});eq(a3233.attempts[0].outcome,'minus-one','R3233-M1');if(a3233.attempts.length<2)throw new Error('R3233-NO-RETRY');eq(a3233.factors,[53,61],'R3233');const a3599=runShor(3599,{bases:[2]});eq(a3599.factors,[59,61],'R3599');eq(a3599.r,1740,'R3599-R');eq(runShor(8,{}).route,'even','EVEN-ROUTE');eq(runShor(8,{}).factors,[2,4],'EVEN');eq(runShor(9,{}).route,'perfect-power','PP-ROUTE');eq(runShor(9,{}).factors,[3,3],'PP');eq(runShor(13,{}).route,'prime','PRIME-ROUTE');eq(runShor(13,{}).factors,null,'PRIME-NULL');eq(runShor(15,{bases:[6]}).attempts[0].outcome,'lucky-gcd','LUCKY');eq(runShor(15,{bases:[6]}).factors,[3,5],'LUCKY-F');const ids=a15.steps.map(s=>s.id);if(ids.slice(0,4).join(',')!=='precheck,pickBase,gcdCheck,orderFind')throw new Error('STEP-HEAD '+ids.join(','));if(ids[ids.length-1]!=='verdict')throw new Error('STEP-TAIL '+ids.join(','));const sims=a15.steps.filter(s=>s.sim===true).map(s=>s.id);if(sims.length===0||sims.some(i=>i!=='orderFind'))throw new Error('SIM-FLAG '+sims.join(','));const t0=Date.now();let swept=0;for(let n=9;n<4096;n+=2){if(isPrimeSmall(n))continue;if(perfectPower(n))continue;const r=runShor(n,{});if(!r.factors)throw new Error('NO-FACTORS n='+n);const [p,q]=r.factors;if(p*q!==n||p<=1||q>=n)throw new Error('BAD-FACTORS n='+n+' got '+p+','+q);swept++;}const ms=Date.now()-t0;if(ms>5000)throw new Error('TOO-SLOW '+ms+'ms');console.log('MATH-OK swept='+swept+' ms='+ms)"</automated>
    <automated>R="$(git rev-parse --show-toplevel)"; cd "$R" &amp;&amp; F="Shors Algorithm/shors-algorithm.html"; p=$(grep -n 'assets/palette.css' "$F" | head -1 | cut -d: -f1); s=$(grep -n 'assets/site.css' "$F" | head -1 | cut -d: -f1); y=$(grep -n '<style>' "$F" | head -1 | cut -d: -f1); { [ -n "$p" ] &amp;&amp; [ -n "$s" ] &amp;&amp; [ -n "$y" ] &amp;&amp; [ "$p" -lt "$s" ] &amp;&amp; [ "$s" -lt "$y" ]; } &amp;&amp; echo LINK-ORDER-OK || echo BAD-LINK-ORDER; grep -q 'assets/theme.js' "$F" || echo NO-THEME-JS; grep -q "setAttribute('data-theme'" "$F" || echo NO-PREPAINT; grep -q 'fonts.googleapis.com/css2' "$F" || echo NO-FONTS; grep -q '^(function(){' "$F" || echo NO-IIFE-OPEN; grep -q '^})();' "$F" || echo NO-IIFE-CLOSE; grep -q 'BigInt' "$F" &amp;&amp; echo UNEXPECTED-BIGINT; for id in nInput aInput factorBtn guardBox verdict orderPanel stepLog attemptList presetChips; do grep -q "id=\"$id\"" "$F" || echo "MISSING-ID $id"; done; grep -q '<button id="factorBtn"' "$F" || echo FACTORBTN-ID-NOT-FIRST; for fn in limits parseNStrict gcdSmall modPowSmall isPrimeSmall perfectPower multiplicativeOrder cycleValues runShor; do grep -q "function $fn" "$F" || echo "MISSING-FN $fn"; done; grep -q 'data-sim="classical-stand-in"' "$F" || echo NO-SIM-MARKER; grep -qi 'phase estimation' "$F" || echo NO-QPE-COPY; grep -qiE 'quantum Fourier|QFT' "$F" || echo NO-QFT-COPY; grep -q 'min="3"' "$F" || echo NO-MIN-ATTR; grep -q 'max="4096"' "$F" || echo NO-MAX-ATTR; n=$(grep -o 'site-nav-link' "$F" | wc -l); [ "$n" = 9 ] || echo "NAV-COUNT $n"; a=$(grep -o 'site-nav-link is-active' "$F" | wc -l); [ "$a" = 1 ] || echo "ACTIVE-COUNT $a"; i=$(grep -c 'innerHTML[[:space:]]*=[[:space:]]*[^'"'"'"]*[+`]' "$F"); [ "$i" = 0 ] || echo "INTERPOLATED-INNERHTML $i"; echo STRUCTURE-CHECKED</automated>
    <automated>R="$(git rev-parse --show-toplevel)"; cd "$R" &amp;&amp; F="Shors Algorithm/shors-algorithm.html"; grep -nEi '#[0-9a-f]{3}\b|#[0-9a-f]{6}\b|rgba?\([0-9]|hsla?\(' "$F" | grep -vE ':[[:space:]]*(/\*|\*|//)' | grep -v 'fonts.googleapis\|fonts.gstatic' | sed 's/^/FILE-LITERAL /'; grep -nEi '(fill|stroke|color|background|border|outline|shadow)[^;]*\b(whi''te|bla''ck|red|blue|green|gold|yellow|orange|purple|pink|gray|grey|silver|cyan|magenta|navy|teal|lime|brown|violet)\b' "$F" | grep -vE ':[[:space:]]*(/\*|\*|//)' | sed 's/^/NAMED-COLOR /'; r=$(grep -o 'var(--role-' "$F" | wc -l); [ "$r" -ge 8 ] || echo "ROLE-TOKEN-USE $r"; grep -nE '^[[:space:]]*--[a-z0-9-]+[[:space:]]*:' "$F" | sed 's/^/LOCAL-TOKEN /'; echo FILE-SWEPT</automated>
    <automated>R="$(git rev-parse --show-toplevel)"; cd "$R" &amp;&amp; U="file://$R/Shors%20Algorithm/shors-algorithm.html"; dump(){ timeout 90 google-chrome --headless --no-sandbox --disable-gpu --virtual-time-budget=6000 --dump-dom "$1" 2>/dev/null; }; D=$(dump "$U?n=15"); printf '%s' "$D" | grep -q 'data-factors="3,5"' || echo BAD-N15; printf '%s' "$D" | grep -q 'data-guard="ok"' || echo BAD-N15-GUARD; printf '%s' "$D" | grep -q 'data-sim="classical-stand-in"' || echo BAD-N15-SIM; G=$(dump "$U?n=99999"); printf '%s' "$G" | grep -q 'data-guard="ceiling"' || echo BAD-CEILING-GUARD; printf '%s' "$G" | grep -q 'data-can-run="false"' || echo BAD-CEILING-LOCK; printf '%s' "$G" | grep -q 'data-factors=""' || echo CEILING-STILL-RAN; printf '%s' "$G" | grep -q '4096' || echo CEILING-MSG-NO-CAP; printf '%s' "$G" | grep -qi 'quantum' || echo CEILING-MSG-NO-REASON; printf '%s' "$G" | grep -qE 'id="factorBtn"[^>]*disabled' || echo CEILING-BUTTON-LIVE; P=$(dump "$U?n=3233&amp;a=2"); printf '%s' "$P" | grep -q 'data-factors="53,61"' || echo BAD-3233; printf '%s' "$P" | grep -qE 'data-attempts="([2-9]|[1-9][0-9])"' || echo BAD-3233-RETRY; Q=$(dump "$U?n=13"); printf '%s' "$Q" | grep -q 'data-route="prime"' || echo BAD-PRIME-ROUTE; printf '%s' "$Q" | grep -q 'data-factors=""' || echo PRIME-CLAIMED-FACTORS; echo DOM-CHECKED</automated>
    <human-check>Open `Shors Algorithm/shors-algorithm.html`. The seeded N = 15 run should already be printed end to end: pre-checks, the chosen base, the gcd check, the order-finding step visibly captioned as the quantum step being simulated classically, the parity and square-root checks, the two gcds, and the verdict `15 = 3 x 5`. Type 3233 and run it — you should sometimes see a base rejected (odd order, or a^(r/2) = -1) before it lands on 53 x 61, and the rejection must be shown, not swallowed. Type 5000 and confirm the run button goes dead and the message explains the 4096 ceiling in terms of the classical stand-in, not as a vague "too big". Type 4096 and confirm it is accepted. Paste `?n=99999` on the URL and confirm the same refusal appears on load. Toggle day/night and confirm both themes are legible.</human-check>
  </verify>
  <done>`Shors Algorithm/shors-algorithm.html` exists as one self-contained page that factors any accepted N by Shor's structure, labels the order-finding step as a classical stand-in for the quantum subroutine, refuses N above 4096 through a single guard with an explanation, and declares no literal color.</done>
</task>

<task type="auto">
  <name>Task 2: Make it teach — order ring, stepped playback, presets, persistence, explainer panels</name>
  <files>Shors Algorithm/shors-algorithm.html</files>
  <read_first>
    Read `Diffie-Hellman Key Exchange/diffie-hellman-key-exchange.html` lines 405–420 (`svgEl` helper and `SVG_NS`), lines 860–930 (`play`/`pause`/`stepOnce`/`instantFinish`/`resetPlayback` and the `generation` counter), lines 930–960 (`STORAGE_KEY`, persist/restore), and lines 201–245 (controls markup: chips, button row, speed slider). Read `Congruence Wheel/congruence-wheel.html` around line 330 for the polar-placement idiom used to lay values out on a circle.
  </read_first>
  <behavior>
    - The cycle ring drawn for a successful run has `data-r` equal to `runShor().r`, `data-rendered` equal to `min(r, 96)`, and `data-truncated="false"` when r is at most 96, `"true"` otherwise. N = 3599 with base 2 (r = 1740) must render 96 nodes, not 1740.
    - Play walks exactly the `steps[]` sequence one entry at a time; Step advances exactly one; Instant jumps to the finished state; Reset returns to the pre-run state; a rebuild triggered mid-animation bumps `generation` so no stale callback writes into the new stage.
    - A restored localStorage value is re-validated through `parseNStrict` before use, so a tampered or stale stored N cannot bypass the ceiling (T-rbc-03).
  </behavior>
  <action>
    Extend the same file with the visualization and playback layer, reusing the Diffie-Hellman tool's idioms verbatim where they apply: the `svgEl(tag, attrs)` helper with `SVG_NS`, the `generation` counter that invalidates stale timers on rebuild, `SPEED_LABELS` with the speed slider, and the Play / Pause / Step / Instant / Reset button row with the same labels and disabled-state handling.

    Add the stage SVG `#cycleRing`: the successive values a^1, a^2, a^3, ... mod N from `cycleValues(a, n, r, CYCLE_RENDER_CAP)` placed around a circle in order, joined by arrowed arcs so the walk visibly comes back around to 1 — this is the periodicity that the real quantum subroutine extracts, and it is the picture the page exists to show. Distinguish three nodes: the base a at x = 1 in `--role-input`, the midpoint value a^(r/2) in `--role-alt` (labelled as the square root of 1 that cracks N), and the closing 1 at x = r in `--role-result`. When r exceeds the cap, draw the ring as an open arc with an explicit break marker in `--role-inert`/`--role-inert-text` and a caption stating the true r and that the ring is truncated for display — never emit one node per unit of r. Set `data-r`, `data-rendered` and `data-truncated` on the SVG. Below the ring, show the post-processing as two arithmetic lines in the `.formula` idiom: `gcd(x - 1, N) = p` and `gcd(x + 1, N) = q`, with the factor values in `--role-result`.

    Wire the stepped walkthrough over `runShor().steps` exactly as the Sieve and Diffie-Hellman tools do: the current step's log row and its ring node take `--role-active`, Pause freezes in place, Step advances one, Instant reveals everything, Reset clears back to the pre-run state, and the speed slider re-paces `setTimeout`-driven advancement. Render each rejected base attempt as its own struck-through row in `#attemptList` naming why it failed (gcd was 1 and the order came out odd; or a^(r/2) was -1 mod N), in `--role-inert-text` with the reason in `--role-warn`, so the learner sees that Shor's is probabilistic and retries are normal rather than errors.

    Add the preset chips 15, 21, 91, 143, 3233 and 3599, labelling 3233 as the textbook RSA modulus, and an optional base field `#aInput` with a randomize button so a learner can force base 2 on 3233 and watch the retry happen on purpose. Every chip and the base field route through the same guard from Task 1.

    Add persistence following the Diffie-Hellman idiom: `STORAGE_KEY = 'shors-algorithm'`, storing N, the forced base (if any) and the speed, with both `localStorage` calls wrapped in `try`/`catch` so a `file://` origin degrades silently; on restore, pass the stored N back through `parseNStrict` and fall back to the default when it fails — a stored value is untrusted input, not a shortcut past the ceiling.

    Write the two explainer panels the tool's honesty depends on. First, a `--role-special` panel "What the quantum part really does": a quantum computer prepares a superposition over exponents x, evaluates a^x mod N on all of them at once, and an inverse quantum Fourier transform turns the period of that function into a measurable peak, from which r is recovered (via continued fractions) at a cost polynomial in log N — this page instead walks the cycle one multiplication at a time, which is the one thing real hardware never has to do. Second, a "Why N stops at 4096" panel that ties the ceiling to that substitution with the concrete numbers: the cycle walk costs up to N modular multiplications per base attempt, a faithful simulation of the quantum register would need about N^2 amplitudes (roughly 16.8 million at N = 4096), and both grow with N while real Shor's grows with log N. Close the page with the site's footer and pillbar idiom naming period finding, the order of a mod N, quantum phase estimation, and gcd post-processing.
  </action>
  <verify>
    <automated>R="$(git rev-parse --show-toplevel)"; cd "$R" &amp;&amp; F="Shors Algorithm/shors-algorithm.html"; T=$(mktemp -d); awk '/^\(function\(\)[{]/{f=1} f{print} /^[}]\)\(\);/{if(f)exit}' "$F" | tee "$T/shor.js" | wc -l; node --check "$T/shor.js" &amp;&amp; echo SCRIPT-PARSES</automated>
    <automated>R="$(git rev-parse --show-toplevel)"; cd "$R" &amp;&amp; F="Shors Algorithm/shors-algorithm.html"; awk '/---------- number theory ----------/{f=1;next} /---------- state ----------/{f=0} f' "$F" | node -e "const fs=require('fs');eval(fs.readFileSync(0,'utf8'));function eq(got,want,tag){const g=JSON.stringify(got),w=JSON.stringify(want);if(g!==w)throw new Error(tag+' got'+g+' want'+w);}eq(runShor(15,{bases:[2]}).factors,[3,5],'R15-REGRESS');eq(runShor(3233,{bases:[3]}).factors,[53,61],'R3233-REGRESS');eq(parseNStrict('4097').guard,'ceiling','CEILING-REGRESS');eq(limits().CYCLE_RENDER_CAP,96,'CAP-REGRESS');eq(cycleValues(2,15,4,96),[2,4,8,1],'CYCLE-15');eq(cycleValues(2,3599,1740,96).length,96,'CYCLE-CAPPED');eq(cycleValues(3,91,6,96),[3,9,27,81,61,1],'CYCLE-91');console.log('MATH-STILL-OK')"</automated>
    <automated>R="$(git rev-parse --show-toplevel)"; cd "$R" &amp;&amp; F="Shors Algorithm/shors-algorithm.html"; for t in svgEl SVG_NS generation SPEED_LABELS instantFinish resetPlayback STORAGE_KEY localStorage.setItem localStorage.getItem; do grep -q "$t" "$F" || echo "MISSING $t"; done; grep -q "STORAGE_KEY = 'shors-algorithm'" "$F" || echo BAD-STORAGE-KEY; g=$(grep -o 'generation' "$F" | wc -l); [ "$g" -ge 4 ] || echo "GEN-GUARD-THIN $g"; c=$(grep -o 'try{\|try {' "$F" | wc -l); [ "$c" -ge 2 ] || echo "STORAGE-NOT-GUARDED $c"; for id in cycleRing playBtn stepBtn instantBtn resetBtn speedInput speedLabel; do grep -q "id=\"$id\"" "$F" || echo "MISSING-ID $id"; done; for id in playBtn stepBtn instantBtn resetBtn; do grep -q "$id.addEventListener" "$F" || echo "UNWIRED $id"; done; ch=$(grep -o 'class="chip"' "$F" | wc -l); [ "$ch" = 6 ] || echo "CHIP-COUNT $ch"; for v in 15 21 91 143 3233 3599; do grep -q "data-n=\"$v\"" "$F" || echo "MISSING-PRESET $v"; done; grep -q "window.addEventListener('load'" "$F" || echo NO-LOAD-HANDLER; grep -q 'data-truncated' "$F" || echo NO-TRUNCATION-FLAG; grep -q 'CYCLE_RENDER_CAP' "$F" || echo NO-RENDER-CAP-USE; grep -qi 'continued fraction' "$F" || echo NO-CF-COPY; grep -q '16.8 million\|16,777,216' "$F" || echo NO-AMPLITUDE-FIGURE; echo VIEW-CHECKED</automated>
    <automated>R="$(git rev-parse --show-toplevel)"; cd "$R" &amp;&amp; F="Shors Algorithm/shors-algorithm.html"; grep -nEi '#[0-9a-f]{3}\b|#[0-9a-f]{6}\b|rgba?\([0-9]|hsla?\(' "$F" | grep -vE ':[[:space:]]*(/\*|\*|//)' | grep -v 'fonts.googleapis\|fonts.gstatic' | sed 's/^/FILE-LITERAL /'; grep -nEi '(fill|stroke|color|background|border|outline|shadow)[^;]*\b(whi''te|bla''ck|red|blue|green|gold|yellow|orange|purple|pink|gray|grey|silver|cyan|magenta|navy|teal|lime|brown|violet)\b' "$F" | grep -vE ':[[:space:]]*(/\*|\*|//)' | sed 's/^/NAMED-COLOR /'; grep -nE '^[[:space:]]*--[a-z0-9-]+[[:space:]]*:' "$F" | sed 's/^/LOCAL-TOKEN /'; echo FILE-SWEPT</automated>
    <automated>R="$(git rev-parse --show-toplevel)"; cd "$R" &amp;&amp; U="file://$R/Shors%20Algorithm/shors-algorithm.html"; dump(){ timeout 90 google-chrome --headless --no-sandbox --disable-gpu --virtual-time-budget=6000 --dump-dom "$1" 2>/dev/null; }; A=$(dump "$U?n=91&amp;a=3"); printf '%s' "$A" | grep -q 'data-factors="7,13"' || echo BAD-91; printf '%s' "$A" | grep -q 'data-r="6"' || echo BAD-91-R; printf '%s' "$A" | grep -q 'data-rendered="6"' || echo BAD-91-RENDERED; printf '%s' "$A" | grep -q 'data-truncated="false"' || echo BAD-91-TRUNC; B=$(dump "$U?n=3599&amp;a=2"); printf '%s' "$B" | grep -q 'data-factors="59,61"' || echo BAD-3599; printf '%s' "$B" | grep -q 'data-r="1740"' || echo BAD-3599-R; printf '%s' "$B" | grep -q 'data-rendered="96"' || echo RING-NOT-CAPPED; printf '%s' "$B" | grep -q 'data-truncated="true"' || echo BAD-3599-TRUNC; n=$(printf '%s' "$B" | grep -o '<circle' | wc -l); [ "$n" -lt 200 ] || echo "RING-NODE-BLOWUP $n"; echo DOM-CHECKED</automated>
    <human-check>Open the tool and press Reset then Play on N = 3233 with the base forced to 2. Watch the stages land in order, the ring draw the cycle of powers closing back on 1, the rejected base appear struck through with its reason, and a later base carry through to 53 x 61 with the two gcd lines. Press Pause mid-animation and confirm it stops where it is; Step should advance exactly one stage; Instant should jump to the end. While an animation is running, click a different preset chip and confirm the stage rebuilds cleanly with no ghost nodes from the abandoned run. Run 3599 and confirm the ring truncates with a caption naming the real period rather than trying to draw 1740 nodes. Reload and confirm your last N, base and speed came back; then run 5000 again and confirm the restored-value path still refuses it. Toggle day/night on a finished run and confirm the ring, its labels and the struck-through attempts are all legible in both themes.</human-check>
  </verify>
  <done>The page teaches with a diagram: the order of a mod N is drawn as a closing cycle with the midpoint and closing values called out, the run replays stage by stage under Play/Pause/Step/Instant/Reset, failed bases are shown failing, long periods truncate the ring instead of flooding the DOM, inputs and speed persist, and both explainer panels state plainly what is quantum, what is simulated, and why the ceiling exists.</done>
</task>

<task type="auto">
  <name>Task 3: Register the tool in the hub and in every page's nav</name>
  <files>index.html, Sieve Of Eratosthenes/sieve-of-eratosthenes.html, Factor Tree/factor-tree.html, Factorize By Completing The Square/factorize-completing-square.html, Congruence Wheel/congruence-wheel.html, RSA Examplifier/rsa-examplifier.html, Venn Diagrams/venn-diagrams.html, Diffie-Hellman Key Exchange/diffie-hellman-key-exchange.html</files>
  <read_first>
    Read `index.html` lines 115–141 (nav block, hero wording) and lines 181–198 (the last two cards and the footer line) to copy the card voice and placement. Then read the nav block of each of the seven existing tool pages as it stands at execution time — a sibling batch item may have renamed a tool's directory, file or label, so mirror what is actually on disk instead of any path quoted in this plan.
  </read_first>
  <action>
    Register the new tool everywhere the other seven are registered, with one surgical edit per file — never rewrite a whole page.

    In `index.html`: add a nav link and a card for the new tool. The nav entry goes last in the existing `.site-nav` list, labelled `Shor's Algorithm`, pointing at `Shors Algorithm/shors-algorithm.html`. The card goes last in `.card-grid`, matching the shape of its neighbours exactly (an `<a class="card" href="...">` wrapping an emoji `.icon`, an `<h2>` reading `Shor's Algorithm`, a one-sentence `<p>` in the same voice as the other cards — say what the learner sees and be honest that the quantum step is simulated classically, which is why N stays small — and the `<span class="go">Open tool →</span>` line). Update the two places the hub states how many tools it has: the tool-count word in the hero sentence and the tool-count word in the footer line both move up one.

    In each of the seven existing tool pages: add exactly one nav link, last in that page's `.site-nav` list, with the `../` prefix those pages use — `../Shors Algorithm/shors-algorithm.html` — labelled `Shor's Algorithm`, leaving that page's own `is-active` marker where it is. Touch nothing else in those files: the diff for each of the seven must be one added line and zero removed lines.
  </action>
  <verify>
    <automated>R="$(git rev-parse --show-toplevel)"; cd "$R" &amp;&amp; for f in index.html */*.html; do n=$(grep -o 'site-nav-link' "$f" | wc -l); [ "$n" = 9 ] || echo "NAV-COUNT $f=$n"; a=$(grep -o 'site-nav-link is-active' "$f" | wc -l); [ "$a" = 1 ] || echo "ACTIVE-COUNT $f=$a"; done; c=$(grep -rl 'shors-algorithm.html' --include='*.html' . | wc -l); [ "$c" = 9 ] || echo "REFERENCING-FILES $c"; echo NAV-CHECKED</automated>
    <automated>R="$(git rev-parse --show-toplevel)"; cd "$R" &amp;&amp; for f in index.html */*.html; do d=$(dirname "$f"); grep -o 'href="[^"]*\.html"' "$f" | sed 's/href="//;s/"$//' | while read -r h; do [ -e "$d/$h" ] || echo "BROKEN $f -> $h"; done; done; echo LINKS-RESOLVE-CHECKED</automated>
    <automated>R="$(git rev-parse --show-toplevel)"; cd "$R" &amp;&amp; grep -q 'class="card" href="Shors Algorithm/shors-algorithm.html"' index.html || echo INDEX-CARD-MISSING; g=$(grep -o 'class="go"' index.html | wc -l); [ "$g" = 8 ] || echo "CARD-COUNT $g"; h=$(grep -o '<h2>' index.html | wc -l); [ "$h" = 8 ] || echo "CARD-H2-COUNT $h"; grep -qi 'eight small browser tools' index.html || echo HERO-COUNT-NOT-UPDATED; grep -qi 'all eight tools' index.html || echo FOOTER-COUNT-NOT-UPDATED; echo INDEX-CHECKED</automated>
    <automated>R="$(git rev-parse --show-toplevel)"; cd "$R" &amp;&amp; D=$(git diff HEAD --numstat -- "Sieve Of Eratosthenes" "Factor Tree" "Factorize By Completing The Square" "Congruence Wheel" "RSA Examplifier" "Venn Diagrams" "Diffie-Hellman Key Exchange") || echo GIT-DIFF-FAILED; printf '%s\n' "$D" | awk 'NF{ c++; if ($1 != 1 || $2 != 0) print "OVERSIZED-DIFF " $0 } END{ if (c+0 != 7) print "TOUCHED-PAGE-COUNT " c+0 }'; echo DIFF-CHECKED</automated>
    <human-check>Open `index.html`. The new card should sit last beside the other seven, read in their voice, and the hero and footer should both name eight tools. Click it and land on the Shor's Algorithm tool. From there click every nav link in turn and confirm each page loads (the spaces in the directory names are the thing to watch), then use each page's own nav to come back and confirm the new page marks itself active when you arrive.</human-check>
  </verify>
  <done>The hub lists eight tools with a Shor's Algorithm card, all nine pages carry the same nine nav links with exactly one active per page, every nav href resolves to a file that exists, and the seven existing tool pages each gained exactly one line.</done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| URL query string (`?n=`, `?a=`) → page | Attacker-authored values arrive in a shareable link and are parsed by the page |
| `localStorage['shors-algorithm']` → page | Persisted JSON is user- and extension-tamperable, and is read back on every load |
| No network, no server, no package manager | The page ships zero JS dependencies; the only external request is the sitewide Google Fonts stylesheet |

## STRIDE Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation Plan |
|-----------|----------|-----------|----------|-------------|-----------------|
| T-rbc-01 | Tampering (script injection) | `?n=` / `?a=` params and restored storage values rendered into the page | high | mitigate | Strict all-digits validation before any conversion; every dynamic value written via `textContent` or created element nodes, never interpolated into an `innerHTML` string (Task 1 action; the structure verify greps for interpolated `innerHTML`) |
| T-rbc-02 | Denial of service | Order-finding loop and ring renderer driven by an oversized N | medium | mitigate | The user's mandatory safeguard: single `parseNStrict` gate with `N_MAX = 4096` plus a disabled run button, `MAX_ORDER_STEPS` budget inside the order search, `MAX_BASE_ATTEMPTS` cap on retries, and `CYCLE_RENDER_CAP` on drawn ring nodes (Tasks 1–2; verified headlessly with `?n=99999` and `?n=3599`) |
| T-rbc-03 | Tampering | Malformed or hostile `localStorage` JSON on load | low | mitigate | Both storage calls wrapped in `try`/`catch`; restored N re-validated through `parseNStrict` and discarded on failure, so storage cannot bypass the ceiling (Task 2) |
| T-rbc-04 | Information disclosure | Any user data leaving the page | low | accept | Nothing to disclose: the tool is fully client-side, keeps no user data, and makes no network call of its own |
| T-rbc-SC | Tampering (supply chain) | npm/pip/cargo installs | low | accept | This item installs no packages and adds no dependency; the page's only external resource is the Google Fonts stylesheet already used sitewide, so the package-legitimacy gate has nothing to audit |
</threat_model>

<coordination_note>
Four sibling items in this batch touch files this plan also touches, so Task 3 must read the live nav block rather than trusting any path written here:

- `260926-rba` renames the RSA tool's directory, file and user-facing label, which rewrites the nav block on every page. Whichever of the two lands first, the other must mirror what is on disk: Task 3 copies the current nav list at execution time, and its verify asserts nav link counts and that every href resolves, never a hardcoded RSA path.
- `260926-rb7` (Venn), `260926-rb9` (Congruence Wheel) and `260926-rbb` (RSA) edit the bodies of pages whose nav Task 3 also edits. The edits are in different regions, and `files_modified` declares the overlap so the coordinator can sequence the waves.

`depends_on` is empty because this tool's implementation needs nothing from any sibling item.
</coordination_note>

<verification>
1. The tool's script parses standalone and its number-theory section is DOM-free and directly testable (automated, all three tasks).
2. Every factorization the tool can produce is correct: an exhaustive sweep of every odd non-prime-power composite below 4096 returns a factor pair whose product is N, and the whole sweep finishes in under 5 seconds — the empirical proof the ceiling keeps the classical stand-in near-instant (automated, Task 1).
3. The ceiling is enforced, explained, and cannot be bypassed: `?n=99999` yields `data-guard="ceiling"`, `data-can-run="false"`, a disabled run button, no factor pair, and a message naming both 4096 and the quantum reason (automated, Task 1); the restored-storage path is re-validated through the same gate (Task 2).
4. The order-finding step is marked as a classical stand-in in the DOM (`data-sim="classical-stand-in"`) and the page's copy names quantum phase estimation, the inverse QFT and continued fractions as what real hardware does (automated, Tasks 1–2).
5. Shor's probabilistic retries are real and visible: base 2 on N = 3233 is rejected for `a^(r/2) = -1` and the run still lands on 53 x 61 with `data-attempts` above 1 (automated, Task 1).
6. Long periods truncate the drawing instead of flooding the DOM: N = 3599 reports `data-r="1740"` with `data-rendered="96"`, `data-truncated="true"` and under 200 circles in the dump (automated, Task 2).
7. The page declares no literal color and uses at least eight `--role-*` references; any locally declared custom property is surfaced for review (automated, Tasks 1–2).
8. The site stays coherent: nine pages, nine nav links each, exactly one active per page, every href resolving, eight hub cards, and one added line per existing tool page (automated, Task 3).
</verification>

<success_criteria>
- A learner can open one page, press Play, and watch Shor's algorithm factor 3233 into 53 x 61 stage by stage, including a base being rejected and retried.
- Nothing on the page claims quantum computation is happening: the order-finding stage is labelled as a classical cycle walk standing in for quantum phase estimation, and the page says why that substitution forces a small N.
- No input path can start a run above N = 4096, and the refusal explains the reason rather than just the limit.
- The tool is indistinguishable in shape from its seven siblings: one Title-Case directory, one self-contained `.html` file, inline `<style>` and IIFE `<script>`, palette-only colors, shared nav and theme toggle, no dependency beyond Google Fonts.
</success_criteria>

<output>
Create `.planning/quick/260926-rbc-add-a-new-browser-tool-that-explains-and-performs-small-fact/260926-rbc-SUMMARY.md` when done
</output>
