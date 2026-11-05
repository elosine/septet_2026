#!/usr/bin/env node
// swipe_check.js — THE SWIPE (day 49, for_seven_tubas RUNNING_LOG 118 ruled · 120 the fault seen · 121 built): the
// Flute's stand opened headless at the iPad's size on a scratch stand server, driven through the page's own hooks
// (__standTurn · __standTap · __standPlay · __standPause · __standState · __standCursorOn) and checked against the rules:
//   · a swipe is the previous or next SCREEN of ROWS pages, in order, the cursor at the start of its page 1
//   · a tap moves only the cursor — the pages stay
//   · the pages flip AT PLAY, every played page at once, then one at a time
//   · the screen's edges: nothing before the first page, nothing after the last
//   · THE LANDING CURSOR (117): a link with a time keeps its cursor through the viewport's settling
//   node tools/swipe_check.js      (exit 1 on any failure)

const { spawn } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const ROOT = path.join(__dirname, '..');
function arg(name, def) { const i = process.argv.indexOf('--' + name); return i >= 0 ? process.argv[i + 1] : def; }
const PORT = parseInt(arg('port', '5396'), 10);
const DBG = parseInt(arg('debug-port', '9337'), 10);
const SIZE = arg('size', '1180,820');
const OUT = path.join(ROOT, 'testkit', 'results');
const BASE = 'http://127.0.0.1:' + PORT;
const sleep = ms => new Promise(r => setTimeout(r, ms));

const CANDIDATES = [arg('browser', null),
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', 'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe'].filter(Boolean);
const BROWSER = CANDIDATES.find(p => { try { return fs.statSync(p).isFile(); } catch (e) { return false; } });
if (!BROWSER) { console.error('no Edge/Chrome found — pass --browser <path>'); process.exit(2); }

class CDP {
  constructor(url) {
    this.ws = new WebSocket(url);
    this.n = 0; this.pending = new Map(); this.handlers = [];
    this.ready = new Promise((res, rej) => { this.ws.onopen = res; this.ws.onerror = () => rej(new Error('websocket error')); });
    this.ws.onmessage = ev => {
      const m = JSON.parse(typeof ev.data === 'string' ? ev.data : ev.data.toString());
      if (m.id && this.pending.has(m.id)) { const p = this.pending.get(m.id); this.pending.delete(m.id); if (m.error) p.rej(new Error(m.error.message)); else p.res(m.result); }
      else if (m.method) for (const h of this.handlers) h(m);
    };
  }
  send(method, params) { const id = ++this.n; this.ws.send(JSON.stringify({ id, method, params: params || {} })); return new Promise((res, rej) => this.pending.set(id, { res, rej })); }
  on(h) { this.handlers.push(h); }
  close() { try { this.ws.close(); } catch (e) { /* */ } }
}

let pass = 0, fail = 0;
const checks = [];
function assert(cond, name, detail) {
  if (cond) { pass++; checks.push('  ok   ' + name); console.log(checks[checks.length - 1]); }
  else { fail++; checks.push('  FAIL ' + name + (detail !== undefined ? ' — ' + JSON.stringify(detail) : '')); console.log(checks[checks.length - 1]); }
}
function step(title) { const line = '-- ' + title; checks.push(line); console.log(line); }
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);

function startServer(dataDir) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [path.join(ROOT, 'server', 'server.js'), '--port', String(PORT), '--data', dataDir, '--quiet'], { stdio: ['ignore', 'ignore', 'pipe', 'ipc'] });
    child.stderr.on('data', d => process.stderr.write('[server] ' + d));
    child.on('message', m => { if (m && m.ready) resolve(child); });
    child.on('exit', code => reject(new Error('server exited ' + code)));
    setTimeout(() => reject(new Error('server did not start')), 8000);
  });
}
const stop = child => new Promise(r => {
  if (!child || child.exitCode != null || child.signalCode != null) return r();
  const t = setTimeout(() => { try { spawn('taskkill', ['/PID', String(child.pid), '/T', '/F'], { stdio: 'ignore' }); } catch (e) { /* */ } setTimeout(r, 500); }, 5000);
  child.once('exit', () => { clearTimeout(t); r(); });
  child.kill();
});

async function main() {
  const scratch = fs.mkdtempSync(path.join(os.tmpdir(), 'swipe-check-'));
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'swipe-check-edge-'));
  fs.mkdirSync(path.join(OUT, 'stand_shots'), { recursive: true });
  const report = { tool: 'tools/swipe_check.js', at: new Date().toISOString(), port: PORT, steps: [], ok: false };
  let server = null, proc = null; const pages = [];
  const cleanup = async () => {
    for (const p of pages) p.cdp.close();
    try { if (proc) proc.kill(); } catch (e) { /* */ }
    await stop(server);
    setTimeout(() => { try { fs.rmSync(profile, { recursive: true, force: true }); fs.rmSync(scratch, { recursive: true, force: true }); } catch (e) { /* */ } }, 1500);
  };
  const watchdog = setTimeout(async () => { console.log('!! watchdog: the check hung'); await cleanup(); process.exit(1); }, 240000);
  try {
    server = await startServer(scratch);
    proc = spawn(BROWSER, ['--headless=new', '--remote-debugging-port=' + DBG, '--user-data-dir=' + profile, '--window-size=' + SIZE,
      '--no-first-run', '--no-default-browser-check', '--disable-background-timer-throttling', '--disable-renderer-backgrounding',
      '--disable-backgrounding-occluded-windows', 'about:blank'], { stdio: 'ignore' });
    let ver = null;
    for (let i = 0; i < 60 && !ver; i++) { try { ver = await (await fetch('http://127.0.0.1:' + DBG + '/json/version')).json(); } catch (e) { await sleep(250); } }
    if (!ver) throw new Error('the headless browser did not open its debugging port');
    report.browser = ver.Browser;
    const [vw, vh] = SIZE.split(',').map(Number);
    async function open(name, url) {
      const target = await (await fetch('http://127.0.0.1:' + DBG + '/json/new?about:blank', { method: 'PUT' })).json();
      const cdp = new CDP(target.webSocketDebuggerUrl);
      await cdp.ready;
      const problems = [];
      cdp.on(m => {
        if (m.method === 'Runtime.exceptionThrown') problems.push('exception: ' + ((m.params.exceptionDetails.exception && m.params.exceptionDetails.exception.description) || m.params.exceptionDetails.text));
        if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') problems.push('console.error: ' + m.params.args.map(a => a.value || a.description).join(' '));
      });
      await cdp.send('Runtime.enable'); await cdp.send('Page.enable');
      await cdp.send('Emulation.setDeviceMetricsOverride', { width: vw, height: vh, deviceScaleFactor: 2, mobile: true });
      const evalJs = async expr => { const x = await cdp.send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true }); if (x.exceptionDetails) throw new Error(x.exceptionDetails.text + ' ' + ((x.exceptionDetails.exception || {}).description || '')); return x.result.value; };
      const shot = async file => { try { const s = await cdp.send('Page.captureScreenshot', { format: 'png' }); fs.writeFileSync(path.join(OUT, 'stand_shots', file), Buffer.from(s.data, 'base64')); } catch (e) { console.log('   (shot ' + file + ' failed: ' + e.message + ')'); } };
      await cdp.send('Page.navigate', { url });
      const p = { name, cdp, evalJs, problems, shot, url };
      pages.push(p);
      return p;
    }
    const stateOf = p => p.evalJs('window.__standState ? window.__standState() : null');
    const ready = async p => { let st = null; for (let i = 0; i < 80 && !(st && (st.ready || st.error)); i++) { await sleep(250); try { st = await stateOf(p); } catch (e) { st = null; } } return st; };
    const R = 4;
    const run = async (p, expr) => { const r = await p.evalJs(expr); report.steps.push({ expr, r }); return r; };

    step('the Flute at 0:00 — four pages a screen, the cursor on page 1');
    const p = await open('flute', BASE + '/notation/app/stand.html?part=1&t=0');
    const st0 = await ready(p);
    assert(st0 && st0.ready && !st0.error, 'the stand opened', st0 && { error: st0.error });
    const seams = await p.evalJs('window.__standSeams()');
    const n = seams.length;
    assert(same(st0.ring, [0, 1, 2, 3]) && st0.cur === 0 && st0.base === 0, 'the first screen: pages 1–4 in order, the cursor on page 1', st0.ring);
    assert(await run(p, 'window.__standCursorOn()'), 'the cursor is drawn on landing');

    step('a swipe = the next or previous SCREEN, in order, the cursor at its page 1 (118)');
    let r = await run(p, 'window.__standTurn(1)');
    assert(same(r.ring, [4, 5, 6, 7]) && r.cur === 4 && Math.abs(r.t - seams[4].t0) < 1e-6, 'left: pages 5–8, the cursor at the start of page 5', r);
    r = await run(p, 'window.__standTurn(1)');
    assert(same(r.ring, [8, 9, 10, 11]) && r.cur === 8, 'left again: pages 9–12', r);
    r = await run(p, 'window.__standTurn(-1)');
    assert(same(r.ring, [4, 5, 6, 7]) && r.cur === 4, 'right: pages 5–8 again', r);
    r = await run(p, 'window.__standTurn(-1)');
    assert(same(r.ring, [0, 1, 2, 3]) && r.cur === 0, 'right: pages 1–4', r);
    r = await run(p, 'window.__standTurn(-1)');
    assert(same(r.ring, [0, 1, 2, 3]) && r.cur === 0, 'right at the start: nothing before page 1', r);

    step('a tap moves only the cursor — the screen stays (118)');
    r = await run(p, 'window.__standTap(2, 0.5)');
    assert(same(r.ring, [0, 1, 2, 3]) && r.cur === 2 && r.base === 0, 'a tap on page 3: the cursor on page 3, the four pages as they were', r);
    assert(r.t >= seams[2].t0 && r.t < seams[2].t1, 'the cursor inside page 3', { t: r.t, page: [seams[2].t0, seams[2].t1] });
    assert(await run(p, 'window.__standCursorOn()'), 'the cursor is drawn after the tap');

    step('the pages flip AT PLAY — every played page at once, then one at a time (118)');
    await run(p, 'window.__standPlay()');
    let st = await stateOf(p);
    assert(same(st.ring, [4, 5, 2, 3]) && st.cur === 2 && st.playing, 'play from page 3: pages 1 and 2 become 5 and 6 at once; 3 and 4 stay', { ring: st.ring, cur: st.cur, playing: st.playing });
    await run(p, 'window.__standPause()');
    r = await run(p, 'window.__standTurn(1)');
    assert(same(r.ring, [6, 7, 8, 9]) && r.cur === 6, 'left from that screen: the four pages after the newest on screen (6) — pages 7–10', r);
    r = await run(p, 'window.__standTurn(-1)');
    assert(same(r.ring, [2, 3, 4, 5]) && r.cur === 2, 'right: the four before the oldest (7) — pages 3–6, in order', r);
    r = await run(p, 'window.__standTap(3, 0.3)');
    assert(same(r.ring, [2, 3, 4, 5]) && r.cur === 5, 'a tap on the fourth page (6): the cursor only', r);
    await run(p, 'window.__standPlay()'); st = await stateOf(p); await run(p, 'window.__standPause()');
    assert(same(st.ring, [6, 7, 8, 5]) && st.cur === 5, 'play from page 6: pages 3, 4, 5 become 7, 8, 9 at once; 6 stays under the cursor', { ring: st.ring, cur: st.cur });
    r = await run(p, 'window.__standTap(0, 0.2)');
    assert(r.cur === 6 && same(r.ring, [6, 7, 8, 5]), 'a tap on page 7 (now the top slot): the cursor only', r);
    await run(p, 'window.__standPlay()'); st = await stateOf(p); await run(p, 'window.__standPause()');
    assert(same(st.ring, [6, 7, 8, 9]) && st.cur === 6, 'play from page 7: the played page 6 becomes 10', { ring: st.ring, cur: st.cur });
    await p.shot('swipe_after_play.png');

    step('the end of the piece: nothing after the last page');
    for (let i = 0; i < 40; i++) { const q = await run(p, 'window.__standTurn(1)'); if (q.cur === r.cur) break; r = q; }
    const last = await stateOf(p);
    assert(last.ring.filter(x => x != null).includes(n - 1), 'the last screen shows the last page', { ring: last.ring, n });
    const again = await run(p, 'window.__standTurn(1)');
    assert(same(again.ring, last.ring) && again.cur === last.cur, 'a swipe past the end: nothing moves', again);
    assert(p.problems.length === 0, 'no page errors', p.problems.slice(0, 3));

    step('THE LANDING CURSOR (117): a link with a time keeps its cursor through the viewport\'s settling');
    const q = await open('landing', BASE + '/notation/app/stand.html?part=1&t=100');
    const sq = await ready(q);
    assert(sq && sq.ready && !sq.error, 'the stand opened at 1:40', sq && { error: sq.error });
    assert(await run(q, 'window.__standCursorOn()'), 'the cursor is drawn on landing');
    await q.cdp.send('Emulation.setDeviceMetricsOverride', { width: vw, height: vh - 60, deviceScaleFactor: 2, mobile: true });   // the Safari toolbar settles: the viewport shrinks after boot
    await sleep(600);
    const sq2 = await stateOf(q);
    assert(sq2.size && sq2.size.H !== sq.size.H, 'the viewport change re-laid the rows', { before: sq.size && sq.size.H, after: sq2.size && sq2.size.H });
    assert(await run(q, 'window.__standCursorOn()'), 'the cursor is still drawn after the re-lay', sq2.size);
    assert(q.problems.length === 0, 'no page errors on the landing', q.problems.slice(0, 3));

    report.ok = fail === 0;
  } catch (e) { fail++; console.log('!! ' + (e.stack || e)); report.error = String(e.message || e); }
  clearTimeout(watchdog);
  report.pass = pass; report.fail = fail; report.checks = checks;
  const out = path.join(OUT, 'swipe_check__' + report.at.replace(/[:.]/g, '-') + '.json');
  fs.writeFileSync(out, JSON.stringify(report, null, 2));
  console.log((fail ? 'FAIL' : 'PASS') + ' — swipe_check: ' + pass + ' pass, ' + fail + ' fail · ' + path.relative(ROOT, out));
  await cleanup();
  process.exit(fail ? 1 : 0);
}
main();
