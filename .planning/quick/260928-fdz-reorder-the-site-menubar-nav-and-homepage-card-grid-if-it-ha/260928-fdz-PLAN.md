---
phase: quick-260928-fdz
plan: 01
type: execute
wave: 1
depends_on: ["260928-fdx", "260928-fdy"]
files_modified:
  - index.html
  - Sieve Of Eratosthenes/sieve-of-eratosthenes.html
  - Factor Tree/factor-tree.html
  - Venn Diagrams/venn-diagrams.html
  - Euclidean Algorithm/euclidean-algorithm.html
  # Below two paths are best-guess post-rename names (260928-fdy / 260928-fdx land first);
  # Task 1/2 resolve the ACTUAL on-disk directory by substring match, never by hardcoding this guess.
  - Equivalence Wheel/equivalence-wheel.html
  - Cayley Table Generator/cayley-table-generator.html
  - Square And Multiply/square-and-multiply.html
  - Diffie-Hellman Key Exchange/diffie-hellman-key-exchange.html
  - RSA/rsa.html
  - Fermats Method/fermats-method.html
  - Shors Algorithm/shors-algorithm.html
autonomous: true

must_haves:
  truths:
    - "Every one of the 12 site pages (index.html plus all 11 tool pages) lists the same 12 nav entries — Home, Sieve of Eratosthenes, Factor Tree, Venn Diagrams, Euclidean Algorithm, Equivalence Wheel, Cayley Table Generator, Square and Multiply, Diffie-Hellman, RSA, Fermat's Method, Shor's Algorithm — in that exact left-to-right order."
    - "The homepage card grid presents the 11 tool cards in that same relative order (Sieve of Eratosthenes first, Shor's Algorithm last), matching the nav bar's sequence."
    - "No link's href, link text, class, or id changed as a result of this task — every anchor kept its own destination and label; only its position within the list moved."
    - "The renamed tools (Equivalence Wheel, formerly Congruence Wheel; Fermat's Method, formerly Completing The Square) sit at their new target positions using whatever directory/file path 260928-fdy and 260928-fdx actually produced — this task locates those paths on disk rather than assuming a name."
  artifacts:
    - "index.html"
    - "Each of the 11 tool HTML files' own copy of the site nav (11 files, under whatever on-disk names 260928-fdx/260928-fdy left them)"
  key_links:
    - "index.html's nav order and index.html's card-grid order are the same sequence, so the hub's two navigation surfaces never disagree with each other."
    - "Every tool page's own nav order matches index.html's nav order, so the menubar reads identically regardless of which page a visitor lands on."
---

<objective>
Reorder the site-wide nav bar (present as a duplicated markup block in every page) and the homepage card grid into one fixed sequence: Home, Sieve of Eratosthenes, Factor Tree, Venn Diagrams, Euclidean Algorithm, Equivalence Wheel, Cayley Table Generator, Square and Multiply, Diffie-Hellman, RSA, Fermat's Method, Shor's Algorithm.

Purpose: The current nav/card order is whatever order tools were historically added in, which no longer reads as a coherent learning path. The target order groups sieving/factoring, then set relations, then modular-arithmetic tools (equivalence classes, groups, exponentiation), then the public-key-crypto arc (Diffie-Hellman, RSA, its classical-factoring foil, and the algorithm that threatens it), so a self-learner can work through the site roughly front-to-back.

This task depends on 260928-fdx (Completing The Square -> Fermat's Method) and 260928-fdy (Congruence Wheel -> Equivalence Wheel) already having landed — it only reorders existing links, it does not rename anything. Because those two renames run as separate, independently-dispatched plans, this task must locate their resulting directory/file names on disk rather than assume a specific name.

Output: index.html's nav bar and card grid reordered; the identical nav reorder applied to all 11 tool pages' own copies of the nav bar.
</objective>

<execution_context>
@~/.claude/gsd-core/workflows/execute-plan.md
@~/.claude/gsd-core/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@CLAUDE.md
@.claude/CLAUDE.md

@index.html
</context>

<tasks>

<task type="tracer">
  <name>Task 1: Reorder index.html's nav bar and homepage card grid</name>
  <files>index.html</files>
  <precondition>A repo-root directory whose name contains "Equivalence" (from 260928-fdy) and a repo-root directory whose name contains "Fermat" (from 260928-fdx) both already exist — confirm with a case-insensitive directory listing before editing; halt and report blocked if either is missing rather than guessing a name.</precondition>
  <action>
First confirm the precondition: list the repo's top-level directories and identify the one renamed by 260928-fdy (its name contains "Equivalence", case-insensitive) and the one renamed by 260928-fdx (its name contains "Fermat", case-insensitive), and note each one's actual .html file inside it. Do not hardcode an assumed path — read it off the filesystem as it exists right now.

In index.html's nav element carrying class "site-nav", reorder the 12 existing anchor elements of class "site-nav-link" (each moved as a whole element — href, class, and link text untouched) into this exact sequence: Home; Sieve of Eratosthenes; Factor Tree; Venn Diagrams; Euclidean Algorithm; the entry pointing at the tool renamed by 260928-fdy (link text contains "Equivalence"); Cayley Table Generator; Square and Multiply; Diffie-Hellman; RSA; the entry pointing at the tool renamed by 260928-fdx (link text contains "Fermat"); Shor's Algorithm. The "is-active" class stays on the Home entry (index.html is the active page here) and does not move to any other entry.

In the div element carrying class "card-grid", reorder the 11 existing anchor elements of class "card" (each entire card — icon div, h2, p, and the trailing "Open tool" span — moved as one unit, not edited) into the same relative sequence, omitting Home (which has no card): Sieve of Eratosthenes; Factor Tree; Venn Diagrams; Euclidean Algorithm; the card whose href points at the 260928-fdy tool; Cayley Table Generator; Square and Multiply; Diffie-Hellman; RSA; the card whose href points at the 260928-fdx tool; Shor's Algorithm.

Do not rename, relabel, re-word, or re-style any entry, and do not touch the style block or anything outside the nav and card-grid blocks — this task changes element ORDER only.
  </action>
  <verify>
    <automated>
Run from the repo root (heredoc body contains literal Python source, not escaped):

python3 - "index.html" << 'PY'
import re, sys, pathlib
NAV = [lambda t: t.strip()=="Home", lambda t: t.strip()=="Sieve of Eratosthenes",
       lambda t: t.strip()=="Factor Tree", lambda t: t.strip()=="Venn Diagrams",
       lambda t: t.strip()=="Euclidean Algorithm", lambda t: "Equivalence" in t,
       lambda t: t.strip()=="Cayley Table Generator", lambda t: t.strip()=="Square and Multiply",
       lambda t: t.strip()=="Diffie-Hellman", lambda t: t.strip()=="RSA",
       lambda t: "Fermat" in t, lambda t: t.strip()=="Shor's Algorithm"]
CARD = [lambda h: "Sieve Of Eratosthenes" in h, lambda h: "Factor Tree" in h,
        lambda h: "Venn Diagrams" in h, lambda h: "Euclidean Algorithm" in h,
        lambda h: "equivalence" in h.lower(), lambda h: "Cayley Table Generator" in h,
        lambda h: "Square And Multiply" in h, lambda h: "Diffie-Hellman Key Exchange" in h,
        lambda h: h.split("/")[0]=="RSA", lambda h: "fermat" in h.lower(),
        lambda h: "Shors Algorithm" in h]
html = pathlib.Path(sys.argv[1]).read_text(encoding="utf-8")
navt = re.findall(r'<a href="[^"]*" class="site-nav-link[^"]*">([^<]*)</a>', html)
cardh = re.findall(r'<a class="card" href="([^"]*)"', html)
ok = len(navt)==len(NAV) and all(m(t) for m,t in zip(NAV,navt))
ok = ok and len(cardh)==len(CARD) and all(m(h) for m,h in zip(CARD,cardh))
print("nav:", navt); print("cards:", cardh)
print("INDEX-NAV-CARD-ORDER-OK" if ok else "INDEX-NAV-CARD-ORDER-FAIL")
sys.exit(0 if ok else 1)
PY
    </automated>
  </verify>
  <done>index.html's nav bar lists the 12 entries in the exact target order and its card grid lists the 11 tool cards in the matching relative order; every href/text/class is byte-identical to before the reorder, only positions changed; the verify script prints INDEX-NAV-CARD-ORDER-OK.</done>
</task>

<task type="auto">
  <name>Task 2: Apply the identical nav reorder to all 11 tool pages</name>
  <files>Sieve Of Eratosthenes/sieve-of-eratosthenes.html, Factor Tree/factor-tree.html, Venn Diagrams/venn-diagrams.html, Euclidean Algorithm/euclidean-algorithm.html, Equivalence Wheel/equivalence-wheel.html, Cayley Table Generator/cayley-table-generator.html, Square And Multiply/square-and-multiply.html, Diffie-Hellman Key Exchange/diffie-hellman-key-exchange.html, RSA/rsa.html, Fermats Method/fermats-method.html, Shors Algorithm/shors-algorithm.html</files>
  <action>
List every top-level tool directory in the repo (one directory per top-level-subdirectory .html file, excluding the "assets" directory) — this gives the 11 tool pages, including whatever exact names 260928-fdy and 260928-fdx left for the Equivalence Wheel and Fermat's Method tools; do not assume the file list in this task's files field is exact if the actual on-disk names differ, resolve dynamically instead.

In EACH of the 11 files' own nav element carrying class "site-nav", reorder its 12 anchor elements of class "site-nav-link" (whole elements moved, href/class/text untouched, including that file's own "is-active" self-link which keeps its class and stays pointed at itself) into the identical sequence used in Task 1: Home; Sieve of Eratosthenes; Factor Tree; Venn Diagrams; Euclidean Algorithm; the Equivalence-Wheel entry; Cayley Table Generator; Square and Multiply; Diffie-Hellman; RSA; the Fermat's-Method entry; Shor's Algorithm.

Apply this to all 11 files without exception. None of these pages has a card grid, so this task only ever touches each file's nav block — nothing else in any of the 11 files changes.
  </action>
  <verify>
    <automated>
Run from the repo root (heredoc body contains literal Python source, not escaped):

python3 - << 'PY'
import re, sys, pathlib
NAV = [lambda t: t.strip()=="Home", lambda t: t.strip()=="Sieve of Eratosthenes",
       lambda t: t.strip()=="Factor Tree", lambda t: t.strip()=="Venn Diagrams",
       lambda t: t.strip()=="Euclidean Algorithm", lambda t: "Equivalence" in t,
       lambda t: t.strip()=="Cayley Table Generator", lambda t: t.strip()=="Square and Multiply",
       lambda t: t.strip()=="Diffie-Hellman", lambda t: t.strip()=="RSA",
       lambda t: "Fermat" in t, lambda t: t.strip()=="Shor's Algorithm"]
root = pathlib.Path(".")
files = sorted(p for p in root.glob("*/*.html"))
good = len(files) == 11
if not good:
    print("FAIL expected 11 tool html files, found", len(files), files)
for f in files:
    html = f.read_text(encoding="utf-8")
    texts = re.findall(r'<a href="[^"]*" class="site-nav-link[^"]*">([^<]*)</a>', html)
    ok = len(texts)==len(NAV) and all(m(t) for m,t in zip(NAV,texts))
    print(f, texts, "OK" if ok else "FAIL")
    good = good and ok
print("ALL-TOOL-NAV-ORDER-OK" if good else "ALL-TOOL-NAV-ORDER-FAIL")
sys.exit(0 if good else 1)
PY
    </automated>
  </verify>
  <done>All 11 tool pages' nav blocks list the same 12 entries in the identical target order as index.html; each file's own is-active self-link is unchanged in text/href/class, only repositioned; the verify script prints ALL-TOOL-NAV-ORDER-OK for all 11 files.</done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| None crossed | This task only reorders existing static anchor elements within files already served as trusted, first-party static assets. No new input source, no new external resource, no user-supplied data is introduced. |

## STRIDE Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation Plan |
|-----------|----------|-----------|----------|-------------|-----------------|
| T-fdz-01 | Tampering | index.html nav/card markup | low | mitigate | Reordering is done by moving whole existing elements verbatim; Task 1's automated check re-parses every href/text position after the edit, so an accidental mid-edit corruption of a link's destination or label fails the gate before commit. |
| T-fdz-02 | Tampering | Each of the 11 tool pages' own nav block | low | mitigate | Same verified-reorder approach applied per file in Task 2; the automated check confirms all 12 entries in all 11 files, so no nav link silently breaks (wrong href) or ends up in the wrong position on any page. |
| T-fdz-03 | Denial of Service | N/A | low | accept | Purely a static-markup reorder — no new computation, no user input processed, no runtime behavior added; no performance surface is created. |
| T-fdz-SC | Tampering | npm/pip/cargo installs | high | mitigate | Not applicable — this plan installs no package and the repo has no package manager or build step, so no install task exists here; the package-legitimacy gate is vacuously satisfied. If an install is ever proposed during execution, halt and run the legitimacy protocol first. |
</threat_model>

<verification>
Run after both tasks are committed, from the repo root:

1. **Combined order sweep.** Re-run Task 2's verify script (it already covers all 11 tool pages) and Task 1's verify script (index.html) back to back; both must print their OK marker.
2. **Consistency sweep.** index.html's nav order and every tool page's nav order must be identical sequences — Task 1 and Task 2 use the exact same `NAV` matcher list, so any divergence between index.html and a tool page fails one of the two scripts.
3. **No-collateral sweep.** `git diff --stat` shows only the 12 files this plan is scoped to (index.html plus the 11 tool pages); no `<style>` block, no script logic, and no link href/text/class changed — only element order within the nav and card-grid blocks.
</verification>

<success_criteria>
- Every page on the site (the hub and all 11 tools) presents the nav bar in the exact order: Home, Sieve of Eratosthenes, Factor Tree, Venn Diagrams, Euclidean Algorithm, Equivalence Wheel, Cayley Table Generator, Square and Multiply, Diffie-Hellman, RSA, Fermat's Method, Shor's Algorithm.
- The homepage card grid presents the 11 tools in that same relative order.
- No tool was renamed, relinked, or otherwise altered by this task beyond its position in the list — this task is a pure reorder that depends on 260928-fdx and 260928-fdy having already applied the two renames.
</success_criteria>

<output>
Create `.planning/quick/260928-fdz-reorder-the-site-menubar-nav-and-homepage-card-grid-if-it-ha/260928-fdz-SUMMARY.md` when done
</output>
