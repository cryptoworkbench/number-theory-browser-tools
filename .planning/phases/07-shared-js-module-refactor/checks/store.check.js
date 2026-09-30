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

function freshFns(fnsText, names, globals) {
  var context = {};
  if (globals) { for (var k in globals) context[k] = globals[k]; }
  vm.createContext(context);
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

  function runReadScenarios(key, scenarios, oldSet, readName) {
    scenarios.forEach(function (sc) {
      var envNew = buildEnv(key, sc);
      var newNT = ctx.loadNew({ globals: { document: envNew.document, localStorage: envNew.localStorage } });
      var got = newNT.store[readName]();

      Object.keys(oldSet).forEach(function (label) {
        var envOld = buildEnv(key, sc);
        var old = freshFns(oldSet[label], [readName], { document: envOld.document, localStorage: envOld.localStorage });
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
    }
  ];
  runReadScenarios(store.SHARED_GROUP_KEY, groupScenarios, { Cayley: cayleyRead, EqWheel: eqWheelRead }, "readSharedGroup");

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
    }
  ];
  runReadScenarios(store.SHARED_AB_KEY, abScenarios, { EA: eaRead, Venn: vennRead }, "readSharedAB");

  /* ---------- writeSharedGroup / writeSharedAB mutation-log parity ---------- */

  function runWriteScenario(label, key, writeCall, oldSet, sc) {
    var envNew = buildEnv(key, sc);
    var newNT = ctx.loadNew({ globals: { document: envNew.document, localStorage: envNew.localStorage } });
    writeCall(newNT.store);
    var newStorageLog = envNew.storage._log, newCookieLog = envNew.jar._log;

    Object.keys(oldSet).forEach(function (oldLabel) {
      var envOld = buildEnv(key, sc);
      var writeNames = oldLabel === "Cayley" || oldLabel === "EqWheel" ? ["writeSharedGroup", "readSharedGroup"] : ["writeSharedAB", "readSharedAB"];
      var old = freshFns(oldSet[oldLabel], writeNames, { document: envOld.document, localStorage: envOld.localStorage });
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

  var writeAbSources = { EA: extractOnce(ctx, EA_PATH, ["writeSharedAB", "readSharedAB"]), Venn: extractOnce(ctx, VENN_PATH, ["writeSharedAB", "readSharedAB"]) };
  runWriteScenario("writeSharedAB fresh write", store.SHARED_AB_KEY,
    function (impl) { impl.writeSharedAB(6, 9); }, writeAbSources, {});
  runWriteScenario("writeSharedAB skip when matching", store.SHARED_AB_KEY,
    function (impl) { impl.writeSharedAB(6, 9); }, writeAbSources,
    { cookiePairs: [store.SHARED_AB_KEY + "=" + encodeURIComponent(abPayload(6, 9))], storageValue: abPayload(6, 9) });
  runWriteScenario("writeSharedAB: throwing localStorage still writes cookie", store.SHARED_AB_KEY,
    function (impl) { impl.writeSharedAB(3, 4); }, writeAbSources,
    { storageOpts: { throwOnSet: true } });

  /* ---------- readModeNParams parity (Cayley / Equivalence Wheel) ---------- */

  var modeNQueries = [
    "", "?mode=additive&n=6", "?n=6&mode=multiplicative", "?mode=additive",
    "?mode=bogus&n=6", "?mode=additive&n=0", "?mode=additive&n=-3",
    "?mode=additive&n=7.9", "?mode=additive&n=abc", "?mode=%61dditive&n=6",
    "?mode=additive&n=%E0%A4%A", "?xmode=additive&n=6", "?mode=additive&n=6#frag",
    "?mode=multiplicative&n=120&theme=day"
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
    "?a=%E0%A4%A&b=1"
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
};
