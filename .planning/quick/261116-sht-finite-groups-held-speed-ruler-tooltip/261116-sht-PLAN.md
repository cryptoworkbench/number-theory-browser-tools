---
id: 261116-sht
type: quick
---
# Finite Groups: tooltip on the blurred auto-rotation speed ruler

While Keep the result on top is pressed, the speed ruler (slider and its two one-step arrows) is blurred and locked. Hovering it now shows a tooltip: "Turn off Keep the result on top to use this again".

- setTopResult: set/remove a data-i18n-title title on #spin-ruler (the held children have pointer-events:none, so the hover lands on the ruler).
- New key cyclicGroups.spinHeldTip, English only (other languages fall back to English).
