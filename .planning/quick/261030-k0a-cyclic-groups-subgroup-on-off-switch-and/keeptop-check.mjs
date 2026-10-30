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

/* ---------- keep G on top, G picked by bead clicks ---------- */
async function keeptop(browser, how) {
  const P = await openPage(browser, 'keeptop-' + how, how === 'touch' ? { w: 412, h: 915, ua: UA_ANDROID, touch: true } : { w: 1280, h: 800, ua: UA_DESKTOP });
  await P.load('?' + (how === 'touch' ? 'mobile=1' : 'mobile=0') + '&mode=additive&n=12&gen=1&top=gen');
  if (how !== 'touch') await P.enter();
  const N = P.name;
  const topBead = () => P.ev(`(function(){var best=null,by=1e9;document.querySelectorAll('#ring-svg .bead[data-el]').forEach(function(b){var r=b.getBoundingClientRect();if(r.top+r.height/2<by){by=r.top+r.height/2;best=+b.getAttribute('data-el')}});return best})()`);
  out((await P.param('top')) === 'gen', N, 'loaded-top-gen', await P.q());
  await P.clickEl('#gen-beads');
  await sleep(300);
  for (const el of [4, 7, 10]) {
    await P.tapBead(el, how);
    await sleep(1800);
    out((await P.gen()) === el, N, 'tap-' + el + '-sets-gen', await P.q());
    out((await P.param('top')) === 'gen', N, 'tap-' + el + '-keeps-top-gen', await P.q());
    out((await topBead()) === el, N, 'tap-' + el + '-bead-on-top', await topBead());
  }
  noErrors(P, 'keeptop');
  await P.done();
}
const browser = await connect();
try {

  await keeptop(browser, 'mouse');
  await keeptop(browser, 'touch');
} catch (e) {
  fails++;
  console.log('FAIL probe-crashed ' + (e && e.stack || e));
}
browser.close();
console.log(fails ? `FOLLOW-CHECK FAIL: ${fails}` : 'FOLLOW-CHECK OK');
process.exit(fails ? 1 : 0);
