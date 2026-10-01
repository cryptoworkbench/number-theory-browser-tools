/* assets/i18n/rsa.js — the 'rsa' namespace: RSA page narrative in all five
   supported languages.

   Classic script, IIFE, "use strict" — its only statement is
   NT.i18n.register(...). Dictionary rules (see assets/nt-i18n.js's header
   comment and the NT.i18n contract in 06-01-PLAN.md): flat keys, the
   identical key set in every language object, plain text values (no
   markup), numerals/math notation untouched, emoji/glyph prefixes kept as
   part of the value rather than concatenated in code. Must load after
   assets/nt-i18n.js, assets/i18n/site.js and before the page's own inline
   <script>.

   Bob, Alice and Eve are kept as the literal English names in every
   language (06-GLOSSARY.md section (d) — matches the precedent set by
   Diffie-Hellman Key Exchange and Elliptic Curve Diffie-Hellman).
*/
(function () {
  "use strict";

  NT.i18n.register('rsa', {
    nl: {
      title: 'RSA — Bob, Alice en Eve',
      heading: 'RSA',
      lede: 'Bekijk hoe Bob en Alice RSA-sleutelparen bouwen, publieke sleutels uitwisselen over een draad die Eve ongemerkt aftapt, zie precies welk lastige wiskundeprobleem tussen Eve en hun privésleutels staat, en stuur elkaar dan een versleuteld bericht.',
      introHeading: 'Hoe dit werkt',
      introP1: 'Je geeft twee priemgetallen op voor {0} en twee andere priemgetallen voor {1}. Deze pagina leidt alles verder af — de modulus, de totiënt, de publieke exponent, de privé-exponent, tot en met de rekenstappen van het uitgebreide Euclidische algoritme. Daarna steken hun publieke sleutels een draad over waarop {2} meeluistert, je ziet precies wat ze onderschept en met welk lastig probleem ze blijft zitten, en uiteindelijk wisselen Bob en Alice een echt versleuteld bericht uit.',
      textbookRsa: 'schoolboek-RSA',
      introP2: 'Dit is {0}, alleen voor onderwijsdoeleinden — geen padding-schema (OAEP), geen praktijkgrote sleutels. Gebruik zulke kleine sleutels nooit opnieuw voor iets echts.',
      step1Heading: 'Bob genereert zijn RSA-sleutelpaar',
      step1Sub: 'kies twee priemgetallen',
      step2Heading: 'Alice genereert haar RSA-sleutelpaar',
      differentWord: 'verschillende',
      step2Sub: 'kies twee {0} priemgetallen',
      step3Heading: 'Publieke sleutels steken de draad over — Eve luistert mee',
      step4Heading: 'Waar Eve nu echt tegenover staat',
      step5Heading: 'Versleutelde correspondentie',
      lockNoteBoth3: '🔒 Genereer eerst de sleutelparen van zowel Bob als Alice.',
      lockNoteBoth: '🔒 Genereer eerst beide sleutelparen.',
      primePLabel: 'Priemgetal p',
      primeQLabel: 'Priemgetal q',
      genKeypairBtn: "🔑 Genereer het sleutelpaar van {0}",
      footer: 'Schoolboek-RSA-demo — geen OAEP-padding, speelgoedformaat sleutels. Alleen voor onderwijs.',
      pillRsaVsDlp: 'RSA-probleem ≠ discrete-logprobleem',
      pillBigint: 'BigInt-precisie',
      pillMillerRabin: 'Miller–Rabin-priemtest',
      scratchTitle: 'Publieke sleutels — ter referentie'
    },
    en: {
      title: 'RSA — Bob, Alice & Eve',
      heading: 'RSA',
      lede: 'Watch Bob and Alice build RSA keypairs, swap public keys over a wire that Eve is quietly tapping, see exactly what hard math problem stands between Eve and their private keys, then send each other an encrypted message.',
      introHeading: 'How this works',
      introP1: 'You supply two prime numbers for {0} and two different prime numbers for {1}. This page derives everything else — the modulus, the totient, the public exponent, the private exponent, all the way down to the extended-Euclidean-algorithm arithmetic. Then their public keys cross a wire that {2} is listening on, you’ll see exactly what she captures and what hard problem she’s stuck with, and finally Bob and Alice trade an actual encrypted message.',
      textbookRsa: 'textbook RSA',
      introP2: 'This is {0} for teaching purposes only — no padding scheme (OAEP), no real-world key sizes. Never reuse tiny keys like these for anything real.',
      step1Heading: 'Bob generates his RSA keypair',
      step1Sub: 'pick two primes',
      step2Heading: 'Alice generates her RSA keypair',
      differentWord: 'different',
      step2Sub: 'pick two {0} primes',
      step3Heading: 'Public keys cross the wire — Eve is listening',
      step4Heading: 'What Eve is actually up against',
      step5Heading: 'Encrypted correspondence',
      lockNoteBoth3: "🔒 Generate both Bob's and Alice's keypairs first.",
      lockNoteBoth: '🔒 Generate both keypairs first.',
      primePLabel: 'Prime p',
      primeQLabel: 'Prime q',
      genKeypairBtn: "🔑 Generate {0}'s Keypair",
      footer: 'Textbook RSA demo — no OAEP padding, tiny toy-sized keys. For education only.',
      pillRsaVsDlp: 'RSA problem ≠ discrete-log problem',
      pillBigint: 'BigInt precision',
      pillMillerRabin: 'Miller–Rabin primality',
      scratchTitle: 'Public keys — for reference'
    },
    de: {
      title: 'RSA — Bob, Alice und Eve',
      heading: 'RSA',
      lede: 'Sieh zu, wie Bob und Alice RSA-Schlüsselpaare erzeugen, öffentliche Schlüssel über eine Leitung austauschen, die Eve heimlich abhört, erkenne genau, welches schwere mathematische Problem zwischen Eve und ihren privaten Schlüsseln steht, und schicke dir dann gegenseitig eine verschlüsselte Nachricht.',
      introHeading: 'So funktioniert das',
      introP1: 'Du gibst zwei Primzahlen für {0} und zwei andere Primzahlen für {1} ein. Diese Seite leitet alles Weitere ab — den Modul, die Totient, den öffentlichen Exponenten, den privaten Exponenten, bis hin zu den Rechenschritten des erweiterten euklidischen Algorithmus. Danach überqueren ihre öffentlichen Schlüssel eine Leitung, auf der {2} mithört; du siehst genau, was sie abfängt und an welchem schweren Problem sie hängen bleibt, und schließlich tauschen Bob und Alice eine echte verschlüsselte Nachricht aus.',
      textbookRsa: 'Lehrbuch-RSA',
      introP2: 'Dies ist {0} nur zu Lehrzwecken — kein Padding-Verfahren (OAEP), keine praxisgroßen Schlüssel. Verwende solch winzige Schlüssel niemals für irgendetwas Echtes.',
      step1Heading: 'Bob erzeugt sein RSA-Schlüsselpaar',
      step1Sub: 'wähle zwei Primzahlen',
      step2Heading: 'Alice erzeugt ihr RSA-Schlüsselpaar',
      differentWord: 'andere',
      step2Sub: 'wähle zwei {0} Primzahlen',
      step3Heading: 'Öffentliche Schlüssel überqueren die Leitung — Eve hört mit',
      step4Heading: 'Was Eve wirklich vor sich hat',
      step5Heading: 'Verschlüsselte Korrespondenz',
      lockNoteBoth3: '🔒 Erzeuge zuerst die Schlüsselpaare von Bob und Alice.',
      lockNoteBoth: '🔒 Erzeuge zuerst beide Schlüsselpaare.',
      primePLabel: 'Primzahl p',
      primeQLabel: 'Primzahl q',
      genKeypairBtn: '🔑 Schlüsselpaar von {0} erzeugen',
      footer: 'Lehrbuch-RSA-Demo — kein OAEP-Padding, Spielzeug-Schlüsselgrößen. Nur zu Lehrzwecken.',
      pillRsaVsDlp: 'RSA-Problem ≠ diskretes Logarithmusproblem',
      pillBigint: 'BigInt-Präzision',
      pillMillerRabin: 'Miller–Rabin-Primzahltest',
      scratchTitle: 'Öffentliche Schlüssel — zur Referenz'
    },
    fr: {
      title: 'RSA — Bob, Alice et Eve',
      heading: 'RSA',
      lede: 'Observez Bob et Alice construire des paires de clés RSA, échanger des clés publiques sur une ligne qu’Eve écoute discrètement, voyez exactement quel problème mathématique difficile se dresse entre Eve et leurs clés privées, puis échangez un message chiffré.',
      introHeading: 'Comment cela fonctionne',
      introP1: 'Vous fournissez deux nombres premiers pour {0} et deux nombres premiers différents pour {1}. Cette page en dérive tout le reste — le module, l’indicatrice, l’exposant public, l’exposant privé, jusqu’aux étapes de calcul de l’algorithme d’Euclide étendu. Ensuite leurs clés publiques traversent une ligne sur laquelle {2} écoute ; vous verrez exactement ce qu’elle intercepte et à quel problème difficile elle se heurte, et enfin Bob et Alice échangent un véritable message chiffré.',
      textbookRsa: 'RSA scolaire',
      introP2: 'Ceci est {0}, uniquement à des fins pédagogiques — aucun schéma de remplissage (OAEP), aucune taille de clé réaliste. Ne réutilisez jamais des clés aussi petites pour quoi que ce soit de réel.',
      step1Heading: 'Bob génère sa paire de clés RSA',
      step1Sub: 'choisissez deux nombres premiers',
      step2Heading: 'Alice génère sa paire de clés RSA',
      differentWord: 'différents',
      step2Sub: 'choisissez deux nombres premiers {0}',
      step3Heading: 'Les clés publiques traversent la ligne — Eve écoute',
      step4Heading: 'Ce à quoi Eve est vraiment confrontée',
      step5Heading: 'Correspondance chiffrée',
      lockNoteBoth3: '🔒 Générez d’abord les paires de clés de Bob et d’Alice.',
      lockNoteBoth: '🔒 Générez d’abord les deux paires de clés.',
      primePLabel: 'Nombre premier p',
      primeQLabel: 'Nombre premier q',
      genKeypairBtn: '🔑 Générer la paire de clés de {0}',
      footer: 'Démo RSA scolaire — pas de remplissage OAEP, clés de taille jouet. À usage pédagogique uniquement.',
      pillRsaVsDlp: 'problème RSA ≠ problème du logarithme discret',
      pillBigint: 'précision BigInt',
      pillMillerRabin: 'primalité de Miller–Rabin',
      scratchTitle: 'Clés publiques — pour référence'
    },
    es: {
      title: 'RSA — Bob, Alice y Eve',
      heading: 'RSA',
      lede: 'Observa cómo Bob y Alice construyen pares de claves RSA, intercambian claves públicas por una línea que Eve intercepta discretamente, ve exactamente qué problema matemático difícil se interpone entre Eve y sus claves privadas, y luego envíense un mensaje cifrado.',
      introHeading: 'Cómo funciona esto',
      introP1: 'Proporcionas dos números primos para {0} y dos números primos distintos para {1}. Esta página deriva todo lo demás — el módulo, la función totiente, el exponente público, el exponente privado, hasta los pasos de cálculo del algoritmo de Euclides extendido. Luego sus claves públicas cruzan una línea que {2} está escuchando; verás exactamente qué intercepta y con qué problema difícil se queda atascada, y finalmente Bob y Alice intercambian un mensaje cifrado real.',
      textbookRsa: 'RSA de manual',
      introP2: 'Esto es {0} solo con fines educativos — sin esquema de relleno (OAEP), sin tamaños de clave reales. Nunca reutilices claves tan pequeñas como estas para nada real.',
      step1Heading: 'Bob genera su par de claves RSA',
      step1Sub: 'elige dos números primos',
      step2Heading: 'Alice genera su par de claves RSA',
      differentWord: 'distintos',
      step2Sub: 'elige dos números primos {0}',
      step3Heading: 'Las claves públicas cruzan la línea — Eve está escuchando',
      step4Heading: 'A qué se enfrenta Eve en realidad',
      step5Heading: 'Correspondencia cifrada',
      lockNoteBoth3: '🔒 Genera primero los pares de claves de Bob y Alice.',
      lockNoteBoth: '🔒 Genera primero ambos pares de claves.',
      primePLabel: 'Número primo p',
      primeQLabel: 'Número primo q',
      genKeypairBtn: '🔑 Generar el par de claves de {0}',
      footer: 'Demo de RSA de manual — sin relleno OAEP, claves de tamaño de juguete. Solo con fines educativos.',
      pillRsaVsDlp: 'problema RSA ≠ problema del logaritmo discreto',
      pillBigint: 'precisión BigInt',
      pillMillerRabin: 'primalidad de Miller–Rabin',
      scratchTitle: 'Claves públicas — para referencia'
    }
  });
})();
