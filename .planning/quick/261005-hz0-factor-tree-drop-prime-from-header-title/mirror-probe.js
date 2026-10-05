"use strict";
/*
 * Dev-only regression probe for quick task 261005-hz0: the Factor Tree header
 * reads the plain tool name in sixteen languages, and a fully grown tree
 * shows a dashed vertical mirror line through every two-child circle;
 * clicking such a circle mirrors its branch. Never referenced by any page.
 * Node built-ins + the in-repo harness only.
 *
 * Copies assets/ and the Factor Tree page into a scratch site, injects a
 * probe script that drives the page in headless Chrome, and reads PASS/FAIL
 * lines back from a <pre>.
 */

var fs = require("fs");
var path = require("path");
var cp = require("child_process");
var url = require("url");
var vm = require("vm");

var ROOT = path.resolve(__dirname, "..", "..", "..");
var harness = require(path.join(ROOT, ".planning", "phases", "07-shared-js-module-refactor", "harness.js"));

var EXPECTED = 10;

var LANGS = ["nl", "en", "de", "fr", "es", "it", "pl", "pt-BR", "pt-PT", "sv", "nb", "ro", "hu", "lv", "ru", "el"];

/* ---------- node-side scenarios ---------- */

function loadDicts() {
  var dicts = {};
  var ctx = { NT: { i18n: { register: function (ns, dict) { dicts[ns] = dict; } } } };
  ["site.js", "factor-tree.js"].forEach(function (f) {
    vm.runInNewContext(fs.readFileSync(path.join(ROOT, "assets", "i18n", f), "utf8"), ctx, { filename: f });
  });
  return dicts;
}

function nodeScenario(name, fn) {
  try { console.log("PASS " + name + ": " + fn()); return 1; }
  catch (e) { console.log("FAIL " + name + ": " + (e && e.message ? e.message : e)); return 0; }
}

function nodeAssert(cond, msg) { if (!cond) throw new Error(msg); }

function runNodeScenarios() {
  var dicts = loadDicts();
  var pass = 0;
  pass += nodeScenario("N1 title-heading-catalog", function () {
    LANGS.forEach(function (l) {
      var nav = dicts.site[l]["nav.factorTree"];
      nodeAssert(nav, l + " has no site.nav.factorTree");
      nodeAssert(dicts.factorTree[l].title === nav, l + " title is " + dicts.factorTree[l].title + ", expected " + nav);
      nodeAssert(dicts.factorTree[l].heading === nav, l + " heading is " + dicts.factorTree[l].heading + ", expected " + nav);
    });
    return "16 languages: title === heading === site.nav.factorTree";
  });
  pass += nodeScenario("N2 mirror-label-catalog", function () {
    var en = dicts.factorTree.en.mirrorLabel;
    LANGS.forEach(function (l) {
      var v = dicts.factorTree[l].mirrorLabel;
      nodeAssert(typeof v === "string" && v.length > 0, l + " mirrorLabel missing");
      nodeAssert(v.indexOf("{n}") >= 0, l + " mirrorLabel lacks {n}");
      if (l !== "en") nodeAssert(v !== en, l + " mirrorLabel equals the English text");
    });
    return "16 languages carry a translated mirrorLabel with {n}";
  });
  pass += nodeScenario("N3 static-fallback", function () {
    var src = fs.readFileSync(path.join(ROOT, "Factor Tree", "factor-tree.html"), "utf8");
    nodeAssert(/<title data-i18n="factorTree\.title">Factor Tree<\/title>/.test(src), "<title> fallback is not exactly Factor Tree");
    nodeAssert(/<h1 data-i18n="factorTree\.heading">Factor Tree<\/h1>/.test(src), "<h1> fallback is not exactly Factor Tree");
    return "<title> and <h1> fallbacks read Factor Tree";
  });
  return pass;
}

/* ---------- in-page probe (serialised into the scratch page) ---------- */

function inPage(cfg) {
  var out = document.getElementById("hz0-out");
  var lines = [];
  var EPS = 0.01;

  function emit(line) { lines.push(line); out.textContent = lines.join("\n"); }
  function assert(cond, msg) { if (!cond) throw new Error(msg); }
  function near(a, b) { return Math.abs(a - b) <= EPS; }
  function sleep(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
  function waitFor(cond, ms) {
    return new Promise(function (resolve, reject) {
      var waited = 0;
      (function poll() {
        var v;
        try { v = cond(); } catch (e) { v = false; }
        if (v) return resolve(v);
        if (waited >= ms) return reject(new Error("timed out after " + ms + " ms"));
        waited += 100;
        setTimeout(poll, 100);
      })();
    });
  }

  var svg = function () { return document.querySelector(".tree-svg"); };
  var circles = function () { return Array.prototype.slice.call(document.querySelectorAll(".node-circle")); };
  var axes = function () { return Array.prototype.slice.call(document.querySelectorAll(".mirror-axis")); };
  var twoChild = function () { return Array.prototype.slice.call(document.querySelectorAll(".node-circle.root, .node-circle.internal")); };
  var num = function (el, a) { return parseFloat(el.getAttribute(a)); };

  function positions() { return circles().map(function (c) { return num(c, "cx"); }); }
  function labelOf(c) {
    var n = c.nextElementSibling;
    while (n && n.tagName.toLowerCase() !== "text") n = n.nextElementSibling;
    return n ? n.textContent : "";
  }
  function circleAt(x, y) {
    var cs = circles();
    for (var i = 0; i < cs.length; i++) {
      if (near(num(cs[i], "cx"), x) && near(num(cs[i], "cy"), y)) return i;
    }
    return -1;
  }
  // parent index -> [child indices], built from the edge endpoints
  function structure() {
    var map = {};
    Array.prototype.slice.call(document.querySelectorAll(".edge-line")).forEach(function (e) {
      var a = circleAt(num(e, "x1"), num(e, "y1"));
      var b = circleAt(num(e, "x2"), num(e, "y2"));
      assert(a >= 0 && b >= 0, "an edge endpoint is not on a circle centre");
      (map[a] = map[a] || []).push(b);
    });
    return map;
  }
  function coherent() {
    var cs = circles();
    var st = structure();
    var width = num(svg(), "width");
    Object.keys(st).forEach(function (p) {
      assert(st[p].length === 2, "parent " + p + " has " + st[p].length + " edges");
      var mean = (num(cs[st[p][0]], "cx") + num(cs[st[p][1]], "cx")) / 2;
      assert(near(num(cs[p], "cx"), mean), "parent " + p + " is not midway between its children");
    });
    axes().forEach(function (a) {
      var c = a.previousElementSibling;
      assert(c && c.classList.contains("node-circle"), "an axis does not follow its circle");
      assert(near(num(a, "x1"), num(c, "cx")) && near(num(a, "x2"), num(c, "cx")), "an axis is off its circle's centre");
    });
    cs.forEach(function (c) {
      var x = num(c, "cx");
      assert(x >= 0 && x <= width, "a circle left the canvas: cx " + x);
    });
    return true;
  }
  function descendants(st, i, acc) {
    (st[i] || []).forEach(function (c) { acc.push(c); descendants(st, c, acc); });
    return acc;
  }
  function ancestors(st, i) {
    var acc = [];
    var cur = i;
    var again = true;
    while (again) {
      again = false;
      Object.keys(st).forEach(function (p) {
        if (st[p].indexOf(cur) >= 0) { acc.push(+p); cur = +p; again = true; }
      });
    }
    return acc;
  }
  function click(c) { c.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true })); }
  function reducedMotion() {
    return !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }
  function mirroredAbout(oldPos, newPos, ref, indices) {
    indices.forEach(function (i) {
      var want = -(oldPos[i] - oldPos[ref]);
      var got = newPos[i] - newPos[ref];
      assert(near(got, want), "circle " + i + " offset " + got + " expected " + want);
    });
  }
  function samePositions(a, b, label) {
    a.forEach(function (x, i) { assert(near(x, b[i]), label + ": circle " + i + " at " + b[i] + ", expected " + x); });
  }

  var steps = [];
  function step(name, fn) { steps.push({ name: name, fn: fn }); }
  var armedBaseline = null;
  var enLabel = null;

  step("C1 hidden-while-growing", function () {
    assert(axes().length === 0, "mirror axes exist before the tree has grown");
    circles().forEach(function (c) { assert(!c.hasAttribute("tabindex"), "a circle is focusable before growth"); });
    return "no axes, nothing focusable at load";
  });

  step("C2 header-all-langs", function () {
    assert(document.querySelector("h1").textContent === "Factor Tree", "h1 is " + document.querySelector("h1").textContent);
    assert(document.title === "Factor Tree", "document.title is " + document.title);
    var n = 0;
    NT.i18n.SUPPORTED_LANGS.forEach(function (code) {
      NT.i18n.setLang(code);
      var want = NT.i18n.translate("site.nav.factorTree");
      assert(document.querySelector("h1").textContent === want, code + " h1 is " + document.querySelector("h1").textContent + ", expected " + want);
      assert(document.title === want, code + " title is " + document.title + ", expected " + want);
      n++;
    });
    NT.i18n.setLang("en");
    assert(n === 16, "checked " + n + " languages");
    return "h1 and tab title equal site.nav.factorTree in 16 languages";
  });

  step("C3 armed", function () {
    return waitFor(function () { return axes().length > 0; }, 8000).then(function () {
      var tc = twoChild();
      assert(tc.length > 0, "no two-child circles");
      assert(axes().length === tc.length, axes().length + " axes for " + tc.length + " two-child circles");
      tc.forEach(function (c) {
        var a = c.nextElementSibling;
        assert(a && a.classList.contains("mirror-axis"), "axis is not the circle's next sibling");
        var cx = num(c, "cx"), cy = num(c, "cy"), r = num(c, "r");
        assert(near(num(a, "x1"), cx) && near(num(a, "x2"), cx), "axis is not vertical through the centre");
        assert(num(a, "y1") < cy - r && num(a, "y2") > cy + r, "axis does not extend past the circle");
        var cs = getComputedStyle(a);
        assert(cs.strokeDasharray && cs.strokeDasharray !== "none", "axis is not dashed");
        assert(cs.pointerEvents === "none", "axis takes pointer events");
        assert(c.getAttribute("tabindex") === "0", "circle tabindex is " + c.getAttribute("tabindex"));
        assert(c.getAttribute("role") === "button", "circle role is " + c.getAttribute("role"));
        assert(c.getAttribute("aria-pressed") === "false", "circle aria-pressed is " + c.getAttribute("aria-pressed"));
        var t = c.querySelector("title");
        var want = NT.i18n.translate("factorTree.mirrorLabel", { n: labelOf(c) });
        assert(t && t.textContent === want, "title is " + (t && t.textContent) + ", expected " + want);
        if (c.classList.contains("root")) enLabel = t.textContent;
      });
      Array.prototype.slice.call(document.querySelectorAll(".node-circle.prime-leaf, .node-circle.one")).forEach(function (c) {
        assert(!c.hasAttribute("tabindex"), "a leaf circle is focusable");
        var nx = c.nextElementSibling;
        assert(!(nx && nx.classList.contains("mirror-axis")), "a leaf circle has an axis");
      });
      armedBaseline = positions();
      return tc.length + " axes, one per two-child circle; buttons labelled; leaves plain";
    });
  });

  step("C4 root-mirror", function () {
    var root = document.querySelector(".node-circle.root");
    var old = positions();
    var ri = circles().indexOf(root);
    click(root);
    if (!reducedMotion()) samePositions(old, positions(), "immediately after the click");
    return sleep(1500).then(function () {
      var now = positions();
      var all = old.map(function (_, i) { return i; });
      mirroredAbout(old, now, ri, all);
      var moved = now.some(function (x, i) { return Math.abs(x - old[i]) > 1; });
      assert(moved, "no circle moved");
      assert(root.getAttribute("aria-pressed") === "true", "root aria-pressed is " + root.getAttribute("aria-pressed"));
      coherent();
      return "whole tree mirrored about the root, coherent";
    });
  });

  step("C5 root-restore", function () {
    var root = document.querySelector(".node-circle.root");
    click(root);
    return sleep(1500).then(function () {
      samePositions(armedBaseline, positions(), "after restore");
      assert(root.getAttribute("aria-pressed") === "false", "root aria-pressed is " + root.getAttribute("aria-pressed"));
      return "second click restores the original layout";
    });
  });

  step("C6 branch-mirror", function () {
    var cs = circles();
    var nIdx = -1;
    cs.forEach(function (c, i) { if (c.classList.contains("internal") && labelOf(c) === "30") nIdx = i; });
    assert(nIdx >= 0, "no internal circle labelled 30");
    var st = structure();
    var D = descendants(st, nIdx, []);
    var A = ancestors(st, nIdx);
    var O = cs.map(function (_, i) { return i; }).filter(function (i) { return i !== nIdx && D.indexOf(i) < 0 && A.indexOf(i) < 0; });
    assert(D.length >= 2, "only " + D.length + " descendants");
    assert(O.length >= 1, "no outside circles");
    var old = positions();
    click(cs[nIdx]);
    return sleep(1500).then(function () {
      var now = positions();
      mirroredAbout(old, now, nIdx, D);
      O.forEach(function (i) { assert(near(old[i], now[i]), "outside circle " + i + " moved"); });
      assert(cs[nIdx].getAttribute("aria-pressed") === "true", "30 aria-pressed is " + cs[nIdx].getAttribute("aria-pressed"));
      coherent();
      click(cs[nIdx]);
      return sleep(1500).then(function () {
        samePositions(old, positions(), "after restoring 30");
        return D.length + " descendants mirrored, " + O.length + " outside circles still, restored on second click";
      });
    });
  });

  step("C7 leaves-inert", function () {
    var leaf = document.querySelector(".node-circle.prime-leaf");
    var one = document.querySelector(".node-circle.one");
    assert(leaf && one, "no leaf or 1 circle");
    var old = positions();
    click(leaf);
    click(one);
    return sleep(1500).then(function () {
      samePositions(old, positions(), "after clicking leaves");
      return "prime leaf and 1 do nothing";
    });
  });

  //__MORE_STEPS__

  var chain = Promise.resolve();
  window.addEventListener("load", function () {
    // C1 must observe the page before growth completes, so run it synchronously
    // here (this listener runs after the page's own load handler).
    var first = steps[0];
    try { emit("PASS " + first.name + ": " + first.fn()); }
    catch (e) { emit("FAIL " + first.name + ": " + (e && e.message ? e.message : e)); }
    steps.slice(1).forEach(function (s) {
      chain = chain.then(function () {
        return Promise.resolve().then(s.fn).then(
          function (msg) { emit("PASS " + s.name + ": " + msg); },
          function (e) { emit("FAIL " + s.name + ": " + (e && e.message ? e.message : e)); }
        );
      });
    });
  });
}

function buildSite() {
  var siteRoot = harness.mkScratch("hz0-site-");
  fs.cpSync(path.join(ROOT, "assets"), path.join(siteRoot, "assets"), { recursive: true });
  var src = fs.readFileSync(path.join(ROOT, "Factor Tree", "factor-tree.html"), "utf8");
  var probe = "(" + inPage.toString() + ")(" + JSON.stringify({}) + ");";
  var markup = '<pre id="hz0-out"></pre>\n<script>\n' + probe + "\n</script>\n";
  var at = src.lastIndexOf("</body>");
  if (at < 0) throw new Error("no closing body tag in factor-tree.html");
  var page = src.slice(0, at) + markup + src.slice(at);
  var destDir = path.join(siteRoot, "Factor Tree");
  fs.mkdirSync(destDir, { recursive: true });
  var dest = path.join(destDir, "factor-tree.html");
  fs.writeFileSync(dest, page);
  return dest;
}

function unescapeHtml(s) {
  return s.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, "&");
}

function runChrome(fileUrl, extraArgs) {
  var profileDir = harness.mkScratch("hz0-profile-");
  var args = [
    "--headless=new", "--disable-gpu", "--no-sandbox",
    "--user-data-dir=" + profileDir,
    "--virtual-time-budget=40000",
    "--window-size=1280,900"
  ].concat(extraArgs || [], ["--dump-dom", fileUrl]);
  var res = cp.spawnSync("google-chrome", args, {
    encoding: "utf8", maxBuffer: 200 * 1024 * 1024, timeout: 120000, env: harness.chromeEnv()
  });
  try { fs.rmSync(profileDir, { recursive: true, force: true }); } catch (e) { /* best effort */ }
  return res.stdout || "";
}

function runPage(page, extraArgs, tag) {
  var dom = runChrome(url.pathToFileURL(page).href + "?lang=en", extraArgs);
  var m = /<pre id="hz0-out"[^>]*>([\s\S]*?)<\/pre>/.exec(dom);
  if (!m) {
    console.log("FAIL " + tag + ": probe output <pre id=\"hz0-out\"> missing from the dumped DOM");
    return { pass: 0, fail: 1 };
  }
  var lines = unescapeHtml(m[1]).split("\n").filter(function (l) { return l.length > 0; });
  lines.forEach(function (l) { console.log(tag + l); });
  return {
    pass: lines.filter(function (l) { return /^PASS/.test(l); }).length,
    fail: lines.filter(function (l) { return /^FAIL/.test(l); }).length
  };
}

function main() {
  var pass = runNodeScenarios();
  var fail = EXPECTED_NODE() - pass;
  var page = buildSite();
  var r = runPage(page, [], "");
  pass += r.pass;
  fail += r.fail;
  if (fail > 0 || pass !== EXPECTED) {
    console.log("HZ0-PROBE FAIL (" + pass + " pass, " + fail + " fail, expected " + EXPECTED + " scenarios)");
    process.exit(1);
  }
  console.log("HZ0-PROBE PASS (" + pass + " scenarios)");
  process.exit(0);
}

function EXPECTED_NODE() { return 3; }

main();
