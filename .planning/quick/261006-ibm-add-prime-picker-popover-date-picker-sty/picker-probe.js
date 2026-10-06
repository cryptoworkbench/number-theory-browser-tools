"use strict";
/*
 * Dev-only regression probe for quick task 261006-ibm: the shared prime
 * picker popover (NT.picker) on Diffie-Hellman Key Exchange (#pInput) and RSA
 * (#bob-p, #bob-q, #alice-p, #alice-q).
 * Never referenced by any page. Node built-ins + the in-repo harness only.
 *
 * Copies assets/ and both tool pages into a scratch site, injects an in-page
 * probe, and runs headless Chrome once per page with a fresh profile. PASS/FAIL
 * lines come back through a <pre> in the dumped DOM.
 *
 * Usage: node picker-probe.js [dh|rsa|all]   (default all)
 *
 * Extra, for visual review: PICKER_SHOTS=<dir> node picker-probe.js shots
 * writes open-popover screenshots (day and night, both pages) into <dir>.
 */

var fs = require("fs");
var path = require("path");
var cp = require("child_process");
var url = require("url");

var ROOT = path.resolve(__dirname, "..", "..", "..");
var harness = require(path.join(ROOT, ".planning", "phases", "07-shared-js-module-refactor", "harness.js"));
var vm = require("vm");

// Total scenarios this probe must report (12 DH + 6 RSA).
var EXPECTED = 18;

var PAGES = {
  dh: { dir: "Diffie-Hellman Key Exchange", file: "diffie-hellman-key-exchange.html", expected: 12 },
  rsa: { dir: "RSA", file: "rsa.html", expected: 6 }
};

// Same evaluation i18n-check.js's loadCatalog() does. It is repeated here
// because requiring i18n-check.js throws (its export list names the removed
// checkSiteFooter), so the file can only be run as a CLI.
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

function expectedStrings() {
  var cat = loadCatalog();
  function get(ns, lang, key) {
    var v = cat[ns] && cat[ns][lang] && cat[ns][lang][key];
    if (typeof v !== "string") throw new Error("missing catalog entry " + ns + "." + key + " for " + lang);
    return v;
  }
  return {
    openEn: get("common", "en", "primePickerOpen"),
    headingEn: get("common", "en", "primePickerHeading"),
    openDe: get("common", "de", "primePickerOpen"),
    headingDe: get("common", "de", "primePickerHeading"),
    sieveEn: get("site", "en", "nav.sieve"),
    sieveDe: get("site", "de", "nav.sieve")
  };
}

/* ---------- in-page probe (serialised into the page) ---------- */

function inPage(cfg) {
  var out = document.getElementById("ibm-out");
  var EXP = cfg.expected;

  function log(line) { out.textContent += line + "\n"; }
  function wait(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
  function eq(a, b, what) {
    var x = JSON.stringify(a), y = JSON.stringify(b);
    if (x !== y) throw new Error(what + ": got " + x + ", expected " + y);
  }
  function ok(c, what) { if (!c) throw new Error(what); }
  function visible(el) { return !!el && !el.hidden && el.offsetHeight > 0; }
  function chipTexts(pop) {
    return Array.prototype.map.call(pop.querySelectorAll(".prime-pop-chip"), function (c) { return c.textContent; });
  }
  function chipByText(pop, t) {
    var cs = pop.querySelectorAll(".prime-pop-chip");
    for (var i = 0; i < cs.length; i++) if (cs[i].textContent === t) return cs[i];
    throw new Error("no chip " + t);
  }
  function key(k) {
    var el = document.activeElement;
    el.dispatchEvent(new KeyboardEvent("keydown", { key: k, bubbles: true, cancelable: true }));
  }
  function primesBetween(lo, hi) {
    var r = [];
    for (var n = lo; n <= hi; n++) {
      var p = n > 1;
      for (var d = 2; d * d <= n; d++) if (n % d === 0) { p = false; break; }
      if (p) r.push(String(n));
    }
    return r;
  }
  function rectInside(inner, outer) {
    return inner.top >= outer.top - 0.5 && inner.bottom <= outer.bottom + 0.5 &&
      inner.left >= outer.left - 0.5 && inner.right <= outer.right + 0.5;
  }
  var results = 0;
  function scenario(name, fn) {
    return Promise.resolve().then(fn).then(function () {
      log("PASS " + name); results++;
    }, function (e) {
      log("FAIL " + name + ": " + (e && e.message ? e.message : e)); results++;
    });
  }

  function dhRun() {
    var input = document.getElementById("pInput");
    var trig = document.getElementById("pPickBtn");
    var pop = function () { return document.getElementById("pPickBtn-pop"); };
    var chain = Promise.resolve();
    function add(name, fn) { chain = chain.then(function () { return scenario(name, fn); }); }

    add("D1 trigger markup", function () {
      var ts = document.querySelectorAll(".prime-pop-trigger");
      eq(ts.length, 1, "trigger count");
      ok(ts[0] === trig, "trigger is #pPickBtn");
      ok(trig.previousElementSibling === input, "trigger right after #pInput");
      ok(trig.parentElement.classList.contains("prime-pop-field"), "inside .prime-pop-field");
      eq(trig.getAttribute("aria-haspopup"), "dialog", "aria-haspopup");
      eq(trig.getAttribute("aria-expanded"), "false", "aria-expanded");
      eq(trig.getAttribute("aria-controls"), "pPickBtn-pop", "aria-controls");
      eq(trig.getAttribute("aria-label"), cfg.str.openEn, "aria-label");
      eq(trig.getAttribute("title"), cfg.str.openEn, "title");
    });
    add("D2 click opens", function () {
      trig.click();
      ok(visible(pop()), "panel visible");
      eq(trig.getAttribute("aria-expanded"), "true", "aria-expanded");
      eq(pop().querySelector(".prime-pop-title").textContent, cfg.str.headingEn, "title text");
      var vis = Array.prototype.filter.call(document.querySelectorAll(".prime-pop"), visible);
      eq(vis.length, 1, "visible popovers");
    });
    add("D3 chips are the palette primes", function () {
      eq(chipTexts(pop()), primesBetween(5, 113), "chip texts");
      var chips = pop().querySelectorAll(".prime-pop-chip");
      var probe = document.createElement("span");
      probe.style.color = "var(--role-result)";
      document.body.appendChild(probe);
      var want = getComputedStyle(probe).color;
      probe.remove();
      for (var i = 0; i < chips.length; i++) {
        var c = chips[i];
        ok(c.tagName === "BUTTON" && c.type === "button", "chip is button[type=button]");
        eq(c.offsetHeight, 44, "chip height");
        eq(getComputedStyle(c).backgroundColor, want, "chip background");
      }
    });
    add("D4 two rows plus scroll", function () {
      var grid = pop().querySelector(".prime-pop-grid");
      ok(grid.scrollHeight - grid.clientHeight > 20, "grid scrolls: " + grid.scrollHeight + " vs " + grid.clientHeight);
      var gr = grid.getBoundingClientRect();
      var chips = pop().querySelectorAll(".prime-pop-chip");
      var inside = 0;
      for (var i = 0; i < chips.length; i++) if (rectInside(chips[i].getBoundingClientRect(), gr)) inside++;
      ok(inside >= 4 && inside <= 12, "chips fully inside: " + inside);
      grid.scrollTop = grid.scrollHeight;
      var last = chips[chips.length - 1];
      ok(rectInside(last.getBoundingClientRect(), grid.getBoundingClientRect()), "last chip inside after scroll");
      grid.scrollTop = 0;
    });
    add("D5 current value focused, panel anchored", function () {
      var c = chipByText(pop(), "23");
      eq(c.getAttribute("aria-current"), "true", "aria-current");
      ok(document.activeElement === c, "23 focused");
      var pr = pop().getBoundingClientRect();
      var ir = input.getBoundingClientRect();
      // The panel sits under the field, or above it when the room below is too small.
      if (pop().classList.contains("is-above")) ok(pr.bottom <= ir.top + 1, "panel bottom " + pr.bottom + " above input top " + ir.top);
      else ok(pr.top >= ir.bottom - 1, "panel top " + pr.top + " below input bottom " + ir.bottom);
      ok(pr.left >= 0 && pr.right <= document.documentElement.clientWidth, "panel inside viewport width");
    });
    add("D6 arrow keys, Home, End", function () {
      key("ArrowRight"); eq(document.activeElement.textContent, "29", "ArrowRight");
      key("ArrowLeft"); eq(document.activeElement.textContent, "23", "ArrowLeft");
      key("Home"); eq(document.activeElement.textContent, "5", "Home");
      key("End"); eq(document.activeElement.textContent, "113", "End");
    });
    add("D7 Escape closes and returns focus", function () {
      key("Escape");
      ok(!visible(pop()), "panel hidden");
      eq(trig.getAttribute("aria-expanded"), "false", "aria-expanded");
      ok(document.activeElement === trig, "focus on trigger");
    });
    add("D8 outside pointerdown closes", function () {
      trig.click();
      ok(visible(pop()), "reopened");
      document.body.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true }));
      ok(!visible(pop()), "panel hidden");
    });
    add("D9 pick fills field and rebuilds", function () {
      var counts = { input: 0, change: 0 };
      input.addEventListener("input", function () { counts.input++; });
      input.addEventListener("change", function () { counts.change++; });
      trig.click();
      chipByText(pop(), "47").click();
      eq(input.value, "47", "value");
      eq(counts, { input: 1, change: 1 }, "event counts");
      ok(!visible(pop()), "panel hidden");
      ok(document.activeElement === trig, "focus on trigger");
      eq(document.getElementById("errorBox").textContent, "", "error box");
      eq(JSON.parse(localStorage.getItem("diffie-hellman-key-exchange")).p, "47", "persisted p");
    });
    add("D10 filters composites, duplicates and small primes", function () {
      NT.store.clearSharedPalette();
      NT.store.addToSharedPalette([3, 4, 9, 15, 7919, 7919], false);
      trig.click();
      eq(chipTexts(pop()), ["7919"], "chips");
      key("Escape");
    });
    add("D11 storage event updates open panel", function () {
      trig.click();
      window.dispatchEvent(new StorageEvent("storage", { key: NT.store.SHARED_PALETTE_KEY, newValue: "[2,3,11,12,13]" }));
      eq(chipTexts(pop()), ["11", "13"], "chips");
      ok(visible(pop()), "panel stays open");
      key("Escape");
    });
    add("D12 empty state and language switch", function () {
      NT.store.clearSharedPalette();
      trig.click();
      eq(chipTexts(pop()).length, 0, "no chips");
      var empty = pop().querySelector(".prime-pop-empty");
      ok(visible(empty), "empty note visible");
      var link = empty.querySelector("a");
      eq(link.textContent, cfg.str.sieveEn, "link text");
      ok(link.getAttribute("href").indexOf("sieve-of-eratosthenes.html") >= 0, "link href " + link.getAttribute("href"));
      NT.i18n.setLang("de");
      ok(visible(pop()), "panel still open");
      eq(pop().querySelector(".prime-pop-title").textContent, cfg.str.headingDe, "de title");
      eq(trig.getAttribute("aria-label"), cfg.str.openDe, "de aria-label");
      eq(pop().querySelector(".prime-pop-empty a").textContent, cfg.str.sieveDe, "de link text");
    });
    return chain;
  }

  function rsaRun() {
    var ids = ["bob-p", "bob-q", "alice-p", "alice-q"];
    var chain = Promise.resolve();
    function add(name, fn) { chain = chain.then(function () { return scenario(name, fn); }); }
    function popOf(id) { return document.getElementById(id + "-pick-pop"); }
    function trigOf(id) { return document.getElementById(id + "-pick"); }

    add("R1 four triggers", function () {
      var ts = document.querySelectorAll(".prime-pop-trigger");
      eq(ts.length, 4, "trigger count");
      ids.forEach(function (id) {
        var t = trigOf(id);
        ok(t, "trigger " + id);
        ok(t.previousElementSibling === document.getElementById(id), id + " trigger right after input");
        ok(t.parentElement.classList.contains("prime-pop-field"), id + " wrapper");
        eq(t.getAttribute("aria-haspopup"), "dialog", id + " aria-haspopup");
        eq(t.getAttribute("aria-controls"), id + "-pick-pop", id + " aria-controls");
        eq(t.getAttribute("aria-label"), cfg.str.openEn, id + " aria-label");
      });
    });
    add("R2 bob-p lists primes 3..113", function () {
      trigOf("bob-p").click();
      ok(visible(popOf("bob-p")), "panel visible");
      eq(chipTexts(popOf("bob-p")), primesBetween(3, 113), "chips");
      eq(chipByText(popOf("bob-p"), "61").getAttribute("aria-current"), "true", "61 current");
    });
    add("R3 one panel at a time", function () {
      trigOf("alice-q").click();
      var vis = Array.prototype.filter.call(document.querySelectorAll(".prime-pop"), visible);
      eq(vis.length, 1, "visible popovers");
      ok(vis[0] === popOf("alice-q"), "alice-q panel is the open one");
      eq(trigOf("bob-p").getAttribute("aria-expanded"), "false", "bob-p aria-expanded");
      key("Escape");
    });
    var before;
    add("R4 pick fills only", function () {
      var o = document.getElementById("bob-output");
      before = o.textContent;
      trigOf("bob-p").click();
      chipByText(popOf("bob-p"), "67").click();
      eq(document.getElementById("bob-p").value, "67", "value");
      ok(!visible(popOf("bob-p")), "panel hidden");
      eq(o.textContent, before, "output unchanged");
    });
    add("R5 Generate commits the picked prime", function () {
      document.getElementById("bob-gen-btn").click();
      eq(document.getElementById("bob-error").textContent, "", "error");
      ok(/3,?551/.test(document.getElementById("bob-output").textContent), "n = 3551 in output");
    });
    add("R6 trigger toggles", function () {
      var t = trigOf("bob-q");
      t.click();
      ok(visible(popOf("bob-q")), "opened");
      t.click();
      ok(!visible(popOf("bob-q")), "closed by second click");
      ok(document.activeElement === t, "focus on trigger");
    });
    return chain;
  }

  window.addEventListener("load", function () {
    setTimeout(function () {
      var run = cfg.page === "dh" ? dhRun() : rsaRun();
      run.then(function () {
        if (results !== EXP) log("FAIL ran " + results + " scenarios, expected " + EXP);
        out.setAttribute("data-done", "1");
      }, function (e) {
        log("FAIL probe crashed: " + e);
        out.setAttribute("data-done", "1");
      });
    }, 50);
  });
}

/* ---------- Chrome runner ---------- */

function buildSite() {
  var siteRoot = harness.mkScratch("ibm-site-");
  fs.cpSync(path.join(ROOT, "assets"), path.join(siteRoot, "assets"), { recursive: true });
  Object.keys(PAGES).forEach(function (key) {
    var p = PAGES[key];
    var destDir = path.join(siteRoot, p.dir);
    fs.mkdirSync(destDir, { recursive: true });
    fs.copyFileSync(path.join(ROOT, p.dir, p.file), path.join(destDir, p.file));
  });
  // The empty-state link points at the Sieve page; a stub keeps the path real.
  var sieveDir = path.join(siteRoot, "Sieve Of Eratosthenes");
  fs.mkdirSync(sieveDir, { recursive: true });
  fs.writeFileSync(path.join(sieveDir, "sieve-of-eratosthenes.html"), "<!doctype html><title>stub</title>");
  return siteRoot;
}

function pageFor(siteRoot, pageKey, str) {
  var p = PAGES[pageKey];
  var src = fs.readFileSync(path.join(ROOT, p.dir, p.file), "utf8");
  var cfg = { page: pageKey, expected: p.expected, str: str };
  var probe = "(" + inPage.toString() + ")(" + JSON.stringify(cfg) + ");";
  var markup = '<pre id="ibm-out"></pre>\n<script>\n' + probe + "\n</script>\n";
  var at = src.lastIndexOf("</body>");
  if (at < 0) throw new Error("no closing body tag in " + p.file);
  var dest = path.join(siteRoot, p.dir, "probe-" + pageKey + ".html");
  fs.writeFileSync(dest, src.slice(0, at) + markup + src.slice(at));
  return dest;
}

function unescapeHtml(s) {
  return s.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, "&");
}

function runChrome(profileDir, fileUrl) {
  var args = [
    "--headless=new", "--disable-gpu", "--no-sandbox",
    "--user-data-dir=" + profileDir,
    "--virtual-time-budget=60000",
    "--window-size=1280,900",
    "--dump-dom", fileUrl
  ];
  var res = cp.spawnSync("google-chrome", args, {
    encoding: "utf8", maxBuffer: 200 * 1024 * 1024, timeout: 240000, env: harness.chromeEnv()
  });
  return res.stdout || "";
}

function runPage(siteRoot, pageKey, str) {
  var profileDir = harness.mkScratch("ibm-profile-");
  var tag = "[" + pageKey + "] ";
  var page = pageFor(siteRoot, pageKey, str);
  var dom = runChrome(profileDir, url.pathToFileURL(page).href + "?lang=en");
  var pass = 0, fail = 0;
  var m = /<pre id="ibm-out"([^>]*)>([\s\S]*?)<\/pre>/.exec(dom);
  if (!m) {
    console.log("FAIL " + tag + "probe output <pre id=\"ibm-out\"> missing from the dumped DOM");
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
    if (pass + fail < PAGES[pageKey].expected) fail++;
  }
  try { fs.rmSync(profileDir, { recursive: true, force: true }); } catch (e) { /* best effort */ }
  return { pass: pass, fail: fail };
}

/* ---------- screenshots (visual review, not part of the pass/fail run) ---------- */

// Seeds a long palette, opens the popover on the page's first prime field and
// screenshots the window. theme is "day" or "night".
function shot(siteRoot, pageKey, theme, outFile) {
  var p = PAGES[pageKey];
  var src = fs.readFileSync(path.join(ROOT, p.dir, p.file), "utf8");
  var trigId = pageKey === "dh" ? "pPickBtn" : "bob-p-pick";
  var seed = function (cfg) {
    var primes = [];
    for (var n = 2; primes.length < 120; n++) {
      var q = true;
      for (var d = 2; d * d <= n; d++) if (n % d === 0) { q = false; break; }
      if (q) primes.push(n);
    }
    primes.push(7919, 7927, 104729, 4, 6, 9);
    primes.sort(function (a, b) { return a - b; });
    var raw = JSON.stringify(primes);
    try { localStorage.setItem("number-palette", raw); } catch (e) { /* ignore */ }
    try { document.documentElement.setAttribute("data-theme", cfg.theme); } catch (e) { /* ignore */ }
    window.addEventListener("load", function () {
      setTimeout(function () {
        document.documentElement.setAttribute("data-theme", cfg.theme);
        var btn = document.getElementById(cfg.trig);
        btn.scrollIntoView({ block: "center" });
        btn.click();
      }, 200);
    });
  };
  var inject = "<script>(" + seed.toString() + ")(" + JSON.stringify({ theme: theme, trig: trigId }) + ");</script>\n";
  var at = src.lastIndexOf("</body>");
  var dest = path.join(siteRoot, p.dir, "shot-" + pageKey + "-" + theme + ".html");
  fs.writeFileSync(dest, src.slice(0, at) + inject + src.slice(at));
  var profileDir = harness.mkScratch("ibm-shot-profile-");
  var args = [
    "--headless=new", "--disable-gpu", "--no-sandbox",
    "--user-data-dir=" + profileDir,
    "--virtual-time-budget=8000",
    "--window-size=1280,900",
    "--force-prefers-color-scheme=" + (theme === "night" ? "dark" : "light"),
    "--screenshot=" + outFile,
    url.pathToFileURL(dest).href + "?lang=en&theme=" + theme
  ];
  cp.spawnSync("google-chrome", args, { encoding: "utf8", timeout: 120000, env: harness.chromeEnv() });
  try { fs.rmSync(profileDir, { recursive: true, force: true }); } catch (e) { /* best effort */ }
}

function main() {
  var which = process.argv[2] || "all";
  var str = expectedStrings();
  var siteRoot = buildSite();
  if (which === "shots") {
    var dir = process.env.PICKER_SHOTS;
    if (!dir) { console.log("set PICKER_SHOTS=<dir>"); process.exit(2); }
    fs.mkdirSync(dir, { recursive: true });
    ["dh", "rsa"].forEach(function (k) {
      ["day", "night"].forEach(function (t) {
        var f = path.join(dir, "picker-" + k + "-" + t + ".png");
        shot(siteRoot, k, t, f);
        console.log("shot " + f);
      });
    });
    process.exit(0);
  }
  var keys = which === "all" ? ["dh", "rsa"] : [which];
  keys.forEach(function (k) {
    if (!PAGES[k]) { console.log("unknown page " + k + " (use dh, rsa or all)"); process.exit(2); }
  });
  var pass = 0, fail = 0, expected = 0;
  keys.forEach(function (k) {
    var r = runPage(siteRoot, k, str);
    pass += r.pass;
    fail += r.fail;
    expected += PAGES[k].expected;
  });
  if (fail > 0 || pass !== expected) {
    console.log("PICKER-PROBE FAIL (" + pass + " pass, " + fail + " fail, expected " + expected + " of " + EXPECTED + " scenarios)");
    process.exit(1);
  }
  console.log("PICKER-PROBE PASS (" + pass + " scenarios)");
  process.exit(0);
}

main();
