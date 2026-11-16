---
id: 261116-pmn
status: complete
---
# Summary

The wheel's % n label is drawn without a counter-rotation, so with the option off it turns with the wheel's layer; a kept-wheel turn no longer writes its transform.

Verified in headless Chrome (n=12, three turns): option off, label at 90° on screen with no transform; option on, label at 0°. No page errors.
