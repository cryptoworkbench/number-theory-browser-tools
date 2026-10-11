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
var EXPECTED = 20;
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
    await sleep(1200); // the turn settles, then the pane reports its query
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


  /* P9-P13: shared settings, the pane's own menu, lists, Fit (full screen) */
  async function freshPane() {
    var hh = await openFs(browser);
    await hh.page.click(RING + " " + CHIP5);
    var pf = await paneOf(hh.page.mainFrame());
    return { h: hh, pane: pf };
  }
  var fp9 = null;
  try {
    fp9 = await freshPane();
    h = fp9.h; pane = fp9.pane;
    await h.page.selectOption("#colorby-select", "inverse");
    await waitFor(function () { return pane.evaluate(function () { return document.getElementById("colorby-select").value === "inverse"; }); }, 3000, "pane colour scheme");
    await h.page.evaluate(function () { var b = document.getElementById("layer-orders"); b.checked = true; b.dispatchEvent(new Event("change")); });
    await waitFor(function () { return pane.evaluate(function () { return document.querySelectorAll("#ring-svg .order-label").length === 4; }); }, 3000, "4 order labels in the pane");
    noErrors(h);
    record("P9 shared colours and layers reach the pane", null);
  } catch (e) { record("P9 shared colours and layers reach the pane", e); }

  try {
    assert(fp9, "no pane");
    await h.page.click("#legend-btn");
    await waitFor(function () {
      return pane.evaluate(function () {
        var l = document.getElementById("legend-panel"), pick = l.querySelector(".legend-pick");
        return l.classList.contains("is-shown") && getComputedStyle(pick).display === "none";
      });
    }, 3000, "pane legend");
    await h.page.selectOption("#dir-select", "ccw");
    await waitFor(function () { return pane.evaluate(function () { return document.getElementById("dir-select").value === "ccw"; }); }, 3000, "pane direction");
    await h.page.evaluate(function () { var c = document.getElementById("id-color"); c.value = "#123456"; c.dispatchEvent(new Event("input", { bubbles: true })); });
    await waitFor(function () { return pane.evaluate(function () { return document.getElementById("id-color").value === "#123456"; }); }, 3000, "pane identity colour");
    noErrors(h);
    record("P10 key, direction and identity colour reach the pane", null);
  } catch (e) { record("P10 key, direction and identity colour reach the pane", e); }

  try {
    assert(fp9, "no pane");
    await pane.click("#ring-svg", { button: "right" });
    var disp = await pane.evaluate(function () { return getComputedStyle(document.getElementById("ring-ctx")).display; });
    eq(disp, "block", "pane menu display");
    await pane.click("#ring-ctx .fs-menu-item");
    await waitFor(function () { return h.page.evaluate(function () { return document.getElementById("layer-orders").checked === false; }); }, 3000, "host orders off");
    await waitFor(async function () {
      var a = await h.page.evaluate(function () { return document.querySelectorAll('.fs-win[data-panel="ring"] #ring-svg .order-label').length; });
      var b = await pane.evaluate(function () { return document.querySelectorAll("#ring-svg .order-label").length; });
      return a === 0 && b === 0;
    }, 3000, "both order-label counts 0");
    noErrors(h);
    record("P11 the pane's right-click menu edits the shared layers", null);
  } catch (e) { record("P11 the pane's right-click menu edits the shared layers", e); }

  try {
    assert(fp9, "no pane");
    var disp12 = function (f, id) { return f.evaluate(function (i) { return getComputedStyle(document.getElementById(i)).display; }, id); };
    await h.page.click("#split-btn");
    eq(await disp12(h.page, "ring-split"), "flex", "host list display");
    await waitFor(function () {
      return pane.evaluate(function () {
        return getComputedStyle(document.getElementById("ring-split")).display === "flex" && document.querySelectorAll("#subgroups .subgroup-row").length === 4;
      });
    }, 3000, "the pane's list with 4 rows");
    await h.page.click("#split-btn");
    eq(await disp12(h.page, "ring-split"), "none", "host list closed");
    await waitFor(async function () { return (await disp12(pane, "ring-split")) === "none"; }, 3000, "pane list closed");
    await pane.focus("#rot-value");
    await pane.press("#rot-value", "F8");
    await waitFor(function () { return h.page.evaluate(function () { return document.getElementById("split-btn").getAttribute("aria-pressed") === "true"; }); }, 3000, "F8 in the pane opens the split");
    noErrors(h);
    record("P12 Splitview gives a list under each ring", null);
  } catch (e) { record("P12 Splitview gives a list under each ring", e); }

  try {
    assert(fp9, "no pane");
    await h.page.click("#split-btn"); // list closed again, so the fit is of the plain pair
    await sleep(300);
    var W = await h.page.evaluate(function () { var r = document.getElementById("diagram-frame").getBoundingClientRect(); return { w: r.width, h: r.height }; });
    await h.page.click(RING + " .fs-win-btn.is-fit");
    await sleep(400);
    var f13 = await h.page.evaluate(function (sel) {
      var win = document.querySelector(sel), fr = document.getElementById("diagram-frame").getBoundingClientRect(), r = win.getBoundingClientRect();
      return { right: r.right - fr.left, bottom: r.bottom - fr.top, svgH: win.querySelector("#ring-svg").getBoundingClientRect().height, paneW: win.querySelector("#iso-pane").getBoundingClientRect().width };
    }, RING);
    assert(f13.right <= W.w + 1, "window overflows the width: " + f13.right + " > " + W.w);
    assert(f13.bottom <= W.h - 44 + 1, "window overflows the height: " + f13.bottom + " > " + (W.h - 44));
    assert(f13.svgH >= 150, "ring only " + f13.svgH + "px tall");
    assert(f13.paneW >= 200, "pane only " + f13.paneW + "px wide");
    // an extra Ring window, its own pane, then Fit
    var extra = await openExtra(h);
    await extra.click(CHIP5);
    await paneOf(extra);
    var key = await h.page.evaluate(function () { var ws = document.querySelectorAll(".fs-win"); return ws.length; });
    assert(key >= 3, "extra window missing");
    await h.page.click('.fs-win:has(.fs-win-body.is-frame) .fs-win-btn.is-fit');
    await sleep(800);
    var r2 = await h.page.evaluate(function () {
      var win = document.querySelector(".fs-win:has(.fs-win-body.is-frame)"), fr = document.getElementById("diagram-frame").getBoundingClientRect(), r = win.getBoundingClientRect();
      return { right: r.right - fr.left, bottom: r.bottom - fr.top, left: r.left - fr.left, top: r.top - fr.top };
    });
    assert(r2.left >= -1 && r2.top >= -1 && r2.right <= W.w + 1 && r2.bottom <= W.h - 44 + 1, "extra window outside the desktop: " + JSON.stringify(r2));
    noErrors(h);
    record("P13 Fit keeps a window with a pane inside the desktop", null);
  } catch (e) { record("P13 Fit keeps a window with a pane inside the desktop", e); }
  if (fp9) await fp9.h.ctx.close();


  /* P14-P20: turning together and hovering, through g^k <-> h^k.
     Mapping, both rings in numeric arrangement: left Z/12 with g = 3, so left
     rot 0/3/6/9 is k = 0/1/2/3; right (Z/5Z)* with h = 2, powers [1,2,4,3],
     so k = 0/1/2/3 is right rot 0/1/3/2. */
  async function turnTo(target, v, expectIn, expected) {
    await target.fill("#rot-value", String(v));
    await target.press("#rot-value", "Enter");
    var watch = expectIn || target;
    await waitFor(async function () { return (await watch.inputValue("#rot-value")) === String(expected === undefined ? v : expected); }, 3000, "rot " + (expected === undefined ? v : expected));
  }
  async function rotOf(target) { return target.inputValue("#rot-value"); }
  async function hotOf(target) {
    return target.evaluate(function () {
      return Array.prototype.map.call(document.querySelectorAll("#ring-dynamic circle.bead.is-iso-hot"), function (b) { return b.getAttribute("data-el"); }).join(",");
    });
  }
  var fp14 = null;
  try {
    fp14 = await freshPane();
    h = fp14.h; pane = fp14.pane;
    await turnTo(h.page, 3, pane, 1);
    await turnTo(h.page, 6, pane, 3);
    await turnTo(h.page, 9, pane, 2);
    noErrors(h);
    record("P14 the host's turn turns the pane (g^k to h^k)", null);
  } catch (e) { record("P14 the host's turn turns the pane (g^k to h^k)", e); }

  try {
    assert(fp14, "no pane");
    await h.page.fill("#rot-value", "1");
    await h.page.press("#rot-value", "Enter");
    await waitFor(async function () { return (await rotOf(h.page)) === "1"; }, 3000, "host rot 1");
    await sleep(1200);
    eq(await rotOf(pane), "2", "pane rot after a left top outside the subgroup");
    noErrors(h);
    record("P15 a top outside the subgroup leaves the pane still", null);
  } catch (e) { record("P15 a top outside the subgroup leaves the pane still", e); }

  try {
    assert(fp14, "no pane");
    await turnTo(pane, 3, h.page, 6);
    await turnTo(pane, 2, h.page, 9);
    await pane.click("#rot-fwd");
    await sleep(900);
    var r = parseInt(await rotOf(pane), 10);
    var want = 3 * [0, 1, 3, 2].indexOf(r);
    await waitFor(async function () { return (await rotOf(h.page)) === String(want); }, 3000, "host rot " + want + " for pane rot " + r);
    noErrors(h);
    record("P16 the pane's turn turns the host", null);
  } catch (e) { record("P16 the pane's turn turns the host", e); }

  try {
    assert(fp14, "no pane");
    var bead = function (el) { return RING + ' #ring-svg circle.bead[data-el="' + el + '"]'; };
    await h.page.hover(bead(6));
    await waitFor(async function () { return (await hotOf(h.page)) === "6" && (await hotOf(pane)) === "4"; }, 3000, "host 6 / pane 4 lit");
    await h.page.hover(bead(1));
    await waitFor(async function () { return (await hotOf(pane)) === ""; }, 3000, "the pane's glow gone for a bead outside the subgroup");
    await pane.hover('#ring-svg circle.bead[data-el="3"]');
    await waitFor(async function () { return (await hotOf(h.page)) === "9" && (await hotOf(pane)) === "3"; }, 3000, "pane 3 / host 9 lit");
    await h.page.hover("#fs-clock");
    await waitFor(async function () { return (await hotOf(h.page)) === "" && (await hotOf(pane)) === ""; }, 3000, "both glows cleared on leaving");
    noErrors(h);
    record("P17 hover lights a bead and its image on both rings", null);
  } catch (e) { record("P17 hover lights a bead and its image on both rings", e); }
  if (fp14) await fp14.h.ctx.close();

  try {
    h = await openFs(browser);
    var extra18 = await openExtra(h);
    await extra18.click(CHIP5);
    var np18 = await paneOf(extra18);
    var topRot = await rotOf(h.page);
    await turnTo(extra18, 6, np18, 3);
    eq(await rotOf(h.page), topRot, "the top-level ring's rot");
    noErrors(h);
    record("P18 linked turning inside an extra Ring window", null);
  } catch (e) { record("P18 linked turning inside an extra Ring window", e); }
  if (h) await h.ctx.close();

  try {
    var fp19 = await freshPane();
    h = fp19.h; pane = fp19.pane;
    var before19 = await rotOf(pane);
    await h.page.selectOption("#gen-select", "4");
    await sleep(300);
    await h.page.fill("#rot-value", "4");
    await h.page.press("#rot-value", "Enter");
    await waitFor(async function () { return (await rotOf(h.page)) === "4"; }, 3000, "host rot 4");
    await sleep(1200);
    eq(await rotOf(pane), before19, "pane rot after the subgroup's order changed");
    var still = await h.page.evaluate(function () { return getComputedStyle(document.getElementById("iso-pane")).display !== "none"; });
    assert(still, "the pane closed");
    noErrors(h);
    record("P19 a subgroup of another order pauses the link", null);
  } catch (e) { record("P19 a subgroup of another order pauses the link", e); }
  if (h) await h.ctx.close();

  try {
    h = await openPage(browser);
    await h.page.click(".stage > .iso-panel " + CHIP5);
    pane = await paneOf(h.page.mainFrame());
    await turnTo(h.page, 3, pane, 1);
    await h.page.hover('#ring-svg circle.bead[data-el="6"]');
    await waitFor(async function () { return (await hotOf(pane)) === "4"; }, 3000, "pane bead 4 lit");
    noErrors(h);
    record("P20 normal page: turning and hover link the rings", null);
  } catch (e) { record("P20 normal page: turning and hover link the rings", e); }
  if (h) await h.ctx.close();

  await browser.close();
  var ok = results.filter(function (r) { return r.ok; }).length;
  var good = ok === results.length && results.length === EXPECTED;
  console.log("ISOPANE-PROBE " + (good ? "PASS" : "FAIL") + " (" + ok + "/" + EXPECTED + (results.length !== EXPECTED ? ", ran " + results.length : "") + ")");
  process.exit(good ? 0 : 1);
}

main().catch(function (e) { console.error(e); process.exit(2); });
