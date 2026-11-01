// CDP probe of Cyclic Groups' refused complexity move (quick 261101-ix2): on
// a cyclic (ℤ/nℤ)* or curve whose form slider shows neither, a Complexity
// notch whose neither node (a2 at compact, a at complete) the logarithm base
// leaves shut is refused (no state, no url) and flashes: that notch, the
// neither notch, the boxes' green/red hint, the padlock nudge when locked, an
// open map's node. A double-click on it forces the nearest base that opens it.
// The harness, the models and the helpers are copied unchanged from
// 261031-wef's slider-check.mjs; every expectation comes from those models.
//   node blocked-check.mjs [syntax] [refuse] [keys] [force] [lock] [map] [open]   (none: all of these)
//   node blocked-check.mjs shot    a light screenshot mid-flash into this dir
//   node slider-check.mjs shot    two light screenshots into this dir
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
const PORT = 9371;
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
const profile = mkdtempSync(join(tmpdir(), 'cg-blocked-'));
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


/* ---------- this probe ---------- */
// The flash state of formula f's pair (and of its open map): which complexity
// notches flash red (cno) or are blocked, whether the form's neither notch
// flashes (vno), their tooltips and animation delays, an open map's flashing
// stops, the knobs' inline left, and any force class anywhere.
const FLASH_JS = f => `(function(){
  var p = document.querySelector('.fsl-pair[data-f="${f}"]');
  if (!p) return null;
  var cs = Array.prototype.slice.call(p.querySelectorAll('.fsl[data-kind="complexity"] .fsl-notch'));
  var nv = p.querySelector('.fsl[data-kind="form"] .fsl-notch[data-v="1"]');
  var v = function(c){ return +c.getAttribute('data-v'); };
  return {
    cno: cs.filter(function(c){ return c.classList.contains('is-flash-no'); }).map(v),
    blocked: cs.filter(function(c){ return c.classList.contains('is-blocked'); }).map(v),
    titles: cs.map(function(c){ return c.title; }),
    delays: cs.map(function(c){ return c.style.animationDelay; }),
    vno: nv.classList.contains('is-flash-no'), vdelay: nv.style.animationDelay,
    stops: Array.prototype.map.call(document.querySelectorAll('.fmap[data-f="${f}"] .fmap-stop.is-flash-no'), function(s){ return s.getAttribute('data-id'); }),
    stopDelay: (document.querySelector('.fmap[data-f="${f}"] .fmap-stop.is-flash-no') || { style: {} }).style.animationDelay || '',
    anyNo: document.querySelectorAll('.fsl-notch.is-flash-no, .fmap-stop.is-flash-no').length,
    knobs: Array.prototype.map.call(p.querySelectorAll('.fsl-knob'), function(k){ return k.style.left; }),
    force: document.querySelectorAll('.is-force-pulse, .is-force-set').length
  };
})()`;
const flash = (P, f = 'order') => P.ev(FLASH_JS(f));
const BLOCKED_TIP = /base first/;
// Every 40 ms for ms: the force classes on boxes, on the order pair's
// complexity notch cv and neither notch, and on an open map's stop; the base
// and the order token. t is relative to the last dblclick heard.
const BSAMPLER = (ms, cv) => `(function(){
  window.__bs = []; window.__bt0 = null;
  if (!window.__bsHooked){ window.__bsHooked = true; document.addEventListener('dblclick', function(){ window.__bt0 = performance.now(); }, true); }
  var cls = function(el){ return !el ? 'none' : el.classList.contains('is-force-set') ? 'set' : el.classList.contains('is-force-pulse') ? 'pulse' : 'none'; };
  var t = setInterval(function(){
    var p = document.querySelector('.fsl-pair[data-f="order"]');
    var lit = document.querySelector('.ring-hover-formula .lb-list input:checked');
    var boxes = function(c){ return Array.prototype.map.call(document.querySelectorAll('.ring-hover-formula .lb-box.' + c), function(b){ return +b.getAttribute('data-g'); }); };
    window.__bs.push({ t: window.__bt0 === null ? null : Math.round(performance.now() - window.__bt0),
      pulse: boxes('is-force-pulse'), set: boxes('is-force-set'), base: lit ? +lit.value : null,
      at: p ? p.getAttribute('data-at') : null, token: p ? p.getAttribute('data-token') : null,
      c: cls(p && p.querySelector('.fsl[data-kind="complexity"] .fsl-notch[data-v="${cv}"]')),
      n: cls(p && p.querySelector('.fsl[data-kind="form"] .fsl-notch[data-v="1"]')),
      stop: cls(document.querySelector('.fmap[data-f="order"] .fmap-stop[data-id="${cv === 1 ? 'pos' : 'abs'}"]')) });
  }, 40);
  setTimeout(function(){ clearInterval(t); }, ${ms});
  return 1;
})()`;
const bsamples = P => P.ev('window.__bs');
const seq = (ss, k) => { const ph = []; for (const s of ss) if (ph[ph.length - 1] !== s[k]) ph.push(s[k]); return ph; };
const H = 5, B = 2;   // (ℤ/13ℤ)* h=5 base 2: a open, a2 shut
const AT = (row, extra = '') => `${UNITS}&gen=${H}&logbase=${B}&fmaporder=abs-${row}${extra}`;

/* ---------- syntax ---------- */
SCENARIOS.push(['syntax', async () => {
  const html = readFileSync(PAGE, 'utf8');
  let count = 0, bad = [];
  for (const mt of html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g)) {
    count++;
    try { new vm.Script(mt[1]); } catch (e) { bad.push(String(e)); }
  }
  out(count > 0 && bad.length === 0, 'syntax', `${count} inline scripts parse`, bad);
  const rc = reach(U13, B, H);
  out(rc.abs && !rc.pos, 'syntax', 'model: (ℤ/13ℤ)* h=5 base 2 has a open and a2 shut', rc);
}]);

/* ---------- refuse: a click or a drag onto a blocked complexity notch ---------- */
SCENARIOS.push(['refuse', async browser => {
  const P = await openPage(browser, 'refuse', { w: 1280, h: 900, ua: UA_DESKTOP });
  for (const row of ['lcm', 'gcd']) {
    await P.load(AT(row));
    await P.enter();
    const q0 = await P.q(), p0 = await pairOf(P, 'order'), f0 = await flash(P);
    out(p0.token === `abs-${row}` && p0.c.now === 2 && p0.v.now === 1 && same(p0.v.closed, []), 'refuse', `abs-${row}: complete / neither, open`, p0);
    out(same(f0.blocked, [1]) && BLOCKED_TIP.test(f0.titles[1]) && !BLOCKED_TIP.test(f0.titles[0]) && !BLOCKED_TIP.test(f0.titles[2]) && f0.anyNo === 0, 'refuse', `abs-${row}: only the compact notch is blocked, its tooltip says the base must change first`, f0);
    const c = await chip(P, 'order', 'complexity', 1);
    await click1(P, c.x, c.y);
    await sleep(150);
    const p1 = await pairOf(P, 'order'), f1 = await flash(P), r1 = await rowNow(P);
    out(p1.token === `abs-${row}` && p1.c.now === 2 && p1.v.now === 1 && (await P.q()) === q0, 'refuse', `abs-${row}: a click on compact is refused (complete / neither, url unchanged)`, { p1, q: await P.q(), q0 });
    out(same(f1.cno, [1]) && f1.vno && f1.anyNo === 2, 'refuse', `abs-${row}: the compact notch and the neither notch flash red`, f1);
    out(!!r1 && same(sortN(r1.ok), okOf(U13, H, 'pos')) && same(sortN(r1.no), noOf(U13, H, 'pos')), 'refuse', `abs-${row}: the boxes flash green ${okOf(U13, H, 'pos')}, red ${noOf(U13, H, 'pos')}`, r1 && { ok: r1.ok, no: r1.no });
    out(!(await P.exists('.lb-lock.is-nudge')), 'refuse', `abs-${row}: the padlock open, no nudge`);
    await sleep(1300);
    const f2 = await flash(P), r2 = await rowNow(P);
    out(f2.anyNo === 0 && r2.ok.length === 0 && r2.no.length === 0 && (await P.q()) === q0, 'refuse', `abs-${row}: the flash is gone after 1.3 s, still nothing changed`, { f2, r2 });
  }
  // a drag from complete to compact, released there
  await P.load(AT('lcm'));
  await P.enter();
  let q0 = await P.q();
  await drag(P, await chip(P, 'order', 'complexity', 2), await chip(P, 'order', 'complexity', 1));
  let p = await pairOf(P, 'order'), f = await flash(P);
  out(p.token === 'abs-lcm' && (await P.q()) === q0 && same(f.cno, [1]) && f.vno && f.knobs.every(k => k === ''), 'refuse', 'a drag released on compact: refused, flashing, the knob back on complete', { token: p.token, f });
  // from JN with neither remembered: compact is refused, complete is open
  await P.load(AT('lcm'));
  await P.enter();
  await clickChip(P, 'order', 'complexity', 0);
  p = await pairOf(P, 'order');
  out(p.token === 'jn' && p.v.now === 1 && p.v.inert, 'refuse', 'abs-lcm -> JN: jn, the resting form slider on neither', p);
  q0 = await P.q();
  out(same((await flash(P)).blocked, [1]), 'refuse', 'at JN with neither remembered: compact blocked, complete not', (await flash(P)).blocked);
  let c = await chip(P, 'order', 'complexity', 1);
  await click1(P, c.x, c.y);
  await sleep(150);
  p = await pairOf(P, 'order'); f = await flash(P);
  out(p.token === 'jn' && (await P.q()) === q0 && same(f.cno, [1]) && f.vno, 'refuse', 'JN -> compact: refused (jn, url unchanged), compact and the resting neither notch flash', { token: p.token, f });
  await sleep(1300);
  await clickChip(P, 'order', 'complexity', 2);
  out((await pairOf(P, 'order')).token === 'abs-lcm' && (await flash(P)).anyNo === 0, 'refuse', 'JN -> complete: abs-lcm (a is open)', (await pairOf(P, 'order')).token);
  // a base that shuts a too, chosen at JN: compact and complete are both refused
  let jc = null;
  for (const M of [U13, unitsModel(19)]) for (let h = 2; h < M.n && !jc; h++) {
    if (gcd(h, M.n) !== 1) continue;
    const bo = M.gens.find(g => reach(M, g, h).abs), bn = M.gens.find(g => !reach(M, g, h).abs);
    if (bo !== undefined && bn !== undefined) jc = { M, h, bo, bn };
  }
  out(!!jc, 'refuse', jc ? `model: (ℤ/${jc.M.n}ℤ)* h=${jc.h} has a open under base ${jc.bo}, a shut under base ${jc.bn}` : 'a case with a shut');
  if (jc) {
    await P.load(`?mobile=0&mode=multiplicative&n=${jc.M.n}&subformularow=both&subformularing=both&gen=${jc.h}&logbase=${jc.bo}&fmaporder=abs-gcd`);
    await P.enter();
    await clickChip(P, 'order', 'complexity', 0);
    const bc = await centre(P, `.ring-hover-formula .lb-box[data-g="${jc.bn}"]`);
    await P.mouse(bc.x, bc.y);
    p = await pairOf(P, 'order');
    out(p.token === 'jn' && (await P.param('logbase')) === String(jc.bn) && same((await flash(P)).blocked, [1, 2]), 'refuse', `JN, base ${jc.bn}: both compact and complete blocked`, { token: p.token, b: await P.param('logbase'), blocked: (await flash(P)).blocked });
    q0 = await P.q();
    c = await chip(P, 'order', 'complexity', 2);
    await click1(P, c.x, c.y);
    await sleep(150);
    f = await flash(P); const r = await rowNow(P);
    out((await pairOf(P, 'order')).token === 'jn' && (await P.q()) === q0 && same(f.cno, [2]) && f.vno && same(sortN(r.ok), okOf(jc.M, jc.h, 'abs')) && same(sortN(r.no), noOf(jc.M, jc.h, 'abs')), 'refuse', `JN -> complete refused: complete flashes, boxes green ${okOf(jc.M, jc.h, 'abs')} (where a opens)`, { f, ok: r.ok, no: r.no });
    await sleep(1300);
    c = await chip(P, 'order', 'complexity', 1);
    await click1(P, c.x, c.y);
    await sleep(150);
    f = await flash(P);
    out((await pairOf(P, 'order')).token === 'jn' && (await P.q()) === q0 && same(f.cno, [1]) && f.vno, 'refuse', 'JN -> compact refused too', f);
  }
  // a curve: a open, a2 shut
  let hit = null;
  for (let h = 1; h < E11.N && !hit; h++) for (const b of E11.gens) if (!hit && reach(E11, b, h).abs && !reach(E11, b, h).pos && pickModel(E11, h, b, 'pos') !== null) hit = { h, b };
  out(!!hit, 'refuse', hit ? `curve: h=${E11.at(hit.h)} base ${E11.at(hit.b)} has a open and a2 shut` : 'a curve case');
  if (hit) {
    await P.load(`?mobile=0&curve=11,1,3&subformularow=both&subformularing=both&gen=${hit.h}&logbase=${hit.b}&fmaporder=abs-gcd`);
    await P.enter();
    q0 = await P.q();
    c = await chip(P, 'order', 'complexity', 1);
    await click1(P, c.x, c.y);
    await sleep(150);
    f = await flash(P); const r = await rowNow(P);
    out((await pairOf(P, 'order')).token === 'abs-gcd' && (await P.q()) === q0 && same(f.cno, [1]) && f.vno && same(sortN(r.ok), okOf(E11, hit.h, 'pos')), 'refuse', 'curve: complete -> compact refused, flashing, boxes per the model', { f, ok: r.ok });
  }
  noErrors(P, 'refuse');
  await P.done();
}]);

/* ---------- keys: the arrows are refused at a blocked notch, never skip it ---------- */
SCENARIOS.push(['keys', async browser => {
  const P = await openPage(browser, 'keys', { w: 1280, h: 900, ua: UA_DESKTOP });
  await P.load(AT('lcm'));
  await P.enter();
  await P.ev(`document.querySelector('.fsl-pair[data-f="order"] .fsl[data-kind="complexity"]').focus()`);
  const focus = () => P.ev(`(function(){var a=document.activeElement, p=a&&a.closest&&a.closest('.fsl-pair'); return p ? p.getAttribute('data-f') + '/' + a.getAttribute('data-kind') : null; })()`);
  let q0 = await P.q();
  for (const [key, vk] of [['ArrowLeft', 37], ['ArrowDown', 40]]) {
    await P.key(key, key, vk);   // P.key waits 500 ms: the flash is still running
    const f = await flash(P);
    out((await pairOf(P, 'order')).token === 'abs-lcm' && (await P.q()) === q0 && (await focus()) === 'order/complexity' && same(f.cno, [1]) && f.vno, 'keys', `${key} at complete: refused (abs-lcm, url unchanged, focus kept), compact flashes`, { t: (await pairOf(P, 'order')).token, fo: await focus(), f });
    await sleep(900);
  }
  await P.key('Home', 'Home', 36);
  out((await pairOf(P, 'order')).token === 'jn' && (await focus()) === 'order/complexity', 'keys', 'Home: jn (JN is never blocked)', (await pairOf(P, 'order')).token);
  await sleep(700);
  q0 = await P.q();
  await P.key('ArrowRight', 'ArrowRight', 39);
  let f = await flash(P);
  out((await pairOf(P, 'order')).token === 'jn' && (await P.q()) === q0 && same(f.cno, [1]) && (await focus()) === 'order/complexity', 'keys', 'ArrowRight at JN: refused at compact, not skipped to complete', { t: (await pairOf(P, 'order')).token, f });
  await sleep(900);
  await P.key('ArrowUp', 'ArrowUp', 38);
  out((await pairOf(P, 'order')).token === 'jn' && same((await flash(P)).cno, [1]), 'keys', 'ArrowUp at JN: refused the same way', (await pairOf(P, 'order')).token);
  await sleep(900);
  await P.key('End', 'End', 35);
  out((await pairOf(P, 'order')).token === 'abs-lcm' && (await P.param('fmaporder')) === 'abs-lcm', 'keys', 'End: abs-lcm (complete is open)', await P.q());
  noErrors(P, 'keys');
  await P.done();
}]);

/* ---------- force: a double-click on a blocked notch forces its base ---------- */
async function forceBlocked(P, name, fromJn) {
  const pick = pickModel(U13, H, B, 'pos');
  await P.load(AT('lcm'));
  await P.enter();
  if (fromJn) await clickChip(P, 'order', 'complexity', 0);
  const tok0 = fromJn ? 'jn' : 'abs-lcm';
  out((await pairOf(P, 'order')).token === tok0, 'force', `${name}: starts on ${tok0}`, (await pairOf(P, 'order')).token);
  await P.ev(BSAMPLER(3200, 1));
  const c = await chip(P, 'order', 'complexity', 1);
  await dbl(P, c.x, c.y);
  await sleep(3000);
  const ss = (await bsamples(P)).filter(s => s.t !== null && s.t >= 0);
  const ph = []; for (const s of ss) { const x = s.set.includes(pick) ? 'set' : s.pulse.includes(pick) ? 'pulse' : 'none'; if (ph[ph.length - 1] !== x) ph.push(x); }
  out(same(ph, ['pulse', 'set', 'none']), 'force', `${name}: box ${pick} pulses, flashes as the chosen base, then rests`, ph);
  out(same(seq(ss, 'c'), ['pulse', 'set', 'none']) && same(seq(ss, 'n'), ['pulse', 'set', 'none']), 'force', `${name}: the compact notch and the neither notch pulse and flash in step`, { c: seq(ss, 'c'), n: seq(ss, 'n') });
  const pulses = ss.filter(s => s.pulse.length);
  out(pulses.length > 0 && pulses.every(s => s.base === B && s.token === tok0), 'force', `${name}: while it pulses the base and the token stay`, pulses[0]);
  const firstSet = ss.find(s => s.set.includes(pick));
  out(!!firstSet && firstSet.t >= 1000 && firstSet.t <= 1450 && firstSet.base === pick && firstSet.at === 'pos', 'force', `${name}: at about 1.1 s the base is ${pick} and the order formula on a2`, firstSet);
  const q = new URLSearchParams(await P.q()), p = await pairOf(P, 'order');
  out(q.get('logbase') === String(pick) && q.get('fmaporder') === 'pos-lcm' && p.c.now === 1 && p.v.now === 1 && same(p.v.closed, []), 'force', `${name}: url logbase=${pick}, fmaporder=pos-lcm, sliders compact / neither (the LCM row kept)`, { q: Object.fromEntries(q), c: p.c.now, v: p.v.now });
  const f = await P.formulas();
  out(same(plains(f.ring), wantPair(U13, pick, H, 'pos-lcm', 'gcd-full')), 'force', `${name}: the formulas take log base ${pick}`, plains(f.ring));
}
SCENARIOS.push(['force', async browser => {
  const P = await openPage(browser, 'force', { w: 1280, h: 900, ua: UA_DESKTOP });
  await forceBlocked(P, 'complete -> compact', false);
  await forceBlocked(P, 'JN -> compact', true);
  noErrors(P, 'force');
  await P.done();
}]);

/* ---------- lock: the padlock closed ---------- */
SCENARIOS.push(['lock', async browser => {
  const P = await openPage(browser, 'lock', { w: 1280, h: 900, ua: UA_DESKTOP });
  await P.load(AT('lcm', '&logbaselock=1'));
  await P.enter();
  const q0 = await P.q();
  let c = await chip(P, 'order', 'complexity', 1);
  await click1(P, c.x, c.y);
  await sleep(120);
  const f = await flash(P), r = await rowNow(P);
  out(await P.exists('.lb-lock.is-nudge'), 'lock', 'a click on the blocked compact nudges the padlock (.lb-lock.is-nudge)');
  out(same(f.cno, [1]) && f.vno && r.ok.length + r.no.length === U13.gens.length && (await pairOf(P, 'order')).token === 'abs-lcm' && (await P.q()) === q0, 'lock', 'and still refuses with the flash (notches and boxes), nothing changed', { f, ok: r.ok, no: r.no });
  await sleep(1300);
  await P.ev(BSAMPLER(2000, 1));
  c = await chip(P, 'order', 'complexity', 1);
  await dbl(P, c.x, c.y);
  await sleep(150);
  out(await P.exists('.lb-lock.is-alarm'), 'lock', 'a double-click sounds the alarm (.lb-lock.is-alarm)');
  await sleep(1900);
  const ss = (await bsamples(P)).filter(s => s.t !== null && s.t >= 0);
  out(ss.length > 0 && ss.every(s => !s.pulse.length && !s.set.length && s.c === 'none' && s.n === 'none'), 'lock', 'no force class on any box or notch', ss.find(s => s.pulse.length || s.set.length || s.c !== 'none'));
  out((await P.param('logbase')) === String(B) && (await pairOf(P, 'order')).token === 'abs-lcm' && (await P.q()) === q0, 'lock', 'the base and the token unchanged', await P.q());
  noErrors(P, 'lock');
  await P.done();
}]);

/* ---------- map: an open map's node flashes, and a rebuild carries the flash ---------- */
SCENARIOS.push(['map', async browser => {
  const P = await openPage(browser, 'map', { w: 1280, h: 900, ua: UA_DESKTOP });
  await P.load(AT('lcm', '&fmapopen=1'));
  await P.enter();
  out(await P.exists('.fmap[data-f="order"]'), 'map', 'the formula map is open beside the sliders');
  let c = await chip(P, 'order', 'complexity', 1);
  await click1(P, c.x, c.y);
  await sleep(150);
  let f = await flash(P);
  out(same(f.stops, ['pos']) && same(f.cno, [1]) && f.vno && f.anyNo === 3, 'map', "the order map's a2 node flashes red with the two notches (and nothing else)", f);
  out((await flash(P, 'index')).stops.length === 0, 'map', "the index map's nodes do not flash");
  await sleep(1300);
  out((await flash(P)).anyNo === 0, 'map', 'gone after 1.3 s');
  // a double-click with the map open: its a2 node pulses with the box
  await P.ev(BSAMPLER(2600, 1));
  c = await chip(P, 'order', 'complexity', 1);
  await dbl(P, c.x, c.y);
  await sleep(2500);
  const ss = (await bsamples(P)).filter(s => s.t !== null && s.t >= 0);
  out(same(seq(ss, 'stop'), ['pulse', 'set', 'none']) && (await pairOf(P, 'order')).token === 'pos-lcm', 'map', "a double-click: the map's a2 node pulses and flashes, the formula lands on pos-lcm", { stop: seq(ss, 'stop'), t: (await pairOf(P, 'order')).token });
  // a rebuild mid-flash (the map toggle) carries the flash onto the new box
  await P.load(AT('lcm'));
  await P.enter();
  c = await chip(P, 'order', 'complexity', 1);
  await click1(P, c.x, c.y);
  await sleep(300);
  await P.clickEl('.fsl-pair[data-f="order"] .fsl-maptoggle');
  await sleep(60);
  f = await flash(P);
  out(await P.exists('.fmap[data-f="order"]'), 'map', 'the toggle opened the map (the box rebuilt)');
  out(same(f.cno, [1]) && f.vno && same(f.stops, ['pos']) && /^-\d/.test(f.delays[1]) && /^-\d/.test(f.vdelay) && /^-\d/.test(f.stopDelay), 'map', 'the rebuilt notches and the new map node carry the flash, as far along as it is (negative delay)', f);
  await sleep(1100);
  out((await flash(P)).anyNo === 0 && (await pairOf(P, 'order')).token === 'abs-lcm', 'map', 'and it ends on time, nothing moved', await flash(P));
  noErrors(P, 'map');
  await P.done();
}]);

/* ---------- open: moves onto open cells are unchanged ---------- */
SCENARIOS.push(['open', async browser => {
  const P = await openPage(browser, 'open', { w: 1280, h: 900, ua: UA_DESKTOP });
  const hb = bothOpen(U13);
  await P.load(`${UNITS}&gen=${hb.h}&logbase=${hb.b}&fmaporder=abs-lcm`);
  await P.enter();
  out(same((await flash(P)).blocked, []), 'open', `h=${hb.h} base ${hb.b} (a and a2 open): no notch blocked`, (await flash(P)).blocked);
  for (const [v, tok] of [[1, 'pos-lcm'], [2, 'abs-lcm'], [0, 'jn'], [1, 'pos-lcm']]) {
    await clickChip(P, 'order', 'complexity', v);
    out((await pairOf(P, 'order')).token === tok && (await P.param('fmaporder')) === tok && (await flash(P)).anyNo === 0, 'open', `complexity ${C_TEXT[v]}: ${tok}, no flash`, { t: (await pairOf(P, 'order')).token, q: await P.q() });
  }
  await P.ev(`document.querySelector('.fsl-pair[data-f="order"] .fsl[data-kind="complexity"]').focus()`);
  await P.key('ArrowRight', 'ArrowRight', 39);
  out((await pairOf(P, 'order')).token === 'abs-lcm', 'open', 'ArrowRight from compact / neither: abs-lcm', (await pairOf(P, 'order')).token);
  // base 2, h=5 (a2 shut): moves that keep GCD or LCM are open
  await P.load(`${UNITS}&gen=${H}&logbase=${B}`);
  await P.enter();
  out(same((await flash(P)).blocked, []), 'open', 'gcd-full under base 2: no notch blocked (the form is GCD)', (await flash(P)).blocked);
  await clickChip(P, 'order', 'complexity', 1);
  out((await pairOf(P, 'order')).token === 'gcd-short' && (await flash(P)).anyNo === 0, 'open', 'gcd-full -> compact: gcd-short', (await pairOf(P, 'order')).token);
  await P.load(AT('lcm'));
  await P.enter();
  await clickChip(P, 'order', 'form', 0);
  out((await pairOf(P, 'order')).token === 'lcm-full', 'open', 'abs-lcm -> form LCM: lcm-full', (await pairOf(P, 'order')).token);
  await clickChip(P, 'order', 'complexity', 1);
  out((await pairOf(P, 'order')).token === 'lcm-short' && (await flash(P)).anyNo === 0, 'open', 'lcm-full -> compact: lcm-short, no flash', (await pairOf(P, 'order')).token);
  await clickChip(P, 'order', 'complexity', 0);
  await clickChip(P, 'order', 'complexity', 2);
  out((await pairOf(P, 'order')).token === 'lcm-full', 'open', 'JN with LCM remembered -> complete: lcm-full', (await pairOf(P, 'order')).token);
  noErrors(P, 'open');
  await P.done();
}]);

/* ---------- shot: a light screenshot mid-flash (not in the default run) ---------- */
SCENARIOS.push(['shot', async browser => {
  const P = await openPage(browser, 'shot', { w: 1280, h: 900, ua: UA_DESKTOP });
  await P.S('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: 'light' }] });
  await P.load(AT('lcm', '&fmapopen=1'));
  await P.enter();
  const c = await chip(P, 'order', 'complexity', 1);
  await click1(P, c.x, c.y);
  await sleep(250);
  const box = await P.ev(`(function(){ var r = document.querySelector('.ring-hover-formula').getBoundingClientRect(); return { x: Math.max(0, r.left - 8), y: Math.max(0, r.top - 8), width: r.width + 16, height: r.height + 16 }; })()`);
  await P.shot('shot-blocked-flash-light.png', box);
  out(true, 'shot', 'shot-blocked-flash-light.png written');
  noErrors(P, 'shot');
  await P.done();
}]);

const browser = await connect();
try {
  for (const [name, fn] of SCENARIOS) if (want(name) && (ONLY.includes(name) || name !== 'shot')) await fn(browser);
} catch (e) {
  fails++;
  console.log('FAIL probe-crashed ' + (e && e.stack || e));
}
browser.close();
console.log(fails === 0 ? 'BLOCKED-CHECK OK' : `BLOCKED-CHECK FAIL: ${fails}`);
const gone = new Promise(res => chrome.once('exit', res));
try { chrome.kill('SIGKILL'); } catch (e) {}
await Promise.race([gone, sleep(3000)]);
for (let i = 0; i < 10; i++) {
  try { rmSync(profile, { recursive: true, force: true }); } catch (e) {}
  await sleep(300);
  if (!existsSync(profile)) break;
}
process.exit(fails === 0 ? 0 : 1);
