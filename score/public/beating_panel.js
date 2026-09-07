// beating_panel.js — THE BEATING PANEL (PLAN 1f step 4, 2026-09-07; the requirements in docs/BEATING_TOOL.md §6; the composer's
// picture RUNNING_LOG §147: "a panel, and I can see the pair represented by some sort of curve … it'll be bipolar … I can slide one
// over … everything should have handles … hit space bar to play that configuration … audition that configuration over different
// durations"; the settled points of §156).
//
// A floating, draggable panel (the morph panel's chassis) holding a PATTERN of up to three pairs, one ROW each. In a row:
//   · the two players' RATE curves as mirror images above and below a centre line (beats per second, the heard beating = the gap);
//     the BAND between them filled and tinted by zone (flanger · beating · roughness); every point a handle on a rail (drag up /
//     down = the rate, left / right = its place; the ends stay at the ends); a shape from the menu (flat · ramp out · ramp in · hump ·
//     the long arc · burst) pops in; DRAW mode adds points by clicking (freehand, the trill's curve tool's gesture: points → the
//     line); the MIRROR LOCK on by default — drag one, the other mirrors; ALT-drag moves a curve alone; the body dragged sideways
//     slides the curve in time (the phase; both when locked); the rate in numbers at the handle while dragging;
//   · the CRESCENDO lane (the level 0 → 1, following the beating by default, or its own points from the menu / drawn);
//   · the BREATH lane per player: the marks as dotted go lines on sliders (drag to move — a hand mark, kept through a shuffle;
//     click to add; ALT-click to remove), the ceiling drawn as a bar from each mark and a warning past it, the three modes, a
//     shuffle (a new seed, the hand marks kept).
// A whole row slides in time against the others (the OFFSET rail). The DURATION box sets the pattern's length (the curves are over
// normalised time already; the marks scale, the breaths re-deal). SPACE with the panel open plays the pattern — all pairs, real
// time, timestamped through Composer.playBeatingEvents (the tick's own event path) — and stops on SPACE again. TAKES are named
// snapshots in bank/panel_snapshots.json (the `beatings` bucket, the strikes drawer's way).
// Two ways in: P on a selected beating BINDS the panel to that zone — its row IS the zone's block, every edit regenerates the zone
// live (debounced) — or the Beating button opens an empty pattern that lives in the panel until Insert (step 6).
// Composer, TRACKS, META_LAYER, INSTRUMENTS, BeatingCalc are script-level consts in composer.html — read as free identifiers.
(function (root) {
'use strict';

const C_ = () => (typeof Composer !== 'undefined' ? Composer : (root.Composer || null));
const BC_ = () => (typeof BeatingCalc !== 'undefined' ? BeatingCalc : (root.BeatingCalc || null));
const TRK = () => (typeof TRACKS !== 'undefined' ? TRACKS : (root.TRACKS || []));
const METAL = () => (typeof META_LAYER !== 'undefined' ? META_LAYER : root.META_LAYER);
const INST = () => (typeof INSTRUMENTS !== 'undefined' ? INSTRUMENTS : (root.INSTRUMENTS || {}));
const TAKES_PANEL = 'beatings';
const TAKE_NAME = /^[A-Za-z0-9._ -]{1,64}$/;
const MAX_ROWS = 3;
const W = 520, HR = 132, HL = 44, HB = 46, PADL = 34, PADR = 10;   // the row's drawing: width, the rate area, the level lane, the breath lane, the axis gutters
const ZONE_FILL = { flanger: 'rgba(150,150,170,0.22)', beating: 'rgba(123,63,228,0.30)', roughness: 'rgba(225,70,70,0.38)' };
const COL = { upper: '#ffb347', lower: '#69b7c9', level: '#7ec9a8', breath: '#e0e0e0', bad: '#e88' };
const SHAPES = [['flat', 'flat'], ['rampOut', 'ramp out'], ['rampIn', 'ramp in'], ['hump', 'hump'], ['arc', 'long arc'], ['burst', 'burst']];
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const r3 = v => Math.round(v * 1000) / 1000;
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
const nn = m => BC_().noteName(m);

const P = {
    el: null, rows: [], length: 6, bound: null, takeList: {}, _timer: null, _aud: null, _drag: null, status: '',

    // ------------------------------------------------------------------ the chassis
    init() {
        if (this.el) return;
        const d = document.createElement('div');
        d.id = 'beatingPanel';
        d.style.cssText = ['position:fixed', 'right:16px', 'top:96px', 'width:' + (W + 40) + 'px', 'z-index:9000', 'background:rgba(28,28,32,0.97)', 'border:1px solid #7B3FE4', 'border-radius:6px',
            'padding:10px 12px', 'color:#ddd', 'font:11px/1.45 system-ui,sans-serif', 'box-shadow:0 6px 24px rgba(0,0,0,0.5)', 'display:none', 'flex-direction:column',
            'max-height:calc(100vh - 110px)', 'min-width:420px', 'min-height:240px', 'resize:both', 'overflow:hidden'].join(';');
        d.innerHTML = [
            '<div id="bpDrag" style="cursor:move;font-weight:600;color:#c9a8ff;margin:-10px -12px 8px;padding:7px 12px;border-bottom:1px solid #444;background:rgba(123,63,228,0.18)">BEATING',
            '<span id="bpTitle" style="font-weight:400;color:#aaa;margin-left:8px"></span><span id="bpClose" title="close (ESC)" style="float:right;cursor:pointer;color:#888">&#10005;</span></div>',
            '<div id="bpStatus" style="color:#9a9;margin-bottom:6px;flex:0 0 auto;white-space:nowrap;overflow:hidden;text-overflow:ellipsis"></div>',
            '<div id="bpHead" style="flex:0 0 auto;display:flex;flex-wrap:wrap;gap:6px 10px;align-items:center;margin-bottom:6px">',
            '<label>length <input id="bpLen" type="number" step="0.5" min="0.5" max="180" style="width:56px"> s</label>',
            '<button id="bpAdd" title="another pair (up to three)">+ pair</button>',
            '<button id="bpPlay" title="SPACE: the pattern through the score&#8217;s MIDI path, all pairs, real time">&#9654; play (space)</button>',
            '<button id="bpStop">&#9632; stop</button>',
            '<span style="margin-left:auto"></span>',
            '<input id="bpTakeName" type="text" placeholder="take name" style="width:110px" title="ENTER saves">',
            '<button id="bpTakeSave" title="save this pattern as a named take in bank/panel_snapshots.json">save take</button>',
            '<select id="bpTakeSel" style="max-width:130px"><option value="">load take&#8230;</option></select>',
            '<button id="bpTakeDel" title="delete the named take">&#10005;</button>',
            '<button id="bpInsert" disabled title="Insert at the playhead — step 6">insert</button>',
            '</div>',
            '<div id="bpRows" style="flex:1 1 auto;overflow-y:auto;min-height:0;margin:0 -4px;padding:0 4px"></div>',
        ].join('');
        document.body.appendChild(d);
        this.el = d;
        d.querySelector('#bpClose').addEventListener('click', () => this.close());
        d.querySelector('#bpAdd').addEventListener('click', () => this.addRow());
        d.querySelector('#bpPlay').addEventListener('click', () => this.play());
        d.querySelector('#bpStop').addEventListener('click', () => this.stop());
        d.querySelector('#bpLen').addEventListener('change', ev => this.setLength(parseFloat(ev.target.value)));
        d.querySelector('#bpTakeSave').addEventListener('click', () => this.saveTake());
        d.querySelector('#bpTakeName').addEventListener('keydown', ev => { if (ev.key !== 'Enter') return; ev.preventDefault(); ev.stopPropagation(); this.saveTake(); });
        d.querySelector('#bpTakeSel').addEventListener('change', ev => { if (ev.target.value) this.loadTake(ev.target.value); ev.target.value = ''; });
        d.querySelector('#bpTakeDel').addEventListener('click', () => this.deleteTake());
        this.makeDraggable(d, d.querySelector('#bpDrag'));
        window.addEventListener('resize', () => this.clampIntoView());
        d.setAttribute('tabindex', '0');
        d.addEventListener('keydown', e => {
            if (e.target.matches('input,select,textarea')) { if (e.key === 'Escape') e.target.blur(); return; }
            if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); this.close(); }
        });
        // SPACE while the panel is open = the pattern, never the transport (the strikes drawer's rule, capture phase: the score
        // blurs selects and number inputs on change and would hand SPACE to the transport); text entry keeps its SPACE
        window.addEventListener('keydown', ev => {
            if (ev.code !== 'Space' || !this.el || this.el.style.display === 'none') return;
            const t = ev.target, m = q => !!(t && t.matches && t.matches(q));
            if (m('textarea, input[type=text], input[type=number], input[type=search], input:not([type])')) return;
            if (m('select, button')) t.blur();
            ev.preventDefault(); ev.stopPropagation();
            if (this._aud) this.stop(); else this.play();
        }, true);
    },
    makeDraggable(box, handle) {
        let sx = 0, sy = 0, bx = 0, by = 0, on = false;
        handle.addEventListener('mousedown', e => {
            if (e.target.id === 'bpClose') return;
            on = true; sx = e.clientX; sy = e.clientY; const r = box.getBoundingClientRect(); bx = r.left; by = r.top; this.bringToFront(); e.preventDefault();
        });
        document.addEventListener('mousemove', e => { if (!on) return; box.style.left = (bx + e.clientX - sx) + 'px'; box.style.top = (by + e.clientY - sy) + 'px'; box.style.right = 'auto'; this.clampIntoView(); });
        document.addEventListener('mouseup', () => { on = false; });
    },
    clampIntoView() {
        const box = this.el; if (!box || box.style.display === 'none') return;
        const r = box.getBoundingClientRect(); if (!r.width && !r.height) return;
        const MIN_TOP = 36, MARGIN = 4, maxLeft = Math.max(MARGIN, window.innerWidth - r.width - MARGIN), maxTop = Math.max(MIN_TOP, window.innerHeight - r.height - MARGIN);
        box.style.left = Math.min(Math.max(r.left, MARGIN), maxLeft) + 'px'; box.style.top = Math.min(Math.max(r.top, MIN_TOP), maxTop) + 'px'; box.style.right = 'auto';
    },
    bringToFront() {
        let z = 9000;
        document.querySelectorAll('div[id$="Panel"]').forEach(p => { if (p === this.el || p.style.display === 'none') return; const pz = parseInt(window.getComputedStyle(p).zIndex, 10); if (!isNaN(pz) && pz >= z) z = pz + 1; });
        this.el.style.zIndex = String(z);
    },
    setStatus(msg, bad) { this.status = msg; const s = this.el && this.el.querySelector('#bpStatus'); if (s) { s.textContent = msg; s.title = msg; s.style.color = bad ? '#e88' : '#9a9'; } },
    isOpen() { return !!this.el && this.el.style.display !== 'none'; },
    show() { this.init(); this.el.style.display = 'flex'; this.bringToFront(); this.clampIntoView(); this.el.focus(); this.refreshTakes(); const b = document.getElementById('beatingBtn'); if (b) { b.style.background = '#3a2a5a'; b.style.color = '#d9c8ff'; } },
    close() { if (!this.el) return; this.stop(); this.el.style.display = 'none'; const b = document.getElementById('beatingBtn'); if (b) { b.style.background = ''; b.style.color = ''; } },
    toggle() { this.init(); if (this.isOpen()) { this.close(); return; } const C = C_(), sel = C && C.selectedObject; if (sel && sel.type === 'zone' && sel.midiModel === 'beating') this.openFor(sel); else this.openNew(); },

    // ------------------------------------------------------------------ the two ways in
    // P on a beating: the panel is BOUND to the zone — the row's block is the zone's own, edits regenerate it live
    openFor(zone) {
        this.init(); const C = C_();
        this.bound = zone; C.ensureBeating(zone);
        this.rows = [this.mkRow(zone.layer, zone.beating, 0, zone)];
        this.length = r3(Math.max(0.1, zone.endTime - zone.startTime));
        this.show(); this.render();
        this.setStatus('bound to ' + C.beatingLabel(zone) + ' — every edit regenerates it; SPACE plays the pair; ESC closes');
    },
    // the Beating button with nothing bound: an empty pattern that lives here until Insert (step 6)
    openNew() {
        this.init(); const C = C_();
        this.bound = null;
        if (!this.rows.length || this.rows.some(r => r.zone)) { this.rows = []; const r = this.defaultRow(C ? C.activeLane : 3); if (r) this.rows.push(r); }
        this.show(); this.render();
        this.setStatus(this.rows.length ? 'a new pattern — shapes pop in from the menu, SPACE plays it; Insert comes at step 6' : 'no pair can be made on this lane', !this.rows.length);
    },
    mkRow(layer, b, offset, zone) { return { layer, b, offset: offset || 0, zone: zone || null, locked: true, draw: false, scale: 6, out: null }; },
    defaultRow(layer) {
        const C = C_(), BC = BC_(); if (!C || !BC) return null;
        const M = METAL(); if (layer == null || layer >= M || layer === 2) layer = 3;
        const me = TRK()[layer] && TRK()[layer].instKey; if (!me) return null;
        const r = BC.ordinaryRange(INST(), me); let pitch = r ? Math.round((r[0] + r[1]) / 2) : 60;
        let cands = C.beatingPartnerCandidates(layer, pitch, 'unison');
        if (!cands.length) { pitch = 60; cands = C.beatingPartnerCandidates(layer, pitch, 'unison'); }
        if (!cands.length) return null;
        cands.sort((a, c) => Math.abs(a.layer - layer) - Math.abs(c.layer - layer) || a.layer - c.layer);
        const b = C.beatingDefaults(layer, 0, pitch, cands[0].layer);
        b.shape = 'hump';
        return this.mkRow(layer, b, 0, null);
    },
    addRow() {
        if (this.rows.length >= MAX_ROWS) { this.setStatus('three pairs at most (the six bending players)', true); return; }
        if (this.bound) { this.setStatus('a bound beating is one pair — a pattern of several is inserted from a new pattern (Beating button), or grouped at step 6', true); return; }
        const used = new Set(); this.rows.forEach(r => { used.add(r.layer); used.add(r.b.partnerLayer); });
        const free = [0, 1, 3, 4, 5, 6].filter(L => !used.has(L));
        const r = this.defaultRow(free[0] != null ? free[0] : 3); if (!r) { this.setStatus('no free pair', true); return; }
        this.rows.push(r); this.render();
    },
    removeRow(i) { if (this.bound) return; this.rows.splice(i, 1); this.render(); },

    // ------------------------------------------------------------------ the math per row (the panel's lines) and the objects
    rowSpec(row) {
        const C = C_();
        const z = row.zone || { layer: row.layer, startTime: 0, endTime: this.length, beating: row.b, id: 'bp-row' };
        return C.beatingSpec(z);
    },
    rowOut(row) { const BC = BC_(); row.out = BC.renderPair(this.rowSpec(row), INST()); return row.out; },
    // an edit: the row's lines at once; the bound zone regenerated after a short pause (a drag fires many)
    changed(row, now) {
        this.rowOut(row);
        if (row.zone) {
            const C = C_();
            clearTimeout(this._timer);
            const go = () => { C.regenerateBeating(row.zone); C.renderZone(row.zone); C.markDirty(); };
            if (now) go(); else this._timer = setTimeout(go, 120);
        }
    },
    setLength(v) {
        if (!(v > 0)) return;
        const BC = BC_(), old = this.length; this.length = r3(v);
        this.rows.forEach(r => {   // the curves are over normalised time; the slides and the hand marks scale; dealt breaths re-deal
            const s = BC.stretch({ length: old, slide: r.b.slide, breath: r.b.breath }, this.length);
            r.b.slide = s.slide; r.b.breath = s.breath;
            if (r.zone) { r.zone.endTime = r3(r.zone.startTime + this.length); }
            this.changed(r, true);
        });
        this.render();
        this.setStatus('length ' + this.length + ' s — the same shapes over it; the breaths re-dealt');
    },

    // ------------------------------------------------------------------ the rendering
    render() {
        if (!this.el) return;
        const C = C_(), BC = BC_();
        this.el.querySelector('#bpLen').value = this.length;
        this.el.querySelector('#bpTitle').textContent = this.bound ? '— ' + (TRK()[this.bound.layer] || {}).short + ' ' + this.bound.startTime.toFixed(2) + ' s' : '— new pattern';
        this.el.querySelector('#bpAdd').disabled = !!this.bound || this.rows.length >= MAX_ROWS;
        const host = this.el.querySelector('#bpRows'); host.innerHTML = '';
        this.rows.forEach((row, i) => { this.rowOut(row); host.appendChild(this.buildRow(row, i)); });
        if (!this.rows.length) host.innerHTML = '<div style="color:#888;padding:12px">no pairs — + pair</div>';
    },
    buildRow(row, i) {
        const C = C_(), BC = BC_(), b = row.b, out = row.out, T = TRK();
        const me = T[row.layer] ? T[row.layer].label : '?', cands = C.beatingPartnerCandidates(row.layer, b.pitch, b.interval);
        const lim = k => k ? BC.bendLimits(INST(), k) : null, lo = lim(out.players.lower), up = lim(out.players.upper);
        const fl = out.flags.map(f => f.flag).filter((v, j, a) => a.indexOf(v) === j);
        const iv = BC.INTERVALS[b.interval] || BC.INTERVALS.unison;
        const box = document.createElement('div');
        box.className = 'bpRow'; box.dataset.row = i;
        box.style.cssText = 'border:1px solid #444;border-radius:5px;padding:6px 8px;margin-bottom:8px;background:rgba(255,255,255,0.03)';
        const sel = 'background:#7B3FE4;color:#fff;border-color:#7B3FE4;';
        const btn = (cls, data, label, on, title) => '<button class="' + cls + '" ' + data + ' title="' + esc(title || '') + '" style="font-size:10px;padding:1px 5px;margin:1px;cursor:pointer;' + (on ? sel : '') + '">' + label + '</button>';
        box.innerHTML = [
            '<div style="display:flex;flex-wrap:wrap;gap:4px 8px;align-items:center;margin-bottom:4px">',
            '<b style="color:#c9a8ff">pair ' + (i + 1) + '</b> ',
            (row.zone ? '<span>' + esc(me) + '</span>' : '<select class="bpLane" title="the launching player">' + [0, 1, 3, 4, 5, 6].map(L => '<option value="' + L + '"' + (L === row.layer ? ' selected' : '') + '>' + esc(T[L].label) + '</option>').join('') + '</select>'),
            ' + <select class="bpPartner" title="the lanes whose player holds the note (step 1&#8217;s table)">' + (cands.length ? '' : '<option value="">no partner can play this</option>')
                + cands.map(c => '<option value="' + c.layer + '"' + (c.layer === b.partnerLayer ? ' selected' : '') + '>' + esc(T[c.layer].label) + (b.interval === 'unison' ? '' : c.upper === c.instKey ? ' (above)' : ' (below)') + '</option>').join('')
                + (b.partnerLayer != null && !cands.some(c => c.layer === b.partnerLayer) && T[b.partnerLayer] ? '<option value="' + b.partnerLayer + '" selected>' + esc(T[b.partnerLayer].label) + ' — cannot play this</option>' : '') + '</select>',
            ' on <input class="bpPitch" type="number" value="' + b.pitch + '" min="21" max="108" step="1" style="width:50px" title="the pair&#8217;s lower note"> <span style="color:#aaa">' + nn(b.pitch) + (iv.semitones ? ' + ' + nn(b.pitch + iv.semitones) : '') + '</span>',
            ' <span>' + Object.values(BC.INTERVALS).map(q => btn('bpIv', 'data-iv="' + q.key + '"', q.label, b.interval === q.key, q.label + ': the just offset ' + q.justOffsetCents + ' c on the upper note, the beating ' + q.partial + '× per cent')).join('') + '</span>',
            (row.zone ? '' : ' <button class="bpRemove" title="remove this pair" style="margin-left:auto;font-size:10px;cursor:pointer">&#10005; pair</button>'),
            '</div>',
            '<div style="display:flex;flex-wrap:wrap;gap:4px 8px;align-items:center;margin-bottom:3px">',
            '<span style="color:#888">rate</span> ' + SHAPES.map(([k, l]) => btn('bpShape', 'data-shape="' + k + '"', l, false, 'pop the shape in (the level = the row&#8217;s to rate)')).join(''),
            ' to <input class="bpRateTo" type="number" value="' + (+b.rateTo || 0) + '" min="0" max="30" step="0.5" style="width:46px" title="the shape&#8217;s level in beats per second"> /s',
            ' ' + btn('bpLock', '', row.locked ? '&#128274; mirrored' : '&#128275; free', row.locked, 'the mirror lock: drag one curve, the other mirrors (ALT-drag moves one alone)'),
            ' ' + btn('bpDraw', '', '&#10002; draw', row.draw, 'draw: click in the rate area to add points (ESC or click again to end)'),
            ' <label style="color:#888">±<input class="bpScale" type="number" value="' + row.scale + '" min="2" max="40" step="1" style="width:40px" title="the rate axis, beats per second"></label>',
            '</div>',
            '<svg class="bpRates" width="' + W + '" height="' + HR + '" style="display:block;background:#1a1a20;border-radius:3px"></svg>',
            '<div style="display:flex;gap:8px;align-items:center;margin:3px 0 2px"><span style="color:#888">crescendo</span> ' + SHAPES.map(([k, l]) => btn('bpLevShape', 'data-shape="' + k + '"', l, false, 'the level shape between low and high')).join('')
                + ' ' + btn('bpLevFollow', '', 'follows the beating', !b.levelCurve, 'the crescendo follows the beating between low and high')
                + ' low <input class="bpLevLo" type="number" value="' + b.levelLo + '" min="0" max="1" step="0.05" style="width:44px"> high <input class="bpLevHi" type="number" value="' + b.levelHi + '" min="0" max="1" step="0.05" style="width:44px"></div>',
            '<svg class="bpLevel" width="' + W + '" height="' + HL + '" style="display:block;background:#1a1a20;border-radius:3px"></svg>',
            '<div style="display:flex;gap:8px;align-items:center;margin:3px 0 2px"><span style="color:#888">breaths</span> <select class="bpBreath">' + ['one', 'continuous', 'designated'].map(k => '<option value="' + k + '"' + ((b.breath.mode || 'one') === k ? ' selected' : '') + '>' + k + '</option>').join('') + '</select>'
                + ' ' + btn('bpShuffle', '', '&#8635; shuffle', false, 'deal the breaths again from a new seed — the hand-moved marks stay') + ' <span style="color:#888">seed ' + (b.breath.seed || 1) + '</span>'
                + ' <span class="bpBreathInfo" style="color:#888"></span></div>',
            '<svg class="bpBreaths" width="' + W + '" height="' + HB + '" style="display:block;background:#1a1a20;border-radius:3px"></svg>',
            '<div style="display:flex;gap:8px;align-items:center;margin-top:3px"><span style="color:#888">offset</span> <input class="bpOffset" type="range" min="0" max="' + Math.max(0.1, this.length) + '" step="0.05" value="' + row.offset + '" style="width:200px"' + (row.zone ? ' disabled' : '') + ' title="slide the whole pair in time against the others"> <span class="bpOffsetVal">' + row.offset.toFixed(2) + ' s</span>',
            ' <span class="bpReadout" style="color:#9a9;margin-left:auto">max ' + out.maxBeat + '/s · ' + (out.players.lower || '?') + ' ±' + out.maxCents.lower + ' c' + (lo ? '/' + lo.limitCents : '') + ' · ' + (out.players.upper || '?') + ' ±' + out.maxCents.upper + ' c' + (up ? '/' + up.limitCents : '')
                + (out.justOffsetCents ? ' · just ' + (out.justOffsetCents > 0 ? '+' : '') + out.justOffsetCents + ' c' : '') + ' · ' + out.notes.lower.length + '+' + out.notes.upper.length + ' notes' + (fl.length ? ' · <span style="color:#e88">&#9888; ' + fl.join(' ') + '</span>' : '') + '</span></div>',
        ].join('');
        // the controls
        const q = s => box.querySelector(s), qa = s => box.querySelectorAll(s);
        const keepPartner = () => { const c = C.beatingPartnerCandidates(row.layer, b.pitch, b.interval); if (c.length && !c.some(x => x.layer === b.partnerLayer)) b.partnerLayer = c[0].layer; };
        const redo = () => { this.changed(row, true); this.render(); };
        if (q('.bpLane')) q('.bpLane').addEventListener('change', ev => { row.layer = +ev.target.value; keepPartner(); redo(); });
        q('.bpPartner').addEventListener('change', ev => { b.partnerLayer = ev.target.value === '' ? null : +ev.target.value; redo(); });
        q('.bpPitch').addEventListener('change', ev => { const v = parseInt(ev.target.value, 10); if (!isNaN(v)) { b.pitch = v; keepPartner(); redo(); } });
        qa('.bpIv').forEach(el => el.addEventListener('click', () => { b.interval = el.dataset.iv; keepPartner(); redo(); }));
        if (q('.bpRemove')) q('.bpRemove').addEventListener('click', () => this.removeRow(i));
        qa('.bpShape').forEach(el => el.addEventListener('click', () => { this.popShape(row, el.dataset.shape); redo(); }));
        q('.bpRateTo').addEventListener('change', ev => { const v = parseFloat(ev.target.value); if (!isNaN(v)) { b.rateTo = v; this.popShape(row, b.shape || 'ramp'); redo(); } });
        q('.bpLock').addEventListener('click', () => { row.locked = !row.locked; if (row.locked) { this.relock(row); } else { this.unlock(row); } redo(); });
        q('.bpDraw').addEventListener('click', () => { row.draw = !row.draw; this.render(); this.setStatus(row.draw ? 'draw: click in the rate area to add points; a point drags; ALT-click removes it; click draw again to end' : 'draw off'); });
        q('.bpScale').addEventListener('change', ev => { const v = parseFloat(ev.target.value); if (v > 0) { row.scale = v; this.render(); } });
        qa('.bpLevShape').forEach(el => el.addEventListener('click', () => { b.levelCurve = BC.shape(el.dataset.shape, { level: b.levelHi, from: el.dataset.shape === 'rampIn' ? b.levelHi : b.levelLo, to: el.dataset.shape === 'rampIn' ? b.levelLo : b.levelHi, peak: b.levelHi, base: b.levelLo }); redo(); }));
        q('.bpLevFollow').addEventListener('click', () => { b.levelCurve = null; redo(); });
        q('.bpLevLo').addEventListener('change', ev => { const v = parseFloat(ev.target.value); if (!isNaN(v)) { b.levelLo = clamp(v, 0, 1); redo(); } });
        q('.bpLevHi').addEventListener('change', ev => { const v = parseFloat(ev.target.value); if (!isNaN(v)) { b.levelHi = clamp(v, 0, 1); redo(); } });
        q('.bpBreath').addEventListener('change', ev => { b.breath.mode = ev.target.value; redo(); });
        q('.bpShuffle').addEventListener('click', () => { b.breath.mode = 'designated'; b.breath.seed = (b.breath.seed || 1) + 1; delete b.breath.deal; redo(); this.setStatus('breaths dealt again (seed ' + b.breath.seed + '); the hand-moved marks kept'); });
        q('.bpOffset').addEventListener('input', ev => { row.offset = r3(parseFloat(ev.target.value)); q('.bpOffsetVal').textContent = row.offset.toFixed(2) + ' s'; });
        this.drawRates(row, q('.bpRates'));
        this.drawLevel(row, q('.bpLevel'));
        this.drawBreaths(row, q('.bpBreaths'), q('.bpBreathInfo'));
        return box;
    },

    // ---- the curves in the block: `beat` (one heard curve, mirrored by `share`) while locked; `rate.lower / upper` when unlocked ----
    heardCurve(row) { const C = C_(); return C.beatingCurve(row.b); },
    curvesOf(row) {
        const BC = BC_(), b = row.b;
        if (b.rate && b.rate.lower && b.rate.upper) return { lower: BC.curveOf(b.rate.lower), upper: BC.curveOf(b.rate.upper) };
        const m = BC.mirrored(this.heardCurve(row), b.share);
        return { lower: BC.curveOf(m.lower), upper: BC.curveOf(m.upper) };
    },
    popShape(row, key) {
        const BC = BC_(), b = row.b, to = +b.rateTo || 0, from = +b.rateFrom || 0;
        b.shape = key;
        b.beat = key === 'flat' ? BC.shape('flat', { level: to }) : key === 'rampOut' ? [[0, 0], [1, to]] : key === 'rampIn' ? [[0, to], [1, 0]] : key === 'hump' ? BC.shape('hump', { peak: to, base: from }) : key === 'arc' ? BC.shape('arc', { peak: to, base: from }) : BC.shape('burst', { peak: to });
        b.rate = null; row.locked = true;
    },
    unlock(row) { const c = this.curvesOf(row); row.b.rate = { lower: c.lower.map(p => [p[0], p[1]]), upper: c.upper.map(p => [p[0], p[1]]) }; },
    relock(row) {   // the upper curve becomes the heard curve's upper half again; the lower mirrors it
        const c = this.curvesOf(row); row.b.beat = c.upper.map(p => [p[0], r3(p[1] * 2)]); row.b.share = 0.5; row.b.rate = null; row.b.shape = 'drawn';
    },
    // an edit of one curve's point: locked → the heard curve's point (the other mirrors); unlocked → that curve alone
    setPoint(row, who, idx, p, v) {
        const BC = BC_(), b = row.b;
        if (row.locked) {
            const beat = BC.curveOf(this.heardCurve(row)); if (!beat[idx]) return;
            beat[idx] = [p, r3(Math.abs(v) * 2)]; b.beat = beat; b.shape = 'drawn';
        } else {
            if (!b.rate) this.unlock(row);
            const c = BC.curveOf(b.rate[who]); if (!c[idx]) return;
            c[idx] = [p, r3(v)]; b.rate[who] = c;
        }
    },
    addPoint(row, who, p, v) {
        const BC = BC_(), b = row.b;
        if (row.locked) { const beat = BC.curveOf(this.heardCurve(row)); beat.push([p, r3(Math.abs(v) * 2)]); b.beat = BC.curveOf(beat); b.shape = 'drawn'; }
        else { if (!b.rate) this.unlock(row); const c = BC.curveOf(b.rate[who]); c.push([p, r3(v)]); b.rate[who] = BC.curveOf(c); }
    },
    removePoint(row, who, idx) {
        const BC = BC_(), b = row.b;
        if (row.locked) { const beat = BC.curveOf(this.heardCurve(row)); if (beat.length <= 2) return; beat.splice(idx, 1); b.beat = beat; b.shape = 'drawn'; }
        else { if (!b.rate) this.unlock(row); const c = BC.curveOf(b.rate[who]); if (c.length <= 2) return; c.splice(idx, 1); b.rate[who] = c; }
    },
    slideCurve(row, who, dSec) {
        const b = row.b; if (!b.slide) b.slide = { lower: 0, upper: 0 };
        if (row.locked) { b.slide.lower = r3(clamp(b.slide.lower + dSec, -this.length, this.length)); b.slide.upper = r3(clamp(b.slide.upper + dSec, -this.length, this.length)); }
        else b.slide[who] = r3(clamp((b.slide[who] || 0) + dSec, -this.length, this.length));
    },

    // ---- the rate area: the two curves, the band by zone, the handles on rails ----
    drawRates(row, svg) {
        const BC = BC_(), out = row.out, cur = this.curvesOf(row), b = row.b, S = row.scale, L = this.length;
        const x0 = PADL, x1 = W - PADR, mid = HR / 2, sy = (HR / 2 - 6) / S;
        const X = p => x0 + p * (x1 - x0), Y = v => mid - v * sy, ns = 'http://www.w3.org/2000/svg';
        const mk = (t, a) => { const e = document.createElementNS(ns, t); for (const k in a) e.setAttribute(k, a[k]); return e; };
        svg.innerHTML = '';
        // the zone bands: a sliver per sample between the two players' rates (the gap = the heard beating)
        out.samples.forEach((s, k) => {
            const n = out.samples[k + 1]; if (!n) return;
            const xa = X(s.p), xb = X(n.p), top = Y(Math.max(s.rateL, s.rateU)), bot = Y(Math.min(s.rateL, s.rateU));
            svg.appendChild(mk('rect', { x: xa, y: Math.min(top, bot), width: Math.max(0.5, xb - xa), height: Math.max(0.5, Math.abs(bot - top)), fill: ZONE_FILL[s.zone] || ZONE_FILL.beating }));
        });
        // the axis: the centre line and the rate marks
        svg.appendChild(mk('line', { x1: x0, x2: x1, y1: mid, y2: mid, stroke: '#666', 'stroke-width': 1 }));
        [S, S / 2, -S / 2, -S].forEach(v => { svg.appendChild(mk('line', { x1: x0, x2: x1, y1: Y(v), y2: Y(v), stroke: '#333', 'stroke-dasharray': '2 4' })); const t = mk('text', { x: 2, y: Y(v) + 4, fill: '#777', 'font-size': 9 }); t.textContent = (v > 0 ? '+' : '') + v; svg.appendChild(t); });
        const zt = mk('text', { x: 2, y: mid + 4, fill: '#999', 'font-size': 9 }); zt.textContent = '0'; svg.appendChild(zt);
        [1, 15].forEach(z => { const y = Y(z / 2), y2 = Y(-z / 2); svg.appendChild(mk('line', { x1: x0, x2: x1, y1: y, y2: y, stroke: z === 1 ? '#557' : '#744', 'stroke-dasharray': '1 5' })); svg.appendChild(mk('line', { x1: x0, x2: x1, y1: y2, y2: y2, stroke: z === 1 ? '#557' : '#744', 'stroke-dasharray': '1 5' })); });
        // the slid curves as played (the samples) — thin; the drawn curves with their handles — bold
        const lineOf = (key, col) => { const d = out.samples.map((s, k) => (k ? 'L' : 'M') + X(s.p).toFixed(1) + ' ' + Y(s[key]).toFixed(1)).join(' '); svg.appendChild(mk('path', { d, fill: 'none', stroke: col, 'stroke-width': 1, 'stroke-opacity': 0.55 })); };
        lineOf('rateU', COL.upper); lineOf('rateL', COL.lower);
        const drawCurve = (who, pts, col) => {
            const slide = (b.slide && b.slide[who]) || 0, sp = slide / Math.max(0.1, L);
            const d = pts.map((p, k) => (k ? 'L' : 'M') + X(clamp(p[0] + sp, 0, 1)).toFixed(1) + ' ' + Y(p[1]).toFixed(1)).join(' ');
            const path = mk('path', { d, fill: 'none', stroke: col, 'stroke-width': 2.2, 'stroke-linejoin': 'round' }); path.style.cursor = 'ew-resize'; path.style.pointerEvents = 'stroke';
            path.addEventListener('mousedown', e => { e.preventDefault(); e.stopPropagation(); this.dragBody(row, who, e, svg); });
            svg.appendChild(path);
            pts.forEach((p, idx) => {
                const h = mk('circle', { cx: X(clamp(p[0] + sp, 0, 1)), cy: Y(p[1]), r: 5, fill: '#1a1a20', stroke: col, 'stroke-width': 2 });
                h.style.cursor = 'move';
                h.addEventListener('mousedown', e => { e.preventDefault(); e.stopPropagation(); if (e.altKey) { this.removePoint(row, who, idx); this.changed(row, true); this.render(); return; } this.dragHandle(row, who, idx, e, svg); });
                svg.appendChild(h);
            });
        };
        drawCurve('upper', cur.upper, COL.upper); drawCurve('lower', cur.lower, COL.lower);
        // the players' names and the lock state
        const nmU = mk('text', { x: x1 - 4, y: 12, fill: COL.upper, 'font-size': 10, 'text-anchor': 'end' }); nmU.textContent = (out.players.upper || '?') + ' ↑' + (b.slide && b.slide.upper ? ' slid ' + b.slide.upper + ' s' : ''); svg.appendChild(nmU);
        const nmL = mk('text', { x: x1 - 4, y: HR - 5, fill: COL.lower, 'font-size': 10, 'text-anchor': 'end' }); nmL.textContent = (out.players.lower || '?') + ' ↓' + (b.slide && b.slide.lower ? ' slid ' + b.slide.lower + ' s' : ''); svg.appendChild(nmL);
        const beatT = mk('text', { x: x0 + 4, y: 12, fill: '#c9a8ff', 'font-size': 10 }); beatT.textContent = 'beating ' + out.maxBeat + '/s max' + (row.locked ? ' · mirrored' : ' · free'); svg.appendChild(beatT);
        // draw mode: a click on empty space adds a point
        if (row.draw) {
            svg.style.cursor = 'crosshair';
            svg.addEventListener('mousedown', e => {
                if (e.target !== svg && e.target.tagName !== 'rect' && e.target.tagName !== 'line' && e.target.tagName !== 'path') return;
                if (e.target.tagName === 'path' && e.target.getAttribute('stroke-width') === '2.2') return;
                const r = svg.getBoundingClientRect(); const p = clamp((e.clientX - r.left - x0) / (x1 - x0), 0, 1), v = (mid - (e.clientY - r.top)) / sy;
                const who = v >= 0 ? 'upper' : 'lower';
                this.addPoint(row, who, r3(p), r3(v)); this.changed(row, true); this.render();
            });
        }
        svg._geom = { x0, x1, mid, sy, X, Y };
    },
    dragHandle(row, who, idx, e0, svg) {
        const g = svg._geom, r = svg.getBoundingClientRect(), b = row.b, L = this.length, cur = this.curvesOf(row)[who], n = cur.length;
        const slide = (b.slide && b.slide[who]) || 0, sp = slide / Math.max(0.1, L);
        const tip = document.createElementNS('http://www.w3.org/2000/svg', 'text'); tip.setAttribute('fill', '#fff'); tip.setAttribute('font-size', '10'); svg.appendChild(tip);
        const onMove = ev => {
            let p = clamp((ev.clientX - r.left - g.x0) / (g.x1 - g.x0) - sp, 0, 1); const v = clamp((g.mid - (ev.clientY - r.top)) / g.sy, -row.scale, row.scale);
            if (idx === 0) p = 0; if (idx === n - 1) p = 1;   // the ends stay at the ends
            const vv = who === 'upper' ? Math.max(0, v) : Math.min(0, v);   // above the centre for the upper, below for the lower
            const wasLocked = row.locked; if (ev.altKey && row.locked) { row.locked = false; this.unlock(row); }
            this.setPoint(row, who, idx, r3(p), r3(vv));
            row.locked = row.locked && wasLocked;
            this.rowOut(row);
            tip.setAttribute('x', clamp(ev.clientX - r.left + 8, 4, W - 60)); tip.setAttribute('y', clamp(ev.clientY - r.top - 8, 10, HR - 4));
            tip.textContent = (row.locked ? (Math.abs(vv) * 2).toFixed(2) + '/s heard' : Math.abs(vv).toFixed(2) + '/s ' + who) + ' · ' + (p * L).toFixed(2) + ' s';
            this.drawRates(row, svg); svg.appendChild(tip);
            this.changed(row, false);
        };
        const onUp = () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); tip.remove(); this.changed(row, true); this.render(); };
        window.addEventListener('mousemove', onMove); window.addEventListener('mouseup', onUp);
    },
    dragBody(row, who, e0, svg) {
        const g = svg._geom, L = this.length, x0 = e0.clientX; let last = 0;
        const onMove = ev => { const d = (ev.clientX - x0) / (g.x1 - g.x0) * L; const step = r3(d - last); if (!step) return; last = r3(last + step); if (ev.altKey && row.locked) { row.locked = false; this.unlock(row); } this.slideCurve(row, who, step); this.rowOut(row); this.drawRates(row, svg); this.changed(row, false); };
        const onUp = () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); this.changed(row, true); this.render(); };
        window.addEventListener('mousemove', onMove); window.addEventListener('mouseup', onUp);
    },

    // ---- the crescendo lane ----
    drawLevel(row, svg) {
        const BC = BC_(), out = row.out, b = row.b, ns = 'http://www.w3.org/2000/svg';
        const x0 = PADL, x1 = W - PADR, X = p => x0 + p * (x1 - x0), Y = v => HL - 4 - v * (HL - 10);
        const mk = (t, a) => { const e = document.createElementNS(ns, t); for (const k in a) e.setAttribute(k, a[k]); return e; };
        svg.innerHTML = '';
        const d = out.samples.map((s, k) => (k ? 'L' : 'M') + X(s.p).toFixed(1) + ' ' + Y(s.level).toFixed(1)).join(' ');
        svg.appendChild(mk('path', { d: d + ' L' + X(1).toFixed(1) + ' ' + Y(0) + ' L' + X(0) + ' ' + Y(0) + ' Z', fill: COL.level, 'fill-opacity': 0.18, stroke: 'none' }));
        svg.appendChild(mk('path', { d, fill: 'none', stroke: COL.level, 'stroke-width': 1.6 }));
        [0, 0.5, 1].forEach(v => { const t = mk('text', { x: 2, y: Y(v) + 3, fill: '#777', 'font-size': 9 }); t.textContent = v; svg.appendChild(t); });
        const lbl = mk('text', { x: x1 - 4, y: 11, fill: COL.level, 'font-size': 10, 'text-anchor': 'end' }); lbl.textContent = b.levelCurve ? 'own curve' : 'follows the beating · ' + b.levelLo + ' → ' + b.levelHi; svg.appendChild(lbl);
        if (b.levelCurve) {
            const pts = BC.curveOf(b.levelCurve);
            pts.forEach((p, idx) => {
                const h = mk('circle', { cx: X(p[0]), cy: Y(clamp(p[1], 0, 1)), r: 4.5, fill: '#1a1a20', stroke: COL.level, 'stroke-width': 2 }); h.style.cursor = 'move';
                h.addEventListener('mousedown', e => {
                    e.preventDefault(); e.stopPropagation();
                    if (e.altKey) { if (pts.length > 2) { pts.splice(idx, 1); b.levelCurve = pts; this.changed(row, true); this.render(); } return; }
                    const r = svg.getBoundingClientRect(), n = pts.length;
                    const onMove = ev => { let p = clamp((ev.clientX - r.left - x0) / (x1 - x0), 0, 1); if (idx === 0) p = 0; if (idx === n - 1) p = 1; const v = clamp((HL - 4 - (ev.clientY - r.top)) / (HL - 10), 0, 1); pts[idx] = [r3(p), r3(v)]; b.levelCurve = pts; this.rowOut(row); this.drawLevel(row, svg); this.changed(row, false); };
                    const onUp = () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); this.changed(row, true); this.render(); };
                    window.addEventListener('mousemove', onMove); window.addEventListener('mouseup', onUp);
                });
                svg.appendChild(h);
            });
            svg.style.cursor = 'crosshair';
            svg.addEventListener('mousedown', e => { if (e.target.tagName === 'circle') return; const r = svg.getBoundingClientRect(); const p = clamp((e.clientX - r.left - x0) / (x1 - x0), 0, 1), v = clamp((HL - 4 - (e.clientY - r.top)) / (HL - 10), 0, 1); pts.push([r3(p), r3(v)]); b.levelCurve = BC.curveOf(pts); this.changed(row, true); this.render(); });
        }
    },

    // ---- the breath lane: per player the marks as dotted go lines on sliders, the ceiling bar, the warning ----
    drawBreaths(row, svg, info) {
        const BC = BC_(), out = row.out, b = row.b, ns = 'http://www.w3.org/2000/svg', L = this.length;
        const x0 = PADL, x1 = W - PADR, X = t => x0 + (t / Math.max(0.1, L)) * (x1 - x0);
        const mk = (t, a) => { const e = document.createElementNS(ns, t); for (const k in a) e.setAttribute(k, a[k]); return e; };
        svg.innerHTML = '';
        const rowsY = { upper: 12, lower: 32 };
        let warn = 0;
        for (const who of ['upper', 'lower']) {
            const br = out.breaths[who], inst = out.players[who], y = rowsY[who], col = who === 'upper' ? COL.upper : COL.lower;
            const nm = mk('text', { x: 2, y: y + 4, fill: col, 'font-size': 9 }); nm.textContent = (inst || '?').slice(0, 5); svg.appendChild(nm);
            svg.appendChild(mk('line', { x1: x0, x2: x1, y1: y, y2: y, stroke: '#444' }));
            (br.spans || []).forEach(sp => {
                const over = sp[1] - sp[0] > br.ceiling.seconds + 1e-6 && br.mode !== 'continuous'; if (over) warn++;
                svg.appendChild(mk('rect', { x: X(sp[0]), y: y - 4, width: Math.max(1, X(sp[1]) - X(sp[0])), height: 8, fill: over ? COL.bad : col, 'fill-opacity': over ? 0.45 : 0.28, rx: 2 }));
                if (over) svg.appendChild(mk('rect', { x: X(sp[0] + br.ceiling.seconds), y: y - 4, width: Math.max(1, X(sp[1]) - X(sp[0] + br.ceiling.seconds)), height: 8, fill: 'none', stroke: COL.bad, 'stroke-width': 1 }));
            });
            (br.marks || []).forEach(m => {
                const hand = b.breath.marks && b.breath.marks[who] && b.breath.marks[who].includes(m);
                const g = mk('line', { x1: X(m), x2: X(m), y1: y - 9, y2: y + 9, stroke: COL.breath, 'stroke-width': hand ? 2 : 1.2, 'stroke-dasharray': '2 2' }); svg.appendChild(g);
                const h = mk('circle', { cx: X(m), cy: y, r: 4, fill: hand ? COL.breath : '#1a1a20', stroke: COL.breath, 'stroke-width': 1.5 }); h.style.cursor = 'ew-resize';
                h.addEventListener('mousedown', e => {
                    e.preventDefault(); e.stopPropagation();
                    if (!b.breath.marks) b.breath.marks = { lower: [], upper: [] }; if (!b.breath.marks[who]) b.breath.marks[who] = [];
                    const handList = b.breath.marks[who], isHand = handList.includes(m);
                    if (e.altKey) {   // a hand mark is dropped; a dealt one: every current mark becomes a hand mark but this one (the deal stops)
                        if (isHand) b.breath.marks[who] = handList.filter(x => x !== m);
                        else { b.breath.deal = false; b.breath.marks[who] = (br.marks || []).filter(x => x !== m); }
                        b.breath.mode = 'designated'; this.changed(row, true); this.render(); return;
                    }
                    // a dragged mark becomes a HAND mark, kept; the rest stay the deal's (the nearest dealt mark gives way to it — `keep`)
                    const r = svg.getBoundingClientRect(); const others = handList.filter(x => x !== m);
                    const onMove = ev => { const cur = r3(clamp((ev.clientX - r.left - x0) / (x1 - x0) * L, 0.1, L - 0.1)); b.breath.mode = 'designated'; b.breath.marks[who] = others.concat([cur]).sort((p, q) => p - q); this.rowOut(row); this.drawBreaths(row, svg, info); this.changed(row, false); };
                    const onUp = () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); this.changed(row, true); this.render(); };
                    window.addEventListener('mousemove', onMove); window.addEventListener('mouseup', onUp);
                });
                svg.appendChild(h);
            });
            const ct = mk('text', { x: x1 - 4, y: y + 4, fill: '#888', 'font-size': 9, 'text-anchor': 'end' }); ct.textContent = br.ceiling.kind + ' ≤ ' + br.ceiling.seconds + ' s'; svg.appendChild(ct);
        }
        svg.style.cursor = 'copy';
        svg.addEventListener('mousedown', e => {   // a click on the lane adds a hand mark for that player
            if (e.target.tagName === 'circle') return;
            const r = svg.getBoundingClientRect(); const who = (e.clientY - r.top) < 22 ? 'upper' : 'lower'; const t = r3(clamp((e.clientX - r.left - x0) / (x1 - x0) * L, 0.1, L - 0.1));
            if (!b.breath.marks) b.breath.marks = { lower: [], upper: [] }; if (!b.breath.marks[who]) b.breath.marks[who] = [];
            b.breath.mode = 'designated'; b.breath.marks[who] = b.breath.marks[who].concat([t]).sort((p, q) => p - q);   // a hand mark; the deal keeps it
            this.changed(row, true); this.render();
        });
        if (info) { info.textContent = (b.breath.mode === 'continuous' ? 'one long note each — re-bow at will' : b.breath.mode === 'one' ? 'a single bow or breath each' : 'designated: ' + (out.breaths.lower.marks || []).length + ' + ' + (out.breaths.upper.marks || []).length + ' marks' + (b.breath.deal === false ? ' (by hand)' : ', dealt')) + (warn ? ' · ⚠ ' + warn + ' past the ceiling' : ''); info.style.color = warn ? COL.bad : '#888'; }
    },

    // ------------------------------------------------------------------ the audition: all pairs, timestamped, through the tick's event path
    async play() {
        const C = C_(); if (!C || !this.rows.length) return;
        this.stop();
        const events = [], slots = new Map();
        let firstPort = null, firstCh = 1;
        for (const row of this.rows) {
            const z = row.zone || { id: 'bp-row-' + this.rows.indexOf(row), type: 'zone', layer: row.layer, startTime: 0, endTime: this.length, beating: row.b };
            const s = C.regenerateBeating(z); if (!s) continue;
            if (row.zone) C.renderZone(row.zone);
            if (!firstPort) { firstPort = s.port; firstCh = s.channel; }
            const off = row.zone ? 0 : row.offset * 1000;
            s.events.forEach(e => events.push(Object.assign({}, e, { onsetMs: e.onsetMs + off, port: e.port || s.port, channel: e.channel || s.channel })));
            s.slots.forEach(q => slots.set(q.port + '|' + q.channel, q));
        }
        if (!events.length) { this.setStatus('nothing to play', true); return; }
        events.sort((a, c) => a.onsetMs - c.onsetMs);
        const fake = { id: 'bp-pattern', midiSnippet: { port: firstPort, channel: firstCh, events, slots: [...slots.values()], source: 'beating' } };
        await C.playBeatingEvents(fake, events, null, null);
        this._aud = C._beatingAud;
        const btn = this.el.querySelector('#bpPlay'); if (btn) btn.textContent = '■ playing (space)';
        const last = events.reduce((m, e) => Math.max(m, e.onsetMs + (e.durations ? e.durations[0] : 0)), 0);
        clearTimeout(this._audTimer); this._audTimer = setTimeout(() => { this._aud = null; if (btn) btn.innerHTML = '&#9654; play (space)'; }, last + C.BEATING_CENTRE_MS + 100);
        this.setStatus('playing ' + this.rows.length + ' pair' + (this.rows.length > 1 ? 's' : '') + ' · ' + events.length + ' events · SPACE stops');
    },
    stop() { const C = C_(); if (C) C.stopBeatingAudition(); this._aud = null; clearTimeout(this._audTimer); const btn = this.el && this.el.querySelector('#bpPlay'); if (btn) btn.innerHTML = '&#9654; play (space)'; },

    // ------------------------------------------------------------------ takes (bank/panel_snapshots.json, the `beatings` bucket)
    state() { return { length: this.length, rows: this.rows.map(r => ({ layer: r.layer, offset: r.offset, locked: r.locked, scale: r.scale, b: JSON.parse(JSON.stringify(r.b)) })) }; },
    applyState(st) {
        if (!st || !Array.isArray(st.rows)) return;
        this.length = r3(+st.length || 6);
        if (this.bound) {   // a bound zone takes the FIRST row's block; the length stretches the zone
            const r0 = st.rows[0]; if (!r0) return;
            Object.assign(this.bound.beating, r0.b, { partnerLayer: r0.b.partnerLayer });
            this.bound.endTime = r3(this.bound.startTime + this.length);
            this.rows = [this.mkRow(this.bound.layer, this.bound.beating, 0, this.bound)]; this.rows[0].locked = r0.locked !== false; this.rows[0].scale = r0.scale || 6;
            this.changed(this.rows[0], true);
        } else {
            this.rows = st.rows.slice(0, MAX_ROWS).map(r => { const row = this.mkRow(r.layer, JSON.parse(JSON.stringify(r.b)), r.offset || 0, null); row.locked = r.locked !== false; row.scale = r.scale || 6; return row; });
        }
        this.render();
    },
    async refreshTakes() {
        try { const file = await fetch('/api/snapshots', { cache: 'no-store' }).then(x => x.json()); this.takeList = (file && file.panels && file.panels[TAKES_PANEL]) || {}; }
        catch (e) { this.takeList = {}; }
        this.fillTakes();
    },
    takeNames() { const t = this.takeList; return Object.keys(t).sort((a, b) => String(t[b].saved || '').localeCompare(String(t[a].saved || ''))); },
    fillTakes() { const sel = this.el && this.el.querySelector('#bpTakeSel'); if (!sel) return; sel.innerHTML = '<option value="">load take…</option>' + this.takeNames().map(n => '<option value="' + esc(n) + '">' + esc(n) + '</option>').join(''); },
    async postTake(body) { const r = await fetch('/api/snapshots', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(Object.assign({ panel: TAKES_PANEL }, body)) }).then(x => x.json()); if (!r.success) throw new Error(r.error || '?'); return r; },
    takeComment() { return this.rows.map(r => (TRK()[r.layer] || {}).short + '+' + (TRK()[r.b.partnerLayer] || {}).short + ' ' + nn(r.b.pitch) + ' ' + r.b.interval).join(' · ') + ' · ' + this.length + ' s'; },
    async saveTake() {
        const box = this.el.querySelector('#bpTakeName'), d = new Date(), pad = x => String(x).padStart(2, '0');
        const name = (box.value || '').trim() || ('beating ' + d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) + ' ' + pad(d.getHours()) + pad(d.getMinutes()));
        if (!TAKE_NAME.test(name)) { this.setStatus('take not saved: a name is 1–64 letters, digits, dot, underscore, space or hyphen', true); return; }
        try { const r = await this.postTake({ name, comment: this.takeComment(), state: this.state() }); box.value = name; await this.refreshTakes(); this.setStatus('take saved: ' + name + (r.existed ? ' (replaced)' : '') + ' · ' + r.panels + ' in bank/panel_snapshots.json'); }
        catch (e) { this.setStatus('take not saved: ' + e.message, true); }
    },
    loadTake(name) {
        const t = this.takeList[name]; if (!t) { this.setStatus('no take named "' + name + '"', true); return; }
        this.applyState(t.state);
        const box = this.el.querySelector('#bpTakeName'); if (box) box.value = name;
        this.setStatus('take loaded: ' + name + (t.comment ? ' · ' + t.comment : ''));
    },
    async deleteTake() {
        const box = this.el.querySelector('#bpTakeName'), name = (box.value || '').trim();
        if (!name || !this.takeList[name]) { this.setStatus('type or load the name of the take to delete', true); return; }
        if (!window.confirm('Delete take "' + name + '" from bank/panel_snapshots.json?')) return;
        try { const r = await this.postTake({ name, delete: true }); box.value = ''; await this.refreshTakes(); this.setStatus('take deleted: ' + name + ' · ' + r.panels + ' left'); }
        catch (e) { this.setStatus('delete failed: ' + e.message, true); }
    },
};

root.BeatingPanel = P;
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => P.init());
else P.init();

}(typeof self !== 'undefined' ? self : this));
