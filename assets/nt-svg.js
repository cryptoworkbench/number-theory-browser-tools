/* NT.svg — SVG element creation and geometry helpers shared across every tool.

   This file centralizes the hand-drawn-SVG primitives that used to be
   duplicated per-tool: the createElementNS wrapper (svgEl), polar-coordinate
   conversion and annular-sector path construction for wheel-style diagrams
   (polar, annularSectorPath), and the cubic ease-in-out timing function used
   by several playback/animation renderers (easeInOutCubic). Number-domain
   math primitives live in the separate assets/nt-core.js module.

   Classic script, IIFE, "use strict" — no build step, no bundler. It must
   be included as a plain, non-deferred <script src> (no defer, no async,
   no type="module") so it executes synchronously before a tool's own
   inline <script> runs, and so pages keep working when opened directly
   over file://, where ES module imports are blocked by CORS.

   Include convention: place
     <script src="../assets/nt-core.js"></script>
     <script src="../assets/nt-svg.js"></script>
   on their own lines immediately before a tool's own inline <script> block
   at the end of <body>, nt-core before nt-svg (canonical order core, bigint,
   svg, store, layout).

   Tier-2 signature change: polar and annularSectorPath used to close over a
   module-scoped CX/CY pair in the wheel tools (Equivalence Wheel, Group
   Isomorphism). Here they take the circle centre as explicit leading
   parameters (cx, cy, ...) so any page can use them regardless of where its
   own centre constants live — every call site must pass its own CX/CY
   explicitly.

   Consumers (Phase 7, plan 07-02): Fermat's Method (svgEl, easeInOutCubic),
   Shor's Algorithm (svgEl, polar), Elliptic Curve Diffie-Hellman (svgEl).
   Later phase-7 plans extend this list to the remaining tools that used to
   keep a local copy of one of these functions, including the two wheel
   tools that require the centre-parameterized polar/annularSectorPath.

   NT.svg is frozen after construction — a tool must never assign to NT or
   to any of its members (shadow-check.js's NS-MUTATION gate enforces
   this).
*/
(function () {
  "use strict";

  var SVG_NS = 'http://www.w3.org/2000/svg';

  // svgEl(tag, attrs): createElementNS + setAttribute for each own
  // enumerable key of attrs, in insertion order — the loop every
  // predecessor variant uses (Factor Tree, Elliptic Curve Diffie-Hellman,
  // Euclidean Algorithm, Diffie-Hellman Key Exchange, Fermat's Method,
  // Shor's Algorithm, Square And Multiply, Equivalence Wheel, Group
  // Isomorphism, Venn Diagram).
  function svgEl(tag, attrs) {
    var el = document.createElementNS(SVG_NS, tag);
    for (var k in attrs) el.setAttribute(k, attrs[k]);
    return el;
  }

  // polar(cx, cy, r, angleDeg): angle offset by -90 degrees (0deg points
  // straight up), returns [x, y]. Equivalence Wheel/Group Isomorphism body
  // with CX/CY replaced by explicit cx/cy parameters; Shor's Algorithm's
  // polarPoint already took cx, cy as explicit leading parameters in this
  // same order, so this is also a drop-in rename for that call site.
  function polar(cx, cy, r, angleDeg) {
    var a = (angleDeg - 90) * Math.PI / 180;
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
  }

  // annularSectorPath(cx, cy, rInner, rOuter, startDeg, endDeg): Equivalence
  // Wheel/Group Isomorphism body with every CX/CY replaced by explicit
  // cx/cy parameters, and its internal polar calls passing cx, cy through.
  // Full-ring branch when span >= 359.999 (two opposing arcs, inner and
  // outer, to describe a complete annulus); large-arc flag set when the
  // span exceeds 180 degrees.
  function annularSectorPath(cx, cy, rInner, rOuter, startDeg, endDeg) {
    if (endDeg - startDeg >= 359.999) {
      return 'M ' + (cx - rOuter) + ' ' + cy +
        ' A ' + rOuter + ' ' + rOuter + ' 0 1 1 ' + (cx + rOuter) + ' ' + cy +
        ' A ' + rOuter + ' ' + rOuter + ' 0 1 1 ' + (cx - rOuter) + ' ' + cy +
        ' Z M ' + (cx - rInner) + ' ' + cy +
        ' A ' + rInner + ' ' + rInner + ' 0 1 0 ' + (cx + rInner) + ' ' + cy +
        ' A ' + rInner + ' ' + rInner + ' 0 1 0 ' + (cx - rInner) + ' ' + cy + ' Z';
    }
    var p1 = polar(cx, cy, rInner, startDeg), p2 = polar(cx, cy, rOuter, startDeg);
    var p3 = polar(cx, cy, rOuter, endDeg), p4 = polar(cx, cy, rInner, endDeg);
    var large = (endDeg - startDeg) > 180 ? 1 : 0;
    return 'M ' + p1[0] + ' ' + p1[1] +
      ' L ' + p2[0] + ' ' + p2[1] +
      ' A ' + rOuter + ' ' + rOuter + ' 0 ' + large + ' 1 ' + p3[0] + ' ' + p3[1] +
      ' L ' + p4[0] + ' ' + p4[1] +
      ' A ' + rInner + ' ' + rInner + ' 0 ' + large + ' 0 ' + p1[0] + ' ' + p1[1] + ' Z';
  }

  // easeInOutCubic(t): Diffie-Hellman Key Exchange / Fermat's Method body,
  // byte-identical between both predecessors.
  function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  var NT = window.NT = window.NT || {};
  NT.svg = Object.freeze({
    SVG_NS: SVG_NS,
    annularSectorPath: annularSectorPath,
    easeInOutCubic: easeInOutCubic,
    polar: polar,
    svgEl: svgEl
  });
})();
