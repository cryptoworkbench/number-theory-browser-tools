"use strict";
/*
 * Dev-only regression probe for quick task 261009-d21: the Cyclic Groups
 * necklace tool. Never referenced by any page. Node built-ins + the in-repo
 * harness only.
 *
 *   node cyclic-probe.js [t1|t2|t3|all]    default: all
 *   node cyclic-probe.js --shots           day/night screenshots
 *
 * Copies assets/ and the page into a scratch site at the same relative path,
 * injects an early error trap plus a probe script that drives the real UI in
 * headless Chrome, and reads PASS/FAIL lines back from a <pre>. Node-side
 * scenarios (static source checks, the i18n gate, the source folder
 * fingerprint) run in this process. Every selector has an EXPECT table so a
 * scenario that never reported is a failure.
 */

var fs = require("fs");
var path = require("path");
var cp = require("child_process");
var url = require("url");
var crypto = require("crypto");

var ROOT = path.resolve(__dirname, "..", "..", "..");
var harness = require(path.join(ROOT, ".planning", "phases", "07-shared-js-module-refactor", "harness.js"));

var PAGE_REL = "Cyclic Groups/cyclic-groups.html";
var PAGE_FILE = path.join(ROOT, PAGE_REL);

/* ---------- in-page probe (serialised into the scratch page) ---------- */

function inPage(LOAD, BODIES) {
  var out = document.getElementById("d21-out");
  var lines = [];

  function scenario(name, fn) {
    try { lines.push("PASS " + name + ": " + fn()); }
    catch (e) { lines.push("FAIL " + name + ": " + (e && e.message ? e.message : e)); }
  }
  function assert(cond, msg) { if (!cond) throw new Error(msg); }
  function $(id) { return document.getElementById(id); }
  function all(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function near(a, b, tol) { return Math.abs(a - b) <= (tol === undefined ? 0.01 : tol); }
  function fire(el, type) { el.dispatchEvent(new Event(type, { bubbles: true })); }
  function setN(n) { var f = $("n-input"); f.value = String(n); fire(f, "input"); }
  function setMode(m) { $("tab-" + m).click(); }
  function beads(root) { return all(".bead", root || $("ring-dynamic")); }
  function centre(el) { return [parseFloat(el.getAttribute("cx")), parseFloat(el.getAttribute("cy"))]; }
  function chordPoints(path) {
    var toks = path.getAttribute("d").trim().split(/\s+/);
    var pts = [], segs = 0;
    for (var i = 0; i < toks.length; i += 3) {
      pts.push([parseFloat(toks[i + 1]), parseFloat(toks[i + 2])]);
      if (toks[i] === "L") segs++;
      else if (toks[i] !== "M") throw new Error("unexpected path command " + toks[i]);
    }
    return { pts: pts, segs: segs };
  }
  function genOptions() {
    return all("#gen-select option").map(function (o) { return o.value; });
  }

  var P = {
    scenario: scenario, assert: assert, $: $, all: all, near: near, fire: fire,
    setN: setN, setMode: setMode, beads: beads, centre: centre, chordPoints: chordPoints,
    genOptions: genOptions, lines: lines
  };

  window.addEventListener("load", function () {
    BODIES[LOAD](P);
    scenario("Z", function () {
      var errs = window.__d21Errors || [];
      assert(errs.length === 0, "page errors: " + errs.join(" | "));
      return "no page errors";
    });
    out.textContent = lines.join("\n");
  });
}

/* ---------- load bodies (also serialised into the page) ---------- */

var BODIES = {
  s1: function (P) {
    P.scenario("S1", function () {
      var bs = P.beads();
      P.assert(bs.length === 12, "expected 12 beads, found " + bs.length);
      var chords = P.all("#ring-dynamic .chord");
      P.assert(chords.length === 1, "expected one chord path, found " + chords.length);
      var seq = chords[0].getAttribute("data-seq");
      P.assert(seq === "0 5 10 3 8 1 6 11 4 9 2 7", "data-seq is " + seq);
      var cp = P.chordPoints(chords[0]);
      P.assert(cp.segs === 12, "chord has " + cp.segs + " segments");
      var first = cp.pts[0], last = cp.pts[cp.pts.length - 1];
      P.assert(P.near(first[0], last[0]) && P.near(first[1], last[1]), "chord does not return to its start");
      var seen = {};
      for (var i = 0; i < 12; i++) {
        var hit = -1;
        for (var b = 0; b < bs.length; b++) {
          var c = P.centre(bs[b]);
          if (P.near(c[0], cp.pts[i][0]) && P.near(c[1], cp.pts[i][1])) { hit = b; break; }
        }
        P.assert(hit >= 0, "chord vertex " + i + " touches no bead");
        seen[hit] = true;
      }
      P.assert(Object.keys(seen).length === 12, "chord vertices touch " + Object.keys(seen).length + " distinct beads");
      var arrows = P.all("#ring-dynamic .chord-arrow").length;
      P.assert(arrows === 12, "expected 12 arrowheads, found " + arrows);
      return "12 beads, data-seq " + seq + ", 12 segments closing, all 12 vertices on distinct beads, 12 arrows";
    });
  },

  s2: function (P) {
    P.scenario("S2", function () {
      var bs = P.beads();
      P.assert(bs.length === 6, "expected 6 beads, found " + bs.length);
      var els = bs.map(function (b) { return b.getAttribute("data-el"); }).join(" ");
      P.assert(els === "1 2 3 4 5 6", "bead data-el order is " + els);
      var seq = P.all("#ring-dynamic .chord")[0].getAttribute("data-seq");
      P.assert(seq === "1 3 2 6 4 5", "data-seq is " + seq);
      return "beads 1..6 in order, walk " + seq;
    });
  },

  s3: function (P) {
    function brute(mode, n) {
      var gens = [];
      var units = [];
      for (var a = 1; a < n; a++) {
        if (mode === "additive") { units.push(a); continue; }
        var x = a, y = n;
        while (y) { var t = x % y; x = y; y = t; }
        if (x === 1) units.push(a);
      }
      if (mode === "multiplicative" && n === 2) units = [1];
      var order = mode === "additive" ? n : units.length;
      units.forEach(function (g) {
        var cur = g, steps = 1;
        var id = mode === "additive" ? 0 : 1;
        while (cur !== id) {
          cur = mode === "additive" ? (cur + g) % n : (cur * g) % n;
          steps++;
          if (steps > 1000) throw new Error("brute force runaway");
        }
        if (steps === order) gens.push(g);
      });
      return gens;
    }
    P.scenario("S3", function () {
      var groups = 0, cyclic = 0;
      ["additive", "multiplicative"].forEach(function (mode) {
        P.setMode(mode);
        for (var n = 2; n <= 100; n++) {
          P.setN(n);
          var want = brute(mode, n);
          var opts = P.genOptions();
          var sel = P.$("gen-select");
          if (want.length === 0) {
            P.assert(sel.disabled, mode + " n=" + n + ": select should be disabled");
            P.assert(opts.length === 1, mode + " n=" + n + ": expected one option, found " + opts.length);
            P.assert(P.all("#gen-select option")[0].textContent === "none (not cyclic)", mode + " n=" + n + ": option text is " + P.all("#gen-select option")[0].textContent);
          } else {
            P.assert(!sel.disabled, mode + " n=" + n + ": select should be enabled");
            P.assert(opts.join(",") === want.join(","), mode + " n=" + n + ": options " + opts.join(",") + " != brute force " + want.join(","));
            cyclic++;
          }
          groups++;
        }
      });
      P.assert(groups === 198, "covered " + groups + " groups");
      return groups + " groups checked (" + cyclic + " cyclic, " + (groups - cyclic) + " not), option lists equal the brute-force generators";
    });
  }
};

/* ---------- selectors ---------- */

// One entry per page load: the query string and the in-page body.
var LOADS = {
  s1: { sel: "t1", query: "?mode=additive&n=12&gen=5&lang=en" },
  s2: { sel: "t1", query: "?mode=multiplicative&n=7&gen=3&lang=en" },
  s3: { sel: "t1", query: "?lang=en" }
};
var EXPECT = {
  t1: ["S1", "S2", "S3", "Z"]
};
var NODE_SCENARIOS = {};
var RUN_ORDER = ["t1"];

/* ---------- node-side runner ---------- */

var ERROR_TRAP = '<script>window.__d21Errors=[];window.addEventListener("error",function(e){window.__d21Errors.push(String(e.message||e));});</script>';

function fnSource(fn) { return fn.toString(); }

function buildPage(srcHtml, load, extra) {
  var siteRoot = harness.mkScratch("d21-site-");
  fs.cpSync(path.join(ROOT, "assets"), path.join(siteRoot, "assets"), { recursive: true });
  var bodiesSrc = "{" + Object.keys(BODIES).map(function (k) { return JSON.stringify(k) + ":" + fnSource(BODIES[k]); }).join(",") + "}";
  var script = "(" + fnSource(inPage) + ")(" + JSON.stringify(load) + "," + bodiesSrc + ");";
  var markup = '<pre id="d21-out"></pre>\n<script>\n' + script + "\n</script>\n" + (extra || "");
  var page = srcHtml.replace("<head>", "<head>\n" + ERROR_TRAP);
  var at = page.lastIndexOf("</body>");
  if (at < 0) throw new Error("no closing body tag in the page");
  page = page.slice(0, at) + markup + page.slice(at);
  var destDir = path.join(siteRoot, "Cyclic Groups");
  fs.mkdirSync(destDir, { recursive: true });
  var dest = path.join(destDir, "cyclic-groups.html");
  fs.writeFileSync(dest, page);
  return { file: dest, siteRoot: siteRoot };
}

function unescapeHtml(s) {
  return s.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, "&");
}

function runChrome(fileUrl, extraArgs) {
  var profileDir = harness.mkScratch("d21-profile-");
  var args = [
    "--headless=new", "--disable-gpu", "--no-sandbox",
    "--user-data-dir=" + profileDir
  ].concat(extraArgs || [
    "--virtual-time-budget=8000", "--window-size=1280,900", "--dump-dom"
  ]).concat([fileUrl]);
  var res = cp.spawnSync("google-chrome", args, {
    encoding: "utf8", maxBuffer: 200 * 1024 * 1024, timeout: 120000, env: harness.chromeEnv()
  });
  try { fs.rmSync(profileDir, { recursive: true, force: true }); } catch (e) { /* best effort */ }
  return res.stdout || "";
}

function grabPre(dom, id) {
  var m = new RegExp('<pre id="' + id + '"[^>]*>([\\s\\S]*?)</pre>').exec(dom);
  return m ? unescapeHtml(m[1]) : null;
}

function pageUrl(file, query) { return url.pathToFileURL(file).href + query; }

function runLoad(load) {
  var built = buildPage(fs.readFileSync(PAGE_FILE, "utf8"), load);
  var dom = runChrome(pageUrl(built.file, LOADS[load].query));
  var out = grabPre(dom, "d21-out");
  try { fs.rmSync(built.siteRoot, { recursive: true, force: true }); } catch (e) { /* best effort */ }
  if (out === null) return ["FAIL " + load + ": probe output <pre id=\"d21-out\"> missing from the dumped DOM"];
  // Each load reports its own Z; tag it so the per-load lines stay distinct.
  return out.split("\n").filter(function (l) { return l.length > 0; }).map(function (l) {
    return l.replace(/^(PASS|FAIL) Z:/, "$1 Z[" + load + "]:");
  });
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
    var lines = [];
    Object.keys(LOADS).filter(function (k) { return LOADS[k].sel === run; }).forEach(function (load) {
      lines = lines.concat(runLoad(load));
    });
    (NODE_SCENARIOS[run] || []).forEach(function (fn) { lines = lines.concat(fn()); });
    lines.forEach(function (l) { console.log(l); });
    passes += lines.filter(function (l) { return /^PASS/.test(l); }).length;
    fails += lines.filter(function (l) { return /^FAIL/.test(l); }).length;
    var missing = EXPECT[run].filter(function (id) {
      return !lines.some(function (l) { return new RegExp("^(PASS|FAIL) " + id.replace(/[[\]]/g, "\\$&") + "[ :\\[]").test(l); });
    });
    if (missing.length) { incomplete += missing.length; console.log("FAIL " + run + ": scenarios did not report: " + missing.join(", ")); }
  });

  if (fails > 0 || incomplete > 0) {
    console.log("D21-PROBE FAIL (" + passes + " pass, " + fails + " fail, " + incomplete + " unreported)");
    process.exit(1);
  }
  console.log("D21-PROBE PASS (" + passes + " scenarios)");
  process.exit(0);
}

function shots() {
  console.log("shots: not implemented yet");
  process.exit(1);
}

main();
