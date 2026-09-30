/* NT.core — Number-domain number theory helpers shared across every tool.

   This file centralizes the plain-Number math primitives that used to be
   duplicated per-tool (gcd, clamp, mod, modInverse, primality, factoring,
   the Euclidean-algorithm step trace, group-theory unit sets, modular
   exponentiation, and a small random-integer helper). BigInt-domain
   equivalents (bigGcd, isPrimeBig, modPowPlain, ...) live in the separate
   assets/nt-bigint.js module — the two families are never mixed, because
   mixing Number and BigInt operands throws a TypeError.

   Classic script, IIFE, "use strict" — no build step, no bundler. It must
   be included as a plain, non-deferred <script src> (no defer, no async,
   no type="module") so it executes synchronously before a tool's own
   inline <script> runs, and so pages keep working when opened directly
   over file://, where ES module imports are blocked by CORS.

   Include convention: place
     <script src="../assets/nt-core.js"></script>
   on its own line immediately before a tool's own inline <script> block at
   the end of <body>. A tool that also needs nt-bigint.js/nt-svg.js/
   nt-store.js/nt-layout.js includes them on their own lines, in the
   canonical order core, bigint, svg, store, layout, all before the tool's
   own script.

   Consumers (Phase 7, plan 07-01): Chinese Remainder Theorem, Euler's
   Totient. Later phase-7 plans extend this list to the remaining tools
   that used to keep a local copy of one of these functions.

   NT.core is frozen after construction — a tool must never assign to NT or
   to any of its members (shadow-check.js's NS-MUTATION gate enforces
   this).
*/
(function () {
  "use strict";

  // gcd(a, b): absolute-value Euclidean remainder loop. Standardizing on
  // the abs()-including variant is a no-op for every current caller across
  // the repo (every call site only ever passes non-negative integers) and
  // is strictly more defensive for the handful of callers that previously
  // omitted it.
  function gcd(a, b) {
    a = Math.abs(a);
    b = Math.abs(b);
    while (b) {
      var t = a % b;
      a = b;
      b = t;
    }
    return a;
  }

  // clamp(v, lo, hi): max-of-min ordering. Algebraically identical to the
  // min-of-max ordering some tools used, for every lo <= hi pair — the
  // only case any caller reaches.
  function clamp(v, lo, hi) {
    return Math.max(lo, Math.min(hi, v));
  }

  // mod(x, m): true mathematical modulo (always returns a value in
  // [0, m) for m > 0), unlike JavaScript's % operator which can return a
  // negative result for a negative x.
  function mod(x, m) {
    return ((x % m) + m) % m;
  }

  // modInverse(a, m): extended-Euclidean modular inverse. Canonical body
  // is ECDH's modInv with its early return on a reduced value of zero
  // removed (so m = 1 still resolves through the general loop rather than
  // short-circuiting), returning null when a and m are not coprime
  // (oldR !== 1 at the end of the loop), otherwise mod(oldS, m).
  //
  // For m = 1, every integer is invertible (there is exactly one residue
  // class mod 1), and the loop naturally converges to oldR = 1 with
  // oldS = 0, so modInverse(a, 1) === 0 for every a — matching CRT's
  // MIN_MODULUS = 1 contract. For m > 1, a non-coprime (a, m) pair
  // resolves to oldR !== 1 and returns null — matching ECDH's contract.
  function modInverse(a, m) {
    a = mod(a, m);
    var oldR = a, r = m;
    var oldS = 1, s = 0;
    while (r !== 0) {
      var q = Math.floor(oldR / r);
      var tempR = oldR - q * r; oldR = r; r = tempR;
      var tempS = oldS - q * s; oldS = s; s = tempS;
    }
    if (oldR !== 1) return null;
    return mod(oldS, m);
  }

  var NT = window.NT = window.NT || {};
  NT.core = Object.freeze({
    clamp: clamp,
    gcd: gcd,
    mod: mod,
    modInverse: modInverse
  });
})();
