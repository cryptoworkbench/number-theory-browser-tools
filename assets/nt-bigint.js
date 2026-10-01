/* NT.bigint — BigInt-domain number theory helpers shared across every tool
   that does cryptographic-scale arithmetic (RSA, Diffie-Hellman Key
   Exchange, Square And Multiply).

   These are pedagogical implementations, not production cryptography: they
   use Math.random() (not a CSPRNG) and are not constant-time. Every tool
   this module serves already describes itself this way; moving the bodies
   here verbatim does not change that property one way or the other.
   Number-domain twins (the plain-Number analogues, e.g. modPowSmall) live
   in the separate assets/nt-core.js module — the two families are never
   mixed, since mixing Number and BigInt operands throws a TypeError.

   Classic script, IIFE, "use strict" — no build step, no bundler. It must
   be included as a plain, non-deferred <script src> (no defer, no async,
   no type="module") so it executes synchronously before a tool's own
   inline <script> runs, and so pages keep working when opened directly
   over file://, where ES module imports are blocked by CORS.

   Include convention: place
     <script src="../assets/nt-bigint.js"></script>
   on its own line immediately after nt-core.js (when both are used) and
   before a tool's own inline <script> block at the end of <body>, per the
   canonical order core, bigint, svg, store, layout.

   Consumers (Phase 7, plan 07-03): RSA. Later phase-7 plans extend this
   list to Diffie-Hellman Key Exchange and Square And Multiply.

   NT.bigint is frozen, and its slot on NT is read-only, after construction —
   a tool must never assign to NT or to any of its members (shadow-check.js's
   NS-MUTATION gate enforces this).
*/
(function () {
  "use strict";

  // parseBigIntStrict(str, allowZero): accepts only a plain nonnegative
  // integer string (optionally surrounded by whitespace, per String#trim);
  // rejects scientific notation, trailing garbage, and non-digit input.
  // Throws for zero unless allowZero is truthy.
  function parseBigIntStrict(str, allowZero) {
    str = (str || "").trim();
    if (!/^\d+$/.test(str)) throw new Error("not a nonnegative integer");
    var v = BigInt(str);
    if (!allowZero && v <= 0n) throw new Error("must be positive");
    return v;
  }

  // fmt(x): thousands-separated decimal string, e.g. 1234567n -> "1,234,567".
  function fmt(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  // bigGcd(a, b): absolute-value Euclidean remainder loop over BigInt.
  function bigGcd(a, b) {
    a = a < 0n ? -a : a;
    b = b < 0n ? -b : b;
    while (b) {
      var t = a % b;
      a = b;
      b = t;
    }
    return a;
  }

  // randomBigIntBits(bits): a uniformly-distributed BigInt in [0, 2^bits),
  // built 32 bits at a time via Math.random().
  function randomBigIntBits(bits) {
    if (bits <= 0) return 0n;
    var hex = "", remaining = bits;
    while (remaining > 0) {
      var chunk = Math.min(remaining, 32);
      var val = Math.floor(Math.random() * Math.pow(2, chunk));
      hex = val.toString(16) + hex;
      remaining -= chunk;
    }
    return BigInt("0x" + (hex || "0"));
  }

  // randomBigIntInRange(min, max): a uniformly-distributed BigInt in
  // [min, max], via rejection sampling over the minimum enclosing bit width.
  function randomBigIntInRange(min, max) {
    var range = max - min + 1n;
    var bits = range.toString(2).length;
    var x;
    do { x = randomBigIntBits(bits); } while (x >= range);
    return min + x;
  }

  // modPowPlain(base, exp, mod): BigInt square-and-multiply modular
  // exponentiation. base is reduced into [0, mod) before the loop so a
  // negative base is handled correctly.
  function modPowPlain(base, exp, mod) {
    var result = 1n;
    base %= mod;
    if (base < 0n) base += mod;
    while (exp > 0n) {
      if (exp & 1n) result = (result * base) % mod;
      exp >>= 1n;
      base = (base * base) % mod;
    }
    return result;
  }

  // isPrimeBig(n, rounds): Miller-Rabin primality test. Calls this module's
  // own randomBigIntInRange/modPowPlain for witness selection and
  // exponentiation.
  function isPrimeBig(n, rounds) {
    rounds = rounds || 20;
    if (n < 2n) return false;
    var small = [2n, 3n, 5n, 7n, 11n, 13n, 17n, 19n, 23n, 29n, 31n, 37n];
    for (var i = 0; i < small.length; i++) {
      var sp = small[i];
      if (n === sp) return true;
      if (n % sp === 0n) return false;
    }
    var d = n - 1n, r = 0n;
    while (d % 2n === 0n) { d /= 2n; r++; }
    witness: for (var w = 0; w < rounds; w++) {
      var a = randomBigIntInRange(2n, n - 2n);
      var x = modPowPlain(a, d, n);
      if (x === 1n || x === n - 1n) continue;
      for (var j = 0n; j < r - 1n; j++) {
        x = (x * x) % n;
        if (x === n - 1n) continue witness;
      }
      return false;
    }
    return true;
  }

  // scratchNum(x): a compact display form for a pinned reference panel —
  // the full comma-formatted number when short enough, otherwise a
  // head/tail ellipsis with the total digit count. Calls this module's own
  // fmt.
  function scratchNum(x) {
    var s = fmt(x);
    if (s.length <= 30) return s;
    var digits = x.toString();
    return digits.slice(0, 8) + "…" + digits.slice(-8) + " (" + digits.length + ")";
  }

  // shortVal(x): a shorter display form (no thousands separators) used by
  // Diffie-Hellman Key Exchange and Square And Multiply's step tables.
  function shortVal(x) {
    var s = x.toString();
    return s.length <= 12 ? s : s.slice(0, 8) + "…";
  }

  var NT = window.NT = window.NT || {};
  NT.bigint = Object.freeze({
    bigGcd: bigGcd,
    fmt: fmt,
    isPrimeBig: isPrimeBig,
    modPowPlain: modPowPlain,
    parseBigIntStrict: parseBigIntStrict,
    randomBigIntBits: randomBigIntBits,
    randomBigIntInRange: randomBigIntInRange,
    scratchNum: scratchNum,
    shortVal: shortVal
  });
  // NT stays extensible so later modules can add their own namespace, but
  // this slot is locked: NT.bigint can never be reassigned or deleted.
  Object.defineProperty(NT, 'bigint', { writable: false, configurable: false });
})();
