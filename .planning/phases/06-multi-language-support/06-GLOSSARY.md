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
| Brazilian Portuguese (pt-BR) `[ASSUMED]` | Informal-neutral — **você/seu** | Third-person imperatives (clique, digite, escolha, pressione, veja, tente, arraste, insira); Brazilian spelling and vocabulary. Added 2026-10-02 by quick task 261002-jh4. |
| European Portuguese (pt-PT) `[ASSUMED]` | Informal — **tu/teu** | Second-person-singular imperatives (clica, escreve, escolhe, prime, vê, tenta, arrasta, insere), matching es tú / it tu / pl ty; European spelling and vocabulary. Added 2026-10-02 by quick task 261002-jh4. |
| Swedish (sv) `[ASSUMED]` | Informal — **du/din** | Second-person-singular imperatives (tryck, välj, klicka, skriv, ange, se, prova, dra), matching nl je / de du / es tú / it tu / pl ty / pt-PT tu; standard Swedish spelling and vocabulary. Added 2026-10-02 by quick task 261002-s7l. |
| Norwegian Bokmål (nb) `[ASSUMED]` | Informal — **du/din** | Second-person-singular imperatives (trykk, velg, klikk, skriv, angi, se, prøv, dra), matching the same group; standard, moderate Bokmål — no Nynorsk forms. Added 2026-10-02 by quick task 261002-s7l. |
| Romanian (ro) `[ASSUMED]` | Informal — **tu/tău** | Second-person-singular imperatives (apasă, alege, fă clic, scrie, introdu, vezi, încearcă, trage), matching nl je / de du / es tú / it tu / pl ty / pt-PT tu / sv du / nb du; standard orthography with comma-below ș ț and â/î per the 1993 norm. Added 2026-10-03 by quick task 261003-0dr. |
| Hungarian (hu) `[ASSUMED]` | Informal — **te/-d** | Second-person-singular imperatives in the definite or indefinite conjugation as the object requires (nyomd meg, válaszd ki, kattints, írd be, add meg, nézd meg, próbáld ki, húzd); double-acute ő ű. Added 2026-10-03 by quick task 261003-0dr. |
| Latvian (lv) `[ASSUMED]` | Informal — **tu/tavs** | Second-person-singular imperatives (nospied, izvēlies, noklikšķini, ievadi, raksti, skaties, pamēģini, velc); modern orthography. Added 2026-10-03 by quick task 261003-0dr. |
| Russian (ru) `[ASSUMED]` | Informal — **ты/твой** | Second-person-singular imperatives (нажми, выбери, щёлкни, введи, посмотри, попробуй, перетащи, перемести), matching nl je / de du / es tú / it tu / pl ty / pt-PT tu / sv du / nb du / ro tu / hu te / lv tu; modern orthography with ё wherever standard spelling has it. Added 2026-10-03 by quick task 261003-57k. |
| Greek (el) `[ASSUMED]` | Informal — **εσύ/σου** | Second-person-singular imperatives (πάτα, διάλεξε, κάνε κλικ, γράψε, δες, δοκίμασε, σύρε, μετακίνησε); monotonic orthography with tonos. Added 2026-10-03 by quick task 261003-57k. |
| Hebrew (he) `[ASSUMED]` | Gender-neutral second-person **plural** (the convention of Israeli web UIs) | Plural imperatives for instructions (לחצו, בחרו, הזינו, צפו, נסו, גררו, הקישו); action nouns for buttons (יצירה, הפעלה, השהיה, איפוס); modern full spelling (ktiv male) without niqqud. Added 2026-10-06 by quick task 261006-pks. |
| Hindi (hi) `[ASSUMED]` | Formal-polite — **आप** (the convention of Hindi software UIs) | Polite imperatives in the `-एँ` form for instructions and buttons (चुनें, दबाएँ, क्लिक करें, दर्ज करें, देखें, आज़माएँ, खींचें, चलाएँ, रोकें, रीसेट करें, बनाएँ); verb agreement with आप takes the standard masculine-plural honorific default. Added 2026-10-06 by quick task 261006-vpp. |

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
- **Brazilian Portuguese (pt-BR) and European Portuguese (pt-PT) `[ASSUMED]`:** quotes, if
  ever needed, use “…” in pt-BR and «…» in pt-PT. No space before `:` `;` `?` `!`.
  Headings/tool names capitalize only the first word and proper nouns (sentence case),
  matching fr/es/it/pl. A value containing a straight ASCII apostrophe must be
  double-quoted, like the French nav values in `site.js`. Spelling and vocabulary diverge
  by variant: pt-BR keeps circumflex forms (econômico, fenômeno, polinômio, gênero) and
  vocabulary arquivo/tela/registro/usuário/compartilhar/de fato, with proclisis (`se
  encaixa`) and the gerund progressive (`está calculando`); pt-PT keeps acute forms
  (económico, fenómeno, polinómio, género) and vocabulary ficheiro/ecrã/registo/
  utilizador/partilhar/facto, with enclisis (`encaixa-se`) and `estar a` + infinitive
  (`está a calcular`). Where a file localizes the gcd/lcm notation or the prose noun "the
  GCD", pt-BR uses `mdc(`/`mmc(` and "o MDC", pt-PT uses `m.d.c.(`/`m.m.c.(` and "o
  m.d.c.". Plural dictionary values are `{one, other}` like fr/es/it: pt-BR's `one`
  (CLDR `pt`) covers counts 0 and 1, while pt-PT's `one` covers exactly 1; both fall back
  to `other` for CLDR `many` (exact multiples of 1,000,000), which has no dictionary key.
  Added 2026-10-02 by quick task 261002-jh4.
- **Swedish (sv) and Norwegian Bokmål (nb) `[ASSUMED]`:** quotes, if ever needed, use ”…”
  (U+201D on both sides) in sv and «…» in nb. No space before `:` `;` `?` `!`.
  Headings/tool names capitalize only the first word and proper nouns (sentence case),
  matching fr/es/it/pl/pt. A value containing a straight ASCII apostrophe (the nb genitive
  "Eratosthenes' sil") must be double-quoted, like the French nav values in `site.js`.
  Vocabulary and notation use "tal"/"tall" for number, delare/divisor, kvot/kvotient,
  modul/modul, nyckel(ar)/nøkkel/nøkler; compounds are closed in both languages
  (Faktorträd/Faktortre, nyckelpar/nøkkelpar), hyphenated only where one element is a
  symbol, digit, abbreviation or acronym (RSA-nyckel/RSA-nøkkel, φ-funktion/φ-funksjon).
  Where a file localizes gcd/lcm notation or the prose noun "the GCD", sv uses `SGD(`/
  `MGM(` and the noun "SGD", nb uses `SFD(`/`MFM(` and the noun "SFD". Plural dictionary
  values are `{one, other}`: CLDR gives both languages exactly `one, other`, with `one`
  meaning exactly the integer 1; an invariant neuter noun (steg, primtal/primtall) may make
  `one` and `other` identical. Euclid is "Euklides" in sv and "Euklid" in nb (both already
  neutral tokens); every other eponym (Eratosthenes, Euler, Fermat, Cayley, Venn, Shor,
  Bézout, Diffie-Hellman, Sun Tzu) is invariant, forms the genitive with a plain -s, and a
  name already ending in -s takes no further ending in sv and an apostrophe in nb
  (Eulers/Fermats/Shors, but Euklides algoritm / Eratosthenes såll in sv and Eratosthenes'
  sil in nb). A placeholder possessive (`{0}'s`, rsa.js only) is sv `{0}s` and nb the
  til-construction ("… til {0}"). Added 2026-10-02 by quick task 261002-s7l.
- **Romanian (ro), Hungarian (hu) and Latvian (lv) `[ASSUMED]`:** ro/hu quotes use
  „…” (U+201E/U+201D); lv quotes use „…“ (U+201E/U+201C). No space before `:` `;` `?`
  `!` in any of the three. Headings/tool names capitalize only the first word and proper
  nouns (sentence case), matching fr/es/it/pl/pt/sv/nb. A value containing a straight
  ASCII apostrophe must be double-quoted, like the French nav values in `site.js`.
  Orthography: ro uses the comma-below ș ț Ș Ț (never the cedilla ş ţ forms) and â/î per
  the 1993 norm; hu uses the double-acute ő ű Ő Ű (never õ û ô); lv uses modern Latvian
  letters ā ē ī ū č ģ ķ ļ ņ š ž (never the pre-1946 ŗ or ō); hu ordinals take a trailing
  period (`{index}. lépés`), as do lv ordinals (`{index}. solis`).
  Plural dictionary values: ro carries CLDR `{one, few, other}` — `one` exactly 1, `few`
  0, 2–19, 101–119, 201–219 … and every fractional count, `other` 20–100, 120–200 … and
  exact millions (noun form: singular after `one`, bare plural after `few`, `de` + plural
  after `other` — `1 pas`, `2 pași`, `20 de pași`). lv carries CLDR `{zero, one, other}`
  — `zero` 0, 10–20, every count ending in 0 or in 11–19 (including exact millions), `one`
  1, 21, 31 … 101 (ending in 1 but not 11), `other` 2–9, 22–29 … and fractional counts
  (noun form: genitive plural after `zero`, nominative singular after `one`, nominative
  plural after `other` — `10 soļu`, `21 solis`, `2 soļi`). hu carries CLDR `{one, other}`
  — `one` exactly 1; Hungarian nouns stay singular after any numeral, so `one` and
  `other` are usually identical and differ only where another word refers back to a
  plural. A number that is not the entry's own `count`, and any number inside a
  plain-string value, is phrased in ro and lv so no surrounding word depends on its value
  (a label/colon form or a symbol, never an inflected noun for one fixed number); hu
  needs no such rephrasing since its nouns do not inflect for number after a numeral. hu
  never attaches to a placeholder a suffix whose form depends on how the substituted
  value is pronounced (-nak/-nek, -val/-vel, -ban/-ben, -ra/-re, -t, -szor/-szer/-ször,
  -adik/-edik) — an invariant suffix after a hyphen, the ordinal period, or a postposition
  is used instead. Eponyms: ro forms the genitive/dative with `lui` + the invariant name
  (`lui Euclid`, `lui Fermat`, `lui {0}`); hu hyphenates eponymous compounds (Fermat-
  módszer, Cayley-táblázat, Shor-algoritmus) and never attaches a suffix to Alice, Bob or
  Eve (the possessed noun or a postposition carries it instead — `Alice kulcspárja`, `Bob
  számára`); lv uses established Latvian transcriptions with case endings for most
  eponyms (Eiklīds, Eilers, Keilijs, Šors) but keeps Ferma and Bezū indeclinable, and
  introduces an oblique Alice/Bob/Eve with an apposition noun that carries the case
  (`puse` for Alice/Bob, `uzbrucēja` for Eve) rather than inflecting the name itself.
  Where a file localizes gcd/lcm notation or the prose noun "the GCD", ro uses
  `cmmdc(`/`cmmmc(` and the noun "cmmdc", hu uses `lnko(`/`lkkt(` and the noun "lnko", lv
  uses `LKD(`/`MKD(` and the noun "LKD". Added 2026-10-03 by quick task 261003-0dr.
- **Russian (ru) and Greek (el) `[ASSUMED]`:** the first two non-Latin-script languages
  in this project. ru quotes use «…»; dash ` — ` with spaces; modern orthography,
  writing ё wherever standard spelling has it, never the Ukrainian/Belarusian or
  pre-reform letters і ї є ґ ў ѣ ѳ ѵ. el uses monotonic orthography — every polysyllabic
  word carries its tonos, never the polytonic range U+1F00–U+1FFF; final sigma ς at the
  end of a word and σ elsewhere; the Greek question mark is written as the ASCII
  semicolon `;`, never `?`; quotes «…»; elisions are written in full (σε αυτό, not
  σ’ αυτό). Both: no space before `:` `;` `?` `!`; headings/tool names capitalize only
  the first word and proper nouns (sentence case), matching fr/es/it/pl/pt/sv/nb/ro/hu/lv;
  no ASCII apostrophe or straight double quote in a ru or el value; no Latin letter
  inside a Cyrillic or Greek word (homoglyphs). Russian plural values carry CLDR
  `{one, few, many, other}` — `one` 1, 21, 31 … 101 (ending in 1, not 11), `few` 2–4,
  22–24 … (ending in 2–4, not 12–14), `many` 0, 5–20, 25–30 … 111 and exact millions
  (ending in 0, 5–9 or 11–14), `other` every fractional count (noun form: nominative
  singular after `one`, genitive singular with a genitive-plural adjective after `few`,
  genitive plural after `many`, genitive singular after `other`). Greek plural values
  carry CLDR `{one, other}` — `one` exactly 1, noun/article/adjective agreeing in number.
  A number that is not the entry's own `count`, and any number inside a plain-string
  value, is phrased in both languages so no surrounding word depends on its value (a
  label/colon form or a symbol, never an inflected noun for one fixed number). Alice, Bob
  and Eve stay invariant Latin-script names in both: ru treats them as indeclinable,
  using position or a preposition for possession, with gender-neutral verb/adjective
  agreement on a `{0}` slot that may be Alice or Bob (a literal name agrees with its own
  natural gender); el gives a literal name its article (η Alice, ο Bob, η Eve) but uses a
  label/colon or dash form for a `{0}` placeholder, never a gendered article on it.
  Eponyms: ru uses established Cyrillic forms, declined where Russian declines them
  (Евклид, Эратосфен, Эйлер, Ферма [indeclinable], Кэли [indeclinable], Венн, Шор, Безу
  [indeclinable], Сунь-цзы); el uses the native Greek names for the ancient Greeks
  (Ευκλείδης, Ερατοσθένης) and keeps modern eponyms in Latin script with the Greek
  article, as Greek mathematical writing does (Euler, Fermat, Cayley, Venn, Shor,
  Bézout), with Sun Tzu as Σουν Τζου. Where a file localizes gcd/lcm notation or the
  prose noun "the GCD", ru uses `НОД(`/`НОК(` and the noun "НОД", el uses `ΜΚΔ(`/`ΕΚΠ(`
  and the noun "ΜΚΔ"; `mod` stays literal in both, as in every other language. Every
  word outside the project's notation allow-list (mod, gcd/lcm where a key keeps them
  literal, single-letter variables, acronyms, code identifiers, Alice/Bob/Eve, and for el
  the modern eponyms, bit and ms) is written in the language's own script — enforced by
  `i18n-check.js`'s `SCRIPT_RULES` (SCRIPT-LATIN/SCRIPT-MIXED/SCRIPT-FOREIGN/
  SCRIPT-MISSING findings). Per the user's locked decision L-01, Cyrillic and Greek text
  renders in the browser's system fallback font — the Fraunces heading font has no
  Cyrillic or Greek glyphs; no font, Google Fonts `<link>` or CSS change is made for
  this. Added 2026-10-03 by quick task 261003-57k.

- **Hebrew (he) `[ASSUMED]`:** the first right-to-left language on this site.
  Orthography: modern full spelling without niqqud; the geresh ׳ (U+05F3) and gershayim ״
  (U+05F4) mark abbreviations and transliterated sounds instead of the ASCII `'` and `"`
  (ממ״מ, כמ״מ, and a geresh wherever a transliteration needs one); a hyphen joins a
  one-letter Hebrew prefix to a following number, placeholder or Latin token (ב-{n},
  ה-RSA, ל-{count}); a quoted UI label sits between ASCII double quotes ("הפעלה");
  dash ` — ` with spaces; no space before `:` `;` `?` `!`; headings and tool names carry
  no capitalization (the script has none). Register: gender-neutral second-person plural
  (D-REGISTER) — plural imperatives for instructions, action nouns for buttons.
  Plural values carry CLDR `{one, two, other}`, exactly `Intl.PluralRules('he')`'s own
  category set (verified in this repo's Node 22, ICU 78 / CLDR 48): `one` exactly 1, `two`
  exactly 2, `other` 0, 3, 10, 20, 1000000 and every other count; every category keeps
  every placeholder, so a noun form that would drop the number for 1 or 2 ("תיבה אחת",
  "שתי תיבות") is not used — the count is written as a numeral. Alice, Bob and Eve and
  acronyms (RSA, AES, DH, CRT, QFT, ECDH) stay Latin exactly like ru and el; eponyms are
  transliterated into Hebrew script (אוילר, פרמה, קיילי, ון, שור, אוקלידס, ארטוסתנס, בזו,
  דיפי-הלמן, סון דזה), the same policy Russian follows, so `SCRIPT_RULES.he` reuses the
  base notation list without el's eponym extension. Script rule: apart from that
  notation allow-list (mod, gcd/lcm where a key keeps them literal, single-letter
  variables, acronyms, code identifiers, Alice/Bob/Eve) every word is Hebrew — no
  Cyrillic, no multi-letter Greek word, no mixed-script word; `gcd(`/`lcm(` stay literal
  inside formulas while the prose noun "the GCD" becomes המחלק המשותף המקסימלי (ממ״מ after
  first use), `mod` stays literal. Bidirectional text: every numeric formula,
  comparison, coordinate pair, fraction or other digit-and-operator run inside a Hebrew
  value is wrapped in U+2066 LEFT-TO-RIGHT ISOLATE … U+2069 POP DIRECTIONAL ISOLATE,
  written in the source as the escapes `\u2066` and `\u2069` (never as raw invisible
  characters), because the Unicode bidi algorithm would otherwise reorder it inside a
  right-to-left paragraph; embedding and override controls (U+202A–U+202E) are never
  used; enforced by `i18n-check.js`'s BIDI-CONTROL, BIDI-UNBALANCED, BIDI-FORMULA and
  BIDI-RAW findings. Glyphs: the playback glyphs ▶ ⏸ ⏭ ⏩ ↺ are not mirrored (the RTL
  convention for media controls); a prose arrow meaning "go / open / next" (→ in
  "Open tool →") becomes ←, while an arrow inside a formula stays and sits inside its
  isolate. Layout: while Hebrew is active `<html>` carries `dir="rtl"` next to `lang="he"`
  and every diagram, number grid or table, numeric input, range slider and formula stays
  left-to-right through `assets/site.css`'s `:root[dir="rtl"]` rules and each page's own
  `:root[dir="rtl"]` rule. Hebrew text renders in the browser's system fallback font
  (L-FONT): no Google Fonts `<link>`, `@font-face` or `font-family` change is made for
  it. Added 2026-10-06 by quick task 261006-pks.

  Hebrew conventions consolidated 2026-10-06 from the parallel Tasks 2-4 of quick task
  261006-pks (all `[ASSUMED]`):
  - Hebrew phrases inside a box that is forced left-to-right (a formula box, a
    `direction: ltr` island) are wrapped in U+2067 RIGHT-TO-LEFT ISOLATE … U+2069 (RLI…PDI,
    written as `\u2067` and `\u2069`) so the Hebrew words keep their own order inside the
    LTR box.
  - When a numeric formula ends a sentence, the final period sits inside the formula's
    `\u2066…\u2069` isolate (the period would otherwise jump to the wrong edge of the
    sentence in a right-to-left paragraph).
  - A `{word}` slot (a placeholder that receives a noun from a dictionary or from the
    page) takes the indefinite noun form, because the template cannot agree gender or
    definiteness with a value it does not know.
  - Units after a numeral: bit is ביט (plural ביטים after a placeholder or in a plural
    sentence, singular ביט right after a written number: "2048 ביט"; never סיבית/סיביות);
    millisecond is אלפיות שנייה (never מילישניות). Miller–Rabin is מילר-רבין written with the
    same dash the English value uses in that file (the Diffie-Hellman file's ASCII hyphen,
    the RSA file's en dash). "Diagram" is דיאגרמה everywhere; תרשים is kept only inside תרשים
    פיזור (scatter plot). Extended Euclid is האלגוריתם האוקלידי המורחב.
  - gcd/lcm abbreviation rule: the prose noun is always the full phrase המחלק המשותף
    המקסימלי / הכפולה המשותפת המינימלית. The recognised Israeli school abbreviation ממ״מ
    (gcd; lcm is כמ״מ) is kept only where the label is space-constrained — a pill, a step
    label or a table heading — which is exactly Shor's `pillGcdPostProcessing`,
    `stepGcdCheckLabel` and `stepFactorViaGcdLabel`. Running prose (including the Shor
    detail and ring captions and the intro's `strongGcdPostProcessing`) spells the phrase out.
  - Venn link labels are written as infinitives so they can sit inside the shared frame
    "לחצו פעמיים כדי {a}" (double-click to {a}).

- **Hindi (hi) `[ASSUMED]`:** the first Devanagari-script language, left to right.
  Register: formal-polite आप — polite `-एँ` imperatives for instructions and buttons
  (चुनें, दबाएँ, क्लिक करें, दर्ज करें, देखें, आज़माएँ, खींचें, चलाएँ, रोकें, रीसेट करें,
  बनाएँ); verb agreement with आप uses the standard masculine-plural honorific default.
  Orthography (Central Hindi Directorate standard): anusvara for a nasal before a
  consonant of its own class (संख्या, खंड, संबंध, अंक); chandrabindu where no vowel sign
  rises above the headline (एँ, हाँ) and anusvara where one does (करें, में); nukta for
  borrowed sounds (फ़, ज़) in loanwords and eponyms; ऑ for the borrowed open o (ऑयलर).
  Every value is NFC (the precomposed nukta letters U+0958–U+095F decompose under NFC,
  so write letter + nukta U+093C) and contains no zero-width joiner, non-joiner or other
  zero-width character — enforced by `i18n-check.js`'s NOT-NFC and ZERO-WIDTH findings.
  Punctuation: a Hindi prose sentence ends with the purna viram । (U+0964, written as
  the literal character); the double danda ॥ is never used; "." stays inside numerals,
  abbreviations (म.स.), formulas and the ellipsis "…"; `? ! : ; ,` as in English with no
  space before them; a quoted UI label sits between ASCII double quotes ("चलाएँ"); dash
  ` — ` with spaces; a value whose English has no closing punctuation gets none. Math
  notation, arrows (→ in "Open tool →" stays →) and the playback glyphs ▶ ⏸ ⏭ ⏩ ↺ are
  unchanged. Numerals: ASCII digits 0-9 only, never Devanagari digits (U+0966–U+096F),
  never locale-formatted — no Indian lakh/crore grouping (12,34,567), no comma decimal;
  each Hindi value carries exactly the numerals of its English value (same digits, same
  grouping commas, same decimal point, any order), enforced by NATIVE-DIGIT and
  DIGIT-PARITY. English scale words become मिलियन / बिलियन / ट्रिलियन so the numeral
  stays as in English (16.8 मिलियन, 1 ट्रिलियन); never लाख / करोड़ / अरब. Plurals: CLDR
  `{one, other}`, exactly `Intl.PluralRules('hi')`'s own category set (verified in this
  repo's Node 22, ICU 78 / CLDR 48); Hindi's `one` is "i = 0 or n = 1", so `one` selects
  0, 0.5 and 1 and `other` selects 1.5, 2, 3, 10, 1000000 — the `one` form must read
  correctly for 0 as well as 1 and keeps every placeholder (the count is written as a
  numeral, never as the word for one); no `PLURAL_EXTRA_CATEGORIES` entry is needed.
  Grammar: Hindi is SOV, so placeholders and rich-template slots move freely;
  postpositions follow a placeholder or Latin token as separate words (RSA की कुंजी,
  {n} का), no hyphen; a frame and the words fed into its slot ({word}, {roles},
  {verbing}, {ordWord}) are translated together so case and gender agree (oblique
  infinitive before के लिए), and a slot that receives a value of unknown gender uses a
  construction that needs no agreement. Names: Alice, Bob, Eve, acronyms (RSA, AES, DH,
  CRT, QFT, ECDH, OAEP, DSA), code identifiers (BigInt, pointAdd, scalarMul, qInv, dP,
  dQ, kG, aG, bG, aB, bA), file formats (PNG, SVG, PDF) and the cipher name Blowfish stay
  Latin exactly like ru, el and he, with natural grammatical gender (Alice and Eve
  feminine, Bob masculine); eponyms are transliterated into Devanagari (यूक्लिड,
  एराटोस्थनीज़, ऑयलर, फ़र्मा, केली, वेन, शोर, बेज़ू, डिफ़ी-हेलमैन, सुन त्ज़ु, फ़ूरिये,
  फ़िबोनाची, गार्नर, हासे, मिलर-राबिन, एलगमाल), so `SCRIPT_RULES.hi` reuses the base
  notation list without el's eponym extension; bit is बिट and millisecond / ms is
  मिलीसेकंड. gcd / lcm: `gcd(` / `lcm(` stay literal inside formulas; the prose noun is
  महत्तम समापवर्तक / लघुत्तम समापवर्त्य, abbreviated म.स. / ल.स. only in space-constrained
  labels (pills, step labels, table headings); `mod` stays literal; modulus is मापांक
  ("modulo n" in prose: मापांक n के सापेक्ष). Spellings never used (left) and the chosen
  form (right): खण्ड → खंड, सम्बन्ध → संबंध, एल्गोरिदम / एल्गोरिद्म → एल्गोरिथ्म,
  डायग्राम → आरेख, तालिका → सारणी, मॉड्यूलस → मापांक, रूढ़ → अभाज्य, युक्लिड → यूक्लिड,
  यूलर / ऑइलर → ऑयलर, डिफी → डिफ़ी, फर्मा → फ़र्मा, बिट्स → बिट, मिलीसेकण्ड → मिलीसेकंड,
  एन्क्रिप्ट → कूटलेखन, डिक्रिप्ट → विकूटन, ॥ → ।. Script rule: apart from the notation
  allow-list in `i18n-check.js`'s `SCRIPT_RULES` (mod, gcd/lcm where a key keeps them
  literal, single-letter variables, acronyms, code identifiers, Alice/Bob/Eve) every word
  is Devanagari — no Cyrillic, Hebrew or multi-letter Greek word, no word mixing scripts
  (a Devanagari vowel sign counts as part of its word) — enforced by SCRIPT-LATIN /
  SCRIPT-MIXED / SCRIPT-FOREIGN / SCRIPT-MISSING. No `dir` attribute, no
  `:root[dir="rtl"]` rule and no bidi isolate or mark appears anywhere for Hindi. Hindi text
  renders in the browser's system fallback font (L-FONT): no Google Fonts `<link>`,
  `@font-face` or `font-family` change is made for it. Added 2026-10-06 by quick task
  261006-vpp.

---

## (b) Tool names

16 rows: the `site.nav.*` values (from `assets/i18n/site.js`, seeded in 06-01-PLAN.md)
plus each tool's page `<title>`/`<h1>` form. The hub card title form (index.html, 06-03)
reuses the `nav.*` value verbatim — index.html has no separate "hub card" wording
distinct from the nav label. The `it` column (`[ASSUMED]`) was added 2026-10-02 by quick
task 261002-c77. The `pl` column (`[ASSUMED]`) was added 2026-10-02 by quick task
261002-fmi. The `pt-BR`/`pt-PT` columns (`[ASSUMED]`) were added 2026-10-02 by quick task
261002-jh4. A single value in those two columns means pt-BR and pt-PT are identical; where
they differ, the pt-BR value is listed first, the pt-PT value second, separated by " / ".
The `sv`/`nb` columns (`[ASSUMED]`) were added 2026-10-02 by quick task 261002-s7l. The
`ro`/`hu`/`lv` columns (`[ASSUMED]`) were added 2026-10-03 by quick task 261003-0dr. The
`ru`/`el` columns (`[ASSUMED]`) were added 2026-10-03 by quick task 261003-57k. The
`he` column (`[ASSUMED]`) was added 2026-10-06 by quick task 261006-pks. The `hi` column
(`[ASSUMED]`) was added 2026-10-06 by quick task 261006-vpp; it equals the `site.nav.*` values
in `assets/i18n/site.js` exactly.

| id | File | en (site.nav / page h1) | nl | de | fr | es | it | pl | pt-BR | pt-PT | sv | nb | ro | hu | lv | ru | el | he | hi |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| home | index.html | Home | Start | Startseite | Accueil | Inicio | Inizio | Strona główna | Início | Início | Hem | Hjem | Acasă | Kezdőlap | Главная | Αρχική | Sākums | דף הבית | मुखपृष्ठ |
| sieve | Sieve Of Eratosthenes/sieve-of-eratosthenes.html | Sieve of Eratosthenes | Zeef van Eratosthenes | Sieb des Eratosthenes | Crible d'Ératosthène | Criba de Eratóstenes | Crivello di Eratostene | Sito Eratostenesa | Crivo de Eratóstenes | Crivo de Eratóstenes | Eratosthenes såll | Eratosthenes' sil | Ciurul lui Eratostene | Eratoszthenész szitája | Решето Эратосфена | Κόσκινο του Ερατοσθένη | Eratostena siets | הנפה של ארטוסתנס | एराटोस्थनीज़ की छलनी |
| factorTree | Factor Tree/factor-tree.html | Factor Tree | Factorboom | Faktorbaum | Arbre de facteurs | Árbol de factores | Albero dei fattori | Drzewo czynników | Árvore de fatores | Árvore de fatores | Faktorträd | Faktortre | Arbore de factori | Tényezőfa | Дерево множителей | Δέντρο παραγόντων | Reizinātāju koks | עץ גורמים | गुणनखंड वृक्ष |
| venn | Venn Diagram/venn-diagram.html | Venn Diagram | Venndiagram | Venn-Diagramm | Diagramme de Venn | Diagrama de Venn | Diagramma di Venn | Diagram Venna | Diagrama de Venn | Diagrama de Venn | Venndiagram | Venndiagram | Diagrama Venn | Venn-diagram | Диаграмма Венна | Διάγραμμα Venn | Venna diagramma | דיאגרמת ון | वेन आरेख |
| euclid | Euclidean Algorithm/euclidean-algorithm.html | Euclidean Algorithm | Algoritme van Euclides | Euklidischer Algorithmus | Algorithme d'Euclide | Algoritmo de Euclides | Algoritmo di Euclide | Algorytm Euklidesa | Algoritmo de Euclides | Algoritmo de Euclides | Euklides algoritm | Euklids algoritme | Algoritmul lui Euclid | Euklideszi algoritmus | Алгоритм Евклида | Αλγόριθμος του Ευκλείδη | Eiklīda algoritms | האלגוריתם של אוקלידס | यूक्लिड का एल्गोरिथ्म |
| crt | Chinese Remainder Theorem/chinese-remainder-theorem.html | Chinese Remainder Theorem | Chinese reststelling | Chinesischer Restsatz | Théorème des restes chinois | Teorema chino del resto | Teorema cinese del resto | Chińskie twierdzenie o resztach | Teorema chinês do resto / Teorema chinês dos restos | Teorema chinês do resto / Teorema chinês dos restos | Kinesiska restsatsen | Den kinesiske restsetningen | Teorema chineză a resturilor | Kínai maradéktétel | Китайская теорема об остатках | Κινεζικό θεώρημα υπολοίπων | Ķīniešu atlikumu teorēma | משפט השאריות הסיני | चीनी शेषफल प्रमेय |
| wheel | Equivalence Wheel/equivalence-wheel.html | Equivalence Wheel | Equivalentiewiel | Äquivalenzrad | Roue d'équivalence | Rueda de equivalencia | Ruota di equivalenza | Koło równoważności | Roda de equivalência | Roda de equivalência | Ekvivalenshjul | Ekvivalenshjul | Roata echivalenței | Ekvivalenciakerék | Колесо эквивалентности | Τροχός ισοδυναμίας | Ekvivalences rats | גלגל השקילות | तुल्यता चक्र |
| totient | Eulers Totient/eulers-totient.html | Euler's Totient | Eulers phi-functie | Eulersche Phi-Funktion | Indicatrice d'Euler | Función φ de Euler | Funzione φ di Eulero | Funkcja φ Eulera | Função φ de Euler | Função φ de Euler | Eulers φ-funktion | Eulers φ-funksjon | Funcția φ a lui Euler | Euler-féle φ-függvény | Функция Эйлера | Συνάρτηση φ του Euler | Eilera φ funkcija | פונקציית φ של אוילר | ऑयलर का φ फलन |
| cayley | Cayley Table/cayley-table.html | Cayley Table | Cayleytabel | Cayley-Tafel | Table de Cayley | Tabla de Cayley | Tavola di Cayley | Tabela Cayleya | Tabela de Cayley | Tabela de Cayley | Cayleytabell | Cayleytabell | Tabla lui Cayley | Cayley-táblázat | Таблица Кэли | Πίνακας Cayley | Keilija tabula | טבלת קיילי | केली सारणी |
| iso | Group Isomorphism/group-isomorphism.html | Group Isomorphism | Groepsisomorfisme | Gruppenisomorphismus | Isomorphisme de groupes | Isomorfismo de grupos | Isomorfismo di gruppi | Izomorfizm grup | Isomorfismo de grupos | Isomorfismo de grupos | Gruppisomorfism | Gruppeisomorfi | Izomorfism de grupuri | Csoportizomorfizmus | Изоморфизм групп | Ισομορφισμός ομάδων | Grupu izomorfisms | איזומורפיזם של חבורות | समूह तुल्याकारिता |
| sqm | Square And Multiply/square-and-multiply.html | Square and Multiply | Kwadrateren en vermenigvuldigen | Quadrieren und Multiplizieren | Exponentiation rapide | Exponenciación rápida | Esponenziazione rapida | Szybkie potęgowanie | Exponenciação rápida | Exponenciação rápida | Kvadrering och multiplikation | Kvadrering og multiplikasjon | Exponențiere rapidă | Gyors hatványozás | Быстрое возведение в степень | Γρήγορη ύψωση σε δύναμη | Ātrā kāpināšana | העלאה בריבוע וכפל | वर्ग और गुणा |
| dh | Diffie-Hellman Key Exchange/diffie-hellman-key-exchange.html | Diffie-Hellman | Diffie-Hellman | Diffie-Hellman | Diffie-Hellman | Diffie-Hellman | Diffie-Hellman | Diffie-Hellman | Diffie-Hellman | Diffie-Hellman | Diffie-Hellman | Diffie-Hellman | Diffie-Hellman | Diffie-Hellman | Диффи-Хеллман | Diffie-Hellman | Diffie-Hellman | דיפי-הלמן | डिफ़ी-हेलमैन |
| ecdh | Elliptic Curve Diffie-Hellman/elliptic-curve-diffie-hellman.html | Elliptic Curve DH | Elliptische-krommen-DH | Elliptische-Kurven-DH | DH sur courbes elliptiques | DH de curva elíptica | DH su curve ellittiche | DH na krzywych eliptycznych | DH em curvas elípticas | DH em curvas elípticas | DH med elliptiska kurvor | DH med elliptiske kurver | DH pe curbe eliptice | Elliptikus görbés DH | DH на эллиптических кривых | DH ελλειπτικών καμπυλών | Eliptisko līkņu DH | דיפי-הלמן בעקומים אליפטיים | दीर्घवृत्तीय वक्र DH |
| rsa | RSA/rsa.html | RSA | RSA | RSA | RSA | RSA | RSA | RSA | RSA | RSA | RSA | RSA | RSA | RSA | RSA | RSA | RSA | RSA | RSA |
| fermat | Fermats Method/fermats-method.html | Fermat's Method | Methode van Fermat | Fermat-Methode | Méthode de Fermat | Método de Fermat | Metodo di Fermat | Metoda Fermata | Método de Fermat | Método de Fermat | Fermats metod | Fermats metode | Metoda lui Fermat | Fermat-módszer | Метод Ферма | Μέθοδος του Fermat | Ferma metode | שיטת פרמה | फ़र्मा की विधि |
| shor | Shors Algorithm/shors-algorithm.html | Shor's Algorithm | Algoritme van Shor | Shor-Algorithmus | Algorithme de Shor | Algoritmo de Shor | Algoritmo di Shor | Algorytm Shora | Algoritmo de Shor | Algoritmo de Shor | Shors algoritm | Shors algoritme | Algoritmul lui Shor | Shor-algoritmus | Алгоритм Шора | Αλγόριθμος του Shor | Šora algoritms | האלגוריתם של שור | शोर का एल्गोरिथ्म |

(`nav.dh` and `nav.rsa` are identical in every language by design — proper nouns/acronyms
only, which the project's prose rule treats as neutral; `--coverage`'s IDENTICAL-TO-EN
check never flags them.)

---

## (c) Core terms (45+)

Confidence tags: `[CITED: source]` traces to 06-RESEARCH.md's Sources section;
`[ASSUMED]` is training-knowledge, not independently re-verified this session. The
pt-BR/pt-PT columns (`[ASSUMED]`) were added 2026-10-02 by quick task 261002-jh4; where a
term's pt-BR and pt-PT forms differ, each cell holds that variant's own value (a literal
" / " inside a cell is the term's own dual-naming, identical in both variants, matching
how it/pl already render rows like "generator / primitive root"). The sv/nb columns
(`[ASSUMED]`) were added 2026-10-02 by quick task 261002-s7l. The ro/hu/lv columns
(`[ASSUMED]`) were added 2026-10-03 by quick task 261003-0dr. The ru/el columns
(`[ASSUMED]`) were added 2026-10-03 by quick task 261003-57k. The he column
(`[ASSUMED]`) was added 2026-10-06 by quick task 261006-pks. The hi column (`[ASSUMED]`)
was added 2026-10-06 by quick task 261006-vpp; all 53 rows are filled.

| # | Term (en) | nl | de | fr | es | it | pl | pt-BR | pt-PT | sv | nb | ro | hu | lv | ru | el | he | hi | Confidence |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | prime (number) | priemgetal | Primzahl | nombre premier | número primo | numero primo | liczba pierwsza | número primo | número primo | primtal | primtall | număr prim | prímszám | pirmskaitlis | простое число | πρώτος αριθμός | מספר ראשוני | अभाज्य संख्या | `[ASSUMED]` |
| 2 | composite (number) | samengesteld getal | zusammengesetzte Zahl | nombre composé | número compuesto | numero composto | liczba złożona | número composto | número composto | sammansatt tal | sammensatt tall | număr compus | összetett szám | salikts skaitlis | составное число | σύνθετος αριθμός | מספר פריק | भाज्य संख्या | `[ASSUMED]` |
| 3 | factor | factor | Faktor | facteur | factor | fattore | czynnik | fator | fator | faktor | faktor | factor | tényező | reizinātājs | множитель | παράγοντας | גורם | गुणनखंड | `[ASSUMED]` |
| 4 | prime factorization | priemfactorisatie | Primfaktorzerlegung | décomposition en facteurs premiers | factorización en primos | fattorizzazione in numeri primi | rozkład na czynniki pierwsze | fatoração em primos (decomposição em fatores primos) | decomposição em fatores primos (fatorização) | primtalsfaktorisering | primtallsfaktorisering | descompunere în factori primi | prímtényezős felbontás | sadalīšana pirmreizinātājos | разложение на простые множители | ανάλυση σε πρώτους παράγοντες | פירוק לגורמים ראשוניים | अभाज्य गुणनखंडन | `[ASSUMED]` |
| 5 | divisor | deler | Teiler | diviseur | divisor | divisore | dzielnik | divisor | divisor | delare | divisor | divizor | osztó | dalītājs | делитель | διαιρέτης | מחלק | भाजक | `[ASSUMED]` |
| 6 | greatest common divisor | grootste gemene deler (ggd) | größter gemeinsamer Teiler (ggT) | plus grand commun diviseur (PGCD) | máximo común divisor (mcd) | massimo comun divisore (MCD) | największy wspólny dzielnik (NWD) | máximo divisor comum (MDC) | máximo divisor comum (m.d.c.) | största gemensamma delare (SGD) | største felles divisor (SFD) | cel mai mare divizor comun (cmmdc) | legnagyobb közös osztó (lnko) | lielākais kopīgais dalītājs (LKD) | наибольший общий делитель (НОД) | μέγιστος κοινός διαιρέτης (ΜΚΔ) | המחלק המשותף המקסימלי (ממ״מ) | महत्तम समापवर्तक (म.स.) | `[CITED: en.wiktionary.org, bab.la]` (it `[ASSUMED]`) |
| 7 | least common multiple | kleinste gemene veelvoud (kgv) | kleinstes gemeinsames Vielfaches (kgV) | plus petit commun multiple (PPCM) | mínimo común múltiplo (mcm) | minimo comune multiplo (mcm) | najmniejsza wspólna wielokrotność (NWW) | mínimo múltiplo comum (MMC) | mínimo múltiplo comum (m.m.c.) | minsta gemensamma multipel (MGM) | minste felles multiplum (MFM) | cel mai mic multiplu comun (cmmmc) | legkisebb közös többszörös (lkkt) | mazākais kopīgais dalāmais (MKD) | наименьшее общее кратное (НОК) | ελάχιστο κοινό πολλαπλάσιο (ΕΚΠ) | הכפולה המשותפת המינימלית (כמ״מ) | लघुत्तम समापवर्त्य (ल.स.) | `[ASSUMED]` |
| 8 | quotient | quotiënt | Quotient | quotient | cociente | quoziente | iloraz | quociente | quociente | kvot | kvotient | cât | hányados | dalījums | частное | πηλίκο | מנה | भागफल | `[ASSUMED]` |
| 9 | remainder | rest | Rest | reste | resto | resto | reszta | resto | resto | rest | rest | rest | maradék | atlikums | остаток | υπόλοιπο | שארית | शेषफल | `[ASSUMED]` |
| 10 | modulus | modulus | Modul | module | módulo | modulo | moduł | módulo | módulo | modul | modul | modul | modulus | modulis | модуль | μέτρο | מודולוס | मापांक | `[CITED: dictionary.reverso.net for ES]` / `[ASSUMED: nl, de, fr, it]` |
| 11 | residue | rest(klasse)vertegenwoordiger | Rest | reste | resto | residuo / classe di resto | reszta / klasa reszt | resíduo | classe de resíduos | rest / restklass | rest / restklasse | rest / clasă de resturi | maradék / maradékosztály | atlikums / atlikumu klase | вычет / класс вычетов | υπόλοιπο / κλάση υπολοίπων | שארית (נציג של מחלקת שארית) | अवशेष | `[ASSUMED]` |
| 12 | congruence / congruent | congruentie / congruent | Kongruenz / kongruent | congruence / congru | congruencia / congruente | congruenza / congruente | kongruencja / przystający | congruência / congruente | congruência / congruente | kongruens / kongruent | kongruens / kongruent | congruență / congruent | kongruencia / kongruens | kongruence / kongruents | сравнение / сравнимый по модулю | ισοτιμία / ισότιμος | שקילות / שקול | सर्वांगसमता / सर्वांगसम | `[ASSUMED]` |
| 13 | equivalence class | equivalentieklasse | Äquivalenzklasse | classe d'équivalence | clase de equivalencia | classe di equivalenza | klasa równoważności (klasa abstrakcji) | classe de equivalência | classe de equivalência | ekvivalensklass | ekvivalensklasse | clasă de echivalență | ekvivalenciaosztály | ekvivalences klase | класс эквивалентности | κλάση ισοδυναμίας | מחלקת שקילות | तुल्यता वर्ग | `[ASSUMED]` |
| 14 | modular inverse | modulaire inverse | modulares Inverses | inverse modulaire | inverso modular | inverso modulare | odwrotność modulo n (element odwrotny) | inverso modular | inverso modular | modulär invers (invers modulo n) | modulær invers (invers modulo n) | invers modular (invers modulo n) | moduláris inverz (inverz modulo n) | modulārais inverss (inverss pēc moduļa n) | обратный элемент по модулю n | αντίστροφος mod n | הופכי מודולרי | मापांकीय प्रतिलोम | `[ASSUMED]` |
| 15 | coprime | onderling ondeelbaar (coprime) | teilerfremd | premiers entre eux | coprimo | coprimi (primi tra loro) | względnie pierwsze | coprimos (primos entre si) | primos entre si (coprimos) | relativt prima (inbördes prima) | innbyrdes primiske (relativt primiske) | prime între ele (relativ prime) | relatív prímek | savstarpēji pirmskaitļi | взаимно простые | πρώτοι μεταξύ τους (σχετικά πρώτοι) | זרים (זרים זה לזה) | सह-अभाज्य | `[ASSUMED]` |
| 16 | totient (Euler's totient function) | Eulers phi-functie | Eulersche Phi-Funktion | indicatrice d'Euler | función φ de Euler | funzione φ di Eulero | funkcja φ Eulera | função φ de Euler | função φ de Euler | Eulers φ-funktion | Eulers φ-funksjon | funcția φ a lui Euler (indicatorul lui Euler) | Euler-féle φ-függvény | Eilera funkcija φ | функция Эйлера φ | συνάρτηση φ του Euler | פונקציית φ של אוילר | ऑयलर का φ फलन | `[CITED: Wikidata/Wikipedia for de/fr/es]` / `[ASSUMED: nl, it]` |
| 17 | group (algebraic) | groep | Gruppe | groupe | grupo | gruppo | grupa | grupo | grupo | grupp | gruppe | grup | csoport | grupa | группа | ομάδα | חבורה | समूह | `[ASSUMED]` |
| 18 | additive group | additieve groep | additive Gruppe | groupe additif | grupo aditivo | gruppo additivo | grupa addytywna | grupo aditivo | grupo aditivo | additiv grupp | additiv gruppe | grup aditiv | additív csoport | aditīvā grupa | аддитивная группа | προσθετική ομάδα | חבורה חיבורית | योगात्मक समूह | `[ASSUMED]` |
| 19 | multiplicative group | multiplicatieve groep | multiplikative Gruppe | groupe multiplicatif | grupo multiplicativo | gruppo moltiplicativo | grupa multiplikatywna | grupo multiplicativo | grupo multiplicativo | multiplikativ grupp | multiplikativ gruppe | grup multiplicativ | multiplikatív csoport | multiplikatīvā grupa | мультипликативная группа | πολλαπλασιαστική ομάδα | חבורה כפלית | गुणात्मक समूह | `[ASSUMED]` |
| 20 | unit (group element) | eenheid | Einheit | unité | unidad | unità | element odwracalny | unidade (elemento invertível) | unidade (elemento invertível) | enhet (inverterbart element) | enhet (invertibelt element) | element inversabil (unitate) | invertálható elem (egység) | invertējams elements (vienība) | обратимый элемент | αντιστρέψιμο στοιχείο | איבר הפיך | इकाई (प्रतिलोमीय अवयव) | `[ASSUMED]` |
| 21 | identity element | identiteitselement / neutraal element | neutrales Element | élément neutre | elemento neutro | elemento neutro | element neutralny | elemento neutro (identidade) | elemento neutro (identidade) | neutralt element (identitetselement) | nøytralt element (identitetselement) | element neutru (element identitate) | egységelem (neutrális elem) | neitrālais elements (vienības elements) | нейтральный элемент | ουδέτερο στοιχείο | איבר היחידה (איבר ניטרלי) | तत्समक अवयव | `[ASSUMED]` |
| 22 | inverse (element) | inverse | Inverses | inverse | inverso | inverso | element odwrotny | inverso (elemento inverso) | inverso (elemento inverso) | invers (inverst element) | invers (inverst element) | invers (element invers) | inverz (inverz elem) | inverss (inversais elements) | обратный элемент | αντίστροφο στοιχείο | איבר הופכי | प्रतिलोम | `[ASSUMED]` |
| 23 | order of an element | orde van een element | Ordnung eines Elements | ordre d'un élément | orden de un elemento | ordine di un elemento | rząd elementu | ordem de um elemento | ordem de um elemento | ordning (ett elements ordning) | orden (et elements orden) | ordinul unui element | elem rendje | elementa kārta | порядок элемента | τάξη στοιχείου | סדר של איבר | अवयव की कोटि | `[ASSUMED]` |
| 24 | generator / primitive root | voortbrenger / primitieve wortel | Erzeuger / primitive Wurzel | générateur / racine primitive | generador / raíz primitiva | generatore / radice primitiva | generator / pierwiastek pierwotny | gerador / raiz primitiva | gerador / raiz primitiva | generator / primitiv rot | generator / primitiv rot | generator / rădăcină primitivă | generátor / primitív gyök | ģenerators / primitīvā sakne | образующий элемент / первообразный корень | γεννήτορας / πρωταρχική ρίζα | יוצר / שורש פרימיטיבי | जनक / आदिम मूल | `[ASSUMED]` |
| 25 | cyclic group | cyclische groep | zyklische Gruppe | groupe cyclique | grupo cíclico | gruppo ciclico | grupa cykliczna | grupo cíclico | grupo cíclico | cyklisk grupp | syklisk gruppe | grup ciclic | ciklikus csoport | cikliskā grupa | циклическая группа | κυκλική ομάδα | חבורה ציקלית | चक्रीय समूह | `[ASSUMED]` |
| 26 | isomorphism | isomorfisme | Isomorphismus | isomorphisme | isomorfismo | isomorfismo | izomorfizm | isomorfismo | isomorfismo | isomorfism | isomorfi | izomorfism | izomorfizmus | izomorfisms | изоморфизм | ισομορφισμός | איזומורפיזם | तुल्याकारिता | `[ASSUMED]` |
| 27 | operation table | bewerkingstabel | Verknüpfungstafel | table d'opération | tabla de operación | tavola dell'operazione | tabela działania | tabela da operação | tabela da operação | operationstabell (Cayleytabell) | operasjonstabell (Cayleytabell) | tabla operației (tabla lui Cayley) | műveleti tábla (Cayley-táblázat) | darbību tabula (Keilija tabula) | таблица операции (таблица Кэли) | πίνακας πράξης (πίνακας Cayley) | טבלת פעולה | संक्रिया सारणी | `[CITED: Wikimedia Commons — Cayley table]` (it `[ASSUMED]`) |
| 28 | commutative | commutatief | kommutativ | commutatif | conmutativo | commutativo | przemienny | comutativo | comutativo | kommutativ | kommutativ | comutativ | kommutatív | komutatīvs | коммутативный | αντιμεταθετικός | קומוטטיבי (חילופי) | क्रमविनिमेय | `[ASSUMED]` |
| 29 | perfect square | kwadraatgetal | Quadratzahl | carré parfait | cuadrado perfecto | quadrato perfetto | kwadrat liczby całkowitej (liczba kwadratowa) | quadrado perfeito | quadrado perfeito | kvadrattal | kvadrattall | pătrat perfect | teljes négyzet (négyzetszám) | pilns kvadrāts (kvadrātskaitlis) | полный квадрат | τέλειο τετράγωνο | ריבוע שלם | पूर्ण वर्ग | `[ASSUMED]` |
| 30 | factorization method | factorisatiemethode | Faktorisierungsmethode | méthode de factorisation | método de factorización | metodo di fattorizzazione | metoda faktoryzacji | método de fatoração | método de fatorização | faktoriseringsmetod | faktoriseringsmetode | metodă de factorizare | faktorizációs módszer | faktorizācijas metode | метод факторизации | μέθοδος παραγοντοποίησης | שיטת פירוק לגורמים | गुणनखंडन विधि | `[ASSUMED]` |
| 31 | exponent | exponent | Exponent | exposant | exponente | esponente | wykładnik | expoente | expoente | exponent | eksponent | exponent | kitevő | kāpinātājs | показатель степени | εκθέτης | מעריך | घातांक | `[ASSUMED]` |
| 32 | base (of an exponentiation) | grondtal | Basis | base | base | base | podstawa | base | base | bas | grunntall | bază | alap | bāze | основание степени | βάση | בסיס | आधार | `[ASSUMED]` |
| 33 | modular exponentiation | modulaire machtsverheffing | modulare Exponentiation | exponentiation modulaire | exponenciación modular | esponenziazione modulare | potęgowanie modularne | exponenciação modular | exponenciação modular | modulär exponentiering | modulær eksponentiering | exponențiere modulară | moduláris hatványozás | modulārā kāpināšana | возведение в степень по модулю | ύψωση σε δύναμη mod n | העלאה בחזקה מודולרית | मापांकीय घातांकन | `[ASSUMED]` |
| 34 | binary expansion | binaire expansie | Binärdarstellung | développement binaire | expansión binaria | espansione binaria | rozwinięcie dwójkowe | representação binária (expansão binária) | representação binária (expansão binária) | binär utveckling | binær utvikling | reprezentare binară | kettes számrendszerbeli alak (bináris alak) | binārais pieraksts | двоичная запись | δυαδική αναπαράσταση | ייצוג בינרי | द्विआधारी प्रसार | `[ASSUMED]` |
| 35 | square / multiply step | kwadrateer-/vermenigvuldigstap | Quadrier-/Multiplikationsschritt | étape d'élévation au carré / multiplication | paso de elevar al cuadrado / multiplicar | passo di elevamento al quadrato / di moltiplicazione | krok podnoszenia do kwadratu / mnożenia | passo de elevar ao quadrado / de multiplicar | passo de elevar ao quadrado / de multiplicar | kvadreringssteg / multiplikationssteg | kvadreringssteg / multiplikasjonssteg | pas de ridicare la pătrat / pas de înmulțire | négyzetre emelési lépés / szorzási lépés | kāpināšanas kvadrātā solis / reizināšanas solis | шаг возведения в квадрат / шаг умножения | βήμα τετραγωνισμού / βήμα πολλαπλασιασμού | צעד העלאה בריבוע / כפל | वर्ग / गुणा चरण | `[ASSUMED]` |
| 36 | public key | publieke sleutel | öffentlicher Schlüssel | clé publique | clave pública | chiave pubblica | klucz publiczny | chave pública | chave pública | publik nyckel | offentlig nøkkel | cheie publică | nyilvános kulcs | publiskā atslēga | открытый ключ | δημόσιο κλειδί | מפתח ציבורי | सार्वजनिक कुंजी | `[ASSUMED]` |
| 37 | private key | privésleutel | privater Schlüssel | clé privée | clave privada | chiave privata | klucz prywatny | chave privada | chave privada | privat nyckel | privat nøkkel | cheie privată | titkos kulcs (privát kulcs) | privātā atslēga | закрытый ключ | ιδιωτικό κλειδί | מפתח פרטי | निजी कुंजी | `[ASSUMED]` |
| 38 | key pair | sleutelpaar | Schlüsselpaar | paire de clés | par de claves | coppia di chiavi | para kluczy | par de chaves | par de chaves | nyckelpar | nøkkelpar | pereche de chei | kulcspár | atslēgu pāris | пара ключей | ζεύγος κλειδιών | זוג מפתחות | कुंजी युग्म | `[ASSUMED]` |
| 39 | shared secret | gedeeld geheim | gemeinsames Geheimnis | secret partagé | secreto compartido | segreto condiviso | wspólny sekret | segredo compartilhado | segredo partilhado | delad hemlighet | delt hemmelighet | secret comun | közös titok | kopīgais noslēpums | общий секрет | κοινό μυστικό | סוד משותף | साझा रहस्य | `[ASSUMED]` |
| 40 | encrypt | versleutelen | verschlüsseln | chiffrer | cifrar | cifrare | szyfrować | criptografar (cifrar) | cifrar (encriptar) | kryptera | kryptere | a cripta | titkosít | šifrēt | зашифровать | κρυπτογραφώ | הצפנה (להצפין) | कूटलेखन (करना) | `[ASSUMED]` |
| 41 | decrypt | ontsleutelen | entschlüsseln | déchiffrer | descifrar | decifrare | odszyfrować | descriptografar (decifrar) | decifrar (desencriptar) | dekryptera | dekryptere | a decripta | visszafejt | atšifrēt | расшифровать | αποκρυπτογραφώ | פענוח (לפענח) | विकूटन (करना) | `[ASSUMED]` |
| 42 | plaintext | leesbare tekst (plaintext) | Klartext | texte en clair | texto plano | testo in chiaro | tekst jawny | texto simples | texto em claro | klartext | klartekst | text clar | nyílt szöveg | atklātais teksts | открытый текст | απλό κείμενο | טקסט גלוי | मूल पाठ | `[ASSUMED]` |
| 43 | ciphertext | cijfertekst | Geheimtext | texte chiffré | texto cifrado | testo cifrato | szyfrogram | texto cifrado | texto cifrado | chiffertext | chiffertekst | text cifrat | titkosított szöveg | šifrteksts | шифртекст | κρυπτοκείμενο | טקסט מוצפן | कूटपाठ | `[ASSUMED]` |
| 44 | discrete logarithm | discrete logaritme | diskreter Logarithmus | logarithme discret | logaritmo discreto | logaritmo discreto | logarytm dyskretny | logaritmo discreto | logaritmo discreto | diskret logaritm | diskret logaritme | logaritm discret | diszkrét logaritmus | diskrētais logaritms | дискретный логарифм | διακριτός λογάριθμος | לוגריתם דיסקרטי | असतत लघुगणक | `[ASSUMED]` |
| 45 | brute force | brute kracht | Brute-Force | force brute | fuerza bruta | forza bruta | metoda siłowa (atak siłowy) | força bruta | força bruta | totalsökning (råstyrka) | uttømmende søk (rå kraft) | forță brută | nyers erő (teljes kipróbálás) | pilnā pārlase (brutālā spēka metode) | полный перебор | εξαντλητική αναζήτηση (ωμή βία) | כוח גס | ब्रूट-फ़ोर्स | `[ASSUMED]` |
| 46 | elliptic curve | elliptische kromme | elliptische Kurve | courbe elliptique | curva elíptica | curva ellittica | krzywa eliptyczna | curva elíptica | curva elíptica | elliptisk kurva | elliptisk kurve | curbă eliptică | elliptikus görbe | eliptiskā līkne | эллиптическая кривая | ελλειπτική καμπύλη | עקום אליפטי | दीर्घवृत्तीय वक्र | `[ASSUMED]` |
| 47 | point at infinity | punt op oneindig | Punkt im Unendlichen | point à l'infini | punto en el infinito | punto all'infinito | punkt w nieskończoności | ponto no infinito | ponto no infinito | punkten i oändligheten | punktet i det uendelige | punctul de la infinit | végtelen távoli pont | bezgalības punkts | бесконечно удалённая точка | σημείο στο άπειρο | נקודה באינסוף | अनंत पर बिंदु | `[ASSUMED]` |
| 48 | scalar multiplication | scalaire vermenigvuldiging | Skalarmultiplikation | multiplication scalaire | multiplicación escalar | moltiplicazione scalare | mnożenie przez skalar | multiplicação escalar | multiplicação escalar | skalär multiplikation | skalarmultiplikasjon | înmulțire cu un scalar | skalárral való szorzás | skalārā reizināšana | скалярное умножение | βαθμωτός πολλαπλασιασμός | כפל בסקלר | अदिश गुणन | `[ASSUMED]` |
| 49 | order finding | ordebepaling | Ordnungsbestimmung | recherche d'ordre | búsqueda de orden | ricerca dell'ordine | wyznaczanie rzędu | determinação da ordem | determinação da ordem | ordningsbestämning | ordensbestemmelse | determinarea ordinului | rendmeghatározás | kārtas noteikšana | нахождение порядка | εύρεση τάξης | מציאת סדר | कोटि ज्ञात करना | `[ASSUMED]` |
| 50 | period | periode | Periode | période | periodo | periodo | okres | período | período | period | periode | perioadă | periódus | periods | период | περίοδος | מחזור | आवर्त | `[ASSUMED]` |
| 51 | preset / example | voorbeeld | Beispiel | exemple | ejemplo | esempio | przykład | exemplo | exemplo | exempel | eksempel | exemplu | példa | piemērs | пример | παράδειγμα | דוגמה | उदाहरण | `[ASSUMED]` |
| 52 | step (playback) | stap | Schritt | étape | paso | passo | krok | passo | passo | steg | steg | pas | lépés | solis | шаг | βήμα | צעד | चरण | `[ASSUMED]` — matches `common.step` |
| 53 | playback | afspelen | Wiedergabe | lecture | reproducción | riproduzione | odtwarzanie | reprodução | reprodução | uppspelning | avspilling | redare | lejátszás | atskaņošana | воспроизведение | αναπαραγωγή | הפעלה | प्लेबैक | `[ASSUMED]` |

### Hebrew supplementary terms (added 2026-10-06 by quick task 261006-pks, Tasks 2-4)

Terms chosen while translating the pages in parallel; the he column of the table above
holds the citation forms, and the shipped values inflect them (definite ה-, construct
state, plural) — for example "המפתח הפרטי" for "private key". All `[ASSUMED]`.

| Term (en) | he | Used in |
|---|---|---|
| gcd / lcm (prose) | המחלק המשותף המקסימלי / הכפולה המשותפת המינימלית (ממ״מ / כמ״מ only in space-constrained labels) | Euclid, Venn, Totient, Factor Tree, Shor |
| Fibonacci | פיבונאצ׳י | Euclid |
| Venn regions | A בלבד / משותף / משותף לשלושתם / A ו-B בלבד | Venn |
| "in the tool X" | בכלי {tool} | Venn, CRT |
| nested squares | ריבועים מקוננים | Euclid |
| tile | אריח | Euclid |
| bin (delete target) | פח | Venn |
| Run (button) | הרצה | Euclid, Totient |
| Bézout coefficients | מקדמי בזו | Euclid |
| keyboard keys Enter / Space / Delete | אנטר / רווח / מחיקה | Venn |
| "fifteen tools" | חמישה עשר כלים | Hub |
| equivalence class | מחלקת שקילות | Wheel |
| wedge | פלח | Wheel, Cayley, Totient |
| concentric ring | טבעת קונצנטרית | Wheel |
| addend | מחובר | Totient, Wheel |
| accumulator | צובר | Square and Multiply |
| ladder | סולם | Square and Multiply |
| modular exponentiation | העלאה בחזקה מודולרית | Square and Multiply, DH |
| exponent | מעריך | Square and Multiply, DH, RSA |
| squaring | העלאה בריבוע | Square and Multiply |
| eavesdropper | מצותת (Eve: מצותתת) | DH, ECDH |
| subgroup | תת-חבורה | Cayley, Isomorphism |
| primitive root | שורש פרימיטיבי | Isomorphism, DH |
| bit / millisecond | ביט / אלפיות שנייה | Square and Multiply, DH, ECDH, RSA |
| scalar multiplication | כפל בסקלר | ECDH |
| base point | נקודת בסיס | ECDH |
| point at infinity | הנקודה באינסוף | ECDH |
| tangent / chord / slope | משיק / מיתר / שיפוע | ECDH |
| Hasse bound | חסם האסה | ECDH |
| discrete log | לוגריתם דיסקרטי | ECDH, RSA |
| brute force | כוח גס | DH, ECDH, RSA |
| tap (on the wire) | האזנה | DH, ECDH |
| notebook | מחברת | RSA |
| superposition | סופרפוזיציה | Shor |
| order / period | סדר / מחזור | Shor |
| continued fraction | שבר משולב | Shor |
| padding scheme | סכמת ריפוד | RSA |
| ElGamal | אל-גמאל | RSA |
| trial division | חלוקת ניסיון | RSA |
| Miller–Rabin | מילר-רבין | DH, RSA |
| diagram | דיאגרמה (תרשים only in תרשים פיזור) | all |
| extended Euclidean algorithm | האלגוריתם האוקלידי המורחב | CRT, Euclid, RSA |

---

## (d) Proper nouns (kept, conventional eponym spelling)

The `ro`/`hu`/`lv` columns and the Q-08/Q-10 Note sentences naming them were added
2026-10-03 by quick task 261003-0dr. The `ru`/`el` columns and the Q-08/Q-10 Note
sentences naming them were added 2026-10-03 by quick task 261003-57k; the Cyrillic and
Greek eponym forms are never identical to English, so they need no neutral token. The
`he` column was added 2026-10-06 by quick task 261006-pks; the Hebrew eponym forms are
transliterated and never identical to English either. The `hi` column was added 2026-10-06
by quick task 261006-vpp; Alice, Bob, Eve and RSA stay Latin, every eponym is transliterated
into Devanagari (never identical to English), and each postposition follows the name as a
separate word ("फ़र्मा की विधि").

| Proper noun | nl | de | fr | es | it | pl | pt-BR | pt-PT | sv | nb | ro | hu | lv | ru | el | he | hi | Note |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Alice | Alice | Alice | Alice | Alicia | Alice | Alice | Alice | Alice | Alice | Alice | Alice | Alice | Alice | Alice | Alice | Alice | Alice | ES RSA narrative commonly localizes to "Alicia"; **kept as "Alice" in all languages per this glossary** to match the existing cross-tool Bob/Alice/Eve narrative identically everywhere (consistency over localization). pl Alice is indeclinable. pt-BR/pt-PT keep "Alice" invariant — Portuguese does not decline names. sv/nb keep every name invariant and form the genitive with a plain -s; a name ending in -s takes no ending in sv and an apostrophe in nb. ro forms the genitive/dative with `lui Alice` or `lui {0}` (never a suffix on the name); hu never attaches a suffix to Alice, instead using a possessed-noun construction (`Alice kulcspárja`) or a postposition; lv keeps Alice invariant and introduces an oblique role with the apposition noun `puse` (`pusei Alice`), while a nominative subject uses the bare name.  ru treats Alice as indeclinable, expressing possession by position or a preposition (`открытый ключ {0}`, `для {0}`) and using a gender-neutral verb/adjective on a `{0}` slot (a literal "Alice" agrees with its own feminine gender). el gives the literal name its article (η Alice, της Alice) but uses a label/colon or dash form for a `{0}` placeholder, never a gendered article. |
| Bob | Bob | Bob | Bob | Bob | Bob | Bob | Bob | Bob | Bob | Bob | Bob | Bob | Bob | Bob | Bob | Bob | Bob | Unchanged in all languages; pl may decline (Boba, Bobowi) only where the name sits literally inside a value, never through a placeholder slot. pt-BR/pt-PT keep "Bob" invariant — Portuguese does not decline names. sv/nb keep every name invariant and form the genitive with a plain -s; a name ending in -s takes no ending in sv and an apostrophe in nb. ro/hu/lv treat Bob exactly as Alice above (`lui Bob`; possessed noun or postposition in hu; `puse`/`pusei Bob` in lv).  ru/el treat Bob exactly as Alice above, with Bob's own masculine gender where ru agreement applies; el's article is ο Bob / του Bob. |
| Eve | Eve | Eve | Ève | Eva | Eve | Eve | Eve | Eve | Eve | Eve | Eve | Eve | Eve | Eve | Eve | Eve | Eve | Kept per the project's narrative convention (see Alice above) — no language-specific substitution; it per Q-03 (quick task 261002-c77); pl Eve is indeclinable. pt-BR/pt-PT keep "Eve" invariant — Portuguese does not decline names. sv/nb keep every name invariant and form the genitive with a plain -s; a name ending in -s takes no ending in sv and an apostrophe in nb. ro forms the genitive/dative with `lui Eve`; hu never attaches a suffix to Eve, using a possessed noun or the postposition `által`; lv introduces an oblique Eve with the apposition noun `uzbrucēja` (`uzbrucējai Eve`), a nominative subject using the bare name (`Eve uzvar.`).  ru/el treat Eve exactly as Alice above (Eve's own feminine gender in ru, e.g. "Eve перебрала …"); el's article is η Eve / της Eve. |
| RSA | RSA | RSA | RSA | RSA | RSA | RSA | RSA | RSA | RSA | RSA | RSA | RSA | RSA | RSA | RSA | RSA | RSA | Acronym, invariant. sv/nb keep every name invariant and form the genitive with a plain -s; a name ending in -s takes no ending in sv and an apostrophe in nb. Invariant in ro, hu and lv too.  Invariant in ru and el too. |
| Diffie-Hellman | Diffie-Hellman | Diffie-Hellman | Diffie-Hellman | Diffie-Hellman | Diffie-Hellman | Diffie-Hellman | Diffie-Hellman | Diffie-Hellman | Diffie-Hellman | Diffie-Hellman | Diffie-Hellman | Diffie-Hellman | Diffie-Hellman | Диффи-Хеллман | Diffie-Hellman | דיפי-הלמן | डिफ़ी-हेलमैन | Eponym pair, invariant spelling; pl declines it in prose as "Diffiego-Hellmana". pt-BR/pt-PT keep it invariant — Portuguese does not decline names. sv/nb keep every name invariant and form the genitive with a plain -s; a name ending in -s takes no ending in sv and an apostrophe in nb. Invariant spelling in ro, hu and lv too; hu hyphenates the compound tool name as "Diffie-Hellman-kulcscsere".  ru uses the established Cyrillic transcription, declined in prose ("обмен ключами Диффи-Хеллмана"); el keeps the eponym pair in Latin script with the Greek article, as Greek mathematical writing does. |
| Euler | Euler | Euler | Euler | Euler | Eulero | Euler | Euler | Euler | Euler | Euler | Euler | Euler | Eilers | Эйлер | Euler | אוילר | ऑयलर | Invariant spelling in nl, de, fr, es, pl, pt-BR and pt-PT; per-language eponym spelling now extends to Italian ("Eulero"), per Q-03 (quick task 261002-c77); pl declines it in prose as "Eulera". pt-BR/pt-PT keep it invariant — Portuguese does not decline names. sv/nb keep every name invariant and form the genitive with a plain -s; a name ending in -s takes no ending in sv and an apostrophe in nb. ro forms the genitive with `lui Euler`; hu hyphenates the adjective form "Euler-féle"; lv uses the established transcription "Eilers" with Latvian case endings ("Eilera funkcija").  ru uses the established Cyrillic transcription "Эйлер" ("функция Эйлера"); el keeps the Latin spelling "Euler" with the Greek article ("συνάρτηση φ του Euler"), per Q-10. |
| Fermat | Fermat | Fermat | Fermat | Fermat | Fermat | Fermat | Fermat | Fermat | Fermat | Fermat | Fermat | Fermat | Ferma | Ферма | Fermat | פרמה | फ़र्मा | Invariant spelling; pl declines it in prose as "Fermata". pt-BR/pt-PT keep it invariant — Portuguese does not decline names. sv/nb keep every name invariant and form the genitive with a plain -s; a name ending in -s takes no ending in sv and an apostrophe in nb. ro forms the genitive with `lui Fermat` ("Metoda lui Fermat"); hu hyphenates "Fermat-módszer"; lv uses the indeclinable transcription "Ferma" ("Ferma metode").  ru uses the indeclinable Cyrillic transcription "Ферма" ("метод Ферма"); el keeps the Latin spelling "Fermat" with the Greek article ("μέθοδος του Fermat"). |
| Cayley | Cayley | Cayley | Cayley | Cayley | Cayley | Cayley | Cayley | Cayley | Cayley | Cayley | Cayley | Cayley | Keilijs | Кэли | Cayley | קיילי | केली | Invariant spelling; pl declines it in prose as "Cayleya". pt-BR/pt-PT keep it invariant — Portuguese does not decline names. sv/nb keep every name invariant and form the genitive with a plain -s; a name ending in -s takes no ending in sv and an apostrophe in nb. ro forms the genitive with `lui Cayley` ("Tabla lui Cayley"); hu hyphenates "Cayley-táblázat"; lv uses the established transcription "Keilijs" with case endings ("Keilija tabula").  ru uses the indeclinable Cyrillic transcription "Кэли" ("таблица Кэли"); el keeps the Latin spelling "Cayley" ("πίνακας Cayley"). |
| Venn | Venn | Venn | Venn | Venn | Venn | Venn | Venn | Venn | Venn | Venn | Venn | Venn | Venns | Венн | Venn | ון | वेन | Invariant spelling; pl declines it in prose as "Venna". pt-BR/pt-PT keep it invariant — Portuguese does not decline names. sv/nb keep every name invariant and form the genitive with a plain -s; a name ending in -s takes no ending in sv and an apostrophe in nb. ro uses apposition ("Diagrama Venn"); hu hyphenates "Venn-diagram"; lv uses the established transcription "Venns" with case endings ("Venna diagramma").  ru uses the Cyrillic transcription "Венн", declined in prose ("диаграмма Венна"); el keeps the Latin spelling "Venn" ("διάγραμμα Venn"). |
| Shor | Shor | Shor | Shor | Shor | Shor | Shor | Shor | Shor | Shor | Shor | Shor | Shor | Šors | Шор | Shor | שור | शोर | Invariant spelling; pl declines it in prose as "Shora". pt-BR/pt-PT keep it invariant — Portuguese does not decline names. sv/nb keep every name invariant and form the genitive with a plain -s; a name ending in -s takes no ending in sv and an apostrophe in nb. ro forms the genitive with `lui Shor` ("Algoritmul lui Shor"); hu hyphenates "Shor-algoritmus"; lv uses the established transcription "Šors" with case endings ("Šora algoritms").  ru uses the Cyrillic transcription "Шор", declined in prose ("алгоритм Шора"); el keeps the Latin spelling "Shor" ("αλγόριθμος του Shor"). |
| Euclid / Euclides / Euklid / Euclide / Euclides / Euklides | Euclides | Euklid | Euclide | Euclides | Euclide | Euklides | Euclides | Euclides | Euklides | Euklid | Euclid | Eukleidész | Eiklīds | Евклид | Ευκλείδης | אוקלידס | यूक्लिड | Per-language eponym spelling — already used in `site.nav.euclid` (06-01); it matches fr ("Euclide"), per Q-03; pl uses the conventional Polish form "Euklides" and declines it in prose ("Algorytm Euklidesa"). pt-BR/pt-PT both use "Euclides", the conventional Portuguese form (shared with es), kept invariant — Portuguese does not decline names. sv/nb keep every name invariant and form the genitive with a plain -s; a name ending in -s takes no ending in sv and an apostrophe in nb. ro forms the genitive with `lui Euclid` ("Algoritmul lui Euclid"); hu uses the conventional Hungarian form "Eukleidész" with the adjective "euklideszi" ("Euklideszi algoritmus"); lv uses the established transcription "Eiklīds" with case endings ("Eiklīda algoritms").  ru uses the established Cyrillic transcription "Евклид", declined in prose ("алгоритм Евклида"); el uses the native Greek name "Ευκλείδης" ("αλγόριθμος του Ευκλείδη"), as Greek mathematical writing does for the ancient Greeks. |
| Eratosthenes / Eratosthène / Eratóstenes / Eratostene / Eratostenes | Eratosthenes | Eratosthenes | Ératosthène | Eratóstenes | Eratostene | Eratostenes | Eratóstenes | Eratóstenes | Eratosthenes | Eratosthenes | Eratostene | Eratoszthenész | Eratostens | Эратосфен | Ερατοσθένης | ארטוסתנס | एराटोस्थनीज़ | Per-language eponym spelling — already used in `site.nav.sieve` (06-01); it per Q-03; pl uses the conventional Polish form "Eratostenes" ("Sito Eratostenesa"). pt-BR/pt-PT both use "Eratóstenes", the conventional Portuguese form (shared with es), kept invariant — Portuguese does not decline names. sv/nb keep every name invariant and form the genitive with a plain -s; a name ending in -s takes no ending in sv and an apostrophe in nb. ro forms the genitive with `lui Eratostene` ("Ciurul lui Eratostene"); hu uses the conventional Hungarian form "Eratoszthenész" ("Eratoszthenész szitája"); lv uses the established transcription "Eratostens" with case endings ("Eratostena siets").  ru uses the established Cyrillic transcription "Эратосфен", declined in prose ("решето Эратосфена"); el uses the native Greek name "Ερατοσθένης" ("κόσκινο του Ερατοσθένη"). |
| Bézout | Bézout | Bézout | Bézout | Bézout | Bézout | Bézout | Bézout | Bézout | Bézout | Bézout | Bézout | Bézout | Bezū | Безу | Bézout | בזו | बेज़ू | Invariant spelling (Euclidean Algorithm tool's Extended Euclidean/Bézout coefficients); pl declines it in prose as "Bézouta". pt-BR/pt-PT keep it invariant — Portuguese does not decline names. sv/nb keep every name invariant and form the genitive with a plain -s; a name ending in -s takes no ending in sv and an apostrophe in nb. ro forms the genitive with `lui Bézout`; hu hyphenates "Bézout-együtthatók"; lv uses the indeclinable transcription "Bezū" ("Bezū koeficienti").  ru uses the indeclinable Cyrillic transcription "Безу" ("коэффициенты Безу"); el keeps the Latin spelling "Bézout" ("συντελεστές Bézout"). |
| Sun Tzu | Sun Tzu | Sunzi | Sun Tzu | Sun Tzu | Sun Tzu | Sun Tzu | Sun Tzu | Sun Tzu | Sun Tzu | Sun Tzu | Sun Tzu | Sun Tzu | Sun Tzu | Сунь-цзы | Σουν Τζου | סון דזה | सुन त्ज़ु | CRT's historical attribution (Sunzi Suanjing) — DE conventionally uses the pinyin "Sunzi"; other languages, including pl, pt-BR and pt-PT, keep "Sun Tzu" (invariant). `[ASSUMED]` sv/nb keep every name invariant and form the genitive with a plain -s; a name ending in -s takes no ending in sv and an apostrophe in nb. ro, hu and lv also keep "Sun Tzu" invariant.  ru uses the established Cyrillic transcription "Сунь-цзы" (invariant); el uses the transliteration "Σουν Τζου" (invariant). |

All proper nouns above are neutral tokens per `i18n-check.js`'s prose rule (NEUTRAL_TOKENS)
and are never flagged by IDENTICAL-TO-EN.

---

## (e) Numerals and notation (06-01-PLAN assumption A7)

Numerals are **never** locale-formatted in any of the eighteen languages. Existing
`toString()`/`NT.bigint.fmt` output (comma-grouped thousands, `.` decimal point where
applicable) stays byte-identical in every language — French/German/Dutch/Italian/Polish/
Portuguese/Swedish/Norwegian/Romanian/Hungarian/Latvian conventions that would normally
swap `.`/`,` separators or use a different grouping character **do not apply** to this
site's math output, because the numerals displayed are computed data (RSA moduli, GCD
results, Cayley table entries, CF convergents), not locale-formatted quantities.
`i18n-check.js --no-locale-number-format` and the `i18n-browser.js` en-parity gate enforce
this: a `toLocale…String` call or an `Intl.` constructor other than `Intl.PluralRules`
anywhere in a page's inline script or any `assets/*.js`/`assets/i18n/*.js` file is a
LOCALE-FORMAT finding. Mathematical notation (×, ÷, ², √, ≡, mod, gcd, lcm, →, ≤, ≥) is
written identically in all eighteen languages — these are the eighteen autonyms' shared
symbolic vocabulary, not natural-language text. Brazilian and European Portuguese (both
added 2026-10-02 by quick task 261002-jh4) are no exception: neither variant's own
national separator convention (Brazil's comma-decimal, Portugal's comma-decimal) applies
to this site's math output either. Swedish and Norwegian Bokmål (both added 2026-10-02 by
quick task 261002-s7l) are no exception either: both languages' own national separator
convention (comma decimals, space grouping) does not apply to this site's math output.
Romanian, Hungarian and Latvian (all three added 2026-10-03 by quick task 261003-0dr) are
no exception either: all three use comma decimals and space or period grouping, and that
convention does not apply to this site's math output. Russian and Greek (both added
2026-10-03 by quick task 261003-57k) are no exception either: ru uses comma decimals with
space grouping and el uses comma decimals with period grouping, and that convention does
not apply to this site's math output. ru and el are also the first non-Latin-script
languages on this site: apart from the notation allow-list in `i18n-check.js`'s
`SCRIPT_RULES` (mod, gcd/lcm where a key keeps them literal, single-letter variables,
acronyms, code identifiers, Alice/Bob/Eve, and for el the modern eponyms, bit and ms),
every word in a ru or el value is written in that language's own script — Cyrillic for ru,
Greek for el — rather than Latin, enforced by `scriptFindings`'s SCRIPT-LATIN/
SCRIPT-MIXED/SCRIPT-FOREIGN/SCRIPT-MISSING findings.
Hebrew (added 2026-10-06 by quick task 261006-pks) writes Western digits with the same
comma grouping and dot decimal as English (Israel's own convention, so nothing changes),
is the site's first right-to-left language, and keeps every formula, numeral and diagram
left-to-right through U+2066…U+2069 isolates in the values and `:root[dir="rtl"]` CSS rules;
its words are checked by the same SCRIPT-* findings plus the BIDI-* findings.
Hindi (added 2026-10-06 by quick task 261006-vpp) is the first Devanagari-script language, writes ASCII digits only with the same comma grouping and dot decimal as English (no Devanagari digits, no lakh/crore grouping) and carries exactly its English value's numerals (NATIVE-DIGIT, DIGIT-PARITY).

---

## (f) Common vocabulary table

The `common` namespace (`assets/i18n/site.js`, 06-02 Task 1) — shared strings used
verbatim by two or more tools. Any new cross-tool string discovered by a later wave-3
plan is added here (and to `assets/i18n/site.js`) rather than duplicated per-page; a
per-tool plan never edits `assets/i18n/site.js` itself for a string that is not already
shared by at least two pages. The pt-BR/pt-PT columns were added 2026-10-02 by quick task
261002-jh4. The sv/nb columns were added 2026-10-02 by quick task 261002-s7l. The ro/hu/lv
columns were added 2026-10-03 by quick task 261003-0dr. The ru/el columns were added
2026-10-03 by quick task 261003-57k. The he column was added 2026-10-06 by quick task
261006-pks. The hi column was added 2026-10-06 by quick task 261006-vpp.

| key | Pages using it | en | nl | de | fr | es | it | pl | pt-BR | pt-PT | sv | nb | ro | hu | lv | ru | el | he | hi |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| common.play | Chinese Remainder Theorem, Diffie-Hellman Key Exchange, Elliptic Curve Diffie-Hellman, Euclidean Algorithm, Euler's Totient, Fermat's Method, Shor's Algorithm, Sieve of Eratosthenes, Square and Multiply | ▶ Play | ▶ Afspelen | ▶ Abspielen | ▶ Lecture | ▶ Reproducir | ▶ Riproduci | ▶ Odtwórz | ▶ Reproduzir | ▶ Reproduzir | ▶ Spela upp | ▶ Spill av | ▶ Redă | ▶ Lejátszás | ▶ Atskaņot | ▶ Пуск | ▶ Έναρξη | ▶ הפעלה | ▶ चलाएँ |
| common.pause | (same 9) | ⏸ Pause | ⏸ Pauzeren | ⏸ Pausieren | ⏸ Mettre en pause | ⏸ Pausar | ⏸ Pausa | ⏸ Pauza | ⏸ Pausar | ⏸ Pausar | ⏸ Pausa | ⏸ Sett på pause | ⏸ Pauză | ⏸ Szünet | ⏸ Pauze | ⏸ Пауза | ⏸ Παύση | ⏸ השהיה | ⏸ रोकें |
| common.step | (same 9) | ⏭ Step | ⏭ Stap | ⏭ Schritt | ⏭ Étape | ⏭ Paso | ⏭ Passo | ⏭ Krok | ⏭ Passo | ⏭ Passo | ⏭ Steg | ⏭ Steg | ⏭ Pas | ⏭ Lépés | ⏭ Solis | ⏭ Шаг | ⏭ Βήμα | ⏭ צעד | ⏭ चरण |
| common.instant | (same 9) | ⏩ Instant | ⏩ Direct | ⏩ Sofort | ⏩ Instantané | ⏩ Instantáneo | ⏩ Istantaneo | ⏩ Natychmiast | ⏩ Instantâneo | ⏩ Instantâneo | ⏩ Direkt | ⏩ Straks | ⏩ Instantaneu | ⏩ Azonnal | ⏩ Uzreiz | ⏩ Сразу | ⏩ Άμεσα | ⏩ מיידי | ⏩ तुरंत |
| common.reset | (same 9) | ↺ Reset | ↺ Herstart | ↺ Zurücksetzen | ↺ Réinitialiser | ↺ Reiniciar | ↺ Reimposta | ↺ Resetuj | ↺ Reiniciar | ↺ Repor | ↺ Återställ | ↺ Tilbakestill | ↺ Resetează | ↺ Visszaállítás | ↺ Atiestatīt | ↺ Сброс | ↺ Επαναφορά | ↺ איפוס | ↺ रीसेट |
| common.speed | (same 9) | Speed | Snelheid | Geschwindigkeit | Vitesse | Velocidad | Velocità | Prędkość | Velocidade | Velocidade | Hastighet | Hastighet | Viteză | Sebesség | Ātrums | Скорость | Ταχύτητα | מהירות | गति |
| common.speed.1 … common.speed.10 | (same 9) | glacial … instant-ish | ijzig … bijna-direct | eisig … fast augenblicklich | glaciaire … quasi instantané | gélido … casi instantáneo | glaciale … quasi istantaneo | lodowata … niemal natychmiastowa | gélida … quase instantânea | gélida … quase instantânea | isande … nästan omedelbar | iskald … nesten øyeblikkelig | glacială … aproape instantanee | jeges … szinte azonnali | ledains … gandrīz acumirklīgs | ледяная … почти мгновенная | παγερή … σχεδόν ακαριαία | קרחונית … כמעט מיידית | बर्फ़ीली … लगभग तुरंत |
| common.additiveGroups | Cayley Table, Equivalence Wheel | Additive Groups | Additieve groepen | Additive Gruppen | Groupes additifs | Grupos aditivos | Gruppi additivi | Grupy addytywne | Grupos aditivos | Grupos aditivos | Additiva grupper | Additive grupper | Grupuri aditive | Additív csoportok | Aditīvās grupas | Аддитивные группы | Προσθετικές ομάδες | חבורות חיבוריות | योगात्मक समूह |
| common.multiplicativeGroups | Cayley Table, Equivalence Wheel | Multiplicative Groups | Multiplicatieve groepen | Multiplikative Gruppen | Groupes multiplicatifs | Grupos multiplicativos | Gruppi moltiplicativi | Grupy multiplikatywne | Grupos multiplicativos | Grupos multiplicativos | Multiplikativa grupper | Multiplikative grupper | Grupuri multiplicative | Multiplikatív csoportok | Multiplikatīvās grupas | Мультипликативные группы | Πολλαπλασιαστικές ομάδες | חבורות כפליות | गुणात्मक समूह |

(The full speed-word table is in `assets/i18n/site.js`; this row is a pointer, not a
duplicate source of truth.)
