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

var EXPECTED = 1;

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

function buildSite() {
  var siteRoot = harness.mkScratch("dn2-site-");
  fs.cpSync(path.join(ROOT, "assets"), path.join(siteRoot, "assets"), { recursive: true });
  var src = fs.readFileSync(path.join(ROOT, "Venn Diagram", "venn-diagram.html"), "utf8");
  var markup = '<pre id="dn2-out"></pre>\n<script>\n' + PROBE_BODY + "\n</script>\n";
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
