"use strict";
/*
 * Dev-only regression probe for quick task 261005-kaz: the Factor Tree
 * rehaul around a circle palette. Prime circles (and any number the user
 * adds) are copied by drag-and-drop or click into a working area, land
 * folded, and are unfolded one split at a time through the + button.
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
var EXPECTED_NODE = 3;

var LANGS = ["nl", "en", "de", "fr", "es", "it", "pl", "pt-BR", "pt-PT", "sv", "nb", "ro", "hu", "lv", "ru", "el"];
var NEW_KEYS = ["subtitle", "add", "addInputLabel", "paletteHeading", "paletteItemLabel", "workHeading", "workHint", "clear", "removeLabel", "msgAdded"];

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
      ["paletteItemLabel", "removeLabel", "msgAdded"].forEach(function (k) {
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
    return "16 languages carry the ten new/changed keys; {n} slots intact; ru/el in their own script";
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
    inp.value = "10";
    click(addBtn);
    var it = items();
    assert(it.length === 31, "10 gave " + it.length + " items");
    assert(it[30].textContent === "10", "last item reads " + it[30].textContent);
    assert(it[30].getAttribute("aria-label") === T("paletteItemLabel", { n: 10 }), "last item label is " + it[30].getAttribute("aria-label"));
    assert(msg() === T("msgAdded", { n: 10 }), "message is " + msg());
    assert(document.getElementById("message").classList.contains("info"), "msgAdded lacks class info");
    if (reduced()) assert(getComputedStyle(it[30]).animationName === "none", "the new item still animates under reduced motion: " + getComputedStyle(it[30]).animationName);
    click(addBtn);
    assert(items().length === 32, "a second 10 gave " + items().length + " items");
    inp.value = "60";
    key(inp, { key: "Enter" });
    it = items();
    assert(it.length === 33 && it[32].textContent === "60", "60 + Enter gave " + it.length + " items, last " + it[32].textContent);
    noErrors("P2");
    return "field-left-of-Add, filters, 7 rejections with translated messages, 10 added twice, 60 added with Enter";
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

    dragStart(items()[1], wc.x, wc.y, "touch");
    dragDrop(wc.x, wc.y, "touch");
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
    var early = reduced() ? Promise.resolve() : sleep(300).then(function () {
      assert(svgW(card) > wFold, "svgW is still " + svgW(card) + " 300 ms after the unfold click (folded " + wFold + ")");
    });
    return early.then(function () { return reduced() ? null : sleep(TW); }).then(function () {
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

  //__STEPS__

  var chain = Promise.resolve();
  window.addEventListener("load", function () {
    // P1 must observe the page right after its own load handler, so run it
    // synchronously here (this listener runs after the page's).
    var first = steps[0];
    try { emit("PASS " + first.name + ": " + first.fn()); }
    catch (e) { emit("FAIL " + first.name + ": " + (e && e.message ? e.message : e)); }
    steps.slice(1).forEach(function (s) {
      chain = chain.then(function () {
        return Promise.resolve().then(s.fn).then(
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
  var r = runPage(page, [], "[default] ");
  pass += r.pass;
  fail += r.fail;
  if (fail > 0 || pass !== EXPECTED) {
    console.log("KAZ-PROBE FAIL (" + pass + " pass, " + fail + " fail, expected " + EXPECTED + " scenarios)");
    process.exit(1);
  }
  console.log("KAZ-PROBE PASS (" + pass + " scenarios)");
  process.exit(0);
}

main();
