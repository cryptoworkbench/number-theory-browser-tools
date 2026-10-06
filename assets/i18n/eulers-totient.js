/* assets/i18n/eulers-totient.js — the 'totient' namespace: title, eyebrow,
   heading, lede, the cross-link text, the two "prime" preset chips, the
   Run button, every validation/error message, the k-walk's chain head,
   verdict lines, progress/tally/answer lines, the banner (including a
   plural "done" message) and the closing caption for the Euler's Totient
   tool, in all eighteen supported languages.

   Classic script, IIFE, "use strict" — its only statement is
   NT.i18n.register(...). "gcd" is mathematical notation per
   06-GLOSSARY.md section (e) and is written identically in every
   language (never translated to ggd/ggT/pgcd/mcd). Play/Pause, Step,
   Instant, Reset and Speed live in the shared `common` namespace
   (assets/i18n/site.js), never duplicated here. Placeholder names ({k},
   {n}, {min}, {max}, {count}, {total}, {phi}, {gcd}) are identical across
   all eighteen languages. bannerDone is { one, other } in every language
   except Polish and Russian ({ one, few, many, other }), Romanian
   ({ one, few, other }), Latvian ({ zero, one, other }) and Hebrew
   ({ one, two, other }), each the CLDR shape for that language.
   Must load after assets/nt-i18n.js and assets/i18n/site.js, before the
   page's own inline <script>.
*/
(function () {
  "use strict";

  NT.i18n.register('totient', {
    nl: {
      title: 'Eulers phi-functie',
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
    },
    it: {
      title: 'Funzione φ di Eulero',
      heading: 'Funzione φ di Eulero',
      lede: 'φ(n) conta quanti numeri tra 1 … n−1 non condividono nessun fattore con n, e questa pagina lo scopre nell’unico modo onesto — chiedendo all’algoritmo di Euclide di ciascuno di essi.',
      xref: 'Lo stesso conteggio ricompare come i settori del gruppo moltiplicativo mod n →',
      chipPrime: '{n} · primo',
      run: 'Avvia',
      errNotWhole: 'n deve essere un numero intero.',
      errTooSmall: 'n deve essere almeno {min} — il percorso k = 1 … n−1 richiede almeno un k da testare.',
      errCapped: 'n è limitato a {max} — il valore è stato ridotto per adattarsi.',
      chainHead: 'Test di k = {k} — gcd({n}, {k})',
      verdictCoprime: 'k = {k} è coprimo con {n} — gcd = 1, conteggiato.',
      verdictEliminated: 'k = {k} condivide un fattore con {n} — gcd = {gcd}, escluso.',
      tally: 'Conteggio in corso dei coprimi: {count}',
      progress: 'k = {k} di {total} testato.',
      answer: 'φ({n}) = {phi}',
      bannerReady: 'Pronto — premi Riproduci per vedere il percorso testare ogni k una divisione alla volta.',
      bannerDone: {
        one: 'Fatto — {count} valore testato, {phi} coprimo con {n}.',
        other: 'Fatto — {count} valori testati, {phi} coprimo con {n}.'
      },
      caption: 'Un numero primo n dà φ(n) = n−1, perché ogni numero più piccolo lo manca — i chip rendono facile verificarlo.'
    },
    pl: {
      title: 'Funkcja φ Eulera',
      heading: 'Funkcja φ Eulera',
      lede: 'φ(n) liczy, ile spośród 1 … n−1 nie ma żadnego wspólnego czynnika z n, a ta strona odkrywa to w jedyny uczciwy sposób — pytając algorytm Euklidesa o każdą z nich po kolei.',
      xref: 'Ten sam wynik pojawia się jako wycinki grupy multiplikatywnej modulo n →',
      chipPrime: '{n} · pierwsza',
      run: 'Uruchom',
      errNotWhole: 'n musi być liczbą całkowitą.',
      errTooSmall: 'n musi być co najmniej {min} — przebieg k = 1 … n−1 wymaga co najmniej jednego k do przetestowania.',
      errCapped: 'n jest ograniczone do {max} — wartość została zmniejszona, aby się zmieścić.',
      chainHead: 'Testowanie k = {k} — gcd({n}, {k})',
      verdictCoprime: 'k = {k} jest względnie pierwsze z {n} — gcd = 1, zaliczone.',
      verdictEliminated: 'k = {k} ma wspólny czynnik z {n} — gcd = {gcd}, wykluczone.',
      tally: 'Bieżąca liczba względnie pierwszych: {count}',
      progress: 'k = {k} z {total} przetestowane.',
      answer: 'φ({n}) = {phi}',
      bannerReady: 'Gotowe — naciśnij Odtwórz, aby zobaczyć, jak przebieg testuje każde k, jedno dzielenie na raz.',
      bannerDone: {
        one: 'Gotowe — przetestowano {count} wartość, względnie pierwszych z {n}: {phi}.',
        few: 'Gotowe — przetestowano {count} wartości, względnie pierwszych z {n}: {phi}.',
        many: 'Gotowe — przetestowano {count} wartości, względnie pierwszych z {n}: {phi}.',
        other: 'Gotowe — przetestowano {count} wartości, względnie pierwszych z {n}: {phi}.'
      },
      caption: 'Liczba pierwsza n daje φ(n) = n−1, bo każda mniejsza liczba jej nie trafia — chipy pozwalają to łatwo sprawdzić.'
    },
    'pt-BR': {
      title: 'Função φ de Euler',
      heading: 'Função φ de Euler',
      lede: 'φ(n) conta quantos de 1 … n−1 não compartilham nenhum fator com n, e esta página descobre isso do único jeito honesto — perguntando ao algoritmo de Euclides sobre cada um deles.',
      xref: 'A mesma contagem aparece como os setores do grupo multiplicativo mod n →',
      chipPrime: '{n} · primo',
      run: 'Execute',
      errNotWhole: 'n deve ser um número inteiro.',
      errTooSmall: 'n deve ser pelo menos {min} — o percurso k = 1 … n−1 precisa de pelo menos um k para testar.',
      errCapped: 'n está limitado a {max} — o valor foi reduzido para se ajustar.',
      chainHead: 'Testando k = {k} — gcd({n}, {k})',
      verdictCoprime: 'k = {k} é coprimo de {n} — gcd = 1, contabilizado.',
      verdictEliminated: 'k = {k} compartilha um fator com {n} — gcd = {gcd}, eliminado.',
      tally: 'Contagem corrente de coprimos: {count}',
      progress: 'k = {k} de {total} testado.',
      answer: 'φ({n}) = {phi}',
      bannerReady: 'Pronto — pressione Reproduzir para ver o percurso testar cada k, uma divisão por vez.',
      bannerDone: {
        one: 'Concluído — {count} valor testado, {phi} coprimo de {n}.',
        other: 'Concluído — {count} valores testados, {phi} coprimo de {n}.'
      },
      caption: 'n primo dá φ(n) = n−1, porque nenhum número menor o acerta — as fichas facilitam verificar isso.'
    },
    'pt-PT': {
      title: 'Função φ de Euler',
      heading: 'Função φ de Euler',
      lede: 'φ(n) conta quantos de 1 … n−1 não partilham nenhum fator com n, e esta página descobre isso da única forma honesta — perguntando ao algoritmo de Euclides sobre cada um deles.',
      xref: 'A mesma contagem aparece como os setores do grupo multiplicativo mod n →',
      chipPrime: '{n} · primo',
      run: 'Executa',
      errNotWhole: 'n tem de ser um número inteiro.',
      errTooSmall: 'n tem de ser pelo menos {min} — o percurso k = 1 … n−1 precisa de pelo menos um k para testar.',
      errCapped: 'n está limitado a {max} — o valor foi reduzido para se ajustar.',
      chainHead: 'A testar k = {k} — gcd({n}, {k})',
      verdictCoprime: 'k = {k} é coprimo de {n} — gcd = 1, contabilizado.',
      verdictEliminated: 'k = {k} partilha um fator com {n} — gcd = {gcd}, eliminado.',
      tally: 'Contagem corrente de coprimos: {count}',
      progress: 'k = {k} de {total} testado.',
      answer: 'φ({n}) = {phi}',
      bannerReady: 'Pronto — prime Reproduzir para ver o percurso a testar cada k, uma divisão de cada vez.',
      bannerDone: {
        one: 'Concluído — {count} valor testado, {phi} coprimo de {n}.',
        other: 'Concluído — {count} valores testados, {phi} coprimo de {n}.'
      },
      caption: 'n primo dá φ(n) = n−1, porque nenhum número menor o alcança — as fichas facilitam verificar isso.'
    },
    sv: {
      title: 'Eulers φ-funktion',
      heading: 'Eulers φ-funktion',
      lede: 'φ(n) räknar hur många av 1 … n−1 som inte delar någon faktor med n, och den här sidan tar reda på det på det enda ärliga sättet — genom att fråga Euklides algoritm om var och en av dem.',
      xref: 'Samma antal dyker upp som sektorerna i den multiplikativa gruppen mod n →',
      chipPrime: '{n} · primtal',
      run: 'Starta',
      errNotWhole: 'n måste vara ett heltal.',
      errTooSmall: 'n måste vara minst {min} — vandringen k = 1 … n−1 behöver minst ett k att testa.',
      errCapped: 'n är begränsat till {max} — värdet klämdes ner för att passa.',
      chainHead: 'Testar k = {k} — gcd({n}, {k})',
      verdictCoprime: 'k = {k} är relativt prima med {n} — gcd = 1, räknas med.',
      verdictEliminated: 'k = {k} delar en faktor med {n} — gcd = {gcd}, utesluten.',
      tally: 'Löpande antal relativt prima: {count}',
      progress: 'k = {k} av {total} testat.',
      answer: 'φ({n}) = {phi}',
      bannerReady: 'Klar — tryck på Spela upp för att se vandringen testa varje k en delning i taget.',
      bannerDone: {
        one: 'Klar — {count} värde testat, {phi} relativt prima med {n}.',
        other: 'Klar — {count} värden testade, {phi} relativt prima med {n}.'
      },
      caption: 'Ett primtal n ger φ(n) = n−1, eftersom varje mindre tal missar det — chipsen gör det lätt att kontrollera.'
    },
    nb: {
      title: 'Eulers φ-funksjon',
      heading: 'Eulers φ-funksjon',
      lede: 'φ(n) teller hvor mange av 1 … n−1 som ikke deler noen faktor med n, og denne siden finner det ut på den eneste ærlige måten — ved å spørre Euklids algoritme om hver enkelt av dem.',
      xref: 'Det samme antallet dukker opp som sektorene i den multiplikative gruppen mod n →',
      chipPrime: '{n} · primtall',
      run: 'Start',
      errNotWhole: 'n må være et helt tall.',
      errTooSmall: 'n må være minst {min} — gjennomgangen k = 1 … n−1 trenger minst ett k å teste.',
      errCapped: 'n er begrenset til {max} — verdien ble klemt ned for å passe.',
      chainHead: 'Tester k = {k} — gcd({n}, {k})',
      verdictCoprime: 'k = {k} er innbyrdes primisk med {n} — gcd = 1, talt med.',
      verdictEliminated: 'k = {k} deler en faktor med {n} — gcd = {gcd}, utelukket.',
      tally: 'Løpende antall innbyrdes primiske: {count}',
      progress: 'k = {k} av {total} testet.',
      answer: 'φ({n}) = {phi}',
      bannerReady: 'Klar — trykk på Spill av for å se gjennomgangen teste hver k én divisjon i gangen.',
      bannerDone: {
        one: 'Ferdig — {count} verdi testet, {phi} innbyrdes primisk med {n}.',
        other: 'Ferdig — {count} verdier testet, {phi} innbyrdes primisk med {n}.'
      },
      caption: 'Et primtall n gir φ(n) = n−1, fordi hvert mindre tall ikke treffer det — brikkene gjør det lett å kontrollere.'
    },
    ro: {
      title: 'Funcția φ a lui Euler',
      heading: 'Funcția φ a lui Euler',
      lede: 'φ(n) numără câte dintre 1 … n−1 nu au niciun factor comun cu n, iar această pagină află asta în singurul mod cinstit — întrebând algoritmul lui Euclid despre fiecare dintre ele.',
      xref: 'Aceeași numărătoare apare ca feliile grupului multiplicativ modulo n →',
      chipPrime: '{n} · prim',
      run: 'Rulează',
      errNotWhole: 'n trebuie să fie un număr întreg.',
      errTooSmall: 'n trebuie să fie cel puțin {min} — parcurgerea k = 1 … n−1 are nevoie de cel puțin un k de testat.',
      errCapped: 'n este limitat la {max} — valoarea a fost redusă pentru a se încadra.',
      chainHead: 'Se testează k = {k} — gcd({n}, {k})',
      verdictCoprime: 'k = {k} este relativ prim cu {n} — gcd = 1, numărat.',
      verdictEliminated: 'k = {k} are un factor comun cu {n} — gcd = {gcd}, exclus.',
      tally: 'Numărătoare curentă de valori relativ prime: {count}',
      progress: 'k = {k} din {total} testat.',
      answer: 'φ({n}) = {phi}',
      bannerReady: 'Pregătit — apasă Redă pentru a privi parcurgerea testând fiecare k, câte o împărțire pe rând.',
      bannerDone: {
        one: 'Terminat — {count} valoare testată, {phi} relativ primă cu {n}.',
        few: 'Terminat — {count} valori testate, {phi} relativ prime cu {n}.',
        other: 'Terminat — {count} de valori testate, {phi} relativ prime cu {n}.'
      },
      caption: 'Un n prim dă φ(n) = n−1, pentru că fiecare număr mai mic îl ratează — jetoanele fac asta ușor de verificat.'
    },
    hu: {
      title: 'Euler-féle φ-függvény',
      heading: 'Euler-féle φ-függvény',
      lede: 'A φ(n) megszámolja, hány szám van az 1 … n−1 közül, amelynek nincs közös osztója n-nel, és ez az oldal az egyetlen becsületes módon deríti ki ezt — megkérdezve az euklideszi algoritmust mindegyikükről.',
      xref: 'Ugyanez a szám jelenik meg a mod n multiplikatív csoport körcikkeiként →',
      chipPrime: '{n} · prím',
      run: 'Futtatás',
      errNotWhole: 'n-nek egész számnak kell lennie.',
      errTooSmall: 'n-nek legalább {min}-nek kell lennie — a k = 1 … n−1 bejárásnak legalább egy tesztelendő k-ra szüksége van.',
      errCapped: 'n felső korlátja {max} — az érték lecsökkentve, hogy beleférjen.',
      chainHead: 'Tesztelés: k = {k} — gcd({n}, {k})',
      verdictCoprime: 'k = {k} relatív prím {n}-hez — gcd = 1, beszámítva.',
      verdictEliminated: 'k = {k} közös osztóval rendelkezik {n}-nel — gcd = {gcd}, kizárva.',
      tally: 'Futó relatív prím szám: {count}',
      progress: 'k = {k} / {total} tesztelve.',
      answer: 'φ({n}) = {phi}',
      bannerReady: 'Kész — nyomd meg a Lejátszás gombot, hogy lásd, hogyan tesztel a bejárás minden k-t, egyszerre egy osztással.',
      bannerDone: {
        one: 'Kész — {count} érték tesztelve, {phi} relatív prím {n}-hez.',
        other: 'Kész — {count} érték tesztelve, {phi} relatív prím {n}-hez.'
      },
      caption: 'Egy prím n esetén φ(n) = n−1, mert minden kisebb szám elkerüli — a chipek megkönnyítik ennek ellenőrzését.'
    },
    lv: {
      title: 'Eilera φ funkcija',
      heading: 'Eilera φ funkcija',
      lede: 'φ(n) saskaita, cik no 1 … n−1 nav kopīga dalītāja ar n, un šī lapa to atklāj vienīgajā godīgajā veidā — jautājot Eiklīda algoritmam par katru no tiem.',
      xref: 'Tas pats skaits parādās kā multiplikatīvās grupas pēc moduļa n sektori →',
      chipPrime: '{n} · pirmskaitlis',
      run: 'Palaist',
      errNotWhole: 'n jābūt veselam skaitlim.',
      errTooSmall: 'n jābūt vismaz {min} — gaitai k = 1 … n−1 nepieciešams vismaz viens k pārbaudei.',
      errCapped: 'n ir ierobežots līdz {max} — vērtība tika samazināta, lai ietilptu.',
      chainHead: 'Pārbauda k = {k} — gcd({n}, {k})',
      verdictCoprime: 'k = {k} ir savstarpēji pirmskaitlis ar {n} — gcd = 1, ieskaitīts.',
      verdictEliminated: 'k = {k} dala kopīgu dalītāju ar {n} — gcd = {gcd}, izslēgts.',
      tally: 'Pašreizējais savstarpēji pirmskaitļu skaits: {count}',
      progress: 'k = {k} no {total} pārbaudīts.',
      answer: 'φ({n}) = {phi}',
      bannerReady: 'Gatavs — nospied Atskaņot, lai skatītos, kā gaita pārbauda katru k pa vienai dalīšanai reizē.',
      bannerDone: {
        zero: 'Pabeigts — pārbaudītas {count} vērtību, {phi} savstarpēji pirmskaitļi ar {n}.',
        one: 'Pabeigts — pārbaudīta {count} vērtība, {phi} savstarpēji pirmskaitļi ar {n}.',
        other: 'Pabeigts — pārbaudītas {count} vērtības, {phi} savstarpēji pirmskaitļi ar {n}.'
      },
      caption: 'Pirmskaitlis n dod φ(n) = n−1, jo katrs mazāks skaitlis to nesasniedz — žetoni to ļauj viegli pārbaudīt.'
    },
    ru: {
      title: 'Функция Эйлера',
      heading: 'Функция Эйлера',
      lede: 'φ(n) считает, сколько чисел из 1 … n−1 не имеют общего делителя с n, и эта страница узнаёт это единственным честным способом — спрашивая алгоритм Евклида про каждое из них.',
      xref: 'То же число появляется как секторы мультипликативной группы по модулю n →',
      chipPrime: '{n} · простое',
      run: 'Запустить',
      errNotWhole: 'n должно быть целым числом.',
      errTooSmall: 'n должно быть не меньше {min} — проходу k = 1 … n−1 нужен хотя бы один k для проверки.',
      errCapped: 'n ограничено до {max} — значение было уменьшено, чтобы вместиться.',
      chainHead: 'Проверка k = {k} — gcd({n}, {k})',
      verdictCoprime: 'k = {k} взаимно просто с {n} — gcd = 1, засчитано.',
      verdictEliminated: 'k = {k} имеет общий делитель с {n} — gcd = {gcd}, исключено.',
      tally: 'Текущее число взаимно простых: {count}',
      progress: 'k = {k} из {total} проверено.',
      answer: 'φ({n}) = {phi}',
      bannerReady: 'Готово — нажми «Пуск», чтобы увидеть, как проход проверяет каждое k по одному делению за раз.',
      bannerDone: {
        one: 'Готово — проверено {count} значение, {phi} взаимно просто с {n}.',
        few: 'Готово — проверено {count} значения, {phi} взаимно просто с {n}.',
        many: 'Готово — проверено {count} значений, {phi} взаимно просто с {n}.',
        other: 'Готово — проверено {count} значения, {phi} взаимно просто с {n}.'
      },
      caption: 'Простое n даёт φ(n) = n−1, потому что каждое меньшее число мимо него не делится — фишки позволяют легко это проверить.'
    },
    el: {
      title: 'Συνάρτηση φ του Euler',
      heading: 'Συνάρτηση φ του Euler',
      lede: 'Η φ(n) μετρά πόσοι από τους 1 … n−1 δεν έχουν κοινό παράγοντα με το n, και αυτή η σελίδα το βρίσκει με τον μόνο έντιμο τρόπο — ρωτώντας τον αλγόριθμο του Ευκλείδη για καθέναν από αυτούς.',
      xref: 'Το ίδιο πλήθος εμφανίζεται ως οι τομείς της πολλαπλασιαστικής ομάδας mod n →',
      chipPrime: '{n} · πρώτος',
      run: 'Εκτέλεση',
      errNotWhole: 'Το n πρέπει να είναι ακέραιος αριθμός.',
      errTooSmall: 'Το n πρέπει να είναι τουλάχιστον {min} — η διαδρομή k = 1 … n−1 χρειάζεται τουλάχιστον ένα k για έλεγχο.',
      errCapped: 'Το n έχει όριο {max} — η τιμή μειώθηκε για να χωρέσει.',
      chainHead: 'Έλεγχος k = {k} — gcd({n}, {k})',
      verdictCoprime: 'Το k = {k} είναι πρώτο ως προς το {n} — gcd = 1, μετρήθηκε.',
      verdictEliminated: 'Το k = {k} έχει κοινό παράγοντα με το {n} — gcd = {gcd}, αποκλείστηκε.',
      tally: 'Τρέχον πλήθος πρώτων μεταξύ τους: {count}',
      progress: 'k = {k} από {total} ελέγχθηκαν.',
      answer: 'φ({n}) = {phi}',
      bannerReady: 'Έτοιμο — πάτα «Έναρξη» για να δεις τη διαδρομή να ελέγχει κάθε k με μία διαίρεση τη φορά.',
      bannerDone: {
        one: 'Έτοιμο — ελέγχθηκε {count} τιμή, {phi} πρώτοι ως προς το {n}.',
        other: 'Έτοιμο — ελέγχθηκαν {count} τιμές, {phi} πρώτοι ως προς το {n}.'
      },
      caption: 'Ο πρώτος n δίνει φ(n) = n−1, επειδή κάθε μικρότερος αριθμός τον προσπερνά — οι ετικέτες το κάνουν εύκολο να το ελέγξεις.'
    },
    he: {
      title: 'פונקציית φ של אוילר',
      heading: 'פונקציית φ של אוילר',
      lede: '\u2066φ(n)\u2069 סופרת כמה מבין \u20661 … n−1\u2069 אינם חולקים גורם עם n, והדף הזה מגלה זאת בדרך הישרה היחידה — בשאלת האלגוריתם של אוקלידס על כל אחד מהם בנפרד.',
      xref: 'אותה ספירה מופיעה גם כפלחי החבורה הכפלית מודולו n ←',
      chipPrime: '{n} · ראשוני',
      run: 'הרצה',
      errNotWhole: 'n חייב להיות מספר שלם.',
      errTooSmall: 'n חייב להיות לפחות {min} — הסריקה \u2066k = 1 … n−1\u2069 צריכה לפחות k אחד לבדיקה.',
      errCapped: 'n מוגבל ל-{max} — הערך הוקטן כך שיתאים.',
      chainHead: 'בודקים \u2066k = {k}\u2069 — \u2066gcd({n}, {k})\u2069',
      verdictCoprime: '\u2066k = {k}\u2069 זר ל-{n} — \u2066gcd = 1\u2069, נספר.',
      verdictEliminated: '\u2066k = {k}\u2069 חולק גורם משותף עם {n} — \u2066gcd = {gcd}\u2069, נפסל.',
      tally: 'ספירה מצטברת של זרים: {count}',
      progress: 'נבדק \u2066k = {k}\u2069 מתוך {total}.',
      answer: '\u2066φ({n}) = {phi}\u2069',
      bannerReady: 'מוכן — לחצו על הפעלה כדי לצפות כיצד הסריקה בודקת כל k בחלוקה אחת בכל פעם.',
      bannerDone: {
        one: 'הסתיים — נבדק {count} ערך, מתוכם {phi} זרים ל-{n}.',
        two: 'הסתיים — נבדקו {count} ערכים, מתוכם {phi} זרים ל-{n}.',
        other: 'הסתיים — נבדקו {count} ערכים, מתוכם {phi} זרים ל-{n}.'
      },
      caption: 'כאשר n ראשוני מתקבל \u2066φ(n) = n−1\u2069, כי לכל מספר קטן ממנו אין איתו גורם משותף — כפתורי הדוגמה מקלים על הבדיקה.'
    },
    hi: {
      title: 'ऑयलर का φ फलन',
      heading: 'ऑयलर का φ फलन',
      lede: 'φ(n) गिनता है कि 1 … n−1 में से कितनी संख्याओं का n के साथ कोई साझा गुणनखंड नहीं है, और यह पृष्ठ इसे एकमात्र ईमानदार तरीके से पता लगाता है — हर एक संख्या के बारे में यूक्लिड के एल्गोरिथ्म से पूछकर।',
      xref: 'यही गिनती मापांक n के गुणात्मक समूह की फाँकों के रूप में भी दिखाई देती है →',
      chipPrime: '{n} · अभाज्य',
      run: 'गणना करें',
      errNotWhole: 'n एक पूर्णांक होना चाहिए।',
      errTooSmall: 'n कम से कम {min} होना चाहिए — k = 1 … n−1 की क्रमिक जाँच के लिए परखने को कम से कम एक k चाहिए।',
      errCapped: 'n की अधिकतम सीमा {max} है — मान को घटाकर सीमा में रखा गया है।',
      chainHead: 'k = {k} की जाँच — gcd({n}, {k})',
      verdictCoprime: 'k = {k}, {n} से सह-अभाज्य है — gcd = 1, गिनती में जोड़ा गया।',
      verdictEliminated: 'k = {k} का {n} के साथ साझा गुणनखंड है — gcd = {gcd}, हटाया गया।',
      tally: 'अब तक की सह-अभाज्य गिनती: {count}',
      progress: '{total} में से k = {k} की जाँच हो चुकी।',
      answer: 'φ({n}) = {phi}',
      bannerReady: 'तैयार — "चलाएँ" दबाएँ और देखें कि क्रमिक जाँच हर k को एक-एक भाग-चरण में कैसे परखती है।',
      bannerDone: {
        one: 'पूर्ण — {count} मान की जाँच हुई, {n} से सह-अभाज्य मानों की संख्या: {phi}।',
        other: 'पूर्ण — {count} मानों की जाँच हुई, {n} से सह-अभाज्य मानों की संख्या: {phi}।'
      },
      caption: 'n अभाज्य हो तो φ(n) = n−1 मिलता है, क्योंकि उससे छोटी हर संख्या n के साथ कोई गुणनखंड साझा नहीं करती — उदाहरण वाले बटन इसे जाँचना आसान बना देते हैं।'
    }
  });
})();
