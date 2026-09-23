# Feature Research

**Domain:** Interactive browser-based number-theory math visualizations for self-directed learners
**Researched:** 2026-09-23
**Confidence:** MEDIUM

## Feature Landscape

Three new tools this milestone: **Euclidean Algorithm / GCD**, **Chinese Remainder Theorem (CRT)**, **Continued Fractions**. Findings below are organized per-topic, then a cross-cutting section on palette unification UX.

---

### Topic 1: Euclidean Algorithm / GCD

#### Table Stakes

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Two integer inputs (a, b) with validation | Every GCD tool starts here; matches existing tools' number-input pattern | LOW | Reuse pattern from RSA/Sieve number inputs |
| Step-by-step `(a, b) → (b, a mod b)` reduction table/trace, revealed one step at a time | This *is* the algorithm — the existing survey shows every serious visualizer (Zerethon, Toolexe, MathWorks-style calculators) leads with this animated division table; without it the tool is just a GCD calculator, not a visualization | MEDIUM | Matches the codebase's staggered-`setTimeout`-reveal pattern already used in factor-tree and sieve |
| Final GCD clearly called out / highlighted at terminus | Users need the "aha, that's the answer" moment; abrupt stop without emphasis undercuts the teaching moment | LOW | Same "landing" beat used in factor-tree's leaf highlighting |
| Preset/example chip buttons (e.g. coprime pair, large pair, equal pair, one-is-multiple-of-other edge case) | Established convention across every existing tool in this repo (Sieve, RSA, completing-the-square) — self-learners lean on presets to explore without knowing what to type first | LOW | Include an edge case like `gcd(a, 0)` or `a == b` to teach termination condition |
| Playback controls (play/pause/step/instant-finish) for the reduction sequence | Directly matches the `requestAnimationFrame` + `generation`-counter playback pattern already established in Sieve and Completing-the-Square — this repo's house style, not just "nice to have" here | MEDIUM | Reuse the generation-counter invalidation pattern verbatim per CLAUDE.md guidance |

#### Differentiators

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Geometric/rectangle visualization alongside the numeric trace (nested rectangle being tiled by squares, shrinking each step) | This is the single most pedagogically powerful move found across sources — it makes "GCD = size of the smallest square that tiles the whole rectangle" visually self-evident, and doubles as the natural bridge to the Continued Fractions tool (same geometric operation) | MEDIUM-HIGH | SVG-rendered like existing tools; geometry driver is same "largest square cut repeatedly" loop that also powers the Continued Fractions rectangle |
| Extended Euclidean back-substitution: animate deriving Bézout coefficients (s, t) such that `gcd(a,b) = s·a + t·b` | Sources confirm this is a common "advanced mode" toggle on serious tools (MiniWebTool, Baeldung-style calculators show back-substitution + modular inverse) — connects directly to the existing RSA tool's modular-inverse needs, giving this milestone's tools a felt connection to the site's existing crypto tool | MEDIUM-HIGH | Best as an optional toggle/expand, not default-on, to keep the base visualization uncluttered for a first-time learner |
| "Try it yourself" mode — user predicts the next remainder before revealing it | Turns passive animation-watching into active recall, a differentiator none of the surveyed tools implement but fits this project's self-learner audience | MEDIUM | Optional; only if scope allows — do not let this block shipping the core visualization |

#### Anti-Features

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|------------------|-------------|
| Support for arbitrary-precision BigInt GCD of huge numbers | "Might as well make it general" | The teaching value is in watching a handful of small steps; huge numbers produce a wall of tiny steps that overwhelms the animation and geometric visualization (rectangles become unreadable at extreme aspect ratios) | Cap inputs at a friendly range (e.g. ≤ a few thousand, or bound step count) the same way Sieve bounds its grid; RSA's BigInt use is justified by cryptographic realism, this tool has no such requirement |
| Full "algorithm complexity / Lamé's theorem" lecture content | Feels like natural "deeper math" content to add | This is a course-content rabbit hole (asymptotic analysis) that doesn't serve the visualization-led format; scope creep beyond "explore the concept" | One short caption line at most (e.g. "Fibonacci pairs take the most steps") — not a section |

---

### Topic 2: Chinese Remainder Theorem

#### Table Stakes

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Multiple congruence inputs (≥2, ideally extendable to 3) — each as `x ≡ a (mod m)` | CRT is fundamentally a *system* of congruences; a tool that only handles one congruence isn't CRT | LOW-MEDIUM | Start with exactly 2 moduli for the default/first-load example (simplest case to animate), allow a third as a differentiator |
| Coprimality validation/warning on the moduli | CRT's uniqueness guarantee requires pairwise-coprime moduli; silently producing a wrong or misleading answer for non-coprime input would actively mis-teach the concept | LOW | Reuse the existing "message/status area" convention from other tools for this warning |
| Visual representation of each modulus's residue class (which numbers satisfy each congruence) with the simultaneous solution shown as their intersection | Every source (calculator sites, general CRT explainers) frames CRT visually as "intersection of residue classes" — a tool that just prints the final number via garner's formula without showing *why* it's the unique intersection fails to visualize the theorem, it just computes it | MEDIUM-HIGH | Two credible visual vocabularies found: (a) number-line with each modulus's matching positions highlighted in its own color, scanning to find the common hit; (b) one ring/clock-face per modulus (directly echoes this project's own existing "Congruence Wheel" — strong in-house precedent) |
| Step-by-step construction (Extended-Euclidean-based or search-based) trace, not just the final answer | Matches the repo's established "show the work" pattern (RSA walkthrough, factor tree) — an instant-answer CRT tool would be inconsistent with every sibling tool | MEDIUM | Construction method (using computed M_i and inverses) is more instructive than brute-force search once moduli are decently sized, but brute-force "just count up and check both" is the more intuitive *first* explanation for small examples — consider showing brute-force search as the default beat and construction as an "advanced/faster method" reveal |
| Preset examples (classic textbook pairs like mod 3 & mod 5, or the "remainders puzzle" framing: "3 eggs left over in groups of 5, 2 left over in groups of 7...") | Matches established preset-chip convention; CRT specifically benefits from a "riddle" framing since that's the concept's most famous real-world hook | LOW | The eggs/soldiers-counting framing is the standard motivating story for CRT and pairs well with a short intro paragraph |

#### Differentiators

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Animated "scanning" search across a number line/grid that visibly stops at the first number satisfying all congruences simultaneously | Makes the *existence and uniqueness* (mod M) claim viscerally clear — "watch it hunt and land" is a strong differentiator with modest complexity, reusing the RAF/generation-counter playback pattern already in the codebase | MEDIUM | This is the brute-force-search beat described above, elevated into the primary animation rather than a footnote |
| Toggle between 2 and 3 simultaneous congruences | Shows the theorem generalizes beyond the textbook 2-modulus case, without the complexity of arbitrary N | MEDIUM | Cap at 3 — beyond that, the visual (rings/number-line bands) gets cluttered and the pedagogical value plateaus |
| Side-by-side link back to the Euclidean/GCD tool for the modular-inverse step | CRT's construction method needs modular inverses, which is exactly what the Extended-Euclidean differentiator in Topic 1 produces — cross-referencing reinforces the site as a connected learning path rather than 8 isolated pages | LOW-MEDIUM | A simple "see how this inverse was found →" link/note; not a shared code module (per repo convention, keep math duplicated) |

#### Anti-Features

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|------------------|-------------|
| Arbitrary N-congruence general solver (N > 3) | "Make it fully general like a real CRT calculator" | Beyond 3 simultaneous residue-class visuals (number-line bands or rings), the diagram stops being readable and becomes a data table — defeats the visualization-led premise; also invites edge-case bugs (overflow, non-coprime combinatorics) far beyond what a teaching tool needs | Cap at 3 congruences; mention in intro prose that the theorem generalizes to any N pairwise-coprime moduli, without building the UI for it |
| Real-world "application" mode (RSA-CRT decryption speedup, secret sharing) | Feels like a natural tie-in given the site already has an RSA tool | Turns a focused concept visualization into a second crypto lecture, duplicating scope with the existing RSA Examplifier and diluting focus | One short sentence cross-referencing the RSA tool if relevant; no new demo |

---

### Topic 3: Continued Fractions

#### Table Stakes

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Input a fraction (or decimal) and compute its continued-fraction expansion `[a0; a1, a2, ...]` | Baseline function every surveyed tool (dCode, monocalc, agentcalc, Alpertron) provides | LOW | Reuse GCD-adjacent integer/fraction parsing helpers, duplicated per-file per repo convention |
| The square-filling-rectangle visualization: start with a rectangle sized to the fraction, repeatedly cut the largest possible square, and show each cut animated in sequence | This is the field's dominant and most-cited pedagogical device (NRICH, Robert Dickau, adamponting.com, Wolfram Demonstrations all converge independently on it) — it is *the* way to make continued fractions visually self-evident rather than a symbol-pushing exercise, and it geometrically IS the Euclidean algorithm, directly reinforcing Topic 1 | MEDIUM-HIGH | Natural SVG-rendered diagram consistent with the site's hand-drawn-diagram house style (`svgEl` helper); this is the centerpiece, not optional |
| Convergents table (successive truncations `p_k/q_k` with decimal value) | Every dedicated calculator (dCode, monocalc, agentcalc, Alpertron) treats this as core output, not a bonus — convergents are the payoff of computing the continued fraction (best rational approximations) | LOW-MEDIUM | Simple table; highlight/animate the currently-displayed convergent in sync with the rectangle animation step |
| Preset chips: at minimum an irrational constant (√2 or the golden ratio φ) plus a "nice" rational like 22/7 (π approximation) | Presets convention across the repo; irrational presets are what make continued fractions interesting (periodic for quadratic irrationals, famous convergents like 22/7 ≈ π) | LOW | φ's continued fraction is all 1s — a strong, immediately-graspable "aha" preset; also produces the visually distinct near-golden spiral noted in sources |

#### Differentiators

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Fibonacci/golden-ratio spiral emphasis — when the input is φ or a Fibonacci ratio, the shrinking-square animation visibly approaches a golden spiral | Sources explicitly call this out as the most visually striking special case of the rectangle method; strong "wow" moment that elevates the tool past a generic calculator, and ties into a mathematically famous fact self-learners are likely to already be curious about | MEDIUM | Natural highlight/callout when the preset chip for φ or Fibonacci pairs is used — a "did you notice..." message beat |
| Toggle/slider on number of terms shown, dynamically redrawing both the rectangle diagram and the convergents table | Confirmed pattern from monocalc ("terms slider redraws the nested fraction diagram and trims the convergents table") — gives the learner direct manipulation rather than a fixed animation | MEDIUM | Good differentiator; pairs naturally with playback controls already established in the repo (step forward/back = add/remove one term) |
| Approximation-error visualization — show how close each convergent gets to the true value (e.g. a shrinking-gap indicator or an error column in the convergents table) | Makes the "best rational approximation" property tangible — why convergents are special versus arbitrary fractions | LOW-MEDIUM | Can be a simple numeric column (error/decimal diff) rather than a separate chart; keep low-complexity |
| Stern-Brocot tree / mediant-path view as an alternate representation | Sources confirm a real mathematical connection (continued-fraction expansion = L/R path through the Stern-Brocot tree, same best-approximation property) — a genuinely deep alternate lens | HIGH | Interesting but materially increases scope and introduces a second unfamiliar diagram type; treat as a stretch goal only if the rectangle+convergents core ships comfortably within budget — do not let this become required scope |

#### Anti-Features

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|------------------|-------------|
| General "any real number via arbitrary-precision decimal" input | "Let users type in any number, even π to 50 digits" | Continued-fraction expansion of an arbitrary high-precision decimal is finite and essentially rational-approximation noise beyond floating-point precision — misleading for irrationals (behaves as if it terminates) and adds numerical-edge-case complexity disproportionate to teaching value | Offer a curated set of symbolic irrational presets (√2, √3, φ, e) computed via their known recurrence/CF pattern, plus arbitrary rational (p/q) input; treat literal decimal input as a "reasonable precision" rational, same spirit as the Sieve tool's bounded input range |
| Stern-Brocot tree as a *required* v1 feature | Feels like "the real deep-math payoff," tempting to include from the start | High implementation complexity (a second unfamiliar tree-diagram vocabulary) risks delaying ship of the core rectangle+convergents visualization, which alone fully satisfies the requirement | Ship rectangle + convergents first; revisit Stern-Brocot as a follow-up enhancement only after the core tool ships |

---

## Feature Dependencies

```
[GCD reduction trace] (Euclidean tool, table stakes)
    └──shares geometry with──> [Rectangle-square visualization] (Continued Fractions tool, table stakes)
                                    (same "cut largest square repeatedly" loop; implement once conceptually, duplicate as code per repo convention)

[Extended Euclidean / Bézout coefficients] (Euclidean tool, differentiator)
    └──feeds──> [CRT construction method: modular inverses] (CRT tool, table stakes construction step)

[CRT: brute-force scanning search] (CRT tool, differentiator/primary animation)
    └──simpler-alternative-to──> [CRT: Extended-Euclidean construction method] (CRT tool, table stakes)
        (both are valid; brute-force is the default/first beat for small examples, construction is the "advanced/faster" reveal)

[Continued Fractions: convergents table] (table stakes)
    └──enhanced-by──> [Terms slider] (differentiator)
    └──enhanced-by──> [Approximation-error column] (differentiator)

[Continued Fractions: Stern-Brocot tree view] (differentiator/stretch)
    └──requires──> [Continued Fractions: core expansion + convergents] (table stakes, must ship first)

[Playback controls: play/pause/step/instant-finish] (all three tools, table stakes)
    └──reuses──> existing `generation`-counter RAF pattern from Sieve/Completing-the-Square (established site pattern, not new R&D)

[Preset/example chips] (all three tools, table stakes)
    └──reuses──> existing chip-button convention from Sieve/RSA/Completing-the-Square
```

### Dependency Notes

- **Rectangle-square visualization shares geometry with the GCD reduction trace:** Both the Euclidean tool's optional geometric view and the Continued Fractions tool's core visualization are the same mathematical operation (repeatedly cutting the largest square from a rectangle). Per repo convention, do not extract a shared module — but design the Euclidean tool's rectangle view and the Continued Fractions tool's rectangle view to *feel* like siblings (same visual grammar), since a learner may reasonably use both tools back-to-back and should recognize the connection.
- **Extended Euclidean feeds CRT's construction method:** If the CRT tool's construction-method reveal (table stakes) is built before or alongside the Euclidean tool's Extended-Euclidean differentiator, duplicate just the modular-inverse-via-back-substitution logic in the CRT file rather than blocking CRT on Euclidean shipping first — but sequencing Euclidean-with-Extended-mode before CRT in the roadmap reduces risk of solving the same problem twice independently.
- **CRT's two methods (brute-force search vs. construction) are not conflicting, they're complementary beats:** brute-force is the intuitive default animation for small/first-load examples; construction (Extended Euclidean based) is presented as the "how a computer actually does it for big numbers" advanced reveal. Order them for the learner as: guess-and-check first, formula second.
- **Stern-Brocot tree requires the core Continued Fractions tool to exist first:** it's an alternate *representation* of the same expansion data already computed for the convergents table — natural v1.1 add-on, not a parallel-track feature.
- **Playback controls and preset chips are cross-cutting dependencies, not per-topic features:** all three new tools depend on the same two established UI patterns already proven in the codebase (Sieve, Completing-the-Square, RSA). Treat these as "reuse the house pattern," not as three separate implementation efforts to design from scratch.

---

## MVP Definition

### Launch With (v1) — per new tool

**Euclidean Algorithm / GCD:**
- [ ] Two-integer input with validation — establishes the basic interaction
- [ ] Step-by-step `(a,b)→(b,a mod b)` animated trace with playback controls — this is the core teaching mechanism, without it there's no visualization
- [ ] Final GCD highlight — closes the loop, gives the payoff moment
- [ ] Preset chips (coprime pair, one-is-multiple-of-other, equal pair) — matches established site convention, gives learners a starting point

**Chinese Remainder Theorem:**
- [ ] Two-congruence input (`x ≡ a mod m`) with coprimality validation — minimum viable system
- [ ] Visual residue-class representation (number-line bands or per-modulus rings) with the solution shown as their intersection — this is what makes it a *visualization* of the theorem, not just a calculator
- [ ] Brute-force scanning animation to find/land on the simultaneous solution — the primary, intuitive teaching beat
- [ ] Preset chips including the classic "remainders riddle" framing — gives self-learners the motivating hook

**Continued Fractions:**
- [ ] Fraction/rational input, computed expansion `[a0; a1, ...]`
- [ ] Square-filling-rectangle animated visualization — the field-standard, most-effective teaching device; this is the centerpiece
- [ ] Convergents table synced to the animation
- [ ] Preset chips including φ (golden ratio) and 22/7 — gives an immediate "aha" irrational example plus a familiar rational one

### Add After Validation (v1.x)

- [ ] Extended Euclidean / Bézout-coefficient mode on the GCD tool — add once the core reduction-trace visualization is confirmed working and there's appetite for the "advanced" toggle
- [ ] CRT construction-method (Extended-Euclidean-based) reveal as an alternative to brute-force — add once the brute-force scanning animation is validated as clear and correct
- [ ] Three-congruence toggle on CRT — add once the two-congruence case is polished
- [ ] Terms slider + approximation-error column on Continued Fractions — add once the core rectangle+convergents pairing is validated
- [ ] Cross-tool links (Euclidean↔CRT, Euclidean↔Continued Fractions) — add once all three new tools exist and can reference each other meaningfully

### Future Consideration (v2+)

- [ ] Stern-Brocot tree alternate view for Continued Fractions — defer: materially higher complexity, second unfamiliar diagram vocabulary, not required to satisfy the core requirement
- [ ] "Try it yourself" predictive-recall mode on the Euclidean tool — defer: interesting engagement idea but unproven fit for this site's format, validate demand first
- [ ] N>3 congruence general CRT solver — defer indefinitely: actively hurts the visualization-led premise past 3 residue classes

---

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| GCD step-by-step animated trace | HIGH | MEDIUM | P1 |
| GCD preset chips | MEDIUM | LOW | P1 |
| CRT residue-class visual (number-line/rings) + intersection | HIGH | MEDIUM-HIGH | P1 |
| CRT brute-force scanning animation | HIGH | MEDIUM | P1 |
| CRT coprimality validation | HIGH | LOW | P1 |
| Continued Fractions rectangle-square animation | HIGH | MEDIUM-HIGH | P1 |
| Continued Fractions convergents table | HIGH | LOW-MEDIUM | P1 |
| GCD rectangle/geometric view (optional add-on) | MEDIUM | MEDIUM-HIGH | P2 |
| Extended Euclidean / Bézout mode | MEDIUM | MEDIUM-HIGH | P2 |
| CRT construction-method (formula) reveal | MEDIUM | MEDIUM | P2 |
| Continued Fractions terms slider | MEDIUM | MEDIUM | P2 |
| Continued Fractions error/approximation column | MEDIUM | LOW-MEDIUM | P2 |
| CRT 3-congruence toggle | LOW-MEDIUM | MEDIUM | P2 |
| Cross-tool linking (Euclidean↔CRT↔Continued Fractions) | MEDIUM | LOW | P2 |
| Stern-Brocot tree view | MEDIUM | HIGH | P3 |
| Predictive "try it yourself" recall mode | LOW-MEDIUM | MEDIUM | P3 |
| N>3 general CRT solver | LOW | HIGH | P3 (do not build) |
| Arbitrary-precision decimal CF input | LOW | HIGH | P3 (do not build) |

**Priority key:**
- P1: Must have for launch
- P2: Should have, add when possible
- P3: Nice to have, future consideration

---

### Cross-cutting: Unifying the visual palette across playful, differently-themed tools

This isn't a per-topic feature but directly affects how all three new tools (and the five existing ones) should be built, per the "Active" requirement to unify color palette. Findings below apply site-wide.

#### What makes unification succeed (do this)

| Pattern | Why it works | Complexity |
|---------|---------------|------------|
| One shared **base palette** (neutrals, surface/text/border tokens, the day/night theme pair already established via `assets/theme.js`) applied identically across every tool | This is the actual "unify" lever — consistent chrome, backgrounds, and typography make the site read as one product regardless of what each diagram depicts | LOW (mostly already exists via `assets/site.css`) |
| A **single accent-color system with per-tool "voice"**, not per-tool arbitrary palettes: each tool gets one (or a small fixed set of) accent hue(s) drawn from the *same* shared hue ramp/scale, rather than a bespoke color story invented per page | Sources on multi-brand/multi-product design systems converge on this: a shared token system (surface, text-muted, semantic states) with room for a bounded accent choice per surface avoids both "everything looks identical" and "nothing looks related" — this is how Wise's system balances one strong brand anchor with per-context accent energy | MEDIUM |
| Reserve color **meaning** consistently across tools (e.g. if a warm accent means "the answer/result" in one tool, it should mean the same in all; if a specific hue marks "user input" vs "computed output," keep that mapping constant) | Semantic consistency is what actually reads as "one coherent system" to a user moving between pages — more important than every tool sharing literal identical hex values everywhere | LOW-MEDIUM |
| Preserve **playful decorative touches** (the existing snow/stars/fairy-lights-style flourishes) as accent-level detail layered on top of the shared base, not removed | The known failure mode of unification is "flattened and boring" — the fix isn't to strip personality, it's to constrain *where* personality can vary (decorative flourishes, illustration-level detail) while keeping structural chrome (nav, cards, buttons, form controls) fully consistent | LOW-MEDIUM |
| Define the shared palette as **CSS custom properties in `assets/site.css`** (already the established architecture) with each tool's `<style>` block consuming those variables instead of redefining its own `:root` color set | Matches existing repo architecture exactly (per-tool CSS custom properties, now sourced from the shared file) — zero new tooling, no build step, fully consistent with "no shared JS module" convention already carved out as the one intentional exception for site chrome | LOW |

#### What makes unification fail / feel flattened (avoid this)

| Anti-pattern | Why it's tempting | Why it backfires | Alternative |
|--------------|---------------------|-------------------|-------------|
| Force every tool onto **one single accent color** site-wide (e.g. everything is the same blue) | Feels like the most literal interpretation of "unify" | This is exactly the "flattened/boring" failure mode — a factor tree, a modular-arithmetic wheel, and an RSA narrative lose their distinct visual identity/memorability entirely if they're monochrome-identical; sources warn that stripping brand/context color entirely removes wayfinding cues that help users know which tool they're in | Use one shared *system* (base neutrals + a constrained accent ramp) but allow each tool a distinct accent pick from within that ramp — same rules, different note played |
| Treat unification as a **one-time repaint pass** disconnected from the shared token architecture | Faster to "just change the hex codes in each file" | Produces visual consistency today that immediately drifts the next time any tool is touched, since there's no shared source of truth — exactly the problem already diagnosed in this repo's own `.page-header` CSS-leak issue (per-file styles overriding shared chrome) | Centralize the palette as tokens in `assets/site.css`, consumed by reference, so drift becomes structurally hard rather than requiring discipline |
| Homogenize **functional/semantic color** (success, warning, danger-style states, or "this is user input" vs "this is the computed result") differently per tool | Seems low-stakes, each tool "just needs its own colors for its own states" | Cross-tool inconsistency in what a color *means* is more damaging to the "one coherent site" feel than differing decorative accents — a learner who's internalized "teal = highlighted node" in one tool gets confused if teal means something else in the next | Fix semantic color meaning site-wide even while allowing decorative/accent color to vary per tool |

