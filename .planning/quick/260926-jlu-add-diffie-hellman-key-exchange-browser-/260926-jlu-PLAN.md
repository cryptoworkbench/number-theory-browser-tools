---
phase: quick-260926-jlu
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - Diffie-Hellman Key Exchange/diffie-hellman-key-exchange.html
  - index.html
  - Sieve Of Eratosthenes/sieve-of-eratosthenes.html
  - Factor Tree/factor-tree.html
  - Factorize By Completing The Square/factorize-completing-square.html
  - Pizza Slices/pizza-slices.html
  - RSA Examplifier/rsa-examplifier.html
  - Venn Diagrams/venn-diagrams.html
autonomous: true
requirements: [NAV-01, NAV-02, PAL-01, PAL-02, PAL-04]

estimate:
  tokens: 85000
  raw_tokens: 85000
  tasks: 3
  confidence: low

must_haves:
  truths:
    - "Opening `Diffie-Hellman Key Exchange/diffie-hellman-key-exchange.html` shows a completed worked exchange (seeded p = 23, g = 5, a = 6, b = 15) with Alice on one side, Bob on the other, Eve tapping the wire between them."
    - "Pressing Play replays the exchange as a ten-step animation in this order: agree on public p and g, Alice picks her private exponent, Bob picks his, each computes their public value by modular exponentiation, the two public values travel across the wire, each raises the received value to their own private exponent, and both land on the same shared secret."
    - "Only the public values ever cross the wire: Eve's notebook holds exactly p, g, A and B, and states in so many words that a, b and the shared secret never touched the wire."
    - "Alice's secret (B^a mod p) and Bob's secret (A^b mod p) are equal for every input the page accepts, and the page shows both computations side by side arriving at the same number."
    - "After the final step the page names what Eve would have to solve — the discrete logarithm problem on the concrete intercepted instance, and the computational Diffie-Hellman problem — in a box styled like the RSA tool's Eve's-attack narrative."
    - "The last line on the page reads exactly `Now Alice and Bob can use $SHARED_SECRET as the key used for symmetric encryption using an algorithm like AES, Blowfish, etc.` with the computed shared secret's plain decimal digits substituted for $SHARED_SECRET."
    - "Play, Pause, Step, Instant and Reset behave exactly as they do in the Sieve tool, and restarting mid-flight never lets a stale in-flight packet callback write to the rebuilt stage."
    - "The page declares no literal color and re-themes with the shared day/night toggle; every color resolves through var() against assets/palette.css including its --role-* layer."
    - "The hub shows a Diffie-Hellman card and all eight pages carry the same eight nav links with exactly one marked active."
  artifacts:
    - "Diffie-Hellman Key Exchange/diffie-hellman-key-exchange.html"
  key_links:
    - "diffie-hellman-key-exchange.html -> ../assets/palette.css, then ../assets/site.css, then the tool's own <style>"
    - "diffie-hellman-key-exchange.html -> ../assets/theme.js plus the verbatim pre-paint inline theme script"
    - "p, g, a, b inputs -> parseBigIntStrict -> buildExchange() -> steps[] -> SVG stage + HTML arithmetic log + Eve's notebook + aesSentence()"
    - "buildExchange().steps -> playback engine (play/pause/step/instant) -> per-step reveal, guarded by the generation counter"
    - "index.html card href and all-page nav hrefs -> Diffie-Hellman Key Exchange/diffie-hellman-key-exchange.html"
---

<objective>
Add a seventh tool to the site: a Diffie-Hellman key exchange visualizer that animates Alice and Bob agreeing on a public group, privately picking exponents, exchanging only their public values across a wire Eve is tapping, and independently arriving at the same shared secret — then names the hard problem Eve is left holding.

Purpose: Diffie-Hellman is the one place where a learner can *see* that a secret can be built in public. The existing RSA tool already frames the Alice/Bob/Eve story and mentions the discrete logarithm problem as "the hard problem behind Diffie-Hellman" without ever showing it; this tool is that missing page, and it is the natural companion piece to RSA on the hub.
Output: `Diffie-Hellman Key Exchange/diffie-hellman-key-exchange.html` (one self-contained file), plus the hub card and the site-wide nav entry that make it reachable.
</objective>

<execution_context>
@~/.claude/gsd-core/workflows/execute-plan.md
@~/.claude/gsd-core/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@CLAUDE.md
@.claude/CLAUDE.md

Primary narrative + BigInt template (Alice/Bob/Eve panels, avatars, `.substep`/`.formula`/`.notebook`/`.dlp-box`, `modPowPlain`, `isPrimeBig`, `parseBigIntStrict`, `fmt`, `randomBigIntInRange`, the Eve-attack button that reports tries and `performance.now()` ms):
@RSA Examplifier/rsa-examplifier.html

Primary playback template (`.controls`/`.btn-row`/`.speed-wrap`/`.banner`/`.legend`, `SPEED_LABELS`, `playing`/`rafId`/`stepIndex`, `play`/`pause`/`stepOnce`/`instantFinish`/`resetPlaybackState`, button label semantics):
@Sieve Of Eratosthenes/sieve-of-eratosthenes.html

Secondary animation template (`svgEl` + `SVG_NS`, the `diagramGen` generation counter that invalidates stale animation callbacks, `easeInOutCubic`, rAF tween):
@Factorize By Completing The Square/factorize-completing-square.html

Color token contract, including the --role-* semantic layer and its header comment naming which role means what:
@assets/palette.css

Head order, nav markup, hub card shape and the tool-count wording:
@index.html

Closest precedent — the last new tool added to this site, same three-task shape, same verification gates:
@.planning/quick/260925-pw2-create-venn-diagrams-tool-two-circle-ven/260925-pw2-PLAN.md
</context>

<tasks>

<task type="tracer" tdd="true">
  <name>Task 1: End-to-end Diffie-Hellman page — inputs through math through rendered shared secret, one static pass</name>
  <files>Diffie-Hellman Key Exchange/diffie-hellman-key-exchange.html</files>

  <read_first>
    - `RSA Examplifier/rsa-examplifier.html` — lines 1-150 for the head/style vocabulary, 154-247 for the chrome + panel markup, 249-330 for the BigInt helpers to duplicate, 474-536 for the wire/notebook/Eve-problem rendering to mirror.
    - `Sieve Of Eratosthenes/sieve-of-eratosthenes.html` — lines 383-403 for the controls markup shape, 42-165 for the `.controls`/`.btn-row`/`button`/`.speed-wrap` CSS.
    - `Venn Diagrams/venn-diagrams.html` — lines 1-14 for the exact head order and Google Fonts link to copy (newest tool, canonical head).
    - `assets/palette.css` — the `--role-*` block comment, for the role mapping below.
  </read_first>

  <behavior>
    The pure number-theory section is asserted standalone in node by this task's math gate. It must satisfy, exactly:
    - `modPowPlain(5n, 6n, 23n)` is `8n`; `modPowPlain(5n, 15n, 23n)` is `19n`; `modPowPlain(19n, 6n, 23n)` is `2n`; `modPowPlain(8n, 15n, 23n)` is `2n`.
    - `multiplicativeOrder(5n, 23n)` is `22n` (5 is a primitive root mod 23); `multiplicativeOrder(2n, 23n)` is `11n` (2 generates a subgroup of half the size).
    - `isPrimeBig` is true for 23, 1019 and 2147483647; false for 1, 561 (a Carmichael number — trial-division-flavoured tests get this wrong) and 2147483645.
    - `fmt(1234567n)` is `1,234,567`.
    - `shortVal(123456789012n)` returns all twelve digits unchanged; `shortVal(1234567890123n)` returns the first eight digits followed by a single U+2026 ellipsis.
    - `buildExchange(23n, 5n, 6n, 15n)` returns `publicAlice` 8n, `publicBob` 19n, `secretAlice` 2n, `secretBob` 2n.
    - `buildExchange(...).steps` maps to exactly these ten ids in this order: `agree`, `alicePicks`, `bobPicks`, `aliceComputesPublic`, `bobComputesPublic`, `sendAliceToBob`, `sendBobToAlice`, `aliceComputesSecret`, `bobComputesSecret`, `match`.
    - `aesSentence(2n)` returns exactly `Now Alice and Bob can use 2 as the key used for symmetric encryption using an algorithm like AES, Blowfish, etc.`
    - `parseBigIntStrict('12a')` throws.
    - Fuzzed: for p = 1019, g = 2 and forty random exponent pairs drawn by `randomBigIntInRange(2n, p-2n)`, `secretAlice` always equals `secretBob`.
  </behavior>

  <precondition>`node` is on PATH (this task's verify gates run `node --check` and a `node -e` math harness against the new file).</precondition>

  <action>
Create the directory `Diffie-Hellman Key Exchange` and the single self-contained file `diffie-hellman-key-exchange.html` inside it. No other file gains a dependency on it in this task. Follow the repo's hard conventions throughout: 2-space indent, semicolons, camelCase identifiers, `/* ---------- Text ---------- */` section markers, all CSS inline in one `<style>` block in `<head>`, all JS inline in one `<script>` block at the end of `<body>`, wrapped in an IIFE, no external JS dependency beyond Google Fonts, number-theory helpers duplicated locally rather than imported from another tool.

HEAD — copy the head of `Venn Diagrams/venn-diagrams.html` element for element and in that order: doctype, `html lang="en"`, meta charset, the pre-paint theme IIFE copied verbatim (byte for byte — it reads the `theme` query param, then the `site-theme` cookie, then localStorage, and sets `data-theme` before first paint), meta viewport, the title `Diffie-Hellman Key Exchange`, `../assets/palette.css`, then `../assets/site.css`, then the deferred `../assets/theme.js`, then the fonts preconnect and the same Fraunces/Source Sans 3/JetBrains Mono href index.html uses, and only then the tool's own `<style>`. The palette link must precede the site link which must precede the style block — that ordering is what makes the role tokens resolvable and is gated.

CHROME — copy the `.site-header` block from the RSA tool, then add an eighth nav link pointing at `diffie-hellman-key-exchange.html` (label: `Diffie-Hellman`) placed last, after the Venn Diagrams link. On this page that eighth link carries `is-active` and no other link does. Every other nav href on this page is `../`-relative, matching the RSA tool's.

STYLE — reuse the RSA tool's class vocabulary verbatim so the two crypto pages read as siblings: `.app`, `.page-header`, `.panel`, `.step-head`, `.step-num`, `.intro`, `.person-panel` (with `.alice` / `.bob` top-border variants), `.avatar-row`, `.avatar` (with `.alice` / `.bob` / `.eve` variants), `.field-row`, `.field`, `button` plus `.primary`, `.ghost`, `.danger`, `.error-box`, `.substep`, `.formula` with `.lbl` and `.val`, `.notebook` with its dashed border and `.grid`/`.never` children, `.dlp-box` with its `.tag`, `.result-box`, `footer`, `.pillbar`. Add from the Sieve tool: `.controls`, `.btn-row`, `.speed-wrap`, `.banner`. Add from the Factor Tree tool: `.chips` and `.chip`. Add only these new rules of your own: `#stageSvg` sizing (`width:100%`, `height:auto`, `display:block`), an `.svg-row` text class with a hidden state (`opacity:0`) and an `.is-active` state that tints with `--role-active`, a `.packet` class for the travelling value, and `[hidden]{ display:none !important; }`.

COLOR CONTRACT (PAL-01/PAL-02/PAL-04) — the `<style>` block declares NO literal color: no hex triplet, no functional rgb or hsl notation, no CSS named keyword. Every color is `var(--token)` or a `color-mix(in srgb, var(--token) N%, transparent)` built from tokens, exactly as the RSA tool does it. Map this tool's concepts onto the existing semantic roles: Alice to `--role-alt`, Bob to `--role-input`, Eve and both private exponents to `--role-warn` (the RSA tool already uses `--role-warn` for both Eve and the private key card — keep that reading), computed public values and the shared secret to `--role-result`, the currently-animating step to `--role-active`, not-yet-revealed rows to `--role-inert` / `--role-inert-text`, and the Eve's-hard-problem box to `--role-special` (the palette comment names `--role-special` as the RSA discrete-log aside; here the discrete log is the main event, so it keeps that role). A locally named custom property is allowed only if its value is a non-color length or is itself built purely from `var()` references.

BODY MARKUP — inside `.app`: a `.page-header` (h1 `Diffie-Hellman Key Exchange`, one intro paragraph in the RSA tool's register); an `.intro` panel titled `How this works` that tells the story in one paragraph with `<strong class="a">Alice</strong>`, `<strong class="b">Bob</strong>`, `<strong class="e">Eve</strong>` styled like the RSA intro, plus a second paragraph warning that this is a teaching demo — toy-sized parameters, exponents drawn from `Math.random` which is not a cryptographic RNG, no key derivation function on the shared secret — and that it must never be used for anything real; a `.panel .controls` block holding the four inputs `pInput` (public prime modulus p), `gInput` (generator g), `aInput` (Alice's private exponent a), `bInput` (Bob's private exponent b), a `.chips` row with id `presetChips`, a `.btn-row` with `buildBtn` (class `primary`), `playBtn`, `stepBtn`, `instantBtn`, `resetBtn` (class `ghost`), `randomSecretsBtn` (class `ghost`), a bit-size `<select id="bitsInput">` offering 16 / 32 / 64 and `genPrimeBtn` (class `ghost`) beside it, a `.speed-wrap` with `speedInput` (range 1-10, value 4) and `speedLabel`, and an `errorBox` with class `error-box`; a `#banner` with class `banner`; a `.panel` containing `<svg id="stageSvg">`; a `.panel` containing `<div id="mathLog">`; a `.panel` containing `<div id="eveNotebook">`; a `.panel` containing `<div id="eveProblem">` and `<p id="aesLine">`; and a `footer` with a `.pillbar` of three short pills (suggested: `discrete log problem`, `BigInt modular exponentiation`, `Miller-Rabin primality`).

The preset chips are `<button class="chip" data-p="…" data-g="…" data-a="…" data-b="…">` and there are exactly three, with labels that state only the numbers (never a claim about whether g is a primitive root — the page computes and displays the true order at runtime instead): p = 23 / g = 5 / a = 6 / b = 15; p = 1019 / g = 2 / a = 199 / b = 411; p = 2147483647 / g = 7 / a = 1234567 / b = 98765431. All three moduli are prime and all four exponents sit in the legal range.

SCRIPT — one `<script>` block at the end of `<body>`. The IIFE opener `(function(){` sits at column 0 on its own line and the closer `})();` sits at column 0 on its own line, with `"use strict";` as the first statement inside — the verify gate slices the IIFE on exactly those two column-0 anchors to run `node --check`. Inside, lay the code out in these sections, with these two markers spelled exactly so the math gate can slice the pure section: a marker reading `---------- number theory ----------`, then immediately after the pure helpers a marker reading `---------- state ----------`.

The `number theory` section contains ONLY pure functions — no DOM reference, no reference to module state, nothing executed at load time:
- `parseBigIntStrict(str, allowZero)`, `fmt(x)`, `bigGcd(a, b)`, `randomBigIntBits(bits)`, `randomBigIntInRange(min, max)`, `modPowPlain(base, exp, mod)` and `isPrimeBig(n, rounds)` — duplicate these from the RSA tool unchanged (that is the intended per-file duplication, not an import).
- `factorSmall(n, cap)` — trial-divide n, returning either the array of distinct prime factors or `null` once the divisor exceeds `cap` (use cap 200000) without finishing. This is what makes the order computation honest instead of guessed.
- `multiplicativeOrder(g, p)` — factor p−1 with `factorSmall`; if that returns null, return null (order unknown, not wrongly claimed). Otherwise start from p−1 and, for each distinct prime factor q, keep dividing the candidate order by q while `modPowPlain(g, candidate / q, p)` is still 1. Return the resulting BigInt.
- `shortVal(x)` — the stage label form: the plain decimal string when it is at most 12 characters, otherwise its first 8 characters plus a single U+2026 ellipsis. Long moduli must not overflow the SVG; the full digits live in the HTML log, which wraps.
- `buildExchange(p, g, a, b)` — the whole exchange as data, with no rendering. Compute `publicAlice = modPowPlain(g, a, p)`, `publicBob = modPowPlain(g, b, p)`, `secretAlice = modPowPlain(publicBob, a, p)`, `secretBob = modPowPlain(publicAlice, b, p)`, and return them together with `order` (from `multiplicativeOrder`) and a `steps` array of exactly the ten step objects in the order listed in `<behavior>`. Each step object carries `id`, `owner` (`public`, `alice`, `bob` or `wire`), `caption` (the one-line banner text for that step) and the BigInt values that step reveals. Nothing in `buildExchange` reads the DOM: this is the single source of truth that both the static render here and the playback engine in Task 2 consume.
- `aesSentence(secret)` — returns the literal `Now Alice and Bob can use `, then `secret.toString()` (plain digits, NO thousands separators — this line is the key itself, so it must read as the literal value, unlike the `fmt`-formatted values elsewhere on the page), then ` as the key used for symmetric encryption using an algorithm like AES, Blowfish, etc.` This function is the single producer of that mandated sentence and is asserted character-for-character by the math gate.

The `state` section onward wires the page:
- `svgEl(tag, attrs)` and `SVG_NS` duplicated verbatim from the Completing-the-Square tool.
- Validation in one `readInputs()` that returns either a parsed `{p, g, a, b}` or writes a specific message into `errorBox` and returns null, following the RSA tool's `generateKeys` validation voice: p must parse as a positive integer, be at most 80 digits (keep the page responsive — this is a teaching demo, not a key generator), be at least 5, and pass `isPrimeBig`; g must satisfy 2 ≤ g ≤ p−2; a and b must each satisfy 2 ≤ exponent ≤ p−2. Nothing that fails these checks can reach the DOM, so only digit strings derived from BigInts are ever interpolated (T-JLU-01).
- `buildStage(ex)` — build the SVG with `svgEl` against a fixed `viewBox="0 0 900 460"` and `preserveAspectRatio="xMidYMid meet"`, plus `role="img"` and an `aria-label` naming the diagram. Geometry: Alice's card is a rounded rect at (30, 40) sized 250x300 and Bob's at (620, 40) sized 250x300; the wire is a dashed horizontal line from (300, 120) to (600, 120) drawn in the RSA tool's dashed-track idiom; Eve's box is a rounded rect at (330, 350) sized 240x80, with a dashed tap line from (450, 120) down to (450, 350) and a tap label above it. Inside each participant card place five `.svg-row` `<text>` rows at y = 90, 140, 190, 240, 290 for: the agreed public p and g, that side's own private exponent (marked as never sent), that side's computed public value, the value received from the other side, and the shared secret — every row rendered with `shortVal` and every row starting hidden. Eve's box gets four rows for p, g, A and B, also starting hidden.
- `renderStep(step, ex)` — reveal exactly what one step id reveals: unhide the matching `.svg-row` text nodes, mark them `.is-active`, clear `.is-active` from the previous step's rows, append one `.substep` to `#mathLog` carrying that step's heading and a `.formula` line with the full `fmt`-formatted arithmetic (for example the `aliceComputesPublic` step reads `A = g^a mod p` with the three actual numbers and the result in a `.val` span, in the RSA tool's exact `.formula` markup), and set `#banner` to the step's caption. The `agree` step also appends the runtime order note: when `ex.order` is non-null say that g generates a subgroup of that order and, when the order equals p−1, that g is therefore a primitive root; when `ex.order` is null say the order is unknown because p−1 did not fully factor in-browser. The `sendAliceToBob` and `sendBobToAlice` steps also add the corresponding row to Eve's notebook. The `match` step asserts `secretAlice === secretBob` and renders the agreement callout.
- `renderNotebook(ex)` — Eve's `.notebook` block in the RSA tool's shape: heading, a `.grid` of exactly four captured values (p, g, A, B), and a `.never` line stating that Alice's a, Bob's b and the shared secret never touched the wire, so Eve does not have them.
- `renderEveProblem(ex)` — a `.dlp-box` titled around what Eve is up against, with the `.tag` pill, one `.substep` stating the discrete logarithm problem on the concrete intercepted instance (find a with g^a mod p = A, or b with g^b mod p = B, spelling out the real numbers), a second `.substep` stating the computational Diffie-Hellman problem (given only p, g, A and B, compute g^(ab) mod p — no easier than the discrete log by any known method, and not known to be equivalent to it either), and a `#eveDlogBtn` button with class `danger` that lets Eve brute-force the discrete log for A: when p is at most 100000, loop x from 1 while x < p−1 computing `modPowPlain(g, x, p)` until it equals A, then report the recovered exponent, the number of trials and the elapsed `performance.now()` milliseconds in a `.result-box`, exactly as the RSA tool reports its factoring attempt; when p is larger, report instead that the search space is about p candidates and that brute force is hopeless at this size, in the RSA tool's giving-up voice, and cap any loop at 2000000 iterations so the tab cannot be wedged (T-JLU-02).
- `renderAesLine(ex)` — write `aesSentence(ex.secretAlice)` into `#aesLine` as text. This element and `#eveProblem` both carry `hidden` until the `match` step has run.
- `rebuild()` — read and validate the inputs, call `buildExchange`, `buildStage`, clear `#mathLog`/`#eveNotebook`/`#eveProblem`/`#aesLine`, then in THIS task reveal every step immediately by looping `renderStep` over all ten steps, render the notebook, the Eve's-problem box and the AES line, and unhide them. That full-reveal loop becomes the instant-finish path in Task 2, so keep it as its own named function `revealAll(ex)`.
- Wiring at the bottom: `buildBtn` click, Enter keydown on each of the four inputs, preset chip clicks (write all four data attributes into the inputs, then rebuild), `randomSecretsBtn` (draw a and b with `randomBigIntInRange(2n, p-2n)` for the current p, then rebuild), `genPrimeBtn` (search for a safe prime of the selected bit size — draw a random odd candidate q of one fewer bit, test with `isPrimeBig`, accept when both q and 2q+1 are prime, cap the search at 4000 candidates and report failure in `errorBox` rather than hanging — write 2q+1 into `pInput`, write 2 into `gInput`, redraw a and b, then rebuild), and a `window.addEventListener('load', ...)` that seeds the first preset and calls `rebuild()` so the page is never empty on arrival, matching the load-time worked example every other tool on this site opens with. Leave `playBtn`, `stepBtn`, `instantBtn`, `resetBtn` and `speedInput` present in the markup but inert in this task — Task 2 wires them.
  </action>

  <verify>
    <automated>cd /home/mainaccount/Claude/number-theory-browser-tools &amp;&amp; F="Diffie-Hellman Key Exchange/diffie-hellman-key-exchange.html"; T=$(mktemp -d); awk '/^\(function\(\)[{]/{f=1} f{print} /^[}]\)\(\);/{if(f)exit}' "$F" | tee "$T/dh.js" | wc -l; node --check "$T/dh.js" &amp;&amp; echo SCRIPT-PARSES</automated>
    <automated>cd /home/mainaccount/Claude/number-theory-browser-tools &amp;&amp; F="Diffie-Hellman Key Exchange/diffie-hellman-key-exchange.html"; awk '/---------- number theory ----------/{f=1;next} /---------- state ----------/{f=0} f' "$F" | node -e "const fs=require('fs');eval(fs.readFileSync(0,'utf8'));function eq(got,want,tag){if(got!==want)throw new Error(tag+' got['+got+'] want['+want+']');}eq(modPowPlain(5n,6n,23n),8n,'PUBA');eq(modPowPlain(5n,15n,23n),19n,'PUBB');eq(modPowPlain(19n,6n,23n),2n,'SECA');eq(modPowPlain(8n,15n,23n),2n,'SECB');eq(multiplicativeOrder(5n,23n),22n,'ORD5');eq(multiplicativeOrder(2n,23n),11n,'ORD2');if(!isPrimeBig(23n)||!isPrimeBig(1019n)||!isPrimeBig(2147483647n))throw new Error('PRIME-FALSE-NEG');if(isPrimeBig(1n)||isPrimeBig(561n)||isPrimeBig(2147483645n))throw new Error('PRIME-FALSE-POS');eq(fmt(1234567n),'1,234,567','FMT');eq(shortVal(123456789012n),'123456789012','SHORT-KEEP');eq(shortVal(1234567890123n),'12345678…','SHORT-CUT');const ex=buildExchange(23n,5n,6n,15n);eq(ex.publicAlice,8n,'EX-A');eq(ex.publicBob,19n,'EX-B');eq(ex.secretAlice,2n,'EX-SA');eq(ex.secretBob,2n,'EX-SB');eq(ex.steps.map(s=>s.id).join(','),'agree,alicePicks,bobPicks,aliceComputesPublic,bobComputesPublic,sendAliceToBob,sendBobToAlice,aliceComputesSecret,bobComputesSecret,match','STEP-IDS');eq(aesSentence(ex.secretAlice),'Now Alice and Bob can use 2 as the key used for symmetric encryption using an algorithm like AES, Blowfish, etc.','AES-LINE');let threw=false;try{parseBigIntStrict('12a');}catch(e){threw=true;}if(!threw)throw new Error('PARSE-NOT-STRICT');for(let t=0;t&lt;40;t++){const p=1019n,g=2n;const a=randomBigIntInRange(2n,p-2n),b=randomBigIntInRange(2n,p-2n);const r=buildExchange(p,g,a,b);if(r.secretAlice!==r.secretBob)throw new Error('RANDOM-MISMATCH a='+a+' b='+b);}console.log('MATH-OK');"</automated>
    <automated>cd /home/mainaccount/Claude/number-theory-browser-tools &amp;&amp; F="Diffie-Hellman Key Exchange/diffie-hellman-key-exchange.html"; test -f "$F" || echo MISSING-FILE; p=$(grep -n 'assets/palette.css' "$F" | head -1 | cut -d: -f1); s=$(grep -n 'assets/site.css' "$F" | head -1 | cut -d: -f1); y=$(grep -n '<style>' "$F" | head -1 | cut -d: -f1); { [ -n "$p" ] &amp;&amp; [ -n "$s" ] &amp;&amp; [ -n "$y" ] &amp;&amp; [ "$p" -lt "$s" ] &amp;&amp; [ "$s" -lt "$y" ]; } &amp;&amp; echo LINK-ORDER-OK || echo BAD-LINK-ORDER; grep -q 'assets/theme.js' "$F" || echo NO-THEME-JS; grep -q "setAttribute('data-theme'" "$F" || echo NO-PREPAINT; grep -q 'fonts.googleapis.com/css2' "$F" || echo NO-FONTS; grep -q 'function svgEl' "$F" || echo NO-SVGEL; grep -q 'SVG_NS' "$F" || echo NO-SVGNS; grep -q "^(function(){" "$F" || echo NO-IIFE-OPEN; grep -q "^})();" "$F" || echo NO-IIFE-CLOSE; for id in pInput gInput aInput bInput buildBtn playBtn stepBtn instantBtn resetBtn randomSecretsBtn bitsInput genPrimeBtn speedInput speedLabel presetChips errorBox banner stageSvg mathLog eveNotebook eveProblem aesLine eveDlogBtn; do grep -q "id=\"$id\"" "$F" || grep -q "'$id'" "$F" || echo "MISSING-ID $id"; done; for fn in parseBigIntStrict bigGcd randomBigIntInRange modPowPlain isPrimeBig factorSmall multiplicativeOrder shortVal buildExchange aesSentence revealAll; do grep -q "function $fn" "$F" || echo "MISSING-FN $fn"; done; c=$(grep -o 'class="chip"' "$F" | wc -l); [ "$c" = 3 ] || echo "CHIP-COUNT $c"; n=$(grep -o 'site-nav-link' "$F" | wc -l); [ "$n" = 8 ] || echo "NAV-COUNT $n"; a=$(grep -o 'site-nav-link is-active' "$F" | wc -l); [ "$a" = 1 ] || echo "ACTIVE-COUNT $a"; for h in '../index.html' '../Sieve Of Eratosthenes/sieve-of-eratosthenes.html' '../Factor Tree/factor-tree.html' '../Factorize By Completing The Square/factorize-completing-square.html' '../Pizza Slices/pizza-slices.html' '../RSA Examplifier/rsa-examplifier.html' '../Venn Diagrams/venn-diagrams.html' 'diffie-hellman-key-exchange.html'; do grep -q "href=\"$h\"" "$F" || echo "MISSING-NAV-HREF $h"; done; grep -nE '^[[:space:]]*--[a-z0-9-]+[[:space:]]*:' "$F" | sed 's/^/LOCAL-TOKEN /'; echo STRUCTURE-CHECKED</automated>
    <automated>cd /home/mainaccount/Claude/number-theory-browser-tools &amp;&amp; F="Diffie-Hellman Key Exchange/diffie-hellman-key-exchange.html"; grep -nEi '#[0-9a-f]{3}\b|#[0-9a-f]{6}\b|rgba?\([0-9]|hsla?\(' "$F" | grep -vE ':[[:space:]]*(/\*|\*|//)' | grep -v 'fonts.googleapis\|fonts.gstatic' | sed 's/^/FILE-LITERAL /'; grep -nEi '(fill|stroke|color|background|border|outline|shadow)[^;]*\b(whi''te|bla''ck|red|blue|green|gold|yellow|orange|purple|pink|gray|grey|silver|cyan|magenta|navy|teal|lime|brown|violet)\b' "$F" | grep -vE ':[[:space:]]*(/\*|\*|//)' | sed 's/^/NAMED-COLOR /'; r=$(grep -o 'var(--role-' "$F" | wc -l); [ "$r" -ge 8 ] || echo "ROLE-TOKEN-USE $r"; echo FILE-SWEPT</automated>
    <human-check>Open `Diffie-Hellman Key Exchange/diffie-hellman-key-exchange.html` in a browser. The seeded example (p = 23, g = 5, a = 6, b = 15) should already be fully drawn: Alice on the left, Bob on the right, the dashed wire between them with Eve tapping it from below, and both sides' shared secret reading 2. Confirm the last line reads `Now Alice and Bob can use 2 as the key used for symmetric encryption using an algorithm like AES, Blowfish, etc.` Click the second and third preset chips and confirm the stage rebuilds with the long values elided on the diagram but printed in full in the arithmetic log. Press the Eve brute-force button on the p = 23 preset (she should recover the exponent and report her trial count) and again on the p = 2147483647 preset (she should report the search as hopeless, not freeze the tab). Enter a non-prime p, a g of 1, and an exponent of 0 in turn and confirm each gets its own specific message and nothing renders. Toggle day/night and confirm both themes are legible, including the SVG text on the participant cards.</human-check>
  </verify>

  <done>
    - `Diffie-Hellman Key Exchange/diffie-hellman-key-exchange.html` exists as one self-contained file with inline style and inline script, linking only palette.css, site.css, theme.js and Google Fonts.
    - The IIFE parses under `node --check` and the sliced `number theory` section evaluates standalone in node satisfying every assertion in `<behavior>`, including the forty-pair fuzz showing both sides always agree.
    - Opening the page shows a complete worked exchange end to end — public parameters, two private exponents that never cross the wire, two public values that do, two independent secret computations landing on the same number, Eve's four-item notebook, the discrete-log and computational-Diffie-Hellman statements, and the mandated AES sentence with the real secret substituted.
    - The file declares no literal color, uses at least eight `--role-*` references, and carries eight nav links with exactly one active.
  </done>

  <reversibility rating="reversible">A new self-contained file that nothing else references yet; deleting the directory fully undoes it.</reversibility>
</task>

<task type="auto">
  <name>Task 2: Turn the static reveal into a stepped animation with Sieve-style playback controls</name>
  <files>Diffie-Hellman Key Exchange/diffie-hellman-key-exchange.html</files>

  <read_first>
    - `Sieve Of Eratosthenes/sieve-of-eratosthenes.html` — lines 642-783 for `frameStep`/`play`/`pause`/`stepOnce`/`instantFinish`/`resetPlaybackState` and the exact button-label and disabled-state semantics, and line 471 for `SPEED_LABELS`.
    - `Factorize By Completing The Square/factorize-completing-square.html` — lines 546-600 and 660-700 for `diagramGen` generation-counter invalidation, `easeInOutCubic` and the rAF tween shape.
  </read_first>

  <action>
Extend the file from Task 1 in place. Do not restructure the sections or rename anything the Task 1 gates assert; `buildExchange` stays the single source of truth and `revealAll` stays as the instant-finish path.

Add a `---------- playback ----------` section after the render functions holding the engine:
- Module state: `currentExchange`, `stepIndex`, `playing`, `rafId`, `lastAdvance`, `generation`, `tweenFrame`.
- `SPEED_LABELS` copied verbatim from the Sieve tool (the same ten words, glacial through instant-ish), plus a local `SPEED_MS` dwell table mapping speed 1-10 to per-step milliseconds on a falling ramp from roughly 2600 down to roughly 90.
- `frameStep(ts)` — return immediately unless `playing`; when `ts - lastAdvance` has reached the current speed's dwell, call `advanceOne()` and reset `lastAdvance`; stop and call `pause()` once `stepIndex` has passed the last step; otherwise re-arm with `requestAnimationFrame`.
- `advanceOne()` — apply `renderStep` for `currentExchange.steps[stepIndex]`, increment `stepIndex`, and when the step id is `sendAliceToBob` or `sendBobToAlice` also fire the packet tween; when the step id is `match`, unhide `#eveProblem` and `#aesLine` after rendering them.
- `sendPacket(fromX, toX, y, label, myGen, animated, onDone)` — build a `.packet` group with `svgEl` (a small rounded rect plus a text label produced by `shortVal`), then tween its `transform` translate from the sending card's edge to the receiving card's edge with `easeInOutCubic` over a duration derived from the current speed. Every rAF callback first checks `myGen === generation` and bails out silently if the stage has been rebuilt underneath it — that guard is the documented convention on this site and is what makes restarting mid-flight safe. When `animated` is false, or when `window.matchMedia('(prefers-reduced-motion: reduce)').matches`, skip the tween and place the packet at its destination immediately. Remove the packet group when the tween completes.
- `play()`, `pause()`, `stepOnce()`, `instantFinish()` and `resetPlayback()` with the Sieve tool's exact semantics: `playBtn` reads `▶ Play` when idle and `⏸ Pause` while running; `stepBtn` is disabled while playing and once the last step has been applied; `stepOnce` is a no-op while playing or at the end; `instantFinish` pauses, then applies every remaining step unanimated (reusing `revealAll` for the tail); `resetPlayback` pauses, bumps `generation`, sets `stepIndex` to 0, re-hides every `.svg-row`, empties `#mathLog` and `#eveNotebook`, re-hides `#eveProblem` and `#aesLine`, and writes a ready message into `#banner`.
- `rebuild()` from Task 1 now bumps `generation`, cancels any live `rafId` and `tweenFrame`, builds the stage, stores `currentExchange`, and then calls `instantFinish()` so an arriving visitor still lands on a complete worked example (the same end state Task 1 rendered) while `#banner` invites them to press Reset and then Play to watch it built step by step.

Wire the controls that were left inert: `buildBtn` rebuilds; `playBtn` toggles play/pause; `stepBtn` calls `stepOnce`; `instantBtn` calls `instantFinish`; `resetBtn` calls `resetPlayback`; `speedInput` updates `speedLabel` from `SPEED_LABELS` on input and takes effect on the next dwell without restarting the run. Every input change, preset chip click, randomize and prime-generation path routes through `rebuild()` and therefore through the generation bump.

Add per-tool persistence following the established key convention: a `STORAGE_KEY` of `diffie-hellman-key-exchange`, persisting p, g, a, b and the speed value on each successful rebuild and restoring them at load, with both the read and the write wrapped in try/catch so a disabled or full localStorage silently falls back to the seeded first preset (this site is opened over file:// where storage can be unavailable).

Add one `.legend` row under the stage naming what the four colors mean on the diagram — Alice, Bob, Eve, and the value currently moving — using the same role tokens the stage uses, so the animation is readable without hovering anything.
  </action>

  <verify>
    <automated>cd /home/mainaccount/Claude/number-theory-browser-tools &amp;&amp; F="Diffie-Hellman Key Exchange/diffie-hellman-key-exchange.html"; T=$(mktemp -d); awk '/^\(function\(\)[{]/{f=1} f{print} /^[}]\)\(\);/{if(f)exit}' "$F" | tee "$T/dh.js" | wc -l; node --check "$T/dh.js" &amp;&amp; echo SCRIPT-PARSES</automated>
    <automated>cd /home/mainaccount/Claude/number-theory-browser-tools &amp;&amp; F="Diffie-Hellman Key Exchange/diffie-hellman-key-exchange.html"; awk '/---------- number theory ----------/{f=1;next} /---------- state ----------/{f=0} f' "$F" | node -e "const fs=require('fs');eval(fs.readFileSync(0,'utf8'));const ex=buildExchange(23n,5n,6n,15n);if(ex.secretAlice!==ex.secretBob||ex.secretAlice!==2n)throw new Error('SECRET-REGRESSED');if(ex.steps.map(s=>s.id).join(',')!=='agree,alicePicks,bobPicks,aliceComputesPublic,bobComputesPublic,sendAliceToBob,sendBobToAlice,aliceComputesSecret,bobComputesSecret,match')throw new Error('STEP-IDS-REGRESSED');if(aesSentence(7n)!=='Now Alice and Bob can use 7 as the key used for symmetric encryption using an algorithm like AES, Blowfish, etc.')throw new Error('AES-LINE-REGRESSED');for(let t=0;t&lt;25;t++){const p=1019n,a=randomBigIntInRange(2n,p-2n),b=randomBigIntInRange(2n,p-2n);const r=buildExchange(p,2n,a,b);if(r.secretAlice!==r.secretBob)throw new Error('RANDOM-MISMATCH');}console.log('MATH-STILL-OK')"</automated>
    <automated>cd /home/mainaccount/Claude/number-theory-browser-tools &amp;&amp; F="Diffie-Hellman Key Exchange/diffie-hellman-key-exchange.html"; for t in SPEED_LABELS SPEED_MS generation requestAnimationFrame cancelAnimationFrame easeInOutCubic sendPacket advanceOne frameStep instantFinish resetPlayback revealAll STORAGE_KEY prefers-reduced-motion; do grep -q "$t" "$F" || echo "MISSING $t"; done; grep -q "'⏸ Pause'" "$F" || grep -q '"⏸ Pause"' "$F" || echo NO-PAUSE-LABEL; grep -q "'▶ Play'" "$F" || grep -q '"▶ Play"' "$F" || echo NO-PLAY-LABEL; grep -q 'localStorage.setItem' "$F" || echo NO-PERSIST; grep -q 'localStorage.getItem' "$F" || echo NO-RESTORE; c=$(grep -o 'try{' "$F" | wc -l); [ "$c" -ge 2 ] || echo "STORAGE-NOT-GUARDED $c"; g=$(grep -o 'generation' "$F" | wc -l); [ "$g" -ge 5 ] || echo "GEN-GUARD-THIN $g"; grep -q "window.addEventListener('load'" "$F" || echo NO-LOAD-HANDLER; grep -q 'class="legend"' "$F" || echo NO-LEGEND; for id in playBtn stepBtn instantBtn resetBtn speedInput; do grep -q "$id.addEventListener" "$F" || echo "UNWIRED $id"; done; echo PLAYBACK-CHECKED</automated>
    <automated>cd /home/mainaccount/Claude/number-theory-browser-tools &amp;&amp; F="Diffie-Hellman Key Exchange/diffie-hellman-key-exchange.html"; grep -nEi '#[0-9a-f]{3}\b|#[0-9a-f]{6}\b|rgba?\([0-9]|hsla?\(' "$F" | grep -vE ':[[:space:]]*(/\*|\*|//)' | grep -v 'fonts.googleapis\|fonts.gstatic' | sed 's/^/FILE-LITERAL /'; grep -nEi '(fill|stroke|color|background|border|outline|shadow)[^;]*\b(whi''te|bla''ck|red|blue|green|gold|yellow|orange|purple|pink|gray|grey|silver|cyan|magenta|navy|teal|lime|brown|violet)\b' "$F" | grep -vE ':[[:space:]]*(/\*|\*|//)' | sed 's/^/NAMED-COLOR /'; grep -nE '^[[:space:]]*--[a-z0-9-]+[[:space:]]*:' "$F" | sed 's/^/LOCAL-TOKEN /'; echo FILE-SWEPT</automated>
    <human-check>Open the tool. Press Reset then Play and watch all ten steps land in order at the default speed: p and g appear on all three parties at once, then each private exponent appears only on its own side, then each public value, then two packets actually travel along the wire (one each way) and Eve's notebook fills as each one passes, then each side's secret computation, then the match callout with the AES line. Press Pause mid-flight and confirm the animation stops where it is; press Step to advance exactly one step at a time; press Instant and confirm it jumps to the finished state. Press Play, and while a packet is mid-wire click a preset chip — the stage must rebuild cleanly with no leftover packet and no ghost value from the abandoned run. Drag the speed slider to both ends and confirm the label text changes and the pacing follows. Reload and confirm your last p, g, a, b and speed came back.</human-check>
  </verify>

  <done>
    - Play, Pause, Step, Instant and Reset drive the ten-step reveal with the Sieve tool's exact label and disabled-state behaviour, and the speed slider relabels and re-paces without restarting.
    - Both public values visibly travel the wire as packets, each landing in Eve's notebook as it passes, and `prefers-reduced-motion` or an instant finish places them without tweening.
    - Restarting mid-flight bumps `generation`, and every in-flight rAF callback checks it and bails, so no stale callback can write to a rebuilt stage.
    - p, g, a, b and speed persist under `diffie-hellman-key-exchange` with both storage calls guarded, falling back to the seeded preset when storage is unavailable.
    - The `number theory` section still evaluates standalone in node with the Task 1 results unchanged.
  </done>

  <reversibility rating="reversible">Additive edits to one unreferenced file.</reversibility>
</task>

<task type="auto">
  <name>Task 3: Register the tool on the hub and in every page's shared nav</name>
  <files>index.html, Sieve Of Eratosthenes/sieve-of-eratosthenes.html, Factor Tree/factor-tree.html, Factorize By Completing The Square/factorize-completing-square.html, Pizza Slices/pizza-slices.html, RSA Examplifier/rsa-examplifier.html, Venn Diagrams/venn-diagrams.html</files>

  <action>
Add the new tool to the shared nav on all seven existing pages and to the hub card grid. Each of the 6 existing tool pages gains exactly one line and loses none: a `site-nav-link` anchor placed last in the `.site-nav` list, after the Venn Diagrams link, labelled `Diffie-Hellman`, with href `../Diffie-Hellman Key Exchange/diffie-hellman-key-exchange.html` — an unencoded space in the path, matching how every existing cross-tool href on this site is written. Do not touch any page's existing `is-active` marking; each page keeps exactly one active link, its own.

`index.html` gains the same nav entry with the root-relative href `Diffie-Hellman Key Exchange/diffie-hellman-key-exchange.html` (no `../`), plus a seventh `.card` appended last in `.card-grid`, matching the 6 existing cards exactly in structure: an `.icon` div (use the handshake glyph 🤝 — it is unused by the other 6), an `h2` reading `Diffie-Hellman Key Exchange`, one `p` of body copy in the same voice as the RSA card (it should promise watching Alice and Bob build a shared secret in the open while Eve records every byte that crosses the wire and still cannot reconstruct it), and the `span.go` reading `Open tool →`.

Also update the two places in `index.html` that state how many tools the site has — the hero paragraph and the footer line. Both currently name the previous total; both must name the new total of seven, and the previous total word must not survive anywhere in the file. While editing the hero sentence, widen its topic list so it covers this tool too (primes, factorization, modular arithmetic and public-key cryptography reads correctly for all seven).

Do not modify `CLAUDE.md` or `.claude/CLAUDE.md` in this task — the repo's convention, established when the Venn tool was added, is that the tool inventory in those files is refreshed separately.
  </action>

  <verify>
    <automated>cd /home/mainaccount/Claude/number-theory-browser-tools &amp;&amp; for f in "index.html" "Sieve Of Eratosthenes/sieve-of-eratosthenes.html" "Factor Tree/factor-tree.html" "Factorize By Completing The Square/factorize-completing-square.html" "Pizza Slices/pizza-slices.html" "RSA Examplifier/rsa-examplifier.html" "Venn Diagrams/venn-diagrams.html" "Diffie-Hellman Key Exchange/diffie-hellman-key-exchange.html"; do n=$(grep -o 'site-nav-link' "$f" | wc -l); [ "$n" = 8 ] || echo "NAV-COUNT $f=$n"; a=$(grep -o 'site-nav-link is-active' "$f" | wc -l); [ "$a" = 1 ] || echo "ACTIVE-COUNT $f=$a"; done; for f in "Sieve Of Eratosthenes/sieve-of-eratosthenes.html" "Factor Tree/factor-tree.html" "Factorize By Completing The Square/factorize-completing-square.html" "Pizza Slices/pizza-slices.html" "RSA Examplifier/rsa-examplifier.html" "Venn Diagrams/venn-diagrams.html"; do grep -q 'href="../Diffie-Hellman Key Exchange/diffie-hellman-key-exchange.html"' "$f" || echo "BAD-REL-PATH $f"; done; echo NAV-CHECKED</automated>
    <automated>cd /home/mainaccount/Claude/number-theory-browser-tools &amp;&amp; c=$(grep -o 'Diffie-Hellman Key Exchange/diffie-hellman-key-exchange.html' index.html | wc -l); [ "$c" = 2 ] || echo "INDEX-REF-COUNT $c"; grep -q 'class="card" href="Diffie-Hellman Key Exchange/diffie-hellman-key-exchange.html"' index.html || echo INDEX-CARD-MISSING; g=$(grep -o 'class="go"' index.html | wc -l); [ "$g" = 7 ] || echo "CARD-COUNT $g"; h=$(grep -o '<h2>' index.html | wc -l); [ "$h" = 7 ] || echo "CARD-H2-COUNT $h"; grep -niE '\b(six)\b' index.html | sed 's/^/STALE-COUNT /'; grep -qi 'seven' index.html || echo NEW-COUNT-MISSING; echo INDEX-CHECKED</automated>
    <automated>cd /home/mainaccount/Claude/number-theory-browser-tools &amp;&amp; D=$(git diff HEAD --numstat -- "Sieve Of Eratosthenes/sieve-of-eratosthenes.html" "Factor Tree/factor-tree.html" "Factorize By Completing The Square/factorize-completing-square.html" "Pizza Slices/pizza-slices.html" "RSA Examplifier/rsa-examplifier.html" "Venn Diagrams/venn-diagrams.html") || echo GIT-DIFF-FAILED; printf '%s\n' "$D" | awk 'NF{ c++; if ($1 != 1 || $2 != 0) print "OVERSIZED-DIFF " $0 } END{ if (c+0 != 6) print "TOUCHED-PAGE-COUNT " c+0 }'; echo DIFF-CHECKED</automated>
    <human-check>Open `index.html`, confirm the new card sits last alongside the other 6 and reads in their voice, and that the hero and footer both name seven tools. Click the card and land on the Diffie-Hellman tool. From there click every nav link in turn and confirm each page loads with no broken path (the spaces in the directory name are the thing to watch), then use each page's own nav to come back to Diffie-Hellman and confirm it marks itself active when you arrive.</human-check>
  </verify>

  <done>
    - All eight pages carry the same eight nav links with exactly one marked active (NAV-01).
    - The 6 existing tool pages each gained exactly one line and lost none.
    - The hub has a seventh card linking the new tool, and both tool-count statements in `index.html` name seven with no stale count word left anywhere in the file.
  </done>

  <reversibility rating="reversible">One-line nav additions plus one card block; `git revert` restores every page.</reversibility>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| user input → page DOM | The four text inputs (p, g, a, b) and the bit-size select are the only untrusted input this tool has; everything else on the page is a static literal. Values reach the DOM through template-literal `innerHTML` writes in the RSA tool's idiom, so the parse step is the boundary control. |
| user input → compute loop | The same inputs size every loop on the page: modular exponentiation, Miller-Rabin rounds, `factorSmall`, the safe-prime search, and Eve's brute-force discrete-log walk. An unbounded value wedges the tab. |
| page → external origin | Only `fonts.googleapis.com` via `<link>`. No third-party JS, no CDN, no package manager, no network call at runtime. |

## STRIDE Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation Plan |
|-----------|----------|-----------|----------|-------------|-----------------|
| T-JLU-01 | Tampering (script injection via input) | `readInputs()` → every `innerHTML` write in `renderStep`/`renderNotebook`/`renderEveProblem` | medium | mitigate | Every input passes `parseBigIntStrict` (a `^\d+$` regex then `BigInt`) before anything is rendered; a failing input writes a plain-text message into `errorBox` via `textContent` and renders nothing. Only digit strings derived from BigInts are ever interpolated into markup, and all headings/labels/notes are static literals in the source. |
| T-JLU-02 | Denial of Service (self-inflicted tab freeze) | `isPrimeBig`, `modPowPlain`, `factorSmall`, safe-prime search, `eveDlogBtn` walk | low | mitigate | p capped at 80 digits and required prime; exponents constrained to 2..p−2; `factorSmall` capped at 200000 divisors and returns null rather than grinding; generated primes capped at 64 bits with the candidate search capped at 4000 tries and a reported failure; Eve's discrete-log walk only runs for p ≤ 100000 and is hard-capped at 2000000 iterations, reporting infeasibility instead for larger p. |
| T-JLU-03 | Information disclosure (misuse of a teaching artifact) | private exponents rendered in the DOM; `randomBigIntBits` built on `Math.random` | medium | mitigate | The intro panel states plainly that this is a teaching demo with toy parameters, that the exponents come from `Math.random` which is not a cryptographic RNG, that the raw shared secret is shown rather than run through a key derivation function, and that none of it may be used for anything real — mirroring the RSA tool's existing textbook-RSA warning and its footer disclaimer. |
| T-JLU-04 | Spoofing / Tampering (third-party resource) | the Google Fonts `<link>` | low | accept | Site-wide established convention (only Google Fonts, no other external resource); the new tool adds no new external origin and no third-party JS, so it inherits the existing accepted posture rather than widening it. |
| T-JLU-SC | Tampering (supply chain) | npm/pip/cargo installs | low | accept | Not applicable to this repo: there is no package manager, no manifest and no dependency to install — the package legitimacy gate has nothing to audit because this task installs nothing. |
</threat_model>

<verification>
Run every task's `<automated>` gate again after the last commit, in task order, and confirm each ends with its sentinel (`SCRIPT-PARSES`, `MATH-OK` / `MATH-STILL-OK`, `STRUCTURE-CHECKED`, `FILE-SWEPT`, `PLAYBACK-CHECKED`, `NAV-CHECKED`, `INDEX-CHECKED`, `DIFF-CHECKED`) and prints no line prefixed `MISSING`, `BAD-`, `NO-`, `FILE-LITERAL`, `NAMED-COLOR`, `STALE-COUNT`, `OVERSIZED-DIFF` or `UNWIRED`.

Then open the page and walk the whole story once at the default speed, on both themes, with a preset switch mid-animation.
</verification>

<success_criteria>
- One new self-contained tool file exists, matching the site's single-file architecture with no external JS dependency beyond Google Fonts (NAV-02).
- The exchange animates in ten steps and both parties provably land on the same shared secret — asserted for the worked example and fuzzed over forty random exponent pairs (PAL-04 role mapping intact).
- Eve is a strictly passive observer in both the model and the rendering: her notebook contains exactly p, g, A and B, and the page states that a, b and the secret never crossed the wire.
- The page names the discrete logarithm problem on the concrete intercepted instance and the computational Diffie-Hellman problem, in the RSA tool's Eve's-attack register.
- The final line is produced by a single pure function and matches, character for character, `Now Alice and Bob can use $SHARED_SECRET as the key used for symmetric encryption using an algorithm like AES, Blowfish, etc.` with the computed secret's plain digits substituted.
- The file declares no literal color and re-themes with the shared day/night toggle (PAL-01, PAL-02).
- All eight pages share the same eight nav links with exactly one active, and the hub has a seventh card and a corrected tool count (NAV-01).
</success_criteria>

<output>
Create `.planning/quick/260926-jlu-add-diffie-hellman-key-exchange-browser-/260926-jlu-SUMMARY.md` when done.
</output>
