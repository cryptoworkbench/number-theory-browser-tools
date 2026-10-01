/* assets/i18n/sieve-of-eratosthenes.js — the 'sieve' namespace: title,
   heading, lede and the four banner messages for the Sieve of Eratosthenes
   tool, in all five supported languages.

   Classic script, IIFE, "use strict" — its only statement is
   NT.i18n.register(...). banner.done is a plural entry ({ one, other });
   every other key is plain text. Placeholder names ({n}, {time}, {count})
   are identical across all five languages. Must load after
   assets/nt-i18n.js and assets/i18n/site.js, before the page's own inline
   <script>.
*/
(function () {
  "use strict";

  NT.i18n.register('sieve', {
    nl: {
      title: 'Zeef van Eratosthenes — Interactieve visualisatie',
      heading: 'Zeef van Eratosthenes',
      lede: 'Geef elk natuurlijk getal zijn eigen vakje — en kijk hoe de zeef alles doorstreept wat niet priem is.',
      'banner.ready': 'Klaar. {n} vakjes aangemaakt — druk op Afspelen om te zeven.',
      'banner.single': 'Slechts 1 vakje — niets om te zeven.',
      'banner.reset': 'Reset. {n} vakjes opnieuw opgebouwd — druk op Afspelen om te zeven.',
      'banner.done': {
        one: '{count} priemgetal gevonden tot {n} in {time}.',
        other: '{count} priemgetallen gevonden tot {n} in {time}.'
      }
    },
    en: {
      title: 'Sieve of Eratosthenes — Interactive Visualizer',
      heading: 'Sieve of Eratosthenes',
      lede: "Give every natural number its own box — then watch the sieve strike out everything that isn't prime.",
      'banner.ready': 'Ready. {n} boxes created — press Play to sieve.',
      'banner.single': 'Only 1 box — nothing to sieve.',
      'banner.reset': 'Reset. {n} boxes rebuilt — press Play to sieve.',
      'banner.done': {
        one: 'Found {count} prime up to {n} in {time}.',
        other: 'Found {count} primes up to {n} in {time}.'
      }
    },
    de: {
      title: 'Sieb des Eratosthenes — Interaktive Visualisierung',
      heading: 'Sieb des Eratosthenes',
      lede: 'Gib jeder natürlichen Zahl ihr eigenes Kästchen — und sieh zu, wie das Sieb alles streicht, was nicht prim ist.',
      'banner.ready': 'Bereit. {n} Kästchen erstellt — drücke Abspielen, um zu sieben.',
      'banner.single': 'Nur 1 Kästchen — nichts zu sieben.',
      'banner.reset': 'Zurückgesetzt. {n} Kästchen neu aufgebaut — drücke Abspielen, um zu sieben.',
      'banner.done': {
        one: '{count} Primzahl bis {n} gefunden in {time}.',
        other: '{count} Primzahlen bis {n} gefunden in {time}.'
      }
    },
    fr: {
      title: "Crible d'Ératosthène — Visualisation interactive",
      heading: "Crible d'Ératosthène",
      lede: "Donnez à chaque entier naturel sa propre case — puis regardez le crible barrer tout ce qui n'est pas premier.",
      'banner.ready': 'Prêt. {n} cases créées — appuyez sur Lecture pour cribler.',
      'banner.single': 'Une seule case — rien à cribler.',
      'banner.reset': 'Réinitialisé. {n} cases reconstruites — appuyez sur Lecture pour cribler.',
      'banner.done': {
        one: '{count} nombre premier trouvé jusqu’à {n} en {time}.',
        other: '{count} nombres premiers trouvés jusqu’à {n} en {time}.'
      }
    },
    es: {
      title: 'Criba de Eratóstenes — Visualizador interactivo',
      heading: 'Criba de Eratóstenes',
      lede: 'Dale a cada número natural su propia casilla — y mira cómo la criba tacha todo lo que no es primo.',
      'banner.ready': 'Listo. Se crearon {n} casillas — pulsa Reproducir para cribar.',
      'banner.single': 'Solo 1 casilla — nada que cribar.',
      'banner.reset': 'Reiniciado. Se reconstruyeron {n} casillas — pulsa Reproducir para cribar.',
      'banner.done': {
        one: 'Se encontró {count} número primo hasta {n} en {time}.',
        other: 'Se encontraron {count} números primos hasta {n} en {time}.'
      }
    }
  });
})();
