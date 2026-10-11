/* 261011-cdw: splice the 34 previously English-only cyclicGroups keys into
   the 30 non-English blocks of assets/i18n/cyclic-groups.js.
   Usage (from the checkout root):
     node <Q>/insert-keys.js            merge (rebuilt from HEAD), then --check
     node <Q>/insert-keys.js --check    verify only
   Node built-ins plus the repo's own i18n-check.js. */
'use strict';
var fs = require('fs');
var vm = require('vm');
var cp = require('child_process');

var Q = '.planning/quick/261011-cdw-translate-the-34-english-only-cyclicgrou';
var F = Q + '/fragments';
var CG = 'assets/i18n/cyclic-groups.js';
var LANGS = ['nl', 'en', 'de', 'fr', 'es', 'it', 'pl', 'pt-BR', 'pt-PT', 'sv', 'nb', 'ro', 'hu', 'lv', 'ru', 'el',
  'he', 'hi', 'ar', 'sq', 'sw', 'zh', 'ja', 'ko', 'id', 'zgh-Latn', 'zgh-Tfng', 'ku', 'ckb', 'sa', 'la'];
var RTL = ['he', 'ar', 'ckb'];
var NOTATION_KEYS = ['tabTitle', 'formula.mulGroupOrder', 'formula.mulSubgroupOrder', 'formula.cosetCount',
  'formula.mulCosetCount', 'formula.cosetCountIndex'];
var PROSE_KEYS = ['cosetCountMath', 'nLabelMath', 'opLabelMath', 'nNoteMath', 'opAddMath', 'opMulMath',
  'factGeneratorsNoneMath', 'hintAdditiveMath', 'hintMultiplicativeMath', 'iso.lead', 'iso.additive',
  'iso.multiplicative', 'iso.open', 'iso.supergroup', 'iso.leadMath', 'notice.whyPowerOfTwoMath',
  'notice.whyFourAndOddMath', 'notice.whyTwoOddPrimesMath', 'notice.ruleMath', 'fact.cardinality',
  'formulaToggleName', 'formulaToggleSubName', 'formulaToggleGroup', 'formulaToggleSubgroup',
  'formulaToggleCosets', 'subOrderNeedsGen', 'subOrderPickGen', 'subOrderCancel'];
var NEW_KEYS = NOTATION_KEYS.concat(PROSE_KEYS);

var chk = require('../../phases/06-multi-language-support/i18n-check.js');

function fail(msg) { console.log('INSERT FAIL ' + msg); process.exit(1); }
function read(f) { return fs.readFileSync(f, 'utf8'); }
function eq(a, b) { return JSON.stringify(a) === JSON.stringify(b); }
function langKey(code) { return /^[a-z]+$/.test(code) ? code : "'" + code + "'"; }
function headSrc() {
  try { return cp.execFileSync('git', ['show', 'HEAD:' + CG], { encoding: 'utf8', maxBuffer: 1 << 26 }); }
  catch (e) { fail('git show HEAD:' + CG + ' failed'); }
}
function load(src, label) {
  var out = {};
  var ctx = { NT: { i18n: { register: function (ns, dict) { if (ns === 'cyclicGroups') out = dict; } } } };
  try { vm.runInNewContext(src, ctx, { filename: label }); } catch (e) { fail(label + ' does not load: ' + e.message); }
  return out;
}
/* invisible-character regexes built from escaped strings, so this file holds no raw invisible character */
var RE_INVIS = new RegExp('[\\u200B-\\u200F\\u202A-\\u202E\\u2060\\uFEFF]');
var RE_INVIS_ALL = new RegExp('[\\u200B-\\u200F\\u202A-\\u202E\\u2060\\u2066-\\u2069\\uFEFF]');
var RE_ISOL = new RegExp('[\\u2066-\\u2069]');
var RE_ISOL_G = new RegExp('[\\u2066-\\u2069]', 'g');
var ISO_OPEN = String.fromCharCode(0x2066);
var ISO_CLOSE = String.fromCharCode(0x2069);

function phs(s) { return (s.match(/\{[A-Za-z0-9_]+\}/g) || []).slice().sort(); }

var base = headSrc();
var headDict = load(base, 'HEAD:' + CG);
var enDict = headDict.en;
var EN_KEYS = Object.keys(enDict);

function notationValue(code, key) {
  var en = enDict[key];
  if (RTL.indexOf(code) < 0) return en;
  if (key === 'tabTitle') return '{title} · ' + ISO_OPEN + '{group}' + ISO_CLOSE;
  return ISO_OPEN + en + ISO_CLOSE;
}
function validate(code, frag) {
  var where = 'fragment ' + code + ': ';
  if (!eq(Object.keys(frag).slice().sort(), PROSE_KEYS.slice().sort())) fail(where + 'key set differs from the 28 prose keys');
  PROSE_KEYS.forEach(function (k) {
    var v = frag[k];
    if (typeof v !== 'string' || !v) fail(where + k + ' is not a non-empty string');
    if (v !== v.normalize('NFC')) fail(where + k + ' is not NFC');
    if (!eq(phs(v), phs(enDict[k]))) fail(where + k + ' placeholders ' + JSON.stringify(phs(v)) + ' differ from en ' + JSON.stringify(phs(enDict[k])));
    if (/<[A-Za-z]/.test(v)) fail(where + k + ' contains markup');
    if (RE_INVIS.test(v)) fail(where + k + ' contains an invisible/bidi control character');
    if (RE_ISOL.test(v)) {
      if (RTL.indexOf(code) < 0) fail(where + k + ' has isolates in a left-to-right language');
      var depth = 0;
      Array.from(v).forEach(function (ch) {
        if (ch === ISO_OPEN) depth++;
        else if (ch === ISO_CLOSE) depth--;
        else if (ch.charCodeAt(0) >= 0x2066 && ch.charCodeAt(0) <= 0x2069) fail(where + k + ' uses an isolate other than U+2066/U+2069');
        if (depth < 0) fail(where + k + ' has an unbalanced isolate');
      });
      if (depth !== 0) fail(where + k + ' has an unbalanced isolate');
    }
  });
}
function readFragment(code) {
  var f = F + '/' + code + '.json';
  if (!fs.existsSync(f)) return null;
  var frag;
  try { frag = JSON.parse(read(f)); } catch (e) { fail(f + ' is not valid JSON: ' + e.message); }
  validate(code, frag);
  return frag;
}
function deriveTfng(latn) {
  var out = {};
  PROSE_KEYS.forEach(function (k) {
    out[k] = latn[k].split(/(\{[^}]+\})/).map(function (piece) {
      if (/^\{[^}]+\}$/.test(piece)) return piece;
      return piece.replace(/[\p{L}\p{M}]+/gu, function (run) { return chk.zghTransliterate(run); });
    }).join('');
  });
  return out;
}

/* expected new values per language: { code: { key: value } } */
function expected() {
  var exp = {};
  LANGS.forEach(function (code) {
    if (code === 'en' || code === 'zgh-Tfng') return;
    var frag = readFragment(code);
    if (!frag) return;
    exp[code] = frag;
  });
  if (exp['zgh-Latn']) {
    exp['zgh-Tfng'] = deriveTfng(exp['zgh-Latn']);
    PROSE_KEYS.forEach(function (k) {
      var f = chk.zghTransliterationFindings('cyclicGroups.' + k, 'zgh-Tfng', exp['zgh-Tfng'][k], exp['zgh-Latn'][k], enDict[k]);
      if (f.length) fail('derived zgh-Tfng ' + k + ': ' + f.join(' | '));
    });
  }
  var out = {};
  Object.keys(exp).forEach(function (code) {
    out[code] = {};
    NOTATION_KEYS.forEach(function (k) { out[code][k] = notationValue(code, k); });
    PROSE_KEYS.forEach(function (k) { out[code][k] = exp[code][k]; });
  });
  return out;
}

/* ---------- serialization ---------- */
function quote(v, where) {
  var hasS = v.indexOf("'") >= 0, hasD = v.indexOf('"') >= 0;
  if (hasS && hasD) fail(where + ' holds both quote kinds');
  var q = hasS ? '"' : "'";
  var s = v.replace(/\\/g, '\\\\').replace(RE_ISOL_G, function (ch) {
    return '\\u' + ch.charCodeAt(0).toString(16).toUpperCase().padStart(4, '0').toLowerCase();
  });
  if (/[\n\r]/.test(s)) fail(where + ' holds a line break');
  return q + s + q;
}
var LINE_KEY = /^ {6}('?)([A-Za-z0-9.]+)\1: /;

/* ---------- header ---------- */
var HEAD_START = '   Translated into all thirty-one supported languages (quick task 261009-tgw),';
var HEAD_END = 'language for them. Translating them is a deferred follow-up.';
var NEW_HEADER = [
  '   Translated into all thirty-one supported languages (quick task 261009-tgw),',
  '   with English the source of truth: every non-English block holds the same',
  '   keys in the same order as en, and i18n-check --coverage reports no',
  '   cyclicGroups finding. The 34 keys added after that translation were',
  '   translated by quick task 261011-cdw: the five iso.* keys (iso.lead,',
  '   iso.additive, iso.multiplicative, iso.open, iso.supergroup) of the',
  '   isomorphic-group selector, the *Math keys (cosetCountMath, nLabelMath,',
  '   opLabelMath, nNoteMath, opAddMath, ..., notice.ruleMath), the templates',
  '   whose math parameters are typeset as MathML, the formula.mulGroupOrder',
  '   and formula.mulSubgroupOrder keys of the multiplicative order formulas,',
  '   the formula.cosetCount, formula.mulCosetCount and formula.cosetCountIndex',
  '   keys of the coset count formula, fact.cardinality, the five',
  '   formulaToggle* labels, the three subOrder* strings of the generator',
  '   prompt and tabTitle. The formula.* values and tabTitle are pure notation,',
  '   identical in every left-to-right language (he, ar and ckb isolate them).',
  '   Each placeholder of a *Math template is a MathML node supplied by the',
  '   page and appears exactly once, never wrapped in isolates.'
].join('\n');

function replaceHeader(src, label) {
  var a = src.indexOf(HEAD_START);
  var b = src.indexOf(HEAD_END);
  if (a < 0 || b < 0 || src.indexOf(HEAD_START, a + 1) >= 0 || src.indexOf(HEAD_END, b + 1) >= 0) fail(label + ': header paragraph does not match exactly once');
  return src.slice(0, a) + NEW_HEADER + src.slice(b + HEAD_END.length);
}
function stripHeader(src) {
  var a = src.indexOf(NEW_HEADER);
  if (a >= 0) return src.slice(0, a) + '@@HEADER@@' + src.slice(a + NEW_HEADER.length);
  a = src.indexOf(HEAD_START);
  var b = src.indexOf(HEAD_END);
  if (a < 0 || b < 0) fail('header not found');
  return src.slice(0, a) + '@@HEADER@@' + src.slice(b + HEAD_END.length);
}

/* ---------- merge ---------- */
function merge() {
  NEW_KEYS.forEach(function (k) {
    if (EN_KEYS.indexOf(k) < 0) fail('en lacks ' + k);
    Object.keys(headDict).forEach(function (code) {
      if (code !== 'en' && Object.prototype.hasOwnProperty.call(headDict[code], k)) fail(code + ' already has ' + k + ' at HEAD');
    });
  });
  if (NEW_KEYS.indexOf(EN_KEYS[EN_KEYS.length - 1]) >= 0) fail('en last key is one of the new keys');
  var exp = expected();
  var lines = base.split('\n');
  var enBlockStart = lines.indexOf('    en: {');
  if (enBlockStart < 0) fail('no en block');
  var enLine = {};
  for (var i = enBlockStart + 1; lines[i].indexOf('    }') !== 0; i++) {
    var m = LINE_KEY.exec(lines[i]);
    if (m) enLine[m[2]] = m[1] + m[2] + m[1];
  }
  var count = 0;
  Object.keys(exp).forEach(function (code) {
    var start = lines.indexOf('    ' + langKey(code) + ': {');
    if (start < 0) fail('no block for ' + code);
    var end = start + 1;
    while (lines[end].indexOf('    }') !== 0) end++;
    var existing = {};
    for (var j = start + 1; j < end; j++) {
      var mm = LINE_KEY.exec(lines[j]);
      if (!mm) fail(code + ': unexpected line ' + (j + 1));
      existing[mm[2]] = lines[j];
    }
    var rebuilt = EN_KEYS.map(function (k) {
      if (existing[k] !== undefined) return existing[k];
      if (NEW_KEYS.indexOf(k) < 0) fail(code + ': lacks old key ' + k);
      return '      ' + enLine[k] + ': ' + quote(exp[code][k], code + '.' + k) + ',';
    });
    var last = rebuilt.length - 1;
    if (!/[^,]$/.test(rebuilt[last]) || NEW_KEYS.indexOf(EN_KEYS[last]) >= 0) fail(code + ': last line is not an old no-comma line');
    lines.splice.apply(lines, [start + 1, end - start - 1].concat(rebuilt));
    count++;
  });
  fs.writeFileSync(CG, replaceHeader(lines.join('\n'), 'HEAD'));
  return count;
}

/* ---------- check ---------- */
function check() {
  var src = read(CG);
  if (RE_INVIS_ALL.test(src)) fail('file contains a raw invisible/bidi character');
  var now = load(src, CG);
  var exp = expected();
  var merged = Object.keys(exp);
  LANGS.forEach(function (code) {
    if (!now[code]) fail('missing block ' + code);
    var want = merged.indexOf(code) >= 0 ? EN_KEYS : Object.keys(headDict[code]);
    if (!eq(Object.keys(now[code]), want)) fail(code + ': key list/order differs (' + Object.keys(now[code]).length + ' vs ' + want.length + ')');
    Object.keys(headDict[code]).forEach(function (k) {
      if (!eq(now[code][k], headDict[code][k])) fail(code + '.' + k + ': value changed from HEAD');
    });
  });
  merged.forEach(function (code) {
    NEW_KEYS.forEach(function (k) {
      if (now[code][k] !== exp[code][k]) fail(code + '.' + k + ': differs from the fragment');
    });
  });
  if (src.indexOf(HEAD_START + '\n   with English the source of truth: every non-English block holds the same\n   keys in the same order as en, and i18n-check --coverage reports no\n   cyclicGroups finding, except') >= 0) fail('old header paragraph still present');
  /* line-diff confined to inserted lines plus the header */
  var kept = [];
  var cur = null;
  src.split('\n').forEach(function (line) {
    var bm = /^ {4}('?)([A-Za-z-]+)\1: \{$/.exec(line);
    if (bm) cur = bm[2];
    else if (/^ {4}\}/.test(line)) cur = null;
    var km = LINE_KEY.exec(line);
    if (cur && cur !== 'en' && km && NEW_KEYS.indexOf(km[2]) >= 0 && merged.indexOf(cur) >= 0) return;
    kept.push(line);
  });
  if (stripHeader(kept.join('\n')) !== stripHeader(base)) fail('file differs from HEAD outside the inserted lines and the header');
  return merged.length;
}

var mode = process.argv[2];
if (mode === '--check') {
  var n = check();
  console.log('INSERT OK langs=' + n + ' keys=34');
} else {
  merge();
  var n2 = check();
  console.log('INSERT OK langs=' + n2 + ' keys=34');
}
