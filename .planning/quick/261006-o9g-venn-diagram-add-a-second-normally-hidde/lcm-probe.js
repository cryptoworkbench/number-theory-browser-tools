"use strict";
/*
 * Dev-only regression probe for quick task 261006-o9g: the Venn Diagram's
 * normally folded LCM / GCD explainer (lcm(A, B) = (A x B) / gcd(A, B)).
 * Never referenced by any page. Node built-ins + the in-repo harness only.
 *
 * Copies assets/ and the Venn page into a scratch site, serves it with
 * `python3 -m http.server` bound to 127.0.0.1 only (never file://, so no real
 * browser storage is touched), injects an in-page probe, and runs headless
 * Chrome once per run with a throwaway profile. PASS/FAIL lines come back
 * through a <pre> in the dumped DOM.
 *
 * Usage: node lcm-probe.js [share|coprime|big|all]   (default all)
 *        node lcm-probe.js --shots   (writes lcm-day.png and lcm-night.png here)
 */

var fs = require("fs");
var path = require("path");
var cp = require("child_process");
var net = require("net");
var http = require("http");
var vm = require("vm");

var ROOT = path.resolve(__dirname, "..", "..", "..");
var harness = require(path.join(ROOT, ".planning", "phases", "07-shared-js-module-refactor", "harness.js"));

var VENN_DIR = "Venn Diagram";
var VENN_FILE = "venn-diagram.html";

// Each run is one deep link into the two-circle diagram.
var PAGES = {
  share: { query: "?a=12&b=18&lang=en", expected: 11, a: "12", b: "18", g: "6" },
  coprime: { query: "?a=10&b=21&lang=en", expected: 4, a: "10", b: "21", g: "1" },
  big: { query: "?a=999510067897129&b=998810375875079&lang=en", expected: 3, a: "999510067897129", b: "998810375875079", g: "99991" }
};

// Exact reference numbers, computed here in BigInt (never in the page).
function reference(p) {
  var a = BigInt(p.a), b = BigInt(p.b), g = BigInt(p.g);
  var product = a * b;
  return { a: p.a, b: p.b, g: p.g, product: String(product), lcm: String(product / g) };
}

// Same evaluation i18n-check.js's loadCatalog() does.
function loadCatalog() {
  var i18nDir = path.join(ROOT, "assets", "i18n");
  var catalog = {};
  var ntObj = {
    i18n: {
      register: function (ns, dict) {
        catalog[ns] = catalog[ns] || {};
        Object.keys(dict).forEach(function (lang) {
          catalog[ns][lang] = Object.assign(catalog[ns][lang] || {}, dict[lang]);
        });
      }
    }
  };
  var ctx = vm.createContext({ NT: ntObj, window: { NT: ntObj }, console: console });
  fs.readdirSync(i18nDir).filter(function (f) { return /\.js$/.test(f); }).sort().forEach(function (f) {
    vm.runInContext(fs.readFileSync(path.join(i18nDir, f), "utf8"), ctx, { filename: f });
  });
  return catalog;
}

var KEYS = ["toggle", "empty", "aria", "stepOf", "prev", "next", "replay", "stage1", "stage1Coprime", "stage2", "stage2Coprime", "stage3"];

function expectedStrings() {
  var cat = loadCatalog();
  var out = {};
  ["en", "nl"].forEach(function (lang) {
    out[lang] = {};
    KEYS.forEach(function (k) {
      var v = cat.venn && cat.venn[lang] && cat.venn[lang]["lcm." + k];
      if (typeof v !== "string") throw new Error("missing catalog entry venn.lcm." + k + " for " + lang);
      out[lang][k] = v;
    });
  });
  return out;
}

// Node-side pre-flight: every inline script of the Venn page must compile.
function checkInlineScripts() {
  var src = fs.readFileSync(path.join(ROOT, VENN_DIR, VENN_FILE), "utf8");
  var re = /<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g;
  var m, n = 0;
  while ((m = re.exec(src))) {
    n++;
    try {
      new vm.Script(m[1], { filename: VENN_FILE + "#inline" + n });
    } catch (e) {
      console.log("O9G-PROBE FAIL inline-script-syntax: " + e.message);
      process.exit(1);
    }
  }
}

/* ---------- in-page probe (serialised into the page) ---------- */

function inPage(cfg) {
  var out = document.getElementById("o9g-out");
  var EXP = cfg.expected;
  var EN = cfg.str.en, NL = cfg.str.nl;
  var REF = cfg.ref;

  function log(line) { out.textContent += line + "\n"; }
  function wait(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
  function eq(a, b, what) {
    var x = JSON.stringify(a), y = JSON.stringify(b);
    if (x !== y) throw new Error(what + ": got " + x + ", expected " + y);
  }
  function ok(c, what) { if (!c) throw new Error(what); }
  function $(id) { return document.getElementById(id); }
  function text(id) { return $(id).textContent.trim(); }
  function fill(tpl, params) {
    return tpl.replace(/\{(\w+)\}/g, function (m, k) { return String(params[k]); });
  }
  function qa(root, sel) { return Array.prototype.slice.call(root.querySelectorAll(sel)); }
  var count = 0;
  function scenario(name, fn) {
    return Promise.resolve().then(fn).then(function () {
      log("PASS " + name); count++;
    }, function (e) {
      log("FAIL " + name + ": " + (e && e.message ? e.message : e)); count++;
    });
  }
  var FORMULA = "lcm(A, B) = (A × B) ÷ gcd(A, B)";
  function numbersLine() {
    return "lcm(" + REF.a + ", " + REF.b + ") = (" + REF.a + " × " + REF.b + ") ÷ " + REF.g +
      " = " + REF.product + " ÷ " + REF.g + " = " + REF.lcm;
  }
  function stage() { return $("lcm-fold").getAttribute("data-stage"); }
  function noErrors(name) {
    return scenario(name, function () {
      var errs = window.__o9gErrors || [];
      ok(errs.length === 0, "page errors: " + JSON.stringify(errs));
    });
  }

  function shareRun() {
    var before = null;
    return scenario("S1 collapsed-default", function () {
      ok(!$("lcm-fold").hidden, "fold visible in two-circle mode");
      eq($("lcm-toggle").getAttribute("aria-expanded"), "false", "aria-expanded");
      eq($("lcm-toggle").getAttribute("aria-controls"), "lcm-body", "aria-controls");
      ok($("lcm-body").hidden === true, "body hidden");
    }).then(function () {
      return scenario("S2 open-plays", function () {
        $("lcm-toggle").click();
        eq($("lcm-toggle").getAttribute("aria-expanded"), "true", "aria-expanded after open");
        ok(!$("lcm-body").hidden, "body shown");
        eq(stage(), "1", "stage right after open");
        eq(text("lcm-step"), fill(EN.stepOf, { n: 1, total: 3 }), "step label");
        eq(text("lcm-caption"), EN.stage1, "stage 1 caption");
        return wait(5000).then(function () {
          eq(stage(), "3", "stage after autoplay");
          eq(text("lcm-caption"), fill(EN.stage3, { lcm: REF.lcm }), "stage 3 caption");
        });
      });
    }).then(function () {
      return scenario("S3 equation", function () {
        eq(text("lcm-formula"), FORMULA, "formula line");
        eq(text("lcm-numbers"), numbersLine(), "numbers line");
        eq(text("lcm-numbers"), "lcm(12, 18) = (12 × 18) ÷ 6 = 216 ÷ 6 = 36", "literal numbers line");
      });
    }).then(function () {
      return scenario("S4 step-buttons", function () {
        ok($("lcm-next").disabled, "next disabled at stage 3");
        $("lcm-prev").click();
        eq(stage(), "2", "stage after prev");
        eq(text("lcm-caption"), fill(EN.stage2, { gcd: REF.g }), "stage 2 caption");
        $("lcm-prev").click();
        eq(stage(), "1", "stage after second prev");
        ok($("lcm-prev").disabled, "prev disabled at stage 1");
        $("lcm-next").click();
        eq(stage(), "2", "stage after next");
        return wait(4000).then(function () {
          eq(stage(), "2", "manual steps cancel autoplay");
        });
      });
    }).then(function () {
      return scenario("S5 lang-switch", function () {
        before = text("lcm-numbers");
        NT.i18n.setLang("nl");
        return wait(100).then(function () {
          eq(text("lcm-toggle-title"), NL.toggle, "nl toggle");
          eq(text("lcm-caption"), fill(NL.stage2, { gcd: REF.g }), "nl caption");
          eq(text("lcm-step"), fill(NL.stepOf, { n: 2, total: 3 }), "nl step label");
          eq(stage(), "2", "stage kept");
          eq($("lcm-toggle").getAttribute("aria-expanded"), "true", "open state kept");
          eq(text("lcm-numbers"), before, "numbers unchanged");
          NT.i18n.setLang("en");
          return wait(100);
        });
      });
    }).then(function () {
      return scenario("S6 live-update", function () {
        $("clear-btn").click();
        ok(!$("lcm-empty").hidden, "empty hint shown");
        ok($("lcm-content").hidden, "content hidden");
        $("work-undo-btn").click();
        ok(!$("lcm-content").hidden, "content shown again");
        eq(text("lcm-numbers"), numbersLine(), "numbers restored");
        eq(stage(), "2", "stage kept across clear/undo");
      });
    }).then(function () {
      return scenario("S7 mode-hide", function () {
        $("mode-three").click();
        ok($("lcm-fold").hidden === true, "fold hidden in three-circle mode");
        $("mode-two").click();
        ok($("lcm-fold").hidden === false, "fold back in two-circle mode");
        eq($("lcm-toggle").getAttribute("aria-expanded"), "true", "open state intact");
      });
    }).then(function () {
      return scenario("S8 replay", function () {
        $("lcm-replay").click();
        eq(stage(), "1", "stage right after replay");
        return wait(5000).then(function () { eq(stage(), "3", "stage after replay autoplay"); });
      });
    }).then(function () {
      return scenario("S9 svg-stage3", function () {
        eq(stage(), "3", "at stage 3");
        eq(qa(document, "#lcm-svg .lcm-chip").length, 6, "chips");
        eq(qa(document, "#lcm-svg .lcm-chip.is-shared").length, 4, "shared chips");
        eq(qa(document, "#lcm-svg .lcm-chip.is-cancelled").length, 2, "cancelled chips");
        eq($("lcm-union").style.opacity, "1", "union opacity");
        ok($("lcm-circle-a").style.transform.indexOf("380px") >= 0, "circle A joined: " + $("lcm-circle-a").style.transform);
        ok($("lcm-circle-b").style.transform.indexOf("520px") >= 0, "circle B joined: " + $("lcm-circle-b").style.transform);
        eq(text("lcm-headline"), "lcm(A, B) = 36", "headline");
        eq(text("lcm-gcd-label"), "gcd(A, B) = 6", "gcd label");
      });
    }).then(function () {
      return scenario("S10 svg-stage2-1", function () {
        $("lcm-prev").click();
        eq(stage(), "2", "stage 2");
        eq(qa(document, "#lcm-svg .lcm-chip.is-cancelled").length, 2, "cancelled at stage 2");
        eq($("lcm-union").style.opacity, "0", "union hidden at stage 2");
        ok($("lcm-circle-a").style.transform.indexOf("230px") >= 0, "circle A apart: " + $("lcm-circle-a").style.transform);
        eq(text("lcm-headline"), "(A \u00d7 B) \u00f7 gcd(A, B) = 216 \u00f7 6", "stage 2 headline");
        eq($("lcm-gcd").style.opacity, "1", "gcd box shown at stage 2");
        $("lcm-prev").click();
        eq(stage(), "1", "stage 1");
        eq(qa(document, "#lcm-svg .lcm-chip.is-cancelled").length, 0, "cancelled at stage 1");
        eq($("lcm-gcd").style.opacity, "0", "gcd box hidden at stage 1");
        eq(text("lcm-headline"), "A \u00d7 B = 12 \u00d7 18 = 216", "stage 1 headline");
        eq(text("lcm-name-a"), "A = 12", "name A");
        eq(text("lcm-name-b"), "B = 18", "name B");
      });
    }).then(function () {
      return noErrors("SE no-errors");
    });
  }

  function coprimeRun() {
    return scenario("C1 equation", function () {
      eq(text("lcm-numbers"), "lcm(10, 21) = (10 × 21) ÷ 1 = 210 ÷ 1 = 210", "coprime numbers line");
      eq(text("lcm-numbers"), numbersLine(), "reference numbers line");
    }).then(function () {
      return scenario("C2 coprime-captions", function () {
        $("lcm-toggle").click();
        eq(text("lcm-caption"), EN.stage1Coprime, "coprime stage 1 caption");
        return wait(5000).then(function () {
          eq(text("lcm-caption"), fill(EN.stage3, { lcm: "210" }), "stage 3 caption");
          $("lcm-prev").click();
          eq(text("lcm-caption"), EN.stage2Coprime, "coprime stage 2 caption");
          $("lcm-next").click();
          eq(text("lcm-caption"), fill(EN.stage3, { lcm: "210" }), "back to stage 3");
        });
      });
    }).then(function () {
      return scenario("C3 svg-coprime", function () {
        eq(stage(), "3", "at stage 3");
        eq(qa(document, "#lcm-svg .lcm-chip").length, 4, "chips");
        eq(qa(document, "#lcm-svg .lcm-chip.is-shared").length, 0, "shared chips");
        eq(qa(document, "#lcm-svg .lcm-chip.is-cancelled").length, 0, "cancelled chips");
        eq(text("lcm-gcd-label"), "gcd(A, B) = 1", "gcd label");
        var one = qa(document, "#lcm-svg .lcm-gcd-one");
        ok(one.length === 1 && one[0].textContent.trim() === "1", "gcd box shows 1");
      });
    }).then(function () {
      return noErrors("CE no-errors");
    });
  }

  function bigRun() {
    return scenario("B1 equation", function () {
      eq(text("lcm-numbers"), numbersLine(), "exact big numbers line");
    }).then(function () {
      return scenario("B2 captions", function () {
        $("lcm-toggle").click();
        return wait(5000).then(function () {
          eq(text("lcm-caption"), fill(EN.stage3, { lcm: REF.lcm }), "exact stage 3 caption");
          $("lcm-prev").click();
          eq(text("lcm-caption"), fill(EN.stage2, { gcd: REF.g }), "stage 2 caption");
        });
      });
    }).then(function () {
      return noErrors("BE no-errors");
    });
  }

  var RUNNERS = { share: shareRun, coprime: coprimeRun, big: bigRun };

  window.addEventListener("load", function () {
    setTimeout(function () {
      var run = RUNNERS[cfg.page]();
      run.then(function () {
        if (count !== EXP) log("FAIL ran " + count + " scenarios, expected " + EXP);
        out.setAttribute("data-done", "1");
      }, function (e) {
        log("FAIL probe crashed: " + e);
        out.setAttribute("data-done", "1");
      });
    }, 300);
  });
}

/* ---------- scratch site, server and Chrome runner ---------- */

function buildSite() {
  var siteRoot = harness.mkScratch("o9g-site-");
  fs.cpSync(path.join(ROOT, "assets"), path.join(siteRoot, "assets"), { recursive: true });
  fs.mkdirSync(path.join(siteRoot, VENN_DIR), { recursive: true });
  // Cross-links point at the Sieve page; a stub keeps the path real.
  var sieveDir = path.join(siteRoot, "Sieve Of Eratosthenes");
  fs.mkdirSync(sieveDir, { recursive: true });
  fs.writeFileSync(path.join(sieveDir, "sieve-of-eratosthenes.html"), "<!doctype html><title>stub</title>");
  return siteRoot;
}

var ERROR_COLLECTOR = "<script>(function(){window.__o9gErrors=[];" +
  "window.addEventListener('error',function(e){window.__o9gErrors.push(String(e.message));});" +
  "window.addEventListener('unhandledrejection',function(e){window.__o9gErrors.push(String(e.reason));});" +
  "var ce=console.error;console.error=function(){window.__o9gErrors.push(Array.prototype.join.call(arguments,' '));return ce.apply(console,arguments);};" +
  "})();</script>";

function writeProbePage(siteRoot, key, str) {
  var p = PAGES[key];
  var src = fs.readFileSync(path.join(ROOT, VENN_DIR, VENN_FILE), "utf8");
  var cfg = { page: key, expected: p.expected, str: str, ref: reference(p) };
  var probe = "(" + inPage.toString() + ")(" + JSON.stringify(cfg) + ");";
  var markup = '<pre id="o9g-out"></pre>\n<script>\n' + probe + "\n</script>\n";
  var at = src.lastIndexOf("</body>");
  if (at < 0) throw new Error("no closing body tag in " + VENN_FILE);
  var head = /<head[^>]*>/.exec(src);
  if (!head) throw new Error("no opening head tag in " + VENN_FILE);
  var hAt = head.index + head[0].length;
  var name = "probe-" + key + ".html";
  fs.writeFileSync(path.join(siteRoot, VENN_DIR, name),
    src.slice(0, hAt) + ERROR_COLLECTOR + src.slice(hAt, at) + markup + src.slice(at));
  return name;
}

function freePort() {
  return new Promise(function (resolve, reject) {
    var srv = net.createServer();
    srv.once("error", reject);
    srv.listen(0, "127.0.0.1", function () {
      var port = srv.address().port;
      srv.close(function () { resolve(port); });
    });
  });
}

function waitForServer(port, tries) {
  return new Promise(function (resolve, reject) {
    function attempt(n) {
      var req = http.get({ host: "127.0.0.1", port: port, path: "/", timeout: 1000 }, function (res) {
        res.resume();
        resolve();
      });
      req.on("error", function () {
        if (n <= 0) reject(new Error("http server did not answer on 127.0.0.1:" + port));
        else setTimeout(function () { attempt(n - 1); }, 200);
      });
      req.on("timeout", function () { req.destroy(); });
    }
    attempt(tries);
  });
}

function unescapeHtml(s) {
  return s.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, "&");
}

function runChrome(profileDir, pageUrl) {
  var args = [
    "--headless=new", "--disable-gpu", "--no-sandbox",
    "--user-data-dir=" + profileDir,
    "--virtual-time-budget=120000",
    "--window-size=1280,1100",
    "--dump-dom", pageUrl
  ];
  var res = cp.spawnSync("google-chrome", args, {
    encoding: "utf8", maxBuffer: 200 * 1024 * 1024, timeout: 240000, env: harness.chromeEnv()
  });
  return res.stdout || "";
}

function runPage(siteRoot, port, key, str) {
  var p = PAGES[key];
  var profileDir = harness.mkScratch("o9g-profile-");
  var tag = "[" + key + "] ";
  var name = writeProbePage(siteRoot, key, str);
  var pageUrl = "http://127.0.0.1:" + port + "/" + encodeURIComponent(VENN_DIR) + "/" + name + p.query;
  var dom = runChrome(profileDir, pageUrl);
  var pass = 0, fail = 0;
  var m = /<pre id="o9g-out"([^>]*)>([\s\S]*?)<\/pre>/.exec(dom);
  if (!m) {
    console.log("FAIL " + tag + "probe output <pre id=\"o9g-out\"> missing from the dumped DOM");
    fail++;
  } else {
    var lines = unescapeHtml(m[2]).split("\n").filter(function (l) { return l.length > 0; });
    lines.forEach(function (l) { console.log(tag + l); });
    pass = lines.filter(function (l) { return /^PASS/.test(l); }).length;
    fail = lines.filter(function (l) { return /^FAIL/.test(l); }).length;
    if (!/data-done="1"/.test(m[1])) {
      console.log("FAIL " + tag + "the probe did not finish (virtual-time budget exhausted?)");
      fail++;
    }
    if (pass + fail < p.expected) fail++;
  }
  try { fs.rmSync(profileDir, { recursive: true, force: true }); } catch (e) { /* best effort */ }
  return { pass: pass, fail: fail };
}

// --shots: open the fold at A=12, B=18 and screenshot stage 3 in both themes.
// Headless virtual time does not advance CSS transitions, so the shots page
// switches them off; the autoplay timers still run inside the time budget.
function writeShotsPage(siteRoot) {
  var src = fs.readFileSync(path.join(ROOT, VENN_DIR, VENN_FILE), "utf8");
  var script = "<script>(" + function () {
    var st = document.createElement("style");
    st.textContent = "*, *::before, *::after { transition: none !important; animation: none !important; }";
    document.head.appendChild(st);
    window.addEventListener("load", function () {
      setTimeout(function () { document.getElementById("lcm-toggle").click(); }, 300);
    });
  }.toString() + ")();</script>\n";
  var at = src.lastIndexOf("</body>");
  if (at < 0) throw new Error("no closing body tag in " + VENN_FILE);
  fs.writeFileSync(path.join(siteRoot, VENN_DIR, "shots.html"), src.slice(0, at) + script + src.slice(at));
}

async function shots() {
  var siteRoot = buildSite();
  writeShotsPage(siteRoot);
  var port = await freePort();
  var server = cp.spawn("python3", ["-m", "http.server", String(port), "--bind", "127.0.0.1", "--directory", siteRoot], { stdio: "ignore" });
  process.on("exit", function () { try { server.kill("SIGKILL"); } catch (e) { /* already gone */ } });
  var failed = false;
  try {
    await waitForServer(port, 50);
    ["day", "night"].forEach(function (theme) {
      var profileDir = harness.mkScratch("o9g-shot-profile-");
      var target = path.join(__dirname, "lcm-" + theme + ".png");
      var url = "http://127.0.0.1:" + port + "/" + encodeURIComponent(VENN_DIR) + "/shots.html?a=12&b=18&lang=en&theme=" + theme;
      cp.spawnSync("google-chrome", [
        "--headless=new", "--disable-gpu", "--no-sandbox", "--hide-scrollbars",
        "--user-data-dir=" + profileDir, "--virtual-time-budget=10000",
        "--window-size=1280,2600", "--screenshot=" + target, url
      ], { encoding: "utf8", timeout: 120000, env: harness.chromeEnv() });
      try { fs.rmSync(profileDir, { recursive: true, force: true }); } catch (e) { /* best effort */ }
      var ok = fs.existsSync(target) && fs.statSync(target).size > 0;
      console.log((ok ? "wrote " : "FAILED ") + target);
      if (!ok) failed = true;
    });
  } finally {
    try { server.kill("SIGTERM"); } catch (e) { /* already gone */ }
    try { fs.rmSync(siteRoot, { recursive: true, force: true }); } catch (e) { /* best effort */ }
  }
  process.exit(failed ? 1 : 0);
}

async function main() {
  if (process.argv[2] === "--shots") return shots();
  var which = process.argv[2] || "all";
  var keys = which === "all" ? Object.keys(PAGES) : [which];
  keys.forEach(function (k) {
    if (!PAGES[k]) { console.log("unknown run " + k + " (use " + Object.keys(PAGES).join(", ") + " or all)"); process.exit(2); }
  });
  checkInlineScripts();
  var str = expectedStrings();
  var siteRoot = buildSite();
  var port = await freePort();
  var server = cp.spawn("python3", ["-m", "http.server", String(port), "--bind", "127.0.0.1", "--directory", siteRoot], { stdio: "ignore" });
  process.on("exit", function () { try { server.kill("SIGKILL"); } catch (e) { /* already gone */ } });
  var pass = 0, fail = 0, expected = 0;
  try {
    await waitForServer(port, 50);
    keys.forEach(function (k) {
      var r = runPage(siteRoot, port, k, str);
      pass += r.pass;
      fail += r.fail;
      expected += PAGES[k].expected;
    });
  } catch (e) {
    console.log("FAIL probe harness: " + (e && e.message ? e.message : e));
    fail++;
  } finally {
    try { server.kill("SIGTERM"); } catch (e) { /* already gone */ }
  }
  try { fs.rmSync(siteRoot, { recursive: true, force: true }); } catch (e) { /* best effort */ }
  if (fail > 0 || pass !== expected) {
    console.log("O9G-PROBE FAIL (" + pass + " pass, " + fail + " fail, expected " + expected + " scenarios)");
    process.exit(1);
  }
  console.log("O9G-PROBE PASS (" + pass + " scenarios)");
  process.exit(0);
}

main();
