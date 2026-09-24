/* Shared day/night toggle behavior. The initial [data-theme] attribute is
   already set by a tiny inline script in <head> (before first paint); this
   file wires up the visible switch, persists the choice, and keeps tabs in
   sync.

   Why three persistence channels instead of just localStorage:

   These pages are opened straight from disk (file://), per this project's
   zero-server model. Firefox ships privacy.file_unique_origin=true by
   default, which gives every file:// DOCUMENT its own opaque origin — so
   each page gets its OWN isolated localStorage partition, and a theme saved
   on one tool is invisible to the next one you open. Verified directly: a
   real Firefox profile accumulates one
   storage/default/file++++<full path>.html directory per page, each holding
   its own separate 'site-theme'. Chrome instead puts every file:// document
   in one shared "file://" origin, which is why localStorage alone looked
   like it worked. Persistence therefore cannot rely on any single
   origin-scoped store.

   Layered most-portable first:
     1. THEME_PARAM on the link itself — every same-site link is rewritten to
        carry ?theme=..., so the choice travels with the navigation and is
        immune to any origin or storage-permission model. This is the channel
        that actually carries the theme across tools on file://, and it also
        covers middle-click / "open link in new tab".
     2. document.cookie — shared across file:// documents in Firefox
        (verified empirically), and normal everywhere over http(s). Chrome
        silently drops cookie writes on file://, which is harmless here.
     3. localStorage — the primary store for http(s) deployments and for
        Chrome's shared file:// origin.
   Reads consult them in that order; a write writes all of them.

   window.name is deliberately NOT used as a fallback: browsers reset it to
   "" on cross-origin navigation, and under file_unique_origin every file://
   navigation is cross-origin — so it is cleared by the very hop it would
   need to survive. */
(function(){
  "use strict";
  var STORAGE_KEY = 'site-theme';
  var THEME_PARAM = 'theme';
  var PARAM_RE = new RegExp('([?&])' + THEME_PARAM + '=[^&]*&?');

  function valid(theme){
    return (theme === 'day' || theme === 'night') ? theme : null;
  }

  function fromUrl(){
    var m = new RegExp('[?&]' + THEME_PARAM + '=([^&#]*)').exec(location.search);
    return m ? valid(decodeURIComponent(m[1])) : null;
  }

  function fromCookie(){
    try{
      var m = new RegExp('(?:^|; *)' + STORAGE_KEY + '=([^;]*)').exec(document.cookie || '');
      return m ? valid(decodeURIComponent(m[1])) : null;
    }catch(e){ return null; }
  }

  function fromStorage(){
    try{ return valid(localStorage.getItem(STORAGE_KEY)); }catch(e){ return null; }
  }

  function readTheme(){
    return fromUrl() || fromCookie() || fromStorage() || 'night';
  }

  function persist(theme){
    try{ localStorage.setItem(STORAGE_KEY, theme); }catch(e){}
    try{
      document.cookie = STORAGE_KEY + '=' + theme + ';path=/;max-age=31536000;samesite=lax';
    }catch(e){}
  }

  /* Rewrite every same-site link so that clicking it carries the theme. */
  function decorateLinks(theme){
    var links = document.getElementsByTagName('a');
    for (var i = 0; i < links.length; i++){
      var href = links[i].getAttribute('href');
      if (!href || href.charAt(0) === '#' || /^[a-z][a-z0-9+.\-]*:/i.test(href)) continue;
      var hash = '';
      var cut = href.indexOf('#');
      if (cut !== -1){ hash = href.slice(cut); href = href.slice(0, cut); }
      href = href.replace(PARAM_RE, '$1').replace(/[?&]$/, '');
      href += (href.indexOf('?') === -1 ? '?' : '&') + THEME_PARAM + '=' + theme;
      links[i].setAttribute('href', href + hash);
    }
  }

  function applyTheme(theme, input){
    document.documentElement.setAttribute('data-theme', theme);
    if (input) input.checked = (theme === 'day');
    decorateLinks(theme);
  }

  function setTheme(theme){
    persist(theme);
    applyTheme(theme, document.getElementById('theme-switch-input'));
  }

  /* The ?theme= that brought us here has been copied into the durable stores,
     so drop it from the address bar. If the browser refuses the rewrite the
     param simply stays put — readTheme() and decorateLinks() keep it in step
     either way. */
  function stripUrlParam(){
    if (!fromUrl() || !window.history || !history.replaceState) return;
    var search = location.search
      .replace(new RegExp('([?&])' + THEME_PARAM + '=[^&]*&?', 'g'), '$1')
      .replace(/[?&]$/, '');
    try{
      history.replaceState(null, '', location.pathname + search + location.hash);
    }catch(e){}
  }

  function init(){
    var theme = readTheme();
    persist(theme);
    stripUrlParam();

    var input = document.getElementById('theme-switch-input');
    applyTheme(theme, input);

    if (input){
      input.addEventListener('change', function(){
        setTheme(input.checked ? 'day' : 'night');
      });
    }
    window.addEventListener('storage', function(e){
      if (e.key === STORAGE_KEY){
        applyTheme(readTheme(), document.getElementById('theme-switch-input'));
      }
    });
  }

  if (document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
