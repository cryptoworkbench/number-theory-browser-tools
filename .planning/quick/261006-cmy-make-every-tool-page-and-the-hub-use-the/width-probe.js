"use strict";
/*
 * Dev-only layout probe for quick task 261006-cmy: every tool page and the hub
 * use the full window width, like Factor Tree. Never referenced by any page.
 * Node built-ins + the in-repo harness only.
 *
 * Usage: node width-probe.js [pageKey ...] [--shots]
 *   no keys   -> all 16 pages; an unknown key exits with code 2
 *   --shots   -> also screenshots the ORIGINAL in-repo pages at 1900x1000
 *
 * Static checks (read the page source):
 *   S1  the page-level container rule declares no px max-width
 *   S2  the lede rule declares max-width: 72ch
 * Browser checks (headless Chrome, 1900x1000, injected in-page probe):
 *   B1  the container spans the window
 *   B2  the lede computed max-width is not 'none' and at most 0.6 x clientWidth
 *   B3  no horizontal overflow
 *   B4  each diagram: fills its parent's content width, and is no taller than
 *       max(80% of the viewport height, its native viewBox height)
 *   B5  (venn) #frame-two fills its parent's content width, or max(1040px, 205vh)
 *       where that bound is smaller
 * Optional diagrams (SKIP when hidden in the default state): euclid #tileSvg,
 * venn #venn-composite.
 */

var fs = require("fs");
var os = require("os");
var path = require("path");
var cp = require("child_process");
var url = require("url");

var ROOT = path.resolve(__dirname, "..", "..", "..");
var harness = require(path.join(ROOT, ".planning", "phases", "07-shared-js-module-refactor", "harness.js"));

var PAGES = {
  hub: { dir: "", file: "index.html", container: ".hub", containerQuery: "main.hub", lede: ".hero p", diagrams: [] },
  factorTree: { dir: "Factor Tree", file: "factor-tree.html", container: ".wrap", lede: ".subtitle", diagrams: [] },
  rsa: { dir: "RSA", file: "rsa.html", container: ".app", lede: ".page-header p", diagrams: [] },
  cayley: { dir: "Cayley Table", file: "cayley-table.html", container: ".app", lede: ".lede", diagrams: [] },
  crt: { dir: "Chinese Remainder Theorem", file: "chinese-remainder-theorem.html", container: ".app", lede: ".lede", diagrams: [] },
  dh: { dir: "Diffie-Hellman Key Exchange", file: "diffie-hellman-key-exchange.html", container: ".app", lede: ".page-header p", diagrams: [{ sel: "#stageSvg" }] },
  ecdh: { dir: "Elliptic Curve Diffie-Hellman", file: "elliptic-curve-diffie-hellman.html", container: ".app", lede: ".page-header p", diagrams: [{ sel: "#curveSvg" }] },
  euclid: { dir: "Euclidean Algorithm", file: "euclidean-algorithm.html", container: ".app", lede: ".lede", diagrams: [{ sel: "#nestedSvg" }, { sel: "#tileSvg", optional: true }] },
  totient: { dir: "Eulers Totient", file: "eulers-totient.html", container: ".app", lede: ".lede", diagrams: [] },
  fermat: { dir: "Fermats Method", file: "fermats-method.html", container: ".app", lede: ".page-header p", diagrams: [{ sel: "#diagramSvg" }] },
  shor: { dir: "Shors Algorithm", file: "shors-algorithm.html", container: ".app", lede: ".page-header p", diagrams: [{ sel: "#cycleRing" }] },
  sieve: { dir: "Sieve Of Eratosthenes", file: "sieve-of-eratosthenes.html", container: ".app", lede: ".page-header p", diagrams: [] },
  sqm: { dir: "Square And Multiply", file: "square-and-multiply.html", container: ".app", lede: ".page-header p", diagrams: [{ sel: "#ladderSvg" }] },
  wheel: { dir: "Equivalence Wheel", file: "equivalence-wheel.html", container: ".wrap", lede: ".lede", diagrams: [{ sel: "#wheel" }] },
  iso: { dir: "Group Isomorphism", file: "group-isomorphism.html", container: ".wrap", lede: ".lede", diagrams: [{ sel: "#wheel-left" }, { sel: "#wheel-right" }] },
  venn: { dir: "Venn Diagram", file: "venn-diagram.html", container: ".wrap", lede: ".lede", diagrams: [{ sel: "#venn" }, { sel: "#venn-composite", optional: true }], frameSel: "#frame-two" }
};

/* ---------- static checks ---------- */

function styleText(src) {
  var out = "";
  var re = /<style[^>]*>([\s\S]*?)<\/style>/gi;
  var m;
  while ((m = re.exec(src))) out += m[1] + "\n";
  return out.replace(/\/\*[\s\S]*?\*\//g, "");
}

// Every innermost "selectors { body }" block, nested @media rules included.
function cssBlocks(css) {
  var blocks = [];
  var re = /([^{}]+)\{([^{}]*)\}/g;
  var m;
  while ((m = re.exec(css))) {
    blocks.push({
      selectors: m[1].split(",").map(function (s) { return s.replace(/\s+/g, " ").trim(); }),
      body: m[2]
    });
  }
  return blocks;
}

// A block body as [{prop, value}] declarations (split on ';', one ':' each).
function decls(body) {
  return body.split(";").map(function (d) {
    var i = d.indexOf(":");
    return i < 0 ? { prop: "", value: "" } : { prop: d.slice(0, i).trim(), value: d.slice(i + 1).trim() };
  });
}

function staticChecks(key) {
  var p = PAGES[key];
  var src = fs.readFileSync(path.join(ROOT, p.dir, p.file), "utf8");
  var blocks = cssBlocks(styleText(src));
  var lines = [];
  var containers = [p.container, "main" + p.container];
  var badCap = blocks.filter(function (b) {
    return b.selectors.some(function (s) { return containers.indexOf(s) >= 0; }) &&
      decls(b.body).some(function (d) { return d.prop === "max-width" && /^[0-9.]+px$/.test(d.value); });
  });
  lines.push(badCap.length === 0
    ? "PASS S1 no px max-width on " + p.container
    : "FAIL S1 " + p.container + " still declares a px max-width");
  var lede = blocks.filter(function (b) {
    return b.selectors.indexOf(p.lede) >= 0 &&
      decls(b.body).some(function (d) { return d.prop === "max-width" && d.value === "72ch"; });
  });
  lines.push(lede.length > 0
    ? "PASS S2 " + p.lede + " declares max-width: 72ch"
    : "FAIL S2 " + p.lede + " does not declare max-width: 72ch");
  return lines;
}

/* ---------- in-page probe (stringified into the page copy) ---------- */

function inPage(cfg) {
  var out = document.getElementById("cmy-out");
  function emit(l) { out.textContent += l + "\n"; }
  function rep(ok, msg) { emit((ok ? "PASS " : "FAIL ") + msg); }
  function contentW(el) {
    var cs = getComputedStyle(el);
    return el.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
  }
  function run() {
    var cw = document.documentElement.clientWidth;
    var ch = window.innerHeight;
    var c = document.querySelector(cfg.containerQuery);
    if (!c) { rep(false, "B1 container " + cfg.containerQuery + " not found"); }
    else {
      var w = c.getBoundingClientRect().width;
      rep(w >= cw - 1, "B1 container width " + Math.round(w) + " vs window " + cw);
    }
    var l = document.querySelector(cfg.lede);
    if (!l) { rep(false, "B2 lede " + cfg.lede + " not found"); }
    else {
      var mw = getComputedStyle(l).maxWidth;
      var px = parseFloat(mw);
      rep(mw !== "none" && px <= 0.6 * cw, "B2 lede max-width " + mw + " (limit " + Math.round(0.6 * cw) + "px)");
    }
    rep(document.documentElement.scrollWidth <= cw + 1,
      "B3 scrollWidth " + document.documentElement.scrollWidth + " vs clientWidth " + cw);
    cfg.diagrams.forEach(function (d) {
      var el = document.querySelector(d.sel);
      var r = el ? el.getBoundingClientRect() : null;
      if (!el || r.height === 0) {
        if (d.optional && (!el || r.height === 0)) emit("SKIP B4 " + d.sel + " hidden in the default state (optional)");
        else rep(false, "B4 " + d.sel + (el ? " has zero height" : " not found"));
        return;
      }
      var vb = el.viewBox && el.viewBox.baseVal;
      if (!vb || !vb.height) { rep(false, "B4 " + d.sel + " has no viewBox"); return; }
      var limit = Math.max(0.8 * ch, vb.height) + 1;
      var pw = contentW(el.parentElement);
      rep(r.height <= limit && r.width >= pw - 1,
        "B4 " + d.sel + " " + Math.round(r.width) + "x" + Math.round(r.height) +
        " (height limit " + Math.round(limit) + ", parent content width " + Math.round(pw) + ")");
    });
    if (cfg.frameSel) {
      var f = document.querySelector(cfg.frameSel);
      if (!f) rep(false, "B5 " + cfg.frameSel + " not found");
      else {
        var fw = f.getBoundingClientRect().width;
        var pcw = contentW(f.parentElement);
        // The frame may only be narrower than its parent where the 205vh bound
        // binds (headless Chrome's innerHeight is below the 1000px window height).
        var want = Math.min(pcw, Math.max(1040, 2.05 * ch));
        rep(fw >= want - 1, "B5 " + cfg.frameSel + " width " + Math.round(fw) + " vs expected " + Math.round(want) +
          " (parent content width " + Math.round(pcw) + ", innerHeight " + ch + ")");
      }
    }
    out.setAttribute("data-done", "1");
  }
  window.addEventListener("load", function () {
    setTimeout(function () {
      try { run(); } catch (e) { emit("FAIL probe threw: " + e.message); out.setAttribute("data-done", "1"); }
    }, 3000);
  });
}

/* ---------- Chrome runner ---------- */

function buildSite(keys) {
  var siteRoot = harness.mkScratch("cmy-site-");
  fs.cpSync(path.join(ROOT, "assets"), path.join(siteRoot, "assets"), { recursive: true });
  keys.forEach(function (key) {
    var p = PAGES[key];
    var destDir = path.join(siteRoot, p.dir);
    fs.mkdirSync(destDir, { recursive: true });
    fs.copyFileSync(path.join(ROOT, p.dir, p.file), path.join(destDir, p.file));
  });
  return siteRoot;
}

function pageFor(siteRoot, key) {
  var p = PAGES[key];
  var src = fs.readFileSync(path.join(ROOT, p.dir, p.file), "utf8");
  var cfg = {
    containerQuery: p.containerQuery || p.container,
    lede: p.lede,
    diagrams: p.diagrams,
    frameSel: p.frameSel || null
  };
  var probe = "(" + inPage.toString() + ")(" + JSON.stringify(cfg) + ");";
  var markup = '<pre id="cmy-out"></pre>\n<script>\n' + probe + "\n</script>\n";
  var at = src.lastIndexOf("</body>");
  if (at < 0) throw new Error("no closing body tag in " + p.file);
  var dest = path.join(siteRoot, p.dir, "cmy-probe.html");
  fs.writeFileSync(dest, src.slice(0, at) + markup + src.slice(at));
  return dest;
}

function unescapeHtml(s) {
  return s.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, "&");
}

function chrome(extra, fileUrl) {
  var profileDir = harness.mkScratch("cmy-profile-");
  var args = ["--headless=new", "--disable-gpu", "--no-sandbox", "--user-data-dir=" + profileDir]
    .concat(extra, [fileUrl]);
  var res = cp.spawnSync("google-chrome", args, {
    encoding: "utf8", maxBuffer: 200 * 1024 * 1024, timeout: 120000, env: harness.chromeEnv()
  });
  try { fs.rmSync(profileDir, { recursive: true, force: true }); } catch (e) { /* best effort */ }
  return res.stdout || "";
}

function browserChecks(siteRoot, key) {
  var page = pageFor(siteRoot, key);
  var dom = chrome(
    ["--window-size=1900,1000", "--virtual-time-budget=10000", "--dump-dom"],
    url.pathToFileURL(page).href + "?lang=en"
  );
  var m = /<pre id="cmy-out"([^>]*)>([\s\S]*?)<\/pre>/.exec(dom);
  if (!m) return ['FAIL probe output <pre id="cmy-out"> missing from the dumped DOM'];
  var lines = unescapeHtml(m[2]).split("\n").filter(function (l) { return l.length > 0; });
  if (!/data-done="1"/.test(m[1])) lines.push("FAIL the probe did not finish (virtual-time budget exhausted?)");
  return lines;
}

function main() {
  var argv = process.argv.slice(2);
  var shots = argv.indexOf("--shots") >= 0;
  var keys = argv.filter(function (a) { return a.indexOf("--") !== 0; });
  if (keys.length === 0) keys = Object.keys(PAGES);
  var unknown = keys.filter(function (k) { return !PAGES[k]; });
  if (unknown.length) {
    console.log("unknown page key(s): " + unknown.join(", ") + " (known: " + Object.keys(PAGES).join(" ") + ")");
    process.exit(2);
  }
  var siteRoot = buildSite(keys);
  var fail = 0;
  keys.forEach(function (key) {
    var lines = staticChecks(key).concat(browserChecks(siteRoot, key));
    lines.forEach(function (l) {
      console.log("[" + key + "] " + l);
      if (/^FAIL/.test(l)) fail++;
    });
  });
  if (shots) {
    // Not a harness scratch dir: the harness deletes its scratch root on exit,
    // and the screenshots are meant to outlive this process.
    var shotsDir = fs.mkdtempSync(path.join(os.tmpdir(), "cmy-shots-"));
    keys.forEach(function (key) {
      var p = PAGES[key];
      chrome(
        ["--window-size=1900,1000", "--hide-scrollbars", "--virtual-time-budget=6000",
          "--screenshot=" + path.join(shotsDir, key + ".png")],
        url.pathToFileURL(path.join(ROOT, p.dir, p.file)).href + "?lang=en"
      );
    });
    console.log("SHOTS " + shotsDir);
  }
  try { fs.rmSync(siteRoot, { recursive: true, force: true }); } catch (e) { /* best effort */ }
  if (fail > 0) {
    console.log("CMY-PROBE FAIL " + fail);
    process.exit(1);
  }
  console.log("CMY-PROBE PASS");
}

main();
