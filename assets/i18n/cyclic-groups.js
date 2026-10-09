/* assets/i18n/cyclic-groups.js — the 'cyclicGroups' namespace: the title,
   eyebrow, heading and lede, the mode-tab label, the Group panel's heading,
   modulus and generator controls, and the necklace diagram's own title,
   footnote and accessible name for the Cyclic Groups tool.

   ENGLISH ONLY FOR NOW, by the user's decision (quick task 261009-d21). The
   other thirty supported languages fall back to these English values
   through NT.i18n (current language, then en, then the key itself), so a
   non-English visitor sees English text, never a raw key. i18n-check keeps
   reporting a LANG-KEYSET finding for each of those languages until their
   translations are added; this file is the single place to add them.

   Classic script, IIFE, "use strict" — its only statement is
   NT.i18n.register(...). Notation (Z/n, (Z/n)*) and numerals are written
   the same way in every language. Must load after assets/nt-i18n.js and
   assets/i18n/site.js, before the page's own inline <script>.
*/
(function () {
  "use strict";

  NT.i18n.register('cyclicGroups', {
    en: {
      title: 'Cyclic Groups — Necklace Visualizer',
      eyebrow: 'group theory · generators and orbits',
      heading: 'Cyclic Group Necklace',
      lede: 'Pick a group. Every element becomes a bead on a ring, equally spaced. Walking by the generator draws the chords, and a generator that reaches every bead is what makes the group cyclic. Groups with no such element are split into the rings they are built from.',
      tablistLabel: 'Group operation',
      groupHeading: 'Group',
      nLabel: 'n — modulus',
      genLabel: 'Generator',
      genOptionAdditive: '{g} (step)',
      genOptionMultiplicative: '{g} (primitive root)',
      genNone: 'none (not cyclic)',
      ringTitle: '{group} · generator {g} · order {order}',
      ringFootnote: 'The identity, {id}, is ringed.',
      svgAriaLabel: 'Necklace diagram of {group}'
    }
  });
})();
