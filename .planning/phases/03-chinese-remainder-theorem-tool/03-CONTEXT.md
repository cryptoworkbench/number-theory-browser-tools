# Phase 3: Chinese Remainder Theorem Tool - Context

**Gathered:** 2026-09-28
**Status:** Ready for planning
**Mode:** Auto (Claude made the implementation calls; user gave direct build instruction, not a design discussion)

<domain>
## Phase Boundary

Ship a new self-contained tool, `Chinese Remainder Theorem/chinese-remainder-theorem.html`, that lets a user enter 2 or 3 simultaneous congruences `x ≡ a (mod m)`, validates pairwise coprimality of the moduli, visualizes each modulus's residue class with the simultaneous solution as their intersection, animates a brute-force scan to the solution, offers an Extended-Euclidean-based construction as a faster alternative, ships preset examples (including a classic remainders riddle), and links to the Euclidean Algorithm tool's Extended Euclidean / modular-inverse step. This is the full scope of REQUIREMENTS.md CRT-01 through CRT-08 — no more, no less.

</domain>

<decisions>
## Implementation Decisions

### Residue-class visualization (CRT-03)
- **D-01:** Represent each congruence as a horizontal number-line strip (one row per congruence, 2 or 3 rows stacked), with cells/ticks along a shared x-axis from 0 up to at least `lcm(moduli)` (capped for readability — see D-06). Cells at positions `x ≡ a_i (mod m_i)` are highlighted in that row's own color; a synchronized column at the bottom shows where all rows agree (the simultaneous solution). This mirrors the Sieve of Eratosthenes' grid/strip visual language already established in the repo, and makes "solution = intersection of residue classes" directly legible as a vertical alignment across rows rather than requiring a new diagram vocabulary (e.g. overlapping circles) that isn't in the repo yet.
- **D-02:** Use `--role-input` for a row's plain highlighted cells (the residue class itself), `--role-active` for the current brute-force scan cursor column, and `--role-result` for the final solution column once found. Non-coprime validation state uses `--role-warn`. The Extended-Euclidean "faster alternative" reveal uses `--role-special`, matching how Fermat's Method and RSA already use that token for an advanced/optional path. — **Reversibility:** reversible — pure CSS token mapping, easy to re-map later.

### Brute-force scan animation (CRT-04)
- **D-03:** Reuse the existing playback-control shape from the Euclidean Algorithm and Sieve tools (play/pause/step/instant-finish, a `generation` counter to invalidate stale animation callbacks, `setTimeout`-staggered reveals) rather than inventing a new animation primitive. The scan advances `x` from 0 upward, testing each row's congruence at that `x`, and stops at the first `x` where all rows agree — that is the CRT solution in `[0, lcm)`.

### Extended-Euclidean construction (CRT-05)
- **D-04:** After the brute-force scan lands on the solution, show a "Reveal faster method" toggle (echoing the Euclidean Algorithm tool's existing Extended Euclidean toggle framing) that walks through the standard CRT construction: for each modulus `m_i`, compute `M_i = lcm/m_i`, its modular inverse `y_i` mod `m_i` via the extended Euclidean algorithm, then `x = Σ a_i * M_i * y_i mod lcm`. This is presented as a second, optional explanation path — the brute-force scan is the default/primary teaching path, matching how GCD-06's Extended Euclidean mode is opt-in on top of the primary reduction trace.

### Coprimality validation (CRT-02)
- **D-05:** Validate pairwise `gcd(m_i, m_j)` for every pair of entered moduli on every input change. When any pair is non-coprime, show a clear inline warning (using `--role-warn`, matching the existing validation-error pattern in every other tool's message area) explaining CRT's standard form doesn't apply, rather than silently computing a wrong or partial answer. The tool does not attempt the generalized (non-coprime) CRT variant — that's out of scope (see REQUIREMENTS.md "Out of Scope": no N>3 general solver, and pairwise-coprime is the documented precondition).

### Congruence count toggle (CRT-06)
- **D-06:** A 2-vs-3 congruence toggle adds/removes the third input row and its number-line strip, matching the interaction shape of the Venn Diagram tool's existing 2-circle/3-circle toggle (same "add a set" UX the user already has in the repo). Modulus and remainder inputs are range-validated and capped (small moduli, e.g. up to 20-30) to keep the number-line strip and the scan animation readable and fast — the same "cap the input range for readability" principle already applied to GCD's rectangle-tiling view and documented in REQUIREMENTS.md's Out-of-Scope table.

### Presets (CRT-07)
- **D-07:** Ship preset chips covering: (1) the classic Sun Tzu "remainders riddle" (`x≡2 mod 3, x≡3 mod 5, x≡2 mod 7`, solution 23) as the signature preset, (2) a simple 2-congruence coprime example, and (3) a non-coprime pair that triggers the CRT-02 validation warning, so the warning path is discoverable via a preset rather than only by accident. Mirrors the Euclidean Algorithm tool's preset-chip pattern (GCD-04): coprime case, edge case, and here also an invalid-input case since that's a first-class requirement (CRT-02).

### Cross-link to GCD tool (CRT-08)
- **D-08:** One-directional deep link from the CRT tool to the Euclidean Algorithm tool, passing a chosen modulus pair as `?a=&b=` (the existing, already-shared param contract read by `Euclidean Algorithm/euclidean-algorithm.html`'s `readABParams()`). Extend `euclidean-algorithm.html` with a new optional URL param (e.g. `?ext=1`) that auto-enables its existing Extended Euclidean toggle on load, so the CRT tool's link lands the user directly on the modular-inverse step rather than requiring a manual toggle click afterward. This is a small, additive change to the existing tool's load-time param handling (same shape as its current `?a=&b=` handling), not a redesign. — **Reversibility:** reversible — additive URL param, no existing behavior changes if the param is absent.
- Unlike Task 1 (Euclidean Algorithm ⟷ Venn Diagram, which got the full bidirectional shared-localStorage-store treatment), CRT-08 only requires one direction (CRT → GCD) per its own wording ("navigate from the CRT tool to the GCD tool's modular-inverse step") — no reverse link, no shared persistent store. Do not over-build this into a second bidirectional shared-state pair; that's scope the requirement doesn't ask for.

### Claude's Discretion
- Exact color assignment per row (2nd vs 3rd congruence) beyond the role-token mapping in D-02.
- Exact riddle preset wording/flavor text (a rabbits/eggs/soldiers framing) — pick whichever reads well against the site's existing playful preset copy (see Euclidean Algorithm's and Sieve's chip labels).
- Exact moduli/remainder input ceiling — pick a value that keeps the number-line strip's cell count on-screen without horizontal scrolling at common viewport widths, following the same "shrink-then-scroll" instinct already used by the Cayley Table (05-03-PLAN.md).

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Requirements and roadmap
- `.planning/REQUIREMENTS.md` §"Chinese Remainder Theorem" (CRT-01..08) and §"Out of Scope" (N>3 general solver explicitly excluded) — the locked requirement text for this phase
- `.planning/ROADMAP.md` §"Phase 3: Chinese Remainder Theorem Tool" — goal, success criteria, dependencies (Phase 1 palette, Phase 2 GCD tool)

### Reference implementations to mirror
- `Euclidean Algorithm/euclidean-algorithm.html` — playback controls (play/pause/step/instant-finish, `generation` counter), preset-chip pattern, Extended Euclidean/Bézout toggle (`s`, `t` columns), existing `updateXrefLink()`/`readABParams()` cross-link functions (lines ~483-520) to extend rather than duplicate
- `Venn Diagram/venn-diagram.html` — 2-circle/3-circle mode toggle pattern (mirror for the 2-vs-3-congruence toggle), `updateEuclidXref()`/`readABParams()` (lines ~1374-1520) as the existing xref pattern precedent
- `Sieve Of Eratosthenes/sieve-of-eratosthenes.html` — grid/strip animation and playback-loop shape to mirror for the brute-force scan visualization
- `assets/palette.css` — semantic `--role-*` tokens (role-input, role-active, role-result, role-warn, role-special) that this tool's every color MUST consume via `var()`, no literal colors

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `svgEl()` SVG-creation helper (repeated per-file convention) — for the number-line strip diagram if SVG-rendered, or plain DOM cells if not
- `gcd()` / extended-Euclidean helper shape already proven in `Euclidean Algorithm/euclidean-algorithm.html` (forward extended-Euclidean recurrence returning `{ steps, gcd, s, t }`) — duplicate this pattern rather than importing it, per repo convention of per-file math helpers
- Shared nav header + `index.html` hub registration pattern used by every existing tool

### Established Patterns
- Playback controls: `generation` counter invalidates stale `setTimeout` callbacks on reset — required for any "step/instant-finish" affordance
- Preset chips: `<div class="chips" id="presetChips">` with `.chip` buttons wired at IIFE bottom
- Cross-link functions live near the bottom of the state/render logic, called from the render path whenever the relevant inputs change (not only on load)

### Integration Points
- New tool directory: `Chinese Remainder Theorem/chinese-remainder-theorem.html`
- `index.html` hub card grid and every existing tool's shared nav header need a new entry (nine tools total after this phase, following the NAV-0x precedent from prior phases)
- `Euclidean Algorithm/euclidean-algorithm.html` gets one additive change: a new optional `?ext=1`-style load param enabling its existing Extended Euclidean toggle, to serve CRT-08's deep link

</code_context>

<specifics>
## Specific Ideas

No user-supplied visual references beyond "match the existing repo pattern" (explicit instruction: build it as a webtool where the user solves a system of congruences via CRT). The Sun Tzu riddle (`x≡2 mod 3, x≡3 mod 5, x≡2 mod 7` → 23) is the natural, most recognizable "classic remainders riddle" and is locked as the signature preset (D-07).

</specifics>

<deferred>
## Deferred Ideas

- General N>3 congruence solver — explicitly out of scope per REQUIREMENTS.md, tracked as CRT-V2-01 for a future release.
- A bidirectional, persistent shared-state link between CRT and the Euclidean Algorithm tool (the Task-1-style `localStorage`+cookie shared store) — not required by CRT-08's wording; a one-directional URL-param deep link suffices. Revisit only if a future requirement asks for two-way sync.

### Reviewed Todos (not folded)
None — no pending todos matched this phase's scope.

</deferred>

---

*Phase: 3-Chinese Remainder Theorem Tool*
*Context gathered: 2026-09-28*
