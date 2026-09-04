// strike_panel.js — PLAN 1c.2, the STRIKES panel: the scattered-strike database, reorchestrated
// by hand and heard through the rack, then inserted at the playhead.
//
// The composer's ask (RUNNING_LOG §33): "a way to reorchestrate these and hear them in the
// ensemble, an easy way where I can rearrange, place different notes to different instruments,
// change octaves, change articulations … right in the composer score."
//
// STRUCTURALLY THIS IS multitempo_panel.js (which is pulse_seq_panel.js): the same anchoring,
// the same draggable window, the same MIDI glue (MorphEmit.ensureMidi / routeFor / noteOn /
// noteOff, panic() the one stop path, timers in E._timers), the same absolute time base for the
// schedule. What changes is the material: one STRIKE from bank/scattered_strikes.json — every
// note with its displacement — and a table where each note gets an instrument, an octave
// shift and a technique. Time transforms: rhythm-only (each note at its redaction group's
// onset), time × (stretch), warp (an exponent over the strike's span: > 1 crowds the start,
// < 1 crowds the end). Insert writes the blast-insert object shape (NAMING.md §2: groupId on
// every member, the META shape on META_LAYER, sonifyMode 'plain', recVel) at the playhead.
//
// Per-note technique on a one-channel lane means the CC0 preset select is sent per note, a
// few ms before its note-on (Xsample switches presets in the moment — #3's XC1). Until 0c.7
// wires the curve channels everything rides channel 1, as the app itself does.
(function (root) {
'use strict';

// Composer is a script-level const in composer.html too (global lexical scope, not window.Composer)
const HOST = () => (typeof Composer !== 'undefined' ? Composer : (root.Composer || null));
// TRACKS / META_LAYER are script-level consts in composer.html — global lexical scope, not window properties
const TRK = () => (typeof TRACKS !== 'undefined' ? TRACKS : (root.TRACKS || []));
const METAL = () => (typeof META_LAYER !== 'undefined' ? META_LAYER : root.META_LAYER);
const E = () => (typeof MorphEmit !== 'undefined' ? MorphEmit : (root.MorphEmit || null));
const STORE = 'septet.strikePanel.v1';
const DB_URL = '/bank/scattered_strikes.json';
const LEAD_MS = 250;      // the morph layer's measured cold-attack settle (CC7 pinned, CC0 sent)
const CC0_LEAD_MS = 30;   // preset select ahead of its note

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const nameOf = m => NOTE_NAMES[((m % 12) + 12) % 12] + (Math.floor(m / 12) - 1);

// the "plain note" technique per instrument — the main channel's everyday sound
const PLAIN_PREF = ['ord', 'main', 'senza_vel', 'senza_mw', 'staccato'];
function plainTech(inst) {
    const techs = (inst && inst.techniques) || [];
    for (const k of PLAIN_PREF) { const t = techs.find(q => q.key === k); if (t) return t.key; }
    return techs.length ? techs[0].key : null;
}

const PANEL = {
    el: null, db: null, strike: null, rows: [], base: 0, ph: null,
    cfg: { strikeId: null, timeX: 1, warp: 1, rhythmOnly: false, loop: false },

    init() {
        const host = document.getElementById('mtBtn') || document.getElementById('pulseBtn') ||
                     document.getElementById('textureBtn') || document.getElementById('morphBtn') ||
                     document.getElementById('blastsBtn');
        if (!host) { console.warn('[strike_panel] no button to anchor to'); return; }
        const btn = document.createElement('button');
        btn.id = 'strikesBtn';
        btn.textContent = 'Strikes';
        btn.title = 'the scattered-strike database: pick a strike, reassign instruments / octaves / techniques, hear it, insert at the playhead';
        btn.addEventListener('click', () => this.toggle());
        host.parentNode.insertBefore(btn, host.nextSibling);
        this.restore();
        this.build();
    },

    build() {
        const d = document.createElement('div');
        d.id = 'strikePanel';
        d.tabIndex = -1;
        d.style.cssText = [
            'position:fixed', 'right:16px', 'top:120px', 'width:560px', 'max-height:82vh', 'overflow:auto', 'z-index:9000',
            'background:rgba(28,28,32,0.97)', 'border:1px solid #C9A05A', 'border-radius:6px',
            'padding:10px 12px', 'color:#ddd', 'font:11px/1.45 system-ui,sans-serif',
            'box-shadow:0 6px 24px rgba(0,0,0,0.5)', 'display:none',
        ].join(';');
        const inp = 'background:#1b1b20;color:#ddd;border:1px solid #444;padding:1px 4px';
        d.innerHTML = [
            '<div id="skDrag" style="cursor:move;font-weight:600;color:#e8cf9a;margin:-10px -12px 8px;padding:7px 12px;',
            'border-bottom:1px solid #444;background:rgba(201,160,90,0.18)">STRIKES &nbsp;<span style="color:#a89066;font-weight:400">',
            'the scattered-strike database &mdash; reorchestrate, hear, insert</span>',
            '<span id="skClose" style="float:right;cursor:pointer;color:#888">&#10005;</span></div>',
            '<div id="skStatus" style="color:#9a9;margin-bottom:7px">idle</div>',

            '<div style="display:flex;gap:8px;align-items:center;margin-bottom:6px;flex-wrap:wrap">',
            '<label>strike <select id="skPick" style="max-width:300px;' + inp + '"></select></label>',
            '<button id="skReload" title="re-read bank/scattered_strikes.json">&#8635;</button>',
            '<span id="skInfo" style="color:#9a9"></span>',
            '</div>',

            '<div style="display:flex;gap:10px;align-items:center;margin-bottom:6px;flex-wrap:wrap">',
            '<label title="multiplies every displacement (and the durations)">time &times; <input id="skTimeX" type="number" min="0.05" max="20" step="0.05" style="width:56px;' + inp + '"></label>',
            '<label title="exponent over the strike\'s span: 1 = as played; > 1 crowds the start, < 1 crowds the end">warp <input id="skWarp" type="number" min="0.1" max="10" step="0.1" style="width:52px;' + inp + '"></label>',
            '<label title="every note at its redaction group\'s onset (the rhythm after the 60 ms threshold) instead of its own"><input id="skRhythm" type="checkbox"> rhythm only</label>',
            '<label><input id="skLoop" type="checkbox"> loop</label>',
            '<button id="skSpread" title="starting point: notes low&rarr;high across the seven lanes, each on its plain technique">spread</button>',
            '<button id="skAsPlayed" title="back to the save: every note on its recorded lane and technique">as played</button>',
            '</div>',

            '<div id="skTable" style="margin-bottom:8px"></div>',

            '<div style="display:flex;gap:8px;align-items:center">',
            '<button id="skPlay" style="width:84px">Hear</button>',
            '<button id="skStop" style="width:60px">Stop</button>',
            '<button id="skInsert" title="write the strike as a gesture at the playhead: a groupId on every note and the META shape" style="width:120px">Insert @ playhead</button>',
            '<span id="skPlayhead" style="display:none;color:#e8cf9a">&#9654;</span>',
            '</div>',
        ].join('');
        document.body.appendChild(d);
        this.el = d;
        this.makeDraggable(d, d.querySelector('#skDrag'));
        d.querySelector('#skClose').addEventListener('click', () => this.toggle(false));
        d.querySelector('#skReload').addEventListener('click', () => this.loadDb(true));
        d.querySelector('#skPick').addEventListener('change', e => this.select(e.target.value));
        d.querySelector('#skTimeX').addEventListener('change', e => { this.cfg.timeX = Math.max(0.05, +e.target.value || 1); this.save(); this.report(); });
        d.querySelector('#skWarp').addEventListener('change', e => { this.cfg.warp = Math.max(0.1, +e.target.value || 1); this.save(); this.report(); });
        d.querySelector('#skRhythm').addEventListener('change', e => { this.cfg.rhythmOnly = e.target.checked; this.save(); this.report(); });
        d.querySelector('#skLoop').addEventListener('change', e => { this.cfg.loop = e.target.checked; this.save(); });
        d.querySelector('#skSpread').addEventListener('click', () => this.spread());
        d.querySelector('#skAsPlayed').addEventListener('click', () => this.asPlayed());
        d.querySelector('#skPlay').addEventListener('click', () => this.play());
        d.querySelector('#skStop').addEventListener('click', () => { const e = E(); if (e) e.panic(); this.onStopped(); });
        d.querySelector('#skInsert').addEventListener('click', () => this.insert());
        // SPACE inside the panel = Hear / Stop, and never the score's transport
        d.addEventListener('keydown', ev => {
            if (ev.code === 'Space' && ev.target.tagName !== 'INPUT' && ev.target.tagName !== 'SELECT') {
                ev.preventDefault(); ev.stopPropagation();
                const e = E(); if (e && e._playing) { e.panic(); this.onStopped(); } else this.play();
            }
        });
        this.writeFields();
        const e = E();
        if (e) { const prev = e.onStop; e.onStop = () => { if (prev) prev(); this.onStopped(); }; }
    },

    makeDraggable(box, handle) {
        let sx = 0, sy = 0, bx = 0, by = 0, on = false;
        handle.addEventListener('mousedown', e => {
            if (e.target.id === 'skClose') return;
            on = true; sx = e.clientX; sy = e.clientY;
            const r = box.getBoundingClientRect(); bx = r.left; by = r.top;
            e.preventDefault();
        });
        document.addEventListener('mousemove', e => {
            if (!on) return;
            box.style.left = (bx + e.clientX - sx) + 'px';
            box.style.top = (by + e.clientY - sy) + 'px';
            box.style.right = 'auto';
        });
        document.addEventListener('mouseup', () => { on = false; });
    },

    preflight() {
        const C = HOST(), e = E(), bad = [];
        if (!C) bad.push('Composer not reachable');
        if (!e || typeof e.ensureMidi !== 'function') bad.push('MorphEmit.ensureMidi missing');
        if (!e || typeof e.routeFor !== 'function') bad.push('MorphEmit.routeFor missing');
        if (!e || typeof e.panic !== 'function') bad.push('MorphEmit.panic missing');
        if (C && typeof C.trackInstrument !== 'function') bad.push('Composer.trackInstrument missing');
        if (C && typeof C.getTimeAtPlayhead !== 'function') bad.push('Composer.getTimeAtPlayhead missing');
        if (!TRK().length || METAL() == null) bad.push('TRACKS / META_LAYER missing');
        if (bad.length) console.error('[strikes] PREFLIGHT FAILED:', bad);
        return bad;
    },

    toggle(force) {
        const show = force != null ? force : this.el.style.display === 'none';
        this.el.style.display = show ? '' : 'none';
        if (!show) { const e = E(); if (e) e.panic(); return; }
        const bad = this.preflight();
        this.el.focus();
        if (bad.length) { this.setStatus('PREFLIGHT: ' + bad.join(' · '), true); return; }
        this.loadDb(false);
    },

    // ------------------------------------------------------------- the database
    async loadDb(force) {
        if (this.db && !force) { this.fillPicker(); return; }
        try {
            const r = await fetch(DB_URL + '?t=' + Date.now(), { cache: 'no-store' });
            if (!r.ok) throw new Error('HTTP ' + r.status);
            this.db = await r.json();
        } catch (err) {
            this.setStatus('cannot read ' + DB_URL + ' — run tools/strike_db.js first (' + err.message + ')', true);
            return;
        }
        this.fillPicker();
    },

    strikeList() {
        const db = this.db; if (!db) return [];
        const seqs = Object.values(db.sequences || {});
        const list = [];
        seqs.forEach(seq => (seq.strikeIds || []).forEach(id => { const s = db.strikes[id]; if (s) list.push(s); }));
        Object.values(db.strikes || {}).forEach(s => { if (!list.includes(s)) list.push(s); });
        return list;
    },

    fillPicker() {
        const sel = this.el.querySelector('#skPick');
        const list = this.strikeList();
        sel.innerHTML = '';
        list.forEach(s => {
            const o = document.createElement('option');
            o.value = s.id;
            o.textContent = '#' + s.index + ' · ' + s.t0.toFixed(2) + ' s · ' + s.stats.noteCount + ' notes · ' +
                nameOf(s.stats.midi.min) + '–' + nameOf(s.stats.midi.max) + ' · ' + Math.round(s.spanMs) + ' ms' +
                (s.source ? ' · ' + s.source : '');
            sel.appendChild(o);
        });
        const want = this.cfg.strikeId && list.find(s => s.id === this.cfg.strikeId) ? this.cfg.strikeId : (list[0] && list[0].id);
        if (want) { sel.value = want; this.select(want); }
        this.setStatus(list.length + ' strikes in the database' + (this.db.updated ? ' · updated ' + this.db.updated.slice(0, 16).replace('T', ' ') : ''));
    },

    // ------------------------------------------------------------- the table
    select(id) {
        const s = this.db && this.db.strikes[id];
        if (!s) return;
        this.strike = s;
        this.cfg.strikeId = id; this.save();
        // one row per note, starting AS PLAYED; group index = the redaction group the note merged into
        const groupOf = {};
        (s.rhythm.groups || []).forEach((g, gi) => g.objectIds.forEach(oid => { groupOf[oid] = gi; }));
        this.rows = s.notes.map(n => {
            const lane = this.laneOfInstKey(n.instKey);
            return { note: n, lane: lane >= 0 ? lane : 0, oct: 0, tech: n.technique || plainTech(this.instOf(lane >= 0 ? lane : 0)), group: groupOf[n.objectId] || 0 };
        });
        this.drawTable();
        this.report();
    },

    laneOfInstKey(k) { const T = TRK(); return T.findIndex(t => t.instKey === k); },
    instOf(lane) { const C = HOST(); return C && C.trackInstrument ? C.trackInstrument(lane) : null; },
    midiOf(row) { return row.note.midi + 12 * row.oct; },
    inRange(row) {
        const C = HOST();
        if (!C || typeof C.laneCanPlay !== 'function') return true;
        return C.laneCanPlay(row.lane, this.midiOf(row));
    },

    drawTable() {
        const T = TRK();
        const box = this.el.querySelector('#skTable');
        const inp = 'background:#1b1b20;color:#ddd;border:1px solid #444;padding:0 2px;font-size:11px';
        const head = '<div style="display:grid;grid-template-columns:34px 56px 52px 40px 112px 60px 1fr;gap:4px;color:#9a9;margin-bottom:3px">' +
            '<span>#</span><span>note</span><span>dt ms</span><span>vel</span><span>instrument</span><span>octave</span><span>technique</span></div>';
        const rows = this.rows.map((r, i) => {
            const inst = this.instOf(r.lane);
            const techs = (inst && inst.techniques) || [];
            const ok = this.inRange(r);
            return '<div class="skRow" data-i="' + i + '" style="display:grid;grid-template-columns:34px 56px 52px 40px 112px 60px 1fr;gap:4px;align-items:center;margin-bottom:2px;' +
                (ok ? '' : 'background:rgba(220,60,60,0.18);') + '">' +
                '<span style="color:#777">' + i + '<sup style="color:#a89066">' + r.group + '</sup></span>' +
                '<span title="as played: ' + nameOf(r.note.midi) + '">' + nameOf(this.midiOf(r)) + ' <span style="color:#777">' + this.midiOf(r) + '</span></span>' +
                '<span style="color:#bbb">' + Math.round(r.note.dtMs) + '</span>' +
                '<span style="color:#bbb">' + (r.note.vel != null ? r.note.vel : '·') + '</span>' +
                '<select class="skLane" style="' + inp + '">' + T.map((t, li) => '<option value="' + li + '"' + (li === r.lane ? ' selected' : '') + '>' + t.label + '</option>').join('') + '</select>' +
                '<select class="skOct" style="' + inp + '">' + [-3, -2, -1, 0, 1, 2, 3].map(o => '<option value="' + o + '"' + (o === r.oct ? ' selected' : '') + '>' + (o > 0 ? '+' : '') + o + '</option>').join('') + '</select>' +
                '<select class="skTech" style="' + inp + ';max-width:100%">' + techs.map(t => '<option value="' + t.key + '"' + (t.key === r.tech ? ' selected' : '') + '>' + t.label + '</option>').join('') + '</select>' +
                '</div>';
        }).join('');
        box.innerHTML = head + rows;
        box.querySelectorAll('.skRow').forEach(el => {
            const i = +el.dataset.i, r = this.rows[i];
            el.querySelector('.skLane').addEventListener('change', e => {
                r.lane = +e.target.value;
                const inst = this.instOf(r.lane);
                const techs = (inst && inst.techniques) || [];
                if (!techs.find(t => t.key === r.tech)) r.tech = plainTech(inst);
                this.drawTable(); this.report();
            });
            el.querySelector('.skOct').addEventListener('change', e => { r.oct = +e.target.value; this.drawTable(); this.report(); });
            el.querySelector('.skTech').addEventListener('change', e => { r.tech = e.target.value; this.report(); });
        });
    },

    // starting point: notes low→high over the lanes low→high (cello … flute), plain technique each
    spread() {
        if (!this.rows.length) return;
        const T = TRK();
        const order = [...this.rows.keys()].sort((a, b) => this.rows[a].note.midi - this.rows[b].note.midi);
        const n = T.length;
        order.forEach((ri, k) => {
            const lane = n - 1 - Math.floor(k * n / order.length);   // lowest notes to the last lane (cello), highest to the first (flute)
            const r = this.rows[ri];
            r.lane = lane; r.oct = 0; r.tech = plainTech(this.instOf(lane));
            // pull the note into the lane's range by octaves when it is outside
            const C = HOST();
            if (C && typeof C.laneCanPlay === 'function') {
                for (let tries = 0; tries < 4 && !C.laneCanPlay(lane, this.midiOf(r)); tries++) {
                    const inst = this.instOf(lane);
                    if (!inst) break;
                    r.oct += this.midiOf(r) < (inst.rangeLow || 0) ? 1 : -1;
                }
            }
        });
        this.drawTable(); this.report();
    },
    asPlayed() { if (this.strike) this.select(this.strike.id); },

    // ------------------------------------------------------------- the timing
    // returns [{row, onMs, durMs}] for the current transforms
    timed() {
        const s = this.strike; if (!s) return [];
        const span = s.spanMs || 0;
        const k = this.cfg.warp || 1, x = this.cfg.timeX || 1;
        return this.rows.map(r => {
            let dt = this.cfg.rhythmOnly ? (s.rhythm.groups[r.group] ? s.rhythm.groups[r.group].dtMs : r.note.dtMs) : r.note.dtMs;
            if (span > 0 && k !== 1) dt = span * Math.pow(dt / span, k);
            return { row: r, onMs: dt * x, durMs: Math.max(40, (r.note.durMs || 100) * x) };
        });
    },

    report() {
        if (!this.strike) return;
        const t = this.timed();
        const last = t.reduce((m, q) => Math.max(m, q.onMs + q.durMs), 0);
        const out = this.rows.filter(r => !this.inRange(r)).length;
        const lanes = new Set(this.rows.map(r => r.lane)).size;
        this.el.querySelector('#skInfo').textContent =
            this.rows.length + ' notes · ' + lanes + ' lanes · ' + Math.round(last) + ' ms' + (out ? ' · ' + out + ' out of range (red, skipped)' : '');
        const T = TRK();
        this.el.querySelector('#skStatus').style.color = '#9a9';
    },

    // ------------------------------------------------------------- hear
    async play() {
        const e = E(), C = HOST();
        if (!this.strike) { this.setStatus('pick a strike', true); return; }
        const btn = this.el.querySelector('#skPlay');
        btn.textContent = 'starting…';
        e.panic();
        if (!await e.ensureMidi()) { btn.textContent = 'Hear'; this.setStatus(e._midiError || 'MIDI unavailable', true); return; }
        const plan = this.timed().filter(q => this.inRange(q.row));
        const routes = {}, missing = {};
        let skipped = 0;
        plan.forEach(q => {
            const key = q.row.lane + '|' + q.row.tech;
            if (!(key in routes)) {
                const r = e.routeFor(q.row.lane, q.row.tech);
                routes[key] = r || null;
                if (!r) { const inst = this.instOf(q.row.lane); missing[(inst && inst.port) || ('lane ' + q.row.lane)] = 1; }
            }
            if (!routes[key]) skipped++;
        });
        if (!plan.length || skipped === plan.length) {
            btn.textContent = 'Hear';
            this.setStatus(Object.keys(missing).length ? 'no MIDI port for ' + Object.keys(missing).join(', ') : 'nothing playable', true);
            return;
        }
        // CC7 pinned per route (velocity carries the dynamic, as the blasts were auditioned)
        Object.values(routes).forEach(r => { if (r) try { r.out.send([0xB0 | r.ch, 7, 127]); } catch (err) {} });
        this.base = performance.now() + LEAD_MS;
        e._playing = true;
        this.scheduleOnce(plan, routes, 0);
        btn.textContent = 'Playing…';
        this.setStatus('hearing ' + (plan.length - skipped) + ' notes' + (skipped ? ' · ' + skipped + ' had no port' : '') + (this.cfg.loop ? ' · looping' : ''));
    },

    scheduleOnce(plan, routes, k) {
        const e = E();
        const span = plan.reduce((m, q) => Math.max(m, q.onMs + q.durMs), 0) + 400;
        const t0 = this.base + k * span;
        plan.forEach(q => {
            const r = routes[q.row.lane + '|' + q.row.tech];
            if (!r) return;
            const midi = this.midiOf(q.row), vel = q.row.note.vel != null ? q.row.note.vel : 100;
            const on = t0 + q.onMs, off = on + q.durMs;
            if (r.tech && r.tech.cc0 != null) e._timers.push(setTimeout(() => { try { r.out.send([0xB0 | r.ch, 0, r.tech.cc0]); } catch (err) {} }, Math.max(0, on - CC0_LEAD_MS - performance.now())));
            e._timers.push(setTimeout(() => e.noteOn(r, midi, vel), Math.max(0, on - performance.now())));
            e._timers.push(setTimeout(() => e.noteOff(r, midi), Math.max(0, off - performance.now())));
        });
        this.startPlayhead(span);
        e._timers.push(setTimeout(() => {
            if (!e._playing) return;
            if (this.cfg.loop) this.scheduleOnce(plan, routes, k + 1);
            else e._timers.push(setTimeout(() => e.panic(), 700));
        }, Math.max(0, t0 + span - 150 - performance.now())));
    },

    startPlayhead(spanMs) {
        this.stopPlayhead();
        const head = this.el.querySelector('#skPlayhead');
        head.style.display = '';
        this.ph = setInterval(() => {
            const el = performance.now() - this.base;
            head.textContent = el < 0 ? '▶' : '▶ ' + ((el % spanMs) / 1000).toFixed(2) + ' s';
        }, 60);
    },
    stopPlayhead() {
        if (this.ph) { clearInterval(this.ph); this.ph = null; }
        const head = this.el && this.el.querySelector('#skPlayhead');
        if (head) { head.style.display = 'none'; head.textContent = '▶'; }
    },
    onStopped() {
        this.stopPlayhead();
        const btn = this.el && this.el.querySelector('#skPlay');
        if (btn) btn.textContent = 'Hear';
    },

    // ------------------------------------------------------------- insert
    insert() {
        const C = HOST();
        if (!C || !this.strike) return;
        const t = +C.getTimeAtPlayhead().toFixed(3);
        const plan = this.timed().filter(q => this.inRange(q.row));
        if (!plan.length) { this.setStatus('nothing in range to insert', true); return; }
        const group = 'grp-strike-' + this.strike.index + '-' + Math.floor(t * 10);
        C.pushUndoState();
        let maxEnd = 0;
        plan.forEach(q => {
            const start = t + q.onMs / 1000, dur = q.durMs / 1000;
            const vel = q.row.note.vel != null ? q.row.note.vel : 100;
            const lv = Math.max(1, Math.round((vel / 127) * 100) / 10);
            maxEnd = Math.max(maxEnd, start + dur);
            C.objects.push({ id: 'wc-' + (C.nextId++), type: 'waveCurve', layer: q.row.lane, groupId: group,
                startSeconds: +start.toFixed(3), endSeconds: +(start + dur).toFixed(3),
                nodes: [{ pos: 0, y: lv, smooth: 0.25 }, { pos: 1, y: lv, smooth: 0.25 }],
                segments: [{ model: 'power', slope: 0 }],
                color: '#C9A05A', fillMode: 'bottom', opacity: 0.55,
                performanceNotes: 'strike #' + this.strike.index + ' (' + this.strike.id + ')', properties: {}, srcKind: 'strike',
                sonifyNote: this.midiOf(q.row), technique: q.row.tech, sonifyMode: 'plain', recVel: vel });
        });
        C.objects.push({ id: 'wc-' + (C.nextId++), type: 'waveCurve', layer: METAL(), groupId: group,
            startSeconds: t, endSeconds: +maxEnd.toFixed(3),
            nodes: [{ pos: 0, y: 8.5, smooth: 0 }, { pos: 1, y: 8.5, smooth: 0 }],
            segments: [{ model: 'power', slope: 0 }],
            color: '#C9A05A', fillMode: 'bottom', opacity: 0.6,
            performanceNotes: 'strike #' + this.strike.index + ' (drag = move, box = stretch)', properties: {} });
        C.lastInsertGroup = group;
        if (typeof C.openMetaWin === 'function') C.openMetaWin();
        C.renderAll(); C.markDirty();
        this.setStatus('inserted ' + plan.length + ' notes at ' + t.toFixed(2) + ' s as ' + group);
    },

    // ------------------------------------------------------------- persistence
    writeFields() {
        this.el.querySelector('#skTimeX').value = this.cfg.timeX;
        this.el.querySelector('#skWarp').value = this.cfg.warp;
        this.el.querySelector('#skRhythm').checked = !!this.cfg.rhythmOnly;
        this.el.querySelector('#skLoop').checked = !!this.cfg.loop;
    },
    save() { try { localStorage.setItem(STORE, JSON.stringify(this.cfg)); } catch (e) {} },
    restore() { try { const s = JSON.parse(localStorage.getItem(STORE) || 'null'); if (s) Object.assign(this.cfg, s); } catch (e) {} },
    setStatus(msg, bad) {
        const s = this.el.querySelector('#skStatus');
        s.textContent = msg;
        s.style.color = bad ? '#e88' : '#9a9';
    },
};

root.StrikePanel = PANEL;
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => PANEL.init());
else PANEL.init();

}(typeof self !== 'undefined' ? self : this));
