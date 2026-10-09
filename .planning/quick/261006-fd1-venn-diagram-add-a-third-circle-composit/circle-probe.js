"use strict";
/*
 * Dev-only regression probe for quick task 261006-fd1: the Venn Diagram's
 * third "Circle composites" pane (two- and three-circle mode). Never
 * referenced by any page. Node built-ins + the in-repo harness only.
 *
 * Pre-flight: every inline <script> of the page is compiled with vm.Script
 * (a syntax check without running anything). Then the assets/ folder and the
 * Venn page are copied into a scratch site, a probe script is injected that
 * exercises the pane in headless Chrome, and PASS/FAIL lines are read back
 * from a <pre>. The page is run at two window sizes (1920x1000 and
 * 1280x900) so both layout branches are exercised.
 */

var fs = require("fs");
var path = require("path");
var cp = require("child_process");
var url = require("url");
var vm = require("vm");

var ROOT = path.resolve(__dirname, "..", "..", "..");
var harness = require(path.join(ROOT, ".planning", "phases", "07-shared-js-module-refactor", "harness.js"));

var EXPECTED = 9;
var SIZES = ["1920,1000", "1280,900"];

var PROBE_BODY = [
  "(function(){",
  "  var out = document.getElementById('fd1-out');",
  "  var lines = [];",
  "  var hrefs = [];",
  "  var errors = [];",
  "  window.addEventListener('error', function(e){ errors.push(String(e && e.message ? e.message : e)); });",
  "  window.addEventListener('load', function(){",
  "    window.open = function(href){ hrefs.push(String(href)); return { opener: null }; };",
  "",
  "    function scenario(name, fn){",
  "      try { lines.push('PASS ' + name + ': ' + fn()); }",
  "      catch (e) { lines.push('FAIL ' + name + ': ' + (e && e.message ? e.message : e)); }",
  "    }",
  "    function assert(cond, msg){ if (!cond) throw new Error(msg); }",
  "    function ev(el, type){",
  "      var e;",
  "      if (type === 'focus' || type === 'blur') e = new FocusEvent(type);",
  "      else if (type === 'dblclick') e = new MouseEvent('dblclick', { bubbles: true, cancelable: true });",
  "      else e = new MouseEvent(type);",
  "      el.dispatchEvent(e);",
  "    }",
  "    function chip(host, region){",
  "      var el = document.querySelector('#' + host + ' [data-region=\"' + region + '\"]');",
  "      assert(el, 'chip not found: ' + host + ' ' + region);",
  "      return el;",
  "    }",
  "    function enter(el, extra){",
  "      var init = { key: 'Enter', bubbles: true, cancelable: true };",
  "      if (extra) for (var k in extra) init[k] = extra[k];",
  "      var e = new KeyboardEvent('keydown', init);",
  "      return !el.dispatchEvent(e);",
  "    }",
  "    function opened(fn){",
  "      var n = hrefs.length;",
  "      fn();",
  "      return hrefs.slice(n);",
  "    }",
  "    function badgeText(host, key){",
  "      var t = document.querySelector('#' + host + ' [data-region=\"' + key + '\"] text');",
  "      assert(t, 'badge not found: ' + host + ' ' + key);",
  "      return t.textContent;",
  "    }",
  "    function onlyComposite(host, key){",
  "      var all = document.querySelectorAll('#' + host + ' [data-circle=\"' + key + '\"], #' + host + ' .circle-prime-chip');",
  "      var texts = document.querySelectorAll('#' + host + ' [data-region=\"' + key + '\"] text');",
  "      return all.length === 0 && texts.length === 1;",
  "    }",
  "    function rowText(id){",
  "      var el = document.getElementById(id);",
  "      assert(el, 'product row not found: ' + id);",
  "      return el.textContent;",
  "    }",
  "    function rowTail(id){",
  "      var s = rowText(id);",
  "      return s.substring(s.lastIndexOf('= ') + 2);",
  "    }",
  "    function rowFactors(id){",
  "      var s = rowText(id).replace(/^[ABC] = /, '');",
  "      if (s.indexOf(' = ') >= 0) s = s.substring(0, s.indexOf(' = '));",
  "      if (s === '1') return [];",
  "      return s.split(' * ');",
  "    }",
  "    function same(a, b){ return a.join(',') === b.join(','); }",
  "    function panes(frameId){",
  "      return document.querySelectorAll('#' + frameId + ' .diagram-split > .diagram-pane');",
  "    }",
  "    function circlesIn(id){",
  "      var nodes = document.querySelectorAll('#' + id + ' circle');",
  "      var res = [];",
  "      for (var i = 0; i < nodes.length; i++){",
  "        res.push({ cx: +nodes[i].getAttribute('cx'), cy: +nodes[i].getAttribute('cy'), r: +nodes[i].getAttribute('r') });",
  "      }",
  "      return res;",
  "    }",
  "    function separated(cs, vbW, vbH){",
  "      for (var i = 0; i < cs.length; i++){",
  "        assert(cs[i].cx - cs[i].r >= 0 && cs[i].cx + cs[i].r <= vbW && cs[i].cy - cs[i].r >= 0 && cs[i].cy + cs[i].r <= vbH, 'circle ' + i + ' leaves the viewBox');",
  "        for (var j = i + 1; j < cs.length; j++){",
  "          var d = Math.sqrt(Math.pow(cs[i].cx - cs[j].cx, 2) + Math.pow(cs[i].cy - cs[j].cy, 2));",
  "          assert(d >= cs[i].r + cs[j].r + 1, 'circles ' + i + ' and ' + j + ' overlap (distance ' + d + ')');",
  "        }",
  "      }",
  "    }",
  "",
  "    //__SCENARIOS__",
  "",
  "    out.textContent = lines.join('\\n');",
  "  });",
  "})();"
].join("\n");

var SCEN = [
  "    scenario('S1 two-pane-present', function(){",
  "      assert(errors.length === 0, 'errors so far: ' + errors.join('; '));",
  "      var ps = panes('frame-two');",
  "      assert(ps.length === 3, 'frame-two has ' + ps.length + ' panes');",
  "      assert(ps[2].classList.contains('pane-circles'), 'third pane is not pane-circles');",
  "      var cap = ps[2].querySelector('.pane-caption').textContent;",
  "      assert(cap === NT.i18n.translate('venn.pane.circleComposite'), 'caption is ' + JSON.stringify(cap));",
  "      var svg = document.getElementById('venn-circles');",
  "      assert(svg, 'svg#venn-circles missing');",
  "      assert(svg.getAttribute('aria-label') === NT.i18n.translate('venn.aria.twoCircleComposite'), 'aria-label is ' + svg.getAttribute('aria-label'));",
  "      assert(svg.getAttribute('viewBox') === '0 0 900 520', 'viewBox is ' + svg.getAttribute('viewBox'));",
  "      return 'three panes, caption and aria-label bound';",
  "    });",
  "",
  "    scenario('S2 two-separated', function(){",
  "      var cs = circlesIn('venn-circles-static');",
  "      assert(cs.length === 2, 'static holds ' + cs.length + ' circles');",
  "      separated(cs, 900, 520);",
  "      return 'two circles, no overlap, inside the viewBox';",
  "    });",
  "",
  "    scenario('S3 two-values', function(){",
  "      var h = 'venn-circles-dynamic';",
  "      assert(badgeText(h, 'circle-a') === rowTail('product-left'), 'A badge ' + badgeText(h, 'circle-a') + ' vs row ' + rowTail('product-left'));",
  "      assert(badgeText(h, 'circle-b') === rowTail('product-right'), 'B badge ' + badgeText(h, 'circle-b') + ' vs row ' + rowTail('product-right'));",
  "      assert(badgeText(h, 'circle-a') === '30' && badgeText(h, 'circle-b') === '35', 'default badges are ' + badgeText(h, 'circle-a') + ' / ' + badgeText(h, 'circle-b'));",
  "      assert(onlyComposite(h, 'circle-a') && onlyComposite(h, 'circle-b'), 'a circle shows more than its composite');",
  "      return 'A shows only 30, B shows only 35';",
  "    });",
  "",
  "    scenario('S4 layout', function(){",
  "      var ps = panes('frame-two');",
  "      var r = [];",
  "      for (var i = 0; i < ps.length; i++) r.push(ps[i].getBoundingClientRect());",
  "      var w = window.innerWidth;",
  "      function near(a, b){ return Math.abs(a - b) <= 2; }",
  "      if (w > 1500){",
  "        assert(near(r[0].top, r[1].top) && near(r[1].top, r[2].top), 'tops differ: ' + r[0].top + ' ' + r[1].top + ' ' + r[2].top);",
  "        assert(near(r[0].width, r[1].width) && near(r[1].width, r[2].width), 'widths differ: ' + r[0].width + ' ' + r[1].width + ' ' + r[2].width);",
  "        return 'innerWidth ' + w + ': one row of three';",
  "      }",
  "      assert(w > 860, 'probe window is too narrow for the layout check: ' + w);",
  "      var split = document.querySelector('#frame-two .diagram-split').getBoundingClientRect();",
  "      assert(near(r[0].top, r[1].top), 'interactive and composite tops differ: ' + r[0].top + ' ' + r[1].top);",
  "      assert(r[2].top >= r[0].bottom - 1, 'circles pane does not wrap below: ' + r[2].top + ' vs ' + r[0].bottom);",
  "      assert(near(r[2].width, r[0].width), 'circles width ' + r[2].width + ' vs ' + r[0].width);",
  "      assert(near(r[2].left + r[2].width / 2, split.left + split.width / 2), 'circles pane is not centred');",
  "      return 'innerWidth ' + w + ': two on top, circles centred below';",
  "    });",
  "",
  "    scenario('S5 three-pane-present-and-separated', function(){",
  "      document.getElementById('mode-three').click();",
  "      try {",
  "        var ps = panes('frame-three');",
  "        assert(ps.length === 3, 'frame-three has ' + ps.length + ' panes');",
  "        assert(ps[2].classList.contains('pane-circles'), 'third pane is not pane-circles');",
  "        var cap = ps[2].querySelector('.pane-caption').textContent;",
  "        assert(cap === NT.i18n.translate('venn.pane.circleComposite'), 'caption is ' + JSON.stringify(cap));",
  "        var svg = document.getElementById('venn3-circles');",
  "        assert(svg, 'svg#venn3-circles missing');",
  "        assert(svg.getAttribute('aria-label') === NT.i18n.translate('venn.aria.threeCircleComposite'), 'aria-label is ' + svg.getAttribute('aria-label'));",
  "        assert(svg.getAttribute('viewBox') === '0 0 900 700', 'viewBox is ' + svg.getAttribute('viewBox'));",
  "        var cs = circlesIn('venn3-circles-static');",
  "        assert(cs.length === 3, 'static holds ' + cs.length + ' circles');",
  "        separated(cs, 900, 700);",
  "      } finally { document.getElementById('mode-two').click(); }",
  "      return 'three panes, three separated circles inside the viewBox';",
  "    });",
  "",
  "    scenario('S6 three-values', function(){",
  "      document.getElementById('mode-three').click();",
  "      try {",
  "        var h = 'venn3-circles-dynamic';",
  "        var keys = ['circle-a', 'circle-b', 'circle-c'];",
  "        var rows = ['product-a', 'product-b', 'product-c'];",
  "        for (var i = 0; i < 3; i++){",
  "          assert(badgeText(h, keys[i]) === rowTail(rows[i]), keys[i] + ' badge ' + badgeText(h, keys[i]) + ' vs row ' + rowTail(rows[i]));",
  "          assert(onlyComposite(h, keys[i]), keys[i] + ' shows more than its composite');",
  "        }",
  "        assert(badgeText(h, 'circle-a') === '2618' && badgeText(h, 'circle-b') === '4641' && badgeText(h, 'circle-c') === '12155', 'default badges are ' + badgeText(h, 'circle-a') + ' / ' + badgeText(h, 'circle-b') + ' / ' + badgeText(h, 'circle-c'));",
  "      } finally { document.getElementById('mode-two').click(); }",
  "      return 'A 2618, B 4641, C 12155, composites only';",
  "    });",
  "",
  "    scenario('S7 lang-switch', function(){",
  "      var ps = panes('frame-two');",
  "      var enCap = ps[2].querySelector('.pane-caption').textContent;",
  "      var enA = badgeText('venn-circles-dynamic', 'circle-a'), enB = badgeText('venn-circles-dynamic', 'circle-b');",
  "      NT.i18n.setLang('de');",
  "      try {",
  "        var deCap = ps[2].querySelector('.pane-caption').textContent;",
  "        assert(deCap === NT.i18n.translate('venn.pane.circleComposite'), 'de caption is ' + JSON.stringify(deCap));",
  "        assert(deCap !== enCap, 'caption did not change: ' + deCap);",
  "        assert(document.getElementById('venn-circles').getAttribute('aria-label') === NT.i18n.translate('venn.aria.twoCircleComposite'), 'two aria-label not translated');",
  "        assert(document.getElementById('venn3-circles').getAttribute('aria-label') === NT.i18n.translate('venn.aria.threeCircleComposite'), 'three aria-label not translated');",
  "        assert(badgeText('venn-circles-dynamic', 'circle-a') === enA && badgeText('venn-circles-dynamic', 'circle-b') === enB, 'badge texts changed');",
  "        assert(document.getElementById('frame-two').hidden === false, 'frame-two is hidden after the switch');",
  "      } finally { NT.i18n.setLang('en'); }",
  "      return 'caption and aria-labels follow the language, state kept';",
  "    });",
  "",
  "    scenario('S8 preview-enter', function(){",
  "      var h = 'venn-circles-dynamic';",
  "      var layer = document.getElementById('venn-circles-preview');",
  "      var g = chip(h, 'circle-a');",
  "      assert(g.classList.contains('is-previewable'), 'circle-a badge is not previewable');",
  "      ev(g, 'mouseenter');",
  "      assert(layer.firstChild, 'hover left the preview layer empty');",
  "      NT.i18n.setLang('de');",
  "      try { assert(layer.firstChild, 'the open preview was not re-drawn after the language switch'); }",
  "      finally { NT.i18n.setLang('en'); }",
  "      g = chip(h, 'circle-a');",
  "      ev(g, 'mouseenter');",
  "      var want = 'factor-tree.html?n=' + badgeText(h, 'circle-a');",
  "      var cancelled;",
  "      var got = opened(function(){ cancelled = enter(document.body); });",
  "      assert(cancelled, 'Enter was not cancelled');",
  "      assert(got.length === 1 && got[0].indexOf(want) >= 0, 'Enter opened ' + JSON.stringify(got) + ', wanted ' + want);",
  "      ev(g, 'mouseleave');",
  "      assert(!layer.firstChild, 'mouseleave left the preview layer filled');",
  "      var msg = got[0];",
  "      document.getElementById('mode-three').click();",
  "      try {",
  "        var h3 = 'venn3-circles-dynamic';",
  "        var layer3 = document.getElementById('venn3-circles-preview');",
  "        var g3 = chip(h3, 'circle-c');",
  "        ev(g3, 'mouseenter');",
  "        assert(layer3.firstChild, 'three-mode hover left the preview layer empty');",
  "        var want3 = 'factor-tree.html?n=' + badgeText(h3, 'circle-c');",
  "        var c3;",
  "        var got3 = opened(function(){ c3 = enter(document.body); });",
  "        assert(c3, 'three-mode Enter was not cancelled');",
  "        assert(got3.length === 1 && got3[0].indexOf(want3) >= 0, 'three-mode Enter opened ' + JSON.stringify(got3) + ', wanted ' + want3);",
  "        ev(g3, 'mouseleave');",
  "        assert(!layer3.firstChild, 'three-mode mouseleave left the layer filled');",
  "        msg += '; ' + got3[0];",
  "      } finally { document.getElementById('mode-two').click(); }",
  "      return 'hover, language re-draw, Enter and leave: ' + msg;",
  "    });",
  "",
  "    scenario('S9 live-update', function(){",
  "      var h = 'venn-circles-dynamic';",
  "      document.getElementById('randomize-btn').click();",
  "      assert(badgeText(h, 'circle-a') === rowTail('product-left') && badgeText(h, 'circle-b') === rowTail('product-right'), 'badges do not follow Randomize');",
  "      assert(onlyComposite(h, 'circle-a') && onlyComposite(h, 'circle-b'), 'a circle shows more than its composite after Randomize');",
  "      document.getElementById('clear-btn').click();",
  "      assert(badgeText(h, 'circle-a') === '1' && badgeText(h, 'circle-b') === '1', 'badges after Clear all are ' + badgeText(h, 'circle-a') + ' / ' + badgeText(h, 'circle-b'));",
  "      assert(document.querySelectorAll('#' + h + ' .circle-prime-chip').length === 0, 'prime chips remain after Clear all');",
  "      assert(!chip(h, 'circle-a').classList.contains('is-previewable') && !chip(h, 'circle-b').classList.contains('is-previewable'), 'an empty circle badge is previewable');",
  "      assert(errors.length === 0, 'errors collected: ' + errors.join('; '));",
  "      return 'Randomize and Clear all refresh the pane; no errors';",
  "    });"
].join("\n");

function preflight() {
  var src = fs.readFileSync(path.join(ROOT, "Venn Diagram", "venn-diagram.html"), "utf8");
  var re = /<script([^>]*)>([\s\S]*?)<\/script>/g;
  var m;
  var n = 0;
  while ((m = re.exec(src))) {
    var attrs = m[1];
    if (/\bsrc\s*=/.test(attrs)) continue;
    var tm = /\btype\s*=\s*["']?([^"'\s>]*)/i.exec(attrs);
    if (tm && !/^(text\/javascript|application\/javascript)?$/i.test(tm[1])) continue;
    n++;
    try {
      new vm.Script(m[2]);
    } catch (e) {
      console.log("FD1-PROBE FAIL inline-script-syntax: " + e.message);
      process.exit(1);
    }
  }
  if (n === 0) {
    console.log("FD1-PROBE FAIL inline-script-syntax: no inline script found");
    process.exit(1);
  }
}

function buildSite() {
  var siteRoot = harness.mkScratch("fd1-site-");
  fs.cpSync(path.join(ROOT, "assets"), path.join(siteRoot, "assets"), { recursive: true });
  var src = fs.readFileSync(path.join(ROOT, "Venn Diagram", "venn-diagram.html"), "utf8");
  var probe = PROBE_BODY.replace("//__SCENARIOS__", function () { return SCEN; });
  var markup = '<pre id="fd1-out"></pre>\n<script>\n' + probe + "\n</script>\n";
  var at = src.lastIndexOf("</body>");
  if (at < 0) throw new Error("no closing body tag in venn-diagram.html");
  var page = src.slice(0, at) + markup + src.slice(at);
  var destDir = path.join(siteRoot, "Venn Diagram");
  fs.mkdirSync(destDir, { recursive: true });
  var dest = path.join(destDir, "venn-diagram.html");
  fs.writeFileSync(dest, page);
  return dest;
}

function unescapeHtml(s) {
  return s.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, "&");
}

function runChrome(fileUrl, size) {
  var profileDir = harness.mkScratch("fd1-profile-");
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

function main() {
  preflight();
  var page = buildSite();
  var bad = false;
  SIZES.forEach(function (size) {
    var dom = runChrome(url.pathToFileURL(page).href, size);
    var m = /<pre id="fd1-out"[^>]*>([\s\S]*?)<\/pre>/.exec(dom);
    if (!m) {
      console.log("FAIL [" + size + "]: probe output <pre id=\"fd1-out\"> missing from the dumped DOM");
      bad = true;
      return;
    }
    var lines = unescapeHtml(m[1]).split("\n").filter(function (l) { return l.length > 0; });
    lines.forEach(function (l) { console.log("[" + size + "] " + l); });
    var fails = lines.filter(function (l) { return /^FAIL/.test(l); }).length;
    var passes = lines.filter(function (l) { return /^PASS/.test(l); }).length;
    if (fails > 0 || passes !== EXPECTED) {
      console.log("[" + size + "] " + passes + " pass, " + fails + " fail, expected " + EXPECTED + " scenarios");
      bad = true;
    }
  });
  if (bad) {
    console.log("FD1-PROBE FAIL");
    process.exit(1);
  }
  console.log("FD1-PROBE PASS (" + EXPECTED + " scenarios x " + SIZES.length + " sizes)");
  process.exit(0);
}

main();
