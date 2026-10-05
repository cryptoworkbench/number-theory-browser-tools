/* checks/layout.check.js — parity checks for NT.layout against every
 * pre-phase per-tool predecessor: the Euclidean Algorithm's nested-squares
 * layout (also ported into Venn Diagram's miniature) and Factor Tree's
 * Classic/Balanced recursive tree builder (also ported into Venn Diagram's
 * Balanced miniature). Exports function(ctx) per harness.js's contract.
 */
"use strict";

var vm = require("vm");
var fs = require("fs");
var path = require("path");

var EXPECTED_KEYS = [
  "assignOverlapX", "assignTreeX", "BALANCED_MAX_N", "buildFactorTree",
  "buildOverlapTree", "computeNestedLayout", "flattenOverlap", "flattenTree",
  "TILE_CAP"
];

var EA_PATH = "Euclidean Algorithm/euclidean-algorithm.html";
var VENN_PATH = "Venn Diagram/venn-diagram.html";
var FT_PATH = "Factor Tree/factor-tree.html";

/* ---------- tree comparison helpers ---------- */

function stripTree(node) {
  return {
    value: node.value,
    kind: node.kind,
    depth: node.depth,
    children: node.children.map(stripTree)
  };
}

function annotatedTree(node) {
  return {
    value: node.value,
    kind: node.kind,
    depth: node.depth,
    x: node.x,
    children: node.children.map(annotatedTree)
  };
}

function nodeSeq(nodes) {
  return nodes.map(function (n) { return { value: n.value, kind: n.kind, depth: n.depth, x: n.x }; });
}

function edgeSeq(edges) {
  return edges.map(function (e) {
    return {
      from: { value: e.from.value, depth: e.from.depth },
      to: { value: e.to.value, depth: e.to.depth }
    };
  });
}

// Full comparison: raw tree shape, then assignTreeX/flattenTree run on both
// sides (mutating each tree in place), then the annotated tree (with x),
// the flattened node sequence, the edge list and the max depth.
function compareTreeFull(ctx, label, treeA, assignA, flattenA, treeB, assignB, flattenB) {
  ctx.eq(label + " tree", stripTree(treeA), stripTree(treeB));

  var counterA = { value: 0 };
  assignA(treeA, counterA);
  var nodesA = [], edgesA = [], maxDepthA = { value: 0 };
  flattenA(treeA, null, nodesA, edgesA, maxDepthA);

  var counterB = { value: 0 };
  assignB(treeB, counterB);
  var nodesB = [], edgesB = [], maxDepthB = { value: 0 };
  flattenB(treeB, null, nodesB, edgesB, maxDepthB);

  ctx.eq(label + " annotated tree", annotatedTree(treeA), annotatedTree(treeB));
  ctx.eq(label + " node sequence", nodeSeq(nodesA), nodeSeq(nodesB));
  ctx.eq(label + " edges", edgeSeq(edgesA), edgeSeq(edgesB));
  ctx.eq(label + " maxDepth", maxDepthA.value, maxDepthB.value);
}

module.exports = function (ctx) {
  var NT = ctx.loadNew({});
  var layout = NT.layout;

  /* ---------- shape ---------- */

  ctx.eq("layout key-set", Object.keys(layout).sort(), EXPECTED_KEYS.slice().sort());
  ctx.eq("layout frozen", Object.isFrozen(layout), true);

  /* ---------- load-time guard ---------- */

  var layoutSrc = fs.readFileSync(path.join(ctx.ROOT, "assets", "nt-layout.js"), "utf8");
  var guardCtx = {};
  guardCtx.window = guardCtx;
  vm.createContext(guardCtx);
  var threw = false, errMsg = "";
  try {
    vm.runInContext(layoutSrc, guardCtx, { filename: "nt-layout.js (no NT.core)" });
  } catch (e) {
    threw = true;
    errMsg = e && e.message || "";
  }
  ctx.eq("nt-layout.js load guard throws without NT.core", threw, true);
  ctx.eq("nt-layout.js load guard message names nt-core.js", /nt-core\.js/.test(errMsg), true);

  /* ---------- literal parity: TILE_CAP / BALANCED_MAX_N ---------- */

  var eaSrc = ctx.gitShow(EA_PATH);
  var vennSrc = ctx.gitShow(VENN_PATH);
  var ftSrc = ctx.gitShow(FT_PATH);

  var eaTileCapLiteral = Number(/TILE_CAP\s*=\s*(\d+)/.exec(eaSrc)[1]);
  var vennNestCapLiteral = Number(/NEST_TILE_CAP\s*=\s*(\d+)/.exec(vennSrc)[1]);
  var ftMaxNLiteral = Number(/MAX_BALANCED_N\s*=\s*(\d+)/.exec(ftSrc)[1]);
  var vennFtMaxNLiteral = Number(/FT_MAX_N\s*=\s*(\d+)/.exec(vennSrc)[1]);

  ctx.eq("TILE_CAP vs EA literal", layout.TILE_CAP, eaTileCapLiteral);
  ctx.eq("TILE_CAP vs Venn NEST_TILE_CAP literal", layout.TILE_CAP, vennNestCapLiteral);
  ctx.eq("BALANCED_MAX_N vs Factor Tree MAX_BALANCED_N literal", layout.BALANCED_MAX_N, ftMaxNLiteral);
  ctx.eq("BALANCED_MAX_N vs Venn FT_MAX_N literal", layout.BALANCED_MAX_N, vennFtMaxNLiteral);

  /* ---------- computeNestedLayout parity ---------- */

  var oldEaNest40 = ctx.loadOld(EA_PATH, ["computeNestedLayout"], { preamble: "var TILE_CAP = 40;" });
  var oldVennNest40 = ctx.loadOld(VENN_PATH, ["computeNestedLayout"], { preamble: "var NEST_TILE_CAP = 40;" });
  var oldEaNest3 = ctx.loadOld(EA_PATH, ["computeNestedLayout"], { preamble: "var TILE_CAP = 3;" });

  // null/empty inputs
  ctx.eq("computeNestedLayout(null) new", layout.computeNestedLayout(null), null);
  ctx.eq("computeNestedLayout(null) vs EA", layout.computeNestedLayout(null), oldEaNest40.computeNestedLayout(null));
  ctx.eq("computeNestedLayout([]) new", layout.computeNestedLayout([]), null);
  ctx.eq("computeNestedLayout([]) vs Venn", layout.computeNestedLayout([]), oldVennNest40.computeNestedLayout([]));

  var euclidPairs = [];
  for (var a = 1; a <= 70; a++) {
    for (var b = 1; b <= 70; b++) euclidPairs.push([a, b]);
  }
  euclidPairs.push([1000000, 3], [500000, 2], [89, 55], [1000000, 999999]);

  euclidPairs.forEach(function (pair) {
    var steps = NT.core.euclidSteps(pair[0], pair[1]).steps;
    var got40 = layout.computeNestedLayout(steps);
    ctx.eq("computeNestedLayout(" + pair[0] + "," + pair[1] + ") vs EA (cap 40)", got40, oldEaNest40.computeNestedLayout(steps));
    ctx.eq("computeNestedLayout(" + pair[0] + "," + pair[1] + ") vs Venn (cap 40)", got40, oldVennNest40.computeNestedLayout(steps));
    var got3 = layout.computeNestedLayout(steps, 3);
    ctx.eq("computeNestedLayout(" + pair[0] + "," + pair[1] + ",3) vs EA (cap 3)", got3, oldEaNest3.computeNestedLayout(steps));
  });

  /* ---------- factor tree parity ---------- */

  var ftFns = ctx.loadOld(
    FT_PATH,
    ["isPrime", "isqrt", "isPerfectSquare", "fermatSplit", "smallestPrimeFactor", "buildTree", "assignX", "flatten"],
    { preamble: "var mode = 'classic';\nvar FERMAT_MAX_ITER = 2000000;" }
  );
  var vennFns = ctx.loadOld(
    VENN_PATH,
    ["isPrime", "isqrt", "isPerfectSquare", "fermatSplit", "smallestFactorOf", "buildBalancedTree", "assignTreeX", "flattenTree"],
    { preamble: "var FT_MAX_ITER = 2000000;" }
  );

  var classicChips = [2, 97, 60, 1024, 9973, 2310];
  var balancedChips = [899, 9991, 1024, 29919, 9973];
  var classicOnlyBig = [999999, 994009, 1000000, 999983, 4294967296];

  var classicVals = [];
  for (var v = 1; v <= 2500; v++) classicVals.push(v);
  classicVals = classicVals.concat(classicChips, classicOnlyBig);

  ftFns.context.mode = 'classic';
  classicVals.forEach(function (val) {
    var newTree = layout.buildFactorTree(val, { balanced: false });
    var oldTree = ftFns.buildTree(val, 0);
    compareTreeFull(ctx, "classic buildFactorTree(" + val + ") vs FactorTree",
      newTree, layout.assignTreeX, layout.flattenTree, oldTree, ftFns.assignX, ftFns.flatten);
  });

  var balancedVals = [];
  for (var v2 = 1; v2 <= 2500; v2++) balancedVals.push(v2);
  balancedVals = balancedVals.concat(balancedChips);

  ftFns.context.mode = 'balanced';
  balancedVals.forEach(function (val) {
    var newTree = layout.buildFactorTree(val, { balanced: true });
    var oldFtTree = ftFns.buildTree(val, 0);
    compareTreeFull(ctx, "balanced buildFactorTree(" + val + ") vs FactorTree",
      newTree, layout.assignTreeX, layout.flattenTree, oldFtTree, ftFns.assignX, ftFns.flatten);

    var newTree2 = layout.buildFactorTree(val, { balanced: true });
    var oldVennTree = vennFns.buildBalancedTree(val, 0);
    compareTreeFull(ctx, "balanced buildFactorTree(" + val + ") vs Venn",
      newTree2, layout.assignTreeX, layout.flattenTree, oldVennTree, vennFns.assignTreeX, vennFns.flattenTree);
  });

  /* ---------- balanced fallback path: maxIter 3 vs Venn only ---------- */
  // Factor Tree's own buildTree has no defensive fallback when fermatSplit
  // returns null (it would throw), so the low-cap fallback path is only
  // comparable against Venn's defensive builder, per the plan.

  vennFns.context.FT_MAX_ITER = 3;
  var oddComposites = [];
  for (var oc = 9; oc <= 2501; oc += 2) {
    if (!NT.core.isPrime(oc)) oddComposites.push(oc);
  }
  oddComposites.forEach(function (val) {
    var newTree = layout.buildFactorTree(val, { balanced: true, maxIter: 3 });
    var oldTree = vennFns.buildBalancedTree(val, 0);
    compareTreeFull(ctx, "balanced buildFactorTree(" + val + ",maxIter=3) vs Venn (cap 3)",
      newTree, layout.assignTreeX, layout.flattenTree, oldTree, vennFns.assignTreeX, vennFns.flattenTree);
  });
};
