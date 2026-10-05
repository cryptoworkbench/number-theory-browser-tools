"use strict";
/*
 * Dev-only regression probe for quick task 261005-ing: the Factor Tree input
 * row has a translated Randomize button that grows a random composite (at
 * least three prime factors, never the shown number) through the Go path.
 * Never referenced by any page. Node built-ins + the in-repo harness only.
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

var EXPECTED = 7;

var LANGS = ["nl", "en", "de", "fr", "es", "it", "pl", "pt-BR", "pt-PT", "sv", "nb", "ro", "hu", "lv", "ru", "el"];

/* ---------- node-side scenarios ---------- */

function loadDicts() {
  var dicts = {};
  var ctx = { NT: { i18n: { register: function (ns, dict) { dicts[ns] = dict; } } } };
  ["site.js", "factor-tree.js", "equivalence-wheel.js", "cayley-table.js"].forEach(function (f) {
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
  var src = fs.readFileSync(path.join(ROOT, "Factor Tree", "factor-tree.html"), "utf8");
  var pass = 0;
  pass += nodeScenario("N1 randomize-catalog", function () {
    var en = dicts.factorTree.en.randomize;
    LANGS.forEach(function (l) {
      var v = dicts.factorTree[l].randomize;
      nodeAssert(typeof v === "string" && v.length > 0, l + " randomize missing");
      nodeAssert(v === dicts.wheel[l].randomizeLabel, l + " differs from wheel.randomizeLabel: " + v);
      nodeAssert(v === dicts.cayley[l].randomizeLabel, l + " differs from cayley.randomizeLabel: " + v);
      if (l !== "en") nodeAssert(v !== en, l + " randomize equals the English text");
    });
    nodeAssert(/^[Ѐ-ӿ ]+$/.test(dicts.factorTree.ru.randomize), "ru value is not pure Cyrillic");
    nodeAssert(/^[Ͱ-Ͽἀ-῿ ]+$/.test(dicts.factorTree.el.randomize), "el value is not pure Greek");
    return "16 languages equal wheel/cayley randomizeLabel; ru Cyrillic, el Greek";
  });
  pass += nodeScenario("N2 static-markup", function () {
    var re = /(<button id="goBtn"[^>]*>[^<]*<\/button>)\s*<button id="randomBtn" type="button" data-i18n="factorTree\.randomize">Randomize<\/button>/;
    nodeAssert(re.test(src), "randomBtn does not directly follow goBtn with the expected markup");
    var ctl = /<div class="controls">([\s\S]*?)<\/div>/.exec(src);
    nodeAssert(ctl && ctl[1].indexOf('id="goBtn"') >= 0 && ctl[1].indexOf('id="randomBtn"') >= 0, "buttons are not inside .controls");
    return "randomBtn follows goBtn inside .controls";
  });
  pass += nodeScenario("N3 import-line", function () {
    nodeAssert(src.split("\n").some(function (l) { return l.trim() === "const { primeFactors, randomInt } = NT.core;"; }), "import line missing");
    var rest = src.replace("const { primeFactors, randomInt } = NT.core;", "");
    nodeAssert(!/\b(?:function|const|let|var)\s+(?:randomInt|primeFactors)\b/.test(rest), "a local binding shadows randomInt/primeFactors");
    return "NT.core import line exact, no shadowing";
  });
  pass += nodeScenario("N4 no-literal-colour", function () {
    var style = /<style>([\s\S]*?)<\/style>/.exec(src)[1];
    var hits = style.split("\n").filter(function (l) { return /randomBtn/.test(l); });
    nodeAssert(hits.length > 0, "no style line mentions randomBtn");
    var bad = /#[0-9a-fA-F]{3,8}\b|\b(?:rgb|rgba|hsl|hsla)\(|\b(?:red|green|blue|black|white|gray|grey|orange|yellow|purple|pink|brown|cyan|magenta|silver|gold|navy|teal)\b/;
    hits.forEach(function (l) { nodeAssert(!bad.test(l), "literal colour in: " + l.trim()); });
    return hits.length + " randomBtn style lines, all colours via var()";
  });
  return pass;
}

/* ---------- in-page probe (serialised into the scratch page) ---------- */

function inPage(cfg) {
  var out = document.getElementById("ing-out");
  var lines = [];

  function emit(line) { lines.push(line); out.textContent = lines.join("\n"); }
  function assert(cond, msg) { if (!cond) throw new Error(msg); }
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
  function same(a, b) { return JSON.stringify(a) === JSON.stringify(b); }

  var numInput = document.getElementById("numInput");
  var randomBtn = document.getElementById("randomBtn");
  var messageEl = document.getElementById("message");
  var pf = NT.core.primeFactors;

  function qualifies(n) { return Number.isInteger(n) && n >= 12 && n <= 9999 && pf(n).length >= 3; }
  function rootLabel() {
    var c = document.querySelector(".node-circle.root");
    var n = c ? c.nextElementSibling : null;
    while (n && n.tagName.toLowerCase() !== "text") n = n.nextElementSibling;
    return n ? n.textContent : null;
  }
  function leafPrimes() {
    return Array.prototype.slice.call(document.querySelectorAll(".node-circle.prime-leaf")).map(function (c) {
      var n = c.nextElementSibling;
      while (n && n.tagName.toLowerCase() !== "text") n = n.nextElementSibling;
      return Number(n.textContent);
    }).sort(function (a, b) { return a - b; });
  }
  function clickRandom() {
    randomBtn.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
    return Number(numInput.value);
  }
  function factorsMsg(v) { return NT.i18n.translate("factorTree.msgFactors", { n: v, count: pf(v).length }); }
  var axes = function () { return Array.prototype.slice.call(document.querySelectorAll(".mirror-axis")); };
  var twoChild = function () { return Array.prototype.slice.call(document.querySelectorAll(".node-circle.root, .node-circle.internal")); };
  var mirrorables = function () { return Array.prototype.slice.call(document.querySelectorAll(".mirrorable")); };
  function r(k) { return (k - 12 + 0.5) / 9988; }

  var steps = [];
  function step(name, fn) { steps.push({ name: name, fn: fn }); }

  step("R1 button-translated", function () {
    assert(randomBtn, "#randomBtn missing");
    assert(randomBtn.tagName === "BUTTON" && randomBtn.getAttribute("type") === "button", "not a type=button BUTTON");
    assert(randomBtn.parentElement.classList.contains("controls"), "parent is not .controls");
    assert(randomBtn.previousElementSibling && randomBtn.previousElementSibling.id === "goBtn", "does not follow #goBtn");
    assert(randomBtn.textContent === "Randomize", "text is " + randomBtn.textContent);
    var n = 0;
    NT.i18n.SUPPORTED_LANGS.forEach(function (code) {
      NT.i18n.setLang(code);
      var want = NT.i18n.translate("factorTree.randomize");
      assert(randomBtn.textContent === want, code + " label is " + randomBtn.textContent + ", expected " + want);
      if (code !== "en") assert(randomBtn.textContent !== "Randomize", code + " label is still English");
      n++;
    });
    NT.i18n.setLang("en");
    assert(n === 16, "checked " + n + " languages");
    return "button follows Grow, label translated in 16 languages";
  });

  step("R2 click-grows-composite", function () {
    assert(rootLabel() === "60", "shown root is " + rootLabel() + ", expected 60");
    var v = clickRandom();
    assert(qualifies(v), v + " does not qualify");
    assert(v !== 60, "picked the shown number");
    assert(rootLabel() === String(v), "root label " + rootLabel() + " vs " + v);
    assert(messageEl.textContent === factorsMsg(v), "message is " + messageEl.textContent);
    assert(messageEl.classList.contains("info"), "message lacks class info");
    assert(document.querySelector('.mode-btn[data-mode="classic"]').classList.contains("is-active"), "Classic is no longer active");
    return waitFor(function () { return document.querySelector(".equation .fac"); }, 8000).then(function (fac) {
      var want = v + " = " + pf(v).join(" × ");
      assert(fac.textContent === want, "equation is " + fac.textContent + ", expected " + want);
      assert(same(leafPrimes(), pf(v)), "leaf primes " + leafPrimes() + " vs " + pf(v));
      return v + " grew through the Go path";
    });
  });

  step("R3 repeated-clicks-distinct", function () {
    var prev = Number(numInput.value);
    var seen = {};
    for (var i = 0; i < 30; i++) {
      var v = clickRandom();
      assert(qualifies(v), "click " + i + " gave " + v);
      assert(v !== prev, "click " + i + " repeated " + v);
      seen[v] = true;
      prev = v;
    }
    assert(Object.keys(seen).length >= 3, "fewer than 3 distinct values");
    assert(rootLabel() === String(prev), "root label " + rootLabel() + " vs " + prev);
    return waitFor(function () { return axes().length > 0; }, 8000).then(function () {
      return "30 clicks, " + Object.keys(seen).length + " distinct, last tree finished growing";
    });
  });

  var chain = Promise.resolve();
  window.addEventListener("load", function () {
    steps.forEach(function (s) {
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
  var siteRoot = harness.mkScratch("ing-site-");
  fs.cpSync(path.join(ROOT, "assets"), path.join(siteRoot, "assets"), { recursive: true });
  var src = fs.readFileSync(path.join(ROOT, "Factor Tree", "factor-tree.html"), "utf8");
  var probe = "(" + inPage.toString() + ")(" + JSON.stringify({}) + ");";
  var markup = '<pre id="ing-out"></pre>\n<script>\n' + probe + "\n</script>\n";
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
  var profileDir = harness.mkScratch("ing-profile-");
  var args = [
    "--headless=new", "--disable-gpu", "--no-sandbox",
    "--user-data-dir=" + profileDir,
    "--virtual-time-budget=60000",
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
  var m = /<pre id="ing-out"[^>]*>([\s\S]*?)<\/pre>/.exec(dom);
  if (!m) {
    console.log("FAIL " + tag + ": probe output <pre id=\"ing-out\"> missing from the dumped DOM");
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
    console.log("ING-PROBE FAIL (" + pass + " pass, " + fail + " fail, expected " + EXPECTED + " scenarios)");
    process.exit(1);
  }
  console.log("ING-PROBE PASS (" + pass + " scenarios)");
  process.exit(0);
}

function EXPECTED_NODE() { return 4; }

main();
