---
phase: 06
review: 06-REVIEW.md
titles: json
findings:
  - id: WR-01
    severity: warning
    disposition: open
    title: "`applyStaticDom`'s rich-template cache can resurrect or silently drop DOM children if a future `data-i18n` element's children are ever mutated outside the i18n pipeline"
  - id: WR-02
    severity: warning
    disposition: open
    title: "`decorateLinks`'s own-param strip regex is not global, so it only removes the *first* `lang=` occurrence in a href"
  - id: WR-03
    severity: warning
    disposition: open
    title: "`renderMessages()`'s never-rebuild comment is correct but undocumented as a documented invariant other devs could accidentally violate"
  - id: IN-01
    severity: info
    disposition: open
    title: "Language-preference cookie omits the `Secure` attribute"
  - id: IN-02
    severity: info
    disposition: open
    title: "`diff_base` supplied for this review spans more than this phase's actual work"
  - id: IN-03
    severity: info
    disposition: open
    title: "`bindText`'s stored `data-i18n-params` round-trips every param through `String()`, losing numeric type information that is reconstructed ad hoc by each caller"
open: 6
total: 6
recorded: 2026-10-01T20:51:58.698Z
---

# Phase 06: Code Review Disposition

| Finding | Severity | Disposition | Source |
|---------|----------|-------------|--------|
| WR-01 | warning | open | - |
| WR-02 | warning | open | - |
| WR-03 | warning | open | - |
| IN-01 | info | open | - |
| IN-02 | info | open | - |
| IN-03 | info | open | - |

Dispositions: `open` (recorded, not yet triaged), `fixed`, `skipped`, `deferred`.
Set `deferred` by hand and put the reason in the Source cell; both are preserved. A `|` in the reason is kept as prose and escaped on the next run.
Re-running the gate keeps every row it can. A row the current review no longer reports is kept and its Source cell flagged, so a finding does not leave this record silently. ONE exception: when a finding id is REUSED by a different finding, the earlier decision cannot keep a row — the id is taken — and it is dropped. A RECORDED decision (anything but `open`) is named on the console when that happens; a row still at `open` is replaced silently, because `open` records no decision to lose.
