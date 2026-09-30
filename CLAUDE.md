# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

A collection of HTML browser tools that visualize number-theory concepts (prime factorization, modular arithmetic, RSA, sieve of Eratosthenes). Each tool is one page in its own top-level directory, built on shared site chrome and shared JS logic under `assets/`. There is no build system, package manager, or test suite — each tool runs by opening its `.html` file directly in a browser.

## Repository layout

Each tool lives in its own top-level directory named after the tool, containing exactly one `.html` file:

- `Factor Tree/factor-tree.html` — animated prime factor tree (recursive factorization diagram, SVG-rendered)
- `Fermats Method/fermats-method.html` — visualizes integer factoring via Fermat's method (search for a² − N = b²)
- `Equivalence Wheel/equivalence-wheel.html` — "Equivalence Wheel," a modular arithmetic visualizer using pizza-slice sectors
- `RSA/rsa.html` — walks through RSA key generation, encryption, and a brute-force factoring attack demo (Bob/Alice/Eve narrative)
- `Sieve Of Eratosthenes/sieve-of-eratosthenes.html` — animated sieve grid with playback controls and audio chimes on primes found

Each tool directory also has a stray `CLAUDE_RESUME_COMMAND` (or `RESUME_CLAUDES_CHAT` in the Sieve directory) file containing a `claude --resume <session-id>` command left over from the session that built that tool. These are not part of the app; leave them as-is unless the user asks to clean them up.

## Architecture pattern (applies to every tool)

Every tool follows the same structure — one HTML page per tool plus the shared files in `assets/`, no npm, no bundler:

1. **`<style>` block** — all CSS inline in `<head>`, including CSS custom properties (`:root` variables) for theming, keyframe animations for decorative effects (snow, twinkling stars, fairy lights, etc.), and responsive breakpoints via `@media`.
2. **Static markup** — controls (number inputs, buttons, preset "chip" buttons for example values), a message/status area, and a "stage" container that JS renders into.
3. **`<script>` block, IIFE-wrapped** — plain vanilla JS (no frameworks, no build step). A tool that needs shared logic includes the matching `assets/nt-*.js` module(s) as plain `<script src>` tags immediately before its own inline `<script>`, then opens that inline script with an import block — one `const { ... } = NT.NAME;` line per namespace used. Common internal structure across tools:
   - Shared logic modules loaded before the inline script: `assets/nt-core.js` (`NT.core` — plain-Number number theory: gcd, clamp, mod, modInverse, modPowSmall, isPrime, isqrt, isPerfectSquare, primeFactors, smallestPrimeFactor, fermatSplit, unitsMod, totient, euclidSteps, randomInt), `assets/nt-bigint.js` (`NT.bigint` — BigInt arithmetic, Miller-Rabin, random BigInts, BigInt parsing/formatting), `assets/nt-svg.js` (`NT.svg` — svgEl, centre-explicit polar and annularSectorPath, easing), `assets/nt-store.js` (`NT.store` — cross-tool shared settings over cookie + localStorage, deep-link readers, legacy-key migration), `assets/nt-layout.js` (`NT.layout` — Euclidean nested-squares layout, factor-tree builder; a page including it must include `nt-core.js` first). Each is a plain, non-deferred `<script src>` — no `defer`, no `async`, no `type="module"` — in the canonical order core, bigint, svg, store, layout, so every helper is ready before the inline script's IIFE runs and the page keeps working when opened straight from `file://`.
   - A tool defines only the functions specific to it; number-theory math comes from `NT.core`/`NT.bigint` and SVG/geometry helpers come from `NT.svg` via the import block.
   - A render/build function that lays out geometry (positions, radii, spacing) based on container width, drawing SVG elements through `NT.svg.svgEl`, then animates it in with staggered `setTimeout` reveals and CSS transitions/keyframes.
   - Play/pause/step/instant-finish playback controls (Sieve and Fermat's Method tools) driven by `requestAnimationFrame`-style loops with a `generation` counter used to invalidate stale animation callbacks when the user restarts mid-animation.
   - Event wiring at the bottom (button clicks, Enter key, preset chips) plus a `window.addEventListener('load', ...)` that runs an example on page load.
4. **External resources**: only Google Fonts (`fonts.googleapis.com`) are loaded via `<link>`; the `assets/nt-*.js` files are same-origin, not third-party dependencies. RSA and Diffie-Hellman Key Exchange's `BigInt` arithmetic (key generation, modular exponentiation) comes from `NT.bigint` — no external crypto library.

## Working with this codebase

- There is no build/lint/test command — verify changes by opening the modified `.html` file directly in a browser (e.g. `open "Sieve Of Eratosthenes/sieve-of-eratosthenes.html"` or via a local file:// URL) and exercising the controls. Tool pages load their `assets/nt-*.js` modules via relative `../assets/` paths, so open the file in place rather than copying it elsewhere.
- When adding a new tool, follow the existing pattern: one new top-level directory, one `.html` page with inline `<style>` and inline `<script>` for the tool's own code, including the `assets/nt-*.js` modules it needs, no external JS dependencies beyond Google Fonts.
- Every page's palette comes from one shared file, `assets/palette.css` — link it in `<head>` immediately before `assets/site.css` (and before the tool's own `<style>` block). A new tool's `<style>` block declares no literal color (no hex, `rgb()`/`rgba()`, `hsl()`/`hsla()`, or named color): every color is consumed via `var()` against the tokens `assets/palette.css` declares, including its semantic `--role-*` layer (see the header comment in that file for what each role means — result, input, active step, inert/eliminated, warning, advanced/special, alternate participant). A tool may still declare a local custom property when its value is a non-color (e.g. the Sieve's `--cell-min`, a length written at runtime by JS) or is built entirely from `var()`/`color-mix()` references (e.g. the factor tree's four SVG gradient aliases) — imitate one of these two patterns if a new tool needs a locally-named alias.
- Shared JS logic lives in `assets/nt-core.js`, `assets/nt-bigint.js`, `assets/nt-svg.js`, `assets/nt-store.js` and `assets/nt-layout.js`, each assigning one frozen object to its own namespace under `window.NT` (`NT.core`, `NT.bigint`, `NT.svg`, `NT.store`, `NT.layout`). A helper that more than one tool needs — general number-theory, BigInt, SVG, shared-state or layout primitives — belongs in the matching module; a tool's own rendering, state and playback code stays in its page. Import what a page needs with one `const { ... } = NT.NAME;` line per namespace, names sorted within each line, namespaces in the canonical order core, bigint, svg, store, layout; a tool never redefines or assigns to an `NT` member. A new cross-page concern — for example Phase 6's translations — gets its own `assets/nt-NAME.js` module exporting on its own `NT.NAME` namespace (e.g. `nt-i18n.js` / `NT.i18n`), following the same classic-script, frozen-export pattern as the existing five modules. `NT.store`'s persisted keys (`group-params`, `ab-params`) and their payload shapes are a contract between the pages that share them — don't rename a key or reshape a payload without a migration plan for values already in storage.
