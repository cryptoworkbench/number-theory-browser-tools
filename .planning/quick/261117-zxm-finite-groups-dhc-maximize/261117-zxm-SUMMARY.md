---
quick_id: 261117-zxm
status: complete
commit: 47bc1a3
---

# 261117-zxm Summary

The time cylinder's Fill button fills only the room under the Ring window's rows and above its bottom bar. A new head button beside it, Maximize (#dhc-max, a square icon; dhCylMax / dhCylUnmax, English only, listed in the i18n header), sets dhc.maxed and fills the whole ring half of the window (body top to bottom, left to workRight), placed directly past plotWindow's place (which keeps windows under the rows and over the bar); .dhc-plot.is-maxed lies at z-index 8, over the rows, the bottom bar and the corner buttons (≤ 7) and under the menus (70). The exchange's controls merge in as when filled. Pressed again it puts the window back at its earlier size and place; Fill while maximized steps down to filled; a grip drag or closing drops it; a browser resize re-fills it maximized.

Checked in headless Chrome over CDP: maximized the window equals the Ring window body's box, the points just inside its top and bottom edges hit it (not the rows or bar); Fill then gives the room under the rows; Maximize twice returns the window to its starting box.
