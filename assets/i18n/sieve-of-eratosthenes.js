/* assets/i18n/sieve-of-eratosthenes.js — the 'sieve' namespace: title,
   heading, lede, the banner messages, the control-panel static strings
   (size label, Generate button, stats, legend, footer) and the finished
   marker for the Sieve of Eratosthenes tool, in all six supported
   languages.

   Classic script, IIFE, "use strict" — its only statement is
   NT.i18n.register(...). banner.done is a plural entry ({ one, other });
   every other key is plain text. Placeholder names ({n}, {time}, {count})
   are identical across all six languages. legend.* values are rich
   templates (the swatch <span> renders as {0}). Play/Pause, Step, Instant
   and Reset live in the shared `common` namespace (assets/i18n/site.js),
   never duplicated here. Must load after assets/nt-i18n.js and
   assets/i18n/site.js, before the page's own inline <script>.
*/
(function () {
  "use strict";

  NT.i18n.register('sieve', {
    nl: {
      title: 'Zeef van Eratosthenes — Interactieve visualisatie',
      heading: 'Zeef van Eratosthenes',
      lede: 'Geef elk natuurlijk getal zijn eigen vakje — en kijk hoe de zeef alles doorstreept wat niet priem is.',
      sizeLabel: 'Zeefgrootte (N)',
      generate: '🧮 Genereer',
      'stat.current': 'Huidig',
      'stat.primesFound': 'Priemgetallen gevonden',
      'stat.sqrtBoundary': '√N-grens',
      'stat.elapsed': 'Verstreken',
      'stat.progress': 'Voortgang',
      'stat.done': '✓ klaar',
      'legend.unvisited': '{0} Onbezocht',
      'legend.currentPointer': '{0} Huidige aanwijzer',
      'legend.prime': '{0} Priem',
      'legend.composite': '{0} Doorgestreept (samengesteld)',
      'legend.neither': '{0} Geen van beide (1)',
      footer: 'Alle berekeningen gebeuren client-side in je browser. Geen getallen zijn blijvend beschadigd — alleen doorgestreept.',
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
      sizeLabel: 'Sieve size (N)',
      generate: '🧮 Generate',
      'stat.current': 'Current',
      'stat.primesFound': 'Primes found',
      'stat.sqrtBoundary': '√N boundary',
      'stat.elapsed': 'Elapsed',
      'stat.progress': 'Progress',
      'stat.done': '✓ done',
      'legend.unvisited': '{0} Unvisited',
      'legend.currentPointer': '{0} Current pointer',
      'legend.prime': '{0} Prime',
      'legend.composite': '{0} Struck (composite)',
      'legend.neither': '{0} Neither (1)',
      footer: 'All computation runs client-side in your browser. No numbers were harmed permanently — only struck.',
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
      sizeLabel: 'Siebgröße (N)',
      generate: '🧮 Erzeugen',
      'stat.current': 'Aktuell',
      'stat.primesFound': 'Gefundene Primzahlen',
      'stat.sqrtBoundary': '√N-Grenze',
      'stat.elapsed': 'Verstrichen',
      'stat.progress': 'Fortschritt',
      'stat.done': '✓ fertig',
      'legend.unvisited': '{0} Unbesucht',
      'legend.currentPointer': '{0} Aktueller Zeiger',
      'legend.prime': '{0} Primzahl',
      'legend.composite': '{0} Gestrichen (zusammengesetzt)',
      'legend.neither': '{0} Keines von beidem (1)',
      footer: 'Alle Berechnungen laufen clientseitig in deinem Browser. Keine Zahl wurde dauerhaft beschädigt — nur gestrichen.',
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
      sizeLabel: 'Taille du crible (N)',
      generate: '🧮 Générer',
      'stat.current': 'Actuel',
      'stat.primesFound': 'Nombres premiers trouvés',
      'stat.sqrtBoundary': 'Limite √N',
      'stat.elapsed': 'Écoulé',
      'stat.progress': 'Progression',
      'stat.done': '✓ terminé',
      'legend.unvisited': '{0} Non visité',
      'legend.currentPointer': '{0} Pointeur actuel',
      'legend.prime': '{0} Premier',
      'legend.composite': '{0} Barré (composé)',
      'legend.neither': '{0} Ni l’un ni l’autre (1)',
      footer: 'Tous les calculs s’exécutent côté client, dans votre navigateur. Aucun nombre n’a été endommagé de façon permanente — seulement barré.',
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
      sizeLabel: 'Tamaño de la criba (N)',
      generate: '🧮 Generar',
      'stat.current': 'Actual',
      'stat.primesFound': 'Números primos encontrados',
      'stat.sqrtBoundary': 'Límite √N',
      'stat.elapsed': 'Transcurrido',
      'stat.progress': 'Progreso',
      'stat.done': '✓ listo',
      'legend.unvisited': '{0} Sin visitar',
      'legend.currentPointer': '{0} Puntero actual',
      'legend.prime': '{0} Primo',
      'legend.composite': '{0} Tachado (compuesto)',
      'legend.neither': '{0} Ninguno (1)',
      footer: 'Todos los cálculos se ejecutan en tu navegador, del lado del cliente. Ningún número sufrió daños permanentes — solo fue tachado.',
      'banner.ready': 'Listo. Se crearon {n} casillas — pulsa Reproducir para cribar.',
      'banner.single': 'Solo 1 casilla — nada que cribar.',
      'banner.reset': 'Reiniciado. Se reconstruyeron {n} casillas — pulsa Reproducir para cribar.',
      'banner.done': {
        one: 'Se encontró {count} número primo hasta {n} en {time}.',
        other: 'Se encontraron {count} números primos hasta {n} en {time}.'
      }
    },
    it: {
      title: 'Crivello di Eratostene — Visualizzatore interattivo',
      heading: 'Crivello di Eratostene',
      lede: 'Dai a ogni numero naturale la sua casella — poi guarda il crivello eliminare tutto ciò che non è primo.',
      sizeLabel: 'Dimensione del crivello (N)',
      generate: '🧮 Genera',
      'stat.current': 'Attuale',
      'stat.primesFound': 'Numeri primi trovati',
      'stat.sqrtBoundary': 'Limite √N',
      'stat.elapsed': 'Trascorso',
      'stat.progress': 'Avanzamento',
      'stat.done': '✓ fatto',
      'legend.unvisited': '{0} Non visitato',
      'legend.currentPointer': '{0} Puntatore attuale',
      'legend.prime': '{0} Primo',
      'legend.composite': '{0} Eliminato (composto)',
      'legend.neither': '{0} Nessuno dei due (1)',
      footer: 'Tutti i calcoli vengono eseguiti lato client nel tuo browser. Nessun numero è stato danneggiato permanentemente — solo eliminato.',
      'banner.ready': 'Pronto. {n} caselle create — premi Riproduci per setacciare.',
      'banner.single': 'Solo 1 casella — niente da setacciare.',
      'banner.reset': 'Reimpostato. {n} caselle ricostruite — premi Riproduci per setacciare.',
      'banner.done': {
        one: '{count} numero primo trovato fino a {n} in {time}.',
        other: '{count} numeri primi trovati fino a {n} in {time}.'
      }
    }
  });
})();
