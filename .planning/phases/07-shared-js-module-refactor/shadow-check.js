#!/usr/bin/env node
/* shadow-check.js — dev-only static gate for Phase 7's shared JS module
 * refactor. Never shipped, never referenced by any .html page. Requires
 * ./harness.js for ROOT and loadNew(). Extended in Phase 6 (06-02) to
 * enforce the same include-order, import-discipline and no-shadowing
 * rules for NT.i18n (assets/nt-i18n.js) and its per-page
 * assets/i18n/*.js data includes as for the other five shared modules.
 *
 * Modes:
 *   node shadow-check.js <file>...   check the given tool files; exit 1 on any finding
 *   node shadow-check.js --all       check every tool file + cross-file DUP scan
 *   node shadow-check.js --report    print findings but exit 0 (combine with --all)
 *   node shadow-check.js --docs      audit docs for retired-rule phrases + mirror drift
 */
"use strict";

var fs = require("fs");
var path = require("path");
var harness = require("./harness.js");
var ROOT = harness.ROOT;

/* ---------- exported-name inventory (derived from the working tree) ---------- */

function getExportedNames() {
  var NT = harness.loadNew() || {};
  var fnNames = [];
  Object.keys(NT).forEach(function (ns) {
    var sub = NT[ns];
    Object.keys(sub || {}).forEach(function (name) {
      if (typeof sub[name] === "function") fnNames.push(name);
    });
  });
  return fnNames;
}

// Fixed constant-export watch-list (names a tool must never re-declare
// locally once it imports the owning namespace; some are not exported by
// NT.core yet in this plan — they are the future exports later phase-7
// plans add, watched pre-emptively so a tool doesn't shadow them early).
var CONSTANT_NAMES = ["SVG_NS", "FERMAT_MAX_ITER", "TILE_CAP", "BALANCED_MAX_N", "SHARED_GROUP_KEY", "SHARED_AB_KEY", "SHARED_PALETTE_KEY", "SHARED_PALETTE_MAX", "SHARED_PALETTE_MAX_N", "SUPPORTED_LANGS", "LANG_STORAGE_KEY"];

var CANONICAL_NS_ORDER = ["core", "bigint", "svg", "store", "layout", "i18n"];

// Per-file retired-name table (07-RESEARCH.md Name-Collision / Shadowing
// Risk Summary). Keyed by tool directory name.
var RETIRED_NAMES = {
  "Shors Algorithm": ["gcdSmall", "isPrimeSmall", "polarPoint"],
  "Elliptic Curve Diffie-Hellman": ["isPrimeSmall", "modInv"],
  "Fermats Method": ["isPrimeSimple"],
  "Eulers Totient": ["euclidStepsFor"],
  "Factor Tree": ["buildTree", "assignX", "flatten", "MAX_BALANCED_N"],
  "Venn Diagram": ["smallestFactorOf", "buildBalancedTree", "factorize", "FT_MAX_N", "FT_MAX_ITER", "NEST_TILE_CAP"]
};

var STALE_PHRASES = [
  "no-shared-JS", "single-file convention", "per-file duplication", "duplicated per-file",
  "duplicated from", "copied from the Equivalence Wheel", "ported unchanged", "must be kept in step"
];

var DOC_PHRASES = [
  "single-file", "self-contained", "standalone", "duplicated per-file", "duplicated per file",
  "per-file duplication", "copy-paste", "separate JS file", "no shared JS", "no-shared-JS",
  "historical default", "repeated verbatim", "repeated across tools", "not a shared module",
  "duplication stays", "deliberate choice", "intentional exception", "precludes import"
];

var DUP_ALLOWLIST = {
  currentMode: "Cayley Table / Equivalence Wheel — returns the tool's own MODES entry for the tool's own state",
  pause: "playback state/DOM closures differ per tool",
  stepOnce: "playback state/DOM closures differ per tool",
  frameStep: "playback state/DOM closures differ per tool"
};

/* ---------- tool file discovery ---------- */

function listToolFiles() {
  var entries = fs.readdirSync(ROOT, { withFileTypes: true });
  var files = [];
  entries.forEach(function (e) {
    if (!e.isDirectory()) return;
    if (e.name === "assets" || e.name === "node_modules" || e.name.charAt(0) === ".") return;
    var dir = path.join(ROOT, e.name);
    var inner = fs.readdirSync(dir).filter(function (f) { return /\.html$/i.test(f); });
    inner.forEach(function (f) {
      files.push(path.join(e.name, f));
    });
  });
  return files.sort();
}

/* ---------- tokenizer: strip comments and string/template contents ---------- */

function stripCommentsAndStrings(src) {
  var out = "";
  var i = 0, n = src.length;
  var inLineComment = false, inBlockComment = false;
  while (i < n) {
    var c = src[i], c2 = src[i + 1];
    if (inLineComment) {
      if (c === "\n") { inLineComment = false; out += c; }
      i++; continue;
    }
    if (inBlockComment) {
      if (c === "*" && c2 === "/") { inBlockComment = false; i += 2; continue; }
      if (c === "\n") out += c;
      i++; continue;
    }
    if (c === "/" && c2 === "/") { inLineComment = true; i += 2; continue; }
    if (c === "/" && c2 === "*") { inBlockComment = true; i += 2; continue; }
    if (c === '"' || c === "'") {
      var quote = c; i++;
      while (i < n && src[i] !== quote) { if (src[i] === "\\") i++; i++; }
      i++;
      continue;
    }
    if (c === "`") {
      i++;
      var depth = 0;
      while (i < n) {
        if (src[i] === "\\") { i += 2; continue; }
        if (src[i] === "`" && depth === 0) { i++; break; }
        if (src[i] === "$" && src[i + 1] === "{") { depth++; i += 2; continue; }
        if (src[i] === "}" && depth > 0) { depth--; i++; continue; }
        // Inside a ${...} interpolation, the text is live JS, not literal
        // string data — copy it through so identifier scans (SHADOW,
        // MISSING-IMPORT, UNUSED-IMPORT) can see calls like `${fn(x)}`.
        // Outside an interpolation (the literal template text itself), keep
        // discarding content exactly as for a plain quoted string, only
        // preserving newlines for line-continuity.
        if (depth > 0) { out += src[i]; i++; continue; }
        if (src[i] === "\n") out += "\n";
        i++;
      }
      continue;
    }
    if (c === "/") {
      var j = out.length - 1;
      while (j >= 0 && /\s/.test(out[j])) j--;
      var prevCh = j >= 0 ? out[j] : "";
      var tail = out.slice(Math.max(0, j - 5), j + 1);
      var isRegexContext = prevCh === "" || /[=(,:\[!&|?{};+\-*%^~<>]/.test(prevCh) || /\breturn$/.test(tail);
      if (isRegexContext) {
        var k = i + 1;
        var inClass = false;
        var found = false;
        while (k < n) {
          if (src[k] === "\\") { k += 2; continue; }
          if (src[k] === "[") { inClass = true; k++; continue; }
          if (src[k] === "]") { inClass = false; k++; continue; }
          if (src[k] === "/" && !inClass) { k++; found = true; break; }
          if (src[k] === "\n") break;
          k++;
        }
        if (found) {
          while (k < n && /[a-z]/i.test(src[k])) k++;
          i = k;
          continue;
        }
      }
    }
    out += c;
    i++;
  }
  return out;
}

/* ---------- HTML script parsing ---------- */

function findScriptTags(html) {
  var re = /<script([^>]*)>([\s\S]*?)<\/script>/gi;
  var out = [];
  var m;
  while ((m = re.exec(html))) {
    out.push({ attrs: m[1], body: m[2], index: m.index });
  }
  return out;
}

function hasSrc(attrs) { return /\bsrc\s*=/.test(attrs); }

function attrVal(attrs, name) {
  var re = new RegExp(name + '\\s*=\\s*("([^"]*)"|\'([^\']*)\')');
  var m = re.exec(attrs);
  if (!m) return null;
  return m[2] !== undefined ? m[2] : m[3];
}

function getInlineScripts(html) {
  var tags = findScriptTags(html).filter(function (t) { return !hasSrc(t.attrs); });
  // First inline (no-src) script is the head theme-detection script.
  return tags.slice(1);
}

function getIncludes(html) {
  var tags = findScriptTags(html).filter(function (t) { return hasSrc(t.attrs); });
  return tags.map(function (t) {
    var src = attrVal(t.attrs, "src") || "";
    // [a-z0-9]+ (not [a-z]+) so "nt-i18n.js" matches — a digit-only module
    // suffix is unique to i18n among the six shared modules, but the
    // pattern is written generically rather than special-cased.
    var ntMatch = /assets\/(nt-[a-z0-9]+)\.js$/.exec(src);
    var i18nDataMatch = /assets\/i18n\/[a-zA-Z0-9-]+\.js$/.exec(src);
    return {
      src: src,
      index: t.index,
      isNt: !!ntMatch,
      ns: ntMatch ? ntMatch[1].replace(/^nt-/, "") : null,
      isI18nData: !!i18nDataMatch,
      defer: /\bdefer\b/.test(t.attrs),
      async: /\basync\b/.test(t.attrs),
      isModule: /type\s*=\s*["']module["']/.test(t.attrs)
    };
  });
}

/* ---------- per-file analysis ---------- */

function analyzeFile(relPath) {
  var absPath = path.isAbsolute(relPath) ? relPath : path.join(ROOT, relPath);
  var html = fs.readFileSync(absPath, "utf8");
  var toolDir = path.dirname(relPath);
  var findings = [];

  var inline = getInlineScripts(html);
  var rawText = inline.map(function (t) { return t.body; }).join("\n");
  var stripped = stripCommentsAndStrings(rawText);
  var includes = getIncludes(html);

  var exportedFns = getExportedNames();

  // ---- SHADOW ----
  exportedFns.forEach(function (name) {
    var reFn = new RegExp("\\bfunction\\s+" + name + "\\s*\\(");
    if (reFn.test(stripped)) findings.push("SHADOW " + relPath + " local function declaration shadows NT export: " + name);
    var reExpr = new RegExp("\\b(?:var|let|const)\\s+" + name + "\\s*=\\s*(?:function|\\([^)]*\\)\\s*=>|[A-Za-z_$][\\w$]*\\s*=>)");
    if (reExpr.test(stripped)) findings.push("SHADOW " + relPath + " local binding shadows NT export: " + name);
  });
  CONSTANT_NAMES.forEach(function (name) {
    var reConst = new RegExp("\\b(?:var|let|const)\\s+" + name + "\\b(?!\\s*[,}])");
    var isDestructure = new RegExp("\\{[^}]*\\b" + name + "\\b[^}]*\\}\\s*=\\s*NT\\.");
    if (reConst.test(stripped) && !isDestructure.test(stripped)) {
      findings.push("SHADOW " + relPath + " local constant shadows NT export: " + name);
    }
  });

  // ---- RETIRED-NAME ----
  var retired = RETIRED_NAMES[toolDir];
  if (retired) {
    retired.forEach(function (name) {
      var re = new RegExp("\\b" + name + "\\b");
      if (re.test(stripped)) findings.push("RETIRED-NAME " + relPath + " " + name);
    });
  }

  // ---- imports ----
  // [A-Za-z0-9]+ (not [A-Za-z]+) so "NT.i18n" — the only digit-bearing
  // namespace among the six shared modules — matches.
  var importRe = /const\s*\{\s*([^}]+)\s*\}\s*=\s*NT\.([A-Za-z0-9]+)\s*;/g;
  var imports = [];
  var im;
  while ((im = importRe.exec(stripped))) {
    var names = im[1].split(",").map(function (s) { return s.trim(); }).filter(Boolean);
    imports.push({ ns: im[2], names: names, index: im.index, raw: im[0] });
  }

  var importedNames = {};
  imports.forEach(function (imp) { imp.names.forEach(function (n) { importedNames[n] = imp.ns; }); });

  var NT = harness.loadNew() || {};
  imports.forEach(function (imp) {
    var sub = NT[imp.ns];
    if (!sub) {
      findings.push("IMPORT-UNRESOLVED " + relPath + " unknown namespace NT." + imp.ns);
      return;
    }
    imp.names.forEach(function (n) {
      if (!(n in sub)) findings.push("IMPORT-UNRESOLVED " + relPath + " NT." + imp.ns + "." + n);
      var useRe = new RegExp("\\b" + n + "\\b", "g");
      var uses = (stripped.match(useRe) || []).length;
      // one occurrence is the import line's own destructure binding
      if (uses <= 1) findings.push("UNUSED-IMPORT " + relPath + " " + n);
    });
    // canonical sort order within the destructure
    var sortedNames = imp.names.slice().sort();
    for (var i = 0; i < imp.names.length; i++) {
      if (imp.names[i] !== sortedNames[i]) {
        findings.push("IMPORT-ORDER " + relPath + " names not sorted in NT." + imp.ns + " import");
        break;
      }
    }
  });

  // canonical namespace order across imports
  var nsSeen = imports.map(function (imp) { return imp.ns; });
  var nsCanonicalPositions = nsSeen.map(function (ns) { return CANONICAL_NS_ORDER.indexOf(ns); });
  for (var ni = 1; ni < nsCanonicalPositions.length; ni++) {
    if (nsCanonicalPositions[ni] === -1 || nsCanonicalPositions[ni] < nsCanonicalPositions[ni - 1]) {
      findings.push("IMPORT-ORDER " + relPath + " namespaces not in canonical order");
      break;
    }
  }

  // MISSING-IMPORT: bare call of an exported function name neither
  // imported nor declared locally.
  exportedFns.forEach(function (name) {
    var isLocal = new RegExp("\\bfunction\\s+" + name + "\\s*\\(").test(stripped);
    if (isLocal || importedNames[name]) return;
    var callRe = new RegExp("(^|[^.\\w$])" + name + "\\s*\\(", "g");
    if (callRe.test(stripped)) findings.push("MISSING-IMPORT " + relPath + " " + name);
  });

  // IMPORT-POSITION: import line appears after the first non-import
  // declaration of the script (ignoring "use strict" and the IIFE opener).
  if (imports.length) {
    var firstImportIdx = Math.min.apply(null, imports.map(function (i) { return i.index; }));
    var before = stripped.slice(0, firstImportIdx);
    var cleaned = before
      .replace(/\(function\s*\([^)]*\)\s*\{/g, "")
      .replace(/["']use strict["'];?/g, "")
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .replace(/[\s;]+/g, "");
    if (cleaned.length > 0) findings.push("IMPORT-POSITION " + relPath + " import block not first in script");
  }

  // NS-MUTATION
  if (/\bNT(\.[A-Za-z_$][\w$]*)*\s*=(?!=)/.test(stripped)) {
    findings.push("NS-MUTATION " + relPath);
  }

  // ---- includes ----
  var ntIncludes = includes.filter(function (i) { return i.isNt; });
  var i18nDataIncludes = includes.filter(function (i) { return i.isI18nData; });
  var includedNs = {};
  ntIncludes.forEach(function (i) { includedNs[i.ns] = i; });
  var i18nModuleInclude = includedNs.i18n;

  imports.forEach(function (imp) {
    if (!includedNs[imp.ns]) findings.push("INCLUDE-MISSING " + relPath + " NT." + imp.ns);
  });
  if (includedNs.layout && !includedNs.core) {
    findings.push("INCLUDE-MISSING " + relPath + " nt-layout included without nt-core");
  }

  // A page's own assets/i18n/<name>.js data includes require nt-i18n.js
  // and must not sit before it (data registers against NT.i18n.register,
  // which must already exist).
  i18nDataIncludes.forEach(function (inc) {
    if (!i18nModuleInclude) {
      findings.push("INCLUDE-MISSING " + relPath + " " + inc.src + " present without assets/nt-i18n.js");
    } else if (inc.index < i18nModuleInclude.index) {
      findings.push("INCLUDE-ORDER " + relPath + " " + inc.src + " appears before assets/nt-i18n.js");
    }
  });

  ntIncludes.concat(i18nDataIncludes).forEach(function (inc) {
    if (inc.defer || inc.async || inc.isModule) {
      findings.push("INCLUDE-DEFERRED " + relPath + " " + inc.src);
    }
  });

  var ntOrderPositions = ntIncludes.map(function (inc) { return CANONICAL_NS_ORDER.indexOf(inc.ns); });
  for (var oi = 1; oi < ntOrderPositions.length; oi++) {
    if (ntOrderPositions[oi] === -1 || ntOrderPositions[oi] < ntOrderPositions[oi - 1]) {
      findings.push("INCLUDE-ORDER " + relPath + " nt-*.js includes not in canonical order");
      break;
    }
  }
  // includes (nt-*.js, plus any number of contiguous assets/i18n/*.js data
  // includes after them) must be contiguous and immediately before the
  // tool's own inline script.
  var allRelevantIncludes = ntIncludes.concat(i18nDataIncludes).sort(function (a, b) { return a.index - b.index; });
  if (allRelevantIncludes.length && inline.length) {
    var lastInclude = allRelevantIncludes[allRelevantIncludes.length - 1];
    var toolScriptIdx = inline[inline.length - 1].index;
    var betweenText = html.slice(lastInclude.index, toolScriptIdx);
    var betweenTags = findScriptTags(betweenText);
    // betweenText includes the lastInclude's own tag; strip it then check gap
    var afterLast = html.slice(lastInclude.index).replace(/^<script[^>]*>\s*<\/script>/i, "");
    var gapToNextScript = /^\s*(?:<script[^>]*src="[^"]*(?:nt-[a-z0-9]+\.js|assets\/i18n\/[a-zA-Z0-9-]+\.js)"[^>]*>\s*<\/script>\s*)*<script(?![^>]*src)/i;
    if (!gapToNextScript.test(afterLast)) {
      findings.push("INCLUDE-ORDER " + relPath + " includes not immediately before the tool's own script");
    }
  }

  var usedNsInIncludes = {};
  ntIncludes.forEach(function (inc) { usedNsInIncludes[inc.ns] = true; });
  Object.keys(usedNsInIncludes).forEach(function (ns) {
    if (ns === "core" && includedNs.layout) return; // nt-core accompanying nt-layout is allowed unused
    if (ns === "i18n") return; // nt-i18n.js self-initializes the header/static markup even when nothing is imported from it
    if (!importedNames || !Object.keys(importedNames).some(function (n) { return importedNames[n] === ns; })) {
      findings.push("UNUSED-INCLUDE " + relPath + " NT." + ns);
    }
  });

  // EXTERNAL-SCRIPT
  includes.forEach(function (inc) {
    var isAllowedTheme = /assets\/theme\.js$/.test(inc.src) && inc.defer;
    var isNtModule = inc.isNt;
    var isI18nData = inc.isI18nData;
    if (!isAllowedTheme && !isNtModule && !isI18nData) {
      findings.push("EXTERNAL-SCRIPT " + relPath + " " + inc.src);
    }
  });

  // ---- STALE-COMMENT ----
  STALE_PHRASES.forEach(function (phrase) {
    var re = new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    if (re.test(rawText)) findings.push("STALE-COMMENT " + relPath + " " + phrase);
  });

  return {
    relPath: relPath,
    toolDir: toolDir,
    findings: findings,
    stripped: stripped,
    rawText: rawText
  };
}

/* ---------- cross-file duplicate scan (--all) ---------- */

function extractTopLevelFunctions(stripped) {
  var out = {};
  var re = /function\s+([A-Za-z_$][\w$]*)\s*\(/g;
  var m;
  while ((m = re.exec(stripped))) {
    var name = m[1];
    var braceStart = stripped.indexOf("{", m.index);
    if (braceStart === -1) continue;
    var depth = 0, end = -1;
    for (var j = braceStart; j < stripped.length; j++) {
      var ch = stripped[j];
      if (ch === "{") depth++;
      else if (ch === "}") { depth--; if (depth === 0) { end = j; break; } }
    }
    if (end === -1) continue;
    out[name] = stripped.slice(m.index, end + 1);
  }
  return out;
}

function normalizeBody(body) {
  return body.replace(/\b(var|let|const)\b/g, "V").replace(/\s+/g, " ").trim();
}

function crossFileDupScan(analyses) {
  var findings = [];
  var byName = {}; // name -> [{file, body}]
  analyses.forEach(function (a) {
    var fns = extractTopLevelFunctions(a.stripped);
    a._fns = fns;
    Object.keys(fns).forEach(function (name) {
      byName[name] = byName[name] || [];
      byName[name].push({ file: a.relPath, body: normalizeBody(fns[name]) });
    });
  });

  // DUP: same name, 2+ files, identical normalized body
  Object.keys(byName).forEach(function (name) {
    var entries = byName[name];
    if (entries.length < 2) return;
    var allSame = entries.every(function (e) { return e.body === entries[0].body; });
    if (allSame) {
      if (DUP_ALLOWLIST[name]) {
        findings.push("DUP-ALLOWED " + name + " (" + entries.map(function (e) { return e.file; }).join(", ") + ") reason: " + DUP_ALLOWLIST[name]);
      } else {
        findings.push("DUP " + name + " (" + entries.map(function (e) { return e.file; }).join(", ") + ")");
      }
    }
  });

  // RENAMED-DUP: different names, identical normalized body once the
  // declared name is replaced by a placeholder.
  var placeholderIndex = [];
  analyses.forEach(function (a) {
    Object.keys(a._fns || {}).forEach(function (name) {
      var body = normalizeBody(a._fns[name]);
      var re = new RegExp("\\b" + name + "\\b", "g");
      var norm = body.replace(re, "~SELF~");
      placeholderIndex.push({ file: a.relPath, name: name, norm: norm });
    });
  });
  for (var i = 0; i < placeholderIndex.length; i++) {
    for (var j = i + 1; j < placeholderIndex.length; j++) {
      var p1 = placeholderIndex[i], p2 = placeholderIndex[j];
      if (p1.file === p2.file) continue;
      if (p1.name === p2.name) continue; // already covered by DUP
      if (p1.norm === p2.norm && p1.norm.length > 20) {
        if (DUP_ALLOWLIST[p1.name] || DUP_ALLOWLIST[p2.name]) continue;
        findings.push("RENAMED-DUP " + p1.file + "#" + p1.name + " ~ " + p2.file + "#" + p2.name);
      }
    }
  }

  return findings;
}

/* ---------- docs audit (--docs) ---------- */

function auditDocs() {
  var findings = [];
  var docFiles = [
    "CLAUDE.md",
    ".claude/CLAUDE.md",
    ".planning/PROJECT.md"
  ];
  var codebaseDir = path.join(ROOT, ".planning", "codebase");
  if (fs.existsSync(codebaseDir)) {
    fs.readdirSync(codebaseDir).forEach(function (f) {
      if (/\.md$/i.test(f)) docFiles.push(path.join(".planning", "codebase", f));
    });
  }
  docFiles.forEach(function (relPath) {
    var abs = path.join(ROOT, relPath);
    if (!fs.existsSync(abs)) return;
    var lines = fs.readFileSync(abs, "utf8").split("\n");
    lines.forEach(function (line, idx) {
      DOC_PHRASES.forEach(function (phrase) {
        var re = new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
        if (re.test(line)) findings.push("DOC-PHRASE " + relPath + ":" + (idx + 1) + " " + phrase);
      });
    });
  });

  // mirror consistency: .claude/CLAUDE.md GSD-marked sections vs their source docs
  var mirrorPath = path.join(ROOT, ".claude", "CLAUDE.md");
  if (fs.existsSync(mirrorPath)) {
    var mirrorText = fs.readFileSync(mirrorPath, "utf8");
    var sectionRe = /<!-- GSD:([a-z]+)-start source:([^\s]+) -->([\s\S]*?)<!-- GSD:\1-end -->/gi;
    var sm;
    while ((sm = sectionRe.exec(mirrorText))) {
      var sectionName = sm[1], sourceRel = sm[2], body = sm[3];
      var sourcePath = /codebase\//.test(sourceRel) || /\.md$/.test(sourceRel)
        ? path.join(ROOT, ".planning", sourceRel.indexOf("codebase/") === 0 ? sourceRel : ("codebase/" + sourceRel))
        : path.join(ROOT, ".planning", sourceRel);
      if (!fs.existsSync(sourcePath)) continue;
      var sourceText = fs.readFileSync(sourcePath, "utf8");
      var bodyLines = body.split("\n");
      bodyLines.forEach(function (line) {
        var t = line.trim();
        if (!t || t.charAt(0) === "#" || t.indexOf("**") === 0) return;
        if (sourceText.indexOf(t) === -1) {
          findings.push("MIRROR-DRIFT " + sectionName + " " + t.slice(0, 80));
        }
      });
    }
  }

  return findings;
}

/* ---------- CLI ---------- */

function main() {
  var argv = process.argv.slice(2);
  var reportMode = argv.indexOf("--report") !== -1;
  var allMode = argv.indexOf("--all") !== -1;
  var docsMode = argv.indexOf("--docs") !== -1;
  var fileArgs = argv.filter(function (a) { return a.indexOf("--") !== 0; });

  if (docsMode) {
    var docFindings = auditDocs();
    docFindings.forEach(function (f) { console.log(f); });
    if (reportMode) {
      console.log("SHADOW-REPORT " + docFindings.length + " findings");
      process.exit(0);
    }
    if (docFindings.length) process.exit(1);
    console.log("SHADOW-CHECK PASS --docs");
    process.exit(0);
  }

  var targets = allMode ? listToolFiles() : fileArgs;
  if (!targets.length) {
    console.error("Usage: node shadow-check.js <file>... | --all [--report] | --docs [--report]");
    process.exit(1);
  }

  var analyses = targets.map(analyzeFile);
  var allFindings = [];
  analyses.forEach(function (a) { allFindings = allFindings.concat(a.findings); });

  if (allMode) {
    allFindings = allFindings.concat(crossFileDupScan(analyses));
  }

  if (reportMode) {
    allFindings.forEach(function (f) { console.log(f); });
    analyses.forEach(function (a) {
      if (a.findings.length === 0) console.log("SHADOW-CHECK PASS " + a.relPath);
    });
    console.log("SHADOW-REPORT " + allFindings.length + " findings");
    process.exit(0);
  }

  var anyFail = false;
  analyses.forEach(function (a) {
    if (a.findings.length) {
      anyFail = true;
      a.findings.forEach(function (f) { console.log(f); });
    } else {
      console.log("SHADOW-CHECK PASS " + a.relPath);
    }
  });

  process.exit(anyFail ? 1 : 0);
}

if (require.main === module) {
  main();
}

module.exports = { listToolFiles: listToolFiles, analyzeFile: analyzeFile, getExportedNames: getExportedNames };
