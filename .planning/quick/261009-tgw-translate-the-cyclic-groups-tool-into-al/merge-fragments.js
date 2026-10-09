/* 261009-tgw plan 07: splice the 30 validated fragments into the three
   assets/i18n data files, write the page config, then verify.
   Usage (from the checkout root):
     node <Q>/merge-fragments.js            merge, then --check
     node <Q>/merge-fragments.js --check    verify only
   Node built-ins only. */
'use strict';
var fs = require('fs');
var path = require('path');
var vm = require('vm');
var cp = require('child_process');

var Q = '.planning/quick/261009-tgw-translate-the-cyclic-groups-tool-into-al';
var F = Q + '/fragments';
var CG = 'assets/i18n/cyclic-groups.js';
var SITE = 'assets/i18n/site.js';
var HUB = 'assets/i18n/hub.js';
var CFG = '.planning/phases/06-multi-language-support/i18n-config/cyclic-groups.json';
var LANGS = ['nl', 'en', 'de', 'fr', 'es', 'it', 'pl', 'pt-BR', 'pt-PT', 'sv', 'nb', 'ro', 'hu', 'lv', 'ru', 'el',
  'he', 'hi', 'ar', 'sq', 'sw', 'zh', 'ja', 'ko', 'id', 'zgh-Latn', 'zgh-Tfng', 'ku', 'ckb', 'sa', 'la'];
var NON_EN = LANGS.filter(function (l) { return l !== 'en'; });
/* Extra rendered-text exemptions found by the headless-Chrome langs run
   (task 2): exact rendered text -> reason. Kept here so a re-merge keeps them. */
var EXTRA_RENDER_TEXT = {};

function fail(msg) { console.log('MERGE FAIL ' + msg); process.exit(1); }
function read(f) { return fs.readFileSync(f, 'utf8'); }
function langKey(code) { return /^[a-z]+$/.test(code) ? code : "'" + code + "'"; }

function runCaptured(src, file) {
  var calls = [];
  var ctx = { NT: { i18n: { register: function (ns, dict) { calls.push({ ns: ns, dict: dict }); } } } };
  try { vm.runInNewContext(src, ctx, { filename: file }); } catch (e) { fail(file + ' does not load: ' + e.message); }
  return calls;
}
/* Load a whole data file (IIFE + register calls) into { ns: { lang: {key: value} } } */
function loadCatalog(src, file) {
  var cat = {};
  runCaptured(src, file).forEach(function (c) {
    cat[c.ns] = cat[c.ns] || {};
    Object.keys(c.dict).forEach(function (l) {
      cat[c.ns][l] = cat[c.ns][l] || {};
      Object.keys(c.dict[l]).forEach(function (k) { cat[c.ns][l][k] = c.dict[l][k]; });
    });
  });
  return cat;
}
function eq(a, b) { return JSON.stringify(a) === JSON.stringify(b); }
function headSrc(f) {
  try { return cp.execFileSync('git', ['show', 'HEAD:' + f], { encoding: 'utf8', maxBuffer: 1 << 26 }); }
  catch (e) { fail('git show HEAD:' + f + ' failed'); }
}

/* ---------- fragments ---------- */
var enCG = loadCatalog(headSrc(CG), CG).cyclicGroups.en;
var EN_KEYS = Object.keys(enCG);

function loadFragment(code) {
  var file = F + '/' + code + '.js';
  if (!fs.existsSync(file)) fail('missing fragment ' + file);
  var src = read(file);
  var calls = runCaptured(src, file);
  if (!eq(calls.map(function (c) { return c.ns; }), ['cyclicGroups', 'site', 'hub'])) fail(file + ': namespaces are not cyclicGroups, site, hub');
  calls.forEach(function (c) {
    if (!eq(Object.keys(c.dict), [code])) fail(file + ': ' + c.ns + ' must hold exactly the language key ' + code);
  });
  var d = {};
  calls.forEach(function (c) { d[c.ns] = c.dict[code]; });
  if (!eq(Object.keys(d.cyclicGroups), EN_KEYS)) fail(file + ': cyclicGroups key list differs from en (or its order does)');
  if (!eq(Object.keys(d.site), ['nav.cyclicGroups'])) fail(file + ': site keys');
  if (!eq(Object.keys(d.hub), ['card.cyclicGroups.title', 'card.cyclicGroups.desc'])) fail(file + ': hub keys');
  /* text extraction */
  var lines = src.split('\n');
  var texts = {};
  var cur = null;
  var starts = ['NT.i18n.register(\'cyclicGroups\', {', 'NT.i18n.register(\'site\', {', 'NT.i18n.register(\'hub\', {'];
  ['cyclicGroups', 'site', 'hub'].forEach(function (ns, i) {
    var r = lines.indexOf(starts[i]);
    if (r < 0) fail(file + ': no register line for ' + ns);
    if (lines[r + 1] !== '    ' + langKey(code) + ': {') fail(file + ': ' + ns + ' language-key line must be exactly "    ' + langKey(code) + ': {"');
    var e = r + 2;
    while (e < lines.length && lines[e] !== '    }') e++;
    if (e >= lines.length) fail(file + ': ' + ns + ' block has no 4-space closing brace');
    if (lines[e + 1] !== '});') fail(file + ': ' + ns + ' block is not followed by "});"');
    for (var j = r + 2; j < e; j++) {
      if (!/^      \S/.test(lines[j])) fail(file + ': line ' + (j + 1) + ' is not indented with exactly 6 spaces');
    }
    texts[ns] = lines.slice(r + 1, e + 1);
  });
  return { code: code, dict: d, texts: texts };
}

/* ---------- merge ---------- */
function mergeCG(frags) {
  var src = read(CG);
  var lines = src.split('\n');
  var open = lines.indexOf("  NT.i18n.register('cyclicGroups', {");
  var close = lines.indexOf('  });', open);
  if (open < 0 || close < 0) fail(CG + ': register body not found');
  var body = lines.slice(open + 1, close);
  if (body[0] !== '    en: {' || body[body.length - 1] !== '    }') fail(CG + ': already holds more than the en block (restore with git checkout first)');
  var inner = body.filter(function (l) { return /^    \S/.test(l); });
  if (inner.length !== 2) fail(CG + ': already holds a non-en block (restore with git checkout first)');
  var blocks = LANGS.map(function (l) { return l === 'en' ? body : frags[l].texts.cyclicGroups; });
  var out = [];
  blocks.forEach(function (b, i) {
    b = b.slice();
    if (i < blocks.length - 1) b[b.length - 1] += ',';
    out = out.concat(b);
  });
  fs.writeFileSync(CG, lines.slice(0, open + 1).concat(out, lines.slice(close)).join('\n'));
}

function mergeInsert(file, ns, anchor, pick, frags) {
  var lines = read(file).split('\n');
  var open = lines.indexOf("  NT.i18n.register('" + ns + "', {");
  if (open < 0) fail(file + ': register(' + ns + ') not found');
  var close = lines.indexOf('  });', open);
  var out = lines.slice(0, open + 1);
  var i = open + 1;
  var seen = {};
  while (i < close) {
    var m = /^    ('?)([A-Za-z-]+)\1: \{$/.exec(lines[i]);
    if (!m) { out.push(lines[i]); i++; continue; }
    var code = m[2];
    var j = i;
    while (lines[j] !== '    }' && lines[j] !== '    },') j++;
    var block = lines.slice(i, j + 1);
    if (code === 'en') { out = out.concat(block); i = j + 1; continue; }
    if (!frags[code]) fail(file + ': unexpected language block ' + code);
    seen[code] = true;
    var at = -1;
    block.forEach(function (l, k) { if (l.indexOf("      '" + anchor + "':") === 0) { if (at >= 0) fail(file + ' ' + code + ': anchor twice'); at = k; } });
    if (at < 0) fail(file + ' ' + code + ': anchor ' + anchor + ' not found');
    if (block.some(function (l) { return l.indexOf("      '" + (ns === 'site' ? 'nav.cyclicGroups' : 'card.cyclicGroups.') ) === 0; })) fail(file + ' ' + code + ': already merged');
    var add = pick(frags[code]).map(function (l) { return /,$/.test(l) ? l : l + ','; });
    if (!/,$/.test(block[at])) fail(file + ' ' + code + ': anchor line is the last entry of its block');
    out = out.concat(block.slice(0, at + 1), add, block.slice(at + 1));
    i = j + 1;
  }
  NON_EN.forEach(function (c) { if (!seen[c]) fail(file + ': no block for ' + c); });
  fs.writeFileSync(file, out.concat(lines.slice(close)).join('\n'));
}

function writeConfig() {
  var files = fs.readdirSync(F).filter(function (n) { return /^allow-0[1-6]\.json$/.test(n); }).sort();
  if (files.length !== 6) fail('expected allow-01..06.json, found ' + files.length);
  var same = {};
  var order = [];
  files.forEach(function (n) {
    var j = JSON.parse(read(F + '/' + n));
    Object.keys(j).forEach(function (k) { if (k !== 'allowSame') fail(n + ': unexpected key ' + k); });
    Object.keys(j.allowSame).forEach(function (k) {
      if (!same[k]) { same[k] = []; order.push(k); }
      if (same[k].indexOf(j.allowSame[k]) < 0) same[k].push(j.allowSame[k]);
    });
  });
  var allowSame = {};
  order.forEach(function (k) { allowSame[k] = same[k].join(' '); });
  var allowRenderText = {};
  order.forEach(function (k) {
    var key = k.replace(/^cyclicGroups\./, '');
    if (!(key in enCG)) fail('allowSame key ' + k + ' is not a cyclicGroups key');
    if (enCG[key].indexOf('{') < 0) allowRenderText[enCG[key]] = allowSame[k];
  });
  Object.keys(EXTRA_RENDER_TEXT).forEach(function (t) { allowRenderText[t] = EXTRA_RENDER_TEXT[t]; });
  fs.writeFileSync(CFG, JSON.stringify({ allowSame: allowSame, allowRenderText: allowRenderText }, null, 2) + '\n');
}

/* ---------- check ---------- */
function check(frags) {
  var cg = loadCatalog(read(CG), CG);
  var site = loadCatalog(read(SITE), SITE);
  var hub = loadCatalog(read(HUB), HUB);
  var now = { cyclicGroups: cg.cyclicGroups, site: site.site, hub: hub.hub };
  /* (a) fragment values equal the loaded catalog */
  NON_EN.forEach(function (c) {
    var f = frags[c];
    if (!eq(now.cyclicGroups[c], f.dict.cyclicGroups)) fail('(a) cyclicGroups.' + c + ' differs from its fragment');
    if (now.site[c]['nav.cyclicGroups'] !== f.dict.site['nav.cyclicGroups']) fail('(a) site.' + c + ' differs from its fragment');
    ['card.cyclicGroups.title', 'card.cyclicGroups.desc'].forEach(function (k) {
      if (now.hub[c][k] !== f.dict.hub[k]) fail('(a) hub.' + c + '.' + k + ' differs from its fragment');
    });
  });
  /* (b) every HEAD value unchanged; the only additions are the merge values */
  var headFiles = { cyclicGroups: [CG, 'cyclicGroups'], site: [SITE, 'site'], hub: [HUB, 'hub'] };
  var headCommon = loadCatalog(headSrc(SITE), SITE);
  var headAll = {
    cyclicGroups: loadCatalog(headSrc(CG), CG).cyclicGroups,
    site: headCommon.site,
    hub: loadCatalog(headSrc(HUB), HUB).hub
  };
  var nowAll = { site: site, hub: hub, cg: cg };
  Object.keys(headFiles).forEach(function (ns) {
    var h = headAll[ns];
    var n = now[ns];
    Object.keys(h).forEach(function (l) {
      Object.keys(h[l]).forEach(function (k) {
        if (!eq(h[l][k], n[l] && n[l][k])) fail('(b) ' + ns + '.' + l + '.' + k + ' changed');
      });
    });
    Object.keys(n).forEach(function (l) {
      Object.keys(n[l]).forEach(function (k) {
        if (h[l] && k in h[l]) return;
        var okNew = (l !== 'en' || (ns === 'cyclicGroups' && false)) && (
          (ns === 'cyclicGroups' && enCG[k] !== undefined && !h[l]) ||
          (ns === 'site' && k === 'nav.cyclicGroups') ||
          (ns === 'hub' && /^card\.cyclicGroups\.(title|desc)$/.test(k)));
        if (!okNew) fail('(b) unexpected new value ' + ns + '.' + l + '.' + k);
      });
    });
  });
  /* the common namespace is untouched too */
  var hc = headCommon.common;
  Object.keys(hc || {}).forEach(function (l) {
    Object.keys(hc[l]).forEach(function (k) {
      if (!eq(hc[l][k], site.common && site.common[l] && site.common[l][k])) fail('(b) common.' + l + '.' + k + ' changed');
    });
  });
  /* (c) key and language order */
  var langOrder = Object.keys(now.cyclicGroups);
  if (!eq(langOrder, LANGS)) fail('(c) cyclicGroups language order is not canonical');
  LANGS.forEach(function (l) {
    if (!eq(Object.keys(now.cyclicGroups[l]), EN_KEYS)) fail('(c) cyclicGroups.' + l + ' key order differs from en');
  });
  /* (d) no raw bidi controls */
  [CG, SITE, HUB].forEach(function (f) {
    var m = new RegExp('[\\u200E\\u200F\\u202A-\\u202E\\u2066-\\u2069]').exec(read(f));
    if (m) fail('(d) raw U+' + m[0].charCodeAt(0).toString(16).toUpperCase() + ' in ' + f);
  });
  /* (e) confined diff, skipped once HEAD already holds the merge */
  var headHas = /'nav\.cyclicGroups'/.test(headSrc(SITE).split('\n').slice(0, 0).join('')) ||
    Object.keys(headAll.site).some(function (l) { return l !== 'en' && headAll.site[l]['nav.cyclicGroups']; });
  if (!headHas) {
    var sd = cp.execFileSync('git', ['diff', '-U0', 'HEAD', '--', SITE], { encoding: 'utf8', maxBuffer: 1 << 26 });
    var hd = cp.execFileSync('git', ['diff', '-U0', 'HEAD', '--', HUB], { encoding: 'utf8', maxBuffer: 1 << 26 });
    var added = function (d) { return d.split('\n').filter(function (l) { return l[0] === '+' && l.indexOf('+++') !== 0; }); };
    var removed = function (d) { return d.split('\n').filter(function (l) { return l[0] === '-' && l.indexOf('---') !== 0; }); };
    var sa = added(sd), ha = added(hd);
    var navN = sa.filter(function (l) { return l.indexOf("+      'nav.cyclicGroups':") === 0; }).length;
    var cardN = ha.filter(function (l) { return l.indexOf("+      'card.cyclicGroups.") === 0; }).length;
    var otherS = sa.filter(function (l) { return l.indexOf("+      'nav.cyclicGroups':") !== 0; });
    var otherH = ha.filter(function (l) { return l.indexOf("+      'card.cyclicGroups.") !== 0; });
    if (navN !== 30) fail('(e) site.js adds ' + navN + ' nav.cyclicGroups lines, expected 30');
    if (cardN !== 60) fail('(e) hub.js adds ' + cardN + ' card.cyclicGroups lines, expected 60');
    /* the anchor line before each insertion may not change at all except by gaining nothing:
       anchors already end with a comma, so no removed lines are expected; comment lines are allowed */
    var isComment = function (l) { return /^[+-]\s*$/.test(l) || /^[+-]\s*(\/\*|\*|\S.*[a-zA-Z].*)$/.test(l) && !/^[+-] {6}'/.test(l); };
    otherS.concat(otherH).forEach(function (l) { if (!isComment(l)) fail('(e) unexpected added line: ' + l.slice(0, 80)); });
    removed(sd).concat(removed(hd)).forEach(function (l) { if (!isComment(l)) fail('(e) unexpected removed line: ' + l.slice(0, 80)); });
  }
  console.log('MERGE OK langs=30 keys=' + EN_KEYS.length);
}

/* ---------- main ---------- */
var frags = {};
NON_EN.forEach(function (c) { frags[c] = loadFragment(c); });
if (process.argv.indexOf('--check') < 0) {
  mergeCG(frags);
  mergeInsert(SITE, 'site', 'nav.cayley', function (f) { return f.texts.site.slice(1, -1); }, frags);
  mergeInsert(HUB, 'hub', 'card.cayley.desc', function (f) { return f.texts.hub.slice(1, -1); }, frags);
  writeConfig();
}
check(frags);
