"use strict";
/*
 * Dev-only regression probe for quick task 261010-hp0: arrow keys switch
 * between subgroup rows in the Grid view of the Cyclic Groups tool.
 * Never referenced by any page. Node built-ins + the in-repo harness only.
 *
 * Copies assets/ and the Cyclic Groups page into a scratch site, injects a
 * probe script that dispatches real keydown events on the subgroup rows in
 * headless Chrome, and reads PASS/FAIL lines back from a <pre>.
 */

var fs = require("fs");
var path = require("path");
var cp = require("child_process");
var url = require("url");

var ROOT = path.resolve(__dirname, "..", "..", "..");
var harness = require(path.join(ROOT, ".planning", "phases", "07-shared-js-module-refactor", "harness.js"));

var EXPECTED = 9;

/* Runs inside the page (serialized with toString), after `load`. */
function pageProbe() {
  var out = document.getElementById("hp0-out");
  var lines = [];
  window.addEventListener("load", function () {
    function scenario(name, fn) {
      try { lines.push("PASS " + name + ": " + fn()); }
      catch (e) { lines.push("FAIL " + name + ": " + (e && e.message ? e.message : e)); }
    }
    function assert(cond, msg) { if (!cond) throw new Error(msg); }
    function rows() { return Array.prototype.slice.call(document.querySelectorAll("#subgroups .subgroup-row")); }
    function cur() { return document.querySelector("#subgroups .subgroup-row.is-current"); }
    function at(i) { rows()[i].click(); return cur(); }
    function idx(row) { return rows().indexOf(row); }
    function box(row) { var b = row.getBoundingClientRect(); return { left: b.left + window.scrollX, top: b.top + window.scrollY }; }
    function genOf(row) { return parseInt(/⟨(-?\d+)⟩/.exec(row.textContent)[1], 10); }
    function key(el, k, mods) {
      var init = { key: k, bubbles: true, cancelable: true };
      if (mods) for (var m in mods) init[m] = mods[m];
      var e = new KeyboardEvent("keydown", init);
      el.dispatchEvent(e);
      return e;
    }
    function selected(row) {
      assert(row.getAttribute("aria-pressed") === "true", "row not aria-pressed");
      assert(document.activeElement === row, "row does not hold focus");
      var sel = document.getElementById("gen-select");
      assert(sel.value === String(genOf(row)), "#gen-select is " + sel.value + ", row is " + genOf(row));
    }
    function colsNow() {
      var r = rows(), top = box(r[0]).top, n = 0;
      while (n < r.length && Math.abs(box(r[n]).top - top) <= 1) n++;
      return n;
    }
    function directlyBelow(a, next) {
      var b = box(next);
      assert(Math.abs(b.left - a.left) <= 1, "left changed: " + a.left + " -> " + b.left);
      assert(b.top > a.top, "not below: " + a.top + " -> " + b.top);
      rows().forEach(function (r) {
        var c = box(r);
        if (Math.abs(c.left - a.left) <= 1 && c.top > a.top + 1 && c.top < b.top - 1) {
          throw new Error("a row sits between the start and target in that column");
        }
      });
    }

    scenario("G0 grid-precondition", function () {
      var sg = document.getElementById("subgroups");
      assert(!sg.classList.contains("is-list"), "#subgroups has is-list");
      assert(document.getElementById("sub-grid").getAttribute("aria-pressed") === "true", "#sub-grid not pressed");
      assert(rows().length === 12, "row count is " + rows().length + ", expected 12");
      var c = colsNow();
      assert(c >= 2, "only " + c + " column(s): window too narrow, Grid scenarios would prove nothing");
      return c + " columns, 12 rows";
    });

    scenario("G1 grid-arrow-down", function () {
      var start = at(0), sbox = box(start);
      var e = key(start, "ArrowDown");
      assert(e.defaultPrevented, "ArrowDown not defaultPrevented");
      var next = cur();
      assert(next !== start, "selection did not move");
      directlyBelow(sbox, next);
      selected(next);
      return "row 0 -> row " + idx(next);
    });

    scenario("G2 grid-arrow-up", function () {
      var start = at(0);
      key(start, "ArrowDown");
      var down = cur();
      assert(idx(down) > 0, "ArrowDown did not move");
      var e = key(down, "ArrowUp");
      assert(e.defaultPrevented, "ArrowUp not defaultPrevented");
      assert(idx(cur()) === 0, "ArrowUp landed on index " + idx(cur()));
      selected(cur());
      return "back to row 0";
    });

    scenario("G3 grid-left-right", function () {
      var start = at(0), sbox = box(start);
      var e = key(start, "ArrowRight");
      assert(e.defaultPrevented, "ArrowRight not defaultPrevented");
      var r = cur(), rb = box(r);
      assert(idx(r) === 1, "ArrowRight landed on " + idx(r));
      assert(Math.abs(rb.top - sbox.top) <= 1 && rb.left > sbox.left, "row 1 is not to the right on the same line");
      selected(r);
      key(r, "ArrowLeft");
      assert(idx(cur()) === 0, "ArrowLeft landed on " + idx(cur()));
      selected(cur());
      var e2 = key(cur(), "ArrowLeft");
      assert(idx(cur()) === 0, "ArrowLeft at the start moved to " + idx(cur()));
      assert(e2.defaultPrevented, "edge ArrowLeft not defaultPrevented");
      return "0 -> 1 -> 0, start edge holds";
    });

    scenario("G4 grid-right-wraps", function () {
      var c = colsNow();
      var start = at(c - 1), sbox = box(start);
      key(start, "ArrowRight");
      var r = cur(), rb = box(r);
      assert(idx(r) === c, "ArrowRight landed on " + idx(r) + ", expected " + c);
      assert(rb.top > sbox.top && rb.left < sbox.left, "row " + c + " is not at the start of the next line");
      selected(r);
      return "row " + (c - 1) + " -> row " + c + " on the next line";
    });

    scenario("G5 grid-edges", function () {
      var last = rows().length - 1;
      var s1 = at(last);
      var e1 = key(s1, "ArrowDown");
      assert(idx(cur()) === last, "ArrowDown at the end moved to " + idx(cur()));
      assert(e1.defaultPrevented, "end ArrowDown not defaultPrevented");
      selected(cur());
      var s2 = at(0);
      var e2 = key(s2, "ArrowUp");
      assert(idx(cur()) === 0, "ArrowUp at the start moved to " + idx(cur()));
      assert(e2.defaultPrevented, "start ArrowUp not defaultPrevented");
      selected(cur());
      return "both edges hold";
    });

    scenario("G6 guards", function () {
      var s = at(1);
      var e1 = key(s, "ArrowDown", { shiftKey: true });
      assert(idx(cur()) === 1 && !e1.defaultPrevented, "Shift+ArrowDown acted");
      var e2 = key(cur(), "ArrowRight", { ctrlKey: true });
      assert(idx(cur()) === 1 && !e2.defaultPrevented, "Ctrl+ArrowRight acted");
      var e3 = key(cur(), "ArrowLeft", { altKey: true });
      assert(idx(cur()) === 1 && !e3.defaultPrevented, "Alt+ArrowLeft acted");
      var e4 = key(document.getElementById("n-input"), "ArrowDown");
      assert(idx(cur()) === 1 && !e4.defaultPrevented, "ArrowDown on #n-input acted");
      var e5 = key(document.getElementById("gen-select"), "ArrowRight");
      assert(idx(cur()) === 1 && !e5.defaultPrevented, "ArrowRight on #gen-select acted");
      return "modified and foreign-control arrows untouched";
    });

    scenario("G7 list-unchanged", function () {
      document.getElementById("sub-list").click();
      var sg = document.getElementById("subgroups");
      assert(sg.classList.contains("is-list"), "#subgroups lacks is-list");
      var s = at(0);
      var e1 = key(s, "ArrowDown");
      assert(idx(cur()) === 1 && e1.defaultPrevented, "list ArrowDown landed on " + idx(cur()));
      key(cur(), "ArrowUp");
      assert(idx(cur()) === 0, "list ArrowUp landed on " + idx(cur()));
      var e2 = key(cur(), "ArrowRight");
      assert(idx(cur()) === 0 && !e2.defaultPrevented, "list ArrowRight acted");
      var e3 = key(cur(), "ArrowLeft");
      assert(idx(cur()) === 0 && !e3.defaultPrevented, "list ArrowLeft acted");
      document.getElementById("sub-grid").click();
      assert(!sg.classList.contains("is-list"), "is-list remained after #sub-grid");
      return "up/down one row, left/right ignored";
    });

    scenario("G8 rtl-grid", function () {
      NT.i18n.setLang("he");
      var sg = document.getElementById("subgroups");
      try {
        assert(document.documentElement.dir === "rtl", "html dir is " + document.documentElement.dir);
        assert(getComputedStyle(sg).direction === "rtl", "#subgroups direction is " + getComputedStyle(sg).direction);
        assert(!sg.classList.contains("is-list"), "grid layout not active");
        var s = at(0), sbox = box(s);
        var b1 = box(rows()[1]);
        assert(Math.abs(b1.top - sbox.top) <= 1 && b1.left < sbox.left, "row 1 is not to the left of row 0");
        key(s, "ArrowLeft");
        assert(idx(cur()) === 1, "rtl ArrowLeft landed on " + idx(cur()));
        selected(cur());
        key(cur(), "ArrowRight");
        assert(idx(cur()) === 0, "rtl ArrowRight landed on " + idx(cur()));
        var s0 = cur(), s0box = box(s0);
        key(s0, "ArrowDown");
        assert(idx(cur()) > 0, "rtl ArrowDown did not move");
        directlyBelow(s0box, cur());
        selected(cur());
      } finally {
        NT.i18n.setLang("en");
      }
      return "ArrowLeft moves left on screen in he, ArrowDown stays in the column";
    });

    //__SCENARIOS__

    out.textContent = lines.join("\n");
  });
}

function buildSite() {
  var siteRoot = harness.mkScratch("hp0-site-");
  fs.cpSync(path.join(ROOT, "assets"), path.join(siteRoot, "assets"), { recursive: true });
  var src = fs.readFileSync(path.join(ROOT, "Cyclic Groups", "cyclic-groups.html"), "utf8");
  var probe = "(" + pageProbe.toString() + ")();";
  var markup = '<pre id="hp0-out"></pre>\n<script>\n' + probe + "\n</script>\n";
  var at = src.lastIndexOf("</body>");
  if (at < 0) throw new Error("no closing body tag in cyclic-groups.html");
  var page = src.slice(0, at) + markup + src.slice(at);
  var destDir = path.join(siteRoot, "Cyclic Groups");
  fs.mkdirSync(destDir, { recursive: true });
  var dest = path.join(destDir, "cyclic-groups.html");
  fs.writeFileSync(dest, page);
  return dest;
}

function unescapeHtml(s) {
  return s.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, "&");
}

function runChrome(fileUrl) {
  var profileDir = harness.mkScratch("hp0-profile-");
  var args = [
    "--headless=new", "--disable-gpu", "--no-sandbox",
    "--user-data-dir=" + profileDir,
    "--virtual-time-budget=5000",
    "--window-size=1600,1000",
    "--dump-dom",
    fileUrl
  ];
  var res = cp.spawnSync("google-chrome", args, {
    encoding: "utf8", maxBuffer: 200 * 1024 * 1024, timeout: 60000, env: harness.chromeEnv()
  });
  try { fs.rmSync(profileDir, { recursive: true, force: true }); } catch (e) { /* best effort */ }
  return res.stdout || "";
}

function main() {
  var page = buildSite();
  var dom = runChrome(url.pathToFileURL(page).href);
  var m = /<pre id="hp0-out"[^>]*>([\s\S]*?)<\/pre>/.exec(dom);
  if (!m) {
    console.log("FAIL: probe output <pre id=\"hp0-out\"> missing from the dumped DOM");
    process.exit(1);
  }
  var lines = unescapeHtml(m[1]).split("\n").filter(function (l) { return l.length > 0; });
  lines.forEach(function (l) { console.log(l); });
  var fails = lines.filter(function (l) { return /^FAIL/.test(l); }).length;
  var passes = lines.filter(function (l) { return /^PASS/.test(l); }).length;
  if (fails > 0 || passes !== EXPECTED) {
    console.log("HP0-PROBE FAIL (" + passes + " pass, " + fails + " fail, expected " + EXPECTED + " scenarios)");
    process.exit(1);
  }
  console.log("HP0-PROBE PASS (" + passes + " scenarios)");
  process.exit(0);
}

main();
