"use strict";
/*
 * Dev-only regression probe for quick task 261011-nut: the Ring window's
 * Splitview of the Cyclic Groups tool. Never referenced by any page.
 * Plain Node + the Playwright already installed for another project, required
 * by absolute path (nothing is added to this repo). Runs headless Chromium
 * over file://, which grants real full screen on a click.
 */

var path = require("path");
var url = require("url");
var pw = require("/home/mainaccount/Claude/latin-botany-tool/node_modules/playwright");

var ROOT = path.resolve(__dirname, "..", "..", "..");
var PAGE = url.pathToFileURL(path.join(ROOT, "Cyclic Groups", "cyclic-groups.html")).href;
var EXPECTED = 12;
var QUERY = "?mode=additive&n=12&gen=5";

var results = [];
function record(name, err) {
  results.push({ name: name, ok: !err });
  console.log(err ? "FAIL " + name + ": " + (err.message || err) : "PASS " + name);
}
function assert(cond, msg) { if (!cond) throw new Error(msg); }
function eq(actual, expected, what) {
  if (actual !== expected) throw new Error(what + ": got " + JSON.stringify(actual) + ", expected " + JSON.stringify(expected));
}

/* A page in a fresh context (clean localStorage), with every page error and
   console error collected. */
async function openPage(browser, query, size) {
  var ctx = await browser.newContext({ viewport: size });
  var page = await ctx.newPage();
  var errors = [];
  function watch(p) {
    p.on("pageerror", function (e) { errors.push("pageerror: " + e.message); });
    p.on("console", function (m) { if (m.type() === "error") errors.push("console: " + m.text()); });
  }
  watch(page);
  ctx.on("page", watch);
  await page.goto(PAGE + query);
  await page.waitForSelector("#subgroups .subgroup-row", { state: "attached" });
  return { ctx: ctx, page: page, errors: errors };
}
function noErrors(h) { assert(h.errors.length === 0, "errors: " + h.errors.join(" | ")); }

/* Where things are, read in the page. */
function probeState() {
  var panel = document.getElementById("subgroups-list-panel");
  var split = document.getElementById("ring-split");
  var svg = document.getElementById("ring-svg");
  var btn = document.getElementById("split-btn");
  var subs = document.getElementById("subgroups");
  var body = document.querySelector(".fs-win-body.is-ring");
  var cs = function (el) { return getComputedStyle(el); };
  var sr = split.getBoundingClientRect(), vr = svg.getBoundingClientRect();
  return {
    btnDisplay: cs(btn).display,
    btnPressed: btn.getAttribute("aria-pressed"),
    splitDisplay: cs(split).display,
    splitBorderTop: parseFloat(cs(split).borderTopWidth),
    panelParent: panel.parentElement.id || panel.parentElement.className,
    panelInStage: panel.parentElement.classList.contains("stage"),
    panelInSplit: panel.parentElement === split,
    panelDisplay: cs(panel).display,
    rows: panel.querySelectorAll(".subgroup-row").length,
    svgTop: vr.top, svgBottom: vr.bottom, svgH: vr.height,
    splitTop: sr.top, splitBottom: sr.bottom, splitH: sr.height,
    subsScroll: subs.scrollHeight, subsClient: subs.clientHeight,
    bodyScroll: body ? body.scrollHeight : null, bodyClient: body ? body.clientHeight : null,
    btnLast: !!btn.parentElement && btn.parentElement.lastElementChild === btn,
    btnRowClass: btn.parentElement ? btn.parentElement.className : "",
    innerHeight: window.innerHeight
  };
}

async function main() {
  var browser = await pw.chromium.launch();
  var h;

  /* S1: the normal page never shows the button or the pane */
  try {
    h = await openPage(browser, QUERY, { width: 1600, height: 1000 });
    var s = await h.page.evaluate(probeState);
    eq(s.btnDisplay, "none", "button display");
    eq(s.splitDisplay, "none", "pane display");
    assert(s.panelInStage, "panel not in .stage: " + s.panelParent);
    noErrors(h);
    record("S1 normal page: no Splitview button or pane", null);
  } catch (e) { record("S1 normal page: no Splitview button or pane", e); }
  if (h) await h.ctx.close();

  /* S2-S6: ringwin mode */
  h = null;
  try {
    h = await openPage(browser, QUERY + "&ringwin=1", { width: 900, height: 800 });
  } catch (e) { record("S2 ringwin open", e); }
  if (h) {
    var p = h.page;
    try {
      var s2 = await p.evaluate(probeState);
      eq(s2.btnDisplay === "none", false, "button hidden in ringwin");
      assert(s2.btnLast, "button is not the last child of its row");
      assert(/fs-win-row-gen/.test(s2.btnRowClass), "button row: " + s2.btnRowClass);
      eq(s2.btnPressed, "false", "aria-pressed");
      eq(s2.splitDisplay, "none", "pane display");
      noErrors(h);
      record("S2 ringwin: Splitview ends the Subgroup visualized row", null);
    } catch (e) { record("S2 ringwin: Splitview ends the Subgroup visualized row", e); }

    try {
      await p.click("#split-btn");
      var s3 = await p.evaluate(probeState);
      eq(s3.btnPressed, "true", "aria-pressed");
      eq(s3.splitDisplay, "flex", "pane display");
      assert(s3.panelInSplit, "panel parent: " + s3.panelParent);
      assert(s3.panelDisplay !== "none", "panel hidden");
      eq(s3.rows, 12, "subgroup rows");
      assert(s3.splitTop >= s3.svgBottom - 0.5, "pane above ring bottom: " + s3.splitTop + " < " + s3.svgBottom);
      assert(s3.splitBorderTop >= 1, "no divider: " + s3.splitBorderTop);
      assert(s3.svgH >= 100 && s3.splitH >= 100, "heights " + s3.svgH + " / " + s3.splitH);
      assert(Math.abs(s3.svgH - s3.splitH) <= 2, "unequal heights " + s3.svgH + " / " + s3.splitH);
      assert(s3.splitBottom <= s3.innerHeight + 1, "pane overflows: " + s3.splitBottom + " > " + s3.innerHeight);
      noErrors(h);
      record("S3 ringwin split: stacked ring and pane, equal shares", null);
    } catch (e) { record("S3 ringwin split: stacked ring and pane, equal shares", e); }

    try {
      await p.click('#subgroups .subgroup-row[data-gen="4"]');
      var sel = await p.evaluate(function () {
        return { v: document.getElementById("gen-select").value, cur: document.querySelector('#subgroups .subgroup-row[data-gen="4"]').classList.contains("is-current") };
      });
      eq(sel.v, "4", "gen-select value");
      assert(sel.cur, "row 4 is not current");
      noErrors(h);
      record("S4 ringwin split: a row selects its subgroup", null);
    } catch (e) { record("S4 ringwin split: a row selects its subgroup", e); }

    try {
      await p.click("#split-btn");
      var s6 = await p.evaluate(probeState);
      eq(s6.btnPressed, "false", "aria-pressed");
      eq(s6.splitDisplay, "none", "pane display");
      assert(s6.panelInStage, "panel not back in .stage: " + s6.panelParent);
      eq(s6.panelDisplay, "none", "panel display in ringwin");
      noErrors(h);
      record("S6 ringwin: second click closes the split", null);
    } catch (e) { record("S6 ringwin: second click closes the split", e); }
    await h.ctx.close();
  } else {
    ["S3", "S4", "S6"].forEach(function (n) { record(n + " (ringwin not opened)", new Error("skipped")); });
  }

  /* S5: a long list scrolls inside the pane */
  try {
    h = await openPage(browser, "?mode=additive&n=60&gen=5&ringwin=1", { width: 900, height: 800 });
    await h.page.click("#split-btn");
    var s5 = await h.page.evaluate(probeState);
    assert(s5.subsScroll > s5.subsClient, "list does not scroll: " + s5.subsScroll + " / " + s5.subsClient);
    assert(s5.bodyScroll <= s5.bodyClient + 1, "window body overflows: " + s5.bodyScroll + " / " + s5.bodyClient);
    noErrors(h);
    record("S5 ringwin n=60 split: the list scrolls inside the pane", null);
  } catch (e) { record("S5 ringwin n=60 split: the list scrolls inside the pane", e); }
  if (h) await h.ctx.close();

  /* S7-S8: the full-screen desktop */
  async function goFull(hh) {
    await hh.page.click("#fullscreen-btn");
    await hh.page.waitForFunction(function () { return !!document.fullscreenElement && document.querySelectorAll(".fs-win").length >= 8; });
  }
  h = null;
  try {
    h = await openPage(browser, QUERY, { width: 1600, height: 1000 });
    await goFull(h);
    var f0 = await h.page.evaluate(function () {
      var btn = document.getElementById("split-btn");
      var row = document.querySelector('.fs-win[data-panel="ring"] .fs-win-row-gen');
      return { last: !!row && row.lastElementChild === btn, display: getComputedStyle(btn).display };
    });
    assert(f0.last, "button is not the last of the ring window's gen row");
    assert(f0.display !== "none", "button hidden in the ring window");
    await h.page.click("#split-btn");
    var f1 = await h.page.evaluate(function () {
      var pane = document.querySelector('.fs-win[data-panel="ring"] #ring-split');
      var svg = document.querySelector('.fs-win[data-panel="ring"] #ring-svg');
      var panel = document.getElementById("subgroups-list-panel");
      return {
        inPane: !!pane && panel.parentElement === pane,
        rows: panel.querySelectorAll(".subgroup-row").length,
        below: !!pane && pane.getBoundingClientRect().top >= svg.getBoundingClientRect().bottom - 0.5
      };
    });
    assert(f1.inPane, "panel not in the ring window's pane");
    eq(f1.rows, 12, "rows");
    assert(f1.below, "pane not below the ring");
    await h.page.click("#split-btn");
    var f2 = await h.page.evaluate(function () {
      var panel = document.getElementById("subgroups-list-panel");
      return !!panel.closest('.fs-win[data-panel="subgroups"] .fs-win-body');
    });
    assert(f2, "panel did not return to the Subgroups window");
    noErrors(h);
    record("S7 full screen: split opens and closes in the ring window", null);
  } catch (e) { record("S7 full screen: split opens and closes in the ring window", e); }
  if (h) await h.ctx.close();

  h = null;
  try {
    h = await openPage(browser, QUERY, { width: 1600, height: 1000 });
    await goFull(h);
    await h.page.click("#split-btn");
    await h.page.click("#fs-exit");
    await h.page.waitForFunction(function () { return !document.fullscreenElement; });
    var x = await h.page.evaluate(probeState);
    assert(x.panelInStage, "panel not back in .stage after exit: " + x.panelParent);
    assert(x.panelDisplay !== "none", "panel hidden after exit");
    eq(x.splitDisplay, "none", "pane after exit");
    eq(x.btnDisplay, "none", "button after exit");
    await goFull(h);
    var y = await h.page.evaluate(function () {
      var panel = document.getElementById("subgroups-list-panel");
      return { pressed: document.getElementById("split-btn").getAttribute("aria-pressed"), inPane: !!panel.closest('.fs-win[data-panel="ring"] #ring-split') };
    });
    eq(y.pressed, "true", "aria-pressed after re-entry");
    assert(y.inPane, "split not restored on re-entry");
    noErrors(h);
    record("S8 full screen: exit puts everything back, re-entry restores the split", null);
  } catch (e) { record("S8 full screen: exit puts everything back, re-entry restores the split", e); }
  if (h) await h.ctx.close();

  /* S9-S11: the Subgroups window gives way, and Fit on the ring window */
  var winState = function () {
    var ring = document.querySelector('.fs-win[data-panel="ring"]');
    var sub = document.querySelector('.fs-win[data-panel="subgroups"]');
    var task = Array.prototype.filter.call(document.querySelectorAll(".fs-task"), function (t) { return t.textContent.indexOf("Subgroup generated by each element") !== -1; })[0];
    var D = document.querySelector(".diagram-frame");
    var panel = document.getElementById("subgroups-list-panel");
    return {
      subDisplay: getComputedStyle(sub).display,
      taskDisabled: task ? task.disabled : null,
      panelInSubBody: !!panel.closest('.fs-win[data-panel="subgroups"] .fs-win-body'),
      ringBottom: ring.getBoundingClientRect().bottom - D.getBoundingClientRect().top - D.clientTop,
      deskH: D.clientHeight,
      svgH: document.querySelector('.fs-win[data-panel="ring"] #ring-svg').getBoundingClientRect().height,
      splitH: document.getElementById("ring-split").getBoundingClientRect().height,
      bodyScroll: ring.querySelector(".fs-win-body").scrollHeight,
      bodyClient: ring.querySelector(".fs-win-body").clientHeight
    };
  };
  var fitOk = function (w, what) {
    assert(w.ringBottom <= w.deskH - 44 + 1, what + ": ring window below the taskbar: " + w.ringBottom + " > " + (w.deskH - 44));
    assert(w.bodyScroll <= w.bodyClient + 1, what + ": ring body overflows " + w.bodyScroll + " / " + w.bodyClient);
  };
  var pressSplit = function () { document.getElementById("split-btn").click(); }; // a window may sit over the button
  h = null;
  try {
    h = await openPage(browser, QUERY, { width: 1600, height: 1000 });
    await goFull(h);
    var p9 = h.page;
    await p9.evaluate(function () {
      Array.prototype.filter.call(document.querySelectorAll(".fs-task"), function (t) { return t.textContent.indexOf("Subgroup generated by each element") !== -1; })[0].click();
    });
    var a = await p9.evaluate(winState);
    assert(a.subDisplay !== "none", "Subgroups window not shown after opening it");
    await p9.evaluate(pressSplit);
    var b = await p9.evaluate(winState);
    eq(b.subDisplay, "none", "Subgroups window while split");
    eq(b.taskDisabled, true, "Subgroups task disabled while split");
    await p9.evaluate(pressSplit);
    var c = await p9.evaluate(winState);
    assert(c.subDisplay !== "none", "Subgroups window did not come back");
    eq(c.taskDisabled, false, "Subgroups task enabled after split");
    assert(c.panelInSubBody, "panel not back in the Subgroups window body");
    await p9.click('.fs-win[data-panel="subgroups"] .subgroup-row[data-gen="7"]');
    eq(await p9.evaluate(function () { return document.getElementById("gen-select").value; }), "7", "gen-select after clicking row 7");
    noErrors(h);
    record("S9 desktop: the Subgroups window steps aside while split", null);

    try {
      await p9.click('.fs-win[data-panel="ring"] .fs-win-btn.is-fit');
      await p9.waitForTimeout(300);
      var d = await p9.evaluate(winState);
      assert(d.svgH >= 200, "fitted ring only " + d.svgH + "px tall");
      fitOk(d, "unsplit Fit");
      noErrors(h);
      record("S10 desktop: Fit gives an unsplit ring its full height", null);
    } catch (e) { record("S10 desktop: Fit gives an unsplit ring its full height", e); }

    try {
      await p9.evaluate(pressSplit);
      await p9.click('.fs-win[data-panel="ring"] .fs-win-btn.is-fit');
      await p9.waitForTimeout(300);
      var f = await p9.evaluate(winState);
      assert(Math.abs(f.svgH - f.splitH) <= 2, "unequal heights " + f.svgH + " / " + f.splitH);
      assert(f.svgH >= 150, "split ring only " + f.svgH + "px tall");
      fitOk(f, "split Fit");
      noErrors(h);
      record("S11 desktop: Fit splits the height equally between ring and pane", null);
    } catch (e) { record("S11 desktop: Fit splits the height equally between ring and pane", e); }
  } catch (e) {
    record("S9 desktop: the Subgroups window steps aside while split", e);
    ["S10", "S11"].forEach(function (n) { record(n + " (S9 failed)", new Error("skipped")); });
  }
  if (h) await h.ctx.close();

  /* S12: an extra ring window (a frame) splits and fits on its own */
  h = null;
  try {
    h = await openPage(browser, QUERY, { width: 1600, height: 1000 });
    await goFull(h);
    var p12 = h.page;
    await p12.click("#fs-launcher");
    await p12.locator(".fs-menu-item", { hasText: "New ring window" }).first().click();
    var frame = null;
    for (var i = 0; i < 100 && !frame; i++) {
      frame = p12.frames().filter(function (fr) { return fr.url().indexOf("ringwin=1") !== -1; })[0];
      if (!frame) await p12.waitForTimeout(100);
    }
    assert(frame, "no ring frame appeared");
    await frame.waitForSelector("#subgroups .subgroup-row", { state: "attached" });
    await frame.click("#split-btn");
    eq(await frame.evaluate(function () { return document.querySelectorAll("#ring-split .subgroup-row").length; }), 12, "rows in the frame's pane");
    await p12.click(".fs-win.is-frame .fs-win-btn.is-fit");
    await p12.waitForTimeout(600);
    var g = await frame.evaluate(function () {
      return { svgH: document.getElementById("ring-svg").getBoundingClientRect().height, splitH: document.getElementById("ring-split").getBoundingClientRect().height };
    });
    assert(Math.abs(g.svgH - g.splitH) <= 2, "unequal heights in the frame " + g.svgH + " / " + g.splitH);
    assert(g.svgH >= 100, "frame ring only " + g.svgH + "px tall");
    var own = await p12.evaluate(function () { return !document.getElementById("subgroups-list-panel").closest("#ring-split"); });
    assert(own, "the desktop's own panel was moved into a pane");
    noErrors(h);
    record("S12 desktop: an extra ring frame splits and fits on its own", null);
  } catch (e) { record("S12 desktop: an extra ring frame splits and fits on its own", e); }
  if (h) await h.ctx.close();

  await browser.close();
  var bad = results.filter(function (r) { return !r.ok; }).length;
  var ok = bad === 0 && results.length === EXPECTED;
  console.log("SPLIT-PROBE " + (ok ? "PASS" : "FAIL") + " (" + (results.length - bad) + "/" + EXPECTED + ")");
  process.exit(ok ? 0 : 1);
}
main().catch(function (e) { console.log("SPLIT-PROBE FAIL (crash): " + (e && e.stack || e)); process.exit(1); });
