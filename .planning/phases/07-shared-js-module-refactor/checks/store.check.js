/* checks/store.check.js — parity and hostile-input checks for NT.store
 * against every pre-phase per-tool predecessor (Cayley Table / Equivalence
 * Wheel for the group pair; Euclidean Algorithm / Venn Diagram for the a/b
 * pair). Exports function(ctx) per harness.js's contract.
 */
"use strict";

var vm = require("vm");

var EXPECTED_KEYS = [
  "SHARED_AB_KEY", "SHARED_GROUP_KEY", "readABParams", "readMigrating",
  "readModeNParams", "readShared", "readSharedAB", "readSharedGroup",
  "writeShared", "writeSharedAB", "writeSharedGroup"
];

var CAYLEY_PATH = "Cayley Table/cayley-table.html";
var EQWHEEL_PATH = "Equivalence Wheel/equivalence-wheel.html";
var EA_PATH = "Euclidean Algorithm/euclidean-algorithm.html";
var VENN_PATH = "Venn Diagram/venn-diagram.html";

// Extract named function bodies from a BASE file ONCE (avoids re-spawning
// `git show` per scenario), then build many cheap, independent vm contexts
// re-using that extracted text.
function extractOnce(ctx, file, names) {
  var src = ctx.gitShow(file);
  return ctx.extractFunctions(src, names);
}

// preamble supplies outer-scope constants (SHARED_GROUP_KEY, SHARED_AB_KEY)
// that readSharedGroup/writeSharedGroup/readSharedAB/writeSharedAB close
// over but which extractFunctions does not capture (it only grabs the named
// function declarations, not sibling `var` declarations in the file).
// Without it, the old body's first reference to the constant throws a
// ReferenceError — silently swallowed by the function's own try/catch —
// which would make every old-side call return null regardless of scenario.
function freshFns(fnsText, names, globals, preamble) {
  var context = {};
  if (globals) { for (var k in globals) context[k] = globals[k]; }
  vm.createContext(context);
  if (preamble) vm.runInContext(preamble, context);
  var body = names.map(function (n) { return fnsText[n]; }).join("\n\n");
  vm.runInContext(body, context);
  var out = { context: context };
  names.forEach(function (n) { out[n] = context[n]; });
  return out;
}

module.exports = function (ctx) {
  var NT = ctx.loadNew({});
  var store = NT.store;

  ctx.eq("store key-set", Object.keys(store).sort(), EXPECTED_KEYS.slice().sort());
  ctx.eq("store frozen", Object.isFrozen(store), true);

  var cayleySrc = ctx.gitShow(CAYLEY_PATH);
  var eaSrc = ctx.gitShow(EA_PATH);
  var groupKeyLiteral = /SHARED_GROUP_KEY\s*=\s*'([^']+)'/.exec(cayleySrc)[1];
  var abKeyLiteral = /SHARED_AB_KEY\s*=\s*'([^']+)'/.exec(eaSrc)[1];
  ctx.eq("SHARED_GROUP_KEY literal vs Cayley source", store.SHARED_GROUP_KEY, groupKeyLiteral);
  ctx.eq("SHARED_AB_KEY literal vs Euclidean Algorithm source", store.SHARED_AB_KEY, abKeyLiteral);

  /* ---------- generic readShared/writeShared primitives, direct tests ----------
   * These are NT.store-only additions with no per-tool predecessor (the
   * specific readSharedGroup/readSharedAB below are what every predecessor
   * actually had) — exercised directly against a synthetic key + validator
   * to prove the shared plumbing itself: cookie-first read order, null on
   * empty/malformed input, validator delegation, write's skip-when-matching
   * short-circuit, and independent localStorage/cookie write attempts.
   */
  (function () {
    var GKEY = "nt-store-check-generic-key";
    function isEvenArray(parsed) {
      if (!Array.isArray(parsed)) return null;
      for (var i = 0; i < parsed.length; i++) {
        if (typeof parsed[i] !== "number" || parsed[i] % 2 !== 0) return null;
      }
      return parsed;
    }

    function freshGenericEnv(cookieOpts, storageOpts) {
      var jar = ctx.makeCookieJar(cookieOpts || {});
      var storage = ctx.makeStorage(storageOpts || {});
      var NTg = ctx.loadNew({ globals: { document: jar.document, localStorage: storage } });
      return { store: NTg.store, jar: jar, storage: storage };
    }

    // Empty storage -> null.
    var e1 = freshGenericEnv();
    ctx.eq("readShared generic: empty -> null", e1.store.readShared(GKEY, isEvenArray), null);

    // Write then read roundtrip via the cookie channel.
    var e2 = freshGenericEnv();
    e2.store.writeShared(GKEY, [2, 4, 6], isEvenArray);
    ctx.eq("writeShared/readShared generic roundtrip", e2.store.readShared(GKEY, isEvenArray), [2, 4, 6]);
    // 2 entries: readShared's internal pre-write check (a "get", since the
    // cookie has no match in this fresh env) plus the actual write's "set".
    ctx.eq("writeShared generic: localStorage log has get+set", e2.storage._log.length, 2);
    ctx.eq("writeShared generic: cookie log has one write", e2.jar._log.length, 1);

    // Validator rejects a malformed shape even though JSON.parse succeeds.
    var e3 = freshGenericEnv();
    e3.jar.document.cookie = GKEY + "=" + encodeURIComponent(JSON.stringify([2, 3, 4]));
    ctx.eq("readShared generic: validator rejects odd element", e3.store.readShared(GKEY, isEvenArray), null);

    // Malformed JSON on the cookie channel -> null, no localStorage fallback.
    var e4 = freshGenericEnv();
    e4.jar.document.cookie = GKEY + "=not-json";
    e4.storage.setItem(GKEY, JSON.stringify([2, 4]));
    ctx.eq("readShared generic: malformed cookie JSON -> null, no fallback", e4.store.readShared(GKEY, isEvenArray), null);

    // writeShared skips the mutation entirely when the stored value already matches.
    var e5 = freshGenericEnv();
    e5.jar.document.cookie = GKEY + "=" + encodeURIComponent(JSON.stringify([8, 10]));
    e5.store.writeShared(GKEY, [8, 10], isEvenArray);
    ctx.eq("writeShared generic: skip-when-matching leaves localStorage untouched", e5.storage._log.length, 0);
    ctx.eq("writeShared generic: skip-when-matching leaves cookie untouched (only the seed write)", e5.jar._log.length, 1);

    // A throwing localStorage still lets the cookie write happen.
    var e6 = freshGenericEnv(null, { throwOnSet: true });
    e6.store.writeShared(GKEY, [12, 14], isEvenArray);
    ctx.eq("writeShared generic: throwing localStorage still writes cookie", e6.jar._log.length, 1);
    ctx.eq("writeShared generic: readShared sees the cookie-only write", e6.store.readShared(GKEY, isEvenArray), [12, 14]);

    // A battery of raw payloads through the same validator, each independently
    // seeded fresh — proves validate() genuinely gates every shape, not just
    // the ones the group/AB scenarios happen to exercise.
    var genericPayloads = [
      { raw: "[2,4,6]", want: [2, 4, 6] },
      { raw: "[1,2,3]", want: null },
      { raw: "[]", want: [] },
      { raw: "{}", want: null },
      { raw: "null", want: null },
      { raw: "42", want: null },
      { raw: '"str"', want: null },
      { raw: "[2,4,6,8,10]", want: [2, 4, 6, 8, 10] },
      { raw: "[2,4,-6]", want: [2, 4, -6] },
      { raw: "[2,\"4\",6]", want: null },
      { raw: "false", want: null },
      { raw: "[0]", want: [0] },
      { raw: "[1]", want: null },
      { raw: "[2,4,6.5]", want: null },
      { raw: "[[2]]", want: null },
      { raw: "not-json-at-all{", want: null },
      { raw: "[2,4,null]", want: null },
      { raw: "[100,200,300]", want: [100, 200, 300] },
      { raw: "[-2,-4]", want: [-2, -4] },
      { raw: "undefined", want: null }
    ];
    genericPayloads.forEach(function (p, idx) {
      var eN = freshGenericEnv();
      eN.storage.setItem(GKEY, p.raw);
      ctx.eq("readShared generic payload #" + idx + " (" + p.raw + ")", eN.store.readShared(GKEY, isEvenArray), p.want);
    });
  })();

  /* ---------- readSharedGroup / readSharedAB hostile-input parity ---------- */

  var cayleyRead = extractOnce(ctx, CAYLEY_PATH, ["readSharedGroup", "writeSharedGroup"]);
  var eqWheelRead = extractOnce(ctx, EQWHEEL_PATH, ["readSharedGroup", "writeSharedGroup"]);
  var eaRead = extractOnce(ctx, EA_PATH, ["readSharedAB", "writeSharedAB"]);
  var vennRead = extractOnce(ctx, VENN_PATH, ["readSharedAB", "writeSharedAB"]);

  function buildEnv(key, sc) {
    var jar = ctx.makeCookieJar(sc.cookieOpts || {});
    var storage = ctx.makeStorage(sc.storageOpts || {});
    (sc.cookiePairs || []).forEach(function (p) { jar.document.cookie = p; });
    if (sc.storageValue !== undefined) storage.setItem(key, sc.storageValue);
    return { document: jar.document, localStorage: storage, jar: jar, storage: storage };
  }

  function keyPreamble(constName, keyLiteral) {
    return "var " + constName + " = " + JSON.stringify(keyLiteral) + ";";
  }

  function runReadScenarios(key, scenarios, oldSet, readName, constName) {
    var preamble = keyPreamble(constName, key);
    scenarios.forEach(function (sc) {
      var envNew = buildEnv(key, sc);
      var newNT = ctx.loadNew({ globals: { document: envNew.document, localStorage: envNew.localStorage } });
      var got = newNT.store[readName]();

      Object.keys(oldSet).forEach(function (label) {
        var envOld = buildEnv(key, sc);
        var old = freshFns(oldSet[label], [readName], { document: envOld.document, localStorage: envOld.localStorage }, preamble);
        var want = old[readName]();
        ctx.eq(readName + " scenario \"" + sc.label + "\" vs " + label, got, want);
      });
    });
  }

  var groupPayload = function (mode, N) { return JSON.stringify({ mode: mode, N: N }); };
  var groupScenarios = [
    { label: "empty storage" },
    { label: "cookie only", cookiePairs: [store.SHARED_GROUP_KEY + "=" + encodeURIComponent(groupPayload("additive", 6))] },
    { label: "localStorage only", storageValue: groupPayload("multiplicative", 10) },
    {
      label: "cookie and localStorage disagreeing (cookie wins)",
      cookiePairs: [store.SHARED_GROUP_KEY + "=" + encodeURIComponent(groupPayload("additive", 6))],
      storageValue: groupPayload("multiplicative", 99)
    },
    {
      label: "malformed cookie JSON with valid localStorage (null, no fallback)",
      cookiePairs: [store.SHARED_GROUP_KEY + "=not-json"],
      storageValue: groupPayload("additive", 6)
    },
    {
      label: "empty cookie value",
      cookiePairs: [store.SHARED_GROUP_KEY + "="],
      storageValue: groupPayload("additive", 6)
    },
    { label: "wrong mode type", cookiePairs: [store.SHARED_GROUP_KEY + "=" + encodeURIComponent(JSON.stringify({ mode: 5, N: 6 }))] },
    { label: "N as string", cookiePairs: [store.SHARED_GROUP_KEY + "=" + encodeURIComponent(JSON.stringify({ mode: "additive", N: "6" }))] },
    { label: "N out of range (negative)", cookiePairs: [store.SHARED_GROUP_KEY + "=" + encodeURIComponent(JSON.stringify({ mode: "additive", N: -1 }))] },
    { label: "N non-integer", cookiePairs: [store.SHARED_GROUP_KEY + "=" + encodeURIComponent(JSON.stringify({ mode: "additive", N: 5.5 }))] },
    { label: "cookie getter throwing", cookieOpts: { throwOnGet: true }, storageValue: groupPayload("additive", 6) },
    { label: "localStorage throwing (no cookie match)", storageOpts: { throwOnGet: true } },
    { label: "both throwing", cookieOpts: { throwOnGet: true }, storageOpts: { throwOnGet: true } },
    {
      label: "payload surrounded by other cookies",
      cookiePairs: ["foo=bar", store.SHARED_GROUP_KEY + "=" + encodeURIComponent(groupPayload("additive", 6)), "baz=qux"]
    },
    { label: "N=1 boundary", cookiePairs: [store.SHARED_GROUP_KEY + "=" + encodeURIComponent(groupPayload("additive", 1))] },
    { label: "multiplicative mode, N=1", cookiePairs: [store.SHARED_GROUP_KEY + "=" + encodeURIComponent(groupPayload("multiplicative", 1))] },
    { label: "N as boolean", cookiePairs: [store.SHARED_GROUP_KEY + "=" + encodeURIComponent(JSON.stringify({ mode: "additive", N: true }))] },
    { label: "mode missing entirely", cookiePairs: [store.SHARED_GROUP_KEY + "=" + encodeURIComponent(JSON.stringify({ N: 6 }))] }
  ];
  runReadScenarios(store.SHARED_GROUP_KEY, groupScenarios, { Cayley: cayleyRead, EqWheel: eqWheelRead }, "readSharedGroup", "SHARED_GROUP_KEY");

  var abPayload = function (a, b) { return JSON.stringify({ a: a, b: b }); };
  var abScenarios = [
    { label: "empty storage" },
    { label: "cookie only", cookiePairs: [store.SHARED_AB_KEY + "=" + encodeURIComponent(abPayload(6, 9))] },
    { label: "localStorage only", storageValue: abPayload(3, 4) },
    {
      label: "cookie and localStorage disagreeing (cookie wins)",
      cookiePairs: [store.SHARED_AB_KEY + "=" + encodeURIComponent(abPayload(6, 9))],
      storageValue: abPayload(1, 2)
    },
    {
      label: "malformed cookie JSON with valid localStorage (null, no fallback)",
      cookiePairs: [store.SHARED_AB_KEY + "=not-json"],
      storageValue: abPayload(6, 9)
    },
    { label: "empty cookie value", cookiePairs: [store.SHARED_AB_KEY + "="], storageValue: abPayload(6, 9) },
    { label: "a wrong type", cookiePairs: [store.SHARED_AB_KEY + "=" + encodeURIComponent(JSON.stringify({ a: "6", b: 9 }))] },
    { label: "b out of range (negative)", cookiePairs: [store.SHARED_AB_KEY + "=" + encodeURIComponent(JSON.stringify({ a: 6, b: -1 }))] },
    { label: "a non-integer", cookiePairs: [store.SHARED_AB_KEY + "=" + encodeURIComponent(JSON.stringify({ a: 6.5, b: 9 }))] },
    { label: "both zero", cookiePairs: [store.SHARED_AB_KEY + "=" + encodeURIComponent(abPayload(0, 0))] },
    { label: "cookie getter throwing", cookieOpts: { throwOnGet: true }, storageValue: abPayload(3, 4) },
    { label: "localStorage throwing (no cookie match)", storageOpts: { throwOnGet: true } },
    { label: "both throwing", cookieOpts: { throwOnGet: true }, storageOpts: { throwOnGet: true } },
    {
      label: "payload surrounded by other cookies",
      cookiePairs: ["foo=bar", store.SHARED_AB_KEY + "=" + encodeURIComponent(abPayload(6, 9)), "baz=qux"]
    },
    { label: "a=1,b=0", cookiePairs: [store.SHARED_AB_KEY + "=" + encodeURIComponent(abPayload(1, 0))] },
    { label: "large a", cookiePairs: [store.SHARED_AB_KEY + "=" + encodeURIComponent(abPayload(999999999, 1))] },
    { label: "a as boolean", cookiePairs: [store.SHARED_AB_KEY + "=" + encodeURIComponent(JSON.stringify({ a: true, b: 9 }))] },
    { label: "b missing entirely", cookiePairs: [store.SHARED_AB_KEY + "=" + encodeURIComponent(JSON.stringify({ a: 6 }))] }
  ];
  runReadScenarios(store.SHARED_AB_KEY, abScenarios, { EA: eaRead, Venn: vennRead }, "readSharedAB", "SHARED_AB_KEY");

  /* ---------- writeSharedGroup / writeSharedAB mutation-log parity ---------- */

  function runWriteScenario(label, key, writeCall, oldSet, sc) {
    var isGroup = key === store.SHARED_GROUP_KEY;
    var preamble = isGroup ? keyPreamble("SHARED_GROUP_KEY", key) : keyPreamble("SHARED_AB_KEY", key);
    var envNew = buildEnv(key, sc);
    var newNT = ctx.loadNew({ globals: { document: envNew.document, localStorage: envNew.localStorage } });
    writeCall(newNT.store);
    var newStorageLog = envNew.storage._log, newCookieLog = envNew.jar._log;

    Object.keys(oldSet).forEach(function (oldLabel) {
      var envOld = buildEnv(key, sc);
      var writeNames = isGroup ? ["writeSharedGroup", "readSharedGroup"] : ["writeSharedAB", "readSharedAB"];
      var old = freshFns(oldSet[oldLabel], writeNames, { document: envOld.document, localStorage: envOld.localStorage }, preamble);
      writeCall(old);
      ctx.eq(label + " storage log vs " + oldLabel, newStorageLog, envOld.storage._log);
      ctx.eq(label + " cookie log vs " + oldLabel, newCookieLog, envOld.jar._log);
    });
  }

  var writeGroupSources = { Cayley: extractOnce(ctx, CAYLEY_PATH, ["writeSharedGroup", "readSharedGroup"]), EqWheel: extractOnce(ctx, EQWHEEL_PATH, ["writeSharedGroup", "readSharedGroup"]) };
  runWriteScenario("writeSharedGroup fresh write", store.SHARED_GROUP_KEY,
    function (impl) { impl.writeSharedGroup("additive", 6); }, writeGroupSources, {});
  runWriteScenario("writeSharedGroup skip when matching", store.SHARED_GROUP_KEY,
    function (impl) { impl.writeSharedGroup("additive", 6); }, writeGroupSources,
    { cookiePairs: [store.SHARED_GROUP_KEY + "=" + encodeURIComponent(groupPayload("additive", 6))], storageValue: groupPayload("additive", 6) });
  runWriteScenario("writeSharedGroup: throwing localStorage still writes cookie", store.SHARED_GROUP_KEY,
    function (impl) { impl.writeSharedGroup("multiplicative", 12); }, writeGroupSources,
    { storageOpts: { throwOnSet: true } });
  runWriteScenario("writeSharedGroup: overwrite a disagreeing prior value", store.SHARED_GROUP_KEY,
    function (impl) { impl.writeSharedGroup("multiplicative", 20); }, writeGroupSources,
    { cookiePairs: [store.SHARED_GROUP_KEY + "=" + encodeURIComponent(groupPayload("additive", 6))], storageValue: groupPayload("additive", 6) });
  runWriteScenario("writeSharedGroup: N=1 write", store.SHARED_GROUP_KEY,
    function (impl) { impl.writeSharedGroup("additive", 1); }, writeGroupSources, {});

  var writeAbSources = { EA: extractOnce(ctx, EA_PATH, ["writeSharedAB", "readSharedAB"]), Venn: extractOnce(ctx, VENN_PATH, ["writeSharedAB", "readSharedAB"]) };
  runWriteScenario("writeSharedAB fresh write", store.SHARED_AB_KEY,
    function (impl) { impl.writeSharedAB(6, 9); }, writeAbSources, {});
  runWriteScenario("writeSharedAB skip when matching", store.SHARED_AB_KEY,
    function (impl) { impl.writeSharedAB(6, 9); }, writeAbSources,
    { cookiePairs: [store.SHARED_AB_KEY + "=" + encodeURIComponent(abPayload(6, 9))], storageValue: abPayload(6, 9) });
  runWriteScenario("writeSharedAB: throwing localStorage still writes cookie", store.SHARED_AB_KEY,
    function (impl) { impl.writeSharedAB(3, 4); }, writeAbSources,
    { storageOpts: { throwOnSet: true } });
  runWriteScenario("writeSharedAB: overwrite a disagreeing prior value", store.SHARED_AB_KEY,
    function (impl) { impl.writeSharedAB(10, 15); }, writeAbSources,
    { cookiePairs: [store.SHARED_AB_KEY + "=" + encodeURIComponent(abPayload(6, 9))], storageValue: abPayload(6, 9) });
  runWriteScenario("writeSharedAB: a=1,b=0 write", store.SHARED_AB_KEY,
    function (impl) { impl.writeSharedAB(1, 0); }, writeAbSources, {});

  /* ---------- readModeNParams parity (Cayley / Equivalence Wheel) ---------- */

  var modeNQueries = [
    "", "?mode=additive&n=6", "?n=6&mode=multiplicative", "?mode=additive",
    "?mode=bogus&n=6", "?mode=additive&n=0", "?mode=additive&n=-3",
    "?mode=additive&n=7.9", "?mode=additive&n=abc", "?mode=%61dditive&n=6",
    "?mode=additive&n=%E0%A4%A", "?xmode=additive&n=6", "?mode=additive&n=6#frag",
    "?mode=multiplicative&n=120&theme=day", "?mode=additive&n=1", "?mode=multiplicative&n=1",
    "?mode=ADDITIVE&n=6", "?mode=additive&n=+6", "?mode=additive&n= 6",
    "?mode=additive&N=6", "?mode=additive&n=6.0", "?n=6&mode=additive&extra=1",
    "?mode=multiplicative&n=6&mode=additive", "?mode=additive&n=6&n=8",
    "?mode=additive&n=2147483647", "?mode=multiplicative&n=0.5",
    "?mode=additive&n=6;drop", "?mode=&n=6"
  ];
  var modeNFns = { Cayley: extractOnce(ctx, CAYLEY_PATH, ["readModeNParams"]), EqWheel: extractOnce(ctx, EQWHEEL_PATH, ["readModeNParams"]) };
  modeNQueries.forEach(function (q) {
    var got = ctx.loadNew({ globals: { location: ctx.makeLocation(q) } }).store.readModeNParams();
    Object.keys(modeNFns).forEach(function (label) {
      var old = freshFns(modeNFns[label], ["readModeNParams"], { location: ctx.makeLocation(q) });
      ctx.eq("readModeNParams(" + JSON.stringify(q) + ") vs " + label, got, old.readModeNParams());
    });
  });

  /* ---------- readABParams parity (Euclidean Algorithm / Venn Diagram) ---------- */

  var abQueries = [
    "", "?a=6&b=9", "?b=9&a=6", "?a=6", "?a=bogus&b=9",
    "?a=6&b=0", "?a=6&b=-3", "?a=6.9&b=3", "?a=abc&b=3", "?a=%36&b=9",
    "?xa=6&b=9", "?a=6&b=9#frag", "?a=6&b=9&theme=day",
    "?a=0&b=0", "?a=5&b=0", "?a=-1&b=4", "?a=1e3&b=2", "?a=12.9&b=3", "?b=3&a=4",
    "?a=%E0%A4%A&b=1", "?a=1&b=1", "?a=0&b=1", "?a=1&b=0", "?A=6&b=9",
    "?a=+6&b=9", "?a= 6&b=9", "?a=6&b=6#x", "?a=99999999999999999999&b=1",
    "?a=6&b=9&a=1", "?a=-0&b=5"
  ];
  var eaAbFns = extractOnce(ctx, EA_PATH, ["readABParams"]);
  var vennAbFns = extractOnce(ctx, VENN_PATH, ["readABParams"]);
  abQueries.forEach(function (q) {
    var loc = ctx.makeLocation(q);
    var gotTrue = ctx.loadNew({ globals: { location: loc } }).store.readABParams(true);
    var gotDefault = ctx.loadNew({ globals: { location: loc } }).store.readABParams();
    var gotFalse = ctx.loadNew({ globals: { location: loc } }).store.readABParams(false);

    var oldEa = freshFns(eaAbFns, ["readABParams"], { location: loc });
    ctx.eq("readABParams(true, " + JSON.stringify(q) + ") vs EA", gotTrue, oldEa.readABParams());

    var oldVenn = freshFns(vennAbFns, ["readABParams"], { location: loc });
    var wantVenn = oldVenn.readABParams();
    ctx.eq("readABParams(" + JSON.stringify(q) + ") vs Venn", gotDefault, wantVenn);
    ctx.eq("readABParams(false, " + JSON.stringify(q) + ") vs Venn", gotFalse, wantVenn);
  });

  /* ---------- readMigrating parity (Venn Diagram) ---------- */

  var vennMigrateFns = extractOnce(ctx, VENN_PATH, ["readMigrating"]);
  var migrateScenarios = [
    { label: "key present", seed: function (s) { s.setItem("k", "v1"); } },
    { label: "key absent with legacy present (copy-forward)", seed: function (s) { s.setItem("legacy", "v2"); } },
    { label: "neither present", seed: function () {} },
    { label: "getItem throwing", storageOpts: { throwOnGet: true }, seed: function () {} },
    { label: "setItem throwing during copy-forward", storageOpts: { throwOnSet: true }, seed: function (s) { s.setItem("legacy", "v3"); } }
  ];
  migrateScenarios.forEach(function (sc) {
    var newStorage = ctx.makeStorage(sc.storageOpts || {});
    if (sc.storageOpts && sc.storageOpts.throwOnSet) {
      // Seed legacy BEFORE throwOnSet would block it — build an unblocked
      // storage first, seed, then swap in a throwing wrapper that shares
      // the same underlying data.
      var seedStorage = ctx.makeStorage({});
      sc.seed(seedStorage);
      newStorage = ctx.makeStorage({ throwOnSet: true });
      Object.keys(seedStorage._data).forEach(function (k) { newStorage._data[k] = seedStorage._data[k]; });
    } else {
      sc.seed(newStorage);
    }
    var gotNew = ctx.loadNew({ globals: { localStorage: newStorage } }).store.readMigrating("k", "legacy");

    var oldStorage = ctx.makeStorage(sc.storageOpts || {});
    if (sc.storageOpts && sc.storageOpts.throwOnSet) {
      var seedStorage2 = ctx.makeStorage({});
      sc.seed(seedStorage2);
      oldStorage = ctx.makeStorage({ throwOnSet: true });
      Object.keys(seedStorage2._data).forEach(function (k) { oldStorage._data[k] = seedStorage2._data[k]; });
    } else {
      sc.seed(oldStorage);
    }
    var old = freshFns(vennMigrateFns, ["readMigrating"], { localStorage: oldStorage });
    var wantOld = old.readMigrating("k", "legacy");
    ctx.eq("readMigrating scenario \"" + sc.label + "\"", gotNew, wantOld);
    ctx.eq("readMigrating scenario \"" + sc.label + "\" storage log", newStorage._log, oldStorage._log);
  });

  // Storage-event path: a handler passes e.newValue, which must win over a
  // cookie that has not caught up with the writing tab yet (the live-sync
  // race found in the 07 browser UAT).
  (function () {
    var jar = ctx.makeCookieJar({});
    var storage = ctx.makeStorage({});
    var NTe = ctx.loadNew({ globals: { document: jar.document, localStorage: storage } });
    jar.document.cookie = "ab-params=" + encodeURIComponent('{"a":144,"b":12}') + ";path=/";
    jar.document.cookie = "group-params=" + encodeURIComponent('{"mode":"additive","N":30}') + ";path=/";
    var cookieWrites = jar._log.length;
    ctx.eq("readSharedAB(): stale cookie still wins on a plain read", NTe.store.readSharedAB(), { a: 144, b: 12 });
    ctx.eq("readSharedAB(newValue): event value wins over stale cookie", NTe.store.readSharedAB('{"a":144,"b":60}'), { a: 144, b: 60 });
    ctx.eq("readSharedGroup(newValue): event value wins over stale cookie", NTe.store.readSharedGroup('{"mode":"multiplicative","N":12}'), { mode: "multiplicative", N: 12 });
    ctx.eq("readSharedAB(newValue): removed key (null) -> null", NTe.store.readSharedAB(null), null);
    ctx.eq("readSharedAB(newValue): malformed JSON -> null", NTe.store.readSharedAB("{oops"), null);
    ctx.eq("readSharedAB(newValue): validator still applies", NTe.store.readSharedAB('{"a":0,"b":0}'), null);
    ctx.eq("readSharedGroup(newValue): validator still applies", NTe.store.readSharedGroup('{"mode":"other","N":5}'), null);
    ctx.eq("event path writes nothing", [jar._log.length, storage._log.length], [cookieWrites, 0]);
  })();
};
