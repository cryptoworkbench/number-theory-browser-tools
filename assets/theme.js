/* Shared day/night toggle behavior. The initial [data-theme] attribute is
   already set by a tiny inline script in <head> (before first paint); this
   file just wires up the visible switch and keeps tabs in sync.

   Fallback persistence: window.name, not document.cookie. document.cookie
   writes are silently dropped (no exception, nothing persisted) on file://
   origins in both Chromium and WebKit, because cookies require a host/domain
   component that file:// URLs lack — verified empirically for this repo, not
   assumed from spec. window.name survives same-tab navigation across
   different file:// documents regardless of any storage-permission model,
   matching this project's zero-server, open-the-file-directly deployment
   model (no build system, no server — per CLAUDE.md). This is what lets the
   theme survive cross-tool navigation in Safari's file:// SecurityError
   environment, where every localStorage access throws. */
(function(){
  "use strict";
  var STORAGE_KEY = 'site-theme';

  function readTheme(){
    var t = null;
    try{ t = localStorage.getItem(STORAGE_KEY); }catch(e){ t = null; }
    if (t !== 'day' && t !== 'night'){
      t = (window.name === 'day' || window.name === 'night') ? window.name : null;
    }
    return t === 'day' ? 'day' : 'night';
  }

  function applyTheme(theme, input){
    document.documentElement.setAttribute('data-theme', theme);
    if (input) input.checked = (theme === 'day');
  }

  function setTheme(theme){
    try{ localStorage.setItem(STORAGE_KEY, theme); }catch(e){}
    try{ window.name = theme; }catch(e){}
    applyTheme(theme, document.getElementById('theme-switch-input'));
  }

  function init(){
    var input = document.getElementById('theme-switch-input');
    if (!input) return;
    applyTheme(readTheme(), input);
    input.addEventListener('change', function(){
      setTheme(input.checked ? 'day' : 'night');
    });
    window.addEventListener('storage', function(e){
      if (e.key === STORAGE_KEY) applyTheme(readTheme(), input);
    });
  }

  if (document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
