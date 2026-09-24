# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

A collection of standalone, single-file HTML browser tools that visualize number-theory concepts (prime factorization, modular arithmetic, RSA, sieve of Eratosthenes). There is no build system, package manager, or test suite — each tool is a self-contained `.html` file that runs by opening it directly in a browser.

## Repository layout

Each tool lives in its own top-level directory named after the tool, containing exactly one `.html` file:

- `Christmas Trees/factor-tree.html` — animated prime factor tree (recursive factorization diagram, SVG-rendered)
- `Factorize By Completing The Square/factorize-completing-square.html` — visualizes factoring quadratics via completing-the-square trials
- `Pizza Slices/pizza-slices.html` — "Congruence Wheel," a modular arithmetic visualizer using pizza-slice sectors
- `RSA Examplifier/rsa-examplifier.html` — walks through RSA key generation, encryption, and a brute-force factoring attack demo (Bob/Alice/Eve narrative)
- `Sieve Of Eratosthenes/sieve-of-eratosthenes.html` — animated sieve grid with playback controls and audio chimes on primes found

Each tool directory also has a stray `CLAUDE_RESUME_COMMAND` (or `RESUME_CLAUDES_CHAT` in the Sieve directory) file containing a `claude --resume <session-id>` command left over from the session that built that tool. These are not part of the app; leave them as-is unless the user asks to clean them up.

## Architecture pattern (applies to every tool)

Every tool follows the same self-contained single-file structure — no external JS/CSS files, no npm, no bundler:

1. **`<style>` block** — all CSS inline in `<head>`, including CSS custom properties (`:root` variables) for theming, keyframe animations for decorative effects (snow, twinkling stars, fairy lights, etc.), and responsive breakpoints via `@media`.
2. **Static markup** — controls (number inputs, buttons, preset "chip" buttons for example values), a message/status area, and a "stage" container that JS renders into.
3. **`<script>` block, IIFE-wrapped** — plain vanilla JS (no frameworks, no build step). Common internal structure across tools:
   - Pure number-theory functions at the top (e.g. `primeFactors`, `isPrime`, `smallestPrimeFactor`, `bigGcd`, `modPowPlain`, `isPrimeBig`) — these are the actual math and are safe to reuse/reference across tools if porting logic.
   - An `svgEl(tag, attrs)` helper for building SVG elements via `document.createElementNS` (repeated verbatim in most tools) — used for hand-drawn diagrams (trees, sectors, grids) rather than any charting library.
   - A render/build function that lays out geometry (positions, radii, spacing) based on container width, then animates it in with staggered `setTimeout` reveals and CSS transitions/keyframes.
   - Play/pause/step/instant-finish playback controls (Sieve and Completing-the-Square tools) driven by `requestAnimationFrame`-style loops with a `generation` counter used to invalidate stale animation callbacks when the user restarts mid-animation.
   - Event wiring at the bottom (button clicks, Enter key, preset chips) plus a `window.addEventListener('load', ...)` that runs an example on page load.
4. **External resources**: only Google Fonts (`fonts.googleapis.com`) are loaded via `<link>`; no other CDN or third-party JS dependency is used anywhere in the repo. The RSA tool uses native `BigInt` for large-number arithmetic (key generation, modular exponentiation) — no external crypto library.

## Working with this codebase

- There is no build/lint/test command — verify changes by opening the modified `.html` file directly in a browser (e.g. `open "Sieve Of Eratosthenes/sieve-of-eratosthenes.html"` or via a local file:// URL) and exercising the controls.
- When adding a new tool, follow the existing pattern: one new top-level directory, one self-contained `.html` file with inline `<style>` and inline `<script>`, no external JS dependencies beyond Google Fonts.
- Every page's palette comes from one shared file, `assets/palette.css` — link it in `<head>` immediately before `assets/site.css` (and before the tool's own `<style>` block). A new tool's `<style>` block declares no literal color (no hex, `rgb()`/`rgba()`, `hsl()`/`hsla()`, or named color): every color is consumed via `var()` against the tokens `assets/palette.css` declares, including its semantic `--role-*` layer (see the header comment in that file for what each role means — result, input, active step, inert/eliminated, warning, advanced/special, alternate participant). A tool may still declare a local custom property when its value is a non-color (e.g. the Sieve's `--cell-min`, a length written at runtime by JS) or is built entirely from `var()`/`color-mix()` references (e.g. the factor tree's four SVG gradient aliases) — imitate one of these two patterns if a new tool needs a locally-named alias.
- Number-theory helper functions (primality testing, factorization, modular exponentiation, GCD) are duplicated per-file rather than shared — this is intentional given the single-file-per-tool design; don't introduce a shared JS module unless explicitly asked.
