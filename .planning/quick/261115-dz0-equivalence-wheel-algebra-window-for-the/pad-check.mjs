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
  t.S = S;
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
    const { data } = await S('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true, clip: { x: Math.max(0, r.x - 30), y: Math.max(0, r.y - 50), width: r.w + 60, height: r.h + 60, scale: 1 } });
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

const padTexts = t => t.texts('#euclid-pad-lines .euclid-pad-line');

SC.pad26 = async b => {
  const t = await openPage(b, 'pad26');
  await t.load('?lang=en');
  t.check(await t.ev(`document.getElementById('euclid-pad').hidden`), 'pad hidden before a run');
  await t.runPaused(26, 7);
  t.check(!(await t.ev(`document.getElementById('euclid-pad').hidden`)), 'pad shown on Run');
  let L = await padTexts(t);
  t.check(L.some(s => s.includes('r₀ = 26 = 26')) && L.some(s => s.includes('r₁ = 7 = 7')), 'setup rows', L);
  t.check(!L.some(s => s.includes('26 = 3 · 7 + 5')), 'division not yet shown at beat 0');
  await t.stepTo(1);
  L = await padTexts(t);
  t.check(L.some(s => s.includes('26 = 3 · 7 + 5')) && L.some(s => s.includes('r₂ = 5 = 26 − 3 · 7')), 'step 1 division', L.slice(-3));
  await t.shotSel('beat1', '#euclid-pad');
  await t.stepTo(3);
  L = await padTexts(t);
  t.check(L.some(s => s.includes('t₀ − q₁ · t₁ = 0 − 3 · 1 = −3')), 't recurrence', L);
  t.check(L.some(s => s.includes('5 = 26 − 3 · 7')), 'r = s·N + t·a', L);
  t.check(L.some(s => s.includes('−3 · 7 = −21 = 5 − 1 · 26')), 'reduce line', L);
  t.check(L.some(s => s.includes('5 ≡ −3 · 7 (mod 26)')), 'congruence', L);
  const nowBeats = await t.ev(`Array.prototype.map.call(document.querySelectorAll('#euclid-pad-lines .is-now'),function(e){return e.getAttribute('data-beat')})`);
  t.check(nowBeats.length > 0 && nowBeats.every(x => x === '3'), 'only beat 3 lines highlighted', nowBeats);
  await t.instant();
  L = await padTexts(t);
  t.check(L.some(s => s.includes('gcd(26, 7) = 1 = 3 · 26 − 11 · 7')), 'Bézout', L.slice(-12));
  t.check(L.some(s => s.includes('7⁻¹ ≡ −11 ≡ 15 (mod 26)')), 'inverse', L.slice(-12));
  t.check(L.some(s => s.includes('7 · 15 = 105 = 4 · 26 + 1')), 'check line');
  t.check(L[L.length - 1].includes('= 3 · 26 − 11 · 7'), 'back-substitution ends on Bézout', L.slice(-9));
  await t.shotSel('finale', '#euclid-pad');
  // Clicking an early line jumps there, paused.
  await t.ev(`document.querySelector('#euclid-pad-lines [data-beat="1"]').click();0`);
  t.check((await t.beat()) === 1, 'click jumps to beat 1', await t.beat());
  t.check((await t.text('#euclid-play')) === 'Play', 'paused after the jump');
  // Minimise.
  await t.click('euclid-pad-min');
  t.check(await t.ev(`getComputedStyle(document.getElementById('euclid-pad-body')).display==='none'`), 'minimised body hidden');
  await t.click('euclid-pad-min');
  await t.click('euclid-exit');
  t.check(await t.ev(`document.getElementById('euclid-pad').hidden`), 'pad hidden on Exit');
  await t.close();
};

SC.pad12 = async b => {
  const t = await openPage(b, 'pad12');
  await t.load('?lang=en');
  await t.runPaused(12, 8);
  await t.instant();
  const L = await padTexts(t);
  t.check(L.some(s => s.includes('gcd(12, 8) = 4 = 12 − 8')), 'Bézout for gcd 4', L.slice(-6));
  t.check(L.some(s => s.includes('8 has no inverse modulo 12')), 'no-inverse argument');
  t.check(L.some(s => s.includes('Remainder 0: stop. gcd(12, 8) = 4')), 'stop line');
  await t.shotSel('finale', '#euclid-pad');
  await t.close();
};

// Every N, a pair: the back-substitution's last line equals the Bézout line.
SC.sweep = async b => {
  const t = await openPage(b, 'sweep');
  await t.load('?lang=en');
  const bad = await t.ev(`(function(){return 0})()`);
  let fails = [];
  for (const [N, a] of [[26, 7], [60, 7], [60, 59], [13, 1], [12, 8], [10, 5], [55, 34], [7, 3], [2, 1], [45, 28]]) {
    await t.runPaused(N, a); await t.instant();
    const L = await padTexts(t);
    const bz = L.find(s => s.startsWith('Bézout'));
    const rhs = bz && bz.split(' = ').pop();
    const back = L.filter(s => s.trim().startsWith('=')).pop();
    const hasBack = L.some(s => s.startsWith('Back-substitution'));
    if (!bz || (hasBack && !back.endsWith(rhs))) fails.push([N, a, bz, back]);
  }
  t.check(fails.length === 0, 'back-substitution agrees with Bézout', fails);
  await t.close();
};

SC.shots = async b => {
  const t = await openPage(b, 'shots');
  await t.load('?lang=en');
  await t.runPaused(26, 7);
  await t.stepTo(6);
  if (SHOTS) {
    const { data } = await t.S("Page.captureScreenshot", { format: "png" });
    const file = join(process.env.EUCLID_SHOTS || tmpdir(), `pad-viewport-${DAY ? 'day' : 'night'}.png`);
    writeFileSync(file, Buffer.from(data, 'base64'));
    console.log('SHOT ' + file);
  }
  await t.close();
};

/* ---------- main ---------- */
const only = ONLY.length ? ONLY : Object.keys(SC);
const browser = await connect();
for (const name of only) {
  if (!SC[name]) { out(false, name, 'unknown scenario'); continue; }
  try { await SC[name](browser); } catch (e) { out(false, name, 'scenario threw', String(e.message || e).slice(0, 300)); }
}
browser.close();
console.log(fails ? `${fails} FAILED` : 'ALL PASSED');
process.exit(fails ? 1 : 0);
