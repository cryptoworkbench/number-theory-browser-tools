"use strict";
/*
 * Dev-only regression probe for quick task 261009-c7x: the Venn Diagram's
 * Factor Tree hover miniature for an A ∩ B chip draws Factor Tree's gcd pair
 * (yellow a-panel, blue b-panel, green lens, equation lines). Never
 * referenced by any page. Node built-ins + the in-repo harness only.
 *
 *   node preview-probe.js [base|r1|...|all]   default: all
 *   node preview-probe.js --shots             day/night screenshots
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

var BASE_COMMIT = "06353c3";

/* ---------- in-page probe (serialised into the scratch page) ---------- */

function inPage(RUN, CASES) {
  var out = document.getElementById("c7x-out");
  var lines = [];
  var errors = [];
  window.addEventListener("error", function (e) { errors.push(String(e.message || e)); });

  function scenario(name, fn) {
    try { lines.push("PASS " + name + ": " + fn()); }
    catch (e) { lines.push("FAIL " + name + ": " + (e && e.message ? e.message : e)); }
  }
  function assert(cond, msg) { if (!cond) throw new Error(msg); }
  function ev(el, type) {
    var e;
    if (type === "focus" || type === "blur") e = new FocusEvent(type);
    else e = new MouseEvent(type);
    el.dispatchEvent(e);
  }
  function chip(host, region) {
    var el = document.querySelector("#" + host + ' [data-region="' + region + '"]');
    assert(el, "chip not found: " + host + " " + region);
    return el;
  }
  function reset(el) { ev(el, "mouseleave"); ev(el, "blur"); }
  function hover(host, region) {
    var el = chip(host, region);
    reset(el);
    ev(el, "mouseenter");
    return el;
  }
  function all(layer, sel) { return Array.prototype.slice.call(layer.querySelectorAll(sel)); }
  function one(layer, sel) {
    var found = all(layer, sel);
    assert(found.length === 1, "expected exactly one " + sel + ", found " + found.length);
    return found[0];
  }
  function rectOf(el) {
    var b = el.getBBox();
    return { x0: b.x, y0: b.y, x1: b.x + b.width, y1: b.y + b.height };
  }
  function near(a, b, tol) { return Math.abs(a - b) <= (tol === undefined ? 0.5 : tol); }
  function sameRect(a, b, tol) {
    return near(a.x0, b.x0, tol) && near(a.y0, b.y0, tol) && near(a.x1, b.x1, tol) && near(a.y1, b.y1, tol);
  }
  function inside(inner, outer, tol) {
    var t = tol === undefined ? 0.01 : tol;
    return inner.x0 >= outer.x0 - t && inner.x1 <= outer.x1 + t && inner.y0 >= outer.y0 - t && inner.y1 <= outer.y1 + t;
  }
  function label(c) { var t = c.nextElementSibling; return t ? t.textContent : ""; }
  function circleCentre(c) { return { x: parseFloat(c.getAttribute("cx")), y: parseFloat(c.getAttribute("cy")) }; }
  function centreIn(c, r) {
    var p = circleCentre(c);
    return p.x >= r.x0 && p.x <= r.x1 && p.y >= r.y0 && p.y <= r.y1;
  }
  function circleByLabel(layer, text, sel) {
    var found = all(layer, sel || ".ft-node").filter(function (c) { return label(c) === text; });
    assert(found.length >= 1, "no circle labelled " + text);
    return found;
  }
  function captions(layer) { return all(layer, ".np-caption").map(function (t) { return t.textContent; }); }
  function panelOrigin(layer) {
    var p = layer.querySelector(".np-panel");
    assert(p, "no .np-panel");
    return { x: parseFloat(p.getAttribute("x")), y: parseFloat(p.getAttribute("y")) };
  }
  function cs(el, prop) { return getComputedStyle(el)[prop]; }

  // Reference element carrying an arbitrary style expression, appended to the
  // layer so it resolves the same custom properties the preview does.
  function refStyle(layer, props) {
    var ref = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    ref.setAttribute("style", props);
    layer.appendChild(ref);
    var res = { fill: cs(ref, "fill"), stroke: cs(ref, "stroke") };
    layer.removeChild(ref);
    return res;
  }

  // P1: one of each pair panel, all before the first edge.
  function checkPanels(layer) {
    var a = one(layer, ".ft-pair-a"), b = one(layer, ".ft-pair-b"), lens = one(layer, ".ft-pair-lens");
    var edge = layer.querySelector(".ft-edge");
    var order = all(layer, "*");
    if (edge) {
      var ei = order.indexOf(edge);
      assert(order.indexOf(a) < ei && order.indexOf(b) < ei && order.indexOf(lens) < ei,
        "a pair panel is drawn after the first edge");
    }
    return { a: a, b: b, lens: lens };
  }
  // P3: lens = intersection of the two panels, inset by 1.
  function checkLens(p) {
    var ra = rectOf(p.a), rb = rectOf(p.b), rl = rectOf(p.lens);
    var want = {
      x0: Math.max(ra.x0, rb.x0) + 1, y0: Math.max(ra.y0, rb.y0) + 1,
      x1: Math.min(ra.x1, rb.x1) - 1, y1: Math.min(ra.y1, rb.y1) - 1
    };
    assert(sameRect(rl, want), "lens " + JSON.stringify(rl) + " != inset intersection " + JSON.stringify(want));
    return { ra: ra, rb: rb, rl: rl };
  }
  // P4: everything inside the section's tree box, clear of the first caption.
  function checkFit(layer) {
    var o = panelOrigin(layer);
    var xLo = o.x + 10 - 0.5, xHi = o.x + 258 + 0.5, yLo = o.y + 22 - 0.5;
    var items = all(layer, ".ft-pair, .ft-pair-lens, .ft-node, .ft-edge");
    var maxBottom = -Infinity;
    items.forEach(function (el) {
      var r = rectOf(el);
      assert(r.x0 >= xLo && r.x1 <= xHi && r.y0 >= yLo,
        el.getAttribute("class") + " leaves the tree box: " + JSON.stringify(r));
      if (r.y1 > maxBottom) maxBottom = r.y1;
    });
    // The tree caption block is the first section's np-caption run: the
    // first np-caption in document order starts it.
    var caps = all(layer, ".np-caption");
    var firstTop = rectOf(caps[0]).y0;
    assert(maxBottom <= firstTop + 0.01, "drawing bottom " + maxBottom + " reaches caption top " + firstTop);
    return "all " + items.length + " drawn items inside the box, bottom " + maxBottom.toFixed(1) + " <= caption top " + firstTop.toFixed(1);
  }
  function checkCaptionStep(layer, treeLines) {
    var ys = all(layer, ".np-caption").slice(0, treeLines).map(function (t) { return parseFloat(t.getAttribute("y")); });
    for (var i = 1; i < ys.length; i++) assert(near(ys[i] - ys[i - 1], 14, 0.001), "caption step is " + (ys[i] - ys[i - 1]));
  }

  var P = {
    // ---- helpers shared with later runs
    scenario: scenario, assert: assert, hover: hover, reset: reset, all: all, one: one,
    rectOf: rectOf, sameRect: sameRect, inside: inside, label: label, centreIn: centreIn,
    circleByLabel: circleByLabel, captions: captions, cs: cs, refStyle: refStyle, near: near,
    checkPanels: checkPanels, checkLens: checkLens, checkFit: checkFit, checkCaptionStep: checkCaptionStep,
    circleCentre: circleCentre, chip: chip, ev: ev, errors: errors
  };

  window.addEventListener("load", function () {
    CASES[RUN](P);
    scenario("Z no-errors", function () {
      assert(errors.length === 0, "page errors: " + errors.join(" | "));
      return "no page errors";
    });
    out.textContent = lines.join("\n");
  });
}

/* ---------- run bodies (also serialised into the page) ---------- */

var CASES = {
  base: function (P) {
    // Serialise the three single-value / centre previews, for byte identity
    // with the baseline commit.
    P.scenario("B0 serialise-single-previews", function () {
      var parts = [];
      [["venn-circles-dynamic", "circle-a", "venn-circles-preview"],
       ["venn-circles-dynamic", "circle-b", "venn-circles-preview"],
       ["venn3-composite-dynamic", "abc", "venn3-preview"]].forEach(function (c) {
        P.hover(c[0], c[1]);
        var layer = document.getElementById(c[2]);
        P.assert(layer.childNodes.length > 0, "no preview for " + c[1]);
        parts.push(c[1] + "\n" + layer.outerHTML);
        P.reset(P.chip(c[0], c[1]));
      });
      document.getElementById("c7x-ser").textContent = parts.join("\n----\n");
      return "serialised " + parts.length + " layers";
    });
  },

  r1: function (P) {
    var layer = document.getElementById("venn-preview");
    P.hover("venn-composite-dynamic", "overlap");
    var panels;

    P.scenario("P1 panels", function () {
      panels = P.checkPanels(layer);
      return "one ft-pair-a, ft-pair-b, ft-pair-lens, all before the first edge";
    });
    P.scenario("P2 per-side", function () {
      var ra = P.rectOf(panels.a), rb = P.rectOf(panels.b), rl = P.rectOf(panels.lens);
      var r30 = P.circleByLabel(layer, "30", ".ft-node.root")[0];
      var r35 = P.circleByLabel(layer, "35", ".ft-node.root")[0];
      P.assert(P.centreIn(r30, ra) && !P.centreIn(r30, rb), "30 is not on the yellow panel alone");
      P.assert(P.centreIn(r35, rb) && !P.centreIn(r35, ra), "35 is not on the blue panel alone");
      P.assert(!P.centreIn(P.circleByLabel(layer, "6")[0], rb), "6 is inside the blue panel");
      P.assert(!P.centreIn(P.circleByLabel(layer, "7")[0], ra), "7 is inside the yellow panel");
      var shared = P.one(layer, ".ft-node.shared");
      P.assert(P.label(shared) === "5", "shared circle is " + P.label(shared));
      P.assert(P.inside(P.rectOf(shared), rl), "shared 5 is not inside the lens");
      return "30 yellow only, 35 blue only, 6 off blue, 7 off yellow, shared 5 in the lens";
    });
    P.scenario("P3 lens", function () {
      P.checkLens(panels);
      return "lens is the inset intersection";
    });
    P.scenario("P4 fit", function () {
      var msg = P.checkFit(layer);
      P.checkCaptionStep(layer, 3);
      return msg;
    });
    P.scenario("P5 captions", function () {
      var caps = P.captions(layer).join(" | ");
      var want = "30 = 6 × 5 | 35 = 5 × 7 | gcd(30, 35) = 5 | gcd(30, 35) = 5";
      P.assert(caps === want, "captions are: " + caps);
      return caps;
    });
    P.scenario("P6 tints", function () {
      var ya = P.refStyle(layer, "fill:color-mix(in srgb, var(--role-active) 28%, var(--surface));stroke:var(--role-active)");
      var yb = P.refStyle(layer, "fill:color-mix(in srgb, var(--role-input) 28%, var(--surface));stroke:var(--role-input)");
      var yl = P.refStyle(layer, "fill:color-mix(in srgb, var(--role-result) 28%, var(--surface));stroke:none");
      var a = panels.a, b = panels.b, l = panels.lens;
      P.assert(P.cs(a, "fill") === ya.fill && P.cs(a, "stroke") === ya.stroke, "yellow panel colours differ");
      P.assert(P.cs(b, "fill") === yb.fill && P.cs(b, "stroke") === yb.stroke, "blue panel colours differ");
      P.assert(P.cs(l, "fill") === yl.fill && P.cs(l, "stroke") === yl.stroke, "lens colours differ");
      return "panel and lens colours equal the Factor Tree expressions";
    });
    P.scenario("P7 single", function () {
      P.reset(P.chip("venn-composite-dynamic", "overlap"));
      P.hover("venn-circles-dynamic", "circle-a");
      var l = document.getElementById("venn-circles-preview");
      P.assert(P.all(l, ".ft-pair-a, .ft-pair-b, .ft-pair-lens").length === 0, "pair panels leaked into the single preview");
      var caps = P.captions(l);
      var treeCaps = P.all(l, ".np-caption").map(function (t) { return t.textContent; });
      P.assert(caps.length === 1 && treeCaps[0] === "2 * 3 * 5 = 30", "single captions are: " + caps.join(" | "));
      P.assert(P.all(l, ".ft-node.one").length >= 1, "no 1 circle in the single preview");
      return "no panels, caption " + caps[0];
    });
  }
};

var RUN_ORDER = ["base", "r1"];
var RUN_QUERY = {
  base: "?a=30&b=35&lang=en",
  r1: "?a=30&b=35&lang=en"
};
var EXPECT = {
  base: ["B0", "Z"],
  r1: ["P1", "P2", "P3", "P4", "P5", "P6", "P7", "Z"]
};

/* ---------- node-side runner ---------- */

function fnSource(fn) { return fn.toString(); }

function buildPage(srcHtml, run, extra) {
  var siteRoot = harness.mkScratch("c7x-site-");
  fs.cpSync(path.join(ROOT, "assets"), path.join(siteRoot, "assets"), { recursive: true });
  var casesSrc = "{" + Object.keys(CASES).map(function (k) { return JSON.stringify(k) + ":" + fnSource(CASES[k]); }).join(",") + "}";
  var script = "(" + fnSource(inPage) + ")(" + JSON.stringify(run) + "," + casesSrc + ");";
  var markup = '<pre id="c7x-out"></pre>\n<pre id="c7x-ser"></pre>\n<script>\n' + script + "\n</script>\n" + (extra || "");
  var at = srcHtml.lastIndexOf("</body>");
  if (at < 0) throw new Error("no closing body tag in the page");
  var page = srcHtml.slice(0, at) + markup + srcHtml.slice(at);
  var destDir = path.join(siteRoot, "Venn Diagram");
  fs.mkdirSync(destDir, { recursive: true });
  var dest = path.join(destDir, "venn-diagram.html");
  fs.writeFileSync(dest, page);
  return dest;
}

function unescapeHtml(s) {
  return s.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, "&");
}

function runChrome(fileUrl, extraArgs) {
  var profileDir = harness.mkScratch("c7x-profile-");
  var args = [
    "--headless=new", "--disable-gpu", "--no-sandbox",
    "--user-data-dir=" + profileDir
  ].concat(extraArgs || [
    "--virtual-time-budget=5000", "--window-size=1280,900", "--dump-dom"
  ]).concat([fileUrl]);
  var res = cp.spawnSync("google-chrome", args, {
    encoding: "utf8", maxBuffer: 200 * 1024 * 1024, timeout: 90000, env: harness.chromeEnv()
  });
  try { fs.rmSync(profileDir, { recursive: true, force: true }); } catch (e) { /* best effort */ }
  return res.stdout || "";
}

function grabPre(dom, id) {
  var m = new RegExp('<pre id="' + id + '"[^>]*>([\\s\\S]*?)</pre>').exec(dom);
  return m ? unescapeHtml(m[1]) : null;
}

function worktreeHtml() {
  // C7X_PAGE=baseline self-tests the probe against the pre-change page.
  if (process.env.C7X_PAGE === "baseline") return baselineHtml();
  return fs.readFileSync(path.join(ROOT, "Venn Diagram", "venn-diagram.html"), "utf8");
}
function baselineHtml() {
  var res = cp.spawnSync("git", ["show", BASE_COMMIT + ":Venn Diagram/venn-diagram.html"], {
    cwd: ROOT, encoding: "utf8", maxBuffer: 64 * 1024 * 1024
  });
  if (res.status !== 0) throw new Error("git show " + BASE_COMMIT + " failed: " + res.stderr);
  return res.stdout;
}

function pageUrl(file, query) { return url.pathToFileURL(file).href + query; }

function runOne(run, html) {
  var file = buildPage(html, run);
  var dom = runChrome(pageUrl(file, RUN_QUERY[run]));
  var out = grabPre(dom, "c7x-out");
  if (out === null) return { lines: ["FAIL " + run + ": probe output <pre id=\"c7x-out\"> missing from the dumped DOM"], ser: "" };
  return {
    lines: out.split("\n").filter(function (l) { return l.length > 0; }),
    ser: grabPre(dom, "c7x-ser") || "",
    dom: dom
  };
}

function checkExpected(run, lines) {
  var missing = [];
  EXPECT[run].forEach(function (id) {
    var re = new RegExp("^(PASS|FAIL) " + id + "[ :]");
    if (!lines.some(function (l) { return re.test(l); })) missing.push(id);
  });
  return missing;
}

function main() {
  var argv = process.argv.slice(2);
  if (argv[0] === "--shots") return shots();
  var sel = argv[0] || "all";
  var runs = sel === "all" ? RUN_ORDER : [sel];
  runs.forEach(function (r) { if (RUN_ORDER.indexOf(r) < 0) { console.log("unknown run " + r); process.exit(2); } });

  var passes = 0, fails = 0, incomplete = 0;
  runs.forEach(function (run) {
    console.log("== " + run);
    var res = runOne(run, worktreeHtml());
    var lines = res.lines;
    if (run === "base") {
      var old = runOne(run, baselineHtml());
      var same = res.ser.length > 0 && res.ser === old.ser;
      lines = lines.concat([same
        ? "PASS B1 single-path-identity: single-value and centre previews are byte-identical to " + BASE_COMMIT + " (" + res.ser.length + " chars)"
        : "FAIL B1 single-path-identity: preview markup differs from " + BASE_COMMIT]);
      if (!same && res.ser && old.ser) {
        var i = 0; while (i < res.ser.length && res.ser[i] === old.ser[i]) i++;
        lines.push("FAIL B1 detail: first difference at " + i + ": new ..." + res.ser.slice(Math.max(0, i - 60), i + 80) + " | old ..." + old.ser.slice(Math.max(0, i - 60), i + 80));
      }
      lines = lines.concat(old.lines.filter(function (l) { return /^FAIL/.test(l); }).map(function (l) { return "FAIL baseline-run " + l; }));
    }
    lines.forEach(function (l) { console.log(l); });
    passes += lines.filter(function (l) { return /^PASS/.test(l); }).length;
    fails += lines.filter(function (l) { return /^FAIL/.test(l); }).length;
    var exp = EXPECT[run].concat(run === "base" ? ["B1"] : []);
    var missing = exp.filter(function (id) { return !lines.some(function (l) { return new RegExp("^(PASS|FAIL) " + id + "[ :]").test(l); }); });
    if (missing.length) { incomplete += missing.length; console.log("FAIL " + run + ": scenarios did not report: " + missing.join(", ")); }
  });

  if (fails > 0 || incomplete > 0) {
    console.log("C7X-PROBE FAIL (" + passes + " pass, " + fails + " fail, " + incomplete + " unreported)");
    process.exit(1);
  }
  console.log("C7X-PROBE PASS (" + passes + " scenarios)");
  process.exit(0);
}

function shots() {
  console.log("--shots not implemented yet");
  process.exit(1);
}

main();
