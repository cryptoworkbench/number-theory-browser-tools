"use strict";
/*
 * Dev-only regression probe for quick task 261011-hz1: the extra Ring windows
 * of the Cyclic Groups full-screen desktop. Never referenced by any page.
 * Node built-ins + the in-repo harness only.
 *
 * Copies assets/ and the Cyclic Groups page into a scratch site, injects a
 * recorder (storage and cookie writes, errors, a fake fullscreenElement) into
 * every document and a probe into the page, runs headless Chrome over file://
 * and reads PASS/FAIL lines back from a <pre>. On file:// the extra windows'
 * frames are cross-origin to the page, so parent and frames talk by
 * postMessage only.
 */

var fs = require("fs");
var path = require("path");
var cp = require("child_process");
var url = require("url");

var ROOT = path.resolve(__dirname, "..", "..", "..");
var harness = require(path.join(ROOT, ".planning", "phases", "07-shared-js-module-refactor", "harness.js"));

var EXPECTED = 7;
// Headless Chrome's --window-size counts ~143px of window chrome the page
// never sees, so a 1600x1000 viewport needs a window 1143 tall.
var DESKTOP = "1600,1143";
var PAGE_QUERY = "?mode=additive&n=12&gen=5";

/* Runs first inside <head> of every document: records writes and errors, and
   fakes the full-screen element headless Chrome refuses to grant. */
function recorder() {
  window.__hz1Writes = [];
  window.__hz1Errors = [];
  window.__hz1Fs = null;
  var orig = Storage.prototype.setItem;
  //__SEED__
  Storage.prototype.setItem = function (k, v) {
    window.__hz1Writes.push("ls:" + String(k));
    return orig.call(this, k, v);
  };
  try {
    var desc = Object.getOwnPropertyDescriptor(Document.prototype, "cookie");
    Object.defineProperty(Document.prototype, "cookie", {
      configurable: true,
      get: function () { return desc.get.call(this); },
      set: function (v) {
        window.__hz1Writes.push("cookie:" + String(v).split("=")[0]);
        return desc.set.call(this, v);
      }
    });
  } catch (e) { /* cookie wrapper unavailable */ }
  Object.defineProperty(Document.prototype, "fullscreenElement", {
    configurable: true,
    get: function () { return window.__hz1Fs; }
  });
  window.addEventListener("error", function (e) { window.__hz1Errors.push("error: " + (e && e.message)); });
  window.addEventListener("unhandledrejection", function (e) { window.__hz1Errors.push("rejection: " + (e && e.reason)); });
  var origErr = console.error;
  console.error = function () {
    window.__hz1Errors.push("console.error: " + Array.prototype.join.call(arguments, " "));
    return origErr.apply(console, arguments);
  };
}

/* Runs inside the page (serialized with toString), after `load`. */
function pageProbe() {
  var IS_CHILD = /[?&]ringwin=1(&|$)/.test(location.search);
  var FS_KEY = "cyclic-groups-fs-windows";
  var IDS = ["group-controls", "gen-field", "ring-head", "ring-svg", "spin-ruler", "combine-key", "rotate-ctl"];

  function assert(cond, msg) { if (!cond) throw new Error(msg); }
  function eq(actual, expected, what) {
    if (actual !== expected) throw new Error(what + ": got " + JSON.stringify(actual) + ", expected " + JSON.stringify(expected));
  }
  function disp(el) { return el ? getComputedStyle(el).display : "missing"; }

  /* ----- a frame answers command messages from its page ----- */
  if (IS_CHILD) {
    window.addEventListener("message", function (e) {
      if (e.source !== window.parent || !e.data || typeof e.data !== "object" || !e.data.hz1) return;
      var d = e.data;
      if (d.hz1 === "set") {
        var inp = document.getElementById("n-input");
        if (d.mode && document.getElementById("op-toggle").getAttribute("aria-checked") !== String(d.mode === "multiplicative")) {
          document.getElementById("op-toggle").click();
        }
        if (d.n) {
          inp.value = String(d.n);
          inp.dispatchEvent(new Event("input", { bubbles: true }));
          inp.dispatchEvent(new Event("change", { bubbles: true }));
        }
      } else if (d.hz1 === "report") {
        var lines = [];
        function check(name, fn) {
          try { lines.push("PASS " + name + ": " + fn()); }
          catch (err) { lines.push("FAIL " + name + ": " + (err && err.message ? err.message : err)); }
        }
        //__CHILD_CHECKS__
        window.parent.postMessage({ hz1: "lines", nValue: document.getElementById("n-input").value, op: document.getElementById("op-toggle").getAttribute("aria-checked"), lines: lines, writes: window.__hz1Writes.slice(), errors: window.__hz1Errors.slice() }, "*");
      }
    });
    return;
  }

  /* ----- the top page runs the scenarios ----- */
  var out = document.getElementById("hz1-out");
  var lines = [];
  var replies = [];
  window.addEventListener("message", function (e) {
    if (e.data && e.data.hz1 === "lines") replies.push({ source: e.source, data: e.data });
  });

  function wait(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
  function frames() { return Array.prototype.slice.call(document.querySelectorAll(".fs-win.is-frame")); }
  function frameOf(win) { return win.querySelector("iframe"); }
  function post(win, msg) { frameOf(win).contentWindow.postMessage(msg, "*"); }
  function ask(win, msg) {
    var f = frameOf(win);
    var before = replies.length;
    post(win, msg);
    return wait(300).then(function () {
      for (var i = replies.length - 1; i >= before; i--) if (replies[i].source === f.contentWindow) return replies[i].data;
      throw new Error("no report from the frame");
    });
  }
  function titleOf(win) { return win.querySelector(".fs-win-title").textContent; }
  function tasks() { return Array.prototype.slice.call(document.querySelectorAll("#fs-tasks .fs-task")); }
  function items() { return Array.prototype.slice.call(document.querySelectorAll("#fs-menu-panels .fs-menu-item")); }
  function stored() { return JSON.parse(localStorage.getItem(FS_KEY) || "null"); }
  function ringWin() { return document.querySelector('.fs-win[data-panel="ring"]'); }
  function srcParams(win) { return new URL(frameOf(win).getAttribute("src"), location.href).searchParams; }
  function actionItem(i) { return document.querySelectorAll("#fs-menu-actions .fs-menu-item")[i]; }
  function frontWin() { return document.querySelector(".fs-win.is-front"); }
  function fakeFullscreen(on) {
    window.__hz1Fs = on ? document.getElementById("diagram-frame") : null;
    document.dispatchEvent(new Event("fullscreenchange"));
  }
  function addLines(list) { list.forEach(function (l) { lines.push(l); }); }
  var scenarios = [];
  function scenario(name, fn) { scenarios.push({ name: name, fn: fn }); }
  var shared = {};

  //__SCENARIOS__

  function runAll() {
    var i = 0;
    function next() {
      if (i >= scenarios.length) return Promise.resolve();
      var s = scenarios[i++];
      return Promise.resolve().then(s.fn).then(function (msg) {
        if (msg !== undefined) lines.push("PASS " + s.name + ": " + msg);
      }, function (err) {
        lines.push("FAIL " + s.name + ": " + (err && err.message ? err.message : err));
      }).then(next);
    }
    return next();
  }

  window.addEventListener("load", function () {
    wait(500).then(runAll).then(function () {
      lines.push("PASS errors: " + (window.__hz1Errors.length ? "" : "none"));
      if (window.__hz1Errors.length) { lines.pop(); lines.push("FAIL errors: " + window.__hz1Errors.join(" | ")); }
      out.textContent = lines.join("\n");
    }, function (err) {
      out.textContent = lines.concat(["FAIL probe: " + (err && err.message ? err.message : err)]).join("\n");
    });
  });
}

/* The checks a frame runs on itself when asked (R1, R4). */
function CHILD_CHECKS() {
  check("R1 child-layout", function () {
    assert(document.documentElement.classList.contains("is-ringwin"), "html lacks is-ringwin");
    var body = document.querySelector(".ringwin-body");
    assert(body, "no .ringwin-body");
    eq(body.parentNode.id, "diagram-frame", ".ringwin-body parent");
    eq(Array.prototype.map.call(body.children, function (c) { return c.id; }).join(","), IDS.join(","), "ids in order");
    assert(disp(document.querySelector(".fs-row-label")) !== "none", ".fs-row-label hidden");
    assert(disp(document.querySelector(".op-toggle-row")) !== "none", ".op-toggle-row hidden");
    eq(disp(document.querySelector(".op-row")), "none", ".op-row");
    eq(disp(document.getElementById("spin-ruler")), "flex", "spin ruler display");
    [".site-header", ".page-header", ".side", "#fs-taskbar"].forEach(function (sel) {
      var el = document.querySelector(sel);
      assert(!el || el.getClientRects().length === 0, sel + " is visible");
    });
    var r = document.getElementById("ring-svg").getBoundingClientRect();
    assert(r.width > 50 && r.height > 50, "ring svg is " + r.width + "x" + r.height);
    return "ringwin body holds the seven parts, page chrome hidden, ring " + Math.round(r.width) + "x" + Math.round(r.height);
  });
}

/* The top page's scenarios, Task 1. */
function SCENARIOS_1() {
  scenario("R2 open", function () {
    fakeFullscreen(true);
    var tasksBefore = tasks().length, itemsBefore = items().length;
    eq(frames().length, 0, "frame windows before");
    actionItem(0).click();
    eq(frames().length, 1, "frame windows after");
    eq(tasks().length, tasksBefore + 1, "task buttons");
    eq(items().length, itemsBefore + 1, "menu items");
    var win = frames()[0], p = srcParams(win);
    eq(p.get("ringwin"), "1", "ringwin");
    eq(p.get("mode"), "additive", "mode");
    eq(p.get("n"), "12", "n");
    eq(p.get("gen"), "5", "gen");
    ["preview", "theme", "lang", "noshare"].forEach(function (k) { assert(!p.has(k), "src carries " + k); });
    eq(titleOf(win), "Cyclic Group ⟨ℤ/12ℤ, +⟩", "title");
    assert(win.classList.contains("is-front"), "not the front window");
    shared.groupParams = localStorage.getItem("group-params");
    // Let the frame load before it is sent anything.
    return wait(1500).then(function () { return "one frame window, title " + titleOf(win); });
  });
  scenario("R3 independent", function () {
    var win = frames()[0];
    post(win, { hz1: "set", n: 15, mode: "multiplicative" });
    return wait(900).then(function () {
      var want = "Ring ⟨ℤ/15ℤ, ×⟩";
      eq(titleOf(win), want, "extra title");
      eq(tasks()[1].querySelector(".fs-task-label").textContent, want, "task label");
      eq(items()[1].lastChild.textContent, want, "menu item");
      eq(document.getElementById("n-input").value, "12", "page n");
      eq(document.getElementById("op-toggle").getAttribute("aria-checked"), "false", "page op");
      eq(titleOf(ringWin()), "Cyclic Group ⟨ℤ/12ℤ, +⟩", "original title");
      eq(localStorage.getItem("group-params"), shared.groupParams, "group-params");
      return "extra reads " + want + ", the original ring and group-params are unchanged";
    });
  });
  scenario("R4 child", function () {
    var win = frames()[0];
    return ask(win, { hz1: "report" }).then(function (r) {
      addLines(r.lines);
      eq(r.writes.join(","), "", "the frame's storage and cookie writes");
      eq(r.errors.join(" | "), "", "the frame's errors");
      return "no write from the frame";
    });
  });
  scenario("R5 remembered", function () {
    return wait(600).then(function () {
      var st = stored();
      assert(st && Array.isArray(st.extras) && st.extras.length === 1, "extras: " + JSON.stringify(st && st.extras));
      var q = new URLSearchParams(st.extras[0].q);
      eq(q.get("mode"), "multiplicative", "stored mode");
      eq(q.get("n"), "15", "stored n");
      assert(!q.has("ringwin"), "stored q keeps ringwin");
      return "extras holds " + st.extras[0].key + " at mode=multiplicative n=15";
    });
  });
  scenario("R6 close", function () {
    var tasksBefore = tasks().length, itemsBefore = items().length;
    frames()[0].querySelector(".fs-win-btn.is-close").click();
    eq(frames().length, 0, "frame windows");
    eq(document.querySelectorAll(".fs-win iframe").length, 0, "iframes");
    eq(tasks().length, tasksBefore - 1, "task buttons");
    eq(items().length, itemsBefore - 1, "menu items");
    eq(stored().extras.length, 0, "stored extras");
    assert(ringWin() && !ringWin().hidden, "the original Ring window is gone");
    return "window, frame, task button and menu item removed; the original Ring window remains";
  });
}

function bodyOf(fn) {
  var s = fn.toString();
  return s.slice(s.indexOf("{") + 1, s.lastIndexOf("}"));
}

function buildSite(opts) {
  var siteRoot = harness.mkScratch("hz1-site-");
  fs.cpSync(path.join(ROOT, "assets"), path.join(siteRoot, "assets"), { recursive: true });
  var src = fs.readFileSync(path.join(ROOT, "Cyclic Groups", "cyclic-groups.html"), "utf8");

  var recSrc = recorder.toString().replace("//__SEED__", function () { return SEED_SRC; });
  var probeSrc = pageProbe.toString()
    .replace("//__CHILD_CHECKS__", function () { return bodyOf(CHILD_CHECKS); })
    .replace("//__SCENARIOS__", function () { return SCENARIO_BODIES.join("\n"); });
  var probe = "(" + probeSrc + ")();";

  var headAt = src.indexOf("<head>");
  if (headAt < 0) throw new Error("no opening head tag in cyclic-groups.html");
  headAt += "<head>".length;
  var bodyAt = src.lastIndexOf("</body>");
  if (bodyAt < 0) throw new Error("no closing body tag in cyclic-groups.html");

  var page = src.slice(0, headAt) +
    "\n<script>(" + recSrc + ")();</script>\n" +
    src.slice(headAt, bodyAt) +
    '<pre id="hz1-out"></pre>\n<script>\n' + probe + "\n</script>\n" +
    src.slice(bodyAt);
  var destDir = path.join(siteRoot, "Cyclic Groups");
  fs.mkdirSync(destDir, { recursive: true });
  var dest = path.join(destDir, "cyclic-groups.html");
  fs.writeFileSync(dest, page);
  return { root: siteRoot, page: dest };
}

// The recorder's seed: nothing yet (later tasks seed corrupt desktop state).
var SEED_SRC = "";
var SCENARIO_BODIES = [bodyOf(SCENARIOS_1)];

function unescapeHtml(s) {
  return s.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, "&");
}

function runChrome(fileUrl, size, profileDir) {
  var own = !profileDir;
  if (own) profileDir = harness.mkScratch("hz1-profile-");
  var args = [
    "--headless=new", "--disable-gpu", "--no-sandbox",
    "--user-data-dir=" + profileDir,
    "--virtual-time-budget=20000",
    "--window-size=" + size,
    "--dump-dom",
    fileUrl
  ];
  var res = cp.spawnSync("google-chrome", args, {
    encoding: "utf8", maxBuffer: 200 * 1024 * 1024, timeout: 120000, env: harness.chromeEnv()
  });
  if (own) { try { fs.rmSync(profileDir, { recursive: true, force: true }); } catch (e) { /* best effort */ } }
  return res.stdout || "";
}

function readOut(dom, label) {
  var m = /<pre id="hz1-out"[^>]*>([\s\S]*?)<\/pre>/.exec(dom);
  if (!m || !m[1].trim()) return ["FAIL " + label + ": probe output <pre id=\"hz1-out\"> missing or empty in the dumped DOM"];
  return unescapeHtml(m[1]).split("\n").filter(function (l) { return l.length > 0; });
}

function main() {
  var site = buildSite();
  var pageUrl = url.pathToFileURL(site.page).href;
  var all = [];

  // Run A: the page over file://, in a fresh profile.
  all = all.concat(readOut(runChrome(pageUrl + PAGE_QUERY, DESKTOP), "run A"));

  all.forEach(function (l) { console.log(l); });
  var fails = all.filter(function (l) { return /^FAIL/.test(l); }).length;
  var passes = all.filter(function (l) { return /^PASS/.test(l); }).length;
  if (fails > 0 || passes !== EXPECTED) {
    console.log("RINGWIN-PROBE FAIL (" + passes + " pass, " + fails + " fail, expected " + EXPECTED + " scenarios)");
    process.exit(1);
  }
  console.log("RINGWIN-PROBE PASS (" + passes + " scenarios)");
  process.exit(0);
}

main();
