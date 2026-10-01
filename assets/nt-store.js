/* NT.store — cross-tool shared-state persistence, shared across sibling
   tool pairs (Cayley Table <-> Equivalence Wheel's group type + modulus;
   Euclidean Algorithm <-> Venn Diagram's a/b pair).

   The concept these functions centralize: a shared setting is ONE value
   two sibling tools both read and write, not a private per-tool value —
   changing it in either tool must be visible the next time the other tool
   is opened, and live via the existing cross-tab `storage` event pattern
   each tool's own script already wires up.

   Why a cookie mirrors localStorage (same rationale assets/theme.js
   documents for its own theme setting): these pages are opened straight
   from disk (file://), and Firefox's privacy.file_unique_origin=true gives
   every file:// document its own opaque origin, so localStorage alone is
   invisible across sibling tool pages. The cookie channel (shared across
   file:// documents in Firefox, and the primary channel Chrome ignores on
   file:// but silently, harmlessly) is read first, with localStorage as
   the fallback/primary depending on browser.

   Each tool clamps a shared value it reads to its OWN ceiling (its own
   MAX_N, MAX_INPUT, etc.) before display, and a clamped read is NEVER
   written back — writing a clamped value back would silently shrink the
   sibling tool's own setting the next time it reads the shared store.

   Key names and payload shapes below (group-params -> {mode, N},
   ab-params -> {a, b}) are a PERSISTED CONTRACT: pages migrated in
   different phase-7 waves, and browsers holding values written before this
   phase, must keep interoperating. Do not rename a key or reshape a
   payload without a migration plan for existing stored values.

   Classic script, IIFE, "use strict" — no build step, no bundler. It must
   be included as a plain, non-deferred <script src> (no defer, no async,
   no type="module") so it executes synchronously before a tool's own
   inline <script> runs, and so pages keep working when opened directly
   over file://, where ES module imports are blocked by CORS.

   Include convention: place
     <script src="../assets/nt-store.js"></script>
   on its own line, in the canonical order core, bigint, svg, store,
   layout, immediately before a tool's own inline <script> block at the
   end of <body>.

   Consumers (Phase 7, plan 07-03): Cayley Table. Later phase-7 plans
   extend this list to Equivalence Wheel, Euclidean Algorithm, Venn
   Diagram and Group Isomorphism.

   NT.store is frozen, and its slot on NT is read-only, after construction —
   a tool must never assign to NT or to any of its members (shadow-check.js's
   NS-MUTATION gate enforces this).
*/
(function () {
  "use strict";

  // readShared(key, validate): cookie first, then localStorage when no
  // cookie match; null on an empty raw value or a JSON parse error;
  // otherwise the raw parsed value is handed to validate(), which decides
  // whether it is well-formed and normalizes its shape.
  function readShared(key, validate) {
    var raw = null;
    try {
      var m = new RegExp("(?:^|; *)" + key + "=([^;]*)").exec(document.cookie || "");
      if (m) raw = decodeURIComponent(m[1]);
    } catch (e) { /* ignore */ }
    if (raw === null) {
      try { raw = localStorage.getItem(key); } catch (e) { /* ignore */ }
    }
    if (!raw) return null;
    var parsed = null;
    try { parsed = JSON.parse(raw); } catch (e) { return null; }
    return validate(parsed);
  }

  // writeShared(key, value, validate): skip writing when the stored value
  // already matches (re-read through readShared/validate — one
  // parsing-and-validation path, so a hand-edited or legacy stored value is
  // never trusted verbatim); otherwise localStorage first, then the cookie,
  // each attempt independently wrapped so a throwing localStorage still
  // lets the cookie write happen.
  function writeShared(key, value, validate) {
    var payload = JSON.stringify(value);
    var current = readShared(key, validate);
    if (current && JSON.stringify(current) === payload) return;
    try { localStorage.setItem(key, payload); } catch (e) { /* ignore */ }
    try {
      document.cookie = key + "=" + encodeURIComponent(payload) + ";path=/;max-age=31536000;samesite=lax";
    } catch (e) { /* ignore */ }
  }

  /* ---------- shared group params (Cayley Table <-> Equivalence Wheel) ---------- */

  var SHARED_GROUP_KEY = 'group-params';

  function validateGroup(parsed) {
    if (!parsed || typeof parsed !== "object") return null;
    if (parsed.mode !== "additive" && parsed.mode !== "multiplicative") return null;
    if (typeof parsed.N !== "number" || !Number.isInteger(parsed.N)) return null;
    if (parsed.N < 1) return null;
    return { mode: parsed.mode, N: parsed.N };
  }

  function readSharedGroup() {
    return readShared(SHARED_GROUP_KEY, validateGroup);
  }

  function writeSharedGroup(mode, n) {
    writeShared(SHARED_GROUP_KEY, { mode: mode, N: n }, validateGroup);
  }

  // readModeNParams(): the ?mode=&n= deep-link reader (Cayley Table /
  // Equivalence Wheel's identical body).
  function readModeNParams() {
    var mm, mn;
    try {
      mm = /[?&]mode=([^&#]*)/.exec(location.search);
      mn = /[?&]n=([^&#]*)/.exec(location.search);
    } catch (e) {
      return null;
    }
    if (!mm || !mn) return null;
    var mode, n;
    try {
      mode = decodeURIComponent(mm[1]);
      n = parseInt(decodeURIComponent(mn[1]), 10);
    } catch (e) {
      return null;
    }
    if (mode !== "additive" && mode !== "multiplicative") return null;
    if (!isFinite(n) || n < 1) return null;
    return { mode: mode, n: n };
  }

  /* ---------- shared a/b params (Euclidean Algorithm <-> Venn Diagram) ---------- */

  var SHARED_AB_KEY = 'ab-params';

  function validateAB(parsed) {
    if (!parsed || typeof parsed !== "object") return null;
    if (typeof parsed.a !== "number" || !Number.isInteger(parsed.a)) return null;
    if (typeof parsed.b !== "number" || !Number.isInteger(parsed.b)) return null;
    if (parsed.a < 0 || parsed.b < 0) return null;
    if (parsed.a === 0 && parsed.b === 0) return null;
    return { a: parsed.a, b: parsed.b };
  }

  function readSharedAB() {
    return readShared(SHARED_AB_KEY, validateAB);
  }

  function writeSharedAB(a, b) {
    writeShared(SHARED_AB_KEY, { a: a, b: b }, validateAB);
  }

  // readABParams(rejectZeroPair): the ?a=&b= deep-link reader. Venn
  // Diagram's body accepts the (0, 0) pair; passing rejectZeroPair truthy
  // additionally rejects it, matching the Euclidean Algorithm's own reader
  // (which has no defined GCD for (0, 0)). This is the one place the two
  // predecessors' behavior genuinely differs, so it is parameterized rather
  // than merged away.
  function readABParams(rejectZeroPair) {
    var ma, mb;
    try {
      ma = /[?&]a=([^&#]*)/.exec(location.search);
      mb = /[?&]b=([^&#]*)/.exec(location.search);
    } catch (e) {
      return null;
    }
    if (!ma || !mb) return null;
    var a, b;
    try {
      a = parseInt(decodeURIComponent(ma[1]), 10);
      b = parseInt(decodeURIComponent(mb[1]), 10);
    } catch (e) {
      return null;
    }
    if (!isFinite(a) || !isFinite(b) || a < 0 || b < 0) return null;
    if (rejectZeroPair && a === 0 && b === 0) return null;
    return { a: a, b: b };
  }

  // readMigrating(key, legacyKey): Venn Diagram's legacy-key fallback
  // reader — returns the value under `key`, or copies `legacyKey`'s value
  // forward to `key` (and returns it) when `key` is absent, or null.
  function readMigrating(key, legacyKey) {
    try {
      var v = localStorage.getItem(key);
      if (v !== null) return v;
      var legacy = localStorage.getItem(legacyKey);
      if (legacy !== null) {
        localStorage.setItem(key, legacy);
        return legacy;
      }
      return null;
    } catch (e) {
      return null;
    }
  }

  var NT = window.NT = window.NT || {};
  NT.store = Object.freeze({
    readShared: readShared,
    writeShared: writeShared,
    SHARED_GROUP_KEY: SHARED_GROUP_KEY,
    readSharedGroup: readSharedGroup,
    writeSharedGroup: writeSharedGroup,
    readModeNParams: readModeNParams,
    SHARED_AB_KEY: SHARED_AB_KEY,
    readSharedAB: readSharedAB,
    writeSharedAB: writeSharedAB,
    readABParams: readABParams,
    readMigrating: readMigrating
  });
  // NT stays extensible so later modules can add their own namespace, but
  // this slot is locked: NT.store can never be reassigned or deleted.
  Object.defineProperty(NT, 'store', { writable: false, configurable: false });
})();
