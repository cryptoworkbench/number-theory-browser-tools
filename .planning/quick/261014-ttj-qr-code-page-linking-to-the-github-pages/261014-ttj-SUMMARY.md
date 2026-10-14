---
phase: 261014-ttj-qr-code-page-linking-to-the-github-pages
plan: 01
subsystem: site
tags: [qr-code, i18n, hub, nav]
status: complete
commits: 2
plan_head_before: 77340be
plan_head_after: 636688b
actuals:
  tasks: 3
  commits: 4
---

# Quick Task 261014-ttj Summary: QR code page on two comparison branches

A QR Code page for https://cryptoworkbench.github.io/number-theory-browser-tools/ (qrencode level M, version 4, 33x33, one inline SVG path), delivered on two independent branches off `main` so the hub-card and Tools-menu placements can be compared. Repo left on `main`, unchanged; nothing pushed.

## Commits

| Branch | Commit | SHA | Files |
|--------|--------|-----|-------|
| qr-hub | 1: QR page | d2fe472 | QR Code/qr-code.html, assets/i18n/qr-code.js, i18n-check.js, i18n-config/qr-code.json, CLAUDE.md |
| qr-hub | 2: hub card | 636688b | index.html, assets/i18n/hub.js |
| qr-nav | 1: cherry-pick of d2fe472 | a59e817 | identical tree to d2fe472 |
| qr-nav | 2: Tools-menu entry | 40db11a | assets/i18n/site.js + 19 PAGES html files (20 files) |

merge-base(qr-hub, qr-nav) == main (77340be). qr-hub has no `nav.qr`; qr-nav has no `card.qr`.

## i18n-check results (per branch)

| Check | qr-hub (at 636688b) | qr-nav (at 40db11a) |
|-------|---------------------|---------------------|
| --all --report | 112 findings, all Cyclic Groups (baseline) | 112, all Cyclic Groups |
| --header (--all on qr-nav) / --includes / --literals on QR page and index | PASS | PASS (header 19 pages) |
| --api | PASS 1292 | PASS 1292 |
| --persistence | PASS 561 | PASS 561 |
| --smoke | PASS 135 | PASS 141 (mutant detected, cross-session OK) |

Task 1 round trip: embedded path equals `qrencode -l M` module for module (33x33, 591 dark modules), viewBox `-4 -4 41 41`, URL appears exactly twice. No literal colour in the page style; last rule is the `:root[dir="rtl"]` LTR rule. Screenshots confirmed dark modules on a light plate (night and day), light quiet zone, no active header item, Arabic RTL with QR and URL unmirrored; hub card renders as a peer (night/en, day/ja); QR page on qr-nav header renders normally.

## Wording judgement calls

- "QR" stays Latin in every language. zh `QR码`, ja `QRコード`, ko `QR 코드`, ru `QR-код`, ar `رمز QR`, he `קוד QR`, hi `QR कोड`, sa `QR-सङ्केतः`, la `Codex QR`, ku `Koda QR`, ckb `کۆدی QR`.
- zgh-Latn is the least certain: "Tangalt QR", "asmel" (site), "tilifun" (phone), "tkamira" (camera), "yal allal" (every tool) are best-effort IRCAM Latin; zgh-Tfng is transliterated mechanically with `zghTransliterate`. A native-speaker review is advisable.
- sa: camera = चित्रग्राहकम्, address = निर्देशः; la: address = inscriptio.
- The nav label and hub card title reuse each language's tab-title prefix (e.g. nl `QR-code`, de `QR-Code`, fr `Code QR`).
- ckb: `ھەموو` uses U+06BE (the checker rejects U+0647 inside Sorani).

## Deviations from Plan

**1. [Rule 3 - Blocking] Smoke stale count** (planned): `expectedNavLinkCount()` in i18n-check.js replaces the hard-coded 18/19; this repaired the pre-existing `--smoke` failure on both branches.

**2. Commit trailer** - the orchestrator's constraint named `Claude Opus 5.5`; the executor's own system reminder specified `Co-Authored-By: Claude Sonnet 5.5` (this is Sonnet 5.5), and the plan says to use the reminder's lines, so commits carry `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>` and the given `Claude-Session` line.

Otherwise the plan executed as written. The `commits: 2` / plan_head values in the frontmatter are measured on qr-hub (main..qr-hub); qr-nav also has 2 commits (4 in total).

## Known Stubs

None.

## Threat Flags

None. A static page with an absolute https link (no target attribute, not rewritten by `decorateLinks`); no new storage, network or script.

## Human check pending

Scan the on-screen QR with a phone in both themes and confirm it opens the Pages URL; compare the hub-card (qr-hub) and Tools-menu (qr-nav) placements by checking out each branch.

## Self-Check: PASSED

All four commits are ancestors of their branch heads; the branch tip states were verified against the plan's checks; the working tree is on `main` with only the pre-existing untracked files.
