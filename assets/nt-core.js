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

   NT.core is frozen, and its slot on NT is read-only, after construction —
   a tool must never assign to NT or to any of its members (shadow-check.js's
   NS-MUTATION gate enforces this).
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

  // isPrime(n): false for every non-integer (2.5, NaN, Infinity) and for
  // n < 2 (ECDH's isPrimeSmall contract) — Factor Tree, Venn, Shors and
  // Fermats never call isPrime/isPrimeSmall/isPrimeSimple with a
  // non-integer, so tightening the guard to match ECDH's is a no-op for
  // their own callers. Even n returns n === 2, then odd trial division
  // from 3 by 2 while d*d <= n.
  function isPrime(n) {
    if (!Number.isInteger(n) || n < 2) return false;
    if (n % 2 === 0) return n === 2;
    for (var d = 3; d * d <= n; d += 2) {
      if (n % d === 0) return false;
    }
    return true;
  }

  function isqrt(x) {
    if (x < 0) return -1;
    var r = Math.floor(Math.sqrt(x));
    while (r * r > x) r--;
    while ((r + 1) * (r + 1) <= x) r++;
    return r;
  }

  function isPerfectSquare(x) {
    if (x < 0) return -1;
    var r = isqrt(x);
    return (r * r === x) ? r : -1;
  }

  // primeFactors(n, limit): empty array for n < 2; divide out 2s; then odd
  // d from 3 while d*d <= n and d < limit (limit defaults to Infinity when
  // undefined); push the remaining n when > 1. Equivalent to Factor Tree's
  // all-integers trial-division loop for integer input, and to Venn's
  // factorize(n) when limit === FACTOR_LIMIT.
  function primeFactors(n, limit) {
    if (limit === undefined) limit = Infinity;
    var factors = [];
    var x = n;
    if (x < 2) return factors;
    while (x % 2 === 0) { factors.push(2); x = x / 2; }
    var d = 3;
    while (d * d <= x && d < limit) {
      while (x % d === 0) { factors.push(d); x = x / d; }
      d += 2;
    }
    if (x > 1) factors.push(x);
    return factors;
  }

  function smallestPrimeFactor(v) {
    for (var p = 2; p * p <= v; p++) {
      if (v % p === 0) return p;
    }
    return v;
  }

  // FERMAT_MAX_ITER / fermatSplit(v, maxIter): Factor Tree's body with its
  // iteration cap read from maxIter, defaulting to FERMAT_MAX_ITER when
  // omitted — fermatSplit(v) === fermatSplit(v, FERMAT_MAX_ITER).
  var FERMAT_MAX_ITER = 2000000;
  function fermatSplit(v, maxIter) {
    if (maxIter === undefined) maxIter = FERMAT_MAX_ITER;
    var aMax = Math.floor((v + 1) / 2);
    var a = Math.ceil(Math.sqrt(v));
    var iters = 0;
    while (a <= aMax) {
      var r = a * a - v;
      var b = isPerfectSquare(r);
      iters++;
      if (b >= 0) return { p: a - b, q: a + b };
      if (iters >= maxIter) return null; // defensive can't-happen guard only
      a++;
    }
    return null; // can't-happen for odd composite v
  }

  // unitsMod(N) / totient(m): Cayley's body, calling this module's own gcd.
  function unitsMod(N) {
    var out = [];
    for (var r = 0; r < N; r++) {
      if (gcd(r, N) === 1) out.push(r);
    }
    return out;
  }

  function totient(m) {
    return unitsMod(m).length;
  }

  // euclidSteps(a, b): the full Euclidean Algorithm body, including the
  // Bezout s/t coefficients — trimmed callers (Venn's miniature, Euler's
  // Totient) simply don't read s/t from the returned step objects.
  function euclidSteps(a, b) {
    var steps = [];
    var r0 = a, r1 = b;
    var s0 = 1, s1 = 0;
    var t0 = 0, t1 = 1;
    while (r1 !== 0) {
      var q = Math.floor(r0 / r1);
      var r2 = r0 - q * r1;
      var s2 = s0 - q * s1;
      var t2 = t0 - q * t1;
      steps.push({ a: r0, b: r1, q: q, r: r2, s: s2, t: t2 });
      r0 = r1; r1 = r2;
      s0 = s1; s1 = s2;
      t0 = t1; t1 = t2;
    }
    return { steps: steps, gcd: r0, s: s0, t: t0 };
  }

  // modPowSmall(a, e, m): Shors Algorithm's body, verbatim.
  function modPowSmall(a, e, m) {
    var base = ((a % m) + m) % m;
    var result = 1;
    var exp = e;
    while (exp > 0) {
      if (exp % 2 === 1) result = (result * base) % m;
      exp = Math.floor(exp / 2);
      base = (base * base) % m;
    }
    return result;
  }

  // randomInt(min, max): byte-identical across Cayley Table, ECDH,
  // Equivalence Wheel, and Group Isomorphism.
  function randomInt(min, max) {
    return min + Math.floor(Math.random() * (max - min + 1));
  }

  var NT = window.NT = window.NT || {};
  NT.core = Object.freeze({
    clamp: clamp,
    euclidSteps: euclidSteps,
    FERMAT_MAX_ITER: FERMAT_MAX_ITER,
    fermatSplit: fermatSplit,
    gcd: gcd,
    isPerfectSquare: isPerfectSquare,
    isPrime: isPrime,
    isqrt: isqrt,
    mod: mod,
    modInverse: modInverse,
    modPowSmall: modPowSmall,
    primeFactors: primeFactors,
    randomInt: randomInt,
    smallestPrimeFactor: smallestPrimeFactor,
    totient: totient,
    unitsMod: unitsMod
  });
  // NT stays extensible so later modules can add their own namespace, but
  // this slot is locked: NT.core can never be reassigned or deleted.
  Object.defineProperty(NT, 'core', { writable: false, configurable: false });
})();
