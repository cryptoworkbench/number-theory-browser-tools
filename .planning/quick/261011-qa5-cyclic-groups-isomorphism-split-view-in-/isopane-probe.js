"use strict";
/*
 * Dev-only regression probe for quick task 261011-qa5: the isomorphism view of
 * the Cyclic Groups tool (an isomorphism chip opens its group in a pane beside
 * the ring). Never referenced by any page.
 * Plain Node + the Playwright already installed for another project, required
 * by absolute path (nothing is added to this repo). Runs headless Chromium
 * over file://, which grants real full screen on a click.
 */

var path = require("path");
var url = require("url");
var pw = require("/home/mainaccount/Claude/latin-botany-tool/node_modules/playwright");

var ROOT = path.resolve(__dirname, "..", "..", "..");
var PAGE = url.pathToFileURL(path.join(ROOT, "Cyclic Groups", "cyclic-groups.html")).href;
var Q = "?mode=additive&n=12&gen=3";
var EXPECTED = 8;
var RING = '.fs-win[data-panel="ring"]';
var CHIP5 = 'a.iso-chip[data-iso-n="5"][data-iso-mode="multiplicative"]';
var CHIP4 = 'a.iso-chip[data-iso-n="4"][data-iso-mode="additive"]';

var results = [];
function record(name, err) {
  results.push({ name: name, ok: !err });
  console.log(err ? "FAIL " + name + ": " + (err.message || err) : "PASS " + name);
}
function assert(cond, msg) { if (!cond) throw new Error(msg); }
function eq(actual, expected, what) {
  if (actual !== expected) throw new Error(what + ": got " + JSON.stringify(actual) + ", expected " + JSON.stringify(expected));
}
function sleep(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
async function waitFor(fn, ms, what) {
  var end = Date.now() + (ms || 3000), last;
  while (Date.now() < end) {
    try { last = await fn(); if (last) return last; } catch (e) { last = null; }
    await sleep(40);
  }
  throw new Error("timed out waiting for " + (what || "condition"));
}

/* A page in a fresh context (clean localStorage), with every page and frame
   error collected. */
async function openPage(browser, query, size) {
  var ctx = await browser.newContext({ viewport: size || { width: 1600, height: 1000 } });
  var page = await ctx.newPage();
  var errors = [];
  function watch(p) {
    p.on("pageerror", function (e) { errors.push("pageerror: " + e.message); });
    p.on("console", function (m) { if (m.type() === "error") errors.push("console: " + m.text()); });
  }
  watch(page);
  ctx.on("page", watch);
  await page.goto(PAGE + (query === undefined ? Q : query));
  await page.waitForSelector("#subgroups .subgroup-row", { state: "attached" });
  return { ctx: ctx, page: page, errors: errors };
}
function noErrors(h) { assert(h.errors.length === 0, "errors: " + h.errors.join(" | ")); }

async function enterFs(page) {
  await page.click("#fullscreen-btn");
  await page.waitForFunction(function () { return !!document.fullscreenElement && document.querySelectorAll(".fs-win").length >= 2; });
  await page.click(RING + " .fs-win-btn.is-max");
  await sleep(250);
}
async function openFs(browser, query) {
  var h = await openPage(browser, query);
  await enterFs(h.page);
  return h;
}
/* The pane's frame, a child of `parent` (the page's main frame, or an extra
   window's frame), once its ring is drawn. */
async function paneOf(parent, ms) {
  var f = await waitFor(function () {
    return parent.childFrames().filter(function (c) { return /isopane=1/.test(c.url()); })[0];
  }, ms || 8000, "a pane frame");
  await f.waitForSelector("#ring-svg circle.bead", { state: "attached", timeout: 8000 });
  return f;
}
/* An extra Ring window's frame (no pane), from the launcher. */
async function openExtra(h) {
  await h.page.click("#fs-launcher");
  await h.page.click('.fs-menu-item:has-text("New ring window")');
  var f = await waitFor(function () {
    return h.page.frames().filter(function (c) { return /ringwin=1/.test(c.url()) && !/isopane=1/.test(c.url()); })[0];
  }, 8000, "the extra window's frame");
  await f.waitForSelector(".iso-chip", { state: "attached", timeout: 8000 });
  return f;
}
function bodyGrid() {
  var b = document.querySelector('.fs-win[data-panel="ring"] .fs-win-body.is-ring');
  var cs = getComputedStyle(b);
  return { cols: cs.gridTemplateColumns, rows: cs.gridTemplateRows, areas: cs.gridTemplateAreas };
}
function counts() {
  return { tasks: document.querySelectorAll(".fs-task").length, wins: document.querySelectorAll(".fs-win").length };
}

async function main() {
  var browser = await pw.chromium.launch();
  var h, base, pane;

  /* P1-P4: the full-screen Ring window */
  var p1h;
  try {
    h = p1h = await openFs(browser);
    var page = h.page;
    base = { grid: await page.evaluate(bodyGrid), c: await page.evaluate(counts), pages: h.ctx.pages().length };
    await page.click(RING + " " + CHIP5);
    pane = await paneOf(page.mainFrame());
    var u = pane.url();
    ["isopane=1", "mode=multiplicative", "n=5", "isogen=2"].forEach(function (k) { assert(u.indexOf(k) >= 0, "pane url lacks " + k + ": " + u); });
    ["rot=", "autorotate="].forEach(function (k) { assert(u.indexOf(k) < 0, "pane url has " + k + ": " + u); });
    var g = await page.evaluate(function (sel) {
      var pe = document.querySelector(sel + " .fs-win-body.is-ring > #iso-pane");
      var svg = document.querySelector(sel + " #ring-svg");
      var b = pe && pe.getBoundingClientRect(), v = svg.getBoundingClientRect();
      return { has: !!pe, display: pe && getComputedStyle(pe).display, left: b && b.left, width: b && b.width, svgRight: v.right, svgWidth: v.width, name: document.getElementById("iso-pane-name").textContent };
    }, RING);
    assert(g.has && g.display !== "none", "pane not shown in the Ring window body");
    var grid = await page.evaluate(bodyGrid);
    eq(grid.cols.split(" ").length, 4, "column tracks");
    assert(g.left >= g.svgRight - 1, "pane left " + g.left + " < ring right " + g.svgRight);
    assert(Math.abs(g.width - g.svgWidth) <= 16, "widths " + g.width + " / " + g.svgWidth);
    var c = await page.evaluate(counts);
    eq(c.tasks, base.c.tasks, ".fs-task count");
    eq(c.wins, base.c.wins, ".fs-win count");
    eq(h.ctx.pages().length, base.pages, "page count");
    // The left half is narrower, so its control rows may wrap and grow: the rows
    // are only compared again once the pane is closed (P4).
    eq(grid.rows.split(" ").length, base.grid.rows.split(" ").length, "gridTemplateRows tracks");
    assert(g.name.indexOf("ℤ/5ℤ") >= 0, "pane name: " + g.name);
    noErrors(h);
    record("P1 full screen: a chip opens its group in a pane beside the ring", null);
  } catch (e) { record("P1 full screen: a chip opens its group in a pane beside the ring", e); }

  try {
    assert(h && pane, "no pane");
    var d = await pane.evaluate(function () {
      function disp(id) { var e = document.getElementById(id); return e ? getComputedStyle(e).display : "absent"; }
      function shown(id) { var e = document.getElementById(id); if (!e) return false; var r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0; }
      var rowIso = document.querySelector(".fs-win-row-iso");
      return {
        hidden: ["element-colours", "arrow-options", "split-btn", "iso-panel"].map(function (id) { return id + ":" + disp(id); }),
        rowIso: rowIso ? getComputedStyle(rowIso).display + "/" + rowIso.getBoundingClientRect().height : "absent",
        shown: ["n-input", "op-toggle", "gen-select", "arrange-select", "scratch-btn", "rot-back", "rot-fwd", "rot-value", "rot-reset", "keep-top"].filter(function (id) { return !shown(id); }),
        n: document.getElementById("n-input").value
      };
    });
    d.hidden.forEach(function (x) { eq(x.split(":")[1], "none", x.split(":")[0] + " display"); });
    if (d.rowIso !== "absent") assert(d.rowIso === "none/0" || /^(none|block|flex|grid)\/0$/.test(d.rowIso), "iso row visible: " + d.rowIso);
    eq(d.shown.join(","), "", "per-group controls without a box");
    eq(d.n, "5", "pane modulus");
    noErrors(h);
    record("P2 pane: only the per-group controls", null);
  } catch (e) { record("P2 pane: only the per-group controls", e); }

  try {
    var page2 = h.page;
    await page2.click(RING + " " + CHIP4);
    await waitFor(async function () { return /n=4/.test((await paneOf(page2.mainFrame())).url()); }, 8000, "the replaced pane");
    pane = await paneOf(page2.mainFrame());
    var u2 = pane.url();
    ["mode=additive", "n=4", "isogen=1"].forEach(function (k) { assert(u2.indexOf(k) >= 0, "pane url lacks " + k + ": " + u2); });
    eq(await page2.evaluate(function () { return document.querySelectorAll("#iso-pane iframe").length; }), 1, "pane iframes");
    var c2 = await page2.evaluate(counts);
    eq(c2.tasks, base.c.tasks, ".fs-task count");
    eq(h.ctx.pages().length, base.pages, "page count");
    noErrors(h);
    record("P3 replace: another chip replaces the right group", null);
  } catch (e) { record("P3 replace: another chip replaces the right group", e); }

  try {
    var page3 = h.page;
    await page3.click("#iso-pane-close");
    var s = await page3.evaluate(function () {
      var pe = document.getElementById("iso-pane");
      return { hidden: getComputedStyle(pe).display === "none", frames: pe.querySelectorAll("iframe").length };
    });
    assert(s.hidden, "pane still shown");
    eq(s.frames, 0, "pane iframes");
    var g3 = await page3.evaluate(bodyGrid);
    eq(g3.cols, base.grid.cols, "gridTemplateColumns");
    eq(g3.rows, base.grid.rows, "gridTemplateRows");
    eq(g3.areas, base.grid.areas, "gridTemplateAreas");
    noErrors(h);
    record("P4 close: the single-ring grid is back", null);
  } catch (e) { record("P4 close: the single-ring grid is back", e); }
  if (p1h) await p1h.ctx.close();

  /* P5: a modified click leaves the pane alone */
  try {
    h = await openPage(browser);
    var before = h.ctx.pages().length;
    await h.page.click(".stage > .iso-panel " + CHIP5, { modifiers: ["Control"] });
    await sleep(500);
    var hidden = await h.page.evaluate(function () { return getComputedStyle(document.getElementById("iso-pane")).display === "none"; });
    assert(hidden, "pane opened on a modified click");
    var pages = h.ctx.pages();
    for (var i = 0; i < pages.length; i++) if (pages[i] !== h.page) await pages[i].close();
    assert(pages.length >= before, "no tab");
    noErrors(h);
    record("P5 modified click: a new tab, no pane", null);
  } catch (e) { record("P5 modified click: a new tab, no pane", e); }
  if (h) await h.ctx.close();

  /* P6: an extra Ring window holds its pane nested */
  try {
    h = await openFs(browser);
    var extra = await openExtra(h);
    var href = await extra.getAttribute(CHIP5, "href");
    assert(href.indexOf("ringwin=") < 0, "chip href leaks ringwin: " + href);
    var cx = await h.page.evaluate(counts), pg = h.ctx.pages().length;
    await extra.click(CHIP5);
    var np = await paneOf(extra);
    assert(/isopane=1/.test(np.url()), "nested pane url");
    var vis = await extra.evaluate(function () { return getComputedStyle(document.getElementById("iso-pane")).display !== "none"; });
    assert(vis, "the extra frame's pane is hidden");
    var top = await h.page.evaluate(function () { return getComputedStyle(document.getElementById("iso-pane")).display === "none"; });
    assert(top, "the top page's pane opened");
    var cy = await h.page.evaluate(counts);
    eq(cy.wins, cx.wins, ".fs-win count");
    eq(cy.tasks, cx.tasks, ".fs-task count");
    eq(h.ctx.pages().length, pg, "page count");
    eq(pg, 1, "page count is 1");
    noErrors(h);
    record("P6 extra Ring window: the pane nests inside its frame", null);
  } catch (e) { record("P6 extra Ring window: the pane nests inside its frame", e); }
  if (h) await h.ctx.close();

  /* P7-P8: the normal page */
  var rot2 = "2";
  try {
    h = await openPage(browser);
    await h.page.click(".stage > .iso-panel " + CHIP5);
    pane = await paneOf(h.page.mainFrame());
    await waitFor(function () { return h.page.evaluate(function () { return document.querySelector("#iso-pane iframe").classList.contains("is-loaded"); }); }, 5000, "the pane frame to load");
    var m = await h.page.evaluate(function () {
      var pe = document.getElementById("iso-pane"), svg = document.getElementById("ring-svg"), fr = document.getElementById("diagram-frame");
      var b = pe.getBoundingClientRect(), v = svg.getBoundingClientRect(), f = fr.getBoundingClientRect();
      return { parent: pe.parentNode.id, display: getComputedStyle(pe).display, h: b.height, left: b.left, svgRight: v.right, svgW: v.width, frameW: f.width, loaded: pe.querySelector("iframe").classList.contains("is-loaded") };
    });
    eq(m.parent, "diagram-frame", "pane parent");
    eq(m.display, "flex", "pane display");
    assert(m.h >= 300, "pane height " + m.h);
    assert(m.loaded, "pane frame not loaded");
    assert(m.svgRight <= m.left + 1, "ring overlaps the pane: " + m.svgRight + " > " + m.left);
    assert(m.svgW <= 0.55 * m.frameW, "ring too wide: " + m.svgW + " / " + m.frameW);
    eq(h.ctx.pages().length, 1, "page count");
    noErrors(h);
    record("P7 normal page: the pane hangs in the diagram's right half", null);
  } catch (e) { record("P7 normal page: the pane hangs in the diagram's right half", e); }

  try {
    assert(h && pane, "no pane");
    await pane.fill("#rot-value", rot2);
    await pane.press("#rot-value", "Enter");
    await waitFor(async function () { return (await pane.inputValue("#rot-value")) === rot2; }, 3000, "pane rot");
    await sleep(400);
    await h.page.click("#fullscreen-btn");
    await h.page.waitForFunction(function () { return !!document.fullscreenElement && document.querySelectorAll(".fs-win").length >= 2; });
    var fp = await waitFor(function () {
      return h.page.frames().filter(function (c) { return /isopane=1/.test(c.url()) && /rot=2/.test(c.url()); })[0];
    }, 8000, "the reloaded pane (full screen)");
    await fp.waitForSelector("#ring-svg circle.bead", { state: "attached", timeout: 8000 });
    eq(await fp.inputValue("#rot-value"), "2", "full-screen pane rot");
    var inWin = await h.page.evaluate(function (sel) { return !!document.querySelector(sel + " #iso-pane iframe"); }, RING);
    assert(inWin, "pane not in the Ring window");
    await h.page.click("#fs-exit");
    await h.page.waitForFunction(function () { return !document.fullscreenElement; });
    var bp = await waitFor(function () {
      return h.page.frames().filter(function (c) { return /isopane=1/.test(c.url()) && /rot=2/.test(c.url()) && c !== fp; })[0];
    }, 8000, "the reloaded pane (page)");
    await bp.waitForSelector("#ring-svg circle.bead", { state: "attached", timeout: 8000 });
    eq(await bp.inputValue("#rot-value"), "2", "back-on-page pane rot");
    var home = await h.page.evaluate(function () { return document.getElementById("iso-pane").parentNode.id; });
    eq(home, "diagram-frame", "pane home");
    noErrors(h);
    record("P8 move keeps state across full screen", null);
  } catch (e) { record("P8 move keeps state across full screen", e); }
  if (h) await h.ctx.close();

  await browser.close();
  var ok = results.filter(function (r) { return r.ok; }).length;
  var good = ok === results.length && results.length === EXPECTED;
  console.log("ISOPANE-PROBE " + (good ? "PASS" : "FAIL") + " (" + ok + "/" + EXPECTED + (results.length !== EXPECTED ? ", ran " + results.length : "") + ")");
  process.exit(good ? 0 : 1);
}

main().catch(function (e) { console.error(e); process.exit(2); });
