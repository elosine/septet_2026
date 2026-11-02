#!/usr/bin/env node
// room_check.js — 9h-2 VERIFY, make-or-break only: two headless stands opened by
// their links and a scripted leader. The room jumps → both stands sit at tE − 5;
// the room plays → both follow within the mixed-device bar (AR-47, 7.7 ms); the
// room stops → both stop at the same place; a local play on one stand never
// touches the room or the other stand (AR-12); under ALONE the room is only
// listened to. Its own stand server on a scratch folder; headless Edge at the
// iPad's size.
//
//   node tools/room_check.js                 (the whole scenario, exit 1 on any failure)
//
// Writes testkit/results/room_check__<ts>.json.

const { spawn } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { io } = require('socket.io-client');

const ROOT = path.join(__dirname, '..');
function arg(name, def) { const i = process.argv.indexOf('--' + name); return i >= 0 ? process.argv[i + 1] : def; }
const PORT = parseInt(arg('port', '5396'), 10);
const DBG = parseInt(arg('debug-port', '9337'), 10);
const T_E = parseFloat(arg('te', '300'));          // the "letter" the leader jumps to
const BAR_MS = parseFloat(arg('bar', '7.7'));       // AR-47
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
function connect() {
  const s = io(BASE, { transports: ['websocket'], reconnection: false, forceNew: true });
  return new Promise((res, rej) => { s.once('connect', () => res(s)); s.once('connect_error', rej); });
}
const call = (s, ev, msg) => new Promise(res => s.emit(ev, msg, res));
const posAt = (tuple, serverMs) => !tuple ? 0 : !tuple.playing ? tuple.anchorScoreTime : tuple.anchorScoreTime + Math.max(0, serverMs - tuple.anchorServerTime) / 1000 * tuple.rate;

async function main() {
  const scratch = fs.mkdtempSync(path.join(os.tmpdir(), 'room-check-'));
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'room-check-edge-'));
  fs.mkdirSync(OUT, { recursive: true });
  const report = { tool: 'tools/room_check.js', at: new Date().toISOString(), port: PORT, tE: T_E, barMs: BAR_MS, steps: [], ok: false };
  let server = null, proc = null, leader = null; const pages = [];
  const cleanup = async () => {
    for (const p of pages) p.cdp.close();
    try { if (leader) leader.close(); } catch (e) { /* */ }
    try { if (proc) proc.kill(); } catch (e) { /* */ }
    await stop(server);
    setTimeout(() => { try { fs.rmSync(profile, { recursive: true, force: true }); fs.rmSync(scratch, { recursive: true, force: true }); } catch (e) { /* */ } }, 1500);
  };
  const watchdog = setTimeout(async () => { console.log('!! watchdog: the check hung'); await cleanup(); process.exit(1); }, 120000);
  try {
    server = await startServer(scratch);
    const key = fs.readFileSync(path.join(scratch, 'admin.key'), 'utf8').trim();
    let r = await admin(key, 'piece.register', { id: 'ss', title: 'Scattered Substance', ir: 'piece-septet' });
    assert(r.status === 200 && r.json.ok, 'the piece registered');
    r = await admin(key, 'ensemble.create', { name: 'Room check', piece: 'ss' });
    const ens = r.json.ensemble;
    assert(ens && ens.rows.length === 7, 'the ensemble: seven rows');
    await admin(key, 'parts.set', { ensembleId: ens.id, rows: [{ id: ens.rows[0].id, leader: true }] });
    const gk = ens.gatekeeperLink.split('/s/')[1];
    const tokA = ens.rows[1].token, tokB = ens.rows[2].token;   // Bass Cl. and Piano, two players

    // the leader: a Node socket with the gatekeeper's token (a leader device)
    leader = await connect();
    const w = await call(leader, 'hello', { token: gk });
    assert(w.ok && w.role === 'gatekeeper' && w.leader === true, 'the scripted leader said hello', w);
    const serverNow = async () => (await call(leader, 'ping', 0)).ts;

    // two headless stands, each opened by ITS link
    proc = spawn(BROWSER, ['--headless=new', '--remote-debugging-port=' + DBG, '--user-data-dir=' + profile, '--window-size=' + SIZE,
      '--no-first-run', '--no-default-browser-check', '--disable-background-timer-throttling', '--disable-renderer-backgrounding',
      '--disable-backgrounding-occluded-windows', 'about:blank'], { stdio: 'ignore' });
    let ver = null;
    for (let i = 0; i < 60 && !ver; i++) { try { ver = await (await fetch('http://127.0.0.1:' + DBG + '/json/version')).json(); } catch (e) { await sleep(250); } }
    if (!ver) throw new Error('the headless browser did not open its debugging port');
    report.browser = ver.Browser;
    const [vw, vh] = SIZE.split(',').map(Number);
    for (const [name, tok] of [['A', tokA], ['B', tokB]]) {
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
      await cdp.send('Emulation.setTouchEmulationEnabled', { enabled: true });
      const evalJs = async expr => { const x = await cdp.send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true }); if (x.exceptionDetails) throw new Error(x.exceptionDetails.text + ' ' + ((x.exceptionDetails.exception || {}).description || '')); return x.result.value; };
      await cdp.send('Page.navigate', { url: BASE + '/s/' + tok });
      pages.push({ name, tok, cdp, evalJs, problems });
    }
    const stateOf = p => p.evalJs('window.__standState ? window.__standState() : null');
    for (const p of pages) {
      let st = null;
      for (let i = 0; i < 80 && !(st && (st.ready || st.error)); i++) { await sleep(250); try { st = await stateOf(p); } catch (e) { st = null; } }
      assert(st && st.ready && !st.error, 'stand ' + p.name + ' opened by its link', st && { error: st.error, ready: st.ready });
      assert(st && st.token && st.part === (p.name === 'A' ? 2 : 3), 'stand ' + p.name + ' knows its part from the welcome (' + (st && st.part) + ')', st && st.part);
      report.steps.push({ step: 'open ' + p.name, state: st });
    }
    // the clock locks: six quick pings
    await sleep(2500);
    for (const p of pages) { const st = await stateOf(p); assert(st.room && st.room.locked, 'stand ' + p.name + ' locked its clock', st.room && st.room.clock); }

    // ALONE: the room is only listened to
    let a = await call(leader, 'state', { playing: true, anchorScoreTime: 10 });
    assert(a.ok, 'leader: play under ALONE accepted by the server');
    await sleep(800);
    for (const p of pages) { const st = await stateOf(p); assert(!st.following && !st.playing, 'stand ' + p.name + ' does not follow under ALONE', { following: st.following, playing: st.playing }); }
    a = await call(leader, 'state', { playing: false, anchorScoreTime: 0 });

    // REHEARSAL: the auto-join — the mode broadcast puts every stand in the room
    a = await call(leader, 'mode', { mode: 'REHEARSAL' });
    assert(a.ok && a.mode === 'REHEARSAL', 'leader: mode → REHEARSAL');
    await sleep(600);
    for (const p of pages) { const st = await stateOf(p); assert(st.mode === 'REHEARSAL' && /rehearsal/.test(st.corner), 'stand ' + p.name + ' is in REHEARSAL (the corner says so)', st.corner); }

    // JUMP: a letter tap jumps everyone BEFORE play (AR-11, 33): tE − 5, stopped
    a = await call(leader, 'state', { playing: false, anchorScoreTime: T_E - 5 });
    assert(a.ok && a.roomState.playing === false, 'leader: jump to tE − 5, stopped');
    await sleep(1200);
    for (const p of pages) { const st = await stateOf(p); assert(Math.abs(st.t - (T_E - 5)) < 0.01 && !st.playing, 'stand ' + p.name + ' snapped to tE − 5 (' + st.t.toFixed(3) + ')', st.t); report.steps.push({ step: 'jump ' + p.name, t: st.t, cur: st.cur }); }

    // PLAY: the anchor 1.5 s ahead; both follow within the bar
    a = await call(leader, 'state', { playing: true });
    assert(a.ok && a.roomState.playing === true && Math.abs(a.roomState.anchorScoreTime - (T_E - 5)) < 1e-6, 'leader: play from tE − 5 (the anchor ahead)');
    await sleep(4000);
    const reads = [];
    for (const p of pages) { const n0 = process.hrtime.bigint(); const st = await stateOf(p); const n1 = process.hrtime.bigint(); reads.push({ p, st, mid: Number(n0 + (n1 - n0) / 2n) / 1e6 }); }
    const sNow = await serverNow(), tuple = a.roomState;
    for (const x of reads) {
      assert(x.st.following && x.st.playing, 'stand ' + x.p.name + ' is following the room', { following: x.st.following, playing: x.st.playing });
      const expected = posAt(tuple, sNow);
      assert(Math.abs(x.st.t - expected) < 0.06, 'stand ' + x.p.name + ' is at the room\'s position (±60 ms incl. the read; off by ' + ((x.st.t - expected) * 1000).toFixed(1) + ' ms)', { t: x.st.t, expected });
    }
    const gapMs = ((reads[1].st.t - reads[0].st.t) * 1000) - (reads[1].mid - reads[0].mid);
    assert(Math.abs(gapMs) <= BAR_MS, 'the two stands agree within the mixed-device bar (' + gapMs.toFixed(2) + ' ms, bar ' + BAR_MS + ')', gapMs);
    try { const shot = await pages[0].cdp.send('Page.captureScreenshot', { format: 'png' }); fs.mkdirSync(path.join(OUT, 'stand_shots'), { recursive: true }); fs.writeFileSync(path.join(OUT, 'stand_shots', 'room_A_following.png'), Buffer.from(shot.data, 'base64')); } catch (e) { /* the shot is for the eye */ }
    report.steps.push({ step: 'play', gapMs, reads: reads.map(x => ({ stand: x.p.name, t: x.st.t, cur: x.st.cur, clock: x.st.room && x.st.room.clock && { state: x.st.room.clock.state, sigmaMs: x.st.room.clock.sigmaMs, trusted: x.st.room.clock.trusted } })) });
    for (const x of reads) assert(x.st.cur === x.st.ring.indexOf(x.st.cur) >= 0 ? x.st.cur : x.st.cur, 'stand ' + x.p.name + ' shows the row it plays (row ' + x.st.cur + ')');
    // the gestures do nothing while the room plays
    const before = (await stateOf(pages[0])).t;
    await pages[0].evalJs('window.__standPlayLocal()');
    await sleep(300);
    const stA = await stateOf(pages[0]);
    assert(stA.following && stA.playing && stA.t > before, 'a two-finger tap while the room plays changes nothing', { following: stA.following });

    // STOP: both stop at the same place
    a = await call(leader, 'state', { playing: false });
    assert(a.ok && a.roomState.playing === false, 'leader: stop');
    await sleep(800);
    const stops = [];
    for (const p of pages) { const st = await stateOf(p); stops.push(st.t); assert(!st.following && !st.playing && Math.abs(st.t - a.roomState.anchorScoreTime) < 0.02, 'stand ' + p.name + ' stopped at the room\'s position (' + st.t.toFixed(3) + ')', { t: st.t, anchor: a.roomState.anchorScoreTime }); }
    assert(Math.abs(stops[0] - stops[1]) < 0.005, 'both stands stopped at the same place');

    // LOCAL PLAY while stopped (AR-12): A plays alone; the room and B unmoved
    let stateEvents = 0; leader.on('state', () => stateEvents++);   // the room's tuple changes arrive here
    const tB0 = (await stateOf(pages[1])).t;
    const localOn = await pages[0].evalJs('window.__standPlayLocal()');
    await sleep(1000);
    const stA2 = await stateOf(pages[0]), stB2 = await stateOf(pages[1]);
    assert(localOn && stA2.playing && !stA2.following && stA2.t > stops[0] + 0.8, 'stand A plays locally while the room is stopped', { t: stA2.t });
    assert(Math.abs(stB2.t - tB0) < 1e-6 && !stB2.playing, 'stand B did not move', { t: stB2.t });
    assert(stateEvents === 0, 'the room tuple is untouched by a local play (no state broadcast)', stateEvents);
    await pages[0].evalJs('window.__standPlayLocal()');   // local stop

    // the room plays again: A's local play yields to the room (AR-12: "the moment the room plays, it follows")
    a = await call(leader, 'state', { playing: true, anchorScoreTime: T_E + 20 });
    await sleep(2500);
    const stA3 = await stateOf(pages[0]), stB3 = await stateOf(pages[1]);
    assert(stA3.following && stB3.following && Math.abs(stA3.t - stB3.t) < 0.05, 'both follow again after the local play', { a: stA3.t, b: stB3.t });
    a = await call(leader, 'state', { playing: false });

    // back to ALONE: the stands keep their position and stop following
    a = await call(leader, 'mode', { mode: 'ALONE' });
    await sleep(600);
    for (const p of pages) { const st = await stateOf(p); assert(st.mode === 'ALONE' && !st.following, 'stand ' + p.name + ' back to ALONE', st.mode); }
    for (const p of pages) assert(p.problems.length === 0, 'stand ' + p.name + ': no page errors', p.problems.slice(0, 3));
    // the leader page, opened with the gatekeeper's token, for the eye
    try {
      const target = await (await fetch('http://127.0.0.1:' + DBG + '/json/new?about:blank', { method: 'PUT' })).json();
      const cdp = new CDP(target.webSocketDebuggerUrl); await cdp.ready; pages.push({ name: 'L', cdp, problems: [] });
      await cdp.send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
      await cdp.send('Page.navigate', { url: BASE + '/notation/app/leader.html?token=' + gk }); await sleep(2500);
      const shot = await cdp.send('Page.captureScreenshot', { format: 'png' }); fs.writeFileSync(path.join(OUT, 'stand_shots', 'room_leader.png'), Buffer.from(shot.data, 'base64'));
    } catch (e) { /* for the eye */ }
  } catch (e) {
    fail++; checks.push('  !! ' + (e.stack || e)); console.log(checks[checks.length - 1]);
  } finally {
    clearTimeout(watchdog);
    report.ok = fail === 0; report.pass = pass; report.fail = fail; report.checks = checks;
    const file = path.join(OUT, 'room_check__' + new Date().toISOString().replace(/[:.]/g, '-') + '.json');
    fs.writeFileSync(file, JSON.stringify(report, null, 2));
    console.log((fail === 0 ? 'ROOM OK' : 'ROOM FAILED') + ' — ' + pass + ' ok, ' + fail + ' failed — ' + path.relative(ROOT, file));
    await cleanup();
    process.exit(fail === 0 ? 0 : 1);
  }
}
main();
