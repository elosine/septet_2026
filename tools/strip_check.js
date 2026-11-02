#!/usr/bin/env node
// strip_check.js — 9i VERIFY: THE TUESDAY, all thirteen (D94; DESIGN §13), as a
// headless scenario driven from the LEADER'S STRIP. Three headless stands opened
// by their links (the Flute, ticked leader, holds the strip; the Bass Cl. and the
// Piano are players), the REMOTE on the gatekeeper's link, and the DISPLAY on the
// gatekeeper's link with ?view=display. Every step is a row of DESIGN §6 or a
// message of §3; the pianist's "show me 4:10" is local play while stopped; the
// break is ALONE; "next day" is ALONE with the positions kept. Its own stand
// server on a scratch folder; headless Edge at the iPad's size.
//
//   node tools/strip_check.js                 (the whole Tuesday, exit 1 on any failure)
//
// Writes testkit/results/strip_check__<ts>.json and two shots for the eye:
// testkit/results/stand_shots/strip_leader.png · strip_remote.png · strip_display.png

const { spawn } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { io } = require('socket.io-client');

const ROOT = path.join(__dirname, '..');
function arg(name, def) { const i = process.argv.indexOf('--' + name); return i >= 0 ? process.argv[i + 1] : def; }
const PORT = parseInt(arg('port', '5397'), 10);
const DBG = parseInt(arg('debug-port', '9338'), 10);
const BAR_MS = parseFloat(arg('bar', '7.7'));       // AR-47
const SIZE = arg('size', '1180,820');
const OUT = path.join(ROOT, 'testkit', 'results');
const BASE = 'http://127.0.0.1:' + PORT;
const sleep = ms => new Promise(r => setTimeout(r, ms));
const LETTERS = [{ t: 120, label: 'A' }, { t: 240, label: 'B' }, { t: 300, label: 'E' }, { t: 400, label: 'F' }];
const LEAD = 5;

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
function step(n, title) { const line = '-- ' + n + '. ' + title; checks.push(line); console.log(line); }

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

async function main() {
  const scratch = fs.mkdtempSync(path.join(os.tmpdir(), 'strip-check-'));
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'strip-check-edge-'));
  fs.mkdirSync(path.join(OUT, 'stand_shots'), { recursive: true });
  const report = { tool: 'tools/strip_check.js', at: new Date().toISOString(), port: PORT, barMs: BAR_MS, steps: [], ok: false };
  let server = null, proc = null, watcher = null; const pages = [];
  const cleanup = async () => {
    for (const p of pages) p.cdp.close();
    try { if (watcher) watcher.close(); } catch (e) { /* */ }
    try { if (proc) proc.kill(); } catch (e) { /* */ }
    await stop(server);
    setTimeout(() => { try { fs.rmSync(profile, { recursive: true, force: true }); fs.rmSync(scratch, { recursive: true, force: true }); } catch (e) { /* */ } }, 1500);
  };
  const watchdog = setTimeout(async () => { console.log('!! watchdog: the check hung'); await cleanup(); process.exit(1); }, 240000);
  try {
    server = await startServer(scratch);
    const key = fs.readFileSync(path.join(scratch, 'admin.key'), 'utf8').trim();
    let r = await admin(key, 'piece.register', { id: 'ss', title: 'Scattered Substance', ir: 'piece-septet' });
    assert(r.status === 200 && r.json.ok, 'the piece registered');
    r = await admin(key, 'piece.letters', { id: 'ss', letters: LETTERS });
    assert(r.status === 200 && r.json.ok && r.json.piece.letters.length === 4, 'the rehearsal letters set (A B E F)', r.json);
    r = await admin(key, 'ensemble.create', { name: 'Tuesday', piece: 'ss' });
    const ens = r.json.ensemble;
    assert(ens && ens.rows.length === 7, 'the ensemble: seven rows');
    await admin(key, 'parts.set', { ensembleId: ens.id, rows: [{ id: ens.rows[0].id, leader: true }] });   // the Flute leads
    const gk = ens.gatekeeperLink.split('/s/')[1];
    const tokL = ens.rows[0].token, tokA = ens.rows[1].token, tokB = ens.rows[2].token;   // Flute (leader) · Bass Cl. · Piano

    // a watcher on the gatekeeper's token: counts the room's state broadcasts
    watcher = await connect();
    const w = await call(watcher, 'hello', { token: gk });
    assert(w.ok && w.role === 'gatekeeper', 'the watcher said hello', w);
    let stateEvents = 0; watcher.on('state', () => stateEvents++);
    const serverNow = async () => (await call(watcher, 'ping', 0)).ts;
    const posAt = (tuple, serverMs) => !tuple ? 0 : !tuple.playing ? tuple.anchorScoreTime : tuple.anchorScoreTime + Math.max(0, serverMs - tuple.anchorServerTime) / 1000 * tuple.rate;

    // the headless browser: three stands by their links, the remote, the display
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
      await cdp.send('Emulation.setTouchEmulationEnabled', { enabled: size[0] < 1300 });
      const evalJs = async expr => { const x = await cdp.send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true }); if (x.exceptionDetails) throw new Error(x.exceptionDetails.text + ' ' + ((x.exceptionDetails.exception || {}).description || '')); return x.result.value; };
      const shot = async file => { try { const s = await cdp.send('Page.captureScreenshot', { format: 'png' }); fs.writeFileSync(path.join(OUT, 'stand_shots', file), Buffer.from(s.data, 'base64')); } catch (e) { /* for the eye */ } };
      await cdp.send('Page.navigate', { url });
      const p = { name, cdp, evalJs, problems, shot };
      pages.push(p);
      return p;
    }
    const L = await open('L', BASE + '/s/' + tokL, [vw, vh]);
    const A = await open('A', BASE + '/s/' + tokA, [vw, vh]);
    const B = await open('B', BASE + '/s/' + tokB, [vw, vh]);
    const R = await open('R', BASE + '/s/' + gk, [390, 844]);
    const D = await open('D', BASE + '/s/' + gk + '?view=display', [1920, 1080]);
    const stands = [L, A, B];
    const stateOf = p => p.evalJs('window.__standState ? window.__standState() : null');
    const remoteOf = () => R.evalJs('window.__remoteState ? window.__remoteState() : null');
    const strip = (name, a) => L.evalJs('window.__stripAct(' + JSON.stringify(name) + (a === undefined ? '' : ', ' + JSON.stringify(a)) + ')');
    const remote = (name, a) => R.evalJs('window.__remoteAct(' + JSON.stringify(name) + (a === undefined ? '' : ', ' + JSON.stringify(a)) + ')');
    const settle = async () => { await sleep(900); };
    const readAll = async () => { const out = {}; for (const p of [...stands, D]) out[p.name] = await stateOf(p); return out; };
    // two stands' agreement, the reads' own spacing taken out (as room_check does)
    async function agreement(ps) {
      const reads = [];
      for (const p of ps) { const n0 = process.hrtime.bigint(); const st = await stateOf(p); const n1 = process.hrtime.bigint(); reads.push({ p, st, mid: Number(n0 + (n1 - n0) / 2n) / 1e6 }); }
      let worst = 0;
      for (let i = 1; i < reads.length; i++) { const gap = ((reads[i].st.t - reads[0].st.t) * 1000) - (reads[i].mid - reads[0].mid); worst = Math.max(worst, Math.abs(gap)); }
      return { worst, reads };
    }

    // ---- 1. THE ARRIVAL: everyone opens their link; the leader's stand has the strip
    step(1, 'the players open their links — ALONE; the leader holds the strip');
    for (const p of [...stands, D]) {
      let st = null;
      for (let i = 0; i < 80 && !(st && (st.ready || st.error)); i++) { await sleep(250); try { st = await stateOf(p); } catch (e) { st = null; } }
      assert(st && st.ready && !st.error, 'stand ' + p.name + ' opened by its link', st && { error: st.error, ready: st.ready });
      report.steps.push({ step: 'open ' + p.name, state: st && { part: st.part, mode: st.mode, strip: st.strip, display: st.display, parts: st.parts, size: st.size } });
    }
    let S = await readAll();
    assert(S.L.part === 1 && S.A.part === 2 && S.B.part === 3, 'the parts from the welcomes (Flute, Bass Cl., Piano)', [S.L.part, S.A.part, S.B.part]);
    assert(S.L.mode === 'ALONE' && S.A.mode === 'ALONE', 'everyone arrives ALONE');
    assert(S.L.strip && S.L.leader && S.L.stripText && S.L.stripText.sheetTop >= 44, 'the leader has the strip above the part (the sheet starts below it)', S.L.stripText);
    assert(!S.A.strip && !S.B.strip, 'the players have no strip');
    assert(S.D.display && S.D.parts.length === 7 && S.D.size.rows === 1, 'the display shows the full score (7 parts, one system a screen)', { parts: S.D.parts, rows: S.D.size && S.D.size.rows });
    let RS = null;
    for (let i = 0; i < 40 && !(RS && RS.ready); i++) { await sleep(250); try { RS = await remoteOf(); } catch (e) { RS = null; } }
    assert(RS && RS.ready && RS.role === 'gatekeeper' && RS.leader, 'the remote opened on the gatekeeper\'s link', RS);
    await sleep(2000);
    for (const p of stands) { const st = await stateOf(p); assert(st.room && st.room.locked, 'stand ' + p.name + ' locked its clock'); }
    // the strip under ALONE plays THIS stand only (DESIGN §6)
    await strip('play'); await sleep(900);
    S = await readAll();
    assert(S.L.playing && !S.L.following && !S.A.playing && stateEvents === 0, 'ALONE: the strip\'s PLAY is local — the leader\'s stand plays, the room is untouched', { L: S.L.playing, A: S.A.playing, stateEvents });
    await strip('play'); await sleep(300);

    // ---- 2. "LET'S TRY A PLAYTHROUGH": REHEARSAL, from the top
    step(2, '"let\'s try a playthrough" — REHEARSAL · TOP · PLAY');
    await strip('mode', 'REHEARSAL'); await settle();
    S = await readAll();
    assert(S.L.mode === 'REHEARSAL' && S.A.mode === 'REHEARSAL' && S.B.mode === 'REHEARSAL' && S.D.mode === 'REHEARSAL', 'the switch puts every stand in the room');
    await strip('top'); await sleep(1200);
    S = await readAll();
    assert(Math.abs(S.A.t + LEAD) < 0.01 && Math.abs(S.B.t + LEAD) < 0.01 && Math.abs(S.L.t + LEAD) < 0.01, 'TOP: every stand at −5 s, stopped (the top\'s pre-roll, AR-33)', [S.L.t, S.A.t, S.B.t]);
    await strip('play'); await sleep(3500);
    S = await readAll();
    assert(S.L.following && S.A.following && S.B.following && S.D.following, 'PLAY: every stand and the display follow the room');
    assert(S.L.stripText.playing && S.L.stripText.play === 'STOP', 'the strip says STOP while the room plays', S.L.stripText);
    await sleep(4500);   // 8 s after PLAY: the 1.5-s lead, the 5-s pre-roll, then 1.5 s of music
    let ag = await agreement(stands);
    assert(ag.worst <= BAR_MS, 'the three stands agree within the mixed-device bar (worst ' + ag.worst.toFixed(2) + ' ms)', ag.worst);
    assert(ag.reads.every(x => x.st.t > 0.5), 'the music has passed the top (pre-roll over)', ag.reads.map(x => x.st.t));
    report.steps.push({ step: 'playthrough', worstMs: ag.worst, t: ag.reads.map(x => x.st.t) });
    await L.shot('strip_leader.png'); await R.shot('strip_remote.png'); await D.shot('strip_display.png');

    // ---- 3. STOP after a few bars
    step(3, 'STOP — everyone stops at the same place');
    await strip('play'); await settle();
    S = await readAll();
    assert(!S.L.following && !S.A.following && !S.B.following && !S.L.playing && !S.A.playing, 'STOP: no one follows, no one plays');
    assert(Math.abs(S.A.t - S.B.t) < 0.005 && Math.abs(S.L.t - S.A.t) < 0.005, 'all at the same place (' + S.A.t.toFixed(3) + ')', [S.L.t, S.A.t, S.B.t]);

    // ---- 4. "LET'S TAKE IT FROM E": a letter tap jumps everyone at once, before play
    step(4, '"from E" — the letter jumps every stand at once, stopped, 5 s early');
    await strip('letter', 'E'); await sleep(1200);
    S = await readAll();
    assert([S.L, S.A, S.B, S.D].every(x => Math.abs(x.t - (300 - LEAD)) < 0.01 && !x.playing), 'E: every stand and the display at 4:55, stopped', [S.L.t, S.A.t, S.B.t, S.D.t]);
    assert(/E/.test(S.D.corner), 'the display\'s big corner shows the letter', S.D.corner);
    await strip('play'); await sleep(3500);
    S = await readAll();
    assert(S.A.following && S.A.t > 300 - LEAD + 0.5, 'PLAY from E: following, past the lead', S.A.t);
    await strip('play'); await settle();

    // ---- 5. "A LITTLE SLOWER": 70, then play
    step(5, '"a little slower" — 70 %, PLAY');
    await strip('rate', 0.7); await settle();
    S = await readAll();
    assert(S.L.room.tuple.rate === 0.7, 'the room\'s speed is 70 %', S.L.room.tuple.rate);
    await strip('play'); await sleep(3000);
    const r1 = await stateOf(A), w1 = Date.now(); await sleep(2000); const r2 = await stateOf(A), w2 = Date.now();
    const measured = (r2.t - r1.t) / ((w2 - w1) / 1000);
    assert(Math.abs(measured - 0.7) < 0.06, 'the stand moves at 70 % (measured ' + measured.toFixed(3) + ')', measured);
    await strip('play'); await settle();

    // ---- 6. "JUST THE FLUTE AND THE BASS CLARINET": everyone plays anyway (D94)
    step(6, '"just the flute and the bass clarinet" — nothing to press; everyone plays');
    const roster = await call(watcher, 'ready', { video: false, calibrated: false });
    assert(roster.ok, 'no sectional, no solo switch: the room is the room (D94 — "probably the best way, just everyone plays")');

    // ---- 7. AGAIN: back to the last jump (E), through the play, stop, slower, play, stop between
    step(7, 'AGAIN — the passage again: back to the last jump (E)');
    const before7 = await stateOf(A);
    await strip('again'); await sleep(2500);
    S = await readAll();
    assert(S.A.following && S.A.room.tuple.anchorScoreTime === 300 - LEAD && S.A.t < before7.t, 'AGAIN plays from 4:55 again', { anchor: S.A.room.tuple.anchorScoreTime, t: S.A.t });
    assert(/AGAIN 4:55/.test(S.L.stripText.again), 'the strip says where AGAIN goes', S.L.stripText.again);
    await strip('play'); await settle();
    await strip('rate', 1); await settle();

    // ---- 8. SCRIBBLES — 9j (annotations); nothing to verify here
    step(8, 'the scribbled notes — 9j\'s (no check here)');

    // ---- 9. THE PIANIST FLIPS BACK while the leader talks: local, nobody else moves
    step(9, 'the pianist flips back while stopped — local; the room and the others unmoved');
    const ev9 = stateEvents; const a9 = (await stateOf(A)).t;
    await B.evalJs('window.__standGoto(100)'); await sleep(500);
    S = await readAll();
    assert(Math.abs(S.B.t - 100) < 0.01 && !S.B.playing, 'the piano stand sits at 1:40', S.B.t);
    assert(Math.abs(S.A.t - a9) < 1e-6 && stateEvents === ev9, 'the room and the Bass Cl. did not move', { A: S.A.t, stateEvents: stateEvents - ev9 });

    // ---- 10. "PIANO, 4:10, SHOW ME": she plays it herself, the room stopped
    step(10, '"piano, 4:10, show me" — her own play while the room is stopped (AR-12)');
    await B.evalJs('window.__standGoto(250)'); const on = await B.evalJs('window.__standPlayLocal()'); await sleep(1200);
    S = await readAll();
    assert(on && S.B.playing && !S.B.following && S.B.t > 250.5, 'the piano plays from 4:10 on its own', { playing: S.B.playing, t: S.B.t });
    assert(!S.A.playing && !S.L.playing && !S.L.stripText.playing && stateEvents === ev9, 'the leader\'s strip and the other stands are untouched', { stateEvents: stateEvents - ev9, stripPlaying: S.L.stripText.playing });
    await B.evalJs('window.__standPlayLocal()'); await sleep(300);

    // ---- 11. "LET'S MOVE ON TO F" — F, slower, from a typed time, then normal
    step(11, '"let\'s move on to F" — F · PLAY · STOP · 7 = 7:00 · 6.40 · 85 · PLAY · 100');
    await strip('letter', 'F'); await sleep(1200);
    S = await readAll();
    assert([S.L, S.A, S.B].every(x => Math.abs(x.t - (400 - LEAD)) < 0.01), 'F: every stand at 6:35 — the pianist\'s browsing yields to the room', [S.L.t, S.A.t, S.B.t]);
    await strip('play'); await sleep(2500); await strip('play'); await settle();
    await strip('go', '7'); await sleep(1200); S = await readAll();
    assert(Math.abs(S.A.t - (420 - LEAD)) < 0.01, 'the time box: a bare 7 is 7:00 → 6:55', S.A.t);
    await strip('go', '6.40'); await sleep(1200); S = await readAll();
    assert(Math.abs(S.A.t - (400 - LEAD)) < 0.01, 'the time box: 6.40 is 6:40 → 6:35', S.A.t);
    await strip('rate', 0.85); await settle();
    await strip('play'); await sleep(2500);
    S = await readAll();
    assert(S.A.following && S.A.room.tuple.rate === 0.85, 'PLAY at 85 %', S.A.room.tuple.rate);
    // RESYNC live during play (AR-46): a fresh anchor, nobody stops, still together
    const seqBefore = S.A.room.tuple.seq;
    await strip('resync'); await sleep(1500);
    S = await readAll();
    assert(S.A.following && S.A.room.tuple.seq > seqBefore && S.A.room.tuple.resync === true, 'RESYNC during play: a fresh anchor, still playing', { seq: S.A.room.tuple.seq, resync: S.A.room.tuple.resync });
    ag = await agreement(stands);
    assert(ag.worst <= BAR_MS, 'after RESYNC the stands still agree (worst ' + ag.worst.toFixed(2) + ' ms)', ag.worst);
    await strip('play'); await settle(); await strip('rate', 1); await settle();

    // ---- 12. THE BREAK: ALONE — everyone free; the leader's strip plays only the leader's stand
    step(12, 'the break — ALONE: everyone is their own; the strip plays the leader\'s stand only');
    await strip('mode', 'ALONE'); await settle();
    S = await readAll();
    const kept = S.A.t;
    assert(S.A.mode === 'ALONE' && S.B.mode === 'ALONE' && !S.A.following, 'ALONE: nobody follows, positions kept', { A: S.A.t, B: S.B.t });
    const ev12 = stateEvents;
    await strip('letter', 'A'); await sleep(600); await strip('play'); await sleep(1200);
    S = await readAll();
    assert(S.L.playing && !S.L.following && S.L.t > 120 - LEAD && S.L.t < 120 + 3, 'the leader plays from A on the leader\'s own stand', S.L.t);
    assert(Math.abs(S.A.t - kept) < 1e-6 && stateEvents === ev12, 'the Bass Cl. and the room are untouched by the leader\'s ALONE play', { A: S.A.t, stateEvents: stateEvents - ev12 });
    await strip('play'); await sleep(300);
    await B.evalJs('window.__standPlayLocal()'); await sleep(800); S = await readAll();
    assert(S.B.playing && !S.B.following, 'the pianist practises on her own'); await B.evalJs('window.__standPlayLocal()'); await sleep(300);

    // ---- 13. BACK TOGETHER, FROM THE TOP — then the next day
    step(13, 'back together: REHEARSAL · TOP · PLAY · STOP — then the next day, ALONE, as left');
    await strip('mode', 'REHEARSAL'); await settle(); await strip('top'); await sleep(1000); await strip('play'); await sleep(3500);
    S = await readAll();
    assert(S.L.following && S.A.following && S.B.following && S.D.following, 'from the top, everyone follows');
    await strip('play'); await settle();
    S = await readAll(); const left = { A: S.A.t, B: S.B.t };
    await strip('mode', 'ALONE'); await settle();
    S = await readAll();
    assert(S.A.mode === 'ALONE' && Math.abs(S.A.t - left.A) < 1e-6 && Math.abs(S.B.t - left.B) < 1e-6, 'the next day: ALONE, every stand where it was left', { left, now: [S.A.t, S.B.t] });

    // ---- the remote and the display (AR-31, 32): the same buttons from the gatekeeper's phone
    step('+', 'the remote drives the room; the display zooms from the remote and by its own tap');
    await remote('mode', 'REHEARSAL'); await settle(); await remote('top'); await sleep(800); await remote('play'); await sleep(3000);
    S = await readAll();
    assert(S.A.following && S.B.following && S.D.following, 'the remote\'s PLAY moves the room (the gatekeeper is a leader device)');
    RS = await remoteOf();
    assert(RS.text.playing && RS.text.play === 'STOP', 'the remote says STOP while the room plays', RS.text);
    await remote('play'); await settle();
    await remote('display', 2); await sleep(800); S = await readAll();
    assert(S.D.parts.length === 1 && S.D.parts[0] === 2 && S.D.zoom === 2, 'display.show(piano): the display zooms the piano', S.D.parts);
    await remote('display', null); await sleep(800); S = await readAll();
    assert(S.D.parts.length === 7 && S.D.zoom === null, 'display.show(all): back to the full score', S.D.parts);
    const z = await D.evalJs('window.__standZoom(0)'); await sleep(500);
    assert(z.length === 1 && z[0] === 0, 'the display\'s own tap zooms a part (display-local)', z);
    await D.evalJs('window.__standZoom(null)'); await sleep(300);
    // a REAL click on the display, on the cello's lane (the composer, day 46: every
    // click zoomed the flute — the lane test read a field the laid-out system lacks)
    S = await readAll();
    const cello = S.D.lanes && S.D.lanes.find(l => l.part === 6);
    assert(cello && cello.y0 > 0, 'the display reports its lanes', S.D.lanes && S.D.lanes.map(l => l.part));
    const click = async (x, y) => { for (const type of ['mousePressed', 'mouseReleased']) await D.cdp.send('Input.dispatchMouseEvent', { type, x, y, button: 'left', clickCount: 1 }); };
    await click(900, S.D.sheetTop + (cello.y0 + cello.y1) / 2); await sleep(600);
    S = await readAll();
    assert(S.D.parts.length === 1 && S.D.parts[0] === 6, 'a click on the cello\'s lane zooms the cello', S.D.parts);
    await click(900, 400); await sleep(600);
    S = await readAll();
    assert(S.D.parts.length === 7, 'a second click brings the whole score back', S.D.parts);
    // the remote's choice is kept with the ensemble: a display opened later starts on it
    await remote('display', 2); await sleep(600);
    const D2 = await open('D2', BASE + '/s/' + gk + '?view=display', [1920, 1080]);
    let st2 = null;
    for (let i = 0; i < 80 && !(st2 && (st2.ready || st2.error)); i++) { await sleep(250); try { st2 = await stateOf(D2); } catch (e) { st2 = null; } }
    assert(st2 && st2.ready && st2.parts.length === 1 && st2.parts[0] === 2, 'a display opened after the remote chose the piano starts on the piano', st2 && st2.parts);
    await remote('display', null); await sleep(600);
    st2 = await stateOf(D2);
    assert(st2.parts.length === 7, 'and follows the remote back to the whole score', st2.parts);
    await remote('mode', 'ALONE'); await settle();

    for (const p of pages) assert(p.problems.length === 0, 'page ' + p.name + ': no errors', p.problems.slice(0, 3));
  } catch (e) {
    fail++; checks.push('  !! ' + (e.stack || e)); console.log(checks[checks.length - 1]);
  } finally {
    clearTimeout(watchdog);
    report.ok = fail === 0; report.pass = pass; report.fail = fail; report.checks = checks;
    const file = path.join(OUT, 'strip_check__' + new Date().toISOString().replace(/[:.]/g, '-') + '.json');
    fs.writeFileSync(file, JSON.stringify(report, null, 2));
    console.log((fail === 0 ? 'TUESDAY OK' : 'TUESDAY FAILED') + ' — ' + pass + ' ok, ' + fail + ' failed — ' + path.relative(ROOT, file));
    await cleanup();
    process.exit(fail === 0 ? 0 : 1);
  }
}
main();
