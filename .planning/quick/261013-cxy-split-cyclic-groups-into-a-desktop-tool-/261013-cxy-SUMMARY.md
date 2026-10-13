---
quick_id: 261013-cxy
phase: quick
plan: 261013-cxy
subsystem: cyclic-groups
tags: [cyclic-groups, desktop, i18n, nav, hub]
status: complete
requires: []
provides:
  - "Cyclic Groups/cyclic-groups.html as the always-on windowed desktop"
  - "_Cyclic Groups/_cyclic-groups.html as the page-layout tool"
  - "site.nav.cyclicGroupsClassic, hub.card.cyclicGroupsClassic.* in 31 languages"
affects: [every page's nav, index.html, i18n-check.js PAGES]
tech-stack:
  added: []
  patterns: ["is-desktop class set in <head> before first paint", ":is(.diagram-frame:fullscreen, :root.is-desktop .diagram-frame)"]
key-files:
  created:
    - "_Cyclic Groups/_cyclic-groups.html"
  modified:
    - "Cyclic Groups/cyclic-groups.html"
    - "assets/i18n/site.js"
    - "assets/i18n/hub.js"
    - "index.html"
    - "all 17 other tool pages (nav link)"
    - ".planning/phases/06-multi-language-support/i18n-check.js"
    - "CLAUDE.md"
decisions:
  - "The Ring window is never closed on the desktop: with the taskbar hidden (quick task 1266f2a), minimizing would leave no way back, so its close button shows only in true full screen, where it leaves full screen"
  - "_Cyclic Groups keeps the ringwin/isopane iframe modes and the .fs-win-body/.fs-menu CSS: the page's isomorphism pane is a ringwin+isopane iframe that builds a Ring-window body"
  - "site.nav.cyclicGroupsClassic was added in Task 1 (not Task 3) so the new page's title/h1 never showed a raw key"
  - "i18n-check: _Cyclic Groups row shares the cyclic-groups i18n-config via a new optional PAGES `config` field instead of a duplicated config file"
metrics:
  completed: 2026-10-13
  tasks: 3
actuals:
  tokens: 121000
  tasks: 3
  commits: 3
plan_head_before: 3399356ff893b079c5075307f2cc491d4b3bb5b5
plan_head_after: 9b40e4bc24422db06f004ab81abe32d58e39ad42
---

# Quick 261013-cxy: Split Cyclic Groups into a desktop tool and a page tool Summary

Cyclic Groups is now the always-on windowed desktop. It fills the browser window under the site header, and its corner button toggles true full screen. _Cyclic Groups is a separate copy with today's scrolling page layout. That copy has no full-screen button, taskbar or desktop windows. Both pages share the `cyclicGroups` dictionary, the `cyclic-groups` storage key and the shared group.

## Commits

| Task | Commit | Message |
| ---- | ------ | ------- |
| 1 | 450dbf0 | feat(cyclic-groups): move the page layout into its own _Cyclic Groups tool |
| 2 | f0cb084 | feat(cyclic-groups): the Cyclic Groups tool is the windowed desktop, filling the page |
| 3 | 9b40e4b | feat(site): add _Cyclic Groups to the nav and hub in all thirty-one languages |

## What changed

### Task 1: `_Cyclic Groups/_cyclic-groups.html`
Removed outright:
- the `#fullscreen-btn` markup and its `.frame-tools` wrapper;
- the "full screen" JS section (`fullscreenEl`, `syncFullscreenBtn`, the `fullscreenchange` listeners) and the `syncFullscreenBtn()` call in `onLangChange`;
- the `#fs-taskbar` (launcher, menu, tasks, `#fs-exit`) and `#fs-snap` markup;
- the desktop state (`fsState`, `readFsState`/`writeFsState`, the extras, `FS_STATE_KEY`), the task buttons and launcher menu, and the opacity slider;
- the window commands (raise, minimize, close, tile, cascade, show desktop, fit, `ringNeeds`) and window building/placing (`buildWindow`, `mountWindow`, `geomPx`, `layoutWindows`, `syncWindows`);
- moving and resizing (drag, snap, edge catch, double-click maximize), and the desktop-side frame message handler, the frames-inert pointer handling and `fsTitle`/`syncFsLabels`;
- the ringwin `measure` reply, which only the desktop asked for;
- the CSS for windows, resize handles, opacity, snap preview, taskbar, extra-Ring-window frames, the corner button and `.diagram-frame:fullscreen`. Combined selectors keep their `:root.is-ringwin` half.

Stubbed (tangled with shared rendering):
- `headOn` and `syncHeadSwitches` lost their `fsWins` branch;
- `drawMath` tests `!IS_RINGWIN` only;
- `syncWindows` became `syncPanes()` (`syncSplit(); syncIsoPane();`);
- `syncIsoTitle` keeps only the ringwin report;
- the pane's `raise` message only closes the ring menu;
- `FS_PANELS` keeps just the ring entry's `ids`/`rows` for `enterRingWin`;
- `cleanRingQuery`, `RING_DROP`, `ringWinGroup`, `svgIcon` and `partHolder` stay.

Kept on purpose, contrary to the plan's premise:
- the `ringwin`/`isopane` iframe modes;
- `:root.is-ringwin` CSS, `.fs-win-body.is-ring`, `.fs-win-btn`, `.fs-menu*` and `.fs-icon`.

The page's isomorphism pane is a `ringwin=1&isopane=1` iframe that builds a Ring-window body. The scratchpad close button and the ring's right-click menu use those classes too. Removing them would break the iso pane.

Other changes in the copy:
- `<title>` and `<h1>` use `site.nav.cyclicGroupsClassic`, and so does the tab title;
- the nav links back to Cyclic Groups and marks its own entry `is-active`.

### Task 2: `Cyclic Groups/cyclic-groups.html`
- A `<head>` script adds `is-desktop` before first paint unless `?preview=1` or `?ringwin=1`. JS sets `IS_DESKTOP = !IS_PREVIEW && !IS_RINGWIN` and toggles the class to match.
- `desktopOn()` now drives `syncWindows`, and the windows go up before the first render (`else if (IS_DESKTOP) syncWindows();`).
- All 17 `.diagram-frame:fullscreen` selectors became `:is(.diagram-frame:fullscreen, :root.is-desktop .diagram-frame)`.
- The frame is `position:fixed` from `--desk-top` to the bottom of the viewport. `--desk-top` is the measured bottom of `.site-header`, kept up to date by a ResizeObserver and `resize`. The page header, the side panels and the other stage content are hidden, and the body does not scroll.
- The corner full-screen button stays visible above the windows (z-index 50), on the desktop and in true full screen. A window whose title bar runs under it gets `.is-cornered`, which pads its title bar.
- The Ring window's close button shows only in true full screen, where it leaves full screen.
- Removed the page-only resize grip (markup, CSS, JS, `.layout.is-stacked`) and the page's iso-pane placement and `min-height` rules.
- RTL rule blocks are unchanged.

### Task 3: site wiring
- `nav.cyclicGroupsClassic` = "_" + `nav.cyclicGroups` in all 31 `site.js` blocks (added in Task 1).
- A nav link on all 18 other pages; `index.html` uses a root-relative href.
- A hub card in `index.html`. `hub.js` has `card.cyclicGroupsClassic.title` ("_" + each `card.cyclicGroups.title`) and `.desc` in 31 languages. The `zgh-Tfng` value is transliterated letter by letter from `zgh-Latn`.
- `i18n-check.js` changes:
  - a PAGES row for the new page, with an optional `config: "cyclic-groups"` field read by `readConfig`;
  - nav counts changed from 18 to 19;
  - the SWITCHER count only counts `<a>` nav links, because the new page titles itself with a `site.nav` key.
- `CLAUDE.md` lists both tools.

## Checker results

| Mode | Baseline (before) | After |
| ---- | ----------------- | ----- |
| coverage | PASS (18 pages) | PASS (19 pages) |
| header | PASS 18 | PASS 19 |
| switcher-present | PASS 18 | PASS 19 |
| includes | PASS 18 | PASS 19 |
| no-locale-number-format | PASS 18 | PASS 19 |
| literals-markup | FAIL 4 (all Cyclic Groups) | FAIL 8 |
| literals-js | FAIL 11 (all Cyclic Groups) | FAIL 22 |
| `--all --report` total | 15 | 30 |
| --api | PASS 1292 | PASS 1292 |
| --persistence | PASS 561 | PASS 561 |
| --smoke | not run at baseline | PASS 141 assertions, mutant detected, cross-session OK |

The 15 findings on `Cyclic Groups/cyclic-groups.html` are the same as at baseline. Only their line numbers moved.

The other 15 are on `_Cyclic Groups/_cyclic-groups.html`. They are the same set of strings as the original's 15 baseline findings, because the copy inherits the code they come from. No new kind of finding was introduced, and no dictionary finding (key set, plural, script, DIGIT-PARITY, ZGH, KU, SA, LA, ARABIC-LETTER, NFC and so on) appeared.

## Verification (headless Chrome over file://, CDP harness in the scratchpad)

**Desktop page:**
- the frame starts at the header's bottom edge (53px) and fills a 1400×900 viewport (847px tall), with no page scroll;
- the page header and side panels are hidden;
- Ring and Notice windows come up on load;
- dragging the Ring window by its title bar moves it, and maximize and restore work (a maximized window gets `.is-cornered`);
- the dup (+) button opens an extra Ring window, whose `ringwin=1` iframe loads and draws;
- an iso chip opens the iso pane inside the Ring window;
- the corner button enters true full screen, with the exit icon and the close button shown. Ring close leaves full screen, and its close button hides again;
- `setLang('ar')` gives `dir=rtl` and keeps the windows and the iso pane;
- 0 console errors or exceptions.

**_Cyclic Groups:**
- no full-screen button or taskbar;
- the iso chip opens the pane (a `ringwin+isopane` iframe that loads and draws);
- the right-click menu opens with 10 items;
- the ar switch works;
- 0 console errors;
- a screenshot diff against the original page, with the same steps, differs only in the h1 and the removed corner button;
- n=15 set here shows on the desktop page, and n=12 set there shows here.

**Hub and nav:**
- the hub card and nav link render in en, ar, zgh-Tfng and ja;
- the Cayley Table nav link reaches `_cyclic-groups.html` with `is-active` on its own entry.

## Deviations from Plan

1. **[Rule 1 - Bug avoided] ringwin/isopane modes and `.fs-win-body`/`.fs-menu` CSS kept in _Cyclic Groups.** The plan said these existed only for desktop Ring windows. In fact the page's own isomorphism pane is a `ringwin+isopane` iframe that uses them.
2. **[Rule 1 - Bug avoided] The Ring window's close button is hidden on the desktop instead of minimizing.** The plan assumed the taskbar could bring a minimized Ring window back. The taskbar has been `display:none` since commit 1266f2a ("full screen drops its taskbar"), and windows have no minimize or restore control, so minimizing would strand the ring. For the same reason the taskbar stays hidden, and `#fs-exit` is still never visible.
3. **[Rule 3] `site.nav.cyclicGroupsClassic` landed in Task 1's commit.** That way the new page never showed a raw key between commits.
4. **[Rule 3] i18n-check.js needed more than a PAGES row:**
   - the hard-coded nav count changed from 18 to 19 in both places;
   - the SWITCHER count was limited to `<a>` links;
   - a `config` alias stops literal findings from appearing just because `_cyclic-groups.json` does not exist.
5. **[Rule 1] The desktop's windows are built before the first render**, the way ringwin frames call `enterRingWin()`. Otherwise the first render would draw the ring head in page style.

## Known Stubs

None that block the goal. `_Cyclic Groups` keeps some comments that mention "Ring window" for the iso pane's own ring, which is still accurate.

## Unverified / open risks

- **Physical interaction:** only checked through synthetic CDP input in headless Chrome:
  - snapping to edges and corners;
  - window resize by edges;
  - real Escape out of full screen;
  - the isomorphism split pane, Numerical/split view inside a window;
  - the export PNG and download menu on _Cyclic Groups.

  The code behind most of these is unchanged.
- **Hub footer count:** `index.html`'s footer still says "All seventeen tools" in 31 languages, while the hub now has 18 cards. This was not in the plan, so it is left for the user to decide.
- **Narrow viewports (about 600px):** the desktop Ring window opens at 60% width, and the ring is squeezed very small. This is the same layout full screen had on a small screen.
- **Hub card descriptions in less-resourced languages:** `zgh-Latn`/`zgh-Tfng`, `sa`, `la`, `ku`, `ckb` and `sw` reuse vocabulary from existing entries, but they would benefit from a native-speaker check. The checker raised no findings for them.
- **Duplicated literal findings:** the 15 baseline UNTRANSLATED literal findings now appear twice, once per Cyclic page.

## Self-Check: PASSED

- FOUND: _Cyclic Groups/_cyclic-groups.html
- FOUND: 450dbf0, f0cb084, 9b40e4b (ancestors of HEAD)
