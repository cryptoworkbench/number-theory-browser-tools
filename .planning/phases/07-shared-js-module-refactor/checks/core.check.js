/* checks/core.check.js — parity checks for NT.core against every pre-phase
 * per-tool predecessor. Exports function(ctx) per harness.js's contract.
 */
"use strict";

var EXPECTED_KEYS = ["clamp", "gcd", "mod", "modInverse"];

function localGcd(a, b) {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) { var t = a % b; a = b; b = t; }
  return a;
}

module.exports = function (ctx) {
  var NT = ctx.loadNew();
  var core = NT.core;

  ctx.eq("core key-set", Object.keys(core).sort(), EXPECTED_KEYS.slice().sort());
  ctx.eq("core frozen", Object.isFrozen(core), true);

  var oldCrt = ctx.loadOld("Chinese Remainder Theorem/chinese-remainder-theorem.html", ["gcd", "clamp", "modInverse"]);
  var oldEcdh = ctx.loadOld("Elliptic Curve Diffie-Hellman/elliptic-curve-diffie-hellman.html", ["mod", "modInv"]);

  // gcd vs CRT gcd over all integer pairs in [-60, 60]^2.
  for (var a = -60; a <= 60; a++) {
    for (var b = -60; b <= 60; b++) {
      ctx.eq("gcd(" + a + "," + b + ") vs CRT", core.gcd(a, b), oldCrt.gcd(a, b));
    }
  }

  // clamp vs CRT clamp over v in [-5, 25] and every lo <= hi pair in [0, 20].
  for (var v = -5; v <= 25; v++) {
    for (var lo = 0; lo <= 20; lo++) {
      for (var hi = lo; hi <= 20; hi++) {
        ctx.eq("clamp(" + v + "," + lo + "," + hi + ") vs CRT", core.clamp(v, lo, hi), oldCrt.clamp(v, lo, hi));
      }
    }
  }

  // mod vs ECDH mod over x in [-300, 300], m in [1, 60].
  for (var x = -300; x <= 300; x++) {
    for (var m = 1; m <= 60; m++) {
      ctx.eq("mod(" + x + "," + m + ") vs ECDH", core.mod(x, m), oldEcdh.mod(x, m));
    }
  }

  // modInverse vs CRT modInverse over every coprime (M, m) with
  // M in [0, 600], m in [1, 40] (includes m = 1).
  for (var M = 0; M <= 600; M++) {
    for (var mm = 1; mm <= 40; mm++) {
      if (localGcd(M, mm) !== 1) continue;
      ctx.eq("modInverse(" + M + "," + mm + ") vs CRT", core.modInverse(M, mm), oldCrt.modInverse(M, mm));
    }
  }

  // modInverse vs ECDH modInv (loaded with ECDH's mod) over x in
  // [-150, 300] for every prime p <= 97, including the null cases.
  var primes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97];
  for (var pi = 0; pi < primes.length; pi++) {
    var p = primes[pi];
    for (var xx = -150; xx <= 300; xx++) {
      ctx.eq("modInverse(" + xx + "," + p + ") vs ECDH", core.modInverse(xx, p), oldEcdh.modInv(xx, p));
    }
  }
};
