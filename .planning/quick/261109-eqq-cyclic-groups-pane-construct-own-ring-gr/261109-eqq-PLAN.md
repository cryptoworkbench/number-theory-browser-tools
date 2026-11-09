---
quick_id: 261109-eqq
mode: quick
---

# Quick task 261109-eqq: + pane picker lists

Cyclic Groups: when + opens a new pane, the picker under "Construct own ring / group"
always shows two lists, "Open a group-to-group isomorphism" and "Open a
subgroup-to-group isomorphism", with title tooltips "Open in isomorphism view a group
isomorphic to the current group." / "...current subgroup."; the subgroup list
auto-updates when a new G is selected.

## Task 1
- files: Cyclic Groups/cyclic-groups.html, assets/i18n/cyclic-groups.js
- action: drop the merged isoPickBoth branch of openIsoPick; build both lists via
  isoPickIsoSections() (headings + title tooltips); refreshIsoPick() from renderIso
  replaces them in place while the right-hand picker is open; add the four keys
  English-first and list them in the file header.
- verify: open the picker, check headings/titles, change G, check the subgroup list.
