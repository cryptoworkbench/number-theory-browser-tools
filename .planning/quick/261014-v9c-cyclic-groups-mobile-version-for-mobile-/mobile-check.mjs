// CDP harness for Cyclic Groups' mobile mode. Built-ins only (global WebSocket
// and fetch); headless Google Chrome on a throwaway profile, killed on exit.
//   node mobile-check.mjs [--shots] [scenario ...]
import { spawn } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, '../../..');
const URL_BASE = pathToFileURL(join(ROOT, 'Cyclic Groups', 'cyclic-groups.html')).href;
const PORT = 9333;
const SHOTS = process.argv.includes('--shots');
const ONLY = process.argv.slice(2).filter(a => !a.startsWith('--'));

const UA = {
  iphone: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1',
  android: 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36',
  tablet: 'Mozilla/5.0 (Linux; Android 14; SM-X710) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
  desktop: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36',
};
const UADATA = { platform: 'Android', platformVersion: '14', architecture: '', model: 'Pixel 8', mobile: true,
  brands: [{ brand: 'Chromium', version: '130' }], fullVersionList: [{ brand: 'Chromium', version: '130.0.0.0' }] };

// kind: 'mobile' (layout + interaction), 'mobile-layout' (layout only), 'desktop'
const SCENARIOS = [
  { name: 'iphone-390', ua: UA.iphone, w: 390, h: 844, kind: 'mobile', interact: true },
  { name: 'iphone-414', ua: UA.iphone, w: 414, h: 896, kind: 'mobile' },
  { name: 'android-360', ua: UA.android, w: 360, h: 800, kind: 'mobile', interact: true },
  { name: 'android-414', ua: UA.android, w: 414, h: 900, kind: 'mobile' },
  { name: 'uadata-390', ua: UA.desktop, uadata: UADATA, w: 390, h: 844, kind: 'mobile' },
  { name: 'desktop-mobile1-390', ua: UA.desktop, q: '?mobile=1', w: 390, h: 844, kind: 'mobile' },
  { name: 'iphone-ar-390', ua: UA.iphone, q: '?lang=ar', w: 390, h: 844, kind: 'mobile', rtl: true },
  { name: 'iphone-landscape-932', ua: UA.iphone, w: 932, h: 430, kind: 'mobile', landscape: true },
  { name: 'desktop-1280', ua: UA.desktop, w: 1280, h: 800, kind: 'desktop', touch: false },
  { name: 'iphone-mobile0', ua: UA.iphone, q: '?mobile=0', w: 390, h: 844, kind: 'desktop' },
  { name: 'android-tablet', ua: UA.tablet, w: 800, h: 1280, kind: 'desktop' },
];

const sleep = ms => new Promise(r => setTimeout(r, ms));
let fails = 0;
const out = (ok, scen, check, detail) => {
  if (!ok) fails++;
  console.log(`${ok ? 'PASS' : 'FAIL'} ${scen} ${check}${!ok && detail !== undefined ? ' ' + JSON.stringify(detail) : ''}`);
};

/* ---------- Chrome + CDP ---------- */
const profile = mkdtempSync(join(tmpdir(), 'cg-mobile-'));
const chrome = spawn('google-chrome', ['--headless=new', `--remote-debugging-port=${PORT}`, `--user-data-dir=${profile}`,
  '--no-first-run', '--no-default-browser-check', '--disable-gpu', 'about:blank'], { stdio: 'ignore' });
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

/* ---------- one scenario ---------- */
async function runScenario(browser, sc) {
  const { send, on } = browser;
  const { browserContextId } = await send('Target.createBrowserContext');
  const { targetId } = await send('Target.createTarget', { url: 'about:blank', browserContextId });
  const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true });
  const S = (m, p) => send(m, p, sessionId);
  const ev = async expr => {
    const r = await S('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true });
    if (r.exceptionDetails) throw new Error('eval: ' + (r.exceptionDetails.exception?.description || r.exceptionDetails.text) + ' in ' + expr.slice(0, 80));
    return r.result.value;
  };
  const touch = sc.touch !== false && sc.kind !== 'desktop' ? true : false;
  await S('Page.enable');
  await S('Emulation.setDeviceMetricsOverride', { width: sc.w, height: sc.h, deviceScaleFactor: 1, mobile: touch });
  await S('Emulation.setUserAgentOverride', sc.uadata ? { userAgent: sc.ua, userAgentMetadata: sc.uadata } : { userAgent: sc.ua });
  if (touch) await S('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
  const loaded = new Promise(res => on(m => { if (m.sessionId === sessionId && m.method === 'Page.loadEventFired') res(); }));
  await S('Page.navigate', { url: URL_BASE + (sc.q || '') });
  await loaded;
  await sleep(1800);

  const rect = sel => ev(`(function(){var e=document.querySelector(${JSON.stringify(sel)});if(!e)return null;var r=e.getBoundingClientRect();var cs=getComputedStyle(e);return{x:r.left,y:r.top,w:r.width,h:r.height,display:cs.display,vis:cs.visibility,fs:parseFloat(cs.fontSize),ta:cs.touchAction}})()`);
  const rendered = r => r && r.display !== 'none' && r.w > 0 && r.h > 0;

  /* ----- desktop scenarios ----- */
  if (sc.kind === 'desktop') {
    const d = await ev(`(function(){var c=document.documentElement.classList;var i=document.getElementById('cg-intro');var ra=document.getElementById('arrow-options');return{m:c.contains('is-mobile'),d:c.contains('is-desktop'),intro:i?getComputedStyle(i).display:null,ta:getComputedStyle(document.getElementById('ring-svg')).touchAction,arrows:!!(ra&&ra.parentElement&&ra.parentElement.id==='ring-ctx-arrows')}})()`);
    out(d.d && !d.m, sc.name, 'root-class-desktop', d);
    out(d.intro && d.intro !== 'none', sc.name, 'intro-displayed', d);
    out(d.ta === 'none', sc.name, 'ring-touch-action-none', d);
    out(d.arrows, sc.name, 'arrow-options-in-ring-ctx', d);
    if (SHOTS) await shots(S, sc);
    return finish(S, send, browserContextId, targetId);
  }

  /* ----- mobile layout gates ----- */
  const c = await ev(`(function(){var c=document.documentElement.classList;var i=document.getElementById('cg-intro');var ra=document.getElementById('arrow-options');var lp=document.getElementById('layers-panel');return{m:c.contains('is-mobile'),d:c.contains('is-desktop'),e:c.contains('is-entered'),intro:i?getComputedStyle(i).display:'none',arrows:!!(ra&&lp&&lp.contains(ra)),sw:document.documentElement.scrollWidth,iw:innerWidth,ih:innerHeight,dir:document.documentElement.getAttribute('dir')}})()`);
  out(c.m && !c.d && !c.e, sc.name, 'root-class-mobile', c);
  out(c.intro === 'none', sc.name, 'no-intro', c);
  for (const sel of ['.site-header', '.page-header', '#group-panel', '#layers-panel', '#subgroup-panel', '#subgroups-list-panel']) {
    out(rendered(await rect(sel)), sc.name, 'rendered ' + sel, await rect(sel));
  }
  out(c.sw <= c.iw, sc.name, 'no-horizontal-scroll', c);
  if (sc.rtl) out(c.dir === 'rtl', sc.name, 'dir-rtl', c);
  const parts = [];
  for (const sel of ['.auto-rotate', '#formula-toggles', '#ring-head']) { const r = await rect(sel); if (rendered(r)) parts.push([sel, r]); }
  let overlap = null;
  for (let i = 0; i < parts.length; i++) for (let j = i + 1; j < parts.length; j++) {
    const a = parts[i][1], b = parts[j][1];
    if (a.x < b.x + b.w - 0.5 && b.x < a.x + a.w - 0.5 && a.y < b.y + b.h - 0.5 && b.y < a.y + a.h - 0.5) overlap = [parts[i][0], parts[j][0]];
  }
  out(!overlap, sc.name, 'no-overlap auto-rotate/toggles/ring-head', overlap);
  const ring = await rect('#ring-svg');
  if (sc.landscape) out(ring.h <= c.ih + 0.5, sc.name, 'ring-fits-viewport-height', { ring, ih: c.ih });
  else out(ring.w >= 0.88 * c.iw, sc.name, 'ring-width>=88%', { w: ring.w, iw: c.iw });
  for (const sel of ['#rot-back', '#rot-fwd', '#n-input', '#op-select', '#identity-select', '#gen-select', '#colorby-select', '#arrange-select']) {
    const r = await rect(sel);
    if (!rendered(r)) { console.log(`SKIP ${sc.name} tap-size ${sel} (not rendered)`); continue; }
    const need = sel.startsWith('#rot-') ? [40, 40] : [0, 40];
    out(r.h >= need[1] - 0.5 && r.w >= need[0] - 0.5, sc.name, 'tap-size ' + sel, r);
  }
  const rows = await ev(`Array.prototype.map.call(document.querySelectorAll('#formula-toggles .check'),function(e){var r=e.getBoundingClientRect();return{id:e.querySelector('input').id,h:r.height,w:r.width}}).filter(function(r){return r.h>0&&r.w>0})`);
  out(rows.length > 0 && rows.every(r => r.h >= 39.5), sc.name, 'tap-size formula switch rows', rows);
  for (const sel of ['#n-input', '#gen-select']) { const r = await rect(sel); out(!rendered(r) || r.fs >= 16, sc.name, 'font>=16 ' + sel, r.fs); }
  out(/pan-y/.test((await rect('#ring-svg')).ta), sc.name, 'ring-touch-action-pan-y', (await rect('#ring-svg')).ta);
  out(c.arrows, sc.name, 'arrow-options-in-layers-panel', c);

  if (SHOTS) {
    await shots(S, sc);
    // the Layers panel with its extra options (and the arrow options) open
    await ev(`document.querySelector('#layers-panel .extra-options').open=true;0`); await sleep(300);
    const lp = await rect('#layers-panel');
    await ev('scrollTo(0,0);0');
    const r = await S('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true, clip: { x: 0, y: lp.y, width: sc.w, height: lp.h, scale: 1 } });
    writeFileSync(join(HERE, `shot-${sc.name}-layers-open.png`), Buffer.from(r.data, 'base64'));
    await ev(`document.querySelector('#layers-panel .extra-options').open=false;0`);
  }

  /* ----- interaction gates ----- */
  if (sc.interact) {
    const dispatch = (type, pts) => S('Input.dispatchTouchEvent', { type, touchPoints: pts });
    const tap = async (x, y) => { await dispatch('touchStart', [{ x, y }]); await sleep(40); await dispatch('touchEnd', []); await sleep(120); };
    const drag = async (x1, y1, x2, y2, n = 10) => {
      await dispatch('touchStart', [{ x: x1, y: y1 }]);
      for (let i = 1; i <= n; i++) { await sleep(16); await dispatch('touchMove', [{ x: x1 + (x2 - x1) * i / n, y: y1 + (y2 - y1) * i / n }]); }
      await dispatch('touchEnd', []); await sleep(150);
    };
    const scrollToEl = sel => ev(`document.querySelector(${JSON.stringify(sel)}).scrollIntoView({block:'center'});0`);
    const state = () => ev(`(function(){return{rot:document.getElementById('rot-value').value,beads:document.querySelectorAll('#ring-svg .bead').length,combine:!!document.querySelector('#ring-dynamic .ring-combine'),box:!!document.querySelector('#ring-dynamic .ring-combine-box'),sy:scrollY,lang:document.documentElement.lang,mob:document.documentElement.classList.contains('is-mobile'),theme:document.documentElement.getAttribute('data-theme'),ctxHidden:document.getElementById('ring-ctx').hidden,gen:document.getElementById('gen-select').value}})()`);
    const beadPt = async el => ev(`(function(){var b=document.querySelector('#ring-svg .bead[data-el="${el}"]');var r=b.getBoundingClientRect();var all=document.querySelectorAll('#ring-svg .bead');var cx=0,cy=0;all.forEach(function(e){var q=e.getBoundingClientRect();cx+=q.left+q.width/2;cy+=q.top+q.height/2});cx/=all.length;cy/=all.length;return{x:r.left+r.width/2,y:r.top+r.height/2,r:r.width/2,cx:cx,cy:cy}})()`);
    const settle = () => sleep(900);

    await scrollToEl('#ring-svg');
    let b1 = await beadPt(1); await tap(b1.x, b1.y);
    out((await state()).combine, sc.name, 'tap-bead-picks-a', await state());
    let b2 = await beadPt(2); await tap(b2.x, b2.y);
    out((await state()).box, sc.name, 'tap-second-bead-picks-b', await state());
    // the combine box sits over the ring's centre, so tap between two beads instead
    await tap((b1.x + b2.x) / 2, (b1.y + b2.y) / 2);
    let st = await state(); out(!st.combine && !st.box, sc.name, 'tap-centre-clears', st);
    let b3 = await beadPt(3);
    const ux = (b3.x - b3.cx), uy = (b3.y - b3.cy), ul = Math.hypot(ux, uy);
    await tap(b3.x + ux / ul * (b3.r + 8), b3.y + uy / ul * (b3.r + 8));
    st = await state(); out(st.combine, sc.name, 'tap-near-bead-tolerance', st);
    await tap((b1.x + b2.x) / 2, (b1.y + b2.y) / 2);

    const mod = (a, b) => ((a % b) + b) % b;
    const before = await state(); const m = before.beads;
    const fwd = await rect('#rot-fwd'); await tap(fwd.x + fwd.w / 2, fwd.y + fwd.h / 2); await settle();
    let after = await state();
    const dlt = mod(+after.rot - +before.rot, m);
    out(dlt === 1 || dlt === m - 1, sc.name, 'rot-fwd-turns-one-bead', { before: before.rot, after: after.rot });

    await scrollToEl('#ring-svg');
    const rp = await beadPt(1); const rr = await rect('#ring-svg');
    const topY = rp.cy - (rr.w * 0.18);
    const rot0 = (await state()).rot;
    await drag(rp.cx - 60, topY, rp.cx + 60, topY); await settle();
    after = await state();
    out(after.rot !== rot0, sc.name, 'horizontal-drag-rotates', { rot0, after: after.rot });

    // scroll: a control swipe on the page header, then one starting on the ring
    await ev('scrollTo(0,0);0'); await sleep(200);
    // A swipe is a hand-made touch drag (CDP's synthesizeScrollGesture bypasses
    // the browser's touch-action handling, so it is not a faithful stand-in).
    const swipe = async (x, y, dy) => { await drag(x, y, x, y + dy, 20); await sleep(300); };
    const ph = await rect('.page-header');
    await swipe(Math.round(ph.x + 60), Math.round(ph.y + ph.h / 2), -150);
    if ((await state()).sy > 20) {
      await scrollToEl('#ring-svg'); await sleep(200);
      const s0 = await state(); const rp2 = await beadPt(1);
      await swipe(Math.round(rp2.cx), Math.round(rp2.cy + 60), -200);
      const s1 = await state();
      out(s1.sy > s0.sy + 20 && s1.rot === s0.rot && !s1.combine, sc.name, 'vertical-swipe-on-ring-scrolls-page', { s0, s1 });
    } else console.log(`SKIP ${sc.name} gesture-scroll (headless cannot synthesize scrolling)`, JSON.stringify(await state()), JSON.stringify(ph));

    // subgroup row tap
    await ev(`document.querySelector('#subgroups-list-panel .subgroup-row:not(.is-current)').scrollIntoView({block:'center'});0`); await sleep(200);
    const g0 = (await state()).gen;
    const rowR = await ev(`(function(){var e=document.querySelector('#subgroups-list-panel .subgroup-row:not(.is-current)');var r=e.getBoundingClientRect();e.setAttribute('data-probe','1');return{x:r.left+r.width/2,y:r.top+r.height/2}})()`);
    await tap(rowR.x, rowR.y); await sleep(300);
    const rowNow = await ev(`document.querySelector('[data-probe="1"]')&&document.querySelector('[data-probe="1"]').classList.contains('is-current')`);
    out(rowNow === true && (await state()).gen !== g0, sc.name, 'tap-subgroup-row-selects', { rowNow, g0, g1: (await state()).gen });

    // field changes
    const setVal = (sel, v) => ev(`(function(){var e=document.querySelector(${JSON.stringify(sel)});e.value=${JSON.stringify(v)};e.dispatchEvent(new Event('input',{bubbles:true}));e.dispatchEvent(new Event('change',{bubbles:true}));return e.value})()`);
    await setVal('#n-input', '7'); await sleep(600);
    out((await state()).beads === 7, sc.name, 'modulus-7-gives-7-beads', await state());
    const mulVal = await ev(`(function(){var o=Array.prototype.find.call(document.querySelectorAll('#op-select option'),function(o){return o.value!==document.getElementById('op-select').value});return o?o.value:null})()`);
    await setVal('#op-select', mulVal); await sleep(600);
    out((await state()).beads === 6, sc.name, 'multiplicative-7-gives-6-beads', await state());
    await ev(`document.getElementById('ring-svg').dispatchEvent(new MouseEvent('contextmenu',{bubbles:true,cancelable:true,clientX:200,clientY:300}));0`); await sleep(150);
    out((await state()).ctxHidden === true, sc.name, 'contextmenu-opens-nothing', await state());
    await setVal('#lang-switch-select', 'de'); await sleep(700);
    st = await state(); out(st.lang === 'de' && st.mob && st.beads === 6, sc.name, 'language-change-keeps-state', st);
    const th0 = (await state()).theme;
    await ev(`document.getElementById('theme-switch-input').click();0`); await sleep(300);
    out((await state()).theme !== th0, sc.name, 'theme-toggle-flips', { th0, th1: (await state()).theme });
    const fin = await ev('({sw:document.documentElement.scrollWidth,iw:innerWidth})');
    out(fin.sw <= fin.iw, sc.name, 'no-horizontal-scroll-after-interaction', fin);
  }
  return finish(S, send, browserContextId, targetId);
}

async function finish(S, send, browserContextId, targetId) {
  try { await send('Target.closeTarget', { targetId }); await send('Target.disposeBrowserContext', { browserContextId }); } catch (e) {}
}

async function shots(S, sc) {
  const lm = await S('Page.getLayoutMetrics');
  const H = Math.ceil(lm.cssContentSize ? lm.cssContentSize.height : lm.contentSize.height);
  const W = sc.w;
  for (let y = 0, k = 1; y < H; y += 1000, k++) {
    const r = await S('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true, clip: { x: 0, y, width: W, height: Math.min(1000, H - y), scale: 1 } });
    writeFileSync(join(HERE, `shot-${sc.name}-${k}.png`), Buffer.from(r.data, 'base64'));
  }
}

try {
  const browser = await connect();
  for (const sc of SCENARIOS) {
    if (ONLY.length && !ONLY.includes(sc.name)) continue;
    try { await runScenario(browser, sc); } catch (e) { out(false, sc.name, 'scenario-error', String(e.message || e)); }
  }
  browser.close();
} finally { cleanup(); }
console.log(fails ? `FAILED: ${fails} check(s)` : 'ALL PASS');
process.exit(fails ? 1 : 0);
