#!/usr/bin/env node
/* harness.js — dev-only Node parity harness for Phase 7's shared JS module
 * refactor. Never shipped, never referenced by any .html page. Uses only
 * Node built-ins (fs, path, vm, util, child_process).
 *
 * When required by another script, exports the ctx toolkit (ROOT,
 * baseCommit, gitShow, extractFunctions, loadOld, loadNew, the DOM/storage/
 * cookie/location stubs, seededRandom, eq, sameOutcome).
 *
 * When run directly:
 *   node harness.js            -> runs every checks/*.check.js
 *   node harness.js core       -> runs only checks/core.check.js
 *   node harness.js core svg   -> runs the named checks
 * An unknown check name is an error (exit 1).
 */
"use strict";

var fs = require("fs");
var path = require("path");
var vm = require("vm");
var util = require("util");
var cp = require("child_process");

var ROOT = path.resolve(__dirname, "..", "..", "..");

/* ---------- git / BASE helpers ---------- */

function gitRun(args) {
  return cp.execFileSync("git", args, { cwd: ROOT, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
}

// BASE = the pre-phase commit = parent of the commit that first added
// assets/nt-core.js. While nt-core.js is still uncommitted (no such commit
// exists yet), BASE = HEAD.
var _baseCommitCache = null;
function baseCommit() {
  if (_baseCommitCache) return _baseCommitCache;
  var out = "";
  try {
    out = gitRun(["log", "--diff-filter=A", "--format=%H", "--", "assets/nt-core.js"]);
  } catch (e) {
    out = "";
  }
  var lines = out.split("\n").map(function (s) { return s.trim(); }).filter(Boolean);
  var sha;
  if (lines.length === 0) {
    sha = gitRun(["rev-parse", "HEAD"]).trim();
  } else {
    var addCommit = lines[lines.length - 1];
    sha = gitRun(["rev-parse", addCommit + "^"]).trim();
  }
  _baseCommitCache = sha;
  return sha;
}

function gitShow(relPath) {
  var base = baseCommit();
  return gitRun(["show", base + ":" + relPath]);
}

function gitLsTree(relDir, base) {
  var out = gitRun(["ls-tree", "-r", "--name-only", base, "--", relDir]);
  return out.split("\n").map(function (s) { return s.trim(); }).filter(Boolean);
}

/* ---------- function-body extraction ---------- */

// extractFunctions(src, names): for each name, find its top-level
// `function <name>(` declaration and slice to the matching closing brace
// via brace counting. Throws a descriptive error when a name is missing.
function extractFunctions(src, names) {
  var out = {};
  for (var i = 0; i < names.length; i++) {
    var name = names[i];
    var re = new RegExp("function\\s+" + name + "\\s*\\(");
    var m = re.exec(src);
    if (!m) {
      throw new Error("extractFunctions: function '" + name + "' not found in source");
    }
    var start = m.index;
    var braceStart = src.indexOf("{", m.index);
    if (braceStart === -1) {
      throw new Error("extractFunctions: no opening brace found for '" + name + "'");
    }
    var depth = 0;
    var end = -1;
    for (var j = braceStart; j < src.length; j++) {
      var ch = src[j];
      if (ch === "{") depth++;
      else if (ch === "}") {
        depth--;
        if (depth === 0) { end = j; break; }
      }
    }
    if (end === -1) {
      throw new Error("extractFunctions: unbalanced braces while extracting '" + name + "'");
    }
    out[name] = src.slice(start, end + 1);
  }
  return out;
}

/* ---------- vm context loaders ---------- */

// loadOld(relPath, names, options): fresh vm context; installs
// options.globals and runs options.preamble; evaluates the extracted
// function bodies from BASE; returns an object of the named functions plus
// `.context` (so a check can reassign a preamble var between runs).
function loadOld(relPath, names, options) {
  options = options || {};
  var src = gitShow(relPath);
  var fns = extractFunctions(src, names);
  var context = {};
  if (options.globals) {
    for (var k in options.globals) {
      if (Object.prototype.hasOwnProperty.call(options.globals, k)) context[k] = options.globals[k];
    }
  }
  vm.createContext(context);
  if (options.preamble) {
    vm.runInContext(options.preamble, context);
  }
  var body = names.map(function (n) { return fns[n]; }).join("\n\n");
  vm.runInContext(body, context);
  var result = { context: context };
  names.forEach(function (name) { result[name] = context[name]; });
  return result;
}

// loadNew(options): fresh vm context whose global object doubles as
// `window`; installs options.globals; runs every existing assets/nt-*.js
// file in canonical order core, bigint, svg, store, layout (skipping files
// not yet created); returns context.NT.
function loadNew(options) {
  options = options || {};
  var context = {};
  context.window = context;
  if (options.globals) {
    for (var k in options.globals) {
      if (Object.prototype.hasOwnProperty.call(options.globals, k)) context[k] = options.globals[k];
    }
  }
  vm.createContext(context);
  var moduleOrder = ["nt-core.js", "nt-bigint.js", "nt-svg.js", "nt-store.js", "nt-layout.js"];
  moduleOrder.forEach(function (fname) {
    var p = path.join(ROOT, "assets", fname);
    if (!fs.existsSync(p)) return;
    var src = fs.readFileSync(p, "utf8");
    vm.runInContext(src, context, { filename: p });
  });
  return context.NT;
}

/* ---------- stubs ---------- */

function makeDom() {
  return {
    createElementNS: function (ns, tag) {
      return {
        ns: ns,
        tag: tag,
        attrs: {},
        setAttribute: function (k, v) { this.attrs[k] = String(v); }
      };
    }
  };
}

function makeStorage(opts) {
  opts = opts || {};
  var data = {};
  var log = [];
  return {
    getItem: function (k) {
      if (opts.throwOnGet) throw new Error("storage getItem blocked");
      log.push(["get", k]);
      return Object.prototype.hasOwnProperty.call(data, k) ? data[k] : null;
    },
    setItem: function (k, v) {
      if (opts.throwOnSet) throw new Error("storage setItem blocked");
      data[k] = String(v);
      log.push(["set", k, data[k]]);
    },
    removeItem: function (k) {
      delete data[k];
      log.push(["remove", k]);
    },
    _log: log,
    _data: data
  };
}

function makeCookieJar(opts) {
  opts = opts || {};
  var store = {};
  var order = [];
  var log = [];
  var doc = {};
  Object.defineProperty(doc, "cookie", {
    get: function () {
      if (opts.throwOnGet) throw new Error("cookie get blocked");
      return order.map(function (k) { return k + "=" + store[k]; }).join("; ");
    },
    set: function (raw) {
      if (opts.throwOnSet) throw new Error("cookie set blocked");
      log.push(raw);
      var firstPart = String(raw).split(";")[0];
      var eqIdx = firstPart.indexOf("=");
      if (eqIdx === -1) return;
      var k = firstPart.slice(0, eqIdx);
      var v = firstPart.slice(eqIdx + 1);
      if (order.indexOf(k) === -1) order.push(k);
      store[k] = v;
    }
  });
  return { document: doc, _log: log, _store: store };
}

function makeLocation(search) {
  return { search: search || "" };
}

function seededRandom(seed) {
  var a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6D2B79F5) | 0;
    var t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ---------- assertion helpers (BigInt-safe) ---------- */

function safeStringify(v) {
  try {
    return JSON.stringify(v, function (k, val) {
      return typeof val === "bigint" ? val.toString() + "n" : val;
    });
  } catch (e) {
    return String(v);
  }
}

var CURRENT_CHECK = { name: "unknown", count: 0 };

function eq(label, got, want) {
  CURRENT_CHECK.count++;
  if (!util.isDeepStrictEqual(got, want)) {
    console.log("HARNESS FAIL " + CURRENT_CHECK.name + " " + label + ": expected " +
      safeStringify(want) + " got " + safeStringify(got));
    process.exit(1);
  }
}

function runSafe(fn, args) {
  try {
    return { value: fn.apply(null, args) };
  } catch (e) {
    return { error: e && e.message };
  }
}

function sameOutcome(label, fnA, fnB, args) {
  CURRENT_CHECK.count++;
  args = args || [];
  var a = runSafe(fnA, args);
  var b = runSafe(fnB, args);
  if (!util.isDeepStrictEqual(a, b)) {
    console.log("HARNESS FAIL " + CURRENT_CHECK.name + " " + label + ": expected " +
      safeStringify(b) + " got " + safeStringify(a));
    process.exit(1);
  }
}

/* ---------- toolkit export ---------- */

var toolkit = {
  ROOT: ROOT,
  baseCommit: baseCommit,
  gitShow: gitShow,
  gitLsTree: gitLsTree,
  extractFunctions: extractFunctions,
  loadOld: loadOld,
  loadNew: loadNew,
  makeDom: makeDom,
  makeStorage: makeStorage,
  makeCookieJar: makeCookieJar,
  makeLocation: makeLocation,
  seededRandom: seededRandom,
  eq: eq,
  sameOutcome: sameOutcome
};

module.exports = toolkit;

/* ---------- CLI ---------- */

function main() {
  var args = process.argv.slice(2);
  var checksDir = path.join(__dirname, "checks");
  var available = fs.existsSync(checksDir)
    ? fs.readdirSync(checksDir)
      .filter(function (f) { return /\.check\.js$/.test(f); })
      .map(function (f) { return f.replace(/\.check\.js$/, ""); })
      .sort()
    : [];
  var toRun = args.length ? args : available;
  var unknown = toRun.filter(function (n) { return available.indexOf(n) === -1; });
  if (unknown.length) {
    console.error("Unknown check(s): " + unknown.join(", ") + " (available: " + available.join(", ") + ")");
    process.exit(1);
  }
  if (toRun.length === 0) {
    console.error("No checks found under " + checksDir);
    process.exit(1);
  }

  console.log("BASE " + baseCommit());

  var total = 0;
  toRun.forEach(function (name) {
    CURRENT_CHECK.name = name;
    CURRENT_CHECK.count = 0;
    var checkFn = require(path.join(checksDir, name + ".check.js"));
    checkFn(toolkit);
    if (CURRENT_CHECK.count === 0) {
      console.log("HARNESS FAIL " + name + ": 0 assertions");
      process.exit(1);
    }
    console.log("HARNESS PASS " + name + ": " + CURRENT_CHECK.count + " assertions");
    total += CURRENT_CHECK.count;
  });

  console.log("HARNESS PASS total=" + total);
  process.exit(0);
}

if (require.main === module) {
  main();
}
