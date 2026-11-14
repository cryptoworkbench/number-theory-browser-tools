// CDP harness for the Equivalence Wheel's Extended Euclid overlay. Built-ins only
// (global WebSocket and fetch); headless google-chrome on a throwaway profile,
// killed on exit.
//   node euclid-check.mjs [--shots] [--day] [scenario ...]
// --shots writes PNG screenshots of named beats to $EUCLID_SHOTS (default
// os.tmpdir(); never the repo) and prints their paths; --day loads the pages with ?theme=day.
import { spawn } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, '../../..');
const URL_BASE = pathToFileURL(join(ROOT, 'Equivalence Wheel', 'equivalence-wheel.html')).href;
const PORT = 9343;
const SHOTS = process.argv.includes('--shots');
const DAY = process.argv.includes('--day');
const ONLY = process.argv.slice(2).filter(a => !a.startsWith('--'));

const LANGS = ['nl', 'en', 'de', 'fr', 'es', 'it', 'pl', 'pt-BR', 'pt-PT', 'sv', 'nb', 'ro', 'hu', 'lv', 'ru', 'el', 'he', 'hi', 'ar', 'sq', 'sw', 'zh', 'ja', 'ko', 'id', 'zgh-Latn', 'zgh-Tfng', 'ku', 'ckb', 'sa', 'la'];

const sleep = ms => new Promise(r => setTimeout(r, ms));
let fails = 0;
const out = (ok, scen, check, detail) => {
  if (!ok) fails++;
  console.log(`${ok ? 'PASS' : 'FAIL'} ${scen} ${check}${!ok && detail !== undefined ? ' ' + JSON.stringify(detail) : ''}`);
};

/* ---------- Chrome + CDP ---------- */
const profile = mkdtempSync(join(tmpdir(), 'euclid-check-'));
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

/* ---------- one page session ---------- */
async function openPage(browser, scen, opts = {}) {
  const { send, on } = browser;
  const { browserContextId } = await send('Target.createBrowserContext');
  const { targetId } = await send('Target.createTarget', { url: 'about:blank', browserContextId });
  const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true });
  const S = (m, p) => send(m, p, sessionId);
  const t = { S, scen, exceptions: [] };
  on(m => {
    if (m.sessionId === sessionId && m.method === 'Runtime.exceptionThrown') {
      t.exceptions.push(m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text);
    }
  });
  await S('Page.enable');
  await S('Runtime.enable');
  await S('Emulation.setDeviceMetricsOverride', { width: opts.w || 1280, height: opts.h || 1000, deviceScaleFactor: 1, mobile: false });
  t.ev = async expr => {
    const r = await S('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true });
    if (r.exceptionDetails) throw new Error('eval: ' + (r.exceptionDetails.exception?.description || r.exceptionDetails.text) + ' in ' + expr.slice(0, 120));
    return r.result.value;
  };
  t.load = async (query = '') => {
    const q = [query.replace(/^\?/, ''), DAY ? 'theme=day' : 'theme=night'].filter(Boolean).join('&');
    const loaded = new Promise(res => on(m => { if (m.sessionId === sessionId && m.method === 'Page.loadEventFired') res(); }));
    await S('Page.navigate', { url: URL_BASE + (q ? '?' + q : '') });
    await loaded;
    await sleep(500);
  };
  t.check = (ok, name, detail) => out(ok, scen, name, detail);
  t.rangeSet = (id, v) => t.ev(`(function(){var e=document.getElementById(${JSON.stringify(id)});e.value=${JSON.stringify(String(v))};e.dispatchEvent(new Event('input',{bubbles:true}));return e.value})()`);
  t.setN = n => t.rangeSet('n-range', n);
  t.setDepth = d => t.rangeSet('depth-range', d);
  t.setA = a => t.ev(`(function(){var e=document.getElementById('euclid-a');e.value=${JSON.stringify(String(a))};return e.value})()`);
  t.click = id => t.ev(`document.getElementById(${JSON.stringify(id)}).click();0`);
  t.text = sel => t.ev(`(function(){var e=document.querySelector(${JSON.stringify(sel)});return e?e.textContent:null})()`);
  t.count = sel => t.ev(`document.querySelectorAll(${JSON.stringify(sel)}).length`);
  t.texts = sel => t.ev(`Array.prototype.map.call(document.querySelectorAll(${JSON.stringify(sel)}),function(e){return e.textContent})`);
  t.beat = async () => Number(await t.ev(`document.getElementById('euclid-board').getAttribute('data-beat')`));
  t.setSpeed = v => t.rangeSet('euclid-speed', v);
  // Run and pause in the same task, so no timer has fired yet: paused at beat 0.
  t.runPaused = async (N, a, depth) => {
    if (depth) await t.setDepth(depth);
    await t.setN(N);
    await t.setA(a);
    await t.ev(`document.getElementById('euclid-run').click();document.getElementById('euclid-play').click();0`);
  };
  t.stepTo = async target => {
    let guard = 0;
    while ((await t.beat()) < target && guard++ < 60) {
      const before = await t.beat();
      await t.click('euclid-step');
      const d = Date.now();
      while ((await t.beat()) === before && Date.now() - d < 8000) await sleep(20);
    }
    return t.beat();
  };
  t.instant = () => t.click('euclid-finish');
  t.shot = async name => {
    if (!SHOTS) return;
    const r = await t.ev(`(function(){var a=document.querySelector('#wheel-panel .diagram-wrap').getBoundingClientRect();return{x:a.left+scrollX,y:a.top+scrollY,w:a.width,h:a.height}})()`);
    const { data } = await S('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true, clip: { x: Math.max(0, r.x - 30), y: Math.max(0, r.y - 10), width: r.w + 60, height: r.h + 20, scale: 1 } });
    const file = join(process.env.EUCLID_SHOTS || tmpdir(), `euclid-${scen}-${name}-${DAY ? 'day' : 'night'}.png`);
    writeFileSync(file, Buffer.from(data, 'base64'));
    console.log('SHOT ' + file);
  };
  t.shotSel = async (name, sel) => {
    if (!SHOTS) return;
    const r = await t.ev(`(function(){var a=document.querySelector(${JSON.stringify(sel)}).getBoundingClientRect();return{x:a.left+scrollX,y:a.top+scrollY,w:a.width,h:a.height}})()`);
    const { data } = await S('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true, clip: { x: Math.max(0, r.x - 10), y: Math.max(0, r.y - 10), width: r.w + 20, height: r.h + 20, scale: 1 } });
    const file = join(process.env.EUCLID_SHOTS || tmpdir(), `euclid-${scen}-${name}-${DAY ? 'day' : 'night'}.png`);
    writeFileSync(file, Buffer.from(data, 'base64'));
    console.log('SHOT ' + file);
  };
  t.close = async () => {
    t.check(t.exceptions.length === 0, 'no page exceptions', t.exceptions);
    try { await send('Target.disposeBrowserContext', { browserContextId }); } catch (e) {}
  };
  return t;
}

/* ---------- scenarios ---------- */
const overlayEmpty = t => t.ev(`document.getElementById('euclid-overlay').querySelectorAll('*').length===0`);
const exitedClean = async (t, name) => {
  const s = await t.ev(`(function(){var b=document.getElementById('euclid-board');var c=document.getElementById('wheel-caption');return{cls:document.getElementById('wheel').classList.contains('is-euclid'),boardHidden:b.hidden,capHidden:c.hidden,capDisplay:getComputedStyle(c).display,boardDisplay:getComputedStyle(b).display}})()`);
  t.check(await overlayEmpty(t), name + ': overlay empty');
  t.check(!s.cls, name + ': dim class gone', s);
  t.check(s.boardHidden && s.boardDisplay === 'none', name + ': board hidden', s);
  t.check(!s.capHidden && s.capDisplay !== 'none', name + ': caption back', s);
};

const SC = {};

SC.basic = async b => {
  const t = await openPage(b, 'basic');
  await t.load('?lang=en');
  await t.setN(26); await t.setA(7);
  await t.click('euclid-run');
  await t.instant();
  t.check(await t.ev(`document.getElementById('wheel').classList.contains('is-euclid')`), 'is-euclid class');
  t.check(await t.count('#euclid-rows tr') === 6, '6 rows', await t.count('#euclid-rows tr'));
  const cong = await t.texts('#euclid-rows td.euclid-cong');
  for (const c of ['5 ≡ −3 · 7 (mod 26)', '2 ≡ 4 · 7 (mod 26)', '1 ≡ −11 · 7 (mod 26)', '0 ≡ 26 · 7 (mod 26)']) {
    t.check(cong.includes(c), 'congruence ' + c, cong);
  }
  const rows = await t.ev(`Array.prototype.map.call(document.querySelectorAll('#euclid-rows tr'),function(tr){return Array.prototype.map.call(tr.children,function(td){return td.textContent}).slice(1,4).join('|')})`);
  t.check(JSON.stringify(rows) === JSON.stringify(['26||0', '7|3|1', '5|1|−3', '2|2|4', '1|2|−11', '0||26']), 'row r|q|t', rows);
  t.check((await t.text('#euclid-result')).includes('7⁻¹ ≡ 15 (mod 26)'), 'footer inverse', await t.text('#euclid-result'));
  const lab = await t.texts('.euclid-inverse-label');
  t.check(lab.length === 1 && lab[0] === '7⁻¹ ≡ 15 (mod 26)', 'one inverse label', lab);
  const nar = await t.text('#euclid-narration');
  t.check(nar.length > 20 && !nar.includes('{'), 'narration', nar);
  await t.shot('finale');
  await t.ev(`document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true}));0`);
  await exitedClean(t, 'escape');
  await t.close();
};

SC.cancel = async b => {
  const t = await openPage(b, 'cancel');
  await t.load('?lang=en');
  const start = async () => { await t.setN(26); await t.setA(7); await t.click('euclid-run'); await t.instant(); };
  await start(); await t.setN(24); await exitedClean(t, 'N change');
  await start(); await t.setDepth(5); await exitedClean(t, 'depth change');
  await start(); await t.click('tab-multiplicative'); await exitedClean(t, 'tab change');
  await t.click('tab-additive');
  await start(); await t.click('randomize-btn'); await exitedClean(t, 'randomize');
  await start(); await t.click('euclid-exit'); await exitedClean(t, 'exit button');
  await t.close();
};

SC.export = async b => {
  const t = await openPage(b, 'export');
  await t.load('?lang=en');
  await t.runPaused(26, 7);
  await t.stepTo(3);
  await t.ev(`window.__blobs=[];var oc=URL.createObjectURL;URL.createObjectURL=function(bl){window.__blobs.push(bl);return oc.call(URL,bl)};HTMLAnchorElement.prototype.click=function(){};0`);
  await t.click('export-svg');
  const txt = await t.ev(`window.__blobs[0].text()`);
  t.check(typeof txt === 'string' && txt.length > 1000, 'svg blob captured', txt && txt.length);
  t.check(!/euclid/i.test(txt), 'blob has no euclid', (txt.match(/.{0,40}euclid.{0,40}/i) || [])[0]);
  const m = /<g[^>]*id="wheel-dynamic"[^>]*>/.exec(txt);
  const op = m && /\sopacity="([^"]*)"/.exec(m[0]);
  t.check(!!m && (!op || Number(op[1]) >= 1), 'wheel-dynamic not dimmed', m && m[0]);
  await t.close();
};

SC.mult = async b => {
  const t = await openPage(b, 'mult');
  await t.load('?lang=en');
  await t.setN(26);
  await t.click('tab-multiplicative');
  await t.setA(7);
  await t.click('euclid-run');
  const s = await t.ev(`(function(){var n=document.getElementById('euclid-note');return{active:document.getElementById('tab-additive').classList.contains('is-active'),hidden:n.hidden,display:getComputedStyle(n).display,text:n.textContent}})()`);
  t.check(s.active, 'additive tab active', s);
  t.check(!s.hidden && s.display !== 'none' && s.text.length > 10 && !s.text.includes('{'), 'note visible', s);
  await t.close();
};

SC.step = async b => {
  const t = await openPage(b, 'step');
  await t.load('?lang=en');
  await t.runPaused(26, 7);
  let prev = await t.text('#euclid-narration');
  let ok = (await t.beat()) === 0;
  const seen = [prev];
  const reasons = [];
  for (let i = 1; i <= 11; i++) {
    await t.click('euclid-step');
    const d = Date.now();
    while ((await t.beat()) !== i && Date.now() - d < 8000) await sleep(20);
    const bt = await t.beat();
    const nar = await t.text('#euclid-narration');
    if (bt !== i) { ok = false; reasons.push('beat ' + i + ' got ' + bt); }
    if (nar === prev) { ok = false; reasons.push('narration repeated at ' + i); }
    prev = nar; seen.push(nar);
  }
  t.check(ok, '12 beats, increments by one, narration changes', reasons);
  t.check(await t.ev(`document.getElementById('euclid-step').disabled`), 'step disabled at end');
  t.check(await t.ev(`document.getElementById('euclid-play').disabled && document.getElementById('euclid-finish').disabled`), 'play and instant disabled at end');
  t.check(seen.every(n => !n.includes('{')), 'no placeholders left', seen.filter(n => n.includes('{')));
  await t.close();
};

SC.lang = async b => {
  const t = await openPage(b, 'lang');
  await t.load('?lang=en');
  await t.runPaused(26, 7);
  await t.stepTo(5);
  const rowsBefore = await t.count('#euclid-rows tr');
  const enNar = await t.text('#euclid-narration');
  await t.ev(`(function(){var s=document.getElementById('lang-switch-select');s.value='de';s.dispatchEvent(new Event('change',{bubbles:true}))})()`);
  await sleep(300);
  t.check((await t.beat()) === 5, 'beat stays 5', await t.beat());
  t.check(await t.count('#euclid-rows tr') === rowsBefore, 'row count unchanged', [rowsBefore, await t.count('#euclid-rows tr')]);
  t.check(!(await overlayEmpty(t)), 'overlay non-empty');
  const deNar = await t.text('#euclid-narration');
  t.check(deNar.length > 20 && !deNar.includes('{'), 'narration redrawn in de', deNar);
  await t.close();
};

// Screenshot tour (only runs when named or with --shots).
SC.shots = async b => {
  const t = await openPage(b, 'shots', { h: 1100 });
  await t.load('?lang=en');
  await t.shotSel('controls-idle', '.controls');
  await t.runPaused(26, 7);
  await t.shotSel('controls-running', '.controls');
  for (const bt of [0, 1, 2, 3, 4, 5, 6, 8, 9, 10, 11]) { await t.stepTo(bt); await t.shot('n26-b' + bt); }
  await t.runPaused(60, 7, 10);
  for (const bt of [1, 2, 8, 9]) { await t.stepTo(bt); await t.shot('n60-b' + bt); }
  await t.instant(); await t.shot('n60-finale');
  await t.runPaused(12, 8);
  await t.instant(); await t.shot('n12-noinv');
  await t.runPaused(26, 7, 2);
  await t.stepTo(5); await t.shot('d2-b5');
  await t.instant(); await t.shot('d2-finale');
  await t.close();
};

/* ---------- main ---------- */
const only = ONLY.length ? ONLY : Object.keys(SC).filter(n => n !== 'shots' || SHOTS);
const browser = await connect();
for (const name of only) {
  if (!SC[name]) { out(false, name, 'unknown scenario'); continue; }
  try { await SC[name](browser); } catch (e) { out(false, name, 'scenario threw', String(e.message || e).slice(0, 300)); }
}
browser.close();
console.log(fails ? `${fails} FAILED` : 'ALL PASSED');
process.exit(fails ? 1 : 0);
