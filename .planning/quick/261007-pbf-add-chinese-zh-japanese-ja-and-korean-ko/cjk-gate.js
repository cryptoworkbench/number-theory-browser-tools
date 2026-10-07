#!/usr/bin/env node
/* cjk-gate.js — plan-local gates for quick task 261007-pbf (Chinese zh,
 * Japanese ja, Korean ko). Dev-only, never shipped, never referenced by a page.
 * Run from the repository root:
 *
 *   node .planning/quick/261007-pbf-add-chinese-zh-japanese-ja-and-korean-ko/cjk-gate.js <mode> [files...]
 *
 * Modes (each prints "<NAME> bad=<n>" and exits 1 when n > 0):
 *   engine            ENGINE-CJK: assets/nt-i18n.js behaviour for zh/ja/ko
 *                     (detection, rejection, LTR transitions, {other}-only
 *                     plurals) plus ENGINE-CODE: only the SUPPORTED_LANGS line
 *                     and the registry comment line differ from BASE.
 *   checker           CHECKER-CJK: i18n-check.js tables and findings for zh/ja/ko.
 *   batch <files...>  CJK-BATCH over assets/i18n/<file> data files: existing
 *                     languages unchanged from BASE, zh/ja/ko last and complete,
 *                     plural shape, count words, avoided spellings, spacing,
 *                     punctuation, particles, kana presence, zh/ja copying.
 *   glossary [--no-cd] GLOSSARY-CJK: 06-GLOSSARY.md zh/ja/ko entries and the
 *                     (b)/(f) columns equal to site.js; without --no-cd also
 *                     the (c) and (d) columns complete.
 *   pagecode          PAGE-CODE: page/asset code unchanged from BASE apart from
 *                     the three switcher lines per page and one-line rules
 *                     scoped to :root[lang="zh"|"ja"|"ko"].
 *   config            CONFIG: i18n-config/*.json unchanged from BASE apart from
 *                     reason texts extended with a sentence naming 261007-pbf.
 *   unify [--allow ns.key,...]  UNIFY: one zh/ja/ko rendering per repeated
 *                     multi-word English value across all namespaces.
 *   sweep <pages...>  SWEEP: i18n-browser.js --mode switch,layout on each page,
 *                     one page at a time, holding one of two machine-wide slots
 *                     (lock files in the git dir) so that no more than two
 *                     sweeps ever run at once. A page passes with
 *                     "switch PASS ... langs=23" and "layout PASS"; Factor Tree
 *                     and Venn may instead print exactly their 23 documented
 *                     pre-existing switch lines (one per non-English language)
 *                     and nothing else. A failing page is rerun once.
 *                     Takes about 3 minutes per page; run it in the background.
 *
 * BASE defaults to 22790dc (HEAD when this task was planned); override with
 * CJK_GATE_BASE=<rev> for a dry run elsewhere.
 */
"use strict";

var fs = require("fs");
var vm = require("vm");
var cp = require("child_process");

var BASE = process.env.CJK_GATE_BASE || "22790dc";
var CJK = ["zh", "ja", "ko"];
var I18N_DIR = "assets/i18n/";
var CHECK_PATH = require("path").resolve(process.cwd(), ".planning/phases/06-multi-language-support/i18n-check.js");
var GLOSSARY = ".planning/phases/06-multi-language-support/06-GLOSSARY.md";
var CONFIG_DIR = ".planning/phases/06-multi-language-support/i18n-config/";

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
function form(v, cat) { return v == null ? undefined : (typeof v === "object" ? (cat in v ? v[cat] : v.other) : v); }

/* ---------- engine ---------- */

function engineMode() {
  var file = "assets/nt-i18n.js";
  var src = fs.readFileSync(file, "utf8");
  function mk(q, langs) {
    var de = { lang: "", attrs: {},
      setAttribute: function (k, v) { this.attrs[k] = String(v); },
      removeAttribute: function (k) { delete this.attrs[k]; },
      getAttribute: function (k) { return k in this.attrs ? this.attrs[k] : null; } };
    var c = { location: { search: q, pathname: "/x.html", hash: "" }, navigator: { languages: langs },
      document: { readyState: "complete", cookie: "", documentElement: de,
        querySelectorAll: function () { return []; }, getElementsByTagName: function () { return []; },
        getElementById: function () { return null; }, addEventListener: function () {} } };
    c.window = c;
    vm.createContext(c);
    vm.runInContext(src, c);
    return { I: c.NT.i18n, de: de };
  }
  var r = mk("", ["en"]);
  eq("SUPPORTED_LANGS", r.I.SUPPORTED_LANGS.join(","), "nl,en,de,fr,es,it,pl,pt-BR,pt-PT,sv,nb,ro,hu,lv,ru,el,he,hi,ar,sq,sw,zh,ja,ko");
  [
    [["zh"], "zh"], [["zh-CN"], "zh"], [["ZH_tw", "en"], "zh"], [["zh-Hant-TW"], "zh"], [["zh-Hans-SG"], "zh"],
    [["zh-HK"], "zh"], [["zh_Hant_MO"], "zh"], [["zho", "en"], "zh"], [["cmn-Hans-CN", "en"], "en"],
    [["yue-HK", "zh-HK"], "zh"], [["ja"], "ja"], [["ja-JP"], "ja"], [["JA_jp", "en"], "ja"], [["jpn", "en"], "en"],
    [["ko"], "ko"], [["ko-KR"], "ko"], [["KO_kp", "en"], "ko"], [["kor", "en"], "ko"],
    [["en-SG", "zh"], "en"], [["th", "ja"], "ja"], [["zh-TW", "ko"], "zh"], [["he-IL", "ko"], "he"],
    [["pt-BR", "zh"], "pt-BR"], [["no", "ja"], "nb"], [["iw", "ko"], "he"]
  ].forEach(function (t) { eq("detect " + t[0].join(","), mk("", t[0]).I.detectDefaultLang(), t[1]); });
  CJK.forEach(function (L) {
    var x = mk("?lang=" + L, ["en"]);
    eq("load " + L + " lang", x.de.lang, L);
    eq("load " + L + " dir", x.de.getAttribute("dir"), null);
    x.I.setLang("ar");
    eq("ar dir", x.de.getAttribute("dir"), "rtl");
    eq("setLang " + L + " after ar", x.I.setLang(L), true);
    eq(L + " after ar lang", x.de.lang, L);
    eq(L + " after ar dir", x.de.getAttribute("dir"), null);
    x.I.setLang("he");
    x.I.setLang(L);
    eq(L + " after he dir", x.de.getAttribute("dir"), null);
    x.I.setLang("ar");
    eq("ar after " + L + " dir", x.de.getAttribute("dir"), "rtl");
  });
  ["zh-CN", "zh-TW", "zh-Hans", "zh-Hant", "ZH", "Zh", "zho", "chi", "cmn", "ja-JP", "JA", "jpn", "ko-KR", "KO", "kor"].forEach(function (v) {
    eq("setLang " + v, r.I.setLang(v), false);
  });
  r.I.register("trcjkgate", {
    en: { count: { one: "{count} one", other: "{count} other" } },
    zh: { count: { other: "{count} other" } },
    ja: { count: { other: "{count} other" } },
    ko: { count: { other: "{count} other" } }
  });
  CJK.forEach(function (L) {
    r.I.setLang(L);
    [0, 1, 2, 1.5, 21, 100, 1000000].forEach(function (n) {
      eq(L + " plural " + n, r.I.translate("trcjkgate.count", { count: n }), n + " other");
    });
  });
  if (!/var RTL_LANGS = Object\.freeze\(\['he', 'ar'\]\);/.test(src)) say("RTL-LANGS-CHANGED");
  var o = showBase(file).split("\n"), n = src.split("\n");
  if (o.length !== n.length) say("ENGINE-CODE line count", o.length, "->", n.length);
  else {
    var diffs = [];
    for (var i = 0; i < o.length; i++) if (o[i] !== n[i]) diffs.push(i);
    diffs.forEach(function (i) {
      var ok = /var SUPPORTED_LANGS = /.test(n[i]) || (/^\s*\/\/ registry\[ns\]\[lang\]\[flatKey\]/.test(o[i]) && /^\s*\/\/ registry\[ns\]\[lang\]\[flatKey\]/.test(n[i]));
      if (!ok) say("ENGINE-CODE changed line", i + 1, JSON.stringify(n[i]).slice(0, 120));
    });
    if (!diffs.some(function (i) { return /var SUPPORTED_LANGS = /.test(n[i]); })) say("ENGINE-CODE SUPPORTED_LANGS unchanged");
  }
  finish("ENGINE-CJK");
}

/* ---------- checker ---------- */

function checkerMode() {
  var c = require(CHECK_PATH);
  var missing = ["SWITCHER_OPTIONS", "LANG_CODES", "RTL_LANGS", "PLURAL_EXTRA_CATEGORIES", "PLURAL_OTHER_ONLY_LANGS",
    "CJK_LANGS", "HAN_FORM_FORBIDDEN", "DIGIT_PARITY_LANGS", "SCRIPT_RULES", "expectedPluralCategories", "isProse",
    "pluralCategoryFindings", "checkPluralEntry", "scriptFindings", "charFindings", "bidiFindings",
    "digitParityFindings", "cjkFindings"].filter(function (k) { return !(k in c); });
  if (missing.length) { say("EXPORT-MISSING", missing.join(",")); finish("CHECKER-CJK"); }
  eq("switcher tail", c.SWITCHER_OPTIONS.slice(-4).map(function (o) { return o.value + "/" + o.lang + "/" + o.label; }),
    ["sw/sw/Kiswahili", "zh/zh/中文", "ja/ja/日本語", "ko/ko/한국어"]);
  eq("LANG_CODES length", c.LANG_CODES.length, 24);
  eq("RTL_LANGS", c.RTL_LANGS, ["he", "ar"]);
  eq("PLURAL_OTHER_ONLY_LANGS", c.PLURAL_OTHER_ONLY_LANGS, ["zh", "ja", "ko"]);
  eq("CJK_LANGS", c.CJK_LANGS, ["zh", "ja", "ko"]);
  eq("DIGIT_PARITY_LANGS", c.DIGIT_PARITY_LANGS, ["hi", "ar", "sq", "sw", "zh", "ja", "ko"]);
  eq("plural en", c.expectedPluralCategories("en"), ["one", "other"]);
  eq("plural sq", c.expectedPluralCategories("sq"), ["one", "other"]);
  eq("plural ar", c.expectedPluralCategories("ar"), ["few", "many", "one", "other", "two", "zero"]);
  CJK.forEach(function (L) {
    eq("plural " + L, c.expectedPluralCategories(L), ["other"]);
    eq("no extra " + L, L in c.PLURAL_EXTRA_CATEGORIES, false);
    eq("script rule " + L, L in c.SCRIPT_RULES, true);
    eq("autonym neutral " + L, c.isProse(L === "zh" ? "中文" : L === "ja" ? "日本語" : "한국어"), false);
  });
  none("plural cats", c.pluralCategoryFindings());
  var EN2 = { one: "{count} step", other: "{count} steps" };
  none("zh other-only plural", c.checkPluralEntry("t", "k", "zh", { other: "共 {count} 步" }, EN2));
  has("zh extra one", c.checkPluralEntry("t", "k", "zh", { one: "{count} 步", other: "{count} 步" }, EN2), "PLURAL-SHAPE");
  has("ja missing count", c.checkPluralEntry("t", "k", "ja", { other: "ステップ" }, EN2), "PLACEHOLDERS");
  has("ko string for plural", c.checkPluralEntry("t", "k", "ko", "{count}단계", EN2), "PLURAL-SHAPE");

  var ENP = "A prime has exactly two divisors.";
  none("zh script clean", c.scriptFindings("t.k", "zh", "素数恰好有两个约数。Alice 的公钥是 (e, n)，mod n 下的 gcd(a, b)。", ENP));
  none("ja script clean", c.scriptFindings("t.k", "ja", "素数の約数はちょうど2つです。Aliceの公開鍵とキーペア、ディフィー・ヘルマン、色々。", ENP));
  none("ko script clean", c.scriptFindings("t.k", "ko", "소수는 약수가 정확히 두 개입니다. Alice의 공개 키와 RSA를 사용합니다.", ENP));
  has("zh kana", c.scriptFindings("t.k", "zh", "素数のステップ", ENP), "SCRIPT-FOREIGN");
  has("zh hangul", c.scriptFindings("t.k", "zh", "素数 소수", ENP), "SCRIPT-FOREIGN");
  has("zh katakana middle dot", c.scriptFindings("t.k", "zh", "迪菲・赫尔曼", ENP), "SCRIPT-FOREIGN");
  has("zh prolonged sound mark", c.scriptFindings("t.k", "zh", "素数ー", ENP), "SCRIPT-FOREIGN");
  has("ja hangul", c.scriptFindings("t.k", "ja", "素数の소수", ENP), "SCRIPT-FOREIGN");
  has("ja cyrillic", c.scriptFindings("t.k", "ja", "素数の простое", ENP), "SCRIPT-FOREIGN");
  has("ko han", c.scriptFindings("t.k", "ko", "소수(素數)", ENP), "SCRIPT-FOREIGN");
  has("ko kana", c.scriptFindings("t.k", "ko", "소수 ステップ", ENP), "SCRIPT-FOREIGN");
  has("zh english leftover", c.scriptFindings("t.k", "zh", "点击 Play 开始", "Click Play to start"), "SCRIPT-LATIN");
  has("ja untranslated", c.scriptFindings("t.k", "ja", "Click to start", "Click to start"), "SCRIPT-MISSING");
  has("ko english leftover", c.scriptFindings("t.k", "ko", "Click 하세요", "Click here"), "SCRIPT-LATIN");
  has("ru han", c.scriptFindings("t.k", "ru", "Решето 筛", "Sieve"), "SCRIPT-FOREIGN");
  has("el hangul", c.scriptFindings("t.k", "el", "Κόσκινο 체", "Sieve"), "SCRIPT-FOREIGN");
  has("he kana", c.scriptFindings("t.k", "he", "נפה ふるい", "Sieve"), "SCRIPT-FOREIGN");
  has("hi han", c.scriptFindings("t.k", "hi", "छलनी 筛", "Sieve"), "SCRIPT-FOREIGN");
  has("ar hangul", c.scriptFindings("t.k", "ar", "غربال 체", "Sieve"), "SCRIPT-FOREIGN");

  none("zh chars clean", c.charFindings("t.k", "zh", "你好，世界：（测试）？！；“引号”、。《书名》【注】……——"));
  none("ja chars clean", c.charFindings("t.k", "ja", "「鍵」、様々。（例）：？！"));
  none("ko chars clean", c.charFindings("t.k", "ko", "소수: (예) “인용”, 끝."));
  has("fullwidth digit", c.charFindings("t.k", "zh", "第３步"), "NATIVE-DIGIT");
  has("fullwidth latin", c.charFindings("t.k", "zh", "ＲＳＡ 加密"), "FULLWIDTH-FORM");
  has("fullwidth equals", c.charFindings("t.k", "ja", "a＝b"), "FULLWIDTH-FORM");
  has("ideographic space", c.charFindings("t.k", "ja", "素数\u3000です"), "FULLWIDTH-FORM");
  has("halfwidth katakana", c.charFindings("t.k", "ja", "ｽﾃｯﾌﾟ"), "FULLWIDTH-FORM");
  has("wave dash range", c.charFindings("t.k", "ja", "1〜10"), "FULLWIDTH-FORM");
  has("ideographic zero", c.charFindings("t.k", "zh", "1〇"), "FULLWIDTH-FORM");
  has("ko fullwidth comma", c.charFindings("t.k", "ko", "소수，약수"), "FULLWIDTH-FORM");
  has("ko ideographic full stop", c.charFindings("t.k", "ko", "소수입니다。"), "FULLWIDTH-FORM");
  has("zh iteration mark", c.charFindings("t.k", "zh", "人々"), "FULLWIDTH-FORM");
  has("fr fullwidth paren", c.charFindings("t.k", "fr", "nombre （premier）"), "FULLWIDTH-FORM");
  has("ko decomposed hangul", c.charFindings("t.k", "ko", "한".normalize("NFD") + "국어"), "NOT-NFC");
  has("ja decomposed kana", c.charFindings("t.k", "ja", "か\u3099"), "NOT-NFC");
  has("zh zero width", c.charFindings("t.k", "zh", "素\u200b数"), "ZERO-WIDTH");

  CJK.forEach(function (L) { none("bidi " + L, c.bidiFindings("t.k", L, "48 = 2 × 18 + 12 和 7-3")); });

  has("zh myriad digits", c.digitParityFindings("t.k", "zh", "1680万", "16.8 million"), "DIGIT-PARITY");
  has("zh han numeral for digit", c.digitParityFindings("t.k", "zh", "第三步", "Step 3"), "DIGIT-PARITY");
  has("ko added digit", c.digitParityFindings("t.k", "ko", "2진법", "binary"), "DIGIT-PARITY");
  none("ko reorder", c.digitParityFindings("t.k", "ko", "12단계 중 {count}단계", "{count} of 12 steps"));
  none("ja han numeral words", c.digitParityFindings("t.k", "ja", "十億回", "a billion times"));

  none("cjk zh clean", c.cjkFindings("t.k", "zh", "（例如 RSA）点 (3, 4)，2、3、5 和 7", "(for example RSA) point (3, 4), 2, 3, 5 and 7"));
  none("cjk trillion zh", c.cjkFindings("t.k", "zh", "请输入小于 1 万亿的数", "try something under 1 trillion"));
  none("cjk trillion ja", c.cjkFindings("t.k", "ja", "1兆未満の数を試してください", "try something under 1 trillion"));
  none("cjk trillion ko", c.cjkFindings("t.k", "ko", "1조 미만의 수를 입력하세요", "try something under 1 trillion"));
  none("cjk ko counter", c.cjkFindings("t.k", "ko", "{count}개, 12단계, 3번째", "{count} items, 12 steps, 3rd"));
  none("cjk fr ignored", c.cjkFindings("t.k", "fr", "1 万", "1 step"));
  has("cjk fw tuple", c.cjkFindings("t.k", "zh", "点 (3，4)", "point (3, 4)"), "FULLWIDTH-FORMULA");
  has("cjk fw parens formula", c.cjkFindings("t.k", "ja", "点（3, 4）", "point (3, 4)"), "FULLWIDTH-FORMULA");
  has("cjk fw colon ratio", c.cjkFindings("t.k", "zh", "比例 1：2", "ratio 1:2"), "FULLWIDTH-FORMULA");
  has("cjk myriad", c.cjkFindings("t.k", "ja", "16万ステップ", "16 steps"), "CJK-MYRIAD");
  has("cjk ko myriad", c.cjkFindings("t.k", "ko", "16만 단계", "16 steps"), "CJK-MYRIAD");
  has("zh traditional", c.cjkFindings("t.k", "zh", "質數", "prime"), "HAN-FORM");
  has("zh shinjitai", c.cjkFindings("t.k", "zh", "因数図", "factor tree"), "HAN-FORM");
  none("zh simplified", c.cjkFindings("t.k", "zh", "素数的数量与公钥", "prime"));
  has("ja simplified", c.cjkFindings("t.k", "ja", "因数图", "factor tree"), "HAN-FORM");
  none("ja shinjitai", c.cjkFindings("t.k", "ja", "数と会と来と与と点", "x"));
  finish("CHECKER-CJK");
}

/* ---------- batch ---------- */

var AVOID = {
  zh: "质数|质因数|质因子|演算法|(?<!单)位元|比特|金钥|金鑰|函式|程式|资讯|预设|讯息|迪菲赫尔曼|迪菲·赫尔曼|文氏图|肖尔|凯利|费尔马|欧几里德|埃拉托色尼|模反元素|互质",
  ja: "函数|(?<!計)算法|復号化|モジュロ|プライム|キーペア|秘密キー|公開キー|ディフィーヘルマン|ユークリッド互除法|エラトステネスのふるい|ケーリー|フェルマ(?!ー)|ショアー|オイラ(?!ー)",
  ko: "프라임|알고리듬|디피헬먼|디피-헬만|공개키|개인키|비밀키|모듈로|에라토스테네스 체|유클리드 알고리즘"
};
var HEADER_PLURAL_FILES = ["cayley-table.js", "eulers-totient.js", "rsa.js", "sieve-of-eratosthenes.js", "square-and-multiply.js"];
var CJK_LETTER = "\\p{Script=Han}\\p{Script=Hiragana}\\p{Script=Katakana}\\u30fc";
var ZH_SPACING = /\p{Script=Han}[A-Za-z0-9{\p{Script=Greek}]|[A-Za-z0-9}\p{Script=Greek}]\p{Script=Han}/u;
var JA_SPACING = new RegExp("[" + CJK_LETTER + "] (?=[A-Za-z0-9{\\p{Script=Greek}])|(?<=[A-Za-z0-9}\\p{Script=Greek}]) (?=[" + CJK_LETTER + "])", "u");
var CJK_ASCII_PUNCT = new RegExp("[" + CJK_LETTER + "][,.;:?!]", "u");
var KO_PARTICLE = /\}(?:은|는|이|가|을|를|와|과|으로|로)(?!\p{Script=Hangul})/u;

function batchMode(files) {
  var C = require(CHECK_PATH);
  if (!files.length) say("NO-FILES");
  var avoid = {};
  CJK.forEach(function (L) { avoid[L] = new RegExp(AVOID[L], "u"); });
  var shared = 0, prose = 0;
  files.forEach(function (f) {
    var raw = fs.readFileSync(I18N_DIR + f, "utf8");
    var header = raw.split("(function")[0]; /* gate fix 1: the header comment itself mentions NT.i18n.register(...), which cut the old split short before the plural sentence */
    if (/\btwenty-one\b/i.test(raw)) say("STALE-COUNT", f);
    if (!/\btwenty-four\b/i.test(header)) say("COUNT-MISSING", f);
    if (HEADER_PLURAL_FILES.indexOf(f) !== -1 && !/\{ other \}/.test(header)) say("PLURAL-HEADER", f, "header does not name the { other } shape");
    var o = loadDicts(showBase(I18N_DIR + f)), n = loadDicts(raw);
    Object.keys(o).forEach(function (ns) {
      Object.keys(o[ns]).forEach(function (l) {
        if (JSON.stringify(o[ns][l]) !== JSON.stringify(n[ns] && n[ns][l])) say("DICT-CHANGED", f, ns, l);
      });
      if (!n[ns]) { say("NS-MISSING", f, ns); return; }
      if (Object.keys(n[ns]).slice(-3).join(",") !== "zh,ja,ko") say("CJK-NOT-LAST", f, ns, Object.keys(n[ns]).slice(-4).join(","));
      Object.keys(n[ns]).forEach(function (l) { if (!(l in o[ns]) && CJK.indexOf(l) === -1) say("DICT-EXTRA", f, ns, l); });
      var en = n[ns].en;
      CJK.forEach(function (L) {
        var d = n[ns][L];
        if (!d) { say("NO-" + L.toUpperCase(), f, ns); return; }
        if (Object.keys(d).join("|") !== Object.keys(en).join("|")) say("KEY-ORDER", f, ns, L);
        Object.keys(d).forEach(function (k) {
          var isPlural = en[k] && typeof en[k] === "object";
          if (isPlural && !(d[k] && typeof d[k] === "object" && Object.keys(d[k]).join(",") === "other")) say("PLURAL-SHAPE", f, ns, k, L);
          var cats = isPlural ? Object.keys(d[k] || {}) : [""];
          cats.forEach(function (cat) {
            var s = String(cat ? d[k][cat] : d[k]);
            var ev = String(form(en[k], cat || "other"));
            var id = [f, ns, k, cat, L].filter(Boolean).join(" ");
            if (/[\u200e\u200f\u202a-\u202e\u2066-\u2069]/.test(s)) say("BIDI-MARK", id);
            var a = avoid[L].exec(s);
            if (a) say("AVOID", id, JSON.stringify(a[0]));
            if (L === "zh") { var z = ZH_SPACING.exec(s); if (z) say("ZH-SPACING", id, JSON.stringify(z[0])); }
            if (L === "ja") { var j = JA_SPACING.exec(s.replace(/^\{[0-9]\} /, "")); /* gate fix 2: a leading legend slot "{0} 素数" keeps its space as in English (plan D-SPACING) */ if (j) say("JA-SPACING", id, JSON.stringify(s.slice(Math.max(0, j.index - 2), j.index + 3))); }
            if (L !== "ko") { var p = CJK_ASCII_PUNCT.exec(s); if (p) say("CJK-ASCII-PUNCT", id, JSON.stringify(p[0])); }
            if (L === "ko") { var q = KO_PARTICLE.exec(s); if (q) say("KO-PARTICLE", id, JSON.stringify(q[0])); }
            if (L === "ja") {
              var words = (ev.match(/\p{L}{2,}/gu) || []).length;
              var han = (s.match(/\p{Script=Han}/gu) || []).length;
              if (words >= 4 && han >= 6 && !/[\p{Script=Hiragana}\p{Script=Katakana}]/u.test(s)) say("JA-NO-KANA", id);
              if (C.isProse(s)) {
                prose++;
                var zv = form(n[ns].zh && n[ns].zh[k], cat || "other");
                if (zv !== undefined && s === String(zv) && s !== ev) shared++;
              }
            }
          });
        });
      });
    });
  });
  if (shared > Math.max(3, 0.05 * prose)) say("SHARED-VALUES", "ja values identical to zh:", shared + "/" + prose);
  console.log("STATS ja prose=" + prose + " sharedWithZh=" + shared);
  finish("CJK-BATCH");
}

/* ---------- glossary ---------- */

function glossaryMode(args) {
  var skipCD = args.indexOf("--no-cd") !== -1;
  var c = loadDicts(fs.readFileSync(I18N_DIR + "site.js", "utf8"));
  var g = fs.readFileSync(GLOSSARY, "utf8");
  function tab(a, b) {
    var parts = g.split(a);
    if (parts.length < 2) { say("SECTION-MISSING", String(a)); return [[]]; }
    var s = b ? parts[1].split(b)[0] : parts[1];
    return s.split("\n").filter(function (l) { return /^\|/.test(l); }).map(function (l) { return l.split("|").slice(1, -1).map(function (x) { return x.trim(); }); });
  }
  CJK.forEach(function (L) {
    function cmp(name, rows, get, want) {
      var col = rows[0].indexOf(L);
      if (col < 0) { say("NO-" + L + "-COLUMN", name); return; }
      var cnt = 0;
      rows.slice(2).forEach(function (r) {
        var v = get(r[0]);
        if (v === undefined) return;
        cnt++;
        if (String(r[col]).replace(/^[^\p{L}\p{N}]+/u, "") !== v) say("GLOSSARY-DRIFT", L, name, r[0], JSON.stringify(r[col]), JSON.stringify(v));
      });
      if (cnt !== want) say("ROWS", L, name, cnt);
    }
    cmp("b", tab(/^## \(b\)/m, /^## \(c\)/m), function (id) { return c.site[L] && c.site[L]["nav." + id]; }, 16);
    cmp("f", tab(/^## \(f\)/m, null), function (k) { var m = /^common\.([A-Za-z0-9]+)$/.exec(k); return m && c.common[L] ? c.common[L][m[1]] : undefined; }, 8);
    if (!skipCD) [["c", tab(/^## \(c\)/m, /^### /m)], ["d", tab(/^## \(d\)/m, /^## \(e\)/m)]].forEach(function (pair) {
      var rows = pair[1], col = rows[0].indexOf(L);
      if (col < 0 || rows.slice(2).some(function (r) { return !r[col]; })) say(pair[0].toUpperCase() + "-COLUMN-INCOMPLETE", L);
    });
  });
  ["Chinese (zh)", "Japanese (ja)", "Korean (ko)"].forEach(function (h) { if (g.indexOf(h) === -1) say("ENTRY-MISSING", h); });
  if (/\btwenty-one\b/i.test(g)) say("STALE-COUNT", GLOSSARY);
  finish("GLOSSARY-CJK");
}

/* ---------- pagecode ---------- */

var OPTION_LINES = /^[ \t]*<option value="zh" lang="zh">中文<\/option>\n[ \t]*<option value="ja" lang="ja">日本語<\/option>\n[ \t]*<option value="ko" lang="ko">한국어<\/option>\n/m;
var CJK_RULE_LINE = /^[ \t]*(?::root\[lang="(?:zh|ja|ko)"\][^\n]*\{[^\n]*\}|\/\*[^\n]*(?:Chinese|Japanese|Korean|CJK)[^\n]*\*\/)[ \t]*$/;

function pagecodeMode() {
  var files = git(["ls-files", "*.html", "assets"]).trim().split("\n").filter(function (f) {
    return !/^assets\/i18n\//.test(f) && f !== "assets/nt-i18n.js";
  });
  var ruleLines = 0;
  files.forEach(function (f) {
    var o = showBase(f), n = fs.readFileSync(f, "utf8");
    var stripped = n;
    if (/\.html$/.test(f)) {
      if (!OPTION_LINES.test(n)) { say("SWITCHER-LINES-MISSING", f); return; }
      stripped = n.replace(OPTION_LINES, "");
    }
    var kept = stripped.split("\n").filter(function (l) {
      if (CJK_RULE_LINE.test(l)) { ruleLines++; return false; }
      return true;
    }).join("\n");
    if (kept !== o) say("CODE-CHANGED", f);
  });
  console.log("PAGE-CODE files=" + files.length + " cjkRuleLines=" + ruleLines);
  finish("PAGE-CODE");
}

/* ---------- config ---------- */

function configMode() {
  fs.readdirSync(CONFIG_DIR).forEach(function (f) {
    var o = JSON.parse(showBase(CONFIG_DIR + f)), n = JSON.parse(fs.readFileSync(CONFIG_DIR + f, "utf8"));
    function shape(x) { return JSON.stringify(Object.assign({}, x, { allowSame: Object.keys(x.allowSame || {}), allowRenderText: Object.keys(x.allowRenderText || {}) })); }
    if (shape(o) !== shape(n)) say("CONFIG-SHAPE", f);
    ["allowSame", "allowRenderText"].forEach(function (s) {
      Object.keys(n[s] || {}).forEach(function (k) {
        var ov = o[s] && o[s][k], nv = n[s][k];
        if (ov !== nv && !(typeof ov === "string" && nv.indexOf(ov) === 0 && /261007-pbf/.test(nv))) say("CONFIG-REASON", f, s, k);
      });
    });
  });
  finish("CONFIG");
}

/* ---------- unify ---------- */

// Every English string value that appears under two or more keys (in one
// namespace or across namespaces) is one UI concept. For a multi-word English
// value each of zh, ja and ko must use a single rendering across all those
// keys (DIVERGENT, fails); for a one-word value a differing rendering is only
// listed (NOTE), because a lone word such as a button label and a table
// header can legitimately differ. --allow ns.key[,ns.key...] exempts keys
// whose divergence is deliberate (each must be justified in the SUMMARY).
function unifyMode(args) {
  var langs = CJK, allow = {};
  for (var i = 0; i < args.length; i++) {
    if (args[i] === "--langs") langs = String(args[++i]).split(",");
    else if (args[i] === "--allow") String(args[++i]).split(",").forEach(function (k) { allow[k] = true; });
  }
  var cat = {};
  fs.readdirSync(I18N_DIR).filter(function (f) { return /\.js$/.test(f); }).forEach(function (f) {
    var d = loadDicts(fs.readFileSync(I18N_DIR + f, "utf8"));
    Object.keys(d).forEach(function (ns) { cat[ns] = d[ns]; });
  });
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
    var keys = groups[en];
    if (keys.length < 2) return;
    var multi = (en.match(/\p{L}{2,}/gu) || []).length >= 2;
    langs.forEach(function (L) {
      var seen = {};
      keys.forEach(function (id) {
        var dot = id.indexOf(".");
        var ns = id.slice(0, dot), k = id.slice(dot + 1);
        var v = cat[ns][L] && cat[ns][L][k];
        if (v === undefined) return;
        (seen[v] = seen[v] || []).push(id);
      });
      var renders = Object.keys(seen);
      if (renders.length < 2) return;
      var exempt = keys.some(function (id) { return allow[id]; });
      var line = L + " " + JSON.stringify(en).slice(0, 60) + " -> " + renders.map(function (r) { return JSON.stringify(r) + " [" + seen[r].join(" ") + "]"; }).join(" | ");
      if (multi && !exempt) { divergent++; say("DIVERGENT", line); }
      else { notes++; console.log("NOTE", line); }
    });
  });
  console.log("UNIFY divergent=" + divergent + " notes=" + notes);
  finish("UNIFY");
}

/* ---------- sweep ---------- */

var KNOWN_SWITCH_LINES = {
  "factor-tree": /^I18N-BROWSER factor-tree switch NEW-ERRORS classic-n-abc [A-Za-z-]+ \[.*MISSING-SELECTOR #numInput/,
  "venn-diagram": /^I18N-BROWSER venn-diagram switch DIFF at clear [A-Za-z-]+: html differs .*id="lcm-step"/
};

function sleepMs(ms) { Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms); }
function pidAlive(pid) { try { process.kill(pid, 0); return true; } catch (e) { return e.code === "EPERM"; } }

function acquireSlot() {
  var gitDir = require("path").resolve(git(["rev-parse", "--git-dir"]).trim());
  for (;;) {
    for (var i = 1; i <= 2; i++) {
      var p = require("path").join(gitDir, "cjk-gate-sweep-slot-" + i + ".lock");
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
  if (nonEn !== 23) say("LANG-COUNT", "expected 23 non-English languages, LANG_CODES gives", nonEn);
  if (!pages.length) say("NO-PAGES");
  var slot = acquireSlot();
  try {
    pages.forEach(function (page) {
      var t0 = Date.now();
      var res = sweepPage(page, nonEn);
      // Rerun once only for a flaky-looking failure (an unexpected line, a missing
      // layout verdict or a crash); a known-line count mismatch is deterministic.
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
else if (mode === "config") configMode();
else if (mode === "sweep") sweepMode(rest);
else if (mode === "unify") unifyMode(rest);
else { console.log("usage: cjk-gate.js engine|checker|batch <files...>|glossary [--no-cd]|pagecode|config|unify [--allow ...]|sweep <pages...>"); process.exit(2); }
