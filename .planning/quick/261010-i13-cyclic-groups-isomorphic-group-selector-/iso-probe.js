"use strict";
/*
 * Dev-only regression probe for quick task 261010-i13: the isomorphic-group
 * selector card of the Cyclic Groups tool. Never referenced by any page.
 * Node built-ins + the in-repo harness only.
 *
 * Copies assets/ and the Cyclic Groups page into a scratch site, injects a
 * recorder (storage writes, errors) and a probe script, runs headless Chrome
 * and reads PASS/FAIL lines back from a <pre>.
 *
 * Run A: the main page. Run B: the page loaded on the href of a card link
 * (the LANDING set, recognised by noshare=1). Run C: a narrow window (the
 * NARROW set, recognised by the #iso-narrow hash).
 */

var fs = require("fs");
var path = require("path");
var cp = require("child_process");
var url = require("url");

var ROOT = path.resolve(__dirname, "..", "..", "..");
var harness = require(path.join(ROOT, ".planning", "phases", "07-shared-js-module-refactor", "harness.js"));

var EXPECTED = 17;
// Headless Chrome's --window-size counts ~143px of window chrome the page
// never sees, so a 1600x1000 viewport needs a window 1143 tall (I8 asserts
// innerHeight). A window narrower than ~500px is raised to ~500 (N1 reports
// the width it got).
var DESKTOP = "1600,1143";

/* Runs first inside <head>: records storage writes and errors. */
function recorder() {
  window.__i13Writes = [];
  window.__i13Errors = [];
  var orig = Storage.prototype.setItem;
  Storage.prototype.setItem = function (k, v) {
    window.__i13Writes.push(String(k));
    return orig.call(this, k, v);
  };
  window.addEventListener("error", function (e) { window.__i13Errors.push("error: " + (e && e.message)); });
  window.addEventListener("unhandledrejection", function (e) { window.__i13Errors.push("rejection: " + (e && e.reason)); });
  var origErr = console.error;
  console.error = function () {
    window.__i13Errors.push("console.error: " + Array.prototype.join.call(arguments, " "));
    return origErr.apply(console, arguments);
  };
}

/* Runs inside the page (serialized with toString), after `load`. */
function pageProbe() {
  var out = document.getElementById("i13-out");
  var lines = [];
  window.addEventListener("load", function () {
    function scenario(name, fn) {
      try { lines.push("PASS " + name + ": " + fn()); }
      catch (e) { lines.push("FAIL " + name + ": " + (e && e.message ? e.message : e)); }
    }
    function assert(cond, msg) { if (!cond) throw new Error(msg); }
    function eq(actual, expected, what) {
      if (actual !== expected) throw new Error(what + ": got " + JSON.stringify(actual) + ", expected " + JSON.stringify(expected));
    }
    function $(id) { return document.getElementById(id); }
    function panel() { return $("iso-panel"); }
    function shown(el) { return !!el && !el.hidden && el.getClientRects().length > 0; }
    function addLinks() { return Array.prototype.slice.call(document.querySelectorAll("#iso-add a")); }
    function params(a) { return new URL(a.href).searchParams; }
    function pick(g) {
      var sel = $("gen-select");
      sel.value = String(g);
      sel.dispatchEvent(new Event("change", { bubbles: true }));
    }
    function txt(el) { return (el && el.textContent || "").trim(); }
    function mulLinks() { return Array.prototype.slice.call(document.querySelectorAll("#iso-mul a")); }
    function setN(v) {
      var n = $("n-input");
      n.value = v;
      n.dispatchEvent(new Event("input", { bubbles: true }));
    }
    function chipList(links) {
      return links.map(function (a) {
        var p = params(a);
        return [txt(a.querySelector(".iso-name")), p.get("mode"), p.get("n"), p.get("gen")].join("|");
      });
    }
    function same(actual, expected, what) { eq(actual.join(" ; "), expected.join(" ; "), what); }

    if (new URLSearchParams(location.search).get("noshare") === "1") {
      //__LANDING__
    } else if (location.hash === "#iso-narrow") {
      //__NARROW__
    } else {
      //__MAIN__
    }

    out.textContent = lines.join("\n");
  });
}

/* ---------- scenario bodies, spliced into pageProbe ---------- */

var MAIN = function () {
  scenario("I0 control-share", function () {
    assert(window.__i13Writes.indexOf("group-params") !== -1, "a plain ?mode=&n= load did not write group-params; writes: " + window.__i13Writes.join(","));
    return "group-params written on a plain link load";
  });

  scenario("I1 additive-tile", function () {
    assert(shown(panel()), "#iso-panel not shown");
    eq(panel().parentElement.id, "ring-panel", "panel parent");
    eq(panel().previousElementSibling.id, "diagram-frame", "previous sibling");
    assert(panel().nextElementSibling.classList.contains("subgroups-panel"), "next sibling is not .subgroups-panel");
    eq($("iso-lead").textContent, "⟨3⟩ is cyclic of order 4, so it is isomorphic to:", "lead");
    assert(shown($("iso-add")), "#iso-add not shown");
    var links = addLinks();
    eq(links.length, 1, "additive link count");
    eq(txt(links[0].querySelector(".iso-name")), "Z/4", "additive notation");
    eq(txt(document.querySelector("#iso-add .iso-kind")), "additive", "additive caption");
    return "card in place, Z/4";
  });

  scenario("I2 additive-href", function () {
    eq(new URLSearchParams(location.search).get("rot"), "2", "precondition rot");
    var a = addLinks()[0];
    var p = params(a);
    eq(a.getAttribute("target"), "_blank", "target");
    assert(/noopener/.test(a.getAttribute("rel") || ""), "rel lacks noopener");
    eq(p.get("mode"), "additive", "mode");
    eq(p.get("n"), "4", "n");
    eq(p.get("gen"), "1", "gen");
    eq(p.get("noshare"), "1", "noshare");
    eq(p.get("lang"), NT.i18n.getLang(), "lang");
    assert(!p.has("rot"), "rot rides along");
    eq(new URL(a.href).pathname, location.pathname, "pathname");
    var here = new URLSearchParams(location.search);
    var skip = { mode: 1, n: 1, gen: 1, rot: 1, lang: 1, noshare: 1 };
    here.forEach(function (v, k) {
      if (skip[k]) return;
      eq(p.get(k), v, "carried " + k);
    });
    eq(p.get("dir"), "ccw", "dir");
    eq(p.get("sublayout"), "list", "sublayout");
    eq(p.get("colorby"), "inverse", "colorby");
    eq(a.getAttribute("title"), "Open Z/4 in a new tab", "title");
    eq(a.getAttribute("aria-label"), "Open Z/4 in a new tab", "aria-label");
    lines.push("ISO-HREF " + a.href);
    return "href " + a.getAttribute("href");
  });

  scenario("I3 mul-chips", function () {
    pick(3);
    same(chipList(mulLinks()), ["(Z/5)*|multiplicative|5|2", "(Z/10)*|multiplicative|10|3"], "k=4 chips");
    assert(shown($("iso-mul")), "#iso-mul not shown");
    var ls = mulLinks();
    ls.forEach(function (a, i) {
      var label = i === 0 ? "(Z/5)*" : "(Z/10)*";
      eq(a.getAttribute("target"), "_blank", "target");
      assert(/noopener/.test(a.getAttribute("rel") || ""), "rel lacks noopener");
      eq(params(a).get("noshare"), "1", "noshare");
      eq(a.getAttribute("title"), "Open " + label + " in a new tab", "title");
    });
    pick(6);
    eq($("iso-lead").textContent, "⟨6⟩ is cyclic of order 2, so it is isomorphic to:", "k=2 lead");
    same(chipList(addLinks()), ["Z/2|additive|2|1"], "k=2 additive");
    same(chipList(mulLinks()), ["(Z/3)*|multiplicative|3|2", "(Z/4)*|multiplicative|4|3", "(Z/6)*|multiplicative|6|5"], "k=2 chips");
    return "k=4 and k=2 chip lists";
  });

  scenario("I4 additive-only", function () {
    pick(4);
    same(chipList(addLinks()), ["Z/3|additive|3|1"], "k=3 additive");
    assert($("iso-mul").hidden, "#iso-mul not hidden for k=3");
    eq(mulLinks().length, 0, "mul links for k=3");
    assert(shown(panel()), "panel hidden for k=3");
    setN("16");
    pick(2);
    same(chipList(addLinks()), ["Z/8|additive|8|1"], "k=8 additive");
    assert($("iso-mul").hidden, "#iso-mul not hidden for k=8");
    assert(shown(panel()), "panel hidden for k=8");
    setN("12");
    pick(3);
    return "k=3 and k=8 show the additive tile only";
  });

  scenario("I5 identity-hidden", function () {
    pick(0);
    assert(panel().hidden === true, "panel not hidden for the identity");
    eq(panel().getClientRects().length, 0, "panel has boxes");
    pick(3);
    assert(shown(panel()), "panel not shown again");
    return "hidden for <0>, back for <3>";
  });

  scenario("I6 multiplicative-mode", function () {
    $("tab-multiplicative").click();
    setN("7");
    pick(3);
    same(chipList(addLinks()), ["Z/6|additive|6|1"], "(Z/7)* additive");
    same(chipList(mulLinks()), ["(Z/7)*|multiplicative|7|3", "(Z/9)*|multiplicative|9|2", "(Z/14)*|multiplicative|14|3", "(Z/18)*|multiplicative|18|5"], "(Z/7)* chips");
    setN("8");
    pick(3);
    eq($("iso-lead").textContent, "⟨3⟩ is cyclic of order 2, so it is isomorphic to:", "(Z/8)* lead");
    same(chipList(mulLinks()), ["(Z/3)*|multiplicative|3|2", "(Z/4)*|multiplicative|4|3", "(Z/6)*|multiplicative|6|5"], "(Z/8)* chips");
    $("tab-additive").click();
    setN("12");
    pick(3);
    return "(Z/7)* and (Z/8)* lists";
  });

  scenario("I7 link-freshness", function () {
    var all = function () { return Array.prototype.slice.call(document.querySelectorAll("#iso-panel a.iso-chip")); };
    assert(all().length > 0, "no links");
    all().forEach(function (a) { assert(!params(a).has("gentop"), "gentop present before the click"); });
    $("gen-top").click();
    all().forEach(function (a) { eq(params(a).get("gentop"), "1", "gentop after the click"); });
    $("gen-top").click();
    all().forEach(function (a) { assert(!params(a).has("gentop"), "gentop still present after the second click"); });
    return "hrefs follow gentop";
  });

  scenario("I8 desktop-layout", function () {
    pick(3);
    assert(shown($("iso-add")) && shown($("iso-mul")), "a tile is missing");
    assert(window.innerHeight >= 1000, "viewport is only " + window.innerHeight + "px tall");
    var pb = panel().getBoundingClientRect();
    var sb = document.querySelector(".subgroups-panel").getBoundingClientRect();
    var fb = $("diagram-frame").getBoundingClientRect();
    assert(pb.bottom <= sb.top + 0.5, "panel overlaps the subgroups panel: " + pb.bottom + " > " + sb.top);
    assert(pb.top >= fb.bottom - 0.5, "panel overlaps the diagram: " + pb.top + " < " + fb.bottom);
    assert(fb.height >= 300, "diagram only " + Math.round(fb.height) + "px tall; innerHeight " + window.innerHeight + ", stage " + Math.round($("ring-panel").getBoundingClientRect().height) + ", iso " + Math.round(pb.height) + ", subgroups " + Math.round(sb.height));
    var logos = document.querySelectorAll("#iso-panel svg.iso-logo");
    eq(logos.length, 2, "logo count");
    Array.prototype.forEach.call(logos, function (l) { eq(l.getAttribute("aria-hidden"), "true", "logo aria-hidden"); });
    Array.prototype.forEach.call(document.querySelectorAll("#iso-panel a.iso-chip"), function (a) {
      eq(a.tabIndex, 0, "tabIndex");
      assert(a.getAttribute("href"), "empty href");
    });
    return "no overlap, diagram " + Math.round(fb.height) + "px, 2 logos";
  });

  function englishCard(what) {
    eq($("iso-lead").textContent, "⟨3⟩ is cyclic of order 4, so it is isomorphic to:", what + " lead");
    eq(txt(document.querySelector("#iso-add .iso-kind")), "additive", what + " additive caption");
    eq(txt(document.querySelector("#iso-mul .iso-kind")), "multiplicative", what + " multiplicative caption");
    var z4 = addLinks()[0];
    eq(z4.getAttribute("title"), "Open Z/4 in a new tab", what + " title");
    eq(z4.getAttribute("aria-label"), "Open Z/4 in a new tab", what + " aria-label");
    var raw = [panel().textContent];
    Array.prototype.forEach.call(panel().querySelectorAll("[title],[aria-label]"), function (el) {
      raw.push(el.getAttribute("title") || "", el.getAttribute("aria-label") || "");
    });
    assert(!/cyclicGroups\./.test(raw.join("\n")), what + ": a raw key shows");
  }
  function everyHrefLang(lang) {
    var links = document.querySelectorAll("#iso-panel a.iso-chip");
    assert(links.length > 0, "no links");
    Array.prototype.forEach.call(links, function (a) { eq(params(a).get("lang"), lang, "href lang"); });
  }

  scenario("I9 fallback-nl", function () {
    pick(3);
    NT.i18n.setLang("nl");
    try {
      eq(document.documentElement.lang, "nl", "html lang");
      eq(document.querySelector(".subgroups-panel h2").textContent, "Subgroep voortgebracht door elk element", "Dutch control heading");
      englishCard("nl");
      everyHrefLang("nl");
    } finally {
      NT.i18n.setLang("en");
    }
    return "English card text in Dutch, hrefs carry nl";
  });

  scenario("I10 fallback-ar-rtl", function () {
    pick(3);
    NT.i18n.setLang("ar");
    try {
      eq(document.documentElement.dir, "rtl", "html dir");
      eq(document.querySelector(".subgroups-panel h2").textContent, "الزمرة الجزئية التي يولدها كل عنصر", "Arabic control heading");
      englishCard("ar");
      everyHrefLang("ar");
      Array.prototype.forEach.call(document.querySelectorAll("#iso-panel a.iso-chip"), function (a) {
        eq(getComputedStyle(a).direction, "ltr", "chip direction");
      });
      assert(shown(panel()), "panel not shown in ar");
    } finally {
      NT.i18n.setLang("en");
    }
    return "English card text under dir=rtl, chips stay ltr, hrefs carry ar";
  });

  scenario("I11 no-errors-main", function () {
    assert(window.__i13Errors.length === 0, "errors: " + window.__i13Errors.join(" | "));
    return "no window error, rejection or console.error";
  });
};

var LANDING = function () {
  scenario("L1 landing-state", function () {
    eq($("n-input").value, "4", "n");
    eq($("tab-additive").getAttribute("aria-selected"), "true", "additive tab");
    eq($("gen-select").value, "1", "gen");
    eq($("dir-select").value, "ccw", "dir");
    eq($("sub-list").getAttribute("aria-pressed"), "true", "list layout");
    assert(!new URLSearchParams(location.search).has("rot"), "rot in the address bar");
    eq($("iso-lead").textContent, "⟨1⟩ is cyclic of order 4, so it is isomorphic to:", "lead");
    return "Z/4 with <1>, settings kept";
  });

  scenario("L2 landing-no-share", function () {
    assert(window.__i13Writes.indexOf("group-params") === -1, "group-params written on a noshare load");
    return "no group-params write";
  });

  scenario("L3 no-errors-landing", function () {
    assert(window.__i13Errors.length === 0, "errors: " + window.__i13Errors.join(" | "));
    return "no window error, rejection or console.error";
  });
};

var NARROW = function () {
  scenario("N1 narrow", function () {
    var panel = document.getElementById("iso-panel");
    assert(!panel.hidden && panel.getClientRects().length > 0, "#iso-panel not shown");
    assert(document.documentElement.scrollWidth <= window.innerWidth + 1, "horizontal overflow: " + document.documentElement.scrollWidth + " > " + window.innerWidth);
    Array.prototype.forEach.call(document.querySelectorAll("#iso-panel .iso-tile"), function (t) {
      var b = t.getBoundingClientRect();
      assert(b.left >= -0.5 && b.right <= window.innerWidth + 0.5, "tile outside the window: " + b.left + ".." + b.right);
    });
    return "no overflow at " + window.innerWidth + "px";
  });

  scenario("N2 no-errors-narrow", function () {
    assert(window.__i13Errors.length === 0, "errors: " + window.__i13Errors.join(" | "));
    return "no window error, rejection or console.error";
  });
};

function bodyOf(fn) {
  var s = fn.toString();
  return s.slice(s.indexOf("{") + 1, s.lastIndexOf("}"));
}

function buildSite() {
  var siteRoot = harness.mkScratch("i13-site-");
  fs.cpSync(path.join(ROOT, "assets"), path.join(siteRoot, "assets"), { recursive: true });
  var src = fs.readFileSync(path.join(ROOT, "Cyclic Groups", "cyclic-groups.html"), "utf8");

  var probeSrc = pageProbe.toString()
    .replace("//__LANDING__", function () { return bodyOf(LANDING); })
    .replace("//__NARROW__", function () { return bodyOf(NARROW); })
    .replace("//__MAIN__", function () { return bodyOf(MAIN); });
  var probe = "(" + probeSrc + ")();";

  var headAt = src.indexOf("<head>");
  if (headAt < 0) throw new Error("no opening head tag in cyclic-groups.html");
  headAt += "<head>".length;
  var bodyAt = src.lastIndexOf("</body>");
  if (bodyAt < 0) throw new Error("no closing body tag in cyclic-groups.html");

  var page = src.slice(0, headAt) +
    "\n<script>(" + recorder.toString() + ")();</script>\n" +
    src.slice(headAt, bodyAt) +
    '<pre id="i13-out"></pre>\n<script>\n' + probe + "\n</script>\n" +
    src.slice(bodyAt);
  var destDir = path.join(siteRoot, "Cyclic Groups");
  fs.mkdirSync(destDir, { recursive: true });
  var dest = path.join(destDir, "cyclic-groups.html");
  fs.writeFileSync(dest, page);
  return dest;
}

function unescapeHtml(s) {
  return s.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, "&");
}

function runChrome(fileUrl, size) {
  var profileDir = harness.mkScratch("i13-profile-");
  var args = [
    "--headless=new", "--disable-gpu", "--no-sandbox",
    "--user-data-dir=" + profileDir,
    "--virtual-time-budget=5000",
    "--window-size=" + size,
    "--dump-dom",
    fileUrl
  ];
  var res = cp.spawnSync("google-chrome", args, {
    encoding: "utf8", maxBuffer: 200 * 1024 * 1024, timeout: 60000, env: harness.chromeEnv()
  });
  try { fs.rmSync(profileDir, { recursive: true, force: true }); } catch (e) { /* best effort */ }
  return res.stdout || "";
}

function readOut(dom, label) {
  var m = /<pre id="i13-out"[^>]*>([\s\S]*?)<\/pre>/.exec(dom);
  if (!m) return ["FAIL " + label + ": probe output <pre id=\"i13-out\"> missing from the dumped DOM"];
  return unescapeHtml(m[1]).split("\n").filter(function (l) { return l.length > 0; });
}

function main() {
  var page = buildSite();
  var pageUrl = url.pathToFileURL(page).href;
  var all = [];

  var a = readOut(runChrome(pageUrl + "?mode=additive&n=12&gen=3&rot=2&dir=ccw&sublayout=list&colorby=inverse&lang=en", DESKTOP), "run A");
  all = all.concat(a);

  var hrefLine = a.filter(function (l) { return /^ISO-HREF /.test(l); })[0];
  if (hrefLine) {
    all = all.concat(readOut(runChrome(hrefLine.slice("ISO-HREF ".length), DESKTOP), "run B"));
  }

  all = all.concat(readOut(runChrome(pageUrl + "?mode=additive&n=12&gen=3&rot=2&dir=ccw&sublayout=list&colorby=inverse&lang=en#iso-narrow", "420,900"), "run C"));

  all.forEach(function (l) { console.log(l); });
  var fails = all.filter(function (l) { return /^FAIL/.test(l); }).length;
  var passes = all.filter(function (l) { return /^PASS/.test(l); }).length;
  if (fails > 0 || passes !== EXPECTED) {
    console.log("I13-PROBE FAIL (" + passes + " pass, " + fails + " fail, expected " + EXPECTED + " scenarios)");
    process.exit(1);
  }
  console.log("I13-PROBE PASS (" + passes + " scenarios)");
  process.exit(0);
}

main();
