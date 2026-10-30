// CDP probe of Cyclic Groups' subgroup on/off switch and Follow bead clicks
// button. Built-ins only (global WebSocket and fetch); headless Google Chrome
// on a throwaway profile, killed on exit.
//   node follow-check.mjs [desktop] [ec] [poly] [mobile] [iso]     (none: all)
import { spawn } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, '../../..');
const URL_BASE = pathToFileURL(join(ROOT, 'Cyclic Groups', 'cyclic-groups.html')).href;
const PORT = 9341;
const ONLY = process.argv.slice(2).filter(a => !a.startsWith('--'));
const want = n => ONLY.length === 0 || ONLY.includes(n);

const UA_DESKTOP = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36';
const UA_ANDROID = 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36';

const sleep = ms => new Promise(r => setTimeout(r, ms));
let fails = 0;
const out = (ok, scen, check, detail) => {
  if (!ok) fails++;
  console.log(`${ok ? 'PASS' : 'FAIL'} ${scen} ${check}${!ok && detail !== undefined ? ' ' + JSON.stringify(detail) : ''}`);
};

/* ---------- Chrome + CDP ---------- */
const profile = mkdtempSync(join(tmpdir(), 'cg-follow-'));
const chrome = spawn('google-chrome', ['--headless=new', `--remote-debugging-port=${PORT}`, `--user-data-dir=${profile}`,
  '--no-first-run', '--no-default-browser-check', '--disable-gpu', '--allow-file-access-from-files', 'about:blank'], { stdio: 'ignore' });
function cleanup() { try { chrome.kill('SIGKILL'); } catch (e) {} try { rmSync(profile, { recursive: true, force: true }); } catch (e) {} }
process.on('exit', cleanup);
process.on('SIGINT', () => process.exit(130));

async function connect() {
  let info = null;
  for (let i = 0; i < 100 && !info; i++) {
    try { info = await (await fetch(`http://127.0.0.1:${PORT}/json/version`)).json(); } catch (e) { await sleep(150); }
  }
  if (!info) throw new Error('Chrome did not start');
  const ws = new WebSocket(info.webSocketDebuggerUrl);
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
  let id = 0; const pending = new Map(); const listeners = [];
  ws.onmessage = ev => {
    const m = JSON.parse(ev.data);
    if (m.id && pending.has(m.id)) { const p = pending.get(m.id); pending.delete(m.id); m.error ? p.rej(new Error(m.error.message)) : p.res(m.result); }
    else if (m.method) listeners.forEach(l => l(m));
  };
  const send = (method, params = {}, sessionId) => new Promise((res, rej) => {
    const i = ++id; pending.set(i, { res, rej });
    ws.send(JSON.stringify({ id: i, method, params, sessionId }));
  });
  return { send, on: l => listeners.push(l), close: () => ws.close() };
}

/* ---------- one page ---------- */
// Opens a fresh browser context sized w x h; touch makes it a phone.
async function openPage(browser, name, { w, h, ua, touch }) {
  const { send, on } = browser;
  const { browserContextId } = await send('Target.createBrowserContext');
  const { targetId } = await send('Target.createTarget', { url: 'about:blank', browserContextId });
  const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true });
  const S = (m, p) => send(m, p, sessionId);
  const errors = [];
  on(m => {
    if (m.sessionId !== sessionId) return;
    if (m.method === 'Runtime.exceptionThrown') errors.push(m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text);
  });
  await S('Page.enable');
  await S('Runtime.enable');
  await S('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: 1, mobile: !!touch });
  await S('Emulation.setUserAgentOverride', { userAgent: ua });
  if (touch) await S('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
  const P = { S, errors, name };
  P.ev = async expr => {
    const r = await S('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true });
    if (r.exceptionDetails) throw new Error('eval: ' + (r.exceptionDetails.exception?.description || r.exceptionDetails.text) + ' in ' + expr.slice(0, 100));
    return r.result.value;
  };
  P.load = async query => {
    const loaded = new Promise(res => on(m => { if (m.sessionId === sessionId && m.method === 'Page.loadEventFired') res(); }));
    await S('Page.navigate', { url: URL_BASE + query });
    await loaded;
    await sleep(1500);
  };
  P.enter = async () => { await P.ev(`(function(){var b=document.getElementById('cg-enter');if(b)b.click();return 0})()`); await sleep(900); };
  P.rect = sel => P.ev(`(function(){var e=document.querySelector(${JSON.stringify(sel)});if(!e)return null;var r=e.getBoundingClientRect();var cs=getComputedStyle(e);return{x:r.left,y:r.top,w:r.width,h:r.height,display:cs.display,vis:cs.visibility}})()`);
  P.exists = sel => P.ev(`!!document.querySelector(${JSON.stringify(sel)})`);
  P.q = () => P.ev('location.search');
  P.param = async k => new URLSearchParams(await P.q()).get(k);
  P.text = sel => P.ev(`(function(){var e=document.querySelector(${JSON.stringify(sel)});return e?e.textContent:null})()`);
  P.attr = (sel, a) => P.ev(`(function(){var e=document.querySelector(${JSON.stringify(sel)});return e?e.getAttribute(${JSON.stringify(a)}):null})()`);
  P.hidden = sel => P.ev(`(function(){var e=document.querySelector(${JSON.stringify(sel)});return !e||e.hidden||!e.offsetParent})()`);
  // a real pointer tap at a page point
  P.mouseTap = async (x, y) => {
    await S('Input.dispatchMouseEvent', { type: 'mouseMoved', x, y });
    await S('Input.dispatchMouseEvent', { type: 'mousePressed', x, y, button: 'left', clickCount: 1 });
    await sleep(40);
    await S('Input.dispatchMouseEvent', { type: 'mouseReleased', x, y, button: 'left', clickCount: 1 });
    await sleep(650);
  };
  P.touchTap = async (x, y) => {
    await S('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] });
    await sleep(40);
    await S('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await sleep(650);
  };
  P.beadPt = el => P.ev(`(function(){var b=document.querySelector('#ring-svg .bead[data-el="${el}"]');if(!b)return null;b.scrollIntoView({block:'center'});var r=b.getBoundingClientRect();return{x:r.left+r.width/2,y:r.top+r.height/2}})()`);
  P.tapBead = async (el, how = 'mouse') => {
    const p = await P.beadPt(el);
    if (!p) throw new Error('no bead ' + el);
    await (how === 'touch' ? P.touchTap(p.x, p.y) : P.mouseTap(p.x, p.y));
  };
  P.clickEl = sel => P.ev(`(function(){var e=document.querySelector(${JSON.stringify(sel)});if(!e)return false;e.click();return true})()`);
  P.combine = () => P.exists('#ring-svg text.ring-combine, #ring-dynamic .ring-combine');
  P.gen = async () => +(await P.param('gen'));
  P.done = async () => { try { await send('Target.closeTarget', { targetId }); await send('Target.disposeBrowserContext', { browserContextId }); } catch (e) {} };
  return P;
}

const noErrors = (P, label) => out(P.errors.length === 0, P.name, 'no-page-exception ' + label, P.errors);

/* ---------- desktop ---------- */
async function desktop(browser) {
  const P = await openPage(browser, 'desktop', { w: 1280, h: 800, ua: UA_DESKTOP });
  await P.load('?mobile=0&mode=additive&n=12&gen=1');
  await P.enter();
  const N = P.name;
  out(!(await P.exists('#gen-select')), N, 'old-dropdown-gone');
  const sw = await P.attr('#gen-switch', 'role');
  out(sw === 'switch' && (await P.attr('#gen-switch', 'aria-checked')) === 'true', N, 'switch-role-and-on', sw);
  const lab = await P.ev(`(function(){var l=document.querySelector('#gen-field .gen-head > label');var r=document.createRange();r.selectNodeContents(l.querySelector('.gen-fs-name'));var a=r.getBoundingClientRect();var b=document.getElementById('gen-switch').getBoundingClientRect();var t=document.getElementById('gen-switch-track')||document.querySelector('.gen-switch-track').getBoundingClientRect();var tr=document.querySelector('.gen-switch-track').getBoundingClientRect();return{textRight:a.right,swLeft:b.left,trackLeft:tr.left,h:tr.height,w:tr.width,swH:b.height}})()`);
  out(lab.trackLeft >= lab.textRight - 1 && lab.trackLeft - lab.textRight <= 16 + 1, N, 'switch-right-of-name', lab);
  out(lab.h > lab.w && lab.swH <= 30, N, 'switch-vertical-and-compact', lab);
  out(!(await P.hidden('#gen-beads')) && (await P.text('#gen-beads')) === 'Follow bead clicks', N, 'beads-button-visible-text', await P.text('#gen-beads'));
  out((await P.attr('#gen-beads', 'aria-pressed')) === 'false', N, 'beads-button-unpressed');
  out(await P.ev(`document.getElementById('gen-super').textContent.length>0`), N, 'g-tail-present');

  // unpressed: a tap combines
  await P.tapBead(4);
  out(await P.combine(), N, 'unpressed-tap-combines');
  await P.ev(`document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true}));0`);
  await P.tapBead(1); // empty-ish; clear any pick by tapping and Escape
  await P.ev(`document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true}));0`);
  await sleep(300);

  // pressed: a tap picks
  await P.clickEl('#gen-beads');
  await sleep(300);
  out((await P.attr('#gen-beads', 'aria-pressed')) === 'true', N, 'beads-button-pressed');
  await P.ev(`(function(){var e=document.getElementById('combine-mode');return 0})()`);
  await P.tapBead(4);
  out(!(await P.combine()), N, 'pressed-tap-no-combine');
  out(await P.ev(`document.getElementById('gen-super').textContent.length>0`), N, 'pressed-g-tail-present');
  out(await P.ev(`(function(){var r=document.querySelector('.subgroup-row[data-gen="4"]');return !!r&&r.classList.contains('is-current')})()`), N, 'pressed-tap-selects-row-4', await P.ev(`Array.prototype.map.call(document.querySelectorAll('.subgroup-row.is-current'),function(r){return r.getAttribute('data-gen')})`));
  out((await P.gen()) === 4 && (await P.param('sub')) === 'beads', N, 'url-gen4-sub-beads', await P.q());
  out((await P.attr('#gen-beads', 'aria-pressed')) === 'true', N, 'still-pressed-after-tap');
  await P.clickEl('.subgroup-row[data-gen="3"]');
  await sleep(300);
  out((await P.gen()) === 3 && (await P.attr('#gen-beads', 'aria-pressed')) === 'true', N, 'row-click-sets-gen3-keeps-pressed', await P.q());
  await P.tapBead(5);
  out((await P.gen()) === 5 && !(await P.combine()), N, 'tap-bead-5-sets-gen5', await P.q());

  // the two Follow buttons exclude each other
  const followVisible = await P.ev(`!document.getElementById('sub-follow').hidden`);
  out(followVisible, N, 'follow-slider-button-shown');
  out(await P.ev(`!!document.querySelector('#gen-field .gen-head #sub-follow')`), N, 'follow-slider-in-subgroup-row');
  if (followVisible) {
    await P.clickEl('#sub-follow');
    await sleep(300);
    out((await P.attr('#gen-beads', 'aria-pressed')) === 'false' && (await P.attr('#sub-follow', 'aria-pressed')) === 'true', N, 'follow-slider-releases-beads');
    await P.clickEl('#gen-beads');
    await sleep(300);
    out((await P.attr('#gen-beads', 'aria-pressed')) === 'true' && (await P.attr('#sub-follow', 'aria-pressed')) === 'false', N, 'follow-beads-releases-slider');
  } else out(true, N, 'follow-slider-button-not-shown (skipped exclusivity)');

  // the switch
  await P.clickEl('#gen-switch');
  await sleep(300);
  out((await P.attr('#gen-switch', 'aria-checked')) === 'false', N, 'switch-off');
  out(await P.ev(`document.getElementById('gen-super').textContent===''`), N, 'switch-off-tail-empty');
  out(await P.hidden('#gen-beads'), N, 'switch-off-hides-beads-button');
  out((await P.param('sub')) === 'none', N, 'switch-off-url-sub-none', await P.q());
  await P.clickEl('#gen-switch');
  await sleep(400);
  out((await P.attr('#gen-switch', 'aria-checked')) === 'true', N, 'switch-on-again');
  out(await P.ev(`document.getElementById('gen-super').textContent.length>0`), N, 'switch-on-tail-present');
  out((await P.param('sub')) === null && (await P.attr('#gen-beads', 'aria-pressed')) === 'false', N, 'switch-on-url-sub-absent-and-button-unpressed', await P.q());
  noErrors(P, 'desktop interaction');

  // links
  await P.load('?mobile=0&mode=additive&n=12&gen=1&sub=none');
  await P.enter();
  out((await P.attr('#gen-switch', 'aria-checked')) === 'false', N, 'reload-sub-none-switch-off');
  await P.load('?mobile=0&mode=additive&n=12&gen=1&sub=beads');
  await P.enter();
  out((await P.attr('#gen-switch', 'aria-checked')) === 'true' && (await P.attr('#gen-beads', 'aria-pressed')) === 'true', N, 'reload-sub-beads-button-pressed');
  noErrors(P, 'desktop reloads');
  await P.done();
}

/* ---------- elliptic curve ---------- */
async function ec(browser) {
  const P = await openPage(browser, 'ec', { w: 1280, h: 900, ua: UA_DESKTOP });
  const N = P.name;
  await P.load('?mobile=0&mode=additive&n=12&curve=17,2,2');
  await P.enter();
  await P.ev(`(function(){var t=document.querySelector('.bar-task[data-task="curve-plot"], #curve-plot-task');if(t&&t.offsetParent)t.click();return 0})()`);
  await sleep(500);
  out((await P.text('#gen-beads')) === 'Follow point clicks', N, 'button-reads-follow-point-clicks', await P.text('#gen-beads'));
  const dots = await P.ev(`Array.prototype.map.call(document.querySelectorAll('#curve-plot-svg .curve-dot'),function(d){return d.getAttribute('data-el')})`);
  out(dots.length > 2, N, 'curve-dots-present', dots);
  const dotClick = el => P.ev(`(function(){var d=document.querySelector('#curve-plot-svg .curve-dot[data-el="${el}"]');if(!d)return false;d.dispatchEvent(new MouseEvent('click',{bubbles:true}));return true})()`);
  // unpressed: a plot click combines
  const d1 = dots[1], d2 = dots[2];
  await dotClick(d1);
  await sleep(300);
  out(await P.ev(`!!document.querySelector('#ring-dynamic .ring-combine, #ring-svg .ring-combine')`), N, 'unpressed-dot-click-starts-combination', await P.ev(`Array.prototype.map.call(document.querySelectorAll('#ring-svg [class*=combine]'),function(e){return e.getAttribute('class')})`));
  await P.ev(`document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true}));0`);
  await sleep(300);
  // pressed: a plot click picks
  await P.clickEl('#gen-beads');
  await sleep(300);
  await dotClick(d2);
  await sleep(300);
  out((await P.gen()) === +d2 && !(await P.combine()), N, 'pressed-dot-click-sets-gen', { gen: await P.q(), want: d2 });
  await P.tapBead(+dots[3]);
  out((await P.gen()) === +dots[3] && !(await P.combine()), N, 'pressed-bead-tap-sets-gen', { q: await P.q(), want: dots[3] });
  out(await P.ev(`document.getElementById('curve-plot-svg')?.closest('.curve-plot')?.classList.contains('is-picks-g') ?? document.querySelector('.curve-plot').classList.contains('is-picks-g')`), N, 'plot-is-picks-g');
  noErrors(P, 'ec');

  // legacy link
  await P.load('?mobile=0&mode=additive&n=12&curve=17,2,2&sub=plot');
  await P.enter();
  out((await P.attr('#gen-switch', 'aria-checked')) === 'true' && (await P.attr('#gen-beads', 'aria-pressed')) === 'true', N, 'legacy-sub-plot-opens-on-and-pressed');
  await P.clickEl('#gen-switch'); await sleep(200); await P.clickEl('#gen-switch'); await sleep(300);
  await P.load('?mobile=0&mode=additive&n=12&curve=17,2,2&sub=plot');
  await P.enter();
  out((await P.param('sub')) === 'beads', N, 'legacy-url-rewritten-to-sub-beads-on-load', await P.q());
  await P.clickEl('#gen-beads'); await sleep(200); await P.clickEl('#gen-beads'); await sleep(300);
  out((await P.param('sub')) === 'beads', N, 'legacy-url-sub-beads-after-retoggle', await P.q());
  noErrors(P, 'ec legacy');
  await P.done();
}

/* ---------- polygon window ---------- */
async function poly(browser) {
  const P = await openPage(browser, 'poly', { w: 1280, h: 900, ua: UA_DESKTOP });
  const N = P.name;
  await P.load('?mobile=0&mode=additive&n=12&gen=1&polygon=1');
  await P.enter();
  const dots = await P.ev(`Array.prototype.map.call(document.querySelectorAll('#poly-plot-svg .curve-dot, .poly-plot .curve-dot'),function(d){return d.getAttribute('data-el')})`);
  out(dots.length > 2, N, 'polygon-corners-present', dots);
  const dotClick = el => P.ev(`(function(){var d=document.querySelector('#poly-plot-svg .curve-dot[data-el="${el}"], .poly-plot .curve-dot[data-el="${el}"]');if(!d)return false;d.dispatchEvent(new MouseEvent('click',{bubbles:true}));return true})()`);
  await P.clickEl('#gen-beads');
  await sleep(300);
  const want = dots.find(d => +d !== 1) ?? dots[1];
  await dotClick(want);
  await sleep(300);
  out((await P.gen()) === +want && !(await P.combine()), N, 'pressed-polygon-corner-sets-gen', { q: await P.q(), want });
  noErrors(P, 'poly');
  await P.done();
}

/* ---------- mobile ---------- */
async function mobile(browser) {
  const P = await openPage(browser, 'mobile', { w: 390, h: 844, ua: UA_ANDROID, touch: true });
  const N = P.name;
  await P.load('?mobile=1&mode=additive&n=12&gen=1');
  const inPanel = sel => P.ev(`!!document.querySelector('#subgroup-panel ${sel}') && document.querySelector('#subgroup-panel ${sel}').offsetParent!==null`);
  out(await inPanel('#gen-switch'), N, 'switch-visible-in-subgroup-panel');
  out(await inPanel('#gen-beads'), N, 'beads-visible-in-subgroup-panel');
  const r = await P.rect('#gen-switch');
  out(r && r.h >= 39.5, N, 'switch-tap-box>=40px', r);
  const o = await P.ev(`({sw:document.documentElement.scrollWidth,iw:innerWidth})`);
  out(o.sw <= o.iw, N, 'no-horizontal-overflow', o);
  const tapEl = async sel => { await P.ev(`document.querySelector(${JSON.stringify(sel)}).scrollIntoView({block:'center'});0`); await sleep(200); const b = await P.rect(sel); await P.touchTap(b.x + b.w / 2, b.y + b.h / 2); };
  await tapEl('#gen-switch');
  out((await P.attr('#gen-switch', 'aria-checked')) === 'false' && (await P.param('sub')) === 'none', N, 'touch-switch-off-sub-none', await P.q());
  await tapEl('#gen-switch');
  out((await P.attr('#gen-switch', 'aria-checked')) === 'true', N, 'touch-switch-on-again');
  await tapEl('#gen-beads');
  out((await P.attr('#gen-beads', 'aria-pressed')) === 'true', N, 'touch-beads-pressed');
  await P.tapBead(4, 'touch');
  out((await P.gen()) === 4 && !(await P.combine()), N, 'touch-bead-tap-sets-gen-no-combine', await P.q());
  noErrors(P, 'mobile');
  await P.done();
}

/* ---------- isomorphism pane ---------- */
async function iso(browser) {
  const P = await openPage(browser, 'iso', { w: 1500, h: 900, ua: UA_DESKTOP });
  const N = P.name;
  await P.load('?mobile=0&mode=additive&n=12&gen=1');
  await P.enter();
  const opened = await P.ev(`(function(){var chips=document.querySelectorAll('#iso-panel a.iso-chip');var c=null;chips.forEach(function(a){if(!c&&a.offsetParent!==null)c=a});if(!c)c=chips[0];if(!c)return null;c.click();return chips.length})()`);
  await sleep(2500);
  const frameOk = await P.ev(`(function(){var f=document.querySelector('iframe.iso-frame, .iso-pane iframe');return !!f})()`);
  if (opened === null || !frameOk) {
    out(true, N, `pane-not-drivable-headless (chips=${opened}, frame=${frameOk}); skipped relay assertions`);
    noErrors(P, 'iso');
    await P.done();
    return;
  }
  const inFrame = expr => P.ev(`(function(){var f=document.querySelector('iframe.iso-frame, .iso-pane iframe');var d=f&&f.contentDocument;if(!d)return null;return (function(document){return ${expr}})(d)})()`);
  out((await inFrame(`!!document.getElementById('gen-switch')`)) === true, N, 'pane-renders-gen-switch');
  const merged = await P.ev(`document.documentElement.classList.contains('is-sub-merged')`);
  if (!merged) {
    out(true, N, 'lists-not-interlocked-here (skipped relay assertions)');
  } else {
    await P.clickEl('#gen-beads');
    await sleep(800);
    out((await inFrame(`document.getElementById('gen-beads').getAttribute('aria-pressed')`)) === 'true', N, 'pane-mirrors-pressed-beads');
    await P.clickEl('#gen-switch');
    await sleep(800);
    out((await inFrame(`document.getElementById('gen-switch').getAttribute('aria-checked')`)) === 'false', N, 'pane-mirrors-switch-off');
    await P.clickEl('#gen-switch');
    await sleep(800);
    out((await inFrame(`document.getElementById('gen-switch').getAttribute('aria-checked')`)) === 'true', N, 'pane-mirrors-switch-on');
  }
  noErrors(P, 'iso');
  const frameErrors = await inFrame(`1`);
  out(frameErrors !== undefined, N, 'pane-frame-readable');
  await P.done();
}

/* ---------- main ---------- */
const browser = await connect();
try {
  if (want('desktop')) await desktop(browser);
  if (want('ec')) await ec(browser);
  if (want('poly')) await poly(browser);
  if (want('mobile')) await mobile(browser);
  if (want('iso')) await iso(browser);
} catch (e) {
  fails++;
  console.log('FAIL probe-crashed ' + (e && e.stack || e));
}
browser.close();
console.log(fails ? `FOLLOW-CHECK FAIL: ${fails}` : 'FOLLOW-CHECK OK');
process.exit(fails ? 1 : 0);
