#!/usr/bin/env node
// seam_check.js — THE STAND'S SEAMS (the design sitting, day 46; for_seven_tubas RUNNING_LOG
// 111–112): every part's stand opened headless at the iPad's size on a scratch stand server,
// and the display on a gatekeeper's link; the plan read back through the page's own hooks
// (__standSeams · __standInk · __standSeamAudit · __standRows) and checked against the rules:
//   · no seam inside a head unit's ink · a cut beam keeps a notehead's width of beam each side,
//     or is a recorded catch · a cut curve gives the next row its half second (day 49, the
//     half-second rule; the GC arc exempt) · a row is never shortened past the slack · a full row's staff
//     ends edgeGapPx short of the frame · no end bar but the piece's own · no page errors
// Shots for the eye: testkit/results/stand_shots/seam_<part>_<row>_<reason>.png — the right
// end of the seam's row and the left start of the next, at 2×.
//
//   node tools/seam_check.js                 (exit 1 on any failure)

const { spawn } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const ROOT = path.join(__dirname, '..');
function arg(name, def) { const i = process.argv.indexOf('--' + name); return i >= 0 ? process.argv[i + 1] : def; }
const PORT = parseInt(arg('port', '5398'), 10);
const DBG = parseInt(arg('debug-port', '9339'), 10);
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
async function http(p, opts) { const r = await fetch(BASE + p, opts); const text = await r.text(); let json = null; try { json = JSON.parse(text); } catch (e) { /* */ } return { status: r.status, json, text }; }
const admin = (key, op, body) => http('/admin/' + op, { method: body ? 'POST' : 'GET', headers: { 'x-admin-key': key, 'content-type': 'application/json' }, body: body ? JSON.stringify(body) : undefined });

async function main() {
  const scratch = fs.mkdtempSync(path.join(os.tmpdir(), 'seam-check-'));
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'seam-check-edge-'));
  fs.mkdirSync(path.join(OUT, 'stand_shots'), { recursive: true });
  const report = { tool: 'tools/seam_check.js', at: new Date().toISOString(), port: PORT, parts: [], ok: false };
  let server = null, proc = null; const pages = [];
  const cleanup = async () => {
    for (const p of pages) p.cdp.close();
    try { if (proc) proc.kill(); } catch (e) { /* */ }
    await stop(server);
    setTimeout(() => { try { fs.rmSync(profile, { recursive: true, force: true }); fs.rmSync(scratch, { recursive: true, force: true }); } catch (e) { /* */ } }, 1500);
  };
  const watchdog = setTimeout(async () => { console.log('!! watchdog: the check hung'); await cleanup(); process.exit(1); }, 300000);
  try {
    server = await startServer(scratch);
    const key = fs.readFileSync(path.join(scratch, 'admin.key'), 'utf8').trim();
    let r = await admin(key, 'piece.register', { id: 'ss', title: 'Scattered Substance', ir: 'piece-septet' });
    assert(r.status === 200 && r.json.ok, 'the piece registered');
    r = await admin(key, 'ensemble.create', { name: 'Seams', piece: 'ss' });
    const ens = r.json.ensemble;
    const gk = ens.gatekeeperLink.split('/s/')[1];

    proc = spawn(BROWSER, ['--headless=new', '--remote-debugging-port=' + DBG, '--user-data-dir=' + profile, '--window-size=' + SIZE,
      '--no-first-run', '--no-default-browser-check', '--disable-background-timer-throttling', '--disable-renderer-backgrounding',
      '--disable-backgrounding-occluded-windows', 'about:blank'], { stdio: 'ignore' });
    let ver = null;
    for (let i = 0; i < 60 && !ver; i++) { try { ver = await (await fetch('http://127.0.0.1:' + DBG + '/json/version')).json(); } catch (e) { await sleep(250); } }
    if (!ver) throw new Error('the headless browser did not open its debugging port');
    report.browser = ver.Browser;
    const [vw, vh] = SIZE.split(',').map(Number);
    async function open(name, url, size) {
      const target = await (await fetch('http://127.0.0.1:' + DBG + '/json/new?about:blank', { method: 'PUT' })).json();
      const cdp = new CDP(target.webSocketDebuggerUrl);
      await cdp.ready;
      const problems = [];
      cdp.on(m => {
        if (m.method === 'Runtime.exceptionThrown') problems.push('exception: ' + ((m.params.exceptionDetails.exception && m.params.exceptionDetails.exception.description) || m.params.exceptionDetails.text));
        if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') problems.push('console.error: ' + m.params.args.map(a => a.value || a.description).join(' '));
      });
      await cdp.send('Runtime.enable'); await cdp.send('Page.enable');
      await cdp.send('Emulation.setDeviceMetricsOverride', { width: size[0], height: size[1], deviceScaleFactor: 2, mobile: size[0] < 1300 });
      const evalJs = async expr => { const x = await cdp.send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true }); if (x.exceptionDetails) throw new Error(x.exceptionDetails.text + ' ' + ((x.exceptionDetails.exception || {}).description || '')); return x.result.value; };
      const shot = async (file, clip) => { try { const s = await cdp.send('Page.captureScreenshot', Object.assign({ format: 'png' }, clip ? { clip: Object.assign({ scale: 2 }, clip) } : {})); fs.writeFileSync(path.join(OUT, 'stand_shots', file), Buffer.from(s.data, 'base64')); } catch (e) { console.log('   (shot ' + file + ' failed: ' + e.message + ')'); } };
      await cdp.send('Page.navigate', { url });
      const p = { name, cdp, evalJs, problems, shot, url };
      pages.push(p);
      return p;
    }
    const stateOf = p => p.evalJs('window.__standState ? window.__standState() : null');
    const ready = async p => { let st = null; for (let i = 0; i < 80 && !(st && (st.ready || st.error)); i++) { await sleep(250); try { st = await stateOf(p); } catch (e) { st = null; } } return st; };

    const targets = [1, 2, 3, 4, 5, 6, 7].map(n => ({ name: 'part' + n, url: BASE + '/notation/app/stand.html?part=' + n, parts: 1, rowsMax: n === 3 ? 3 : 4 }))
      .concat([{ name: 'display', url: BASE + '/s/' + gk + '?view=display', parts: 7, size: [1920, 1080], rowsMax: 1 },
        // day 49, for the eye: the Bass Cl. at 8:32 with two rehearsal letters on the link (one at a row's start, one mid-row)
        { name: 'letters', url: BASE + '/notation/app/stand.html?part=2&t=512&letters=A=8:48,B=9:00', parts: 1, eyeAt: 512 }]);
    for (const tg of targets) {
      step(tg.name);
      const p = await open(tg.name, tg.url, tg.size || [vw, vh]);
      const st = await ready(p);
      assert(st && st.ready && !st.error, tg.name + ' opened', st && { error: st.error, ready: st.ready });
      if (!(st && st.ready)) continue;
      assert(st.parts.length === tg.parts, tg.name + ' draws ' + tg.parts + ' part(s)', st.parts);
      // day 49 (for_seven_tubas RUNNING_LOG 120): the rows a screen per part — the Piano (two staves) 3, every other part 4,
      // the display 1 — from page_rules.stand, with no rows= on the link
      if (tg.rowsMax) assert(st.size.rowsMax === tg.rowsMax, tg.name + ' shows ' + tg.rowsMax + ' rows a screen', st.size.rowsMax);
      const seams = await p.evalJs('window.__standSeams()');
      const ink = await p.evalJs('window.__standInk()');
      const audit = await p.evalJs('window.__standSeamAudit()');
      const rows = await p.evalJs('window.__standRows()');
      const W = st.size.W, s = st.size.s, edge = st.edgePx;
      const rec = { name: tg.name, rows: seams.length, ink, audit, size: st.size, problems: p.problems.slice() };
      report.parts.push(rec);
      console.log('   rows ' + seams.length + ' · ink ' + JSON.stringify(ink) + ' · ' + JSON.stringify(audit.byReason) + ' · catches ' + audit.catches +
        ' · slack-bound ' + (audit.slackBound || 0) + (audit.shortCurveSlack && audit.shortCurveSlack.length ? ' (curves short of the half second there: ' + audit.shortCurveSlack.length + ')' : ''));
      assert(audit.insideUnit.length === 0, tg.name + ': no seam inside a head unit', audit.insideUnit.slice(0, 3));
      assert(audit.shortStub.length === 0, tg.name + ': every cut beam keeps a notehead of beam each side (or is a catch)', audit.shortStub.slice(0, 3));
      assert((audit.shortCurve || []).length === 0, tg.name + ': every cut curve gives the next row its half second (' + audit.minCurveS + ' s), or the seam is slack-bound (recorded)', (audit.shortCurve || []).slice(0, 3));
      const over = seams.slice(0, -1).filter(pg => pg.t1 - pg.t0 > s + 1e-6 || pg.short > 2 + 1e-6 || pg.short < -1e-6);
      assert(over.length === 0, tg.name + ': every row within its seconds and its slack', over.slice(0, 3));
      const full = rows.filter(rw => rw && Math.abs((rw.t1 - rw.t0) - s) < 1e-6);
      assert(full.length > 0 && full.every(rw => Math.abs(rw.widthPx - (W - edge)) < 0.51), tg.name + ': a full row\'s staff ends ' + edge + ' px short of the frame', full.map(rw => rw.widthPx));
      const shortRows = rows.filter(rw => rw && (rw.t1 - rw.t0) < s - 1e-6 && rw.idx < seams.length - 1);
      assert(shortRows.every(rw => rw.widthPx < W - edge - 0.5), tg.name + ': a shortened row\'s staff ends where its music does', shortRows.map(rw => [rw.reason, rw.widthPx]));
      assert(rows.every(rw => !rw || !rw.endBar || rw.idx === seams.length - 1), tg.name + ': no end bar but the piece\'s own', rows.filter(rw => rw && rw.endBar).map(rw => rw.idx));
      assert(p.problems.length === 0, tg.name + ': no page errors', p.problems.slice(0, 3));
      // the shots: the first seam of each reason — the right end of its row, the left start of the next
      const ROWS = st.size.rowsMax, rowH = st.size.H / ROWS, sheetTop = st.sheetTop || 0;
      const seen = {};
      for (let i = 0; i < seams.length - 1; i++) {
        const pg = seams[i];
        if (pg.reason === 'target' ? seen.target : seen[pg.reason]) continue;
        seen[pg.reason] = true;
        // land far away first (118: a jump within the screen moves only the cursor), so this landing lays a fresh screen with row i on top
        await p.evalJs('window.__standGoto(' + (i > ROWS ? seams[0].t0 : seams[seams.length - 1].t0) + ')'); await sleep(150);
        await p.evalJs('window.__standGoto(' + pg.t0 + ')'); await sleep(700);
        // day 49 (RUNNING_LOG 121): a landing lays a fresh screen, row i on top — read each row's slot from the page, not from i mod ROWS
        const now = await p.evalJs('window.__standRows()');
        const slotOfRow = j => { const rw = now.find(r => r && r.idx === j); return rw ? rw.slot : null; };
        const k = slotOfRow(i);
        if (k == null) { assert(false, tg.name + ': row ' + i + ' on screen after the landing', now.map(r => r && r.idx)); continue; }
        const cw = Math.min(260, W);
        await p.shot('seam_' + tg.name + '_' + i + '_' + pg.reason + '_end.png', { x: W - cw, y: sheetTop + k * rowH, width: cw, height: rowH });
        let k2 = slotOfRow(i + 1);
        if (k2 == null) {   // one row a screen (the display): the next row needs its own landing
          await p.evalJs('window.__standGoto(' + seams[i + 1].t0 + ')'); await sleep(400);
          const now2 = await p.evalJs('window.__standRows()'); const rw = now2.find(r => r && r.idx === i + 1); k2 = rw ? rw.slot : null;
        }
        if (k2 == null) { assert(false, tg.name + ': row ' + (i + 1) + ' on screen for its shot', null); continue; }
        await p.shot('seam_' + tg.name + '_' + i + '_' + pg.reason + '_next.png', { x: 0, y: sheetTop + k2 * rowH, width: cw, height: rowH });
        rec['shot_' + pg.reason] = { row: i, t0: pg.t0, t1: pg.t1, short: pg.short };
      }
      if (tg.name === 'part1' || tg.name === 'display') { await p.evalJs('window.__standGoto(0)'); await sleep(700); await p.shot('seam_' + tg.name + '_page1.png'); }
      if (tg.eyeAt != null) { await p.evalJs('window.__standGoto(' + tg.eyeAt + ')'); await sleep(700); await p.shot('eye_' + tg.name + '.png'); }
    }
  } catch (e) {
    fail++; checks.push('  FAIL ' + e.message); console.log('!! ' + e.message);
  } finally {
    clearTimeout(watchdog);
    await cleanup();
  }
  report.pass = pass; report.fail = fail; report.checks = checks; report.ok = fail === 0;
  const file = path.join(OUT, 'seam_check__' + new Date().toISOString().replace(/[:.]/g, '-') + '.json');
  fs.writeFileSync(file, JSON.stringify(report, null, 1));
  console.log((fail ? 'FAIL' : 'PASS') + ' — seam_check: ' + pass + ' pass, ' + fail + ' fail · ' + path.relative(ROOT, file));
  process.exit(fail ? 1 : 0);
}
main();
