# Phase 6 — Translation Glossary

Terminology, tone and style contract for every per-page translation plan in this phase
(06-02 through 06-11). Draft status per 06-RESEARCH.md Pitfall 6 — `[ASSUMED]` cells are
training-knowledge mathematical terms, not independently re-verified this session;
`[CITED: source]` cells trace to a source quoted in 06-RESEARCH.md. The whole file is
gated behind the end-of-phase `checkpoint:human-verify` in 06-02 Task 1 (ideally reviewed
by a speaker of each non-English language with a math background) before the phase is
considered translation-complete.

---

## (a) Per-language style

### Tone (per 06-01-PLAN.md assumption A9)

| Language | Register | Notes |
|---|---|---|
| Dutch (nl) | Informal — **je/jouw** | Matches the Sieve's existing lede ("Geef elk natuurlijk getal zijn eigen vakje…"), addressing the learner directly. |
| English (en) | Neutral/imperative | Source-of-truth dictionary; no register shift needed. |
| German (de) | Informal — **du/dein** | Imperative verb forms ("drücke", "sieh zu") already established by 06-01's banner strings. |
| French (fr) | Formal — **vous** | Imperative forms use the `vous` conjugation ("appuyez", not "appuie"). |
| Spanish (es) | Informal — **tú** | Imperative forms use the `tú` conjugation ("pulsa", not "pulse"). |
| Italian (it) `[ASSUMED]` | Informal — **tu/tuo** | Imperative verb forms use the `tu` conjugation ("premi", "scegli", "guarda", "inserisci"), matching nl je / de du / es tú. Added 2026-10-02 by quick task 261002-c77. |
| Polish (pl) `[ASSUMED]` | Informal — **ty/twój** | 2nd-person-singular imperatives (naciśnij, wybierz, zobacz, wpisz, kliknij), matching nl je / de du / es tú / it tu. Added 2026-10-02 by quick task 261002-fmi. |

### Punctuation per language

- **French (fr):** a narrow no-break space (U+202F) before `:` `;` `?` `!`, and inside
  guillemets (`« texte »`). Apply only where the translated sentence itself
  carries one of those marks — most of this phase's short UI strings end in `.` or have
  no closing punctuation, so this rule applies sparingly (e.g. a future `?`-ended
  confirmation prompt).
- **German (de):** typographic double quotes `„…"` (low-high) rather than straight `"…"`
  when a dictionary value needs to quote something; compound nouns stay closed
  (`Primzahl`, not `Prim-Zahl`).
- **Spanish (es):** inverted marks `¿…?` and `¡…!` open AND close a question/exclamation
  (`¿Qué es esto?`, not `Qué es esto?`).
- **All languages:** typographic apostrophes (`'`) are allowed and preferred over the
  straight ASCII apostrophe inside prose dictionary values (matches the existing English
  source, e.g. `"isn't"` in the Sieve's lede — kept straight there only because it was
  already shipped pre-phase; new French/English text added by this phase may use `'`
  consistently with existing values in the same file).
- **Capitalization of headings:** English/German/Dutch capitalize headings/tool names in
  Title Case per word (German additionally capitalizes all nouns regardless of position,
  per standard German orthography — not a special UI rule). French and Spanish
  capitalize only the first word and proper nouns in headings/titles (sentence case),
  per standard French/Spanish typographic convention — e.g. French `"Crible
  d'Ératosthène"` (Ératosthène capitalized as a proper noun, `Crible` capitalized as the
  first word, `d'` lowercase) and Spanish `"Criba de Eratóstenes"` (same pattern).
- **Italian (it) `[ASSUMED]`:** apostrophes prefer the typographic `’` for elisions
  (`dell’esempio`, `l’algoritmo`); a value that does use a straight ASCII apostrophe must
  be double-quoted, like the French nav values in `site.js`. No space before `:` `;` `?`
  `!`. Quotes, if ever needed, use guillemets `« »`. Headings/tool names capitalize only
  the first word and proper nouns (sentence case), matching French/Spanish — e.g.
  `"Crivello di Eratostene"`. Added 2026-10-02 by quick task 261002-c77.
- **Polish (pl) `[ASSUMED]`:** quotes, if ever needed, use „…” (U+201E/U+201D). No space
  before `:` `;` `?` `!`. Headings/tool names capitalize only the first word and proper
  nouns (sentence case), matching fr/es/it — e.g. `"Sito Eratostenesa"`. A value that
  contains a straight ASCII apostrophe must be double-quoted, like the French nav values
  in `site.js`. Plural dictionary values carry four CLDR forms — `one` (exactly 1), `few`
  (2–4, 22–24, 32–34 … but not 12–14), `many` (0, 5–21, 25–31 …) and `other` (fractional
  counts, reusing the `many` wording per gettext's three-form Polish practice). The noun
  after a numeral changes with the numeral's value, so any number that is not the entry's
  own `count` — and any number inside a plain-string value — is phrased so no surrounding
  word depends on its value (a label form or a symbol/abbreviation, never an inflected
  noun for one fixed number). Eponyms other than Euclid/Eratosthenes keep their spelling
  but take regular Polish case endings in prose (Eulera, Fermata, Cayleya, Venna, Shora,
  Bézouta, Diffiego-Hellmana); Alice and Eve stay indeclinable. Added 2026-10-02 by quick
  task 261002-fmi.

---

## (b) Tool names

16 rows: the `site.nav.*` values (from `assets/i18n/site.js`, seeded in 06-01-PLAN.md)
plus each tool's page `<title>`/`<h1>` form. The hub card title form (index.html, 06-03)
reuses the `nav.*` value verbatim — index.html has no separate "hub card" wording
distinct from the nav label. The `it` column (`[ASSUMED]`) was added 2026-10-02 by quick
task 261002-c77. The `pl` column (`[ASSUMED]`) was added 2026-10-02 by quick task
261002-fmi.

| id | File | en (site.nav / page h1) | nl | de | fr | es | it | pl |
|---|---|---|---|---|---|---|---|---|
| home | index.html | Home | Start | Startseite | Accueil | Inicio | Inizio | Strona główna |
| sieve | Sieve Of Eratosthenes/sieve-of-eratosthenes.html | Sieve of Eratosthenes | Zeef van Eratosthenes | Sieb des Eratosthenes | Crible d'Ératosthène | Criba de Eratóstenes | Crivello di Eratostene | Sito Eratostenesa |
| factorTree | Factor Tree/factor-tree.html | Factor Tree | Factorboom | Faktorbaum | Arbre de facteurs | Árbol de factores | Albero dei fattori | Drzewo czynników |
| venn | Venn Diagram/venn-diagram.html | Venn Diagram | Venndiagram | Venn-Diagramm | Diagramme de Venn | Diagrama de Venn | Diagramma di Venn | Diagram Venna |
| euclid | Euclidean Algorithm/euclidean-algorithm.html | Euclidean Algorithm | Algoritme van Euclides | Euklidischer Algorithmus | Algorithme d'Euclide | Algoritmo de Euclides | Algoritmo di Euclide | Algorytm Euklidesa |
| crt | Chinese Remainder Theorem/chinese-remainder-theorem.html | Chinese Remainder Theorem | Chinese reststelling | Chinesischer Restsatz | Théorème des restes chinois | Teorema chino del resto | Teorema cinese del resto | Chińskie twierdzenie o resztach |
| wheel | Equivalence Wheel/equivalence-wheel.html | Equivalence Wheel | Equivalentiewiel | Äquivalenzrad | Roue d'équivalence | Rueda de equivalencia | Ruota di equivalenza | Koło równoważności |
| totient | Eulers Totient/eulers-totient.html | Euler's Totient | Eulers phi-functie | Eulersche Phi-Funktion | Indicatrice d'Euler | Función φ de Euler | Funzione φ di Eulero | Funkcja φ Eulera |
| cayley | Cayley Table/cayley-table.html | Cayley Table | Cayleytabel | Cayley-Tafel | Table de Cayley | Tabla de Cayley | Tavola di Cayley | Tabela Cayleya |
| iso | Group Isomorphism/group-isomorphism.html | Group Isomorphism | Groepsisomorfisme | Gruppenisomorphismus | Isomorphisme de groupes | Isomorfismo de grupos | Isomorfismo di gruppi | Izomorfizm grup |
| sqm | Square And Multiply/square-and-multiply.html | Square and Multiply | Kwadrateren en vermenigvuldigen | Quadrieren und Multiplizieren | Exponentiation rapide | Exponenciación rápida | Esponenziazione rapida | Szybkie potęgowanie |
| dh | Diffie-Hellman Key Exchange/diffie-hellman-key-exchange.html | Diffie-Hellman | Diffie-Hellman | Diffie-Hellman | Diffie-Hellman | Diffie-Hellman | Diffie-Hellman | Diffie-Hellman |
| ecdh | Elliptic Curve Diffie-Hellman/elliptic-curve-diffie-hellman.html | Elliptic Curve DH | Elliptische-krommen-DH | Elliptische-Kurven-DH | DH sur courbes elliptiques | DH de curva elíptica | DH su curve ellittiche | DH na krzywych eliptycznych |
| rsa | RSA/rsa.html | RSA | RSA | RSA | RSA | RSA | RSA | RSA |
| fermat | Fermats Method/fermats-method.html | Fermat's Method | Methode van Fermat | Fermat-Methode | Méthode de Fermat | Método de Fermat | Metodo di Fermat | Metoda Fermata |
| shor | Shors Algorithm/shors-algorithm.html | Shor's Algorithm | Algoritme van Shor | Shor-Algorithmus | Algorithme de Shor | Algoritmo de Shor | Algoritmo di Shor | Algorytm Shora |

(`nav.dh` and `nav.rsa` are identical in every language by design — proper nouns/acronyms
only, which the project's prose rule treats as neutral; `--coverage`'s IDENTICAL-TO-EN
check never flags them.)

---

## (c) Core terms (45+)

Confidence tags: `[CITED: source]` traces to 06-RESEARCH.md's Sources section;
`[ASSUMED]` is training-knowledge, not independently re-verified this session.

| # | Term (en) | nl | de | fr | es | it | pl | Confidence |
|---|---|---|---|---|---|---|---|---|
| 1 | prime (number) | priemgetal | Primzahl | nombre premier | número primo | numero primo | liczba pierwsza | `[ASSUMED]` |
| 2 | composite (number) | samengesteld getal | zusammengesetzte Zahl | nombre composé | número compuesto | numero composto | liczba złożona | `[ASSUMED]` |
| 3 | factor | factor | Faktor | facteur | factor | fattore | czynnik | `[ASSUMED]` |
| 4 | prime factorization | priemfactorisatie | Primfaktorzerlegung | décomposition en facteurs premiers | factorización en primos | fattorizzazione in numeri primi | rozkład na czynniki pierwsze | `[ASSUMED]` |
| 5 | divisor | deler | Teiler | diviseur | divisor | divisore | dzielnik | `[ASSUMED]` |
| 6 | greatest common divisor | grootste gemene deler (ggd) | größter gemeinsamer Teiler (ggT) | plus grand commun diviseur (PGCD) | máximo común divisor (mcd) | massimo comun divisore (MCD) | największy wspólny dzielnik (NWD) | `[CITED: en.wiktionary.org, bab.la]` (it `[ASSUMED]`) |
| 7 | least common multiple | kleinste gemene veelvoud (kgv) | kleinstes gemeinsames Vielfaches (kgV) | plus petit commun multiple (PPCM) | mínimo común múltiplo (mcm) | minimo comune multiplo (mcm) | najmniejsza wspólna wielokrotność (NWW) | `[ASSUMED]` |
| 8 | quotient | quotiënt | Quotient | quotient | cociente | quoziente | iloraz | `[ASSUMED]` |
| 9 | remainder | rest | Rest | reste | resto | resto | reszta | `[ASSUMED]` |
| 10 | modulus | modulus | Modul | module | módulo | modulo | moduł | `[CITED: dictionary.reverso.net for ES]` / `[ASSUMED: nl, de, fr, it]` |
| 11 | residue | rest(klasse)vertegenwoordiger | Rest | reste | resto | residuo / classe di resto | reszta / klasa reszt | `[ASSUMED]` |
| 12 | congruence / congruent | congruentie / congruent | Kongruenz / kongruent | congruence / congru | congruencia / congruente | congruenza / congruente | kongruencja / przystający | `[ASSUMED]` |
| 13 | equivalence class | equivalentieklasse | Äquivalenzklasse | classe d'équivalence | clase de equivalencia | classe di equivalenza | klasa równoważności (klasa abstrakcji) | `[ASSUMED]` |
| 14 | modular inverse | modulaire inverse | modulares Inverses | inverse modulaire | inverso modular | inverso modulare | odwrotność modulo n (element odwrotny) | `[ASSUMED]` |
| 15 | coprime | onderling ondeelbaar (coprime) | teilerfremd | premiers entre eux | coprimo | coprimi (primi tra loro) | względnie pierwsze | `[ASSUMED]` |
| 16 | totient (Euler's totient function) | Eulers phi-functie | Eulersche Phi-Funktion | indicatrice d'Euler | función φ de Euler | funzione φ di Eulero | funkcja φ Eulera | `[CITED: Wikidata/Wikipedia for de/fr/es]` / `[ASSUMED: nl, it]` |
| 17 | group (algebraic) | groep | Gruppe | groupe | grupo | gruppo | grupa | `[ASSUMED]` |
| 18 | additive group | additieve groep | additive Gruppe | groupe additif | grupo aditivo | gruppo additivo | grupa addytywna | `[ASSUMED]` |
| 19 | multiplicative group | multiplicatieve groep | multiplikative Gruppe | groupe multiplicatif | grupo multiplicativo | gruppo moltiplicativo | grupa multiplikatywna | `[ASSUMED]` |
| 20 | unit (group element) | eenheid | Einheit | unité | unidad | unità | element odwracalny | `[ASSUMED]` |
| 21 | identity element | identiteitselement / neutraal element | neutrales Element | élément neutre | elemento neutro | elemento neutro | element neutralny | `[ASSUMED]` |
| 22 | inverse (element) | inverse | Inverses | inverse | inverso | inverso | element odwrotny | `[ASSUMED]` |
| 23 | order of an element | orde van een element | Ordnung eines Elements | ordre d'un élément | orden de un elemento | ordine di un elemento | rząd elementu | `[ASSUMED]` |
| 24 | generator / primitive root | voortbrenger / primitieve wortel | Erzeuger / primitive Wurzel | générateur / racine primitive | generador / raíz primitiva | generatore / radice primitiva | generator / pierwiastek pierwotny | `[ASSUMED]` |
| 25 | cyclic group | cyclische groep | zyklische Gruppe | groupe cyclique | grupo cíclico | gruppo ciclico | grupa cykliczna | `[ASSUMED]` |
| 26 | isomorphism | isomorfisme | Isomorphismus | isomorphisme | isomorfismo | isomorfismo | izomorfizm | `[ASSUMED]` |
| 27 | operation table | bewerkingstabel | Verknüpfungstafel | table d'opération | tabla de operación | tavola dell'operazione | tabela działania | `[CITED: Wikimedia Commons — Cayley table]` (it `[ASSUMED]`) |
| 28 | commutative | commutatief | kommutativ | commutatif | conmutativo | commutativo | przemienny | `[ASSUMED]` |
| 29 | perfect square | kwadraatgetal | Quadratzahl | carré parfait | cuadrado perfecto | quadrato perfetto | kwadrat liczby całkowitej (liczba kwadratowa) | `[ASSUMED]` |
| 30 | factorization method | factorisatiemethode | Faktorisierungsmethode | méthode de factorisation | método de factorización | metodo di fattorizzazione | metoda faktoryzacji | `[ASSUMED]` |
| 31 | exponent | exponent | Exponent | exposant | exponente | esponente | wykładnik | `[ASSUMED]` |
| 32 | base (of an exponentiation) | grondtal | Basis | base | base | base | podstawa | `[ASSUMED]` |
| 33 | modular exponentiation | modulaire machtsverheffing | modulare Exponentiation | exponentiation modulaire | exponenciación modular | esponenziazione modulare | potęgowanie modularne | `[ASSUMED]` |
| 34 | binary expansion | binaire expansie | Binärdarstellung | développement binaire | expansión binaria | espansione binaria | rozwinięcie dwójkowe | `[ASSUMED]` |
| 35 | square / multiply step | kwadrateer-/vermenigvuldigstap | Quadrier-/Multiplikationsschritt | étape d'élévation au carré / multiplication | paso de elevar al cuadrado / multiplicar | passo di elevamento al quadrato / di moltiplicazione | krok podnoszenia do kwadratu / mnożenia | `[ASSUMED]` |
| 36 | public key | publieke sleutel | öffentlicher Schlüssel | clé publique | clave pública | chiave pubblica | klucz publiczny | `[ASSUMED]` |
| 37 | private key | privésleutel | privater Schlüssel | clé privée | clave privada | chiave privata | klucz prywatny | `[ASSUMED]` |
| 38 | key pair | sleutelpaar | Schlüsselpaar | paire de clés | par de claves | coppia di chiavi | para kluczy | `[ASSUMED]` |
| 39 | shared secret | gedeeld geheim | gemeinsames Geheimnis | secret partagé | secreto compartido | segreto condiviso | wspólny sekret | `[ASSUMED]` |
| 40 | encrypt | versleutelen | verschlüsseln | chiffrer | cifrar | cifrare | szyfrować | `[ASSUMED]` |
| 41 | decrypt | ontsleutelen | entschlüsseln | déchiffrer | descifrar | decifrare | odszyfrować | `[ASSUMED]` |
| 42 | plaintext | leesbare tekst (plaintext) | Klartext | texte en clair | texto plano | testo in chiaro | tekst jawny | `[ASSUMED]` |
| 43 | ciphertext | cijfertekst | Geheimtext | texte chiffré | texto cifrado | testo cifrato | szyfrogram | `[ASSUMED]` |
| 44 | discrete logarithm | discrete logaritme | diskreter Logarithmus | logarithme discret | logaritmo discreto | logaritmo discreto | logarytm dyskretny | `[ASSUMED]` |
| 45 | brute force | brute kracht | Brute-Force | force brute | fuerza bruta | forza bruta | metoda siłowa (atak siłowy) | `[ASSUMED]` |
| 46 | elliptic curve | elliptische kromme | elliptische Kurve | courbe elliptique | curva elíptica | curva ellittica | krzywa eliptyczna | `[ASSUMED]` |
| 47 | point at infinity | punt op oneindig | Punkt im Unendlichen | point à l'infini | punto en el infinito | punto all'infinito | punkt w nieskończoności | `[ASSUMED]` |
| 48 | scalar multiplication | scalaire vermenigvuldiging | Skalarmultiplikation | multiplication scalaire | multiplicación escalar | moltiplicazione scalare | mnożenie przez skalar | `[ASSUMED]` |
| 49 | order finding | ordebepaling | Ordnungsbestimmung | recherche d'ordre | búsqueda de orden | ricerca dell'ordine | wyznaczanie rzędu | `[ASSUMED]` |
| 50 | period | periode | Periode | période | periodo | periodo | okres | `[ASSUMED]` |
| 51 | preset / example | voorbeeld | Beispiel | exemple | ejemplo | esempio | przykład | `[ASSUMED]` |
| 52 | step (playback) | stap | Schritt | étape | paso | passo | krok | `[ASSUMED]` — matches `common.step` |
| 53 | playback | afspelen | Wiedergabe | lecture | reproducción | riproduzione | odtwarzanie | `[ASSUMED]` |

---

## (d) Proper nouns (kept, conventional eponym spelling)

| Proper noun | nl | de | fr | es | it | pl | Note |
|---|---|---|---|---|---|---|---|
| Alice | Alice | Alice | Alice | Alicia | Alice | Alice | ES RSA narrative commonly localizes to "Alicia"; **kept as "Alice" in all languages per this glossary** to match the existing cross-tool Bob/Alice/Eve narrative identically everywhere (consistency over localization). pl Alice is indeclinable. |
| Bob | Bob | Bob | Bob | Bob | Bob | Bob | Unchanged in all languages; pl may decline (Boba, Bobowi) only where the name sits literally inside a value, never through a placeholder slot. |
| Eve | Eve | Eve | Ève | Eva | Eve | Eve | Kept per the project's narrative convention (see Alice above) — no language-specific substitution; it per Q-03 (quick task 261002-c77); pl Eve is indeclinable. |
| RSA | RSA | RSA | RSA | RSA | RSA | RSA | Acronym, invariant. |
| Diffie-Hellman | Diffie-Hellman | Diffie-Hellman | Diffie-Hellman | Diffie-Hellman | Diffie-Hellman | Diffie-Hellman | Eponym pair, invariant spelling; pl declines it in prose as "Diffiego-Hellmana". |
| Euler | Euler | Euler | Euler | Euler | Eulero | Euler | Invariant spelling in nl, de, fr, es and pl; per-language eponym spelling now extends to Italian ("Eulero"), per Q-03 (quick task 261002-c77); pl declines it in prose as "Eulera". |
| Fermat | Fermat | Fermat | Fermat | Fermat | Fermat | Fermat | Invariant spelling; pl declines it in prose as "Fermata". |
| Cayley | Cayley | Cayley | Cayley | Cayley | Cayley | Cayley | Invariant spelling; pl declines it in prose as "Cayleya". |
| Venn | Venn | Venn | Venn | Venn | Venn | Venn | Invariant spelling; pl declines it in prose as "Venna". |
| Shor | Shor | Shor | Shor | Shor | Shor | Shor | Invariant spelling; pl declines it in prose as "Shora". |
| Euclid / Euclides / Euklid / Euclide / Euclides / Euklides | Euclides | Euklid | Euclide | Euclides | Euclide | Euklides | Per-language eponym spelling — already used in `site.nav.euclid` (06-01); it matches fr ("Euclide"), per Q-03; pl uses the conventional Polish form "Euklides" and declines it in prose ("Algorytm Euklidesa"). |
| Eratosthenes / Eratosthène / Eratóstenes / Eratostene / Eratostenes | Eratosthenes | Eratosthenes | Ératosthène | Eratóstenes | Eratostene | Eratostenes | Per-language eponym spelling — already used in `site.nav.sieve` (06-01); it per Q-03; pl uses the conventional Polish form "Eratostenes" ("Sito Eratostenesa"). |
| Bézout | Bézout | Bézout | Bézout | Bézout | Bézout | Bézout | Invariant spelling (Euclidean Algorithm tool's Extended Euclidean/Bézout coefficients); pl declines it in prose as "Bézouta". |
| Sun Tzu | Sun Tzu | Sunzi | Sun Tzu | Sun Tzu | Sun Tzu | Sun Tzu | CRT's historical attribution (Sunzi Suanjing) — DE conventionally uses the pinyin "Sunzi"; other languages, including pl, keep "Sun Tzu" (invariant). `[ASSUMED]` |

All proper nouns above are neutral tokens per `i18n-check.js`'s prose rule (NEUTRAL_TOKENS)
and are never flagged by IDENTICAL-TO-EN.

---

## (e) Numerals and notation (06-01-PLAN assumption A7)

Numerals are **never** locale-formatted in any of the seven languages. Existing
`toString()`/`NT.bigint.fmt` output (comma-grouped thousands, `.` decimal point where
applicable) stays byte-identical in every language — French/German/Dutch/Italian/Polish
conventions that would normally swap `.`/`,` separators or use a different grouping
character **do not apply** to this site's math output, because the numerals displayed are
computed data (RSA moduli, GCD results, Cayley table entries, CF convergents), not
locale-formatted quantities. `i18n-check.js --no-locale-number-format` and the
`i18n-browser.js` en-parity gate enforce this: a `toLocale…String` call or an `Intl.`
constructor other than `Intl.PluralRules` anywhere in a page's inline script or any
`assets/*.js`/`assets/i18n/*.js` file is a LOCALE-FORMAT finding. Mathematical notation
(×, ÷, ², √, ≡, mod, gcd, lcm, →, ≤, ≥) is written identically in all seven languages — these
are the seven autonyms' shared symbolic vocabulary, not natural-language text.

---

## (f) Common vocabulary table

The `common` namespace (`assets/i18n/site.js`, 06-02 Task 1) — shared strings used
verbatim by two or more tools. Any new cross-tool string discovered by a later wave-3
plan is added here (and to `assets/i18n/site.js`) rather than duplicated per-page; a
per-tool plan never edits `assets/i18n/site.js` itself for a string that is not already
shared by at least two pages.

| key | Pages using it | en | nl | de | fr | es | it | pl |
|---|---|---|---|---|---|---|---|---|
| common.play | Chinese Remainder Theorem, Diffie-Hellman Key Exchange, Elliptic Curve Diffie-Hellman, Euclidean Algorithm, Euler's Totient, Fermat's Method, Shor's Algorithm, Sieve of Eratosthenes, Square and Multiply | ▶ Play | ▶ Afspelen | ▶ Abspielen | ▶ Lecture | ▶ Reproducir | ▶ Riproduci | ▶ Odtwórz |
| common.pause | (same 9) | ⏸ Pause | ⏸ Pauzeren | ⏸ Pausieren | ⏸ Mettre en pause | ⏸ Pausar | ⏸ Pausa | ⏸ Pauza |
| common.step | (same 9) | ⏭ Step | ⏭ Stap | ⏭ Schritt | ⏭ Étape | ⏭ Paso | ⏭ Passo | ⏭ Krok |
| common.instant | (same 9) | ⏩ Instant | ⏩ Direct | ⏩ Sofort | ⏩ Instantané | ⏩ Instantáneo | ⏩ Istantaneo | ⏩ Natychmiast |
| common.reset | (same 9) | ↺ Reset | ↺ Herstart | ↺ Zurücksetzen | ↺ Réinitialiser | ↺ Reiniciar | ↺ Reimposta | ↺ Resetuj |
| common.speed | (same 9) | Speed | Snelheid | Geschwindigkeit | Vitesse | Velocidad | Velocità | Prędkość |
| common.speed.1 … common.speed.10 | (same 9) | glacial … instant-ish | ijzig … bijna-direct | eisig … fast augenblicklich | glaciaire … quasi instantané | gélido … casi instantáneo | glaciale … quasi istantaneo | lodowata … niemal natychmiastowa |
| common.additiveGroups | Cayley Table, Equivalence Wheel | Additive Groups | Additieve groepen | Additive Gruppen | Groupes additifs | Grupos aditivos | Gruppi additivi | Grupy addytywne |
| common.multiplicativeGroups | Cayley Table, Equivalence Wheel | Multiplicative Groups | Multiplicatieve groepen | Multiplikative Gruppen | Groupes multiplicatifs | Grupos multiplicativos | Gruppi moltiplicativi | Grupy multiplikatywne |

(The full speed-word table is in `assets/i18n/site.js`; this row is a pointer, not a
duplicate source of truth.)
