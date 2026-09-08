// cresc_card.js — THE CRESCENDO CARD (PLAN 1m step 2; CN-48 · CN-49; RUNNING_LOG §281).
//
// His picture (CN-48): "c key, little panel, default dynamic range and duration (til next note or if no note a standard duration), and
// articulation, but I can change any of them there in the mini panel". Decided §276: **C makes the crescendo at once and this card edits
// the LIVE object**, so every turn of a control is heard immediately; ENTER keeps it, ESC removes it, CTRL+Z undoes it.
//
// Four controls, each with 1l's default: the DYNAMIC RANGE (two dynamics, ppp … fff), the DURATION (what the end rule gave it, typed or
// dragged to another), the ARTICULATION (that player's techniques, defaulting to its ordinary voice — Ordinario on the flute, Senza
// Vibrato Velocity on the strings and the bass clarinet, confirmed with him), and the SECCO tick (on by default, CN-49). ♪ hears it
// alone; ▶ hears it in context. The card REMEMBERS its settings between crescendos (`Composer._crescCard`), so a passage keeps one
// character without re-setting it, and clicking an existing crescendo reopens the card with its own values — the card is the editor as
// well as the maker.
(function (root) {
'use strict';
const HOST = () => (typeof Composer !== 'undefined') ? Composer : null;
const C_ = () => root.Cresc;
const TRK = () => (typeof TRACKS !== 'undefined') ? TRACKS : [];
const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
const INP = 'background:#1a1a22;color:#cca;border:1px solid #333;padding:2px 5px;font-size:11px';
const BTN = 'background:#2a2a30;color:#ddd;border:1px solid #555;border-radius:3px;padding:2px 7px;font-size:11px;cursor:pointer';
const LIT = 'background:#C2410C;color:#fff;border:1px solid #e07040;border-radius:3px;padding:2px 7px;font-size:11px;cursor:pointer';

const CARD = {
    el: null, wc: null, _key: null, _ctxTimer: null, _born: false,

    open(wc, ev, opts) {
        const C = HOST(), Cr = C_(); if (!C || !Cr || !wc || !Cr.isCresc(wc)) return;
        this.close();
        this.wc = wc;
        this._born = !(opts && opts.existing);   // opened on a fresh C: ESC removes it. Opened by a click: ESC just closes.
        this.build(ev);
    },
    close(removeIfBorn) {
        if (this._key) { document.removeEventListener('keydown', this._key, true); this._key = null; }
        if (this._ctxTimer) { clearTimeout(this._ctxTimer); this._ctxTimer = null; const C = HOST(); if (C && C.isPlaying) C.stopPlay(); }
        if (this.el) { this.el.remove(); this.el = null; }
        this.wc = null;
    },
    isOpen() { return !!this.el; },
    cfg() { const C = HOST(); if (!C._crescCard) C._crescCard = {}; return C._crescCard; },

    build(ev) {
        const C = HOST(), Cr = C_(), wc = this.wc, cr = wc.properties.cresc;
        const lane = wc.layer, techs = C.trackTechniques(lane) || [];
        const box = document.createElement('div');
        box.id = 'crescCard'; box.tabIndex = 0;
        box.style.cssText = 'position:fixed;z-index:9600;width:266px;background:#26262e;color:#ddd;border:1px solid #C2410C;border-radius:6px;font:11px/1.5 system-ui,sans-serif;box-shadow:0 6px 24px rgba(0,0,0,.5);user-select:none';
        // opened by a click: beside the pointer. Opened by the C key: beside the crescendo just drawn.
        let x0 = 260, y0 = 240;
        if (ev && ev.clientX != null) { x0 = ev.clientX; y0 = ev.clientY; }
        else {
            const el = C.elementCache.get(wc.id);
            if (el && el.getBoundingClientRect) {
                const r = el.getBoundingClientRect();
                // only when the crescendo is actually on screen; a note scrolled away would throw the card into a corner
                if ((r.width || r.height) && r.right > 0 && r.left < window.innerWidth && r.bottom > 0 && r.top < window.innerHeight) { x0 = r.right; y0 = r.top + r.height / 2; }
            }
        }
        box.style.left = Math.max(4, Math.min(window.innerWidth - 274, x0 + 14)) + 'px';
        box.style.top = Math.max(4, Math.min(window.innerHeight - 320, y0 - 70)) + 'px';
        box.innerHTML = [
            '<div id="ccDrag" style="display:flex;justify-content:space-between;align-items:center;padding:4px 7px;background:#3a2a1a;border-bottom:1px solid #C2410C;cursor:move;border-radius:6px 6px 0 0">',
            '<b style="color:#e8a06a">crescendo</b><span id="ccWho" style="color:#9a9"></span>',
            '<span id="ccX" style="cursor:pointer;color:#aaa;font-size:13px">&#10005;</span></div>',
            '<div style="padding:6px 7px;display:flex;flex-direction:column;gap:6px">',
            '<div><div style="color:#888">dynamic range</div><div style="display:flex;gap:4px;align-items:center">',
            '<select id="ccLo" style="' + INP + ';width:52px"></select><span style="color:#888">&rarr;</span>',
            '<select id="ccHi" style="' + INP + ';width:52px"></select>',
            '<span id="ccShape" style="color:#9a9;margin-left:auto"></span></div></div>',
            '<div><div style="color:#888">duration</div><div style="display:flex;gap:4px;align-items:center">',
            '<input id="ccDur" type="number" step="0.1" min="0.3" style="' + INP + ';width:60px"> <span style="color:#888">s</span>',
            '<button id="ccRule" style="' + BTN + '" title="back to the rule: to 0.17 s before this player\'s next note, or 5 s when there is none">by the rule</button>',
            '<span id="ccHow" style="color:#777;margin-left:auto"></span></div></div>',
            '<div><div style="color:#888">articulation</div><select id="ccTech" style="' + INP + ';width:100%"></select></div>',
            '<label style="display:flex;gap:5px;align-items:center" title="secco: the strings damp the string at the end for an abrupt cut; in the sound a CC7 cut so nothing rings past it (CN-49)">',
            '<input id="ccSecco" type="checkbox"> secco <span style="color:#777">(the cut)</span></label>',
            '<div style="display:flex;gap:4px;align-items:center">',
            '<button id="ccHear" style="' + BTN + '" title="hear it alone">&#9834;</button>',
            '<button id="ccCtx" style="' + BTN + '" title="hear it with what is around it">&#9654; in context</button>',
            '<span id="ccStatus" style="color:#9a9;margin-left:auto;white-space:nowrap;overflow:hidden;text-overflow:ellipsis"></span></div>',
            '<div style="display:flex;gap:4px;align-items:center">',
            '<button id="ccOk" style="' + LIT + '" title="ENTER">keep</button>',
            '<button id="ccDel" style="' + BTN + '" title="ESC on a new one; this always removes it">&#10005; remove</button>',
            '<span style="color:#666;margin-left:auto">ENTER &middot; ESC</span></div>',
            '</div>',
        ].join('');
        document.body.appendChild(box);
        this.el = box;
        ['mousedown', 'click', 'dblclick', 'mouseup', 'wheel'].forEach(t => box.addEventListener(t, x => x.stopPropagation()));
        const q = id => box.querySelector(id);
        // the dynamics
        const opts = Cr.DYN.map(d => '<option value="' + d + '">' + d + '</option>').join('');
        q('#ccLo').innerHTML = opts; q('#ccHi').innerHTML = opts;
        q('#ccLo').value = Cr.dynName(cr.dynLo); q('#ccHi').value = Cr.dynName(cr.dynHi);
        // the techniques
        q('#ccTech').innerHTML = techs.map(t => '<option value="' + esc(t.key) + '">' + esc(t.label || t.key) + '</option>').join('');
        q('#ccTech').value = wc.technique;
        q('#ccSecco').checked = cr.secco !== false;
        q('#ccDur').value = (wc.endSeconds - wc.startSeconds).toFixed(2);
        this.paint();
        q('#ccX').addEventListener('click', () => this.close());
        q('#ccOk').addEventListener('click', () => this.keep());
        q('#ccDel').addEventListener('click', () => this.remove());
        q('#ccHear').addEventListener('click', () => this.hear());
        q('#ccCtx').addEventListener('click', () => this.context());
        q('#ccRule').addEventListener('click', () => this.byTheRule());
        q('#ccLo').addEventListener('change', () => this.apply());
        q('#ccHi').addEventListener('change', () => this.apply());
        q('#ccTech').addEventListener('change', () => this.apply());
        q('#ccSecco').addEventListener('change', () => this.apply());
        q('#ccDur').addEventListener('change', () => this.apply());
        this._key = k => {
            if (this.el && (k.key === 'Escape')) { k.preventDefault(); k.stopPropagation(); this._born ? this.remove() : this.close(); }
            else if (this.el && k.key === 'Enter') { k.preventDefault(); k.stopPropagation(); this.keep(); }
        };
        document.addEventListener('keydown', this._key, true);
        this.makeDraggable(box, q('#ccDrag'));
        box.focus();
    },

    // every change goes onto the LIVE crescendo, and is remembered for the next one
    apply() {
        const C = HOST(), Cr = C_(), wc = this.wc; if (!wc) return;
        const q = id => this.el.querySelector(id);
        const lo = Cr.dynHeight(q('#ccLo').value), hi = Cr.dynHeight(q('#ccHi').value);
        const dur = Math.max(0.3, +q('#ccDur').value || 1);
        const tech = q('#ccTech').value, secco = q('#ccSecco').checked;
        wc.nodes = [{ pos: 0, y: lo, smooth: 0.25 }, { pos: 1, y: hi, smooth: 0.25 }];
        wc.endSeconds = Math.round((wc.startSeconds + dur) * 1000) / 1000;
        wc.technique = tech;
        const cr = wc.properties.cresc;
        cr.dynLo = lo; cr.dynHi = hi; cr.secco = secco;
        if (Math.abs(dur - (cr.gapTo != null ? cr.gapTo - wc.startSeconds - cr.endGapS : -1)) > 0.005) cr.end = 'manual';
        wc.performanceNotes = 'cresc ' + cr.shape + (cr.shape === 'line' ? '' : ' ' + cr.ratio + '×') + ' ' + Cr.dynName(lo) + '→' + Cr.dynName(hi) +
            ' ' + dur.toFixed(2) + ' s' + (cr.end === 'manual' ? ' (typed)' : cr.end === 'fallback' ? ' (no next note)' : '');
        Object.assign(this.cfg(), { dynLo: lo, dynHi: hi, secco: secco, durS: null });   // the range and the tick carry; the duration does not (the rule is per note)
        C.curveDirty(); C.renderWaveCurve(wc); C.markDirty(); C.scheduleConflictRefresh();
        this.paint();
    },
    byTheRule() {
        const C = HOST(), Cr = C_(), wc = this.wc; if (!wc) return;
        const e = Cr.endFor(wc.startSeconds, C.laneNotesFor(wc.layer, wc.id), {});
        if (e.how === 'noRoom' || e.end == null) { this.status('no room — the next note is ' + (e.room != null ? e.room.toFixed(2) + ' s' : 'too close') + ' away', true); return; }
        wc.endSeconds = e.end; wc.properties.cresc.end = e.how; wc.properties.cresc.gapTo = e.gapTo;
        this.el.querySelector('#ccDur').value = (e.end - wc.startSeconds).toFixed(2);
        this.apply();
        wc.properties.cresc.end = e.how;   // apply() may have stamped 'manual'
        this.paint();
    },
    paint() {
        const Cr = C_(), wc = this.wc; if (!wc || !this.el) return;
        const cr = wc.properties.cresc, T = TRK();
        this.el.querySelector('#ccWho').textContent = ((T[wc.layer] || {}).short || '') + ' ' + Cr.nm(wc.sonifyNote) + ' · ' + wc.startSeconds.toFixed(2) + ' s';
        this.el.querySelector('#ccShape').textContent = cr.shape + (cr.shape === 'line' ? '' : ' ' + cr.ratio + '×');
        this.el.querySelector('#ccHow').textContent = cr.end === 'toNextNote' ? 'to the next note' : cr.end === 'fallback' ? 'no next note' : 'typed';
    },
    status(m, bad) { const s = this.el && this.el.querySelector('#ccStatus'); if (s) { s.style.color = bad ? '#e88' : '#9a9'; s.textContent = m || ''; } },

    async hear() {
        const C = HOST(), wc = this.wc; if (!C || !wc) return;
        const inst = C.trackInstrument(wc.layer), tech = C.curveTechniqueFor(wc);
        try { if (!C._zoneMidiInited && C.initZoneMidi) await C.initZoneMidi(); } catch (e) { }
        const route = C.routeForNote(wc, tech, inst);
        const out = C._zoneMidiOutputs && C._zoneMidiOutputs[route.port];
        if (!out) { this.status('no MIDI output for ' + (route.port || 'this player'), true); return; }
        const ch = route.ch, dur = Math.min(6, wc.endSeconds - wc.startSeconds);
        if (tech && tech.cc0 != null) out.send([0xB0 | ch, 0, tech.cc0]);
        const steps = 24, t0 = performance.now() + 5;
        out.send([0xB0 | ch, 7, C.heldCc7(wc, C.evalWaveCurve(wc, 0))], t0);
        out.send([0x90 | ch, wc.sonifyNote, C.heldVel(wc)], t0 + 5);
        for (let i = 1; i <= steps; i++) {
            const u = i / steps;
            out.send([0xB0 | ch, 7, C.heldCc7(wc, C.evalWaveCurve(wc, u))], t0 + 5 + u * dur * 1000);
        }
        if (wc.properties.cresc.secco !== false) out.send([0xB0 | ch, 7, 0], t0 + 5 + dur * 1000 - 10);
        out.send([0x80 | ch, wc.sonifyNote, 0], t0 + 5 + dur * 1000);
        this.status('heard · ' + C_().describe(wc));
    },
    context() {
        const C = HOST(), wc = this.wc; if (!C || !wc) return;
        if (this._ctxTimer) { clearTimeout(this._ctxTimer); this._ctxTimer = null; }
        if (C.isPlaying) C.stopPlay();
        const pps = C.pixelsPerSecond, from = Math.max(0, wc.startSeconds - 1), to = wc.endSeconds + 1;
        C.scrollOffset = from * pps; C.applyScroll(); C.startPlay();
        this.status('playing ' + from.toFixed(1) + ' → ' + to.toFixed(1) + ' s');
        this._ctxTimer = setTimeout(() => { this._ctxTimer = null; if (C.isPlaying) C.stopPlay(); C.scrollOffset = wc.startSeconds * pps; C.applyScroll(); this.status(''); }, (to - from) * 1000);
    },
    keep() {
        const C = HOST(), wc = this.wc; if (!C || !wc) return;
        this.apply();
        C.saveStatus.textContent = 'crescendo kept: ' + C_().describe(wc) + ' — click it to edit again';
        this.close();
    },
    remove() {
        const C = HOST(), wc = this.wc; if (!C || !wc) return;
        C.pushUndoState();
        C.objects = C.objects.filter(o => o !== wc);
        const el = C.elementCache.get(wc.id); if (el) el.remove();
        C.elementCache.delete(wc.id);
        C.objects.forEach(o => { if (o.mutedBy === wc.id) { delete o.mutedBy; C.renderWaveCurve(o); } });   // the grey original comes back (§277)
        C.selectedObject = null; C.selectedObjects = []; C.hidePropertyPanel();
        C.curveDirty(); C.markDirty(); C.scheduleConflictRefresh();
        C.saveStatus.textContent = 'crescendo removed — its note is back';
        this.close();
    },
    makeDraggable(box, handle) {
        let sx = 0, sy = 0, bx = 0, by = 0, on = false;
        handle.addEventListener('mousedown', e => { if (e.target.id === 'ccX') return; on = true; sx = e.clientX; sy = e.clientY; const r = box.getBoundingClientRect(); bx = r.left; by = r.top; e.preventDefault(); });
        document.addEventListener('mousemove', e => { if (!on) return; box.style.left = Math.max(0, bx + e.clientX - sx) + 'px'; box.style.top = Math.max(0, by + e.clientY - sy) + 'px'; });
        document.addEventListener('mouseup', () => { on = false; });
    },
};
root.CrescCard = CARD;
}(typeof self !== 'undefined' ? self : this));
