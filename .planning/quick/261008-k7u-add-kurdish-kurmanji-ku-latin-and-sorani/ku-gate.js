#!/usr/bin/env node
/* ku-gate.js — plan-local gates for quick task 261008-k7u (Kurdish: Kurmanji `ku`, Latin
 * Hawar alphabet, left to right; Sorani `ckb`, Kurdish Arabic-based alphabet, right to left).
 * Dev-only, never shipped, never referenced by a page. Run from the repo root:
 *
 *   node .planning/quick/261008-k7u-add-kurdish-kurmanji-ku-latin-and-sorani/ku-gate.js <mode> [args...]
 *
 * Modes (each prints "<NAME> bad=<n>" and exits 1 when n > 0):
 *   selftest          SELFTEST: the gate's letter, orthography, punctuation rules and the
 *                     emit/extract round trip against CASES; every pinned TOOLS/COMMON/TERMS/
 *                     NAMES string passes the gate's own letter rules.
 *   engine            ENGINE-KU: assets/nt-i18n.js behaviour for both codes (exact
 *                     case-sensitive allow-list, Kurdish detection, ckb right to left, ku left
 *                     to right, plurals with real and absent Intl) plus ENGINE-CODE: only the
 *                     pinned edits differ from BASE.
 *   checker           CHECKER-KU: i18n-check.js tables, exports and findings for both codes,
 *                     including agreement with this gate on every shipped value.
 *   emit <draft.json> EMIT: writes the ku and ckb blocks of every namespace in the draft
 *                     (shape {"<ns>": {"ku": {...}, "ckb": {...}}}) into its data file, as the
 *                     last two language blocks, in en key order and the file's quoting style.
 *                     <LRI> <RLI> <FSI> <PDI> markers (and raw isolates) become escapes in
 *                     the source; any other invisible character is an error. Validates key set,
 *                     plural shape and placeholders first; writes nothing for a bad namespace.
 *   extract <file> [out.json]  the ku/ckb blocks of a data file as a draft (isolates as markers).
 *   batch <files...>  KU-BATCH over assets/i18n/<file>: existing languages unchanged from BASE,
 *                     ku then ckb last and complete, plural shape, header count word, and the
 *                     per-language rules (see batchMode), plus CHECKER (i18n-check.js's own
 *                     findings for every ku/ckb value).
 *   pinned            PINNED: site.js ku/ckb site and common values equal TOOLS and COMMON.
 *   terms             prints TOOLS, COMMON, TERMS and NAMES (the plan's pinned vocabulary).
 *   glossary-fill     adds the ku and ckb columns to 06-GLOSSARY.md (b), (c), (d), (f) and fills
 *                     them from site.js, TERMS and NAMES (existing cells untouched).
 *   glossary [--no-supp]  GLOSSARY-KU: tone rows, entries, columns, (e), supplementary table.
 *   pagecode          PAGE-CODE: page/asset code unchanged from BASE apart from the two option
 *                     lines per page, the RTL comment wording and the two ckb letter-spacing
 *                     selectors.
 *   config            CONFIG: i18n-config/*.json byte-identical to BASE.
 *   unify [--allow ns.key,...]  UNIFY: one rendering per repeated English value, per language.
 *   docs              DOCS-KU: the ten living docs at twenty-nine languages.
 *   sweep <pages...>  SWEEP: i18n-browser.js --mode switch,layout per page (langs=28), holding
 *                     one of the two machine-wide lock slots shared with cjk-gate.js, id-gate.js
 *                     and zgh-gate.js. Run in background.
 *   dump <file>       en, he, ar, ku, ckb per key (isolates shown as markers).
 *   font              which installed fonts cover the Sorani letters.
 *
 * BASE defaults to df172af (HEAD when this task was planned); override with KU_GATE_BASE=<rev>.
 * This source holds no raw invisible character and no backslash-u escape: special characters are
 * built from code points.
 */
"use strict";

var fs = require("fs");
var vm = require("vm");
var os = require("os");
var cp = require("child_process");
var path = require("path");

var BASE = process.env.KU_GATE_BASE || "df172af";
var TASK = "261008-k7u";
var KU = "ku", CKB = "ckb", KUR = [KU, CKB];
var I18N_DIR = "assets/i18n/";
var CHECK_PATH = path.resolve(process.cwd(), ".planning/phases/06-multi-language-support/i18n-check.js");
var GLOSSARY = ".planning/phases/06-multi-language-support/06-GLOSSARY.md";
var CONFIG_DIR = ".planning/phases/06-multi-language-support/i18n-config/";

function U(c) { return String.fromCodePoint(c); }
function hex4(c) { return ("0000" + c.toString(16)).slice(-4); }
var BS = String.fromCharCode(92);
var LRI = U(0x2066), RLI = U(0x2067), FSI = U(0x2068), PDI = U(0x2069);
var MARKERS = { "<LRI>": LRI, "<RLI>": RLI, "<FSI>": FSI, "<PDI>": PDI };
function rangeClass(ranges) { return "[" + ranges.map(function (r) { return U(r[0]) + "-" + U(r[1]); }).join("") + "]"; }
// Invisible format characters a value must never carry raw (isolates are escaped by emit).
var INVISIBLE_RANGES = [[0x200B, 0x200F], [0x2028, 0x202E], [0x2060, 0x206F], [0xFEFF, 0xFEFF]];
var INVISIBLE_RE = new RegExp(rangeClass(INVISIBLE_RANGES));
var INVISIBLE_G = new RegExp(rangeClass(INVISIBLE_RANGES), "g");
var ISO_OPEN_RE = new RegExp("[" + LRI + RLI + "]");
var ANY_ISO_RE = new RegExp(rangeClass([[0x2066, 0x2069]]));
var ARROW_G = new RegExp(rangeClass([[0x2190, 0x21FF]]), "g");
var PHI = U(0x3C6);

/* ---------- alphabets ---------- */

// Kurmanji (Hawar): the 26 ASCII letters plus precomposed ç ê î ş û (and capitals).
var KU_EXTRA = [0xE7, 0xEA, 0xEE, 0x15F, 0xFB, 0xC7, 0xCA, 0xCE, 0x15E, 0xDB].map(U).join("");
// Sorani: the 33 letters of the Kurdish Arabic-based alphabet (û is written with two waw).
var CKB_CPS = [0x626, 0x627, 0x628, 0x67E, 0x62A, 0x62C, 0x686, 0x62D, 0x62E, 0x62F, 0x631, 0x695, 0x632,
  0x698, 0x633, 0x634, 0x639, 0x63A, 0x641, 0x6A4, 0x642, 0x6A9, 0x6AF, 0x644, 0x6B5, 0x645, 0x646, 0x6BE,
  0x6D5, 0x648, 0x6C6, 0x6CC, 0x6CE];
var CKB_LETTERS = CKB_CPS.map(U).join("");
var CKB_OK = {};
CKB_CPS.forEach(function (c) { CKB_OK[U(c)] = true; });
// Arabic letters a Sorani value must not use, with the Kurdish letter to write instead.
var CKB_FIX = { 0x643: "U+06A9", 0x64A: "U+06CC", 0x649: "U+06CC", 0x647: "U+06BE for h or U+06D5 for e",
  0x629: "U+06D5", 0x6C0: "U+06D5", 0x623: "U+0626 or U+0627", 0x625: "U+0626 or U+0627", 0x622: "U+0626 then U+0627",
  0x624: "U+0648", 0x621: "U+0626", 0x62B: "U+0633", 0x630: "U+0632", 0x635: "U+0633", 0x636: "U+0632",
  0x637: "U+062A", 0x638: "U+0632" };
// A Sorani word never starts with a bare vowel letter (it takes U+0626 first), with plain r (word-initial r
// is U+0695) or with U+06B5.
var CKB_BAD_INITIAL = {};
CKB_BAD_INITIAL[U(0x627)] = "a word-initial vowel takes U+0626 first";
CKB_BAD_INITIAL[U(0x6D5)] = "a word-initial vowel takes U+0626 first";
CKB_BAD_INITIAL[U(0x6CE)] = "a word-initial vowel takes U+0626 first";
CKB_BAD_INITIAL[U(0x6C6)] = "a word-initial vowel takes U+0626 first";
CKB_BAD_INITIAL[U(0x631)] = "word-initial r is U+0695";
CKB_BAD_INITIAL[U(0x6B5)] = "no word starts with U+06B5";
var CKB_AUTONYM = [0x6A9, 0x648, 0x631, 0x62F, 0x6CC].map(U).join("");
var KU_AUTONYM = "Kurmanc" + U(0xEE);

// Latin tokens every non-Latin-script value may keep (= i18n-check.js SCRIPT_LATIN_NOTATION).
var NOTATION = ["AES", "Alice", "BigInt", "Blowfish", "Bob", "CRT", "DH", "DSA", "Eve", "Fibonacci", "Fourier",
  "Garner", "Hasse", "OAEP", "PDF", "PNG", "QFT", "RSA", "SVG", "aB", "aG", "bA", "bG", "dP", "dQ", "gcd", "kG",
  "lcm", "log", "mod", "pointAdd", "qInv", "scalarMul"];
var KU_KEEP = NOTATION.concat(["Delete", "Enter", "Space", "ms"]);
var KU_KEEP_SET = {};
KU_KEEP.forEach(function (w) { KU_KEEP_SET[w] = true; });
var KEY_NAMES_KU = ["Delete", "Enter", "Space"];
var KEY_NAMES_CKB = ["ئینتەر", "سپەیس", "دیلیت"];
var KEY_NAME_KEYS = ["venn.picker.hint"];
var FORMULA_SAME = ["cayley.equationCaption", "rsa.lblQInv", "sqm.stepSquareFormula", "sqm.stepMultiplyFormula"];

/* ---------- pinned vocabulary (the plan's D-TOOLS, D-COMMON, D-TERMS, D-NAMES) ---------- */

var TOOLS = {
  ku: { brand: "Amûrên teoriya hejmaran", "nav.label": "Amûr", menu: "Amûr", "nav.home": "Destpêk",
    "nav.sieve": "Bêjinga Eratosthenes", "nav.factorTree": "Dara faktoran", "nav.venn": "Diyagrama Venn",
    "nav.euclid": "Algorîtma Euklîd", "nav.crt": "Teorema bermayiyan a çînî", "nav.wheel": "Çerxa wekheviyê",
    "nav.totient": "Fonksiyona φ ya Euler", "nav.cayley": "Tabloya Cayley", "nav.iso": "Îzomorfîzma grûpan",
    "nav.sqm": "Çargoşekirin û lêkdan", "nav.dh": "Diffie-Hellman", "nav.ecdh": "DH bi kevana elîptîk",
    "nav.rsa": "RSA", "nav.fermat": "Rêbaza Fermat", "nav.shor": "Algorîtma Shor", "lang.label": "Ziman",
    "theme.toggle": "Moda rojê û şevê biguherîne" },
  ckb: { brand: "ئامرازەکانی تیۆری ژمارە", "nav.label": "ئامرازەکان", menu: "ئامرازەکان", "nav.home": "سەرەکی",
    "nav.sieve": "بێژنگی ئێراتۆستینس", "nav.factorTree": "داری ھۆکارەکان", "nav.venn": "ھێڵکاری ڤێن",
    "nav.euclid": "ئەلگۆریتمی ئیقلیدس", "nav.crt": "تیۆرەمی پاشماوەی چینی", "nav.wheel": "چەرخی یەکسانی",
    "nav.totient": "فەنکشنی ئۆیلەر φ", "nav.cayley": "خشتەی کەیلی", "nav.iso": "ئیزۆمۆرفیزمی گرووپەکان",
    "nav.sqm": "دووجاکردن و لێکدان", "nav.dh": "دیفی-ھێلمان", "nav.ecdh": "دیفی-ھێلمان بە چەماوەی ئیلیپتیکی",
    "nav.rsa": "RSA", "nav.fermat": "ڕێگای فێرما", "nav.shor": "ئەلگۆریتمی شۆر", "lang.label": "زمان",
    "theme.toggle": "گۆڕین لە نێوان دۆخی ڕۆژ و دۆخی شەو" }
};
var COMMON = {
  ku: { play: "Lêxe", pause: "Rawestîne", step: "Gav", instant: "Yekser", reset: "Ji nû ve", speed: "Lez",
    "speed.1": "cemidî", "speed.2": "hêdî", "speed.3": "nerm", "speed.4": "çalak", "speed.5": "domdar",
    "speed.6": "zû", "speed.7": "bilez", "speed.8": "lezgîn", "speed.9": "birûskî", "speed.10": "hema yekser",
    additiveGroups: "Grûpên lêzêdekirinê", multiplicativeGroups: "Grûpên lêkdanê",
    paletteEmptySieve: "Amûra «{0}» bi kar bîne da ku hejmarên seretayî li vê paletê zêde bikî.",
    primePickerOpen: "Ji paletê hejmareke seretayî hilbijêre", primePickerHeading: "Hejmareke seretayî hilbijêre",
    undoPalette: "Guhertina paletê betal bike", redoPalette: "Guhertina paletê dîsa bike",
    undoWork: "Betal bike", redoWork: "Dîsa bike" },
  ckb: { play: "لێدان", pause: "ڕاگرتن", step: "ھەنگاو", instant: "دەستبەجێ", reset: "ڕێکخستنەوە", speed: "خێرایی",
    "speed.1": "بەستوو", "speed.2": "ھێواش", "speed.3": "نەرم", "speed.4": "چالاک", "speed.5": "جێگیر",
    "speed.6": "خێرا", "speed.7": "زۆر خێرا", "speed.8": "تیژ", "speed.9": "بروسکەیی", "speed.10": "نزیکەی دەستبەجێ",
    additiveGroups: "گرووپەکانی کۆکردنەوە", multiplicativeGroups: "گرووپەکانی لێکدان",
    paletteEmptySieve: "ئامرازی «{0}» بەکاربھێنە بۆ زیادکردنی ژمارە سەرەتاییەکان بۆ ئەم پالێتە.",
    primePickerOpen: "ژمارەیەکی سەرەتایی لە پالێتەکە ھەڵبژێرە", primePickerHeading: "ژمارەیەکی سەرەتایی ھەڵبژێرە",
    undoPalette: "پاشگەزبوونەوە لە گۆڕینی پالێت", redoPalette: "دووبارەکردنەوەی گۆڕینی پالێت",
    undoWork: "پاشگەزبوونەوە", redoWork: "دووبارەکردنەوە" }
};
// D-TERMS: [row, English, ku, ckb] for 06-GLOSSARY.md (c).
var TERMS = [
  [1, "prime", "hejmara seretayî, hejmarên seretayî", "ژمارەی سەرەتایی، ژمارە سەرەتاییەکان"],
  [2, "composite", "hejmara hevedudanî", "ژمارەی لێکدراو"],
  [3, "factor", "faktor, faktorên", "ھۆکار، ھۆکارەکان"],
  [4, "prime factorization", "faktorkirina seretayî", "شیکردنەوە بۆ ھۆکارە سەرەتاییەکان"],
  [5, "divisor", "dabeşker", "دابەشکەر"],
  [6, "greatest common divisor", "dabeşkerê hevpar ê herî mezin", "گەورەترین دابەشکەری ھاوبەش"],
  [7, "least common multiple", "pirjimara hevpar a herî biçûk", "بچووکترین چەندجارەی ھاوبەش"],
  [8, "quotient", "encama dabeşkirinê", "ئەنجامی دابەشکردن"],
  [9, "remainder", "bermayî", "پاشماوە"],
  [10, "modulus", "modul", "مۆدیول"],
  [11, "residue", "bermayiya modulî", "پاشماوەی مۆدیولی"],
  [12, "congruence / congruent", "lihevhatina modulî / lihevhatî", "ھاوتایی مۆدیولی / ھاوتا"],
  [13, "equivalence class", "çîna wekheviyê", "پۆلی یەکسانی"],
  [14, "modular inverse", "berevajiya modulî", "پێچەوانەی مۆدیولی"],
  [15, "coprime", "ji hev seretayî", "سەرەتایی لە نێوان خۆیاندا"],
  [16, "totient", "fonksiyona φ ya Euler", "فەنکشنی ئۆیلەر φ"],
  [17, "group", "grûp, grûpên", "گرووپ، گرووپەکان"],
  [18, "additive group", "grûpa lêzêdekirinê", "گرووپی کۆکردنەوە"],
  [19, "multiplicative group", "grûpa lêkdanê", "گرووپی لێکدان"],
  [20, "unit", "yekîne, yekîneyên", "یەکە، یەکەکان"],
  [21, "identity element", "hêmana bêalî", "توخمی بێلایەن"],
  [22, "inverse", "berevajî", "پێچەوانە"],
  [23, "order of an element", "rêza hêmanê", "پلەی توخم"],
  [24, "generator / primitive root", "çêker / koka bingehîn", "بەرھەمھێنەر / ڕەگی سەرەتایی"],
  [25, "cyclic group", "grûpa çerxî", "گرووپی خولی"],
  [26, "isomorphism", "îzomorfîzm", "ئیزۆمۆرفیزم"],
  [27, "operation table", "tabloya operasyonê (tabloya Cayley)", "خشتەی کردار (خشتەی کەیلی)"],
  [28, "commutative", "cihguhêrbar", "ئاڵوگۆڕپێکراو"],
  [29, "perfect square", "çargoşeya temam", "دووجای تەواو"],
  [30, "factorization method", "rêbaza faktorkirinê", "ڕێگای شیکردنەوە بۆ ھۆکار"],
  [31, "exponent", "hêz", "توان"],
  [32, "base", "bingeh", "بنچینە"],
  [33, "modular exponentiation", "hêzkirina modulî", "بەتوانکردنی مۆدیولی"],
  [34, "binary expansion", "nivîsîna binarî", "نووسینی دووانی"],
  [35, "square / multiply step", "gava çargoşekirinê / gava lêkdanê", "ھەنگاوی دووجاکردن / ھەنگاوی لێکدان"],
  [36, "public key", "kilîta giştî", "کلیلی گشتی"],
  [37, "private key", "kilîta taybet", "کلیلی تایبەت"],
  [38, "key pair", "cotê kilîtan", "جووتە کلیل"],
  [39, "shared secret", "razê hevpar", "نھێنیی ھاوبەش"],
  [40, "encrypt", "şîfre kirin (şîfrekirin)", "شفرەکردن"],
  [41, "decrypt", "şîfre vekirin (şîfrevekirin)", "کردنەوەی شفرە"],
  [42, "plaintext", "nivîsa vekirî", "دەقی ئاشکرا"],
  [43, "ciphertext", "nivîsa şîfrekirî", "دەقی شفرەکراو"],
  [44, "discrete logarithm", "logarîtma veqetandî", "لۆگاریتمی دابڕاو"],
  [45, "brute force", "ceribandina hemû îhtîmalan", "تاقیکردنەوەی ھەموو ئەگەرەکان"],
  [46, "elliptic curve", "kevana elîptîk", "چەماوەی ئیلیپتیکی"],
  [47, "point at infinity", "xala li bêdawiyê", "خاڵی بێکۆتایی"],
  [48, "scalar multiplication", "lêkdana skalar", "لێکدانی سکالار"],
  [49, "order finding", "dîtina rêzê", "دۆزینەوەی پلە"],
  [50, "period", "dewr", "خول"],
  [51, "preset / example", "mînak", "نموونە"],
  [52, "step (playback)", "gav", "ھەنگاو"],
  [53, "playback", "lêxistin", "لێدان"]
];
// D-TERMS "also" (pinned, not glossary (c) rows).
var ALSO = [
  ["theorem", "teorem", "تیۆرەم"], ["algorithm", "algorîtm", "ئەلگۆریتم"], ["palette", "palet", "پالێت"],
  ["region", "herêm", "ناوچە"], ["circle", "çember", "بازنە"], ["wire", "têl", "تەل"], ["quantum", "kuantûm", "کوانتەم"],
  ["whole number / integer", "hejmara tam", "ژمارەی تەواو"], ["point", "xal", "خاڵ"], ["curve", "kevan", "چەماوە"],
  ["diagram", "diyagram", "ھێڵکاری"], ["tool", "amûr", "ئامراز"], ["tree", "dar", "دار"], ["table", "tablo", "خشتە"],
  ["class", "çîn", "پۆل"], ["product", "encama lêkdanê", "ئەنجامی لێکدان"], ["sum", "encama lêzêdekirinê", "کۆ"],
  ["random / Randomize", "rasthatî", "ھەڕەمەکی"], ["message", "peyam", "نامە"], ["bit", "bît", "بیت"],
  ["digit", "reqem", "ڕەقەم"], ["browser", "gerok", "وێبگەڕ"], ["computer", "komputer", "کۆمپیوتەر"],
  ["natural", "xwezayî", "سروشتی"], ["multiplication", "lêkdan", "لێکدان"], ["addition", "lêzêdekirin", "کۆکردنەوە"],
  ["division", "dabeşkirin", "دابەشکردن"], ["multiple", "pirjimar", "چەندجارە"], ["millisecond(s)", "ms", "میلیچرکە"],
  ["million / billion / trillion", "milyon / milyar / trîlyon", "ملیۆن / ملیار / تریلیۆن"],
  ["hundreds / thousands", "sedan / hezaran", "سەدان / ھەزاران"], ["zero", "sifir", "سفر"], ["fifteen", "panzdeh", "پازدە"]
];
// D-NAMES: 06-GLOSSARY.md (d) rows (first word of the "Proper noun" cell) and the other eponyms.
var NAMES = {
  Alice: ["Alice", "Alice"], Bob: ["Bob", "Bob"], Eve: ["Eve", "Eve"], RSA: ["RSA", "RSA"],
  "Diffie-Hellman": ["Diffie-Hellman", "دیفی-ھێلمان"], Euler: ["Euler", "ئۆیلەر"], Fermat: ["Fermat", "فێرما"],
  Cayley: ["Cayley", "کەیلی"], Venn: ["Venn", "ڤێن"], Shor: ["Shor", "شۆر"], Euclid: ["Euklîd", "ئیقلیدس"],
  Eratosthenes: ["Eratosthenes", "ئێراتۆستینس"], "Bézout": ["Bézout", "بێزۆ"], Sun: ["Sun Tzu", "سون تزو"],
  ElGamal: ["ElGamal", "ئێلگەمال"], "Miller-Rabin": ["Miller-Rabin", "میلەر-ڕابین"], Garner: ["Garner", "گارنەر"],
  Fourier: ["Fourier", "فووریێ"], Fibonacci: ["Fibonacci", "فیبۆناچی"], Hasse: ["Hasse", "ھاسە"]
};
var TITLES = {
  ku: { "Diffie-Hellman Key Exchange": "Danûstandina kilîtan a Diffie-Hellman", "Elliptic Curve Diffie-Hellman": "Diffie-Hellman bi kevana elîptîk" },
  ckb: { "Diffie-Hellman Key Exchange": "ئاڵوگۆڕی کلیلی دیفی-ھێلمان", "Elliptic Curve Diffie-Hellman": "دیفی-ھێلمان بە چەماوەی ئیلیپتیکی" }
};
// D-AVOID: alternative spellings of pinned terms (stem prefixes, case-insensitive) and Arabic-only words.
var AVOID = {
  ku: ["algoritm", "algorîtim", "algorîzm", "fonksîyon", "funksiyon", "kilîd", "kilid", "şifre", "matematik",
    "hêjmar", "izomorf", "îzomorfizm", "eliptik", "eliptîk", "elîptik", "teorema çînî", "dabeşkar"],
  ckb: ["عدد", "خوارزم", "مبرهن", "تابع", "ئەلگۆریزم", "فانکشن", "فونکشن", "شیفرە", "مۆدولۆ", "ئایزۆمۆرف",
    "ئێلیپتیک", "ئەلیپتیک", "ئوقلیدس", "یوکلید", "ئۆیلر", "فێرمات", "فەرما", "کایلی", "ئیراتۆستینس", "ئەراتۆستینس"]
};
var EPONYM_KU = { Euclid: "Euklîd", Euclidean: "Euklîd", Euklid: "Euklîd" };
var EPONYM_LATIN_IN_CKB = ["Fibonacci", "Fourier", "Garner", "Hasse", "Euclid", "Euler", "Fermat", "Cayley", "Venn",
  "Shor", "Diffie", "Hellman", "Eratosthenes", "Miller", "Rabin", "ElGamal"];

/* ---------- helpers ---------- */

var bad = 0;
function say() { bad++; console.log(Array.prototype.join.call(arguments, " ")); }
function git(args) { return cp.execFileSync("git", args, { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 }); }
function showBase(p) { return git(["show", BASE + ":" + p]); }
function read(p) { return fs.readFileSync(p, "utf8"); }
function finish(name) { console.log(name + " bad=" + bad); process.exit(bad ? 1 : 0); }
function eq(label, got, want) { if (JSON.stringify(got) !== JSON.stringify(want)) say("FAIL", label, JSON.stringify(got), "want", JSON.stringify(want)); }
function loadDicts(src) {
  var c = {};
  var NT = { i18n: { register: function (n, d) { c[n] = d; } } };
  vm.runInNewContext(src, { NT: NT, window: { NT: NT } });
  return c;
}
function dataFiles(dir) { return fs.readdirSync(dir || I18N_DIR).filter(function (f) { return /\.js$/.test(f); }).sort(); }
function loadAll() {
  var cat = {};
  dataFiles().forEach(function (f) { var d = loadDicts(read(I18N_DIR + f)); Object.keys(d).forEach(function (ns) { cat[ns] = d[ns]; }); });
  return cat;
}
function W(s) { return new RegExp("(?<![\\p{L}\\p{N}_])(?:" + s + ")(?![\\p{L}\\p{N}_])", "iu"); }
function Wcs(s) { return new RegExp("(?<![\\p{L}\\p{N}_])(?:" + s + ")(?![\\p{L}\\p{N}_])", "u"); }
function stem(s) { return new RegExp("(?<![\\p{L}\\p{N}_])" + s, "iu"); }
function stripPh(s) { return String(s == null ? "" : s).replace(/\{[A-Za-z0-9_]+\}/g, " "); }
function phs(s) { return (String(s).match(/\{[A-Za-z0-9_]+\}/g) || []).slice().sort(); }
function formOf(v, ct) { return v == null ? undefined : (typeof v === "object" ? (ct in v ? v[ct] : v.other) : v); }
function markers(s) {
  return String(s).replace(new RegExp(rangeClass([[0x2066, 0x2069]]), "g"), function (m) {
    return { 0x2066: "<LRI>", 0x2067: "<RLI>", 0x2068: "<FSI>", 0x2069: "<PDI>" }[m.codePointAt(0)];
  });
}
function show(v) { return v === undefined ? "-" : markers(JSON.stringify(v)); }
function loadChecker() { try { return require(CHECK_PATH); } catch (e) { say("CHECKER-LOAD", String(e.message).slice(0, 200)); return {}; } }

/* ---------- per-language rules (the reference implementation the checker ports) ---------- */

function kuLetterFindings(id, value, en) {
  if (typeof value !== "string") return [];
  var enSet = {};
  Array.from(String(en == null ? "" : en)).forEach(function (ch) { enSet[ch] = true; });
  var chars = Array.from(value);
  for (var i = 0; i < chars.length; i++) {
    var ch = chars[i];
    if (!/\p{L}/u.test(ch) || /[A-Za-z]/.test(ch) || KU_EXTRA.indexOf(ch) !== -1 || ch === PHI || enSet[ch]) continue;
    return ["KU-LETTER " + id + ".ku: " + JSON.stringify(ch) + " (U+" + hex4(ch.codePointAt(0)).toUpperCase() + ") is not a Kurmanji letter and not in the English value"];
  }
  return [];
}
function ckbLetterFindings(id, value) {
  if (typeof value !== "string") return [];
  var chars = Array.from(value);
  for (var i = 0; i < chars.length; i++) {
    var ch = chars[i];
    if (!/(?=\p{L})\p{Script=Arabic}/u.test(ch) || CKB_OK[ch]) continue;
    var c = ch.codePointAt(0);
    return ["CKB-LETTER " + id + ".ckb: " + JSON.stringify(ch) + " (U+" + hex4(c).toUpperCase() + ") is not a letter of the Sorani alphabet" + (CKB_FIX[c] ? "; write " + CKB_FIX[c] : "")];
  }
  return [];
}
function ckbOrthoFindings(id, value) {
  var f = [];
  if (typeof value !== "string") return f;
  (value.match(/[\p{L}\p{M}]+/gu) || []).forEach(function (w) {
    var first = Array.from(w)[0];
    if (CKB_BAD_INITIAL[first] && f.length < 3) f.push("CKB-INITIAL " + id + ".ckb: " + JSON.stringify(w) + " (" + CKB_BAD_INITIAL[first] + ")");
  });
  if (/\p{Script=Arabic}[,;?]/u.test(value) || value.indexOf(U(0x6D4)) !== -1) f.push("CKB-PUNCT " + id + ".ckb: use U+060C, U+061B, U+061F after an Arabic-script letter, never ASCII , ; ? or U+06D4");
  return f;
}

/* ---------- source text helpers (emit / extract) ---------- */

function scanLiteral(text, i) {
  var q = text[i], j = i + 1;
  while (j < text.length && text[j] !== q) { if (text[j] === BS) j++; j++; }
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
  var re = new RegExp("\\n {4}(['\"]?)" + code.replace("-", "\\-") + "\\1: \\{", "g");
  re.lastIndex = from;
  var m = re.exec(text);
  if (!m || m.index >= to) return null;
  var open = text.indexOf("{", m.index + code.length + 5);
  return { start: m.index, open: open, end: matchBrace(text, open) };
}
function quoteSingle(v) {
  return "'" + String(v).replace(new RegExp("[" + BS + BS + "']", "g"), function (m) { return BS + m; })
    .replace(/\r/g, BS + "r").replace(/\n/g, BS + "n")
    .replace(INVISIBLE_G, function (m) { return BS + "u" + hex4(m.codePointAt(0)); }) + "'";
}
function fmtKey(k) { return /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(k) ? k : quoteSingle(k); }
var CAT_ORDER = ["zero", "one", "two", "few", "many", "other"];
function fmtBlock(code, obj, order) {
  var out = ["    " + code + ": {"];
  order.forEach(function (k, i) {
    var comma = i < order.length - 1 ? "," : "";
    var v = obj[k];
    if (v && typeof v === "object") {
      var cats = CAT_ORDER.filter(function (c) { return c in v; });
      out.push("      " + fmtKey(k) + ": {");
      cats.forEach(function (c, j) { out.push("        " + c + ": " + quoteSingle(v[c]) + (j < cats.length - 1 ? "," : "")); });
      out.push("      }" + comma);
    } else out.push("      " + fmtKey(k) + ": " + quoteSingle(v) + comma);
  });
  out.push("    }");
  return out.join("\n");
}
function unmark(s, errs, where) {
  var v = String(s);
  Object.keys(MARKERS).forEach(function (m) { v = v.split(m).join(MARKERS[m]); });
  var stray = new RegExp(rangeClass([[0x200B, 0x200F], [0x2028, 0x202E], [0x2060, 0x2065], [0x206A, 0x206F], [0xFEFF, 0xFEFF]])).exec(v);
  if (stray) errs.push("EMIT-INVISIBLE " + where + ": raw U+" + hex4(stray[0].codePointAt(0)).toUpperCase() + " (only isolates, written as <LRI>/<RLI>/<FSI>/<PDI>)");
  return v;
}
// emitDraft(dir, draft): writes ku/ckb blocks; returns { errors, written }.
function emitDraft(dir, draft) {
  var errors = [], written = [];
  var owner = {};
  dataFiles(dir).forEach(function (f) {
    var re = /NT\.i18n\.register\(\s*'([a-zA-Z]+)'/g, m, src = read(path.join(dir, f));
    while ((m = re.exec(src))) owner[m[1]] = f;
  });
  Object.keys(draft).forEach(function (ns) {
    var f = owner[ns];
    if (!f) { errors.push("EMIT-NS " + ns + ": no data file registers it"); return; }
    var p = path.join(dir, f), text = read(p);
    var cur = loadDicts(text)[ns], en = cur.en, order = Object.keys(en);
    var errs = [], blocks = {};
    KUR.forEach(function (L) {
      var d = draft[ns][L];
      if (d === undefined) { if (cur[L]) blocks[L] = cur[L]; return; }
      var keys = Object.keys(d);
      var missing = order.filter(function (k) { return keys.indexOf(k) === -1; });
      var extra = keys.filter(function (k) { return order.indexOf(k) === -1; });
      if (missing.length || extra.length) errs.push("EMIT-KEYS " + ns + "." + L + ": missing=[" + missing.join(",") + "] extra=[" + extra.join(",") + "]");
      var out = {};
      order.forEach(function (k) {
        if (!(k in d)) return;
        var v = d[k], e = en[k], where = ns + "." + k + "." + L;
        if (e && typeof e === "object") {
          if (!v || typeof v !== "object" || Object.keys(v).sort().join(",") !== "one,other") { errs.push("EMIT-PLURAL " + where + ": expected { one, other }"); return; }
          var o = { one: unmark(v.one, errs, where + ".one"), other: unmark(v.other, errs, where + ".other") };
          if (phs(o.other).join() !== phs(e.other).join()) errs.push("EMIT-PLACEHOLDERS " + where + ".other: " + phs(o.other).join() + " vs en " + phs(e.other).join());
          if (phs(o.one).some(function (x) { return phs(e.other).indexOf(x) === -1; })) errs.push("EMIT-PLACEHOLDERS " + where + ".one carries a placeholder en lacks");
          out[k] = o;
        } else {
          if (typeof v !== "string") { errs.push("EMIT-SHAPE " + where + ": expected a string"); return; }
          var s = unmark(v, errs, where);
          if (phs(s).join() !== phs(e).join()) errs.push("EMIT-PLACEHOLDERS " + where + ": " + phs(s).join() + " vs en " + phs(e).join());
          out[k] = s;
        }
        if (L === KU && ANY_ISO_RE.test(JSON.stringify(out[k]))) errs.push("EMIT-KU-ISOLATE " + where + ": ku is left to right and takes no isolate");
      });
      blocks[L] = out;
    });
    if (errs.length) { errors.push.apply(errors, errs); return; }
    var reg = text.indexOf("NT.i18n.register('" + ns + "'");
    var open = text.indexOf("{", reg), dictEnd = matchBrace(text, open);
    var z = findLangBlock(text, open, dictEnd, "zgh-Tfng");
    if (!z) { errors.push("EMIT-ANCHOR " + f + " " + ns + ": no zgh-Tfng block"); return; }
    var closeLine = text.lastIndexOf("\n", dictEnd - 1);
    var tail = text.slice(z.end, closeLine);
    if (tail && !/^,\n {4}(ku|ckb): \{[\s\S]*\}$/.test(tail)) { errors.push("EMIT-TAIL " + f + " " + ns + ": unexpected text after the zgh-Tfng block"); return; }
    var add = KUR.filter(function (L) { return blocks[L]; }).map(function (L) { return fmtBlock(L, blocks[L], order); });
    text = text.slice(0, z.end) + (add.length ? ",\n" + add.join(",\n") : "") + text.slice(closeLine);
    fs.writeFileSync(p, text);
    var back = loadDicts(read(p))[ns];
    KUR.forEach(function (L) { if (blocks[L] && JSON.stringify(back[L]) !== JSON.stringify(blocks[L])) errors.push("EMIT-ROUNDTRIP " + f + " " + ns + "." + L); });
    written.push(f + " " + ns + " " + KUR.filter(function (L) { return blocks[L]; }).map(function (L) { return L + "=" + Object.keys(blocks[L]).length; }).join(" "));
  });
  return { errors: errors, written: written };
}
function extractDraft(file) {
  var d = loadDicts(read(file)), out = {};
  var mk = function (v) { if (v && typeof v === "object") { var o = {}; Object.keys(v).forEach(function (c) { o[c] = markers(v[c]); }); return o; } return markers(v); };
  Object.keys(d).forEach(function (ns) {
    out[ns] = {};
    KUR.forEach(function (L) { if (d[ns][L]) { out[ns][L] = {}; Object.keys(d[ns][L]).forEach(function (k) { out[ns][L][k] = mk(d[ns][L][k]); }); } });
  });
  return out;
}

/* ---------- selftest ---------- */

function selftestMode() {
  var C = [
    [kuLetterFindings("t", "Hejmara seretayî û ç ş ê", "Prime"), 0],
    [kuLetterFindings("t", "Hejmar" + U(0x131), "x"), 1],
    [kuLetterFindings("t", "a" + U(0x11F) + "a", "x"), 1],
    [kuLetterFindings("t", U(0x219) + "a", "x"), 1],
    [kuLetterFindings("t", "Bézout", "Bézout coefficients"), 0],
    [kuLetterFindings("t", "Bézout", "Bezout"), 1],
    [kuLetterFindings("t", "fonksiyona " + PHI + "(n)", "totient"), 0],
    [kuLetterFindings("t", "ℤₙ", "in ℤₙ"), 0],
    [kuLetterFindings("t", "д", "x"), 1],
    [ckbLetterFindings("t", TOOLS.ckb["nav.factorTree"]), 0],
    [ckbLetterFindings("t", U(0x643) + U(0x648) + U(0x631) + U(0x62F) + U(0x64A)), 1],
    [ckbLetterFindings("t", "ژمار" + U(0x629)), 1],
    [ckbLetterFindings("t", U(0x647) + "ەنگاو"), 1],
    [ckbLetterFindings("t", "RSA و φ"), 0],
    [ckbOrthoFindings("t", "ئەم ژمارەیە، باشە."), 0],
    [ckbOrthoFindings("t", "ئەم ژمارەیە, باشە"), 1],
    [ckbOrthoFindings("t", "باشە" + U(0x6D4)), 1],
    [ckbOrthoFindings("t", U(0x627) + "مراز"), 1],
    [ckbOrthoFindings("t", U(0x631) + "ێگا"), 1],
    [ckbOrthoFindings("t", "ڕێگا و ئامراز"), 0]
  ];
  C.forEach(function (c, i) { if (c[0].length !== c[1]) say("CASE", i, JSON.stringify(c[0])); });
  // every pinned string passes the gate's own rules
  var pinned = [];
  ["ku", "ckb"].forEach(function (L, li) {
    Object.keys(TOOLS[L]).forEach(function (k) { pinned.push([L, "tools." + k, TOOLS[L][k]]); });
    Object.keys(COMMON[L]).forEach(function (k) { pinned.push([L, "common." + k, COMMON[L][k]]); });
    TERMS.forEach(function (t) { pinned.push([L, "terms." + t[0], t[2 + li]]); });
    ALSO.forEach(function (t) { pinned.push([L, "also." + t[0], t[1 + li]]); });
    Object.keys(NAMES).forEach(function (n) { pinned.push([L, "names." + n, NAMES[n][li]]); });
    Object.keys(TITLES[L]).forEach(function (n) { pinned.push([L, "titles." + n, TITLES[L][n]]); });
  });
  pinned.forEach(function (p) {
    var f = p[0] === KU ? kuLetterFindings(p[1], p[2], "Bézout φ") : ckbLetterFindings(p[1], p[2]).concat(ckbOrthoFindings(p[1], p[2]));
    if (p[0] === CKB) {
      var latin = (p[2].match(/\p{Script=Latin}{2,}/gu) || []).filter(function (w) { return NOTATION.indexOf(w) === -1; });
      if (latin.length) f.push("CKB-LATIN " + p[1] + " " + latin.join(","));
    }
    if (p[2] !== p[2].normalize("NFC") || INVISIBLE_RE.test(p[2])) f.push("NFC/INVISIBLE " + p[1]);
    f.forEach(function (x) { say("PINNED", p[0], x); });
  });
  if (TERMS.length !== 53) say("TERMS-COUNT", TERMS.length);
  // emit / extract round trip in a temporary directory
  var dir = fs.mkdtempSync(path.join(os.tmpdir(), "ku-gate-"));
  var src = ["(function () {", "  \"use strict\";", "", "  NT.i18n.register('tst', {", "    en: {", "      a: 'x = {n}',",
    "      'b.c': 'B',", "      p: {", "        one: '{count} one',", "        other: '{count} other'", "      }", "    },",
    "    'zgh-Tfng': {", "      a: 'y',", "      'b.c': 'z',", "      p: {", "        one: 'q',", "        other: 'r'", "      }", "    }",
    "  });", "})();", ""].join("\n");
  fs.writeFileSync(path.join(dir, "tst.js"), src);
  var draft = { tst: { ku: { a: "x = {n}", "b.c": "B'", p: { one: "{count} yek", other: "{count} gelek" } },
    ckb: { a: "<LRI>x = {n}<PDI> ژمارە", "b.c": "ب", p: { one: "{count} دانە", other: "{count} دانە" } } } };
  var r1 = emitDraft(dir, draft);
  var t1 = read(path.join(dir, "tst.js"));
  var r2 = emitDraft(dir, draft);
  var t2 = read(path.join(dir, "tst.js"));
  if (r1.errors.length || r2.errors.length) say("EMIT-ERRORS", JSON.stringify(r1.errors.concat(r2.errors)));
  if (t1 !== t2) say("EMIT-NOT-IDEMPOTENT");
  if (ANY_ISO_RE.test(t1)) say("EMIT-RAW-ISOLATE");
  if (t1.indexOf(BS + "u2066x = {n}" + BS + "u2069") === -1) say("EMIT-NO-ESCAPE");
  if (t1.indexOf("'b.c': 'B" + BS + "''") === -1) say("EMIT-QUOTE");
  var back = loadDicts(t1).tst;
  eq("roundtrip ckb.a", back.ckb.a, LRI + "x = {n}" + PDI + " ژمارە");
  eq("key order", Object.keys(back), ["en", "zgh-Tfng", "ku", "ckb"]);
  eq("extract", extractDraft(path.join(dir, "tst.js")).tst.ckb.a, "<LRI>x = {n}<PDI> ژمارە");
  var bad1 = emitDraft(dir, { tst: { ku: { a: "x" } } });
  if (!bad1.errors.some(function (e) { return /^EMIT-KEYS/.test(e); })) say("EMIT-KEYS-MISSED");
  var bad2 = emitDraft(dir, { tst: { ckb: { a: "x = {m}", "b.c": "B", p: { one: "a", other: "{count} b" } } } });
  if (!bad2.errors.some(function (e) { return /^EMIT-PLACEHOLDERS/.test(e); })) say("EMIT-PH-MISSED");
  var bad3 = emitDraft(dir, { tst: { ckb: { a: "x = {n}" + U(0x200C), "b.c": "B", p: { one: "a", other: "{count} b" } } } });
  if (!bad3.errors.some(function (e) { return /^EMIT-INVISIBLE/.test(e); })) say("EMIT-INVISIBLE-MISSED");
  if (read(path.join(dir, "tst.js")) !== t1) say("EMIT-WROTE-ON-ERROR");
  fs.rmSync(dir, { recursive: true, force: true });
  finish("SELFTEST");
}

/* ---------- engine ---------- */

var DET_COMMENT_RE = /^ {6}\/\/ Kurdish: /;
var DET1 = "      if (parts[0] === 'ckb' || (parts[0] === 'ku' && parts.indexOf('arab') !== -1)) return 'ckb';";
var DET2 = "      if (parts[0] === 'kmr') return 'ku';";
function mkEngine(src, q, langs, cookie, noIntl) {
  var de = { lang: "", attrs: {}, setAttribute: function (k, v) { this.attrs[k] = String(v); },
    removeAttribute: function (k) { delete this.attrs[k]; }, getAttribute: function (k) { return k in this.attrs ? this.attrs[k] : null; } };
  var c = { location: { search: q, pathname: "/x.html", hash: "" }, navigator: { languages: langs },
    document: { readyState: "complete", cookie: cookie || "", documentElement: de, querySelectorAll: function () { return []; },
      getElementsByTagName: function () { return []; }, getElementById: function () { return null; }, addEventListener: function () {} } };
  c.window = c;
  vm.createContext(c);
  if (noIntl) vm.runInContext("delete globalThis.Intl;", c);
  vm.runInContext(src, c);
  return { I: c.NT.i18n, de: de, hasIntl: vm.runInContext("typeof Intl", c) };
}
function engineMode() {
  var file = "assets/nt-i18n.js", src = read(file);
  var r = mkEngine(src, "", ["en"]);
  eq("SUPPORTED_LANGS", r.I.SUPPORTED_LANGS.join(","), "nl,en,de,fr,es,it,pl,pt-BR,pt-PT,sv,nb,ro,hu,lv,ru,el,he,hi,ar,sq,sw,zh,ja,ko,id,zgh-Latn,zgh-Tfng,ku,ckb");
  [
    [["ckb"], CKB], [["ckb-IQ"], CKB], [["ckb-IR"], CKB], [["CKB_iq"], CKB], [["ckb-Arab"], CKB], [["ckb-Arab-IQ"], CKB],
    [["ckb-Latn"], CKB], [["Ckb-iQ", "en"], CKB], [["ku-Arab"], CKB], [["ku-Arab-IQ"], CKB], [["KU_arab"], CKB],
    [["ku-arab-ir"], CKB], [["Ku-ARAB", "en"], CKB],
    [["ku"], KU], [["ku-TR"], KU], [["KU_tr"], KU], [["ku-Latn"], KU], [["ku-Latn-TR"], KU], [["ku-IQ"], KU], [["ku-IR"], KU],
    [["ku-SY"], KU], [["kmr"], KU], [["kmr-TR"], KU], [["KMR_latn"], KU], [["kmr-Arab"], KU],
    [["kur"], KU], [["kur-Arab"], KU], [["kum", "en"], KU], [["kua"], KU],
    [["sdh", "en"], "en"], [["sdh-IR"], "en"], [["lki", "en"], "en"], [["ck", "en"], "en"], [["ckbx", "en"], "en"],
    [["kmrx", "en"], "en"], [["k", "en"], "en"], [["kmr-", "en"], KU],
    [["en-IQ", "ckb"], "en"], [["ar-IQ", "ckb"], "ar"], [["tr-TR", "ku"], KU], [["fa-IR", "ckb"], CKB], [["he", "ckb"], "he"],
    [["ckb", "ar"], CKB], [["ku", "ckb"], KU], [["zgh", "ku"], "zgh-Tfng"], [["iw", "ku-Arab"], "he"], [["sdh", "ku-Arab"], CKB],
    [["ko-KR"], "ko"], [["kok", "en"], "ko"], [["ar"], "ar"], [["id", "ku"], "id"], [["in", "ckb"], "id"],
    [["zgh-Latn", "ckb"], "zgh-Latn"], [["pt", "ku"], "pt-BR"], [["no-NO", "ckb"], "nb"], [["en-US"], "en"]
  ].forEach(function (t) { eq("detect " + t[0].join(","), mkEngine(src, "", t[0]).I.detectDefaultLang(), t[1]); });
  var a = mkEngine(src, "?lang=ckb", ["en"]);
  eq("load ckb lang", a.de.lang, CKB);
  eq("load ckb dir", a.de.getAttribute("dir"), "rtl");
  eq("setLang ku after ckb", a.I.setLang(KU), true);
  eq("ku after ckb lang", a.de.lang, KU);
  eq("ku after ckb dir", a.de.getAttribute("dir"), null);
  a.I.setLang("zgh-Latn"); a.I.setLang(CKB);
  eq("ckb after zgh-Latn dir", a.de.getAttribute("dir"), "rtl");
  a.I.setLang("he"); a.I.setLang(CKB);
  eq("ckb after he dir", a.de.getAttribute("dir"), "rtl");
  a.I.setLang("ar"); a.I.setLang(CKB);
  eq("ckb after ar lang", a.de.lang, CKB);
  a.I.setLang("en");
  eq("en after ckb dir", a.de.getAttribute("dir"), null);
  var b = mkEngine(src, "?lang=ku", ["en"]);
  eq("load ku lang", b.de.lang, KU);
  eq("load ku dir", b.de.getAttribute("dir"), null);
  eq("?lang=ku beats cookie ckb", mkEngine(src, "?lang=ku", ["en"], "site-lang=ckb").de.lang, KU);
  eq("?lang=CKB falls through", mkEngine(src, "?lang=CKB", ["en"]).de.lang, "en");
  eq("?lang=ku-TR falls through to detected", mkEngine(src, "?lang=ku-TR", ["ku-Arab-IQ"]).de.lang, CKB);
  eq("cookie ckb", mkEngine(src, "", ["en"], "site-lang=ckb").de.getAttribute("dir"), "rtl");
  eq("cookie kmr falls through", mkEngine(src, "", ["en"], "site-lang=kmr").de.lang, "en");
  ["KU", "Ku", "kU", "CKB", "Ckb", "ckB", "kmr", "kur", "ku-TR", "ku-Latn", "ku-Arab", "ckb-IQ", "ckb-Arab", "ckb_IQ",
    "sdh", "lki", " ku", "ku ", "ckb\n", "kurmanci", "sorani"].forEach(function (v) { eq("setLang " + JSON.stringify(v), r.I.setLang(v), false); });
  [false, true].forEach(function (noIntl) {
    var z = mkEngine(src, "", ["en"], "", noIntl);
    if (noIntl) eq("no Intl in context", z.hasIntl, "undefined");
    z.I.register("trkugate", { en: { count: { one: "{count} one", other: "{count} other" } },
      ku: { count: { one: "{count} one", other: "{count} other" } }, ckb: { count: { one: "{count} one", other: "{count} other" } } });
    KUR.forEach(function (L) {
      z.I.setLang(L);
      [0, 1, 2, 1.5, 11, 21, 100, 1000000].forEach(function (n) {
        eq((noIntl ? "no Intl " : "Intl ") + L + " plural " + n, z.I.translate("trkugate.count", { count: n }), n + (n === 1 ? " one" : " other"));
      });
    });
  });
  // ENGINE-CODE: the header comment plus four pinned changes after the IIFE start.
  var o = showBase(file).split("\n"), n = src.split("\n");
  var ho = o.indexOf("(function () {"), hn = n.indexOf("(function () {");
  if (ho < 0 || hn < 0) { say("ENGINE-CODE IIFE start not found"); finish("ENGINE-KU"); }
  var header = n.slice(0, hn).join("\n").replace(/\s+/g, " ");
  if (header.indexOf("the three-letter `ckb`") === -1) say("ENGINE-CODE header does not name the three-letter `ckb` code");
  if (header.indexOf("Hebrew, Arabic and Sorani Kurdish are the right-to-left languages") === -1) say("ENGINE-CODE header RTL sentence not updated");
  if (/Hebrew and Arabic are the right-to-left|while either is active/.test(header)) say("ENGINE-CODE stale RTL wording in the header");
  o = o.slice(ho); n = n.slice(hn);
  var at = -1;
  for (var i = 1; i < n.length; i++) if (DET_COMMENT_RE.test(n[i])) { at = i; break; }
  if (at < 0) say("ENGINE-CODE Kurdish detection comment missing");
  else {
    if (!/^ {6}if \(parts\[0\] === 'zgh' /.test(n[at - 1])) say("ENGINE-CODE Kurdish branch not directly after the Tamazight branch");
    if (n[at + 1] !== DET1 || n[at + 2] !== DET2) say("ENGINE-CODE Kurdish detection statements missing or different");
    else n.splice(at, 3);
  }
  if (o.length !== n.length) say("ENGINE-CODE line count after removing the insertion", o.length, "->", n.length);
  else for (var j = 0; j < o.length; j++) {
    if (o[j] === n[j]) continue;
    var ok = (/var SUPPORTED_LANGS = /.test(o[j]) && n[j] === o[j].replace("'zgh-Tfng']);", "'zgh-Tfng', 'ku', 'ckb']);")) ||
      (/var RTL_LANGS = /.test(o[j]) && n[j] === o[j].replace("['he', 'ar']", "['he', 'ar', 'ckb']")) ||
      (/The right-to-left languages, Hebrew and Arabic \(internal/.test(o[j]) && n[j] === o[j].replace("Hebrew and Arabic (internal", "Hebrew, Arabic and Sorani Kurdish (internal"));
    if (!ok) say("ENGINE-CODE changed line", j + hn + 1, JSON.stringify(n[j]).slice(0, 140));
  }
  finish("ENGINE-KU");
}

/* ---------- checker ---------- */

function checkerMode() {
  var c = require(CHECK_PATH);
  var need = ["SWITCHER_OPTIONS", "LANG_CODES", "RTL_LANGS", "DIGIT_PARITY_LANGS", "SCRIPT_RULES", "PLURAL_EXTRA_CATEGORIES",
    "PLURAL_OTHER_ONLY_LANGS", "FIXED_PLURAL_LANGS", "expectedPluralCategories", "isProse", "pluralCategoryFindings",
    "scriptFindings", "bidiFindings", "charFindings", "digitParityFindings", "kuLetterFindings", "CKB_LETTERS"];
  var missing = need.filter(function (k) { return !(k in c); });
  if (missing.length) { say("EXPORT-MISSING", missing.join(",")); finish("CHECKER-KU"); }
  eq("switcher tail", c.SWITCHER_OPTIONS.slice(-3).map(function (o) { return o.value + "/" + o.lang + "/" + o.label; }),
    ["zgh-Tfng/zgh-Tfng/" + c.SWITCHER_OPTIONS[26].label, "ku/ku/" + KU_AUTONYM, "ckb/ckb/" + CKB_AUTONYM]);
  eq("LANG_CODES length", c.LANG_CODES.length, 29);
  eq("RTL_LANGS", c.RTL_LANGS, ["he", "ar", "ckb"]);
  eq("DIGIT_PARITY_LANGS", c.DIGIT_PARITY_LANGS, ["hi", "ar", "sq", "sw", "zh", "ja", "ko", "id", "zgh-Latn", "zgh-Tfng", "ku", "ckb"]);
  KUR.forEach(function (L) {
    eq("plural " + L, c.expectedPluralCategories(L), ["one", "other"]);
    eq("not extra/other-only/fixed " + L, [L in c.PLURAL_EXTRA_CATEGORIES, c.PLURAL_OTHER_ONLY_LANGS.indexOf(L), c.FIXED_PLURAL_LANGS.indexOf(L)], [false, -1, -1]);
  });
  eq("CKB_LETTERS", Array.from(c.CKB_LETTERS).sort().join(""), Array.from(CKB_LETTERS).sort().join(""));
  eq("script rule ckb", CKB in c.SCRIPT_RULES, true);
  eq("no script rule ku", KU in c.SCRIPT_RULES, false);
  eq("ckb latin list", c.SCRIPT_RULES.ckb.latin.slice().sort(), NOTATION.slice().sort());
  eq("autonym neutral ku", c.isProse(KU_AUTONYM), false);
  eq("autonym neutral ckb", c.isProse(CKB_AUTONYM), false);
  var has = function (arr, code) { return arr.some(function (x) { return x.indexOf(code + " ") === 0; }); };
  var expect = function (label, arr, codes) {
    if (!codes.length && arr.length) say("UNEXPECTED", label, JSON.stringify(arr));
    codes.forEach(function (k) { if (!has(arr, k)) say("MISSED", label, k, JSON.stringify(arr)); });
  };
  var clean = TOOLS.ckb["nav.factorTree"] + " RSA mod {n} Alice " + PHI;
  expect("ckb clean script", c.scriptFindings("t.k", CKB, clean, "Factor tree RSA mod {n} Alice"), []);
  expect("ckb latin word", c.scriptFindings("t.k", CKB, TOOLS.ckb["nav.home"] + " prime", "Home prime"), ["SCRIPT-LATIN"]);
  expect("ckb glued latin", c.scriptFindings("t.k", CKB, "RSA" + TOOLS.ckb["nav.home"], "RSA home"), ["SCRIPT-MIXED"]);
  expect("ckb cyrillic", c.scriptFindings("t.k", CKB, TOOLS.ckb["nav.home"] + " д", "home"), ["SCRIPT-FOREIGN"]);
  expect("ckb digits only", c.scriptFindings("t.k", CKB, "123", "Home page"), ["SCRIPT-MISSING"]);
  expect("ckb clean chars", c.charFindings("t.k", CKB, clean + "، 16.8"), []);
  expect("ckb kaf", c.charFindings("t.k", CKB, U(0x643) + "ورد"), ["ARABIC-LETTER"]);
  expect("ckb yeh", c.charFindings("t.k", CKB, "ورد" + U(0x64A)), ["ARABIC-LETTER"]);
  expect("ckb teh marbuta", c.charFindings("t.k", CKB, "ژمار" + U(0x629)), ["ARABIC-LETTER"]);
  expect("ckb heh", c.charFindings("t.k", CKB, U(0x647) + "ەنگاو"), ["ARABIC-LETTER"]);
  expect("ar keheh still banned", c.charFindings("t.k", "ar", U(0x6A9) + "تاب"), ["ARABIC-LETTER"]);
  expect("ar clean", c.charFindings("t.k", "ar", "كتاب عربي"), []);
  expect("ckb harakat", c.charFindings("t.k", CKB, "ژمار" + U(0x64E) + "ە"), ["TASHKEEL"]);
  expect("ckb ext digit", c.charFindings("t.k", CKB, "ژمارە " + U(0x6F3)), ["NATIVE-DIGIT"]);
  expect("ckb separator", c.charFindings("t.k", CKB, "16" + U(0x66B) + "8"), ["NATIVE-SEPARATOR"]);
  expect("ckb zwnj", c.charFindings("t.k", CKB, "ژمارە" + U(0x200C) + "ی"), ["ZERO-WIDTH"]);
  expect("ckb formula", c.bidiFindings("t.k", CKB, "ژمارە 48 = 2 × 18 + 12"), ["BIDI-FORMULA"]);
  expect("ckb isolated formula", c.bidiFindings("t.k", CKB, "ژمارە " + LRI + "48 = 2 × 18 + 12" + PDI), []);
  expect("ku digits", c.digitParityFindings("t.k", KU, "16,8 milyon", "16.8 million"), ["DIGIT-PARITY"]);
  expect("ckb digits", c.digitParityFindings("t.k", CKB, "16.8 ملیۆن", "16.8 million"), []);
  expect("ku clean", c.kuLetterFindings("t.k", KU, "Hejmara seretayî û ç ş ê", "Prime"), []);
  expect("ku dotless i", c.kuLetterFindings("t.k", KU, "Hejmar" + U(0x131), "x"), ["KU-LETTER"]);
  expect("ku comma-s", c.kuLetterFindings("t.k", KU, U(0x219) + "a", "x"), ["KU-LETTER"]);
  expect("ku e-acute from en", c.kuLetterFindings("t.k", KU, "Bézout", "Bézout"), []);
  expect("ku e-acute not in en", c.kuLetterFindings("t.k", KU, "Bézout", "Bezout"), ["KU-LETTER"]);
  expect("ku phi", c.kuLetterFindings("t.k", KU, "fonksiyona " + PHI, "totient"), []);
  expect("ku other lang", c.kuLetterFindings("t.k", "id", "ı", "x"), []);
  expect("ku nfc", c.charFindings("t.k", KU, "c" + U(0x327) + "a"), ["NOT-NFC"]);
  var pc = c.pluralCategoryFindings();
  if (pc.length) say("PLURAL-CATS", JSON.stringify(pc));
  try {
    var out = cp.execFileSync("node", ["-e", "var c=require(" + JSON.stringify(CHECK_PATH) + ");process.stdout.write(JSON.stringify(c.pluralCategoryFindings()))"],
      { encoding: "utf8", env: Object.assign({}, process.env, { LANG: "ru_RU.UTF-8", LC_ALL: "ru_RU.UTF-8" }) });
    if (JSON.parse(out).length) say("PLURAL-CATS-RU", out);
  } catch (e) { say("PLURAL-CATS-RU-RUN", String(e.message).slice(0, 200)); }
  // agreement with this gate on every shipped value
  var cat = loadAll(), dis = 0;
  Object.keys(cat).forEach(function (ns) {
    var d = cat[ns];
    Object.keys(d.en).forEach(function (k) {
      var cats = typeof d.en[k] === "object" ? ["one", "other"] : [""];
      cats.forEach(function (ct) {
        var ev = ct ? (typeof d.en[k][ct] === "string" ? d.en[k][ct] : d.en[k].other) : d.en[k];
        var id = ns + "." + k + (ct ? "." + ct : "");
        var kv = d.ku && (ct ? d.ku[k] && d.ku[k][ct] : d.ku[k]), cv = d.ckb && (ct ? d.ckb[k] && d.ckb[k][ct] : d.ckb[k]);
        if (typeof kv === "string" && (kuLetterFindings(id, kv, ev).length > 0) !== (c.kuLetterFindings(id, KU, kv, ev).length > 0) && dis++ < 5) say("DISAGREE ku", id);
        if (typeof cv === "string" && (ckbLetterFindings(id, cv).length > 0) !== has(c.charFindings(id, CKB, cv), "ARABIC-LETTER") && dis++ < 5) say("DISAGREE ckb", id);
      });
    });
  });
  finish("CHECKER-KU");
}

/* ---------- batch ---------- */

var EN_WORDS = "the|and|with|this|that|then|than|when|which|each|are|was|has|have|key|keys|table|tree|start|clear|result|first|next|last|if|use|add|find|set|size|mark|check|search|secret|message|shared|digit|digits|list|grid|cell|cells|instant|reset|here|there|they|she|its|it|step|steps|number|numbers|prime|primes|value|values|click|press|enter|choose|show|hide|stop|random|public|private|from|into|your|for|of|to|on|by|or|not|run|play|pause|done|found|time";
var ENRE = new RegExp("(?<![\\p{L}\\p{N}_.])(?:" + EN_WORDS + ")(?![\\p{L}\\p{N}_])", "giu");
var KU_OWN = W("û|ji|di|bi|li|ya|yê|yên|ên|ku|ne|na|an|de|re|ve|jî|ev|vê|wê|her|hemû|bo|heye|e|ye|in|tê|dibe|dike|bike|be|ê|a|kirin|hat|hate|nîne|tune");
var LATIN_LANGS = ["nl", "de", "fr", "es", "it", "pl", "pt-BR", "pt-PT", "sv", "nb", "ro", "hu", "lv", "sq", "sw", "id", "zgh-Latn"];

function batchMode(files) {
  var C = loadChecker();
  var hasExports = typeof C.kuLetterFindings === "function" && typeof C.CKB_LETTERS === "string";
  if (!hasExports) say("CHECKER-EXPORTS-MISSING", "kuLetterFindings/CKB_LETTERS (Task 1 step C)");
  if (!files.length) say("NO-FILES");
  var keepRe = new RegExp("(?<![\\p{L}\\p{N}_])(?:" + KU_KEEP.join("|") + ")(?![\\p{L}\\p{N}_])", "gu");
  var strip = function (s) { return stripPh(s).replace(keepRe, " "); };
  var site = loadDicts(read(I18N_DIR + "site.js")).site;
  var navTitle = { ku: {}, ckb: {} };
  KUR.forEach(function (L) {
    if (site && site[L]) Object.keys(site.en).forEach(function (k) {
      if (/^nav\./.test(k) && (String(site.en[k]).match(/\p{L}{2,}/gu) || []).length >= 2) navTitle[L][site.en[k]] = site[L][k];
    });
    Object.keys(TITLES[L]).forEach(function (t) { navTitle[L][t] = TITLES[L][t]; });
  });
  var st = { n4: 0, own: 0, prose: 0, shared: {} };
  files.forEach(function (f) {
    var raw = read(I18N_DIR + f), header = raw.split("(function")[0];
    if (/\btwenty-seven\b/i.test(raw)) say("STALE-COUNT", f);
    if (!/\btwenty-nine\b/i.test(header)) say("COUNT-MISSING", f);
    var o = loadDicts(showBase(I18N_DIR + f)), n = loadDicts(raw);
    Object.keys(o).forEach(function (ns) {
      Object.keys(o[ns]).forEach(function (l) { if (JSON.stringify(o[ns][l]) !== JSON.stringify(n[ns] && n[ns][l])) say("DICT-CHANGED", f, ns, l); });
      if (!n[ns]) { say("NS-MISSING", f, ns); return; }
      var langs = Object.keys(n[ns]);
      if (langs.slice(-2).join(",") !== KUR.join(",")) say("KU-NOT-LAST", f, ns, langs.slice(-3).join(","));
      langs.forEach(function (l) { if (!(l in o[ns]) && KUR.indexOf(l) === -1) say("DICT-EXTRA", f, ns, l); });
      var en = n[ns].en, he = n[ns].he, ar = n[ns].ar;
      var ok = true;
      KUR.forEach(function (L) {
        if (!n[ns][L]) { say("NO-" + L.toUpperCase(), f, ns); ok = false; return; }
        if (Object.keys(n[ns][L]).join("|") !== Object.keys(en).join("|")) say("KEY-ORDER", f, ns, L);
      });
      if (!ok) return;
      Object.keys(en).forEach(function (k) {
        var isPlural = en[k] && typeof en[k] === "object";
        var full = ns + "." + k;
        KUR.forEach(function (L) {
          var v = n[ns][L][k];
          if (isPlural && !(v && typeof v === "object" && Object.keys(v).sort().join(",") === "one,other")) say("PLURAL-SHAPE", f, full, L, "expected { one, other }");
          if (!isPlural && typeof v !== "string") say("PLURAL-SHAPE", f, full, L, "expected a string");
        });
        (isPlural ? ["one", "other"] : [""]).forEach(function (ct) {
          var ev = String(ct ? (typeof en[k][ct] === "string" ? en[k][ct] : en[k].other) : en[k]);
          var id = full + (ct ? "." + ct : "");
          var kv = formOf(n[ns].ku[k], ct || "other"), cv = formOf(n[ns].ckb[k], ct || "other");
          if (typeof kv !== "string" || typeof cv !== "string") return;
          [[KU, kv], [CKB, cv]].forEach(function (p) {
            var L = p[0], v = p[1];
            // ku takes no invisible character at all; ckb only the isolates (escaped in the source).
            if (INVISIBLE_RE.test(L === KU ? v : v.replace(new RegExp(rangeClass([[0x2066, 0x2069]]), "g"), ""))) say("BIDI-MARK", id, L);
            if (/["“”‘’'„]/.test(v)) say("QUOTE-STYLE", id, L, "quote with «…» (D-PUNCT)");
            if (v === ev && C.isProse && C.isProse(ev) && FORMULA_SAME.indexOf(full) === -1) say("SAME-AS-EN", id, L, JSON.stringify(ev).slice(0, 80));
            if (ns !== "site" && Object.prototype.hasOwnProperty.call(navTitle[L], ev) && v !== navTitle[L][ev]) say("NAV-TITLE", id, L, JSON.stringify(v), "want", JSON.stringify(navTitle[L][ev]));
            AVOID[L].forEach(function (w) { if (stem(w).test(v)) say("AVOID", id, L, JSON.stringify(w), "(D-AVOID)"); });
            var keys = L === KU ? KEY_NAMES_KU : KEY_NAMES_CKB;
            keys.forEach(function (kn) { if (Wcs(kn).test(v) && KEY_NAME_KEYS.indexOf(full) === -1) say("KEY-NAME", id, L, kn, "(key names only in venn.picker.hint)"); });
          });
          // Kurmanji
          kuLetterFindings(id, kv, ev).forEach(function (s) { say(s); });
          if (ANY_ISO_RE.test(kv)) say("KU-ISOLATE", id, "(ku is left to right: no isolates)");
          if (/(?<![\p{L}])(?:GCD|LCM)(?![\p{L}])/u.test(kv)) say("KU-GCD", id, "(D-GCD: the D-TERMS phrase or lowercase gcd)");
          (stripPh(kv).match(/(?<![\p{L}\p{N}_])\p{Lu}{2,}(?![\p{L}\p{N}_])/gu) || []).forEach(function (w) {
            if (!KU_KEEP_SET[w] && !Wcs(w).test(ev) && !/^(GCD|LCM)$/.test(w)) say("KU-ACRONYM", id, JSON.stringify(w), "(not on the keep list and not in the English value)");
          });
          Object.keys(EPONYM_KU).forEach(function (e) { if (Wcs(e).test(kv)) say("EPONYM-SPELLING", id, KU, JSON.stringify(e), "write", JSON.stringify(EPONYM_KU[e])); });
          var hits = {};
          (strip(kv).match(ENRE) || []).forEach(function (w) { hits[w.toLowerCase()] = true; });
          Object.keys(hits).forEach(function (w) {
            var re = W(w);
            var kept = LATIN_LANGS.filter(function (m) { return re.test(strip(formOf(n[ns][m] && n[ns][m][k], ct || "other") || "")); }).length;
            if (kept < 7) say("ENGLISH-WORD", id, KU, w);
          });
          if ((ev.match(/\p{L}{2,}/gu) || []).length >= 4) { st.n4++; if (KU_OWN.test(kv)) st.own++; }
          if (C.isProse && C.isProse(kv) && kv !== ev) {
            st.prose++;
            Object.keys(n[ns]).forEach(function (m) {
              if (m === "en" || KUR.indexOf(m) !== -1) return;
              if (kv === String(formOf(n[ns][m] && n[ns][m][k], ct || "other"))) st.shared[m] = (st.shared[m] || 0) + 1;
            });
          }
          // Sorani
          ckbLetterFindings(id, cv).forEach(function (s) { say(s); });
          ckbOrthoFindings(id, cv).forEach(function (s) { say(s); });
          var hv = he ? formOf(he[k], ct || "other") : "", av = ar ? formOf(ar[k], ct || "other") : "";
          if ((ISO_OPEN_RE.test(String(hv)) || ISO_OPEN_RE.test(String(av))) && !ISO_OPEN_RE.test(cv)) say("CKB-NO-ISOLATE", id, "(the he or ar value isolates a formula here)");
          if (String(hv).indexOf(RLI) !== -1 && String(av).indexOf(RLI) !== -1 && cv.indexOf(RLI) === -1) say("CKB-NO-RLI", id, "(he and ar use U+2067 here)");
          var arrows = function (s) { return (String(s).match(ARROW_G) || []).sort().join(""); };
          if (av && arrows(cv) !== arrows(av)) say("CKB-ARROW", id, "arrows", JSON.stringify(arrows(cv)), "want", JSON.stringify(arrows(av)), "(as ar)");
          EPONYM_LATIN_IN_CKB.forEach(function (e) {
            if (Wcs(e).test(cv) && !Wcs(e).test(String(av))) say("EPONYM-SPELLING", id, CKB, JSON.stringify(e), "(write it in Sorani script, D-NAMES)");
          });
          if (hasExports) {
            var cf = C.kuLetterFindings(id, KU, kv, ev)
              .concat(C.charFindings(id, KU, kv), C.digitParityFindings(id, KU, kv, ev), C.bidiFindings(id, KU, kv))
              .concat(C.scriptFindings(id, CKB, cv, ev), C.charFindings(id, CKB, cv), C.bidiFindings(id, CKB, cv), C.digitParityFindings(id, CKB, cv, ev));
            cf.forEach(function (s) { say("CHECKER", s); });
          }
        });
      });
    });
  });
  if (st.n4 && st.own < 0.7 * st.n4) say("OWN-WORDS", "ku", st.own + "/" + st.n4);
  Object.keys(st.shared).forEach(function (m) { if (st.shared[m] > Math.max(3, 0.05 * st.prose)) say("SHARED-VALUES", "ku", m, st.shared[m] + "/" + st.prose); });
  console.log("STATS ku own=" + st.own + "/" + st.n4 + " prose=" + st.prose + " maxShared=" + JSON.stringify(Object.keys(st.shared).map(function (m) { return [m, st.shared[m]]; }).sort(function (x, y) { return y[1] - x[1]; }).slice(0, 2)));
  finish("KU-BATCH");
}

function pinnedMode() {
  var d = loadDicts(read(I18N_DIR + "site.js"));
  KUR.forEach(function (L) {
    eq("site." + L, d.site && d.site[L], TOOLS[L]);
    eq("common." + L, d.common && d.common[L], COMMON[L]);
  });
  finish("PINNED");
}
function termsMode() {
  console.log("D-TOOLS (site.nav and chrome):");
  Object.keys(TOOLS.ku).forEach(function (k) { console.log("  " + k + " | " + TOOLS.ku[k] + " | " + TOOLS.ckb[k]); });
  console.log("D-COMMON:");
  Object.keys(COMMON.ku).forEach(function (k) { console.log("  " + k + " | " + COMMON.ku[k] + " | " + COMMON.ckb[k]); });
  console.log("D-TERMS (glossary (c) rows):");
  TERMS.forEach(function (t) { console.log("  " + t[0] + " " + t[1] + " | " + t[2] + " | " + t[3]); });
  console.log("D-TERMS also:");
  ALSO.forEach(function (t) { console.log("  " + t[0] + " | " + t[1] + " | " + t[2]); });
  console.log("D-NAMES:");
  Object.keys(NAMES).forEach(function (n) { console.log("  " + n + " | " + NAMES[n][0] + " | " + NAMES[n][1]); });
  console.log("D-TITLES:");
  Object.keys(TITLES.ku).forEach(function (t) { console.log("  " + t + " | " + TITLES.ku[t] + " | " + TITLES.ckb[t]); });
}

/* ---------- glossary ---------- */

function glossaryTables(lines) {
  var heads = [[/^## \(b\)/, "b"], [/^## \(c\)/, "c"], [/^## \(d\)/, "d"], [/^## \(f\)/, "f"]], out = {};
  heads.forEach(function (h) {
    var i = lines.findIndex(function (l) { return h[0].test(l); });
    if (i < 0) return;
    while (i < lines.length && !/^\|/.test(lines[i])) i++;
    out[h[1]] = i;
  });
  return out;
}
function cellsOf(l) { return l.split("|").slice(1, -1).map(function (x) { return x.trim(); }); }
function glossaryFillMode() {
  var lines = read(GLOSSARY).split("\n"), d = loadDicts(read(I18N_DIR + "site.js")), t = glossaryTables(lines), changed = 0;
  function fill(name, before, get) {
    var i = t[name];
    if (i === undefined) { say("NO-TABLE", name); return; }
    var hdr = cellsOf(lines[i]);
    var at = hdr.indexOf(KU);
    var enCol = hdr.findIndex(function (h) { return /^en\b/.test(h); });
    if (at < 0) {
      at = before ? hdr.indexOf(before) : hdr.length;
      if (at < 0) { say("NO-COLUMN", name, before); return; }
      for (var j = i; j < lines.length && /^\|/.test(lines[j]); j++) {
        var parts = lines[j].split("|");
        var add = j === i ? [" ku ", " ckb "] : (j === i + 1 ? [" --- ", " --- "] : [" ", " "]);
        parts.splice(at + 1, 0, add[0], add[1]);
        lines[j] = parts.join("|");
      }
    }
    for (var r = i + 2; r < lines.length && /^\|/.test(lines[r]); r++) {
      var ps = lines[r].split("|"), cells = cellsOf(lines[r]);
      KUR.forEach(function (L, li) {
        var v = get(cells, L, li, enCol >= 0 ? cells[enCol] : "");
        if (v === undefined) return;
        var want = " " + v + " ";
        if (ps[at + 1 + li] !== want) { ps[at + 1 + li] = want; changed++; }
      });
      lines[r] = ps.join("|");
    }
  }
  fill("b", null, function (c, L) { return d.site[L] ? d.site[L]["nav." + c[0]] : undefined; });
  fill("c", "Confidence", function (c, L, li) { var row = TERMS.filter(function (x) { return String(x[0]) === c[0]; })[0]; return row ? row[2 + li] : undefined; });
  fill("d", "Note", function (c, L, li) { var nm = NAMES[c[0].split(/[ /]/)[0]]; return nm ? nm[li] : undefined; });
  fill("f", null, function (c, L, li, enCell) {
    if (!d.common[L]) return undefined;
    var glyph = (/^[^\p{L}\p{N}]*/u.exec(enCell) || [""])[0];
    if (/^common\.speed\.1 /.test(c[0])) return d.common[L]["speed.1"] + " … " + d.common[L]["speed.10"];
    var m = /^common\.([A-Za-z0-9]+)$/.exec(c[0]);
    return m && d.common[L][m[1]] !== undefined ? glyph + d.common[L][m[1]] : undefined;
  });
  fs.writeFileSync(GLOSSARY, lines.join("\n"));
  console.log("GLOSSARY-FILL cells=" + changed);
  finish("GLOSSARY-FILL");
}
function glossaryMode(args) {
  var skipSupp = args.indexOf("--no-supp") !== -1;
  var g = read(GLOSSARY), lines = g.split("\n"), t = glossaryTables(lines), d = loadDicts(read(I18N_DIR + "site.js"));
  function rows(name) { var out = [], i = t[name]; if (i === undefined) return out; for (var r = i; r < lines.length && /^\|/.test(lines[r]); r++) out.push(cellsOf(lines[r])); return out; }
  ["b", "c", "d", "f"].forEach(function (name) {
    var R = rows(name);
    if (!R.length) { say("NO-TABLE", name); return; }
    var ck = R[0].indexOf(KU), cc = R[0].indexOf(CKB);
    if (ck < 0 || cc !== ck + 1) { say("NO-KU-COLUMNS", name, "(ku then ckb)"); return; }
    if (name === "c" && R[0][cc + 1] !== "Confidence") say("COLUMN-ORDER", "c", "ku, ckb directly before Confidence");
    if (name === "d" && R[0][cc + 1] !== "Note") say("COLUMN-ORDER", "d", "ku, ckb directly before Note");
    var n = 0;
    R.slice(2).forEach(function (r) {
      n++;
      if (!r[ck] || !r[cc]) { say("CELL-EMPTY", name, r[0]); return; }
      kuLetterFindings(name + "." + r[0], r[ck], r.join(" ")).forEach(function (x) { say("GLOSSARY-" + x); });
      ckbLetterFindings(name + "." + r[0], r[cc]).concat(ckbOrthoFindings(name + "." + r[0], r[cc])).forEach(function (x) { say("GLOSSARY-" + x); });
      if (name === "b") KUR.forEach(function (L, li) { if (d.site[L] && r[ck + li] !== d.site[L]["nav." + r[0]]) say("GLOSSARY-DRIFT b", r[0], L); });
    });
    var want = { b: 16, c: 53, d: 14, f: 9 }[name];
    if (n !== want) say("ROWS", name, n, "want", want);
    var sectionText = g.split(new RegExp("^## \\(" + name + "\\)", "m"))[1] || "";
    if (sectionText.split(/^## /m)[0].indexOf(TASK) === -1) say("NO-TASK-ID", "(" + name + ")");
  });
  if (!/^\| Kurmanji Kurdish \(ku\) `\[ASSUMED\]` \|/m.test(g)) say("TONE-ROW-MISSING", "ku");
  if (!/^\| Sorani Kurdish \(ckb\) `\[ASSUMED\]` \|/m.test(g)) say("TONE-ROW-MISSING", "ckb");
  if (g.indexOf("**Kurmanji Kurdish (ku) `[ASSUMED]`:**") === -1) say("ENTRY-MISSING", "ku");
  if (g.indexOf("**Sorani Kurdish (ckb) `[ASSUMED]`:**") === -1) say("ENTRY-MISSING", "ckb");
  if (/\btwenty-seven\b/i.test(g)) say("STALE-COUNT", GLOSSARY);
  var se = (g.split(/^## \(e\)/m)[1] || "").split(/^## /m)[0];
  if ((se.match(/\btwenty-nine\b/gi) || []).length < 2) say("E-COUNT", "(e) states twenty-nine twice");
  if (se.indexOf("Kurmanji Kurdish and Sorani Kurdish (added 2026-10-08 by quick task " + TASK + ")") === -1) say("E-SENTENCE-MISSING");
  if (!skipSupp) {
    var m = /^### Kurdish supplementary terms[^\n]*\n([\s\S]*?)(?=^#{2,3} )/m.exec(g);
    if (!m) say("SUPPLEMENTARY-TABLE-MISSING");
    else {
      var R = m[1].split("\n").filter(function (l) { return /^\|/.test(l); }).map(cellsOf), cat = loadAll();
      var h = R[0] || [], ck = h.indexOf(KU), cc = h.indexOf(CKB), cn = h.indexOf("Namespaces");
      if (ck < 0 || cc < 0 || cn < 0) say("SUPP-COLUMNS", "want | Term (en) | ku | ckb | Namespaces | Confidence |", JSON.stringify(h));
      else R.slice(2).forEach(function (r) {
        r[cn].split(/,\s*/).filter(Boolean).forEach(function (ns) {
          KUR.forEach(function (L, li) {
            if (!cat[ns] || !cat[ns][L]) { say("SUPP-NS", r[0], ns, L); return; }
            var blob = JSON.stringify(cat[ns][L]).toLowerCase(), term = String(r[ck + li]).toLowerCase();
            if (blob.indexOf(term) === -1) say("SUPP-NOT-FOUND", L, JSON.stringify(r[ck + li]), "in", ns);
          });
        });
      });
      if (R.length < 22) say("SUPP-SHORT", R.length - 2, "rows (want 20 or more)");
    }
  }
  finish("GLOSSARY-KU");
}

/* ---------- pagecode / config ---------- */

var RTL_SUBS = [["Hebrew, Arabic and Sorani Kurdish", "Hebrew and Arabic"], ["Hebrew, Arabic or Sorani Kurdish", "Hebrew or Arabic"]];
var JOIN_SUBS = {
  "assets/site.css": [
    ["/* The Arabic script is cursive (Arabic and Sorani Kurdish): a non-zero letter-spacing can break its letter joining", "/* Arabic is cursive: a non-zero letter-spacing can break its letter joining"],
    [":root[lang=\"ar\"] h1, :root[lang=\"ckb\"] h1{ letter-spacing: normal; }", ":root[lang=\"ar\"] h1{ letter-spacing: normal; }"]],
  "Fermats Method/fermats-method.html": [
    ["/* The Arabic script is cursive (Arabic and Sorani Kurdish): a non-zero letter-spacing can break its letter joining in some engines. */", "/* Arabic is cursive: a non-zero letter-spacing can break its letter joining in some engines. */"],
    [":root[lang=\"ar\"] .result, :root[lang=\"ckb\"] .result{ letter-spacing: normal; }", ":root[lang=\"ar\"] .result{ letter-spacing: normal; }"]]
};
function inComments(text, phrase) {
  var spans = [], m, re = /\/\*[\s\S]*?\*\//g;
  while ((m = re.exec(text))) spans.push([m.index, m.index + m[0].length]);
  for (var i = text.indexOf(phrase); i !== -1; i = text.indexOf(phrase, i + 1)) {
    if (!spans.some(function (s) { return i >= s[0] && i < s[1]; })) return false;
  }
  return true;
}
function pagecodeMode() {
  var re = new RegExp("^([ \\t]*)<option value=\"zgh-Tfng\" lang=\"zgh-Tfng\">([^<]*)<\\/option>\\n([ \\t]*)<option value=\"ku\" lang=\"ku\">" + KU_AUTONYM +
    "<\\/option>\\n([ \\t]*)<option value=\"ckb\" lang=\"ckb\">" + CKB_AUTONYM + "<\\/option>\\n", "m");
  var files = git(["ls-files", "*.html", "assets"]).trim().split("\n").filter(function (f) { return !/^assets\/i18n\//.test(f) && f !== "assets/nt-i18n.js"; });
  var pages = 0;
  files.forEach(function (f) {
    var o = showBase(f), n = read(f), s = n;
    if (/\.html$/.test(f)) {
      pages++;
      var m = re.exec(n);
      if (!m) { say("SWITCHER-LINES-MISSING", f); return; }
      if (m[1] !== m[3] || m[1] !== m[4]) say("SWITCHER-INDENT", f);
      s = s.replace(re, function (all, i1, lab) { return i1 + "<option value=\"zgh-Tfng\" lang=\"zgh-Tfng\">" + lab + "</option>\n"; });
    }
    RTL_SUBS.forEach(function (p) {
      if (s.indexOf(p[0]) !== -1 && !inComments(s, p[0])) say("RTL-WORDING-OUTSIDE-COMMENT", f);
      s = s.split(p[0]).join(p[1]);
    });
    (JOIN_SUBS[f] || []).forEach(function (p) {
      if (n.indexOf(p[0]) === -1) say("JOIN-RULE-MISSING", f, JSON.stringify(p[0]).slice(0, 70));
      s = s.split(p[0]).join(p[1]);
    });
    if (/\.(html|css)$/.test(f) && /Hebrew and Arabic|Hebrew or Arabic|Arabic is cursive/.test(n)) say("STALE-RTL-COMMENT", f);
    if (s !== o) say("CODE-CHANGED", f);
  });
  if (/@font-face|fonts\.googleapis\.com\/css2\?[^"]*Arabic/i.test(read("assets/site.css"))) say("FONT-ADDED", "assets/site.css");
  console.log("PAGE-CODE files=" + files.length + " pages=" + pages);
  finish("PAGE-CODE");
}
function configMode() {
  fs.readdirSync(CONFIG_DIR).forEach(function (f) { if (read(CONFIG_DIR + f) !== showBase(CONFIG_DIR + f)) say("CONFIG-CHANGED", f); });
  finish("CONFIG");
}

/* ---------- unify ---------- */

function unifyMode(args) {
  var allow = {};
  for (var i = 0; i < args.length; i++) if (args[i] === "--allow") String(args[++i]).split(",").forEach(function (k) { allow[k] = true; });
  FORMULA_SAME.forEach(function (k) { allow[k] = true; });
  var cat = loadAll(), groups = {};
  Object.keys(cat).forEach(function (ns) {
    Object.keys(cat[ns].en).forEach(function (k) { var v = cat[ns].en[k]; if (typeof v === "string") (groups[v] = groups[v] || []).push(ns + "." + k); });
  });
  var divergent = 0, notes = 0;
  KUR.forEach(function (L) {
    Object.keys(groups).forEach(function (en) {
      var keys = groups[en].filter(function (id) { return !allow[id]; });
      if (keys.length < 2) return;
      var seen = {};
      keys.forEach(function (id) {
        var dot = id.indexOf("."), dd = cat[id.slice(0, dot)][L], v = dd && dd[id.slice(dot + 1)];
        if (v !== undefined) (seen[v] = seen[v] || []).push(id);
      });
      var renders = Object.keys(seen);
      if (renders.length < 2) return;
      var line = L + " " + JSON.stringify(en).slice(0, 60) + " -> " + renders.map(function (r) { return show(r) + " [" + seen[r].join(" ") + "]"; }).join(" | ");
      if ((en.match(/\p{L}{2,}/gu) || []).length >= 2) { divergent++; say("DIVERGENT", line); } else { notes++; console.log("NOTE", line); }
    });
  });
  console.log("UNIFY divergent=" + divergent + " notes=" + notes);
  finish("UNIFY");
}

/* ---------- docs ---------- */

var DOCS = ["CLAUDE.md", ".claude/CLAUDE.md", ".planning/PROJECT.md", ".planning/REQUIREMENTS.md", ".planning/codebase/STACK.md",
  ".planning/codebase/CONVENTIONS.md", ".planning/codebase/ARCHITECTURE.md", ".planning/codebase/CONCERNS.md",
  ".planning/codebase/STRUCTURE.md", ".planning/codebase/TESTING.md"];
function docsMode() {
  DOCS.concat([GLOSSARY]).concat(dataFiles().map(function (f) { return I18N_DIR + f; })).forEach(function (f) {
    if (/\btwenty-seven\b/i.test(read(f))) say("STALE-COUNT", f);
  });
  var rules = [
    ["Tamazight", /Kurmanji/, "Kurmanji named wherever Tamazight is"],
    ["Tamazight", /Sorani/, "Sorani named wherever Tamazight is"],
    ["script-tagged", /three-letter `ckb`/, "the plain three-letter `ckb` code shape next to the region- and script-tagged codes"],
    ["`tzm`", /`kmr`/, "the Kurdish detection rule wherever the Tamazight one is"],
    ["`tzm`", /`ku-Arab`/, "the Kurdish detection rule wherever the Tamazight one is"],
    ["`tzm`", /`sdh`/, "the unmapped Southern Kurdish tag wherever the Tamazight rule is"],
    ["right-to-left", /Sorani/, "Sorani Kurdish among the right-to-left languages"],
    ["SCRIPT_RULES", /ckb/, "the ckb script rule"],
    ["DIGIT-PARITY", /KU-LETTER/, "the KU-LETTER finding wherever the finding list is"],
    ["Persian/Urdu", /Sorani/, "the Sorani letter rule next to the Arabic one"],
    ["lang=\"ar\"", /lang="ckb"/, "the ckb letter-spacing reset next to the Arabic one"],
    ["Tamaziɣt", new RegExp(KU_AUTONYM), "the Kurmanji autonym"],
    ["Tamaziɣt", new RegExp(CKB_AUTONYM), "the Sorani autonym"]
  ];
  var banned = ["remain the only right-to-left languages", "Hebrew and Arabic are the right-to-left", "while either is active", "Hebrew or Arabic is active", "Hebrew and Arabic values wrap"];
  DOCS.forEach(function (f) {
    var o = showBase(f), n = read(f);
    if (/\btwenty-seven\b/i.test(o) && !/\btwenty-nine\b/i.test(n)) say("NO-COUNT", f);
    var sixteen = function (s) { return (s.match(/\b(?:16|sixteen)\b/gi) || []).length; };
    if (sixteen(o) !== sixteen(n)) say("SIXTEEN-CHANGED", f, sixteen(o), "->", sixteen(n));
    (n.match(/zgh-Latn(?:, |\/)zgh-Tfng(?![\w-]).{0,12}/g) || []).forEach(function (m) {
      if (!/^zgh-Latn(?:, zgh-Tfng, ku, ckb|\/zgh-Tfng\/ku\/ckb)/.test(m)) say("LIST-WITHOUT-KURDISH", f, JSON.stringify(m));
    });
    rules.forEach(function (r) { if (o.indexOf(r[0]) !== -1 && !r[1].test(n)) say("MISSING-KU-RULE", f, JSON.stringify(r[0]), "->", r[2]); });
    banned.forEach(function (b) { if (n.indexOf(b) !== -1) say("STALE-RTL", f, JSON.stringify(b)); });
  });
  [".planning/PROJECT.md", ".planning/REQUIREMENTS.md"].forEach(function (f) { if (read(f).indexOf(TASK) === -1) say("NO-TASK-ID", f); });
  finish("DOCS-KU");
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
  var r = cp.spawnSync("node", [".planning/phases/06-multi-language-support/i18n-browser.js", page, "--mode", "switch,layout"], { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
  var lines = ((r.stdout || "") + (r.stderr || "")).split("\n").filter(Boolean);
  var slugLine = lines.filter(function (l) { return /^I18N-BROWSER [a-z0-9-]+ /.test(l); })[0] || "";
  var slug = (/^I18N-BROWSER ([a-z0-9-]+) /.exec(slugLine) || [])[1] || "?";
  var switchPass = new RegExp("^I18N-BROWSER " + slug + " switch PASS points=[0-9]+ langs=" + nonEn + "$");
  var layoutPass = new RegExp("^I18N-BROWSER " + slug + " layout PASS$");
  var known = KNOWN_SWITCH_LINES[slug];
  var gated = lines.filter(function (l) { return /^(I18N-BROWSER|LAYOUT-OVERFLOW|UNTRANSLATED)/.test(l); });
  var knownCount = known ? gated.filter(function (l) { return known.test(l); }).length : 0;
  var unexpected = gated.filter(function (l) { return !switchPass.test(l) && !layoutPass.test(l) && !(known && known.test(l)); });
  var hasSwitch = gated.some(function (l) { return switchPass.test(l); }), hasLayout = gated.some(function (l) { return layoutPass.test(l); });
  var ok = hasLayout && unexpected.length === 0 && (known ? (hasSwitch || knownCount === nonEn) : (hasSwitch && r.status === 0));
  return { ok: ok, lines: lines, status: r.status, knownCount: knownCount, unexpected: unexpected, hasLayout: hasLayout, hasSwitch: hasSwitch, known: !!known };
}
function sweepMode(pages) {
  var nonEn = require(CHECK_PATH).LANG_CODES.length - 1;
  if (nonEn !== 28) say("LANG-COUNT", "expected 28 non-English languages, LANG_CODES gives", nonEn);
  if (!pages.length) say("NO-PAGES");
  var slot = acquireSlot();
  try {
    pages.forEach(function (page) {
      var t0 = Date.now(), res = sweepPage(page, nonEn);
      if (!res.ok) { console.log("SWEEP-RETRY " + page + " (first run: status " + res.status + ", unexpected " + res.unexpected.length + ")"); res = sweepPage(page, nonEn); }
      res.lines.forEach(function (l) { console.log(l.slice(0, 200)); });
      console.log("SWEEP " + page + " " + (res.ok ? "OK" : "FAIL") + " known=" + res.knownCount + " " + Math.round((Date.now() - t0) / 1000) + "s");
      if (!res.ok) say("SWEEP-FAIL", page, "status=" + res.status, "layoutPass=" + res.hasLayout, "switchPass=" + res.hasSwitch, res.known ? "knownLines=" + res.knownCount + "/" + nonEn : "", res.unexpected.slice(0, 5).join(" | ").slice(0, 400));
    });
  } finally { try { fs.unlinkSync(slot); } catch (e) { /* ignore */ } }
  finish("SWEEP");
}

/* ---------- dump / font / main ---------- */

function dumpMode(f) {
  var d = loadDicts(read(I18N_DIR + f));
  Object.keys(d).forEach(function (ns) {
    Object.keys(d[ns].en).forEach(function (k) {
      console.log(ns + "." + k);
      ["en", "he", "ar", KU, CKB].forEach(function (L) { if (d[ns][L]) console.log("  " + L + " " + show(d[ns][L][k])); });
    });
  });
}
function fontMode() {
  var fams = null;
  CKB_CPS.forEach(function (c) {
    var out = "";
    try { out = cp.execSync("fc-list ':charset=" + c.toString(16) + "' family 2>/dev/null || true", { encoding: "utf8" }); } catch (e) { out = ""; }
    var set = {};
    out.split("\n").filter(Boolean).forEach(function (l) { set[l.split(",")[0].trim()] = true; });
    fams = fams === null ? set : Object.keys(fams).reduce(function (a, k) { if (set[k]) a[k] = true; return a; }, {});
  });
  var list = Object.keys(fams || {}).sort();
  console.log("FONT sorani=" + (list.length ? "present " + list.join("; ") : "absent"));
}

var mode = process.argv[2], rest = process.argv.slice(3);
if (mode === "selftest") selftestMode();
else if (mode === "engine") engineMode();
else if (mode === "checker") checkerMode();
else if (mode === "emit") {
  var res = emitDraft(I18N_DIR, JSON.parse(read(rest[0])));
  res.written.forEach(function (w) { console.log("EMIT " + w); });
  res.errors.forEach(function (e) { say(e); });
  finish("EMIT");
}
else if (mode === "extract") {
  var js = JSON.stringify(extractDraft(I18N_DIR + rest[0]), null, 2);
  if (rest[1]) fs.writeFileSync(rest[1], js + "\n"); else console.log(js);
}
else if (mode === "batch") batchMode(rest);
else if (mode === "pinned") pinnedMode();
else if (mode === "terms") termsMode();
else if (mode === "glossary-fill") glossaryFillMode();
else if (mode === "glossary") glossaryMode(rest);
else if (mode === "pagecode") pagecodeMode();
else if (mode === "config") configMode();
else if (mode === "unify") unifyMode(rest);
else if (mode === "docs") docsMode();
else if (mode === "sweep") sweepMode(rest);
else if (mode === "dump") dumpMode(rest[0]);
else if (mode === "font") fontMode();
else { console.log("usage: ku-gate.js selftest|engine|checker|emit <draft.json>|extract <file> [out]|batch <files...>|pinned|terms|glossary-fill|glossary [--no-supp]|pagecode|config|unify [--allow ...]|docs|sweep <pages...>|dump <file>|font"); process.exit(2); }
