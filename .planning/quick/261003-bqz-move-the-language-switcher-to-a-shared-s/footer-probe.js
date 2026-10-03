#!/usr/bin/env node
/* footer-probe.js — dev-only Node/headless-Chrome verification probe for
 * quick task 261003-bqz (move the language switcher into a shared site
 * footer). Never shipped, never referenced by any .html page.
 *
 * Usage:
 *   node footer-probe.js <mode> [--base <sha>] [--root <dir>] [--only <substring>]
 *
 * Static modes (Task 1):
 *   markup   MARKUP-EXACT — every page equals its <base> version with only
 *            the switcher block moved into the canonical footer (plus the
 *            D-07 reserve-line replacement on RSA and Diffie-Hellman).
 *   strip    STRIP-GATE — 9 assertions proving i18n-browser.js's
 *            stripI18nArtifacts strips the canonical site footer only when
 *            it holds nothing but the canonical switcher.
 *   gate     FOOTER-GATE — i18n-check.js --header/--switcher-present stay
 *            green on the real tree, then 8 scratch mutations each produce
 *            exactly the expected finding prefix(es), confined to the
 *            mutated page.
 *   css      SITE-CSS — every added color-bearing declaration in
 *            assets/site.css resolves through var()/units/keywords only,
 *            no added line contains a hex color, and the print block hides
 *            .site-footer.
 *
 * Runtime modes (Task 2) are added on top of these; see the Task 2 section
 * below once present.
 *
 * Exits 0 only on PASS.
 */
"use strict";

var fs = require("fs");
var path = require("path");
var cp = require("child_process");

var ROOT = path.resolve(__dirname, "..", "..", "..");
var P6_DIR = path.join(ROOT, ".planning", "phases", "06-multi-language-support");
var P7_DIR = path.join(ROOT, ".planning", "phases", "07-shared-js-module-refactor");

var i18nCheck = require(path.join(P6_DIR, "i18n-check.js"));
var i18nBrowser = require(path.join(P6_DIR, "i18n-browser.js"));
var harness = require(path.join(P7_DIR, "harness.js"));

var DEFAULT_BASE = "81c4d14";
var PAGES = i18nCheck.PAGES.map(function (p) { return p.file; });

/* ---------- CLI arg parsing ---------- */

function parseArgs(argv) {
  var mode = argv[0];
  var opts = { base: DEFAULT_BASE, root: null, only: null };
  for (var i = 1; i < argv.length; i++) {
    if (argv[i] === "--base") opts.base = argv[++i];
    else if (argv[i] === "--root") opts.root = argv[++i];
    else if (argv[i] === "--only") opts.only = argv[++i];
  }
  return { mode: mode, opts: opts };
}

function filterPages(only) {
  if (!only) return PAGES.slice();
  return PAGES.filter(function (p) { return p.indexOf(only) !== -1; });
}

/* ---------- git helpers ---------- */

function gitRun(args, cwd) {
  return cp.execFileSync("git", args, { cwd: cwd || ROOT, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
}

function gitShowAt(base, relPath) {
  return gitRun(["show", base + ":" + relPath]);
}

function gitLsFiles() {
  return gitRun(["ls-files"]).split("\n").map(function (s) { return s.trim(); }).filter(Boolean);
}

/* ---------- scratch-site construction (never writes inside the repo) ---------- */

function makeScratchCopy(prefix) {
  var root = harness.mkScratch(prefix);
  var files = gitLsFiles();
  files.forEach(function (relFile) {
    var src = path.join(ROOT, relFile);
    var dest = path.join(root, relFile);
    if (!fs.existsSync(src)) return;
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(src, dest);
  });
  return root;
}

/* ---------- the D-01/D-02/D-07 page transform, as pure string -> string ---------- */

var LABEL_START = '    <label class="lang-switch" title="Language" data-i18n-title="site.lang.label">';
var LABEL_END = "    </label>";
var RESERVE_PAGES = ["RSA/rsa.html", "Diffie-Hellman Key Exchange/diffie-hellman-key-exchange.html"];
var RESERVE_OLD_LINE = "  .app{ padding-bottom: 240px; }";
var RESERVE_COMMENT_LINE = "  /* The reserve sits on body, below the shared site footer, so at the end of the page this panel (at most 236px: min(40vh, 220px) tall plus a bottom offset of at most 16px) also clears the language switcher in the site footer. */";
var RESERVE_NEW_LINE = "  body{ padding-bottom: 240px; }";

// transformPageSrc(relPath, src): applies the exact D-01/D-02/D-07 transform
// to a page's full source text. Throws with a descriptive message (never
// writes anything) if an anchor is missing or appears more than once.
function transformPageSrc(relPath, src) {
  var lines = src.split("\n");

  var startIdxs = [];
  lines.forEach(function (l, i) { if (l === LABEL_START) startIdxs.push(i); });
  if (startIdxs.length !== 1) throw new Error(relPath + ": expected exactly 1 lang-switch label start, found " + startIdxs.length);
  var startIdx = startIdxs[0];

  var endIdx = -1;
  for (var i = startIdx + 1; i < lines.length; i++) {
    if (lines[i] === LABEL_END) { endIdx = i; break; }
  }
  if (endIdx === -1) throw new Error(relPath + ": no matching </label> found after lang-switch label start");

  var span = endIdx - startIdx + 1;
  if (span !== 21) throw new Error(relPath + ": expected switcher span of exactly 21 lines, found " + span);

  var switcherLines = lines.slice(startIdx, endIdx + 1);
  var withoutSwitcher = lines.slice(0, startIdx).concat(lines.slice(endIdx + 1));

  var scriptRe = /^<script src="(\.\.\/)?assets\//;
  var scriptIdxs = [];
  withoutSwitcher.forEach(function (l, i) { if (scriptRe.test(l)) scriptIdxs.push(i); });
  if (scriptIdxs.length === 0) throw new Error(relPath + ": no script line matching assets/ pattern found");
  var scriptIdx = scriptIdxs[0];

  var footerBlock = ['<footer class="site-footer">', '  <div class="site-footer-inner">']
    .concat(switcherLines)
    .concat(['  </div>', '</footer>', '']);

  var finalLines = withoutSwitcher.slice(0, scriptIdx).concat(footerBlock).concat(withoutSwitcher.slice(scriptIdx));
  var finalSrc = finalLines.join("\n");

  if (RESERVE_PAGES.indexOf(relPath) !== -1) {
    var occurrences = finalSrc.split(RESERVE_OLD_LINE).length - 1;
    if (occurrences !== 1) throw new Error(relPath + ": expected exactly 1 occurrence of reserve line, found " + occurrences);
    finalSrc = finalSrc.split(RESERVE_OLD_LINE).join(RESERVE_COMMENT_LINE + "\n" + RESERVE_NEW_LINE);
  }

  return finalSrc;
}

/* ================================================================
 * markup mode — MARKUP-EXACT
 * ================================================================ */

function modeMarkup(opts) {
  var root = opts.root || ROOT;
  var pages = filterPages(opts.only);
  var fail = null;
  for (var i = 0; i < pages.length; i++) {
    var relPath = pages[i];
    var baseSrc = gitShowAt(opts.base, relPath);
    var expected;
    try {
      expected = transformPageSrc(relPath, baseSrc);
    } catch (e) {
      console.log("MARKUP-EXACT FAIL " + e.message);
      process.exit(1);
    }
    var actualPath = path.join(root, relPath);
    var actual = fs.readFileSync(actualPath, "utf8");
    if (actual !== expected) {
      var ei = 0, maxLen = Math.min(actual.length, expected.length);
      while (ei < maxLen && actual.charAt(ei) === expected.charAt(ei)) ei++;
      var lineNo = expected.slice(0, ei).split("\n").length;
      fail = "MARKUP-EXACT FAIL " + relPath + ": first difference at line " + lineNo;
      console.log(fail);
      process.exit(1);
    }
  }
  console.log("MARKUP-EXACT PASS " + pages.length + " pages");
  process.exit(0);
}

/* ================================================================
 * strip mode — STRIP-GATE
 * ================================================================ */

function buildCanonicalFooterString(root) {
  var sievePath = path.join(root || ROOT, "Sieve Of Eratosthenes", "sieve-of-eratosthenes.html");
  var html = fs.readFileSync(sievePath, "utf8");
  var m = /<footer class="site-footer">[\s\S]*?<\/footer>/.exec(html);
  if (!m) throw new Error("strip: no site footer found in the Sieve");
  var collapsed = m[0].replace(/>\s+</g, "><").trim();
  // Simulate real serialized-DOM attribute form: a bare boolean `selected`
  // attribute (as written in the page source) serializes as `selected=""`
  // once captured via outerHTML in the real browser pipeline.
  collapsed = collapsed.replace(/ selected>/, ' selected="">');
  return collapsed;
}

function modeStrip(opts) {
  var root = opts.root || ROOT;
  var F = buildCanonicalFooterString(root);
  var strip = i18nBrowser.stripI18nArtifacts;
  var checks = [];

  // 1. A main element followed by F becomes exactly the main element.
  checks.push(["main element followed by F", function () {
    return strip("<main></main>" + F) === "<main></main>";
  }]);

  // 2. F plus a span before the inner div close keeps `site-footer`.
  checks.push(["span before inner div close", function () {
    var mutated = F.replace("</label></div></footer>", "</label><span>x</span></div></footer>");
    return /site-footer/.test(strip(mutated));
  }]);

  // 3. F plus a span before the label close keeps it.
  checks.push(["span before label close", function () {
    var mutated = F.replace("</select></label>", "</select><span>x</span></label>");
    return /lang-switch/.test(strip(mutated));
  }]);

  // 4. F plus text before the footer close keeps it.
  checks.push(["text before footer close", function () {
    var mutated = F.replace("</div></footer>", "</div>late</footer>");
    return /site-footer/.test(strip(mutated));
  }]);

  // 5. F with an extra data-x="1" attribute on the footer start tag keeps it.
  checks.push(["extra attribute on footer start tag", function () {
    var mutated = F.replace('<footer class="site-footer">', '<footer class="site-footer" data-x="1">');
    return /site-footer/.test(strip(mutated));
  }]);

  // 6. F twice leaves `site-footer` exactly once.
  checks.push(["F twice leaves one footer", function () {
    var out = strip(F + F);
    var count = (out.match(/<footer class="site-footer">/g) || []).length;
    return count === 1;
  }]);

  // 7. F plus an empty optgroup before the select close keeps it.
  checks.push(["empty optgroup before select close", function () {
    var mutated = F.replace("</select>", "<optgroup></optgroup></select>");
    return /lang-switch/.test(strip(mutated));
  }]);

  // 8. F's label element alone, inside a header element, keeps lang-switch.
  checks.push(["label alone inside header", function () {
    var labelMatch = /<label class="lang-switch"[\s\S]*?<\/label>/.exec(F);
    if (!labelMatch) return false;
    var mutated = "<header>" + labelMatch[0] + "</header>";
    return /lang-switch/.test(strip(mutated));
  }]);

  // 9. F plus a seventeenth option keeps `site-footer`.
  checks.push(["extra option keeps site-footer", function () {
    var mutated = F.replace("</select>", '<option value="xx" lang="xx">Extra</option></select>');
    return /site-footer/.test(strip(mutated));
  }]);

  var failed = [];
  checks.forEach(function (c, i) {
    var ok;
    try { ok = c[1](); } catch (e) { ok = false; }
    if (!ok) failed.push((i + 1) + ". " + c[0]);
  });

  if (failed.length) {
    console.log("STRIP-GATE FAIL " + failed.join("; "));
    process.exit(1);
  }
  console.log("STRIP-GATE PASS 9 checks");
  process.exit(0);
}

/* ================================================================
 * gate mode — FOOTER-GATE
 * ================================================================ */

function runI18nCheck(scriptPath, args) {
  var res = cp.spawnSync("node", [scriptPath].concat(args), { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
  return { code: res.status, stdout: res.stdout || "", stderr: res.stderr || "" };
}

function readScratchPage(root, relPath) {
  return fs.readFileSync(path.join(root, relPath), "utf8");
}

function writeScratchPage(root, relPath, content) {
  fs.writeFileSync(path.join(root, relPath), content);
}

// Extract the 21 switcher lines out of a page's own site footer block.
function extractSwitcherLinesFromFooter(src) {
  var lines = src.split("\n");
  var labelStart = -1, labelEnd = -1;
  for (var i = 0; i < lines.length; i++) {
    if (lines[i].indexOf('<label class="lang-switch"') !== -1) { labelStart = i; break; }
  }
  if (labelStart === -1) throw new Error("no lang-switch label found");
  for (var j = labelStart + 1; j < lines.length; j++) {
    if (lines[j].trim() === "</label>") { labelEnd = j; break; }
  }
  if (labelEnd === -1) throw new Error("no closing </label> found");
  return lines.slice(labelStart, labelEnd + 1);
}

function applyMutation1_FactorTreeSwitcherInHeader(root) {
  var rel = "Factor Tree/factor-tree.html";
  var src = readScratchPage(root, rel);
  var switcherLines = extractSwitcherLinesFromFooter(src);
  var lines = src.split("\n");
  var themeIdx = -1;
  for (var i = 0; i < lines.length; i++) {
    if (lines[i].indexOf('<label class="theme-switch"') !== -1) { themeIdx = i; break; }
  }
  if (themeIdx === -1) throw new Error(rel + ": no theme-switch label found");
  var finalLines = lines.slice(0, themeIdx).concat(switcherLines).concat(lines.slice(themeIdx));
  writeScratchPage(root, rel, finalLines.join("\n"));
}

function applyMutation2_VennSpanBeforeInnerDivClose(root) {
  var rel = "Venn Diagram/venn-diagram.html";
  var src = readScratchPage(root, rel);
  var mutated = src.replace("  </div>\n</footer>", "    <span>x</span>\n  </div>\n</footer>");
  if (mutated === src) throw new Error(rel + ": footer inner-div-close anchor not found");
  writeScratchPage(root, rel, mutated);
}

function applyMutation3_EuclideanLateContentAfterFooter(root) {
  var rel = "Euclidean Algorithm/euclidean-algorithm.html";
  var src = readScratchPage(root, rel);
  var mutated = src.replace("</footer>\n", "</footer>\n<p>late</p>\n");
  if (mutated === src) throw new Error(rel + ": </footer> anchor not found");
  writeScratchPage(root, rel, mutated);
}

function applyMutation4_CrtDeleteFooter(root) {
  var rel = "Chinese Remainder Theorem/chinese-remainder-theorem.html";
  var src = readScratchPage(root, rel);
  var m = /<footer class="site-footer">[\s\S]*?<\/footer>\n/.exec(src);
  if (!m) throw new Error(rel + ": no site footer found");
  var mutated = src.slice(0, m.index) + src.slice(m.index + m[0].length);
  writeScratchPage(root, rel, mutated);
}

function applyMutation5_TotientDuplicateFooter(root) {
  var rel = "Eulers Totient/eulers-totient.html";
  var src = readScratchPage(root, rel);
  var m = /<footer class="site-footer">[\s\S]*?<\/footer>\n/.exec(src);
  if (!m) throw new Error(rel + ": no site footer found");
  var block = m[0];
  var mutated = src.slice(0, m.index) + block + block + src.slice(m.index + block.length);
  writeScratchPage(root, rel, mutated);
}

function applyMutation6_IndexTrailingSpace(root) {
  var rel = "index.html";
  var src = readScratchPage(root, rel);
  var mutated = src.replace("  </div>\n</footer>", "  </div> \n</footer>");
  if (mutated === src) throw new Error(rel + ": footer inner-div-close anchor not found");
  writeScratchPage(root, rel, mutated);
}

function applyMutation7_CayleyRenameFooterToDiv(root) {
  var rel = "Cayley Table/cayley-table.html";
  var src = readScratchPage(root, rel);
  var mutated = src.replace('<footer class="site-footer">', '<div class="site-footer">');
  var m = /<div class="site-footer">[\s\S]*?<\/footer>/.exec(mutated);
  if (!m) throw new Error(rel + ": could not locate renamed footer block");
  mutated = mutated.slice(0, m.index) + m[0].replace(/<\/footer>$/, "</div>") + mutated.slice(m.index + m[0].length);
  writeScratchPage(root, rel, mutated);
}

function applyMutation8_ShorMagyarLabel(root) {
  var rel = "Shors Algorithm/shors-algorithm.html";
  var src = readScratchPage(root, rel);
  var fm = /<footer class="site-footer">[\s\S]*?<\/footer>/.exec(src);
  if (!fm) throw new Error(rel + ": no site footer found");
  var footer = fm[0];
  var mutatedFooter = footer.replace(">Magyar<", ">Magyarul<");
  if (mutatedFooter === footer) throw new Error(rel + ": >Magyar< not found inside footer");
  var mutated = src.slice(0, fm.index) + mutatedFooter + src.slice(fm.index + footer.length);
  writeScratchPage(root, rel, mutated);
}

var MUTATIONS = [
  { name: "factor-tree-switcher-in-header", apply: applyMutation1_FactorTreeSwitcherInHeader, page: "Factor Tree/factor-tree.html" },
  { name: "venn-span-before-inner-div-close", apply: applyMutation2_VennSpanBeforeInnerDivClose, page: "Venn Diagram/venn-diagram.html" },
  { name: "euclidean-late-content", apply: applyMutation3_EuclideanLateContentAfterFooter, page: "Euclidean Algorithm/euclidean-algorithm.html" },
  { name: "crt-delete-footer", apply: applyMutation4_CrtDeleteFooter, page: "Chinese Remainder Theorem/chinese-remainder-theorem.html" },
  { name: "totient-duplicate-footer", apply: applyMutation5_TotientDuplicateFooter, page: "Eulers Totient/eulers-totient.html" },
  { name: "index-trailing-space", apply: applyMutation6_IndexTrailingSpace, page: "index.html" },
  { name: "cayley-rename-footer-to-div", apply: applyMutation7_CayleyRenameFooterToDiv, page: "Cayley Table/cayley-table.html" },
  { name: "shor-magyar-label", apply: applyMutation8_ShorMagyarLabel, page: "Shors Algorithm/shors-algorithm.html" }
];

function pageBasenameSet() {
  var set = {};
  PAGES.forEach(function (p) { set[p] = true; });
  return set;
}

function modeGate(opts) {
  var root = opts.root || ROOT;
  var checkScriptReal = path.join(P6_DIR, "i18n-check.js");

  var pre1 = runI18nCheck(checkScriptReal, ["--header", "--all"]);
  if (pre1.code !== 0) {
    console.log("FOOTER-GATE FAIL: --header --all on the real tree did not pass\n" + pre1.stdout);
    process.exit(1);
  }
  var pre2 = runI18nCheck(checkScriptReal, ["--switcher-present", "--all"]);
  if (pre2.code !== 0) {
    console.log("FOOTER-GATE FAIL: --switcher-present --all on the real tree did not pass\n" + pre2.stdout);
    process.exit(1);
  }

  var scratchRoot = makeScratchCopy("footer-gate-");
  var applied = [];
  try {
    MUTATIONS.forEach(function (mut) {
      mut.apply(scratchRoot);
      applied.push(mut.name);
    });
  } catch (e) {
    console.log("FOOTER-GATE FAIL: mutation setup error: " + e.message);
    process.exit(1);
  }

  var scratchCheckScript = path.join(scratchRoot, ".planning", "phases", "06-multi-language-support", "i18n-check.js");
  var run1 = runI18nCheck(scratchCheckScript, ["--header", "--all"]);
  var run2 = runI18nCheck(scratchCheckScript, ["--switcher-present", "--all"]);

  if (run1.code === 0) { console.log("FOOTER-GATE FAIL: --header --all unexpectedly passed on the mutated scratch tree"); process.exit(1); }
  if (run2.code === 0) { console.log("FOOTER-GATE FAIL: --switcher-present --all unexpectedly passed on the mutated scratch tree"); process.exit(1); }

  var combinedOut = run1.stdout + "\n" + run2.stdout;
  var findingLines = combinedOut.split("\n").filter(function (l) { return l.trim() && l.indexOf("I18N-CHECK ") !== 0; });

  var requirements = [
    { prefix: "SWITCHER-IN-HEADER", page: "Factor Tree/factor-tree.html" },
    { prefix: "FOOTER-DRIFT", page: "Venn Diagram/venn-diagram.html" },
    { prefix: "FOOTER-DRIFT", page: "index.html" },
    { prefix: "FOOTER-DRIFT", page: "Shors Algorithm/shors-algorithm.html" },
    { prefix: "FOOTER-POSITION", page: "Euclidean Algorithm/euclidean-algorithm.html" },
    { prefix: "FOOTER-COUNT", page: "Chinese Remainder Theorem/chinese-remainder-theorem.html" },
    { prefix: "FOOTER-COUNT", page: "Eulers Totient/eulers-totient.html" },
    { prefix: "FOOTER-COUNT", page: "Cayley Table/cayley-table.html" },
    { prefix: "SWITCHER-NOT-IN-FOOTER", page: "Chinese Remainder Theorem/chinese-remainder-theorem.html" },
    { prefix: "SWITCHER-NOT-IN-FOOTER", page: "Cayley Table/cayley-table.html" }
  ];

  var missing = requirements.filter(function (req) {
    return !findingLines.some(function (l) { return l.indexOf(req.prefix) === 0 && l.indexOf(req.page) !== -1; });
  });
  if (missing.length) {
    console.log("FOOTER-GATE FAIL: missing findings: " + JSON.stringify(missing));
    console.log(combinedOut);
    process.exit(1);
  }

  // Also required for Factor Tree "in both runs": check run1 and run2 independently.
  var inHeaderBothRuns =
    run1.stdout.split("\n").some(function (l) { return l.indexOf("SWITCHER-IN-HEADER") === 0 && l.indexOf("Factor Tree/factor-tree.html") !== -1; }) &&
    run2.stdout.split("\n").some(function (l) { return l.indexOf("SWITCHER-IN-HEADER") === 0 && l.indexOf("Factor Tree/factor-tree.html") !== -1; });
  if (!inHeaderBothRuns) {
    console.log("FOOTER-GATE FAIL: SWITCHER-IN-HEADER for Factor Tree must appear in both --header and --switcher-present runs");
    process.exit(1);
  }

  // Every finding line must name one of the 8 mutated pages.
  var mutatedPages = MUTATIONS.map(function (m) { return m.page; });
  var strays = findingLines.filter(function (l) {
    return !mutatedPages.some(function (p) { return l.indexOf(p) !== -1; });
  });
  if (strays.length) {
    console.log("FOOTER-GATE FAIL: finding(s) not naming a mutated page: " + JSON.stringify(strays));
    process.exit(1);
  }

  try { fs.rmSync(scratchRoot, { recursive: true, force: true }); } catch (e) { /* best effort */ }
  console.log("FOOTER-GATE PASS 8 mutants");
  process.exit(0);
}

/* ================================================================
 * css mode — SITE-CSS
 * ================================================================ */

var COLOR_PROPS = ["color", "background", "background-color", "border", "border-top", "border-right", "border-bottom", "border-left",
  "border-color", "border-top-color", "border-right-color", "border-bottom-color", "border-left-color",
  "outline", "box-shadow", "text-shadow", "fill", "stroke"];

function isColorProp(prop) {
  return COLOR_PROPS.indexOf(prop.trim()) !== -1;
}

function modeCss(opts) {
  var diff = gitRun(["diff", "-U0", opts.base, "--", "assets/site.css"]);
  var addedLines = diff.split("\n").filter(function (l) { return l.indexOf("+") === 0 && l.indexOf("+++") !== 0; })
    .map(function (l) { return l.slice(1); });

  var hexRe = /#[0-9a-fA-F]{3,8}\b/;
  var nonCommentAdded = addedLines.filter(function (l) { return l.trim().indexOf("/*") !== 0 && l.trim().indexOf("*") !== 0; });
  var hexLines = nonCommentAdded.filter(function (l) { return hexRe.test(l); });
  if (hexLines.length) {
    console.log("SITE-CSS FAIL: hex color found in added line(s): " + JSON.stringify(hexLines));
    process.exit(1);
  }

  var declRe = /^\s*([a-zA-Z-]+)\s*:\s*([^;]+);/;
  var colorDeclCount = 0;
  var bad = [];
  addedLines.forEach(function (l) {
    var m = declRe.exec(l);
    if (!m) return;
    var prop = m[1], value = m[2];
    if (!isColorProp(prop)) return;
    colorDeclCount++;
    var stripped = value
      .replace(/var\(--[a-zA-Z0-9-]+\)/g, "")
      .replace(/-?\d+(\.\d+)?(px|em|rem|%)/g, "")
      .replace(/\b(solid|dashed|dotted|none)\b/g, "")
      .replace(/[\s,]/g, "");
    if (stripped.length) bad.push(l.trim() + " -> leftover: " + JSON.stringify(stripped));
  });

  if (bad.length) {
    console.log("SITE-CSS FAIL: color declaration(s) with non-token content: " + JSON.stringify(bad));
    process.exit(1);
  }

  var cssContent = fs.readFileSync(path.join(opts.root || ROOT, "assets", "site.css"), "utf8");
  var printRe = /@media\s+print\s*\{\s*\.site-footer\s*\{\s*display\s*:\s*none\s*;?\s*\}\s*\}/;
  if (!printRe.test(cssContent.replace(/\s+/g, " "))) {
    console.log("SITE-CSS FAIL: no print media block hiding .site-footer found");
    process.exit(1);
  }

  console.log("SITE-CSS PASS " + colorDeclCount + " color declarations checked");
  process.exit(0);
}

/* ---------- entrypoint ---------- */

function main() {
  var parsed = parseArgs(process.argv.slice(2));
  var mode = parsed.mode, opts = parsed.opts;
  if (mode === "markup") return modeMarkup(opts);
  if (mode === "strip") return modeStrip(opts);
  if (mode === "gate") return modeGate(opts);
  if (mode === "css") return modeCss(opts);
  console.error("Usage: node footer-probe.js <markup|strip|gate|css> [--base <sha>] [--root <dir>] [--only <substring>]");
  process.exit(1);
}

if (require.main === module) {
  main();
}

module.exports = {
  transformPageSrc: transformPageSrc,
  buildCanonicalFooterString: buildCanonicalFooterString,
  makeScratchCopy: makeScratchCopy
};
