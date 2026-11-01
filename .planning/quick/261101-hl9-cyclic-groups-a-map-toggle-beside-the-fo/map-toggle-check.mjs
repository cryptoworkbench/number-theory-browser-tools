// CDP probe of Cyclic Groups' map switch beside the formula sliders (quick
// 261101-hl9): on a cyclic (ℤ/nℤ)* and a cyclic curve a small map in each
// slider pair's corner opens the formula map beside the sliders, for every
// formula at once, and the open map moves with the sliders, the generator
// boxes and a forced base. Built-ins only (global WebSocket and fetch);
// headless Google Chrome on a throwaway profile, killed and removed on exit.
// The harness and the independent models are copied unchanged from wef's
// slider-check.mjs; every expectation comes from them.
//   node map-toggle-check.mjs [syntax] [render] [toggle] [layout] [url] [sync]
//        [boxes] [jnrow] [narrow] [mobile] [ringwin] [pane] [live] [fade] [force]
//        [lock] [settle] [band]   (none: all of these)
//   node map-toggle-check.mjs shot    four light screenshots into this dir
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
const PORT = 9363;
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
const profile = mkdtempSync(join(tmpdir(), 'cg-maptoggle-'));
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
// class, the checked box, the two maps' (or slider pairs') positions, which
// formulas' neither notches pulse (cpulse) or flash (cset); t is relative to the last
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
    var chip = function(c){ return Array.prototype.map.call(document.querySelectorAll('.fsl-pair .fsl[data-kind="form"] .fsl-notch[data-v="1"].' + c), function(x){ return x.closest('.fsl-pair').getAttribute('data-f'); }); };
    var lit = document.querySelector('.ring-hover-formula .lb-list input:checked');
    var origs = Array.prototype.filter.call(document.querySelectorAll('.ring-hover-formula .lb-box'), function(b){ return b.__orig; }).length;
    window.__fs.push({ n: window.__fn, t: window.__ft0 === null ? null : Math.round(performance.now() - window.__ft0), pulse: cls('is-force-pulse'), set: cls('is-force-set'), ok: cls('is-flash-ok'), no: cls('is-flash-no'), base: lit ? +lit.value : null, maps: m, origs: origs, cpulse: chip('is-force-pulse'), cset: chip('is-force-set'), anyChip: document.querySelectorAll('.fsl-notch.is-force-pulse, .fsl-notch.is-force-set').length });
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

const U13 = unitsModel(13);
const E11 = ecAdapter(curveModel(11, 1, 3), false);
const UNITS = '?mobile=0&mode=multiplicative&n=13&subformularow=both&subformularing=both';
// The slider pairs as the page shows them: per formula its token and node,
// and per slider the aria value, its text, whether it rests, its closed
// notches and the notch marked active.
const PAIRS_JS = `Array.prototype.map.call(document.querySelectorAll('.fsl-pair'), function(p){
  var k = function(kind){
    var s = p.querySelector('.fsl[data-kind="' + kind + '"]'), at = s.querySelector('.fsl-notch.is-at');
    return { now: +s.getAttribute('aria-valuenow'), text: s.getAttribute('aria-valuetext'), label: s.getAttribute('aria-label'), role: s.getAttribute('role'),
      inert: s.classList.contains('is-inert'), aria: s.getAttribute('aria-disabled'), tab: s.getAttribute('tabindex'),
      closed: Array.prototype.map.call(s.querySelectorAll('.fsl-notch.is-closed'), function(c){ return +c.getAttribute('data-v'); }),
      at: at ? +at.getAttribute('data-v') : null, labels: Array.prototype.map.call(s.querySelectorAll('.fsl-notch'), function(c){ return c.textContent; }).join('|') };
  };
  return { f: p.getAttribute('data-f'), at: p.getAttribute('data-at'), token: p.getAttribute('data-token'), c: k('complexity'), v: k('form') };
})`;
const pairs = (P, ctx) => P.ev(PAIRS_JS, ctx);
const pairOf = async (P, f, ctx) => (await pairs(P, ctx)).find(x => x.f === f);
const chipSel = (f, kind, v) => `.fsl-pair[data-f="${f}"] .fsl[data-kind="${kind}"] .fsl-notch[data-v="${v}"]`;
const chip = (P, f, kind, v, ctx) => centre(P, chipSel(f, kind, v), ctx);
const clickChip = async (P, f, kind, v) => { const c = await chip(P, f, kind, v); await P.mouse(c.x, c.y); };
// The model of the two sliders (the plan's D-01): complexity c 0..2, form v 0..2 (LCM, neither, GCD).
const tokOf = (c, v, row = 'gcd') => c === 0 ? 'jn' : v === 1 ? (c === 1 ? 'pos-' : 'abs-') + row : (v === 0 ? 'lcm' : 'gcd') + (c === 1 ? '-short' : '-full');
const cvOf = t => {
  if (t === 'jn' || t.includes('sls')) return [0, null];
  const c = t.startsWith('pos-') || t.endsWith('-short') ? 1 : 2;
  return [c, t.startsWith('abs-') || t.startsWith('pos-') ? 1 : t.startsWith('gcd') ? 2 : 0];
};
const C_TEXT = ['JN', 'compact', 'complete'], V_TEXT = ['LCM', 'neither', 'GCD'];
const noScroll = P => P.ev(`document.documentElement.scrollWidth <= window.innerWidth + 1`);
// An h and base of model M under which both a and a2 are open, with a log
// that is neither 1 nor |G| (so every form says something of its own).
function bothOpen(M) {
  for (const b of M.gens) for (let h = 1; h < M.N; h++) {
    if (M.kind === 'mul' && gcd(h, M.n) !== 1) continue;
    const r = reach(M, b, h);
    if (r.q !== null && r.pos && r.q !== M.N && r.q !== 1) return { b, h };
  }
  return null;
}
async function drag(P, from, to, steps = 8) {
  await P.S('Input.dispatchMouseEvent', { type: 'mouseMoved', x: from.x, y: from.y });
  await P.S('Input.dispatchMouseEvent', { type: 'mousePressed', x: from.x, y: from.y, button: 'left', buttons: 1, clickCount: 1 });
  for (let i = 1; i <= steps; i++) {
    await sleep(20);
    await P.S('Input.dispatchMouseEvent', { type: 'mouseMoved', x: from.x + (to.x - from.x) * i / steps, y: from.y + (to.y - from.y) * i / steps, button: 'left', buttons: 1 });
  }
  await sleep(20);
  await P.S('Input.dispatchMouseEvent', { type: 'mouseReleased', x: to.x, y: to.y, button: 'left', buttons: 0, clickCount: 1 });
  await sleep(600);
}
const okOf = (M, h, node) => sortN(M.gens.filter(g => reach(M, g, h)[node]));
const noOf = (M, h, node) => sortN(M.gens.filter(g => !reach(M, g, h)[node]));

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

/* ---------- helpers of this probe ---------- */
// The map's nodes as the page draws them (centre, width, height in the drawing).
const FMAP_NODES = {
  jn: { x: 12, y: 47, w: 22, h: 14 }, 'gcd-short': { x: 62, y: 9, w: 30, h: 16 }, 'gcd-full': { x: 152, y: 9, w: 30, h: 16 },
  'lcm-short': { x: 62, y: 47, w: 30, h: 16 }, 'lcm-full': { x: 152, y: 47, w: 30, h: 16 }, abs: { x: 152, y: 28, w: 22, h: 12 },
  pos: { x: 62, y: 28, w: 22, h: 12 }, 'gcd-sls': { x: 62, y: 66, w: 30, h: 16 }, 'lcm-sls': { x: 62, y: 85, w: 30, h: 16 }
};
const FMAP_ORDER = ['jn', 'gcd-short', 'gcd-full', 'pos', 'abs', 'lcm-short', 'lcm-full', 'gcd-sls', 'lcm-sls'];
const SEVEN = FMAP_ORDER.filter(id => !id.includes('sls'));
// The knob's inline geometry over node id, as the map sets it (grown by 1.5).
const knobAt = id => { const n = FMAP_NODES[id]; return { left: n.x - n.w / 2 - 1.5, top: n.y - n.h / 2 - 1.5, width: n.w + 3, height: n.h + 3 }; };
const knobIs = (k, id) => { const w = knobAt(id); return k && ['left', 'top', 'width', 'height'].every(p => Math.abs(parseFloat(k[p]) - w[p]) < 0.01); };
// Every map on the page: its formula, the node its knob is on, whether it is
// drawn without SLS, its stops, its closed nodes and dotted edges, its knob's
// inline geometry, and the position its formula's slider pair shows.
const MAPS_JS = `Array.prototype.map.call(document.querySelectorAll('.fmap'), function(m){
  var f = m.getAttribute('data-f'), k = m.querySelector('.fmap-knob'), pair = null;
  document.querySelectorAll('.fsl-pair').forEach(function(p){ if (p.getAttribute('data-f') === f) pair = p; });
  var ids = function(sel){ return Array.prototype.map.call(m.querySelectorAll(sel), function(x){ return x.getAttribute('data-id'); }); };
  var r = m.getBoundingClientRect(), svg = m.querySelector('svg');
  return { f: f, at: m.getAttribute('data-at'), noSls: m.classList.contains('no-sls'), stops: ids('.fmap-stop'),
    closedNodes: ids('.fmap-node.is-closed'), closedEdges: ids('.fmap-edge.is-cond.is-closed'), edges: ids('.fmap-edge.is-cond'), nodes: ids('.fmap-node'),
    knob: { left: k.style.left, top: k.style.top, width: k.style.width, height: k.style.height },
    pairAt: pair ? pair.getAttribute('data-at') : null, pairToken: pair ? pair.getAttribute('data-token') : null,
    checked: (m.querySelector('input:checked') || {}).value || null,
    rect: { x: r.left, y: r.top, w: r.width, h: r.height }, svgH: svg && svg.getAttribute('height'), viewBox: svg && svg.getAttribute('viewBox') };
})`;
const maps = (P, ctx) => P.ev(MAPS_JS, ctx);
const mapOf = async (P, f, ctx) => (await maps(P, ctx)).find(m => m.f === f);
// The map switch of every pair: pressed, tooltip, accessible name, rect, the
// pair's notch rects and how many nodes its icon draws.
const TOGGLES_JS = `Array.prototype.map.call(document.querySelectorAll('.fsl-pair'), function(p){
  var b = p.querySelector('.fsl-maptoggle'), rr = function(e){ var r = e.getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height }; };
  return { f: p.getAttribute('data-f'), has: !!b, pressed: b && b.getAttribute('aria-pressed'), title: b && b.title, label: b && b.getAttribute('aria-label'),
    rect: b && rr(b), pair: rr(p), notches: Array.prototype.map.call(p.querySelectorAll('.fsl-notch'), rr), icon: b ? b.querySelectorAll('svg rect').length : 0, last: p.lastElementChild === b };
})`;
const toggles = (P, ctx) => P.ev(TOGGLES_JS, ctx);
const meets = (a, b) => a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;
const toggleSel = f => `.fsl-pair[data-f="${f}"] .fsl-maptoggle`;
const stopSel = (f, id) => `.fmap[data-f="${f}"] .fmap-stop[data-id="${id}"]`;
const clickSel = async (P, sel) => { const c = await centre(P, sel); if (!c) return false; await P.mouse(c.x, c.y); return true; };
async function tap(P, sel) {
  await P.ev(`document.querySelector(${JSON.stringify(sel)}).scrollIntoView({ block: 'center' })`);
  await sleep(300);
  const c = await centre(P, sel);
  await P.S('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: c.x, y: c.y }] });
  await sleep(40);
  await P.S('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await sleep(800);
}
const SHOW = 'Show the formula map', HIDE = 'Hide the formula map';
const U13Q = `${UNITS}&gen=5&logbase=2`;
// Quick 261101-o20: a2 opens exactly when a does. (ℤ/13ℤ)* h=5 (r = −3 under
// base 2) has both open under every base; h=6 (log_2 6 = 5) has both shut
// under base 2 and open under 6 and 11, so the open/closed cases use h=6.
const HS = 6;
// The children of the formula box in order: pair, map, line (per formula).
const ORDER_JS = `Array.prototype.map.call(document.querySelector('.ring-hover-formula').children, function(c){ return c.classList.contains('fsl-pair') ? 'pair' : c.classList.contains('fmap') ? 'map' : c.classList.contains('lb-row') ? 'row' : c.localName; }).join(' ')`;

/* ---------- render: the switch only on slider groups ---------- */
SCENARIOS.push(['render', async browser => {
  const P = await openPage(browser, 'render', { w: 1280, h: 900, ua: UA_DESKTOP });
  for (const [name, q] of [['(ℤ/13ℤ)*', U13Q], ['the curve E(𝔽₁₁)', '?mobile=0&curve=11,1,3&subformularow=both&subformularing=both&gen=1']]) {
    await P.load(q);
    await P.enter();
    const ts = await toggles(P);
    out(ts.length === 2 && ts.every(t => t.has && t.pressed === 'false' && t.title === SHOW && t.label === SHOW && t.last) && (await maps(P)).length === 0, 'render', `${name}: two switches, aria-pressed false, 'Show the formula map', no map`, ts.map(t => [t.f, t.pressed, t.title]));
    out(ts.every(t => t.icon === 7), 'render', `${name}: each switch draws the seven non-SLS nodes`, ts.map(t => t.icon));
    out(ts.every(t => t.rect && t.notches.length === 6 && t.notches.every(n => !meets(t.rect, n))), 'render', `${name}: no switch overlaps a notch`, ts.map(t => [t.rect, t.notches[2]]));
    out(ts.every(t => t.rect.x + t.rect.w <= t.pair.x + t.pair.w + 0.5 && t.rect.y >= t.pair.y - 2.5 && t.rect.w <= 18.5 && t.rect.h <= 14.5), 'render', `${name}: the switch sits in the pair's top-right corner (18 x 14)`, ts.map(t => [t.rect, t.pair]));
  }
  // quick 261101-so1: ℤ/12ℤ has the sliders and the switch too; opened, its maps keep their SLS rows
  await P.load('?mobile=0&mode=additive&n=12&subformularow=both&subformularing=both&gen=9');
  await P.enter();
  const zt = await toggles(P);
  out(zt.length === 2 && zt.every(t => t.has && t.pressed === 'false') && (await maps(P)).length === 0, 'render', 'ℤ/12ℤ: two switches, off, no map (since 261101-so1)', zt.map(t => [t.f, t.pressed]));
  await P.load('?mobile=0&mode=additive&n=12&subformularow=both&subformularing=both&gen=9&fmapopen=1');
  await P.enter();
  let ms = await maps(P);
  out(ms.length === 2 && ms.every(m => !m.noSls && m.stops.length === 9 && m.viewBox === '0 0 172 94'), 'render', 'ℤ/12ℤ opened: its two full maps (nine stops, 172 x 94)', ms.map(m => [m.stops.length, m.viewBox]));
  out(ms.every(m => same(m.nodes, FMAP_ORDER) && same(m.edges, ['abs', 'pos', 'sls'])), 'render', 'ℤ/12ℤ: its nodes and dotted edges carry their data-id', ms.map(m => [m.nodes, m.edges]));
  await P.load('?mobile=0&mode=multiplicative&n=8&gen=3&subformularow=both&subformularing=both');
  await P.enter();
  out(!(await P.exists('.fsl-maptoggle')) && !(await P.exists('.fmap')), 'render', '(ℤ/8ℤ)*: no switch, no map');
  noErrors(P, 'render');
  await P.done();
}]);

/* ---------- toggle: one switch opens and closes every map ---------- */
SCENARIOS.push(['toggle', async browser => {
  const P = await openPage(browser, 'toggle', { w: 1280, h: 900, ua: UA_DESKTOP });
  await P.load(U13Q);
  await P.enter();
  await clickSel(P, toggleSel('order'));
  let ms = await maps(P), ts = await toggles(P);
  out(ms.length === 2 && same(ms.map(m => m.f), ['order', 'index']) && ms.every(m => m.noSls && m.at === m.pairAt), 'toggle', 'a click on the size pair\'s switch: two maps without SLS, each on its pair\'s position', ms.map(m => [m.f, m.noSls, m.at, m.pairAt]));
  out(ms.every(m => same(m.stops, SEVEN) && same(m.nodes, SEVEN) && same(m.edges, ['abs', 'pos']) && m.svgH === '58' && m.viewBox === '0 0 172 58' && Math.abs(m.rect.h / m.rect.w - 58 / 172) < 0.005), 'toggle', 'no SLS node, stop or path; drawn 172 x 58 (the page zoom aside)', ms.map(m => [m.stops, m.edges, m.viewBox, m.rect.h]));
  out(ts.length === 2 && ts.every(t => t.pressed === 'true' && t.title === HIDE && t.label === HIDE), 'toggle', "both switches pressed, 'Hide the formula map'; the pairs stay", ts.map(t => [t.pressed, t.title]));
  out((await P.ev(ORDER_JS)) === 'pair map math pair map math row', 'toggle', 'the box runs pair, map, formula per formula, then the row', await P.ev(ORDER_JS));
  const fo = await P.ev(`(function(){ var a = document.activeElement; return a && a.classList.contains('fsl-maptoggle') ? a.parentNode.getAttribute('data-f') : null; })()`);
  out(fo === 'order', 'toggle', 'the focus stays on the clicked switch across the rebuild', fo);
  await clickSel(P, toggleSel('index'));
  ts = await toggles(P);
  out((await maps(P)).length === 0 && ts.every(t => t.pressed === 'false' && t.title === SHOW) && (await P.ev(ORDER_JS)) === 'pair math pair math row', 'toggle', "a click on the index pair's switch closes both", ts.map(t => t.pressed));
  await P.load('?mobile=0&mode=multiplicative&n=13&subformularow=both&subformularing=index&gen=5&logbase=2');
  await P.enter();
  await clickSel(P, toggleSel('index'));
  ms = await maps(P);
  out((await toggles(P)).length === 1 && ms.length === 1 && ms[0].f === 'index', 'toggle', 'subformularing=index: one pair, one map when open', ms.map(m => m.f));
  noErrors(P, 'toggle');
  await P.done();
}]);

/* ---------- layout: pair | map | formula on a desktop ---------- */
SCENARIOS.push(['layout', async browser => {
  const P = await openPage(browser, 'layout', { w: 1280, h: 900, ua: UA_DESKTOP });
  await P.load(U13Q);
  await P.enter();
  const closedH = (await P.rect('.ring-hover-formula')).h;
  await P.load(`${U13Q}&fmapopen=1`);
  await P.enter();
  const geo = await P.ev(`(function(){
    var box = document.querySelector('.ring-hover-formula'), rr = function(e){ var r = e.getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height }; };
    return { cols: getComputedStyle(box).gridTemplateColumns.split(' ').length, stacked: box.classList.contains('is-stacked'), h: rr(box).h,
      rows: Array.prototype.map.call(box.querySelectorAll(':scope > .fmap'), function(m){ return { f: m.getAttribute('data-f'), map: rr(m), pair: rr(m.previousElementSibling), line: rr(m.nextElementSibling), lineTag: m.nextElementSibling.localName }; }) };
  })()`);
  out(geo.cols === 3 && !geo.stacked, 'layout', 'at 1280 the box has three columns', geo);
  out(geo.rows.length === 2 && geo.rows.every(r => r.lineTag === 'math' && r.map.x >= r.pair.x + r.pair.w - 0.5 && r.map.x + r.map.w <= r.line.x + 0.5 && r.map.y < r.pair.y + r.pair.h && r.pair.y < r.map.y + r.map.h), 'layout', 'each map lies right of its pair, left of its formula, level with the pair', geo.rows);
  out(geo.h <= closedH + 2, 'layout', `the box is no taller than with the maps closed (${Math.round(geo.h)} <= ${Math.round(closedH)} + 2)`, { open: geo.h, closedH });
  out(await noScroll(P), 'layout', 'no sideways scroll');
  noErrors(P, 'layout');
  await P.done();
}]);

/* ---------- url: fmapopen=1 ---------- */
SCENARIOS.push(['url', async browser => {
  const P = await openPage(browser, 'url', { w: 1280, h: 900, ua: UA_DESKTOP });
  await P.load(U13Q);
  await P.enter();
  await clickSel(P, toggleSel('order'));
  out((await P.param('fmapopen')) === '1', 'url', 'opening writes fmapopen=1', await P.q());
  await clickSel(P, toggleSel('order'));
  out((await P.param('fmapopen')) === null, 'url', 'closing removes it', await P.q());
  await P.load(`${U13Q}&fmapopen=1`);
  await P.enter();
  out((await maps(P)).length === 2 && (await toggles(P)).every(t => t.pressed === 'true'), 'url', 'a load with fmapopen=1 starts open');
  await P.load(`${U13Q}&fmapopen=yes`);
  await P.enter();
  out((await maps(P)).length === 0 && (await P.param('fmapopen')) === null, 'url', 'fmapopen=yes opens nothing and is dropped', await P.q());
  await P.load('?mobile=0&mode=additive&n=12&subformularow=both&subformularing=both&gen=9&fmapopen=1');
  await P.enter();
  const ms = await maps(P);
  // quick 261101-so1: ℤ/12ℤ opens its maps beside its sliders like the other groups
  out(ms.length === 2 && ms.every(m => !m.noSls && m.stops.length === 9) && (await toggles(P)).every(t => t.pressed === 'true') && (await P.ev(ORDER_JS)) === 'pair map math pair map math row', 'url', 'fmapopen=1 on ℤ/12ℤ: its two full maps beside its pairs, the switches on', await P.ev(ORDER_JS));
  const q = new URLSearchParams(await P.q());
  out(q.get('fmapopen') === '1', 'url', 'ℤ/12ℤ keeps fmapopen=1 in the url', Object.fromEntries(q));
  q.set('mode', 'multiplicative'); q.set('n', '13'); q.set('gen', '5'); q.set('logbase', '2');
  await P.load('?' + q.toString());
  await P.enter();
  out((await maps(P)).length === 2 && (await toggles(P)).every(t => t.pressed === 'true'), 'url', 'and on to (ℤ/13ℤ)* from there the maps show open');
  noErrors(P, 'url');
  await P.done();
}]);

/* ---------- sync: the map drives the sliders and the sliders the map ---------- */
SCENARIOS.push(['sync', async browser => {
  const P = await openPage(browser, 'sync', { w: 1280, h: 900, ua: UA_DESKTOP });
  const hb = bothOpen(U13);
  const url = `${UNITS}&gen=${hb.h}&logbase=${hb.b}&fmapopen=1`;
  await P.load(url);
  await P.enter();
  for (const [id, tok] of [['lcm-short', 'lcm-short'], ['pos', 'pos-lcm'], ['jn', 'jn'], ['gcd-full', 'gcd-full']]) {
    await clickSel(P, stopSel('order', id));
    const p = await pairOf(P, 'order'), m = await mapOf(P, 'order'), [c, v] = cvOf(tok);
    const ok = p.token === tok && p.c.now === c && (v === null || p.v.now === v) && m.at === NODE_OF(tok) && (await P.param('fmaporder')) === (tok === 'gcd-full' ? null : tok);
    out(ok, 'sync', `a click on the map's ${id}: the pair goes to ${tok} (${C_TEXT[c]}${v === null ? '' : ', ' + V_TEXT[v]}), fmaporder follows`, { token: p.token, c: p.c.now, v: p.v.now, at: m.at, q: await P.param('fmaporder') });
  }
  await P.ev(`document.querySelector('.fmap[data-f="order"] input:checked').focus()`);
  for (const tok of ['pos-gcd', 'abs-gcd']) {
    await P.key('ArrowRight', 'ArrowRight', 39);
    const p = await pairOf(P, 'order'), m = await mapOf(P, 'order');
    const fo = await P.ev(`(function(){ var a = document.activeElement; return a && a.closest('.fmap') ? a.closest('.fmap').getAttribute('data-f') + '/' + a.value : null; })()`);
    out(p.token === tok && m.at === NODE_OF(tok) && fo === 'order/' + NODE_OF(tok), 'sync', `ArrowRight on the map: ${tok}, the pair follows, the focus stays on the map`, { token: p.token, at: m.at, fo });
  }
  await P.load(url);
  await P.enter();
  for (const [kind, v, tok] of [['complexity', 1, 'gcd-short'], ['form', 0, 'lcm-short'], ['form', 1, 'pos-lcm']]) {
    await clickChip(P, 'order', kind, v);
    await sleep(100);
    const m = await mapOf(P, 'order');
    out(m.at === NODE_OF(tok) && m.checked === NODE_OF(tok) && knobIs(m.knob, NODE_OF(tok)) && (await pairOf(P, 'order')).token === tok, 'sync', `the ${kind} notch ${v}: the map's knob on ${NODE_OF(tok)} (${tok})`, { at: m.at, knob: m.knob, want: knobAt(NODE_OF(tok)) });
  }
  noErrors(P, 'sync');
  await P.done();
}]);

/* ---------- boxes: a new base opens or closes a and a2 on the map ---------- */
SCENARIOS.push(['boxes', async browser => {
  const P = await openPage(browser, 'boxes', { w: 1280, h: 900, ua: UA_DESKTOP });
  const r2 = reach(U13, 2, HS);
  const g = U13.gens.find(x => reach(U13, x, HS).pos !== r2.pos);
  out(g !== undefined, 'boxes', `model: under base ${g} a2 is ${g !== undefined && reach(U13, g, HS).pos ? 'open' : 'closed'} (base 2: ${r2.pos ? 'open' : 'closed'})`);
  out(U13.gens.every(x => reach(U13, x, HS).pos === reach(U13, x, HS).abs), 'boxes', 'model: h=6, a2 and a open together under every base');
  for (const tok of ['gcd-full', 'gcd-short']) {
    await P.load(`${UNITS}&gen=${HS}&logbase=2&fmapopen=1&fmaporder=${tok}`);
    await P.enter();
    let m = await mapOf(P, 'order');
    out(m.closedNodes.includes('pos') === !r2.pos && m.closedEdges.includes('pos') === !r2.pos && m.closedNodes.includes('abs') === !r2.abs, 'boxes', `${tok}, base 2: the map's a2 ${r2.pos ? 'open' : 'closed'}, a ${r2.abs ? 'open' : 'closed'}`, m);
    await clickSel(P, `.ring-hover-formula .lb-box[data-g="${g}"]`);
    const rg = reach(U13, g, HS);
    m = await mapOf(P, 'order');
    const p = await pairOf(P, 'order');
    const neither = tok === 'gcd-full' ? rg.abs : rg.pos;
    out((await P.param('logbase')) === String(g) && m.closedNodes.includes('pos') === !rg.pos && m.closedEdges.includes('pos') === !rg.pos && m.closedNodes.includes('abs') === !rg.abs && m.closedEdges.includes('abs') === !rg.abs, 'boxes', `${tok}: a click on box ${g} makes the map's a2 ${rg.pos ? 'open' : 'closed'} and a ${rg.abs ? 'open' : 'closed'}`, { q: await P.param('logbase'), m });
    out(same(p.v.closed, neither ? [] : [1]), 'boxes', `${tok}: the pair's neither notch (${tok === 'gcd-full' ? 'a' : 'a2'}) follows: ${neither ? 'open' : 'closed'}`, p.v.closed);
  }
  noErrors(P, 'boxes');
  await P.done();
}]);

/* ---------- jnrow: the generator row rule, unchanged ---------- */
SCENARIOS.push(['jnrow', async browser => {
  const P = await openPage(browser, 'jnrow', { w: 1280, h: 900, ua: UA_DESKTOP });
  await P.load(`${UNITS}&gen=5&logbase=2&fmaporder=jn&fmapindex=jn&fmapopen=1`);
  await P.enter();
  out(!(await P.exists('.ring-hover-formula .lb-row')) && (await maps(P)).length === 2, 'jnrow', 'both at JN with the maps open: no row, the maps stay');
  await clickSel(P, stopSel('order', 'gcd-short'));
  out((await P.exists('.ring-hover-formula .lb-row')) && (await P.param('fmaporder')) === 'gcd-short' && (await pairOf(P, 'order')).token === 'gcd-short', 'jnrow', "a click on the map's gcd-short brings the row back", await P.q());
  noErrors(P, 'jnrow');
  await P.done();
}]);

/* ---------- narrow: stacked where the formula would lack room ---------- */
SCENARIOS.push(['narrow', async browser => {
  const geoJs = `(function(){
    var box = document.querySelector('.ring-hover-formula'), rr = function(e){ var r = e.getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height }; };
    return { cols: getComputedStyle(box).gridTemplateColumns.split(' ').length, stacked: box.classList.contains('is-stacked'),
      rows: Array.prototype.map.call(box.querySelectorAll(':scope > .fmap'), function(m){ return { map: rr(m), pair: rr(m.previousElementSibling), line: rr(m.nextElementSibling) }; }) };
  })()`;
  for (const w of [700, 760]) {
    const P = await openPage(browser, 'narrow' + w, { w, h: 900, ua: UA_DESKTOP });
    await P.load(`${U13Q}&fmapopen=1`);
    await P.enter();
    const g = await P.ev(geoJs);
    const below = g.rows.every(r => r.map.y >= r.pair.y + r.pair.h - 0.5 && r.line.y >= r.map.y + r.map.h - 0.5);
    const beside = g.rows.every(r => r.map.x >= r.pair.x + r.pair.w - 0.5 && r.map.x + r.map.w <= r.line.x + 0.5);
    if (w === 700) out(g.rows.length === 2 && g.cols === 1 && below, 'narrow', '700: one column, each map under its pair, its formula under it', g);
    else out(g.rows.length === 2 && ((g.cols === 3 && !g.stacked && beside) || (g.cols === 1 && g.stacked && below)), 'narrow', `760: ${g.stacked ? 'is-stacked, one column, stacked' : 'three columns, side by side'}`, g);
    out(await noScroll(P), 'narrow', `${w}: no sideways scroll`);
    noErrors(P, 'narrow' + w);
    await P.done();
  }
}]);

/* ---------- mobile: the phone page ---------- */
SCENARIOS.push(['mobile', async browser => {
  const P = await openPage(browser, 'mobile', { w: 390, h: 844, ua: UA_ANDROID, touch: true });
  await P.load(`?mobile=1&mode=multiplicative&n=13&gen=5&logbase=2&subformularow=both&subformularing=both&fmapopen=1`);
  await sleep(1000);
  const g = await P.ev(`(function(){
    var box = document.querySelector('.ring-hover-formula'), rr = function(e){ var r = e.getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height }; };
    return { box: rr(box), rows: Array.prototype.map.call(box.querySelectorAll(':scope > .fmap'), function(m){ return { map: rr(m), pair: rr(m.previousElementSibling) }; }) };
  })()`);
  const cx = g.box.x + g.box.w / 2;
  out(g.rows.length === 2 && g.rows.every(r => r.map.y >= r.pair.y + r.pair.h - 0.5 && Math.abs(r.map.x + r.map.w / 2 - cx) <= 2 && Math.abs(r.pair.x + r.pair.w / 2 - cx) <= 2), 'mobile', 'two maps, each under its pair, both centred', g);
  const ts = await toggles(P);
  out(ts.every(t => t.rect && t.notches.every(n => !meets(t.rect, n)) && t.rect.w >= 21.5 && t.rect.h >= 17.5), 'mobile', 'the phone switch (22 x 18) overlaps no notch', ts.map(t => t.rect));
  out(await noScroll(P), 'mobile', 'no sideways scroll');
  await tap(P, stopSel('order', 'lcm-full'));
  out((await pairOf(P, 'order')).token === 'lcm-full' && (await P.param('fmaporder')) === 'lcm-full', 'mobile', "a tap on the map's lcm-full moves the pair", (await pairOf(P, 'order')).token);
  await tap(P, toggleSel('index'));
  out((await maps(P)).length === 0 && (await P.param('fmapopen')) === null, 'mobile', 'a tap on a switch closes both maps', await P.q());
  noErrors(P, 'mobile');
  await P.done();
}]);

/* ---------- ringwin: an extra Ring window keeps its own setting ---------- */
SCENARIOS.push(['ringwin', async browser => {
  const P = await openPage(browser, 'ringwin', { w: 1280, h: 900, ua: UA_DESKTOP });
  await P.load(`${ZN}&gen=1`);
  await P.enter();
  const src = new URL('?ringwin=1&mobile=0&mode=multiplicative&n=13&gen=5&subformularing=both&logbase=2&fmapopen=1', URL_BASE).href;
  await P.ev(`(function(){ window.__rw = []; window.addEventListener('message', function(e){ if (e.data && e.data.ringwin === 'state') window.__rw.push(e.data.q); }); var f = document.createElement('iframe'); f.id = 'probe-rw'; f.style.cssText = 'position:fixed;left:0;top:0;width:900px;height:800px;z-index:99999;border:0'; f.src = ${JSON.stringify(src)}; document.body.appendChild(f); return 1; })()`);
  let ctx = null;
  for (let i = 0; i < 30 && !ctx; i++) {
    await sleep(300);
    const c = await P.paneCtx();
    if (c && (await P.ev(`document.querySelectorAll('.fmap').length === 2 && document.querySelectorAll('.fsl-pair').length === 2`, c).catch(() => false))) ctx = c;
  }
  out(!!ctx, 'ringwin', 'a ?ringwin=1&fmapopen=1 window on (ℤ/13ℤ)* shows two pairs and two maps');
  if (!ctx) { noErrors(P, 'ringwin'); await P.done(); return; }
  await sleep(600);
  await P.ev(`document.querySelector('${toggleSel('order')}').click()`, ctx);
  await sleep(900);
  let last = new URLSearchParams((await P.ev('window.__rw')).pop() || '');
  out(last.get('ringwin') !== null && last.get('fmapopen') === null && (await P.ev(`document.querySelectorAll('.fmap').length`, ctx)) === 0, 'ringwin', "a click on its switch: its maps close, its state message has no fmapopen", Object.fromEntries(last));
  await P.ev(`document.querySelector('${toggleSel('index')}').click()`, ctx);
  await sleep(900);
  last = new URLSearchParams((await P.ev('window.__rw')).pop() || '');
  out(last.get('fmapopen') === '1' && (await P.ev(`document.querySelectorAll('.fmap').length`, ctx)) === 2, 'ringwin', 'a second click: open again, fmapopen=1 in its message', Object.fromEntries(last));
  out((await P.param('fmapopen')) === null, 'ringwin', "the host page's own fmapopen stays unset", await P.q());
  noErrors(P, 'ringwin');
  await P.done();
}]);

/* ---------- pane: the isomorphism pane shares its holder's setting ---------- */
async function openPane(P, query, chipText) {
  await P.load(query);
  await P.enter();
  const hit = await P.ev(`(function(){var cs=Array.prototype.filter.call(document.querySelectorAll('#iso-panel a.iso-chip'), function(a){ return a.textContent.indexOf(${JSON.stringify(chipText)}) !== -1; }); if (cs[0]) cs[0].click(); return cs.length;})()`);
  if (!hit) return null;
  for (let i = 0; i < 30; i++) {
    await sleep(300);
    const c = await P.paneCtx();
    if (c && (await P.ev(`document.querySelectorAll('.fsl-pair').length`, c).catch(() => 0)) === 2) { await sleep(800); return c; }
  }
  return null;
}
SCENARIOS.push(['pane', async browser => {
  const P = await openPage(browser, 'pane', { w: 1500, h: 900, ua: UA_DESKTOP });
  const ctx = await openPane(P, '?mobile=0&mode=additive&n=12&gen=1&subformularing=both&subformularingr=both', 'ℤ/13ℤ,×');
  out(!!ctx, 'pane', 'the pane opens on (ℤ/13ℤ)*, its maps closed');
  if (!ctx) { noErrors(P, 'pane'); await P.done(); return; }
  // quick 261101-so1: the ℤ/12ℤ host has pairs (its maps follow the shared switch); its positions are read
  const hostMaps = () => P.ev(`Array.prototype.map.call(document.querySelectorAll('.fsl-pair'), function(m){ return m.getAttribute('data-token'); })`);
  const h0 = await hostMaps();
  await P.ev(`document.querySelector('${toggleSel('order')}').click()`, ctx);
  await sleep(500);
  out((await maps(P, ctx)).length === 2 && (await P.param('fmapopen')) === '1', 'pane', "a click on the pane's switch opens its two maps; the host url has fmapopen=1", await P.q());
  await sleep(1200);
  out((await maps(P, ctx)).length === 2 && (await toggles(P, ctx)).every(t => t.pressed === 'true'), 'pane', 'still open once the host has shared its state back');
  out(same(await hostMaps(), h0) && h0.length === 2, "pane", "the host's ℤ/12ℤ positions are as they were", { h0, now: await hostMaps() });
  await P.ev(`document.querySelector('${toggleSel('index')}').click()`, ctx);
  await sleep(1200);
  out((await maps(P, ctx)).length === 0 && (await P.param('fmapopen')) === null, 'pane', 'a second click closes it; the host url loses fmapopen', await P.q());
  noErrors(P, 'pane');
  await P.done();
}]);
/* ---------- the open map moving live ---------- */
// The slider-check sampler, extended with the maps: which map stops pulse
// (mpulse) or flash (mset) per formula, each map's position and its closed nodes.
const SAMPLER_MAP = ms => SAMPLER(ms).replace(`anyChip: document.querySelectorAll('.fsl-notch.is-force-pulse, .fsl-notch.is-force-set').length });`,
  `anyChip: document.querySelectorAll('.fsl-notch.is-force-pulse, .fsl-notch.is-force-set').length, mpulse: mst('is-force-pulse'), mset: mst('is-force-set'), mat: mat(), mclosed: mcl(), anyStop: document.querySelectorAll('.fmap-stop.is-force-pulse, .fmap-stop.is-force-set').length });`)
  .replace(`var t = setInterval(function(){`, `var mst = function(c){ var o = {}; document.querySelectorAll('.fmap').forEach(function(m){ o[m.getAttribute('data-f')] = Array.prototype.map.call(m.querySelectorAll('.fmap-stop.' + c), function(x){ return x.getAttribute('data-id'); }); }); return o; };
  var mat = function(){ var o = {}; document.querySelectorAll('.fmap').forEach(function(m){ o[m.getAttribute('data-f')] = m.getAttribute('data-at'); }); return o; };
  var mcl = function(){ var o = {}; document.querySelectorAll('.fmap').forEach(function(m){ o[m.getAttribute('data-f')] = Array.prototype.map.call(m.querySelectorAll('.fmap-node.is-closed'), function(x){ return x.getAttribute('data-id'); }); }); return o; };
  var t = setInterval(function(){`);
// The running CSS transitions on the element sel, by property, and its computed left/top.
const runJs = sel => `(function(){ var e = document.querySelector(${JSON.stringify(sel)}); if (!e) return null; var cs = getComputedStyle(e);
  return { props: e.getAnimations().filter(function(a){ return a.transitionProperty && a.playState === 'running'; }).map(function(a){ return a.transitionProperty; }), left: parseFloat(cs.left), top: parseFloat(cs.top), cls: e.getAttribute('class') }; })()`;
const run = (P, sel, ctx) => P.ev(runJs(sel), ctx);
const KNOB = f => `.fmap[data-f="${f}"] .fmap-knob`;
const between = (x, a, b) => x > Math.min(a, b) + 0.01 && x < Math.max(a, b) - 0.01;
const SL_KNOB = (f, kind) => `.fsl-pair[data-f="${f}"] .fsl[data-kind="${kind}"] .fsl-knob`;

SCENARIOS.push(['live', async browser => {
  const P = await openPage(browser, 'live', { w: 1280, h: 900, ua: UA_DESKTOP });
  const hb = bothOpen(U13);
  const url = `${UNITS}&gen=${hb.h}&logbase=${hb.b}&fmapopen=1`;
  await P.load(url);
  await P.enter();
  // a chip: the map's knob slides from gcd-full to gcd-short
  let c = await chip(P, 'order', 'complexity', 1);
  await click1(P, c.x, c.y);
  await sleep(50);
  let r = await run(P, KNOB('order'));
  out(!!r && r.props.some(p => p === 'left' || p === 'top') && between(r.left, knobAt('gcd-full').left, knobAt('gcd-short').left), 'live', 'a complexity notch: the map knob slides (a running left transition, midway between gcd-full and gcd-short)', r);
  await sleep(500);
  let m = await mapOf(P, 'order');
  r = await run(P, KNOB('order'));
  out(knobIs(m.knob, 'gcd-short') && r.props.length === 0 && Math.abs(r.left - knobAt('gcd-short').left) < 0.6, 'live', 'and after 500 ms it rests on gcd-short', { knob: m.knob, r });
  out((await run(P, `${KNOB('index')}`)).props.length === 0, 'live', "the other map's knob, unmoved, does not move");
  // a map stop: the form slider's knob slides from GCD to LCM
  const k0 = (await run(P, SL_KNOB('order', 'form'))).left;
  c = await centre(P, stopSel('order', 'lcm-short'));
  await click1(P, c.x, c.y);
  await sleep(50);
  r = await run(P, SL_KNOB('order', 'form'));
  await sleep(500);
  const k1 = (await run(P, SL_KNOB('order', 'form'))).left;
  out(!!r && r.props.includes('left') && between(r.left, k0, k1) && (await pairOf(P, 'order')).token === 'lcm-short', 'live', "a map stop: the form slider's knob slides (a running left transition, midway)", { r, k0, k1 });
  // reduced motion: nothing slides, everything lands
  await P.S('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
  await P.load(url);
  await P.enter();
  c = await chip(P, 'order', 'complexity', 1);
  await click1(P, c.x, c.y);
  await sleep(50);
  r = await run(P, KNOB('order'));
  const rs = await run(P, SL_KNOB('order', 'complexity'));
  m = await mapOf(P, 'order');
  out(r.props.length === 0 && rs.props.length === 0 && knobIs(m.knob, 'gcd-short') && Math.abs(r.left - knobAt('gcd-short').left) < 0.6, 'live', 'prefers-reduced-motion: no running transition, the knob already on gcd-short', { r, rs });
  out(!(await P.exists('.fmap-band')), 'live', 'prefers-reduced-motion: no band drawn');
  await P.S('Emulation.setEmulatedMedia', { features: [] });
  noErrors(P, 'live');
  await P.done();
}]);

SCENARIOS.push(['fade', async browser => {
  const P = await openPage(browser, 'fade', { w: 1280, h: 900, ua: UA_DESKTOP });
  const g = U13.gens.find(x => reach(U13, x, HS).pos !== reach(U13, 2, HS).pos);
  await P.load(`${UNITS}&gen=${HS}&logbase=2&fmapopen=1&fmaporder=gcd-full`);
  await P.enter();
  const c = await centre(P, `.ring-hover-formula .lb-box[data-g="${g}"]`);
  await click1(P, c.x, c.y);
  await sleep(60);
  const e = await run(P, '.fmap[data-f="order"] .fmap-edge.is-cond[data-id="pos"]'), n = await run(P, '.fmap[data-f="order"] .fmap-node[data-id="pos"]');
  const open = reach(U13, g, HS).pos;
  out(e.props.includes('stroke') && n.props.includes('opacity'), 'fade', `box ${g}: the a2 path's stroke and node's opacity are transitioning`, { e, n });
  out(/is-closed/.test(e.cls) === !open && /is-closed/.test(n.cls) === !open, 'fade', `and they end ${open ? 'open' : 'closed'}`, { e: e.cls, n: n.cls });
  // quick 261101-so1: ℤ/12ℤ's map sits beside sliders now, so its knob moves on like the others'
  await P.load('?mobile=0&mode=additive&n=12&subformularow=both&subformularing=both&gen=9&fmapopen=1');
  await P.enter();
  const c2 = await centre(P, stopSel('order', 'lcm-full'));
  await click1(P, c2.x, c2.y);
  await sleep(50);
  const z = await run(P, KNOB('order'));
  out(z.props.length > 0 && (await mapOf(P, 'order')).at === 'lcm-full', 'fade', 'ℤ/12ℤ: its knob now moves on by a transition (carried, since 261101-so1)', z);
  noErrors(P, 'fade');
  await P.done();
}]);

/* ---------- force: a double-click on the map's closed a2 ---------- */
async function forceMap(P, scen, name, url, M, h, base, on) {
  const pick = pickModel(M, h, base, 'pos');
  await P.load(url);
  await P.enter();
  const m0 = await mapOf(P, 'order');
  out(!!m0 && m0.closedNodes.includes('pos') && m0.at === 'gcd-short', scen, `${name}: the map open on gcd-short, a2 closed`, m0);
  await P.ev(SAMPLER_MAP(3200));
  const c = await centre(P, on === 'map' ? stopSel('order', 'pos') : chipSel('order', 'form', 1));
  await dbl(P, c.x, c.y);
  await sleep(3000);
  const ss = after0(await samples(P));
  out(same(phasesOf(ss, pick), ['pulse', 'set', 'none']), scen, `${name}: box ${M.at(pick)} pulses, flashes, rests`, phasesOf(ss, pick));
  const ph = key => { const o = []; for (const s of ss) { const x = key(s); if (o[o.length - 1] !== x) o.push(x); } return o; };
  out(same(ph(s => s.mset.order && s.mset.order.includes('pos') ? 'set' : s.mpulse.order && s.mpulse.order.includes('pos') ? 'pulse' : 'none'), ['pulse', 'set', 'none']), scen, `${name}: the map's a2 stop pulses and flashes in step`, ph(s => [s.mpulse.order, s.mset.order].join('|')));
  out(same(ph(s => s.cset.includes('order') ? 'set' : s.cpulse.includes('order') ? 'pulse' : 'none'), ['pulse', 'set', 'none']), scen, `${name}: so does the slider's neither notch`);
  const firstSet = ss.find(s => s.set.includes(pick)), mSet = ss.find(s => s.mset.order && s.mset.order.includes('pos'));
  out(!!firstSet && firstSet.t >= 1000 && firstSet.t <= 1450 && !!mSet && Math.abs(mSet.t - firstSet.t) <= 80, scen, `${name}: the base is set at about 1.1 s, the map stop flashing with the box`, { box: firstSet && firstSet.t, map: mSet && mSet.t });
  const pulses = ss.filter(s => s.pulse.length);
  out(pulses.length > 0 && pulses.every(s => s.base === base && s.maps.order === 'gcd-short' && s.mat.order === 'gcd-short'), scen, `${name}: while it pulses the base, the token and the map stay`, pulses[0]);
  const m1 = await mapOf(P, 'order'), p1 = await pairOf(P, 'order'), q = new URLSearchParams(await P.q());
  out(m1.at === 'pos' && !m1.closedNodes.includes('pos') && knobIs(m1.knob, 'pos') && p1.c.now === 1 && p1.v.now === 1, scen, `${name}: then the map is on a2, open, and the pair on compact / neither`, { m1, p1: [p1.c.now, p1.v.now] });
  out(q.get('logbase') === String(pick) && q.get('fmaporder') === 'pos-gcd', scen, `${name}: url logbase=${pick}, fmaporder=pos-gcd`, Object.fromEntries(q));
}
SCENARIOS.push(['force', async browser => {
  const P = await openPage(browser, 'force', { w: 1280, h: 900, ua: UA_DESKTOP });
  await forceMap(P, 'force', `(ℤ/13ℤ)* h=6 base 2 -> ${pickModel(U13, HS, 2, 'pos')}, on the map`, `${UNITS}&gen=${HS}&logbase=2&fmaporder=gcd-short&fmapopen=1`, U13, HS, 2, 'map');
  let hit = null;
  for (let h = 1; h < E11.N && !hit; h++) for (const b of E11.gens) if (!hit && !reach(E11, b, h).pos && pickModel(E11, h, b, 'pos') !== null) hit = { h, b };
  out(!!hit, 'force', hit ? `curve: h=${E11.at(hit.h)} base ${E11.at(hit.b)} has a2 closed` : 'a curve case');
  if (hit) await forceMap(P, 'force', `curve h=${E11.at(hit.h)} base ${E11.at(hit.b)}, on the map`, `?mobile=0&curve=11,1,3&subformularow=both&subformularing=both&gen=${hit.h}&logbase=${hit.b}&fmaporder=gcd-short&fmapopen=1`, E11, hit.h, hit.b, 'map');
  await forceMap(P, 'force', `(ℤ/13ℤ)* h=6 base 2, on the slider's neither`, `${UNITS}&gen=${HS}&logbase=2&fmaporder=gcd-short&fmapopen=1`, U13, HS, 2, 'slider');
  noErrors(P, 'force');
  await P.done();
}]);

SCENARIOS.push(['lock', async browser => {
  const P = await openPage(browser, 'lock', { w: 1280, h: 900, ua: UA_DESKTOP });
  await P.load(`${UNITS}&gen=${HS}&logbase=2&fmaporder=gcd-short&logbaselock=1&fmapopen=1`);
  await P.enter();
  await P.ev(SAMPLER_MAP(2000));
  const c = await centre(P, stopSel('order', 'pos'));
  await dbl(P, c.x, c.y);
  await sleep(150);
  out(await P.exists('.lb-lock.is-alarm'), 'lock', "a double-click on the map's closed a2: the padlock sounds its alarm");
  await sleep(1900);
  const ss = after0(await samples(P));
  out(ss.length > 0 && ss.every(s => !s.pulse.length && !s.set.length && !s.anyChip && !s.anyStop), 'lock', 'no force class on any box, notch or map stop', ss.find(s => s.pulse.length || s.set.length || s.anyChip || s.anyStop));
  out((await P.param('logbase')) === '2' && (await pairOf(P, 'order')).token === 'gcd-short' && (await mapOf(P, 'order')).at === 'gcd-short', 'lock', 'the base, the token and the map unchanged', await P.q());
  noErrors(P, 'lock');
  await P.done();
}]);

SCENARIOS.push(['settle', async browser => {
  const P = await openPage(browser, 'settle', { w: 1280, h: 900, ua: UA_DESKTOP });
  const h0 = [...Array(13).keys()].find(h => h > 0 && reach(U13, 2, h).pos && reach(U13, 2, h).q !== 12 && reach(U13, 2, h).q !== 1);
  for (const h1 of [...Array(13).keys()].filter(h => h > 1 && !reach(U13, 2, h).pos).slice(0, 2)) {
    const want = settleModel('pos-gcd', reach(U13, 2, h1));
    await P.load(`${UNITS}&gen=${h0}&logbase=2&fmaporder=pos-gcd&fmapopen=1`);
    await P.enter();
    const r = await P.ev(`new Promise(function(res){ var row = document.querySelector('.subgroup-row[data-gen="${h1}"]'); if (!row) return res(null); row.click(); setTimeout(function(){ res(${runJs(KNOB('order'))}); }, 50); })`);
    await sleep(700);
    const m = await mapOf(P, 'order'), p = await pairOf(P, 'order');
    out(!!r && r.props.some(x => x === 'left' || x === 'top') && m.at === NODE_OF(want) && p.token === want && knobIs(m.knob, NODE_OF(want)), 'settle', `pos-gcd at h=${h0}, then h=${h1}: the map and the pair settle to ${want}, the knob sliding there`, { r, at: m.at, token: p.token });
  }
  noErrors(P, 'settle');
  await P.done();
}]);

SCENARIOS.push(['band', async browser => {
  const P = await openPage(browser, 'band', { w: 1280, h: 900, ua: UA_DESKTOP });
  const hb = bothOpen(U13);
  await P.load(`${UNITS}&gen=${hb.h}&logbase=${hb.b}&fmapopen=1`);
  await P.enter();
  const bands = () => P.ev(`Array.prototype.map.call(document.querySelectorAll('.fmap-band'), function(b){ return { f: b.closest('.fmap').getAttribute('data-f'), kind: b.getAttribute('data-kind'), x: +b.getAttribute('x'), y: +b.getAttribute('y'), w: +b.getAttribute('width'), h: +b.getAttribute('height'), first: b.parentNode.firstElementChild === b, running: b.getAnimations().some(function(a){ return a.playState === 'running'; }) }; })`);
  await clickChip(P, 'order', 'complexity', 1);
  let b = await bands();
  out(b.length === 1 && b[0].f === 'order' && b[0].kind === 'complexity' && b[0].x === 62 - 18 && b[0].w === 36 && b[0].h === 58 && b[0].first, 'band', 'a complexity notch: one column band, at compact\'s column, behind everything', b);
  await clickChip(P, 'order', 'form', 0);
  b = await bands();
  out(b.length === 1 && b[0].kind === 'form' && b[0].y === 47 - 9 && b[0].h === 18 && b[0].w === 172, 'band', "a form notch: one row band, at LCM's row", b);
  await sleep(1200);
  b = await bands();
  out(b.every(x => !x.running), 'band', 'after 1.2 s no band is animating', b);
  await clickSel(P, stopSel('order', 'gcd-full'));
  out((await bands()).length === 0, 'band', 'a map stop gives no band', await bands());
  noErrors(P, 'band');
  await P.done();
}]);

/* ---------- shot: light screenshots ---------- */
SCENARIOS.push(['shot', async browser => {
  const P = await openPage(browser, 'shot', { w: 1280, h: 900, ua: UA_DESKTOP });
  await P.S('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: 'light' }] });
  const clipOf = async (w) => { const r = await P.rect('.ring-hover-formula'); return { x: Math.max(0, r.x - 8), y: Math.max(0, r.y - 8), width: Math.min(r.w + 16, w), height: r.h + 16 }; };
  await P.load(`${UNITS}&gen=5&logbase=2&fmapopen=1`);
  await P.enter();
  await P.shot('shot-maptoggle-open-light.png', await clipOf(1280));
  // mid-band, for judging the band: a complexity notch, 250 ms on
  const bc = await chip(P, 'order', 'complexity', 1), bclip = await clipOf(1280);
  await click1(P, bc.x, bc.y);
  await P.S('Input.dispatchMouseEvent', { type: 'mouseMoved', x: 2, y: 2 });
  await sleep(250);
  await P.shot('shot-maptoggle-band-light.png', bclip);
  await P.load(`${UNITS}&gen=5&logbase=2`);
  await P.enter();
  await P.shot('shot-maptoggle-closed-light.png', await clipOf(1280));
  await P.done();
  const M = await openPage(browser, 'shot-mobile', { w: 390, h: 844, ua: UA_ANDROID, touch: true });
  await M.S('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: 'light' }] });
  await M.load(`?mobile=1&mode=multiplicative&n=13&gen=5&logbase=2&subformularow=both&subformularing=both&fmapopen=1`);
  await sleep(1000);
  await M.ev(`document.querySelector('.ring-hover-formula').scrollIntoView({ block: 'center' })`);
  await sleep(300);
  const r = await M.rect('.ring-hover-formula'), sy = await M.ev('window.scrollY');
  await M.shot('shot-maptoggle-mobile-light.png', { x: 0, y: Math.max(0, r.y + sy - 8), width: 390, height: Math.min(r.h + 16, 844) });
  noErrors(P, 'shot');
  noErrors(M, 'shot-mobile');
  await M.done();
}]);

const browser = await connect();
try {
  for (const [name, fn] of SCENARIOS) if (want(name) && (ONLY.includes(name) || !['shot'].includes(name))) await fn(browser);
} catch (e) {
  fails++;
  console.log('FAIL probe-crashed ' + (e && e.stack || e));
}
browser.close();
console.log(fails === 0 ? 'MAP-TOGGLE-CHECK OK' : `MAP-TOGGLE-CHECK FAIL: ${fails}`);
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
