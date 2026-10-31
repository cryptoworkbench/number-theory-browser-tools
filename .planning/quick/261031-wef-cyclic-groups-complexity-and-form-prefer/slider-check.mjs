// CDP probe of Cyclic Groups' Complexity and Form preference sliders, which
// replace the main view's formula maps on a cyclic (ℤ/nℤ)* and a cyclic curve
// (quick 261031-wef). Built-ins only (global WebSocket and fetch); headless
// Google Chrome on a throwaway profile, killed and removed on exit. The
// harness and the independent models of ℤ/nℤ, (ℤ/nℤ)* and curves are copied
// unchanged from tnu's force-dblclick-check.mjs; every expectation comes from them.
//   node slider-check.mjs [syntax] [render] [combos] [memo] [jnrow] [url] [drag]
//        [keys] [closed] [force] [lock] [settle] [pane] [ringwin] [mobile]   (none: all of these)
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
const PORT = 9362;
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
const profile = mkdtempSync(join(tmpdir(), 'cg-slider-'));
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

/* ---------- render: where the sliders show, and where the maps stay ---------- */
SCENARIOS.push(['render', async browser => {
  const P = await openPage(browser, 'render', { w: 1280, h: 900, ua: UA_DESKTOP });
  await P.load(`${UNITS}&gen=3&logbase=2`);
  await P.enter();
  let ps = await pairs(P);
  out(ps.length === 2 && !(await P.exists('.fmap')) && same(ps.map(p => p.f), ['order', 'index']), 'render', '(ℤ/13ℤ)*: two slider pairs, no map', ps.map(p => p.f));
  out(ps.every(p => p.token === 'gcd-full' && p.c.now === 2 && p.v.now === 2 && p.c.text === 'complete' && p.v.text === 'GCD' && p.c.at === 2 && p.v.at === 2 && !p.v.inert), 'render', 'both at complete / GCD (aria-valuenow 2 / 2, texts complete / GCD)', ps);
  out(ps.every(p => p.c.role === 'slider' && p.v.role === 'slider' && p.c.labels === 'JN|compact|complete' && p.v.labels === 'LCM|neither|GCD' && /Complexity of the/.test(p.c.label) && /Form preference of the/.test(p.v.label) && p.c.tab === '0' && p.v.tab === '0'), 'render', 'role=slider, notch labels and accessible names', ps.map(p => [p.c.label, p.v.label, p.c.labels, p.v.labels]));
  out(await P.exists('.ring-hover-formula.has-fmap .lb-row'), 'render', 'the generator row shows (complete is not JN)');
  const geo = await P.ev(`(function(){var p=document.querySelector('.fsl-pair').getBoundingClientRect(), m=document.querySelector('.ring-hover-formula math.ring-math-formula').getBoundingClientRect(); return { w: p.width, h: p.height, left: p.right <= m.left }; })()`);
  out(geo.w <= 200 && geo.h <= 104 && geo.left, 'render', `the pair is ${Math.round(geo.w)} x ${Math.round(geo.h)} px (within 200 x 104), left of its formula`, geo);
  out(await noScroll(P), 'render', 'no sideways scroll at 1280');
  await P.load(`?mobile=0&curve=11,1,3&subformularow=both&subformularing=both&gen=1`);
  await P.enter();
  ps = await pairs(P);
  out(ps.length === 2 && !(await P.exists('.fmap')), 'render', 'the cyclic curve E(𝔽₁₁): two pairs, no map', ps.length);
  await P.load(`?mobile=0&mode=additive&n=12&subformularow=both&subformularing=both&gen=9`);
  await P.enter();
  out((await P.ev(`document.querySelectorAll('.fmap').length`)) === 2 && (await pairs(P)).length === 0, 'render', 'ℤ/12ℤ keeps its two maps, no pair');
  for (const u of ['mode=multiplicative&n=8&gen=3', 'curve=7,0,1&gen=1']) {
    await P.load(`?mobile=0&${u}&subformularow=both&subformularing=both`);
    await P.enter();
    out(!(await P.exists('.fmap')) && (await pairs(P)).length === 0 && !(await P.exists('.ring-hover-formula .lb-row')), 'render', `${u}: no generator, neither control`);
  }
  await P.load(`?mobile=0&mode=multiplicative&n=13&subformularow=both&subformularing=index&gen=3&logbase=2`);
  await P.enter();
  ps = await pairs(P);
  out(ps.length === 1 && ps[0].f === 'index', 'render', 'subformularing=index: one pair, data-f index', ps.map(p => p.f));
  noErrors(P, 'render');
  await P.done();
}]);

/* ---------- combos: the nine (complexity, form) combinations ---------- */
SCENARIOS.push(['combos', async browser => {
  const P = await openPage(browser, 'combos', { w: 1280, h: 900, ua: UA_DESKTOP });
  for (const [M, base] of [[U13, UNITS], [E11, '?mobile=0&curve=11,1,3&subformularow=both&subformularing=both']]) {
    const hb = bothOpen(M);
    out(!!hb, 'combos', `${M.label}: an h and base with a and a2 open`, hb);
    if (!hb) continue;
    const url = `${base}&gen=${hb.h}&logbase=${hb.b}`;
    let good = 0;
    for (let c = 0; c < 3; c++) for (let v = 0; v < 3; v++) {
      await P.load(url);
      await P.enter();
      await clickChip(P, 'order', 'form', v);
      await clickChip(P, 'order', 'complexity', c);
      const tok = tokOf(c, v), p = await pairOf(P, 'order'), f = await P.formulas(), steps = await P.steps();
      const node = NODE_OF(tok), want = wantPair(M, hb.b, hb.h, tok, 'gcd-full');
      const q = await P.param('fmaporder');
      const ok = p.token === tok && q === (tok === 'gcd-full' ? null : tok) && same(plains(f.ring), want) && steps[0] === STEPS_ORDER[node] && steps[1] === STEPS_INDEX['gcd-full']
        && p.c.now === c && p.v.now === v && p.v.inert === (c === 0);
      if (ok) good++;
      out(ok, 'combos', `${M.label} h=${M.at(hb.h)} base=${M.at(hb.b)} (${C_TEXT[c]}, ${V_TEXT[v]}) -> ${tok}`, { token: p.token, q, c: p.c.now, v: p.v.now, inert: p.v.inert, ring: plains(f.ring), want, steps });
    }
    out(good === 9, 'combos', `${M.label}: all nine combinations reached by real clicks (${good}/9)`);
  }
  noErrors(P, 'combos');
  await P.done();
}]);

/* ---------- memo: the form remembered across JN, and J-01 ---------- */
SCENARIOS.push(['memo', async browser => {
  const P = await openPage(browser, 'memo', { w: 1280, h: 900, ua: UA_DESKTOP });
  const hb = bothOpen(U13);
  const url = `${UNITS}&gen=${hb.h}&logbase=${hb.b}`;
  const tokNow = async () => (await pairOf(P, 'order')).token;
  await P.load(`${url}&fmaporder=lcm-full`);
  await P.enter();
  await clickChip(P, 'order', 'form', 1);
  out((await tokNow()) === 'abs-lcm', 'memo', 'lcm-full -> neither: abs-lcm', await tokNow());
  await clickChip(P, 'order', 'complexity', 1);
  out((await tokNow()) === 'pos-lcm', 'memo', '-> compact: pos-lcm', await tokNow());
  await clickChip(P, 'order', 'complexity', 0);
  let p = await pairOf(P, 'order');
  out(p.token === 'jn' && p.v.inert && p.v.now === 1 && p.v.at === 1 && p.v.aria === 'true' && p.v.tab === '-1', 'memo', '-> JN: jn, the form slider at rest on neither', p);
  for (const v of [0, 2]) await clickChip(P, 'order', 'form', v);
  out((await tokNow()) === 'jn' && (await P.param('fmaporder')) === 'jn', 'memo', 'clicks on the resting form slider change nothing', await P.q());
  await clickChip(P, 'order', 'complexity', 2);
  out((await tokNow()) === 'abs-lcm', 'memo', '-> complete: abs-lcm', await tokNow());
  await P.load(`${url}&fmaporder=gcd-short`);
  await P.enter();
  await clickChip(P, 'order', 'form', 1);
  out((await tokNow()) === 'pos-gcd', 'memo', 'gcd-short -> neither: pos-gcd', await tokNow());
  // J-01: (ℤ/13ℤ)* h=5 base 2, a open and a2 closed
  const rc = reach(U13, 2, 5);
  out(rc.abs && !rc.pos, 'memo', 'model: (ℤ/13ℤ)* h=5 base 2 has a open and a2 closed', rc);
  await P.load(`${UNITS}&gen=5&logbase=2&fmaporder=abs-lcm`);
  await P.enter();
  await clickChip(P, 'order', 'complexity', 1);
  p = await pairOf(P, 'order');
  out(p.token === 'lcm-short' && p.v.now === 0 && same(p.v.closed, [1]), 'memo', 'J-01: abs-lcm -> compact gives lcm-short, the neither notch closed', p);
  await P.load(`${UNITS}&gen=5&logbase=2&fmaporder=abs-gcd`);
  await P.enter();
  await clickChip(P, 'order', 'complexity', 0);
  await clickChip(P, 'order', 'complexity', 1);
  p = await pairOf(P, 'order');
  out(p.token === 'gcd-short' && p.v.now === 2 && same(p.v.closed, [1]), 'memo', 'J-01: abs-gcd -> JN -> compact gives gcd-short', p);
  noErrors(P, 'memo');
  await P.done();
}]);

/* ---------- jnrow: the generator row only while some formula is not at JN ---------- */
SCENARIOS.push(['jnrow', async browser => {
  const P = await openPage(browser, 'jnrow', { w: 1280, h: 900, ua: UA_DESKTOP });
  const none = () => P.ev(`!document.querySelector('.ring-hover-formula .lb-row, .ring-hover-formula .lb-lock, .ring-hover-formula .lb-scroll')`);
  await P.load(`${UNITS}&gen=5&logbase=2&fmaporder=jn&fmapindex=jn`);
  await P.enter();
  out(await none(), 'jnrow', '(ℤ/13ℤ)* both at JN: no boxes, padlock or wheel switch');
  out((await pairs(P)).length === 2, 'jnrow', 'the two pairs stay');
  await clickChip(P, 'order', 'complexity', 1);
  out((await P.exists('.ring-hover-formula .lb-row')) && (await P.exists('.ring-hover-formula .lb-lock')) && (await P.exists('.ring-hover-formula .lb-scroll')) && (await P.param('fmaporder')) === 'gcd-short', 'jnrow', 'the order formula to compact: the row comes back (gcd-short)', await P.q());
  await P.load(`?mobile=0&mode=multiplicative&n=13&subformularow=both&subformularing=order&gen=5&logbase=2&fmaporder=jn`);
  await P.enter();
  out(await none(), 'jnrow', 'only the size formula shown, at JN: no row');
  await P.load(`?mobile=0&mode=additive&n=12&subformularow=both&subformularing=both&gen=9&fmaporder=jn&fmapindex=jn`);
  await P.enter();
  out(await P.exists('.ring-hover-formula .lb-row'), 'jnrow', 'ℤ/12ℤ both at JN: the row stays (the additive rule)');
  await P.load(`?mobile=0&mode=additive&n=12&subformularow=both&subformularing=both&gen=9&fmaporder=gcd-sls&fmapindex=lcm-sls`);
  await P.enter();
  out(await none(), 'jnrow', 'ℤ/12ℤ both on SLS: no row');
  noErrors(P, 'jnrow');
  await P.done();
}]);

/* ---------- url: the same keys, nothing new ---------- */
SCENARIOS.push(['url', async browser => {
  const P = await openPage(browser, 'url', { w: 1280, h: 900, ua: UA_DESKTOP });
  const hb = bothOpen(U13);
  await P.load(`${UNITS}&gen=${hb.h}&logbase=${hb.b}&fmaporder=pos-lcm&fmapindex=lcm-short`);
  await P.enter();
  let ps = await pairs(P);
  out(ps[0].c.now === 1 && ps[0].v.now === 1 && ps[1].c.now === 1 && ps[1].v.now === 0, 'url', 'fmaporder=pos-lcm&fmapindex=lcm-short: (compact, neither) / (compact, LCM)', ps.map(p => [p.c.now, p.v.now]));
  const before = Object.fromEntries(new URLSearchParams(await P.q()));
  await clickChip(P, 'order', 'complexity', 2);
  const after = Object.fromEntries(new URLSearchParams(await P.q()));
  const diff = Object.keys({ ...before, ...after }).filter(k => before[k] !== after[k]);
  out(same(diff, ['fmaporder']) && after.fmaporder === 'abs-lcm', 'url', 'a slider change rewrites only fmaporder (abs-lcm)', { diff, after });
  await P.load(await P.q());
  await P.enter();
  const ps2 = await pairs(P);
  out(ps2[0].token === 'abs-lcm' && ps2[0].c.now === 2 && ps2[0].v.now === 1 && ps2[1].token === 'lcm-short', 'url', 'reloading that url restores the same slider state', ps2.map(p => p.token));
  await clickChip(P, 'order', 'form', 2);
  out((await pairOf(P, 'order')).token === 'gcd-full' && (await P.param('fmaporder')) === null, 'url', 'gcd-full writes no param', await P.q());
  const keys = [...new URLSearchParams(await P.q()).keys()].filter(k => /^fsl|complexity|^form/i.test(k));
  out(keys.length === 0, 'url', 'no new url keys', keys);
  noErrors(P, 'url');
  await P.done();
}]);
//@@TASK2@@

/* ---------- shot: light screenshots ---------- */
SCENARIOS.push(['shot', async browser => {
  const P = await openPage(browser, 'shot', { w: 1280, h: 900, ua: UA_DESKTOP });
  await P.S('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: 'light' }] });
  const clipOf = async () => { const r = await P.rect('.ring-hover-formula'); return { x: Math.max(0, r.x - 8), y: Math.max(0, r.y - 8), width: Math.min(r.w + 16, 1280), height: r.h + 16 }; };
  await P.load(`${UNITS}&gen=5&logbase=2`);
  await P.enter();
  await P.shot('shot-sliders-light.png', await clipOf());
  await P.load(`${UNITS}&gen=5&logbase=2&fmaporder=jn&fmapindex=jn`);
  await P.enter();
  await P.shot('shot-sliders-jn-light.png', await clipOf());
  noErrors(P, 'shot');
  await P.done();
}]);

const browser = await connect();
try {
  for (const [name, fn] of SCENARIOS) if (want(name) && (ONLY.includes(name) || !['shot'].includes(name))) await fn(browser);
} catch (e) {
  fails++;
  console.log('FAIL probe-crashed ' + (e && e.stack || e));
}
browser.close();
console.log(fails === 0 ? 'SLIDER-CHECK OK' : `SLIDER-CHECK FAIL: ${fails}`);
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
