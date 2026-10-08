#!/usr/bin/env node
/* zgh-gate.js — plan-local gates for quick task 261008-e2j (Standard Moroccan
 * Tamazight, IRCAM standard, ISO 639-3 zgh, in two scripts: zgh-Latn and zgh-Tfng).
 * Dev-only, never shipped, never referenced by a page. Run from the repo root:
 *
 *   node .planning/quick/261008-e2j-add-amazigh-standard-moroccan-tamazight-/zgh-gate.js <mode> [args...]
 *
 * Modes (each prints "<NAME> bad=<n>" and exits 1 when n > 0):
 *   selftest          SELFTEST: the gate's own IRCAM table, transliteration,
 *                     orthography and notation functions against CASES.
 *   engine            ENGINE-ZGH: assets/nt-i18n.js behaviour for both codes
 *                     (exact case-sensitive allow-list, zgh/tzm/ber detection,
 *                     LTR transitions, html lang, one-for-exactly-1 plurals with
 *                     real, stubbed and absent Intl) plus ENGINE-CODE: only the
 *                     header comment, the SUPPORTED_LANGS line and the three
 *                     pinned insertions differ from BASE.
 *   checker           CHECKER-ZGH: i18n-check.js tables, exports and findings
 *                     for both codes (the behaviour spec of Task 1 step C),
 *                     including pluralCategoryFindings() under LANG=ru_RU.
 *   derive [--force] <files...>
 *                     DERIVE: writes/refreshes the zgh-Tfng block of each named
 *                     assets/i18n/<file> from its zgh-Latn block (IRCAM
 *                     transliteration; keep-list tokens, placeholders, digits and
 *                     punctuation copied; a single Latin letter that is a
 *                     variable in the English value stays Latin). An existing
 *                     zgh-Tfng value that already aligns with its zgh-Latn value
 *                     is kept (so a hand-corrected variable choice survives);
 *                     --force regenerates every value. Prints AMBIGUOUS lines
 *                     for values whose variable choice needs review.
 *   translit [files...] TRANSLIT: ZGH-TRANSLIT alignment and ZGH-NOTATION parity
 *                     only (all data files when none is named).
 *   batch <files...>  ZGH-BATCH over assets/i18n/<file>: existing languages
 *                     unchanged from BASE, zgh-Latn then zgh-Tfng last and
 *                     complete in en key order, {one, other} plural shape,
 *                     header count word, ZGH-LETTER (IRCAM Latin letters only),
 *                     QUOTE-STYLE, ENGLISH-WORD, AVOID, EPONYM-SPELLING, KEY-NAME,
 *                     SAME-AS-EN, NAV-TITLE, OWN-WORDS, SHARED-VALUES, and for
 *                     zgh-Tfng IRCAM-TFNG, ZGH-TRANSLIT, ZGH-NOTATION, plus
 *                     CHECKER (i18n-check.js's own zgh functions agree).
 *   glossary [--no-supp] GLOSSARY-ZGH: 06-GLOSSARY.md tone row, entry, (e)
 *                     sentence, (b)/(f) columns equal to site.js, (c)/(d)
 *                     columns complete and transliteration-aligned, task id in
 *                     each section, and (without --no-supp) the supplementary
 *                     table with every rendering found in its namespaces.
 *   pagecode          PAGE-CODE: page/asset code unchanged from BASE apart from
 *                     the two Tamazight option lines per page, directly after
 *                     the Bahasa Indonesia option line, same indentation.
 *   config            CONFIG: i18n-config/*.json byte-identical to BASE.
 *   unify [--allow ns.key,...]  UNIFY: one zgh-Latn rendering per repeated
 *                     multi-word English value across all namespaces.
 *   docs              DOCS-ZGH: the ten living docs at twenty-seven languages.
 *   sweep <pages...>  SWEEP: i18n-browser.js --mode switch,layout per page,
 *                     holding one of the two machine-wide lock slots shared with
 *                     cjk-gate.js / id-gate.js (lock files in the git dir).
 *                     Pass: "switch PASS ... langs=26" and "layout PASS";
 *                     Factor Tree and Venn may instead print exactly their 26
 *                     documented pre-existing switch lines. Run in background.
 *   dump <file>       prints en, zgh-Latn and zgh-Tfng for every key (review aid).
 *   font              prints whether a Tifinagh font is installed (fc-list).
 *   tf <text...>      prints the Tifinagh form of each IRCAM Latin argument.
 *   glossary-fill     fills every zgh-Tfng cell of 06-GLOSSARY.md from the zgh-Latn cell
 *                     beside it (tables whose header has zgh-Latn directly followed by
 *                     zgh-Tfng; backtick spans and [ASSUMED]/[CITED] tags copied).
 *
 * BASE defaults to e069e15 (HEAD when this task was planned); override with
 * ZGH_GATE_BASE=<rev> for a dry run elsewhere.
 */
"use strict";

var fs = require("fs");
var vm = require("vm");
var cp = require("child_process");
var path = require("path");

var BASE = process.env.ZGH_GATE_BASE || "e069e15";
var TASK = "261008-e2j";
var LATN = "zgh-Latn";
var TFNG = "zgh-Tfng";
var ZGH = [LATN, TFNG];
var I18N_DIR = "assets/i18n/";
var CHECK_PATH = path.resolve(process.cwd(), ".planning/phases/06-multi-language-support/i18n-check.js");
var GLOSSARY = ".planning/phases/06-multi-language-support/06-GLOSSARY.md";
var CONFIG_DIR = ".planning/phases/06-multi-language-support/i18n-config/";

function U(c) { return String.fromCodePoint(c); }
// Invisible format characters (built from code points so this source stays free of raw invisible characters).
var INVISIBLE_RE = new RegExp("[" + [[0x200B, 0x200F], [0x202A, 0x202E], [0x2060, 0x206F], [0xFEFF, 0xFEFF]].map(function (r) { return String.fromCodePoint(r[0]) + "-" + String.fromCodePoint(r[1]); }).join("") + "]");

/* ---------- the IRCAM table ---------- */

// IRCAM Latin transcription (lowercase) -> IRCAM Tifinagh (Unicode block U+2D30-U+2D7F):
// the 31 single letters of the 33-letter basic IRCAM alphabet (its gʷ and kʷ are g/k + the labialization mark) plus the
// extended č (U+2D5E TIFINAGH LETTER YACH) and ǧ (U+2D35 TIFINAGH LETTER BERBER ACADEMY YAJ).
var PAIRS = [
  ["a", 0x2D30], ["b", 0x2D31], ["c", 0x2D5B], [U(0x10D), 0x2D5E], ["d", 0x2D37], [U(0x1E0D), 0x2D39],
  ["e", 0x2D3B], [U(0x25B), 0x2D44], ["f", 0x2D3C], ["g", 0x2D33], [U(0x1E7), 0x2D35], [U(0x263), 0x2D56],
  ["h", 0x2D40], [U(0x1E25), 0x2D43], ["i", 0x2D49], ["j", 0x2D4A], ["k", 0x2D3D], ["l", 0x2D4D],
  ["m", 0x2D4E], ["n", 0x2D4F], ["q", 0x2D47], ["r", 0x2D54], [U(0x1E5B), 0x2D55], ["s", 0x2D59],
  [U(0x1E63), 0x2D5A], ["t", 0x2D5C], [U(0x1E6D), 0x2D5F], ["u", 0x2D53], ["w", 0x2D61], ["x", 0x2D45],
  ["y", 0x2D62], ["z", 0x2D63], [U(0x1E93), 0x2D65]
];
var LAB_L = U(0x2B7);   // MODIFIER LETTER SMALL W (gʷ, kʷ)
var LAB_T = U(0x2D6F);  // TIFINAGH MODIFIER LETTER LABIALIZATION MARK
var PHI = U(0x3C6);     // GREEK SMALL LETTER PHI, always allowed as the totient symbol
var MAP = {};
PAIRS.forEach(function (p) { MAP[p[0]] = U(p[1]); });
MAP[LAB_L] = LAB_T;
var TFNG_OK = {};
Object.keys(MAP).forEach(function (k) { TFNG_OK[MAP[k]] = true; });

// Latin tokens kept verbatim in both scripts (notation, acronyms, code identifiers,
// the narrative names, unit ms, key-cap names): SCRIPT_LATIN_NOTATION without its
// four eponyms (Fibonacci, Fourier, Garner, Hasse are adapted to IRCAM, D-NAMES),
// plus Delete, Enter, Space and ms.
var KEEP_LIST = ["AES", "Alice", "BigInt", "Blowfish", "Bob", "CRT", "DH", "DSA", "Delete", "Enter", "Eve",
  "OAEP", "PDF", "PNG", "QFT", "RSA", "SVG", "Space", "aB", "aG", "bA", "bG", "dP", "dQ", "gcd", "kG", "lcm",
  "log", "mod", "ms", "pointAdd", "qInv", "scalarMul"];
var KEEP = {};
KEEP_LIST.forEach(function (w) { KEEP[w] = true; });
var KEY_NAMES = ["Delete", "Enter", "Space"];
var KEY_NAME_KEYS = ["venn.picker.hint"];
var FORMULA_SAME = ["cayley.equationCaption", "rsa.lblQInv", "sqm.stepSquareFormula", "sqm.stepMultiplyFormula"];

// D-NAMES: English eponym spelling -> pinned IRCAM Latin form (zgh-Tfng is its transliteration).
var EPONYMS = {
  Euclid: "Uklid", Euclidean: "Uklid", Eratosthenes: "Iratustin", Euler: "Ulir", Fermat: "Firma", Cayley: "Kayli",
  Venn: "Fin", Shor: "Cur", Diffie: "Difi", Hellman: "Hilman", "Bézout": "Bizu", ElGamal: "Lgamal", Miller: "Milr",
  Garner: "Garnr", Fourier: "Furyi", Fibonacci: "Fibunači", Hasse: "Has"
};

var bad = 0;
function say() { bad++; console.log(Array.prototype.join.call(arguments, " ")); }
function git(args) { return cp.execFileSync("git", args, { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 }); }
function showBase(p) { return git(["show", BASE + ":" + p]); }
function read(p) { return fs.readFileSync(p, "utf8"); }
function finish(name) { console.log(name + " bad=" + bad); process.exit(bad ? 1 : 0); }
function eq(label, got, want) {
  if (JSON.stringify(got) !== JSON.stringify(want)) say("FAIL", label, JSON.stringify(got), "want", JSON.stringify(want));
}
function loadDicts(src) {
  var c = {};
  var NT = { i18n: { register: function (n, d) { c[n] = d; } } };
  vm.runInNewContext(src, { NT: NT, window: { NT: NT } });
  return c;
}
function dataFiles() { return fs.readdirSync(I18N_DIR).filter(function (f) { return /\.js$/.test(f); }).sort(); }
function loadAll() {
  var cat = {};
  dataFiles().forEach(function (f) {
    var d = loadDicts(read(I18N_DIR + f));
    Object.keys(d).forEach(function (ns) { cat[ns] = d[ns]; });
  });
  return cat;
}
function W(s) { return new RegExp("(?<![\\p{L}\\p{N}_])(?:" + s + ")(?![\\p{L}\\p{N}_])", "iu"); }
function Wcs(s) { return new RegExp("(?<![\\p{L}\\p{N}_])(?:" + s + ")(?![\\p{L}\\p{N}_])", "u"); }
function cps(s) { return Array.from(String(s)); }
function stripPh(s) { return String(s == null ? "" : s).replace(/\{[A-Za-z0-9_]+\}/g, " "); }

/* ---------- segmentation, transliteration, orthography, notation ---------- */

var SEG_RE = /\{[A-Za-z0-9_]+\}|[\p{L}\p{M}]+|[\s\S]/gu;
function segs(s) {
  var out = [], m, str = String(s == null ? "" : s);
  SEG_RE.lastIndex = 0;
  while ((m = SEG_RE.exec(str)) !== null) {
    var v = m[0];
    out.push({ t: /^\{[A-Za-z0-9_]+\}$/.test(v) ? "ph" : (/^[\p{L}\p{M}]/u.test(v) ? "run" : "ch"), v: v });
  }
  return out;
}

// ircamRun(run): every letter (case-folded) is an IRCAM Latin letter, and the
// labialization mark only follows g or k.
function ircamRun(run) {
  var c = cps(String(run).toLowerCase());
  if (!c.length) return false;
  for (var i = 0; i < c.length; i++) {
    if (!MAP[c[i]]) return false;
    if (c[i] === LAB_L && (i === 0 || (c[i - 1] !== "g" && c[i - 1] !== "k"))) return false;
  }
  return true;
}

// translitRun(run): a keep-list token, or a run holding any letter outside the
// IRCAM Latin alphabet (notation such as mod, p, φ, ℤₙ), is copied unchanged;
// every other run is mapped letter by letter (Tifinagh has no case).
function translitRun(run) {
  if (KEEP[run]) return run;
  if (!ircamRun(run)) return run;
  return cps(String(run).toLowerCase()).map(function (ch) { return MAP[ch]; }).join("");
}

// TF(s): full transliteration of a string, every run (single letters too). Test helper.
function TF(s) { return segs(s).map(function (g) { return g.t === "run" ? translitRun(g.v) : g.v; }).join(""); }

// enSingles(en): the multiset of single Latin letters standing alone in the English
// value (placeholders removed, e.g./i.e. removed, a letter touching an apostrophe
// such as possessive s or n't ignored). These are the notation letters.
function enSingles(en) {
  var s = stripPh(en).replace(/\b[eE]\.g\.|\b[iI]\.e\./g, " ");
  var S = segs(s), out = {};
  S.forEach(function (g, i) {
    if (g.t !== "run" || cps(g.v).length !== 1 || !/\p{Script=Latin}/u.test(g.v)) return;
    var p = S[i - 1], q = S[i + 1];
    if ((p && /['’]/.test(p.v)) || (q && /['’]/.test(q.v))) return;
    out[g.v] = (out[g.v] || 0) + 1;
  });
  return out;
}
function latinSingles(tfng) {
  var out = {};
  segs(stripPh(tfng)).forEach(function (g) {
    if (g.t === "run" && cps(g.v).length === 1 && /\p{Script=Latin}/u.test(g.v)) out[g.v] = (out[g.v] || 0) + 1;
  });
  return out;
}

// latinFindings(id, lang, value, en): ZGH-LETTER for a zgh-Latn value.
function latinFindings(id, lang, value, en) {
  if (lang !== LATN || typeof value !== "string") return [];
  var f = [], enRuns = {};
  segs(stripPh(en)).forEach(function (g) { if (g.t === "run") enRuns[g.v] = true; });
  segs(stripPh(value)).forEach(function (g) {
    if (g.t !== "run") return;
    var r = g.v;
    if (KEEP[r]) return;
    if (/\p{Script=Tifinagh}/u.test(r)) { f.push("ZGH-LETTER " + id + "." + lang + ": Tifinagh inside a Latin-script value " + JSON.stringify(r)); return; }
    var n = cps(r).length;
    if (n === 1) {
      if (MAP[r.toLowerCase()] && r !== LAB_L) return;
      if (r === PHI) return; // the totient symbol (Tasɣnt φ n Ulir), as the Indonesian gate allowed it
      if (enRuns[r]) return;
      f.push("ZGH-LETTER " + id + "." + lang + ": " + JSON.stringify(r) + " is not an IRCAM Latin letter and not a notation letter of the English value");
      return;
    }
    if (r === r.toUpperCase() && r !== r.toLowerCase()) { f.push("ZGH-LETTER " + id + "." + lang + ": acronym " + JSON.stringify(r) + " is not on the keep list (translate it)"); return; }
    if (ircamRun(r)) return;
    if (enRuns[r] && !/[A-Za-z]/.test(r)) return;
    f.push("ZGH-LETTER " + id + "." + lang + ": " + JSON.stringify(r) + " holds a letter outside the IRCAM Latin alphabet");
  });
  return f;
}

// translitFindings(id, lang, value, latn, en): ZGH-TRANSLIT (segment alignment with
// the zgh-Latn value) and ZGH-NOTATION (single Latin letters kept in zgh-Tfng equal
// the English value's notation letters; a and A may be fewer, English's article).
function translitFindings(id, lang, value, latn, en) {
  if (lang !== TFNG || typeof value !== "string" || typeof latn !== "string") return [];
  var f = [];
  var A = segs(latn), B = segs(value);
  if (A.length !== B.length) {
    f.push("ZGH-TRANSLIT " + id + "." + lang + ": " + A.length + " segments in zgh-Latn vs " + B.length + " in zgh-Tfng");
  } else {
    for (var i = 0; i < A.length; i++) {
      var a = A[i], b = B[i];
      var ok = a.t === b.t && (a.t !== "run" ? a.v === b.v : (b.v === translitRun(a.v) || (cps(a.v).length === 1 && b.v === a.v)));
      if (!ok) {
        f.push("ZGH-TRANSLIT " + id + "." + lang + ": " + JSON.stringify(a.v) + " -> " + JSON.stringify(b.v) + " (want " + JSON.stringify(a.t === "run" ? translitRun(a.v) : a.v) + ")");
        break;
      }
    }
  }
  var E = enSingles(en), T = latinSingles(value), keys = {};
  Object.keys(E).concat(Object.keys(T)).forEach(function (k) { keys[k] = true; });
  Object.keys(keys).sort().forEach(function (X) {
    var e = E[X] || 0, t = T[X] || 0;
    var wrong = (X === "a" || X === "A") ? t > e : t !== e;
    if (wrong) f.push("ZGH-NOTATION " + id + "." + lang + ": notation letter " + JSON.stringify(X) + " appears " + e + "x in en but " + t + "x as Latin in zgh-Tfng");
  });
  return f;
}

// tfngLetterFindings: IRCAM-TFNG — only IRCAM Tifinagh letters, the labialization
// mark only after ⴳ / ⴽ.
function tfngLetterFindings(id, value) {
  var c = cps(value), f = [];
  for (var i = 0; i < c.length; i++) {
    if (!/\p{Script=Tifinagh}/u.test(c[i])) continue;
    if (!TFNG_OK[c[i]]) { f.push("IRCAM-TFNG " + id + ": U+" + c[i].codePointAt(0).toString(16).toUpperCase() + " is not an IRCAM Tifinagh letter"); break; }
    if (c[i] === LAB_T && (i === 0 || (c[i - 1] !== MAP.g && c[i - 1] !== MAP.k))) { f.push("IRCAM-TFNG " + id + ": labialization mark not after YAG/YAK"); break; }
  }
  return f;
}

/* ---------- derivation (variable choice heuristic) ---------- */

var MATH_CH = /[0-9=≡≠<>≤≥+\-−×·*\/^()[\]|,;:²³¹⁰-⁹₀-₉′_√⌊-⌍]/u;
function nb(S, i, dir) {
  for (var j = i + dir; j >= 0 && j < S.length; j += dir) {
    if (S[j].t === "ch" && /\s/.test(S[j].v)) continue;
    return S[j];
  }
  return null;
}
function isMathSeg(g) {
  if (!g) return false;
  if (g.t === "ph") return true;
  if (g.t === "ch") return MATH_CH.test(g.v);
  return cps(g.v).length === 1 || /^(?:gcd|lcm|mod|log)$/.test(g.v);
}
function isTail(g) { return !g || (g.t === "ch" && /[.!?…»)\]]/.test(g.v)); }

// deriveValue(latn, en, note): zgh-Tfng from zgh-Latn. A single IRCAM letter that the
// English value uses as notation stays Latin when it sits in a math context (next to a
// digit, operator, bracket, comma, colon, placeholder or another single letter) or ends
// a clause; when that count differs from the English count the first candidates are
// used and the value is reported for review. a/A stay Latin only in a math context.
function deriveValue(latn, en, note) {
  var S = segs(latn), E = enSingles(en), by = {};
  S.forEach(function (g, i) {
    if (g.t === "run" && cps(g.v).length === 1 && MAP[g.v.toLowerCase()] && E[g.v]) (by[g.v] = by[g.v] || []).push(i);
  });
  var keep = {};
  Object.keys(by).forEach(function (X) {
    var idx = by[X], k = E[X];
    var math = idx.filter(function (i) { return isMathSeg(nb(S, i, -1)) || isMathSeg(nb(S, i, 1)); });
    var chosen;
    if (X === "a" || X === "A") {
      chosen = math.slice(0, k);
      if (idx.length > chosen.length && math.length) note("AMBIGUOUS " + JSON.stringify(X) + " kept Latin " + chosen.length + " of " + idx.length + " (en " + k + ")");
    } else {
      var likely = idx.filter(function (i) { return math.indexOf(i) !== -1 || isTail(nb(S, i, 1)); });
      if (likely.length === k) chosen = likely;
      else {
        chosen = likely.concat(idx.filter(function (i) { return likely.indexOf(i) === -1; })).slice(0, k);
        note("AMBIGUOUS " + JSON.stringify(X) + " en " + k + "x, zgh-Latn " + idx.length + "x, " + likely.length + " in a math/clause-end position; kept Latin at segments " + chosen.join(","));
      }
    }
    chosen.forEach(function (i) { keep[i] = true; });
  });
  return S.map(function (g, i) { return g.t !== "run" ? g.v : (keep[i] ? g.v : translitRun(g.v)); }).join("");
}

/* ---------- CASES (selftest runs them on the gate, checker on i18n-check.js) ---------- */

var EN2 = { one: "{count} step", other: "{count} steps" };
function CASES() {
  var L = LATN, T = TFNG;
  return [
    // [function name, args, expected finding codes ([] = none)]
    ["latin", ["t.k", L, "Sti yan umḍan amnzu sg tbalitt.", "Pick a prime from the palette."], []],
    ["latin", ["t.k", L, "Sti a prime", "Pick a prime"], ["ZGH-LETTER"]],
    ["latin", ["t.k", L, "Tasarut tamatayt n Alice: RSA, gcd(a, b) mod n.", "Alice’s public key: RSA, gcd(a, b) mod n."], []],
    ["latin", ["t.k", L, "ta" + U(0x3B5) + "rabt", "x"], ["ZGH-LETTER"]],
    ["latin", ["t.k", L, "tamazi" + U(0x3B3) + "t", "x"], ["ZGH-LETTER"]],
    ["latin", ["t.k", L, "tasarut " + U(0x2D5C), "key"], ["ZGH-LETTER"]],
    ["latin", ["t.k", L, "ak" + LAB_L + " d ag" + LAB_L + "mar", "all"], []],
    ["latin", ["t.k", L, "a" + LAB_L + "al", "x"], ["ZGH-LETTER"]],
    ["latin", ["t.k", L, "Amḍan amnzu p", "Prime p"], []],
    ["latin", ["t.k", L, "p amnzu", "Prime"], ["ZGH-LETTER"]],
    ["latin", ["t.k", L, "φ(n) d ℤ", "φ(n) and ℤ"], []],
    ["latin", ["t.k", L, "Alguritm n Fourier", "Fourier transform"], ["ZGH-LETTER"]],
    ["latin", ["t.k", L, "GCD n a d b", "GCD of a and b"], ["ZGH-LETTER"]],
    ["latin", ["t.k", L, "Tasarut AES", "AES key"], []],
    ["latin", ["t.k", L, "Tasɣnt " + PHI + " n Ulir", "Euler\u2019s Totient"], []],
    ["latin", ["t.k", L, U(0x194) + "er " + U(0x1E0C) + " " + U(0x1E62), "x"], []],
    ["latin", ["t.k", "id", "prime " + U(0x3B5), "prime"], []],
    ["latin", ["t.k", L, "Sit ɣf Enter nɣ Space", "press Enter or Space"], []],
    ["translit", ["t.k", T, TF("Sti yan umḍan amnzu sg tbalitt."), "Sti yan umḍan amnzu sg tbalitt.", "Pick a prime from the palette."], []],
    ["translit", ["t.k", T, TF("Tasarut tamatayt n") + " Alice", "Tasarut tamatayt n Alice", "Alice’s public key"], []],
    ["translit", ["t.k", T, TF("Tasarut tamatayt n") + " " + MAP.a + MAP.l + MAP.i + MAP.c + MAP.e, "Tasarut tamatayt n Alice", "Alice’s public key"], ["ZGH-TRANSLIT"]],
    ["translit", ["t.k", T, TF("tasaru") + U(0x2D5F), "tasarut", "key"], ["ZGH-TRANSLIT"]],
    ["translit", ["t.k", T, TF("tasarut"), "tasarut.", "key."], ["ZGH-TRANSLIT"]],
    ["translit", ["t.k", T, "{n} " + TF("n imḍanen"), "{count} n imḍanen", "{count} numbers"], ["ZGH-TRANSLIT"]],
    ["translit", ["t.k", T, TF("Sti amḍan") + " n", "Sti amḍan n", "Choose a number n"], []],
    ["translit", ["t.k", T, TF("Sti amḍan n"), "Sti amḍan n", "Choose a number n"], ["ZGH-NOTATION"]],
    ["translit", ["t.k", T, TF("Tasarut") + " n Alice", "Tasarut n Alice", "Alice’s key"], ["ZGH-NOTATION"]],
    ["translit", ["t.k", T, MAP.a + MAP.k + LAB_T, "ak" + LAB_L, "all"], []],
    ["translit", ["t.k", T, TF("amḍan"), "Amḍan", "Number"], []],
    ["translit", ["t.k", T, "φ(n) " + MAP.d + " ℤ", "φ(n) d ℤ", "φ(n) and ℤ"], []],
    ["translit", ["t.k", T, "RSA " + TF("s 2048 n ibitn"), "RSA s 2048 n ibitn", "2048-bit RSA"], []],
    ["translit", ["t.k", T, TF("tamazi") + "ɣ" + MAP.t, "tamaziɣt", "x"], ["ZGH-TRANSLIT"]],
    ["translit", ["t.k", T, "a = 3", "a = 3", "Let a = 3"], []],
    ["translit", ["t.k", T, TF("Tagrumma") + " A", "Tagrumma A", "Set A"], []],
    ["translit", ["t.k", T, "k_A", "k_A", "k_A"], []],
    ["translit", ["t.k", "ru", "x", "y", "z"], []],
    ["translit", ["t.k", T, TF("tasarut"), undefined, "key"], []],
    ["translit", ["t.k", T, TF("tasarut tamatayt"), "tasarut", "key"], ["ZGH-TRANSLIT"]],
    ["translit", ["t.k", T, TF("Sit ɣf") + " Enter " + TF("nɣ") + " Space", "Sit ɣf Enter nɣ Space", "press Enter or Space"], []],
    ["translit", ["t.k", T, TF("Amuḍul") + " N", "Amuḍul N", "Modulus N"], []],
    ["translit", ["t.k", T, TF("Amuḍul N"), "Amuḍul N", "Modulus N"], ["ZGH-NOTATION"]],
    ["translit", ["t.k", T, TF("Amḍan amnzu") + " p", "Amḍan amnzu p", "Prime p"], []]
  ];
}
var TRANSLIT_RUNS = [
  ["tamaziɣt", [0x2D5C, 0x2D30, 0x2D4E, 0x2D30, 0x2D63, 0x2D49, 0x2D56, 0x2D5C]],
  ["Tamaziɣt", [0x2D5C, 0x2D30, 0x2D4E, 0x2D30, 0x2D63, 0x2D49, 0x2D56, 0x2D5C]],
  ["Uklid", [0x2D53, 0x2D3D, 0x2D4D, 0x2D49, 0x2D37]],
  ["ak" + LAB_L, [0x2D30, 0x2D3D, 0x2D6F]],
  [U(0x190) + U(0x10C) + U(0x1E0C) + U(0x1E6) + U(0x1E24) + U(0x1E5A) + U(0x1E62) + U(0x1E6C) + U(0x1E92) + U(0x194),
    [0x2D44, 0x2D5E, 0x2D39, 0x2D35, 0x2D43, 0x2D55, 0x2D5A, 0x2D5F, 0x2D65, 0x2D56]],
  ["Alice", null], ["mod", null], ["pointAdd", null], ["p", null], ["ℤₙ", null], ["Bob", null], ["a" + LAB_L, null]
];
function runCases(impl) {
  CASES().forEach(function (c, n) {
    var fn = impl[c[0]];
    var got = fn.apply(null, c[1]);
    var label = "case " + (n + 1) + " " + c[0] + " " + JSON.stringify(c[1][2]).slice(0, 60);
    if (!Array.isArray(got)) { say("NOT-ARRAY", label); return; }
    if (!c[2].length) { if (got.length) say("UNEXPECTED", label, JSON.stringify(got)); return; }
    c[2].forEach(function (code) {
      if (!got.some(function (s) { return s.indexOf(code + " ") === 0; })) say("MISSING", label, code, JSON.stringify(got));
    });
  });
  TRANSLIT_RUNS.forEach(function (t) {
    var want = t[1] ? t[1].map(U).join("") : t[0];
    eq("transliterate " + JSON.stringify(t[0]), impl.transliterate(t[0]), want);
  });
}

/* ---------- selftest ---------- */

function selftestMode() {
  eq("MAP size (33 letters + labialization mark)", Object.keys(MAP).length, 34);
  eq("Tifinagh targets distinct", Object.keys(TFNG_OK).length, 34);
  Object.keys(MAP).forEach(function (k) {
    if (k.normalize("NFC") !== k) say("MAP-NOT-NFC", JSON.stringify(k));
    if (!/\p{Script=Tifinagh}/u.test(MAP[k])) say("MAP-NOT-TIFINAGH", k);
  });
  eq("autonym", TF("Tamaziɣt"), [0x2D5C, 0x2D30, 0x2D4E, 0x2D30, 0x2D63, 0x2D49, 0x2D56, 0x2D5C].map(U).join(""));
  runCases({ latin: latinFindings, translit: translitFindings, transliterate: translitRun });
  var notes = [];
  eq("derive variable n", deriveValue("Sti amḍan n", "Choose a number n", function (s) { notes.push(s); }), TF("Sti amḍan") + " n");
  eq("derive genitive n", deriveValue("Tasarut n Alice", "Alice’s key", function (s) { notes.push(s); }), TF("Tasarut n") + " Alice");
  eq("derive n = 12", deriveValue("amḍan n = 12 d amḍan n imḍanen", "the number n = 12", function (s) { notes.push(s); }), TF("amḍan") + " n = 12 " + TF("d amḍan n imḍanen"));
  eq("derive a in formula", deriveValue("a² − N = b²", "a² − N = b²", function (s) { notes.push(s); }), "a² − N = b²");
  eq("derive keep and digits", deriveValue("RSA s 2048 n ibitn", "2048-bit RSA", function (s) { notes.push(s); }), "RSA " + TF("s 2048 n ibitn"));
  finish("SELFTEST");
}

/* ---------- engine ---------- */

function engineMode() {
  var file = "assets/nt-i18n.js";
  var src = read(file);
  function mk(q, langs, cookie, intl) {
    var de = { lang: "", attrs: {},
      setAttribute: function (k, v) { this.attrs[k] = String(v); },
      removeAttribute: function (k) { delete this.attrs[k]; },
      getAttribute: function (k) { return k in this.attrs ? this.attrs[k] : null; } };
    var c = { location: { search: q, pathname: "/x.html", hash: "" }, navigator: { languages: langs },
      document: { readyState: "complete", cookie: cookie || "", documentElement: de,
        querySelectorAll: function () { return []; }, getElementsByTagName: function () { return []; },
        getElementById: function () { return null; }, addEventListener: function () {} } };
    c.window = c;
    if (intl !== undefined) c.Intl = intl;
    vm.createContext(c);
    vm.runInContext(src, c);
    return { I: c.NT.i18n, de: de };
  }
  var r = mk("", ["en"]);
  eq("SUPPORTED_LANGS", r.I.SUPPORTED_LANGS.join(","), "nl,en,de,fr,es,it,pl,pt-BR,pt-PT,sv,nb,ro,hu,lv,ru,el,he,hi,ar,sq,sw,zh,ja,ko,id,zgh-Latn,zgh-Tfng");
  [
    [["zgh"], TFNG], [["zgh-MA"], TFNG], [["zgh-Tfng"], TFNG], [["zgh-Tfng-MA"], TFNG], [["ZGH_tfng"], TFNG],
    [["zgh-Arab"], TFNG], [["zgh-Latn"], LATN], [["zgh-Latn-MA"], LATN], [["ZGH_LATN", "en"], LATN],
    [["zgh_latn_ma"], LATN], [["Zgh-lAtN"], LATN], [["tzm"], TFNG], [["tzm-Latn", "en"], LATN], [["tzm-MA"], TFNG],
    [["tzm-Tfng-MA"], TFNG], [["TZM_latn"], LATN], [["ber"], TFNG], [["ber-Latn"], LATN], [["BER-MA"], TFNG],
    [["ber-DZ"], TFNG], [["tzm-Arab"], TFNG],
    [["kab", "en"], "en"], [["kab-DZ"], "en"], [["kab-Latn", "en"], "en"], [["shi", "en"], "en"], [["shi-Latn"], "en"],
    [["shi-Tfng"], "en"], [["rif", "en"], "en"], [["rif-Latn"], "en"], [["zg", "en"], "en"], [["zgx", "en"], "en"],
    [["zghx", "en"], "en"], [["tz", "en"], "en"], [["tzmx"], "en"], [["be", "en"], "en"], [["bem", "en"], "en"],
    [["berx", "en"], "en"], [["Latn"], "en"], [["Tfng"], "en"],
    [["en-MA", "zgh"], "en"], [["fr-MA", "zgh"], "fr"], [["ar-MA", "zgh"], "ar"], [["th", "zgh-Latn"], LATN],
    [["kab", "tzm"], TFNG], [["shi", "ber-Latn"], LATN], [["zgh", "fr"], TFNG], [["id", "zgh"], "id"],
    [["in", "zgh"], "id"], [["zgh", "in"], TFNG], [["pt-BR", "zgh"], "pt-BR"], [["iw", "zgh-Latn"], "he"],
    [["iw"], "he"], [["no-NO"], "nb"], [["ko-KR"], "ko"], [["zh-Hant-TW"], "zh"], [["in-ID"], "id"], [["en-US"], "en"],
    [["ido", "en"], "id"], [["inh", "en"], "en"]
  ].forEach(function (t) { eq("detect " + t[0].join(","), mk("", t[0]).I.detectDefaultLang(), t[1]); });
  ZGH.forEach(function (code) {
    var x = mk("?lang=" + code, ["en"]);
    eq("load " + code + " lang", x.de.lang, code);
    eq("load " + code + " dir", x.de.getAttribute("dir"), null);
    eq("getLang " + code, x.I.getLang(), code);
    x.I.setLang("ar");
    eq("ar dir", x.de.getAttribute("dir"), "rtl");
    eq("setLang " + code + " after ar", x.I.setLang(code), true);
    eq(code + " after ar lang", x.de.lang, code);
    eq(code + " after ar dir", x.de.getAttribute("dir"), null);
    x.I.setLang("he");
    x.I.setLang(code);
    eq(code + " after he dir", x.de.getAttribute("dir"), null);
    x.I.setLang("ar");
    eq("ar after " + code + " dir", x.de.getAttribute("dir"), "rtl");
  });
  var y = mk("?lang=zgh-Latn", ["en"]);
  eq("setLang zgh-Tfng from zgh-Latn", y.I.setLang(TFNG), true);
  eq("html lang zgh-Tfng", y.de.lang, TFNG);
  eq("setLang zgh-Latn back", (y.I.setLang(LATN), y.de.lang), LATN);
  eq("?lang=zgh%2DTfng decodes", mk("?lang=zgh%2DTfng", ["en"]).de.lang, TFNG);
  eq("?lang=zgh-latn falls through", mk("?lang=zgh-latn", ["en"]).de.lang, "en");
  eq("?lang=zgh falls through to detected", mk("?lang=zgh", ["zgh-MA", "en"]).de.lang, TFNG);
  eq("?lang=tzm falls through", mk("?lang=tzm", ["en"]).de.lang, "en");
  eq("cookie zgh-Tfng", mk("", ["en"], "site-lang=zgh-Tfng").de.lang, TFNG);
  eq("cookie zgh-Latn", mk("", ["en"], "site-lang=zgh-Latn").de.lang, LATN);
  eq("cookie zgh-TFNG falls through", mk("", ["en"], "site-lang=zgh-TFNG").de.lang, "en");
  eq("cookie zgh falls through", mk("", ["en"], "site-lang=zgh").de.lang, "en");
  eq("?lang=zgh-Latn beats cookie zgh-Tfng", mk("?lang=zgh-Latn", ["en"], "site-lang=zgh-Tfng").de.lang, LATN);
  ["zgh", "zgh-latn", "zgh-LATN", "ZGH-Latn", "Zgh-Latn", "zgh-tfng", "zgh-TFNG", "zgh_Latn", "zgh_Tfng", "zgh-Latn-MA",
    "zgh-MA", "zgh-Tifinagh", "zgh-Latin", "tzm", "tzm-Latn", "ber", "kab", "shi", "Latn", "Tfng", " zgh-Latn",
    "zgh-Latn ", "zgh-Tfng\n"].forEach(function (v) { eq("setLang " + JSON.stringify(v), r.I.setLang(v), false); });
  // Plurals: one for exactly 1, other otherwise — with the real Intl, a stub that behaves like
  // a ru/fr/ja default locale, and no Intl at all.
  function Stub() {}
  Stub.prototype.select = function (n) { return n === 1 ? "other" : (n === 0 || n === 21 || n === 1.5 ? "one" : (n === 2 ? "few" : "many")); };
  Stub.prototype.resolvedOptions = function () { return { locale: "ru", pluralCategories: ["few", "many", "one", "other"] }; };
  [["real Intl", undefined], ["stub Intl", { PluralRules: Stub }], ["no Intl", null]].forEach(function (v) {
    var z = v[1] === null ? mk("", ["en"], "", undefined) : mk("", ["en"], "", v[1]);
    if (v[1] === null) z = (function () {
      var de = { lang: "", attrs: {}, setAttribute: function (k, val) { this.attrs[k] = String(val); }, removeAttribute: function (k) { delete this.attrs[k]; }, getAttribute: function (k) { return k in this.attrs ? this.attrs[k] : null; } };
      var c = { location: { search: "", pathname: "/x.html", hash: "" }, navigator: { languages: ["en"] },
        document: { readyState: "complete", cookie: "", documentElement: de, querySelectorAll: function () { return []; },
          getElementsByTagName: function () { return []; }, getElementById: function () { return null; }, addEventListener: function () {} } };
      c.window = c;
      vm.createContext(c);
      vm.runInContext("delete globalThis.Intl;", c);
      vm.runInContext(src, c);
      return { I: c.NT.i18n, de: de, hasIntl: vm.runInContext("typeof Intl", c) };
    })();
    if (v[1] === null) eq("no Intl in context", z.hasIntl, "undefined");
    z.I.register("trzghgate", {
      en: { count: { one: "{count} one", other: "{count} other" } },
      "zgh-Latn": { count: { one: "{count} one", other: "{count} other" } },
      "zgh-Tfng": { count: { one: "{count} one", other: "{count} other" } }
    });
    ZGH.forEach(function (code) {
      z.I.setLang(code);
      [0, 1, 2, 1.5, 11, 21, 100, 1000000].forEach(function (n) {
        eq(v[0] + " " + code + " plural " + n, z.I.translate("trzghgate.count", { count: n }), n + (n === 1 ? " one" : " other"));
      });
    });
  });
  if (!/var RTL_LANGS = Object\.freeze\(\['he', 'ar'\]\);/.test(src)) say("RTL-LANGS-CHANGED");
  // ENGINE-CODE: only the header comment, the SUPPORTED_LANGS line and three pinned insertions differ.
  var o = showBase(file).split("\n"), n = src.split("\n");
  var ho = o.indexOf("(function () {"), hn = n.indexOf("(function () {");
  if (ho < 0 || hn < 0) { say("ENGINE-CODE IIFE start not found"); finish("ENGINE-ZGH"); }
  var header = n.slice(0, hn).join("\n");
  if (!/script-tagged `zgh-Latn`\/`zgh-Tfng`/.test(header.replace(/\s+/g, " "))) say("ENGINE-CODE header comment does not describe the script-tagged `zgh-Latn`/`zgh-Tfng` codes");
  if (!/^\/\*/.test(n[0]) || /\*\/[\s\S]*\S[\s\S]*$/.test(header.replace(/\*\/\s*$/, "").replace(/^[\s\S]*?\*\//, ""))) { /* header is one comment */ }
  o = o.slice(ho); n = n.slice(hn);
  function take(re, after, name) {
    for (var i = 1; i < n.length; i++) {
      if (re.test(n[i])) {
        if (after && !after.test(n[i - 1])) say("ENGINE-CODE " + name + " not at its pinned position (line before: " + JSON.stringify(n[i - 1]).slice(0, 100) + ")");
        return i;
      }
    }
    say("ENGINE-CODE " + name + " missing");
    return -1;
  }
  var ind = function (s) { return (/^\s*/.exec(s) || [""])[0]; };
  var i1 = take(/^  \/\/ Standard Moroccan Tamazight \(zgh-Latn, zgh-Tfng\) has no CLDR plural data/, /^  var RTL_LANGS = /, "FIXED_PLURAL_LANGS comment");
  if (i1 > 0) {
    if (!/^  var FIXED_PLURAL_LANGS = Object\.freeze\(\['zgh-Latn', 'zgh-Tfng'\]\);$/.test(n[i1 + 1])) say("ENGINE-CODE FIXED_PLURAL_LANGS declaration missing after its comment");
    else n.splice(i1, 2);
  }
  var i2 = take(/^    if \(FIXED_PLURAL_LANGS\.indexOf\(lang\) !== -1\) return count === 1 \? 'one' : 'other';$/, /^  function pluralCategory\(lang, count\) \{$/, "pluralCategory fixed-rule line");
  if (i2 > 0) n.splice(i2, 1);
  var i3 = take(/^      \/\/ Tamazight: /, /^      if \(parts\[0\] === 'in'\) return 'id';$/, "detection comment");
  if (i3 > 0) {
    if (n[i3 + 1] !== "      if (parts[0] === 'zgh' || parts[0] === 'tzm' || parts[0] === 'ber') return parts.indexOf('latn') !== -1 ? 'zgh-Latn' : 'zgh-Tfng';") say("ENGINE-CODE detection statement missing or different after its comment");
    else n.splice(i3, 2);
  }
  if (o.length !== n.length) say("ENGINE-CODE line count after removing the insertions", o.length, "->", n.length);
  else {
    for (var j = 0; j < o.length; j++) {
      if (o[j] === n[j]) continue;
      var okLine = /var SUPPORTED_LANGS = /.test(o[j]) && n[j] === o[j].replace("'id']);", "'id', 'zgh-Latn', 'zgh-Tfng']);");
      if (!okLine) say("ENGINE-CODE changed line", j + hn + 1, JSON.stringify(n[j]).slice(0, 140));
    }
  }
  finish("ENGINE-ZGH");
}

/* ---------- checker ---------- */

function checkerMode() {
  var c = require(CHECK_PATH);
  var need = ["SWITCHER_OPTIONS", "LANG_CODES", "RTL_LANGS", "PLURAL_EXTRA_CATEGORIES", "PLURAL_OTHER_ONLY_LANGS",
    "FIXED_PLURAL_LANGS", "CJK_LANGS", "DIGIT_PARITY_LANGS", "SCRIPT_RULES", "ZGH_LATN_TO_TFNG", "ZGH_KEEP",
    "expectedPluralCategories", "isProse", "pluralCategoryFindings", "checkPluralEntry", "scriptFindings",
    "charFindings", "digitParityFindings", "cjkFindings", "zghTransliterate", "zghLatinFindings",
    "zghTransliterationFindings"];
  var missing = need.filter(function (k) { return !(k in c); });
  if (missing.length) { say("EXPORT-MISSING", missing.join(",")); finish("CHECKER-ZGH"); }
  eq("switcher tail", c.SWITCHER_OPTIONS.slice(-4).map(function (o) { return o.value + "/" + o.lang + "/" + o.label; }),
    ["ko/ko/한국어", "id/id/Bahasa Indonesia", "zgh-Latn/zgh-Latn/Tamaziɣt", "zgh-Tfng/zgh-Tfng/" + TF("Tamaziɣt")]);
  eq("LANG_CODES length", c.LANG_CODES.length, 27);
  eq("RTL_LANGS", c.RTL_LANGS, ["he", "ar"]);
  eq("PLURAL_OTHER_ONLY_LANGS", c.PLURAL_OTHER_ONLY_LANGS, ["zh", "ja", "ko", "id"]);
  eq("FIXED_PLURAL_LANGS", c.FIXED_PLURAL_LANGS, [LATN, TFNG]);
  eq("CJK_LANGS", c.CJK_LANGS, ["zh", "ja", "ko"]);
  eq("DIGIT_PARITY_LANGS", c.DIGIT_PARITY_LANGS, ["hi", "ar", "sq", "sw", "zh", "ja", "ko", "id", LATN, TFNG]);
  ZGH.forEach(function (L) {
    eq("plural " + L, c.expectedPluralCategories(L), ["one", "other"]);
    eq("no extra " + L, L in c.PLURAL_EXTRA_CATEGORIES, false);
  });
  eq("plural id", c.expectedPluralCategories("id"), ["other"]);
  eq("plural ar", c.expectedPluralCategories("ar"), ["few", "many", "one", "other", "two", "zero"]);
  eq("no script rule zgh-Latn", LATN in c.SCRIPT_RULES, false);
  eq("script rule zgh-Tfng", TFNG in c.SCRIPT_RULES, true);
  var mapGot = {}, mapWant = {};
  Object.keys(c.ZGH_LATN_TO_TFNG).forEach(function (k) { mapGot[k] = c.ZGH_LATN_TO_TFNG[k]; });
  Object.keys(MAP).forEach(function (k) { mapWant[k] = MAP[k]; });
  eq("ZGH_LATN_TO_TFNG", Object.keys(mapGot).sort().map(function (k) { return k + mapGot[k]; }), Object.keys(mapWant).sort().map(function (k) { return k + mapWant[k]; }));
  eq("ZGH_KEEP", c.ZGH_KEEP.slice().sort(), KEEP_LIST.slice().sort());
  eq("zgh-Tfng latin list = ZGH_KEEP", c.SCRIPT_RULES[TFNG].latin.slice().sort(), KEEP_LIST.slice().sort());
  ["ru", "el", "he", "hi", "ar", "zh", "ja", "ko"].forEach(function (L) {
    if (!c.SCRIPT_RULES[L].foreign.test("x " + MAP.t + " y")) say("FOREIGN-NO-TIFINAGH", L);
  });
  var tf = c.SCRIPT_RULES[TFNG];
  if (!tf.own.test(MAP.t)) say("OWN", "zgh-Tfng own does not match a Tifinagh letter");
  [U(0x263), U(0x1E0D), U(0x25B), U(0x10D), LAB_L, U(0x2D52), U(0x2D60), "д", "αβ"].forEach(function (ch) {
    if (!tf.foreign.test("x" + ch + "y")) say("FOREIGN-MISSES", JSON.stringify(ch));
  });
  [TF("Tamaziɣt"), MAP.g + LAB_T, "φ", "x"].forEach(function (s) {
    if (tf.foreign.test(s)) say("FOREIGN-TOO-WIDE", JSON.stringify(s));
  });
  if (!tf.foreign.test(MAP.a + LAB_T)) say("FOREIGN-MISSES labialization mark after YA");
  ZGH.forEach(function (L) { eq("autonym neutral " + L, c.isProse(L === LATN ? "Tamaziɣt" : TF("Tamaziɣt")), false); });
  var pc = c.pluralCategoryFindings();
  if (pc.length) say("PLURAL-CATS", JSON.stringify(pc));
  // pluralCategoryFindings() must stay clean when Node's default locale is Russian
  // (Intl.PluralRules falls back to it for zgh).
  try {
    var out = cp.execFileSync("node", ["-e", "var c=require(" + JSON.stringify(CHECK_PATH) + ");process.stdout.write(JSON.stringify({loc:new Intl.PluralRules('zgh').resolvedOptions().locale,f:c.pluralCategoryFindings()}))"],
      { encoding: "utf8", env: Object.assign({}, process.env, { LANG: "ru_RU.UTF-8", LC_ALL: "ru_RU.UTF-8" }) });
    var res = JSON.parse(out);
    if (!/^ru/.test(res.loc)) console.log("NOTE default-locale check ran with " + res.loc + " (no ru locale here)");
    if (res.f.length) say("PLURAL-CATS-RU", JSON.stringify(res.f));
  } catch (e) { say("PLURAL-CATS-RU-RUN", String(e.message).slice(0, 200)); }
  ZGH.forEach(function (L) {
    var EN = EN2;
    if (c.checkPluralEntry("t", "k", L, { one: "{count} umḍan", other: "{count} n imḍanen" }, EN).length) say("PLURAL-ENTRY-UNEXPECTED", L);
    if (!c.checkPluralEntry("t", "k", L, { other: "{count} n imḍanen" }, EN).some(function (f) { return /^PLURAL-SHAPE /.test(f); })) say("PLURAL-ENTRY-SHAPE-MISSED", L);
    if (!c.checkPluralEntry("t", "k", L, { one: "umḍan", other: "{count} n imḍanen" }, EN).length) { /* one may drop {count}: no finding required */ }
    if (c.cjkFindings("t.k", L, "1 万", "1 step").length) say("CJK-APPLIES", L);
  });
  if (!c.digitParityFindings("t.k", LATN, "16,8 mlyun", "16.8 million").some(function (f) { return /^DIGIT-PARITY /.test(f); })) say("DIGIT-PARITY-MISSED", LATN);
  if (!c.digitParityFindings("t.k", TFNG, "1.000 " + TF("n isurifn"), "1,000 steps").some(function (f) { return /^DIGIT-PARITY /.test(f); })) say("DIGIT-PARITY-MISSED", TFNG);
  if (c.digitParityFindings("t.k", TFNG, "16.8 " + TF("mlyun"), "16.8 million").length) say("DIGIT-PARITY-UNEXPECTED", TFNG);
  if (c.charFindings("t.k", LATN, "Ḍ ḍ ɛ ɣ «x»").length) say("CHAR-UNEXPECTED");
  if (!c.charFindings("t.k", LATN, "ad" + U(0x323) + "u").some(function (f) { return /^NOT-NFC /.test(f); })) say("NOT-NFC-MISSED");
  [
    [["t.k", TFNG, TF("Sti yan umḍan amnzu"), "Pick a prime"], []],
    [["t.k", TFNG, TF("Sti") + " prime", "Pick a prime"], ["SCRIPT-LATIN"]],
    [["t.k", TFNG, TF("Tasarut n") + " Alice: RSA, gcd, mod, n", "Alice’s key: RSA, gcd, mod, n"], []],
    [["t.k", TFNG, TF("tamazi") + U(0x263) + MAP.t, "Tamazight"], ["SCRIPT-FOREIGN"]],
    [["t.k", TFNG, U(0x2D52) + MAP.a, "pa"], ["SCRIPT-FOREIGN"]],
    [["t.k", TFNG, TF("tasarut") + "RSA", "RSA key"], ["SCRIPT-MIXED"]],
    [["t.k", TFNG, "RSA", "Public key RSA"], ["SCRIPT-MISSING"]],
    [["t.k", "ru", "ключ " + MAP.t, "key"], ["SCRIPT-FOREIGN"]],
    [["t.k", LATN, "Tasarut tamatayt", "Public key"], []],
    [["t.k", TFNG, TF("tasarut ag" + LAB_L + "mar"), "key"], []],
    [["t.k", TFNG, TF("Sit ɣf") + " Enter " + TF("nɣ") + " Space ({n} ms)", "press Enter or Space ({n} ms)"], []]
  ].forEach(function (t) {
    var got = c.scriptFindings.apply(null, t[0]);
    if (!t[1].length && got.length) say("SCRIPT-UNEXPECTED", JSON.stringify(t[0][2]), JSON.stringify(got));
    t[1].forEach(function (code) { if (!got.some(function (f) { return f.indexOf(code + " ") === 0; })) say("SCRIPT-MISSED", code, JSON.stringify(t[0][2]), JSON.stringify(got)); });
  });
  runCases({ latin: c.zghLatinFindings, translit: c.zghTransliterationFindings, transliterate: c.zghTransliterate });
  // The checker and this gate agree on every shipped value.
  var cat = loadAll(), agreeBad = 0;
  Object.keys(cat).forEach(function (ns) {
    var d = cat[ns];
    if (!d[LATN] || !d[TFNG]) return;
    Object.keys(d.en).forEach(function (k) {
      var cats = typeof d.en[k] === "object" ? ["one", "other"] : [""];
      cats.forEach(function (ct) {
        var g = function (L) { var v = d[L] && d[L][k]; return ct ? v && v[ct] : v; };
        var ev = ct ? (typeof d.en[k][ct] === "string" ? d.en[k][ct] : d.en[k].other) : d.en[k];
        var id = ns + "." + k + (ct ? "." + ct : "");
        var a = JSON.stringify(translitFindings(id, TFNG, g(TFNG), g(LATN), ev).concat(latinFindings(id, LATN, g(LATN), ev)).map(function (s) { return s.split(" ")[0]; }));
        var b = JSON.stringify(c.zghTransliterationFindings(id, TFNG, g(TFNG), g(LATN), ev).concat(c.zghLatinFindings(id, LATN, g(LATN), ev)).map(function (s) { return s.split(" ")[0]; }));
        if (a !== b && agreeBad++ < 5) say("DISAGREE", id, a, b);
      });
    });
  });
  finish("CHECKER-ZGH");
}

/* ---------- block text helpers (derive) ---------- */

function scanLiteral(text, i) {
  var q = text[i], j = i + 1;
  while (j < text.length && text[j] !== q) { if (text[j] === "\\") j++; j++; }
  return j + 1;
}
function matchBrace(text, open) {
  var depth = 0;
  for (var i = open; i < text.length; i++) {
    var ch = text[i];
    if (ch === "'" || ch === "\"") { i = scanLiteral(text, i) - 1; continue; }
    if (ch === "{") depth++;
    else if (ch === "}") { depth--; if (depth === 0) return i + 1; }
  }
  return -1;
}
function findLangBlock(text, from, to, code) {
  var re = new RegExp("(['\"])" + code + "\\1\\s*:\\s*\\{", "g");
  re.lastIndex = from;
  var m = re.exec(text);
  if (!m || m.index >= to) return null;
  var open = text.indexOf("{", m.index + code.length + 2);
  var end = matchBrace(text, open);
  return { start: m.index, open: open, end: end };
}
function quoteSingle(v) { return "'" + String(v).replace(/\\/g, "\\\\").replace(/'/g, "\\'").replace(/\r/g, "\\r").replace(/\n/g, "\\n") + "'"; }

function deriveMode(args) {
  var force = args.indexOf("--force") !== -1;
  var files = args.filter(function (a) { return a !== "--force"; });
  if (!files.length) say("NO-FILES");
  var derived = 0, kept = 0, notes = 0;
  files.forEach(function (f) {
    var p = I18N_DIR + f;
    var text = read(p);
    var dicts = loadDicts(text);
    Object.keys(dicts).forEach(function (ns) {
      var d = dicts[ns];
      if (!d[LATN]) { say("NO-ZGH-LATN", f, ns); return; }
      var reg = text.indexOf("NT.i18n.register('" + ns + "'");
      if (reg < 0) { say("REGISTER-NOT-FOUND", f, ns); return; }
      var regOpen = text.indexOf("{", reg);
      var regEnd = matchBrace(text, regOpen);
      var lb = findLangBlock(text, regOpen, regEnd, LATN);
      if (!lb || lb.end < 0) { say("ZGH-LATN-BLOCK-NOT-FOUND", f, ns); return; }
      var seq = [];
      Object.keys(d[LATN]).forEach(function (k) {
        var v = d[LATN][k];
        if (v && typeof v === "object") Object.keys(v).forEach(function (ct) { seq.push({ k: k, ct: ct, v: v[ct] }); });
        else seq.push({ k: k, ct: "", v: v });
      });
      var oldT = d[TFNG] || {};
      var block = text.slice(lb.start, lb.end);
      var outB = "", pos = 0, n = 0, first = true;
      for (var i = 0; i < block.length; i++) {
        var ch = block[i];
        if (ch !== "'" && ch !== "\"") continue;
        var e = scanLiteral(block, i);
        var lit = block.slice(i, e);
        var rest = block.slice(e).replace(/^\s+/, "");
        var replacement = lit;
        if (rest[0] === ":") {
          if (first) { replacement = quoteSingle(TFNG); first = false; }
        } else {
          var val = vm.runInNewContext("(" + lit + ")");
          var it = seq[n++];
          if (!it || it.v !== val) { say("DERIVE-MISMATCH", f, ns, it ? it.k : "(end)", JSON.stringify(val).slice(0, 60)); return; }
          var en = it.ct ? (typeof d.en[it.k] === "object" && typeof d.en[it.k][it.ct] === "string" ? d.en[it.k][it.ct] : d.en[it.k].other) : d.en[it.k];
          var ov = it.ct ? (oldT[it.k] && oldT[it.k][it.ct]) : oldT[it.k];
          var id = ns + "." + it.k + (it.ct ? "." + it.ct : "");
          var tv;
          if (!force && typeof ov === "string" && !translitFindings(id, TFNG, ov, it.v, en).some(function (s) { return /^ZGH-TRANSLIT /.test(s); })) { tv = ov; kept++; }
          else {
            tv = deriveValue(it.v, en, function (s) { notes++; console.log(s + " " + id + " " + JSON.stringify(it.v).slice(0, 120)); });
            derived++;
          }
          replacement = quoteSingle(tv);
        }
        outB += block.slice(pos, i) + replacement;
        pos = e;
        i = e - 1;
      }
      outB += block.slice(pos);
      if (n !== seq.length) { say("DERIVE-COUNT", f, ns, n, seq.length); return; }
      var tb = findLangBlock(text, lb.end, regEnd, TFNG);
      if (tb) text = text.slice(0, tb.start) + outB + text.slice(tb.end);
      else {
        var lineStart = text.lastIndexOf("\n", lb.start) + 1;
        var indent = text.slice(lineStart, lb.start);
        text = text.slice(0, lb.end) + ",\n" + indent + outB + text.slice(lb.end);
      }
    });
    if (bad) return;
    fs.writeFileSync(p, text);
    var check = loadDicts(text);
    Object.keys(check).forEach(function (ns) {
      if (JSON.stringify(check[ns][LATN]) !== JSON.stringify(dicts[ns][LATN])) say("DERIVE-CHANGED-LATN", f, ns);
      var langs = Object.keys(check[ns]);
      if (langs.slice(-2).join(",") !== ZGH.join(",")) say("DERIVE-ORDER", f, ns, langs.slice(-3).join(","));
    });
  });
  console.log("DERIVE derived=" + derived + " kept=" + kept + " notes=" + notes);
  finish("DERIVE");
}

/* ---------- translit (alignment + notation only) ---------- */

function translitMode(files) {
  if (!files.length) files = dataFiles();
  var vals = 0;
  files.forEach(function (f) {
    var dicts = loadDicts(read(I18N_DIR + f));
    Object.keys(dicts).forEach(function (ns) {
      var d = dicts[ns];
      if (!d[LATN] || !d[TFNG]) { say("NO-ZGH", f, ns); return; }
      Object.keys(d.en).forEach(function (k) {
        var cats = typeof d.en[k] === "object" ? ["one", "other"] : [""];
        cats.forEach(function (ct) {
          var lv = ct ? d[LATN][k] && d[LATN][k][ct] : d[LATN][k];
          var tv = ct ? d[TFNG][k] && d[TFNG][k][ct] : d[TFNG][k];
          var ev = ct ? (typeof d.en[k][ct] === "string" ? d.en[k][ct] : d.en[k].other) : d.en[k];
          vals++;
          translitFindings(ns + "." + k + (ct ? "." + ct : ""), TFNG, tv, lv, ev).forEach(function (s) { say(s); });
        });
      });
    });
  });
  console.log("TRANSLIT values=" + vals);
  finish("TRANSLIT");
}

/* ---------- batch ---------- */

var OWN = W("d|n|s|g|i|ɣ|ad|ar|ur|ula|maca|acku|mk|ma|nɣ|gr|sg|ɣf|xf|zg|bac|nna|lli|yan|yat|kra|akk|akkʷ|ɣas|ard|mas|iga|igan|illa|ilan|ilin|is|mad|mani|manik|ɣr|zund|awd|wala|ka|rad|mi|ddu|nnig|daɣ|kullu|kud|t|tn|as|asn|ass|nttat|ntta|dat|sul|ḥtta|f");
var EN_WORDS = "the|and|with|this|that|then|than|when|which|each|are|was|were|has|have|key|keys|table|tree|start|clear|result|first|next|last|if|use|add|find|set|size|mark|check|search|secret|message|shared|digit|digits|list|grid|cell|cells|instant|reset|here|there|they|she|her|its|it|step|steps|number|numbers|prime|primes|value|values|click|press|enter|choose|show|hide|stop|random|public|private|from|into|your|for|of|to|on|by|or|not|run|play|pause|done|found|time";
var ENRE = new RegExp("(?<![\\p{L}\\p{N}_.])(?:" + EN_WORDS + ")(?![\\p{L}\\p{N}_])", "giu");
// D-AVOID: Kabyle-only forms (Algerian Latin-script usage) where Standard Moroccan Tamazight differs:
// yiwen/yiwet (one: yan/yat), deg (in: g), fren (choose: sti), acu (what: mad), and the Kabyle schwa
// spellings ɣef/ɣer (IRCAM: ɣf/ɣr).
var AVOID = ["yiwen", "yiwet", "deg", "fren", "acu", "ɣef", "ɣer"];
var LATIN_LANGS = ["nl", "de", "fr", "es", "it", "pl", "pt-BR", "pt-PT", "sv", "nb", "ro", "hu", "lv", "sq", "sw", "id"];

function loadChecker() { try { return require(CHECK_PATH); } catch (e) { say("CHECKER-LOAD", String(e.message).slice(0, 200)); return {}; } }
function formOf(v, ct) { return v == null ? undefined : (typeof v === "object" ? (ct in v ? v[ct] : v.other) : v); }

function batchMode(files) {
  var C = loadChecker();
  var hasZghExports = typeof C.zghTransliterationFindings === "function" && typeof C.zghLatinFindings === "function";
  if (!hasZghExports) say("CHECKER-EXPORTS-MISSING", "zghTransliterationFindings/zghLatinFindings (Task 1 step C)");
  if (!files.length) say("NO-FILES");
  var keepRe = new RegExp("(?<![\\p{L}\\p{N}_])(?:" + KEEP_LIST.join("|") + ")(?![\\p{L}\\p{N}_])", "gu");
  // Gate fix (261008-e2j Task 4): "Has" is the D-NAMES adaptation of Hasse (Hasse bound), not the English verb has.
  var hasseRe = /(?<![\p{L}\p{N}_])Has(?![\p{L}\p{N}_])/gu;
  var strip = function (s) { return stripPh(s).replace(keepRe, " ").replace(hasseRe, " "); };
  var site = loadDicts(read(I18N_DIR + "site.js")).site;
  var navTitle = {};
  if (site && site[LATN]) Object.keys(site.en).forEach(function (k) {
    if (/^nav\./.test(k) && (String(site.en[k]).match(/\p{L}{2,}/gu) || []).length >= 2) navTitle[site.en[k]] = site[LATN][k];
  });
  var st = { n4: 0, own: 0, prose: 0, shared: {} };
  files.forEach(function (f) {
    var raw = read(I18N_DIR + f);
    var header = raw.split("(function")[0];
    if (/\btwenty-five\b/i.test(raw)) say("STALE-COUNT", f);
    if (!/\btwenty-seven\b/i.test(header)) say("COUNT-MISSING", f);
    var o = loadDicts(showBase(I18N_DIR + f)), n = loadDicts(raw);
    Object.keys(o).forEach(function (ns) {
      Object.keys(o[ns]).forEach(function (l) {
        if (JSON.stringify(o[ns][l]) !== JSON.stringify(n[ns] && n[ns][l])) say("DICT-CHANGED", f, ns, l);
      });
      if (!n[ns]) { say("NS-MISSING", f, ns); return; }
      var langs = Object.keys(n[ns]);
      if (langs.slice(-2).join(",") !== ZGH.join(",")) say("ZGH-NOT-LAST", f, ns, langs.slice(-3).join(","));
      langs.forEach(function (l) { if (!(l in o[ns]) && ZGH.indexOf(l) === -1) say("DICT-EXTRA", f, ns, l); });
      var en = n[ns].en;
      var ok = true;
      ZGH.forEach(function (L) {
        if (!n[ns][L]) { say("NO-" + L.toUpperCase(), f, ns); ok = false; return; }
        if (Object.keys(n[ns][L]).join("|") !== Object.keys(en).join("|")) say("KEY-ORDER", f, ns, L);
      });
      if (!ok) return;
      var dl = n[ns][LATN], dt = n[ns][TFNG];
      Object.keys(en).forEach(function (k) {
        var isPlural = en[k] && typeof en[k] === "object";
        ZGH.forEach(function (L) {
          var v = n[ns][L][k];
          if (isPlural && !(v && typeof v === "object" && Object.keys(v).sort().join(",") === "one,other")) say("PLURAL-SHAPE", f, ns, k, L, "expected { one, other }");
          if (!isPlural && typeof v !== "string") say("PLURAL-SHAPE", f, ns, k, L, "expected a string");
        });
        (isPlural ? ["one", "other"] : [""]).forEach(function (ct) {
          var lv = ct ? dl[k] && dl[k][ct] : dl[k];
          var tv = ct ? dt[k] && dt[k][ct] : dt[k];
          if (typeof lv !== "string" || typeof tv !== "string") return;
          var ev = String(ct ? (typeof en[k][ct] === "string" ? en[k][ct] : en[k].other) : en[k]);
          var full = ns + "." + k;
          var id = full + (ct ? "." + ct : "");
          [[LATN, lv], [TFNG, tv]].forEach(function (p) {
            if (INVISIBLE_RE.test(p[1])) say("BIDI-MARK", id, p[0]);
            if (/["“”‘’']/.test(p[1])) say("QUOTE-STYLE", id, p[0], "quote with «…» (D-PUNCT)");
            if (p[1] === ev && C.isProse && C.isProse(ev) && FORMULA_SAME.indexOf(full) === -1) say("SAME-AS-EN", id, p[0], JSON.stringify(ev).slice(0, 80));
          });
          latinFindings(id, LATN, lv, ev).forEach(function (s) { say(s); });
          tfngLetterFindings(id + "." + TFNG, tv).forEach(function (s) { say(s); });
          translitFindings(id, TFNG, tv, lv, ev).forEach(function (s) { say(s); });
          var hits = {};
          (strip(lv).match(ENRE) || []).forEach(function (w) { hits[w.toLowerCase()] = true; });
          Object.keys(hits).forEach(function (w) {
            var re = W(w);
            var kept = LATIN_LANGS.filter(function (m) { return re.test(strip(formOf(n[ns][m] && n[ns][m][k], ct || "other") || "")); }).length;
            if (kept < 7) say("ENGLISH-WORD", id, w);
          });
          AVOID.forEach(function (w) { if (W(w).test(lv)) say("AVOID", id, JSON.stringify(w), "(D-AVOID)"); });
          Object.keys(EPONYMS).forEach(function (eng) {
            if (Wcs(eng).test(lv)) say("EPONYM-SPELLING", id, JSON.stringify(eng), "write", JSON.stringify(EPONYMS[eng]), "(D-NAMES)");
          });
          KEY_NAMES.forEach(function (kn) {
            if (Wcs(kn).test(lv) && KEY_NAME_KEYS.indexOf(full) === -1) say("KEY-NAME", id, kn, "(key-cap names only in " + KEY_NAME_KEYS.join(",") + ")");
          });
          if (ns !== "site" && Object.prototype.hasOwnProperty.call(navTitle, ev) && lv !== navTitle[ev]) say("NAV-TITLE", id, JSON.stringify(lv), "want", JSON.stringify(navTitle[ev]));
          if ((ev.match(/\p{L}{2,}/gu) || []).length >= 4) { st.n4++; if (OWN.test(lv)) st.own++; }
          if (C.isProse && C.isProse(lv)) {
            st.prose++;
            Object.keys(n[ns]).forEach(function (m) {
              if (ZGH.indexOf(m) !== -1 || m === "en" || lv === ev) return;
              if (lv === String(formOf(n[ns][m] && n[ns][m][k], ct || "other"))) st.shared[m] = (st.shared[m] || 0) + 1;
            });
          }
          if (hasZghExports) {
            var cf = C.zghLatinFindings(id, LATN, lv, ev)
              .concat(C.zghTransliterationFindings(id, TFNG, tv, lv, ev))
              .concat(C.scriptFindings(id, TFNG, tv, ev))
              .concat(C.digitParityFindings(id, LATN, lv, ev))
              .concat(C.digitParityFindings(id, TFNG, tv, ev));
            cf.forEach(function (s) { say("CHECKER", s); });
          }
        });
      });
    });
  });
  if (st.n4 && st.own < 0.7 * st.n4) say("OWN-WORDS", st.own + "/" + st.n4);
  Object.keys(st.shared).forEach(function (m) { if (st.shared[m] > Math.max(3, 0.05 * st.prose)) say("SHARED-VALUES", m, st.shared[m] + "/" + st.prose); });
  console.log("STATS zgh-Latn own=" + st.own + "/" + st.n4 + " prose=" + st.prose + " maxShared=" + JSON.stringify(Object.keys(st.shared).map(function (m) { return [m, st.shared[m]]; }).sort(function (x, y) { return y[1] - x[1]; }).slice(0, 2)));
  finish("ZGH-BATCH");
}

/* ---------- glossary ---------- */

function glossaryMode(args) {
  var skipSupp = args.indexOf("--no-supp") !== -1;
  var c = loadDicts(read(I18N_DIR + "site.js"));
  var g = read(GLOSSARY);
  function sect(a, b) {
    var parts = g.split(a);
    if (parts.length < 2) { say("SECTION-MISSING", String(a)); return ""; }
    return b ? parts[1].split(b)[0] : parts[1];
  }
  function rowsOf(s) {
    return s.split("\n").filter(function (l) { return /^\|/.test(l); }).map(function (l) { return l.split("|").slice(1, -1).map(function (x) { return x.trim(); }); });
  }
  function col(header, name) { for (var i = header.length - 1; i > 0; i--) if (header[i] === name) return i; return -1; }
  function strip0(s) { return String(s).replace(/^[^\p{L}\p{N}]+/u, ""); }
  function cmp(name, s, get, want) {
    var rows = rowsOf(s);
    if (!rows.length) { say("NO-TABLE", name); return; }
    var cl = col(rows[0], LATN), ct = col(rows[0], TFNG);
    if (cl < 0 || ct < 0) { say("NO-ZGH-COLUMNS", name); return; }
    if (ct !== cl + 1) say("COLUMN-ORDER", name, "zgh-Tfng must follow zgh-Latn");
    var cnt = 0;
    rows.slice(2).forEach(function (r) {
      var vl = get(r[0], LATN), vt = get(r[0], TFNG);
      if (vl === undefined) return;
      cnt++;
      if (strip0(r[cl]) !== strip0(vl)) say("GLOSSARY-DRIFT", name, r[0], LATN, JSON.stringify(r[cl]), JSON.stringify(vl));
      if (strip0(r[ct]) !== strip0(vt)) say("GLOSSARY-DRIFT", name, r[0], TFNG, JSON.stringify(r[ct]), JSON.stringify(vt));
    });
    if (cnt !== want) say("ROWS", name, cnt, "want", want);
  }
  function complete(name, s) {
    var rows = rowsOf(s);
    if (!rows.length) { say("NO-TABLE", name); return; }
    var cl = col(rows[0], LATN), ct = col(rows[0], TFNG);
    if (cl < 0 || ct < 0) { say("NO-ZGH-COLUMNS", name); return; }
    if (ct !== cl + 1) say("COLUMN-ORDER", name);
    rows.slice(2).forEach(function (r) {
      if (!r[cl] || !r[ct]) { say("CELL-EMPTY", name, r[0]); return; }
      translitFindings(name + "." + r[0], TFNG, r[ct].replace(/`\[ASSUMED\]`|\[ASSUMED\]|`\[CITED[^\]]*\]`|\[CITED[^\]]*\]/g, ""), r[cl].replace(/`\[ASSUMED\]`|\[ASSUMED\]|`\[CITED[^\]]*\]`|\[CITED[^\]]*\]/g, ""), "")
        .filter(function (x) { return /^ZGH-TRANSLIT /.test(x); }).forEach(function (x) { say("GLOSSARY-" + x); });
      latinFindings(name + "." + r[0], LATN, r[cl].replace(/`\[ASSUMED\]`|\[ASSUMED\]|`\[CITED[^\]]*\]`|\[CITED[^\]]*\]/g, ""), r.slice(1, cl).join(" ")).forEach(function (x) { say("GLOSSARY-" + x); });
    });
    return rows;
  }
  var sb = sect(/^## \(b\)/m, /^## \(c\)/m);
  cmp("b", sb, function (k, L) { return c.site[L] && c.site[L]["nav." + k]; }, 16);
  var sf = sect(/^## \(f\)/m, null);
  cmp("f", sf, function (k, L) { var m = /^common\.([A-Za-z0-9]+)$/.exec(k); return m && c.common[L] ? c.common[L][m[1]] : undefined; }, 8);
  var sc = sect(/^## \(c\)/m, /^### /m), sd = sect(/^## \(d\)/m, /^## \(e\)/m), se = sect(/^## \(e\)/m, /^## \(f\)/m);
  complete("c", sc);
  complete("d", sd);
  [["b", sb], ["c", sc], ["d", sd], ["f", sf]].forEach(function (p) { if (p[1].indexOf(TASK) === -1) say("NO-TASK-ID", "(" + p[0] + ")"); });
  if (!/^\| Standard Moroccan Tamazight \(zgh-Latn, zgh-Tfng\) `\[ASSUMED\]` \|/m.test(g)) say("TONE-ROW-MISSING");
  if (g.indexOf("**Standard Moroccan Tamazight (zgh-Latn, zgh-Tfng) `[ASSUMED]`:**") === -1) say("ENTRY-MISSING");
  if (/\btwenty-five\b/i.test(g)) say("STALE-COUNT", GLOSSARY);
  if ((se.match(/\btwenty-seven\b/gi) || []).length < 2) say("E-COUNT", "(e) states twenty-seven twice");
  if (se.indexOf("Standard Moroccan Tamazight (added 2026-10-08 by quick task " + TASK + ")") === -1) say("E-SENTENCE-MISSING");
  if (!skipSupp) {
    var supRe = /^### Standard Moroccan Tamazight supplementary terms[^\n]*\n([\s\S]*?)(?=^#{2,3} )/m;
    var m = supRe.exec(g);
    if (!m) say("SUPPLEMENTARY-TABLE-MISSING");
    else {
      var rows = rowsOf(m[1]);
      var cat = loadAll();
      var hdr = rows[0] || [];
      var cE = 0, cl = hdr.indexOf(LATN), ct = hdr.indexOf(TFNG), cn = hdr.indexOf("Namespaces");
      if (cl < 0 || ct < 0 || cn < 0) say("SUPP-COLUMNS", "want English | zgh-Latn | zgh-Tfng | Namespaces | Confidence", JSON.stringify(hdr));
      else rows.slice(2).forEach(function (r) {
        translitFindings("supp." + r[cE], TFNG, r[ct], r[cl], "").filter(function (x) { return /^ZGH-TRANSLIT /.test(x); }).forEach(function (x) { say("SUPP-" + x); });
        r[cn].split(/,\s*/).filter(Boolean).forEach(function (ns) {
          if (!cat[ns] || !cat[ns][LATN]) { say("SUPP-NS", r[cE], ns); return; }
          var blob = JSON.stringify(cat[ns][LATN]).toLowerCase();
          if (blob.indexOf(r[cl].toLowerCase()) === -1) say("SUPP-NOT-FOUND", JSON.stringify(r[cl]), "in", ns);
        });
      });
      if (rows.length < 12) say("SUPP-SHORT", rows.length - 2, "rows");
    }
  }
  finish("GLOSSARY-ZGH");
}

/* ---------- pagecode ---------- */

function pagecodeMode() {
  var TF_AUTONYM = TF("Tamaziɣt");
  var re = new RegExp("^([ \\t]*)<option value=\"id\" lang=\"id\">Bahasa Indonesia<\\/option>\\n([ \\t]*)<option value=\"zgh-Latn\" lang=\"zgh-Latn\">Tamaziɣt<\\/option>\\n([ \\t]*)<option value=\"zgh-Tfng\" lang=\"zgh-Tfng\">" + TF_AUTONYM + "<\\/option>\\n", "m");
  var files = git(["ls-files", "*.html", "assets"]).trim().split("\n").filter(function (f) {
    return !/^assets\/i18n\//.test(f) && f !== "assets/nt-i18n.js";
  });
  var pages = 0;
  files.forEach(function (f) {
    var o = showBase(f), n = read(f);
    var stripped = n;
    if (/\.html$/.test(f)) {
      pages++;
      var m = re.exec(n);
      if (!m) { say("SWITCHER-LINES-MISSING", f); return; }
      if (m[1] !== m[2] || m[1] !== m[3]) say("SWITCHER-INDENT", f);
      stripped = n.replace(re, function (all, i1) { return i1 + "<option value=\"id\" lang=\"id\">Bahasa Indonesia</option>\n"; });
    }
    if (stripped !== o) say("CODE-CHANGED", f);
  });
  console.log("PAGE-CODE files=" + files.length + " pages=" + pages);
  finish("PAGE-CODE");
}

/* ---------- config ---------- */

function configMode() {
  fs.readdirSync(CONFIG_DIR).forEach(function (f) {
    if (read(CONFIG_DIR + f) !== showBase(CONFIG_DIR + f)) say("CONFIG-CHANGED", f, "(no zgh value may equal English prose, so no reason text changes)");
  });
  finish("CONFIG");
}

/* ---------- unify ---------- */

function unifyMode(args) {
  var allow = {};
  for (var i = 0; i < args.length; i++) if (args[i] === "--allow") String(args[++i]).split(",").forEach(function (k) { allow[k] = true; });
  FORMULA_SAME.forEach(function (k) { allow[k] = true; });
  var cat = loadAll();
  var groups = {};
  Object.keys(cat).forEach(function (ns) {
    Object.keys(cat[ns].en).forEach(function (k) {
      var v = cat[ns].en[k];
      if (typeof v !== "string") return;
      (groups[v] = groups[v] || []).push(ns + "." + k);
    });
  });
  var divergent = 0, notes = 0;
  Object.keys(groups).forEach(function (en) {
    var keys = groups[en].filter(function (id) { return !allow[id]; });
    if (keys.length < 2) return;
    var multi = (en.match(/\p{L}{2,}/gu) || []).length >= 2;
    var seen = {};
    keys.forEach(function (id) {
      var dot = id.indexOf(".");
      var d = cat[id.slice(0, dot)][LATN];
      var v = d && d[id.slice(dot + 1)];
      if (v === undefined) return;
      (seen[v] = seen[v] || []).push(id);
    });
    var renders = Object.keys(seen);
    if (renders.length < 2) return;
    var line = JSON.stringify(en).slice(0, 60) + " -> " + renders.map(function (r) { return JSON.stringify(r) + " [" + seen[r].join(" ") + "]"; }).join(" | ");
    if (multi) { divergent++; say("DIVERGENT", line); }
    else { notes++; console.log("NOTE", line); }
  });
  console.log("UNIFY divergent=" + divergent + " notes=" + notes);
  finish("UNIFY");
}

/* ---------- docs ---------- */

var DOCS = ["CLAUDE.md", ".claude/CLAUDE.md", ".planning/PROJECT.md", ".planning/REQUIREMENTS.md", ".planning/codebase/STACK.md",
  ".planning/codebase/CONVENTIONS.md", ".planning/codebase/ARCHITECTURE.md", ".planning/codebase/CONCERNS.md",
  ".planning/codebase/STRUCTURE.md", ".planning/codebase/TESTING.md"];

function docsMode() {
  var counted = DOCS.concat([GLOSSARY]).concat(dataFiles().map(function (f) { return I18N_DIR + f; }));
  counted.forEach(function (f) { if (/\btwenty-five\b/i.test(read(f))) say("STALE-COUNT", f); });
  var TF_AUTONYM = TF("Tamaziɣt");
  var rules = [
    ["Indonesian", /Tamazight/, "Tamazight named wherever Indonesian is"],
    ["region-tagged", /script-tagged/, "the script-tagged zgh-Latn/zgh-Tfng code shape next to region-tagged pt-BR/pt-PT"],
    ["`in`", /`tzm`/, "the zgh/tzm/ber detection rule wherever the legacy in rule is"],
    ["`in`", /`ber`/, "the zgh/tzm/ber detection rule wherever the legacy in rule is"],
    ["Intl.PluralRules", /no zgh data/, "the engine-fixed Tamazight plural rule (pinned phrase: no zgh data)"],
    ["DIGIT-PARITY", /ZGH-TRANSLIT/, "the ZGH-TRANSLIT / ZGH-NOTATION findings wherever the finding list is"],
    ["DIGIT-PARITY", /ZGH-NOTATION/, "the ZGH-TRANSLIT / ZGH-NOTATION findings wherever the finding list is"],
    ["Devanagari", /Tifinagh/, "Tifinagh named wherever Devanagari is"],
    ["left-to-right", /Tamazight/, "Tamazight among the left-to-right languages"],
    ["SCRIPT_RULES", /zgh-Tfng/, "the zgh-Tfng script rule"],
    ["Bahasa Indonesia", /Tamaziɣt/, "the Latin autonym"],
    ["Bahasa Indonesia", new RegExp(TF_AUTONYM), "the Tifinagh autonym"]
  ];
  DOCS.forEach(function (f) {
    var o = showBase(f), n = read(f);
    if (/\btwenty-five\b/i.test(o) && !/\btwenty-seven\b/i.test(n)) say("NO-COUNT", f);
    var sixteen = function (s) { return (s.match(/\b(?:16|sixteen)\b/gi) || []).length; };
    if (sixteen(o) !== sixteen(n)) say("SIXTEEN-CHANGED", f, sixteen(o), "->", sixteen(n));
    (n.match(/ko(?:, |\/)id(?![\w-]).{0,24}/g) || []).forEach(function (m) {
      if (!/^ko(?:, id, zgh-Latn, zgh-Tfng|\/id\/zgh-Latn\/zgh-Tfng)/.test(m)) say("LIST-WITHOUT-ZGH", f, JSON.stringify(m));
    });
    rules.forEach(function (r) { if (o.indexOf(r[0]) !== -1 && !r[1].test(n)) say("MISSING-ZGH-RULE", f, JSON.stringify(r[0]), "->", r[2]); });
  });
  [".planning/PROJECT.md", ".planning/REQUIREMENTS.md"].forEach(function (f) { if (read(f).indexOf(TASK) === -1) say("NO-TASK-ID", f); });
  finish("DOCS-ZGH");
}

/* ---------- sweep ---------- */

var KNOWN_SWITCH_LINES = {
  "factor-tree": /^I18N-BROWSER factor-tree switch NEW-ERRORS classic-n-abc [A-Za-z-]+ \[.*MISSING-SELECTOR #numInput/,
  "venn-diagram": /^I18N-BROWSER venn-diagram switch DIFF at clear [A-Za-z-]+: html differs .*id="lcm-step"/
};
function sleepMs(ms) { Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms); }
function pidAlive(pid) { try { process.kill(pid, 0); return true; } catch (e) { return e.code === "EPERM"; } }
function acquireSlot() {
  var gitDir = path.resolve(git(["rev-parse", "--git-dir"]).trim());
  for (;;) {
    for (var i = 1; i <= 2; i++) {
      var p = path.join(gitDir, "cjk-gate-sweep-slot-" + i + ".lock");
      try { fs.writeFileSync(p, String(process.pid), { flag: "wx" }); return p; } catch (e) {
        var holder = 0;
        try { holder = parseInt(fs.readFileSync(p, "utf8"), 10); } catch (e2) { holder = 0; }
        if (!holder || !pidAlive(holder)) { try { fs.unlinkSync(p); } catch (e3) { /* raced */ } }
      }
    }
    sleepMs(5000);
  }
}
function sweepPage(page, nonEn) {
  var r = cp.spawnSync("node", [".planning/phases/06-multi-language-support/i18n-browser.js", page, "--mode", "switch,layout"],
    { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
  var out = (r.stdout || "") + (r.stderr || "");
  var lines = out.split("\n").filter(Boolean);
  var slugLine = lines.filter(function (l) { return /^I18N-BROWSER [a-z0-9-]+ /.test(l); })[0] || "";
  var slug = (/^I18N-BROWSER ([a-z0-9-]+) /.exec(slugLine) || [])[1] || "?";
  var switchPass = new RegExp("^I18N-BROWSER " + slug + " switch PASS points=[0-9]+ langs=" + nonEn + "$");
  var layoutPass = new RegExp("^I18N-BROWSER " + slug + " layout PASS$");
  var known = KNOWN_SWITCH_LINES[slug];
  var gated = lines.filter(function (l) { return /^(I18N-BROWSER|LAYOUT-OVERFLOW|UNTRANSLATED)/.test(l); });
  var knownCount = known ? gated.filter(function (l) { return known.test(l); }).length : 0;
  var unexpected = gated.filter(function (l) { return !switchPass.test(l) && !layoutPass.test(l) && !(known && known.test(l)); });
  var hasSwitch = gated.some(function (l) { return switchPass.test(l); });
  var hasLayout = gated.some(function (l) { return layoutPass.test(l); });
  var ok = hasLayout && unexpected.length === 0 && (known ? (hasSwitch || knownCount === nonEn) : (hasSwitch && r.status === 0));
  return { ok: ok, slug: slug, lines: lines, status: r.status, knownCount: knownCount, unexpected: unexpected, hasLayout: hasLayout, hasSwitch: hasSwitch, known: !!known };
}
function sweepMode(pages) {
  var C = require(CHECK_PATH);
  var nonEn = C.LANG_CODES.length - 1;
  if (nonEn !== 26) say("LANG-COUNT", "expected 26 non-English languages, LANG_CODES gives", nonEn);
  if (!pages.length) say("NO-PAGES");
  var slot = acquireSlot();
  try {
    pages.forEach(function (page) {
      var t0 = Date.now();
      var res = sweepPage(page, nonEn);
      if (!res.ok && (res.unexpected.length || !res.hasLayout || (!res.known && !res.hasSwitch))) {
        console.log("SWEEP-RETRY " + page + " (first run: status " + res.status + ", unexpected " + res.unexpected.length + ")");
        res = sweepPage(page, nonEn);
      }
      res.lines.forEach(function (l) { console.log(l.slice(0, 200)); });
      console.log("SWEEP " + page + " " + (res.ok ? "OK" : "FAIL") + " known=" + res.knownCount + " " + Math.round((Date.now() - t0) / 1000) + "s");
      if (!res.ok) say("SWEEP-FAIL", page, "status=" + res.status, "layoutPass=" + res.hasLayout, "switchPass=" + res.hasSwitch, (res.known ? "knownLines=" + res.knownCount + "/" + nonEn : ""), res.unexpected.slice(0, 5).join(" | ").slice(0, 400));
    });
  } finally {
    try { fs.unlinkSync(slot); } catch (e) { /* ignore */ }
  }
  finish("SWEEP");
}

/* ---------- tf / glossary-fill ---------- */

// tfCell(latn, en): a glossary cell in Tifinagh — backtick spans and [ASSUMED]/[CITED ...] tags
// copied, the rest derived exactly like a dictionary value (variables judged against en).
function tfCell(latn, en) {
  return String(latn).split(/(`[^`]*`|\[(?:ASSUMED|CITED)[^\]]*\])/).map(function (part, i) {
    return i % 2 ? part : deriveValue(part, en || "", function () {});
  }).join("");
}
function tfMode(args) { args.forEach(function (a) { console.log(tfCell(a, "")); }); }
function glossaryFillMode() {
  var lines = read(GLOSSARY).split("\n"), changed = 0, tables = 0;
  var cellsOf = function (l) { return l.split("|").slice(1, -1).map(function (x) { return x.trim(); }); };
  for (var i = 0; i < lines.length; i++) {
    if (!/^\|/.test(lines[i]) || (i > 0 && /^\|/.test(lines[i - 1]))) continue;
    var hdr = cellsOf(lines[i]);
    var cl = hdr.lastIndexOf(LATN), ct = hdr.lastIndexOf(TFNG);
    if (cl < 0 || ct !== cl + 1) continue;
    tables++;
    var ce = -1;
    for (var h = 0; h < hdr.length; h++) if (/^en\b|^Term \(en\)$|^Proper noun$/.test(hdr[h])) { ce = h; break; }
    for (var j = i + 2; j < lines.length && /^\|/.test(lines[j]); j++) {
      var parts = lines[j].split("|");
      if (parts.length < ct + 3) continue;
      var want = " " + tfCell(parts[cl + 1].trim(), ce >= 0 ? parts[ce + 1].trim() : "") + " ";
      if (parts[ct + 1] !== want) { parts[ct + 1] = want; lines[j] = parts.join("|"); changed++; }
    }
  }
  fs.writeFileSync(GLOSSARY, lines.join("\n"));
  console.log("GLOSSARY-FILL tables=" + tables + " cells=" + changed);
  if (!tables) say("NO-ZGH-TABLES");
  finish("GLOSSARY-FILL");
}

/* ---------- dump / font ---------- */

function dumpMode(f) {
  var d = loadDicts(read(I18N_DIR + f));
  Object.keys(d).forEach(function (ns) {
    Object.keys(d[ns].en).forEach(function (k) {
      console.log(ns + "." + k);
      ["en", LATN, TFNG].forEach(function (L) { if (d[ns][L]) console.log("  " + L + " " + JSON.stringify(d[ns][L][k])); });
    });
  });
}
function fontMode() {
  var out = "";
  try { out = cp.execSync("fc-list 2>/dev/null | grep -i tifinagh || true", { encoding: "utf8" }); } catch (e) { out = ""; }
  console.log("FONT tifinagh=" + (out.trim() ? "present" : "absent") + (out.trim() ? " " + out.trim().split("\n")[0] : ""));
}

var mode = process.argv[2];
var rest = process.argv.slice(3);
if (mode === "selftest") selftestMode();
else if (mode === "engine") engineMode();
else if (mode === "checker") checkerMode();
else if (mode === "derive") deriveMode(rest);
else if (mode === "translit") translitMode(rest);
else if (mode === "batch") batchMode(rest);
else if (mode === "glossary") glossaryMode(rest);
else if (mode === "pagecode") pagecodeMode();
else if (mode === "config") configMode();
else if (mode === "unify") unifyMode(rest);
else if (mode === "docs") docsMode();
else if (mode === "sweep") sweepMode(rest);
else if (mode === "dump") dumpMode(rest[0]);
else if (mode === "font") fontMode();
else if (mode === "tf") tfMode(rest);
else if (mode === "glossary-fill") glossaryFillMode();
else { console.log("usage: zgh-gate.js selftest|engine|checker|derive [--force] <files...>|translit [files...]|batch <files...>|glossary [--no-supp]|pagecode|config|unify [--allow ...]|docs|sweep <pages...>|dump <file>|font|tf <text...>|glossary-fill"); process.exit(2); }
