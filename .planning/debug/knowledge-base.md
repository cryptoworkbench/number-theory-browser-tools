# GSD Debug Knowledge Base

Resolved debug sessions. Used by `gsd-debugger` to surface known-pattern hypotheses at the start of new investigations.

---

## diffie-hellman-play-noop — Play button is a silent, exception-free no-op because every rebuild parks playback at end-of-run
- **Date:** 2026-09-26
- **Error patterns:** animation doesn't play, play button does nothing, no console errors, silent no-op, playBtn label never changes to Pause, stepBtn disabled on load, playback stuck at end of run, stepIndex >= steps.length, ported playback engine, instantFinish on rebuild, works only after manual Reset
- **Root cause(s):** `rebuild()` ends every build with `instantFinish()` -> `revealAll()`, advancing `stepIndex` to `steps.length`, and EVERY entry point that can reach the Play button routes through `rebuild()` (window load, Build button, preset chips, Randomize, Generate safe prime, Enter key); AND `play()`'s inherited guard `if (playing || !currentExchange || stepIndex >= currentExchange.steps.length) return;` treated end-of-run as "nothing to play" and returned without rewinding. AND-gate: neither condition reproduces the bug alone — the Sieve tool has the identical guard but its rebuild resets, so it plays fine.
- **Fix:** Split the guard so `playing`/`!currentExchange` still return early, but a finished run rewinds via the existing `resetPlayback()` primitive and then plays: `if (playing || !currentExchange) return; if (stepIndex >= currentExchange.steps.length) resetPlayback();`. Also corrected `rebuild()`'s banner, which was instructing the user to perform the very "Press Reset then Play" workaround the fix removes. Deliberately did NOT remove the auto-reveal-on-build — the finished-worked-example landing state is intended and user-confirmed.
- **Files changed:** Diffie-Hellman Key Exchange/diffie-hellman-key-exchange.html
- **Why not caught:** No gate existed for this class. This repo has no build/lint/typecheck/test command (per CLAUDE.md, verification is manual in-browser), and the quick task that added the tool stopped its acceptance at "everything renders correctly" — the page auto-reveals a complete, correct worked example on load, so a fully-broken Play button is invisible to a render-only review. Nobody clicked Play from the state the page actually lands in. An ordinary unit test would likely have missed it too: the natural test ("Reset then Play animates") PASSES against the buggy code, because the defect lives only on the untested landing-state entry path.
- **Recurrence guard:** (1) Acceptance rule — for any tool with playback controls, the first Play click of the acceptance pass must be the very first interaction after page load, with no Reset before it; exercise every control from the actual landing state, never from a hand-reset state. (2) Porting rule, recorded below as a reusable cross-tool hazard so the class is catchable at porting time rather than only at review time.

### Reusable learning: porting the Sieve-style playback engine into a new tool

**Hazard.** When porting the Sieve-style playback engine — `play()` / `pause()` / `step()` / `instantFinish()` / `resetPlayback()` plus the `generation` counter that invalidates stale animation callbacks — the inherited `play()` guard

```js
if (playing || !events.length || stepIndex >= events.length) return;   // Sieve Of Eratosthenes/sieve-of-eratosthenes.html:669
```

is only safe **because of a property of the Sieve's rebuild, not a property of the guard.** The Sieve's `generate()` (line 737) terminates in `resetPlaybackState()` (line 746), which leaves `stepIndex = 0` — so by the time the user can click Play there is always work to do, and the end-of-run clause never fires on a reachable state.

**The trap.** Any port whose rebuild instead terminates in `instantFinish()` — the usual choice when the new tool should land on a *finished worked example* rather than an empty stage — inverts that precondition: `stepIndex` is parked at `steps.length` on every reachable entry point. The inherited guard then makes Play a **silent, exception-free no-op from every entry point**. There is no thrown error, no console warning, and no visual difference from a healthy page (the finished example is already on screen), so the defect survives both console inspection and render-only review.

**Rule.** If a ported rebuild ends in `instantFinish()` (or anything else that advances `stepIndex` to the end) rather than a reset, `play()` MUST gain a rewind-on-completion path. Prefer delegating to the existing reset primitive over duplicating its teardown — it already bumps `generation`, cancels the in-flight tween frame, zeroes `stepIndex`, and clears the derived DOM; `play()` then sets its own button state afterward, so a transient button-state change inside the reset is immediately corrected. A forward reference to the reset function is safe when both are hoisted function declarations in the same IIFE.

**Generalized smell (applies beyond this engine).** Whenever a port changes which function a rebuild path *terminates in*, re-check every guard that reads the state that terminal call mutates. A guard copied verbatim carries its original caller's assumptions with it, invisibly. Symptom signature to grep for: an enabled-but-inert control, no exception, and correct-looking output — with the tell-tale asymmetry that a sibling control (here `stepBtn`) *is* correctly disabled in the same state, proving the code knows it is at end-of-run while the broken control does not surface it.

---
