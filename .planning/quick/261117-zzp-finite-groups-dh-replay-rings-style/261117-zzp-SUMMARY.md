---
quick_id: 261117-zzp
status: complete
commit: 5a5cfd5
---

# 261117-zzp Summary

The Diffie–Hellman exchange's Play button starts the exchange over when pressed at its last step (toggleDhPlay); syncDhCtl now labels it Replay there (cyclicGroups.dhReplay, English only, listed in the i18n header), Pause while playing, Play otherwise. The time cylinder's Rings dropdown is now drawn as the Generator dropdown (.field select): sans font, faint text-tinted background, panel border, the 6px control radius, padding 4px 8px scaled to the bar's smaller text (.26em .52em); options stay themed.

Checked in headless Chrome (night theme): Play → Replay after Instant → Pause when pressed; the select's radius 6px, background color-mix(text 6%), padding ≈ 3px 6px.
