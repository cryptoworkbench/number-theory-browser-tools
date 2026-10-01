/* checks/namespace.check.js — validation of NT namespace locking (WR-01).
 * Tests that each shared module (core, bigint, svg, store, layout) is
 * properly sealed: its property is non-writable/non-configurable, its
 * value is frozen, strict-mode assignments throw, sloppy-mode silently
 * ignores.
 * Exports function(ctx) per harness.js's contract.
 */
"use strict";

var vm = require("vm");
var fs = require("fs");
var path = require("path");

module.exports = function (ctx) {
  var NT = ctx.loadNew();

  var moduleNames = ["core", "bigint", "svg", "store", "layout", "i18n"];

  /* ---------- Namespace structure ---------- */

  // Verify all 6 modules exist and NT is still extensible
  var ntKeys = Object.keys(NT).sort();
  var expectedKeys = moduleNames.slice().sort();
  ctx.eq("NT has exactly the 6 module slots", ntKeys, expectedKeys);
  ctx.eq("NT is extensible", Object.isExtensible(NT), true);
  ctx.eq("NT is not frozen", Object.isFrozen(NT), false);

  /* ---------- Property descriptors ---------- */

  moduleNames.forEach(function (name) {
    var desc = Object.getOwnPropertyDescriptor(NT, name);
    ctx.eq(name + " property exists", desc !== undefined, true);
    ctx.eq(name + " is own property", Object.prototype.hasOwnProperty.call(NT, name), true);
    ctx.eq(name + " descriptor.writable is false", desc.writable, false);
    ctx.eq(name + " descriptor.configurable is false", desc.configurable, false);
    ctx.eq(name + " descriptor.enumerable is true", desc.enumerable, true);
    ctx.eq(name + " has a value", desc.value !== undefined, true);
    ctx.eq(name + " value is an object", typeof desc.value === "object" && desc.value !== null, true);
  });

  /* ---------- Frozen values ---------- */

  moduleNames.forEach(function (name) {
    var module = NT[name];
    ctx.eq(name + " object is frozen", Object.isFrozen(module), true);
  });

  /* ---------- Strict-mode property mutation tests ---------- */
  // Run these inside a vm context where the modules are loaded,
  // so property semantics are accurate to the actual browser environment.

  // Build a test context and load all modules
  var testContext = {};
  testContext.window = testContext;
  vm.createContext(testContext);

  var moduleOrder = ["nt-core.js", "nt-bigint.js", "nt-svg.js", "nt-store.js", "nt-layout.js", "nt-i18n.js"];
  var ROOT = ctx.ROOT;
  moduleOrder.forEach(function (fname) {
    var p = path.join(ROOT, "assets", fname);
    if (!fs.existsSync(p)) return;
    var src = fs.readFileSync(p, "utf8");
    vm.runInContext(src, testContext, { filename: p });
  });

  moduleNames.forEach(function (name) {
    /* Strict-mode assignment should throw TypeError and leave value unchanged */
    var strictAssignCode =
      "(function() {" +
      "  'use strict';" +
      "  var originalValue = NT['" + name + "'];" +
      "  try {" +
      "    NT['" + name + "'] = {};" +
      "    return { threw: false, valueChanged: NT['" + name + "'] !== originalValue };" +
      "  } catch (e) {" +
      "    return { threw: true, valueChanged: NT['" + name + "'] !== originalValue, errorType: e.constructor.name };" +
      "  }" +
      "})()";

    var result = vm.runInContext(strictAssignCode, testContext);
    ctx.eq(name + " strict-mode assignment throws TypeError", result.threw, true);
    ctx.eq(name + " strict-mode assignment value unchanged", result.valueChanged, false);
    ctx.eq(name + " strict-mode assignment error is TypeError", result.errorType, "TypeError");

    /* Strict-mode delete should throw TypeError */
    var strictDeleteCode =
      "(function() {" +
      "  'use strict';" +
      "  try {" +
      "    delete NT['" + name + "'];" +
      "    return { threw: false, valueStillThere: NT['" + name + "'] !== undefined };" +
      "  } catch (e) {" +
      "    return { threw: true, valueStillThere: NT['" + name + "'] !== undefined, errorType: e.constructor.name };" +
      "  }" +
      "})()";

    var delResult = vm.runInContext(strictDeleteCode, testContext);
    ctx.eq(name + " strict-mode delete throws TypeError", delResult.threw, true);
    ctx.eq(name + " strict-mode delete property still there", delResult.valueStillThere, true);
    ctx.eq(name + " strict-mode delete error is TypeError", delResult.errorType, "TypeError");
  });

  /* ---------- Sloppy-mode assignment silently ignored ---------- */

  moduleNames.forEach(function (name) {
    var sloppyAssignCode =
      "(function() {" +
      "  var originalValue = NT['" + name + "'];" +
      "  NT['" + name + "'] = {};" +
      "  return { valueChanged: NT['" + name + "'] !== originalValue };" +
      "})()";

    var result = vm.runInContext(sloppyAssignCode, testContext);
    ctx.eq(name + " sloppy-mode assignment silently ignored", result.valueChanged, false);
  });

  /* ---------- Frozen value mutation tests ---------- */

  moduleNames.forEach(function (name) {
    var module = NT[name];

    // Try to add a property to the frozen module
    var canAddProp = false;
    try {
      module.testProp = "value";
      if (module.testProp !== undefined) canAddProp = true;
    } catch (e) {
      // TypeError in strict mode, but we're running in non-strict context
    }
    ctx.eq(name + " module: cannot add property", canAddProp, false);

    // Verify module cannot be extended
    ctx.eq(name + " module is not extensible", Object.isExtensible(module), false);
  });
};
