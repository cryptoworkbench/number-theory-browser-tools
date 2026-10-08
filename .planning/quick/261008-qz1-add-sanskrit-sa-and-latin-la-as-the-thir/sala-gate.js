#!/usr/bin/env node
/* sala-gate.js — plan-local gates for quick task 261008-qz1 (Sanskrit `sa`, Devanagari, left to right,
 * plurals { one, two, other } selected by the engine itself; Latin `la`, Latin script without macrons,
 * left to right, plurals { one, other } selected by the engine itself). Dev-only, never shipped, never
 * referenced by a page. Run from the repo root:
 *
 *   node .planning/quick/261008-qz1-add-sanskrit-sa-and-latin-la-as-the-thir/sala-gate.js <mode> [args...]
 *
 * Modes (each gate prints "<NAME> bad=<n>" and exits 1 when n > 0):
 *   selftest          SELFTEST: the gate's own letter, orthography and punctuation rules against CASES, the
 *                     emit/extract round trip, and every pinned TOOLS/COMMON/TERMS/ALSO/NAMES/TITLES string
 *                     checked against the gate's own rules.
 *   engine            ENGINE-SALA: assets/nt-i18n.js behaviour for both codes (exact case-sensitive allow-list,
 *                     two-letter detection and its recorded collisions, no dir attribute, the fixed plural
 *                     rules with the real Intl, a Russian-like stub Intl and no Intl) plus ENGINE-CODE: only
 *                     the pinned edits differ from BASE.
 *   checker           CHECKER-SALA: i18n-check.js tables, exports and findings for both codes, including
 *                     agreement with this gate's letter rules on every shipped value.
 *   emit <draft.json> EMIT: writes the sa and la blocks of every namespace in the draft (shape
 *                     {"<ns>": {"sa": {...}, "la": {...}}}) into its data file as the last two language
 *                     blocks (after ckb), in en key order. Validates key set, plural shape (sa one/two/other,
 *                     la one/other) and placeholders first and writes nothing for a bad namespace. Any bidi
 *                     isolate marker or invisible character is an error (both languages are left to right).
 *   extract <file> [out.json]  the sa/la blocks of a data file as a draft.
 *   batch <files...>  SALA-BATCH over assets/i18n/<file>: existing languages unchanged from BASE, sa then la
 *                     last and complete, plural shape, header count word, the per-language rules (see
 *                     batchMode), plus CHECKER (i18n-check.js's own findings for every sa/la value).
 *   pinned            PINNED: site.js sa/la site and common values equal TOOLS and COMMON.
 *   terms             prints TOOLS, COMMON, TERMS, ALSO, NAMES and TITLES (the plan's pinned vocabulary).
 *   pinned-draft <out.json>  writes the emit draft of the site and common namespaces (exactly TOOLS and COMMON).
 *   glossary-fill     adds the sa and la columns to 06-GLOSSARY.md (b), (c), (d), (f) and fills them from
 *                     site.js, TERMS and NAMES (existing cells untouched).
 *   glossary [--no-supp]  GLOSSARY-SALA: tone rows, entries, columns, (e), supplementary table.
 *   pagecode          PAGE-CODE: page/asset code unchanged from BASE apart from the two option lines per page.
 *   config            CONFIG: i18n-config/*.json byte-identical to BASE.
 *   unify [--allow ns.key,...]  UNIFY: one rendering per repeated English value, per language.
 *   docs              DOCS-SALA: the ten living docs at thirty-one languages.
 *   sweep <pages...>  SWEEP: i18n-browser.js --mode switch,layout per page (langs=30), holding one of the two
 *                     machine-wide lock slots shared with cjk-gate.js, id-gate.js, zgh-gate.js and ku-gate.js,
 *                     with TMPDIR inside CACHE (off the /tmp tmpfs), removed after each page. Run in background.
 *   shot <page> <lang> <W>x<H> <out.png> [--menu]  one headless-Chrome screenshot with a reused profile and
 *                     TMPDIR inside CACHE; --menu captures a scratch copy (in CACHE) whose header has the
 *                     Tools menu open. <out.png> must be outside the repository.
 *   dump <file>       en, hi, sa, la per key.
 *   font              which installed fonts cover the Sanskrit Devanagari repertoire.
 *
 * BASE defaults to fde43bd (HEAD when this task was planned); override with SALA_GATE_BASE=<rev>. CACHE
 * defaults to ~/.cache/sala-gate-qz1; override with SALA_TMP=<dir>. This source holds no raw invisible
 * character and no backslash-u escape: special characters are built from code points.
 */
"use strict";

var fs = require("fs");
var vm = require("vm");
var os = require("os");
var cp = require("child_process");
var path = require("path");

var BASE = process.env.SALA_GATE_BASE || "fde43bd";
var TASK = "261008-qz1";
var SA = "sa", LA = "la", SALA = [SA, LA];
var I18N_DIR = "assets/i18n/";
var CHECK_PATH = path.resolve(process.cwd(), ".planning/phases/06-multi-language-support/i18n-check.js");
var GLOSSARY = ".planning/phases/06-multi-language-support/06-GLOSSARY.md";
var CONFIG_DIR = ".planning/phases/06-multi-language-support/i18n-config/";
var CACHE = process.env.SALA_TMP || path.join(os.homedir(), ".cache", "sala-gate-qz1");

function U(c) { return String.fromCodePoint(c); }
function hex4(c) { return ("0000" + c.toString(16)).slice(-4); }
function range(a, b) { var out = []; for (var c = a; c <= b; c++) out.push(c); return out; }
var BS = String.fromCharCode(92);
var LRI = U(0x2066), RLI = U(0x2067), FSI = U(0x2068), PDI = U(0x2069);
var MARKERS = { "<LRI>": LRI, "<RLI>": RLI, "<FSI>": FSI, "<PDI>": PDI };
function rangeClass(ranges) { return "[" + ranges.map(function (r) { return U(r[0]) + "-" + U(r[1]); }).join("") + "]"; }
// Invisible format characters (bidi isolates included): neither language may carry any of them.
var INVISIBLE_RANGES = [[0x200B, 0x200F], [0x2028, 0x202E], [0x2060, 0x206F], [0xFEFF, 0xFEFF]];
var INVISIBLE_RE = new RegExp(rangeClass(INVISIBLE_RANGES));
var INVISIBLE_G = new RegExp(rangeClass(INVISIBLE_RANGES), "g");
var PHI = U(0x3C6);

/* ---------- alphabets ---------- */

// Sanskrit: the Devanagari repertoire of Classical Sanskrit: anusvara, visarga, the vowels a..lr (incl. the
// vocalic r, rr, l, ll), e, ai, o, au, the consonants ka..ha without nukta letters, nnna, rra, lla and llla,
// avagraha, the vowel signs aa..rr, e, ai, o, au, the virama and the vocalic signs l, ll.
var SA_CPS = [0x902, 0x903].concat(range(0x905, 0x90C), [0x90F, 0x910, 0x913, 0x914], range(0x915, 0x928),
  range(0x92A, 0x930), [0x932], range(0x935, 0x939), [0x93D], range(0x93E, 0x944), [0x947, 0x948, 0x94B, 0x94C, 0x94D],
  range(0x960, 0x963));
var SA_OK = {};
SA_CPS.forEach(function (c) { SA_OK[U(c)] = true; });
var DANDA = U(0x964), DDANDA = U(0x965);
SA_OK[DANDA] = true; SA_OK[DDANDA] = true;
var SA_FIX = {};
SA_FIX[0x93C] = "Sanskrit has no nukta: write the plain letter (pha, ja, da)";
range(0x958, 0x95F).forEach(function (c) { SA_FIX[c] = "a nukta letter is Hindi/Urdu spelling: write the plain letter"; });
[0x911, 0x949, 0x912, 0x94A].forEach(function (c) { SA_FIX[c] = "Sanskrit has no candra or short o: write U+0913 / U+094B"; });
[0x90D, 0x945, 0x90E, 0x946].forEach(function (c) { SA_FIX[c] = "Sanskrit has no candra or short e: write U+090F / U+0947"; });
SA_FIX[0x901] = "candrabindu is Hindi spelling here: write the anusvara U+0902 or the class nasal";
SA_FIX[0x933] = "Classical Sanskrit writes U+0932";
SA_FIX[0x950] = "write the word, not the om sign";
SA_FIX[0x970] = "no abbreviation sign: write the word in full";
range(0x951, 0x954).forEach(function (c) { SA_FIX[c] = "no Vedic accent marks"; });
var DANDA_BAD_RE = new RegExp("\\s[" + DANDA + DDANDA + "]|[" + DANDA + DDANDA + "](?![\\s{]|$)");
// Stops (ka..bha without the nasals): inside a word a nasal before them is the class nasal, never anusvara.
var SA_STOPS = [0x915, 0x916, 0x917, 0x918, 0x91A, 0x91B, 0x91C, 0x91D, 0x91F, 0x920, 0x921, 0x922, 0x924, 0x925,
  0x926, 0x927, 0x92A, 0x92B, 0x92C, 0x92D].map(U).join("");
var ANUSVARA = U(0x902), VIRAMA = U(0x94D), VISARGA = U(0x903);
var SA_ANUSVARA_RE = new RegExp(ANUSVARA + "[" + SA_STOPS + "]");
var SA_CONS = rangeClass([[0x915, 0x939]]);
var SA_FINAL_M_RE = new RegExp(U(0x92E) + VIRAMA + " " + SA_CONS);
var SA_AUTONYM = "संस्कृतम्";
var LA_AUTONYM = "Latina";

// Latin tokens every non-Latin-script value may keep (= i18n-check.js SCRIPT_LATIN_NOTATION).
var NOTATION = ["AES", "Alice", "BigInt", "Blowfish", "Bob", "CRT", "DH", "DSA", "Eve", "Fibonacci", "Fourier",
  "Garner", "Hasse", "OAEP", "PDF", "PNG", "QFT", "RSA", "SVG", "aB", "aG", "bA", "bG", "dP", "dQ", "gcd", "kG",
  "lcm", "log", "mod", "pointAdd", "qInv", "scalarMul"];
var LA_KEEP = NOTATION.concat(["Delete", "Enter", "Space", "ms"]);
var LA_KEEP_SET = {};
LA_KEEP.forEach(function (w) { LA_KEEP_SET[w] = true; });
var KEY_NAMES = { sa: ["एण्टर", "स्पेस", "डिलीट"], la: ["Delete", "Enter", "Space"] };
var KEY_NAME_KEYS = ["venn.picker.hint"];
var FORMULA_SAME = ["cayley.equationCaption", "rsa.lblQInv", "sqm.stepSquareFormula", "sqm.stepMultiplyFormula"];
// Keys whose English term is itself the Latin word (all are allowSame keys of the page configs).
var LA_SAME_OK = ["cayley.nLabel", "wheel.nLabel", "wheel.nRangeLabel", "crt.modulusLabel", "sqm.modLabel", "dh.gLabel"];

/* ---------- pinned vocabulary (the plan's D-TOOLS, D-COMMON, D-TERMS, D-NAMES, D-TITLES) ---------- */

var TOOLS = {
  sa: { brand: "सङ्ख्यासिद्धान्तस्य साधनानि", "nav.label": "साधनानि", menu: "साधनानि", "nav.home": "मुखपृष्ठम्",
    "nav.sieve": "एरातोस्थेनीस-चालनी", "nav.factorTree": "गुणनखण्डवृक्षः", "nav.venn": "वेन-आरेखः",
    "nav.euclid": "यूक्लिड-कलनविधिः", "nav.crt": "चीनीयशेषप्रमेयम्", "nav.wheel": "तुल्यताचक्रम्",
    "nav.totient": "ओयलरस्य φ फलनम्", "nav.cayley": "केली-सारणी", "nav.iso": "समूहसमरूपता",
    "nav.sqm": "वर्गकरणं गुणनं च", "nav.dh": "डिफी-हेलमन", "nav.ecdh": "दीर्घवृत्तीयवक्र-DH",
    "nav.rsa": "RSA", "nav.fermat": "फर्मा-विधिः", "nav.shor": "शोर-कलनविधिः", "lang.label": "भाषा",
    "theme.toggle": "दिनरात्रिप्रकारं परिवर्तयतु" },
  la: { brand: "Instrumenta theoriae numerorum", "nav.label": "Instrumenta", menu: "Instrumenta",
    "nav.home": "Pagina prima", "nav.sieve": "Cribrum Eratosthenis", "nav.factorTree": "Arbor factorum",
    "nav.venn": "Diagramma Vennianum", "nav.euclid": "Algorithmus Euclideus", "nav.crt": "Theorema Sinicum de residuis",
    "nav.wheel": "Rota aequivalentiae", "nav.totient": "Functio φ Euleri", "nav.cayley": "Tabula Cayleiana",
    "nav.iso": "Isomorphismus gregum", "nav.sqm": "Quadratio et multiplicatio", "nav.dh": "Diffie-Hellman",
    "nav.ecdh": "DH in curvis ellipticis", "nav.rsa": "RSA", "nav.fermat": "Methodus Fermatiana",
    "nav.shor": "Algorithmus Shorianus", "lang.label": "Lingua", "theme.toggle": "Inter modum diurnum et nocturnum muta" }
};
var COMMON = {
  sa: { play: "चालनम्", pause: "विरामः", step: "पदम्", instant: "तत्क्षणम्", reset: "पुनःस्थापनम्", speed: "वेगः",
    "speed.1": "हिमनदीवत्", "speed.2": "मन्दः", "speed.3": "मृदुः", "speed.4": "चपलः", "speed.5": "स्थिरः",
    "speed.6": "क्षिप्रः", "speed.7": "द्रुतः", "speed.8": "त्वरितः", "speed.9": "विद्युद्वत्", "speed.10": "प्रायः तात्क्षणिकः",
    additiveGroups: "योगात्मकसमूहाः", multiplicativeGroups: "गुणनात्मकसमूहाः",
    paletteEmptySieve: "अस्मिन् फलके अभाज्यसङ्ख्याः योजयितुं \"{0}\" इति साधनम् उपयोजयतु।",
    primePickerOpen: "फलकात् एकाम् अभाज्यसङ्ख्यां चिनोतु", primePickerHeading: "अभाज्यसङ्ख्यां चिनोतु",
    undoPalette: "फलकपरिवर्तनं निवर्तयतु", redoPalette: "फलकपरिवर्तनं पुनः करोतु",
    undoWork: "निवर्तयतु", redoWork: "पुनः करोतु" },
  la: { play: "Perge", pause: "Intermitte", step: "Gradus", instant: "Statim", reset: "Restitue", speed: "Celeritas",
    "speed.1": "glacialis", "speed.2": "lenta", "speed.3": "placida", "speed.4": "alacris", "speed.5": "constans",
    "speed.6": "velox", "speed.7": "celeris", "speed.8": "rapida", "speed.9": "fulminea", "speed.10": "paene statim",
    additiveGroups: "Greges additivi", multiplicativeGroups: "Greges multiplicativi",
    paletteEmptySieve: "Instrumento «{0}» utere ut numeros primos huic tabellae addas.",
    primePickerOpen: "Numerum primum e tabella elige", primePickerHeading: "Numerum primum elige",
    undoPalette: "Mutationem tabellae rescinde", redoPalette: "Mutationem tabellae repete",
    undoWork: "Rescinde", redoWork: "Repete" }
};
// D-TERMS: [row, English, sa, la] for 06-GLOSSARY.md (c).
var TERMS = [
  [1, "prime", "अभाज्यसङ्ख्या, अभाज्यसङ्ख्याः", "numerus primus, numeri primi"],
  [2, "composite", "संयुक्तसङ्ख्या", "numerus compositus"],
  [3, "factor", "गुणनखण्डः, गुणनखण्डाः", "factor, factores"],
  [4, "prime factorization", "अभाज्यगुणनखण्डनम्", "resolutio in factores primos"],
  [5, "divisor", "भाजकः", "divisor"],
  [6, "greatest common divisor", "महत्तमसमापवर्तकः", "divisor communis maximus"],
  [7, "least common multiple", "लघुत्तमसमापवर्त्यम्", "minimum commune multiplum"],
  [8, "quotient", "लब्धिः", "quotiens"],
  [9, "remainder", "शेषः", "residuum"],
  [10, "modulus", "मापाङ्कः", "modulus"],
  [11, "residue", "मापाङ्कीयशेषः", "residuum modulare"],
  [12, "congruence / congruent", "सर्वाङ्गसमता / सर्वाङ्गसमः", "congruentia / congruus"],
  [13, "equivalence class", "तुल्यतावर्गः", "classis aequivalentiae"],
  [14, "modular inverse", "मापाङ्कीयप्रतिलोमः", "inversum modulare"],
  [15, "coprime", "सहाभाज्य (परस्परम् अभाज्य)", "inter se primi"],
  [16, "totient", "ओयलरस्य φ फलनम्", "functio φ Euleri"],
  [17, "group", "समूहः, समूहाः", "grex, greges"],
  [18, "additive group", "योगात्मकसमूहः", "grex additivus"],
  [19, "multiplicative group", "गुणनात्मकसमूहः", "grex multiplicativus"],
  [20, "unit", "एककम्, एककानि", "unitas, unitates"],
  [21, "identity element", "तत्समकावयवः", "elementum neutrum"],
  [22, "inverse", "प्रतिलोमः", "inversum"],
  [23, "order of an element", "अवयवस्य कोटिः", "ordo elementi"],
  [24, "generator / primitive root", "जनकः / आदिममूलम्", "generator / radix primitiva"],
  [25, "cyclic group", "चक्रीयसमूहः", "grex cyclicus"],
  [26, "isomorphism", "समरूपता", "isomorphismus"],
  [27, "operation table", "सङ्क्रियासारणी (केली-सारणी)", "tabula operationis (tabula Cayleiana)"],
  [28, "commutative", "क्रमविनिमेयः", "commutativus"],
  [29, "perfect square", "पूर्णवर्गः", "quadratum perfectum"],
  [30, "factorization method", "गुणनखण्डनविधिः", "methodus resolutionis in factores"],
  [31, "exponent", "घाताङ्कः", "exponens"],
  [32, "base", "आधारः", "basis"],
  [33, "modular exponentiation", "मापाङ्कीयघातनम्", "potentiatio modularis"],
  [34, "binary expansion", "द्व्याधारिकविस्तारः", "expansio binaria"],
  [35, "square / multiply step", "वर्गकरणपदम् / गुणनपदम्", "gradus quadrandi / gradus multiplicandi"],
  [36, "public key", "सार्वजनिककुञ्जिका", "clavis publica"],
  [37, "private key", "निजकुञ्जिका", "clavis privata"],
  [38, "key pair", "कुञ्जिकायुग्मम्", "par clavium"],
  [39, "shared secret", "साधारणरहस्यम्", "secretum commune"],
  [40, "encrypt", "कूटलेखनम्", "cryptare (cryptatio)"],
  [41, "decrypt", "विकूटनम्", "decryptare (decryptatio)"],
  [42, "plaintext", "मूलपाठः", "textus apertus"],
  [43, "ciphertext", "कूटपाठः", "textus cryptatus"],
  [44, "discrete logarithm", "विविक्तलघुगणकः", "logarithmus discretus"],
  [45, "brute force", "सर्वपरीक्षणम्", "vis bruta"],
  [46, "elliptic curve", "दीर्घवृत्तीयवक्रः", "curva elliptica"],
  [47, "point at infinity", "अनन्तस्थबिन्दुः", "punctum ad infinitum"],
  [48, "scalar multiplication", "अदिशगुणनम्", "multiplicatio scalaris"],
  [49, "order finding", "कोटिनिर्धारणम्", "inventio ordinis"],
  [50, "period", "आवर्तः", "periodus"],
  [51, "preset / example", "उदाहरणम्", "exemplum"],
  [52, "step (playback)", "पदम्", "gradus"],
  [53, "playback", "चालनम्", "decursus"]
];
// D-TERMS "also" (pinned, not glossary (c) rows): [English, sa, la].
var ALSO = [
  ["theorem", "प्रमेयम्", "theorema"], ["algorithm", "कलनविधिः", "algorithmus"], ["palette", "फलकम्", "tabella"],
  ["region", "क्षेत्रम्", "regio"], ["circle", "वृत्तम्", "circulus"], ["wire", "तन्तुः", "filum"],
  ["quantum", "क्वाण्टम्", "quanticus"], ["whole number / integer", "पूर्णाङ्कः", "numerus integer"],
  ["point", "बिन्दुः", "punctum"], ["curve", "वक्रः", "curva"], ["diagram", "आरेखः", "diagramma"],
  ["tool", "साधनम्", "instrumentum"], ["tree", "वृक्षः", "arbor"], ["table", "सारणी", "tabula"], ["class", "वर्गः", "classis"],
  ["product", "गुणनफलम्", "productum"], ["sum", "योगफलम्", "summa"], ["random / Randomize", "यादृच्छिकम्", "fortuitus"],
  ["message", "सन्देशः", "nuntius"], ["bit", "द्व्यङ्कः", "bitus"], ["digit", "अङ्कः", "cifra"],
  ["browser", "जालदर्शकः", "navigatrum"], ["computer", "सङ्गणकः", "computatrum"], ["natural", "प्राकृत", "naturalis"],
  ["multiplication", "गुणनम्", "multiplicatio"], ["addition", "योगः", "additio"], ["division", "विभाजनम्", "divisio"],
  ["multiple", "गुणजः", "multiplum"], ["millisecond(s)", "मिलिसेकण्ड", "ms"], ["second(s)", "सेकण्ड", "secunda"],
  ["million / billion / trillion", "दशलक्ष / शतकोटि / लक्षकोटि", "milio / miliardum / billio"],
  ["hundreds / thousands", "शतशः / सहस्रशः", "centena / milia"], ["zero", "शून्यम्", "zerum"],
  ["fifteen", "पञ्चदश", "quindecim"], ["extended Euclidean algorithm", "विस्तृत-यूक्लिड-कलनविधिः", "algorithmus Euclideus extensus"]
];
// D-NAMES: 06-GLOSSARY.md (d) rows (first word of the "Proper noun" cell) and the other eponyms: [sa, la].
var NAMES = {
  Alice: ["Alice", "Alice"], Bob: ["Bob", "Bob"], Eve: ["Eve", "Eve"], RSA: ["RSA", "RSA"],
  "Diffie-Hellman": ["डिफी-हेलमन", "Diffie-Hellman"], Euler: ["ओयलर", "Eulerus (Euleri)"],
  Fermat: ["फर्मा", "Fermat (Fermatianus)"], Cayley: ["केली", "Cayley (Cayleianus)"], Venn: ["वेन", "Venn (Vennianus)"],
  Shor: ["शोर", "Shor (Shorianus)"], Euclid: ["यूक्लिड", "Euclides (Euclideus)"], Eratosthenes: ["एरातोस्थेनीस", "Eratosthenes"],
  "Bézout": ["बेजू", "Bézout"], Sun: ["सुन त्सु", "Sun Tzu"], ElGamal: ["एलगमाल", "ElGamal"],
  "Miller-Rabin": ["मिलर-राबिन", "Miller-Rabin"], Garner: ["गार्नर", "Garner"], Fourier: ["फूरिये", "Fourier"],
  Fibonacci: ["फिबोनाची", "Fibonacci"], Hasse: ["हासे", "Hasse"]
};
var TITLES = {
  sa: { "Diffie-Hellman Key Exchange": "डिफी-हेलमन कुञ्जिकाविनिमयः", "Elliptic Curve Diffie-Hellman": "दीर्घवृत्तीयवक्र-डिफी-हेलमन" },
  la: { "Diffie-Hellman Key Exchange": "Commutatio clavium Diffie-Hellman", "Elliptic Curve Diffie-Hellman": "Diffie-Hellman in curvis ellipticis" }
};
// D-AVOID: alternative spellings, Hindi forms and English loans (stem prefixes, case-insensitive).
var AVOID = {
  sa: ["एल्गोरि", "पैलेट", "क्लिक", "रीसेट", "मोड", "ब्राउज", "कंप्यूटर", "कम्प्यूटर", "क्रिप्टो", "प्लेबैक", "ब्रूट", "इकाई",
    "निजी", "साझा", "असतत", "तुल्याकारिता", "गुणात्मक", "शेषफल", "भागफल", "यूलर", "युक्लिड", "विज़ु", "एनिमेशन", "स्लाइडर"],
  la: ["gruppus", "gruppa", "caterva", "algoritm", "isomorfism", "idemfact", "functio phi", "cifrare", "decifrare",
    "encrypt", "palett", "tabula colorum", "numerus primarius", "computator", "computer", "browser", "slider"]
};
var EPONYM_LA = { Euclid: "Euclides / Euclideus", Euclidean: "Euclideus", Euler: "Eulerus / Euleri / Eulerianus" };
var EPONYM_LATIN_IN_SA = ["Fibonacci", "Fourier", "Garner", "Hasse", "Euclid", "Euler", "Fermat", "Cayley", "Venn",
  "Shor", "Diffie", "Hellman", "Eratosthenes", "Miller", "Rabin", "ElGamal", "Bézout"];
// Hindi grammar words that are not Sanskrit (postpositions, auxiliaries, Hindi pronouns and verb forms); ka and ke are
// left out because they are also Sanskrit interrogative pronouns.
var HINDI_WORDS = ["है", "हैं", "था", "थे", "थी", "की", "को", "में", "से", "ने", "और", "भी", "नहीं", "यह",
  "वह", "इस", "उस", "इसे", "उसे", "करें", "करना", "करके", "किया", "गया", "गई", "गए", "हुआ", "हुई", "लिए", "तक",
  "पर", "वाला", "वाले", "वाली", "कि", "क्या", "कैसे", "सकते", "सकता", "चाहिए", "रहा", "रहे", "रही", "दें", "चुनें",
  "देखें", "जब", "तब"];
var SA_IND = ["च", "वा", "इति", "न", "अपि", "एव", "यदि", "तदा", "अत्र", "तत्र", "यथा", "तथा", "सह", "विना", "प्रति", "इव"];
var LA_EN_HOMOGRAPHS = ["has", "prime", "private", "instant", "here", "it"];

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
function W(s) { return new RegExp("(?<![\\p{L}\\p{M}\\p{N}_])(?:" + s + ")(?![\\p{L}\\p{M}\\p{N}_])", "iu"); }
function Wcs(s) { return new RegExp("(?<![\\p{L}\\p{M}\\p{N}_])(?:" + s + ")(?![\\p{L}\\p{M}\\p{N}_])", "u"); }
function stem(s) { return new RegExp("(?<![\\p{L}\\p{M}\\p{N}_])" + s, "iu"); }
function stripPh(s) { return String(s == null ? "" : s).replace(/\{[A-Za-z0-9_]+\}/g, " "); }
function phs(s) { return (String(s).match(/\{[A-Za-z0-9_]+\}/g) || []).slice().sort(); }
function catsOf(L) { return L === SA ? ["one", "two", "other"] : ["one", "other"]; }
function formOf(v, ct) { return v == null ? undefined : (typeof v === "object" ? (ct in v ? v[ct] : v.other) : v); }
function words(s) { return String(s).match(/[\p{L}\p{M}]+/gu) || []; }
function show(v) { return v === undefined ? "-" : JSON.stringify(v); }
function loadChecker() { try { return require(CHECK_PATH); } catch (e) { say("CHECKER-LOAD", String(e.message).slice(0, 200)); return {}; } }
function mkdirp(d) { fs.mkdirSync(d, { recursive: true }); return d; }

/* ---------- per-language rules (the reference implementation the checker ports) ---------- */

// SA-LETTER / SA-DANDA: ported to i18n-check.js as saLetterFindings.
function saLetterFindings(id, value) {
  if (typeof value !== "string") return [];
  var f = [];
  var chars = Array.from(value);
  for (var i = 0; i < chars.length; i++) {
    var ch = chars[i];
    if (!/\p{scx=Devanagari}/u.test(ch) || /\p{Nd}/u.test(ch) || SA_OK[ch]) continue;
    var c = ch.codePointAt(0);
    f.push("SA-LETTER " + id + ".sa: " + JSON.stringify(ch) + " (U+" + hex4(c).toUpperCase() + ") is not in the Sanskrit Devanagari repertoire" + (SA_FIX[c] ? "; " + SA_FIX[c] : ""));
    break;
  }
  if (DANDA_BAD_RE.test(value)) f.push("SA-DANDA " + id + ".sa: a danda ends a prose sentence: no space before it, only a space, a placeholder or the end of the value after it, never inside a formula");
  return f;
}
// LA-LETTER / LA-J: ported to i18n-check.js as laLetterFindings.
function laLetterFindings(id, value, en) {
  if (typeof value !== "string") return [];
  var f = [];
  var enSet = {};
  Array.from(String(en == null ? "" : en)).forEach(function (ch) { enSet[ch] = true; });
  var chars = Array.from(value);
  for (var i = 0; i < chars.length; i++) {
    var ch = chars[i];
    if (!/\p{L}/u.test(ch) || /[A-Za-z]/.test(ch) || ch === PHI || enSet[ch]) continue;
    f.push("LA-LETTER " + id + ".la: " + JSON.stringify(ch) + " (U+" + hex4(ch.codePointAt(0)).toUpperCase() + ") is not an ASCII letter and not in the English value (no macrons, ligatures or accents)");
    break;
  }
  var enWords = {};
  (String(en == null ? "" : en).match(/[\p{L}\p{N}_]+/gu) || []).forEach(function (w) { enWords[w] = true; });
  var jw = (value.match(/[\p{L}\p{N}_]*[jJ][\p{L}\p{N}_]*/gu) || []).filter(function (w) { return !enWords[w]; });
  if (jw.length) f.push("LA-J " + id + ".la: " + JSON.stringify(jw[0]) + " (consonantal i is written i: iam, maior, eius)");
  return f;
}
// Gate-only Sanskrit orthography and punctuation.
function saOrthoFindings(id, value) {
  var f = [];
  if (typeof value !== "string") return f;
  var m = SA_ANUSVARA_RE.exec(value);
  if (m) f.push("SA-ANUSVARA " + id + ".sa: anusvara before a stop inside a word; write the class nasal with virama (as in the word for number, khanda, sambandha)");
  if (SA_FINAL_M_RE.test(value)) f.push("SA-FINAL-M " + id + ".sa: word-final m before a consonant-initial word is written as anusvara U+0902");
  if (new RegExp("[" + rangeClass([[0x900, 0x97F]]).slice(1, -1) + "]\\.(?!\\.)").test(value) || /[^.]\.$/.test(value) || value === ".") f.push("SA-FULLSTOP " + id + ".sa: a Sanskrit sentence ends with the danda U+0964, never with a full stop");
  if (new RegExp("[" + [0x2018, 0x2019, 0x201C, 0x201D, 0xAB, 0xBB, 0x201E, 0x27].map(U).join("") + "]").test(value)) f.push("QUOTE-STYLE " + id + ".sa: quote with ASCII double quotes only (D-PUNCT-SA)");
  if ((value.match(/"/g) || []).length % 2) f.push("QUOTE-STYLE " + id + ".sa: unbalanced ASCII double quotes");
  // An unbreakable Devanagari word (no space or hyphen) longer than 26 code points overflows narrow buttons, chips and
  // legends at 375px: split a long compound into a phrase or hyphenate it at a member boundary (D-COMPOUND-SA).
  var lw = words(value).filter(function (w) { return /\p{scx=Devanagari}/u.test(w) && Array.from(w).length > 26; });
  if (lw.length) f.push("SA-LONGWORD " + id + ".sa: " + JSON.stringify(lw[0]) + " (" + Array.from(lw[0]).length + " code points without a break; split or hyphenate the compound)");
  var hw = HINDI_WORDS.filter(function (w) { return Wcs(w).test(value); });
  if (hw.length) f.push("HINDI-WORD " + id + ".sa: " + hw.slice(0, 4).join(", ") + " (Hindi grammar words; write Sanskrit)");
  return f;
}
// Gate-only Latin orthography.
function laOrthoFindings(id, value, en) {
  var f = [];
  if (typeof value !== "string") return f;
  var s = stripPh(value);
  var uv = /(?<![\p{L}\p{N}_])[uU][aeiou]\p{L}*/u.exec(s);
  if (uv) f.push("LA-UV " + id + ".la: " + JSON.stringify(uv[0]) + " (consonantal u is written v: vel, videt, valor)");
  (s.match(/(?<![\p{L}\p{N}_])[IVXLCDM]{2,}(?![\p{L}\p{N}_])/g) || []).forEach(function (w) {
    if (!LA_KEEP_SET[w] && !Wcs(w).test(String(en))) f.push("LA-ROMAN " + id + ".la: " + JSON.stringify(w) + " (numerals stay digits; no Roman numerals)");
  });
  if (new RegExp("[" + [0x2018, 0x2019, 0x201C, 0x201D, 0x201E, 0x22, 0x27].map(U).join("") + "]").test(value)) f.push("QUOTE-STYLE " + id + ".la: quote with «…» only, no apostrophe (D-PUNCT-LA)");
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
function clean(s, errs, where) {
  var v = String(s);
  if (Object.keys(MARKERS).some(function (m) { return v.indexOf(m) !== -1; })) errs.push("EMIT-ISOLATE " + where + ": sa and la are left to right and take no isolate");
  var stray = INVISIBLE_RE.exec(v);
  if (stray) errs.push("EMIT-INVISIBLE " + where + ": raw U+" + hex4(stray[0].codePointAt(0)).toUpperCase());
  if (v !== v.normalize("NFC")) errs.push("EMIT-NFC " + where + ": not NFC");
  return v;
}
// emitDraft(dir, draft): writes sa/la blocks; returns { errors, written }.
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
    SALA.forEach(function (L) {
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
          var want = catsOf(L).slice().sort().join(",");
          if (!v || typeof v !== "object" || Object.keys(v).sort().join(",") !== want) { errs.push("EMIT-PLURAL " + where + ": expected { " + catsOf(L).join(", ") + " }"); return; }
          var o = {};
          catsOf(L).forEach(function (ct) { o[ct] = clean(v[ct], errs, where + "." + ct); });
          catsOf(L).filter(function (ct) { return ct !== "one"; }).forEach(function (ct) {
            if (phs(o[ct]).join() !== phs(e.other).join()) errs.push("EMIT-PLACEHOLDERS " + where + "." + ct + ": " + phs(o[ct]).join() + " vs en " + phs(e.other).join());
          });
          if (phs(o.one).some(function (x) { return phs(e.other).indexOf(x) === -1; })) errs.push("EMIT-PLACEHOLDERS " + where + ".one carries a placeholder en lacks");
          out[k] = o;
        } else {
          if (typeof v !== "string") { errs.push("EMIT-SHAPE " + where + ": expected a string"); return; }
          var s = clean(v, errs, where);
          if (phs(s).join() !== phs(e).join()) errs.push("EMIT-PLACEHOLDERS " + where + ": " + phs(s).join() + " vs en " + phs(e).join());
          out[k] = s;
        }
      });
      blocks[L] = out;
    });
    if (errs.length) { errors.push.apply(errors, errs); return; }
    var reg = text.indexOf("NT.i18n.register('" + ns + "'");
    var open = text.indexOf("{", reg), dictEnd = matchBrace(text, open);
    var z = findLangBlock(text, open, dictEnd, "ckb");
    if (!z) { errors.push("EMIT-ANCHOR " + f + " " + ns + ": no ckb block"); return; }
    var closeLine = text.lastIndexOf("\n", dictEnd - 1);
    var tail = text.slice(z.end, closeLine);
    if (tail && !/^,\n {4}(sa|la): \{[\s\S]*\}$/.test(tail)) { errors.push("EMIT-TAIL " + f + " " + ns + ": unexpected text after the ckb block"); return; }
    var add = SALA.filter(function (L) { return blocks[L]; }).map(function (L) { return fmtBlock(L, blocks[L], order); });
    text = text.slice(0, z.end) + (add.length ? ",\n" + add.join(",\n") : "") + text.slice(closeLine);
    fs.writeFileSync(p, text);
    var back = loadDicts(read(p))[ns];
    SALA.forEach(function (L) { if (blocks[L] && JSON.stringify(back[L]) !== JSON.stringify(blocks[L])) errors.push("EMIT-ROUNDTRIP " + f + " " + ns + "." + L); });
    written.push(f + " " + ns + " " + SALA.filter(function (L) { return blocks[L]; }).map(function (L) { return L + "=" + Object.keys(blocks[L]).length; }).join(" "));
  });
  return { errors: errors, written: written };
}
function extractDraft(file) {
  var d = loadDicts(read(file)), out = {};
  Object.keys(d).forEach(function (ns) {
    out[ns] = {};
    SALA.forEach(function (L) { if (d[ns][L]) out[ns][L] = JSON.parse(JSON.stringify(d[ns][L])); });
  });
  return out;
}

/* ---------- selftest ---------- */

function selftestMode() {
  var C = [
    [saLetterFindings("t", "अभाज्यसङ्ख्याः अत्र सन्ति।"), 0],
    [saLetterFindings("t", "फ" + U(0x93C) + "र्मा"), 1],
    [saLetterFindings("t", U(0x95E) + "र्मा"), 1],
    [saLetterFindings("t", U(0x911) + "यलर"), 1],
    [saLetterFindings("t", "दबाए" + U(0x901)), 1],
    [saLetterFindings("t", "क" + U(0x951)), 1],
    [saLetterFindings("t", "अस्ति ।"), 1],
    [saLetterFindings("t", "x = 2" + DANDA + "3"), 1],
    [saLetterFindings("t", "अस्ति" + DANDA + "{notes}"), 0],
    [saLetterFindings("t", "अस्ति" + DANDA + " ततः" + DDANDA), 0],
    [saLetterFindings("t", "RSA mod {n} Alice " + PHI), 0],
    [saOrthoFindings("t", "सङ्ख्या खण्डः"), 0],
    [saOrthoFindings("t", "संख्या"), 1],
    [saOrthoFindings("t", "संयोगः संशयः"), 0],
    [saOrthoFindings("t", "इदम् पश्यतु"), 1],
    [saOrthoFindings("t", "इदं पश्यतु"), 0],
    [saOrthoFindings("t", "अभाज्यसङ्ख्याम् एकाम्"), 0],
    [saOrthoFindings("t", "अस्ति."), 1],
    [saOrthoFindings("t", "16.8 दशलक्षम्"), 0],
    [saOrthoFindings("t", "{a} = {b} (mod {n})."), 1],
    [saOrthoFindings("t", "\"{0}\" इति"), 0],
    [saOrthoFindings("t", "«{0}» इति"), 1],
    [saOrthoFindings("t", "यह है"), 1],
    [saOrthoFindings("t", "ये या"), 0],
    [saOrthoFindings("t", "सङ्ख्यासिद्धान्तगुणनखण्डनविधिप्रदर्शनसाधनम्"), 1],
    [saOrthoFindings("t", "सङ्ख्यासिद्धान्त-गुणनखण्डनविधि-प्रदर्शनसाधनम्"), 0],
    [laLetterFindings("t", "Numerus primus", "Prime"), 0],
    [laLetterFindings("t", "Num" + U(0x113) + "rus", "x"), 1],
    [laLetterFindings("t", "Arbor " + U(0xE6), "x"), 1],
    [laLetterFindings("t", "Bézout", "Bézout coefficients"), 0],
    [laLetterFindings("t", "Bézout", "Bezout"), 1],
    [laLetterFindings("t", "functio " + PHI, "totient"), 0],
    [laLetterFindings("t", "iam maior eius", "already"), 0],
    [laLetterFindings("t", "iam " + "j" + "am", "already"), 1],
    [laLetterFindings("t", "{objId} est", "{objId} is"), 0],
    [laOrthoFindings("t", "vel videt valor ut", "x"), 0],
    [laOrthoFindings("t", "uel", "x"), 1],
    [laOrthoFindings("t", "XV instrumenta", "Fifteen tools"), 1],
    [laOrthoFindings("t", "Instrumento «{0}» utere", "x"), 0],
    [laOrthoFindings("t", "Euleri's", "x"), 1]
  ];
  C.forEach(function (c, i) { if (c[0].length !== c[1]) say("CASE", i, JSON.stringify(c[0])); });
  // every pinned string passes the gate's own rules
  var pinned = [];
  SALA.forEach(function (L, li) {
    Object.keys(TOOLS[L]).forEach(function (k) { pinned.push([L, "tools." + k, TOOLS[L][k]]); });
    Object.keys(COMMON[L]).forEach(function (k) { pinned.push([L, "common." + k, COMMON[L][k]]); });
    TERMS.forEach(function (t) { pinned.push([L, "terms." + t[0], t[2 + li]]); });
    ALSO.forEach(function (t) { pinned.push([L, "also." + t[0], t[1 + li]]); });
    Object.keys(NAMES).forEach(function (n) { pinned.push([L, "names." + n, NAMES[n][li]]); });
    Object.keys(TITLES[L]).forEach(function (n) { pinned.push([L, "titles." + n, TITLES[L][n]]); });
  });
  pinned.forEach(function (p) {
    var f = p[0] === SA ? saLetterFindings(p[1], p[2]).concat(saOrthoFindings(p[1], p[2])) : laLetterFindings(p[1], p[2], "Bézout").concat(laOrthoFindings(p[1], p[2], ""));
    if (p[0] === SA) {
      var latin = (p[2].match(/\p{Script=Latin}{2,}/gu) || []).filter(function (w) { return NOTATION.indexOf(w) === -1; });
      if (latin.length) f.push("SA-LATIN " + p[1] + " " + latin.join(","));
    }
    if (p[2] !== p[2].normalize("NFC") || INVISIBLE_RE.test(p[2])) f.push("NFC/INVISIBLE " + p[1]);
    f.forEach(function (x) { say("PINNED", p[0], x); });
  });
  if (TERMS.length !== 53) say("TERMS-COUNT", TERMS.length);
  SALA.forEach(function (L) {
    var sp = Object.keys(COMMON[L]).filter(function (k) { return /^speed\.\d+$/.test(k); }).map(function (k) { return COMMON[L][k]; });
    if (sp.length !== 10 || new Set(sp).size !== 10) say("SPEED-WORDS", L, "want ten distinct descriptors");
  });
  // emit / extract round trip in a temporary directory
  var dir = fs.mkdtempSync(path.join(mkdirp(CACHE), "selftest-"));
  var src = ["(function () {", "  \"use strict\";", "", "  NT.i18n.register('tst', {", "    en: {", "      a: 'x = {n}',",
    "      'b.c': 'B',", "      p: {", "        one: '{count} one',", "        other: '{count} other'", "      }", "    },",
    "    ckb: {", "      a: 'y',", "      'b.c': 'z',", "      p: {", "        one: 'q',", "        other: 'r'", "      }", "    }",
    "  });", "})();", ""].join("\n");
  fs.writeFileSync(path.join(dir, "tst.js"), src);
  var draft = { tst: { sa: { a: "x = {n} इति", "b.c": "\"ब\"", p: { one: "{count} एकः", two: "{count} द्वौ", other: "{count} बहवः" } },
    la: { a: "x = {n}", "b.c": "B'", p: { one: "{count} unus", other: "{count} multi" } } } };
  var r1 = emitDraft(dir, draft);
  var t1 = read(path.join(dir, "tst.js"));
  var r2 = emitDraft(dir, draft);
  var t2 = read(path.join(dir, "tst.js"));
  if (r1.errors.length || r2.errors.length) say("EMIT-ERRORS", JSON.stringify(r1.errors.concat(r2.errors)));
  if (t1 !== t2) say("EMIT-NOT-IDEMPOTENT");
  if (t1.indexOf("'b.c': 'B" + BS + "''") === -1) say("EMIT-QUOTE");
  var back = loadDicts(t1).tst;
  eq("roundtrip sa.p", back.sa.p, { one: "{count} एकः", two: "{count} द्वौ", other: "{count} बहवः" });
  eq("key order", Object.keys(back), ["en", "ckb", "sa", "la"]);
  eq("plural cat order", Object.keys(back.sa.p), ["one", "two", "other"]);
  eq("extract", extractDraft(path.join(dir, "tst.js")).tst.la.a, "x = {n}");
  var bad1 = emitDraft(dir, { tst: { la: { a: "x" } } });
  if (!bad1.errors.some(function (e) { return /^EMIT-KEYS/.test(e); })) say("EMIT-KEYS-MISSED");
  var bad2 = emitDraft(dir, { tst: { sa: { a: "x = {n}", "b.c": "B", p: { one: "a", other: "{count} b" } } } });
  if (!bad2.errors.some(function (e) { return /^EMIT-PLURAL/.test(e); })) say("EMIT-SA-DUAL-MISSED");
  var bad3 = emitDraft(dir, { tst: { la: { a: "x = {n}", "b.c": "B", p: { one: "a", two: "{count} c", other: "{count} b" } } } });
  if (!bad3.errors.some(function (e) { return /^EMIT-PLURAL/.test(e); })) say("EMIT-LA-TWO-MISSED");
  var bad4 = emitDraft(dir, { tst: { sa: { a: "<LRI>x = {n}<PDI>", "b.c": "B", p: { one: "a", two: "{count} c", other: "{count} b" } } } });
  if (!bad4.errors.some(function (e) { return /^EMIT-ISOLATE/.test(e); })) say("EMIT-ISOLATE-MISSED");
  var bad5 = emitDraft(dir, { tst: { la: { a: "x = {n}" + U(0x200D), "b.c": "B", p: { one: "a", other: "{count} b" } } } });
  if (!bad5.errors.some(function (e) { return /^EMIT-INVISIBLE/.test(e); })) say("EMIT-INVISIBLE-MISSED");
  var bad6 = emitDraft(dir, { tst: { sa: { a: "x = {m}", "b.c": "B", p: { one: "a", two: "c", other: "{count} b" } } } });
  if (!bad6.errors.some(function (e) { return /^EMIT-PLACEHOLDERS/.test(e); })) say("EMIT-PH-MISSED");
  if (read(path.join(dir, "tst.js")) !== t1) say("EMIT-WROTE-ON-ERROR");
  fs.rmSync(dir, { recursive: true, force: true });
  finish("SELFTEST");
}

/* ---------- engine ---------- */

var RU_STUB = "globalThis.Intl = { PluralRules: function () { this.select = function (n) { return n === 1 ? 'other' : (n === 0 || n === 21 || n === 1.5 ? 'one' : (n === 2 ? 'few' : 'many')); }; this.resolvedOptions = function () { return { locale: 'ru', pluralCategories: ['few', 'many', 'one', 'other'] }; }; } };";
var ENGINE_PINNED = {
  oldPlural: "  // Standard Moroccan Tamazight (zgh-Latn, zgh-Tfng) has no CLDR plural data: Intl.PluralRules falls back to the runtime's default locale for it (fr selects one for 0, ru for 21, ja never), so pluralCategory selects one for exactly 1 and other otherwise (internal, not exported).",
  newPlural: "  // Standard Moroccan Tamazight (zgh-Latn, zgh-Tfng), Sanskrit (sa) and Latin (la) have no CLDR plural data: Intl.PluralRules falls back to the runtime's default locale for them (fr selects one for 0, ru for 21, ja never), so pluralCategory selects one for exactly 1 and other otherwise (internal, not exported).",
  oldFixed: "  var FIXED_PLURAL_LANGS = Object.freeze(['zgh-Latn', 'zgh-Tfng']);",
  newFixed: "  var FIXED_PLURAL_LANGS = Object.freeze(['zgh-Latn', 'zgh-Tfng', 'sa', 'la']);",
  dualComment: "  // Sanskrit (sa) has a grammatical dual: for it pluralCategory also selects two for exactly 2 (internal, not exported).",
  dualVar: "  var FIXED_DUAL_LANGS = Object.freeze(['sa']);",
  oldSelect: "    if (FIXED_PLURAL_LANGS.indexOf(lang) !== -1) return count === 1 ? 'one' : 'other';",
  newSelect: "    if (FIXED_PLURAL_LANGS.indexOf(lang) !== -1) return count === 1 ? 'one' : ((count === 2 && FIXED_DUAL_LANGS.indexOf(lang) !== -1) ? 'two' : 'other');"
};
function mkEngine(src, q, langs, cookie, intlMode) {
  var store = {};
  var de = { lang: "", attrs: {}, setAttribute: function (k, v) { this.attrs[k] = String(v); },
    removeAttribute: function (k) { delete this.attrs[k]; }, getAttribute: function (k) { return k in this.attrs ? this.attrs[k] : null; } };
  var c = { location: { search: q, pathname: "/x.html", hash: "" }, navigator: { languages: langs },
    localStorage: { getItem: function (k) { return k in store ? store[k] : null; }, setItem: function (k, v) { store[k] = String(v); } },
    document: { readyState: "complete", cookie: cookie || "", documentElement: de, querySelectorAll: function () { return []; },
      getElementsByTagName: function () { return []; }, getElementById: function () { return null; }, addEventListener: function () {} } };
  c.window = c;
  vm.createContext(c);
  if (intlMode === "none") vm.runInContext("delete globalThis.Intl;", c);
  if (intlMode === "ru") vm.runInContext(RU_STUB, c);
  vm.runInContext(src, c);
  return { I: c.NT.i18n, de: de, store: store, hasIntl: vm.runInContext("typeof Intl", c) };
}
function engineMode() {
  var file = "assets/nt-i18n.js", src = read(file);
  var r = mkEngine(src, "", ["en"]);
  eq("SUPPORTED_LANGS", r.I.SUPPORTED_LANGS.join(","), "nl,en,de,fr,es,it,pl,pt-BR,pt-PT,sv,nb,ro,hu,lv,ru,el,he,hi,ar,sq,sw,zh,ja,ko,id,zgh-Latn,zgh-Tfng,ku,ckb,sa,la");
  [
    [["sa"], SA], [["sa-IN"], SA], [["SA_in"], SA], [["Sa-IN", "en"], SA], [["sa-Deva"], SA], [["sa-Deva-IN"], SA],
    [["san"], SA], [["san-IN"], SA], [["ne-NP", "sa"], SA], [["mr-IN", "sa"], SA], [["sa", "hi"], SA],
    [["hi-IN", "sa"], "hi"], [["en-IN", "sa"], "en"],
    [["sat"], SA], [["sah"], SA], [["sad", "en"], SA], [["sag"], SA], [["sas"], SA], [["saq"], SA],
    [["la"], LA], [["la-VA"], LA], [["LA_va"], LA], [["La-va", "en"], LA], [["la-IT"], LA], [["la-Latn"], LA],
    [["lat"], LA], [["it-VA", "la"], "it"], [["la", "it"], LA], [["en-VA", "la"], "en"], [["va", "la"], LA],
    [["lad"], LA], [["lag"], LA], [["lah"], LA], [["lam", "en"], LA], [["lav"], LA], [["Latn"], LA],
    [["lv"], "lv"], [["lv-LV"], "lv"], [["hi-IN"], "hi"], [["it-IT"], "it"], [["sq"], "sq"], [["sv-SE"], "sv"],
    [["sw"], "sw"], [["s", "en"], "en"], [["l", "en"], "en"], [["Cyrl", "en"], "en"], [["ckb", "sa"], "ckb"],
    [["ku", "la"], "ku"], [["zgh", "sa"], "zgh-Tfng"], [["iw", "la"], "he"], [["no-NO", "sa"], "nb"], [["pt", "la"], "pt-BR"],
    [["en-US"], "en"]
  ].forEach(function (t) { eq("detect " + t[0].join(","), mkEngine(src, "", t[0]).I.detectDefaultLang(), t[1]); });
  var a = mkEngine(src, "?lang=sa", ["en"]);
  eq("load sa lang", a.de.lang, SA);
  eq("load sa dir", a.de.getAttribute("dir"), null);
  eq("load sa persisted", a.store["site-lang"], SA);
  [["ckb", SA], ["he", LA], ["ar", SA], ["ckb", LA]].forEach(function (p) {
    a.I.setLang(p[0]); eq("setLang " + p[1] + " after " + p[0], a.I.setLang(p[1]), true);
    eq(p[1] + " after " + p[0] + " lang", a.de.lang, p[1]);
    eq(p[1] + " after " + p[0] + " dir", a.de.getAttribute("dir"), null);
  });
  a.I.setLang(LA); a.I.setLang("ckb");
  eq("ckb after la dir", a.de.getAttribute("dir"), "rtl");
  var b = mkEngine(src, "?lang=la", ["en"]);
  eq("load la lang", b.de.lang, LA);
  eq("load la dir", b.de.getAttribute("dir"), null);
  eq("?lang=la beats cookie sa and stored ckb", mkEngine(src, "?lang=la", ["en"], "site-lang=sa").de.lang, LA);
  eq("?lang=SA falls through to the cookie", mkEngine(src, "?lang=SA", ["en"], "site-lang=fr").de.lang, "fr");
  var d = mkEngine(src, "?lang=sa-IN", ["la-VA"]);
  eq("?lang=sa-IN falls through to the detected la", d.de.lang, LA);
  eq("a detected la is not persisted", d.store["site-lang"], undefined);
  eq("cookie la", mkEngine(src, "", ["en"], "site-lang=la").de.lang, LA);
  eq("cookie san falls through", mkEngine(src, "", ["en"], "site-lang=san").de.lang, "en");
  ["SA", "Sa", "sA", "LA", "La", "lA", "san", "lat", "sa-IN", "sa_IN", "sa-Deva", "la-VA", "la-Latn", " sa", "la ", "sa\n",
    "sanskrit", "latina", "Latina", SA_AUTONYM].forEach(function (v) { eq("setLang " + JSON.stringify(v), r.I.setLang(v), false); });
  ["real", "ru", "none"].forEach(function (mode) {
    var z = mkEngine(src, "", ["en"], "", mode);
    if (mode === "none") eq("no Intl in context", z.hasIntl, "undefined");
    z.I.register("trsalagate", { en: { count: { one: "{count} one", other: "{count} other" } },
      sa: { count: { one: "{count} one", two: "{count} two", other: "{count} other" } },
      la: { count: { one: "{count} one", other: "{count} other" } } });
    SALA.forEach(function (L) {
      z.I.setLang(L);
      [0, 1, 2, 3, 1.5, 2.5, 11, 21, 22, 100, 1000000, "1", "2"].forEach(function (n) {
        var num = Number(n), want = num === 1 ? "one" : (num === 2 && L === SA ? "two" : "other");
        eq(mode + " Intl " + L + " plural " + JSON.stringify(n), z.I.translate("trsalagate.count", { count: n }), n + " " + want);
      });
    });
    z.I.register("trhegate", { en: { count: { one: "{count} one", other: "{count} other" } },
      "zgh-Latn": { count: { one: "{count} one", other: "{count} other" } } });
    z.I.setLang("zgh-Latn");
    eq(mode + " Intl zgh-Latn plural 2 stays other", z.I.translate("trhegate.count", { count: 2 }), "2 other");
  });
  // ENGINE-CODE: the pinned line edits plus the two inserted FIXED_DUAL_LANGS lines, nothing else.
  var o = showBase(file).split("\n"), n = src.split("\n");
  var at = n.indexOf(ENGINE_PINNED.dualComment);
  if (at < 0 || n[at + 1] !== ENGINE_PINNED.dualVar || n[at - 1] !== ENGINE_PINNED.newFixed) say("ENGINE-CODE the two FIXED_DUAL_LANGS lines are missing or not directly after FIXED_PLURAL_LANGS");
  else n.splice(at, 2);
  if (o.length !== n.length) say("ENGINE-CODE line count after removing the insertion", o.length, "->", n.length);
  else for (var j = 0; j < o.length; j++) {
    if (o[j] === n[j]) continue;
    var ok = (/var SUPPORTED_LANGS = /.test(o[j]) && n[j] === o[j].replace("'ku', 'ckb']);", "'ku', 'ckb', 'sa', 'la']);")) ||
      (o[j] === ENGINE_PINNED.oldPlural && n[j] === ENGINE_PINNED.newPlural) ||
      (o[j] === ENGINE_PINNED.oldFixed && n[j] === ENGINE_PINNED.newFixed) ||
      (o[j] === ENGINE_PINNED.oldSelect && n[j] === ENGINE_PINNED.newSelect);
    if (!ok) say("ENGINE-CODE changed line", j + 1, JSON.stringify(n[j]).slice(0, 160));
  }
  finish("ENGINE-SALA");
}

/* ---------- checker ---------- */

function checkerMode() {
  var c = require(CHECK_PATH);
  var need = ["SWITCHER_OPTIONS", "LANG_CODES", "RTL_LANGS", "DIGIT_PARITY_LANGS", "SCRIPT_RULES", "PLURAL_EXTRA_CATEGORIES",
    "PLURAL_OTHER_ONLY_LANGS", "FIXED_PLURAL_LANGS", "FIXED_DUAL_LANGS", "expectedPluralCategories", "checkPluralEntry", "isProse",
    "pluralCategoryFindings", "scriptFindings", "bidiFindings", "charFindings", "digitParityFindings", "saLetterFindings", "laLetterFindings"];
  var missing = need.filter(function (k) { return !(k in c); });
  if (missing.length) { say("EXPORT-MISSING", missing.join(",")); finish("CHECKER-SALA"); }
  eq("switcher tail", c.SWITCHER_OPTIONS.slice(-3).map(function (o) { return o.value + "/" + o.lang + "/" + o.label; }),
    ["ckb/ckb/" + c.SWITCHER_OPTIONS[28].label, "sa/sa/" + SA_AUTONYM, "la/la/" + LA_AUTONYM]);
  eq("LANG_CODES length", c.LANG_CODES.length, 31);
  eq("RTL_LANGS unchanged", c.RTL_LANGS, ["he", "ar", "ckb"]);
  eq("DIGIT_PARITY_LANGS", c.DIGIT_PARITY_LANGS, ["hi", "ar", "sq", "sw", "zh", "ja", "ko", "id", "zgh-Latn", "zgh-Tfng", "ku", "ckb", "sa", "la"]);
  eq("FIXED_PLURAL_LANGS", c.FIXED_PLURAL_LANGS, ["zgh-Latn", "zgh-Tfng", "sa", "la"]);
  eq("FIXED_DUAL_LANGS", c.FIXED_DUAL_LANGS, ["sa"]);
  eq("plural sa", c.expectedPluralCategories(SA), ["one", "other", "two"]);
  eq("plural la", c.expectedPluralCategories(LA), ["one", "other"]);
  eq("plural he unchanged", c.expectedPluralCategories("he"), ["one", "other", "two"]);
  eq("plural zgh-Latn unchanged", c.expectedPluralCategories("zgh-Latn"), ["one", "other"]);
  SALA.forEach(function (L) { eq("not extra/other-only " + L, [L in c.PLURAL_EXTRA_CATEGORIES, c.PLURAL_OTHER_ONLY_LANGS.indexOf(L)], [false, -1]); });
  eq("sa plural entry ok", c.checkPluralEntry("t", "k", SA, { one: "1 a", two: "{count} b", other: "{count} c" }, { one: "1 x", other: "{count} y" }), []);
  eq("sa plural entry without two", c.checkPluralEntry("t", "k", SA, { one: "1 a", other: "{count} c" }, { one: "1 x", other: "{count} y" }).length, 1);
  eq("sa plural two keeps placeholders", c.checkPluralEntry("t", "k", SA, { one: "a", two: "b", other: "{count} c" }, { one: "x", other: "{count} y" }).length, 1);
  eq("la plural entry with two", c.checkPluralEntry("t", "k", LA, { one: "1 a", two: "{count} b", other: "{count} c" }, { one: "1 x", other: "{count} y" }).length, 1);
  eq("script rule sa", SA in c.SCRIPT_RULES, true);
  eq("no script rule la", LA in c.SCRIPT_RULES, false);
  eq("sa latin list", c.SCRIPT_RULES.sa.latin.slice().sort(), NOTATION.slice().sort());
  eq("autonym neutral sa", c.isProse(SA_AUTONYM), false);
  eq("autonym neutral la", c.isProse(LA_AUTONYM), false);
  var has = function (arr, code) { return arr.some(function (x) { return x.indexOf(code + " ") === 0; }); };
  var expect = function (label, arr, codes) {
    if (!codes.length && arr.length) say("UNEXPECTED", label, JSON.stringify(arr));
    codes.forEach(function (k) { if (!has(arr, k)) say("MISSED", label, k, JSON.stringify(arr)); });
  };
  var cleanSa = TOOLS.sa["nav.factorTree"] + " RSA mod {n} Alice " + PHI;
  expect("sa clean script", c.scriptFindings("t.k", SA, cleanSa, "Factor tree RSA mod {n} Alice"), []);
  expect("sa latin word", c.scriptFindings("t.k", SA, TOOLS.sa["nav.home"] + " prime", "Home prime"), ["SCRIPT-LATIN"]);
  expect("sa glued latin", c.scriptFindings("t.k", SA, "RSA" + TOOLS.sa["nav.home"], "RSA home"), ["SCRIPT-MIXED"]);
  expect("sa cyrillic", c.scriptFindings("t.k", SA, TOOLS.sa["nav.home"] + " " + U(0x434), "home"), ["SCRIPT-FOREIGN"]);
  expect("sa digits only", c.scriptFindings("t.k", SA, "123", "Home page"), ["SCRIPT-MISSING"]);
  expect("la no script rule", c.scriptFindings("t.k", LA, "Numerus primus", "Prime number"), []);
  expect("sa clean chars", c.charFindings("t.k", SA, cleanSa + DANDA + " 16.8"), []);
  expect("sa native digit", c.charFindings("t.k", SA, "सङ्ख्या " + U(0x967)), ["NATIVE-DIGIT"]);
  expect("sa zwj", c.charFindings("t.k", SA, "क" + VIRAMA + U(0x200D) + "ष"), ["ZERO-WIDTH"]);
  expect("sa not nfc", c.charFindings("t.k", SA, U(0x95E) + "र्मा"), ["NOT-NFC"]);
  expect("sa digits", c.digitParityFindings("t.k", SA, "16,8 दशलक्षम्", "16.8 million"), ["DIGIT-PARITY"]);
  expect("la digits", c.digitParityFindings("t.k", LA, "16.8 miliones", "16.8 million"), []);
  expect("la roman", c.digitParityFindings("t.k", LA, "XV instrumenta", "15 tools"), ["DIGIT-PARITY"]);
  expect("sa letter clean", c.saLetterFindings("t.k", SA, "अभाज्यसङ्ख्याः अत्र सन्ति" + DANDA, "x"), []);
  expect("sa nukta", c.saLetterFindings("t.k", SA, "फ" + U(0x93C) + "र्मा", "x"), ["SA-LETTER"]);
  expect("sa candra o", c.saLetterFindings("t.k", SA, U(0x911) + "यलर", "x"), ["SA-LETTER"]);
  expect("sa candrabindu", c.saLetterFindings("t.k", SA, "दबाए" + U(0x901), "x"), ["SA-LETTER"]);
  expect("sa lla", c.saLetterFindings("t.k", SA, "क" + U(0x933), "x"), ["SA-LETTER"]);
  expect("sa vedic accent", c.saLetterFindings("t.k", SA, "क" + U(0x951), "x"), ["SA-LETTER"]);
  expect("sa avagraha visarga vocalic", c.saLetterFindings("t.k", SA, "सोऽपि रामः " + U(0x90B) + U(0x960) + U(0x90C) + " कृ", "x"), []);
  expect("sa danda after space", c.saLetterFindings("t.k", SA, "अस्ति " + DANDA, "x"), ["SA-DANDA"]);
  expect("sa danda in formula", c.saLetterFindings("t.k", SA, "x = 2" + DANDA + "3", "x"), ["SA-DANDA"]);
  expect("sa danda before placeholder", c.saLetterFindings("t.k", SA, "अस्ति" + DANDA + "{notes}", "x"), []);
  expect("sa double danda", c.saLetterFindings("t.k", SA, "अस्ति" + DANDA + " ततः" + DDANDA, "x"), []);
  expect("sa rule only for sa", c.saLetterFindings("t.k", "hi", "दबाए" + U(0x901) + " " + DANDA, "x"), []);
  expect("la letter clean", c.laLetterFindings("t.k", LA, "Numerus primus iam maior", "Prime"), []);
  expect("la macron", c.laLetterFindings("t.k", LA, "Num" + U(0x113) + "rus", "x"), ["LA-LETTER"]);
  expect("la ligature", c.laLetterFindings("t.k", LA, "Arbor " + U(0xE6), "x"), ["LA-LETTER"]);
  expect("la e-acute from en", c.laLetterFindings("t.k", LA, "Bézout", "Bézout"), []);
  expect("la e-acute not in en", c.laLetterFindings("t.k", LA, "Bézout", "Bezout"), ["LA-LETTER"]);
  expect("la phi", c.laLetterFindings("t.k", LA, "functio " + PHI, "totient"), []);
  expect("la j", c.laLetterFindings("t.k", LA, "j" + "am", "already"), ["LA-J"]);
  expect("la j from en", c.laLetterFindings("t.k", LA, "{objId} est", "{objId} is"), []);
  expect("la rule only for la", c.laLetterFindings("t.k", "it", "già " + "j" + "am", "x"), []);
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
      SALA.forEach(function (L) {
        if (!d[L]) return;
        var cats = typeof d.en[k] === "object" ? catsOf(L) : [""];
        cats.forEach(function (ct) {
          var ev = ct ? (typeof d.en[k][ct] === "string" ? d.en[k][ct] : d.en[k].other) : d.en[k];
          var id = ns + "." + k + (ct ? "." + ct : "");
          var v = ct ? d[L][k] && d[L][k][ct] : d[L][k];
          if (typeof v !== "string") return;
          var mine = L === SA ? saLetterFindings(id, v) : laLetterFindings(id, v, ev);
          var theirs = L === SA ? c.saLetterFindings(id, SA, v, ev) : c.laLetterFindings(id, LA, v, ev);
          var codes = function (arr) { return arr.map(function (x) { return x.split(" ")[0]; }).sort().join(","); };
          if (codes(mine) !== codes(theirs) && dis++ < 5) say("DISAGREE", L, id, codes(mine), "vs", codes(theirs));
        });
      });
    });
  });
  finish("CHECKER-SALA");
}

/* ---------- batch ---------- */

var EN_WORDS = "the|and|with|this|that|then|than|when|which|each|are|was|has|have|key|keys|table|tree|start|clear|result|first|next|last|if|use|add|find|set|size|mark|check|search|secret|message|shared|digit|digits|list|grid|cell|cells|instant|reset|here|there|they|she|its|it|step|steps|number|numbers|prime|primes|value|values|click|press|enter|choose|show|hide|stop|random|public|private|from|into|your|for|of|to|on|by|or|not|run|play|pause|done|found|time";
var LA_ENRE = new RegExp("(?<![\\p{L}\\p{N}_.])(?:" + EN_WORDS.split("|").filter(function (w) { return LA_EN_HOMOGRAPHS.indexOf(w) === -1; }).join("|") + ")(?![\\p{L}\\p{N}_])", "giu");
var LA_OWN = W("et|in|est|sunt|ad|cum|ex|e|de|non|ut|qui|quae|quod|si|aut|vel|per|hic|haec|hoc|eius|ab|a|sed|nec|neque|enim|nam|tum|dum|quam|inter|sub|pro|sine|post|ita|sic|etiam|tantum|esse|fit|erit|nisi|ubi|iam|atque|ac|se|eam|eum|id|ea|is");
var LATIN_LANGS = ["nl", "de", "fr", "es", "it", "pl", "pt-BR", "pt-PT", "sv", "nb", "ro", "hu", "lv", "sq", "sw", "id", "zgh-Latn", "ku"];

function batchMode(files) {
  var C = loadChecker();
  var hasExports = typeof C.saLetterFindings === "function" && typeof C.laLetterFindings === "function";
  if (!hasExports) say("CHECKER-EXPORTS-MISSING", "saLetterFindings/laLetterFindings (Task 1 step C)");
  if (!files.length) say("NO-FILES");
  var keepRe = new RegExp("(?<![\\p{L}\\p{N}_])(?:" + LA_KEEP.join("|") + ")(?![\\p{L}\\p{N}_])", "gu");
  var strip = function (s) { return stripPh(s).replace(keepRe, " "); };
  var site = loadDicts(read(I18N_DIR + "site.js")).site;
  var navTitle = { sa: {}, la: {} };
  SALA.forEach(function (L) {
    if (site && site[L]) Object.keys(site.en).forEach(function (k) {
      if (/^nav\./.test(k) && (String(site.en[k]).match(/\p{L}{2,}/gu) || []).length >= 2) navTitle[L][site.en[k]] = site[L][k];
    });
    Object.keys(TITLES[L]).forEach(function (t) { navTitle[L][t] = TITLES[L][t]; });
  });
  var st = { sa: { n4: 0, own: 0, prose: 0, sameHi: 0, overlap: 0, nOverlap: 0 }, la: { n4: 0, own: 0, prose: 0, shared: {} } };
  var saOwn = function (v) {
    // Sanskrit inflection: a visarga, a word ending in virama or anusvara, a 3rd-person imperative (-tu, -taam, -ntu) or an indeclinable.
    return v.indexOf(VISARGA) !== -1 || new RegExp("[" + VIRAMA + ANUSVARA + "](?![\\p{L}\\p{M}])", "u").test(v) ||
      new RegExp("(?:" + U(0x924) + U(0x941) + "|" + U(0x924) + U(0x93E) + U(0x92E) + VIRAMA + ")(?![\\p{L}\\p{M}])", "u").test(v) || SA_IND.some(function (w) { return Wcs(w).test(v); });
  };
  files.forEach(function (f) {
    var raw = read(I18N_DIR + f), header = raw.split("(function")[0];
    if (/\btwenty-nine\b/i.test(raw)) say("STALE-COUNT", f);
    if (!/\bthirty-one\b/i.test(header)) say("COUNT-MISSING", f);
    var o = loadDicts(showBase(I18N_DIR + f)), n = loadDicts(raw);
    Object.keys(o).forEach(function (ns) {
      Object.keys(o[ns]).forEach(function (l) { if (JSON.stringify(o[ns][l]) !== JSON.stringify(n[ns] && n[ns][l])) say("DICT-CHANGED", f, ns, l); });
      if (!n[ns]) { say("NS-MISSING", f, ns); return; }
      var langs = Object.keys(n[ns]);
      if (langs.slice(-2).join(",") !== SALA.join(",")) say("SALA-NOT-LAST", f, ns, langs.slice(-3).join(","));
      langs.forEach(function (l) { if (!(l in o[ns]) && SALA.indexOf(l) === -1) say("DICT-EXTRA", f, ns, l); });
      var en = n[ns].en, hi = n[ns].hi;
      var ok = true;
      SALA.forEach(function (L) {
        if (!n[ns][L]) { say("NO-" + L.toUpperCase(), f, ns); ok = false; return; }
        if (Object.keys(n[ns][L]).join("|") !== Object.keys(en).join("|")) say("KEY-ORDER", f, ns, L);
      });
      if (!ok) return;
      Object.keys(en).forEach(function (k) {
        var isPlural = en[k] && typeof en[k] === "object";
        var full = ns + "." + k;
        SALA.forEach(function (L) {
          var v0 = n[ns][L][k];
          if (isPlural && !(v0 && typeof v0 === "object" && Object.keys(v0).sort().join(",") === catsOf(L).slice().sort().join(","))) { say("PLURAL-SHAPE", f, full, L, "expected { " + catsOf(L).join(", ") + " }"); return; }
          if (!isPlural && typeof v0 !== "string") { say("PLURAL-SHAPE", f, full, L, "expected a string"); return; }
          (isPlural ? catsOf(L) : [""]).forEach(function (ct) {
            var ev = String(ct ? (typeof en[k][ct] === "string" ? en[k][ct] : en[k].other) : en[k]);
            var id = full + (ct ? "." + ct : "");
            var v = formOf(v0, ct || "other");
            if (typeof v !== "string") return;
            if (INVISIBLE_RE.test(v)) say("BIDI-MARK", id, L, "(left to right: no isolate or invisible character)");
            var sameOk = FORMULA_SAME.indexOf(full) !== -1 || (L === LA && LA_SAME_OK.indexOf(full) !== -1);
            if (v === ev && C.isProse && C.isProse(ev) && !sameOk) say("SAME-AS-EN", id, L, JSON.stringify(ev).slice(0, 80));
            if (ns !== "site" && Object.prototype.hasOwnProperty.call(navTitle[L], ev) && v !== navTitle[L][ev]) say("NAV-TITLE", id, L, JSON.stringify(v), "want", JSON.stringify(navTitle[L][ev]));
            AVOID[L].forEach(function (w) { if (stem(w).test(v)) say("AVOID", id, L, JSON.stringify(w), "(D-AVOID)"); });
            KEY_NAMES[L].forEach(function (kn) { if (Wcs(kn).test(v) && KEY_NAME_KEYS.indexOf(full) === -1) say("KEY-NAME", id, L, kn, "(key names only in venn.picker.hint)"); });
            if (L === SA) {
              saLetterFindings(id, v).concat(saOrthoFindings(id, v)).forEach(function (s) { say(s); });
              var hv = hi ? String(formOf(hi[k], ct || "other")) : "";
              EPONYM_LATIN_IN_SA.forEach(function (e) {
                if (Wcs(e).test(v) && !Wcs(e).test(hv)) say("EPONYM-SPELLING", id, SA, JSON.stringify(e), "(write it in Devanagari, D-NAMES)");
              });
              if (C.isProse && C.isProse(v) && v !== ev) {
                st.sa.prose++;
                if (v === hv) st.sa.sameHi++;
              }
              var sw = words(v).filter(function (w) { return /\p{scx=Devanagari}/u.test(w); });
              if (sw.length >= 4 && hv) {
                var hs = {};
                words(hv).forEach(function (w) { hs[w] = true; });
                st.sa.nOverlap++;
                if (sw.filter(function (w) { return hs[w]; }).length / sw.length >= 0.6) { st.sa.overlap++; if (st.sa.overlap <= 3) console.log("HI-OVERLAP-SAMPLE " + id); }
              }
              if ((ev.match(/\p{L}{2,}/gu) || []).length >= 4) { st.sa.n4++; if (saOwn(v)) st.sa.own++; }
              if (hasExports) {
                C.saLetterFindings(id, SA, v, ev).concat(C.scriptFindings(id, SA, v, ev), C.charFindings(id, SA, v), C.bidiFindings(id, SA, v), C.digitParityFindings(id, SA, v, ev))
                  .forEach(function (s) { say("CHECKER", s); });
              }
            } else {
              laLetterFindings(id, v, ev).concat(laOrthoFindings(id, v, ev)).forEach(function (s) { say(s); });
              if (/(?<![\p{L}])(?:GCD|LCM)(?![\p{L}])/u.test(v)) say("LA-GCD", id, "(D-GCD: the D-TERMS phrase or lowercase gcd/lcm)");
              (stripPh(v).match(/(?<![\p{L}\p{N}_])\p{Lu}{2,}(?![\p{L}\p{N}_])/gu) || []).forEach(function (w) {
                if (!LA_KEEP_SET[w] && !Wcs(w).test(ev) && !/^(GCD|LCM)$/.test(w) && !/^[IVXLCDM]+$/.test(w)) say("LA-ACRONYM", id, JSON.stringify(w), "(not on the keep list and not in the English value)");
              });
              Object.keys(EPONYM_LA).forEach(function (e) { if (Wcs(e).test(v)) say("EPONYM-SPELLING", id, LA, JSON.stringify(e), "write", JSON.stringify(EPONYM_LA[e])); });
              var hits = {};
              (strip(v).match(LA_ENRE) || []).forEach(function (w) { hits[w.toLowerCase()] = true; });
              Object.keys(hits).forEach(function (w) {
                var re = W(w);
                var kept = LATIN_LANGS.filter(function (m) { return re.test(strip(formOf(n[ns][m] && n[ns][m][k], ct || "other") || "")); }).length;
                if (kept < 7) say("ENGLISH-WORD", id, LA, w);
              });
              if ((ev.match(/\p{L}{2,}/gu) || []).length >= 4) { st.la.n4++; if (LA_OWN.test(v)) st.la.own++; }
              if (C.isProse && C.isProse(v) && v !== ev) {
                st.la.prose++;
                Object.keys(n[ns]).forEach(function (m) {
                  if (m === "en" || SALA.indexOf(m) !== -1) return;
                  if (v === String(formOf(n[ns][m] && n[ns][m][k], ct || "other"))) st.la.shared[m] = (st.la.shared[m] || 0) + 1;
                });
              }
              if (hasExports) {
                C.laLetterFindings(id, LA, v, ev).concat(C.charFindings(id, LA, v), C.bidiFindings(id, LA, v), C.digitParityFindings(id, LA, v, ev))
                  .forEach(function (s) { say("CHECKER", s); });
              }
            }
          });
        });
      });
    });
  });
  if (st.sa.n4 >= 10 && st.sa.own < 0.8 * st.sa.n4) say("OWN-WORDS", "sa", st.sa.own + "/" + st.sa.n4, "(Sanskrit inflection or indeclinables in under 80% of the longer values)");
  if (st.sa.sameHi > Math.max(3, 0.02 * st.sa.prose)) say("SHARED-HI", "sa", st.sa.sameHi + "/" + st.sa.prose, "(sa values identical to hi)");
  if (st.sa.nOverlap >= 10 && st.sa.overlap > 0.1 * st.sa.nOverlap) say("HI-OVERLAP", "sa", st.sa.overlap + "/" + st.sa.nOverlap, "(60% or more of the words shared with the hi value)");
  if (st.la.n4 >= 10 && st.la.own < 0.7 * st.la.n4) say("OWN-WORDS", "la", st.la.own + "/" + st.la.n4);
  Object.keys(st.la.shared).forEach(function (m) { if (st.la.shared[m] > Math.max(3, 0.05 * st.la.prose)) say("SHARED-VALUES", "la", m, st.la.shared[m] + "/" + st.la.prose); });
  console.log("STATS sa own=" + st.sa.own + "/" + st.sa.n4 + " prose=" + st.sa.prose + " sameHi=" + st.sa.sameHi + " hiOverlap=" + st.sa.overlap + "/" + st.sa.nOverlap +
    " | la own=" + st.la.own + "/" + st.la.n4 + " prose=" + st.la.prose + " maxShared=" + JSON.stringify(Object.keys(st.la.shared).map(function (m) { return [m, st.la.shared[m]]; }).sort(function (x, y) { return y[1] - x[1]; }).slice(0, 2)));
  finish("SALA-BATCH");
}

function pinnedMode() {
  var d = loadDicts(read(I18N_DIR + "site.js"));
  SALA.forEach(function (L) {
    eq("site." + L, d.site && d.site[L], TOOLS[L]);
    eq("common." + L, d.common && d.common[L], COMMON[L]);
  });
  finish("PINNED");
}
function termsMode() {
  console.log("D-TOOLS (site.nav and chrome): key | sa | la");
  Object.keys(TOOLS.sa).forEach(function (k) { console.log("  " + k + " | " + TOOLS.sa[k] + " | " + TOOLS.la[k]); });
  console.log("D-COMMON:");
  Object.keys(COMMON.sa).forEach(function (k) { console.log("  " + k + " | " + COMMON.sa[k] + " | " + COMMON.la[k]); });
  console.log("D-TERMS (glossary (c) rows):");
  TERMS.forEach(function (t) { console.log("  " + t[0] + " " + t[1] + " | " + t[2] + " | " + t[3]); });
  console.log("D-TERMS also:");
  ALSO.forEach(function (t) { console.log("  " + t[0] + " | " + t[1] + " | " + t[2]); });
  console.log("D-NAMES:");
  Object.keys(NAMES).forEach(function (n) { console.log("  " + n + " | " + NAMES[n][0] + " | " + NAMES[n][1]); });
  console.log("D-TITLES:");
  Object.keys(TITLES.sa).forEach(function (t) { console.log("  " + t + " | " + TITLES.sa[t] + " | " + TITLES.la[t]); });
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
    var at = hdr.indexOf(SA);
    var enCol = hdr.findIndex(function (h) { return /^en\b/.test(h); });
    if (at < 0) {
      at = before ? hdr.indexOf(before) : hdr.length;
      if (at < 0) { say("NO-COLUMN", name, before); return; }
      for (var j = i; j < lines.length && /^\|/.test(lines[j]); j++) {
        var parts = lines[j].split("|");
        var add = j === i ? [" sa ", " la "] : (j === i + 1 ? [" --- ", " --- "] : [" ", " "]);
        parts.splice(at + 1, 0, add[0], add[1]);
        lines[j] = parts.join("|");
      }
    }
    for (var r = i + 2; r < lines.length && /^\|/.test(lines[r]); r++) {
      var ps = lines[r].split("|"), cells = cellsOf(lines[r]);
      SALA.forEach(function (L, li) {
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
    var cs = R[0].indexOf(SA), cl = R[0].indexOf(LA);
    if (cs < 0 || cl !== cs + 1 || R[0][cs - 1] !== "ckb") { say("NO-SALA-COLUMNS", name, "(sa then la, directly after ckb)"); return; }
    if (name === "c" && R[0][cl + 1] !== "Confidence") say("COLUMN-ORDER", "c", "sa, la directly before Confidence");
    if (name === "d" && R[0][cl + 1] !== "Note") say("COLUMN-ORDER", "d", "sa, la directly before Note");
    var n = 0;
    R.slice(2).forEach(function (r) {
      n++;
      if (!r[cs] || !r[cl]) { say("CELL-EMPTY", name, r[0]); return; }
      saLetterFindings(name + "." + r[0], r[cs]).concat(saOrthoFindings(name + "." + r[0], r[cs])).forEach(function (x) { say("GLOSSARY-" + x); });
      laLetterFindings(name + "." + r[0], r[cl], r.join(" ")).concat(laOrthoFindings(name + "." + r[0], r[cl], r.join(" "))).forEach(function (x) { say("GLOSSARY-" + x); });
      if (name === "b") SALA.forEach(function (L, li) { if (d.site[L] && r[cs + li] !== d.site[L]["nav." + r[0]]) say("GLOSSARY-DRIFT b", r[0], L); });
    });
    var want = { b: 16, c: 53, d: 14, f: 9 }[name];
    if (n !== want) say("ROWS", name, n, "want", want);
    var sectionText = g.split(new RegExp("^## \\(" + name + "\\)", "m"))[1] || "";
    if (sectionText.split(/^## /m)[0].indexOf(TASK) === -1) say("NO-TASK-ID", "(" + name + ")");
  });
  if (!/^\| Sanskrit \(sa\) `\[ASSUMED\]` \|/m.test(g)) say("TONE-ROW-MISSING", "sa");
  if (!/^\| Latin \(la\) `\[ASSUMED\]` \|/m.test(g)) say("TONE-ROW-MISSING", "la");
  if (g.indexOf("**Sanskrit (sa) `[ASSUMED]`:**") === -1) say("ENTRY-MISSING", "sa");
  if (g.indexOf("**Latin (la) `[ASSUMED]`:**") === -1) say("ENTRY-MISSING", "la");
  if (/\btwenty-nine\b/i.test(g)) say("STALE-COUNT", GLOSSARY);
  var se = (g.split(/^## \(e\)/m)[1] || "").split(/^## /m)[0];
  if ((se.match(/\bthirty-one\b/gi) || []).length < 2) say("E-COUNT", "(e) states thirty-one twice");
  if (se.indexOf("Sanskrit and Latin (added 2026-10-08 by quick task " + TASK + ")") === -1) say("E-SENTENCE-MISSING");
  if (!skipSupp) {
    var m = /^### Sanskrit and Latin supplementary terms[^\n]*\n([\s\S]*?)(?=^#{2,3} )/m.exec(g);
    if (!m) say("SUPPLEMENTARY-TABLE-MISSING");
    else {
      var R = m[1].split("\n").filter(function (l) { return /^\|/.test(l); }).map(cellsOf), cat = loadAll();
      var h = R[0] || [], cs = h.indexOf(SA), cl = h.indexOf(LA), cn = h.indexOf("Namespaces");
      if (cs < 0 || cl < 0 || cn < 0) say("SUPP-COLUMNS", "want | Term (en) | sa | la | Namespaces | Confidence |", JSON.stringify(h));
      else R.slice(2).forEach(function (r) {
        r[cn].split(/,\s*/).filter(Boolean).forEach(function (ns) {
          SALA.forEach(function (L, li) {
            if (!cat[ns] || !cat[ns][L]) { say("SUPP-NS", r[0], ns, L); return; }
            var blob = JSON.stringify(cat[ns][L]).toLowerCase(), term = String(r[(li ? cl : cs)]).toLowerCase();
            if (blob.indexOf(term) === -1) say("SUPP-NOT-FOUND", L, JSON.stringify(r[(li ? cl : cs)]), "in", ns);
          });
        });
      });
      if (R.length < 22) say("SUPP-SHORT", R.length - 2, "rows (want 20 or more)");
    }
  }
  finish("GLOSSARY-SALA");
}

/* ---------- pagecode / config ---------- */

function pagecodeMode() {
  var re = new RegExp("^([ \\t]*)<option value=\"ckb\" lang=\"ckb\">([^<]*)<\\/option>\\n([ \\t]*)<option value=\"sa\" lang=\"sa\">" + SA_AUTONYM +
    "<\\/option>\\n([ \\t]*)<option value=\"la\" lang=\"la\">" + LA_AUTONYM + "<\\/option>\\n", "m");
  var files = git(["ls-files", "*.html", "assets"]).trim().split("\n").filter(function (f) { return !/^assets\/i18n\//.test(f) && f !== "assets/nt-i18n.js"; });
  var pages = 0;
  files.forEach(function (f) {
    var o = showBase(f), n = read(f), s = n;
    if (/\.html$/.test(f)) {
      pages++;
      var m = re.exec(n);
      if (!m) { say("SWITCHER-LINES-MISSING", f); return; }
      if (m[1] !== m[3] || m[1] !== m[4]) say("SWITCHER-INDENT", f);
      s = s.replace(re, function (all, i1, lab) { return i1 + "<option value=\"ckb\" lang=\"ckb\">" + lab + "</option>\n"; });
    }
    if (s !== o) say("CODE-CHANGED", f);
    if (/\.(html|css)$/.test(f) && /@font-face|fonts\.googleapis\.com\/css2\?[^"]*(Devanagari|Sanskrit|Hind|Mukta|Tiro)/i.test(n) && !/@font-face|fonts\.googleapis\.com\/css2\?[^"]*(Devanagari|Sanskrit|Hind|Mukta|Tiro)/i.test(o)) say("FONT-ADDED", f);
  });
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
  SALA.forEach(function (L) {
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
    if (/\btwenty-nine\b/i.test(read(f))) say("STALE-COUNT", f);
  });
  var rules = [
    ["Tamazight", /Sanskrit/, "Sanskrit named wherever Tamazight is"],
    ["Tamazight", /\bLatin \(`?la`?\)/, "Latin (la) named wherever Tamazight is"],
    ["`{one, two, other}`", /Sanskrit/, "Sanskrit's dual shape wherever Hebrew's {one, two, other} is"],
    ["has no zgh data", /has no sa or la data/, "the engine-fixed Sanskrit and Latin plural rules next to the Tamazight one"],
    ["`tzm`", /`lav`/, "the Sanskrit/Latin two-letter detection collisions wherever the Tamazight rule is"],
    ["`tzm`", /`san`/, "the ISO 639-2 san/lat tags reaching sa/la wherever the Tamazight rule is"],
    ["Devanagari", /Sanskrit/, "Sanskrit wherever Devanagari is named"],
    ["SCRIPT_RULES", /\bsa\b/, "the sa script rule"],
    ["DIGIT-PARITY", /SA-LETTER/, "the SA-LETTER finding wherever the finding list is"],
    ["DIGIT-PARITY", /LA-LETTER/, "the LA-LETTER finding wherever the finding list is"],
    ["Tamaziɣt", new RegExp(SA_AUTONYM), "the Sanskrit autonym"],
    ["Tamaziɣt", new RegExp("\\b" + LA_AUTONYM + "\\b"), "the Latin autonym"]
  ];
  DOCS.forEach(function (f) {
    var o = showBase(f), n = read(f);
    if (/\btwenty-nine\b/i.test(o) && !/\bthirty-one\b/i.test(n)) say("NO-COUNT", f);
    var sixteen = function (s) { return (s.match(/\b(?:16|sixteen)\b/gi) || []).length; };
    if (sixteen(o) !== sixteen(n)) say("SIXTEEN-CHANGED", f, sixteen(o), "->", sixteen(n));
    (n.match(/zgh-Tfng(?:`?, `?|\/)ku(?:`?, `?|\/)ckb(?![\w-]).{0,14}/g) || []).forEach(function (m) {
      if (!/^zgh-Tfng(?:`?, `?|\/)ku(?:`?, `?|\/)ckb(?:`?, `?|\/)sa(?:`?, `?|\/)la/.test(m)) say("LIST-WITHOUT-SALA", f, JSON.stringify(m));
    });
    rules.forEach(function (r) { if (o.indexOf(r[0]) !== -1 && !r[1].test(n)) say("MISSING-SALA-RULE", f, JSON.stringify(r[0]), "->", r[2]); });
  });
  [".planning/PROJECT.md", ".planning/REQUIREMENTS.md"].forEach(function (f) { if (read(f).indexOf(TASK) === -1) say("NO-TASK-ID", f); });
  finish("DOCS-SALA");
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
  var tmp = fs.mkdtempSync(path.join(mkdirp(CACHE), "sweep-" + process.pid + "-"));
  var r;
  try {
    r = cp.spawnSync("node", [".planning/phases/06-multi-language-support/i18n-browser.js", page, "--mode", "switch,layout"],
      { encoding: "utf8", maxBuffer: 64 * 1024 * 1024, env: Object.assign({}, process.env, { TMPDIR: tmp }) });
  } finally { try { fs.rmSync(tmp, { recursive: true, force: true }); } catch (e) { /* best effort */ } }
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
  if (nonEn !== 30) say("LANG-COUNT", "expected 30 non-English languages, LANG_CODES gives", nonEn);
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

/* ---------- shot / dump / font / main ---------- */

function shotMode(args) {
  var menu = args.indexOf("--menu") !== -1, a = args.filter(function (x) { return x !== "--menu"; });
  var page = a[0], lang = a[1], size = a[2], out = a[3];
  if (!page || !lang || !/^\d+x\d+$/.test(String(size)) || !out) { console.log("usage: shot <page> <lang> <W>x<H> <out.png> [--menu]"); process.exit(2); }
  var repo = path.resolve(git(["rev-parse", "--show-toplevel"]).trim()), outAbs = path.resolve(out);
  if (outAbs === repo || outAbs.indexOf(repo + path.sep) === 0) { console.log("SHOT refuses to write inside the repository: " + outAbs); process.exit(2); }
  mkdirp(path.dirname(outAbs));
  var root = repo;
  if (menu) {
    root = path.join(mkdirp(CACHE), "menu-tree");
    fs.rmSync(root, { recursive: true, force: true });
    mkdirp(root);
    cp.execSync("git ls-files -z | tar --null -T - -cf - | tar -xf - -C " + JSON.stringify(root), { cwd: repo, stdio: "inherit" });
    var pf = path.join(root, page), html = read(pf);
    if (html.indexOf("<header class=\"site-header\">") === -1) { console.log("SHOT no <header class=\"site-header\"> in " + page); process.exit(2); }
    fs.writeFileSync(pf, html.replace("<header class=\"site-header\">", "<header class=\"site-header is-menu-open\">"));
  }
  var url = "file://" + path.join(root, page).split(path.sep).map(function (s) { return encodeURIComponent(s); }).join("/").replace(/^%3A/, ":") + "?lang=" + encodeURIComponent(lang) + "&theme=day";
  var prof = mkdirp(path.join(CACHE, "profile")), tmp = mkdirp(path.join(CACHE, "tmp"));
  var wh = size.split("x");
  var r = cp.spawnSync("google-chrome", ["--headless=new", "--disable-gpu", "--no-sandbox", "--hide-scrollbars", "--user-data-dir=" + prof,
    "--virtual-time-budget=4000", "--window-size=" + wh[0] + "," + wh[1], "--screenshot=" + outAbs, url],
    { encoding: "utf8", timeout: 120000, env: Object.assign({}, process.env, { TMPDIR: tmp }) });
  var okShot = fs.existsSync(outAbs) && fs.statSync(outAbs).size > 0;
  console.log("SHOT " + (okShot ? "OK " : "FAIL ") + outAbs + " status=" + r.status + (r.error ? " error=" + r.error.code : ""));
  process.exit(okShot ? 0 : 1);
}
function dumpMode(f) {
  var d = loadDicts(read(I18N_DIR + f));
  Object.keys(d).forEach(function (ns) {
    Object.keys(d[ns].en).forEach(function (k) {
      console.log(ns + "." + k);
      ["en", "hi", SA, LA].forEach(function (L) { if (d[ns][L]) console.log("  " + L + " " + show(d[ns][L][k])); });
    });
  });
}
function fontMode() {
  var fams = null;
  SA_CPS.concat([0x964, 0x965]).forEach(function (c) {
    var out = "";
    try { out = cp.execSync("fc-list ':charset=" + c.toString(16) + "' family 2>/dev/null || true", { encoding: "utf8" }); } catch (e) { out = ""; }
    var set = {};
    out.split("\n").filter(Boolean).forEach(function (l) { set[l.split(",")[0].trim()] = true; });
    fams = fams === null ? set : Object.keys(fams).reduce(function (acc, k) { if (set[k]) acc[k] = true; return acc; }, {});
  });
  var list = Object.keys(fams || {}).sort();
  console.log("FONT sanskrit=" + (list.length ? "present " + list.join("; ") : "absent"));
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
else if (mode === "pinned-draft") {
  fs.writeFileSync(rest[0], JSON.stringify({ site: { sa: TOOLS.sa, la: TOOLS.la }, common: { sa: COMMON.sa, la: COMMON.la } }, null, 2) + "\n");
  console.log("PINNED-DRAFT " + rest[0]);
}
else if (mode === "glossary-fill") glossaryFillMode();
else if (mode === "glossary") glossaryMode(rest);
else if (mode === "pagecode") pagecodeMode();
else if (mode === "config") configMode();
else if (mode === "unify") unifyMode(rest);
else if (mode === "docs") docsMode();
else if (mode === "sweep") sweepMode(rest);
else if (mode === "shot") shotMode(rest);
else if (mode === "dump") dumpMode(rest[0]);
else if (mode === "font") fontMode();
else { console.log("usage: sala-gate.js selftest|engine|checker|emit <draft.json>|extract <file> [out]|batch <files...>|pinned|terms|pinned-draft <out.json>|glossary-fill|glossary [--no-supp]|pagecode|config|unify [--allow ...]|docs|sweep <pages...>|shot <page> <lang> <W>x<H> <out.png> [--menu]|dump <file>|font"); process.exit(2); }
