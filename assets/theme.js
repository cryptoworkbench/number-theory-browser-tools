/* Shared day/night toggle behavior. The initial [data-theme] attribute is
   already set by a tiny inline script in <head> (before first paint); this
   file just wires up the visible switch and keeps tabs in sync. */
(function(){
  "use strict";
  var STORAGE_KEY = 'site-theme';

  function readTheme(){
    try{
      return localStorage.getItem(STORAGE_KEY) === 'day' ? 'day' : 'night';
    }catch(e){
      return 'night';
    }
  }

  function applyTheme(theme, input){
    document.documentElement.setAttribute('data-theme', theme);
    if (input) input.checked = (theme === 'day');
  }

  function setTheme(theme){
    try{ localStorage.setItem(STORAGE_KEY, theme); }catch(e){}
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
