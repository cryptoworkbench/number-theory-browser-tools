# Phase 3: Chinese Remainder Theorem Tool - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-09-28
**Phase:** 3-Chinese Remainder Theorem Tool
**Areas discussed:** Residue-class visualization, Brute-force scan animation, Extended-Euclidean construction, Coprimality validation, Congruence count toggle, Presets, Cross-link to GCD tool

**Mode:** Auto — the user gave a direct build instruction ("add a new webtool called Chinese Remainder Theorem... solve a system of congruences") rather than opening a design discussion. Per Auto Mode guidance, Claude made the implementation calls below instead of running an interactive multi-turn discussion, grounding each choice in existing repo patterns (Sieve grid, Venn Diagram's 2/3-circle toggle, Euclidean Algorithm's playback/preset/xref shapes) so decisions are traceable rather than arbitrary.

---

## Residue-class visualization

| Option | Description | Selected |
|--------|-------------|----------|
| Overlapping circles (Venn-style) | New diagram vocabulary not yet used for residue classes | |
| Concentric wheel sectors (Equivalence-Wheel-style) | Reuses wheel idiom but awkward for showing simultaneous alignment across moduli | |
| Stacked horizontal number-line strips | One row per congruence; intersection = vertically-aligned column; reuses Sieve's grid/strip idiom | ✓ |

**Claude's choice:** Stacked number-line strips, one per congruence, with a shared x-axis.
**Notes:** Chosen because it makes "solution = intersection" directly visible as column alignment, and reuses an animation idiom (Sieve's strip/grid) already proven in the repo rather than introducing a new one.

---

## Brute-force scan animation

**Claude's choice:** Reuse the existing play/pause/step/instant-finish + `generation`-counter shape from the Euclidean Algorithm and Sieve tools; scan `x` upward from 0 until all rows agree.

---

## Extended-Euclidean construction (advanced reveal)

**Claude's choice:** "Reveal faster method" toggle shown after the brute-force scan lands on the solution, walking through `M_i`, modular inverse `y_i`, and `x = Σ a_i M_i y_i mod lcm` — opt-in, secondary to the brute-force scan, echoing GCD-06's Extended Euclidean toggle framing.

---

## Coprimality validation

**Claude's choice:** Pairwise `gcd` check on every input change; inline `--role-warn` message when any pair isn't coprime; no attempt at a generalized non-coprime CRT (out of scope per REQUIREMENTS.md).

---

## Congruence count toggle

**Claude's choice:** 2-vs-3 toggle mirroring the Venn Diagram tool's existing 2-circle/3-circle toggle UX; moduli/remainders capped to a small range to keep the strip and scan animation readable.

---

## Presets

**Claude's choice:** Three chips — the classic Sun Tzu riddle (`x≡2 mod3, x≡3 mod5, x≡2 mod7` → 23) as the signature preset, a simple coprime pair, and a non-coprime pair to surface the CRT-02 validation path.

---

## Cross-link to GCD tool

**Claude's choice:** One-directional deep link, CRT → Euclidean Algorithm, via the existing `?a=&b=` param contract plus a new additive `?ext=1`-style param on the Euclidean Algorithm tool that auto-enables its Extended Euclidean toggle on load.
**Notes:** CRT-08's wording only requires one direction — explicitly did not extend this into a second Task-1-style bidirectional shared-localStorage pair, since that's not what the requirement asks for.

---

## Claude's Discretion

- Row color assignment for the 2nd/3rd congruence beyond the semantic role-token mapping
- Riddle preset flavor text/wording
- Exact moduli/remainder input ceiling for on-screen readability

## Deferred Ideas

- General N>3 congruence solver (CRT-V2-01, already tracked in REQUIREMENTS.md v2 section)
- Bidirectional persistent shared-state link between CRT and the Euclidean Algorithm tool — not required by CRT-08; revisit only if a future requirement asks for two-way sync
