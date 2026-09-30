/* checks/bigint.check.js — parity checks for NT.bigint against every
 * pre-phase per-tool predecessor (RSA, Diffie-Hellman Key Exchange, Square
 * And Multiply where present), including seeded-random parity for the
 * Math.random-dependent functions (randomBigIntBits, randomBigIntInRange,
 * isPrimeBig). Exports function(ctx) per harness.js's contract.
 */
"use strict";

var vm = require("vm");
var fs = require("fs");
var path = require("path");

var EXPECTED_KEYS = [
  "bigGcd", "fmt", "isPrimeBig", "modPowPlain", "parseBigIntStrict",
  "randomBigIntBits", "randomBigIntInRange", "scratchNum", "shortVal"
];

var RSA_PATH = "RSA/rsa.html";
var DH_PATH = "Diffie-Hellman Key Exchange/diffie-hellman-key-exchange.html";
var SAM_PATH = "Square And Multiply/square-and-multiply.html";

// A representative numeric string of exactly `len` digits, first digit
// non-zero, built from a repeating 1-9 pattern.
function digitString(len) {
  var out = "";
  for (var i = 0; i < len; i++) out += String((i % 9) + 1);
  return out;
}

module.exports = function (ctx) {
  var NT = ctx.loadNew({});
  var bi = NT.bigint;

  ctx.eq("bigint key-set", Object.keys(bi).sort(), EXPECTED_KEYS.slice().sort());
  ctx.eq("bigint frozen", Object.isFrozen(bi), true);

  /* ---------- bigGcd parity (RSA, DH) ---------- */
  var oldRsaGcd = ctx.loadOld(RSA_PATH, ["bigGcd"], {});
  var oldDhGcd = ctx.loadOld(DH_PATH, ["bigGcd"], {});

  var gcdSpecial = [0n, 1n, -1n, 12n, -18n, 2n ** 61n - 1n, (2n ** 31n - 1n) * (2n ** 61n - 1n), 600851475143n];
  gcdSpecial.forEach(function (x) {
    gcdSpecial.forEach(function (y) {
      ctx.eq("bigGcd(" + x + "," + y + ") vs RSA", bi.bigGcd(x, y), oldRsaGcd.bigGcd(x, y));
      ctx.eq("bigGcd(" + x + "," + y + ") vs DH", bi.bigGcd(x, y), oldDhGcd.bigGcd(x, y));
    });
  });
  for (var ga = -30n; ga <= 30n; ga++) {
    for (var gb = -30n; gb <= 30n; gb++) {
      ctx.eq("bigGcd(" + ga + "," + gb + ") vs RSA", bi.bigGcd(ga, gb), oldRsaGcd.bigGcd(ga, gb));
      ctx.eq("bigGcd(" + ga + "," + gb + ") vs DH", bi.bigGcd(ga, gb), oldDhGcd.bigGcd(ga, gb));
    }
  }

  /* ---------- modPowPlain parity (RSA exhaustive; DH/SAM sampled + triples) ---------- */
  var oldRsaPow = ctx.loadOld(RSA_PATH, ["modPowPlain"], {});
  var oldDhPow = ctx.loadOld(DH_PATH, ["modPowPlain"], {});
  var oldSamPow = ctx.loadOld(SAM_PATH, ["modPowPlain"], {});

  for (var pb = -5n; pb <= 30n; pb++) {
    for (var pe = 0n; pe <= 40n; pe++) {
      for (var pm = 1n; pm <= 40n; pm++) {
        var want = oldRsaPow.modPowPlain(pb, pe, pm);
        ctx.eq("modPowPlain(" + pb + "," + pe + "," + pm + ") vs RSA", bi.modPowPlain(pb, pe, pm), want);
        if (pb % 6n === 0n && pe % 4n === 0n && pm % 4n === 0n) {
          ctx.eq("modPowPlain(" + pb + "," + pe + "," + pm + ") vs DH", bi.modPowPlain(pb, pe, pm), oldDhPow.modPowPlain(pb, pe, pm));
          ctx.eq("modPowPlain(" + pb + "," + pe + "," + pm + ") vs SAM", bi.modPowPlain(pb, pe, pm), oldSamPow.modPowPlain(pb, pe, pm));
        }
      }
    }
  }

  var m127 = 2n ** 127n - 1n, m89 = 2n ** 89n - 1n;
  var rsaTriples = [
    [m127 - 1n, 65537n, m127], [m89 - 1n, 65537n, m89], [3n, m127 - 2n, m127],
    [5n, m89 - 2n, m89], [m127, 2n, m89], [m89, 2n, m127],
    [65537n, 3n, m127], [65537n, 3n, m89], [2n, m127, m89], [2n, m89, m127],
    [7n, m127 - 3n, m89], [7n, m89 - 3n, m127], [m127 - 3n, 5n, m89],
    [m89 - 3n, 5n, m127], [11n, 100n, m127], [11n, 100n, m89],
    [m127, m89, m127], [m89, m127, m89], [13n, m127, m89], [13n, m89, m127]
  ];
  rsaTriples.forEach(function (t) {
    var wantRsa = oldRsaPow.modPowPlain(t[0], t[1], t[2]);
    ctx.eq("modPowPlain RSA-scale (" + t + ") vs RSA", bi.modPowPlain(t[0], t[1], t[2]), wantRsa);
    ctx.eq("modPowPlain RSA-scale (" + t + ") vs DH", bi.modPowPlain(t[0], t[1], t[2]), oldDhPow.modPowPlain(t[0], t[1], t[2]));
    ctx.eq("modPowPlain RSA-scale (" + t + ") vs SAM", bi.modPowPlain(t[0], t[1], t[2]), oldSamPow.modPowPlain(t[0], t[1], t[2]));
  });

  /* ---------- seeded-random parity: randomBigIntBits/InRange, isPrimeBig ---------- */
  // OLD: extract RSA's randomBigIntBits/randomBigIntInRange/modPowPlain/isPrimeBig
  // into ONE shared vm context so Math.random can be reset on it directly
  // between test cases (avoids re-spawning `git show` per reseed).
  var oldRand = ctx.loadOld(RSA_PATH, ["randomBigIntBits", "randomBigIntInRange", "modPowPlain", "isPrimeBig"], {});

  // NEW: load nt-bigint.js into its own dedicated vm context (not via
  // ctx.loadNew, which hides the context) so Math.random can be reset on it
  // the same way, without re-reading the file from disk per reseed.
  var newBigintSrc = fs.readFileSync(path.join(ctx.ROOT, "assets", "nt-bigint.js"), "utf8");
  var newContext = {};
  newContext.window = newContext;
  vm.createContext(newContext);
  vm.runInContext(newBigintSrc, newContext, { filename: "nt-bigint.js (seeded)" });
  var newSeeded = newContext.NT.bigint;

  function reseed(seed) {
    oldRand.context.Math.random = ctx.seededRandom(seed);
    newContext.Math.random = ctx.seededRandom(seed);
  }

  var bitsList = [0, 1, 5, 31, 32, 33, 64, 128, 512];
  bitsList.forEach(function (bits) {
    reseed(7);
    for (var i = 0; i < 50; i++) {
      ctx.eq("randomBigIntBits(" + bits + ") draw " + i, newSeeded.randomBigIntBits(bits), oldRand.randomBigIntBits(bits));
    }
  });

  var rangeList = [[2n, 3n], [2n, 1000n], [10n ** 20n, 10n ** 21n]];
  rangeList.forEach(function (r) {
    reseed(7);
    for (var i = 0; i < 50; i++) {
      ctx.eq("randomBigIntInRange(" + r[0] + "," + r[1] + ") draw " + i, newSeeded.randomBigIntInRange(r[0], r[1]), oldRand.randomBigIntInRange(r[0], r[1]));
    }
  });

  var primeSpecial = [561n, 41041n, 825265n, 321197185n];
  var mersenne = [2n ** 61n - 1n, 2n ** 89n - 1n, 2n ** 107n - 1n, 2n ** 127n - 1n];
  var primeTestValues = [];
  for (var pn = 0n; pn <= 3000n; pn++) primeTestValues.push(pn);
  primeSpecial.forEach(function (v) { primeTestValues.push(v); });
  mersenne.forEach(function (v) { primeTestValues.push(v - 1n, v, v + 1n); });

  primeTestValues.forEach(function (n) {
    reseed(7);
    var wantDefault = oldRand.isPrimeBig(n);
    var gotDefault = newSeeded.isPrimeBig(n);
    ctx.eq("isPrimeBig(" + n + ") default rounds", gotDefault, wantDefault);

    reseed(7);
    var wantR5 = oldRand.isPrimeBig(n, 5);
    var gotR5 = newSeeded.isPrimeBig(n, 5);
    ctx.eq("isPrimeBig(" + n + ",5)", gotR5, wantR5);
  });

  /* ---------- parseBigIntStrict parity (RSA, DH, SAM) ---------- */
  var oldRsaParse = ctx.loadOld(RSA_PATH, ["parseBigIntStrict"], {});
  var oldDhParse = ctx.loadOld(DH_PATH, ["parseBigIntStrict"], {});
  var oldSamParse = ctx.loadOld(SAM_PATH, ["parseBigIntStrict"], {});

  var parseInputs = ["", " ", "0", "00", "007", " 42 ", "-3", "1e3", "12a", "99999999999999999999999", null, undefined];
  parseInputs.forEach(function (input) {
    [true, false].forEach(function (allowZero) {
      ctx.sameOutcome("parseBigIntStrict(" + JSON.stringify(input) + "," + allowZero + ") vs RSA",
        bi.parseBigIntStrict, oldRsaParse.parseBigIntStrict, [input, allowZero]);
      ctx.sameOutcome("parseBigIntStrict(" + JSON.stringify(input) + "," + allowZero + ") vs DH",
        bi.parseBigIntStrict, oldDhParse.parseBigIntStrict, [input, allowZero]);
      ctx.sameOutcome("parseBigIntStrict(" + JSON.stringify(input) + "," + allowZero + ") vs SAM",
        bi.parseBigIntStrict, oldSamParse.parseBigIntStrict, [input, allowZero]);
    });
  });

  /* ---------- fmt parity (RSA, DH, SAM) ---------- */
  var oldRsaFmt = ctx.loadOld(RSA_PATH, ["fmt"], {});
  var oldDhFmt = ctx.loadOld(DH_PATH, ["fmt"], {});
  var oldSamFmt = ctx.loadOld(SAM_PATH, ["fmt"], {});
  var fmtValues = [0n, 7n, 999n, 1000n, 1234567n, -1234567n, 12345678901234567890n];
  fmtValues.forEach(function (v) {
    ctx.eq("fmt(" + v + ") vs RSA", bi.fmt(v), oldRsaFmt.fmt(v));
    ctx.eq("fmt(" + v + ") vs DH", bi.fmt(v), oldDhFmt.fmt(v));
    ctx.eq("fmt(" + v + ") vs SAM", bi.fmt(v), oldSamFmt.fmt(v));
  });

  /* ---------- shortVal parity (DH, SAM — RSA has no shortVal) ---------- */
  var oldDhShort = ctx.loadOld(DH_PATH, ["shortVal"], {});
  var oldSamShort = ctx.loadOld(SAM_PATH, ["shortVal"], {});
  for (var slen = 1; slen <= 80; slen++) {
    var sv = BigInt(digitString(slen));
    ctx.eq("shortVal(len=" + slen + ") vs DH", bi.shortVal(sv), oldDhShort.shortVal(sv));
    ctx.eq("shortVal(len=" + slen + ") vs SAM", bi.shortVal(sv), oldSamShort.shortVal(sv));
  }

  /* ---------- scratchNum parity (RSA, DH — the only two definers) ---------- */
  var oldRsaScratch = ctx.loadOld(RSA_PATH, ["scratchNum", "fmt"], {});
  var oldDhScratch = ctx.loadOld(DH_PATH, ["scratchNum", "fmt"], {});
  for (var clen = 1; clen <= 80; clen++) {
    var cv = BigInt(digitString(clen));
    ctx.eq("scratchNum(len=" + clen + ") vs RSA", bi.scratchNum(cv), oldRsaScratch.scratchNum(cv));
    ctx.eq("scratchNum(len=" + clen + ") vs DH", bi.scratchNum(cv), oldDhScratch.scratchNum(cv));
  }
};
