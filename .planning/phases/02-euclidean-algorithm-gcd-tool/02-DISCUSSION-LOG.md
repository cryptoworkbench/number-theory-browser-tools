# Phase 2: Euclidean Algorithm / GCD Tool - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-09-27
**Phase:** 2-euclidean-algorithm-gcd-tool
**Areas discussed:** Tile capping (geometric view), Bézout coefficient presentation, Venn Diagrams cross-link, numeric trace display style

---

## Tile capping (large-quotient handling in the geometric view)

| Option | Description | Selected |
|--------|-------------|----------|
| Cap tile count, show a ×N badge | Draw up to a cap of full-size squares, collapse the remainder into one labeled ×N tile | ✓ |
| Auto-switch to numeric-only for large steps | Hide the geometric panel for that step, show only the numeric trace with a note | |
| Always scale tiles down to fit, no cap | Shrink tile size proportionally, however many tiles there are | |

**User's choice:** Cap tile count, show a ×N badge (recommended option).
**Notes:** Directly addresses the quotient-scaled tile blowup pitfall already flagged in `.planning/research/PITFALLS.md` (Pitfall 5).

---

## Extended Euclidean / Bézout coefficient presentation

| Option | Description | Selected |
|--------|-------------|----------|
| Extra columns on the same trace table | s, t columns added to the existing forward trace, computed via back-substitution as it animates | ✓ |
| Separate back-substitution animation after the fact | A second animated pass runs backward through the same steps | |
| Static final equation only | No step-by-step buildup, just the final identity revealed at the end | |

**User's choice:** Extra columns on the same trace table (recommended option).
**Notes:** Keeps one unified view rather than a second animation pass; toggle stays off by default per research guidance.

---

## Venn Diagrams cross-link

| Option | Description | Selected |
|--------|-------------|----------|
| Yes, add a cross-link both ways | GCD tool links to Venn Diagrams and vice versa | ✓ |
| One-way link only | Only the new GCD tool links outward | |
| No cross-link for now | Keep tools independent, rely on nav header only | |

**User's choice:** Yes, add a cross-link both ways (recommended option).
**Notes:** Both tools already independently frame themselves around GCD; this is a new decision not present in the original roadmap phase text, so it slightly extends Phase 2's file scope to include one additive edit to the existing `Venn Diagrams/venn-diagrams.html`.

---

## Numeric trace display style

| Option | Description | Selected |
|--------|-------------|----------|
| Growing equation chain | Each step appends a division-algorithm line (e.g. "240 = 5×46 + 10") building downward | ✓ |
| Table of rows (a \| b \| q \| r) | Compact table like the Congruence Wheel's reference list | |

**User's choice:** Growing equation chain (recommended option).
**Notes:** Reads as a familiar textbook derivation.

---

## Claude's Discretion

- Exact preset numeric pairs beyond the four required categories (coprime, multiple, equal, gcd(a,0) edge case).
- Exact visual/geometric styling of the rectangle-tiling view (palette-token mapping).
- Exact wording/placement of the cross-link note and the cap-exceeded message.
- Whether to build the optional "predict the next remainder" stretch feature (default: skip unless trivial).

## Deferred Ideas

- Cayley table generator / abstract algebra visualizers — raised by the user in the same conversation as a separate, unrelated request; explicitly out of scope for this milestone per `.planning/PROJECT.md`. Not part of this phase; flagged for the user separately.
- Full algorithmic-complexity/Lamé's theorem lecture content — explicitly an anti-feature per research; at most a one-line caption.
