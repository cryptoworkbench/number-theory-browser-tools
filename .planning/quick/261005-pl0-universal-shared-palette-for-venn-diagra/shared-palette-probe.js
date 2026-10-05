"use strict";
/*
 * Dev-only regression probe for quick task 261005-pl0: one shared number
 * palette (NT.store's number-palette) for Factor Tree and Venn Diagram, and
 * the Sieve of Eratosthenes' "Add found primes to palette" button.
 * Never referenced by any page. Node built-ins + the in-repo harness only.
 *
 * Node side: evaluates assets/nt-store.js in a vm context with the harness's
 * cookie jar and storage stand-ins (N1-N8).
 * Chrome side: copies assets/ and the three tool pages into a scratch site,
 * injects an in-page probe, and runs headless Chrome once per page. A
 * "sequence" is a list of page runs that share ONE --user-data-dir, so
 * localStorage carries over from page to page exactly as it does for a
 * visitor. PASS/FAIL lines come back through a <pre> in the dumped DOM.
 */

var fs = require("fs");
var path = require("path");
var cp = require("child_process");
var url = require("url");

var ROOT = path.resolve(__dirname, "..", "..", "..");
var harness = require(path.join(ROOT, ".planning", "phases", "07-shared-js-module-refactor", "harness.js"));

// Total scenarios this probe must report; every task that appends scenarios
// raises it.
var EXPECTED = 11;

var PAGES = {
  ft: { dir: "Factor Tree", file: "factor-tree.html" },
  venn: { dir: "Venn Diagram", file: "venn-diagram.html" },
  sieve: { dir: "Sieve Of Eratosthenes", file: "sieve-of-eratosthenes.html" }
};

// Each sequence runs against its own fresh profile. A run is [page, scenario
// key]; the key selects the in-page step list.
var SEQUENCES = [
  { name: "C", runs: [["ft", "C1a"], ["venn", "C1b"]] }
];

var DEFAULT30 = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97, 101, 103, 107, 109, 113];

/* ---------- node-side scenarios (NT.store in a vm context) ---------- */

function nodeScenario(name, fn) {
  try { console.log("PASS " + name + ": " + fn()); return 1; }
  catch (e) { console.log("FAIL " + name + ": " + (e && e.message ? e.message : e)); return 0; }
}

function nodeAssert(cond, msg) { if (!cond) throw new Error(msg); }
function same(a, b, msg) { nodeAssert(JSON.stringify(a) === JSON.stringify(b), msg + ": got " + JSON.stringify(a) + ", expected " + JSON.stringify(b)); }

function freshEnv() {
  var jar = harness.makeCookieJar({});
  var storage = harness.makeStorage({});
  var NT = harness.loadNew({ globals: { document: jar.document, localStorage: storage }, exclude: ["nt-i18n.js"] });
  return { store: NT.store, jar: jar, storage: storage };
}

function runNodeScenarios() {
  var pass = 0;
  var KEY = "number-palette";

  pass += nodeScenario("N1 default-palette", function () {
    var e = freshEnv();
    same(e.store.loadSharedPalette(), DEFAULT30, "default list");
    nodeAssert(e.storage._data[KEY] === JSON.stringify(DEFAULT30), "localStorage lacks number-palette");
    nodeAssert(e.jar._log.some(function (l) { return l.indexOf(KEY + "=") === 0; }), "cookie log lacks number-palette");
    return "an empty profile loads the 30 primes 2..113 and persists them to both channels";
  });

  pass += nodeScenario("N2 legacy-migration", function () {
    var e = freshEnv();
    e.storage.setItem("factor-tree-palette", "[60,2,3,60]");
    same(e.store.loadSharedPalette(), [2, 3, 60, 60], "migrated list");
    nodeAssert(e.storage._data[KEY] === "[2,3,60,60]", "shared key not written");
    nodeAssert(!("factor-tree-palette" in e.storage._data), "legacy key still present");
    return "the old Factor Tree key is carried into the shared key and removed";
  });

  pass += nodeScenario("N3 merge-both", function () {
    var e = freshEnv();
    e.storage.setItem(KEY, "[2,3,5]");
    e.storage.setItem("factor-tree-palette", "[3,3,77]");
    same(e.store.loadSharedPalette(), [2, 3, 3, 5, 77], "merged list");
    nodeAssert(!("factor-tree-palette" in e.storage._data), "legacy key still present");
    return "both present: max-count multiset merge, legacy key removed";
  });

  pass += nodeScenario("N4 validation", function () {
    var e = freshEnv();
    var bad = ["{}", "7", "[2,3.5]", "[0]", "[1]", "[2.5]", '["7"]', "[1000000000001]", JSON.stringify(new Array(1001).fill(2))];
    bad.forEach(function (raw) {
      nodeAssert(e.store.readSharedPalette(raw) === null, "accepted " + raw.slice(0, 30));
    });
    same(e.store.readSharedPalette("[]"), [], "empty array");
    same(e.store.readSharedPalette("[9,4,2]"), [2, 4, 9], "sorted copy");
    same(e.store.readSharedPalette(JSON.stringify(new Array(1000).fill(2))).length, 1000, "1000 entries");
    return "non-arrays, 1001 entries, 0, 1, 2.5, a string and 1e12+1 are rejected; [] is valid; the result is sorted";
  });

  pass += nodeScenario("N5 add-duplicates", function () {
    var e = freshEnv();
    e.store.addToSharedPalette([60], false);
    var r = e.store.addToSharedPalette([60], false);
    same(r.list.filter(function (n) { return n === 60; }).length, 2, "two 60s");
    same(r.list.slice().sort(function (a, b) { return a - b; }), r.list, "ascending");
    var u = e.store.addToSharedPalette([2, 3, 127], true);
    same(u.added, [127], "added");
    nodeAssert(u.duplicates === 2, "duplicates " + u.duplicates);
    return "manual adds keep duplicates, unique adds skip them";
  });

  pass += nodeScenario("N6 cap", function () {
    var e = freshEnv();
    var list = [];
    for (var n = 2; n <= 1000; n++) list.push(n);
    nodeAssert(list.length === 999, "setup");
    e.storage.setItem(KEY, JSON.stringify(list));
    var r = e.store.addToSharedPalette([2000, 2001, 2002], true);
    nodeAssert(r.added.length === 1 && r.added[0] === 2000, "added " + JSON.stringify(r.added));
    nodeAssert(r.overflow === 2, "overflow " + r.overflow);
    nodeAssert(r.list.length === 1000, "length " + r.list.length);
    return "999 + three unique adds -> 1 added, 2 overflow, length 1000";
  });

  pass += nodeScenario("N7 remove-one", function () {
    var e = freshEnv();
    e.storage.setItem(KEY, "[60,60]");
    same(e.store.removeFromSharedPalette(60), [60], "one removed");
    same(e.store.removeFromSharedPalette(999), [60], "absent value");
    return "removal takes exactly one occurrence; an absent value changes nothing";
  });

  pass += nodeScenario("N8 oversized-cookie", function () {
    var e = freshEnv();
    var big = [];
    for (var i = 0; i < 600; i++) big.push(1000000000 + i);
    e.store.addToSharedPalette(big, false);
    var last = e.jar._log[e.jar._log.length - 1];
    nodeAssert(last.indexOf(KEY + "=") === 0 && /max-age=0/.test(last), "last cookie write was " + last.slice(0, 60));
    nodeAssert(JSON.parse(e.storage._data[KEY]).length === 630, "localStorage lacks the full payload");
    var v = function (p) { return Array.isArray(p) ? p : null; };
    e.store.writeShared(KEY, [2, 3], v);
    var small = e.jar._log[e.jar._log.length - 1];
    nodeAssert(/max-age=31536000/.test(small), "small write did not set a normal cookie: " + small.slice(0, 60));
    return "an over-3800-char payload expires the cookie and rides localStorage; a small write sets a cookie again";
  });

  return pass;
}

/* ---------- in-page probe (serialised into the scratch pages) ---------- */

function inPage(cfg) {
  var out = document.getElementById("pl0-out");
  var lines = [];
  var errors = [];
  var KEY = "number-palette";

  window.addEventListener("error", function (e) { errors.push(String(e.message || e)); });

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
        waited += 50;
        setTimeout(poll, 50);
      })();
    });
  }
  var arr = function (list) { return Array.prototype.slice.call(list); };
  var texts = function (sel) { return arr(document.querySelectorAll(sel)).map(function (el) { return el.textContent; }); };
  var ftItems = function () { return texts("#palette .palette-item"); };
  var vennChips = function () { return texts("#prime-picker .prime-chip"); };
  var msg = function () { return document.getElementById("message").textContent; };
  var stored = function () { return localStorage.getItem(KEY); };
  var storedList = function () { return JSON.parse(stored()); };
  function noErrors(label) { assert(errors.length === 0, label + ": window errors: " + errors.join(" | ")); }
  function same(a, b, label) {
    assert(JSON.stringify(a) === JSON.stringify(b), label + ": got " + JSON.stringify(a).slice(0, 200) + ", expected " + JSON.stringify(b).slice(0, 200));
  }
  function sortedNums(list) { return list.slice().sort(function (a, b) { return a - b; }); }
  function plainPrimes(count, from) {
    var out = [];
    for (var n = from || 2; out.length < count; n++) {
      var ok = n > 1;
      for (var d = 2; d * d <= n && ok; d++) if (n % d === 0) ok = false;
      if (ok) out.push(n);
    }
    return out;
  }
  var DEFAULT30 = plainPrimes(30);

  var defs = {};

  /* C1: Factor Tree adds 60; C1 (page 2) Venn reads the same list */
  defs.C1a = function () {
    return [{ name: "C1a ft-add-60", fn: function () {
      same(ftItems(), DEFAULT30.map(String), "fresh Factor Tree palette");
      var input = document.getElementById("addInput");
      input.value = "60";
      document.getElementById("addBtn").click();
      var want = sortedNums(DEFAULT30.concat([60])).map(String);
      same(ftItems(), want, "Factor Tree after adding 60");
      same(storedList(), sortedNums(DEFAULT30.concat([60])), "stored list");
      noErrors("C1a");
      return "Factor Tree shows 31 circles and stores the shared list";
    } }];
  };
  defs.C1b = function () {
    return [
      { name: "C1b venn-reads-shared", fn: function () {
        var want = sortedNums(DEFAULT30.concat([60])).map(String);
        same(vennChips(), want, "Venn chips");
        assert(vennChips().length === 31, "31 chips expected");
        noErrors("C1b");
        return "Venn's 31 chips match Factor Tree's circles in order, including 60";
      } },
      { name: "C2 storage-event-adopted-not-written", fn: function () {
        var before = stored();
        window.dispatchEvent(new StorageEvent("storage", { key: KEY, newValue: JSON.stringify([2, 3, 77]) }));
        same(vennChips(), ["2", "3", "77"], "chips after storage event");
        assert(stored() === before, "the storage handler wrote the store");
        window.dispatchEvent(new StorageEvent("storage", { key: KEY, newValue: "garbage" }));
        same(vennChips(), ["2", "3", "77"], "chips after a malformed storage event");
        noErrors("C2");
        return "a storage event re-renders the chips and never writes back; a malformed one is ignored";
      } }
    ];
  };

  var steps = defs[cfg.run]();
  var chain = Promise.resolve();
  window.addEventListener("load", function () {
    steps.forEach(function (s) {
      chain = chain.then(function () {
        return sleep(30).then(s.fn).then(
          function (m) { emit("PASS " + s.name + ": " + m); },
          function (e) { emit("FAIL " + s.name + ": " + (e && e.message ? e.message : e)); }
        );
      });
    });
    chain = chain.then(function () { out.setAttribute("data-done", "1"); });
  });
}

/* ---------- Chrome runner ---------- */

function buildSite() {
  var siteRoot = harness.mkScratch("pl0-site-");
  fs.cpSync(path.join(ROOT, "assets"), path.join(siteRoot, "assets"), { recursive: true });
  Object.keys(PAGES).forEach(function (key) {
    var p = PAGES[key];
    var destDir = path.join(siteRoot, p.dir);
    fs.mkdirSync(destDir, { recursive: true });
    fs.copyFileSync(path.join(ROOT, p.dir, p.file), path.join(destDir, p.file));
  });
  return siteRoot;
}

// Injects the probe for one scenario key into a copy of the page.
function pageFor(siteRoot, pageKey, run) {
  var p = PAGES[pageKey];
  var src = fs.readFileSync(path.join(ROOT, p.dir, p.file), "utf8");
  var probe = "(" + inPage.toString() + ")(" + JSON.stringify({ run: run }) + ");";
  var markup = '<pre id="pl0-out"></pre>\n<script>\n' + probe + "\n</script>\n";
  var at = src.lastIndexOf("</body>");
  if (at < 0) throw new Error("no closing body tag in " + p.file);
  var dest = path.join(siteRoot, p.dir, "probe-" + run + ".html");
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

function runSequence(siteRoot, seq) {
  var profileDir = harness.mkScratch("pl0-profile-");
  var pass = 0, fail = 0;
  seq.runs.forEach(function (run) {
    var tag = "[" + seq.name + ":" + run[0] + ":" + run[1] + "] ";
    var page = pageFor(siteRoot, run[0], run[1]);
    var dom = runChrome(profileDir, url.pathToFileURL(page).href + "?lang=en");
    var m = /<pre id="pl0-out"([^>]*)>([\s\S]*?)<\/pre>/.exec(dom);
    if (!m) {
      console.log("FAIL " + tag + "probe output <pre id=\"pl0-out\"> missing from the dumped DOM");
      fail++;
      return;
    }
    var out = unescapeHtml(m[2]).split("\n").filter(function (l) { return l.length > 0; });
    out.forEach(function (l) { console.log(tag + l); });
    pass += out.filter(function (l) { return /^PASS/.test(l); }).length;
    fail += out.filter(function (l) { return /^FAIL/.test(l); }).length;
    if (!/data-done="1"/.test(m[1])) {
      console.log("FAIL " + tag + "the probe did not finish (virtual-time budget exhausted?)");
      fail++;
    }
  });
  try { fs.rmSync(profileDir, { recursive: true, force: true }); } catch (e) { /* best effort */ }
  return { pass: pass, fail: fail };
}

function main() {
  var pass = runNodeScenarios();
  var fail = 8 - pass;
  var siteRoot = buildSite();
  SEQUENCES.forEach(function (seq) {
    var r = runSequence(siteRoot, seq);
    pass += r.pass;
    fail += r.fail;
  });
  if (fail > 0 || pass !== EXPECTED) {
    console.log("PL0-PROBE FAIL (" + pass + " pass, " + fail + " fail, expected " + EXPECTED + " scenarios)");
    process.exit(1);
  }
  console.log("PL0-PROBE PASS (" + pass + " scenarios)");
  process.exit(0);
}

main();
