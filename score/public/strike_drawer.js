// strike_drawer.js — THE STRIKES DRAWER (PLAN 1c.2; the requirements, decision by decision, in
// docs/STRIKES_TOOL.md — sections A–T). Built 2026-09-03/04 for the composer's morning test.
//
// One full-width drawer that pulls up from the bottom of the composer score. Left to right:
//   0 · the SEQUENCE — the strikes of the source save in order (index · go time · notes)
//   1 · the KEYBOARD — vertical, the ensemble span (an `88` toggle widens it), every voice a dot
//       in its pitch-class colour with its name; hollow = a stand-in (the articulation sounds,
//       not the pitch); a ring = the piano plays it too
//   2 · the ORCHESTRATION — the seven players in score order, shuffle, top / bottom locks, the
//       "shuffle may fold" switch, an articulation menu on every row; dotted lines from keys
//   3 · the ARTICULATION picker — the clicked player's full roster grouped by kind, and the
//       variant list (open strings, multiphonic keys, noise keys) with a ▶ to hear each
//   4 · the RHYTHM strip — rows aligned with the keyboard, time left→right, the live 60 ms
//       bands, transforms (span ×, shape + amount, jitter, reverse, rotate, reshuffle) and the
//       ORDER (presets, shuffle, click two dots to swap)
// Bottom: voicing presets (original · spread · cluster ±oct · low · high · high+low · reshuffle),
// Hear piano / Hear orchestrated / Stop, duration × / dyn × / flatten, Insert @ playhead,
// Replace in place, back, takes (save / load), the piano quick buttons.
//
// THE MODEL (STRIKES_TOOL L): three independent lists — PITCHES (the harmony), ONSETS (the
// rhythmic positions), PLAYERS — paired freely: pitch↔onset (the order), pitch↔player (the
// orchestration). "As played" is one pairing. Voicing presets move octaves only; the harmony
// never changes. An articulation is a layer (S): a voice keeps its harmony pitch, the KIND of
// the articulation decides what sounds (pitched / fixed-pitch / noise / multiphonic → stand-in).
// Ranges (F): the shuffle never produces a misfit; a hand choice that misfits folds by octave
// (marked ↑ ↓) or is skipped. The 60 ms grouping is re-derived after every transform (J).
//
// MIDI glue and scheduling are the multitempo panel's, verbatim in spirit: MorphEmit.ensureMidi
// / routeFor / noteOn / noteOff, panic() the one stop path, timers in E._timers, one absolute
// time base. Composer, TRACKS, META_LAYER, INSTRUMENTS are script-level consts in composer.html
// (global lexical scope, not window properties) — read as free identifiers.
(function (root) {
'use strict';

const C_ = () => (typeof Composer !== 'undefined' ? Composer : (root.Composer || null));
const E_ = () => (typeof MorphEmit !== 'undefined' ? MorphEmit : (root.MorphEmit || null));
const TRK = () => (typeof TRACKS !== 'undefined' ? TRACKS : (root.TRACKS || []));
const METAL = () => (typeof META_LAYER !== 'undefined' ? META_LAYER : root.META_LAYER);
const INST = () => (typeof INSTRUMENTS !== 'undefined' ? INSTRUMENTS : (root.INSTRUMENTS || {}));

const DB_URL = '/bank/scattered_strikes.json';
const STORE = 'septet.strikeDrawer.v3';
const TAKES = 'septet.strikeTakes.v1';            // v1: the browser's takes — read once by the migration, never written again
const TAKES_PANEL = 'strikes';                     // O v2 (2026-09-04): takes live in bank/panel_snapshots.json under this bucket
const TAKE_NAME = /^[A-Za-z0-9._ -]{1,64}$/;       // the server's name rule (score/snapshots.js), checked here first
const LEAD_MS = 250, CC0_LEAD_MS = 30;
const SPAN = { lo: 36, hi: 96 };        // the ensemble's span on screen (cello C2 … flute C7)
const FULL = { lo: 21, hi: 108 };       // the `88` toggle
const NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const BLACK = [1, 3, 6, 8, 10];
const PC_PALETTE = ['#ffd479', '#7ec9a8', '#8ea9c9', '#c98a8a', '#b58ec9', '#d4c25e',
                    '#69b7c9', '#c9986e', '#96c96e', '#c96ea8', '#8a8ac9', '#e0e0e0'];
const nm = m => NAMES[((m % 12) + 12) % 12] + (Math.floor(m / 12) - 1);
const SEED_KEEP = 8;   // U8: how many earlier seeds each random button keeps as chips
const OPEN_STRINGS = { violin1: [55, 62, 69, 76], violin2: [55, 62, 69, 76], viola: [48, 55, 62, 69], cello: [36, 43, 50, 57] };
const PLAIN_PREF = ['ord', 'main', 'senza_vel', 'senza_mw', 'staccato'];
// U2 (composer, 2026-09-04): the default articulation of a strike — flute pizzicato (the written tongue
// ram), bass clarinet slap, violins Bartók, viola / cello gettato; the piano as it is; all at 127
const STRIKE_DEFAULT = { flute: 'pizzicato', bass_clarinet: 'slap', violin1: 'bartok_vel', violin2: 'bartok_vel', viola: 'gettato_vel', cello: 'gettato_vel', piano: 'main' };

function mulberry32(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function shuffled(arr, rnd) { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
const median = a => { if (!a.length) return null; const s = [...a].sort((x, y) => x - y); const m = Math.floor(s.length / 2); return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

function plainTech(inst) {
    const techs = (inst && inst.techniques) || [];
    for (const k of PLAIN_PREF) { const t = techs.find(q => q.key === k); if (t) return t.key; }
    return techs.length ? techs[0].key : null;
}
// the KIND of an articulation (S): until the recipe file carries a `kind` field (0c), a name rule
function kindOf(tech) {
    if (!tech) return 'pitched';
    if (tech.kind) return tech.kind;
    const s = (tech.key + ' ' + (tech.label || '')).toLowerCase();
    if (/multiphon|mp_/.test(s)) return 'multiphonic';
    if (/behind_bridge|peg_box|_open|open strings|sul[1-4]|nh_gliss|harmonics sul/.test(s)) return 'fixed';
    if (/body|undef|key_click|key_noises|slap|air_noise|jet_whistle|tongue_ram|whistle|noise|finger_vel|tailpiece|gliss_undef/.test(s)) return 'noise';
    return 'pitched';
}
function techRange(inst, tech) {
    const lo = (tech && tech.rangeLow != null) ? tech.rangeLow : (inst ? inst.rangeLow : 0);
    const hi = (tech && tech.rangeHigh != null) ? tech.rangeHigh : (inst ? inst.rangeHigh : 127);
    return [lo, hi];
}
function foldInto(pitch, lo, hi) {
    let p = pitch, n = 0;
    while (p < lo && n < 8) { p += 12; n++; }
    while (p > hi && n > -8) { p -= 12; n--; }
    return (p >= lo && p <= hi) ? { pitch: p, oct: n } : null;
}

const D = {
    el: null, body: null, db: null, seq: null, strike: null,
    voices: [], slots: [], ph: null, base: 0, prev: null, pickerLane: null,
    cfg: { strikeId: null, show88: false, rowH: 0, full: true, heightPx: 0, voicing: 'original', vSeed: 1, clusterOct: 0,
           timeX: 1, shape: 'played', amount: 1, jitterMs: 0, reverse: false, rotate: 0, rSeed: 1, order: 'played', oSeed: 1, simMs: 60,
           durX: 1, dynX: 1, flatten: true, mayFold: false, topLock: -1, bottomLock: -1, oSeedShuffle: 1, zoomPxPerMs: 0, rhythmW: 480 },

    // ------------------------------------------------------------------ init / build
    init() {
        const host = document.getElementById('mtBtn') || document.getElementById('pulseBtn') ||
                     document.getElementById('textureBtn') || document.getElementById('morphBtn') || document.getElementById('blastsBtn');
        if (!host) { console.warn('[strikes] no button to anchor to'); return; }
        const btn = document.createElement('button');
        btn.id = 'strikesBtn'; btn.textContent = 'Strikes';
        btn.title = 'the scattered-strike drawer (docs/STRIKES_TOOL.md): pick a strike in the sequence, voice it, orchestrate it, shape its rhythm, hear it, put it back in the score';
        btn.addEventListener('click', () => this.toggle());
        host.parentNode.insertBefore(btn, host.nextSibling);
        this.restore();
        this.build();
        const tab = document.createElement('div');
        tab.id = 'strikesTab'; tab.textContent = 'STRIKES \u25B4';
        tab.title = 'open the strikes drawer';
        tab.style.cssText = 'position:fixed;right:14px;bottom:0;z-index:8999;background:#4a3a12;color:#e8cf9a;border:1px solid #C9A05A;border-bottom:none;border-radius:6px 6px 0 0;padding:2px 12px;cursor:pointer;font:12px system-ui,sans-serif;letter-spacing:.06em';
        tab.addEventListener('click', () => this.toggle(true));
        document.body.appendChild(tab);
        window.addEventListener('resize', () => { if (this.el && this.el.style.display !== 'none') this.render(); });
        const e = E_();
        if (e) { const prev = e.onStop; e.onStop = () => { if (prev) try { prev(); } catch (x) {} this.onStopped(); }; }
        this.refreshTakes().then(() => this.migrateTakes());
    },

    build() {
        const d = document.createElement('div');
        d.id = 'strikeDrawer';
        d.tabIndex = -1;
        d.style.cssText = 'position:fixed;left:0;right:0;bottom:0;height:58vh;z-index:9000;background:#1b1b20;border-top:2px solid #C9A05A;' +
            'color:#ddd;font:11px/1.4 system-ui,sans-serif;display:none;box-shadow:0 -8px 30px rgba(0,0,0,.6);overflow:hidden;flex-direction:column';
        const inp = 'background:#111114;color:#ddd;border:1px solid #444;padding:1px 3px;font-size:11px';
        const btn = 'background:#2a2a30;color:#ddd;border:1px solid #555;border-radius:3px;padding:1px 6px;font-size:11px;cursor:pointer';
        d.innerHTML =
            '<div id="skHandle" style="flex:none;height:8px;cursor:ns-resize;background:linear-gradient(#3a3a44,#1b1b20)"></div>' +
            '<div id="skHead" style="flex:none;display:flex;gap:10px;align-items:center;padding:3px 10px;border-bottom:1px solid #444;background:rgba(201,160,90,.12)">' +
              '<b style="color:#e8cf9a">STRIKES</b>' +
              '<span id="skStatus" style="color:#9a9;flex:1 1 auto;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">idle</span>' +
              '<label>source <select id="skSeqSel" style="' + inp + '"></select></label>' +
              '<button id="skReload" style="' + btn + '" title="re-read bank/scattered_strikes.json">&#8635; db</button>' +
              '<button id="skRescan" style="' + btn + '" title="re-ingest the source save into the database (tools/strike_db.js via the server)">rescan</button>' +
              '<label title="the 60 ms simultaneity threshold — live">sim <input id="skSim" type="number" min="5" max="500" step="5" style="width:46px;' + inp + '"> ms</label>' +
              '<button id="skZ0" style="' + btn + '" title="fit the keyboard to the drawer">fit</button><button id="skZ1" style="' + btn + '">Z1</button><button id="skZ2" style="' + btn + '">Z2</button><button id="skZ3" style="' + btn + '">Z3</button>' +
              '<button id="skFull" style="' + btn + '" title="full page height / half">&#8597; full</button>' +
              '<label title="widen the keyboard to the piano\'s 88 keys"><input id="sk88" type="checkbox"> 88</label>' +
              '<span id="skClose" style="cursor:pointer;color:#888;font-size:14px;padding:0 4px">&#10005;</span>' +
            '</div>' +
            '<div id="skBody" style="flex:1 1 auto;min-height:0;position:relative;display:flex;gap:0;align-items:stretch;overflow:auto">' +
              '<div id="skSeq" style="flex:0 0 190px;overflow:auto;border-right:1px solid #333;padding:2px 0"></div>' +
              '<div id="skKbWrap" style="flex:0 0 150px;position:relative"><svg id="skKb" width="150" height="10"></svg></div>' +
              '<div id="skGap" style="flex:1 1 140px;max-width:320px;min-width:120px" title="the dotted lines run here: key → player"></div>' +
              '<div id="skOrch" style="flex:0 0 330px;border-left:1px solid #333;border-right:1px solid #333;position:relative;display:flex;flex-direction:column"></div>' +
              '<div id="skPick" style="flex:0 0 240px;border-right:1px solid #333;overflow:auto;display:none;padding:4px 6px"></div>' +
              '<div id="skRhyWrap" style="flex:0 0 480px;position:relative;min-width:300px"><svg id="skRhy" width="100%" height="10"></svg></div>' +
              '<div id="skSpacer" style="flex:1 1 0"></div>' +
              '<svg id="skLines" style="position:absolute;left:0;top:0;pointer-events:none;overflow:visible"></svg>' +
            '</div>' +
            '<div id="skFoot" style="flex:none;display:flex;flex-wrap:wrap;gap:4px 8px;align-items:center;padding:4px 10px;border-top:1px solid #444">' +
              '<span style="color:#9a9">voicing</span>' +
              ['original', 'spread', 'cluster', 'low', 'high', 'highlow'].map(v => '<button class="skV" data-v="' + v + '" style="' + btn + '">' + ({ original: 'original', spread: 'spread out', cluster: 'cluster', low: 'cluster low', high: 'cluster high', highlow: 'high + low' })[v] + '</button>').join('') +
              '<label title="the tight cluster moved by octaves">oct <input id="skClOct" type="number" min="-3" max="3" step="1" style="width:40px;' + inp + '"></label>' +
              '<button id="skVRe" style="' + btn + '" title="a different realization of the same voicing preset">reshuffle voicing</button>' +
              '<span id="skSeedV"></span>' +
              '<span style="color:#555">|</span>' +
              '<button id="skHearP" style="' + btn + '">Hear piano</button><button id="skHearO" style="' + btn + ';color:#e8cf9a">Hear orchestrated</button><button id="skStop" style="' + btn + '">Stop</button>' +
              '<label>dur &times; <input id="skDurX" type="number" min="0.1" max="20" step="0.1" style="width:44px;' + inp + '"></label>' +
              '<label>dyn &times; <input id="skDynX" type="number" min="0.1" max="2" step="0.05" style="width:44px;' + inp + '"></label>' +
              '<label title="every note at velocity 127 (dyn × still applies)"><input id="skFlat" type="checkbox"> flat 127</label>' +
              '<button id="skSoloOff" style="' + btn + '" title="U3: shift-click a dot (keyboard or rhythm) to solo a voice, S on a player row to solo its voices">solo off</button>' +
              '<span style="color:#555">|</span>' +
              '<span style="color:#9a9">piano</span>' +
              ['none', 'one', 'topbot', 'rest', 'all'].map(k => '<button class="skPno" data-k="' + k + '" style="' + btn + '">' + ({ none: 'none', one: 'one', topbot: 'top+bottom', rest: 'rest', all: 'all' })[k] + '</button>').join('') +
              '<span style="color:#555">|</span>' +
              '<button id="skInsert" style="' + btn + '" title="write the strike at the playhead as a gesture (groupId + META shape)">Insert @ playhead</button>' +
              '<button id="skAtTime" style="' + btn + '" title="write the strike into WHATEVER score is open, at the time it was played (no need to open its source save); original notes found there are replaced">Insert @ original time</button>' +
              '<button id="skBack" style="' + btn + '" title="one step back">back</button>' +
              // U9 (composer, 2026-09-04: "can we make return save, the save take button drifted to the other end of the
              // screen"): the take controls are one group that wraps as a unit, and ENTER in the box saves.
              '<span id="skTakeGrp" style="display:inline-flex;gap:4px;align-items:center;white-space:nowrap">' +
              '<input id="skTakeName" placeholder="take name — ENTER saves" style="width:130px;' + inp + '"><button id="skTakeSave" style="' + btn + '">save take</button>' +
              '<select id="skTakeSel" style="max-width:130px;' + inp + '"><option value="">load take…</option></select>' +
              '<button id="skTakeDel" title="delete the take named in the box (asks first)" style="' + btn + '">&times;</button>' +
              '</span>' +
              '<span id="skPlayhead" style="display:none;color:#e8cf9a">&#9654;</span>' +
            '</div>';
        document.body.appendChild(d);
        this.el = d; this.body = d.querySelector('#skBody');
        this.applyHeight();
        // wiring
        const q = s => d.querySelector(s);
        q('#skClose').addEventListener('click', () => this.toggle(false));
        q('#skReload').addEventListener('click', () => this.loadDb(true));
        q('#skRescan').addEventListener('click', () => this.rescan());
        q('#skSeqSel').addEventListener('change', e => this.selectSeq(e.target.value));
        q('#skSim').addEventListener('change', e => { this.cfg.simMs = clamp(+e.target.value || 60, 5, 500); this.save(); this.render(); });
        q('#sk88').addEventListener('change', e => { this.cfg.show88 = e.target.checked; this.save(); this.render(); });
        q('#skZ0').addEventListener('click', () => { this.cfg.rowH = 0; this.save(); this.render(); });
        q('#skFull').addEventListener('click', () => { this.cfg.full = !this.cfg.full; this.save(); this.applyHeight(); this.render(); });
        q('#skZ1').addEventListener('click', () => { this.cfg.rowH = 6; this.save(); this.render(); });
        q('#skZ2').addEventListener('click', () => { this.cfg.rowH = 9; this.save(); this.render(); });
        q('#skZ3').addEventListener('click', () => { this.cfg.rowH = 12; this.save(); this.render(); });
        d.querySelectorAll('.skV').forEach(b => b.addEventListener('click', () => { this.snapshot(); this.cfg.voicing = b.dataset.v; this.applyVoicing(); this.save(); this.render(); }));
        q('#skClOct').addEventListener('change', e => { this.snapshot(); this.cfg.clusterOct = clamp(+e.target.value || 0, -3, 3); this.applyVoicing(); this.save(); this.render(); });
        q('#skVRe').addEventListener('click', () => { this.snapshot(); this.useSeed('vSeed', this.nextSeed('vSeed')); this.save(); this.render(); });
        q('#skHearP').addEventListener('click', () => this.play('piano'));
        q('#skHearO').addEventListener('click', () => this.play('orch'));
        q('#skStop').addEventListener('click', () => { const e = E_(); if (e) e.panic(); this.onStopped(); });
        q('#skDurX').addEventListener('change', e => { this.cfg.durX = clamp(+e.target.value || 1, 0.1, 20); this.save(); });
        q('#skDynX').addEventListener('change', e => { this.cfg.dynX = clamp(+e.target.value || 1, 0.1, 2); this.save(); });
        q('#skFlat').addEventListener('change', e => { this.cfg.flatten = e.target.checked; this.save(); });
        q('#skSoloOff').addEventListener('click', () => { this.snapshot(); this.voices.forEach(v => { v.solo = false; }); this.render(); });
        d.querySelectorAll('.skPno').forEach(b => b.addEventListener('click', () => { this.snapshot(); this.pianoQuick(b.dataset.k); this.render(); }));
        q('#skInsert').addEventListener('click', () => this.insert(false));
        q('#skAtTime').addEventListener('click', () => this.insert(true));
        q('#skBack').addEventListener('click', () => this.back());
        q('#skTakeSave').addEventListener('click', () => this.saveTake());
        q('#skTakeName').addEventListener('keydown', ev => { if (ev.key !== 'Enter') return; ev.preventDefault(); ev.stopPropagation(); this.saveTake(); });   // U9
        q('#skTakeSel').addEventListener('change', e => { if (e.target.value) this.loadTake(e.target.value); e.target.value = ''; });
        q('#skTakeDel').addEventListener('click', () => this.deleteTake());
        // resize handle
        let drag = null;
        q('#skHandle').addEventListener('mousedown', e => { drag = { y: e.clientY, h: d.getBoundingClientRect().height }; e.preventDefault(); });
        document.addEventListener('mousemove', e => { if (!drag) return; const h = clamp(drag.h + (drag.y - e.clientY), 220, window.innerHeight); d.style.height = h + 'px'; this.cfg.full = false; this.cfg.heightPx = h; this.render(); });
        document.addEventListener('mouseup', () => { if (drag) this.save(); drag = null; });
        // SPACE while the drawer is open = hear orchestrated / stop, wherever the focus is; the score's own SPACE
        // (a bubbling listener on window) never sees it. Capture phase on window, because the score blurs every
        // select and number input on change (composer.html init, the "pull-down menus trap the spacebar" fix),
        // which dropped the focus to <body> and handed SPACE to the transport (composer, 2026-09-04: "at some
        // point it started playing the main score"). Text entry keeps its SPACE (the take name); a focused
        // select or button is blurred first so SPACE cannot open or press it.
        window.addEventListener('keydown', ev => {
            if (ev.code !== 'Space' || !this.el || this.el.style.display === 'none') return;
            const t = ev.target, m = q => !!(t && t.matches && t.matches(q));
            if (m('textarea, input[type=text], input[type=number], input[type=search], input:not([type])')) return;
            if (m('select, button')) t.blur();
            ev.preventDefault(); ev.stopPropagation();
            const e = E_(); if (e && e._playing) { e.panic(); this.onStopped(); } else this.play('orch');
        }, true);
        this.writeFields();
    },

    writeFields() {
        const q = s => this.el.querySelector(s);
        q('#skSim').value = this.cfg.simMs; q('#sk88').checked = !!this.cfg.show88;
        q('#skClOct').value = this.cfg.clusterOct; q('#skDurX').value = this.cfg.durX; q('#skDynX').value = this.cfg.dynX;
        q('#skFlat').checked = !!this.cfg.flatten;
        this.fillTakes();
    },
    applyHeight() {
        const full = this.cfg.full !== false;
        this.el.style.height = full ? '100vh' : ((this.cfg.heightPx || 0) >= 220 ? this.cfg.heightPx + 'px' : '58vh');
        const b = this.el.querySelector('#skFull'); if (b) b.innerHTML = full ? '&#8597; half' : '&#8597; full';
    },
    // the keyboard's row height: explicit (Z1–Z3) or fitted to the drawer's body
    rh() {
        if (this.cfg.rowH > 0) return this.cfg.rowH;
        const R = this.range(), bh = this.body ? this.body.clientHeight : 0;
        return clamp(Math.floor((bh - 6) / (R.hi - R.lo + 1)), 5, 16);
    },

    preflight() {
        const C = C_(), e = E_(), bad = [];
        if (!C) bad.push('Composer not reachable');
        if (!e || typeof e.ensureMidi !== 'function' || typeof e.routeFor !== 'function' || typeof e.panic !== 'function') bad.push('MorphEmit incomplete');
        if (!TRK().length || METAL() == null) bad.push('TRACKS / META_LAYER missing');
        if (C && typeof C.getTimeAtPlayhead !== 'function') bad.push('Composer.getTimeAtPlayhead missing');
        if (bad.length) console.error('[strikes] PREFLIGHT FAILED:', bad);
        return bad;
    },

    toggle(force) {
        const show = force != null ? force : this.el.style.display === 'none';
        this.el.style.display = show ? 'flex' : 'none';
        const b = document.getElementById('strikesBtn');
        if (b) { b.style.background = show ? '#4a3a12' : ''; b.style.color = show ? '#e8cf9a' : ''; }
        const tab = document.getElementById('strikesTab'); if (tab) tab.style.display = show ? 'none' : '';
        if (!show) { const e = E_(); if (e) e.panic(); return; }
        const bad = this.preflight();
        this.el.focus();
        if (bad.length) { this.setStatus('PREFLIGHT: ' + bad.join(' · '), true); return; }
        this.loadDb(false);
        this.refreshTakes();
    },

    // ------------------------------------------------------------------ the database
    async loadDb(force) {
        if (this.db && !force) { this.fillSeq(); return; }
        try {
            const r = await fetch(DB_URL + '?t=' + Date.now(), { cache: 'no-store' });
            if (!r.ok) throw new Error('HTTP ' + r.status);
            this.db = await r.json();
        } catch (err) { this.setStatus('cannot read ' + DB_URL + ' — run tools/strike_db.js first (' + err.message + ')', true); return; }
        this.fillSeq();
    },
    async rescan() {
        const seq = this.seq; if (!seq) return;
        this.setStatus('rescanning ' + seq.source + ' …');
        try {
            const r = await fetch('/api/strikes/ingest', { method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ score: seq.source, gap: this.db && this.db.defaults ? this.db.defaults.strikeGapMs : 500, sim: this.cfg.simMs }) });
            const j = await r.json();
            if (!j.success) throw new Error(j.error || 'ingest failed');
            const first = (j.census || '').split('\n').slice(0, 2).join(' · ');
            await this.loadDb(true);
            this.setStatus('rescanned: ' + first);
        } catch (err) { this.setStatus('rescan failed: ' + err.message + ' (is the server the one with /api/strikes/ingest? restart node score/server.js)', true); }
    },
    fillSeq() {
        const sel = this.el.querySelector('#skSeqSel');
        const seqs = Object.values((this.db && this.db.sequences) || {});
        sel.innerHTML = '';
        seqs.forEach(s => { const o = document.createElement('option'); o.value = s.id; o.textContent = s.source + ' · ' + s.strikeIds.length + ' strikes'; sel.appendChild(o); });
        if (!seqs.length) { this.setStatus('the database has no sequences yet', true); return; }
        const want = this.seq && seqs.find(s => s.id === this.seq.id) ? this.seq.id : seqs[0].id;
        sel.value = want; this.selectSeq(want);
    },
    selectSeq(id) {
        this.seq = this.db.sequences[id]; if (!this.seq) return;
        const list = this.el.querySelector('#skSeq');
        list.innerHTML = '<div style="padding:2px 8px;color:#9a9">' + this.seq.strikeIds.length + ' strikes · ' + (this.seq.spanMs / 1000).toFixed(1) + ' s</div>';
        this.seq.strikeIds.forEach((sid, i) => {
            const s = this.db.strikes[sid]; if (!s) return;
            const row = document.createElement('div');
            row.className = 'skSeqRow'; row.dataset.id = sid;
            row.style.cssText = 'padding:2px 8px;cursor:pointer;display:flex;gap:6px;white-space:nowrap';
            row.innerHTML = '<span style="color:#777;width:20px">' + s.index + '</span><span style="width:52px">' + s.t0.toFixed(2) + ' s</span><span style="color:#bbb">' + s.stats.noteCount + ' n</span><span style="color:#777">' + nm(s.stats.midi.min) + '–' + nm(s.stats.midi.max) + '</span>';
            row.addEventListener('click', () => this.select(sid));
            list.appendChild(row);
        });
        const want = this.cfg.strikeId && this.db.strikes[this.cfg.strikeId] && this.seq.strikeIds.includes(this.cfg.strikeId) ? this.cfg.strikeId : this.seq.strikeIds[0];
        if (want) this.select(want);
    },

    // ------------------------------------------------------------------ the strike → voices
    select(id) {
        const s = this.db.strikes[id]; if (!s) return;
        this.strike = s; this.cfg.strikeId = id; this.prev = null;
        this.el.querySelectorAll('.skSeqRow').forEach(r => { r.style.background = r.dataset.id === id ? 'rgba(201,160,90,.25)' : ''; });
        // voices as played; the as-played pairing: voice i ↔ its own onset
        { const at = this.el.querySelector('#skAtTime'); if (at) at.textContent = 'Insert @ ' + s.t0.toFixed(2) + ' s (original)'; }
        this.voices = s.notes.map((n, i) => ({
            id: n.objectId, i, pitch0: n.midi, pc: ((n.midi % 12) + 12) % 12, pitch: n.midi,
            lane: -1, fold: 0, tech: null, standIn: null, piano: false, solo: false, vel: n.vel != null ? n.vel : 100, durMs: n.durMs || 100,
            dt0: n.dtMs, slot: i,
        }));
        this.slotsPlayed = s.notes.map(n => n.dtMs);      // the onset pattern as played (voice order)
        this.cfg.voicing = 'original'; this.cfg.order = 'played'; this.resetRhythm();
        this.asPlayedOrchestration();
        this.applyVoicing();
        this.save();
        // link to the score: park the playhead on the strike
        const C = C_();
        if (C && !C.isPlaying && typeof C.applyScroll === 'function') { C.scrollOffset = s.t0 * C.pixelsPerSecond; C.applyScroll(); }
        this.render();
        this.setStatus('strike #' + s.index + ' · ' + s.t0.toFixed(2) + ' s · ' + s.stats.noteCount + ' notes · span ' + Math.round(s.spanMs) + ' ms · ' + s.source);
    },
    asPlayedOrchestration() {
        // as played: every voice on its recorded lane (the piano), no player assignment yet
        const T = TRK();
        this.voices.forEach(v => { const n = this.strike.notes[v.i]; const lane = T.findIndex(t => t.instKey === n.instKey); v.lane = -1; v.piano = lane >= 0 && T[lane].instKey === 'piano'; v.tech = null; v.fold = 0; v.standIn = null; });
    },

    // ------------------------------------------------------------------ voicing presets (B)
    range() { return this.cfg.show88 ? FULL : SPAN; },
    applyVoicing() {
        const vs = this.voices; if (!vs.length) return;
        const rnd = mulberry32(this.cfg.vSeed * 7919 + 17);
        const R = this.range();
        const nearestOct = (pc, target) => { let best = null; for (let p = pc; p <= 127; p += 12) { if (p < R.lo - 12) continue; if (best == null || Math.abs(p - target) < Math.abs(best - target)) best = p; } return clamp(best, R.lo, R.hi); };
        const pack = (list, centre) => {
            // the smallest chromatic span: rotate the sorted unique pcs so the largest gap is at the end
            const pcs = [...new Set(list.map(v => v.pc))].sort((a, b) => a - b);
            if (!pcs.length) return;
            let bestK = 0, bestSpan = 99;
            const spans = pcs.map((_, k) => (pcs[(k - 1 + pcs.length) % pcs.length] - pcs[k] + 12) % 12 || 12);   // span if we start at k
            pcs.forEach((_, k) => { if (spans[k] < bestSpan) { bestSpan = spans[k]; bestK = k; } });
            const near = pcs.map((_, k) => k).filter(k => spans[k] <= bestSpan + 2);
            const k0 = this.cfg.voicing === 'original' ? bestK : near[Math.floor(rnd() * near.length)];
            const packed = {}; let p = pcs[k0] + 12 * Math.round((centre - pcs[k0]) / 12);
            for (let j = 0; j < pcs.length; j++) { const pc = pcs[(k0 + j) % pcs.length]; while (p % 12 !== pc) p++; packed[pc] = p; }
            const lo = Math.min(...Object.values(packed)), hi = Math.max(...Object.values(packed));
            const shift = 12 * Math.round((centre - (lo + hi) / 2) / 12);
            list.forEach(v => { v.pitch = clamp(packed[v.pc] + shift, R.lo, R.hi); });
        };
        switch (this.cfg.voicing) {
            case 'original': vs.forEach(v => { v.pitch = v.pitch0; }); break;
            case 'spread': {
                const order = shuffled(vs, rnd);
                order.forEach((v, i) => { const target = R.lo + (i + 0.5) * (R.hi - R.lo) / order.length; v.pitch = nearestOct(v.pc, target); });
                break;
            }
            case 'cluster': pack(vs, 60 + 12 * this.cfg.clusterOct + Math.round((rnd() - 0.5) * 0)); break;
            case 'low': pack(vs, R.lo + 8 + 12 * this.cfg.clusterOct); break;
            case 'high': pack(vs, R.hi - 8 + 12 * this.cfg.clusterOct); break;
            case 'highlow': {
                const order = shuffled(vs, rnd); const half = Math.ceil(order.length / 2);
                pack(order.slice(0, half), R.lo + 8); pack(order.slice(half), R.hi - 8);
                break;
            }
        }
        // a voiced pitch may no longer fit its player: re-fold
        vs.forEach(v => { if (v.lane >= 0) this.fitVoice(v); });
    },

    // ------------------------------------------------------------------ orchestration (E, F)
    instOf(lane) { const T = TRK(); return lane >= 0 && T[lane] ? INST()[T[lane].instKey] : null; },
    // U2: the strike default for a player, if its roster has it; else the plain technique
    defaultTech(lane) { const T = TRK(), inst = this.instOf(lane); if (!inst) return null; const want = T[lane] && STRIKE_DEFAULT[T[lane].instKey]; if (want && (inst.techniques || []).some(q => q.key === want)) return want; return plainTech(inst); },
    techOf(v) { const inst = this.instOf(v.lane); return inst ? ((inst.techniques || []).find(t => t.key === v.tech) || null) : null; },
    fitVoice(v) {
        // F: fold by octave into the player's (technique's) range; fixed-pitch / noise / multiphonic → stand-in
        const inst = this.instOf(v.lane); if (!inst) { v.fold = 0; v.standIn = null; return true; }
        const tech = this.techOf(v); const kind = kindOf(tech);
        const [lo, hi] = techRange(inst, tech);
        if (kind === 'pitched') {
            v.standIn = null;
            const f = foldInto(v.pitch, lo, hi);
            if (!f) { v.fold = 0; v.skip = true; return false; }
            v.fold = f.oct; v.skip = false; return true;
        }
        v.fold = 0; v.skip = false;
        if (v.standIn == null) v.standIn = this.defaultStandIn(v, inst, tech, kind, lo, hi);
        return true;
    },
    defaultStandIn(v, inst, tech, kind, lo, hi) {
        const T = TRK(); const key = T[v.lane] && T[v.lane].instKey;
        if (kind === 'fixed' && OPEN_STRINGS[key]) { const os = OPEN_STRINGS[key]; return os.reduce((a, b) => Math.abs(b - v.pitch) < Math.abs(a - v.pitch) ? b : a); }
        const f = foldInto(v.pitch, lo, hi); return f ? f.pitch : lo;
    },
    soundingPitch(v) { return v.standIn != null ? v.standIn : (v.pitch + 12 * v.fold); },

    shuffleOrch() {
        const T = TRK(); const n = T.length; const rnd = mulberry32(this.cfg.oSeedShuffle * 104729 + 3);
        const vs = [...this.voices].sort((a, b) => a.pitch - b.pitch);
        vs.forEach(v => { v.lane = -1; v.fold = 0; v.standIn = null; v.skip = false; v.piano = false; });
        const free = new Set([...Array(n).keys()]);
        const give = (v, lane) => { v.lane = lane; v.tech = this.defaultTech(lane); this.fitVoice(v); free.delete(lane); };
        const fits = (v, lane) => { const inst = this.instOf(lane); if (!inst) return false; const tk = this.defaultTech(lane); const [lo, hi] = techRange(inst, (inst.techniques || []).find(t => t.key === tk)); return this.cfg.mayFold ? !!foldInto(v.pitch, lo, hi) : (v.pitch >= lo && v.pitch <= hi); };
        // locks first: the highest and the lowest voice
        if (this.cfg.topLock >= 0 && vs.length) { const v = vs[vs.length - 1]; if (fits(v, this.cfg.topLock) || this.cfg.mayFold) give(v, this.cfg.topLock); }
        if (this.cfg.bottomLock >= 0 && vs.length > 1) { const v = vs[0]; if (v.lane < 0 && (fits(v, this.cfg.bottomLock) || this.cfg.mayFold)) give(v, this.cfg.bottomLock); }
        // the rest: a random draw, each player once, never a misfit
        for (const v of shuffled(vs.filter(x => x.lane < 0), rnd)) {
            const cands = [...free].filter(l => fits(v, l));
            if (!cands.length) continue;
            give(v, cands[Math.floor(rnd() * cands.length)]);
        }
        // the piano plays what it was given (one note); any leftover voice is silent until flagged
        this.voices.forEach(v => { if (v.lane >= 0 && T[v.lane].instKey === 'piano') v.piano = true; });
    },
    assign(v, lane, tech) { v.lane = lane; v.fold = 0; v.standIn = null; if (lane >= 0) { v.tech = tech || this.defaultTech(lane); if (!this.fitVoice(v)) v.skip = true; } },   // tech: the row's current technique, if it has one (U7)
    pianoQuick(k) {
        const vs = [...this.voices].sort((a, b) => a.pitch - b.pitch);
        const T = TRK(); const pianoLane = T.findIndex(t => t.instKey === 'piano');
        const own = v => v.lane === pianoLane;
        switch (k) {
            case 'none': vs.forEach(v => { v.piano = own(v); }); break;
            case 'one': vs.forEach(v => { v.piano = own(v); }); if (!vs.some(v => v.piano) && vs.length) vs[Math.floor(vs.length / 2)].piano = true; break;
            case 'topbot': vs.forEach(v => { v.piano = own(v); }); if (vs.length) { vs[0].piano = true; vs[vs.length - 1].piano = true; } break;
            case 'rest': vs.forEach(v => { v.piano = own(v) || v.lane < 0; }); break;
            case 'all': vs.forEach(v => { v.piano = true; }); break;
        }
    },

    // ------------------------------------------------------------------ rhythm (J) and order (K)
    // the onset PATTERN after transforms: an array of slot times (ms), index = slot
    // U5 (composer, 2026-09-04: "how to reset the rhythm"): the one place the rhythm goes back to as played —
    // the button and every strike pick use it. Order and orchestration are not touched.
    // U8 (composer, 2026-09-04: "Can I have the seed? And can I have a way to go back to previous seeds? … a row or
    // a table of previous shuffles … I can just click on previous seeds"): every random button shows its seed, keeps the
    // last SEED_KEEP seeds as clickable chips (newest first, the current one lit), and takes a typed seed. A new shuffle
    // always uses max(seen) + 1, so it never repeats a seed still in the row. The histories live in cfg (saved, in takes).
    seedHist(key) { const h = this.cfg.seedHist || (this.cfg.seedHist = {}); if (!Array.isArray(h[key])) h[key] = []; return h[key]; },
    noteSeed(key) { const h = this.seedHist(key), n = this.cfg[key]; const i = h.indexOf(n); if (i >= 0) h.splice(i, 1); h.unshift(n); if (h.length > SEED_KEEP) h.length = SEED_KEEP; },
    nextSeed(key) { return Math.max(this.cfg[key] || 0, ...this.seedHist(key)) + 1; },
    useSeed(key, n) {
        n = Math.max(1, Math.round(+n || 1)); this.cfg[key] = n; this.noteSeed(key);
        if (key === 'oSeed') this.cfg.order = 'random';
        else if (key === 'rSeed') { if (this.cfg.shape === 'played') this.cfg.shape = 'random'; }
        else if (key === 'oSeedShuffle') this.shuffleOrch();
        else if (key === 'vSeed') this.applyVoicing();
    },
    seedChips(key) {
        const h = this.seedHist(key); if (!h.length) this.noteSeed(key);
        const cur = this.cfg[key];
        const b = 'background:#2a2a30;color:#ddd;border:1px solid #555;border-radius:3px;padding:0 3px;font-size:10px;cursor:pointer;line-height:14px';
        return '<span class="skSeeds" style="display:inline-flex;flex-wrap:wrap;gap:2px;align-items:center;font-size:10px;color:#9a9" title="the seed of this shuffle — click an earlier one to have it back, or type one">seed ' +
            '<input class="skSeedIn" data-key="' + key + '" type="number" min="1" step="1" value="' + cur + '" style="width:38px;background:#111114;color:#ddd;border:1px solid #444;padding:0 2px;font-size:10px">' +
            h.map(n => '<button class="skSeed" data-key="' + key + '" data-n="' + n + '" style="' + b + (n === cur ? ';background:#e8cf9a;color:#222' : '') + '">' + n + '</button>').join('') + '</span>';
    },
    renderSeeds() {
        const put = (id, key) => { const el = this.el.querySelector(id); if (el) el.innerHTML = this.seedChips(key); };
        put('#skSeedV', 'vSeed'); put('#skSeedO', 'oSeed'); put('#skSeedR', 'rSeed');   // the orchestration header's chips are inline in renderOrch
        this.el.querySelectorAll('.skSeed').forEach(b => b.addEventListener('click', ev => { ev.stopPropagation(); this.snapshot(); this.useSeed(b.dataset.key, +b.dataset.n); this.save(); this.render(); }));
        this.el.querySelectorAll('.skSeedIn').forEach(i => i.addEventListener('change', ev => { ev.stopPropagation(); this.snapshot(); this.useSeed(i.dataset.key, +i.value); this.save(); this.render(); }));
    },
    resetRhythm() { this.cfg.shape = 'played'; this.cfg.timeX = 1; this.cfg.amount = 1; this.cfg.jitterMs = 0; this.cfg.reverse = false; this.cfg.rotate = 0; },
    pattern() {
        const base = this.slotsPlayed.slice().sort((a, b) => a - b);
        const n = base.length; if (!n) return [];
        const S = base[n - 1] - base[0] || 0;
        const rnd = mulberry32(this.cfg.rSeed * 48611 + 5);
        let shaped;
        const u = i => n > 1 ? i / (n - 1) : 0;
        switch (this.cfg.shape) {
            case 'even': shaped = base.map((_, i) => S * u(i)); break;
            case 'front': shaped = base.map((_, i) => S * Math.pow(u(i), 2)); break;
            case 'back': shaped = base.map((_, i) => S * Math.sqrt(u(i))); break;
            case 'centre': shaped = base.map((_, i) => S * (Math.asin(2 * u(i) - 1) / Math.PI + 0.5)); break;
            case 'edges': shaped = base.map((_, i) => { const x = u(i); return S * (x * x * (3 - 2 * x)); }); break;
            case 'random': shaped = [0].concat([...Array(n - 1)].map(() => rnd() * S)).sort((a, b) => a - b); break;
            default: shaped = base.map(t => t - base[0]);
        }
        const played = base.map(t => t - base[0]);
        const a = clamp(this.cfg.amount, 0, 1);
        let out = shaped.map((t, i) => (1 - a) * played[i] + a * t);
        if (this.cfg.reverse) out = out.map(t => S - t).sort((x, y) => x - y);
        if (this.cfg.rotate) { const gaps = out.slice(1).map((t, i) => t - out[i]); if (gaps.length) { const g = gaps.slice(this.cfg.rotate % gaps.length).concat(gaps.slice(0, this.cfg.rotate % gaps.length)); out = [0]; g.forEach(x => out.push(out[out.length - 1] + x)); } }
        if (this.cfg.jitterMs) { const jr = mulberry32(this.cfg.rSeed * 31 + 9); out = out.map(t => Math.max(0, t + (jr() * 2 - 1) * this.cfg.jitterMs)); }
        return out.map(t => t * this.cfg.timeX);
    },
    // the ORDER: which voice takes which slot (K)
    applyOrder() {
        if (this.cfg.order === 'manual') return;   // K fix (2026-09-04): a by-hand dot swap sets the slots itself; every render used to re-derive them from "as played" and undo it
        const vs = this.voices; const n = vs.length;
        const byPitch = [...vs].sort((a, b) => a.pitch - b.pitch);
        const played = [...vs].sort((a, b) => a.dt0 - b.dt0);
        const rnd = mulberry32(this.cfg.oSeed * 7877 + 11);
        let seq;
        switch (this.cfg.order) {
            case 'lowhigh': seq = byPitch; break;
            case 'highlow': seq = byPitch.slice().reverse(); break;
            case 'outin': { seq = []; let lo = 0, hi = n - 1, t = true; while (lo <= hi) { seq.push(t ? byPitch[lo++] : byPitch[hi--]); t = !t; } break; }
            case 'inout': { const m = Math.floor(n / 2); seq = []; let l = m, r = m + 1, t = true; while (l >= 0 || r < n) { if (t && l >= 0) seq.push(byPitch[l--]); else if (r < n) seq.push(byPitch[r++]); else if (l >= 0) seq.push(byPitch[l--]); t = !t; } break; }
            case 'random': seq = shuffled(vs, rnd); break;
            default: seq = played;
        }
        seq.forEach((v, i) => { v.slot = i; });
    },
    timed() {
        const pat = this.pattern();
        return this.voices.map(v => ({ v, onMs: pat[v.slot] != null ? pat[v.slot] : 0, durMs: Math.max(30, v.durMs * this.cfg.durX) }));
    },
    bands() {
        // live regrouping at simMs over the current pattern (J)
        const pat = this.pattern().slice().sort((a, b) => a - b);
        const groups = []; let last = -Infinity;
        pat.forEach(t => { if (t - last >= this.cfg.simMs || !groups.length) { groups.push({ t0: t, t1: t + this.cfg.simMs }); last = t; } });
        return groups;
    },

    // ------------------------------------------------------------------ render
    keyY(midi) { const R = this.range(); return (R.hi - midi) * this.rh(); },
    render() {
        if (!this.strike) return;
        this.applyOrder();
        this.renderKeyboard(); this.renderOrch(); this.renderPicker(); this.renderRhythm(); this.renderSeeds();
        requestAnimationFrame(() => this.renderLines());
    },
    pcColor(pc) { const pcs = [...new Set(this.voices.map(v => v.pc))].sort((a, b) => a - b); return PC_PALETTE[pcs.indexOf(pc) % PC_PALETTE.length]; },
    renderKeyboard() {
        const R = this.range(), h = this.rh(), svg = this.el.querySelector('#skKb');
        const rows = R.hi - R.lo + 1, H = rows * h + 4;
        svg.setAttribute('height', H); svg.style.height = H + 'px';
        let s = '';
        for (let m = R.hi; m >= R.lo; m--) {
            const y = this.keyY(m), black = BLACK.includes(m % 12);
            s += '<rect class="skKey" data-m="' + m + '" x="44" y="' + (y + 0.5) + '" width="' + (black ? 60 : 100) + '" height="' + (h - 1) + '" fill="' + (black ? '#2a2a30' : '#d8d3c8') + '" stroke="#111" stroke-width="0.5" style="cursor:pointer"/>';
            if (m % 12 === 0) s += '<text x="2" y="' + (y + h * 0.8) + '" font-size="' + Math.max(8, h) + '" fill="#777">C' + (m / 12 - 1) + '</text>';
        }
        // voices
        const r = Math.max(2.5, h * 0.42); const anySolo = this.voices.some(v => v.solo);
        const byPitch = {};
        this.voices.forEach(v => { (byPitch[v.pitch] = byPitch[v.pitch] || []).push(v); });
        Object.keys(byPitch).forEach(p => {
            const list = byPitch[p], m = +p; if (m < R.lo || m > R.hi) return;
            list.forEach((v, k) => {
                const cy = this.keyY(m) + h / 2, cx = 122 + k * 10, col = this.pcColor(v.pc);
                if (v.piano) s += '<circle cx="' + cx + '" cy="' + cy + '" r="' + (r + 2.5) + '" fill="none" stroke="#e8cf9a" stroke-width="1.2"/>';
                s += '<circle class="skDot" data-i="' + v.i + '" cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="' + (v.standIn != null ? 'none' : col) + '" stroke="' + (v.solo ? '#fff' : col) + '" stroke-width="' + (v.solo ? 2.5 : 1.5) + '" opacity="' + (anySolo && !v.solo ? 0.35 : 1) + '" style="cursor:pointer"><title>' + (v.solo ? 'SOLO · ' : '') + nm(v.pitch) + (v.pitch !== v.pitch0 ? ' (played ' + nm(v.pitch0) + ')' : '') + (v.standIn != null ? ' · stands in: ' + nm(v.standIn) : '') + '</title></circle>';
                if (k === 0) s += '<text x="40" y="' + (cy + 3) + '" font-size="' + Math.max(8, Math.min(11, h + 2)) + '" fill="' + col + '" text-anchor="end">' + nm(m) + '</text>';
            });
        });
        // out-of-view voices (the 88 case): arrows at the edges
        const above = this.voices.filter(v => v.pitch > R.hi).length, below = this.voices.filter(v => v.pitch < R.lo).length;
        if (above) s += '<text x="120" y="10" fill="#e88" font-size="10">▲' + above + '</text>';
        if (below) s += '<text x="120" y="' + (H - 2) + '" fill="#e88" font-size="10">▼' + below + '</text>';
        svg.innerHTML = s;
        // click a key → toggle the piano flag of the voice(s) on it; click a dot too
        svg.querySelectorAll('.skKey').forEach(k => k.addEventListener('click', () => { const m = +k.dataset.m; const vs = this.voices.filter(v => v.pitch === m); if (!vs.length) return; this.snapshot(); vs.forEach(v => { v.piano = !v.piano; }); this.render(); }));
        svg.querySelectorAll('.skDot').forEach(dd => dd.addEventListener('click', ev => { ev.stopPropagation(); const v = this.voices[+dd.dataset.i]; this.snapshot(); if (ev.shiftKey) v.solo = !v.solo; else v.piano = !v.piano; this.render(); }));
    },
    renderOrch() {
        const T = TRK(), box = this.el.querySelector('#skOrch');
        const inp = 'background:#111114;color:#ddd;border:1px solid #444;padding:0 2px;font-size:11px;max-width:150px';
        const btn = 'background:#2a2a30;color:#ddd;border:1px solid #555;border-radius:3px;padding:1px 6px;font-size:11px;cursor:pointer';
        const opts = sel => '<option value="-1">—</option>' + T.map((t, i) => '<option value="' + i + '"' + (i === sel ? ' selected' : '') + '>' + t.label + '</option>').join('');
        let s = '<div style="display:flex;gap:6px;align-items:center;padding:4px 6px;border-bottom:1px solid #333;flex-wrap:wrap">' +
            '<button id="skShuffle" style="' + btn + ';color:#e8cf9a">shuffle</button>' + this.seedChips('oSeedShuffle') +
            '<label title="off: played registers only; on: the shuffle may fold a pitch class by octave into any player"><input id="skFold" type="checkbox"' + (this.cfg.mayFold ? ' checked' : '') + '> may fold</label>' +
            '<label>top → <select id="skTop" style="' + inp + '">' + opts(this.cfg.topLock) + '</select></label>' +
            '<label>bottom → <select id="skBot" style="' + inp + '">' + opts(this.cfg.bottomLock) + '</select></label>' +
            '<button id="skAsPlayed" style="' + btn + '" title="back to the piano, as played">as played</button></div>';
        s += '<div id="skRows" style="flex:1 1 auto;display:flex;flex-direction:column;justify-content:space-around">';
        T.forEach((t, lane) => {
            const inst = INST()[t.instKey]; const mine = this.voices.filter(v => v.lane === lane);
            const techs = (inst && inst.techniques) || [];
            const groups = {}; techs.forEach(tq => { const k = kindOf(tq); (groups[k] = groups[k] || []).push(tq); });
            const cur = mine.length ? (mine[0].tech || this.defaultTech(lane)) : this.defaultTech(lane);
            const menu = '<select class="skTech" data-lane="' + lane + '" style="' + inp + '">' + ['pitched', 'fixed', 'noise', 'multiphonic'].filter(k => groups[k]).map(k => '<optgroup label="' + k + '">' + groups[k].map(tq => '<option value="' + tq.key + '"' + (tq.key === cur ? ' selected' : '') + '>' + tq.label + '</option>').join('') + '</optgroup>').join('') + '</select>';
            const notes = mine.map(v => '<span style="color:' + this.pcColor(v.pc) + '">' + nm(this.soundingPitch(v)) + (v.fold ? (v.fold > 0 ? '↑' : '↓') : '') + (v.standIn != null ? '*' : '') + (v.skip ? ' ✕' : '') + '</span>').join(' ');
            const soloed = mine.length > 0 && mine.every(v => v.solo);
            s += '<div class="skRow" data-lane="' + lane + '" style="display:flex;gap:6px;align-items:center;padding:1px 6px;' + (this.pickerLane === lane ? 'background:rgba(201,160,90,.15)' : '') + '">' +
                '<span class="skLand" style="flex:none;width:8px;height:8px;border-radius:50%;background:' + (mine.length ? '#e8cf9a' : '#444') + '" title="the lines land here"></span>' +
                '<span class="skRowName" style="width:64px;cursor:pointer;color:#e8cf9a" title="click: the full articulation list">' + t.label + '</span>' +
                '<button class="skSolo" data-lane="' + lane + '" style="' + btn + ';padding:0 4px;' + (soloed ? 'background:#e8cf9a;color:#222' : '') + '" title="solo this player\'s voices">S</button>' +
                '<span style="width:88px;overflow:hidden;white-space:nowrap">' + (notes || '<span style="color:#555">·</span>') + '</span>' + menu + '</div>';
        });
        s += '</div>';
        box.innerHTML = s;
        box.querySelector('#skShuffle').addEventListener('click', () => { this.snapshot(); this.useSeed('oSeedShuffle', this.nextSeed('oSeedShuffle')); this.save(); this.render(); });
        box.querySelector('#skFold').addEventListener('change', e => { this.cfg.mayFold = e.target.checked; this.save(); });
        box.querySelector('#skTop').addEventListener('change', e => { this.cfg.topLock = +e.target.value; this.save(); });
        box.querySelector('#skBot').addEventListener('change', e => { this.cfg.bottomLock = +e.target.value; this.save(); });
        box.querySelector('#skAsPlayed').addEventListener('click', () => { this.snapshot(); this.asPlayedOrchestration(); this.render(); });
        box.querySelectorAll('.skTech').forEach(sel => sel.addEventListener('change', e => { const lane = +sel.dataset.lane; this.snapshot(); this.voices.filter(v => v.lane === lane).forEach(v => { v.tech = e.target.value; v.standIn = null; this.fitVoice(v); }); this.render(); }));
        box.querySelectorAll('.skRowName').forEach(el => el.addEventListener('click', () => { const lane = +el.parentNode.dataset.lane; this.pickerLane = this.pickerLane === lane ? null : lane; this.render(); }));
        box.querySelectorAll('.skSolo').forEach(el => el.addEventListener('click', ev => { ev.stopPropagation(); const lane = +el.dataset.lane; const mine = this.voices.filter(v => v.lane === lane); if (!mine.length) return; this.snapshot(); const on = !mine.every(v => v.solo); mine.forEach(v => { v.solo = on; }); this.render(); }));
        box.querySelectorAll('.skRow').forEach(row => { row.addEventListener('mouseenter', () => { this.hoverLane = +row.dataset.lane; this.renderLines(); }); row.addEventListener('mouseleave', () => { this.hoverLane = null; this.renderLines(); }); });
        // drop a voice on a player: click a dot on the keyboard, then a row (two-click assign).
        // U7 (composer, 2026-09-04: "it added two lines to the instrument. The previous one didn't go away"): a plain
        // click REPLACES — the note(s) the player had go to the armed note's old player (or to nobody), so the chord
        // stays whole and nothing is lost; each note takes the technique its new row already plays. Shift-click ADDS.
        box.querySelectorAll('.skRow').forEach(row => row.addEventListener('click', ev => {
            if (ev.target.tagName === 'SELECT' || ev.target.tagName === 'BUTTON' || ev.target.classList.contains('skRowName')) return;
            if (this.pendingVoice == null) return;
            const v = this.voices[this.pendingVoice]; this.pendingVoice = null;
            const lane = +row.dataset.lane, from = v.lane, fromTech = v.tech, T = TRK();
            const rowTech = (this.voices.find(o => o !== v && o.lane === lane) || {}).tech || null;
            const there = ev.shiftKey ? [] : this.voices.filter(o => o !== v && o.lane === lane);
            this.snapshot();
            there.forEach(o => this.assign(o, from, from >= 0 ? fromTech : null));
            this.assign(v, lane, rowTech);
            const name = l => l >= 0 && T[l] ? T[l].label : 'nobody';
            this.setStatus(nm(v.pitch) + ' → ' + name(lane) + (there.length ? ' · ' + there.map(o => nm(o.pitch)).join(' ') + ' → ' + name(from) + ' (swapped)' : (ev.shiftKey ? ' (added)' : '')) + ' · shift-click adds instead of replacing');
            this.render();
        }));
    },
    renderPicker() {
        const box = this.el.querySelector('#skPick');
        if (this.pickerLane == null) { box.style.display = 'none'; return; }
        const lane = this.pickerLane, T = TRK(), inst = INST()[T[lane].instKey];
        const mine = this.voices.filter(v => v.lane === lane);
        const techs = (inst && inst.techniques) || [];
        const groups = {}; techs.forEach(tq => { const k = kindOf(tq); (groups[k] = groups[k] || []).push(tq); });
        const cur = mine.length ? mine[0].tech : null;
        let s = '<div style="color:#e8cf9a;margin-bottom:4px">' + T[lane].label + ' · articulations</div>';
        ['pitched', 'fixed', 'noise', 'multiphonic'].forEach(k => {
            if (!groups[k]) return;
            s += '<div style="color:#9a9;margin:4px 0 2px">' + k + '</div>' + groups[k].map(tq => '<div class="skPickT" data-key="' + tq.key + '" style="cursor:pointer;padding:0 4px;' + (tq.key === cur ? 'background:rgba(201,160,90,.25)' : '') + '">' + tq.label + '</div>').join('');
        });
        // variants (T): open strings / the technique's keys
        if (mine.length && cur) {
            const tech = techs.find(t => t.key === cur), kind = kindOf(tech);
            if (kind !== 'pitched') {
                const [lo, hi] = techRange(inst, tech);
                const keys = kind === 'fixed' && OPEN_STRINGS[T[lane].instKey] ? OPEN_STRINGS[T[lane].instKey] : [...Array(Math.max(0, Math.min(40, hi - lo + 1))).keys()].map(i => lo + i);
                s += '<div style="color:#9a9;margin:6px 0 2px">variants · click = select, ▶ = hear</div>' + keys.map(k => '<div style="display:flex;gap:4px"><span class="skVar" data-k="' + k + '" style="cursor:pointer;flex:1;' + (mine[0].standIn === k ? 'color:#e8cf9a' : '') + '">' + nm(k) + ' <span style="color:#666">' + k + '</span></span><span class="skVarHear" data-k="' + k + '" style="cursor:pointer;color:#9fd3db">&#9654;</span></div>').join('');
            }
        }
        box.innerHTML = s; box.style.display = '';
        box.querySelectorAll('.skPickT').forEach(el => el.addEventListener('click', () => { this.snapshot(); mine.forEach(v => { v.tech = el.dataset.key; v.standIn = null; this.fitVoice(v); }); this.render(); }));
        box.querySelectorAll('.skVar').forEach(el => el.addEventListener('click', () => { this.snapshot(); mine.forEach(v => { v.standIn = +el.dataset.k; }); this.render(); }));
        box.querySelectorAll('.skVarHear').forEach(el => el.addEventListener('click', () => this.hearOne(lane, cur, +el.dataset.k)));
    },
    renderRhythm() {
        const wrap = this.el.querySelector('#skRhyWrap'), svg = this.el.querySelector('#skRhy');
        wrap.style.flex = '0 0 ' + clamp(this.cfg.rhythmW || 480, 320, 1400) + 'px';
        const R = this.range(), h = this.rh(), rows = R.hi - R.lo + 1, H = rows * h + 4;
        const W = Math.max(300, wrap.clientWidth - 4);
        svg.setAttribute('height', H); svg.style.height = H + 'px'; svg.setAttribute('width', W);
        const timed = this.timed(); const pat = this.pattern();
        const spanMs = Math.max(1, Math.max(...pat, 0)); const pad = 14;
        const pxPerMs = (W - 2 * pad - 130) / Math.max(spanMs, 50);
        const X = ms => pad + 130 + ms * pxPerMs;
        let s = '';
        // the live bands
        this.bands().forEach(b => { s += '<rect x="' + X(b.t0) + '" y="0" width="' + Math.max(2, (b.t1 - b.t0) * pxPerMs) + '" height="' + H + '" fill="#C9A05A" opacity="0.13"/>'; });
        // row lines + the controls column at the left of the strip
        for (let m = R.hi; m >= R.lo; m -= 12) s += '<line x1="' + (pad + 130) + '" y1="' + (this.keyY(m) + h) + '" x2="' + W + '" y2="' + (this.keyY(m) + h) + '" stroke="#2c2c33"/>';
        // time ruler
        const step = spanMs > 2000 ? 500 : spanMs > 600 ? 100 : 50;
        for (let t = 0; t <= spanMs + 1; t += step) s += '<line x1="' + X(t) + '" y1="0" x2="' + X(t) + '" y2="' + H + '" stroke="#333"/><text x="' + (X(t) + 2) + '" y="10" font-size="9" fill="#666">' + Math.round(t) + '</text>';
        // dots
        const r = Math.max(2.5, h * 0.42); const anySolo = this.voices.some(v => v.solo);
        timed.forEach(q => { const v = q.v, cy = this.keyY(v.pitch) + h / 2, col = this.pcColor(v.pc); if (v.pitch < R.lo || v.pitch > R.hi) return;
            s += '<circle class="skRDot" data-i="' + v.i + '" cx="' + X(q.onMs) + '" cy="' + cy + '" r="' + r + '" fill="' + (v.lane >= 0 || v.piano ? col : 'none') + '" stroke="' + (v.solo ? '#fff' : col) + '" stroke-width="' + (v.solo ? 2.5 : 1.5) + '" opacity="' + (anySolo && !v.solo ? 0.35 : 1) + '" style="cursor:pointer"' + (this.swapFirst === v.i ? ' stroke-dasharray="2 2"' : '') + '><title>' + nm(v.pitch) + ' @ ' + Math.round(q.onMs) + ' ms · slot ' + v.slot + '</title></circle>'; });
        svg.innerHTML = s;
        // controls (HTML, over the strip's left margin)
        let ctl = wrap.querySelector('#skRhyCtl');
        if (!ctl) {
            ctl = document.createElement('div'); ctl.id = 'skRhyCtl';
            ctl.style.cssText = 'position:absolute;left:4px;top:2px;width:132px;display:flex;flex-direction:column;gap:3px;font-size:10px';
            const inp = 'background:#111114;color:#ddd;border:1px solid #444;padding:0 2px;font-size:10px;width:52px';
            const btn = 'background:#2a2a30;color:#ddd;border:1px solid #555;border-radius:3px;padding:0 4px;font-size:10px;cursor:pointer';
            ctl.innerHTML = '<span style="color:#9a9">rhythm</span>' +
                '<label>span × <input id="skTimeX" type="number" min="0.05" max="20" step="0.05" style="' + inp + '"></label>' +
                '<label>shape <select id="skShape" style="' + inp + ';width:64px"><option value="played">as played</option><option value="even">even</option><option value="front">front-loaded</option><option value="back">back-loaded</option><option value="centre">centre</option><option value="edges">edges</option><option value="random">random</option></select></label>' +
                '<label>amount <input id="skAmt" type="range" min="0" max="1" step="0.05" style="width:64px"></label>' +
                '<label>jitter <input id="skJit" type="number" min="0" max="500" step="5" style="' + inp + '"> ms</label>' +
                '<div><button id="skRev" style="' + btn + '">reverse</button> <button id="skRot" style="' + btn + '">rotate</button> <button id="skRRe" style="' + btn + '">reshuffle</button></div>' +
                '<div><button id="skRhyReset" style="' + btn + '" title="the rhythm as played: shape as played · span × 1 · jitter 0 · reverse off · rotate 0 — order and orchestration untouched; back undoes it (U5)">reset rhythm</button></div>' +
                '<div id="skSeedR"></div>' +
                '<span style="color:#9a9;margin-top:4px">order</span>' +
                '<label><select id="skOrder" style="' + inp + ';width:78px"><option value="played">as played</option><option value="manual">by hand</option><option value="lowhigh">low → high</option><option value="highlow">high → low</option><option value="outin">outside-in</option><option value="inout">inside-out</option><option value="random">random</option></select></label>' +
                '<div><button id="skORe" style="' + btn + '">shuffle order</button></div><div id="skSeedO"></div><span style="color:#666">click two dots to swap<br>shift-click = solo</span>' +
                '<label style="margin-top:4px">width <input id="skRhyW" type="range" min="320" max="1400" step="20" style="width:64px"></label>';
            wrap.appendChild(ctl);
            const q = sel => ctl.querySelector(sel);
            q('#skTimeX').addEventListener('change', e => { this.snapshot(); this.cfg.timeX = clamp(+e.target.value || 1, 0.05, 20); this.save(); this.render(); });
            q('#skShape').addEventListener('change', e => { this.snapshot(); this.cfg.shape = e.target.value; this.save(); this.render(); });
            q('#skAmt').addEventListener('pointerdown', () => this.snapshot());   // once per drag, not per tick
            q('#skAmt').addEventListener('input', e => { this.cfg.amount = +e.target.value; this.save(); this.render(); });
            q('#skJit').addEventListener('change', e => { this.snapshot(); this.cfg.jitterMs = clamp(+e.target.value || 0, 0, 500); this.save(); this.render(); });
            q('#skRev').addEventListener('click', () => { this.snapshot(); this.cfg.reverse = !this.cfg.reverse; this.render(); });
            q('#skRot').addEventListener('click', () => { this.snapshot(); this.cfg.rotate = (this.cfg.rotate || 0) + 1; this.render(); });
            q('#skRRe').addEventListener('click', () => { this.snapshot(); this.useSeed('rSeed', this.nextSeed('rSeed')); this.save(); this.render(); });
            q('#skRhyReset').addEventListener('click', () => { this.snapshot(); this.resetRhythm(); this.save(); this.render(); this.setStatus('rhythm reset to as played (span × 1 · jitter 0 · reverse off · rotate 0) — back undoes it'); });
            q('#skOrder').addEventListener('change', e => { this.snapshot(); this.cfg.order = e.target.value; this.save(); this.render(); });
            q('#skORe').addEventListener('click', () => { this.snapshot(); this.useSeed('oSeed', this.nextSeed('oSeed')); this.save(); this.render(); });
            q('#skRhyW').addEventListener('input', e => { this.cfg.rhythmW = +e.target.value; this.save(); this.render(); });
        }
        ctl.querySelector('#skRhyW').value = this.cfg.rhythmW || 480; ctl.querySelector('#skTimeX').value = this.cfg.timeX; ctl.querySelector('#skShape').value = this.cfg.shape; ctl.querySelector('#skAmt').value = this.cfg.amount; ctl.querySelector('#skJit').value = this.cfg.jitterMs; ctl.querySelector('#skOrder').value = this.cfg.order;
        // dots: click one, then another = swap their slots; a dot on the keyboard then a player row = assign
        svg.querySelectorAll('.skRDot').forEach(dd => dd.addEventListener('click', ev => {
            const i = +dd.dataset.i;
            if (ev.shiftKey) { this.snapshot(); this.voices[i].solo = !this.voices[i].solo; this.render(); return; }
            if (this.swapFirst == null) { this.swapFirst = i; this.render(); return; }
            const a = this.voices[this.swapFirst], b = this.voices[i]; this.swapFirst = null;
            if (a !== b) { this.snapshot(); const t = a.slot; a.slot = b.slot; b.slot = t; this.cfg.order = 'manual'; }
            this.render();
        }));
        // a keyboard dot click also arms "assign to the next clicked player"
        this.el.querySelectorAll('#skKb .skDot').forEach(dd => dd.addEventListener('dblclick', ev => { ev.stopPropagation(); this.pendingVoice = +dd.dataset.i; this.setStatus('voice ' + nm(this.voices[this.pendingVoice].pitch) + ' armed — click a player row: it plays this note instead of what it had (that note swaps back) · shift-click adds'); }));
    },
    renderLines() {
        const svg = this.el.querySelector('#skLines'), body = this.body;
        const kb = this.el.querySelector('#skKb'), rows = this.el.querySelectorAll('#skOrch .skRow');
        if (!kb || !rows.length) { svg.innerHTML = ''; return; }
        const bb = body.getBoundingClientRect();
        svg.setAttribute('width', body.scrollWidth); svg.setAttribute('height', body.scrollHeight);
        svg.style.width = body.scrollWidth + 'px'; svg.style.height = body.scrollHeight + 'px';
        let s = '';
        this.voices.forEach(v => {
            if (v.lane < 0) return;
            const dot = kb.querySelector('.skDot[data-i="' + v.i + '"]'); const row = rows[v.lane];
            if (!dot || !row) return;
            const land = row.querySelector('.skLand') || row;
            const a = dot.getBoundingClientRect(), b = land.getBoundingClientRect();
            const x1 = a.left + a.width - bb.left + body.scrollLeft, y1 = a.top + a.height / 2 - bb.top + body.scrollTop;
            const x2 = b.left + b.width / 2 - bb.left + body.scrollLeft, y2 = b.top + b.height / 2 - bb.top + body.scrollTop;
            const hot = this.hoverLane === v.lane, dim = this.hoverLane != null && !hot;
            s += '<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '" stroke="' + this.pcColor(v.pc) + '" stroke-width="' + (hot ? 2.2 : 1) + '" stroke-dasharray="' + (hot ? '5 3' : '3 3') + '" opacity="' + (hot ? 1 : dim ? 0.3 : 0.8) + '"/>';
        });
        svg.innerHTML = s;
    },

    // ------------------------------------------------------------------ hear (G)
    notesFor(mode) {
        const T = TRK(); const pianoLane = T.findIndex(t => t.instKey === 'piano');
        const out = []; const anySolo = this.voices.some(v => v.solo);
        this.timed().forEach(q => {
            const v = q.v; const vel = clamp(Math.round((this.cfg.flatten ? 127 : v.vel) * this.cfg.dynX), 1, 127);
            if (anySolo && !v.solo) return;                       // U3: while anything is soloed, only the soloed voices sound
            if (mode === 'piano') { out.push({ lane: pianoLane, tech: plainTech(this.instOf(pianoLane)), midi: v.pitch, vel, onMs: q.onMs, durMs: q.durMs }); return; }
            if (v.lane >= 0 && !v.skip) out.push({ lane: v.lane, tech: v.tech || plainTech(this.instOf(v.lane)), midi: this.soundingPitch(v), vel, onMs: q.onMs, durMs: q.durMs });
            if (v.piano && v.lane !== pianoLane) out.push({ lane: pianoLane, tech: plainTech(this.instOf(pianoLane)), midi: v.pitch, vel, onMs: q.onMs, durMs: q.durMs });
        });
        return out;
    },
    async play(mode) {
        const e = E_(); if (!this.strike) return;
        e.panic();
        if (!await e.ensureMidi()) { this.setStatus(e._midiError || 'MIDI unavailable', true); return; }
        const notes = this.notesFor(mode);
        const routes = {}, missing = {}; let skipped = 0;
        notes.forEach(n => { const k = n.lane + '|' + n.tech; if (!(k in routes)) { const r = e.routeFor(n.lane, n.tech); routes[k] = r || null; if (!r) { const inst = this.instOf(n.lane); missing[(inst && inst.port) || ('lane ' + n.lane)] = 1; } } if (!routes[k]) skipped++; });
        if (!notes.length || skipped === notes.length) { this.setStatus(Object.keys(missing).length ? 'no MIDI port for ' + Object.keys(missing).join(', ') : 'nothing to play — shuffle or assign first', true); return; }
        Object.values(routes).forEach(r => { if (r) try { r.out.send([0xB0 | r.ch, 7, 127]); } catch (x) {} });
        this.base = performance.now() + LEAD_MS; e._playing = true;
        const span = notes.reduce((m, n) => Math.max(m, n.onMs + n.durMs), 0) + 400;
        notes.forEach(n => {
            const r = routes[n.lane + '|' + n.tech]; if (!r) return;
            const on = this.base + n.onMs, off = on + n.durMs;
            if (r.tech && r.tech.cc0 != null) e._timers.push(setTimeout(() => { try { r.out.send([0xB0 | r.ch, 0, r.tech.cc0]); } catch (x) {} }, Math.max(0, on - CC0_LEAD_MS - performance.now())));
            e._timers.push(setTimeout(() => e.noteOn(r, n.midi, n.vel), Math.max(0, on - performance.now())));
            e._timers.push(setTimeout(() => e.noteOff(r, n.midi), Math.max(0, off - performance.now())));
        });
        e._timers.push(setTimeout(() => e.panic(), span + 700));
        this.startPlayhead(span);
        this.setStatus('hearing ' + (mode === 'piano' ? 'the harmony on the piano' : 'orchestrated') + ' · ' + (notes.length - skipped) + ' notes' + (skipped ? ' · ' + skipped + ' had no port' : ''));
    },
    async hearOne(lane, techKey, midi) {
        const e = E_(); e.panic();
        if (!await e.ensureMidi()) { this.setStatus(e._midiError || 'MIDI unavailable', true); return; }
        const r = e.routeFor(lane, techKey); if (!r) { this.setStatus('no port for that player', true); return; }
        try { r.out.send([0xB0 | r.ch, 7, 127]); if (r.tech && r.tech.cc0 != null) r.out.send([0xB0 | r.ch, 0, r.tech.cc0]); } catch (x) {}
        e._playing = true;
        e._timers.push(setTimeout(() => e.noteOn(r, midi, 100), 60));
        e._timers.push(setTimeout(() => e.noteOff(r, midi), 60 + 800));
        e._timers.push(setTimeout(() => e.panic(), 1600));
    },
    startPlayhead(spanMs) {
        this.stopPlayhead(); const head = this.el.querySelector('#skPlayhead'); head.style.display = '';
        this.ph = setInterval(() => { const el = performance.now() - this.base; head.textContent = el < 0 ? '▶' : '▶ ' + (el / 1000).toFixed(2) + ' s'; if (el > spanMs) this.stopPlayhead(); }, 60);
    },
    stopPlayhead() { if (this.ph) { clearInterval(this.ph); this.ph = null; } const head = this.el && this.el.querySelector('#skPlayhead'); if (head) { head.style.display = 'none'; head.textContent = '▶'; } },
    onStopped() { this.stopPlayhead(); },

    // ------------------------------------------------------------------ insert / replace (Q)
    insert(replace) {
        const C = C_(); if (!C || !this.strike) return;
        const notes = this.notesFor('orch');
        if (!notes.length) { this.setStatus('nothing to insert — shuffle or assign first', true); return; }
        let t = +C.getTimeAtPlayhead().toFixed(3);
        let replaceMsg = '';
        if (replace) {
            // Q v2 (composer, 2026-09-04: "have the time code carry with the strike … it'll put it in its
            // original time, but I don't have to open the scattered strikes 01 save file"): the strike is
            // written at its own t0 into WHATEVER score is open. Originals are removed only where they truly
            // exist — same id AND lane AND pitch AND onset (within 25 ms) — never by id alone (wc-40 exists in
            // every score). In the source save or a copy of it that replaces them; elsewhere it just inserts.
            t = this.strike.t0;
            const want = new Map(this.strike.notes.map(nn => [nn.objectId, nn]));
            const isOriginal = o => { const nn = want.get(o.id); return !!nn && o.layer === nn.layer && o.sonifyNote === nn.midi && Math.abs((+o.startSeconds || 0) - (this.strike.t0 + nn.dtMs / 1000)) < 0.025; };
            const before = C.objects.length;
            C.pushUndoState();
            C.objects = C.objects.filter(o => !isOriginal(o));
            const gone = before - C.objects.length;
            replaceMsg = gone ? (' · replaced ' + gone + ' original notes') : ' · no originals in this score';
        } else C.pushUndoState();
        const group = 'grp-strike-' + this.strike.index + '-' + Math.floor(t * 10) + (replace ? 'r' : '');
        let maxEnd = t;
        notes.forEach(n => {
            const start = t + n.onMs / 1000, dur = n.durMs / 1000; maxEnd = Math.max(maxEnd, start + dur);
            const lv = Math.max(1, Math.round((n.vel / 127) * 100) / 10);
            C.objects.push({ id: 'wc-' + (C.nextId++), type: 'waveCurve', layer: n.lane, groupId: group,
                startSeconds: +start.toFixed(3), endSeconds: +(start + dur).toFixed(3),
                nodes: [{ pos: 0, y: lv, smooth: 0.25 }, { pos: 1, y: lv, smooth: 0.25 }], segments: [{ model: 'power', slope: 0 }],
                color: '#C9A05A', fillMode: 'bottom', opacity: 0.55, performanceNotes: 'strike #' + this.strike.index + ' (' + this.strike.id + ')', properties: {}, srcKind: 'strike',
                sonifyNote: n.midi, technique: n.tech, sonifyMode: 'plain', recVel: n.vel });
        });
        C.objects.push({ id: 'wc-' + (C.nextId++), type: 'waveCurve', layer: METAL(), groupId: group, startSeconds: t, endSeconds: +maxEnd.toFixed(3),
            nodes: [{ pos: 0, y: 8.5, smooth: 0 }, { pos: 1, y: 8.5, smooth: 0 }], segments: [{ model: 'power', slope: 0 }],
            color: '#C9A05A', fillMode: 'bottom', opacity: 0.6, performanceNotes: 'strike #' + this.strike.index + ' (drag = move, box = stretch)', properties: {} });
        C.lastInsertGroup = group;
        if (typeof C.openMetaWin === 'function') C.openMetaWin();
        C.renderAll(); C.markDirty();
        this.setStatus('inserted ' + notes.length + ' notes at ' + t.toFixed(2) + ' s' + (replace ? ' (original time)' : ' (playhead)') + ' as ' + group + replaceMsg);
    },

    // ------------------------------------------------------------------ back / takes (O)
    state() { return JSON.parse(JSON.stringify({ strikeId: this.cfg.strikeId, cfg: this.cfg, voices: this.voices.map(v => ({ i: v.i, pitch: v.pitch, lane: v.lane, fold: v.fold, tech: v.tech, standIn: v.standIn, piano: v.piano, solo: !!v.solo, slot: v.slot, skip: !!v.skip })) })); },
    applyState(st) {
        if (!st || !this.strike || st.strikeId !== this.strike.id) { if (st && st.strikeId && this.db && this.db.strikes[st.strikeId]) { this.select(st.strikeId); } if (!st || st.strikeId !== (this.strike && this.strike.id)) return; }
        Object.assign(this.cfg, st.cfg); this.cfg.strikeId = this.strike.id;
        st.voices.forEach(sv => { const v = this.voices[sv.i]; if (!v) return; Object.assign(v, { pitch: sv.pitch, lane: sv.lane, fold: sv.fold, tech: sv.tech, standIn: sv.standIn, piano: sv.piano, solo: !!sv.solo, slot: sv.slot, skip: sv.skip }); });
        this.writeFields(); this.render();
    },
    snapshot() { this.prev = this.state(); },
    back() { if (!this.prev) { this.setStatus('nothing to go back to'); return; } const p = this.prev; this.prev = null; this.applyState(p); this.setStatus('back one step'); },
    // O v2 (composer, 2026-09-04: "lets keep those save files as well"): takes live in bank/panel_snapshots.json
    // through /api/snapshots (panel 'strikes') — the file the other panels use and git carries — not in the
    // browser. `state` is opaque to the server; `saved` is stamped there. The v1 localStorage takes are copied
    // over once (migrateTakes); the browser copy is kept under a '.migrated' key, never deleted.
    takeList: {},
    async refreshTakes() {
        try {
            const file = await fetch('/api/snapshots', { cache: 'no-store' }).then(x => x.json());
            this.takeList = (file && file.panels && file.panels[TAKES_PANEL]) || {};
        } catch (e) { this.takeList = {}; this.setStatus('take list failed: ' + e.message + ' (is node score/server.js running?)', true); }
        this.fillTakes();
    },
    takeNames() { const t = this.takeList; return Object.keys(t).sort((a, b) => String(t[b].saved || '').localeCompare(String(t[a].saved || ''))); },
    fillTakes() { const sel = this.el.querySelector('#skTakeSel'); if (!sel) return; sel.innerHTML = '<option value="">load take…</option>' + this.takeNames().map(nme => '<option value="' + nme.replace(/"/g, '&quot;') + '">' + nme + '</option>').join(''); },
    async postTake(body) {
        const r = await fetch('/api/snapshots', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(Object.assign({ panel: TAKES_PANEL }, body)) }).then(x => x.json());
        if (!r.success) throw new Error(r.error || '?');
        return r;
    },
    takeComment() { return this.strike ? ('strike #' + this.strike.index + ' · ' + this.strike.source) : ''; },
    async saveTake() {
        const box = this.el.querySelector('#skTakeName'), d = new Date(), pad = x => String(x).padStart(2, '0');
        const name = (box.value || '').trim() || ('take ' + d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) + ' ' + pad(d.getHours()) + pad(d.getMinutes()));
        if (!TAKE_NAME.test(name)) { this.setStatus('take not saved: a name is 1–64 letters, digits, dot, underscore, space or hyphen — got "' + name + '"', true); return; }
        try {
            const r = await this.postTake({ name, comment: this.takeComment(), state: this.state() });
            box.value = name; await this.refreshTakes();
            this.setStatus('take saved: ' + name + (r.existed ? ' (replaced)' : '') + ' · ' + r.panels + ' take' + (r.panels === 1 ? '' : 's') + ' in bank/panel_snapshots.json (committed at the wrap)');
        } catch (e) { this.setStatus('take not saved: ' + e.message, true); }
    },
    loadTake(name) {
        const t = this.takeList[name]; if (!t) { this.setStatus('no take named "' + name + '"', true); return; }
        this.snapshot(); this.applyState(t.state);
        const box = this.el.querySelector('#skTakeName'); if (box) box.value = name;
        this.setStatus('take loaded: ' + name + (t.comment ? ' · ' + t.comment : '') + ' · saved ' + String(t.saved || '').slice(0, 16).replace('T', ' '));
    },
    async deleteTake() {
        const box = this.el.querySelector('#skTakeName'), name = (box.value || '').trim();
        if (!name || !this.takeList[name]) { this.setStatus('type or load the name of the take to delete', true); return; }
        if (!window.confirm('Delete take "' + name + '" from bank/panel_snapshots.json?')) return;
        try { const r = await this.postTake({ name, delete: true }); box.value = ''; await this.refreshTakes(); this.setStatus('take deleted: ' + name + ' · ' + r.panels + ' left'); }
        catch (e) { this.setStatus('delete failed: ' + e.message, true); }
    },
    async migrateTakes() {
        let old = []; try { old = JSON.parse(localStorage.getItem(TAKES) || '[]'); } catch (e) { old = []; }
        if (!Array.isArray(old) || !old.length) return;
        const done = [], skipped = [];
        for (const t of old) {
            const name = (String(t.name || 'take').replace(/[^A-Za-z0-9._ -]/g, '-').slice(0, 64).trim()) || 'take';
            if (this.takeList[name]) { skipped.push(name); continue; }
            try {
                await this.postTake({ name, comment: 'from the browser, saved ' + String(t.time || '').slice(0, 16).replace('T', ' ') + (name !== t.name ? ' (was "' + t.name + '")' : ''), state: t.state });
                done.push(name + (name !== t.name ? ' (was "' + t.name + '")' : ''));
            } catch (e) { this.setStatus('take migration stopped at "' + name + '": ' + e.message + ' — the browser copies are kept', true); return; }
        }
        try { localStorage.setItem(TAKES + '.migrated', localStorage.getItem(TAKES)); localStorage.removeItem(TAKES); } catch (e) {}
        await this.refreshTakes();
        this.setStatus('takes moved to bank/panel_snapshots.json: ' + (done.join(', ') || 'none') + (skipped.length ? ' · already there: ' + skipped.join(', ') : ''));
    },

    // ------------------------------------------------------------------ misc
    save() { try { localStorage.setItem(STORE, JSON.stringify(this.cfg)); } catch (e) {} },
    restore() { try { const s = JSON.parse(localStorage.getItem(STORE) || 'null'); if (s) Object.assign(this.cfg, s); } catch (e) {} },
    setStatus(msg, bad) { const s = this.el.querySelector('#skStatus'); s.textContent = msg; s.style.color = bad ? '#e88' : '#9a9'; },
};

root.StrikeDrawer = D;
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => D.init());
else D.init();

}(typeof self !== 'undefined' ? self : this));
