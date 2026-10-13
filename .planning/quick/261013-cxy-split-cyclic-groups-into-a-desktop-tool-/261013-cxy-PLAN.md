---
quick_id: 261013-cxy
mode: quick
date: 2026-10-13
---

# Split Cyclic Groups into "Cyclic Groups" (desktop) and "_Cyclic Groups" (page)

## Context
`Cyclic Groups/cyclic-groups.html` (7,800 lines) does two jobs. It is a normal page, and its corner button opens a full-screen "desktop" with windows, a taskbar and extra Ring windows. The user wants these as two separate tools:
- **Cyclic Groups**: the desktop, always on. It fills the browser window below the site header, with no full-screen request. A corner button can still take it into true browser full screen.
- **_Cyclic Groups**: today's page layout, with the full-screen button and the desktop removed.

Decided with the user: two independent copies of the page (no shared-script refactor). Each copy then evolves on its own.

Run this as one `/gsd-quick` task, committed on `main` (no branch, no push).

## 1. Create `_Cyclic Groups/_cyclic-groups.html` (the page tool)
- `git cp`-style copy of the current `Cyclic Groups/cyclic-groups.html` into the new top-level directory `_Cyclic Groups/`. All asset paths are `../assets/…`, so they keep working. Self-references use `location.pathname`, so the preview and iso iframes point at the copy automatically.
- Remove the full-screen entry point: the `#fullscreen-btn` markup, the "full screen" JS section (`syncFullscreenBtn`, `fullscreenchange` listeners, ~line 2603), and the `syncFullscreenBtn()` call in `onLangChange`.
- Remove what becomes unreachable without the desktop:
  - the `#fs-taskbar`/launcher/menu markup;
  - the "full-screen desktop: windows and taskbar" JS (`FS_PANELS`, `fsState`, `syncWindows`, window drag, snap and alpha code);
  - the `ringwin`/`isopane` iframe modes, which exist only to fill desktop Ring windows;
  - the `.diagram-frame:fullscreen …`, `.fs-*` and `:root.is-ringwin` CSS rules.

  Keep `preview=1` (the isomorphic-group chip previews). Wherever removal is tangled with shared rendering (`syncHeadSwitches`, `drawMath`, split view), stub the check to "not full screen" rather than rip it out. After each removal, check the console stays clean.
- Nav link `is-active` on its own entry. `<title>` and `<h1>` show "_Cyclic Groups" through the new `site.nav.cyclicGroupsClassic` key.
- It loads the same `assets/i18n/cyclic-groups.js` (the `cyclicGroups` namespace), so no duplicated 7,300-line dictionary.
- It keeps the same `cyclic-groups` localStorage key and NT.store shared group, so the chosen group carries over between the two tools.

## 2. Turn `Cyclic Groups/cyclic-groups.html` into the desktop tool
- Add `IS_DESKTOP = !IS_PREVIEW && !IS_RINGWIN` and a static `is-desktop` class on `<html>` for the top-level page. Then add `function desktopOn(){ return IS_DESKTOP || fullscreenEl() === diagramFrameEl; }` and use it in `syncWindows()` (line ~3755) and the other `fullscreenEl() === diagramFrameEl` tests.
- In CSS, each of the 17 `.diagram-frame:fullscreen` selectors becomes `:is(.diagram-frame:fullscreen, :root.is-desktop .diagram-frame)`, scoped so the ringwin and preview iframes are untouched.
- Layout: hide `.page-header`, `.side` (whose controls already move into the Ring window) and any leftover stage content. The `.diagram-frame` becomes `position: fixed`, running from the site header's bottom edge to the viewport bottom, with the body not scrolling. The taskbar sits at the bottom as it does today.
- The corner full-screen button stays visible on the desktop and toggles true browser full screen of the frame, with the existing labels. The taskbar's `#fs-exit` ("leave full screen") shows only while in true full screen.
- `closeWindow('ring')` (~line 3444) currently leaves full screen. On the desktop it minimizes the Ring window instead, since the taskbar can bring it back. The "with no taskbar, every window comes up" reset in `syncWindows` runs once on load.
- Delete the now-meaningless normal-page-only pieces that `_cyclic-groups.html` keeps, such as `.frame-tools`'s resize grip and the page's `min-height` rules. Leave the rest of the logic as is.

## 3. Site wiring (all thirty-one languages)
- `assets/i18n/site.js`: add `nav.cyclicGroupsClassic` = "_" + that language's existing `nav.cyclicGroups` value, in every block (zgh-Tfng is the transliteration of zgh-Latn, as the existing entry already is).
- Every page's nav (`index.html` and all tool pages, plus both Cyclic pages): add `<a href="../_Cyclic Groups/_cyclic-groups.html" … data-i18n="site.nav.cyclicGroupsClassic">_Cyclic Groups</a>` right after the Cyclic Groups link. `index.html` uses a root-relative href.
- `index.html` gets a hub card for _Cyclic Groups after the Cyclic Groups card. `assets/i18n/hub.js` gets `card.cyclicGroupsClassic.title` (same "_" form) and a one-sentence `.desc` ("The same rings on one scrolling page, with the controls beside the diagram instead of in windows.") translated into all 31 languages. The existing Cyclic Groups card's desc stays.
- `.planning/phases/06-multi-language-support/i18n-check.js` `PAGES`: add a row `{ file: "_Cyclic Groups/_cyclic-groups.html", dataFile: "assets/i18n/cyclic-groups.js", ns: "cyclicGroups", slug: "_cyclic-groups" }`. If the checker objects to a slug/dataFile mismatch, adjust that row's checks rather than duplicating the dictionary.
- Update `CLAUDE.md`'s tool list with both entries.
- Leave `Cyclic Groups/zz-old.html` and the `CLAUDE_RESUME_COMMAND` files as they are.

## Verification
- Run `node .planning/phases/06-multi-language-support/i18n-check.js` (plus `--header` and `--switcher-present`) and expect no new findings.
- In Chrome, open `Cyclic Groups/cyclic-groups.html` over `file://` and check:
  - the desktop fills the window under the header on load;
  - Ring and Notice windows drag, snap, minimize and maximize;
  - adding an extra Ring window works, and the isomorphism split pane works;
  - the corner button enters and exits true full screen;
  - closing the Ring window minimizes it;
  - switching to ar shows RTL, and a language change keeps state;
  - the console has no errors.
- Open `_Cyclic Groups/_cyclic-groups.html` and check:
  - there is no full-screen button;
  - the ring, subgroups, iso previews, split view, export PNG and download menu all work;
  - the console has no errors;
  - the group chosen here appears when switching to the other tool.
- Click the new nav link and hub card from another page, such as Cayley Table.

## Tasks (execute in order, one commit each)
1. **Task 1: create `_Cyclic Groups/_cyclic-groups.html`** (plan section 1). Commit: `feat(cyclic-groups): move the page layout into its own _Cyclic Groups tool`.
2. **Task 2: make `Cyclic Groups/cyclic-groups.html` the always-on desktop** (plan section 2). Commit: `feat(cyclic-groups): the Cyclic Groups tool is the windowed desktop, filling the page`.
3. **Task 3: site wiring in all 31 languages** (plan section 3: site.js, hub.js, every page's nav, index.html card, i18n-check PAGES row, CLAUDE.md). Commit: `feat(site): add _Cyclic Groups to the nav and hub in all thirty-one languages`.
