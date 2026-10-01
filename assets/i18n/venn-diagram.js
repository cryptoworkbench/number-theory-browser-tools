/* assets/i18n/venn-diagram.js — the 'venn' namespace: title, eyebrow,
   heading, both ledes, the cross-link text, toolbar/mode/thumbnail labels,
   the prime picker heading/hint, the pane captions and the four diagram
   aria-labels for the Venn Diagram tool's static interface, in all five
   supported languages. Task 2 extends this same register() call with the
   namespace's dynamic (script-produced) keys.

   Classic script, IIFE, "use strict" — its only statement is
   NT.i18n.register(...). Set notation (A \ B, A ∩ B, (A∩B) \ C, A∩B∩C, …)
   inside lede.two/lede.three is language-neutral math and stays literal in
   every language, per 06-GLOSSARY.md section (e). "GCD" as a standalone
   prose noun localizes to each language's own abbreviation (ggd/ggT/PGCD/
   mcd), per the Euclidean Algorithm plan's precedent — distinct from the
   literal gcd(a, b) notation elsewhere on this page, which never changes.
   Must load after assets/nt-i18n.js and assets/i18n/site.js, before the
   page's own inline <script>.
*/
(function () {
  "use strict";

  NT.i18n.register('venn', {
    nl: {
      title: 'Venndiagram',
      heading: 'Venndiagram',
      eyebrow: 'doorsneden & verschillen',
      'lede.two': 'De twee cirkels zijn twee getallen A en B, elk uitgeschreven als zijn priemfactorisatie — alles binnen een cirkel vermenigvuldigt tot dat getal. A ∩ B bevat de priemgetallen die tot beide factorisaties behoren, zodat die doorsnede vermenigvuldigt tot het grootste getal dat beide deelt, terwijl A \\ B en B \\ A de priemgetallen bevatten die tot maar één van de twee behoren.',
      'lede.three': 'De drie cirkels zijn drie getallen, elk uitgeschreven als zijn priemfactorisatie — alles binnen een cirkel vermenigvuldigt tot dat getal. Een priemgetal in (A∩B) \\ C behoort tot A en B maar niet tot C, zodat die hele lens vermenigvuldigt tot A ∩ B; een priemgetal in A∩B∩C behoort tot alle drie tegelijk, zodat het midden vermenigvuldigt tot A ∩ B ∩ C; een priemgetal in A \\ (B ∪ C) behoort alleen tot A.',
      xref: 'Dezelfde ggd kan ook worden berekend door herhaaldelijk te delen →',
      'toolbar.mode': 'Diagrammodus',
      'toolbar.thumbs': 'Hover-miniaturen',
      'mode.two': 'Twee cirkels',
      'mode.three': 'Drie cirkels',
      'thumbs.on': 'Miniaturen aan',
      'thumbs.off': 'Miniaturen uit',
      randomize: 'Willekeurig',
      clearAll: 'Alles wissen',
      'picker.heading': 'Priemkiezer',
      'picker.hint': 'Klik op een priemgetal en klik daarna (of druk op Enter/Spatie) op een regio om het daar te plaatsen.',
      'pane.interactive': 'Interactief diagram',
      'pane.composite': 'Samengestelde getallen per regio',
      'aria.two': 'Twee overlappende cirkels die drie regio’s vormen met priemgetallen',
      'aria.twoComposite': 'Alleen-lezen weergave van het tweecirkeldiagram die het samengestelde getal van elke regio toont, het product van alleen de priemgetallen die in die regio zijn geplaatst',
      'aria.three': 'Drie overlappende cirkels die zeven regio’s vormen met priemgetallen',
      'aria.threeComposite': 'Alleen-lezen weergave van het driecirkeldiagram die het samengestelde getal van elke regio toont, het product van alleen de priemgetallen die in die regio zijn geplaatst'
    },
    en: {
      title: 'Venn Diagram',
      heading: 'Venn Diagram',
      eyebrow: 'intersections & set differences',
      'lede.two': 'The two circles are two numbers A and B, each written out as its prime factorization — everything inside a circle multiplies to that number. A ∩ B holds the primes that belong to both factorizations, so that intersection multiplies out to the largest number dividing both, while A \\ B and B \\ A hold the primes belonging to just one of them.',
      'lede.three': 'The three circles are three numbers, each written out as its prime factorization — everything inside a circle multiplies to that number. A prime in (A∩B) \\ C belongs to A and B but not C, so that whole lens multiplies out to A ∩ B; a prime in A∩B∩C belongs to all three at once, so the centre multiplies out to A ∩ B ∩ C; a prime in A \\ (B ∪ C) belongs to A alone.',
      xref: 'The same GCD can also be computed by repeated division →',
      'toolbar.mode': 'Diagram mode',
      'toolbar.thumbs': 'Hover thumbnails',
      'mode.two': 'Two circles',
      'mode.three': 'Three circles',
      'thumbs.on': 'Thumbnails on',
      'thumbs.off': 'Thumbnails off',
      randomize: 'Randomize',
      clearAll: 'Clear all',
      'picker.heading': 'Prime picker',
      'picker.hint': 'Click a prime, then click (or press Enter/Space on) a region to place it there.',
      'pane.interactive': 'Interactive diagram',
      'pane.composite': 'Region composites',
      'aria.two': 'Two overlapping circles forming three regions holding prime numbers',
      'aria.twoComposite': "Read-only mirror of the two-circle diagram showing each region's composite number, the product of only the primes placed in that region",
      'aria.three': 'Three overlapping circles forming seven regions holding prime numbers',
      'aria.threeComposite': "Read-only mirror of the three-circle diagram showing each region's composite number, the product of only the primes placed in that region"
    },
    de: {
      title: 'Venn-Diagramm',
      heading: 'Venn-Diagramm',
      eyebrow: 'Schnittmengen & Differenzmengen',
      'lede.two': 'Die beiden Kreise sind zwei Zahlen A und B, jeweils ausgeschrieben als ihre Primfaktorzerlegung — alles innerhalb eines Kreises ergibt multipliziert diese Zahl. A ∩ B enthält die Primzahlen, die zu beiden Zerlegungen gehören, sodass diese Schnittmenge multipliziert die größte Zahl ergibt, die beide teilt, während A \\ B und B \\ A die Primzahlen enthalten, die nur zu einer der beiden gehören.',
      'lede.three': 'Die drei Kreise sind drei Zahlen, jeweils ausgeschrieben als ihre Primfaktorzerlegung — alles innerhalb eines Kreises ergibt multipliziert diese Zahl. Eine Primzahl in (A∩B) \\ C gehört zu A und B, aber nicht zu C, sodass diese ganze Linse multipliziert A ∩ B ergibt; eine Primzahl in A∩B∩C gehört zu allen drei gleichzeitig, sodass die Mitte multipliziert A ∩ B ∩ C ergibt; eine Primzahl in A \\ (B ∪ C) gehört allein zu A.',
      xref: 'Derselbe ggT lässt sich auch durch wiederholtes Teilen berechnen →',
      'toolbar.mode': 'Diagrammmodus',
      'toolbar.thumbs': 'Hover-Miniaturen',
      'mode.two': 'Zwei Kreise',
      'mode.three': 'Drei Kreise',
      'thumbs.on': 'Miniaturen an',
      'thumbs.off': 'Miniaturen aus',
      randomize: 'Zufällig',
      clearAll: 'Alles löschen',
      'picker.heading': 'Primzahlenauswahl',
      'picker.hint': 'Klicke auf eine Primzahl und klicke dann auf einen Bereich (oder drücke Enter/Leertaste), um sie dort zu platzieren.',
      'pane.interactive': 'Interaktives Diagramm',
      'pane.composite': 'Zusammengesetzte Zahlen pro Region',
      'aria.two': 'Zwei überlappende Kreise, die drei Bereiche mit Primzahlen bilden',
      'aria.twoComposite': 'Nur lesbare Spiegelung des Zwei-Kreis-Diagramms, die die zusammengesetzte Zahl jeder Region zeigt, das Produkt nur der in dieser Region platzierten Primzahlen',
      'aria.three': 'Drei überlappende Kreise, die sieben Bereiche mit Primzahlen bilden',
      'aria.threeComposite': 'Nur lesbare Spiegelung des Drei-Kreis-Diagramms, die die zusammengesetzte Zahl jeder Region zeigt, das Produkt nur der in dieser Region platzierten Primzahlen'
    },
    fr: {
      title: 'Diagramme de Venn',
      heading: 'Diagramme de Venn',
      eyebrow: 'intersections et différences ensemblistes',
      'lede.two': "Les deux cercles sont deux nombres A et B, chacun écrit sous sa décomposition en facteurs premiers — tout ce qui se trouve à l'intérieur d'un cercle se multiplie pour donner ce nombre. A ∩ B contient les nombres premiers qui appartiennent aux deux décompositions, si bien que cette intersection se multiplie pour donner le plus grand nombre qui divise les deux, tandis que A \\ B et B \\ A contiennent les nombres premiers qui n'appartiennent qu'à l'un des deux.",
      'lede.three': "Les trois cercles sont trois nombres, chacun écrit sous sa décomposition en facteurs premiers — tout ce qui se trouve à l'intérieur d'un cercle se multiplie pour donner ce nombre. Un nombre premier dans (A∩B) \\ C appartient à A et B mais pas à C, si bien que toute cette lentille se multiplie pour donner A ∩ B ; un nombre premier dans A∩B∩C appartient aux trois à la fois, si bien que le centre se multiplie pour donner A ∩ B ∩ C ; un nombre premier dans A \\ (B ∪ C) n'appartient qu'à A.",
      xref: 'Le même PGCD peut aussi être calculé par divisions répétées →',
      'toolbar.mode': 'Mode du diagramme',
      'toolbar.thumbs': 'Miniatures au survol',
      'mode.two': 'Deux cercles',
      'mode.three': 'Trois cercles',
      'thumbs.on': 'Miniatures activées',
      'thumbs.off': 'Miniatures désactivées',
      randomize: 'Aléatoire',
      clearAll: 'Tout effacer',
      'picker.heading': 'Sélecteur de nombres premiers',
      'picker.hint': "Cliquez sur un nombre premier, puis cliquez sur une région (ou appuyez sur Entrée/Espace) pour l'y placer.",
      'pane.interactive': 'Diagramme interactif',
      'pane.composite': 'Nombres composés par région',
      'aria.two': 'Deux cercles qui se chevauchent, formant trois régions contenant des nombres premiers',
      'aria.twoComposite': 'Reflet en lecture seule du diagramme à deux cercles montrant le nombre composé de chaque région, le produit des seuls nombres premiers placés dans cette région',
      'aria.three': 'Trois cercles qui se chevauchent, formant sept régions contenant des nombres premiers',
      'aria.threeComposite': 'Reflet en lecture seule du diagramme à trois cercles montrant le nombre composé de chaque région, le produit des seuls nombres premiers placés dans cette région'
    },
    es: {
      title: 'Diagrama de Venn',
      heading: 'Diagrama de Venn',
      eyebrow: 'intersecciones y diferencias de conjuntos',
      'lede.two': 'Los dos círculos son dos números A y B, cada uno escrito como su factorización en primos — todo lo que hay dentro de un círculo se multiplica para dar ese número. A ∩ B contiene los números primos que pertenecen a ambas factorizaciones, de modo que esa intersección se multiplica para dar el mayor número que divide a los dos, mientras que A \\ B y B \\ A contienen los números primos que pertenecen a solo uno de ellos.',
      'lede.three': 'Los tres círculos son tres números, cada uno escrito como su factorización en primos — todo lo que hay dentro de un círculo se multiplica para dar ese número. Un número primo en (A∩B) \\ C pertenece a A y B pero no a C, de modo que toda esa lente se multiplica para dar A ∩ B; un número primo en A∩B∩C pertenece a los tres a la vez, de modo que el centro se multiplica para dar A ∩ B ∩ C; un número primo en A \\ (B ∪ C) pertenece solo a A.',
      xref: 'El mismo mcd también se puede calcular mediante divisiones repetidas →',
      'toolbar.mode': 'Modo del diagrama',
      'toolbar.thumbs': 'Miniaturas al pasar el cursor',
      'mode.two': 'Dos círculos',
      'mode.three': 'Tres círculos',
      'thumbs.on': 'Miniaturas activadas',
      'thumbs.off': 'Miniaturas desactivadas',
      randomize: 'Aleatorio',
      clearAll: 'Borrar todo',
      'picker.heading': 'Selector de números primos',
      'picker.hint': 'Pulsa un número primo y luego pulsa una región (o presiona Intro/Espacio) para colocarlo allí.',
      'pane.interactive': 'Diagrama interactivo',
      'pane.composite': 'Números compuestos por región',
      'aria.two': 'Dos círculos superpuestos que forman tres regiones con números primos',
      'aria.twoComposite': 'Reflejo de solo lectura del diagrama de dos círculos que muestra el número compuesto de cada región, el producto únicamente de los números primos colocados en esa región',
      'aria.three': 'Tres círculos superpuestos que forman siete regiones con números primos',
      'aria.threeComposite': 'Reflejo de solo lectura del diagrama de tres círculos que muestra el número compuesto de cada región, el producto únicamente de los números primos colocados en esa región'
    }
  });
})();
