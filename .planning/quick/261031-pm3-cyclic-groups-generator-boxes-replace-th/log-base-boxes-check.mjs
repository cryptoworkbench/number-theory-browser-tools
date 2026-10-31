// CDP probe of Cyclic Groups' row of generator boxes under the main view's
// formulas (the chosen base of the logarithm). Built-ins only (global
// WebSocket and fetch); headless Google Chrome on a throwaway profile,
// killed on exit. Every expectation comes from the independent models below
// (copied unchanged from the formula-map probe), never from the page.
//   node log-base-boxes-check.mjs [boxes] [fits] [click] [legacy] [gone] [syntax]
//        [flash] [wheel] [keys] [wide] [mobile] [pane] [ringwin] [chiplinks]
//                                                         (none: all but shot)
//   node log-base-boxes-check.mjs shot              screenshots into this dir
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
const PORT = 9346;
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
const profile = mkdtempSync(join(tmpdir(), 'cg-lbase-'));
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
  return { q, r, abs: r !== null, pos: n % q === 0, sls: M.sls };
}
// Where a knob on token t goes when only rc holds (the plan's D-02).
function settleModel(t, rc) {
  const row = ROW_OF(t);
  if (t.startsWith('pos-') && !rc.pos) t = rc.abs ? 'abs-' + row : row + '-full';
  if (t.startsWith('abs-') && !rc.abs) t = row + '-full';
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
  pos: v => `|⟨${v.h}⟩| = |${v.group}| / log_${v.g}(${v.h}) = ${v.gn} / log_${v.g}(${v.gr}) = ${v.n} / ${v.r} = ${v.m}`,
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
  pos: v => `[${v.name} : ⟨${v.h}⟩] = log_${v.g}(${v.h}) = log_${v.g}(${v.gr}) = ${v.r}`,
  'gcd-sls': v => `[${v.name} : ⟨${v.h}⟩] = gcd(|${v.group}|, ${v.h}) = gcd(${v.n}, ${v.q}) = ${v.d}`,
  'lcm-sls': v => `[${v.name} : ⟨${v.h}⟩] = |${v.group}| · ${v.q} / lcm(|${v.group}|, ${v.q}) = ${v.n} · ${v.q} / lcm(${v.n}, ${v.q}) = ${v.d}`
};
const wantPair = (M, g, h, tokO, tokI) => {
  const nO = NODE_OF(tokO), nI = NODE_OF(tokI);
  return [TO[nO](vals(M, g, h, nO)), TI[nI](vals(M, g, h, nI))];
};
// The map state of every .fmap on the page: its formula, the position its
// knob is on, which radios are disabled, which is checked.
const mapsNow = P => P.ev(`Array.prototype.map.call(document.querySelectorAll('.fmap'), function(m){ var all = Array.prototype.slice.call(m.querySelectorAll('input')); return { f: m.getAttribute('data-f'), at: m.getAttribute('data-at'), checked: (all.find(function(i){ return i.checked; }) || {}).value, off: all.filter(function(i){ return i.disabled || i.getAttribute('aria-disabled') === 'true'; }).map(function(i){ return i.value; }).sort(), n: all.length, labels: Array.prototype.map.call(m.querySelectorAll('svg text'), function(t){ return t.textContent; }).join(' ') }; })`);
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

/* ---------- boxes: one box per generator, as the formulas write it ---------- */
SCENARIOS.push(['boxes', async browser => {
  const P = await openPage(browser, 'boxes', { w: 1280, h: 900, ua: UA_DESKTOP });
  const C11 = curveModel(11, 1, 3), C35 = compositeModel(35, 3, 3);
  const cases = [
    ['zn12', Z12, `${ZN}&gen=9`, 9, 1],
    ['units13', unitsModel(13), '?mobile=0&mode=multiplicative&n=13&expr=2&subformularow=both&subformularing=both&gen=5', 5, 2],
    ['curve11', ecAdapter(C11, false), `${CURVE}&gen=1&expr=8`, 1, 8],
    ['composite35', ecAdapter(C35, false), `?mobile=0&curve=35,3,3&subformularow=both&subformularing=both&gen=1&expr=${C35.gens[0]}`, 1, C35.gens[0]]
  ];
  out(Z12.gens.join() === '1,5,7,11' && unitsModel(13).gens.join() === '2,6,7,11' && C11.gens.length === 6 && C35.gens.length === 8, 'boxes', 'models-have-4, 4, 6 and 8 generators');
  for (const [name, M, url, h, base] of cases) {
    await P.load(url);
    await P.enter();
    const r = await rowNow(P);
    out(!!r && same(r.values, M.gens) && same(r.texts, M.gens.map(g => M.at(g))), 'boxes', `${name}: one box per generator, in generator order, written as the formulas write them`, r && { values: r.values, texts: r.texts, want: M.gens.map(g => M.at(g)) });
    out(!!r && same(r.checked, [base]) && r.role === 'radiogroup' && r.label === 'Base of the logarithm', 'boxes', `${name}: the base ${M.at(base)} is the checked box, the list a labelled radiogroup`, r && { checked: r.checked, role: r.role, label: r.label });
    out(!!r && r.off.length === 0, 'boxes', `${name}: at GCD (full) every box is enabled`, r && r.off);
    out((await P.param('logbase')) === String(base), 'boxes', `${name}: the url shows logbase=${base}`, await P.q());
    const f = await P.formulas();
    out(same(plains(f.ring), wantPair(M, base, h, 'gcd-full', 'gcd-full')), 'boxes', `${name}: the formulas take log base ${M.at(base)}`, { got: plains(f.ring), want: wantPair(M, base, h, 'gcd-full', 'gcd-full') });
  }
  // no maps, no row; no formula in the main view, no row
  for (const [name, url] of [['units8 (not cyclic)', '?mobile=0&mode=multiplicative&n=8&gen=3&subformularow=both&subformularing=both'], ['curve 7,0,1 (not cyclic)', '?mobile=0&curve=7,0,1&gen=1&subformularow=both&subformularing=both'], ['zn12 with the main formulas hidden', '?mobile=0&mode=additive&n=12&gen=9&subformularow=both']]) {
    await P.load(url);
    await P.enter();
    out(!(await P.exists('.lb-row')) && !(await P.exists('.fmap')), 'boxes', `${name}: no row of boxes`);
  }
  // both maps on JN: the row still shows, every box enabled
  await P.load(`${ZN}&gen=9&fmaporder=jn&fmapindex=jn`);
  await P.enter();
  let r = await rowNow(P);
  out(!!r && same(r.values, Z12.gens) && r.off.length === 0, 'boxes', 'both maps on JN: the row shows, every box enabled', r);
  // SLS leaves every box enabled too
  await P.load(`${ZN}&gen=9&fmaporder=gcd-sls&fmapindex=lcm-sls`);
  await P.enter();
  r = await rowNow(P);
  out(!!r && r.off.length === 0, 'boxes', 'SLS positions: every box enabled', r);
  noErrors(P, 'boxes');
  await P.done();
}]);
const CURVE = '?mobile=0&curve=11,1,3&subformularow=both&subformularing=both';

/* ---------- fits: a box is off when a shown map's a or a2 would not open ---------- */
SCENARIOS.push(['fits', async browser => {
  const P = await openPage(browser, 'fits', { w: 1280, h: 900, ua: UA_DESKTOP });
  const cases = [
    ['h=7 base 5 order on a', `${ZN}&gen=7&logbase=5&fmaporder=abs-gcd`, 7, 5, ['abs-gcd', 'gcd-full'], [1, 11]],
    ['h=7 base 7 order on a2', `${ZN}&gen=7&logbase=7&fmaporder=pos-gcd`, 7, 7, ['pos-gcd', 'gcd-full'], [1, 5, 11]],
    ['h=7 base 7 order on a, index on a2: the intersection', `${ZN}&gen=7&logbase=7&fmaporder=abs-gcd&fmapindex=pos-lcm`, 7, 7, ['abs-gcd', 'pos-lcm'], [1, 5, 11]],
    ['h=7 base 5 only the order map shown, the hidden index map on a2 counts for nothing', `${ZNA}&subformularing=order&gen=7&logbase=5&fmapindex=pos-lcm`, 7, 5, ['gcd-full'], []],
    ['h=7 base 5 only the index map shown, on a', `${ZNA}&subformularing=index&gen=7&logbase=5&fmapindex=abs-lcm`, 7, 5, ['abs-lcm'], [1, 11]],
    ['h=9 base 1 index on a: a closed for base 1 so the knob settles back to GCD (full), nothing off', `${ZN}&gen=9&logbase=1&fmapindex=abs-gcd`, 9, 1, ['gcd-full'], []],
    ['h=3 base 1 both on a2 (q = 3)', `${ZN}&gen=3&logbase=1&fmaporder=pos-gcd&fmapindex=pos-lcm`, 3, 1, ['pos-gcd', 'pos-lcm'], null]
  ];
  for (const [name, url, h, base, toks, wantOff] of cases) {
    await P.load(url);
    await P.enter();
    const r = await rowNow(P);
    const want = offModel(Z12, h, base, toks);
    if (wantOff) out(same(want, wantOff), 'fits', `${name}: model says off = [${wantOff}]`, want);
    out(!!r && same(sortN(r.off), want) && same(r.checked, [base]) && !r.off.includes(base), 'fits', `${name}: disabled boxes [${want}], the chosen box enabled and checked`, r && { off: r.off, want, checked: r.checked });
  }
  // the same on (ℤ/13ℤ)* and a curve: every position of the models, base by base
  const U = unitsModel(13), E = ecAdapter(curveModel(11, 1, 3), false);
  for (const [M, url, h, bases] of [[U, '?mobile=0&mode=multiplicative&n=13&subformularow=both&subformularing=both&gen=3', 3, U.gens], [E, `${CURVE}&gen=1`, 1, E.gens]]) {
    for (const base of bases) for (const tok of ['abs-gcd', 'pos-lcm']) {
      await P.load(`${url}&logbase=${base}&fmaporder=${tok}&fmapindex=${tok}`);
      await P.enter();
      const r = await rowNow(P);
      const want = offModel(M, h, base, [tok, tok]);
      out(!!r && same(sortN(r.off), want) && same(r.checked, [base]), 'fits', `${M.label} h=${M.at(h)} base ${M.at(base)} ${tok}: off = [${want}]`, r && { off: r.off, want, checked: r.checked });
    }
  }
  noErrors(P, 'fits');
  await P.done();
}]);

/* ---------- click: a box makes its generator the base of both formulas ---------- */
SCENARIOS.push(['click', async browser => {
  const P = await openPage(browser, 'click', { w: 1280, h: 900, ua: UA_DESKTOP });
  await P.load(`${ZN}&gen=9`);
  await P.enter();
  let before = await mapsNow(P);
  out(before[0].off.includes('pos'), 'click', 'h=9 base 1: a2 closed (q = 9)', before[0].off);
  let c = await centre(P, '.lb-box[data-g="7"]');
  await P.mouse(c.x, c.y);
  let r = await rowNow(P), maps = await mapsNow(P), f = await P.formulas();
  out((await P.param('logbase')) === '7' && same(r.checked, [7]), 'click', 'a click on box 7: logbase=7 and box 7 checked', { q: await P.q(), checked: r.checked });
  out(same(plains(f.ring), wantPair(Z12, 7, 9, 'gcd-full', 'gcd-full')), 'click', 'both formulas now write log_7', plains(f.ring));
  out(maps.every(m => !m.off.includes('pos') && same(m.off, offWant(reach(Z12, 7, 9)))), 'click', 'the maps open a2 for base 7 (log_7 9 = 3)', maps);
  // a box that is off takes no click
  await P.load(`${ZN}&gen=7&logbase=5&fmaporder=abs-gcd`);
  await P.enter();
  r = await rowNow(P);
  out(r.off.includes(1) && r.off.includes(11), 'click', 'h=7 base 5 on a: boxes 1 and 11 are off', r.off);
  c = await centre(P, '.lb-box[data-g="1"]');
  await P.mouse(c.x, c.y);
  r = await rowNow(P);
  out((await P.param('logbase')) === '5' && same(r.checked, [5]), 'click', 'a click on a box that is off changes nothing', { q: await P.q(), checked: r.checked });
  c = await centre(P, '.lb-box[data-g="7"]');
  await P.mouse(c.x, c.y);
  f = await P.formulas();
  out((await P.param('logbase')) === '7' && same(plains(f.ring), wantPair(Z12, 7, 7, 'abs-gcd', 'gcd-full')), 'click', 'a click on box 7 at a: the order formula follows with base 7', { q: await P.q(), ring: plains(f.ring) });
  out((await P.param('fmaporder')) === 'abs-gcd', 'click', 'and the knob stays on a', await P.q());
  // a curve: a point
  const C = curveModel(11, 1, 3), E = ecAdapter(C, false);
  await P.load(`${CURVE}&gen=1&expr=8`);
  await P.enter();
  c = await centre(P, `.lb-box[data-g="${C.gens[1]}"]`);
  await P.mouse(c.x, c.y);
  f = await P.formulas();
  r = await rowNow(P);
  out((await P.param('logbase')) === String(C.gens[1]) && same(r.checked, [C.gens[1]]) && same(plains(f.ring), wantPair(E, C.gens[1], 1, 'gcd-full', 'gcd-full')), 'click', `curve: a click on the box ${E.at(C.gens[1])} writes its index and log_${E.at(C.gens[1])}`, { q: await P.q(), ring: plains(f.ring) });
  out((await P.param('expr')) === '8', 'click', 'and leaves the expression slider where it was (expr=8)', await P.q());
  noErrors(P, 'click');
  await P.done();
}]);

/* ---------- legacy: old links, the expression slider, group changes ---------- */
SCENARIOS.push(['legacy', async browser => {
  const P = await openPage(browser, 'legacy', { w: 1280, h: 900, ua: UA_DESKTOP });
  const C = curveModel(11, 1, 3), E = ecAdapter(C, false), U = unitsModel(13);
  const check = async (name, url, M, h, want) => {
    await P.load(url);
    await P.enter();
    const r = await rowNow(P), f = await P.formulas();
    out(!!r && same(r.checked, [want]) && (await P.param('logbase')) === String(want), 'legacy', `${name}: opens on base ${M.at(want)}, logbase=${want} written`, r && { checked: r.checked, q: await P.q() });
    out(same(plains(f.ring), wantPair(M, want, h, 'gcd-full', 'gcd-full')), 'legacy', `${name}: the formulas are the old ones (base ${M.at(want)})`, plains(f.ring));
  };
  await check('expr=7 (the expression slider\'s generator)', `${ZN}&gen=9&expr=7`, Z12, 9, 7);
  await check('no expr: the first generator', `${ZN}&gen=9`, Z12, 9, 1);
  await check('(ℤ/13ℤ)* without expr', '?mobile=0&mode=multiplicative&n=13&subformularow=both&subformularing=both&gen=5', U, 5, 2);
  await check('curve with arrangegen=14 on Natural', `${CURVE}&gen=1&arrangegen=14`, E, 1, 14);
  await check('logbase=4 (not a generator) is resolved', `${ZN}&gen=9&logbase=4`, Z12, 9, 1);
  await check('logbase=abc is resolved', `${ZN}&gen=9&logbase=abc`, Z12, 9, 1);
  await check('logbase=-3 is resolved', `${ZN}&gen=9&logbase=-3`, Z12, 9, 1);
  // the expression slider no longer moves the base
  await P.load(`${ZN}&gen=9&expr=7`);
  await P.enter();
  const f0 = plains((await P.formulas()).ring);
  await P.ev('document.activeElement && document.activeElement.blur()');
  const slider0 = await P.ev('document.getElementById("expr-slider").value');
  await P.key('ArrowRight', 'ArrowRight', 39);
  const f1 = plains((await P.formulas()).ring);
  out((await P.ev('document.getElementById("expr-slider").value')) !== slider0 && (await P.param('logbase')) === '7' && same(f0, f1), 'legacy', 'ArrowRight steps the expression slider; the base and the formulas stay (logbase=7)', { slider0, q: await P.q(), f0, f1 });
  // a group change keeps the base while it is a generator, else re-resolves
  await P.load(`${ZN}&gen=9&logbase=5`);
  await P.enter();
  const setN = n => P.ev(`(function(){ var n=document.getElementById('n-input'); n.value='${n}'; n.dispatchEvent(new Event('input', { bubbles: true })); n.dispatchEvent(new Event('change', { bubbles: true })); return 1; })()`);
  await setN(8);
  await sleep(1200);
  let r = await rowNow(P);
  out(!!r && same(r.values, znModel(8).gens) && same(r.checked, [5]) && (await P.param('logbase')) === '5', 'legacy', 'ℤ/12ℤ base 5 -> n=8: 5 is still a generator, kept', r && { values: r.values, checked: r.checked, q: await P.q() });
  await setN(10);
  await sleep(1200);
  r = await rowNow(P);
  out(!!r && same(r.values, znModel(10).gens) && same(r.checked, [1]) && (await P.param('logbase')) === '1', 'legacy', 'n=10: 5 is no generator, the base re-resolves to the first (1)', r && { values: r.values, checked: r.checked, q: await P.q() });
  noErrors(P, 'legacy');
  await P.done();
}]);

/* ---------- gone: the pyramid is gone from page and strings ---------- */
SCENARIOS.push(['gone', async browser => {
  const P = await openPage(browser, 'gone', { w: 1280, h: 900, ua: UA_DESKTOP });
  for (const [name, url] of [['zn12', `${ZN}&gen=9`], ['(ℤ/13ℤ)*', '?mobile=0&mode=multiplicative&n=13&expr=2&subformularow=both&subformularing=both&gen=5'], ['curve 11,1,3', `${CURVE}&gen=1&expr=8`]]) {
    await P.load(url);
    await P.enter();
    out(!(await P.exists('.log-tri')) && !(await P.exists('.has-log-tri')) && !(await P.exists('[class*="log-tri"]')), 'gone', `${name}: no pyramid in the DOM`);
  }
  noErrors(P, 'gone');
  await P.done();
  const html = readFileSync(PAGE, 'utf8'), i18n = readFileSync(join(ROOT, 'assets', 'i18n', 'cyclic-groups.js'), 'utf8');
  const pats = [/\blog-tri\b/, /\blogTri\b/, /\blogMode\b/, /\blogScroll(Base|able|Takes|G|Sum)?\b/, /\blogGenBase\b/, /\blogChoosable\b/, /\bsetLogMode\b/, /\bstepLogScroll\b/];
  out(pats.every(p => !p.test(html)), 'gone', 'the page source matches none of the pyramid\'s identifiers or classes', pats.filter(p => p.test(html)).map(String));
  out(!/^\s+(logScroll|logTriLabel|logFollowSliderTitle|logFollowGenTitle):/m.test(i18n), 'gone', 'the i18n file defines none of the four pyramid keys');
  const enEnd = i18n.indexOf("\n    nl: {") > 0 ? i18n.indexOf("\n    nl: {") : i18n.length;
  const keys = ['logBaseLabel', 'logBaseOff', 'logBaseWheel'];
  out(keys.every(k => new RegExp('^\\s+' + k + ':', 'm').test(i18n) && (i18n.match(new RegExp('^\\s+' + k + ':', 'gm')) || []).length === 1), 'gone', 'the i18n file defines logBaseLabel, logBaseOff and logBaseWheel once each (English-only)', keys.map(k => (i18n.match(new RegExp('^\\s+' + k + ':', 'gm')) || []).length));
  void enEnd;
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

/* ---------- flash: a closed a or a2 is clickable and shows which bases would open it ---------- */
const okOf = (M, h, node) => sortN(M.gens.filter(g => reach(M, g, h)[node]));
const noOf = (M, h, node) => sortN(M.gens.filter(g => !reach(M, g, h)[node]));
const stopCentre = (P, f, id) => centre(P, `.fmap[data-f="${f}"] .fmap-stop[data-id="${id}"]`);
SCENARIOS.push(['flash', async browser => {
  const P = await openPage(browser, 'flash', { w: 1280, h: 900, ua: UA_DESKTOP });
  const state = async f => (await mapsNow(P)).find(m => m.f === f);
  await P.load(`${ZN}&gen=7&logbase=1`);
  await P.enter();
  out(same(okOf(Z12, 7, 'pos'), [7]) && same(okOf(Z12, 7, 'abs'), [5, 7]) && same(noOf(Z12, 7, 'abs'), [1, 11]), 'flash', 'model: h=7, a2 opens under 7 only; a under 5 and 7');
  const closed = await P.ev(`(function(){ return ['order','index'].map(function(f){ var m=document.querySelector('.fmap[data-f="'+f+'"]'); return ['abs','pos'].map(function(id){ var i=m.querySelector('.fmap-stop[data-id="'+id+'"] input'); return [i.disabled, i.getAttribute('aria-disabled'), m.querySelectorAll('.fmap-node.is-closed').length]; }); }); })()`);
  out(closed.every(m => m.every(x => x[0] === false && x[1] === 'true' && x[2] === 2)), 'flash', 'closed a and a2: not disabled, aria-disabled, the drawn nodes still faded', closed);
  const noFlash = async () => { const r = await rowNow(P); return r.ok.length === 0 && r.no.length === 0; };
  out(await noFlash(), 'flash', 'no flash before any click');
  for (const [f, id, node] of [['order', 'pos', 'pos'], ['order', 'abs', 'abs'], ['index', 'pos', 'pos'], ['index', 'abs', 'abs']]) {
    const c = await stopCentre(P, f, id);
    await P.mouse(c.x, c.y);
    const r = await rowNow(P), st = await state(f);
    out(same(sortN(r.ok), okOf(Z12, 7, node)) && same(sortN(r.no), noOf(Z12, 7, node)), 'flash', `${f} map, a click on ${id === 'pos' ? 'a2' : 'a'}: green ${okOf(Z12, 7, node)}, red ${noOf(Z12, 7, node)}`, { ok: r.ok, no: r.no });
    out(st.at === 'gcd-full' && (await P.param('fmaporder')) === null && (await P.param('fmapindex')) === null && (await P.param('logbase')) === '1' && same(r.checked, [1]), 'flash', `${f} map, ${id === 'pos' ? 'a2' : 'a'}: the knob, the url and the base stay`, { st, q: await P.q() });
    await sleep(1000);
    out(await noFlash(), 'flash', `${f} map, ${id === 'pos' ? 'a2' : 'a'}: the flash is over after about a second and a half`, await rowNow(P));
  }
  // the keyboard: arrows land on the closed forms and flash, the knob stays
  await P.ev(`document.querySelector('.fmap[data-f="order"] input:checked').focus()`);
  const where = () => P.ev(`(function(){var a=document.activeElement, m=a&&a.closest&&a.closest('.fmap'); return { f: m && m.getAttribute('data-f'), v: a && a.value, aria: a && a.getAttribute('aria-disabled'), at: m && m.getAttribute('data-at') }; })()`);
  await P.key('ArrowRight', 'ArrowRight', 39);
  let w = await where(), r = await rowNow(P);
  out(w.f === 'order' && w.v === 'pos' && w.aria === 'true' && w.at === 'gcd-full' && same(sortN(r.ok), okOf(Z12, 7, 'pos')) && same(sortN(r.no), noOf(Z12, 7, 'pos')), 'flash', 'ArrowRight from GCD (full): the focus on a2 (aria-disabled), the knob unmoved, the flash by the a2 set', { w, ok: r.ok, no: r.no });
  await P.key('ArrowRight', 'ArrowRight', 39);
  w = await where(); r = await rowNow(P);
  out(w.f === 'order' && w.v === 'abs' && w.at === 'gcd-full' && same(sortN(r.ok), okOf(Z12, 7, 'abs')) && same(sortN(r.no), noOf(Z12, 7, 'abs')), 'flash', 'ArrowRight again: the focus on a, the knob unmoved, the flash by the a set', { w, ok: r.ok, no: r.no });
  await sleep(1400);
  out(await noFlash(), 'flash', 'the keyboard flash ends too');
  await P.ev(`document.querySelector('.fmap[data-f="index"] .fmap-stop[data-id="pos"] input').focus()`);
  const space = type => P.S('Input.dispatchKeyEvent', { type, key: ' ', code: 'Space', windowsVirtualKeyCode: 32, text: type === 'keyDown' ? ' ' : undefined });
  await space('keyDown'); await space('keyUp'); await sleep(400);
  r = await rowNow(P);
  out(same(sortN(r.ok), okOf(Z12, 7, 'pos')) && (await state('index')).at === 'gcd-full', 'flash', 'Space on the closed a2 flashes too', { ok: r.ok, no: r.no });
  // open positions still move the knob; a click on one of them flashes nothing
  await sleep(1400);
  let c = await stopCentre(P, 'order', 'lcm-short');
  await P.mouse(c.x, c.y);
  r = await rowNow(P);
  out((await state('order')).at === 'lcm-short' && r.ok.length === 0 && r.no.length === 0, 'flash', 'an open position takes the knob and flashes nothing');
  // (ℤ/13ℤ)*: a2 closed at h = 5 with base 2; the SLS radios stay plainly disabled
  const U = unitsModel(13);
  await P.load('?mobile=0&mode=multiplicative&n=13&expr=2&subformularow=both&subformularing=both&gen=5');
  await P.enter();
  c = await stopCentre(P, 'order', 'pos');
  await P.mouse(c.x, c.y);
  r = await rowNow(P);
  out(same(sortN(r.ok), okOf(U, 5, 'pos')) && same(sortN(r.no), noOf(U, 5, 'pos')) && (await state('order')).at === 'gcd-full', 'flash', `(ℤ/13ℤ)* h=5: a2 flashes green ${okOf(U, 5, 'pos')}, red ${noOf(U, 5, 'pos')}`, { ok: r.ok, no: r.no });
  const sls = await P.ev(`['gcd-sls','lcm-sls'].map(function(id){ var i=document.querySelector('.fmap[data-f="order"] .fmap-stop[data-id="'+id+'"] input'); return [i.disabled, i.getAttribute('aria-disabled')]; })`);
  out(sls.every(x => x[0] === true && x[1] === null), 'flash', 'the SLS radios are plainly disabled (never flash)', sls);
  await sleep(1400);
  await P.clickEl('.fmap[data-f="order"] .fmap-stop[data-id="gcd-sls"] input');
  await sleep(200);
  r = await rowNow(P);
  out(r.ok.length === 0 && r.no.length === 0 && (await state('order')).at === 'gcd-full', 'flash', 'a click on a disabled SLS radio does nothing');
  noErrors(P, 'flash');
  await P.done();
}]);

/* ---------- wheel: the switch steps the base through the boxes that are not greyed out ---------- */
SCENARIOS.push(['wheel', async browser => {
  const P = await openPage(browser, 'wheel', { w: 1280, h: 900, ua: UA_DESKTOP });
  const URL = `${ZN}&gen=7&logbase=5&fmaporder=abs-gcd`;
  await P.load(URL);
  await P.enter();
  let r = await rowNow(P);
  out(r.wheel === 'false' && same(sortN(r.off), [1, 11]), 'wheel', 'the switch is there, off, and the row has the boxes 1 and 11 greyed out', { wheel: r.wheel, off: r.off });
  const cardAt = async () => { const b = await P.rect('.ring-hover-formula'); return { x: b.x + b.w / 2, y: b.y + b.h / 2 }; };
  let at = await cardAt();
  await wheelAt(P, at.x, at.y, 100); await sleep(700);
  out((await P.param('logbase')) === '5', 'wheel', 'switch off: the wheel over the card leaves the base (the page\'s own wheel does its own thing)', await P.q());
  // on, from a fresh load so the page's own wheel has changed nothing
  await P.load(URL);
  await P.enter();
  at = await cardAt();
  await P.clickEl('.lb-scroll');
  r = await rowNow(P);
  out(r.wheel === 'true', 'wheel', 'a click on the switch turns it on (aria-pressed)', r.wheel);
  const seq = [[100, 7], [100, 5], [-100, 7], [-100, 5], [100, 7]];
  for (const [dy, want] of seq) {
    await wheelAt(P, at.x, at.y, dy); await sleep(500);
    r = await rowNow(P);
    out((await P.param('logbase')) === String(want) && same(r.checked, [want]), 'wheel', `wheel ${dy > 0 ? 'down' : 'up'}: base ${want} (greyed 1 and 11 skipped, wrapping)`, { q: await P.q(), checked: r.checked });
  }
  const f = await P.formulas();
  out(same(plains(f.ring), wantPair(Z12, 7, 7, 'abs-gcd', 'gcd-full')), 'wheel', 'the formulas follow the wheel (base 7)', plains(f.ring));
  out((await P.param('gen')) === '7', 'wheel', 'the wheel over the card moved the base only, not the subgroup (gen=7)', await P.q());
  // small touchpad notches add up
  await wheelAt(P, at.x, at.y, 20); await sleep(150);
  await wheelAt(P, at.x, at.y, 20); await sleep(150);
  out((await P.param('logbase')) === '7', 'wheel', 'two small scrolls (40 in all) do not make a step', await P.q());
  await wheelAt(P, at.x, at.y, 20); await sleep(500);
  out((await P.param('logbase')) === '5', 'wheel', 'the third (60 in all) does', await P.q());
  // over the ring, outside the card: the base stays
  const ring = await P.rect('svg.ring-svg');
  const card = await P.rect('.ring-hover-formula');
  const ry = ring.y + ring.h * 0.75;
  await wheelAt(P, ring.x + ring.w / 2, Math.max(ry, card.y + card.h + 20), 100); await sleep(600);
  out((await P.param('logbase')) === '5', 'wheel', 'the wheel over the ring (outside the card) leaves the base', await P.q());
  // off again
  await P.clickEl('.lb-scroll');
  r = await rowNow(P);
  at = await cardAt();
  await wheelAt(P, at.x, at.y, 100); await sleep(700);
  out(r.wheel === 'false' && (await P.param('logbase')) === '5', 'wheel', 'switched off again: the card\'s wheel no longer steps the base', { wheel: r.wheel, q: await P.q() });
  noErrors(P, 'wheel');
  await P.done();
}]);

/* ---------- keys: arrows in the row ---------- */
SCENARIOS.push(['keys', async browser => {
  const P = await openPage(browser, 'keys', { w: 1280, h: 900, ua: UA_DESKTOP });
  await P.load(`${ZN}&gen=7&logbase=5&fmaporder=abs-gcd`);
  await P.enter();
  const keep = async () => { const q = new URLSearchParams(await P.q()); return [q.get('expr'), q.get('gen')]; };
  const k0 = await keep();
  await P.ev(`document.querySelector('.lb-list input:checked').focus()`);
  for (const [key, vk, want] of [['ArrowRight', 39, 7], ['ArrowRight', 39, 5], ['ArrowLeft', 37, 7], ['ArrowDown', 40, 5], ['ArrowUp', 38, 7]]) {
    await P.key(key, key, vk);
    const r = await rowNow(P);
    out(r.focus === want && same(r.checked, [want]) && (await P.param('logbase')) === String(want) && same(await keep(), k0), 'keys', `${key}: the next box that is not greyed out (${want}), focus stays in the row, expr and gen unchanged`, { focus: r.focus, checked: r.checked, q: await P.q(), k0 });
  }
  const f = await P.formulas();
  out(same(plains(f.ring), wantPair(Z12, 7, 7, 'abs-gcd', 'gcd-full')), 'keys', 'the formulas follow the arrows', plains(f.ring));
  // the wheel switch keeps the focus through a rebuild of the row
  await P.ev(`document.querySelector('.lb-scroll').focus()`);
  const sp = type => P.S('Input.dispatchKeyEvent', { type, key: ' ', code: 'Space', windowsVirtualKeyCode: 32, text: type === 'keyDown' ? ' ' : undefined });
  await sp('keyDown'); await sp('keyUp'); await sleep(300);
  let r2 = await rowNow(P);
  out(r2.wheel === 'true' && r2.focus === 'wheel', 'keys', 'Space on the focused wheel switch turns it on', r2);
  const cb = await P.rect('.ring-hover-formula');
  await wheelAt(P, cb.x + cb.w / 2, cb.y + cb.h / 2, 100); await sleep(600);
  r2 = await rowNow(P);
  out(r2.focus === 'wheel' && same(r2.checked, [5]), 'keys', 'a wheel step rebuilds the row and the focus stays on the switch', r2);
  noErrors(P, 'keys');
  await P.done();
}]);

/* ---------- wide: many generators scroll inside the card ---------- */
SCENARIOS.push(['wide', async browser => {
  const P = await openPage(browser, 'wide', { w: 1280, h: 900, ua: UA_DESKTOP });
  const Z97 = '?mobile=0&mode=additive&n=97&subformularow=both&subformularing=both&gen=1';
  const geo = () => P.ev(`(function(){
    var card = document.querySelector('.ring-hover-formula'), head = document.querySelector('.ring-head'), list = card.querySelector('.lb-list'), lit = list.querySelector('input:checked').parentNode;
    var r = function(e){ var b = e.getBoundingClientRect(); return { l: b.left, r: b.right, t: b.top, b: b.bottom }; };
    return { card: r(card), head: r(head), list: r(list), lit: r(lit), boxes: list.querySelectorAll('.lb-box').length, sw: list.scrollWidth, cw: list.clientWidth,
      doc: document.documentElement.scrollWidth, win: window.innerWidth };
  })()`);
  await P.load(`${Z97}&logbase=89`);
  await P.enter();
  let g = await geo();
  out(g.boxes === 96 && g.sw > g.cw, 'wide', 'Z/97Z: 96 boxes, the list scrolls (scrollWidth > clientWidth)', { boxes: g.boxes, sw: g.sw, cw: g.cw });
  out(g.card.l >= g.head.l - 1 && g.card.r <= g.head.r + 1 && g.doc <= g.win + 1, 'wide', 'the card stays inside the ring head and the page does not scroll sideways', g);
  out(g.lit.l >= g.list.l - 1 && g.lit.r <= g.list.r + 1, 'wide', 'logbase=89: its box lies fully inside the list\'s visible rect', g);
  await P.load(`${Z97}&logbase=95`);
  await P.enter();
  const at = await (async () => { const b = await P.rect('.ring-hover-formula'); return { x: b.x + b.w / 2, y: b.y + b.h / 2 }; })();
  await P.clickEl('.lb-scroll');
  for (const want of [96, 1, 2]) {
    await wheelAt(P, at.x, at.y, 100); await sleep(500);
    g = await geo();
    out((await P.param('logbase')) === String(want) && g.lit.l >= g.list.l - 1 && g.lit.r <= g.list.r + 1, 'wide', `wheel down: base ${want}${want === 1 ? ' (wrapped)' : ''}, its box in view`, { q: await P.q(), lit: g.lit, list: g.list });
  }
  // a re-render keeps the scrolled place while the base is in view
  await P.ev(`document.querySelector('.lb-list').scrollLeft = 120`);
  await P.clickEl('.lb-box[data-g="3"] input');
  await sleep(500);
  g = await geo();
  out(g.lit.l >= g.list.l - 1 && g.lit.r <= g.list.r + 1 && (await P.param('logbase')) === '3', 'wide', 'a click on box 3 after scrolling: base 3, in view', { q: await P.q() });
  noErrors(P, 'wide');
  await P.done();
}]);

/* ---------- mobile: the row wraps on the phone, without the wheel switch ---------- */
SCENARIOS.push(['mobile', async browser => {
  const P = await openPage(browser, 'mobile', { w: 390, h: 844, ua: UA_ANDROID, touch: true });
  await P.load('?mobile=1&mode=additive&n=12&gen=9&subformularing=both');
  await sleep(800);
  let r = await rowNow(P);
  out(!!r && same(r.values, Z12.gens), 'mobile', 'the row of boxes shows on the stacked page', r && r.values);
  out(!!r && r.wheel === null && !(await P.exists('.lb-scroll')), 'mobile', 'no wheel switch on the phone');
  out((await P.ev(`getComputedStyle(document.querySelector('.lb-list')).flexWrap`)) === 'wrap', 'mobile', 'the list wraps');
  await P.clickEl('.lb-box[data-g="5"] input');
  await sleep(600);
  r = await rowNow(P);
  const w = await P.ev(`({ doc: document.documentElement.scrollWidth, win: window.innerWidth })`);
  out((await P.param('logbase')) === '5' && same(r.checked, [5]) && w.doc <= w.win + 1, 'mobile', 'a tap on box 5: logbase=5, no sideways scroll', { q: await P.q(), w });
  const f = await P.formulas();
  out(same(plains(f.ring), wantPair(Z12, 5, 9, 'gcd-full', 'gcd-full')), 'mobile', 'and both formulas write log_5', plains(f.ring));
  await P.load('?mobile=1&mode=additive&n=97&gen=1&subformularing=both');
  await sleep(1000);
  const m = await P.ev(`(function(){ var l = document.querySelector('.lb-list'); return { h: l.getBoundingClientRect().height, sh: l.scrollHeight, ch: l.clientHeight, boxes: l.querySelectorAll('.lb-box').length, doc: document.documentElement.scrollWidth, win: window.innerWidth }; })()`);
  out(m.boxes === 96 && m.h <= 90 && m.sh > m.ch && m.doc <= m.win + 1, 'mobile', 'Z/97Z on the phone: the list is at most 90 px high, scrolls vertically, the page not sideways', m);
  noErrors(P, 'mobile');
  await P.done();
}]);
//@@SCENARIOS@@
// A debugging aid, not part of the checks:
//   DUMP_URL='?mobile=0&...' DUMP_JS='expr' [DUMP_KEYS=ArrowRight,ArrowLeft] node ... dump
SCENARIOS.push(['dump', async browser => {
  const P = await openPage(browser, 'dump', { w: 1280, h: 900, ua: UA_DESKTOP });
  await P.load(process.env.DUMP_URL || `${ZN}&gen=9`);
  await P.enter();
  for (const k of (process.env.DUMP_KEYS || '').split(',').filter(Boolean)) await P.key(k, k, { ArrowRight: 39, ArrowLeft: 37, ArrowUp: 38, ArrowDown: 40 }[k]);
  console.log(JSON.stringify({ q: await P.q(), row: await rowNow(P), maps: await mapsNow(P), js: process.env.DUMP_JS ? await P.ev(process.env.DUMP_JS) : null }, null, 1));
  if (process.env.DUMP_SHOT) {
    const r = await P.rect('.ring-hover-formula');
    await P.shot(process.env.DUMP_SHOT, r && { x: Math.max(0, r.x - 6), y: Math.max(0, r.y - 6), width: Math.min(r.w + 12, 1280), height: r.h + 12 });
  }
  console.log(JSON.stringify(P.errors));
  await P.done();
}]);
const browser = await connect();
try {
  // shot is an aid, run only when named
  for (const [name, fn] of SCENARIOS) if (want(name) && (ONLY.includes(name) || !['shot', 'dump'].includes(name))) await fn(browser);
} catch (e) {
  fails++;
  console.log('FAIL probe-crashed ' + (e && e.stack || e));
}
browser.close();
console.log(fails === 0 ? 'LOG-BASE-CHECK OK' : `LOG-BASE-CHECK FAIL: ${fails}`);
process.exit(fails === 0 ? 0 : 1);
