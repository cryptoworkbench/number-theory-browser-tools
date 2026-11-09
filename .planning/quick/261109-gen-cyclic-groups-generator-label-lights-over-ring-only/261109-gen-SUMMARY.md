---
quick_id: 261109-gen
status: complete
commit: 97199e5
---

# 261109-gen summary

Removed '#arrange-field:hover #arrange-gen-label{ color:var(--text) }'. The label's colour is
var(--text-dim), which the top band sets to the text colour on the hot row over the zoomed ring.
Verified in Chrome via the band classes: lit on its row hot, grey otherwise. Left alone: the
matching hover rule for the disabled generator picker (#arrange-gen-wrap .ec-pick-btn:disabled).
