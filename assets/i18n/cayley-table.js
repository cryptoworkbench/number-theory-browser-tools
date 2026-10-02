/* assets/i18n/cayley-table.js — the 'cayley' namespace: title, eyebrow,
   heading, lede, cross-link text, mode-tab panel labels, the modulus field
   and Randomize control, the table-scroll label, the four legend items, the
   validation note, the group summary / identity / symmetry notes, the
   table caption, the equation caption and the per-cell notes for the
   Cayley Table tool, in all six supported languages.

   Classic script, IIFE, "use strict" — its only statement is
   NT.i18n.register(...). summaryAdditive and summaryMultiplicative are
   plural entries ({ one, other }); every other key is plain text. The
   operation signs (+, ×, ·) and all notation (ℤ/Nℤ, φ(N), ≡, mod) are
   written identically in every language per 06-GLOSSARY.md section (e) —
   only the prose around them is translated. legend.* values are rich
   templates (the swatch <span> renders as {0}). equationCaption's {spanA},
   {spanB}, {spanSum} placeholders are colored <span> nodes supplied by the
   page script, rendered via translateInto, never innerHTML. Additive
   Groups / Multiplicative Groups live in the shared `common` namespace
   (assets/i18n/site.js), never duplicated here; Randomize is NOT shared
   (06-04 cannot edit assets/i18n/site.js) and is duplicated, worded
   identically, in both this file and assets/i18n/equivalence-wheel.js.
   Must load after assets/nt-i18n.js and assets/i18n/site.js, before the
   page's own inline <script>.
*/
(function () {
  "use strict";

  NT.i18n.register('cayley', {
    nl: {
      title: 'Cayleytabel',
      eyebrow: 'groepentheorie · bewerkingstabellen',
      heading: 'Cayleytabel',
      lede: 'De volledige bewerking van een groep past in één vierkante tabel — één rij en één kolom per element, één cel voor elk resultaat. Elk structureel feit over die groep — haar identiteit, haar inversen, haar commutativiteit — is zichtbaar ergens in de vorm van de tabel.',
      xref: 'Dezelfde twee groepsbewerkingen, nu als taartpunten op een wiel in plaats van rijen in een tabel →',
      tablistLabel: 'Groepsbewerking',
      nLabel: 'N — modulus',
      randomizeLabel: 'Willekeurig',
      randomize: 'Nieuw willekeurig voorbeeld',
      tableScrollLabel: 'Cayleytabel, schuifbaar',
      'legend.identity': '{0} Rij & kolom van de identiteit',
      'legend.inverse': '{0} Eigen inverse (zelfgepaard)',
      'legend.selected': '{0} Geselecteerde cel',
      'legend.mirror': '{0} Spiegeltweeling over de diagonaal',
      nNoteNotWhole: 'N moet een geheel getal zijn — de tabel blijft zoals hij was.',
      nNoteTooSmall: 'N kan niet onder 1 — verhoogd naar 1.',
      nNoteCapped: 'N is begrensd op {max} zodat de tabel niet te groot wordt — verlaagd naar {max}.',
      identityWordAdditive: 'nul',
      identityWordMultiplicative: 'één',
      inverseWordAdditive: 'haar eigen tegengestelde',
      inverseWordMultiplicative: 'zijn eigen omgekeerde',
      identityNote: 'De identiteit is {word} — haar rij en kolom zijn hieronder gemarkeerd.',
      symmetryNoteAdditive: 'a + b en b + a landen altijd in dezelfde klasse, dus de tabel spiegelt zichzelf over de diagonaal — klik op een willekeurige cel om haar tweeling aan de overkant te zien oplichten.',
      symmetryNoteMultiplicative: 'a · b en b · a landen altijd in dezelfde klasse, dus de tabel spiegelt zichzelf over de diagonaal — klik op een willekeurige cel om haar tweeling aan de overkant te zien oplichten.',
      summaryAdditive: {
        one: 'ℤ/{n}ℤ · {count} element · identiteit [{id}]',
        other: 'ℤ/{n}ℤ · {count} elementen · identiteit [{id}]'
      },
      summaryMultiplicative: {
        one: '(ℤ/{n}ℤ)ˣ · φ({n}) = {count} element · identiteit [{id}]',
        other: '(ℤ/{n}ℤ)ˣ · φ({n}) = {count} elementen · identiteit [{id}]'
      },
      tableCaption: 'Cayleytabel voor {summary} onder {sign}',
      noteDiagonal: 'Deze cel ligt op de diagonale as — zij is haar eigen tweeling, met maar één vergelijking om te noemen: {a} {sign} {a} = {raw} ≡ {val} (mod {n}).',
      noteCommutative: '{a} {sign} {b} = {rawAB} ≡ {val} (mod {n}), en {b} {sign} {a} = {rawBA} ≡ {val} (mod {n}) — beide landen op dezelfde waarde, dus de tabel is symmetrisch om haar diagonaal: de groep is commutatief.',
      selfInverseNote: '{a} is {word}, want haar waarde hier is de identiteit.',
      equationCaption: '{spanA} {sign} {spanB} = {spanSum} — {a} {sign} {b} = {raw} ≡ {val} (mod {n}).'
    },
    en: {
      title: 'Cayley Table',
      eyebrow: 'group theory · operation tables',
      heading: 'Cayley Table',
      lede: "A group's entire operation fits in one square table — one row and one column per element, one cell for every result. Every structural fact about that group — its identity, its inverses, its commutativity — sits visibly somewhere in the table's shape.",
      xref: 'The same two group operations, seen as wedges on a wheel instead of rows in a table →',
      tablistLabel: 'Group operation',
      nLabel: 'N — modulus',
      randomizeLabel: 'Randomize',
      randomize: 'New random example',
      tableScrollLabel: 'Cayley table, scrollable',
      'legend.identity': "{0} Identity's row & column",
      'legend.inverse': '{0} Own inverse (self-paired)',
      'legend.selected': '{0} Selected cell',
      'legend.mirror': '{0} Mirror twin across the diagonal',
      nNoteNotWhole: 'N must be a whole number — the table stays as it was.',
      nNoteTooSmall: "N can't go below 1 — raised to 1.",
      nNoteCapped: 'N is capped at {max} to keep the table from growing too large — lowered to {max}.',
      identityWordAdditive: 'zero',
      identityWordMultiplicative: 'one',
      inverseWordAdditive: 'its own negative',
      inverseWordMultiplicative: 'its own reciprocal',
      identityNote: 'The identity is {word} — its row and column are marked below.',
      symmetryNoteAdditive: 'a + b and b + a always land in the same class, so the table mirrors itself across the diagonal — click any cell to watch its twin light up on the far side.',
      symmetryNoteMultiplicative: 'a · b and b · a always land in the same class, so the table mirrors itself across the diagonal — click any cell to watch its twin light up on the far side.',
      summaryAdditive: {
        one: 'ℤ/{n}ℤ · {count} element · identity [{id}]',
        other: 'ℤ/{n}ℤ · {count} elements · identity [{id}]'
      },
      summaryMultiplicative: {
        one: '(ℤ/{n}ℤ)ˣ · φ({n}) = {count} element · identity [{id}]',
        other: '(ℤ/{n}ℤ)ˣ · φ({n}) = {count} elements · identity [{id}]'
      },
      tableCaption: 'Cayley table for {summary} under {sign}',
      noteDiagonal: 'This cell sits on the diagonal axis — it is its own twin, with only one equation to state: {a} {sign} {a} = {raw} ≡ {val} (mod {n}).',
      noteCommutative: '{a} {sign} {b} = {rawAB} ≡ {val} (mod {n}), and {b} {sign} {a} = {rawBA} ≡ {val} (mod {n}) — both land on the same value, so the table is symmetric about its diagonal: the group is commutative.',
      selfInverseNote: '{a} is {word}, since its value here is the identity.',
      equationCaption: '{spanA} {sign} {spanB} = {spanSum} — {a} {sign} {b} = {raw} ≡ {val} (mod {n}).'
    },
    de: {
      title: 'Cayley-Tafel',
      eyebrow: 'Gruppentheorie · Verknüpfungstafeln',
      heading: 'Cayley-Tafel',
      lede: 'Die gesamte Verknüpfung einer Gruppe passt in eine quadratische Tafel — eine Zeile und eine Spalte pro Element, ein Feld für jedes Ergebnis. Jede strukturelle Tatsache über diese Gruppe — ihre Identität, ihre Inversen, ihre Kommutativität — zeigt sich irgendwo sichtbar in der Form der Tafel.',
      xref: 'Dieselben zwei Gruppenverknüpfungen, jetzt als Kreissegmente auf einem Rad statt als Zeilen in einer Tafel →',
      tablistLabel: 'Gruppenverknüpfung',
      nLabel: 'N — Modul',
      randomizeLabel: 'Zufällig',
      randomize: 'Neues Zufallsbeispiel',
      tableScrollLabel: 'Cayley-Tafel, scrollbar',
      'legend.identity': '{0} Zeile & Spalte des neutralen Elements',
      'legend.inverse': '{0} Eigenes Inverses (selbstgepaart)',
      'legend.selected': '{0} Ausgewähltes Feld',
      'legend.mirror': '{0} Spiegelzwilling über der Diagonale',
      nNoteNotWhole: 'N muss eine ganze Zahl sein — die Tafel bleibt, wie sie war.',
      nNoteTooSmall: 'N kann nicht unter 1 liegen — auf 1 angehoben.',
      nNoteCapped: 'N ist auf {max} begrenzt, damit die Tafel nicht zu groß wird — auf {max} gesenkt.',
      identityWordAdditive: 'null',
      identityWordMultiplicative: 'eins',
      inverseWordAdditive: 'ihr eigenes Negatives',
      inverseWordMultiplicative: 'sein eigener Kehrwert',
      identityNote: 'Das neutrale Element ist {word} — seine Zeile und Spalte sind unten markiert.',
      symmetryNoteAdditive: 'a + b und b + a landen immer in derselben Klasse, daher spiegelt sich die Tafel an der Diagonale — klicke auf ein beliebiges Feld, um ihren Zwilling auf der anderen Seite aufleuchten zu sehen.',
      symmetryNoteMultiplicative: 'a · b und b · a landen immer in derselben Klasse, daher spiegelt sich die Tafel an der Diagonale — klicke auf ein beliebiges Feld, um ihren Zwilling auf der anderen Seite aufleuchten zu sehen.',
      summaryAdditive: {
        one: 'ℤ/{n}ℤ · {count} Element · neutrales Element [{id}]',
        other: 'ℤ/{n}ℤ · {count} Elemente · neutrales Element [{id}]'
      },
      summaryMultiplicative: {
        one: '(ℤ/{n}ℤ)ˣ · φ({n}) = {count} Element · neutrales Element [{id}]',
        other: '(ℤ/{n}ℤ)ˣ · φ({n}) = {count} Elemente · neutrales Element [{id}]'
      },
      tableCaption: 'Cayley-Tafel für {summary} unter {sign}',
      noteDiagonal: 'Dieses Feld liegt auf der Diagonalachse — es ist sein eigener Zwilling, mit nur einer Gleichung zu nennen: {a} {sign} {a} = {raw} ≡ {val} (mod {n}).',
      noteCommutative: '{a} {sign} {b} = {rawAB} ≡ {val} (mod {n}), und {b} {sign} {a} = {rawBA} ≡ {val} (mod {n}) — beide landen auf demselben Wert, daher ist die Tafel symmetrisch um ihre Diagonale: die Gruppe ist kommutativ.',
      selfInverseNote: '{a} ist {word}, da ihr Wert hier das neutrale Element ist.',
      equationCaption: '{spanA} {sign} {spanB} = {spanSum} — {a} {sign} {b} = {raw} ≡ {val} (mod {n}).'
    },
    fr: {
      title: 'Table de Cayley',
      eyebrow: 'théorie des groupes · tables d’opération',
      heading: 'Table de Cayley',
      lede: 'Toute l’opération d’un groupe tient dans une seule table carrée — une ligne et une colonne par élément, une case pour chaque résultat. Chaque fait structurel sur ce groupe — son élément neutre, ses inverses, sa commutativité — se voit quelque part dans la forme de la table.',
      xref: 'Les deux mêmes opérations de groupe, vues comme des secteurs sur une roue plutôt que des lignes dans une table →',
      tablistLabel: 'Opération de groupe',
      nLabel: 'N — module',
      randomizeLabel: 'Aléatoire',
      randomize: 'Nouvel exemple aléatoire',
      tableScrollLabel: 'Table de Cayley, défilable',
      'legend.identity': '{0} Ligne et colonne de l’élément neutre',
      'legend.inverse': '{0} Son propre inverse (auto-apparié)',
      'legend.selected': '{0} Case sélectionnée',
      'legend.mirror': '{0} Jumeau miroir à travers la diagonale',
      nNoteNotWhole: 'N doit être un nombre entier — la table reste comme elle était.',
      nNoteTooSmall: 'N ne peut pas descendre sous 1 — relevé à 1.',
      nNoteCapped: 'N est plafonné à {max} pour empêcher la table de devenir trop grande — abaissé à {max}.',
      identityWordAdditive: 'zéro',
      identityWordMultiplicative: 'un',
      inverseWordAdditive: 'son propre opposé',
      inverseWordMultiplicative: 'son propre inverse',
      identityNote: 'L’élément neutre est {word} — sa ligne et sa colonne sont marquées ci-dessous.',
      symmetryNoteAdditive: 'a + b et b + a atterrissent toujours dans la même classe, donc la table se reflète elle-même par rapport à la diagonale — cliquez sur une case pour voir son jumeau s’allumer de l’autre côté.',
      symmetryNoteMultiplicative: 'a · b et b · a atterrissent toujours dans la même classe, donc la table se reflète elle-même par rapport à la diagonale — cliquez sur une case pour voir son jumeau s’allumer de l’autre côté.',
      summaryAdditive: {
        one: 'ℤ/{n}ℤ · {count} élément · élément neutre [{id}]',
        other: 'ℤ/{n}ℤ · {count} éléments · élément neutre [{id}]'
      },
      summaryMultiplicative: {
        one: '(ℤ/{n}ℤ)ˣ · φ({n}) = {count} élément · élément neutre [{id}]',
        other: '(ℤ/{n}ℤ)ˣ · φ({n}) = {count} éléments · élément neutre [{id}]'
      },
      tableCaption: 'Table de Cayley pour {summary} sous {sign}',
      noteDiagonal: 'Cette case se trouve sur l’axe diagonal — elle est son propre jumeau, avec une seule équation à énoncer : {a} {sign} {a} = {raw} ≡ {val} (mod {n}).',
      noteCommutative: '{a} {sign} {b} = {rawAB} ≡ {val} (mod {n}), et {b} {sign} {a} = {rawBA} ≡ {val} (mod {n}) — les deux atterrissent sur la même valeur, donc la table est symétrique par rapport à sa diagonale : le groupe est commutatif.',
      selfInverseNote: '{a} est {word}, puisque sa valeur ici est l’élément neutre.',
      equationCaption: '{spanA} {sign} {spanB} = {spanSum} — {a} {sign} {b} = {raw} ≡ {val} (mod {n}).'
    },
    es: {
      title: 'Tabla de Cayley',
      eyebrow: 'teoría de grupos · tablas de operación',
      heading: 'Tabla de Cayley',
      lede: 'Toda la operación de un grupo cabe en una sola tabla cuadrada — una fila y una columna por elemento, una casilla por cada resultado. Todo hecho estructural sobre ese grupo — su identidad, sus inversos, su conmutatividad — se ve en algún lugar de la forma de la tabla.',
      xref: 'Las mismas dos operaciones de grupo, vistas como sectores en una rueda en lugar de filas en una tabla →',
      tablistLabel: 'Operación de grupo',
      nLabel: 'N — módulo',
      randomizeLabel: 'Aleatorio',
      randomize: 'Nuevo ejemplo aleatorio',
      tableScrollLabel: 'Tabla de Cayley, desplazable',
      'legend.identity': '{0} Fila y columna de la identidad',
      'legend.inverse': '{0} Su propio inverso (autoemparejado)',
      'legend.selected': '{0} Casilla seleccionada',
      'legend.mirror': '{0} Gemelo especular a través de la diagonal',
      nNoteNotWhole: 'N debe ser un número entero — la tabla permanece como estaba.',
      nNoteTooSmall: 'N no puede bajar de 1 — elevado a 1.',
      nNoteCapped: 'N está limitado a {max} para que la tabla no crezca demasiado — reducido a {max}.',
      identityWordAdditive: 'cero',
      identityWordMultiplicative: 'uno',
      inverseWordAdditive: 'su propio opuesto',
      inverseWordMultiplicative: 'su propio recíproco',
      identityNote: 'La identidad es {word} — su fila y columna están marcadas abajo.',
      symmetryNoteAdditive: 'a + b y b + a siempre caen en la misma clase, así que la tabla se refleja sobre la diagonal — haz clic en cualquier casilla para ver a su gemela iluminarse al otro lado.',
      symmetryNoteMultiplicative: 'a · b y b · a siempre caen en la misma clase, así que la tabla se refleja sobre la diagonal — haz clic en cualquier casilla para ver a su gemela iluminarse al otro lado.',
      summaryAdditive: {
        one: 'ℤ/{n}ℤ · {count} elemento · identidad [{id}]',
        other: 'ℤ/{n}ℤ · {count} elementos · identidad [{id}]'
      },
      summaryMultiplicative: {
        one: '(ℤ/{n}ℤ)ˣ · φ({n}) = {count} elemento · identidad [{id}]',
        other: '(ℤ/{n}ℤ)ˣ · φ({n}) = {count} elementos · identidad [{id}]'
      },
      tableCaption: 'Tabla de Cayley para {summary} bajo {sign}',
      noteDiagonal: 'Esta casilla está sobre el eje diagonal — es su propia gemela, con una sola ecuación que enunciar: {a} {sign} {a} = {raw} ≡ {val} (mod {n}).',
      noteCommutative: '{a} {sign} {b} = {rawAB} ≡ {val} (mod {n}), y {b} {sign} {a} = {rawBA} ≡ {val} (mod {n}) — ambas caen en el mismo valor, así que la tabla es simétrica respecto a su diagonal: el grupo es conmutativo.',
      selfInverseNote: '{a} es {word}, ya que su valor aquí es la identidad.',
      equationCaption: '{spanA} {sign} {spanB} = {spanSum} — {a} {sign} {b} = {raw} ≡ {val} (mod {n}).'
    },
    it: {
      title: 'Tavola di Cayley',
      eyebrow: 'teoria dei gruppi · tavole delle operazioni',
      heading: 'Tavola di Cayley',
      lede: 'L’intera operazione di un gruppo si racchiude in un’unica tabella quadrata — una riga e una colonna per elemento, una cella per ogni risultato. Ogni fatto strutturale su quel gruppo — il suo elemento neutro, i suoi inversi, la sua commutatività — è visibile da qualche parte nella forma della tabella.',
      xref: 'Le stesse due operazioni di gruppo, viste come settori su una ruota invece che righe in una tabella →',
      tablistLabel: 'Operazione di gruppo',
      nLabel: 'N — modulo',
      randomizeLabel: 'Casuale',
      randomize: 'Nuovo esempio casuale',
      tableScrollLabel: 'Tavola di Cayley, scorrevole',
      'legend.identity': '{0} Riga e colonna dell’elemento neutro',
      'legend.inverse': '{0} Proprio inverso (autoaccoppiato)',
      'legend.selected': '{0} Cella selezionata',
      'legend.mirror': '{0} Gemello speculare attraverso la diagonale',
      nNoteNotWhole: 'N deve essere un numero intero — la tabella resta com’era.',
      nNoteTooSmall: 'N non può scendere sotto 1 — portato a 1.',
      nNoteCapped: 'N è limitato a {max} per evitare che la tabella diventi troppo grande — ridotto a {max}.',
      identityWordAdditive: 'zero',
      identityWordMultiplicative: 'uno',
      inverseWordAdditive: 'il proprio opposto',
      inverseWordMultiplicative: 'il proprio reciproco',
      identityNote: 'L’elemento neutro è {word} — la sua riga e colonna sono evidenziate qui sotto.',
      symmetryNoteAdditive: 'a + b e b + a finiscono sempre nella stessa classe, quindi la tabella si riflette su se stessa lungo la diagonale — clicca su una cella qualsiasi per vedere il suo gemello illuminarsi dall’altro lato.',
      symmetryNoteMultiplicative: 'a · b e b · a finiscono sempre nella stessa classe, quindi la tabella si riflette su se stessa lungo la diagonale — clicca su una cella qualsiasi per vedere il suo gemello illuminarsi dall’altro lato.',
      summaryAdditive: {
        one: 'ℤ/{n}ℤ · {count} elemento · elemento neutro [{id}]',
        other: 'ℤ/{n}ℤ · {count} elementi · elemento neutro [{id}]'
      },
      summaryMultiplicative: {
        one: '(ℤ/{n}ℤ)ˣ · φ({n}) = {count} elemento · elemento neutro [{id}]',
        other: '(ℤ/{n}ℤ)ˣ · φ({n}) = {count} elementi · elemento neutro [{id}]'
      },
      tableCaption: 'Tavola di Cayley per {summary} sotto {sign}',
      noteDiagonal: 'Questa cella si trova sull’asse diagonale — è il proprio gemello, con una sola equazione da indicare: {a} {sign} {a} = {raw} ≡ {val} (mod {n}).',
      noteCommutative: '{a} {sign} {b} = {rawAB} ≡ {val} (mod {n}), e {b} {sign} {a} = {rawBA} ≡ {val} (mod {n}) — entrambe finiscono sullo stesso valore, quindi la tabella è simmetrica rispetto alla sua diagonale: il gruppo è commutativo.',
      selfInverseNote: '{a} è {word}, poiché il suo valore qui è l’elemento neutro.',
      equationCaption: '{spanA} {sign} {spanB} = {spanSum} — {a} {sign} {b} = {raw} ≡ {val} (mod {n}).'
    }
  });
})();
