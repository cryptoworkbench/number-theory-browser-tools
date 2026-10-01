/* assets/i18n/eulers-totient.js — the 'totient' namespace: title, eyebrow,
   heading, lede, the cross-link text, the two "prime" preset chips, the
   Run button, every validation/error message, the k-walk's chain head,
   verdict lines, progress/tally/answer lines, the banner (including a
   plural "done" message) and the closing caption for the Euler's Totient
   tool, in all five supported languages.

   Classic script, IIFE, "use strict" — its only statement is
   NT.i18n.register(...). "gcd" is mathematical notation per
   06-GLOSSARY.md section (e) and is written identically in every
   language (never translated to ggd/ggT/pgcd/mcd). Play/Pause, Step,
   Instant, Reset and Speed live in the shared `common` namespace
   (assets/i18n/site.js), never duplicated here. Placeholder names ({k},
   {n}, {min}, {max}, {count}, {total}, {phi}, {gcd}) are identical across
   all five languages. Must load after assets/nt-i18n.js and
   assets/i18n/site.js, before the page's own inline <script>.
*/
(function () {
  "use strict";

  NT.i18n.register('totient', {
    nl: {
      title: 'Eulers phi-functie',
      eyebrow: 'getaltheorie · eulers phi-functie',
      heading: 'Eulers phi-functie',
      lede: 'φ(n) telt hoeveel van 1 … n−1 geen factor met n delen, en deze pagina ontdekt dat op de enige eerlijke manier — door het algoritme van Euclides naar elk van hen afzonderlijk te vragen.',
      xref: 'Diezelfde telling duikt op als de taartpunten van de multiplicatieve groep mod n →',
      chipPrime: '{n} · priem',
      run: 'Start',
      errNotWhole: 'n moet een heel getal zijn.',
      errTooSmall: 'n moet minstens {min} zijn — de wandeling k = 1 … n−1 heeft minstens één k nodig om te testen.',
      errCapped: 'n is begrensd op {max} — de waarde is naar beneden afgeklemd om te passen.',
      chainHead: 'Test k = {k} — gcd({n}, {k})',
      verdictCoprime: 'k = {k} is onderling ondeelbaar met {n} — gcd = 1, meegeteld.',
      verdictEliminated: 'k = {k} deelt een factor met {n} — gcd = {gcd}, uitgesloten.',
      tally: 'Lopende telling onderling ondeelbaar: {count}',
      progress: 'k = {k} van {total} getest.',
      answer: 'φ({n}) = {phi}',
      bannerReady: 'Klaar — druk op Afspelen om de wandeling elke k één deling per keer te zien testen.',
      bannerDone: {
        one: 'Klaar — {count} waarde getest, {phi} onderling ondeelbaar met {n}.',
        other: 'Klaar — {count} waarden getest, {phi} onderling ondeelbaar met {n}.'
      },
      caption: 'Een priemgetal n geeft φ(n) = n−1, omdat elk kleiner getal het mist — de chips maken dat makkelijk te checken.'
    },
    en: {
      title: "Euler's Totient Function",
      eyebrow: "number theory · euler's totient",
      heading: "Euler's Totient Function",
      lede: 'φ(n) counts how many of 1 … n−1 share no factor with n, and this page finds out the only honest way — by asking the Euclidean algorithm about every single one of them.',
      xref: 'The same count shows up as the wedges of the multiplicative group mod n →',
      chipPrime: '{n} · prime',
      run: 'Run',
      errNotWhole: 'n must be a whole number.',
      errTooSmall: 'n must be at least {min} — the walk k = 1 … n−1 needs at least one k to test.',
      errCapped: 'n is capped at {max} — the value was clamped down to fit.',
      chainHead: 'Testing k = {k} — gcd({n}, {k})',
      verdictCoprime: 'k = {k} is coprime to {n} — gcd = 1, tallied.',
      verdictEliminated: 'k = {k} shares a factor with {n} — gcd = {gcd}, eliminated.',
      tally: 'Running coprime count: {count}',
      progress: 'k = {k} of {total} tested.',
      answer: 'φ({n}) = {phi}',
      bannerReady: 'Ready — press Play to watch the walk test each k one division at a time.',
      bannerDone: {
        one: 'Done — {count} value tested, {phi} coprime to {n}.',
        other: 'Done — {count} values tested, {phi} coprime to {n}.'
      },
      caption: 'n prime gives φ(n) = n−1, because every smaller number misses it — the chips make that easy to check.'
    },
    de: {
      title: 'Eulersche Phi-Funktion',
      eyebrow: 'zahlentheorie · eulersche phi-funktion',
      heading: 'Eulersche Phi-Funktion',
      lede: 'φ(n) zählt, wie viele der Zahlen 1 … n−1 keinen Faktor mit n teilen, und diese Seite findet das auf die einzig ehrliche Weise heraus — indem sie den euklidischen Algorithmus zu jeder einzelnen von ihnen befragt.',
      xref: 'Dieselbe Zählung taucht als die Sektoren der multiplikativen Gruppe mod n wieder auf →',
      chipPrime: '{n} · prim',
      run: 'Start',
      errNotWhole: 'n muss eine ganze Zahl sein.',
      errTooSmall: 'n muss mindestens {min} sein — der Durchlauf k = 1 … n−1 braucht mindestens ein k zum Testen.',
      errCapped: 'n ist auf {max} begrenzt — der Wert wurde nach unten passend gemacht.',
      chainHead: 'Teste k = {k} — gcd({n}, {k})',
      verdictCoprime: 'k = {k} ist teilerfremd zu {n} — gcd = 1, gezählt.',
      verdictEliminated: 'k = {k} teilt einen Faktor mit {n} — gcd = {gcd}, ausgeschlossen.',
      tally: 'Laufende Anzahl teilerfremder Zahlen: {count}',
      progress: 'k = {k} von {total} getestet.',
      answer: 'φ({n}) = {phi}',
      bannerReady: 'Bereit — drücke Abspielen, um den Durchlauf jedes k Schritt für Schritt testen zu sehen.',
      bannerDone: {
        one: 'Fertig — {count} Wert getestet, {phi} teilerfremd zu {n}.',
        other: 'Fertig — {count} Werte getestet, {phi} teilerfremd zu {n}.'
      },
      caption: 'Eine Primzahl n ergibt φ(n) = n−1, weil jede kleinere Zahl sie verfehlt — die Chips machen das leicht zu prüfen.'
    },
    fr: {
      title: "La fonction indicatrice d'Euler",
      eyebrow: "théorie des nombres · indicatrice d'euler",
      heading: "La fonction indicatrice d'Euler",
      lede: "φ(n) compte combien de nombres parmi 1 … n−1 ne partagent aucun facteur avec n, et cette page le découvre de la seule manière honnête — en interrogeant l'algorithme d'Euclide sur chacun d'eux.",
      xref: 'Le même compte réapparaît comme les secteurs du groupe multiplicatif mod n →',
      chipPrime: '{n} · premier',
      run: 'Lancer',
      errNotWhole: 'n doit être un nombre entier.',
      errTooSmall: "n doit être au moins {min} — le parcours k = 1 … n−1 a besoin d'au moins un k à tester.",
      errCapped: 'n est plafonné à {max} — la valeur a été ramenée à cette limite.',
      chainHead: 'Test de k = {k} — gcd({n}, {k})',
      verdictCoprime: 'k = {k} est premier avec {n} — gcd = 1, comptabilisé.',
      verdictEliminated: 'k = {k} partage un facteur avec {n} — gcd = {gcd}, éliminé.',
      tally: 'Décompte en cours des nombres premiers entre eux : {count}',
      progress: 'k = {k} sur {total} testé.',
      answer: 'φ({n}) = {phi}',
      bannerReady: 'Prêt — appuyez sur Lecture pour regarder le parcours tester chaque k une division à la fois.',
      bannerDone: {
        one: 'Terminé — {count} valeur testée, {phi} premier avec {n}.',
        other: 'Terminé — {count} valeurs testées, {phi} premier avec {n}.'
      },
      caption: "Un nombre premier n donne φ(n) = n−1, car chaque nombre plus petit le manque — les puces permettent de le vérifier facilement."
    },
    es: {
      title: 'La función φ de Euler',
      eyebrow: 'teoría de números · función φ de euler',
      heading: 'La función φ de Euler',
      lede: 'φ(n) cuenta cuántos de 1 … n−1 no comparten ningún factor con n, y esta página lo averigua de la única forma honesta — preguntándole al algoritmo de Euclides sobre cada uno de ellos.',
      xref: 'El mismo recuento aparece como los sectores del grupo multiplicativo mod n →',
      chipPrime: '{n} · primo',
      run: 'Ejecutar',
      errNotWhole: 'n debe ser un número entero.',
      errTooSmall: 'n debe ser al menos {min} — el recorrido k = 1 … n−1 necesita al menos un k para probar.',
      errCapped: 'n está limitado a {max} — el valor se redujo para ajustarse.',
      chainHead: 'Probando k = {k} — gcd({n}, {k})',
      verdictCoprime: 'k = {k} es coprimo con {n} — gcd = 1, contado.',
      verdictEliminated: 'k = {k} comparte un factor con {n} — gcd = {gcd}, eliminado.',
      tally: 'Recuento de coprimos en curso: {count}',
      progress: 'k = {k} de {total} probado.',
      answer: 'φ({n}) = {phi}',
      bannerReady: 'Listo — pulsa Reproducir para ver cómo el recorrido prueba cada k una división a la vez.',
      bannerDone: {
        one: 'Listo — {count} valor probado, {phi} coprimo con {n}.',
        other: 'Listo — {count} valores probados, {phi} coprimo con {n}.'
      },
      caption: 'Un número primo n da φ(n) = n−1, porque todo número menor lo falla — las fichas hacen fácil comprobarlo.'
    }
  });
})();
