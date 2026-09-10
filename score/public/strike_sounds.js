// strike_sounds.js — THE SOUND AT AN ONSET: a note (as always), or a CHORD dealt over the players free there (the overnight revision of
// 2026-09-10, his commission — STRIKES_TOOL §AD; RUNNING_LOG §333–334).
//
// His words: *"All I really want to do too with the enhancements were to replace those individual notes with different things. So one
// would be... instead of a single note, multiple notes. So more than one instrument playing that that rhythmic position. A chord. …
// maybe the best way is that I use the regular strikes to create the rhythm. And let's see. I generate thirteen onsets and maybe for
// each onset, I could click it and then choose something from the drawer, a harmony. and then the algorithm will orchestrate it for me.
// so that it knows the available musicians for that particular one. In any case, try to simplify it."*
//
// So, in NOTES mode, with the rhythm column untouched:
//   · double-click (or ALT-click) an onset dot on the rhythm strip → a small card for THAT onset;
//   · while the card is open, a click on any row of the left column (a strike, a blast, a chord shape, a stack …) makes that harmony the
//     sound at the onset: its notes dealt over the players FREE at that moment (the re-attack rule against the pattern's real onsets, the
//     notes by register, folded into each player's range, on that player's current row voice), the onset's own note replaced;
//   · `all onsets ← this harmony` and `all onsets ← the banner in turn` do the whole pattern at once; `note` puts an onset back;
//   · Hear and Insert see the chords through the drawer's own notesFor — nothing new in the score's file format (ordinary strike notes);
//     with the sound switch on `crescendo`, a chord's notes become swells like any other note at that onset.
//
// The sounds ride in cfg (so in takes and in the browser). REVERT: the git tag pre-revision-2026-09-10, or
// localStorage.setItem('septet.strikes.classic', '1') + reload, which makes this file do nothing.
(function (root) {
'use strict';
const D = root.StrikeDrawer;
if (!D) { console.warn('[strike_sounds] the strikes drawer is not loaded'); return; }
let CLASSIC = false; try { CLASSIC = !!localStorage.getItem('septet.strikes.classic'); } catch (e) {}
if (CLASSIC) { console.log('[strike_sounds] classic mode — the sound-at-an-onset revision is off'); return; }

const SC = () => root.StrikeChords || null;
const HS = () => root.HarmSource || null;
const TRK = () => (typeof TRACKS !== 'undefined') ? TRACKS : (root.TRACKS || []);
const INP = 'background:#111114;color:#ddd;border:1px solid #444;padding:1px 3px;font-size:11px';
const BTN = 'background:#2a2a30;color:#ddd;border:1px solid #555;border-radius:3px;padding:1px 6px;font-size:11px;cursor:pointer';
const LIT = 'background:#4a3a12;color:#e8cf9a;border:1px solid #C9A05A;border-radius:3px;padding:1px 6px;font-size:11px;cursor:pointer';
const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
const NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const nm = m => NAMES[((m % 12) + 12) % 12] + (Math.floor(m / 12) - 1);
const HIT_MS = 140;

Object.assign(D, {

    // ------------------------------------------------------------ the sounds, keyed by onset
    snd() { if (!this.cfg.sounds || typeof this.cfg.sounds !== 'object') this.cfg.sounds = {}; return this.cfg.sounds; },
    sndSelection() { return this.cfg.sndSelection || 'spread'; },
    // the onsets of the pattern as it stands: the run's events, or one per voice (time order); each with a stable key
    onsetList() {
        if (!this.strike) return [];
        if (this.cfg.shape === 'accel') {
            const A = this.accelSeq();
            return (A.events || []).map((ev, pos) => ({ key: 'a' + pos, pos, onMs: ev.onMs, pitch: ev.pitch, voice: ev.unit && ev.unit.v ? ev.unit.v.i : null }));
        }
        const timed = this.timed().slice().sort((a, b) => a.onMs - b.onMs || a.v.i - b.v.i);
        return timed.map((q, pos) => ({ key: 'v' + q.v.i, pos, onMs: q.onMs, pitch: q.v.pitch, voice: q.v.i }));
    },
    onsetByKey(key) { return this.onsetList().find(o => o.key === key) || null; },

    // ------------------------------------------------------------ the deal at one onset
    // which lanes take part: every lane the pattern already uses (the players with rows), the piano when it is in the pattern
    sndLanes(notes) { const s = new Set(notes.map(n => n.lane)); return [...s].filter(l => l >= 0).sort((a, b) => a - b); },
    sndTechOf(lane, notes) {
        const mine = notes.find(n => n.lane === lane && n.tech); if (mine) return mine.tech;
        return this.strikeTechOf ? this.strikeTechOf(lane) : null;
    },
    // the chord's notes over the players free at t: free = no other sound of that lane inside t ± (hit + rest); the onset's own notes are
    // the ones being replaced and do not count. Pitches by register onto players by register (1k's rule), folded; the row's own voice.
    dealChordAt(onset, harm, notes) {
        const S = SC(); const restMs = Math.max(0, +this.cfg.aMin || 250), t = onset.onMs;
        const own = notes.filter(n => Math.abs(n.onMs - t) < 1.5);
        const others = notes.filter(n => !own.includes(n));
        const lanes = this.sndLanes(notes);
        const busy = lane => others.some(n => n.lane === lane && (n.onMs + (n.durMs || HIT_MS) + restMs > t) && (n.onMs - restMs - HIT_MS < t));
        const free = lanes.filter(l => !busy(l)).map(lane => {
            const tech = this.sndTechOf(lane, notes); const inst = this.instOf(lane);
            const tq = inst && (inst.techniques || []).find(x => x.key === tech);
            const lo = tq && tq.rangeLow != null ? tq.rangeLow : (inst ? inst.rangeLow : 21), hi = tq && tq.rangeHigh != null ? tq.rangeHigh : (inst ? inst.rangeHigh : 108);
            return { lane, tech, lo, hi, centre: (lo + hi) / 2 };
        });
        const pitches = (harm.pitches || []).slice().sort((a, b) => a - b);
        const k = Math.min(pitches.length, free.length);
        const out = { lane: null, notes: [], wanted: pitches.length, free: free.length, taken: 0, folds: 0, skipped: 0 };
        if (!k) return out;
        const rnd = (S && S.mulberry32) ? S.mulberry32(((+this.cfg.vSeed || 1) * 977) + onset.pos * 31 + 3) : Math.random;
        const chosen = (S && S.select) ? S.select(pitches, k, this.sndSelection(), rnd) : pitches.slice(0, k);
        const ps = free.slice().sort((a, b) => a.centre - b.centre);
        chosen.slice().sort((a, b) => a - b).forEach((P, j) => {
            const p = ps[j]; if (!p) return;
            const rz = this.realize(P, { lane: p.lane, tech: p.tech });
            if (!rz) { out.skipped++; return; }
            if (rz.fold) out.folds++;
            out.notes.push({ lane: p.lane, tech: p.tech, midi: rz.midi, standIn: !!rz.standIn, pitch: P, onMs: t, durMs: own.length ? own[0].durMs : HIT_MS, vel: own.length ? own[0].vel : 100 });
        });
        out.taken = out.notes.length;
        return out;
    },
    // the pattern's notes with the chords in: the onset's own note(s) replaced by the deal — the hook under notesFor (Hear and Insert)
    applySounds(notes, mode) {
        const map = this.snd(); const keys = Object.keys(map).filter(k => map[k] && map[k].kind === 'chord');
        if (!keys.length || mode === 'piano' || (this.isChords && this.isChords()) || (this.isFill && this.isFill())) return notes;
        const onsets = this.onsetList(); let out = notes.slice(); const report = [];
        // deal in time order, each deal seeing the pattern as it stands with the earlier deals in it (so a big chord early leaves fewer free)
        onsets.filter(o => keys.includes(o.key)).sort((a, b) => a.onMs - b.onMs).forEach(o => {
            const harm = map[o.key].harm; if (!harm || !harm.pitches || !harm.pitches.length) return;
            const r = this.dealChordAt(o, harm, out);
            out = out.filter(n => Math.abs(n.onMs - o.onMs) >= 1.5).concat(r.notes.map(n => ({ lane: n.lane, tech: n.tech, midi: n.midi, vel: n.vel, onMs: n.onMs, durMs: n.durMs, chord: harm.name || harm.id })));
            report.push({ key: o.key, pos: o.pos, taken: r.taken, wanted: r.wanted, free: r.free, folds: r.folds, notes: r.notes });
        });
        this._sndReport = report;
        return out.sort((a, b) => a.onMs - b.onMs || a.lane - b.lane);
    },
    sndReadout() {
        const rep = this._sndReport || []; if (!rep.length) return '';
        const T = TRK();
        return rep.map(r => 'onset ' + (r.pos + 1) + ': ' + r.taken + ' of ' + r.wanted + (r.free < r.wanted ? ' (' + r.free + ' free)' : '') + (r.folds ? ', ' + r.folds + ' folded' : '') + ' — ' + r.notes.map(n => (T[n.lane] || {}).short + ':' + nm(n.midi)).join(' ')).join(' · ');
    },

    // ------------------------------------------------------------ setting a sound
    setSoundAt(key, sound) {
        const map = this.snd();
        if (!sound || sound.kind === 'note') delete map[key]; else map[key] = sound;
        if (this.chordDirty) this.chordDirty();
        this.save(); this.render(); this.paintSoundCard();
    },
    harmFromId(id) {
        if (!id) return null;
        const s = this.strikeById ? this.strikeById(id) : (this.db && this.db.strikes[id]);
        if (!s) return null;
        const pitches = [...new Set((s.notes || []).map(n => n.midi))].sort((a, b) => a - b);
        return { id, name: s.synthetic ? (s.harm.id + ' · ' + s.harm.name) : ('#' + s.index), pitches };
    },
    assignSoundHarm(id) {
        const card = this._sndCard; if (!card) return false;
        const harm = this.harmFromId(id); if (!harm) return false;
        this.snapshot();
        this.setSoundAt(card.key, { kind: 'chord', harm });
        this.setStatus('onset ' + (card.pos + 1) + ' → ' + harm.name + ' (' + harm.pitches.length + ' notes) · ' + this.sndReadout().split(' · ').filter(x => x.indexOf('onset ' + (card.pos + 1) + ':') === 0).join(''));
        return true;
    },
    allOnsetsHarm(harm) {
        if (!harm) return;
        this.snapshot(); const map = this.snd();
        this.onsetList().forEach(o => { map[o.key] = { kind: 'chord', harm }; });
        if (this.chordDirty) this.chordDirty();
        this.save(); this.render(); this.paintSoundCard();
        this.setStatus('every onset → ' + harm.name + ' · ' + this.sndReadout());
    },
    allOnsetsBannerInTurn(bankKey) {
        const groups = this.harmGroups ? this.harmGroups() : null; if (!groups) { this.setStatus('the harmonies are not read yet — open the morph panel once', true); return; }
        const H = HS(); let items = [];
        if (bankKey === 'strikes') items = (this.seq ? this.seq.strikeIds : []).map(id => this.harmFromId(id)).filter(Boolean);
        else { const g = groups.find(x => x.key === bankKey); if (g) items = g.items.map(e => this.harmFromId(H.harmId(e.value, e.root))).filter(Boolean); }
        if (!items.length) { this.setStatus('nothing in that banner', true); return; }
        this.snapshot(); const map = this.snd();
        this.onsetList().forEach((o, i) => { map[o.key] = { kind: 'chord', harm: items[i % items.length] }; });
        if (this.chordDirty) this.chordDirty();
        this.save(); this.render(); this.paintSoundCard();
        this.setStatus('every onset ← ' + bankKey + ' in turn (' + items.length + ') · ' + this.sndReadout());
    },
    clearSounds() { this.snapshot(); this.cfg.sounds = {}; if (this.chordDirty) this.chordDirty(); this.save(); this.render(); this.paintSoundCard(); this.setStatus('every onset back to a note'); },

    // ------------------------------------------------------------ the card
    openSoundCard(key, ev) {
        const o = this.onsetByKey(key); if (!o) return;
        this.closeSoundCard();
        const box = document.createElement('div');
        box.id = 'skSndCard';
        box.style.cssText = 'position:fixed;z-index:9650;width:300px;background:#26262e;color:#ddd;border:1px solid #C9A05A;border-radius:6px;font:11px/1.5 system-ui,sans-serif;box-shadow:0 6px 24px rgba(0,0,0,.5);user-select:none';
        const x0 = ev && ev.clientX != null ? ev.clientX : 400, y0 = ev && ev.clientY != null ? ev.clientY : 300;
        box.style.left = Math.max(4, Math.min(window.innerWidth - 310, x0 + 14)) + 'px';
        box.style.top = Math.max(4, Math.min(window.innerHeight - 260, y0 - 40)) + 'px';
        box.innerHTML = '<div id="skSndDrag" style="display:flex;justify-content:space-between;align-items:center;padding:4px 7px;background:#3a2f12;border-bottom:1px solid #C9A05A;cursor:move;border-radius:6px 6px 0 0">'
            + '<b style="color:#e8cf9a">onset <span id="skSndN"></span></b><span id="skSndT" style="color:#9a9"></span><span id="skSndX" style="cursor:pointer;color:#aaa;font-size:13px">&#10005;</span></div>'
            + '<div style="padding:6px 7px;display:flex;flex-direction:column;gap:5px">'
            + '<div style="display:flex;gap:4px;align-items:center"><span style="color:#888">sound</span><button id="skSndNote" style="' + BTN + '">note</button><button id="skSndChord" style="' + BTN + '">chord</button>'
            + '<label style="margin-left:auto;color:#888" title="which notes of the chord are taken when there are more notes than free players — 1k\'s vocabulary">take <select id="skSndSel" style="' + INP + '"><option value="spread">spread</option><option value="shuffle">shuffle</option><option value="high">high</option><option value="low">low</option><option value="played">as played</option></select></label></div>'
            + '<div id="skSndHarm" style="color:#e8cf9a"></div>'
            + '<div id="skSndDeal" style="color:#9a9;white-space:normal"></div>'
            + '<div style="display:flex;gap:4px;flex-wrap:wrap;border-top:1px solid #3a3a44;padding-top:5px">'
            + '<button id="skSndAll" style="' + BTN + '" title="this harmony on every onset of the pattern">all onsets &larr; this harmony</button>'
            + '<select id="skSndBank" style="' + INP + '" title="every onset gets the next row of a banner, in turn"></select><button id="skSndAllBank" style="' + BTN + '">all onsets &larr; banner in turn</button>'
            + '<button id="skSndClear" style="' + BTN + '" title="every onset back to a single note">clear all</button></div>'
            + '<div style="color:#666">click a row in the left column to choose the harmony for this onset &middot; ESC closes</div></div>';
        document.body.appendChild(box);
        ['mousedown', 'click', 'dblclick', 'mouseup', 'wheel'].forEach(t => box.addEventListener(t, x => x.stopPropagation()));
        this._sndCard = { key, pos: o.pos, el: box };
        const q = id => box.querySelector(id);
        q('#skSndX').addEventListener('click', () => this.closeSoundCard());
        q('#skSndNote').addEventListener('click', () => { this.snapshot(); this.setSoundAt(key, null); });
        q('#skSndChord').addEventListener('click', () => { const cur = this.snd()[key]; if (!cur) this.setStatus('click a row in the left column — that harmony becomes this onset\'s chord'); });
        q('#skSndSel').value = this.sndSelection();
        q('#skSndSel').addEventListener('change', e => { this.cfg.sndSelection = e.target.value; if (this.chordDirty) this.chordDirty(); this.save(); this.render(); this.paintSoundCard(); });
        q('#skSndAll').addEventListener('click', () => { const cur = this.snd()[key]; if (cur && cur.harm) this.allOnsetsHarm(cur.harm); else this.setStatus('choose a harmony for this onset first', true); });
        const groups = this.harmGroups ? (this.harmGroups() || []) : [];
        q('#skSndBank').innerHTML = '<option value="strikes">strikes</option>' + groups.map(g => '<option value="' + esc(g.key) + '">' + esc(g.title.split(' · ')[0].toLowerCase()) + '</option>').join('');
        q('#skSndAllBank').addEventListener('click', () => this.allOnsetsBannerInTurn(q('#skSndBank').value));
        q('#skSndClear').addEventListener('click', () => this.clearSounds());
        this._sndKey = k => { if (this._sndCard && k.key === 'Escape') { k.preventDefault(); k.stopPropagation(); this.closeSoundCard(); } };
        document.addEventListener('keydown', this._sndKey, true);
        // drag by the head
        const head = q('#skSndDrag'); let drag = null;
        head.addEventListener('mousedown', e => { drag = { dx: e.clientX - box.offsetLeft, dy: e.clientY - box.offsetTop }; e.preventDefault(); });
        const mv = e => { if (!drag) return; box.style.left = (e.clientX - drag.dx) + 'px'; box.style.top = (e.clientY - drag.dy) + 'px'; };
        const up = () => { drag = null; };
        document.addEventListener('mousemove', mv); document.addEventListener('mouseup', up);
        this._sndCard.off = () => { document.removeEventListener('mousemove', mv); document.removeEventListener('mouseup', up); };
        this.paintSoundCard();
    },
    closeSoundCard() {
        const c = this._sndCard; if (!c) return;
        if (c.off) c.off(); if (c.el) c.el.remove();
        if (this._sndKey) { document.removeEventListener('keydown', this._sndKey, true); this._sndKey = null; }
        this._sndCard = null;
        this.paintSoundMarks();
    },
    paintSoundCard() {
        const c = this._sndCard; if (!c || !c.el) return;
        const o = this.onsetByKey(c.key); const q = id => c.el.querySelector(id);
        if (!o) { this.closeSoundCard(); return; }
        c.pos = o.pos;
        q('#skSndN').textContent = (o.pos + 1) + ' of ' + this.onsetList().length;
        q('#skSndT').textContent = (o.onMs / 1000).toFixed(3) + ' s';
        const cur = this.snd()[c.key];
        q('#skSndNote').style.cssText = cur ? BTN : LIT; q('#skSndChord').style.cssText = cur ? LIT : BTN;
        q('#skSndHarm').textContent = cur && cur.harm ? cur.harm.name + ' · ' + cur.harm.pitches.length + ' notes · ' + cur.harm.pitches.map(nm).join(' ') : 'a single note (as always) — click a row in the left column for a chord';
        const rep = (this._sndReport || []).find(r => r.key === c.key);
        q('#skSndDeal').textContent = rep ? ('dealt: ' + rep.taken + ' of ' + rep.wanted + (rep.free < rep.wanted ? ' (' + rep.free + ' players free here)' : '') + (rep.folds ? ' · ' + rep.folds + ' folded' : '') + ' — ' + rep.notes.map(n => (TRK()[n.lane] || {}).short + ':' + nm(n.midi)).join('  ')) : '';
        this.paintSoundMarks();
    },
    // the chord's notes on the strip: hollow dots in a column at the onset, the onset with the card ringed
    paintSoundMarks() {
        const svg = this.el && this.el.querySelector('#skRhy'); if (!svg || !this.strike) return;
        svg.querySelectorAll('.skSndMark').forEach(x => x.remove());
        if (this.isChords && this.isChords()) return;
        const map = this.snd(); const keys = Object.keys(map).filter(k => map[k] && map[k].kind === 'chord');
        const rep = this._sndReport || [];
        if (!keys.length && !this._sndCard) return;
        try { this.notesFor('orch'); } catch (e) { }   // refreshes _sndReport
        const h = this.rh(), R = this.range(), r = Math.max(2.5, h * 0.42);
        const dotX = key => {
            if (key[0] === 'a') { const dots = svg.querySelectorAll('.skADot'); const d = dots[+key.slice(1)]; return d ? +d.getAttribute('cx') : null; }
            const d = svg.querySelector('.skRDot[data-i="' + key.slice(1) + '"]'); return d ? +d.getAttribute('cx') : null;
        };
        let s = '';
        (this._sndReport || rep).forEach(rp => {
            const x = dotX(rp.key); if (x == null) return;
            rp.notes.forEach(n => { if (n.midi < R.lo || n.midi > R.hi) return; const cy = this.keyY(n.midi) + h / 2; s += '<circle class="skSndMark" cx="' + x + '" cy="' + cy + '" r="' + (r + 1) + '" fill="none" stroke="#e8cf9a" stroke-width="1.5" stroke-dasharray="2 2"><title>' + esc((TRK()[n.lane] || {}).label + ' ' + nm(n.midi)) + '</title></circle>'; });
            s += '<text class="skSndMark" x="' + (x + 4) + '" y="' + (H_(svg) - 4) + '" font-size="9" fill="#e8cf9a">' + esc(String(rp.taken)) + '</text>';
        });
        if (this._sndCard) { const x = dotX(this._sndCard.key); if (x != null) s += '<line class="skSndMark" x1="' + x + '" y1="0" x2="' + x + '" y2="' + H_(svg) + '" stroke="#e8cf9a" stroke-width="1" stroke-dasharray="3 3" opacity="0.8"/>'; }
        svg.insertAdjacentHTML('beforeend', s);
    },
});
function H_(svg) { return +svg.getAttribute('height') || 0; }

// ---------------------------------------------------------------- the hooks
// 1 · the plain notes gain the chords (under swell_ui's own hook, so a chord's notes become swells when the switch is on)
const _plain = D._notesForPlain || D.notesFor;
const plainHook = function (mode) { const notes = _plain.apply(this, arguments); return this.applySounds ? this.applySounds(notes, mode) : notes; };
if (D._notesForPlain) D._notesForPlain = plainHook; else D.notesFor = plainHook;
// 2 · the rhythm strip: the gesture (double-click / ALT-click an onset dot) and the marks
const _renderRhythm = D.renderRhythm;
D.renderRhythm = function () {
    const r = _renderRhythm.apply(this, arguments);
    try {
        const svg = this.el && this.el.querySelector('#skRhy');
        if (svg) {
            svg.querySelectorAll('.skRDot').forEach(dd => {
                dd.addEventListener('dblclick', ev => { ev.stopPropagation(); ev.preventDefault(); this.openSoundCard('v' + dd.dataset.i, ev); });
                dd.addEventListener('click', ev => { if (ev.altKey) { ev.stopPropagation(); this.openSoundCard('v' + dd.dataset.i, ev); } }, true);
            });
            svg.querySelectorAll('.skADot').forEach((dd, pos) => {
                dd.style.cursor = 'pointer';
                dd.addEventListener('dblclick', ev => { ev.stopPropagation(); ev.preventDefault(); this.openSoundCard('a' + pos, ev); });
                dd.addEventListener('click', ev => { if (ev.altKey) { ev.stopPropagation(); this.openSoundCard('a' + pos, ev); } }, true);
            });
            svg.title = (svg.title || '');
        }
        this.paintSoundMarks(); this.paintSoundCard();
    } catch (e) { console.warn('[strike_sounds] strip hooks:', e); }
    return r;
};
// 3 · a row clicked while the card is open chooses the harmony for that onset instead of changing the strike in play
const _select = D.select;
D.select = function (id) {
    if (this._sndCard && this.assignSoundHarm && this.strike && id !== this.strike.id) { if (this.assignSoundHarm(id)) return; }
    return _select.apply(this, arguments);
};
// 4 · a new strike in play, or a mode change, closes the card (the onsets are another pattern's)
const _selectSeq = D.selectSeq;
D.selectSeq = function () { this.closeSoundCard(); return _selectSeq.apply(this, arguments); };
if (D.setMode) { const _setMode = D.setMode; D.setMode = function () { this.closeSoundCard(); return _setMode.apply(this, arguments); }; }

}(typeof self !== 'undefined' ? self : this));
