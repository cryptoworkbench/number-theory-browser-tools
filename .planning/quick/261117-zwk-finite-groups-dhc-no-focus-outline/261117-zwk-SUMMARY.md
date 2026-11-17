---
quick_id: 261117-zwk
status: complete
commit: 19e8f2e
---

# 261117-zwk Summary

The blue frame round the time cylinder's picture was its focus outline (.dhc-svg:focus-visible, 2px accent): the picture is focusable (tabindex 0) for its keys, so a click or a key on it drew the frame. The rule is now .dhc-svg:is(:focus, :focus-visible){ outline:none; }: the keys still work, the frame never shows. No other rule (page or assets/site.css) outlines the svg.
