/* checks/svg.check.js — parity checks for NT.svg against every pre-phase
 * per-tool predecessor. Exports function(ctx) per harness.js's contract.
 */
"use strict";

var EXPECTED_KEYS = ["SVG_NS", "annularSectorPath", "easeInOutCubic", "polar", "svgEl"];

function svgSnapshot(el) {
  return {
    ns: el.ns,
    tag: el.tag,
    attrs: Object.keys(el.attrs).map(function (k) { return [k, el.attrs[k]]; })
  };
}

var ATTR_MAPS = [
  { tag: "rect", attrs: {} },
  { tag: "circle", attrs: { cx: 1, cy: 2.5, r: "x", "class": "a b" } },
  { tag: "path", attrs: { d: "M0 0 L10 10", "text-anchor": "middle", "font-size": 12 } }
];

module.exports = function (ctx) {
  var newDoc = ctx.makeDom();
  var NT = ctx.loadNew({ globals: { document: newDoc } });
  var svg = NT.svg;

  ctx.eq("svg key-set", Object.keys(svg).sort(), EXPECTED_KEYS.slice().sort());
  ctx.eq("svg frozen", Object.isFrozen(svg), true);
  ctx.eq("svg SVG_NS", svg.SVG_NS, "http://www.w3.org/2000/svg");

  /* ---------- svgEl parity ---------- */

  var SVG_NS_PREAMBLE = "var SVG_NS = 'http://www.w3.org/2000/svg';";

  var svgElTargets = [
    { label: "FactorTree", file: "Factor Tree/factor-tree.html", preamble: SVG_NS_PREAMBLE },
    { label: "ECDH", file: "Elliptic Curve Diffie-Hellman/elliptic-curve-diffie-hellman.html", preamble: SVG_NS_PREAMBLE },
    { label: "Euclid", file: "Euclidean Algorithm/euclidean-algorithm.html", preamble: SVG_NS_PREAMBLE },
    { label: "DH", file: "Diffie-Hellman Key Exchange/diffie-hellman-key-exchange.html", preamble: SVG_NS_PREAMBLE },
    { label: "Fermats", file: "Fermats Method/fermats-method.html", preamble: SVG_NS_PREAMBLE },
    { label: "Shors", file: "Shors Algorithm/shors-algorithm.html", preamble: SVG_NS_PREAMBLE },
    { label: "SquareMultiply", file: "Square And Multiply/square-and-multiply.html", preamble: SVG_NS_PREAMBLE },
    { label: "EqWheel", file: "Equivalence Wheel/equivalence-wheel.html", preamble: null },
    { label: "GroupIso", file: "Group Isomorphism/group-isomorphism.html", preamble: null },
    { label: "Venn", file: "Venn Diagram/venn-diagram.html", preamble: null }
  ];

  svgElTargets.forEach(function (target) {
    var oldDoc = ctx.makeDom();
    var opts = { globals: { document: oldDoc } };
    if (target.preamble) opts.preamble = target.preamble;
    var old = ctx.loadOld(target.file, ["svgEl"], opts);
    ATTR_MAPS.forEach(function (am) {
      var newEl = svg.svgEl(am.tag, am.attrs);
      var oldEl = old.svgEl(am.tag, am.attrs);
      ctx.eq("svgEl(" + am.tag + ") vs " + target.label, svgSnapshot(newEl), svgSnapshot(oldEl));
    });
  });

  /* ---------- polar parity ---------- */

  var rValues = [0, 55, 65, 180.5, 400];
  var angles = [];
  for (var deg = -720; deg <= 720; deg += 7.5) angles.push(deg);

  var oldEqWheelPolar = ctx.loadOld("Equivalence Wheel/equivalence-wheel.html", ["polar"], { preamble: "var CX = 450, CY = 450;" });
  var oldGroupIsoPolar = ctx.loadOld("Group Isomorphism/group-isomorphism.html", ["polar"], { preamble: "var CX = 260, CY = 260;" });
  var oldShorsPolar = ctx.loadOld("Shors Algorithm/shors-algorithm.html", ["polarPoint"]);

  // Shor's polarPoint already takes cx, cy as explicit leading parameters,
  // so exercise it (and the new NT.svg.polar) across several centres, not
  // just one, to prove the rename is a true drop-in across the whole
  // parameter space rather than one coincidental centre.
  var shorsCentres = [[37, 91], [0, 0], [450, 260]];

  rValues.forEach(function (r) {
    angles.forEach(function (d) {
      ctx.eq("polar(450,450," + r + "," + d + ") vs EqWheel", svg.polar(450, 450, r, d), oldEqWheelPolar.polar(r, d));
      ctx.eq("polar(260,260," + r + "," + d + ") vs GroupIso", svg.polar(260, 260, r, d), oldGroupIsoPolar.polar(r, d));
      shorsCentres.forEach(function (c) {
        ctx.eq("polar(" + c[0] + "," + c[1] + "," + r + "," + d + ") vs Shors polarPoint",
          svg.polar(c[0], c[1], r, d), oldShorsPolar.polarPoint(c[0], c[1], r, d));
      });
    });
  });

  /* ---------- annularSectorPath parity ---------- */

  var riroPairs = [[55, 400], [65, 230], [0, 100]];
  var spans = [0, 7.5, 90, 179.9, 180, 180.1, 270, 359.998, 359.999, 360, 370];
  var starts = [
    0, 9, 18, 27, 36, 45, 54, 63, 72, 81, 90, 99, 108, 117, 126, 135, 144,
    153, 162, 171, 180, 198, 216, 234, 252, 270, 288, 306, 324, 342, 351,
    -30, -90, -180
  ];

  var oldEqWheelSector = ctx.loadOld("Equivalence Wheel/equivalence-wheel.html", ["polar", "annularSectorPath"], { preamble: "var CX = 450, CY = 450;" });
  var oldGroupIsoSector = ctx.loadOld("Group Isomorphism/group-isomorphism.html", ["polar", "annularSectorPath"], { preamble: "var CX = 260, CY = 260;" });

  riroPairs.forEach(function (pair) {
    var ri = pair[0], ro = pair[1];
    starts.forEach(function (s) {
      spans.forEach(function (span) {
        var e = s + span;
        ctx.eq("annularSectorPath(450,450," + ri + "," + ro + "," + s + "," + e + ") vs EqWheel",
          svg.annularSectorPath(450, 450, ri, ro, s, e), oldEqWheelSector.annularSectorPath(ri, ro, s, e));
        ctx.eq("annularSectorPath(260,260," + ri + "," + ro + "," + s + "," + e + ") vs GroupIso",
          svg.annularSectorPath(260, 260, ri, ro, s, e), oldGroupIsoSector.annularSectorPath(ri, ro, s, e));
      });
    });
  });

  /* ---------- easeInOutCubic parity ---------- */

  var oldDhEase = ctx.loadOld("Diffie-Hellman Key Exchange/diffie-hellman-key-exchange.html", ["easeInOutCubic"]);
  var oldFermatsEase = ctx.loadOld("Fermats Method/fermats-method.html", ["easeInOutCubic"]);

  var tValues = [-0.1];
  for (var t = 0; t <= 1 + 1e-9; t += 0.0005) tValues.push(Math.round(t * 1e6) / 1e6);
  tValues.push(1.1);

  tValues.forEach(function (tv) {
    ctx.eq("easeInOutCubic(" + tv + ") vs DH", svg.easeInOutCubic(tv), oldDhEase.easeInOutCubic(tv));
    ctx.eq("easeInOutCubic(" + tv + ") vs Fermats", svg.easeInOutCubic(tv), oldFermatsEase.easeInOutCubic(tv));
  });
};
