---
quick_id: 261118-a2r
status: complete
commit: 75c82f6
---

# 261118-a2r Summary

The time cylinder's picture gets a Raw results toggle (#dhc-raw, styled as the Values toggle, label dhCylRawBtn English only, title the menu item's dhCylWheelRaw) in its corner row before Values and the zoom pill, shown while the congruence wheel floor is on (raw results need it). It and the menu's Show raw results before reduction both call toggleDhcRaw (the eased switch of 261117-zuf, stored under cyclic-groups-dhc-wheel-raw); drawDhCyl keeps the toggle's pressed state in step.

Checked in headless Chrome: visible with the floor, click → pressed, 6 raw labels; menu item then checked; menu off → toggle unpressed, labels gone; floor off → toggle hidden.
