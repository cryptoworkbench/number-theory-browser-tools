/* assets/i18n/euclidean-algorithm.js — the 'euclid' namespace: title,
   eyebrow, heading, lede, the cross-link text, the seven preset chips,
   the Run button, the extended-method toggle label, every validation
   message, the swap note, the banner (incl. a plural "done" message), the
   zero-step chain note, the extended-caption, the two geometric-view
   toggle labels, both SVG default aria-labels, both steps' captions and
   their capped-tile notes (each plural on the quotient's own CLDR
   category set for that language), the nested view's
   empty/capped messages and its own capped-note, the nested tile's
   tooltip title, and the closing caption, for the Euclidean Algorithm
   tool, in all nineteen supported languages.

   Classic script, IIFE, "use strict" — its only statement is
   NT.i18n.register(...). "gcd(a, b)" as a function-call notation stays
   literal in every language per 06-GLOSSARY.md section (e); "the GCD" as
   a standalone prose noun is localized to each language's own
   abbreviation (ggd/gcd/ggT/PGCD/mcd/NWD/cmmdc/lnko/LKD/НОД/ΜΚΔ) per the
   glossary's core-term table (row 6, greatest common divisor). Play/Pause,
   Step, Instant, Reset and Speed live in the shared `common` namespace
   (assets/i18n/site.js), never duplicated here. Placeholder names ({a},
   {b}, {A}, {B}, {q}, {r}, {n}, {max}, {index}, {total}, {cap}, {rest},
   {step}, {extra}, {stepNums}, {gcd}, {lastB}) are identical across all
   nineteen languages. Must load after assets/nt-i18n.js and
   assets/i18n/site.js, before the page's own inline <script>.
*/
(function () {
  "use strict";

  NT.i18n.register('euclid', {
    nl: {
      title: 'Algoritme van Euclides',
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
    },
    'pt-BR': {
      title: 'Algoritmo de Euclides',
      heading: 'Algoritmo de Euclides',
      lede: 'Substitua repetidamente o par (a, b) por (b, a mod b) — divida o maior pelo menor e mantenha apenas o resto — e o par encolhe a cada etapa. No momento em que um lado chega a zero, o outro lado é o máximo divisor comum dos dois números com que você começou.',
      xref: 'O mesmo MDC também pode ser visto como os primos que os dois números compartilham →',
      chipFiveSteps: '240, 46 · 5 etapas',
      chipCoprime: '35, 18 · coprimos',
      chipBDividesA: '144, 12 · b divide a',
      chipEqualPair: '36, 36 · par igual',
      chipAlreadyDone: '17, 0 · já feito',
      chipFibonacciWorst: '89, 55 · pior caso de Fibonacci',
      chipHugeQuotient: '500000, 2 · quociente enorme',
      run: 'Execute',
      extToggleLabel: 'Modo euclidiano estendido — mostre os coeficientes de Bézout {0} e {1}',
      errBothWhole: 'Tanto a quanto b devem ser números inteiros.',
      errBothNonNegative: 'Tanto a quanto b devem ser zero ou positivos — números negativos não têm um MDC definido aqui.',
      errGcdZeroZero: 'gcd(0, 0) não é definido — digite pelo menos um valor diferente de zero.',
      errClamped: 'As entradas são limitadas a {max} — o valor maior foi reduzido para se ajustar.',
      swapNote: 'O maior valor vem primeiro: digitado como ({a}, {b}), rastreado como gcd({A}, {B}) — o MDC é simétrico em seus argumentos.',
      bannerReady: 'Pronto — pressione Reproduzir para ver a derivação se construir uma linha por vez.',
      bannerDone: { one: 'Concluído — {n} etapa para chegar ao MDC.', other: 'Concluído — {n} etapas para chegar ao MDC.' },
      chainNoteZero: 'b já é 0, então não há mais nada para dividir — a já é o máximo divisor comum.',
      extCaption: 'O {0} e o {1} de cada linha expressam o resto dessa linha como uma combinação das duas entradas originais — {2}.',
      viewNested: 'Quadrados aninhados',
      geomViewGroupLabel: 'Modo de vista geométrica',
      viewStep: 'Etapa única',
      tileAriaDefault: 'Vista em retângulo da etapa de divisão atual',
      nestedAriaDefault: 'Todas as etapas de divisão aninhadas em um único retângulo',
      caption: 'Números de Fibonacci consecutivos são o pior caso para este algoritmo — eles forçam o maior número de etapas de divisão para seu tamanho.',
      tileCaptionExact: {
        one: 'Etapa {index} de {total}: {a} ÷ {b}: o retângulo se cobre exatamente com {q} quadrado de lado {b} — sem sobra, então {b} é o máximo divisor comum.',
        other: 'Etapa {index} de {total}: {a} ÷ {b}: o retângulo se cobre exatamente com {q} quadrados de lado {b} — sem sobra, então {b} é o máximo divisor comum.'
      },
      tileCaptionLeftover: {
        one: 'Etapa {index} de {total}: {a} = {q}×{b} + {r}: cabe {q} quadrado de lado {b}, deixando uma sobra de {b}×{r}.',
        other: 'Etapa {index} de {total}: {a} = {q}×{b} + {r}: cabem {q} quadrados de lado {b}, deixando uma sobra de {b}×{r}.'
      },
      tileNoteCapped: 'O quociente real é {q} — apenas os primeiros {cap} quadrados são desenhados aqui; os {rest} restantes são agrupados no bloco rotulado, então a largura desenhada não está em escala.',
      nestedEmptyMessage: 'Não há retângulo para aninhar — b já é 0, então o algoritmo já terminou.',
      nestedCaption: {
        one: 'gcd({A}, {B}) = {gcd}: a única {n} etapa se aninha em um retângulo {A}×{B} — os menores quadrados, {lastB}×{lastB}, são o máximo divisor comum. Clique em um quadrado (ou em uma etapa acima) para ver como eles se alinham.',
        other: 'gcd({A}, {B}) = {gcd}: todas as {n} etapas se aninham em um retângulo {A}×{B} — os menores quadrados, {lastB}×{lastB}, são o máximo divisor comum. Clique em um quadrado (ou em uma etapa acima) para ver como eles se alinham.'
      },
      nestedNoteCapped: {
        one: 'A etapa {stepNums} tem um quociente muito grande — ali são desenhados apenas os primeiros {cap} quadrados, agrupados em um bloco pontilhado, então este diagrama não está totalmente em escala nessa etapa.',
        other: 'As etapas {stepNums} têm um quociente muito grande — ali são desenhados apenas os primeiros {cap} quadrados, agrupados em um bloco pontilhado, então este diagrama não está totalmente em escala nessas etapas.'
      },
      nestedTileTitle: 'Etapa {step}: {a} = {q}·{b} + {r}',
      nestedTileTitleCapped: 'Etapa {step}: {a} = {q}·{b} + {r} ({extra} quadrados adicionais agrupados aqui)',
      tileEmptyMessage: 'Não há retângulo para cortar — b já é 0, então o algoritmo já terminou.'
    },
    'pt-PT': {
      title: 'Algoritmo de Euclides',
      heading: 'Algoritmo de Euclides',
      lede: 'Substitui repetidamente o par (a, b) por (b, a mod b) — divide o maior pelo menor e mantém apenas o resto — e o par encolhe a cada etapa. No momento em que um lado chega a zero, o outro lado é o máximo divisor comum dos dois números com que começaste.',
      xref: 'O mesmo m.d.c. também pode ser visto como os primos que os dois números partilham →',
      chipFiveSteps: '240, 46 · 5 etapas',
      chipCoprime: '35, 18 · coprimos',
      chipBDividesA: '144, 12 · b divide a',
      chipEqualPair: '36, 36 · par igual',
      chipAlreadyDone: '17, 0 · já feito',
      chipFibonacciWorst: '89, 55 · pior caso de Fibonacci',
      chipHugeQuotient: '500000, 2 · quociente enorme',
      run: 'Executa',
      extToggleLabel: 'Modo euclidiano estendido — mostra os coeficientes de Bézout {0} e {1}',
      errBothWhole: 'Tanto a como b têm de ser números inteiros.',
      errBothNonNegative: 'Tanto a como b têm de ser zero ou positivos — números negativos não têm um m.d.c. definido aqui.',
      errGcdZeroZero: 'gcd(0, 0) não é definido — introduz pelo menos um valor diferente de zero.',
      errClamped: 'As entradas são limitadas a {max} — o valor maior foi reduzido para se ajustar.',
      swapNote: 'O maior valor vem primeiro: introduzido como ({a}, {b}), seguido como gcd({A}, {B}) — o m.d.c. é simétrico nos seus argumentos.',
      bannerReady: 'Pronto — prime Reproduzir para ver a derivação a construir-se uma linha de cada vez.',
      bannerDone: { one: 'Concluído — {n} etapa para chegar ao m.d.c.', other: 'Concluído — {n} etapas para chegar ao m.d.c.' },
      chainNoteZero: 'b já é 0, portanto não resta nada para dividir — a já é o máximo divisor comum.',
      extCaption: 'O {0} e o {1} de cada linha exprimem o resto dessa linha como uma combinação das duas entradas originais — {2}.',
      viewNested: 'Quadrados aninhados',
      geomViewGroupLabel: 'Modo de vista geométrica',
      viewStep: 'Etapa única',
      tileAriaDefault: 'Vista em retângulo da etapa de divisão atual',
      nestedAriaDefault: 'Todas as etapas de divisão aninhadas num único retângulo',
      caption: 'Números de Fibonacci consecutivos são o pior caso para este algoritmo — forçam o maior número de etapas de divisão para o seu tamanho.',
      tileCaptionExact: {
        one: 'Etapa {index} de {total}: {a} ÷ {b}: o retângulo cobre-se exatamente com {q} quadrado de lado {b} — sem sobra, pelo que {b} é o máximo divisor comum.',
        other: 'Etapa {index} de {total}: {a} ÷ {b}: o retângulo cobre-se exatamente com {q} quadrados de lado {b} — sem sobra, pelo que {b} é o máximo divisor comum.'
      },
      tileCaptionLeftover: {
        one: 'Etapa {index} de {total}: {a} = {q}×{b} + {r}: cabe {q} quadrado de lado {b}, deixando uma sobra de {b}×{r}.',
        other: 'Etapa {index} de {total}: {a} = {q}×{b} + {r}: cabem {q} quadrados de lado {b}, deixando uma sobra de {b}×{r}.'
      },
      tileNoteCapped: 'O quociente real é {q} — apenas os primeiros {cap} quadrados são desenhados aqui; os {rest} restantes são agrupados no bloco rotulado, pelo que a largura desenhada não está à escala.',
      nestedEmptyMessage: 'Não há retângulo para aninhar — b já é 0, pelo que o algoritmo já terminou.',
      nestedCaption: {
        one: 'gcd({A}, {B}) = {gcd}: a única {n} etapa aninha-se num retângulo {A}×{B} — os quadrados mais pequenos, {lastB}×{lastB}, são o máximo divisor comum. Clica num quadrado (ou numa etapa acima) para ver como se alinham.',
        other: 'gcd({A}, {B}) = {gcd}: todas as {n} etapas aninham-se num retângulo {A}×{B} — os quadrados mais pequenos, {lastB}×{lastB}, são o máximo divisor comum. Clica num quadrado (ou numa etapa acima) para ver como se alinham.'
      },
      nestedNoteCapped: {
        one: 'A etapa {stepNums} tem um quociente muito grande — ali são desenhados apenas os primeiros {cap} quadrados, agrupados num bloco pontilhado, pelo que este diagrama não está totalmente à escala nessa etapa.',
        other: 'As etapas {stepNums} têm um quociente muito grande — ali são desenhados apenas os primeiros {cap} quadrados, agrupados num bloco pontilhado, pelo que este diagrama não está totalmente à escala nessas etapas.'
      },
      nestedTileTitle: 'Etapa {step}: {a} = {q}·{b} + {r}',
      nestedTileTitleCapped: 'Etapa {step}: {a} = {q}·{b} + {r} ({extra} quadrados adicionais agrupados aqui)',
      tileEmptyMessage: 'Não há retângulo para cortar — b já é 0, pelo que o algoritmo já terminou.'
    },
    sv: {
      title: 'Euklides algoritm',
      heading: 'Euklides algoritm',
      lede: 'Ersätt paret (a, b) upprepade gånger med (b, a mod b) — dividera det större med det mindre och behåll bara resten — och paret blir mindre vid varje steg. I det ögonblick en sida når noll är den andra sidan den största gemensamma delaren av de två tal du började med.',
      xref: 'Samma SGD kan också ses som de primtal de två talen delar →',
      chipFiveSteps: '240, 46 · 5 steg',
      chipCoprime: '35, 18 · relativt prima',
      chipBDividesA: '144, 12 · b delar a',
      chipEqualPair: '36, 36 · lika par',
      chipAlreadyDone: '17, 0 · redan klart',
      chipFibonacciWorst: '89, 55 · Fibonaccis värsta fall',
      chipHugeQuotient: '500000, 2 · enorm kvot',
      run: 'Starta',
      extToggleLabel: 'Utökat euklidiskt läge — visa Bézout-koefficienterna {0} och {1}',
      errBothWhole: 'Både a och b måste vara heltal.',
      errBothNonNegative: 'Både a och b måste vara noll eller positiva — negativa tal har ingen definierad SGD här.',
      errGcdZeroZero: 'gcd(0, 0) är inte definierat — ange minst ett värde skilt från noll.',
      errClamped: 'Indata är begränsad till {max} — det större värdet klämdes ner för att passa.',
      swapNote: 'Det större värdet går först: angett som ({a}, {b}), spårat som gcd({A}, {B}) — SGD är symmetrisk i sina argument.',
      bannerReady: 'Klar — tryck på Spela upp för att se härledningen byggas upp rad för rad.',
      bannerDone: { one: 'Klar — {n} steg för att nå SGD.', other: 'Klar — {n} steg för att nå SGD.' },
      chainNoteZero: 'b är redan 0, så det finns inget mer att dividera — a är redan den största gemensamma delaren.',
      extCaption: 'Varje rads {0} och {1} uttrycker den radens rest som en kombination av de två ursprungliga indatavärdena — {2}.',
      viewNested: 'Nästlade kvadrater',
      geomViewGroupLabel: 'Geometriskt visningsläge',
      viewStep: 'Enskilt steg',
      tileAriaDefault: 'Rektangelvy av det aktuella divisionssteget',
      nestedAriaDefault: 'Alla divisionssteg nästlade i en enda rektangel',
      caption: 'Successiva Fibonacci-tal är det värsta fallet för denna algoritm — de tvingar fram det största antalet divisionssteg för sin storlek.',
      tileCaptionExact: {
        one: 'Steg {index} av {total}: {a} ÷ {b}: rektangeln täcks exakt av {q} kvadrat med sidan {b} — ingen rest, så {b} är den största gemensamma delaren.',
        other: 'Steg {index} av {total}: {a} ÷ {b}: rektangeln täcks exakt av {q} kvadrater med sidan {b} — ingen rest, så {b} är den största gemensamma delaren.'
      },
      tileCaptionLeftover: {
        one: 'Steg {index} av {total}: {a} = {q}×{b} + {r}: {q} kvadrat med sidan {b} får plats, med en rest på {b}×{r}.',
        other: 'Steg {index} av {total}: {a} = {q}×{b} + {r}: {q} kvadrater med sidan {b} får plats, med en rest på {b}×{r}.'
      },
      tileNoteCapped: 'Den verkliga kvoten är {q} — bara de första {cap} kvadraterna ritas här; de återstående {rest} är sammanslagna i den märkta rutan, så den ritade bredden är inte skalenlig.',
      nestedEmptyMessage: 'Det finns ingen rektangel att nästla — b är redan 0, så algoritmen är redan klar.',
      nestedCaption: {
        one: 'gcd({A}, {B}) = {gcd}: alla {n} steg nästlas i en enda {A}×{B}-rektangel — de minsta, {lastB}×{lastB} kvadraterna, är den största gemensamma delaren. Klicka på en kvadrat (eller ett steg ovan) för att se hur de passar ihop.',
        other: 'gcd({A}, {B}) = {gcd}: alla {n} steg nästlas i en enda {A}×{B}-rektangel — de minsta, {lastB}×{lastB} kvadraterna, är den största gemensamma delaren. Klicka på en kvadrat (eller ett steg ovan) för att se hur de passar ihop.'
      },
      nestedNoteCapped: {
        one: 'Steget {stepNums} har en mycket stor kvot — bara de första {cap} kvadraterna ritas där, sammanslagna i en streckad ruta, så detta diagram är inte helt skalenligt vid det steget.',
        other: 'Stegen {stepNums} har en mycket stor kvot — bara de första {cap} kvadraterna ritas där, sammanslagna i en streckad ruta, så detta diagram är inte helt skalenligt vid de stegen.'
      },
      nestedTileTitle: 'Steg {step}: {a} = {q}·{b} + {r}',
      nestedTileTitleCapped: 'Steg {step}: {a} = {q}·{b} + {r} ({extra} fler kvadrater sammanslagna här)',
      tileEmptyMessage: 'Det finns ingen rektangel att skära — b är redan 0, så algoritmen är redan klar.'
    },
    nb: {
      title: 'Euklids algoritme',
      heading: 'Euklids algoritme',
      lede: 'Erstatt paret (a, b) gjentatte ganger med (b, a mod b) — divider det større med det mindre og behold bare resten — og paret blir mindre for hvert steg. Når en side når null, er den andre siden den største felles divisoren av de to tallene du startet med.',
      xref: 'Samme SFD kan også ses som primtallene de to tallene deler →',
      chipFiveSteps: '240, 46 · 5 steg',
      chipCoprime: '35, 18 · innbyrdes primisk',
      chipBDividesA: '144, 12 · b deler a',
      chipEqualPair: '36, 36 · likt par',
      chipAlreadyDone: '17, 0 · allerede ferdig',
      chipFibonacciWorst: '89, 55 · Fibonaccis verste tilfelle',
      chipHugeQuotient: '500000, 2 · enorm kvotient',
      run: 'Start',
      extToggleLabel: 'Utvidet euklidisk modus — vis Bézout-koeffisientene {0} og {1}',
      errBothWhole: 'Både a og b må være hele tall.',
      errBothNonNegative: 'Både a og b må være null eller positive — negative tall har ingen definert SFD her.',
      errGcdZeroZero: 'gcd(0, 0) er ikke definert — angi minst én verdi som ikke er null.',
      errClamped: 'Inndata er begrenset til {max} — den større verdien ble klemt ned for å passe.',
      swapNote: 'Den større verdien kommer først: angitt som ({a}, {b}), spores som gcd({A}, {B}) — SFD er symmetrisk i sine argumenter.',
      bannerReady: 'Klar — trykk på Spill av for å se utledningen bygges opp linje for linje.',
      bannerDone: { one: 'Ferdig — {n} steg for å nå SFD.', other: 'Ferdig — {n} steg for å nå SFD.' },
      chainNoteZero: 'b er allerede 0, så det er ingenting mer å dividere — a er allerede den største felles divisoren.',
      extCaption: 'Hver linjes {0} og {1} uttrykker den linjens rest som en kombinasjon av de to opprinnelige inndataverdiene — {2}.',
      viewNested: 'Nøstede kvadrater',
      geomViewGroupLabel: 'Geometrisk visningsmodus',
      viewStep: 'Enkelt steg',
      tileAriaDefault: 'Rektangelvisning av det aktuelle divisjonssteget',
      nestedAriaDefault: 'Alle divisjonssteg nøstet i ett rektangel',
      caption: 'Påfølgende Fibonacci-tall er det verste tilfellet for denne algoritmen — de tvinger frem det høyeste antallet divisjonssteg for sin størrelse.',
      tileCaptionExact: {
        one: 'Steg {index} av {total}: {a} ÷ {b}: rektangelet flislegges nøyaktig med {q} kvadrat med side {b} — ingen rest, så {b} er den største felles divisoren.',
        other: 'Steg {index} av {total}: {a} ÷ {b}: rektangelet flislegges nøyaktig med {q} kvadrater med side {b} — ingen rest, så {b} er den største felles divisoren.'
      },
      tileCaptionLeftover: {
        one: 'Steg {index} av {total}: {a} = {q}×{b} + {r}: {q} kvadrat med side {b} passer, med en rest på {b}×{r}.',
        other: 'Steg {index} av {total}: {a} = {q}×{b} + {r}: {q} kvadrater med side {b} passer, med en rest på {b}×{r}.'
      },
      tileNoteCapped: 'Den faktiske kvotienten er {q} — bare de første {cap} kvadratene er tegnet her; de resterende {rest} er samlet i den merkede flisen, så den tegnede bredden er ikke i skala.',
      nestedEmptyMessage: 'Det finnes ikke noe rektangel å nøste — b er allerede 0, så algoritmen er allerede ferdig.',
      nestedCaption: {
        one: 'gcd({A}, {B}) = {gcd}: alle {n} steg nøstes i ett {A}×{B}-rektangel — de minste, {lastB}×{lastB} kvadratene, er den største felles divisoren. Klikk på et kvadrat (eller et steg over) for å se hvordan de passer sammen.',
        other: 'gcd({A}, {B}) = {gcd}: alle {n} steg nøstes i ett {A}×{B}-rektangel — de minste, {lastB}×{lastB} kvadratene, er den største felles divisoren. Klikk på et kvadrat (eller et steg over) for å se hvordan de passer sammen.'
      },
      nestedNoteCapped: {
        one: 'Steget {stepNums} har en svært stor kvotient — bare de første {cap} kvadratene er tegnet der, samlet i en stiplet flis, så dette diagrammet er ikke helt i skala ved det steget.',
        other: 'Stegene {stepNums} har en svært stor kvotient — bare de første {cap} kvadratene er tegnet der, samlet i en stiplet flis, så dette diagrammet er ikke helt i skala ved de stegene.'
      },
      nestedTileTitle: 'Steg {step}: {a} = {q}·{b} + {r}',
      nestedTileTitleCapped: 'Steg {step}: {a} = {q}·{b} + {r} ({extra} flere kvadrater samlet her)',
      tileEmptyMessage: 'Det finnes ikke noe rektangel å kutte — b er allerede 0, så algoritmen er allerede ferdig.'
    },
    ro: {
      title: 'Algoritmul lui Euclid',
      heading: 'Algoritmul lui Euclid',
      lede: 'Înlocuiește în mod repetat perechea (a, b) cu (b, a mod b) — împarte numărul mai mare la cel mai mic și păstrează doar restul — iar perechea se micșorează la fiecare pas. În momentul în care o parte atinge zero, cealaltă parte este cel mai mare divizor comun al celor două numere cu care ai început.',
      xref: 'Același cmmdc poate fi văzut și ca factorii primi comuni celor două numere →',
      chipFiveSteps: '240, 46 · 5 pași',
      chipCoprime: '35, 18 · prime între ele',
      chipBDividesA: '144, 12 · b îl divide pe a',
      chipEqualPair: '36, 36 · pereche egală',
      chipAlreadyDone: '17, 0 · deja terminat',
      chipFibonacciWorst: '89, 55 · cel mai rău caz Fibonacci',
      chipHugeQuotient: '500000, 2 · cât enorm',
      run: 'Rulează',
      extToggleLabel: 'Mod Euclidian extins — arată coeficienții Bézout {0} și {1}',
      errBothWhole: 'Atât a cât și b trebuie să fie numere întregi.',
      errBothNonNegative: 'Atât a cât și b trebuie să fie zero sau pozitive — numerele negative nu au un cmmdc definit aici.',
      errGcdZeroZero: 'gcd(0, 0) nu este definit — introdu cel puțin o valoare diferită de zero.',
      errClamped: 'Valorile introduse sunt limitate la {max} — valoarea mai mare a fost redusă pentru a se încadra.',
      swapNote: 'Valoarea mai mare este în față: introdusă ca ({a}, {b}), urmărită ca gcd({A}, {B}) — cmmdc este simetric în argumentele sale.',
      bannerReady: 'Pregătit — apasă Redă pentru a privi derivarea construindu-se linie cu linie.',
      bannerDone: { one: 'Terminat — {n} pas pentru a ajunge la cmmdc.', few: 'Terminat — {n} pași pentru a ajunge la cmmdc.', other: 'Terminat — {n} de pași pentru a ajunge la cmmdc.' },
      chainNoteZero: 'b este deja 0, așadar nu mai e nimic de împărțit — a este deja cel mai mare divizor comun.',
      extCaption: '{0} și {1} ale fiecărei linii exprimă restul acelei linii ca o combinație a celor două valori inițiale — {2}.',
      viewNested: 'Pătrate imbricate',
      geomViewGroupLabel: 'Mod de vizualizare geometrică',
      viewStep: 'Pas unic',
      tileAriaDefault: 'Vizualizare rectangulară a pasului curent de împărțire',
      nestedAriaDefault: 'Toți pașii de împărțire imbricați într-un singur dreptunghi',
      caption: 'Numerele Fibonacci consecutive reprezintă cel mai rău caz pentru acest algoritm — ele impun cel mai mare număr de pași de împărțire pentru dimensiunea lor.',
      tileCaptionExact: {
        one: 'Pasul {index} din {total}: {a} ÷ {b}: dreptunghiul se pavează exact cu {q} pătrat cu latura {b} — fără rest, așadar {b} este cel mai mare divizor comun.',
        few: 'Pasul {index} din {total}: {a} ÷ {b}: dreptunghiul se pavează exact cu {q} pătrate cu latura {b} — fără rest, așadar {b} este cel mai mare divizor comun.',
        other: 'Pasul {index} din {total}: {a} ÷ {b}: dreptunghiul se pavează exact cu {q} de pătrate cu latura {b} — fără rest, așadar {b} este cel mai mare divizor comun.'
      },
      tileCaptionLeftover: {
        one: 'Pasul {index} din {total}: {a} = {q}×{b} + {r}: {q} pătrat cu latura {b} încape, lăsând un rest de {b}×{r}.',
        few: 'Pasul {index} din {total}: {a} = {q}×{b} + {r}: {q} pătrate cu latura {b} încap, lăsând un rest de {b}×{r}.',
        other: 'Pasul {index} din {total}: {a} = {q}×{b} + {r}: {q} de pătrate cu latura {b} încap, lăsând un rest de {b}×{r}.'
      },
      tileNoteCapped: 'Câtul real este {q} — doar primele {cap} pătrate sunt desenate aici; restul de {rest} sunt comasate în tigla etichetată, așadar lățimea desenată nu este la scară.',
      nestedEmptyMessage: 'Nu există niciun dreptunghi de imbricat — b este deja 0, așadar algoritmul este deja terminat.',
      nestedCaption: {
        one: 'gcd({A}, {B}) = {gcd}: tot {n} pas se imbrichează într-un singur dreptunghi {A}×{B} — cele mai mici pătrate, {lastB}×{lastB}, sunt cel mai mare divizor comun. Fă clic pe un pătrat (sau pe un pas de mai sus) pentru a vedea cum se aliniază.',
        few: 'gcd({A}, {B}) = {gcd}: toți {n} pași se imbrichează într-un singur dreptunghi {A}×{B} — cele mai mici pătrate, {lastB}×{lastB}, sunt cel mai mare divizor comun. Fă clic pe un pătrat (sau pe un pas de mai sus) pentru a vedea cum se aliniază.',
        other: 'gcd({A}, {B}) = {gcd}: toți cei {n} de pași se imbrichează într-un singur dreptunghi {A}×{B} — cele mai mici pătrate, {lastB}×{lastB}, sunt cel mai mare divizor comun. Fă clic pe un pătrat (sau pe un pas de mai sus) pentru a vedea cum se aliniază.'
      },
      nestedNoteCapped: {
        one: 'Pasul {stepNums} are un cât foarte mare — doar primele {cap} pătrate sunt desenate acolo, comasate într-o tiglă punctată, așadar această diagramă nu este complet la scară la acel pas.',
        few: 'Pașii {stepNums} au un cât foarte mare — doar primele {cap} pătrate sunt desenate acolo, comasate într-o tiglă punctată, așadar această diagramă nu este complet la scară la acei pași.',
        other: 'Pașii {stepNums} au un cât foarte mare — doar primele {cap} pătrate sunt desenate acolo, comasate într-o tiglă punctată, așadar această diagramă nu este complet la scară la acei pași.'
      },
      nestedTileTitle: 'Pasul {step}: {a} = {q}·{b} + {r}',
      nestedTileTitleCapped: 'Pasul {step}: {a} = {q}·{b} + {r} ({extra} pătrate suplimentare comasate aici)',
      tileEmptyMessage: 'Nu există niciun dreptunghi de tăiat — b este deja 0, așadar algoritmul este deja terminat.'
    },
    hu: {
      title: 'Euklideszi algoritmus',
      heading: 'Euklideszi algoritmus',
      lede: 'Ismételten helyettesítsd az (a, b) párt (b, a mod b)-vel — oszd el a nagyobbat a kisebbel, és csak a maradékot tartsd meg —, és a pár minden lépésnél kisebb lesz. Amint egy oldal elér a nullát, a másik oldal a két kezdő szám legnagyobb közös osztója.',
      xref: 'Ugyanez az lnko a két szám közös prímtényezőiként is látható →',
      chipFiveSteps: '240, 46 · 5 lépés',
      chipCoprime: '35, 18 · relatív prímek',
      chipBDividesA: '144, 12 · b osztja a-t',
      chipEqualPair: '36, 36 · egyenlő pár',
      chipAlreadyDone: '17, 0 · már kész',
      chipFibonacciWorst: '89, 55 · Fibonacci legrosszabb eset',
      chipHugeQuotient: '500000, 2 · hatalmas hányados',
      run: 'Futtatás',
      extToggleLabel: 'Kiterjesztett euklideszi mód — mutassa a Bézout-együtthatókat: {0} és {1}',
      errBothWhole: 'Mind a-nak, mind b-nek egész számnak kell lennie.',
      errBothNonNegative: 'Mind a-nak, mind b-nek nullának vagy pozitívnak kell lennie — a negatív számoknak itt nincs definiált lnko-juk.',
      errGcdZeroZero: 'A gcd(0, 0) nincs definiálva — adj meg legalább egy nullától eltérő értéket.',
      errClamped: 'A bemenetek felső korlátja {max} — a nagyobb érték lecsökkentve, hogy beleférjen.',
      swapNote: 'A nagyobb érték áll elöl: ({a}, {b})-ként megadva, gcd({A}, {B})-ként követve — az lnko szimmetrikus az argumentumaiban.',
      bannerReady: 'Kész — nyomd meg a Lejátszás gombot, hogy lásd a levezetést soronként felépülni.',
      bannerDone: { one: 'Kész — {n} lépés az lnko eléréséhez.', other: 'Kész — {n} lépés az lnko eléréséhez.' },
      chainNoteZero: 'b már 0, így nincs több osztandó — a már a legnagyobb közös osztó.',
      extCaption: 'Minden sor {0} és {1} értéke kifejezi a sor maradékát a két eredeti bemenet kombinációjaként — {2}.',
      viewNested: 'Egymásba ágyazott négyzetek',
      geomViewGroupLabel: 'Geometriai nézet módja',
      viewStep: 'Egyetlen lépés',
      tileAriaDefault: 'Az aktuális osztási lépés téglalap nézete',
      nestedAriaDefault: 'Minden osztási lépés egyetlen téglalapba ágyazva',
      caption: 'Az egymást követő Fibonacci-számok jelentik a legrosszabb esetet ehhez az algoritmushoz — méretükhöz képest a legtöbb osztási lépést kényszerítik ki.',
      tileCaptionExact: {
        one: '{index}. lépés / {total}: {a} ÷ {b}: a téglalap pontosan lefedhető {q} darab {b} oldalú négyzettel — nincs maradék, így {b} a legnagyobb közös osztó.',
        other: '{index}. lépés / {total}: {a} ÷ {b}: a téglalap pontosan lefedhető {q} darab {b} oldalú négyzettel — nincs maradék, így {b} a legnagyobb közös osztó.'
      },
      tileCaptionLeftover: {
        one: '{index}. lépés / {total}: {a} = {q}×{b} + {r}: {q} darab {b} oldalú négyzet fér el, {b}×{r} maradékkal.',
        other: '{index}. lépés / {total}: {a} = {q}×{b} + {r}: {q} darab {b} oldalú négyzet fér el, {b}×{r} maradékkal.'
      },
      tileNoteCapped: 'A valódi hányados {q} — csak az első {cap} négyzet van itt megrajzolva; a maradék {rest} össze van vonva a feliratozott csempében, így a megrajzolt szélesség nem arányos.',
      nestedEmptyMessage: 'Nincs téglalap, amit egymásba ágyazni — b már 0, így az algoritmus már kész.',
      nestedCaption: {
        one: 'gcd({A}, {B}) = {gcd}: mind {n} lépés egyetlen {A}×{B} téglalapba ágyazódik — a legkisebb, {lastB}×{lastB} négyzetek a legnagyobb közös osztó. Kattints egy négyzetre (vagy egy fenti lépésre), hogy lásd, hogyan illenek egymáshoz.',
        other: 'gcd({A}, {B}) = {gcd}: mind {n} lépés egyetlen {A}×{B} téglalapba ágyazódik — a legkisebb, {lastB}×{lastB} négyzetek a legnagyobb közös osztó. Kattints egy négyzetre (vagy egy fenti lépésre), hogy lásd, hogyan illenek egymáshoz.'
      },
      nestedNoteCapped: {
        one: 'Ennél a lépésnél ({stepNums}) nagyon nagy a hányados — csak az első {cap} négyzet van ott megrajzolva, egy pontozott csempébe összevonva, így ez a diagram ennél a lépésnél nem teljesen arányos.',
        other: 'Ezeknél a lépéseknél ({stepNums}) nagyon nagy a hányados — csak az első {cap} négyzet van ott megrajzolva, egy pontozott csempébe összevonva, így ez a diagram ezeknél a lépéseknél nem teljesen arányos.'
      },
      nestedTileTitle: '{step}. lépés: {a} = {q}·{b} + {r}',
      nestedTileTitleCapped: '{step}. lépés: {a} = {q}·{b} + {r} ({extra} további négyzet összevonva itt)',
      tileEmptyMessage: 'Nincs téglalap, amit elvágni — b már 0, így az algoritmus már kész.'
    },
    lv: {
      title: 'Eiklīda algoritms',
      heading: 'Eiklīda algoritms',
      lede: 'Atkārtoti aizstāj pāri (a, b) ar (b, a mod b) — dali lielāko ar mazāko un paturi tikai atlikumu — un pāris samazinās ar katru soli. Tiklīdz viena puse sasniedz nulli, otra puse ir lielākais kopīgais dalītājs diviem skaitļiem, ar kuriem sāki.',
      xref: 'To pašu LKD var redzēt arī kā pirmreizinātājus, kas kopīgi abiem skaitļiem →',
      chipFiveSteps: '240, 46 · 5 soļi',
      chipCoprime: '35, 18 · savstarpēji pirmskaitļi',
      chipBDividesA: '144, 12 · b dala a',
      chipEqualPair: '36, 36 · vienāds pāris',
      chipAlreadyDone: '17, 0 · jau gatavs',
      chipFibonacciWorst: '89, 55 · Fibonači sliktākais gadījums',
      chipHugeQuotient: '500000, 2 · milzīgs dalījums',
      run: 'Palaist',
      extToggleLabel: 'Paplašinātais Eiklīda režīms — rādīt Bezū koeficientus {0} un {1}',
      errBothWhole: 'Gan a, gan b jābūt veseliem skaitļiem.',
      errBothNonNegative: 'Gan a, gan b jābūt nullei vai pozitīviem — negatīviem skaitļiem šeit nav definēts LKD.',
      errGcdZeroZero: 'gcd(0, 0) nav definēts — ievadi vismaz vienu vērtību, kas nav nulle.',
      errClamped: 'Ievades vērtības ir ierobežotas līdz {max} — lielākā vērtība tika samazināta, lai ietilptu.',
      swapNote: 'Lielākā vērtība ir pirmā: ievadīta kā ({a}, {b}), izsekota kā gcd({A}, {B}) — LKD ir simetrisks savos argumentos.',
      bannerReady: 'Gatavs — nospied Atskaņot, lai skatītos, kā izvedums tiek veidots rinda pa rindai.',
      bannerDone: { zero: 'Pabeigts — {n} soļu, lai sasniegtu LKD.', one: 'Pabeigts — {n} solis, lai sasniegtu LKD.', other: 'Pabeigts — {n} soļi, lai sasniegtu LKD.' },
      chainNoteZero: 'b jau ir 0, tāpēc nav vairāk ko dalīt — a jau ir lielākais kopīgais dalītājs.',
      extCaption: 'Katras rindas {0} un {1} izsaka tās rindas atlikumu kā divu sākotnējo ievades vērtību kombināciju — {2}.',
      viewNested: 'Ligzdoti kvadrāti',
      geomViewGroupLabel: 'Ģeometriskā skata režīms',
      viewStep: 'Viens solis',
      tileAriaDefault: 'Taisnstūra skats pašreizējam dalīšanas solim',
      nestedAriaDefault: 'Visi dalīšanas soļi ligzdoti vienā taisnstūrī',
      caption: 'Secīgi Fibonači skaitļi ir sliktākais gadījums šim algoritmam — tie prasa visvairāk dalīšanas soļu attiecībā uz savu lielumu.',
      tileCaptionExact: {
        zero: 'Solis {index} no {total}: {a} ÷ {b}: taisnstūrī precīzi ietilpst {q} kvadrātu ar malu {b} — bez atlikuma, tāpēc {b} ir lielākais kopīgais dalītājs.',
        one: 'Solis {index} no {total}: {a} ÷ {b}: taisnstūrī precīzi ietilpst {q} kvadrāts ar malu {b} — bez atlikuma, tāpēc {b} ir lielākais kopīgais dalītājs.',
        other: 'Solis {index} no {total}: {a} ÷ {b}: taisnstūrī precīzi ietilpst {q} kvadrāti ar malu {b} — bez atlikuma, tāpēc {b} ir lielākais kopīgais dalītājs.'
      },
      tileCaptionLeftover: {
        zero: 'Solis {index} no {total}: {a} = {q}×{b} + {r}: ietilpst {q} kvadrātu ar malu {b}, paliek atlikums {b}×{r}.',
        one: 'Solis {index} no {total}: {a} = {q}×{b} + {r}: ietilpst {q} kvadrāts ar malu {b}, paliek atlikums {b}×{r}.',
        other: 'Solis {index} no {total}: {a} = {q}×{b} + {r}: ietilpst {q} kvadrāti ar malu {b}, paliek atlikums {b}×{r}.'
      },
      tileNoteCapped: 'Patiesais dalījums ir {q} — šeit ir attēloti tikai pirmie {cap} kvadrāti; atlikušie {rest} ir sakopoti etiķetētajā laukumā, tāpēc attēlotais platums nav mērogā.',
      nestedEmptyMessage: 'Nav taisnstūra, ko ligzdot — b jau ir 0, tāpēc algoritms jau ir pabeigts.',
      nestedCaption: {
        zero: 'gcd({A}, {B}) = {gcd}: visi {n} soļu ir ligzdoti vienā {A}×{B} taisnstūrī — mazākie, {lastB}×{lastB} kvadrāti, ir lielākais kopīgais dalītājs. Noklikšķini uz kvadrāta (vai soļa augstāk), lai redzētu, kā tie sakrīt.',
        one: 'gcd({A}, {B}) = {gcd}: viss {n} solis ir ligzdots vienā {A}×{B} taisnstūrī — mazākie, {lastB}×{lastB} kvadrāti, ir lielākais kopīgais dalītājs. Noklikšķini uz kvadrāta (vai soļa augstāk), lai redzētu, kā tie sakrīt.',
        other: 'gcd({A}, {B}) = {gcd}: visi {n} soļi ir ligzdoti vienā {A}×{B} taisnstūrī — mazākie, {lastB}×{lastB} kvadrāti, ir lielākais kopīgais dalītājs. Noklikšķini uz kvadrāta (vai soļa augstāk), lai redzētu, kā tie sakrīt.'
      },
      nestedNoteCapped: {
        zero: 'Solim {stepNums} ir ļoti liels dalījums — tur ir attēloti tikai pirmie {cap} kvadrāti, sakopoti punktotā laukumā, tāpēc šī diagramma pie tā soļa nav pilnībā mērogā.',
        one: 'Solim {stepNums} ir ļoti liels dalījums — tur ir attēloti tikai pirmie {cap} kvadrāti, sakopoti punktotā laukumā, tāpēc šī diagramma pie tā soļa nav pilnībā mērogā.',
        other: 'Soļiem {stepNums} ir ļoti liels dalījums — tur ir attēloti tikai pirmie {cap} kvadrāti, sakopoti punktotā laukumā, tāpēc šī diagramma pie šiem soļiem nav pilnībā mērogā.'
      },
      nestedTileTitle: 'Solis {step}: {a} = {q}·{b} + {r}',
      nestedTileTitleCapped: 'Solis {step}: {a} = {q}·{b} + {r} ({extra} papildu kvadrāti sakopoti šeit)',
      tileEmptyMessage: 'Nav taisnstūra, ko sagriezt — b jau ir 0, tāpēc algoritms jau ir pabeigts.'
    },
    ru: {
      title: 'Алгоритм Евклида',
      heading: 'Алгоритм Евклида',
      lede: 'Повторно заменяй пару (a, b) на (b, a mod b) — дели большее на меньшее и оставляй только остаток — и пара уменьшается на каждом шаге. В тот момент, когда одна сторона достигает нуля, другая сторона — наибольший общий делитель двух чисел, с которых ты начал.',
      xref: 'Тот же НОД можно увидеть и как простые множители, общие для обоих чисел →',
      chipFiveSteps: '240, 46 · 5 шагов',
      chipCoprime: '35, 18 · взаимно простые',
      chipBDividesA: '144, 12 · b делит a',
      chipEqualPair: '36, 36 · равная пара',
      chipAlreadyDone: '17, 0 · уже готово',
      chipFibonacciWorst: '89, 55 · худший случай Fibonacci',
      chipHugeQuotient: '500000, 2 · огромное частное',
      run: 'Запустить',
      extToggleLabel: 'Расширенный режим Евклида — показать коэффициенты Безу {0} и {1}',
      errBothWhole: 'И a, и b должны быть целыми числами.',
      errBothNonNegative: 'И a, и b должны быть нулём или положительными — для отрицательных чисел здесь НОД не определён.',
      errGcdZeroZero: 'gcd(0, 0) не определён — введи хотя бы одно ненулевое значение.',
      errClamped: 'Входные значения ограничены до {max} — большее значение было уменьшено, чтобы вместиться.',
      swapNote: 'Большее значение идёт первым: введено как ({a}, {b}), прослежено как gcd({A}, {B}) — НОД симметричен относительно своих аргументов.',
      bannerReady: 'Готово — нажми «Пуск», чтобы увидеть, как вывод строится строка за строкой.',
      bannerDone: { one: 'Готово — {n} шаг, чтобы достичь НОД.', few: 'Готово — {n} шага, чтобы достичь НОД.', many: 'Готово — {n} шагов, чтобы достичь НОД.', other: 'Готово — {n} шага, чтобы достичь НОД.' },
      chainNoteZero: 'b уже равно 0, поэтому больше нечего делить — a уже является наибольшим общим делителем.',
      extCaption: '{0} и {1} каждой строки выражают остаток этой строки как комбинацию двух исходных входных значений — {2}.',
      viewNested: 'Вложенные квадраты',
      geomViewGroupLabel: 'Режим геометрического вида',
      viewStep: 'Один шаг',
      tileAriaDefault: 'Прямоугольный вид текущего шага деления',
      nestedAriaDefault: 'Все шаги деления вложены в один прямоугольник',
      caption: 'Последовательные числа Fibonacci — худший случай для этого алгоритма: они требуют наибольшего числа шагов деления для своего размера.',
      tileCaptionExact: {
        one: 'Шаг {index} из {total}: {a} ÷ {b}: прямоугольник точно заполняется {q} квадратом со стороной {b} — без остатка, поэтому {b} — наибольший общий делитель.',
        few: 'Шаг {index} из {total}: {a} ÷ {b}: прямоугольник точно заполняется {q} квадратами со стороной {b} — без остатка, поэтому {b} — наибольший общий делитель.',
        many: 'Шаг {index} из {total}: {a} ÷ {b}: прямоугольник точно заполняется {q} квадратами со стороной {b} — без остатка, поэтому {b} — наибольший общий делитель.',
        other: 'Шаг {index} из {total}: {a} ÷ {b}: прямоугольник точно заполняется {q} квадрата со стороной {b} — без остатка, поэтому {b} — наибольший общий делитель.'
      },
      tileCaptionLeftover: {
        one: 'Шаг {index} из {total}: {a} = {q}×{b} + {r}: помещается {q} квадрат со стороной {b}, остаётся {b}×{r}.',
        few: 'Шаг {index} из {total}: {a} = {q}×{b} + {r}: помещается {q} квадрата со стороной {b}, остаётся {b}×{r}.',
        many: 'Шаг {index} из {total}: {a} = {q}×{b} + {r}: помещается {q} квадратов со стороной {b}, остаётся {b}×{r}.',
        other: 'Шаг {index} из {total}: {a} = {q}×{b} + {r}: помещается {q} квадрата со стороной {b}, остаётся {b}×{r}.'
      },
      tileNoteCapped: 'Истинное частное равно {q} — здесь нарисованы только первые {cap} квадратов; оставшиеся {rest} объединены в подписанную плитку, поэтому нарисованная ширина не соответствует масштабу.',
      nestedEmptyMessage: 'Нет прямоугольника для вложения — b уже равно 0, поэтому алгоритм уже завершён.',
      nestedCaption: {
        one: 'gcd({A}, {B}) = {gcd}: весь {n} шаг вложен в один прямоугольник {A}×{B} — наименьшие квадраты {lastB}×{lastB} являются наибольшим общим делителем. Щёлкни на квадрат (или на шаг выше), чтобы увидеть, как они совпадают.',
        few: 'gcd({A}, {B}) = {gcd}: все {n} шага вложены в один прямоугольник {A}×{B} — наименьшие квадраты {lastB}×{lastB} являются наибольшим общим делителем. Щёлкни на квадрат (или на шаг выше), чтобы увидеть, как они совпадают.',
        many: 'gcd({A}, {B}) = {gcd}: все {n} шагов вложены в один прямоугольник {A}×{B} — наименьшие квадраты {lastB}×{lastB} являются наибольшим общим делителем. Щёлкни на квадрат (или на шаг выше), чтобы увидеть, как они совпадают.',
        other: 'gcd({A}, {B}) = {gcd}: все {n} шага вложены в один прямоугольник {A}×{B} — наименьшие квадраты {lastB}×{lastB} являются наибольшим общим делителем. Щёлкни на квадрат (или на шаг выше), чтобы увидеть, как они совпадают.'
      },
      nestedNoteCapped: {
        one: 'На шаге {stepNums} очень большое частное — там нарисованы только первые {cap} квадратов, объединённые в пунктирную плитку, поэтому на этом шаге диаграмма не полностью соответствует масштабу.',
        few: 'На шагах {stepNums} очень большое частное — там нарисованы только первые {cap} квадратов, объединённые в пунктирную плитку, поэтому на этих шагах диаграмма не полностью соответствует масштабу.',
        many: 'На шагах {stepNums} очень большое частное — там нарисованы только первые {cap} квадратов, объединённые в пунктирную плитку, поэтому на этих шагах диаграмма не полностью соответствует масштабу.',
        other: 'На шагах {stepNums} очень большое частное — там нарисованы только первые {cap} квадратов, объединённые в пунктирную плитку, поэтому на этих шагах диаграмма не полностью соответствует масштабу.'
      },
      nestedTileTitle: 'Шаг {step}: {a} = {q}·{b} + {r}',
      nestedTileTitleCapped: 'Шаг {step}: {a} = {q}·{b} + {r} (ещё {extra} квадратов объединено здесь)',
      tileEmptyMessage: 'Нет прямоугольника для разрезания — b уже равно 0, поэтому алгоритм уже завершён.'
    },
    el: {
      title: 'Αλγόριθμος του Ευκλείδη',
      heading: 'Αλγόριθμος του Ευκλείδη',
      lede: 'Αντικατάστησε επανειλημμένα το ζεύγος (a, b) με το (b, a mod b) — διαίρεσε το μεγαλύτερο με το μικρότερο και κράτησε μόνο το υπόλοιπο — και το ζεύγος μικραίνει σε κάθε βήμα. Τη στιγμή που η μία πλευρά φτάσει στο μηδέν, η άλλη πλευρά είναι ο μέγιστος κοινός διαιρέτης των δύο αριθμών από τους οποίους ξεκίνησες.',
      xref: 'Ο ίδιος ΜΚΔ μπορεί επίσης να φανεί ως οι πρώτοι παράγοντες που μοιράζονται οι δύο αριθμοί →',
      chipFiveSteps: '240, 46 · 5 βήματα',
      chipCoprime: '35, 18 · πρώτοι μεταξύ τους',
      chipBDividesA: '144, 12 · το b διαιρεί το a',
      chipEqualPair: '36, 36 · ίσο ζεύγος',
      chipAlreadyDone: '17, 0 · ήδη έτοιμο',
      chipFibonacciWorst: '89, 55 · χειρότερη περίπτωση Fibonacci',
      chipHugeQuotient: '500000, 2 · τεράστιο πηλίκο',
      run: 'Εκτέλεση',
      extToggleLabel: 'Εκτεταμένη λειτουργία Ευκλείδη — εμφάνιση των συντελεστών Bézout {0} και {1}',
      errBothWhole: 'Τα a και b πρέπει και τα δύο να είναι ακέραιοι αριθμοί.',
      errBothNonNegative: 'Τα a και b πρέπει και τα δύο να είναι μηδέν ή θετικά — για αρνητικούς αριθμούς δεν ορίζεται εδώ ΜΚΔ.',
      errGcdZeroZero: 'Το gcd(0, 0) δεν ορίζεται — γράψε τουλάχιστον μία τιμή διαφορετική από το μηδέν.',
      errClamped: 'Οι τιμές εισόδου έχουν όριο {max} — η μεγαλύτερη τιμή μειώθηκε για να χωρέσει.',
      swapNote: 'Η μεγαλύτερη τιμή προηγείται: γράφτηκε ως ({a}, {b}), ανιχνεύτηκε ως gcd({A}, {B}) — ο ΜΚΔ είναι συμμετρικός ως προς τα ορίσματά του.',
      bannerReady: 'Έτοιμο — πάτα «Έναρξη» για να δεις την παραγωγή να χτίζεται γραμμή προς γραμμή.',
      bannerDone: { one: 'Έτοιμο — {n} βήμα για να φτάσεις στον ΜΚΔ.', other: 'Έτοιμο — {n} βήματα για να φτάσεις στον ΜΚΔ.' },
      chainNoteZero: 'Το b είναι ήδη 0, οπότε δεν απομένει τίποτα για διαίρεση — το a είναι ήδη ο μέγιστος κοινός διαιρέτης.',
      extCaption: 'Τα {0} και {1} κάθε γραμμής εκφράζουν το υπόλοιπο εκείνης της γραμμής ως συνδυασμό των δύο αρχικών τιμών εισόδου — {2}.',
      viewNested: 'Ενθυλακωμένα τετράγωνα',
      geomViewGroupLabel: 'Λειτουργία γεωμετρικής προβολής',
      viewStep: 'Ένα βήμα',
      tileAriaDefault: 'Προβολή ορθογωνίου του τρέχοντος βήματος διαίρεσης',
      nestedAriaDefault: 'Όλα τα βήματα διαίρεσης ενθυλακωμένα σε ένα ορθογώνιο',
      caption: 'Διαδοχικοί αριθμοί Fibonacci είναι η χειρότερη περίπτωση για αυτόν τον αλγόριθμο — απαιτούν τα περισσότερα βήματα διαίρεσης για το μέγεθός τους.',
      tileCaptionExact: {
        one: 'Βήμα {index} από {total}: {a} ÷ {b}: το ορθογώνιο καλύπτεται ακριβώς με {q} τετράγωνο πλευράς {b} — χωρίς υπόλοιπο, οπότε το {b} είναι ο μέγιστος κοινός διαιρέτης.',
        other: 'Βήμα {index} από {total}: {a} ÷ {b}: το ορθογώνιο καλύπτεται ακριβώς με {q} τετράγωνα πλευράς {b} — χωρίς υπόλοιπο, οπότε το {b} είναι ο μέγιστος κοινός διαιρέτης.'
      },
      tileCaptionLeftover: {
        one: 'Βήμα {index} από {total}: {a} = {q}×{b} + {r}: χωράει {q} τετράγωνο πλευράς {b}, μένει υπόλοιπο {b}×{r}.',
        other: 'Βήμα {index} από {total}: {a} = {q}×{b} + {r}: χωράνε {q} τετράγωνα πλευράς {b}, μένει υπόλοιπο {b}×{r}.'
      },
      tileNoteCapped: 'Το πραγματικό πηλίκο είναι {q} — εδώ σχεδιάζονται μόνο τα πρώτα {cap} τετράγωνα· τα υπόλοιπα {rest} συμπτύσσονται στο επισημασμένο πλακίδιο, οπότε το σχεδιασμένο πλάτος δεν είναι υπό κλίμακα.',
      nestedEmptyMessage: 'Δεν υπάρχει ορθογώνιο για ενθυλάκωση — το b είναι ήδη 0, οπότε ο αλγόριθμος έχει ήδη τελειώσει.',
      nestedCaption: {
        one: 'gcd({A}, {B}) = {gcd}: το {n} βήμα ενθυλακώνεται σε ένα ορθογώνιο {A}×{B} — τα μικρότερα τετράγωνα {lastB}×{lastB} είναι ο μέγιστος κοινός διαιρέτης. Πάτα σε ένα τετράγωνο (ή σε ένα βήμα πάνω) για να δεις πώς ευθυγραμμίζονται.',
        other: 'gcd({A}, {B}) = {gcd}: όλα τα {n} βήματα ενθυλακώνονται σε ένα ορθογώνιο {A}×{B} — τα μικρότερα τετράγωνα {lastB}×{lastB} είναι ο μέγιστος κοινός διαιρέτης. Πάτα σε ένα τετράγωνο (ή σε ένα βήμα πάνω) για να δεις πώς ευθυγραμμίζονται.'
      },
      nestedNoteCapped: {
        one: 'Στο βήμα {stepNums} υπάρχει πολύ μεγάλο πηλίκο — εκεί σχεδιάζονται μόνο τα πρώτα {cap} τετράγωνα, συμπτυγμένα σε διακεκομμένο πλακίδιο, οπότε το διάγραμμα δεν είναι πλήρως υπό κλίμακα σε αυτό το βήμα.',
        other: 'Στα βήματα {stepNums} υπάρχει πολύ μεγάλο πηλίκο — εκεί σχεδιάζονται μόνο τα πρώτα {cap} τετράγωνα, συμπτυγμένα σε διακεκομμένο πλακίδιο, οπότε το διάγραμμα δεν είναι πλήρως υπό κλίμακα σε αυτά τα βήματα.'
      },
      nestedTileTitle: 'Βήμα {step}: {a} = {q}·{b} + {r}',
      nestedTileTitleCapped: 'Βήμα {step}: {a} = {q}·{b} + {r} ({extra} ακόμα τετράγωνα συμπτύχθηκαν εδώ)',
      tileEmptyMessage: 'Δεν υπάρχει ορθογώνιο για κοπή — το b είναι ήδη 0, οπότε ο αλγόριθμος έχει ήδη τελειώσει.'
    },
    he: {
      title: 'האלגוריתם של אוקלידס',
      heading: 'האלגוריתם של אוקלידס',
      lede: 'החליפו שוב ושוב את הזוג \u2066(a, b)\u2069 ב-\u2066(b, a mod b)\u2069 — חלקו את הגדול בקטן ושמרו רק את השארית — והזוג מצטמק בכל צעד. ברגע שאחד הצדדים מגיע לאפס, הצד השני הוא המחלק המשותף המקסימלי של שני המספרים שהתחלתם בהם.',
      xref: 'את אותו מחלק משותף מקסימלי אפשר לראות גם כראשוניים ששני המספרים חולקים ←',
      chipFiveSteps: '\u2066240, 46\u2069 · 5 צעדים',
      chipCoprime: '\u206635, 18\u2069 · זרים',
      chipBDividesA: '\u2066144, 12\u2069 · b מחלק את a',
      chipEqualPair: '\u206636, 36\u2069 · זוג שווה',
      chipAlreadyDone: '\u206617, 0\u2069 · כבר הסתיים',
      chipFibonacciWorst: '\u206689, 55\u2069 · המקרה הגרוע של פיבונאצ׳י',
      chipHugeQuotient: '\u2066500000, 2\u2069 · מנה עצומה',
      run: 'הרצה',
      extToggleLabel: 'מצב האלגוריתם האוקלידי המורחב — הצגת מקדמי בזו {0} ו-{1}',
      errBothWhole: 'שני המספרים a ו-b חייבים להיות שלמים.',
      errBothNonNegative: 'a ו-b חייבים להיות אפס או חיוביים — למספרים שליליים אין כאן מחלק משותף מקסימלי מוגדר.',
      errGcdZeroZero: '\u2066gcd(0, 0)\u2069 אינו מוגדר — הזינו לפחות ערך אחד שאינו אפס.',
      errClamped: 'הקלטים מוגבלים ל-{max} — הערך הגדול הוגבל כלפי מטה כדי להתאים.',
      swapNote: 'הערך הגדול מוביל: הוזן כ-\u2066({a}, {b})\u2069, ועוקב כ-\u2066gcd({A}, {B})\u2069 — המחלק המשותף המקסימלי סימטרי בארגומנטים שלו.',
      bannerReady: 'מוכן — לחצו על הפעלה כדי לצפות בגזירה נבנית שורה אחר שורה.',
      bannerDone: {
        one: 'הסתיים — {n} צעד להגעה אל המחלק המשותף המקסימלי.',
        two: 'הסתיים — {n} צעדים להגעה אל המחלק המשותף המקסימלי.',
        other: 'הסתיים — {n} צעדים להגעה אל המחלק המשותף המקסימלי.'
      },
      chainNoteZero: 'b כבר שווה ל-0, ולכן אין מה לחלק — a כבר המחלק המשותף המקסימלי.',
      extCaption: '{0} ו-{1} בכל שורה מבטאים את השארית של אותה שורה כצירוף של שני הקלטים המקוריים — {2}.',
      viewNested: 'ריבועים מקוננים',
      geomViewGroupLabel: 'מצב תצוגה גאומטרית',
      viewStep: 'צעד בודד',
      tileAriaDefault: 'תצוגת מלבן של צעד החילוק הנוכחי',
      nestedAriaDefault: 'כל צעדי החילוק מקוננים במלבן אחד',
      caption: 'מספרי פיבונאצ׳י עוקבים הם המקרה הגרוע ביותר לאלגוריתם הזה — הם מכריחים את מספר צעדי החילוק הגדול ביותר ביחס לגודלם.',
      tileCaptionExact: {
        one: 'צעד {index} מתוך {total}: \u2066{a} ÷ {b}\u2069: המלבן מרוצף במדויק ב-{q} ריבוע בעל צלע {b} — בלי שארית, ולכן {b} הוא המחלק המשותף המקסימלי.',
        two: 'צעד {index} מתוך {total}: \u2066{a} ÷ {b}\u2069: המלבן מרוצף במדויק ב-{q} ריבועים בעלי צלע {b} — בלי שארית, ולכן {b} הוא המחלק המשותף המקסימלי.',
        other: 'צעד {index} מתוך {total}: \u2066{a} ÷ {b}\u2069: המלבן מרוצף במדויק ב-{q} ריבועים בעלי צלע {b} — בלי שארית, ולכן {b} הוא המחלק המשותף המקסימלי.'
      },
      tileCaptionLeftover: {
        one: 'צעד {index} מתוך {total}: \u2066{a} = {q}×{b} + {r}\u2069: {q} ריבוע בעל צלע {b} נכנס, ונשאר מלבן שארית בגודל \u2066{b}×{r}\u2069.',
        two: 'צעד {index} מתוך {total}: \u2066{a} = {q}×{b} + {r}\u2069: {q} ריבועים בעלי צלע {b} נכנסים, ונשאר מלבן שארית בגודל \u2066{b}×{r}\u2069.',
        other: 'צעד {index} מתוך {total}: \u2066{a} = {q}×{b} + {r}\u2069: {q} ריבועים בעלי צלע {b} נכנסים, ונשאר מלבן שארית בגודל \u2066{b}×{r}\u2069.'
      },
      tileNoteCapped: 'המנה האמיתית היא {q} — רק {cap} הריבועים הראשונים מצוירים כאן; {rest} הנותרים מכווצים באריח המסומן, ולכן הרוחב המצויר אינו בקנה מידה.',
      nestedEmptyMessage: 'אין מלבן לקינון — b כבר שווה ל-0, ולכן האלגוריתם כבר הסתיים.',
      nestedCaption: {
        one: '\u2066gcd({A}, {B}) = {gcd}\u2069: כל {n} צעד מקוננים למלבן אחד \u2066{A}×{B}\u2069 — הריבועים הקטנים ביותר, \u2066{lastB}×{lastB}\u2069, הם המחלק המשותף המקסימלי. לחצו על ריבוע (או על צעד שלמעלה) כדי לראות כיצד הם מסתדרים.',
        two: '\u2066gcd({A}, {B}) = {gcd}\u2069: כל {n} הצעדים מקוננים למלבן אחד \u2066{A}×{B}\u2069 — הריבועים הקטנים ביותר, \u2066{lastB}×{lastB}\u2069, הם המחלק המשותף המקסימלי. לחצו על ריבוע (או על צעד שלמעלה) כדי לראות כיצד הם מסתדרים.',
        other: '\u2066gcd({A}, {B}) = {gcd}\u2069: כל {n} הצעדים מקוננים למלבן אחד \u2066{A}×{B}\u2069 — הריבועים הקטנים ביותר, \u2066{lastB}×{lastB}\u2069, הם המחלק המשותף המקסימלי. לחצו על ריבוע (או על צעד שלמעלה) כדי לראות כיצד הם מסתדרים.'
      },
      nestedNoteCapped: {
        one: 'לצעד {stepNums} יש מנה גדולה מאוד — רק {cap} הריבועים הראשונים מצוירים שם, מכווצים לאריח מקווקו, ולכן הדיאגרמה אינה בקנה מידה מלא בצעד הזה.',
        two: 'לצעדים {stepNums} יש מנה גדולה מאוד — רק {cap} הריבועים הראשונים מצוירים שם, מכווצים לאריח מקווקו, ולכן הדיאגרמה אינה בקנה מידה מלא בצעדים האלה.',
        other: 'לצעדים {stepNums} יש מנה גדולה מאוד — רק {cap} הריבועים הראשונים מצוירים שם, מכווצים לאריח מקווקו, ולכן הדיאגרמה אינה בקנה מידה מלא בצעדים האלה.'
      },
      nestedTileTitle: 'צעד {step}: \u2066{a} = {q}·{b} + {r}\u2069',
      nestedTileTitleCapped: 'צעד {step}: \u2066{a} = {q}·{b} + {r}\u2069 ({extra} ריבועים נוספים מכווצים כאן)',
      tileEmptyMessage: 'אין מלבן לחיתוך — b כבר שווה ל-0, ולכן האלגוריתם כבר הסתיים.'
    },
    hi: {
      title: 'यूक्लिड का एल्गोरिथ्म',
      heading: 'यूक्लिड का एल्गोरिथ्म',
      lede: 'जोड़ी (a, b) को बार-बार (b, a mod b) से बदलें — बड़ी संख्या को छोटी से भाग दें और केवल शेषफल रखें — और हर चरण में जोड़ी सिकुड़ती जाती है। जिस क्षण एक पक्ष शून्य पर पहुँचता है, दूसरा पक्ष उन दोनों संख्याओं का महत्तम समापवर्तक होता है जिनसे आपने शुरुआत की थी।',
      xref: 'वही महत्तम समापवर्तक उन अभाज्य संख्याओं के रूप में भी देखा जा सकता है जो दोनों संख्याओं में साझा हैं →',
      chipFiveSteps: '240, 46 · 5 चरण',
      chipCoprime: '35, 18 · सह-अभाज्य',
      chipBDividesA: '144, 12 · b, a को विभाजित करता है',
      chipEqualPair: '36, 36 · बराबर जोड़ी',
      chipAlreadyDone: '17, 0 · पहले से पूर्ण',
      chipFibonacciWorst: '89, 55 · फ़िबोनाची की सबसे बुरी स्थिति',
      chipHugeQuotient: '500000, 2 · बहुत बड़ा भागफल',
      run: 'शुरू करें',
      extToggleLabel: 'विस्तारित यूक्लिड मोड — बेज़ू गुणांक {0} और {1} दिखाएँ',
      errBothWhole: 'a और b दोनों पूर्ण संख्याएँ होनी चाहिए।',
      errBothNonNegative: 'a और b दोनों शून्य या धनात्मक होने चाहिए — यहाँ ऋणात्मक संख्याओं का महत्तम समापवर्तक परिभाषित नहीं है।',
      errGcdZeroZero: 'gcd(0, 0) अपरिभाषित है — कम से कम एक अशून्य मान दर्ज करें।',
      errClamped: 'इनपुट अधिकतम {max} तक सीमित हैं — बड़े मान को घटाकर सीमा में कर दिया गया।',
      swapNote: 'बड़ा मान पहले रखा जाता है: ({a}, {b}) के रूप में दर्ज किया गया, gcd({A}, {B}) के रूप में चलाया गया — महत्तम समापवर्तक अपने तर्कों में सममित है।',
      bannerReady: 'तैयार — व्युत्पत्ति को एक-एक पंक्ति करके बनते देखने के लिए "चलाएँ" दबाएँ।',
      bannerDone: { one: 'पूर्ण — महत्तम समापवर्तक तक पहुँचने में {n} चरण लगा।', other: 'पूर्ण — महत्तम समापवर्तक तक पहुँचने में {n} चरण लगे।' },
      chainNoteZero: 'b पहले से ही 0 है, इसलिए भाग देने को कुछ बचा नहीं — a पहले से ही महत्तम समापवर्तक है।',
      extCaption: 'हर पंक्ति के {0} और {1} उस पंक्ति के शेषफल को दोनों मूल इनपुट के एक संयोजन के रूप में व्यक्त करते हैं — {2}।',
      viewNested: 'समाए हुए वर्ग',
      geomViewGroupLabel: 'ज्यामितीय दृश्य मोड',
      viewStep: 'एकल चरण',
      tileAriaDefault: 'वर्तमान भाग-चरण का आयत दृश्य',
      nestedAriaDefault: 'सभी भाग-चरण एक ही आयत में समाए हुए',
      caption: 'लगातार फ़िबोनाची संख्याएँ इस एल्गोरिथ्म के लिए सबसे बुरी स्थिति हैं — वे अपने आकार के हिसाब से सबसे अधिक भाग-चरण करवाती हैं।',
      tileCaptionExact: { one: '{total} में से चरण {index}: {a} ÷ {b}: आयत भुजा {b} के {q} वर्ग से बिल्कुल ढक जाता है — कुछ नहीं बचता, इसलिए {b} महत्तम समापवर्तक है।', other: '{total} में से चरण {index}: {a} ÷ {b}: आयत भुजा {b} के {q} वर्गों से बिल्कुल ढक जाता है — कुछ नहीं बचता, इसलिए {b} महत्तम समापवर्तक है।' },
      tileCaptionLeftover: { one: '{total} में से चरण {index}: {a} = {q}×{b} + {r}: भुजा {b} का {q} वर्ग समाता है, और {b}×{r} का बचा हुआ भाग रह जाता है।', other: '{total} में से चरण {index}: {a} = {q}×{b} + {r}: भुजा {b} के {q} वर्ग समाते हैं, और {b}×{r} का बचा हुआ भाग रह जाता है।' },
      tileNoteCapped: 'वास्तविक भागफल {q} है — यहाँ केवल पहले {cap} वर्ग बनाए गए हैं; शेष {rest} नामांकित टाइल में समेट दिए गए हैं, इसलिए खींची गई चौड़ाई पैमाने के अनुसार नहीं है।',
      nestedEmptyMessage: 'समाने के लिए कोई आयत नहीं है — b पहले से ही 0 है, इसलिए एल्गोरिथ्म पहले ही पूरा हो चुका है।',
      nestedCaption: { one: 'gcd({A}, {B}) = {gcd}: {n} चरण एक {A}×{B} आयत में समा जाता है — सबसे छोटे, {lastB}×{lastB} वर्ग ही महत्तम समापवर्तक हैं। किसी वर्ग पर (या ऊपर किसी चरण पर) क्लिक करके देखें कि वे कैसे बैठते हैं।', other: 'gcd({A}, {B}) = {gcd}: सभी {n} चरण एक {A}×{B} आयत में समा जाते हैं — सबसे छोटे, {lastB}×{lastB} वर्ग ही महत्तम समापवर्तक हैं। किसी वर्ग पर (या ऊपर किसी चरण पर) क्लिक करके देखें कि वे कैसे बैठते हैं।' },
      nestedNoteCapped: { one: 'चरण {stepNums} का भागफल बहुत बड़ा है — वहाँ केवल पहले {cap} वर्ग बनाए गए हैं, जिन्हें एक डैश वाली टाइल में समेट दिया गया है, इसलिए उस चरण पर यह आरेख पूरी तरह पैमाने के अनुसार नहीं है।', other: 'चरण {stepNums} के भागफल बहुत बड़े हैं — वहाँ केवल पहले {cap} वर्ग बनाए गए हैं, जिन्हें एक डैश वाली टाइल में समेट दिया गया है, इसलिए उन चरणों पर यह आरेख पूरी तरह पैमाने के अनुसार नहीं है।' },
      nestedTileTitle: 'चरण {step}: {a} = {q}·{b} + {r}',
      nestedTileTitleCapped: 'चरण {step}: {a} = {q}·{b} + {r} (यहाँ {extra} और वर्ग समेटे गए)',
      tileEmptyMessage: 'काटने के लिए कोई आयत नहीं है — b पहले से ही 0 है, इसलिए एल्गोरिथ्म पहले ही पूरा हो चुका है।'
    },
    ar: {
      title: 'خوارزمية إقليدس',
      heading: 'خوارزمية إقليدس',
      lede: 'استبدل الزوج \u2066(a, b)\u2069 بالزوج \u2066(b, a mod b)\u2069 مرارا — اقسم الأكبر على الأصغر واحتفظ بالباقي فقط — وسيتقلص الزوج في كل خطوة. وفي اللحظة التي يصل فيها أحد الطرفين إلى الصفر يكون الطرف الآخر هو القاسم المشترك الأكبر للعددين اللذين بدأت بهما.',
      xref: 'ويمكن أيضا رؤية القاسم المشترك الأكبر نفسه على أنه الأعداد الأولية التي يشترك فيها العددان ←',
      chipFiveSteps: '\u2066240, 46\u2069 · 5 خطوات',
      chipCoprime: '\u206635, 18\u2069 · أوليان فيما بينهما',
      chipBDividesA: '\u2066144, 12\u2069 · b يقسم a',
      chipEqualPair: '\u206636, 36\u2069 · زوج متساو',
      chipAlreadyDone: '\u206617, 0\u2069 · انتهى بالفعل',
      chipFibonacciWorst: '\u206689, 55\u2069 · أسوأ حالة لفيبوناتشي',
      chipHugeQuotient: '\u2066500000, 2\u2069 · خارج قسمة ضخم',
      run: 'تنفيذ',
      extToggleLabel: 'وضع إقليدس الممتد — عرض معاملات بيزو {0} و {1}',
      errBothWhole: 'يجب أن يكون العددان a و b صحيحين.',
      errBothNonNegative: 'يجب أن يكون العددان a و b صفرا أو موجبين — لا يوجد هنا قاسم مشترك أكبر معرف للأعداد السالبة.',
      errGcdZeroZero: '\u2066gcd(0, 0)\u2069 غير معرف — أدخل قيمة واحدة على الأقل لا تساوي الصفر.',
      errClamped: 'المدخلات محدودة بالقيمة {max} — تم خفض القيمة الأكبر لتناسب ذلك.',
      swapNote: 'القيمة الأكبر تأتي أولا: أدخل الزوج على هيئة \u2066({a}, {b})\u2069 وجرى تتبعه على هيئة \u2066gcd({A}, {B})\u2069 — فالقاسم المشترك الأكبر متماثل في وسيطيه.',
      bannerReady: 'جاهز — اضغط على تشغيل لمشاهدة الاشتقاق وهو يبنى سطرا بعد سطر.',
      bannerDone: {
        zero: 'اكتمل — {n} خطوات للوصول إلى القاسم المشترك الأكبر.',
        one: 'اكتمل — {n} خطوة للوصول إلى القاسم المشترك الأكبر.',
        two: 'اكتمل — {n} خطوتان للوصول إلى القاسم المشترك الأكبر.',
        few: 'اكتمل — {n} خطوات للوصول إلى القاسم المشترك الأكبر.',
        many: 'اكتمل — {n} خطوة للوصول إلى القاسم المشترك الأكبر.',
        other: 'اكتمل — {n} خطوة للوصول إلى القاسم المشترك الأكبر.'
      },
      chainNoteZero: 'b يساوي 0 بالفعل، ولذلك لا يتبقى ما يقسم — وبالتالي a هو القاسم المشترك الأكبر بالفعل.',
      extCaption: '{0} و {1} في كل سطر يعبران عن باقي ذلك السطر كتركيب خطي من المدخلين الأصليين — {2}.',
      viewNested: 'مربعات متداخلة',
      geomViewGroupLabel: 'وضع العرض الهندسي',
      viewStep: 'خطوة واحدة',
      tileAriaDefault: 'عرض مستطيل لخطوة القسمة الحالية',
      nestedAriaDefault: 'كل خطوات القسمة متداخلة في مستطيل واحد',
      caption: 'أعداد فيبوناتشي المتتالية هي أسوأ حالة لهذه الخوارزمية — فهي تفرض أكبر عدد من خطوات القسمة بالنسبة إلى حجمها.',
      tileCaptionExact: {
        zero: 'الخطوة {index} من {total}: \u2066{a} ÷ {b}\u2069: يمكن تغطية المستطيل تماما باستخدام {q} مربعات طول ضلع كل منها {b} — دون باق، ولذلك فإن {b} هو القاسم المشترك الأكبر.',
        one: 'الخطوة {index} من {total}: \u2066{a} ÷ {b}\u2069: يمكن تغطية المستطيل تماما باستخدام {q} مربع طول ضلعه {b} — دون باق، ولذلك فإن {b} هو القاسم المشترك الأكبر.',
        two: 'الخطوة {index} من {total}: \u2066{a} ÷ {b}\u2069: يمكن تغطية المستطيل تماما باستخدام {q} مربعين طول ضلع كل منهما {b} — دون باق، ولذلك فإن {b} هو القاسم المشترك الأكبر.',
        few: 'الخطوة {index} من {total}: \u2066{a} ÷ {b}\u2069: يمكن تغطية المستطيل تماما باستخدام {q} مربعات طول ضلع كل منها {b} — دون باق، ولذلك فإن {b} هو القاسم المشترك الأكبر.',
        many: 'الخطوة {index} من {total}: \u2066{a} ÷ {b}\u2069: يمكن تغطية المستطيل تماما باستخدام {q} مربعا طول ضلع كل منها {b} — دون باق، ولذلك فإن {b} هو القاسم المشترك الأكبر.',
        other: 'الخطوة {index} من {total}: \u2066{a} ÷ {b}\u2069: يمكن تغطية المستطيل تماما باستخدام {q} مربع طول ضلع كل منها {b} — دون باق، ولذلك فإن {b} هو القاسم المشترك الأكبر.'
      },
      tileCaptionLeftover: {
        zero: 'الخطوة {index} من {total}: \u2066{a} = {q}×{b} + {r}\u2069: يتسع {q} مربعات طول ضلع كل منها {b}، ويتبقى مستطيل مقاسه \u2066{b}×{r}\u2069.',
        one: 'الخطوة {index} من {total}: \u2066{a} = {q}×{b} + {r}\u2069: يتسع {q} مربع طول ضلعه {b}، ويتبقى مستطيل مقاسه \u2066{b}×{r}\u2069.',
        two: 'الخطوة {index} من {total}: \u2066{a} = {q}×{b} + {r}\u2069: يتسع {q} مربعان طول ضلع كل منهما {b}، ويتبقى مستطيل مقاسه \u2066{b}×{r}\u2069.',
        few: 'الخطوة {index} من {total}: \u2066{a} = {q}×{b} + {r}\u2069: يتسع {q} مربعات طول ضلع كل منها {b}، ويتبقى مستطيل مقاسه \u2066{b}×{r}\u2069.',
        many: 'الخطوة {index} من {total}: \u2066{a} = {q}×{b} + {r}\u2069: يتسع {q} مربعا طول ضلع كل منها {b}، ويتبقى مستطيل مقاسه \u2066{b}×{r}\u2069.',
        other: 'الخطوة {index} من {total}: \u2066{a} = {q}×{b} + {r}\u2069: يتسع {q} مربع طول ضلع كل منها {b}، ويتبقى مستطيل مقاسه \u2066{b}×{r}\u2069.'
      },
      tileNoteCapped: 'خارج القسمة الحقيقي هو {q} — لا يرسم هنا سوى أول {cap} من المربعات؛ وتطوى المربعات المتبقية وعددها {rest} في البلاطة المسماة، ولذلك فإن العرض المرسوم ليس بمقياس رسم حقيقي.',
      nestedEmptyMessage: 'لا يوجد مستطيل يمكن تضمين المربعات فيه — b يساوي 0 بالفعل، ولذلك اكتملت الخوارزمية.',
      nestedCaption: {
        zero: '\u2066gcd({A}, {B}) = {gcd}\u2069: تتداخل كل {n} خطوات في مستطيل واحد \u2066{A}×{B}\u2069 — المربعات الأصغر، \u2066{lastB}×{lastB}\u2069، هي القاسم المشترك الأكبر. انقر على مربع (أو على خطوة في الأعلى) لترى كيف تصطف.',
        one: '\u2066gcd({A}, {B}) = {gcd}\u2069: تتداخل كل {n} خطوة في مستطيل واحد \u2066{A}×{B}\u2069 — المربعات الأصغر، \u2066{lastB}×{lastB}\u2069، هي القاسم المشترك الأكبر. انقر على مربع (أو على خطوة في الأعلى) لترى كيف تصطف.',
        two: '\u2066gcd({A}, {B}) = {gcd}\u2069: تتداخل كل {n} خطوتين في مستطيل واحد \u2066{A}×{B}\u2069 — المربعات الأصغر، \u2066{lastB}×{lastB}\u2069، هي القاسم المشترك الأكبر. انقر على مربع (أو على خطوة في الأعلى) لترى كيف تصطف.',
        few: '\u2066gcd({A}, {B}) = {gcd}\u2069: تتداخل كل {n} خطوات في مستطيل واحد \u2066{A}×{B}\u2069 — المربعات الأصغر، \u2066{lastB}×{lastB}\u2069، هي القاسم المشترك الأكبر. انقر على مربع (أو على خطوة في الأعلى) لترى كيف تصطف.',
        many: '\u2066gcd({A}, {B}) = {gcd}\u2069: تتداخل كل {n} خطوة في مستطيل واحد \u2066{A}×{B}\u2069 — المربعات الأصغر، \u2066{lastB}×{lastB}\u2069، هي القاسم المشترك الأكبر. انقر على مربع (أو على خطوة في الأعلى) لترى كيف تصطف.',
        other: '\u2066gcd({A}, {B}) = {gcd}\u2069: تتداخل كل {n} خطوة في مستطيل واحد \u2066{A}×{B}\u2069 — المربعات الأصغر، \u2066{lastB}×{lastB}\u2069، هي القاسم المشترك الأكبر. انقر على مربع (أو على خطوة في الأعلى) لترى كيف تصطف.'
      },
      nestedNoteCapped: {
        zero: 'الخطوات {stepNums} لها خارج قسمة كبير جدا — لا يرسم هناك سوى أول {cap} من المربعات، وتطوى في بلاطة متقطعة، ولذلك فإن هذا المخطط ليس بمقياس رسم كامل في تلك الخطوات.',
        one: 'الخطوة {stepNums} لها خارج قسمة كبير جدا — لا يرسم هناك سوى أول {cap} من المربعات، وتطوى في بلاطة متقطعة، ولذلك فإن هذا المخطط ليس بمقياس رسم كامل في هذه الخطوة.',
        two: 'الخطوتان {stepNums} لهما خارج قسمة كبير جدا — لا يرسم هناك سوى أول {cap} من المربعات، وتطوى في بلاطة متقطعة، ولذلك فإن هذا المخطط ليس بمقياس رسم كامل في هاتين الخطوتين.',
        few: 'الخطوات {stepNums} لها خارج قسمة كبير جدا — لا يرسم هناك سوى أول {cap} من المربعات، وتطوى في بلاطة متقطعة، ولذلك فإن هذا المخطط ليس بمقياس رسم كامل في تلك الخطوات.',
        many: 'الخطوات {stepNums} لها خارج قسمة كبير جدا — لا يرسم هناك سوى أول {cap} من المربعات، وتطوى في بلاطة متقطعة، ولذلك فإن هذا المخطط ليس بمقياس رسم كامل في تلك الخطوات.',
        other: 'الخطوات {stepNums} لها خارج قسمة كبير جدا — لا يرسم هناك سوى أول {cap} من المربعات، وتطوى في بلاطة متقطعة، ولذلك فإن هذا المخطط ليس بمقياس رسم كامل في تلك الخطوات.'
      },
      nestedTileTitle: 'الخطوة {step}: \u2066{a} = {q}·{b} + {r}\u2069',
      nestedTileTitleCapped: 'الخطوة {step}: \u2066{a} = {q}·{b} + {r}\u2069 (عدد المربعات الإضافية المطوية هنا: {extra})',
      tileEmptyMessage: 'لا يوجد مستطيل لتقطيعه — b يساوي 0 بالفعل، ولذلك اكتملت الخوارزمية.'
    }
  });
})();
