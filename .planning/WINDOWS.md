---
schema_version: 1
open_count: 2
waived_count: 0
fixed_count: 1
total_count: 3
last_updated: 2026-09-28T18:14:16.808Z
---

# Broken Windows Ledger

> Cross-phase defect register. With `workflow.windows_enforce` enabled, `/gsd-ship` blocks while `open_count > 0`.
> Waive with `gsd-tools windows waive <id> "<reason>"` (reason required).
> Mark fixed with `gsd-tools windows fixed <id>`.

| id | phase | kind | file | line | description | status | reason | recorded_at | resolved_at |
|----|-------|------|------|------|-------------|--------|--------|-------------|-------------|
| 1 | quick-260926-f4v | unrun-verify | Venn Diagrams/venn-diagrams.html |  | Live interactive testing (place/remove/clear a prime, mode switch, per-mode reload persistence) not exercised via a real browser session; no interactive driver available in sandbox. Script untouched by diff, no console errors on load. | open |  | 2026-09-26T09:17:38.370Z |  |
| 2 | 05 | deviation | Cayley Table Generator/cayley-table-generator.html |  | 05-03 Task 1: click-timing harness target was corrected from an off-screen cell to a viewport-visible one; the browser's native focus()-triggered scrollIntoView was inflating the measurement, not product code -- no product code changed | fixed |  | 2026-09-28T01:46:15.624Z | 2026-09-28T01:46:50.543Z |
| 3 | 260928-r1v | unrun-verify | Venn Diagram/venn-diagram.html |  | Task 3 human-check (browser localStorage carry-forward seed/reload/inspect) not run - no browser harness available in this execution environment | open |  | 2026-09-28T18:14:16.808Z |  |

````json
[
  {
    "id": 1,
    "kind": "unrun-verify",
    "phase": "quick-260926-f4v",
    "file": "Venn Diagrams/venn-diagrams.html",
    "line": null,
    "description": "Live interactive testing (place/remove/clear a prime, mode switch, per-mode reload persistence) not exercised via a real browser session; no interactive driver available in sandbox. Script untouched by diff, no console errors on load.",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-09-26T09:17:38.370Z",
    "resolved_at": null,
    "milestone": null
  },
  {
    "id": 2,
    "kind": "deviation",
    "phase": "05",
    "file": "Cayley Table Generator/cayley-table-generator.html",
    "line": null,
    "description": "05-03 Task 1: click-timing harness target was corrected from an off-screen cell to a viewport-visible one; the browser's native focus()-triggered scrollIntoView was inflating the measurement, not product code -- no product code changed",
    "status": "fixed",
    "reason": "",
    "recorded_at": "2026-09-28T01:46:15.624Z",
    "resolved_at": "2026-09-28T01:46:50.543Z",
    "milestone": null
  },
  {
    "id": 3,
    "kind": "unrun-verify",
    "phase": "260928-r1v",
    "file": "Venn Diagram/venn-diagram.html",
    "line": null,
    "description": "Task 3 human-check (browser localStorage carry-forward seed/reload/inspect) not run - no browser harness available in this execution environment",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-09-28T18:14:16.808Z",
    "resolved_at": null,
    "milestone": null
  }
]
````
