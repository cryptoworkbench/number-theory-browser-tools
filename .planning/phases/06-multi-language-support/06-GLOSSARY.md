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
| Arabic (ar) `[ASSUMED]` | Modern Standard Arabic (فصحى), second-person **masculine singular** imperative (the convention of Arabic software UIs) | Imperatives for instructions (اختر، انقر، أدخل، اسحب، اضغط، جرب، شاهد، اكتب); verbal nouns for buttons, toggles and action names (تشغيل، إيقاف مؤقت، إعادة تعيين، إنشاء، مسح، تراجع، إعادة); validation messages state the problem descriptively (يجب أن يكون …). Never a dialect. Added 2026-10-07 by quick task 261007-fhx. |
| Albanian (sq) `[ASSUMED]` | Formal second-person **plural (ju)** for instructions (the convention of Albanian software UIs); short singular imperatives for buttons | Instructions: zgjidhni, klikoni, shtypni, shkruani, futni, shihni, provoni, tërhiqni, zhvendosni; buttons and toggles: Luaj, Rivendos, Gjenero, Fshi, Shto, Eksporto, Zhbëj, Ribëj; validation messages state the problem (… duhet të jetë …); status banners use the passive or first-person plural (U gjetën …, Gjetëm …). Standard Albanian (gjuha standarde, Tosk-based). Added 2026-10-07 by quick task 261007-k4o. |
| Swahili (sw) `[ASSUMED]` | Singular imperative (the convention of Swahili software UIs) | Instructions and buttons: bofya, chagua, ingiza, andika, tazama, jaribu, buruta, bonyeza, sogeza; Cheza, Sitisha, Weka upya, Tengeneza, Futa, Ongeza, Hamisha, Tendua, Rudia; validation messages state the problem (… lazima iwe …); status banners use the perfect or stative (Zimepatikana …, Imekamilika). Kiswahili sanifu (Standard Swahili), no Sheng, no English code-mixing. Added 2026-10-07 by quick task 261007-k4o. |
| Chinese (zh) `[ASSUMED]` | Simplified Chinese; second person **你** only when a pronoun is needed; plain imperatives for instructions | Instructions: 点击、选择、输入、拖动、按、查看、试试; buttons as verbs or verb-object phrases (播放、暂停、重置、生成、清空、添加、撤销、重做); validation states the problem (请输入……, ……必须是……); status banners in the perfective (已找到……, 已完成). Added 2026-10-07 by quick task 261007-pbf. |
| Japanese (ja) `[ASSUMED]` | Polite **です・ます** style, no あなた | Instructions 〜してください (クリックしてください、選択してください、入力してください、ドラッグしてください、押してください、試してください); buttons as nouns (再生、一時停止、リセット、生成、クリア、追加); validation …を入力してください / …である必要があります; status …が見つかりました / 完了しました. Added 2026-10-07 by quick task 261007-pbf. |
| Korean (ko) `[ASSUMED]` | Formal polite **합니다체** for prose and status, polite **-세요** for instructions, no 당신 | Instructions: 클릭하세요, 선택하세요, 입력하세요, 드래그하세요, 누르세요, 시도해 보세요; buttons as nouns (재생, 일시 정지, 초기화, 생성, 지우기, 추가); validation …해야 합니다; status …합니다 / …했습니다. Added 2026-10-07 by quick task 261007-pbf. |
| Indonesian (id) `[ASSUMED]` | Formal and neutral standard Indonesian (bahasa Indonesia baku); the reader is addressed as **Anda** (always capitalized) only when a pronoun is unavoidable, never kamu, kau or engkau | Bare imperatives for instructions: Klik, Pilih, Masukkan, Ketik, Seret, Tekan, Lihat, Coba, Geser, Gunakan; buttons and toggles use the short imperatives of Indonesian software UIs (Putar, Jeda, Langkah, Atur ulang, Buat, Acak, Hapus, Bersihkan, Tambah, Ekspor, Unduh, Urungkan, Ulangi, Hitung, Faktorkan, Jalankan); validation messages state the problem (… harus …; Masukkan …); status banners use the passive or perfective (Ditemukan …, Selesai, … telah dihitung); silakan only where English says please. Added 2026-10-08 by quick task 261008-0h2. |
| Standard Moroccan Tamazight (zgh-Latn, zgh-Tfng) `[ASSUMED]` | Tamazight has no T/V distinction; the unmarked register of Tamazight software UIs: the second person singular imperative, no kyy/kmm pronoun unless unavoidable; Alice, Bob and Eve are referred to by name | Instructions: Sti (choose, pick), Ara (write, enter), Sit ɣf (click on), Rnu (add), Kkes (remove), Sfeḍ (clear), Ssiḍn (compute), Ssken (show), Ffer (hide), Smrs (use), Sfsx (undo), Ales (redo); buttons and toggles: Urar (play), Sgunfu (pause), Asurif (step), Dɣya (instant), Ssuɣl (reset); a noun where English has a noun; validation messages state the requirement (ixṣṣa ad …; Ara yan ummid …); status banners use the perfective or passive (ittwafa … found; ikmml … completed; ittwassiḍn … computed). Added 2026-10-08 by quick task 261008-e2j. |
| Kurmanji Kurdish (ku) `[ASSUMED]` | Standard Kurmanji (Northern Kurdish) in the Latin Hawar alphabet; no pronoun unless unavoidable (Alice and Eve take wê, Bob takes wî); no T/V distinction in software UIs | Instructions and verb buttons in the second person singular imperative (Hilbijêre, Binivîse, Bitikîne, Zêde bike, Jê bibe, Paqij bike, Hesab bike, Nîşan bide, Veşêre, Bi kar bîne, Bikişîne, Temaşe bike, Biceribîne, Lêxe, Rawestîne); noun buttons stay nouns (Gav); validation states the requirement (Divê … be); status banners in the past or passive (… hate dîtin, … qediya, … hate hesabkirin). Added 2026-10-08 by quick task 261008-k7u. |
| Sorani Kurdish (ckb) `[ASSUMED]` | Standard Sorani (Central Kurdish) in the Kurdish Arabic-based alphabet; second person singular; no grammatical gender | Imperatives for instructions (ھەڵبژێرە، بنووسە، کرتە بکە، زیاد بکە، لابە، پاک بکەرەوە، بژمێرە، پیشان بدە، بشارەوە، بەکاربھێنە، ڕابکێشە، سەیر بکە، تاقی بکەرەوە); verbal nouns for buttons and toggles (لێدان، ڕاگرتن، ڕێکخستنەوە، سڕینەوە); validation دەبێت … بێت; status banners in the past (دۆزرایەوە، تەواو بوو). Added 2026-10-08 by quick task 261008-k7u. |
| Sanskrit (sa) `[ASSUMED]` | Polite address in the third person singular imperative (the भवान् convention, without writing भवान्) | Imperatives for instructions and verb buttons (चिनोतु, लिखतु, नुदतु, योजयतु, अपनयतु, मार्जयतु, गणयतु, दर्शयतु, गोपयतु, उपयोजयतु, कर्षतु, पश्यतु, परीक्षताम्, रचयतु, चालयतु, अवारोपयतु, निवर्तयतु); action nouns for the five playback buttons (चालनम्, विरामः, पदम्, तत्क्षणम्, पुनःस्थापनम्); validation states the requirement with भवेत् ("N 2 तः 1000 पर्यन्तं पूर्णाङ्कः भवेत्।"); status banners use past participles (प्राप्ताः, समाप्तम्, गणितम्, रचिताः); Alice and Eve are feminine, Bob masculine (प्रेषितवती / प्रेषितवान्). Classical Sanskrit prose with modern scholarly and technical neologisms and the traditional Indian mathematical terms (लब्धि, शेष, भाजक, गुणक). Added 2026-10-08 by quick task 261008-qz1. |
| Latin (la) `[ASSUMED]` | Second person singular (tu) imperative; Neo-Latin scientific register | Imperatives for instructions and buttons (elige, inscribe, preme, adde, aufer, dele, purga, computa, ostende, cela, adhibe, trahe, specta, tempta, genera, exsequere, deprome, rescinde, repete, fortuito elige); validation states the requirement with "… esse debet" (N inter 2 et 1000 esse debet.); status banners use the perfect passive (inventi sunt, factum est, computatum est); Alice, Bob and Eve stay indeclinable (adjectives and participles feminine for Alice and Eve, masculine for Bob). Added 2026-10-08 by quick task 261008-qz1. |

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
  `@font-face` or `font-family` change is made for it. Cross-batch conventions settled
  in Task 5: Randomize is यादृच्छिक करें; a "demo" is a प्रदर्शन; "use" is always उपयोग
  (never इस्तेमाल / प्रयोग); "function" is फलन; English "whole number" is पूर्ण संख्या
  and "integer" is पूर्णांक; "real" is असली; an `{verbing}`-style slot is filled with a
  noun plus a conjunction (Wheel's `verbingAdditive` योग / `verbingMultiplicative`
  गुणनफल with `joiner*` और) and `{ordWord}` / `{word}` slots take a bare noun (कोटि),
  so the surrounding frame needs no gender or case agreement; identical English strings
  on the DH and ECDH pages carry identical Hindi. See the "Hindi supplementary terms"
  table after (c). Added 2026-10-06 by quick task 261006-vpp.

- **Arabic (ar) `[ASSUMED]`:** the second right-to-left language on this site and the first
  Arabic-script one; Modern Standard Arabic (فصحى), never a dialect (L-MSA). English is the
  source of truth (L-SOURCE): every value is translated from its en entry; the Hebrew value of
  the same key is consulted only as the reference for where bidi isolates go. Register
  (D-REGISTER): second-person masculine singular imperative for instructions (اختر، انقر،
  أدخل، اسحب، اضغط، جرب، شاهد، اكتب), verbal nouns for buttons, toggles and action names
  (تشغيل، إيقاف مؤقت، إعادة تعيين، إنشاء، مسح، تراجع، إعادة), validation messages stated
  descriptively (يجب أن يكون …). Orthography (D-ORTHO): unvocalized text, no harakat or other
  tashkeel (U+064B–U+065F, U+0670) and no tatweel (U+0640), so every word has one byte form
  and glossary greps and term unification match; the tanween-fath alif stays a bare alif
  (مثلا، أيضا، رقما); standard hamza seats (إ أ ؤ ئ ء), taa marbuta ة distinct from haa ه,
  dotted final yeh ي distinct from alef maksura ى; only the Arabic-language letters
  U+0621–U+063A and U+0641–U+064A, never the Persian/Urdu look-alikes (ی U+06CC, ک U+06A9, ە, ۀ)
  and never presentation forms (U+FB50–U+FDFF, U+FE70–U+FEFC); every value is NFC (آ is U+0622,
  never ا plus U+0653) and contains no zero-width character. Punctuation (D-PUNCT): in prose the
  Arabic comma ، (U+060C), semicolon ؛ (U+061B) and question mark ؟ (U+061F) written as the literal
  characters; full stop ".", colon ":" and "!" stay ASCII; never the Urdu full stop ۔ (U+06D4);
  ASCII `, ; ?` never directly follow an Arabic letter; ASCII punctuation stays inside formulas,
  numerals, coordinate tuples and lists of numbers or Latin tokens; no space before ، ؛ ؟ : !;
  a quoted UI label sits between ASCII double quotes ("تشغيل"); dash ` — ` with spaces; the
  ellipsis "…" unchanged; a value whose English has no closing punctuation gets none.
  Glyphs (D-MEDIA-GLYPHS): the playback glyphs ▶ ⏸ ⏭ ⏩ ↺ are not mirrored; a prose arrow meaning
  "go / open / next" (→ in "Open tool →") becomes ←, exactly where the he value uses ←; an arrow
  inside a formula stays and sits inside its isolate. Bidirectional text (D-ISOLATES): every
  numeric formula, equation, comparison, fraction, mod expression and coordinate/argument tuple
  inside an Arabic sentence is wrapped in U+2066 … U+2069, written in the source as the escapes
  `\u2066` and `\u2069` (never raw invisible characters); an Arabic phrase inside an
  LTR-forced box gets U+2067 … U+2069 exactly where the he value uses U+2067; embeddings and
  overrides (U+202A–U+202E) are never used. Arabic letters are bidi class AL, which turns following
  European digits into Arabic-number type: an unwrapped "48 = 2 × 18 + 12" in an Arabic paragraph
  reverses exactly as in Hebrew and a tight "7-3" reverses too, while grouped and decimal numerals
  (16,777,216 and 16.8) stay intact without an isolate. Follow the he value's isolate structure
  wherever both languages are right-to-left; enforced by BIDI-CONTROL, BIDI-UNBALANCED,
  BIDI-FORMULA and BIDI-RAW. Numerals (L-DIGITS): ASCII digits 0-9 only, never Arabic-Indic
  (٠-٩, U+0660–U+0669) or Extended Arabic-Indic (۰-۹, U+06F0–U+06F9) digits, never the Arabic
  decimal or thousands separator (٫ U+066B, ٬ U+066C), never the Arabic comma inside a numeral,
  never locale-formatted; each Arabic value carries exactly the numerals of its English value
  (same digits, same grouping commas, same decimal point, any order), enforced by NATIVE-DIGIT,
  NATIVE-SEPARATOR and DIGIT-PARITY. English scale words become مليون / مليار / تريليون with the
  numeral kept as in English (16.8 مليون, 1 تريليون). Plurals (L-PLURAL): CLDR
  `{zero, one, two, few, many, other}`, exactly `Intl.PluralRules('ar')`'s own category set
  (verified in this repo's Node 22, ICU 78 / CLDR 48): 0 selects zero; 1 one; 2 two; 3, 10, 103
  few (n % 100 in 3..10); 11, 99, 111 many (n % 100 in 11..99); 100, 101, 102, 200, 1000000, 0.5,
  1.5 other. Every category keeps every placeholder and the count is never replaced by a word (no
  لا for zero, no واحد or اثنان instead of the digit). Forms of a counted noun
  (D-PLURAL-FORMS), digits kept: zero → the plural, as for few ({count} مفاتيح); one → the singular
  ({count} مفتاح); two → the dual ({count} مفتاحان, or مفتاحين where the sentence governs the
  oblique case); few (3–10) → the plural ({count} مفاتيح); many (11–99) → the singular
  accusative with its bare alif ({count} مفتاحا); other → the singular genitive ({count} مفتاح).
  Grammar (D-GRAMMAR): placeholders and rich-template Node slots move freely; never attach a
  one-letter proclitic (ب ل ك ف) or the article ال to a number, placeholder or Latin token (use
  a free word: باستخدام RSA، للعدد {n}، العدد {n}); the conjunction و before them is a separate
  word (و {n}); a frame and the words fed into its slot ({word}, {roles}, {verbing}, {ordWord})
  are translated together so gender, definiteness and case agree, and a slot of unknown gender
  uses a construction that needs no agreement; a non-plural value with a fixed English numeral
  uses the noun form MSA grammar requires after it (the numeral itself stays a digit). Names
  (D-NAMES): Alice, Bob, Eve, acronyms (RSA, AES, DH, CRT, QFT, ECDH, OAEP, DSA), code identifiers
  (BigInt, pointAdd, scalarMul, qInv, dP, dQ, kG, aG, bG, aB, bA), file formats (PNG, SVG, PDF) and
  the cipher name Blowfish stay Latin exactly like ru, el, he and hi, with natural-gender verb
  agreement (ترسل Alice، يرسل Bob، تتنصت Eve); eponyms are transliterated into Arabic script (إقليدس،
  إراتوستينس، أويلر، فيرما، كايلي، فن، شور، بيزو، ديفي-هيلمان، صن تزو، فورييه، فيبوناتشي، غارنر،
  هاسه، ميلر-رابين keeping the English value's own dash، الجمل for ElGamal), so `SCRIPT_RULES.ar`
  reuses the base notation list without el's eponym extension; bit is بت (plural بتات),
  millisecond / ms is مللي ثانية. gcd / lcm (D-GCD): `gcd(` / `lcm(` stay literal inside formulas;
  the prose noun is القاسم المشترك الأكبر / المضاعف المشترك الأصغر, abbreviated ق.م.أ / م.م.أ only
  in space-constrained labels (pills, step labels, table headings); `mod` stays literal; modulus
  is المقياس ("modulo n" in prose: بمقياس n); modular is نمطي. Spellings never used (left) and the
  chosen form (right) (D-AVOID): ألغوريتم / الغوريتم / ألغوريثم / خوارزم → خوارزمية; مودولو /
  موديولو → المقياس; اقليدس / أقليدس / يوكليد → إقليدس; أويلير / اويلر / يولر → أويلر; فيرمات →
  فيرما; كيلي → كايلي; اراتوستينس / إراتوستينيس / ايراتوستينس → إراتوستينس; منخل → غربال; بيضوي /
  بيضوية / ناقصي / ناقصية / إهليجي / إهليجية → إهليلجي / إهليلجية; فك الشفرة → فك التشفير; ميلي ثانية
  / ملي ثانية → مللي ثانية; بيت → بت; زمرة دائرية / الزمرة الدائرية → زمرة دورية; عدد مركب / العدد
  المركب / أعداد مركبة / الأعداد المركبة → عدد مؤلف; مجموعة جمعية / مجموعة ضربية → زمرة جمعية /
  زمرة ضربية; ديفي هيلمان / ديفي-هلمان / ديفى → ديفي-هيلمان. Script rule: apart from the notation
  allow-list in `i18n-check.js`'s `SCRIPT_RULES` (mod, gcd/lcm where a key keeps them literal,
  single-letter variables, acronyms, code identifiers, Alice/Bob/Eve) every word is Arabic — no
  Cyrillic, Hebrew or Devanagari word, no multi-letter Greek word, no word mixing scripts (an
  Arabic haraka or tatweel counts as part of its word) — enforced by SCRIPT-LATIN / SCRIPT-MIXED /
  SCRIPT-FOREIGN / SCRIPT-MISSING; ru, el, he and hi reject Arabic letters. Character rules:
  NATIVE-DIGIT, NATIVE-SEPARATOR, DIGIT-PARITY, TASHKEEL, TATWEEL, PRESENTATION-FORM,
  ARABIC-LETTER, NOT-NFC and ZERO-WIDTH. Layout (L-RTL): while Arabic is active `<html>` carries
  `dir="rtl"` next to `lang="ar"` and the existing `:root[dir="rtl"]` rules of `assets/site.css`
  and of each page (none is Hebrew-specific) mirror the header, prose and panels while every
  diagram, number grid or table, numeric input, range slider and formula stays left-to-right.
  Joining (D-JOIN): Arabic is cursive, so `assets/site.css` resets `letter-spacing` on page
  titles for `:root[lang="ar"]` (and Fermat's result line does the same) because some engines
  draw Arabic letters disconnected under non-zero letter-spacing. Arabic text renders in the
  browser's system fallback font (L-FONT): no Google Fonts `<link>`, `@font-face` or
  `font-family` change is made for it. Tool names (D-TOOLS) are the ar column of (b); core terms
  (D-TERMS) the ar column of (c). Added 2026-10-07 by quick task 261007-fhx.
- **Albanian (sq) `[ASSUMED]`:** a left-to-right Latin-script language; standard Albanian
  (gjuha standarde, the Tosk-based literary norm, 1972 orthography), never Gheg — no nasal
  vowels â ê î ô û, no Gheg infinitive ("me" + participle) (L-STANDARD). English is the source
  of truth (L-SOURCE): every value is translated from its en entry, never derived from another
  language's block. Register (D-REGISTER-sq): formal second-person plural (ju) for instructions
  (zgjidhni, klikoni, shtypni, shkruani, futni, shihni, provoni, tërhiqni, zhvendosni), short
  singular imperatives for buttons and toggles (Luaj, Rivendos, Gjenero, Fshi, Shto, Eksporto,
  Zhbëj, Ribëj), validation messages that state the problem (… duhet të jetë …), status banners
  in the passive or first-person plural (U gjetën …, Gjetëm …). Orthography (D-ORTHO-sq):
  precomposed ë Ë ç Ç (NFC), never plain e/c in their place and never look-alikes; sentence case
  for headings and tool names; quotes „…“ (U+201E … U+201C); no space before `:` `;` `?` `!`; dash
  " — " with spaces like English; no apostrophe contractions ("nuk ka", not the s' form); a value
  with an ASCII apostrophe is double-quoted in the data file. Plurals (L-PLURAL, D-PLURAL-FORMS):
  CLDR gives `Intl.PluralRules('sq')` exactly `one, other` (`one` is exactly the integer 1; 0,
  fractions, 2, 21, 100 and 1000000 select `other`, unlike Hindi and French), so a plural value is
  `{one, other}`: `one` = singular indefinite ("{count} hap", "{count} numër i thjeshtë"), `other` =
  plural indefinite ("{count} hapa", "{count} numra të thjeshtë"), every placeholder in both and the
  count never replaced by a word. Numerals (L-DIGITS): ASCII digits only with English's comma
  grouping and dot decimal — never Albanian's own space grouping (16 777 216) or comma decimal
  (16,8); every value carries exactly its English value's numerals (DIGIT-PARITY, NATIVE-DIGIT);
  scale words: milion / miliard / trilion ("16.8 milionë"). Grammar (D-GRAMMAR-sq): gender, number,
  definiteness and case agree with the noun actually named; a suffix is never attached to a
  placeholder, a number, a Latin token or a name passed through a placeholder — a head noun
  carries the case instead ("numri {n}", "hapi {index}", "moduli {m}"); Alice and Bob in an
  oblique role go through "pala / palës" ("çelësi publik i palës {0}", "i dërgohet palës Bob"),
  Eve through "sulmuesja / sulmueses" ("sulmueses Eve"); a nominative subject uses the bare name;
  acronyms stand in apposition ("çelësi RSA", "algoritmi RSA"); the numeral precedes the noun
  ("{count} hapa"); a frame and the words fed into its slot are translated together. Names
  (D-NAMES): Alice, Bob, Eve, acronyms (RSA, AES, DH, CRT, QFT, ECDH, OAEP, DSA), code
  identifiers (BigInt, pointAdd, scalarMul, qInv, dP, dQ, kG, aG, bG, aB, bA, Math.random), file
  formats and Blowfish stay as in English; Euklidi (gen. Euklidit) and Eratosteni (gen.
  Eratostenit) are the established Albanian forms; Euler, Fermat, Shor and Cayley keep their
  spelling and take the Albanian genitive ending (Eulerit, Fermatit, Shorit, Cayley-t, hyphen only
  after the final y); Venn, Bézout, Diffie-Hellman, Miller-Rabin, Hasse, Garner, Fourier,
  Fibonacci, Sun Tzu and ElGamal stand uninflected in apposition ("diagrami Venn", "koeficientët
  Bézout", "testi Miller-Rabin"). gcd/lcm (D-GCD): `gcd(` / `lcm(` stay literal inside formulas;
  where the ro value of the same key localizes the notation or the prose noun, sq uses `PMP(` /
  `SHVP(` in the same positions; prose noun "pjesëtuesi më i madh i përbashkët (PMP)" and
  "shumëfishi më i vogël i përbashkët (SHVP)", the abbreviations only in space-constrained
  labels. Modulus (D-MOD): `mod` stays literal; "moduli" (prose "modulo n": "sipas modulit n").
  Spellings never used (left) and the chosen form (right) (D-AVOID): nje / eshte / jane / kete /
  keto / cdo / per / numer / celes(i/at/in) / pjesetues(i) / shumezim(i) (ASCII-folded) → një /
  është / janë / këtë / këto / çdo / për / numër / çelës… / pjesëtues… / shumëzim…; algorithm /
  algoritem → algoritëm (algoritmi); modulo → sipas modulit; numri prim / numrat prim / numër prim →
  numër i thjeshtë (prime is "i thjeshtë"). Identical-to-English (D-SAME): prefer a natural
  non-identical rendering; an identical value is acceptable only under an existing reasoned
  allowSame entry (sqm.linkDiffieHellman, rsa.thBit "bit"). Keyboard names (D-KEYS): Enter stays
  Enter, Space is "Hapësirë". Font (L-FONT): ë Ë ç Ç are Latin-1 letters inside the latin subset of
  the Google Fonts every page already loads (Source Serif 4, Source Sans 3, JetBrains Mono — the
  subset that already serves French ç and Dutch ë), so no font link, `@font-face` or `font-family`
  change is made. Direction (L-LTR): left to right; sq is not in RTL_LANGS and its values carry no
  U+2066–U+2069 isolate, U+200E/U+200F mark or U+202A–U+202E embedding (BIDI-MARK). Tool names
  (D-TOOLS) are the sq column of (b); core terms (D-TERMS) the sq column of (c). Added 2026-10-07
  by quick task 261007-k4o.
- **Swahili (sw) `[ASSUMED]`:** a left-to-right Latin-script language; Kiswahili sanifu
  (Standard Swahili, BAKITA/TUKI conventions), no Sheng and no English code-mixing
  (L-STANDARD). English is the source of truth (L-SOURCE): every value is translated from its en
  entry, never derived from another language's block. Register (D-REGISTER-sw): singular
  imperative for instructions and buttons (bofya, chagua, ingiza, andika, tazama, jaribu,
  buruta, bonyeza, sogeza; Cheza, Sitisha, Weka upya, Tengeneza, Futa, Ongeza, Hamisha, Tendua,
  Rudia), validation messages that state the problem (… lazima iwe …), status banners in the
  perfect or stative (Zimepatikana …, Imekamilika). Orthography (D-ORTHO-sw): plain ASCII
  letters; the ng' digraph keeps the ASCII apostrophe U+0027 where a word needs it (the value is
  then double-quoted in the data file); sentence case; quotes “…” (U+201C … U+201D); no space
  before `:` `;` `?` `!`; dash " — " with spaces. Plurals (L-PLURAL, D-PLURAL-FORMS): CLDR gives
  `Intl.PluralRules('sw')` exactly `one, other` (`one` is exactly the integer 1; 0, fractions, 2,
  21, 100 and 1000000 select `other`), so a plural value is `{one, other}`: `one` = singular
  class form ("ufunguo {count}", "kigawo {count}"), `other` = plural class form ("funguo {count}",
  "vigawo {count}"); for class 9/10 nouns (hatua, namba) the two forms coincide, which is allowed;
  every word that agrees with the counted noun agrees in each form and every placeholder stays in
  both. Numerals (L-DIGITS): ASCII digits only with English's comma grouping and dot decimal — no
  space or dot grouping, no comma decimal; every value carries exactly its English value's numerals
  (DIGIT-PARITY, NATIVE-DIGIT); scale words milioni / bilioni / trilioni with the numeral after the
  word as Swahili requires ("milioni 16.8"). Grammar (D-GRAMMAR-sw): noun-class agreement
  (connector -a, adjectives, demonstratives, verb subject and object prefixes) follows the noun
  actually named; numerals follow the noun ("hatua {count}", "namba tasa {count}"); ordinals are
  "hatua ya {index}"; names and placeholders never change form; a possessive uses the connector of
  the possessed noun's class ("ufunguo wa umma wa {0}", "jozi ya funguo ya {0}"); frames and slot
  words are translated together, a slot of unknown class using a label form ("… : {word}") or a
  construction whose agreement does not depend on the slot. Names (D-NAMES): Alice, Bob, Eve,
  acronyms, code identifiers, file formats and Blowfish stay as in English; eponyms keep their
  original spelling, uninflected (Swahili has no case), linked by the connector of the head noun
  ("Chujio la Eratosthenes", "Algorithimu ya Euclid", "Mbinu ya Fermat", "Jedwali la Cayley",
  "Mchoro wa Venn", "vigawo vya Bézout"). gcd/lcm (D-GCD): `gcd(` / `lcm(` stay literal inside
  formulas; where the ro value of the same key localizes the notation or the prose noun, sw uses
  `KKS(` / `KDS(` in the same positions; prose noun "kigawo kikubwa cha shirika (KKS)" and
  "kigawe kidogo cha shirika (KDS)", the abbreviations only in space-constrained labels. Modulus
  (D-MOD): `mod` stays literal; "moduli" (prose "modulo n": "kwa moduli n"). Spellings never used
  (left) and the chosen form (right) (D-AVOID): nambari → namba; algorithm / algorithmu /
  algoriti / algorizimu → algorithimu; changamano ("complex", not composite) and shufwa ("even")
  → namba shirikishi; namba kuu → namba tasa (prime). Identical-to-English (D-SAME): prefer a
  natural non-identical rendering; an identical value is acceptable only under an existing
  reasoned allowSame entry (sqm.linkDiffieHellman); "bit" is "biti". Keyboard names (D-KEYS):
  Enter stays Enter, Space is "Nafasi". Font (L-FONT): plain ASCII letters in the existing
  webfonts, no font change. Direction (L-LTR): left to right; sw is not in RTL_LANGS and its
  values carry no bidi isolate, mark or embedding. Tool names (D-TOOLS) are the sw column of (b);
  core terms (D-TERMS) the sw column of (c). Added 2026-10-07 by quick task 261007-k4o.
- **Chinese (zh) `[ASSUMED]`:** Simplified Chinese (Mandarin, mainland standard), a
  left-to-right language written in Han characters and rendered in the browser's system
  fallback font; label 中文 (L-ZH). English is the source of truth (L-SOURCE): every value is
  translated from its en entry, never derived from the Japanese or Korean block. Script
  (L-SCRIPT): Han characters plus CJK punctuation; apart from the notation allow-list in
  `i18n-check.js`'s `SCRIPT_RULES` (mod, gcd/lcm where a key keeps them literal, single-letter
  variables, acronyms such as RSA, code identifiers, Alice/Bob/Eve) every word is Han — no
  kana, no Hangul, no katakana middle dot or prolonged sound mark (SCRIPT-FOREIGN,
  SCRIPT-LATIN, SCRIPT-MISSING); the checker tokenises by script runs, never by whitespace,
  because Chinese is written without spaces between words. Simplified forms only: Traditional
  forms and Japanese shinjitai whose Simplified form differs (HAN_FORM_FORBIDDEN.zh, e.g. 質
  數 圖 單 図 実) are HAN-FORM findings (D-HANFORM). Detection: every Chinese browser tag (zh,
  zh-CN, zh-SG, zh-Hans, zh-TW, zh-HK, zh-Hant, zh-Hant-TW; any case, `-` or `_`) resolves to
  zh, so Traditional-script readers get Simplified Chinese rather than English; the code
  allow-list for `setLang`, `?lang=` and storage stays exact and case-sensitive (zh-CN, zh-Hans
  and ZH are rejected there). Register (D-REGISTER-zh): second person 你 only when a pronoun is
  needed at all; instructions as plain imperatives (点击、选择、输入、拖动、按、查看、试试);
  buttons as verbs or verb-object phrases (播放、暂停、重置、生成、清空、添加、撤销、重做);
  validation states the problem (请输入……, ……必须是……); status banners in the perfective
  (已找到……, 已完成). Punctuation (D-PUNCT): prose uses full-width ，。：；？！（） and the
  enumeration comma 、, quotes “…” (U+201C, U+201D), ellipsis …… (two U+2026) and the dash ——
  (two U+2014, no spaces) for an English " — "; an ASCII `, . ; : ? !` never directly follows a
  Han character (CJK-ASCII-PUNCT); formulas, numerals, coordinate/argument tuples and a
  parenthetical whose content is only Latin letters, digits, placeholders or operators keep
  ASCII punctuation and ASCII parentheses (FULLWIDTH-FORMULA); the playback glyphs and legend
  slots ({0} Prime, ▶ Play) keep their space as in English. Spacing (D-SPACING): exactly one
  ASCII space between a Han character and an adjacent Latin or Greek letter, ASCII digit or
  {placeholder}, on both sides (使用 RSA 加密, 第 {index} 步, 欧拉 φ 函数, 2048 位), and none
  next to full-width punctuation (ZH-SPACING). Plurals (L-PLURAL, D-COUNTERS): Chinese has the
  single CLDR category `other` (`Intl.PluralRules('zh')` reports only `other`), so a plural
  value is `{other}` alone, keeping every placeholder, and that one form reads correctly for 0,
  1 and any count: numeral + classifier + noun ({count} 个素数, {count} 步, {n} 位, {count} 次,
  {n} 毫秒). Numerals (L-DIGITS, D-NUMWORDS): ASCII digits only with English's comma grouping
  and dot decimal — no full-width digit, no CJK numeral in place of an English digit, no
  万/亿 myriad grouping after a digit; every value carries exactly its English value's numerals
  (DIGIT-PARITY, NATIVE-DIGIT, CJK-MYRIAD); where English writes a quantity in words, Chinese
  uses words (十亿次, 数百位, 数千个节点, 二进制); the English "1 trillion" is "1 万亿", the
  only scale word allowed after a digit. Names (D-NAMES): Alice, Bob, Eve, acronyms (RSA, AES,
  DH, CRT, QFT, ECDH, OAEP, DSA), code identifiers and file formats stay Latin; eponyms are
  written in Han (埃拉托斯特尼, 欧几里得, 欧拉, 费马, 凯莱, 维恩, 秀尔, 迪菲-赫尔曼, 米勒-拉宾,
  贝祖, 孙子, 哈塞, 加纳, 傅里叶, 斐波那契, 埃尔加马尔), name pairs joined by an ASCII
  hyphen-minus; pronoun 她 for Alice and Eve, 他 for Bob. gcd/lcm (D-GCD): `gcd(` and `lcm(`
  stay literal inside formulas; the prose nouns are 最大公约数 / 最小公倍数. Modulus (D-MOD):
  `mod` stays literal; modulus 模数, "modulo n" 模 n (在模 n 下), modular 模. Keyboard names
  and units (D-KEYS): 回车键, 空格键, 毫秒, 位. Spellings never used (D-AVOID): 质数, 质因数,
  质因子, 互质, 模反元素, 演算法, 位元 (except inside 单位元), 比特, 金钥, 函式, 程式, 资讯,
  预设, 讯息, 迪菲赫尔曼, 迪菲·赫尔曼, 文氏图, 肖尔, 凯利, 费尔马, 欧几里德, 埃拉托色尼 —
  the chosen forms are the zh columns of (b), (c) and (d). Identical-to-English (D-SAME): no
  value equals its English value except the four pure formula templates exempt in
  `i18n-config`. Direction (L-LTR): zh is not in RTL_LANGS and its values carry no isolate,
  bidi mark or embedding. Font (L-FONT): the system fallback font — no font link, `@font-face`
  or `font-family` change; while zh is active `<em>` is upright bold instead of a synthesized
  oblique (`assets/site.css`, D-CJK-EM). Tool names (D-TOOLS) are the zh column of (b); core
  terms (D-TERMS) the zh column of (c). Added 2026-10-07 by quick task 261007-pbf.
- **Japanese (ja) `[ASSUMED]`:** a left-to-right language written in kanji (shinjitai),
  hiragana and katakana, rendered in the browser's system fallback font; label 日本語
  (L-JAKO). English is the source of truth (L-SOURCE): every value is translated from its en
  entry, never derived from the Chinese block. Script (L-SCRIPT): Han, Hiragana and Katakana
  including the prolonged sound mark ー and the middle dot ・; apart from the notation
  allow-list (mod, gcd/lcm where kept literal, single-letter variables, acronyms, code
  identifiers, Alice/Bob/Eve) every word is Japanese — no Hangul (SCRIPT-FOREIGN) — and the
  checker tokenises by script runs because Japanese is unspaced. Japanese forms only: the
  Simplified-only forms whose shinjitai differs (HAN_FORM_FORBIDDEN.ja, e.g. 图, 关,
  钥) are HAN-FORM findings (D-HANFORM). Detection: ja, ja-JP and JA_jp (any region, any case,
  `-` or `_`) resolve to ja; the code allow-list stays exact and case-sensitive. Register
  (D-REGISTER-ja): です・ます style for prose and messages; instructions 〜してください
  (クリックしてください、選択してください、入力してください、ドラッグしてください、押してください、試してください);
  buttons as nouns (再生、一時停止、リセット、生成、クリア、追加); validation …を入力してください
  / …である必要があります; status …が見つかりました / 完了しました; no あなた. Punctuation (D-PUNCT):
  prose uses 、 and 。, full-width ：？！（）, quotes 「…」 (nested 『…』), ellipsis …… and the dash ——;
  an ASCII `, . ; : ? !` never directly follows a Japanese character (CJK-ASCII-PUNCT);
  formulas, numerals, tuples and Latin/number-only parentheticals keep ASCII punctuation and
  parentheses (FULLWIDTH-FORMULA); the playback glyphs and legend slots keep their space as in
  English. Spacing (D-SPACING): no space between a Japanese character (kanji, kana, ー) and an
  adjacent Latin or Greek letter, digit or placeholder (RSAの公開鍵, {count}個, オイラーのφ関数,
  JA-SPACING); spaces between two Latin tokens and around operators inside formulas stay as in
  English. Plurals (L-PLURAL, D-COUNTERS): `Intl.PluralRules('ja')` reports only `other`, so a
  plural value is `{other}` alone and reads correctly for every count ({count}個の素数,
  {count}ステップ, {n}ビット, {count}回, {n}ミリ秒). Numerals (L-DIGITS, D-NUMWORDS): ASCII digits
  only, exactly the English value's numerals (DIGIT-PARITY), no CJK numeral in place of a
  digit, no 万/億 grouping after a digit; quantities in words stay words (十億回, 数百桁,
  数千個のノード, 二進); "1 trillion" is "1兆", the only scale word allowed after a digit.
  Names (D-NAMES): Alice, Bob, Eve, acronyms, code identifiers and file formats stay Latin;
  eponyms in katakana or kanji (エラトステネス, ユークリッド, オイラー, フェルマー, ケイリー, ベン,
  ショア, ディフィー・ヘルマン, ミラー・ラビン, ベズー, 孫子, ハッセ, ガーナー, フーリエ,
  フィボナッチ, エルガマル), name pairs joined by the katakana middle dot ・; no pronouns
  (自分の). gcd/lcm (D-GCD): literal inside formulas; prose nouns 最大公約数 / 最小公倍数.
  Modulus (D-MOD): `mod` stays literal; modulus 法, "modulo n" nを法として, modular モジュラ.
  Keyboard names and units (D-KEYS): エンターキー, スペースキー, ミリ秒, ビット. Spellings never
  used (D-AVOID): 函数, 算法 (except inside 計算法), 復号化, モジュロ, プライム, キーペア,
  秘密キー, 公開キー, ディフィーヘルマン, ユークリッド互除法, エラトステネスのふるい, ケーリー,
  フェルマ (without ー), オイラ (without ー), ショアー — the chosen forms are the ja columns of
  (b), (c) and (d). Identical-to-English (D-SAME), direction (L-LTR: not in RTL_LANGS, no
  bidi controls) and font (L-FONT: system fallback font, upright-bold `<em>` per D-CJK-EM) as
  for zh. Tool names (D-TOOLS) are the ja column of (b); core terms (D-TERMS) the ja column of
  (c). Added 2026-10-07 by quick task 261007-pbf.
- **Korean (ko) `[ASSUMED]`:** a left-to-right language written in Hangul only (no hanja, no
  kana) with spaces between words, rendered in the browser's system fallback font; label
  한국어 (L-JAKO). English is the source of truth (L-SOURCE): every value is translated from
  its en entry, never derived from the Chinese or Japanese block. Script (L-SCRIPT): Hangul;
  apart from the notation allow-list (mod, gcd/lcm where kept literal, single-letter
  variables, acronyms, code identifiers, Alice/Bob/Eve) every word is Hangul — Han, kana, the
  katakana middle dot and prolonged sound mark are SCRIPT-FOREIGN; a Latin token with an
  attached particle (RSA를, 12단계) is correct text, so SCRIPT-MIXED does not count the CJK
  scripts. Detection: ko, ko-KR and KO_kp resolve to ko; the allow-list stays exact and
  case-sensitive. Register (D-REGISTER-ko): 합니다체 for prose, messages and status (…합니다,
  …했습니다); instructions in the polite -세요 form (클릭하세요, 선택하세요, 입력하세요, 드래그하세요,
  누르세요, 시도해 보세요); buttons as nouns (재생, 일시 정지, 초기화, 생성, 지우기, 추가);
  validation …해야 합니다; no 당신. Punctuation (D-PUNCT): Western punctuation exactly like
  English (. , ? ! : ; ( ) and " — " with spaces, quotes “…”, ellipsis …) and never a
  full-width or CJK punctuation mark (FULLWIDTH-FORM). Spacing (D-SPACING, D-PARTICLES-ko):
  standard Korean word spacing; particles, the copula and counters attach directly to the
  preceding word, Latin token, digit or placeholder (RSA를, 12단계, {count}개); a
  sound-dependent particle (은/는, 이/가, 을/를, 와/과, (으)로) is never attached directly to a
  placeholder, whose final sound is unknown (KO-PARTICLE) — a noun after the placeholder
  carries it ({n} 값을, {count}단계를) or an invariant particle is used (의, 에, 에서, 에게, 도,
  만, 까지, 부터, 보다); 을(를) is not used; after a literal Latin token the particle follows
  its Korean reading (Alice 앨리스, Eve 이브, RSA, DH, ECDH, CRT, QFT and the letters p q e d g
  a b x y k G A B take 가/는/를/와/로; Bob 밥 and the letters n m N r l take 이/은/을/과/으로).
  Plurals (L-PLURAL, D-COUNTERS): `Intl.PluralRules('ko')` reports only `other`, so a plural
  value is `{other}` alone and reads correctly for every count (소수 {count}개, {count}단계,
  {n}비트, {count}번, {n}밀리초). Numerals (L-DIGITS, D-NUMWORDS): ASCII digits only, exactly the
  English value's numerals (DIGIT-PARITY), no 만/억 grouping after a digit; quantities in words
  stay words (십억 번, 수백 자리, 수천 개의 노드, 이진); "1 trillion" is "1조". Names
  (D-NAMES): Alice, Bob, Eve, acronyms, code identifiers and file formats stay Latin; eponyms in
  Hangul (에라토스테네스, 유클리드, 오일러, 페르마, 케일리, 벤, 쇼어, 디피-헬먼, 밀러-라빈, 베주,
  손자, 하세, 가너, 푸리에, 피보나치, 엘가말), name pairs joined by an ASCII hyphen-minus; no
  pronouns (자신의). gcd/lcm (D-GCD): literal inside formulas; prose nouns 최대공약수 /
  최소공배수. Modulus (D-MOD): `mod` stays literal; modulus 법, "modulo n" n을 법으로 하여,
  modular 모듈러. Keyboard names and units (D-KEYS): 엔터 키, 스페이스 키, 밀리초, 비트.
  Spellings never used (D-AVOID): 프라임, 알고리듬, 디피헬먼, 디피-헬만, 공개키, 개인키, 비밀키,
  모듈로, 에라토스테네스 체 (without 의), 유클리드 알고리즘 — the chosen forms are the ko
  columns of (b), (c) and (d). Identical-to-English (D-SAME) and direction (L-LTR) as for zh.
  Font (L-FONT): the system fallback font; `<em>` is upright bold (D-CJK-EM) and, while ko is
  active, `assets/site.css` sets `word-break: keep-all` with `overflow-wrap: break-word`
  (D-KO-BREAK) so Korean wraps between words, never inside them. Tool names (D-TOOLS) are the
  ko column of (b); core terms (D-TERMS) the ko column of (c). Added 2026-10-07 by quick task
  261007-pbf.
- **Indonesian (id) `[ASSUMED]`:** a left-to-right language written in the Latin script with plain
  ASCII letters, in the browser's existing Google Fonts (L-FONT: no font link, `@font-face` or CSS
  change); label Bahasa Indonesia, the 25th switcher option after 한국어. English is the source of
  truth (L-SOURCE): every value is translated from its en entry, never adapted from another
  language's block (in particular never a Malay-looking, Dutch, Albanian or Swahili phrasing).
  Standard (L-STANDARD): bahasa Indonesia baku, EYD Edisi V (the 2022 successor of PUEBI) and KBBI
  baku forms, the formal register of Indonesian school mathematics; never Malaysian/Brunei Malay
  vocabulary, pre-1972 spelling, slang or English code-mixing. Orthography (L-ORTHO, D-ORTHO): plain
  ASCII letters; a non-ASCII letter only where the English value has it (Bézout, ℕ, Greek
  variables) or as φ in the totient name; silakan, mengubah, praktik, analisis, sistem, kuadrat,
  objek, tampak, izin, risiko, detail, teknik, sekadar, di mana, mengalikan; the prepositions di and
  ke are written apart (di layar, ke kanan), the prefixes di- and ke- attached (dihitung, keadaan),
  and the ordinal ke- takes a hyphen before a numeral or placeholder (langkah ke-3, langkah
  ke-{index}). Titles, headings, nav labels, hub card titles and tab labels whose English is in
  Title Case use Indonesian title case (every word capitalized except dan, di, ke, dari, untuk,
  yang, atau, dengan, pada, dalam, antara); buttons, field labels, legend entries and sentences use
  sentence case. Direction (L-LTR): left to right, not in RTL_LANGS, no isolates, marks or
  embeddings; switching from he or ar removes dir. Detection (L-DETECT): id, id-ID and ID_id (any
  region, any case, - or _) resolve to id through the two-letter path; the legacy tag in (in,
  in-ID, IN_id) maps to id in browser detection only, like iw to he and no to nb, and in is never an
  accepted code on setLang, ?lang=, cookie or storage; inh (Ingush), ind, ms, jv, su and en-ID are
  not mapped. Punctuation (D-PUNCT): as English (quotes “…” with nested ‘…’, no space before
  : ; ? !, the dash spaced exactly as in the English value, ellipsis …). Grammar (D-GRAMMAR):
  head-initial noun phrases (kunci publik Alice); possession by juxtaposition, never an
  apostrophe-s (Rahasia Alice =); no suffix (-nya, -lah, -kah, -pun) and no prefix other than the
  ordinal ke- on a placeholder, numeral, Latin token or name (put a head noun in front: nilai {n},
  bilangan {n}, kunci {0}); a numeral precedes its noun with no reduplication and no classifier
  ({count} bilangan prima, {count} langkah, {n} bit); a frame and the words fed into its slot are
  translated together. Plurals (L-PLURAL, D-PLURAL-FORMS): `Intl.PluralRules('id')` reports only
  `other`, so a plural value is `{other}` alone, keeps every placeholder of the English other form
  and reads correctly for every count (Hanya {count} kotak, {count} langkah). Numerals (L-DIGITS,
  D-NUMWORDS): ASCII digits only with the English comma grouping and dot decimal (16.8 juta, never
  16,8 juta; 1,000, never 1.000), exactly the English value's numerals (DIGIT-PARITY; id is in
  DIGIT_PARITY_LANGS); scale words juta, miliar, triliun follow the digit; quantities written in
  words stay words (satu miliar kali, ratusan digit, ribuan simpul, nol, biner). Names (D-NAMES):
  Alice, Bob, Eve, acronyms, code identifiers, file formats and Blowfish stay as in English;
  eponyms keep their original spelling (Eratosthenes, Euler, Fermat, Cayley, Venn, Shor,
  Diffie-Hellman, Miller-Rabin, Bézout, Hasse, Garner, Fourier, Fibonacci, ElGamal, Sun Tzu,
  Sunzi Suanjing) with Euklides the established Indonesian form of Euclid; Chinese (country and
  people) is Tiongkok, never Cina. gcd/lcm (D-GCD): literal inside formulas; prose nouns faktor
  persekutuan terbesar (FPB) and kelipatan persekutuan terkecil (KPK). Modulus (D-MOD): `mod`
  stays literal, modulus is modulus, "modulo n" stays modulo n, modular stays modular. Keys and
  units (D-KEYS): Enter and Delete as printed, Space is Spasi, ms and s stay, milidetik and detik
  in words, bit has no plural. Spellings never used (D-AVOID): the Malay forms nombor, perdana,
  baki, bahagi, pembahagi, darab, songsang, awam, peribadi, kekunci, padam, papar, skrin, tetikus,
  sifar, gandaan, pekali, nisbah, perduaan, kuasa, teorem, kebarangkalian, set semula, faktor
  sepunya, kunci awam; the non-baku spellings silahkan, merubah, dirubah, praktek, analisa, sistim,
  kwadrat, obyek, nampak, ijin, resiko, detil, tehnik, sekedar, mengkalikan, dimana, kemana,
  darimana, disini, disitu, algoritme; the English forms algorithm, plaintext, ciphertext, brute
  force, generator, totient; and Cina. Identical-to-English (D-SAME): only cayley.equationCaption,
  rsa.lblQInv, sqm.stepSquareFormula and sqm.stepMultiplyFormula (formula templates),
  cayley.nLabel, wheel.nLabel, wheel.nRangeLabel, crt.modulusLabel and sqm.modLabel (modulus is
  the Indonesian term), rsa.thBit (bit) and sqm.linkDiffieHellman; every other exempt key gets a
  natural non-identical word. Tool names (D-TOOLS) are the id column of (b); core terms
  (D-TERMS) the id column of (c). Added 2026-10-08 by quick task 261008-0h2.
- **Standard Moroccan Tamazight (zgh-Latn, zgh-Tfng) `[ASSUMED]`:** Standard Moroccan Tamazight (IRCAM
  standard, ISO 639-3 zgh) in two scripts, the same text twice: zgh-Latn (IRCAM Latin transcription,
  switcher label Tamaziɣt) and zgh-Tfng (IRCAM Tifinagh, label ⵜⴰⵎⴰⵣⵉⵖⵜ), the 26th and 27th switcher
  options after Bahasa Indonesia. Both are left to right (L-LTR): neither is in RTL_LANGS, no isolates,
  `<html lang>` takes the full code (zgh-Latn or zgh-Tfng) and switching from he or ar removes dir. The
  codes are a new shape, a three-letter primary subtag plus a script subtag, matched exactly and
  case-sensitively on every channel like pt-BR/pt-PT (zgh, zgh-latn, ZGH-Latn, zgh_Latn, zgh-Latn-MA,
  tzm, ber, kab and shi are rejected). Detection (L-DETECT): a browser tag whose primary subtag is zgh,
  tzm or ber (any case, - or _) resolves to zgh-Latn when it carries a Latn script subtag and to
  zgh-Tfng otherwise (Tifinagh is the official script of zgh); kab, shi and rif are not mapped; the
  zgh/tzm/ber test runs on the whole first subtag before the two-letter fallback, so zg, zgx, zghx, tz,
  tzmx, be, bem and berx fall through to English as before. Side effect, accepted: Central Atlas tzm and
  the collective Berber tag ber (also sent by some Algerian stacks, e.g. ber-DZ) now default to
  Moroccan Standard Tamazight in Tifinagh until the visitor chooses otherwise. Orthography (D-ORTHO):
  the IRCAM Latin letters a b c č d ḍ e ɛ f g ǧ ɣ h ḥ i j k l m n q r ṛ s ṣ t ṭ u w x y z ẓ and the
  labialization mark ʷ only after g or k, NFC with precomposed ḍ ḥ ṛ ṣ ṭ ẓ, ɛ U+025B and ɣ U+0263 (a
  Greek ε or γ look-alike is rejected; ZGH-LETTER); no o, p or v (loans adapt o to u, p to b, v to f:
  Baris); the schwa e only where IRCAM writes it (aseklu, imḍanen); clitics and prepositions are
  separate words with no hyphens (ur t igi, rnu as); nouns take the annexed state after n, s, g, ɣf, sg,
  d (with), i, ar, zund and after numerals; a sentence, title, heading, button, label and every proper
  name start with a capital letter (Tifinagh has no case). Source (L-SOURCE, D-DERIVE): zgh-Latn is
  translated from the English entry; zgh-Tfng is never typed but derived from it letter by letter by
  the IRCAM one-to-one table, copying placeholders, digits, punctuation, the keep list and non-IRCAM
  notation, and keeping a single IRCAM letter Latin where the English value uses that letter as
  notation (n, d, s, g and t are also IRCAM clitics, so each is reviewed); `i18n-check.js` enforces
  the equality permanently with ZGH-TRANSLIT (alignment) and ZGH-NOTATION (the Latin single letters
  equal the English value's notation letters). Names (L-NAMES, D-NAMES): Alice, Bob, Eve, acronyms
  (RSA, AES, DH, DSA, CRT, QFT, OAEP, PNG, SVG, PDF), code identifiers (BigInt, pointAdd, scalarMul,
  qInv, dP, dQ, kG, aG, bG, aB, bA), gcd, lcm, mod, log, Blowfish, ms and the key-cap names Enter,
  Space and Delete stay Latin in both scripts; eponyms are adapted to IRCAM Latin and transliterated:
  Uklid (Euclid, as on the zgh Wikipedia, `[CITED]`), Iratustin, Ulir, Firma, Kayli, Fin, Cur,
  Difi-Hilman, Bizu, Lgamal, Milr-Rabin, Garnr, Furyi, Fibunači, Has; Sun Tzu is unchanged; Chinese is
  aṣinwi and China Ṣṣin. Script guards (L-SCRIPT): Tifinagh inside a zgh-Latn value is ZGH-LETTER;
  IRCAM Latin letters, a non-IRCAM Tifinagh letter (including the consonant joiner U+2D7F) or a
  misplaced ⵯ inside zgh-Tfng is SCRIPT-FOREIGN; Tifinagh inside a ru, el, he, hi, ar, zh, ja or ko
  value is SCRIPT-FOREIGN; a letter run mixing Tifinagh with Latin is SCRIPT-MIXED. Punctuation
  (D-PUNCT): Latin punctuation identical in both scripts; quotes are «…» without inner spaces, never
  " ' “ ” ‘ ’; no space before : ; ? !; the dash spaced exactly as in the English value; ellipsis
  … as in English. Grammar (D-GRAMMAR): head-initial noun phrases with agreement (tasarut tamatayt n
  Alice); possession with n, never an apostrophe; no affix on a placeholder, numeral, keep-list token
  or name (put a head noun in front: azal n {n}, amḍan {n}); the one form is the singular with the
  annexed noun ({count} umḍan amnzu), the other form is n plus the plural ({count} n imḍanen imnza);
  a frame and the words fed into its slot are translated together. Plurals (L-PLURAL,
  D-PLURAL-FORMS): `Intl.PluralRules` has no zgh data and falls back to the runtime's default locale,
  so NT.i18n fixes the rule itself (FIXED_PLURAL_LANGS): one for exactly 1, other for everything else;
  every plural value is `{one, other}`, other carries every placeholder of the English other form.
  Numerals (L-DIGITS, D-NUMWORDS): ASCII digits only with the English comma grouping and dot decimal
  (16.8 mlyun), exactly the English value's numerals (DIGIT-PARITY; both codes are in
  DIGIT_PARITY_LANGS); scale words mlyun, mlyar, trilyun follow the digit; a quantity English writes
  in words stays words (mraw d smmus, yan umlyar n tikkal, timiḍiwin, igiman, ẓiru). gcd/lcm (D-GCD):
  literal inside formulas, prose nouns anbḍay amqran amcrik and amsgut amẓẓan amcrik. Modulus
  (D-MOD): `mod` stays literal, modulus is amuḍul, modular amuḍulan. Keys and units (D-KEYS): Enter,
  Space and Delete only in venn.picker.hint; ms stays, milisgund and tisinin in words, bit is abit
  (pl. ibitn). Spellings never used (D-AVOID): the Kabyle-only forms yiwen/yiwet, deg, fren, acu,
  ɣef/ɣer, any English leftover, Arabic or French words in their own spelling and uppercase
  acronyms off the keep list. Identical-to-English (D-SAME): only cayley.equationCaption,
  rsa.lblQInv, sqm.stepSquareFormula and sqm.stepMultiplyFormula (formula templates); every other
  exempt key gets a natural non-identical rendering (amuḍul for the modulus labels, abit for
  rsa.thBit, the Amsnfl n tsura n Difi-Hilman title for sqm.linkDiffieHellman). Font (L-FONT): the
  system fallback font only, no font link, `@font-face` or CSS change; a visitor's machine without a
  Tifinagh font shows missing-glyph boxes, which the site deliberately does not work around (the test
  machine has Noto Sans Tifinagh, so every zgh-Tfng screenshot is checked glyph by glyph). Tool names
  (D-TOOLS) are the zgh-Latn column of (b); core terms (D-TERMS) the zgh-Latn column of (c);
  proper nouns the zgh-Latn column of (d). Added 2026-10-08 by quick task 261008-e2j.
- **Kurmanji Kurdish (ku) `[ASSUMED]`:** Kurmanji (Northern Kurdish, ISO 639-3 kmr) in the Latin Hawar alphabet, switcher label Kurmancî, the 28th switcher option after the two Tamazight scripts. Left to right (L-LTR): not in RTL_LANGS, no isolates (KU-ISOLATE), `<html lang="ku">` and switching from he, ar or ckb removes dir. The code ku is a plain two-letter code, matched exactly and case-sensitively like every other code (KU, Ku, kmr, kur, ku-TR, ku-Latn, ku-Arab are rejected). Detection (L-DETECT): a browser tag whose primary subtag is kmr (any subtags) maps to ku, and every other ku tag (ku, ku-TR, ku-Latn, ku-IQ, ku-IR) reaches ku through the two-letter fallback; a ku tag carrying an Arab script subtag goes to Sorani (ckb) instead; sdh (Southern Kurdish) and lki are not mapped. Accepted, asserted collisions of the two-letter fallback once ku is supported: kur (ISO 639-2 Kurdish, intended), kur-Arab (only the ku primary subtag is checked for Arab), kum (Kumyk) and kua (Kuanyama) now default to Kurmanji. Alphabet (L-SCRIPT-KU, KU-LETTER): a b c ç d e ê f g h i î j k l m n o p q r s ş t u û v w x y z, NFC precomposed ç ê î ş û (ş is U+015F, never the Romanian ș U+0219; no Turkish ı, ğ, ö, ü); any other non-ASCII letter only when the English value has it (Bézout), and φ is always allowed. Orthography (D-ORTHO-KU): Hawar spelling of the pinned forms (algorîtm, fonksiyon, kilît, şîfre, matematîk, îzomorfîzm, elîptîk); ezafe by gender and number (hejmara seretayî, razê hevpar, kilîtên giştî) and the free linker ya/yê/yên after a token that cannot take the suffix (fonksiyona φ ya Euler); oblique plural -an; sentence-initial capital only, nationality adjectives lowercase (çînî). Punctuation (D-PUNCT): English punctuation; quotes are «…» without inner spaces, never " ' “ ” ‘ ’ (QUOTE-STYLE); no space before : ; ? !; the dash spaced exactly as in the English value; ellipsis … as in English. Grammar (D-GRAMMAR): never an affix on a placeholder, numeral, Latin token or name (put a head noun in front: hejmara {n}, kilîta {0}); possession by ezafe (kilîta giştî ya Alice); a frame and the words fed into its slot are translated together. Plurals (L-PLURAL, D-PLURAL-FORMS): `Intl.PluralRules` has CLDR data for ku (one for exactly 1, other for 0, 1.5, 2, 21, 100 and 1000000), so every plural value is `{one, other}` with no FIXED_PLURAL_LANGS entry; Kurdish counts take the singular noun after a numeral, so one and other may read the same, and other carries every placeholder of the English other form. Numerals (L-DIGITS, D-NUMWORDS): ASCII digits only with the English comma grouping and dot decimal (16.8 milyon), exactly the English value's numerals (DIGIT-PARITY; ku is in DIGIT_PARITY_LANGS); scale words milyon, milyar, trîlyon follow the digit; a quantity English writes in words stays words (panzdeh, sedan, hezaran, sifir). Names (D-NAMES): Alice, Bob, Eve, acronyms and code identifiers stay Latin; every eponym keeps its usual Latin spelling except Euclid, which is Euklîd (EPONYM-SPELLING). gcd/lcm (D-GCD): literal inside formulas, prose nouns dabeşkerê hevpar ê herî mezin and pirjimara hevpar a herî biçûk, never uppercase GCD or LCM (KU-GCD). Modulus (D-MOD): `mod` stays literal, modulus is modul, modular modulî, "modulo n" li gorî modulê n. Keys and units (D-KEYS): Enter, Space and Delete only in venn.picker.hint (KEY-NAME), ms stays, bits are bît; "Delete all" and "Enter an integer" are verbs and are translated. Spellings never used (D-AVOID): algoritm, algorîtim, fonksîyon, kilîd, şifre, matematik, hêjmar, izomorf, eliptik, English leftovers (ENGLISH-WORD) and uppercase acronyms off the keep list (KU-ACRONYM). Identical-to-English (D-SAME): only cayley.equationCaption, rsa.lblQInv, sqm.stepSquareFormula and sqm.stepMultiplyFormula (formula templates); every other exempt key gets a natural non-identical rendering (modul for the modulus labels, bît for rsa.thBit, Danûstandina kilîtan a Diffie-Hellman for sqm.linkDiffieHellman). Font (L-FONT): the Latin-1 and Latin Extended-A letters are covered by the existing webfonts. Tool names (D-TOOLS) are the ku column of (b); core terms (D-TERMS) the ku column of (c); proper nouns the ku column of (d). Added 2026-10-08 by quick task 261008-k7u.
- **Sorani Kurdish (ckb) `[ASSUMED]`:** Sorani (Central Kurdish, ISO 639-3 ckb) in the Kurdish Arabic-based alphabet, switcher label کوردی, the 29th switcher option and the third right-to-left language on this site after Hebrew and Arabic (L-RTL). ckb joins RTL_LANGS next to he and ar, so `<html lang="ckb" dir="rtl">`, every existing `:root[dir="rtl"]` rule applies unchanged and BIDI-FORMULA covers ckb. The code ckb is the first plain three-letter code (L-SHAPE), matched exactly and case-sensitively on every channel like pt-BR/pt-PT and zgh-Latn/zgh-Tfng (CKB, Ckb, ckb-IQ, ckb_IQ, kmr, sdh are rejected). Detection (L-DETECT): a browser tag whose primary subtag is ckb (any region, script or case, - or _) resolves to ckb, and so does a ku tag carrying an Arab script subtag (ku-Arab, ku-Arab-IQ); the branch runs on the whole first subtag directly after the Tamazight branch and before the two-letter fallback, so ck, ckbx and kmrx fall through to English as before. Accepted collision: ckb-Latn gives ckb (any ckb tag is Sorani). Alphabet (L-SCRIPT-CKB): exactly the 33 letters of the Kurdish Arabic-based alphabet ئ ا ب پ ت ج چ ح خ د ر ڕ ز ژ س ش ع غ ف ڤ ق ک گ ل ڵ م ن ھ ە و ۆ ی ێ (ک U+06A9, ی U+06CC, ە U+06D5, ھ U+06BE for h; û is written وو). ARABIC-LETTER is therefore per language: for ckb it rejects every Arabic-script letter outside those 33 (Arabic ك U+0643, ي U+064A, ى U+0649, ة U+0629, ه U+0647, the hamza seats أ إ آ ؤ ء and the Arabic-only consonants ث ذ ص ض ط ظ), and the message names the Kurdish letter to write; for ar and every other language the rule is unchanged (Arabic still rejects ک ی ە). Sorani writes its vowels as letters, so harakat (TASHKEEL), tatweel (TATWEEL) and presentation forms (PRESENTATION-FORM) stay banned. Orthography (D-ORTHO-CKB): every word-initial vowel takes ئ first, word-initial r is ڕ, no word starts with ڵ (CKB-INITIAL); the ezafe ی is attached to Kurdish nouns (کلیلی گشتی), a double ی after î is written ییی-free (نھێنیی ھاوبەش); the definite ەکە and plural ەکان are attached; NFC, no zero-width character (a ZWNJ is never needed: ە and the other non-joining letters already break the join). Punctuation (D-PUNCT): ، (U+060C), ؛ (U+061B) and ؟ (U+061F) as literal characters, never ASCII , ; ? after an Arabic-script letter and never the Urdu full stop ۔ (CKB-PUNCT); full stop, colon and ! stay ASCII; ASCII punctuation stays inside formulas, numerals and token lists; quotes are «…» without inner spaces (QUOTE-STYLE). Isolates (D-ISOLATES, D-MEDIA-GLYPHS): every numeric formula, equation, comparison, fraction, mod expression and coordinate or argument tuple inside a Sorani sentence is wrapped in U+2066 … U+2069 (written in the source as escapes, never raw invisible characters) wherever the he or ar value of the same key has them (CKB-NO-ISOLATE), a Sorani phrase inside an LTR-forced box takes U+2067 exactly where both he and ar do (CKB-NO-RLI); playback glyphs ▶ ⏸ ⏭ ⏩ ↺ are not mirrored and a prose arrow is written exactly as the ar value writes it (CKB-ARROW). Grammar (D-GRAMMAR): never an affix on a placeholder, numeral, Latin token or name (put a head noun in front: ژمارەی {n}, کلیلی {0}); prepositions بە / لە / بۆ before such a token are separate words; possession by ezafe on the head noun (کلیلی گشتیی Alice); Sorani has no grammatical gender. Plurals (L-PLURAL, D-PLURAL-FORMS): `Intl.PluralRules` has CLDR data for ckb, so every plural value is `{one, other}` and other carries every placeholder of the English other form. Numerals (L-DIGITS, D-NUMWORDS): ASCII digits only with the English comma grouping and dot decimal (16.8 ملیۆن), never Arabic-Indic ٠-٩, never Extended Arabic-Indic ۰-۹ (the digits Sorani print commonly uses), never ٫ U+066B, ٬ U+066C or ، inside a numeral; exactly the English value's numerals (NATIVE-DIGIT, NATIVE-SEPARATOR, DIGIT-PARITY; ckb is in DIGIT_PARITY_LANGS); scale words ملیۆن، ملیار، تریلیۆن follow the digit; a quantity English writes in words stays words (پازدە، سەدان، ھەزاران، سفر). Names (D-NAMES): Alice, Bob, Eve, acronyms and code identifiers stay Latin; every eponym is written in Sorani script (EPONYM-SPELLING flags a Latin eponym unless the ar value of that key keeps it Latin): ئیقلیدس, ئێراتۆستینس, ئۆیلەر, فێرما, کەیلی, ڤێن, شۆر, دیفی-ھێلمان, بێزۆ, سون تزو, ئێلگەمال, میلەر-ڕابین, گارنەر, فووریێ, فیبۆناچی, ھاسە. gcd/lcm (D-GCD): literal inside formulas, prose nouns گەورەترین دابەشکەری ھاوبەش and بچووکترین چەندجارەی ھاوبەش. Modulus (D-MOD): `mod` stays literal, modulus is مۆدیول, modular مۆدیولی. Keys and units (D-KEYS): ئینتەر، سپەیس، دیلیت only in venn.picker.hint, milliseconds میلیچرکە, seconds چرکە, bits بیت. Spellings never used (D-AVOID): عدد, خوارزم, مبرهن, تابع and the alternative spellings of the pinned terms; an English word inside a value is SCRIPT-LATIN unless on the notation allow-list. Identical-to-English (D-SAME): only the four formula templates; every other exempt key gets a natural rendering following the ar value's structure. Joining (L-JOIN): Arabic-script letters are cursive, so `assets/site.css` and Fermat's style block reset `letter-spacing` for `:root[lang="ckb"]` page titles and the `.result` line as they do for ar. Font (L-FONT): ckb renders in the browser's system Arabic-script fallback font (the test machine has Noto Sans Arabic, Noto Naskh Arabic and Vazirmatn, covering all 33 letters); no font link, `@font-face` or CSS font change is made. Tool names (D-TOOLS) are the ckb column of (b); core terms (D-TERMS) the ckb column of (c); proper nouns the ckb column of (d). Added 2026-10-08 by quick task 261008-k7u.
- **Sanskrit (sa) `[ASSUMED]`:** Classical Sanskrit in Devanagari, switcher label संस्कृतम्, the 30th switcher option after the two Kurdish ones. Left to right (L-CODES): not in RTL_LANGS, no isolates, `<html lang="sa">` with no dir attribute, and switching from he, ar or ckb removes dir. The code sa is a plain two-letter code, matched exactly and case-sensitively like every other code (SA, Sa, san, sa-IN, sa_IN, sa-Deva and संस्कृतम् are rejected on every channel). Detection (L-DETECT): no new branch; sa, sa-IN, sa-Deva and the ISO 639-2 san (any case, - or _) reach sa through the existing two-letter fallback. Accepted, asserted collisions of that fallback: sat (Santali), sah (Yakut), sad (Sandawe), sag (Sango), sas (Sasak) and saq (Samburu) now default to Sanskrit. Script (L-SCRIPT-SA, SA-LETTER, SA-DANDA): SCRIPT_RULES.sa mirrors SCRIPT_RULES.hi (own = a Devanagari letter, the same foreign scripts, SCRIPT_LATIN_NOTATION for Latin tokens), but Sanskrit uses only the Classical repertoire: anusvara, visarga, the vowels अ–ऌ, ए ऐ ओ औ, ॠ ॡ, the consonants क–ह without ऩ ऱ ळ ऴ, the avagraha ऽ, the vowel signs ा–ॄ े ै ो ौ ॢ ॣ and the virama (so virama-final words such as भवेत् and संस्कृतम् are fine). Unlike Hindi it has no nukta or nukta letter, no candra or short e/o (ऍ ऑ ॅ ॉ), no candrabindu ँ, no ळ, no ॐ, no Vedic accent and no abbreviation sign ॰; SA-LETTER rejects each and names the fix, and Devanagari digits stay NATIVE-DIGIT. The danda । ends a prose sentence directly after the last word, placeholder or closing bracket, followed by a space, a placeholder or the end of the value, and never stands inside a formula (SA-DANDA); ॥ is accepted but not used in UI text. Plurals (L-PLURAL, D-PLURAL-FORMS): `Intl.PluralRules` has no sa data, so sa is in FIXED_PLURAL_LANGS and the engine itself selects one for exactly 1, two for exactly 2 (the grammatical dual, FIXED_DUAL_LANGS) and other otherwise; every sa plural value is `{one, two, other}` with the singular, dual and plural of the counted noun (1 अभाज्यसङ्ख्या, 2 अभाज्यसङ्ख्ये, 5 अभाज्यसङ्ख्याः), and two and other carry every placeholder of the English other form. Orthography (D-ORTHO-SA): a class nasal with virama inside a word before a stop, never anusvara (सङ्ख्या, खण्डः, अन्तः, सम्बन्धः; the gate rule SA-ANUSVARA), anusvara before semivowels, sibilants and h (संयोगः), and a word-final m before a consonant-initial Devanagari word is anusvara (इदं पश्यतु; SA-FINAL-M) while before a vowel, a Latin token, a numeral, a placeholder or the end it stays म्; light sandhi (the modern simple-Sanskrit style): no sandhi between separate words, visarga kept before every word, full internal sandhi inside compounds. Compounds (D-COMPOUND-SA): closed (गुणनखण्डवृक्षः) except that a foreign name joins its Sanskrit head noun with a hyphen (यूक्लिड-कलनविधिः, वेन-आरेखः); buttons, chips, legends and table headers prefer a two-word phrase to a long compound, and no word without a space or hyphen exceeds 26 code points (SA-LONGWORD). Punctuation (D-PUNCT-SA): the danda । replaces the full stop (never a trailing "." and never "." after a Devanagari letter, SA-FULLSTOP); `? ! : ; ,` as in English with no space before them; quotes are ASCII double quotes, balanced (QUOTE-STYLE), and a quoted button name uses that button's own sa label; the dash and ellipsis as in English. Grammar (D-GRAMMAR): never a case ending on a placeholder, numeral, Latin token or name; the case is marked on an apposed head noun (सङ्ख्या {n}, मापाङ्कः {m}, कुञ्जिका {0}), on the quotative इति, or on a pronoun; a frame and the words fed into its slot are translated together. Numerals (L-DIGITS, D-NUMWORDS): ASCII digits only with the English comma grouping and dot decimal, never Devanagari digits, exactly the English value's numerals (DIGIT-PARITY; sa is in DIGIT_PARITY_LANGS); scale words दशलक्ष (10^6), शतकोटि (10^9), लक्षकोटि (10^12) follow the digit; a quantity English writes in words stays words (पञ्चदश, शतशः, सहस्रशः, शून्यम्). Names (D-NAMES): Alice, Bob, Eve, acronyms and code identifiers stay Latin; every other eponym is written in Devanagari without nukta (यूक्लिड, एरातोस्थेनीस, ओयलर, फर्मा, केली, वेन, शोर, डिफी-हेलमन, बेजू, सुन त्सु, एलगमाल, मिलर-राबिन, गार्नर, फूरिये, फिबोनाची, हासे; the theorem is चीनीय). gcd/lcm (D-GCD): literal inside formulas, prose महत्तमसमापवर्तकः and लघुत्तमसमापवर्त्यम्, never uppercase GCD or LCM. Modulus (D-MOD): `mod` stays literal, modulus is मापाङ्कः, "modulo n" मापाङ्कं n अनुसृत्य, modular मापाङ्कीय. Keys and units (D-KEYS): एण्टर, स्पेस, डिलीट only in venn.picker.hint, milliseconds मिलिसेकण्ड and seconds सेकण्ड in words, bits द्व्यङ्कः. Spellings never used (D-AVOID): the Hindi forms and English loans (एल्गोरि…, पैलेट, क्लिक, रीसेट, ब्राउज…, कंप्यूटर, क्रिप्टो…, इकाई, निजी, साझा, यूलर, युक्लिड and the like), Hindi grammar words (है, की, को, में, से, ने, और, नहीं …; HINDI-WORD). Identical-to-English (D-SAME): only cayley.equationCaption, rsa.lblQInv, sqm.stepSquareFormula and sqm.stepMultiplyFormula (formula templates); every other exempt key gets a Sanskrit rendering. Font (L-FONT): Sanskrit renders in the browser's system Devanagari fallback font like Hindi (the test machine has Droid Sans Devanagari, FreeSans, Noto Sans Devanagari and Noto Serif Devanagari, covering the whole repertoire); no font link, `@font-face` or CSS font change is made. Tool names (D-TOOLS) are the sa column of (b); core terms (D-TERMS) the sa column of (c); proper nouns the sa column of (d). Added 2026-10-08 by quick task 261008-qz1.
- **Latin (la) `[ASSUMED]`:** Neo-Latin scientific prose in Latin script written without macrons, switcher label Latina, the 31st switcher option. Left to right (L-CODES): not in RTL_LANGS, no isolates, `<html lang="la">` with no dir attribute. The code la is a plain two-letter code, matched exactly and case-sensitively (LA, La, lat, la-VA, la-Latn and Latina are rejected on every channel). Detection (L-DETECT): no new branch; la, la-VA, la-IT, la-Latn and the ISO 639-2 lat (any case, - or _) reach la through the existing two-letter fallback. Accepted, asserted collisions of that fallback: lad (Ladino), lag (Langi), lah (Lahnda), lam (Lamba), lav (the ISO 639-2 code of Latvian; browsers send lv, which stays lv) and a bare Latn script subtag now default to Latin (the one existing detection assertion whose expectation changes: Latn gave en before). Alphabet (L-SCRIPT-LA, LA-LETTER, LA-J): ASCII letters only; any other letter only when the English value has it (Bézout's é), and φ is always allowed; ae and oe are two letters, never æ or œ; consonantal u is written v (vel, videt, valor) and consonantal i is written i, never j (iam, maior, eius; LA-J). Plurals (L-PLURAL, D-PLURAL-FORMS): `Intl.PluralRules` has no la data, so la is in FIXED_PLURAL_LANGS and the engine itself selects one for exactly 1 and other otherwise; every la plural value is `{one, other}` (1 numerus primus, {count} numeri primi). Orthography (D-ORTHO-LA): a capital only for the first word of a sentence or label, proper names and adjectives formed from names (Euclideus, Cayleiana, Fermatiana, Vennianum, Shorianus, Sinicum); Neo-Latin technical words take regular declension (computatrum, navigatrum, bitus). Punctuation (D-PUNCT-LA): English punctuation; quotes are «…» without inner spaces, never an apostrophe or ASCII/typographic quote (Euler's is Euleri); e.g. is itself Latin and may stay. Grammar (D-GRAMMAR): never a case ending on a placeholder, numeral, Latin token or name; an apposed noun carries the case (numerus {n}, modulus {m}, clavis publica Alice, cum Bob); a frame and the words fed into its slot are translated together. Numerals (L-DIGITS, D-NUMWORDS): ASCII digits only with the English comma grouping and dot decimal, never Roman numerals in place of digits (DIGIT-PARITY; la is in DIGIT_PARITY_LANGS); scale words on the long scale like Italian: milio, miliardum, billio (billio = 10^12); a quantity English writes in words stays words (quindecim, centena, milia, zerum). Names (D-NAMES): Alice, Bob, Eve, acronyms and code identifiers stay Latin; Euclides (adjective Euclideus), Eratosthenes (genitive Eratosthenis) and Eulerus (genitive Euleri, adjective Eulerianus) are the classical forms, the -ianus adjectives are Fermatianus, Cayleianus, Vennianus and Shorianus, and the other modern names stay indeclinable (Diffie-Hellman, Bézout, Sun Tzu, ElGamal, Miller-Rabin, Garner, Fourier, Fibonacci, Hasse); the theorem is Sinicum. gcd/lcm (D-GCD): literal inside formulas, prose divisor communis maximus and minimum commune multiplum, never uppercase GCD or LCM (LA-GCD). Modulus (D-MOD): `mod` stays literal, modulus is modulus, "modulo n" modulo n, modular modularis. Keys and units (D-KEYS): Enter, Space and Delete as printed on the key, only in venn.picker.hint; the symbol ms stays, secunda in prose; bits are bitus (biti). Spellings never used (D-AVOID): gruppus, gruppa, caterva, algoritm…, isomorfism…, idemfactor, functio phi, cifrare, decifrare, encrypt…, palett…, tabula colorum, numerus primarius, computator, computer, browser, slider, English leftovers (ENGLISH-WORD) and uppercase acronyms off the keep list (LA-ACRONYM). Identical-to-English (D-SAME): only the four formula templates and the six keys whose English term is itself the Latin word (cayley.nLabel, wheel.nLabel, wheel.nRangeLabel, crt.modulusLabel, sqm.modLabel, dh.gLabel); every other exempt key gets a Latin rendering. Terms attested on la.wikipedia.org `[CITED]`: grex (a group, with elementum inversum and operatio commutativa on "Grex (mathematica)"), numerus primus, numerus compositus, theoria numerorum, Euclides, Leonhardus Eulerus and the Eratosthenes sieve on "Numerus primus", zerum for zero on "Nihil"; every other Latin term is `[ASSUMED]`. Font (L-FONT): ASCII letters are covered by the existing webfonts. Tool names (D-TOOLS) are the la column of (b); core terms (D-TERMS) the la column of (c); proper nouns the la column of (d). Added 2026-10-08 by quick task 261008-qz1.

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
(`[ASSUMED]`) was added 2026-10-06 by quick task 261006-vpp. The `ar` column (`[ASSUMED]`) was
added 2026-10-07 by quick task 261007-fhx. The `sq` and `sw` columns (`[ASSUMED]`) were
added 2026-10-07 by quick task 261007-k4o; the `hi`, `ar`, `sq` and `sw` columns equal the
`site.nav.*` values in `assets/i18n/site.js` exactly. The `zh`, `ja` and `ko` columns (`[ASSUMED]`) were
added 2026-10-07 by quick task 261007-pbf and equal the `site.nav.*` values exactly. The Indonesian column (`[ASSUMED]`) was added 2026-10-08 by quick task 261008-0h2 and equals the `site.nav.*` values exactly; its header reads `id (Indonesian)` because the first column is already the tool identifier `id`. The Standard Moroccan Tamazight columns `zgh-Latn` (IRCAM Latin transcription, `[ASSUMED]`) and `zgh-Tfng` (IRCAM Tifinagh, derived from `zgh-Latn` letter by letter) were added 2026-10-08 by quick task 261008-e2j and equal the `site.nav.*` values exactly (D-TOOLS); the `zgh-Tfng` cells are written by the plan-local gate, never by hand, and Alice-style notation (RSA, DH) stays Latin in both scripts. The Kurdish columns `ku` (Kurmanji, Latin Hawar alphabet) and `ckb` (Sorani, Kurdish Arabic-based alphabet) (`[ASSUMED]`) were added 2026-10-08 by quick task 261008-k7u and equal the `site.nav.*` values exactly (D-TOOLS); RSA and DH stay Latin in both. The `sa` (Sanskrit, Devanagari) and `la` (Latin) columns (`[ASSUMED]`) were added 2026-10-08 by quick task 261008-qz1 and equal the `site.nav.*` values in `assets/i18n/site.js` exactly (D-TOOLS); RSA stays Latin in both, and Latin keeps Diffie-Hellman.

| id | File | en (site.nav / page h1) | nl | de | fr | es | it | pl | pt-BR | pt-PT | sv | nb | ro | hu | lv | ru | el | he | hi | ar | sq | sw | zh | ja | ko | id (Indonesian) | zgh-Latn | zgh-Tfng | ku | ckb | sa | la |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---| --- | --- | --- | --- | --- | --- | --- |
| home | index.html | Home | Start | Startseite | Accueil | Inicio | Inizio | Strona główna | Início | Início | Hem | Hjem | Acasă | Kezdőlap | Главная | Αρχική | Sākums | דף הבית | मुखपृष्ठ | الصفحة الرئيسية | Kreu | Mwanzo | 首页 | ホーム | 홈 | Beranda | Asnubg | ⴰⵙⵏⵓⴱⴳ | Destpêk | سەرەکی | मुखपृष्ठम् | Pagina prima |
| sieve | Sieve Of Eratosthenes/sieve-of-eratosthenes.html | Sieve of Eratosthenes | Zeef van Eratosthenes | Sieb des Eratosthenes | Crible d'Ératosthène | Criba de Eratóstenes | Crivello di Eratostene | Sito Eratostenesa | Crivo de Eratóstenes | Crivo de Eratóstenes | Eratosthenes såll | Eratosthenes' sil | Ciurul lui Eratostene | Eratoszthenész szitája | Решето Эратосфена | Κόσκινο του Ερατοσθένη | Eratostena siets | הנפה של ארטוסתנס | एराटोस्थनीज़ की छलनी | غربال إراتوستينس | Sita e Eratostenit | Chujio la Eratosthenes | 埃拉托斯特尼筛法 | エラトステネスの篩 | 에라토스테네스의 체 | Saringan Eratosthenes | Aɣrbal n Iratustin | ⴰⵖⵔⴱⴰⵍ ⵏ ⵉⵔⴰⵜⵓⵙⵜⵉⵏ | Bêjinga Eratosthenes | بێژنگی ئێراتۆستینس | एरातोस्थेनीस-चालनी | Cribrum Eratosthenis |
| factorTree | Factor Tree/factor-tree.html | Factor Tree | Factorboom | Faktorbaum | Arbre de facteurs | Árbol de factores | Albero dei fattori | Drzewo czynników | Árvore de fatores | Árvore de fatores | Faktorträd | Faktortre | Arbore de factori | Tényezőfa | Дерево множителей | Δέντρο παραγόντων | Reizinātāju koks | עץ גורמים | गुणनखंड वृक्ष | شجرة العوامل | Pema e faktorëve | Mti wa vigawo | 因数树 | 因数の木 | 인수 나무 | Pohon Faktor | Aseklu n ifakturn | ⴰⵙⴻⴽⵍⵓ ⵏ ⵉⴼⴰⴽⵜⵓⵔⵏ | Dara faktoran | داری ھۆکارەکان | गुणनखण्डवृक्षः | Arbor factorum |
| venn | Venn Diagram/venn-diagram.html | Venn Diagram | Venndiagram | Venn-Diagramm | Diagramme de Venn | Diagrama de Venn | Diagramma di Venn | Diagram Venna | Diagrama de Venn | Diagrama de Venn | Venndiagram | Venndiagram | Diagrama Venn | Venn-diagram | Диаграмма Венна | Διάγραμμα Venn | Venna diagramma | דיאגרמת ון | वेन आरेख | مخطط فن | Diagrami Venn | Mchoro wa Venn | 维恩图 | ベン図 | 벤 다이어그램 | Diagram Venn | Amskan n Fin | ⴰⵎⵙⴽⴰⵏ ⵏ ⴼⵉⵏ | Diyagrama Venn | ھێڵکاری ڤێن | वेन-आरेखः | Diagramma Vennianum |
| euclid | Euclidean Algorithm/euclidean-algorithm.html | Euclidean Algorithm | Algoritme van Euclides | Euklidischer Algorithmus | Algorithme d'Euclide | Algoritmo de Euclides | Algoritmo di Euclide | Algorytm Euklidesa | Algoritmo de Euclides | Algoritmo de Euclides | Euklides algoritm | Euklids algoritme | Algoritmul lui Euclid | Euklideszi algoritmus | Алгоритм Евклида | Αλγόριθμος του Ευκλείδη | Eiklīda algoritms | האלגוריתם של אוקלידס | यूक्लिड का एल्गोरिथ्म | خوارزمية إقليدس | Algoritmi i Euklidit | Algorithimu ya Euclid | 欧几里得算法 | ユークリッドの互除法 | 유클리드 호제법 | Algoritma Euklides | Alguritm n Uklid | ⴰⵍⴳⵓⵔⵉⵜⵎ ⵏ ⵓⴽⵍⵉⴷ | Algorîtma Euklîd | ئەلگۆریتمی ئیقلیدس | यूक्लिड-कलनविधिः | Algorithmus Euclideus |
| crt | Chinese Remainder Theorem/chinese-remainder-theorem.html | Chinese Remainder Theorem | Chinese reststelling | Chinesischer Restsatz | Théorème des restes chinois | Teorema chino del resto | Teorema cinese del resto | Chińskie twierdzenie o resztach | Teorema chinês do resto / Teorema chinês dos restos | Teorema chinês do resto / Teorema chinês dos restos | Kinesiska restsatsen | Den kinesiske restsetningen | Teorema chineză a resturilor | Kínai maradéktétel | Китайская теорема об остатках | Κινεζικό θεώρημα υπολοίπων | Ķīniešu atlikumu teorēma | משפט השאריות הסיני | चीनी शेषफल प्रमेय | مبرهنة الباقي الصينية | Teorema kineze e mbetjeve | Nadharia ya mabaki ya Kichina | 中国剩余定理 | 中国剰余定理 | 중국인의 나머지 정리 | Teorema Sisa Tiongkok | Askkud aṣinwi n uqqimu | ⴰⵙⴽⴽⵓⴷ ⴰⵚⵉⵏⵡⵉ ⵏ ⵓⵇⵇⵉⵎⵓ | Teorema bermayiyan a çînî | تیۆرەمی پاشماوەی چینی | चीनीयशेषप्रमेयम् | Theorema Sinicum de residuis |
| wheel | Equivalence Wheel/equivalence-wheel.html | Equivalence Wheel | Equivalentiewiel | Äquivalenzrad | Roue d'équivalence | Rueda de equivalencia | Ruota di equivalenza | Koło równoważności | Roda de equivalência | Roda de equivalência | Ekvivalenshjul | Ekvivalenshjul | Roata echivalenței | Ekvivalenciakerék | Колесо эквивалентности | Τροχός ισοδυναμίας | Ekvivalences rats | גלגל השקילות | तुल्यता चक्र | عجلة التكافؤ | Rrota e ekuivalencës | Gurudumu la usawa | 等价轮 | 同値の輪 | 동치 바퀴 | Roda Ekuivalensi | Tawrerrayt n ugdu | ⵜⴰⵡⵔⴻⵔⵔⴰⵢⵜ ⵏ ⵓⴳⴷⵓ | Çerxa wekheviyê | چەرخی یەکسانی | तुल्यताचक्रम् | Rota aequivalentiae |
| totient | Eulers Totient/eulers-totient.html | Euler's Totient | Eulers phi-functie | Eulersche Phi-Funktion | Indicatrice d'Euler | Función φ de Euler | Funzione φ di Eulero | Funkcja φ Eulera | Função φ de Euler | Função φ de Euler | Eulers φ-funktion | Eulers φ-funksjon | Funcția φ a lui Euler | Euler-féle φ-függvény | Функция Эйлера | Συνάρτηση φ του Euler | Eilera φ funkcija | פונקציית φ של אוילר | ऑयलर का φ फलन | دالة φ لأويلر | Funksioni φ i Eulerit | Kitendakazi φ cha Euler | 欧拉 φ 函数 | オイラーのφ関数 | 오일러 φ 함수 | Fungsi φ Euler | Tasɣnt φ n Ulir | ⵜⴰⵙⵖⵏⵜ φ ⵏ ⵓⵍⵉⵔ | Fonksiyona φ ya Euler | فەنکشنی ئۆیلەر φ | ओयलरस्य φ फलनम् | Functio φ Euleri |
| cayley | Cayley Table/cayley-table.html | Cayley Table | Cayleytabel | Cayley-Tafel | Table de Cayley | Tabla de Cayley | Tavola di Cayley | Tabela Cayleya | Tabela de Cayley | Tabela de Cayley | Cayleytabell | Cayleytabell | Tabla lui Cayley | Cayley-táblázat | Таблица Кэли | Πίνακας Cayley | Keilija tabula | טבלת קיילי | केली सारणी | جدول كايلي | Tabela e Cayley-t | Jedwali la Cayley | 凯莱表 | ケイリー表 | 케일리 표 | Tabel Cayley | Taflwit n Kayli | ⵜⴰⴼⵍⵡⵉⵜ ⵏ ⴽⴰⵢⵍⵉ | Tabloya Cayley | خشتەی کەیلی | केली-सारणी | Tabula Cayleiana |
| iso | Group Isomorphism/group-isomorphism.html | Group Isomorphism | Groepsisomorfisme | Gruppenisomorphismus | Isomorphisme de groupes | Isomorfismo de grupos | Isomorfismo di gruppi | Izomorfizm grup | Isomorfismo de grupos | Isomorfismo de grupos | Gruppisomorfism | Gruppeisomorfi | Izomorfism de grupuri | Csoportizomorfizmus | Изоморфизм групп | Ισομορφισμός ομάδων | Grupu izomorfisms | איזומורפיזם של חבורות | समूह तुल्याकारिता | تماثل الزمر | Izomorfizmi i grupeve | Isomofizimu ya makundi | 群同构 | 群の同型 | 군 동형 | Isomorfisme Grup | Amsalɣ n tgrawin | ⴰⵎⵙⴰⵍⵖ ⵏ ⵜⴳⵔⴰⵡⵉⵏ | Îzomorfîzma grûpan | ئیزۆمۆرفیزمی گرووپەکان | समूहसमरूपता | Isomorphismus gregum |
| sqm | Square And Multiply/square-and-multiply.html | Square and Multiply | Kwadrateren en vermenigvuldigen | Quadrieren und Multiplizieren | Exponentiation rapide | Exponenciación rápida | Esponenziazione rapida | Szybkie potęgowanie | Exponenciação rápida | Exponenciação rápida | Kvadrering och multiplikation | Kvadrering og multiplikasjon | Exponențiere rapidă | Gyors hatványozás | Быстрое возведение в степень | Γρήγορη ύψωση σε δύναμη | Ātrā kāpināšana | העלאה בריבוע וכפל | वर्ग और गुणा | التربيع والضرب | Ngritja në katror dhe shumëzimi | Mraba na kuzidisha | 平方-乘算法 | 繰り返し二乗法 | 제곱-곱셈 알고리즘 | Kuadratkan dan Kalikan | Askkuẓ d usgut | ⴰⵙⴽⴽⵓⵥ ⴷ ⵓⵙⴳⵓⵜ | Çargoşekirin û lêkdan | دووجاکردن و لێکدان | वर्गकरणं गुणनं च | Quadratio et multiplicatio |
| dh | Diffie-Hellman Key Exchange/diffie-hellman-key-exchange.html | Diffie-Hellman | Diffie-Hellman | Diffie-Hellman | Diffie-Hellman | Diffie-Hellman | Diffie-Hellman | Diffie-Hellman | Diffie-Hellman | Diffie-Hellman | Diffie-Hellman | Diffie-Hellman | Diffie-Hellman | Diffie-Hellman | Диффи-Хеллман | Diffie-Hellman | Diffie-Hellman | דיפי-הלמן | डिफ़ी-हेलमैन | ديفي-هيلمان | Diffie-Hellman | Diffie-Hellman | 迪菲-赫尔曼 | ディフィー・ヘルマン | 디피-헬먼 | Diffie-Hellman | Difi-Hilman | ⴷⵉⴼⵉ-ⵀⵉⵍⵎⴰⵏ | Diffie-Hellman | دیفی-ھێلمان | डिफी-हेलमन | Diffie-Hellman |
| ecdh | Elliptic Curve Diffie-Hellman/elliptic-curve-diffie-hellman.html | Elliptic Curve DH | Elliptische-krommen-DH | Elliptische-Kurven-DH | DH sur courbes elliptiques | DH de curva elíptica | DH su curve ellittiche | DH na krzywych eliptycznych | DH em curvas elípticas | DH em curvas elípticas | DH med elliptiska kurvor | DH med elliptiske kurver | DH pe curbe eliptice | Elliptikus görbés DH | DH на эллиптических кривых | DH ελλειπτικών καμπυλών | Eliptisko līkņu DH | דיפי-הלמן בעקומים אליפטיים | दीर्घवृत्तीय वक्र DH | ديفي-هيلمان بالمنحنيات الإهليلجية | DH me kurba eliptike | DH kwa mikunjo duaradufu | 椭圆曲线 DH | 楕円曲線DH | 타원 곡선 DH | DH Kurva Eliptik | DH n tzligt tilibtikt | DH ⵏ ⵜⵣⵍⵉⴳⵜ ⵜⵉⵍⵉⴱⵜⵉⴽⵜ | DH bi kevana elîptîk | دیفی-ھێلمان بە چەماوەی ئیلیپتیکی | दीर्घवृत्तीयवक्र-DH | DH in curvis ellipticis |
| rsa | RSA/rsa.html | RSA | RSA | RSA | RSA | RSA | RSA | RSA | RSA | RSA | RSA | RSA | RSA | RSA | RSA | RSA | RSA | RSA | RSA | RSA | RSA | RSA | RSA | RSA | RSA | RSA | RSA | RSA | RSA | RSA | RSA | RSA |
| fermat | Fermats Method/fermats-method.html | Fermat's Method | Methode van Fermat | Fermat-Methode | Méthode de Fermat | Método de Fermat | Metodo di Fermat | Metoda Fermata | Método de Fermat | Método de Fermat | Fermats metod | Fermats metode | Metoda lui Fermat | Fermat-módszer | Метод Ферма | Μέθοδος του Fermat | Ferma metode | שיטת פרמה | फ़र्मा की विधि | طريقة فيرما | Metoda e Fermatit | Mbinu ya Fermat | 费马分解法 | フェルマー法 | 페르마 인수분해법 | Metode Fermat | Tarrayt n Firma | ⵜⴰⵔⵔⴰⵢⵜ ⵏ ⴼⵉⵔⵎⴰ | Rêbaza Fermat | ڕێگای فێرما | फर्मा-विधिः | Methodus Fermatiana |
| shor | Shors Algorithm/shors-algorithm.html | Shor's Algorithm | Algoritme van Shor | Shor-Algorithmus | Algorithme de Shor | Algoritmo de Shor | Algoritmo di Shor | Algorytm Shora | Algoritmo de Shor | Algoritmo de Shor | Shors algoritm | Shors algoritme | Algoritmul lui Shor | Shor-algoritmus | Алгоритм Шора | Αλγόριθμος του Shor | Šora algoritms | האלגוריתם של שור | शोर का एल्गोरिथ्म | خوارزمية شور | Algoritmi i Shorit | Algorithimu ya Shor | 秀尔算法 | ショアのアルゴリズム | 쇼어 알고리즘 | Algoritma Shor | Alguritm n Cur | ⴰⵍⴳⵓⵔⵉⵜⵎ ⵏ ⵛⵓⵔ | Algorîtma Shor | ئەلگۆریتمی شۆر | शोर-कलनविधिः | Algorithmus Shorianus |

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
was added 2026-10-06 by quick task 261006-vpp. The ar column (`[ASSUMED]`) was added
2026-10-07 by quick task 261007-fhx. The sq and sw columns (`[ASSUMED]`) were added 2026-10-07
by quick task 261007-k4o (D-TERMS anchors; the remaining rows chosen in Task 1). The zh, ja and ko columns (`[ASSUMED]`) were added 2026-10-07 by quick task 261007-pbf (D-TERMS, unified in Task 6); all 53 rows are
filled. The id column (`[ASSUMED]`) was added 2026-10-08 by quick task 261008-0h2 (D-TERMS, all 53 rows). The `zgh-Latn` and `zgh-Tfng` columns (Standard Moroccan Tamazight in IRCAM Latin and IRCAM Tifinagh) were added 2026-10-08 by quick task 261008-e2j (D-TERMS, all 53 rows); each `zgh-Latn` cell carries `[CITED]` where the term is attested on zgh.wikipedia.org (the article on prime numbers and its math glossary) and `[ASSUMED]` for a neologism built from attested roots or a French term adapted to IRCAM letters, and each `zgh-Tfng` cell is the transliteration of the cell beside it. The Kurdish columns `ku` (Kurmanji) and `ckb` (Sorani) (`[ASSUMED]`) were added 2026-10-08 by quick task 261008-k7u (D-TERMS, all 53 rows; no Kurdish term was verified against a published glossary). The Sanskrit and Latin columns `sa` and `la` (`[ASSUMED]`) were added 2026-10-08 by quick task 261008-qz1 (D-TERMS, all 53 rows; a `sa` cell uses the traditional Indian mathematical terms where they exist, a `la` cell the Neo-Latin scientific register); the Latin terms attested on la.wikipedia.org are `[CITED]` (grex, numerus primus, numerus compositus, zerum, Euclides, Eulerus), every other Sanskrit and Latin cell is `[ASSUMED]`, and no native or scholarly reader has reviewed them.

| # | Term (en) | nl | de | fr | es | it | pl | pt-BR | pt-PT | sv | nb | ro | hu | lv | ru | el | he | hi | ar | sq | sw | zh | ja | ko | id | zgh-Latn | zgh-Tfng | ku | ckb | sa | la | Confidence |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---| --- | --- | --- | --- | --- | --- | --- |---|
| 1 | prime (number) | priemgetal | Primzahl | nombre premier | número primo | numero primo | liczba pierwsza | número primo | número primo | primtal | primtall | număr prim | prímszám | pirmskaitlis | простое число | πρώτος αριθμός | מספר ראשוני | अभाज्य संख्या | عدد أولي | numër i thjeshtë | namba tasa | 素数 | 素数 | 소수 | bilangan prima | amḍan amnzu, imḍanen imnza `[CITED]` | ⴰⵎⴹⴰⵏ ⴰⵎⵏⵣⵓ, ⵉⵎⴹⴰⵏⴻⵏ ⵉⵎⵏⵣⴰ `[CITED]` | hejmara seretayî, hejmarên seretayî | ژمارەی سەرەتایی، ژمارە سەرەتاییەکان | अभाज्यसङ्ख्या, अभाज्यसङ्ख्याः | numerus primus, numeri primi | `[ASSUMED]` |
| 2 | composite (number) | samengesteld getal | zusammengesetzte Zahl | nombre composé | número compuesto | numero composto | liczba złożona | número composto | número composto | sammansatt tal | sammensatt tall | număr compus | összetett szám | salikts skaitlis | составное число | σύνθετος αριθμός | מספר פריק | भाज्य संख्या | عدد مؤلف | numër i përbërë | namba shirikishi | 合数 | 合成数 | 합성수 | bilangan komposit | amḍan uddis `[CITED]` | ⴰⵎⴹⴰⵏ ⵓⴷⴷⵉⵙ `[CITED]` | hejmara hevedudanî | ژمارەی لێکدراو | संयुक्तसङ्ख्या | numerus compositus | `[ASSUMED]` |
| 3 | factor | factor | Faktor | facteur | factor | fattore | czynnik | fator | fator | faktor | faktor | factor | tényező | reizinātājs | множитель | παράγοντας | גורם | गुणनखंड | عامل | faktor | kigawo (vigawo) | 因数 | 因数 | 인수 | faktor | afaktur, ifakturn `[ASSUMED]` | ⴰⴼⴰⴽⵜⵓⵔ, ⵉⴼⴰⴽⵜⵓⵔⵏ `[ASSUMED]` | faktor, faktorên | ھۆکار، ھۆکارەکان | गुणनखण्डः, गुणनखण्डाः | factor, factores | `[ASSUMED]` |
| 4 | prime factorization | priemfactorisatie | Primfaktorzerlegung | décomposition en facteurs premiers | factorización en primos | fattorizzazione in numeri primi | rozkład na czynniki pierwsze | fatoração em primos (decomposição em fatores primos) | decomposição em fatores primos (fatorização) | primtalsfaktorisering | primtallsfaktorisering | descompunere în factori primi | prímtényezős felbontás | sadalīšana pirmreizinātājos | разложение на простые множители | ανάλυση σε πρώτους παράγοντες | פירוק לגורמים ראשוניים | अभाज्य गुणनखंडन | التحليل إلى عوامل أولية | faktorizimi në faktorë të thjeshtë | uchanganuzi wa vigawo tasa | 素因数分解 | 素因数分解 | 소인수분해 | faktorisasi prima | asfaktr g imḍanen imnza `[ASSUMED]` | ⴰⵙⴼⴰⴽⵜⵔ ⴳ ⵉⵎⴹⴰⵏⴻⵏ ⵉⵎⵏⵣⴰ `[ASSUMED]` | faktorkirina seretayî | شیکردنەوە بۆ ھۆکارە سەرەتاییەکان | अभाज्यगुणनखण्डनम् | resolutio in factores primos | `[ASSUMED]` |
| 5 | divisor | deler | Teiler | diviseur | divisor | divisore | dzielnik | divisor | divisor | delare | divisor | divizor | osztó | dalītājs | делитель | διαιρέτης | מחלק | भाजक | قاسم | pjesëtues | kigawanyo (vigawanyo) | 约数 | 約数 | 약수 | pembagi | anbḍay, inbḍayn `[CITED]` | ⴰⵏⴱⴹⴰⵢ, ⵉⵏⴱⴹⴰⵢⵏ `[CITED]` | dabeşker | دابەشکەر | भाजकः | divisor | `[ASSUMED]` |
| 6 | greatest common divisor | grootste gemene deler (ggd) | größter gemeinsamer Teiler (ggT) | plus grand commun diviseur (PGCD) | máximo común divisor (mcd) | massimo comun divisore (MCD) | największy wspólny dzielnik (NWD) | máximo divisor comum (MDC) | máximo divisor comum (m.d.c.) | största gemensamma delare (SGD) | største felles divisor (SFD) | cel mai mare divizor comun (cmmdc) | legnagyobb közös osztó (lnko) | lielākais kopīgais dalītājs (LKD) | наибольший общий делитель (НОД) | μέγιστος κοινός διαιρέτης (ΜΚΔ) | המחלק המשותף המקסימלי (ממ״מ) | महत्तम समापवर्तक (म.स.) | القاسم المشترك الأكبر (ق.م.أ) | pjesëtuesi më i madh i përbashkët (PMP) | kigawo kikubwa cha shirika (KKS) | 最大公约数 | 最大公約数 | 최대공약수 | faktor persekutuan terbesar (FPB) | anbḍay amqran amcrik `[ASSUMED]` | ⴰⵏⴱⴹⴰⵢ ⴰⵎⵇⵔⴰⵏ ⴰⵎⵛⵔⵉⴽ `[ASSUMED]` | dabeşkerê hevpar ê herî mezin | گەورەترین دابەشکەری ھاوبەش | महत्तमसमापवर्तकः | divisor communis maximus | `[CITED: en.wiktionary.org, bab.la]` (it `[ASSUMED]`) |
| 7 | least common multiple | kleinste gemene veelvoud (kgv) | kleinstes gemeinsames Vielfaches (kgV) | plus petit commun multiple (PPCM) | mínimo común múltiplo (mcm) | minimo comune multiplo (mcm) | najmniejsza wspólna wielokrotność (NWW) | mínimo múltiplo comum (MMC) | mínimo múltiplo comum (m.m.c.) | minsta gemensamma multipel (MGM) | minste felles multiplum (MFM) | cel mai mic multiplu comun (cmmmc) | legkisebb közös többszörös (lkkt) | mazākais kopīgais dalāmais (MKD) | наименьшее общее кратное (НОК) | ελάχιστο κοινό πολλαπλάσιο (ΕΚΠ) | הכפולה המשותפת המינימלית (כמ״מ) | लघुत्तम समापवर्त्य (ल.स.) | المضاعف المشترك الأصغر (م.م.أ) | shumëfishi më i vogël i përbashkët (SHVP) | kigawe kidogo cha shirika (KDS) | 最小公倍数 | 最小公倍数 | 최소공배수 | kelipatan persekutuan terkecil (KPK) | amsgut amẓẓan amcrik `[ASSUMED]` | ⴰⵎⵙⴳⵓⵜ ⴰⵎⵥⵥⴰⵏ ⴰⵎⵛⵔⵉⴽ `[ASSUMED]` | pirjimara hevpar a herî biçûk | بچووکترین چەندجارەی ھاوبەش | लघुत्तमसमापवर्त्यम् | minimum commune multiplum | `[ASSUMED]` |
| 8 | quotient | quotiënt | Quotient | quotient | cociente | quoziente | iloraz | quociente | quociente | kvot | kvotient | cât | hányados | dalījums | частное | πηλίκο | מנה | भागफल | خارج القسمة | herësi | mgawo | 商 | 商 | 몫 | hasil bagi | tayafut n ubḍu `[ASSUMED]` | ⵜⴰⵢⴰⴼⵓⵜ ⵏ ⵓⴱⴹⵓ `[ASSUMED]` | encama dabeşkirinê | ئەنجامی دابەشکردن | लब्धिः | quotiens | `[ASSUMED]` |
| 9 | remainder | rest | Rest | reste | resto | resto | reszta | resto | resto | rest | rest | rest | maradék | atlikums | остаток | υπόλοιπο | שארית | शेषफल | باقي القسمة | mbetja | baki | 余数 | 余り | 나머지 | sisa | aqqimu `[ASSUMED]` | ⴰⵇⵇⵉⵎⵓ `[ASSUMED]` | bermayî | پاشماوە | शेषः | residuum | `[ASSUMED]` |
| 10 | modulus | modulus | Modul | module | módulo | modulo | moduł | módulo | módulo | modul | modul | modul | modulus | modulis | модуль | μέτρο | מודולוס | मापांक | المقياس | moduli | moduli | 模数 | 法 | 법 | modulus | amuḍul `[ASSUMED]` | ⴰⵎⵓⴹⵓⵍ `[ASSUMED]` | modul | مۆدیول | मापाङ्कः | modulus | `[CITED: dictionary.reverso.net for ES]` / `[ASSUMED: nl, de, fr, it]` |
| 11 | residue | rest(klasse)vertegenwoordiger | Rest | reste | resto | residuo / classe di resto | reszta / klasa reszt | resíduo | classe de resíduos | rest / restklass | rest / restklasse | rest / clasă de resturi | maradék / maradékosztály | atlikums / atlikumu klase | вычет / класс вычетов | υπόλοιπο / κλάση υπολοίπων | שארית (נציג של מחלקת שארית) | अवशेष | البقية | mbetje (përfaqësues i klasës së mbetjeve) | baki (mwakilishi wa tabaka la baki) | 剩余 | 剰余 | 잉여 | residu | aqqimu amuḍulan `[ASSUMED]` | ⴰⵇⵇⵉⵎⵓ ⴰⵎⵓⴹⵓⵍⴰⵏ `[ASSUMED]` | bermayiya modulî | پاشماوەی مۆدیولی | मापाङ्कीयशेषः | residuum modulare | `[ASSUMED]` |
| 12 | congruence / congruent | congruentie / congruent | Kongruenz / kongruent | congruence / congru | congruencia / congruente | congruenza / congruente | kongruencja / przystający | congruência / congruente | congruência / congruente | kongruens / kongruent | kongruens / kongruent | congruență / congruent | kongruencia / kongruens | kongruence / kongruents | сравнение / сравнимый по модулю | ισοτιμία / ισότιμος | שקילות / שקול | सर्वांगसमता / सर्वांगसम | تطابق / متطابق | kongruencë / kongruent | ulinganifu / linganifu | 同余 / 同余的 | 合同 / 合同である | 합동 / 합동인 | kongruensi / kongruen | agdu amuḍulan / igda `[ASSUMED]` | ⴰⴳⴷⵓ ⴰⵎⵓⴹⵓⵍⴰⵏ / ⵉⴳⴷⴰ `[ASSUMED]` | lihevhatina modulî / lihevhatî | ھاوتایی مۆدیولی / ھاوتا | सर्वाङ्गसमता / सर्वाङ्गसमः | congruentia / congruus | `[ASSUMED]` |
| 13 | equivalence class | equivalentieklasse | Äquivalenzklasse | classe d'équivalence | clase de equivalencia | classe di equivalenza | klasa równoważności (klasa abstrakcji) | classe de equivalência | classe de equivalência | ekvivalensklass | ekvivalensklasse | clasă de echivalență | ekvivalenciaosztály | ekvivalences klase | класс эквивалентности | κλάση ισοδυναμίας | מחלקת שקילות | तुल्यता वर्ग | صنف التكافؤ | klasë ekuivalence | tabaka la usawa | 等价类 | 同値類 | 동치류 | kelas ekuivalensi | taggayt n ugdu `[ASSUMED]` | ⵜⴰⴳⴳⴰⵢⵜ ⵏ ⵓⴳⴷⵓ `[ASSUMED]` | çîna wekheviyê | پۆلی یەکسانی | तुल्यतावर्गः | classis aequivalentiae | `[ASSUMED]` |
| 14 | modular inverse | modulaire inverse | modulares Inverses | inverse modulaire | inverso modular | inverso modulare | odwrotność modulo n (element odwrotny) | inverso modular | inverso modular | modulär invers (invers modulo n) | modulær invers (invers modulo n) | invers modular (invers modulo n) | moduláris inverz (inverz modulo n) | modulārais inverss (inverss pēc moduļa n) | обратный элемент по модулю n | αντίστροφος mod n | הופכי מודולרי | मापांकीय प्रतिलोम | المعكوس النمطي | i anasjellti modular | kinyume cha moduli | 模逆元 | モジュラ逆元 | 모듈러 역원 | invers modular | amgal amuḍulan `[ASSUMED]` | ⴰⵎⴳⴰⵍ ⴰⵎⵓⴹⵓⵍⴰⵏ `[ASSUMED]` | berevajiya modulî | پێچەوانەی مۆدیولی | मापाङ्कीयप्रतिलोमः | inversum modulare | `[ASSUMED]` |
| 15 | coprime | onderling ondeelbaar (coprime) | teilerfremd | premiers entre eux | coprimo | coprimi (primi tra loro) | względnie pierwsze | coprimos (primos entre si) | primos entre si (coprimos) | relativt prima (inbördes prima) | innbyrdes primiske (relativt primiske) | prime între ele (relativ prime) | relatív prímek | savstarpēji pirmskaitļi | взаимно простые | πρώτοι μεταξύ τους (σχετικά πρώτοι) | זרים (זרים זה לזה) | सह-अभाज्य | أوليان فيما بينهما | relativisht të thjeshtë | tasa baina yao | 互素 | 互いに素 | 서로소 | relatif prima | imnza gr asn `[ASSUMED]` | ⵉⵎⵏⵣⴰ ⴳⵔ ⴰⵙⵏ `[ASSUMED]` | ji hev seretayî | سەرەتایی لە نێوان خۆیاندا | सहाभाज्य (परस्परम् अभाज्य) | inter se primi | `[ASSUMED]` |
| 16 | totient (Euler's totient function) | Eulers phi-functie | Eulersche Phi-Funktion | indicatrice d'Euler | función φ de Euler | funzione φ di Eulero | funkcja φ Eulera | função φ de Euler | função φ de Euler | Eulers φ-funktion | Eulers φ-funksjon | funcția φ a lui Euler (indicatorul lui Euler) | Euler-féle φ-függvény | Eilera funkcija φ | функция Эйлера φ | συνάρτηση φ του Euler | פונקציית φ של אוילר | ऑयलर का φ फलन | دالة φ لأويلر | funksioni φ i Eulerit | kitendakazi φ cha Euler | 欧拉 φ 函数 | オイラーのφ関数 | 오일러 φ 함수 | fungsi φ Euler | tasɣnt φ n Ulir `[ASSUMED]` | ⵜⴰⵙⵖⵏⵜ φ ⵏ ⵓⵍⵉⵔ `[ASSUMED]` | fonksiyona φ ya Euler | فەنکشنی ئۆیلەر φ | ओयलरस्य φ फलनम् | functio φ Euleri | `[CITED: Wikidata/Wikipedia for de/fr/es]` / `[ASSUMED: nl, it]` |
| 17 | group (algebraic) | groep | Gruppe | groupe | grupo | gruppo | grupa | grupo | grupo | grupp | gruppe | grup | csoport | grupa | группа | ομάδα | חבורה | समूह | زمرة | grup | kundi (makundi) | 群 | 群 | 군 | grup | tagrawt, tigrawin `[CITED]` | ⵜⴰⴳⵔⴰⵡⵜ, ⵜⵉⴳⵔⴰⵡⵉⵏ `[CITED]` | grûp, grûpên | گرووپ، گرووپەکان | समूहः, समूहाः | grex, greges | `[ASSUMED]` |
| 18 | additive group | additieve groep | additive Gruppe | groupe additif | grupo aditivo | gruppo additivo | grupa addytywna | grupo aditivo | grupo aditivo | additiv grupp | additiv gruppe | grup aditiv | additív csoport | aditīvā grupa | аддитивная группа | προσθετική ομάδα | חבורה חיבורית | योगात्मक समूह | زمرة جمعية | grup aditiv | kundi la kujumlisha | 加法群 | 加法群 | 덧셈군 | grup aditif | tagrawt n usmrni `[ASSUMED]` | ⵜⴰⴳⵔⴰⵡⵜ ⵏ ⵓⵙⵎⵔⵏⵉ `[ASSUMED]` | grûpa lêzêdekirinê | گرووپی کۆکردنەوە | योगात्मकसमूहः | grex additivus | `[ASSUMED]` |
| 19 | multiplicative group | multiplicatieve groep | multiplikative Gruppe | groupe multiplicatif | grupo multiplicativo | gruppo moltiplicativo | grupa multiplikatywna | grupo multiplicativo | grupo multiplicativo | multiplikativ grupp | multiplikativ gruppe | grup multiplicativ | multiplikatív csoport | multiplikatīvā grupa | мультипликативная группа | πολλαπλασιαστική ομάδα | חבורה כפלית | गुणात्मक समूह | زمرة ضربية | grup shumëzues | kundi la kuzidisha | 乘法群 | 乗法群 | 곱셈군 | grup multiplikatif | tagrawt n usgut `[ASSUMED]` | ⵜⴰⴳⵔⴰⵡⵜ ⵏ ⵓⵙⴳⵓⵜ `[ASSUMED]` | grûpa lêkdanê | گرووپی لێکدان | गुणनात्मकसमूहः | grex multiplicativus | `[ASSUMED]` |
| 20 | unit (group element) | eenheid | Einheit | unité | unidad | unità | element odwracalny | unidade (elemento invertível) | unidade (elemento invertível) | enhet (inverterbart element) | enhet (invertibelt element) | element inversabil (unitate) | invertálható elem (egység) | invertējams elements (vienība) | обратимый элемент | αντιστρέψιμο στοιχείο | איבר הפיך | इकाई (प्रतिलोमीय अवयव) | عنصر وحدة | element i kthyeshëm (njësi) | kipengele kinachogeuzika | 可逆元 | 可逆元 | 가역원 | unit | tayuwnt, tiyuwnin `[CITED]` | ⵜⴰⵢⵓⵡⵏⵜ, ⵜⵉⵢⵓⵡⵏⵉⵏ `[CITED]` | yekîne, yekîneyên | یەکە، یەکەکان | एककम्, एककानि | unitas, unitates | `[ASSUMED]` |
| 21 | identity element | identiteitselement / neutraal element | neutrales Element | élément neutre | elemento neutro | elemento neutro | element neutralny | elemento neutro (identidade) | elemento neutro (identidade) | neutralt element (identitetselement) | nøytralt element (identitetselement) | element neutru (element identitate) | egységelem (neutrális elem) | neitrālais elements (vienības elements) | нейтральный элемент | ουδέτερο στοιχείο | איבר היחידה (איבר ניטרלי) | तत्समक अवयव | العنصر المحايد | elementi neutral | kipengele cha utambulisho | 单位元 | 単位元 | 항등원 | elemen identitas | afrdis arawsan `[ASSUMED]` | ⴰⴼⵔⴷⵉⵙ ⴰⵔⴰⵡⵙⴰⵏ `[ASSUMED]` | hêmana bêalî | توخمی بێلایەن | तत्समकावयवः | elementum neutrum | `[ASSUMED]` |
| 22 | inverse (element) | inverse | Inverses | inverse | inverso | inverso | element odwrotny | inverso (elemento inverso) | inverso (elemento inverso) | invers (inverst element) | invers (inverst element) | invers (element invers) | inverz (inverz elem) | inverss (inversais elements) | обратный элемент | αντίστροφο στοιχείο | איבר הופכי | प्रतिलोम | المعكوس | i anasjellti (elementi i anasjelltë) | kinyume | 逆元 | 逆元 | 역원 | invers | amgal `[ASSUMED]` | ⴰⵎⴳⴰⵍ `[ASSUMED]` | berevajî | پێچەوانە | प्रतिलोमः | inversum | `[ASSUMED]` |
| 23 | order of an element | orde van een element | Ordnung eines Elements | ordre d'un élément | orden de un elemento | ordine di un elemento | rząd elementu | ordem de um elemento | ordem de um elemento | ordning (ett elements ordning) | orden (et elements orden) | ordinul unui element | elem rendje | elementa kārta | порядок элемента | τάξη στοιχείου | סדר של איבר | अवयव की कोटि | الرتبة | rendi i një elementi | daraja la kipengele | 元素的阶 | 元の位数 | 원소의 위수 | orde elemen | urdr n ufrdis `[ASSUMED]` | ⵓⵔⴷⵔ ⵏ ⵓⴼⵔⴷⵉⵙ `[ASSUMED]` | rêza hêmanê | پلەی توخم | अवयवस्य कोटिः | ordo elementi | `[ASSUMED]` |
| 24 | generator / primitive root | voortbrenger / primitieve wortel | Erzeuger / primitive Wurzel | générateur / racine primitive | generador / raíz primitiva | generatore / radice primitiva | generator / pierwiastek pierwotny | gerador / raiz primitiva | gerador / raiz primitiva | generator / primitiv rot | generator / primitiv rot | generator / rădăcină primitivă | generátor / primitív gyök | ģenerators / primitīvā sakne | образующий элемент / первообразный корень | γεννήτορας / πρωταρχική ρίζα | יוצר / שורש פרימיטיבי | जनक / आदिम मूल | المولد / الجذر البدائي | gjeneratori / rrënja primitive | kizalishi / mzizi wa awali | 生成元 / 原根 | 生成元 / 原始根 | 생성원 / 원시근 | pembangkit / akar primitif | amsnulfu / aẓar amzwaru `[ASSUMED]` | ⴰⵎⵙⵏⵓⵍⴼⵓ / ⴰⵥⴰⵔ ⴰⵎⵣⵡⴰⵔⵓ `[ASSUMED]` | çêker / koka bingehîn | بەرھەمھێنەر / ڕەگی سەرەتایی | जनकः / आदिममूलम् | generator / radix primitiva | `[ASSUMED]` |
| 25 | cyclic group | cyclische groep | zyklische Gruppe | groupe cyclique | grupo cíclico | gruppo ciclico | grupa cykliczna | grupo cíclico | grupo cíclico | cyklisk grupp | syklisk gruppe | grup ciclic | ciklikus csoport | cikliskā grupa | циклическая группа | κυκλική ομάδα | חבורה ציקלית | चक्रीय समूह | زمرة دورية | grup ciklik | kundi la mzunguko | 循环群 | 巡回群 | 순환군 | grup siklik | tagrawt tasutlant `[ASSUMED]` | ⵜⴰⴳⵔⴰⵡⵜ ⵜⴰⵙⵓⵜⵍⴰⵏⵜ `[ASSUMED]` | grûpa çerxî | گرووپی خولی | चक्रीयसमूहः | grex cyclicus | `[ASSUMED]` |
| 26 | isomorphism | isomorfisme | Isomorphismus | isomorphisme | isomorfismo | isomorfismo | izomorfizm | isomorfismo | isomorfismo | isomorfism | isomorfi | izomorfism | izomorfizmus | izomorfisms | изоморфизм | ισομορφισμός | איזומורפיזם | तुल्याकारिता | تماثل | izomorfizëm | isomofizimu | 同构 | 同型 | 동형 | isomorfisme | amsalɣ `[ASSUMED]` | ⴰⵎⵙⴰⵍⵖ `[ASSUMED]` | îzomorfîzm | ئیزۆمۆرفیزم | समरूपता | isomorphismus | `[ASSUMED]` |
| 27 | operation table | bewerkingstabel | Verknüpfungstafel | table d'opération | tabla de operación | tavola dell'operazione | tabela działania | tabela da operação | tabela da operação | operationstabell (Cayleytabell) | operasjonstabell (Cayleytabell) | tabla operației (tabla lui Cayley) | műveleti tábla (Cayley-táblázat) | darbību tabula (Keilija tabula) | таблица операции (таблица Кэли) | πίνακας πράξης (πίνακας Cayley) | טבלת פעולה | संक्रिया सारणी | جدول العملية | tabela e veprimit (tabela e Cayley-t) | jedwali la operesheni (jedwali la Cayley) | 运算表 (凯莱表) | 演算表 (ケイリー表) | 연산표 (케일리 표) | tabel operasi (tabel Cayley) | taflwit n tmhlt `[ASSUMED]` | ⵜⴰⴼⵍⵡⵉⵜ ⵏ ⵜⵎⵀⵍⵜ `[ASSUMED]` | tabloya operasyonê (tabloya Cayley) | خشتەی کردار (خشتەی کەیلی) | सङ्क्रियासारणी (केली-सारणी) | tabula operationis (tabula Cayleiana) | `[CITED: Wikimedia Commons — Cayley table]` (it `[ASSUMED]`) |
| 28 | commutative | commutatief | kommutativ | commutatif | conmutativo | commutativo | przemienny | comutativo | comutativo | kommutativ | kommutativ | comutativ | kommutatív | komutatīvs | коммутативный | αντιμεταθετικός | קומוטטיבי (חילופי) | क्रमविनिमेय | تبديلي | komutativ | badilifu | 可交换的 | 可換 | 가환 | komutatif | amsnfal, tamsnfalt `[ASSUMED]` | ⴰⵎⵙⵏⴼⴰⵍ, ⵜⴰⵎⵙⵏⴼⴰⵍⵜ `[ASSUMED]` | cihguhêrbar | ئاڵوگۆڕپێکراو | क्रमविनिमेयः | commutativus | `[ASSUMED]` |
| 29 | perfect square | kwadraatgetal | Quadratzahl | carré parfait | cuadrado perfecto | quadrato perfetto | kwadrat liczby całkowitej (liczba kwadratowa) | quadrado perfeito | quadrado perfeito | kvadrattal | kvadrattall | pătrat perfect | teljes négyzet (négyzetszám) | pilns kvadrāts (kvadrātskaitlis) | полный квадрат | τέλειο τετράγωνο | ריבוע שלם | पूर्ण वर्ग | مربع كامل | katror i plotë | mraba kamili | 完全平方数 | 平方数 | 완전제곱수 | kuadrat sempurna | amkkuẓ ummid `[ASSUMED]` | ⴰⵎⴽⴽⵓⵥ ⵓⵎⵎⵉⴷ `[ASSUMED]` | çargoşeya temam | دووجای تەواو | पूर्णवर्गः | quadratum perfectum | `[ASSUMED]` |
| 30 | factorization method | factorisatiemethode | Faktorisierungsmethode | méthode de factorisation | método de factorización | metodo di fattorizzazione | metoda faktoryzacji | método de fatoração | método de fatorização | faktoriseringsmetod | faktoriseringsmetode | metodă de factorizare | faktorizációs módszer | faktorizācijas metode | метод факторизации | μέθοδος παραγοντοποίησης | שיטת פירוק לגורמים | गुणनखंडन विधि | طريقة التحليل إلى عوامل | metodë faktorizimi | mbinu ya kuchanganua vigawo | 分解法 | 因数分解法 | 인수분해법 | metode faktorisasi | tarrayt n usfaktr `[ASSUMED]` | ⵜⴰⵔⵔⴰⵢⵜ ⵏ ⵓⵙⴼⴰⴽⵜⵔ `[ASSUMED]` | rêbaza faktorkirinê | ڕێگای شیکردنەوە بۆ ھۆکار | गुणनखण्डनविधिः | methodus resolutionis in factores | `[ASSUMED]` |
| 31 | exponent | exponent | Exponent | exposant | exponente | esponente | wykładnik | expoente | expoente | exponent | eksponent | exponent | kitevő | kāpinātājs | показатель степени | εκθέτης | מעריך | घातांक | الأس | eksponenti | kipeo | 指数 | 指数 | 지수 | eksponen | tazmrt `[ASSUMED]` | ⵜⴰⵣⵎⵔⵜ `[ASSUMED]` | hêz | توان | घाताङ्कः | exponens | `[ASSUMED]` |
| 32 | base (of an exponentiation) | grondtal | Basis | base | base | base | podstawa | base | base | bas | grunntall | bază | alap | bāze | основание степени | βάση | בסיס | आधार | الأساس | baza | msingi | 底数 | 底 | 밑 | basis | tasila `[CITED]` | ⵜⴰⵙⵉⵍⴰ `[CITED]` | bingeh | بنچینە | आधारः | basis | `[ASSUMED]` |
| 33 | modular exponentiation | modulaire machtsverheffing | modulare Exponentiation | exponentiation modulaire | exponenciación modular | esponenziazione modulare | potęgowanie modularne | exponenciação modular | exponenciação modular | modulär exponentiering | modulær eksponentiering | exponențiere modulară | moduláris hatványozás | modulārā kāpināšana | возведение в степень по модулю | ύψωση σε δύναμη mod n | העלאה בחזקה מודולרית | मापांकीय घातांकन | الرفع النمطي إلى قوة | fuqizimi modular | ukipeo kwa moduli | 模幂运算 | べき剰余 | 모듈러 거듭제곱 | perpangkatan modular | asali amuḍulan s tzmrt `[ASSUMED]` | ⴰⵙⴰⵍⵉ ⴰⵎⵓⴹⵓⵍⴰⵏ ⵙ ⵜⵣⵎⵔⵜ `[ASSUMED]` | hêzkirina modulî | بەتوانکردنی مۆدیولی | मापाङ्कीयघातनम् | potentiatio modularis | `[ASSUMED]` |
| 34 | binary expansion | binaire expansie | Binärdarstellung | développement binaire | expansión binaria | espansione binaria | rozwinięcie dwójkowe | representação binária (expansão binária) | representação binária (expansão binária) | binär utveckling | binær utvikling | reprezentare binară | kettes számrendszerbeli alak (bináris alak) | binārais pieraksts | двоичная запись | δυαδική αναπαράσταση | ייצוג בינרי | द्विआधारी प्रसार | التمثيل الثنائي | paraqitja binare | uwakilishi wa jozi | 二进制展开 | 二進展開 | 이진 전개 | representasi biner | tirra tasinant `[ASSUMED]` | ⵜⵉⵔⵔⴰ ⵜⴰⵙⵉⵏⴰⵏⵜ `[ASSUMED]` | nivîsîna binarî | نووسینی دووانی | द्व्याधारिकविस्तारः | expansio binaria | `[ASSUMED]` |
| 35 | square / multiply step | kwadrateer-/vermenigvuldigstap | Quadrier-/Multiplikationsschritt | étape d'élévation au carré / multiplication | paso de elevar al cuadrado / multiplicar | passo di elevamento al quadrato / di moltiplicazione | krok podnoszenia do kwadratu / mnożenia | passo de elevar ao quadrado / de multiplicar | passo de elevar ao quadrado / de multiplicar | kvadreringssteg / multiplikationssteg | kvadreringssteg / multiplikasjonssteg | pas de ridicare la pătrat / pas de înmulțire | négyzetre emelési lépés / szorzási lépés | kāpināšanas kvadrātā solis / reizināšanas solis | шаг возведения в квадрат / шаг умножения | βήμα τετραγωνισμού / βήμα πολλαπλασιασμού | צעד העלאה בריבוע / כפל | वर्ग / गुणा चरण | خطوة التربيع والضرب | hapi i ngritjes në katror / i shumëzimit | hatua ya mraba / ya kuzidisha | 平方步 / 乘法步 | 二乗ステップ / 乗算ステップ | 제곱 단계 / 곱셈 단계 | langkah kuadrat / langkah perkalian | asurif n uskkuẓ / asurif n usgut `[ASSUMED]` | ⴰⵙⵓⵔⵉⴼ ⵏ ⵓⵙⴽⴽⵓⵥ / ⴰⵙⵓⵔⵉⴼ ⵏ ⵓⵙⴳⵓⵜ `[ASSUMED]` | gava çargoşekirinê / gava lêkdanê | ھەنگاوی دووجاکردن / ھەنگاوی لێکدان | वर्गकरणपदम् / गुणनपदम् | gradus quadrandi / gradus multiplicandi | `[ASSUMED]` |
| 36 | public key | publieke sleutel | öffentlicher Schlüssel | clé publique | clave pública | chiave pubblica | klucz publiczny | chave pública | chave pública | publik nyckel | offentlig nøkkel | cheie publică | nyilvános kulcs | publiskā atslēga | открытый ключ | δημόσιο κλειδί | מפתח ציבורי | सार्वजनिक कुंजी | المفتاح العام | çelësi publik | ufunguo wa umma | 公钥 | 公開鍵 | 공개 키 | kunci publik | tasarut tamatayt `[ASSUMED]` | ⵜⴰⵙⴰⵔⵓⵜ ⵜⴰⵎⴰⵜⴰⵢⵜ `[ASSUMED]` | kilîta giştî | کلیلی گشتی | सार्वजनिककुञ्जिका | clavis publica | `[ASSUMED]` |
| 37 | private key | privésleutel | privater Schlüssel | clé privée | clave privada | chiave privata | klucz prywatny | chave privada | chave privada | privat nyckel | privat nøkkel | cheie privată | titkos kulcs (privát kulcs) | privātā atslēga | закрытый ключ | ιδιωτικό κλειδί | מפתח פרטי | निजी कुंजी | المفتاح الخاص | çelësi privat | ufunguo binafsi | 私钥 | 秘密鍵 | 개인 키 | kunci privat | tasarut tusligt `[ASSUMED]` | ⵜⴰⵙⴰⵔⵓⵜ ⵜⵓⵙⵍⵉⴳⵜ `[ASSUMED]` | kilîta taybet | کلیلی تایبەت | निजकुञ्जिका | clavis privata | `[ASSUMED]` |
| 38 | key pair | sleutelpaar | Schlüsselpaar | paire de clés | par de claves | coppia di chiavi | para kluczy | par de chaves | par de chaves | nyckelpar | nøkkelpar | pereche de chei | kulcspár | atslēgu pāris | пара ключей | ζεύγος κλειδιών | זוג מפתחות | कुंजी युग्म | زوج مفاتيح | çifti i çelësave | jozi ya funguo | 密钥对 | 鍵ペア | 키 쌍 | pasangan kunci | tayuga n tsura `[ASSUMED]` | ⵜⴰⵢⵓⴳⴰ ⵏ ⵜⵙⵓⵔⴰ `[ASSUMED]` | cotê kilîtan | جووتە کلیل | कुञ्जिकायुग्मम् | par clavium | `[ASSUMED]` |
| 39 | shared secret | gedeeld geheim | gemeinsames Geheimnis | secret partagé | secreto compartido | segreto condiviso | wspólny sekret | segredo compartilhado | segredo partilhado | delad hemlighet | delt hemmelighet | secret comun | közös titok | kopīgais noslēpums | общий секрет | κοινό μυστικό | סוד משותף | साझा रहस्य | السر المشترك | sekreti i përbashkët | siri ya pamoja | 共享秘密 | 共有秘密 | 공유 비밀 | rahasia bersama | tuffra tamcrikt `[ASSUMED]` | ⵜⵓⴼⴼⵔⴰ ⵜⴰⵎⵛⵔⵉⴽⵜ `[ASSUMED]` | razê hevpar | نھێنیی ھاوبەش | साधारणरहस्यम् | secretum commune | `[ASSUMED]` |
| 40 | encrypt | versleutelen | verschlüsseln | chiffrer | cifrar | cifrare | szyfrować | criptografar (cifrar) | cifrar (encriptar) | kryptera | kryptere | a cripta | titkosít | šifrēt | зашифровать | κρυπτογραφώ | הצפנה (להצפין) | कूटलेखन (करना) | تشفير | enkriptim | kusimba fiche | 加密 | 暗号化 | 암호화 | enkripsi (mengenkripsi) | sffr (asffr) `[ASSUMED]` | ⵙⴼⴼⵔ (ⴰⵙⴼⴼⵔ) `[ASSUMED]` | şîfre kirin (şîfrekirin) | شفرەکردن | कूटलेखनम् | cryptare (cryptatio) | `[ASSUMED]` |
| 41 | decrypt | ontsleutelen | entschlüsseln | déchiffrer | descifrar | decifrare | odszyfrować | descriptografar (decifrar) | decifrar (desencriptar) | dekryptera | dekryptere | a decripta | visszafejt | atšifrēt | расшифровать | αποκρυπτογραφώ | פענוח (לפענח) | विकूटन (करना) | فك التشفير | dekriptim | kusimbua | 解密 | 復号 | 복호화 | dekripsi (mendekripsi) | kks asffr (akkas n usffr) `[ASSUMED]` | ⴽⴽⵙ ⴰⵙⴼⴼⵔ (ⴰⴽⴽⴰⵙ ⵏ ⵓⵙⴼⴼⵔ) `[ASSUMED]` | şîfre vekirin (şîfrevekirin) | کردنەوەی شفرە | विकूटनम् | decryptare (decryptatio) | `[ASSUMED]` |
| 42 | plaintext | leesbare tekst (plaintext) | Klartext | texte en clair | texto plano | testo in chiaro | tekst jawny | texto simples | texto em claro | klartext | klartekst | text clar | nyílt szöveg | atklātais teksts | открытый текст | απλό κείμενο | טקסט גלוי | मूल पाठ | النص الصريح | teksti i hapur | maandishi wazi | 明文 | 平文 | 평문 | plainteks | aḍris amzwaru `[ASSUMED]` | ⴰⴹⵔⵉⵙ ⴰⵎⵣⵡⴰⵔⵓ `[ASSUMED]` | nivîsa vekirî | دەقی ئاشکرا | मूलपाठः | textus apertus | `[ASSUMED]` |
| 43 | ciphertext | cijfertekst | Geheimtext | texte chiffré | texto cifrado | testo cifrato | szyfrogram | texto cifrado | texto cifrado | chiffertext | chiffertekst | text cifrat | titkosított szöveg | šifrteksts | шифртекст | κρυπτοκείμενο | טקסט מוצפן | कूटपाठ | النص المشفر | teksti i enkriptuar | maandishi fiche | 密文 | 暗号文 | 암호문 | cipherteks | aḍris ittusffrn `[ASSUMED]` | ⴰⴹⵔⵉⵙ ⵉⵜⵜⵓⵙⴼⴼⵔⵏ `[ASSUMED]` | nivîsa şîfrekirî | دەقی شفرەکراو | कूटपाठः | textus cryptatus | `[ASSUMED]` |
| 44 | discrete logarithm | discrete logaritme | diskreter Logarithmus | logarithme discret | logaritmo discreto | logaritmo discreto | logarytm dyskretny | logaritmo discreto | logaritmo discreto | diskret logaritm | diskret logaritme | logaritm discret | diszkrét logaritmus | diskrētais logaritms | дискретный логарифм | διακριτός λογάριθμος | לוגריתם דיסקרטי | असतत लघुगणक | اللوغاريتم المتقطع | logaritmi diskret | logarithimu diskreti | 离散对数 | 離散対数 | 이산 로그 | logaritma diskret | alugaritm adiskrit `[ASSUMED]` | ⴰⵍⵓⴳⴰⵔⵉⵜⵎ ⴰⴷⵉⵙⴽⵔⵉⵜ `[ASSUMED]` | logarîtma veqetandî | لۆگاریتمی دابڕاو | विविक्तलघुगणकः | logarithmus discretus | `[ASSUMED]` |
| 45 | brute force | brute kracht | Brute-Force | force brute | fuerza bruta | forza bruta | metoda siłowa (atak siłowy) | força bruta | força bruta | totalsökning (råstyrka) | uttømmende søk (rå kraft) | forță brută | nyers erő (teljes kipróbálás) | pilnā pārlase (brutālā spēka metode) | полный перебор | εξαντλητική αναζήτηση (ωμή βία) | כוח גס | ब्रूट-फ़ोर्स | القوة الغاشمة | forca brutale | nguvu ghafi | 暴力破解 | 総当たり | 무차별 대입 | pencarian menyeluruh | akayad n tifrat akk `[ASSUMED]` | ⴰⴽⴰⵢⴰⴷ ⵏ ⵜⵉⴼⵔⴰⵜ ⴰⴽⴽ `[ASSUMED]` | ceribandina hemû îhtîmalan | تاقیکردنەوەی ھەموو ئەگەرەکان | सर्वपरीक्षणम् | vis bruta | `[ASSUMED]` |
| 46 | elliptic curve | elliptische kromme | elliptische Kurve | courbe elliptique | curva elíptica | curva ellittica | krzywa eliptyczna | curva elíptica | curva elíptica | elliptisk kurva | elliptisk kurve | curbă eliptică | elliptikus görbe | eliptiskā līkne | эллиптическая кривая | ελλειπτική καμπύλη | עקום אליפטי | दीर्घवृत्तीय वक्र | منحنى إهليلجي | kurbë eliptike | mkunjo duaradufu | 椭圆曲线 | 楕円曲線 | 타원 곡선 | kurva eliptik | tazligt tilibtikt, tizligin tilibtikin `[ASSUMED]` | ⵜⴰⵣⵍⵉⴳⵜ ⵜⵉⵍⵉⴱⵜⵉⴽⵜ, ⵜⵉⵣⵍⵉⴳⵉⵏ ⵜⵉⵍⵉⴱⵜⵉⴽⵉⵏ `[ASSUMED]` | kevana elîptîk | چەماوەی ئیلیپتیکی | दीर्घवृत्तीयवक्रः | curva elliptica | `[ASSUMED]` |
| 47 | point at infinity | punt op oneindig | Punkt im Unendlichen | point à l'infini | punto en el infinito | punto all'infinito | punkt w nieskończoności | ponto no infinito | ponto no infinito | punkten i oändligheten | punktet i det uendelige | punctul de la infinit | végtelen távoli pont | bezgalības punkts | бесконечно удалённая точка | σημείο στο άπειρο | נקודה באינסוף | अनंत पर बिंदु | النقطة في اللانهاية | pika në pafundësi | nukta isiyo na kikomo | 无穷远点 | 無限遠点 | 무한원점 | titik di tak hingga | tanqqiḍt g war tilas `[ASSUMED]` | ⵜⴰⵏⵇⵇⵉⴹⵜ ⴳ ⵡⴰⵔ ⵜⵉⵍⴰⵙ `[ASSUMED]` | xala li bêdawiyê | خاڵی بێکۆتایی | अनन्तस्थबिन्दुः | punctum ad infinitum | `[ASSUMED]` |
| 48 | scalar multiplication | scalaire vermenigvuldiging | Skalarmultiplikation | multiplication scalaire | multiplicación escalar | moltiplicazione scalare | mnożenie przez skalar | multiplicação escalar | multiplicação escalar | skalär multiplikation | skalarmultiplikasjon | înmulțire cu un scalar | skalárral való szorzás | skalārā reizināšana | скалярное умножение | βαθμωτός πολλαπλασιασμός | כפל בסקלר | अदिश गुणन | الضرب القياسي | shumëzimi skalar | kuzidisha kwa skala | 标量乘法 | スカラー倍算 | 스칼라 곱셈 | perkalian skalar | asgut askalir `[ASSUMED]` | ⴰⵙⴳⵓⵜ ⴰⵙⴽⴰⵍⵉⵔ `[ASSUMED]` | lêkdana skalar | لێکدانی سکالار | अदिशगुणनम् | multiplicatio scalaris | `[ASSUMED]` |
| 49 | order finding | ordebepaling | Ordnungsbestimmung | recherche d'ordre | búsqueda de orden | ricerca dell'ordine | wyznaczanie rzędu | determinação da ordem | determinação da ordem | ordningsbestämning | ordensbestemmelse | determinarea ordinului | rendmeghatározás | kārtas noteikšana | нахождение порядка | εύρεση τάξης | מציאת סדר | कोटि ज्ञात करना | إيجاد الرتبة | gjetja e rendit | kupata daraja | 求阶 | 位数発見 | 위수 찾기 | pencarian orde | asiggl n urdr `[ASSUMED]` | ⴰⵙⵉⴳⴳⵍ ⵏ ⵓⵔⴷⵔ `[ASSUMED]` | dîtina rêzê | دۆزینەوەی پلە | कोटिनिर्धारणम् | inventio ordinis | `[ASSUMED]` |
| 50 | period | periode | Periode | période | periodo | periodo | okres | período | período | period | periode | perioadă | periódus | periods | период | περίοδος | מחזור | आवर्त | الدورة | perioda | kipindi | 周期 | 周期 | 주기 | periode | tallit `[ASSUMED]` | ⵜⴰⵍⵍⵉⵜ `[ASSUMED]` | dewr | خول | आवर्तः | periodus | `[ASSUMED]` |
| 51 | preset / example | voorbeeld | Beispiel | exemple | ejemplo | esempio | przykład | exemplo | exemplo | exempel | eksempel | exemplu | példa | piemērs | пример | παράδειγμα | דוגמה | उदाहरण | مثال | shembull | mfano | 示例 | 例 | 예시 | contoh | amdya, imdyatn `[CITED]` | ⴰⵎⴷⵢⴰ, ⵉⵎⴷⵢⴰⵜⵏ `[CITED]` | mînak | نموونە | उदाहरणम् | exemplum | `[ASSUMED]` |
| 52 | step (playback) | stap | Schritt | étape | paso | passo | krok | passo | passo | steg | steg | pas | lépés | solis | шаг | βήμα | צעד | चरण | خطوة | hap | hatua | 单步 | ステップ | 단계 | langkah | asurif `[ASSUMED]` | ⴰⵙⵓⵔⵉⴼ `[ASSUMED]` | gav | ھەنگاو | पदम् | gradus | `[ASSUMED]` — matches `common.step` |
| 53 | playback | afspelen | Wiedergabe | lecture | reproducción | riproduzione | odtwarzanie | reprodução | reprodução | uppspelning | avspilling | redare | lejátszás | atskaņošana | воспроизведение | αναπαραγωγή | הפעלה | प्लेबैक | التشغيل | luajtja | uchezaji | 播放 | 再生 | 재생 | pemutaran | turart `[ASSUMED]` | ⵜⵓⵔⴰⵔⵜ `[ASSUMED]` | lêxistin | لێدان | चालनम् | decursus | `[ASSUMED]` |

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

### Hindi supplementary terms (added 2026-10-06 by quick task 261006-vpp, Tasks 2-4, unified in Task 5)

Terms chosen while translating the pages in parallel, after the cross-batch unification
pass; the hi column of the table above holds citation forms (a few — "order of an element",
"cyclic group", "binary expansion", "square / multiply step", "plaintext" — appear in the
UI only inflected or as their parts: कोटि, चक्र, द्विआधारी, वर्ग / गुणा, संदेश), and the
shipped values inflect them. One Hindi rendering per English concept across all 18
namespaces. All `[ASSUMED]`.

| Term (en) | hi | Used in |
|---|---|---|
| palette | पैलेट | common, Sieve, Factor Tree, Venn |
| box / cell (grid) | खाना | Hub, Sieve, Cayley |
| residue (class strips) | अवशेष (अवशेष वर्ग पट्टियाँ) | CRT |
| unit (group element) | इकाई | Hub, Wheel, Isomorphism |
| cryptography / cryptographic | क्रिप्टोग्राफ़ी / क्रिप्टोग्राफ़िक | Hub, Square and Multiply, DH, ECDH |
| Randomize (button) | यादृच्छिक करें | Factor Tree, Venn, Wheel, Cayley, Isomorphism, Square and Multiply, DH, ECDH, Shor |
| composition/factorization area | संयोजन/गुणनखंडन क्षेत्र | Factor Tree |
| bin (trash) | कूड़ेदान | Factor Tree, Venn |
| clear / clear all | साफ़ करें / सब साफ़ करें | Factor Tree, Venn |
| wedge (wheel sector) | फाँक | Hub, Wheel, Totient, Cayley |
| overlap (noun) | अधिव्यापन | Factor Tree, Venn |
| overlap region | उभयनिष्ठ भाग | Hub |
| intersection | प्रतिच्छेदन | Hub, Venn, ECDH |
| union | संघ | Venn |
| set difference | समुच्चय अंतर | Venn |
| simultaneous (solution) | युगपत हल | Hub, CRT |
| pairwise coprime | युग्मानुसार सह-अभाज्य | CRT |
| system (of congruences) | निकाय | CRT |
| construction (CRT) | रचना | CRT, ECDH |
| span | विस्तार | CRT |
| tile | टाइल | Euclid |
| leftover | बचा हुआ भाग | Euclid |
| nested squares | समाए हुए वर्ग | Euclid |
| Bézout coefficients | बेज़ू गुणांक | Euclid |
| derivation | व्युत्पत्ति | Euclid, DH, ECDH |
| diagnostic mismatch | जाँच में असंगति | CRT |
| scan | स्कैन | CRT |
| Run (button, distinct from Play) | शुरू करें | Euclid |
| Compute / Run (Totient, Square and Multiply) | गणना करें | Totient, Square and Multiply |
| trivial pair | तुच्छ जोड़ी | Fermat |
| trail | पथ | Fermat |
| search log | खोज लॉग | Fermat |
| trial | परीक्षण | Fermat, RSA |
| keys Enter / Space / Delete | एंटर / स्पेस / डिलीट | Venn |
| concentric ring (wheel) | संकेंद्री छल्ला | Hub, Wheel |
| addend | योज्य | Wheel |
| sum | योगफल | Wheel |
| product | गुणनफल | Hub, Venn, Wheel, Isomorphism |
| factor (in a multiplication) | गुणक | Wheel |
| its own negative / reciprocal | अपना ही योगात्मक प्रतिलोम / अपना ही गुणात्मक प्रतिलोम | Cayley |
| image (of an element) | प्रतिबिंब | Factor Tree, Venn, Cayley, Isomorphism, ECDH |
| correspondence | अनुरूपता | Isomorphism |
| accumulator | संचायक | Square and Multiply |
| ladder | सीढ़ी | Square and Multiply |
| place value | स्थानीय मान | Square and Multiply |
| non-negative | अऋणात्मक | Square and Multiply, RSA |
| eavesdropper | छिपकर सुनने वाला | DH |
| wire tap | टैप / टैपिंग | DH, ECDH, RSA |
| parameters | प्राचल | DH |
| subgroup | उपसमूह | DH, ECDH |
| search space | खोज-क्षेत्र | DH, ECDH |
| Export / dialog | निर्यात / संवाद | Wheel |
| teaching demo / demo | शिक्षण प्रदर्शन / प्रदर्शन | Square and Multiply, DH, ECDH, RSA |
| key-derivation function | कुंजी-व्युत्पत्ति फलन | DH, ECDH |
| key exchange | कुंजी विनिमय | Hub, Square and Multiply, DH, ECDH |
| scatter plot | प्रकीर्ण आलेख | Hub, ECDH |
| singular (curve) | विलक्षण | ECDH |
| tangent / chord | स्पर्श रेखा / जीवा | ECDH |
| slope / intercept | ढलान / अंतःखंड | ECDH |
| midline | मध्य रेखा | ECDH |
| ord / order (of a point, element) | कोटि | Hub, DH, ECDH, Shor |
| textbook RSA | पाठ्यपुस्तकीय RSA | RSA, Shor |
| extended Euclidean algorithm | विस्तारित यूक्लिडीय एल्गोरिथ्म | RSA |
| trial division | परीक्षण-भाग | RSA |
| candidate divisor | उम्मीदवार भाजक | RSA |
| index calculus | सूचकांक कलन | RSA |
| recombination | पुनर्संयोजन | RSA |
| precomputation | पूर्व-गणना | RSA |
| Garner's formula | गार्नर का सूत्र | RSA |
| operand | ऑपरेंड | RSA |
| classical | क्लासिकल | Hub, Shor |
| quantum | क्वांटम | Hub, Shor |
| superposition | अध्यारोपण | Shor |
| phase estimation | कला आकलन | Shor |
| inverse QFT | प्रतिलोम क्वांटम फ़ूरिये रूपांतरण | Shor |
| perfect power | पूर्ण घात | Shor |
| pre-checks | पूर्व-जाँच | Shor |
| post-processing | पश्च-प्रसंस्करण | Shor |
| parity | समता | Shor |
| stand-in | विकल्प | Hub, Shor |
| cycle walk | चक्र-भ्रमण | Shor |
| ring diagram (Shor) | छल्ला आरेख | Shor |
| truncation | काट-छाँट | Shor |
| amplitude | आयाम | Shor |
| whole number / integer | पूर्ण संख्या / पूर्णांक | Hub, Factor Tree, Venn, Euclid, CRT, Fermat, Totient, Cayley, Isomorphism, Square and Multiply, DH, ECDH, RSA, Shor |
| use / used | उपयोग | common, Factor Tree, Square and Multiply, DH, ECDH, RSA, Shor |
| function | फलन | site, Hub, Totient, DH, ECDH, RSA, Shor |
| Classic (factor-tree mode, distinct from "classical") | क्लासिक | Factor Tree |
| factorize (verb, button / label) | गुणनखंडन करें | Fermat, Shor |
| real (opposed to toy) vs. actual / genuine | असली vs. वास्तविक | RSA, DH, Shor, Euclid |

Unification decisions (Task 5; the left form was shipped by one batch and replaced by the
right one site-wide): Randomize यादृच्छिक बनाएँ → यादृच्छिक करें; demo डेमो → प्रदर्शन
("teaching demo" शिक्षण प्रदर्शन everywhere); इस्तेमाल / प्रयोग / प्रयुक्त → उपयोग;
फ़ंक्शन → फलन (the key-derivation function is कुंजी-व्युत्पत्ति फलन in both DH and
ECDH); "whole number" पूर्णांक → पूर्ण संख्या (पूर्णांक is kept only for English
"integer"); "real" वास्तविक → असली where the English says real / toy-versus-real;
cryptography कूटविज्ञान → क्रिप्टोग्राफ़ी (the family क्रिप्टोग्राफ़ी / क्रिप्टोग्राफ़िक);
"its own reciprocal" व्युत्क्रम → अपना ही गुणात्मक प्रतिलोम and "inverse QFT" व्युत्क्रम →
प्रतिलोम (प्रतिलोम is the one word for inverse); visual rings वलय → छल्ला (Wheel, Hub and
Shor's ring diagram; वलय is reserved for the algebraic ring); "order finding" कोटि-खोज →
कोटि ज्ञात करना (the English "order search" stays कोटि की खोज); non-negative ऋणेतर →
अऋणात्मक; valid वैध → मान्य; toy-sized खिलौना-आकार के → खिलौने के आकार के; "remainder"
शेष → शेषफल in the hub card; "stand-in" प्रतिस्थापन → विकल्प; "Group Isomorphisms" in the
hub card plural → समूह तुल्याकारिता (the page and nav form). Identical English strings in
the DH and ECDH pages (`bannerReady`, `notebookHeading`, the `log*CrossHeading` and
`logTheyAgreeHeading` headings, `eveBruteForceBtn`, `logHeading`) now carry identical Hindi.
Checked and kept: gcd / lcm spelled out in prose and म.स. only in Shor's pill and step
labels; घातांक (exponent) vs. घात (power); Euclid "Run" शुरू करें and Totient / Square
and Multiply "Compute" गणना करें label different actions and neither collides with
Play (चलाएँ); wedge फाँक (Hub, Wheel, Totient, Cayley); residue अवशेष (CRT's residue
class strips; the remainder of a division is शेषफल); cell / box खाना (Sieve, Cayley,
Hub).


### Arabic supplementary terms (added 2026-10-07 by quick task 261007-fhx, Tasks 2-4, unified in Task 5)

Terms chosen while translating the pages in parallel (Tasks 2-4 listed them as "Terms
coined:" in their commit messages), after the cross-batch unification pass; the ar column of
the (c) table holds citation forms and the shipped values inflect them (definite ال-,
construct state, dual and plural). One Arabic rendering per English concept across all 18
namespaces; each row below was verified present by script in the namespaces named. All
`[ASSUMED]`.

| Term (en) | ar | Used in |
|---|---|---|
| box (Sieve grid cell) | مربع | Cayley, Euclid, Fermat, Hub, RSA, Sieve |
| cell (Cayley table) | خلية | Cayley, Hub |
| unit (invertible element) | القابلة للعكس | Wheel, Isomorphism, Hub |
| residue class strips | شرائط أصناف الباقي | CRT |
| clear / clear all | مسح الكل | Venn |
| undo / redo | تراجع | common |
| palette (number palette) | اللوحة | Factor Tree, Sieve, common, Venn |
| bin (delete target) | السلة | Factor Tree, Venn |
| composition/factorization area | منطقة التركيب/التحليل | Factor Tree |
| region (Venn) | المنطقة | Venn |
| lens (A ∩ B) | عدسة | Hub, Venn |
| union | اتحاد | Venn |
| intersection | التقاطع | CRT, Venn |
| nested squares | مربعات متداخلة | Euclid |
| collapsed tile | بلاطة | Euclid |
| Bézout coefficients | معاملات بيزو | Euclid |
| extended Euclidean algorithm | خوارزمية إقليدس الممتدة | CRT, RSA |
| pairwise coprime | أولية فيما بينها مثنى مثنى | CRT |
| span (CRT) | المدى | CRT |
| trial | المحاولة | Wheel, Fermat, Shor |
| search log | سجل البحث | Fermat |
| geometric picture | صورة هندسية | Fermat |
| Randomize | توليد عشوائي | Cayley, Diffie-Hellman, Wheel, Factor Tree, Isomorphism, Square and Multiply, Venn |
| Run (button) | تنفيذ | Euclid, Totient |
| trivial pair | الزوج البديهي | Fermat |
| slider | شريط تمرير | Hub |
| keyboard keys Enter / Space / Delete | مفتاح الإدخال | Venn |
| addend | المضاف | Wheel |
| sum | المجموع | ECDH, Wheel, Isomorphism, Square and Multiply |
| product | حاصل الضرب | Wheel, Isomorphism |
| first / second factor | العامل الأول | Wheel |
| adding (verbing) | جمع | ECDH, Wheel, Isomorphism, Hub |
| multiplying (verbing) | ضرب | ECDH, Wheel, Isomorphism, Hub, RSA, Shor, site, Square and Multiply, Venn |
| wedge | قطاع | Wheel, Hub |
| concentric rings | حلقات متحدة المركز | Wheel |
| reference row | صف مرجعي | Wheel |
| own negative | معكوس نفسه الجمعي | Cayley |
| own reciprocal | معكوس نفسه الضربي | Cayley |
| subgroup | زمرة جزئية | Diffie-Hellman, ECDH |
| diagonal | القطر | Cayley |
| accumulator | المراكم | Square and Multiply |
| ladder | السلم | Square and Multiply |
| squaring | التربيع | Hub, RSA, site, Square and Multiply |
| scalar (private scalar) | عددا قياسيا | ECDH |
| public values | القيم العامة | Diffie-Hellman |
| tap (on the wire) | وصلة التنصت | Diffie-Hellman, RSA |
| notebook (Eve's) | دفتر | Diffie-Hellman, ECDH, RSA |
| safe prime | عدد أولي آمن | Diffie-Hellman |
| primitive root | جذر بدائي | Diffie-Hellman |
| scatter plot | مخطط نقطي | ECDH, Hub |
| singular curve | شاذ | ECDH |
| tangent | المماس | ECDH |
| chord | الوتر | ECDH |
| slope | الميل | ECDH |
| base point | نقطة الأساس | ECDH |
| Hasse bound | حد هاسه | ECDH |
| textbook RSA | RSA بصيغتها الدراسية | RSA |
| padding scheme | مخطط حشو | RSA |
| trial division | القسمة التجريبية | RSA |
| Garner's formula | صيغة غارنر | RSA |
| continued fraction | الكسر المستمر | Shor |
| quantum phase estimation | تقدير الطور الكمومي | Shor |
| inverse quantum Fourier transform | تحويل فورييه الكمومي العكسي | Shor |
| superposition | تراكب | Shor |
| quantum stand-in | البديل الكمومي | Shor |
| order finding | إيجاد الرتبة | Hub, Shor |
| classical pre-checks | الفحوص الكلاسيكية المسبقة | Shor |
| amplitudes | السعات | Shor |
| hardware | العتاد | RSA, Shor |
| step budget | ميزانية | Shor |

Conventions settled across the batches: a frame and the word fed into its slot are written
together so no agreement is needed — Wheel's `{word}` and the role words after "لاختيار" are
definite nouns (المضاف الأول، العامل الأول، المجموع، حاصل الضرب), its `{verbing}` / `{joiner}`
pairs are the verbal nouns جمع … إلى and ضرب … في, Cayley's `{word}` takes the definite
nouns الصفر / الواحد and the construct phrases معكوس نفسه الجمعي / الضربي, ECDH's `{ordWord}`
is the bare noun رتبة inside its LTR isolate, and the Venn link labels fill the frame
"انقر نقرا مزدوجا من أجل {a}" (a free word, never the proclitic لـ on a placeholder); a slot
whose count is unknown is written as "عددها {n}" / "عدد … : {n}" instead of a noun that would
need a number-dependent form; Arabic phrases inside an LTR-forced formula box take U+2067 …
U+2069 exactly where the he value does (sqm `mulBase` and `binaryExpansionZero`, dh
`logSecretExpFormula`, `logAliceSecretLabel`, `logBobSecretLabel`); the keyboard keys Enter,
Space and Delete are spelled out as مفتاح الإدخال / المسافة / الحذف (a Latin key name would
break the script rule); the English "→" in "Open tool →" style links and in "→ fast" asides
becomes ←; identical English strings on the DH and ECDH pages carry identical Arabic
("Arithmetic log" is سجل العمليات الحسابية everywhere).

### Albanian and Swahili supplementary terms (added 2026-10-07 by quick task 261007-k4o, Tasks 2-4, unified in Task 5)

Terms chosen while translating the pages in batches (Tasks 2-4 listed them as "Terms coined:"
in their commit messages), after the cross-batch unification pass; the sq and sw columns of the
(c) table hold citation forms and the shipped values inflect them (Albanian definiteness, case
and plural; Swahili noun-class agreement). One Albanian and one Swahili rendering per English
concept across all 18 namespaces; each row below was verified present by script in the
namespaces named. The even/odd pair follows D-AVOID: Swahili never writes the rejected spelling
"shufwa" (the plan reserves it for "even" and bans it as a rendering of "composite"), so "even"
is rendered as the clause "inagawanyika kwa mbili"; Swahili "witiri" is "odd". All `[ASSUMED]`.

| Term (en) | sq | sw | Used in |
|---|---|---|---|
| number palette | paleta e numrave | paleti ya namba | Factor Tree, Venn, common |
| region (diagram zone) | zonë | eneo | Venn |
| lens (the A ∩ B shape) | thjerrëz | lenzi | Hub, Venn |
| wedge | fetë | kipande | Wheel, Hub |
| circle (Venn) | rreth | duara | Venn, Hub |
| bin (palette trash) | koshi (i mbeturinave) | pipa | Factor Tree, Venn |
| odd number | numër tek | namba witiri | Fermat, RSA |
| even number | numër çift | inagawanyika kwa mbili | Fermat, Shor |
| trivial pair | çifti trivial | jozi dhahiri | Fermat |
| complete the square | plotësoj katrorin | kukamilisha mraba | Fermat |
| tile (Euclid rectangle tiling) | pllakë | kigae | Euclid |
| nested squares | katrorë të futur | miraba iliyoingiliana | Euclid |
| Bézout coefficients | koeficientët Bézout | vigawo vya Bézout | Euclid |
| quotient | herës | mgawo | Euclid |
| fold / unfold (factor tree) | palos / shpalos | kunja / kunjua | Factor Tree |
| union / intersection | bashkim / prerje | muungano / makutano | Venn |
| ladder (Square and Multiply) | shkallë | ngazi | Square and Multiply |
| accumulator | akumulator | kikusanyaji | Square and Multiply |
| preset chip | çip | kitufe cha mfano | Totient |
| teaching demo | demonstrim mësimor | onyesho la kufundishia | Diffie-Hellman, ECDH, Square and Multiply |
| toy-sized | në përmasa lodre | ukubwa wa kuchezea | Diffie-Hellman, ECDH, RSA |
| keypair | çifti i çelësave | jozi ya funguo | RSA, Hub |
| tap (eavesdropper's) | përgjim | kinasa | Diffie-Hellman, ECDH, RSA |
| notebook (Eve's) | fletore | daftari | Diffie-Hellman, ECDH, RSA |
| safe prime | numër i thjeshtë i sigurt | namba tasa salama | Diffie-Hellman |
| discrete logarithm | logaritëm diskret | logarithimu diskreti | Diffie-Hellman, ECDH, RSA |
| Hasse bound | kufiri Hasse | kikomo cha Hasse | ECDH |
| tangent / chord construction | ndërtimi me tangjente / me kordë | ujenzi wa tanjenti / wa kamba | ECDH |
| slope / intercept | pjerrësia / prerja | mteremko / kikatiza | ECDH |
| scalar | skalar | skala | ECDH |
| base point | pika bazë | nukta ya msingi | ECDH |
| singular curve | kurbë singulare | mkunjo singula | ECDH |
| superposition | superpozicion | mchanganyiko wa hali | Shor |
| quantum phase estimation | vlerësim kuantik i fazës | makadirio ya awamu ya kikwanta | Shor |
| continued fraction | thyesë (e) vazhduar | sehemu endelevu | Shor |
| Fourier transform (inverse quantum) | transformim i anasjellë kuantik Fourier | mageuzi ya Fourier ya kikwanta ya kinyume | Shor |
| Garner's formula | formula e Garner | fomula ya Garner | RSA |
| padding | mbushje | padding | RSA |
| textbook RSA | RSA shkollor | RSA ya kitabuni | RSA |
| trial division | pjesëtim provë | mgawanyo wa majaribio | RSA |

### Chinese, Japanese and Korean supplementary terms (added 2026-10-07 by quick task 261007-pbf, Tasks 2-5, unified in Task 6)

Domain terms the pinned D-TERMS list did not cover, as coined while translating the 16 pages. One Chinese (Simplified), one Japanese and one Korean rendering per English term, verified to occur in the named namespaces; the Chinese renderings are Simplified forms, the Japanese ones shinjitai, the Korean ones Hangul only. The "also" terms of D-TERMS (algorithm, theorem, function, palette, order) come first. All `[ASSUMED]`.

| Term (en) | zh | ja | ko | Namespaces | Confidence |
|---|---|---|---|---|---|
| algorithm | 算法 | アルゴリズム | 알고리즘 | euclid, sqm, shor, totient | `[ASSUMED]` |
| theorem | 定理 | 定理 | 정리 | crt | `[ASSUMED]` |
| function (totient function) | 函数 | 関数 | 함수 | totient, rsa | `[ASSUMED]` |
| palette | 调色板 | パレット | 팔레트 | factorTree, venn, common | `[ASSUMED]` |
| order (ordWord, {ordWord}(G)) | 阶 | 位数 | 위수 | ecdh, dh | `[ASSUMED]` |
| composition/factorization area | 组合/因数分解区域 | 構成/因数分解エリア | 구성/인수분해 영역 | factorTree | `[ASSUMED]` |
| region (Venn) | 区域 | 領域 | 영역 | venn | `[ASSUMED]` |
| lens (Venn overlap) | 透镜形 | レンズ形 | 렌즈 모양 | venn, hub | `[ASSUMED]` |
| intersection | 交集 | 共通部分 | 교집합 | venn, hub | `[ASSUMED]` |
| set difference | 差集 | 差集合 | 차집합 | venn | `[ASSUMED]` |
| union | 并集 | 和集合 | 합집합 | venn | `[ASSUMED]` |
| bin (delete target) | 回收站 | ごみ箱 | 휴지통 | factorTree, venn | `[ASSUMED]` |
| Classic mode | 经典 | クラシック | 클래식 | factorTree | `[ASSUMED]` |
| Balanced mode | 均衡 | バランス | 균형 | factorTree | `[ASSUMED]` |
| mirror (the branches) | 镜像 | 左右反転 | 좌우 반전 | factorTree | `[ASSUMED]` |
| hover previews | 悬停预览 | ホバープレビュー | 마우스 오버 미리보기 | venn | `[ASSUMED]` |
| randomize | 随机 | ランダム | 무작위 | factorTree, venn, wheel, cayley, iso, sqm | `[ASSUMED]` |
| trial (Fermat) | 尝试 | 試行 | 시도 | fermat | `[ASSUMED]` |
| search log | 搜索记录 | 探索ログ | 탐색 기록 | fermat | `[ASSUMED]` |
| complete the square | 配方 | 平方完成 | 완전제곱식으로 만 | fermat | `[ASSUMED]` |
| trivial pair | 平凡的一对 | 自明な組 | 자명한 쌍 | fermat | `[ASSUMED]` |
| trail | 路径 | 経路 | 경로 | fermat | `[ASSUMED]` |
| wedge | 扇形 | 扇形 | 부채꼴 | wheel, cayley, totient | `[ASSUMED]` |
| concentric ring | 同心圆环 | 同心円のリング | 동심원 고리 | wheel | `[ASSUMED]` |
| addend | 加数 | 加数 | 항 | wheel | `[ASSUMED]` |
| nested squares | 嵌套正方形 | 入れ子の正方形 | 중첩 정사각형 | euclid | `[ASSUMED]` |
| tile | 方块 | タイル | 타일 | euclid | `[ASSUMED]` |
| Bézout coefficients | 贝祖系数 | ベズー係数 | 베주 계수 | euclid | `[ASSUMED]` |
| residue class strips | 剩余类条带 | 剰余類のストリップ | 잉여류 띠 | crt | `[ASSUMED]` |
| mirror twin (Cayley cell) | 孪生格 | 相棒 | 쌍둥이 | cayley | `[ASSUMED]` |
| accumulator | 累加器 | アキュムレータ | 누산기 | sqm | `[ASSUMED]` |
| ladder | 阶梯 | ラダー | 사다리 | sqm | `[ASSUMED]` |
| safe prime | 安全素数 | 安全素数 | 안전 소수 | dh | `[ASSUMED]` |
| subgroup | 子群 | 部分群 | 부분군 | dh, ecdh | `[ASSUMED]` |
| eavesdrop / tap (the wire) | 窃听 | 盗聴 | 도청 | dh, ecdh, rsa | `[ASSUMED]` |
| wire (the channel) | 线路 | 回線 | 회선 | dh, ecdh, rsa | `[ASSUMED]` |
| notebook (Eve's) | 笔记本 | ノート | 노트 | dh, ecdh, rsa | `[ASSUMED]` |
| key-derivation function | 密钥派生函数 | 鍵導出関数 | 키 유도 함수 | dh, ecdh | `[ASSUMED]` |
| scalar | 标量 | スカラー | 스칼라 | ecdh | `[ASSUMED]` |
| base point | 基点 | 基準点 | 기준점 | ecdh | `[ASSUMED]` |
| Hasse bound | 哈塞界 | ハッセの限界 | 하세 한계 | ecdh | `[ASSUMED]` |
| group law | 群法则 | 群の法則 | 군 법칙 | ecdh | `[ASSUMED]` |
| affine point | 仿射点 | アフィン点 | 아핀 점 | ecdh | `[ASSUMED]` |
| midline | 中线 | 中線 | 중선 | ecdh | `[ASSUMED]` |
| prime field | 素数域 | 素体 | 소수 체 | ecdh, hub | `[ASSUMED]` |
| teaching demo | 教学演示 | 教育用デモ | 교육용 데모 | dh, ecdh | `[ASSUMED]` |
| symmetric encryption | 对称加密 | 対称暗号 | 대칭 암호화 | dh | `[ASSUMED]` |
| textbook RSA | 教科书式 RSA | 教科書的なRSA | 교과서식 RSA | rsa | `[ASSUMED]` |
| trial division | 试除 | 試し割り | 시험 나눗셈 | rsa | `[ASSUMED]` |
| padding | 填充 | パディング | 패딩 | rsa | `[ASSUMED]` |
| integer factorization | 整数分解 | 整数の因数分解 | 정수 인수분해 | rsa | `[ASSUMED]` |
| recombination (CRT) | 重组 | 再結合 | 재결합 | rsa | `[ASSUMED]` |
| precomputation | 预计算 | 事前計算 | 사전 계산 | rsa | `[ASSUMED]` |
| Garner's formula | 加纳公式 | ガーナーの公式 | 가너 공식 | rsa | `[ASSUMED]` |
| superposition | 叠加态 | 重ね合わせ | 중첩 상태 | shor | `[ASSUMED]` |
| quantum phase estimation | 量子相位估计 | 量子位相推定 | 양자 위상 추정 | shor | `[ASSUMED]` |
| inverse quantum Fourier transform | 逆量子傅里叶变换 | 逆量子フーリエ変換 | 역양자 푸리에 변환 | shor | `[ASSUMED]` |
| continued fraction | 连分数 | 連分数 | 연분수 | shor | `[ASSUMED]` |
| stand-in (classical) | 替身 | 代用品 | 대용품 | shor | `[ASSUMED]` |
| perfect power | 完全幂 | 完全べき | 완전 거듭제곱 | shor | `[ASSUMED]` |
| order search (budget) | 求阶搜索 | 位数の探索 | 위수 탐색 | shor | `[ASSUMED]` |

### Indonesian supplementary terms (added 2026-10-08 by quick task 261008-0h2, Tasks 2-4, unified in Task 5)

Domain terms the pinned D-TERMS list did not cover, as coined while translating the 16 pages. One standard Indonesian rendering per English term, verified to occur in the named namespaces. The "also" terms of D-TERMS (algorithm, theorem, function, number, palette, order, random, key, message, bit) come first. All `[ASSUMED]`.

| Term (en) | id | Namespaces | Confidence |
|---|---|---|---|
| algorithm | algoritma | crt, dh, euclid, totient, hub, rsa, shor, site, sqm | `[ASSUMED]` |
| theorem | teorema | crt, hub, site | `[ASSUMED]` |
| function (totient function) | fungsi | dh, ecdh, totient, hub, rsa, shor, site | `[ASSUMED]` |
| number | bilangan | cayley, crt, dh, ecdh, wheel, euclid, totient, factorTree, fermat, iso, hub, rsa, shor, sieve, site, common, sqm, venn | `[ASSUMED]` |
| palette | palet | factorTree, sieve, common, venn | `[ASSUMED]` |
| order (ordWord, {ordWord}(G)) | orde | dh, ecdh, hub, shor | `[ASSUMED]` |
| random | acak | cayley, dh, ecdh, wheel, factorTree, iso, hub, shor, sqm, venn | `[ASSUMED]` |
| key | kunci | dh, ecdh, hub, rsa, sqm | `[ASSUMED]` |
| message | pesan | rsa | `[ASSUMED]` |
| bit | bit | dh, ecdh, hub, rsa, sqm | `[ASSUMED]` |
| composition/factorization area | area komposisi/faktorisasi | factorTree | `[ASSUMED]` |
| region (Venn) | daerah | hub, venn | `[ASSUMED]` |
| lens (Venn overlap) | lensa | hub, venn | `[ASSUMED]` |
| intersection | irisan | hub, venn | `[ASSUMED]` |
| union | gabungan | crt, rsa, venn | `[ASSUMED]` |
| set difference | selisih himpunan | venn | `[ASSUMED]` |
| bin (delete target) | tempat sampah | factorTree, venn | `[ASSUMED]` |
| Classic mode | Klasik | factorTree, hub, shor | `[ASSUMED]` |
| Balanced mode | Seimbang | factorTree, fermat, venn | `[ASSUMED]` |
| hover previews | pratinjau saat disorot | venn | `[ASSUMED]` |
| complete the square | melengkapkan kuadrat | fermat | `[ASSUMED]` |
| trial (Fermat) | percobaan | dh, fermat, rsa, shor | `[ASSUMED]` |
| search log | catatan pencarian | fermat | `[ASSUMED]` |
| trivial pair | pasangan trivial | fermat | `[ASSUMED]` |
| trail | jejak | fermat | `[ASSUMED]` |
| wedge | juring | cayley, wheel, totient, hub | `[ASSUMED]` |
| concentric ring | cincin konsentris | wheel, hub | `[ASSUMED]` |
| addend | suku | wheel | `[ASSUMED]` |
| nested squares | persegi bersarang | euclid | `[ASSUMED]` |
| tile | ubin | euclid | `[ASSUMED]` |
| Bézout coefficients | koefisien Bézout | euclid | `[ASSUMED]` |
| residue class strips | pita kelas residu | crt | `[ASSUMED]` |
| mirror twin (Cayley cell) | kembaran cermin | cayley | `[ASSUMED]` |
| accumulator | akumulator | sqm | `[ASSUMED]` |
| ladder | tangga | sqm | `[ASSUMED]` |
| safe prime | bilangan prima aman | dh | `[ASSUMED]` |
| subgroup | subgrup | dh, ecdh | `[ASSUMED]` |
| eavesdrop / tap (the wire) | menyadap / sadapan | dh, ecdh, rsa | `[ASSUMED]` |
| wire (the channel) | saluran | dh, ecdh, hub, rsa | `[ASSUMED]` |
| notebook (Eve's) | buku catatan | dh, ecdh, rsa | `[ASSUMED]` |
| key-derivation function | fungsi penurunan kunci | dh, ecdh | `[ASSUMED]` |
| scalar | skalar | ecdh, hub | `[ASSUMED]` |
| base point | titik basis | ecdh | `[ASSUMED]` |
| Hasse bound | batas Hasse | ecdh | `[ASSUMED]` |
| group law | hukum grup | ecdh | `[ASSUMED]` |
| affine point | titik afin | ecdh | `[ASSUMED]` |
| midline | garis tengah | ecdh | `[ASSUMED]` |
| prime field | lapangan prima | ecdh, hub | `[ASSUMED]` |
| scatter plot | diagram pencar | ecdh, hub | `[ASSUMED]` |
| tangent / chord | garis singgung / tali busur | ecdh | `[ASSUMED]` |
| slope / intercept | gradien / titik potong | ecdh | `[ASSUMED]` |
| teaching demo | demo pengajaran | dh, ecdh, rsa, sqm | `[ASSUMED]` |
| symmetric encryption | enkripsi simetris | dh | `[ASSUMED]` |
| textbook RSA | RSA versi buku teks | dh, rsa, shor | `[ASSUMED]` |
| trial division | pembagian percobaan | rsa | `[ASSUMED]` |
| padding | pengisian | rsa | `[ASSUMED]` |
| integer factorization | faktorisasi bilangan bulat | rsa | `[ASSUMED]` |
| recombination (CRT) | penggabungan ulang | rsa | `[ASSUMED]` |
| precomputation | perhitungan awal | rsa | `[ASSUMED]` |
| Garner's formula | rumus Garner | rsa | `[ASSUMED]` |
| superposition | superposisi | shor | `[ASSUMED]` |
| quantum phase estimation | estimasi fase kuantum | shor | `[ASSUMED]` |
| inverse quantum Fourier transform | transformasi Fourier kuantum invers | shor | `[ASSUMED]` |
| continued fraction | pecahan berlanjut | shor | `[ASSUMED]` |
| stand-in (classical) | pengganti | hub, shor | `[ASSUMED]` |
| perfect power | pangkat sempurna | shor | `[ASSUMED]` |
| order search (budget) | anggaran langkah | shor | `[ASSUMED]` |
| read-only | hanya baca | venn | `[ASSUMED]` |

### Standard Moroccan Tamazight supplementary terms (added 2026-10-08 by quick task 261008-e2j, Tasks 2-4, unified in Task 5)

Domain terms the pinned D-TERMS list did not cover, plus its "also" terms, as written while translating the 16 pages. One zgh-Latn rendering per English term, verified to occur in the named namespaces (annexed-state forms are marked in the English column); the `zgh-Tfng` cell is the IRCAM transliteration of the cell beside it. `[CITED]` = attested on zgh.wikipedia.org (the article on prime numbers and its math glossary); every other term is `[ASSUMED]`: a neologism built from attested roots, or a French or Arabic term adapted to IRCAM letters where no Tamazight term was found. A native review of this vocabulary is recommended.

| Term (en) | zgh-Latn | zgh-Tfng | Namespaces | Confidence |
|---|---|---|---|---|
| theorem | askkud | ⴰⵙⴽⴽⵓⴷ | crt, hub, site | `[CITED]` |
| mathematics | tusnakt | ⵜⵓⵙⵏⴰⴽⵜ | factorTree, hub, rsa | `[CITED]` |
| theory | tiẓri | ⵜⵉⵥⵔⵉ | cayley, hub, site | `[CITED]` |
| number | amḍan | ⴰⵎⴹⴰⵏ | wheel, totient, factorTree, fermat, hub, rsa, shor, sieve, venn | `[CITED]` |
| natural (number) | agaman | ⴰⴳⴰⵎⴰⵏ | wheel, hub, sieve | `[CITED]` |
| set | tagrumma | ⵜⴰⴳⵔⵓⵎⵎⴰ | crt, ecdh, hub | `[CITED]` |
| union | tamunt | ⵜⴰⵎⵓⵏⵜ | crt, venn | `[CITED]` |
| sum | timrnit | ⵜⵉⵎⵔⵏⵉⵜ | ecdh, wheel, iso | `[CITED]` |
| product | afaris | ⴰⴼⴰⵔⵉⵙ | wheel, hub, venn | `[CITED]` |
| value | azal | ⴰⵣⴰⵍ | cayley, dh, ecdh, euclid, totient, factorTree, rsa, sqm | `[CITED]` |
| diagram | amskan | ⴰⵎⵙⴽⴰⵏ | dh, wheel, hub, shor, site, venn | `[CITED]` |
| formula | tanfalit | ⵜⴰⵏⴼⴰⵍⵉⵜ | hub, rsa | `[CITED]` |
| circle | tawrerrayt | ⵜⴰⵡⵔⴻⵔⵔⴰⵢⵜ | cayley, wheel, factorTree, iso, hub, site | `[CITED]` |
| region | tamnaḍt | ⵜⴰⵎⵏⴰⴹⵜ | dh, ecdh, factorTree, hub, venn | `[CITED]` |
| verify | ssidt | ⵙⵙⵉⴷⵜ | ecdh, rsa, venn | `[CITED]` |
| test (n.) | akayad | ⴰⴽⴰⵢⴰⴷ | crt, dh, ecdh, totient, rsa, shor, sqm | `[CITED]` |
| speed | timmri | ⵜⵉⵎⵎⵔⵉ | common | `[CITED]` |
| zero | ẓiru | ⵥⵉⵔⵓ | cayley, euclid, sqm | `[CITED]` |
| digit | azwil | ⴰⵣⵡⵉⵍ | sqm | `[CITED]` |
| algorithm | alguritm | ⴰⵍⴳⵓⵔⵉⵜⵎ | crt, dh, euclid, totient, hub, rsa, shor, site, sqm | `[ASSUMED]` |
| palette | tabalitt | ⵜⴰⴱⴰⵍⵉⵜⵜ | factorTree, venn | `[ASSUMED]` |
| order (of an element) | urdr | ⵓⵔⴷⵔ | dh, ecdh, euclid, hub, shor | `[ASSUMED]` |
| random | agacur | ⴰⴳⴰⵛⵓⵔ | dh, ecdh | `[ASSUMED]` |
| message | izn | ⵉⵣⵏ | rsa | `[ASSUMED]` |
| bit | abit | ⴰⴱⵉⵜ | hub, rsa, sqm | `[ASSUMED]` |
| tool | allal | ⴰⵍⵍⴰⵍ | crt, hub, site, common, venn | `[ASSUMED]` |
| tree | aseklu | ⴰⵙⴻⴽⵍⵓ | factorTree, hub, site, venn | `[ASSUMED]` |
| multiplication | asgut | ⴰⵙⴳⵓⵜ | ecdh, wheel, rsa, sqm | `[ASSUMED]` |
| division | abḍu | ⴰⴱⴹⵓ | fermat, rsa, shor, venn | `[ASSUMED]` |
| multiple | amsgut | ⴰⵎⵙⴳⵓⵜ | wheel, venn | `[ASSUMED]` |
| browser | brawzr | ⴱⵔⴰⵡⵣⵔ | dh, fermat, hub, sieve, sqm, venn | `[ASSUMED]` |
| box (grid cell) | tankult | ⵜⴰⵏⴽⵓⵍⵜ | hub, sieve | `[ASSUMED]` |
| sound | ṣṣut | ⵚⵚⵓⵜ | hub, sieve | `[ASSUMED]` |
| slider | slaydr | ⵙⵍⴰⵢⴷⵔ | hub | `[ASSUMED]` |
| page (web) | tasna | ⵜⴰⵙⵏⴰ | dh, ecdh, totient, rsa, shor, venn | `[ASSUMED]` |
| site (annexed state usmkan) | usmkan | ⵓⵙⵎⴽⴰⵏ | sqm | `[ASSUMED]` |
| visualizer / show | asskan | ⴰⵙⵙⴽⴰⵏ | fermat, hub, sieve | `[ASSUMED]` |
| animated | animi | ⴰⵏⵉⵎⵉ | hub | `[ASSUMED]` |
| interactive | intiraktif | ⵉⵏⵜⵉⵔⴰⴽⵜⵉⴼ | fermat, sieve, venn | `[ASSUMED]` |
| mode | askil | ⴰⵙⴽⵉⵍ | euclid, factorTree, iso, venn | `[ASSUMED]` |
| Classic (mode) | aklasik | ⴰⴽⵍⴰⵙⵉⴽ | dh, factorTree, hub, rsa, shor | `[ASSUMED]` |
| Balanced (mode) | amsawa | ⴰⵎⵙⴰⵡⴰ | crt, ecdh, euclid, factorTree, iso, hub, rsa, sqm, venn | `[ASSUMED]` |
| branch | tarmmt | ⵜⴰⵔⵎⵎⵜ | factorTree, hub | `[ASSUMED]` |
| composition/factorization area | tamnaḍt n usnulfu/asfaktr | ⵜⴰⵎⵏⴰⴹⵜ ⵏ ⵓⵙⵏⵓⵍⴼⵓ/ⴰⵙⴼⴰⴽⵜⵔ | factorTree | `[ASSUMED]` |
| panel | tafaratt | ⵜⴰⴼⴰⵔⴰⵜⵜ | factorTree | `[ASSUMED]` |
| half | anuṣ | ⴰⵏⵓⵚ | factorTree, rsa | `[ASSUMED]` |
| overlap (n.) | timlalt | ⵜⵉⵎⵍⴰⵍⵜ | crt, ecdh, factorTree, venn | `[ASSUMED]` |
| bin | tazbalt | ⵜⴰⵣⴱⴰⵍⵜ | factorTree, venn | `[ASSUMED]` |
| set difference | ifrqn | ⵉⴼⵔⵇⵏ | venn | `[ASSUMED]` |
| hover previews | timuɣliwin zdat | ⵜⵉⵎⵓⵖⵍⵉⵡⵉⵏ ⵣⴷⴰⵜ | venn | `[ASSUMED]` |
| read-only | i uɣuri kigan | ⵉ ⵓⵖⵓⵔⵉ ⴽⵉⴳⴰⵏ | venn | `[ASSUMED]` |
| popup windows | tifnṭṛin | ⵜⵉⴼⵏⵟⵕⵉⵏ | venn | `[ASSUMED]` |
| tab (browser) | unglit | ⵓⵏⴳⵍⵉⵜ | sqm, venn | `[ASSUMED]` |
| odd | afrdi | ⴰⴼⵔⴷⵉ | cayley, ecdh, wheel, fermat, iso, hub, shor | `[ASSUMED]` |
| even | azuji | ⴰⵣⵓⵊⵉ | fermat, shor | `[ASSUMED]` |
| trivial | tarifyal | ⵜⴰⵔⵉⴼⵢⴰⵍ | fermat | `[ASSUMED]` |
| geometric picture | tugna n tgiyumitri | ⵜⵓⴳⵏⴰ ⵏ ⵜⴳⵉⵢⵓⵎⵉⵜⵔⵉ | fermat | `[ASSUMED]` |
| perfect power (annexed tzmrt) | tzmrt tummidt | ⵜⵣⵎⵔⵜ ⵜⵓⵎⵎⵉⴷⵜ | shor | `[ASSUMED]` |
| extended (Euclidean) | ittwasmqqrn | ⵉⵜⵜⵡⴰⵙⵎⵇⵇⵔⵏ | crt, euclid, rsa | `[ASSUMED]` |
| coefficient | ikufisyan | ⵉⴽⵓⴼⵉⵙⵢⴰⵏ | ecdh, euclid | `[ASSUMED]` |
| rectangle | aṛktangl | ⴰⵕⴽⵜⴰⵏⴳⵍ | euclid | `[ASSUMED]` |
| tile | tazlijt | ⵜⴰⵣⵍⵉⵊⵜ | euclid | `[ASSUMED]` |
| negative | amsalib | ⴰⵎⵙⴰⵍⵉⴱ | cayley, rsa, sqm | `[ASSUMED]` |
| positive | amujib | ⴰⵎⵓⵊⵉⴱ | dh, ecdh, rsa | `[ASSUMED]` |
| line (of working) | asaṭr | ⴰⵙⴰⵟⵔ | cayley, crt, euclid, sqm | `[ASSUMED]` |
| derivation | uḥsab | ⵓⵃⵙⴰⴱ | euclid | `[ASSUMED]` |
| congruences | igdan | ⵉⴳⴷⴰⵏ | crt, hub | `[ASSUMED]` |
| strip | ixṭṭn | ⵉⵅⵟⵟⵏ | crt, euclid | `[ASSUMED]` |
| column | akulun | ⴰⴽⵓⵍⵓⵏ | crt | `[ASSUMED]` |
| term (of a sum) | aḥdd | ⴰⵃⴷⴷ | crt | `[ASSUMED]` |
| representative (annexed umsmmal) | umsmmal | ⵓⵎⵙⵎⵎⴰⵍ | crt | `[ASSUMED]` |
| diagnostic | diyagnustik | ⴷⵉⵢⴰⴳⵏⵓⵙⵜⵉⴽ | crt | `[ASSUMED]` |
| system | sistim | ⵙⵉⵙⵜⵉⵎ | crt | `[ASSUMED]` |
| piece | uḥbbu | ⵓⵃⴱⴱⵓ | crt | `[ASSUMED]` |
| guard / barrier | lḥajiz | ⵍⵃⴰⵊⵉⵣ | crt, hub, rsa | `[ASSUMED]` |
| ring | twririn | ⵜⵡⵔⵉⵔⵉⵏ | wheel, hub | `[ASSUMED]` |
| export | ssufɣ | ⵙⵙⵓⴼⵖ | wheel, rsa | `[ASSUMED]` |
| download | sider | ⵙⵉⴷⴻⵔ | wheel | `[ASSUMED]` |
| print | ssuɣ | ⵙⵙⵓⵖ | wheel, sieve, common | `[ASSUMED]` |
| save | ḥfḍ | ⵃⴼⴹ | wheel | `[ASSUMED]` |
| reference | lmrjaɛ | ⵍⵎⵔⵊⴰⵄ | dh, wheel, rsa | `[ASSUMED]` |
| addend | amsmrni | ⴰⵎⵙⵎⵔⵏⵉ | wheel | `[ASSUMED]` |
| mirror | asmgal | ⴰⵙⵎⴳⴰⵍ | cayley, ecdh, venn | `[ASSUMED]` |
| twin | tawtmt | ⵜⴰⵡⵜⵎⵜ | cayley | `[ASSUMED]` |
| diagonal | tdyagunalt | ⵜⴷⵢⴰⴳⵓⵏⴰⵍⵜ | cayley | `[ASSUMED]` |
| equation | tmsawit | ⵜⵎⵙⴰⵡⵉⵜ | cayley, ecdh | `[ASSUMED]` |
| accumulator | amsmmunt | ⴰⵎⵙⵎⵎⵓⵏⵜ | sqm | `[ASSUMED]` |
| ladder | asllum | ⴰⵙⵍⵍⵓⵎ | sqm | `[ASSUMED]` |
| naive | abṣit | ⴰⴱⵚⵉⵜ | sqm | `[ASSUMED]` |
| cost | lkulfa | ⵍⴽⵓⵍⴼⴰ | rsa, shor, sqm | `[ASSUMED]` |
| gain | taṛbbiḥt | ⵜⴰⵕⴱⴱⵉⵃⵜ | sqm | `[ASSUMED]` |
| eavesdropper (annexed umsmmaɛ) | umsmmaɛ | ⵓⵎⵙⵎⵎⴰⵄ | dh | `[ASSUMED]` |
| tap | tmmdlt | ⵜⵎⵎⴷⵍⵜ | dh, ecdh, rsa | `[ASSUMED]` |
| notebook | tkrrasa | ⵜⴽⵔⵔⴰⵙⴰ | dh, ecdh, rsa | `[ASSUMED]` |
| copy | tanusxa | ⵜⴰⵏⵓⵙⵅⴰ | dh | `[ASSUMED]` |
| safe prime | amnzu amin | ⴰⵎⵏⵣⵓ ⴰⵎⵉⵏ | dh | `[ASSUMED]` |
| symmetric | asimitri | ⴰⵙⵉⵎⵉⵜⵔⵉ | dh | `[ASSUMED]` |
| teaching demo | amdya n usɣuri | ⴰⵎⴷⵢⴰ ⵏ ⵓⵙⵖⵓⵔⵉ | dh, ecdh, rsa, sqm | `[ASSUMED]` |
| setup | tuheggit | ⵜⵓⵀⴻⴳⴳⵉⵜ | sqm | `[ASSUMED]` |
| pair | tayuga | ⵜⴰⵢⵓⴳⴰ | crt, euclid, factorTree, fermat, iso, hub, rsa | `[ASSUMED]` |
| isomorphic | tamsalɣt | ⵜⴰⵎⵙⴰⵍⵖⵜ | iso | `[ASSUMED]` |
| quantum | aquntum | ⴰⵇⵓⵏⵜⵓⵎ | hub, shor | `[ASSUMED]` |
| stand-in (classical) | amsbddl | ⴰⵎⵙⴱⴷⴷⵍ | hub, shor | `[ASSUMED]` |
| superposition | asurbuzisyun | ⴰⵙⵓⵔⴱⵓⵣⵉⵙⵢⵓⵏ | shor | `[ASSUMED]` |
| estimation (phase) | asttimasyun | ⴰⵙⵜⵜⵉⵎⴰⵙⵢⵓⵏ | shor | `[ASSUMED]` |
| register (quantum, annexed umsjjl) | umsjjl | ⵓⵎⵙⵊⵊⵍ | shor | `[ASSUMED]` |
| amplitude | tamblitudin | ⵜⴰⵎⴱⵍⵉⵜⵓⴷⵉⵏ | shor | `[ASSUMED]` |
| simulation | asimulasyun | ⴰⵙⵉⵎⵓⵍⴰⵙⵢⵓⵏ | shor | `[ASSUMED]` |
| polynomial | bulinumyalt | ⴱⵓⵍⵉⵏⵓⵎⵢⴰⵍⵜ | shor | `[ASSUMED]` |
| peak | aqmmu | ⴰⵇⵎⵎⵓ | shor | `[ASSUMED]` |
| continued fraction | kasr imtwaṣil | ⴽⴰⵙⵔ ⵉⵎⵜⵡⴰⵚⵉⵍ | shor | `[ASSUMED]` |
| slope | uẓɣl | ⵓⵥⵖⵍ | ecdh | `[ASSUMED]` |
| tangent | tanjant | ⵜⴰⵏⵊⴰⵏⵜ | ecdh | `[ASSUMED]` |
| chord | uwtr | ⵓⵡⵜⵔ | ecdh | `[ASSUMED]` |
| coordinates | ikurdunayn | ⵉⴽⵓⵔⴷⵓⵏⴰⵢⵏ | ecdh | `[ASSUMED]` |
| singular (curve) | tasngulyirt | ⵜⴰⵙⵏⴳⵓⵍⵢⵉⵔⵜ | ecdh | `[ASSUMED]` |
| verdict | lqrar | ⵍⵇⵔⴰⵔ | shor | `[ASSUMED]` |
| padding | asmmla | ⴰⵙⵎⵎⵍⴰ | rsa, venn | `[ASSUMED]` |
| hard (problem) | tɛṣibt | ⵜⵄⵚⵉⴱⵜ | rsa | `[ASSUMED]` |
| different | imxtalfn | ⵉⵎⵅⵜⴰⵍⴼⵏ | rsa | `[ASSUMED]` |
| attacker (annexed umhajim) | umhajim | ⵓⵎⵀⴰⵊⵉⵎ | rsa | `[ASSUMED]` |
| security | laman | ⵍⴰⵎⴰⵏ | rsa | `[ASSUMED]` |
| note (remark) | tamlaḥḍa | ⵜⴰⵎⵍⴰⵃⴹⴰ | rsa | `[ASSUMED]` |
| scalar | askalir | ⴰⵙⴽⴰⵍⵉⵔ | ecdh, hub | `[ASSUMED]` |
| scalar (private) | amusli | ⴰⵎⵓⵙⵍⵉ | ecdh | `[ASSUMED]` |


### Kurdish supplementary terms (Kurmanji and Sorani; added 2026-10-08 by quick task 261008-k7u, Tasks 2-4, unified in Task 5)

Domain terms the pinned D-TERMS list did not cover, plus its "also" terms, as written while translating the 16 pages. One ku (Kurmanji, Latin Hawar alphabet) and one ckb (Sorani, Kurdish Arabic-based alphabet) rendering per English term, verified to occur in the named namespaces; both are `[ASSUMED]` (no term was checked against a published Kurdish glossary, and no native reader has reviewed them).

| Term (en) | ku | ckb | Namespaces | Confidence |
|---|---|---|---|---|
| visualized (picture, "in pictures") | bi dîmen | بە وێنە | hub | `[ASSUMED]` |
| cryptography | krîptografî | کریپتۆگرافی | dh, ecdh, hub | `[ASSUMED]` |
| arithmetic | hesaba modulî | ژمێریاری مۆدیولی | hub, sqm | `[ASSUMED]` |
| simultaneous | hevdem | ھاوکات | crt, hub | `[ASSUMED]` |
| set (collection of elements) | kom | کۆمەڵە | ecdh, hub, venn | `[ASSUMED]` |
| rectangle | çargoşeya dirêj | لاکێشە | euclid, hub | `[ASSUMED]` |
| square (shape) | çargoşe | چوارگۆشە | cayley, euclid, hub | `[ASSUMED]` |
| squaring | çargoşekirin | دووجاکردن | hub, rsa, site, sqm | `[ASSUMED]` |
| nested (squares) | di nav hev de | لە ناو یەکدا | euclid | `[ASSUMED]` |
| composition/factorization area | qada pêkhatin/faktorkirinê | ناوچەی پێکھێنان/شیکردنەوە | factorTree | `[ASSUMED]` |
| bin (palette trash) | çopdank | زبڵدان | factorTree, venn | `[ASSUMED]` |
| trial | ceribandin | تاقیکردنەوە | crt, dh, ecdh, totient, fermat, rsa | `[ASSUMED]` |
| trivial pair | cota sade | جووتە سادەکە | fermat | `[ASSUMED]` |
| odd (number) | tak | تاک | fermat, rsa, shor | `[ASSUMED]` |
| even (number) | cot | جووت | cayley, crt, euclid, factorTree, fermat, iso | `[ASSUMED]` |
| coefficient | hevkar | ھاوکۆڵکە | ecdh, euclid | `[ASSUMED]` |
| riddle | mamik | مەتەڵ | crt | `[ASSUMED]` |
| diagnostic | teşhîs | دەستنیشانکردن | crt | `[ASSUMED]` |
| pairwise coprime | du bi du ji hev seretayî | جووت جووت سەرەتایی | crt | `[ASSUMED]` |
| accumulator | berhevker | کۆکەرەوە | sqm | `[ASSUMED]` |
| subgroup | binegrûp | ژێرگرووپ | dh, ecdh | `[ASSUMED]` |
| diagonal | diagonal | ھێڵی لاری | cayley | `[ASSUMED]` |
| ladder | nêrdewan | پەیژە | sqm | `[ASSUMED]` |
| wedge | perçe | پارچە | cayley, crt, wheel, euclid, totient, hub | `[ASSUMED]` |
| notebook | defter | دەفتەر | dh, ecdh, rsa | `[ASSUMED]` |
| tap, eavesdrop | guhdarî | گوێگرتن | dh, ecdh, rsa | `[ASSUMED]` |
| safe prime | ewle | پارێزراو | dh | `[ASSUMED]` |
| scalar | skalar | سکالار | ecdh, hub | `[ASSUMED]` |
| slope | meyl | لاری | ecdh | `[ASSUMED]` |
| key exchange / exchange | danûstandin | ئاڵوگۆڕ | dh, ecdh, hub, rsa, sqm | `[ASSUMED]` |
| scatter | belavok | پەرشبوونەوە | ecdh, hub | `[ASSUMED]` |
| positive | erênî | ئەرێنی | dh, ecdh, euclid, rsa | `[ASSUMED]` |
| negative | neyînî | نەرێنی | euclid, rsa, sqm | `[ASSUMED]` |
| superposition | serhevdanîn | سوپەرپۆزیشن | shor | `[ASSUMED]` |
| attacker | êrîşkar | ھێرشکار | rsa | `[ASSUMED]` |
| mirror | neynik | ئاوێنە | cayley, ecdh, factorTree, venn | `[ASSUMED]` |
| member of a class | endam | ئەندام | crt, wheel | `[ASSUMED]` |
| quantum | kuantûmî | کوانتەمی | hub, shor | `[ASSUMED]` |
| period | dewr | خول | crt, shor | `[ASSUMED]` |

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
separate word ("फ़र्मा की विधि"). The `ar` column was added 2026-10-07 by quick task
261007-fhx; Alice, Bob, Eve and RSA stay Latin and every eponym is transliterated into Arabic
script (never identical to English). The `sq` and `sw` columns were added 2026-10-07 by quick
task 261007-k4o; Alice, Bob, Eve, RSA and the invariant eponyms stay Latin and identical to English
(neutral tokens), Euklidi and Eratosteni are the established Albanian forms. The `zh`, `ja` and `ko`
columns were added 2026-10-07 by quick task 261007-pbf; Alice, Bob, Eve and RSA stay Latin and every
eponym is written in the language's own script (never identical to English): Han for zh (name pairs
joined by an ASCII hyphen-minus), kanji and katakana for ja (name pairs joined by the katakana middle dot ・), Hangul for ko. The `id` column was added 2026-10-08 by quick task 261008-0h2; Alice, Bob, Eve, RSA and the invariant eponyms stay Latin and identical to English (neutral tokens), and Euklides is the established Indonesian form of Euclid. The `zgh-Latn` and `zgh-Tfng` columns were added 2026-10-08 by quick task 261008-e2j; Alice, Bob, Eve and RSA stay Latin in both scripts while every eponym is adapted to IRCAM Latin (no o, p or v) and transliterated into Tifinagh like any other word (Uklid as on the zgh Wikipedia, `[CITED]`; the other adapted forms `[ASSUMED]`). The `ku` and `ckb` columns were added 2026-10-08 by quick task 261008-k7u; Alice, Bob, Eve and RSA stay Latin in both, Kurmanji keeps the other eponyms in their usual Latin spelling apart from Euklîd, and Sorani writes every eponym in Sorani script. The `sa` and `la` columns were added 2026-10-08 by quick task 261008-qz1; Alice, Bob, Eve and RSA stay Latin in both, Sanskrit writes every other eponym in Devanagari without nukta (never identical to English), and Latin uses Euclides, Eratosthenes, Eulerus and the -ianus adjectives (Fermatianus, Cayleianus, Vennianus, Shorianus) while keeping the other modern names indeclinable.

| Proper noun | nl | de | fr | es | it | pl | pt-BR | pt-PT | sv | nb | ro | hu | lv | ru | el | he | hi | ar | sq | sw | zh | ja | ko | id | zgh-Latn | zgh-Tfng | ku | ckb | sa | la | Note |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---| --- | --- | --- | --- | --- | --- | --- |---|
| Alice | Alice | Alice | Alice | Alicia | Alice | Alice | Alice | Alice | Alice | Alice | Alice | Alice | Alice | Alice | Alice | Alice | Alice | Alice | Alice | Alice | Alice | Alice | Alice | Alice | Alice | Alice | Alice | Alice | Alice | Alice | ES RSA narrative commonly localizes to "Alicia"; **kept as "Alice" in all languages per this glossary** to match the existing cross-tool Bob/Alice/Eve narrative identically everywhere (consistency over localization). pl Alice is indeclinable. pt-BR/pt-PT keep "Alice" invariant — Portuguese does not decline names. sv/nb keep every name invariant and form the genitive with a plain -s; a name ending in -s takes no ending in sv and an apostrophe in nb. ro forms the genitive/dative with `lui Alice` or `lui {0}` (never a suffix on the name); hu never attaches a suffix to Alice, instead using a possessed-noun construction (`Alice kulcspárja`) or a postposition; lv keeps Alice invariant and introduces an oblique role with the apposition noun `puse` (`pusei Alice`), while a nominative subject uses the bare name.  ru treats Alice as indeclinable, expressing possession by position or a preposition (`открытый ключ {0}`, `для {0}`) and using a gender-neutral verb/adjective on a `{0}` slot (a literal "Alice" agrees with its own feminine gender). el gives the literal name its article (η Alice, της Alice) but uses a label/colon or dash form for a `{0}` placeholder, never a gendered article. sq: a nominative subject uses the bare name; in an oblique role it goes through the apposition noun "pala" ("çelësi publik i palës {0}", "i dërgohet palës Alice"), never a suffix on the name or on a placeholder. sw keeps Alice invariant (no case); a possessive uses the connector of the possessed noun ("ufunguo wa umma wa {0}"). |
| Bob | Bob | Bob | Bob | Bob | Bob | Bob | Bob | Bob | Bob | Bob | Bob | Bob | Bob | Bob | Bob | Bob | Bob | Bob | Bob | Bob | Bob | Bob | Bob | Bob | Bob | Bob | Bob | Bob | Bob | Bob | Unchanged in all languages; pl may decline (Boba, Bobowi) only where the name sits literally inside a value, never through a placeholder slot. pt-BR/pt-PT keep "Bob" invariant — Portuguese does not decline names. sv/nb keep every name invariant and form the genitive with a plain -s; a name ending in -s takes no ending in sv and an apostrophe in nb. ro/hu/lv treat Bob exactly as Alice above (`lui Bob`; possessed noun or postposition in hu; `puse`/`pusei Bob` in lv).  ru/el treat Bob exactly as Alice above, with Bob's own masculine gender where ru agreement applies; el's article is ο Bob / του Bob. sq/sw treat Bob exactly as Alice above ("i dërgohet palës Bob"; "ufunguo wa umma wa Bob"). |
| Eve | Eve | Eve | Ève | Eva | Eve | Eve | Eve | Eve | Eve | Eve | Eve | Eve | Eve | Eve | Eve | Eve | Eve | Eve | Eve | Eve | Eve | Eve | Eve | Eve | Eve | Eve | Eve | Eve | Eve | Eve | Kept per the project's narrative convention (see Alice above) — no language-specific substitution; it per Q-03 (quick task 261002-c77); pl Eve is indeclinable. pt-BR/pt-PT keep "Eve" invariant — Portuguese does not decline names. sv/nb keep every name invariant and form the genitive with a plain -s; a name ending in -s takes no ending in sv and an apostrophe in nb. ro forms the genitive/dative with `lui Eve`; hu never attaches a suffix to Eve, using a possessed noun or the postposition `által`; lv introduces an oblique Eve with the apposition noun `uzbrucēja` (`uzbrucējai Eve`), a nominative subject using the bare name (`Eve uzvar.`).  ru/el treat Eve exactly as Alice above (Eve's own feminine gender in ru, e.g. "Eve перебрала …"); el's article is η Eve / της Eve. sq introduces an oblique Eve with the apposition noun "sulmuesja / sulmueses" ("sulmueses Eve"), a nominative subject using the bare name; sw keeps Eve invariant. |
| RSA | RSA | RSA | RSA | RSA | RSA | RSA | RSA | RSA | RSA | RSA | RSA | RSA | RSA | RSA | RSA | RSA | RSA | RSA | RSA | RSA | RSA | RSA | RSA | RSA | RSA | RSA | RSA | RSA | RSA | RSA | Acronym, invariant. sv/nb keep every name invariant and form the genitive with a plain -s; a name ending in -s takes no ending in sv and an apostrophe in nb. Invariant in ro, hu and lv too.  Invariant in ru and el too. Invariant in sq and sw; sq acronyms stand in apposition ("çelësi RSA", "algoritmi RSA"). |
| Diffie-Hellman | Diffie-Hellman | Diffie-Hellman | Diffie-Hellman | Diffie-Hellman | Diffie-Hellman | Diffie-Hellman | Diffie-Hellman | Diffie-Hellman | Diffie-Hellman | Diffie-Hellman | Diffie-Hellman | Diffie-Hellman | Diffie-Hellman | Диффи-Хеллман | Diffie-Hellman | דיפי-הלמן | डिफ़ी-हेलमैन | ديفي-هيلمان | Diffie-Hellman | Diffie-Hellman | 迪菲-赫尔曼 | ディフィー・ヘルマン | 디피-헬먼 | Diffie-Hellman | Difi-Hilman | ⴷⵉⴼⵉ-ⵀⵉⵍⵎⴰⵏ | Diffie-Hellman | دیفی-ھێلمان | डिफी-हेलमन | Diffie-Hellman | Eponym pair, invariant spelling; pl declines it in prose as "Diffiego-Hellmana". pt-BR/pt-PT keep it invariant — Portuguese does not decline names. sv/nb keep every name invariant and form the genitive with a plain -s; a name ending in -s takes no ending in sv and an apostrophe in nb. Invariant spelling in ro, hu and lv too; hu hyphenates the compound tool name as "Diffie-Hellman-kulcscsere".  ru uses the established Cyrillic transcription, declined in prose ("обмен ключами Диффи-Хеллмана"); el keeps the eponym pair in Latin script with the Greek article, as Greek mathematical writing does. Invariant spelling in sq and sw; sq uses apposition ("shkëmbimi i çelësave Diffie-Hellman"). |
| Euler | Euler | Euler | Euler | Euler | Eulero | Euler | Euler | Euler | Euler | Euler | Euler | Euler | Eilers | Эйлер | Euler | אוילר | ऑयलर | أويلر | Euler | Euler | 欧拉 | オイラー | 오일러 | Euler | Ulir | ⵓⵍⵉⵔ | Euler | ئۆیلەر | ओयलर | Eulerus (Euleri) | Invariant spelling in nl, de, fr, es, pl, pt-BR and pt-PT; per-language eponym spelling now extends to Italian ("Eulero"), per Q-03 (quick task 261002-c77); pl declines it in prose as "Eulera". pt-BR/pt-PT keep it invariant — Portuguese does not decline names. sv/nb keep every name invariant and form the genitive with a plain -s; a name ending in -s takes no ending in sv and an apostrophe in nb. ro forms the genitive with `lui Euler`; hu hyphenates the adjective form "Euler-féle"; lv uses the established transcription "Eilers" with Latvian case endings ("Eilera funkcija").  ru uses the established Cyrillic transcription "Эйлер" ("функция Эйлера"); el keeps the Latin spelling "Euler" with the Greek article ("συνάρτηση φ του Euler"), per Q-10. sq keeps the spelling and takes the genitive ending ("funksioni φ i Eulerit"); sw keeps the original spelling uninflected ("kitendakazi φ cha Euler"). |
| Fermat | Fermat | Fermat | Fermat | Fermat | Fermat | Fermat | Fermat | Fermat | Fermat | Fermat | Fermat | Fermat | Ferma | Ферма | Fermat | פרמה | फ़र्मा | فيرما | Fermat | Fermat | 费马 | フェルマー | 페르마 | Fermat | Firma | ⴼⵉⵔⵎⴰ | Fermat | فێرما | फर्मा | Fermat (Fermatianus) | Invariant spelling; pl declines it in prose as "Fermata". pt-BR/pt-PT keep it invariant — Portuguese does not decline names. sv/nb keep every name invariant and form the genitive with a plain -s; a name ending in -s takes no ending in sv and an apostrophe in nb. ro forms the genitive with `lui Fermat` ("Metoda lui Fermat"); hu hyphenates "Fermat-módszer"; lv uses the indeclinable transcription "Ferma" ("Ferma metode").  ru uses the indeclinable Cyrillic transcription "Ферма" ("метод Ферма"); el keeps the Latin spelling "Fermat" with the Greek article ("μέθοδος του Fermat"). sq genitive "Fermatit" ("Metoda e Fermatit"); sw "Mbinu ya Fermat". |
| Cayley | Cayley | Cayley | Cayley | Cayley | Cayley | Cayley | Cayley | Cayley | Cayley | Cayley | Cayley | Cayley | Keilijs | Кэли | Cayley | קיילי | केली | كايلي | Cayley | Cayley | 凯莱 | ケイリー | 케일리 | Cayley | Kayli | ⴽⴰⵢⵍⵉ | Cayley | کەیلی | केली | Cayley (Cayleianus) | Invariant spelling; pl declines it in prose as "Cayleya". pt-BR/pt-PT keep it invariant — Portuguese does not decline names. sv/nb keep every name invariant and form the genitive with a plain -s; a name ending in -s takes no ending in sv and an apostrophe in nb. ro forms the genitive with `lui Cayley` ("Tabla lui Cayley"); hu hyphenates "Cayley-táblázat"; lv uses the established transcription "Keilijs" with case endings ("Keilija tabula").  ru uses the indeclinable Cyrillic transcription "Кэли" ("таблица Кэли"); el keeps the Latin spelling "Cayley" ("πίνακας Cayley"). sq genitive "Cayley-t" (hyphen only after the final y: "Tabela e Cayley-t"); sw "Jedwali la Cayley". |
| Venn | Venn | Venn | Venn | Venn | Venn | Venn | Venn | Venn | Venn | Venn | Venn | Venn | Venns | Венн | Venn | ון | वेन | فن | Venn | Venn | 维恩 | ベン | 벤 | Venn | Fin | ⴼⵉⵏ | Venn | ڤێن | वेन | Venn (Vennianus) | Invariant spelling; pl declines it in prose as "Venna". pt-BR/pt-PT keep it invariant — Portuguese does not decline names. sv/nb keep every name invariant and form the genitive with a plain -s; a name ending in -s takes no ending in sv and an apostrophe in nb. ro uses apposition ("Diagrama Venn"); hu hyphenates "Venn-diagram"; lv uses the established transcription "Venns" with case endings ("Venna diagramma").  ru uses the Cyrillic transcription "Венн", declined in prose ("диаграмма Венна"); el keeps the Latin spelling "Venn" ("διάγραμμα Venn"). sq/sw stand uninflected in apposition ("diagrami Venn", "Mchoro wa Venn"). |
| Shor | Shor | Shor | Shor | Shor | Shor | Shor | Shor | Shor | Shor | Shor | Shor | Shor | Šors | Шор | Shor | שור | शोर | شور | Shor | Shor | 秀尔 | ショア | 쇼어 | Shor | Cur | ⵛⵓⵔ | Shor | شۆر | शोर | Shor (Shorianus) | Invariant spelling; pl declines it in prose as "Shora". pt-BR/pt-PT keep it invariant — Portuguese does not decline names. sv/nb keep every name invariant and form the genitive with a plain -s; a name ending in -s takes no ending in sv and an apostrophe in nb. ro forms the genitive with `lui Shor` ("Algoritmul lui Shor"); hu hyphenates "Shor-algoritmus"; lv uses the established transcription "Šors" with case endings ("Šora algoritms").  ru uses the Cyrillic transcription "Шор", declined in prose ("алгоритм Шора"); el keeps the Latin spelling "Shor" ("αλγόριθμος του Shor"). sq genitive "Shorit" ("Algoritmi i Shorit"); sw "Algorithimu ya Shor". |
| Euclid / Euclides / Euklid / Euclide / Euclides / Euklides | Euclides | Euklid | Euclide | Euclides | Euclide | Euklides | Euclides | Euclides | Euklides | Euklid | Euclid | Eukleidész | Eiklīds | Евклид | Ευκλείδης | אוקלידס | यूक्लिड | إقليدس | Euklidi | Euclid | 欧几里得 | ユークリッド | 유클리드 | Euklides | Uklid | ⵓⴽⵍⵉⴷ | Euklîd | ئیقلیدس | यूक्लिड | Euclides (Euclideus) | Per-language eponym spelling — already used in `site.nav.euclid` (06-01); it matches fr ("Euclide"), per Q-03; pl uses the conventional Polish form "Euklides" and declines it in prose ("Algorytm Euklidesa"). pt-BR/pt-PT both use "Euclides", the conventional Portuguese form (shared with es), kept invariant — Portuguese does not decline names. sv/nb keep every name invariant and form the genitive with a plain -s; a name ending in -s takes no ending in sv and an apostrophe in nb. ro forms the genitive with `lui Euclid` ("Algoritmul lui Euclid"); hu uses the conventional Hungarian form "Eukleidész" with the adjective "euklideszi" ("Euklideszi algoritmus"); lv uses the established transcription "Eiklīds" with case endings ("Eiklīda algoritms").  ru uses the established Cyrillic transcription "Евклид", declined in prose ("алгоритм Евклида"); el uses the native Greek name "Ευκλείδης" ("αλγόριθμος του Ευκλείδη"), as Greek mathematical writing does for the ancient Greeks. sq uses the established Albanian form "Euklidi" (gen. "Euklidit": "Algoritmi i Euklidit"); sw keeps "Euclid" ("Algorithimu ya Euclid"). |
| Eratosthenes / Eratosthène / Eratóstenes / Eratostene / Eratostenes | Eratosthenes | Eratosthenes | Ératosthène | Eratóstenes | Eratostene | Eratostenes | Eratóstenes | Eratóstenes | Eratosthenes | Eratosthenes | Eratostene | Eratoszthenész | Eratostens | Эратосфен | Ερατοσθένης | ארטוסתנס | एराटोस्थनीज़ | إراتوستينس | Eratosteni | Eratosthenes | 埃拉托斯特尼 | エラトステネス | 에라토스테네스 | Eratosthenes | Iratustin | ⵉⵔⴰⵜⵓⵙⵜⵉⵏ | Eratosthenes | ئێراتۆستینس | एरातोस्थेनीस | Eratosthenes | Per-language eponym spelling — already used in `site.nav.sieve` (06-01); it per Q-03; pl uses the conventional Polish form "Eratostenes" ("Sito Eratostenesa"). pt-BR/pt-PT both use "Eratóstenes", the conventional Portuguese form (shared with es), kept invariant — Portuguese does not decline names. sv/nb keep every name invariant and form the genitive with a plain -s; a name ending in -s takes no ending in sv and an apostrophe in nb. ro forms the genitive with `lui Eratostene` ("Ciurul lui Eratostene"); hu uses the conventional Hungarian form "Eratoszthenész" ("Eratoszthenész szitája"); lv uses the established transcription "Eratostens" with case endings ("Eratostena siets").  ru uses the established Cyrillic transcription "Эратосфен", declined in prose ("решето Эратосфена"); el uses the native Greek name "Ερατοσθένης" ("κόσκινο του Ερατοσθένη"). sq uses the established Albanian form "Eratosteni" (gen. "Eratostenit": "Sita e Eratostenit"); sw keeps "Eratosthenes" ("Chujio la Eratosthenes"). |
| Bézout | Bézout | Bézout | Bézout | Bézout | Bézout | Bézout | Bézout | Bézout | Bézout | Bézout | Bézout | Bézout | Bezū | Безу | Bézout | בזו | बेज़ू | بيزو | Bézout | Bézout | 贝祖 | ベズー | 베주 | Bézout | Bizu | ⴱⵉⵣⵓ | Bézout | بێزۆ | बेजू | Bézout | Invariant spelling (Euclidean Algorithm tool's Extended Euclidean/Bézout coefficients); pl declines it in prose as "Bézouta". pt-BR/pt-PT keep it invariant — Portuguese does not decline names. sv/nb keep every name invariant and form the genitive with a plain -s; a name ending in -s takes no ending in sv and an apostrophe in nb. ro forms the genitive with `lui Bézout`; hu hyphenates "Bézout-együtthatók"; lv uses the indeclinable transcription "Bezū" ("Bezū koeficienti").  ru uses the indeclinable Cyrillic transcription "Безу" ("коэффициенты Безу"); el keeps the Latin spelling "Bézout" ("συντελεστές Bézout"). sq/sw stand uninflected in apposition ("koeficientët Bézout", "vigawo vya Bézout"). |
| Sun Tzu | Sun Tzu | Sunzi | Sun Tzu | Sun Tzu | Sun Tzu | Sun Tzu | Sun Tzu | Sun Tzu | Sun Tzu | Sun Tzu | Sun Tzu | Sun Tzu | Sun Tzu | Сунь-цзы | Σουν Τζου | סון דזה | सुन त्ज़ु | صن تزو | Sun Tzu | Sun Tzu | 孙子 | 孫子 | 손자 | Sun Tzu | Sun Tzu | ⵙⵓⵏ ⵜⵣⵓ | Sun Tzu | سون تزو | सुन त्सु | Sun Tzu | CRT's historical attribution (Sunzi Suanjing) — DE conventionally uses the pinyin "Sunzi"; other languages, including pl, pt-BR and pt-PT, keep "Sun Tzu" (invariant). `[ASSUMED]` sv/nb keep every name invariant and form the genitive with a plain -s; a name ending in -s takes no ending in sv and an apostrophe in nb. ro, hu and lv also keep "Sun Tzu" invariant.  ru uses the established Cyrillic transcription "Сунь-цзы" (invariant); el uses the transliteration "Σουν Τζου" (invariant). Invariant in sq and sw. |

All proper nouns above are neutral tokens per `i18n-check.js`'s prose rule (NEUTRAL_TOKENS)
and are never flagged by IDENTICAL-TO-EN.

---

## (e) Numerals and notation (06-01-PLAN assumption A7)

Numerals are **never** locale-formatted in any of the thirty-one languages. Existing
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
written identically in all thirty-one languages — these are the thirty-one autonyms' shared
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
Arabic (added 2026-10-07 by quick task 261007-fhx) is the second right-to-left language and the first Arabic-script one, writes ASCII digits only with the same comma grouping and dot decimal as English (no Arabic-Indic digits, no ٫ or ٬, no Arabic comma inside a numeral), carries exactly its English value's numerals (NATIVE-DIGIT, NATIVE-SEPARATOR, DIGIT-PARITY) and keeps notation left-to-right through the same isolates and `dir="rtl"` CSS as Hebrew.
Albanian and Swahili (added 2026-10-07 by quick task 261007-k4o) are left-to-right Latin-script languages that write ASCII digits with the same comma grouping and dot decimal as English (never Albanian's space grouping or comma decimal), carry exactly their English value's numerals (DIGIT-PARITY; the first Latin-script languages in DIGIT_PARITY_LANGS) and need no isolates.
Chinese, Japanese and Korean (added 2026-10-07 by quick task 261007-pbf) are left-to-right CJK languages that write ASCII digits with the same comma grouping and dot decimal as English, never full-width digits, CJK numerals in place of English digits or myriad (万/億/만/억) grouping, carry exactly their English value's numerals (DIGIT-PARITY), keep formulas in ASCII (FULLWIDTH-FORMULA) and need no isolates.
Indonesian (added 2026-10-08 by quick task 261008-0h2) is a left-to-right Latin-script language in plain ASCII letters that writes ASCII digits with the same comma grouping and dot decimal as English (never Indonesia's own dot grouping or comma decimal), carries exactly its English value's numerals (DIGIT-PARITY) and needs no isolates.
Standard Moroccan Tamazight (added 2026-10-08 by quick task 261008-e2j) is written left to right in the IRCAM Latin transcription (zgh-Latn) and in IRCAM Tifinagh (zgh-Tfng, derived from zgh-Latn letter by letter). Both write ASCII digits with the same comma grouping and dot decimal as English, carry exactly their English value's numerals (DIGIT-PARITY), keep every notation letter Latin (ZGH-NOTATION) and need no isolates. Tifinagh joins Cyrillic, Greek, Hebrew and Devanagari among the scripts rendered in the browser's system fallback font.
Kurmanji Kurdish and Sorani Kurdish (added 2026-10-08 by quick task 261008-k7u) both write ASCII digits with the same comma grouping and dot decimal as English (Sorani never Arabic-Indic or Extended Arabic-Indic digits nor ٫ ٬), carry exactly their English value's numerals (DIGIT-PARITY). Sorani is right to left and wraps formulas in isolates like Hebrew and Arabic; Kurmanji is left to right and needs none.
Sanskrit and Latin (added 2026-10-08 by quick task 261008-qz1) are both left to right and need no isolates. Both write ASCII digits with the same comma grouping and dot decimal as English (Sanskrit never Devanagari digits ०-९, Latin never Roman numerals in place of digits) and carry exactly their English value's numerals (NATIVE-DIGIT, DIGIT-PARITY); a Sanskrit sentence ends with the danda ।, which never stands inside a formula (SA-DANDA). Sanskrit joins Cyrillic, Greek, Hebrew and Hindi's Devanagari among the scripts rendered in the browser's system fallback font; Latin letters are ASCII and covered by the existing webfonts.

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
261006-pks. The hi column was added 2026-10-06 by quick task 261006-vpp. The ar column was
added 2026-10-07 by quick task 261007-fhx. The sq and sw columns were added 2026-10-07 by quick
task 261007-k4o. The zh, ja and ko columns were added 2026-10-07 by quick task 261007-pbf. The id column was added 2026-10-08 by quick task 261008-0h2. The zgh-Latn and zgh-Tfng columns were added 2026-10-08 by quick task 261008-e2j (D-COMMON; the zgh-Tfng cells are the transliteration of the zgh-Latn cells beside them). The ku and ckb columns were added 2026-10-08 by quick task 261008-k7u (D-COMMON) and equal the `common.*` values in `assets/i18n/site.js` exactly. The sa and la columns were added 2026-10-08 by quick task 261008-qz1 (D-COMMON) and equal the `common.*` values in `assets/i18n/site.js` exactly.

| key | Pages using it | en | nl | de | fr | es | it | pl | pt-BR | pt-PT | sv | nb | ro | hu | lv | ru | el | he | hi | ar | sq | sw | zh | ja | ko | id | zgh-Latn | zgh-Tfng | ku | ckb | sa | la |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---| --- | --- | --- | --- | --- | --- | --- |
| common.play | Chinese Remainder Theorem, Diffie-Hellman Key Exchange, Elliptic Curve Diffie-Hellman, Euclidean Algorithm, Euler's Totient, Fermat's Method, Shor's Algorithm, Sieve of Eratosthenes, Square and Multiply | ▶ Play | ▶ Afspelen | ▶ Abspielen | ▶ Lecture | ▶ Reproducir | ▶ Riproduci | ▶ Odtwórz | ▶ Reproduzir | ▶ Reproduzir | ▶ Spela upp | ▶ Spill av | ▶ Redă | ▶ Lejátszás | ▶ Atskaņot | ▶ Пуск | ▶ Έναρξη | ▶ הפעלה | ▶ चलाएँ | ▶ تشغيل | ▶ Luaj | ▶ Cheza | ▶ 播放 | ▶ 再生 | ▶ 재생 | ▶ Putar | ▶ Urar | ▶ ⵓⵔⴰⵔ | ▶ Lêxe | ▶ لێدان | ▶ चालनम् | ▶ Perge |
| common.pause | (same 9) | ⏸ Pause | ⏸ Pauzeren | ⏸ Pausieren | ⏸ Mettre en pause | ⏸ Pausar | ⏸ Pausa | ⏸ Pauza | ⏸ Pausar | ⏸ Pausar | ⏸ Pausa | ⏸ Sett på pause | ⏸ Pauză | ⏸ Szünet | ⏸ Pauze | ⏸ Пауза | ⏸ Παύση | ⏸ השהיה | ⏸ रोकें | ⏸ إيقاف مؤقت | ⏸ Pauzë | ⏸ Sitisha | ⏸ 暂停 | ⏸ 一時停止 | ⏸ 일시 정지 | ⏸ Jeda | ⏸ Sgunfu | ⏸ ⵙⴳⵓⵏⴼⵓ | ⏸ Rawestîne | ⏸ ڕاگرتن | ⏸ विरामः | ⏸ Intermitte |
| common.step | (same 9) | ⏭ Step | ⏭ Stap | ⏭ Schritt | ⏭ Étape | ⏭ Paso | ⏭ Passo | ⏭ Krok | ⏭ Passo | ⏭ Passo | ⏭ Steg | ⏭ Steg | ⏭ Pas | ⏭ Lépés | ⏭ Solis | ⏭ Шаг | ⏭ Βήμα | ⏭ צעד | ⏭ चरण | ⏭ خطوة | ⏭ Hap | ⏭ Hatua | ⏭ 单步 | ⏭ ステップ | ⏭ 단계 | ⏭ Langkah | ⏭ Asurif | ⏭ ⴰⵙⵓⵔⵉⴼ | ⏭ Gav | ⏭ ھەنگاو | ⏭ पदम् | ⏭ Gradus |
| common.instant | (same 9) | ⏩ Instant | ⏩ Direct | ⏩ Sofort | ⏩ Instantané | ⏩ Instantáneo | ⏩ Istantaneo | ⏩ Natychmiast | ⏩ Instantâneo | ⏩ Instantâneo | ⏩ Direkt | ⏩ Straks | ⏩ Instantaneu | ⏩ Azonnal | ⏩ Uzreiz | ⏩ Сразу | ⏩ Άμεσα | ⏩ מיידי | ⏩ तुरंत | ⏩ فوري | ⏩ Menjëherë | ⏩ Papo hapo | ⏩ 立即完成 | ⏩ 即時完了 | ⏩ 즉시 완료 | ⏩ Seketika | ⏩ Dɣya | ⏩ ⴷⵖⵢⴰ | ⏩ Yekser | ⏩ دەستبەجێ | ⏩ तत्क्षणम् | ⏩ Statim |
| common.reset | (same 9) | ↺ Reset | ↺ Herstart | ↺ Zurücksetzen | ↺ Réinitialiser | ↺ Reiniciar | ↺ Reimposta | ↺ Resetuj | ↺ Reiniciar | ↺ Repor | ↺ Återställ | ↺ Tilbakestill | ↺ Resetează | ↺ Visszaállítás | ↺ Atiestatīt | ↺ Сброс | ↺ Επαναφορά | ↺ איפוס | ↺ रीसेट | ↺ إعادة تعيين | ↺ Rivendos | ↺ Weka upya | ↺ 重置 | ↺ リセット | ↺ 초기화 | ↺ Atur ulang | ↺ Ssuɣl | ↺ ⵙⵙⵓⵖⵍ | ↺ Ji nû ve | ↺ ڕێکخستنەوە | ↺ पुनःस्थापनम् | ↺ Restitue |
| common.speed | (same 9) | Speed | Snelheid | Geschwindigkeit | Vitesse | Velocidad | Velocità | Prędkość | Velocidade | Velocidade | Hastighet | Hastighet | Viteză | Sebesség | Ātrums | Скорость | Ταχύτητα | מהירות | गति | السرعة | Shpejtësia | Kasi | 速度 | 速度 | 속도 | Kecepatan | Timmri | ⵜⵉⵎⵎⵔⵉ | Lez | خێرایی | वेगः | Celeritas |
| common.speed.1 … common.speed.10 | (same 9) | glacial … instant-ish | ijzig … bijna-direct | eisig … fast augenblicklich | glaciaire … quasi instantané | gélido … casi instantáneo | glaciale … quasi istantaneo | lodowata … niemal natychmiastowa | gélida … quase instantânea | gélida … quase instantânea | isande … nästan omedelbar | iskald … nesten øyeblikkelig | glacială … aproape instantanee | jeges … szinte azonnali | ledains … gandrīz acumirklīgs | ледяная … почти мгновенная | παγερή … σχεδόν ακαριαία | קרחונית … כמעט מיידית | बर्फ़ीली … लगभग तुरंत | جليدية … شبه فورية | i ngadaltë shumë … pothuajse i çastit | ya polepole sana … karibu papo hapo | 极慢 … 近乎瞬间 | 極めて遅い … ほぼ瞬時 | 매우 느림 … 거의 즉시 | sangat lambat … hampir seketika | iẓẓayn bahra … qrib dɣya | ⵉⵥⵥⴰⵢⵏ ⴱⴰⵀⵔⴰ … ⵇⵔⵉⴱ ⴷⵖⵢⴰ | cemidî … hema yekser | بەستوو … نزیکەی دەستبەجێ | हिमनदीवत् … प्रायः तात्क्षणिकः | glacialis … paene statim |
| common.additiveGroups | Cayley Table, Equivalence Wheel | Additive Groups | Additieve groepen | Additive Gruppen | Groupes additifs | Grupos aditivos | Gruppi additivi | Grupy addytywne | Grupos aditivos | Grupos aditivos | Additiva grupper | Additive grupper | Grupuri aditive | Additív csoportok | Aditīvās grupas | Аддитивные группы | Προσθετικές ομάδες | חבורות חיבוריות | योगात्मक समूह | الزمر الجمعية | Grupet aditive | Makundi ya kujumlisha | 加法群 | 加法群 | 덧셈군 | Grup Aditif | Tigrawin n usmrni | ⵜⵉⴳⵔⴰⵡⵉⵏ ⵏ ⵓⵙⵎⵔⵏⵉ | Grûpên lêzêdekirinê | گرووپەکانی کۆکردنەوە | योगात्मकसमूहाः | Greges additivi |
| common.multiplicativeGroups | Cayley Table, Equivalence Wheel | Multiplicative Groups | Multiplicatieve groepen | Multiplikative Gruppen | Groupes multiplicatifs | Grupos multiplicativos | Gruppi moltiplicativi | Grupy multiplikatywne | Grupos multiplicativos | Grupos multiplicativos | Multiplikativa grupper | Multiplikative grupper | Grupuri multiplicative | Multiplikatív csoportok | Multiplikatīvās grupas | Мультипликативные группы | Πολλαπλασιαστικές ομάδες | חבורות כפליות | गुणात्मक समूह | الزمر الضربية | Grupet shumëzuese | Makundi ya kuzidisha | 乘法群 | 乗法群 | 곱셈군 | Grup Multiplikatif | Tigrawin n usgut | ⵜⵉⴳⵔⴰⵡⵉⵏ ⵏ ⵓⵙⴳⵓⵜ | Grûpên lêkdanê | گرووپەکانی لێکدان | गुणनात्मकसमूहाः | Greges multiplicativi |

(The full speed-word table is in `assets/i18n/site.js`; this row is a pointer, not a
duplicate source of truth.)
