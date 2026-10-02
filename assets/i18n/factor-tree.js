/* assets/i18n/factor-tree.js — the 'factorTree' namespace: title, heading,
   subtitle, mode toggle, input placeholder, Grow button, footnote, the
   Balanced-mode caveat and every validation/result message for the Prime
   Factor Tree tool, in all six supported languages.

   Classic script, IIFE, "use strict" — its only statement is
   NT.i18n.register(...). Placeholder names ({n}, {count}) are identical
   across all six languages. The factorization itself (the equation/tree
   numerals and × symbol) is math notation and carries no key — only the
   English-prose parts of each message are translated. Must load after
   assets/nt-i18n.js and assets/i18n/site.js, before the page's own inline
   <script>.
*/
(function () {
  "use strict";

  NT.i18n.register('factorTree', {
    nl: {
      title: 'Priemfactorboom',
      heading: '🎄 Priemfactorboom 🎄',
      subtitle: 'Geef een getal — het laat een echte factorboom groeien, tak voor tak.',
      modeLabel: 'Boommodus',
      modeClassic: 'Klassiek',
      modeBalanced: 'Gebalanceerd',
      placeholder: 'bijv. 60',
      grow: 'Laat de boom groeien',
      footnote: 'Elk priemblad krijgt nog één laatste eigen splitsing: P = P × 1.',
      balancedNote: 'Gebalanceerde modus gebruikt de methode van Fermat om bij elke stap het meest gelijkmatig verdeelde factorpaar te vinden, met een maximum van 1.000.000 om snel te blijven. Sommige getallen — zoals een klein priemgetal keer een groot getal — splitsen nog steeds ongelijk; dat is geen fout, gewoon wiskunde.',
      msgEmpty: 'Voer eerst een getal in.',
      msgInvalid: 'Voer een heel getal in, 1 of groter.',
      msgTooLargeBalanced: 'Dat getal is te groot voor Gebalanceerde modus — probeer iets onder de 1.000.000, of schakel over naar Klassieke modus voor grotere getallen.',
      msgTooLargeClassic: 'Dat getal is te groot voor dit kleine boompje — probeer iets onder de 1 biljoen.',
      msgOne: '1 is niet priem en niet samengesteld — het is gewoon een zaadje, nog geen boom. 🌱',
      msgPrime: '{n} is priem — het splitst maar één keer, in 1 × {n}.',
      msgFactors: '{n} valt uiteen in {count} priemfactoren.',
      chipPrime: '{n} (priem)'
    },
    en: {
      title: 'Prime Factor Tree',
      heading: '🎄 Prime Factor Tree 🎄',
      subtitle: 'Give it a number — it grows a real factor tree, branch by branch.',
      modeLabel: 'Tree mode',
      modeClassic: 'Classic',
      modeBalanced: 'Balanced',
      placeholder: 'e.g. 60',
      grow: 'Grow the Tree',
      footnote: 'Every prime leaf gets one last split of its own: P = P × 1.',
      balancedNote: 'Balanced mode uses Fermat’s method to find the most evenly-split factor pair at each step, capped at numbers under 1,000,000 to stay instant. Some numbers — like a small prime times a big one — still split unevenly; that’s not a bug, just math.',
      msgEmpty: 'Please enter a number first.',
      msgInvalid: 'Please enter a whole number, 1 or greater.',
      msgTooLargeBalanced: 'That number is too large for Balanced mode — try something under 1,000,000, or switch to Classic mode for bigger numbers.',
      msgTooLargeClassic: 'That number is too large for this little tree — try something under 1 trillion.',
      msgOne: '1 is neither prime nor composite — it’s just a seed, not a tree yet. 🌱',
      msgPrime: '{n} is prime — it only splits once, into 1 × {n}.',
      msgFactors: '{n} factors into {count} primes.',
      chipPrime: '{n} (prime)'
    },
    de: {
      title: 'Primfaktorbaum',
      heading: '🎄 Primfaktorbaum 🎄',
      subtitle: 'Gib eine Zahl ein — sie lässt einen echten Faktorbaum wachsen, Ast für Ast.',
      modeLabel: 'Baummodus',
      modeClassic: 'Klassisch',
      modeBalanced: 'Ausgeglichen',
      placeholder: 'z. B. 60',
      grow: 'Baum wachsen lassen',
      footnote: 'Jedes Primzahl-Blatt bekommt noch eine letzte eigene Aufspaltung: P = P × 1.',
      balancedNote: 'Der ausgeglichene Modus nutzt Fermats Methode, um bei jedem Schritt das gleichmäßigste Faktorpaar zu finden, begrenzt auf Zahlen unter 1.000.000, um sofort zu bleiben. Manche Zahlen — etwa eine kleine Primzahl mal eine große — spalten sich trotzdem ungleich; das ist kein Fehler, nur Mathematik.',
      msgEmpty: 'Bitte gib zuerst eine Zahl ein.',
      msgInvalid: 'Bitte gib eine ganze Zahl ein, 1 oder größer.',
      msgTooLargeBalanced: 'Diese Zahl ist zu groß für den ausgeglichenen Modus — versuche etwas unter 1.000.000, oder wechsle für größere Zahlen zum klassischen Modus.',
      msgTooLargeClassic: 'Diese Zahl ist zu groß für diesen kleinen Baum — versuche etwas unter 1 Billion.',
      msgOne: '1 ist weder prim noch zusammengesetzt — sie ist nur ein Samen, noch kein Baum. 🌱',
      msgPrime: '{n} ist prim — sie spaltet sich nur einmal, in 1 × {n}.',
      msgFactors: '{n} zerfällt in {count} Primfaktoren.',
      chipPrime: '{n} (prim)'
    },
    fr: {
      title: 'Arbre des facteurs premiers',
      heading: '🎄 Arbre des facteurs premiers 🎄',
      subtitle: "Donnez-lui un nombre — il fait pousser un véritable arbre de facteurs, branche par branche.",
      modeLabel: "Mode de l'arbre",
      modeClassic: 'Classique',
      modeBalanced: 'Équilibré',
      placeholder: 'ex. 60',
      grow: "Faire pousser l'arbre",
      footnote: 'Chaque feuille première reçoit une toute dernière scission qui lui est propre : P = P × 1.',
      balancedNote: "Le mode équilibré utilise la méthode de Fermat pour trouver la paire de facteurs la plus également répartie à chaque étape, plafonné aux nombres inférieurs à 1 000 000 pour rester instantané. Certains nombres — comme un petit nombre premier multiplié par un grand — se divisent encore de façon inégale ; ce n'est pas un bug, juste des mathématiques.",
      msgEmpty: "Veuillez d'abord saisir un nombre.",
      msgInvalid: 'Veuillez saisir un nombre entier, 1 ou plus.',
      msgTooLargeBalanced: "Ce nombre est trop grand pour le mode équilibré — essayez quelque chose en dessous de 1 000 000, ou passez au mode classique pour des nombres plus grands.",
      msgTooLargeClassic: "Ce nombre est trop grand pour ce petit arbre — essayez quelque chose en dessous de 1 billion.",
      msgOne: "1 n'est ni premier ni composé — ce n'est qu'une graine, pas encore un arbre. 🌱",
      msgPrime: "{n} est premier — il ne se divise qu'une fois, en 1 × {n}.",
      msgFactors: '{n} se décompose en {count} facteurs premiers.',
      chipPrime: '{n} (premier)'
    },
    es: {
      title: 'Árbol de factores primos',
      heading: '🎄 Árbol de factores primos 🎄',
      subtitle: 'Dale un número — hace crecer un árbol de factores real, rama por rama.',
      modeLabel: 'Modo de árbol',
      modeClassic: 'Clásico',
      modeBalanced: 'Equilibrado',
      placeholder: 'p. ej. 60',
      grow: 'Hacer crecer el árbol',
      footnote: 'Cada hoja prima recibe una última división propia: P = P × 1.',
      balancedNote: 'El modo equilibrado usa el método de Fermat para encontrar el par de factores más equilibrado en cada paso, limitado a números menores de 1.000.000 para mantenerse instantáneo. Algunos números — como un primo pequeño multiplicado por uno grande — igual se dividen de forma desigual; eso no es un error, es solo matemática.',
      msgEmpty: 'Primero introduce un número.',
      msgInvalid: 'Introduce un número entero, 1 o mayor.',
      msgTooLargeBalanced: 'Ese número es demasiado grande para el modo Equilibrado — prueba algo por debajo de 1.000.000, o cambia al modo Clásico para números más grandes.',
      msgTooLargeClassic: 'Ese número es demasiado grande para este pequeño árbol — prueba algo por debajo de 1 billón.',
      msgOne: '1 no es ni primo ni compuesto — es solo una semilla, aún no un árbol. 🌱',
      msgPrime: '{n} es primo — solo se divide una vez, en 1 × {n}.',
      msgFactors: '{n} se descompone en {count} factores primos.',
      chipPrime: '{n} (primo)'
    },
    it: {
      title: 'Albero dei fattori primi',
      heading: '🎄 Albero dei fattori primi 🎄',
      subtitle: 'Dagli un numero — fa crescere un vero albero dei fattori, ramo per ramo.',
      modeLabel: 'Modalità albero',
      modeClassic: 'Classica',
      modeBalanced: 'Bilanciata',
      placeholder: 'es. 60',
      grow: 'Fai crescere l’albero',
      footnote: 'Ogni foglia prima riceve un’ultima scissione tutta sua: P = P × 1.',
      balancedNote: 'La modalità bilanciata usa il metodo di Fermat per trovare la coppia di fattori più equamente divisa a ogni passo, limitata a numeri sotto 1.000.000 per restare istantanea. Alcuni numeri — come un piccolo numero primo moltiplicato per uno grande — si dividono comunque in modo disuguale; non è un errore, è solo matematica.',
      msgEmpty: 'Inserisci prima un numero.',
      msgInvalid: 'Inserisci un numero intero, 1 o maggiore.',
      msgTooLargeBalanced: 'Quel numero è troppo grande per la modalità Bilanciata — prova qualcosa sotto 1.000.000, o passa alla modalità Classica per numeri più grandi.',
      msgTooLargeClassic: 'Quel numero è troppo grande per questo piccolo albero — prova qualcosa sotto 1 bilione.',
      msgOne: '1 non è né primo né composto — è solo un seme, non ancora un albero. 🌱',
      msgPrime: '{n} è primo — si divide solo una volta, in 1 × {n}.',
      msgFactors: '{n} si scompone in {count} fattori primi.',
      chipPrime: '{n} (primo)'
    }
  });
})();
