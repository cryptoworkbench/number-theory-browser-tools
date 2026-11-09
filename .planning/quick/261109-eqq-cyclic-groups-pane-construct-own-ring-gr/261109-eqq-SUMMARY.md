---
quick_id: 261109-eqq
status: complete
commit: c1a169d
---

# Summary

- The + pane's picker always shows two lists under Construct own ring / group:
  "Open a group-to-group isomorphism" and "Open a subgroup-to-group isomorphism"
  (the merged "Groups isomorphic to the current group/subgroup" list is gone).
- Each list title has its tooltip (`title`), shown on hovering the title.
- renderIso calls refreshIsoPick(), so a new G redraws the lists in place
  (verified in Chrome: ℤ/13ℤ×, G 2 → 10 shows the order-6 groups; G 1 shows None;
  a refreshed chip opens ⟨ℤ/6ℤ,+⟩ linked to G 10).
- Fixed a pre-existing exception: barGroup(1) called isoPaneGroup() while the picker
  showed with no pane open (isoPane null), throwing on every render.
- New keys isoPickGroupIso, isoPickGroupIsoTitle, isoPickSubIso, isoPickSubIsoTitle are
  English-first, listed in the i18n file header for the next catch-up pass.
  isoPickBoth and isoPickSub are no longer used by the page (left in the dictionaries).
