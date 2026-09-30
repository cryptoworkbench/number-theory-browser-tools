/* checks/core.check.js — parity checks for NT.core against every pre-phase
 * per-tool predecessor. Exports function(ctx) per harness.js's contract.
 */
"use strict";

var EXPECTED_KEYS = [
  "clamp", "euclidSteps", "FERMAT_MAX_ITER", "fermatSplit", "gcd",
  "isPerfectSquare", "isPrime", "isqrt", "mod", "modInverse", "modPowSmall",
  "primeFactors", "randomInt", "smallestPrimeFactor", "totient", "unitsMod"
];

function projectSteps(result) {
  return {
    gcd: result.gcd,
    steps: result.steps.map(function (s) { return { a: s.a, b: s.b, q: s.q, r: s.r }; })
  };
}

module.exports = function (ctx) {
  var NT = ctx.loadNew();
  var core = NT.core;

  ctx.eq("core key-set", Object.keys(core).sort(), EXPECTED_KEYS.slice().sort());
  ctx.eq("core frozen", Object.isFrozen(core), true);

  /* ---------- load BASE predecessors ---------- */

  var oldCrt = ctx.loadOld("Chinese Remainder Theorem/chinese-remainder-theorem.html", ["gcd", "clamp", "modInverse"]);
  var oldEcdh = ctx.loadOld("Elliptic Curve Diffie-Hellman/elliptic-curve-diffie-hellman.html", ["mod", "modInv", "isPrimeSmall"]);
  var oldCayley = ctx.loadOld("Cayley Table/cayley-table.html", ["clamp", "gcd", "unitsMod", "randomInt"]);
  var oldEqWheel = ctx.loadOld("Equivalence Wheel/equivalence-wheel.html", ["clamp", "gcd", "unitsMod", "randomInt"]);
  var oldGroupIso = ctx.loadOld("Group Isomorphism/group-isomorphism.html", ["clamp", "gcd", "unitsMod", "totient", "randomInt"]);
  var oldShors = ctx.loadOld("Shors Algorithm/shors-algorithm.html", ["gcdSmall", "modPowSmall", "isPrimeSmall"]);
  var oldVenn = ctx.loadOld(
    "Venn Diagram/venn-diagram.html",
    ["isPrime", "gcd", "factorize", "isqrt", "isPerfectSquare", "fermatSplit", "smallestFactorOf", "euclidSteps"],
    { preamble: "var FACTOR_LIMIT = 100000;\nvar FT_MAX_ITER = 2000000;" }
  );
  var oldFactorTree = ctx.loadOld(
    "Factor Tree/factor-tree.html",
    ["primeFactors", "smallestPrimeFactor", "isPrime", "isqrt", "isPerfectSquare", "fermatSplit"],
    { preamble: "var FERMAT_MAX_ITER = 2000000;" }
  );
  var oldFermats = ctx.loadOld("Fermats Method/fermats-method.html", ["isqrt", "isPerfectSquare", "isPrimeSimple"]);
  var oldEuclid = ctx.loadOld("Euclidean Algorithm/euclidean-algorithm.html", ["euclidSteps"]);
  var oldTotientTool = ctx.loadOld("Eulers Totient/eulers-totient.html", ["euclidStepsFor"]);

  /* ---------- gcd ---------- */

  for (var a = 0; a <= 80; a++) {
    for (var b = 0; b <= 80; b++) {
      ctx.eq("gcd(" + a + "," + b + ") vs Cayley", core.gcd(a, b), oldCayley.gcd(a, b));
      ctx.eq("gcd(" + a + "," + b + ") vs EqWheel", core.gcd(a, b), oldEqWheel.gcd(a, b));
      ctx.eq("gcd(" + a + "," + b + ") vs GroupIso", core.gcd(a, b), oldGroupIso.gcd(a, b));
    }
  }
  for (var a2 = -80; a2 <= 80; a2++) {
    for (var b2 = -80; b2 <= 80; b2++) {
      ctx.eq("gcd(" + a2 + "," + b2 + ") vs Shors", core.gcd(a2, b2), oldShors.gcdSmall(a2, b2));
      ctx.eq("gcd(" + a2 + "," + b2 + ") vs Venn", core.gcd(a2, b2), oldVenn.gcd(a2, b2));
    }
  }
  for (var a0 = -60; a0 <= 60; a0++) {
    for (var b0 = -60; b0 <= 60; b0++) {
      ctx.eq("gcd(" + a0 + "," + b0 + ") vs CRT", core.gcd(a0, b0), oldCrt.gcd(a0, b0));
    }
  }

  /* ---------- clamp ---------- */

  for (var v = -5; v <= 25; v++) {
    for (var lo = 0; lo <= 20; lo++) {
      for (var hi = lo; hi <= 20; hi++) {
        ctx.eq("clamp(" + v + "," + lo + "," + hi + ") vs CRT", core.clamp(v, lo, hi), oldCrt.clamp(v, lo, hi));
        ctx.eq("clamp(" + v + "," + lo + "," + hi + ") vs Cayley", core.clamp(v, lo, hi), oldCayley.clamp(v, lo, hi));
        ctx.eq("clamp(" + v + "," + lo + "," + hi + ") vs EqWheel", core.clamp(v, lo, hi), oldEqWheel.clamp(v, lo, hi));
        ctx.eq("clamp(" + v + "," + lo + "," + hi + ") vs GroupIso", core.clamp(v, lo, hi), oldGroupIso.clamp(v, lo, hi));
      }
    }
  }

  /* ---------- mod / modInverse ---------- */

  for (var x = -300; x <= 300; x++) {
    for (var m = 1; m <= 60; m++) {
      ctx.eq("mod(" + x + "," + m + ") vs ECDH", core.mod(x, m), oldEcdh.mod(x, m));
    }
  }
  for (var M = 0; M <= 600; M++) {
    for (var mm = 1; mm <= 40; mm++) {
      if (ngcd(M, mm) !== 1) continue;
      ctx.eq("modInverse(" + M + "," + mm + ") vs CRT", core.modInverse(M, mm), oldCrt.modInverse(M, mm));
    }
  }
  var smallPrimes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97];
  for (var pi = 0; pi < smallPrimes.length; pi++) {
    var p = smallPrimes[pi];
    for (var xx = -150; xx <= 300; xx++) {
      ctx.eq("modInverse(" + xx + "," + p + ") vs ECDH", core.modInverse(xx, p), oldEcdh.modInv(xx, p));
    }
  }

  /* ---------- isPrime ---------- */

  var bigPrimeVals = [1000000007, 2147483647, 999999937, 999999999989];
  for (var n = -20; n <= 20000; n++) {
    ctx.eq("isPrime(" + n + ") vs FactorTree", core.isPrime(n), oldFactorTree.isPrime(n));
    ctx.eq("isPrime(" + n + ") vs Venn", core.isPrime(n), oldVenn.isPrime(n));
    ctx.eq("isPrime(" + n + ") vs ECDH", core.isPrime(n), oldEcdh.isPrimeSmall(n));
    ctx.eq("isPrime(" + n + ") vs Shors", core.isPrime(n), oldShors.isPrimeSmall(n));
    ctx.eq("isPrime(" + n + ") vs Fermats", core.isPrime(n), oldFermats.isPrimeSimple(n));
  }
  bigPrimeVals.forEach(function (n) {
    ctx.eq("isPrime(" + n + ") vs FactorTree big", core.isPrime(n), oldFactorTree.isPrime(n));
    ctx.eq("isPrime(" + n + ") vs Venn big", core.isPrime(n), oldVenn.isPrime(n));
    ctx.eq("isPrime(" + n + ") vs ECDH big", core.isPrime(n), oldEcdh.isPrimeSmall(n));
    ctx.eq("isPrime(" + n + ") vs Shors big", core.isPrime(n), oldShors.isPrimeSmall(n));
    ctx.eq("isPrime(" + n + ") vs Fermats big", core.isPrime(n), oldFermats.isPrimeSimple(n));
  });
  [2.5, 3.5, 7.25, NaN, Infinity].forEach(function (x2) {
    ctx.eq("isPrime(" + x2 + ") vs ECDH noninteger", core.isPrime(x2), oldEcdh.isPrimeSmall(x2));
  });

  /* ---------- isqrt / isPerfectSquare ---------- */

  for (var xr = -10; xr <= 300000; xr++) {
    ctx.eq("isqrt(" + xr + ") vs FactorTree", core.isqrt(xr), oldFactorTree.isqrt(xr));
    ctx.eq("isqrt(" + xr + ") vs Fermats", core.isqrt(xr), oldFermats.isqrt(xr));
    ctx.eq("isqrt(" + xr + ") vs Venn", core.isqrt(xr), oldVenn.isqrt(xr));
    ctx.eq("isPerfectSquare(" + xr + ") vs FactorTree", core.isPerfectSquare(xr), oldFactorTree.isPerfectSquare(xr));
    ctx.eq("isPerfectSquare(" + xr + ") vs Fermats", core.isPerfectSquare(xr), oldFermats.isPerfectSquare(xr));
    ctx.eq("isPerfectSquare(" + xr + ") vs Venn", core.isPerfectSquare(xr), oldVenn.isPerfectSquare(xr));
  }
  var kVals = [];
  for (var k = 0; k <= 3000; k++) kVals.push(k);
  var rnd1 = ctx.seededRandom(4242);
  for (var ri = 0; ri < 3000; ri++) kVals.push(Math.floor(rnd1() * 94906265));
  kVals.forEach(function (k) {
    [k * k, k * k - 1, k * k + 1].forEach(function (xk) {
      ctx.eq("isqrt(" + xk + ") vs FactorTree k-based", core.isqrt(xk), oldFactorTree.isqrt(xk));
      ctx.eq("isqrt(" + xk + ") vs Fermats k-based", core.isqrt(xk), oldFermats.isqrt(xk));
      ctx.eq("isqrt(" + xk + ") vs Venn k-based", core.isqrt(xk), oldVenn.isqrt(xk));
      ctx.eq("isPerfectSquare(" + xk + ") vs FactorTree k-based", core.isPerfectSquare(xk), oldFactorTree.isPerfectSquare(xk));
      ctx.eq("isPerfectSquare(" + xk + ") vs Fermats k-based", core.isPerfectSquare(xk), oldFermats.isPerfectSquare(xk));
      ctx.eq("isPerfectSquare(" + xk + ") vs Venn k-based", core.isPerfectSquare(xk), oldVenn.isPerfectSquare(xk));
    });
  });

  /* ---------- primeFactors / smallestPrimeFactor ---------- */

  var bigFactorValsFT = [Math.pow(2, 40), Math.pow(3, 25), 999999999989, 600851475143];
  var bigFactorValsVenn = bigFactorValsFT.concat([100003 * 100019]);
  for (var n3 = -5; n3 <= 60000; n3++) {
    ctx.eq("primeFactors(" + n3 + ") vs FactorTree", core.primeFactors(n3), oldFactorTree.primeFactors(n3));
    ctx.eq("primeFactors(" + n3 + ",100000) vs Venn", core.primeFactors(n3, 100000), oldVenn.factorize(n3));
  }
  bigFactorValsFT.forEach(function (n4) {
    ctx.eq("primeFactors(" + n4 + ") vs FactorTree big", core.primeFactors(n4), oldFactorTree.primeFactors(n4));
  });
  bigFactorValsVenn.forEach(function (n5) {
    ctx.eq("primeFactors(" + n5 + ",100000) vs Venn big", core.primeFactors(n5, 100000), oldVenn.factorize(n5));
  });

  for (var vv = 0; vv <= 60000; vv++) {
    ctx.eq("smallestPrimeFactor(" + vv + ") vs FactorTree", core.smallestPrimeFactor(vv), oldFactorTree.smallestPrimeFactor(vv));
    ctx.eq("smallestPrimeFactor(" + vv + ") vs Venn", core.smallestPrimeFactor(vv), oldVenn.smallestFactorOf(vv));
  }

  /* ---------- fermatSplit ---------- */

  var oddVals = [];
  for (var vo = 1; vo <= 20001; vo += 2) oddVals.push(vo);
  var extraFermatVals = [899, 9991, 29919, 9973, 994009, 999999, 999983];
  var allFermatVals = oddVals.concat(extraFermatVals);

  allFermatVals.forEach(function (fv) {
    ctx.eq("fermatSplit(" + fv + ") vs FactorTree", core.fermatSplit(fv), oldFactorTree.fermatSplit(fv));
    ctx.eq("fermatSplit(" + fv + ") vs Venn", core.fermatSplit(fv), oldVenn.fermatSplit(fv));
  });

  oldFactorTree.context.FERMAT_MAX_ITER = 3;
  oldVenn.context.FT_MAX_ITER = 3;
  oddVals.forEach(function (fv2) {
    ctx.eq("fermatSplit(" + fv2 + ",3) vs FactorTree cap3", core.fermatSplit(fv2, 3), oldFactorTree.fermatSplit(fv2));
    ctx.eq("fermatSplit(" + fv2 + ",3) vs Venn cap3", core.fermatSplit(fv2, 3), oldVenn.fermatSplit(fv2));
  });

  allFermatVals.forEach(function (fv3) {
    ctx.eq("fermatSplit(" + fv3 + ") vs fermatSplit(v,2000000)", core.fermatSplit(fv3), core.fermatSplit(fv3, 2000000));
  });

  /* ---------- unitsMod / totient ---------- */

  for (var N = 1; N <= 300; N++) {
    ctx.eq("unitsMod(" + N + ") vs Cayley", core.unitsMod(N), oldCayley.unitsMod(N));
    ctx.eq("unitsMod(" + N + ") vs EqWheel", core.unitsMod(N), oldEqWheel.unitsMod(N));
    ctx.eq("unitsMod(" + N + ") vs GroupIso", core.unitsMod(N), oldGroupIso.unitsMod(N));
    ctx.eq("totient(" + N + ") vs GroupIso", core.totient(N), oldGroupIso.totient(N));
  }

  /* ---------- euclidSteps ---------- */

  var euclidPairs = [];
  for (var a4 = 0; a4 <= 90; a4++) {
    for (var b4 = 0; b4 <= 90; b4++) euclidPairs.push([a4, b4]);
  }
  euclidPairs.push([1000000, 1], [500000, 2], [89, 55], [1000000, 999999]);
  euclidPairs.forEach(function (pair) {
    var ea = pair[0], eb = pair[1];
    ctx.eq("euclidSteps(" + ea + "," + eb + ") vs Euclid", core.euclidSteps(ea, eb), oldEuclid.euclidSteps(ea, eb));
    ctx.eq("euclidSteps(" + ea + "," + eb + ") projection vs Venn", projectSteps(core.euclidSteps(ea, eb)), oldVenn.euclidSteps(ea, eb));
    ctx.eq("euclidSteps(" + ea + "," + eb + ") projection vs Totient", projectSteps(core.euclidSteps(ea, eb)), oldTotientTool.euclidStepsFor(ea, eb));
  });

  /* ---------- modPowSmall ---------- */

  for (var a5 = -12; a5 <= 60; a5++) {
    for (var e5 = 0; e5 <= 40; e5++) {
      for (var m5 = 1; m5 <= 60; m5++) {
        ctx.eq("modPowSmall(" + a5 + "," + e5 + "," + m5 + ")", core.modPowSmall(a5, e5, m5), oldShors.modPowSmall(a5, e5, m5));
      }
    }
  }

  /* ---------- randomInt (seeded parity) ---------- */

  var seed = 99;
  var randSrc = ctx.seededRandom.toString();
  var seededPreamble = "Math.random = (" + randSrc + ")(" + seed + ");";
  var ranges = [[0, 1], [1, 6], [-5, 5], [2, 120]];
  ranges.forEach(function (range) {
    var rlo = range[0], rhi = range[1];
    var seededCore = ctx.loadNew({ preamble: seededPreamble }).core;
    var seededCayley = ctx.loadOld("Cayley Table/cayley-table.html", ["randomInt"], { preamble: seededPreamble });
    var seededEcdh = ctx.loadOld("Elliptic Curve Diffie-Hellman/elliptic-curve-diffie-hellman.html", ["randomInt"], { preamble: seededPreamble });
    var seededEqWheel = ctx.loadOld("Equivalence Wheel/equivalence-wheel.html", ["randomInt"], { preamble: seededPreamble });
    var seededGroupIso = ctx.loadOld("Group Isomorphism/group-isomorphism.html", ["randomInt"], { preamble: seededPreamble });
    for (var i = 0; i < 2000; i++) {
      var got = seededCore.randomInt(rlo, rhi);
      ctx.eq("randomInt(" + rlo + "," + rhi + ") draw" + i + " vs Cayley", got, seededCayley.randomInt(rlo, rhi));
      ctx.eq("randomInt(" + rlo + "," + rhi + ") draw" + i + " vs ECDH", got, seededEcdh.randomInt(rlo, rhi));
      ctx.eq("randomInt(" + rlo + "," + rhi + ") draw" + i + " vs EqWheel", got, seededEqWheel.randomInt(rlo, rhi));
      ctx.eq("randomInt(" + rlo + "," + rhi + ") draw" + i + " vs GroupIso", got, seededGroupIso.randomInt(rlo, rhi));
    }
  });
};

function ngcd(a, b) {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) { var t = a % b; a = b; b = t; }
  return a;
}
