---
phase: "7"
slug: "shared-js-module-refactor"
status: verified
# threats_open = count of OPEN threats at or above workflow.security_block_on severity (the blocking gate)
threats_open: 0
asvs_level: 1
created: "2026-10-01"
---

# Phase 7 — Security

> Per-phase security contract: threat register, accepted risks, and audit trail.

---

## Trust Boundaries

| Boundary | Description | Data Crossing |
|----------|-------------|---------------|
| URL query → tool page | Deep links (`?n=`, `?m=`, `?a=&b=`, `?mode=&n=`) are user-controllable and parsed by `NT.store` readers / tool code | Untrusted numbers/strings; low sensitivity |
| Cookie / localStorage → tool page | Shared settings (`group-params`, `ab-params`) and legacy keys are written by sibling tools but editable by anyone with the browser | Untrusted JSON; low sensitivity |
| `window.NT` → tool pages | One global namespace shared by every page that includes `assets/nt-*.js` | Shared code; integrity matters |
| Dev tooling → filesystem | `harness.js`, `shadow-check.js`, `browser-diff.js` read the repo and write scratch output | Repo files; scratch under `os.tmpdir()` |
| Browser automation → user's Chrome | UAT and 07-09 checks drove the user's real Chrome profile | Only this repo's pages |

---

## Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation | Status |
|-----------|----------|-----------|----------|-------------|------------|--------|
| T-07-01 | Tampering | NT namespaces | medium | mitigate | Each namespace `Object.freeze`d; each `NT.<name>` slot non-writable/non-configurable (edfc402, `checks/namespace.check.js`); shadow-check NS-MUTATION | closed |
| T-07-02 | Denial of Service | Script load order | medium | mitigate | Plain non-deferred includes before the inline script; shadow-check INCLUDE-DEFERRED/ORDER/MISSING pass on all 15 tools; no `defer`/`async`/`type="module"` on any `nt-*.js` include | closed |
| T-07-03 | Tampering | Canonical gcd/modInverse/isPrime semantics | medium | mitigate | Parity harness vs every BASE predecessor (`checks/core.check.js`, 2,712,692 assertions, green) | closed |
| T-07-04 | Tampering | Dev tooling writing into the repo | low | mitigate | browser-diff scratch sites/profiles under `os.tmpdir()`; working tree clean after runs | closed |
| T-07-05 | Tampering | `NT.svg.svgEl` attribute writes | low | accept | See accepted risks | closed |
| T-07-06 | Tampering | polar/annularSectorPath signature change | medium | mitigate | Explicit centre at every call site; shadow-check MISSING-IMPORT/RETIRED-NAME; browser-diff geometry snapshots identical | closed |
| T-07-07 | Denial of Service | isPrime on non-integer inputs | low | mitigate | `Number.isInteger` guard in `nt-core.js`; parity-tested | closed |
| T-07-08 | Tampering | `group-params` / `ab-params` keys and payload shapes | high | mitigate | Key literals asserted equal to BASE; write logs parity-checked in `checks/store.check.js`; browser-diff snapshots include localStorage | closed |
| T-07-09 | Tampering | Shared readers' validation of cookie/localStorage/URL input | high | mitigate | Hostile-input matrix vs every predecessor in `checks/store.check.js`; `readABParams(rejectZeroPair)` keeps the per-tool (0,0) difference; storage-event path validates `e.newValue` through the same validators (d0a4092, 8 assertions) | closed |
| T-07-10 | Spoofing | Math.random-based BigInt randomness | low | accept | See accepted risks | closed |
| T-07-11 | Tampering | BigInt input parsing on DH and S&M | medium | mitigate | Shared `parseBigIntStrict` parity-proven (`checks/bigint.check.js`); validation text identical in browser-diff | closed |
| T-07-12 | Denial of Service | Large exponent / prime generation cost | low | accept | See accepted risks | closed |
| T-07-13 | Tampering | Cayley ⇄ Equivalence Wheel shared setting | medium | mitigate | Both pages use the one `NT.store` implementation; live sync verified in Chrome both directions (07-UAT test 1) | closed |
| T-07-14 | Denial of Service | Synchronous first render at IIFE top level | medium | mitigate | Same include gates as T-07-02; browser-diff load snapshots error-free on every page | closed |
| T-07-15 | Denial of Service | buildFactorTree iteration cap / BALANCED_MAX_N | medium | mitigate | Cap and ceiling asserted equal to BASE (`checks/layout.check.js`); over-limit inputs in the Factor Tree config | closed |
| T-07-16 | Tampering | EA deep-link validation via `readABParams(true)` | medium | mitigate | `readABParams(true)` call site in Euclidean Algorithm; (0,0) rejection parity-tested | closed |
| T-07-17 | Denial of Service | Factorizing URL-supplied a/b in Venn | medium | mitigate | `primeFactors(x, FACTOR_LIMIT)` at every former call site (≥4); semiprime-above-cap parity case | closed |
| T-07-18 | Tampering | Legacy-key migration and shared a/b reads | medium | mitigate | `readMigrating` / `readSharedAB` parity-proven over throwing and malformed storage | closed |
| T-07-19 | Denial of Service | Docs misdescribing the include rule | medium | mitigate | Docs state the non-deferred rule; INCLUDE-* gates enforce it regardless | closed |
| T-07-20 | Repudiation | Generated mirror drifting from sources | medium | mitigate | `shadow-check.js --docs` MIRROR-DRIFT passes (re-run after the IN-01/IN-02 doc fixes) | closed |
| T-07-21 | Tampering | Review fixes introducing regressions | medium | mitigate | Every post-review fix (edfc402, 56dd593, d0a4092) re-ran harness, shadow-check --all/--docs and browser-diff on every affected page — all green / IDENTICAL | closed |
| T-07-22 | Information Disclosure | Browser automation over the user's real Chrome profile | low | mitigate | Only this repo's pages opened, in a dedicated tab group, no sign-ins/forms/external sites; tabs closed afterwards. Deviation: pages were served from `http://127.0.0.1` (localhost-only `python3 -m http.server`, stopped after use) because the extension refused file:// URLs; downloads and print were intercepted, nothing written to ~/Downloads | closed |
| T-07-SC | Tampering | npm/pip/cargo installs | low | accept | See accepted risks | closed |

*Status: open · closed · open — below high threshold (non-blocking)*
*Severity: critical > high > medium > low — only open threats at or above workflow.security_block_on count toward threats_open*
*Disposition: mitigate (implementation required) · accept (documented risk) · transfer (third-party)*

---

## Accepted Risks Log

| Risk ID | Threat Ref | Rationale | Accepted By | Date |
|---------|------------|-----------|-------------|------|
| AR-07-01 | T-07-05 | `svgEl` only calls `setAttribute` (no `innerHTML` in `nt-svg.js`); behavior unchanged from every predecessor and parity-proven | Plan 07-02 threat model | 2026-09-30 |
| AR-07-02 | T-07-10 | `Math.random` BigInt randomness is a pre-existing, documented pedagogical property (stated in `nt-bigint.js` header); moved verbatim, not a real crypto use | Plan 07-03 threat model | 2026-09-30 |
| AR-07-03 | T-07-12 | Algorithms moved verbatim; per-tool size guards untouched | Plan 07-04 threat model | 2026-09-30 |
| AR-07-04 | T-07-SC | No package-manager installs; dev tools use Node built-ins and the system Chrome only (no package.json / requirements / Cargo files) | Plans 07-01..07-09 threat models | 2026-09-30 |

---

## Security Audit Trail

| Audit Date | Threats Total | Closed | Open | Run By |
|------------|---------------|--------|------|--------|
| 2026-10-01 | 23 | 23 | 0 | /gsd-secure-phase 07 (orchestrator, ASVS L1 grep-depth; register authored at plan time — auditor not required per short-circuit rule) |

---

## Sign-Off

- [x] All threats have a disposition (mitigate / accept / transfer)
- [x] Accepted risks documented in Accepted Risks Log
- [x] `threats_open: 0` confirmed
- [x] `status: verified` set in frontmatter

**Approval:** verified 2026-10-01
