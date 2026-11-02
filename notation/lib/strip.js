// strip.js — THE LEADER'S CONTROL, two forms, the same buttons (PLAN 9i; AR-9,
// 30, 31, 33, 34, 46; D94 "a thin STRIP above the leader's own part … and the
// same set full-screen on a device with no part").
//
//   NotationStrip.make(host, {
//     room,                     the room client (roomclient.js) — the one authority
//     layout: 'strip'|'remote', the thin band above a part, or the full screen
//     letters: () => [{t,label}],   the piece's rehearsal letters (from the welcome)
//     parts: () => [{partIndex,label}],   the piece's parts (the remote's display zoom)
//     local: { play(), stop(), isPlaying(), now(), goto(t) }   the stand's own transport
//                               (ALONE: the strip's play is local — DESIGN §6; absent on the remote)
//     onShowHere: () => {},     the remote's "show the score here" (AR-31)
//   }) -> { act(name, arg), paint(), destroy(), host }
//
// What the buttons do (D94, AR-33): a letter or a typed time JUMPS every stand at
// once, stopped, ~5 s before the spot; PLAY plays from where the room sits (the
// server puts the anchor 1.5 s ahead); AGAIN replays from the last start; TOP is
// the piece's top with the same ~5 s; the speeds are room presets, changed while
// stopped; RESYNC re-anchors live. On play the band STAYS, greyed except STOP +
// RESYNC + the position (AR-30). Under ALONE the room is not moved: the stand's
// own transport answers PLAY, AGAIN, the letters and the time box; the switch
// stays live. The look is the design sitting's (AR-20); this is the mechanism.
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.NotationStrip = factory();
})(typeof self !== 'undefined' ? self : this, function () {

  const SPEEDS = [[0.5, '50'], [0.7, '70'], [0.85, '85'], [1, '100']];
  const MODES = ['ALONE', 'REHEARSAL', 'CONCERT'];
  const LEAD_S = 5;   // the pre-roll on every jump (AR-33)

  const fmt = t => {
    const x = Number(t) || 0, a = Math.abs(x), m = Math.floor(a / 60);
    return (x < 0 ? '−' : '') + m + ':' + (a - m * 60).toFixed(1).padStart(4, '0');
  };
  // the phone's number pad has no colon (the composer, day 46): a bare number is
  // MINUTES, a dot or a colon separates seconds (4.30 = 4:30), an 's' suffix = seconds
  const parseT = v => {
    v = String(v == null ? '' : v).trim().replace(',', '.'); if (!v) return NaN;
    let m = v.match(/^(\d+)[:.](\d{1,2})$/); if (m) return +m[1] * 60 + +m[2];
    m = v.match(/^(\d+(?:\.\d+)?)s$/i); if (m) return +m[1];
    if (/^\d+$/.test(v)) return +v * 60;
    return NaN;
  };

  const CSS = `
.nstrip { box-sizing: border-box; display: flex; align-items: center; gap: 6px; font: 13px/1 system-ui, sans-serif; color: #ddd; background: #1d1d1f; -webkit-user-select: none; user-select: none; }
.nstrip * { box-sizing: border-box; }
.nstrip button { font: inherit; color: #ddd; background: #333; border: 0; border-radius: 8px; padding: 0 10px; height: 30px; min-width: 34px; white-space: nowrap; touch-action: manipulation; }
.nstrip button.on { background: #2a6; color: #fff; }
.nstrip button[disabled] { opacity: .35; }
.nstrip .ns-play { background: #2a6; color: #fff; font-weight: 600; min-width: 72px; }
.nstrip.playing .ns-play { background: #c33; }
.nstrip .ns-switch, .nstrip .ns-speeds, .nstrip .ns-letters, .nstrip .ns-jump, .nstrip .ns-display { display: flex; align-items: center; gap: 4px; }
.nstrip .ns-switch button { background: #2b2b2e; }
.nstrip .ns-switch button.on { background: #357; }
.nstrip .ns-letters:empty::before { content: '— no letters —'; color: #666; font-size: 11px; padding: 0 4px; }
.nstrip .ns-letters button { min-width: 30px; padding: 0 7px; }
.nstrip input.ns-time { font: inherit; color: #eee; background: #111; border: 1px solid #444; border-radius: 8px; height: 30px; width: 118px; padding: 0 8px; }
.nstrip .ns-pos { font: 600 22px/1 system-ui, sans-serif; color: #fff; min-width: 86px; text-align: right; letter-spacing: .02em; font-variant-numeric: tabular-nums; }
.nstrip .ns-ready { color: #9c9; font-variant-numeric: tabular-nums; white-space: nowrap; }
.nstrip .ns-ready.none { color: #777; }
.nstrip .ns-resync { background: #2b2b2e; }
.nstrip .ns-msg { color: #e9a825; font-size: 12px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.nstrip .ns-spacer { flex: 1; }
/* the thin band above the part (AR-30): one row, scrolls sideways if the screen is narrow */
.nstrip-strip { height: 44px; padding: 0 8px; overflow-x: auto; overflow-y: hidden; }
.nstrip-strip > * { flex: 0 0 auto; }
/* the remote (AR-31): the same controls, full screen, in rows that wrap */
.nstrip-remote { flex-wrap: wrap; align-content: flex-start; gap: 10px 8px; padding: 14px; font-size: 16px; min-height: 100%; }
.nstrip-remote > * { flex: 0 0 auto; }
.nstrip-remote button { height: 46px; padding: 0 16px; min-width: 52px; border-radius: 12px; }
.nstrip-remote .ns-play { min-width: 130px; height: 56px; font-size: 20px; }
.nstrip-remote .ns-pos { font-size: 44px; min-width: 170px; width: 100%; text-align: left; margin: 4px 0; }
.nstrip-remote input.ns-time { height: 46px; width: 150px; font-size: 18px; }
.nstrip-remote .ns-row { flex: 1 0 100%; display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
.nstrip-remote .ns-label { color: #888; font-size: 13px; width: 100%; margin-top: 6px; }
.nstrip-remote .ns-display button.on { background: #357; }
.nstrip-remote .ns-here { background: #2b2b2e; }
`;
  let cssDone = false;
  function ensureCss() {
    if (cssDone || typeof document === 'undefined') return;
    const el = document.createElement('style'); el.id = 'nstrip-css'; el.textContent = CSS; document.head.appendChild(el); cssDone = true;
  }

  function make(host, o) {
    ensureCss();
    const room = o.room, layout = o.layout === 'remote' ? 'remote' : 'strip';
    const lettersOf = typeof o.letters === 'function' ? o.letters : () => (o.letters || []);
    const partsOf = typeof o.parts === 'function' ? o.parts : () => (o.parts || []);
    const local = o.local || null;
    const st = { lastStart: -LEAD_S, msg: '', msgAt: 0, roster: null, displayPart: null };   // AGAIN before any jump = the top
    host.classList.add('nstrip', 'nstrip-' + layout);
    const h = s => s;   // the markup is ours
    if (layout === 'strip') {
      host.innerHTML = h(`
<div class="ns-switch"></div>
<button class="ns-play">PLAY</button>
<button class="ns-again">AGAIN</button>
<div class="ns-letters"></div>
<div class="ns-speeds"></div>
<div class="ns-jump"><input class="ns-time" inputmode="decimal" placeholder="4 = 4:00 · 4.30"><button class="ns-go">GO</button><button class="ns-top">TOP</button></div>
<span class="ns-spacer"></span>
<span class="ns-msg"></span>
<span class="ns-ready"></span>
<button class="ns-resync">RESYNC</button>
<span class="ns-pos">0:00.0</span>`);
    } else {
      host.innerHTML = h(`
<div class="ns-row"><div class="ns-switch"></div><span class="ns-spacer"></span><span class="ns-ready"></span></div>
<span class="ns-pos">0:00.0</span>
<div class="ns-row"><button class="ns-play">PLAY</button><button class="ns-again">AGAIN</button><button class="ns-resync">RESYNC</button></div>
<div class="ns-label">letters</div>
<div class="ns-row"><div class="ns-letters"></div></div>
<div class="ns-label">time</div>
<div class="ns-row"><div class="ns-jump"><input class="ns-time" inputmode="decimal" placeholder="4 = 4:00 · 4.30"><button class="ns-go">GO</button><button class="ns-top">TOP</button></div></div>
<div class="ns-label">speed</div>
<div class="ns-row"><div class="ns-speeds"></div></div>
<div class="ns-label">the display</div>
<div class="ns-row"><div class="ns-display"></div></div>
<div class="ns-row"><button class="ns-here">show the score here</button></div>
<div class="ns-row"><span class="ns-msg"></span></div>`);
    }
    const q = sel => host.querySelector(sel);
    const el = {
      sw: q('.ns-switch'), play: q('.ns-play'), again: q('.ns-again'), letters: q('.ns-letters'), speeds: q('.ns-speeds'),
      time: q('.ns-time'), go: q('.ns-go'), top: q('.ns-top'), pos: q('.ns-pos'), ready: q('.ns-ready'), resync: q('.ns-resync'),
      msg: q('.ns-msg'), display: q('.ns-display'), here: q('.ns-here'),
    };
    for (const m of MODES) { const b = document.createElement('button'); b.dataset.mode = m; b.textContent = m; b.onclick = () => act('mode', m); el.sw.appendChild(b); }
    for (const [r, label] of SPEEDS) { const b = document.createElement('button'); b.dataset.rate = String(r); b.textContent = label; b.onclick = () => act('rate', r); el.speeds.appendChild(b); }
    let lettersKey = '';
    function buildLetters() {
      const L = lettersOf() || [];
      const key = JSON.stringify(L);
      if (key === lettersKey) return;
      lettersKey = key; el.letters.innerHTML = '';
      for (const x of L) { const b = document.createElement('button'); b.dataset.letter = x.label; b.dataset.t = String(x.t); b.textContent = x.label; b.title = fmt(x.t); b.onclick = () => act('letter', x.label); el.letters.appendChild(b); }
    }
    let partsKey = '';
    function buildDisplay() {
      if (!el.display) return;
      const P = partsOf() || [];
      const key = JSON.stringify(P);
      if (key === partsKey) return;
      partsKey = key; el.display.innerHTML = '';
      const all = document.createElement('button'); all.dataset.part = 'all'; all.textContent = 'all'; all.onclick = () => act('display', null); el.display.appendChild(all);
      for (const p of P) { const b = document.createElement('button'); b.dataset.part = String(p.partIndex); b.textContent = p.label; b.onclick = () => act('display', p.partIndex); el.display.appendChild(b); }
    }
    el.play.onclick = () => act('play');
    el.again.onclick = () => act('again');
    el.go.onclick = () => act('go', el.time.value);
    el.time.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); act('go', el.time.value); } });
    el.top.onclick = () => act('top');
    el.resync.onclick = () => act('resync');
    if (el.here) el.here.onclick = () => act('here');

    const say = m => { st.msg = m || ''; st.msgAt = Date.now(); paint(); };
    const status = () => room.status();
    const roomPlaying = s => s.mode !== 'ALONE' && !!(s.tuple && s.tuple.playing);
    const send = req => room.send(req).then(a => { if (!a || !a.ok) say((a && a.message) || 'refused'); return a; });
    const letterT = label => { const x = (lettersOf() || []).find(l => l.label === label); return x ? x.t : NaN; };

    // ---- the acts: one name each, so a headless check can drive the same buttons
    function act(name, arg) {
      const s = status();
      const alone = s.mode === 'ALONE';
      switch (name) {
        case 'mode':
          if (!MODES.includes(arg)) return;
          return room.setMode(arg).then(a => { if (!a || !a.ok) say((a && a.message) || 'refused'); paint(); });
        // AGAIN goes back to the LAST JUMP (a letter, a typed time, TOP) — "the
        // passage again", however many plays and stops came between; before any
        // jump, the top. A plain PLAY after a stop does not move it. (The rule is
        // the AI's reading of D94 "replay from the last start"; the sitting may
        // change it — strip_check step 7 holds it.)
        case 'play':
          if (alone) {
            if (!local) { say('ALONE — flip REHEARSAL to play the room'); return; }
            if (local.isPlaying()) local.stop(); else local.play();
            paint(); return;
          }
          if (roomPlaying(s)) return send({ playing: false });
          return send({ playing: true });
        case 'again':
          if (alone) { if (!local) return; local.goto(st.lastStart); local.play(); paint(); return; }
          return send({ playing: true, anchorScoreTime: st.lastStart });
        case 'letter': {
          const t = letterT(arg); if (!Number.isFinite(t)) return;
          return jump(Math.max(-LEAD_S, t - LEAD_S));
        }
        case 'go': {
          const t = parseT(arg); if (!Number.isFinite(t)) { say('a time: 4 = 4:00 · 4.30 = 4:30'); return; }
          return jump(Math.max(-LEAD_S, t - LEAD_S));
        }
        case 'top': return jump(-LEAD_S);   // the piece's top gets the same ~5 s (AR-33)
        case 'rate':
          if (alone || roomPlaying(s)) return;   // room presets, changed while stopped (AR-30, 34)
          return send({ rate: arg, playing: false });
        case 'resync':
          if (alone) return;
          return room.resync().then(a => { if (!a || !a.ok) say((a && a.message) || 'refused'); });
        case 'display':
          st.displayPart = arg == null ? null : Number(arg);
          if (!room.socket || !room.socket.connected) { say('offline'); return; }
          return new Promise(res => room.socket.emit('display.show', { partIndex: st.displayPart }, a => { if (!a || !a.ok) say((a && a.message) || 'refused'); paint(); res(a); }));
        case 'here':
          if (typeof o.onShowHere === 'function') o.onShowHere();
          return;
      }
    }
    function jump(t) {
      st.lastStart = t;
      const s = status();
      if (s.mode === 'ALONE') { if (local) { local.stop(); local.goto(t); } paint(); return; }
      return send({ playing: false, anchorScoreTime: t });
    }

    // ---- the paint: what is lit, what is greyed, where we are
    function paint() {
      const s = status();
      const alone = s.mode === 'ALONE', playing = alone ? !!(local && local.isPlaying()) : roomPlaying(s);
      host.classList.toggle('playing', playing);
      host.classList.toggle('alone', alone);
      host.classList.toggle('offline', !s.online);
      for (const b of el.sw.children) b.classList.toggle('on', b.dataset.mode === s.mode);
      // under ALONE the stand's own transport answers (offline too); otherwise the room must be there
      const dead = alone ? !local : !s.online;
      el.play.textContent = playing ? 'STOP' : 'PLAY';
      el.play.disabled = dead;
      el.again.textContent = 'AGAIN ' + fmt(st.lastStart);
      el.again.disabled = playing || dead;
      buildLetters(); buildDisplay();
      const pos = alone ? (local ? local.now() : 0) : s.position;
      // the letter lit = the one we are in, or the one the pre-roll is heading to (within 5 s)
      let cur = null; for (const x of (lettersOf() || [])) if (x.t <= pos + LEAD_S + 1e-9) cur = x.label;
      for (const b of el.letters.children) { b.classList.toggle('on', b.dataset.letter === cur); b.disabled = playing || dead; }
      const rate = (s.tuple && s.tuple.rate) || 1;
      for (const b of el.speeds.children) { b.classList.toggle('on', Number(b.dataset.rate) === rate); b.disabled = playing || alone || s.mode === 'CONCERT' || !s.online; }
      el.time.disabled = el.go.disabled = el.top.disabled = playing || dead;
      el.resync.disabled = alone || !s.online;
      el.pos.textContent = fmt(pos);
      if (el.display) for (const b of el.display.children) b.classList.toggle('on', (b.dataset.part === 'all' ? null : Number(b.dataset.part)) === st.displayPart);
      // the ready count (AR-30): players online over the ensemble's rows; the
      // calibrated ones in brackets (the dot's truth, AR-14)
      const R = st.roster;
      if (R && room.welcome && room.welcome.ensemble && room.welcome.ensemble.rows) {
        const rows = room.welcome.ensemble.rows.length;
        const players = R.members.filter(m => m.role === 'player');
        const cal = players.filter(m => m.ready && m.ready.calibrated).length;
        el.ready.textContent = players.length + '/' + rows + (cal ? ' · ' + cal + ' cal' : '');
        el.ready.classList.toggle('none', players.length === 0);
      } else { el.ready.textContent = s.online ? '' : 'offline'; el.ready.classList.add('none'); }
      if (st.msg && Date.now() - st.msgAt > 4000) st.msg = '';
      el.msg.textContent = st.msg || (!s.online ? 'offline' : alone && !local ? 'ALONE — the stands are their own' : '');
    }
    if (room.socket) room.socket.on('roster', r => { st.roster = r; paint(); });
    if (room.socket) room.socket.on('display', d => { st.displayPart = d && d.partIndex != null ? Number(d.partIndex) : null; paint(); });
    const timer = setInterval(paint, 250);
    paint();
    return {
      host, act, paint, fmt, parseT,
      get lastStart() { return st.lastStart; },
      destroy() { clearInterval(timer); host.innerHTML = ''; host.classList.remove('nstrip', 'nstrip-' + layout, 'playing', 'alone', 'offline'); },
    };
  }

  return { make, fmt, parseT, SPEEDS, MODES, LEAD_S };
});
