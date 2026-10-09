/* assets/i18n/cyclic-groups.js — the 'cyclicGroups' namespace: the title,
   eyebrow, heading and lede, the Cayley Table cross-link, the mode-tab
   label, the Group panel's modulus and generator controls, the five layer
   toggles, the explanation panel and its hint lines, the color key, the
   necklace and factor-ring diagram texts, the explanation of why a group
   has no generator, and the ring PNG export for the Cyclic Groups tool.

   ENGLISH ONLY FOR NOW, by the user's decision (quick task 261009-d21). The
   other thirty supported languages fall back to these English values
   through NT.i18n (current language, then en, then the key itself), so a
   non-English visitor sees English text, never a raw key. i18n-check keeps
   reporting a LANG-KEYSET finding for each of those languages until their
   translations are added; this file is the single place to add them.

   Classic script, IIFE, "use strict" — its only statement is
   NT.i18n.register(...). legendBeads is a plural entry ({ one, other });
   every other key is plain text. The notice.* values are whole sentences
   whose {group}, {count}, {longest}, {factors} and {n} placeholders are
   <code> nodes supplied by the page script, rendered via translateInto,
   never as markup strings. Notation (Z/n, (Z/n)*, Z/2 × Z/4) and numerals
   are written the same way in every language. Additive Groups and
   Multiplicative Groups live in the shared `common` namespace
   (assets/i18n/site.js), never duplicated here. Must load after
   assets/nt-i18n.js and assets/i18n/site.js, before the page's own inline
   <script>.
*/
(function () {
  "use strict";

  NT.i18n.register('cyclicGroups', {
    en: {
      title: 'Cyclic Groups — Necklace Visualizer',
      eyebrow: 'group theory · generators and orbits',
      heading: 'Cyclic Group Necklace',
      lede: 'Pick a group. Every element becomes a bead on a ring, equally spaced. Walking by the generator draws the chords, and a generator that reaches every bead is what makes the group cyclic. Groups with no such element are split into the rings they are built from.',
      xref: 'See this group’s full operation table in the Cayley Table →',
      tablistLabel: 'Group operation',
      groupHeading: 'Group',
      nLabel: 'n — modulus',
      genLabel: 'Generator',
      genOptionAdditive: '{g} (step)',
      genOptionMultiplicative: '{g} (primitive root)',
      genNone: 'none (not cyclic)',
      nNoteClamped: 'n runs from 2 to 100, so the diagram shows n = {n}.',
      layersHeading: 'Layers',
      layerCord: 'Outer cord',
      layerChords: 'Generator chords',
      layerColors: 'Subgroup colors',
      layerOrders: 'Order labels',
      layerBygen: 'Arrange beads by generator powers',
      factsHeading: 'This group',
      'fact.group': 'Group',
      'fact.elements': 'Elements',
      'fact.identity': 'Identity',
      'fact.generators': 'Generators',
      'fact.structure': 'Structure',
      factGeneratorsCount: '{count} of {order}',
      factGeneratorsNone: '0 (not cyclic)',
      'hint.notCyclic': 'Drawn as one ring per cyclic factor. Chords and cord apply to each ring.',
      'hint.noLabels': 'The beads are too small for number labels here; the pattern still shows.',
      'hint.multiplicative': 'Beads are the numbers below {n} that share no factor with it. Stepping means multiplying by {g} mod {n}.',
      'hint.additive': 'Stepping means adding {g} mod {n}.',
      legendHeading: 'Color key: element order',
      legendOrder: 'order {order}',
      legendBeads: { one: '{count} bead', other: '{count} beads' },
      ringTitle: '{group} · generator {g} · order {order}',
      ringFootnote: 'The identity, {id}, is ringed.',
      ringFootnoteOrders: 'The identity, {id}, is ringed; the small outer number is each element’s order.',
      notCyclicTitle: '{group} is not cyclic',
      builtFrom: 'built from {factors}',
      factorRingLabel: 'Z/{order}, stepped by {g}',
      factorFootnote: 'Every element of {group} is exactly one bead from each ring, multiplied together mod {n}.',
      svgAriaLabel: 'Necklace diagram of {group}',
      'notice.heading': '{group} has no generator, so there is no single necklace',
      'notice.body': 'The group has {count} elements, but no single element reaches them all. Its longest orbit is {longest} steps, so it is drawn as the cyclic rings it is built from: {factors}.',
      'notice.whyPowerOfTwo': 'Why: n = {n} is a power of 2 above 4.',
      'notice.whyFourAndOdd': 'Why: n = {n} is divisible by 4 and by an odd prime.',
      'notice.whyTwoOddPrimes': 'Why: n = {n} has two different odd prime factors.',
      'notice.rule': '(Z/n)* is cyclic exactly when n is 1, 2 or 4, an odd prime power p^k, or twice one, 2p^k. Additive Z/n is always cyclic.',
      exportPng: 'Download ring PNG',
      exportSaved: 'Saved {filename}.',
      exportFailed: 'The picture could not be exported in this browser.'
    }
  });
})();
