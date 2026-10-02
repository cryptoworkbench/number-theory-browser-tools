#!/usr/bin/env node
/* i18n-browser.js — dev-only headless-Chrome runtime gate suite for
 * Phase 6's multi-language support. Never shipped, never referenced by any
 * .html page. Reuses Phase 7's browser-diff.js (loadConfig, slugify,
 * instrumentHtml) and harness.js (gitLsTree) rather than re-implementing
 * the scratch-site/instrumentation machinery.
 *
 * Usage:
 *   node i18n-browser.js "<page>" [--mode en-parity,langs,switch,layout]
 *   node i18n-browser.js "<page>" --mutant untranslated|stale-switch|en-change|overflow
 *
 * Modes:
 *   en-parity  OLD (pre-nt-i18n BASE) vs NEW with ?lang=en, after stripping
 *              i18n-only artifacts (data-i18n* attrs, the lang-switch
 *              element, lang= query params, the site-lang storage/cookie
 *              entry) from NEW — must be byte-identical.
 *   langs      NEW in every non-English supported language (+ one extra
 *              day-theme run): no errors, correct <html lang>/theme, no
 *              untranslated (English) prose segment surviving in a
 *              non-English run.
 *   switch     at each switchPoint, switching language mid-flight (via the
 *              header select + a change event) must produce the exact same
 *              snapshot as loading directly in that language at that point.
 *   layout     375px viewport per language; no language may overflow more
 *              than English + 8px.
 *
 * --mutant kinds (self-test; exits 0 printing MUTANT-DETECTED only when the
 * targeted mode's own check fails as expected, else MUTANT-SURVIVED + exit 1):
 *   untranslated  -> targets langs       (injects a fixed English sentence)
 *   stale-switch  -> targets switch      (injects text that never re-renders)
 *   en-change     -> targets en-parity   (mutates one English text node)
 *   overflow      -> targets layout      (injects a 2000px-wide block)
 */
"use strict";

var fs = require("fs");
var path = require("path");
var os = require("os");
var vm = require("vm");
var cp = require("child_process");

var ROOT = path.resolve(__dirname, "..", "..", "..");
var P7_DIR = path.join(ROOT, ".planning", "phases", "07-shared-js-module-refactor");
var browserDiff = require(path.join(P7_DIR, "browser-diff.js"));
var harness = require(path.join(P7_DIR, "harness.js"));
var i18nCheck = require(path.join(__dirname, "i18n-check.js"));

// NON_EN_LANGS (Q-04, quick task 261002-c77): every supported language
// except English, derived from i18n-check.js's exported LANG_CODES so this
// file never carries its own separate four/five-language literal. Used by
// doLangs, doSwitch and doLayout's comparison loop.
var NON_EN_LANGS = i18nCheck.LANG_CODES.filter(function (l) { return l !== "en"; });

/* ---------- BASE (parent of the commit that first added assets/nt-i18n.js) ---------- */

function gitRun(args) {
  return cp.execFileSync("git", args, { cwd: ROOT, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
}

var _baseCache = null;
function i18nBase() {
  if (_baseCache) return _baseCache;
  var out = "";
  try { out = gitRun(["log", "--diff-filter=A", "--format=%H", "--", "assets/nt-i18n.js"]); } catch (e) { out = ""; }
  var lines = out.split("\n").map(function (s) { return s.trim(); }).filter(Boolean);
  var sha;
  if (lines.length === 0) {
    sha = gitRun(["rev-parse", "HEAD"]).trim();
  } else {
    var addCommit = lines[lines.length - 1];
    try { sha = gitRun(["rev-parse", addCommit + "^"]).trim(); } catch (e) { sha = addCommit; }
  }
  _baseCache = sha;
  return sha;
}

function gitShowAt(base, relPath) {
  return gitRun(["show", base + ":" + relPath]);
}

/* ---------- scratch-site construction ---------- */

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

function writeOldAssets(base, destAssetsDir) {
  var files = harness.gitLsTree("assets", base);
  files.forEach(function (relFile) {
    var content = gitShowAt(base, relFile);
    var destPath = path.join(destAssetsDir, path.relative("assets", relFile));
    fs.mkdirSync(path.dirname(destPath), { recursive: true });
    fs.writeFileSync(destPath, content);
  });
}

var MUTANT_SCRIPTS = {
  "untranslated": "<script>document.addEventListener('DOMContentLoaded', function(){ var p=document.createElement('p'); p.id='i18n-mutant-untranslated'; p.textContent='This sentence is deliberately left in English for the mutant self-test.'; document.body.appendChild(p); });</script>",
  "stale-switch": "<script>document.addEventListener('DOMContentLoaded', function(){ var p=document.createElement('p'); p.id='i18n-mutant-stale'; p.textContent=(window.NT && NT.i18n) ? NT.i18n.translate('site.brand') : ''; document.body.appendChild(p); });</script>",
  // Generic across every page (not hardcoded to the Sieve's own
  // "sieve.lede" key): mutates the first element on the page that carries
  // ANY data-i18n attribute, which every converted page has at least one
  // of. Previously hardcoded to '[data-i18n="sieve.lede"]' — a selector
  // that matches nothing on any page outside the Sieve, so running this
  // mutant against another page's en-parity always printed
  // MUTANT-SURVIVED (the mutation silently applied to zero elements).
  "en-change": "<script>document.addEventListener('DOMContentLoaded', function(){ var el=document.querySelector('[data-i18n]'); if (el) el.textContent = el.textContent + ' MUTATED'; });</script>",
  "overflow": "<script>document.addEventListener('DOMContentLoaded', function(){ if (document.documentElement.lang !== 'en'){ var d=document.createElement('div'); d.id='i18n-mutant-overflow'; d.style.width='2000px'; d.style.height='1px'; document.body.appendChild(d); } });</script>"
};

function injectCustomMutant(html, mutantKind) {
  var script = mutantKind && MUTANT_SCRIPTS[mutantKind];
  if (!script) return html;
  if (/<\/body>/i.test(html)) return html.replace(/<\/body>/i, script + "</body>");
  return html + script;
}

function buildSiteForRun(prefix, toolRelPath, useOld, runConfig, globalConfig, mutantKind) {
  var siteRoot = harness.mkScratch(prefix);
  var toolDir = path.dirname(toolRelPath);
  var toolFileName = path.basename(toolRelPath);
  var toolAbsDir = path.join(siteRoot, toolDir);
  fs.mkdirSync(toolAbsDir, { recursive: true });
  var toolSrc = useOld ? gitShowAt(i18nBase(), toolRelPath) : fs.readFileSync(path.join(ROOT, toolRelPath), "utf8");
  var instrumented = browserDiff.instrumentHtml(toolSrc, runConfig, globalConfig, false);
  if (!useOld && mutantKind) instrumented = injectCustomMutant(instrumented, mutantKind);
  var toolAbsPath = path.join(toolAbsDir, toolFileName);
  fs.writeFileSync(toolAbsPath, instrumented);
  var assetsDestDir = path.join(siteRoot, "assets");
  if (useOld) { fs.mkdirSync(assetsDestDir, { recursive: true }); writeOldAssets(i18nBase(), assetsDestDir); }
  else { copyDirSync(path.join(ROOT, "assets"), assetsDestDir); }
  return { siteRoot: siteRoot, toolAbsPath: toolAbsPath };
}

function cleanupSite(siteRoot) {
  try { fs.rmSync(siteRoot, { recursive: true, force: true }); } catch (e) { /* best effort */ }
}

/* ---------- Chrome invocation ---------- */

function runChrome(fileUrl, budgetMs, windowSize) {
  var profileDir = harness.mkScratch("i18n-bd-profile-");
  var args = [
    "--headless=new", "--disable-gpu", "--no-sandbox",
    "--user-data-dir=" + profileDir,
    "--virtual-time-budget=" + budgetMs,
    "--window-size=" + (windowSize || "1280,900"),
    "--dump-dom",
    fileUrl
  ];
  var res = cp.spawnSync("google-chrome", args, { encoding: "utf8", maxBuffer: 200 * 1024 * 1024, env: harness.chromeEnv() });
  try { fs.rmSync(profileDir, { recursive: true, force: true }); } catch (e) { /* best effort */ }
  return res.stdout || "";
}

function unescapeHtml(s) {
  return s.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, "&");
}

function extractOutput(domHtml) {
  var m = /<pre id="p7-out"[^>]*>([\s\S]*?)<\/pre>/.exec(domHtml);
  if (!m) return null;
  return unescapeHtml(m[1]);
}

function metaStep(layout) {
  var code = "window.__p7.meta = {lang: document.documentElement.lang, theme: document.documentElement.getAttribute('data-theme')" +
    (layout ? ", scrollWidth: document.documentElement.scrollWidth, clientWidth: document.documentElement.clientWidth" : "") +
    "};";
  return ["js", code];
}

function executeRun(toolRelPath, run, globalConfig, useOld, prefix, mutantKind, windowSize) {
  var site = buildSiteForRun(prefix, toolRelPath, useOld, run, globalConfig, mutantKind);
  var fileUrl = "file://" + site.toolAbsPath + (run.query ? run.query : "");
  var dom = runChrome(fileUrl, globalConfig.budgetMs, windowSize);
  cleanupSite(site.siteRoot);
  var raw = extractOutput(dom);
  if (raw === null) return { error: "NO-OUTPUT" };
  var parsed;
  try { parsed = JSON.parse(raw); } catch (e) { return { error: "NO-OUTPUT" }; }
  if (!parsed.snaps || !parsed.snaps.length) return { error: "NO-SNAPSHOTS", errors: parsed.errors || [] };
  return { snaps: parsed.snaps, errors: parsed.errors || [], meta: parsed.meta || {} };
}

/* ---------- config loading (Phase 7 config + i18n-config, merged) ---------- */

function loadRunConfig(toolRelPath) {
  var slug = browserDiff.slugify(toolRelPath);
  var p7 = browserDiff.loadConfig(toolRelPath);
  var i18nCfg = i18nCheck.readConfig(slug);
  var runs;
  if (i18nCfg.runs && i18nCfg.runs.length) {
    runs = i18nCfg.runs.map(function (r) {
      return { query: r.query || "", preStorage: r.preStorage || null, steps: r.steps || p7.runs[0].steps };
    });
  } else {
    runs = p7.runs;
  }
  return {
    slug: slug,
    runs: runs,
    budgetMs: p7.budgetMs,
    initialWait: p7.initialWait,
    volatile: (p7.volatile || []).concat(i18nCfg.volatile || []),
    switchPoints: i18nCfg.switchPoints || [],
    enParityExceptions: i18nCfg.enParityExceptions || [],
    allowRenderText: i18nCfg.allowRenderText || {}
  };
}

/* ---------- normalization ---------- */

function normalizeForCompare(html) {
  return (html || "").replace(/\s+/g, " ").replace(/\s*</g, "<").replace(/>\s*/g, ">").trim();
}

function firstDiffContext(a, b) {
  var len = Math.max(a.length, b.length);
  var i = 0;
  while (i < len && a[i] === b[i]) i++;
  var start = Math.max(0, i - 60);
  return { old: a.slice(start, i + 60), new: b.slice(start, i + 60) };
}

var _langStorageKeyCache = null;
function getLangStorageKey() {
  if (_langStorageKeyCache) return _langStorageKeyCache;
  var context = {};
  context.window = context;
  vm.createContext(context);
  var src = fs.readFileSync(path.join(ROOT, "assets", "nt-i18n.js"), "utf8");
  vm.runInContext(src, context);
  _langStorageKeyCache = context.NT.i18n.LANG_STORAGE_KEY;
  return _langStorageKeyCache;
}

function stripLangStorage(snap, key) {
  var storage = (snap.storage || []).filter(function (pair) { return pair[0] !== key; });
  var cookie = (snap.cookie || "").split("; ").filter(function (part) { return part.indexOf(key + "=") !== 0; }).join("; ");
  return Object.assign({}, snap, { storage: storage, cookie: cookie });
}

function stripI18nArtifacts(html) {
  var out = html;
  out = out.replace(/\s*data-i18n(?:-title|-aria-label|-placeholder|-params)?="[^"]*"/g, "");
  out = out.replace(/<label class="lang-switch"[^>]*>[\s\S]*?<\/label>/, "");
  // href values are HTML-entity-encoded in the serialized snapshot (& -> &amp;)
  out = out.replace(/href="([^"]*)"/g, function (m, href) {
    var newHref = href
      .replace(/(\?|&amp;|&)lang=[^&"]*(&amp;|&)?/g, function (mm, pre, trailingAmp) { return trailingAmp ? pre : (pre === "?" ? "?" : ""); })
      .replace(/(\?|&amp;|&)$/, "");
    return 'href="' + newHref + '"';
  });
  return out;
}

function applyEnParityExceptions(html, exceptions) {
  (exceptions || []).forEach(function (ex) {
    try { html = html.replace(new RegExp(ex.pattern, "g"), ex.replace); } catch (e) { /* ignore malformed pattern */ }
  });
  return html;
}

function compareSnaps(oldSnaps, newSnaps) {
  if (oldSnaps.length !== newSnaps.length) {
    return { ok: false, msg: "snapshot count mismatch old=" + oldSnaps.length + " new=" + newSnaps.length };
  }
  for (var i = 0; i < oldSnaps.length; i++) {
    var o = oldSnaps[i], n = newSnaps[i];
    var label = o.label || n.label || ("#" + i);
    var oHtml = normalizeForCompare(o.html), nHtml = normalizeForCompare(n.html);
    if (oHtml !== nHtml) return { ok: false, label: label, msg: "html differs", context: firstDiffContext(oHtml, nHtml) };
    if (o.title !== n.title) return { ok: false, label: label, msg: "title differs: " + JSON.stringify(o.title) + " vs " + JSON.stringify(n.title) };
    var os_ = JSON.stringify(o.storage), ns_ = JSON.stringify(n.storage);
    if (os_ !== ns_) return { ok: false, label: label, msg: "storage differs: " + os_ + " vs " + ns_ };
    if (o.cookie !== n.cookie) return { ok: false, label: label, msg: 'cookie differs: "' + o.cookie + '" vs "' + n.cookie + '"' };
  }
  return { ok: true };
}

/* ---------- en-parity ---------- */

function doEnParity(toolRelPath, cfg, mutantKind) {
  var totalSnaps = 0;
  for (var idx = 0; idx < cfg.runs.length; idx++) {
    var run = cfg.runs[idx];
    var runWithMeta = Object.assign({}, run, { steps: run.steps.concat([metaStep(false)]) });
    var oldRes = executeRun(toolRelPath, runWithMeta, cfg, true, "i18n-bd-old" + idx + "-", null, "1280,900");
    if (oldRes.error) { console.log("I18N-BROWSER " + cfg.slug + " en-parity " + oldRes.error + " (OLD)"); return false; }
    var newQuery = run.query ? run.query + "&lang=en" : "?lang=en";
    var newRun = Object.assign({}, run, { query: newQuery, steps: run.steps.concat([metaStep(false)]) });
    var newRes = executeRun(toolRelPath, newRun, cfg, false, "i18n-bd-new" + idx + "-", mutantKind, "1280,900");
    if (newRes.error) { console.log("I18N-BROWSER " + cfg.slug + " en-parity " + newRes.error + " (NEW)"); return false; }
    if (newRes.errors && newRes.errors.length) { console.log("I18N-BROWSER " + cfg.slug + " en-parity NEW-ERRORS " + JSON.stringify(newRes.errors)); return false; }
    var langKey = getLangStorageKey();
    var newSnapsProcessed = newRes.snaps.map(function (s) {
      var strippedHtml = stripI18nArtifacts(s.html);
      strippedHtml = applyEnParityExceptions(strippedHtml, cfg.enParityExceptions);
      var s2 = stripLangStorage(s, langKey);
      return Object.assign({}, s2, { html: strippedHtml });
    });
    var cmp = compareSnaps(oldRes.snaps, newSnapsProcessed);
    if (!cmp.ok) {
      var extra = cmp.context ? (" || OLD: " + cmp.context.old + " || NEW: " + cmp.context.new) : "";
      console.log("I18N-BROWSER " + cfg.slug + " en-parity DIFF at " + cmp.label + ": " + cmp.msg + extra);
      return false;
    }
    totalSnaps += oldRes.snaps.length;
  }
  console.log("I18N-BROWSER " + cfg.slug + " en-parity IDENTICAL snaps=" + totalSnaps);
  return true;
}

/* ---------- langs ---------- */

function decodeEntitiesLocal(s) {
  return s.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&");
}

function extractTextSegments(html, docTitle) {
  var root = i18nCheck.parseHtml(html);
  var segments = [];
  function walk(node) {
    (node.children || []).forEach(function (child) {
      if (child.type === "comment") return;
      if (child.type === "text") {
        if (node.tag === "script" || node.tag === "style") return;
        var text = decodeEntitiesLocal(child.value).trim();
        if (text) segments.push(text);
      } else if (child.tag) {
        ["title", "aria-label", "placeholder"].forEach(function (attr) {
          if (child.attrs && child.attrs[attr]) segments.push(child.attrs[attr]);
        });
        walk(child);
      }
    });
  }
  walk(root);
  if (docTitle) segments.push(docTitle);
  return segments;
}

function doLangs(toolRelPath, cfg, mutantKind) {
  var ok = true;
  var run = cfg.runs[0];
  var runWithMeta = Object.assign({}, run, { steps: run.steps.concat([metaStep(false)]) });

  // The en baseline gets the same mutant (if any) as the xx runs, so an
  // injected node's POSITION lines up between the two arrays — otherwise a
  // mutant-only trailing segment in the xx array has no en counterpart to
  // compare against and the untranslated check never fires (#mutant bug).
  var enRun = Object.assign({}, runWithMeta, { query: run.query ? run.query + "&lang=en" : "?lang=en" });
  var enRes = executeRun(toolRelPath, enRun, cfg, false, "i18n-bd-langs-en-", mutantKind, "1280,900");
  if (enRes.error) { console.log("I18N-BROWSER " + cfg.slug + " langs " + enRes.error + " (en baseline)"); return false; }
  var enSegmentsBySnap = enRes.snaps.map(function (s) { return extractTextSegments(s.html, s.title); });

  var langs = NON_EN_LANGS;
  langs.forEach(function (lang) {
    var q = run.query ? run.query + "&lang=" + lang : "?lang=" + lang;
    var r = Object.assign({}, runWithMeta, { query: q });
    var res = executeRun(toolRelPath, r, cfg, false, "i18n-bd-langs-" + lang + "-", mutantKind, "1280,900");
    if (res.error) { console.log("I18N-BROWSER " + cfg.slug + " langs " + res.error + " (" + lang + ")"); ok = false; return; }
    if (res.errors && res.errors.length) { console.log("I18N-BROWSER " + cfg.slug + " langs NEW-ERRORS " + lang + " " + JSON.stringify(res.errors)); ok = false; return; }
    if (res.meta.lang !== lang) { console.log("I18N-BROWSER " + cfg.slug + " langs " + lang + ": meta.lang=" + res.meta.lang + " expected " + lang); ok = false; }
    if (res.meta.theme !== "night") { console.log("I18N-BROWSER " + cfg.slug + " langs " + lang + ": meta.theme=" + res.meta.theme + " expected night"); ok = false; }
    if (res.snaps.length !== enRes.snaps.length) {
      console.log("I18N-BROWSER " + cfg.slug + " langs " + lang + ": snapshot count " + res.snaps.length + " != english baseline " + enRes.snaps.length);
      ok = false;
      return;
    }
    res.snaps.forEach(function (snap, i) {
      var label = snap.label || enRes.snaps[i].label || ("#" + i);
      var xxSegments = extractTextSegments(snap.html, snap.title);
      var enSegments = enSegmentsBySnap[i];
      var n = Math.max(enSegments.length, xxSegments.length);
      for (var si = 0; si < n; si++) {
        var enSeg = enSegments[si], xxSeg = xxSegments[si];
        if (xxSeg === undefined) continue;
        // A segment made ENTIRELY of the volatile sentinel (one or more repeats,
        // from a page's own volatile regex spanning text content rather than just
        // an attribute value — e.g. a <g class="packet">...</g> animation element
        // whose inner <text> is itself inter-tag text) is never prose: isProse's
        // all-uppercase-<=5-letters rule does not cover the 8-letter "VOLATILE"
        // token, which would otherwise false-positive as UNTRANSLATED on every
        // language (the sentinel is identical in en and xx by construction).
        if (/^(█VOLATILE█)+$/.test(xxSeg)) continue;
        if (!i18nCheck.isProse(xxSeg)) continue;
        if (xxSeg === enSeg) {
          if (cfg.allowRenderText[xxSeg]) continue;
          console.log("UNTRANSLATED " + cfg.slug + " " + lang + " " + label + " " + JSON.stringify(xxSeg));
          ok = false;
        }
      }
    });
  });

  // extra run: first config run with preStorage {site-theme:'day'}
  var dayRun = Object.assign({}, runWithMeta, { preStorage: Object.assign({}, run.preStorage || {}, { "site-theme": "day" }) });
  var dayRes = executeRun(toolRelPath, dayRun, cfg, false, "i18n-bd-langs-day-", null, "1280,900");
  if (dayRes.error) { console.log("I18N-BROWSER " + cfg.slug + " langs " + dayRes.error + " (day-theme run)"); ok = false; }
  else if (dayRes.meta.theme !== "day") { console.log("I18N-BROWSER " + cfg.slug + " langs day-theme run: meta.theme=" + dayRes.meta.theme + " expected day"); ok = false; }

  if (ok) console.log("I18N-BROWSER " + cfg.slug + " langs PASS snaps=" + enRes.snaps.length + " langs=" + langs.length);
  return ok;
}

/* ---------- switch ---------- */

function doSwitch(toolRelPath, cfg, mutantKind) {
  var ok = true;
  var run = cfg.runs[0];
  var labels = run.steps.filter(function (s) { return s[0] === "snap" && s[1]; }).map(function (s) { return s[1]; });
  var switchPoints = (cfg.switchPoints && cfg.switchPoints.length) ? cfg.switchPoints : (labels.length ? [labels[labels.length - 1]] : []);
  if (!switchPoints.length) { console.log("I18N-BROWSER " + cfg.slug + " switch NO-SWITCH-POINTS"); return false; }

  var langs = NON_EN_LANGS;
  switchPoints.forEach(function (point) {
    var idx = -1;
    for (var i = 0; i < run.steps.length; i++) {
      if (run.steps[i][0] === "snap" && run.steps[i][1] === point) { idx = i; break; }
    }
    if (idx === -1) { console.log("I18N-BROWSER " + cfg.slug + " switch MISSING-SNAP " + point); ok = false; return; }
    var truncatedSteps = run.steps.slice(0, idx + 1);

    langs.forEach(function (lang) {
      var switchSteps = truncatedSteps.concat([
        ["js", "(function(){var el=document.getElementById('lang-switch-select'); el.value='" + lang + "'; el.dispatchEvent(new Event('change',{bubbles:true}));})();"],
        ["wait", 300],
        ["snap", "switched"],
        metaStep(false)
      ]);
      var switchRun = Object.assign({}, run, { steps: switchSteps });
      var swRes = executeRun(toolRelPath, switchRun, cfg, false, "i18n-bd-sw-", mutantKind, "1280,900");
      if (swRes.error) { console.log("I18N-BROWSER " + cfg.slug + " switch " + swRes.error + " (" + point + " " + lang + ")"); ok = false; return; }
      if (swRes.errors && swRes.errors.length) { console.log("I18N-BROWSER " + cfg.slug + " switch NEW-ERRORS " + point + " " + lang + " " + JSON.stringify(swRes.errors)); ok = false; return; }

      var directSteps = truncatedSteps.concat([metaStep(false)]);
      var directQuery = run.query ? run.query + "&lang=" + lang : "?lang=" + lang;
      var directRun = Object.assign({}, run, { query: directQuery, steps: directSteps });
      var dRes = executeRun(toolRelPath, directRun, cfg, false, "i18n-bd-direct-", null, "1280,900");
      if (dRes.error) { console.log("I18N-BROWSER " + cfg.slug + " switch " + dRes.error + " (direct " + point + " " + lang + ")"); ok = false; return; }

      var switchedSnap = swRes.snaps[swRes.snaps.length - 1];
      var directSnap = dRes.snaps[dRes.snaps.length - 1];
      if (swRes.meta.lang !== lang) {
        console.log("I18N-BROWSER " + cfg.slug + " switch " + point + " " + lang + ": meta.lang=" + swRes.meta.lang + " expected " + lang);
        ok = false;
      }
      var h1 = normalizeForCompare(directSnap.html), h2 = normalizeForCompare(switchedSnap.html);
      if (h1 !== h2) {
        var ctx = firstDiffContext(h1, h2);
        console.log("I18N-BROWSER " + cfg.slug + " switch DIFF at " + point + " " + lang + ": html differs || DIRECT: " + ctx.old + " || SWITCHED: " + ctx.new);
        ok = false;
      }
      if (directSnap.title !== switchedSnap.title) {
        console.log("I18N-BROWSER " + cfg.slug + " switch DIFF at " + point + " " + lang + ": title differs: " + JSON.stringify(directSnap.title) + " vs " + JSON.stringify(switchedSnap.title));
        ok = false;
      }
    });
  });

  if (ok) console.log("I18N-BROWSER " + cfg.slug + " switch PASS points=" + switchPoints.length + " langs=" + langs.length);
  return ok;
}

/* ---------- layout ---------- */

function doLayout(toolRelPath, cfg, mutantKind) {
  var ok = true;
  var run = cfg.runs[0];
  var loadSteps = [["snap", "load"], metaStep(true)];
  var langs = ["en"].concat(NON_EN_LANGS);
  var overflow = {};

  langs.forEach(function (lang) {
    var q = "?lang=" + lang;
    var r = Object.assign({}, run, { query: q, steps: loadSteps });
    var res = executeRun(toolRelPath, r, cfg, false, "i18n-bd-layout-", mutantKind, "375,812");
    if (res.error) { console.log("I18N-BROWSER " + cfg.slug + " layout " + res.error + " (" + lang + ")"); ok = false; return; }
    overflow[lang] = (res.meta.scrollWidth || 0) - (res.meta.clientWidth || 0);
  });

  var enOverflow = overflow.en || 0;
  NON_EN_LANGS.forEach(function (lang) {
    if (overflow[lang] === undefined) return;
    if (overflow[lang] > enOverflow + 8) {
      console.log("LAYOUT-OVERFLOW " + cfg.slug + " " + lang + " +" + (overflow[lang] - enOverflow) + "px");
      ok = false;
    }
  });

  if (ok) console.log("I18N-BROWSER " + cfg.slug + " layout PASS");
  return ok;
}

/* ---------- CLI ---------- */

var MODE_FN = { "en-parity": doEnParity, "langs": doLangs, "switch": doSwitch, "layout": doLayout };
var MUTANT_TARGET_MODE = { "untranslated": "langs", "stale-switch": "switch", "en-change": "en-parity", "overflow": "layout" };

function main() {
  var argv = process.argv.slice(2);
  var toolRelPath = argv[0];
  if (!toolRelPath) {
    console.error('Usage: node i18n-browser.js "<page>" [--mode en-parity,langs,switch,layout] [--mutant untranslated|stale-switch|en-change|overflow]');
    process.exit(1);
  }
  var modeArg = null, mutantArg = null;
  for (var i = 1; i < argv.length; i++) {
    if (argv[i] === "--mode") modeArg = argv[++i];
    else if (argv[i] === "--mutant") mutantArg = argv[++i];
  }

  if (!fs.existsSync(path.join(ROOT, toolRelPath)) && !path.isAbsolute(toolRelPath)) {
    console.error("I18N-BROWSER FAIL: page not found: " + toolRelPath);
    process.exit(1);
  }

  var cfg = loadRunConfig(toolRelPath);

  if (mutantArg) {
    var targetMode = MUTANT_TARGET_MODE[mutantArg];
    if (!targetMode) {
      console.error("Unknown mutant kind: " + mutantArg + " (expected untranslated|stale-switch|en-change|overflow)");
      process.exit(1);
    }
    var passed = MODE_FN[targetMode](toolRelPath, cfg, mutantArg);
    if (passed) {
      console.log("MUTANT-SURVIVED " + mutantArg);
      process.exit(1);
    } else {
      console.log("MUTANT-DETECTED " + mutantArg);
      process.exit(0);
    }
    return;
  }

  var modes = modeArg ? modeArg.split(",") : ["en-parity", "langs", "switch", "layout"];
  var allOk = true;
  modes.forEach(function (m) {
    var fn = MODE_FN[m];
    if (!fn) { console.error("Unknown mode: " + m); allOk = false; return; }
    var ok = fn(toolRelPath, cfg, null);
    if (!ok) allOk = false;
  });

  if (allOk) {
    if (!modeArg) console.log("I18N-BROWSER " + cfg.slug + " ALL PASS");
    process.exit(0);
  }
  process.exit(1);
}

if (require.main === module) {
  main();
}

module.exports = { loadRunConfig: loadRunConfig, i18nBase: i18nBase, normalizeForCompare: normalizeForCompare };
