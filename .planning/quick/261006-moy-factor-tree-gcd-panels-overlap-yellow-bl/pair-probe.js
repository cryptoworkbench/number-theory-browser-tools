"use strict";
/*
 * Dev-only regression probe for quick task 261006-moy: Factor Tree's gcd
 * overlap as two glued panels (yellow left, blue right, green overlap).
 * Never referenced by any page. Node built-ins + the in-repo harness only.
 *
 * Copies assets/ and the Factor Tree page into a scratch site, serves it with
 * `python3 -m http.server` bound to 127.0.0.1 only (never file://, so no real
 * browser storage is touched), injects an in-page probe, and runs headless
 * Chrome once per mode with a throwaway profile. PASS/FAIL lines come back
 * through a <pre> in the dumped DOM.
 *
 * Usage: node pair-probe.js [drag|link|all]   (default all)
 */

var fs = require("fs");
var path = require("path");
var cp = require("child_process");
var net = require("net");
var http = require("http");
var vm = require("vm");

var ROOT = path.resolve(__dirname, "..", "..", "..");
var harness = require(path.join(ROOT, ".planning", "phases", "07-shared-js-module-refactor", "harness.js"));

// Both modes drive the Factor Tree page: drag builds a pair by dropping a
// panel on another's gcd half, link opens the ?a=&b= deep link.
var PAGES = {
  drag: { dir: "Factor Tree", file: "factor-tree.html", query: "?lang=en", expected: 15 },
  link: { dir: "Factor Tree", file: "factor-tree.html", query: "?a=12&b=18&lang=en", expected: 2 }
};

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

var KEYS = ["msgGcd", "msgCoprime", "msgSplit", "splitOverlap", "splitOverlapLabel", "removeOverlapLabel", "foldLabel", "unfoldLabel"];

function expectedStrings() {
  var cat = loadCatalog();
  var out = {};
  ["en", "nl"].forEach(function (lang) {
    out[lang] = {};
    KEYS.forEach(function (k) {
      var v = cat.factorTree && cat.factorTree[lang] && cat.factorTree[lang][k];
      if (typeof v !== "string") throw new Error("missing catalog entry factorTree." + k + " for " + lang);
      out[lang][k] = v;
    });
  });
  return out;
}

/* ---------- in-page probe (serialised into the page) ---------- */

function inPage(cfg) {
  var out = document.getElementById("moy-out");
  var EXP = cfg.expected;
  var EN = cfg.str.en, NL = cfg.str.nl;
  var FOLD_MS = 400;

  function log(line) { out.textContent += line + "\n"; }
  function wait(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
  function eq(a, b, what) {
    var x = JSON.stringify(a), y = JSON.stringify(b);
    if (x !== y) throw new Error(what + ": got " + x + ", expected " + y);
  }
  function ok(c, what) { if (!c) throw new Error(what); }
  function $(id) { return document.getElementById(id); }
  function fmt(tpl, params) {
    return tpl.replace(/\{(\w+)\}/g, function (m, k) { return String(params[k]); });
  }
  // Headless Chrome under a virtual-time budget does not advance CSS
  // transitions, so computed colours would sit at their start value; the
  // probe turns transitions off (the tweens are script-driven and unaffected).
  var noTransitions = document.createElement("style");
  noTransitions.textContent = "*, *::before, *::after { transition: none !important; }";
  document.head.appendChild(noTransitions);
  var count = 0;
  function scenario(name, fn) {
    return Promise.resolve().then(fn).then(function () {
      log("PASS " + name); count++;
    }, function (e) {
      log("FAIL " + name + ": " + (e && e.message ? e.message : e)); count++;
    });
  }
  function qa(root, sel) { return Array.prototype.slice.call(root.querySelectorAll(sel)); }
  function rect(el) { return el.getBoundingClientRect(); }
  function centreOf(el) { var r = rect(el); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; }

  /* ----- Factor Tree helpers ----- */
  function circleOf(n) {
    var cs = qa(document, "#palette .palette-item").filter(function (c) { return Number(c.getAttribute("data-n")) === n; });
    if (!cs.length) throw new Error("no palette circle " + n);
    return cs[0];
  }
  function addNumber(n) {
    if (qa(document, "#palette .palette-item").some(function (c) { return Number(c.getAttribute("data-n")) === n; })) return;
    $("addInput").value = String(n);
    $("addBtn").click();
  }
  function place(n) { circleOf(n).click(); }
  function cards() { return qa(document, "#workArea .tree-card"); }
  function rootText(card) { return card.querySelector(".node-text").textContent; }
  function pairs() { return qa(document, "#workArea > .tree-pair"); }
  function halves(pair) { return qa(pair, ".tree-pair-row > .tree-card"); }
  function resetCards() {
    var clear = $("clearBtn");
    if (!clear.disabled) clear.click();
    eq(qa(document, "#workArea .tree-card").length, 0, "work area emptied");
  }
  // Drops the panel of fromN on the panel of toN at frac of its width (the
  // gcd half is x >= 0.5), through the panel's grip.
  function dropOn(fromCard, toCard, frac) {
    var grip = fromCard.querySelector(".tree-grip");
    var a = centreOf(grip), r = rect(toCard);
    var bx = r.left + r.width * frac, by = r.top + r.height / 2;
    var base = { pointerId: 7, isPrimary: true, pointerType: "mouse", bubbles: true, cancelable: true, button: 0 };
    grip.dispatchEvent(new PointerEvent("pointerdown", Object.assign({ clientX: a.x, clientY: a.y }, base)));
    window.dispatchEvent(new PointerEvent("pointermove", Object.assign({ clientX: (a.x + bx) / 2, clientY: (a.y + by) / 2 }, base)));
    window.dispatchEvent(new PointerEvent("pointermove", Object.assign({ clientX: bx, clientY: by }, base)));
    window.dispatchEvent(new PointerEvent("pointerup", Object.assign({ clientX: bx, clientY: by }, base)));
  }
  function makePair(a, b) {
    resetCards();
    addNumber(a); addNumber(b);
    place(a); place(b);
    var cs = cards();
    eq(cs.length, 2, "two panels placed");
    dropOn(cs[1], cs[0], 0.75);
    eq(pairs().length, 1, "one pair built");
    return pairs()[0];
  }
  function parseColor(str) {
    var m = /^rgba?\(([^)]*)\)$/.exec(str.trim());
    if (m) {
      var p = m[1].split(/[\s,\/]+/).filter(Boolean).map(Number);
      return [p[0], p[1], p[2]];
    }
    m = /^color\(srgb ([^)]*)\)$/.exec(str.trim());
    if (m) {
      var q = m[1].split(/[\s\/]+/).filter(Boolean).map(Number);
      return [q[0] * 255, q[1] * 255, q[2] * 255];
    }
    throw new Error("cannot parse colour " + str);
  }
  function bgOf(el) { return getComputedStyle(el).backgroundColor; }
  function varBg(host, name) {
    var d = document.createElement("div");
    d.style.backgroundColor = "var(" + name + ")";
    host.appendChild(d);
    var c = getComputedStyle(d).backgroundColor;
    host.removeChild(d);
    return c;
  }
  function sharedCentres(pair) {
    return halves(pair).map(function (h) { return centreOf(h.querySelector(".node-circle.shared")); });
  }
  function alignedWithin(pair, tol, what) {
    var c = sharedCentres(pair);
    ok(Math.abs(c[0].x - c[1].x) <= tol && Math.abs(c[0].y - c[1].y) <= tol,
      what + ": shared centres (" + c[0].x.toFixed(2) + "," + c[0].y.toFixed(2) + ") vs (" + c[1].x.toFixed(2) + "," + c[1].y.toFixed(2) + ")");
  }
  function overlaps(pair) {
    var h = halves(pair);
    return rect(h[1]).left < rect(h[0]).right - 0.5;
  }
  function lensMatches(pair, tol, what) {
    var h = halves(pair), a = rect(h[0]), b = rect(h[1]), l = rect(pair.querySelector(".pair-lens"));
    var x0 = Math.max(a.left, b.left), x1 = Math.min(a.right, b.right);
    var y0 = Math.max(a.top, b.top), y1 = Math.min(a.bottom, b.bottom);
    ok(Math.abs(l.left - x0) <= tol && Math.abs(l.right - x1) <= tol && Math.abs(l.top - y0) <= tol && Math.abs(l.bottom - y1) <= tol,
      what + ": lens " + [l.left, l.top, l.right, l.bottom].map(Math.round) + " vs intersection " + [x0, y0, x1, y1].map(Math.round));
  }
  function textsOf(card) { return qa(card, ".node-text").map(function (t) { return t.textContent; }); }
  function eqLines(pair) { return qa(pair, ".pair-equation .fac").map(function (s) { return s.textContent; }); }
  function checkColours(pair, what) {
    var h = halves(pair);
    var ca = bgOf(h[0]), cb = bgOf(h[1]);
    eq(ca, varBg(pair, "--pair-a-bg"), what + " left panel colour");
    eq(cb, varBg(pair, "--pair-b-bg"), what + " right panel colour");
    var lens = pair.querySelector(".pair-lens");
    eq(bgOf(lens), varBg(pair, "--pair-ab-bg"), what + " lens colour");
    var a = parseColor(ca), b = parseColor(cb), g = parseColor(bgOf(lens));
    ok(a[0] > a[1] && a[1] > a[2], what + " left is yellow (R>G>B): " + a);
    ok(b[2] > b[1] && b[1] > b[0], what + " right is blue (B>G>R): " + b);
    ok(g[1] > g[2] && g[1] > g[0], what + " overlap is green (G largest): " + g);
    eq(getComputedStyle(lens).opacity, "1", what + " lens opacity");
    ok(getComputedStyle(lens).display !== "none", what + " lens displayed");
  }

  function fire(el, type, extra) {
    el.dispatchEvent(new MouseEvent(type, Object.assign({ bubbles: true, cancelable: true }, extra || {})));
  }
  function badgesOf(card) { return qa(card, ".fold-badge"); }
  function expandedOf(card) { return badgesOf(card).map(function (b) { return b.getAttribute("aria-expanded"); }); }
  function pressedOf(card) { return qa(card, "[aria-pressed]").map(function (c) { return c.getAttribute("aria-pressed"); }); }
  function badgeOfCircle(circle) {
    var el = circle.nextElementSibling;
    for (var i = 0; i < 4 && el; i++, el = el.nextElementSibling) {
      if (el.classList.contains("fold-badge")) return el;
    }
    throw new Error("no fold badge beside a circle");
  }
  function sharedCircle(card) { return card.querySelector(".node-circle.shared"); }
  // Visible labels strictly below the shared circle, in x order: with a prime
  // rest folded on its split, every one of them belongs to the g sub-tree.
  function belowShared(card) {
    var sy = Number(sharedCircle(card).getAttribute("cy"));
    return qa(card, ".node-text").filter(function (t) {
      return t.style.display !== "none" && Number(t.getAttribute("y")) > sy + 0.5;
    }).map(function (t) { return [Number(t.getAttribute("x")), Number(t.getAttribute("y")), t.textContent]; })
      .sort(function (a, b) { return a[0] - b[0] || a[1] - b[1]; })
      .map(function (a) { return a[2]; });
  }
  function joined(pair) { return wait(2500).then(function () { ok(pair.classList.contains("is-tinted"), "pair tinted"); }); }
  function stateOf(pair) {
    return halves(pair).map(function (h) { return { exp: expandedOf(h), pr: pressedOf(h), t: textsOf(h) }; });
  }
  function settled(ms) { return wait(ms || 1500); }
  var undoW = $("workUndoBtn"), redoW = $("workRedoBtn");

  function dragRun() {
    var chain = Promise.resolve();
    function add(name, fn) { chain = chain.then(function () { return scenario(name, fn); }); }
    var pair;

    add("T1 drop on the gcd half builds two panels, nothing merged", function () {
      pair = makePair(12, 18);
      eq(qa(document, "#workArea > .tree-card").length, 0, "no loose panel in the area");
      var h = halves(pair);
      eq(h.length, 2, "two panels in the row");
      eq([rootText(h[0]), rootText(h[1])], ["12", "18"], "roots");
      eq(h.map(function (c) { return c.querySelectorAll(".tree-grip").length; }), [0, 0], "no grips");
      eq(h.map(function (c) { return c.querySelectorAll(".tree-split").length; }), [1, 0], "Separate only on the left");
      eq(h.map(function (c) { return c.querySelectorAll(".tree-remove").length; }), [0, 1], "x only on the right");
      eq(pair.querySelectorAll(".pair-equation").length, 1, "one equation block");
      h.forEach(function (c, i) {
        eq(c.querySelectorAll(".node-circle.shared").length, 1, "panel " + i + " has one shared circle");
        var t = textsOf(c);
        ["6", "2", "3"].forEach(function (v) { ok(t.indexOf(v) !== -1, "panel " + i + " holds the g sub-tree label " + v); });
      });
    });

    add("T2 colour comes before the overlap", function () {
      ok(!pair.classList.contains("is-tinted"), "not tinted right after the drop");
      ok(!overlaps(pair), "panels stand apart right after the drop");
      return wait(FOLD_MS + 150).then(function () {
        ok(pair.classList.contains("is-tinted"), "tinted once the trees have grown");
        ok(!overlaps(pair), "still apart while the colours appear");
        return wait(2000);
      }).then(function () {
        ok(pair.classList.contains("is-tinted"), "still tinted");
        ok(overlaps(pair), "joined: the panels overlap");
      });
    });

    add("T3 night theme colours: yellow, blue, green", function () {
      var prev = document.documentElement.getAttribute("data-theme");
      document.documentElement.setAttribute("data-theme", "night");
      return wait(300).then(function () {
        checkColours(pair, "night");
        if (prev === null) document.documentElement.removeAttribute("data-theme");
        else document.documentElement.setAttribute("data-theme", prev);
      });
    });

    add("T4 geometry: g on g, lens on the intersection, trees on top", function () {
      pair.scrollIntoView({ block: "center" });
      var h = halves(pair);
      alignedWithin(pair, 1, "joined");
      ok(rect(h[1]).left < rect(h[0]).right, "second panel starts inside the first");
      lensMatches(pair, 2, "joined");
      var sc = sharedCentres(pair)[0];
      var hit = document.elementFromPoint(sc.x, sc.y);
      ok(hit && hit.closest(".tree-svg"), "an svg element is on top at the shared centre");
      var lens = pair.querySelector(".pair-lens"), l = rect(lens);
      lens.style.pointerEvents = "auto";
      var probe = document.elementFromPoint(l.left + 4, l.bottom - 4);
      lens.style.pointerEvents = "";
      ok(probe === lens, "the lens is the topmost layer at its bottom-left corner, got " + (probe && probe.className && probe.className.baseVal !== undefined ? probe.className.baseVal : probe && probe.className));
    });

    add("T5 equation and message", function () {
      eq(eqLines(pair), ["12 = 2 × 6", "18 = 6 × 3", "gcd(12, 18) = 6"], "equation lines");
      eq($("message").textContent, fmt(EN.msgGcd, { a: 12, b: 18, g: 6 }), "message");
    });

    add("T6 Separate: colours go first, then the panels part", function () {
      pair.querySelector(".tree-split").click();
      return wait(150).then(function () {
        ok(!pair.classList.contains("is-tinted"), "colouring removed first");
        ok(overlaps(pair), "panels still overlap while the colours fade");
        return wait(2000);
      }).then(function () {
        eq(pairs().length, 0, "no pair left");
        var cs = cards();
        eq(cs.map(rootText), ["12", "18"], "two standalone panels");
        eq(cs.map(function (c) { return c.querySelectorAll(".tree-grip").length; }), [1, 1], "each has a grip");
        eq(qa(document, ".node-circle.shared").length, 0, "no highlighted circle");
        var surface = varBg(cs[0], "--surface");
        eq(cs.map(bgOf), [surface, surface], "ordinary backgrounds");
        eq($("message").textContent, fmt(EN.msgSplit, { a: 12, b: 18 }), "message");
      });
    });


    add("E1 glue: folding a circle keeps g on g frame by frame", function () {
      var p = makePair(72, 60);
      return joined(p).then(function () {
        var left = halves(p)[0];
        var widthBefore = rect(left).width;
        var sixes = qa(left, ".node-text").filter(function (t) { return t.textContent === "6"; })
          .sort(function (a, b) { return Number(a.getAttribute("x")) - Number(b.getAttribute("x")); });
        var badge = sixes[0].nextElementSibling;
        ok(badge && badge.classList.contains("fold-badge"), "the left 6 has a fold badge");
        fire(badge, "click");
        return wait(200).then(function () {
          alignedWithin(p, 1, "mid-tween");
          lensMatches(p, 2, "mid-tween");
          return wait(1500);
        }).then(function () {
          alignedWithin(p, 1, "after the fold");
          lensMatches(p, 2, "after the fold");
          ok(rect(halves(p)[0]).width < widthBefore - 1, "the left panel got narrower");
          eq(eqLines(p), [], "equation cleared while a circle is folded");
        });
      });
    });

    add("E2 mirror of the g branch acts on both copies, one undo step", function () {
      var p = makePair(24, 60);
      return joined(p).then(function () {
        var h = halves(p);
        var before = belowShared(h[0]);
        eq(belowShared(h[1]), before, "same g sub-tree in both panels at the start");
        fire(sharedCircle(h[0]), "click");
        return wait(1200).then(function () {
          eq([sharedCircle(h[0]).getAttribute("aria-pressed"), sharedCircle(h[1]).getAttribute("aria-pressed")], ["true", "true"], "both pressed");
          var after = belowShared(h[0]);
          ok(JSON.stringify(after) !== JSON.stringify(before), "the order changed: " + before + " -> " + after);
          eq(belowShared(h[1]), after, "same mirrored order in both panels");
          alignedWithin(p, 1, "after the mirror");
          undoW.click();
          var q = pairs()[0], h2 = halves(q);
          eq([sharedCircle(h2[0]).getAttribute("aria-pressed"), sharedCircle(h2[1]).getAttribute("aria-pressed")], ["false", "false"], "one undo unpresses both");
          eq(belowShared(h2[0]), before, "left order restored");
          eq(belowShared(h2[1]), before, "right order restored");
        });
      });
    });

    add("E3 folding the shared circle of the right panel folds both copies", function () {
      var p = makePair(24, 60);
      return joined(p).then(function () {
        var h = halves(p);
        ok(eqLines(p).length > 0, "equation shown while everything is open");
        fire(badgeOfCircle(sharedCircle(h[1])), "click");
        return wait(1300).then(function () {
          eq([badgeOfCircle(sharedCircle(h[0])).getAttribute("aria-expanded"), badgeOfCircle(sharedCircle(h[1])).getAttribute("aria-expanded")], ["false", "false"], "both folded");
          alignedWithin(p, 1, "folded");
          eq(eqLines(p), [], "equation cleared");
          fire(badgeOfCircle(sharedCircle(h[1])), "click");
          return wait(1500);
        }).then(function () {
          eq([badgeOfCircle(sharedCircle(h[0])).getAttribute("aria-expanded"), badgeOfCircle(sharedCircle(h[1])).getAttribute("aria-expanded")], ["true", "true"], "both open again");
          alignedWithin(p, 1, "unfolded");
          ok(eqLines(p).length > 0, "equation back");
        });
      });
    });

    add("E4 undo and redo restore a joined pair at once", function () {
      var p = makePair(72, 60);
      return joined(p).then(function () {
        var linesBefore = eqLines(p);
        eq(linesBefore[linesBefore.length - 1], "gcd(72, 60) = 12", "equation shown");
        $("clearBtn").click();
        eq(qa(document, "#workArea .tree-card").length, 0, "cleared");
        undoW.click();
        var q = pairs()[0];
        ok(q && q.classList.contains("is-tinted"), "restored pair is tinted at once");
        alignedWithin(q, 1, "restored");
        lensMatches(q, 2, "restored");
        eq(eqLines(q), linesBefore, "equation shown again");
        // fold a composite circle, Clear, undo
        var left = halves(q)[0];
        var six = qa(left, ".node-text").filter(function (t) { return t.textContent === "6"; })
          .sort(function (a, b) { return Number(a.getAttribute("x")) - Number(b.getAttribute("x")); })[0];
        fire(six.nextElementSibling, "click");
        return wait(1500).then(function () {
          var st = stateOf(q);
          $("clearBtn").click();
          undoW.click();
          var r = pairs()[0];
          eq(stateOf(r), st, "fold and press lists per panel");
          ok(r.classList.contains("is-tinted"), "tinted");
          alignedWithin(r, 1, "restored with a fold");
          redoW.click();
          eq(qa(document, "#workArea .tree-card").length, 0, "redo empties the area");
          undoW.click();
          eq(pairs().length, 1, "undo brings it back");
          var s2 = pairs()[0];
          s2.querySelector(".tree-split").click();
          undoW.click();
          return wait(2200).then(function () {
            eq(pairs().length, 1, "one pair");
            eq(halves(pairs()[0]).length, 2, "two panels");
            eq(qa(document, "#workArea .tree-card").length, 2, "no stray panel");
          });
        });
      });
    });

    add("E5 the x removes both panels, undo restores them aligned", function () {
      var p = makePair(72, 60);
      return joined(p).then(function () {
        p.querySelector(".tree-remove").click();
        eq(pairs().length, 0, "pair gone");
        eq(qa(document, "#workArea .tree-card").length, 0, "no panel left");
        undoW.click();
        var q = pairs()[0];
        ok(q, "pair back");
        alignedWithin(q, 1, "restored");
      });
    });

    add("E6 the pair is not draggable and takes no drop", function () {
      var p = makePair(72, 60);
      return joined(p).then(function () {
        addNumber(5);
        place(5);
        var h = halves(p), card = h[0];
        var base = { pointerId: 9, isPrimary: true, pointerType: "mouse", bubbles: true, cancelable: true, button: 0 };
        var c = centreOf(card);
        card.dispatchEvent(new PointerEvent("pointerdown", Object.assign({ clientX: rect(card).left + 3, clientY: c.y }, base)));
        window.dispatchEvent(new PointerEvent("pointermove", Object.assign({ clientX: c.x + 80, clientY: c.y + 40 }, base)));
        window.dispatchEvent(new PointerEvent("pointermove", Object.assign({ clientX: c.x + 200, clientY: c.y + 80 }, base)));
        eq(document.querySelectorAll(".drag-ghost").length, 0, "no ghost");
        ok(!document.body.classList.contains("is-dragging"), "not dragging");
        window.dispatchEvent(new PointerEvent("pointerup", Object.assign({ clientX: c.x + 200, clientY: c.y + 80 }, base)));
        var standalone = qa(document, "#workArea > .tree-card");
        eq(standalone.length, 1, "one standalone panel");
        eq(rootText(standalone[0]), "5", "it is the 5");
        dropOn(standalone[0], h[1], 0.75);
        eq(pairs().length, 1, "still one pair");
        eq(halves(pairs()[0]).map(rootText), ["72", "60"], "pair unchanged");
        eq(qa(document, "#workArea > .tree-card").map(rootText), ["5"], "the 5 stayed alone");
        // the page ignores palette clicks until the drag's own timeout has run
        return wait(50);
      });
    });

    add("E7 a language switch relabels without resetting the pair", function () {
      var p = makePair(72, 60);
      return joined(p).then(function () {
        var left = halves(p)[0];
        var six = qa(left, ".node-text").filter(function (t) { return t.textContent === "6"; })
          .sort(function (a, b) { return Number(a.getAttribute("x")) - Number(b.getAttribute("x")); })[0];
        fire(six.nextElementSibling, "click");
        return wait(1500).then(function () {
          var st = stateOf(p);
          var openBadge = badgesOf(left).filter(function (b) { return b.getAttribute("aria-expanded") === "true"; })[0];
          var n = openBadge.previousElementSibling.textContent;
          NT.i18n.setLang("nl");
          eq(p.querySelector(".tree-split").lastChild.textContent, NL.splitOverlap, "nl Separate text");
          eq(p.querySelector(".tree-remove").getAttribute("aria-label"), fmt(NL.removeOverlapLabel, { a: 72, b: 60 }), "nl x label");
          eq(p.querySelector(".tree-split").getAttribute("aria-label"), fmt(NL.splitOverlapLabel, { a: 72, b: 60 }), "nl Separate label");
          eq(openBadge.getAttribute("aria-label"), fmt(NL.foldLabel, { n: n }), "nl fold badge label");
          ok(pairs()[0] === p, "same pair element");
          ok(p.classList.contains("is-tinted"), "still tinted");
          alignedWithin(p, 1, "after the language switch");
          eq(stateOf(p), st, "folds and presses kept");
          NT.i18n.setLang("en");
          eq(p.querySelector(".tree-split").lastChild.textContent, EN.splitOverlap, "en Separate text");
        });
      });
    });

    add("E8 day theme colours", function () {
      var p = makePair(72, 60);
      return joined(p).then(function () {
        var prev = document.documentElement.getAttribute("data-theme");
        document.documentElement.setAttribute("data-theme", "day");
        return wait(400).then(function () {
          checkColours(p, "day");
          if (prev === null) document.documentElement.removeAttribute("data-theme");
          else document.documentElement.setAttribute("data-theme", prev);
        });
      });
    });

    add("E9 divides, coprime and equal shapes", function () {
      var p = makePair(6, 12);
      return joined(p).then(function () {
        alignedWithin(p, 1, "(6, 12)");
        lensMatches(p, 2, "(6, 12)");
        eq(eqLines(p), ["12 = 6 × 2", "gcd(6, 12) = 6"], "(6, 12) equation");
        var q = makePair(8, 15);
        return joined(q).then(function () {
          alignedWithin(q, 1, "(8, 15)");
          eq(halves(q).map(function (h) { return sharedCircle(h).nextElementSibling && qa(h, ".node-text").filter(function (t) {
            return t.getAttribute("x") === sharedCircle(h).getAttribute("cx") && t.getAttribute("y") === sharedCircle(h).getAttribute("cy");
          })[0].textContent; }), ["1", "1"], "the shared circles are the 1s");
          ok(eqLines(q).indexOf("gcd(8, 15) = 1") !== -1, "coprime equation");
          eq($("message").textContent, fmt(EN.msgCoprime, { a: 8, b: 15 }), "coprime message");
          var r = makePair(12, 12);
          return joined(r).then(function () {
            alignedWithin(r, 1, "(12, 12)");
            r.scrollIntoView({ block: "center" });
            [".tree-split", ".tree-remove"].forEach(function (sel) {
              var b = r.querySelector(sel), c = centreOf(b);
              var hit = document.elementFromPoint(c.x, c.y);
              ok(hit && hit.closest(sel) === b, sel + " is on top of the lens at full overlap");
            });
          });
        });
      });
    });

    return chain;
  }

  function linkRun() {
    var chain = Promise.resolve();
    function add(name, fn) { chain = chain.then(function () { return scenario(name, fn); }); }
    var before;

    add("L1 deep link builds a pair that is not an undo step", function () {
      eq(pairs().length, 1, "one pair");
      ok(undoW.disabled && redoW.disabled, "work undo and redo disabled");
      return wait(2500).then(function () {
        var p = pairs()[0];
        ok(p.classList.contains("is-tinted"), "tinted");
        ok(overlaps(p), "joined");
        alignedWithin(p, 1, "deep link");
        ok(undoW.disabled, "still not an undo step");
        before = halves(p).map(textsOf);
        eq(eqLines(p)[eqLines(p).length - 1], "gcd(12, 18) = 6", "equation");
      });
    });

    add("L2 Separate then Undo keeps the Balanced shape", function () {
      pairs()[0].querySelector(".tree-split").click();
      return wait(2200).then(function () {
        eq(pairs().length, 0, "no pair");
        eq(cards().map(rootText), ["12", "18"], "two standalone panels");
        undoW.click();
        var p = pairs()[0];
        ok(p, "pair restored");
        eq(halves(p).map(textsOf), before, "same shape");
        alignedWithin(p, 1, "restored");
      });
    });

    return chain;
  }

  var RUNNERS = { drag: dragRun, link: linkRun };

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
  var siteRoot = harness.mkScratch("moy-site-");
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
  var markup = '<pre id="moy-out"></pre>\n<script>\n' + probe + "\n</script>\n";
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
    "--virtual-time-budget=120000",
    "--window-size=1280,1100",
    "--dump-dom", pageUrl
  ];
  var res = cp.spawnSync("google-chrome", args, {
    encoding: "utf8", maxBuffer: 200 * 1024 * 1024, timeout: 240000, env: harness.chromeEnv()
  });
  return res.stdout || "";
}

function runPage(siteRoot, port, pageKey, str) {
  var p = PAGES[pageKey];
  var profileDir = harness.mkScratch("moy-profile-");
  var tag = "[" + pageKey + "] ";
  var name = writeProbePage(siteRoot, pageKey, str);
  var pageUrl = "http://127.0.0.1:" + port + "/" + encodeURIComponent(p.dir) + "/" + name + p.query;
  var dom = runChrome(profileDir, pageUrl);
  var pass = 0, fail = 0;
  var m = /<pre id="moy-out"([^>]*)>([\s\S]*?)<\/pre>/.exec(dom);
  if (!m) {
    console.log("FAIL " + tag + "probe output <pre id=\"moy-out\"> missing from the dumped DOM");
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
    console.log("MOY-PROBE FAIL (" + pass + " pass, " + fail + " fail, expected " + expected + " scenarios)");
    process.exit(1);
  }
  console.log("MOY-PROBE PASS (" + pass + " scenarios)");
  process.exit(0);
}

main();
