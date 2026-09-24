# Requirements: Number Theory & Abstract Algebra Browser Tools

**Defined:** 2026-09-24
**Core Value:** Every concept gets a visualization a self-learner can interact with and immediately understand — the diagram teaches, the text supports it.

## v1 Requirements

Requirements for this milestone (three new number-theory tools + site-wide palette unification). Each maps to roadmap phases.

### Palette

- [ ] **PAL-01**: All eight tools (five existing + three new) render with one identical, literal color palette — no tool keeps a distinct accent or color scheme
- [ ] **PAL-02**: Palette tokens are centralized in `assets/` (e.g. `assets/palette.css`) rather than redeclared per-tool, so every tool consumes the same source of truth via `var()`
- [ ] **PAL-03**: The unified palette preserves the existing day/night theme toggle (`assets/theme.js`), with both modes fully re-themed
- [ ] **PAL-04**: Colors that carry meaning (e.g. "this is the computed answer," "this is user input") mean the same thing across every tool, even though the literal palette is now shared

### Euclidean Algorithm / GCD

- [ ] **GCD-01**: User can input two integers (a, b) with validation
- [ ] **GCD-02**: User can watch an animated step-by-step `(a,b) → (b, a mod b)` reduction trace with playback controls (play/pause/step/instant-finish)
- [ ] **GCD-03**: User sees the final GCD clearly highlighted at the end of the trace
- [ ] **GCD-04**: User can pick from preset example pairs (coprime pair, one-is-multiple-of-other, equal pair)
- [ ] **GCD-05**: User can view a geometric rectangle-tiling visualization alongside the numeric trace (repeatedly cutting the largest square from a shrinking rectangle)
- [ ] **GCD-06**: User can toggle an Extended Euclidean / Bézout coefficients mode showing s, t such that `gcd(a,b) = sa + tb`

### Chinese Remainder Theorem

- [ ] **CRT-01**: User can input two or three congruences of the form `x ≡ a (mod m)`
- [ ] **CRT-02**: User receives a clear validation warning if the moduli are not pairwise coprime, rather than a silently wrong answer
- [ ] **CRT-03**: User sees a visual representation of each modulus's residue class, with the simultaneous solution shown as their intersection
- [ ] **CRT-04**: User can watch an animated brute-force scan that finds and lands on the simultaneous solution
- [ ] **CRT-05**: User can reveal an Extended-Euclidean-based construction method as an advanced/faster alternative to the brute-force scan
- [ ] **CRT-06**: User can toggle between 2 and 3 simultaneous congruences
- [ ] **CRT-07**: User can pick preset examples, including a classic "remainders riddle" framing
- [ ] **CRT-08**: User can navigate from the CRT tool to the GCD tool's modular-inverse step

### Continued Fractions

- [ ] **CF-01**: User can input a fraction/rational number and see its continued-fraction expansion `[a0; a1, a2, ...]`
- [ ] **CF-02**: User can watch an animated square-filling-rectangle visualization of the expansion (same geometric operation as GCD-05)
- [ ] **CF-03**: User sees a convergents table (`p_k/q_k` with decimal value) kept in sync with the animation
- [ ] **CF-04**: User can pick preset chips including an irrational constant (golden ratio φ) and a rational approximation (22/7)
- [ ] **CF-05**: User sees a golden-spiral callout when the input is φ or a Fibonacci-pair ratio
- [ ] **CF-06**: User can adjust a terms slider that redraws both the rectangle diagram and the convergents table
- [ ] **CF-07**: User sees an approximation-error column in the convergents table
- [ ] **CF-08**: User can navigate from the Continued Fractions tool to the GCD tool

### Site Navigation

- [ ] **NAV-01**: `index.html` hub and every tool's shared nav header list all eight tools, with the current tool marked active
- [ ] **NAV-02**: Each new tool follows the established architecture — one top-level directory, one self-contained `.html` file, inline `<style>`/`<script>`, no external JS dependency beyond Google Fonts

## v2 Requirements

Deferred to future releases. Tracked but not in this milestone's roadmap.

### Euclidean Algorithm / GCD

- **GCD-V2-01**: "Try it yourself" predictive-recall mode (user predicts the next remainder before it's revealed)

### Continued Fractions

- **CF-V2-01**: Stern-Brocot tree / mediant-path alternate view

### Chinese Remainder Theorem

- **CRT-V2-01**: General N-congruence solver (N > 3)

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Group theory / abstract algebra visualizers (Cayley tables, symmetry groups, cosets, quotient groups) | A future milestone in its own right — needs a distinct visual vocabulary designed deliberately, not bolted onto this number-theory-focused milestone |
| Arbitrary-precision BigInt GCD for huge numbers | Teaching value is in watching a handful of readable steps; huge numbers produce unreadable walls of steps and degenerate rectangle aspect ratios — cap the input range instead |
| Arbitrary-precision decimal input for irrationals in Continued Fractions | Finite decimal expansion of an irrational is rational-approximation noise beyond float precision, and falsely implies the expansion terminates — offer curated symbolic irrational presets instead |
| N > 3 congruence general CRT solver | Past 3 simultaneous residue-class visuals, the diagram stops being readable and becomes a data table — defeats the visualization-led premise |
| Stern-Brocot tree view for Continued Fractions | A second, unfamiliar diagram vocabulary; materially higher complexity than the core rectangle+convergents visualization; better as a dedicated future addition |
| Build system, package manager, or JS framework | The zero-dependency single-file-per-tool pattern is intentional and proven at this project's scale |
| Backend, accounts, or server-side persistence | Everything stays client-side (localStorage only), consistent with all existing tools |

## Traceability

Which phases cover which requirements. Populated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| PAL-01 | Phase 1 | Pending |
| PAL-02 | Phase 1 | Pending |
| PAL-03 | Phase 1 | Pending |
| PAL-04 | Phase 1 | Pending |
| GCD-01 | Phase 2 | Pending |
| GCD-02 | Phase 2 | Pending |
| GCD-03 | Phase 2 | Pending |
| GCD-04 | Phase 2 | Pending |
| GCD-05 | Phase 2 | Pending |
| GCD-06 | Phase 2 | Pending |
| CRT-01 | Phase 3 | Pending |
| CRT-02 | Phase 3 | Pending |
| CRT-03 | Phase 3 | Pending |
| CRT-04 | Phase 3 | Pending |
| CRT-05 | Phase 3 | Pending |
| CRT-06 | Phase 3 | Pending |
| CRT-07 | Phase 3 | Pending |
| CRT-08 | Phase 3 | Pending |
| CF-01 | Phase 4 | Pending |
| CF-02 | Phase 4 | Pending |
| CF-03 | Phase 4 | Pending |
| CF-04 | Phase 4 | Pending |
| CF-05 | Phase 4 | Pending |
| CF-06 | Phase 4 | Pending |
| CF-07 | Phase 4 | Pending |
| CF-08 | Phase 4 | Pending |
| NAV-01 | Phase 4 | Pending |
| NAV-02 | Phase 2 | Pending |

**Coverage:**
- v1 requirements: 28 total
- Mapped to phases: 28
- Unmapped: 0 ✓

---
*Requirements defined: 2026-09-24*
*Last updated: 2026-09-24 after roadmap creation (traceability mapped to Phases 1-4)*
