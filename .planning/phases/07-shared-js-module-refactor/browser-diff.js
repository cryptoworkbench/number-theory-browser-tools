#!/usr/bin/env node
/* browser-diff.js — dev-only headless-Chrome OLD(BASE)-vs-NEW(working tree)
 * differential snapshot oracle for Phase 7. Never shipped, never
 * referenced by any .html page. Requires ./harness.js for
 * ROOT/baseCommit/gitShow.
 *
 * Usage:
 *   node browser-diff.js "<tool rel path>"              normal OLD-vs-NEW diff
 *   node browser-diff.js "<tool rel path>" --stability   OLD-vs-OLD determinism check
 *   node browser-diff.js "<tool rel path>" --mutant      injected-change detection check
 *   node browser-diff.js "<tool rel path>" --assets <dir> NEW uses <dir> instead of
 *                                                          the working-tree assets/
 */
"use strict";

var fs = require("fs");
var path = require("path");
var os = require("os");
var cp = require("child_process");
var harness = require("./harness.js");

var ROOT = harness.ROOT;

/* ---------- config ---------- */

var DEFAULT_STEPS = [
  ["snap", "load"],
  ["clickEach", ".chip", [["click", "#instantBtn", true], ["wait", 400], ["snap"]], "chip"],
  ["clickEach", ".mode-btn, .mode-tab, .view-btn", [["snap"]], "toggle"]
];

function slugify(toolRelPath) {
  return path.basename(toolRelPath, path.extname(toolRelPath));
}

function loadConfig(toolRelPath) {
  var slug = slugify(toolRelPath);
  var cfgPath = path.join(__dirname, "browser-diff", slug + ".json");
  var userCfg = {};
  if (fs.existsSync(cfgPath)) {
    userCfg = JSON.parse(fs.readFileSync(cfgPath, "utf8"));
  }
  var runs;
  if (userCfg.runs && userCfg.runs.length) {
    runs = userCfg.runs.map(function (r) {
      return { query: r.query || "", preStorage: r.preStorage || null, steps: r.steps || DEFAULT_STEPS };
    });
  } else {
    runs = [{ query: "", preStorage: null, steps: DEFAULT_STEPS }];
  }
  return {
    runs: runs,
    budgetMs: userCfg.budgetMs || 30000,
    initialWait: userCfg.initialWait || 800,
    volatile: userCfg.volatile || []
  };
}

/* ---------- site construction ---------- */

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

function writeBaseAssets(base, destAssetsDir) {
  var files = harness.gitLsTree("assets", base); // e.g. "assets/theme.js"
  files.forEach(function (relFile) {
    var content = harness.gitShow(relFile);
    var destPath = path.join(destAssetsDir, path.relative("assets", relFile));
    fs.mkdirSync(path.dirname(destPath), { recursive: true });
    fs.writeFileSync(destPath, content);
  });
}

// Builds a scratch site under harness.mkScratch()'s per-run root. The tool file keeps its own
// directory name one level below the site root so ../assets resolves
// unchanged.
function buildSite(prefix, toolRelPath, useBase, assetsOverrideDir, runConfig, globalConfig, injectMutant) {
  var siteRoot = harness.mkScratch(prefix);
  var toolDir = path.dirname(toolRelPath);
  var toolFileName = path.basename(toolRelPath);
  var toolAbsDir = path.join(siteRoot, toolDir);
  fs.mkdirSync(toolAbsDir, { recursive: true });

  var toolSrc = useBase ? harness.gitShow(toolRelPath) : fs.readFileSync(path.join(ROOT, toolRelPath), "utf8");
  toolSrc = instrumentHtml(toolSrc, runConfig, globalConfig, injectMutant);
  var toolAbsPath = path.join(toolAbsDir, toolFileName);
  fs.writeFileSync(toolAbsPath, toolSrc);

  var assetsDestDir = path.join(siteRoot, "assets");
  if (assetsOverrideDir) {
    copyDirSync(assetsOverrideDir, assetsDestDir);
  } else if (useBase) {
    fs.mkdirSync(assetsDestDir, { recursive: true });
    writeBaseAssets(harness.baseCommit(), assetsDestDir);
  } else {
    copyDirSync(path.join(ROOT, "assets"), assetsDestDir);
  }

  return { siteRoot: siteRoot, toolAbsPath: toolAbsPath };
}

function cleanupSite(siteRoot) {
  try {
    fs.rmSync(siteRoot, { recursive: true, force: true });
  } catch (e) { /* best effort */ }
}

/* ---------- HTML instrumentation ---------- */

var DRIVER_BODY = [
  "function qAll(sel){ try { return Array.prototype.slice.call(document.querySelectorAll(sel)); } catch(e){ return []; } }",
  "function dispatch(el, type){ try { el.dispatchEvent(new Event(type, {bubbles:true})); } catch(e){} }",
  "function missing(sel){ window.__p7.errors.push({type:'step', message:'MISSING-SELECTOR ' + sel}); }",
  "function snapshot(label){",
  "  var bodyClone = document.body.cloneNode(true);",
  "  var outEl = bodyClone.querySelector('#p7-out');",
  "  if (outEl && outEl.parentNode) outEl.parentNode.removeChild(outEl);",
  "  var scripts = bodyClone.querySelectorAll('script');",
  "  Array.prototype.forEach.call(scripts, function(s){ if (s.parentNode) s.parentNode.removeChild(s); });",
  "  var html = bodyClone.outerHTML.replace(/>\\s+</g, '><').trim();",
  "  (CONFIG.volatile||[]).forEach(function(pat){",
  "    try { html = html.replace(new RegExp(pat, 'g'), '\\u2588VOLATILE\\u2588'); } catch(e){}",
  "  });",
  "  var storage = [];",
  "  try {",
  "    var keys = [];",
  "    for (var i=0;i<localStorage.length;i++){ keys.push(localStorage.key(i)); }",
  "    keys.sort();",
  "    keys.forEach(function(k){ storage.push([k, localStorage.getItem(k)]); });",
  "  } catch(e){}",
  "  window.__p7.snaps.push({label: label || ('snap'+window.__p7.snaps.length), html: html, title: document.title, storage: storage, cookie: document.cookie});",
  "}",
  "function setValue(sel, val){",
  "  var el = document.querySelector(sel);",
  "  if (!el){ missing(sel); return; }",
  "  el.value = val;",
  "  dispatch(el, 'input'); dispatch(el, 'change');",
  "}",
  "function keyEvent(sel, key){",
  "  var el = document.querySelector(sel);",
  "  if (!el){ missing(sel); return; }",
  "  try {",
  "    el.dispatchEvent(new KeyboardEvent('keydown', {key:key, bubbles:true}));",
  "    el.dispatchEvent(new KeyboardEvent('keyup', {key:key, bubbles:true}));",
  "  } catch(e){}",
  "}",
  "function hoverEl(sel){",
  "  var el = document.querySelector(sel);",
  "  if (!el){ missing(sel); return; }",
  "  ['pointerover','pointerenter','mouseover','mouseenter'].forEach(function(t){ dispatch(el, t); });",
  "}",
  "function clickSelEl(el){ try { el.click(); } catch(e){} }",
  "function clickSel(sel, optional){",
  "  var el = document.querySelector(sel);",
  "  if (!el){ if (!optional) missing(sel); return; }",
  "  clickSelEl(el);",
  "}",
  "function dblclickSel(sel){",
  "  var el = document.querySelector(sel);",
  "  if (!el){ missing(sel); return; }",
  "  try { el.dispatchEvent(new MouseEvent('dblclick', {bubbles:true})); } catch(e){}",
  "}",
  "function wait(ms){ return new Promise(function(res){ setTimeout(res, ms); }); }",
  "function runOne(step){",
  "  var kind = step[0];",
  "  if (kind === 'snap'){ snapshot(step[1]); return Promise.resolve(); }",
  "  if (kind === 'click'){ clickSel(step[1], step[2]); return wait(50); }",
  "  if (kind === 'set'){ setValue(step[1][0], step[1][1]); return wait(30); }",
  "  if (kind === 'key'){ keyEvent(step[1][0], step[1][1]); return wait(30); }",
  "  if (kind === 'hover'){ hoverEl(step[1]); return wait(30); }",
  "  if (kind === 'dblclick'){ dblclickSel(step[1]); return wait(30); }",
  "  if (kind === 'wait'){ return wait(step[1]); }",
  "  if (kind === 'js'){ try { (new Function(step[1]))(); } catch(e){ window.__p7.errors.push({type:'js', message: e && e.message}); } return wait(10); }",
  "  if (kind === 'clickEach'){",
  "    var sel = step[1], doSteps = step[2] || [], prefix = step[3] || 'each';",
  "    var count = qAll(sel).length;",
  "    var chain = Promise.resolve();",
  "    var mk = function(idx){",
  "      chain = chain.then(function(){",
  "        var els = qAll(sel);",
  "        var el = els[idx];",
  "        if (!el) return Promise.resolve();",
  "        clickSelEl(el);",
  "        return wait(50).then(function(){",
  "          return doSteps.reduce(function(c, s){",
  "            return c.then(function(){",
  "              if (s[0] === 'snap' && s[1] === undefined){ return runOne(['snap', prefix + '-' + idx]); }",
  "              return runOne(s);",
  "            });",
  "          }, Promise.resolve());",
  "        });",
  "      });",
  "    };",
  "    for (var i=0;i<count;i++){ mk(i); }",
  "    return chain;",
  "  }",
  "  return Promise.resolve();",
  "}",
  "function runAll(steps){",
  "  return steps.reduce(function(chain, step){ return chain.then(function(){ return runOne(step); }); }, Promise.resolve());",
  "}",
  "function finish(){",
  "  var pre = document.createElement('pre');",
  "  pre.id = 'p7-out';",
  "  pre.style.display = 'none';",
  "  pre.textContent = JSON.stringify(window.__p7);",
  "  document.body.appendChild(pre);",
  "}",
  "window.addEventListener('load', function(){",
  "  setTimeout(function(){",
  "    runAll(CONFIG.steps || []).then(finish).catch(function(e){",
  "      window.__p7.errors.push({type:'driver', message: e && e.message});",
  "      finish();",
  "    });",
  "  }, CONFIG.initialWait || 800);",
  "});"
].join("\n");

function buildHeadScript(runConfig, injectMutant) {
  var preStorageJson = JSON.stringify(runConfig.preStorage || null);
  var lines = [
    "",
    "<script>(function(){",
    "function mulberry32(a){return function(){a|=0;a=(a+0x6D2B79F5)|0;var t=Math.imul(a ^ a>>>15,1|a);t=(t+Math.imul(t ^ t>>>7,61|t)) ^ t;return ((t ^ t>>>14)>>>0)/4294967296;};}",
    "Math.random = mulberry32(12345);",
    "window.__p7 = {errors:[], snaps:[]};",
    "window.addEventListener('error', function(e){ window.__p7.errors.push({type:'error', message:(e&&e.message)||String(e)}); });",
    "window.addEventListener('unhandledrejection', function(e){ window.__p7.errors.push({type:'unhandledrejection', message:(e&&e.reason&&e.reason.message)||String(e&&e.reason)}); });",
    "var __origErr = console.error; console.error = function(){ window.__p7.errors.push({type:'console.error', message:Array.prototype.slice.call(arguments).map(String).join(' ')}); return __origErr.apply(console, arguments); };",
    "var __pre = " + preStorageJson + "; if (__pre) { for (var __k in __pre) { try { localStorage.setItem(__k, __pre[__k]); } catch(e){} } }",
    (injectMutant ? "document.addEventListener('DOMContentLoaded', function(){ try { document.body.setAttribute('data-p7-mutant','1'); } catch(e){} });" : ""),
    "})();</script>",
    ""
  ];
  return lines.join("\n");
}

function buildBodyScript(runConfig, globalConfig) {
  var cfgJson = JSON.stringify({ steps: runConfig.steps, initialWait: globalConfig.initialWait, volatile: globalConfig.volatile });
  return "\n<script>(function(){\nvar CONFIG = " + cfgJson + ";\n" + DRIVER_BODY + "\n})();</script>\n";
}

function instrumentHtml(html, runConfig, globalConfig, injectMutant) {
  var headScript = buildHeadScript(runConfig, injectMutant);
  var bodyScript = buildBodyScript(runConfig, globalConfig);
  var injectedHead = false;
  html = html.replace(/<head(\s[^>]*)?>/i, function (m) {
    injectedHead = true;
    return m + headScript;
  });
  if (!injectedHead) {
    html = headScript + html;
  }
  if (/<\/body>/i.test(html)) {
    html = html.replace(/<\/body>/i, bodyScript + "</body>");
  } else {
    html = html + bodyScript;
  }
  return html;
}

/* ---------- Chrome invocation ---------- */

function runChrome(fileUrl, budgetMs) {
  var profileDir = harness.mkScratch("p7-bd-profile-");
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

/* ---------- run execution ---------- */

function executeRun(toolRelPath, run, globalConfig, useBase, assetsOverrideDir, prefix, injectMutant) {
  var site = buildSite(prefix, toolRelPath, useBase, assetsOverrideDir, run, globalConfig, injectMutant);
  var url = "file://" + site.toolAbsPath + (run.query ? run.query : "");
  var dom = runChrome(url, globalConfig.budgetMs);
  cleanupSite(site.siteRoot);
  var raw = extractOutput(dom);
  if (raw === null) return { error: "NO-OUTPUT" };
  var parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (e) {
    return { error: "NO-OUTPUT" };
  }
  if (!parsed.snaps || !parsed.snaps.length) return { error: "NO-SNAPSHOTS", errors: parsed.errors || [] };
  return { snaps: parsed.snaps, errors: parsed.errors || [] };
}

/* ---------- comparison ---------- */

function firstDiffContext(a, b) {
  var len = Math.max(a.length, b.length);
  var i = 0;
  while (i < len && a[i] === b[i]) i++;
  var start = Math.max(0, i - 60);
  return { old: a.slice(start, i + 60), new: b.slice(start, i + 60) };
}

function compareSnaps(oldSnaps, newSnaps) {
  if (oldSnaps.length !== newSnaps.length) {
    return { ok: false, label: null, msg: "snapshot count mismatch old=" + oldSnaps.length + " new=" + newSnaps.length };
  }
  for (var i = 0; i < oldSnaps.length; i++) {
    var o = oldSnaps[i], n = newSnaps[i];
    var label = o.label || n.label || ("#" + i);
    if (o.html !== n.html) {
      return { ok: false, label: label, msg: "html differs", context: firstDiffContext(o.html, n.html) };
    }
    if (o.title !== n.title) {
      return { ok: false, label: label, msg: 'title differs: "' + o.title + '" vs "' + n.title + '"' };
    }
    var os = JSON.stringify(o.storage), ns = JSON.stringify(n.storage);
    if (os !== ns) {
      return { ok: false, label: label, msg: "storage differs: " + os + " vs " + ns };
    }
    if (o.cookie !== n.cookie) {
      return { ok: false, label: label, msg: 'cookie differs: "' + o.cookie + '" vs "' + n.cookie + '"' };
    }
  }
  return { ok: true };
}

function printDiff(slug, cmp) {
  var extra = cmp.context ? (" || OLD: " + cmp.context.old + " || NEW: " + cmp.context.new) : "";
  console.log("BROWSER-DIFF " + slug + " DIFF at " + cmp.label + ": " + cmp.msg + extra);
}

/* ---------- modes ---------- */

function doDiff(toolRelPath, config, assetsOverride) {
  var slug = slugify(toolRelPath);
  var totalSnaps = 0;
  for (var idx = 0; idx < config.runs.length; idx++) {
    var run = config.runs[idx];
    var oldRes = executeRun(toolRelPath, run, config, true, null, "p7-bd-old" + idx + "-", false);
    if (oldRes.error) { console.log("BROWSER-DIFF " + slug + " " + oldRes.error + " (OLD)"); process.exit(1); }
    var newRes = executeRun(toolRelPath, run, config, false, assetsOverride, "p7-bd-new" + idx + "-", false);
    if (newRes.error) { console.log("BROWSER-DIFF " + slug + " " + newRes.error + " (NEW)"); process.exit(1); }
    if (newRes.errors && newRes.errors.length) {
      console.log("NEW-ERRORS " + JSON.stringify(newRes.errors));
      process.exit(1);
    }
    var cmp = compareSnaps(oldRes.snaps, newRes.snaps);
    if (!cmp.ok) { printDiff(slug, cmp); process.exit(1); }
    totalSnaps += oldRes.snaps.length;
  }
  console.log("BROWSER-DIFF " + slug + " IDENTICAL snaps=" + totalSnaps + " errors=0");
  process.exit(0);
}

function doStability(toolRelPath, config) {
  var slug = slugify(toolRelPath);
  var totalSnaps = 0;
  for (var idx = 0; idx < config.runs.length; idx++) {
    var run = config.runs[idx];
    var r1 = executeRun(toolRelPath, run, config, true, null, "p7-bd-stab1-" + idx + "-", false);
    if (r1.error) { console.log("BROWSER-DIFF " + slug + " " + r1.error + " (run1)"); process.exit(1); }
    var r2 = executeRun(toolRelPath, run, config, true, null, "p7-bd-stab2-" + idx + "-", false);
    if (r2.error) { console.log("BROWSER-DIFF " + slug + " " + r2.error + " (run2)"); process.exit(1); }
    var cmp = compareSnaps(r1.snaps, r2.snaps);
    if (!cmp.ok) { printDiff(slug, cmp); process.exit(1); }
    totalSnaps += r1.snaps.length;
  }
  console.log("BROWSER-DIFF " + slug + " IDENTICAL snaps=" + totalSnaps + " errors=0");
  process.exit(0);
}

function doMutant(toolRelPath, config) {
  var slug = slugify(toolRelPath);
  var run = config.runs[0];
  var oldRes = executeRun(toolRelPath, run, config, true, null, "p7-bd-mutold-", false);
  if (oldRes.error) { console.log("MUTANT-SURVIVED " + slug + " (" + oldRes.error + " OLD)"); process.exit(1); }
  var newRes = executeRun(toolRelPath, run, config, false, null, "p7-bd-mutnew-", true);
  if (newRes.error) { console.log("MUTANT-SURVIVED " + slug + " (" + newRes.error + " NEW)"); process.exit(1); }
  var cmp = compareSnaps(oldRes.snaps, newRes.snaps);
  if (!cmp.ok) {
    console.log("MUTANT-DETECTED " + slug);
    process.exit(0);
  } else {
    console.log("MUTANT-SURVIVED " + slug);
    process.exit(1);
  }
}

/* ---------- CLI ---------- */

function main() {
  var argv = process.argv.slice(2);
  var toolRelPath = argv[0];
  if (!toolRelPath) {
    console.error('Usage: node browser-diff.js "<tool rel path>" [--stability|--mutant] [--assets <dir>]');
    process.exit(1);
  }
  var mode = "diff";
  var assetsOverride = null;
  for (var i = 1; i < argv.length; i++) {
    if (argv[i] === "--stability") mode = "stability";
    else if (argv[i] === "--mutant") mode = "mutant";
    else if (argv[i] === "--assets") { assetsOverride = path.resolve(argv[++i]); }
  }
  var config = loadConfig(toolRelPath);
  if (mode === "stability") doStability(toolRelPath, config);
  else if (mode === "mutant") doMutant(toolRelPath, config);
  else doDiff(toolRelPath, config, assetsOverride);
}

if (require.main === module) {
  main();
}

module.exports = { loadConfig: loadConfig, slugify: slugify, instrumentHtml: instrumentHtml };
