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
  P.shot = async (file, clip) => {
    await S('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: 'light' }] });
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

/* ---------- independent curve models (prime p, and n = p·q by CRT) ---------- */
const SUBD = '₀₁₂₃₄₅₆₇₈₉';
const subs = n => String(n).split('').map(d => SUBD[+d]).join('');
const eqn = (a, b) => 'y² = x³' + (a ? ' + ' + (a === 1 ? '' : a) + 'x' : '') + (b ? ' + ' + b : '');
function finishCurve(C) {
  C.log = (g, h) => {
    if (h === 0) return C.N;
    let r = 0;
    for (let k = 1; k <= C.N; k++) { r = C.plus(r, g); if (r === h) return k; }
    return null;
  };
  C.gens = [];
  for (let g = 1; g < C.N; g++) { let r = 0, k = 0; do { r = C.plus(r, g); k++; } while (r !== 0); if (k === C.N) C.gens.push(g); }
  C.cyclic = C.gens.length > 0;
  return C;
}
function curveModel(p, a, b) {
  const pts = [null];
  for (let x = 0; x < p; x++) for (let y = 0; y < p; y++) if (mod(y * y - (x * x * x + a * x + b), p) === 0) pts.push({ x, y });
  const inv = v => { for (let i = 1; i < p; i++) if (mod(v * i, p) === 1) return i; };
  const add = (P, Q) => {
    if (!P) return Q;
    if (!Q) return P;
    if (P.x === Q.x && mod(P.y + Q.y, p) === 0) return null;
    const s = P.x === Q.x ? mod((3 * P.x * P.x + a) * inv(mod(2 * P.y, p)), p) : mod((Q.y - P.y) * inv(mod(Q.x - P.x, p)), p);
    const x = mod(s * s - P.x - Q.x, p);
    return { x, y: mod(s * (P.x - x) - P.y, p) };
  };
  const at = P => pts.findIndex(Q => (!P && !Q) || (P && Q && P.x === Q.x && P.y === Q.y));
  pts.forEach(P => { if (P) P.txt = `(${P.x}, ${P.y})`; });
  return finishCurve({ p, a, b, pts, N: pts.length, group: `E(𝔽${subs(p)})`, plus: (i, j) => at(add(pts[i], pts[j])) });
}
function compositeModel(n, a, b) {
  const f = [];
  for (let d = 2, m = n; m > 1; d++) while (m % d === 0) { f.push(d); m /= d; }
  const A = curveModel(f[0], a, b), B = curveModel(f[1], a, b);
  const crt = (u, v) => { for (let x = u; x < n; x += f[0]) if (x % f[1] === v) return x; };
  const proj = P => (P ? [P.x, P.y, 1] : [0, 1, 0]);
  const items = [];
  for (let i = 0; i < A.N; i++) for (let j = 0; j < B.N; j++) {
    const P = A.pts[i], Q = B.pts[j];
    let pt = null;
    if (P && Q) pt = { x: crt(P.x, Q.x), y: crt(P.y, Q.y) };
    else if (P || Q) { const u = proj(P), v = proj(Q); pt = { X: crt(u[0], v[0]), Y: crt(u[1], v[1]), Z: crt(u[2], v[2]), proj: true }; }
    items.push({ i, j, pt });
  }
  const rank = t => (!t.pt ? [0, 0, 0, 0] : t.pt.proj ? [2, t.pt.Z, t.pt.X, t.pt.Y] : [1, t.pt.x, t.pt.y, 0]);
  items.sort((s, t) => { const r = rank(s), q = rank(t); for (let k = 0; k < 4; k++) if (r[k] !== q[k]) return r[k] - q[k]; return 0; });
  const at = {};
  items.forEach((t, k) => { at[t.i * B.N + t.j] = k; });
  const pts = items.map(t => (t.pt ? Object.assign(t.pt, { txt: t.pt.proj ? `(${t.pt.X} : ${t.pt.Y} : ${t.pt.Z})` : `(${t.pt.x}, ${t.pt.y})` }) : null));
  return finishCurve({ p: n, a, b, pts, N: items.length, group: `E(ℤ/${n}ℤ)`, plus: (x, y) => at[A.plus(items[x].i, items[y].i) * B.N + B.plus(items[x].j, items[y].j)] });
}
// A curve model as the maps' model: points as the page writes them, the index
// naming the curve in full, powers as (x, y)^q or, under ecmult, q·(x, y).
function ecAdapter(C, mult) {
  const pt = P => (P ? P.txt : '𝒪');
  const M = { kind: 'ec', n: C.p, N: C.N, label: C.group, name: `${C.group}: ${eqn(C.a, C.b)}`, gn: String(C.N), slu: false, gens: C.gens, cyclic: C.cyclic, C };
  M.at = x => pt(C.pts[x]);
  M.pow = (g, k) => (mult ? `${k}·${M.at(g)}` : `${M.at(g)}^${k}`);
  M.log = (g, h) => C.log(g, h);
  return M;
}
const ZN = '?mobile=0&mode=additive&n=12&subformularow=both&subformularing=both';

/* ---------- main ---------- */
const SCENARIOS = [];

/* ---------- regress: rows byte-identical, main views by the equivalence table ---------- */
// The URLs whose main view has maps (grows with each task).
const MAPPED = u => /mode=additive|n=13|curve=11,1,3|curve=35,3,3/.test(u);
// The tokens with an old capture to compare with, by group kind.
const TOKENS_OF = u => /mode=additive/.test(u) ? ['gcd-slu', 'jn', 'lcm-full', 'lcm-slu'] : /n=13/.test(u) ? ['jn', 'lcm-full'] : ['jn'];
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
    const extra = tokens && tokens !== 'complete' ? `&fmaporder=${tokens}&fmapindex=${tokens}` : '';
    await P.load(oldQuery(u, lcm, lv) + extra);
    await P.enter();
    const got = await P.formulas();
    n++;
    if (JSON.stringify(got.row) === JSON.stringify(want.row)) rowsOk++; else rowsBad.push([k, plains(got.row), plains(want.row)]);
    if (tokens === 'complete') {
      const ref = fx.views[keyOf(u, lcm, 'complete')];
      if (JSON.stringify(got.ring) === JSON.stringify(ref.ring)) ringOk++; else ringBad.push([k, plains(got.ring), plains(ref.ring)]);
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
      // a curve's full forms are new (the old main view was notation): the curve scenarios check them
      if (!/curve=/.test(u)) for (const [lv] of LEVELS) for (const lcm of LCMS) await probe(u, lcm, lv, 'gcd-full');
      for (const t of TOKENS_OF(u)) {
        await probe(u, t.startsWith('lcm') ? 'both' : 'none', t === 'jn' ? 'bare' : 'compact', t);
        await probe(u, 'both', 'complete', t);
      }
    } else {
      // no map: the Complete-level notation whatever the slider says
      for (const [lv] of LEVELS) for (const lcm of LCMS) await probe(u, lcm, lv, 'complete');
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
  // an extra Ring window is the page again with the ring's query (cleanRingQuery keeps the maps')
  await P.load('?ringwin=1&mobile=0&mode=additive&n=12&gen=9&subformularing=both&fmaporder=abs-lcm&fmapindex=lcm-short');
  await sleep(1500);
  m = await mapsNow(P);
  out(m.length === 2 && m[0].at === 'abs' && m[1].at === 'lcm-short', 'url', 'a Ring window (?ringwin=1) opens with the maps from the query', m);
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

/* ---------- generic: every open position of one group at one h and base ---------- */
async function checkGroup(P, scen, M, url, g, h, { tokens = ALL_TOKENS, keepRows = false } = {}) {
  const rc = reach(M, g, h);
  for (const t of tokens) {
    await P.load(`${url}&fmaporder=${t}&fmapindex=${t}`);
    await P.enter();
    const eff = settleModel(t, rc), node = NODE_OF(eff);
    const f = await P.formulas(), steps = await P.steps(), maps = await mapsNow(P);
    const want = wantPair(M, g, h, eff, eff);
    const tag = `${scen} h=${M.at(h)} base=${M.at(g)} ${t}${eff !== t ? ' -> ' + eff : ''}`;
    out(JSON.stringify(plains(f.ring)) === JSON.stringify(want), scen, `${tag} plain`, { got: plains(f.ring), want });
    out(steps[0] === STEPS_ORDER[node] && steps[1] === STEPS_INDEX[node], scen, `${tag} steps ${steps}`, { steps, node });
    out(maps.length === 2 && maps.every(m => m.at === node && m.checked === node && JSON.stringify(m.off) === JSON.stringify(offWant(rc)) && m.n === 9), scen, `${tag} knob and disabled positions`, { maps, off: offWant(rc), node });
    out((await P.param('fmaporder')) === (eff === 'gcd-full' ? null : eff), scen, `${tag} url follows the snap`, await P.param('fmaporder'));
  }
}
const SOME = ['gcd-full', 'gcd-short', 'lcm-full', 'lcm-short', 'abs-gcd', 'abs-lcm', 'pos-gcd', 'pos-lcm', 'gcd-slu', 'jn'];
SCENARIOS.push(['units', async browser => {
  const P = await openPage(browser, 'units', { w: 1280, h: 900, ua: UA_DESKTOP });
  const M = unitsModel(13);
  out(M.N === 12 && M.gens.join() === '2,6,7,11' && M.log(2, 5) === 9 && reach(M, 2, 5).r === -3 && !reach(M, 2, 5).pos, 'units', 'model-matches-the-worked-example', { gens: M.gens });
  await checkGroup(P, 'units', M, '?mobile=0&mode=multiplicative&n=13&expr=2&subformularow=both&subformularing=both&gen=5', 2, 5);
  await checkGroup(P, 'units', M, '?mobile=0&mode=multiplicative&n=13&expr=2&subformularow=both&subformularing=both&gen=3', 2, 3, { tokens: SOME });
  await checkGroup(P, 'units', M, '?mobile=0&mode=multiplicative&n=13&expr=2&subformularow=both&subformularing=both&gen=1', 2, 1, { tokens: ['gcd-full', 'pos-lcm', 'abs-gcd'] });
  noErrors(P, 'units');
  await P.done();
}]);
const CURVE = '?mobile=0&curve=11,1,3&subformularow=both&subformularing=both';
SCENARIOS.push(['curve', async browser => {
  const P = await openPage(browser, 'curve', { w: 1280, h: 900, ua: UA_DESKTOP });
  const C = curveModel(11, 1, 3), M = ecAdapter(C, false);
  out(C.N === 18 && C.gens.join() === '8,9,14,15,16,17' && C.log(8, 1) === 15 && reach(M, 8, 1).r === -3, 'curve', 'model-matches-the-worked-example', { N: C.N, gens: C.gens });
  await checkGroup(P, 'curve', M, `${CURVE}&gen=1&expr=8`, 8, 1);
  await checkGroup(P, 'curve', M, `${CURVE}&gen=3&expr=8`, 8, 3, { tokens: SOME });
  await checkGroup(P, 'curve', M, `${CURVE}&gen=0&expr=8`, 8, 0, { tokens: ['gcd-full', 'lcm-short', 'abs-gcd'] });
  // the full curve name leads the index
  await P.load(`${CURVE}&gen=1&expr=8`);
  await P.enter();
  const f = await P.formulas();
  out(f.ring[1].plain.startsWith('[E(𝔽₁₁): y² = x³ + x + 3 : ⟨(0, 5)⟩] = gcd(|E(𝔽₁₁)|, log_(5, 1)((0, 5)))'), 'curve', 'index-leads-with-the-curve-in-full', f.ring[1].plain);
  // the slider on Natural: the base is the arranging point
  await P.load(`${CURVE}&gen=1&arrangegen=14`);
  await P.enter();
  const f2 = await P.formulas();
  out(f2.ring[0] && f2.ring[0].plain === wantPair(M, 14, 1, 'gcd-full', 'gcd-full')[0], 'curve', 'natural slider: the log base is the arranging point', plains(f2.ring));
  // the pyramid offers itself on a cyclic curve and not at JN
  out(await P.exists('.ring-hover-formula .log-tri'), 'curve', 'pyramid at a log form');
  await P.load(`${CURVE}&gen=1&expr=8&fmaporder=jn&fmapindex=jn`);
  await P.enter();
  out(!(await P.exists('.ring-hover-formula .log-tri')), 'curve', 'no pyramid while every shown formula sits on JN');
  noErrors(P, 'curve');
  await P.done();
}]);
SCENARIOS.push(['ecmult', async browser => {
  const P = await openPage(browser, 'ecmult', { w: 1280, h: 900, ua: UA_DESKTOP });
  const C = curveModel(11, 1, 3), M = ecAdapter(C, true);
  await checkGroup(P, 'ecmult', M, `${CURVE}&gen=1&expr=8&ecmult=1`, 8, 1, { tokens: ['gcd-full', 'lcm-full', 'abs-gcd', 'pos-gcd', 'jn'] });
  await P.load(`${CURVE}&gen=1&expr=8&ecmult=1&fmaporder=abs-gcd&fmapindex=gcd-full`);
  await P.enter();
  const m = await P.ev(`(function(){
    var squash = function(e){ return e.textContent.replace(/\\s+/g, ''); };
    var lines = document.querySelectorAll('.ring-hover-formula math.ring-math-formula');
    var rows = function(l, a, b){ return Array.prototype.filter.call(l.querySelectorAll('mrow'), function(r){ return r.children.length === 3 && squash(r.children[0]) === a && squash(r.children[1]) === '\\u00b7' && squash(r.children[2]) === b; }).length; };
    return { neg: rows(lines[0], '\\u22123', '(5,1)'), pos: rows(lines[1], '15', '(5,1)'), msup: Array.prototype.filter.call(lines[0].querySelectorAll('msup'), function(x){ return squash(x.children[0]) === '(5,1)'; }).length };
  })()`);
  out(m.neg >= 1 && m.pos >= 1 && m.msup === 0, 'ecmult', 'powers are mrow(q, ·, point): −3·(5, 1) at a, 15·(5, 1) at GCD (full), no msup of the base point', m);
  noErrors(P, 'ecmult');
  await P.done();
}]);
SCENARIOS.push(['composite', async browser => {
  const P = await openPage(browser, 'composite', { w: 1280, h: 900, ua: UA_DESKTOP });
  const C = compositeModel(35, 3, 3), M = ecAdapter(C, false);
  out(C.N === 30 && C.cyclic, 'composite', 'model-is-cyclic-of-order-30', { N: C.N, cyclic: C.cyclic });
  const g = C.gens[0];
  for (const h of [C.gens[1], 1, 3, 0]) await checkGroup(P, 'composite', M, `?mobile=0&curve=35,3,3&subformularow=both&subformularing=both&gen=${h}&expr=${g}`, g, h, { tokens: ['gcd-full', 'lcm-full', 'abs-gcd', 'pos-lcm', 'gcd-slu'] });
  noErrors(P, 'composite');
  await P.done();
}]);
SCENARIOS.push(['noncyclic', async browser => {
  const P = await openPage(browser, 'noncyclic', { w: 1280, h: 900, ua: UA_DESKTOP });
  const want = {
    units: ['|⟨3⟩| = ord(3) = 2', '[⟨ℤ/8ℤ, ×⟩ : ⟨3⟩] = |⟨ℤ/8ℤ, ×⟩| / |⟨3⟩| = 4 / 2 = 2'],
    curve: ['|⟨(0, 1)⟩| = 3', '[E(𝔽₇): y² = x³ + 1 : ⟨(0, 1)⟩] = 4']
  };
  for (const [name, url] of [['units', 'mode=multiplicative&n=8&gen=3'], ['curve', 'curve=7,0,1&gen=1']]) for (const lv of ['', '&subsimplify=1', '&subbare=1', '&sublcm=both&sublcmring=both']) {
    await P.load(`?mobile=0&${url}&subformularow=both&subformularing=both${lv}`);
    await P.enter();
    const f = await P.formulas();
    out(JSON.stringify(plains(f.ring)) === JSON.stringify(want[name]), 'noncyclic', `${name}${lv || ' complete'}: the Complete-level notation, whatever the slider says`, plains(f.ring));
    out(!(await P.exists('.fmap')) && !(await P.exists('.ring-hover-formula .log-tri')), 'noncyclic', `${name}${lv || ' complete'}: no map, no pyramid`);
  }
  // a map's stored position is left alone where there is no map
  await P.load('?mobile=0&mode=multiplicative&n=8&gen=3&subformularing=both&fmaporder=lcm-short');
  await P.enter();
  out((await P.param('fmaporder')) === 'lcm-short', 'noncyclic', 'a stored position stays in the url (no snapping without a map)', await P.q());
  noErrors(P, 'noncyclic');
  await P.done();
}]);

/* ---------- snap, further: another group, another base ---------- */
const wheel = (P, x, y, dy) => P.S('Input.dispatchMouseEvent', { type: 'mouseWheel', x, y, deltaX: 0, deltaY: dy });
SCENARIOS.push(['snap', async browser => {
  const P = await openPage(browser, 'snap', { w: 1280, h: 900, ua: UA_DESKTOP });
  // SLU, then another group: ℤ/12ℤ -> (ℤ/13ℤ)* sends it to JN, and the url follows
  await P.load(`${ZN}&gen=3&fmaporder=gcd-slu&fmapindex=lcm-slu`);
  await P.enter();
  let m = await mapsNow(P);
  out(m[0].at === 'gcd-slu' && m[1].at === 'lcm-slu' && m[0].off.length === 0, 'snap', 'SLU holds in ℤ/12ℤ', m);
  await P.ev(`(function(){ var o=document.getElementById('op-select'); o.value='multiplicative'; o.dispatchEvent(new Event('change', { bubbles: true })); var n=document.getElementById('n-input'); n.value='13'; n.dispatchEvent(new Event('input', { bubbles: true })); n.dispatchEvent(new Event('change', { bubbles: true })); return 1; })()`);
  await sleep(1200);
  m = await mapsNow(P);
  out(m.length === 2 && m[0].at === 'jn' && m[1].at === 'jn' && (await P.param('fmaporder')) === 'jn' && (await P.param('fmapindex')) === 'jn' && /mode=multiplicative/.test(await P.q()), 'snap', 'switching to (ℤ/13ℤ)* snaps SLU to JN in both maps and the url', { m, q: await P.q() });
  // another base through the pyramid's wheel: h = 9 in ℤ/12ℤ, base 1 -> 5 -> 7 opens a2 (log_7 9 = 3), back to 5 closes it
  await P.load(`${ZN}&gen=9&fmaporder=abs-gcd&fmapindex=abs-lcm`);
  await P.enter();
  m = await mapsNow(P);
  out(m[0].off.includes('pos'), 'snap', 'base 1: a2 closed (q = 9)', m[0].off);
  await P.clickEl('.ring-hover-formula .log-tri input[value="scroll"]');
  await sleep(500);
  const at = await P.ev(`(function(){var r=document.querySelector('.ring-hover-formula').getBoundingClientRect(); return {x:r.left+r.width/2, y:r.top+r.height/2}})()`);
  await wheel(P, at.x, at.y, 100); await sleep(500);
  await wheel(P, at.x, at.y, 100); await sleep(700);
  m = await mapsNow(P);
  let f = await P.formulas();
  const Z = znModel(12);
  out(m[0].at === 'abs' && !m[0].off.includes('pos') && JSON.stringify(plains(f.ring)) === JSON.stringify(wantPair(Z, 7, 9, 'abs-gcd', 'abs-lcm')), 'snap', 'base 7: log_7 9 = 3, a2 opens and the stored a stays', { m, ring: plains(f.ring) });
  await P.clickEl('.fmap[data-f="order"] .fmap-stop[data-id="pos"] input');
  await sleep(700);
  out((await P.param('fmaporder')) === 'pos-gcd', 'snap', 'a2 can be entered from a (pos-gcd)', await P.param('fmaporder'));
  await wheel(P, at.x, at.y, -100); await sleep(700);
  m = await mapsNow(P);
  out(m[0].at === 'abs' && m[0].off.includes('pos') && (await P.param('fmaporder')) === 'abs-gcd', 'snap', 'back to base 5: a2 closes and the knob snaps to a, the url too', { m, o: await P.param('fmaporder') });
  noErrors(P, 'snap');
  await P.done();
}]);

/* ---------- the bottom bar's menu ---------- */
const barSegs = P => P.ev(`Array.prototype.map.call(document.querySelectorAll('#bar-menu .bar-seg'), function(s){ return Array.prototype.map.call(s.querySelectorAll('.bar-check'), function(b){ return b.textContent + (b.getAttribute('aria-checked') === 'true' ? '*' : ''); }).join('|'); })`);
SCENARIOS.push(['menu', async browser => {
  const P = await openPage(browser, 'menu', { w: 1280, h: 900, ua: UA_DESKTOP });
  await P.load(`${ZN}&gen=9&fmaporder=lcm-full&fmapindex=gcd-short`);
  await P.enter();
  await P.clickEl('#bar-formulas-l .bar-btn');
  await sleep(500);
  let segs = await barSegs(P);
  out(JSON.stringify(segs) === JSON.stringify(['Show*|Hide', 'Show*|Hide', 'GCD*|None|LCM', 'GCD*|None|LCM']), 'menu', 'Main offers Show / Hide per formula, Row GCD / None / LCM', segs);
  // keys across rows of different widths
  const focused = () => P.ev(`(function(){var a=document.activeElement; return a && a.getAttribute && a.getAttribute('data-at'); })()`);
  await P.ev(`document.querySelector('#bar-menu [data-at="0,2"]').focus()`);
  await P.key('ArrowDown', 'ArrowDown', 40);
  out((await focused()) === '1,3', 'menu', 'ArrowDown from Main Index/Show lands on Row Index/GCD', await focused());
  await P.ev(`document.querySelector('#bar-menu [data-at="1,5"]').focus()`);
  await P.key('ArrowUp', 'ArrowUp', 38);
  out((await focused()) === '0,3', 'menu', 'ArrowUp from Row Index/LCM clamps to Main Index/Hide', await focused());
  await P.ev(`document.querySelector('#bar-menu [data-at="0,3"]').focus()`);
  await P.key('ArrowRight', 'ArrowRight', 39);
  out((await focused()) === '0,0', 'menu', 'ArrowRight wraps inside the narrower row', await focused());
  // Hide the Size in Main: the main view keeps only the index map; Row untouched
  await P.clickEl('#bar-menu [data-at="0,1"]');
  await sleep(700);
  segs = await barSegs(P);
  out(JSON.stringify(segs) === JSON.stringify(['Show|Hide*', 'Show*|Hide', 'GCD*|None|LCM', 'GCD*|None|LCM']), 'menu', 'Hide on Main Size', segs);
  out((await P.param('subformularing')) === 'index' && (await P.exists('.fmap[data-f="index"]')) && !(await P.exists('.fmap[data-f="order"]')), 'menu', 'the main view now shows only the index, with its map', await P.q());
  // swap: only the shown / hidden choices trade places
  await P.load('?mobile=0&mode=additive&n=12&gen=9&subformularing=order&subformularow=index&sublcm=both&fmaporder=lcm-full&fmapindex=abs-gcd');
  await P.enter();
  await P.clickEl('#bar-formulas-l .bar-btn');
  await sleep(500);
  await P.clickEl('#bar-menu .bar-swap');
  await sleep(700);
  const q = new URLSearchParams(await P.q());
  out(q.get('subformularing') === 'index' && q.get('subformularow') === 'order' && q.get('sublcm') === 'both' && q.get('fmaporder') === 'lcm-full' && q.get('fmapindex') === 'abs-gcd' && !q.has('sublcmring'), 'menu', 'swap trades Main and Row shown/hidden only; Row keeps its LCM, the maps stay, no sublcmring', Object.fromEntries(q));
  noErrors(P, 'menu');
  await P.done();
}]);

/* ---------- the right-click switch ---------- */
async function rightClick(P, where) {
  const g = await P.ev(`(function(){var ms=document.querySelectorAll('.ring-hover-formula math.ring-math-formula'); var r=function(e){var b=e.getBoundingClientRect(); return {l:b.left,r:b.right,t:b.top,b:b.bottom};}; var a=r(ms[0]), b=ms.length>1?r(ms[1]):a; return {a:a, b:b}; })()`);
  const x = (g.a.l + g.a.r) / 2;
  const y = where === 'first' ? (g.a.t + g.a.b) / 2 : where === 'second' ? (g.b.t + g.b.b) / 2 : (g.a.b + g.b.t) / 2;
  await P.mouse(x, y, 'right');
  return P.ev(`Array.prototype.map.call(document.querySelectorAll('#ring-ctx .ring-ctx-fml'), function(e){ return e.textContent.trim(); })`);
}
const clickSwitch = P => P.ev(`(function(){var it=Array.prototype.find.call(document.querySelectorAll('#ring-ctx .ring-ctx-fml'), function(e){ return /Switch to/.test(e.textContent); }); if (it) it.click(); return !!it;})()`);
SCENARIOS.push(['ctx', async browser => {
  const P = await openPage(browser, 'ctx', { w: 1280, h: 900, ua: UA_DESKTOP });
  await P.load(`${ZN}&gen=9&fmaporder=gcd-short&fmapindex=gcd-short`);
  await P.enter();
  let items = await rightClick(P, 'first');
  out(items.includes('Switch to LCM form'), 'ctx', 'on the Size line at GCD (short): Switch to LCM form', items);
  await clickSwitch(P); await sleep(700);
  out((await P.param('fmaporder')) === 'lcm-short' && (await P.param('fmapindex')) === 'gcd-short', 'ctx', 'it moves only that formula, at the same detail (lcm-short)', await P.q());
  items = await rightClick(P, 'between');
  out(!items.some(t => /Switch to/.test(t)), 'ctx', 'between two lines in different families: no switch item', items);
  items = await rightClick(P, 'second');
  out(items.includes('Switch to LCM form'), 'ctx', 'on the Index line (still GCD): Switch to LCM form', items);
  await clickSwitch(P); await sleep(700);
  items = await rightClick(P, 'between');
  out(items.includes('Switch to GCD form'), 'ctx', 'both lines LCM (short): between the lines Switch to GCD form', items);
  await clickSwitch(P); await sleep(700);
  out((await P.param('fmaporder')) === 'gcd-short' && (await P.param('fmapindex')) === 'gcd-short', 'ctx', 'it moves both back to GCD (short)', await P.q());
  // SLU stays SLU
  await P.load(`${ZN}&gen=9&fmaporder=gcd-slu&fmapindex=gcd-slu`);
  await P.enter();
  await rightClick(P, 'between'); await clickSwitch(P); await sleep(700);
  out((await P.param('fmaporder')) === 'lcm-slu' && (await P.param('fmapindex')) === 'lcm-slu', 'ctx', 'gcd-slu switches to lcm-slu', await P.q());
  // none at JN, a, a2
  for (const t of ['jn', 'abs-gcd']) {
    await P.load(`${ZN}&gen=9&fmaporder=${t}&fmapindex=${t}`);
    await P.enter();
    items = await rightClick(P, 'first');
    out(items.length > 0 && !items.some(x => /Switch to/.test(x)), 'ctx', `at ${t}: no switch item`, items);
  }
  // a cyclic curve now has the switch too
  await P.load(`?mobile=0&curve=11,1,3&gen=1&expr=8&subformularing=both&fmaporder=gcd-full&fmapindex=gcd-full`);
  await P.enter();
  items = await rightClick(P, 'between');
  await clickSwitch(P); await sleep(700);
  out(items.includes('Switch to LCM form') && (await P.param('fmaporder')) === 'lcm-full' && (await P.param('fmapindex')) === 'lcm-full', 'ctx', 'on a cyclic curve the switch works (gcd-full -> lcm-full)', { items, q: await P.q() });
  noErrors(P, 'ctx');
  await P.done();
}]);

/* ---------- legacy links ---------- */
SCENARIOS.push(['legacy', async browser => {
  const P = await openPage(browser, 'legacy', { w: 1280, h: 900, ua: UA_DESKTOP });
  for (const [qs, wantO, wantI] of [['sublcmring=both', 'lcm-full', 'lcm-full'], ['sublcmring=order', 'lcm-full', 'gcd-full'], ['sublcmring=1', 'lcm-full', 'lcm-full'], ['sublcmring=both&fmaporder=jn', 'jn', 'lcm-full'], ['sublcmring=both&fmaporder=bogus&fmapindex=gcd-short', 'gcd-full', 'gcd-short']]) {
    await P.load(`${ZN}&gen=9&${qs}`);
    await P.enter();
    const m = await mapsNow(P);
    out(m.length === 2 && m[0].at === NODE_OF(wantO) && m[1].at === NODE_OF(wantI), 'legacy', `${qs}: knobs ${wantO} / ${wantI}`, m.map(x => x.at));
    const q = new URLSearchParams(await P.q());
    out(!q.has('sublcmring') && !q.has('sublcmringr') && (q.get('fmaporder') || 'gcd-full') === wantO && (q.get('fmapindex') || 'gcd-full') === wantI, 'legacy', `${qs}: sublcmring is no longer written, the maps are`, Object.fromEntries(q));
  }
  noErrors(P, 'legacy');
  await P.done();
}]);

/* ---------- a phone ---------- */
SCENARIOS.push(['mobile', async browser => {
  const P = await openPage(browser, 'mobile', { w: 390, h: 844, ua: UA_ANDROID, touch: true });
  await P.load(`?mobile=1&mode=additive&n=12&gen=9&subformularing=both`);
  await sleep(800);
  const m = await mapsNow(P);
  out(m.length === 2 && m.every(x => x.n === 9), 'mobile', 'both maps beside the main formulas on the stacked page', m.length);
  out(!(await P.exists('.ring-hover-formula .log-tri')), 'mobile', 'no pyramid on the phone');
  await P.clickEl('.fmap[data-f="order"] .fmap-stop[data-id="lcm-short"] input');
  await sleep(700);
  const f = await P.formulas();
  out((await P.param('fmaporder')) === 'lcm-short' && f.ring[0] && f.ring[0].plain === wantPair(znModel(12), 1, 9, 'lcm-short', 'gcd-full')[0], 'mobile', 'a tap moves the knob and the formula follows', plains(f.ring));
  const w = await P.ev(`({ doc: document.documentElement.scrollWidth, win: window.innerWidth })`);
  out(w.doc <= w.win + 1, 'mobile', 'the page does not scroll sideways', w);
  noErrors(P, 'mobile');
  await P.done();
}]);

/* ---------- the isomorphism pane ---------- */
// Opens the pane on the chip whose text holds `chip`; returns its execution context, or null.
async function openPane(P, query, chip) {
  await P.load(query);
  await P.enter();
  const hit = await P.ev(`(function(){var cs=Array.prototype.filter.call(document.querySelectorAll('#iso-panel a.iso-chip'), function(a){ return a.textContent.indexOf(${JSON.stringify(chip)}) !== -1; }); if (cs[0]) cs[0].click(); return cs.length;})()`);
  if (!hit) return null;
  for (let i = 0; i < 30; i++) {
    await sleep(300);
    const c = await P.paneCtx();
    if (c && (await P.ev(`document.querySelectorAll('.fmap').length`, c)) === 2) { await sleep(600); return c; }
  }
  return null;
}
const hostQ = async P => new URLSearchParams(await P.q());
SCENARIOS.push(['pane', async browser => {
  const P = await openPage(browser, 'pane', { w: 1500, h: 900, ua: UA_DESKTOP });
  // the host's copy of the pane's maps reaches the pane
  let ctx = await openPane(P, '?mobile=0&mode=additive&n=12&gen=1&subformularing=both&subformularingr=both&fmaporderr=lcm-short&fmapindexr=jn&fmaporder=gcd-short&fmapindex=lcm-full', 'ℤ/13ℤ,×');
  out(!!ctx, 'pane', 'the pane opens on (ℤ/13ℤ)* with its own two maps');
  if (!ctx) { noErrors(P, 'pane'); await P.done(); return; }
  let pm = await mapsNow({ ev: e => P.ev(e, ctx) });
  out(pm.length === 2 && pm[0].at === 'lcm-short' && pm[1].at === 'jn', 'pane', "the pane's knobs start where the host's fmaporderr/fmapindexr say", pm);
  const hm = await mapsNow(P);
  out(hm.length === 2 && hm[0].at === 'gcd-short' && hm[1].at === 'lcm-full', 'pane', "the host's own maps are its own", hm);
  // a change in the pane writes the host's url
  await P.ev(`document.querySelector('.fmap[data-f="order"] .fmap-stop[data-id="lcm-full"] input').click()`, ctx);
  await sleep(1200);
  let q = await hostQ(P);
  out(q.get('fmaporderr') === 'lcm-full' && q.get('fmapindexr') === 'jn' && q.get('fmaporder') === 'gcd-short' && q.get('fmapindex') === 'lcm-full', 'pane', "a click in the pane writes fmaporderr into the host's url, the rest stays", Object.fromEntries(q));
  pm = await mapsNow({ ev: e => P.ev(e, ctx) });
  out(pm[0].at === 'lcm-full' && pm[1].at === 'jn', 'pane', 'and the pane keeps the knob there after the host has shared its state back', pm);
  // the right-click switch in the pane
  const g = await P.ev(`(function(){var m=document.querySelector('.ring-hover-formula math.ring-math-formula'); var b=m.getBoundingClientRect(); return {x:(b.left+b.right)/2, y:(b.top+b.bottom)/2}; })()`, ctx);
  await P.ev(`document.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, cancelable: true, clientX: ${g.x}, clientY: ${g.y} }))`, ctx);
  await sleep(500);
  const items = await P.ev(`Array.prototype.map.call(document.querySelectorAll('#ring-ctx .ring-ctx-fml'), function(e){ return e.textContent.trim(); })`, ctx);
  const sw = items.includes('Switch to GCD form') && await P.ev(`(function(){var it=Array.prototype.find.call(document.querySelectorAll('#ring-ctx .ring-ctx-fml'), function(e){ return /Switch to/.test(e.textContent); }); it.click(); return true;})()`, ctx);
  await sleep(1200);
  q = await hostQ(P);
  out(!!sw && q.get('fmaporderr') === null && !q.has('sublcmringr'), 'pane', "the pane's right-click switch (lcm-full -> gcd-full, the default, so no param) reaches the host url", { items, q: q.get('fmaporderr') });
  // the swap trades the two rings' maps
  await P.ev(`document.querySelector('.fmap[data-f="order"] .fmap-stop[data-id="gcd-short"] input').click()`, ctx);
  await sleep(1000);
  q = await hostQ(P);
  out(q.get('fmaporderr') === 'gcd-short', 'pane', 'pane order map moved to gcd-short', q.get('fmaporderr'));
  await P.clickEl('#iso-swap');
  await sleep(3500);
  q = await hostQ(P);
  out(q.get('fmaporder') === 'gcd-short' && q.get('fmapindex') === 'jn' && q.get('fmaporderr') === 'gcd-short' && (q.get('fmapindexr') === 'lcm-full'), 'pane', 'swapping the rings swaps the maps: host takes the pane\'s (gcd-short, jn), the pane the host\'s (gcd-short, lcm-full)', Object.fromEntries(q));
  noErrors(P, 'pane');
  await P.done();
  // a pane snap reaches the host: SLU in the pane's (ℤ/13ℤ)* goes to JN and the host's url follows
  const P2 = await openPage(browser, 'pane', { w: 1500, h: 900, ua: UA_DESKTOP });
  const c2 = await openPane(P2, '?mobile=0&mode=additive&n=12&gen=1&subformularing=both&subformularingr=both&fmaporderr=gcd-slu&fmapindexr=lcm-slu', 'ℤ/13ℤ,×');
  await sleep(1500);
  const q2 = await hostQ(P2);
  const pm2 = c2 ? await mapsNow({ ev: e => P2.ev(e, c2) }) : [];
  out(!!c2 && pm2[0].at === 'jn' && pm2[1].at === 'jn' && q2.get('fmaporderr') === 'jn' && q2.get('fmapindexr') === 'jn', 'pane', "the pane snaps SLU to JN and tells the host (fmaporderr=jn, fmapindexr=jn)", { pm2: pm2.map(m => m.at), r: [q2.get('fmaporderr'), q2.get('fmapindexr')] });
  // a host reload keeps the pane's maps: reopen the pane and read them
  const url = await P2.q();
  const c3 = await openPane(P2, '?mobile=0&mode=additive&n=12&gen=1&subformularing=both&subformularingr=both&fmaporderr=abs-lcm&fmapindexr=pos-gcd', 'ℤ/13ℤ,×');
  const pm3 = c3 ? await mapsNow({ ev: e => P2.ev(e, c3) }) : [];
  out(!!c3 && pm3[0].at === 'abs' && pm3[1].at === 'pos', 'pane', "reloading the host with fmaporderr=abs-lcm&fmapindexr=pos-gcd restores the pane's knobs (a, a2: gen 1 in (ℤ/13ℤ)*)", pm3.map(m => m.at));
  noErrors(P2, 'pane');
  await P2.done();
}]);
//@@SCENARIOS@@
// Screenshots of the main view with the maps into this directory.
SCENARIOS.push(['shot', async browser => {
  const P = await openPage(browser, 'shot', { w: 1280, h: 900, ua: UA_DESKTOP });
  await P.load('?mobile=0&mode=additive&n=12&gen=9&subformularing=both');
  await P.enter();
  await P.shot('shot-main-view-light.png');
  const r = await P.rect('.ring-hover-formula');
  await P.shot('shot-formula-maps-light-crop.png', { x: Math.max(0, r.x), y: Math.max(0, r.y), width: Math.min(r.w, 1280), height: r.h });
  await P.load('?mobile=0&mode=multiplicative&n=13&expr=2&gen=5&subformularing=both&fmaporder=abs-lcm&fmapindex=jn');
  await P.enter();
  await P.shot('shot-units-light.png');
  await P.done();
  const M = await openPage(browser, 'shot', { w: 390, h: 844, ua: UA_ANDROID, touch: true });
  await M.load('?mobile=1&mode=additive&n=12&gen=9&subformularing=both');
  await sleep(800);
  await M.shot('shot-mobile-light.png');
  await M.done();
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
    // dump and shot are aids, run only when named
    for (const [name, fn] of SCENARIOS) if (want(name) && (ONLY.includes(name) || !['dump', 'shot'].includes(name))) await fn(browser);
  }
} catch (e) {
  fails++;
  console.log('FAIL probe-crashed ' + (e && e.stack || e));
}
browser.close();
console.log(fails === 0 ? 'FORMULA-MAP-CHECK OK' : `FORMULA-MAP-CHECK FAIL: ${fails}`);
process.exit(fails === 0 ? 0 : 1);
