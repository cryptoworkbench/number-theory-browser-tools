/* NT.picker — the shared-palette prime picker: a small date-picker-style
   popover that lets a visitor fill a prime-valued text field by choosing a
   circle instead of typing.

   The concept this centralizes: the shared number palette (NT.store's
   number-palette, fed by Factor Tree, Venn Diagram and the Sieve of
   Eratosthenes) is the one place a visitor keeps the numbers they care
   about. A page with a prime field (RSA's p and q, Diffie-Hellman's p) lets
   that palette's primes flow into the field. attachPrimePicker(input,
   trigger, options) binds one field to one trigger button: clicking the
   trigger opens a small panel under the field (or above it when there is no
   room) with the palette's primes as 44px circles, about two rows tall and
   scrolling for the rest. Choosing a circle writes the number into the
   field, fires input and change, closes the panel and gives the focus back
   to the trigger.

   The panel is a dialog appended to document.body, positioned absolutely in
   document coordinates, because a tool's .panel container clips overflow.
   Its look lives in assets/site.css under the .prime-pop-* classes. Only one
   panel is open at a time; an open panel closes on an outside click, on
   Escape and on Tab, follows palette changes made in another tab through the
   storage event, and re-translates on a language switch without closing.

   Every node is built with createElement and every string arrives through
   data-i18n attributes or NT.i18n.translate, so the panel is translated in
   every site language. Primality uses NT.bigint.isPrimeBig, the same test
   RSA and Diffie-Hellman validate with, so the picker never offers a value
   the page then rejects.

   Classic script, IIFE, "use strict" — no build step, no bundler. It must be
   included as a plain, non-deferred <script src> (no defer, no async, no
   type="module") so it executes synchronously before a tool's own inline
   <script> runs, and so pages keep working when opened directly over
   file://, where ES module imports are blocked by CORS.

   Dependencies: NT.bigint (isPrimeBig), NT.store (SHARED_PALETTE_KEY,
   loadSharedPalette, readSharedPalette) and NT.i18n (applyStaticDom,
   onLangChange, translate). They are read when attachPrimePicker is first
   called, which throws a descriptive Error if any is missing. Evaluating
   this file touches no part of the document: harness.js loads it in a bare
   vm context that has only window.

   Include convention: place
     <script src="../assets/nt-picker.js"></script>
   on its own line, in the canonical order core, bigint, svg, store, layout,
   i18n, picker, immediately before the page's own assets/i18n/site.js data
   file and inline <script> block at the end of <body>.

   Consumers: RSA (four prime fields, minimum 3) and Diffie-Hellman Key
   Exchange (the modulus p, minimum 5).

   NT.picker is frozen, and its slot on NT is read-only, after construction —
   a tool must never assign to NT or to any of its members (shadow-check.js's
   NS-MUTATION gate enforces this).
*/
(function () {
  "use strict";

  var NT = window.NT = window.NT || {};

  // Every tool page sits one directory below the site root.
  var SIEVE_HREF = '../Sieve Of Eratosthenes/sieve-of-eratosthenes.html';
  var GAP = 6;   // px between the field and its panel
  var EDGE = 8;  // minimum px between the panel and the viewport edge

  var instances = [];
  var openInst = null;
  var primeMemo = {};
  var listenersInstalled = false;
  var deps = null;

  function loadDeps() {
    if (deps) return deps;
    if (!NT.bigint || !NT.store || !NT.i18n) {
      throw new Error('assets/nt-picker.js needs assets/nt-bigint.js, assets/nt-store.js and assets/nt-i18n.js loaded before it');
    }
    deps = {
      isPrimeBig: NT.bigint.isPrimeBig,
      paletteKey: NT.store.SHARED_PALETTE_KEY,
      loadPalette: NT.store.loadSharedPalette,
      readPalette: NT.store.readSharedPalette,
      applyStaticDom: NT.i18n.applyStaticDom,
      onLangChange: NT.i18n.onLangChange,
      translate: NT.i18n.translate
    };
    return deps;
  }

  /* ---------- primes ---------- */

  function isPrimeMemo(v) {
    if (!Object.prototype.hasOwnProperty.call(primeMemo, v)) {
      primeMemo[v] = deps.isPrimeBig(BigInt(v));
    }
    return primeMemo[v];
  }

  // The primes of a palette that are at least min: each once, ascending.
  function eligiblePrimes(list, min) {
    var seen = {};
    var out = [];
    for (var i = 0; i < list.length; i++) {
      var v = list[i];
      if (v < min || seen[v] || !isPrimeMemo(v)) continue;
      seen[v] = true;
      out.push(v);
    }
    out.sort(function (a, b) { return a - b; });
    return out;
  }

  /* ---------- panel geometry ---------- */

  function chipsOf(inst) {
    return inst.grid.querySelectorAll('.prime-pop-chip');
  }

  // Widens every column to the widest chip, so 2-, 3- and 4-digit chips
  // still line up in columns.
  function sizeCells(inst) {
    var w = 44;
    var chips = chipsOf(inst);
    for (var i = 0; i < chips.length; i++) w = Math.max(w, chips[i].offsetWidth);
    inst.grid.style.setProperty('--prime-pop-cell', w + 'px');
  }

  function position(inst) {
    var a = inst.input.getBoundingClientRect();
    var b = inst.trigger.getBoundingClientRect();
    var rectLeft = Math.min(a.left, b.left);
    var rectTop = Math.min(a.top, b.top);
    var rectBottom = Math.max(a.bottom, b.bottom);
    var sx = window.pageXOffset || 0;
    var sy = window.pageYOffset || 0;
    var pop = inst.pop;
    var vw = document.documentElement.clientWidth;
    var left = rectLeft + sx;
    var maxLeft = sx + vw - pop.offsetWidth - EDGE;
    var minLeft = sx + EDGE;
    left = Math.max(minLeft, Math.min(left, maxLeft));
    var roomBelow = window.innerHeight - rectBottom;
    var roomAbove = rectTop;
    var needed = pop.offsetHeight + GAP + EDGE;
    var top;
    if (roomBelow < needed && roomAbove > roomBelow) {
      top = rectTop + sy - pop.offsetHeight - GAP;
      pop.classList.add('is-above');
    } else {
      top = rectBottom + sy + GAP;
      pop.classList.remove('is-above');
    }
    pop.style.left = left + 'px';
    pop.style.top = top + 'px';
  }

  // Scrolls only the panel's own grid so chip is fully visible; the page
  // never scrolls.
  function reveal(inst, chip) {
    var grid = inst.grid;
    var top = chip.offsetTop;
    var bottom = top + chip.offsetHeight;
    var pad = 4;
    if (top - pad < grid.scrollTop) grid.scrollTop = Math.max(0, top - pad);
    else if (bottom + pad > grid.scrollTop + grid.clientHeight) grid.scrollTop = bottom + pad - grid.clientHeight;
  }

  /* ---------- rendering ---------- */

  function render(inst, list) {
    var primes = eligiblePrimes(list || deps.loadPalette(), inst.min);
    var current = inst.input.value.trim();
    while (inst.grid.firstChild) inst.grid.removeChild(inst.grid.firstChild);
    for (var i = 0; i < primes.length; i++) {
      (function (v) {
        var chip = document.createElement('button');
        chip.type = 'button';
        chip.className = 'prime-pop-chip';
        chip.textContent = String(v);
        if (String(v) === current) chip.setAttribute('aria-current', 'true');
        chip.addEventListener('click', function () { pick(inst, v); });
        inst.grid.appendChild(chip);
      })(primes[i]);
    }
    inst.grid.hidden = primes.length === 0;
    inst.empty.hidden = primes.length !== 0;
    sizeCells(inst);
  }

  /* ---------- open / close / pick ---------- */

  function focusChip(inst, chip) {
    chip.focus({ preventScroll: true });
    reveal(inst, chip);
  }

  function open(inst) {
    if (openInst && openInst !== inst) close(openInst, false);
    inst.pop.hidden = false;
    inst.trigger.setAttribute('aria-expanded', 'true');
    openInst = inst;
    render(inst);
    position(inst);
    var chips = chipsOf(inst);
    var target = inst.grid.querySelector('.prime-pop-chip[aria-current="true"]') || chips[0];
    if (target) focusChip(inst, target);
    else inst.pop.focus({ preventScroll: true });
  }

  function close(inst, returnFocus) {
    inst.pop.hidden = true;
    inst.trigger.setAttribute('aria-expanded', 'false');
    if (openInst === inst) openInst = null;
    if (returnFocus) inst.trigger.focus();
  }

  function pick(inst, v) {
    inst.input.value = String(v);
    inst.input.dispatchEvent(new Event('input', { bubbles: true }));
    inst.input.dispatchEvent(new Event('change', { bubbles: true }));
    close(inst, true);
    if (typeof inst.onPick === 'function') inst.onPick(v);
  }

  /* ---------- keyboard ---------- */

  function columnCount(chips) {
    if (!chips.length) return 1;
    var top = chips[0].offsetTop;
    var n = 0;
    while (n < chips.length && chips[n].offsetTop === top) n++;
    return Math.max(1, n);
  }

  function onPanelKeydown(inst, e) {
    var key = e.key;
    if (key === 'Escape') {
      e.preventDefault();
      close(inst, true);
      return;
    }
    if (key === 'Tab') {
      e.preventDefault();
      close(inst, true);
      return;
    }
    var chips = chipsOf(inst);
    if (!chips.length) return;
    var idx = -1;
    for (var i = 0; i < chips.length; i++) {
      if (chips[i] === document.activeElement) { idx = i; break; }
    }
    var next;
    if (key === 'ArrowRight') next = idx + 1;
    else if (key === 'ArrowLeft') next = idx - 1;
    else if (key === 'ArrowDown') next = idx + columnCount(chips);
    else if (key === 'ArrowUp') next = idx - columnCount(chips);
    else if (key === 'Home') next = 0;
    else if (key === 'End') next = chips.length - 1;
    else return;
    e.preventDefault();
    if (idx < 0) next = 0;
    next = Math.max(0, Math.min(chips.length - 1, next));
    focusChip(inst, chips[next]);
  }

  /* ---------- global listeners (installed once) ---------- */

  function labelLinks() {
    var label = deps.translate('site.nav.sieve');
    for (var i = 0; i < instances.length; i++) instances[i].link.textContent = label;
  }

  function installListeners() {
    if (listenersInstalled) return;
    listenersInstalled = true;
    document.addEventListener('pointerdown', function (e) {
      if (!openInst) return;
      var t = e.target;
      if (openInst.pop.contains(t) || openInst.trigger.contains(t)) return;
      close(openInst, false);
    }, true);
    window.addEventListener('resize', function () {
      if (openInst) position(openInst);
    });
    window.addEventListener('storage', function (e) {
      if (!openInst || e.key !== deps.paletteKey) return;
      var list = deps.readPalette(e.newValue);
      if (!list) return;
      var inst = openInst;
      var active = document.activeElement;
      var keep = (active && inst.grid.contains(active)) ? active.textContent : null;
      render(inst, list);
      position(inst);
      var chips = chipsOf(inst);
      var target = null;
      if (keep !== null) {
        for (var i = 0; i < chips.length; i++) {
          if (chips[i].textContent === keep) { target = chips[i]; break; }
        }
        if (!target) target = chips[0];
      }
      if (target) focusChip(inst, target);
    });
    deps.onLangChange(function () {
      labelLinks();
      if (openInst) position(openInst);
    });
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function () {
        if (!openInst) return;
        sizeCells(openInst);
        position(openInst);
      });
    }
  }

  /* ---------- attach ---------- */

  function attachPrimePicker(input, trigger, options) {
    loadDeps();
    if (!input || !trigger) {
      throw new Error('attachPrimePicker needs an input element and a trigger element');
    }
    if (!trigger.id) {
      throw new Error('attachPrimePicker needs the trigger element to have an id');
    }
    options = options || {};
    var id = trigger.id + '-pop';

    var pop = document.createElement('div');
    pop.className = 'prime-pop';
    pop.id = id;
    pop.setAttribute('role', 'dialog');
    pop.setAttribute('aria-labelledby', id + '-title');
    pop.setAttribute('tabindex', '-1');
    pop.hidden = true;

    var title = document.createElement('p');
    title.className = 'prime-pop-title';
    title.id = id + '-title';
    title.setAttribute('data-i18n', 'common.primePickerHeading');

    var grid = document.createElement('div');
    grid.className = 'prime-pop-grid';

    var empty = document.createElement('p');
    empty.className = 'prime-pop-empty';
    empty.setAttribute('data-i18n', 'common.paletteEmptySieve');
    empty.hidden = true;
    var link = document.createElement('a');
    link.className = 'prime-pop-sieve-link';
    link.href = SIEVE_HREF;
    link.textContent = deps.translate('site.nav.sieve');
    empty.appendChild(link);

    pop.appendChild(title);
    pop.appendChild(grid);
    pop.appendChild(empty);
    document.body.appendChild(pop);
    deps.applyStaticDom(pop);

    trigger.setAttribute('aria-haspopup', 'dialog');
    trigger.setAttribute('aria-expanded', 'false');
    trigger.setAttribute('aria-controls', id);

    var inst = {
      input: input,
      trigger: trigger,
      pop: pop,
      grid: grid,
      empty: empty,
      link: link,
      min: typeof options.min === 'number' ? options.min : 2,
      onPick: options.onPick
    };
    instances.push(inst);

    trigger.addEventListener('click', function () {
      if (openInst === inst) close(inst, true);
      else open(inst);
    });
    pop.addEventListener('keydown', function (e) { onPanelKeydown(inst, e); });
    pop.addEventListener('focusout', function (e) {
      var to = e.relatedTarget;
      if (to && !pop.contains(to) && to !== trigger) close(inst, false);
    });

    installListeners();
    return inst.pop;
  }

  NT.picker = Object.freeze({
    attachPrimePicker: attachPrimePicker
  });
  // NT stays extensible so later modules can add their own namespace, but
  // this slot is locked: NT.picker can never be reassigned or deleted.
  Object.defineProperty(NT, 'picker', { writable: false, configurable: false });
})();
