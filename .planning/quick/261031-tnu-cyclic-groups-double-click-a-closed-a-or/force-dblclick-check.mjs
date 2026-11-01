// CDP probe of Cyclic Groups' forced double-click on a closed a / a2 of the
// main view's formula maps (quick 261031-tnu). Built-ins only (global
// WebSocket and fetch); headless Google Chrome on a throwaway profile,
// killed and removed on exit. The infrastructure and the independent models
// of ℤ/nℤ, (ℤ/nℤ)* and curves are copied unchanged from pm3's
// log-base-boxes-check.mjs; every expectation comes from them.
//   node force-dblclick-check.mjs [model] [z12] [tie] [other] [units13] [curve]
//        [open] [single] [cancel] [pane] [ringwin]      (none: all of these)
//   node force-dblclick-check.mjs tap     a double tap on the phone page (INFO only)
//   node force-dblclick-check.mjs shot    screenshots into this dir
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
const PORT = 9347;
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
const profile = mkdtempSync(join(tmpdir(), 'cg-force-'));
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

/* ---------- an independent model of the maps ---------- */
const gcd = (a, b) => (b ? gcd(b, a % b) : a);
const mod = (x, m) => ((x % m) + m) % m;
const sg = v => (v < 0 ? '−' + -v : String(v));
const NODE_OF = t => (t.startsWith('abs-') ? 'abs' : t.startsWith('pos-') ? 'pos' : t);
const ROW_OF = t => (t.includes('gcd') ? 'gcd' : t.includes('lcm') ? 'lcm' : null);
const STEPS_ORDER = { jn: 1, 'gcd-full': 5, 'gcd-short': 4, 'lcm-full': 5, 'lcm-short': 4, abs: 5, pos: 4, 'gcd-sls': 4, 'lcm-sls': 4 };
const STEPS_INDEX = { jn: 1, 'gcd-full': 4, 'gcd-short': 3, 'lcm-full': 4, 'lcm-short': 3, abs: 4, pos: 3, 'gcd-sls': 3, 'lcm-sls': 3 };
const ALL_TOKENS = ['jn', 'gcd-short', 'gcd-full', 'lcm-short', 'lcm-full', 'abs-gcd', 'abs-lcm', 'pos-gcd', 'pos-lcm', 'gcd-sls', 'lcm-sls'];
// ℤ/nℤ: the log of h to the base g is the k in 1..n with k·g = h (0 for n).
function znModel(n) {
  const M = { kind: 'add', n, N: n, label: `⟨ℤ/${n}ℤ, +⟩`, name: `⟨ℤ/${n}ℤ, +⟩`, gn: String(n), sls: true };
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
  const M = { kind: 'mul', n, N, label: `⟨ℤ/${n}ℤ, ×⟩`, name: `⟨ℤ/${n}ℤ, ×⟩`, gn: `φ(${n})`, sls: false };
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
  // quick 261101-o20: a2 is a less its substitution step, open exactly when a is
  return { q, r, abs: r !== null, pos: r !== null, sls: M.sls };
}
// Where a knob on token t goes when only rc holds (the plan's D-02).
function settleModel(t, rc) {
  const row = ROW_OF(t);
  if ((t.startsWith('pos-') && !rc.pos) || (t.startsWith('abs-') && !rc.abs)) t = row + '-full';
  if (t.includes('sls') && !rc.sls) t = 'jn';
  return t;
}
// What each form's numbers are: the log form's q, the SLS forms' h (n for 0).
function vals(M, g, h, node) {
  const n = M.N, rc = reach(M, g, h);
  const q = node.endsWith('sls') ? (h === 0 ? n : h) : rc.q;
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
  pos: v => `|⟨${v.h}⟩| = |${v.group}| / |log_${v.g}(${v.h})| = ${v.n} / |${v.r}| = ${v.n} / ${v.a} = ${v.m}`,
  'gcd-sls': v => `|⟨${v.h}⟩| = |${v.group}| / gcd(|${v.group}|, ${v.h}) = ${v.n} / gcd(${v.n}, ${v.q}) = ${v.n} / ${v.d} = ${v.m}`,
  'lcm-sls': v => `|⟨${v.h}⟩| = lcm(|${v.group}|, ${v.q}) / ${v.q} = lcm(${v.n}, ${v.q}) / ${v.q} = ${v.l} / ${v.q} = ${v.m}`
};
const TI = {
  jn: v => `[${v.name} : ⟨${v.h}⟩] = ${v.d}`,
  'gcd-full': v => `[${v.name} : ⟨${v.h}⟩] = gcd(|${v.group}|, log_${v.g}(${v.h})) = gcd(${v.gn}, log_${v.g}(${v.gq})) = gcd(${v.n}, ${v.q}) = ${v.d}`,
  'gcd-short': v => `[${v.name} : ⟨${v.h}⟩] = gcd(|${v.group}|, log_${v.g}(${v.h})) = gcd(${v.n}, ${v.q}) = ${v.d}`,
  'lcm-full': v => `[${v.name} : ⟨${v.h}⟩] = |${v.group}| · log_${v.g}(${v.h}) / lcm(|${v.group}|, log_${v.g}(${v.h})) = ${v.gn} · log_${v.g}(${v.gq}) / lcm(${v.gn}, log_${v.g}(${v.gq})) = ${v.n} · ${v.q} / lcm(${v.n}, ${v.q}) = ${v.d}`,
  'lcm-short': v => `[${v.name} : ⟨${v.h}⟩] = |${v.group}| · log_${v.g}(${v.h}) / lcm(|${v.group}|, log_${v.g}(${v.h})) = ${v.n} · ${v.q} / lcm(${v.n}, ${v.q}) = ${v.d}`,
  abs: v => `[${v.name} : ⟨${v.h}⟩] = |log_${v.g}(${v.h})| = |log_${v.g}(${v.gr})| = |${v.r}| = ${v.a}`,
  pos: v => `[${v.name} : ⟨${v.h}⟩] = |log_${v.g}(${v.h})| = |${v.r}| = ${v.a}`,
  'gcd-sls': v => `[${v.name} : ⟨${v.h}⟩] = gcd(|${v.group}|, ${v.h}) = gcd(${v.n}, ${v.q}) = ${v.d}`,
  'lcm-sls': v => `[${v.name} : ⟨${v.h}⟩] = |${v.group}| · ${v.q} / lcm(|${v.group}|, ${v.q}) = ${v.n} · ${v.q} / lcm(${v.n}, ${v.q}) = ${v.d}`
};
const wantPair = (M, g, h, tokO, tokI) => {
  const nO = NODE_OF(tokO), nI = NODE_OF(tokI);
  return [TO[nO](vals(M, g, h, nO)), TI[nI](vals(M, g, h, nI))];
};
// The map state of every .fmap on the page: its formula, the position its
// knob is on, which radios are disabled, which is checked.
// A (ℤ/nℤ)* or a curve shows a slider pair (.fsl-pair, quick 261031-wef) in
// the map's place; its data-at is the same node id.
const mapsNow = P => P.ev(`Array.prototype.map.call(document.querySelectorAll('.fmap, .fsl-pair'), function(m){ if (m.classList.contains('fsl-pair')) return { f: m.getAttribute('data-f'), at: m.getAttribute('data-at'), checked: m.getAttribute('data-at'), off: [], n: 0, pair: true }; var all = Array.prototype.slice.call(m.querySelectorAll('input')); return { f: m.getAttribute('data-f'), at: m.getAttribute('data-at'), checked: (all.find(function(i){ return i.checked; }) || {}).value, off: all.filter(function(i){ return i.disabled || i.getAttribute('aria-disabled') === 'true'; }).map(function(i){ return i.value; }).sort(), n: all.length, labels: Array.prototype.map.call(m.querySelectorAll('svg text'), function(t){ return t.textContent; }).join(' ') }; })`);
const offWant = rc => [!rc.abs && 'abs', !rc.pos && 'pos', !rc.sls && 'gcd-sls', !rc.sls && 'lcm-sls'].filter(Boolean).sort();

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
  const M = { kind: 'ec', n: C.p, N: C.N, label: C.group, name: `${C.group}: ${eqn(C.a, C.b)}`, gn: String(C.N), sls: false, gens: C.gens, cyclic: C.cyclic, C };
  M.at = x => pt(C.pts[x]);
  M.pow = (g, k) => (mult ? `${k}·${M.at(g)}` : `${M.at(g)}^${k}`);
  M.log = (g, h) => C.log(g, h);
  return M;
}
const ZN = '?mobile=0&mode=additive&n=12&subformularow=both&subformularing=both';


/* ---------- helpers of this probe ---------- */
const SCENARIOS = [];
const centre = (P, sel, ctx) => P.ev(`(function(){var e=document.querySelector(${JSON.stringify(sel)});if(!e)return null;var r=e.getBoundingClientRect();return{x:r.left+r.width/2,y:r.top+r.height/2}})()`, ctx);
const wheelAt = (P, x, y, dy) => P.S('Input.dispatchMouseEvent', { type: 'mouseWheel', x, y, deltaX: 0, deltaY: dy });
// The row of boxes under the main formulas, as the page shows it right now.
const ROW_JS = `(function(){
  var row = document.querySelector('.ring-hover-formula .lb-row');
  if (!row) return null;
  var bs = Array.prototype.slice.call(row.querySelectorAll('.lb-box'));
  var inp = function(b){ return b.querySelector('input'); };
  var gOf = function(b){ return +b.getAttribute('data-g'); };
  var w = row.querySelector('.lb-scroll'), list = row.querySelector('.lb-list'), a = document.activeElement;
  return {
    texts: bs.map(function(b){ return b.textContent.trim(); }), values: bs.map(gOf),
    checked: bs.filter(function(b){ return inp(b).checked; }).map(gOf),
    off: bs.filter(function(b){ return inp(b).disabled; }).map(gOf),
    ok: bs.filter(function(b){ return b.classList.contains('is-flash-ok'); }).map(gOf),
    no: bs.filter(function(b){ return b.classList.contains('is-flash-no'); }).map(gOf),
    wheel: w ? w.getAttribute('aria-pressed') : null, role: list && list.getAttribute('role'), label: list && list.getAttribute('aria-label'),
    focus: a && a.closest ? (a.closest('.lb-scroll') ? 'wheel' : a.closest('.lb-box') ? +a.closest('.lb-box').getAttribute('data-g') : null) : null
  };
})()`;
const rowNow = (P, ctx) => P.ev(ROW_JS, ctx);
const sortN = a => a.slice().sort((x, y) => x - y);
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
// The generators the shown maps' knobs, settled for `base`, rule out: a box is off
// when a shown map sits on a (abs) or a2 (pos) and the box's base does not open it.
function offModel(M, h, base, toks) {
  const rc = reach(M, base, h);
  const nodes = toks.map(t => NODE_OF(settleModel(t, rc))).filter(n => n === 'abs' || n === 'pos');
  const off = M.gens.filter(g => { const r = reach(M, g, h); return nodes.some(n => !r[n]); });
  return off.length === M.gens.length ? [] : sortN(off);
}
const Z12 = znModel(12);
const ZNA = '?mobile=0&mode=additive&n=12&subformularow=both';

/* ---------- helpers of this probe ---------- */
const CURVE = '?mobile=0&curve=11,1,3&subformularow=both&subformularing=both';
const mapsIn = (P, ctx) => P.ev(`Array.prototype.map.call(document.querySelectorAll('.fmap, .fsl-pair'), function(m){ return { f: m.getAttribute('data-f'), at: m.getAttribute('data-at') }; })`, ctx);
const stopCentre = (P, f, id, ctx) => centre(P, `.fmap[data-f="${f}"] .fmap-stop[data-id="${id}"]`, ctx);
// The form slider's neither notch, a2 at compact and a at complete, where a
// (ℤ/nℤ)* or a curve has its map's a / a2.
const NEITHER = f => `.fsl-pair[data-f="${f}"] .fsl[data-kind="form"] .fsl-notch[data-v="1"]`;
// A real double-click: two presses, the second with clickCount 2 (Chrome then fires dblclick).
async function dbl(P, x, y) {
  await P.S('Input.dispatchMouseEvent', { type: 'mouseMoved', x, y });
  for (const n of [1, 2]) {
    await P.S('Input.dispatchMouseEvent', { type: 'mousePressed', x, y, button: 'left', clickCount: n });
    await sleep(25);
    await P.S('Input.dispatchMouseEvent', { type: 'mouseReleased', x, y, button: 'left', clickCount: n });
    await sleep(35);
  }
}
async function click1(P, x, y) {
  await P.S('Input.dispatchMouseEvent', { type: 'mouseMoved', x, y });
  await P.S('Input.dispatchMouseEvent', { type: 'mousePressed', x, y, button: 'left', clickCount: 1 });
  await sleep(25);
  await P.S('Input.dispatchMouseEvent', { type: 'mouseReleased', x, y, button: 'left', clickCount: 1 });
}
// An in-page sampler: every 40 ms for `ms`, which boxes carry which flash
// class, the checked box, the two maps' positions; t is relative to the last
// dblclick heard (null before any). A box marked __orig is the one present
// when the sampler started (to see a re-render).
const SAMPLER = ms => `(function(){
  window.__fs = []; window.__ft0 = null;
  if (!window.__fsHooked){ window.__fsHooked = true; document.addEventListener('dblclick', function(){ window.__ft0 = performance.now(); window.__fn = (window.__fn || 0) + 1; }, true); }
  window.__fn = 0;
  document.querySelectorAll('.ring-hover-formula .lb-box').forEach(function(b){ b.__orig = true; });
  var cls = function(c){ return Array.prototype.map.call(document.querySelectorAll('.ring-hover-formula .lb-box.' + c), function(b){ return +b.getAttribute('data-g'); }); };
  var t = setInterval(function(){
    var m = {}; document.querySelectorAll('.fmap, .fsl-pair').forEach(function(x){ m[x.getAttribute('data-f')] = x.getAttribute('data-at'); });
    var lit = document.querySelector('.ring-hover-formula .lb-list input:checked');
    var origs = Array.prototype.filter.call(document.querySelectorAll('.ring-hover-formula .lb-box'), function(b){ return b.__orig; }).length;
    window.__fs.push({ n: window.__fn, t: window.__ft0 === null ? null : Math.round(performance.now() - window.__ft0), pulse: cls('is-force-pulse'), set: cls('is-force-set'), ok: cls('is-flash-ok'), no: cls('is-flash-no'), base: lit ? +lit.value : null, maps: m, origs: origs });
  }, 40);
  setTimeout(function(){ clearInterval(t); }, ${ms});
  return 1;
})()`;
const samples = (P, ctx) => P.ev('window.__fs', ctx);
const after0 = s => s.filter(x => x.t !== null && x.t >= 0);
// The phases the picked box g goes through, in order, deduplicated.
function phasesOf(ss, g) {
  const ph = [];
  for (const s of ss) {
    const p = s.set.includes(g) ? 'set' : s.pulse.includes(g) ? 'pulse' : 'none';
    if (ph[ph.length - 1] !== p) ph.push(p);
  }
  return ph;
}
// The base a double-click on node picks, computed independently: the
// candidates ranked by distance to the current base's box, then by index from
// the right.
function pickModel(M, h, base, node) {
  const at = M.gens.indexOf(base);
  const cand = M.gens.map((g, i) => ({ g, i })).filter(c => reach(M, c.g, h)[node]);
  cand.sort((a, b) => Math.abs(a.i - at) - Math.abs(b.i - at) || b.i - a.i);
  return cand.length ? cand[0].g : null;
}
const TOK = { pos: 'pos-gcd', abs: 'abs-gcd' };
// Load, double-click the order map's node, sample, and check the whole run.
// opts.slider: a (ℤ/nℤ)* or a curve, whose formulas have sliders (quick
// 261031-wef): it loads at compact (gcd-short) for a2 and complete (gcd-full)
// for a, and double-clicks the form slider's neither notch.
const START = { pos: 'gcd-short', abs: 'gcd-full' };
async function forceRun(P, scen, name, url, M, h, base, node, opts = {}) {
  const pick = pickModel(M, h, base, node);
  const tok0 = opts.slider ? START[node] : 'gcd-full';
  if (opts.slider && tok0 !== 'gcd-full') url += `&fmaporder=${tok0}`;
  await P.load(url);
  await P.enter();
  const r0 = await rowNow(P);
  out(!!r0 && same(r0.checked, [base]) && !reach(M, base, h)[node], scen, `${name}: starts on base ${M.at(base)} with ${node === 'pos' ? 'a2' : 'a'} closed`, r0 && r0.checked);
  await P.ev(SAMPLER(3200));
  const c = opts.slider ? await centre(P, NEITHER('order')) : await stopCentre(P, 'order', node);
  await dbl(P, c.x, c.y);
  await sleep(3000);
  const ss = after0(await samples(P));
  const ph = phasesOf(ss, pick);
  out(same(ph, ['pulse', 'set', 'none']), scen, `${name}: box ${M.at(pick)} pulses, then flashes as the chosen base, then rests`, { ph, pick });
  const firstSet = ss.find(s => s.set.includes(pick)), lastOn = ss.filter(s => s.set.length || s.pulse.length).pop();
  out(!!firstSet && firstSet.t >= 1000 && firstSet.t <= 1450 && !!lastOn && lastOn.t <= 2500, scen, `${name}: the base is set at about 1.1 s, the flashing ends by 2.5 s`, { set: firstSet && firstSet.t, end: lastOn && lastOn.t });
  const pulses = ss.filter(s => s.pulse.length);
  out(pulses.length > 0 && pulses.every(s => s.base === base && s.maps.order === tok0), scen, `${name}: while it pulses the base and the knob stay`, pulses.slice(0, 2));
  out(!!firstSet && firstSet.base === pick && firstSet.maps.order === node, scen, `${name}: with the last flash the base is ${M.at(pick)} and the knob on ${node === 'pos' ? 'a2' : 'a'}`, firstSet);
  out(ss.every(s => s.no.length === 0 && s.ok.length === 0) && ss.every(s => s.pulse.every(g => g === pick) && s.set.every(g => g === pick)), scen, `${name}: no green/red hint flash after the double-click, and only box ${M.at(pick)} flashes`, ss.find(s => s.no.length || s.ok.length));
  const q = new URLSearchParams(await P.q()), maps = await mapsNow(P), f = await P.formulas();
  out(q.get('logbase') === String(pick) && q.get('fmaporder') === TOK[node], scen, `${name}: url logbase=${pick}, fmaporder=${TOK[node]}`, Object.fromEntries(q));
  const tokI = opts.index || 'gcd-full';
  out(maps.find(m => m.f === 'index').at === NODE_OF(tokI) && same(plains(f.ring), wantPair(M, pick, h, TOK[node], tokI)), scen, `${name}: the formulas take log base ${M.at(pick)}, the index map stays at ${tokI}`, { ring: plains(f.ring), want: wantPair(M, pick, h, TOK[node], tokI) });
  return pick;
}

/* ---------- models: the two facts the plan leans on ---------- */
SCENARIOS.push(['model', async () => {
  const groups = [];
  for (let n = 2; n <= 40; n++) groups.push(znModel(n));
  for (const n of [5, 7, 9, 10, 11, 13, 14, 17, 18, 19, 22, 23, 25, 26, 27, 29, 31]) { const U = unitsModel(n); if (U.cyclic) groups.push(U); }
  groups.push(ecAdapter(curveModel(11, 1, 3), false));
  let closedNoBase = 0, closedTotal = 0, snaps = 0, apart = 0;
  for (const M of groups) for (let h = 0; h < M.N; h++) {
    if (M.kind === 'mul' && gcd(h, M.n) !== 1) continue;
    for (const b of M.gens) if (reach(M, b, h).pos !== reach(M, b, h).abs) apart++;
    for (const b of M.gens) for (const node of ['abs', 'pos']) {
      if (reach(M, b, h)[node]) continue;
      closedTotal++;
      const g = pickModel(M, h, b, node);
      if (g === null) { closedNoBase++; continue; }
      // the other map on a or a2, open under b: does the forced base close it?
      for (const o of ['abs', 'pos']) if (reach(M, b, h)[o] && !reach(M, g, h)[o]) snaps++;
    }
  }
  out(closedTotal > 0 && closedNoBase === 0, 'model', `every closed a / a2 (${closedTotal} cases over ${groups.length} cyclic groups) has a base that opens it`, closedNoBase);
  out(snaps === 0, 'model', 'a forced base never closes the other map\'s open a / a2 (a2 and a open together, both maps share h and base)', snaps);
  out(apart === 0, 'model', 'quick 261101-o20: a2 is open exactly when a is, every h and base of every group', apart);
}]);

/* ---------- z12: the two cases the task names ---------- */
SCENARIOS.push(['z12', async browser => {
  const P = await openPage(browser, 'z12', { w: 1280, h: 900, ua: UA_DESKTOP });
  out(pickModel(Z12, 7, 1, 'pos') === 5 && same(sortN(Z12.gens.filter(g => reach(Z12, g, 7).pos)), [5, 7]) && same(sortN(Z12.gens.filter(g => reach(Z12, g, 7).abs)), [5, 7]) && pickModel(Z12, 7, 1, 'abs') === 5, 'z12', 'model: h=7 base 1, a2 and a both by {5, 7}, nearest 5');
  await forceRun(P, 'z12', 'ℤ/12ℤ h=7 base 1, a2', `${ZN}&gen=7&logbase=1`, Z12, 7, 1, 'pos');
  await forceRun(P, 'z12', 'ℤ/12ℤ h=7 base 1, a', `${ZN}&gen=7&logbase=1`, Z12, 7, 1, 'abs');
  noErrors(P, 'z12');
  await P.done();
}]);

/* ---------- tie: two suitable bases at the same distance, the right one wins ---------- */
SCENARIOS.push(['tie', async browser => {
  let found = null;
  for (let n = 5; n <= 30 && !found; n++) {
    const M = znModel(n);
    for (let h = 1; h < n && !found; h++) for (const b of M.gens) for (const node of ['pos', 'abs']) {
      if (found || reach(M, b, h)[node]) continue;
      const at = M.gens.indexOf(b);
      const ds = M.gens.map((g, i) => ({ g, i })).filter(c => reach(M, c.g, h)[node]).map(c => ({ ...c, d: Math.abs(c.i - at) }));
      const dmin = Math.min(...ds.map(c => c.d)), top = ds.filter(c => c.d === dmin);
      if (top.length === 2) found = { M, n, h, b, node, left: top[0].g, right: top[1].g };
    }
  }
  out(!!found, 'tie', found ? `found ℤ/${found.n}ℤ h=${found.h} base ${found.b} ${found.node === 'pos' ? 'a2' : 'a'}: ${found.left} and ${found.right} equally near` : 'a tie case exists');
  if (!found) return;
  out(pickModel(found.M, found.h, found.b, found.node) === found.right, 'tie', `model picks the right one, ${found.right}`);
  const P = await openPage(browser, 'tie', { w: 1280, h: 900, ua: UA_DESKTOP });
  await forceRun(P, 'tie', `ℤ/${found.n}ℤ h=${found.h} base ${found.b}`, `?mobile=0&mode=additive&n=${found.n}&subformularow=both&subformularing=both&gen=${found.h}&logbase=${found.b}`, found.M, found.h, found.b, found.node);
  noErrors(P, 'tie');
  await P.done();
}]);

/* ---------- other: the other map keeps its own position ---------- */
// Since quick 261101-o20 a2 and a open together, so the other map can no
// longer sit on an open a while a2 is closed: an a asked of it under the
// same base settles to its full form, and the forced a2 leaves it there.
SCENARIOS.push(['other', async browser => {
  const P = await openPage(browser, 'other', { w: 1280, h: 900, ua: UA_DESKTOP });
  let apart = 0;
  for (let h = 0; h < 12; h++) for (const b of Z12.gens) if (reach(Z12, b, h).abs !== reach(Z12, b, h).pos) apart++;
  out(apart === 0 && !reach(Z12, 1, 7).abs && pickModel(Z12, 7, 1, 'pos') === 5, 'other', 'model: no h and base of ℤ/12ℤ opens a with a2 closed; h=7 base 1 shuts both, a2 is forced by 5', apart);
  await forceRun(P, 'other', 'ℤ/12ℤ h=7 base 1, index map asked for a (abs-lcm, settles to lcm-full), order map a2', `${ZN}&gen=7&logbase=1&fmapindex=abs-lcm`, Z12, 7, 1, 'pos', { index: 'lcm-full' });
  out((await P.param('fmapindex')) === 'lcm-full', 'other', 'the index map stays on LCM (full), where it settled (fmapindex=lcm-full)', await P.q());
  noErrors(P, 'other');
  await P.done();
}]);

/* ---------- units13 and a cyclic curve ---------- */
SCENARIOS.push(['units13', async browser => {
  const P = await openPage(browser, 'units13', { w: 1280, h: 900, ua: UA_DESKTOP });
  const U = unitsModel(13);
  // h = 6 (log_2 6 = 5): a2 and a both closed under base 2 (h = 5, r = −3, opens both since 261101-o20)
  const url = '?mobile=0&mode=multiplicative&n=13&subformularow=both&subformularing=both&gen=6&logbase=2';
  let ran = 0;
  for (const node of ['pos', 'abs']) {
    if (reach(U, 2, 6)[node]) continue;
    ran++;
    await forceRun(P, 'units13', `(ℤ/13ℤ)* h=6 base 2, ${node === 'pos' ? 'a2' : 'a'} -> ${pickModel(U, 6, 2, node)}`, url, U, 6, 2, node, { slider: true });
  }
  out(ran === 2, 'units13', `(ℤ/13ℤ)* h=6 base 2 has ${ran} closed position(s) to force (a2 and a)`);
  noErrors(P, 'units13');
  await P.done();
}]);
SCENARIOS.push(['curve', async browser => {
  const P = await openPage(browser, 'curve', { w: 1280, h: 900, ua: UA_DESKTOP });
  const E = ecAdapter(curveModel(11, 1, 3), false);
  let hit = null;
  for (let h = 1; h < E.N && !hit; h++) for (const b of E.gens.slice(1)) if (!hit && !reach(E, b, h).pos && pickModel(E, h, b, 'pos') !== null) hit = { h, b };
  out(!!hit, 'curve', hit ? `E(𝔽₁₁) h=${E.at(hit.h)} base ${E.at(hit.b)}: a2 closed, forced by ${E.at(pickModel(E, hit.h, hit.b, 'pos'))}` : 'a closed a2 on the curve');
  if (hit) await forceRun(P, 'curve', `curve h=${E.at(hit.h)} base ${E.at(hit.b)}`, `${CURVE}&gen=${hit.h}&logbase=${hit.b}`, E, hit.h, hit.b, 'pos', { slider: true });
  noErrors(P, 'curve');
  await P.done();
}]);

/* ---------- open: a double-click on an open position is a click ---------- */
SCENARIOS.push(['open', async browser => {
  const P = await openPage(browser, 'open', { w: 1280, h: 900, ua: UA_DESKTOP });
  for (const id of ['lcm-short', 'jn', 'gcd-sls']) {
    await P.load(`${ZN}&gen=7&logbase=1`);
    await P.enter();
    await P.ev(SAMPLER(1800));
    const c = await stopCentre(P, 'order', id);
    await dbl(P, c.x, c.y);
    await sleep(1700);
    const ss = await samples(P);
    const at = (await mapsNow(P)).find(m => m.f === 'order').at;
    out(at === id && (await P.param('logbase')) === '1' && ss.every(s => !s.pulse.length && !s.set.length), 'open', `a double-click on ${id}: the knob there, base 1, nothing forced`, { at, q: await P.q() });
  }
  noErrors(P, 'open');
  await P.done();
}]);

/* ---------- slshide: no base row while every shown map sits on an SLS form ---------- */
SCENARIOS.push(['slshide', async browser => {
  const P = await openPage(browser, 'slshide', { w: 1280, h: 900, ua: UA_DESKTOP });
  await P.load(`${ZN}&gen=7&logbase=1&fmaporder=gcd-sls&fmapindex=lcm-sls`);
  await P.enter();
  out((await rowNow(P)) === null && (await P.ev(`!document.querySelector('.lb-lock, .lb-scroll')`)), 'slshide', 'both maps on SLS: no boxes, no padlock, no wheel switch');
  await P.load(`${ZN}&gen=7&logbase=1&fmaporder=gcd-sls&fmapindex=gcd-full`);
  await P.enter();
  out((await rowNow(P)) !== null, 'slshide', 'one map on SLS, the other on GCD (full): the row stays');
  await P.load(`?mobile=0&mode=additive&n=12&subformularow=both&subformularing=order&gen=7&logbase=1&fmaporder=lcm-sls`);
  await P.enter();
  out((await rowNow(P)) === null, 'slshide', 'only the size formula shown, on LCM (SLS): no row');
  await P.load(`${ZN}&gen=7&logbase=1&fmaporder=gcd-sls&fmapindex=lcm-sls`);
  await P.enter();
  const c = await stopCentre(P, 'order', 'pos');
  await dbl(P, c.x, c.y);
  await sleep(300);
  const r = await rowNow(P);
  const setPick = await P.ev(`!!document.querySelector('.lb-box[data-g="5"].is-force-set')`);
  out(r !== null && same(r.checked, [5]) && setPick && (await P.param('logbase')) === '5' && (await P.param('fmaporder')) === 'pos-gcd' && (await P.param('fmapindex')) === 'lcm-sls', 'slshide', 'both on SLS, a double-click on the closed a2: base 5 (nearest of 5, 7) and a2 at once, the row back with 5 flashing', { r, setPick, q: await P.q() });
  await sleep(1400);
  out(!(await P.ev(`!!document.querySelector('.lb-box.is-force-set, .lb-box.is-force-pulse')`)), 'slshide', 'the flash is over');
  noErrors(P, 'slshide');
  await P.done();
}]);

/* ---------- single: one click still only hints ---------- */
SCENARIOS.push(['single', async browser => {
  const P = await openPage(browser, 'single', { w: 1280, h: 900, ua: UA_DESKTOP });
  await P.load(`${ZN}&gen=7&logbase=1`);
  await P.enter();
  await P.ev(SAMPLER(2000));
  const c = await stopCentre(P, 'order', 'pos');
  await click1(P, c.x, c.y);
  await sleep(250);
  const r = await rowNow(P);
  out(same(sortN(r.ok), [5, 7]) && same(sortN(r.no), [1, 11]), 'single', 'a single click on the closed a2: green 5, 7, red 1, 11 (as a)', r);
  await sleep(1900);
  const ss = await samples(P);
  out((await P.param('logbase')) === '1' && (await P.param('fmaporder')) === null && ss.every(s => !s.pulse.length && !s.set.length), 'single', 'and nothing more: base 1, knob on GCD (full), no forced flash', await P.q());
  noErrors(P, 'single');
  await P.done();
}]);

/* ---------- cancel: what ends a sequence, and what does not ---------- */
SCENARIOS.push(['cancel', async browser => {
  const P = await openPage(browser, 'cancel', { w: 1280, h: 900, ua: UA_DESKTOP });
  const start = async () => {
    await P.load(`${ZN}&gen=7&logbase=1`);
    await P.enter();
    await P.ev(SAMPLER(3400));
    const c = await stopCentre(P, 'order', 'pos');
    await dbl(P, c.x, c.y);
    await sleep(350);
  };
  const quiet = ss => ss.every(s => !s.pulse.length && !s.set.length);
  // a base box clicked mid-sequence
  await start();
  let b = await centre(P, '.ring-hover-formula .lb-box[data-g="11"]');
  await click1(P, b.x, b.y);
  await sleep(2600);
  let ss = await samples(P);
  out((await P.param('logbase')) === '11' && (await P.param('fmaporder')) === null && quiet(ss.slice(-20)), 'cancel', 'box 11 clicked while it pulses: base 11, the knob not forced, no flash left', { q: await P.q(), last: ss[ss.length - 1] });
  // a single click on the closed a mid-sequence: its hint, and no forced base
  await start();
  let c = await stopCentre(P, 'order', 'abs');
  await click1(P, c.x, c.y);
  await sleep(250);
  const r = await rowNow(P);
  out(same(sortN(r.ok), [5, 7]) && same(sortN(r.no), [1, 11]), 'cancel', 'a click on the closed a while it pulses shows a\'s hint (green 5, 7)', r);
  await sleep(2400);
  ss = await samples(P);
  out((await P.param('logbase')) === '1' && (await P.param('fmaporder')) === null && quiet(ss.slice(-30)), 'cancel', '... and the sequence is over: base 1, knob on GCD (full)', await P.q());
  // a second double-click mid-sequence: the second one runs
  await start();
  c = await stopCentre(P, 'order', 'abs');
  await dbl(P, c.x, c.y);
  await sleep(2900);
  ss = (await samples(P)).filter(s => s.n === 2);
  // a2 and a now pick the same base (5): the second run shows by its knob (abs-gcd) and its own timing
  const set2 = ss.find(s => s.set.includes(5));
  out((await P.param('logbase')) === '5' && (await P.param('fmaporder')) === 'abs-gcd' && same(phasesOf(ss, 5), ['pulse', 'set', 'none']) && !!set2 && set2.t >= 1000 && ss.every(s => !s.pulse.includes(7) && !s.set.includes(7)), 'cancel', 'a double-click on a while a2\'s sequence runs: a\'s runs instead (base 5, abs-gcd, set about 1.1 s after the second double-click), box 7 left alone', { q: await P.q(), ph: phasesOf(ss, 5), set: set2 && set2.t });
  // a re-render with nothing changed (a language switch) carries the pulse over
  await start();
  await P.ev(`NT.i18n.setLang('nl')`);
  await sleep(2700);
  ss = after0(await samples(P));
  const carried = ss.filter(s => s.origs === 0 && s.pulse.includes(5));
  out(carried.length > 0, 'cancel', 'a language switch mid-pulse rebuilds the row and the new box 5 keeps pulsing', ss.slice(0, 12).map(s => [s.t, s.origs, s.pulse]));
  out((await P.param('logbase')) === '5' && (await P.param('fmaporder')) === 'pos-gcd' && same(phasesOf(ss, 5), ['pulse', 'set', 'none']), 'cancel', '... and the sequence completes (base 5, pos-gcd)', { q: await P.q(), ph: phasesOf(ss, 5) });
  await P.ev(`NT.i18n.setLang('en')`);
  // a new h mid-sequence ends it
  await start();
  await P.clickEl('.subgroup-row[data-gen="5"]');
  await sleep(2600);
  ss = await samples(P);
  out((await P.param('gen')) === '5' && (await P.param('logbase')) === '1' && (await P.param('fmaporder')) === null && quiet(ss.slice(-30)), 'cancel', 'another subgroup chosen while it pulses: base 1 stays, nothing forced, no flash left', await P.q());
  noErrors(P, 'cancel');
  await P.done();
}]);

/* ---------- pane: the same in the isomorphism pane, reported to the host ---------- */
async function openPane(P, query, chip) {
  await P.load(query);
  await P.enter();
  const hit = await P.ev(`(function(){var cs=Array.prototype.filter.call(document.querySelectorAll('#iso-panel a.iso-chip'), function(a){ return a.textContent.indexOf(${JSON.stringify(chip)}) !== -1; }); if (cs[0]) cs[0].click(); return cs.length;})()`);
  if (!hit) return null;
  for (let i = 0; i < 30; i++) {
    await sleep(300);
    const c = await P.paneCtx();
    if (c && (await P.ev(`document.querySelectorAll('.fmap, .fsl-pair').length`, c)) === 2 && (await P.ev(`!!document.querySelector('.lb-row')`, c))) { await sleep(800); return c; }
  }
  return null;
}
SCENARIOS.push(['pane', async browser => {
  const P = await openPage(browser, 'pane', { w: 1500, h: 900, ua: UA_DESKTOP });
  const U = unitsModel(13);
  const ctx = await openPane(P, '?mobile=0&mode=additive&n=12&gen=1&subformularing=both&subformularingr=both', 'ℤ/13ℤ,×');
  out(!!ctx, 'pane', 'the pane opens on (ℤ/13ℤ)*');
  if (!ctx) { noErrors(P, 'pane'); await P.done(); return; }
  const plain = await P.ev(`document.querySelector('.ring-hover-formula math.ring-math-formula').getAttribute('data-plain')`, ctx);
  const h = +(/⟨(\d+)⟩/.exec(plain) || [])[1];
  // a pane base under which a2 is closed and some other base opens it
  const base = U.gens.find(b => !reach(U, b, h).pos);
  out(Number.isInteger(h) && base !== undefined, 'pane', `the pane's h = ${h}; base ${base} closes a2`, plain);
  if (base === undefined) { noErrors(P, 'pane'); await P.done(); return; }
  await P.ev(`document.querySelector('.lb-box[data-g="${base}"] input').click()`, ctx);
  await sleep(1200);
  const pick = pickModel(U, h, base, 'pos');
  // the pane's (ℤ/13ℤ)* has sliders: compact first, then the closed neither (a2) double-clicked
  await P.ev(`document.querySelector('.fsl-pair[data-f="order"] .fsl[data-kind="complexity"] .fsl-notch[data-v="1"]').click()`, ctx);
  await sleep(1200);
  await P.ev(`(function(){ var i = document.querySelector('${NEITHER('order')}'); i.click(); i.click(); i.dispatchEvent(new MouseEvent('dblclick', { bubbles: true })); return i.className; })()`, ctx);
  await sleep(500);
  const mid = await rowNow(P, ctx);
  out(mid && mid.checked[0] === base && (await P.ev(`Array.prototype.map.call(document.querySelectorAll('.lb-box.is-force-pulse'), function(b){ return +b.getAttribute('data-g'); })`, ctx)).join() === String(pick), 'pane', `in the pane box ${pick} pulses, the base still ${base}`, mid);
  await sleep(2600);
  const q = await hostQ(P), pr = await rowNow(P, ctx), pm = await mapsIn(P, ctx);
  out(q.get('logbaser') === String(pick) && q.get('fmaporderr') === 'pos-gcd' && same(pr.checked, [pick]) && pm.find(m => m.f === 'order').at === 'pos', 'pane', `after it: the pane on base ${pick} with its order map on a2; the host url logbaser=${pick}, fmaporderr=pos-gcd`, { q: Object.fromEntries(q), pane: pr.checked, maps: pm.map(m => m.at) });
  out(q.get('logbase') === '1' && q.get('fmaporder') === null, 'pane', 'the host\'s own base and maps are untouched', Object.fromEntries(q));
  noErrors(P, 'pane');
  await P.done();
}]);
const hostQ = async P => new URLSearchParams(await P.q());

/* ---------- ringwin: an extra Ring window does the same ---------- */
// The window runs in an iframe of a host page, as the desktop opens it; its
// state reaches the parent as { ringwin: 'state', q } messages.
SCENARIOS.push(['ringwin', async browser => {
  const P = await openPage(browser, 'ringwin', { w: 1280, h: 900, ua: UA_DESKTOP });
  await P.load(`${ZN}&gen=1`);
  await P.enter();
  const src = new URL('?ringwin=1&mobile=0&mode=additive&n=12&gen=7&subformularing=both&logbase=1', URL_BASE).href;
  await P.ev(`(function(){ window.__rw = []; window.addEventListener('message', function(e){ if (e.data && e.data.ringwin === 'state') window.__rw.push(e.data.q); }); var f = document.createElement('iframe'); f.id = 'probe-rw'; f.style.cssText = 'position:fixed;left:0;top:0;width:900px;height:800px;z-index:99999;border:0'; f.src = ${JSON.stringify(src)}; document.body.appendChild(f); return 1; })()`);
  let ctx = null;
  for (let i = 0; i < 30 && !ctx; i++) {
    await sleep(300);
    const c = await P.paneCtx();
    if (c && (await P.ev(`document.querySelectorAll('.fmap').length === 2 && !!document.querySelector('.lb-row')`, c).catch(() => false))) ctx = c;
  }
  out(!!ctx, 'ringwin', 'a ?ringwin=1 window in an iframe shows both maps and the row');
  if (!ctx) { noErrors(P, 'ringwin'); await P.done(); return; }
  await sleep(600);
  await P.ev(`(function(){ var i = document.querySelector('.fmap[data-f="order"] .fmap-stop[data-id="pos"] input'); i.click(); i.click(); i.parentNode.dispatchEvent(new MouseEvent('dblclick', { bubbles: true })); return 1; })()`, ctx);
  await sleep(500);
  const mid = await P.ev(`Array.prototype.map.call(document.querySelectorAll('.lb-box.is-force-pulse'), function(b){ return +b.getAttribute('data-g'); })`, ctx);
  out(same(mid, [5]), 'ringwin', 'box 5 pulses in the window (a2 opens under 5 and 7, 5 the nearer)', mid);
  await sleep(2600);
  const r = await rowNow(P, ctx), m = await mapsIn(P, ctx);
  const last = new URLSearchParams((await P.ev('window.__rw')).pop() || '');
  out(same(r.checked, [5]) && m.find(x => x.f === 'order').at === 'pos', 'ringwin', 'the window ends on base 5 with its order map on a2', { checked: r.checked, maps: m });
  out(last.get('logbase') === '5' && last.get('fmaporder') === 'pos-gcd' && last.get('ringwin') !== null, 'ringwin', 'its last state message to the parent carries logbase=5, fmaporder=pos-gcd', Object.fromEntries(last));
  const host = new URLSearchParams(await P.q());
  out(host.get('logbase') === '1' && host.get('fmaporder') === null, 'ringwin', 'the host page\'s own base and maps are untouched', Object.fromEntries(host));
  noErrors(P, 'ringwin');
  await P.done();
}]);

/* ---------- tap: a double tap on the phone page (information only) ---------- */
SCENARIOS.push(['tap', async browser => {
  const P = await openPage(browser, 'tap', { w: 390, h: 844, ua: UA_ANDROID, touch: true });
  await P.load('?mobile=1&mode=additive&n=12&gen=7&logbase=1&subformularing=both');
  await sleep(1000);
  await P.ev(`document.querySelector('.fmap[data-f="order"]').scrollIntoView({ block: 'center' })`);
  await sleep(300);
  const c = await stopCentre(P, 'order', 'pos');
  const tap = async () => {
    await P.S('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: c.x, y: c.y }] });
    await sleep(30);
    await P.S('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  };
  if (c) { await tap(); await sleep(120); await tap(); }
  await sleep(2800);
  console.log(`INFO tap a double tap on the phone page's closed a2 ends on logbase=${await P.param('logbase')}, fmaporder=${await P.param('fmaporder')}`);
  noErrors(P, 'tap');
  await P.done();
}]);

/* ---------- shot: the sequence in the light theme ---------- */
SCENARIOS.push(['shot', async browser => {
  const P = await openPage(browser, 'shot', { w: 1280, h: 900, ua: UA_DESKTOP });
  await P.S('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: 'light' }] });
  await P.load(`${ZN}&gen=7&logbase=1`);
  await P.enter();
  const r = await P.rect('.ring-hover-formula');
  const clip = { x: Math.max(0, r.x - 8), y: Math.max(0, r.y - 8), width: Math.min(r.w + 16, 1280), height: r.h + 16 };
  const c = await stopCentre(P, 'order', 'pos');
  await dbl(P, c.x, c.y);
  await sleep(180);
  await P.shot('shot-force-pulse-light.png', clip);
  await sleep(1150);
  await P.shot('shot-force-set-light.png', clip);
  await P.done();
}]);

const browser = await connect();
try {
  for (const [name, fn] of SCENARIOS) if (want(name) && (ONLY.includes(name) || !['shot', 'tap'].includes(name))) await fn(browser);
} catch (e) {
  fails++;
  console.log('FAIL probe-crashed ' + (e && e.stack || e));
}
browser.close();
console.log(fails === 0 ? 'FORCE-DBLCLICK-CHECK OK' : `FORCE-DBLCLICK-CHECK FAIL: ${fails}`);
// Chrome's helper processes outlive a SIGKILL of the browser for a moment and
// write into the profile, so a removal straight after the kill leaves it
// behind: wait for the browser to exit, then remove it, retrying briefly.
const gone = new Promise(res => chrome.once('exit', res));
try { chrome.kill('SIGKILL'); } catch (e) {}
await Promise.race([gone, sleep(3000)]);
for (let i = 0; i < 10; i++) {
  try { rmSync(profile, { recursive: true, force: true }); } catch (e) {}
  await sleep(300);
  if (!existsSync(profile)) break;
}
process.exit(fails === 0 ? 0 : 1);
