---
phase: "6"
slug: "multi-language-support"
status: verified
# threats_open = count of OPEN threats at or above workflow.security_block_on severity (the blocking gate)
threats_open: 0
asvs_level: 1
created: "2026-10-01"
---

# Phase 6 — Security

> Per-phase security contract: threat register, accepted risks, and audit trail.

---

## Trust Boundaries

| Boundary | Description | Data Crossing |
|----------|-------------|---------------|
| location.search → nt-i18n.js | `?lang=` arrives with any link | attacker-controllable text, non-sensitive |
| document.cookie / localStorage → nt-i18n.js | stored values may be stale, hand-edited or written by another page | two-letter language code, non-sensitive |
| dictionary values + params → DOM | strings rendered on every page; params may carry user or URL input | display text |
| nt-i18n.js → same-site `<a href>` | link rewriting over links the module does not own | URL query strings |
| deep links / shared storage (`group-params`, `ab-params`) / typed input → messages, captions, narratives | URL, stored and typed values reach rendered text | numbers and free text (RSA messages), non-sensitive |
| displayed text → program logic | ECDH point selection previously read an English aria-label | UI labels |
| dev scripts → page code | i18n-check.js / i18n-browser.js execute repo page code in headless Chrome | dev-only, never shipped |
| docs → future implementers | CLAUDE.md / CONVENTIONS define rules for later phases | documentation |

---

## Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation | Status |
|-----------|----------|-----------|----------|-------------|------------|--------|
| T-06-01 | Tampering | fromUrl / setLang / storage listener | high | mitigate | `valid()` allow-list gate on every incoming code (`assets/nt-i18n.js:68`, used at 76/84/89/113/395/412); `--api`/`--persistence` PASS | closed |
| T-06-02 | Tampering | translate / translateInto / bindText / applyStaticDom | high | mitigate | No `innerHTML` assignment in `assets/nt-i18n.js` (only 2 comment mentions, lines 37/228); `--api` fake DOM throws on innerHTML | closed |
| T-06-03 | Tampering | decorateLinks | medium | mitigate | Own regex stripping only `lang=` (`assets/nt-i18n.js:346-360`); `--api` PASS | closed |
| T-06-04 | Tampering | dictionary lookup | medium | mitigate | `Object.prototype.hasOwnProperty.call` lookups (`assets/nt-i18n.js:149-170`) | closed |
| T-06-05 | Tampering | placeholder substitution | low | mitigate | Single-pass `template.replace` callback (`assets/nt-i18n.js:213`) | closed |
| T-06-06 | Denial of Service | module evaluation and storage access | low | mitigate | 13 `try` guards plus `typeof document` guards; `--smoke` bare-context evaluation PASS | closed |
| T-06-07 | Information Disclosure | site-lang cookie/localStorage | low | accept | Two-letter code only; see Accepted Risks | closed |
| T-06-08 | Tampering | assets/i18n/*.js values | high | mitigate | `--coverage` DICT-MARKUP check (`i18n-check.js:1609/1619`); `--all` PASS on 16 pages | closed |
| T-06-09 | Tampering | page innerHTML builders | high | mitigate | `--literals` INNERHTML-PROSE gate (`i18n-check.js:1868`); `--all` PASS on 16 pages | closed |
| T-06-10 | Elevation of Privilege | dev check scripts executing page code | low | accept | Dev-only; see Accepted Risks | closed |
| T-06-11 | Repudiation | gate exemptions | low | mitigate | Every exemption in `i18n-config/*.json` is a key → reason-string map (13 files) | closed |
| T-06-12 | Tampering | Factor Tree / Totient messages echoing input | medium | mitigate | Params as text nodes; INNERHTML-PROSE gate PASS | closed |
| T-06-13 | Tampering | hub card links | low | mitigate | Relative same-site hrefs; decorateLinks appends only allow-listed code (T-06-01/03) | closed |
| T-06-14 | Tampering | Cayley/Wheel captions from N, mode, selection | medium | mitigate | NT.store readers + clamping; DOM construction; INNERHTML-PROSE gate PASS | closed |
| T-06-15 | Tampering | shared `group-params` contract | medium | mitigate | en-parity snapshot includes localStorage + cookie (`i18n-browser.js:241`); 16/16 PASS | closed |
| T-06-16 | Tampering | Fermat's innerHTML builders | high | mitigate | DOM construction with translateInto Node params; INNERHTML-PROSE gate PASS | closed |
| T-06-17 | Tampering | Group Isomorphism `?m=` → captions | low | mitigate | `isValidM` validation (`group-isomorphism.html:497/511`) | closed |
| T-06-18 | Tampering | Euclidean Algorithm innerHTML builders | high | mitigate | DOM construction; INNERHTML-PROSE gate PASS | closed |
| T-06-19 | Tampering | `ab-params` contract and deep-link readers | medium | mitigate | en-parity storage snapshot (`i18n-browser.js:241`) | closed |
| T-06-20 | Tampering | Shor's guard/banner messages | high | mitigate | Params as text nodes; INNERHTML-PROSE gate PASS | closed |
| T-06-21 | Tampering | Square and Multiply innerHTML builders | high | mitigate | DOM construction; en-parity PASS; INNERHTML-PROSE gate PASS | closed |
| T-06-22 | Tampering | Venn messages/aria-labels echoing URL/storage numbers | medium | mitigate | Validated readers; text nodes / setAttribute only; INNERHTML-PROSE gate PASS | closed |
| T-06-23 | Tampering | `ab-params` contract (Venn) | medium | mitigate | en-parity storage snapshot | closed |
| T-06-24 | Tampering | DH renderStep / notebook / Eve builders | high | mitigate | DOM construction; INNERHTML-PROSE gate PASS | closed |
| T-06-25 | Tampering | DH readInputs messages | medium | mitigate | `parseBigIntStrict` before use (`diffie-hellman-key-exchange.html:506/511`) | closed |
| T-06-26 | Tampering | ECDH renderStep / notebook / brute-force builders | high | mitigate | DOM construction; INNERHTML-PROSE gate PASS | closed |
| T-06-27 | Denial of Service | ECDH point selection via translated aria-labels | medium | mitigate | No aria-label parsing remains in `elliptic-curve-diffie-hellman.html`; switch mode PASS | closed |
| T-06-28 | Tampering | RSA innerHTML builders interpolating user input | high | mitigate | DOM construction; INNERHTML-PROSE gate PASS | closed |
| T-06-29 | Tampering | RSA user state across language switch | medium | mitigate | `i18n-browser.js` switch mode (switched == direct load); UAT test 5 passed | closed |
| T-06-30 | Tampering | future pages adding innerHTML prose / unvalidated `?lang=` | medium | mitigate | Rules in CLAUDE.md and `.planning/codebase/CONVENTIONS.md`; gates remain runnable | closed |
| T-06-31 | Repudiation | accumulated gate exemptions | low | mitigate | Reviewed in 06-12 Task 3; reasons stored per exemption | closed |
| T-06-SC | Tampering | npm/pip/cargo installs | low | accept | Zero-dependency project; see Accepted Risks | closed |

*Status: open · closed · open — below high threshold (non-blocking)*
*Severity: critical > high > medium > low — only open threats at or above workflow.security_block_on count toward threats_open*
*Disposition: mitigate (implementation required) · accept (documented risk) · transfer (third-party)*

---

## Accepted Risks Log

| Risk ID | Threat Ref | Rationale | Accepted By | Date |
|---------|------------|-----------|-------------|------|
| AR-06-01 | T-06-07 | `site-lang` stores only a two-letter language code; not sensitive; same exposure as existing `site-theme` | 06-01 plan threat model | 2026-10-01 |
| AR-06-02 | T-06-10 | `i18n-check.js` / `i18n-browser.js` are dev-only, never shipped; run repo code in a throwaway headless profile and mkdtemp scratch dir | 06-02 plan threat model | 2026-10-01 |
| AR-06-03 | T-06-SC | No package installs in this phase; zero-dependency project | 06-01..06-12 plan threat models | 2026-10-01 |

*Accepted risks do not resurface in future audit runs.*

---

## Security Audit Trail

| Audit Date | Threats Total | Closed | Open | Run By |
|------------|---------------|--------|------|--------|
| 2026-10-01 | 32 | 32 | 0 | /gsd-secure-phase (L1 grep-depth, orchestrator) |

## Security Audit 2026-10-01
| Metric | Count |
|--------|-------|
| Threats found | 32 |
| Closed | 32 |
| Open | 0 |

Evidence run: `i18n-check.js --all` (16 pages, 0 FAIL), `--api` (122), `--persistence` (71), `--smoke` (123), `shadow-check.js --all` (0 FAIL); `i18n-browser.js` 16/16 ALL PASS recorded in 06-12 SUMMARY.

---

## Sign-Off

- [x] All threats have a disposition (mitigate / accept / transfer)
- [x] Accepted risks documented in Accepted Risks Log
- [x] `threats_open: 0` confirmed
- [x] `status: verified` set in frontmatter

**Approval:** verified 2026-10-01
