"use strict";
/*
 * SUPERSEDED by quick task 261005-kaz: this probe drives controls the palette rehaul removed; run palette-probe.js instead.
 * Dev-only regression probe for quick task 261005-j2e: every circle with
 * children shows a fold button once the Factor Tree has grown; folding a
 * sub-tree collapses it into its circle and re-spreads the visible tree,
 * unfolding grows it back. Never referenced by any page. Node built-ins +
 * the in-repo harness only.
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

var EXPECTED = 24;
var EXPECTED_NODE = 2;

var LANGS = ["nl", "en", "de", "fr", "es", "it", "pl", "pt-BR", "pt-PT", "sv", "nb", "ro", "hu", "lv", "ru", "el"];

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
  pass += nodeScenario("N1 fold-label-catalog", function () {
    var en = dicts.factorTree.en;
    LANGS.forEach(function (l) {
      var d = dicts.factorTree[l];
      ["foldLabel", "unfoldLabel"].forEach(function (k) {
        nodeAssert(typeof d[k] === "string" && d[k].length > 0, l + " " + k + " missing");
        nodeAssert(d[k].indexOf("{n}") >= 0, l + " " + k + " lacks {n}");
        if (l !== "en") nodeAssert(d[k] !== en[k], l + " " + k + " equals the English text");
      });
      nodeAssert(d.foldLabel !== d.unfoldLabel, l + " foldLabel equals unfoldLabel");
      if (l === "ru" || l === "el") {
        ["foldLabel", "unfoldLabel"].forEach(function (k) {
          var bare = d[k].replace(/\{n\}/g, "");
          nodeAssert(!/[A-Za-z]/.test(bare), l + " " + k + " has a Latin letter: " + d[k]);
          nodeAssert(l === "ru" ? /[Ѐ-ӿ]/.test(bare) : /[Ͱ-Ͽἀ-῿]/.test(bare),
            l + " " + k + " has no " + (l === "ru" ? "Cyrillic" : "Greek") + " letter");
        });
      }
    });
    return "16 languages carry translated foldLabel/unfoldLabel with {n}; ru/el in their own script";
  });
  pass += nodeScenario("N2 no-literal-colour", function () {
    var src = fs.readFileSync(path.join(ROOT, "Factor Tree", "factor-tree.html"), "utf8");
    var style = /<style>([\s\S]*?)<\/style>/.exec(src)[1];
    var hits = style.split("\n").filter(function (l) { return /fold/.test(l); });
    nodeAssert(hits.length > 0, "no style line mentions fold");
    var bad = /#[0-9a-fA-F]{3,8}\b|\b(?:rgb|rgba|hsl|hsla)\(|\b(?:red|green|blue|black|white|gray|grey|orange|yellow|purple|pink|brown|cyan|magenta|silver|gold|navy|teal)\b/;
    hits.forEach(function (l) { nodeAssert(!bad.test(l), "literal colour in: " + l.trim()); });
    return hits.length + " fold style lines, all colours via var()";
  });
  return pass;
}

/* ---------- in-page probe (serialised into the scratch page) ---------- */

function inPage(cfg) {
  var out = document.getElementById("j2e-out");
  var lines = [];
  var EPS = 0.01;

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
  var svg = function () { return document.querySelector(".tree-svg"); };
  var circles = function () { return arr(document.querySelectorAll(".node-circle")); };
  var badges = function () { return arr(document.querySelectorAll(".fold-badge")); };
  var axes = function () { return arr(document.querySelectorAll(".mirror-axis")); };
  var rings = function () { return arr(document.querySelectorAll(".fold-ring")); };
  var edgeEls = function () { return arr(document.querySelectorAll(".edge-line")); };
  var num = function (el, a) { return parseFloat(el.getAttribute(a)); };
  var shown = function (el) { return !!el && getComputedStyle(el).display !== "none"; };
  var equationText = function () { return document.getElementById("equation").textContent; };

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
  function geom() { return circles().map(function (c) { return [num(c, "cx"), num(c, "cy"), num(c, "r")]; }); }
  function sameGeom(a, b, label) {
    assert(a.length === b.length, label + ": circle count " + b.length + ", expected " + a.length);
    a.forEach(function (g, i) {
      [0, 1, 2].forEach(function (k) {
        assert(near(g[k], b[i][k]), label + ": circle " + i + " [" + k + "] is " + b[i][k] + ", expected " + g[k]);
      });
    });
  }
  function circleAtIn(list, x, y) {
    for (var i = 0; i < list.length; i++) {
      if (near(num(list[i], "cx"), x) && near(num(list[i], "cy"), y)) return i;
    }
    return -1;
  }
  function descendants(st, i, acc) {
    (st[i] || []).forEach(function (c) { acc.push(c); descendants(st, c, acc); });
    return acc;
  }
  function click(el) { el.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true })); }
  function key(el, init) {
    var e = new KeyboardEvent("keydown", Object.assign({ bubbles: true, cancelable: true }, init));
    return !el.dispatchEvent(e);
  }
  function reduced() {
    return !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }
  function mirroredAbout(oldPos, newPos, ref, indices) {
    indices.forEach(function (i) {
      var want = -(oldPos[i] - oldPos[ref]);
      var got = newPos[i] - newPos[ref];
      assert(near(got, want), "circle " + i + " offset " + got + " expected " + want);
    });
  }
  function xs(g) { return g.map(function (t) { return t[0]; }); }

  // baseline of the fully grown, nothing folded tree (recorded in F2)
  var base = null;
  var st = null;
  var baseEdges = null;
  var L0 = 0, R0 = 0, E0 = "";

  function indexOfLabel(kind, label) {
    var idx = -1;
    circles().forEach(function (c, i) { if (c.classList.contains(kind) && labelOf(c) === label) idx = i; });
    assert(idx >= 0, "no " + kind + " circle labelled " + label);
    return idx;
  }

  function collapsedInto(F, D) {
    var cs = circles();
    var fx = num(cs[F], "cx"), fy = num(cs[F], "cy");
    D.forEach(function (i) {
      var c = cs[i];
      assert(!shown(c), "circle " + i + " is still shown inside the folded circle");
      assert(num(c, "r") <= EPS, "circle " + i + " has r " + num(c, "r"));
      assert(near(num(c, "cx"), fx) && near(num(c, "cy"), fy), "circle " + i + " is at (" + num(c, "cx") + "," + num(c, "cy") + "), not the folded centre (" + fx + "," + fy + ")");
      assert(!shown(labelEl(c)), "label of circle " + i + " is still shown");
    });
    baseEdges.forEach(function (e) {
      if (D.indexOf(e.c) >= 0) assert(!shown(e.el), "an edge into collapsed circle " + e.c + " is still shown");
    });
    return true;
  }

  function visibleCoherent() {
    var cs = circles();
    var vis = cs.filter(shown);
    var width = num(svg(), "width");
    edgeEls().forEach(function (e) {
      if (!shown(e)) return;
      assert(circleAtIn(vis, num(e, "x1"), num(e, "y1")) >= 0, "a shown edge starts off every shown circle");
      assert(circleAtIn(vis, num(e, "x2"), num(e, "y2")) >= 0, "a shown edge ends off every shown circle");
    });
    cs.forEach(function (c, i) {
      if (!shown(c)) return;
      var out = baseEdges.filter(function (e) { return e.p === i && shown(e.el); });
      var cx = num(c, "cx");
      assert(cx >= -EPS && cx <= width + EPS, "circle " + i + " left the canvas: cx " + cx);
      if (c.classList.contains("is-folded")) {
        assert(out.length === 0, "folded circle " + i + " has " + out.length + " shown outgoing edges");
      } else if (c.classList.contains("root") || c.classList.contains("internal")) {
        assert(out.length === 2, "circle " + i + " has " + out.length + " shown outgoing edges");
        var mean = (num(cs[out[0].c], "cx") + num(cs[out[1].c], "cx")) / 2;
        assert(near(cx, mean), "circle " + i + " is not midway between its children");
      }
    });
    var slots = cs.filter(function (c) {
      return shown(c) && (c.classList.contains("is-folded") || c.classList.contains("prime-leaf") || c.classList.contains("one"));
    }).map(function (c) { return num(c, "cx"); }).sort(function (a, b) { return a - b; });
    if (slots.length === 1) {
      assert(near(slots[0], width / 2), "a single slot circle is at " + slots[0] + ", not " + width / 2);
    } else {
      assert(near(slots[0], L0) && near(slots[slots.length - 1], R0), "slot circles span " + slots[0] + ".." + slots[slots.length - 1] + ", expected " + L0 + ".." + R0);
      var step = (R0 - L0) / (slots.length - 1);
      slots.forEach(function (x, k) { assert(near(x, L0 + k * step), "slot " + k + " at " + x + ", expected " + (L0 + k * step)); });
    }
    return slots.length;
  }

  var steps = [];
  function step(name, fn) { steps.push({ name: name, fn: fn }); }

  step("F1 hidden-while-growing", function () {
    assert(badges().length === 0, "fold buttons exist before the tree has grown");
    assert(rings().length === 0, "fold rings exist before the tree has grown");
    return "no fold buttons or rings at load";
  });

  step("F2 armed", function () {
    return waitFor(function () { return badges().length > 0; }, 8000).then(function () {
      var cs = circles();
      var parents = cs.filter(function (c) { return c.classList.contains("root") || c.classList.contains("internal"); });
      assert(parents.length === 7, "expected 7 root/internal circles, got " + parents.length);
      assert(badges().length === parents.length, badges().length + " fold buttons for " + parents.length + " circles with children");
      parents.forEach(function (c) {
        var b = badgeOf(c);
        assert(b, "circle " + labelOf(c) + " has no fold button right after its label");
        var want = NT.i18n.translate("factorTree.foldLabel", { n: labelOf(c) });
        assert(b.getAttribute("role") === "button", "badge role is " + b.getAttribute("role"));
        assert(b.getAttribute("tabindex") === "0", "badge tabindex is " + b.getAttribute("tabindex"));
        assert(b.getAttribute("aria-expanded") === "true", "badge aria-expanded is " + b.getAttribute("aria-expanded"));
        assert(b.getAttribute("aria-label") === want, "badge aria-label is " + b.getAttribute("aria-label") + ", expected " + want);
        assert(b.querySelector("title").textContent === want, "badge title is " + b.querySelector("title").textContent);
        var disc = b.querySelector(".fold-badge-disc");
        assert(near(num(disc, "cx"), num(c, "cx")) && near(num(disc, "cy"), num(c, "cy") + num(c, "r")), "badge disc is not on the circle's lower edge");
        assert(!shown(b.querySelector(".fold-glyph-v")), "the vertical glyph is shown while expanded");
        assert(getComputedStyle(b).cursor === "pointer", "badge cursor is " + getComputedStyle(b).cursor);
        assert(!shown(ringOf(c)), "a ring is shown on an expanded circle");
      });
      arr(document.querySelectorAll(".node-circle.prime-leaf, .node-circle.one")).forEach(function (c) {
        assert(!badgeOf(c), "a leaf circle has a fold button");
      });
      assert(rings().every(function (r) { return !shown(r); }), "a ring is shown before any fold");

      base = geom();
      var stIdx = {};
      var els = edgeEls();
      baseEdges = els.map(function (e) {
        var p = circleAtIn(cs, num(e, "x1"), num(e, "y1"));
        var c = circleAtIn(cs, num(e, "x2"), num(e, "y2"));
        assert(p >= 0 && c >= 0, "an edge endpoint is not on a circle centre");
        (stIdx[p] = stIdx[p] || []).push(c);
        return { el: e, p: p, c: c };
      });
      st = stIdx;
      var leafX = cs.filter(function (c) { return c.classList.contains("prime-leaf") || c.classList.contains("one"); }).map(function (c) { return num(c, "cx"); });
      L0 = Math.min.apply(null, leafX);
      R0 = Math.max.apply(null, leafX);
      E0 = equationText();
      assert(E0.length > 0, "the equation is empty after growth");
      return parents.length + " labelled buttons, one per circle with children; leaves plain; baseline recorded";
    });
  });

  step("F3 fold-30", function () {
    var cs = circles();
    var N = indexOfLabel("internal", "30");
    var D = descendants(st, N, []);
    assert(D.length === 10, "expected 10 descendants of 30, got " + D.length);
    var root = cs[indexOfLabel("root", "60")];
    var b = badgeOf(cs[N]);
    var before = geom();
    click(b);
    if (!reduced()) {
      sameGeom(before, geom(), "immediately after the fold click");
      assert(shown(ringOf(cs[N])), "the ring is not shown immediately");
      assert(!shown(axisOf(cs[N])), "the axis is still shown immediately");
      assert(b.getAttribute("aria-expanded") === "false", "aria-expanded is " + b.getAttribute("aria-expanded"));
      assert(b.getAttribute("aria-label") === NT.i18n.translate("factorTree.unfoldLabel", { n: 30 }), "label is " + b.getAttribute("aria-label"));
      assert(shown(b.querySelector(".fold-glyph-v")), "the vertical glyph is not shown");
    }
    return sleep(700).then(function () {
      if (!reduced()) collapsedInto(N, D);
      return sleep(1300);
    }).then(function () {
      collapsedInto(N, D);
      var slots = visibleCoherent();
      assert(cs.filter(shown).length === 5, cs.filter(shown).length + " circles shown, expected 5");
      assert(slots === 3, slots + " slot circles, expected 3");
      assert(cs[N].classList.contains("is-folded"), "30 lacks is-folded");
      assert(!cs[N].classList.contains("mirrorable"), "30 is still mirrorable");
      assert(cs[N].getAttribute("tabindex") === "-1", "30 tabindex is " + cs[N].getAttribute("tabindex"));
      assert(cs[N].getAttribute("aria-disabled") === "true", "30 aria-disabled is " + cs[N].getAttribute("aria-disabled"));
      assert(cs[N].querySelector("title").textContent === "", "30 title is not empty");
      assert(cs[N].getAttribute("aria-pressed") === "false" && root.getAttribute("aria-pressed") === "false", "the badge mirrored a branch");
      assert(equationText() === E0, "the equation changed while folding");
      var folded = geom();
      click(cs[N]);
      return sleep(1500).then(function () {
        sameGeom(folded, geom(), "after clicking the folded circle");
        assert(cs[N].getAttribute("aria-pressed") === "false", "clicking the folded circle mirrored it");
        return "30 folded: 10 descendants collapsed into it, 5 circles re-spread over 3 slots, ring + disabled mirror";
      });
    });
  });

  step("F4 unfold-30", function () {
    var cs = circles();
    var N = indexOfLabel("internal", "30");
    var D = descendants(st, N, []);
    var b = badgeOf(cs[N]);
    var before = geom();
    click(b);
    if (!reduced()) {
      sameGeom(before, geom(), "immediately after the unfold click");
      assert(b.getAttribute("aria-label") === NT.i18n.translate("factorTree.foldLabel", { n: 30 }), "label is " + b.getAttribute("aria-label"));
      assert(b.getAttribute("aria-expanded") === "true", "aria-expanded is " + b.getAttribute("aria-expanded"));
      assert(!shown(b.querySelector(".fold-glyph-v")), "the vertical glyph is still shown");
      assert(!shown(ringOf(cs[N])), "the ring is still shown");
      assert(cs[N].classList.contains("mirrorable") && cs[N].getAttribute("tabindex") === "0", "30 is not mirrorable again");
      assert(!cs[N].hasAttribute("aria-disabled"), "30 still has aria-disabled");
      assert(cs[N].querySelector("title").textContent === NT.i18n.translate("factorTree.mirrorLabel", { n: 30 }), "30 title is " + cs[N].querySelector("title").textContent);
    }
    return sleep(300).then(function () {
      if (!reduced()) collapsedInto(N, D);
      return sleep(1700);
    }).then(function () {
      sameGeom(base, geom(), "after unfolding 30");
      assert(circles().every(shown), "a circle is hidden after unfolding");
      assert(baseEdges.every(function (e) { return shown(e.el); }), "an edge is hidden after unfolding");
      assert(axes().filter(shown).length === 7, axes().filter(shown).length + " axes shown, expected 7");
      visibleCoherent();
      assert(equationText() === E0, "the equation changed while unfolding");
      return "30 unfolded: exact baseline geometry, 7 axes, equation untouched";
    });
  });

  function clickBadge(i) { click(badgeOf(circles()[i])); }
  function pressed(i) { return circles()[i].getAttribute("aria-pressed"); }
  function allIdx() { return circles().map(function (_, i) { return i; }); }

  step("F5 nested-state", function () {
    var N = indexOfLabel("internal", "30");
    var M = indexOfLabel("internal", "15");
    var D30 = descendants(st, N, []);
    var D15 = descendants(st, M, []);
    assert(D15.length === 6, "expected 6 descendants of 15, got " + D15.length);
    var S1 = null;
    click(circles()[M]);
    return sleep(1500).then(function () {
      S1 = geom();
      assert(pressed(M) === "true", "15 aria-pressed is " + pressed(M));
      clickBadge(M);
      return sleep(2000);
    }).then(function () {
      clickBadge(N);
      return sleep(2000);
    }).then(function () {
      collapsedInto(N, D30);
      clickBadge(N);
      return sleep(2000);
    }).then(function () {
      var c15 = circles()[M];
      assert(shown(c15) && c15.classList.contains("is-folded"), "15 is not shown and folded after unfolding 30");
      assert(shown(ringOf(c15)), "15's ring is not shown");
      assert(badgeOf(c15).getAttribute("aria-expanded") === "false", "15's badge is not collapsed");
      collapsedInto(M, D15);
      visibleCoherent();
      clickBadge(M);
      return sleep(2000);
    }).then(function () {
      sameGeom(S1, geom(), "after unfolding 15");
      assert(pressed(M) === "true", "15 lost its mirrored state");
      click(circles()[M]);
      return sleep(1500);
    }).then(function () {
      sameGeom(base, geom(), "after un-mirroring 15");
      return "inner mirror and fold survive folding and unfolding 30; back to baseline";
    });
  });

  step("F6 fold-root", function () {
    var R = indexOfLabel("root", "60");
    var others = allIdx().filter(function (i) { return i !== R; });
    var width = num(svg(), "width");
    clickBadge(R);
    return sleep(2000).then(function () {
      var cs = circles();
      assert(cs.filter(shown).length === 1 && shown(cs[R]), cs.filter(shown).length + " circles shown, expected only the root");
      collapsedInto(R, others);
      assert(near(num(cs[R], "cx"), width / 2), "root cx is " + num(cs[R], "cx") + ", expected " + width / 2);
      assert(shown(ringOf(cs[R])), "the root ring is not shown");
      assert(!shown(axisOf(cs[R])), "the root axis is still shown");
      assert(cs[R].getAttribute("tabindex") === "-1", "root tabindex is " + cs[R].getAttribute("tabindex"));
      assert(equationText() === E0, "the equation changed");
      clickBadge(R);
      return sleep(2000);
    }).then(function () {
      sameGeom(base, geom(), "after unfolding the root");
      return "root folds to one centred circle with a ring and unfolds to the baseline";
    });
  });

  step("F7 mirror-ancestor-while-folded", function () {
    var R = indexOfLabel("root", "60");
    var M = indexOfLabel("internal", "15");
    var D15 = descendants(st, M, []);
    clickBadge(M);
    return sleep(2000).then(function () {
      click(circles()[R]);
      return sleep(1500);
    }).then(function () {
      visibleCoherent();
      assert(circles()[M].classList.contains("is-folded"), "15 lost is-folded");
      collapsedInto(M, D15);
      assert(pressed(R) === "true", "root aria-pressed is " + pressed(R));
      clickBadge(M);
      return sleep(2000);
    }).then(function () {
      mirroredAbout(xs(base), xs(geom()), R, allIdx());
      visibleCoherent();
      click(circles()[R]);
      return sleep(1500);
    }).then(function () {
      sameGeom(base, geom(), "after un-mirroring the root");
      return "mirroring an ancestor reflects the folded sub-tree too";
    });
  });

  step("F8 keyboard", function () {
    var N = indexOfLabel("internal", "30");
    var M = indexOfLabel("internal", "15");
    var R = indexOfLabel("root", "60");
    var D30 = descendants(st, N, []);
    var b = badgeOf(circles()[N]);
    b.focus();
    assert(document.activeElement === b, "the fold button did not take focus");
    assert(key(b, { key: "Enter" }), "Enter was not default-prevented");
    return sleep(2000).then(function () {
      collapsedInto(N, D30);
      assert(pressed(R) === "false" && pressed(N) === "false", "Enter on the badge mirrored a branch");
      var hiddenBadge = badgeOf(circles()[M]);
      hiddenBadge.focus();
      assert(document.activeElement !== hiddenBadge, "a hidden fold button took focus");
      b.focus();
      assert(key(b, { key: " " }), "Space was not default-prevented");
      return sleep(2000);
    }).then(function () {
      sameGeom(base, geom(), "after Space");
      assert(key(b, { key: "Enter", repeat: true }), "repeat Enter was not default-prevented");
      return sleep(2000);
    }).then(function () {
      sameGeom(base, geom(), "after repeat Enter");
      return "Enter folds, Space unfolds, auto-repeat does nothing, hidden buttons take no focus";
    });
  });

  step("F9 lang-keeps-folds", function () {
    var N = indexOfLabel("internal", "30");
    var R = indexOfLabel("root", "60");
    var enUnfold = NT.i18n.translate("factorTree.unfoldLabel", { n: 30 });
    clickBadge(N);
    var snap = null;
    return sleep(2000).then(function () {
      snap = geom();
      NT.i18n.setLang("ru");
      sameGeom(snap, geom(), "after switching to ru");
      var nb = badgeOf(circles()[N]);
      assert(nb.getAttribute("aria-expanded") === "false", "30 lost its folded state on language change");
      var want = NT.i18n.translate("factorTree.unfoldLabel", { n: 30 });
      assert(nb.getAttribute("aria-label") === want, "ru label is " + nb.getAttribute("aria-label") + ", expected " + want);
      assert(want !== enUnfold, "the unfold label did not change language");
      var rootWant = NT.i18n.translate("factorTree.foldLabel", { n: 60 });
      assert(badgeOf(circles()[R]).getAttribute("aria-label") === rootWant, "root badge label is " + badgeOf(circles()[R]).getAttribute("aria-label"));
      assert(circles()[N].querySelector("title").textContent === "", "30's mirror title is not empty while folded");
      var mirrorWant = NT.i18n.translate("factorTree.mirrorLabel", { n: 60 });
      assert(circles()[R].querySelector("title").textContent === mirrorWant, "root mirror title is " + circles()[R].querySelector("title").textContent);
      NT.i18n.setLang("en");
      clickBadge(N);
      return sleep(2000);
    }).then(function () {
      sameGeom(base, geom(), "after unfolding in en");
      return "folds survive a language change and are re-labelled";
    });
  });

  step("F10 rapid-toggle", function () {
    var N = indexOfLabel("internal", "30");
    clickBadge(N);
    clickBadge(N);
    return sleep(2500).then(function () {
      sameGeom(base, geom(), "after two rapid toggles");
      assert(circles().every(shown), "a circle is hidden after a double toggle");
      assert(badgeOf(circles()[N]).getAttribute("aria-expanded") === "true", "30 is still folded");
      visibleCoherent();
      return "double toggle ends unfolded at the baseline";
    });
  });

  step("F11 fresh-tree", function () {
    var N = indexOfLabel("internal", "30");
    clickBadge(N);
    click(document.querySelector('.chip[data-n="60"]'));
    return waitFor(function () { return badges().length === 7; }, 8000).then(function () {
      badges().forEach(function (b) { assert(b.getAttribute("aria-expanded") === "true", "a fold button is collapsed on a fresh tree"); });
      assert(rings().every(function (r) { return !shown(r); }), "a ring is shown on a fresh tree");
      assert(circles().every(shown), "a circle is hidden on a fresh tree");
      sameGeom(base, geom(), "fresh 60 tree");
      clickBadge(indexOfLabel("root", "60"));
      click(document.getElementById("randomBtn"));
      return waitFor(function () { return badges().length > 0; }, 8000);
    }).then(function () {
      badges().forEach(function (b) { assert(b.getAttribute("aria-expanded") === "true", "a fold button is collapsed after Randomize"); });
      assert(rings().every(function (r) { return !shown(r); }), "a ring is shown after Randomize");
      assert(circles().every(shown), "a circle is hidden after Randomize");
      assert(labelOf(document.querySelector(".node-circle.root")) !== "60", "Randomize kept 60");
      return "a chip and Randomize both build fresh, fully unfolded trees";
    });
  });

  var chain = Promise.resolve();
  window.addEventListener("load", function () {
    // F1 must observe the page before growth completes, so run it synchronously
    // here (this listener runs after the page's own load handler).
    var first = steps[0];
    try { emit("PASS " + first.name + ": " + first.fn()); }
    catch (e) { emit("FAIL " + first.name + ": " + (e && e.message ? e.message : e)); }
    steps.slice(1).forEach(function (s) {
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
  var siteRoot = harness.mkScratch("j2e-site-");
  fs.cpSync(path.join(ROOT, "assets"), path.join(siteRoot, "assets"), { recursive: true });
  var src = fs.readFileSync(path.join(ROOT, "Factor Tree", "factor-tree.html"), "utf8");
  var probe = "(" + inPage.toString() + ")(" + JSON.stringify({}) + ");";
  var markup = '<pre id="j2e-out"></pre>\n<script>\n' + probe + "\n</script>\n";
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
  var profileDir = harness.mkScratch("j2e-profile-");
  var args = [
    "--headless=new", "--disable-gpu", "--no-sandbox",
    "--user-data-dir=" + profileDir,
    "--virtual-time-budget=120000",
    "--window-size=1280,900"
  ].concat(extraArgs || [], ["--dump-dom", fileUrl]);
  var res = cp.spawnSync("google-chrome", args, {
    encoding: "utf8", maxBuffer: 200 * 1024 * 1024, timeout: 180000, env: harness.chromeEnv()
  });
  try { fs.rmSync(profileDir, { recursive: true, force: true }); } catch (e) { /* best effort */ }
  return res.stdout || "";
}

function runPage(page, extraArgs, tag) {
  var dom = runChrome(url.pathToFileURL(page).href + "?lang=en", extraArgs);
  var m = /<pre id="j2e-out"[^>]*>([\s\S]*?)<\/pre>/.exec(dom);
  if (!m) {
    console.log("FAIL " + tag + ": probe output <pre id=\"j2e-out\"> missing from the dumped DOM");
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
  r = runPage(page, ["--force-prefers-reduced-motion"], "[reduced] ");
  pass += r.pass;
  fail += r.fail;
  if (fail > 0 || pass !== EXPECTED) {
    console.log("J2E-PROBE FAIL (" + pass + " pass, " + fail + " fail, expected " + EXPECTED + " scenarios)");
    process.exit(1);
  }
  console.log("J2E-PROBE PASS (" + pass + " scenarios)");
  process.exit(0);
}

main();
