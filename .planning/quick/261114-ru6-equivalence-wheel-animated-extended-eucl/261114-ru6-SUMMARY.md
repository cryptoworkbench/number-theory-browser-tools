---
status: complete
quick_id: 261114-ru6
date: 2026-11-15
commits: [6823fb5, 3ffd131]
---

# 261114-ru6: Extended Euclid animation on the Equivalence Wheel

- Task 1 (6823fb5): control group (a input, Run, Play/Pause, Step, Instant, speed, Exit), generation-guarded beat engine over `<g id="euclid-overlay">`, dimmed wheel, step table, narration, inverse / no-inverse finales; cancels on N/depth/mode/randomize/Escape; export excludes the overlay.
- Task 2 (3ffd131): division hop arcs on a rim track with remainder arc, ring-climbing coefficient spirals (collapsed when large), reduction slide with − k·N label, animated finales, reduced-motion support.
- Task 3 (translations) dropped at the user's request: English only. The new `wheel.euclid*` keys exist in English only and fall back to English in other languages.
- Verification: `euclid-check.mjs --shots` and `--shots --day` all PASS; screenshots in /tmp/euclid-shots-*-{night,day}.png and /tmp/euclid-animshots-*.png reviewed (N=26 a=7, N=60 a=7, N=12 a=8, depth 2, a=1).
