"use strict";
/*
 * Dev-only regression probe for quick task 261005-dn2: the Venn Diagram
 * preview double-click must open the section in view on the first try.
 * Never referenced by any page. Node built-ins + the in-repo harness only.
 *
 * Copies assets/ and the Venn page into a scratch site, injects a probe
 * script that dispatches synthetic events on the composite chips in
 * headless Chrome, and reads PASS/FAIL lines back from a <pre>.
 */

var fs = require("fs");
var path = require("path");
var cp = require("child_process");
var url = require("url");

var ROOT = path.resolve(__dirname, "..", "..", "..");
var harness = require(path.join(ROOT, ".planning", "phases", "07-shared-js-module-refactor", "harness.js"));

var EXPECTED = 8;

var PROBE_BODY = [
  "(function(){",
  "  var out = document.getElementById('dn2-out');",
  "  var lines = [];",
  "  var hrefs = [];",
  "  window.addEventListener('load', function(){",
  "    window.open = function(href){ hrefs.push(String(href)); return { opener: null }; };",
  "",
  "    function scenario(name, fn){",
  "      try { lines.push('PASS ' + name + ': ' + fn()); }",
  "      catch (e) { lines.push('FAIL ' + name + ': ' + (e && e.message ? e.message : e)); }",
  "    }",
  "    function assert(cond, msg){ if (!cond) throw new Error(msg); }",
  "    function ev(el, type){",
  "      var e;",
  "      if (type === 'focus' || type === 'blur') e = new FocusEvent(type);",
  "      else if (type === 'wheel') e = new WheelEvent('wheel', { deltaY: 400, cancelable: true });",
  "      else if (type === 'dblclick') e = new MouseEvent('dblclick', { bubbles: true, cancelable: true });",
  "      else if (type === 'ArrowDown') e = new KeyboardEvent('keydown', { key: 'ArrowDown', cancelable: true });",
  "      else e = new MouseEvent(type);",
  "      el.dispatchEvent(e);",
  "    }",
  "    function chip(host, region){",
  "      var el = document.querySelector('#' + host + ' [data-region=\"' + region + '\"]');",
  "      assert(el, 'chip not found: ' + host + ' ' + region);",
  "      return el;",
  "    }",
  "    function reset(el){ ev(el, 'mouseleave'); ev(el, 'blur'); }",
  "    function lastHref(){ return hrefs[hrefs.length - 1] || '(none)'; }",
  "",
  "    scenario('S1 two-overlap-scrolled-focus-dblclick', function(){",
  "      var g = chip('venn-composite-dynamic', 'overlap');",
  "      var layer = document.getElementById('venn-preview');",
  "      reset(g);",
  "      ev(g, 'mouseenter');",
  "      ev(g, 'wheel');",
  "      assert(layer._npOffset === 206, 'offset after wheel is ' + layer._npOffset + ', expected 206');",
  "      var first = layer.firstChild;",
  "      ev(g, 'focus');",
  "      assert(layer._npOffset === 206, 'offset after focus is ' + layer._npOffset + ', expected 206');",
  "      assert(layer.firstChild === first, 'focus rebuilt the preview panel');",
  "      ev(g, 'dblclick');",
  "      var h = lastHref();",
  "      assert(h.indexOf('../Euclidean Algorithm/euclidean-algorithm.html?a=30&b=35') === 0, 'dblclick opened ' + h);",
  "      return 'offset 206 survived focus, opened ' + h;",
  "    });",
  "",
  "    //__SCENARIOS__",
  "",
  "    out.textContent = lines.join('\\n');",
  "  });",
  "})();"
].join("\n");

var SCEN = [
  "    var EU2 = '../Euclidean Algorithm/euclidean-algorithm.html?a=30&b=35';",
  "    var FT = '../Factor Tree/factor-tree.html?n=';",
  "",
  "    scenario('S2 two-overlap-top-dblclick', function(){",
  "      var g = chip('venn-composite-dynamic', 'overlap');",
  "      reset(g);",
  "      ev(g, 'mouseenter'); ev(g, 'focus'); ev(g, 'dblclick');",
  "      var h = lastHref();",
  "      assert(h.indexOf('../Factor Tree/factor-tree.html?a=30&b=35') === 0, 'dblclick opened ' + h);",
  "      return 'opened ' + h;",
  "    });",
  "",
  "    scenario('S3 two-overlap-keyboard-then-mouse', function(){",
  "      var g = chip('venn-composite-dynamic', 'overlap');",
  "      var layer = document.getElementById('venn-preview');",
  "      reset(g);",
  "      ev(g, 'focus');",
  "      for (var i = 0; i < 5; i++) ev(g, 'ArrowDown');",
  "      assert(layer._npOffset === 206, 'offset after keys is ' + layer._npOffset + ', expected 206');",
  "      var first = layer.firstChild;",
  "      ev(g, 'mouseenter');",
  "      assert(layer._npOffset === 206, 'offset after mouseenter is ' + layer._npOffset + ', expected 206');",
  "      assert(layer.firstChild === first, 'mouseenter rebuilt the preview panel');",
  "      ev(g, 'dblclick');",
  "      var h = lastHref();",
  "      assert(h.indexOf(EU2) === 0, 'dblclick opened ' + h);",
  "      return 'offset 206 survived mouseenter, opened ' + h;",
  "    });",
  "",
  "    scenario('S4 two-overlap-hide-semantics', function(){",
  "      var g = chip('venn-composite-dynamic', 'overlap');",
  "      var layer = document.getElementById('venn-preview');",
  "      reset(g);",
  "      ev(g, 'mouseenter'); ev(g, 'wheel');",
  "      assert(layer._npOffset === 206, 'offset after wheel is ' + layer._npOffset + ', expected 206');",
  "      ev(g, 'mouseleave');",
  "      assert(layer.childNodes.length === 0, 'mouseleave left ' + layer.childNodes.length + ' child nodes');",
  "      assert(layer._npOwner === null, 'owner after mouseleave is not null');",
  "      assert(layer._npOffset === 0, 'offset after mouseleave is ' + layer._npOffset);",
  "      ev(g, 'mouseenter');",
  "      assert(layer._npOffset === 0, 'fresh hover offset is ' + layer._npOffset + ', expected 0');",
  "      ev(g, 'mouseleave');",
  "      ev(g, 'focus'); ev(g, 'blur');",
  "      assert(layer.childNodes.length === 0, 'blur left ' + layer.childNodes.length + ' child nodes');",
  "      return 'hide resets owner/offset/children; fresh hover starts at 0';",
  "    });",
  "",
  "    scenario('S5 three-pairwise-scrolled-focus-dblclick', function(){",
  "      var g = chip('venn3-composite-dynamic', 'ab');",
  "      var layer = document.getElementById('venn3-preview');",
  "      reset(g);",
  "      ev(g, 'mouseenter'); ev(g, 'wheel');",
  "      assert(layer._npOffset === 206, 'offset after wheel is ' + layer._npOffset + ', expected 206');",
  "      var first = layer.firstChild;",
  "      ev(g, 'focus');",
  "      assert(layer._npOffset === 206, 'offset after focus is ' + layer._npOffset + ', expected 206');",
  "      assert(layer.firstChild === first, 'focus rebuilt the preview panel');",
  "      ev(g, 'dblclick');",
  "      var h = lastHref();",
  "      assert(h.indexOf('../Euclidean Algorithm/euclidean-algorithm.html?a=') === 0, 'dblclick opened ' + h);",
  "      return 'offset 206 survived focus, opened ' + h;",
  "    });",
  "",
  "    scenario('S6 three-centre-single-section', function(){",
  "      var g = chip('venn3-composite-dynamic', 'abc');",
  "      var layer = document.getElementById('venn3-preview');",
  "      reset(g);",
  "      ev(g, 'mouseenter');",
  "      assert(layer.childNodes.length > 0, 'centre preview not shown');",
  "      ev(g, 'wheel');",
  "      assert(layer._npOffset === 0, 'offset after wheel is ' + layer._npOffset + ', expected 0');",
  "      var first = layer.firstChild;",
  "      ev(g, 'focus');",
  "      assert(layer.firstChild === first, 'focus rebuilt the centre preview panel');",
  "      ev(g, 'dblclick');",
  "      var h = lastHref();",
  "      assert(h.indexOf(FT) === 0, 'dblclick opened ' + h);",
  "      return 'opened ' + h;",
  "    });",
  "",
  "    scenario('S7 lang-switch-replay', function(){",
  "      var old = chip('venn-composite-dynamic', 'overlap');",
  "      var layer = document.getElementById('venn-preview');",
  "      reset(old);",
  "      ev(old, 'mouseenter');",
  "      NT.i18n.setLang('de');",
  "      var g = chip('venn-composite-dynamic', 'overlap');",
  "      assert(g !== old, 'chip was not rebuilt by the language switch');",
  "      assert(layer.childNodes.length > 0, 'preview was not replayed after the language switch');",
  "      assert(layer._npOwner === g, 'owner is not the rebuilt chip');",
  "      ev(g, 'wheel'); ev(g, 'focus');",
  "      assert(layer._npOffset === 206, 'offset after wheel+focus is ' + layer._npOffset + ', expected 206');",
  "      ev(g, 'dblclick');",
  "      var h = lastHref();",
  "      assert(h.indexOf('../Euclidean Algorithm/euclidean-algorithm.html?') === 0 && h.indexOf('lang=de') >= 0, 'dblclick opened ' + h);",
  "      return 'replayed in de, offset 206 survived focus, opened ' + h;",
  "    });",
  "",
  "    scenario('S8 two-overlap-tree-preview', function(){",
  "      var g = chip('venn-composite-dynamic', 'overlap');",
  "      var layer = document.getElementById('venn-preview');",
  "      reset(g);",
  "      ev(g, 'mouseenter');",
  "      function label(c){ var t = c.nextElementSibling; return t ? t.textContent : ''; }",
  "      var nodes = Array.prototype.slice.call(layer.querySelectorAll('.ft-node'));",
  "      var roots = nodes.filter(function(c){ return c.classList.contains('root'); }).map(label);",
  "      var shared = nodes.filter(function(c){ return c.classList.contains('shared'); }).map(label);",
  "      assert(roots.join() === '30,35', 'preview roots are ' + roots.join());",
  "      assert(shared.join() === '5', 'shared circles are ' + shared.join());",
  "      var all = nodes.map(label);",
  "      assert(all.indexOf('6') >= 0 && all.indexOf('7') >= 0, 'rest branches 6 and 7 missing: ' + all.join());",
  "      assert(all.filter(function(v){ return v === '5'; }).length === 2, 'the shared 5 branch is drawn more than once: ' + all.join());",
  "      var caps = Array.prototype.slice.call(layer.querySelectorAll('.np-caption')).map(function(t){ return t.textContent; });",
  "      assert(caps[0] === 'gcd(30, 35) = 5', 'tree caption is ' + caps[0]);",
  "      var want = NT.i18n.translate('venn.label.overlapFactorTrees', { tool: NT.i18n.translate('site.nav.factorTree') });",
  "      assert(g.getAttribute('aria-label').indexOf(want) >= 0, 'chip label lacks the overlap target: ' + g.getAttribute('aria-label'));",
  "      reset(g);",
  "      var g3 = chip('venn3-composite-dynamic', 'ab');",
  "      ev(g3, 'mouseenter');",
  "      var l3 = document.getElementById('venn3-preview');",
  "      assert(l3.querySelectorAll('.ft-node.shared').length === 0 && l3.querySelectorAll('.ft-node.root').length === 1, 'three-circle ab preview changed');",
  "      reset(g3);",
  "      return 'A ∩ B preview draws 30 and 35 over one shared 5 (with 6 and 7 beside it), caption gcd(30, 35) = 5; three-circle chips unchanged';",
  "    });"
].join("\n");

function buildSite() {
  var siteRoot = harness.mkScratch("dn2-site-");
  fs.cpSync(path.join(ROOT, "assets"), path.join(siteRoot, "assets"), { recursive: true });
  var src = fs.readFileSync(path.join(ROOT, "Venn Diagram", "venn-diagram.html"), "utf8");
  var probe = PROBE_BODY.replace("//__SCENARIOS__", function () { return SCEN; });
  var markup = '<pre id="dn2-out"></pre>\n<script>\n' + probe + "\n</script>\n";
  var at = src.lastIndexOf("</body>");
  if (at < 0) throw new Error("no closing body tag in venn-diagram.html");
  var page = src.slice(0, at) + markup + src.slice(at);
  var destDir = path.join(siteRoot, "Venn Diagram");
  fs.mkdirSync(destDir, { recursive: true });
  var dest = path.join(destDir, "venn-diagram.html");
  fs.writeFileSync(dest, page);
  return dest;
}

function unescapeHtml(s) {
  return s.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, "&");
}

function runChrome(fileUrl) {
  var profileDir = harness.mkScratch("dn2-profile-");
  var args = [
    "--headless=new", "--disable-gpu", "--no-sandbox",
    "--user-data-dir=" + profileDir,
    "--virtual-time-budget=5000",
    "--window-size=1280,900",
    "--dump-dom",
    fileUrl
  ];
  var res = cp.spawnSync("google-chrome", args, {
    encoding: "utf8", maxBuffer: 200 * 1024 * 1024, timeout: 60000, env: harness.chromeEnv()
  });
  try { fs.rmSync(profileDir, { recursive: true, force: true }); } catch (e) { /* best effort */ }
  return res.stdout || "";
}

function main() {
  var page = buildSite();
  var dom = runChrome(url.pathToFileURL(page).href);
  var m = /<pre id="dn2-out"[^>]*>([\s\S]*?)<\/pre>/.exec(dom);
  if (!m) {
    console.log("FAIL: probe output <pre id=\"dn2-out\"> missing from the dumped DOM");
    process.exit(1);
  }
  var lines = unescapeHtml(m[1]).split("\n").filter(function (l) { return l.length > 0; });
  lines.forEach(function (l) { console.log(l); });
  var fails = lines.filter(function (l) { return /^FAIL/.test(l); }).length;
  var passes = lines.filter(function (l) { return /^PASS/.test(l); }).length;
  if (fails > 0 || passes !== EXPECTED) {
    console.log("DN2-PROBE FAIL (" + passes + " pass, " + fails + " fail, expected " + EXPECTED + " scenarios)");
    process.exit(1);
  }
  console.log("DN2-PROBE PASS (" + passes + " scenarios)");
  process.exit(0);
}

main();
