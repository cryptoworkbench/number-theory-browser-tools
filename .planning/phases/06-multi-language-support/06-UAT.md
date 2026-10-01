---
status: testing
phase: 06-multi-language-support
source: [06-VERIFICATION.md]
started: 2026-10-01T21:30:00Z
updated: 2026-10-01T21:30:00Z
---

## Current Test

number: 1
name: Switcher legibility beside the theme toggle at ~375px width, in both day and night themes
expected: |
  The select and its five language names are readable, not clipped or overlapping the theme toggle, in both themes
awaiting: user response

## Tests

### 1. Switcher legibility beside the theme toggle at ~375px width, in both day and night themes
expected: The select and its five language names are readable, not clipped or overlapping the theme toggle, in both themes
result: [pending]

### 2. Real two-tab live sync: open the same (or two different) pages in two real browser tabs, switch language in one
expected: The second tab's UI updates to the new language without a manual reload, via the `storage` event listener
result: [pending]

### 3. Firefox file:// cookie persistence across close/reopen
expected: A chosen language survives closing and reopening Firefox when pages are opened directly from disk (file://)
result: [pending]

### 4. Native-speaker review of 06-GLOSSARY.md terminology and the nl/de/fr/es translations it governs
expected: Mathematical terms, tone (je/du/vous/tú) and idiom read naturally and correctly to a fluent/native speaker of each language
result: [pending]

### 5. Equivalence Wheel SVG/PNG/Print export in de/fr; Venn Diagram drag/double-click/hover/armed-prime switch in de/es, including three-circle mode and open-preview language switches; RSA keygen/send/CRT-toggle/Eve-factoring then switch language
expected: Exports carry the active language; Venn's interactive drag/hover/double-click behaviors work correctly and keep their translated labels in de/es including three-circle mode; RSA's generated state (keys, sent messages, CRT toggles, Eve's results) survives a language switch and re-renders translated
result: [pending]

## Summary

total: 5
passed: 0
issues: 0
pending: 5
skipped: 0
blocked: 0

## Gaps
