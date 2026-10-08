#!/usr/bin/env node
/* id-gate.js — plan-local gates for quick task 261008-0h2 (Indonesian, id).
 * Dev-only, never shipped, never referenced by a page. Run from the repo root:
 *
 *   node .planning/quick/261008-0h2-add-indonesian-id-as-the-twenty-fifth-su/id-gate.js <mode> [args...]
 *
 * Modes (each prints "<NAME> bad=<n>" and exits 1 when n > 0):
 *   engine            ENGINE-ID: assets/nt-i18n.js behaviour for id (detection
 *                     incl. the legacy tag in -> id, rejection, LTR transitions,
 *                     {other}-only plurals) plus ENGINE-CODE: only the
 *                     SUPPORTED_LANGS line and the registry comment line differ
 *                     from BASE, plus exactly the two inserted lines (comment +
 *                     `if (parts[0] === 'in') return 'id';`) right after the iw
 *                     branch.
 *   checker           CHECKER-ID: i18n-check.js tables and findings for id.
 *   batch <files...>  ID-BATCH over assets/i18n/<file> data files: existing
 *                     languages unchanged from BASE, id last and complete in en
 *                     key order, {other} plural shape, header count word and
 *                     plural sentence, FOREIGN-LETTER (plain ASCII letters; a
 *                     non-ASCII letter only where the English value has it, phi
 *                     exempt), AVOID (Malay, non-standard and English forms),
 *                     ANDA-CASE, APOSTROPHE-S, REDUP-AFTER-NUM, ENGLISH-WORD, OWN-WORDS,
 *                     SHARED-VALUES, SAME-AS-EN (identical-to-English only for
 *                     the plan's D-SAME keys), NAV-TITLE (a value whose English
 *                     equals a multi-word site.nav English value equals the id
 *                     site.nav value).
 *   glossary [--no-cd|--no-supp] GLOSSARY-ID: 06-GLOSSARY.md Indonesian tone
 *                     row and entry, (e) sentence, (b)/(f) id columns equal to
 *                     site.js; without --no-cd also (c)/(d) id columns complete;
 *                     without --no-cd and --no-supp also the Indonesian
 *                     supplementary terms table present.
 *   pagecode          PAGE-CODE: page/asset code unchanged from BASE apart from
 *                     one Bahasa Indonesia option line per page, directly after
 *                     the Korean option line, same indentation. No CSS change.
 *   config [f.json..] CONFIG: i18n-config/*.json unchanged from BASE apart from
 *                     reason texts extended with a sentence naming Indonesian and
 *                     261008-0h2 (checked for every file); for the named files
 *                     (all files when none is named) a reason is extended exactly
 *                     when the id value of that key is identical to English
 *                     (formula templates whose reason already covers every
 *                     language excepted), allowSame and the allowRenderText entry
 *                     for the same English text alike.
 *   unify [--allow ns.key,...]  UNIFY: one id rendering per repeated multi-word
 *                     English value across all namespaces (D-SAME keys exempt).
 *   docs              DOCS-ID: the ten living docs at twenty-five languages (no
 *                     "twenty-four" left in docs, data files or the glossary),
 *                     every sw/zh/ja/ko code list continued with id, Indonesian
 *                     named wherever Korean was, the legacy in -> id rule
 *                     wherever the iw rule is, Indonesian next to every {other}
 *                     mention, the 16 / sixteen count unchanged per doc, the
 *                     autonym in REQUIREMENTS.md, 261008-0h2 in PROJECT.md and
 *                     REQUIREMENTS.md.
 *   sweep <pages...>  SWEEP: i18n-browser.js --mode switch,layout per page, one
 *                     page at a time, holding one of the two machine-wide slots
 *                     shared with cjk-gate.js (lock files in the git dir), so no
 *                     more than two sweeps ever run at once. A page passes with
 *                     "switch PASS ... langs=24" and "layout PASS"; Factor Tree
 *                     and Venn may instead print exactly their 24 documented
 *                     pre-existing switch lines and nothing else. A flaky-looking
 *                     failure is rerun once. About 3 minutes per page: run it in
 *                     the background.
 *
 * BASE defaults to 71b1bf6 (HEAD when this task was planned); override with
 * ID_GATE_BASE=<rev> for a dry run elsewhere.
 */
"use strict";

var fs = require("fs");
var vm = require("vm");
var cp = require("child_process");
var path = require("path");

var BASE = process.env.ID_GATE_BASE || "71b1bf6";
var L = "id";
var I18N_DIR = "assets/i18n/";
var CHECK_PATH = path.resolve(process.cwd(), ".planning/phases/06-multi-language-support/i18n-check.js");
var GLOSSARY = ".planning/phases/06-multi-language-support/06-GLOSSARY.md";
var CONFIG_DIR = ".planning/phases/06-multi-language-support/i18n-config/";

// D-SAME: the only keys whose id value may equal the English value (prose).
var FORMULA_SAME = ["cayley.equationCaption", "rsa.lblQInv", "sqm.stepSquareFormula", "sqm.stepMultiplyFormula"];
var D_SAME = FORMULA_SAME.concat(["cayley.nLabel", "wheel.nLabel", "wheel.nRangeLabel", "crt.modulusLabel", "sqm.modLabel",
  "rsa.thBit", "sqm.linkDiffieHellman"]);

var bad = 0;
function say() { bad++; console.log(Array.prototype.join.call(arguments, " ")); }
function git(args) { return cp.execFileSync("git", args, { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 }); }
function showBase(p) { return git(["show", BASE + ":" + p]); }
function finish(name) { console.log(name + " bad=" + bad); process.exit(bad ? 1 : 0); }
function eq(label, got, want) {
  if (JSON.stringify(got) !== JSON.stringify(want)) say("FAIL", label, JSON.stringify(got), "want", JSON.stringify(want));
}
function has(label, arr, code) {
  if (!arr.some(function (f) { return f.indexOf(code + " ") === 0; })) say("MISSING", label, code, JSON.stringify(arr));
}
function none(label, arr) { if (arr.length) say("UNEXPECTED", label, JSON.stringify(arr)); }
function loadDicts(src) {
  var c = {};
  var NT = { i18n: { register: function (n, d) { c[n] = d; } } };
  vm.runInNewContext(src, { NT: NT, window: { NT: NT } });
  return c;
}
function loadAll() {
  var cat = {};
  fs.readdirSync(I18N_DIR).filter(function (f) { return /\.js$/.test(f); }).forEach(function (f) {
    var d = loadDicts(fs.readFileSync(I18N_DIR + f, "utf8"));
    Object.keys(d).forEach(function (ns) { cat[ns] = d[ns]; });
  });
  return cat;
}
function form(v, cat) { return v == null ? undefined : (typeof v === "object" ? (cat in v ? v[cat] : v.other) : v); }
function W(s) { return new RegExp("(?<![\\p{L}\\p{N}_])(?:" + s + ")(?![\\p{L}\\p{N}_])", "iu"); }

/* ---------- engine ---------- */

function engineMode() {
  var file = "assets/nt-i18n.js";
  var src = fs.readFileSync(file, "utf8");
  function mk(q, langs, cookie) {
    var de = { lang: "", attrs: {},
      setAttribute: function (k, v) { this.attrs[k] = String(v); },
      removeAttribute: function (k) { delete this.attrs[k]; },
      getAttribute: function (k) { return k in this.attrs ? this.attrs[k] : null; } };
    var c = { location: { search: q, pathname: "/x.html", hash: "" }, navigator: { languages: langs },
      document: { readyState: "complete", cookie: cookie || "", documentElement: de,
        querySelectorAll: function () { return []; }, getElementsByTagName: function () { return []; },
        getElementById: function () { return null; }, addEventListener: function () {} } };
    c.window = c;
    vm.createContext(c);
    vm.runInContext(src, c);
    return { I: c.NT.i18n, de: de };
  }
  var r = mk("", ["en"]);
  eq("SUPPORTED_LANGS", r.I.SUPPORTED_LANGS.join(","), "nl,en,de,fr,es,it,pl,pt-BR,pt-PT,sv,nb,ro,hu,lv,ru,el,he,hi,ar,sq,sw,zh,ja,ko,id");
  [
    [["id"], "id"], [["id-ID"], "id"], [["ID_id", "en"], "id"], [["Id-id"], "id"],
    [["in"], "id"], [["in-ID"], "id"], [["IN_id", "en"], "id"], [["In"], "id"], [["in", "ko"], "id"],
    [["inh", "en"], "en"], [["inh-RU", "id"], "id"], [["ind", "en"], "en"], [["ms-MY", "id"], "id"], [["ms", "en"], "en"],
    [["jv-ID", "id"], "id"], [["su", "en"], "en"], [["en-ID", "id"], "en"], [["th", "in"], "id"],
    [["iw", "id"], "he"], [["no", "in"], "nb"], [["pt-BR", "id"], "pt-BR"], [["zh-TW", "id"], "zh"], [["he-IL", "in"], "he"],
    [["iw"], "he"], [["no-NO"], "nb"], [["ko-KR"], "ko"], [["zh-Hant-TW"], "zh"], [["en-US"], "en"]
  ].forEach(function (t) { eq("detect " + t[0].join(","), mk("", t[0]).I.detectDefaultLang(), t[1]); });
  var x = mk("?lang=id", ["en"]);
  eq("load id lang", x.de.lang, "id");
  eq("load id dir", x.de.getAttribute("dir"), null);
  x.I.setLang("ar");
  eq("ar dir", x.de.getAttribute("dir"), "rtl");
  eq("setLang id after ar", x.I.setLang("id"), true);
  eq("id after ar lang", x.de.lang, "id");
  eq("id after ar dir", x.de.getAttribute("dir"), null);
  x.I.setLang("he");
  x.I.setLang("id");
  eq("id after he dir", x.de.getAttribute("dir"), null);
  x.I.setLang("ar");
  eq("ar after id dir", x.de.getAttribute("dir"), "rtl");
  eq("?lang=in falls through", mk("?lang=in", ["en"]).de.lang, "en");
  eq("?lang=in falls through to detected id", mk("?lang=in", ["in-ID", "en"]).de.lang, "id");
  eq("cookie in falls through", mk("", ["en"], "site-lang=in").de.lang, "en");
  eq("cookie id", mk("", ["en"], "site-lang=id").de.lang, "id");
  eq("?lang=ID falls through", mk("?lang=ID", ["en"]).de.lang, "en");
  ["in", "in-ID", "IN", "id-ID", "ID", "Id", "iD", "ind", "msa", "ms", "ms-MY", " id", "id "].forEach(function (v) {
    eq("setLang " + JSON.stringify(v), r.I.setLang(v), false);
  });
  r.I.register("tridgate", {
    en: { count: { one: "{count} one", other: "{count} other" } },
    id: { count: { other: "{count} other" } }
  });
  r.I.setLang("id");
  [0, 1, 2, 1.5, 21, 100, 1000000].forEach(function (n) {
    eq("id plural " + n, r.I.translate("tridgate.count", { count: n }), n + " other");
  });
  if (!/var RTL_LANGS = Object\.freeze\(\['he', 'ar'\]\);/.test(src)) say("RTL-LANGS-CHANGED");
  var o = showBase(file).split("\n"), n = src.split("\n");
  var ins = -1;
  for (var i = 1; i + 1 < n.length; i++) {
    if (/^\s*\/\/ Indonesian: in is the withdrawn ISO 639 code for Indonesian/.test(n[i]) && /^\s*if \(parts\[0\] === 'in'\) return 'id';\s*$/.test(n[i + 1])) { ins = i; break; }
  }
  if (ins < 0) say("ENGINE-CODE in-branch missing (comment line + `if (parts[0] === 'in') return 'id';`)");
  else {
    if (!/^\s*if \(parts\[0\] === 'iw'\) return 'he';\s*$/.test(n[ins - 1])) say("ENGINE-CODE in-branch not directly after the iw branch");
    var ind = function (s) { return (/^\s*/.exec(s) || [""])[0]; };
    if (ind(n[ins]) !== ind(n[ins - 1]) || ind(n[ins + 1]) !== ind(n[ins - 1])) say("ENGINE-CODE in-branch indentation differs from the iw branch");
    n.splice(ins, 2);
  }
  if (o.length !== n.length) say("ENGINE-CODE line count (excluding the in-branch)", o.length, "->", n.length);
  else {
    var diffs = [];
    for (var j = 0; j < o.length; j++) if (o[j] !== n[j]) diffs.push(j);
    diffs.forEach(function (j) {
      var ok = /var SUPPORTED_LANGS = /.test(n[j]) || (/^\s*\/\/ registry\[ns\]\[lang\]\[flatKey\]/.test(o[j]) && /^\s*\/\/ registry\[ns\]\[lang\]\[flatKey\].*\(zh, ja, ko, id\)\s*$/.test(n[j]));
      if (!ok) say("ENGINE-CODE changed line", j + 1, JSON.stringify(n[j]).slice(0, 140));
    });
    if (!diffs.some(function (j) { return /var SUPPORTED_LANGS = /.test(n[j]); })) say("ENGINE-CODE SUPPORTED_LANGS unchanged");
    if (!diffs.some(function (j) { return /^\s*\/\/ registry\[ns\]/.test(n[j]); })) say("ENGINE-CODE registry comment does not name id");
  }
  finish("ENGINE-ID");
}

/* ---------- checker ---------- */

function checkerMode() {
  var c = require(CHECK_PATH);
  var missing = ["SWITCHER_OPTIONS", "LANG_CODES", "RTL_LANGS", "PLURAL_EXTRA_CATEGORIES", "PLURAL_OTHER_ONLY_LANGS",
    "CJK_LANGS", "DIGIT_PARITY_LANGS", "SCRIPT_RULES", "expectedPluralCategories", "isProse", "pluralCategoryFindings",
    "checkPluralEntry", "scriptFindings", "charFindings", "bidiFindings", "digitParityFindings", "cjkFindings"].filter(function (k) { return !(k in c); });
  if (missing.length) { say("EXPORT-MISSING", missing.join(",")); finish("CHECKER-ID"); }
  eq("switcher tail", c.SWITCHER_OPTIONS.slice(-3).map(function (o) { return o.value + "/" + o.lang + "/" + o.label; }),
    ["ja/ja/日本語", "ko/ko/한국어", "id/id/Bahasa Indonesia"]);
  eq("LANG_CODES length", c.LANG_CODES.length, 25);
  eq("RTL_LANGS", c.RTL_LANGS, ["he", "ar"]);
  eq("PLURAL_OTHER_ONLY_LANGS", c.PLURAL_OTHER_ONLY_LANGS, ["zh", "ja", "ko", "id"]);
  eq("CJK_LANGS", c.CJK_LANGS, ["zh", "ja", "ko"]);
  eq("DIGIT_PARITY_LANGS", c.DIGIT_PARITY_LANGS, ["hi", "ar", "sq", "sw", "zh", "ja", "ko", "id"]);
  eq("plural id", c.expectedPluralCategories("id"), ["other"]);
  eq("plural en", c.expectedPluralCategories("en"), ["one", "other"]);
  eq("plural sq", c.expectedPluralCategories("sq"), ["one", "other"]);
  eq("plural zh", c.expectedPluralCategories("zh"), ["other"]);
  eq("plural ar", c.expectedPluralCategories("ar"), ["few", "many", "one", "other", "two", "zero"]);
  eq("no extra id", "id" in c.PLURAL_EXTRA_CATEGORIES, false);
  eq("no script rule id", "id" in c.SCRIPT_RULES, false);
  eq("autonym neutral", c.isProse("Bahasa Indonesia"), false);
  none("plural cats", c.pluralCategoryFindings());
  var EN2 = { one: "{count} step", other: "{count} steps" };
  none("id other-only plural", c.checkPluralEntry("t", "k", "id", { other: "{count} langkah" }, EN2));
  has("id extra one", c.checkPluralEntry("t", "k", "id", { one: "{count} langkah", other: "{count} langkah" }, EN2), "PLURAL-SHAPE");
  has("id missing count", c.checkPluralEntry("t", "k", "id", { other: "langkah" }, EN2), "PLACEHOLDERS");
  has("id string for plural", c.checkPluralEntry("t", "k", "id", "{count} langkah", EN2), "PLURAL-SHAPE");
  none("id script (no rule)", c.scriptFindings("t.k", "id", "Klik Putar untuk memulai.", "Click Play to start."));
  none("id chars clean", c.charFindings("t.k", "id", "Bilangan prima “contoh” — φ(n), gcd(a, b), Bézout."));
  has("id fullwidth paren", c.charFindings("t.k", "id", "bilangan （prima）"), "FULLWIDTH-FORM");
  has("id decomposed", c.charFindings("t.k", "id", "Be\u0301zout"), "NOT-NFC");
  has("id zero width", c.charFindings("t.k", "id", "bilang\u200ban"), "ZERO-WIDTH");
  none("id bidi", c.bidiFindings("t.k", "id", "48 = 2 × 18 + 12 dan 7-3"));
  has("id comma decimal", c.digitParityFindings("t.k", "id", "16,8 juta", "16.8 million"), "DIGIT-PARITY");
  has("id dot grouping", c.digitParityFindings("t.k", "id", "1.000 langkah", "1,000 steps"), "DIGIT-PARITY");
  has("id word for digit", c.digitParityFindings("t.k", "id", "Langkah ketiga", "Step 3"), "DIGIT-PARITY");
  none("id reorder", c.digitParityFindings("t.k", "id", "{count} dari 12 langkah", "{count} of 12 steps"));
  none("id words for words", c.digitParityFindings("t.k", "id", "satu miliar kali", "a billion times"));
  none("id scale word", c.digitParityFindings("t.k", "id", "di bawah 1 triliun", "under 1 trillion"));
  none("id not cjk", c.cjkFindings("t.k", "id", "1 万", "1 step"));
  finish("CHECKER-ID");
}

/* ---------- batch ---------- */

var AVOID = [
  // Malay (Malaysia/Brunei) forms whose standard Indonesian equivalent differs
  "nombor", "perdana", "baki", "bahagi", "dibahagi", "pembahagi", "pembahagian", "darab", "didarab", "pendaraban",
  "songsang", "awam", "peribadi", "persendirian", "kekunci", "padam", "dipadam", "papar", "paparan", "skrin",
  "tetikus", "sifar", "gandaan", "pekali", "nisbah", "perduaan", "kuasa", "teorem", "kebarangkalian",
  "set semula", "faktor sepunya", "kunci awam",
  // non-standard (non-baku) spellings per KBBI
  "silahkan", "merubah", "dirubah", "praktek", "analisa", "sistim", "kwadrat", "obyek", "nampak", "ijin", "resiko",
  "detil", "tehnik", "sekedar", "mengkalikan", "dimana", "kemana", "darimana", "disini", "disitu", "algoritme",
  // English forms the plan replaces (D-TERMS, D-AVOID)
  "algorithm", "algorithms", "plaintext", "ciphertext", "brute force", "generator", "totient",
  // Tiongkok is the official name since 2014 (D-NAMES)
  "cina"
];
var OWN = W("dan|yang|di|ke|dari|untuk|dengan|ini|itu|adalah|atau|pada|dalam|tidak|akan|bisa|dapat|setiap|tiap|jika|bila|ketika|saat|lalu|kemudian|sebagai|oleh|juga|hanya|semua|sampai|hingga|agar|karena|tetapi|sudah|masih|harus|ada|bukan|tanpa|antara|lebih|telah|maka|sehingga|Anda|tersebut|apakah|sama|belum|per");
var EN_WORDS = "the|and|with|from|this|that|click|press|choose|enter|step|steps|number|numbers|prime|primes|value|values|each|which|when|then|into|your|are|was|were|has|have|for|of|to|is|in|on|by|or|not|it|key|keys|public|private|table|tree|show|hide|start|stop|clear|random|result|first|next|last";
var ENRE = new RegExp("(?<![\\p{L}\\p{N}_.])(?:" + EN_WORDS + ")(?![\\p{L}\\p{N}_])", "giu");
var LATIN = ["nl", "de", "fr", "es", "it", "pl", "pt-BR", "pt-PT", "sv", "nb", "ro", "hu", "lv"];
var HEADER_PLURAL_FILES = ["cayley-table.js", "eulers-totient.js", "rsa.js", "sieve-of-eratosthenes.js", "square-and-multiply.js"];
var REDUP = /(?:\{[A-Za-z0-9_]+\}|[0-9])\s+(\p{L}+)-\1(?![\p{L}])/iu;

function batchMode(files) {
  var C = require(CHECK_PATH);
  if (!files.length) say("NO-FILES");
  var avoid = AVOID.map(function (w) { return [w, W(w.replace(/ /g, "\\s+"))]; });
  var strip = function (s) { return String(s).replace(/\{[A-Za-z0-9_]+\}/g, " "); };
  var site = loadDicts(fs.readFileSync(I18N_DIR + "site.js", "utf8")).site;
  var navTitle = {};
  if (site && site[L]) Object.keys(site.en).forEach(function (k) {
    if (/^nav\./.test(k) && (String(site.en[k]).match(/\p{L}{2,}/gu) || []).length >= 2) navTitle[site.en[k]] = site[L][k];
  });
  var st = { n4: 0, own: 0, prose: 0, shared: {} };
  files.forEach(function (f) {
    var raw = fs.readFileSync(I18N_DIR + f, "utf8");
    var header = raw.split("(function")[0];
    if (/\btwenty-four\b/i.test(raw)) say("STALE-COUNT", f);
    if (!/\btwenty-five\b/i.test(header)) say("COUNT-MISSING", f);
    if (HEADER_PLURAL_FILES.indexOf(f) !== -1 && !/\{ other \}[^.]*Indonesian/.test(header.replace(/\s+/g, " "))) say("PLURAL-HEADER", f, "header plural sentence does not name Indonesian with the { other } shape");
    var o = loadDicts(showBase(I18N_DIR + f)), n = loadDicts(raw);
    Object.keys(o).forEach(function (ns) {
      Object.keys(o[ns]).forEach(function (l) {
        if (JSON.stringify(o[ns][l]) !== JSON.stringify(n[ns] && n[ns][l])) say("DICT-CHANGED", f, ns, l);
      });
      if (!n[ns]) { say("NS-MISSING", f, ns); return; }
      var langs = Object.keys(n[ns]);
      if (langs[langs.length - 1] !== L) say("ID-NOT-LAST", f, ns, langs.slice(-2).join(","));
      langs.forEach(function (l) { if (!(l in o[ns]) && l !== L) say("DICT-EXTRA", f, ns, l); });
      var en = n[ns].en, d = n[ns][L];
      if (!d) { say("NO-ID", f, ns); return; }
      if (Object.keys(d).join("|") !== Object.keys(en).join("|")) say("KEY-ORDER", f, ns);
      Object.keys(d).forEach(function (k) {
        var isPlural = en[k] && typeof en[k] === "object";
        if (isPlural && !(d[k] && typeof d[k] === "object" && Object.keys(d[k]).join(",") === "other")) say("PLURAL-SHAPE", f, ns, k);
        var cats = isPlural ? Object.keys(d[k] || {}) : [""];
        cats.forEach(function (cat) {
          var s = String(cat ? d[k][cat] : d[k]);
          var ev = String(form(en[k], cat || "other"));
          var id = [f, ns, k, cat].filter(Boolean).join(" ");
          if (/[\u200e\u200f\u202a-\u202e\u2066-\u2069]/.test(s)) say("BIDI-MARK", id);
          var letters = s.normalize("NFC").match(/\p{L}/gu) || [];
          for (var i = 0; i < letters.length; i++) {
            var ch = letters[i];
            if (/[A-Za-z]/.test(ch) || ch === "φ" || ev.indexOf(ch) !== -1) continue;
            say("FOREIGN-LETTER", id, JSON.stringify(ch));
            break;
          }
          var a = avoid.filter(function (p) { return p[1].test(s); })[0];
          if (a) say("AVOID", id, JSON.stringify(a[0]));
          if (/(?<![\p{L}\p{N}_])anda(?![\p{L}\p{N}_])/u.test(s)) say("ANDA-CASE", id, "the pronoun is written Anda");
          if (/\p{L}['\u2019]s(?![\p{L}])/u.test(s)) say("APOSTROPHE-S", id, "Indonesian has no possessive -s: juxtapose (kunci publik Alice)");
          var rd = REDUP.exec(s);
          if (rd) say("REDUP-AFTER-NUM", id, JSON.stringify(rd[0]));
          var hits = {};
          (strip(s).match(ENRE) || []).forEach(function (w) { hits[w.toLowerCase()] = true; });
          Object.keys(hits).forEach(function (w) {
            var re = W(w);
            var kept = LATIN.filter(function (m) { return re.test(strip(form(n[ns][m] && n[ns][m][k], cat || "other") || "")); }).length;
            if (kept < 7) say("ENGLISH-WORD", id, w);
          });
          if ((ev.match(/\p{L}{2,}/gu) || []).length >= 4) { st.n4++; if (OWN.test(s)) st.own++; }
          var full = ns + "." + k;
          if (s === ev && C.isProse(ev) && D_SAME.indexOf(full) === -1) say("SAME-AS-EN", id, JSON.stringify(s).slice(0, 80));
          if (ns !== "site" && Object.prototype.hasOwnProperty.call(navTitle, ev) && D_SAME.indexOf(full) === -1 && s !== navTitle[ev]) say("NAV-TITLE", id, JSON.stringify(s), "want", JSON.stringify(navTitle[ev]));
          if (C.isProse(s)) {
            st.prose++;
            Object.keys(n[ns]).forEach(function (m) {
              if (m === L || m === "en" || s === ev) return;
              if (s === String(form(n[ns][m] && n[ns][m][k], cat || "other"))) st.shared[m] = (st.shared[m] || 0) + 1;
            });
          }
        });
      });
    });
  });
  if (st.n4 && st.own < 0.7 * st.n4) say("OWN-WORDS", st.own + "/" + st.n4);
  Object.keys(st.shared).forEach(function (m) { if (st.shared[m] > Math.max(3, 0.05 * st.prose)) say("SHARED-VALUES", m, st.shared[m] + "/" + st.prose); });
  console.log("STATS id own=" + st.own + "/" + st.n4 + " prose=" + st.prose + " maxShared=" + JSON.stringify(Object.keys(st.shared).map(function (m) { return [m, st.shared[m]]; }).sort(function (x, y) { return y[1] - x[1]; }).slice(0, 2)));
  finish("ID-BATCH");
}

/* ---------- glossary ---------- */

function glossaryMode(args) {
  var skipCD = args.indexOf("--no-cd") !== -1;
  var skipSupp = skipCD || args.indexOf("--no-supp") !== -1;
  var c = loadDicts(fs.readFileSync(I18N_DIR + "site.js", "utf8"));
  var g = fs.readFileSync(GLOSSARY, "utf8");
  function tab(a, b) {
    var parts = g.split(a);
    if (parts.length < 2) { say("SECTION-MISSING", String(a)); return [[]]; }
    var s = b ? parts[1].split(b)[0] : parts[1];
    return s.split("\n").filter(function (l) { return /^\|/.test(l); }).map(function (l) { return l.split("|").slice(1, -1).map(function (x) { return x.trim(); }); });
  }
  // (b)'s first column is the tool identifier, itself headed "id"; the Indonesian column is the last header "id" or "id (Indonesian)" after column 0.
  function idCol(header) {
    for (var i = header.length - 1; i > 0; i--) if (/^id(?: \(Indonesian\))?$/.test(header[i])) return i;
    return -1;
  }
  function cmp(name, rows, get, want) {
    var col = idCol(rows[0]);
    if (col < 0) { say("NO-ID-COLUMN", name); return; }
    var cnt = 0;
    rows.slice(2).forEach(function (r) {
      var v = get(r[0]);
      if (v === undefined) return;
      cnt++;
      if (String(r[col]).replace(/^[^\p{L}\p{N}]+/u, "") !== String(v).replace(/^[^\p{L}\p{N}]+/u, "")) say("GLOSSARY-DRIFT", name, r[0], JSON.stringify(r[col]), JSON.stringify(v));
    });
    if (cnt !== want) say("ROWS", name, cnt);
  }
  cmp("b", tab(/^## \(b\)/m, /^## \(c\)/m), function (k) { return c.site[L] && c.site[L]["nav." + k]; }, 16);
  cmp("f", tab(/^## \(f\)/m, null), function (k) { var m = /^common\.([A-Za-z0-9]+)$/.exec(k); return m && c.common[L] ? c.common[L][m[1]] : undefined; }, 8);
  if (!skipCD) {
    [["c", tab(/^## \(c\)/m, /^### /m)], ["d", tab(/^## \(d\)/m, /^## \(e\)/m)]].forEach(function (pair) {
      var rows = pair[1], col = idCol(rows[0]);
      if (col < 0 || rows.slice(2).some(function (r) { return !r[col]; })) say(pair[0].toUpperCase() + "-COLUMN-INCOMPLETE");
    });
  }
  if (!skipSupp && !/^### Indonesian supplementary terms/m.test(g)) say("SUPPLEMENTARY-TABLE-MISSING");
  if (!/^\| Indonesian \(id\) `\[ASSUMED\]` \|/m.test(g)) say("TONE-ROW-MISSING");
  if (g.indexOf("**Indonesian (id) `[ASSUMED]`:**") === -1) say("ENTRY-MISSING");
  if (/\btwenty-four\b/i.test(g)) say("STALE-COUNT", GLOSSARY);
  if (!/Indonesian \(added 2026-10-08 by quick task 261008-0h2\)/.test(g)) say("E-SENTENCE-MISSING");
  finish("GLOSSARY-ID");
}

/* ---------- pagecode ---------- */

var OPTION_PAIR = /^([ \t]*)<option value="ko" lang="ko">한국어<\/option>\n([ \t]*)<option value="id" lang="id">Bahasa Indonesia<\/option>\n/m;

function pagecodeMode() {
  var files = git(["ls-files", "*.html", "assets"]).trim().split("\n").filter(function (f) {
    return !/^assets\/i18n\//.test(f) && f !== "assets/nt-i18n.js";
  });
  files.forEach(function (f) {
    var o = showBase(f), n = fs.readFileSync(f, "utf8");
    var stripped = n;
    if (/\.html$/.test(f)) {
      var m = OPTION_PAIR.exec(n);
      if (!m) { say("SWITCHER-LINE-MISSING", f); return; }
      if (m[1] !== m[2]) say("SWITCHER-INDENT", f);
      stripped = n.replace(OPTION_PAIR, function (all, i1) { return i1 + '<option value="ko" lang="ko">한국어</option>\n'; });
    }
    if (stripped !== o) say("CODE-CHANGED", f);
  });
  console.log("PAGE-CODE files=" + files.length);
  finish("PAGE-CODE");
}

/* ---------- config ---------- */

function configMode(only) {
  var cat = loadAll();
  fs.readdirSync(CONFIG_DIR).forEach(function (f) {
    var checkValues = !only.length || only.indexOf(f) !== -1; // parallel tasks: value-dependent checks only for the named files
    var o = JSON.parse(showBase(CONFIG_DIR + f)), n = JSON.parse(fs.readFileSync(CONFIG_DIR + f, "utf8"));
    function shape(x) { return JSON.stringify(Object.assign({}, x, { allowSame: Object.keys(x.allowSame || {}), allowRenderText: Object.keys(x.allowRenderText || {}) })); }
    if (shape(o) !== shape(n)) say("CONFIG-SHAPE", f);
    var extended = {};
    ["allowSame", "allowRenderText"].forEach(function (s) {
      Object.keys(n[s] || {}).forEach(function (k) {
        var ov = o[s] && o[s][k], nv = n[s][k];
        if (ov === nv) return;
        if (typeof ov === "string" && nv.indexOf(ov) === 0 && /261008-0h2/.test(nv.slice(ov.length)) && /Indonesian/.test(nv.slice(ov.length))) extended[s + "|" + k] = true;
        else say("CONFIG-REASON", f, s, k);
      });
    });
    if (checkValues) Object.keys(n.allowSame || {}).forEach(function (key) {
      var dot = key.indexOf(".");
      var ns = key.slice(0, dot), k = key.slice(dot + 1);
      var d = cat[ns];
      if (!d || !d[L] || !(k in d[L])) return;
      var same = JSON.stringify(d[L][k]) === JSON.stringify(d.en[k]);
      var need = same && FORMULA_SAME.indexOf(key) === -1;
      var enText = typeof d.en[k] === "string" ? d.en[k] : null;
      if (need && !extended["allowSame|" + key]) say("CONFIG-NOT-EXTENDED", f, "allowSame", key, "(id value equals English)");
      if (!need && extended["allowSame|" + key]) say("CONFIG-NEEDLESS", f, "allowSame", key, "(id value differs from English or the reason already covers every language)");
      if (enText !== null && n.allowRenderText && enText in n.allowRenderText) {
        if (need && !extended["allowRenderText|" + enText]) say("CONFIG-NOT-EXTENDED", f, "allowRenderText", JSON.stringify(enText));
        if (!need && extended["allowRenderText|" + enText]) say("CONFIG-NEEDLESS", f, "allowRenderText", JSON.stringify(enText));
      }
    });
  });
  finish("CONFIG");
}

/* ---------- unify ---------- */

function unifyMode(args) {
  var allow = {};
  for (var i = 0; i < args.length; i++) if (args[i] === "--allow") String(args[++i]).split(",").forEach(function (k) { allow[k] = true; });
  D_SAME.forEach(function (k) { allow[k] = true; });
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
      var v = cat[id.slice(0, dot)][L] && cat[id.slice(0, dot)][L][id.slice(dot + 1)];
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
  var counted = DOCS.concat([GLOSSARY]).concat(fs.readdirSync(I18N_DIR).filter(function (f) { return /\.js$/.test(f); }).map(function (f) { return I18N_DIR + f; }));
  counted.forEach(function (f) { if (/\btwenty-four\b/i.test(fs.readFileSync(f, "utf8"))) say("STALE-COUNT", f); });
  DOCS.forEach(function (f) {
    var o = showBase(f), n = fs.readFileSync(f, "utf8");
    if (/\btwenty-four\b/i.test(o) && !/\btwenty-five\b/i.test(n)) say("NO-COUNT", f);
    var sixteen = function (s) { return (s.match(/\b(?:16|sixteen)\b/gi) || []).length; };
    if (sixteen(o) !== sixteen(n)) say("SIXTEEN-CHANGED", f, sixteen(o), "->", sixteen(n));
    (n.match(/sw(?:, |\/)zh(?:, |\/)ja(?:, |\/)ko.{0,4}/g) || []).forEach(function (m) {
      if (!/^sw(?:, zh, ja, ko, id|\/zh\/ja\/ko\/id)/.test(m)) say("LIST-WITHOUT-ID", f, JSON.stringify(m));
    });
    if (/Korean/.test(o) && !/Indonesian/.test(n)) say("NO-INDONESIAN", f);
    if (/`iw`/.test(o) && !/`in`/.test(n)) say("NO-IN-RULE", f, "names the legacy iw rule but not the legacy in -> id rule");
    var re = /\{other\}/g, m2;
    // PROJECT.md mentions {other} only inside the historical 261007-pbf Key Decisions row, which stays as written.
    while (f !== ".planning/PROJECT.md" && (m2 = re.exec(n))) {
      if (!/Indonesian/.test(n.slice(Math.max(0, m2.index - 300), m2.index + 300))) { say("OTHER-SHAPE-WITHOUT-ID", f, "offset " + m2.index); break; }
    }
  });
  if (fs.readFileSync(".planning/REQUIREMENTS.md", "utf8").indexOf("Bahasa Indonesia") === -1) say("NO-AUTONYM", ".planning/REQUIREMENTS.md");
  [".planning/PROJECT.md", ".planning/REQUIREMENTS.md"].forEach(function (f) { if (!/261008-0h2/.test(fs.readFileSync(f, "utf8"))) say("NO-TASK-ID", f); });
  finish("DOCS-ID");
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
  if (nonEn !== 24) say("LANG-COUNT", "expected 24 non-English languages, LANG_CODES gives", nonEn);
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

var mode = process.argv[2];
var rest = process.argv.slice(3);
if (mode === "engine") engineMode();
else if (mode === "checker") checkerMode();
else if (mode === "batch") batchMode(rest);
else if (mode === "glossary") glossaryMode(rest);
else if (mode === "pagecode") pagecodeMode();
else if (mode === "config") configMode(rest);
else if (mode === "unify") unifyMode(rest);
else if (mode === "docs") docsMode();
else if (mode === "sweep") sweepMode(rest);
else { console.log("usage: id-gate.js engine|checker|batch <files...>|glossary [--no-cd|--no-supp]|pagecode|config [f.json...]|unify [--allow ...]|docs|sweep <pages...>"); process.exit(2); }
