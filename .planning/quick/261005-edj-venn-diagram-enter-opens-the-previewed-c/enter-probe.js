"use strict";
/*
 * Dev-only regression probe for quick task 261005-edj: in the Venn Diagram,
 * Enter must open the previewed chip's section-in-view target (hover and
 * keyboard-focus paths, both modes) and stay inert everywhere else; the
 * preview toggle reads "Previews off" then "Previews on" in sixteen
 * languages. Never referenced by any page. Node built-ins + the in-repo
 * harness only.
 *
 * Copies assets/ and the Venn page into a scratch site, injects a probe
 * script that dispatches synthetic events on the composite chips in
 * headless Chrome, and reads PASS/FAIL lines back from a <pre>.
 */

var fs = require("fs");
var path = require("path");
var cp = require("child_process");
var url = require("url");

var ROOT = path.resolve(__dirname, "..", "..", "..");
var harness = require(path.join(ROOT, ".planning", "phases", "07-shared-js-module-refactor", "harness.js"));

var EXPECTED = 9;

var PROBE_BODY = [
  "(function(){",
  "  var out = document.getElementById('edj-out');",
  "  var lines = [];",
  "  var hrefs = [];",
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
  "      else if (type === 'wheel') e = new WheelEvent('wheel', { deltaY: 400, cancelable: true });",
  "      else if (type === 'dblclick') e = new MouseEvent('dblclick', { bubbles: true, cancelable: true });",
  "      else if (type === 'ArrowDown') e = new KeyboardEvent('keydown', { key: 'ArrowDown', cancelable: true });",
  "      else e = new MouseEvent(type);",
  "      el.dispatchEvent(e);",
  "    }",
  "    function chip(host, region){",
  "      var el = document.querySelector('#' + host + ' [data-region=\"' + region + '\"]');",
  "      assert(el, 'chip not found: ' + host + ' ' + region);",
  "      return el;",
  "    }",
  "    function reset(el){ ev(el, 'mouseleave'); ev(el, 'blur'); }",
  "    function lastHref(){ return hrefs[hrefs.length - 1] || '(none)'; }",
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
  "",
  "    //__SCENARIOS__",
  "",
  "    out.textContent = lines.join('\\n');",
  "  });",
  "})();"
].join("\n");

var SCEN = [
  "    var EU2 = '../Euclidean Algorithm/euclidean-algorithm.html?a=30&b=35';",
  "    var FT_AB = '../Factor Tree/factor-tree.html?a=30&b=35';",
  "    var EU = '../Euclidean Algorithm/euclidean-algorithm.html?a=';",
  "    var FT = '../Factor Tree/factor-tree.html?n=';",
  "    var body = document.body;",
  "",
  "    scenario('E1 two-hover-enter-top', function(){",
  "      var g = chip('venn-composite-dynamic', 'overlap');",
  "      reset(g);",
  "      ev(g, 'mouseenter');",
  "      var cancelled;",
  "      var got = opened(function(){ cancelled = enter(body); });",
  "      assert(cancelled, 'Enter on body was not cancelled');",
  "      assert(got.length === 1 && got[0].indexOf(FT_AB) === 0, 'Enter opened ' + JSON.stringify(got));",
  "      reset(g);",
  "      return 'opened ' + got[0];",
  "    });",
  "",
  "    scenario('E2 two-hover-scrolled-enter', function(){",
  "      var g = chip('venn-composite-dynamic', 'overlap');",
  "      var layer = document.getElementById('venn-preview');",
  "      reset(g);",
  "      ev(g, 'mouseenter'); ev(g, 'wheel');",
  "      assert(layer._npOffset === 206, 'offset after wheel is ' + layer._npOffset + ', expected 206');",
  "      var cancelled;",
  "      var got = opened(function(){ cancelled = enter(body); });",
  "      assert(cancelled, 'Enter on body was not cancelled');",
  "      assert(got.length === 1 && got[0].indexOf(EU2) === 0, 'Enter opened ' + JSON.stringify(got));",
  "      reset(g);",
  "      return 'opened ' + got[0];",
  "    });",
  "",
  "    scenario('E3 two-keyboard-only-enter', function(){",
  "      var g = chip('venn-composite-dynamic', 'overlap');",
  "      var layer = document.getElementById('venn-preview');",
  "      reset(g);",
  "      ev(g, 'focus');",
  "      for (var i = 0; i < 5; i++) ev(g, 'ArrowDown');",
  "      assert(layer._npOffset === 206, 'offset after keys is ' + layer._npOffset + ', expected 206');",
  "      var first = layer.firstChild;",
  "      var cancelled;",
  "      var got = opened(function(){ cancelled = enter(g); });",
  "      assert(cancelled, 'Enter on the chip was not cancelled');",
  "      assert(got.length === 1 && got[0].indexOf(EU2) === 0, 'Enter opened ' + JSON.stringify(got));",
  "      assert(layer.firstChild === first, 'Enter rebuilt the preview panel');",
  "      reset(g);",
  "      return 'opened ' + got[0];",
  "    });",
  "",
  "    scenario('E4 no-preview-enter-inert', function(){",
  "      var g = chip('venn-composite-dynamic', 'overlap');",
  "      reset(g);",
  "      var cancelled;",
  "      var got = opened(function(){ cancelled = enter(body); });",
  "      assert(!cancelled, 'Enter with no preview was cancelled');",
  "      assert(got.length === 0, 'Enter with no preview opened ' + JSON.stringify(got));",
  "      return 'not cancelled, nothing opened';",
  "    });",
  "",
  "    scenario('E5 pass-through', function(){",
  "      var g = chip('venn-composite-dynamic', 'overlap');",
  "      reset(g);",
  "      ev(g, 'mouseenter');",
  "      var layer = document.getElementById('venn-preview');",
  "      assert(layer.firstChild, 'preview not showing');",
  "      var input = document.createElement('input');",
  "      input.type = 'text';",
  "      document.body.appendChild(input);",
  "      var c1, c2, c3;",
  "      var got;",
  "      try {",
  "        got = opened(function(){",
  "          c1 = enter(input);",
  "          c2 = enter(document.getElementById('lang-switch-select'));",
  "          c3 = enter(body, { ctrlKey: true });",
  "        });",
  "      } finally { document.body.removeChild(input); reset(g); }",
  "      assert(!c1, 'Enter in a text input was cancelled');",
  "      assert(!c2, 'Enter on the language select was cancelled');",
  "      assert(!c3, 'Ctrl+Enter was cancelled');",
  "      assert(got.length === 0, 'pass-through cases opened ' + JSON.stringify(got));",
  "      return 'input, select and Ctrl+Enter untouched';",
  "    });",
  "",
  "    scenario('E6 preview-wins-and-repeat', function(){",
  "      var g = chip('venn-composite-dynamic', 'overlap');",
  "      var region = document.getElementById('region-left');",
  "      assert(region, 'region-left not found');",
  "      reset(g);",
  "      ev(g, 'mouseenter');",
  "      var reached = false;",
  "      var probeListener = function(){ reached = true; };",
  "      region.addEventListener('keydown', probeListener);",
  "      var cancelled, repeatCancelled, got, gotRepeat;",
  "      try {",
  "        got = opened(function(){ cancelled = enter(region); });",
  "        gotRepeat = opened(function(){ repeatCancelled = enter(body, { repeat: true }); });",
  "      } finally { region.removeEventListener('keydown', probeListener); reset(g); }",
  "      assert(cancelled, 'Enter on the region was not cancelled');",
  "      assert(got.length === 1 && got[0].indexOf(FT_AB) === 0, 'Enter on the region opened ' + JSON.stringify(got));",
  "      assert(!reached, 'the region keydown listener still saw Enter');",
  "      assert(repeatCancelled, 'repeat Enter was not cancelled');",
  "      assert(gotRepeat.length === 0, 'repeat Enter opened ' + JSON.stringify(gotRepeat));",
  "      return 'preview wins over the region; repeat consumed without opening';",
  "    });",
  "",
  "    scenario('E7 three-circle', function(){",
  "      document.getElementById('mode-three').click();",
  "      var msg;",
  "      try {",
  "        var ab = chip('venn3-composite-dynamic', 'ab');",
  "        reset(ab);",
  "        ev(ab, 'mouseenter'); ev(ab, 'wheel');",
  "        var c1;",
  "        var g1 = opened(function(){ c1 = enter(body); });",
  "        assert(c1, 'Enter on the ab preview was not cancelled');",
  "        assert(g1.length === 1 && g1[0].indexOf(EU) === 0, 'ab Enter opened ' + JSON.stringify(g1));",
  "        reset(ab);",
  "        var abc = chip('venn3-composite-dynamic', 'abc');",
  "        reset(abc);",
  "        ev(abc, 'mouseenter');",
  "        var c2;",
  "        var g2 = opened(function(){ c2 = enter(body); });",
  "        assert(c2, 'Enter on the abc preview was not cancelled');",
  "        assert(g2.length === 1 && g2[0].indexOf(FT) === 0, 'abc Enter opened ' + JSON.stringify(g2));",
  "        reset(abc);",
  "        msg = 'ab opened ' + g1[0] + '; abc opened ' + g2[0];",
  "      } finally { document.getElementById('mode-two').click(); }",
  "      return msg;",
  "    });",
  "",
  "    scenario('E8 toolbar-order-and-storage', function(){",
  "      var off = document.getElementById('thumbs-off');",
  "      var on = document.getElementById('thumbs-on');",
  "      assert(off && on, 'toggle buttons missing');",
  "      assert(off.nextElementSibling === on, 'thumbs-off is not immediately followed by thumbs-on');",
  "      assert(off.textContent === 'Previews off', 'off label is ' + JSON.stringify(off.textContent));",
  "      assert(on.textContent === 'Previews on', 'on label is ' + JSON.stringify(on.textContent));",
  "      var label = off.parentNode.getAttribute('aria-label');",
  "      assert(label === 'Hover previews', 'group aria-label is ' + JSON.stringify(label));",
  "      var KEY = 'venn-diagram-thumbnails';",
  "      off.click();",
  "      try {",
  "        assert(localStorage.getItem(KEY) === 'off', 'stored value after off is ' + localStorage.getItem(KEY));",
  "        var g = chip('venn-composite-dynamic', 'overlap');",
  "        assert(!g.classList.contains('is-previewable'), 'chip still is-previewable with previews off');",
  "        reset(g);",
  "        ev(g, 'mouseenter');",
  "        var cancelled;",
  "        var got = opened(function(){ cancelled = enter(body); });",
  "        assert(!cancelled, 'Enter with previews off was cancelled');",
  "        assert(got.length === 0, 'Enter with previews off opened ' + JSON.stringify(got));",
  "      } finally { on.click(); }",
  "      assert(localStorage.getItem(KEY) === 'on', 'stored value after on is ' + localStorage.getItem(KEY));",
  "      var g2 = chip('venn-composite-dynamic', 'overlap');",
  "      assert(g2.classList.contains('is-previewable'), 'chip lost is-previewable after previews on');",
  "      return 'off first, labels and group right, storage key off/on, Enter inert when off';",
  "    });",
  "",
  "    scenario('E9 labels-all-languages', function(){",
  "      var TABLE = /*__LABELS__*/ {};",
  "      var bad = [];",
  "      var n = 0;",
  "      for (var code in TABLE){",
  "        NT.i18n.setLang(code);",
  "        var want = TABLE[code];",
  "        var off = document.getElementById('thumbs-off');",
  "        var on = document.getElementById('thumbs-on');",
  "        var grp = off.parentNode.getAttribute('aria-label');",
  "        if (grp !== want[0]) bad.push(code + ' group ' + JSON.stringify(grp));",
  "        if (on.textContent !== want[1]) bad.push(code + ' on ' + JSON.stringify(on.textContent));",
  "        if (off.textContent !== want[2]) bad.push(code + ' off ' + JSON.stringify(off.textContent));",
  "        n++;",
  "      }",
  "      assert(n === 16, 'checked ' + n + ' languages, expected 16');",
  "      assert(bad.length === 0, 'mismatches: ' + bad.join('; '));",
  "      return '16 languages x 3 labels';",
  "    });"
].join("\n");

// Expected toggle wording per language: [group aria-label, previews on, previews off].
var LABELS = {
  "nl": ["Hover-voorvertoningen", "Voorvertoningen aan", "Voorvertoningen uit"],
  "en": ["Hover previews", "Previews on", "Previews off"],
  "de": ["Hover-Vorschau", "Vorschau an", "Vorschau aus"],
  "fr": ["Aperçus au survol", "Aperçus activés", "Aperçus désactivés"],
  "es": ["Vistas previas al pasar el cursor", "Vistas previas activadas", "Vistas previas desactivadas"],
  "it": ["Anteprime al passaggio del cursore", "Anteprime attive", "Anteprime disattivate"],
  "pl": ["Podgląd po najechaniu", "Podgląd włączony", "Podgląd wyłączony"],
  "pt-BR": ["Pré-visualizações ao passar o mouse", "Pré-visualizações ativadas", "Pré-visualizações desativadas"],
  "pt-PT": ["Pré-visualizações ao passar o rato", "Pré-visualizações ativadas", "Pré-visualizações desativadas"],
  "sv": ["Förhandsvisningar vid hovring", "Förhandsvisningar på", "Förhandsvisningar av"],
  "nb": ["Forhåndsvisninger ved hover", "Forhåndsvisninger på", "Forhåndsvisninger av"],
  "ro": ["Previzualizări la survolare", "Previzualizări activate", "Previzualizări dezactivate"],
  "hu": ["Előnézet rámutatáskor", "Előnézet be", "Előnézet ki"],
  "lv": ["Priekšskatījumi, pārvietojot kursoru", "Priekšskatījumi ieslēgti", "Priekšskatījumi izslēgti"],
  "ru": ["Предпросмотр при наведении", "Предпросмотр включён", "Предпросмотр выключен"],
  "el": ["Προεπισκοπήσεις στο πέρασμα", "Προεπισκοπήσεις ενεργές", "Προεπισκοπήσεις ανενεργές"]
};

function buildSite() {
  var siteRoot = harness.mkScratch("edj-site-");
  fs.cpSync(path.join(ROOT, "assets"), path.join(siteRoot, "assets"), { recursive: true });
  var src = fs.readFileSync(path.join(ROOT, "Venn Diagram", "venn-diagram.html"), "utf8");
  var probe = PROBE_BODY.replace("//__SCENARIOS__", function () { return SCEN; });
  probe = probe.replace("/*__LABELS__*/ {}", function () { return JSON.stringify(LABELS); });
  var markup = '<pre id="edj-out"></pre>\n<script>\n' + probe + "\n</script>\n";
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

function runChrome(fileUrl) {
  var profileDir = harness.mkScratch("edj-profile-");
  var args = [
    "--headless=new", "--disable-gpu", "--no-sandbox",
    "--user-data-dir=" + profileDir,
    "--virtual-time-budget=5000",
    "--window-size=1280,900",
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
  var m = /<pre id="edj-out"[^>]*>([\s\S]*?)<\/pre>/.exec(dom);
  if (!m) {
    console.log("FAIL: probe output <pre id=\"edj-out\"> missing from the dumped DOM");
    process.exit(1);
  }
  var lines = unescapeHtml(m[1]).split("\n").filter(function (l) { return l.length > 0; });
  lines.forEach(function (l) { console.log(l); });
  var fails = lines.filter(function (l) { return /^FAIL/.test(l); }).length;
  var passes = lines.filter(function (l) { return /^PASS/.test(l); }).length;
  if (fails > 0 || passes !== EXPECTED) {
    console.log("EDJ-PROBE FAIL (" + passes + " pass, " + fails + " fail, expected " + EXPECTED + " scenarios)");
    process.exit(1);
  }
  console.log("EDJ-PROBE PASS (" + passes + " scenarios)");
  process.exit(0);
}

main();
