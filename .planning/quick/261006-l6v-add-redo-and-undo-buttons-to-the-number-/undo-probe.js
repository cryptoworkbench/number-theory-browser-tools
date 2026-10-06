"use strict";
/*
 * Dev-only regression probe for quick task 261006-l6v: Undo/Redo buttons for
 * the shared number palette and the working area on Factor Tree and Venn
 * Diagram, plus NT.store.writeSharedPalette.
 * Never referenced by any page. Node built-ins + the in-repo harness only.
 *
 * Copies assets/ and both tool pages into a scratch site, serves it with
 * `python3 -m http.server` bound to 127.0.0.1 only (never file://, so no real
 * browser storage is touched), injects an in-page probe, and runs headless
 * Chrome once per page with a throwaway profile. PASS/FAIL lines come back
 * through a <pre> in the dumped DOM.
 *
 * Usage: node undo-probe.js [ft|ftpair|venn|all]   (default all)
 */

var fs = require("fs");
var path = require("path");
var cp = require("child_process");
var net = require("net");
var http = require("http");
var vm = require("vm");

var ROOT = path.resolve(__dirname, "..", "..", "..");
var harness = require(path.join(ROOT, ".planning", "phases", "07-shared-js-module-refactor", "harness.js"));

// Pages this probe knows about; Tasks 2 and 3 register ftpair and venn.
var PAGES = {
  ft: { dir: "Factor Tree", file: "factor-tree.html", query: "?lang=en", expected: 9 }
};

// Same evaluation i18n-check.js's loadCatalog() does (requiring i18n-check.js
// itself throws, so it can only be run as a CLI).
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
  function get(lang, key) {
    var v = cat.common && cat.common[lang] && cat.common[lang][key];
    if (typeof v !== "string") throw new Error("missing catalog entry common." + key + " for " + lang);
    return v;
  }
  var out = {};
  ["en", "de"].forEach(function (lang) {
    out[lang] = {
      undoPalette: get(lang, "undoPalette"),
      redoPalette: get(lang, "redoPalette"),
      undoWork: get(lang, "undoWork"),
      redoWork: get(lang, "redoWork")
    };
  });
  return out;
}

/* ---------- in-page probe (serialised into the page) ---------- */

function inPage(cfg) {
  var out = document.getElementById("l6v-out");
  var EXP = cfg.expected;
  var EN = cfg.str.en, DE = cfg.str.de;

  function log(line) { out.textContent += line + "\n"; }
  function wait(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
  function eq(a, b, what) {
    var x = JSON.stringify(a), y = JSON.stringify(b);
    if (x !== y) throw new Error(what + ": got " + x + ", expected " + y);
  }
  function ok(c, what) { if (!c) throw new Error(what); }
  function $(id) { return document.getElementById(id); }
  function storedPalette() { return JSON.parse(localStorage.getItem("number-palette")); }
  var count = 0;
  function scenario(name, fn) {
    return Promise.resolve().then(fn).then(function () {
      log("PASS " + name); count++;
    }, function (e) {
      log("FAIL " + name + ": " + (e && e.message ? e.message : e)); count++;
    });
  }
  function center(el) {
    var r = el.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2, w: r.width, h: r.height };
  }
  function labelsOf(btn) { return { aria: btn.getAttribute("aria-label"), title: btn.getAttribute("title") }; }

  /* ----- Factor Tree helpers ----- */
  function circles() { return Array.prototype.slice.call(document.querySelectorAll("#palette .palette-item")); }
  function circleNs() { return circles().map(function (c) { return Number(c.getAttribute("data-n")); }); }
  function addNumber(n) {
    $("addInput").value = String(n);
    $("addBtn").click();
  }
  function storageEvent(raw) {
    window.dispatchEvent(new StorageEvent("storage", { key: "number-palette", newValue: raw }));
  }

  function ftRun() {
    var undoP = $("paletteUndoBtn"), redoP = $("paletteRedoBtn");
    var chain = Promise.resolve();
    function add(name, fn) { chain = chain.then(function () { return scenario(name, fn); }); }
    var baseline;

    add("S1 NT.store.writeSharedPalette", function () {
      ok(Object.isFrozen(NT.store), "NT.store frozen");
      ok(typeof NT.store.writeSharedPalette === "function", "writeSharedPalette exported");
      var orig = NT.store.loadSharedPalette();
      eq(NT.store.writeSharedPalette([5, 3, 3]), [3, 3, 5], "sorted return");
      eq(localStorage.getItem("number-palette"), "[3,3,5]", "stored");
      eq(NT.store.writeSharedPalette([1]), null, "invalid list returns null");
      eq(localStorage.getItem("number-palette"), "[3,3,5]", "invalid list writes nothing");
      eq(NT.store.writeSharedPalette("nope"), null, "non-array returns null");
      eq(NT.store.writeSharedPalette(orig), orig, "restore");
      eq(storedPalette(), orig, "store matches the page again");
      baseline = orig;
    });

    add("F1 palette button row", function () {
      var tools = document.querySelector(".palette-panel .palette-tools");
      eq(Array.prototype.map.call(tools.children, function (c) { return c.id; }),
        ["paletteBin", "paletteEmptyBtn", "paletteUndoBtn", "paletteRedoBtn"], "palette-tools children");
      var inputC = center($("addInput"));
      [[undoP, "undoPalette"], [redoP, "redoPalette"]].forEach(function (pair) {
        var b = pair[0];
        eq(b.getAttribute("type"), "button", b.id + " type");
        var c = center(b);
        ok(Math.abs(c.w - 40) < 0.6 && Math.abs(c.h - 40) < 0.6, b.id + " is 40x40, got " + c.w + "x" + c.h);
        ok(Math.abs(c.y - inputC.y) <= 1, b.id + " centred with #addInput");
        ok(b.disabled, b.id + " disabled at load");
        eq(getComputedStyle(b).opacity, "0.4", b.id + " disabled opacity");
        eq(labelsOf(b), { aria: EN[pair[1]], title: EN[pair[1]] }, b.id + " labels");
        eq(b.getAttribute("data-i18n-aria-label"), "common." + pair[1], b.id + " aria key");
        eq(b.getAttribute("data-i18n-title"), "common." + pair[1], b.id + " title key");
        ok(!!b.querySelector("svg"), b.id + " has an svg");
      });
    });

    add("F2 add, undo, redo", function () {
      var before = circleNs();
      addNumber(60);
      return wait(50).then(function () {
        eq(circleNs().filter(function (n) { return n === 60; }).length, 1, "60 added");
        ok(!undoP.disabled, "undo enabled after Add");
        ok(redoP.disabled, "redo disabled after Add");
        undoP.click();
        return wait(50);
      }).then(function () {
        eq(circleNs(), before, "circles after undo");
        eq(storedPalette(), before, "store after undo");
        ok(undoP.disabled && !redoP.disabled, "undo off, redo on");
        redoP.click();
        return wait(50);
      }).then(function () {
        eq(circleNs().filter(function (n) { return n === 60; }).length, 1, "60 back after redo");
        ok(storedPalette().indexOf(60) !== -1, "60 back in the store");
        ok(!undoP.disabled && redoP.disabled, "undo on, redo off");
      });
    });

    add("F3 new change empties redo", function () {
      undoP.click();
      return wait(50).then(function () {
        ok(!redoP.disabled, "redo enabled after undo");
        addNumber(77);
        return wait(50);
      }).then(function () {
        ok(redoP.disabled, "redo disabled after a new change");
        ok(!undoP.disabled, "undo enabled");
      });
    });

    add("F4 Delete all, undo", function () {
      var before = circleNs();
      var stored = storedPalette();
      $("paletteEmptyBtn").click();
      return wait(50).then(function () {
        eq(circleNs().length, 0, "emptied");
        undoP.click();
        return wait(50);
      }).then(function () {
        eq(circleNs().length, before.length, "circle count restored");
        eq(storedPalette(), stored, "store restored");
      });
    });

    add("F5 Delete-key removal, undo", function () {
      var before = circleNs();
      var stored = storedPalette();
      var first = circles()[0];
      first.focus();
      first.dispatchEvent(new KeyboardEvent("keydown", { key: "Delete", bubbles: true, cancelable: true }));
      return wait(50).then(function () {
        eq(circleNs().length, before.length - 1, "one removed");
        undoP.click();
        return wait(50);
      }).then(function () {
        eq(circleNs(), before, "circles restored");
        eq(storedPalette(), stored, "store restored");
      });
    });

    add("F6 stack cap of 100", function () {
      storageEvent(localStorage.getItem("number-palette"));
      ok(undoP.disabled && redoP.disabled, "history cleared first");
      var start = circleNs().length;
      var i = 0;
      function addNext() {
        if (i >= 105) return Promise.resolve();
        addNumber(100 + i);
        i++;
        return addNext();
      }
      return addNext().then(function () {
        eq(circleNs().length, start + 105, "105 added");
        var clicks = 0;
        while (!undoP.disabled && clicks < 200) { undoP.click(); clicks++; }
        eq(clicks, 100, "undo clicks until disabled");
        eq(circleNs().length, start + 5, "five oldest adds stay");
      });
    });

    add("F7 storage event resets palette history", function () {
      ok(!redoP.disabled, "redo has entries before the event");
      // Another tab wrote the list: the store holds it, then the event arrives.
      NT.store.writeSharedPalette([2, 3, 5]);
      storageEvent("[2,3,5]");
      eq(circleNs(), [2, 3, 5], "incoming list shown");
      ok(undoP.disabled && redoP.disabled, "both disabled");
    });

    add("F8 language relabels, history untouched", function () {
      addNumber(7);
      return wait(50).then(function () {
        ok(!undoP.disabled && redoP.disabled, "undo on, redo off");
        NT.i18n.setLang("de");
        return wait(50);
      }).then(function () {
        eq(labelsOf(undoP), { aria: DE.undoPalette, title: DE.undoPalette }, "de undo labels");
        eq(labelsOf(redoP), { aria: DE.redoPalette, title: DE.redoPalette }, "de redo labels");
        ok(!undoP.disabled && redoP.disabled, "disabled states kept");
        eq(circleNs(), [2, 3, 5, 7], "tool state kept");
        NT.i18n.setLang("en");
        return wait(50);
      }).then(function () {
        eq(labelsOf(undoP), { aria: EN.undoPalette, title: EN.undoPalette }, "en undo labels");
        eq(labelsOf(redoP), { aria: EN.redoPalette, title: EN.redoPalette }, "en redo labels");
      });
    });

    return chain;
  }

  var RUNNERS = { ft: ftRun };

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
  var siteRoot = harness.mkScratch("l6v-site-");
  fs.cpSync(path.join(ROOT, "assets"), path.join(siteRoot, "assets"), { recursive: true });
  var seen = {};
  Object.keys(PAGES).forEach(function (key) {
    var p = PAGES[key];
    if (seen[p.dir]) return;
    seen[p.dir] = true;
    var destDir = path.join(siteRoot, p.dir);
    fs.mkdirSync(destDir, { recursive: true });
  });
  // The empty-state link points at the Sieve page; a stub keeps the path real.
  var sieveDir = path.join(siteRoot, "Sieve Of Eratosthenes");
  fs.mkdirSync(sieveDir, { recursive: true });
  fs.writeFileSync(path.join(sieveDir, "sieve-of-eratosthenes.html"), "<!doctype html><title>stub</title>");
  return siteRoot;
}

function writeProbePage(siteRoot, pageKey, str) {
  var p = PAGES[pageKey];
  var src = fs.readFileSync(path.join(ROOT, p.dir, p.file), "utf8");
  var cfg = { page: pageKey, expected: p.expected, str: str };
  var probe = "(" + inPage.toString() + ")(" + JSON.stringify(cfg) + ");";
  var markup = '<pre id="l6v-out"></pre>\n<script>\n' + probe + "\n</script>\n";
  var at = src.lastIndexOf("</body>");
  if (at < 0) throw new Error("no closing body tag in " + p.file);
  var name = "probe-" + pageKey + ".html";
  fs.writeFileSync(path.join(siteRoot, p.dir, name), src.slice(0, at) + markup + src.slice(at));
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
    "--virtual-time-budget=60000",
    "--window-size=1280,900",
    "--dump-dom", pageUrl
  ];
  var res = cp.spawnSync("google-chrome", args, {
    encoding: "utf8", maxBuffer: 200 * 1024 * 1024, timeout: 240000, env: harness.chromeEnv()
  });
  return res.stdout || "";
}

function runPage(siteRoot, port, pageKey, str) {
  var p = PAGES[pageKey];
  var profileDir = harness.mkScratch("l6v-profile-");
  var tag = "[" + pageKey + "] ";
  var name = writeProbePage(siteRoot, pageKey, str);
  var pageUrl = "http://127.0.0.1:" + port + "/" + encodeURIComponent(p.dir) + "/" + name + p.query;
  var dom = runChrome(profileDir, pageUrl);
  var pass = 0, fail = 0;
  var m = /<pre id="l6v-out"([^>]*)>([\s\S]*?)<\/pre>/.exec(dom);
  if (!m) {
    console.log("FAIL " + tag + "probe output <pre id=\"l6v-out\"> missing from the dumped DOM");
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

async function main() {
  var which = process.argv[2] || "all";
  var keys = which === "all" ? Object.keys(PAGES) : [which];
  keys.forEach(function (k) {
    if (!PAGES[k]) { console.log("unknown page " + k + " (use " + Object.keys(PAGES).join(", ") + " or all)"); process.exit(2); }
  });
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
    console.log("L6V-PROBE FAIL (" + pass + " pass, " + fail + " fail, expected " + expected + " scenarios)");
    process.exit(1);
  }
  console.log("L6V-PROBE PASS (" + pass + " scenarios)");
  process.exit(0);
}

main();
