// CDP probe of Cyclic Groups' formula sliders on ℤ/nℤ (quick 261101-so1):
// an additive group now writes its formulas by the Complexity / Form
// preference pair too, its map behind the same show-map toggle, and its
// Complexity track forks to a fourth slot, compact SLS (data-v 3, the
// gcd-sls / lcm-sls tokens), under compact. Neither with compact SLS is
// refused both ways. The harness, the independent models and the helpers are
// copied unchanged from 261031-wef's slider-check.mjs; every expectation of a
// formula comes from those models. Quick 261101-tpr: groups of units and
// curves draw the same fork, its SLS branch and slot 3 greyed out and out of
// reach (scenarios render, others, pane).
//   node additive-slider-check.mjs [syntax] [render] [slots] [refuse] [force] [keys]
//        [genrow] [reload] [map] [glide] [drag] [others] [mobile] [ringwin] [pane]   (none: all of these)
//   node additive-slider-check.mjs shot    light and dark screenshots into this dir
//   node additive-slider-check.mjs tprshot light and dark (ℤ/13ℤ)* pair into 261101-tpr's dir
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
const PORT = 9381;
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
const profile = mkdtempSync(join(tmpdir(), 'cg-addsl-'));
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
  P.shot = async (file, clip, scheme = 'light') => {
    await S('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: scheme }] });
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
// Quick 261101-o20: a2 opens exactly when a does, so (ℤ/13ℤ)* h=5 base 2
// (r = −3) has both open; h=6 (log_2 6 = 5) has both shut under base 2 and
// open under 6 and 11. The closed-neither cases use h=6; a refused
// complexity move is reached only from JN with neither remembered (jnShut).
const HS = 6;

/* ---------- this probe's own helpers ---------- */
const Z12 = znModel(12);
const KNOB_JS = (f, kind) => `(function(){
  var s = document.querySelector('.fsl-pair[data-f="${f}"] .fsl[data-kind="${kind}"]');
  if (!s) return null;
  var k = s.querySelector('.fsl-knob'), now = +s.getAttribute('aria-valuenow');
  var c = function(e){ var r = e.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, w: r.width, h: r.height, top: r.top, bottom: r.bottom, left: r.left, right: r.right }; };
  var slot = s.querySelector('.fsl-notch[data-v="' + now + '"] .fsl-detent');
  return { now: now, k: c(k), slot: slot ? c(slot) : null, left: k.style.left, top: k.style.top, anims: k.getAnimations ? k.getAnimations().length : 0 };
})()`;
const knobOf = (P, f, kind, ctx) => P.ev(KNOB_JS(f, kind), ctx);
const centred = (kn, tol = 0.6) => !!kn && !!kn.slot && Math.abs(kn.k.x - kn.slot.x) < tol && Math.abs(kn.k.y - kn.slot.y) < tol && kn.left === '';
// The slider kind of formula f laid out: each notch's v, its detent centre,
// its caption's box, its classes and tooltip; the fork drawing; the knob.
const SLIDER_JS = (f, kind) => `(function(){
  var s = document.querySelector('.fsl-pair[data-f="${f}"] .fsl[data-kind="${kind}"]');
  if (!s) return null;
  var c = function(e){ var r = e.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, top: r.top, bottom: r.bottom, left: r.left, right: r.right, w: r.width, h: r.height }; };
  return { fork: s.classList.contains('is-fork'), svg: !!s.querySelector('svg.fsl-fork'), offPaths: s.querySelectorAll('svg.fsl-fork path.is-off').length, offTop: s.querySelectorAll('svg.fsl-fork path.is-off[data-part="top"]').length, max: s.getAttribute('aria-valuemax'), now: s.getAttribute('aria-valuenow'), text: s.getAttribute('aria-valuetext'), box: c(s),
    notches: Array.prototype.map.call(s.querySelectorAll('.fsl-notch'), function(n){ return { v: +n.getAttribute('data-v'), d: c(n.querySelector('.fsl-detent')), l: c(n.querySelector('.fsl-label')), text: n.textContent, cls: n.className, title: n.title, dis: n.getAttribute('aria-disabled') }; }) };
})()`;
const sliderOf = (P, f, kind, ctx) => P.ev(SLIDER_JS(f, kind), ctx);
const notchCls = async (P, f, kind, v) => (await P.ev(`(function(){var e=document.querySelector(${JSON.stringify(chipSel(f, kind, v))});return e?e.className:null})()`));
const flashNow = P => P.ev(`Array.prototype.map.call(document.querySelectorAll('.fsl-notch.is-flash-no'), function(n){ return n.closest('.fsl-pair').getAttribute('data-f') + ':' + n.closest('.fsl').getAttribute('data-kind') + ':' + n.getAttribute('data-v'); }).sort()`);
const tokens = async P => { const ps = await pairs(P); return ps.map(p => p.token); };
const focusSl = (P, f, kind) => P.ev(`(function(){var s=document.querySelector('.fsl-pair[data-f="${f}"] .fsl[data-kind="${kind}"]');if(!s)return false;s.focus();return document.activeElement===s})()`);
const ZB = `${ZN}&logbase=1`;
// Samples of the knob's centre relative to the slider, every 15 ms for ms.
const GLIDE_JS = (f, ms) => `new Promise(function(res){
  var out = [], t0 = performance.now();
  (function tick(){
    var s = document.querySelector('.fsl-pair[data-f="${f}"] .fsl[data-kind="complexity"]');
    if (s){ var b = s.getBoundingClientRect(), k = s.querySelector('.fsl-knob').getBoundingClientRect(); out.push({ x: k.left + k.width / 2 - b.left, y: k.top + k.height / 2 - b.top, w: b.width }); }
    if (performance.now() - t0 < ${ms}) setTimeout(tick, 15); else res(out);
  })();
})`;
// The fork's slot centres relative to the slider.
const SLOTS_JS = f => `(function(){
  var s = document.querySelector('.fsl-pair[data-f="${f}"] .fsl[data-kind="complexity"]'), b = s.getBoundingClientRect(), o = {};
  s.querySelectorAll('.fsl-notch').forEach(function(n){ var r = n.querySelector('.fsl-detent').getBoundingClientRect(); o[n.getAttribute('data-v')] = [r.left + r.width / 2 - b.left, r.top + r.height / 2 - b.top]; });
  return o;
})()`;
const segD = (p, a, b) => { const dx = b[0] - a[0], dy = b[1] - a[1], l2 = dx * dx + dy * dy; const t = l2 ? Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / l2)) : 0; return Math.hypot(p[0] - a[0] - t * dx, p[1] - a[1] - t * dy); };
// The drawn track from the slot centres (bends 15 px in from JN and complete).
const trackSegs = o => {
  const drop = o[3][1] - o[0][1], L = [o[0][0] + drop, o[3][1]], R = [o[2][0] - drop, o[3][1]];
  return [[o[0], o[1]], [o[1], o[2]], [o[0], L], [L, o[3]], [o[3], R], [R, o[2]]];
};
const onTrack = (p, o) => Math.min(...trackSegs(o).map(([a, b]) => segD([p.x, p.y], a, b)));

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

/* ---------- render: four slots for ℤ/nℤ only ---------- */
SCENARIOS.push(['render', async browser => {
  const P = await openPage(browser, 'render', { w: 1280, h: 900, ua: UA_DESKTOP });
  await P.load(`${ZB}&gen=9`);
  await P.enter();
  let ps = await pairs(P);
  out(ps.length === 2 && !(await P.exists('.fmap')) && same(ps.map(p => p.f), ['order', 'index']), 'render', 'ℤ/12ℤ: two slider pairs, no map (the map waits behind the toggle)', ps.map(p => p.f));
  out(ps.every(p => p.c.labels === 'JN|compact|complete|compact SLS' && p.v.labels === 'LCM|neither|GCD'), 'render', 'ℤ/12ℤ: complexity JN|compact|complete|compact SLS, form LCM|neither|GCD', ps.map(p => [p.c.labels, p.v.labels]));
  out(await P.exists('.fsl-pair .fsl-maptoggle[aria-pressed="false"]'), 'render', 'the map toggle is there, off');
  for (const f of ['order', 'index']) {
    const c = await sliderOf(P, f, 'complexity'), v = await sliderOf(P, f, 'form');
    const n = Object.fromEntries(c.notches.map(x => [x.v, x]));
    out(c.fork && c.svg && c.max === '3' && c.notches.length === 4 && !v.fork && v.notches.length === 3 && v.max === '2' && c.offPaths === 0 && c.notches.every(x => !/is-off/.test(x.cls) && x.dis === null), 'render', `${f}: complexity forked (4 slots, aria-valuemax 3, nothing greyed), form straight (3 slots)`, { c: [c.fork, c.svg, c.max, c.notches.length], v: [v.fork, v.notches.length, v.max] });
    out(Math.abs(n[3].d.x - n[1].d.x) < 0.6 && n[3].d.y - n[1].d.y > 12 && Math.abs(n[0].d.y - n[1].d.y) < 0.6 && Math.abs(n[2].d.y - n[1].d.y) < 0.6, 'render', `${f}: slot 3 exactly under compact, 1 / 2 / 4 on one line`, n);
    out([0, 1, 2].every(k => n[k].l.bottom <= n[k].d.top + 0.5) && n[3].l.top >= n[3].d.bottom - 0.5, 'render', `${f}: the top captions over their slots, compact SLS's under its slot`);
    out(/^Do not use a logarithm in order to find the distance between E and G on the circle\. Only available for additive groups\.$/.test(n[3].title), 'render', `${f}: compact SLS's tooltip says it reads h without a logarithm`, n[3].title);
    out(c.box.bottom - c.box.top <= 64 && c.notches.every(x => x.l.bottom <= c.box.bottom + 0.5 && x.l.top >= c.box.top - 0.5), 'render', `${f}: the fork is ${Math.round(c.box.h)} px tall (≤ 64) with every caption inside`, c.box);
  }
  const geo = await P.ev(`(function(){var p=document.querySelector('.fsl-pair').getBoundingClientRect(), m=document.querySelector('.ring-hover-formula math.ring-math-formula').getBoundingClientRect(); return { w: p.width, h: p.height, left: p.right <= m.left }; })()`);
  out(geo.w <= 200 && geo.left, 'render', `the pair is ${Math.round(geo.w)} x ${Math.round(geo.h)} px, left of its formula`, geo);
  out(await noScroll(P), 'render', 'no sideways scroll at 1280');
  out(centred(await knobOf(P, 'order', 'complexity')) && centred(await knobOf(P, 'order', 'form')), 'render', 'the knobs rest centred in their slots');
  for (const [u, name] of [[`${UNITS}&gen=5&logbase=2`, '(ℤ/13ℤ)*'], ['?mobile=0&curve=11,1,3&subformularow=both&subformularing=both&gen=1', 'E(𝔽₁₁)']]) {
    await P.load(u);
    await P.enter();
    ps = await pairs(P);
    const c = await sliderOf(P, 'order', 'complexity'), n3 = c.notches.find(x => x.v === 3);
    // quick 261101-tpr: the same fork, its SLS part greyed out and out of reach
    out(ps.length === 2 && ps.every(p => p.c.labels === 'JN|compact|complete|compact SLS') && c.fork && c.svg && c.max === '3' && c.notches.length === 4, 'render', `${name}: the complexity slider forks to four slots like ℤ/nℤ's`, ps.map(p => p.c.labels));
    out(!!n3 && /is-off/.test(n3.cls) && n3.dis === 'true' && /Only available for additive groups\./.test(n3.title) && c.notches.filter(x => /is-off/.test(x.cls)).length === 1, 'render', `${name}: slot 3 alone is off (is-off, aria-disabled, its tooltip says SLS forms are additive only)`, n3);
    out(c.offPaths === 2 && c.offTop === 0, 'render', `${name}: the branch (edge and groove) is greyed, the top line is not`, [c.offPaths, c.offTop]);
    const op = await P.ev(`(function(){var s=document.querySelector('.fsl-pair[data-f="order"] .fsl[data-kind="complexity"]');return { n3: +getComputedStyle(s.querySelector('.fsl-notch[data-v="3"]')).opacity, n1: +getComputedStyle(s.querySelector('.fsl-notch[data-v="1"]')).opacity, off: getComputedStyle(s.querySelector('path.fsl-fork-edge.is-off')).stroke, on: getComputedStyle(s.querySelector('path.fsl-fork-edge:not(.is-off)')).stroke };})()`);
    out(op.n3 < 0.6 && op.n1 === 1 && op.off !== op.on, 'render', `${name}: slot 3 dimmed (opacity ${op.n3}), the branch stroke lighter than the top line's`, op);
    out(centred(await knobOf(P, 'order', 'complexity')), 'render', `${name}: the knob rests centred in its slot`);
  }
  noErrors(P, 'render');
  await P.done();
}]);

/* ---------- slots: every slot's token and formula ---------- */
SCENARIOS.push(['slots', async browser => {
  const P = await openPage(browser, 'slots', { w: 1280, h: 900, ua: UA_DESKTOP });
  const h = 9, g = 1;
  await P.load(`${ZB}&gen=${h}`);
  await P.enter();
  for (const [form, row] of [[2, 'gcd'], [0, 'lcm']]) {
    for (const f of ['order', 'index']) {
      await clickChip(P, f, 'complexity', 2);
      await clickChip(P, f, 'form', form);
    }
    for (const [v, want] of [[0, 'jn'], [1, row + '-short'], [3, row + '-sls'], [2, row + '-full'], [3, row + '-sls']]) {
      for (const f of ['order', 'index']) await clickChip(P, f, 'complexity', v);
      const ps = await pairs(P), st = await P.steps(), fm = await P.formulas();
      const wantTexts = wantPair(Z12, g, h, want, want);
      const node = NODE_OF(want);
      out(ps.every(p => p.token === want && p.c.now === v && p.c.at === v) && [await P.param('fmaporder'), await P.param('fmapindex')].every(x => x === want || (x === null && want === 'gcd-full')), 'slots', `${row}: complexity slot ${v} gives ${want} on both, in the url (gcd-full, the default, as no key)`, ps.map(p => [p.token, p.c.now]));
      out(same(st, [STEPS_ORDER[node], STEPS_INDEX[node]]), 'slots', `${want}: ${STEPS_ORDER[node]} / ${STEPS_INDEX[node]} steps`, st);
      out(same(plains(fm.ring), wantTexts), 'slots', `${want}: both formulas as the model writes them`, { got: plains(fm.ring), want: wantTexts });
      if (v === 3) {
        out(ps.every(p => p.c.text === 'compact, skipping the logarithm substitution' && p.v.now === form && !p.v.inert), 'slots', `${want}: aria-valuetext names compact SLS; the form slider is live on ${V_TEXT[form]}`, ps.map(p => [p.c.text, p.v.now, p.v.inert]));
        out(centred(await knobOf(P, 'order', 'complexity')), 'slots', `${want}: the knob rests centred in slot 3`, await knobOf(P, 'order', 'complexity'));
      }
    }
  }
  // At compact SLS the form slider switches the row: gcd-sls <-> lcm-sls.
  await clickChip(P, 'order', 'form', 2);
  out((await pairOf(P, 'order')).token === 'gcd-sls', 'slots', 'at compact SLS the form GCD gives gcd-sls');
  await clickChip(P, 'order', 'form', 0);
  out((await pairOf(P, 'order')).token === 'lcm-sls', 'slots', 'and LCM gives lcm-sls back');
  noErrors(P, 'slots');
  await P.done();
}]);

/* ---------- refuse: neither with compact SLS, both ways ---------- */
SCENARIOS.push(['refuse', async browser => {
  const P = await openPage(browser, 'refuse', { w: 1280, h: 900, ua: UA_DESKTOP });
  const check = async (label, act, f, wantTok) => {
    const q0 = await P.q();
    await act();
    await sleep(150);
    const fl = await flashNow(P), p = await pairOf(P, f), row = await rowNow(P);
    out(p.token === wantTok && (await P.q()) === q0, label, `refused: ${f} stays ${wantTok}, the url too`, { token: p.token, q0, q: await P.q() });
    out(same(fl, [`${f}:complexity:3`, `${f}:form:1`]), label, 'the compact SLS notch and the neither notch flash red', fl);
    out(!row || (row.ok.length === 0 && row.no.length === 0), label, 'no base box flashes (no base would help)', row && [row.ok, row.no]);
    await sleep(1300);
    out((await flashNow(P)).length === 0, label, 'the flash is gone after 1.3 s');
  };
  // complete / neither (abs-gcd: h=9 base 1, r = −3) → compact SLS
  await P.load(`${ZB}&gen=9&fmaporder=abs-gcd`);
  await P.enter();
  let cls = await notchCls(P, 'order', 'complexity', 3);
  const tip = await P.ev(`document.querySelector(${JSON.stringify(chipSel('order', 'complexity', 3))}).title`);
  out(/is-sls-no/.test(cls) && /has no form neither/.test(tip), 'refuse', 'at neither the compact SLS notch is marked is-sls-no with its tooltip', { cls, tip });
  await check('refuse', () => clickChip(P, 'order', 'complexity', 3), 'order', 'abs-gcd');
  // compact / neither (pos-lcm) → compact SLS by the key: Down
  await P.load(`${ZB}&gen=9&fmaporder=pos-lcm`);
  await P.enter();
  await focusSl(P, 'order', 'complexity');
  await check('refuse-key', () => P.key('ArrowDown', 'ArrowDown', 40), 'order', 'pos-lcm');
  // from JN with neither remembered
  await P.load(`${ZB}&gen=9&fmaporder=pos-gcd`);
  await P.enter();
  await clickChip(P, 'order', 'complexity', 0);
  out((await pairOf(P, 'order')).token === 'jn' && (await pairOf(P, 'order')).v.now === 1, 'refuse-jn', 'at JN the form rests on the remembered neither');
  await check('refuse-jn', () => clickChip(P, 'order', 'complexity', 3), 'order', 'jn');
  // compact SLS → neither on the form slider
  await P.load(`${ZB}&gen=9&fmaporder=gcd-sls&fmapindex=lcm-sls`);
  await P.enter();
  cls = await notchCls(P, 'index', 'form', 1);
  const tip2 = await P.ev(`document.querySelector(${JSON.stringify(chipSel('index', 'form', 1))}).title`);
  out(/is-sls-no/.test(cls) && /move the complexity off compact SLS/.test(tip2), 'refuse-form', 'at compact SLS the neither notch is marked is-sls-no with its tooltip', { cls, tip2 });
  await check('refuse-form', () => clickChip(P, 'index', 'form', 1), 'index', 'lcm-sls');
  await focusSl(P, 'order', 'form');
  await check('refuse-form-key', () => P.key('ArrowLeft', 'ArrowLeft', 37), 'order', 'gcd-sls');
  await P.key('Home', 'Home', 36);
  out((await pairOf(P, 'order')).token === 'lcm-sls', 'refuse-form-key', 'Home still takes the form to LCM: lcm-sls');
  // a drag let go on slot 3 at neither is refused and the knob goes back
  await P.load(`${ZB}&gen=9&fmaporder=abs-gcd`);
  await P.enter();
  const a = await chip(P, 'order', 'complexity', 2), b = await centre(P, chipSel('order', 'complexity', 3) + ' .fsl-detent');
  const q0 = await P.q();
  await drag(P, a, b, 10);
  await sleep(500);
  out((await pairOf(P, 'order')).token === 'abs-gcd' && (await P.q()) === q0 && centred(await knobOf(P, 'order', 'complexity'), 1), 'refuse-drag', 'a drag let go on slot 3 at neither: refused, the knob back in complete', await knobOf(P, 'order', 'complexity'));
  noErrors(P, 'refuse');
  await P.done();
}]);

/* ---------- force: a double-click takes the other slider along ---------- */
SCENARIOS.push(['force', async browser => {
  const P = await openPage(browser, 'force', { w: 1280, h: 900, ua: UA_DESKTOP });
  await P.load(`${ZB}&gen=9&fmaporder=abs-lcm`);
  await P.enter();
  let c = await centre(P, chipSel('order', 'complexity', 3) + ' .fsl-detent');
  await dbl(P, c.x, c.y);
  await sleep(700);
  out((await pairOf(P, 'order')).token === 'lcm-sls' && (await P.param('fmaporder')) === 'lcm-sls', 'force', 'double-click on slot 3 at complete / neither (row LCM): lcm-sls', (await pairOf(P, 'order')).token);
  // neither at compact SLS, a2 open under base 1 (h=9): straight to pos-gcd
  await P.load(`${ZB}&gen=9&fmaporder=gcd-sls`);
  await P.enter();
  c = await chip(P, 'order', 'form', 1);
  await dbl(P, c.x, c.y);
  await sleep(700);
  out((await pairOf(P, 'order')).token === 'pos-gcd' && (await P.param('logbase')) === '1', 'force', 'double-click on neither at gcd-sls (a2 open): compact / neither, pos-gcd, base kept', [(await pairOf(P, 'order')).token, await P.param('logbase')]);
  // h=7 base 1: a2 shut; the nearest base that opens it is picked first
  const want = pickModel(Z12, 7, 1, 'pos');
  await P.load(`${ZB}&gen=7&fmaporder=lcm-sls`);
  await P.enter();
  c = await chip(P, 'order', 'form', 1);
  await dbl(P, c.x, c.y);
  await sleep(2600);
  out((await pairOf(P, 'order')).token === 'pos-lcm' && (await P.param('logbase')) === String(want) && reach(Z12, want, 7).pos, 'force', `double-click on neither at lcm-sls with a2 shut under base 1: base ${want} picked, pos-lcm`, [(await pairOf(P, 'order')).token, await P.param('logbase')]);
  noErrors(P, 'force');
  await P.done();
}]);

/* ---------- keys: the fork's arrow rules ---------- */
SCENARIOS.push(['keys', async browser => {
  const P = await openPage(browser, 'keys', { w: 1280, h: 900, ua: UA_DESKTOP });
  await P.load(`${ZB}&gen=9&fmaporder=gcd-full`);
  await P.enter();
  await focusSl(P, 'order', 'complexity');
  const K = { ArrowLeft: 37, ArrowUp: 38, ArrowRight: 39, ArrowDown: 40, Home: 36, End: 35 };
  const seq = [
    ['ArrowLeft', 'gcd-short'], ['ArrowUp', 'gcd-short'], ['ArrowDown', 'gcd-sls'], ['ArrowDown', 'gcd-sls'],
    ['ArrowRight', 'gcd-full'], ['ArrowDown', 'gcd-full'], ['ArrowUp', 'gcd-full'], ['ArrowLeft', 'gcd-short'],
    ['ArrowDown', 'gcd-sls'], ['ArrowLeft', 'jn'], ['ArrowDown', 'jn'], ['ArrowRight', 'gcd-short'],
    ['ArrowDown', 'gcd-sls'], ['ArrowUp', 'gcd-short'], ['End', 'gcd-full'], ['ArrowLeft', 'gcd-short'], ['Home', 'jn'], ['ArrowLeft', 'jn'],
    ['End', 'gcd-full'], ['ArrowRight', 'gcd-full']
  ];
  let from = 'gcd-full';
  for (const [k, want] of seq) {
    await P.key(k, k, K[k]);
    const p = await pairOf(P, 'order');
    const focused = await P.ev(`!!(document.activeElement && document.activeElement.closest && document.activeElement.closest('.fsl-pair[data-f="order"] .fsl[data-kind="complexity"]'))`);
    out(p.token === want && focused, 'keys', `${from} + ${k}: ${want} (focus kept)`, { token: p.token, focused });
    from = want;
  }
  await P.key('ArrowLeft', 'ArrowLeft', 37);
  await P.key('ArrowDown', 'ArrowDown', 40);
  await P.key('ArrowLeft', 'ArrowLeft', 37);
  const p2 = await pairOf(P, 'order');
  out(p2.token === 'jn', 'keys', 'from compact SLS ArrowLeft goes to JN along the branch', p2.token);
  await P.key('ArrowRight', 'ArrowRight', 39);
  await P.key('ArrowDown', 'ArrowDown', 40);
  const p3 = await pairOf(P, 'order');
  out(p3.c.now === 3 && p3.c.text === 'compact, skipping the logarithm substitution', 'keys', 'aria-valuenow 3 and its text at compact SLS', [p3.c.now, p3.c.text]);
  // the straight slider keeps Up as Right
  await P.load(`${UNITS}&gen=5&logbase=2&fmaporder=gcd-short`);
  await P.enter();
  await focusSl(P, 'order', 'complexity');
  await P.key('ArrowUp', 'ArrowUp', 38);
  out((await pairOf(P, 'order')).token === 'gcd-full', 'keys', '(ℤ/13ℤ)*: ArrowUp still steps right, compact to complete', (await pairOf(P, 'order')).token);
  noErrors(P, 'keys');
  await P.done();
}]);

/* ---------- genrow: the generator row hides at JN and compact SLS ---------- */
SCENARIOS.push(['genrow', async browser => {
  const P = await openPage(browser, 'genrow', { w: 1280, h: 900, ua: UA_DESKTOP });
  for (const [o, i, shown] of [['gcd-sls', 'lcm-sls', false], ['jn', 'jn', false], ['jn', 'gcd-sls', false], ['gcd-short', 'gcd-sls', true], ['gcd-full', 'jn', true], ['lcm-short', 'lcm-full', true], ['abs-gcd', 'gcd-sls', true]]) {
    await P.load(`${ZB}&gen=9&fmaporder=${o}&fmapindex=${i}`);
    await P.enter();
    const has = await P.exists('.ring-hover-formula .lb-row'), lock = await P.exists('.ring-hover-formula .lb-lock'), wheel = await P.exists('.ring-hover-formula .lb-scroll');
    out(has === shown && lock === shown && wheel === shown, 'genrow', `${o} / ${i}: boxes, padlock and wheel switch ${shown ? 'shown' : 'hidden'}`, { has, lock, wheel });
  }
  await P.load(`?mobile=0&mode=additive&n=12&subformularow=both&subformularing=order&logbase=1&gen=9&fmaporder=gcd-short`);
  await P.enter();
  await clickChip(P, 'order', 'complexity', 3);
  out(!(await P.exists('.ring-hover-formula .lb-row')), 'genrow', 'one formula: compact → compact SLS hides the row');
  await clickChip(P, 'order', 'complexity', 1);
  out(await P.exists('.ring-hover-formula .lb-row'), 'genrow', 'and compact brings it back');
  noErrors(P, 'genrow');
  await P.done();
}]);

/* ---------- reload: compact SLS from the url ---------- */
SCENARIOS.push(['reload', async browser => {
  const P = await openPage(browser, 'reload', { w: 1280, h: 900, ua: UA_DESKTOP });
  await P.load(`${ZB}&gen=9`);
  await P.enter();
  await clickChip(P, 'order', 'complexity', 3);
  await clickChip(P, 'index', 'form', 0);
  await clickChip(P, 'index', 'complexity', 3);
  const q = await P.q();
  out(new URLSearchParams(q).get('fmaporder') === 'gcd-sls' && new URLSearchParams(q).get('fmapindex') === 'lcm-sls', 'reload', 'the url carries fmaporder=gcd-sls, fmapindex=lcm-sls', q);
  await P.load(q);
  await P.enter();
  const ps = await pairs(P);
  out(same(ps.map(p => [p.token, p.c.now, p.v.now]), [['gcd-sls', 3, 2], ['lcm-sls', 3, 0]]), 'reload', 'reloaded: both at compact SLS, GCD and LCM', ps.map(p => [p.token, p.c.now, p.v.now]));
  out(centred(await knobOf(P, 'order', 'complexity')) && centred(await knobOf(P, 'index', 'complexity')), 'reload', 'the knobs rest centred in slot 3');
  noErrors(P, 'reload');
  await P.done();
}]);

/* ---------- map: the open map beside the sliders keeps its SLS rows ---------- */
SCENARIOS.push(['map', async browser => {
  const P = await openPage(browser, 'map', { w: 1280, h: 900, ua: UA_DESKTOP });
  await P.load(`${ZB}&gen=9&fmaporder=gcd-sls&fmapindex=gcd-full`);
  await P.enter();
  out(!(await P.exists('.fmap')), 'map', 'closed by default');
  await P.clickEl('.fsl-pair[data-f="order"] .fsl-maptoggle');
  await sleep(600);
  let maps = await mapsNow(P);
  out(maps.length === 2 && maps.every(m => m.n === 9) && !(await P.exists('.fmap.no-sls')) && (await P.param('fmapopen')) === '1', 'map', 'the toggle opens both maps with all nine positions (SLS rows kept), fmapopen=1', maps.map(m => m.n));
  const box = await P.rect('.fmap[data-f="order"]');
  out(box && box.h > 80, 'map', `the additive map keeps its full height (94 px at the page's .9 zoom) (${box && Math.round(box.h)} px)`, box);
  const kn = await P.rect('.fmap[data-f="order"] .fmap-knob'), st = await P.rect('.fmap[data-f="order"] .fmap-stop[data-id="gcd-sls"]');
  out(maps[0].at === 'gcd-sls' && maps[0].checked === 'gcd-sls' && Math.abs(kn.x + kn.w / 2 - (st.x + st.w / 2)) < 1 && Math.abs(kn.y + kn.h / 2 - (st.y + st.h / 2)) < 1, 'map', 'the order map\'s knob sits on GCD SLS', { at: maps[0].at, kn, st });
  await clickChip(P, 'order', 'form', 0);
  maps = await mapsNow(P);
  out(maps[0].at === 'lcm-sls', 'map', 'the form slider to LCM: the map follows to LCM SLS', maps[0].at);
  // a click on the map's SLS node moves the sliders to slot 3
  await P.clickEl('.fmap[data-f="index"] .fmap-stop[data-id="gcd-sls"] input');
  await sleep(600);
  const p = await pairOf(P, 'index');
  out(p.token === 'gcd-sls' && p.c.now === 3 && p.v.now === 2, 'map', 'a click on the index map\'s GCD SLS: its sliders at compact SLS / GCD', [p.token, p.c.now, p.v.now]);
  // a refusal flashes nothing on the map (no node for it)
  await clickChip(P, 'index', 'form', 1);
  await sleep(100);
  out((await P.ev(`document.querySelectorAll('.fmap-stop.is-flash-no').length`)) === 0 && same(await flashNow(P), ['index:complexity:3', 'index:form:1']), 'map', 'the refusal flashes the two notches and no map node');
  await P.load(`${ZB}&gen=9&fmaporder=gcd-sls&fmapopen=1`);
  await P.enter();
  maps = await mapsNow(P);
  out(maps.length === 2 && maps[0].at === 'gcd-sls', 'map', 'fmapopen=1 reloads open, on gcd-sls');
  noErrors(P, 'map');
  await P.done();
}]);

/* ---------- glide: the knob follows the branch ---------- */
SCENARIOS.push(['glide', async browser => {
  const P = await openPage(browser, 'glide', { w: 1280, h: 900, ua: UA_DESKTOP });
  await P.load(`${ZB}&gen=9&fmaporder=jn`);
  await P.enter();
  const o = await P.ev(SLOTS_JS('order'));
  const c = await chip(P, 'order', 'complexity', 3);
  await P.ev(`window.__g = ${GLIDE_JS('order', 700)}; 1`);
  await click1(P, c.x, c.y);
  let ss = await P.ev('window.__g');
  const mid = ss.filter(s => Math.hypot(s.x - o[0][0], s.y - o[0][1]) > 2 && Math.hypot(s.x - o[3][0], s.y - o[3][1]) > 2);
  out((await pairOf(P, 'order')).token === 'gcd-sls', 'glide', 'JN → slot 3: gcd-sls');
  out(mid.length >= 3 && mid.every(s => onTrack(s, o) < 1.5), 'glide', `JN → slot 3: the knob glides on the branch (${mid.length} samples, max ${Math.max(...mid.map(s => onTrack(s, o))).toFixed(2)} px off it)`, mid.slice(0, 6));
  out(mid.some(s => s.y > o[0][1] + 3 && s.x < o[3][0] - 20), 'glide', 'and passes down the JN diagonal (not straight across)');
  out(centred(await knobOf(P, 'order', 'complexity')), 'glide', 'it ends centred in slot 3');
  // slot 3 → compact: straight up
  const c1 = await chip(P, 'order', 'complexity', 1);
  await P.ev(`window.__g = ${GLIDE_JS('order', 600)}; 1`);
  await click1(P, c1.x, c1.y);
  ss = await P.ev('window.__g');
  const up = ss.filter(s => Math.abs(s.y - o[1][1]) > 1 && Math.abs(s.y - o[3][1]) > 1);
  out(up.length >= 1 && up.every(s => Math.abs(s.x - o[1][0]) < 1), 'glide', `slot 3 → compact: straight up under compact (${up.length} samples)`, up);
  await sleep(300);
  // compact → complete stays on the top line; complete → slot 3 by the right diagonal
  const c2 = await chip(P, 'order', 'complexity', 2);
  await click1(P, c2.x, c2.y);
  await sleep(500);
  const c3 = await chip(P, 'order', 'complexity', 3);
  await P.ev(`window.__g = ${GLIDE_JS('order', 700)}; 1`);
  await click1(P, c3.x, c3.y);
  ss = await P.ev('window.__g');
  const mid2 = ss.filter(s => Math.hypot(s.x - o[2][0], s.y - o[2][1]) > 2 && Math.hypot(s.x - o[3][0], s.y - o[3][1]) > 2);
  out(mid2.length >= 3 && mid2.every(s => onTrack(s, o) < 1.5) && mid2.some(s => s.x > o[3][0] + 20 && s.y > o[2][1] + 3), 'glide', 'complete → slot 3: down the complete diagonal, on the branch', mid2.slice(0, 6));
  // JN → complete takes the top line
  const c0 = await chip(P, 'order', 'complexity', 0);
  await click1(P, c0.x, c0.y);
  await sleep(600);
  await P.ev(`window.__g = ${GLIDE_JS('order', 700)}; 1`);
  await click1(P, c2.x, c2.y);
  ss = await P.ev('window.__g');
  out(ss.every(s => Math.abs(s.y - o[0][1]) < 1), 'glide', 'JN → complete: along the top line');
  noErrors(P, 'glide');
  await P.done();
}]);

/* ---------- drag: along the drawn track ---------- */
SCENARIOS.push(['drag', async browser => {
  const P = await openPage(browser, 'drag', { w: 1280, h: 900, ua: UA_DESKTOP });
  await P.load(`${ZB}&gen=9&fmaporder=gcd-full`);
  await P.enter();
  const sl = await P.rect('.fsl-pair[data-f="order"] .fsl[data-kind="complexity"]');
  const o = await P.ev(SLOTS_JS('order'));
  const abs = (pt) => ({ x: sl.x + pt[0], y: sl.y + pt[1] });
  // hold the knob at complete, move to the middle of the bottom line, hold: knob on the track
  const from = abs(o[2]), to = { x: sl.x + o[3][0] + 4, y: sl.y + o[3][1] + 6 };
  await P.S('Input.dispatchMouseEvent', { type: 'mouseMoved', x: from.x, y: from.y });
  await P.S('Input.dispatchMouseEvent', { type: 'mousePressed', x: from.x, y: from.y, button: 'left', buttons: 1, clickCount: 1 });
  const held = [];
  for (let i = 1; i <= 10; i++) {
    await sleep(20);
    const x = from.x + (to.x - from.x) * i / 10, y = from.y + (to.y - from.y) * i / 10;
    await P.S('Input.dispatchMouseEvent', { type: 'mouseMoved', x, y, button: 'left', buttons: 1 });
    const k = await P.rect('.fsl-pair[data-f="order"] .fsl[data-kind="complexity"] .fsl-knob');
    held.push({ x: k.x + k.w / 2 - sl.x, y: k.y + k.h / 2 - sl.y });
  }
  out(held.every(s => onTrack(s, o) < 1), 'drag', `held, the knob stays on the drawn track (max ${Math.max(...held.map(s => onTrack(s, o))).toFixed(2)} px off)`, held);
  await P.S('Input.dispatchMouseEvent', { type: 'mouseReleased', x: to.x, y: to.y, button: 'left', buttons: 0, clickCount: 1 });
  await sleep(700);
  out((await pairOf(P, 'order')).token === 'gcd-sls' && centred(await knobOf(P, 'order', 'complexity')), 'drag', 'let go near slot 3: gcd-sls, the knob centred', await knobOf(P, 'order', 'complexity'));
  // a drag from slot 3 up toward the top line near compact, let go: compact
  await drag(P, abs(o[3]), { x: sl.x + o[1][0] + 3, y: sl.y + o[1][1] - 2 }, 10);
  out((await pairOf(P, 'order')).token === 'gcd-sls' || (await pairOf(P, 'order')).token === 'gcd-short', 'drag', 'a drag off slot 3 lands on a slot', (await pairOf(P, 'order')).token);
  out(centred(await knobOf(P, 'order', 'complexity'), 1), 'drag', 'and the knob ends centred', await knobOf(P, 'order', 'complexity'));
  // a short drag that stays near its slot: nothing commits, the knob back
  await P.load(`${ZB}&gen=9&fmaporder=gcd-sls`);
  await P.enter();
  const q0 = await P.q();
  await drag(P, abs(o[3]), { x: sl.x + o[3][0] + 9, y: sl.y + o[3][1] }, 5);
  out((await P.q()) === q0 && centred(await knobOf(P, 'order', 'complexity'), 1), 'drag', 'let go near its own slot: nothing changes, the knob slides back', await knobOf(P, 'order', 'complexity'));
  noErrors(P, 'drag');
  await P.done();
}]);

/* ---------- others: groups of units and curves are unchanged ---------- */
SCENARIOS.push(['others', async browser => {
  const P = await openPage(browser, 'others', { w: 1280, h: 900, ua: UA_DESKTOP });
  await P.load(`${UNITS}&gen=5&logbase=2&fmaporder=gcd-full`);
  await P.enter();
  for (const [v, want] of [[0, 'jn'], [1, 'gcd-short'], [2, 'gcd-full']]) {
    await clickChip(P, 'order', 'complexity', v);
    out((await pairOf(P, 'order')).token === want && centred(await knobOf(P, 'order', 'complexity')), 'others', `(ℤ/13ℤ)* slot ${v}: ${want}, knob centred`);
  }
  // quick 261101-tpr: slot 3 is there but out of reach; nothing gets the token to an SLS form
  out((await P.exists('.fsl-pair[data-f="order"] .fsl.is-fork')) && (await P.exists(chipSel('order', 'complexity', 3) + '.is-off[aria-disabled="true"]')), 'others', '(ℤ/13ℤ)*: the fork with slot 3 off');
  const notSls = async (label, from) => {
    const p = await pairOf(P, 'order'), kn = await knobOf(P, 'order', 'complexity');
    out(p.token === from && !/sls/.test(p.token) && p.c.now !== 3 && (await P.param('fmaporder')) === (from === 'gcd-full' ? null : from) && centred(kn, 1), 'others', `${label}: the token stays ${from}, the knob centred on slot ${kn && kn.now}`, { token: p.token, kn });
  };
  for (const from of ['gcd-short', 'gcd-full', 'jn']) {
    await P.load(`${UNITS}&gen=5&logbase=2&fmaporder=${from}`);
    await P.enter();
    const c3 = await chip(P, 'order', 'complexity', 3);
    await click1(P, c3.x, c3.y);
    await sleep(600);
    await notSls(`(ℤ/13ℤ)* ${from}: a click on slot 3`, from);
    out((await flashNow(P)).length === 0, 'others', `${from}: and nothing flashes`, await flashNow(P));
    await dbl(P, c3.x, c3.y);
    await sleep(900);
    await notSls(`(ℤ/13ℤ)* ${from}: a double-click on slot 3`, from);
    const lab = await centre(P, chipSel('order', 'complexity', 3) + ' .fsl-label');
    await click1(P, lab.x, lab.y);
    await sleep(600);
    await notSls(`(ℤ/13ℤ)* ${from}: a click on slot 3's caption`, from);
  }
  // neither (pos-gcd at compact) with slot 3: no SLS refusal either
  await P.load(`${UNITS}&gen=5&logbase=2&fmaporder=pos-gcd`);
  await P.enter();
  let c3 = await chip(P, 'order', 'complexity', 3);
  await click1(P, c3.x, c3.y);
  await sleep(150);
  out((await flashNow(P)).length === 0 && (await pairOf(P, 'order')).token === 'pos-gcd', 'others', '(ℤ/13ℤ)* pos-gcd: a click on slot 3 does nothing, no refusal flash', await flashNow(P));
  await dbl(P, c3.x, c3.y);
  await sleep(900);
  out((await pairOf(P, 'order')).token === 'pos-gcd', 'others', '(ℤ/13ℤ)* pos-gcd: a double-click on slot 3 forces nothing', (await pairOf(P, 'order')).token);
  // keys: Down from compact never reaches slot 3 (it steps to JN, as the straight track did); Up steps on
  await P.load(`${UNITS}&gen=5&logbase=2&fmaporder=gcd-short`);
  await P.enter();
  await focusSl(P, 'order', 'complexity');
  const keyTo = async (key, vk, want) => {
    await P.key(key, key, vk);
    await sleep(500);
    const p = await pairOf(P, 'order');
    out(p.token === want && p.c.now !== 3, 'others', `(ℤ/13ℤ)* ${key}: ${want}, never slot 3`, p.token);
  };
  await keyTo('ArrowDown', 40, 'jn');
  await keyTo('ArrowRight', 39, 'gcd-short');
  await keyTo('ArrowUp', 38, 'gcd-full');
  await keyTo('ArrowDown', 40, 'gcd-short');
  await keyTo('ArrowDown', 40, 'jn');
  await keyTo('ArrowDown', 40, 'jn');
  await keyTo('End', 35, 'gcd-full');
  // a drag down onto slot 3: the knob keeps to the top line and lands on a top slot
  await P.load(`${UNITS}&gen=5&logbase=2&fmaporder=gcd-full`);
  await P.enter();
  const sl = await P.rect('.fsl-pair[data-f="order"] .fsl[data-kind="complexity"]');
  const o = await P.ev(SLOTS_JS('order'));
  const from = { x: sl.x + o[2][0], y: sl.y + o[2][1] }, to = { x: sl.x + o[3][0], y: sl.y + o[3][1] + 4 };
  await P.S('Input.dispatchMouseEvent', { type: 'mouseMoved', x: from.x, y: from.y });
  await P.S('Input.dispatchMouseEvent', { type: 'mousePressed', x: from.x, y: from.y, button: 'left', buttons: 1, clickCount: 1 });
  const held = [];
  for (let i = 1; i <= 10; i++) {
    await sleep(20);
    await P.S('Input.dispatchMouseEvent', { type: 'mouseMoved', x: from.x + (to.x - from.x) * i / 10, y: from.y + (to.y - from.y) * i / 10, button: 'left', buttons: 1 });
    const k = await P.rect('.fsl-pair[data-f="order"] .fsl[data-kind="complexity"] .fsl-knob');
    held.push(k.y + k.h / 2 - sl.y);
  }
  out(held.every(y => Math.abs(y - o[0][1]) < 1), 'others', '(ℤ/13ℤ)* held toward slot 3 the knob stays on the top line', held);
  await P.S('Input.dispatchMouseEvent', { type: 'mouseReleased', x: to.x, y: to.y, button: 'left', buttons: 0, clickCount: 1 });
  await sleep(800);
  const pd = await pairOf(P, 'order');
  out(pd.token === 'gcd-short' && centred(await knobOf(P, 'order', 'complexity'), 1), 'others', '(ℤ/13ℤ)* let go on slot 3: the nearest top slot (compact, gcd-short), the knob centred', pd.token);
  // the curve too
  await P.load('?mobile=0&curve=11,1,3&subformularow=both&subformularing=both&gen=1');
  await P.enter();
  const t0 = (await pairOf(P, 'order')).token;
  c3 = await chip(P, 'order', 'complexity', 3);
  await click1(P, c3.x, c3.y);
  await sleep(600);
  await dbl(P, c3.x, c3.y);
  await sleep(900);
  out((await pairOf(P, 'order')).token === t0 && !/sls/.test(t0), 'others', `E(𝔽₁₁): click and double-click on slot 3 leave ${t0}`, (await pairOf(P, 'order')).token);
  await P.load(`${UNITS}&gen=5&logbase=2&fmaporder=jn&fmapindex=jn`);
  await P.enter();
  out(!(await P.exists('.ring-hover-formula .lb-row')), 'others', '(ℤ/13ℤ)* both at JN: no row');
  await P.load(`${UNITS}&gen=5&logbase=2&fmaporder=gcd-sls`);
  await P.enter();
  out((await pairOf(P, 'order')).token === 'jn', 'others', '(ℤ/13ℤ)*: an SLS token from the url settles to JN as before');
  noErrors(P, 'others');
  await P.done();
}]);

/* ---------- mobile: the fork fits a phone ---------- */
SCENARIOS.push(['mobile', async browser => {
  const P = await openPage(browser, 'mobile', { w: 390, h: 844, ua: UA_ANDROID, touch: true });
  await P.load('?mobile=1&mode=additive&n=12&gen=9&logbase=1&subformularow=both&subformularing=both');
  await sleep(1000);
  out((await pairs(P)).length === 2, 'mobile', 'both pairs on the phone page');
  await P.ev(`document.querySelector('.fsl-pair[data-f="order"]').scrollIntoView({ block: 'center' })`);
  await sleep(300);
  const c = await sliderOf(P, 'order', 'complexity');
  const n = Object.fromEntries(c.notches.map(x => [x.v, x]));
  out(c.fork && c.box.left >= 0 && c.box.right <= 390 && Math.abs(n[3].d.x - n[1].d.x) < 0.6 && c.box.h <= 70, 'mobile', `the fork fits (${Math.round(c.box.w)} x ${Math.round(c.box.h)} px), slot 3 under compact`, c.box);
  out(centred(await knobOf(P, 'order', 'complexity')), 'mobile', 'the knob rests centred');
  const t = await centre(P, chipSel('order', 'complexity', 3) + ' .fsl-detent');
  await P.S('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: t.x, y: t.y }] });
  await sleep(40);
  await P.S('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await sleep(900);
  out((await pairOf(P, 'order')).token === 'gcd-sls' && (await P.param('fmaporder')) === 'gcd-sls', 'mobile', 'a tap on slot 3: gcd-sls', (await pairOf(P, 'order')).token);
  out(await noScroll(P), 'mobile', 'no sideways scroll');
  noErrors(P, 'mobile');
  await P.done();
}]);

/* ---------- ringwin: an extra Ring window on ℤ/nℤ ---------- */
SCENARIOS.push(['ringwin', async browser => {
  const P = await openPage(browser, 'ringwin', { w: 1280, h: 900, ua: UA_DESKTOP });
  await P.load(`${UNITS}&gen=5&logbase=2`);
  await P.enter();
  const src = new URL('?ringwin=1&mobile=0&mode=additive&n=12&gen=9&subformularing=both&logbase=1', URL_BASE).href;
  await P.ev(`(function(){ window.__rw = []; window.addEventListener('message', function(e){ if (e.data && e.data.ringwin === 'state') window.__rw.push(e.data.q); }); var f = document.createElement('iframe'); f.id = 'probe-rw'; f.style.cssText = 'position:fixed;left:0;top:0;width:900px;height:800px;z-index:99999;border:0'; f.src = ${JSON.stringify(src)}; document.body.appendChild(f); return 1; })()`);
  let ctx = null;
  for (let i = 0; i < 30 && !ctx; i++) {
    await sleep(300);
    const cx = await P.paneCtx();
    if (cx && (await P.ev(`document.querySelectorAll('.fsl-pair .fsl.is-fork').length === 2`, cx).catch(() => false))) ctx = cx;
  }
  out(!!ctx, 'ringwin', 'a ?ringwin=1 window on ℤ/12ℤ shows two pairs with forked complexity');
  if (!ctx) { noErrors(P, 'ringwin'); await P.done(); return; }
  await sleep(600);
  await P.ev(`document.querySelector('${chipSel('order', 'complexity', 3)}').click()`, ctx);
  await sleep(1200);
  const last = new URLSearchParams((await P.ev('window.__rw')).pop() || '');
  out(last.get('fmaporder') === 'gcd-sls', 'ringwin', "the window's state message carries fmaporder=gcd-sls", Object.fromEntries(last));
  out((await P.param('fmaporder')) === null, 'ringwin', "the host page's own sliders are untouched", await P.q());
  noErrors(P, 'ringwin');
  await P.done();
}]);

/* ---------- pane: the isomorphism pane beside an additive host ---------- */
async function openPane(P, query, chip) {
  await P.load(query);
  await P.enter();
  const hit = await P.ev(`(function(){var cs=Array.prototype.filter.call(document.querySelectorAll('#iso-panel a.iso-chip'), function(a){ return a.textContent.indexOf(${JSON.stringify(chip)}) !== -1; }); if (cs[0]) cs[0].click(); return cs.length;})()`);
  if (!hit) return null;
  for (let i = 0; i < 30; i++) {
    await sleep(300);
    const c = await P.paneCtx();
    if (c && (await P.ev(`document.querySelectorAll('.fmap, .fsl-pair').length`, c)) === 2) { await sleep(800); return c; }
  }
  return null;
}
SCENARIOS.push(['pane', async browser => {
  const P = await openPage(browser, 'pane', { w: 1500, h: 900, ua: UA_DESKTOP });
  const ctx = await openPane(P, '?mobile=0&mode=additive&n=12&gen=1&subformularing=both&subformularingr=both', 'ℤ/13ℤ,×');
  out(!!ctx, 'pane', 'the pane opens on (ℤ/13ℤ)* beside ℤ/12ℤ');
  if (!ctx) { noErrors(P, 'pane'); await P.done(); return; }
  out((await P.ev(`document.querySelectorAll('.fsl-pair .fsl.is-fork').length`)) === 2 && (await P.ev(`document.querySelectorAll('.fmap').length`)) === 0, 'pane', 'the host (ℤ/12ℤ): two forked pairs, no map');
  // quick 261101-tpr: the pane's (ℤ/13ℤ)* forks too, with slot 3 off; the host's slot 3 is on
  out((await P.ev(`document.querySelectorAll('.fsl-pair').length`, ctx)) === 2 && (await P.ev(`document.querySelectorAll('.fsl.is-fork').length`, ctx)) === 2 && (await P.ev(`document.querySelectorAll('.fsl-notch.is-off[data-v="3"]').length`, ctx)) === 2 && (await P.ev(`document.querySelectorAll('.fsl-notch.is-off').length`)) === 0, 'pane', 'the pane ((ℤ/13ℤ)*): two forked pairs, slot 3 off; the host none off');
  await clickChip(P, 'order', 'complexity', 3);
  out((await pairOf(P, 'order')).token === 'gcd-sls' && (await P.param('fmaporder')) === 'gcd-sls', 'pane', 'the host goes to compact SLS', await P.q());
  noErrors(P, 'pane');
  await P.done();
}]);

/* ---------- shot: light and dark ---------- */
SCENARIOS.push(['shot', async browser => {
  for (const scheme of ['light', 'dark']) {
    const Q = await openPage(browser, 'shot', { w: 1280, h: 900, ua: UA_DESKTOP });
    await Q.S('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: scheme }] });
    const pairClip = async () => { const r = await Q.rect('.fsl-pair[data-f="order"]'); return { x: r.x - 10, y: r.y - 8, width: r.w + 20, height: r.h + 16 }; };
    const boxClip = async () => { const r = await Q.rect('.ring-hover-formula'); return { x: Math.max(0, r.x - 8), y: Math.max(0, r.y - 8), width: Math.min(r.w + 16, 1280), height: r.h + 16 }; };
    await Q.load(`${ZB}&gen=9&fmaporder=gcd-sls&fmapindex=lcm-short`);
    await Q.enter();
    await Q.shot(`shot-so1-pair-sls-${scheme}.png`, await pairClip(), scheme);
    await Q.shot(`shot-so1-box-${scheme}.png`, await boxClip(), scheme);
    await Q.load(`${ZB}&gen=9&fmaporder=lcm-sls&fmapindex=abs-gcd&fmapopen=1`);
    await Q.enter();
    await Q.shot(`shot-so1-box-open-${scheme}.png`, await boxClip(), scheme);
    noErrors(Q, 'shot ' + scheme);
    await Q.done();
    const M = await openPage(browser, 'shot', { w: 390, h: 844, ua: UA_ANDROID, touch: true });
    await M.S('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: scheme }] });
    await M.load('?mobile=1&mode=additive&n=12&gen=9&logbase=1&subformularow=both&subformularing=both&fmaporder=gcd-short');
    await sleep(1000);
    await M.ev(`document.querySelector('.fsl-pair[data-f="order"]').scrollIntoView({ block: 'center' })`);
    await sleep(300);
    const r = await M.rect('.fsl-pair[data-f="order"]'), sy = await M.ev('window.scrollY');
    await M.shot(`shot-so1-mobile-${scheme}.png`, { x: Math.max(0, r.x - 10), y: r.y + sy - 8, width: Math.min(r.w + 20, 390), height: r.h + 16 }, scheme);
    noErrors(M, 'shot mobile ' + scheme);
    await M.done();
  }
}]);

/* ---------- tprshot: quick 261101-tpr's (ℤ/13ℤ)* pair, light and dark ---------- */
SCENARIOS.push(['tprshot', async browser => {
  const dir = '../261101-tpr-cyclic-groups-ec-and-multiplicative-grou/';
  for (const scheme of ['light', 'dark']) {
    const Q = await openPage(browser, 'tprshot', { w: 1280, h: 900, ua: UA_DESKTOP });
    await Q.S('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: scheme }] });
    await Q.load(`${UNITS}&gen=5&logbase=2&fmaporder=gcd-short`);
    await Q.enter();
    const r = await Q.rect('.fsl-pair[data-f="order"]');
    await Q.shot(`${dir}shot-tpr-mult-pair-${scheme}.png`, { x: r.x - 10, y: r.y - 8, width: r.w + 20, height: r.h + 16 }, scheme);
    noErrors(Q, 'tprshot ' + scheme);
    await Q.done();
  }
}]);

const browser = await connect();
try {
  for (const [name, fn] of SCENARIOS) if (want(name) && (ONLY.includes(name) || !['shot', 'tprshot'].includes(name))) await fn(browser);
} catch (e) {
  fails++;
  console.log('FAIL probe-crashed ' + (e && e.stack || e));
}
browser.close();
console.log(fails === 0 ? 'ADDITIVE-SLIDER-CHECK OK' : `ADDITIVE-SLIDER-CHECK FAIL: ${fails}`);
const gone = new Promise(res => chrome.once('exit', res));
try { chrome.kill('SIGKILL'); } catch (e) {}
await Promise.race([gone, sleep(3000)]);
for (let i = 0; i < 10; i++) {
  try { rmSync(profile, { recursive: true, force: true }); } catch (e) {}
  await sleep(300);
  if (!existsSync(profile)) break;
}
process.exit(fails === 0 ? 0 : 1);
