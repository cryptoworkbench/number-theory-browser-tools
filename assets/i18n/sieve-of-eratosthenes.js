/* assets/i18n/sieve-of-eratosthenes.js — the 'sieve' namespace: title,
   heading, lede, the banner messages, the control-panel static strings
   (size label, Generate button, stats, legend, footer) and the finished
   marker for the Sieve of Eratosthenes tool, in all seventeen supported
   languages.

   Classic script, IIFE, "use strict" — its only statement is
   NT.i18n.register(...). banner.done is a plural entry ({ one, other } in
   every language except Polish and Russian ({ one, few, many, other }),
   Romanian ({ one, few, other }), Latvian ({ zero, one, other }) and
   Hebrew ({ one, two, other }), each
   the CLDR shape for that language); every other key is plain text.
   Placeholder names ({n}, {time}, {count}) are identical across all seventeen
   languages. legend.*
   values are rich templates (the swatch <span> renders as {0}). Play/Pause,
   Step, Instant and Reset live in the shared `common` namespace
   (assets/i18n/site.js), never duplicated here. Must load after
   assets/nt-i18n.js and assets/i18n/site.js, before the page's own inline
   <script>.
*/
(function () {
  "use strict";

  NT.i18n.register('sieve', {
    nl: {
      sound: 'Geluid',
      title: 'Zeef van Eratosthenes — Interactieve visualisatie',
      heading: 'Zeef van Eratosthenes',
      eyebrow: 'priemgetallen en deelbaarheid',
      lede: 'Geef elk natuurlijk getal zijn eigen vakje — en kijk hoe de zeef alles doorstreept wat niet priem is.',
      sizeLabel: 'Zeefgrootte (N)',
      generate: 'Genereer',
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
      },
      toPalette: 'Gevonden priemgetallen aan palet toevoegen',
      'palette.added': {
        one: '{count} nieuw priemgetal aan het palet toegevoegd — dubbelen overgeslagen: {dupes}.',
        other: '{count} nieuwe priemgetallen aan het palet toegevoegd — dubbelen overgeslagen: {dupes}.'
      },
      'palette.full': {
        one: '{count} nieuw priemgetal toegevoegd — het palet is vol ({max} getallen); niet toegevoegde priemgetallen: {left}.',
        other: '{count} nieuwe priemgetallen toegevoegd — het palet is vol ({max} getallen); niet toegevoegde priemgetallen: {left}.'
      },
      'palette.none': 'Elk gevonden priemgetal staat al in het palet — niets toe te voegen.'
    },
    en: {
      sound: 'Sound',
      title: 'Sieve of Eratosthenes — Interactive Visualizer',
      heading: 'Sieve of Eratosthenes',
      eyebrow: 'primes and divisibility',
      lede: "Give every natural number its own box — then watch the sieve strike out everything that isn't prime.",
      sizeLabel: 'Sieve size (N)',
      generate: 'Generate',
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
      },
      toPalette: 'Add found primes to palette',
      'palette.added': {
        one: 'Added {count} new prime to the palette — duplicates skipped: {dupes}.',
        other: 'Added {count} new primes to the palette — duplicates skipped: {dupes}.'
      },
      'palette.full': {
        one: 'Added {count} new prime — the palette is full ({max} numbers); primes not added: {left}.',
        other: 'Added {count} new primes — the palette is full ({max} numbers); primes not added: {left}.'
      },
      'palette.none': 'Every prime found is already in the palette — nothing to add.'
    },
    de: {
      sound: 'Ton',
      title: 'Sieb des Eratosthenes — Interaktive Visualisierung',
      heading: 'Sieb des Eratosthenes',
      eyebrow: 'Primzahlen und Teilbarkeit',
      lede: 'Gib jeder natürlichen Zahl ihr eigenes Kästchen — und sieh zu, wie das Sieb alles streicht, was nicht prim ist.',
      sizeLabel: 'Siebgröße (N)',
      generate: 'Erzeugen',
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
      },
      toPalette: 'Gefundene Primzahlen zur Palette hinzufügen',
      'palette.added': {
        one: '{count} neue Primzahl zur Palette hinzugefügt — übersprungene Duplikate: {dupes}.',
        other: '{count} neue Primzahlen zur Palette hinzugefügt — übersprungene Duplikate: {dupes}.'
      },
      'palette.full': {
        one: '{count} neue Primzahl hinzugefügt — die Palette ist voll ({max} Zahlen); nicht hinzugefügte Primzahlen: {left}.',
        other: '{count} neue Primzahlen hinzugefügt — die Palette ist voll ({max} Zahlen); nicht hinzugefügte Primzahlen: {left}.'
      },
      'palette.none': 'Jede gefundene Primzahl ist bereits in der Palette — nichts hinzuzufügen.'
    },
    fr: {
      sound: 'Son',
      title: "Crible d'Ératosthène — Visualisation interactive",
      heading: "Crible d'Ératosthène",
      eyebrow: 'nombres premiers et divisibilité',
      lede: "Donnez à chaque entier naturel sa propre case — puis regardez le crible barrer tout ce qui n'est pas premier.",
      sizeLabel: 'Taille du crible (N)',
      generate: 'Générer',
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
      },
      toPalette: 'Ajouter les nombres premiers trouvés à la palette',
      'palette.added': {
        one: '{count} nouveau nombre premier ajouté à la palette — doublons ignorés : {dupes}.',
        other: '{count} nouveaux nombres premiers ajoutés à la palette — doublons ignorés : {dupes}.'
      },
      'palette.full': {
        one: '{count} nouveau nombre premier ajouté — la palette est pleine ({max} nombres) ; nombres premiers non ajoutés : {left}.',
        other: '{count} nouveaux nombres premiers ajoutés — la palette est pleine ({max} nombres) ; nombres premiers non ajoutés : {left}.'
      },
      'palette.none': 'Tous les nombres premiers trouvés sont déjà dans la palette — rien à ajouter.'
    },
    es: {
      sound: 'Sonido',
      title: 'Criba de Eratóstenes — Visualizador interactivo',
      heading: 'Criba de Eratóstenes',
      eyebrow: 'números primos y divisibilidad',
      lede: 'Dale a cada número natural su propia casilla — y mira cómo la criba tacha todo lo que no es primo.',
      sizeLabel: 'Tamaño de la criba (N)',
      generate: 'Generar',
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
      },
      toPalette: 'Añadir los primos encontrados a la paleta',
      'palette.added': {
        one: 'Se añadió {count} primo nuevo a la paleta — duplicados omitidos: {dupes}.',
        other: 'Se añadieron {count} primos nuevos a la paleta — duplicados omitidos: {dupes}.'
      },
      'palette.full': {
        one: 'Se añadió {count} primo nuevo — la paleta está llena ({max} números); primos no añadidos: {left}.',
        other: 'Se añadieron {count} primos nuevos — la paleta está llena ({max} números); primos no añadidos: {left}.'
      },
      'palette.none': 'Todos los primos encontrados ya están en la paleta — no hay nada que añadir.'
    },
    it: {
      sound: 'Suono',
      title: 'Crivello di Eratostene — Visualizzatore interattivo',
      heading: 'Crivello di Eratostene',
      eyebrow: 'numeri primi e divisibilità',
      lede: 'Dai a ogni numero naturale la sua casella — poi guarda il crivello eliminare tutto ciò che non è primo.',
      sizeLabel: 'Dimensione del crivello (N)',
      generate: 'Genera',
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
      },
      toPalette: 'Aggiungi i primi trovati alla tavolozza',
      'palette.added': {
        one: '{count} nuovo numero primo aggiunto alla tavolozza — duplicati saltati: {dupes}.',
        other: '{count} nuovi numeri primi aggiunti alla tavolozza — duplicati saltati: {dupes}.'
      },
      'palette.full': {
        one: '{count} nuovo numero primo aggiunto — la tavolozza è piena ({max} numeri); numeri primi non aggiunti: {left}.',
        other: '{count} nuovi numeri primi aggiunti — la tavolozza è piena ({max} numeri); numeri primi non aggiunti: {left}.'
      },
      'palette.none': 'Ogni numero primo trovato è già nella tavolozza — niente da aggiungere.'
    },
    pl: {
      sound: 'Dźwięk',
      title: 'Sito Eratostenesa — Interaktywna wizualizacja',
      heading: 'Sito Eratostenesa',
      eyebrow: 'liczby pierwsze i podzielność',
      lede: 'Daj każdej liczbie naturalnej własne pole — a potem obserwuj, jak sito przekreśla wszystko, co nie jest liczbą pierwszą.',
      sizeLabel: 'Rozmiar sita (N)',
      generate: 'Generuj',
      'stat.current': 'Aktualna',
      'stat.primesFound': 'Znalezione liczby pierwsze',
      'stat.sqrtBoundary': 'Granica √N',
      'stat.elapsed': 'Upłynęło',
      'stat.progress': 'Postęp',
      'stat.done': '✓ gotowe',
      'legend.unvisited': '{0} Nieodwiedzone',
      'legend.currentPointer': '{0} Aktualny wskaźnik',
      'legend.prime': '{0} Liczba pierwsza',
      'legend.composite': '{0} Przekreślona (złożona)',
      'legend.neither': '{0} Żadne z nich (1)',
      footer: 'Wszystkie obliczenia wykonywane są po stronie klienta w twojej przeglądarce. Żadna liczba nie została trwale uszkodzona — tylko przekreślona.',
      'banner.ready': 'Gotowe. Utworzono {n} pól — naciśnij Odtwórz, aby przesiać.',
      'banner.single': 'Tylko 1 pole — nie ma czego przesiewać.',
      'banner.reset': 'Zresetowano. Odtworzono {n} pól — naciśnij Odtwórz, aby przesiać.',
      'banner.done': {
        one: 'Znaleziono {count} liczbę pierwszą do {n} w {time}.',
        few: 'Znaleziono {count} liczby pierwsze do {n} w {time}.',
        many: 'Znaleziono {count} liczb pierwszych do {n} w {time}.',
        other: 'Znaleziono {count} liczb pierwszych do {n} w {time}.'
      },
      toPalette: 'Dodaj znalezione liczby pierwsze do palety',
      'palette.added': {
        one: 'Dodano {count} nową liczbę pierwszą do palety — pominięte duplikaty: {dupes}.',
        few: 'Dodano {count} nowe liczby pierwsze do palety — pominięte duplikaty: {dupes}.',
        many: 'Dodano {count} nowych liczb pierwszych do palety — pominięte duplikaty: {dupes}.',
        other: 'Dodano {count} nowej liczby pierwszej do palety — pominięte duplikaty: {dupes}.'
      },
      'palette.full': {
        one: 'Dodano {count} nową liczbę pierwszą — paleta jest pełna ({max} liczb); niedodane liczby pierwsze: {left}.',
        few: 'Dodano {count} nowe liczby pierwsze — paleta jest pełna ({max} liczb); niedodane liczby pierwsze: {left}.',
        many: 'Dodano {count} nowych liczb pierwszych — paleta jest pełna ({max} liczb); niedodane liczby pierwsze: {left}.',
        other: 'Dodano {count} nowej liczby pierwszej — paleta jest pełna ({max} liczb); niedodane liczby pierwsze: {left}.'
      },
      'palette.none': 'Każda znaleziona liczba pierwsza jest już w palecie — nie ma czego dodawać.'
    },
    'pt-BR': {
      sound: 'Som',
      title: 'Crivo de Eratóstenes — Visualizador interativo',
      heading: 'Crivo de Eratóstenes',
      eyebrow: 'números primos e divisibilidade',
      lede: 'Dê a cada número natural sua própria caixa — depois veja o crivo eliminar tudo o que não é primo.',
      sizeLabel: 'Tamanho do crivo (N)',
      generate: 'Gerar',
      'stat.current': 'Atual',
      'stat.primesFound': 'Números primos encontrados',
      'stat.sqrtBoundary': 'Limite √N',
      'stat.elapsed': 'Tempo decorrido',
      'stat.progress': 'Progresso',
      'stat.done': '✓ concluído',
      'legend.unvisited': '{0} Não visitado',
      'legend.currentPointer': '{0} Ponteiro atual',
      'legend.prime': '{0} Primo',
      'legend.composite': '{0} Eliminado (composto)',
      'legend.neither': '{0} Nenhum dos dois (1)',
      footer: 'Todo o cálculo é executado no seu navegador, no lado do cliente. Nenhum número foi danificado permanentemente — apenas eliminado.',
      'banner.ready': 'Pronto. {n} caixas criadas — pressione Reproduzir para crivar.',
      'banner.single': 'Apenas 1 caixa — nada para crivar.',
      'banner.reset': 'Reiniciado. {n} caixas reconstruídas — pressione Reproduzir para crivar.',
      'banner.done': {
        one: '{count} número primo encontrado até {n} em {time}.',
        other: '{count} números primos encontrados até {n} em {time}.'
      },
      toPalette: 'Adicionar os primos encontrados à paleta',
      'palette.added': {
        one: '{count} novo primo adicionado à paleta — duplicatas ignoradas: {dupes}.',
        other: '{count} novos primos adicionados à paleta — duplicatas ignoradas: {dupes}.'
      },
      'palette.full': {
        one: '{count} novo primo adicionado — a paleta está cheia ({max} números); primos não adicionados: {left}.',
        other: '{count} novos primos adicionados — a paleta está cheia ({max} números); primos não adicionados: {left}.'
      },
      'palette.none': 'Todos os primos encontrados já estão na paleta — nada a adicionar.'
    },
    'pt-PT': {
      sound: 'Som',
      title: 'Crivo de Eratóstenes — Visualizador interativo',
      heading: 'Crivo de Eratóstenes',
      eyebrow: 'números primos e divisibilidade',
      lede: 'Dá a cada número natural a sua própria caixa — depois vê o crivo eliminar tudo o que não é primo.',
      sizeLabel: 'Tamanho do crivo (N)',
      generate: 'Gerar',
      'stat.current': 'Atual',
      'stat.primesFound': 'Números primos encontrados',
      'stat.sqrtBoundary': 'Limite √N',
      'stat.elapsed': 'Tempo decorrido',
      'stat.progress': 'Progresso',
      'stat.done': '✓ concluído',
      'legend.unvisited': '{0} Não visitado',
      'legend.currentPointer': '{0} Ponteiro atual',
      'legend.prime': '{0} Primo',
      'legend.composite': '{0} Eliminado (composto)',
      'legend.neither': '{0} Nenhum dos dois (1)',
      footer: 'Todo o cálculo é executado no teu navegador, do lado do cliente. Nenhum número foi danificado permanentemente — apenas eliminado.',
      'banner.ready': 'Pronto. {n} caixas criadas — prime Reproduzir para crivar.',
      'banner.single': 'Apenas 1 caixa — nada para crivar.',
      'banner.reset': 'Reiniciado. {n} caixas reconstruídas — prime Reproduzir para crivar.',
      'banner.done': {
        one: '{count} número primo encontrado até {n} em {time}.',
        other: '{count} números primos encontrados até {n} em {time}.'
      },
      toPalette: 'Adicionar os primos encontrados à paleta',
      'palette.added': {
        one: '{count} novo primo adicionado à paleta — duplicados ignorados: {dupes}.',
        other: '{count} novos primos adicionados à paleta — duplicados ignorados: {dupes}.'
      },
      'palette.full': {
        one: '{count} novo primo adicionado — a paleta está cheia ({max} números); primos não adicionados: {left}.',
        other: '{count} novos primos adicionados — a paleta está cheia ({max} números); primos não adicionados: {left}.'
      },
      'palette.none': 'Todos os primos encontrados já estão na paleta — nada para adicionar.'
    },
    sv: {
      sound: 'Ljud',
      title: 'Eratosthenes såll — Interaktiv visualisering',
      heading: 'Eratosthenes såll',
      eyebrow: 'primtal och delbarhet',
      lede: 'Ge varje naturligt tal sin egen ruta — och se hur sållet stryker över allt som inte är primtal.',
      sizeLabel: 'Sållstorlek (N)',
      generate: 'Generera',
      'stat.current': 'Aktuellt',
      'stat.primesFound': 'Hittade primtal',
      'stat.sqrtBoundary': '√N-gräns',
      'stat.elapsed': 'Förlupen tid',
      'stat.progress': 'Förlopp',
      'stat.done': '✓ klart',
      'legend.unvisited': '{0} Obesökt',
      'legend.currentPointer': '{0} Aktuell pekare',
      'legend.prime': '{0} Primtal',
      'legend.composite': '{0} Överstruket (sammansatt)',
      'legend.neither': '{0} Inget av dem (1)',
      footer: 'Alla beräkningar sker lokalt i din webbläsare. Inga tal har skadats permanent — bara strukits över.',
      'banner.ready': 'Klart. {n} rutor skapade — tryck på Spela upp för att sålla.',
      'banner.single': 'Bara 1 ruta — inget att sålla.',
      'banner.reset': 'Återställt. {n} rutor återuppbyggda — tryck på Spela upp för att sålla.',
      'banner.done': {
        one: 'Hittade {count} primtal upp till {n} på {time}.',
        other: 'Hittade {count} primtal upp till {n} på {time}.'
      },
      toPalette: 'Lägg till hittade primtal i paletten',
      'palette.added': {
        one: '{count} nytt primtal har lagts till i paletten — överhoppade dubbletter: {dupes}.',
        other: '{count} nya primtal har lagts till i paletten — överhoppade dubbletter: {dupes}.'
      },
      'palette.full': {
        one: '{count} nytt primtal har lagts till — paletten är full ({max} tal); primtal som inte lades till: {left}.',
        other: '{count} nya primtal har lagts till — paletten är full ({max} tal); primtal som inte lades till: {left}.'
      },
      'palette.none': 'Alla hittade primtal finns redan i paletten — inget att lägga till.'
    },
    nb: {
      sound: 'Lyd',
      title: "Eratosthenes' sil — Interaktiv visualisering",
      heading: "Eratosthenes' sil",
      eyebrow: 'primtall og delelighet',
      lede: 'Gi hvert naturlige tall sin egen rute — og se hvordan silen stryker over alt som ikke er primtall.',
      sizeLabel: 'Silstørrelse (N)',
      generate: 'Generer',
      'stat.current': 'Nåværende',
      'stat.primesFound': 'Funnet primtall',
      'stat.sqrtBoundary': '√N-grense',
      'stat.elapsed': 'Forløpt',
      'stat.progress': 'Fremdrift',
      'stat.done': '✓ ferdig',
      'legend.unvisited': '{0} Ikke besøkt',
      'legend.currentPointer': '{0} Nåværende peker',
      'legend.prime': '{0} Primtall',
      'legend.composite': '{0} Strøket (sammensatt)',
      'legend.neither': '{0} Ingen av dem (1)',
      footer: 'Alle beregninger kjører lokalt i nettleseren din. Ingen tall ble skadet permanent — bare strøket.',
      'banner.ready': 'Klar. {n} ruter opprettet — trykk på Spill av for å sile.',
      'banner.single': 'Bare 1 rute — ingenting å sile.',
      'banner.reset': 'Tilbakestilt. {n} ruter gjenoppbygd — trykk på Spill av for å sile.',
      'banner.done': {
        one: 'Fant {count} primtall opp til {n} på {time}.',
        other: 'Fant {count} primtall opp til {n} på {time}.'
      },
      toPalette: 'Legg til funnede primtall i paletten',
      'palette.added': {
        one: '{count} nytt primtall er lagt til i paletten — dubletter hoppet over: {dupes}.',
        other: '{count} nye primtall er lagt til i paletten — dubletter hoppet over: {dupes}.'
      },
      'palette.full': {
        one: '{count} nytt primtall er lagt til — paletten er full ({max} tall); primtall som ikke ble lagt til: {left}.',
        other: '{count} nye primtall er lagt til — paletten er full ({max} tall); primtall som ikke ble lagt til: {left}.'
      },
      'palette.none': 'Alle funnede primtall ligger allerede i paletten — ingenting å legge til.'
    },
    ro: {
      sound: 'Sunet',
      title: 'Ciurul lui Eratostene — Vizualizator interactiv',
      heading: 'Ciurul lui Eratostene',
      eyebrow: 'numere prime și divizibilitate',
      lede: 'Dă fiecărui număr natural propria căsuță — apoi privește cum ciurul elimină tot ce nu este prim.',
      sizeLabel: 'Dimensiunea ciurului (N)',
      generate: 'Generează',
      'stat.current': 'Curent',
      'stat.primesFound': 'Numere prime găsite',
      'stat.sqrtBoundary': 'Limita √N',
      'stat.elapsed': 'Timp scurs',
      'stat.progress': 'Progres',
      'stat.done': '✓ terminat',
      'legend.unvisited': '{0} Nevizitat',
      'legend.currentPointer': '{0} Indicator curent',
      'legend.prime': '{0} Prim',
      'legend.composite': '{0} Eliminat (compus)',
      'legend.neither': '{0} Niciuna dintre variante (1)',
      footer: 'Toate calculele se execută local, în browserul tău. Niciun număr nu a fost afectat permanent — doar eliminat.',
      'banner.ready': 'Pregătit. Căsuțe create: {n} — apasă Redă pentru a cerne.',
      'banner.single': 'O singură căsuță — nimic de cernut.',
      'banner.reset': 'Resetat. Căsuțe reconstruite: {n} — apasă Redă pentru a cerne.',
      'banner.done': {
        one: 'Am găsit {count} număr prim până la {n} în {time}.',
        few: 'Am găsit {count} numere prime până la {n} în {time}.',
        other: 'Am găsit {count} de numere prime până la {n} în {time}.'
      },
      toPalette: 'Adaugă numerele prime găsite în paletă',
      'palette.added': {
        one: 'Am adăugat {count} număr prim nou în paletă — dubluri omise: {dupes}.',
        few: 'Am adăugat {count} numere prime noi în paletă — dubluri omise: {dupes}.',
        other: 'Am adăugat {count} de numere prime noi în paletă — dubluri omise: {dupes}.'
      },
      'palette.full': {
        one: 'Am adăugat {count} număr prim nou — paleta este plină ({max} de numere); numere prime neadăugate: {left}.',
        few: 'Am adăugat {count} numere prime noi — paleta este plină ({max} de numere); numere prime neadăugate: {left}.',
        other: 'Am adăugat {count} de numere prime noi — paleta este plină ({max} de numere); numere prime neadăugate: {left}.'
      },
      'palette.none': 'Toate numerele prime găsite sunt deja în paletă — nu e nimic de adăugat.'
    },
    hu: {
      sound: 'Hang',
      title: 'Eratoszthenész szitája — Interaktív vizualizáció',
      heading: 'Eratoszthenész szitája',
      eyebrow: 'prímszámok és oszthatóság',
      lede: 'Adj minden természetes számnak saját négyzetet — majd nézd meg, hogyan húzza át a szita mindazt, ami nem prím.',
      sizeLabel: 'Szita mérete (N)',
      generate: 'Generálás',
      'stat.current': 'Aktuális',
      'stat.primesFound': 'Talált prímszámok',
      'stat.sqrtBoundary': '√N határ',
      'stat.elapsed': 'Eltelt idő',
      'stat.progress': 'Haladás',
      'stat.done': '✓ kész',
      'legend.unvisited': '{0} Nem érintett',
      'legend.currentPointer': '{0} Aktuális mutató',
      'legend.prime': '{0} Prím',
      'legend.composite': '{0} Áthúzva (összetett)',
      'legend.neither': '{0} Egyik sem (1)',
      footer: 'Minden számítás a böngésződben, kliensoldalon történik. Semmilyen szám nem sérült véglegesen — csak áthúzásra került.',
      'banner.ready': 'Kész. {n} négyzet létrehozva — nyomd meg a Lejátszás gombot a szűréshez.',
      'banner.single': 'Csak 1 négyzet — nincs mit szűrni.',
      'banner.reset': 'Visszaállítva. {n} négyzet újraépítve — nyomd meg a Lejátszás gombot a szűréshez.',
      'banner.done': {
        one: '{count} prímszámot találtunk {n}-ig, {time} alatt.',
        other: '{count} prímszámot találtunk {n}-ig, {time} alatt.'
      },
      toPalette: 'A talált prímek hozzáadása a palettához',
      'palette.added': {
        one: '{count} új prímszám került a palettába — kihagyott duplikátumok: {dupes}.',
        other: '{count} új prímszám került a palettába — kihagyott duplikátumok: {dupes}.'
      },
      'palette.full': {
        one: '{count} új prímszám került a palettába — a paletta megtelt ({max} szám); nem hozzáadott prímszámok: {left}.',
        other: '{count} új prímszám került a palettába — a paletta megtelt ({max} szám); nem hozzáadott prímszámok: {left}.'
      },
      'palette.none': 'Minden talált prímszám már szerepel a palettán — nincs mit hozzáadni.'
    },
    lv: {
      sound: 'Skaņa',
      title: 'Eratostena siets — Interaktīvs vizualizētājs',
      heading: 'Eratostena siets',
      eyebrow: 'pirmskaitļi un dalāmība',
      lede: 'Dod katram naturālajam skaitlim savu lodziņu — un skaties, kā siets izsvītro visu, kas nav pirmskaitlis.',
      sizeLabel: 'Sieta izmērs (N)',
      generate: 'Generēt',
      'stat.current': 'Pašreizējais',
      'stat.primesFound': 'Atrastie pirmskaitļi',
      'stat.sqrtBoundary': '√N robeža',
      'stat.elapsed': 'Pagājis',
      'stat.progress': 'Virzība',
      'stat.done': '✓ pabeigts',
      'legend.unvisited': '{0} Neapmeklēts',
      'legend.currentPointer': '{0} Pašreizējais rādītājs',
      'legend.prime': '{0} Pirmskaitlis',
      'legend.composite': '{0} Izsvītrots (saliktais)',
      'legend.neither': '{0} Neviens no tiem (1)',
      footer: 'Visi aprēķini notiek tavā pārlūkā, klienta pusē. Neviens skaitlis nav cietis neatgriezeniski — tikai izsvītrots.',
      'banner.ready': 'Gatavs. Izveidoti lodziņi: {n} — nospied Atskaņot, lai sietu.',
      'banner.single': 'Tikai 1 lodziņš — nav ko sietu.',
      'banner.reset': 'Atiestatīts. Pārbūvēti lodziņi: {n} — nospied Atskaņot, lai sietu.',
      'banner.done': {
        zero: 'Atradām {count} pirmskaitļu līdz {n} {time} laikā.',
        one: 'Atradām {count} pirmskaitli līdz {n} {time} laikā.',
        other: 'Atradām {count} pirmskaitļus līdz {n} {time} laikā.'
      },
      toPalette: 'Pievienot atrastos pirmskaitļus paletei',
      'palette.added': {
        zero: 'Paletei pievienoti {count} jauno pirmskaitļu — izlaisti dublikāti: {dupes}.',
        one: 'Paletei pievienots {count} jauns pirmskaitlis — izlaisti dublikāti: {dupes}.',
        other: 'Paletei pievienoti {count} jauni pirmskaitļi — izlaisti dublikāti: {dupes}.'
      },
      'palette.full': {
        zero: 'Pievienoti {count} jauno pirmskaitļu — palete ir pilna ({max} skaitļu); nepievienotie pirmskaitļi: {left}.',
        one: 'Pievienots {count} jauns pirmskaitlis — palete ir pilna ({max} skaitļu); nepievienotie pirmskaitļi: {left}.',
        other: 'Pievienoti {count} jauni pirmskaitļi — palete ir pilna ({max} skaitļu); nepievienotie pirmskaitļi: {left}.'
      },
      'palette.none': 'Visi atrastie pirmskaitļi jau ir paletē — nav ko pievienot.'
    },
    ru: {
      sound: 'Звук',
      title: 'Решето Эратосфена — интерактивная визуализация',
      heading: 'Решето Эратосфена',
      eyebrow: 'простые числа и делимость',
      lede: 'Дай каждому натуральному числу свою ячейку — и смотри, как решето вычёркивает всё, что не простое.',
      sizeLabel: 'Размер решета (N)',
      generate: 'Создать',
      'stat.current': 'Текущее',
      'stat.primesFound': 'Найдено простых чисел',
      'stat.sqrtBoundary': 'Граница √N',
      'stat.elapsed': 'Прошло',
      'stat.progress': 'Прогресс',
      'stat.done': '✓ готово',
      'legend.unvisited': '{0} Не посещено',
      'legend.currentPointer': '{0} Текущий указатель',
      'legend.prime': '{0} Простое',
      'legend.composite': '{0} Вычеркнуто (составное)',
      'legend.neither': '{0} Ни то ни другое (1)',
      footer: 'Все вычисления выполняются на стороне клиента, в твоём браузере. Ни одно число не пострадало навсегда — только зачёркнуто.',
      'banner.ready': 'Готово. Создано ячеек: {n} — нажми «Пуск», чтобы просеивать.',
      'banner.single': 'Всего 1 ячейка — нечего просеивать.',
      'banner.reset': 'Сброшено. Пересобрано ячеек: {n} — нажми «Пуск», чтобы просеивать.',
      'banner.done': {
        one: 'Найдено {count} простое число до {n} за {time}.',
        few: 'Найдено {count} простых числа до {n} за {time}.',
        many: 'Найдено {count} простых чисел до {n} за {time}.',
        other: 'Найдено {count} простого числа до {n} за {time}.'
      },
      toPalette: 'Добавить найденные простые числа в палитру',
      'palette.added': {
        one: 'В палитру добавлено {count} новое простое число — пропущено дубликатов: {dupes}.',
        few: 'В палитру добавлено {count} новых простых числа — пропущено дубликатов: {dupes}.',
        many: 'В палитру добавлено {count} новых простых чисел — пропущено дубликатов: {dupes}.',
        other: 'В палитру добавлено {count} нового простого числа — пропущено дубликатов: {dupes}.'
      },
      'palette.full': {
        one: 'Добавлено {count} новое простое число — палитра заполнена ({max} чисел); не добавлено простых чисел: {left}.',
        few: 'Добавлено {count} новых простых числа — палитра заполнена ({max} чисел); не добавлено простых чисел: {left}.',
        many: 'Добавлено {count} новых простых чисел — палитра заполнена ({max} чисел); не добавлено простых чисел: {left}.',
        other: 'Добавлено {count} нового простого числа — палитра заполнена ({max} чисел); не добавлено простых чисел: {left}.'
      },
      'palette.none': 'Все найденные простые числа уже есть в палитре — добавлять нечего.'
    },
    el: {
      sound: 'Ήχος',
      title: 'Κόσκινο του Ερατοσθένη — Διαδραστική απεικόνιση',
      heading: 'Κόσκινο του Ερατοσθένη',
      eyebrow: 'πρώτοι αριθμοί και διαιρετότητα',
      lede: 'Δώσε σε κάθε φυσικό αριθμό το δικό του κουτί — και δες πώς το κόσκινο διαγράφει όλα όσα δεν είναι πρώτα.',
      sizeLabel: 'Μέγεθος κόσκινου (N)',
      generate: 'Δημιουργία',
      'stat.current': 'Τρέχον',
      'stat.primesFound': 'Πρώτοι που βρέθηκαν',
      'stat.sqrtBoundary': 'Όριο √N',
      'stat.elapsed': 'Πέρασε',
      'stat.progress': 'Πρόοδος',
      'stat.done': '✓ έτοιμο',
      'legend.unvisited': '{0} Μη επισκεφθέν',
      'legend.currentPointer': '{0} Τρέχων δείκτης',
      'legend.prime': '{0} Πρώτος',
      'legend.composite': '{0} Διαγραμμένο (σύνθετος)',
      'legend.neither': '{0} Κανένα από τα δύο (1)',
      footer: 'Όλοι οι υπολογισμοί εκτελούνται στην πλευρά του πελάτη, στο πρόγραμμα περιήγησής σου. Κανένας αριθμός δεν πάθαινε μόνιμη ζημιά — μόνο διαγραφή.',
      'banner.ready': 'Έτοιμο. Κελιά που δημιουργήθηκαν: {n} — πάτα «Έναρξη» για να γίνει η διαγραφή.',
      'banner.single': 'Μόνο 1 κελί — τίποτα για διαγραφή.',
      'banner.reset': 'Έγινε επαναφορά. Κελιά που ξαναχτίστηκαν: {n} — πάτα «Έναρξη» για να γίνει η διαγραφή.',
      'banner.done': {
        one: 'Βρέθηκε {count} πρώτος αριθμός έως το {n} σε {time}.',
        other: 'Βρέθηκαν {count} πρώτοι αριθμοί έως το {n} σε {time}.'
      },
      toPalette: 'Προσθήκη των πρώτων που βρέθηκαν στην παλέτα',
      'palette.added': {
        one: 'Προστέθηκε {count} νέος πρώτος αριθμός στην παλέτα — διπλότυπα που παραλείφθηκαν: {dupes}.',
        other: 'Προστέθηκαν {count} νέοι πρώτοι αριθμοί στην παλέτα — διπλότυπα που παραλείφθηκαν: {dupes}.'
      },
      'palette.full': {
        one: 'Προστέθηκε {count} νέος πρώτος αριθμός — η παλέτα είναι γεμάτη ({max} αριθμοί); πρώτοι που δεν προστέθηκαν: {left}.',
        other: 'Προστέθηκαν {count} νέοι πρώτοι αριθμοί — η παλέτα είναι γεμάτη ({max} αριθμοί); πρώτοι που δεν προστέθηκαν: {left}.'
      },
      'palette.none': 'Κάθε πρώτος που βρέθηκε υπάρχει ήδη στην παλέτα — δεν υπάρχει τίποτα να προστεθεί.'
    },
    he: {
      sound: 'צליל',
      title: 'הנפה של ארטוסתנס — המחשה אינטראקטיבית',
      heading: 'הנפה של ארטוסתנס',
      eyebrow: 'מספרים ראשוניים והתחלקות',
      lede: 'תנו לכל מספר טבעי תיבה משלו — וצפו כיצד הנפה מוחקת כל מה שאינו ראשוני.',
      sizeLabel: 'גודל הנפה (N)',
      generate: 'יצירה',
      'stat.current': 'נוכחי',
      'stat.primesFound': 'ראשוניים שנמצאו',
      'stat.sqrtBoundary': 'גבול \u2066√N\u2069',
      'stat.elapsed': 'זמן שחלף',
      'stat.progress': 'התקדמות',
      'stat.done': '✓ הושלם',
      'legend.unvisited': '{0} טרם נבדק',
      'legend.currentPointer': '{0} המצביע הנוכחי',
      'legend.prime': '{0} ראשוני',
      'legend.composite': '{0} נחצה (פריק)',
      'legend.neither': '{0} לא זה ולא זה (1)',
      footer: 'כל החישובים מתבצעים בצד הלקוח, בדפדפן שלכם. אף מספר לא ניזוק לצמיתות — רק נחצה.',
      'banner.ready': 'מוכן. נוצרו {n} תיבות — לחצו על הפעלה כדי לנפות.',
      'banner.single': 'תיבה אחת בלבד — אין מה לנפות.',
      'banner.reset': 'אופס. נבנו מחדש {n} תיבות — לחצו על הפעלה כדי לנפות.',
      'banner.done': {
        one: 'נמצא {count} מספר ראשוני עד {n} תוך {time}.',
        two: 'נמצאו {count} מספרים ראשוניים עד {n} תוך {time}.',
        other: 'נמצאו {count} מספרים ראשוניים עד {n} תוך {time}.'
      },
      toPalette: 'הוספת הראשוניים שנמצאו לפלטה',
      'palette.added': {
        one: 'נוסף {count} ראשוני חדש לפלטה — כפילויות שדולגו: {dupes}.',
        two: 'נוספו {count} ראשוניים חדשים לפלטה — כפילויות שדולגו: {dupes}.',
        other: 'נוספו {count} ראשוניים חדשים לפלטה — כפילויות שדולגו: {dupes}.'
      },
      'palette.full': {
        one: 'נוסף {count} ראשוני חדש — הפלטה מלאה ({max} מספרים); ראשוניים שלא נוספו: {left}.',
        two: 'נוספו {count} ראשוניים חדשים — הפלטה מלאה ({max} מספרים); ראשוניים שלא נוספו: {left}.',
        other: 'נוספו {count} ראשוניים חדשים — הפלטה מלאה ({max} מספרים); ראשוניים שלא נוספו: {left}.'
      },
      'palette.none': 'כל הראשוניים שנמצאו כבר נמצאים בפלטה — אין מה להוסיף.'
    }
  });
})();
