// cresc_panel.js — THE CRESCENDO PANEL ON A SELECTION (PLAN 1t step 1; CN-68 · CN-69 · CN-70 · CN-71; RUNNING_LOG §411–§418).
//
// HIS PICTURE (CN-68): *"create a series of strikes, just single note ones that alternate with crescendos … each ending corresponds
// to a strike in some other instrument"*, and (CN-69) *"the other three begin a crescendo"* from one strike. Decided in the talk
// (§414–§417): **the drawer makes only the strikes; the crescendos are made HERE, in the score, item by item** — he selects the
// strike notes that launch them, presses SHIFT+C, and one [go] writes one crescendo per onset (or one on every free player from
// each onset). Nothing is added to every note; the placements are clicks, not numbers.
//
// THE CHASSIS is cresc_card.js's — the same dark box, the same dynamics selects, the same remembered settings (`Composer._crescPanel`),
// ESC closes, and every crescendo it makes is an ordinary crescendo afterwards: click one and the CARD opens on it.
//
// THE DEAL IS NOT HERE. cresc_deal.js holds it, pure, so `check_cresc_panel.js` tests the same function this panel calls — PLAN
// 1q-PRINCIPLE, whose whole point is that a rule wired into one path and not its sibling is this drawer's entire defect history.
//
// REVERT (PLAN 1t): localStorage septet.strikes.classic = '1' + reload leaves the panel out — SHIFT+C does nothing.
(function (root) {
'use strict';
const HOST = () => (typeof Composer !== 'undefined') ? Composer : null;
const CR = () => root.Cresc;
const CD = () => root.CrescDeal;
const SP = () => root.Spacing;
const TRK = () => (typeof TRACKS !== 'undefined') ? TRACKS : [];
const ML = () => (typeof META_LAYER !== 'undefined') ? META_LAYER : 7;
const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
const INP = 'background:#1a1a22;color:#cca;border:1px solid #333;padding:2px 5px;font-size:11px';
const BTN = 'background:#2a2a30;color:#ddd;border:1px solid #555;border-radius:3px;padding:2px 7px;font-size:11px;cursor:pointer';
const LIT = 'background:#C2410C;color:#fff;border:1px solid #e07040;border-radius:3px;padding:2px 7px;font-size:11px;cursor:pointer';

let CLASSIC = false; try { CLASSIC = !!localStorage.getItem('septet.strikes.classic'); } catch (e) {}

const PANEL = {
    el: null, _key: null, ticks: null, sel: [], onsets: [],

    cfg() {
        const C = HOST(); if (!C) return {};
        if (!C._crescPanel) {
            const card = C._crescCard || {};
            C._crescPanel = { mode: 'one', ends: 'even', endsS: 3, harmony: 'these',
                              dynLo: card.dynLo != null ? card.dynLo : 'ppp', dynHi: card.dynHi != null ? card.dynHi : 'fff',
                              shape: 'surge', ratio: 5, secco: true };
        }
        return C._crescPanel;
    },

    // ---------------------------------------------------------------- what is selected
    // strike notes only: a plain sounding note on a player's lane. A crescendo in the selection is ignored (it is not a strike),
    // and so is anything on the META lane.
    selection() {
        const C = HOST(), Cr = CR(); if (!C) return [];
        return (C.selectedObjects && C.selectedObjects.length ? C.selectedObjects : (C.selectedObject ? [C.selectedObject] : []))
            .filter(o => o && o.type === 'waveCurve' && o.sonifyNote != null && o.layer != null && o.layer < ML() && !(Cr && Cr.isCresc(o)))
            .map(o => ({ id: o.id, lane: o.layer, midi: +o.sonifyNote, startSeconds: +o.startSeconds, groupId: o.groupId || null }));
    },
    // everything the score sounds, in spacing.js's shape — the selection INCLUDED (a strike is exactly what bounds a crescendo)
    events() {
        const C = HOST(), S = SP(); if (!C || !S) return [];
        return S.eventsOf(C.objects.filter(o => {
            if (!o || o.layer == null || o.layer >= ML()) return false;
            if (o.type === 'zone') return o.midiModel === 'trill' || o.midiModel === 'beating';
            if (o.type !== 'waveCurve' || o.sonifyNote == null) return false;
            if (C.mutedByLive && C.mutedByLive(o)) return false;
            return true;
        }));
    },
    ranges() {
        const C = HOST(), R = {};
        TRK().forEach((t, i) => {
            const inst = C && C.trackInstrument(i); if (!inst) return;
            const tech = (C.ordinaryTech && C.ordinaryTech(i)) || (inst.techniques || [])[0] || {};
            R[i] = [tech.rangeLow != null ? tech.rangeLow : inst.rangeLow, tech.rangeHigh != null ? tech.rangeHigh : inst.rangeHigh];
        });
        return R;
    },
    pianoLane() { return TRK().findIndex(t => t && t.instKey === 'piano'); },

    // THE NEXT STRIKE GROUP after the selection's last onset — its onsets, in time order. Used by `ends: next strike` and by
    // `harmony: next strike`, one read for both.
    nextStrike(afterT) {
        const C = HOST(); if (!C) return [];
        const g = {};
        C.objects.forEach(o => {
            if (!o || o.type !== 'waveCurve' || o.sonifyNote == null || !o.groupId) return;
            if (!/^grp-strike-/.test(o.groupId)) return;
            if (o.layer == null || o.layer >= ML()) return;
            const e = g[o.groupId] || (g[o.groupId] = { id: o.groupId, t: Infinity, notes: [] });
            e.t = Math.min(e.t, +o.startSeconds);
            e.notes.push({ id: o.id, lane: o.layer, midi: +o.sonifyNote, startSeconds: +o.startSeconds, groupId: o.groupId });
        });
        const groups = Object.values(g).filter(x => x.t > afterT + 1e-6).sort((a, b) => a.t - b.t);
        if (!groups.length) return [];
        const D = CD(); return D ? D.onsetsOf(groups[0].notes) : [];
    },
    drawerPitches() {
        const D = root.StrikeDrawer;
        if (!D || !D.voices || !D.voices.length) return [];
        return [...new Set(D.voices.map(v => +v.pitch).filter(isFinite))].sort((a, b) => a - b);
    },

    // ---------------------------------------------------------------- open / close
    toggle() {
        if (CLASSIC) return;
        if (this.el) { this.close(); return; }
        this.open();
    },
    open() {
        const C = HOST(), D = CD(); if (!C || !D) return;
        const sel = this.selection();
        if (!sel.length) { C.saveStatus.textContent = 'SHIFT+C: select the strike notes the crescendos launch from first'; return; }
        this.sel = sel;
        this.onsets = D.onsetsOf(sel);
        this.ticks = null;                       // recomputed from this selection (a tick means "free here", and that moved)
        this.build();
    },
    close() {
        if (this._key) { document.removeEventListener('keydown', this._key, true); this._key = null; }
        if (this._mv) { window.removeEventListener('mousemove', this._mv); this._mv = null; }
        if (this._up) { window.removeEventListener('mouseup', this._up); this._up = null; }
        if (this.el) { this.el.remove(); this.el = null; }
    },
    isOpen() { return !!this.el; },

    // the ticks: pre-ticked = not in the selection AND free at every selected onset. The piano is never ticked (CN-34).
    defaultTicks() {
        const Sn = root.Sounding, C = HOST();
        const piano = this.pianoLane();
        const inSel = new Set(this.sel.map(n => n.lane));
        const lanes = TRK().map((t, i) => i).filter(i => i < ML());
        const ev = this.events();
        const out = {};
        lanes.forEach(l => {
            if (l === piano || inSel.has(l)) { out[l] = false; return; }
            const freeEverywhere = this.onsets.every(on => {
                const r = Sn ? Sn.atIn(ev, on.t, [l]) : { free: [l] };
                return (r.free || []).indexOf(l) >= 0;
            });
            out[l] = freeEverywhere;
        });
        return out;
    },

    build() {
        const C = HOST(), Cr = CR(), D = CD(), c = this.cfg();
        const piano = this.pianoLane();
        const inSel = new Set(this.sel.map(n => n.lane));
        if (!this.ticks) this.ticks = this.defaultTicks();
        const box = document.createElement('div');
        box.id = 'crescPanel'; box.tabIndex = 0;
        box.style.cssText = 'position:fixed;z-index:9600;left:' + Math.max(4, Math.round(window.innerWidth / 2) - 150) + 'px;top:90px;' +
            'width:300px;background:#26262e;color:#ddd;border:1px solid #C2410C;border-radius:6px;font:11px/1.5 system-ui,sans-serif;' +
            'box-shadow:0 6px 24px rgba(0,0,0,.5);user-select:none';
        const dynOpts = Cr.DYN.map(d => '<option value="' + d + '">' + d + '</option>').join('');
        const shapeOpts = Cr.shapeList().map(s => '<option value="' + s[0] + '">' + esc(s[1]) + '</option>').join('');
        const opt = (list, v) => list.map(x => '<option value="' + x[0] + '"' + (x[0] === v ? ' selected' : '') + '>' + esc(x[1]) + '</option>').join('');
        box.innerHTML = [
            '<div id="cpDrag" style="display:flex;justify-content:space-between;align-items:center;padding:4px 7px;background:#3a2a1a;border-bottom:1px solid #C2410C;cursor:move;border-radius:6px 6px 0 0">',
            '<b style="color:#e8a06a">crescendos from the selection</b>',
            '<span id="cpX" style="cursor:pointer;color:#aaa;font-size:13px">&#10005;</span></div>',
            '<div style="padding:6px 7px;display:flex;flex-direction:column;gap:6px">',
            '<div id="cpSel" style="color:#9a9"></div>',
            // who
            '<div><div style="color:#888">who <span style="color:#666">&mdash; ticked = free at every selected onset</span></div>',
            '<div id="cpWho" style="display:flex;flex-wrap:wrap;gap:2px 8px"></div>',
            '<div style="display:flex;gap:4px;align-items:center;margin-top:3px">',
            '<select id="cpMode" style="' + INP + ';flex:1">' + opt(D.MODES, c.mode) + '</select></div></div>',
            // ends
            '<div><div style="color:#888">ends</div><div style="display:flex;gap:4px;align-items:center">',
            '<select id="cpEnds" style="' + INP + ';flex:1">' + opt(D.ENDS, c.ends) + '</select>',
            '<input id="cpEndsS" type="number" step="0.1" min="0.3" style="' + INP + ';width:56px"> <span style="color:#888">s</span>',
            '</div></div>',
            // harmony
            '<div><div style="color:#888">harmony</div><select id="cpHarm" style="' + INP + ';width:100%">' + opt(D.HARMONY, c.harmony) + '</select></div>',
            // dynamics + shape
            '<div style="display:flex;gap:4px;align-items:center">',
            '<select id="cpLo" style="' + INP + ';width:52px">' + dynOpts + '</select><span style="color:#888">&rarr;</span>',
            '<select id="cpHi" style="' + INP + ';width:52px">' + dynOpts + '</select>',
            '<select id="cpShape" style="' + INP + ';flex:1">' + shapeOpts + '</select>',
            '<input id="cpRatio" type="number" min="1" step="1" style="' + INP + ';width:44px" title="the ratio: surge 5× is the standard (a line is 1×)"></div>',
            '<label style="display:flex;gap:5px;align-items:center" title="secco: the cut at the peak (CN-49) — on by default, as everywhere else">',
            '<input id="cpSecco" type="checkbox"> secco <span style="color:#777">(the cut)</span></label>',
            '<div style="display:flex;gap:4px;align-items:center">',
            '<button id="cpGo" style="' + LIT + '" title="write one crescendo per selected onset — ONE undo step">go</button>',
            '<button id="cpPre" style="' + BTN + '" title="what [go] would write, without writing it">preview</button>',
            '<span style="color:#666;margin-left:auto">ESC closes</span></div>',
            '<div id="cpOut" style="color:#9a9;max-height:76px;overflow:auto"></div>',
            '</div>',
        ].join('');
        document.body.appendChild(box);
        this.el = box;
        ['mousedown', 'click', 'dblclick', 'mouseup', 'wheel'].forEach(t => box.addEventListener(t, x => x.stopPropagation()));
        const q = id => box.querySelector(id);

        // the selection line
        q('#cpSel').textContent = this.sel.length + ' note' + (this.sel.length === 1 ? '' : 's') + ' · '
            + this.onsets.length + ' onset' + (this.onsets.length === 1 ? '' : 's') + ' · '
            + this.onsets[0].t.toFixed(2) + ' → ' + this.onsets[this.onsets.length - 1].t.toFixed(2) + ' s';

        // the tick row
        const who = q('#cpWho');
        TRK().forEach((t, i) => {
            if (i >= ML()) return;
            const isPiano = i === piano, striking = inSel.has(i);
            const lab = document.createElement('label');
            lab.style.cssText = 'display:flex;gap:3px;align-items:center' + ((isPiano || striking) ? ';color:#666' : '');
            lab.title = isPiano ? 'the piano cannot swell (CN-34) — it sounds on the strikes only'
                      : striking ? 'this player is striking in the selection' : '';
            const cb = document.createElement('input');
            cb.type = 'checkbox'; cb.checked = !!this.ticks[i]; cb.disabled = isPiano || striking;
            cb.addEventListener('change', () => { this.ticks[i] = cb.checked; this.preview(); });
            lab.appendChild(cb);
            lab.appendChild(document.createTextNode((t.short || t.label || ('tr' + i)) + (isPiano ? ' ✕' : striking ? ' ·' : '')));
            who.appendChild(lab);
        });

        // the controls, from the remembered settings
        q('#cpEndsS').value = c.endsS; q('#cpLo').value = c.dynLo; q('#cpHi').value = c.dynHi;
        q('#cpShape').value = c.shape; q('#cpRatio').value = c.ratio; q('#cpSecco').checked = c.secco !== false;
        const endsBox = () => { q('#cpEndsS').disabled = q('#cpEnds').value === 'next'; };
        endsBox();
        const bind = (id, key, cast) => q(id).addEventListener('change', e => {
            c[key] = cast ? cast(e.target.value) : e.target.value; endsBox(); this.preview();
            if (e.target.matches('select, input[type=number]')) e.target.blur();
        });
        bind('#cpMode', 'mode'); bind('#cpEnds', 'ends'); bind('#cpEndsS', 'endsS', v => Math.max(0.1, +v || 3));
        bind('#cpHarm', 'harmony'); bind('#cpLo', 'dynLo'); bind('#cpHi', 'dynHi');
        bind('#cpShape', 'shape'); bind('#cpRatio', 'ratio', v => Math.max(1, +v || 5));
        q('#cpSecco').addEventListener('change', e => { c.secco = e.target.checked; this.preview(); });
        q('#cpGo').addEventListener('click', () => this.go());
        q('#cpPre').addEventListener('click', () => this.preview());
        q('#cpX').addEventListener('click', () => this.close());

        // drag by the header, cresc_card's idiom
        const head = q('#cpDrag'); let dx = 0, dy = 0, dragging = false;
        head.addEventListener('mousedown', e => { dragging = true; dx = e.clientX - box.offsetLeft; dy = e.clientY - box.offsetTop; e.preventDefault(); });
        this._mv = e => { if (!dragging) return; box.style.left = Math.max(0, e.clientX - dx) + 'px'; box.style.top = Math.max(0, e.clientY - dy) + 'px'; };
        this._up = () => { dragging = false; };
        window.addEventListener('mousemove', this._mv); window.addEventListener('mouseup', this._up);

        // ESC closes; ENTER on the panel goes
        this._key = (e) => {
            if (!this.el) return;
            if (e.key === 'Escape') { e.stopPropagation(); e.preventDefault(); this.close(); return; }
            if (e.key === 'Enter' && this.el.contains(document.activeElement)) { e.stopPropagation(); e.preventDefault(); this.go(); }
        };
        document.addEventListener('keydown', this._key, true);
        this.preview();
    },

    // ---------------------------------------------------------------- the deal, one place for the preview and the go
    run() {
        const D = CD(), Cr = CR(), c = this.cfg();
        if (!D || !Cr) return null;
        const lanes = TRK().map((t, i) => i).filter(i => i < ML() && this.ticks[i]);
        const lastT = this.onsets.length ? this.onsets[this.onsets.length - 1].t : 0;
        const needNext = c.ends === 'next' || c.harmony === 'next';
        return D.deal(this.onsets, this.events(), lanes, this.ranges(), {
            mode: c.mode, ends: c.ends, endsS: +c.endsS, harmony: c.harmony,
            nextOnsets: needNext ? this.nextStrike(lastT) : [],
            drawerPitches: c.harmony === 'drawer' ? this.drawerPitches() : [],
            selectionLanes: this.sel.map(n => n.lane),
            piano: this.pianoLane(),
            endGapS: Cr.DEFAULTS.endGapS, minS: Cr.DEFAULTS.minS,
        });
    },
    preview() {
        const D = CD(), res = this.run(); if (!res || !this.el) return;
        const out = this.el.querySelector('#cpOut');
        const lines = res.crescs.slice(0, 8).map(c => '· ' + ((TRK()[c.lane] || {}).short || c.lane) + ' ' + CR().nm(c.midi)
            + ' ' + c.t0.toFixed(2) + ' → ' + c.t1.toFixed(2) + ' (' + c.len.toFixed(2) + ' s'
            + (c.capped ? ', capped' : '') + (c.floored ? ', floored' : '') + (c.fold ? ', ' + (c.fold > 0 ? '+' : '') + c.fold + ' 8ve' : '') + ')');
        const more = res.crescs.length > 8 ? '<div style="color:#777">… and ' + (res.crescs.length - 8) + ' more</div>' : '';
        out.innerHTML = '<div style="color:#cca">' + esc(D.summarize(res)) + '</div>'
            + lines.map(l => '<div>' + esc(l) + '</div>').join('') + more;
        return res;
    },
    go() {
        const C = HOST(), Cr = CR(), D = CD(), c = this.cfg();
        const res = this.run();
        if (!res || !res.crescs.length) { this.preview(); C.saveStatus.textContent = 'no crescendo could be made — see the panel'; return; }
        C.pushUndoState();                                   // ONE undo step for the whole go
        let made = 0;
        res.crescs.forEach(x => {
            const tech = (C.ordinaryTech && C.ordinaryTech(x.lane)) || {};
            const wc = Cr.make(x.t0, x.midi, { lane: x.lane, tech: tech.key, label: (TRK()[x.lane] || {}).short }, [],
                { durS: x.len, dynLo: Cr.dynHeight(c.dynLo), dynHi: Cr.dynHeight(c.dynHi),
                  shape: c.shape, ratio: +c.ratio, secco: c.secco !== false });
            if (!wc) return;
            wc.id = 'wc-' + (C.nextId++);
            if (x.groupId) wc.groupId = x.groupId;           // an accent's rule: it dies with the gesture that launched it
            wc.endSeconds = x.t1;
            wc.properties.cresc.end = x.how === 'next' ? 'toNextStrike' : x.capped ? 'toNextSound' : 'panel';
            wc.properties.cresc.panel = { from: x.onsetKey, ends: x.how, harmony: c.harmony, mode: c.mode,
                                          capped: !!x.capped, floored: !!x.floored, raw: x.raw, fold: x.fold };
            const why = x.capped ? 'capped by the next sound' : x.how === 'next' ? 'to the next strike'
                      : x.how === 'together' ? 'together' : x.floored ? 'the 0.3 s floor' : 'typed';
            wc.performanceNotes = 'cresc ' + wc.properties.cresc.shape + ' ' + wc.properties.cresc.ratio + '× '
                + c.dynLo + '→' + c.dynHi + ' ' + x.len.toFixed(2) + ' s (' + why + ')'
                + (x.fold ? ' · ' + Cr.nm(x.raw) + ' folded ' + (x.fold > 0 ? '+' : '') + x.fold + ' 8ve' : '')
                + ' · from the strike at ' + x.onsetKey.toFixed(2) + ' s';
            C.objects.push(wc);
            made++;
        });
        C.curveDirty(); C.renderAll(); C.markDirty(); C.scheduleConflictRefresh && C.scheduleConflictRefresh();
        this.preview();
        C.saveStatus.textContent = 'wrote ' + made + ' crescendo' + (made === 1 ? '' : 's') + ' · ' + D.summarize(res) + ' — CTRL+Z undoes it';
    },
};

root.CrescPanel = PANEL;
}(window));
