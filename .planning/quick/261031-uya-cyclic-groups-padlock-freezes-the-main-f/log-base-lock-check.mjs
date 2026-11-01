// CDP probe of Cyclic Groups' log-base padlock (quick 261031-uya): the
// padlock right of the main view's generator boxes freezes the chosen base
// against box clicks, keys, the wheel and the forced double-click, which then
// sets off the padlock's alarm. Built-ins only (global WebSocket and fetch);
// headless Google Chrome on a throwaway profile, removed after Chrome exits.
// The infrastructure, the independent models and the double-click helpers are
// copied unchanged from tnu's force-dblclick-check.mjs.
//   node log-base-lock-check.mjs [place] [freeze] [alarm] [unlocked] [midlock]
//        [reload] [group] [units13] [curve] [pane] [ringwin] [mobile]   (none: all of these)
//   node log-base-lock-check.mjs shot    screenshots into this dir
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
const PORT = 9353;
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
const profile = mkdtempSync(join(tmpdir(), 'cg-lock-'));
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
const START = { pos: 'gcd-short', abs: 'gcd-full' };
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
    var m = {}; document.querySelectorAll('.fmap').forEach(function(x){ m[x.getAttribute('data-f')] = x.getAttribute('data-at'); });
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
async function forceRun(P, scen, name, url, M, h, base, node, opts = {}) {
  const pick = pickModel(M, h, base, node);
  await P.load(url);
  await P.enter();
  const r0 = await rowNow(P);
  out(!!r0 && same(r0.checked, [base]) && !reach(M, base, h)[node], scen, `${name}: starts on base ${M.at(base)} with ${node === 'pos' ? 'a2' : 'a'} closed`, r0 && r0.checked);
  await P.ev(SAMPLER(3200));
  const c = await stopCentre(P, 'order', node);
  await dbl(P, c.x, c.y);
  await sleep(3000);
  const ss = after0(await samples(P));
  const ph = phasesOf(ss, pick);
  out(same(ph, ['pulse', 'set', 'none']), scen, `${name}: box ${M.at(pick)} pulses, then flashes as the chosen base, then rests`, { ph, pick });
  const firstSet = ss.find(s => s.set.includes(pick)), lastOn = ss.filter(s => s.set.length || s.pulse.length).pop();
  out(!!firstSet && firstSet.t >= 1000 && firstSet.t <= 1450 && !!lastOn && lastOn.t <= 2500, scen, `${name}: the base is set at about 1.1 s, the flashing ends by 2.5 s`, { set: firstSet && firstSet.t, end: lastOn && lastOn.t });
  const pulses = ss.filter(s => s.pulse.length);
  out(pulses.length > 0 && pulses.every(s => s.base === base && s.maps.order === 'gcd-full'), scen, `${name}: while it pulses the base and the knob stay`, pulses.slice(0, 2));
  out(!!firstSet && firstSet.base === pick && firstSet.maps.order === node, scen, `${name}: with the last flash the base is ${M.at(pick)} and the knob on ${node === 'pos' ? 'a2' : 'a'}`, firstSet);
  out(ss.every(s => s.no.length === 0 && s.ok.length === 0) && ss.every(s => s.pulse.every(g => g === pick) && s.set.every(g => g === pick)), scen, `${name}: no green/red hint flash after the double-click, and only box ${M.at(pick)} flashes`, ss.find(s => s.no.length || s.ok.length));
  const q = new URLSearchParams(await P.q()), maps = await mapsNow(P), f = await P.formulas();
  out(q.get('logbase') === String(pick) && q.get('fmaporder') === TOK[node], scen, `${name}: url logbase=${pick}, fmaporder=${TOK[node]}`, Object.fromEntries(q));
  const tokI = opts.index || 'gcd-full';
  out(maps.find(m => m.f === 'index').at === NODE_OF(tokI) && same(plains(f.ring), wantPair(M, pick, h, TOK[node], tokI)), scen, `${name}: the formulas take log base ${M.at(pick)}, the index map stays at ${tokI}`, { ring: plains(f.ring), want: wantPair(M, pick, h, TOK[node], tokI) });
  return pick;
}
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
const hostQ = async P => new URLSearchParams(await P.q());

/* ---------- helpers of this probe (the padlock) ---------- */
// The padlock and the row around it, as the page shows them right now.
const LOCK_JS = `(function(){
  var row = document.querySelector('.ring-hover-formula .lb-row');
  if (!row) return null;
  var lock = row.querySelector('.lb-lock'), list = row.querySelector('.lb-list'), wheel = row.querySelector('.lb-scroll');
  var r = function(e){ if (!e) return null; var b = e.getBoundingClientRect(); return { l: b.left, r: b.right, t: b.top, b: b.bottom }; };
  var kids = Array.prototype.map.call(row.children, function(k){ return k.className.split(' ')[0]; });
  var bs = Array.prototype.slice.call(row.querySelectorAll('.lb-box'));
  var a = document.activeElement;
  return {
    kids: kids, locked: row.classList.contains('is-locked'),
    pressed: lock && lock.getAttribute('aria-pressed'), tip: lock && lock.title, label: lock && lock.getAttribute('aria-label'),
    tag: lock && lock.tagName, type: lock && lock.type, shackle: lock && lock.querySelector('path') && lock.querySelector('path').getAttribute('d'),
    cls: lock ? Array.prototype.filter.call(lock.classList, function(c){ return c !== 'lb-lock'; }) : null,
    lockR: r(lock), listR: r(list), wheelR: r(wheel), wheelDisabled: wheel ? wheel.disabled : null, wheelPressed: wheel ? wheel.getAttribute('aria-pressed') : null,
    boxes: bs.map(function(b){ var i = b.querySelector('input'), cs = getComputedStyle(b); return { g: +b.getAttribute('data-g'), checked: i.checked, disabled: i.disabled, aria: i.getAttribute('aria-disabled'), title: b.title, opacity: +cs.opacity, cursor: cs.cursor, off: b.classList.contains('is-off') }; }),
    focus: a && a.closest ? (a.closest('.lb-lock') ? 'lock' : a.closest('.lb-scroll') ? 'wheel' : a.closest('.lb-box') ? +a.closest('.lb-box').getAttribute('data-g') : null) : null,
    overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth
  };
})()`;
const lockNow = (P, ctx) => P.ev(LOCK_JS, ctx);
const SHACKLE_CLOSED = 'M4 5.5V4a2 2 0 0 1 4 0v1.5', SHACKLE_OPEN = 'M4 5.5V3.5a2 2 0 0 1 4 0';
const LOCK_TIP = 'Lock the base of the logarithm: the boxes, the scroll wheel and a double-click on a closed a or a2 can no longer change it';
const UNLOCK_TIP = 'Unlock the base of the logarithm', LOCKED_TIP = 'The base of the logarithm is locked: open the padlock to change it';
// An in-page sampler of the padlock and the boxes: every 30 ms for `ms`,
// the padlock's classes and colour (and the warning colour to compare), the
// boxes' flash classes, the checked box and the maps; t relative to the last
// dblclick heard, n the number of dblclicks heard.
const LSAMPLER = ms => `(function(){
  window.__ls = []; window.__lt0 = null; window.__ln = 0;
  if (!window.__lsHooked){ window.__lsHooked = true; document.addEventListener('dblclick', function(){ window.__lt0 = performance.now(); window.__ln++; }, true); }
  var probe = document.createElement('span'); probe.style.color = 'var(--role-warn)'; document.body.appendChild(probe);
  var warn = getComputedStyle(probe).color; probe.remove();
  var cls = function(c){ return Array.prototype.map.call(document.querySelectorAll('.ring-hover-formula .lb-box.' + c), function(b){ return +b.getAttribute('data-g'); }); };
  var t = setInterval(function(){
    var lock = document.querySelector('.ring-hover-formula .lb-lock');
    var m = {}; document.querySelectorAll('.fmap, .fsl-pair').forEach(function(x){ m[x.getAttribute('data-f')] = x.getAttribute('data-at'); });
    var lit = document.querySelector('.ring-hover-formula .lb-list input:checked');
    window.__ls.push({ n: window.__ln, t: window.__lt0 === null ? null : Math.round(performance.now() - window.__lt0),
      alarm: !!lock && lock.classList.contains('is-alarm'), nudge: !!lock && lock.classList.contains('is-nudge'),
      anim: lock ? getComputedStyle(lock).animationName : null, color: lock ? getComputedStyle(lock).color : null, warn: warn,
      transform: lock ? getComputedStyle(lock).transform : null,
      pulse: cls('is-force-pulse'), set: cls('is-force-set'), ok: cls('is-flash-ok'), no: cls('is-flash-no'), base: lit ? +lit.value : null, maps: m, chips: document.querySelectorAll('.fsl-notch.is-force-pulse, .fsl-notch.is-force-set').length });
  }, 30);
  setTimeout(function(){ clearInterval(t); }, ${ms});
  return 1;
})()`;
const lsamples = (P, ctx) => P.ev('window.__ls', ctx);
const clickLock = async P => { const c = await centre(P, '.ring-hover-formula .lb-lock'); await P.mouse(c.x, c.y); };
const LZ = `${ZN}&gen=7&logbase=1`;

/* ---------- place: the padlock right of the boxes, a switch ---------- */
SCENARIOS.push(['place', async browser => {
  const P = await openPage(browser, 'place', { w: 1280, h: 900, ua: UA_DESKTOP });
  await P.load(LZ);
  await P.enter();
  let l = await lockNow(P);
  out(!!l && same(l.kids, ['lb-list', 'lb-lock', 'lb-scroll']), 'place', 'the row is boxes, padlock, wheel switch, in that order', l && l.kids);
  out(!!l && l.lockR && l.lockR.l >= l.listR.r && l.lockR.r <= l.wheelR.l && Math.abs((l.lockR.t + l.lockR.b) / 2 - (l.listR.t + l.listR.b) / 2) < 4, 'place', 'the padlock sits right of the boxes, on their line, before the wheel switch', l && { lock: l.lockR, list: l.listR, wheel: l.wheelR });
  out(!!l && l.tag === 'BUTTON' && l.type === 'button' && l.pressed === 'false' && l.tip === LOCK_TIP && l.label === LOCK_TIP && l.shackle === SHACKLE_OPEN && !l.locked, 'place', 'open at start: a button, aria-pressed=false, the lock tooltip, open shackle', l && { pressed: l.pressed, tip: l.tip, shackle: l.shackle });
  out((await P.param('logbaselock')) === null, 'place', 'no logbaselock in the url while open', await P.q());
  await clickLock(P);
  l = await lockNow(P);
  out(l.pressed === 'true' && l.locked && l.tip === UNLOCK_TIP && l.label === UNLOCK_TIP && l.shackle === SHACKLE_CLOSED, 'place', 'a click closes it: aria-pressed=true, row locked, the unlock tooltip, closed shackle', { pressed: l.pressed, tip: l.tip, shackle: l.shackle });
  out((await P.param('logbaselock')) === '1' && (await P.param('logbase')) === '1', 'place', 'the url gains logbaselock=1, the base stays 1', await P.q());
  out(l.focus === 'lock', 'place', 'the padlock keeps the focus after the row is rebuilt', l.focus);
  const other = l.boxes.filter(b => !b.checked), lit = l.boxes.filter(b => b.checked);
  out(lit.length === 1 && lit[0].g === 1 && lit[0].opacity === 1 && lit[0].aria === null, 'place', 'the chosen box 1 stays lit', lit);
  out(other.length === 3 && other.every(b => b.aria === 'true' && !b.disabled && b.title === LOCKED_TIP && b.opacity <= 0.5 && b.cursor === 'not-allowed'), 'place', 'every other box is aria-disabled, dimmed, not-allowed, with the locked tooltip', other);
  out(l.wheelDisabled === true, 'place', 'the wheel switch is disabled while locked', l.wheelDisabled);
  // keyboard on the padlock: Enter and Space toggle it, nothing swallows them
  await P.ev(`document.querySelector('.ring-hover-formula .lb-lock').focus()`);
  // (Enter activates a button only with its text, as a real key press carries)
  await P.S('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13, text: '\r' });
  await P.S('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13 });
  await sleep(500);
  l = await lockNow(P);
  out(l.pressed === 'false' && !l.locked && (await P.param('logbaselock')) === null && l.focus === 'lock' && l.wheelDisabled === false, 'place', 'Enter on the focused padlock opens it (url clean, wheel switch enabled again, focus kept)', { pressed: l.pressed, focus: l.focus, q: await P.q() });
  await P.key(' ', 'Space', 32);
  l = await lockNow(P);
  out(l.pressed === 'true' && (await P.param('logbaselock')) === '1', 'place', 'Space closes it again', { pressed: l.pressed, q: await P.q() });
  const ex0 = await P.ev('document.getElementById("expr-slider").value');
  await P.key('ArrowRight', 'ArrowRight', 39);
  l = await lockNow(P);
  out(l.focus === 'lock' && (await P.ev('document.getElementById("expr-slider").value')) === ex0 && (await P.param('logbase')) === '1', 'place', 'an arrow key on the padlock is left to it: the expression slider and the base stay', { focus: l.focus });
  // an unfit box while locked: dashed (is-off) and still nudging
  await P.load(`${ZN}&gen=7&logbase=7&fmaporder=pos-gcd&logbaselock=1`);
  await P.enter();
  l = await lockNow(P);
  const offs = l.boxes.filter(b => b.off).map(b => b.g);
  out(l.locked && same(sortN(offs), offModel(Z12, 7, 7, ['pos-gcd', 'gcd-full'])) && l.boxes.filter(b => b.off).every(b => !b.disabled && b.aria === 'true' && b.title === LOCKED_TIP), 'place', `locked with the order map on a2: the unfit boxes ${offModel(Z12, 7, 7, ['pos-gcd', 'gcd-full'])} are greyed (is-off) and aria-disabled, not disabled`, l.boxes);
  // a long row: the padlock and the switch keep their room
  await P.load('?mobile=0&mode=additive&n=97&gen=5&subformularing=both&logbaselock=1&logbase=89');
  await P.enter();
  l = await lockNow(P);
  const head = await P.rect('.ring-head');
  out(!!l && l.lockR && l.wheelR && l.wheelR.r <= head.x + head.w + 1 && l.lockR.l >= l.listR.r && l.overflow <= 0, 'place', 'ℤ/97ℤ: the long row scrolls, the padlock and the switch stay inside the ring head, no sideways scroll', l && { lock: l.lockR, wheel: l.wheelR, head, overflow: l.overflow });
  noErrors(P, 'place');
  await P.done();
}]);

/* ---------- freeze: boxes, keys and the wheel leave the base ---------- */
SCENARIOS.push(['freeze', async browser => {
  const P = await openPage(browser, 'freeze', { w: 1280, h: 900, ua: UA_DESKTOP });
  await P.load(`${LZ}&logbaselock=1`);
  await P.enter();
  let l = await lockNow(P);
  out(!!l && l.locked && l.pressed === 'true', 'freeze', 'logbaselock=1 opens locked', l && l.pressed);
  const f0 = plains((await P.formulas()).ring);
  // a box click
  await P.ev(LSAMPLER(700));
  let c = await centre(P, '.ring-hover-formula .lb-box[data-g="5"]');
  await P.S('Input.dispatchMouseEvent', { type: 'mouseMoved', x: c.x, y: c.y });
  await click1(P, c.x, c.y);
  await sleep(750);
  let ss = await lsamples(P);
  let r = await rowNow(P);
  out(same(r.checked, [1]) && (await P.param('logbase')) === '1' && same(plains((await P.formulas()).ring), f0), 'freeze', 'a click on box 5: base 1 stays checked, url and formulas unchanged', { checked: r.checked, q: await P.q() });
  out(ss.some(s => s.nudge) && !ss.some(s => s.alarm) && ss.filter(s => s.nudge).length * 30 <= 600, 'freeze', '... and the padlock nudges once (is-nudge, about 0.45 s)', ss.map(s => s.nudge ? 1 : 0).join(''));
  const cur = await P.ev(`getComputedStyle(document.querySelector('.ring-hover-formula .lb-box[data-g="5"]')).cursor`);
  out(cur === 'not-allowed', 'freeze', 'the pointer over box 5 is not-allowed', cur);
  // the keyboard in the row
  await P.ev(`document.querySelector('.ring-hover-formula .lb-list input:checked').focus()`);
  await P.ev(LSAMPLER(700));
  await P.key('ArrowRight', 'ArrowRight', 39);
  ss = await lsamples(P);
  l = await lockNow(P);
  out(same((await rowNow(P)).checked, [1]) && (await P.param('logbase')) === '1' && l.focus === 1, 'freeze', 'ArrowRight in the row: base 1 stays checked and keeps the focus', { focus: l.focus, q: await P.q() });
  out(ss.some(s => s.nudge), 'freeze', '... and the padlock nudges', ss.length);
  await P.key('ArrowLeft', 'ArrowLeft', 37);
  out(same((await rowNow(P)).checked, [1]) && (await P.param('logbase')) === '1', 'freeze', 'ArrowLeft: the same', await P.q());
  // the wheel: switch on while open, then closed
  await clickLock(P);
  await P.clickEl('.ring-hover-formula .lb-scroll');
  await sleep(300);
  await clickLock(P);
  l = await lockNow(P);
  out(l.locked && l.wheelPressed === 'true' && l.wheelDisabled === true, 'freeze', 'wheel switch pressed, then the padlock closed: the switch stays pressed and is disabled', { pressed: l.wheelPressed, disabled: l.wheelDisabled });
  await P.clickEl('.ring-hover-formula .lb-scroll');
  await sleep(200);
  out((await lockNow(P)).wheelPressed === 'true', 'freeze', 'a click on the disabled switch does not turn it off', (await lockNow(P)).wheelPressed);
  const zoom0 = await P.param('zoom');
  const card = await P.rect('.ring-hover-formula');
  await P.ev(LSAMPLER(900));
  for (let i = 0; i < 3; i++) { await wheelAt(P, card.x + card.w / 2, card.y + 10, 100); await sleep(120); }
  await sleep(600);
  ss = await lsamples(P);
  out((await P.param('logbase')) === '1' && same((await rowNow(P)).checked, [1]) && (await P.param('zoom')) === zoom0, 'freeze', 'three wheel notches over the formulas: base 1 stays, the ring does not zoom either', { q: await P.q() });
  out(ss.some(s => s.nudge), 'freeze', '... and the padlock nudges', ss.length);
  await clickLock(P);
  for (let i = 0; i < 1; i++) { await wheelAt(P, card.x + card.w / 2, card.y + 10, 100); await sleep(300); }
  out((await P.param('logbase')) === '5', 'freeze', 'opened again, one notch steps the base to 5', await P.q());
  noErrors(P, 'freeze');
  await P.done();
}]);

/* ---------- alarm: a double-click on a closed a2 while locked ---------- */
SCENARIOS.push(['alarm', async browser => {
  const P = await openPage(browser, 'alarm', { w: 1280, h: 900, ua: UA_DESKTOP });
  await P.load(`${LZ}&logbaselock=1`);
  await P.enter();
  await P.ev(LSAMPLER(2400));
  const c = await stopCentre(P, 'order', 'pos');
  await dbl(P, c.x, c.y);
  await sleep(2300);
  const all = await lsamples(P), ss = after0(all);
  out(all.every(s => s.base === 1 && s.maps.order === 'gcd-full'), 'alarm', 'base 1 and the knob on GCD (full) the whole time', all.find(s => s.base !== 1 || s.maps.order !== 'gcd-full'));
  out(all.every(s => !s.pulse.length && !s.set.length), 'alarm', 'no box pulses or flashes as a forced base', all.find(s => s.pulse.length || s.set.length));
  const on = ss.filter(s => s.alarm);
  out(on.length > 0 && on[0].t <= 90 && on[on.length - 1].t >= 1150 && on[on.length - 1].t <= 1500 && !ss.some(s => s.alarm && s.t > 1500), 'alarm', 'the padlock carries is-alarm from the double-click for about 1.35 s', { first: on[0] && on[0].t, last: on.length && on[on.length - 1].t });
  out(on.every(s => s.anim === 'lb-lock-alarm'), 'alarm', 'its animation is lb-lock-alarm', on.map(s => s.anim).filter((x, i, a) => a.indexOf(x) === i));
  const warmed = [];
  for (const k of [0, 1, 2]) warmed.push(ss.some(s => s.alarm && s.t >= k * 450 + 60 && s.t <= k * 450 + 290 && s.color === s.warn));
  out(warmed.every(Boolean), 'alarm', 'three pulses in the warning colour (--role-warn), one per 0.45 s', warmed);
  const restC = ss.filter(s => !s.alarm && !s.nudge).pop();
  out(!!restC && restC.color !== restC.warn && restC.transform === 'none', 'alarm', 'and it rests afterwards (own colour, no transform)', restC);
  out(on.some(s => s.transform && s.transform !== 'none'), 'alarm', 'it shakes (a transform while it runs)', on.map(s => s.transform).slice(0, 4));
  const hint = all.find(s => s.ok.length || s.no.length);
  out(!!hint && same(sortN(hint.ok), [5, 7]) && same(sortN(hint.no), [1, 11]), 'alarm', 'the two clicks\' hint stays: green 5, 7, red 1, 11 (a2 opens with a)', hint);
  const q = new URLSearchParams(await P.q());
  out(q.get('logbase') === '1' && q.get('fmaporder') === null && q.get('logbaselock') === '1', 'alarm', 'url: logbase=1, no fmaporder, logbaselock=1', Object.fromEntries(q));
  // a second double-click mid-alarm restarts it
  await P.ev(LSAMPLER(2600));
  await dbl(P, c.x, c.y);
  await sleep(600);
  await dbl(P, c.x, c.y);
  await sleep(1900);
  const s2 = (await lsamples(P)).filter(s => s.n === 2 && s.t >= 0);
  const on2 = s2.filter(s => s.alarm);
  out(on2.length > 0 && on2[0].t <= 90 && on2[on2.length - 1].t >= 1150 && on2[on2.length - 1].t <= 1500, 'alarm', 'a second double-click 0.6 s into the alarm restarts it: 1.35 s from the second one', { first: on2[0] && on2[0].t, last: on2.length && on2[on2.length - 1].t });
  // a single click on the closed a2: the hint, and a nudge
  await sleep(300);
  await P.ev(LSAMPLER(900));
  await click1(P, c.x, c.y);
  await sleep(250);
  const r = await rowNow(P);
  await sleep(700);
  const s3 = await lsamples(P);
  out(same(sortN(r.ok), [5, 7]) && same(sortN(r.no), [1, 11]) && s3.some(s => s.nudge) && !s3.some(s => s.alarm), 'alarm', 'a single click on the closed a2: the green/red hint and one nudge, no alarm', { ok: r.ok, no: r.no });
  out((await P.param('logbase')) === '1' && (await P.param('fmaporder')) === null, 'alarm', 'still base 1, knob on GCD (full)', await P.q());
  // the closed a too
  await P.ev(LSAMPLER(1800));
  const ca = await stopCentre(P, 'order', 'abs');
  await dbl(P, ca.x, ca.y);
  await sleep(1700);
  const s4 = after0(await lsamples(P));
  out((await P.param('logbase')) === '1' && (await P.param('fmaporder')) === null && s4.some(s => s.alarm) && s4.every(s => !s.pulse.length && !s.set.length), 'alarm', 'a double-click on the closed a: the same alarm, nothing forced', await P.q());
  noErrors(P, 'alarm');
  await P.done();
}]);

/* ---------- unlocked: open again, the double-click forces as before ---------- */
SCENARIOS.push(['unlocked', async browser => {
  const P = await openPage(browser, 'unlocked', { w: 1280, h: 900, ua: UA_DESKTOP });
  await P.load(`${LZ}&logbaselock=1`);
  await P.enter();
  await clickLock(P);
  out((await P.param('logbaselock')) === null && (await lockNow(P)).pressed === 'false', 'unlocked', 'a click opens the padlock (url clean)', await P.q());
  await P.ev(SAMPLER(3200));
  await P.ev(LSAMPLER(3200));
  const c = await stopCentre(P, 'order', 'pos');
  await dbl(P, c.x, c.y);
  await sleep(3000);
  const ss = after0(await samples(P)), ls = await lsamples(P);
  out(same(phasesOf(ss, 5), ['pulse', 'set', 'none']) && (await P.param('logbase')) === '5' && (await P.param('fmaporder')) === 'pos-gcd', 'unlocked', 'the double-click on a2 forces base 5, the nearest of 5 and 7 (pulse, set, rest; logbase=5, pos-gcd)', { ph: phasesOf(ss, 5), q: await P.q() });
  out(ls.every(s => !s.alarm && !s.nudge), 'unlocked', 'the open padlock never nudges or shakes', ls.find(s => s.alarm || s.nudge));
  noErrors(P, 'unlocked');
  await P.done();
}]);

/* ---------- midlock: closing the padlock while a forced base pulses ---------- */
SCENARIOS.push(['midlock', async browser => {
  const P = await openPage(browser, 'midlock', { w: 1280, h: 900, ua: UA_DESKTOP });
  await P.load(LZ);
  await P.enter();
  await P.ev(SAMPLER(3200));
  let c = await stopCentre(P, 'order', 'pos');
  await dbl(P, c.x, c.y);
  await sleep(350);
  await clickLock(P);
  await sleep(2400);
  let ss = await samples(P);
  out((await P.param('logbase')) === '1' && (await P.param('fmaporder')) === null && (await P.param('logbaselock')) === '1' && ss.slice(-30).every(s => !s.pulse.length && !s.set.length), 'midlock', 'closed while box 5 pulses: the sequence ends, base 1 and GCD (full) stay, locked', { q: await P.q() });
  // closed in the last flash: the base was already set, it finishes
  await P.load(LZ);
  await P.enter();
  await P.ev(SAMPLER(3200));
  c = await stopCentre(P, 'order', 'pos');
  await dbl(P, c.x, c.y);
  await sleep(1350);
  await clickLock(P);
  await sleep(1500);
  ss = after0(await samples(P));
  out((await P.param('logbase')) === '5' && (await P.param('fmaporder')) === 'pos-gcd' && (await P.param('logbaselock')) === '1' && ss.slice(-10).every(s => !s.pulse.length && !s.set.length), 'midlock', 'closed during the last flash: base 5 on a2 stays, locked, the flash over', { q: await P.q() });
  noErrors(P, 'midlock');
  await P.done();
}]);

/* ---------- reload: the url keeps it ---------- */
SCENARIOS.push(['reload', async browser => {
  const P = await openPage(browser, 'reload', { w: 1280, h: 900, ua: UA_DESKTOP });
  await P.load(LZ);
  await P.enter();
  await clickLock(P);
  const q = await P.q();
  await P.load(q);
  await P.enter();
  const l = await lockNow(P);
  out(new URLSearchParams(q).get('logbaselock') === '1' && l.pressed === 'true' && l.locked && same((await rowNow(P)).checked, [1]), 'reload', 'reloaded from its own url: still locked on base 1', { q, pressed: l.pressed });
  // a junk value is open
  await P.load(`${LZ}&logbaselock=yes`);
  await P.enter();
  out((await lockNow(P)).pressed === 'false' && (await P.param('logbaselock')) === null, 'reload', 'logbaselock=yes opens unlocked and is dropped from the url', await P.q());
  noErrors(P, 'reload');
  await P.done();
}]);

/* ---------- group: a new group or h while locked ---------- */
SCENARIOS.push(['group', async browser => {
  const P = await openPage(browser, 'group', { w: 1280, h: 900, ua: UA_DESKTOP });
  const setN = n => P.ev(`(function(){ var n=document.getElementById('n-input'); n.value='${n}'; n.dispatchEvent(new Event('input', { bubbles: true })); n.dispatchEvent(new Event('change', { bubbles: true })); return 1; })()`);
  await P.load(`${ZN}&gen=9&logbase=5&logbaselock=1`);
  await P.enter();
  await setN(8);
  await sleep(1200);
  let r = await rowNow(P), l = await lockNow(P);
  out(same(r.values, znModel(8).gens) && same(r.checked, [5]) && (await P.param('logbase')) === '5' && l.pressed === 'true', 'group', 'locked ℤ/12ℤ base 5 -> n=8: 5 still a generator, kept, still locked', { checked: r.checked, q: await P.q() });
  await setN(10);
  await sleep(1200);
  r = await rowNow(P); l = await lockNow(P);
  out(same(r.values, znModel(10).gens) && same(r.checked, [1]) && (await P.param('logbase')) === '1' && l.pressed === 'true' && (await P.param('logbaselock')) === '1', 'group', 'n=10: 5 no generator, re-resolved to 1, the lock stays on', { checked: r.checked, q: await P.q() });
  // a new h closes a2 under the locked base: the knob snaps back as usual
  await P.load(`${ZN}&gen=7&logbase=7&fmaporder=pos-gcd&logbaselock=1`);
  await P.enter();
  // (h = 11: log_7 11 = 5 shuts a2 and a; h = 5, r = −1, keeps them open since 261101-o20)
  const want = settleModel('pos-gcd', reach(Z12, 7, 11));
  out(want === 'gcd-full', 'group', 'model: h=11 under base 7 shuts a2 (and a), the knob goes to GCD (full)', want);
  await P.clickEl('.subgroup-row[data-gen="11"]');
  await sleep(1200);
  const at = (await mapsNow(P)).find(m => m.f === 'order').at;
  out((await P.param('gen')) === '11' && (await P.param('logbase')) === '7' && at === NODE_OF(want) && ((await P.param('fmaporder')) || 'gcd-full') === want && (await lockNow(P)).pressed === 'true', 'group', `h 7 -> 11 at locked base 7: a2 closes, the knob settles on ${want}, base 7 and the lock stay`, { at, q: await P.q() });
  noErrors(P, 'group');
  await P.done();
}]);

/* ---------- units13 and a cyclic curve: the alarm there too ---------- */
// opts.slider: a (ℤ/nℤ)* or a curve with sliders (quick 261031-wef): it
// loads at compact (gcd-short) for a2 or complete (gcd-full) for a and
// double-clicks the form slider's neither notch.
async function alarmRun(P, scen, name, url, M, h, base, node, opts = {}) {
  const tok0 = opts.slider ? START[node] : 'gcd-full';
  if (opts.slider && tok0 !== 'gcd-full') url += `&fmaporder=${tok0}`;
  await P.load(url);
  await P.enter();
  const r0 = await rowNow(P);
  out(!!r0 && same(r0.checked, [base]) && !reach(M, base, h)[node] && (await lockNow(P)).pressed === 'true', scen, `${name}: locked on base ${M.at(base)} with ${node === 'pos' ? 'a2' : 'a'} closed`, r0 && r0.checked);
  await P.ev(LSAMPLER(2000));
  const c = opts.slider ? await centre(P, NEITHER('order')) : await stopCentre(P, 'order', node);
  await dbl(P, c.x, c.y);
  await sleep(1900);
  const ss = await lsamples(P);
  out(ss.every(s => s.base === base && s.maps.order === tok0 && !s.pulse.length && !s.set.length && !s.chips) && ss.some(s => s.alarm), scen, `${name}: nothing forced (base ${M.at(base)}, knob on ${tok0}), the padlock alarm runs`, ss.find(s => s.base !== base || s.pulse.length || s.maps.order !== tok0));
}
SCENARIOS.push(['units13', async browser => {
  const P = await openPage(browser, 'units13', { w: 1280, h: 900, ua: UA_DESKTOP });
  const U = unitsModel(13);
  // h = 6 (log_2 6 = 5) shuts a2 and a under base 2; h = 5 (r = −3) opens both since 261101-o20
  const url = '?mobile=0&mode=multiplicative&n=13&subformularow=both&subformularing=both&gen=6&logbase=2&logbaselock=1';
  let ran = 0;
  for (const node of ['pos', 'abs']) {
    if (reach(U, 2, 6)[node]) continue;
    ran++;
    await alarmRun(P, 'units13', `(ℤ/13ℤ)* h=6 base 2, ${node === 'pos' ? 'a2' : 'a'}`, url, U, 6, 2, node, { slider: true });
  }
  out(ran === 2, 'units13', `(ℤ/13ℤ)* h=6 base 2 has ${ran} closed position(s) (a2 and a)`);
  noErrors(P, 'units13');
  await P.done();
}]);
SCENARIOS.push(['curve', async browser => {
  const P = await openPage(browser, 'curve', { w: 1280, h: 900, ua: UA_DESKTOP });
  const E = ecAdapter(curveModel(11, 1, 3), false);
  let hit = null;
  for (let h = 1; h < E.N && !hit; h++) for (const b of E.gens.slice(1)) if (!hit && !reach(E, b, h).pos && pickModel(E, h, b, 'pos') !== null) hit = { h, b };
  out(!!hit, 'curve', hit ? `E(𝔽₁₁) h=${E.at(hit.h)} base ${E.at(hit.b)}: a2 closed` : 'a closed a2 on the curve');
  if (hit) {
    await alarmRun(P, 'curve', `curve h=${E.at(hit.h)} base ${E.at(hit.b)}`, `${CURVE}&gen=${hit.h}&logbase=${hit.b}&logbaselock=1`, E, hit.h, hit.b, 'pos', { slider: true });
    const other = E.gens.find(g => g !== hit.b);
    await P.clickEl(`.ring-hover-formula .lb-box[data-g="${other}"] input`);
    await sleep(400);
    out((await P.param('logbase')) === String(hit.b), 'curve', `a click on the box of ${E.at(other)}: the base stays ${E.at(hit.b)}`, await P.q());
  }
  noErrors(P, 'curve');
  await P.done();
}]);

/* ---------- pane: the pane's own padlock, kept by the host ---------- */
SCENARIOS.push(['pane', async browser => {
  const P = await openPage(browser, 'pane', { w: 1500, h: 900, ua: UA_DESKTOP });
  const U = unitsModel(13);
  const HOST = '?mobile=0&mode=additive&n=12&gen=1&subformularing=both&subformularingr=both';
  let ctx = await openPane(P, HOST, 'ℤ/13ℤ,×');
  out(!!ctx, 'pane', 'the pane opens on (ℤ/13ℤ)*');
  if (!ctx) { noErrors(P, 'pane'); await P.done(); return; }
  let pl = await lockNow(P, ctx);
  out(!!pl && pl.pressed === 'false' && same(pl.kids, ['lb-list', 'lb-lock', 'lb-scroll']), 'pane', 'the pane\'s row has its own open padlock', pl && pl.kids);
  // first a pane base under which a2 is closed (as tnu's pane case)
  const h = +(/⟨(\d+)⟩/.exec(await P.ev(`document.querySelector('.ring-hover-formula math.ring-math-formula').getAttribute('data-plain')`, ctx)) || [])[1];
  const pb = U.gens.find(b => !reach(U, b, h).pos);
  out(Number.isInteger(h) && pb !== undefined, 'pane', `the pane's h = ${h}; base ${pb} closes a2`);
  if (pb === undefined) { noErrors(P, 'pane'); await P.done(); return; }
  await P.ev(`document.querySelector('.lb-box[data-g="${pb}"] input').click()`, ctx);
  await sleep(1000);
  await P.ev(`document.querySelector('.ring-hover-formula .lb-lock').click()`, ctx);
  await sleep(900);
  let q = await hostQ(P);
  pl = await lockNow(P, ctx);
  const hl = await lockNow(P);
  out(pl.pressed === 'true' && q.get('logbaselockr') === '1' && q.get('logbaselock') === null && hl.pressed === 'false', 'pane', 'closed in the pane: the host url gains logbaselockr=1; the host\'s own padlock stays open', { q: Object.fromEntries(q), host: hl.pressed });
  const other = U.gens.find(g => g !== pb);
  await P.ev(`document.querySelector('.ring-hover-formula .lb-box[data-g="${other}"] input').click()`, ctx);
  await sleep(700);
  q = await hostQ(P);
  out(same((await rowNow(P, ctx)).checked, [pb]) && q.get('logbaser') === String(pb), 'pane', `a click on the pane's box ${other}: its base stays ${pb} (logbaser=${pb})`, Object.fromEntries(q));
  // a forced double-click in the pane, locked
  {
    // the pane's (ℤ/13ℤ)* has sliders: compact first (a2 is its neither), then the double-click
    await P.ev(`document.querySelector('.fsl-pair[data-f="order"] .fsl[data-kind="complexity"] .fsl-notch[data-v="1"]').click()`, ctx);
    await sleep(1000);
    await P.ev(`(function(){ var i = document.querySelector('${NEITHER('order')}'); i.click(); i.click(); i.dispatchEvent(new MouseEvent('dblclick', { bubbles: true })); return 1; })()`, ctx);
    await sleep(300);
    const mid = await lockNow(P, ctx);
    const pulsing = await P.ev(`document.querySelectorAll('.lb-box.is-force-pulse, .fsl-notch.is-force-pulse').length`, ctx);
    await sleep(1800);
    q = await hostQ(P);
    out(mid.cls.includes('is-alarm') && pulsing === 0 && q.get('logbaser') === String(pb) && q.get('fmaporderr') === 'gcd-short', 'pane', `a double-click on the pane's closed a2: the pane's padlock alarms, nothing forced (logbaser=${pb})`, { cls: mid.cls, pulsing, q: Object.fromEntries(q) });
  }
  // the host url carries it into a reopened pane, and the swap trades it
  ctx = await openPane(P, `${HOST}&logbaselockr=1`, 'ℤ/13ℤ,×');
  pl = ctx ? await lockNow(P, ctx) : null;
  out(!!pl && pl.pressed === 'true' && (await lockNow(P)).pressed === 'false', 'pane', 'a host url with logbaselockr=1 opens the pane locked, the host open', pl && pl.pressed);
  await P.clickEl('#iso-swap');
  await sleep(3000);
  let c2 = null;
  for (let i = 0; i < 30 && !c2; i++) {
    await sleep(300);
    const c = await P.paneCtx();
    if (c && (await P.ev(`document.querySelectorAll('.fmap, .fsl-pair').length === 2 && !!document.querySelector('.lb-row')`, c).catch(() => false))) c2 = c;
  }
  await sleep(800);
  q = await hostQ(P);
  const after = { host: (await lockNow(P)).pressed, pane: c2 ? (await lockNow(P, c2)).pressed : null };
  out(q.get('logbaselock') === '1' && q.get('logbaselockr') === null && after.host === 'true' && after.pane === 'false', 'pane', 'the swap trades the padlocks: logbaselock=1, no logbaselockr; host locked, pane open', { q: Object.fromEntries(q), after });
  noErrors(P, 'pane');
  await P.done();
}]);

/* ---------- ringwin: an extra Ring window keeps its own ---------- */
SCENARIOS.push(['ringwin', async browser => {
  const P = await openPage(browser, 'ringwin', { w: 1280, h: 900, ua: UA_DESKTOP });
  await P.load(`${ZN}&gen=1`);
  await P.enter();
  const src = new URL('?ringwin=1&mobile=0&mode=additive&n=12&gen=7&subformularing=both&logbase=1&logbaselock=1', URL_BASE).href;
  await P.ev(`(function(){ window.__rw = []; window.addEventListener('message', function(e){ if (e.data && e.data.ringwin === 'state') window.__rw.push(e.data.q); }); var f = document.createElement('iframe'); f.id = 'probe-rw'; f.style.cssText = 'position:fixed;left:0;top:0;width:900px;height:800px;z-index:99999;border:0'; f.src = ${JSON.stringify(src)}; document.body.appendChild(f); return 1; })()`);
  let ctx = null;
  for (let i = 0; i < 30 && !ctx; i++) {
    await sleep(300);
    const c = await P.paneCtx();
    if (c && (await P.ev(`document.querySelectorAll('.fmap').length === 2 && !!document.querySelector('.lb-row')`, c).catch(() => false))) ctx = c;
  }
  out(!!ctx, 'ringwin', 'a ?ringwin=1&logbaselock=1 window shows both maps and the row');
  if (!ctx) { noErrors(P, 'ringwin'); await P.done(); return; }
  await sleep(600);
  out((await lockNow(P, ctx)).pressed === 'true', 'ringwin', 'the window opens locked', (await lockNow(P, ctx)).pressed);
  await P.ev(`(function(){ var i = document.querySelector('.fmap[data-f="order"] .fmap-stop[data-id="pos"] input'); i.click(); i.click(); i.parentNode.dispatchEvent(new MouseEvent('dblclick', { bubbles: true })); return 1; })()`, ctx);
  await sleep(300);
  const mid = await lockNow(P, ctx);
  await sleep(1700);
  const r = await rowNow(P, ctx);
  out(mid.cls.includes('is-alarm') && same(r.checked, [1]) && (await mapsIn(P, ctx)).find(x => x.f === 'order').at === 'gcd-full', 'ringwin', 'a double-click on its closed a2: the alarm, base 1 and GCD (full) stay', { cls: mid.cls, checked: r.checked });
  await P.ev(`document.querySelector('.ring-hover-formula .lb-lock').click()`, ctx);
  await sleep(800);
  let last = new URLSearchParams((await P.ev('window.__rw')).pop() || '');
  out(last.get('ringwin') !== null && last.get('logbaselock') === null && last.get('logbase') === '1', 'ringwin', 'opened: its last state message to the parent has no logbaselock', Object.fromEntries(last));
  await P.ev(`document.querySelector('.ring-hover-formula .lb-lock').click()`, ctx);
  await sleep(800);
  last = new URLSearchParams((await P.ev('window.__rw')).pop() || '');
  out(last.get('logbaselock') === '1', 'ringwin', 'closed again: logbaselock=1 in its state message', Object.fromEntries(last));
  out((await P.param('logbaselock')) === null && (await lockNow(P)).pressed === 'false', 'ringwin', 'the host page\'s own padlock is untouched', await P.q());
  noErrors(P, 'ringwin');
  await P.done();
}]);

/* ---------- mobile: the padlock on the phone page ---------- */
SCENARIOS.push(['mobile', async browser => {
  const P = await openPage(browser, 'mobile', { w: 390, h: 844, ua: UA_ANDROID, touch: true });
  await P.load('?mobile=1&mode=additive&n=12&gen=7&logbase=1&subformularing=both');
  await sleep(1000);
  let l = await lockNow(P);
  out(!!l && same(l.kids, ['lb-list', 'lb-lock']) && l.pressed === 'false', 'mobile', 'the phone page shows the padlock after the boxes (no wheel switch)', l && l.kids);
  await P.ev(`document.querySelector('.ring-hover-formula .lb-lock').scrollIntoView({ block: 'center' })`);
  await sleep(300);
  const tap = async sel => {
    const c = await centre(P, sel);
    await P.S('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: c.x, y: c.y }] });
    await sleep(40);
    await P.S('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await sleep(600);
  };
  await tap('.ring-hover-formula .lb-lock');
  l = await lockNow(P);
  out(l.pressed === 'true' && (await P.param('logbaselock')) === '1', 'mobile', 'a tap closes it (logbaselock=1)', { pressed: l.pressed, q: await P.q() });
  await tap('.ring-hover-formula .lb-box[data-g="11"]');
  out((await P.param('logbase')) === '1' && same((await rowNow(P)).checked, [1]), 'mobile', 'a tap on box 11: base 1 stays', await P.q());
  noErrors(P, 'mobile');
  await P.done();
}]);

/* ---------- shot: locked, and mid-alarm, in the light theme ---------- */
SCENARIOS.push(['shot', async browser => {
  const P = await openPage(browser, 'shot', { w: 1280, h: 900, ua: UA_DESKTOP });
  await P.S('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: 'light' }] });
  await P.load(`${LZ}&logbaselock=1`);
  await P.enter();
  const r = await P.rect('.ring-hover-formula');
  const clip = { x: Math.max(0, r.x - 12), y: Math.max(0, r.y - 12), width: Math.min(r.w + 24, 1280), height: r.h + 24 };
  await P.ev('document.activeElement && document.activeElement.blur()');
  await P.S('Input.dispatchMouseEvent', { type: 'mouseMoved', x: 5, y: 5 });
  await sleep(300);
  await P.shot('shot-log-base-locked-light.png', clip);
  const c = await stopCentre(P, 'order', 'pos');
  await dbl(P, c.x, c.y);
  await sleep(150);
  await P.shot('shot-log-base-lock-alarm-light.png', clip);
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
console.log(fails === 0 ? 'LOG-BASE-LOCK-CHECK OK' : `LOG-BASE-LOCK-CHECK FAIL: ${fails}`);
// Chrome's helper processes outlive a SIGKILL of the browser for a moment and
// write into the profile: wait for the browser to exit, then remove it, retrying.
const gone = new Promise(res => chrome.once('exit', res));
try { chrome.kill('SIGKILL'); } catch (e) {}
await Promise.race([gone, sleep(3000)]);
for (let i = 0; i < 10; i++) {
  try { rmSync(profile, { recursive: true, force: true }); } catch (e) {}
  await sleep(300);
  if (!existsSync(profile)) break;
}
process.exit(fails === 0 ? 0 : 1);
