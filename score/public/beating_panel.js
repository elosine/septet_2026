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
let W = 520;   // the row's drawing width — the page's, read at every render (a full-page drawer, 2026-09-07); 520 the floor
const HR = 150, HL = 50, HB = 56, PADL = 40, PADR = 12;   // the rate area, the level lane, the breath lane, the axis gutters
const ZONE_FILL = { flanger: 'rgba(150,150,170,0.22)', beating: 'rgba(123,63,228,0.30)', roughness: 'rgba(225,70,70,0.38)' };
const COL = { upper: '#ffb347', lower: '#69b7c9', level: '#7ec9a8', breath: '#e0e0e0', bad: '#e88' };
const SHAPES = [['flat', 'flat'], ['rampOut', 'ramp out'], ['rampIn', 'ramp in'], ['hump', 'hump'], ['arc', 'long arc'], ['burst', 'burst']];
// the pitch side (step 5): the keyboard as the strikes drawer draws it, the relations between the pairs (§148: "the thirds, fifths, and just
// Unison … the relationship could be between the three, could be fifths, could be thirds, could be something else"; §158: unison two ways)
const DB_URL = '/bank/scattered_strikes.json';
const SPAN = { lo: 36, hi: 96 }, FULL = { lo: 21, hi: 108 };
const NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const BLACK = [1, 3, 6, 8, 10];
const PC_PALETTE = ['#ffd479', '#7ec9a8', '#8ea9c9', '#c98a8a', '#b58ec9', '#d4c25e', '#69b7c9', '#c9986e', '#96c96e', '#c96ea8', '#8a8ac9', '#e0e0e0'];
const ROW_COLORS = ['#c9a8ff', '#ffb347', '#7ec9a8'];
const RELATIONS = [['unison1', 'unison · 1 oct', 'every pair on the root, one octave (a field on one pitch — the tuba\'s bloom)'], ['unisonOcts', 'unison · octaves', 'the root\'s pitch class spread across octaves, a pair per octave'],
                   ['thirds', 'thirds', 'a stack of thirds from the root (root · +4 · +7)'], ['fourths', 'fourths', 'a stack of fourths (root · +5 · +10)'], ['fifths', 'fifths', 'a stack of fifths (root · +7 · +14)'], ['stack', 'stack', 'the typed stack: semitones above the root, one per pair']];
const parseNote = s => { s = String(s || '').trim(); if (!s) return null; if (/^\d+$/.test(s)) return +s; const m = /^([A-Ga-g])([#b]?)(-?\d)$/.exec(s); if (!m) return null; const pc = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 }[m[1].toUpperCase()] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0); return (parseInt(m[3], 10) + 1) * 12 + pc; };
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const r3 = v => Math.round(v * 1000) / 1000;
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
const nn = m => BC_().noteName(m);

const P = {
    el: null, rows: [], length: 6, bound: null, takeList: {}, _timer: null, _aud: null, _drag: null, status: '',
    db: null, chord: [], chordId: '', armed: null, activeRow: 0, show88: false, rootMode: false, relation: 'unison1',

    // ------------------------------------------------------------------ the chassis
    init() {
        if (this.el) return;
        // THE CHASSIS: a full-page drawer from the bottom, the strikes drawer's (composer, 2026-09-07: "lets make the panel full page like
        // strikes" — the floating box at the top right was not found); ⇕ half / full as the drawer's, a tab at the bottom when closed
        this.restore();
        const d = document.createElement('div');
        d.id = 'beatingPanel';
        d.style.cssText = ['position:fixed', 'left:0', 'right:0', 'bottom:0', 'height:100vh', 'z-index:9000', 'background:#1b1b20', 'border-top:2px solid #7B3FE4',
            'padding:0 12px 8px', 'color:#ddd', 'font:13px/1.45 system-ui,sans-serif', 'box-shadow:0 -8px 30px rgba(0,0,0,.6)', 'display:none', 'flex-direction:column', 'overflow:hidden'].join(';');
        d.innerHTML = [
            '<div id="bpDrag" style="font-weight:600;color:#c9a8ff;margin:0 -12px 8px;padding:7px 12px;border-bottom:1px solid #444;background:rgba(123,63,228,0.18);display:flex;gap:10px;align-items:center">BEATING',
            '<span id="bpTitle" style="font-weight:400;color:#aaa"></span><span style="flex:1 1 auto"></span>',
            '<button id="bpFull" title="full page height / half" style="font-size:12px;cursor:pointer">&#8597; half</button>',
            '<span id="bpClose" title="close (ESC)" style="cursor:pointer;color:#888;font-size:18px;padding:0 4px">&#10005;</span></div>',
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
            '<button id="bpInsert" title="Insert @ playhead: the pattern into the score as its beatings under one group with a META shape (the crescendo&#8217;s mean); the same panel inserting again at the same time replaces its earlier insert, elsewhere makes another; nothing around it touched">insert @ playhead</button>',
            '</div>',
            // THE PITCH SIDE (step 5, §148 / §158): the strikes menu → the keyboard; a note armed by a click lands on the pair whose row is
            // clicked next (or is dragged onto it) as the pair's LOWER note; the relations deal every pair's pitch from a root
            '<div id="bpPitch" style="flex:0 0 auto;display:flex;flex-wrap:wrap;gap:4px 8px;align-items:center;margin-bottom:6px;padding:4px 6px;border:1px solid #3a3a44;border-radius:4px">',
            '<label>strike <select id="bpSrc" style="max-width:190px" title="the played chords from the bank (bank/scattered_strikes.json), numbered as the strikes drawer numbers them"><option value="">the bank&#8230;</option></select></label>',
            '<span style="color:#888">relation</span>',
            '<span id="bpRel"></span>',
            '<input id="bpStack" type="text" value="0 7 12" style="width:64px" title="a typed stack: semitones above the root, one per pair">',
            '<label>root <input id="bpRoot" type="text" placeholder="C4 or 60" style="width:56px" title="a note name or MIDI number; or click a key with root mode on"></label>',
            '<button id="bpDeal" title="deal the pairs&#8217; pitches from the root by the relation, folded into the pairs&#8217; ranges, from the bottom up">deal</button>',
            '<label title="the whole piano instead of the ensemble&#8217;s span"><input id="bp88" type="checkbox"> 88</label>',
            '<span id="bpArmed" style="color:#c9a8ff"></span>',
            '</div>',
            '<div id="bpBody" style="flex:1 1 auto;display:flex;gap:8px;overflow-y:auto;min-height:0;margin:0 -4px;padding:0 4px">',
            '<div id="bpKbWrap" style="flex:0 0 150px"><svg id="bpKb" width="150" style="display:block"></svg></div>',
            '<div id="bpRows" style="flex:1 1 auto;min-width:0"></div>',
            '</div>',
        ].join('');
        document.body.appendChild(d);
        this.el = d;
        const tab = document.createElement('div');
        tab.id = 'beatingTab'; tab.textContent = 'BEATING ▴'; tab.title = 'open the beating panel';
        tab.style.cssText = 'position:fixed;right:124px;bottom:0;z-index:8999;background:#2e1f4a;color:#d9c8ff;border:1px solid #7B3FE4;border-bottom:none;border-radius:6px 6px 0 0;padding:2px 12px;cursor:pointer;font:14px system-ui,sans-serif;letter-spacing:.04em';
        tab.addEventListener('click', () => this.toggle());
        document.body.appendChild(tab);
        d.querySelector('#bpFull').addEventListener('click', () => { this.cfg.full = !this.cfg.full; this.save(); this.applyHeight(); this.render(); });
        window.addEventListener('resize', () => { if (this.isOpen()) this.render(); });
        this.applyHeight();
        d.querySelector('#bpClose').addEventListener('click', () => this.close());
        d.querySelector('#bpAdd').addEventListener('click', () => this.addRow());
        d.querySelector('#bpPlay').addEventListener('click', () => this.play());
        d.querySelector('#bpStop').addEventListener('click', () => this.stop());
        d.querySelector('#bpLen').addEventListener('change', ev => this.setLength(parseFloat(ev.target.value)));
        d.querySelector('#bpTakeSave').addEventListener('click', () => this.saveTake());
        d.querySelector('#bpTakeName').addEventListener('keydown', ev => { if (ev.key !== 'Enter') return; ev.preventDefault(); ev.stopPropagation(); this.saveTake(); });
        d.querySelector('#bpTakeSel').addEventListener('change', ev => { if (ev.target.value) this.loadTake(ev.target.value); ev.target.value = ''; });
        d.querySelector('#bpTakeDel').addEventListener('click', () => this.deleteTake());
        d.querySelector('#bpInsert').addEventListener('click', () => this.insert());
        // the pitch side's controls
        d.querySelector('#bpSrc').addEventListener('change', ev => { this.pickSource(ev.target.value); });
        d.querySelector('#bpRel').innerHTML = RELATIONS.map(([k, l, t]) => '<button class="bpRelBtn" data-rel="' + k + '" title="' + esc(t) + '" style="font-size:12px;padding:1px 5px;margin:1px;cursor:pointer">' + l + '</button>').join('');
        d.querySelectorAll('.bpRelBtn').forEach(b => b.addEventListener('click', () => { this.relation = b.dataset.rel; this.rootMode = true; this.paintRelation(); this.setStatus('relation ' + b.textContent + ' — click a key for the root (or type it) and deal'); }));
        d.querySelector('#bpDeal').addEventListener('click', () => this.deal());
        d.querySelector('#bpRoot').addEventListener('keydown', ev => { if (ev.key !== 'Enter') return; ev.preventDefault(); ev.stopPropagation(); this.deal(); });
        d.querySelector('#bp88').addEventListener('change', ev => { this.show88 = ev.target.checked; this.drawKeyboard(); });
        d.setAttribute('tabindex', '0');
        d.addEventListener('keydown', e => {
            if (e.target.matches('input,select,textarea')) { if (e.key === 'Escape') e.target.blur(); return; }
            if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); if (this.armed != null || this.rootMode) { this.armed = null; this.rootMode = false; this.render(); this.setStatus('disarmed'); } else this.close(); }
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
    // the height: full page or half, remembered in the browser (the strikes drawer's way)
    cfg: { full: true },
    save() { try { localStorage.setItem('septet.beatingPanel.v1', JSON.stringify(this.cfg)); } catch (e) {} },
    restore() { try { const s = JSON.parse(localStorage.getItem('septet.beatingPanel.v1') || 'null'); if (s) Object.assign(this.cfg, s); } catch (e) {} },
    applyHeight() {
        if (!this.el) return;
        const full = this.cfg.full !== false;
        this.el.style.height = full ? '100vh' : '62vh';
        const b = this.el.querySelector('#bpFull'); if (b) b.innerHTML = full ? '&#8597; half' : '&#8597; full';
    },
    bringToFront() {
        let z = 9000;
        document.querySelectorAll('div[id$="Panel"]').forEach(p => { if (p === this.el || p.style.display === 'none') return; const pz = parseInt(window.getComputedStyle(p).zIndex, 10); if (!isNaN(pz) && pz >= z) z = pz + 1; });
        this.el.style.zIndex = String(z);
    },
    setStatus(msg, bad) { this.status = msg; const s = this.el && this.el.querySelector('#bpStatus'); if (s) { s.textContent = msg; s.title = msg; s.style.color = bad ? '#e88' : '#9a9'; } },
    isOpen() { return !!this.el && this.el.style.display !== 'none'; },
    show() { this.init(); this.el.style.display = 'flex'; this.bringToFront(); this.applyHeight(); this.el.focus(); this.refreshTakes(); const b = document.getElementById('beatingBtn'); if (b) { b.style.background = '#3a2a5a'; b.style.color = '#d9c8ff'; } const tab = document.getElementById('beatingTab'); if (tab) tab.style.display = 'none'; },
    close() { if (!this.el) return; this.stop(); this.el.style.display = 'none'; const b = document.getElementById('beatingBtn'); if (b) { b.style.background = ''; b.style.color = ''; } const tab = document.getElementById('beatingTab'); if (tab) tab.style.display = ''; },
    toggle() { this.init(); if (this.isOpen()) { this.close(); return; } const C = C_(), sel = C && C.selectedObject; if (sel && sel.type === 'zone' && sel.midiModel === 'beating') this.openFor(sel); else this.openNew(); },

    // ------------------------------------------------------------------ the two ways in
    // P on a beating: the panel is BOUND to the zone — the row's block is the zone's own, edits regenerate it live
    openFor(zone) {
        this.init(); const C = C_();
        this.bound = zone; C.ensureBeating(zone);
        // a beating of a pattern (step 6): the whole group comes in — every beating with its groupId, a row each, their offsets from the first
        const mates = zone.groupId ? C.objects.filter(o => o.type === 'zone' && o.midiModel === 'beating' && o.groupId === zone.groupId).sort((a, b) => a.startTime - b.startTime) : [zone];
        const first = mates[0].startTime;
        this.patternGroupId = zone.groupId || null; this.insertAt = null;
        this.rows = mates.map(z => { C.ensureBeating(z); return this.mkRow(z.layer, z.beating, r3(z.startTime - first), z); });
        this.length = r3(Math.max(0.1, Math.max.apply(null, mates.map(z => z.endTime - z.startTime))));
        this.activeRow = 0; this.armed = null;
        this.show(); this.render();
        this.setStatus((mates.length > 1 ? 'bound to the pattern ' + zone.groupId + ' (' + mates.length + ' pairs) — every edit regenerates its beatings; insert replaces it in place' : 'bound to ' + C.beatingLabel(zone) + ' — every edit regenerates it') + '; SPACE plays; ESC closes');
        // a beating born on a strike note opens on that strike's chord (the strike by the note's id, its group, or its time)
        this.loadDb().then(() => { const s = this.strikeFor(zone); if (s) this.pickSource(s.id); else this.drawKeyboard(); });
    },
    // the Beating button with nothing bound: an empty pattern that lives here until Insert (step 6)
    openNew() {
        this.init(); const C = C_();
        this.bound = null; this.patternGroupId = null; this.insertAt = null;
        // the starting point (§160, kept as a convenience): a selected strike note gives the first row its pitch and the insert its time — no link
        const sel = C && C.selectedObject, note = (sel && sel.type === 'waveCurve' && sel.sonifyNote != null && sel.layer < METAL() && sel.layer !== 2) ? sel : null;
        if (!this.rows.length || this.rows.some(r => r.zone) || note) { this.rows = []; const r = this.defaultRow(note ? note.layer : (C ? C.activeLane : 3)); if (r) this.rows.push(r); }
        if (note && this.rows[0]) {
            const r = this.rows[0]; if (this.rowCanPlay(r, note.sonifyNote)) r.b.pitch = note.sonifyNote; else { const c = C.beatingPartnerCandidates(r.layer, note.sonifyNote, 'unison'); if (c.length) { r.b.pitch = note.sonifyNote; r.b.partnerLayer = c[0].layer; } }
            this.insertAt = r3(note.startSeconds);
        }
        this.activeRow = 0; this.armed = null;
        this.show(); this.render();
        this.setStatus(this.rows.length ? 'a new pattern' + (note ? ' from the strike note ' + nn(note.sonifyNote) + ' at ' + note.startSeconds.toFixed(2) + ' s (its pitch on the first pair, its onset the insert time — no link)' : '') + ' — pick a strike or deal a relation for the pitches, shapes pop in from the menu, SPACE plays it, insert puts it in the score' : 'no pair can be made on this lane', !this.rows.length);
        this.loadDb().then(() => this.drawKeyboard());
    },
    mkRow(layer, b, offset, zone) { return { layer, b, offset: offset || 0, zone: zone || null, locked: true, draw: false, scale: 6, out: null }; },
    // a new pair on a lane: the partner the nearest lane that can pair on the lane's middle note — never a player already in the
    // pattern (a player in two pairs would carry two bend streams on one channel: a sum, wrong); the rows warn if it happens by hand
    defaultRow(layer, used) {
        const C = C_(), BC = BC_(); if (!C || !BC) return null;
        const M = METAL(); if (layer == null || layer >= M || layer === 2) layer = 3;
        const me = TRK()[layer] && TRK()[layer].instKey; if (!me) return null;
        const r = BC.ordinaryRange(INST(), me); let pitch = r ? Math.round((r[0] + r[1]) / 2) : 60;
        const free = c => !used || !used.has(c.layer);
        let cands = C.beatingPartnerCandidates(layer, pitch, 'unison').filter(free);
        if (!cands.length) { pitch = 60; cands = C.beatingPartnerCandidates(layer, pitch, 'unison').filter(free); }
        if (!cands.length && r) { for (let p = r[0]; p <= r[1] && !cands.length; p += 3) { cands = C.beatingPartnerCandidates(layer, p, 'unison').filter(free); if (cands.length) pitch = p; } }
        if (!cands.length) return null;
        cands.sort((a, c) => Math.abs(a.layer - layer) - Math.abs(c.layer - layer) || a.layer - c.layer);
        const b = C.beatingDefaults(layer, 0, pitch, cands[0].layer);
        b.shape = 'hump';
        return this.mkRow(layer, b, 0, null);
    },
    usedLayers(except) { const used = new Set(); this.rows.forEach(r => { if (r === except) return; used.add(r.layer); if (r.b.partnerLayer != null) used.add(r.b.partnerLayer); }); return used; },
    addRow() {
        if (this.rows.length >= MAX_ROWS) { this.setStatus('three pairs at most (the six bending players)', true); return; }
        if (this.bound && !this.patternGroupId) { this.setStatus('a lone beating is one pair — for a pattern of several open a new pattern (Beating with nothing selected), or insert this one and add to its group', true); return; }
        const used = this.usedLayers();
        const free = [0, 1, 3, 4, 5, 6].filter(L => !used.has(L));
        let r = null; for (const L of free) { r = this.defaultRow(L, used); if (r) break; }
        if (!r) { this.setStatus('no free pair — every bending player is in the pattern', true); return; }
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
        this.el.querySelector('#bpTitle').textContent = this.patternGroupId ? '— pattern ' + this.patternGroupId + ' · ' + this.rows.length + ' pair' + (this.rows.length > 1 ? 's' : '') : this.bound ? '— ' + (TRK()[this.bound.layer] || {}).short + ' ' + this.bound.startTime.toFixed(2) + ' s' : '— new pattern' + (this.insertAt != null ? ' @ ' + this.insertAt.toFixed(2) + ' s' : '');
        this.el.querySelector('#bpAdd').disabled = (!!this.bound && !this.patternGroupId) || this.rows.length >= MAX_ROWS;
        this.el.querySelector('#bpInsert').textContent = this.patternGroupId ? 'insert (replace the pattern)' : 'insert @ ' + (this.insertAt != null ? this.insertAt.toFixed(2) + ' s' : 'playhead');
        const host = this.el.querySelector('#bpRows'); host.innerHTML = '';
        W = Math.max(520, (host.clientWidth || 0) - 24);   // the drawings fill the page
        this.rows.forEach((row, i) => { this.rowOut(row); host.appendChild(this.buildRow(row, i)); });
        if (!this.rows.length) host.innerHTML = '<div style="color:#888;padding:12px">no pairs — + pair</div>';
        if (this.activeRow >= this.rows.length) this.activeRow = Math.max(0, this.rows.length - 1);
        this.drawKeyboard(); this.paintRelation();
        const ar = this.el.querySelector('#bpArmed'); if (ar) ar.textContent = this.armed != null ? nn(this.armed) + ' armed — click a pair (or drag it there)' : (this.rootMode ? 'root mode: click a key' : '');
    },
    paintRelation() { this.el.querySelectorAll('.bpRelBtn').forEach(b => { const on = b.dataset.rel === this.relation; b.style.background = on ? '#7B3FE4' : ''; b.style.color = on ? '#fff' : ''; b.style.borderColor = on ? '#7B3FE4' : ''; }); },
    buildRow(row, i) {
        const C = C_(), BC = BC_(), b = row.b, out = row.out, T = TRK();
        const me = T[row.layer] ? T[row.layer].label : '?', cands = C.beatingPartnerCandidates(row.layer, b.pitch, b.interval);
        const lim = k => k ? BC.bendLimits(INST(), k) : null, lo = lim(out.players.lower), up = lim(out.players.upper);
        const fl = out.flags.map(f => f.flag).filter((v, j, a) => a.indexOf(v) === j);
        { const used = this.usedLayers(row); const twice = [row.layer, b.partnerLayer].filter(L => L != null && used.has(L)).map(L => T[L].short); if (twice.length) fl.push('⚠ ' + twice.join(', ') + ' also in another pair — one channel would carry two bends'); }
        const iv = BC.INTERVALS[b.interval] || BC.INTERVALS.unison;
        const box = document.createElement('div');
        box.className = 'bpRow'; box.dataset.row = i;
        box.style.cssText = 'border:1px solid #444;border-left:4px solid ' + ROW_COLORS[i % ROW_COLORS.length] + ';border-radius:5px;padding:6px 8px;margin-bottom:8px;background:' + (i === this.activeRow ? 'rgba(123,63,228,0.08)' : 'rgba(255,255,255,0.03)');
        // the pitch side: a click on the row's header takes the armed note (or makes the row the active one — the keyboard dims for it);
        // a note dragged from the keyboard lands the same way
        box.addEventListener('click', ev => { if (ev.target.closest('input, select, button, svg')) return; if (this.armed != null) this.assign(i, this.armed); else if (this.activeRow !== i) { this.activeRow = i; this.render(); } });
        box.addEventListener('dragover', ev => { ev.preventDefault(); box.style.outline = '2px dashed ' + ROW_COLORS[i % ROW_COLORS.length]; });
        box.addEventListener('dragleave', () => { box.style.outline = ''; });
        box.addEventListener('drop', ev => { ev.preventDefault(); box.style.outline = ''; const m = parseInt(ev.dataTransfer.getData('text/plain'), 10); if (!isNaN(m)) this.assign(i, m); });
        const sel = 'background:#7B3FE4;color:#fff;border-color:#7B3FE4;';
        const btn = (cls, data, label, on, title) => '<button class="' + cls + '" ' + data + ' title="' + esc(title || '') + '" style="font-size:12px;padding:1px 5px;margin:1px;cursor:pointer;' + (on ? sel : '') + '">' + label + '</button>';
        box.innerHTML = [
            '<div style="display:flex;flex-wrap:wrap;gap:4px 8px;align-items:center;margin-bottom:4px">',
            '<b style="color:#c9a8ff">pair ' + (i + 1) + '</b> ',
            (row.zone ? '<span>' + esc(me) + '</span>' : '<select class="bpLane" title="the launching player">' + [0, 1, 3, 4, 5, 6].map(L => '<option value="' + L + '"' + (L === row.layer ? ' selected' : '') + '>' + esc(T[L].label) + '</option>').join('') + '</select>'),
            ' + <select class="bpPartner" title="the lanes whose player holds the note (step 1&#8217;s table)">' + (cands.length ? '' : '<option value="">no partner can play this</option>')
                + cands.map(c => '<option value="' + c.layer + '"' + (c.layer === b.partnerLayer ? ' selected' : '') + '>' + esc(T[c.layer].label) + (b.interval === 'unison' ? '' : c.upper === c.instKey ? ' (above)' : ' (below)') + '</option>').join('')
                + (b.partnerLayer != null && !cands.some(c => c.layer === b.partnerLayer) && T[b.partnerLayer] ? '<option value="' + b.partnerLayer + '" selected>' + esc(T[b.partnerLayer].label) + ' — cannot play this</option>' : '') + '</select>',
            ' on <input class="bpPitch" type="number" value="' + b.pitch + '" min="21" max="108" step="1" style="width:50px" title="the pair&#8217;s lower note"> <span style="color:#aaa">' + nn(b.pitch) + (iv.semitones ? ' + ' + nn(b.pitch + iv.semitones) : '') + '</span>',
            ' <span>' + Object.values(BC.INTERVALS).map(q => btn('bpIv', 'data-iv="' + q.key + '"', q.label, b.interval === q.key, q.label + ': the just offset ' + q.justOffsetCents + ' c on the upper note, the beating ' + q.partial + '× per cent')).join('') + '</span>',
            (row.zone ? '' : ' <button class="bpRemove" title="remove this pair" style="margin-left:auto;font-size:12px;cursor:pointer">&#10005; pair</button>'),
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
        [S, S / 2, -S / 2, -S].forEach(v => { svg.appendChild(mk('line', { x1: x0, x2: x1, y1: Y(v), y2: Y(v), stroke: '#333', 'stroke-dasharray': '2 4' })); const t = mk('text', { x: 2, y: Y(v) + 4, fill: '#777', 'font-size': 11 }); t.textContent = (v > 0 ? '+' : '') + v; svg.appendChild(t); });
        const zt = mk('text', { x: 2, y: mid + 4, fill: '#999', 'font-size': 11 }); zt.textContent = '0'; svg.appendChild(zt);
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
        const nmU = mk('text', { x: x1 - 4, y: 12, fill: COL.upper, 'font-size': 12, 'text-anchor': 'end' }); nmU.textContent = (out.players.upper || '?') + ' ↑' + (b.slide && b.slide.upper ? ' slid ' + b.slide.upper + ' s' : ''); svg.appendChild(nmU);
        const nmL = mk('text', { x: x1 - 4, y: HR - 5, fill: COL.lower, 'font-size': 12, 'text-anchor': 'end' }); nmL.textContent = (out.players.lower || '?') + ' ↓' + (b.slide && b.slide.lower ? ' slid ' + b.slide.lower + ' s' : ''); svg.appendChild(nmL);
        const beatT = mk('text', { x: x0 + 4, y: 12, fill: '#c9a8ff', 'font-size': 12 }); beatT.textContent = 'beating ' + out.maxBeat + '/s max' + (row.locked ? ' · mirrored' : ' · free'); svg.appendChild(beatT);
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
        const tip = document.createElementNS('http://www.w3.org/2000/svg', 'text'); tip.setAttribute('fill', '#fff'); tip.setAttribute('font-size', '12'); svg.appendChild(tip);
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
        [0, 0.5, 1].forEach(v => { const t = mk('text', { x: 2, y: Y(v) + 3, fill: '#777', 'font-size': 11 }); t.textContent = v; svg.appendChild(t); });
        const lbl = mk('text', { x: x1 - 4, y: 11, fill: COL.level, 'font-size': 12, 'text-anchor': 'end' }); lbl.textContent = b.levelCurve ? 'own curve' : 'follows the beating · ' + b.levelLo + ' → ' + b.levelHi; svg.appendChild(lbl);
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
        const rowsY = { upper: 15, lower: 41 };
        let warn = 0;
        for (const who of ['upper', 'lower']) {
            const br = out.breaths[who], inst = out.players[who], y = rowsY[who], col = who === 'upper' ? COL.upper : COL.lower;
            const nm = mk('text', { x: 2, y: y + 4, fill: col, 'font-size': 11 }); nm.textContent = (inst || '?').slice(0, 5); svg.appendChild(nm);
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
            const ct = mk('text', { x: x1 - 4, y: y + 4, fill: '#888', 'font-size': 11, 'text-anchor': 'end' }); ct.textContent = br.ceiling.kind + ' ≤ ' + br.ceiling.seconds + ' s'; svg.appendChild(ct);
        }
        svg.style.cursor = 'copy';
        svg.addEventListener('mousedown', e => {   // a click on the lane adds a hand mark for that player
            if (e.target.tagName === 'circle') return;
            const r = svg.getBoundingClientRect(); const who = (e.clientY - r.top) < 28 ? 'upper' : 'lower'; const t = r3(clamp((e.clientX - r.left - x0) / (x1 - x0) * L, 0.1, L - 0.1));
            if (!b.breath.marks) b.breath.marks = { lower: [], upper: [] }; if (!b.breath.marks[who]) b.breath.marks[who] = [];
            b.breath.mode = 'designated'; b.breath.marks[who] = b.breath.marks[who].concat([t]).sort((p, q) => p - q);   // a hand mark; the deal keeps it
            this.changed(row, true); this.render();
        });
        if (info) { info.textContent = (b.breath.mode === 'continuous' ? 'one long note each — re-bow at will' : b.breath.mode === 'one' ? 'a single bow or breath each' : 'designated: ' + (out.breaths.lower.marks || []).length + ' + ' + (out.breaths.upper.marks || []).length + ' marks' + (b.breath.deal === false ? ' (by hand)' : ', dealt')) + (warn ? ' · ⚠ ' + warn + ' past the ceiling' : ''); info.style.color = warn ? COL.bad : '#888'; }
    },

    // ------------------------------------------------------------------ the pitch side (step 5): the bank, the keyboard, assigning, the relations
    async loadDb() {
        if (this.db) return this.db;
        try { const r = await fetch(DB_URL + '?t=' + Date.now(), { cache: 'no-store' }); if (!r.ok) throw new Error('HTTP ' + r.status); this.db = await r.json(); }
        catch (e) { this.setStatus('the bank of strikes could not be read (' + e.message + ') — the keyboard works without it', true); this.db = { strikes: {}, sequences: {} }; }
        this.fillSources();
        return this.db;
    },
    // the strikes in sequence order, numbered as the drawer numbers them (index · t0 · notes)
    sourceList() {
        const db = this.db; if (!db) return [];
        const seqs = Object.values(db.sequences || {}), out = [];
        seqs.forEach(sq => (sq.strikeIds || []).forEach(sid => { const s = db.strikes[sid]; if (s) out.push(s); }));
        if (!out.length) Object.values(db.strikes || {}).forEach(s => out.push(s));
        return out;
    },
    fillSources() {
        const sel = this.el && this.el.querySelector('#bpSrc'); if (!sel) return;
        sel.innerHTML = '<option value="">the bank…</option>' + this.sourceList().map(s => '<option value="' + esc(s.id) + '"' + (s.id === this.chordId ? ' selected' : '') + '>#' + s.index + ' · ' + s.t0.toFixed(2) + ' s · ' + s.notes.length + ' n · ' + nn(s.stats.midi.min) + '–' + nn(s.stats.midi.max) + '</option>').join('');
    },
    pickSource(id) {
        const s = this.db && this.db.strikes && this.db.strikes[id];
        this.chordId = s ? id : ''; this.chord = s ? s.notes.map(n => ({ midi: n.midi, instKey: n.instKey, id: n.objectId })) : [];
        const sel = this.el.querySelector('#bpSrc'); if (sel) sel.value = this.chordId;
        this.rootMode = false; this.drawKeyboard();
        if (s) this.setStatus('strike #' + s.index + ' (' + s.t0.toFixed(2) + ' s, ' + s.notes.length + ' notes) on the keyboard — click a note, then a pair; the dimmed keys are what the active pair cannot play');
    },
    // the strike a bound beating was born on: the note's id in the bank, its strike group's index, or its onset
    strikeFor(zone) {
        const db = this.db; if (!db || !zone) return null;
        const C = C_(), b = zone.beating || {}, note = b.launchedFrom ? C.objects.find(o => o.id === b.launchedFrom) : null;
        const all = Object.values(db.strikes || {});
        let s = note ? all.find(q => q.notes.some(n => n.objectId === note.id)) : null;
        if (!s && note && note.groupId) { const m = /^grp-strike-(\d+)-/.exec(note.groupId); if (m) s = this.sourceList().find(q => q.index === +m[1]) || all.find(q => q.index === +m[1]); }
        if (!s) { const t = note ? note.startSeconds : zone.startTime; s = all.find(q => Math.abs(q.t0 - t) < 0.1) || null; }
        return s;
    },
    range() { return this.show88 ? FULL : SPAN; },
    pcColor(pc) { const pcs = [...new Set(this.chord.map(n => ((n.midi % 12) + 12) % 12))].sort((a, b) => a - b); const i = pcs.indexOf(pc); return PC_PALETTE[(i >= 0 ? i : pc) % PC_PALETTE.length]; },
    // can this row's pair play the note as its lower note (step 1's table: at unison both hold it; at an interval one the lower, one the upper)
    rowCanPlay(row, m) {
        const C = C_(), b = row.b, me = TRK()[row.layer] && TRK()[row.layer].instKey, other = b.partnerLayer != null && TRK()[b.partnerLayer] ? TRK()[b.partnerLayer].instKey : null;
        if (!me || !other) return false;
        return C.beatingPartnerCandidates(row.layer, m, b.interval).some(c => c.instKey === other);
    },
    // the keyboard: the drawer's drawing — vertical keys, the C labels, the chord's notes as dots in their pitch-class colours with their names,
    // the rows' pair notes as rings in the row colours, the keys the active pair cannot play dimmed; a click arms a note (or sets the root)
    drawKeyboard() {
        const svg = this.el && this.el.querySelector('#bpKb'); if (!svg) return;
        const R = this.range(), h = 10, rows = R.hi - R.lo + 1, H = rows * h + 14, keyY = m => 6 + (R.hi - m) * h;
        svg.setAttribute('height', H); svg.style.height = H + 'px';
        const row = this.rows[this.activeRow], rc = ROW_COLORS[this.activeRow % ROW_COLORS.length];
        let s = '';
        for (let m = R.hi; m >= R.lo; m--) {
            const y = keyY(m), black = BLACK.includes(m % 12), can = row ? this.rowCanPlay(row, m) : true;
            s += '<rect class="bpKey" data-m="' + m + '" x="30" y="' + (y + 0.5) + '" width="' + (black ? 54 : 90) + '" height="' + (h - 1) + '" fill="' + (black ? '#2a2a30' : '#d8d3c8') + '" fill-opacity="' + (can ? 1 : 0.22) + '" stroke="#111" stroke-width="0.5" style="cursor:pointer"><title>' + nn(m) + (can ? '' : ' — the active pair cannot play it') + '</title></rect>';
            if (m % 12 === 0) s += '<text x="2" y="' + (y + h * 0.85) + '" font-size="10" fill="#777">C' + (m / 12 - 1) + '</text>';
        }
        // the rows' pair notes: rings (the lower note filled, the upper hollow) in the row colour, at the right
        this.rows.forEach((r, i) => {
            const out = r.out || this.rowOut(r), col = ROW_COLORS[i % ROW_COLORS.length], iv = BC_().INTERVALS[r.b.interval] || BC_().INTERVALS.unison;
            const lo = r.b.pitch, up = r.b.pitch + iv.semitones;
            [[lo, true], [up, iv.semitones > 0]].forEach(([m, show]) => { if (!show || m < R.lo || m > R.hi) return; const cy = keyY(m) + h / 2; s += '<circle cx="' + (128 + i * 7) + '" cy="' + cy + '" r="4" fill="' + (m === lo ? col : 'none') + '" stroke="' + col + '" stroke-width="1.5"><title>pair ' + (i + 1) + ': ' + nn(m) + (m === lo ? ' (lower)' : ' (upper)') + '</title></circle>'; });
        });
        // the chord's notes: dots with their names, draggable onto a row
        const byPitch = {}; this.chord.forEach(n => { (byPitch[n.midi] = byPitch[n.midi] || []).push(n); });
        Object.keys(byPitch).forEach(p => {
            const m = +p; if (m < R.lo || m > R.hi) return;
            const pc = ((m % 12) + 12) % 12, col = this.pcColor(pc), cy = keyY(m) + h / 2, k = byPitch[p].length;
            s += '<circle class="bpDot" data-m="' + m + '" cx="106" cy="' + cy + '" r="' + (3.2 + Math.min(2, k - 1)) + '" fill="' + col + '" stroke="' + (this.armed === m ? '#fff' : col) + '" stroke-width="' + (this.armed === m ? 2.2 : 1) + '" style="cursor:grab"><title>' + nn(m) + (k > 1 ? ' ×' + k : '') + ' — click to arm, drag onto a pair</title></circle>';
            s += '<text x="27" y="' + (cy + 3) + '" font-size="10" fill="' + col + '" text-anchor="end">' + nn(m) + '</text>';
        });
        const above = this.chord.filter(n => n.midi > R.hi).length, below = this.chord.filter(n => n.midi < R.lo).length;
        if (above) s += '<text x="100" y="8" fill="#e88" font-size="11">▲' + above + '</text>';
        if (below) s += '<text x="100" y="' + (H - 2) + '" fill="#e88" font-size="11">▼' + below + '</text>';
        if (this.armed != null && this.armed >= R.lo && this.armed <= R.hi) s += '<rect x="28" y="' + (keyY(this.armed) - 0.5) + '" width="94" height="' + (h + 1) + '" fill="none" stroke="#fff" stroke-width="1.2" pointer-events="none"/>';
        svg.innerHTML = s;
        svg.querySelectorAll('.bpKey').forEach(k => k.addEventListener('click', () => this.keyClick(+k.dataset.m)));
        svg.querySelectorAll('.bpDot').forEach(d => {
            d.addEventListener('click', ev => { ev.stopPropagation(); this.keyClick(+d.dataset.m); });
            d.addEventListener('mousedown', ev => { ev.preventDefault(); this.startDotDrag(+d.dataset.m, ev); });
        });
    },
    keyClick(m) {
        if (this.rootMode) { const rb = this.el.querySelector('#bpRoot'); if (rb) rb.value = nn(m); this.rootMode = false; this.deal(m); return; }
        this.armed = this.armed === m ? null : m;
        this.render();
        if (this.armed != null) this.setStatus(nn(m) + ' armed — click a pair to give it the note (its lower note), ESC or click it again to disarm' + (this.rows[this.activeRow] && !this.rowCanPlay(this.rows[this.activeRow], m) ? ' · the active pair cannot play it' : ''));
    },
    // a dot dragged onto a row: our own drag (SVG elements do not take the browser's drag); the row under the pointer at release takes the note
    startDotDrag(m, e0) {
        const ghost = document.createElement('div'); ghost.textContent = nn(m); ghost.style.cssText = 'position:fixed;z-index:9999;pointer-events:none;padding:1px 5px;border-radius:3px;background:#7B3FE4;color:#fff;font:13px system-ui;left:' + (e0.clientX + 8) + 'px;top:' + (e0.clientY - 8) + 'px';
        document.body.appendChild(ghost); let moved = false, over = null;
        const rows = [...this.el.querySelectorAll('.bpRow')];
        const mark = rowEl => { over = rowEl; rows.forEach(r => { r.style.outline = r === rowEl ? '2px dashed #c9a8ff' : ''; }); };
        // the row under the pointer: by the rows' own mouseover (robust when the pane cannot hit-test) and by hit-testing
        const overs = rows.map(r => { const f = () => mark(r); r.addEventListener('mouseover', f); return f; });
        const onMove = ev => { moved = true; ghost.style.left = (ev.clientX + 8) + 'px'; ghost.style.top = (ev.clientY - 8) + 'px'; const el = document.elementFromPoint(ev.clientX, ev.clientY); const rowEl = el && el.closest ? el.closest('.bpRow') : null; if (rowEl || !over) mark(rowEl); };
        const onUp = ev => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); rows.forEach((r, i) => r.removeEventListener('mouseover', overs[i])); ghost.remove(); rows.forEach(r => { r.style.outline = ''; }); if (moved && over) this.assign(+over.dataset.row, m); else if (!moved) this.keyClick(m); };
        window.addEventListener('mousemove', onMove); window.addEventListener('mouseup', onUp);
    },
    // the note becomes the pair's lower note; the interval places the partner; refused when the pair cannot play it
    assign(i, m) {
        const row = this.rows[i]; if (!row) return;
        this.armed = null; this.activeRow = i;
        if (!this.rowCanPlay(row, m)) { this.render(); this.setStatus('pair ' + (i + 1) + ' cannot play ' + nn(m) + (row.b.interval === 'unison' ? '' : ' with its ' + row.b.interval) + ' — the dimmed keys are out of its reach; another pair, or another note', true); return; }
        row.b.pitch = m;
        this.changed(row, true); this.render();
        this.setStatus('pair ' + (i + 1) + ' on ' + nn(m) + (row.b.interval === 'unison' ? '' : ' + ' + nn(m + (BC_().INTERVALS[row.b.interval] || {}).semitones)) + ' — ' + (row.out ? row.out.players.lower + ' below, ' + row.out.players.upper + ' above' : ''));
    },
    // the relation from a root: every pair's pitch by the relation, folded by octave into what the pair can play (the drawer's fold rule),
    // the pairs from the bottom up
    deal(rootIn) {
        const rb = this.el.querySelector('#bpRoot'), root = rootIn != null ? rootIn : parseNote(rb && rb.value);
        if (root == null) { this.rootMode = true; this.render(); this.setStatus('no root — click a key, or type one (C4 or 60) and ENTER', true); return; }
        if (!this.rows.length) return;
        const rel = this.relation || 'unison1';
        const stack = (this.el.querySelector('#bpStack').value || '0').trim().split(/[\s,]+/).map(Number).filter(v => !isNaN(v));
        const offs = rel === 'unison1' ? [0, 0, 0] : rel === 'unisonOcts' ? [0, 12, 24] : rel === 'thirds' ? [0, 4, 7] : rel === 'fourths' ? [0, 5, 10] : rel === 'fifths' ? [0, 7, 14] : stack;
        const placed = [], skipped = [];
        this.rows.forEach((row, i) => {
            const target = root + (offs[i] != null ? offs[i] : offs[offs.length - 1] || 0);
            let best = null;
            for (let m = target - 48; m <= target + 48; m += 12) { if (m < 21 || m > 108 || !this.rowCanPlay(row, m)) continue; if (!best || Math.abs(m - target) < Math.abs(best - target)) best = m; }
            if (best == null) { skipped.push('pair ' + (i + 1)); return; }
            row.b.pitch = best; this.changed(row, true);
            placed.push('pair ' + (i + 1) + ' ' + nn(best) + (best !== target ? (best > target ? ' ↑' : ' ↓') : ''));
        });
        this.rootMode = false; this.render();
        this.setStatus('dealt ' + (RELATIONS.find(r => r[0] === rel) || [])[1] + ' from ' + nn(root) + ': ' + placed.join(' · ') + (skipped.length ? ' · out of reach: ' + skipped.join(', ') : ''), !!skipped.length);
    },

    // ------------------------------------------------------------------ the audition: all pairs, timestamped, through the tick's event path
    async play() {
        const C = C_(); if (!C || !this.rows.length) return;
        this.stop();
        const events = [], slots = new Map();
        let firstPort = null, firstCh = 1;
        const firstStart = Math.min.apply(null, this.rows.filter(r => r.zone).map(r => r.zone.startTime).concat([Infinity]));
        for (const row of this.rows) {
            const z = row.zone || { id: 'bp-row-' + this.rows.indexOf(row), type: 'zone', layer: row.layer, startTime: 0, endTime: this.length, beating: row.b };
            const s = C.regenerateBeating(z); if (!s) continue;
            if (row.zone) C.renderZone(row.zone);
            if (!firstPort) { firstPort = s.port; firstCh = s.channel; }
            const off = row.zone ? (isFinite(firstStart) ? (row.zone.startTime - firstStart) * 1000 : 0) : row.offset * 1000;   // a bound group plays at its own offsets
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

    // ------------------------------------------------------------------ insertion (step 6, §160: its own thing — nothing around it touched)
    // the pattern into the score as one gesture: a `beating` zone per row on its launching lane at the insert time + the row's offset, all
    // under one new group id with a META shape whose contour is the crescendo's mean across the pattern (BeatingCalc.renderPattern);
    // the panel remembers the group. The same panel inserting again at the same time (within 100 ms) REPLACES its earlier insert; at
    // another time it makes a second group (the strikes drawer's rule, §113); a panel bound to a group replaces that group in place.
    // No note is muted or eaten or greyed; the accents are his to add by hand.
    removeGroup(groupId) {
        const C = C_(); if (!groupId) return 0;
        const gone = C.objects.filter(o => o.groupId === groupId);
        gone.forEach(o => { if (o.type === 'zone' && o.midiModel === 'beating') C.removeBeatingDecor(o); if (o._els) { if (o._els.group) o._els.group.remove(); if (o._els.groups) o._els.groups.forEach(g => g.remove()); } C.elementCache.delete(o.id); if (C.selectedObject === o) C.deselectAll(); });
        C.objects = C.objects.filter(o => o.groupId !== groupId);
        return gone.length;
    },
    insert() {
        const C = C_(), BC = BC_(); if (!C || !BC || !this.rows.length) { this.setStatus('nothing to insert', true); return; }
        const M = METAL();
        const groupStart = this.patternGroupId ? Math.min.apply(null, C.objects.filter(o => o.groupId === this.patternGroupId && o.type === 'zone').map(o => o.startTime).concat([Infinity])) : Infinity;
        const t = isFinite(groupStart) ? groupStart : (this.insertAt != null ? this.insertAt : Math.max(0, +C.getTimeAtPlayhead().toFixed(3)));
        const rowsSpec = this.rows.map(r => ({ layer: r.layer, b: JSON.parse(JSON.stringify(r.b)), offset: r.zone && isFinite(groupStart) ? r3(r.zone.startTime - groupStart) : (r.offset || 0), length: r.zone ? r3(r.zone.endTime - r.zone.startTime) : this.length }));
        C.pushUndoState();
        let replaced = 0;
        if (this.patternGroupId && (isFinite(groupStart) ? true : false)) { if (Math.abs(groupStart - t) < 0.1) replaced = this.removeGroup(this.patternGroupId); }
        else if (this.lastInsert && Math.abs(this.lastInsert.t - t) < 0.1) replaced = this.removeGroup(this.lastInsert.group);
        const group = 'grp-beating-' + Math.floor(t * 10) + '-' + (C.nextId++);
        const zones = [];
        rowsSpec.forEach(rs => {
            const z = C.createZone({ layer: rs.layer, startTime: r3(t + rs.offset), endTime: r3(t + rs.offset + rs.length), zoneFunction: 'midiPreview', midiModel: 'beating', color: '#7B3FE4', opacity: 0.16, zoneHeight: 0.96, yOffset: 0.5, performanceNotes: 'beating' });
            C.undoStack.pop();   // createZone pushes its own undo step; the insert is ONE step
            z.groupId = group; z.beating = rs.b; z.beating.launchedFrom = null;
            C.regenerateBeating(z); C.renderZone(z);
            zones.push(z);
        });
        // the META shape: the crescendo's mean across the pattern as its contour (§160), the pattern's whole span
        const pat = BC.renderPattern({ length: this.length, pairs: rowsSpec.map(rs => Object.assign({}, C.beatingSpec({ layer: rs.layer, startTime: 0, endTime: rs.length, beating: rs.b }), { length: rs.length })), offsets: rowsSpec.map(rs => rs.offset) }, INST());
        const patLen = Math.max(0.1, pat.length);
        const nodes = pat.contour.map(([tt, lv], i, a) => ({ pos: i === a.length - 1 ? 1 : Math.round((tt / patLen) * 10000) / 10000, y: Math.round(Math.max(0, Math.min(1, lv)) * 100) / 10, smooth: 0 }));
        const shape = { id: 'wc-' + (C.nextId++), type: 'waveCurve', layer: M, groupId: group, startSeconds: r3(t), endSeconds: r3(t + patLen),
            nodes, segments: nodes.slice(0, -1).map(() => ({ model: 'power', slope: 0 })), color: '#7B3FE4', fillMode: 'bottom', opacity: 0.6,
            performanceNotes: 'beating pattern · ' + zones.length + ' pair' + (zones.length > 1 ? 's' : '') + ' (drag = move, box = stretch)', properties: {} };
        C.objects.push(shape);
        C.lastInsertGroup = group; this.lastInsert = { group, t };
        if (typeof C.openMetaWin === 'function') C.openMetaWin();
        C.renderAll(); C.markDirty();
        C.selectObject(shape);   // the handle: a drag moves the whole pattern, the box stretches it, DELETE removes all of it
        this.openFor(zones[0]);
        this.setStatus('inserted ' + zones.length + ' pair' + (zones.length > 1 ? 's' : '') + ' at ' + t.toFixed(3) + ' s as ' + group + (replaced ? ' · replaced the earlier insert at this time (' + replaced + ' objects)' : '') + ' — the shape on META is the handle; nothing around it touched');
    },

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
