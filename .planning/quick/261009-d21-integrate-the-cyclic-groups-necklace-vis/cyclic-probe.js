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

  var pending = [];
  function scenario(name, fn) {
    try { lines.push("PASS " + name + ": " + fn()); }
    catch (e) { lines.push("FAIL " + name + ": " + (e && e.message ? e.message : e)); }
  }
  // fn returns a promise of the PASS detail; a rejection is a FAIL.
  function scenarioAsync(name, fn) {
    pending.push(Promise.resolve().then(fn).then(
      function (msg) { lines.push("PASS " + name + ": " + msg); },
      function (e) { lines.push("FAIL " + name + ": " + (e && e.message ? e.message : e)); }
    ));
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

  function cordPoints() {
    var cord = document.querySelector("#ring-dynamic .cord");
    if (!cord) return null;
    return cord.getAttribute("points").trim().split(/\s+/).map(function (pt) {
      var xy = pt.split(",");
      return [parseFloat(xy[0]), parseFloat(xy[1])];
    });
  }
  function setLayer(name, on) {
    var box = $("layer-" + name);
    box.checked = on;
    fire(box, "change");
  }
  function legend() {
    return all("#legend .legend-item").map(function (it) {
      return { order: parseInt(it.getAttribute("data-order"), 10), count: parseInt(it.getAttribute("data-count"), 10) };
    });
  }
  function ordClassesOf(el) {
    return (el.getAttribute("class") || "").split(/\s+/).filter(function (c) { return /^ord-/.test(c); });
  }
  function samePoint(a, b) { return near(a[0], b[0]) && near(a[1], b[1]); }
  function sortedNums(list) { return list.slice().sort(function (a, b) { return a - b; }); }
  function search() {
    var q = new URLSearchParams(location.search);
    var o = {};
    q.forEach(function (v, k) { o[k] = v; });
    return o;
  }

  var P = {
    scenarioAsync: scenarioAsync, cordPoints: cordPoints, setLayer: setLayer, legend: legend,
    ordClassesOf: ordClassesOf, samePoint: samePoint, sortedNums: sortedNums, search: search,
    scenario: scenario, assert: assert, $: $, all: all, near: near, fire: fire,
    setN: setN, setMode: setMode, beads: beads, centre: centre, chordPoints: chordPoints,
    genOptions: genOptions, lines: lines
  };

  window.addEventListener("load", function () {
    BODIES[LOAD](P);
    Promise.all(pending).then(function () {
      scenario("Z", function () {
        var errs = window.__d21Errors || [];
        assert(errs.length === 0, "page errors: " + errs.join(" | "));
        return "no page errors";
      });
      out.textContent = lines.join("\n");
    });
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
  },

  // Z/12 gen 5, driven through the layer toggles.
  a: function (P) {
    P.scenario("L1", function () {
      var lg = P.legend();
      var orders = lg.map(function (l) { return l.order; }).join(",");
      var counts = lg.map(function (l) { return l.count; }).join(",");
      P.assert(orders === "1,2,3,4,6,12", "legend orders " + orders);
      P.assert(counts === "1,1,2,2,2,4", "legend counts " + counts);
      P.beads().forEach(function (b) {
        P.assert(P.ordClassesOf(b).length === 1, "bead " + b.getAttribute("data-el") + " has classes " + P.ordClassesOf(b).join(" "));
      });
      var texts = P.all("#legend .legend-item").map(function (it) { return it.textContent; });
      P.assert(/order 12/.test(texts[5]) && /4 beads/.test(texts[5]), "last legend row reads " + texts[5]);
      P.assert(/order 1/.test(texts[0]) && /1 bead$/.test(texts[0]), "first legend row reads " + texts[0]);
      P.setLayer("colors", false);
      var off = P.beads().map(function (b) { return P.ordClassesOf(b).join(" "); });
      P.assert(off.every(function (c) { return c === "ord-id"; }), "colors off should make every bead ord-id");
      P.assert(P.$("legend").classList.contains("is-off"), "legend not dimmed with colors off");
      P.setLayer("colors", true);
      return "orders " + orders + " counts " + counts + ", one ord-* class per bead, colors off -> all ord-id and legend dimmed";
    });
    P.scenario("L2", function () {
      P.assert(P.all("#ring-dynamic .order-label").length === 0, "order labels present by default");
      var noteOff = P.$("ring-dynamic").querySelector(".ring-note").textContent;
      P.setLayer("orders", true);
      var labels = P.all("#ring-dynamic .order-label");
      P.assert(labels.length === 12, "expected 12 order labels, found " + labels.length);
      var noteOn = P.$("ring-dynamic").querySelector(".ring-note").textContent;
      P.assert(noteOn !== noteOff && /small outer number/.test(noteOn), "footnote did not switch: " + noteOn);
      P.setLayer("orders", false);
      P.assert(P.all("#ring-dynamic .order-label").length === 0, "order labels remain after toggling off");
      return "no labels by default, 12 when on (footnote switches), none after off";
    });
    P.scenario("L3", function () {
      P.setLayer("bygen", true);
      var els = P.beads().map(function (b) { return b.getAttribute("data-el"); }).join(" ");
      P.assert(els === "0 5 10 3 8 1 6 11 4 9 2 7", "beads read " + els);
      var cp = P.chordPoints(P.all("#ring-dynamic .chord")[0]);
      var cord = P.cordPoints();
      P.assert(cord.length === 12, "cord has " + cord.length + " vertices");
      for (var i = 0; i < 12; i++) {
        P.assert(P.samePoint(cp.pts[i], cord[i]), "chord vertex " + i + " is not cord vertex " + i);
      }
      P.setLayer("bygen", false);
      return "beads " + els + "; chord vertices equal cord vertices";
    });
    P.scenario("L4", function () {
      P.setLayer("chords", false);
      P.assert(P.all("#ring-dynamic .chord").length === 0, "chord path present with chords off");
      P.assert(P.all("#ring-dynamic .chord-arrow").length === 0, "arrowheads present with chords off");
      var cord = P.cordPoints();
      P.assert(cord && cord.length === 12, "cord is not a 12-vertex polygon");
      var bs = P.beads();
      for (var i = 0; i < 12; i++) {
        P.assert(P.samePoint(cord[i], P.centre(bs[i])), "cord vertex " + i + " misses bead " + i);
      }
      P.setLayer("cord", false);
      P.assert(P.cordPoints() === null, "cord present with cord off");
      P.setLayer("cord", true);
      P.setLayer("chords", true);
      return "no chord path or arrows; cord is a 12-vertex polygon through the bead centres; cord toggle works";
    });
  },

  // Fresh load: URL, store, sync, structure, factor rings.
  b: function (P) {
    function isOrderOf(n, g) {
      var x = g % n, k = 1;
      while (x !== 1) { x = (x * g) % n; k++; if (k > 1000) throw new Error("runaway"); }
      return k;
    }
    function unitsOf(n) {
      var out = [];
      for (var a = 1; a < n; a++) { var x = a, y = n; while (y) { var t = x % y; x = y; y = t; } if (x === 1) out.push(a); }
      if (n === 2) out = [1];
      return out;
    }
    function oddPartOf(n) { while (n % 2 === 0) n /= 2; return n; }
    function distinctOddPrimes(n) {
      var cnt = 0, m = oddPartOf(n);
      for (var p = 3; p <= m; p += 2) { if (m % p === 0) { cnt++; while (m % p === 0) m /= p; } }
      return cnt;
    }
    function isCyclicModulus(n) {
      if (n === 2 || n === 4) return true;
      var odd = oddPartOf(n);
      var pw = n / odd;
      if (distinctOddPrimes(n) !== 1) return false;  // 1, or two or more odd primes
      return pw === 1 || pw === 2;
    }
    function ringSets() {
      return P.all("#ring-dynamic .factor-ring").map(function (g) {
        return P.sortedNums(P.all(".bead", g).map(function (b) { return parseInt(b.getAttribute("data-el"), 10); }));
      });
    }
    function showFactors(mode, n) {
      P.setMode(mode);
      P.setN(n);
      return ringSets();
    }

    P.scenario("U1", function () {
      var q = P.search();
      var want = { mode: "additive", n: "12", gen: "5", cord: "1", chords: "1", colors: "1", orders: "0", bygen: "0" };
      Object.keys(want).forEach(function (k) { P.assert(q[k] === want[k], "?" + k + "=" + q[k] + ", expected " + want[k]); });
      Object.keys(q).forEach(function (k) { P.assert(!/tbl|table/i.test(k), "table-like parameter " + k); });
      return "location.search carries mode, n, gen and the five flags: " + location.search;
    });

    P.scenario("P1", function () {
      P.setMode("multiplicative");
      P.setN(35);
      var stored = JSON.parse(localStorage.getItem("group-params"));
      P.assert(stored && stored.mode === "multiplicative" && stored.N === 35 && Object.keys(stored).length === 2, "stored " + JSON.stringify(stored));
      return "group-params is " + JSON.stringify(stored) + " after a UI change";
    });

    P.scenario("P2", function () {
      var before = localStorage.getItem("group-params");
      window.dispatchEvent(new StorageEvent("storage", { key: "group-params", newValue: JSON.stringify({ mode: "additive", N: 30 }) }));
      P.assert(P.$("n-input").value === "30", "n input shows " + P.$("n-input").value);
      P.assert(P.$("tab-additive").getAttribute("aria-selected") === "true", "additive tab not selected");
      var title = document.querySelector("#ring-dynamic .ring-title").textContent;
      P.assert(/^Z\/30 /.test(title), "ring title is " + title);
      P.assert(localStorage.getItem("group-params") === before, "the store was written: " + localStorage.getItem("group-params"));
      P.assert(P.search().n === "30" && P.search().mode === "additive", "URL not mirrored: " + location.search);
      window.dispatchEvent(new StorageEvent("storage", { key: "group-params", newValue: "not json" }));
      window.dispatchEvent(new StorageEvent("storage", { key: "other-key", newValue: JSON.stringify({ mode: "additive", N: 40 }) }));
      P.assert(P.$("n-input").value === "30", "a bad or foreign event changed n");
      return "storage event re-rendered Z/30 and left the stored value " + before + " untouched; bad and foreign events ignored";
    });

    P.scenario("C1", function () {
      P.assert(document.querySelectorAll("table").length === 0, "a table element exists");
      P.assert(document.querySelectorAll("canvas").length === 0, "a canvas element exists");
      var boxes = P.all("#layers-panel input[type=checkbox]");
      P.assert(boxes.length === 5, "Layers panel has " + boxes.length + " checkboxes");
      var ids = boxes.map(function (b) { return b.id; }).join(",");
      P.assert(ids === "layer-cord,layer-chords,layer-colors,layer-orders,layer-bygen", "checkbox ids " + ids);
      return "no table, no canvas, five Layers checkboxes (" + ids + ")";
    });

    P.scenario("F1", function () {
      var sets = showFactors("multiplicative", 8);
      P.assert(sets.length === 2, "expected 2 factor rings, found " + sets.length);
      P.assert(sets[0].join() === "1,7" && sets[1].join() === "1,5", "ring sets " + JSON.stringify(sets));
      var notice = P.$("notice");
      P.assert(!notice.hidden && getComputedStyle(notice).display !== "none", "notice is not visible");
      P.assert(P.$("gen-select").disabled, "select is not disabled");
      P.assert(P.all("#gen-select option").length === 1, "select has more than one option");
      P.assert(P.$("layer-bygen").disabled, "arrange-by-generator is not disabled");
      return "rings {1,7} {1,5}, notice shown, select disabled";
    });
    P.scenario("F2", function () {
      var sets = showFactors("multiplicative", 15);
      P.assert(sets.length === 2, "expected 2 factor rings, found " + sets.length);
      P.assert(sets[0].join() === "1,11" && sets[1].join() === "1,4,7,13", "ring sets " + JSON.stringify(sets));
      var seqs = P.all("#ring-dynamic .factor-ring .chord").map(function (c) { return c.getAttribute("data-seq"); });
      P.assert(seqs.join("|") === "1 11|1 7 4 13", "walks " + seqs.join("|"));
      return "rings {1,11} and {1,7,4,13}, walks " + seqs.join(" / ");
    });
    P.scenario("F3", function () {
      var sets = showFactors("multiplicative", 24);
      P.assert(sets.length === 3, "expected 3 factor rings, found " + sets.length);
      return "three rings: " + JSON.stringify(sets);
    });

    P.scenario("F4", function () {
      var checked = 0;
      P.setMode("multiplicative");
      for (var n = 2; n <= 100; n++) {
        P.setN(n);
        var cyclic = isCyclicModulus(n);
        var rings = P.all("#ring-dynamic .factor-ring");
        var select = P.$("gen-select");
        P.assert(cyclic === !select.disabled, "n=" + n + ": cyclic classification " + cyclic + " disagrees with the select");
        if (cyclic) { P.assert(rings.length === 0, "n=" + n + ": cyclic group drew factor rings"); continue; }
        checked++;
        var units = unitsOf(n);
        var prodOrders = 1;
        rings.forEach(function (g) {
          var ord = parseInt(g.getAttribute("data-order"), 10);
          var gen = parseInt(g.getAttribute("data-gen"), 10);
          var beadsIn = P.all(".bead", g).length;
          P.assert(beadsIn === ord, "n=" + n + ": ring of order " + ord + " has " + beadsIn + " beads");
          P.assert(isOrderOf(n, gen) === ord, "n=" + n + ": generator " + gen + " has order " + isOrderOf(n, gen) + ", ring says " + ord);
          prodOrders *= ord;
        });
        P.assert(prodOrders === units.length, "n=" + n + ": factor orders multiply to " + prodOrders + ", phi is " + units.length);
        var products = [1];
        rings.forEach(function (g) {
          var els = P.all(".bead", g).map(function (b) { return parseInt(b.getAttribute("data-el"), 10); });
          var next = [];
          products.forEach(function (p) { els.forEach(function (e) { next.push((p * e) % n); }); });
          products = next;
        });
        P.assert(P.sortedNums(products).join() === units.join(), "n=" + n + ": one bead per ring does not cover every unit exactly once");
        var texts = P.all("#notice p").map(function (p) { return p.textContent; });
        var odd = oddPartOf(n);
        var want = odd === 1 ? "Why: n = " + n + " is a power of 2 above 4."
          : n % 4 === 0 ? "Why: n = " + n + " is divisible by 4 and by an odd prime."
          : "Why: n = " + n + " has two different odd prime factors.";
        var whys = texts.filter(function (t) { return /^Why:/.test(t); });
        P.assert(whys.length === 1 && whys[0] === want, "n=" + n + ": reason is " + JSON.stringify(whys) + ", expected " + want);
        P.assert(texts.length === 3, "n=" + n + ": notice has " + texts.length + " paragraphs");
      }
      P.assert(checked === 50, "non-cyclic moduli checked: " + checked);
      return checked + " non-cyclic (Z/n)*, n <= 100: factor orders multiply to phi, each generator has its ring's order, one bead per ring covers every unit once, one matching reason";
    });

    P.scenario("L1-all", function () {
      var groups = 0;
      ["additive", "multiplicative"].forEach(function (mode) {
        P.setMode(mode);
        for (var n = 2; n <= 100; n++) {
          P.setN(n);
          var byOrder = {}, byClass = {};
          P.beads().forEach(function (b) {
            var cl = P.ordClassesOf(b);
            P.assert(cl.length === 1, mode + " n=" + n + ": bead " + b.getAttribute("data-el") + " has " + cl.length + " ord classes");
            var o = b.getAttribute("data-order");
            P.assert(!byOrder[o] || byOrder[o] === cl[0], mode + " n=" + n + ": order " + o + " has two classes");
            byOrder[o] = cl[0];
          });
          Object.keys(byOrder).forEach(function (o) {
            var c = byOrder[o];
            P.assert(!byClass[c], mode + " n=" + n + ": orders " + byClass[c] + " and " + o + " share class " + c);
            byClass[c] = o;
          });
          P.all("#legend .legend-swatch").forEach(function (sw) {
            P.assert(/ord-/.test(sw.getAttribute("class")), "legend swatch without ord class");
          });
          groups++;
        }
      });
      return groups + " groups: every bead has one ord-* class and distinct orders get distinct classes";
    });
  },

  // Deep link with every parameter.
  c: function (P) {
    P.scenario("U2", function () {
      P.assert(P.$("n-input").value === "12", "n is " + P.$("n-input").value);
      P.assert(P.$("tab-additive").getAttribute("aria-selected") === "true", "additive tab not selected");
      P.assert(P.$("gen-select").value === "5", "generator is " + P.$("gen-select").value);
      var want = { cord: false, chords: true, colors: false, orders: true, bygen: true };
      Object.keys(want).forEach(function (k) { P.assert(P.$("layer-" + k).checked === want[k], k + " checkbox is " + P.$("layer-" + k).checked); });
      var els = P.beads().map(function (b) { return b.getAttribute("data-el"); }).join(" ");
      P.assert(els === "0 5 10 3 8 1 6 11 4 9 2 7", "bygen beads read " + els);
      P.assert(P.cordPoints() === null, "cord drawn with cord=0");
      P.assert(P.all("#ring-dynamic .order-label").length === 12, "order labels missing with orders=1");
      P.assert(P.beads().every(function (b) { return P.ordClassesOf(b).join() === "ord-id"; }), "colors=0 beads are not ord-id");
      var q = P.search();
      P.assert(q.cord === "0" && q.chords === "1" && q.colors === "0" && q.orders === "1" && q.bygen === "1" && q.gen === "5", "mirrored query " + location.search);
      return "n 12, additive, gen 5, cord off, chords on, colors off, orders on, bygen on all restored";
    });
    P.scenario("X1", function () {
      var href = P.$("xref-cayley").getAttribute("href");
      P.assert(/^\.\.\/Cayley Table\/cayley-table\.html\?/.test(href), "href is " + href);
      var q = new URLSearchParams(href.split("?")[1]);
      P.assert(q.get("mode") === "additive" && q.get("n") === "12" && q.get("lang") === "en", "href query " + href);
      P.setMode("multiplicative");
      P.setN(15);
      var href2 = P.$("xref-cayley").getAttribute("href");
      var q2 = new URLSearchParams(href2.split("?")[1]);
      P.assert(q2.get("mode") === "multiplicative" && q2.get("n") === "15" && q2.get("lang") === "en", "href after a change " + href2);
      return href + " then " + href2;
    });
    P.scenario("U3 clamp", function () {
      P.setMode("additive");
      P.setN(500);
      P.assert(P.$("n-input").value === "500" || P.$("n-input").value === "100", "n field " + P.$("n-input").value);
      var note = P.$("n-note").textContent;
      P.assert(note === "n runs from 2 to 100, so the diagram shows n = 100.", "note is " + JSON.stringify(note));
      P.fire(P.$("n-input"), "change");
      P.assert(P.$("n-input").value === "100", "field not clamped on change: " + P.$("n-input").value);
      P.assert(P.$("n-note").textContent === note, "the note went silent on change");
      P.setN(0);
      P.assert(P.$("n-note").textContent === "n runs from 2 to 100, so the diagram shows n = 2.", "note for 0 is " + P.$("n-note").textContent);
      P.setN(12);
      P.assert(P.$("n-note").textContent === "", "note not cleared");
      return "500 -> 100 with a note that survives the change event, 0 -> 2, 12 clears it";
    });
  },

  // PNG export on Z/60 (bead labels suppressed, so a bead centre is pure fill).
  d: function (P) {
    P.scenarioAsync("E1", function () {
      var blobs = [], names = [];
      var realCreate = URL.createObjectURL;
      var realClick = HTMLAnchorElement.prototype.click;
      URL.createObjectURL = function (b) { blobs.push(b); return realCreate.call(URL, b); };
      HTMLAnchorElement.prototype.click = function () { names.push(this.download); };
      function restore() { URL.createObjectURL = realCreate; HTMLAnchorElement.prototype.click = realClick; }
      P.$("export-png").click();
      return new Promise(function (resolve, reject) {
        var tries = 0;
        (function wait() {
          if (blobs.length > 0 && names.length > 0) { resolve(); return; }
          if (++tries > 200) { reject(new Error("no PNG blob after the click (status: " + P.$("export-status").textContent + ")")); return; }
          setTimeout(wait, 50);
        })();
      }).then(function () {
        restore();
        P.assert(blobs.length === 1 && names.length === 1, blobs.length + " blobs, " + names.length + " downloads");
        P.assert(blobs[0].type === "image/png", "blob type " + blobs[0].type);
        P.assert(blobs[0].size > 2000, "blob is only " + blobs[0].size + " bytes");
        P.assert(names[0] === "cyclic-group-add-60-gen-7.png", "file name " + names[0]);
        P.assert(P.$("export-status").textContent === "Saved cyclic-group-add-60-gen-7.png.", "status " + P.$("export-status").textContent);
        return new Promise(function (resolve, reject) {
          var img = new Image();
          img.onload = function () { resolve(img); };
          img.onerror = function () { reject(new Error("the exported PNG does not decode")); };
          img.src = URL.createObjectURL(blobs[0]);
        }).then(function (bmp) {
          var surf = document.createElement("canvas");
          surf.width = bmp.width; surf.height = bmp.height;
          var cx = surf.getContext("2d");
          cx.drawImage(bmp, 0, 0);
          var bead = P.all('#ring-dynamic .bead[data-el="1"]')[0];
          var c = P.centre(bead);
          var px = cx.getImageData(Math.round(c[0] * 2), Math.round(c[1] * 2), 1, 1).data;
          var bg = cx.getImageData(2, 2, 1, 1).data;
          P.assert(bmp.width === 1520 && bmp.height === 1520, "image is " + bmp.width + "x" + bmp.height);
          P.assert(px[3] === 255 && bg[3] === 255, "pixels are not opaque: " + px[3] + " / " + bg[3]);
          P.assert(px[0] !== bg[0] || px[1] !== bg[1] || px[2] !== bg[2], "bead pixel equals the background " + Array.prototype.join.call(px, ","));
          P.assert(!(px[0] === 0 && px[1] === 0 && px[2] === 0), "bead pixel is opaque black");
          var rootBg = getComputedStyle(document.body).backgroundColor;
          return "one image/png blob of " + blobs[0].size + " bytes (" + bmp.width + "x" + bmp.height + "), file " + names[0] + ", bead pixel rgb(" + Array.prototype.slice.call(px, 0, 3).join(",") + ") vs background rgb(" + Array.prototype.slice.call(bg, 0, 3).join(",") + ") (page " + rootBg + ")";
        });
      }, function (e) { restore(); throw e; });
    });
  },

  // Language switch must not touch state.
  e: function (P) {
    P.scenario("I1", function () {
      P.setMode("multiplicative");
      P.setN(21);
      P.setLayer("orders", true);
      var gen = P.$("gen-select").value;
      var before = JSON.stringify(P.search());
      var beadsBefore = P.beads().length;
      var sel = P.$("lang-switch-select");
      sel.value = "fr";
      P.fire(sel, "change");
      P.assert(document.documentElement.lang === "fr", "html lang is " + document.documentElement.lang);
      var after = JSON.stringify(P.search());
      P.assert(after === before, "query changed: " + before + " -> " + after);
      P.assert(P.$("n-input").value === "21" && P.$("gen-select").value === gen, "controls changed");
      P.assert(P.$("layer-orders").checked && P.$("tab-multiplicative").getAttribute("aria-selected") === "true", "layer or tab changed");
      P.assert(P.beads().length === beadsBefore, "bead count changed");
      return "fr: mode, n, gen and flags unchanged (" + after + ")";
    });
  },

  // French and Arabic: English fallback, never a raw key.
  r1: function (P) {
    function rawKeyHits() {
      var re = /\b(?:cyclicGroups|site\.nav|common|hub)\.[A-Za-z]/;
      var hits = [];
      var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      var node;
      while ((node = walker.nextNode())) {
        var tag = node.parentNode.nodeName;
        if (tag === "SCRIPT" || tag === "STYLE") continue;
        if (re.test(node.nodeValue)) hits.push(node.nodeValue.slice(0, 60));
      }
      P.all("*").forEach(function (el) {
        ["title", "aria-label", "placeholder", "alt"].forEach(function (a) {
          var v = el.getAttribute(a);
          if (v && re.test(v)) hits.push(a + "=" + v);
        });
      });
      return hits;
    }
    P.scenario("R1", function () {
      P.assert(document.documentElement.lang === "fr", "html lang is " + document.documentElement.lang);
      var hits = rawKeyHits();
      P.assert(hits.length === 0, "raw keys on the page: " + hits.join(" | "));
      var nav = document.querySelector('a[data-i18n="site.nav.cyclicGroups"]');
      P.assert(nav && nav.textContent === "Cyclic Groups", "nav link reads " + (nav && nav.textContent));
      var tab = P.$("tab-additive").textContent;
      P.assert(tab !== "Additive Groups" && tab.length > 0, "tab still reads " + tab);
      P.assert(P.beads().length === 12, "expected 12 beads, found " + P.beads().length);
      P.assert(/^Z\/12 · generator 5 · order 12$/.test(document.querySelector("#ring-dynamic .ring-title").textContent), "title " + document.querySelector("#ring-dynamic .ring-title").textContent);
      P.assert(P.$("n-input").parentNode.querySelector("label").textContent === "n — modulus", "label fell through to " + P.$("n-input").parentNode.querySelector("label").textContent);
      P.setMode("multiplicative");
      P.setN(15);
      P.assert(rawKeyHits().length === 0, "raw keys after the non-cyclic render: " + rawKeyHits().join(" | "));
      P.assert(/not cyclic/.test(document.querySelector("#ring-dynamic .ring-title").textContent), "factor title is English");
      return "fr: no raw keys, nav link falls back to 'Cyclic Groups', tab reads '" + tab + "', 12 beads, factor view also clean";
    });
  },

  r2: function (P) {
    function rawKeyHits() {
      var re = /\b(?:cyclicGroups|site\.nav|common|hub)\.[A-Za-z]/;
      var hits = [];
      var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      var node;
      while ((node = walker.nextNode())) {
        var tag = node.parentNode.nodeName;
        if (tag === "SCRIPT" || tag === "STYLE") continue;
        if (re.test(node.nodeValue)) hits.push(node.nodeValue.slice(0, 60));
      }
      P.all("*").forEach(function (el) {
        ["title", "aria-label", "placeholder", "alt"].forEach(function (a) {
          var v = el.getAttribute(a);
          if (v && re.test(v)) hits.push(a + "=" + v);
        });
      });
      return hits;
    }
    P.scenario("R2", function () {
      P.assert(document.documentElement.lang === "ar", "html lang is " + document.documentElement.lang);
      P.assert(document.documentElement.dir === "rtl", "html dir is '" + document.documentElement.dir + "'");
      P.assert(getComputedStyle(P.$("ring-svg")).direction === "ltr", "ring svg direction is " + getComputedStyle(P.$("ring-svg")).direction);
      P.assert(getComputedStyle(P.$("n-input")).direction === "ltr", "n input direction is " + getComputedStyle(P.$("n-input")).direction);
      P.assert(getComputedStyle(P.$("gen-select")).direction === "ltr", "generator select direction is " + getComputedStyle(P.$("gen-select")).direction);
      var hits = rawKeyHits();
      P.assert(hits.length === 0, "raw keys on the page: " + hits.join(" | "));
      var nav = document.querySelector('a[data-i18n="site.nav.cyclicGroups"]');
      P.assert(nav && nav.textContent === "Cyclic Groups", "nav link reads " + (nav && nav.textContent));
      P.assert(P.beads().length === 12, "expected 12 beads, found " + P.beads().length);
      P.setMode("multiplicative");
      P.setN(24);
      P.assert(P.all("#ring-dynamic .factor-ring").length === 3, "factor rings did not render in RTL");
      P.assert(rawKeyHits().length === 0, "raw keys after the non-cyclic render: " + rawKeyHits().join(" | "));
      return "ar: lang ar, dir rtl, ring svg, n input and select are ltr, no raw keys, 12 beads, 3 factor rings for (Z/24)*";
    });
  },

  // The hub (index.html), loaded in French.
  h1: function (P) {
    P.scenario("H1", function () {
      var cards = P.all("a.card");
      var hits = cards.filter(function (c) { return (c.getAttribute("href") || "").indexOf("Cyclic Groups/cyclic-groups.html") === 0; });
      P.assert(hits.length === 1, "expected exactly one Cyclic Groups card, found " + hits.length);
      var at = cards.indexOf(hits[0]);
      var prev = cards[at - 1] && cards[at - 1].getAttribute("href");
      var next = cards[at + 1] && cards[at + 1].getAttribute("href");
      P.assert(/^Cayley Table\/cayley-table\.html/.test(prev || ""), "previous card is " + prev);
      P.assert(/^Group Isomorphism\/group-isomorphism\.html/.test(next || ""), "next card is " + next);
      var h3 = hits[0].querySelector("h3").textContent;
      var desc = hits[0].querySelector("p").textContent;
      P.assert(h3 === "Cyclic Group Necklace", "card title is " + h3);
      P.assert(desc.length > 40 && !/^hub\./.test(desc), "card description is " + desc);
      P.assert(document.documentElement.lang === "fr", "html lang is " + document.documentElement.lang);
      var nav = P.all(".site-nav .site-nav-link");
      P.assert(nav.length === 17, "nav has " + nav.length + " links");
      var cyc = nav.filter(function (a) { return a.getAttribute("data-i18n") === "site.nav.cyclicGroups"; });
      P.assert(cyc.length === 1 && cyc[0].textContent === "Cyclic Groups", "nav entry reads " + (cyc[0] && cyc[0].textContent));
      var navIdx = nav.indexOf(cyc[0]);
      P.assert(nav[navIdx - 1].getAttribute("data-i18n") === "site.nav.cayley" && nav[navIdx + 1].getAttribute("data-i18n") === "site.nav.iso", "nav slot is not between Cayley Table and Group Isomorphism");
      var lede = document.querySelector('[data-i18n="hub.hero.lede"]').textContent;
      P.assert(!/^hub\./.test(lede), "hero lede is a raw key");
      var grid = hits[0].parentNode;
      P.assert(grid.parentNode.querySelector("h2").getAttribute("data-i18n") === "hub.group.modular", "card is not in the modular grid");
      return "one card between Cayley Table and Group Isomorphism in the modular grid, title '" + h3 + "', 17 nav links, nav slot after the Cayley link";
    });
  }
};

/* ---------- selectors ---------- */

// One entry per page load: the query string and the in-page body.
var LOADS = {
  s1: { sel: "t1", query: "?mode=additive&n=12&gen=5&lang=en" },
  s2: { sel: "t1", query: "?mode=multiplicative&n=7&gen=3&lang=en" },
  s3: { sel: "t1", query: "?lang=en" },
  a: { sel: "t2", query: "?mode=additive&n=12&gen=5&lang=en" },
  b: { sel: "t2", query: "?lang=en" },
  c: { sel: "t2", query: "?mode=additive&n=12&gen=5&cord=0&chords=1&colors=0&orders=1&bygen=1&lang=en" },
  d: { sel: "t2", query: "?mode=additive&n=60&gen=7&lang=en" },
  e: { sel: "t2", query: "?lang=en" },
  r1: { sel: "t3", query: "?mode=additive&n=12&gen=5&lang=fr" },
  r2: { sel: "t3", query: "?mode=additive&n=12&gen=5&lang=ar" },
  h1: { sel: "t3", query: "?lang=fr", page: "index.html" }
};

/* ---------- node-side scenarios ---------- */

function readPage() { return fs.readFileSync(PAGE_FILE, "utf8"); }

// N1: the page source has no literal color, no markup-string write and no
// artifact-runtime hook.
var NAMED_COLORS = ("aliceblue antiquewhite aqua aquamarine azure beige bisque black blanchedalmond blue blueviolet brown burlywood " +
  "cadetblue chartreuse chocolate coral cornflowerblue cornsilk crimson cyan darkblue darkcyan darkgoldenrod darkgray darkgreen " +
  "darkgrey darkkhaki darkmagenta darkolivegreen darkorange darkorchid darkred darksalmon darkseagreen darkslateblue darkslategray " +
  "darkslategrey darkturquoise darkviolet deeppink deepskyblue dimgray dimgrey dodgerblue firebrick floralwhite forestgreen fuchsia " +
  "gainsboro ghostwhite gold goldenrod gray green greenyellow grey honeydew hotpink indianred indigo ivory khaki lavender " +
  "lavenderblush lawngreen lemonchiffon lightblue lightcoral lightcyan lightgoldenrodyellow lightgray lightgreen lightgrey lightpink " +
  "lightsalmon lightseagreen lightskyblue lightslategray lightslategrey lightsteelblue lightyellow lime limegreen linen magenta maroon " +
  "mediumaquamarine mediumblue mediumorchid mediumpurple mediumseagreen mediumslateblue mediumspringgreen mediumturquoise " +
  "mediumvioletred midnightblue mintcream mistyrose moccasin navajowhite navy oldlace olive olivedrab orange orangered orchid " +
  "palegoldenrod palegreen paleturquoise palevioletred papayawhip peachpuff peru pink plum powderblue purple rebeccapurple red " +
  "rosybrown royalblue saddlebrown salmon sandybrown seagreen seashell sienna silver skyblue slateblue slategray slategrey snow " +
  "springgreen steelblue tan teal thistle tomato turquoise violet wheat white whitesmoke yellow yellowgreen").split(" ");

function styleDeclarations(html) {
  var m = /<style>([\s\S]*?)<\/style>/.exec(html);
  if (!m) throw new Error("no style block");
  var css = m[1].replace(/\/\*[\s\S]*?\*\//g, "");
  var decls = [];
  var re = /([a-zA-Z-]+)\s*:\s*([^;{}]+)(?=;|})/g, d;
  while ((d = re.exec(css))) decls.push({ prop: d[1], value: d[2].trim() });
  return decls;
}

function scriptText(html) {
  var all = html.match(/<script(?![^>]*\bsrc=)[^>]*>[\s\S]*?<\/script>/g) || [];
  return all[all.length - 1] || "";
}

function n1() {
  var html = readPage();
  var out = [];
  var bad = [];
  styleDeclarations(html).forEach(function (d) {
    if (/#[0-9a-fA-F]{3,8}\b/.test(d.value)) bad.push(d.prop + ": " + d.value + " (hex)");
    if (/\b(rgb|rgba|hsl|hsla|hwb|lab|lch|oklab|oklch)\(/i.test(d.value)) bad.push(d.prop + ": " + d.value + " (color function)");
    var words = d.value.replace(/--[A-Za-z0-9-]+/g, " ").match(/[A-Za-z]+/g) || [];
    words.forEach(function (w) { if (NAMED_COLORS.indexOf(w.toLowerCase()) >= 0) bad.push(d.prop + ": " + d.value + " (named color " + w + ")"); });
  });
  var js = scriptText(html).replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:])\/\/.*$/gm, "$1");
  if (/['"`]#[0-9a-fA-F]{3,8}['"`]/.test(js) || /#[0-9a-fA-F]{6}\b/.test(js)) bad.push("hex color in script");
  if (/['"`][^'"`]*\b(rgba?|hsla?)\(/.test(js)) bad.push("rgb/hsl string in script");
  out.push(bad.length === 0 ? "PASS N1 colors: " + styleDeclarations(html).length + " style declarations and the script carry no hex, rgb/hsl or named color"
    : "FAIL N1 colors: " + bad.join("; "));
  var writes = [];
  if (/\.(innerHTML|outerHTML)\s*=/.test(html) || /insertAdjacentHTML\s*\(/.test(html) || /document\.write\s*\(/.test(html)) writes.push("markup-string write");
  if (/window\.claude|claude\.use\s*\(|downloads\.save/.test(html)) writes.push("artifact-runtime hook");
  if (/id="tbl"|tblcard|pngtbl/i.test(html)) writes.push("table remnant");
  out.push(writes.length === 0 ? "PASS N1 sinks: no markup-string assignment, no artifact-runtime hook, no table remnant"
    : "FAIL N1 sinks: " + writes.join(", "));
  return out;
}

// N2: the data file registers only en, every cyclicGroups key the page
// references exists, and every defined key is referenced.
function n2() {
  var vm = require("vm");
  var captured = null;
  var sandbox = { NT: { i18n: { register: function (ns, dict) { captured = { ns: ns, dict: dict }; } } } };
  vm.createContext(sandbox);
  vm.runInContext(fs.readFileSync(path.join(ROOT, "assets", "i18n", "cyclic-groups.js"), "utf8"), sandbox);
  if (!captured) return ["FAIL N2: the data file never called register"];
  var problems = [];
  if (captured.ns !== "cyclicGroups") problems.push("namespace is " + captured.ns);
  var langs = Object.keys(captured.dict);
  if (langs.join() !== "en") problems.push("languages are " + langs.join());
  var defined = Object.keys(captured.dict.en);
  var html = readPage();
  var used = {};
  var re = /cyclicGroups\.([A-Za-z0-9_.]+[A-Za-z0-9_])/g, m;
  while ((m = re.exec(html))) used[m[1]] = true;
  Object.keys(used).forEach(function (k) { if (defined.indexOf(k) < 0) problems.push("page uses undefined key " + k); });
  defined.forEach(function (k) { if (!used[k]) problems.push("defined key never used: " + k); });
  var dataSrc = fs.readFileSync(path.join(ROOT, "assets", "i18n", "cyclic-groups.js"), "utf8");
  if (/\bnl\s*:|\bde\s*:|\bfr\s*:/.test(dataSrc.replace(/\/\*[\s\S]*?\*\//, ""))) problems.push("a non-English block is present");
  return [problems.length === 0
    ? "PASS N2 keys: en only, " + defined.length + " keys defined, all referenced, none missing"
    : "FAIL N2 keys: " + problems.join("; ")];
}

// G1: the i18n gate reports exactly the expected English-only findings.
function g1() {
  var gate = require(path.join(ROOT, ".planning", "phases", "06-multi-language-support", "i18n-check.js"));
  var others = gate.LANG_CODES.filter(function (l) { return l !== "en"; });
  var res = cp.spawnSync("node", [path.join(ROOT, ".planning", "phases", "06-multi-language-support", "i18n-check.js"), "--coverage", "--all", "--report"], {
    cwd: ROOT, encoding: "utf8", maxBuffer: 64 * 1024 * 1024
  });
  var rows = (res.stdout || "").split("\n").filter(function (l) { return l.length > 0; });
  var summary = rows.filter(function (l) { return /^I18N-CHECK REPORT /.test(l); });
  var findings = rows.filter(function (l) { return !/^I18N-CHECK /.test(l); });
  var problems = [];
  if (summary.join("|") !== "I18N-CHECK REPORT 90 finding(s)") problems.push("summary is " + JSON.stringify(summary));
  if (findings.length !== 90) problems.push(findings.length + " finding lines");
  var groups = [
    { name: "cyclicGroups", re: /^LANG-KEYSET cyclicGroups\.([A-Za-z-]+): namespace missing this language entirely$/ },
    { name: "site", re: /^LANG-KEYSET site\.([A-Za-z-]+): missing=\[nav\.cyclicGroups\] extra=\[\]$/ },
    { name: "hub", re: /^LANG-KEYSET hub\.([A-Za-z-]+): missing=\[card\.cyclicGroups\.desc,card\.cyclicGroups\.title\] extra=\[\]$/ }
  ];
  var matched = 0;
  groups.forEach(function (g) {
    var langs = [];
    findings.forEach(function (l) { var m = g.re.exec(l); if (m) langs.push(m[1]); });
    matched += langs.length;
    var sorted = langs.slice().sort().join();
    if (sorted !== others.slice().sort().join()) problems.push(g.name + " covers [" + sorted + "], expected the 30 non-en languages");
  });
  if (matched !== 90) problems.push(matched + " of the finding lines match the three expected shapes");
  return [problems.length === 0
    ? "PASS G1 i18n-gate: I18N-CHECK REPORT 90 finding(s) = 30 cyclicGroups + 30 site + 30 hub LANG-KEYSET lines, one per non-English language each, nothing else"
    : "FAIL G1 i18n-gate: " + problems.join("; ")];
}

// S0: the untracked source folder is exactly as found: fingerprint, still
// untracked, never committed. The fingerprint is the sha256 of the
// path-sorted sha256sum listing, as `sort -z | xargs -0 sha256sum | sha256sum`
// computes it over "cyclic groups/".
var SOURCE_FOLDER = "cyclic groups";
var SOURCE_FINGERPRINT = "1daac0057ee94a1511adba9f2eccd35f3b2cadb403530a80fb0f2bef676277dc";

function listFiles(dir) {
  var out = [];
  fs.readdirSync(path.join(ROOT, dir), { withFileTypes: true }).forEach(function (d) {
    var rel = dir + "/" + d.name;
    if (d.isDirectory()) out = out.concat(listFiles(rel));
    else out.push(rel);
  });
  return out;
}

function s0() {
  var problems = [];
  var collator = new Intl.Collator("en");
  var files = listFiles(SOURCE_FOLDER).sort(collator.compare);
  var listing = files.map(function (f) {
    return crypto.createHash("sha256").update(fs.readFileSync(path.join(ROOT, f))).digest("hex") + "  " + f + "\n";
  }).join("");
  var fingerprint = crypto.createHash("sha256").update(listing).digest("hex");
  if (fingerprint !== SOURCE_FINGERPRINT) problems.push("fingerprint is " + fingerprint);
  var status = cp.spawnSync("git", ["status", "--porcelain", "--", SOURCE_FOLDER], { cwd: ROOT, encoding: "utf8" }).stdout.trim();
  if (status !== '?? "cyclic groups/"') problems.push("git status reports " + JSON.stringify(status));
  var tracked = cp.spawnSync("git", ["ls-files", "--", SOURCE_FOLDER], { cwd: ROOT, encoding: "utf8" }).stdout.trim();
  if (tracked !== "") problems.push("tracked files: " + tracked);
  var log = cp.spawnSync("git", ["log", "--oneline", "--all", "--", SOURCE_FOLDER], { cwd: ROOT, encoding: "utf8" }).stdout.trim();
  if (log !== "") problems.push("commits touch the folder: " + log);
  return [problems.length === 0
    ? "PASS S0 source-folder: " + files.length + " files, fingerprint " + fingerprint.slice(0, 12) + "... unchanged, still untracked, no commit touches it"
    : "FAIL S0 source-folder: " + problems.join("; ")];
}

var NODE_SCENARIOS = { t2: [n1, n2], t3: [g1, s0] };

var EXPECT = {
  t1: ["S1", "S2", "S3", "Z"],
  t2: ["L1", "L1-all", "L2", "L3", "L4", "F1", "F2", "F3", "F4", "U1", "U2", "U3 clamp", "P1", "P2", "X1", "E1", "C1", "I1", "N1 colors", "N1 sinks", "N2", "Z"],
  t3: ["R1", "R2", "H1", "G1", "S0", "Z"]
};
var RUN_ORDER = ["t1", "t2", "t3"];

/* ---------- node-side runner ---------- */

var ERROR_TRAP = '<script>window.__d21Errors=[];window.addEventListener("error",function(e){window.__d21Errors.push(String(e.message||e));});</script>';

function fnSource(fn) { return fn.toString(); }

function buildPage(srcHtml, load, extra, relPage) {
  var siteRoot = harness.mkScratch("d21-site-");
  fs.cpSync(path.join(ROOT, "assets"), path.join(siteRoot, "assets"), { recursive: true });
  var markup = extra || "";
  if (load) {
    var bodiesSrc = "{" + Object.keys(BODIES).map(function (k) { return JSON.stringify(k) + ":" + fnSource(BODIES[k]); }).join(",") + "}";
    var script = "(" + fnSource(inPage) + ")(" + JSON.stringify(load) + "," + bodiesSrc + ");";
    markup = '<pre id="d21-out"></pre>\n<script>\n' + script + "\n</script>\n" + markup;
  }
  var page = load ? srcHtml.replace("<head>", "<head>\n" + ERROR_TRAP) : srcHtml;
  var at = page.lastIndexOf("</body>");
  if (at < 0) throw new Error("no closing body tag in the page");
  page = page.slice(0, at) + markup + page.slice(at);
  var dest = path.join(siteRoot, relPage || PAGE_REL);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
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
    "--virtual-time-budget=" + (process.env.D21_BUDGET || "8000"), "--window-size=1280,900", "--dump-dom"
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
  var rel = LOADS[load].page || PAGE_REL;
  var built = buildPage(fs.readFileSync(path.join(ROOT, rel), "utf8"), load, "", rel);
  var dom = runChrome(pageUrl(built.file, LOADS[load].query));
  var out = grabPre(dom, "d21-out");
  if (process.env.D21_DUMP === load) fs.writeFileSync(process.env.D21_DUMP_FILE || "/dev/stderr", dom);
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

// --shots: day and night pictures of the Z/12 star and of (Z/15)*, at
// 1280 x 1500 and device scale 2 so the whole diagram and the side panels
// fit (at 1280 x 1000 the header and page title push the ring off the bottom).
function shots() {
  var QUICK = __dirname;
  var targets = [
    { name: "cyclic", query: "?mode=additive&n=12&gen=5" },
    { name: "factors", query: "?mode=multiplicative&n=15" }
  ];
  var failed = false;
  targets.forEach(function (t) {
    ["day", "night"].forEach(function (theme) {
      var built = buildPage(fs.readFileSync(PAGE_FILE, "utf8"), "", "", PAGE_REL);
      var dest = path.join(QUICK, t.name + "-" + theme + ".png");
      try { fs.rmSync(dest, { force: true }); } catch (e) { /* none yet */ }
      runChrome(pageUrl(built.file, t.query + "&theme=" + theme + "&lang=en"), [
        "--hide-scrollbars", "--force-device-scale-factor=2", "--screenshot=" + dest, "--window-size=1280,1500", "--virtual-time-budget=3000"
      ]);
      try { fs.rmSync(built.siteRoot, { recursive: true, force: true }); } catch (e) { /* best effort */ }
      var ok = fs.existsSync(dest) && fs.statSync(dest).size > 0;
      console.log((ok ? "wrote " : "FAILED to write ") + dest);
      if (!ok) failed = true;
    });
  });
  process.exit(failed ? 1 : 0);
}

main();
