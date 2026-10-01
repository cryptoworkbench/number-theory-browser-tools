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

var ROOT = path.resolve(__dirname, "..", "..", "..");

// Task 2 decision (06-01-PLAN.md): option-a — 'site-lang', a raw two-letter
// code, owned entirely by assets/nt-i18n.js. Used only to seed/inspect fake
// storage in this file's own test scenarios; the production constant lives
// in assets/nt-i18n.js as NT.i18n.LANG_STORAGE_KEY.
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
      return cat === "one" ? "one" : "other";
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
  var siteRoot = fs.mkdtempSync(path.join(os.tmpdir(), prefix));
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
  if (ownProfile) profileDir = fs.mkdtempSync(path.join(os.tmpdir(), "p6-smoke-profile-"));
  var args = [
    "--headless=new",
    "--disable-gpu",
    "--no-sandbox",
    "--user-data-dir=" + profileDir,
    "--virtual-time-budget=" + budgetMs,
    "--dump-dom",
    fileUrl
  ];
  var res = cp.spawnSync("google-chrome", args, { encoding: "utf8", maxBuffer: 200 * 1024 * 1024 });
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
  var siteRoot = fs.mkdtempSync(path.join(os.tmpdir(), prefix));
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
  var profileDir = fs.mkdtempSync(path.join(os.tmpdir(), "p6-smoke-cross-profile-"));
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
  check("SUPPORTED_LANGS value", I.SUPPORTED_LANGS.slice().sort(), ["de", "en", "es", "fr", "nl"]);
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
  check("no change event fired for any invalid setLang call", ctx._changeEvents.length, beforeInvalid);

  // setLang: valid transitions across every supported language
  I.SUPPORTED_LANGS.forEach(function (lang) {
    var cnt = ctx._changeEvents.length;
    var prevLang = I.getLang();
    if (lang === prevLang) return;
    check("setLang('" + lang + "') returns true", I.setLang(lang), true);
    check("html lang updated to '" + lang + "'", ctx._doc.documentElement.lang, lang);
    check("getLang() reflects '" + lang + "'", I.getLang(), lang);
    check("exactly one change event for '" + lang + "'", ctx._changeEvents.length, cnt + 1);
    check("re-setting '" + lang + "' returns true with no new event", I.setLang(lang), true);
    check("no duplicate event for re-setting '" + lang + "'", ctx._changeEvents.length, cnt + 1);
  });

  // detectDefaultLang: mutate navigator directly on the live context
  ctx.navigator = { languages: ["de-AT", "en"] };
  check("detectDefaultLang(['de-AT','en']) -> de", I.detectDefaultLang(), "de");
  ctx.navigator = { languages: ["pt-BR"] };
  check("detectDefaultLang(['pt-BR']) -> en (unsupported falls back)", I.detectDefaultLang(), "en");
  ctx.navigator = { languages: ["NL"] };
  check("detectDefaultLang(['NL']) -> nl (case-insensitive)", I.detectDefaultLang(), "nl");
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
    ["de", "fr"].forEach(function (targetLang) {
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
    { opts: {}, want: "en", label: "no channel set -> detected default (navigator en)" }
  ].forEach(function (scenario) {
    var opts = Object.assign({ navigator: { languages: ["en-US", "en"] } }, scenario.opts);
    var ctx = loadI18n(opts);
    check("precedence: " + scenario.label, ctx.NT.i18n.getLang(), scenario.want);
  });

  // Every supported language round-trips through each individual channel.
  ["nl", "en", "de", "fr", "es"].forEach(function (lang) {
    var ctxUrl = loadI18n({ search: "?lang=" + lang, navigator: { languages: ["en-US", "en"] } });
    check("channel url resolves '" + lang + "'", ctxUrl.NT.i18n.getLang(), lang);
    var ctxCookie = loadI18n({ cookie: { initial: lang }, navigator: { languages: ["en-US", "en"] } });
    check("channel cookie resolves '" + lang + "'", ctxCookie.NT.i18n.getLang(), lang);
    var ctxStorage = loadI18n({ storage: { initial: lang }, navigator: { languages: ["en-US", "en"] } });
    check("channel storage resolves '" + lang + "'", ctxStorage.NT.i18n.getLang(), lang);
  });

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

  // An explicit load-time choice IS persisted: localStorage first, then
  // cookie, in the exact theme.js-style attribute string, for every
  // supported language and every winning channel.
  [
    { opts: { search: "?lang=de" }, lang: "de", via: "url" },
    { opts: { cookie: { initial: "fr" } }, lang: "fr", via: "cookie" },
    { opts: { storage: { initial: "es" } }, lang: "es", via: "storage" }
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
  })();

  // lang= is stripped from the address bar after init(), every other
  // parameter and the hash are left intact; a URL with no lang= never
  // calls replaceState at all.
  [
    { search: "?lang=de", pathname: "/x.html", hash: "", calls: 1, want: "/x.html" },
    { search: "?theme=day&lang=de&n=7", pathname: "/x.html", hash: "#k", calls: 1, want: "/x.html?theme=day&n=7#k" },
    { search: "?lang=de&theme=night", pathname: "/y.html", hash: "", calls: 1, want: "/y.html?theme=night" },
    { search: "?n=7", pathname: "/x.html", hash: "", calls: 0, want: null },
    { search: "", pathname: "/x.html", hash: "", calls: 0, want: null }
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

/* ---------- entrypoint ---------- */

function main() {
  var args = process.argv.slice(2);
  if (args.indexOf("--smoke") !== -1) { doSmoke(); return; }
  if (args.indexOf("--api") !== -1) { doApi(); return; }
  if (args.indexOf("--persistence") !== -1) { doPersistence(); return; }
  console.log("Usage: node i18n-check.js --smoke | --api | --persistence");
  process.exit(1);
}

if (require.main === module) {
  main();
}

module.exports = { ROOT: ROOT, loadCatalog: loadCatalog };
