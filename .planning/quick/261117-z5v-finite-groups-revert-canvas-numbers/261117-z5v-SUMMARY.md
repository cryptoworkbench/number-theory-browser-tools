---
quick_id: 261117-z5v
status: complete
---

# 261117-z5v Summary

Step 1 of the user's request: check whether older versions are smoother with Keep the result on top. They were: the canvas numbers (7da315d) and the fold (9f2102a) made it worse. Both reverted in the page only (reverse patches applied to finite-groups.html; the page now equals 75b23bd plus 16c3ed2's shim upkeep / idle address bar / shim fix, checked line for line).

User's Chrome, result on top, 15 s windows from k = 15 (frames / > 25 ms / > 50 ms), alternated:
- 9f2102a: 837/37/8, 822/47/8
- 75b23bd: 874/26/0, 886/14/0, 889/10/0
- 6b46109: 876/21/1, 869/28/2
- reverted: 894/6/0, 889/11/0
No page errors. Trade-off: the first step's zoom-out frame goes back to the svg-numbers cost (~500–800 ms in the identity-on-top test).
