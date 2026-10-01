/* assets/i18n/site.js — the 'site' namespace: shared header chrome
   (brand, nav labels for all sixteen pages, the language switcher's own
   label and the day/night toggle's label) in all five supported languages.

   Classic script, IIFE, "use strict" — its only statement is
   NT.i18n.register(...). Dictionary rules (see assets/nt-i18n.js's header
   comment and the NT.i18n contract this phase's plan records): flat keys,
   the identical key set in every language object, plain text values (no
   markup), numerals/math notation untouched, emoji/glyph prefixes kept as
   part of the value rather than concatenated in code. Must load after
   assets/nt-i18n.js and before a page's own inline <script>.
*/
(function () {
  "use strict";

  NT.i18n.register('site', {
    nl: {
      brand: 'Getaltheorie-tools',
      'nav.label': 'Hulpmiddelen',
      'nav.home': 'Start',
      'nav.sieve': 'Zeef van Eratosthenes',
      'nav.factorTree': 'Factorboom',
      'nav.venn': 'Venndiagram',
      'nav.euclid': 'Algoritme van Euclides',
      'nav.crt': 'Chinese reststelling',
      'nav.wheel': 'Equivalentiewiel',
      'nav.totient': 'Eulers phi-functie',
      'nav.cayley': 'Cayleytabel',
      'nav.iso': 'Groepsisomorfisme',
      'nav.sqm': 'Kwadrateren en vermenigvuldigen',
      'nav.dh': 'Diffie-Hellman',
      'nav.ecdh': 'Elliptische-krommen-DH',
      'nav.rsa': 'RSA',
      'nav.fermat': 'Methode van Fermat',
      'nav.shor': 'Algoritme van Shor',
      'lang.label': 'Taal',
      'theme.toggle': 'Wissel tussen dag- en nachtmodus'
    },
    en: {
      brand: 'Number Theory Tools',
      'nav.label': 'Tools',
      'nav.home': 'Home',
      'nav.sieve': 'Sieve of Eratosthenes',
      'nav.factorTree': 'Factor Tree',
      'nav.venn': 'Venn Diagram',
      'nav.euclid': 'Euclidean Algorithm',
      'nav.crt': 'Chinese Remainder Theorem',
      'nav.wheel': 'Equivalence Wheel',
      'nav.totient': "Euler's Totient",
      'nav.cayley': 'Cayley Table',
      'nav.iso': 'Group Isomorphism',
      'nav.sqm': 'Square and Multiply',
      'nav.dh': 'Diffie-Hellman',
      'nav.ecdh': 'Elliptic Curve DH',
      'nav.rsa': 'RSA',
      'nav.fermat': "Fermat's Method",
      'nav.shor': "Shor's Algorithm",
      'lang.label': 'Language',
      'theme.toggle': 'Toggle day and night mode'
    },
    de: {
      brand: 'Zahlentheorie-Werkzeuge',
      'nav.label': 'Werkzeuge',
      'nav.home': 'Startseite',
      'nav.sieve': 'Sieb des Eratosthenes',
      'nav.factorTree': 'Faktorbaum',
      'nav.venn': 'Venn-Diagramm',
      'nav.euclid': 'Euklidischer Algorithmus',
      'nav.crt': 'Chinesischer Restsatz',
      'nav.wheel': 'Äquivalenzrad',
      'nav.totient': 'Eulersche Phi-Funktion',
      'nav.cayley': 'Cayley-Tafel',
      'nav.iso': 'Gruppenisomorphismus',
      'nav.sqm': 'Quadrieren und Multiplizieren',
      'nav.dh': 'Diffie-Hellman',
      'nav.ecdh': 'Elliptische-Kurven-DH',
      'nav.rsa': 'RSA',
      'nav.fermat': 'Fermat-Methode',
      'nav.shor': 'Shor-Algorithmus',
      'lang.label': 'Sprache',
      'theme.toggle': 'Zwischen Tag- und Nachtmodus wechseln'
    },
    fr: {
      brand: 'Outils de théorie des nombres',
      'nav.label': 'Outils',
      'nav.home': 'Accueil',
      'nav.sieve': "Crible d'Ératosthène",
      'nav.factorTree': 'Arbre de facteurs',
      'nav.venn': 'Diagramme de Venn',
      'nav.euclid': "Algorithme d'Euclide",
      'nav.crt': 'Théorème des restes chinois',
      'nav.wheel': "Roue d'équivalence",
      'nav.totient': "Indicatrice d'Euler",
      'nav.cayley': 'Table de Cayley',
      'nav.iso': 'Isomorphisme de groupes',
      'nav.sqm': 'Exponentiation rapide',
      'nav.dh': 'Diffie-Hellman',
      'nav.ecdh': 'DH sur courbes elliptiques',
      'nav.rsa': 'RSA',
      'nav.fermat': 'Méthode de Fermat',
      'nav.shor': "Algorithme de Shor",
      'lang.label': 'Langue',
      'theme.toggle': 'Basculer entre mode jour et mode nuit'
    },
    es: {
      brand: 'Herramientas de teoría de números',
      'nav.label': 'Herramientas',
      'nav.home': 'Inicio',
      'nav.sieve': 'Criba de Eratóstenes',
      'nav.factorTree': 'Árbol de factores',
      'nav.venn': 'Diagrama de Venn',
      'nav.euclid': 'Algoritmo de Euclides',
      'nav.crt': 'Teorema chino del resto',
      'nav.wheel': 'Rueda de equivalencia',
      'nav.totient': 'Función φ de Euler',
      'nav.cayley': 'Tabla de Cayley',
      'nav.iso': 'Isomorfismo de grupos',
      'nav.sqm': 'Exponenciación rápida',
      'nav.dh': 'Diffie-Hellman',
      'nav.ecdh': 'DH de curva elíptica',
      'nav.rsa': 'RSA',
      'nav.fermat': 'Método de Fermat',
      'nav.shor': 'Algoritmo de Shor',
      'lang.label': 'Idioma',
      'theme.toggle': 'Alternar entre modo día y modo noche'
    }
  });
})();
