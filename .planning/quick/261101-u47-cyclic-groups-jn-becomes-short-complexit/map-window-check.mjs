// CDP probe of Cyclic Groups' formula map window (quick 261101-u47): the
// Complexity slider's first slot reads Short, the Complexity caption and the
// map icon are gone, and the formula's right-click menu opens the map in a
// floating window with minimize (_) and close (x) buttons that minimizes
// into the bottom bar, follows the sliders and reopens from fmapopen=1.
// Harness copied from 261101-so1's additive-slider-check.mjs.
//   node map-window-check.mjs
import { spawn, execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, rmSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import vm from 'node:vm';


const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, '../../..');
const PAGE = join(ROOT, 'Cyclic Groups', 'cyclic-groups.html');
const URL_BASE = pathToFileURL(PAGE).href;
const PORT = 9387;
const ARGS = process.argv.slice(2);
const CAPTURE = ARGS.includes('--capture');
const ONLY = ARGS.filter(a => !a.startsWith('--'));
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
const profile = mkdtempSync(join(tmpdir(), 'cg-mapwin-'));
const chrome = spawn('google-chrome', ['--headless=new', `--remote-debugging-port=${PORT}`, `--user-data-dir=${profile}`,
  '--no-first-run', '--no-default-browser-check', '--disable-gpu', '--disk-cache-size=1', '--media-cache-size=1', '--allow-file-access-from-files', 'about:blank'], { stdio: 'ignore' });
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
  await S('Emulation.setFocusEmulationEnabled', { enabled: true });
  await S('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: 1, mobile: !!touch });
  await S('Emulation.setUserAgentOverride', { userAgent: ua });
  if (touch) await S('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
  const P = { S, errors, name, sessionId, on, contexts: [] };
  on(m => { if (m.sessionId === sessionId && m.method === 'Runtime.executionContextCreated') P.contexts.push(m.params.context); });
  P.ev = async (expr, ctx) => {
    const r = await S('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true, ...(ctx ? { contextId: ctx } : {}) });
    if (r.exceptionDetails) throw new Error('eval: ' + (r.exceptionDetails.exception?.description || r.exceptionDetails.text) + ' in ' + expr.slice(0, 100));
    return r.result.value;
  };
  P.load = async query => {
    const loaded = new Promise(res => on(m => { if (m.sessionId === sessionId && m.method === 'Page.loadEventFired') res(); }));
    if (process.env.PROGRESS) console.error(new Date().toISOString().slice(11, 19), P.name, query.slice(0, 110));
    await S('Page.navigate', { url: URL_BASE + query });
    await Promise.race([loaded, sleep(25000).then(() => { throw new Error('page load timed out: ' + query); })]);
    await sleep(700);
  };
  P.enter = async () => {
    await P.ev(`(function(){var b=document.getElementById('cg-enter');if(b)b.click();return 0})()`);
    for (let i = 0; i < 40; i++) {
      await sleep(150);
      if (await P.ev(`!!document.querySelector('.ring-hover-formula math.ring-math-formula') || !document.getElementById('cg-enter') || document.getElementById('cg-enter').offsetParent === null`)) break;
    }
    await sleep(250);
  };
  P.rect = sel => P.ev(`(function(){var e=document.querySelector(${JSON.stringify(sel)});if(!e)return null;var r=e.getBoundingClientRect();return{x:r.left,y:r.top,w:r.width,h:r.height}})()`);
  P.exists = sel => P.ev(`!!document.querySelector(${JSON.stringify(sel)})`);
  P.q = () => P.ev('location.search');
  P.param = async k => new URLSearchParams(await P.q()).get(k);
  P.text = sel => P.ev(`(function(){var e=document.querySelector(${JSON.stringify(sel)});return e?e.textContent:null})()`);
  P.clickEl = sel => P.ev(`(function(){var e=document.querySelector(${JSON.stringify(sel)});if(!e)return false;e.click();return true})()`);
  P.mouse = async (x, y, button = 'left') => {
    await S('Input.dispatchMouseEvent', { type: 'mouseMoved', x, y });
    await S('Input.dispatchMouseEvent', { type: 'mousePressed', x, y, button, clickCount: 1 });
    await sleep(40);
    await S('Input.dispatchMouseEvent', { type: 'mouseReleased', x, y, button, clickCount: 1 });
    await sleep(500);
  };
  P.key = async (key, code, vk) => {
    await S('Input.dispatchKeyEvent', { type: 'keyDown', key, code: code || key, windowsVirtualKeyCode: vk });
    await S('Input.dispatchKeyEvent', { type: 'keyUp', key, code: code || key, windowsVirtualKeyCode: vk });
    await sleep(500);
  };
  // The formulas of the selected row and of the main view. A formula's
  // plain is its data-plain; its html is the MathML only (a row line's
  // --hang is a measured width, so the line itself is left out).
  P.formulas = () => P.ev(`(function(){
    var g = new URLSearchParams(location.search).get('gen');
    var row = document.querySelector('.subgroup-row[data-gen="' + g + '"]');
    var mk = function(lines){ return Array.prototype.map.call(lines, function(l){
      var pieces = l.querySelectorAll('math.sub-formula-piece');
      var first = l.querySelector('.sub-formula-piece[data-plain]');
      return { plain: first ? first.getAttribute('data-plain') : null, html: Array.prototype.map.call(pieces, function(p){ return p.outerHTML; }).join('') };
    }); };
    var left = row && (row.querySelector('.sub-row-l') || row), right = row && row.querySelector('.sub-row-r');
    return {
      ring: Array.prototype.map.call(document.querySelectorAll('.ring-hover-formula math.ring-math-formula'), function(m){ return { plain: m.getAttribute('data-plain'), html: m.outerHTML }; }),
      row: left ? mk(left.querySelectorAll('.sub-row-formula .sub-formula-line')) : [],
      rowR: right ? mk(right.querySelectorAll('.sub-row-formula .sub-formula-line')) : []
    };
  })()`);
  // Top-level "=" of each main-view formula line.
  P.steps = () => P.ev(`Array.prototype.map.call(document.querySelectorAll('.ring-hover-formula math.ring-math-formula'), function(m){ var r = m.firstElementChild; return Array.prototype.filter.call(r.children, function(k){ return k.localName === 'mo' && k.textContent === '='; }).length; })`);
  P.shot = async (file, clip, scheme = 'light') => {
    await S('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: scheme }] });
    const r = await S('Page.captureScreenshot', { format: 'png', ...(clip ? { clip: { ...clip, scale: 1 } } : {}) });
    writeFileSync(join(HERE, file), Buffer.from(r.data, 'base64'));
  };
  // The default execution context of the first child frame (the isomorphism pane).
  P.paneCtx = async () => {
    const tree = await S('Page.getFrameTree');
    const kids = tree.frameTree.childFrames || [];
    if (!kids.length) return null;
    const id = kids[0].frame.id;
    const c = P.contexts.filter(x => x.auxData && x.auxData.frameId === id && x.auxData.isDefault).pop();
    return c ? c.id : null;
  };
  P.done = async () => { try { await send('Target.closeTarget', { targetId }); await send('Target.disposeBrowserContext', { browserContextId }); } catch (e) {} };
  return P;
}

const noErrors = (P, label) => out(P.errors.length === 0, P.name, 'no-page-exception ' + label, P.errors);

const centre = (P, sel) => P.ev(`(function(){var e=document.querySelector(${JSON.stringify(sel)});if(!e)return null;var r=e.getBoundingClientRect();return{x:r.left+r.width/2,y:r.top+r.height/2}})()`);
const chipSel = (f, kind, v) => `.fsl-pair[data-f="${f}"] .fsl[data-kind="${kind}"] .fsl-notch[data-v="${v}"]`;
const clickAt = async (P, sel, button = 'left') => { const c = await centre(P, sel); if (!c) return false; await P.mouse(c.x, c.y, button); return true; };
const shown = (P, sel) => P.ev(`(function(){var e=document.querySelector(${JSON.stringify(sel)});return !!e && !e.hidden && e.getClientRects().length > 0})()`);
const menuItem = P => P.ev(`(function(){var m=document.getElementById('ring-ctx');var it=m&&!m.hidden&&m.querySelector('.ring-ctx-fmap');return it?it.textContent.trim():null})()`);
const winMap = (P, f) => P.ev(`(function(){var m=document.querySelector('#fmap-win-body .fmap[data-f="${f}"]');if(!m)return null;var k=m.querySelector('.fmap-knob').getBoundingClientRect(),s=m.querySelector('.fmap-stop[data-id="'+m.getAttribute('data-at')+'"]').getBoundingClientRect();return{at:m.getAttribute('data-at'),dx:Math.abs(k.left+k.width/2-s.left-s.width/2),dy:Math.abs(k.top+k.height/2-s.top-s.height/2)}})()`);
const ZB = '?mobile=0&mode=additive&n=12&subformularow=both&subformularing=both&logbase=1&gen=9';

const browser = await connect();
try {
  const P = await openPage(browser, 'desktop', { w: 1280, h: 900, ua: UA_DESKTOP });
  await P.load(`${ZB}&fmaporder=gcd-short`);
  await P.enter();
  // 1. the slider pair
  const lab0 = await P.ev(`(function(){var c=document.querySelector(${JSON.stringify(chipSel('order', 'complexity', 0))});return c?[c.textContent,c.title]:null})()`);
  out(!!lab0 && lab0[0] === 'Short' && lab0[1].startsWith('Short'), 'desktop', 'the first Complexity slot reads Short, its tooltip too', lab0);
  const caps = await P.ev(`Array.prototype.map.call(document.querySelectorAll('.fsl-pair .fsl-name'), function(e){ return e.textContent; })`);
  const pairText = await P.ev(`Array.prototype.map.call(document.querySelectorAll('.fsl-pair'), function(e){ return e.textContent; }).join('|')`);
  out(caps.length === 0 && !/Complexity|Form preference/.test(pairText), 'desktop', 'no Complexity or Form preference caption', { caps });
  const aria = await P.ev(`document.querySelector('.fsl-pair[data-f="order"] .fsl[data-kind="complexity"]').getAttribute('aria-label')`);
  out(/Complexity/.test(aria), 'desktop', 'the Complexity slider keeps its accessible name', aria);
  out(!(await P.exists('.fsl-maptoggle')) && !(await P.exists('.fsl-pair button')), 'desktop', 'no map icon button beside the sliders');
  out(!(await shown(P, '#fmap-win')) && !(await P.exists('.fmap')), 'desktop', 'no map shown by default');
  // 2. the right-click menu opens the window
  await clickAt(P, '.fsl-pair[data-f="order"]', 'right');
  out((await menuItem(P)) === 'Show the formula map', 'desktop', 'right-click on the sliders: the menu offers Show the formula map', await menuItem(P));
  await P.clickEl('#ring-ctx .ring-ctx-fmap');
  await sleep(600);
  const btns = await P.ev(`Array.prototype.map.call(document.querySelectorAll('#fmap-win .lap-key-head button'), function(b){ return b.id + ':' + b.getAttribute('aria-label'); })`);
  out(await shown(P, '#fmap-win'), 'desktop', 'the menu item opens the map window');
  out((await P.text('#fmap-win-title')) === 'Formula map' && JSON.stringify(btns) === JSON.stringify(['fmap-win-min:Minimize', 'fmap-win-close:Close']), 'desktop', 'titled Formula map, with exactly _ and x', btns);
  out((await P.ev(`document.querySelectorAll('#fmap-win-body .fmap').length`)) === 2 && !(await P.exists('.ring-hover-formula .fmap')) && (await P.param('fmapopen')) === '1', 'desktop', 'both maps in the window, none inline, fmapopen=1');
  const inView = await P.ev(`(function(){var r=document.getElementById('fmap-win').getBoundingClientRect();return r.left>=0&&r.top>=0&&r.right<=innerWidth&&r.bottom<=innerHeight})()`);
  out(inView, 'desktop', 'the window lies within the viewport');
  // 3. live: a slider move moves the window's map knob, a map click moves the sliders
  await clickAt(P, chipSel('order', 'complexity', 2));
  await sleep(500);
  let m = await winMap(P, 'order');
  out(!!m && m.at === 'gcd-full' && m.dx < 1 && m.dy < 1, 'desktop', 'Complexity to complete: the window map\'s knob on GCD full', m);
  await clickAt(P, chipSel('order', 'complexity', 0));
  await sleep(500);
  m = await winMap(P, 'order');
  out(!!m && m.at === 'jn' && m.dx < 1 && m.dy < 1, 'desktop', 'Complexity to Short: the knob on JN', m);
  const formRows = await P.ev(`Array.prototype.map.call(document.querySelectorAll('.fsl-pair[data-f="order"] .fsl[data-kind="form"]'), function(s){ var r = s.closest('.fsl-row'); return r.getBoundingClientRect().height === 0 && getComputedStyle(r).display === 'none'; })`);
  out(formRows.length === 1 && formRows[0], 'desktop', 'at Short the order form slider is gone', formRows);
  const otherForm = await P.ev(`(function(){ var r = document.querySelector('.fsl-pair[data-f="index"] .fsl[data-kind="form"]').closest('.fsl-row'); return getComputedStyle(r).display; })()`);
  out(otherForm !== 'none', 'desktop', 'the index form slider (not at Short) still shows', otherForm);
  await clickAt(P, '#fmap-win-body .fmap[data-f="index"] .fmap-stop[data-id="lcm-short"]');
  await sleep(400);
  const tok = await P.ev(`document.querySelector('.fsl-pair[data-f="index"]').getAttribute('data-token')`);
  out(tok === 'lcm-short' && (await P.param('fmapindex')) === 'lcm-short', 'desktop', 'a click on the window map\'s LCM short moves the index sliders there', tok);
  // 4. dragged by its head
  const t0 = await P.ev(`document.getElementById('fmap-win').style.translate || '0px 0px'`);
  const h = await centre(P, '#fmap-win-title');
  await P.S('Input.dispatchMouseEvent', { type: 'mouseMoved', x: h.x, y: h.y });
  await P.S('Input.dispatchMouseEvent', { type: 'mousePressed', x: h.x, y: h.y, button: 'left', clickCount: 1 });
  for (let i = 1; i <= 5; i++) { await P.S('Input.dispatchMouseEvent', { type: 'mouseMoved', x: h.x + i * 12, y: h.y + i * 8, button: 'left', buttons: 1 }); await sleep(30); }
  await P.S('Input.dispatchMouseEvent', { type: 'mouseReleased', x: h.x + 60, y: h.y + 40, button: 'left', clickCount: 1 });
  await sleep(200);
  const t1 = await P.ev(`document.getElementById('fmap-win').style.translate`);
  out(t1 !== t0, 'desktop', 'dragged by its head, the window moves', [t0, t1]);
  // 5. minimize into the bar and back
  await P.clickEl('#fmap-win-min');
  await sleep(300);
  out(!(await shown(P, '#fmap-win')) && (await P.exists('#bar-formulas-l .bar-task.is-fmap')) && (await P.param('fmapmin')) === '1', 'desktop', '_ minimizes it into the bottom bar (fmapmin=1)');
  await clickAt(P, '.fsl-pair[data-f="order"]', 'right');
  out((await menuItem(P)) === 'Show the formula map', 'desktop', 'minimized, the menu offers Show again', await menuItem(P));
  await P.key('Escape');
  await P.clickEl('#bar-formulas-l .bar-task.is-fmap');
  await sleep(400);
  out((await shown(P, '#fmap-win')) && !(await P.exists('.bar-task.is-fmap')) && (await P.param('fmapmin')) === null && (await P.ev(`document.getElementById('fmap-win').style.translate`)) === t1, 'desktop', 'its task restores it where it was');
  await clickAt(P, '.fsl-pair[data-f="index"]', 'right');
  out((await menuItem(P)) === 'Hide the formula map', 'desktop', 'open, the menu offers Hide', await menuItem(P));
  await P.key('Escape');
  // 6. x closes
  await P.clickEl('#fmap-win-close');
  await sleep(300);
  out(!(await shown(P, '#fmap-win')) && !(await P.exists('.bar-task.is-fmap')) && (await P.param('fmapopen')) === null && !(await P.exists('.fmap')), 'desktop', 'x closes it: no window, no task, no fmapopen');
  // 7. reload
  await P.load(`${ZB}&fmapopen=1`);
  await P.enter();
  out((await shown(P, '#fmap-win')) && (await P.ev(`document.querySelectorAll('#fmap-win-body .fmap').length`)) === 2, 'desktop', 'fmapopen=1 reopens the window with both maps');
  await P.load(`${ZB}&fmapopen=1&fmapmin=1`);
  await P.enter();
  out(!(await shown(P, '#fmap-win')) && (await P.exists('#bar-formulas-l .bar-task.is-fmap')), 'desktop', 'fmapopen=1&fmapmin=1 reloads minimized in the bar');
  // 8. a group of units and a curve
  for (const [q, name] of [['?mobile=0&mode=multiplicative&n=13&subformularow=both&subformularing=both&gen=2&fmapopen=1', '(ℤ/13ℤ)*'], ['?mobile=0&curve=11,1,3&subformularow=both&subformularing=both&gen=1&fmapopen=1', 'E(𝔽₁₁)']]) {
    await P.load(q);
    await P.enter();
    const lab = await P.text(chipSel('order', 'complexity', 0));
    out((await shown(P, '#fmap-win')) && (await P.ev(`document.querySelectorAll('#fmap-win-body .fmap').length`)) === 2 && lab === 'Short' && !(await P.exists('.fsl-maptoggle')), 'desktop', `${name}: Short, no icon, the window with both maps`, lab);
  }
  noErrors(P, 'desktop');
  await P.done();

  // 9. a phone: no windows, the menu item shows the maps inline
  const M = await openPage(browser, 'mobile', { w: 390, h: 844, ua: UA_ANDROID, touch: true });
  await M.load('?mobile=1&mode=additive&n=12&gen=9&logbase=1&subformularow=both&subformularing=both');
  await M.enter();
  out((await M.text(chipSel('order', 'complexity', 0))) === 'Short' && !(await M.exists('.fsl-maptoggle')), 'mobile', 'Short, no icon');
  const c = await centre(M, '.fsl-pair[data-f="order"] .fsl-row');
  await M.ev(`document.querySelector('.fsl-pair[data-f="order"]').dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, cancelable: true, clientX: ${c.x}, clientY: ${c.y} }))`);
  await sleep(200);
  out((await menuItem(M)) === 'Show the formula map', 'mobile', 'a long press (contextmenu) offers Show the formula map', await menuItem(M));
  await M.clickEl('#ring-ctx .ring-ctx-fmap');
  await sleep(500);
  out((await M.ev(`document.querySelectorAll('.ring-hover-formula .fmap').length`)) === 2 && !(await shown(M, '#fmap-win')) && (await M.param('fmapopen')) === '1', 'mobile', 'the maps show inline under the sliders, no window');
  noErrors(M, 'mobile');
  await M.done();
} catch (e) {
  fails++;
  console.log('FAIL probe-crashed ' + (e && e.stack || e));
}
browser.close();
console.log(fails === 0 ? 'MAP-WINDOW-CHECK OK' : `MAP-WINDOW-CHECK FAIL: ${fails}`);
const gone = new Promise(res => chrome.once('exit', res));
try { chrome.kill('SIGKILL'); } catch (e) {}
await Promise.race([gone, sleep(3000)]);
for (let i = 0; i < 10; i++) {
  try { rmSync(profile, { recursive: true, force: true }); } catch (e) {}
  await sleep(300);
  if (!existsSync(profile)) break;
}
process.exit(fails === 0 ? 0 : 1);
