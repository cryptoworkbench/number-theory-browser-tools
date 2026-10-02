/* assets/i18n/euclidean-algorithm.js — the 'euclid' namespace: title,
   eyebrow, heading, lede, the cross-link text, the seven preset chips,
   the Run button, the extended-method toggle label, every validation
   message, the swap note, the banner (incl. a plural "done" message), the
   zero-step chain note, the extended-caption, the two geometric-view
   toggle labels, both SVG default aria-labels, both steps' captions and
   their capped-tile notes (each plural on the quotient's own one/other —
   or for Polish, one/few/many/other — category), the nested view's
   empty/capped messages and its own capped-note, the nested tile's
   tooltip title, and the closing caption, for the Euclidean Algorithm
   tool, in all seven supported languages.

   Classic script, IIFE, "use strict" — its only statement is
   NT.i18n.register(...). "gcd(a, b)" as a function-call notation stays
   literal in every language per 06-GLOSSARY.md section (e); "the GCD" as
   a standalone prose noun is localized to each language's own
   abbreviation (ggd/gcd/ggT/PGCD/mcd/NWD) per the glossary's core-term
   table (row 6, greatest common divisor). Play/Pause, Step, Instant,
   Reset and Speed live in the shared `common` namespace
   (assets/i18n/site.js), never duplicated here. Placeholder names ({a},
   {b}, {A}, {B}, {q}, {r}, {n}, {max}, {index}, {total}, {cap}, {rest},
   {step}, {extra}, {stepNums}, {gcd}, {lastB}) are identical across all
   seven languages. Must load after assets/nt-i18n.js and
   assets/i18n/site.js, before the page's own inline <script>.
*/
(function () {
  "use strict";

  NT.i18n.register('euclid', {
    nl: {
      title: 'Algoritme van Euclides',
      eyebrow: 'getaltheorie · algoritme van euclides',
      heading: 'Algoritme van Euclides',
      lede: 'Vervang het paar (a, b) herhaaldelijk door (b, a mod b) — deel de grootste door de kleinste en houd alleen de rest over — en het paar wordt elke stap kleiner. Zodra één kant nul bereikt, is de andere kant de grootste gemene deler van de twee getallen waarmee je begon.',
      xref: 'Diezelfde ggd is ook te zien als de priemfactoren die de twee getallen delen →',
      chipFiveSteps: '240, 46 · 5 stappen',
      chipCoprime: '35, 18 · onderling ondeelbaar',
      chipBDividesA: '144, 12 · b deelt a',
      chipEqualPair: '36, 36 · gelijk paar',
      chipAlreadyDone: '17, 0 · al klaar',
      chipFibonacciWorst: '89, 55 · ergste geval van Fibonacci',
      chipHugeQuotient: '500000, 2 · enorm quotiënt',
      run: 'Start',
      extToggleLabel: 'Uitgebreide Euclidische modus — toon de Bézout-coëfficiënten {0} en {1}',
      errBothWhole: 'Zowel a als b moeten gehele getallen zijn.',
      errBothNonNegative: 'Zowel a als b moeten nul of positief zijn — negatieve getallen hebben hier geen gedefinieerde ggd.',
      errGcdZeroZero: 'gcd(0, 0) is niet gedefinieerd — voer minstens één waarde ongelijk aan nul in.',
      errClamped: 'Invoer is beperkt tot {max} — de grotere waarde is verlaagd om te passen.',
      swapNote: 'De grootste waarde gaat voor: ingevoerd als ({a}, {b}), getraceerd als gcd({A}, {B}) — de ggd is symmetrisch in zijn argumenten.',
      bannerReady: 'Klaar — druk op Afspelen om de afleiding regel voor regel te zien opbouwen.',
      bannerDone: { one: 'Klaar — {n} stap om tot de ggd te komen.', other: 'Klaar — {n} stappen om tot de ggd te komen.' },
      chainNoteZero: 'b is al 0, dus er is niets meer te delen — a is al de grootste gemene deler.',
      extCaption: 'De {0} en {1} van elke regel drukken de rest van die regel uit als een combinatie van de twee oorspronkelijke invoerwaarden — {2}.',
      viewNested: 'Geneste vierkanten',
      geomViewGroupLabel: 'Geometrische weergavemodus',
      viewStep: 'Enkele stap',
      tileAriaDefault: 'Rechthoekweergave van de huidige delingsstap',
      nestedAriaDefault: 'Alle delingsstappen genest in één rechthoek',
      caption: 'Opeenvolgende Fibonacci-getallen zijn het ergste geval voor dit algoritme — ze dwingen voor hun grootte het meeste aantal delingsstappen af.',
      tileCaptionExact: {
        one: 'Stap {index} van {total}: {a} ÷ {b}: de rechthoek wordt exact betegeld met {q} vierkant met zijde {b} — geen rest, dus {b} is de grootste gemene deler.',
        other: 'Stap {index} van {total}: {a} ÷ {b}: de rechthoek wordt exact betegeld met {q} vierkanten met zijde {b} — geen rest, dus {b} is de grootste gemene deler.'
      },
      tileCaptionLeftover: {
        one: 'Stap {index} van {total}: {a} = {q}×{b} + {r}: {q} vierkant met zijde {b} past, met een rest van {b}×{r}.',
        other: 'Stap {index} van {total}: {a} = {q}×{b} + {r}: {q} vierkanten met zijde {b} passen, met een rest van {b}×{r}.'
      },
      tileNoteCapped: 'Het werkelijke quotiënt is {q} — alleen de eerste {cap} vierkanten worden hier getekend; de resterende {rest} zijn samengevoegd in de gelabelde tegel, dus de getekende breedte is niet op schaal.',
      nestedEmptyMessage: 'Er is geen rechthoek om te nesten — b is al 0, dus het algoritme is al klaar.',
      nestedCaption: {
        one: 'gcd({A}, {B}) = {gcd}: alle {n} stap nest in één {A}×{B}-rechthoek — de kleinste, {lastB}×{lastB} vierkanten zijn de grootste gemene deler. Klik op een vierkant (of een stap hierboven) om te zien hoe ze op elkaar aansluiten.',
        other: 'gcd({A}, {B}) = {gcd}: alle {n} stappen nesten in één {A}×{B}-rechthoek — de kleinste, {lastB}×{lastB} vierkanten zijn de grootste gemene deler. Klik op een vierkant (of een stap hierboven) om te zien hoe ze op elkaar aansluiten.'
      },
      nestedNoteCapped: {
        one: 'Stap {stepNums} heeft een zeer groot quotiënt — alleen de eerste {cap} vierkanten worden daar getekend, samengevoegd in een gestippelde tegel, dus dit diagram is bij die stap niet volledig op schaal.',
        other: 'Stappen {stepNums} hebben een zeer groot quotiënt — alleen de eerste {cap} vierkanten worden daar getekend, samengevoegd in een gestippelde tegel, dus dit diagram is bij die stappen niet volledig op schaal.'
      },
      nestedTileTitle: 'Stap {step}: {a} = {q}·{b} + {r}',
      nestedTileTitleCapped: 'Stap {step}: {a} = {q}·{b} + {r} ({extra} extra vierkanten hier samengevoegd)',
      tileEmptyMessage: 'Er is geen rechthoek om te snijden — b is al 0, dus het algoritme is al klaar.'
    },
    en: {
      title: 'Euclidean Algorithm',
      eyebrow: 'number theory · euclidean algorithm',
      heading: 'Euclidean Algorithm',
      lede: 'Repeatedly replace the pair (a, b) with (b, a mod b) — divide the larger by the smaller and keep only the remainder — and the pair shrinks every step. The moment one side reaches zero, the other side is the greatest common divisor of the two numbers you started with.',
      xref: 'The same GCD can also be seen as the primes the two numbers share →',
      chipFiveSteps: '240, 46 · 5 steps',
      chipCoprime: '35, 18 · coprime',
      chipBDividesA: '144, 12 · b divides a',
      chipEqualPair: '36, 36 · equal pair',
      chipAlreadyDone: '17, 0 · already done',
      chipFibonacciWorst: '89, 55 · Fibonacci worst case',
      chipHugeQuotient: '500000, 2 · huge quotient',
      run: 'Run',
      extToggleLabel: 'Extended Euclidean mode — show the Bézout coefficients {0} and {1}',
      errBothWhole: 'Both a and b must be whole numbers.',
      errBothNonNegative: 'Both a and b must be zero or positive — negative numbers have no defined GCD here.',
      errGcdZeroZero: 'gcd(0, 0) is undefined — enter at least one nonzero value.',
      errClamped: 'Inputs are capped at {max} — the larger value was clamped down to fit.',
      swapNote: 'The larger value leads: entered as ({a}, {b}), traced as gcd({A}, {B}) — the GCD is symmetric in its arguments.',
      bannerReady: 'Ready — press Play to watch the derivation build one line at a time.',
      bannerDone: { one: 'Done — {n} step to reach the GCD.', other: 'Done — {n} steps to reach the GCD.' },
      chainNoteZero: 'b is already 0, so there is nothing left to divide — a is already the greatest common divisor.',
      extCaption: "Each line's {0} and {1} express that line's remainder as a combination of the two original inputs — {2}.",
      viewNested: 'Nested squares',
      geomViewGroupLabel: 'Geometric view mode',
      viewStep: 'Single step',
      tileAriaDefault: 'Rectangle view of the current division step',
      nestedAriaDefault: 'All division steps nested into a single rectangle',
      caption: 'Consecutive Fibonacci numbers are the worst case for this algorithm — they force the most division steps for their size.',
      tileCaptionExact: {
        one: 'Step {index} of {total}: {a} ÷ {b}: the rectangle tiles exactly with {q} square of side {b} — no leftover, so {b} is the greatest common divisor.',
        other: 'Step {index} of {total}: {a} ÷ {b}: the rectangle tiles exactly with {q} squares of side {b} — no leftover, so {b} is the greatest common divisor.'
      },
      tileCaptionLeftover: {
        one: 'Step {index} of {total}: {a} = {q}×{b} + {r}: {q} square of side {b} fits, leaving a {b}×{r} leftover.',
        other: 'Step {index} of {total}: {a} = {q}×{b} + {r}: {q} squares of side {b} fit, leaving a {b}×{r} leftover.'
      },
      tileNoteCapped: 'The true quotient is {q} — only the first {cap} squares are drawn here; the remaining {rest} are collapsed into the labelled tile, so the drawn width is not to scale.',
      nestedEmptyMessage: 'There is no rectangle to nest — b is already 0, so the algorithm is already done.',
      nestedCaption: {
        one: 'gcd({A}, {B}) = {gcd}: all {n} step nest into one {A}×{B} rectangle — the smallest, {lastB}×{lastB} squares are the greatest common divisor. Click a square (or a step above) to see how they line up.',
        other: 'gcd({A}, {B}) = {gcd}: all {n} steps nest into one {A}×{B} rectangle — the smallest, {lastB}×{lastB} squares are the greatest common divisor. Click a square (or a step above) to see how they line up.'
      },
      nestedNoteCapped: {
        one: 'Step {stepNums} has a very large quotient — only the first {cap} squares are drawn there, collapsed into a dashed tile, so this diagram is not fully to scale at that step.',
        other: 'Steps {stepNums} have a very large quotient — only the first {cap} squares are drawn there, collapsed into a dashed tile, so this diagram is not fully to scale at those steps.'
      },
      nestedTileTitle: 'Step {step}: {a} = {q}·{b} + {r}',
      nestedTileTitleCapped: 'Step {step}: {a} = {q}·{b} + {r} ({extra} more squares collapsed here)',
      tileEmptyMessage: 'There is no rectangle to cut — b is already 0, so the algorithm is already done.'
    },
    de: {
      title: 'Euklidischer Algorithmus',
      eyebrow: 'zahlentheorie · euklidischer algorithmus',
      heading: 'Euklidischer Algorithmus',
      lede: 'Ersetze das Paar (a, b) wiederholt durch (b, a mod b) — teile die größere Zahl durch die kleinere und behalte nur den Rest — und das Paar wird mit jedem Schritt kleiner. Sobald eine Seite null erreicht, ist die andere Seite der größte gemeinsame Teiler der beiden Zahlen, mit denen du begonnen hast.',
      xref: 'Derselbe ggT lässt sich auch als die Primfaktoren sehen, die sich die beiden Zahlen teilen →',
      chipFiveSteps: '240, 46 · 5 Schritte',
      chipCoprime: '35, 18 · teilerfremd',
      chipBDividesA: '144, 12 · b teilt a',
      chipEqualPair: '36, 36 · gleiches Paar',
      chipAlreadyDone: '17, 0 · bereits fertig',
      chipFibonacciWorst: '89, 55 · Fibonacci-Worst-Case',
      chipHugeQuotient: '500000, 2 · riesiger Quotient',
      run: 'Starten',
      extToggleLabel: 'Erweiterter euklidischer Modus — zeige die Bézout-Koeffizienten {0} und {1}',
      errBothWhole: 'Sowohl a als auch b müssen ganze Zahlen sein.',
      errBothNonNegative: 'Sowohl a als auch b müssen null oder positiv sein — negative Zahlen haben hier keinen definierten ggT.',
      errGcdZeroZero: 'gcd(0, 0) ist nicht definiert — gib mindestens einen Wert ungleich null ein.',
      errClamped: 'Eingaben sind auf {max} begrenzt — der größere Wert wurde entsprechend verkleinert.',
      swapNote: 'Der größere Wert führt: eingegeben als ({a}, {b}), verfolgt als gcd({A}, {B}) — der ggT ist symmetrisch in seinen Argumenten.',
      bannerReady: 'Bereit — drücke Abspielen, um die Herleitung Zeile für Zeile aufbauen zu sehen.',
      bannerDone: { one: 'Fertig — {n} Schritt, um den ggT zu erreichen.', other: 'Fertig — {n} Schritte, um den ggT zu erreichen.' },
      chainNoteZero: 'b ist bereits 0, also gibt es nichts mehr zu teilen — a ist bereits der größte gemeinsame Teiler.',
      extCaption: '{0} und {1} jeder Zeile drücken den Rest dieser Zeile als Kombination der beiden ursprünglichen Eingaben aus — {2}.',
      viewNested: 'Verschachtelte Quadrate',
      geomViewGroupLabel: 'Geometrischer Ansichtsmodus',
      viewStep: 'Einzelner Schritt',
      tileAriaDefault: 'Rechteckansicht des aktuellen Divisionsschritts',
      nestedAriaDefault: 'Alle Divisionsschritte in einem einzigen Rechteck verschachtelt',
      caption: 'Aufeinanderfolgende Fibonacci-Zahlen sind der schlimmste Fall für diesen Algorithmus — sie erzwingen für ihre Größe die meisten Divisionsschritte.',
      tileCaptionExact: {
        one: 'Schritt {index} von {total}: {a} ÷ {b}: Das Rechteck wird exakt mit {q} Quadrat der Seitenlänge {b} gekachelt — kein Rest, also ist {b} der größte gemeinsame Teiler.',
        other: 'Schritt {index} von {total}: {a} ÷ {b}: Das Rechteck wird exakt mit {q} Quadraten der Seitenlänge {b} gekachelt — kein Rest, also ist {b} der größte gemeinsame Teiler.'
      },
      tileCaptionLeftover: {
        one: 'Schritt {index} von {total}: {a} = {q}×{b} + {r}: {q} Quadrat der Seitenlänge {b} passt, es bleibt ein Rest von {b}×{r}.',
        other: 'Schritt {index} von {total}: {a} = {q}×{b} + {r}: {q} Quadrate der Seitenlänge {b} passen, es bleibt ein Rest von {b}×{r}.'
      },
      tileNoteCapped: 'Der tatsächliche Quotient ist {q} — nur die ersten {cap} Quadrate werden hier gezeichnet; die restlichen {rest} sind in die beschriftete Kachel zusammengefasst, daher ist die gezeichnete Breite nicht maßstabsgetreu.',
      nestedEmptyMessage: 'Es gibt kein Rechteck zum Verschachteln — b ist bereits 0, also ist der Algorithmus bereits fertig.',
      nestedCaption: {
        one: 'gcd({A}, {B}) = {gcd}: Alle {n} Schritt verschachteln sich in ein einziges {A}×{B}-Rechteck — die kleinsten, {lastB}×{lastB}-Quadrate sind der größte gemeinsame Teiler. Klicke auf ein Quadrat (oder einen Schritt oben), um zu sehen, wie sie zusammenpassen.',
        other: 'gcd({A}, {B}) = {gcd}: Alle {n} Schritte verschachteln sich in ein einziges {A}×{B}-Rechteck — die kleinsten, {lastB}×{lastB}-Quadrate sind der größte gemeinsame Teiler. Klicke auf ein Quadrat (oder einen Schritt oben), um zu sehen, wie sie zusammenpassen.'
      },
      nestedNoteCapped: {
        one: 'Schritt {stepNums} hat einen sehr großen Quotienten — dort werden nur die ersten {cap} Quadrate gezeichnet, zusammengefasst in eine gestrichelte Kachel, daher ist dieses Diagramm bei diesem Schritt nicht vollständig maßstabsgetreu.',
        other: 'Schritte {stepNums} haben einen sehr großen Quotienten — dort werden nur die ersten {cap} Quadrate gezeichnet, zusammengefasst in eine gestrichelte Kachel, daher ist dieses Diagramm bei diesen Schritten nicht vollständig maßstabsgetreu.'
      },
      nestedTileTitle: 'Schritt {step}: {a} = {q}·{b} + {r}',
      nestedTileTitleCapped: 'Schritt {step}: {a} = {q}·{b} + {r} ({extra} weitere Quadrate hier zusammengefasst)',
      tileEmptyMessage: 'Es gibt kein Rechteck zum Schneiden — b ist bereits 0, also ist der Algorithmus bereits fertig.'
    },
    fr: {
      title: "Algorithme d'Euclide",
      eyebrow: "théorie des nombres · algorithme d'euclide",
      heading: "Algorithme d'Euclide",
      lede: "Remplacez de façon répétée la paire (a, b) par (b, a mod b) — divisez le plus grand par le plus petit et ne gardez que le reste — et la paire se réduit à chaque étape. Dès qu'un côté atteint zéro, l'autre côté est le plus grand commun diviseur des deux nombres de départ.",
      xref: 'Le même PGCD peut aussi se voir comme les facteurs premiers que les deux nombres partagent →',
      chipFiveSteps: '240, 46 · 5 étapes',
      chipCoprime: '35, 18 · premiers entre eux',
      chipBDividesA: '144, 12 · b divise a',
      chipEqualPair: '36, 36 · paire égale',
      chipAlreadyDone: '17, 0 · déjà terminé',
      chipFibonacciWorst: '89, 55 · pire cas de Fibonacci',
      chipHugeQuotient: '500000, 2 · quotient énorme',
      run: 'Exécuter',
      extToggleLabel: "Mode d'Euclide étendu — affichez les coefficients de Bézout {0} et {1}",
      errBothWhole: 'a et b doivent tous deux être des nombres entiers.',
      errBothNonNegative: "a et b doivent tous deux être nuls ou positifs — les nombres négatifs n'ont pas de PGCD défini ici.",
      errGcdZeroZero: "gcd(0, 0) n'est pas défini — entrez au moins une valeur non nulle.",
      errClamped: 'Les entrées sont limitées à {max} — la valeur la plus grande a été réduite pour correspondre.',
      swapNote: 'La plus grande valeur passe en tête : saisie comme ({a}, {b}), tracée comme gcd({A}, {B}) — le PGCD est symétrique dans ses arguments.',
      bannerReady: 'Prêt — appuyez sur Lecture pour regarder la dérivation se construire ligne par ligne.',
      bannerDone: { one: 'Terminé — {n} étape pour atteindre le PGCD.', other: 'Terminé — {n} étapes pour atteindre le PGCD.' },
      chainNoteZero: "b est déjà 0, il n'y a donc plus rien à diviser — a est déjà le plus grand commun diviseur.",
      extCaption: "Les {0} et {1} de chaque ligne expriment le reste de cette ligne comme une combinaison des deux entrées d'origine — {2}.",
      viewNested: 'Carrés imbriqués',
      geomViewGroupLabel: 'Mode de vue géométrique',
      viewStep: 'Étape unique',
      tileAriaDefault: "Vue en rectangle de l'étape de division actuelle",
      nestedAriaDefault: 'Toutes les étapes de division imbriquées dans un seul rectangle',
      caption: "Les nombres de Fibonacci consécutifs sont le pire cas pour cet algorithme — ils imposent le plus grand nombre d'étapes de division pour leur taille.",
      tileCaptionExact: {
        one: 'Étape {index} sur {total} : {a} ÷ {b} : le rectangle se pave exactement avec {q} carré de côté {b} — pas de reste, donc {b} est le plus grand commun diviseur.',
        other: 'Étape {index} sur {total} : {a} ÷ {b} : le rectangle se pave exactement avec {q} carrés de côté {b} — pas de reste, donc {b} est le plus grand commun diviseur.'
      },
      tileCaptionLeftover: {
        one: 'Étape {index} sur {total} : {a} = {q}×{b} + {r} : {q} carré de côté {b} tient, laissant un reste de {b}×{r}.',
        other: 'Étape {index} sur {total} : {a} = {q}×{b} + {r} : {q} carrés de côté {b} tiennent, laissant un reste de {b}×{r}.'
      },
      tileNoteCapped: "Le véritable quotient est {q} — seuls les {cap} premiers carrés sont dessinés ici ; les {rest} restants sont regroupés dans la tuile étiquetée, donc la largeur dessinée n'est pas à l'échelle.",
      nestedEmptyMessage: "Il n'y a pas de rectangle à imbriquer — b est déjà 0, l'algorithme est donc déjà terminé.",
      nestedCaption: {
        one: "gcd({A}, {B}) = {gcd} : les {n} étape s'imbrique en un seul rectangle {A}×{B} — les plus petits carrés, {lastB}×{lastB}, sont le plus grand commun diviseur. Cliquez sur un carré (ou une étape ci-dessus) pour voir comment ils s'alignent.",
        other: "gcd({A}, {B}) = {gcd} : les {n} étapes s'imbriquent en un seul rectangle {A}×{B} — les plus petits carrés, {lastB}×{lastB}, sont le plus grand commun diviseur. Cliquez sur un carré (ou une étape ci-dessus) pour voir comment ils s'alignent."
      },
      nestedNoteCapped: {
        one: "L'étape {stepNums} a un quotient très grand — seuls les {cap} premiers carrés y sont dessinés, regroupés dans une tuile en pointillés, donc ce diagramme n'est pas entièrement à l'échelle à cette étape.",
        other: "Les étapes {stepNums} ont un quotient très grand — seuls les {cap} premiers carrés y sont dessinés, regroupés dans une tuile en pointillés, donc ce diagramme n'est pas entièrement à l'échelle à ces étapes."
      },
      nestedTileTitle: 'Étape {step} : {a} = {q}·{b} + {r}',
      nestedTileTitleCapped: 'Étape {step} : {a} = {q}·{b} + {r} ({extra} carrés supplémentaires regroupés ici)',
      tileEmptyMessage: "Il n'y a pas de rectangle à découper — b est déjà 0, l'algorithme est donc déjà terminé."
    },
    es: {
      title: 'Algoritmo de Euclides',
      eyebrow: 'teoría de números · algoritmo de euclides',
      heading: 'Algoritmo de Euclides',
      lede: 'Sustituye repetidamente el par (a, b) por (b, a mod b) — divide el mayor entre el menor y conserva solo el resto — y el par se reduce en cada paso. En el momento en que un lado llega a cero, el otro lado es el máximo común divisor de los dos números con los que empezaste.',
      xref: 'El mismo mcd también puede verse como los factores primos que comparten los dos números →',
      chipFiveSteps: '240, 46 · 5 pasos',
      chipCoprime: '35, 18 · coprimos',
      chipBDividesA: '144, 12 · b es divisor de a',
      chipEqualPair: '36, 36 · par igual',
      chipAlreadyDone: '17, 0 · ya terminado',
      chipFibonacciWorst: '89, 55 · peor caso de Fibonacci',
      chipHugeQuotient: '500000, 2 · cociente enorme',
      run: 'Ejecutar',
      extToggleLabel: 'Modo de Euclides extendido — muestra los coeficientes de Bézout {0} y {1}',
      errBothWhole: 'Tanto a como b deben ser números enteros.',
      errBothNonNegative: 'Tanto a como b deben ser cero o positivos — los números negativos no tienen un mcd definido aquí.',
      errGcdZeroZero: 'gcd(0, 0) no está definido — introduce al menos un valor distinto de cero.',
      errClamped: 'Las entradas están limitadas a {max} — el valor mayor se redujo para ajustarse.',
      swapNote: 'El valor mayor va primero: introducido como ({a}, {b}), trazado como gcd({A}, {B}) — el mcd es simétrico en sus argumentos.',
      bannerReady: 'Listo — pulsa Reproducir para ver cómo la derivación se construye línea por línea.',
      bannerDone: { one: 'Listo — {n} paso para llegar al mcd.', other: 'Listo — {n} pasos para llegar al mcd.' },
      chainNoteZero: 'b ya es 0, así que no queda nada que dividir — a ya es el máximo común divisor.',
      extCaption: 'Los {0} y {1} de cada línea expresan el resto de esa línea como una combinación de las dos entradas originales — {2}.',
      viewNested: 'Cuadrados anidados',
      geomViewGroupLabel: 'Modo de vista geométrica',
      viewStep: 'Paso único',
      tileAriaDefault: 'Vista en rectángulo del paso de división actual',
      nestedAriaDefault: 'Todos los pasos de división anidados en un único rectángulo',
      caption: 'Los números de Fibonacci consecutivos son el peor caso para este algoritmo — exigen el mayor número de pasos de división para su tamaño.',
      tileCaptionExact: {
        one: 'Paso {index} de {total}: {a} ÷ {b}: el rectángulo se cubre exactamente con {q} cuadrado de lado {b} — sin sobrante, así que {b} es el máximo común divisor.',
        other: 'Paso {index} de {total}: {a} ÷ {b}: el rectángulo se cubre exactamente con {q} cuadrados de lado {b} — sin sobrante, así que {b} es el máximo común divisor.'
      },
      tileCaptionLeftover: {
        one: 'Paso {index} de {total}: {a} = {q}×{b} + {r}: cabe {q} cuadrado de lado {b}, dejando un sobrante de {b}×{r}.',
        other: 'Paso {index} de {total}: {a} = {q}×{b} + {r}: caben {q} cuadrados de lado {b}, dejando un sobrante de {b}×{r}.'
      },
      tileNoteCapped: 'El cociente real es {q} — aquí solo se dibujan los primeros {cap} cuadrados; los {rest} restantes se agrupan en la casilla etiquetada, así que el ancho dibujado no está a escala.',
      nestedEmptyMessage: 'No hay rectángulo que anidar — b ya es 0, así que el algoritmo ya ha terminado.',
      nestedCaption: {
        one: 'gcd({A}, {B}) = {gcd}: el {n} paso se anida en un único rectángulo {A}×{B} — los cuadrados más pequeños, {lastB}×{lastB}, son el máximo común divisor. Haz clic en un cuadrado (o en un paso de arriba) para ver cómo se alinean.',
        other: 'gcd({A}, {B}) = {gcd}: los {n} pasos se anidan en un único rectángulo {A}×{B} — los cuadrados más pequeños, {lastB}×{lastB}, son el máximo común divisor. Haz clic en un cuadrado (o en un paso de arriba) para ver cómo se alinean.'
      },
      nestedNoteCapped: {
        one: 'El paso {stepNums} tiene un cociente muy grande — allí solo se dibujan los primeros {cap} cuadrados, agrupados en una casilla discontinua, así que este diagrama no está totalmente a escala en ese paso.',
        other: 'Los pasos {stepNums} tienen un cociente muy grande — allí solo se dibujan los primeros {cap} cuadrados, agrupados en una casilla discontinua, así que este diagrama no está totalmente a escala en esos pasos.'
      },
      nestedTileTitle: 'Paso {step}: {a} = {q}·{b} + {r}',
      nestedTileTitleCapped: 'Paso {step}: {a} = {q}·{b} + {r} ({extra} cuadrados más agrupados aquí)',
      tileEmptyMessage: 'No hay rectángulo que cortar — b ya es 0, así que el algoritmo ya ha terminado.'
    },
    it: {
      title: 'Algoritmo di Euclide',
      eyebrow: 'teoria dei numeri · algoritmo di euclide',
      heading: 'Algoritmo di Euclide',
      lede: 'Sostituisci ripetutamente la coppia (a, b) con (b, a mod b) — dividi il numero più grande per il più piccolo e conserva solo il resto — e la coppia si riduce a ogni passo. Nel momento in cui un lato raggiunge zero, l’altro lato è il massimo comun divisore dei due numeri di partenza.',
      xref: 'Lo stesso MCD si può vedere anche come i fattori primi che i due numeri condividono →',
      chipFiveSteps: '240, 46 · 5 passi',
      chipCoprime: '35, 18 · coprimi',
      chipBDividesA: '144, 12 · b divide a',
      chipEqualPair: '36, 36 · coppia uguale',
      chipAlreadyDone: '17, 0 · già fatto',
      chipFibonacciWorst: '89, 55 · caso peggiore di Fibonacci',
      chipHugeQuotient: '500000, 2 · quoziente enorme',
      run: 'Avvia',
      extToggleLabel: 'Modalità euclidea estesa — mostra i coefficienti di Bézout {0} e {1}',
      errBothWhole: 'Sia a che b devono essere numeri interi.',
      errBothNonNegative: 'Sia a che b devono essere zero o positivi — i numeri negativi non hanno un MCD definito qui.',
      errGcdZeroZero: 'gcd(0, 0) non è definito — inserisci almeno un valore diverso da zero.',
      errClamped: 'Gli input sono limitati a {max} — il valore più grande è stato ridotto per adattarsi.',
      swapNote: 'Il valore più grande viene prima: inserito come ({a}, {b}), tracciato come gcd({A}, {B}) — il MCD è simmetrico nei suoi argomenti.',
      bannerReady: 'Pronto — premi Riproduci per vedere la derivazione costruirsi riga per riga.',
      bannerDone: { one: 'Fatto — {n} passo per arrivare al MCD.', other: 'Fatto — {n} passi per arrivare al MCD.' },
      chainNoteZero: 'b è già 0, quindi non resta nulla da dividere — a è già il massimo comun divisore.',
      extCaption: '{0} e {1} di ogni riga esprimono il resto di quella riga come combinazione dei due input originali — {2}.',
      viewNested: 'Quadrati annidati',
      geomViewGroupLabel: 'Modalità di visualizzazione geometrica',
      viewStep: 'Passo singolo',
      tileAriaDefault: 'Vista rettangolare del passo di divisione attuale',
      nestedAriaDefault: 'Tutti i passi di divisione annidati in un unico rettangolo',
      caption: 'I numeri di Fibonacci consecutivi sono il caso peggiore per questo algoritmo — impongono il maggior numero di passi di divisione per la loro dimensione.',
      tileCaptionExact: {
        one: 'Passo {index} di {total}: {a} ÷ {b}: il rettangolo si copre esattamente con {q} quadrato di lato {b} — nessun resto, quindi {b} è il massimo comun divisore.',
        other: 'Passo {index} di {total}: {a} ÷ {b}: il rettangolo si copre esattamente con {q} quadrati di lato {b} — nessun resto, quindi {b} è il massimo comun divisore.'
      },
      tileCaptionLeftover: {
        one: 'Passo {index} di {total}: {a} = {q}×{b} + {r}: entra {q} quadrato di lato {b}, con un resto di {b}×{r}.',
        other: 'Passo {index} di {total}: {a} = {q}×{b} + {r}: entrano {q} quadrati di lato {b}, con un resto di {b}×{r}.'
      },
      tileNoteCapped: 'Il quoziente reale è {q} — qui vengono disegnati solo i primi {cap} quadrati; i restanti {rest} sono raggruppati nella tessera etichettata, quindi la larghezza disegnata non è in scala.',
      nestedEmptyMessage: 'Non c’è nessun rettangolo da annidare — b è già 0, quindi l’algoritmo è già terminato.',
      nestedCaption: {
        one: 'gcd({A}, {B}) = {gcd}: il {n} passo si annida in un unico rettangolo {A}×{B} — i quadrati più piccoli, {lastB}×{lastB}, sono il massimo comun divisore. Clicca su un quadrato (o su un passo sopra) per vedere come si allineano.',
        other: 'gcd({A}, {B}) = {gcd}: i {n} passi si annidano in un unico rettangolo {A}×{B} — i quadrati più piccoli, {lastB}×{lastB}, sono il massimo comun divisore. Clicca su un quadrato (o su un passo sopra) per vedere come si allineano.'
      },
      nestedNoteCapped: {
        one: 'Il passo {stepNums} ha un quoziente molto grande — lì vengono disegnati solo i primi {cap} quadrati, raggruppati in una tessera punteggiata, quindi questo diagramma non è completamente in scala a quel passo.',
        other: 'I passi {stepNums} hanno un quoziente molto grande — lì vengono disegnati solo i primi {cap} quadrati, raggruppati in una tessera punteggiata, quindi questo diagramma non è completamente in scala a quei passi.'
      },
      nestedTileTitle: 'Passo {step}: {a} = {q}·{b} + {r}',
      nestedTileTitleCapped: 'Passo {step}: {a} = {q}·{b} + {r} ({extra} quadrati in più raggruppati qui)',
      tileEmptyMessage: 'Non c’è nessun rettangolo da tagliare — b è già 0, quindi l’algoritmo è già terminato.'
    },
    pl: {
      title: 'Algorytm Euklidesa',
      eyebrow: 'teoria liczb · algorytm euklidesa',
      heading: 'Algorytm Euklidesa',
      lede: 'Zastępuj parę (a, b) wielokrotnie parą (b, a mod b) — dziel większą liczbę przez mniejszą i zachowuj tylko resztę — a para zmniejsza się z każdym krokiem. W chwili, gdy jedna strona dojdzie do zera, druga strona jest największym wspólnym dzielnikiem dwóch liczb, od których zacząłeś.',
      xref: 'Ten sam NWD można też zobaczyć jako czynniki pierwsze wspólne dla obu liczb →',
      chipFiveSteps: '240, 46 · 5 kroków',
      chipCoprime: '35, 18 · względnie pierwsze',
      chipBDividesA: '144, 12 · b dzieli a',
      chipEqualPair: '36, 36 · równa para',
      chipAlreadyDone: '17, 0 · już gotowe',
      chipFibonacciWorst: '89, 55 · najgorszy przypadek Fibonacciego',
      chipHugeQuotient: '500000, 2 · ogromny iloraz',
      run: 'Uruchom',
      extToggleLabel: 'Rozszerzony tryb Euklidesa — pokaż współczynniki Bézouta {0} i {1}',
      errBothWhole: 'Zarówno a, jak i b muszą być liczbami całkowitymi.',
      errBothNonNegative: 'Zarówno a, jak i b muszą być zerem lub liczbą dodatnią — liczby ujemne nie mają tu zdefiniowanego NWD.',
      errGcdZeroZero: 'gcd(0, 0) nie jest zdefiniowane — wpisz co najmniej jedną wartość różną od zera.',
      errClamped: 'Dane wejściowe są ograniczone do {max} — większa wartość została zmniejszona, aby się zmieścić.',
      swapNote: 'Większa wartość idzie pierwsza: wpisana jako ({a}, {b}), śledzona jako gcd({A}, {B}) — NWD jest symetryczny względem swoich argumentów.',
      bannerReady: 'Gotowe — naciśnij Odtwórz, aby zobaczyć, jak wyprowadzenie buduje się linia po linii.',
      bannerDone: {
        one: 'Gotowe — {n} krok do uzyskania NWD.',
        few: 'Gotowe — {n} kroki do uzyskania NWD.',
        many: 'Gotowe — {n} kroków do uzyskania NWD.',
        other: 'Gotowe — {n} kroków do uzyskania NWD.'
      },
      chainNoteZero: 'b jest już równe 0, więc nie zostało nic do podzielenia — a jest już największym wspólnym dzielnikiem.',
      extCaption: '{0} i {1} każdej linii wyrażają resztę tej linii jako kombinację dwóch pierwotnych danych wejściowych — {2}.',
      viewNested: 'Zagnieżdżone kwadraty',
      geomViewGroupLabel: 'Tryb widoku geometrycznego',
      viewStep: 'Pojedynczy krok',
      tileAriaDefault: 'Widok prostokąta bieżącego kroku dzielenia',
      nestedAriaDefault: 'Wszystkie kroki dzielenia zagnieżdżone w jednym prostokącie',
      caption: 'Kolejne liczby Fibonacciego są najgorszym przypadkiem dla tego algorytmu — wymuszają największą liczbę kroków dzielenia względem swojej wielkości.',
      tileCaptionExact: {
        one: 'Krok {index} z {total}: {a} ÷ {b}: prostokąt układa się dokładnie w {q} kwadrat o boku {b} — bez reszty, więc {b} to największy wspólny dzielnik.',
        few: 'Krok {index} z {total}: {a} ÷ {b}: prostokąt układa się dokładnie w {q} kwadraty o boku {b} — bez reszty, więc {b} to największy wspólny dzielnik.',
        many: 'Krok {index} z {total}: {a} ÷ {b}: prostokąt układa się dokładnie w {q} kwadratów o boku {b} — bez reszty, więc {b} to największy wspólny dzielnik.',
        other: 'Krok {index} z {total}: {a} ÷ {b}: prostokąt układa się dokładnie w {q} kwadratów o boku {b} — bez reszty, więc {b} to największy wspólny dzielnik.'
      },
      tileCaptionLeftover: {
        one: 'Krok {index} z {total}: {a} = {q}×{b} + {r}: mieści się {q} kwadrat o boku {b}, z resztą {b}×{r}.',
        few: 'Krok {index} z {total}: {a} = {q}×{b} + {r}: mieszczą się {q} kwadraty o boku {b}, z resztą {b}×{r}.',
        many: 'Krok {index} z {total}: {a} = {q}×{b} + {r}: mieści się {q} kwadratów o boku {b}, z resztą {b}×{r}.',
        other: 'Krok {index} z {total}: {a} = {q}×{b} + {r}: mieści się {q} kwadratów o boku {b}, z resztą {b}×{r}.'
      },
      tileNoteCapped: 'Rzeczywisty iloraz to {q} — tutaj narysowano tylko pierwsze {cap} kwadratów; pozostałe {rest} połączono w oznaczoną kafelkę, więc narysowana szerokość nie jest w skali.',
      nestedEmptyMessage: 'Nie ma prostokąta do zagnieżdżenia — b jest już równe 0, więc algorytm jest już zakończony.',
      nestedCaption: {
        one: 'gcd({A}, {B}) = {gcd}: cały {n} krok zagnieżdża się w jednym prostokącie {A}×{B} — najmniejsze kwadraty, {lastB}×{lastB}, to największy wspólny dzielnik. Kliknij kwadrat (lub krok powyżej), aby zobaczyć, jak się układają.',
        few: 'gcd({A}, {B}) = {gcd}: wszystkie {n} kroki zagnieżdżają się w jednym prostokącie {A}×{B} — najmniejsze kwadraty, {lastB}×{lastB}, to największy wspólny dzielnik. Kliknij kwadrat (lub krok powyżej), aby zobaczyć, jak się układają.',
        many: 'gcd({A}, {B}) = {gcd}: wszystkie {n} kroków zagnieżdża się w jednym prostokącie {A}×{B} — najmniejsze kwadraty, {lastB}×{lastB}, to największy wspólny dzielnik. Kliknij kwadrat (lub krok powyżej), aby zobaczyć, jak się układają.',
        other: 'gcd({A}, {B}) = {gcd}: wszystkie {n} kroków zagnieżdża się w jednym prostokącie {A}×{B} — najmniejsze kwadraty, {lastB}×{lastB}, to największy wspólny dzielnik. Kliknij kwadrat (lub krok powyżej), aby zobaczyć, jak się układają.'
      },
      nestedNoteCapped: {
        one: 'Krok {stepNums} ma bardzo duży iloraz — narysowano tam tylko pierwsze {cap} kwadratów, połączone w kafelkę w kropki, więc ten diagram nie jest w pełni w skali przy tym kroku.',
        few: 'Kroki {stepNums} mają bardzo duży iloraz — narysowano tam tylko pierwsze {cap} kwadratów, połączone w kafelkę w kropki, więc ten diagram nie jest w pełni w skali przy tych krokach.',
        many: 'Kroki {stepNums} mają bardzo duży iloraz — narysowano tam tylko pierwsze {cap} kwadratów, połączone w kafelkę w kropki, więc ten diagram nie jest w pełni w skali przy tych krokach.',
        other: 'Kroki {stepNums} mają bardzo duży iloraz — narysowano tam tylko pierwsze {cap} kwadratów, połączone w kafelkę w kropki, więc ten diagram nie jest w pełni w skali przy tych krokach.'
      },
      nestedTileTitle: 'Krok {step}: {a} = {q}·{b} + {r}',
      nestedTileTitleCapped: 'Krok {step}: {a} = {q}·{b} + {r} ({extra} dodatkowych kwadratów połączonych tutaj)',
      tileEmptyMessage: 'Nie ma prostokąta do przecięcia — b jest już równe 0, więc algorytm jest już zakończony.'
    }
  });
})();
