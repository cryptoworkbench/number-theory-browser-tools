#!/usr/bin/env node
/* lift-probe.js — 261003-i23 copy of 261003-fcr's flush-probe.js whose long
 * mode additionally asserts LIFT: the shown panel's bottom edge is at or above
 * the site footer's top edge (pf <= 0.5) and the footer is no taller than the
 * Sieve's (fh <= 80). Original header follows.
 *
 * flush-probe.js — dev-only Node/headless-Chrome verification probe for
 * quick task 261003-fcr (make the shared site footer sit flush at the
 * bottom on all 16 pages). Never shipped, never referenced by any .html
 * page.
 *
 * Usage:
 *   node flush-probe.js <mode> [--base <sha>] [--root <dir>] [--only <substring>]
 *                        [--sizes <comma list>] [--themes <comma list>]
 *
 * Modes:
 *   flush  FLUSH + LAYOUT-INVARIANT — on each page/theme/size, the site
 *          footer's bottom edge equals document.scrollHeight within 1px
 *          and is at least the viewport height, with nothing below it
 *          (BELOW=0, clip-aware), both at scroll-top and after scrolling
 *          to the end (D-10); and no element outside the site footer moves
 *          between the candidate site.css and the <base> site.css, measured
 *          by toggling the active stylesheet within the same page load.
 *   long   FLUSH-LONG — RSA and Diffie-Hellman generated and scrolled to
 *          the end, with the fixed public-values panel forced to its
 *          worst-case footprint: still flush, still a genuinely long page,
 *          panel shown and clear of the height, never overlapping the
 *          language switcher.
 *   print  PRINT-PAGES — printed page counts are unchanged from <base> on
 *          14 pages, and no larger on RSA/Diffie-Hellman.
 *   neg    FLUSH-NEG — four negative controls proving flush/long-mode
 *          mode is not vacuous: each removes or weakens one piece of the
 *          mechanism and must make this script fail with the named line.
 *
 * A size is "WxH" or "WxH@F" where F is a --force-device-scale-factor.
 * Exits 0 only on PASS. Never writes inside the repository.
 */
"use strict";

var fs = require("fs");
var path = require("path");
var cp = require("child_process");

var ROOT = path.resolve(__dirname, "..", "..", "..");
var P6_DIR = path.join(ROOT, ".planning", "phases", "06-multi-language-support");
var P7_DIR = path.join(ROOT, ".planning", "phases", "07-shared-js-module-refactor");
var BQZ_DIR = path.join(ROOT, ".planning", "quick", "261003-bqz-move-the-language-switcher-to-a-shared-s");

var i18nCheck = require(path.join(P6_DIR, "i18n-check.js"));
var harness = require(path.join(P7_DIR, "harness.js"));
var footerProbe = require(path.join(BQZ_DIR, "footer-probe.js"));

var DEFAULT_BASE = "5185635";
var PAGES = i18nCheck.PAGES.map(function (p) { return p.file; });

var RESERVE_PAGES = ["RSA/rsa.html", "Diffie-Hellman Key Exchange/diffie-hellman-key-exchange.html"];

var DEFAULT_FLUSH_SIZES = "375x812,1280x800,1920x1080,2000x1333@1.368,2560x1440";
var DEFAULT_FLUSH_THEMES = "night,day";
var DEFAULT_LONG_SIZES = "500x800,700x900,1280x800,1920x1080,2000x1333@1.368,2560x1440";
var DEFAULT_LONG_THEMES = "night,day";

/* ---------- CLI arg parsing ---------- */

function parseSizes(str) {
  return str.split(",").map(function (tok) {
    var m = /^(\d+)x(\d+)(?:@([0-9.]+))?$/.exec(tok.trim());
    if (!m) throw new Error("invalid --sizes token: " + tok);
    return { w: parseInt(m[1], 10), h: parseInt(m[2], 10), f: m[3] ? parseFloat(m[3]) : null };
  });
}

function parseThemes(str) {
  return str.split(",").map(function (s) { return s.trim(); }).filter(Boolean);
}

function sizeLabel(size) {
  return size.w + "x" + size.h + (size.f ? "@" + size.f : "");
}

function parseArgs(argv) {
  var mode = argv[0];
  var opts = { base: DEFAULT_BASE, root: null, only: null, sizes: null, themes: null };
  for (var i = 1; i < argv.length; i++) {
    if (argv[i] === "--base") opts.base = argv[++i];
    else if (argv[i] === "--root") opts.root = argv[++i];
    else if (argv[i] === "--only") opts.only = argv[++i];
    else if (argv[i] === "--sizes") opts.sizes = parseSizes(argv[++i]);
    else if (argv[i] === "--themes") opts.themes = parseThemes(argv[++i]);
  }
  return { mode: mode, opts: opts };
}

function filterPages(only) {
  if (!only) return PAGES.slice();
  return PAGES.filter(function (p) { return p.indexOf(only) !== -1; });
}

/* ---------- git helpers ---------- */

function gitRun(args, cwd) {
  return cp.execFileSync("git", args, { cwd: cwd || ROOT, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
}

function gitShowAt(base, relPath) {
  return gitRun(["show", base + ":" + relPath]);
}

/* ---------- scratch-site resolution (reuses bqz's makeScratchCopy) ---------- */

function resolveSiteRoot(opts, prefix) {
  if (opts.root) return { root: opts.root, cleanup: function () {} };
  var root = footerProbe.makeScratchCopy(prefix);
  return { root: root, cleanup: function () { try { fs.rmSync(root, { recursive: true, force: true }); } catch (e) { /* best effort */ } } };
}

/* ---------- headless-Chrome runtime helpers (D-09) ---------- */

function runChromeDumpDom(url, budgetMs, windowSize, dprFactor) {
  var profileDir = harness.mkScratch("flush-probe-profile-");
  var args = [
    "--headless=new", "--disable-gpu", "--no-sandbox",
    "--user-data-dir=" + profileDir,
    "--virtual-time-budget=" + budgetMs,
    "--window-size=" + (windowSize || "2700,1600"),
    "--dump-dom"
  ];
  if (dprFactor) args.push("--force-device-scale-factor=" + dprFactor);
  args.push(url);
  var res = cp.spawnSync("google-chrome", args, { encoding: "utf8", maxBuffer: 200 * 1024 * 1024, env: harness.chromeEnv(), timeout: 90000 });
  try { fs.rmSync(profileDir, { recursive: true, force: true }); } catch (e) { /* best effort */ }
  return res.stdout || "";
}

function printToPdf(url, outPath) {
  var profileDir = harness.mkScratch("flush-print-profile-");
  var args = [
    "--headless=new", "--disable-gpu", "--no-sandbox",
    "--user-data-dir=" + profileDir,
    "--virtual-time-budget=3000",
    "--no-pdf-header-footer",
    "--print-to-pdf=" + outPath,
    url
  ];
  cp.spawnSync("google-chrome", args, { encoding: "utf8", maxBuffer: 64 * 1024 * 1024, env: harness.chromeEnv(), timeout: 90000 });
  try { fs.rmSync(profileDir, { recursive: true, force: true }); } catch (e) { /* best effort */ }
}

function unescapeHtmlAttr(s) {
  return s.replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
}

function extractDataM(domHtml) {
  var m = /<html[^>]*\sdata-m="([^"]*)"/.exec(domHtml);
  if (!m) return null;
  try { return JSON.parse(unescapeHtmlAttr(m[1])); } catch (e) { return null; }
}

function toFileUrl(absPath) {
  return "file://" + absPath;
}

// buildIframeSrc(absPath, query): a URI-encoded file:// URL (spaces and
// other path characters percent-encoded) suitable for embedding as an
// <iframe src="..."> attribute value in a wrapper page we author.
function buildIframeSrc(absPath, query) {
  var encoded = absPath.split("/").map(function (seg) { return encodeURIComponent(seg); }).join("/");
  var url = "file://" + encoded;
  if (query) url += "?" + query;
  return url;
}

function escapeAttr(s) {
  return s.replace(/&/g, "&amp;").replace(/"/g, "&quot;");
}

function writeWrapperAndRun(root, iframeSrc, iframeWidth, iframeHeight, budgetMs, dprFactor) {
  var wrapperHtml = '<!doctype html><html><head><meta charset="utf-8"></head><body style="margin:0;padding:0">' +
    '<iframe src="' + escapeAttr(iframeSrc) + '" style="border:0;width:' + iframeWidth + 'px;height:' + iframeHeight + 'px;display:block;"></iframe>' +
    "<script>window.addEventListener('message', function(e){ document.documentElement.setAttribute('data-m', e.data); });</script>" +
    "</body></html>";
  var wrapperAbs = path.join(root, "flush-probe-wrap-" + process.pid + "-" + Math.random().toString(36).slice(2) + ".html");
  fs.writeFileSync(wrapperAbs, wrapperHtml);
  var dom = runChromeDumpDom(toFileUrl(wrapperAbs), budgetMs, "2700,1600", dprFactor);
  try { fs.unlinkSync(wrapperAbs); } catch (e) { /* best effort */ }
  return extractDataM(dom);
}

/* ---------- shared in-browser helper functions (D-10) ---------- */

function browserHelpersJs() {
  return [
    "function isSkippedTag(t){ t=t.toUpperCase(); return t==='SCRIPT'||t==='STYLE'||t==='NOSCRIPT'||t==='TEMPLATE'||t==='LINK'||t==='META'; }",
    "function inSiteFooter(el){ return !!el.closest('.site-footer'); }",
    "function hasFixedSelfOrAncestor(el){ var n=el; while(n && n.tagName!=='HTML'){ if(getComputedStyle(n).position==='fixed') return true; n=n.parentElement; } return false; }",
    "function clippedBottom(el){ var r=el.getBoundingClientRect(); var b=r.bottom; var a=el.parentElement; while(a && a.tagName!=='HTML'){ var cs=getComputedStyle(a); if(cs.overflowX!=='visible'||cs.overflowY!=='visible'){ var ar=a.getBoundingClientRect(); if(ar.bottom<b) b=ar.bottom; } a=a.parentElement; } return b; }",
    "function labelFor(el,i){ var cls=(el.getAttribute('class')||'').trim().split(/\\s+/).filter(Boolean).join('.'); return i+':'+el.tagName+(el.id?'#'+el.id:'')+(cls?'.'+cls:''); }",
    "function collectRects(){",
    "  var out=[]; var nodes=document.body.querySelectorAll('*');",
    "  for(var i=0;i<nodes.length;i++){",
    "    var el=nodes[i];",
    "    if(isSkippedTag(el.tagName)) continue;",
    "    if(inSiteFooter(el)) continue;",
    "    if(hasFixedSelfOrAncestor(el)) continue;",
    "    var r=el.getBoundingClientRect();",
    "    out.push({l:labelFor(el,i), left:Math.round(r.left*2)/2, top:Math.round((r.top+window.scrollY)*2)/2, w:Math.round(r.width*2)/2, h:Math.round(r.height*2)/2});",
    "  }",
    "  return out;",
    "}",
    "function belowCount(fb){",
    "  var nodes=document.body.querySelectorAll('*'); var count=0; var firstLabel=null;",
    "  for(var i=0;i<nodes.length;i++){",
    "    var el=nodes[i];",
    "    if(isSkippedTag(el.tagName)) continue;",
    "    if(inSiteFooter(el)) continue;",
    "    if(hasFixedSelfOrAncestor(el)) continue;",
    "    var cs=getComputedStyle(el);",
    "    if(cs.visibility==='hidden'||cs.visibility==='collapse') continue;",
    "    var r=el.getBoundingClientRect();",
    "    if(r.width===0||r.height===0) continue;",
    "    var cb=clippedBottom(el)+window.scrollY;",
    "    if(cb>fb+1){ count++; if(firstLabel===null) firstLabel=labelFor(el,i); }",
    "  }",
    "  return { count:count, label:firstLabel };",
    "}",
    "function measureFlush(){",
    "  var ftr=document.querySelector('.site-footer');",
    "  var fr=ftr?ftr.getBoundingClientRect():null;",
    "  var fb=fr?Math.round((fr.bottom+window.scrollY)*100)/100:-1;",
    "  var sh=document.documentElement.scrollHeight;",
    "  var vh=window.innerHeight;",
    "  var vw=window.innerWidth;",
    "  var dpr=window.devicePixelRatio;",
    "  var b=belowCount(fb);",
    "  return { fb:fb, sh:sh, vh:vh, vw:vw, dpr:dpr, below:b.count, belowLabel:b.label };",
    "}",
    "function diffRects(a,b){",
    "  var n=Math.max(a.length,b.length); var nd=0; var firstLabel=null;",
    "  for(var i=0;i<n;i++){",
    "    var x=a[i], y=b[i];",
    "    if(!x||!y){ nd++; if(firstLabel===null) firstLabel=(x&&x.l)||(y&&y.l)||('index '+i); continue; }",
    "    if(Math.abs(x.left-y.left)>0.5||Math.abs(x.top-y.top)>0.5||Math.abs(x.w-y.w)>0.5||Math.abs(x.h-y.h)>0.5){",
    "      nd++; if(firstLabel===null) firstLabel=x.l;",
    "    }",
    "  }",
    "  return { n: nd, label: firstLabel };",
    "}"
  ].join("\n");
}

/* ================================================================
 * flush mode — FLUSH + LAYOUT-INVARIANT (D-08, D-09, D-10)
 * ================================================================ */

function flushMetricsScript() {
  return [
    "<script>",
    "(function(){",
    browserHelpersJs(),
    "setTimeout(function(){",
    "  var m1 = measureFlush();",
    "  var rects1 = collectRects();",
    "  var link = document.querySelector('link[href*=\"site.css\"]');",
    "  var base = document.getElementById('flush-probe-base');",
    "  if (link) link.disabled = true;",
    "  if (base) base.media = 'all';",
    "  var rects2 = collectRects();",
    "  if (link) link.disabled = false;",
    "  if (base) base.media = 'not all';",
    "  var diff = diffRects(rects1, rects2);",
    "  window.scrollTo(0, document.documentElement.scrollHeight);",
    "  setTimeout(function(){",
    "    var m2 = measureFlush();",
    "    var payload = {",
    "      fb:m1.fb, sh:m1.sh, vh:m1.vh, vw:m1.vw, dpr:m1.dpr, below:m1.below, belowLabel:m1.belowLabel,",
    "      fbEnd:m2.fb, shEnd:m2.sh, belowEnd:m2.below, belowEndLabel:m2.belowLabel, sy:window.scrollY,",
    "      n: rects1.length, ndiff: diff.n, diffLabel: diff.label",
    "    };",
    "    parent.postMessage(JSON.stringify(payload), '*');",
    "  }, 800);",
    "}, 1500);",
    "})();",
    "</script>"
  ].join("\n");
}

// buildFlushProbeCopy(root, relPath, baseCss): the page with (a) an inline
// <style id="flush-probe-base" media="not all"> holding the <base> site.css
// text, inserted immediately after the page's own site.css <link>, and (b)
// the flush metrics script inserted before </body>. Written next to the
// original as "<name>.flush-probe.html" so ../assets/ resolves.
function buildFlushProbeCopy(root, relPath, baseCss) {
  var abs = path.join(root, relPath);
  var html = fs.readFileSync(abs, "utf8");
  var lines = html.split("\n");
  var linkIdx = -1;
  for (var i = 0; i < lines.length; i++) {
    if (/<link rel="stylesheet" href="[^"]*site\.css">/.test(lines[i])) { linkIdx = i; break; }
  }
  if (linkIdx === -1) throw new Error(relPath + ": site.css <link> line not found");
  var styleLines = ['<style id="flush-probe-base" media="not all">', baseCss, "</style>"];
  var withBase = lines.slice(0, linkIdx + 1).concat(styleLines).concat(lines.slice(linkIdx + 1));
  var finalHtml = withBase.join("\n");
  var injected = /<\/body>/i.test(finalHtml) ? finalHtml.replace(/<\/body>/i, flushMetricsScript() + "</body>") : finalHtml + flushMetricsScript();
  var probeName = path.basename(relPath).replace(/\.html$/, ".flush-probe.html");
  var probeAbs = path.join(path.dirname(abs), probeName);
  fs.writeFileSync(probeAbs, injected);
  return probeAbs;
}

function modeFlush(opts) {
  var sizes = opts.sizes || parseSizes(DEFAULT_FLUSH_SIZES);
  var themes = opts.themes || parseThemes(DEFAULT_FLUSH_THEMES);
  var siteInfo = resolveSiteRoot(opts, "flush-probe-");
  var root = siteInfo.root;
  var pages = filterPages(opts.only);
  var baseCss = gitShowAt(opts.base, "assets/site.css");
  var total = 0, flushFails = 0, layoutFails = 0;

  pages.forEach(function (relPath) {
    var probeAbs = buildFlushProbeCopy(root, relPath, baseCss);
    sizes.forEach(function (size) {
      themes.forEach(function (theme) {
        total++;
        var iframeSrc = buildIframeSrc(probeAbs, "lang=en&theme=" + theme);
        var payload = writeWrapperAndRun(root, iframeSrc, size.w, size.h, 4000, size.f);
        console.log("FLUSH-RUN " + relPath + " " + theme + " " + sizeLabel(size) + " " + JSON.stringify(payload));
        var flushOk = !!payload &&
          Math.abs(payload.fb - payload.sh) <= 1 && payload.fb >= payload.vh - 1 && payload.below === 0 &&
          Math.abs(payload.fbEnd - payload.shEnd) <= 1 && payload.fbEnd >= payload.vh - 1 && payload.belowEnd === 0 &&
          payload.vw === size.w && payload.vh === size.h &&
          (!size.f || Math.abs(payload.dpr - size.f) <= 0.01);
        var layoutOk = !!payload && payload.n > 0 && payload.ndiff === 0;
        if (!flushOk) flushFails++;
        if (!layoutOk) layoutFails++;
      });
    });
  });

  siteInfo.cleanup();
  console.log(flushFails === 0 ? ("FLUSH PASS " + total + " runs") : ("FLUSH FAIL " + flushFails + " of " + total + " runs"));
  console.log(layoutFails === 0 ? ("LAYOUT-INVARIANT PASS " + total + " runs") : ("LAYOUT-INVARIANT FAIL " + layoutFails + " of " + total + " runs"));
  process.exit(flushFails === 0 && layoutFails === 0 ? 0 : 1);
}

/* ================================================================
 * long mode — FLUSH-LONG (D-06, D-07, D-10)
 * ================================================================ */

var LONG_PAGES = [
  { rel: "RSA/rsa.html", clicks: ["bob-gen-btn", "alice-gen-btn"], panelId: "pubkey-scratchpad" },
  { rel: "Diffie-Hellman Key Exchange/diffie-hellman-key-exchange.html", clicks: ["instantBtn"], panelId: "dh-scratchpad" }
];

function longMetricsScript(clickIds, panelId) {
  var clickLines = clickIds.map(function (id) { return "  var el = document.getElementById('" + id + "'); if (el) el.click();"; }).join("\n");
  return [
    "<script>",
    "(function(){",
    browserHelpersJs(),
    "setTimeout(function(){",
    clickLines,
    "}, 600);",
    "setTimeout(function(){",
    "  var panel = document.getElementById('" + panelId + "');",
    "  if (panel) {",
    "    panel.classList.add('is-shown');",
    "    var rows = panel.querySelectorAll('.scratch-row');",
    "    for (var i=0;i<rows.length;i++) rows[i].classList.add('is-shown');",
    "    var kvs = panel.querySelectorAll('.scratch-kv');",
    "    var digits = '';",
    "    for (var d=0; d<60; d++) digits += String(d % 10);",
    "    for (var k=0;k<kvs.length;k++) kvs[k].textContent = 'n = ' + digits;",
    "  }",
    "  window.scrollTo(0, document.documentElement.scrollHeight);",
    "}, 2100);",
    "setTimeout(function(){",
    "  window.scrollBy(0, -1);",
    "  window.scrollTo(0, document.documentElement.scrollHeight);",
    "}, 2900);",
    "setTimeout(function(){",
    "  var m = measureFlush();",
    "  var panel = document.getElementById('" + panelId + "');",
    "  var ls = document.querySelector('.site-footer .lang-switch');",
    "  var cs = panel ? getComputedStyle(panel) : null;",
    "  var shown = panel ? (panel.classList.contains('is-shown') && cs.display !== 'none') : false;",
    "  var padRect = panel ? panel.getBoundingClientRect() : null;",
    "  var padH = padRect ? padRect.height : 0;",
    "  var atEnd = Math.abs((window.scrollY + window.innerHeight) - document.documentElement.scrollHeight) <= 2;",
    "  var lsRect = ls ? ls.getBoundingClientRect() : null;",
    "  var hit = (padRect && lsRect) ? !(padRect.right < lsRect.left || padRect.left > lsRect.right || padRect.bottom < lsRect.top || padRect.top > lsRect.bottom) : false;",
    "  var gap = (padRect && lsRect) ? (padRect.top - lsRect.bottom) : null;",
    "  var fr = document.querySelector('.site-footer').getBoundingClientRect();",
    "  var pf = padRect ? (padRect.bottom - fr.top) : null; var fh = fr.height;",
    "  var payload = {",
    "    fb:m.fb, sh:m.sh, vh:m.vh, vw:m.vw, dpr:m.dpr, below:m.below,",
    "    atEnd: atEnd?1:0, shown: shown?1:0, padH: Math.round(padH), hit: hit?1:0, gap: gap===null?null:Math.round(gap), pf: pf===null?null:Math.round(pf*10)/10, fh: Math.round(fh)",
    "  };",
    "  parent.postMessage(JSON.stringify(payload), '*');",
    "}, 3700);",
    "})();",
    "</script>"
  ].join("\n");
}

// buildGenericProbeCopy(root, relPath, metricsScript): the page with
// metricsScript inserted before </body> only (no base-css injection).
function buildGenericProbeCopy(root, relPath, metricsScript, suffix) {
  var abs = path.join(root, relPath);
  var html = fs.readFileSync(abs, "utf8");
  var injected = /<\/body>/i.test(html) ? html.replace(/<\/body>/i, metricsScript + "</body>") : html + metricsScript;
  var probeName = path.basename(relPath).replace(/\.html$/, "." + (suffix || "flush-probe") + ".html");
  var probeAbs = path.join(path.dirname(abs), probeName);
  fs.writeFileSync(probeAbs, injected);
  return probeAbs;
}

function modeLong(opts) {
  var sizes = opts.sizes || parseSizes(DEFAULT_LONG_SIZES);
  var themes = opts.themes || parseThemes(DEFAULT_LONG_THEMES);
  var siteInfo = resolveSiteRoot(opts, "flush-long-");
  var root = siteInfo.root;
  var pages = LONG_PAGES.filter(function (p) { return !opts.only || p.rel.indexOf(opts.only) !== -1; });
  var total = 0, fails = 0;

  pages.forEach(function (pcfg) {
    var probeAbs = buildGenericProbeCopy(root, pcfg.rel, longMetricsScript(pcfg.clicks, pcfg.panelId), "flush-long-probe");
    sizes.forEach(function (size) {
      themes.forEach(function (theme) {
        total++;
        var iframeSrc = buildIframeSrc(probeAbs, "lang=en&theme=" + theme);
        var payload = writeWrapperAndRun(root, iframeSrc, size.w, size.h, 8000, size.f);
        console.log("FLUSH-LONG-RUN " + pcfg.rel + " " + theme + " " + sizeLabel(size) + " " + JSON.stringify(payload));
        var ok = !!payload &&
          Math.abs(payload.fb - payload.sh) <= 1 && payload.fb >= payload.vh - 1 && payload.below === 0 &&
          payload.vw === size.w && payload.vh === size.h &&
          (!size.f || Math.abs(payload.dpr - size.f) <= 0.01) &&
          payload.sh > payload.vh + 200 &&
          payload.atEnd === 1 && payload.shown === 1 && payload.padH >= 150 && payload.hit === 0 &&
          payload.pf !== null && payload.pf <= 0.5 && payload.fh <= 80;
        if (!ok) fails++;
      });
    });
  });

  siteInfo.cleanup();
  if (fails) { console.log("FLUSH-LONG FAIL " + fails + " of " + total + " runs"); process.exit(1); }
  console.log("FLUSH-LONG PASS " + total + " runs");
  process.exit(0);
}

/* ================================================================
 * print mode — PRINT-PAGES (D-03)
 * ================================================================ */

function extractGitArchive(base, destDir) {
  var archiveBuf = cp.execFileSync("git", ["archive", base], { cwd: ROOT, maxBuffer: 256 * 1024 * 1024 });
  cp.execFileSync("tar", ["-x", "-C", destDir], { input: archiveBuf, maxBuffer: 256 * 1024 * 1024 });
}

function countPdfPages(pdfPath) {
  var buf = fs.readFileSync(pdfPath, "latin1");
  var m = buf.match(/\/Type\s*\/Page(?![A-Za-z])/g);
  return m ? m.length : 0;
}

function modePrint(opts) {
  var baseRoot = harness.mkScratch("flush-print-base-");
  extractGitArchive(opts.base, baseRoot);
  var siteInfo = resolveSiteRoot(opts, "flush-print-new-");
  var newRoot = siteInfo.root;
  var pages = filterPages(opts.only);
  var fails = [];

  pages.forEach(function (relPath) {
    var baseUrl = toFileUrl(path.join(baseRoot, relPath)) + "?lang=en&theme=day";
    var newUrl = toFileUrl(path.join(newRoot, relPath)) + "?lang=en&theme=day";
    var pdfDir = harness.mkScratch("flush-print-pdf-");
    var basePdf = path.join(pdfDir, "base.pdf");
    var newPdf = path.join(pdfDir, "new.pdf");
    printToPdf(baseUrl, basePdf);
    printToPdf(newUrl, newPdf);
    var baseCount = fs.existsSync(basePdf) ? countPdfPages(basePdf) : 0;
    var newCount = fs.existsSync(newPdf) ? countPdfPages(newPdf) : 0;
    console.log("PRINT-PAGES " + relPath + " base=" + baseCount + " new=" + newCount);
    var isReserve = RESERVE_PAGES.indexOf(relPath) !== -1;
    var ok = baseCount >= 1 && newCount >= 1 && (isReserve ? newCount <= baseCount : newCount === baseCount);
    if (!ok) fails.push(relPath);
  });

  try { fs.rmSync(baseRoot, { recursive: true, force: true }); } catch (e) { /* best effort */ }
  siteInfo.cleanup();
  if (fails.length) { console.log("PRINT-PAGES FAIL " + fails.join(",")); process.exit(1); }
  console.log("PRINT-PAGES PASS " + pages.length + " pages");
  process.exit(0);
}

/* ================================================================
 * neg mode — FLUSH-NEG (negative controls)
 * ================================================================ */

function modeNeg(opts) {
  var controls = [];

  // NEG-STICKY: delete the `top: 100vh;` line from site.css.
  var r1 = footerProbe.makeScratchCopy("flush-neg-sticky-");
  var p1 = path.join(r1, "assets", "site.css");
  var s1 = fs.readFileSync(p1, "utf8");
  var topLines = s1.split("\n").filter(function (l) { return l === "  top: 100vh;"; });
  if (topLines.length !== 1) throw new Error("NEG-STICKY: expected exactly 1 occurrence of 'top: 100vh;', found " + topLines.length);
  var m1 = s1.split("\n").filter(function (l) { return l !== "  top: 100vh;"; }).join("\n");
  fs.writeFileSync(p1, m1);
  var res1 = cp.spawnSync("node", [__filename, "flush", "--root", r1, "--only", "Sieve Of Eratosthenes", "--sizes", "1920x1080", "--themes", "night"], { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
  controls.push({ name: "NEG-STICKY", code: res1.status, out: res1.stdout || "", expect: "FLUSH FAIL" });
  try { fs.rmSync(r1, { recursive: true, force: true }); } catch (e) { /* best effort */ }

  // NEG-SPEC: weaken `html > body{` to `body{`.
  var r2 = footerProbe.makeScratchCopy("flush-neg-spec-");
  var p2 = path.join(r2, "assets", "site.css");
  var s2 = fs.readFileSync(p2, "utf8");
  var specOcc = s2.split("  html > body{").length - 1;
  if (specOcc !== 1) throw new Error("NEG-SPEC: expected exactly 1 occurrence of '  html > body{', found " + specOcc);
  var m2 = s2.split("  html > body{").join("  body{");
  fs.writeFileSync(p2, m2);
  var res2 = cp.spawnSync("node", [__filename, "flush", "--root", r2, "--only", "Factor Tree", "--sizes", "2560x1440", "--themes", "night"], { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
  controls.push({ name: "NEG-SPEC", code: res2.status, out: res2.stdout || "", expect: "FLUSH FAIL" });
  try { fs.rmSync(r2, { recursive: true, force: true }); } catch (e) { /* best effort */ }

  // NEG-RESERVE: move the RSA reserve back onto body.
  var r3 = footerProbe.makeScratchCopy("flush-neg-reserve-");
  var p3 = path.join(r3, "RSA", "rsa.html");
  var s3 = fs.readFileSync(p3, "utf8");
  var reserveOcc = s3.split("  .site-footer{ padding-bottom: 240px; }").length - 1;
  if (reserveOcc !== 1) throw new Error("NEG-RESERVE: expected exactly 1 occurrence of the reserve rule, found " + reserveOcc);
  var m3 = s3.split("  .site-footer{ padding-bottom: 240px; }").join("  body{ padding-bottom: 240px; }");
  fs.writeFileSync(p3, m3);
  var res3 = cp.spawnSync("node", [__filename, "flush", "--root", r3, "--only", "RSA", "--sizes", "1920x1080", "--themes", "night"], { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
  controls.push({ name: "NEG-RESERVE", code: res3.status, out: res3.stdout || "", expect: "FLUSH FAIL" });
  try { fs.rmSync(r3, { recursive: true, force: true }); } catch (e) { /* best effort */ }

  // NEG-LAYOUT: replace the mechanism with a flex-column body.
  var r4 = footerProbe.makeScratchCopy("flush-neg-layout-");
  var p4 = path.join(r4, "assets", "site.css");
  var s4 = fs.readFileSync(p4, "utf8");
  var appendBlock = "\n@media screen{\n  html > body{ display: flex; flex-direction: column; }\n  .site-footer{ position: relative; margin-top: auto; }\n}\n";
  fs.writeFileSync(p4, s4 + appendBlock);
  var res4 = cp.spawnSync("node", [__filename, "flush", "--root", r4, "--only", "Sieve Of Eratosthenes", "--sizes", "1280x800", "--themes", "night"], { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
  controls.push({ name: "NEG-LAYOUT", code: res4.status, out: res4.stdout || "", expect: "LAYOUT-INVARIANT FAIL" });
  try { fs.rmSync(r4, { recursive: true, force: true }); } catch (e) { /* best effort */ }

  var bad = [];
  controls.forEach(function (c) {
    var found = c.out.indexOf(c.expect) !== -1;
    console.log(c.name + " exit=" + c.code + " expect=" + JSON.stringify(c.expect) + " found=" + found);
    if (c.code === 0 || !found) bad.push(c.name);
  });

  if (bad.length) {
    console.log("FLUSH-NEG FAIL: " + bad.join(",") + " did not fail as expected");
    process.exit(1);
  }
  console.log("FLUSH-NEG PASS 4 controls");
  process.exit(0);
}

/* ---------- entrypoint ---------- */

function main() {
  var parsed = parseArgs(process.argv.slice(2));
  var mode = parsed.mode, opts = parsed.opts;
  if (mode === "flush") return modeFlush(opts);
  if (mode === "long") return modeLong(opts);
  if (mode === "print") return modePrint(opts);
  if (mode === "neg") return modeNeg(opts);
  console.error("Usage: node flush-probe.js <flush|long|print|neg> [--base <sha>] [--root <dir>] [--only <substring>] [--sizes <list>] [--themes <list>]");
  process.exit(1);
}

if (require.main === module) {
  main();
}

module.exports = {
  parseSizes: parseSizes,
  parseThemes: parseThemes
};
