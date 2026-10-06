"use strict";
/*
 * Dev-only regression probe for quick task 261005-pl0: one shared number
 * palette (NT.store's number-palette) for Factor Tree and Venn Diagram, and
 * the Sieve of Eratosthenes' "Add found primes to palette" button.
 * Quick task 261006-dso extended the probe with sequence U (Venn palette head,
 * Delete all, chip look and palette Randomize) and flipped V5 to the new
 * prime/composite colour logic.
 * Quick task 261006-keu moved the bin and Delete all into the add row on both
 * pages: U1 now asserts the add-row placement, and sequence K (K1) asserts
 * Factor Tree's.
 * Quick task 261006-l6v added the palette Undo and Redo buttons after Delete all
 * on both pages: K1 (Factor Tree) and U1 (Venn) list the four-child row.
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
var EXPECTED = 29;

var PAGES = {
  ft: { dir: "Factor Tree", file: "factor-tree.html" },
  venn: { dir: "Venn Diagram", file: "venn-diagram.html" },
  sieve: { dir: "Sieve Of Eratosthenes", file: "sieve-of-eratosthenes.html" }
};

// Each sequence runs against its own fresh profile. A run is [page, scenario
// key]; the key selects the in-page step list.
var SEQUENCES = [
  { name: "C", runs: [["ft", "C1a"], ["venn", "C1b"]] },
  { name: "V", runs: [["venn", "V"], ["ft", "V6"]] },
  { name: "F", runs: [["ft", "F1"]] },
  { name: "S", runs: [["sieve", "S123"]] },
  { name: "S4", runs: [["sieve", "S4"], ["ft", "S5a"], ["venn", "S5b"]] },
  { name: "U", runs: [["venn", "U"]] },
  { name: "K", runs: [["ft", "K"]] }
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

  /* ---- Venn helpers ---- */
  var T = function (key, params) { return NT.i18n.translate(key, params); };
  var headingText = function () { return document.getElementById("picker-heading").textContent; };
  function chipNamed(text) {
    var f = arr(document.querySelectorAll("#prime-picker .prime-chip")).filter(function (c) { return c.textContent === text; });
    assert(f.length > 0, "no chip " + text);
    return f[0];
  }
  // Resolves a CSS custom property to its computed colour via a throwaway span inside .picker-panel.
  function token(name) {
    var span = document.createElement("span");
    span.style.color = "var(" + name + ")";
    document.querySelector(".picker-panel").appendChild(span);
    var v = getComputedStyle(span).color;
    span.remove();
    return v;
  }
  function tokenBg(name) {
    var span = document.createElement("span");
    span.style.backgroundColor = "var(" + name + ")";
    document.querySelector(".picker-panel").appendChild(span);
    var v = getComputedStyle(span).backgroundColor;
    span.remove();
    return v;
  }
  function addViaField(value) {
    var input = document.getElementById("palette-add-input");
    input.value = value;
    document.getElementById("palette-add-btn").click();
  }
  // The two-circle layer only: the three-circle layer keeps its own tokens, hidden, in two-circle mode.
  function placedTexts() { return texts("#venn-dynamic .placed-chip text"); }
  function dropOn(target, value) {
    var dt = new DataTransfer();
    dt.setData("text/plain", value);
    target.dispatchEvent(new DragEvent("dragover", { bubbles: true, cancelable: true, dataTransfer: dt }));
    var open = target.classList.contains("is-open");
    target.dispatchEvent(new DragEvent("drop", { bubbles: true, cancelable: true, dataTransfer: dt }));
    return open;
  }
  function largestPrimeBelow(limit) {
    for (var n = limit - 1; n > 2; n--) {
      var ok = true;
      for (var d = 2; d * d <= n; d++) { if (n % d === 0) { ok = false; break; } }
      if (ok) return n;
    }
    return 2;
  }

  defs.V = function () {
    return [
      { name: "V1 venn-add-field", fn: function () {
        same(vennChips(), DEFAULT30.map(String), "fresh Venn chips");
        assert(headingText() === T("venn.picker.heading"), "heading starts as " + headingText());
        addViaField("77");
        var want = sortedNums(DEFAULT30.concat([77])).map(String);
        same(vennChips(), want, "chips after adding 77");
        assert(msg() === "Added 77 to the palette.", "message reads " + msg());
        assert(headingText() === T("venn.picker.headingNumbers"), "heading reads " + headingText());
        [["", "venn.msg.empty"], ["1", "venn.msg.one"], ["0", "venn.msg.invalid"], ["1000000000001", "venn.msg.tooLarge"]].forEach(function (c) {
          addViaField(c[0]);
          same(vennChips(), want, "chips after a refused add of '" + c[0] + "'");
          assert(msg() === T(c[1]), "'" + c[0] + "' message reads " + msg());
        });
        noErrors("V1");
        return "Add inserts 77 in order, flips the heading, and refuses empty, 1, 0 and 1e12+1 with their own messages";
      } },
      { name: "V5 venn-chip-colours-prime-vs-composite", fn: function () {
        var prime = chipNamed("73"), composite = chipNamed("77");
        assert(prime.className === "prime-chip" && composite.className === "prime-chip", "classes " + prime.className + " / " + composite.className);
        assert(!prime.hasAttribute("data-composite"), "73 carries data-composite");
        assert(composite.hasAttribute("data-composite"), "77 lacks data-composite");
        var ps = getComputedStyle(prime), cs = getComputedStyle(composite);
        assert(ps.backgroundColor !== cs.backgroundColor, "the same background on a prime and a composite chip");
        assert(ps.backgroundColor === tokenBg("--role-result") && ps.color === token("--accent-ink"), "prime chip colours " + ps.backgroundColor + " / " + ps.color);
        assert(cs.backgroundColor === tokenBg("--role-composite") && cs.color === token("--role-composite-ink"), "composite chip colours " + cs.backgroundColor + " / " + cs.color);
        return "a prime chip is --role-result on --accent-ink; a composite chip (data-composite) is --role-composite on --role-composite-ink";
      } },
      { name: "V2 venn-delete-and-bin", fn: function () {
        var chip = chipNamed("77");
        chip.focus();
        chip.dispatchEvent(new KeyboardEvent("keydown", { key: "Delete", bubbles: true, cancelable: true }));
        assert(vennChips().indexOf("77") === -1, "77 still shown");
        assert(storedList().indexOf(77) === -1, "77 still stored");
        assert(document.activeElement && document.activeElement.classList.contains("prime-chip"), "focus is on " + (document.activeElement && document.activeElement.tagName));
        assert(msg() === "Removed 77 from the palette.", "message reads " + msg());
        addViaField("2");
        assert(vennChips().filter(function (t) { return t === "2"; }).length === 2, "two 2s expected");
        var open = dropOn(document.getElementById("palette-bin"), "2");
        assert(open, "bin did not open on dragover");
        assert(vennChips().filter(function (t) { return t === "2"; }).length === 1, "exactly one 2 should remain");
        assert(storedList().filter(function (n) { return n === 2; }).length === 1, "stored list should hold one 2");
        noErrors("V2");
        return "Delete removes the focused chip and keeps focus on a chip; dropping a chip on the bin removes exactly one occurrence";
      } },
      { name: "V3 venn-composite-placement", fn: function () {
        addViaField("12");
        addViaField("1024");
        addViaField("60");
        document.getElementById("clear-btn").click();
        chipNamed("12").click();
        document.getElementById("region-left").dispatchEvent(new MouseEvent("click", { bubbles: true }));
        same(sortedNums(placedTexts().map(Number)), [2, 2, 3], "two-circle tokens");
        assert(msg().indexOf("Placed 12 = 2 × 2 × 3 in the") === 0, "message reads " + msg());
        chipNamed("1024").click();
        document.getElementById("region-right").dispatchEvent(new MouseEvent("click", { bubbles: true }));
        same(sortedNums(placedTexts().map(Number)), [2, 2, 3], "tokens after the refused 1024");
        assert(document.getElementById("message").classList.contains("is-warn") && /full/.test(msg()), "no region-full warning: " + msg());
        document.getElementById("mode-three").click();
        document.getElementById("clear-btn").click();
        chipNamed("12").click();
        document.getElementById("region3-aOnly").dispatchEvent(new MouseEvent("click", { bubbles: true }));
        assert(texts("#venn3-dynamic .placed-chip text").length === 3, "three-circle tokens: " + texts("#venn3-dynamic .placed-chip text").join());
        chipNamed("60").click();
        document.getElementById("region3-bOnly").dispatchEvent(new MouseEvent("click", { bubbles: true }));
        assert(texts("#venn3-dynamic .placed-chip text").length === 3, "60 was placed in three-circle mode");
        assert(/full/.test(msg()), "no region-full warning for 60: " + msg());
        document.getElementById("mode-two").click();
        noErrors("V3");
        return "a composite places as its prime factors in one gesture; over-cap gestures are refused with the region-full warning in both modes";
      } },
      { name: "V4 venn-exact-integer-guard", fn: function () {
        var big = largestPrimeBelow(1000000000000);
        addViaField(String(big));
        document.getElementById("clear-btn").click();
        chipNamed(String(big)).click();
        document.getElementById("region-left").dispatchEvent(new MouseEvent("click", { bubbles: true }));
        same(placedTexts(), [String(big)], "tokens after the first placement");
        // a placed chip stays armed, so only arm it again when it is not
        if (chipNamed(String(big)).getAttribute("aria-pressed") !== "true") chipNamed(String(big)).click();
        document.getElementById("region-overlap").dispatchEvent(new MouseEvent("click", { bubbles: true }));
        same(placedTexts(), [String(big)], "tokens after the refused second placement");
        assert(msg() === T("venn.msg.tooLargeExact"), "message reads " + msg());
        noErrors("V4");
        return "prime " + big + " places once; a second copy that would push a circle past 2^53 is refused and nothing changes";
      } }
    ];
  };
  defs.V6 = function () {
    return [{ name: "V6 ft-shows-venn-edits", fn: function () {
      var list = storedList();
      same(ftItems(), list.map(String), "Factor Tree circles vs the stored list");
      ["12", "60", "1024"].forEach(function (t) { assert(ftItems().indexOf(t) !== -1, t + " missing"); });
      assert(ftItems().indexOf("77") === -1, "77 should be gone");
      assert(ftItems().filter(function (t) { return t === "2"; }).length === 1, "exactly one 2 expected");
      noErrors("V6");
      return "Factor Tree opens with exactly the palette Venn left behind";
    } }];
  };
  defs.F1 = function () {
    return [{ name: "F1 ft-palette-full", fn: function () {
      var list = [];
      for (var n = 2; n < 1002; n++) list.push(n);
      NT.store.writeShared(NT.store.SHARED_PALETTE_KEY, list, function (p) { return p; });
      var before = ftItems().length;
      var input = document.getElementById("addInput");
      input.value = "60";
      document.getElementById("addBtn").click();
      assert(msg() === T("factorTree.msgPaletteFull", { max: 1000 }), "message reads " + msg());
      assert(ftItems().length === before, "a circle was added");
      assert(storedList().length === 1000, "stored length " + storedList().length);
      noErrors("F1");
      return "a full 1000-entry palette refuses Add with the palette-full message and no circle appears";
    } }];
  };

  /* ---- Sieve helpers ---- */
  var sieveMsg = function () { return document.getElementById("paletteMsg").textContent; };
  var toPaletteBtn = function () { return document.getElementById("toPaletteBtn"); };
  function runSieve(size, primeCount) {
    document.getElementById("sizeInput").value = String(size);
    document.getElementById("generateBtn").click();
    document.getElementById("instantBtn").click();
    return waitFor(function () { return document.getElementById("statPrimes").textContent === String(primeCount); }, 20000)
      .then(function () { return waitFor(function () { return document.getElementById("statCurrent").textContent === T("sieve.stat.done"); }, 20000); });
  }

  defs.S123 = function () {
    return [
      { name: "S1 sieve-button-and-none", fn: function () {
        assert(toPaletteBtn().disabled, "button should start disabled");
        return runSieve(120, 30).then(function () {
          assert(!toPaletteBtn().disabled, "button should be enabled after the run");
          toPaletteBtn().click();
          assert(sieveMsg() === T("sieve.palette.none"), "message reads " + sieveMsg());
          same(storedList(), DEFAULT30, "store after a no-op merge");
          noErrors("S1");
          return "disabled until primes are found; merging 30 primes that are all present says so and changes nothing";
        });
      } },
      { name: "S2 sieve-merge-unique", fn: function () {
        return runSieve(200, 46).then(function () {
          assert(!toPaletteBtn().disabled, "button should be enabled");
          toPaletteBtn().click();
          assert(sieveMsg() === "Added 16 new primes to the palette — duplicates skipped: 30.", "message reads " + sieveMsg());
          assert(storedList().length === 46, "stored length " + storedList().length);
          same(storedList(), plainPrimes(46).filter(function (n) { return n <= 199; }), "stored list");
          toPaletteBtn().click();
          assert(sieveMsg() === T("sieve.palette.none"), "second click reads " + sieveMsg());
          assert(storedList().length === 46, "second click changed the length to " + storedList().length);
          noErrors("S2");
          return "16 new primes added with 30 duplicates skipped; a second click adds nothing";
        });
      } },
      { name: "S3 sieve-language-switch-and-reset", fn: function () {
        return runSieve(250, 53).then(function () {
          toPaletteBtn().click();
          assert(sieveMsg() === "Added 7 new primes to the palette — duplicates skipped: 46.", "message reads " + sieveMsg());
          NT.i18n.setLang("de");
          var de = NT.i18n.translate("sieve.palette.added", { count: 7, dupes: 46 });
          assert(sieveMsg() === de && /Primzahlen/.test(de), "German message reads " + sieveMsg());
          assert(document.getElementById("statPrimes").textContent === "53", "primes found changed");
          assert(document.querySelectorAll("#grid > *").length === 250, "grid changed");
          assert(document.getElementById("statCurrent").textContent === NT.i18n.translate("sieve.stat.done"), "done marker changed");
          document.getElementById("generateBtn").click();
          assert(sieveMsg() === "", "message survived Generate: " + sieveMsg());
          assert(toPaletteBtn().disabled, "button should be disabled after Generate");
          NT.i18n.setLang("en");
          noErrors("S3");
          return "the message re-renders in German with sieve state untouched; Generate clears it and disables the button";
        });
      } }
    ];
  };
  defs.S4 = function () {
    return [{ name: "S4 sieve-palette-full", fn: function () {
      return runSieve(20000, 2262).then(function () {
        toPaletteBtn().click();
        assert(sieveMsg() === T("sieve.palette.full", { count: 970, max: 1000, left: 1262 }), "message reads " + sieveMsg());
        assert(storedList().length === 1000, "stored length " + storedList().length);
        noErrors("S4");
        return "N=20000 finds 2262 primes: 970 fit, 1262 are reported as left out, the palette holds 1000";
      });
    } }];
  };
  var full1000 = function () { return sortedNums(DEFAULT30.concat(plainPrimes(970, 114))).map(String); };
  defs.S5a = function () {
    return [{ name: "S5a ft-shows-full-palette", fn: function () {
      assert(ftItems().length === 1000, "circles: " + ftItems().length);
      same(ftItems(), full1000(), "Factor Tree circles");
      return "Factor Tree shows 1000 circles, the default 30 plus the 970 smallest new primes";
    } }];
  };
  defs.S5b = function () {
    return [{ name: "S5b venn-shows-full-palette", fn: function () {
      assert(vennChips().length === 1000, "chips: " + vennChips().length);
      same(vennChips(), full1000(), "Venn chips");
      return "Venn shows the same 1000 numbers in the same order";
    } }];
  };

  /* U: quick task 261006-dso -- Venn's palette adopts Factor Tree's palette head and tools; 261006-keu moved the tools into the add row */
  defs.U = function () {
    var rect = function (el) { return el.getBoundingClientRect(); };
    return [
      { name: "U1 venn-palette-tools-row", fn: function () {
        var tools = document.querySelector(".picker-add .palette-tools");
        assert(tools, "no .picker-add .palette-tools");
        var kids = arr(tools.children).map(function (c) { return c.id; });
        same(kids, ["palette-bin", "palette-empty-btn", "palette-undo-btn", "palette-redo-btn"], "palette-tools children");
        var addRow = document.querySelector(".picker-add");
        assert(addRow.lastElementChild === tools, "the tools are not the add row's last child");
        assert(tools.previousElementSibling && tools.previousElementSibling.id === "palette-random-btn", "the tools do not follow Randomize");
        assert(document.querySelector(".picker-head").children.length === 1, "the heading row holds " + document.querySelector(".picker-head").children.length + " children");
        assert(!document.querySelector(".picker-head .palette-tools"), "the tools are still in .picker-head");
        var bin = document.getElementById("palette-bin"), btn = document.getElementById("palette-empty-btn");
        var controls = ["palette-add-input", "palette-add-btn", "palette-random-btn"].map(function (id) { return document.getElementById(id); });
        function cy(r) { return r.top + r.height / 2; }
        [bin, btn].forEach(function (el) {
          var r = rect(el);
          assert(Math.round(r.height) === 40 && Math.round(r.width) >= 40, el.id + " is " + r.width + "x" + r.height);
          controls.forEach(function (c) {
            assert(Math.abs(cy(r) - cy(rect(c))) <= 1, el.id + " is not vertically centred with " + c.id);
          });
        });
        var tr = rect(tools), ar = rect(addRow), rr = rect(document.getElementById("palette-random-btn"));
        assert(Math.abs(tr.right - ar.right) <= 1, "tools right " + tr.right + " vs add row right " + ar.right);
        assert(tr.left > rr.right, "tools (" + tr.left + ") touch Randomize (" + rr.right + ")");
        var br = rect(bin), er = rect(btn), ir = rect(bin.querySelector("svg"));
        assert(Math.abs(br.left - (rr.right + 10)) <= 1 && Math.abs(br.right - (er.left - 4)) <= 1, "bin " + br.left + ".." + br.right + " does not span Randomize to Delete all");
        assert(Math.round(er.width) === 40, "Delete all is " + er.width + " wide");
        assert(Math.abs((ir.left + ir.right) / 2 - (br.left + br.right) / 2) <= 1, "bin icon is not centred");
        assert(btn.getAttribute("aria-label") === T("venn.emptyPaletteLabel"), "aria-label " + btn.getAttribute("aria-label"));
        assert(btn.getAttribute("title") === T("venn.emptyPaletteLabel"), "title " + btn.getAttribute("title"));
        assert(btn.querySelector("svg"), "no svg in the Delete-all button");
        assert(!btn.disabled, "Delete all is disabled on a full palette");
        noErrors("U1");
        return "bin stretching from Randomize to the 40x40 garbage-truck Delete all, followed by the Undo and Redo palette buttons at the right end of the add row, bin icon centred, centred with the input and buttons; heading row holds only the heading; translated label";
      } },
      { name: "U2 venn-delete-all", fn: function () {
        chipNamed("7").click();
        assert(chipNamed("7").getAttribute("aria-pressed") === "true", "7 was not armed");
        var btn = document.getElementById("palette-empty-btn");
        btn.click();
        same(vennChips(), [], "chips after Delete all");
        same(storedList(), [], "stored list after Delete all");
        assert(msg() === T("venn.msg.paletteEmptied"), "message reads " + msg());
        assert(document.activeElement === document.getElementById("palette-add-input"), "focus is on " + (document.activeElement && document.activeElement.id));
        assert(btn.disabled, "Delete all is enabled on an empty palette");
        assert(headingText() === T("venn.picker.heading"), "heading reads " + headingText());
        addViaField("7");
        assert(chipNamed("7").getAttribute("aria-pressed") === "false", "the armed chip survived Delete all");
        assert(!btn.disabled, "Delete all is still disabled after adding");
        var en = btn.getAttribute("aria-label");
        NT.i18n.setLang("de");
        assert(btn.getAttribute("aria-label") === T("venn.emptyPaletteLabel") && btn.getAttribute("aria-label") !== en, "aria-label after de: " + btn.getAttribute("aria-label"));
        NT.i18n.setLang("en");
        noErrors("U2");
        return "Delete all empties store and chips, clears the armed chip, says so, focuses the field and disables itself";
      } },
      { name: "U3 venn-chip-look-grid-armed", fn: function () {
        // U2 left the palette holding only 7; refill it through the Add field so the store follows.
        DEFAULT30.forEach(function (p) { if (p !== 7) addViaField(String(p)); });
        var picker = document.getElementById("prime-picker");
        assert(getComputedStyle(picker).display === "grid", "picker display " + getComputedStyle(picker).display);
        function chips() { return arr(document.querySelectorAll("#prime-picker .prime-chip")); }
        chips().forEach(function (c) {
          var cs = getComputedStyle(c);
          assert(c.offsetHeight === 44, "chip " + c.textContent + " height " + c.offsetHeight);
          assert(cs.borderTopLeftRadius === "22px", "chip " + c.textContent + " radius " + cs.borderTopLeftRadius);
        });
        addViaField("1024");
        var widest = Math.max.apply(null, chips().map(function (c) { return c.offsetWidth; }));
        var cell = picker.style.getPropertyValue("--palette-cell");
        assert(cell === widest + "px" && widest > 44, "--palette-cell " + cell + " vs widest " + widest);
        var all = chips();
        var top0 = all[0].getBoundingClientRect().top;
        var cols = all.filter(function (c) { return c.getBoundingClientRect().top === top0; }).length;
        assert(cols > 1 && all.length > cols, "cols " + cols + " of " + all.length);
        function cx(c) { var r = c.getBoundingClientRect(); return Math.round(r.left + r.width / 2); }
        for (var i = 0; i + cols < all.length; i++) assert(cx(all[i]) === cx(all[i + cols]), "chip " + i + " and " + (i + cols) + " are not in one column");
        var bg = getComputedStyle(chipNamed("5")).backgroundColor;
        chipNamed("5").click();
        var armed = chipNamed("5"), as = getComputedStyle(armed);
        assert(armed.getAttribute("aria-pressed") === "true", "5 was not armed");
        assert(as.backgroundColor === bg, "armed background changed " + bg + " -> " + as.backgroundColor);
        assert(as.outlineStyle !== "none" && as.outlineColor === token("--role-active"), "armed outline " + as.outlineStyle + " " + as.outlineColor);
        chipNamed("5").click();
        assert(getComputedStyle(chipNamed("5")).outlineStyle === "none", "outline remained after disarming");
        var big = chipNamed("1024");
        big.dispatchEvent(new DragEvent("dragstart", { bubbles: true, cancelable: true, dataTransfer: new DataTransfer() }));
        var bs = getComputedStyle(chipNamed("1024"));
        assert(chipNamed("1024").classList.contains("is-dragging"), "no is-dragging");
        assert(parseFloat(bs.opacity) < 1, "opacity " + bs.opacity);
        assert(bs.backgroundColor === tokenBg("--role-composite"), "dragging background " + bs.backgroundColor);
        chipNamed("1024").dispatchEvent(new DragEvent("dragend", { bubbles: true, cancelable: true }));
        noErrors("U3");
        return "grid of 44px pills in aligned columns; armed = gold ring over an unchanged fill; dragging = faded, fill kept";
      } },
      { name: "U4 venn-palette-randomize", fn: function () {
        var rb = document.getElementById("palette-random-btn"), input = document.getElementById("palette-add-input");
        assert(rb.previousElementSibling === document.getElementById("palette-add-btn"), "Randomize does not follow Add");
        assert(Math.round(rb.getBoundingClientRect().height) === 40, "height " + rb.getBoundingClientRect().height);
        assert(rb.textContent === T("venn.paletteRandomize"), "text " + rb.textContent);
        function factors(n) { var c = 0; for (var d = 2; d * d <= n; d++) while (n % d === 0) { n /= d; c++; } return c + (n > 1 ? 1 : 0); }
        var chipsBefore = vennChips(), storedBefore = storedList(), placedBefore = placedTexts();
        var prev = input.value;
        for (var i = 0; i < 25; i++) {
          rb.click();
          var v = input.value, n = Number(v);
          assert(/^\d+$/.test(v) && n >= 12 && n <= 9999, "value " + v);
          assert(factors(n) >= 3, v + " has fewer than three prime factors");
          assert(v !== prev, "value repeated: " + v);
          prev = v;
        }
        same(vennChips(), chipsBefore, "chips after Randomize");
        same(storedList(), storedBefore, "stored list after Randomize");
        same(placedTexts(), placedBefore, "placed chips after Randomize");
        document.getElementById("palette-add-btn").click();
        assert(chipNamed(prev).hasAttribute("data-composite"), "the added " + prev + " is not a composite chip");
        noErrors("U4");
        return "25 clicks fill the field with 12..9999 numbers of 3+ prime factors, never repeating, adding nothing; Add then makes a composite chip";
      } }
    ];
  };

  /* K: quick task 261006-keu -- Factor Tree's bin and Delete all sit in the palette's add row */
  defs.K = function () {
    var rect = function (el) { return el.getBoundingClientRect(); };
    return [
      { name: "K1 ft-palette-tools-row", fn: function () {
        var tools = document.querySelector(".palette-panel .controls .palette-tools");
        assert(tools, "no .palette-panel .controls .palette-tools");
        same(arr(tools.children).map(function (c) { return c.id; }), ["paletteBin", "paletteEmptyBtn", "paletteUndoBtn", "paletteRedoBtn"], "palette-tools children");
        var row = document.querySelector(".palette-panel .controls");
        assert(row.lastElementChild === tools, "the tools are not the add row's last child");
        assert(tools.previousElementSibling && tools.previousElementSibling.id === "randomBtn", "the tools do not follow Randomize");
        var headRow = document.getElementById("paletteHeading").parentElement;
        assert(headRow.children.length === 1, "the heading row holds " + headRow.children.length + " children");
        var bin = document.getElementById("paletteBin"), btn = document.getElementById("paletteEmptyBtn");
        var controls = ["addInput", "addBtn", "randomBtn"].map(function (id) { return document.getElementById(id); });
        function cy(r) { return r.top + r.height / 2; }
        [bin, btn].forEach(function (el) {
          var r = rect(el);
          assert(Math.round(r.height) === 40 && Math.round(r.width) >= 40, el.id + " is " + r.width + "x" + r.height);
          controls.forEach(function (c) {
            assert(Math.abs(cy(r) - cy(rect(c))) <= 1, el.id + " is not vertically centred with " + c.id);
          });
        });
        var tr = rect(tools), cr = rect(row), rr = rect(document.getElementById("randomBtn"));
        assert(Math.abs(tr.right - cr.right) <= 1, "tools right " + tr.right + " vs add row right " + cr.right);
        assert(tr.left > rr.right, "tools (" + tr.left + ") touch Randomize (" + rr.right + ")");
        var br = rect(bin), er = rect(btn), ir = rect(bin.querySelector("svg"));
        assert(Math.abs(br.left - (rr.right + 10)) <= 1 && Math.abs(br.right - (er.left - 4)) <= 1, "bin " + br.left + ".." + br.right + " does not span Randomize to Delete all");
        assert(Math.round(er.width) === 40, "Delete all is " + er.width + " wide");
        assert(Math.abs((ir.left + ir.right) / 2 - (br.left + br.right) / 2) <= 1, "bin icon is not centred");
        assert(bin.getAttribute("aria-label") === T("factorTree.binLabel"), "bin aria-label " + bin.getAttribute("aria-label"));
        assert(bin.getAttribute("title") === T("factorTree.binLabel"), "bin title " + bin.getAttribute("title"));
        assert(btn.getAttribute("aria-label") === T("factorTree.emptyPaletteLabel"), "aria-label " + btn.getAttribute("aria-label"));
        assert(btn.getAttribute("title") === T("factorTree.emptyPaletteLabel"), "title " + btn.getAttribute("title"));
        assert(!btn.disabled, "Delete all is disabled on a full palette");
        noErrors("K1");
        return "bin stretching from Randomize to the 40x40 Delete all, followed by the Undo and Redo palette buttons at the right end of Factor Tree's add row, bin icon centred, centred with the input and buttons; heading row holds only the heading";
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
