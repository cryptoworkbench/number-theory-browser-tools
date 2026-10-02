/* assets/i18n/group-isomorphism.js — the 'iso' namespace: title, eyebrow,
   heading, lede, cross-link text, the pair select's label/aria-label, the
   Randomize control, the layout tablist and its two tabs, both wheels'
   aria-labels, the per-wedge aria-label templates, the two wheel captions,
   the correspondence readout (all three states: no selection, one element,
   both elements agreeing or disagreeing), the reference-list heading and
   count, and the bottom formula line for the Group Isomorphism tool, in all
   seven supported languages.

   Classic script, IIFE, "use strict" — its only statement is
   NT.i18n.register(...). Every key is plain text (no plural entries in this
   namespace — refCount's English source never shows a singular form).
   Pure math notation (Z/nZ, (Z/mZ)*, k ↦ g^k mod m, mod, the element-count
   "n=", "m=", "g=" labels on the select's own options and the reference
   list's row text) is written identically in every language per
   06-GLOSSARY.md section (e) and is built directly in the page script with
   no dictionary key. "generator" (formula's parenthetical) and the "via"/
   connector word DO differ per language, following 06-GLOSSARY.md's
   generator/primitive root row. leftCaption/rightCaption/readoutOne/
   readoutBothAgree/readoutBothDisagree's {bSpan}/{aSlot}/{aValSlot}/
   {eqSpan}/{spanA}/{spanB}/{spanSum}/{eqLeft}/{aValSpan}/{bValSpan}/
   {productSpan}/{modSpan}/{warnSpan} placeholders are DOM nodes (a <b> or a
   colored/mono <span>) supplied by the page script, rendered via
   translateInto, never innerHTML. Randomize is NOT shared via `common`
   (this plan cannot edit assets/i18n/site.js) and is duplicated, worded
   identically to the Equivalence Wheel and Cayley Table's own randomize
   strings, in this file. Must load after assets/nt-i18n.js and
   assets/i18n/site.js, before the page's own inline <script>.
*/
(function () {
  "use strict";

  NT.i18n.register('iso', {
    nl: {
      title: 'Groepsisomorfismen',
      eyebrow: 'twee rekenstelsels, één groep',
      heading: 'Groepsisomorfismen',
      lede: 'De gehele getallen mod n onder optelling en de eenheden mod m onder vermenigvuldiging kunnen structureel exact dezelfde groep zijn — ze dragen alleen een andere rekenkundige jas. {0}',
      xref: 'Bekijk deze twee groepen één voor één opgebouwd →',
      pairLabel: 'Isomorf paar',
      pairSelectAriaLabel: 'Kies een isomorf paar',
      randomizeLabel: 'Willekeurig',
      randomize: 'Nieuw willekeurig voorbeeld',
      tablistLabel: 'Indeling rechterwiel',
      tabPowers: 'Machten van g',
      tabNumeric: 'Numeriek',
      leftWheelAriaLabel: 'Elementen van de additieve groep Z mod n',
      rightWheelAriaLabel: 'Elementen van de multiplicatieve groep eenheden mod m',
      refHeading: 'Isomorfe paren',
      leftWedgeAriaLabel: 'Element {value} van de additieve groep Z mod {n}',
      rightWedgeAriaLabel: 'Element {value} van de multiplicatieve groep eenheden mod {m}, gelijk aan {g} tot de macht {k} mod {m}',
      leftCaption: 'De additieve groep {bSpan}: de gehele getallen 0 tot en met {max} onder optelling mod {n}.',
      rightCaption: 'De multiplicatieve groep {bSpan}: de {n} eenheden mod {m} onder vermenigvuldiging, voortgebracht door {g}.',
      readoutPrompt: 'Klik op een element op een van beide wielen om de overeenkomst te zien.',
      readoutOne: 'Element {aSlot} links komt overeen met {aValSlot} rechts: {eqSpan}. Klik op een tweede element — of nogmaals op dit element — om de som en het product te zien.',
      readoutBothAgree: '{spanA} + {spanB} = {spanSum} links ({eqLeft}) — {aValSpan} × {bValSpan} = {productSpan} rechts ({modSpan}) — en {product} = {g}^{sum} mod {m} = {sumVal}: het beeld van de som is gelijk aan het product van de beelden.',
      readoutBothDisagree: '{spanA} + {spanB} = {spanSum} links ({eqLeft}) — {aValSpan} × {bValSpan} = {productSpan} rechts ({modSpan}) — {warnSpan}',
      readoutWarn: '{product} is niet gelijk aan {g}^{sum} mod {m} = {sumVal} — dit paar zou nooit mogen verschillen.',
      eqTooLarge: '{g}^{a} ≡ {val} (mod {m}) (te groot om de ongereduceerde macht exact te tonen)',
      refCount: '{count} paren (m ≤ {max})',
      formula: 'Z/{n}Z ≅ (Z/{m}Z)*   via   k ↦ {g}^k mod {m}   (voortbrenger g = {g})'
    },
    en: {
      title: 'Group Isomorphisms',
      eyebrow: 'two arithmetics, one group',
      heading: 'Group Isomorphisms',
      lede: 'The integers mod n under addition and the units mod m under multiplication can be, structurally, the exact same group — just wearing different arithmetic. {0}',
      xref: 'See these two groups built one at a time →',
      pairLabel: 'Isomorphic pair',
      pairSelectAriaLabel: 'Choose an isomorphic pair',
      randomizeLabel: 'Randomize',
      randomize: 'New random example',
      tablistLabel: 'Right wheel layout',
      tabPowers: 'Powers of g',
      tabNumeric: 'Numeric',
      leftWheelAriaLabel: 'Elements of the additive group Z mod n',
      rightWheelAriaLabel: 'Elements of the multiplicative group of units mod m',
      refHeading: 'Isomorphic pairs',
      leftWedgeAriaLabel: 'Element {value} of the additive group Z mod {n}',
      rightWedgeAriaLabel: 'Element {value} of the multiplicative group of units mod {m}, equal to {g} to the power {k} mod {m}',
      leftCaption: 'The additive group {bSpan}: the integers 0 through {max} under addition mod {n}.',
      rightCaption: 'The multiplicative group {bSpan}: the {n} units mod {m} under multiplication, generated by {g}.',
      readoutPrompt: 'Click an element on either wheel to see the correspondence.',
      readoutOne: 'Element {aSlot} on the left corresponds to {aValSlot} on the right: {eqSpan}. Click a second element — or this same one again — to see the sum and product.',
      readoutBothAgree: '{spanA} + {spanB} = {spanSum} on the left ({eqLeft}) — {aValSpan} × {bValSpan} = {productSpan} on the right ({modSpan}) — and {product} = {g}^{sum} mod {m} = {sumVal}: the sum’s image equals the product of the images.',
      readoutBothDisagree: '{spanA} + {spanB} = {spanSum} on the left ({eqLeft}) — {aValSpan} × {bValSpan} = {productSpan} on the right ({modSpan}) — {warnSpan}',
      readoutWarn: '{product} does not equal {g}^{sum} mod {m} = {sumVal} — this pair should never disagree.',
      eqTooLarge: '{g}^{a} ≡ {val} (mod {m}) (too large to show the un-reduced power exactly)',
      refCount: '{count} pairs (m ≤ {max})',
      formula: 'Z/{n}Z ≅ (Z/{m}Z)*   via   k ↦ {g}^k mod {m}   (generator g = {g})'
    },
    de: {
      title: 'Gruppenisomorphismen',
      eyebrow: 'zwei Arithmetiken, eine Gruppe',
      heading: 'Gruppenisomorphismen',
      lede: 'Die ganzen Zahlen mod n unter Addition und die Einheiten mod m unter Multiplikation können strukturell genau dieselbe Gruppe sein — sie tragen nur eine andere Arithmetik. {0}',
      xref: 'Sieh dir an, wie diese beiden Gruppen einzeln aufgebaut werden →',
      pairLabel: 'Isomorphes Paar',
      pairSelectAriaLabel: 'Wähle ein isomorphes Paar',
      randomizeLabel: 'Zufällig',
      randomize: 'Neues Zufallsbeispiel',
      tablistLabel: 'Layout des rechten Rads',
      tabPowers: 'Potenzen von g',
      tabNumeric: 'Numerisch',
      leftWheelAriaLabel: 'Elemente der additiven Gruppe Z mod n',
      rightWheelAriaLabel: 'Elemente der multiplikativen Gruppe der Einheiten mod m',
      refHeading: 'Isomorphe Paare',
      leftWedgeAriaLabel: 'Element {value} der additiven Gruppe Z mod {n}',
      rightWedgeAriaLabel: 'Element {value} der multiplikativen Gruppe der Einheiten mod {m}, gleich {g} hoch {k} mod {m}',
      leftCaption: 'Die additive Gruppe {bSpan}: die ganzen Zahlen 0 bis {max} unter Addition mod {n}.',
      rightCaption: 'Die multiplikative Gruppe {bSpan}: die {n} Einheiten mod {m} unter Multiplikation, erzeugt von {g}.',
      readoutPrompt: 'Klicke auf ein Element auf einem der beiden Räder, um die Entsprechung zu sehen.',
      readoutOne: 'Element {aSlot} links entspricht {aValSlot} rechts: {eqSpan}. Klicke auf ein zweites Element — oder noch einmal auf dieses — um die Summe und das Produkt zu sehen.',
      readoutBothAgree: '{spanA} + {spanB} = {spanSum} links ({eqLeft}) — {aValSpan} × {bValSpan} = {productSpan} rechts ({modSpan}) — und {product} = {g}^{sum} mod {m} = {sumVal}: das Bild der Summe entspricht dem Produkt der Bilder.',
      readoutBothDisagree: '{spanA} + {spanB} = {spanSum} links ({eqLeft}) — {aValSpan} × {bValSpan} = {productSpan} rechts ({modSpan}) — {warnSpan}',
      readoutWarn: '{product} entspricht nicht {g}^{sum} mod {m} = {sumVal} — dieses Paar sollte niemals abweichen.',
      eqTooLarge: '{g}^{a} ≡ {val} (mod {m}) (zu groß, um die ungekürzte Potenz exakt anzuzeigen)',
      refCount: '{count} Paare (m ≤ {max})',
      formula: 'Z/{n}Z ≅ (Z/{m}Z)*   über   k ↦ {g}^k mod {m}   (Erzeuger g = {g})'
    },
    fr: {
      title: 'Isomorphismes de groupes',
      eyebrow: 'deux arithmétiques, un seul groupe',
      heading: 'Isomorphismes de groupes',
      lede: 'Les entiers mod n sous l’addition et les unités mod m sous la multiplication peuvent être, structurellement, exactement le même groupe — ils portent simplement une arithmétique différente. {0}',
      xref: 'Voir ces deux groupes construits un par un →',
      pairLabel: 'Paire isomorphe',
      pairSelectAriaLabel: 'Choisissez une paire isomorphe',
      randomizeLabel: 'Aléatoire',
      randomize: 'Nouvel exemple aléatoire',
      tablistLabel: 'Disposition de la roue droite',
      tabPowers: 'Puissances de g',
      tabNumeric: 'Numérique',
      leftWheelAriaLabel: 'Éléments du groupe additif Z mod n',
      rightWheelAriaLabel: 'Éléments du groupe multiplicatif des unités mod m',
      refHeading: 'Paires isomorphes',
      leftWedgeAriaLabel: 'Élément {value} du groupe additif Z mod {n}',
      rightWedgeAriaLabel: 'Élément {value} du groupe multiplicatif des unités mod {m}, égal à {g} puissance {k} mod {m}',
      leftCaption: 'Le groupe additif {bSpan} : les entiers de 0 à {max} sous l’addition mod {n}.',
      rightCaption: 'Le groupe multiplicatif {bSpan} : les {n} unités mod {m} sous la multiplication, engendré par {g}.',
      readoutPrompt: 'Cliquez sur un élément de l’une des deux roues pour voir la correspondance.',
      readoutOne: 'L’élément {aSlot} à gauche correspond à {aValSlot} à droite : {eqSpan}. Cliquez sur un deuxième élément — ou de nouveau sur celui-ci — pour voir la somme et le produit.',
      readoutBothAgree: '{spanA} + {spanB} = {spanSum} à gauche ({eqLeft}) — {aValSpan} × {bValSpan} = {productSpan} à droite ({modSpan}) — et {product} = {g}^{sum} mod {m} = {sumVal} : l’image de la somme est égale au produit des images.',
      readoutBothDisagree: '{spanA} + {spanB} = {spanSum} à gauche ({eqLeft}) — {aValSpan} × {bValSpan} = {productSpan} à droite ({modSpan}) — {warnSpan}',
      readoutWarn: '{product} n’est pas égal à {g}^{sum} mod {m} = {sumVal} — cette paire ne devrait jamais diverger.',
      eqTooLarge: '{g}^{a} ≡ {val} (mod {m}) (trop grand pour afficher exactement la puissance non réduite)',
      refCount: '{count} paires (m ≤ {max})',
      formula: 'Z/{n}Z ≅ (Z/{m}Z)*   par   k ↦ {g}^k mod {m}   (générateur g = {g})'
    },
    es: {
      title: 'Isomorfismos de grupos',
      eyebrow: 'dos aritméticas, un solo grupo',
      heading: 'Isomorfismos de grupos',
      lede: 'Los enteros mod n bajo la suma y las unidades mod m bajo la multiplicación pueden ser, estructuralmente, exactamente el mismo grupo — solo llevan una aritmética diferente. {0}',
      xref: 'Ver estos dos grupos construidos uno por uno →',
      pairLabel: 'Par isomorfo',
      pairSelectAriaLabel: 'Elige un par isomorfo',
      randomizeLabel: 'Aleatorio',
      randomize: 'Nuevo ejemplo aleatorio',
      tablistLabel: 'Disposición de la rueda derecha',
      tabPowers: 'Potencias de g',
      tabNumeric: 'Numérico',
      leftWheelAriaLabel: 'Elementos del grupo aditivo Z mod n',
      rightWheelAriaLabel: 'Elementos del grupo multiplicativo de unidades mod m',
      refHeading: 'Pares isomorfos',
      leftWedgeAriaLabel: 'Elemento {value} del grupo aditivo Z mod {n}',
      rightWedgeAriaLabel: 'Elemento {value} del grupo multiplicativo de unidades mod {m}, igual a {g} elevado a {k} mod {m}',
      leftCaption: 'El grupo aditivo {bSpan}: los enteros de 0 a {max} bajo la suma mod {n}.',
      rightCaption: 'El grupo multiplicativo {bSpan}: las {n} unidades mod {m} bajo la multiplicación, generado por {g}.',
      readoutPrompt: 'Haz clic en un elemento de cualquiera de las dos ruedas para ver la correspondencia.',
      readoutOne: 'El elemento {aSlot} a la izquierda corresponde a {aValSlot} a la derecha: {eqSpan}. Haz clic en un segundo elemento — o de nuevo en este mismo — para ver la suma y el producto.',
      readoutBothAgree: '{spanA} + {spanB} = {spanSum} a la izquierda ({eqLeft}) — {aValSpan} × {bValSpan} = {productSpan} a la derecha ({modSpan}) — y {product} = {g}^{sum} mod {m} = {sumVal}: la imagen de la suma es igual al producto de las imágenes.',
      readoutBothDisagree: '{spanA} + {spanB} = {spanSum} a la izquierda ({eqLeft}) — {aValSpan} × {bValSpan} = {productSpan} a la derecha ({modSpan}) — {warnSpan}',
      readoutWarn: '{product} no es igual a {g}^{sum} mod {m} = {sumVal} — este par nunca debería discrepar.',
      eqTooLarge: '{g}^{a} ≡ {val} (mod {m}) (demasiado grande para mostrar exactamente la potencia sin reducir)',
      refCount: '{count} pares (m ≤ {max})',
      formula: 'Z/{n}Z ≅ (Z/{m}Z)*   mediante   k ↦ {g}^k mod {m}   (generador g = {g})'
    },
    it: {
      title: 'Isomorfismi di gruppi',
      eyebrow: 'due aritmetiche, un solo gruppo',
      heading: 'Isomorfismi di gruppi',
      lede: 'Gli interi mod n sotto l’addizione e le unità mod m sotto la moltiplicazione possono essere, strutturalmente, esattamente lo stesso gruppo — indossano solo un’aritmetica diversa. {0}',
      xref: 'Guarda questi due gruppi costruiti uno alla volta →',
      pairLabel: 'Coppia isomorfa',
      pairSelectAriaLabel: 'Scegli una coppia isomorfa',
      randomizeLabel: 'Casuale',
      randomize: 'Nuovo esempio casuale',
      tablistLabel: 'Disposizione della ruota destra',
      tabPowers: 'Potenze di g',
      tabNumeric: 'Numerico',
      leftWheelAriaLabel: 'Elementi del gruppo additivo Z mod n',
      rightWheelAriaLabel: 'Elementi del gruppo moltiplicativo delle unità mod m',
      refHeading: 'Coppie isomorfe',
      leftWedgeAriaLabel: 'Elemento {value} del gruppo additivo Z mod {n}',
      rightWedgeAriaLabel: 'Elemento {value} del gruppo moltiplicativo delle unità mod {m}, uguale a {g} elevato a {k} mod {m}',
      leftCaption: 'Il gruppo additivo {bSpan}: gli interi da 0 a {max} sotto l’addizione mod {n}.',
      rightCaption: 'Il gruppo moltiplicativo {bSpan}: le {n} unità mod {m} sotto la moltiplicazione, generato da {g}.',
      readoutPrompt: 'Clicca su un elemento di una delle due ruote per vedere la corrispondenza.',
      readoutOne: 'L’elemento {aSlot} a sinistra corrisponde a {aValSlot} a destra: {eqSpan}. Clicca su un secondo elemento — o di nuovo su questo stesso — per vedere la somma e il prodotto.',
      readoutBothAgree: '{spanA} + {spanB} = {spanSum} a sinistra ({eqLeft}) — {aValSpan} × {bValSpan} = {productSpan} a destra ({modSpan}) — e {product} = {g}^{sum} mod {m} = {sumVal}: l’immagine della somma è uguale al prodotto delle immagini.',
      readoutBothDisagree: '{spanA} + {spanB} = {spanSum} a sinistra ({eqLeft}) — {aValSpan} × {bValSpan} = {productSpan} a destra ({modSpan}) — {warnSpan}',
      readoutWarn: '{product} non è uguale a {g}^{sum} mod {m} = {sumVal} — questa coppia non dovrebbe mai discordare.',
      eqTooLarge: '{g}^{a} ≡ {val} (mod {m}) (troppo grande per mostrare esattamente la potenza non ridotta)',
      refCount: '{count} coppie (m ≤ {max})',
      formula: 'Z/{n}Z ≅ (Z/{m}Z)*   tramite   k ↦ {g}^k mod {m}   (generatore g = {g})'
    },
    pl: {
      title: 'Izomorfizmy grup',
      eyebrow: 'dwie arytmetyki, jedna grupa',
      heading: 'Izomorfizmy grup',
      lede: 'Liczby całkowite modulo n z dodawaniem i elementy odwracalne modulo m z mnożeniem mogą być, strukturalnie, dokładnie tą samą grupą — różni je tylko inna arytmetyka. {0}',
      xref: 'Zobacz, jak te dwie grupy są budowane jedna po drugiej →',
      pairLabel: 'Para izomorficzna',
      pairSelectAriaLabel: 'Wybierz parę izomorficzną',
      randomizeLabel: 'Losowo',
      randomize: 'Nowy losowy przykład',
      tablistLabel: 'Układ prawego koła',
      tabPowers: 'Potęgi g',
      tabNumeric: 'Numerycznie',
      leftWheelAriaLabel: 'Elementy grupy addytywnej Z modulo n',
      rightWheelAriaLabel: 'Elementy grupy multiplikatywnej elementów odwracalnych modulo m',
      refHeading: 'Pary izomorficzne',
      leftWedgeAriaLabel: 'Element {value} grupy addytywnej Z modulo {n}',
      rightWedgeAriaLabel: 'Element {value} grupy multiplikatywnej elementów odwracalnych modulo {m}, równy {g} do potęgi {k} modulo {m}',
      leftCaption: 'Grupa addytywna {bSpan}: liczby całkowite od 0 do {max} z dodawaniem modulo {n}.',
      rightCaption: 'Grupa multiplikatywna {bSpan}: {n} elementów odwracalnych modulo {m} z mnożeniem, generowana przez {g}.',
      readoutPrompt: 'Kliknij element na jednym z kół, aby zobaczyć odpowiedniość.',
      readoutOne: 'Element {aSlot} po lewej odpowiada {aValSlot} po prawej: {eqSpan}. Kliknij drugi element — lub ponownie ten sam — aby zobaczyć sumę i iloczyn.',
      readoutBothAgree: '{spanA} + {spanB} = {spanSum} po lewej ({eqLeft}) — {aValSpan} × {bValSpan} = {productSpan} po prawej ({modSpan}) — a {product} = {g}^{sum} mod {m} = {sumVal}: obraz sumy jest równy iloczynowi obrazów.',
      readoutBothDisagree: '{spanA} + {spanB} = {spanSum} po lewej ({eqLeft}) — {aValSpan} × {bValSpan} = {productSpan} po prawej ({modSpan}) — {warnSpan}',
      readoutWarn: '{product} nie jest równe {g}^{sum} mod {m} = {sumVal} — ta para nigdy nie powinna się różnić.',
      eqTooLarge: '{g}^{a} ≡ {val} (mod {m}) (za duże, aby pokazać nieredukowaną potęgę dokładnie)',
      refCount: '{count} par (m ≤ {max})',
      formula: 'Z/{n}Z ≅ (Z/{m}Z)*   przez   k ↦ {g}^k mod {m}   (generator g = {g})'
    }
  });
})();
