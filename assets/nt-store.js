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
   ab-params -> {a, b}, number-palette -> an ascending array of integers
   2..1e12, at most 1000 entries, duplicates allowed, [] valid) are a
   PERSISTED CONTRACT: pages migrated in
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
   Diagram and Group Isomorphism. number-palette is shared by Factor Tree,
   Venn Diagram and the Sieve of Eratosthenes.

   Cookie size limit: a cookie value holds about 4 KB, so a palette of
   hundreds of numbers cannot ride the cookie channel. writeShared expires
   the key's cookie when the encoded payload is too long, and localStorage
   alone then carries it. Known limitation: on Firefox over file://, where
   localStorage is per-document, a palette too large for a cookie therefore
   only syncs within one page's own origin.

   NT.store is frozen, and its slot on NT is read-only, after construction —
   a tool must never assign to NT or to any of its members (shadow-check.js's
   NS-MUTATION gate enforces this).
*/
(function () {
  "use strict";

  // readShared(key, validate, raw): cookie first, then localStorage when no
  // cookie match; null on an empty raw value or a JSON parse error;
  // otherwise the raw parsed value is handed to validate(), which decides
  // whether it is well-formed and normalizes its shape.
  //
  // A storage-event handler passes the event's newValue as raw instead.
  // The event fires as soon as the writing tab sets localStorage, but that
  // tab sets the cookie right after, and the cookie can reach this tab
  // later than the event does — so a cookie-first re-read here could still
  // see the previous value and silently drop the update. The event already
  // carries the new value, so it is parsed and validated directly.
  function readShared(key, validate, raw) {
    if (raw !== undefined) return parseShared(raw, validate);
    raw = null;
    try {
      var m = new RegExp("(?:^|; *)" + key + "=([^;]*)").exec(document.cookie || "");
      if (m) raw = decodeURIComponent(m[1]);
    } catch (e) { /* ignore */ }
    if (raw === null) {
      try { raw = localStorage.getItem(key); } catch (e) { /* ignore */ }
    }
    return parseShared(raw, validate);
  }

  function parseShared(raw, validate) {
    if (!raw) return null;
    var parsed = null;
    try { parsed = JSON.parse(raw); } catch (e) { return null; }
    return validate(parsed);
  }

  // A cookie value is limited to about 4 KB; an encoded payload longer than
  // this is not written as a cookie (see writeShared).
  var COOKIE_VALUE_MAX = 3800;

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
    var encoded = encodeURIComponent(payload);
    try {
      if (encoded.length > COOKIE_VALUE_MAX) {
        // Too big for a cookie: expire any older cookie so the cookie-first
        // read cannot return a stale value, leaving localStorage in charge.
        document.cookie = key + "=;path=/;max-age=0;samesite=lax";
      } else {
        document.cookie = key + "=" + encoded + ";path=/;max-age=31536000;samesite=lax";
      }
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

  // readSharedGroup(raw): raw is a storage event's newValue; omit it to read
  // the store itself.
  function readSharedGroup(raw) {
    return readShared(SHARED_GROUP_KEY, validateGroup, raw);
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

  // readSharedAB(raw): raw is a storage event's newValue; omit it to read
  // the store itself.
  function readSharedAB(raw) {
    return readShared(SHARED_AB_KEY, validateAB, raw);
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

  /* ---------- shared number palette (Factor Tree <-> Venn Diagram <-> Sieve of Eratosthenes) ---------- */

  var SHARED_PALETTE_KEY = 'number-palette';
  var SHARED_PALETTE_MAX = 1000;
  var SHARED_PALETTE_MAX_N = 1000000000000;
  var LEGACY_PALETTE_KEY = 'factor-tree-palette';
  var DEFAULT_PALETTE = Object.freeze([
    2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47,
    53, 59, 61, 67, 71, 73, 79, 83, 89, 97, 101, 103, 107, 109, 113
  ]);

  function byValue(a, b) { return a - b; }

  // A sorted copy of a well-formed palette, or null. An empty list is valid:
  // a visitor may have binned every number.
  function validatePalette(parsed) {
    if (!Array.isArray(parsed) || parsed.length > SHARED_PALETTE_MAX) return null;
    for (var i = 0; i < parsed.length; i++) {
      var v = parsed[i];
      if (typeof v !== "number" || !Number.isInteger(v) || v < 2 || v > SHARED_PALETTE_MAX_N) return null;
    }
    return parsed.slice().sort(byValue);
  }

  // readSharedPalette(raw): raw is a storage event's newValue; omit it to
  // read the store itself.
  function readSharedPalette(raw) {
    return readShared(SHARED_PALETTE_KEY, validatePalette, raw);
  }

  function countOf(list) {
    var c = {};
    for (var i = 0; i < list.length; i++) c[list[i]] = (c[list[i]] || 0) + 1;
    return c;
  }

  // loadSharedPalette(): the palette, ascending. Falls back to the default
  // first 30 primes, and carries Factor Tree's old per-tool localStorage key
  // ('factor-tree-palette') into the shared key once (max-count multiset
  // merge when both exist), removing the old key afterwards.
  function loadSharedPalette() {
    var shared = readShared(SHARED_PALETTE_KEY, validatePalette);
    var legacy = null;
    var legacyFound = false;
    try {
      var rawLegacy = localStorage.getItem(LEGACY_PALETTE_KEY);
      if (rawLegacy !== null) {
        legacyFound = true;
        legacy = parseShared(rawLegacy, validatePalette);
      }
    } catch (e) { /* ignore */ }
    var result = shared;
    if (legacy && !shared) {
      result = legacy;
    } else if (legacy && shared) {
      var cs = countOf(shared);
      var cl = countOf(legacy);
      var merged = [];
      Object.keys(cs).concat(Object.keys(cl)).forEach(function (k) {
        var n = Number(k);
        if (merged.indexOf(n) !== -1) return;
        var times = Math.max(cs[k] || 0, cl[k] || 0);
        for (var t = 0; t < times; t++) merged.push(n);
      });
      merged.sort(byValue);
      result = merged.slice(0, SHARED_PALETTE_MAX);
    } else if (!shared) {
      result = DEFAULT_PALETTE.slice();
    }
    if (result !== shared) writeShared(SHARED_PALETTE_KEY, result, validatePalette);
    if (legacyFound) {
      try { localStorage.removeItem(LEGACY_PALETTE_KEY); } catch (e) { /* ignore */ }
    }
    return result.slice();
  }

  // addToSharedPalette(values, unique): read-modify-write. Returns
  // { list, added, duplicates, overflow }. With unique truthy a value
  // already present (or already added in this call) counts as a duplicate;
  // at the cap a value counts as overflow. Out-of-range values are skipped
  // silently.
  function addToSharedPalette(values, unique) {
    var list = loadSharedPalette();
    var added = [];
    var duplicates = 0;
    var overflow = 0;
    var seen = unique ? countOf(list) : null;
    for (var i = 0; i < values.length; i++) {
      var v = values[i];
      if (typeof v !== "number" || !Number.isInteger(v) || v < 2 || v > SHARED_PALETTE_MAX_N) continue;
      if (unique && seen[v]) { duplicates++; continue; }
      if (list.length >= SHARED_PALETTE_MAX) { overflow++; continue; }
      var at = list.length;
      for (var j = 0; j < list.length; j++) {
        if (list[j] > v) { at = j; break; }
      }
      list.splice(at, 0, v);
      added.push(v);
      if (unique) seen[v] = 1;
    }
    if (added.length > 0) writeShared(SHARED_PALETTE_KEY, list, validatePalette);
    return { list: list.slice(), added: added, duplicates: duplicates, overflow: overflow };
  }

  // removeFromSharedPalette(value): read-modify-write removing exactly one
  // occurrence; returns the resulting list.
  function removeFromSharedPalette(value) {
    var list = loadSharedPalette();
    var at = list.indexOf(value);
    if (at !== -1) {
      list.splice(at, 1);
      writeShared(SHARED_PALETTE_KEY, list, validatePalette);
    }
    return list.slice();
  }

  // clearSharedPalette(): empties the palette; returns the (empty) list.
  function clearSharedPalette() {
    writeShared(SHARED_PALETTE_KEY, [], validatePalette);
    return [];
  }

  // writeSharedPalette(values): replaces the whole palette with a validated
  // list (the page's Undo/Redo restore a snapshot through this). A malformed
  // list writes nothing and returns null; otherwise returns the sorted list
  // that was written. The persisted shape is unchanged.
  function writeSharedPalette(values) {
    var list = validatePalette(values);
    if (list === null) return null;
    writeShared(SHARED_PALETTE_KEY, list, validatePalette);
    return list.slice();
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
    readMigrating: readMigrating,
    SHARED_PALETTE_KEY: SHARED_PALETTE_KEY,
    SHARED_PALETTE_MAX: SHARED_PALETTE_MAX,
    SHARED_PALETTE_MAX_N: SHARED_PALETTE_MAX_N,
    readSharedPalette: readSharedPalette,
    loadSharedPalette: loadSharedPalette,
    addToSharedPalette: addToSharedPalette,
    removeFromSharedPalette: removeFromSharedPalette,
    clearSharedPalette: clearSharedPalette,
    writeSharedPalette: writeSharedPalette
  });
  // NT stays extensible so later modules can add their own namespace, but
  // this slot is locked: NT.store can never be reassigned or deleted.
  Object.defineProperty(NT, 'store', { writable: false, configurable: false });
})();
