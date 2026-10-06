"use strict";
/*
 * Dev-only regression probe for quick task 261005-kaz: the Factor Tree
 * rehaul around a circle palette. Prime circles (and any number the user
 * adds) are copied by drag-and-drop or click into a working area, land
 * folded; the first + on a fresh tree unfolds it all the way down, and
 * after that each + opens or closes one split.
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

var EXPECTED = 33;
var EXPECTED_NODE = 3;

var LANGS = ["nl", "en", "de", "fr", "es", "it", "pl", "pt-BR", "pt-PT", "sv", "nb", "ro", "hu", "lv", "ru", "el"];
var NEW_KEYS = ["subtitle", "add", "addInputLabel", "paletteHeading", "paletteHeadingNumbers", "paletteItemLabel", "workHeading", "workHint", "clear", "removeLabel", "msgAdded", "msgRemoved", "binLabel"];

/* ---------- node-side scenarios ---------- */

function loadDicts() {
  var dicts = {};
  var ctx = { NT: { i18n: { register: function (ns, dict) { dicts[ns] = dict; } } } };
  ["site.js", "factor-tree.js"].forEach(function (f) {
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
  var pass = 0;
  pass += nodeScenario("N1 key-catalog", function () {
    var en = dicts.factorTree.en;
    LANGS.forEach(function (l) {
      var d = dicts.factorTree[l];
      NEW_KEYS.forEach(function (k) {
        nodeAssert(typeof d[k] === "string" && d[k].length > 0, l + " " + k + " missing");
        if (l !== "en") nodeAssert(d[k] !== en[k], l + " " + k + " equals the English text");
      });
      ["paletteItemLabel", "removeLabel", "msgAdded", "msgRemoved"].forEach(function (k) {
        nodeAssert(d[k].indexOf("{n}") >= 0, l + " " + k + " lacks {n}");
      });
      if (l === "ru" || l === "el") {
        NEW_KEYS.forEach(function (k) {
          var bare = d[k].replace(/\{n\}/g, "");
          nodeAssert(!/[A-Za-z]/.test(bare), l + " " + k + " has a Latin letter: " + d[k]);
          nodeAssert(l === "ru" ? /[Ѐ-ӿ]/.test(bare) : /[Ͱ-Ͽἀ-῿]/.test(bare),
            l + " " + k + " has no " + (l === "ru" ? "Cyrillic" : "Greek") + " letter");
        });
      }
    });
    return "16 languages carry the thirteen new/changed keys; {n} slots intact; ru/el in their own script";
  });
  pass += nodeScenario("N2 dead-keys", function () {
    LANGS.forEach(function (l) {
      var d = dicts.factorTree[l];
      nodeAssert(!("grow" in d), l + " still has the grow key");
      nodeAssert(!("chipPrime" in d), l + " still has the chipPrime key");
    });
    var src = fs.readFileSync(path.join(ROOT, "Factor Tree", "factor-tree.html"), "utf8");
    var enKeys = Object.keys(dicts.factorTree.en);
    enKeys.forEach(function (k) {
      nodeAssert(src.indexOf("factorTree." + k) >= 0, "en key " + k + " is not used by the page");
    });
    var re = /factorTree\.([A-Za-z]+)/g;
    var m;
    var seen = 0;
    while ((m = re.exec(src))) {
      seen++;
      nodeAssert(enKeys.indexOf(m[1]) >= 0, "the page uses factorTree." + m[1] + ", which is not in the en dictionary");
    }
    return enKeys.length + " en keys, all used by the page; " + seen + " page references, all defined; grow/chipPrime gone from 16 languages";
  });
  pass += nodeScenario("N3 no-literal-colour", function () {
    var src = fs.readFileSync(path.join(ROOT, "Factor Tree", "factor-tree.html"), "utf8");
    var style = /<style>([\s\S]*?)<\/style>/.exec(src)[1];
    var hits = style.split("\n").filter(function (l) { return /palette|drag|work|tree-card|tree-remove|clear-btn|section-|cardIn|tree-equation|addInput|addBtn/.test(l); });
    nodeAssert(hits.length >= 10, "only " + hits.length + " style lines mention the new selectors");
    var bad = /#[0-9a-fA-F]{3,8}\b|\b(?:rgb|rgba|hsl|hsla)\(|\b(?:red|green|blue|black|white|gray|grey|orange|yellow|purple|pink|brown|cyan|magenta|silver|gold|navy|teal)\b/;
    hits.forEach(function (l) { nodeAssert(!bad.test(l), "literal colour in: " + l.trim()); });
    return hits.length + " new style lines, all colours via var()";
  });
  return pass;
}

/* ---------- in-page probe (serialised into the scratch page) ---------- */

function inPage(cfg) {
  var out = document.getElementById("kaz-out");
  var lines = [];
  var EPS = 0.01;
  var TW = 1400;
  var errors = [];

  window.addEventListener("error", function (e) { errors.push(String(e.message || e)); });

  function emit(line) { lines.push(line); out.textContent = lines.join("\n"); }
  function assert(cond, msg) { if (!cond) throw new Error(msg); }
  function near(a, b) { return Math.abs(a - b) <= EPS; }
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

  var arr = function (list) { return Array.prototype.slice.call(list); };
  var items = function () { return arr(document.querySelectorAll("#palette .palette-item")); };
  var cards = function () { return arr(document.querySelectorAll("#workArea .tree-card")); };
  var cardCircles = function (card) { return arr(card.querySelectorAll(".node-circle")); };
  var cardEdges = function (card) { return arr(card.querySelectorAll(".edge-line")); };
  var num = function (el, a) { return parseFloat(el.getAttribute(a)); };
  var shown = function (el) { return !!el && getComputedStyle(el).display !== "none"; };
  var shownCircles = function (card) { return cardCircles(card).filter(shown); };
  var msg = function () { return document.getElementById("message").textContent; };
  var T = function (key, params) { return NT.i18n.translate("factorTree." + key, params); };
  var svgW = function (card) { return num(card.querySelector(".tree-svg"), "width"); };
  var svgH = function (card) { return num(card.querySelector(".tree-svg"), "height"); };
  var eqText = function (card) { return card.querySelector(".tree-equation").textContent; };
  var geom = function (card) { return cardCircles(card).map(function (c) { return [num(c, "cx"), num(c, "cy"), num(c, "r")]; }); };
  var xs = function (g) { return g.map(function (t) { return t[0]; }); };
  var fill = function (el) { return getComputedStyle(el).fill; };
  function reduced() {
    return !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }

  function labelEl(c) {
    var n = c.nextElementSibling;
    while (n && n.tagName.toLowerCase() !== "text") n = n.nextElementSibling;
    return n;
  }
  function labelOf(c) { var t = labelEl(c); return t ? t.textContent : ""; }
  function badgeOf(c) {
    var t = labelEl(c);
    var b = t && t.nextElementSibling;
    return b && b.classList.contains("fold-badge") ? b : null;
  }
  function ringOf(c) {
    var p = c.previousElementSibling;
    return p && p.classList.contains("fold-ring") ? p : null;
  }
  function axisOf(c) {
    var a = c.nextElementSibling;
    return a && a.classList.contains("mirror-axis") ? a : null;
  }
  function circleByLabel(card, kind, label) {
    var f = cardCircles(card).filter(function (c) { return c.classList.contains(kind) && labelOf(c) === label; });
    assert(f.length > 0, "no " + kind + " circle labelled " + label);
    return f[0];
  }
  function rootOf(card) { return card.querySelector(".node-circle.root"); }
  function click(el) { el.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true })); }
  function pointerClick(el) { el.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, detail: 1 })); }
  function key(el, init) {
    var e = new KeyboardEvent("keydown", Object.assign({ bubbles: true, cancelable: true }, init));
    return !el.dispatchEvent(e);
  }
  function noErrors(label) { assert(errors.length === 0, label + ": window errors: " + errors.join(" | ")); }
  function centre(el) {
    var r = el.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  }
  function ptr(type, target, x, y, pt) {
    target.dispatchEvent(new PointerEvent(type, {
      bubbles: true, cancelable: true, clientX: x, clientY: y, pointerId: 7,
      pointerType: pt || "mouse", button: 0, buttons: type === "pointerup" ? 0 : 1, isPrimary: true
    }));
  }
  function dragStart(item, x, y, pt) {
    var c = centre(item);
    ptr("pointerdown", item, c.x, c.y, pt);
    ptr("pointermove", document, c.x + 3, c.y, pt);
    ptr("pointermove", document, x, y, pt);
  }
  function dragDrop(x, y, pt) { ptr("pointerup", document, x, y, pt); }
  function ghosts() { return document.querySelectorAll(".drag-ghost").length; }
  function workCentre() { return centre(document.getElementById("workArea")); }
  // A point inside the working area but beside every (centred) card.
  function workEmpty() {
    var r = document.getElementById("workArea").getBoundingClientRect();
    return { x: r.left + 6, y: r.top + 6 };
  }
  function isPrimeNum(n) { if (n < 2) return false; for (var d = 2; d * d <= n; d++) if (n % d === 0) return false; return true; }

  function edgeInfo(card) {
    var cs = cardCircles(card);
    var vis = cs.filter(shown);
    function at(x, y) {
      for (var i = 0; i < vis.length; i++) if (near(num(vis[i], "cx"), x) && near(num(vis[i], "cy"), y)) return vis[i];
      return null;
    }
    return cardEdges(card).filter(shown).map(function (e) {
      return { el: e, from: at(num(e, "x1"), num(e, "y1")), to: at(num(e, "x2"), num(e, "y2")) };
    });
  }

  function visibleCoherent(card) {
    var vis = shownCircles(card);
    var W = svgW(card), H = svgH(card);
    var es = edgeInfo(card);
    es.forEach(function (e) {
      assert(e.from, "a shown edge starts off every shown circle centre");
      assert(e.to, "a shown edge ends off every shown circle centre");
    });
    vis.forEach(function (c) {
      var out = es.filter(function (e) { return e.from === c; });
      var cx = num(c, "cx"), cy = num(c, "cy");
      assert(cx >= -EPS && cx <= W + EPS, "circle " + labelOf(c) + " left the canvas: cx " + cx + " of " + W);
      assert(cy >= -EPS && cy <= H + EPS, "circle " + labelOf(c) + " left the canvas: cy " + cy + " of " + H);
      var b = badgeOf(c);
      if (b) {
        var disc = b.querySelector(".fold-badge-disc");
        assert(num(disc, "cy") + num(disc, "r") <= H + EPS, "badge of " + labelOf(c) + " pokes out of the canvas bottom");
        if (b.getAttribute("aria-expanded") === "true") {
          assert(out.length === 2, "unfolded circle " + labelOf(c) + " has " + out.length + " shown outgoing edges");
          var mean = (num(out[0].to, "cx") + num(out[1].to, "cx")) / 2;
          assert(near(cx, mean), "circle " + labelOf(c) + " is not midway between its children");
        }
      }
      if (c.classList.contains("is-folded")) assert(out.length === 0, "folded circle " + labelOf(c) + " has " + out.length + " shown outgoing edges");
    });
    var slots = vis.filter(function (c) { return !es.some(function (e) { return e.from === c; }); })
      .map(function (c) { return num(c, "cx"); }).sort(function (a, b) { return a - b; });
    if (slots.length === 1) {
      assert(near(slots[0], W / 2), "a single slot circle is at " + slots[0] + ", not " + W / 2);
    } else {
      assert(near(slots[0] + slots[slots.length - 1], W), "slot circles span " + slots[0] + ".." + slots[slots.length - 1] + " in a canvas of " + W);
      var step = (slots[slots.length - 1] - slots[0]) / (slots.length - 1);
      slots.forEach(function (x, k) { assert(near(x, slots[0] + k * step), "slot " + k + " at " + x + ", expected " + (slots[0] + k * step)); });
    }
    return slots.length;
  }

  var steps = [];
  function step(name, fn) { steps.push({ name: name, fn: fn }); }

  var PRIMES30 = [];
  for (var pn = 2; PRIMES30.length < 30; pn++) if (isPrimeNum(pn)) PRIMES30.push(pn);

  step("P1 load", function () {
    var it = items();
    assert(it.length === 30, it.length + " palette items, expected 30");
    it.forEach(function (b, i) {
      assert(b.tagName === "BUTTON", "palette item " + i + " is a " + b.tagName);
      assert(b.textContent === String(PRIMES30[i]), "palette item " + i + " reads " + b.textContent + ", expected " + PRIMES30[i]);
      var want = T("paletteItemLabel", { n: PRIMES30[i] });
      assert(b.getAttribute("aria-label") === want, "item " + i + " aria-label is " + b.getAttribute("aria-label"));
      assert(b.getAttribute("title") === want, "item " + i + " title is " + b.getAttribute("title"));
    });
    assert(getComputedStyle(it[0]).touchAction === "none", "touch-action is " + getComputedStyle(it[0]).touchAction);
    assert(cards().length === 0, "a tree is already on the working area");
    assert(document.getElementById("paletteHeading").textContent === T("paletteHeading"), "the palette heading is '" + document.getElementById("paletteHeading").textContent + "'");
    assert(document.getElementById("workHeading").textContent === T("workHeading"), "the working-area heading is '" + document.getElementById("workHeading").textContent + "'");
    assert(shown(document.getElementById("workHint")), "the working-area hint is hidden");
    assert(document.getElementById("clearBtn").disabled, "Clear is enabled on an empty area");
    assert(!document.getElementById("numInput") && !document.getElementById("goBtn") && !document.querySelector(".chip"), "an old control still exists");
    noErrors("P1");
    return "30 blue prime circles 2.." + PRIMES30[29] + " in order, labelled; empty working area with its hint; old controls gone";
  });

  step("P2 add-validation", function () {
    var inp = document.getElementById("addInput");
    var addBtn = document.getElementById("addBtn");
    assert(inp.type === "number", "addInput type is " + inp.type);
    assert(inp.getAttribute("inputmode") === "numeric", "inputmode is " + inp.getAttribute("inputmode"));
    assert(inp.getAttribute("aria-label") === T("addInputLabel"), "aria-label is " + inp.getAttribute("aria-label"));
    assert(inp.nextElementSibling === addBtn, "the Add button does not directly follow the field");
    assert(addBtn.textContent === T("add"), "Add text is " + addBtn.textContent);
    assert(addBtn.nextElementSibling === document.getElementById("randomBtn"), "Randomize does not follow Add");
    assert(key(inp, { key: "e" }), "keydown e was not default-prevented");
    assert(!key(inp, { key: "5" }), "keydown 5 was default-prevented");
    function tryAdd(v, want) {
      inp.value = v;
      click(addBtn);
      assert(items().length === 30, "'" + v + "' changed the palette to " + items().length + " items");
      assert(msg() === want, "'" + v + "' gave message '" + msg() + "', expected '" + want + "'");
      assert(!document.getElementById("message").classList.contains("info"), "'" + v + "' message has class info");
    }
    tryAdd("", T("msgEmpty"));
    ["0", "-4", "3.5", "1e3"].forEach(function (v) { tryAdd(v, T("msgInvalid")); });
    tryAdd("1", T("msgOne"));
    tryAdd("1000000000001", T("msgTooLargeClassic"));
    assert(document.getElementById("paletteHeading").textContent === T("paletteHeading"), "rejected input renamed the palette");
    inp.value = "10";
    click(addBtn);
    assert(document.getElementById("paletteHeading").textContent === T("paletteHeadingNumbers"), "a composite did not rename the palette: '" + document.getElementById("paletteHeading").textContent + "'");
    var it = items();
    assert(it.length === 31, "10 gave " + it.length + " items");
    assert(it[4].textContent === "10" && it[3].textContent === "7" && it[5].textContent === "11", "10 did not land between 7 and 11: item 4 reads " + it[4].textContent);
    assert(it[4].getAttribute("aria-label") === T("paletteItemLabel", { n: 10 }), "10's label is " + it[4].getAttribute("aria-label"));
    assert(msg() === T("msgAdded", { n: 10 }), "message is " + msg());
    assert(document.getElementById("message").classList.contains("info"), "msgAdded lacks class info");
    if (reduced()) assert(getComputedStyle(it[4]).animationName === "none", "the new item still animates under reduced motion: " + getComputedStyle(it[4]).animationName);
    click(addBtn);
    assert(items().length === 32 && items()[5].textContent === "10" && items()[6].textContent === "11", "a second 10 gave " + items().length + " items, not adjacent to the first");
    inp.value = "60";
    key(inp, { key: "Enter" });
    it = items();
    assert(it.length === 33 && it[19].textContent === "60" && it[18].textContent === "59" && it[20].textContent === "61", "60 + Enter gave " + it.length + " items, item 19 reads " + it[19].textContent);
    var vals = it.map(function (x) { return Number(x.textContent); });
    assert(vals.every(function (v, i) { return i === 0 || vals[i - 1] <= v; }), "palette not ascending: " + vals.join(","));
    noErrors("P2");
    return "field-left-of-Add, filters, 7 rejections with translated messages, 10 added twice (sorted, adjacent), 60 added with Enter between 59 and 61";
  });

  step("P3 drag-drop", function () {
    var it = items();
    var wc = workCentre();
    dragStart(it[0], wc.x, wc.y, "mouse");
    assert(ghosts() === 1, ghosts() + " drag ghosts mid-drag");
    assert(document.getElementById("workArea").classList.contains("is-drop-over"), "the working area is not highlighted mid-drag");
    assert(document.body.classList.contains("is-dragging"), "body lacks is-dragging mid-drag");
    dragDrop(wc.x, wc.y, "mouse");
    pointerClick(it[0]);
    var cs = cards();
    assert(cs.length === 1, cs.length + " cards after the drop, expected 1");
    assert(ghosts() === 0, "a ghost is left behind");
    assert(!document.getElementById("workArea").classList.contains("is-drop-over"), "is-drop-over is left behind");
    assert(!document.body.classList.contains("is-dragging"), "is-dragging is left behind");
    assert(items().length === 33 && items()[0].textContent === "2", "the palette lost its circle or the trailing click placed a second copy");
    var card = cs[0];
    var vis = shownCircles(card);
    assert(vis.length === 1, vis.length + " circles shown, expected 1");
    var c = vis[0];
    assert(labelOf(c) === "2" && c.classList.contains("root"), "the shown circle is " + labelOf(c) + " / " + c.getAttribute("class"));
    assert(fill(c) === getComputedStyle(it[0]).backgroundColor, "circle fill " + fill(c) + " differs from the palette blue " + getComputedStyle(it[0]).backgroundColor);
    assert(cardCircles(card).length === 3, cardCircles(card).length + " circles built, expected 3");
    assert(cardEdges(card).filter(shown).length === 0, "an edge is shown");
    assert(shown(ringOf(c)), "the ring is hidden on a folded circle");
    assert(!shown(axisOf(c)), "the axis is shown on a folded circle");
    var b = badgeOf(c);
    assert(b, "the root has no badge");
    assert(b.getAttribute("aria-expanded") === "false", "badge aria-expanded is " + b.getAttribute("aria-expanded"));
    assert(b.getAttribute("aria-label") === T("unfoldLabel", { n: 2 }), "badge label is " + b.getAttribute("aria-label"));
    assert(shown(b.querySelector(".fold-glyph-v")), "the vertical glyph is hidden");
    var disc = b.querySelector(".fold-badge-disc");
    assert(near(num(disc, "cx"), num(c, "cx")) && near(num(disc, "cy"), num(c, "cy") + num(c, "r")), "badge disc is not on the circle's lower edge");
    assert(near(svgW(card), 2 * num(c, "cx")), "svgW " + svgW(card) + " is not twice cx " + num(c, "cx"));
    assert(eqText(card) === "", "the equation is not empty");
    assert(!shown(document.getElementById("workHint")), "the hint is still shown");
    assert(!document.getElementById("clearBtn").disabled, "Clear is disabled");
    visibleCoherent(card);

    var we = workEmpty();
    dragStart(items()[1], we.x, we.y, "touch");
    dragDrop(we.x, we.y, "touch");
    cs = cards();
    assert(cs.length === 2, "touch drag left " + cs.length + " cards");
    assert(labelOf(shownCircles(cs[1])[0]) === "3", "the touch-dragged card is labelled " + labelOf(shownCircles(cs[1])[0]));
    pointerClick(items()[1]);

    var h1 = centre(document.querySelector("h1"));
    dragStart(items()[0], h1.x, h1.y, "mouse");
    assert(ghosts() === 1, "no ghost while dragging over the heading");
    dragDrop(h1.x, h1.y, "mouse");
    assert(cards().length === 2 && ghosts() === 0, "a drop outside the area placed a tree or left a ghost");

    dragStart(items()[0], wc.x, wc.y, "mouse");
    ptr("pointercancel", document, wc.x, wc.y, "mouse");
    assert(cards().length === 2 && ghosts() === 0, "pointercancel placed a tree or left a ghost");
    assert(!document.body.classList.contains("is-dragging"), "is-dragging left behind after pointercancel");

    dragStart(items()[0], wc.x, wc.y, "mouse");
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    pointerClick(items()[0]);
    assert(cards().length === 2 && ghosts() === 0, "Escape placed a tree or left a ghost");
    ptr("pointerup", document, wc.x, wc.y, "mouse");
    assert(cards().length === 2, "a pointerup after Escape placed a tree");
    noErrors("P3");
    return "mouse drag copies a folded blue 2 (palette keeps its circle, trailing click suppressed); touch drag works; outside drop, pointercancel and Escape place nothing";
  });

  step("P4 unfold-prime", function () {
    var card = cards()[0];
    var root = rootOf(card);
    var wFold = svgW(card), hFold = svgH(card);
    var b = badgeOf(root);
    click(b);
    // Phase 1 of an unfold (space opens, the card grows) ends by ~510 ms at the
    // latest; rAF frames are not guaranteed under virtual time, so sample after
    // that settle point rather than mid-tween, while phase 2 is still running.
    var early = reduced() ? Promise.resolve() : sleep(620).then(function () {
      assert(svgW(card) > wFold, "svgW is still " + svgW(card) + " 620 ms after the unfold click (folded " + wFold + ")");
    });
    return early.then(function () { return reduced() ? null : sleep(TW - 620); }).then(function () {
      var vis = shownCircles(card);
      assert(vis.length === 3, vis.length + " circles shown, expected 3");
      assert(root.classList.contains("root") && labelOf(root) === "2" && fill(root) === getComputedStyle(items()[0]).backgroundColor, "the root is no longer the blue 2");
      var one = vis.filter(function (c) { return c.classList.contains("one"); })[0];
      var leaf = vis.filter(function (c) { return c.classList.contains("prime-leaf"); })[0];
      assert(one && labelOf(one) === "1", "no gray 1");
      assert(leaf && labelOf(leaf) === "2", "no green 2");
      assert(num(one, "r") < num(root, "r"), "the 1 is not smaller than the 2");
      assert(fill(one) !== fill(root) && fill(leaf) !== fill(root) && fill(one) !== fill(leaf), "the three fills are not all different");
      assert(b.getAttribute("aria-expanded") === "true", "badge aria-expanded is " + b.getAttribute("aria-expanded"));
      assert(b.getAttribute("aria-label") === T("foldLabel", { n: 2 }), "badge label is " + b.getAttribute("aria-label"));
      assert(!shown(ringOf(root)), "the ring is still shown");
      assert(root.classList.contains("mirrorable"), "the root is not mirrorable");
      assert(cardEdges(card).filter(shown).length === 2, "expected 2 shown edges");
      visibleCoherent(card);
      assert(svgW(card) > wFold && svgH(card) > hFold, "the card did not grow: " + svgW(card) + "x" + svgH(card) + " vs " + wFold + "x" + hFold);
      assert(eqText(card) === "2 = 2 × 1", "equation is '" + eqText(card) + "'");
      assert(msg() === T("msgPrime", { n: 2 }), "message is '" + msg() + "'");
      noErrors("P4");
      return "+ on the blue 2 reveals a small gray 1 and a green 2; the card grew; 2 = 2 × 1 and the prime message appear";
    });
  });

  function childMap(card) {
    var m = new Map();
    edgeInfo(card).forEach(function (e) {
      if (!m.has(e.from)) m.set(e.from, []);
      m.get(e.from).push(e.to);
    });
    return m;
  }
  function descendantsIn(map, c, acc) {
    (map.get(c) || []).forEach(function (k) { acc.push(k); descendantsIn(map, k, acc); });
    return acc;
  }
  function collapsedInto(card, F, D) {
    D.forEach(function (c) {
      assert(!shown(c), "circle " + labelOf(c) + " is still shown inside the folded circle");
      assert(num(c, "r") <= EPS, "circle " + labelOf(c) + " has r " + num(c, "r"));
      assert(near(num(c, "cx"), num(F, "cx")) && near(num(c, "cy"), num(F, "cy")), "circle " + labelOf(c) + " is not on the folded centre");
    });
  }
  function mirroredAbout(oldPos, newPos, ref) {
    oldPos.forEach(function (x, i) {
      var want = -(x - oldPos[ref]);
      var got = newPos[i] - newPos[ref];
      assert(near(got, want), "circle " + i + " offset " + got + " expected " + want);
    });
  }
  function lastCard() { var c = cards(); return c[c.length - 1]; }
  function itemByText(t) {
    var f = items().filter(function (b) { return b.textContent === t; });
    assert(f.length > 0, "no palette item reads " + t);
    return f[f.length - 1];
  }
  function expandedStates(card) {
    return cardCircles(card).map(function (c) { var b = badgeOf(c); return b ? b.getAttribute("aria-expanded") : "-"; });
  }
  function wait() { return reduced() ? Promise.resolve() : sleep(TW); }
  function childLabels(card) {
    return (childMap(card).get(rootOf(card)) || []).map(labelOf).sort();
  }
  function sameGeom(a, b, label) {
    assert(a.length === b.length, label + ": circle count " + b.length + ", expected " + a.length);
    a.forEach(function (g, i) { [0, 1, 2].forEach(function (k) { assert(near(g[k], b[i][k]), label + ": circle " + i + " [" + k + "] is " + b[i][k] + ", expected " + g[k]); }); });
  }
  function foldedBadges(card) {
    return arr(card.querySelectorAll(".fold-badge")).filter(function (x) { return shown(x) && x.getAttribute("aria-expanded") === "false"; });
  }

  step("P5 composite-first-unfold", function () {
    pointerClick(itemByText("60"));
    var card = lastCard();
    var root = rootOf(card);
    var b = badgeOf(root);
    assert(shownCircles(card).length === 1 && labelOf(shownCircles(card)[0]) === "60", "the new card does not show a lone 60");
    assert(b.getAttribute("aria-expanded") === "false", "the 60 is not folded");
    assert(document.activeElement !== b, "a pointer placement moved focus onto the badge");
    var wFold = svgW(card);
    click(b);
    var G;
    return wait().then(function () {
      assert(svgW(card) > wFold, "the card did not grow");
      assert(foldedBadges(card).length === 0, foldedBadges(card).length + " circles still folded after the first +");
      assert(shownCircles(card).length === 15, shownCircles(card).length + " circles shown, expected 15");
      assert(cardEdges(card).filter(shown).length === 14, "expected 14 shown edges");
      var bs = arr(card.querySelectorAll(".fold-badge"));
      assert(bs.length === 7 && bs.every(function (x) { return x.getAttribute("aria-expanded") === "true"; }), "not all 7 badges are expanded");
      var fac = arr(card.querySelectorAll(".tree-equation .fac")).map(function (x) { return x.textContent; });
      assert(fac.length === 2 && fac[0] === "60 = 2 × 2 × 3 × 5" && fac[1] === "60 = 2^2 × 3 × 5", "equation lines are " + JSON.stringify(fac));
      assert(msg() === T("msgFactors", { n: 60, count: 4 }), "message is '" + msg() + "'");
      visibleCoherent(card);
      G = geom(card);
      click(root);
      return wait();
    }).then(function () {
      mirroredAbout(xs(G), xs(geom(card)), cardCircles(card).indexOf(root));
      click(root);
      return wait();
    }).then(function () {
      sameGeom(G, geom(card), "after un-mirroring the root");
      var c30 = circleByLabel(card, "internal", "30");
      var D = descendantsIn(childMap(card), c30, []);
      assert(D.length === 10, "30 has " + D.length + " descendants, expected 10");
      var wFull = svgW(card);
      click(badgeOf(c30));
      assert(eqText(card) === "", "the equation stays after folding");
      return wait().then(function () {
        collapsedInto(card, c30, D);
        assert(svgW(card) < wFull, "the card did not shrink: " + svgW(card) + " vs " + wFull);
        visibleCoherent(card);
        click(badgeOf(c30));
        return wait();
      }).then(function () {
        sameGeom(G, geom(card), "after unfolding 30");
        assert(eqText(card).indexOf("60 = 2 × 2 × 3 × 5") === 0, "the equation did not return: '" + eqText(card) + "'");
        var kids = childMap(card).get(c30).filter(function (c) { return badgeOf(c); });
        assert(kids.length > 0, "30 has no internal child");
        var k = kids[0];
        click(badgeOf(k));
        return wait();
      }).then(function () {
        click(badgeOf(root));
        return wait();
      }).then(function () {
        click(badgeOf(root));
        return wait();
      }).then(function () {
        assert(foldedBadges(card).length === 1, foldedBadges(card).length + " folded circles after re-unfolding the root, expected 1 (only the first + cascades)");
        assert(eqText(card) === "", "the equation shows with a circle still folded");
        visibleCoherent(card);
        noErrors("P5");
        return "the first + on 60 unfolds all 15 circles at once; equation and message appear; mirror, fold and unfold restore exact geometry; later + presses open one split only";
      });
    });
  });

  step("P6 click-and-keyboard-placement", function () {
    var before = cards().length;
    itemByText("5").click();
    var c5 = lastCard();
    assert(cards().length === before + 1 && labelOf(shownCircles(c5)[0]) === "5", "a keyboard-style click did not place a 5");
    assert(document.activeElement === badgeOf(rootOf(c5)), "focus is not on the new tree's + button");
    var seven = itemByText("7");
    assert(key(seven, { key: "Enter", repeat: true }), "a held Enter was not default-prevented");
    assert(cards().length === before + 1, "a held key placed a tree");
    pointerClick(seven);
    var c7 = lastCard();
    assert(cards().length === before + 2 && labelOf(shownCircles(c7)[0]) === "7", "a pointer click did not place a 7");
    assert(document.activeElement !== badgeOf(rootOf(c7)), "a pointer click moved focus onto the badge");
    noErrors("P6");
    return "detail-0 click places a tree and focuses its +; held Enter is blocked; a pointer click leaves focus alone";
  });

  step("P7 multi-tree-remove-clear", function () {
    var cs = cards();
    assert(cs.length >= 3, "only " + cs.length + " cards");
    var A = cs[0], B = cs[1];
    var gA = geom(A), wA = svgW(A);
    click(badgeOf(rootOf(B)));
    return wait().then(function () {
      sameGeom(gA, geom(A), "unfolding card B moved card A");
      assert(near(svgW(A), wA), "unfolding card B resized card A");
      var rb = B.querySelector(".tree-remove");
      var nB = labelOf(rootOf(B));
      assert(rb.getAttribute("aria-label") === T("removeLabel", { n: nB }) && rb.getAttribute("title") === T("removeLabel", { n: nB }), "remove button label is " + rb.getAttribute("aria-label"));
      var count = cards().length;
      click(rb);
      assert(cards().length === count - 1 && cards().indexOf(B) < 0 && !document.contains(B), "the card was not removed");
      var ae = document.activeElement;
      assert(ae && ae.classList.contains("tree-remove") && cards().some(function (c) { return c.contains(ae); }), "focus did not move to a remaining remove button");
      var first = cards()[0];
      click(badgeOf(rootOf(first)));
      click(first.querySelector(".tree-remove"));
      return sleep(TW);
    }).then(function () {
      noErrors("P7 fold-then-remove");
      var palette = items().length;
      click(document.getElementById("clearBtn"));
      assert(cards().length === 0, cards().length + " cards after Clear");
      assert(shown(document.getElementById("workHint")), "the hint is hidden after Clear");
      assert(document.getElementById("clearBtn").disabled, "Clear is still enabled");
      assert(document.activeElement === items()[0], "focus is not on the first palette item");
      assert(msg() === "", "the message is '" + msg() + "'");
      assert(items().length === palette, "Clear changed the palette");
      noErrors("P7");
      return "trees are independent; a card removes itself and hands focus on; fold-then-remove is clean; Clear empties the area and keeps the palette";
    });
  });

  step("P8 mode-switch", function () {
    var inp = document.getElementById("addInput");
    var n0 = items().length;
    inp.value = "45"; click(document.getElementById("addBtn"));
    inp.value = "1000003"; click(document.getElementById("addBtn"));
    assert(items().length === n0 + 2, "adding 45 and 1000003 gave " + items().length + " items");
    pointerClick(itemByText("45"));
    var c45 = lastCard();
    pointerClick(itemByText("1000003"));
    assert(cards().length === 2, cards().length + " cards, expected 2");
    click(badgeOf(rootOf(c45)));
    return wait().then(function () {
      assert(childLabels(c45).join() === ["15", "3"].sort().join(), "classic children of 45 are " + childLabels(c45).join());
      click(document.querySelector('.mode-btn[data-mode="balanced"]'));
      var cs = cards();
      assert(cs.length === 1 && labelOf(shownCircles(cs[0])[0]) === "45", cs.length + " cards after the switch to Balanced");
      assert(badgeOf(rootOf(cs[0])).getAttribute("aria-expanded") === "false", "the rebuilt 45 is not folded");
      assert(msg() === T("msgTooLargeBalanced"), "message is '" + msg() + "'");
      assert(inp.max === "1000000", "max is " + inp.max);
      click(badgeOf(rootOf(cs[0])));
      return wait().then(function () {
        assert(childLabels(cs[0]).join() === ["5", "9"].join(), "balanced children of 45 are " + childLabels(cs[0]).join());
        pointerClick(itemByText("1000003"));
        assert(cards().length === 1, "an over-cap circle was placed in Balanced mode");
        assert(msg() === T("msgTooLargeBalanced"), "message is '" + msg() + "'");
        var count = items().length;
        inp.value = "2000000"; click(document.getElementById("addBtn"));
        assert(items().length === count, "an over-cap number was added in Balanced mode");
        assert(msg() === T("msgTooLargeBalanced"), "message is '" + msg() + "'");
        click(document.querySelector('.mode-btn[data-mode="classic"]'));
        assert(inp.max === "1000000000000", "max is " + inp.max);
        var back = cards();
        assert(back.length === 1 && badgeOf(rootOf(back[0])).getAttribute("aria-expanded") === "false", "the 45 card was not rebuilt folded in Classic");
        click(document.getElementById("clearBtn"));
        assert(cards().length === 0, "Clear left cards behind");
        noErrors("P8");
        return "Balanced rebuilds folded and drops over-cap trees with a message; 45 splits 3 x 15 then 5 x 9; over-cap Add and placement refused; Classic rebuilds";
      });
    });
  });

  step("P9 randomize", function () {
    var inp = document.getElementById("addInput");
    var palette = items().length;
    inp.value = "";
    click(document.getElementById("randomBtn"));
    var v = inp.value;
    assert(/^\d+$/.test(v), "the field holds '" + v + "'");
    var n = Number(v);
    assert(n >= 12 && n <= 9999, n + " is outside [12, 9999]");
    var f = 0, m = n;
    for (var d = 2; d * d <= m; d++) while (m % d === 0) { f++; m /= d; }
    if (m > 1) f++;
    assert(f >= 3, n + " has only " + f + " prime factors");
    assert(items().length === palette && cards().length === 0, "Randomize changed the palette or placed a tree");
    click(document.getElementById("randomBtn"));
    assert(inp.value !== v, "a second Randomize gave the same value " + v);
    noErrors("P9");
    return "Randomize only fills the field with a different 3+-factor number in [12, 9999]";
  });

  step("P10 language", function () {
    var enItem = items()[0].getAttribute("aria-label");
    pointerClick(items()[0]);
    var cA = lastCard();
    click(badgeOf(rootOf(cA)));
    return wait().then(function () {
      pointerClick(itemByText("60"));
      var cB = lastCard();
      var gA = geom(cA), gB = geom(cB), eA = expandedStates(cA), eB = expandedStates(cB);
      var enMsg = msg();
      NT.i18n.setLang("ru");
      sameGeom(gA, geom(cA), "card A moved on a language change");
      sameGeom(gB, geom(cB), "card B moved on a language change");
      assert(expandedStates(cA).join() === eA.join() && expandedStates(cB).join() === eB.join(), "a fold state changed on a language change");
      var ruItem = items()[0].getAttribute("aria-label");
      assert(ruItem === T("paletteItemLabel", { n: 2 }) && ruItem !== enItem, "palette label is '" + ruItem + "' (en '" + enItem + "')");
      var rb = cA.querySelector(".tree-remove");
      assert(rb.getAttribute("aria-label") === T("removeLabel", { n: 2 }), "remove label is '" + rb.getAttribute("aria-label") + "'");
      [cA, cB].forEach(function (card) {
        cardCircles(card).forEach(function (c) {
          var b = badgeOf(c);
          if (!b) return;
          var want = T(b.getAttribute("aria-expanded") === "true" ? "foldLabel" : "unfoldLabel", { n: labelOf(c) });
          assert(b.getAttribute("aria-label") === want, "badge label is '" + b.getAttribute("aria-label") + "', expected '" + want + "'");
        });
      });
      assert(document.getElementById("workHint").textContent === T("workHint"), "the hint did not change language");
      assert(document.getElementById("paletteHeading").textContent === T("paletteHeadingNumbers"), "the palette heading did not change language");
      assert(document.getElementById("workHeading").textContent === T("workHeading"), "the working-area heading did not change language");
      assert(document.getElementById("addBtn").textContent === T("add"), "Add did not change language");
      assert(msg() === T("msgPrime", { n: 2 }) && msg() !== enMsg, "the message is '" + msg() + "'");
      NT.i18n.setLang("en");
      click(document.getElementById("clearBtn"));
      noErrors("P10");
      return "a language switch relabels palette, remove buttons, badges, headings, hint and message without moving or folding anything";
    });
  });

  step("P11 bin", function () {
    var bin = document.getElementById("paletteBin");
    var lid = bin.querySelector(".bin-lid");
    var head = document.getElementById("paletteHeading");
    assert(bin.getAttribute("role") === "img" && bin.getAttribute("aria-label") === T("binLabel") && bin.getAttribute("title") === T("binLabel"), "bin label is '" + bin.getAttribute("aria-label") + "'");
    assert(bin.parentNode === head.parentNode, "the bin is not in the palette heading row");
    var closedLid = getComputedStyle(lid).transform;
    var n0 = items().length, c0 = cards().length;
    var bc = centre(bin);
    var two = itemByText("2");
    dragStart(two, bc.x, bc.y, "mouse");
    assert(bin.classList.contains("is-open"), "the bin did not open with a circle above it");
    var open = function () { return getComputedStyle(lid).transform; };
    return (reduced() ? Promise.resolve() : sleep(260)).then(function () {
      assert(open() !== closedLid && open() !== "none", "the lid did not tilt open: " + open());
      ptr("pointermove", document, bc.x, bc.y + 200, "mouse");
      assert(!bin.classList.contains("is-open"), "the bin stayed open after the circle left it");
      ptr("pointermove", document, bc.x, bc.y, "mouse");
      dragDrop(bc.x, bc.y, "mouse");
      assert(!bin.classList.contains("is-open"), "the bin stayed open after the drop");
      assert(items().length === n0 - 1 && !document.contains(two) && !items().some(function (x) { return x.textContent === "2"; }), "the 2 is still in the palette");
      assert(cards().length === c0, "binning placed a tree");
      assert(ghosts() === 0, "a ghost is left behind");
      assert(msg() === T("msgRemoved", { n: 2 }), "message is '" + msg() + "'");
      var three = itemByText("3");
      dragStart(three, bc.x, bc.y, "mouse");
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
      dragDrop(bc.x, bc.y, "mouse");
      assert(document.contains(three) && !bin.classList.contains("is-open"), "Escape over the bin still removed the 3 or left it open");
      return sleep(20).then(function () {
        dragStart(three, bc.x, bc.y, "touch");
        dragDrop(bc.x, bc.y, "touch");
        assert(!document.contains(three), "a touch drag onto the bin did not remove the 3");
        assert(head.textContent === T("paletteHeadingNumbers"), "heading is '" + head.textContent + "' with composites left");
        var comps = items().filter(function (x) { return !isPrimeNum(Number(x.textContent)); });
        assert(comps.length > 0, "no composites left to bin");
        comps.forEach(function (x, j) {
          var list = items(), i = list.indexOf(x);
          var expectFocus = list[i + 1] || list[i - 1];
          x.focus();
          assert(key(x, { key: j % 2 ? "Delete" : "Backspace" }), "Delete/Backspace was not default-prevented");
          assert(!document.contains(x), x.textContent + " survived Delete");
          assert(document.activeElement === expectFocus, "focus did not move to the neighbouring circle");
        });
        assert(head.textContent === T("paletteHeading"), "binning the last composite left the heading as '" + head.textContent + "'");
        NT.i18n.setLang("el");
        assert(bin.getAttribute("aria-label") === T("binLabel") && head.textContent === T("paletteHeading"), "bin label or heading did not follow a language switch");
        NT.i18n.setLang("en");
        noErrors("P11");
        return "a circle over the bin tilts its lid open; dropping bins it (mouse and touch) with a message; leaving or Escape keeps it; Delete/Backspace bin the focused circle; the heading reverts to Prime palette";
      });
    });
  });

  step("P12 compose", function () {
    click(document.getElementById("clearBtn"));
    var we = workEmpty();
    var seven = itemByText("7"), five = itemByText("5");
    dragStart(seven, we.x, we.y, "mouse");
    dragDrop(we.x, we.y, "mouse");
    var cs = cards();
    assert(cs.length === 1, cs.length + " cards after dropping 7 into empty space");
    var card = cs[0];
    var cc = centre(card);
    dragStart(five, cc.x, cc.y, "mouse");
    assert(card.classList.contains("is-drop-target"), "the card under the circle is not highlighted");
    assert(!document.getElementById("workArea").classList.contains("is-drop-over"), "the working area is highlighted while over a card");
    dragDrop(cc.x, cc.y, "mouse");
    pointerClick(five);
    cs = cards();
    assert(cs.length === 1, cs.length + " cards after composing 5 into 7, expected 1");
    card = cs[0];
    assert(!card.classList.contains("is-drop-target"), "is-drop-target left behind");
    assert(rootOf(card) && labelOf(rootOf(card)) === "35", "the composed root reads " + (rootOf(card) && labelOf(rootOf(card))));
    assert(childLabels(card).join() === "5,7", "35's children are " + childLabels(card).join());
    assert(badgeOf(rootOf(card)).getAttribute("aria-expanded") === "true", "the composed root is folded");
    var sevenC = circleByLabel(card, "internal", "7");
    assert(badgeOf(sevenC).getAttribute("aria-expanded") === "false", "the old 7 lost its folded state");
    assert(eqText(card) === "", "the equation shows while 7 is folded");
    assert(card.querySelector(".tree-remove").getAttribute("aria-label") === T("removeLabel", { n: 35 }), "remove label is not for 35");
    click(badgeOf(sevenC));
    return wait().then(function () {
      assert(eqText(card) !== "", "the equation did not appear once every split is open");
      dragStart(itemByText("5"), we.x, we.y, "mouse");
      dragDrop(we.x, we.y, "mouse");
      assert(cards().length === 2 && cards()[0] === card, "a drop beside the card did not place a second tree after it");
      noErrors("P12");
      return "a circle dropped on a card composes into it (5 on 7 gives 35 with branches 5 and 7, old folds kept, card highlighted mid-drag); beside a card it places its own tree";
    });
  });

  step("P13 compose-panels", function () {
    click(document.getElementById("clearBtn"));
    var inp = document.getElementById("addInput");
    ["30", "40"].forEach(function (v) {
      inp.value = v;
      click(document.getElementById("addBtn"));
      pointerClick(itemByText(v));
    });
    var cs = cards();
    assert(cs.length === 2, cs.length + " cards after placing 30 and 40");
    var thirty = cs[0], forty = cs[1];
    click(badgeOf(rootOf(thirty)));
    return wait().then(function () {
      var grip = forty.querySelector(".tree-grip");
      assert(grip && grip.getAttribute("aria-label") === T("moveLabel", { n: 40 }) && grip.getAttribute("title") === T("moveLabel", { n: 40 }), "the 40 card's grip label is " + (grip && grip.getAttribute("aria-label")));
      var bc = centre(document.getElementById("paletteBin"));
      dragStart(grip, bc.x, bc.y, "mouse");
      assert(!document.getElementById("paletteBin").classList.contains("is-open"), "a card opened the bin");
      dragDrop(bc.x, bc.y, "mouse");
      assert(cards().length === 2, "dropping a card on the bin removed it");
      var we = workEmpty();
      dragStart(grip, we.x, we.y, "touch");
      dragDrop(we.x, we.y, "touch");
      assert(cards().length === 2 && cards()[1] === forty, "a card dropped on empty space changed the panels");
      // the left half of the target multiplies; the right half overlaps on the gcd
      var tr = thirty.getBoundingClientRect();
      var tc = { x: tr.left + tr.width * 0.25, y: tr.top + tr.height / 2 };
      dragStart(grip, tc.x, tc.y, "touch");
      assert(forty.classList.contains("is-drag-source"), "the dragged card is not marked");
      assert(thirty.classList.contains("is-drop-target"), "the target card is not highlighted");
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
      dragDrop(tc.x, tc.y, "touch");
      assert(cards().length === 2 && !forty.classList.contains("is-drag-source") && !thirty.classList.contains("is-drop-target"), "Escape composed the cards or left a mark");
      // the 40 card's own top padding (not the tree) drags it with a mouse
      var fr = forty.getBoundingClientRect();
      var c0 = { x: fr.left + fr.width / 2, y: fr.top + 3 };
      ptr("pointerdown", forty, c0.x, c0.y, "mouse");
      ptr("pointermove", document, c0.x + 3, c0.y, "mouse");
      ptr("pointermove", document, tc.x, tc.y, "mouse");
      dragDrop(tc.x, tc.y, "mouse");
      cs = cards();
      assert(cs.length === 1 && ghosts() === 0, cs.length + " cards after dropping 40 on 30");
      var card = cs[0];
      assert(labelOf(rootOf(card)) === "1200", "the composed root reads " + labelOf(rootOf(card)));
      var kids = childMap(card).get(rootOf(card)) || [];
      assert(kids.map(labelOf).join() === "30,40", "1200's children are " + kids.map(labelOf).join());
      assert(num(kids[0], "cx") < num(kids[1], "cx"), "30 (placed first) is not the left branch");
      assert(badgeOf(kids[0]).getAttribute("aria-expanded") === "true", "the open 30 tree was folded");
      assert(badgeOf(kids[1]).getAttribute("aria-expanded") === "false", "the folded 40 tree was opened");
      assert(card.querySelector(".tree-grip").getAttribute("aria-label") === T("moveLabel", { n: 1200 }), "grip label not for 1200");
      click(badgeOf(kids[1]));
      return wait().then(function () {
        assert(foldedBadges(card).length === 0, "the 40's first + did not unfold it all the way down");
        assert(eqText(card) !== "", "no equation once 1200 is fully open");
        noErrors("P13");
        return "a card dragged by its grip (mouse, touch) or its background onto another composes them: 30 and 40 give 1200 whose branches are the two old trees, earlier card on the left, folds kept; bin, empty space and Escape do nothing";
      });
    });
  });

  function placeNumbers(ns) {
    var inp = document.getElementById("addInput");
    ns.forEach(function (v) {
      inp.value = v;
      click(document.getElementById("addBtn"));
      pointerClick(itemByText(v));
    });
  }
  function halfPoint(card, frac) {
    var r = card.getBoundingClientRect();
    return { x: r.left + r.width * frac, y: r.top + r.height / 2 };
  }
  // at least one zero-delay tick, so the page's dragJustEnded clears
  function settle() { return sleep(reduced() ? 30 : 2600); }
  function sharedOf(card) { return arr(card.querySelectorAll(".node-circle.shared")); }
  // A gcd pair is one .tree-pair holding two .tree-card panels.
  function pairsIn() { return arr(document.querySelectorAll("#workArea > .tree-pair")); }
  function halvesOf(pair) { return arr(pair.querySelectorAll(".tree-pair-row > .tree-card")); }
  function parentsOf(card, c) { return edgeInfo(card).filter(function (e) { return e.to === c; }).map(function (e) { return e.from; }); }

  step("P14 gcd-overlap", function () {
    click(document.getElementById("clearBtn"));
    placeNumbers(["84", "90"]);
    var cs = cards();
    assert(cs.length === 2, cs.length + " cards after placing 84 and 90");
    var a = cs[0], b = cs[1];
    var grip = a.querySelector(".tree-grip");
    var L = halfPoint(b, 0.25), R = halfPoint(b, 0.75);
    dragStart(grip, L.x, L.y, "mouse");
    var split = b.querySelector(".drop-split");
    assert(split && split.getAttribute("aria-hidden") === "true", "no hidden split overlay on the target card");
    var mul = split.querySelector(".drop-mul"), g = split.querySelector(".drop-gcd");
    assert(mul.textContent === "84 × 90" && g.textContent === "gcd(84, 90)", "halves read '" + mul.textContent + "' / '" + g.textContent + "'");
    assert(mul.classList.contains("is-active") && !g.classList.contains("is-active"), "the left half is not the active one");
    ptr("pointermove", document, R.x, R.y, "mouse");
    assert(g.classList.contains("is-active") && !mul.classList.contains("is-active"), "the right half is not the active one");
    dragDrop(R.x, R.y, "mouse");
    cs = cards();
    assert(pairsIn().length === 1 && cs.length === 2 && ghosts() === 0 && !document.querySelector(".drop-split"), pairsIn().length + " pairs / " + cs.length + " panels / leftover split after the gcd drop");
    var pair = pairsIn()[0];
    var hs = halvesOf(pair);
    assert(hs.length === 2 && !pair.querySelector(".tree-grip"), "the gcd pair is not two panels without a grip");
    assert(pair.querySelector(".tree-remove").getAttribute("aria-label") === T("removeOverlapLabel", { a: 84, b: 90 }), "remove label is " + pair.querySelector(".tree-remove").getAttribute("aria-label"));
    return settle().then(function () {
      assert(labelOf(rootOf(hs[0])) === "84" && labelOf(rootOf(hs[1])) === "90", "roots read " + labelOf(rootOf(hs[0])) + "," + labelOf(rootOf(hs[1])));
      hs.forEach(function (h, i) {
        var sh = sharedOf(h).filter(shown);
        assert(sharedOf(h).length === 1 && sh.length === 1 && labelOf(sh[0]) === "6", "shared circles of panel " + i + ": " + sharedOf(h).map(labelOf).join());
        assert(parentsOf(h, sh[0]).map(labelOf).join() === (i ? "90" : "84"), "6 hangs from " + parentsOf(h, sh[0]).map(labelOf).join());
        assert((childMap(h).get(sh[0]) || []).map(labelOf).sort().join() === "2,3", "6's children are wrong in panel " + i);
        assert(!badgeOf(rootOf(h)), "a root of the pair can be folded");
        assert(badgeOf(sh[0]), "the shared 6 has no fold badge");
        visibleCoherent(h);
      });
      var r84 = (childMap(hs[0]).get(rootOf(hs[0])) || []).map(labelOf).join();
      var r90 = (childMap(hs[1]).get(rootOf(hs[1])) || []).map(labelOf).join();
      assert(r84 === "14,6" && r90 === "6,15", "84 splits " + r84 + ", 90 splits " + r90);
      var eq = eqText(pair);
      assert(eq === "84 = 14 × 6" + "90 = 6 × 15" + "gcd(84, 90) = 6", "equation reads " + eq);
      assert(msg() === T("msgGcd", { a: 84, b: 90, g: 6 }), "message is " + msg());

      placeNumbers(["9", "10"]);
      cs = cards();
      var p = halfPoint(cs[2], 0.8);
      dragStart(cs[3].querySelector(".tree-grip"), p.x, p.y, "touch");
      dragDrop(p.x, p.y, "touch");
      return settle();
    }).then(function () {
      cs = cards();
      assert(pairsIn().length === 2 && cs.length === 4, pairsIn().length + " pairs / " + cs.length + " panels after overlapping 9 and 10");
      halvesOf(pairsIn()[1]).forEach(function (h) {
        var sh = sharedOf(h).filter(shown);
        assert(sh.length === 1 && labelOf(sh[0]) === "1" && sh[0].classList.contains("one"), "coprime shared circle is " + sh.map(labelOf).join());
      });
      assert(msg() === T("msgCoprime", { a: 9, b: 10 }), "message is " + msg());

      placeNumbers(["12", "36"]);
      cs = cards();
      var p = halfPoint(cs[5], 0.8);
      dragStart(cs[4].querySelector(".tree-grip"), p.x, p.y, "mouse");
      dragDrop(p.x, p.y, "mouse");
      return settle();
    }).then(function () {
      var c = pairsIn()[2];
      assert(pairsIn().length === 3 && c, pairsIn().length + " pairs after overlapping 12 and 36");
      var roots = arr(c.querySelectorAll(".node-circle.root")).filter(shown);
      halvesOf(c).forEach(function (h) {
        var sh = sharedOf(h).filter(shown);
        assert(sh.length === 1 && labelOf(sh[0]) === "12", "12 | 36 gives roots " + roots.map(labelOf).join() + " shared " + sh.map(labelOf).join());
        visibleCoherent(h);
      });
      assert(roots.map(labelOf).join() === "36", "12 | 36 gives roots " + roots.map(labelOf).join());
      assert(eqText(c) === "36 = 12 × 3" + "gcd(12, 36) = 12", "equation reads " + eqText(c));

      placeNumbers(["4", "6"]);
      cs = cards();
      var p = halfPoint(cs[6], 0.2);
      dragStart(cs[7].querySelector(".tree-grip"), p.x, p.y, "mouse");
      dragDrop(p.x, p.y, "mouse");
      cs = cards();
      assert(cs.length === 7 && labelOf(rootOf(cs[6])) === "24", "the left half no longer multiplies 4 and 6");

      click(document.querySelector('.mode-btn[data-mode="balanced"]'));
      cs = cards();
      assert(cs.length === 7, cs.length + " panels after the mode switch");
      assert(pairsIn().map(function (q) { return halvesOf(q).map(function (h) { return sharedOf(h).map(labelOf).join(); }).join("/"); }).join("|") === "6/6|1/1|12/12", "pairs did not survive the mode switch");
      assert(eqText(pairsIn()[0]) === "84 = 14 × 6" + "90 = 6 × 15" + "gcd(84, 90) = 6", "rebuilt equation reads " + eqText(pairsIn()[0]));
      click(document.querySelector('.mode-btn[data-mode="classic"]'));
      click(document.getElementById("clearBtn"));
      noErrors("P14");
      return "a card dragged over another splits it into a × b (left) and gcd(a, b) (right); the right half turns the two cards into a glued pair of panels on one shared 6 (2 × 3) under both roots, 9 and 10 share a 1, 36 hangs on 12, the left half still multiplies, a mode switch keeps the pairs";
    });
  });

  var deepSteps = [];
  deepSteps.push({ name: "D1 deep-link", fn: function () {
    assert(document.querySelector('.mode-btn[data-mode="balanced"]').classList.contains("is-active"), "Balanced is not the active mode");
    var it = items();
    assert(it.length === 31 && it[14].textContent === "45" && it[13].textContent === "43" && it[15].textContent === "47", it.length + " palette items, item 14 reads " + it[14].textContent);
    var cs = cards();
    assert(cs.length === 1, cs.length + " cards, expected 1");
    var card = cs[0];
    assert(shownCircles(card).length === 1 && labelOf(shownCircles(card)[0]) === "45", "the card does not show a lone 45");
    assert(badgeOf(rootOf(card)).getAttribute("aria-expanded") === "false", "the 45 is not folded");
    click(badgeOf(rootOf(card)));
    return wait().then(function () {
      assert(childLabels(card).join() === ["5", "9"].join(), "balanced children of 45 are " + childLabels(card).join());
      noErrors("D1");
      return "?n=45 opens in Balanced with 45 appended to the palette and placed folded; + splits it 5 x 9";
    });
  } });
  if (/[?&]n=/.test(location.search)) steps = deepSteps;
  var pairSteps = [];
  pairSteps.push({ name: "D2 deep-link-pair", fn: function () {
    assert(document.querySelector('.mode-btn[data-mode="balanced"]').classList.contains("is-active"), "Balanced is not the active mode");
    assert(items().some(function (b) { return b.textContent === "30"; }) && items().some(function (b) { return b.textContent === "35"; }), "30 and 35 were not added to the palette");
    var cs = cards();
    assert(pairsIn().length === 1 && cs.length === 2, pairsIn().length + " pairs / " + cs.length + " panels, expected one gcd pair");
    var card = pairsIn()[0];
    return settle().then(function () {
      var hs = halvesOf(card);
      assert(labelOf(rootOf(hs[0])) === "30" && labelOf(rootOf(hs[1])) === "35", "roots read " + labelOf(rootOf(hs[0])) + "," + labelOf(rootOf(hs[1])));
      hs.forEach(function (h) {
        var sh = sharedOf(h).filter(shown);
        assert(sh.length === 1 && labelOf(sh[0]) === "5" && sharedOf(h).length === 1, "shared circles: " + sharedOf(h).map(labelOf).join());
        visibleCoherent(h);
      });
      assert(eqText(card) === "30 = 6 × 5" + "35 = 5 × 7" + "gcd(30, 35) = 5", "equation reads " + eqText(card));
      noErrors("D2");
      return "?a=30&b=35 opens in Balanced with 30 and 35 in the palette and their trees as two panels overlapping on a shared 5";
    });
  } });
  if (/[?&]a=/.test(location.search)) steps = pairSteps;

  var chain = Promise.resolve();
  window.addEventListener("load", function () {
    // P1 must observe the page right after its own load handler, so run it
    // synchronously here (this listener runs after the page's).
    var first = steps[0];
    try {
      var res = first.fn();
      if (res && typeof res.then === "function") {
        chain = res.then(
          function (m) { emit("PASS " + first.name + ": " + m); },
          function (e) { emit("FAIL " + first.name + ": " + (e && e.message ? e.message : e)); }
        );
      } else {
        emit("PASS " + first.name + ": " + res);
      }
    } catch (e) { emit("FAIL " + first.name + ": " + (e && e.message ? e.message : e)); }
    steps.slice(1).forEach(function (s) {
      chain = chain.then(function () {
        // let the page's own zero-delay timers (dragJustEnded) settle between steps
        return sleep(30).then(s.fn).then(
          function (m) { emit("PASS " + s.name + ": " + m); },
          function (e) { emit("FAIL " + s.name + ": " + (e && e.message ? e.message : e)); }
        );
      });
    });
  });
}

function buildSite() {
  var siteRoot = harness.mkScratch("kaz-site-");
  fs.cpSync(path.join(ROOT, "assets"), path.join(siteRoot, "assets"), { recursive: true });
  var src = fs.readFileSync(path.join(ROOT, "Factor Tree", "factor-tree.html"), "utf8");
  var probe = "(" + inPage.toString() + ")(" + JSON.stringify({}) + ");";
  var markup = '<pre id="kaz-out"></pre>\n<script>\n' + probe + "\n</script>\n";
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
  var profileDir = harness.mkScratch("kaz-profile-");
  var args = [
    "--headless=new", "--disable-gpu", "--no-sandbox",
    "--user-data-dir=" + profileDir,
    "--virtual-time-budget=180000",
    "--window-size=1280,900"
  ].concat(extraArgs || [], ["--dump-dom", fileUrl]);
  var res = cp.spawnSync("google-chrome", args, {
    encoding: "utf8", maxBuffer: 200 * 1024 * 1024, timeout: 240000, env: harness.chromeEnv()
  });
  try { fs.rmSync(profileDir, { recursive: true, force: true }); } catch (e) { /* best effort */ }
  return res.stdout || "";
}

function runPage(page, extraArgs, tag, query) {
  var dom = runChrome(url.pathToFileURL(page).href + (query || "?lang=en"), extraArgs);
  var m = /<pre id="kaz-out"[^>]*>([\s\S]*?)<\/pre>/.exec(dom);
  if (!m) {
    console.log("FAIL " + tag + ": probe output <pre id=\"kaz-out\"> missing from the dumped DOM");
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
  var fail = EXPECTED_NODE - pass;
  var page = buildSite();
  var runs = [
    { args: [], tag: "[default] ", query: "?lang=en" },
    { args: ["--force-prefers-reduced-motion"], tag: "[reduced] ", query: "?lang=en" },
    { args: [], tag: "[deeplink] ", query: "?n=45&lang=en" },
    { args: [], tag: "[pairlink] ", query: "?a=30&b=35&lang=en" }
  ];
  runs.forEach(function (run) {
    var r = runPage(page, run.args, run.tag, run.query);
    pass += r.pass;
    fail += r.fail;
  });
  if (fail > 0 || pass !== EXPECTED) {
    console.log("KAZ-PROBE FAIL (" + pass + " pass, " + fail + " fail, expected " + EXPECTED + " scenarios)");
    process.exit(1);
  }
  console.log("KAZ-PROBE PASS (" + pass + " scenarios)");
  process.exit(0);
}

main();
