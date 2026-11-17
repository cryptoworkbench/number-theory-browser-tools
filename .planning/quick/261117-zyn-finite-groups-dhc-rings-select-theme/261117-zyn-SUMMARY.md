---
quick_id: 261117-zyn
status: complete
commit: 94fa24d
---

# 261117-zyn Summary

The time cylinder's Rings dropdown (#dhc-rings-mode: Manually / As far as the steps so far reach / …) had only font:inherit, so it kept the browser's light default in the night theme. .dhc-gap > select now takes the theme's colours (text, bg-1 background, panel border, the control radius) and its options likewise, as the header's language switcher does. The number field beside it (#dhc-rings) is unchanged.

Checked in headless Chrome in the night theme: the select's background rgb(17, 19, 24), text rgb(230, 232, 236).
