#!/usr/bin/env node
/* i18n-check.js — dev-only Node/headless-Chrome validation for Phase 6's
 * multi-language support. Never shipped, never referenced by any .html
 * page. Node built-ins only (fs, path, os, vm, url, child_process), plus a
 * require of Phase 7's harness.js for its DOM/storage/cookie stubs and its
 * `eq` assertion helper.
 *
 * Modes:
 *   --smoke        headless-Chrome end-to-end probe on the Sieve of
 *                   Eratosthenes page. Builds a scratch site, opens it at
 *                   ?lang=fr, asserts the whole pipeline (static markup,
 *                   dynamic banner, link decoration, setLang, onLangChange,
 *                   state preservation), reruns with one deliberately-
 *                   corrupted expected value to prove the probe is not
 *                   vacuous, then runs a cross-session pair (?lang=de, then
 *                   a plain URL, sharing one Chrome profile dir) to prove
 *                   the localStorage channel survives a fresh navigation.
 *   --api          vm-loaded unit suite for assets/nt-i18n.js's exported
 *                   API surface (translate/plural/placeholders/
 *                   translateInto/bindText/applyStaticDom/register/setLang/
 *                   detectDefaultLang/decorateLinks).
 *   --persistence  vm-loaded unit suite for the URL/cookie/localStorage
 *                   precedence, write order and cookie format, storage-
 *                   event cross-tab sync, and lang= URL stripping.
 *
 * module.exports (for reuse by other dev scripts): ROOT (repo root resolved
 * from __dirname) and loadCatalog() — evaluates every assets/i18n/*.js file
 * in a fresh vm context, capturing every NT.i18n.register(ns, dict) call,
 * and returns { ns: { lang: { flatKey: value } } }.
 */
"use strict";

var fs = require("fs");
var path = require("path");
var os = require("os");
var vm = require("vm");
var url = require("url");
var cp = require("child_process");

// ROOT is overridable via I18N_CHECK_ROOT so the static-mode vacuity proofs
// (Task 1, 06-02-PLAN.md) can point the whole checker at a scratch site
// built under os.tmpdir() — never inside the repo — while exercising the
// exact same code paths used against the real repo.
var ROOT = process.env.I18N_CHECK_ROOT
  ? path.resolve(process.env.I18N_CHECK_ROOT)
  : path.resolve(__dirname, "..", "..", "..");

// Task 2 decision (06-01-PLAN.md): option-a — 'site-lang', a raw language
// code, either two-letter or the region-tagged pt-BR/pt-PT, owned entirely
// by assets/nt-i18n.js. Used only to seed/inspect fake storage in this
// file's own test scenarios; the production constant lives in
// assets/nt-i18n.js as NT.i18n.LANG_STORAGE_KEY.
var LANG_KEY = "site-lang";

var harness = require(path.join(ROOT, ".planning", "phases", "07-shared-js-module-refactor", "harness.js"));

/* ---------- loadCatalog (shared by every mode) ---------- */

function loadCatalog() {
  var i18nDir = path.join(ROOT, "assets", "i18n");
  var files = fs.readdirSync(i18nDir).filter(function (f) { return /\.js$/.test(f); }).sort();
  var catalog = {};
  var ntObj = {
    i18n: {
      register: function (ns, dict) {
        catalog[ns] = catalog[ns] || {};
        for (var lang in dict) {
          if (!Object.prototype.hasOwnProperty.call(dict, lang)) continue;
          catalog[ns][lang] = catalog[ns][lang] || {};
          var langDict = dict[lang];
          for (var key in langDict) {
            if (!Object.prototype.hasOwnProperty.call(langDict, key)) continue;
            catalog[ns][lang][key] = langDict[key];
          }
        }
      }
    }
  };
  var sandbox = { NT: ntObj, window: { NT: ntObj }, console: console };
  var ctx = vm.createContext(sandbox);
  files.forEach(function (file) {
    var src = fs.readFileSync(path.join(i18nDir, file), "utf8");
    vm.runInContext(src, ctx, { filename: file });
  });
  return catalog;
}

/* ---------- translate-in-Node (mirrors NT.i18n.translate, for EXPECTED) --- */

function pluralCategoryNode(lang, count) {
  if (typeof Intl !== "undefined" && typeof Intl.PluralRules === "function") {
    try {
      var cat = new Intl.PluralRules(lang).select(count);
      return cat;
    } catch (e) { /* fall through */ }
  }
  return count === 1 ? "one" : "other";
}

function fillTemplate(tpl, params) {
  if (!params) return tpl;
  return tpl.replace(/\{([A-Za-z0-9_]+)\}/g, function (whole, name) {
    return Object.prototype.hasOwnProperty.call(params, name) ? String(params[name]) : whole;
  });
}

function translateNode(catalog, ns, lang, key, params) {
  var entry = catalog[ns] && catalog[ns][lang] && catalog[ns][lang][key];
  if (entry === undefined) entry = catalog[ns] && catalog[ns].en && catalog[ns].en[key];
  if (entry === undefined) return ns + "." + key;
  var tpl;
  if (entry && typeof entry === "object") {
    var count = params ? params.count : undefined;
    var cat = pluralCategoryNode(lang, Number(count));
    tpl = Object.prototype.hasOwnProperty.call(entry, cat) ? entry[cat] : entry.other;
  } else {
    tpl = entry;
  }
  return fillTemplate(tpl, params);
}

/* ---------- common failure helpers ---------- */

function failSmoke(reason) {
  console.log("I18N-CHECK FAIL smoke: " + reason);
  process.exit(1);
}

function failMode(mode, reason) {
  console.log("I18N-CHECK FAIL " + mode + ": " + reason);
  process.exit(1);
}

function decodeDomEntities(s) {
  return s
    .replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, "&");
}

/* ---------- scratch site construction (shared by --smoke scenarios) ---------- */

function copyDirSync(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  var entries = fs.readdirSync(src, { withFileTypes: true });
  entries.forEach(function (e) {
    var s = path.join(src, e.name);
    var d = path.join(dest, e.name);
    if (e.isDirectory()) copyDirSync(s, d);
    else fs.copyFileSync(s, d);
  });
}

var TOOL_REL_PATH = "Sieve Of Eratosthenes/sieve-of-eratosthenes.html";

function buildProbeScript(expectedJson, injectMutant) {
  var lines = [
    "<script>(function(){",
    "var EXPECTED = " + expectedJson + ";",
    (injectMutant
      ? "EXPECTED.fr.brand = EXPECTED.fr.brand + '__MUTANT__';"
      : ""),
    "window.__i18nErrors = [];",
    "window.onerror = function(msg){ window.__i18nErrors.push(String(msg)); return false; };",
    "function fillTemplate(tpl, params){",
    "  return tpl.replace(/\\{([A-Za-z0-9_]+)\\}/g, function(w, name){",
    "    return Object.prototype.hasOwnProperty.call(params, name) ? String(params[name]) : w;",
    "  });",
    "}",
    "function runProbe(){",
    "  var results = [];",
    "  function eq(name, actual, expected){ results.push({ name: name, pass: (actual === expected), actual: actual, expected: expected }); }",
    "  function checkNavHrefs(langCode, otherLangCode){",
    "    var links = document.querySelectorAll('.site-nav-link');",
    "    for (var i = 0; i < links.length; i++){",
    "      var href = links[i].getAttribute('href') || '';",
    "      var pathPart = href.split('?')[0];",
    "      var count = (href.match(new RegExp('lang=' + langCode, 'g')) || []).length;",
    "      eq('nav-href-' + i + '-count-' + langCode, count, 1);",
    "      eq('nav-href-' + i + '-no-other-' + otherLangCode, href.indexOf('lang=' + otherLangCode) === -1, true);",
    "      eq('nav-href-' + i + '-original-path', pathPart, EXPECTED.navHrefs[i]);",
    "    }",
    "  }",
    "  try {",
    "    eq('html-lang-fr', document.documentElement.lang, 'fr');",
    "    eq('select-value-fr', document.getElementById('lang-switch-select').value, 'fr');",
    "    eq('brand-fr', document.querySelector('[data-i18n=\"site.brand\"]').textContent, EXPECTED.fr.brand);",
    "    eq('nav-home-fr', document.querySelector('[data-i18n=\"site.nav.home\"]').textContent, EXPECTED.fr.navHome);",
    "    eq('nav-sieve-fr', document.querySelector('[data-i18n=\"site.nav.sieve\"]').textContent, EXPECTED.fr.navSieve);",
    "    eq('h1-fr', document.querySelector('[data-i18n=\"sieve.heading\"]').textContent, EXPECTED.fr.heading);",
    "    eq('lede-fr', document.querySelector('[data-i18n=\"sieve.lede\"]').textContent, EXPECTED.fr.lede);",
    "    eq('title-fr', document.title, EXPECTED.fr.title);",
    "    eq('banner-ready-fr', document.getElementById('banner').textContent, EXPECTED.fr.bannerReady120);",
    "    checkNavHrefs('fr', 'es');",
    "    var changeCount = 0;",
    "    NT.i18n.onLangChange(function(){ changeCount++; });",
    "    var setEsOk = NT.i18n.setLang('es');",
    "    eq('setLang-es-returns-true', setEsOk, true);",
    "    eq('html-lang-es', document.documentElement.lang, 'es');",
    "    eq('change-counter-after-es', changeCount, 1);",
    "    eq('brand-es', document.querySelector('[data-i18n=\"site.brand\"]').textContent, EXPECTED.es.brand);",
    "    eq('nav-home-es', document.querySelector('[data-i18n=\"site.nav.home\"]').textContent, EXPECTED.es.navHome);",
    "    eq('nav-sieve-es', document.querySelector('[data-i18n=\"site.nav.sieve\"]').textContent, EXPECTED.es.navSieve);",
    "    eq('h1-es', document.querySelector('[data-i18n=\"sieve.heading\"]').textContent, EXPECTED.es.heading);",
    "    eq('lede-es', document.querySelector('[data-i18n=\"sieve.lede\"]').textContent, EXPECTED.es.lede);",
    "    eq('title-es', document.title, EXPECTED.es.title);",
    "    eq('banner-ready-es', document.getElementById('banner').textContent, EXPECTED.es.bannerReady120);",
    "    checkNavHrefs('es', 'fr');",
    "    var setXxOk = NT.i18n.setLang('xx');",
    "    eq('setLang-xx-returns-false', setXxOk, false);",
    "    eq('html-lang-after-xx', document.documentElement.lang, 'es');",
    "    eq('change-counter-after-xx', changeCount, 1);",
    "    document.getElementById('instantBtn').click();",
    "    var statTimeText = document.getElementById('statTime').textContent;",
    "    var expectedDoneEs = fillTemplate(EXPECTED.rawTemplates.es.bannerDoneOther, { count: 30, n: 120, time: statTimeText });",
    "    eq('banner-done-es', document.getElementById('banner').textContent, expectedDoneEs);",
    "    var strongEl = document.querySelector('#banner strong');",
    "    eq('banner-done-strong-es', strongEl ? strongEl.textContent : null, '30');",
    "    NT.i18n.setLang('en');",
    "    var expectedDoneEn = fillTemplate(EXPECTED.rawTemplates.en.bannerDoneOther, { count: 30, n: 120, time: statTimeText });",
    "    eq('banner-done-en', document.getElementById('banner').textContent, expectedDoneEn);",
    "    var cells = document.querySelectorAll('.cell');",
    "    eq('grid-cell-count', cells.length, 120);",
    "    var primeCells = document.querySelectorAll('.cell.prime');",
    "    eq('grid-prime-count', primeCells.length, 30);",
    "  } catch (e) {",
    "    window.__i18nErrors.push('probe-exception: ' + (e && e.message ? e.message : String(e)));",
    "  }",
    "  var firstFail = null;",
    "  for (var i = 0; i < results.length; i++){ if (!results[i].pass) { firstFail = results[i]; break; } }",
    "  if (!firstFail && window.__i18nErrors.length === 0) {",
    "    document.body.setAttribute('data-i18n-smoke', 'PASS ' + results.length);",
    "  } else if (firstFail) {",
    "    document.body.setAttribute('data-i18n-smoke', 'FAIL ' + firstFail.name + ': expected=' + JSON.stringify(firstFail.expected) + ' got=' + JSON.stringify(firstFail.actual));",
    "  } else {",
    "    document.body.setAttribute('data-i18n-smoke', 'FAIL window.onerror: ' + JSON.stringify(window.__i18nErrors));",
    "  }",
    "}",
    "window.addEventListener('load', function(){ setTimeout(runProbe, 400); });",
    "})();</script>"
  ];
  return lines.join("\n");
}

function instrumentHtml(html, expectedJson, injectMutant) {
  var probe = buildProbeScript(expectedJson, injectMutant);
  if (/<\/body>/i.test(html)) {
    return html.replace(/<\/body>/i, probe + "\n</body>");
  }
  return html + probe;
}

function buildScratchSite(prefix, expectedJson, injectMutant) {
  var siteRoot = harness.mkScratch(prefix);
  copyDirSync(path.join(ROOT, "assets"), path.join(siteRoot, "assets"));
  var toolDir = path.dirname(TOOL_REL_PATH);
  var toolFile = path.basename(TOOL_REL_PATH);
  var destDir = path.join(siteRoot, toolDir);
  fs.mkdirSync(destDir, { recursive: true });
  var html = fs.readFileSync(path.join(ROOT, TOOL_REL_PATH), "utf8");
  html = instrumentHtml(html, expectedJson, injectMutant);
  var destPath = path.join(destDir, toolFile);
  fs.writeFileSync(destPath, html);
  return { siteRoot: siteRoot, toolAbsPath: destPath };
}

function cleanupSite(siteRoot) {
  try { fs.rmSync(siteRoot, { recursive: true, force: true }); } catch (e) { /* best effort */ }
}

/* ---------- Chrome invocation ---------- */

function hasChrome() {
  var res = cp.spawnSync("google-chrome", ["--version"], { encoding: "utf8" });
  return !res.error;
}

function runChrome(fileUrl, budgetMs, profileDir) {
  var ownProfile = !profileDir;
  if (ownProfile) profileDir = harness.mkScratch("p6-smoke-profile-");
  var args = [
    "--headless=new",
    "--disable-gpu",
    "--no-sandbox",
    "--user-data-dir=" + profileDir,
    "--virtual-time-budget=" + budgetMs,
    "--dump-dom",
    fileUrl
  ];
  var res = cp.spawnSync("google-chrome", args, { encoding: "utf8", maxBuffer: 200 * 1024 * 1024, env: harness.chromeEnv() });
  if (ownProfile) { try { fs.rmSync(profileDir, { recursive: true, force: true }); } catch (e) { /* best effort */ } }
  return res.stdout || "";
}

function extractSmokeAttr(domHtml) {
  var m = /data-i18n-smoke="([^"]*)"/.exec(domHtml);
  if (!m) return null;
  return decodeDomEntities(m[1]);
}

/* ---------- EXPECTED construction + vacuity proof ---------- */

function extractNavHrefs(html) {
  var re = /<a href="([^"]+)" class="site-nav-link/g;
  var m, out = [];
  while ((m = re.exec(html)) !== null) out.push(m[1]);
  return out;
}

function buildExpected(catalog, navHrefs) {
  var en = {
    brand: translateNode(catalog, "site", "en", "brand"),
    navHome: translateNode(catalog, "site", "en", "nav.home"),
    navSieve: translateNode(catalog, "site", "en", "nav.sieve"),
    heading: translateNode(catalog, "sieve", "en", "heading"),
    lede: translateNode(catalog, "sieve", "en", "lede"),
    title: translateNode(catalog, "sieve", "en", "title"),
    bannerReady120: translateNode(catalog, "sieve", "en", "banner.ready", { n: 120 })
  };
  var fr = {
    brand: translateNode(catalog, "site", "fr", "brand"),
    navHome: translateNode(catalog, "site", "fr", "nav.home"),
    navSieve: translateNode(catalog, "site", "fr", "nav.sieve"),
    heading: translateNode(catalog, "sieve", "fr", "heading"),
    lede: translateNode(catalog, "sieve", "fr", "lede"),
    title: translateNode(catalog, "sieve", "fr", "title"),
    bannerReady120: translateNode(catalog, "sieve", "fr", "banner.ready", { n: 120 })
  };
  var es = {
    brand: translateNode(catalog, "site", "es", "brand"),
    navHome: translateNode(catalog, "site", "es", "nav.home"),
    navSieve: translateNode(catalog, "site", "es", "nav.sieve"),
    heading: translateNode(catalog, "sieve", "es", "heading"),
    lede: translateNode(catalog, "sieve", "es", "lede"),
    title: translateNode(catalog, "sieve", "es", "title"),
    bannerReady120: translateNode(catalog, "sieve", "es", "banner.ready", { n: 120 })
  };
  var de = {
    heading: translateNode(catalog, "sieve", "de", "heading")
  };
  var rawTemplates = {
    es: { bannerDoneOther: catalog.sieve.es["banner.done"].other },
    en: { bannerDoneOther: catalog.sieve.en["banner.done"].other }
  };

  // Vacuity guard: every fr/es value checked by the probe must differ from
  // its English counterpart, otherwise a probe comparing against the wrong
  // language's text could pass by accident.
  ["brand", "navHome", "navSieve", "heading", "lede", "title", "bannerReady120"].forEach(function (k) {
    if (fr[k] === en[k]) {
      throw new Error("buildExpected: fr." + k + " is identical to en." + k + " — probe would be vacuous");
    }
    if (es[k] === en[k]) {
      throw new Error("buildExpected: es." + k + " is identical to en." + k + " — probe would be vacuous");
    }
  });
  if (rawTemplates.es.bannerDoneOther === rawTemplates.en.bannerDoneOther) {
    throw new Error("buildExpected: es banner.done.other is identical to en — probe would be vacuous");
  }
  if (de.heading === en.heading) {
    throw new Error("buildExpected: de.heading is identical to en.heading — cross-session probe would be vacuous");
  }

  if (!navHrefs || navHrefs.length !== 16) {
    throw new Error("buildExpected: expected 16 nav hrefs, extracted " + (navHrefs ? navHrefs.length : 0));
  }

  return { en: en, fr: fr, es: es, de: de, rawTemplates: rawTemplates, navHrefs: navHrefs };
}

/* ---------- --smoke: real + mutant run ---------- */

function runSmokeOnce(expectedJson, injectMutant, prefix) {
  var site = buildScratchSite(prefix, expectedJson, injectMutant);
  var fileUrl = url.pathToFileURL(site.toolAbsPath).href + "?lang=fr";
  var dom = runChrome(fileUrl, 10000);
  cleanupSite(site.siteRoot);
  var attr = extractSmokeAttr(dom);
  if (attr === null) return { ok: false, detail: "NO-SMOKE-ATTR (page did not finish the probe)" };
  if (/^PASS /.test(attr)) {
    var count = parseInt(attr.slice(5), 10) || 0;
    return { ok: true, count: count, detail: attr };
  }
  return { ok: false, detail: attr };
}

/* ---------- --smoke: cross-session run (Task 3) ---------- */
// Two headless Chrome runs sharing one --user-data-dir: first ?lang=de,
// then the plain URL with no parameter. Chrome drops cookies on file://, so
// only the localStorage channel can carry the choice across the two
// independent navigations — this is the one thing --persistence's vm unit
// suite cannot exercise (it never spawns a real browser), and the cookie
// channel itself is covered there and by the Firefox human check.

function buildCrossSessionProbeScript() {
  return [
    "<script>(function(){",
    "window.addEventListener('load', function(){ setTimeout(function(){",
    "  var h1 = document.querySelector('[data-i18n=\"sieve.heading\"]');",
    "  var val = document.documentElement.lang + '|' + (h1 ? h1.textContent : '');",
    "  document.body.setAttribute('data-i18n-cross', val);",
    "}, 400); });",
    "})();</script>"
  ].join("\n");
}

function instrumentHtmlCross(html) {
  var probe = buildCrossSessionProbeScript();
  if (/<\/body>/i.test(html)) return html.replace(/<\/body>/i, probe + "\n</body>");
  return html + probe;
}

function buildScratchSiteCross(prefix) {
  var siteRoot = harness.mkScratch(prefix);
  copyDirSync(path.join(ROOT, "assets"), path.join(siteRoot, "assets"));
  var toolDir = path.dirname(TOOL_REL_PATH);
  var toolFile = path.basename(TOOL_REL_PATH);
  var destDir = path.join(siteRoot, toolDir);
  fs.mkdirSync(destDir, { recursive: true });
  var html = fs.readFileSync(path.join(ROOT, TOOL_REL_PATH), "utf8");
  html = instrumentHtmlCross(html);
  var destPath = path.join(destDir, toolFile);
  fs.writeFileSync(destPath, html);
  return { siteRoot: siteRoot, toolAbsPath: destPath };
}

function extractCrossAttr(domHtml) {
  var m = /data-i18n-cross="([^"]*)"/.exec(domHtml);
  if (!m) return null;
  return decodeDomEntities(m[1]);
}

function runCrossSessionCheck(catalog) {
  var site = buildScratchSiteCross("p6-smoke-cross-");
  var profileDir = harness.mkScratch("p6-smoke-cross-profile-");
  var urlWithLang = url.pathToFileURL(site.toolAbsPath).href + "?lang=de";
  var urlPlain = url.pathToFileURL(site.toolAbsPath).href;
  runChrome(urlWithLang, 10000, profileDir);
  var dom2 = runChrome(urlPlain, 10000, profileDir);
  cleanupSite(site.siteRoot);
  try { fs.rmSync(profileDir, { recursive: true, force: true }); } catch (e) { /* best effort */ }
  var attr = extractCrossAttr(dom2);
  if (attr === null) return { ok: false, detail: "NO-CROSS-ATTR (second run did not finish the probe)" };
  var parts = attr.split("|");
  var lang = parts[0];
  var heading = parts.slice(1).join("|");
  if (lang !== "de") return { ok: false, detail: "second-run html lang = " + JSON.stringify(lang) + " (expected de)" };
  var expectedHeadingDe = translateNode(catalog, "sieve", "de", "heading");
  if (heading !== expectedHeadingDe) {
    return { ok: false, detail: "second-run heading = " + JSON.stringify(heading) + " expected " + JSON.stringify(expectedHeadingDe) };
  }
  return { ok: true };
}

function doSmoke() {
  if (!hasChrome()) { failSmoke("google-chrome not found"); return; }

  var catalog;
  try {
    catalog = loadCatalog();
  } catch (e) {
    failSmoke("could not load assets/i18n/*.js: " + e.message);
    return;
  }

  var expected;
  try {
    var rawHtml = fs.readFileSync(path.join(ROOT, TOOL_REL_PATH), "utf8");
    var navHrefs = extractNavHrefs(rawHtml);
    expected = buildExpected(catalog, navHrefs);
  } catch (e) {
    failSmoke(e.message);
    return;
  }
  var expectedJson = JSON.stringify(expected);

  var realRun = runSmokeOnce(expectedJson, false, "p6-smoke-real-");
  if (!realRun.ok) { failSmoke(realRun.detail); return; }

  var mutantRun = runSmokeOnce(expectedJson, true, "p6-smoke-mutant-");
  if (mutantRun.ok) {
    failSmoke("mutant run unexpectedly passed — probe is vacuous (did not detect a deliberately wrong expected value)");
    return;
  }

  var cross = runCrossSessionCheck(catalog);
  if (!cross.ok) { failSmoke("cross-session: " + cross.detail); return; }

  console.log("I18N-CHECK PASS smoke: " + realRun.count + " assertions (mutant detected); cross-session run OK");
  process.exit(0);
}

/* =========================================================================
 * Fake DOM for --api / --persistence (Task 3)
 *
 * A minimal fake DOM: elements implement textContent, setAttribute/
 * getAttribute/removeAttribute, appendChild, children, firstChild,
 * nodeType, and querySelectorAll on the attribute selectors
 * assets/nt-i18n.js actually uses ('[data-i18n]', '[data-i18n-title]',
 * '[data-i18n-aria-label]', '[data-i18n-placeholder]'). innerHTML is a
 * getter/setter that always throws, so any innerHTML use anywhere in the
 * module under test fails the suite immediately (T-06-02).
 * ======================================================================= */

function FakeNode(nodeType, tagOrText) {
  this.nodeType = nodeType; // 1 = element, 3 = text
  if (nodeType === 3) {
    this._text = String(tagOrText);
  } else {
    this.tagName = String(tagOrText || "div").toUpperCase();
    this.attrs = {};
    this.childNodes = [];
    this._listeners = {};
    this.value = "";
  }
}
Object.defineProperty(FakeNode.prototype, "textContent", {
  get: function () {
    if (this.nodeType === 3) return this._text;
    return this.childNodes.map(function (n) { return n.textContent; }).join("");
  },
  set: function (v) {
    if (this.nodeType === 3) { this._text = String(v); return; }
    this.childNodes = [];
    if (v !== "") this.childNodes.push(new FakeNode(3, String(v)));
  }
});
Object.defineProperty(FakeNode.prototype, "children", {
  get: function () { return this.childNodes.filter(function (n) { return n.nodeType === 1; }); }
});
Object.defineProperty(FakeNode.prototype, "firstChild", {
  get: function () { return this.childNodes.length ? this.childNodes[0] : null; }
});
Object.defineProperty(FakeNode.prototype, "innerHTML", {
  get: function () { throw new Error("innerHTML read is forbidden in this fake DOM"); },
  set: function () { throw new Error("innerHTML assignment is forbidden (T-06-02): nt-i18n.js must never write innerHTML"); }
});
FakeNode.prototype.setAttribute = function (k, v) { this.attrs[k] = String(v); };
FakeNode.prototype.getAttribute = function (k) {
  return Object.prototype.hasOwnProperty.call(this.attrs, k) ? this.attrs[k] : null;
};
FakeNode.prototype.removeAttribute = function (k) { delete this.attrs[k]; };
FakeNode.prototype.hasAttribute = function (k) { return Object.prototype.hasOwnProperty.call(this.attrs, k); };
FakeNode.prototype.appendChild = function (node) { this.childNodes.push(node); return node; };
FakeNode.prototype.addEventListener = function (type, fn) {
  this._listeners[type] = this._listeners[type] || [];
  this._listeners[type].push(fn);
};

function queryAllFake(root, sel) {
  var m = /^\[([a-zA-Z0-9-]+)\]$/.exec(sel);
  var out = [];
  function walk(node) {
    if (node.nodeType !== 1) return;
    if (m && node.hasAttribute(m[1])) out.push(node);
    node.childNodes.forEach(walk);
  }
  walk(root);
  return out;
}
FakeNode.prototype.querySelectorAll = function (sel) { return queryAllFake(this, sel); };

function createFakeDocument() {
  var registry = [];
  function create(tag) {
    var el = new FakeNode(1, tag);
    registry.push(el);
    return el;
  }
  var htmlEl = create("html");
  var bodyEl = create("body");
  htmlEl.appendChild(bodyEl);
  var doc = {
    readyState: "complete",
    documentElement: htmlEl,
    body: bodyEl,
    title: "",
    createElement: create,
    createTextNode: function (s) { return new FakeNode(3, s); },
    getElementById: function (id) {
      for (var i = 0; i < registry.length; i++) {
        if (registry[i].nodeType === 1 && registry[i].getAttribute("id") === id) return registry[i];
      }
      return null;
    },
    getElementsByTagName: function (tag) {
      tag = String(tag).toUpperCase();
      return registry.filter(function (el) { return el.tagName === tag; });
    },
    querySelectorAll: function (sel) { return queryAllFake(htmlEl, sel); },
    addEventListener: function () { /* DOMContentLoaded never needed: readyState is 'complete' */ },
    removeEventListener: function () {}
  };
  doc._registry = registry;
  return doc;
}

function attachCookieJar(doc, opts) {
  var jar = harness.makeCookieJar(opts || {});
  var srcDesc = Object.getOwnPropertyDescriptor(jar.document, "cookie");
  // harness.js's makeCookieJar defines its own `cookie` accessor without an
  // explicit `configurable`, which defaults to false — copying that
  // descriptor verbatim would make `doc.cookie` permanently non-
  // redefinable, and the order-tracking wrap below needs to redefine it
  // once more. Force configurable: true on the copy.
  Object.defineProperty(doc, "cookie", { get: srcDesc.get, set: srcDesc.set, configurable: true, enumerable: true });
  return jar;
}

function makeHistoryStub() {
  var calls = [];
  return {
    replaceState: function (state, title, u) { calls.push(u); },
    _calls: calls
  };
}

// loadI18n(opts): fresh vm context with a stub window/document/navigator/
// location/history, loads assets/nt-i18n.js into it, and returns the
// context (so a scenario can inspect ctx.NT.i18n, ctx._doc, ctx._storage,
// ctx._jar, ctx._order, ctx.history, ctx._changeEvents, ctx._fireStorage).
function loadI18n(opts) {
  opts = opts || {};
  var context = {};
  context.window = context;
  var doc = createFakeDocument();
  var cookieOpts = opts.cookie || {};
  var jar = attachCookieJar(doc, { throwOnGet: cookieOpts.throwOnGet, throwOnSet: cookieOpts.throwOnSet });
  context.document = doc;

  var storageOpts = opts.storage || {};
  var storage = harness.makeStorage({ throwOnGet: storageOpts.throwOnGet, throwOnSet: storageOpts.throwOnSet });
  if (storageOpts.initial !== undefined && storageOpts.initial !== null) {
    storage._data[LANG_KEY] = storageOpts.initial;
  }
  context.localStorage = storage;

  context.location = {
    search: opts.search || "",
    pathname: opts.pathname || "/Sieve%20Of%20Eratosthenes/sieve-of-eratosthenes.html",
    hash: opts.hash || ""
  };
  context.history = makeHistoryStub();
  context.navigator = (opts.navigator !== undefined) ? opts.navigator : { languages: ["en-US", "en"] };

  // Seed an initial cookie value, if any, THROUGH the jar's own (unwrapped)
  // setter — this populates the jar's internal key-order list correctly.
  // It must happen before the order-tracking wrap below, or this scenario
  // setup write would itself be mistaken for a write the module performed.
  if (cookieOpts.initial) doc.cookie = LANG_KEY + "=" + cookieOpts.initial;

  // Order-tracking: wrap storage.setItem and the cookie setter so write
  // ordering (localStorage first, then cookie) can be asserted precisely.
  // Installed only now, so scenario setup above is never logged as a
  // module-performed write.
  var order = [];
  var origSetItem = storage.setItem;
  storage.setItem = function (k, v) { order.push("storage:" + k + "=" + v); return origSetItem.call(storage, k, v); };
  var cookieDesc = Object.getOwnPropertyDescriptor(doc, "cookie");
  Object.defineProperty(doc, "cookie", {
    get: cookieDesc.get,
    set: function (raw) { order.push("cookie:" + raw); return cookieDesc.set.call(doc, raw); }
  });
  context._order = order;

  var winListeners = {};
  context.addEventListener = function (type, fn) {
    winListeners[type] = winListeners[type] || [];
    winListeners[type].push(fn);
  };
  context.dispatchEvent = function (evt) {
    (winListeners[evt.type] || []).slice().forEach(function (fn) { fn(evt); });
    return true;
  };
  context._fireStorage = function (key, newValue) {
    (winListeners.storage || []).slice().forEach(function (fn) { fn({ key: key, newValue: newValue }); });
  };
  context._changeEvents = [];
  context.CustomEvent = function (type, init) { this.type = type; this.detail = init && init.detail; };

  vm.createContext(context);
  context.addEventListener("nt-i18n:change", function (e) { context._changeEvents.push(e.detail.lang); });

  var src = fs.readFileSync(path.join(ROOT, "assets", "nt-i18n.js"), "utf8");
  vm.runInContext(src, context, { filename: "assets/nt-i18n.js" });

  context._doc = doc;
  context._storage = storage;
  context._jar = jar;
  return context;
}

var assertionCount = 0;
function check(label, got, want) {
  assertionCount++;
  harness.eq(label, got, want);
}

function tryCatchMessage(fn) {
  try { fn(); return null; } catch (e) { return e && e.message ? e.message : String(e); }
}

/* ---------- --api ---------- */

function doApi() {
  assertionCount = 0;
  var ctx = loadI18n({ navigator: { languages: ["en-US", "en"] } });
  var I = ctx.NT.i18n;

  // export surface
  var expectedKeys = [
    "LANG_STORAGE_KEY", "SUPPORTED_LANGS", "applyStaticDom", "bindText",
    "detectDefaultLang", "getLang", "onLangChange", "register", "setLang",
    "translate", "translateInto"
  ].sort();
  check("export key set", Object.keys(I).sort(), expectedKeys);
  check("LANG_STORAGE_KEY value", I.LANG_STORAGE_KEY, "site-lang");
  check("SUPPORTED_LANGS value", I.SUPPORTED_LANGS.slice().sort(), ["ar", "de", "el", "en", "es", "fr", "he", "hi", "hu", "it", "ja", "ko", "lv", "nb", "nl", "pl", "pt-BR", "pt-PT", "ro", "ru", "sq", "sv", "sw", "zh"]);
  check("SUPPORTED_LANGS is frozen", Object.isFrozen(I.SUPPORTED_LANGS), true);
  check("NT.i18n is frozen", Object.isFrozen(I), true);
  check("getLang() initial value is the navigator default", I.getLang(), "en");

  var desc = Object.getOwnPropertyDescriptor(ctx.NT, "i18n");
  check("i18n slot non-writable", desc.writable, false);
  check("i18n slot non-configurable", desc.configurable, false);
  check("NT still extensible", Object.isExtensible(ctx.NT), true);

  // bare-context evaluation (only `window`) must not throw
  (function () {
    var bareCtx = {};
    bareCtx.window = bareCtx;
    vm.createContext(bareCtx);
    var threw = tryCatchMessage(function () {
      vm.runInContext(fs.readFileSync(path.join(ROOT, "assets", "nt-i18n.js"), "utf8"), bareCtx, { filename: "assets/nt-i18n.js" });
    });
    check("bare-context evaluation does not throw", threw, null);
    check("bare-context still exports NT.i18n", !!(bareCtx.NT && bareCtx.NT.i18n), true);
  })();

  // register + translate: a synthetic namespace covering every lookup rule
  var enDict = {
    greet: "Hello {name}",
    count: { one: "{count} item", other: "{count} items" },
    echo: "value has {x} in it already",
    rich: "You supply {0} primes",
    richReordered: "{1} comes before {0}",
    titleText: "Hover title",
    plain: "Just text, no placeholders"
  };
  var frDict = {
    greet: "Bonjour {name}",
    count: { one: "{count} truc", other: "{count} trucs" }
  };
  I.register("t", { en: enDict, fr: frDict });

  check("translate basic en", I.translate("t.greet", { name: "World" }), "Hello World");
  check("translate with no params leaves placeholders literal", I.translate("t.greet"), "Hello {name}");
  check("translate plain template with no placeholders", I.translate("t.plain"), "Just text, no placeholders");
  check("translate unknown ns falls back to key", I.translate("unknown.key"), "unknown.key");
  check("translate unknown key in known ns falls back to key", I.translate("t.nope"), "t.nope");

  I.setLang("fr");
  check("translate falls back to en when fr lacks the key", I.translate("t.rich", { 0: "two" }), "You supply two primes");
  I.setLang("en");

  check("translate __proto__ not resolved via prototype chain", I.translate("t.__proto__"), "t.__proto__");
  check("translate constructor not resolved via prototype chain", I.translate("t.constructor"), "t.constructor");
  check("translate toString not resolved via prototype chain", I.translate("t.toString"), "t.toString");

  check("unknown placeholder stays literal", I.translate("t.echo", {}), "value has {x} in it already");
  check("substituted param value is not re-scanned", I.translate("t.greet", { name: "{greet}" }), "Hello {greet}");
  check("BigInt param is stringified", I.translate("t.greet", { name: 12345678901234567890n }), "Hello 12345678901234567890");

  // plural
  I.setLang("fr");
  check("plural fr count 0 selects one (French rule)", I.translate("t.count", { count: 0 }), "0 truc");
  I.setLang("en");
  check("plural en count 0 selects other", I.translate("t.count", { count: 0 }), "0 items");
  check("plural en count 1 selects one", I.translate("t.count", { count: 1 }), "1 item");
  check("plural en count 30 selects other", I.translate("t.count", { count: 30 }), "30 items");
  var countNode = ctx.document.createTextNode("7");
  check("plural count via a Node's textContent", I.translate("t.count", { count: countNode }), "7 items");

  // Polish's four CLDR categories (one/few/many/other), proven against a
  // synthetic namespace that also exercises the en-fallback for a key pl
  // deliberately lacks (enOnly), and fr's own "many" (1,000,000 multiples)
  // still falling back to other, unchanged from before the engine
  // generalization.
  I.register("tp", {
    en: {
      count: { one: "{count} file", other: "{count} files" },
      enOnly: { one: "{count} thing", other: "{count} things" }
    },
    pl: {
      count: { one: "{count} plik", few: "{count} pliki", many: "{count} plików", other: "{count} pliku" }
    }
  });
  check("setLang('pl') returns true", I.setLang("pl"), true);
  check("pl tp.count at 1 selects one", I.translate("tp.count", { count: 1 }), "1 plik");
  check("pl tp.count at 2 selects few", I.translate("tp.count", { count: 2 }), "2 pliki");
  check("pl tp.count at 5 selects many", I.translate("tp.count", { count: 5 }), "5 plików");
  check("pl tp.count at 22 selects few", I.translate("tp.count", { count: 22 }), "22 pliki");
  check("pl tp.count at 25 selects many", I.translate("tp.count", { count: 25 }), "25 plików");
  check("pl tp.count at 12 selects many (teens are many, not few)", I.translate("tp.count", { count: 12 }), "12 plików");
  check("pl tp.count at 0 selects many", I.translate("tp.count", { count: 0 }), "0 plików");
  check("pl tp.count at 1.5 selects other (fraction)", I.translate("tp.count", { count: 1.5 }), "1.5 pliku");
  check("pl tp.enOnly at 5 falls back to en value (missing many falls back to other)", I.translate("tp.enOnly", { count: 5 }), "5 things");

  // Portuguese's two distinct plural rules (pt-BR's CLDR 'pt' one covers
  // 0 and 1; pt-PT's own 'one' covers exactly 1), proven against a
  // synthetic namespace shared by both variants.
  I.register("tpt", {
    en: { count: { one: "{count} file", other: "{count} files" } },
    "pt-BR": { count: { one: "{count} arquivo", other: "{count} arquivos" } },
    "pt-PT": { count: { one: "{count} ficheiro", other: "{count} ficheiros" } }
  });
  check("setLang('pt-BR') returns true (tpt)", I.setLang("pt-BR"), true);
  check("pt-BR tpt.count at 0 selects one (CLDR pt one covers 0)", I.translate("tpt.count", { count: 0 }), "0 arquivo");
  check("pt-BR tpt.count at 1 selects one", I.translate("tpt.count", { count: 1 }), "1 arquivo");
  check("pt-BR tpt.count at 2 selects other", I.translate("tpt.count", { count: 2 }), "2 arquivos");
  check("pt-BR tpt.count at 1.5 selects one", I.translate("tpt.count", { count: 1.5 }), "1.5 arquivo");
  check("pt-BR tpt.count at 1000000 selects other (many has no key, falls back to other)", I.translate("tpt.count", { count: 1000000 }), "1000000 arquivos");
  check("setLang('pt-PT') returns true (tpt)", I.setLang("pt-PT"), true);
  check("pt-PT tpt.count at 0 selects other", I.translate("tpt.count", { count: 0 }), "0 ficheiros");
  check("pt-PT tpt.count at 1 selects one", I.translate("tpt.count", { count: 1 }), "1 ficheiro");
  check("pt-PT tpt.count at 2 selects other", I.translate("tpt.count", { count: 2 }), "2 ficheiros");
  check("pt-PT tpt.count at 1.5 selects other", I.translate("tpt.count", { count: 1.5 }), "1.5 ficheiros");
  check("pt-PT tpt.count at 1000000 selects other (many has no key, falls back to other)", I.translate("tpt.count", { count: 1000000 }), "1000000 ficheiros");

  // Swedish/Norwegian Bokmål both have CLDR {one, other}, keyed off a
  // synthetic namespace so the real sieve.banner.done plural stays the
  // Task-1 tracer's own evidence.
  I.register("tsn", {
    en: { count: { one: "{count} key", other: "{count} keys" } },
    sv: { count: { one: "{count} nyckel", other: "{count} nycklar" } },
    nb: { count: { one: "{count} nøkkel", other: "{count} nøkler" } }
  });
  check("setLang('sv') returns true (tsn)", I.setLang("sv"), true);
  check("sv tsn.count at 0 selects other", I.translate("tsn.count", { count: 0 }), "0 nycklar");
  check("sv tsn.count at 1 selects one", I.translate("tsn.count", { count: 1 }), "1 nyckel");
  check("sv tsn.count at 2 selects other", I.translate("tsn.count", { count: 2 }), "2 nycklar");
  check("sv tsn.count at 1.5 selects other", I.translate("tsn.count", { count: 1.5 }), "1.5 nycklar");
  check("sv tsn.count at 1000000 selects other", I.translate("tsn.count", { count: 1000000 }), "1000000 nycklar");
  check("setLang('nb') returns true (tsn)", I.setLang("nb"), true);
  check("nb tsn.count at 0 selects other", I.translate("tsn.count", { count: 0 }), "0 nøkler");
  check("nb tsn.count at 1 selects one", I.translate("tsn.count", { count: 1 }), "1 nøkkel");
  check("nb tsn.count at 2 selects other", I.translate("tsn.count", { count: 2 }), "2 nøkler");
  check("nb tsn.count at 1.5 selects other", I.translate("tsn.count", { count: 1.5 }), "1.5 nøkler");
  check("nb tsn.count at 1000000 selects other", I.translate("tsn.count", { count: 1000000 }), "1000000 nøkler");

  // Romanian {one, few, other}, Hungarian {one, other} and Latvian
  // {zero, one, other} selection, keyed off a synthetic namespace. The
  // Hungarian forms carry a category marker because Hungarian nouns stay
  // singular after a numeral (so one/other would otherwise be identical).
  I.register("trhl", {
    en: { count: { one: "{count} key", other: "{count} keys" } },
    ro: { count: { one: "{count} cheie", few: "{count} chei", other: "{count} de chei" } },
    hu: { count: { one: "{count} kulcs (one)", other: "{count} kulcs (other)" } },
    lv: { count: { zero: "{count} atslēgu", one: "{count} atslēga", other: "{count} atslēgas" } }
  });
  check("setLang('ro') returns true (trhl)", I.setLang("ro"), true);
  check("ro trhl.count at 0 selects few", I.translate("trhl.count", { count: 0 }), "0 chei");
  check("ro trhl.count at 1 selects one", I.translate("trhl.count", { count: 1 }), "1 cheie");
  check("ro trhl.count at 2 selects few", I.translate("trhl.count", { count: 2 }), "2 chei");
  check("ro trhl.count at 19 selects few", I.translate("trhl.count", { count: 19 }), "19 chei");
  check("ro trhl.count at 20 selects other", I.translate("trhl.count", { count: 20 }), "20 de chei");
  check("ro trhl.count at 101 selects few", I.translate("trhl.count", { count: 101 }), "101 chei");
  check("ro trhl.count at 1.5 selects few", I.translate("trhl.count", { count: 1.5 }), "1.5 chei");
  check("ro trhl.count at 1000000 selects other", I.translate("trhl.count", { count: 1000000 }), "1000000 de chei");
  check("setLang('hu') returns true (trhl)", I.setLang("hu"), true);
  check("hu trhl.count at 0 selects other", I.translate("trhl.count", { count: 0 }), "0 kulcs (other)");
  check("hu trhl.count at 1 selects one", I.translate("trhl.count", { count: 1 }), "1 kulcs (one)");
  check("hu trhl.count at 2 selects other", I.translate("trhl.count", { count: 2 }), "2 kulcs (other)");
  check("hu trhl.count at 1.5 selects other", I.translate("trhl.count", { count: 1.5 }), "1.5 kulcs (other)");
  check("hu trhl.count at 1000000 selects other", I.translate("trhl.count", { count: 1000000 }), "1000000 kulcs (other)");
  check("setLang('lv') returns true (trhl)", I.setLang("lv"), true);
  check("lv trhl.count at 0 selects zero", I.translate("trhl.count", { count: 0 }), "0 atslēgu");
  check("lv trhl.count at 1 selects one", I.translate("trhl.count", { count: 1 }), "1 atslēga");
  check("lv trhl.count at 2 selects other", I.translate("trhl.count", { count: 2 }), "2 atslēgas");
  check("lv trhl.count at 10 selects zero", I.translate("trhl.count", { count: 10 }), "10 atslēgu");
  check("lv trhl.count at 11 selects zero", I.translate("trhl.count", { count: 11 }), "11 atslēgu");
  check("lv trhl.count at 21 selects one", I.translate("trhl.count", { count: 21 }), "21 atslēga");
  check("lv trhl.count at 22 selects other", I.translate("trhl.count", { count: 22 }), "22 atslēgas");
  check("lv trhl.count at 1.5 selects other", I.translate("trhl.count", { count: 1.5 }), "1.5 atslēgas");
  check("lv trhl.count at 1000000 selects zero", I.translate("trhl.count", { count: 1000000 }), "1000000 atslēgu");

  // Russian {one, few, many, other} and Greek {one, other} selection,
  // keyed off a synthetic namespace. The Russian "other" form carries a
  // marker because Russian "few" and "other" share the genitive-singular
  // noun form.
  I.register("trel", {
    en: { count: { one: "{count} key", other: "{count} keys" } },
    ru: { count: { one: "{count} ключ", few: "{count} ключа", many: "{count} ключей", other: "{count} ключа (дробное)" } },
    el: { count: { one: "{count} κλειδί", other: "{count} κλειδιά" } }
  });
  check("setLang('ru') returns true (trel)", I.setLang("ru"), true);
  check("ru trel.count at 0 selects many", I.translate("trel.count", { count: 0 }), "0 ключей");
  check("ru trel.count at 1 selects one", I.translate("trel.count", { count: 1 }), "1 ключ");
  check("ru trel.count at 2 selects few", I.translate("trel.count", { count: 2 }), "2 ключа");
  check("ru trel.count at 4 selects few", I.translate("trel.count", { count: 4 }), "4 ключа");
  check("ru trel.count at 5 selects many", I.translate("trel.count", { count: 5 }), "5 ключей");
  check("ru trel.count at 11 selects many", I.translate("trel.count", { count: 11 }), "11 ключей");
  check("ru trel.count at 12 selects many", I.translate("trel.count", { count: 12 }), "12 ключей");
  check("ru trel.count at 14 selects many", I.translate("trel.count", { count: 14 }), "14 ключей");
  check("ru trel.count at 21 selects one", I.translate("trel.count", { count: 21 }), "21 ключ");
  check("ru trel.count at 22 selects few", I.translate("trel.count", { count: 22 }), "22 ключа");
  check("ru trel.count at 25 selects many", I.translate("trel.count", { count: 25 }), "25 ключей");
  check("ru trel.count at 101 selects one", I.translate("trel.count", { count: 101 }), "101 ключ");
  check("ru trel.count at 111 selects many", I.translate("trel.count", { count: 111 }), "111 ключей");
  check("ru trel.count at 1.5 selects other", I.translate("trel.count", { count: 1.5 }), "1.5 ключа (дробное)");
  check("ru trel.count at 1000000 selects many", I.translate("trel.count", { count: 1000000 }), "1000000 ключей");
  check("setLang('el') returns true (trel)", I.setLang("el"), true);
  check("el trel.count at 0 selects other", I.translate("trel.count", { count: 0 }), "0 κλειδιά");
  check("el trel.count at 1 selects one", I.translate("trel.count", { count: 1 }), "1 κλειδί");
  check("el trel.count at 2 selects other", I.translate("trel.count", { count: 2 }), "2 κλειδιά");
  check("el trel.count at 1.5 selects other", I.translate("trel.count", { count: 1.5 }), "1.5 κλειδιά");
  check("el trel.count at 1000000 selects other", I.translate("trel.count", { count: 1000000 }), "1000000 κλειδιά");

  // Hebrew {one, two, other}: 1 selects one, 2 selects two, everything else other.
  I.register("trhe", {
    en: { count: { one: "{count} key", other: "{count} keys" } },
    he: { count: { one: "{count} one", two: "{count} two", other: "{count} other" } }
  });
  check("setLang('he') returns true (trhe)", I.setLang("he"), true);
  check("he trhe.count at 1 selects one", I.translate("trhe.count", { count: 1 }), "1 one");
  check("he trhe.count at 2 selects two", I.translate("trhe.count", { count: 2 }), "2 two");
  [0, 3, 10, 20, 1000000].forEach(function (n) {
    check("he trhe.count at " + n + " selects other", I.translate("trhe.count", { count: n }), n + " other");
  });

  // Hindi {one, other}: CLDR's one is "i = 0 or n = 1", so 0 and 0.5 select one as well as 1.
  I.register("trhi", {
    en: { count: { one: "{count} key", other: "{count} keys" } },
    hi: { count: { one: "{count} one", other: "{count} other" } }
  });
  check("setLang('hi') returns true (trhi)", I.setLang("hi"), true);
  [0, 0.5, 1].forEach(function (n) {
    check("hi trhi.count at " + n + " selects one", I.translate("trhi.count", { count: n }), n + " one");
  });
  [1.5, 2, 3, 10, 1000000].forEach(function (n) {
    check("hi trhi.count at " + n + " selects other", I.translate("trhi.count", { count: n }), n + " other");
  });
  check("after he then hi, html lang is hi", (I.setLang("he"), I.setLang("hi"), ctx._doc.documentElement.lang), "hi");
  check("after he then hi, html dir attribute is absent", ctx._doc.documentElement.getAttribute("dir"), null);

  // Arabic {zero, one, two, few, many, other}: Intl.PluralRules('ar') selects zero at 0, one at 1,
  // two at 2, few at n % 100 in 3..10, many at n % 100 in 11..99 and other for everything else.
  I.register("trar", {
    en: { count: { one: "{count} key", other: "{count} keys" } },
    ar: { count: { zero: "{count} zero", one: "{count} one", two: "{count} two", few: "{count} few", many: "{count} many", other: "{count} other" } }
  });
  check("setLang('ar') returns true (trar)", I.setLang("ar"), true);
  [[0, "zero"], [1, "one"], [2, "two"], [3, "few"], [10, "few"], [103, "few"], [11, "many"], [99, "many"], [111, "many"],
   [100, "other"], [101, "other"], [102, "other"], [1.5, "other"], [1000000, "other"]].forEach(function (pair) {
    check("ar trar.count at " + pair[0] + " selects " + pair[1], I.translate("trar.count", { count: pair[0] }), pair[0] + " " + pair[1]);
  });
  check("after hi then ar, html lang is ar", (I.setLang("hi"), I.setLang("ar"), ctx._doc.documentElement.lang), "ar");
  check("after hi then ar, html dir attribute is rtl", ctx._doc.documentElement.getAttribute("dir"), "rtl");
  check("after ar then he, html dir attribute stays rtl", (I.setLang("he"), ctx._doc.documentElement.getAttribute("dir")), "rtl");
  check("after he then ar, html lang is ar", (I.setLang("ar"), ctx._doc.documentElement.lang), "ar");
  check("after ar then en, html dir attribute is absent", (I.setLang("en"), ctx._doc.documentElement.getAttribute("dir")), null);

  // Albanian and Swahili {one, other}: Intl.PluralRules('sq') / ('sw') select one at exactly 1 and
  // other for 0, 2, 1.5, 21, 100 and 1000000 (unlike Hindi and French, 0 is other).
  I.register("trsqsw", {
    en: { count: { one: "{count} key", other: "{count} keys" } },
    sq: { count: { one: "{count} one", other: "{count} other" } },
    sw: { count: { one: "{count} one", other: "{count} other" } }
  });
  ["sq", "sw"].forEach(function (L) {
    check("setLang('" + L + "') returns true (trsqsw)", I.setLang(L), true);
    [[0, "other"], [1, "one"], [2, "other"], [1.5, "other"], [21, "other"], [100, "other"], [1000000, "other"]].forEach(function (pair) {
      check(L + " trsqsw.count at " + pair[0] + " selects " + pair[1], I.translate("trsqsw.count", { count: pair[0] }), pair[0] + " " + pair[1]);
    });
  });
  check("after ar then sq, html lang is sq", (I.setLang("ar"), I.setLang("sq"), ctx._doc.documentElement.lang), "sq");
  check("after ar then sq, html dir attribute is absent", ctx._doc.documentElement.getAttribute("dir"), null);
  check("after he then sw, html lang is sw", (I.setLang("he"), I.setLang("sw"), ctx._doc.documentElement.lang), "sw");
  check("after he then sw, html dir attribute is absent", ctx._doc.documentElement.getAttribute("dir"), null);
  check("after sw then ar, html dir attribute is rtl", (I.setLang("ar"), ctx._doc.documentElement.getAttribute("dir")), "rtl");
  I.setLang("en");

  // Chinese, Japanese and Korean have the single CLDR category other: a plural value is { other } alone
  // and that one form is rendered for every count (0, 1, 2, 1.5, 21, 100 and 1000000 alike).
  I.register("trcjk", {
    en: { count: { one: "{count} one", other: "{count} other" } },
    zh: { count: { other: "{count} other" } },
    ja: { count: { other: "{count} other" } },
    ko: { count: { other: "{count} other" } }
  });
  ["zh", "ja", "ko"].forEach(function (L) {
    check("setLang('" + L + "') returns true (trcjk)", I.setLang(L), true);
    [0, 1, 2, 1.5, 21, 100, 1000000].forEach(function (n) {
      check(L + " trcjk.count at " + n + " selects other", I.translate("trcjk.count", { count: n }), n + " other");
    });
  });
  // zh, ja and ko are left to right: switching to them from a right-to-left language removes dir.
  check("after ar then zh, html lang is zh", (I.setLang("ar"), I.setLang("zh"), ctx._doc.documentElement.lang), "zh");
  check("after ar then zh, html dir attribute is absent", ctx._doc.documentElement.getAttribute("dir"), null);
  check("after he then ja, html lang is ja", (I.setLang("he"), I.setLang("ja"), ctx._doc.documentElement.lang), "ja");
  check("after he then ja, html dir attribute is absent", ctx._doc.documentElement.getAttribute("dir"), null);
  check("after ar then ko, html lang is ko", (I.setLang("ar"), I.setLang("ko"), ctx._doc.documentElement.lang), "ko");
  check("after ar then ko, html dir attribute is absent", ctx._doc.documentElement.getAttribute("dir"), null);
  check("after ko then he, html dir attribute is rtl", (I.setLang("he"), ctx._doc.documentElement.getAttribute("dir")), "rtl");
  check("after zh then ar, html dir attribute is rtl", (I.setLang("zh"), I.setLang("ar"), ctx._doc.documentElement.getAttribute("dir")), "rtl");
  I.setLang("en");

  I.setLang("fr");
  check("fr t.count at 1000000 still falls back to other (fr's CLDR many unchanged)", I.translate("t.count", { count: 1000000 }), "1000000 trucs");
  I.setLang("en");

  // translateInto
  var tiEl = ctx.document.createElement("p");
  tiEl.setAttribute("data-i18n", "t.greet");
  tiEl.setAttribute("data-i18n-params", "{}");
  var nameEl = ctx.document.createElement("strong");
  nameEl.textContent = "Ada";
  var returned = I.translateInto(tiEl, "t.greet", { name: nameEl });
  check("translateInto returns the element", returned, tiEl);
  check("translateInto inserts the SAME node instance", tiEl.children.indexOf(nameEl) !== -1, true);
  check("translateInto result textContent", tiEl.textContent, "Hello Ada");
  check("translateInto removes data-i18n", tiEl.hasAttribute("data-i18n"), false);
  check("translateInto removes data-i18n-params", tiEl.hasAttribute("data-i18n-params"), false);

  // bindText
  var bEl = ctx.document.createElement("span");
  I.bindText(bEl, "t.greet", { name: "X" });
  check("bindText sets data-i18n", bEl.getAttribute("data-i18n"), "t.greet");
  check("bindText sets data-i18n-params", JSON.parse(bEl.getAttribute("data-i18n-params")), { name: "X" });
  check("bindText sets textContent", bEl.textContent, "Hello X");
  I.bindText(bEl, null);
  check("bindText(null) clears textContent", bEl.textContent, "");
  check("bindText(null) removes data-i18n", bEl.hasAttribute("data-i18n"), false);
  check("bindText(null) removes data-i18n-params", bEl.hasAttribute("data-i18n-params"), false);

  // applyStaticDom: plain, rich, reordered-rich (second-visit stability), attribute targets
  var root = ctx.document.createElement("div");

  var plainEl = ctx.document.createElement("p");
  plainEl.setAttribute("data-i18n", "t.greet");
  plainEl.setAttribute("data-i18n-params", JSON.stringify({ name: "Root" }));
  root.appendChild(plainEl);

  var richEl = ctx.document.createElement("p");
  richEl.setAttribute("data-i18n", "t.rich");
  var strongChild = ctx.document.createElement("strong");
  strongChild.textContent = "two";
  richEl.appendChild(strongChild);
  root.appendChild(richEl);

  var reorderEl = ctx.document.createElement("p");
  reorderEl.setAttribute("data-i18n", "t.richReordered");
  var childA = ctx.document.createElement("em"); childA.textContent = "Alpha";
  var childB = ctx.document.createElement("b"); childB.textContent = "Beta";
  reorderEl.appendChild(childA);
  reorderEl.appendChild(childB);
  root.appendChild(reorderEl);

  var titledEl = ctx.document.createElement("button");
  titledEl.setAttribute("data-i18n-title", "t.titleText");
  titledEl.setAttribute("data-i18n-aria-label", "t.titleText");
  titledEl.setAttribute("data-i18n-placeholder", "t.titleText");
  root.appendChild(titledEl);

  I.applyStaticDom(root);
  check("applyStaticDom plain element", plainEl.textContent, "Hello Root");
  check("applyStaticDom rich element keeps child in template position", richEl.children[0], strongChild);
  check("applyStaticDom rich element textContent", richEl.textContent, "You supply two primes");
  check("applyStaticDom reordered template renders child1 before child0", reorderEl.textContent, "Beta comes before Alpha");
  check("applyStaticDom reordered template keeps child0 identity", reorderEl.children[1], childA);
  check("applyStaticDom reordered template keeps child1 identity", reorderEl.children[0], childB);
  check("applyStaticDom sets title attribute", titledEl.getAttribute("title"), "Hover title");
  check("applyStaticDom sets aria-label attribute", titledEl.getAttribute("aria-label"), "Hover title");
  check("applyStaticDom sets placeholder attribute", titledEl.getAttribute("placeholder"), "Hover title");

  I.applyStaticDom(root); // second visit: WeakMap must remember first-visit child order
  check("applyStaticDom second visit still renders correctly", reorderEl.textContent, "Beta comes before Alpha");
  check("applyStaticDom second visit keeps child0 identity", reorderEl.children[1], childA);
  check("applyStaticDom second visit keeps child1 identity", reorderEl.children[0], childB);

  // register validation
  check("register throws on invalid namespace (uppercase start)", (tryCatchMessage(function () { I.register("Bad", { en: {} }); }) || "").indexOf("invalid namespace") !== -1, true);
  check("register throws on invalid namespace (digit start)", (tryCatchMessage(function () { I.register("1bad", { en: {} }); }) || "").indexOf("invalid namespace") !== -1, true);
  check("register throws on invalid namespace (hyphenated)", (tryCatchMessage(function () { I.register("bad-ns", { en: {} }); }) || "").indexOf("invalid namespace") !== -1, true);
  check("register accepts a valid camelCase namespace", tryCatchMessage(function () { I.register("validNs", { en: { k: "v" } }); }), null);
  check("newly registered namespace is immediately translatable", I.translate("validNs.k"), "v");
  check("register throws on missing en", (tryCatchMessage(function () { I.register("zzz", { fr: {} }); }) || "").indexOf("must have an own 'en'") !== -1, true);
  check("register throws on duplicate namespace", (tryCatchMessage(function () { I.register("t", { en: {} }); }) || "").indexOf("already registered") !== -1, true);

  // setLang: invalid values
  var beforeInvalid = ctx._changeEvents.length;
  check("setLang('xx') returns false", I.setLang("xx"), false);
  check("setLang('DE') returns false (case-sensitive)", I.setLang("DE"), false);
  check("setLang('') returns false", I.setLang(""), false);
  check("setLang(null) returns false", I.setLang(null), false);
  check("setLang(undefined) returns false", I.setLang(undefined), false);
  check("setLang('__proto__') returns false", I.setLang("__proto__"), false);
  check("setLang('pt') returns false", I.setLang("pt"), false);
  check("setLang('PT-BR') returns false (case-sensitive)", I.setLang("PT-BR"), false);
  check("setLang('pt-br') returns false (case-sensitive)", I.setLang("pt-br"), false);
  check("setLang('pt_BR') returns false", I.setLang("pt_BR"), false);
  check("setLang('pt-pt') returns false (case-sensitive)", I.setLang("pt-pt"), false);
  check("setLang(' pt-BR') returns false (no trimming)", I.setLang(" pt-BR"), false);
  check("setLang('no') returns false (legacy Norwegian tag is not an allow-list code)", I.setLang("no"), false);
  check("setLang('nn') returns false (Nynorsk not supported)", I.setLang("nn"), false);
  check("setLang('nb-NO') returns false (region-tagged nb not supported)", I.setLang("nb-NO"), false);
  check("setLang('sv-SE') returns false (region-tagged sv not supported)", I.setLang("sv-SE"), false);
  check("setLang('ro-RO') returns false (region-tagged ro not supported)", I.setLang("ro-RO"), false);
  check("setLang('hu-HU') returns false (region-tagged hu not supported)", I.setLang("hu-HU"), false);
  check("setLang('lv-LV') returns false (region-tagged lv not supported)", I.setLang("lv-LV"), false);
  check("setLang('mo') returns false (deprecated Moldavian tag is not an allow-list code)", I.setLang("mo"), false);
  check("setLang('lt') returns false (Lithuanian not supported)", I.setLang("lt"), false);
  check("setLang('ru-RU') returns false (region-tagged ru not supported)", I.setLang("ru-RU"), false);
  check("setLang('el-GR') returns false (region-tagged el not supported)", I.setLang("el-GR"), false);
  check("setLang('el-polyton') returns false (polytonic Greek variant tag not supported)", I.setLang("el-polyton"), false);
  check("setLang('gr') returns false (gr is a country code, not a language code)", I.setLang("gr"), false);
  check("setLang('iw') returns false (legacy Hebrew tag is not an allow-list code)", I.setLang("iw"), false);
  check("setLang('he-IL') returns false (region-tagged he not supported)", I.setLang("he-IL"), false);
  check("setLang('HE') returns false (case-sensitive)", I.setLang("HE"), false);
  check("setLang('hi-IN') returns false (region-tagged hi not supported)", I.setLang("hi-IN"), false);
  check("setLang('HI') returns false (case-sensitive)", I.setLang("HI"), false);
  check("setLang('ar-EG') returns false (region-tagged ar not supported)", I.setLang("ar-EG"), false);
  check("setLang('ar-SA') returns false (region-tagged ar not supported)", I.setLang("ar-SA"), false);
  check("setLang('AR') returns false (case-sensitive)", I.setLang("AR"), false);
  check("setLang('sq-AL') returns false (region-tagged sq not supported)", I.setLang("sq-AL"), false);
  check("setLang('SQ') returns false (case-sensitive)", I.setLang("SQ"), false);
  check("setLang('sqi') returns false (ISO 639-2 tag is not an allow-list code)", I.setLang("sqi"), false);
  check("setLang('alb') returns false (ISO 639-2 tag is not an allow-list code)", I.setLang("alb"), false);
  check("setLang('sw-KE') returns false (region-tagged sw not supported)", I.setLang("sw-KE"), false);
  check("setLang('SW') returns false (case-sensitive)", I.setLang("SW"), false);
  check("setLang('swa') returns false (ISO 639-2 tag is not an allow-list code)", I.setLang("swa"), false);
  check("setLang('swh') returns false (ISO 639-3 tag is not an allow-list code)", I.setLang("swh"), false);
  ["zh-CN", "zh-TW", "zh-Hans", "zh-Hant", "ZH", "Zh", "zho", "chi", "cmn", "ja-JP", "JA", "jpn", "ko-KR", "KO", "kor"].forEach(function (code) {
    check("setLang('" + code + "') returns false (exact, case-sensitive allow-list: only zh, ja and ko)", I.setLang(code), false);
  });
  check("setLang('ara') returns false (ISO 639-2 tag is not an allow-list code)", I.setLang("ara"), false);
  check("setLang('hin') returns false (ISO 639-3 tag is not an allow-list code)", I.setLang("hin"), false);
  check("setLang('uk') returns false (Ukrainian not supported)", I.setLang("uk"), false);
  check("setLang('be') returns false (Belarusian not supported)", I.setLang("be"), false);
  I.SUPPORTED_LANGS.forEach(function (lang) {
    var upper = lang.toUpperCase();
    if (upper === lang) return;
    check("setLang(upper-cased '" + lang + "') returns false (case-sensitive)", I.setLang(upper), false);
  });
  check("no change event fired for any invalid setLang call", ctx._changeEvents.length, beforeInvalid);

  // setLang: valid transitions across every supported language
  I.SUPPORTED_LANGS.forEach(function (lang) {
    var cnt = ctx._changeEvents.length;
    var prevLang = I.getLang();
    if (lang === prevLang) return;
    check("setLang('" + lang + "') returns true", I.setLang(lang), true);
    check("html lang updated to '" + lang + "'", ctx._doc.documentElement.lang, lang);
    check("html dir after setLang('" + lang + "') is rtl exactly for RTL_LANGS, else absent", ctx._doc.documentElement.getAttribute("dir"), RTL_LANGS.indexOf(lang) !== -1 ? "rtl" : null);
    check("getLang() reflects '" + lang + "'", I.getLang(), lang);
    check("exactly one change event for '" + lang + "'", ctx._changeEvents.length, cnt + 1);
    check("re-setting '" + lang + "' returns true with no new event", I.setLang(lang), true);
    check("no duplicate event for re-setting '" + lang + "'", ctx._changeEvents.length, cnt + 1);
  });

  // detectDefaultLang: mutate navigator directly on the live context
  ctx.navigator = { languages: ["de-AT", "en"] };
  check("detectDefaultLang(['de-AT','en']) -> de", I.detectDefaultLang(), "de");
  ctx.navigator = { languages: ["pt-BR"] };
  check("detectDefaultLang(['pt-BR']) -> pt-BR", I.detectDefaultLang(), "pt-BR");
  ctx.navigator = { languages: ["th-TH"] };
  check("detectDefaultLang(['th-TH']) -> en (unsupported falls back)", I.detectDefaultLang(), "en");
  ctx.navigator = { languages: ["pt-PT", "en"] };
  check("detectDefaultLang(['pt-PT','en']) -> pt-PT", I.detectDefaultLang(), "pt-PT");
  ctx.navigator = { languages: ["pt-AO"] };
  check("detectDefaultLang(['pt-AO']) -> pt-PT", I.detectDefaultLang(), "pt-PT");
  ctx.navigator = { languages: ["pt-MZ"] };
  check("detectDefaultLang(['pt-MZ']) -> pt-PT", I.detectDefaultLang(), "pt-PT");
  ctx.navigator = { languages: ["pt"] };
  check("detectDefaultLang(['pt']) -> pt-BR (bare pt)", I.detectDefaultLang(), "pt-BR");
  ctx.navigator = { languages: ["PT-br"] };
  check("detectDefaultLang(['PT-br']) -> pt-BR (case-insensitive)", I.detectDefaultLang(), "pt-BR");
  ctx.navigator = { languages: ["pt-pt"] };
  check("detectDefaultLang(['pt-pt']) -> pt-PT (case-insensitive)", I.detectDefaultLang(), "pt-PT");
  ctx.navigator = { languages: ["pt_PT"] };
  check("detectDefaultLang(['pt_PT']) -> pt-PT (underscore separator)", I.detectDefaultLang(), "pt-PT");
  ctx.navigator = { languages: ["pt-Latn-PT"] };
  check("detectDefaultLang(['pt-Latn-PT']) -> pt-PT (script subtag skipped)", I.detectDefaultLang(), "pt-PT");
  ctx.navigator = { languages: ["th", "pt-PT", "en"] };
  check("detectDefaultLang(['th','pt-PT','en']) -> pt-PT (first supported wins)", I.detectDefaultLang(), "pt-PT");
  ctx.navigator = { languages: ["de-AT", "pt-BR"] };
  check("detectDefaultLang(['de-AT','pt-BR']) -> de (earlier preference wins)", I.detectDefaultLang(), "de");
  ctx.navigator = { languages: ["ptx", "en"] };
  check("detectDefaultLang(['ptx','en']) -> en (primary subtag must be exactly pt)", I.detectDefaultLang(), "en");
  ctx.navigator = { languages: ["NL"] };
  check("detectDefaultLang(['NL']) -> nl (case-insensitive)", I.detectDefaultLang(), "nl");
  ctx.navigator = { languages: ["it-IT", "en"] };
  check("detectDefaultLang(['it-IT','en']) -> it", I.detectDefaultLang(), "it");
  ctx.navigator = { languages: ["IT"] };
  check("detectDefaultLang(['IT']) -> it (case-insensitive)", I.detectDefaultLang(), "it");
  ctx.navigator = { languages: ["pl-PL", "en"] };
  check("detectDefaultLang(['pl-PL','en']) -> pl", I.detectDefaultLang(), "pl");
  ctx.navigator = { languages: ["PL"] };
  check("detectDefaultLang(['PL']) -> pl (case-insensitive)", I.detectDefaultLang(), "pl");
  ctx.navigator = { languages: ["sv-SE"] };
  check("detectDefaultLang(['sv-SE']) -> sv", I.detectDefaultLang(), "sv");
  ctx.navigator = { languages: ["sv-FI", "en"] };
  check("detectDefaultLang(['sv-FI','en']) -> sv", I.detectDefaultLang(), "sv");
  ctx.navigator = { languages: ["SV"] };
  check("detectDefaultLang(['SV']) -> sv (case-insensitive)", I.detectDefaultLang(), "sv");
  ctx.navigator = { languages: ["nb-NO"] };
  check("detectDefaultLang(['nb-NO']) -> nb", I.detectDefaultLang(), "nb");
  ctx.navigator = { languages: ["nb"] };
  check("detectDefaultLang(['nb']) -> nb", I.detectDefaultLang(), "nb");
  ctx.navigator = { languages: ["no"] };
  check("detectDefaultLang(['no']) -> nb (legacy macrolanguage tag)", I.detectDefaultLang(), "nb");
  ctx.navigator = { languages: ["no-NO", "en"] };
  check("detectDefaultLang(['no-NO','en']) -> nb", I.detectDefaultLang(), "nb");
  ctx.navigator = { languages: ["NO_no"] };
  check("detectDefaultLang(['NO_no']) -> nb (case-insensitive, underscore separator)", I.detectDefaultLang(), "nb");
  ctx.navigator = { languages: ["nn-NO", "sv"] };
  check("detectDefaultLang(['nn-NO','sv']) -> sv (Nynorsk not supported, falls through)", I.detectDefaultLang(), "sv");
  ctx.navigator = { languages: ["nn", "en"] };
  check("detectDefaultLang(['nn','en']) -> en (Nynorsk not supported)", I.detectDefaultLang(), "en");
  ctx.navigator = { languages: ["nor", "en"] };
  check("detectDefaultLang(['nor','en']) -> en (primary subtag must be exactly no)", I.detectDefaultLang(), "en");
  ctx.navigator = { languages: ["th", "no", "en"] };
  check("detectDefaultLang(['th','no','en']) -> nb (first supported wins)", I.detectDefaultLang(), "nb");
  ctx.navigator = { languages: ["de-AT", "sv"] };
  check("detectDefaultLang(['de-AT','sv']) -> de (earlier preference wins)", I.detectDefaultLang(), "de");
  ctx.navigator = { languages: ["ro-RO"] };
  check("detectDefaultLang(['ro-RO']) -> ro", I.detectDefaultLang(), "ro");
  ctx.navigator = { languages: ["ro-MD", "en"] };
  check("detectDefaultLang(['ro-MD','en']) -> ro", I.detectDefaultLang(), "ro");
  ctx.navigator = { languages: ["RO"] };
  check("detectDefaultLang(['RO']) -> ro (case-insensitive)", I.detectDefaultLang(), "ro");
  ctx.navigator = { languages: ["hu-HU"] };
  check("detectDefaultLang(['hu-HU']) -> hu", I.detectDefaultLang(), "hu");
  ctx.navigator = { languages: ["HU_hu", "en"] };
  check("detectDefaultLang(['HU_hu','en']) -> hu (case-insensitive, underscore separator)", I.detectDefaultLang(), "hu");
  ctx.navigator = { languages: ["lv-LV", "en"] };
  check("detectDefaultLang(['lv-LV','en']) -> lv", I.detectDefaultLang(), "lv");
  ctx.navigator = { languages: ["LV"] };
  check("detectDefaultLang(['LV']) -> lv (case-insensitive)", I.detectDefaultLang(), "lv");
  ctx.navigator = { languages: ["mo", "en"] };
  check("detectDefaultLang(['mo','en']) -> en (deprecated Moldavian tag not mapped)", I.detectDefaultLang(), "en");
  ctx.navigator = { languages: ["lt-LT", "lv"] };
  check("detectDefaultLang(['lt-LT','lv']) -> lv (Lithuanian not supported, falls through)", I.detectDefaultLang(), "lv");
  ctx.navigator = { languages: ["ltg", "lv"] };
  check("detectDefaultLang(['ltg','lv']) -> lv (Latgalian not supported, falls through)", I.detectDefaultLang(), "lv");
  ctx.navigator = { languages: ["th", "hu", "en"] };
  check("detectDefaultLang(['th','hu','en']) -> hu (first supported wins)", I.detectDefaultLang(), "hu");
  ctx.navigator = { languages: ["de-AT", "ro"] };
  check("detectDefaultLang(['de-AT','ro']) -> de (earlier preference wins)", I.detectDefaultLang(), "de");
  ctx.navigator = { languages: ["ru-RU"] };
  check("detectDefaultLang(['ru-RU']) -> ru", I.detectDefaultLang(), "ru");
  ctx.navigator = { languages: ["ru-UA", "en"] };
  check("detectDefaultLang(['ru-UA','en']) -> ru", I.detectDefaultLang(), "ru");
  ctx.navigator = { languages: ["RU"] };
  check("detectDefaultLang(['RU']) -> ru (case-insensitive)", I.detectDefaultLang(), "ru");
  ctx.navigator = { languages: ["el-GR"] };
  check("detectDefaultLang(['el-GR']) -> el", I.detectDefaultLang(), "el");
  ctx.navigator = { languages: ["EL_gr", "en"] };
  check("detectDefaultLang(['EL_gr','en']) -> el (case-insensitive, underscore separator)", I.detectDefaultLang(), "el");
  ctx.navigator = { languages: ["el-CY"] };
  check("detectDefaultLang(['el-CY']) -> el", I.detectDefaultLang(), "el");
  ctx.navigator = { languages: ["uk-UA", "ru"] };
  check("detectDefaultLang(['uk-UA','ru']) -> ru (Ukrainian not supported, falls through)", I.detectDefaultLang(), "ru");
  ctx.navigator = { languages: ["be", "ru"] };
  check("detectDefaultLang(['be','ru']) -> ru (Belarusian not supported, falls through)", I.detectDefaultLang(), "ru");
  ctx.navigator = { languages: ["gr", "en"] };
  check("detectDefaultLang(['gr','en']) -> en (gr is not a language code)", I.detectDefaultLang(), "en");
  ctx.navigator = { languages: ["grc", "el"] };
  check("detectDefaultLang(['grc','el']) -> el (Ancient Greek not supported, falls through)", I.detectDefaultLang(), "el");
  ctx.navigator = { languages: ["sr-Cyrl-RS", "ru"] };
  check("detectDefaultLang(['sr-Cyrl-RS','ru']) -> ru (Serbian not supported, falls through)", I.detectDefaultLang(), "ru");
  ctx.navigator = { languages: ["th", "el", "en"] };
  check("detectDefaultLang(['th','el','en']) -> el (first supported wins)", I.detectDefaultLang(), "el");
  ctx.navigator = { languages: ["de-AT", "ru"] };
  check("detectDefaultLang(['de-AT','ru']) -> de (earlier preference wins)", I.detectDefaultLang(), "de");
  [
    [["he-IL"], "he", "he-IL"],
    [["HE"], "he", "HE (case-insensitive)"],
    [["iw"], "he", "iw (legacy Hebrew tag)"],
    [["iw-IL"], "he", "iw-IL (legacy tag with region)"],
    [["IW_il", "en"], "he", "IW_il (case-insensitive, underscore separator)"],
    [["yi", "he"], "he", "yi,he (Yiddish unsupported, falls through)"],
    [["ji", "en"], "en", "ji,en (legacy Yiddish tag not mapped)"],
    [["he-IL", "en"], "he", "he-IL,en (first supported wins)"],
    [["hi"], "hi", "hi"],
    [["hi-IN"], "hi", "hi-IN"],
    [["HI_in", "en"], "hi", "HI_in (case-insensitive, underscore separator)"],
    [["hi-IN", "en"], "hi", "hi-IN,en (first supported wins)"],
    [["ur-IN", "hi"], "hi", "ur-IN,hi (Urdu unsupported, falls through)"],
    [["mr-IN", "hi"], "hi", "mr-IN,hi (Marathi unsupported, falls through)"],
    [["ne", "en"], "en", "ne,en (Nepali not mapped)"],
    [["en-IN", "hi"], "en", "en-IN,hi (Indian English stays English)"],
    [["ar"], "ar", "ar"],
    [["ar-EG"], "ar", "ar-EG"],
    [["AR_sa", "en"], "ar", "AR_sa (case-insensitive, underscore separator)"],
    [["ar-001"], "ar", "ar-001 (UN M.49 region)"],
    [["fa-IR", "ar"], "ar", "fa-IR,ar (Persian unsupported, falls through)"],
    [["ur-PK", "en"], "en", "ur-PK,en (Urdu not mapped)"],
    [["en-AE", "ar"], "en", "en-AE,ar (English in the UAE stays English)"],
    [["he-IL", "ar"], "he", "he-IL,ar (first supported wins)"],
    [["sq"], "sq", "sq"],
    [["sq-AL"], "sq", "sq-AL"],
    [["SQ_xk", "en"], "sq", "SQ_xk (case-insensitive, underscore separator)"],
    [["sq-MK"], "sq", "sq-MK"],
    [["sqi", "en"], "sq", "sqi,en (ISO 639-2 Albanian, two-letter prefix)"],
    [["aln", "sq"], "sq", "aln,sq (Gheg Albanian unsupported, falls through)"],
    [["als", "en"], "en", "als,en (Tosk/Alemannic tag not mapped)"],
    [["sw"], "sw", "sw"],
    [["sw-KE"], "sw", "sw-KE"],
    [["SW_tz", "en"], "sw", "SW_tz (case-insensitive, underscore separator)"],
    [["sw-CD"], "sw", "sw-CD"],
    [["swh", "en"], "sw", "swh,en (ISO 639-3 Swahili, two-letter prefix)"],
    [["en-KE", "sw"], "en", "en-KE,sw (Kenyan English stays English)"],
    [["he-IL", "sq"], "he", "he-IL,sq (first supported wins)"],
    [["sq-AL", "sw-KE"], "sq", "sq-AL,sw-KE (first supported wins)"],
    [["zh"], "zh", "zh"],
    [["zh-CN"], "zh", "zh-CN"],
    [["ZH_tw", "en"], "zh", "ZH_tw (case-insensitive, underscore separator)"],
    [["zh-Hant-TW"], "zh", "zh-Hant-TW (Traditional script tag resolves to Simplified zh)"],
    [["zh-Hans-SG"], "zh", "zh-Hans-SG"],
    [["zh-HK"], "zh", "zh-HK (Traditional region resolves to Simplified zh)"],
    [["zh_Hant_MO"], "zh", "zh_Hant_MO (underscore separator, script and region subtags)"],
    [["zho", "en"], "zh", "zho,en (ISO 639-2 Chinese, two-letter prefix)"],
    [["yue-HK", "zh-HK"], "zh", "yue-HK,zh-HK (Cantonese unsupported, falls through)"],
    [["cmn-Hans-CN", "en"], "en", "cmn-Hans-CN,en (ISO 639-3 Mandarin tag does not start with zh)"],
    [["en-SG", "zh"], "en", "en-SG,zh (Singapore English stays English)"],
    [["ja"], "ja", "ja"],
    [["ja-JP"], "ja", "ja-JP"],
    [["JA_jp", "en"], "ja", "JA_jp (case-insensitive, underscore separator)"],
    [["jpn", "en"], "en", "jpn,en (ISO 639-2 Japanese does not start with ja, falls through)"],
    [["th", "ja"], "ja", "th,ja (Thai unsupported, falls through)"],
    [["ko"], "ko", "ko"],
    [["ko-KR"], "ko", "ko-KR"],
    [["KO_kp", "en"], "ko", "KO_kp (case-insensitive, underscore separator)"],
    [["kor", "en"], "ko", "kor,en (ISO 639-2 Korean, two-letter prefix)"],
    [["zh-TW", "ko"], "zh", "zh-TW,ko (first supported wins)"],
    [["he-IL", "ko"], "he", "he-IL,ko (first supported wins)"],
    [["pt-BR", "zh"], "pt-BR", "pt-BR,zh (first supported wins)"],
    [["no", "ja"], "nb", "no,ja (legacy Norwegian tag maps to nb, first supported wins)"],
    [["iw", "ko"], "he", "iw,ko (legacy Hebrew tag maps to he, first supported wins)"]
  ].forEach(function (c) {
    ctx.navigator = { languages: c[0] };
    check("detectDefaultLang(" + JSON.stringify(c[0]) + ") -> " + c[1] + " [" + c[2] + "]", I.detectDefaultLang(), c[1]);
  });
  I.SUPPORTED_LANGS.forEach(function (lang) {
    ctx.navigator = { languages: [lang] };
    check("detectDefaultLang(['" + lang + "']) round-trips to itself", I.detectDefaultLang(), lang);
  });
  ctx.navigator = { language: "fr-FR" };
  check("detectDefaultLang single navigator.language fallback -> fr", I.detectDefaultLang(), "fr");
  ctx.navigator = undefined;
  check("detectDefaultLang with missing navigator -> en", I.detectDefaultLang(), "en");

  // decorateLinks: a fresh isolated context so these hrefs are untouched by
  // the setLang() calls already run above on `ctx`.
  (function testDecorateLinks() {
    var ctx2 = loadI18n({ navigator: { languages: ["en-US", "en"] } });
    var I2 = ctx2.NT.i18n;
    var cases = [
      { href: "../RSA/rsa.html" },
      { href: "../RSA/rsa.html?theme=day", themeKept: "theme=day" },
      { href: "?a=3&b=5#x", hashKept: "#x" },
      { href: "x.html?lang=de&theme=night", themeKept: "theme=night", langReplaced: true },
      { href: "https://example.com", unchanged: true },
      { href: "#top", unchanged: true },
      { href: "", unchanged: true }
    ];
    var els = cases.map(function (c) {
      var a = ctx2.document.createElement("a");
      a.setAttribute("href", c.href);
      return a;
    });
    ["de", "fr", "pt-BR", "pt-PT"].forEach(function (targetLang) {
      I2.setLang(targetLang);
      cases.forEach(function (c, i) {
        var href = els[i].getAttribute("href");
        if (c.unchanged) {
          check("decorateLinks(" + targetLang + ") leaves " + JSON.stringify(c.href) + " untouched", href, c.href);
          return;
        }
        var langMatches = href.match(new RegExp("lang=" + targetLang, "g")) || [];
        check("decorateLinks(" + targetLang + ") adds exactly one lang=" + targetLang + " to " + JSON.stringify(c.href), langMatches.length, 1);
        if (c.themeKept) {
          check("decorateLinks(" + targetLang + ") preserves " + c.themeKept + " in " + JSON.stringify(c.href), href.indexOf(c.themeKept) !== -1, true);
        }
        if (c.hashKept) {
          check("decorateLinks(" + targetLang + ") preserves hash in " + JSON.stringify(c.href), href.slice(-c.hashKept.length), c.hashKept);
        }
        if (c.langReplaced) {
          check("decorateLinks(" + targetLang + ") replaces (not appends) existing lang= in " + JSON.stringify(c.href), (href.match(/lang=/g) || []).length, 1);
        }
      });
    });
  })();

  console.log("I18N-CHECK PASS api: " + assertionCount + " assertions");
  process.exit(0);
}

/* ---------- --persistence ---------- */

function doPersistence() {
  assertionCount = 0;

  // Read precedence: URL beats cookie beats localStorage beats
  // detectDefaultLang(); an invalid value in any channel is ignored and the
  // next channel is tried.
  [
    { opts: { search: "?lang=de", cookie: { initial: "fr" }, storage: { initial: "es" } }, want: "de", label: "url beats cookie and storage" },
    { opts: { search: "?lang=xx", cookie: { initial: "fr" }, storage: { initial: "es" } }, want: "fr", label: "invalid url falls through to cookie" },
    { opts: { search: "?lang=<script>", cookie: { initial: "fr" }, storage: { initial: "es" } }, want: "fr", label: "unparseable url falls through to cookie" },
    { opts: { cookie: { initial: "DE" }, storage: { initial: "es" } }, want: "es", label: "case-mismatched cookie falls through to storage" },
    { opts: { storage: { initial: "es" } }, want: "es", label: "storage used when url and cookie absent" },
    { opts: { storage: { initial: "xx" } }, want: "en", label: "invalid storage falls through to detected default" },
    { opts: { storage: { initial: "<script>" } }, want: "en", label: "unparseable storage falls through to detected default" },
    { opts: {}, want: "en", label: "no channel set -> detected default (navigator en)" },
    { opts: { search: "?lang=pt", cookie: { initial: "fr" }, storage: { initial: "es" } }, want: "fr", label: "url pt (bare, unsupported) falls through to cookie" },
    { opts: { search: "?lang=pt-br", cookie: { initial: "fr" }, storage: { initial: "es" } }, want: "fr", label: "url pt-br (region case mismatch) falls through to cookie" },
    { opts: { search: "?lang=PT-BR", cookie: { initial: "fr" }, storage: { initial: "es" } }, want: "fr", label: "url PT-BR (language case mismatch) falls through to cookie" },
    { opts: { search: "?lang=pt_BR", cookie: { initial: "fr" }, storage: { initial: "es" } }, want: "fr", label: "url pt_BR (underscore) falls through to cookie" },
    { opts: { cookie: { initial: "pt-br" }, storage: { initial: "es" } }, want: "es", label: "cookie pt-br falls through to storage" },
    { opts: { storage: { initial: "pt" } }, want: "en", label: "storage pt falls through to detected default" },
    { opts: { storage: { initial: "pt-pt" } }, want: "en", label: "storage pt-pt falls through to detected default" },
    { opts: { search: "?lang=pt%2DBR" }, want: "pt-BR", label: "url pt%2DBR decodes to pt-BR" },
    { opts: { search: "?lang=no", cookie: { initial: "fr" }, storage: { initial: "es" } }, want: "fr", label: "url no (legacy Norwegian tag, unsupported) falls through to cookie" },
    { opts: { search: "?lang=nn", cookie: { initial: "fr" }, storage: { initial: "es" } }, want: "fr", label: "url nn (Nynorsk, unsupported) falls through to cookie" },
    { opts: { search: "?lang=SV", cookie: { initial: "fr" }, storage: { initial: "es" } }, want: "fr", label: "url SV (case mismatch) falls through to cookie" },
    { opts: { search: "?lang=nb-NO", cookie: { initial: "fr" }, storage: { initial: "es" } }, want: "fr", label: "url nb-NO (region-tagged nb, unsupported) falls through to cookie" },
    { opts: { cookie: { initial: "no" }, storage: { initial: "es" } }, want: "es", label: "cookie no falls through to storage" },
    { opts: { storage: { initial: "nn" } }, want: "en", label: "storage nn falls through to detected default" },
    { opts: { storage: { initial: "no" }, navigator: { languages: ["no-NO", "en"] } }, want: "nb", label: "storage no falls through to detected nb (navigator no-NO)" },
    { opts: { search: "?lang=ro-RO", cookie: { initial: "fr" }, storage: { initial: "es" } }, want: "fr", label: "url ro-RO (region-tagged ro, unsupported) falls through to cookie" },
    { opts: { search: "?lang=HU", cookie: { initial: "fr" }, storage: { initial: "es" } }, want: "fr", label: "url HU (case mismatch) falls through to cookie" },
    { opts: { search: "?lang=mo", cookie: { initial: "fr" }, storage: { initial: "es" } }, want: "fr", label: "url mo (deprecated Moldavian tag, unsupported) falls through to cookie" },
    { opts: { cookie: { initial: "lv-LV" }, storage: { initial: "es" } }, want: "es", label: "cookie lv-LV falls through to storage" },
    { opts: { storage: { initial: "lt" } }, want: "en", label: "storage lt (Lithuanian, unsupported) falls through to detected default" },
    { opts: { storage: { initial: "RO" }, navigator: { languages: ["lv-LV", "en"] } }, want: "lv", label: "storage RO falls through to detected lv (navigator lv-LV)" },
    { opts: { search: "?lang=ru-RU", cookie: { initial: "fr" }, storage: { initial: "es" } }, want: "fr", label: "url ru-RU (region-tagged ru, unsupported) falls through to cookie" },
    { opts: { search: "?lang=EL", cookie: { initial: "fr" }, storage: { initial: "es" } }, want: "fr", label: "url EL (case mismatch) falls through to cookie" },
    { opts: { search: "?lang=gr", cookie: { initial: "fr" }, storage: { initial: "es" } }, want: "fr", label: "url gr (country code, not a language code) falls through to cookie" },
    { opts: { cookie: { initial: "el-GR" }, storage: { initial: "es" } }, want: "es", label: "cookie el-GR falls through to storage" },
    { opts: { storage: { initial: "uk" } }, want: "en", label: "storage uk (Ukrainian, unsupported) falls through to detected default" },
    { opts: { storage: { initial: "RU" }, navigator: { languages: ["el-GR", "en"] } }, want: "el", label: "storage RU falls through to detected el (navigator el-GR)" },
    { opts: { search: "?lang=iw", cookie: { initial: "fr" }, storage: { initial: "es" } }, want: "fr", label: "url iw (legacy Hebrew tag, unsupported) falls through to cookie" },
    { opts: { search: "?lang=he-IL", cookie: { initial: "fr" }, storage: { initial: "es" } }, want: "fr", label: "url he-IL (region-tagged he, unsupported) falls through to cookie" },
    { opts: { search: "?lang=HE", cookie: { initial: "fr" }, storage: { initial: "es" } }, want: "fr", label: "url HE (case mismatch) falls through to cookie" },
    { opts: { cookie: { initial: "iw" }, storage: { initial: "es" } }, want: "es", label: "cookie iw falls through to storage" },
    { opts: { storage: { initial: "iw" }, navigator: { languages: ["iw-IL", "en"] } }, want: "he", label: "storage iw falls through to detected he (navigator iw-IL)" },
    { opts: { search: "?lang=he", cookie: { initial: "fr" }, storage: { initial: "es" } }, want: "he", label: "url he beats cookie and storage" },
    { opts: { search: "?lang=hi-IN", cookie: { initial: "fr" }, storage: { initial: "es" } }, want: "fr", label: "url hi-IN (region-tagged hi, unsupported) falls through to cookie" },
    { opts: { search: "?lang=HI", cookie: { initial: "fr" }, storage: { initial: "es" } }, want: "fr", label: "url HI (case mismatch) falls through to cookie" },
    { opts: { cookie: { initial: "HI" }, storage: { initial: "es" } }, want: "es", label: "cookie HI falls through to storage" },
    { opts: { storage: { initial: "hin" } }, want: "en", label: "storage hin (ISO 639-3 tag, unsupported) falls through to detected default" },
    { opts: { search: "?lang=hi", cookie: { initial: "fr" }, storage: { initial: "es" } }, want: "hi", label: "url hi beats cookie and storage" },
    { opts: { storage: { initial: "hi-IN" }, navigator: { languages: ["hi-IN", "en"] } }, want: "hi", label: "storage hi-IN falls through to detected hi (navigator hi-IN)" },
    { opts: { search: "?lang=ar-EG", cookie: { initial: "fr" }, storage: { initial: "es" } }, want: "fr", label: "url ar-EG (region-tagged ar, unsupported) falls through to cookie" },
    { opts: { search: "?lang=AR", cookie: { initial: "fr" }, storage: { initial: "es" } }, want: "fr", label: "url AR (case mismatch) falls through to cookie" },
    { opts: { cookie: { initial: "AR" }, storage: { initial: "es" } }, want: "es", label: "cookie AR falls through to storage" },
    { opts: { storage: { initial: "ara" } }, want: "en", label: "storage ara (ISO 639-2 tag, unsupported) falls through to detected default" },
    { opts: { search: "?lang=ar", cookie: { initial: "fr" }, storage: { initial: "es" } }, want: "ar", label: "url ar beats cookie and storage" },
    { opts: { storage: { initial: "ar-EG" }, navigator: { languages: ["ar-EG", "en"] } }, want: "ar", label: "storage ar-EG falls through to detected ar (navigator ar-EG)" },
    { opts: { search: "?lang=sq", cookie: { initial: "fr" }, storage: { initial: "es" } }, want: "sq", label: "url sq beats cookie and storage" },
    { opts: { search: "?lang=sq-AL", cookie: { initial: "fr" }, storage: { initial: "es" } }, want: "fr", label: "url sq-AL (region-tagged sq, unsupported) falls through to cookie" },
    { opts: { search: "?lang=SQ", cookie: { initial: "fr" }, storage: { initial: "es" } }, want: "fr", label: "url SQ (case mismatch) falls through to cookie" },
    { opts: { search: "?lang=sw", cookie: { initial: "fr" }, storage: { initial: "es" } }, want: "sw", label: "url sw beats cookie and storage" },
    { opts: { cookie: { initial: "SW" }, storage: { initial: "es" } }, want: "es", label: "cookie SW falls through to storage" },
    { opts: { storage: { initial: "swa" } }, want: "en", label: "storage swa (ISO 639-2 tag, unsupported) falls through to detected default" },
    { opts: { storage: { initial: "sw-KE" }, navigator: { languages: ["sw-KE", "en"] } }, want: "sw", label: "storage sw-KE falls through to detected sw (navigator sw-KE)" },
    { opts: { storage: { initial: "sq-AL" }, navigator: { languages: ["sq-AL", "en"] } }, want: "sq", label: "storage sq-AL falls through to detected sq (navigator sq-AL)" },
    { opts: { search: "?lang=zh", cookie: { initial: "fr" }, storage: { initial: "es" } }, want: "zh", label: "url zh beats cookie and storage" },
    { opts: { search: "?lang=ja", cookie: { initial: "ko" }, storage: { initial: "zh" } }, want: "ja", label: "url ja beats a cookie of ko and a stored zh" },
    { opts: { search: "?lang=ko", cookie: { initial: "fr" }, storage: { initial: "es" } }, want: "ko", label: "url ko beats cookie and storage" },
    { opts: { search: "?lang=zh-CN", cookie: { initial: "fr" }, storage: { initial: "es" } }, want: "fr", label: "url zh-CN (region-tagged zh, unsupported) falls through to cookie" },
    { opts: { search: "?lang=ja-JP", cookie: { initial: "fr" }, storage: { initial: "es" } }, want: "fr", label: "url ja-JP (region-tagged ja, unsupported) falls through to cookie" },
    { opts: { search: "?lang=ko-KR", cookie: { initial: "fr" }, storage: { initial: "es" } }, want: "fr", label: "url ko-KR (region-tagged ko, unsupported) falls through to cookie" },
    { opts: { cookie: { initial: "ZH" }, storage: { initial: "es" } }, want: "es", label: "cookie ZH falls through to storage" },
    { opts: { cookie: { initial: "JA" }, storage: { initial: "es" } }, want: "es", label: "cookie JA falls through to storage" },
    { opts: { cookie: { initial: "ko" }, storage: { initial: "es" } }, want: "ko", label: "cookie ko beats storage" },
    { opts: { storage: { initial: "zh-Hans" }, navigator: { languages: ["zh-TW", "en"] } }, want: "zh", label: "storage zh-Hans falls through to detected zh (navigator zh-TW)" },
    { opts: { storage: { initial: "ko-KR" }, navigator: { languages: ["ko-KR", "en"] } }, want: "ko", label: "storage ko-KR falls through to detected ko (navigator ko-KR)" },
    { opts: { storage: { initial: "jpn" } }, want: "en", label: "storage jpn (ISO 639-2 tag, unsupported) falls through to detected default" }
  ].forEach(function (scenario) {
    var opts = Object.assign({ navigator: { languages: ["en-US", "en"] } }, scenario.opts);
    var ctx = loadI18n(opts);
    check("precedence: " + scenario.label, ctx.NT.i18n.getLang(), scenario.want);
  });

  // Every supported language round-trips through each individual channel.
  LANG_CODES.forEach(function (lang) {
    var ctxUrl = loadI18n({ search: "?lang=" + lang, navigator: { languages: ["en-US", "en"] } });
    check("channel url resolves '" + lang + "'", ctxUrl.NT.i18n.getLang(), lang);
    var ctxCookie = loadI18n({ cookie: { initial: lang }, navigator: { languages: ["en-US", "en"] } });
    check("channel cookie resolves '" + lang + "'", ctxCookie.NT.i18n.getLang(), lang);
    var ctxStorage = loadI18n({ storage: { initial: lang }, navigator: { languages: ["en-US", "en"] } });
    check("channel storage resolves '" + lang + "'", ctxStorage.NT.i18n.getLang(), lang);
  });

  // Right-to-left: html dir="rtl" is applied at evaluation time while
  // Hebrew is the active language, and never present for any other language.
  (function () {
    var heCtx = loadI18n({ search: "?lang=he", navigator: { languages: ["en-US", "en"] } });
    check("?lang=he load sets html lang", heCtx._doc.documentElement.lang, "he");
    check("?lang=he load sets html dir rtl", heCtx._doc.documentElement.getAttribute("dir"), "rtl");
    var hiCtx = loadI18n({ search: "?lang=hi", navigator: { languages: ["en-US", "en"] } });
    check("?lang=hi load sets html lang", hiCtx._doc.documentElement.lang, "hi");
    check("?lang=hi load leaves html dir absent", hiCtx._doc.documentElement.getAttribute("dir"), null);
    var arCtx = loadI18n({ search: "?lang=ar", navigator: { languages: ["en-US", "en"] } });
    check("?lang=ar load sets html lang", arCtx._doc.documentElement.lang, "ar");
    check("?lang=ar load sets html dir rtl", arCtx._doc.documentElement.getAttribute("dir"), "rtl");
    var sqCtx = loadI18n({ search: "?lang=sq", navigator: { languages: ["en-US", "en"] } });
    check("?lang=sq load sets html lang", sqCtx._doc.documentElement.lang, "sq");
    check("?lang=sq load leaves html dir absent", sqCtx._doc.documentElement.getAttribute("dir"), null);
    var swCtx = loadI18n({ search: "?lang=sw", navigator: { languages: ["en-US", "en"] } });
    check("?lang=sw load sets html lang", swCtx._doc.documentElement.lang, "sw");
    check("?lang=sw load leaves html dir absent", swCtx._doc.documentElement.getAttribute("dir"), null);
    ["zh", "ja", "ko"].forEach(function (L) {
      var cjkCtx = loadI18n({ search: "?lang=" + L, navigator: { languages: ["en-US", "en"] } });
      check("?lang=" + L + " load sets html lang", cjkCtx._doc.documentElement.lang, L);
      check("?lang=" + L + " load leaves html dir absent", cjkCtx._doc.documentElement.getAttribute("dir"), null);
    });
    var enCtx = loadI18n({ navigator: { languages: ["en-US", "en"] } });
    check("plain English load leaves html dir absent", enCtx._doc.documentElement.getAttribute("dir"), null);
    var deCtx = loadI18n({ search: "?lang=de", navigator: { languages: ["en-US", "en"] } });
    check("?lang=de load leaves html dir absent", deCtx._doc.documentElement.getAttribute("dir"), null);
  })();

  // Throwing cookie/localStorage channels never throw out of the module,
  // at load or when a later explicit choice tries to persist.
  (function () {
    var threwAtLoad = tryCatchMessage(function () {
      loadI18n({ cookie: { throwOnGet: true }, storage: { throwOnGet: true } });
    });
    check("throwing cookie/storage getters do not throw at load", threwAtLoad, null);

    var ctx = loadI18n({ cookie: { throwOnSet: true }, storage: { throwOnSet: true } });
    var threwOnSet = tryCatchMessage(function () { ctx.NT.i18n.setLang("de"); });
    check("throwing cookie/storage setters do not throw on setLang", threwOnSet, null);
    check("setLang still applies in-memory despite throwing persistence", ctx.NT.i18n.getLang(), "de");
  })();

  // Bare vm context (only `window`) must not throw when persistence code paths exist.
  (function () {
    var bareCtx = {};
    bareCtx.window = bareCtx;
    vm.createContext(bareCtx);
    var threw = tryCatchMessage(function () {
      vm.runInContext(fs.readFileSync(path.join(ROOT, "assets", "nt-i18n.js"), "utf8"), bareCtx, { filename: "assets/nt-i18n.js" });
    });
    check("bare vm context (only window) does not throw", threw, null);
  })();

  // A detected default is never persisted. _storage._log also records
  // "get" entries from the read-precedence probes (fromStorage() during
  // resolution), so only "set" entries count as a write.
  (function () {
    var ctx = loadI18n({ navigator: { languages: ["en-US", "en"] } });
    var storageWrites = ctx._storage._log.filter(function (e) { return e[0] === "set"; });
    check("detected default is not written to storage", storageWrites.length, 0);
    check("detected default is not written to cookie", ctx._jar._log.length, 0);
  })();

  (function () {
    var ctx = loadI18n({ navigator: { languages: ["no-NO", "en"] } });
    check("detected nb (navigator no-NO) resolves to nb", ctx.NT.i18n.getLang(), "nb");
    var storageWrites = ctx._storage._log.filter(function (e) { return e[0] === "set"; });
    check("detected nb default is not written to storage", storageWrites.length, 0);
    check("detected nb default is not written to cookie", ctx._jar._log.length, 0);
  })();

  (function () {
    var ctx = loadI18n({ navigator: { languages: ["hu-HU", "en"] } });
    check("detected hu (navigator hu-HU) resolves to hu", ctx.NT.i18n.getLang(), "hu");
    var storageWrites = ctx._storage._log.filter(function (e) { return e[0] === "set"; });
    check("detected hu default is not written to storage", storageWrites.length, 0);
    check("detected hu default is not written to cookie", ctx._jar._log.length, 0);
  })();

  (function () {
    var ctx = loadI18n({ navigator: { languages: ["ru-RU", "en"] } });
    check("detected ru (navigator ru-RU) resolves to ru", ctx.NT.i18n.getLang(), "ru");
    var storageWrites = ctx._storage._log.filter(function (e) { return e[0] === "set"; });
    check("detected ru default is not written to storage", storageWrites.length, 0);
    check("detected ru default is not written to cookie", ctx._jar._log.length, 0);
  })();

  // An explicit load-time choice IS persisted: localStorage first, then
  // cookie, in the exact theme.js-style attribute string, for every
  // supported language and every winning channel.
  [
    { opts: { search: "?lang=de" }, lang: "de", via: "url" },
    { opts: { cookie: { initial: "fr" } }, lang: "fr", via: "cookie" },
    { opts: { storage: { initial: "es" } }, lang: "es", via: "storage" },
    { opts: { search: "?lang=it" }, lang: "it", via: "url" },
    { opts: { cookie: { initial: "pl" } }, lang: "pl", via: "cookie" },
    { opts: { search: "?lang=pt-BR" }, lang: "pt-BR", via: "url" },
    { opts: { cookie: { initial: "pt-PT" } }, lang: "pt-PT", via: "cookie" },
    { opts: { search: "?lang=sv" }, lang: "sv", via: "url" },
    { opts: { cookie: { initial: "nb" } }, lang: "nb", via: "cookie" },
    { opts: { search: "?lang=ro" }, lang: "ro", via: "url" },
    { opts: { cookie: { initial: "hu" } }, lang: "hu", via: "cookie" },
    { opts: { storage: { initial: "lv" } }, lang: "lv", via: "storage" },
    { opts: { search: "?lang=ru" }, lang: "ru", via: "url" },
    { opts: { cookie: { initial: "el" } }, lang: "el", via: "cookie" }
  ].forEach(function (scenario) {
    var opts = Object.assign({ navigator: { languages: ["en-US", "en"] } }, scenario.opts);
    var ctx = loadI18n(opts);
    check("explicit (" + scenario.via + ") " + scenario.lang + " persisted to storage", ctx._storage._data[LANG_KEY], scenario.lang);
    check("explicit (" + scenario.via + ") " + scenario.lang + " persisted to cookie", ctx._jar._store[LANG_KEY], scenario.lang);
    var orderKinds = ctx._order.map(function (e) { return e.split(":")[0]; });
    var storageIdx = orderKinds.indexOf("storage");
    var cookieIdx = orderKinds.indexOf("cookie");
    check("explicit (" + scenario.via + ") write order: storage before cookie", storageIdx !== -1 && cookieIdx !== -1 && storageIdx < cookieIdx, true);
    var cookieRaw = ctx._order.filter(function (e) { return e.indexOf("cookie:") === 0; })[0] || "";
    check("explicit (" + scenario.via + ") cookie string has path=/", cookieRaw.indexOf("path=/") !== -1, true);
    check("explicit (" + scenario.via + ") cookie string has max-age=31536000", cookieRaw.indexOf("max-age=31536000") !== -1, true);
    check("explicit (" + scenario.via + ") cookie string has samesite=lax", cookieRaw.indexOf("samesite=lax") !== -1, true);
    check("explicit (" + scenario.via + ") " + scenario.lang + " cookie string starts with site-lang=" + scenario.lang + ";", cookieRaw.indexOf("cookie:site-lang=" + scenario.lang + ";") === 0, true);
  });

  // setLang() also persists: storage first, then cookie.
  (function () {
    var ctx = loadI18n({ navigator: { languages: ["en-US", "en"] } });
    ctx._order.length = 0; // clear whatever init() logged (nothing, for a detected default)
    ctx.NT.i18n.setLang("de");
    check("setLang persists to storage", ctx._storage._data[LANG_KEY], "de");
    check("setLang persists to cookie", ctx._jar._store[LANG_KEY], "de");
    var orderKinds = ctx._order.map(function (e) { return e.split(":")[0]; });
    check("setLang write order: storage before cookie", orderKinds.indexOf("storage") < orderKinds.indexOf("cookie"), true);
  })();

  // Cross-tab sync: a storage event for this module's own key re-applies
  // the language without writing storage again; events for any other key
  // (including theme.js's own site-theme) are ignored; an invalid or
  // same-value newValue is a no-op.
  (function () {
    var ctx = loadI18n({ navigator: { languages: ["en-US", "en"] } });
    var I = ctx.NT.i18n;
    var changeBefore = ctx._changeEvents.length;
    var writesBefore = ctx._storage._log.length;

    ctx._fireStorage(I.LANG_STORAGE_KEY, "de");
    check("storage event re-applies html lang", ctx._doc.documentElement.lang, "de");
    check("storage event updates getLang()", I.getLang(), "de");
    check("storage event fires exactly one change event", ctx._changeEvents.length, changeBefore + 1);
    check("storage event does not write storage again", ctx._storage._log.length, writesBefore);

    ["site-theme", "group-params", "ab-params"].forEach(function (otherKey) {
      ctx._fireStorage(otherKey, "something-else");
      check("storage event for '" + otherKey + "' is ignored", ctx._doc.documentElement.lang, "de");
    });

    var changeAfterIgnored = ctx._changeEvents.length;
    ctx._fireStorage(I.LANG_STORAGE_KEY, "xx");
    check("storage event with invalid newValue is a no-op", ctx._doc.documentElement.lang, "de");
    check("storage event with invalid newValue fires no change event", ctx._changeEvents.length, changeAfterIgnored);

    ctx._fireStorage(I.LANG_STORAGE_KEY, null);
    check("storage event with null newValue is a no-op", ctx._doc.documentElement.lang, "de");

    ctx._fireStorage(I.LANG_STORAGE_KEY, "de");
    check("storage event with the already-active value fires no new change event", ctx._changeEvents.length, changeAfterIgnored);

    ctx._fireStorage(I.LANG_STORAGE_KEY, "fr");
    check("a second distinct storage event still re-applies", ctx._doc.documentElement.lang, "fr");
    check("a second distinct storage event fires one more change event", ctx._changeEvents.length, changeAfterIgnored + 1);

    var changeAfterFr = ctx._changeEvents.length;
    ctx._fireStorage(I.LANG_STORAGE_KEY, "pt-br");
    check("storage event with region-case-mismatched pt-br is a no-op", ctx._doc.documentElement.lang, "fr");
    check("storage event with pt-br fires no change event", ctx._changeEvents.length, changeAfterFr);

    ctx._fireStorage(I.LANG_STORAGE_KEY, "pt-PT");
    check("storage event with pt-PT re-applies html lang", ctx._doc.documentElement.lang, "pt-PT");
    check("storage event with pt-PT fires one more change event", ctx._changeEvents.length, changeAfterFr + 1);

    var changeAfterPtPT = ctx._changeEvents.length;
    ctx._fireStorage(I.LANG_STORAGE_KEY, "no");
    check("storage event with the legacy no tag is a no-op", ctx._doc.documentElement.lang, "pt-PT");
    check("storage event with no fires no change event", ctx._changeEvents.length, changeAfterPtPT);

    ctx._fireStorage(I.LANG_STORAGE_KEY, "nb");
    check("storage event with nb re-applies html lang", ctx._doc.documentElement.lang, "nb");
    check("storage event with nb fires one more change event", ctx._changeEvents.length, changeAfterPtPT + 1);

    var changeAfterNb = ctx._changeEvents.length;
    ctx._fireStorage(I.LANG_STORAGE_KEY, "RO");
    check("storage event with the case-mismatched RO is a no-op", ctx._doc.documentElement.lang, "nb");
    check("storage event with RO fires no change event", ctx._changeEvents.length, changeAfterNb);

    ctx._fireStorage(I.LANG_STORAGE_KEY, "lv");
    check("storage event with lv re-applies html lang", ctx._doc.documentElement.lang, "lv");
    check("storage event with lv fires one more change event", ctx._changeEvents.length, changeAfterNb + 1);

    var changeAfterLv = ctx._changeEvents.length;
    ctx._fireStorage(I.LANG_STORAGE_KEY, "EL");
    check("storage event with the case-mismatched EL is a no-op", ctx._doc.documentElement.lang, "lv");
    check("storage event with EL fires no change event", ctx._changeEvents.length, changeAfterLv);

    ctx._fireStorage(I.LANG_STORAGE_KEY, "ru");
    check("storage event with ru re-applies html lang", ctx._doc.documentElement.lang, "ru");
    check("storage event with ru fires one more change event", ctx._changeEvents.length, changeAfterLv + 1);
    check("storage event with ru leaves html dir absent", ctx._doc.documentElement.getAttribute("dir"), null);

    var changeAfterRu = ctx._changeEvents.length;
    ctx._fireStorage(I.LANG_STORAGE_KEY, "iw");
    check("storage event with the legacy iw tag is a no-op", ctx._doc.documentElement.lang, "ru");
    check("storage event with iw fires no change event", ctx._changeEvents.length, changeAfterRu);

    ctx._fireStorage(I.LANG_STORAGE_KEY, "he");
    check("storage event with he re-applies html lang", ctx._doc.documentElement.lang, "he");
    check("storage event with he sets html dir rtl", ctx._doc.documentElement.getAttribute("dir"), "rtl");
    check("storage event with he fires one more change event", ctx._changeEvents.length, changeAfterRu + 1);

    var changeAfterHe = ctx._changeEvents.length;
    ctx._fireStorage(I.LANG_STORAGE_KEY, "hi");
    check("storage event with hi while he is active re-applies html lang", ctx._doc.documentElement.lang, "hi");
    check("storage event with hi while he is active removes html dir", ctx._doc.documentElement.getAttribute("dir"), null);
    check("storage event with hi fires one more change event", ctx._changeEvents.length, changeAfterHe + 1);

    var changeAfterHi = ctx._changeEvents.length;
    ctx._fireStorage(I.LANG_STORAGE_KEY, "hi-IN");
    check("storage event with the region-tagged hi-IN is a no-op", ctx._doc.documentElement.lang, "hi");
    check("storage event with hi-IN fires no change event", ctx._changeEvents.length, changeAfterHi);

    ctx._fireStorage(I.LANG_STORAGE_KEY, "ar");
    check("storage event with ar while hi is active re-applies html lang", ctx._doc.documentElement.lang, "ar");
    check("storage event with ar while hi is active sets html dir rtl", ctx._doc.documentElement.getAttribute("dir"), "rtl");
    check("storage event with ar fires one more change event", ctx._changeEvents.length, changeAfterHi + 1);

    var changeAfterAr = ctx._changeEvents.length;
    ctx._fireStorage(I.LANG_STORAGE_KEY, "he");
    check("storage event with he while ar is active re-applies html lang", ctx._doc.documentElement.lang, "he");
    check("storage event with he while ar is active keeps html dir rtl", ctx._doc.documentElement.getAttribute("dir"), "rtl");
    check("storage event with he while ar is active fires one more change event", ctx._changeEvents.length, changeAfterAr + 1);

    ctx._fireStorage(I.LANG_STORAGE_KEY, "ar");
    var changeAfterAr2 = ctx._changeEvents.length;
    ctx._fireStorage(I.LANG_STORAGE_KEY, "ar-EG");
    check("storage event with the region-tagged ar-EG is a no-op", ctx._doc.documentElement.lang, "ar");
    check("storage event with ar-EG fires no change event", ctx._changeEvents.length, changeAfterAr2);

    ctx._fireStorage(I.LANG_STORAGE_KEY, "sq");
    check("storage event with sq while ar is active re-applies html lang", ctx._doc.documentElement.lang, "sq");
    check("storage event with sq while ar is active removes html dir", ctx._doc.documentElement.getAttribute("dir"), null);
    check("storage event with sq fires one more change event", ctx._changeEvents.length, changeAfterAr2 + 1);

    var changeAfterSq = ctx._changeEvents.length;
    ctx._fireStorage(I.LANG_STORAGE_KEY, "sq-AL");
    check("storage event with the region-tagged sq-AL is a no-op", ctx._doc.documentElement.lang, "sq");
    check("storage event with sq-AL fires no change event", ctx._changeEvents.length, changeAfterSq);

    ctx._fireStorage(I.LANG_STORAGE_KEY, "he");
    ctx._fireStorage(I.LANG_STORAGE_KEY, "sw");
    check("storage event with sw while he is active re-applies html lang", ctx._doc.documentElement.lang, "sw");
    check("storage event with sw while he is active removes html dir", ctx._doc.documentElement.getAttribute("dir"), null);
    var changeAfterSw = ctx._changeEvents.length;
    ctx._fireStorage(I.LANG_STORAGE_KEY, "sw-KE");
    check("storage event with the region-tagged sw-KE is a no-op", ctx._changeEvents.length, changeAfterSw);

    ctx._fireStorage(I.LANG_STORAGE_KEY, "ar");
    var changeBeforeJa = ctx._changeEvents.length;
    ctx._fireStorage(I.LANG_STORAGE_KEY, "ja");
    check("storage event with ja while ar is active re-applies html lang", ctx._doc.documentElement.lang, "ja");
    check("storage event with ja while ar is active removes html dir", ctx._doc.documentElement.getAttribute("dir"), null);
    check("storage event with ja fires one more change event", ctx._changeEvents.length, changeBeforeJa + 1);
    ctx._fireStorage(I.LANG_STORAGE_KEY, "he");
    ctx._fireStorage(I.LANG_STORAGE_KEY, "ko");
    check("storage event with ko while he is active re-applies html lang", ctx._doc.documentElement.lang, "ko");
    check("storage event with ko while he is active removes html dir", ctx._doc.documentElement.getAttribute("dir"), null);
    var changeAfterKo = ctx._changeEvents.length;
    ctx._fireStorage(I.LANG_STORAGE_KEY, "zh-CN");
    check("storage event with the region-tagged zh-CN is a no-op", ctx._doc.documentElement.lang, "ko");
    check("storage event with zh-CN fires no change event", ctx._changeEvents.length, changeAfterKo);

    ctx._fireStorage(I.LANG_STORAGE_KEY, "de");
    check("storage event back to de removes html dir", ctx._doc.documentElement.getAttribute("dir"), null);
  })();

  // lang= is stripped from the address bar after init(), every other
  // parameter and the hash are left intact; a URL with no lang= never
  // calls replaceState at all.
  [
    { search: "?lang=de", pathname: "/x.html", hash: "", calls: 1, want: "/x.html" },
    { search: "?theme=day&lang=de&n=7", pathname: "/x.html", hash: "#k", calls: 1, want: "/x.html?theme=day&n=7#k" },
    { search: "?lang=de&theme=night", pathname: "/y.html", hash: "", calls: 1, want: "/y.html?theme=night" },
    { search: "?n=7", pathname: "/x.html", hash: "", calls: 0, want: null },
    { search: "", pathname: "/x.html", hash: "", calls: 0, want: null },
    { search: "?theme=day&lang=pt-BR&n=7", pathname: "/x.html", hash: "#k", calls: 1, want: "/x.html?theme=day&n=7#k" },
    { search: "?lang=pt-br", pathname: "/x.html", hash: "", calls: 0, want: null },
    { search: "?theme=day&lang=sv&n=7", pathname: "/x.html", hash: "#k", calls: 1, want: "/x.html?theme=day&n=7#k" },
    { search: "?lang=no", pathname: "/x.html", hash: "", calls: 0, want: null },
    { search: "?theme=day&lang=hu&n=7", pathname: "/x.html", hash: "#k", calls: 1, want: "/x.html?theme=day&n=7#k" },
    { search: "?lang=ro-RO", pathname: "/x.html", hash: "", calls: 0, want: null },
    { search: "?theme=day&lang=el&n=7", pathname: "/x.html", hash: "#k", calls: 1, want: "/x.html?theme=day&n=7#k" },
    { search: "?lang=ru-RU", pathname: "/x.html", hash: "", calls: 0, want: null }
  ].forEach(function (c) {
    var ctx = loadI18n({ search: c.search, pathname: c.pathname, hash: c.hash, navigator: { languages: ["en-US", "en"] } });
    check("stripUrlParam call count for " + JSON.stringify(c.search), ctx.history._calls.length, c.calls);
    if (c.calls > 0) {
      check("stripUrlParam result url for " + JSON.stringify(c.search), ctx.history._calls[ctx.history._calls.length - 1], c.want);
    }
  });

  console.log("I18N-CHECK PASS persistence: " + assertionCount + " assertions");
  process.exit(0);
}

/* =========================================================================
 * Static modes (06-02 Task 1): --coverage, --literals(-markup|-js), --header
 * (+ --switcher-present), --includes, --no-locale-number-format, --all,
 * --report. Shared across every per-page translation plan in wave 3.
 * ======================================================================= */

/* ---------- language lists (Q-04, quick task 261002-c77; data-driven, quick task 261002-s7l) ---------- */

// SWITCHER_OPTIONS: the one per-language table, one <option value lang
// label> entry per supported language in switcher order, mirroring the
// literal page markup. checkSwitcherPresent compares against this list.
// LANG_CODES and the switcher autonyms in NEUTRAL_TOKENS derive from it.
var SWITCHER_OPTIONS = [
  { value: "nl", lang: "nl", label: "Nederlands" },
  { value: "en", lang: "en", label: "English" },
  { value: "de", lang: "de", label: "Deutsch" },
  { value: "fr", lang: "fr", label: "Français" },
  { value: "es", lang: "es", label: "Español" },
  { value: "it", lang: "it", label: "Italiano" },
  { value: "pl", lang: "pl", label: "Polski" },
  { value: "pt-BR", lang: "pt-BR", label: "Português (Brasil)" },
  { value: "pt-PT", lang: "pt-PT", label: "Português (Portugal)" },
  { value: "sv", lang: "sv", label: "Svenska" },
  { value: "nb", lang: "nb", label: "Norsk (bokmål)" },
  { value: "ro", lang: "ro", label: "Română" },
  { value: "hu", lang: "hu", label: "Magyar" },
  { value: "lv", lang: "lv", label: "Latviešu" },
  { value: "ru", lang: "ru", label: "Русский" },
  { value: "el", lang: "el", label: "Ελληνικά" },
  { value: "he", lang: "he", label: "עברית" },
  { value: "hi", lang: "hi", label: "हिन्दी" },
  { value: "ar", lang: "ar", label: "العربية" },
  { value: "sq", lang: "sq", label: "Shqip" },
  { value: "sw", lang: "sw", label: "Kiswahili" },
  { value: "zh", lang: "zh", label: "中文" },
  { value: "ja", lang: "ja", label: "日本語" },
  { value: "ko", lang: "ko", label: "한국어" }
];

// RTL_LANGS: the languages written right to left, Hebrew and Arabic. Mirrors
// assets/nt-i18n.js's internal RTL set; the two are tied together by the --api
// assertion that html dir is "rtl" after setLang exactly for these codes and
// absent otherwise.
var RTL_LANGS = ["he", "ar"];

// LANG_CODES: derived from SWITCHER_OPTIONS, in the same order.
// checkDictionaries iterates this instead of a local SUPPORTED list.
var LANG_CODES = SWITCHER_OPTIONS.map(function (o) { return o.value; });

// PLURAL_EXTRA_CATEGORIES: the CLDR plural categories, beyond English's
// {one, other}, that a language's plural dictionary values must carry.
// Deliberately explicit rather than derived from Intl.PluralRules for every
// language: the table lists every language whose CLDR rules select an extra
// category for some whole count (Hebrew adds "two": one, two, other; Arabic adds
// zero, two, few and many: zero, one, two, few, many, other), and
// each entry must equal Intl.PluralRules' own category set for that language. fr/es/it/pt-BR/pt-PT stay unlisted
// because their "many" category applies only to exact multiples of
// 1,000,000; their values stay {one, other} and the engine falls back to
// other for that case. Hindi (hi) is unlisted too: it uses English's
// {one, other} set, although its one also covers 0 and 0.5 (CLDR "i = 0 or
// n = 1"), so a Hindi one form must read correctly for 0 as well as 1.
// Albanian (sq) and Swahili (sw) are unlisted as well: they use English's
// {one, other} set, where 0 and fractions select other (unlike Hindi's one).
// Chinese, Japanese and Korean have the single category other and are listed in
// PLURAL_OTHER_ONLY_LANGS instead: their plural values are { other } alone.
var PLURAL_EXTRA_CATEGORIES = { pl: ["few", "many"], ro: ["few"], lv: ["zero"], ru: ["few", "many"], he: ["two"], ar: ["zero", "two", "few", "many"] };

// PLURAL_OTHER_ONLY_LANGS: the languages whose CLDR rules have the single
// category other (Chinese, Japanese, Korean: no grammatical number). Their
// plural dictionary values are { other } alone, and that one form must read
// correctly for every count (0, 1 and any other).
var PLURAL_OTHER_ONLY_LANGS = ["zh", "ja", "ko"];

// expectedPluralCategories(lang): sorted {one, other} plus that language's
// extras — e.g. few,many,one,other for pl and ru, few,one,other for ro,
// one,other,zero for lv, one,other,two for he, few,many,one,other,two,zero for ar,
// other for zh, ja and ko, one,other for every other language.
function expectedPluralCategories(lang) {
  if (PLURAL_OTHER_ONLY_LANGS.indexOf(lang) !== -1) return ["other"];
  var extra = PLURAL_EXTRA_CATEGORIES[lang] || [];
  return ["one", "other"].concat(extra).sort();
}

/* ---------- page table ---------- */

var PAGES = [
  { file: "index.html", dataFile: "assets/i18n/hub.js", ns: "hub", slug: "index" },
  { file: "Sieve Of Eratosthenes/sieve-of-eratosthenes.html", dataFile: "assets/i18n/sieve-of-eratosthenes.js", ns: "sieve", slug: "sieve-of-eratosthenes" },
  { file: "Factor Tree/factor-tree.html", dataFile: "assets/i18n/factor-tree.js", ns: "factorTree", slug: "factor-tree" },
  { file: "Venn Diagram/venn-diagram.html", dataFile: "assets/i18n/venn-diagram.js", ns: "venn", slug: "venn-diagram" },
  { file: "Euclidean Algorithm/euclidean-algorithm.html", dataFile: "assets/i18n/euclidean-algorithm.js", ns: "euclid", slug: "euclidean-algorithm" },
  { file: "Chinese Remainder Theorem/chinese-remainder-theorem.html", dataFile: "assets/i18n/chinese-remainder-theorem.js", ns: "crt", slug: "chinese-remainder-theorem" },
  { file: "Equivalence Wheel/equivalence-wheel.html", dataFile: "assets/i18n/equivalence-wheel.js", ns: "wheel", slug: "equivalence-wheel" },
  { file: "Eulers Totient/eulers-totient.html", dataFile: "assets/i18n/eulers-totient.js", ns: "totient", slug: "eulers-totient" },
  { file: "Cayley Table/cayley-table.html", dataFile: "assets/i18n/cayley-table.js", ns: "cayley", slug: "cayley-table" },
  { file: "Group Isomorphism/group-isomorphism.html", dataFile: "assets/i18n/group-isomorphism.js", ns: "iso", slug: "group-isomorphism" },
  { file: "Square And Multiply/square-and-multiply.html", dataFile: "assets/i18n/square-and-multiply.js", ns: "sqm", slug: "square-and-multiply" },
  { file: "Diffie-Hellman Key Exchange/diffie-hellman-key-exchange.html", dataFile: "assets/i18n/diffie-hellman-key-exchange.js", ns: "dh", slug: "diffie-hellman-key-exchange" },
  { file: "Elliptic Curve Diffie-Hellman/elliptic-curve-diffie-hellman.html", dataFile: "assets/i18n/elliptic-curve-diffie-hellman.js", ns: "ecdh", slug: "elliptic-curve-diffie-hellman" },
  { file: "RSA/rsa.html", dataFile: "assets/i18n/rsa.js", ns: "rsa", slug: "rsa" },
  { file: "Fermats Method/fermats-method.html", dataFile: "assets/i18n/fermats-method.js", ns: "fermat", slug: "fermats-method" },
  { file: "Shors Algorithm/shors-algorithm.html", dataFile: "assets/i18n/shors-algorithm.js", ns: "shor", slug: "shors-algorithm" }
];

function pageForFile(relPath) {
  var norm = relPath.split(path.sep).join("/");
  for (var i = 0; i < PAGES.length; i++) {
    if (PAGES[i].file === norm || PAGES[i].file === path.relative(ROOT, relPath).split(path.sep).join("/")) return PAGES[i];
  }
  return null;
}

function slugFromPath(relPath) {
  var page = pageForFile(relPath);
  if (page) return page.slug;
  return path.basename(relPath, path.extname(relPath));
}

/* ---------- prose rule ---------- */

// autonymTokens(options): every maximal letter run (Unicode \p{L}+) in each
// option's label, lowercased, plus its diacritic-folded form, de-duplicated
// in first-seen order. Keeps NEUTRAL_TOKENS's switcher-autonym row derived
// from SWITCHER_OPTIONS instead of hand-maintained, so a later language
// needs only its own SWITCHER_OPTIONS entry.
function autonymTokens(options) {
  var seen = {};
  var out = [];
  options.forEach(function (o) {
    var words = o.label.match(/\p{L}+/gu) || [];
    words.forEach(function (w) {
      var lower = w.toLowerCase();
      var folded = lower.normalize("NFD").replace(/\p{M}/gu, "");
      [lower, folded].forEach(function (t) {
        if (!seen[t]) { seen[t] = true; out.push(t); }
      });
    });
  });
  return out;
}

var NEUTRAL_TOKENS = [
  // glossary proper nouns (06-GLOSSARY.md section d)
  "alice", "bob", "eve", "rsa", "diffie", "hellman", "diffie-hellman", "euler", "eulero", "fermat",
  "cayley", "venn", "shor", "euclid", "euclides", "euklid", "euklides", "euclide",
  "eratosthenes", "eratosthène", "eratosthene", "eratóstenes", "eratostenes", "eratostene",
  "bézout", "bezout", "sunzi",
  // math/domain abbreviations
  "mod", "gcd", "lcm", "max", "min", "log", "exp", "sqrt", "phi"
].concat(autonymTokens(SWITCHER_OPTIONS));
var NEUTRAL_SET = {};
NEUTRAL_TOKENS.forEach(function (t) { NEUTRAL_SET[t.toLowerCase()] = true; });

function isAllUpperWord(w) {
  return w === w.toUpperCase() && w !== w.toLowerCase();
}

// isProse(text): a word is a maximal run of Unicode letters (internal
// apostrophe/hyphen allowed); neutral when in NEUTRAL_TOKENS, all-uppercase
// with <=5 letters, or <3 letters; text is prose when it holds at least one
// non-neutral word.
function isProse(text) {
  if (typeof text !== "string") return false;
  var words = text.match(/\p{L}+(?:['’-]\p{L}+)*/gu) || [];
  for (var i = 0; i < words.length; i++) {
    var w = words[i];
    var lower = w.toLowerCase();
    if (NEUTRAL_SET[lower]) continue;
    if (isAllUpperWord(w) && w.length <= 5) continue;
    if (w.length < 3) continue;
    return true;
  }
  return false;
}

/* ---------- script rule (Russian, Greek, Hebrew, Hindi, Arabic, Chinese, Japanese and Korean, the non-Latin scripts) ---------- */

// Russian, Greek, Hebrew, Hindi, Arabic, Chinese, Japanese and Korean cannot be checked for leftover English by
// IDENTICAL-TO-EN alone (a half-translated value is not identical to
// English) or by the Latin-language function-word checks in isProse. This
// data-driven rule catches a value written in the wrong script, a mixed
// script, a word from the OTHER new language, or an untranslated English
// value, while allowing a fixed list of genuine invariant Latin notation.
// A later non-Latin-script language needs only its own SCRIPT_RULES entry.
// Every rule tokenises by script runs (\p{Script=...}), never by whitespace:
// Chinese and Japanese are written without spaces between words, so an English
// leftover can sit glued to Han or kana text.

// SCRIPT_LATIN_NOTATION: every multi-letter Latin token a Cyrillic, Greek,
// Hebrew, Devanagari, Arabic, Han, kana or Hangul value may keep — notation, a code identifier, an acronym, or a narrative
// name present in the English value and kept literal by every existing
// language.
var SCRIPT_LATIN_NOTATION = [
  "AES", "Alice", "BigInt", "Blowfish", "Bob", "CRT", "DH", "DSA", "Eve", "Fibonacci",
  "Fourier", "Garner", "Hasse", "OAEP", "PDF", "PNG", "QFT", "RSA", "SVG", "aB", "aG",
  "bA", "bG", "dP", "dQ", "gcd", "kG", "lcm", "log", "mod", "pointAdd", "qInv", "scalarMul"
];

var SCRIPT_RULES = {
  ru: {
    own: /\p{Script=Cyrillic}/u,
    foreign: /\p{Script=Greek}{2,}|\p{Script=Hebrew}|\p{Script=Devanagari}|\p{Script=Arabic}|\p{Script=Han}|\p{Script=Hiragana}|\p{Script=Katakana}|\p{Script=Hangul}/u,
    latin: SCRIPT_LATIN_NOTATION
  },
  el: {
    own: /\p{Script=Greek}/u,
    foreign: /\p{Script=Cyrillic}|\p{Script=Hebrew}|\p{Script=Devanagari}|\p{Script=Arabic}|\p{Script=Han}|\p{Script=Hiragana}|\p{Script=Katakana}|\p{Script=Hangul}/u,
    latin: SCRIPT_LATIN_NOTATION.concat([
      "Bézout", "Cayley", "Diffie", "ElGamal", "Euler", "Fermat", "Hellman",
      "Miller", "Rabin", "Shor", "Venn", "bit", "ms"
    ])
  },
  // Hebrew: any Cyrillic letter or a run of two or more Greek letters is
  // foreign (a single Greek letter such as phi stays legal, exactly like ru).
  // Eponyms are transliterated into Hebrew script, so the base notation
  // list is reused without el's eponym extension.
  he: {
    own: /\p{Script=Hebrew}/u,
    foreign: /\p{Script=Cyrillic}|\p{Script=Greek}{2,}|\p{Script=Devanagari}|\p{Script=Arabic}|\p{Script=Han}|\p{Script=Hiragana}|\p{Script=Katakana}|\p{Script=Hangul}/u,
    latin: SCRIPT_LATIN_NOTATION
  },
  // Hindi (Devanagari, left to right): own needs a Devanagari LETTER (the
  // lookahead keeps Devanagari digits and signs from counting), any Cyrillic
  // or Hebrew letter or a run of two or more Greek letters is foreign.
  // Eponyms are transliterated into Devanagari, so the base notation list is
  // reused without el's eponym extension.
  hi: {
    own: /(?=\p{L})\p{Script=Devanagari}/u,
    foreign: /\p{Script=Cyrillic}|\p{Script=Hebrew}|\p{Script=Greek}{2,}|\p{Script=Arabic}|\p{Script=Han}|\p{Script=Hiragana}|\p{Script=Katakana}|\p{Script=Hangul}/u,
    latin: SCRIPT_LATIN_NOTATION
  },
  // Arabic (right to left): own needs an Arabic LETTER (the lookahead keeps
  // Arabic-Indic digits and signs from counting), any Cyrillic, Hebrew or
  // Devanagari letter or a run of two or more Greek letters is foreign (a
  // single Greek letter such as phi stays legal, exactly like ru, he and hi).
  // Eponyms are transliterated into Arabic script, so the base notation list
  // is reused without el's eponym extension.
  ar: {
    own: /(?=\p{L})\p{Script=Arabic}/u,
    foreign: /\p{Script=Cyrillic}|\p{Script=Hebrew}|\p{Script=Devanagari}|\p{Script=Greek}{2,}|\p{Script=Han}|\p{Script=Hiragana}|\p{Script=Katakana}|\p{Script=Hangul}/u,
    latin: SCRIPT_LATIN_NOTATION
  },
  // Chinese (Simplified, left to right): own is a Han character. Any
  // Cyrillic, Hebrew, Devanagari, Arabic, Hiragana, Katakana or Hangul letter,
  // a run of two or more Greek letters (a single phi stays legal) and the
  // katakana middle dot and prolonged sound mark (U+30FB, U+30FC: Script=Common,
  // so named explicitly) are foreign. Eponyms are written in Han, so the base
  // notation list is reused.
  zh: {
    own: /\p{Script=Han}/u,
    foreign: /\p{Script=Cyrillic}|\p{Script=Hebrew}|\p{Script=Devanagari}|\p{Script=Arabic}|\p{Script=Hiragana}|\p{Script=Katakana}|\p{Script=Hangul}|\p{Script=Greek}{2,}|[\u30fb\u30fc]/u,
    latin: SCRIPT_LATIN_NOTATION
  },
  // Japanese (left to right): own is a Han, Hiragana or Katakana character
  // (the prolonged sound mark and middle dot are Script=Common and are simply
  // allowed). Cyrillic, Hebrew, Devanagari, Arabic, Hangul or a run of two or
  // more Greek letters is foreign. Simplified-only Han forms are caught
  // separately by cjkFindings (HAN-FORM).
  ja: {
    own: /\p{Script=Han}|\p{Script=Hiragana}|\p{Script=Katakana}/u,
    foreign: /\p{Script=Cyrillic}|\p{Script=Hebrew}|\p{Script=Devanagari}|\p{Script=Arabic}|\p{Script=Hangul}|\p{Script=Greek}{2,}/u,
    latin: SCRIPT_LATIN_NOTATION
  },
  // Korean (left to right): own is a Hangul character. Han (no hanja), kana,
  // the katakana middle dot and prolonged sound mark, Cyrillic, Hebrew,
  // Devanagari, Arabic or a run of two or more Greek letters is foreign.
  ko: {
    own: /\p{Script=Hangul}/u,
    foreign: /\p{Script=Cyrillic}|\p{Script=Hebrew}|\p{Script=Devanagari}|\p{Script=Arabic}|\p{Script=Han}|\p{Script=Hiragana}|\p{Script=Katakana}|\p{Script=Greek}{2,}|[\u30fb\u30fc]/u,
    latin: SCRIPT_LATIN_NOTATION
  }
};

// scriptFindings(id, lang, value, enValue): [] for a language without a
// SCRIPT_RULES entry. Otherwise, with every {placeholder} replaced by a
// space in both value and enValue, returns in order: SCRIPT-LATIN for each
// maximal Latin run (>1 char) not on the language's own latin list,
// SCRIPT-MIXED for each maximal letter run mixing two or more of
// Latin/Cyrillic/Greek/Hebrew/Devanagari/Arabic (the CJK scripts are deliberately
// not counted: Chinese and Japanese are unspaced and Korean attaches particles
// to Latin tokens, so "RSA加密", "RSAの鍵" and "RSA를" are correct text whose
// letter runs mix Latin with a CJK script; SCRIPT-LATIN already finds an English
// leftover inside such text because it extracts Latin runs by script), SCRIPT-FOREIGN for the first match of the
// language's `foreign` pattern, and SCRIPT-MISSING when the English value
// has a translatable Latin word (a run >1 char not on the latin list) but
// the value carries no letter of its own script at all.
function scriptFindings(id, lang, value, enValue) {
  var rule = SCRIPT_RULES[lang];
  if (!rule) return [];
  var findings = [];
  var v = String(value == null ? "" : value).replace(/\{[A-Za-z0-9_]+\}/g, " ");
  var en = String(enValue == null ? "" : enValue).replace(/\{[A-Za-z0-9_]+\}/g, " ");
  var latinSet = {};
  rule.latin.forEach(function (w) { latinSet[w] = true; });

  var latinRuns = v.match(/\p{Script=Latin}+/gu) || [];
  latinRuns.forEach(function (w) {
    if (w.length > 1 && !latinSet[w]) {
      findings.push("SCRIPT-LATIN " + id + "." + lang + ": " + JSON.stringify(w));
    }
  });

  // A word is a run of letters AND combining marks: Devanagari vowel signs and
  // the virama are marks (\p{M}), so \p{L}+ alone would split a Hindi word at
  // every matra and never see a Latin letter glued to one; the run likewise
  // includes Arabic harakat (marks) and tatweel (a modifier letter).
  var letterRuns = v.match(/[\p{L}\p{M}]+/gu) || [];
  letterRuns.forEach(function (w) {
    var hasLatin = /\p{Script=Latin}/u.test(w);
    var hasCyrillic = /\p{Script=Cyrillic}/u.test(w);
    var hasGreek = /\p{Script=Greek}/u.test(w);
    var hasHebrew = /\p{Script=Hebrew}/u.test(w);
    var hasDevanagari = /\p{Script=Devanagari}/u.test(w);
    // Arabic is tested with Script_Extensions: harakat are Script=Inherited and
    // tatweel is Script=Common, both with Script_Extensions Arabic, so the
    // extension property keeps a Latin letter glued through one of them visible.
    var hasArabic = /\p{Script_Extensions=Arabic}/u.test(w);
    var scriptCount = (hasLatin ? 1 : 0) + (hasCyrillic ? 1 : 0) + (hasGreek ? 1 : 0) + (hasHebrew ? 1 : 0) + (hasDevanagari ? 1 : 0) + (hasArabic ? 1 : 0);
    if (scriptCount >= 2) {
      findings.push("SCRIPT-MIXED " + id + "." + lang + ": " + JSON.stringify(w));
    }
  });

  var foreignMatch = v.match(rule.foreign);
  if (foreignMatch) {
    findings.push("SCRIPT-FOREIGN " + id + "." + lang + ": " + JSON.stringify(foreignMatch[0]));
  }

  var enLatinRuns = en.match(/\p{Script=Latin}+/gu) || [];
  var enHasTranslatable = enLatinRuns.some(function (w) { return w.length > 1 && !latinSet[w]; });
  if (enHasTranslatable && !rule.own.test(v)) {
    findings.push("SCRIPT-MISSING " + id + "." + lang);
  }

  return findings;
}

/* ---------- bidi rules (right-to-left languages: Hebrew and Arabic) ---------- */

// RTL_LANGS drives BIDI-FORMULA, so Hebrew and Arabic share one rule. Arabic
// letters are bidi class AL, which turns following European digits into
// Arabic-number type: an unwrapped "48 = 2 x 18 + 12" reverses exactly as in
// Hebrew, and a tight "7-3" reverses too, so the same regex covers both.

// bidiFindings(id, lang, value): an array of findings about Unicode
// bidirectional-control hygiene in one dictionary value.
//   BIDI-CONTROL    the value contains an embedding/override control
//                   (U+202A..U+202E); only isolates (U+2066..U+2069) are used.
//   BIDI-UNBALANCED a U+2069 closes nothing, or an isolate initiator
//                   (U+2066, U+2067, U+2068) is left open.
//   BIDI-FORMULA    (RTL_LANGS only) a numeric formula sits outside any
//                   isolate. A numeric formula inside a right-to-left
//                   paragraph is reordered by the Unicode bidi algorithm
//                   (48 = 2 x 18 + 12 would display reversed) unless it is
//                   wrapped in U+2066 ... U+2069. Checked after removing every
//                   complete isolate span (innermost first, until stable) and
//                   replacing each {placeholder} with 0: a digit, optional
//                   spaces, one operator (= != == < > <= >= + - minus x / dot
//                   * / ^, or the word mod not followed by a letter), optional
//                   spaces, then a digit or an opening parenthesis; or an
//                   opening parenthesis followed by digits, a comma and
//                   another digit (a coordinate or argument tuple).
var BIDI_FORMULA_RE = /\d\s*(?:[=\u2260\u2261\u2262<>\u2264\u2265+\-\u2212\u00d7\u00f7\u00b7*\/^]|mod(?!\p{L}))\s*[\d(]|\(\s*\d+\s*,\s*\d/u;
function bidiFindings(id, lang, value) {
  var findings = [];
  var v = String(value == null ? "" : value);
  if (/[\u202a-\u202e]/.test(v)) findings.push("BIDI-CONTROL " + id + "." + lang);
  var depth = 0, unbalanced = false;
  for (var i = 0; i < v.length; i++) {
    var c = v.charCodeAt(i);
    if (c === 0x2066 || c === 0x2067 || c === 0x2068) depth++;
    else if (c === 0x2069) { if (depth === 0) unbalanced = true; else depth--; }
  }
  if (unbalanced || depth !== 0) findings.push("BIDI-UNBALANCED " + id + "." + lang);
  if (RTL_LANGS.indexOf(lang) !== -1) {
    var rest = v, prev;
    do {
      prev = rest;
      rest = rest.replace(/[\u2066-\u2068][^\u2066-\u2069]*\u2069/g, " ");
    } while (rest !== prev);
    rest = rest.replace(/\{[A-Za-z0-9_]+\}/g, "0");
    var m = BIDI_FORMULA_RE.exec(rest);
    if (m) findings.push("BIDI-FORMULA " + id + "." + lang + ": " + JSON.stringify(m[0]));
  }
  return findings;
}

/* ---------- character hygiene and digit parity (every language / the languages added after the rule) ---------- */

// charFindings(id, lang, value): character-level hygiene for one dictionary
// value in any language.
//   NATIVE-DIGIT  the first decimal digit outside ASCII 0-9 (Devanagari
//                 U+0966..U+096F, Arabic-Indic U+0660..U+0669, Extended
//                 Arabic-Indic U+06F0..U+06F9 or any other native digit):
//                 numerals stay ASCII and locale-independent in every language.
//   NATIVE-SEPARATOR  the first Arabic decimal or thousands separator
//                 (U+066B, U+066C): a numeral keeps its English "." and ",".
//   TASHKEEL      any Arabic vowel mark or superscript alef (U+064B..U+065F,
//                 U+0670): Arabic values are unvocalized, so every word has one
//                 byte form and glossary greps and term unification match.
//   TATWEEL       U+0640 (kashida): a typographic stretch, never part of a word.
//   PRESENTATION-FORM  U+FB50..U+FDFF or U+FE70..U+FEFC: legacy glyph codes that
//                 defeat search; letters are written in their base form.
//   ARABIC-LETTER the first Arabic-script letter outside U+0621..U+063A and
//                 U+0641..U+064A that is not a presentation form: Persian/Urdu
//                 look-alikes (a Persian yeh for yeh, keheh for kaf) are
//                 invisible in review but break searches.
//   FULLWIDTH-FORM  the first character in U+3000..U+303F or U+FF01..U+FFEF
//                 (CJK symbols and punctuation, full-width and half-width forms:
//                 ideographic space, full-width digits, letters and operators,
//                 half-width katakana, wave dash, 〇): the CJK languages keep
//                 digits, Latin letters, operators and spaces in ASCII. For zh
//                 and ja only, the prose punctuation in CJK_PUNCT_ALLOWED is
//                 legal, and for ja also the iteration mark U+3005; Korean uses
//                 Western punctuation and allows none. A full-width digit is
//                 reported by NATIVE-DIGIT as well.
//   ZERO-WIDTH    U+200B..U+200D, U+2060 or U+FEFF: invisible in review, so
//                 a stray joiner or space could never be spotted by eye.
//   NOT-NFC       the value differs from its NFC normalization: NFC keeps a
//                 nukta letter or an Arabic madda/hamza in one byte form, so
//                 glossary greps match.
var CJK_PUNCT_ALLOWED = "\u3001\u3002\u3008\u3009\u300a\u300b\u300c\u300d\u300e\u300f\u3010\u3011\u3014\u3015\uff01\uff08\uff09\uff0c\uff1a\uff1b\uff1f";
function charFindings(id, lang, value) {
  var findings = [];
  var v = String(value == null ? "" : value);
  var native = /(?![0-9])\p{Nd}/u.exec(v);
  if (native) findings.push("NATIVE-DIGIT " + id + "." + lang + ": " + JSON.stringify(native[0]));
  var separator = /[\u066b\u066c]/.exec(v);
  if (separator) findings.push("NATIVE-SEPARATOR " + id + "." + lang + ": " + JSON.stringify(separator[0]));
  if (/[\u064b-\u065f\u0670]/.test(v)) findings.push("TASHKEEL " + id + "." + lang);
  if (/\u0640/.test(v)) findings.push("TATWEEL " + id + "." + lang);
  if (/[\ufb50-\ufdff\ufe70-\ufefc]/.test(v)) findings.push("PRESENTATION-FORM " + id + "." + lang);
  var arabicLetter = /(?![\u0621-\u063a\u0641-\u064a\ufb50-\ufdff\ufe70-\ufefc])(?=\p{L})\p{Script=Arabic}/u.exec(v);
  if (arabicLetter) findings.push("ARABIC-LETTER " + id + "." + lang + ": " + JSON.stringify(arabicLetter[0]));
  var wideRe = /[\u3000-\u303f\uff01-\uffef]/g, wideMatch, wideBad = null;
  while ((wideMatch = wideRe.exec(v))) {
    var wideOk = ((lang === "zh" || lang === "ja") && CJK_PUNCT_ALLOWED.indexOf(wideMatch[0]) !== -1) || (lang === "ja" && wideMatch[0] === "\u3005");
    if (!wideOk) { wideBad = wideMatch[0]; break; }
  }
  if (wideBad) findings.push("FULLWIDTH-FORM " + id + "." + lang + ": " + JSON.stringify(wideBad));
  if (/[\u200b-\u200d\u2060\ufeff]/.test(v)) findings.push("ZERO-WIDTH " + id + "." + lang);
  if (v !== v.normalize("NFC")) findings.push("NOT-NFC " + id + "." + lang);
  return findings;
}

// DIGIT_PARITY_LANGS: the languages whose values must carry exactly their
// English value's numerals. Languages added before this rule keep a few
// legitimate rewordings (a numeral written as a word, Russian's 16,8), which
// is why the list holds only the languages added after the rule existed
// (Hindi, Arabic, Albanian, Swahili, Chinese, Japanese and Korean).
var DIGIT_PARITY_LANGS = ["hi", "ar", "sq", "sw", "zh", "ja", "ko"];

// digitParityFindings(id, lang, value, enValue): [] for a language outside
// DIGIT_PARITY_LANGS. Otherwise, with every {placeholder} replaced by a space
// in both strings, compares the sorted lists of numeral tokens (a maximal run
// of digits with an internal "." or "," between digits) and reports
// DIGIT-PARITY when they differ. The token includes its separators so a
// localized decimal (16,8) or lakh/crore grouping (12,34,567) is caught.
function digitParityFindings(id, lang, value, enValue) {
  if (DIGIT_PARITY_LANGS.indexOf(lang) === -1) return [];
  var tokens = function (s) {
    return (String(s == null ? "" : s).replace(/\{[A-Za-z0-9_]+\}/g, " ").match(/[0-9]+(?:[.,][0-9]+)*/g) || []).sort();
  };
  var got = tokens(value), want = tokens(enValue);
  if (got.join("|") === want.join("|")) return [];
  return ["DIGIT-PARITY " + id + "." + lang + ": en [" + want.join(", ") + "] vs [" + got.join(", ") + "]"];
}

// CJK_LANGS: the three CJK languages (left to right, system fallback font,
// no plural inflection) that cjkFindings checks.
var CJK_LANGS = ["zh", "ja", "ko"];

// HAN_FORM_FORBIDDEN: the Han characters most likely to slip in from the wrong
// standard. zh lists Traditional forms and Japanese shinjitai whose Simplified
// form differs; ja lists Simplified-only forms whose shinjitai differs.
// Characters shared by both standards (数 点 会 来 与 余 将 学 里 欧 号 条 当) are
// deliberately absent. Korean has no entry (no hanja at all: SCRIPT-FOREIGN).
var HAN_FORM_FORBIDDEN = {
  zh: "們這個時對說為進設計鑰碼圖樹質無從選擇顯輸結鍵實現點擊開關變層類單給經錯誤運發應構換環輪線圓題頁兩幾費際間門問認識證書長東車見觀規則數與會來號條歐餘裡後図実関発対説択単変経歩剰円両応証読転続検",
  ja: "们这个时对说为进设计钥码图树质无从选择显输结键实现击开关变层类单给经错误运剩发乘应构换环轮线圆题页步两几费际间门问认识证书长东车见观规则么吗"
};

// cjkFindings(id, lang, value, enValue): [] outside CJK_LANGS. Otherwise, in order:
//   FULLWIDTH-FORMULA  a full-width comma, colon or semicolon (U+FF0C, U+FF1A,
//                      U+FF1B) between two ASCII digits (a ratio, a tuple, a
//                      list of numbers), or a full-width parenthesis pair
//                      whose content holds no Han, kana or Hangul letter (a
//                      formula, tuple or Latin-only parenthetical): those keep
//                      ASCII punctuation and ASCII parentheses.
//   CJK-MYRIAD         an ASCII digit followed (optional whitespace) by one of
//                      十 百 千 万 萬 亿 億 兆 십 백 천 만 억 조: numerals are never
//                      regrouped by myriad, unless the English value has a digit,
//                      whitespace and million, billion or trillion (the scale
//                      word 1 trillion is 1 万亿, 1兆 and 1조).
//   HAN-FORM           the first character of the value found in
//                      HAN_FORM_FORBIDDEN[lang] (zh and ja only): a Traditional
//                      or shinjitai form in Chinese, a Simplified-only form in
//                      Japanese.
function cjkFindings(id, lang, value, enValue) {
  if (CJK_LANGS.indexOf(lang) === -1) return [];
  var findings = [];
  var v = String(value == null ? "" : value);
  var en = String(enValue == null ? "" : enValue);
  var tag = id + "." + lang;
  var tuple = /[0-9]\s*[\uff0c\uff1a\uff1b]\s*[0-9]/.exec(v);
  if (tuple) findings.push("FULLWIDTH-FORMULA " + tag + ": " + JSON.stringify(tuple[0]));
  var parenRe = /\uff08([^\uff08\uff09]*)\uff09/g, pm;
  while ((pm = parenRe.exec(v))) {
    if (!/[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}]/u.test(pm[1])) {
      findings.push("FULLWIDTH-FORMULA " + tag + ": " + JSON.stringify(pm[0]));
    }
  }
  var myriad = /[0-9]\s*[十百千万萬亿億兆십백천만억조]/.exec(v);
  if (myriad && !/[0-9]\s+(?:million|billion|trillion)/.test(en)) {
    findings.push("CJK-MYRIAD " + tag + ": " + JSON.stringify(myriad[0]));
  }
  var forbidden = HAN_FORM_FORBIDDEN[lang];
  if (forbidden) {
    for (var i = 0; i < v.length; i++) {
      if (forbidden.indexOf(v[i]) !== -1) {
        findings.push("HAN-FORM " + tag + ": " + JSON.stringify(v[i]));
        break;
      }
    }
  }
  return findings;
}

/* ---------- per-page config (allowSame/allowLiteral/allowRenderText/...) ---------- */

function readConfig(slug) {
  var p = path.join(ROOT, ".planning", "phases", "06-multi-language-support", "i18n-config", slug + ".json");
  var cfg = {};
  if (fs.existsSync(p)) {
    try { cfg = JSON.parse(fs.readFileSync(p, "utf8")); } catch (e) { cfg = {}; }
  }
  cfg.allowSame = cfg.allowSame || {};
  cfg.allowLiteral = cfg.allowLiteral || {};
  cfg.allowRenderText = cfg.allowRenderText || {};
  cfg.volatile = cfg.volatile || [];
  cfg.enParityExceptions = cfg.enParityExceptions || [];
  cfg.switchPoints = cfg.switchPoints || [];
  cfg.runs = cfg.runs || null;
  return cfg;
}

// SITE_ALLOW_SAME: IDENTICAL-TO-EN exemptions for the shared site/common
// namespaces (page namespaces use their own page config's allowSame
// instead). Empty unless a reasoned entry is genuinely needed.
var SITE_ALLOW_SAME = {};

/* ---------- tolerant HTML tokenizer / tree ---------- */

var VOID_ELEMENTS = { area: 1, base: 1, br: 1, col: 1, embed: 1, hr: 1, img: 1, input: 1, link: 1, meta: 1, param: 1, source: 1, track: 1, wbr: 1 };
var RAWTEXT_ELEMENTS = { script: 1, style: 1 };

function decodeEntities(s) {
  return s
    .replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, " ").replace(/&amp;/g, "&");
}

function parseAttrs(attrStr) {
  var attrs = {};
  var re = /([a-zA-Z_:][-a-zA-Z0-9_:.]*)\s*(?:=\s*("([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;
  var m;
  while ((m = re.exec(attrStr))) {
    var name = m[1].toLowerCase();
    var val = m[3] !== undefined ? m[3] : (m[4] !== undefined ? m[4] : (m[5] !== undefined ? m[5] : ""));
    attrs[name] = val;
  }
  return attrs;
}

// parseHtml(html): returns a root pseudo-element ({tag:'#root', children})
// whose tree mirrors the document — element nodes {tag, attrs, children,
// parent, line}, text nodes {type:'text', value, line}, comment nodes
// {type:'comment', line}. Tolerant: unmatched close tags pop to the nearest
// matching ancestor; unknown/malformed tags are skipped as text.
function parseHtml(html) {
  var pos = 0, len = html.length, line = 1;
  var root = { tag: "#root", attrs: {}, children: [], parent: null, line: 1 };
  var stack = [root];

  function advance(n) {
    for (var i = 0; i < n; i++) { if (html.charCodeAt(pos + i) === 10) line++; }
    pos += n;
  }
  function top() { return stack[stack.length - 1]; }

  while (pos < len) {
    if (html.charAt(pos) === "<" && html.substr(pos, 4) === "<!--") {
      var end = html.indexOf("-->", pos);
      var commentLine = line;
      if (end === -1) { advance(len - pos); } else { advance(end + 3 - pos); }
      top().children.push({ type: "comment", line: commentLine });
      continue;
    }
    if (html.charAt(pos) === "<" && html.charAt(pos + 1) === "!") {
      // doctype or other bang declaration
      var bangEnd = html.indexOf(">", pos);
      if (bangEnd === -1) bangEnd = len - 1;
      advance(bangEnd + 1 - pos);
      continue;
    }
    if (html.charAt(pos) === "<" && /[a-zA-Z]/.test(html.charAt(pos + 1) || "")) {
      var tagMatch = /^<([a-zA-Z][a-zA-Z0-9-]*)((?:[^>"']|"[^"]*"|'[^']*')*)(\/?)>/.exec(html.slice(pos));
      if (tagMatch) {
        var tagLine = line;
        var tagName = tagMatch[1].toLowerCase();
        var attrs = parseAttrs(tagMatch[2]);
        var selfClose = !!tagMatch[3] || !!VOID_ELEMENTS[tagName];
        advance(tagMatch[0].length);
        var node = { tag: tagName, attrs: attrs, children: [], parent: top(), line: tagLine };
        top().children.push(node);
        if (!selfClose) {
          if (RAWTEXT_ELEMENTS[tagName]) {
            var closeRe = new RegExp("</" + tagName + "\\s*>", "i");
            var rest = html.slice(pos);
            var closeMatch = closeRe.exec(rest);
            var rawEnd = closeMatch ? closeMatch.index : rest.length;
            var rawLine = line;
            var rawText = rest.slice(0, rawEnd);
            advance(rawEnd);
            node.children.push({ type: "text", value: rawText, line: rawLine, raw: true });
            if (closeMatch) advance(closeMatch[0].length);
          } else {
            stack.push(node);
          }
        }
        continue;
      }
    }
    if (html.charAt(pos) === "<" && html.charAt(pos + 1) === "/") {
      var closeMatch2 = /^<\/([a-zA-Z][a-zA-Z0-9-]*)\s*>/.exec(html.slice(pos));
      if (closeMatch2) {
        var closeName = closeMatch2[1].toLowerCase();
        advance(closeMatch2[0].length);
        for (var si = stack.length - 1; si > 0; si--) {
          if (stack[si].tag === closeName) { stack.length = si; break; }
        }
        continue;
      }
    }
    var nextLt = html.indexOf("<", pos + 1);
    if (nextLt === -1) nextLt = len;
    var textLine = line;
    var textVal = html.slice(pos, nextLt);
    advance(textVal.length);
    top().children.push({ type: "text", value: textVal, line: textLine });
  }
  return root;
}

function walkElements(node, fn) {
  (node.children || []).forEach(function (child) {
    if (child.tag) { fn(child); walkElements(child, fn); }
  });
}

/* ---------- --header (+ --switcher-present, site footer) ---------- */

function extractHeaderHtml(html) {
  var m = /<header class="site-header">[\s\S]*?<\/header>/.exec(html);
  return m ? m[0] : null;
}

// extractSiteFooters(html): every non-overlapping <footer class="site-footer">
// start tag through the first following </footer>. Returns [] when none.
function extractSiteFooters(html) {
  var re = /<footer class="site-footer">[\s\S]*?<\/footer>/g;
  var out = [], m;
  while ((m = re.exec(html))) out.push(m[0]);
  return out;
}

// checkNoSiteFooter(relPath, html, findings): quick 261003-nkr moved the
// language switcher back into the header and retired the site footer, so a
// page must carry no <footer class="site-footer"> at all.
function checkNoSiteFooter(relPath, html, findings) {
  var footers = extractSiteFooters(html);
  if (footers.length) {
    findings.push("FOOTER-COUNT " + relPath + ": the site footer is retired (switcher lives in the header), found " + footers.length);
  }
}

function normalizeHeaderHtml(headerHtml, fileDir) {
  var html = headerHtml.replace(/\bhref="([^"]*)"/g, function (whole, href) {
    if (/^[a-z][a-z0-9+.-]*:/i.test(href) || href.charAt(0) === "#" || href === "") return whole;
    var resolved = path.posix.normalize(path.posix.join(fileDir, href));
    return 'href="' + resolved + '"';
  });
  html = html.replace(/\s+is-active\b/g, "");
  html = html.replace(/>\s+</g, "><").replace(/\s+/g, " ").trim();
  return html;
}

function checkSwitcherPresent(relPath, html, findings) {
  var selects = html.match(/<select\b[^>]*id="lang-switch-select"[^>]*>/g) || [];
  if (selects.length !== 1) {
    findings.push("SWITCHER " + relPath + ": expected exactly 1 #lang-switch-select, found " + selects.length);
  } else {
    var block = /<select\b[^>]*id="lang-switch-select"[^>]*>([\s\S]*?)<\/select>/.exec(html);
    var optionsHtml = block ? block[1] : "";
    var expected = SWITCHER_OPTIONS;
    var optRe = /<option value="([a-z]{2}(?:-[A-Z]{2})?)" lang="([a-z]{2}(?:-[A-Z]{2})?)"(?: selected)?>([^<]*)<\/option>/g;
    var found = [], om;
    while ((om = optRe.exec(optionsHtml))) found.push({ value: om[1], lang: om[2], label: om[3] });
    if (found.length !== SWITCHER_OPTIONS.length) {
      findings.push("SWITCHER " + relPath + ": expected " + SWITCHER_OPTIONS.length + " language options, found " + found.length);
    } else {
      expected.forEach(function (exp, i) {
        var got = found[i];
        if (!got || got.value !== exp.value || got.lang !== exp.lang || got.label !== exp.label) {
          findings.push("SWITCHER " + relPath + ": option " + i + " expected " + JSON.stringify(exp) + " got " + JSON.stringify(got));
        }
      });
    }
  }
  var navRefs = html.match(/data-i18n="site\.nav\.[A-Za-z]+"/g) || [];
  if (navRefs.length !== 16) {
    findings.push("SWITCHER " + relPath + ": expected 16 data-i18n=\"site.nav.*\" links, found " + navRefs.length);
  }
  var header = extractHeaderHtml(html);
  if (header === null || !/<select\b[^>]*id="lang-switch-select"/.test(header)) {
    findings.push("SWITCHER-NOT-IN-HEADER " + relPath + ": #lang-switch-select must sit inside <header class=\"site-header\">");
  } else if (header.indexOf('class="lang-switch"') > header.indexOf('class="theme-switch"')) {
    findings.push("SWITCHER-ORDER " + relPath + ": the language switcher must sit immediately left of the theme switch");
  }
}

function checkHeader(targets, opts) {
  opts = opts || {};
  var findings = [];
  var sieveAbs = path.join(ROOT, "Sieve Of Eratosthenes", "sieve-of-eratosthenes.html");
  var sieveHtml = fs.readFileSync(sieveAbs, "utf8");
  var sieveHeader = extractHeaderHtml(sieveHtml);
  var sieveNorm = normalizeHeaderHtml(sieveHeader, "Sieve Of Eratosthenes");

  targets.forEach(function (relPath) {
    var abs = path.isAbsolute(relPath) ? relPath : path.join(ROOT, relPath);
    var html = fs.readFileSync(abs, "utf8");
    var header = extractHeaderHtml(html);
    if (!header) {
      findings.push("HEADER-DRIFT " + relPath + ": no <header class=\"site-header\"> block found");
      return;
    }
    var dir = path.isAbsolute(relPath)
      ? path.dirname(path.relative(ROOT, relPath))
      : path.dirname(relPath);
    var norm = normalizeHeaderHtml(header, dir === "." ? "" : dir);
    if (norm !== sieveNorm) {
      var i = 0, maxLen = Math.min(norm.length, sieveNorm.length);
      while (i < maxLen && norm.charAt(i) === sieveNorm.charAt(i)) i++;
      findings.push("HEADER-DRIFT " + relPath + " at offset " + i + ": " + JSON.stringify(norm.slice(i, i + 80)));
    }
    var aTagRe = /<a\s+href="([^"]+)"\s+class="site-nav-link( is-active)?"[^>]*>/g;
    var activeHrefs = [], am;
    while ((am = aTagRe.exec(header))) { if (am[2]) activeHrefs.push(am[1]); }
    if (activeHrefs.length !== 1) {
      findings.push("ACTIVE-LINK " + relPath + ": expected exactly 1 is-active nav link, found " + activeHrefs.length);
    } else {
      var selfBase = path.basename(relPath);
      var hrefBase = path.basename(activeHrefs[0].split("?")[0].split("#")[0]);
      if (hrefBase !== selfBase) {
        findings.push("ACTIVE-LINK " + relPath + ": is-active href " + activeHrefs[0] + " does not resolve to the page itself (" + selfBase + ")");
      }
    }
    checkNoSiteFooter(relPath, html, findings);
    if (!opts.headerOnly) checkSwitcherPresent(relPath, html, findings);
  });
  return findings;
}

function checkSwitcherPresentMode(targets) {
  var findings = [];
  targets.forEach(function (relPath) {
    var abs = path.isAbsolute(relPath) ? relPath : path.join(ROOT, relPath);
    var html = fs.readFileSync(abs, "utf8");
    checkSwitcherPresent(relPath, html, findings);
  });
  return findings;
}

/* ---------- --includes ---------- */

var CANONICAL_NS_ORDER = ["core", "bigint", "svg", "store", "layout", "i18n", "picker"];

function checkIncludes(targets) {
  var findings = [];
  targets.forEach(function (relPath) {
    var page = pageForFile(relPath);
    var abs = path.isAbsolute(relPath) ? relPath : path.join(ROOT, relPath);
    var html = fs.readFileSync(abs, "utf8");
    var scriptRe = /<script([^>]*)>([\s\S]*?)<\/script>/gi;
    var tags = [], m;
    while ((m = scriptRe.exec(html))) tags.push({ attrs: m[1], index: m.index });
    var srcTags = tags.filter(function (t) { return /\bsrc\s*=/.test(t.attrs); });
    var ntTags = srcTags.filter(function (t) { return /assets\/nt-[a-z0-9]+\.js"/.test(t.attrs); });
    var order = ntTags.map(function (t) { var mm = /assets\/nt-([a-z0-9]+)\.js/.exec(t.attrs); return mm ? mm[1] : null; });
    var positions = order.map(function (ns) { return CANONICAL_NS_ORDER.indexOf(ns); });
    for (var i = 1; i < positions.length; i++) {
      if (positions[i] === -1 || positions[i] < positions[i - 1]) {
        findings.push("INCLUDE-ORDER " + relPath + ": nt-*.js includes not in canonical order (" + order.join(",") + ")");
        break;
      }
    }
    if (order.indexOf("i18n") === -1) {
      findings.push("INCLUDE-MISSING " + relPath + ": assets/nt-i18n.js not included");
    }
    var siteJsTags = srcTags.filter(function (t) { return /assets\/i18n\/site\.js"/.test(t.attrs); });
    if (siteJsTags.length !== 1) {
      findings.push("INCLUDE-MISSING " + relPath + ": assets/i18n/site.js not included exactly once (found " + siteJsTags.length + ")");
    }
    var dataTags = srcTags.filter(function (t) {
      var mm = /src="([^"]*assets\/i18n\/[a-zA-Z-]+\.js)"/.exec(t.attrs);
      return mm && !/\/site\.js$/.test(mm[1]);
    });
    if (dataTags.length !== 1) {
      findings.push("INCLUDE-MISSING " + relPath + ": expected exactly 1 page i18n data file include, found " + dataTags.length);
    } else if (page) {
      var gotSrc = /src="([^"]+)"/.exec(dataTags[0].attrs)[1];
      var expectedBase = path.basename(page.dataFile);
      if (path.basename(gotSrc) !== expectedBase) {
        findings.push("INCLUDE-MISSING " + relPath + ": page data include " + gotSrc + " does not match expected " + expectedBase);
      }
    }
    var i18nTag = ntTags.filter(function (t) { return /nt-i18n\.js/.test(t.attrs); })[0];
    if (i18nTag) {
      if (siteJsTags.length && siteJsTags[0].index < i18nTag.index) {
        findings.push("INCLUDE-ORDER " + relPath + ": assets/i18n/site.js appears before assets/nt-i18n.js");
      }
      if (dataTags.length && dataTags[0].index < i18nTag.index) {
        findings.push("INCLUDE-ORDER " + relPath + ": page i18n data include appears before assets/nt-i18n.js");
      }
    }
    var inlineTags = tags.filter(function (t) { return !/\bsrc\s*=/.test(t.attrs); });
    var toolScript = inlineTags[inlineTags.length - 1];
    if (dataTags.length && toolScript) {
      var between = html.slice(dataTags[0].index, toolScript.index);
      var scriptTagsBetween = (between.match(/<script\b/gi) || []).length;
      // dataTags[0]'s own opening tag is included in `between`; a contiguous,
      // immediately-adjacent run allows any number of further nt-*.js /
      // i18n data <script src> tags here, so just require no OTHER inline
      // (no-src) script sits between the last include and the tool script.
      var nonSrcBetween = (between.match(/<script(?![^>]*\bsrc=)[^>]*>/gi) || []).length;
      if (nonSrcBetween > 0) {
        findings.push("INCLUDE-ORDER " + relPath + ": an inline script sits between the i18n includes and the page's own script");
      }
    }
    srcTags.forEach(function (t) {
      if (/assets\/(nt-[a-z0-9]+|i18n\/[a-zA-Z-]+)\.js"/.test(t.attrs) && /\bdefer\b|\basync\b|type\s*=\s*["']module["']/.test(t.attrs)) {
        findings.push("INCLUDE-DEFERRED " + relPath + ": " + t.attrs.trim());
      }
    });
  });
  return findings;
}

/* ---------- --no-locale-number-format ---------- */

// Scoped to `targets` (the page args) plus the always-shared assets/*.js and
// assets/i18n/*.js infrastructure this phase touches — NOT every tool page
// in the repo. Pre-existing toLocale*String/Intl. usage in an unrelated
// tool page outside `targets` is a pre-existing condition, out of scope for
// a per-page gate run (deviation-rules scope boundary); --all still catches
// every page because resolveTargets() returns the full PAGES list for it.
function checkNoLocaleFormat(targets) {
  var findings = [];
  var files = [];
  (targets || []).forEach(function (relPath) {
    files.push(path.isAbsolute(relPath) ? relPath : relPath);
  });
  var assetsDir = path.join(ROOT, "assets");
  if (fs.existsSync(assetsDir)) {
    fs.readdirSync(assetsDir).filter(function (f) { return /\.js$/.test(f); }).forEach(function (f) { files.push("assets/" + f); });
  }
  var i18nDir = path.join(ROOT, "assets", "i18n");
  if (fs.existsSync(i18nDir)) {
    fs.readdirSync(i18nDir).filter(function (f) { return /\.js$/.test(f); }).forEach(function (f) { files.push("assets/i18n/" + f); });
  }
  files.forEach(function (rel) {
    var abs = path.isAbsolute(rel) ? rel : path.join(ROOT, rel);
    if (!fs.existsSync(abs)) return;
    var src = fs.readFileSync(abs, "utf8");
    var lines = src.split("\n");
    lines.forEach(function (line, idx) {
      if (/toLocale[A-Za-z]*String/.test(line)) {
        findings.push("LOCALE-FORMAT " + rel + ":" + (idx + 1) + " toLocale*String");
      }
      var intlRe = /Intl\.([A-Za-z]+)/g, im;
      while ((im = intlRe.exec(line))) {
        if (im[1] !== "PluralRules") {
          findings.push("LOCALE-FORMAT " + rel + ":" + (idx + 1) + " Intl." + im[1]);
        }
      }
    });
  });
  return findings;
}

/* ---------- --coverage ---------- */

function extractPlaceholders(str) {
  if (typeof str !== "string") return [];
  var re = /\{([A-Za-z0-9_]+)\}/g, m, out = [];
  while ((m = re.exec(str))) { if (out.indexOf(m[1]) === -1) out.push(m[1]); }
  return out;
}

function dataFileNsList(file) {
  var src = fs.readFileSync(file, "utf8");
  var re = /NT\.i18n\.register\(\s*'([a-zA-Z]+)'/g, m, out = [];
  while ((m = re.exec(src))) out.push(m[1]);
  return out;
}

// checkPluralEntry(ns, key, lang, entry, enEntry): the plural-shape,
// empty-value, markup and placeholder checks for one language's plural
// value, generalized over expectedPluralCategories(lang) so a listed
// language's extra forms (pl's and ru's four: one, few, many, other; ro's
// three: one, few, other; lv's three: zero, one, other; he's three: one, two,
// other; ar's six: zero, one, two, few, many, other) are checked
// exactly as strictly as every other language's two (one, other), and the
// single-category languages zh, ja and ko (PLURAL_OTHER_ONLY_LANGS) must carry
// the { other } shape alone.
function checkPluralEntry(ns, key, lang, entry, enEntry) {
  var findings = [];
  var expected = expectedPluralCategories(lang);
  var shapeOk = entry && typeof entry === "object" && Object.keys(entry).sort().join(",") === expected.join(",");
  if (!shapeOk) {
    findings.push("PLURAL-SHAPE " + ns + "." + key + "." + lang + ": expected {" + expected.join(", ") + "}");
    return findings;
  }
  expected.forEach(function (cat) {
    if (entry[cat] === "") findings.push("EMPTY-VALUE " + ns + "." + key + "." + cat + "." + lang);
    if (/<[a-zA-Z/!]/.test(entry[cat])) findings.push("DICT-MARKUP " + ns + "." + key + "." + cat + "." + lang);
  });
  var enPh = extractPlaceholders(enEntry.other);
  var otherPh = extractPlaceholders(entry.other);
  if (enPh.slice().sort().join(",") !== otherPh.slice().sort().join(",")) {
    findings.push("PLACEHOLDERS " + ns + "." + key + "." + lang + ": expected [" + enPh.join(",") + "] got [" + otherPh.join(",") + "]");
  }
  expected.filter(function (cat) { return cat !== "one" && cat !== "other"; }).forEach(function (cat) {
    var ph = extractPlaceholders(entry[cat]);
    if (enPh.slice().sort().join(",") !== ph.slice().sort().join(",")) {
      findings.push("PLACEHOLDERS " + ns + "." + key + "." + cat + "." + lang + ": expected [" + enPh.join(",") + "] got [" + ph.join(",") + "]");
    }
  });
  return findings;
}

// pluralSelectionGaps(lang): calls Intl.PluralRules(lang).select(n) for
// every whole count 0..1000 and reports, once per distinct category seen
// outside expectedPluralCategories(lang) (the first count that produces
// it), a finding naming that category. Covers every LANG_CODES language
// (not just the ones listed in PLURAL_EXTRA_CATEGORIES), so a future
// language whose CLDR rules need an extra category for whole counts
// (Ukrainian would report many and few) fails until it is listed there,
// while the millions-only "many" of fr/es/it/pt-BR/pt-PT (which never
// fires for a whole count in 0..1000) stays unlisted.
function pluralSelectionGaps(lang) {
  var findings = [];
  var rules;
  try {
    rules = new Intl.PluralRules(lang);
  } catch (e) {
    findings.push("PLURAL-CATEGORIES " + lang + ": Intl.PluralRules unavailable");
    return findings;
  }
  var expected = expectedPluralCategories(lang);
  var seen = {};
  for (var n = 0; n <= 1000; n++) {
    var cat = rules.select(n);
    if (expected.indexOf(cat) === -1 && !seen[cat]) {
      seen[cat] = true;
      findings.push("PLURAL-CATEGORIES " + lang + ": Intl.PluralRules selects '" + cat + "' for count " + n + " but the expected set is [" + expected.join(", ") + "]; add it to PLURAL_EXTRA_CATEGORIES");
    }
  }
  return findings;
}

// pluralCategoryFindings(): for each language in PLURAL_EXTRA_CATEGORIES,
// prove it is a real LANG_CODES member and that its expected category set
// matches Intl.PluralRules' own resolvedOptions() exactly — so a listed
// language's category can never be silently omitted or invented. Also runs
// pluralSelectionGaps(lang) for every LANG_CODES language, so the guard
// covers every supported language instead of a hand-maintained list.
function pluralCategoryFindings() {
  var findings = [];
  Object.keys(PLURAL_EXTRA_CATEGORIES).forEach(function (lang) {
    if (LANG_CODES.indexOf(lang) === -1) {
      findings.push("PLURAL-CATEGORIES " + lang + ": not in LANG_CODES");
      return;
    }
    var expected = expectedPluralCategories(lang);
    var intlCats = [];
    try {
      intlCats = new Intl.PluralRules(lang).resolvedOptions().pluralCategories.slice().sort();
    } catch (e) { /* leave intlCats empty — will mismatch and be reported */ }
    if (expected.join(",") !== intlCats.join(",")) {
      findings.push("PLURAL-CATEGORIES " + lang + ": expected [" + expected.join(", ") + "] but Intl.PluralRules reports [" + intlCats.join(", ") + "]");
    }
  });
  PLURAL_OTHER_ONLY_LANGS.forEach(function (lang) {
    if (LANG_CODES.indexOf(lang) === -1) {
      findings.push("PLURAL-CATEGORIES " + lang + ": not in LANG_CODES");
      return;
    }
    if (PLURAL_EXTRA_CATEGORIES[lang]) {
      findings.push("PLURAL-CATEGORIES " + lang + ": listed in both PLURAL_OTHER_ONLY_LANGS and PLURAL_EXTRA_CATEGORIES");
      return;
    }
    var intlCats = [];
    try {
      intlCats = new Intl.PluralRules(lang).resolvedOptions().pluralCategories.slice().sort();
    } catch (e) { /* leave intlCats empty — will mismatch and be reported */ }
    if (intlCats.join(",") !== "other") {
      findings.push("PLURAL-CATEGORIES " + lang + ": expected [other] but Intl.PluralRules reports [" + intlCats.join(", ") + "]");
    }
  });
  LANG_CODES.forEach(function (lang) {
    findings.push.apply(findings, pluralSelectionGaps(lang));
  });
  return findings;
}

function checkDictionaries() {
  var findings = [];
  var catalog = loadCatalog();
  var SUPPORTED = LANG_CODES;

  // DICT-FILE / DUP-NS
  var i18nDir = path.join(ROOT, "assets", "i18n");
  var nsOwners = {};
  if (fs.existsSync(i18nDir)) {
    fs.readdirSync(i18nDir).filter(function (f) { return /\.js$/.test(f); }).forEach(function (file) {
      // BIDI-RAW: a literal invisible bidi character in a data file is
      // invisible in review; it must be written as a \u escape instead.
      var rawBidi = /[\u200e\u200f\u202a-\u202e\u2066-\u2069]/.exec(fs.readFileSync(path.join(i18nDir, file), "utf8"));
      if (rawBidi) {
        findings.push("BIDI-RAW assets/i18n/" + file + ": U+" + ("0000" + rawBidi[0].charCodeAt(0).toString(16).toUpperCase()).slice(-4));
      }
      var nsInFile = dataFileNsList(path.join(i18nDir, file));
      nsInFile.forEach(function (ns) { nsOwners[ns] = nsOwners[ns] || []; nsOwners[ns].push(file); });
      if (file === "site.js") {
        var exp = ["common", "site"];
        if (nsInFile.slice().sort().join(",") !== exp.join(",")) {
          findings.push("DICT-FILE assets/i18n/" + file + ": expected [common, site], registers [" + nsInFile.join(",") + "]");
        }
      } else {
        var pageEntry = PAGES.filter(function (p) { return p.dataFile === "assets/i18n/" + file; })[0];
        if (pageEntry && (nsInFile.length !== 1 || nsInFile[0] !== pageEntry.ns)) {
          findings.push("DICT-FILE assets/i18n/" + file + ": expected [" + pageEntry.ns + "], registers [" + nsInFile.join(",") + "]");
        }
      }
    });
  }
  Object.keys(nsOwners).forEach(function (ns) {
    if (nsOwners[ns].length > 1) findings.push("DUP-NS " + ns + " registered in " + nsOwners[ns].join(", "));
  });

  // per-namespace key-set / placeholder / plural / empty / markup / identical-to-en
  Object.keys(catalog).forEach(function (ns) {
    var nsDict = catalog[ns];
    var enDict = nsDict.en || {};
    var enKeys = Object.keys(enDict).sort();
    SUPPORTED.forEach(function (lang) {
      var langDict = nsDict[lang];
      if (!langDict) { findings.push("LANG-KEYSET " + ns + "." + lang + ": namespace missing this language entirely"); return; }
      var langKeys = Object.keys(langDict).sort();
      if (langKeys.join("|") !== enKeys.join("|")) {
        var missing = enKeys.filter(function (k) { return langKeys.indexOf(k) === -1; });
        var extra = langKeys.filter(function (k) { return enKeys.indexOf(k) === -1; });
        findings.push("LANG-KEYSET " + ns + "." + lang + ": missing=[" + missing.join(",") + "] extra=[" + extra.join(",") + "]");
      }
    });
    var allowSame = (ns === "site" || ns === "common") ? SITE_ALLOW_SAME : readConfig(ns === "hub" ? "index" : slugForNs(ns)).allowSame;
    enKeys.forEach(function (key) {
      var enEntry = enDict[key];
      var enIsPlural = enEntry && typeof enEntry === "object";
      var enPh = enIsPlural ? extractPlaceholders(enEntry.other) : extractPlaceholders(enEntry);
      SUPPORTED.forEach(function (lang) {
        var langDict = nsDict[lang];
        if (!langDict || !(key in langDict)) return; // already reported via LANG-KEYSET
        var entry = langDict[key];
        if (enIsPlural) {
          findings.push.apply(findings, checkPluralEntry(ns, key, lang, entry, enEntry));
          if (entry && typeof entry === "object") {
            Object.keys(entry).forEach(function (cat) {
              findings.push.apply(findings, scriptFindings(ns + "." + key + "." + cat, lang, entry[cat], enEntry.other));
              findings.push.apply(findings, bidiFindings(ns + "." + key + "." + cat, lang, entry[cat]));
              findings.push.apply(findings, charFindings(ns + "." + key + "." + cat, lang, entry[cat]));
              findings.push.apply(findings, digitParityFindings(ns + "." + key + "." + cat, lang, entry[cat], typeof enEntry[cat] === "string" ? enEntry[cat] : enEntry.other));
              findings.push.apply(findings, cjkFindings(ns + "." + key + "." + cat, lang, entry[cat], typeof enEntry[cat] === "string" ? enEntry[cat] : enEntry.other));
            });
          }
        } else {
          if (typeof entry !== "string") { findings.push("PLURAL-SHAPE " + ns + "." + key + "." + lang + ": expected a plain string"); return; }
          if (entry === "") findings.push("EMPTY-VALUE " + ns + "." + key + "." + lang);
          if (/<[a-zA-Z/!]/.test(entry)) findings.push("DICT-MARKUP " + ns + "." + key + "." + lang);
          var ph = extractPlaceholders(entry);
          if (enPh.slice().sort().join(",") !== ph.slice().sort().join(",")) {
            findings.push("PLACEHOLDERS " + ns + "." + key + "." + lang + ": expected [" + enPh.join(",") + "] got [" + ph.join(",") + "]");
          }
          if (lang !== "en" && entry === enEntry && isProse(entry)) {
            var allowKey = ns + "." + key;
            if (!allowSame[allowKey]) findings.push("IDENTICAL-TO-EN " + ns + "." + key + "." + lang);
          }
          findings.push.apply(findings, scriptFindings(ns + "." + key, lang, entry, enEntry));
          findings.push.apply(findings, bidiFindings(ns + "." + key, lang, entry));
          findings.push.apply(findings, charFindings(ns + "." + key, lang, entry));
          findings.push.apply(findings, digitParityFindings(ns + "." + key, lang, entry, enEntry));
          findings.push.apply(findings, cjkFindings(ns + "." + key, lang, entry, enEntry));
        }
      });
    });
  });

  findings.push.apply(findings, pluralCategoryFindings());

  return { findings: findings, catalog: catalog };
}

function slugForNs(ns) {
  var p = PAGES.filter(function (p) { return p.ns === ns; })[0];
  return p ? p.slug : ns;
}

function getInlineScriptText(html) {
  var re = /<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi, m, out = [];
  while ((m = re.exec(html))) out.push(m[1]);
  return out.join("\n");
}

function checkKeyUsage(targets, catalog) {
  var findings = [];
  targets.forEach(function (relPath) {
    var page = pageForFile(relPath);
    var ownNs = page ? page.ns : null;
    var abs = path.isAbsolute(relPath) ? relPath : path.join(ROOT, relPath);
    var html = fs.readFileSync(abs, "utf8");
    var refs = [];
    var attrRe = /data-i18n(?:-title|-aria-label|-placeholder)?="([^"]+)"/g, am;
    while ((am = attrRe.exec(html))) refs.push(am[1]);
    var scriptText = getInlineScriptText(html);
    var allowedNsPattern = ["site", "common"].concat(ownNs ? [ownNs] : []).join("|");
    var litRe = new RegExp("['\"]((?:" + allowedNsPattern + ")\\.[A-Za-z0-9_.]+)['\"]", "g"), lm;
    while ((lm = litRe.exec(scriptText))) refs.push(lm[1]);
    // also catch references to a FOREIGN namespace (any other lowercase-dot
    // identifier pattern) so FOREIGN-NS can be detected from markup refs.
    var foreignAttrNs = {};
    refs.forEach(function (ref) {
      var dot = ref.indexOf(".");
      if (dot === -1) return;
      var ns = ref.slice(0, dot);
      var rest = ref.slice(dot + 1);
      var isPrefix = ref.charAt(ref.length - 1) === ".";
      if (ns !== "site" && ns !== "common" && ns !== ownNs) {
        findings.push("FOREIGN-NS " + relPath + ": " + ref);
        return;
      }
      var enDict = catalog[ns] && catalog[ns].en;
      if (!enDict) { findings.push("MISSING-KEY " + relPath + ": " + ref + " (namespace not registered)"); return; }
      var keyToCheck = isPrefix ? rest.slice(0, -1) : rest;
      if (isPrefix) {
        var hasPrefixMatch = Object.keys(enDict).some(function (k) { return k === keyToCheck || k.indexOf(keyToCheck + ".") === 0; });
        if (!hasPrefixMatch) findings.push("MISSING-KEY " + relPath + ": " + ref + " (no key with this prefix)");
      } else if (!(keyToCheck in enDict)) {
        findings.push("MISSING-KEY " + relPath + ": " + ref);
      }
    });
  });
  return findings;
}

function doCoverage(targets) {
  var dictResult = checkDictionaries();
  var findings = dictResult.findings.concat(checkKeyUsage(targets, dictResult.catalog));
  return findings;
}

/* ---------- --literals-markup / --literals-js ---------- */

function checkLiteralsMarkup(targets) {
  var findings = [];
  targets.forEach(function (relPath) {
    var slug = slugFromPath(path.isAbsolute(relPath) ? path.basename(path.dirname(relPath)) + "/" + path.basename(relPath) : relPath);
    var cfg = readConfig(slug);
    var abs = path.isAbsolute(relPath) ? relPath : path.join(ROOT, relPath);
    var html = fs.readFileSync(abs, "utf8");
    var root = parseHtml(html);

    function ancestorIsSwitcherSelect(node) {
      var cur = node;
      while (cur) { if (cur.attrs && cur.attrs.id === "lang-switch-select") return true; cur = cur.parent; }
      return false;
    }
    function ancestorAriaHiddenTrue(node) {
      var cur = node;
      while (cur) { if (cur.attrs && cur.attrs["aria-hidden"] === "true") return true; cur = cur.parent; }
      return false;
    }

    function walk(node) {
      (node.children || []).forEach(function (child) {
        if (child.type === "comment") return;
        if (child.type === "text") {
          if (node.tag === "script" || node.tag === "style") return;
          var text = decodeEntities(child.value).trim();
          if (!text) return;
          if (!isProse(text)) return;
          if (ancestorIsSwitcherSelect(node)) return;
          if (ancestorAriaHiddenTrue(node) && !isProse(text)) return; // neutral-only exemption (redundant: isProse already true here)
          if (node.attrs && Object.prototype.hasOwnProperty.call(node.attrs, "data-i18n")) return;
          if (cfg.allowLiteral[text]) return;
          findings.push("UNTRANSLATED-MARKUP " + relPath + ":" + child.line + " " + JSON.stringify(text));
        } else if (child.tag) {
          walk(child);
        }
      });
    }
    walk(root);

    function walkAttrs(node) {
      ["title", "aria-label", "placeholder"].forEach(function (attr) {
        var val = node.attrs && node.attrs[attr];
        if (val && isProse(val)) {
          var twin = "data-i18n-" + attr;
          if (!node.attrs[twin] && !cfg.allowLiteral[val]) {
            findings.push("UNTRANSLATED-ATTR " + relPath + ":" + node.line + " " + attr + "=" + JSON.stringify(val));
          }
        }
      });
      (node.children || []).forEach(function (c) { if (c.tag) walkAttrs(c); });
    }
    walkAttrs(root);
  });
  return findings;
}

// Strips // and /* */ comments from JS while preserving string/template
// contents and line structure (newlines kept so offsets stay meaningful).
function stripJsComments(src) {
  var out = "", i = 0, n = src.length;
  while (i < n) {
    var c = src[i], c2 = src[i + 1];
    if (c === "/" && c2 === "/") { while (i < n && src[i] !== "\n") i++; continue; }
    if (c === "/" && c2 === "*") { i += 2; while (i < n && !(src[i] === "*" && src[i + 1] === "/")) { if (src[i] === "\n") out += "\n"; i++; } i += 2; continue; }
    if (c === '"' || c === "'" || c === "`") {
      var quote = c; out += c; i++;
      while (i < n && src[i] !== quote) {
        if (src[i] === "\\") { out += src[i] + (src[i + 1] || ""); i += 2; continue; }
        out += src[i]; i++;
      }
      if (i < n) { out += src[i]; i++; }
      continue;
    }
    out += c; i++;
  }
  return out;
}

// Includes the `$ = (id) => document.getElementById(id)` alias convention
// used across this codebase's tool pages (incl. the Sieve), AND a direct
// `document.getElementById(...)` / `el.querySelector(...)` call (used
// verbatim by several tool pages, e.g. Factor Tree) — the lookback classes
// below deliberately do NOT exclude "." before the function name, so a
// preceding object/member-access dot (document., el.) does not block the
// match; only an actual identifier character immediately before the name
// (which would make it part of a longer identifier) does.
var TRANSLATE_CALL_RE = /(?:^|[^A-Za-z0-9_$])(translate|translateInto|bindText)\s*\(\s*(?:[A-Za-z0-9_$]+\s*\?\s*)?$/;
var DOM_API_CALL_RE = /(?:^|[^A-Za-z0-9_$])(\$|getElementById|querySelector|querySelectorAll|createElement|createElementNS|svgEl|addEventListener|setAttribute|getAttribute|removeAttribute|classList\.add|classList\.remove|classList\.toggle|classList\.contains|localStorage\.getItem|localStorage\.setItem|setProperty)\s*\([^)]*$/;
// A string immediately preceded by a comparison operator is being tested
// against (a key name, theme value, event type), not displayed.
var COMPARISON_RE = /[=!]==?\s*$/;

function looksLikeCode(str) {
  if (/var\(--|:\/\/|=>/.test(str)) return true;
  if (/^[#.-]{1,2}[a-zA-Z]/.test(str)) return true; // CSS selector or custom-property name (--foo)
  if (/^[a-z][a-z-]*\s*:\s*[^;]+;?$/.test(str)) return true; // CSS declaration
  // "all-lowercase space/hyphen-separated tokens" (06-02-PLAN.md P10 --literals-js
  // spec): internal identifiers such as CSS class names, event-type tags,
  // DOM id strings, attribute names — never translated prose. Both a leading
  // AND a trailing run of whitespace are allowed (zero-width to several
  // spaces/newlines): this codebase's SVG rendering code concatenates a
  // literal CSS class token with a trailing space directly onto a computed
  // suffix (e.g. `'fairy-light '+lightClass`), and a leading space directly
  // onto one (e.g. `wedgeClass += ' is-multi'`).
  if (/^\s*[a-z][a-z]*(?:[\s-][a-z]+)*\s*$/.test(str)) return true;
  // A dotted i18n key reference (ns.key / ns.sub.key), wherever it sits in
  // the expression (e.g. inside a ternary passed to translate()).
  if (/^[a-z][a-zA-Z0-9]*(\.[A-Za-z0-9_]+)+$/.test(str)) return true;
  // A string ending in an unmatched "(" is the opening fragment of a
  // function-call-shaped expression built via concatenation (SVG/CSS
  // transform or paint functions: 'rotate(' + deg + ')', 'rgb(' + r + ...),
  // never displayed prose.
  if (/[A-Za-z]\($/.test(str)) return true;
  // A MIME-type literal ("image/png", "image/svg+xml;charset=utf-8") —
  // type/subtype shape, optionally with +suffix or ;param=value segments —
  // used as a Blob/data-URI type argument, never displayed prose.
  if (/^[a-z0-9.+-]+\/[a-z0-9.+-]+(;[a-z0-9.+-]+=[a-z0-9.+-]+)*$/i.test(str)) return true;
  // A URI-scheme-prefixed literal ("data:image/svg+xml;charset=utf-8,",
  // "mailto:...") — a short all-letter/digit scheme token immediately
  // followed by ":" with no space right after it (a real prose sentence
  // never has a bare word immediately followed by ":" then non-whitespace).
  if (/^[a-z][a-z0-9+.-]{1,15}:[^\s]/.test(str)) return true;
  // An XML/SVG declaration or markup prolog built as a literal string
  // (`'<?xml version="1.0" ...?>'`), never displayed prose.
  if (/^<\?xml[\s>]/.test(str)) return true;
  // A CSS media-feature query passed to matchMedia ("(prefers-color-scheme:
  // light)"), never displayed prose.
  if (/^\([a-z-]+:\s*[a-z0-9-]+\)$/.test(str)) return true;
  return false;
}

function checkLiteralsJs(targets) {
  var findings = [];
  targets.forEach(function (relPath) {
    var slug = slugFromPath(relPath);
    var cfg = readConfig(slug);
    var abs = path.isAbsolute(relPath) ? relPath : path.join(ROOT, relPath);
    var html = fs.readFileSync(abs, "utf8");
    var scriptText = getInlineScriptText(html);
    var stripped = stripJsComments(scriptText);

    var strRe = /'((?:[^'\\]|\\.)*)'|"((?:[^"\\]|\\.)*)"/g, m;
    while ((m = strRe.exec(stripped))) {
      var str = m[1] !== undefined ? m[1] : m[2];
      if (!isProse(str)) continue;
      if (looksLikeCode(str)) continue;
      var before = stripped.slice(Math.max(0, m.index - 60), m.index);
      if (TRANSLATE_CALL_RE.test(before)) continue;
      if (DOM_API_CALL_RE.test(before)) continue;
      if (COMPARISON_RE.test(before)) continue;
      if (cfg.allowLiteral[str]) continue;
      var lineNo = stripped.slice(0, m.index).split("\n").length;
      findings.push("UNTRANSLATED-JS " + relPath + ":" + lineNo + " " + JSON.stringify(str));
    }

    var ihRe = /\.(innerHTML|outerHTML)\s*=|insertAdjacentHTML\s*\(/g, im;
    while ((im = ihRe.exec(stripped))) {
      var depth = 0, j = im.index + im[0].length, end = stripped.length;
      for (; j < stripped.length; j++) {
        var ch = stripped[j];
        if (ch === "(" || ch === "[" || ch === "{") depth++;
        else if (ch === ")" || ch === "]" || ch === "}") { if (depth === 0) { end = j; break; } depth--; }
        else if (ch === ";" && depth === 0) { end = j; break; }
      }
      var seg = stripped.slice(im.index, end);
      var hasTranslateCall = /\b(translate|translateInto|bindText)\s*\(/.test(seg);
      var hasProseLiteral = false;
      var segStrRe = /'((?:[^'\\]|\\.)*)'|"((?:[^"\\]|\\.)*)"/g, sm;
      while ((sm = segStrRe.exec(seg))) {
        var s2 = sm[1] !== undefined ? sm[1] : sm[2];
        if (isProse(s2) && !looksLikeCode(s2)) { hasProseLiteral = true; break; }
      }
      if (hasTranslateCall || hasProseLiteral) {
        var lineNo2 = stripped.slice(0, im.index).split("\n").length;
        findings.push("INNERHTML-PROSE " + relPath + ":" + lineNo2);
      }
    }
  });
  return findings;
}

/* ---------- mode dispatch + CLI ---------- */

var MODE_RUNNERS = {
  "--coverage": doCoverage,
  "--header": function (t) { return checkHeader(t); },
  "--switcher-present": checkSwitcherPresentMode,
  "--includes": checkIncludes,
  "--no-locale-number-format": checkNoLocaleFormat,
  "--literals-markup": checkLiteralsMarkup,
  "--literals-js": checkLiteralsJs
};

function resolveTargets(fileArgs, allFlag) {
  if (allFlag) return PAGES.map(function (p) { return p.file; });
  if (fileArgs.length) return fileArgs;
  return PAGES.map(function (p) { return p.file; });
}

function checkNotConverted(targets) {
  var findings = [];
  targets.forEach(function (relPath) {
    var abs = path.isAbsolute(relPath) ? relPath : path.join(ROOT, relPath);
    if (!fs.existsSync(abs)) return;
    var html = fs.readFileSync(abs, "utf8");
    if (!/assets\/nt-i18n\.js/.test(html)) {
      findings.push("NOT-CONVERTED " + relPath);
    }
  });
  return findings;
}

function runStaticModes(modeNames, targets, reportMode) {
  var anyFail = false;
  var allFindings = [];
  modeNames.forEach(function (modeName) {
    var runner = MODE_RUNNERS[modeName];
    var modeFindings;
    if (modeName === "--literals-markup" || modeName === "--literals-js") {
      // --literals = both; run as part of the composite below instead.
      modeFindings = runner(targets);
    } else if (modeName === "--not-converted") {
      modeFindings = checkNotConverted(targets);
    } else {
      modeFindings = runner(targets);
    }
    allFindings = allFindings.concat(modeFindings);
    var label = modeName.replace(/^--/, "");
    if (modeFindings.length) {
      anyFail = true;
      if (!reportMode) modeFindings.forEach(function (f) { console.log(f); });
    }
    if (!reportMode) {
      if (modeFindings.length === 0) console.log("I18N-CHECK PASS " + label + ": " + targets.length + " page(s)");
      else console.log("I18N-CHECK FAIL " + label + ": " + modeFindings.length + " finding(s)");
    }
  });
  return { anyFail: anyFail, findings: allFindings };
}

function doStatic(args) {
  var reportMode = args.indexOf("--report") !== -1;
  var allFlag = args.indexOf("--all") !== -1;
  var knownFlags = ["--coverage", "--literals", "--literals-markup", "--literals-js", "--header", "--switcher-present", "--includes", "--no-locale-number-format", "--all", "--report"];
  var requestedModes = args.filter(function (a) { return knownFlags.indexOf(a) !== -1 && a !== "--all" && a !== "--report"; });
  var fileArgs = args.filter(function (a) { return a.indexOf("--") !== 0; });
  var targets = resolveTargets(fileArgs, allFlag);

  var modesToRun;
  if (requestedModes.indexOf("--literals") !== -1) {
    modesToRun = requestedModes.filter(function (m) { return m !== "--literals"; }).concat(["--literals-markup", "--literals-js"]);
  } else if (requestedModes.length) {
    modesToRun = requestedModes;
  } else {
    // no mode flag + page arguments (or --all alone): run every static mode
    modesToRun = ["--coverage", "--header", "--includes", "--no-locale-number-format", "--literals-markup", "--literals-js"];
  }
  // de-dup while preserving order
  var seen = {};
  modesToRun = modesToRun.filter(function (m) { if (seen[m]) return false; seen[m] = true; return true; });

  if (allFlag) {
    var notConverted = checkNotConverted(targets);
    if (notConverted.length) {
      notConverted.forEach(function (f) { console.log(f); });
      console.log("I18N-CHECK FAIL not-converted: " + notConverted.length + " finding(s)");
      if (!reportMode) process.exit(1);
    }
  }

  var result = runStaticModes(modesToRun, targets, reportMode);
  if (reportMode) {
    result.findings.forEach(function (f) { console.log(f); });
    console.log("I18N-CHECK REPORT " + result.findings.length + " finding(s)");
    process.exit(0);
  }
  process.exit(result.anyFail ? 1 : 0);
}

/* ---------- entrypoint ---------- */

function main() {
  var args = process.argv.slice(2);
  if (args.indexOf("--smoke") !== -1) { doSmoke(); return; }
  if (args.indexOf("--api") !== -1) { doApi(); return; }
  if (args.indexOf("--persistence") !== -1) { doPersistence(); return; }
  var staticFlags = ["--coverage", "--literals", "--literals-markup", "--literals-js", "--header", "--switcher-present", "--includes", "--no-locale-number-format", "--all", "--report"];
  var hasStaticFlag = args.some(function (a) { return staticFlags.indexOf(a) !== -1; });
  var hasFileArg = args.some(function (a) { return a.indexOf("--") !== 0; });
  if (hasStaticFlag || hasFileArg) { doStatic(args); return; }
  console.log("Usage: node i18n-check.js --smoke | --api | --persistence | [--coverage|--literals|--literals-markup|--literals-js|--header|--switcher-present|--includes|--no-locale-number-format] [--all|<page>...] [--report]");
  process.exit(1);
}

if (require.main === module) {
  main();
}

module.exports = {
  ROOT: ROOT,
  loadCatalog: loadCatalog,
  PAGES: PAGES,
  LANG_CODES: LANG_CODES,
  NEUTRAL_TOKENS: NEUTRAL_TOKENS,
  isProse: isProse,
  readConfig: readConfig,
  parseHtml: parseHtml,
  PLURAL_EXTRA_CATEGORIES: PLURAL_EXTRA_CATEGORIES,
  PLURAL_OTHER_ONLY_LANGS: PLURAL_OTHER_ONLY_LANGS,
  expectedPluralCategories: expectedPluralCategories,
  checkPluralEntry: checkPluralEntry,
  pluralCategoryFindings: pluralCategoryFindings,
  pluralSelectionGaps: pluralSelectionGaps,
  SWITCHER_OPTIONS: SWITCHER_OPTIONS,
  checkSwitcherPresent: checkSwitcherPresent,
  extractSiteFooters: extractSiteFooters,
  checkNoSiteFooter: checkNoSiteFooter,
  RTL_LANGS: RTL_LANGS,
  SCRIPT_RULES: SCRIPT_RULES,
  scriptFindings: scriptFindings,
  bidiFindings: bidiFindings,
  charFindings: charFindings,
  digitParityFindings: digitParityFindings,
  DIGIT_PARITY_LANGS: DIGIT_PARITY_LANGS,
  CJK_LANGS: CJK_LANGS,
  HAN_FORM_FORBIDDEN: HAN_FORM_FORBIDDEN,
  cjkFindings: cjkFindings
};
