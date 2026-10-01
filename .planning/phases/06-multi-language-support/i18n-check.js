#!/usr/bin/env node
/* i18n-check.js — dev-only Node/headless-Chrome validation for Phase 6's
 * multi-language support. Never shipped, never referenced by any .html
 * page. Node built-ins only (fs, path, os, vm, url, child_process).
 *
 * Modes:
 *   --smoke        headless-Chrome end-to-end probe on the Sieve of
 *                   Eratosthenes page (this task). Builds a scratch site,
 *                   opens it at ?lang=fr, asserts the whole pipeline (static
 *                   markup, dynamic banner, link decoration, setLang,
 *                   onLangChange, state preservation), then reruns with one
 *                   deliberately-corrupted expected value to prove the probe
 *                   is not vacuous.
 *   --api          vm-loaded unit suite for assets/nt-i18n.js's exported API
 *                   (arrives in Task 3 of this plan).
 *   --persistence  vm-loaded unit suite for the cookie/localStorage/URL
 *                   persistence behavior (arrives in Task 3 of this plan).
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

/* ---------- common failure helper ---------- */

function failSmoke(reason) {
  console.log("I18N-CHECK FAIL smoke: " + reason);
  process.exit(1);
}

/* ---------- scratch site construction ---------- */

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

function runChrome(fileUrl, budgetMs) {
  var profileDir = fs.mkdtempSync(path.join(os.tmpdir(), "p6-smoke-profile-"));
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
  try { fs.rmSync(profileDir, { recursive: true, force: true }); } catch (e) { /* best effort */ }
  return res.stdout || "";
}

function extractSmokeAttr(domHtml) {
  var m = /data-i18n-smoke="([^"]*)"/.exec(domHtml);
  if (!m) return null;
  return m[1]
    .replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, "&");
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

  if (!navHrefs || navHrefs.length !== 16) {
    throw new Error("buildExpected: expected 16 nav hrefs, extracted " + (navHrefs ? navHrefs.length : 0));
  }

  return { en: en, fr: fr, es: es, rawTemplates: rawTemplates, navHrefs: navHrefs };
}

/* ---------- --smoke ---------- */

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

  console.log("I18N-CHECK PASS smoke: " + realRun.count + " assertions (mutant detected)");
  process.exit(0);
}

/* ---------- entrypoint ---------- */

function main() {
  var args = process.argv.slice(2);
  if (args.indexOf("--smoke") !== -1) { doSmoke(); return; }
  if (args.indexOf("--api") !== -1) {
    console.log("I18N-CHECK FAIL api: not yet implemented (arrives in Task 3 of 06-01-PLAN.md)");
    process.exit(1);
    return;
  }
  if (args.indexOf("--persistence") !== -1) {
    console.log("I18N-CHECK FAIL persistence: not yet implemented (arrives in Task 3 of 06-01-PLAN.md)");
    process.exit(1);
    return;
  }
  console.log("Usage: node i18n-check.js --smoke | --api | --persistence");
  process.exit(1);
}

if (require.main === module) {
  main();
}

module.exports = { ROOT: ROOT, loadCatalog: loadCatalog };
