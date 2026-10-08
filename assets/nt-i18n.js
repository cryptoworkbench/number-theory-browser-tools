/* NT.i18n — site-wide language dictionaries, lookup, DOM translation and
   durable persistence.

   Why a page needs its own language choice to survive navigation, mirroring
   assets/theme.js's own rationale rather than restating it: these pages are
   opened straight from disk (file://), Firefox gives every file:// document
   its own opaque origin, and Chrome's shared file:// origin still needs a
   channel that is not plain navigation. See assets/theme.js's header
   comment for the full argument — this module follows the identical
   three-channel shape (URL param, cookie, localStorage) with its own key
   and parameter names, never calling into theme.js or routing through
   NT.store (whose documented scope is sibling-pair tool settings, not a
   site-wide preference).

   Persistence (Task 2 decision: option-a — `site-lang`, a raw language
   code, either two-letter, the three-letter `ckb`, the region-tagged
   `pt-BR`/`pt-PT` or the script-tagged `zgh-Latn`/`zgh-Tfng`, owned entirely
   by this module):
   resolution at evaluation time is
   ?lang= beats cookie beats localStorage beats detectDefaultLang(); a value
   outside SUPPORTED_LANGS in any channel is ignored and the next channel is
   tried. An explicit choice (the URL/cookie/localStorage value that won at
   load, or a later setLang()) is written to localStorage first, then to the
   cookie `site-lang=<code>;path=/;max-age=31536000;samesite=lax`; a
   detected default is never written. A `storage` event for this module's
   own key re-applies the new language (html lang, static DOM, links, the
   select, one change event) without writing storage again, mirroring
   assets/theme.js's cross-tab sync; events for any other key (including
   theme.js's own site-theme) are ignored. init() also strips the `lang`
   query parameter from the address bar once its value has been folded into
   the durable stores, leaving every other parameter and the hash intact.

   Include order: this file is a plain, non-deferred <script src>, placed
   after a page's existing nt-*.js includes (core, bigint, svg, store,
   layout — whichever it already uses) and immediately before the page's
   own inline <script>, so every export is ready before that script's IIFE
   runs and the page keeps working when opened directly over file://.

   Rendering rule: every translated string reaches the DOM as a text node
   (createTextNode) or via textContent/setAttribute — never innerHTML.
   Dictionary values and URL/param input are therefore never parsed as
   markup.

   Right-to-left: Hebrew, Arabic and Sorani Kurdish are the right-to-left
   languages. applyHtmlLang sets dir="rtl" on <html> next to lang while one of
   them is active and removes the dir attribute for every other language, so
   the other pages' DOM is unchanged.
   assets/site.css and each page's own :root[dir="rtl"] rule keep diagrams,
   formulas, number grids and numerals left-to-right.

   Numerals are never locale-formatted here or by any dictionary entry —
   math output (RSA moduli, GCD results, Cayley table entries, ...) keeps
   its existing toString()/NT.bigint formatting byte-identical in every
   language.

   Classic script, IIFE, "use strict", no build step. Evaluating this file
   must never throw even when document, navigator, location, localStorage,
   history or window.addEventListener are absent (Phase 7's Node harness
   loads it in a bare vm context with only `window` present) — every
   browser-API access below is guarded with a typeof check or try/catch.

   NT.i18n is frozen and its slot on NT is locked with
   Object.defineProperty(..., { writable: false, configurable: false });
   window.NT itself stays extensible so later modules can still attach.
*/
(function () {
  "use strict";

  var SUPPORTED_LANGS = Object.freeze(['nl', 'en', 'de', 'fr', 'es', 'it', 'pl', 'pt-BR', 'pt-PT', 'sv', 'nb', 'ro', 'hu', 'lv', 'ru', 'el', 'he', 'hi', 'ar', 'sq', 'sw', 'zh', 'ja', 'ko', 'id', 'zgh-Latn', 'zgh-Tfng', 'ku', 'ckb']);
  // The right-to-left languages, Hebrew, Arabic and Sorani Kurdish (internal, not exported):
  // applyHtmlLang sets dir="rtl" on <html> while one of them is active.
  var RTL_LANGS = Object.freeze(['he', 'ar', 'ckb']);
  // Standard Moroccan Tamazight (zgh-Latn, zgh-Tfng) has no CLDR plural data: Intl.PluralRules falls back to the runtime's default locale for it (fr selects one for 0, ru for 21, ja never), so pluralCategory selects one for exactly 1 and other otherwise (internal, not exported).
  var FIXED_PLURAL_LANGS = Object.freeze(['zgh-Latn', 'zgh-Tfng']);
  var LANG_PARAM = 'lang';
  var PARAM_RE = new RegExp('([?&])' + LANG_PARAM + '=[^&]*&?');
  var LANG_STORAGE_KEY = 'site-lang';

  // ---------- namespace registry ----------
  // registry[ns][lang][flatKey] -> string | a CLDR plural-category object { one, other }, plus whichever extra CLDR categories (zero, two, few, many) the language uses, or { other } alone for a language with a single category (zh, ja, ko, id)
  var registry = {};

  function valid(lang) {
    return SUPPORTED_LANGS.indexOf(lang) !== -1 ? lang : null;
  }

  function fromUrl() {
    try {
      var search = (typeof location !== 'undefined') ? location.search : '';
      var m = new RegExp('[?&]' + LANG_PARAM + '=([^&#]*)').exec(search);
      return m ? valid(decodeURIComponent(m[1])) : null;
    } catch (e) { return null; }
  }

  function fromCookie() {
    try {
      var cookie = (typeof document !== 'undefined') ? (document.cookie || '') : '';
      var m = new RegExp('(?:^|; *)' + LANG_STORAGE_KEY + '=([^;]*)').exec(cookie);
      return m ? valid(decodeURIComponent(m[1])) : null;
    } catch (e) { return null; }
  }

  function fromStorage() {
    try { return valid(localStorage.getItem(LANG_STORAGE_KEY)); } catch (e) { return null; }
  }

  // Writes an explicit choice to localStorage first, then the cookie —
  // mirrors assets/theme.js's persist() channel order and cookie-attribute
  // string exactly, under this module's own key. A detected default is
  // never passed here.
  function persist(lang) {
    try { localStorage.setItem(LANG_STORAGE_KEY, lang); } catch (e) { /* ignore */ }
    try {
      document.cookie = LANG_STORAGE_KEY + '=' + lang + ';path=/;max-age=31536000;samesite=lax';
    } catch (e) { /* ignore */ }
  }

  function detectDefaultLang() {
    var langs = [];
    try {
      if (typeof navigator !== 'undefined') {
        if (navigator.languages && navigator.languages.length) langs = navigator.languages;
        else if (navigator.language) langs = [navigator.language];
      }
    } catch (e) { langs = []; }
    for (var i = 0; i < langs.length; i++) {
      // Portuguese is region-aware: pt-BR (or bare pt) -> pt-BR, any other region -> pt-PT.
      var tag = String(langs[i]).toLowerCase();
      var parts = tag.split(/[-_]/);
      if (parts[0] === 'pt') {
        var region = null;
        for (var j = 1; j < parts.length; j++) {
          if (/^(?:[a-z]{2}|[0-9]{3})$/.test(parts[j])) { region = parts[j]; break; }
        }
        return (!region || region === 'br') ? 'pt-BR' : 'pt-PT';
      }
      // Norwegian: the legacy macrolanguage tag no (no, no-NO) means Bokmål; nn (Nynorsk) is unsupported and falls through.
      if (parts[0] === 'no') return 'nb';
      // Hebrew: iw is the withdrawn ISO 639 code for Hebrew, still sent by some older stacks; map it to he.
      if (parts[0] === 'iw') return 'he';
      // Indonesian: in is the withdrawn ISO 639 code for Indonesian, still sent by some older stacks; map it to id.
      if (parts[0] === 'in') return 'id';
      // Tamazight: zgh (Standard Moroccan), tzm (Central Atlas) and ber (Berber) map to zgh-Latn when a Latn script subtag is present and to zgh-Tfng (Tifinagh, the official script of zgh) otherwise; kab, shi and rif are not mapped.
      if (parts[0] === 'zgh' || parts[0] === 'tzm' || parts[0] === 'ber') return parts.indexOf('latn') !== -1 ? 'zgh-Latn' : 'zgh-Tfng';
      // Kurdish: ckb (Central Kurdish, Sorani) and a ku tag with an Arab script subtag map to ckb, kmr (Northern Kurdish, Kurmanji) maps to ku, and every other ku tag reaches ku through the two-letter fallback below; sdh and lki are not mapped.
      if (parts[0] === 'ckb' || (parts[0] === 'ku' && parts.indexOf('arab') !== -1)) return 'ckb';
      if (parts[0] === 'kmr') return 'ku';
      var code = String(langs[i]).slice(0, 2).toLowerCase();
      if (valid(code)) return code;
    }
    return 'en';
  }

  // Resolution at evaluation time: ?lang= beats cookie beats localStorage
  // beats detectDefaultLang(); a value outside SUPPORTED_LANGS in any
  // channel is ignored (each reader above returns null for it) and the
  // next channel is tried. explicitAtLoad records whether the winning
  // value came from an actual channel (persisted in init()) or merely from
  // the browser-language default (never persisted).
  var _urlLangAtLoad = fromUrl();
  var _cookieLangAtLoad = fromCookie();
  var _storageLangAtLoad = fromStorage();
  var explicitAtLoad = !!(_urlLangAtLoad || _cookieLangAtLoad || _storageLangAtLoad);
  var currentLang = _urlLangAtLoad || _cookieLangAtLoad || _storageLangAtLoad || detectDefaultLang();

  function applyHtmlLang(lang) {
    try {
      if (typeof document !== 'undefined' && document.documentElement) {
        document.documentElement.lang = lang;
        if (RTL_LANGS.indexOf(lang) !== -1) document.documentElement.setAttribute('dir', 'rtl');
        else document.documentElement.removeAttribute('dir');
      }
    } catch (e) { /* ignore */ }
  }
  applyHtmlLang(currentLang);

  function getLang() {
    return currentLang;
  }

  // ---------- registration ----------

  function register(ns, dict) {
    if (typeof ns !== 'string' || !/^[a-z][A-Za-z]*$/.test(ns)) {
      throw new Error("NT.i18n.register: invalid namespace '" + ns + "'");
    }
    if (Object.prototype.hasOwnProperty.call(registry, ns)) {
      throw new Error("NT.i18n.register: namespace '" + ns + "' is already registered");
    }
    if (!dict || typeof dict !== 'object' || !Object.prototype.hasOwnProperty.call(dict, 'en')) {
      throw new Error("NT.i18n.register: dict for namespace '" + ns + "' must have an own 'en' object");
    }
    var frozenDict = {};
    for (var lang in dict) {
      if (!Object.prototype.hasOwnProperty.call(dict, lang)) continue;
      frozenDict[lang] = Object.freeze(dict[lang]);
    }
    registry[ns] = frozenDict;
  }

  // ---------- lookup / substitution ----------

  function lookupEntry(ns, lang, rest) {
    var nsDict = registry[ns];
    if (!nsDict) return undefined;
    var langDict = nsDict[lang];
    if (!langDict) return undefined;
    if (!Object.prototype.hasOwnProperty.call(langDict, rest)) return undefined;
    return langDict[rest];
  }

  function resolveCount(params) {
    var c = params && params.count;
    if (c && typeof c === 'object' && c.nodeType) c = c.textContent;
    return Number(c);
  }

  function pluralCategory(lang, count) {
    if (FIXED_PLURAL_LANGS.indexOf(lang) !== -1) return count === 1 ? 'one' : 'other';
    if (typeof Intl !== 'undefined' && typeof Intl.PluralRules === 'function') {
      try {
        var cat = new Intl.PluralRules(lang).select(count);
        return cat;
      } catch (e) { /* fall through to the no-Intl default below */ }
    }
    return count === 1 ? 'one' : 'other';
  }

  // resolveTemplate(key, params) -> the raw template string for key,
  // already plural-selected by CLDR category when the entry is a plural object.
  // Falls back current lang -> en -> the key itself (returned unchanged,
  // never substituted).
  function resolveTemplate(key, params) {
    var dot = key.indexOf('.');
    if (dot === -1) return key;
    var ns = key.slice(0, dot);
    var rest = key.slice(dot + 1);
    var entry = lookupEntry(ns, currentLang, rest);
    if (entry === undefined) entry = lookupEntry(ns, 'en', rest);
    if (entry === undefined) return key;
    if (entry && typeof entry === 'object') {
      var count = resolveCount(params);
      var cat = pluralCategory(currentLang, count);
      var tpl = Object.prototype.hasOwnProperty.call(entry, cat) ? entry[cat] : entry.other;
      return (typeof tpl === 'string') ? tpl : key;
    }
    return (typeof entry === 'string') ? entry : key;
  }

  function substitute(template, params) {
    if (!params) return template;
    return template.replace(/\{([A-Za-z0-9_]+)\}/g, function (whole, name) {
      if (!Object.prototype.hasOwnProperty.call(params, name)) return whole;
      var v = params[name];
      if (v && typeof v === 'object' && v.nodeType) return String(v.textContent);
      return String(v);
    });
  }

  function translate(key, params) {
    return substitute(resolveTemplate(key, params), params);
  }

  // renderTemplate(el, template, params): clears el and appends one text
  // node per literal segment plus, per placeholder, the param itself when
  // it is a DOM Node or a text node of String(value); an unknown
  // placeholder renders as its literal "{name}" text. Never innerHTML.
  // Does not touch data-i18n*/attributes — callers decide that.
  function renderTemplate(el, template, params) {
    el.textContent = '';
    var re = /\{([A-Za-z0-9_]+)\}/g;
    var lastIndex = 0;
    var m;
    while ((m = re.exec(template)) !== null) {
      if (m.index > lastIndex) {
        el.appendChild(document.createTextNode(template.slice(lastIndex, m.index)));
      }
      var name = m[1];
      if (params && Object.prototype.hasOwnProperty.call(params, name)) {
        var v = params[name];
        if (v && typeof v === 'object' && v.nodeType) {
          el.appendChild(v);
        } else {
          el.appendChild(document.createTextNode(String(v)));
        }
      } else {
        el.appendChild(document.createTextNode(m[0]));
      }
      lastIndex = re.lastIndex;
    }
    if (lastIndex < template.length) {
      el.appendChild(document.createTextNode(template.slice(lastIndex)));
    }
    return el;
  }

  function translateInto(el, key, params) {
    var tpl = resolveTemplate(key, params);
    renderTemplate(el, tpl, params);
    el.removeAttribute('data-i18n');
    el.removeAttribute('data-i18n-params');
    return el;
  }

  function bindText(el, key, params) {
    if (key === null || key === undefined) {
      el.textContent = '';
      el.removeAttribute('data-i18n');
      el.removeAttribute('data-i18n-params');
      return el;
    }
    el.setAttribute('data-i18n', key);
    if (params) {
      var strParams = {};
      for (var k in params) {
        if (Object.prototype.hasOwnProperty.call(params, k)) strParams[k] = String(params[k]);
      }
      el.setAttribute('data-i18n-params', JSON.stringify(strParams));
    } else {
      el.removeAttribute('data-i18n-params');
    }
    el.textContent = translate(key, params);
    return el;
  }

  // Records, per rich-markup element, the element children present on its
  // first applyStaticDom() visit (document order) — so a later visit (after
  // the template's own nodes have been cleared and re-inserted) still knows
  // which original child elements to re-insert, even if the template
  // reorders them.
  var richChildrenMap = (typeof WeakMap !== 'undefined') ? new WeakMap() : null;

  function parseParamsAttr(el) {
    var raw = el.getAttribute('data-i18n-params');
    if (!raw) return undefined;
    try { return JSON.parse(raw); } catch (e) { return null; }
  }

  function applyAttr(root, dataAttr, targetAttr) {
    var nodes = root.querySelectorAll('[' + dataAttr + ']');
    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i];
      var key = el.getAttribute(dataAttr);
      el.setAttribute(targetAttr, translate(key));
    }
  }

  function applyStaticDom(root) {
    root = root || (typeof document !== 'undefined' ? document : null);
    if (!root || !root.querySelectorAll) return;
    var nodes = root.querySelectorAll('[data-i18n]');
    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i];
      var key = el.getAttribute('data-i18n');
      var attrParams = parseParamsAttr(el);
      if (attrParams === null) attrParams = undefined;
      var isRich = (richChildrenMap && richChildrenMap.has(el)) || (el.children && el.children.length > 0);
      if (isRich) {
        var kids;
        if (richChildrenMap && richChildrenMap.has(el)) {
          kids = richChildrenMap.get(el);
        } else {
          kids = [];
          for (var c = 0; c < el.children.length; c++) kids.push(el.children[c]);
          if (richChildrenMap) richChildrenMap.set(el, kids);
        }
        var mergedParams = {};
        for (var ki = 0; ki < kids.length; ki++) mergedParams[ki] = kids[ki];
        if (attrParams) {
          for (var pk in attrParams) {
            if (Object.prototype.hasOwnProperty.call(attrParams, pk)) mergedParams[pk] = attrParams[pk];
          }
        }
        renderTemplate(el, resolveTemplate(key, mergedParams), mergedParams);
      } else {
        el.textContent = translate(key, attrParams);
      }
    }
    applyAttr(root, 'data-i18n-title', 'title');
    applyAttr(root, 'data-i18n-aria-label', 'aria-label');
    applyAttr(root, 'data-i18n-placeholder', 'placeholder');
  }

  // ---------- link decoration ----------
  // Own regex, strips only lang= — mirrors assets/theme.js's decorateLinks
  // discipline of touching only its own query parameter so the two
  // independent rewrite passes (theme's ?theme=, this module's ?lang=)
  // never clobber each other.
  function decorateLinks(lang) {
    if (typeof document === 'undefined' || typeof document.getElementsByTagName !== 'function') return;
    try {
    var links = document.getElementsByTagName('a');
    for (var i = 0; i < links.length; i++) {
      var href = links[i].getAttribute('href');
      if (!href || href.charAt(0) === '#' || /^[a-z][a-z0-9+.\-]*:/i.test(href)) continue;
      var hash = '';
      var cut = href.indexOf('#');
      if (cut !== -1) { hash = href.slice(cut); href = href.slice(0, cut); }
      href = href.replace(PARAM_RE, '$1').replace(/[?&]$/, '');
      href += (href.indexOf('?') === -1 ? '?' : '&') + LANG_PARAM + '=' + lang;
      links[i].setAttribute('href', href + hash);
    }
    } catch (e) { /* ignore — a partial document stub (e.g. a test harness) must never throw */ }
  }

  // ---------- setLang / change event ----------

  function onLangChange(fn) {
    if (typeof window !== 'undefined' && window.addEventListener) {
      window.addEventListener('nt-i18n:change', function (e) { fn(e.detail.lang); });
    }
  }

  // Applies an already-validated language: updates the active value, html
  // lang, static DOM, links and the switcher, then fires exactly one
  // nt-i18n:change event. Shared by setLang (which persists first) and the
  // storage listener (which never persists — the write already happened in
  // the tab that changed it).
  function applyLang(lang) {
    currentLang = lang;
    applyHtmlLang(lang);
    applyStaticDom(typeof document !== 'undefined' ? document : null);
    decorateLinks(lang);
    try {
      var select = (typeof document !== 'undefined') ? document.getElementById('lang-switch-select') : null;
      if (select) select.value = lang;
    } catch (e) { /* ignore */ }
    if (typeof window !== 'undefined' && window.dispatchEvent && typeof CustomEvent !== 'undefined') {
      window.dispatchEvent(new CustomEvent('nt-i18n:change', { detail: { lang: lang } }));
    }
  }

  function setLang(lang) {
    if (!valid(lang)) return false;
    if (lang === currentLang) return true;
    persist(lang);
    applyLang(lang);
    return true;
  }

  // ---------- cross-tab sync ----------
  // Mirrors assets/theme.js's storage listener: react to another tab's
  // explicit choice for this module's own key, applying it without writing
  // storage again (the write already happened in the tab that changed it).
  // Events for any other key — including theme.js's own site-theme — are
  // ignored.
  function initStorageListener() {
    if (typeof window === 'undefined' || !window.addEventListener) return;
    window.addEventListener('storage', function (e) {
      if (e.key !== LANG_STORAGE_KEY) return;
      var next = valid(e.newValue);
      if (!next || next === currentLang) return;
      applyLang(next);
    });
  }

  // The ?lang= that brought us here has been folded into the durable
  // stores by init(), so drop it from the address bar — every other query
  // parameter and the hash are left untouched. Mirrors assets/theme.js's
  // stripUrlParam() with this module's own LANG_PARAM/regex.
  function stripUrlParam() {
    if (!fromUrl()) return;
    if (typeof window === 'undefined' || !window.history || !history.replaceState) return;
    try {
      var search = location.search
        .replace(new RegExp('([?&])' + LANG_PARAM + '=[^&]*&?', 'g'), '$1')
        .replace(/[?&]$/, '');
      history.replaceState(null, '', location.pathname + search + location.hash);
    } catch (e) { /* ignore */ }
  }

  // ---------- init ----------

  function init() {
    if (explicitAtLoad) persist(currentLang);
    applyStaticDom(document);
    decorateLinks(currentLang);
    try {
      var select = (typeof document.getElementById === 'function') ? document.getElementById('lang-switch-select') : null;
      if (select) {
        select.value = currentLang;
        if (typeof select.addEventListener === 'function') {
          select.addEventListener('change', function () { setLang(select.value); });
        }
      }
    } catch (e) { /* ignore — a partial document stub (e.g. a test harness) must never throw */ }
    stripUrlParam();
    initStorageListener();
  }

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
    } else {
      init();
    }
  }

  var NT = (typeof window !== 'undefined') ? (window.NT = window.NT || {}) : {};
  NT.i18n = Object.freeze({
    LANG_STORAGE_KEY: LANG_STORAGE_KEY,
    SUPPORTED_LANGS: SUPPORTED_LANGS,
    applyStaticDom: applyStaticDom,
    bindText: bindText,
    detectDefaultLang: detectDefaultLang,
    getLang: getLang,
    onLangChange: onLangChange,
    register: register,
    setLang: setLang,
    translate: translate,
    translateInto: translateInto
  });
  // NT stays extensible so other modules can add their own namespace, but
  // this slot is locked: NT.i18n can never be reassigned or deleted.
  Object.defineProperty(NT, 'i18n', { writable: false, configurable: false });
})();
