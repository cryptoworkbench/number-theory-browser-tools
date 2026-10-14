/* assets/i18n/qr-code.js — the 'qr' namespace: the QR Code page's tab
   title (title), its heading (heading), the caption under the code
   (caption) and the code's accessible label (imgLabel), in all
   thirty-one supported languages. The page's one link — the site's own
   address, the same string as the QR payload — is untranslated and
   carries no key. "QR" stays Latin uppercase in every language (an
   acronym on the notation allow-lists of i18n-check.js).

   Classic script, IIFE, "use strict" — its only statement is
   NT.i18n.register(...). Must load after assets/nt-i18n.js and
   assets/i18n/site.js, as the last script before </body> (the page has
   no inline script of its own).
*/
(function () {
  "use strict";

  NT.i18n.register('qr', {
    nl: {
      title: 'QR-code — Getaltheorie-tools',
      heading: 'Open deze site op je telefoon',
      caption: 'Richt de camera van je telefoon op de code om daar elke tool te openen.',
      imgLabel: 'QR-code met het adres van deze site'
    },
    en: {
      title: 'QR Code — Number Theory Tools',
      heading: 'Open this site on your phone',
      caption: "Point your phone's camera at the code to open every tool there.",
      imgLabel: 'QR code for the address of this site'
    },
    de: {
      title: 'QR-Code — Zahlentheorie-Werkzeuge',
      heading: 'Öffne diese Seite auf deinem Handy',
      caption: 'Richte die Kamera deines Handys auf den Code, um dort jedes Werkzeug zu öffnen.',
      imgLabel: 'QR-Code mit der Adresse dieser Seite'
    },
    fr: {
      title: 'Code QR — Outils de théorie des nombres',
      heading: 'Ouvrez ce site sur votre téléphone',
      caption: "Pointez l'appareil photo de votre téléphone vers le code pour y ouvrir chaque outil.",
      imgLabel: "Code QR de l'adresse de ce site"
    },
    es: {
      title: 'Código QR — Herramientas de teoría de números',
      heading: 'Abre este sitio en tu teléfono',
      caption: 'Apunta la cámara de tu teléfono al código para abrir allí cada herramienta.',
      imgLabel: 'Código QR con la dirección de este sitio'
    },
    it: {
      title: 'Codice QR — Strumenti di teoria dei numeri',
      heading: 'Apri questo sito sul tuo telefono',
      caption: 'Inquadra il codice con la fotocamera del telefono per aprire lì ogni strumento.',
      imgLabel: "Codice QR con l'indirizzo di questo sito"
    },
    pl: {
      title: 'Kod QR — Narzędzia teorii liczb',
      heading: 'Otwórz tę stronę na telefonie',
      caption: 'Skieruj aparat telefonu na kod, aby otworzyć tam każde narzędzie.',
      imgLabel: 'Kod QR z adresem tej strony'
    },
    'pt-BR': {
      title: 'Código QR — Ferramentas de teoria dos números',
      heading: 'Abra este site no seu celular',
      caption: 'Aponte a câmera do celular para o código para abrir lá todas as ferramentas.',
      imgLabel: 'Código QR com o endereço deste site'
    },
    'pt-PT': {
      title: 'Código QR — Ferramentas de teoria dos números',
      heading: 'Abra este site no seu telemóvel',
      caption: 'Aponte a câmara do telemóvel ao código para abrir aí todas as ferramentas.',
      imgLabel: 'Código QR com o endereço deste site'
    },
    sv: {
      title: 'QR-kod — Talteoriverktyg',
      heading: 'Öppna den här webbplatsen på din telefon',
      caption: 'Rikta telefonens kamera mot koden för att öppna alla verktyg där.',
      imgLabel: 'QR-kod med adressen till den här webbplatsen'
    },
    nb: {
      title: 'QR-kode — Tallteoriverktøy',
      heading: 'Åpne dette nettstedet på telefonen din',
      caption: 'Rett kameraet på telefonen mot koden for å åpne alle verktøyene der.',
      imgLabel: 'QR-kode med adressen til dette nettstedet'
    },
    ro: {
      title: 'Cod QR — Instrumente de teoria numerelor',
      heading: 'Deschide acest site pe telefon',
      caption: 'Îndreaptă camera telefonului spre cod pentru a deschide acolo toate instrumentele.',
      imgLabel: 'Cod QR cu adresa acestui site'
    },
    hu: {
      title: 'QR-kód — Számelméleti eszközök',
      heading: 'Nyisd meg ezt az oldalt a telefonodon',
      caption: 'Irányítsd a telefonod kameráját a kódra, és minden eszköz megnyílik ott.',
      imgLabel: 'QR-kód ennek az oldalnak a címével'
    },
    lv: {
      title: 'QR kods — Skaitļu teorijas rīki',
      heading: 'Atver šo vietni savā tālrunī',
      caption: 'Pavērs tālruņa kameru pret kodu, lai tur atvērtu katru rīku.',
      imgLabel: 'QR kods ar šīs vietnes adresi'
    },
    ru: {
      title: 'QR-код — Инструменты теории чисел',
      heading: 'Откройте этот сайт на телефоне',
      caption: 'Наведите камеру телефона на код, чтобы открыть там каждый инструмент.',
      imgLabel: 'QR-код с адресом этого сайта'
    },
    el: {
      title: 'Κωδικός QR — Εργαλεία θεωρίας αριθμών',
      heading: 'Ανοίξτε αυτόν τον ιστότοπο στο τηλέφωνό σας',
      caption: 'Στρέψτε την κάμερα του τηλεφώνου σας στον κωδικό για να ανοίξετε εκεί κάθε εργαλείο.',
      imgLabel: 'Κωδικός QR με τη διεύθυνση αυτού του ιστότοπου'
    },
    he: {
      title: 'קוד QR — כלי תורת המספרים',
      heading: 'פתחו את האתר הזה בטלפון',
      caption: 'כוונו את מצלמת הטלפון אל הקוד כדי לפתוח שם כל כלי.',
      imgLabel: 'קוד QR עם כתובת האתר הזה'
    },
    hi: {
      title: 'QR कोड — संख्या सिद्धांत के उपकरण',
      heading: 'इस साइट को अपने फ़ोन पर खोलें',
      caption: 'हर उपकरण वहीं खोलने के लिए अपने फ़ोन का कैमरा कोड की ओर करें।',
      imgLabel: 'इस साइट के पते का QR कोड'
    },
    ar: {
      title: 'رمز QR — أدوات نظرية الأعداد',
      heading: 'افتح هذا الموقع على هاتفك',
      caption: 'وجه كاميرا هاتفك نحو الرمز لفتح كل أداة هناك.',
      imgLabel: 'رمز QR يحمل عنوان هذا الموقع'
    },
    sq: {
      title: 'Kodi QR — Mjete të teorisë së numrave',
      heading: 'Hape këtë sajt në telefonin tënd',
      caption: 'Drejtoje kamerën e telefonit nga kodi për të hapur aty çdo mjet.',
      imgLabel: 'Kodi QR me adresën e këtij sajti'
    },
    sw: {
      title: 'Msimbo wa QR — Zana za nadharia ya namba',
      heading: 'Fungua tovuti hii kwenye simu yako',
      caption: 'Elekeza kamera ya simu yako kwenye msimbo ili kufungua kila zana huko.',
      imgLabel: 'Msimbo wa QR wenye anwani ya tovuti hii'
    },
    zh: {
      title: 'QR码 — 数论工具',
      heading: '在手机上打开本网站',
      caption: '用手机相机对准QR码，即可在那里打开每个工具。',
      imgLabel: '本网站地址的QR码'
    },
    ja: {
      title: 'QRコード — 数論ツール',
      heading: 'このサイトをスマートフォンで開く',
      caption: 'スマートフォンのカメラをコードに向けると、そこですべてのツールを開けます。',
      imgLabel: 'このサイトのアドレスのQRコード'
    },
    ko: {
      title: 'QR 코드 — 정수론 도구',
      heading: '휴대폰에서 이 사이트 열기',
      caption: '휴대폰 카메라를 코드에 비추면 그곳에서 모든 도구를 열 수 있습니다.',
      imgLabel: '이 사이트 주소의 QR 코드'
    },
    id: {
      title: 'Kode QR — Alat Teori Bilangan',
      heading: 'Buka situs ini di ponsel Anda',
      caption: 'Arahkan kamera ponsel Anda ke kode untuk membuka setiap alat di sana.',
      imgLabel: 'Kode QR berisi alamat situs ini'
    },
    'zgh-Latn': {
      title: 'Tangalt QR — Allaln n tiẓri n imḍanen',
      heading: 'Ldi asmel-a ɣ tilifun-nnek',
      caption: 'Smmal tkamira n tilifun-nnek ɣer tengalt iwakken ad teldiḍ dinna yal allal.',
      imgLabel: 'Tangalt QR n tansa n usmel-a'
    },
    'zgh-Tfng': {
      title: 'ⵜⴰⵏⴳⴰⵍⵜ QR — ⴰⵍⵍⴰⵍⵏ ⵏ ⵜⵉⵥⵔⵉ ⵏ ⵉⵎⴹⴰⵏⴻⵏ',
      heading: 'ⵍⴷⵉ ⴰⵙⵎⴻⵍ-ⴰ ⵖ ⵜⵉⵍⵉⴼⵓⵏ-ⵏⵏⴻⴽ',
      caption: 'ⵙⵎⵎⴰⵍ ⵜⴽⴰⵎⵉⵔⴰ ⵏ ⵜⵉⵍⵉⴼⵓⵏ-ⵏⵏⴻⴽ ⵖⴻⵔ ⵜⴻⵏⴳⴰⵍⵜ ⵉⵡⴰⴽⴽⴻⵏ ⴰⴷ ⵜⴻⵍⴷⵉⴹ ⴷⵉⵏⵏⴰ ⵢⴰⵍ ⴰⵍⵍⴰⵍ.',
      imgLabel: 'ⵜⴰⵏⴳⴰⵍⵜ QR ⵏ ⵜⴰⵏⵙⴰ ⵏ ⵓⵙⵎⴻⵍ-ⴰ'
    },
    ku: {
      title: 'Koda QR — Amûrên teoriya hejmaran',
      heading: 'Vê malperê li ser têlefona xwe veke',
      caption: 'Kameraya têlefona xwe ber bi koda QR ve bike da ku li wir her amûrekê vekî.',
      imgLabel: 'Koda QR a navnîşana vê malperê'
    },
    ckb: {
      title: 'کۆدی QR — ئامرازەکانی تیۆری ژمارە',
      heading: 'ئەم ماڵپەڕە لەسەر تەلەفۆنەکەت بکەرەوە',
      caption: 'کامێرای تەلەفۆنەکەت ئاراستەی کۆدەکە بکە بۆ ئەوەی ھەموو ئامرازێک لەوێ بکەیتەوە.',
      imgLabel: 'کۆدی QR بۆ ناونیشانی ئەم ماڵپەڕە'
    },
    sa: {
      title: 'QR-सङ्केतः — सङ्ख्यासिद्धान्तस्य साधनानि',
      heading: 'इदं जालस्थानं भवतः दूरभाषे उद्घाटयतु',
      caption: 'सर्वाणि साधनानि तत्र उद्घाटयितुं भवतः दूरभाषस्य चित्रग्राहकं सङ्केतं प्रति निर्दिशतु।',
      imgLabel: 'अस्य जालस्थानस्य निर्देशस्य QR-सङ्केतः।'
    },
    la: {
      title: 'Codex QR — Instrumenta theoriae numerorum',
      heading: 'Aperi hanc paginam in telephono tuo',
      caption: 'Telephoni cameram ad codicem dirige ut ibi omnia instrumenta aperias.',
      imgLabel: 'Codex QR cum inscriptione huius paginae'
    }
  });
})();
