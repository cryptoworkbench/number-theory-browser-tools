// CDP probe of Cyclic Groups' formula maps (the two-dimensional controls
// beside the main view's Size and Index formulas). Built-ins only (global
// WebSocket and fetch); headless Google Chrome on a throwaway profile,
// killed on exit.
//   node formula-map-check.mjs [regress] [zn] [snap] [maps] [url] [syntax]
//        [units] [curve] [ecmult] [composite] [noncyclic] [menu] [ctx]
//        [pane] [legacy] [mobile]                         (none: all)
//   node formula-map-check.mjs regress --capture    rewrite the fixture
//   node formula-map-check.mjs shot                 screenshots into this dir
import { spawn, execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import vm from 'node:vm';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, '../../..');
const PAGE = join(ROOT, 'Cyclic Groups', 'cyclic-groups.html');
const URL_BASE = pathToFileURL(PAGE).href;
const FIXTURE = join(HERE, 'formula-map-baseline.json');
const PORT = 9345;
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
const profile = mkdtempSync(join(tmpdir(), 'cg-fmap-'));
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
  const P = { S, errors, name, sessionId, on };
  P.ev = async (expr, ctx) => {
    const r = await S('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true, ...(ctx ? { contextId: ctx } : {}) });
    if (r.exceptionDetails) throw new Error('eval: ' + (r.exceptionDetails.exception?.description || r.exceptionDetails.text) + ' in ' + expr.slice(0, 100));
    return r.result.value;
  };
  P.load = async query => {
    const loaded = new Promise(res => on(m => { if (m.sessionId === sessionId && m.method === 'Page.loadEventFired') res(); }));
    await S('Page.navigate', { url: URL_BASE + query });
    await loaded;
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
  P.shot = async (file, clip) => {
    await S('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: 'light' }] });
    const r = await S('Page.captureScreenshot', { format: 'png', ...(clip ? { clip: { ...clip, scale: 1 } } : {}) });
    writeFileSync(join(HERE, file), Buffer.from(r.data, 'base64'));
  };
  P.done = async () => { try { await send('Target.closeTarget', { targetId }); await send('Target.disposeBrowserContext', { browserContextId }); } catch (e) {} };
  return P;
}

const noErrors = (P, label) => out(P.errors.length === 0, P.name, 'no-page-exception ' + label, P.errors);
const plains = a => a.map(f => f.plain);

/* ---------- the regression fixture ---------- */
const REGRESS_URLS = [
  'mode=additive&n=12&gen=9', 'mode=additive&n=12&gen=3', 'mode=additive&n=12&gen=7', 'mode=additive&n=12&gen=0',
  'mode=multiplicative&n=13&expr=2&gen=5', 'mode=multiplicative&n=8&gen=3',
  'curve=11,1,3&gen=1&expr=8', 'curve=35,3,3&gen=1', 'curve=7,0,1&gen=1'
];
const LCMS = ['none', 'both'];
const LEVELS = [['complete', ''], ['compact', '&subsimplify=1'], ['bare', '&subbare=1']];
const keyOf = (u, lcm, lv) => `${u} | lcm=${lcm} | ${lv}`;
const oldQuery = (u, lcm, lv) => `?mobile=0&${u}&subformularow=both&subformularing=both` + (lcm === 'both' ? '&sublcm=both&sublcmring=both' : '') + LEVELS.find(l => l[0] === lv)[1];
async function captureAll(browser) {
  const P = await openPage(browser, 'regress', { w: 1280, h: 900, ua: UA_DESKTOP });
  const fixture = { page: execFileSync('git', ['hash-object', PAGE], { cwd: ROOT }).toString().trim(), at: new Date().toISOString(), views: {} };
  for (const u of REGRESS_URLS) for (const lcm of LCMS) for (const [lv] of LEVELS) {
    await P.load(oldQuery(u, lcm, lv));
    await P.enter();
    fixture.views[keyOf(u, lcm, lv)] = await P.formulas();
  }
  noErrors(P, 'capture');
  await P.done();
  return fixture;
}


/* ---------- an independent model of the maps ---------- */
const gcd = (a, b) => (b ? gcd(b, a % b) : a);
const mod = (x, m) => ((x % m) + m) % m;
const sg = v => (v < 0 ? '−' + -v : String(v));
const NODE_OF = t => (t.startsWith('abs-') ? 'abs' : t.startsWith('pos-') ? 'pos' : t);
const ROW_OF = t => (t.includes('gcd') ? 'gcd' : t.includes('lcm') ? 'lcm' : null);
const STEPS_ORDER = { jn: 1, 'gcd-full': 5, 'gcd-short': 4, 'lcm-full': 5, 'lcm-short': 4, abs: 5, pos: 4, 'gcd-slu': 4, 'lcm-slu': 4 };
const STEPS_INDEX = { jn: 1, 'gcd-full': 4, 'gcd-short': 3, 'lcm-full': 4, 'lcm-short': 3, abs: 4, pos: 3, 'gcd-slu': 3, 'lcm-slu': 3 };
const ALL_TOKENS = ['jn', 'gcd-short', 'gcd-full', 'lcm-short', 'lcm-full', 'abs-gcd', 'abs-lcm', 'pos-gcd', 'pos-lcm', 'gcd-slu', 'lcm-slu'];
// ℤ/nℤ: the log of h to the base g is the k in 1..n with k·g = h (0 for n).
function znModel(n) {
  const M = { kind: 'add', n, N: n, label: `⟨ℤ/${n}ℤ, +⟩`, name: `⟨ℤ/${n}ℤ, +⟩`, gn: String(n), slu: true };
  M.at = x => String(x);
  M.pow = (g, k) => `${g}^${k}`;
  M.log = (g, h) => { for (let k = 1; k <= n; k++) if (mod(k * g, n) === mod(h, n)) return k; return null; };
  M.gens = []; for (let g = 0; g < n; g++) if (gcd(g, n) === 1 || (n === 1 && g === 0)) M.gens.push(g);
  return M;
}
// (ℤ/nℤ)*, found by brute force: the units, a generator's powers.
function unitsModel(n) {
  const units = []; for (let u = 1; u < n; u++) if (gcd(u, n) === 1) units.push(u);
  const N = units.length;
  const M = { kind: 'mul', n, N, label: `⟨ℤ/${n}ℤ, ×⟩`, name: `⟨ℤ/${n}ℤ, ×⟩`, gn: `φ(${n})`, slu: false };
  M.at = x => String(x);
  M.pow = (g, k) => `${g}^${k}`;
  const order = g => { let x = g, k = 1; while (x !== 1 % n) { x = (x * g) % n; k++; } return k; };
  M.gens = units.filter(u => order(u) === N);
  M.cyclic = M.gens.length > 0;
  M.log = (g, h) => { let x = 1 % n; for (let k = 1; k <= N; k++) { x = (x * g) % n; if (x === h % n) return k; } return null; };
  return M;
}
function reach(M, g, h) {
  const q = M.log(g, h), n = M.N;
  const r = n % q === 0 ? q : n % (n - q) === 0 ? q - n : null;
  return { q, r, abs: r !== null, pos: n % q === 0, slu: M.slu };
}
// Where a knob on token t goes when only rc holds (the plan's D-02).
function settleModel(t, rc) {
  const row = ROW_OF(t);
  if (t.startsWith('pos-') && !rc.pos) t = rc.abs ? 'abs-' + row : row + '-full';
  if (t.startsWith('abs-') && !rc.abs) t = row + '-full';
  if (t.includes('slu') && !rc.slu) t = 'jn';
  return t;
}
// What each form's numbers are: the log form's q, the SLU forms' h (n for 0).
function vals(M, g, h, node) {
  const n = M.N, rc = reach(M, g, h);
  const q = node.endsWith('slu') ? (h === 0 ? n : h) : rc.q;
  const d = gcd(n, q);
  return {
    h: M.at(h), group: M.label, name: M.name, g: M.at(g), gn: M.gn, n, q, d, m: n / d, l: n * q / d,
    gq: M.pow(g, q), gr: rc.r === null ? '' : M.pow(g, sg(rc.r)), r: rc.r === null ? '' : sg(rc.r), a: rc.r === null ? '' : Math.abs(rc.r)
  };
}
// The nine positions' texts, written out as the plan lists them.
const TO = {
  jn: v => `|⟨${v.h}⟩| = ${v.m}`,
  'gcd-full': v => `|⟨${v.h}⟩| = |${v.group}| / gcd(|${v.group}|, log_${v.g}(${v.h})) = ${v.gn} / gcd(${v.gn}, log_${v.g}(${v.gq})) = ${v.n} / gcd(${v.n}, ${v.q}) = ${v.n} / ${v.d} = ${v.m}`,
  'gcd-short': v => `|⟨${v.h}⟩| = |${v.group}| / gcd(|${v.group}|, log_${v.g}(${v.h})) = ${v.n} / gcd(${v.n}, ${v.q}) = ${v.n} / ${v.d} = ${v.m}`,
  'lcm-full': v => `|⟨${v.h}⟩| = lcm(|${v.group}|, log_${v.g}(${v.h})) / log_${v.g}(${v.h}) = lcm(${v.gn}, log_${v.g}(${v.gq})) / log_${v.g}(${v.gq}) = lcm(${v.n}, ${v.q}) / ${v.q} = ${v.l} / ${v.q} = ${v.m}`,
  'lcm-short': v => `|⟨${v.h}⟩| = lcm(|${v.group}|, log_${v.g}(${v.h})) / log_${v.g}(${v.h}) = lcm(${v.n}, ${v.q}) / ${v.q} = ${v.l} / ${v.q} = ${v.m}`,
  abs: v => `|⟨${v.h}⟩| = |${v.group}| / |log_${v.g}(${v.h})| = ${v.gn} / |log_${v.g}(${v.gr})| = ${v.n} / |${v.r}| = ${v.n} / ${v.a} = ${v.m}`,
  pos: v => `|⟨${v.h}⟩| = |${v.group}| / log_${v.g}(${v.h}) = ${v.gn} / log_${v.g}(${v.gr}) = ${v.n} / ${v.r} = ${v.m}`,
  'gcd-slu': v => `|⟨${v.h}⟩| = |${v.group}| / gcd(|${v.group}|, ${v.h}) = ${v.n} / gcd(${v.n}, ${v.q}) = ${v.n} / ${v.d} = ${v.m}`,
  'lcm-slu': v => `|⟨${v.h}⟩| = lcm(|${v.group}|, ${v.q}) / ${v.q} = lcm(${v.n}, ${v.q}) / ${v.q} = ${v.l} / ${v.q} = ${v.m}`
};
const TI = {
  jn: v => `[${v.name} : ⟨${v.h}⟩] = ${v.d}`,
  'gcd-full': v => `[${v.name} : ⟨${v.h}⟩] = gcd(|${v.group}|, log_${v.g}(${v.h})) = gcd(${v.gn}, log_${v.g}(${v.gq})) = gcd(${v.n}, ${v.q}) = ${v.d}`,
  'gcd-short': v => `[${v.name} : ⟨${v.h}⟩] = gcd(|${v.group}|, log_${v.g}(${v.h})) = gcd(${v.n}, ${v.q}) = ${v.d}`,
  'lcm-full': v => `[${v.name} : ⟨${v.h}⟩] = |${v.group}| · log_${v.g}(${v.h}) / lcm(|${v.group}|, log_${v.g}(${v.h})) = ${v.gn} · log_${v.g}(${v.gq}) / lcm(${v.gn}, log_${v.g}(${v.gq})) = ${v.n} · ${v.q} / lcm(${v.n}, ${v.q}) = ${v.d}`,
  'lcm-short': v => `[${v.name} : ⟨${v.h}⟩] = |${v.group}| · log_${v.g}(${v.h}) / lcm(|${v.group}|, log_${v.g}(${v.h})) = ${v.n} · ${v.q} / lcm(${v.n}, ${v.q}) = ${v.d}`,
  abs: v => `[${v.name} : ⟨${v.h}⟩] = |log_${v.g}(${v.h})| = |log_${v.g}(${v.gr})| = |${v.r}| = ${v.a}`,
  pos: v => `[${v.name} : ⟨${v.h}⟩] = log_${v.g}(${v.h}) = log_${v.g}(${v.gr}) = ${v.r}`,
  'gcd-slu': v => `[${v.name} : ⟨${v.h}⟩] = gcd(|${v.group}|, ${v.h}) = gcd(${v.n}, ${v.q}) = ${v.d}`,
  'lcm-slu': v => `[${v.name} : ⟨${v.h}⟩] = |${v.group}| · ${v.q} / lcm(|${v.group}|, ${v.q}) = ${v.n} · ${v.q} / lcm(${v.n}, ${v.q}) = ${v.d}`
};
const wantPair = (M, g, h, tokO, tokI) => {
  const nO = NODE_OF(tokO), nI = NODE_OF(tokI);
  return [TO[nO](vals(M, g, h, nO)), TI[nI](vals(M, g, h, nI))];
};
// The map state of every .fmap on the page: its formula, the position its
// knob is on, which radios are disabled, which is checked.
const mapsNow = P => P.ev(`Array.prototype.map.call(document.querySelectorAll('.fmap'), function(m){ var all = Array.prototype.slice.call(m.querySelectorAll('input')); return { f: m.getAttribute('data-f'), at: m.getAttribute('data-at'), checked: (all.find(function(i){ return i.checked; }) || {}).value, off: all.filter(function(i){ return i.disabled; }).map(function(i){ return i.value; }).sort(), n: all.length, labels: Array.prototype.map.call(m.querySelectorAll('svg text'), function(t){ return t.textContent; }).join(' ') }; })`);
const offWant = rc => [!rc.abs && 'abs', !rc.pos && 'pos', !rc.slu && 'gcd-slu', !rc.slu && 'lcm-slu'].filter(Boolean).sort();
const ZN = '?mobile=0&mode=additive&n=12&subformularow=both&subformularing=both';

/* ---------- main ---------- */
const SCENARIOS = [];

/* ---------- regress: rows byte-identical, main views by the equivalence table ---------- */
// The URLs whose main view has maps (grows with each task).
const MAPPED = u => /mode=additive/.test(u);
// What an old capture's main view says for a position, per the plan.
const EQUIV = {
  'gcd-full': ['none', 'complete', [0, 1]], 'gcd-slu': ['none', 'compact', [0, 1]], jn: ['none', 'bare', [0, 1]],
  'lcm-full': ['both', 'complete', [0]], 'lcm-slu': ['both', 'compact', [0]]
};
SCENARIOS.push(['regress', async browser => {
  const fx = JSON.parse(readFileSync(FIXTURE, 'utf8'));
  const P = await openPage(browser, 'regress', { w: 1280, h: 900, ua: UA_DESKTOP });
  let rowsOk = 0, rowsBad = [], ringOk = 0, ringBad = [], n = 0;
  const probe = async (u, lcm, lv, tokens) => {
    const k = keyOf(u, lcm, lv), want = fx.views[k];
    const extra = tokens ? `&fmaporder=${tokens}&fmapindex=${tokens}` : '';
    await P.load(oldQuery(u, lcm, lv) + extra);
    await P.enter();
    const got = await P.formulas();
    n++;
    if (JSON.stringify(got.row) === JSON.stringify(want.row)) rowsOk++; else rowsBad.push([k, plains(got.row), plains(want.row)]);
    if (!tokens) {
      if (JSON.stringify(got.ring) === JSON.stringify(want.ring)) ringOk++; else ringBad.push([k, plains(got.ring), plains(want.ring)]);
      return;
    }
    const [elcm, elv, lines] = EQUIV[tokens];
    const ref = fx.views[keyOf(u, elcm, elv)];
    // The line itself now carries aria-hidden (the box no longer does, so the maps can be read).
    const bare = x => JSON.stringify({ plain: x.plain, html: x.html.replace(' aria-hidden="true"', '').replace(' style=""', '') });
    const same = lines.every(i => got.ring[i] && bare(got.ring[i]) === bare(ref.ring[i]));
    if (same && got.ring.length === 2) ringOk++; else ringBad.push([k + ' @' + tokens, plains(got.ring), plains(ref.ring)]);
  };
  for (const u of REGRESS_URLS) {
    if (MAPPED(u)) {
      for (const [lv] of LEVELS) for (const lcm of LCMS) await probe(u, lcm, lv, 'gcd-full');
      for (const t of ['gcd-slu', 'jn', 'lcm-full', 'lcm-slu']) {
        if (t.includes('slu') && !/mode=additive/.test(u)) continue;
        await probe(u, t.startsWith('lcm') ? 'both' : 'none', t === 'jn' ? 'bare' : 'compact', t);
        await probe(u, 'both', 'complete', t);
      }
    } else {
      for (const [lv] of LEVELS) for (const lcm of LCMS) await probe(u, lcm, lv, null);
    }
  }
  out(rowsBad.length === 0, 'regress', `rows byte-identical to the fixture (${rowsOk}/${n} views)`, rowsBad.slice(0, 2));
  out(ringBad.length === 0, 'regress', `main views equal the old capture where the chain is the same (${ringOk}/${n} views)`, ringBad.slice(0, 2));
  noErrors(P, 'regress');
  await P.done();
}]);

/* ---------- zn: every position of both maps, ℤ/12ℤ ---------- */
SCENARIOS.push(['zn', async browser => {
  const P = await openPage(browser, 'zn', { w: 1280, h: 900, ua: UA_DESKTOP });
  const M = znModel(12);
  out(M.log(1, 9) === 9 && reach(M, 1, 9).r === -3 && reach(M, 1, 3).pos && !reach(M, 1, 9).pos, 'zn', 'model-matches-the-worked-example');
  for (const [h, expr] of [[9, 1], [3, 1], [7, 1], [0, 1], [9, 7]]) {
    const rc = reach(M, expr, h);
    for (const t of ALL_TOKENS) {
      if (expr === 7 && !['gcd-full', 'pos-gcd', 'abs-lcm', 'lcm-slu'].includes(t)) continue;
      await P.load(`${ZN}&gen=${h}&expr=${expr}&fmaporder=${t}&fmapindex=${t}`);
      await P.enter();
      const eff = settleModel(t, rc), node = NODE_OF(eff);
      const f = await P.formulas(), steps = await P.steps(), maps = await mapsNow(P);
      const want = wantPair(M, expr, h, eff, eff);
      out(JSON.stringify(plains(f.ring)) === JSON.stringify(want), 'zn', `h=${h} base=${expr} ${t}${eff !== t ? ' -> ' + eff : ''} plain`, { got: plains(f.ring), want });
      out(steps[0] === STEPS_ORDER[node] && steps[1] === STEPS_INDEX[node], 'zn', `h=${h} base=${expr} ${t} steps ${steps}`, { steps, want: [STEPS_ORDER[node], STEPS_INDEX[node]] });
      out(maps.length === 2 && maps.every(m => m.at === node && m.checked === node && JSON.stringify(m.off) === JSON.stringify(offWant(rc)) && m.n === 9), 'zn', `h=${h} base=${expr} ${t} knob and disabled positions`, { maps, off: offWant(rc), node });
      out((await P.param('fmaporder')) === (eff === 'gcd-full' ? null : eff), 'zn', `h=${h} base=${expr} ${t} url follows the snap`, await P.param('fmaporder'));
    }
  }
  const labels = (await mapsNow(P))[0].labels;
  out(labels === 'JN GCD short GCD full a2 a LCM short LCM full LCM SLU GCD SLU', 'zn', 'every position names itself on the map', labels);
  // the three slider levels and sublcm leave the main view alone
  noErrors(P, 'zn');
  await P.done();
}]);

/* ---------- snap: D-02 on a different h ---------- */
const clickRow = (P, g) => P.ev(`(function(){var b=document.querySelector('.subgroup-row[data-gen="${g}"]'); if(!b) return false; b.click(); return true})()`);
SCENARIOS.push(['snap', async browser => {
  const P = await openPage(browser, 'snap', { w: 1280, h: 900, ua: UA_DESKTOP });
  await P.load(`${ZN}&gen=3&fmaporder=pos-gcd&fmapindex=pos-lcm`);
  await P.enter();
  let m = await mapsNow(P);
  out(m[0].at === 'pos' && m[1].at === 'pos' && m[0].off.length === 0, 'snap', 'h=3 both maps sit on a2', m);
  await clickRow(P, 9); await sleep(700);
  m = await mapsNow(P);
  out(m[0].at === 'abs' && m[1].at === 'abs' && (await P.param('fmaporder')) === 'abs-gcd' && (await P.param('fmapindex')) === 'abs-lcm', 'snap', 'select 9: a2 snaps to a, rows kept (abs-gcd, abs-lcm) in the url', { m, o: await P.param('fmaporder'), i: await P.param('fmapindex') });
  let f = await P.formulas();
  out(JSON.stringify(plains(f.ring)) === JSON.stringify(wantPair(znModel(12), 1, 9, 'abs-gcd', 'abs-lcm')), 'snap', 'the formulas follow the snap', plains(f.ring));
  await clickRow(P, 7); await sleep(700);
  m = await mapsNow(P);
  out(m[0].at === 'gcd-full' && m[1].at === 'lcm-full' && (await P.param('fmaporder')) === null && (await P.param('fmapindex')) === 'lcm-full', 'snap', 'select 7: a snaps to the row it was entered from at its full form', { m, o: await P.param('fmaporder'), i: await P.param('fmapindex') });
  // SLU forms stay while h changes (they hold for every h in ℤ/nℤ), jn too
  await P.load(`${ZN}&gen=9&fmaporder=gcd-slu&fmapindex=jn`);
  await P.enter();
  await clickRow(P, 3); await sleep(600);
  m = await mapsNow(P);
  out(m[0].at === 'gcd-slu' && m[1].at === 'jn', 'snap', 'SLU and JN stay for another h', m);
  noErrors(P, 'snap');
  await P.done();
}]);

/* ---------- maps: independent, clickable, keyboard-operable ---------- */
const centre = (P, sel) => P.ev(`(function(){var e=document.querySelector(${JSON.stringify(sel)});if(!e)return null;var r=e.getBoundingClientRect();return{x:r.left+r.width/2,y:r.top+r.height/2}})()`);
SCENARIOS.push(['maps', async browser => {
  const P = await openPage(browser, 'maps', { w: 1280, h: 900, ua: UA_DESKTOP });
  await P.load(`${ZN}&gen=9`);
  await P.enter();
  const at = async () => (await mapsNow(P)).map(m => m.at);
  out((await at()).join() === 'gcd-full,gcd-full', 'maps', 'both maps start at GCD (full)');
  // click: LCM (short) on the order map, by the mouse
  let c = await centre(P, '.fmap[data-f="order"] .fmap-stop[data-id="lcm-short"]');
  await P.mouse(c.x, c.y);
  out((await at()).join() === 'lcm-short,gcd-full', 'maps', 'a click moves one map only (order -> lcm-short)', await at());
  out((await P.param('fmaporder')) === 'lcm-short' && (await P.param('fmapindex')) === null, 'maps', 'the url shows only the moved map');
  // a closed position cannot be clicked
  c = await centre(P, '.fmap[data-f="index"] .fmap-stop[data-id="pos"]');
  await P.mouse(c.x, c.y);
  out((await at()).join() === 'lcm-short,gcd-full', 'maps', 'a closed position (a2, q = 9 does not divide 12) does not take the knob', await at());
  // a from the lcm row remembers it
  c = await centre(P, '.fmap[data-f="order"] .fmap-stop[data-id="abs"]');
  await P.mouse(c.x, c.y);
  out((await P.param('fmaporder')) === 'abs-lcm', 'maps', 'a entered from LCM (short) is abs-lcm', await P.param('fmaporder'));
  c = await centre(P, '.fmap[data-f="order"] .fmap-stop[data-id="gcd-short"]');
  await P.mouse(c.x, c.y);
  c = await centre(P, '.fmap[data-f="order"] .fmap-stop[data-id="abs"]');
  await P.mouse(c.x, c.y);
  out((await P.param('fmaporder')) === 'abs-gcd', 'maps', 'a entered from GCD (short) is abs-gcd', await P.param('fmaporder'));
  // keyboard: focus the order map's knob, arrow right goes to the next open position, the focus stays on the map
  await P.load(`${ZN}&gen=9`);
  await P.enter();
  await P.ev(`document.querySelector('.fmap[data-f="order"] input:checked').focus()`);
  await P.key('ArrowRight', 'ArrowRight', 39);
  let st = await P.ev(`(function(){var a=document.activeElement, m=a&&a.closest&&a.closest('.fmap'); return { f: m && m.getAttribute('data-f'), v: a && a.value, checked: m && m.getAttribute('data-at') }; })()`);
  out(st.f === 'order' && st.v === 'abs' && st.checked === 'abs', 'maps', 'ArrowRight skips the closed a2 to a and the focus stays on the map', st);
  await P.key('ArrowRight', 'ArrowRight', 39);
  st = await P.ev(`(function(){var a=document.activeElement, m=a&&a.closest&&a.closest('.fmap'); return { f: m && m.getAttribute('data-f'), v: a && a.value }; })()`);
  out(st.f === 'order' && st.v === 'lcm-short', 'maps', 'ArrowRight again goes to LCM (short)', st);
  await P.key('ArrowLeft', 'ArrowLeft', 37);
  st = await P.ev(`(function(){var a=document.activeElement, m=a&&a.closest&&a.closest('.fmap'); return { f: m && m.getAttribute('data-f'), v: a && a.value }; })()`);
  out(st.f === 'order' && st.v === 'abs', 'maps', 'ArrowLeft goes back', st);
  out((await at()).join() === 'abs,gcd-full', 'maps', 'the index map did not move', await at());
  // tooltips and accessible names
  const names = await P.ev(`Array.prototype.map.call(document.querySelectorAll('.fmap[data-f="index"] .fmap-stop'), function(l){ return [l.title, l.querySelector('input').getAttribute('aria-label')]; })`);
  out(names.length === 9 && names.every(x => x[0] && x[0] === x[1]) && /^JN/.test(names.find(x => /^JN/.test(x[0]))[0]) && names.some(x => /^GCD \(short\)/.test(x[0])) && names.some(x => /^a2/.test(x[0])) && names.some(x => /^LCM \(SLU\)/.test(x[0])), 'maps', 'every position has a tooltip equal to its aria-label, starting with the map name', names.map(x => x[0].slice(0, 20)));
  const group = await P.ev(`Array.prototype.map.call(document.querySelectorAll('.fmap'), function(m){ return [m.getAttribute('role'), m.getAttribute('aria-label')]; })`);
  out(group.length === 2 && group.every(x => x[0] === 'radiogroup' && x[1]), 'maps', 'each map is a labelled radiogroup', group);
  // the map sits left of its formula, the pyramid stays at the right edge
  const geo = await P.ev(`(function(){var box=document.querySelector('.ring-hover-formula'), mp=document.querySelector('.fmap'), ln=document.querySelector('.ring-hover-formula math.ring-math-formula'), tri=document.querySelector('.ring-hover-formula .log-tri'); var r=function(e){var b=e.getBoundingClientRect();return {l:b.left,r:b.right,t:b.top,b:b.bottom};}; return { box:r(box), map:r(mp), line:r(ln), tri: tri && r(tri) }; })()`);
  out(geo.map.r <= geo.line.l && (!geo.tri || (geo.tri.l >= geo.line.r - 1 && geo.tri.l >= geo.map.r)), 'maps', 'map left of its formula, the pyramid clear of both', geo);
  noErrors(P, 'maps');
  await P.done();
}]);

/* ---------- url ---------- */
SCENARIOS.push(['url', async browser => {
  const P = await openPage(browser, 'url', { w: 1280, h: 900, ua: UA_DESKTOP });
  await P.load(`${ZN}&gen=9&fmaporder=abs-lcm&fmapindex=lcm-short&fmaporderr=jn&fmapindexr=pos-gcd`);
  await P.enter();
  let m = await mapsNow(P);
  out(m[0].at === 'abs' && m[1].at === 'lcm-short', 'url', 'fmaporder=abs-lcm&fmapindex=lcm-short restores both knobs', m);
  out(m[0].checked === 'abs' && (await P.param('fmaporder')) === 'abs-lcm' && (await P.param('fmapindex')) === 'lcm-short', 'url', 'and the url keeps them');
  out((await P.param('fmaporderr')) === 'jn' && (await P.param('fmapindexr')) === 'pos-gcd', 'url', "the pane's two stay in the url (fmaporderr, fmapindexr)", await P.q());
  await P.load(`${ZN}&gen=9&fmaporder=bogus&fmapindex=GCD-FULL`);
  await P.enter();
  m = await mapsNow(P);
  out(m[0].at === 'gcd-full' && m[1].at === 'gcd-full' && (await P.param('fmaporder')) === null, 'url', 'unknown tokens fall back to gcd-full and leave the url', m);
  // a reload through the url keeps a settled position
  await P.load(`${ZN}&gen=9&fmaporder=pos-lcm&fmapindex=gcd-slu`);
  await P.enter();
  out((await P.param('fmaporder')) === 'abs-lcm' && (await P.param('fmapindex')) === 'gcd-slu', 'url', 'pos-lcm with h = 9 loads as abs-lcm', await P.q());
  noErrors(P, 'url');
  await P.done();
}]);

/* ---------- syntax ---------- */
SCENARIOS.push(['syntax', async () => {
  const html = readFileSync(PAGE, 'utf8');
  let count = 0, bad = [];
  for (const mt of html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g)) {
    count++;
    try { new vm.Script(mt[1]); } catch (e) { bad.push(String(e)); }
  }
  out(count > 0 && bad.length === 0, 'syntax', `${count} inline script(s) parse`, bad);
  try { execFileSync('node', ['--check', join(ROOT, 'assets', 'i18n', 'cyclic-groups.js')]); out(true, 'syntax', 'assets/i18n/cyclic-groups.js parses'); }
  catch (e) { out(false, 'syntax', 'assets/i18n/cyclic-groups.js parses', String(e)); }
}]);
//@@SCENARIOS@@
// Screenshots of the main view with the maps into this directory.
SCENARIOS.push(['shot', async browser => {
  const P = await openPage(browser, 'shot', { w: 1280, h: 900, ua: UA_DESKTOP });
  await P.load(process.env.SHOT_URL || '?mobile=0&mode=additive&n=12&gen=9&subformularing=both');
  await P.enter();
  await P.shot(process.env.SHOT_FILE || 'shot-main-view-light.png');
  await P.done();
}]);
// A debugging aid, not part of the checks: DUMP_URL=... node ... dump
SCENARIOS.push(['dump', async browser => {
  const P = await openPage(browser, 'dump', { w: 1280, h: 900, ua: UA_DESKTOP });
  await P.load(process.env.DUMP_URL || '?mobile=0&mode=additive&n=12&gen=9&subformularing=both');
  await P.enter();
  const f = await P.formulas();
  console.log(JSON.stringify({ steps: await P.steps(), ring: plains(f.ring), q: await P.q(), maps: await P.ev(`Array.prototype.map.call(document.querySelectorAll('.fmap'), function(m){ return [m.getAttribute('data-f'), m.getAttribute('data-at'), Array.prototype.filter.call(m.querySelectorAll('input'), function(i){ return i.disabled; }).map(function(i){ return i.value; }).join('/')]; })`) }, null, 1));
  console.log(JSON.stringify(P.errors));
  await P.done();
}]);
const browser = await connect();
try {
  if (CAPTURE && want('regress')) {
    const fx = await captureAll(browser);
    writeFileSync(FIXTURE, JSON.stringify(fx, null, 1));
    const bad = Object.entries(fx.views).filter(([, v]) => v.ring.length === 0 || v.row.length === 0).map(([k]) => k);
    out(bad.length === 0, 'regress', `captured ${Object.keys(fx.views).length} views at page ${fx.page}`, bad);
  } else {
    for (const [name, fn] of SCENARIOS) if (want(name)) await fn(browser);
  }
} catch (e) {
  fails++;
  console.log('FAIL probe-crashed ' + (e && e.stack || e));
}
browser.close();
console.log(fails === 0 ? 'FORMULA-MAP-CHECK OK' : `FORMULA-MAP-CHECK FAIL: ${fails}`);
process.exit(fails === 0 ? 0 : 1);
