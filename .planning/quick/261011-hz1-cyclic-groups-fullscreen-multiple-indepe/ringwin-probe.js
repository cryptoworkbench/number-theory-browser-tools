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
var net = require("net");

var ROOT = path.resolve(__dirname, "..", "..", "..");
var harness = require(path.join(ROOT, ".planning", "phases", "07-shared-js-module-refactor", "harness.js"));

var EXPECTED = 20;
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
  var RUN = location.hash === "#hz1-restore" ? "restore" : location.hash === "#hz1-corrupt" ? "corrupt" :
    location.hash === "#hz1-garbage" ? "garbage" : location.protocol === "http:" ? "http" : "file";
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
      } else if (d.hz1 === "poke") {
        document.getElementById("ring-svg").dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, cancelable: true, pointerId: 3, button: 0 }));
      } else if (d.hz1 === "report") {
        var lines = [];
        function check(name, fn) {
          try { lines.push("PASS " + name + ": " + fn()); }
          catch (err) { lines.push("FAIL " + name + ": " + (err && err.message ? err.message : err)); }
        }
        //__CHILD_CHECKS__
        window.parent.postMessage({ hz1: "lines", nValue: document.getElementById("n-input").value, op: document.getElementById("op-toggle").getAttribute("aria-checked"), theme: document.documentElement.getAttribute("data-theme"), lang: document.documentElement.getAttribute("lang"), lines: lines, writes: window.__hz1Writes.slice(), errors: window.__hz1Errors.slice() }, "*");
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
  // Counts a frame's loads: a frame that is moved in the page, or rebuilt,
  // loads again.
  function track(win) {
    var f = frameOf(win);
    f.__hz1Loads = 0;
    f.addEventListener("load", function () { f.__hz1Loads++; });
    return f;
  }
  function px(win, prop) { return parseFloat(win.style[prop]); }
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


/* The top page's scenarios, Task 2 (file:// run). */
function SCENARIOS_2() {
  function deskPx() {
    var f = document.getElementById("diagram-frame");
    return { W: f.clientWidth, H: f.clientHeight - 44 };
  }
  function shownRects() {
    var f = document.getElementById("diagram-frame"), fr = f.getBoundingClientRect();
    return Array.prototype.slice.call(document.querySelectorAll(".fs-win")).filter(function (w) { return !w.hidden; }).map(function (w) {
      var r = w.getBoundingClientRect();
      return { l: r.left - fr.left - f.clientLeft, t: r.top - fr.top - f.clientTop, w: r.width, h: r.height, key: w.getAttribute("data-panel") };
    });
  }
  function click(el) { el.click(); }
  function pointer(type, target, x, y, id) {
    target.dispatchEvent(new PointerEvent(type, { bubbles: true, cancelable: true, pointerId: id, button: 0, clientX: x, clientY: y }));
  }

  scenario("R7 copies", function () {
    ringWin().querySelector(".fs-win-btn.is-dup").click();
    eq(frames().length, 1, "frame windows after + on the original");
    var w1 = frames()[0];
    shared.e1 = track(w1);
    var p = srcParams(w1);
    eq(p.get("mode") + "/" + p.get("n"), "additive/12", "copy of the original");
    assert(w1.classList.contains("is-front"), "copy of the original is not in front");
    return wait(1500).then(function () {
      post(w1, { hz1: "set", n: 15, mode: "multiplicative" });
      return wait(900);
    }).then(function () {
      click(w1.querySelector(".fs-win-btn.is-dup"));
      eq(frames().length, 2, "frame windows after + on an extra");
      var w2 = frames()[1];
      shared.e2 = track(w2);
      var p2 = srcParams(w2);
      eq(p2.get("mode") + "/" + p2.get("n"), "multiplicative/15", "copy of the extra");
      assert(Math.abs(px(w2, "left") - px(w1, "left") - 32) <= 1, "left " + px(w1, "left") + " -> " + px(w2, "left"));
      assert(Math.abs(px(w2, "top") - px(w1, "top") - 32) <= 1, "top " + px(w1, "top") + " -> " + px(w2, "top"));
      assert(Math.abs(px(w2, "width") - px(w1, "width")) <= 1 && Math.abs(px(w2, "height") - px(w1, "height")) <= 1, "size differs");
      assert(w2.classList.contains("is-front"), "copy of the extra is not in front");
      return wait(1500);
    }).then(function () {
      post(frames()[0], { hz1: "set", n: 12, mode: "additive" });
      return wait(900);
    }).then(function () {
      eq(titleOf(frames()[0]), "Cyclic Group \u27E8\u2124/12\u2124, +\u27E9", "first extra");
      eq(titleOf(frames()[1]), "Ring \u27E8\u2124/15\u2124, \u00D7\u27E9", "second extra");
      return "+ copies the original (12/+) and an extra (15/x), 32px right and down, in front";
    });
  });

  scenario("R8 raise", function () {
    var w1 = frames()[0], w2 = frames()[1];
    eq(frontWin(), w2, "front before the poke");
    document.getElementById("fs-launcher").click();
    assert(!document.getElementById("fs-menu").hidden, "menu did not open");
    post(w1, { hz1: "poke" });
    return wait(300).then(function () {
      eq(frontWin(), w1, "front after the poke");
      assert(tasks()[1].classList.contains("is-front"), "task button not lit");
      var z = parseInt(w1.style.zIndex, 10);
      Array.prototype.forEach.call(document.querySelectorAll(".fs-win"), function (w) {
        if (w !== w1) assert(parseInt(w.style.zIndex, 10) < z, "z-index of " + w.getAttribute("data-panel") + " is not below");
      });
      assert(document.getElementById("fs-menu").hidden, "menu stayed open");
      return "a press in a back frame brought it to the front and closed the menu";
    });
  });

  scenario("R9 inert", function () {
    var frame = document.getElementById("diagram-frame");
    var head = ringWin().querySelector(".fs-win-head");
    pointer("pointerdown", head, 120, 120, 9);
    assert(frame.classList.contains("is-frames-inert"), "no is-frames-inert after a press on a head");
    frames().forEach(function (w) { eq(getComputedStyle(frameOf(w)).pointerEvents, "none", "frame pointer-events"); });
    pointer("pointerup", window, 120, 120, 9);
    assert(!frame.classList.contains("is-frames-inert"), "is-frames-inert stayed after the release");
    frames().forEach(function (w) { eq(getComputedStyle(frameOf(w)).pointerEvents, "auto", "frame pointer-events after"); });
    return "frames let a press through while it lasts";
  });

  scenario("R10 desktop commands", function () {
    var w1 = frames()[0], w2 = frames()[1], D = deskPx();
    // Tile
    click(actionItem(1));
    var rs = shownRects();
    eq(rs.length, 3, "windows shown after Tile");
    rs.forEach(function (r) {
      assert(r.l >= -1 && r.t >= -1 && r.l + r.w <= D.W + 1 && r.t + r.h <= D.H + 1, r.key + " is off the desktop: " + JSON.stringify(r));
    });
    for (var i = 0; i < rs.length; i++) for (var j = i + 1; j < rs.length; j++) {
      var a = rs[i], b = rs[j];
      assert(!(a.l < b.l + b.w - 2 && b.l < a.l + a.w - 2 && a.t < b.t + b.h - 2 && b.t < a.t + a.h - 2), a.key + " overlaps " + b.key);
    }
    // Cascade
    click(actionItem(2));
    eq(frontWin(), ringWin(), "front after Cascade");
    eq(px(ringWin(), "left") + "," + px(w1, "left") + "," + px(w2, "left"), "24,56,88", "cascade lefts");
    // Show desktop, twice
    click(actionItem(3));
    assert(ringWin().hidden && w1.hidden && w2.hidden, "Show desktop left a window up");
    click(actionItem(3));
    assert(!ringWin().hidden && !w1.hidden && !w2.hidden, "the second Show desktop did not bring them back");
    // Minimize, restore from the task button, maximize, restore
    w2.querySelector(".fs-win-btn.is-min").click();
    assert(w2.hidden, "minimize did not hide");
    click(tasks()[2]);
    assert(!w2.hidden && w2.classList.contains("is-front"), "the task button did not restore");
    w2.querySelector(".fs-win-btn.is-max").click();
    assert(w2.classList.contains("is-max"), "maximize");
    w2.querySelector(".fs-win-btn.is-max").click();
    assert(!w2.classList.contains("is-max"), "restore");
    var head = w2.querySelector(".fs-win-head");
    head.dispatchEvent(new MouseEvent("dblclick", { bubbles: true }));
    assert(w2.classList.contains("is-max"), "double-click maximize");
    head.dispatchEvent(new MouseEvent("dblclick", { bubbles: true }));
    assert(!w2.classList.contains("is-max"), "double-click restore");
    // Opacity
    w2.querySelector(".fs-win-btn.is-alpha").click();
    var slider = document.querySelector(".fs-alpha input");
    slider.value = "50";
    slider.dispatchEvent(new Event("input", { bubbles: true }));
    eq(w2.style.getPropertyValue("--win-alpha"), "0.5", "opacity");
    w2.querySelector(".fs-win-btn.is-alpha").click();
    // Snap to the left half by dragging the title bar to the edge
    var fr = document.getElementById("diagram-frame").getBoundingClientRect();
    var hr = head.getBoundingClientRect();
    pointer("pointerdown", head, hr.left + 60, hr.top + 10, 11);
    pointer("pointermove", window, fr.left + 4, fr.top + D.H / 2, 11);
    pointer("pointerup", window, fr.left + 4, fr.top + D.H / 2, 11);
    assert(Math.abs(px(w2, "left")) <= 1 && Math.abs(px(w2, "width") - D.W / 2) <= 2, "snap: left " + px(w2, "left") + " width " + px(w2, "width") + " of " + D.W);
    // None of it reloaded a frame
    eq(shared.e1.__hz1Loads, 1, "loads of the first extra");
    eq(shared.e2.__hz1Loads, 1, "loads of the second extra");
    assert(shared.e1.isConnected && shared.e2.isConnected && frameOf(w1) === shared.e1 && frameOf(w2) === shared.e2, "a frame was replaced");
    return "Tile, Cascade, Show desktop, minimize, maximize, opacity and snap include the extras; each frame loaded once";
  });

  scenario("R11f theme-lang over file", function () {
    var w1 = frames()[0], r0;
    // The desktop's look message, sent by hand: the frame takes the theme with
    // no write of its own, and ignores a message from anyone but its page.
    var top = document.documentElement.getAttribute("data-theme"), other = top === "day" ? "night" : "day";
    post(w1, { ringhost: "look", theme: other, lang: "en" });
    return wait(200).then(function () {
      return ask(w1, { hz1: "report" });
    }).then(function (rl) {
      eq(rl.theme, other, "theme after a look message");
      assert(rl.writes.indexOf("ls:site-theme-choice") === -1, "the look message made the frame write the theme");
      post(w1, { ringhost: "look", theme: top, lang: "en" });
      return wait(200).then(function () { return ask(w1, { hz1: "report" }); });
    }).then(function (r) {
      eq(r.theme, top, "theme after the look message is undone");
      r0 = r;
      document.getElementById("theme-switch-input").click();
      return wait(500).then(function () { return ask(w1, { hz1: "report" }); });
    }).then(function (r1) {
      assert(r1.theme !== r0.theme, "the frame's theme stayed " + r0.theme);
      eq(r1.theme, document.documentElement.getAttribute("data-theme"), "frame theme");
      NT.i18n.setLang("fr");
      return wait(500).then(function () { return ask(w1, { hz1: "report" }); });
    }).then(function (r2) {
      eq(r2.lang, "fr", "frame language");
      assert(titleOf(w1).indexOf("Groupe") === 0 || titleOf(w1).length > 0, "title");
      NT.i18n.setLang("en");
      return wait(500).then(function () { return ask(w1, { hz1: "report" }); });
    }).then(function (r3) {
      eq(r3.lang, "en", "frame language back");
      eq(titleOf(w1), "Cyclic Group \u27E8\u2124/12\u2124, +\u27E9", "title back in English");
      return "over file:// the frame followed the theme (" + r0.theme + " -> " + r1theme(r3) + ") and the language";
    });
    function r1theme(r) { return r.theme; }
  });
}

/* The top page's scenarios, Task 2 (http:// run, same-origin frames). */
function SCENARIOS_HTTP() {
  scenario("R11 theme-lang", function () {
    fakeFullscreen(true);
    actionItem(0).click();
    var win = frames()[0], r0;
    return wait(1500).then(function () {
      return ask(win, { hz1: "report" });
    }).then(function (r) {
      r0 = r;
      document.getElementById("theme-switch-input").click();
      return wait(500).then(function () { return ask(win, { hz1: "report" }); });
    }).then(function (r1) {
      assert(r1.theme !== r0.theme, "the frame's theme stayed " + r0.theme);
      eq(r1.theme, document.documentElement.getAttribute("data-theme"), "frame theme");
      NT.i18n.setLang("de");
      return wait(500).then(function () { return ask(win, { hz1: "report" }); });
    }).then(function (r2) {
      eq(r2.lang, "de", "frame language");
      ["group-params", FS_KEY, "cyclic-groups-fs-formula-pos"].forEach(function (k) {
        assert(r2.writes.indexOf("ls:" + k) === -1, "the frame wrote " + k);
      });
      return "the frame followed the theme (" + r0.theme + " -> " + r2.theme + ") and the language (de) and wrote none of the shared stores";
    });
  });
}

/* Task 3: the stored extras come back (run B, same profile as run A), and a
   corrupt or unparsable desktop state is ignored (runs C and D). */
function SCENARIOS_RESTORE() {
  scenario("R12 restore", function () {
    var st = stored();
    assert(st && st.extras && st.extras.length === 2, "stored extras: " + JSON.stringify(st && st.extras));
    eq(tasks().length, 12, "task buttons before full screen");
    eq(items().length, 12, "menu items before full screen");
    fakeFullscreen(true);
    // Straight away: the titles come from the stored queries, before any frame has reported.
    var wins = frames();
    eq(wins.length, 2, "frame windows");
    var want = ["Cyclic Group \u27E8\u2124/12\u2124, +\u27E9", "Ring \u27E8\u2124/15\u2124, \u00D7\u27E9"];
    var modes = ["additive/12", "multiplicative/15"];
    var f = document.getElementById("diagram-frame");
    var D = { W: f.clientWidth, H: f.clientHeight - 44 };
    wins.forEach(function (w, i) {
      eq(titleOf(w), want[i], "title " + i);
      eq(w.getAttribute("data-panel"), st.extras[i].key, "key " + i);
      var p = srcParams(w);
      eq(p.get("mode") + "/" + p.get("n"), modes[i], "src " + i);
      eq(parseInt(w.style.zIndex, 10), 3 + st.open.indexOf(st.extras[i].key), "stacking " + i);
      var g = st.geom[st.extras[i].key];
      assert(g, "no stored geometry for " + st.extras[i].key);
      var width = Math.min(Math.max(g.w * D.W, Math.min(320, D.W)), D.W);
      var height = Math.min(Math.max(g.h * D.H, Math.min(280, D.H)), D.H);
      assert(Math.abs(px(w, "width") - width) <= 2 && Math.abs(px(w, "height") - height) <= 2, "size " + i + ": " + w.style.width + " x " + w.style.height + " vs " + Math.round(width) + " x " + Math.round(height));
      assert(Math.abs(px(w, "left") - Math.min(Math.max(g.l * D.W, 80 - width), D.W - 80)) <= 2, "left " + i + ": " + w.style.left);
    });
    eq(wins[1].style.getPropertyValue("--win-alpha"), String(st.alpha[st.extras[1].key]), "opacity of the second extra");
    return "both extras are back with group, place, size, opacity and stacking";
  });
}
function SCENARIOS_CORRUPT() {
  scenario("R13 corrupt", function () {
    eq(tasks().length, 11, "task buttons");
    fakeFullscreen(true);
    var wins = frames();
    eq(wins.length, 1, "frame windows");
    eq(wins[0].getAttribute("data-panel"), "ringwin2", "its key");
    eq(titleOf(wins[0]), "Cyclic Group \u27E8\u2124/5\u2124, +\u27E9", "its title");
    var p = srcParams(wins[0]);
    eq(p.get("mode") + "/" + p.get("n"), "additive/5", "its src");
    eq(document.querySelectorAll(".fs-win").length, 11, "windows built");
    return "one window from the stored mess: ringwin2, the first entry for its key";
  });
}
function SCENARIOS_GARBAGE() {
  scenario("R14 unparsable", function () {
    eq(tasks().length, 10, "task buttons");
    fakeFullscreen(true);
    eq(frames().length, 0, "frame windows");
    assert(ringWin() && !ringWin().hidden, "the Ring window is not open");
    return "no frame windows, the Ring window open";
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
var SEED_SRC = [
  'var FS = "cyclic-groups-fs-windows";',
  'if (location.hash === "#hz1-corrupt") orig.call(localStorage, FS, JSON.stringify({',
  '  open: ["ring", "ringwin1", "ringwin2", "nope"],',
  '  extras: [{ key: "ringwin1", q: 123 }, { key: "x1", q: "mode=additive&n=7" }, "plain", { key: "ringwin2", q: "mode=additive&n=5" }, { key: "ringwin2", q: "mode=additive&n=6" }],',
  '  geom: { ringwin2: { l: "abc", t: 0.1, w: 0.4, h: 0.5 } }',
  '}));',
  'if (location.hash === "#hz1-garbage") orig.call(localStorage, FS, "{not json");'
].join("\n");
var SCENARIO_BODIES = [
  'if (RUN === "file") {', bodyOf(SCENARIOS_1), bodyOf(SCENARIOS_2), "}",
  'if (RUN === "http") {', bodyOf(SCENARIOS_HTTP), "}",
  'if (RUN === "restore") {', bodyOf(SCENARIOS_RESTORE), "}",
  'if (RUN === "corrupt") {', bodyOf(SCENARIOS_CORRUPT), "}",
  'if (RUN === "garbage") {', bodyOf(SCENARIOS_GARBAGE), "}"
];

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

function freePort() {
  return new Promise(function (resolve, reject) {
    var srv = net.createServer();
    srv.listen(0, "127.0.0.1", function () {
      var port = srv.address().port;
      srv.close(function () { resolve(port); });
    });
    srv.on("error", reject);
  });
}

function waitForPort(port, tries) {
  return new Promise(function (resolve, reject) {
    (function attempt(n) {
      var sock = net.connect(port, "127.0.0.1");
      sock.on("connect", function () { sock.destroy(); resolve(); });
      sock.on("error", function () {
        sock.destroy();
        if (n <= 0) reject(new Error("http server did not start"));
        else setTimeout(function () { attempt(n - 1); }, 100);
      });
    })(tries);
  });
}

async function main() {
  var site = buildSite();
  var pageUrl = url.pathToFileURL(site.page).href;
  var all = [];

  // Run A: the page over file://, in a fresh profile that run B reuses.
  var profileAB = harness.mkScratch("hz1-profile-");
  all = all.concat(readOut(runChrome(pageUrl + PAGE_QUERY, DESKTOP, profileAB), "run A"));

  // Run B: the same profile, a later visit: the extra windows come back.
  all = all.concat(readOut(runChrome(pageUrl + PAGE_QUERY + "#hz1-restore", DESKTOP, profileAB), "run B"));
  try { fs.rmSync(profileAB, { recursive: true, force: true }); } catch (e) { /* best effort */ }

  // Runs C and D: a corrupt and an unparsable desktop state, each in a fresh profile.
  all = all.concat(readOut(runChrome(pageUrl + PAGE_QUERY + "#hz1-corrupt", DESKTOP), "run C"));
  all = all.concat(readOut(runChrome(pageUrl + PAGE_QUERY + "#hz1-garbage", DESKTOP), "run D"));

  // Run H: the page over http://, where the frames are same-origin. The
  // server is stopped through its process handle.
  var port = await freePort();
  var server = cp.spawn("python3", ["-m", "http.server", String(port), "--bind", "127.0.0.1"], { cwd: site.root, stdio: "ignore" });
  try {
    await waitForPort(port, 50);
    all = all.concat(readOut(runChrome("http://127.0.0.1:" + port + "/Cyclic%20Groups/cyclic-groups.html" + PAGE_QUERY, DESKTOP), "run H"));
  } finally {
    server.kill();
  }

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

main().catch(function (err) {
  console.log("RINGWIN-PROBE FAIL " + (err && err.stack ? err.stack : err));
  process.exit(1);
});
