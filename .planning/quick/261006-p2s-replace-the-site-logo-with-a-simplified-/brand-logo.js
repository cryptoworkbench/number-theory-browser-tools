#!/usr/bin/env node
/* brand-logo.js -- dev-only helper for quick task 261006-p2s. Never shipped,
 * never referenced by any .html page. Uses only Node built-ins.
 *
 *   node brand-logo.js --swap            replace the header brand block in all 16 pages
 *   node brand-logo.js --check [scope]   BRAND-LOGO PASS/FAIL lines (scope: header)
 */
"use strict";

var fs = require("fs");
var path = require("path");

var ROOT = path.resolve(__dirname, "..", "..", "..");

/* ---------- The new header block ---------- */

var NEW_BLOCK = [
  '      <svg class="brand-icon" viewBox="0 0 64 64" aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg">',
  '        <rect class="brand-icon-plate" x="2" y="2" width="60" height="60" rx="14"/>',
  '        <rect class="brand-icon-head" x="12" y="12" width="40" height="10"/>',
  '        <rect class="brand-icon-head" x="12" y="22" width="10" height="30"/>',
  '        <rect class="brand-icon-diag" x="22" y="22" width="10" height="10"/>',
  '        <rect class="brand-icon-diag" x="32" y="32" width="10" height="10"/>',
  '        <rect class="brand-icon-diag" x="42" y="42" width="10" height="10"/>',
  '        <path class="brand-icon-grid" d="M22 12V52M32 12V52M42 12V52M12 22H52M12 32H52M12 42H52"/>',
  '        <rect class="brand-icon-frame" x="12" y="12" width="40" height="40"/>',
  '      </svg>'
].join("\n") + "\n";

var RETIRED_CLASS = "brand-icon-" + "digit";
var BRAND_RE = /^[ ]*<svg class="brand-icon"[\s\S]*?<\/svg>\n/m;

/* ---------- Pages ---------- */

function listPages() {
  var pages = ["index.html"];
  fs.readdirSync(ROOT, { withFileTypes: true }).forEach(function (d) {
    if (!d.isDirectory() || d.name.charAt(0) === ".") return;
    fs.readdirSync(path.join(ROOT, d.name)).forEach(function (f) {
      if (/\.html$/.test(f)) pages.push(d.name + "/" + f);
    });
  });
  if (pages.length !== 16) throw new Error("expected 16 pages, found " + pages.length);
  return pages;
}

function read(rel) { return fs.readFileSync(path.join(ROOT, rel), "utf8"); }

/* ---------- --swap ---------- */

function countMatches(src) {
  var re = new RegExp(BRAND_RE.source, "gm");
  return (src.match(re) || []).length;
}

function swap() {
  var pages = listPages();
  var sources = {};
  var bad = false;
  pages.forEach(function (p) {
    sources[p] = read(p);
    var n = countMatches(sources[p]);
    if (n !== 1) { console.log("BRAND-LOGO FAIL swap: " + p + " has " + n + " brand blocks"); bad = true; }
  });
  if (bad) process.exit(1);
  var written = 0;
  pages.forEach(function (p) {
    var next = sources[p].replace(BRAND_RE, function () { return NEW_BLOCK; });
    if (next !== sources[p]) { fs.writeFileSync(path.join(ROOT, p), next); written++; }
  });
  console.log("swap: " + written + " files written");
}

/* ---------- --check ---------- */

var failed = false;
function report(name, ok, detail) {
  if (!ok) failed = true;
  console.log(ok ? "BRAND-LOGO PASS " + name : "BRAND-LOGO FAIL " + name + ": " + detail);
}

function checkHeader() {
  var pages = listPages();
  var css = read("assets/site.css");
  var badBlock = [];
  var badRetired = [];
  pages.forEach(function (p) {
    var src = read(p);
    if (src.split(NEW_BLOCK).length - 1 !== 1) badBlock.push(p);
    if (src.indexOf(RETIRED_CLASS) >= 0) badRetired.push(p);
  });
  report("header-block", badBlock.length === 0, "new block not exactly once in " + badBlock.join(", "));
  if (css.indexOf(RETIRED_CLASS) >= 0) badRetired.push("assets/site.css");
  report("header-no-retired-class", badRetired.length === 0, "retired class in " + badRetired.join(", "));
  var missing = ["plate", "head", "diag", "grid", "frame"].filter(function (n) {
    return css.indexOf(".brand-icon-" + n + "{") < 0;
  });
  report("header-css-rules", missing.length === 0, "missing rules: " + missing.join(", "));
  var from = css.indexOf(".brand-icon{");
  var to = css.indexOf("/* Tools menu");
  var region = from >= 0 && to > from ? css.slice(from, to) : "";
  var colorLit = /#[0-9a-fA-F]{3,8}\b|\b(?:rgb|rgba|hsl|hsla)\(/.test(region);
  var paints = region.match(/\b(?:fill|stroke)\s*:\s*[^;}]+/g) || [];
  var badPaint = paints.filter(function (v) {
    return !/var\(--st-header-accent/.test(v) && !/:\s*none\s*$/.test(v);
  });
  report("header-css-no-literal-color", region !== "" && !colorLit && badPaint.length === 0,
    region === "" ? "region not found" : (colorLit ? "literal colour found" : "non-var paint: " + badPaint.join("; ")));
}

/* ---------- Main ---------- */

function main() {
  var mode = process.argv[2];
  var scope = process.argv[3];
  if (mode === "--swap") return swap();
  if (mode === "--check") {
    if (!scope || scope === "header") checkHeader();
    process.exit(failed ? 1 : 0);
  }
  console.error("usage: brand-logo.js --swap | --check [header]");
  process.exit(2);
}

main();
