---
status: complete
---
# 261029-wlz Summary

Right-clicking a formula in the main view now offers, besides Hide, "Switch to GCD form" (LCM form shown) or "Switch to LCM form" (GCD form shown), switching only the formula line under the pointer. Verified headless (Playwright, ℤ/12ℤ, both formulas): menu label follows each line's form; switching updates the drawn formula and `sublcmring` (none → order → both → order); no page errors. Ring-window path mirrors Hide's host message and was not exercised.
