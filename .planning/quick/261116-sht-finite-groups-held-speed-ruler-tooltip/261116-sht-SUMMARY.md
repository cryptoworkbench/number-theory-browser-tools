---
id: 261116-sht
status: complete
---
# Summary

#spin-ruler carries the tip only while Keep the result on top is pressed. Verified in headless Chrome by hovering the slider and both arrows: held, all three show the tip; released, they show their own tips again (Double-click to reset, Rotate one element …). No page errors.

## Follow-up: the button's icon in the tip

The tip now shows a small copy of the Keep the result on top button (its icon, in its pressed colours) where it names it: "Turn off [icon] Keep the result on top to use this again". Built with translateInto on a new {icon} template (cyclicGroups.spinHeldTipIcon) and setTitleMath, so screen readers still get the plain cyclicGroups.spinHeldTip text. Checked by hover and screenshot in dark and light themes.
