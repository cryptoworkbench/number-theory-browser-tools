/* NT.layout — shared diagram layouts: Euclidean nested squares and
   recursive factor trees.

   This file centralizes the two layout algorithms that used to be
   duplicated per-tool: the Euclidean Algorithm's rectangle-tiling "nested
   squares" geometry (computeNestedLayout), and the classic-school /
   Fermat's-Method-balanced recursive factor tree (buildFactorTree,
   assignTreeX, flattenTree), plus the gcd overlap of two such trees
   (buildOverlapTree, assignOverlapX, flattenOverlap). These layouts are what the full Euclidean
   Algorithm and Factor Tree tools draw AND what Venn Diagram's hover
   miniatures draw, so previews and tools always agree on the geometry —
   nodes/rects are unit-space data only; scaling to pixels and drawing the
   actual SVG stays in each page.

   Classic script, IIFE, "use strict" — no build step, no bundler. It must
   be included as a plain, non-deferred <script src> (no defer, no async,
   no type="module") so it executes synchronously before a tool's own
   inline <script> runs, and so pages keep working when opened directly
   over file://, where ES module imports are blocked by CORS.

   Dependency: this is the one shared module with a load-time dependency —
   it calls NT.core.isPrime, NT.core.smallestPrimeFactor, NT.core.fermatSplit,
   NT.core.gcd and reads NT.core.FERMAT_MAX_ITER, captured once at load time. A page
   that includes nt-layout.js MUST include nt-core.js first, or this file
   throws a descriptive Error immediately.

   Include convention: place
     <script src="../assets/nt-core.js"></script>
     ...
     <script src="../assets/nt-layout.js"></script>
   on their own lines, in the canonical order core, bigint, svg, store,
   layout, immediately before a tool's own inline <script> block at the
   end of <body>.

   Consumers (Phase 7, plan 07-06): Euclidean Algorithm, Factor Tree. Plan
   07-07 adds Venn Diagram's hover-miniature consumers of the same layouts.

   NT.layout is frozen, and its slot on NT is read-only, after construction —
   a tool must never assign to NT or to any of its members (shadow-check.js's
   NS-MUTATION gate enforces this).
*/
(function () {
  "use strict";

  var NT = window.NT = window.NT || {};

  if (!NT.core) {
    throw new Error('assets/nt-layout.js needs assets/nt-core.js loaded before it');
  }

  var coreIsPrime = NT.core.isPrime;
  var coreSmallestPrimeFactor = NT.core.smallestPrimeFactor;
  var coreFermatSplit = NT.core.fermatSplit;
  var coreFermatMaxIter = NT.core.FERMAT_MAX_ITER;
  var coreGcd = NT.core.gcd;

  /* ---------- Euclidean nested-squares layout ---------- */

  // Cap on drawn squares per step (GCD-05 / D-01). The rectangle-tiling
  // metaphor's natural node count is the quotient, which is unbounded
  // independent of step count -- gcd(500000, 2) has a first-step quotient
  // of 250000. Capping at 40 keeps every step's diagram at a bounded
  // node count, so a huge quotient renders instantly instead of freezing
  // the tab, regardless of input size.
  var TILE_CAP = 40;

  // computeNestedLayout(steps, tileCap): builds the unit-space layout (no
  // pixel scale yet) by walking the step list one at a time, recursing
  // into each step's leftover so the whole derivation nests into one
  // rectangle. tileCap defaults to TILE_CAP when omitted -- the Euclidean
  // Algorithm and Venn Diagram bodies this is ported from both hard-coded
  // their own module-scoped cap constant; here it is an explicit parameter
  // so Phase 4's continued-fraction tiling can reuse or extend this
  // function without changing existing callers.
  function computeNestedLayout(steps, tileCap) {
    if (tileCap === undefined) tileCap = TILE_CAP;
    if (!steps || steps.length === 0) return null;
    var rects = [];
    var cappedSteps = [];

    function place(i, x, y, w, h, vertical) {
      var step = steps[i];
      var b = step.b, q = step.q, r = step.r;
      var drawn = Math.min(q, tileCap);
      var capped = q > tileCap;
      if (capped) cappedSteps.push(i);
      var k, pos, used;
      if (!vertical) {
        pos = x;
        for (k = 0; k < drawn; k++) {
          rects.push({ type: 'square', x: pos, y: y, w: b, h: b, step: i, first: k === 0 });
          pos += b;
        }
        if (capped) {
          rects.push({ type: 'cap', x: pos, y: y, w: b, h: b, step: i, extra: q - drawn });
          pos += b;
        }
        used = pos - x;
        if (r > 0) used += place(i + 1, pos, y, r, h, true).w;
        return { w: used, h: h };
      } else {
        pos = y;
        for (k = 0; k < drawn; k++) {
          rects.push({ type: 'square', x: x, y: pos, w: b, h: b, step: i, first: k === 0 });
          pos += b;
        }
        if (capped) {
          rects.push({ type: 'cap', x: x, y: pos, w: b, h: b, step: i, extra: q - drawn });
          pos += b;
        }
        used = pos - y;
        if (r > 0) used += place(i + 1, x, pos, w, r, false).h;
        return { w: w, h: used };
      }
    }

    var top = place(0, 0, 0, steps[0].a, steps[0].b, false);
    return { rects: rects, width: top.w, height: top.h, cappedSteps: cappedSteps };
  }

  /* ---------- recursive factor tree (Classic + Balanced) ---------- */

  // The balanced tree's supported range. Both Factor Tree's Balanced input
  // ceiling and Venn's preview range read this single constant.
  var BALANCED_MAX_N = 1000000;

  // buildFactorTree(v, options): options.balanced (default false),
  // options.maxIter (default NT.core.FERMAT_MAX_ITER), options.depth (the
  // depth of the returned node, default 0 -- a tree started below the top
  // has no 'root' kind anywhere). Reproduces Factor
  // Tree's buildTree exactly: value 1 gives a 'one' leaf; a prime gives a
  // node whose children are a 'one' leaf and a 'prime-leaf' of the same
  // value; kind is 'root' at depth 0, else 'internal'. In balanced mode an
  // even v splits into 2 and v/2, and an odd composite splits via
  // fermatSplit(v, maxIter), falling back to smallestPrimeFactor(v) and
  // v / that factor when fermatSplit returns null (Venn's defensive guard
  // -- unreachable for v <= BALANCED_MAX_N at the default cap, so Factor
  // Tree's own output is unchanged by this fallback existing). In classic
  // mode, split at smallestPrimeFactor.
  function buildFactorTree(v, options) {
    options = options || {};
    var balanced = !!options.balanced;
    var maxIter = options.maxIter === undefined ? coreFermatMaxIter : options.maxIter;

    function node(val, depth) {
      if (val === 1) {
        return { value: 1, kind: 'one', children: [], depth: depth };
      }
      if (coreIsPrime(val)) {
        return {
          value: val,
          kind: depth === 0 ? 'root' : 'internal',
          children: [
            { value: 1, kind: 'one', children: [], depth: depth + 1 },
            { value: val, kind: 'prime-leaf', children: [], depth: depth + 1 }
          ],
          depth: depth
        };
      }
      if (balanced) {
        if (val % 2 === 0) {
          return {
            value: val,
            kind: depth === 0 ? 'root' : 'internal',
            children: [ node(2, depth + 1), node(val / 2, depth + 1) ],
            depth: depth
          };
        }
        var split = coreFermatSplit(val, maxIter); // val is odd and composite here
        var p, q;
        if (split) {
          p = split.p; q = split.q;
        } else {
          // Defensive guard so a hover handler can never throw: fall back
          // to a smallest-factor split if fermatSplit's iteration cap is
          // ever hit. Unreachable for v <= BALANCED_MAX_N at the default
          // maxIter -- ported from Venn Diagram's identical guard.
          p = coreSmallestPrimeFactor(val);
          q = val / p;
        }
        return {
          value: val,
          kind: depth === 0 ? 'root' : 'internal',
          children: [ node(p, depth + 1), node(q, depth + 1) ],
          depth: depth
        };
      }
      var d = coreSmallestPrimeFactor(val);
      var cofactor = val / d;
      return {
        value: val,
        kind: depth === 0 ? 'root' : 'internal',
        children: [ node(d, depth + 1), node(cofactor, depth + 1) ],
        depth: depth
      };
    }

    return node(v, options.depth || 0);
  }

  // buildOverlapTree(a, b, options): the trees of a and b overlapped on
  // g = gcd(a, b). Each number with x !== g is a root whose two children
  // are the tree of x/g and the one shared tree of g (marked shared: true):
  // a's rest on the left of g, b's rest on the right, so the shared branch
  // sits between them. A number equal to g has no root of its own -- its
  // top is the shared tree itself; when a === b the shared tree is the
  // only tree and starts at depth 0. options as for buildFactorTree.
  // Returns { g, G, a: side, b: side }, side = { root, rest, top }.
  function buildOverlapTree(a, b, options) {
    options = options || {};
    var sub = function (v, depth) {
      return buildFactorTree(v, { balanced: options.balanced, maxIter: options.maxIter, depth: depth });
    };
    var g = coreGcd(a, b);
    var G = sub(g, a === g && b === g ? 0 : 1);
    G.shared = true;
    function side(x, restFirst) {
      if (x === g) return { root: null, rest: null, top: G };
      var rest = sub(x / g, 1);
      var root = { value: x, kind: 'root', children: restFirst ? [rest, G] : [G, rest], depth: 0 };
      return { root: root, rest: rest, top: root };
    }
    return { g: g, G: G, a: side(a, true), b: side(b, false) };
  }

  // assignOverlapX(overlap, counter): one leaf row for a's rest, the shared
  // branch and b's rest, in that order; each root sits midway over its
  // two parts. counter.value ends as the leaf count.
  function assignOverlapX(overlap, counter) {
    var parts = [overlap.a.rest, overlap.G, overlap.b.rest].filter(Boolean);
    assignTreeX({ children: parts }, counter);
    if (overlap.a.root) overlap.a.root.x = (overlap.a.rest.x + overlap.G.x) / 2;
    if (overlap.b.root) overlap.b.root.x = (overlap.G.x + overlap.b.rest.x) / 2;
  }

  // flattenOverlap(overlap, nodes, edges, maxDepth): like flattenTree, with
  // every node of the shared branch listed once and an edge to it from
  // each root that has one.
  function flattenOverlap(overlap, nodes, edges, maxDepth) {
    flattenTree(overlap.a.top, null, nodes, edges, maxDepth);
    var bRoot = overlap.b.root;
    if (!bRoot) return;
    nodes.push(bRoot);
    edges.push({ from: bRoot, to: overlap.G });
    flattenTree(overlap.b.rest, bRoot, nodes, edges, maxDepth);
  }

  // assignTreeX(node, counter): leaves get consecutive x positions in
  // left-to-right order; an internal node's x is the midpoint of its
  // first and last child's x.
  function assignTreeX(node, counter) {
    if (node.children.length === 0) {
      node.x = counter.value;
      counter.value += 1;
    } else {
      for (var i = 0; i < node.children.length; i++) assignTreeX(node.children[i], counter);
      node.x = (node.children[0].x + node.children[node.children.length - 1].x) / 2;
    }
  }

  // flattenTree(node, parent, nodes, edges, maxDepth): pre-order node list,
  // parent-child edge list, and the running max depth (maxDepth.value).
  function flattenTree(node, parent, nodes, edges, maxDepth) {
    nodes.push(node);
    if (parent) edges.push({ from: parent, to: node });
    maxDepth.value = Math.max(maxDepth.value, node.depth);
    for (var i = 0; i < node.children.length; i++) flattenTree(node.children[i], node, nodes, edges, maxDepth);
  }

  NT.layout = Object.freeze({
    assignOverlapX: assignOverlapX,
    assignTreeX: assignTreeX,
    BALANCED_MAX_N: BALANCED_MAX_N,
    buildFactorTree: buildFactorTree,
    buildOverlapTree: buildOverlapTree,
    computeNestedLayout: computeNestedLayout,
    flattenOverlap: flattenOverlap,
    flattenTree: flattenTree,
    TILE_CAP: TILE_CAP
  });
  // NT stays extensible so later modules can add their own namespace, but
  // this slot is locked: NT.layout can never be reassigned or deleted.
  Object.defineProperty(NT, 'layout', { writable: false, configurable: false });
})();
