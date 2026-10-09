/* assets/i18n/least-common-multiple.js — the 'lcm' namespace: the title,
   heading and lede, the Euclidean Algorithm cross-link, the preset chips,
   the gcd-grid toggle, the banner, the tower diagram's captions and notes,
   the race log's row labels, the gcd · lcm identity note and the least
   common denominator panel for the Least Common Multiple tool.

   ENGLISH ONLY FOR NOW, following the Cyclic Groups precedent (quick task
   261009-d21). The other thirty supported languages fall back to these
   English values through NT.i18n (current language, then en, then the key
   itself), so a non-English visitor sees English text, never a raw key.
   i18n-check keeps reporting a LANG-KEYSET finding for each of those
   languages until their translations are added; this file is the single
   place to add them.

   Classic script, IIFE, "use strict" — its only statement is
   NT.i18n.register(...). Plural entries are { one, other } objects selected
   by their {count} param; every other key is plain text. Numerals and
   notation (gcd, lcm, a, b, ×, ·) are written the same way in every
   language. Play/Step/Instant/Reset and the speed words live in the shared
   `common` namespace (assets/i18n/site.js), never duplicated here. Must
   load after assets/nt-i18n.js and assets/i18n/site.js, before the page's
   own inline <script>.
*/
(function () {
  "use strict";

  NT.i18n.register('lcm', {
    en: {
      title: 'Least Common Multiple — Stacking Squares',
      heading: 'Least Common Multiple',
      lede: 'Stack squares of side a in one tower and squares of side b in another, always adding the next square to whichever tower is shorter. The first height both towers reach together is the least common multiple of a and b — and the least common denominator of any two fractions over a and b.',
      xref: 'The towers meet at a·b / gcd(a, b) — watch that gcd come out of the Euclidean algorithm →',
      chipClassic: '4, 6 · the classic',
      chipShareTwo: '6, 10 · share a 2',
      chipCoprime: '7, 9 · coprime: lcm = a·b',
      chipMultiple: '5, 15 · b is a multiple of a',
      chipTwelveEighteen: '12, 18 · share a 6',
      chipEqual: '8, 8 · equal pair',
      chipLong: '21, 34 · long race',
      run: 'Run',
      gcdGridLabel: 'Show the gcd grid — the common unit both towers are built from',
      towersAria: 'Two towers of stacked squares growing until they reach the same height',
      bannerReady: 'Press Play or Step to start stacking squares.',
      bannerNextA: 'Heights {ha} and {hb}: the a-tower is shorter, so the next {a}×{a} square goes on top of it.',
      bannerNextB: 'Heights {ha} and {hb}: the b-tower is shorter, so the next {b}×{b} square goes on top of it.',
      bannerDone: 'Both towers reach {L} at the same moment: {L} is the first height that is a multiple of both {a} and {b}, so lcm({a}, {b}) = {L}.',
      captionTowers: {
        one: 'a-tower: {ca} × {a} = {ha}. b-tower: {cb} × {b} = {hb}. {count} square placed so far.',
        other: 'a-tower: {ca} × {a} = {ha}. b-tower: {cb} × {b} = {hb}. {count} squares placed so far.'
      },
      noteSolid: 'At this scale a single square would be thinner than a hairline, so each tower is drawn as a solid column — still at true height.',
      noteGrid: 'Grid lines every gcd({a}, {b}) = {g}: every square edge in both towers lands on one of them.',
      noteGridHidden: 'The gcd grid would be too dense to draw at this scale (gcd({a}, {b}) = {g}).',
      logHeading: 'The race, as multiples',
      logRowA: 'Multiples of a = {a}',
      logRowB: 'Multiples of b = {b}',
      identityNote: 'Why this height? Both towers are built from blocks of gcd = {g}: a = {g}·{a1} and b = {g}·{b1}, and {a1} and {b1} share no factor. So the towers first meet after {b1} squares of side {a} and {a1} squares of side {b}, at {g}·{a1}·{b1} = {L}.',
      lcdHeading: 'Least common denominator',
      lcdIntro: 'To add or compare two fractions over {a} and {b}, rewrite both over one shared denominator. The smallest denominator that works is the height where the towers meet: lcm({a}, {b}) = {L}.',
      lcdNumA: 'numerator over a',
      lcdNumB: 'numerator over b',
      lcdSimplified: 'which simplifies to',
      lcdNoSimplify: 'already in lowest terms',
      errBothWhole: 'Both a and b must be whole numbers.',
      errPositive: 'Both a and b must be at least 1 — a tower of zero-height squares never grows.',
      errClamped: 'Values above {max} were clamped to {max}.',
      errNumerators: 'The numerators must be whole numbers.'
    }
  });
})();
