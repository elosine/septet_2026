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
// the keyboard's geometry (2026-09-07, the second pass of the pitch side, MORPH_NOTES §3 / RUNNING_LOG §179–181): the players' ordinary
// ranges as coloured columns at the left ("each in its own column on the keyboard. There's room to the left of the circle note
// indicators"), then the C labels, the note names, the keys, the chord's dots, the pairs' rings
const KB = { w: 236, top: 18, colX: 6, colGap: 6, colW: 3, cX: 40, nameX: 72, keyX: 76, whiteW: 90, blackW: 54, dotX: 152, ringX: 176 };
const INST_COL = { flute: '#ffd479', bass_clarinet: '#e08a8a', violin1: '#8ea9c9', violin2: '#69b7c9', viola: '#b58ec9', cello: '#7ec9a8' };
const SEED_KEEP = 8;   // the strikes drawer's U8: the last seeds as chips
const VOICING_DEFAULTS = () => ({ preset: 'original', seed: 1, oct: 0, below: 0, above: 0, hist: [] });
// the sequence (2026-09-07, the composer: "a length for the entire sequence and a play for the entire sequence … for each pair, there
// should be a length, a duration, and then the play for just that pair … a track for every pair … drag them like I can the trill zones")
const PRESET_SHAPES = ['flat', 'rampOut', 'rampIn', 'hump', 'arc', 'burst'];   // the menu's shapes: the level box pops them in again; a drawn one is scaled
const SEQ_H = 30;                 // a track's height in the sequence strip
const PAIRS_PANEL = 'beatingPairs';   // the pair takes' bucket in bank/panel_snapshots.json
const RELATIONS = [['unison1', 'unison · 1 oct', 'every pair on the root, one octave (a field on one pitch — the tuba\'s bloom)'], ['unisonOcts', 'unison · octaves', 'the root\'s pitch class spread across octaves, a pair per octave'],
                   ['thirds', 'thirds', 'a stack of thirds from the root (root · +4 · +7)'], ['fourths', 'fourths', 'a stack of fourths (root · +5 · +10)'], ['fifths', 'fifths', 'a stack of fifths (root · +7 · +14)'], ['stack', 'stack', 'the typed stack: semitones above the root, one per pair']];
const parseNote = s => { s = String(s || '').trim(); if (!s) return null; if (/^\d+$/.test(s)) return +s; const m = /^([A-Ga-g])([#b]?)(-?\d)$/.exec(s); if (!m) return null; const pc = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 }[m[1].toUpperCase()] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0); return (parseInt(m[3], 10) + 1) * 12 + pc; };
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const r3 = v => Math.round(v * 1000) / 1000;
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
const nn = m => BC_().noteName(m);

const P = {
    el: null, rows: [], length: 6, bound: null, takeList: {}, pairTakes: {}, _timer: null, _aud: null, _drag: null, status: '',
    focus: 'sequence',   // what SPACE plays: 'sequence' | 'pair' (the active row) | 'chord' — set by where he last clicked
    db: null, banks: null, harmony: null, collapsed: {}, chord: [], chordId: '', armed: null, armedIdx: null, activeRow: 0, show88: false, rootMode: false, relation: 'unison1',
    voicing: VOICING_DEFAULTS(),   // the sonority's voicing: the preset, the seed, the octave box, the octave range (saved with the take)

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
            '<label title="the whole sequence: typing a new length stretches every pair and its offset in proportion (the shapes kept)">sequence <input id="bpLen" type="number" step="0.5" min="0.5" max="180" style="width:56px"> s</label>',
            '<button id="bpAdd" title="another pair (up to three)">+ pair</button>',
            '<button id="bpPlay" title="the whole sequence: all pairs at their offsets, through the score&#8217;s MIDI path">&#9654; sequence</button>',
            '<button id="bpStop">&#9632; stop</button>',
            '<span id="bpSpace" style="color:#9a9" title="what SPACE plays — the sequence, the active pair, or the chord — set by where you last clicked; SPACE while playing stops"></span>',
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
            '<button id="bpHear" title="hear the chord alone, on the piano voice (CN-36)">&#9654; chord</button>',
            '<span id="bpChordName" style="color:#c9a8ff;max-width:260px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap"></span>',
            '<span style="color:#888">relation</span>',
            '<span id="bpRel"></span>',
            '<input id="bpStack" type="text" value="0 7 12" style="width:64px" title="a typed stack: semitones above the root, one per pair">',
            '<label>root <input id="bpRoot" type="text" placeholder="C4 or 60" style="width:56px" title="a note name or MIDI number; or click a key with root mode on"></label>',
            '<button id="bpDeal" title="deal the pairs&#8217; pitches from the root by the relation, folded into the pairs&#8217; ranges, from the bottom up">deal</button>',
            '<label title="the whole piano instead of the ensemble&#8217;s span"><input id="bp88" type="checkbox"> 88</label>',
            '<span id="bpArmed" style="color:#c9a8ff"></span>',
            '</div>',
            // THE VOICING BAR (2026-09-07, MORPH_NOTES §3): the strikes drawer's presets over the sonority; the OCTAVE box moves the whole
            // sonority; the octave RANGE is the window every note may scatter within on a reshuffle; the seeded reshuffle with its chips
            '<div id="bpVoice" style="flex:0 0 auto;display:flex;flex-wrap:wrap;gap:4px 8px;align-items:center;margin-bottom:6px;padding:4px 6px;border:1px solid #3a3a44;border-radius:4px">',
            '<span style="color:#888">voicing</span><span id="bpVBtns"></span>',
            '<label title="the octave box: the whole sonority moved by octaves">oct <input id="bpOct" type="number" min="-3" max="3" step="1" value="0" style="width:44px"></label>',
            '<label title="the octave range: every note may scatter this many octaves below &#8230; above the octave box&#8217;s octave (a reshuffle deals the scatter)">range &#8722;<input id="bpBelow" type="number" min="0" max="3" step="1" value="0" style="width:40px"> &#8230; +<input id="bpAbove" type="number" min="0" max="3" step="1" value="0" style="width:40px"></label>',
            '<button id="bpVRe" title="a different realization of the same voicing preset &#8212; a new seed; with an octave range the notes scatter inside it">&#8635; reshuffle voicing</button>',
            '<span id="bpSeeds"></span>',
            '</div>',
            // THE SEQUENCE STRIP (2026-09-07): a track per pair, the pair a zone drawn with its heard-beating curve — dragged in time, stretched
            // at its right edge, started later at its left edge (the trill zones' handling); the rows follow live
            '<div id="bpSeqWrap" style="flex:0 0 auto;margin-bottom:6px;border:1px solid #3a3a44;border-radius:4px;background:#1a1a20;overflow:hidden"><svg id="bpSeq" style="display:block"></svg></div>',
            // the body: three columns, each scrolling on its own — the harmonies on the left in banners (CN-36, the strikes drawer's list), the
            // keyboard, the rows; over them the LINES from the assigned keys to the pairs' nodes (the strikes drawer's dotted lines)
            '<div id="bpBody" style="flex:1 1 auto;display:flex;gap:8px;overflow:hidden;min-height:0;margin:0 -4px;padding:0 4px;position:relative">',
            '<div id="bpList" style="flex:0 0 260px;overflow-y:auto;min-height:0;border-right:1px solid #333;padding:2px 0"></div>',
            '<div id="bpKbWrap" style="flex:0 0 ' + KB.w + 'px;overflow-y:auto;min-height:0"><div id="bpKbLegend" style="font-size:10px;color:#888;padding:0 0 2px 4px;white-space:nowrap"></div><svg id="bpKb" width="' + KB.w + '" style="display:block"></svg></div>',
            '<div id="bpRows" style="flex:1 1 auto;min-width:0;overflow-y:auto;min-height:0"></div>',
            '<svg id="bpLines" style="position:absolute;left:0;top:0;pointer-events:none;overflow:visible"></svg>',
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
        d.querySelector('#bpPlay').addEventListener('click', () => { this.setFocus('sequence'); this.play(); });
        d.querySelector('#bpStop').addEventListener('click', () => this.stop());
        d.querySelector('#bpSeq').addEventListener('mousedown', ev => { if (ev.target === ev.currentTarget || ev.target.tagName === 'line' || ev.target.tagName === 'text') this.setFocus('sequence'); });
        d.querySelector('#bpLen').addEventListener('change', ev => this.setLength(parseFloat(ev.target.value)));
        d.querySelector('#bpTakeSave').addEventListener('click', () => this.saveTake());
        d.querySelector('#bpTakeName').addEventListener('keydown', ev => { if (ev.key !== 'Enter') return; ev.preventDefault(); ev.stopPropagation(); this.saveTake(); });
        d.querySelector('#bpTakeSel').addEventListener('change', ev => { if (ev.target.value) this.loadTake(ev.target.value); ev.target.value = ''; });
        d.querySelector('#bpTakeDel').addEventListener('click', () => this.deleteTake());
        d.querySelector('#bpInsert').addEventListener('click', () => this.insert());
        // the pitch side's controls
        d.querySelector('#bpHear').addEventListener('click', () => { this.setFocus('chord'); this.hearChord(); });
        d.querySelector('#bpRel').innerHTML = RELATIONS.map(([k, l, t]) => '<button class="bpRelBtn" data-rel="' + k + '" title="' + esc(t) + '" style="font-size:12px;padding:1px 5px;margin:1px;cursor:pointer">' + l + '</button>').join('');
        d.querySelectorAll('.bpRelBtn').forEach(b => b.addEventListener('click', () => { this.relation = b.dataset.rel; this.rootMode = true; this.paintRelation(); this.setStatus('relation ' + b.textContent + ' — click a key for the root (or type it) and deal'); }));
        d.querySelector('#bpDeal').addEventListener('click', () => this.deal());
        d.querySelector('#bpRoot').addEventListener('keydown', ev => { if (ev.key !== 'Enter') return; ev.preventDefault(); ev.stopPropagation(); this.deal(); });
        d.querySelector('#bp88').addEventListener('change', ev => { this.show88 = ev.target.checked; this.applyVoicing(); });
        // the voicing bar
        d.querySelector('#bpVBtns').innerHTML = BC_().VOICINGS.map(([k, l]) => '<button class="bpV" data-v="' + k + '" style="font-size:12px;padding:1px 5px;margin:1px;cursor:pointer">' + l + '</button>').join('');
        d.querySelectorAll('.bpV').forEach(b => b.addEventListener('click', () => { this.voicing.preset = b.dataset.v; this.applyVoicing(); this.setStatus('voicing ' + b.textContent + (this.voicing.oct ? ' · oct ' + (this.voicing.oct > 0 ? '+' : '') + this.voicing.oct : '') + ((this.voicing.below || this.voicing.above) ? ' · range −' + this.voicing.below + ' … +' + this.voicing.above : '') + ' · seed ' + this.voicing.seed + ' — the pairs holding a note of the sonority follow it'); }));
        d.querySelector('#bpOct').addEventListener('change', ev => { this.voicing.oct = clamp(Math.round(+ev.target.value || 0), -3, 3); this.applyVoicing(); });
        d.querySelector('#bpBelow').addEventListener('change', ev => { this.voicing.below = clamp(Math.round(+ev.target.value || 0), 0, 3); this.applyVoicing(); });
        d.querySelector('#bpAbove').addEventListener('change', ev => { this.voicing.above = clamp(Math.round(+ev.target.value || 0), 0, 3); this.applyVoicing(); });
        d.querySelector('#bpVRe').addEventListener('click', () => { this.useSeed(this.nextSeed()); this.setStatus('voicing reshuffled — seed ' + this.voicing.seed + ((this.voicing.below || this.voicing.above) ? ', the notes scattered −' + this.voicing.below + ' … +' + this.voicing.above + ' octaves around oct ' + this.voicing.oct : (this.voicing.preset === 'original' ? ' (original with no octave range: nothing to scatter — set a range)' : '')) + '; the earlier seeds are the chips'); });
        d.querySelector('#bpKbWrap').addEventListener('scroll', () => this.renderLines());
        d.querySelector('#bpRows').addEventListener('scroll', () => this.renderLines());
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
            if (m('textarea, input[type=text], input[type=search], input:not([type])')) return;   // text entry keeps its SPACE
            if (m('select, button, input[type=number]')) t.blur();   // a number box never traps SPACE (composer, 2026-09-07)
            ev.preventDefault(); ev.stopPropagation();
            this.spaceBar();
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
        this.boundFirst = first;
        this.rows = mates.map(z => { C.ensureBeating(z); return this.mkRow(z.layer, z.beating, r3(z.startTime - first), z, r3(Math.max(0.1, z.endTime - z.startTime))); });
        this.length = this.seqLength();
        this.activeRow = 0; this.armed = null; this.armedIdx = null; this.voicing = VOICING_DEFAULTS(); this.focus = 'pair';
        this.show(); this.render();
        this.setStatus((mates.length > 1 ? 'bound to the pattern ' + zone.groupId + ' (' + mates.length + ' pairs) — every edit regenerates its beatings; insert replaces it in place' : 'bound to ' + C.beatingLabel(zone) + ' — every edit regenerates it') + '; SPACE plays; ESC closes');
        // a beating born on a strike note opens on that strike's chord (the strike by the note's id, its group, or its time)
        this.loadDb().then(() => { const s = this.strikeFor(zone); if (s) this.pickSource(s.id); else this.drawKeyboard(); });
    },
    // the Beating button with nothing bound: an empty pattern that lives here until Insert (step 6)
    openNew() {
        this.init(); const C = C_();
        this.bound = null; this.patternGroupId = null; this.insertAt = null; this.boundFirst = null; this.focus = 'sequence';
        // the starting point (§160, kept as a convenience): a selected strike note gives the first row its pitch and the insert its time — no link
        const sel = C && C.selectedObject, note = (sel && sel.type === 'waveCurve' && sel.sonifyNote != null && sel.layer < METAL() && sel.layer !== 2) ? sel : null;
        if (!this.rows.length || this.rows.some(r => r.zone) || note) { this.rows = []; const r = this.defaultRow(note ? note.layer : (C ? C.activeLane : 3)); if (r) this.rows.push(r); }
        if (note && this.rows[0]) {   // the note folds as a unit for the pair (§180); a partner that reaches it as written is preferred
            const r = this.rows[0]; r.b.noteIndex = null; r.b.srcPitch = note.sonifyNote;
            if (!this.rowFold(r, note.sonifyNote)) { const c = C.beatingPartnerCandidates(r.layer, note.sonifyNote, 'unison'); if (c.length) r.b.partnerLayer = c[0].layer; }
            this.refold(r);
            this.insertAt = r3(note.startSeconds);
        }
        this.activeRow = 0; this.armed = null; this.armedIdx = null; this.voicing = VOICING_DEFAULTS();
        this.show(); this.render();
        this.setStatus(this.rows.length ? 'a new pattern' + (note ? ' from the strike note ' + nn(note.sonifyNote) + ' at ' + note.startSeconds.toFixed(2) + ' s (its pitch on the first pair, its onset the insert time — no link)' : '') + ' — pick a strike or deal a relation for the pitches, shapes pop in from the menu, SPACE plays it, insert puts it in the score' : 'no pair can be made on this lane', !this.rows.length);
        this.loadDb().then(() => this.drawKeyboard());
    },
    mkRow(layer, b, offset, zone, length) { return { layer, b, offset: offset || 0, length: r3(Math.max(0.1, +length || this.length || 6)), zone: zone || null, locked: true, draw: false, scale: 6, out: null }; },
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
        const z = row.zone || { layer: row.layer, startTime: 0, endTime: row.length, beating: row.b, id: 'bp-row' };
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
    // ---- the sequence: every pair has its own length and offset; the sequence is as long as the last pair's end ----
    seqLength() { return r3(Math.max(0.1, ...this.rows.map(r => (r.offset || 0) + (r.length || 0)), 0.1)); },
    // the whole sequence stretched: every pair's offset and length in proportion (the curves are over normalised time; the slides and the
    // hand marks scale; dealt breaths re-deal)
    setLength(v) {
        if (!(v > 0)) return;
        const BC = BC_(), old = this.seqLength(), k = v / old;
        this.rows.forEach(r => {
            const s = BC.stretch({ length: r.length, slide: r.b.slide, breath: r.b.breath }, r.length * k);
            r.b.slide = s.slide; r.b.breath = s.breath; r.offset = r3((r.offset || 0) * k); r.length = r3(Math.max(0.1, r.length * k));
            this.placeZone(r); this.changed(r, true);
        });
        this.render();
        this.setStatus('sequence ' + this.seqLength() + ' s — every pair and its offset stretched in proportion, the shapes kept, the breaths re-dealt');
    },
    // one pair's own duration: the same shapes over it (the composer, 2026-09-07: "keep the custom shape and just change the duration")
    setRowLength(row, v) {
        if (!(v > 0)) return;
        const BC = BC_(), s = BC.stretch({ length: row.length, slide: row.b.slide, breath: row.b.breath }, v);
        row.b.slide = s.slide; row.b.breath = s.breath; row.length = r3(Math.max(0.1, v));
        this.placeZone(row); this.changed(row, true); this.render();
    },
    // a bound zone follows its row's offset and length in the score (the group's first start is the origin)
    placeZone(row) {
        if (!row.zone) return;
        const first = this.boundFirst != null ? this.boundFirst : row.zone.startTime - (row.offset || 0);
        row.zone.startTime = r3(first + (row.offset || 0)); row.zone.endTime = r3(row.zone.startTime + row.length);
    },
    // the level box (the "to" rate): a preset shape pops in again at the new level; a drawn or dragged shape is SCALED to it — the composer,
    // 2026-09-07: "Can I have the new beating level keep the custom shape" (it used to pop a burst in)
    setLevel(row, to) {
        const BC = BC_(), b = row.b; b.rateTo = to;
        const unlocked = !!(b.rate && b.rate.lower && b.rate.upper);
        if (PRESET_SHAPES.includes(b.shape) && !unlocked) { this.popShape(row, b.shape); return; }
        const out = this.rowOut(row), k = out.maxBeat > 1e-6 ? to / out.maxBeat : 0;
        if (unlocked) { b.rate.lower = BC.scaleCurve(b.rate.lower, k); b.rate.upper = BC.scaleCurve(b.rate.upper, k); }
        else b.beat = BC.scaleCurve(BC.curveOf(this.heardCurve(row)), k);
        b.shape = 'drawn';
    },
    // what SPACE plays (2026-09-07: "somehow I listen to the entire sequence with space … if I'm working with a pair, I just listen to the
    // pair with space. And if I'm in the chord shapes, I just listen to the chord with space")
    setFocus(f) { this.focus = f; this.paintFocus(); },
    paintFocus() { const s = this.el && this.el.querySelector('#bpSpace'); if (!s) return; const f = this.focus || 'sequence'; s.textContent = 'space → ' + (f === 'pair' ? 'pair ' + (this.activeRow + 1) : f === 'chord' ? 'chord' : 'sequence'); },
    spaceBar() {
        if (this._aud) { this.stop(); return; }
        const f = this.focus || 'sequence';
        if (f === 'chord') this.hearChord(); else if (f === 'pair' && this.rows[this.activeRow]) this.playRow(this.activeRow); else this.play();
    },

    // ------------------------------------------------------------------ the rendering
    render() {
        if (!this.el) return;
        const C = C_(), BC = BC_();
        this.length = this.seqLength();
        this.el.querySelector('#bpLen').value = this.length;
        this.el.querySelector('#bpTitle').textContent = this.patternGroupId ? '— pattern ' + this.patternGroupId + ' · ' + this.rows.length + ' pair' + (this.rows.length > 1 ? 's' : '') : this.bound ? '— ' + (TRK()[this.bound.layer] || {}).short + ' ' + this.bound.startTime.toFixed(2) + ' s' : '— new pattern' + (this.insertAt != null ? ' @ ' + this.insertAt.toFixed(2) + ' s' : '');
        this.el.querySelector('#bpAdd').disabled = (!!this.bound && !this.patternGroupId) || this.rows.length >= MAX_ROWS;
        this.el.querySelector('#bpInsert').textContent = this.patternGroupId ? 'insert (replace the pattern)' : 'insert @ ' + (this.insertAt != null ? this.insertAt.toFixed(2) + ' s' : 'playhead');
        const host = this.el.querySelector('#bpRows'); host.innerHTML = '';
        W = Math.max(520, (host.clientWidth || 0) - 24);   // the drawings fill the page
        this.rows.forEach((row, i) => { this.rowOut(row); host.appendChild(this.buildRow(row, i)); });
        if (!this.rows.length) host.innerHTML = '<div style="color:#888;padding:12px">no pairs — + pair</div>';
        if (this.activeRow >= this.rows.length) this.activeRow = Math.max(0, this.rows.length - 1);
        this.drawKeyboard(); this.paintRelation(); this.paintVoicing(); this.drawSeq(); this.paintFocus();
        const ar = this.el.querySelector('#bpArmed'); if (ar) ar.textContent = this.armed != null ? nn(this.armed) + ' armed — click a pair\'s node (or drag it there)' : (this.rootMode ? 'root mode: click a key' : '');
        requestAnimationFrame(() => this.renderLines());
    },
    // ---- the voicing bar's state (the buttons, the boxes, the seed chips — the strikes drawer's U8) ----
    paintVoicing() {
        const v = this.voicing, el = this.el; if (!el) return;
        el.querySelectorAll('.bpV').forEach(b => { const on = b.dataset.v === v.preset; b.style.background = on ? '#7B3FE4' : ''; b.style.color = on ? '#fff' : ''; b.style.borderColor = on ? '#7B3FE4' : ''; });
        const put = (id, val) => { const q = el.querySelector(id); if (q && document.activeElement !== q) q.value = val; };
        put('#bpOct', v.oct); put('#bpBelow', v.below); put('#bpAbove', v.above);
        const chips = 'background:#2a2a30;color:#ddd;border:1px solid #555;border-radius:3px;padding:0 4px;font-size:11px;cursor:pointer;line-height:16px';
        const hist = Array.isArray(v.hist) ? v.hist : (v.hist = []); if (!hist.includes(v.seed)) this.noteSeed();
        const seeds = el.querySelector('#bpSeeds');
        if (seeds) {
            seeds.innerHTML = '<span style="display:inline-flex;flex-wrap:wrap;gap:3px;align-items:center;color:#9a9" title="the seed of this voicing — click an earlier one to have it back, or type one">seed <input id="bpSeedIn" type="number" min="1" step="1" value="' + v.seed + '" style="width:44px">'
                + hist.map(n => '<button class="bpSeed" data-n="' + n + '" style="' + chips + (n === v.seed ? ';background:#c9a8ff;color:#222' : '') + '">' + n + '</button>').join('') + '</span>';
            seeds.querySelector('#bpSeedIn').addEventListener('change', ev => { ev.stopPropagation(); this.useSeed(+ev.target.value); });
            seeds.querySelectorAll('.bpSeed').forEach(b => b.addEventListener('click', ev => { ev.stopPropagation(); this.useSeed(+b.dataset.n); }));
        }
    },
    noteSeed() { const v = this.voicing, h = Array.isArray(v.hist) ? v.hist : (v.hist = []); const i = h.indexOf(v.seed); if (i >= 0) h.splice(i, 1); h.unshift(v.seed); if (h.length > SEED_KEEP) h.length = SEED_KEEP; },
    nextSeed() { const v = this.voicing; return Math.max(v.seed || 0, ...(Array.isArray(v.hist) ? v.hist : [])) + 1; },
    useSeed(n) { this.voicing.seed = Math.max(1, Math.round(+n || 1)); this.noteSeed(); this.applyVoicing(); },
    // the sonority voiced from its original pitches (BeatingCalc.voiceChord: pure — the same five numbers, the same voicing); the pairs
    // holding a note of the sonority follow it (Q3) and refold (§180)
    voiceNow() { const BC = BC_(); if (!this.chord.length) return; const v = BC.voiceChord(this.chord.map(n => n.midi0 != null ? n.midi0 : n.midi), this.voicing, this.range()); this.chord.forEach((n, i) => { n.midi = v[i]; }); },
    applyVoicing() { this.voiceNow(); this.refoldRows(); this.render(); },
    // a sonority onto the keyboard: the original pitches kept (midi0), the voicing applied; a pair's note index belongs to the sonority it
    // was made on — it survives where the voiced note at that index is the pair's note as given (a reopened beating, a loaded take), else
    // it is cleared (the pair keeps its pitch, the line then comes from the key)
    setChord(notes) {
        this.chord = (notes || []).map(n => Object.assign({}, n, { midi0: n.midi }));
        this.voiceNow();
        this.rows.forEach(r => { const b = r.b; if (b.noteIndex != null && !(this.chord[b.noteIndex] && this.chord[b.noteIndex].midi === b.srcPitch)) b.noteIndex = null; });
        this.refoldRows(); this.render();
    },
    refoldRows() { this.rows.forEach(r => { const b = r.b; if (b.noteIndex != null && this.chord[b.noteIndex]) { b.srcPitch = this.chord[b.noteIndex].midi; this.refold(r); } }); },
    // THE PAIR'S FOLD (§179–180): the note as given (srcPitch — the sonority's or typed) folds by octaves AS ONE UNIT to the nearest octave
    // both players hold their notes, as written first, a tie down; when no octave serves, the pitch stays as given and the row flags it
    // and offers the ladder (buildRow). The block's `pitch` is always what sounds.
    refold(row) {
        const BC = BC_(), T = TRK(), b = row.b;
        const me = T[row.layer] && T[row.layer].instKey, pt = b.partnerLayer != null && T[b.partnerLayer] ? T[b.partnerLayer].instKey : null;
        if (b.srcPitch == null) b.srcPitch = b.pitch;
        const f = (me && pt) ? BC.foldPair(INST(), b.srcPitch, b.interval, me, pt) : null;
        if (f) { b.pitch = f.pitch; b.fold = f.k; } else { b.pitch = b.srcPitch; b.fold = 0; }
        this.changed(row, true);
        return f;
    },
    rowFold(row, m) {   // what the row's pair would make of a note, without touching the row
        const BC = BC_(), T = TRK(), b = row.b;
        const me = T[row.layer] && T[row.layer].instKey, pt = b.partnerLayer != null && T[b.partnerLayer] ? T[b.partnerLayer].instKey : null;
        return (me && pt) ? BC.foldPair(INST(), m, b.interval, me, pt) : null;
    },
    // the pitch each player of the row actually sounds, with the fold mark
    rowPitches(row) {
        const BC = BC_(), b = row.b, out = row.out || this.rowOut(row), iv = BC.INTERVALS[b.interval] || BC.INTERVALS.unison, T = TRK();
        const me = T[row.layer] && T[row.layer].instKey, src = b.srcPitch != null ? b.srcPitch : b.pitch;
        const k = Math.round((b.pitch - src) / 12), mark = BC.foldMark(k);
        const of = key => key ? { player: key, pitch: b.pitch + (out.players.upper === key && iv.semitones ? iv.semitones : 0), mark, k } : null;
        return { me: of(me), partner: of(b.partnerLayer != null && T[b.partnerLayer] ? T[b.partnerLayer].instKey : null), src, k, mark };
    },
    // THE LINES (the strikes drawer's renderLines): from the assigned note's dot on the keyboard — or its key when the note is not in the
    // sonority — to the pair's node, dotted, in the row's colour; over the body, redrawn on render and on the columns' scroll
    renderLines() {
        const el = this.el, svg = el && el.querySelector('#bpLines'), body = el && el.querySelector('#bpBody'), kb = el && el.querySelector('#bpKb');
        if (!svg || !body || !kb || !this.isOpen()) return;
        const bb = body.getBoundingClientRect(); svg.setAttribute('width', bb.width); svg.setAttribute('height', bb.height);
        const kbBox = el.querySelector('#bpKbWrap').getBoundingClientRect();
        let s = '';
        this.rows.forEach((row, i) => {
            const b = row.b, src = b.srcPitch != null ? b.srcPitch : b.pitch, col = ROW_COLORS[i % ROW_COLORS.length];
            const node = el.querySelector('.bpRow[data-row="' + i + '"] .bpNode'); if (!node) return;
            const from = (b.noteIndex != null && kb.querySelector('.bpDot[data-i="' + b.noteIndex + '"]')) || kb.querySelector('.bpDot[data-m="' + src + '"]') || kb.querySelector('.bpKey[data-m="' + src + '"]');
            if (!from) return;
            const a = from.getBoundingClientRect(), n = node.getBoundingClientRect();
            const y1 = a.top + a.height / 2, y2 = n.top + n.height / 2;
            if (y1 < kbBox.top || y1 > kbBox.bottom || y2 < bb.top || y2 > bb.bottom) return;   // scrolled out of sight: no line
            const x1 = a.left + a.width - bb.left, x2 = n.left + n.width / 2 - bb.left;
            const hot = i === this.activeRow;
            s += '<line x1="' + x1 + '" y1="' + (y1 - bb.top) + '" x2="' + x2 + '" y2="' + (y2 - bb.top) + '" stroke="' + col + '" stroke-width="' + (hot ? 2 : 1.2) + '" stroke-dasharray="' + (hot ? '5 3' : '3 3') + '" opacity="' + (hot ? 0.95 : 0.6) + '"/>';
        });
        svg.innerHTML = s;
    },
    paintRelation() { this.el.querySelectorAll('.bpRelBtn').forEach(b => { const on = b.dataset.rel === this.relation; b.style.background = on ? '#7B3FE4' : ''; b.style.color = on ? '#fff' : ''; b.style.borderColor = on ? '#7B3FE4' : ''; }); },
    buildRow(row, i) {
        const C = C_(), BC = BC_(), b = row.b, out = row.out, T = TRK();
        const me = T[row.layer] ? T[row.layer].label : '?', meKey = T[row.layer] && T[row.layer].instKey, ptKey = b.partnerLayer != null && T[b.partnerLayer] ? T[b.partnerLayer].instKey : null;
        // the pitch side (§180): the note as given, the pair's fold, the ladder when no octave serves; every player in the partner menu
        const src = b.srcPitch != null ? b.srcPitch : b.pitch, RP = this.rowPitches(row), folded = !!(meKey && ptKey && BC.foldPair(INST(), src, b.interval, meKey, ptKey));
        const ladder = (!folded && meKey && ptKey) ? BC.pairLadder(INST(), src, b.interval, meKey, ptKey) : null;
        const laneOf = key => T.findIndex(t => t.instKey === key);
        const pcCol = m => this.pcColor(((m % 12) + 12) % 12);
        const chip = (p, bad) => p ? '<span class="bpChip" style="color:' + (bad ? '#e88' : pcCol(p.pitch)) + ';font-weight:600" title="' + esc(p.player + (bad ? ': out of reach at this interval in every octave' : ' sounds ' + nn(p.pitch) + (p.k ? ', ' + Math.abs(p.k) + ' octave' + (Math.abs(p.k) > 1 ? 's' : '') + (p.k > 0 ? ' up' : ' down') + ' from the note as given' : ', as given'))) + '">' + (bad ? '✕' : nn(p.pitch) + p.mark) + '</span>' : '';
        const seatOpts = meKey ? BC.seatOptions(INST(), src, b.interval, meKey) : [];
        const lim = k => k ? BC.bendLimits(INST(), k) : null, lo = lim(out.players.lower), up = lim(out.players.upper);
        const fl = out.flags.map(f => f.flag).filter((v, j, a) => a.indexOf(v) === j);
        { const used = this.usedLayers(row); const twice = [row.layer, b.partnerLayer].filter(L => L != null && used.has(L)).map(L => T[L].short); if (twice.length) fl.push('⚠ ' + twice.join(', ') + ' also in another pair — one channel would carry two bends'); }
        const iv = BC.INTERVALS[b.interval] || BC.INTERVALS.unison;
        const box = document.createElement('div');
        box.className = 'bpRow'; box.dataset.row = i;
        box.style.cssText = 'border:1px solid #444;border-left:4px solid ' + ROW_COLORS[i % ROW_COLORS.length] + ';border-radius:5px;padding:6px 8px;margin-bottom:8px;background:' + (i === this.activeRow ? 'rgba(123,63,228,0.08)' : 'rgba(255,255,255,0.03)');
        // the pitch side: a click on the row's header takes the armed note (or makes the row the active one — the keyboard dims for it);
        // a note dragged from the keyboard lands the same way
        box.addEventListener('mousedown', () => { if (this.activeRow !== i) { this.activeRow = i; this.paintFocus(); } this.focus = 'pair'; this.paintFocus(); });   // the row under the mouse is the pair SPACE plays
        box.addEventListener('click', ev => { if (ev.target.closest('input, select, button, svg')) return; if (this.armed != null) this.assign(i, this.armed); else if (this.activeRow !== i) { this.activeRow = i; this.render(); } });
        box.addEventListener('dragover', ev => { ev.preventDefault(); box.style.outline = '2px dashed ' + ROW_COLORS[i % ROW_COLORS.length]; });
        box.addEventListener('dragleave', () => { box.style.outline = ''; });
        box.addEventListener('drop', ev => { ev.preventDefault(); box.style.outline = ''; const m = parseInt(ev.dataTransfer.getData('text/plain'), 10); if (!isNaN(m)) this.assign(i, m); });
        const sel = 'background:#7B3FE4;color:#fff;border-color:#7B3FE4;';
        const btn = (cls, data, label, on, title) => '<button class="' + cls + '" ' + data + ' title="' + esc(title || '') + '" style="font-size:12px;padding:1px 5px;margin:1px;cursor:pointer;' + (on ? sel : '') + '">' + label + '</button>';
        box.innerHTML = [
            '<div style="display:flex;flex-wrap:wrap;gap:4px 8px;align-items:center;margin-bottom:4px">',
            // the pair's NODE (CN-36: "click a node connected to a pair"; the strikes drawer's "the lines land here" dot): lit while a note is armed
            '<span class="bpNode" title="' + (this.armed != null ? nn(this.armed) + ' lands here' : 'arm a note on the keyboard, then click here') + '" style="display:inline-block;width:12px;height:12px;border-radius:50%;border:2px solid ' + ROW_COLORS[i % ROW_COLORS.length] + ';background:' + (this.armed != null ? ROW_COLORS[i % ROW_COLORS.length] : '#1b1b20') + ';cursor:pointer;flex:none"></span>',
            '<b style="color:#c9a8ff">pair ' + (i + 1) + '</b> ',
            (row.zone ? '<span>' + esc(me) + '</span>' : '<select class="bpLane" title="the launching player">' + [0, 1, 3, 4, 5, 6].map(L => '<option value="' + L + '"' + (L === row.layer ? ' selected' : '') + '>' + esc(T[L].label) + '</option>').join('') + '</select>'),
            ' ' + chip(RP.me, !folded),
            // the partner: EVERY player listed (§180 — no self-limiting), each with what it would sound on this note and the fold mark, ✕ when no octave serves both
            ' + <select class="bpPartner" title="the partner: every player, with the pitch it would sound on this note (&#8593; / &#8595; = folded by octaves, both players together), &#10005; when no octave serves both">' + (b.partnerLayer == null ? '<option value="" selected>partner&#8230;</option>' : '')
                + seatOpts.map(o => { const L = laneOf(o.player), f = o.fold, pOf = f ? (f.lower === o.player ? f.pitch : f.pitch + iv.semitones) : null; return L < 0 ? '' : '<option value="' + L + '"' + (L === b.partnerLayer ? ' selected' : '') + '>' + esc(T[L].label) + ' — ' + (f ? nn(pOf) + BC.foldMark(f.k) : '✕') + '</option>'; }).join('') + '</select>',
            ' ' + chip(RP.partner, !folded),
            ' on <input class="bpPitch" type="number" value="' + src + '" min="21" max="108" step="1" style="width:50px" title="the note as given (the sonority&#8217;s, or typed) &#8212; the pair folds it as one unit to the nearest octave both reach, as written first, a tie down"> <span style="color:#aaa">' + nn(src) + (folded && RP.k ? ' &#8594; ' + nn(b.pitch) + RP.mark : '') + (iv.semitones && folded ? ' + ' + nn(b.pitch + iv.semitones) : '') + (b.noteIndex != null ? ' <span style="color:#777" title="the pair remembers which note of the sonority it holds: the voicings and the octave box move it and the pair follows">note ' + (b.noteIndex + 1) + '</span>' : '') + '</span>',
            ' <span>' + Object.values(BC.INTERVALS).map(q => btn('bpIv', 'data-iv="' + q.key + '"', q.label, b.interval === q.key, q.label + ': the just offset ' + q.justOffsetCents + ' c on the upper note, the beating ' + q.partial + '× per cent')).join('') + '</span>',
            // this pair's own length and its own play (2026-09-07)
            ' <label style="color:#888" title="this pair&#8217;s own duration &#8212; the curves keep their shape over it; the sequence strip&#8217;s right edge does the same">len <input class="bpRowLen" type="number" step="0.5" min="0.5" max="180" value="' + row.length + '" style="width:52px"> s</label>',
            ' ' + btn('bpRowPlay', '', '&#9654; pair', false, 'hear this pair alone — SPACE does the same while the pair is the focus'),
            (b.skip ? ' <span style="color:#e88">&#10005; skipped &#8212; nobody plays it</span> ' + btn('bpUnskip', '', 'play it', false, 'take the skip off') : ''),
            (row.zone ? '' : ' <button class="bpRemove" title="remove this pair" style="margin-left:auto;font-size:12px;cursor:pointer">&#10005; pair</button>'),
            '</div>',
            // THE LADDER (§180, Q2 — offered, never applied by the tool): when no octave serves both players at this interval — the intervals
            // that would, another player for either seat, or skip (the strikes drawer's third way)
            (ladder ? '<div class="bpLadder" style="color:#e88;margin:0 0 4px;display:flex;flex-wrap:wrap;gap:4px 6px;align-items:center">&#9888; no octave where ' + esc(T[row.layer].short) + ' and ' + esc(T[b.partnerLayer].short) + ' both reach ' + nn(src) + ' at ' + iv.label + ' &#8212;'
                + (ladder.intervals.length ? ' <span style="color:#aaa">the interval:</span> ' + ladder.intervals.map(o => btn('bpOfferIv', 'data-iv="' + o.interval + '"', o.label + ': ' + esc(T[laneOf(o.fold.lower)].short) + ' ' + nn(o.fold.pitch) + ' · ' + esc(T[laneOf(o.fold.upper)].short) + ' ' + nn(o.fold.pitch + BC.INTERVALS[o.interval].semitones), false, 'this pair at ' + o.label + ' (folded ' + Math.abs(o.fold.k) + ')')).join('') : '')
                + (ladder.players.some(o => o.seat === 'b') ? ' <span style="color:#aaa">instead of ' + esc(T[b.partnerLayer].short) + ':</span> ' + ladder.players.filter(o => o.seat === 'b').map(o => btn('bpOfferPt', 'data-lane="' + laneOf(o.player) + '"', esc(T[laneOf(o.player)].short) + ' ' + nn(o.fold.lower === o.player ? o.fold.pitch : o.fold.pitch + iv.semitones) + BC.foldMark(o.fold.k), false, T[laneOf(o.player)].label + ' as the partner')).join('') : '')
                + (!row.zone && ladder.players.some(o => o.seat === 'a') ? ' <span style="color:#aaa">instead of ' + esc(T[row.layer].short) + ':</span> ' + ladder.players.filter(o => o.seat === 'a').map(o => btn('bpOfferMe', 'data-lane="' + laneOf(o.player) + '"', esc(T[laneOf(o.player)].short) + ' ' + nn(o.fold.lower === o.player ? o.fold.pitch : o.fold.pitch + iv.semitones) + BC.foldMark(o.fold.k), false, T[laneOf(o.player)].label + ' as the launching player')).join('') : '')
                + ' ' + btn('bpSkip', '', '&#10005; skip', !!b.skip, 'nobody plays this pair (the strikes drawer\'s third way); a new note, partner or interval takes it off') + '</div>' : ''),
            '<div style="display:flex;flex-wrap:wrap;gap:4px 8px;align-items:center;margin-bottom:3px">',
            '<span style="color:#888">rate</span> ' + SHAPES.map(([k, l]) => btn('bpShape', 'data-shape="' + k + '"', l, false, 'pop the shape in (the level = the row&#8217;s to rate)')).join(''),
            ' to <input class="bpRateTo" type="number" value="' + (+b.rateTo || 0) + '" min="0" max="30" step="0.5" style="width:46px" title="the shape&#8217;s level in beats per second"> /s',
            ' ' + btn('bpLock', '', row.locked ? '&#128274; mirrored' : '&#128275; free', row.locked, 'the mirror lock: drag one curve, the other mirrors (ALT-drag moves one alone)'),
            ' ' + btn('bpDraw', '', '&#10002; draw', row.draw, 'draw: click in the rate area to add points (ESC or click again to end)'),
            ' <label style="color:#888">±<input class="bpScale" type="number" value="' + row.scale + '" min="2" max="40" step="1" style="width:40px" title="the rate axis, beats per second"></label>',
            // the pair takes (2026-09-07: "a save for individual pairs settings"): the curves, the level, the breaths, the interval, the length, under a name
            ' <span style="margin-left:auto;display:inline-flex;gap:4px;align-items:center"><input class="bpPairName" type="text" placeholder="pair take" style="width:90px" title="a name for this pair&#8217;s settings (the curves, the level, the breaths, the interval, the length) &#8212; ENTER saves">'
                + '<button class="bpPairSave" title="save this pair&#8217;s settings as a named pair take (bank/panel_snapshots.json, the beatingPairs bucket)">save pair</button>'
                + '<select class="bpPairSel" style="max-width:120px" title="load a pair take into this pair: its curves, level, breaths, interval and length; the players and the note stay"><option value="">load pair&#8230;</option>' + Object.keys(this.pairTakes || {}).sort().map(n => '<option value="' + esc(n) + '">' + esc(n) + '</option>').join('') + '</select></span>',
            '</div>',
            '<svg class="bpRates" width="' + W + '" height="' + HR + '" style="display:block;background:#1a1a20;border-radius:3px"></svg>',
            '<div style="display:flex;gap:8px;align-items:center;margin:3px 0 2px"><span style="color:#888">crescendo</span> ' + SHAPES.map(([k, l]) => btn('bpLevShape', 'data-shape="' + k + '"', l, false, 'the level shape between low and high')).join('')
                + ' ' + btn('bpLevFollow', '', 'follows the beating', !b.levelCurve, 'the crescendo follows the beating between low and high')
                + ' low <input class="bpLevLo" type="number" value="' + b.levelLo + '" min="0" max="1" step="0.05" style="width:44px" title="the score&#8217;s curve height, not dB and not raw velocity: 0 = the softest held dynamic, 1 = fff, the same loudness on every instrument through the loudness remap (velocity + a CC7 trim per instrument, measured in the rack)"> high <input class="bpLevHi" type="number" value="' + b.levelHi + '" min="0" max="1" step="0.05" style="width:44px" title="the score&#8217;s curve height: 0 = the softest held dynamic, 1 = fff, equal loudness across instruments through the remap"></div>',
            '<svg class="bpLevel" width="' + W + '" height="' + HL + '" style="display:block;background:#1a1a20;border-radius:3px"></svg>',
            '<div style="display:flex;gap:8px;align-items:center;margin:3px 0 2px"><span style="color:#888">breaths</span> <select class="bpBreath">' + ['one', 'continuous', 'designated'].map(k => '<option value="' + k + '"' + ((b.breath.mode || 'one') === k ? ' selected' : '') + '>' + k + '</option>').join('') + '</select>'
                + ' ' + btn('bpShuffle', '', '&#8635; shuffle', false, 'deal the breaths again from a new seed — the hand-moved marks stay') + ' <span style="color:#888">seed ' + (b.breath.seed || 1) + '</span>'
                + ' <span class="bpBreathInfo" style="color:#888"></span></div>',
            '<svg class="bpBreaths" width="' + W + '" height="' + HB + '" style="display:block;background:#1a1a20;border-radius:3px"></svg>',
            '<div style="display:flex;gap:8px;align-items:center;margin-top:3px"><span style="color:#888" title="this pair&#8217;s place in the sequence — drag its zone in the strip above">@ ' + (row.offset || 0).toFixed(2) + ' s · ' + row.length + ' s</span>',
            ' <span class="bpReadout" style="color:#9a9;margin-left:auto">max ' + out.maxBeat + '/s · ' + (out.players.lower || '?') + ' ±' + out.maxCents.lower + ' c' + (lo ? '/' + lo.limitCents : '') + ' · ' + (out.players.upper || '?') + ' ±' + out.maxCents.upper + ' c' + (up ? '/' + up.limitCents : '')
                + (out.justOffsetCents ? ' · just ' + (out.justOffsetCents > 0 ? '+' : '') + out.justOffsetCents + ' c' : '') + ' · ' + out.notes.lower.length + '+' + out.notes.upper.length + ' notes' + (fl.length ? ' · <span style="color:#e88">&#9888; ' + fl.join(' ') + '</span>' : '') + '</span></div>',
        ].join('');
        // the controls
        const q = s => box.querySelector(s), qa = s => box.querySelectorAll(s);
        const redo = () => { this.changed(row, true); this.render(); };
        const refit = () => { b.skip = false; this.refold(row); this.render(); this.sayFold(row, i); };   // a change of a seat, the note or the interval refolds the pair (§180) and takes a skip off
        if (q('.bpLane')) q('.bpLane').addEventListener('change', ev => { row.layer = +ev.target.value; if (b.partnerLayer === row.layer) b.partnerLayer = null; refit(); });
        q('.bpPartner').addEventListener('change', ev => { b.partnerLayer = ev.target.value === '' ? null : +ev.target.value; refit(); });
        q('.bpPitch').addEventListener('change', ev => { const v = parseInt(ev.target.value, 10); if (!isNaN(v)) { b.noteIndex = null; b.srcPitch = clamp(v, 21, 108); refit(); } });
        qa('.bpIv').forEach(el => el.addEventListener('click', () => { b.interval = el.dataset.iv; refit(); }));
        qa('.bpOfferIv').forEach(el => el.addEventListener('click', () => { b.interval = el.dataset.iv; refit(); }));
        qa('.bpOfferPt').forEach(el => el.addEventListener('click', () => { b.partnerLayer = +el.dataset.lane; refit(); }));
        qa('.bpOfferMe').forEach(el => el.addEventListener('click', () => { row.layer = +el.dataset.lane; refit(); }));
        if (q('.bpSkip')) q('.bpSkip').addEventListener('click', () => { b.skip = !b.skip; redo(); this.setStatus(b.skip ? 'pair ' + (i + 1) + ' skipped — nobody plays it; a new note, partner or interval takes the skip off' : 'pair ' + (i + 1) + ' plays again'); });
        if (q('.bpUnskip')) q('.bpUnskip').addEventListener('click', () => { b.skip = false; redo(); });
        if (q('.bpRemove')) q('.bpRemove').addEventListener('click', () => this.removeRow(i));
        qa('.bpShape').forEach(el => el.addEventListener('click', () => { this.popShape(row, el.dataset.shape); redo(); }));
        q('.bpRateTo').addEventListener('change', ev => { const v = parseFloat(ev.target.value); if (!isNaN(v)) { this.setLevel(row, v); redo(); } });
        q('.bpRowLen').addEventListener('change', ev => { const v = parseFloat(ev.target.value); if (v > 0) this.setRowLength(row, v); });
        q('.bpRowPlay').addEventListener('click', () => { this.activeRow = i; this.setFocus('pair'); this.playRow(i); });
        q('.bpPairSave').addEventListener('click', () => this.savePair(i, q('.bpPairName').value));
        q('.bpPairName').addEventListener('keydown', ev => { if (ev.key !== 'Enter') return; ev.preventDefault(); ev.stopPropagation(); this.savePair(i, q('.bpPairName').value); });
        q('.bpPairSel').addEventListener('change', ev => { if (ev.target.value) this.loadPair(i, ev.target.value); ev.target.value = ''; });
        q('.bpLock').addEventListener('click', () => { row.locked = !row.locked; if (row.locked) { this.relock(row); } else { this.unlock(row); } redo(); });
        q('.bpDraw').addEventListener('click', () => { row.draw = !row.draw; this.render(); this.setStatus(row.draw ? 'draw: click in the rate area to add points; a point drags; ALT-click removes it; click draw again to end' : 'draw off'); });
        q('.bpScale').addEventListener('change', ev => { const v = parseFloat(ev.target.value); if (v > 0) { row.scale = v; this.render(); } });
        qa('.bpLevShape').forEach(el => el.addEventListener('click', () => { b.levelCurve = BC.shape(el.dataset.shape, { level: b.levelHi, from: el.dataset.shape === 'rampIn' ? b.levelHi : b.levelLo, to: el.dataset.shape === 'rampIn' ? b.levelLo : b.levelHi, peak: b.levelHi, base: b.levelLo }); redo(); }));
        q('.bpLevFollow').addEventListener('click', () => { b.levelCurve = null; redo(); });
        q('.bpLevLo').addEventListener('change', ev => { const v = parseFloat(ev.target.value); if (!isNaN(v)) { b.levelLo = clamp(v, 0, 1); redo(); } });
        q('.bpLevHi').addEventListener('change', ev => { const v = parseFloat(ev.target.value); if (!isNaN(v)) { b.levelHi = clamp(v, 0, 1); redo(); } });
        q('.bpBreath').addEventListener('change', ev => { b.breath.mode = ev.target.value; redo(); });
        q('.bpShuffle').addEventListener('click', () => { b.breath.mode = 'designated'; b.breath.seed = (b.breath.seed || 1) + 1; delete b.breath.deal; redo(); this.setStatus('breaths dealt again (seed ' + b.breath.seed + '); the hand-moved marks kept'); });
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
    unlock(row) { const c = this.curvesOf(row); row.b.rate = { lower: c.lower.map(p => p.slice()), upper: c.upper.map(p => p.slice()) }; },
    relock(row) {   // the upper curve becomes the heard curve's upper half again; the lower mirrors it (the slopes kept)
        const BC = BC_(), c = this.curvesOf(row); row.b.beat = c.upper.map(p => (BC.slopeOf(p) ? [p[0], r3(p[1] * 2), BC.slopeOf(p)] : [p[0], r3(p[1] * 2)])); row.b.share = 0.5; row.b.rate = null; row.b.shape = 'drawn';
    },
    withSlope(pt, p, v, s) { return s ? [p, v, s] : [p, v]; },
    // an edit of one curve's point: locked → the heard curve's point (the other mirrors); unlocked → that curve alone; the segment's slope stays
    setPoint(row, who, idx, p, v) {
        const BC = BC_(), b = row.b;
        if (row.locked) {
            const beat = BC.curveOf(this.heardCurve(row)); if (!beat[idx]) return;
            beat[idx] = this.withSlope(beat[idx], p, r3(Math.abs(v) * 2), BC.slopeOf(beat[idx])); b.beat = beat; b.shape = 'drawn';
        } else {
            if (!b.rate) this.unlock(row);
            const c = BC.curveOf(b.rate[who]); if (!c[idx]) return;
            c[idx] = this.withSlope(c[idx], p, r3(v), BC.slopeOf(c[idx])); b.rate[who] = c;
        }
    },
    // the SLOPE of the segment after a point (2026-09-07, "like in logic pro" — the score's power model, BeatingCalc.evalCurve): locked → on
    // the heard curve (both mirror); unlocked → that curve alone
    setSlope(row, who, idx, s) {
        const BC = BC_(), b = row.b; s = clamp(r3(s), -1, 1);
        if (row.locked) { const beat = BC.curveOf(this.heardCurve(row)); if (!beat[idx]) return; beat[idx] = this.withSlope(beat[idx], beat[idx][0], beat[idx][1], s); b.beat = beat; b.shape = 'drawn'; }
        else { if (!b.rate) this.unlock(row); const c = BC.curveOf(b.rate[who]); if (!c[idx]) return; c[idx] = this.withSlope(c[idx], c[idx][0], c[idx][1], s); b.rate[who] = c; }
    },
    dragSlope(row, who, idx, e0, svg, get, set) {
        const y0 = e0.clientY, s0 = get();
        const onMove = ev => { set(clamp(s0 + (y0 - ev.clientY) / (HR / 2), -1, 1)); this.rowOut(row); this.drawRates(row, svg); this.changed(row, false); };
        const onUp = () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); this.changed(row, true); this.render(); };
        window.addEventListener('mousemove', onMove); window.addEventListener('mouseup', onUp);
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
        const b = row.b, L = row.length; if (!b.slide) b.slide = { lower: 0, upper: 0 };
        if (row.locked) { b.slide.lower = r3(clamp(b.slide.lower + dSec, -L, L)); b.slide.upper = r3(clamp(b.slide.upper + dSec, -L, L)); }
        else b.slide[who] = r3(clamp((b.slide[who] || 0) + dSec, -L, L));
    },

    // ---- the rate area: the two curves, the band by zone, the handles on rails ----
    drawRates(row, svg) {
        const BC = BC_(), out = row.out, cur = this.curvesOf(row), b = row.b, S = row.scale, L = row.length;
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
            // the curve sampled through its slopes (the score's power model); the points are its handles, the diamonds its slopes
            const N = 120, d = []; for (let i = 0; i <= N; i++) { const p = i / N; d.push((i ? 'L' : 'M') + X(clamp(p + sp, 0, 1)).toFixed(1) + ' ' + Y(BC.evalCurve(pts, p)).toFixed(1)); }
            const path = mk('path', { d: d.join(' '), fill: 'none', stroke: col, 'stroke-width': 2.2, 'stroke-linejoin': 'round' }); path.style.cursor = 'ew-resize'; path.style.pointerEvents = 'stroke';
            path.addEventListener('mousedown', e => { e.preventDefault(); e.stopPropagation(); this.dragBody(row, who, e, svg); });
            svg.appendChild(path);
            for (let k = 0; k + 1 < pts.length; k++) {   // a slope diamond at each segment's middle (2026-09-07): drag up / down bends it, the wheel steps it
                const a = pts[k], c = pts[k + 1]; if (c[0] - a[0] < 0.03) continue;
                const pm = (a[0] + c[0]) / 2, cx = X(clamp(pm + sp, 0, 1)), cy = Y(BC.evalCurve(pts, pm)), s = BC.slopeOf(a);
                const dm = mk('rect', { x: cx - 4, y: cy - 4, width: 8, height: 8, transform: 'rotate(45 ' + cx + ' ' + cy + ')', fill: s ? col : '#1a1a20', stroke: col, 'stroke-width': 1.5, 'fill-opacity': s ? 0.8 : 1 });
                dm.style.cursor = 'ns-resize';
                dm.innerHTML = '<title>curve ' + s.toFixed(2) + ' — drag up / down to bend this segment (the score\'s curve), the wheel steps it, ALT-click straightens</title>';
                dm.addEventListener('mousedown', e => { e.preventDefault(); e.stopPropagation(); if (e.altKey) { this.setSlope(row, who, k, 0); this.changed(row, true); this.render(); return; } this.dragSlope(row, who, k, e, svg, () => BC.slopeOf(this.curvesOf(row)[who][k]), v => this.setSlope(row, who, k, v)); });
                dm.addEventListener('wheel', e => { e.preventDefault(); e.stopPropagation(); this.setSlope(row, who, k, BC.slopeOf(this.curvesOf(row)[who][k]) + (e.deltaY > 0 ? -0.05 : 0.05)); this.rowOut(row); this.drawRates(row, svg); this.changed(row, false); }, { passive: false });
                svg.appendChild(dm);
            }
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
        const g = svg._geom, r = svg.getBoundingClientRect(), b = row.b, L = row.length, cur = this.curvesOf(row)[who], n = cur.length;
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
        const g = svg._geom, L = row.length, x0 = e0.clientX; let last = 0;
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
        svg.innerHTML += '<title>the crescendo: the score\'s curve height — 0 the softest held dynamic, 1 fff, equal loudness across instruments through the remap</title>';
        svg.appendChild(mk('path', { d, fill: 'none', stroke: COL.level, 'stroke-width': 1.6 }));
        [0, 0.5, 1].forEach(v => { const t = mk('text', { x: 2, y: Y(v) + 3, fill: '#777', 'font-size': 11 }); t.textContent = v; svg.appendChild(t); });
        const lbl = mk('text', { x: x1 - 4, y: 11, fill: COL.level, 'font-size': 12, 'text-anchor': 'end' }); lbl.textContent = b.levelCurve ? 'own curve' : 'follows the beating · ' + b.levelLo + ' → ' + b.levelHi; svg.appendChild(lbl);
        if (b.levelCurve) {
            const pts = BC.curveOf(b.levelCurve);
            for (let k = 0; k + 1 < pts.length; k++) {   // the crescendo's segment slopes too (2026-09-07), the same diamonds
                const a = pts[k], c = pts[k + 1]; if (c[0] - a[0] < 0.03) continue;
                const pm = (a[0] + c[0]) / 2, cx = X(pm), cy = Y(clamp(BC.evalCurve(pts, pm), 0, 1)), s = BC.slopeOf(a);
                const dm = mk('rect', { x: cx - 3.5, y: cy - 3.5, width: 7, height: 7, transform: 'rotate(45 ' + cx + ' ' + cy + ')', fill: s ? COL.level : '#1a1a20', stroke: COL.level, 'stroke-width': 1.3 });
                dm.style.cursor = 'ns-resize'; dm.innerHTML = '<title>curve ' + s.toFixed(2) + ' — drag up / down to bend this segment; ALT-click straightens</title>';
                const setS = v => { const cur = BC.curveOf(b.levelCurve); cur[k] = v ? [cur[k][0], cur[k][1], clamp(r3(v), -1, 1)] : [cur[k][0], cur[k][1]]; b.levelCurve = cur; };
                dm.addEventListener('mousedown', e => {
                    e.preventDefault(); e.stopPropagation();
                    if (e.altKey) { setS(0); this.changed(row, true); this.render(); return; }
                    const y0 = e.clientY, s0 = s;
                    const onMove = ev => { setS(s0 + (y0 - ev.clientY) / (HL - 10)); this.rowOut(row); this.drawLevel(row, svg); this.changed(row, false); };
                    const onUp = () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); this.changed(row, true); this.render(); };
                    window.addEventListener('mousemove', onMove); window.addEventListener('mouseup', onUp);
                });
                svg.appendChild(dm);
            }
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
        const BC = BC_(), out = row.out, b = row.b, ns = 'http://www.w3.org/2000/svg', L = row.length;
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
        // the earlier pieces' harmonies (tools/harmony_scrape.js → bank/harmonies.json): the tuba's blasts, the two-piano chord shapes
        try { const r = await fetch('/bank/harmonies.json?t=' + Date.now(), { cache: 'no-store' }); if (r.ok) this.banks = await r.json(); } catch (e) { this.banks = null; }
        this.fillSources();
        return this.db;
    },
    // ---- the harmonies on the left (CN-36): one scroll, three collapsible banners — the strikes, the tuba's blasts, the two-piano chord shapes ----
    BANNERS: [['strikes', 'STRIKES'], ['blasts', 'BLASTS · the tuba piece'], ['chordShapes', 'CHORD SHAPES · 2 pianos 2 percussion']],
    entriesOf(bank) {
        if (bank === 'strikes') return this.sourceList().map(s => ({ id: s.id, label: '#' + s.index, name: s.t0.toFixed(2) + ' s', n: s.notes.length, range: nn(s.stats.midi.min) + '–' + nn(s.stats.midi.max), pitches: s.notes.map(q => q.midi) }));
        const b = this.banks && this.banks.banks && this.banks.banks[bank];
        return b && b.entries ? b.entries.map(e => ({ id: e.id, label: e.id, name: e.name, n: e.n, range: e.range, pitches: e.pitches, aliases: e.aliases || [] })) : [];
    },
    renderList() {
        const host = this.el && this.el.querySelector('#bpList'); if (!host) return;
        let h = '';
        for (const [key, title] of this.BANNERS) {
            const es = this.entriesOf(key), open = !this.collapsed[key];
            h += '<div class="bpBanner" data-bank="' + key + '" title="click to ' + (open ? 'collapse' : 'expand') + '" style="position:sticky;top:0;z-index:1;background:#1b1b20;padding:3px 8px;cursor:pointer;color:#c9a8ff;border-bottom:1px solid #333;font-weight:600;white-space:nowrap">' + (open ? '&#9662; ' : '&#9656; ') + esc(title) + ' <span style="color:#777;font-weight:400">' + es.length + '</span></div>';
            if (open) es.forEach(e => {
                const on = this.harmony && this.harmony.bank === key && this.harmony.id === e.id;
                h += '<div class="bpEntry" data-bank="' + key + '" data-id="' + esc(e.id) + '" style="padding:2px 8px;cursor:pointer;display:flex;gap:6px;white-space:nowrap;' + (on ? 'background:rgba(123,63,228,.3)' : '') + '" title="' + esc(e.name) + (e.aliases && e.aliases.length ? ' · also ' + e.aliases.join(' ') : '') + '">'
                    + '<span style="color:#777;width:56px;overflow:hidden;flex:none">' + esc(e.label) + '</span><span style="flex:1 1 auto;overflow:hidden;text-overflow:ellipsis">' + esc(e.name) + '</span><span style="color:#bbb;flex:none">' + e.n + ' n</span><span style="color:#777;flex:none">' + esc(e.range) + '</span></div>';
            });
        }
        host.innerHTML = h;
        host.querySelectorAll('.bpBanner').forEach(el => el.addEventListener('click', () => { const k = el.dataset.bank; this.collapsed[k] = !this.collapsed[k]; this.renderList(); }));
        host.querySelectorAll('.bpEntry').forEach(el => el.addEventListener('click', () => { this.focus = 'chord'; this.pickHarmony(el.dataset.bank, el.dataset.id); }));
        const on = host.querySelector('.bpEntry[style*="rgba(123,63,228"]'); if (on && typeof on.scrollIntoView === 'function') { try { on.scrollIntoView({ block: 'nearest' }); } catch (e) { } }
    },
    pickHarmony(bank, id) {
        if (bank === 'strikes') { this.pickSource(id); return; }
        const e = this.entriesOf(bank).find(x => x.id === id); if (!e) return;
        this.harmony = { bank, id }; this.chordId = ''; this.rootMode = false; this.setChord(e.pitches.map(m => ({ midi: m })));
        this.renderList();
        const nm = this.el.querySelector('#bpChordName'); if (nm) nm.textContent = e.label + ' · ' + e.name;
        this.setStatus(e.label + ' ' + e.name + ' (' + e.n + ' notes, ' + e.range + ') on the keyboard — &#9654; chord hears it on the piano; click or double-click a note, then a pair\'s node'.replace('&#9654;', '▶'));
    },
    // hear the chord alone, on the piano voice (CN-36: "use the piano voice for play back of just the harmony")
    async hearChord() {
        const C = C_(); if (!C) return;
        if (!this.chord.length) { this.setStatus('no chord on the keyboard — pick one on the left', true); return; }
        if (!C._zoneMidiInited) await C.initZoneMidi();
        const r = C.beatingRouting(2), out = r && C._zoneMidiOutputs[(r.port || '').toLowerCase()];
        if (!out) { this.setStatus('the piano has no MIDI output — is the rack up?', true); return; }
        const ch = (r.channel || 1) - 1, now = performance.now() + 5, dur = 1500;
        out.send([0xB0 | ch, 7, 127], now); if (r.cc0 != null) out.send([0xB0 | ch, 0, r.cc0], now);
        const keys = [...new Set(this.chord.map(n => n.midi))].sort((a, b) => a - b);
        keys.forEach(k => { out.send([0x90 | ch, k, 88], now + 5); C.noteSounding(out, ch, k, now + 5 + dur, true); });   // the offs from timers, never queued ahead (§178)
        this.setStatus('the chord on the piano: ' + keys.map(nn).join(' '));
    },
    // the strikes in sequence order, numbered as the drawer numbers them (index · t0 · notes)
    sourceList() {
        const db = this.db; if (!db) return [];
        const seqs = Object.values(db.sequences || {}), out = [];
        seqs.forEach(sq => (sq.strikeIds || []).forEach(sid => { const s = db.strikes[sid]; if (s) out.push(s); }));
        if (!out.length) Object.values(db.strikes || {}).forEach(s => out.push(s));
        return out;
    },
    fillSources() { this.renderList(); },
    pickSource(id) {
        const s = this.db && this.db.strikes && this.db.strikes[id];
        this.chordId = s ? id : '';
        this.harmony = s ? { bank: 'strikes', id } : null;
        this.rootMode = false; this.setChord(s ? s.notes.map(n => ({ midi: n.midi, instKey: n.instKey, id: n.objectId })) : []); this.renderList();
        const nm = this.el.querySelector('#bpChordName'); if (nm) nm.textContent = s ? '#' + s.index + ' · strike at ' + s.t0.toFixed(2) + ' s' : '';
        if (s) this.setStatus('strike #' + s.index + ' (' + s.t0.toFixed(2) + ' s, ' + s.notes.length + ' notes) on the keyboard — ▶ chord hears it on the piano; click or double-click a note, then a pair\'s node; the dimmed keys are what the active pair cannot play');
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
    rowCanPlay(row, m) { return !!this.rowFold(row, m); },   // in some octave (§180: the pair folds as a unit); rowFold says which
    // the keyboard: the drawer's drawing — vertical keys, the C labels, the chord's notes as dots in their pitch-class colours with their names,
    // the rows' pair notes as rings in the row colours, the keys the active pair cannot play dimmed; a click arms a note (or sets the root)
    drawKeyboard() {
        const svg = this.el && this.el.querySelector('#bpKb'); if (!svg) return;
        const BC = BC_(), R = this.range(), h = 10, rows = R.hi - R.lo + 1, H = rows * h + KB.top + 10, keyY = m => KB.top + (R.hi - m) * h;
        svg.setAttribute('height', H); svg.style.height = H + 'px';
        const row = this.rows[this.activeRow], T = TRK();
        let s = '';
        // the players' ordinary ranges as columns at the left (2026-09-07: "different colored lines showing me the ordinary range of the
        // instruments in this piece, each in its own column"), one per bending player in score order; the legend above the keyboard
        const P = BC.players(INST());
        P.forEach((p, i) => {
            const r = BC.ordinaryRange(INST(), p); if (!r) return;
            const x = KB.colX + i * KB.colGap, top = Math.min(r[1], R.hi), bot = Math.max(r[0], R.lo), col = INST_COL[p] || '#888';
            const short = (T.find(t => t.instKey === p) || {}).short || p;
            if (top >= bot) s += '<rect x="' + (x - KB.colW / 2) + '" y="' + keyY(top) + '" width="' + KB.colW + '" height="' + (keyY(bot) + h - keyY(top)) + '" rx="1.5" fill="' + col + '" fill-opacity="0.75"><title>' + esc(short) + ' — ordinary range ' + nn(r[0]) + '–' + nn(r[1]) + '</title></rect>';
            if (r[1] > R.hi) s += '<text x="' + x + '" y="' + (KB.top - 4) + '" font-size="7" fill="' + col + '" text-anchor="middle">▲</text>';
            if (r[0] < R.lo) s += '<text x="' + x + '" y="' + (H - 2) + '" font-size="7" fill="' + col + '" text-anchor="middle">▼</text>';
        });
        const legend = this.el.querySelector('#bpKbLegend'); if (legend) legend.innerHTML = 'ranges ' + P.map(p => '<span style="color:' + (INST_COL[p] || '#888') + '" title="' + esc(p + ' ' + (BC.ordinaryRange(INST(), p) || []).map(nn).join('–')) + '">' + esc((T.find(t => t.instKey === p) || {}).short || p) + '</span>').join(' ');
        // the keys: lit where the active pair holds the note as written, half where the pair would fold it, dim where no octave serves both
        for (let m = R.hi; m >= R.lo; m--) {
            const y = keyY(m), black = BLACK.includes(m % 12), f = row ? this.rowFold(row, m) : { k: 0 };
            const op = !f ? 0.22 : f.k ? 0.55 : 1;
            s += '<rect class="bpKey" data-m="' + m + '" x="' + KB.keyX + '" y="' + (y + 0.5) + '" width="' + (black ? KB.blackW : KB.whiteW) + '" height="' + (h - 1) + '" fill="' + (black ? '#2a2a30' : '#d8d3c8') + '" fill-opacity="' + op + '" stroke="#111" stroke-width="0.5" style="cursor:crosshair"><title>' + nn(m) + (!f ? ' — no octave where the active pair both reach it' : f.k ? ' — the active pair would fold it to ' + nn(f.pitch) + BC.foldMark(f.k) : '') + '</title></rect>';
            if (m % 12 === 0) s += '<text x="' + KB.cX + '" y="' + (y + h * 0.85) + '" font-size="10" fill="#777">C' + (m / 12 - 1) + '</text>';
        }
        // the rows' pair notes AS SOUNDED: rings (the lower note filled, the upper hollow) in the row colour, at the right
        this.rows.forEach((r, i) => {
            const iv = BC.INTERVALS[r.b.interval] || BC.INTERVALS.unison, col = ROW_COLORS[i % ROW_COLORS.length];
            const lo = r.b.pitch, up = r.b.pitch + iv.semitones;
            [[lo, true], [up, iv.semitones > 0]].forEach(([m, show]) => { if (!show || m < R.lo || m > R.hi) return; const cy = keyY(m) + h / 2; s += '<circle cx="' + (KB.ringX + i * 7) + '" cy="' + cy + '" r="4" fill="' + (m === lo ? col : 'none') + '" stroke="' + col + '" stroke-width="1.5"' + (r.b.skip ? ' opacity="0.35"' : '') + '><title>pair ' + (i + 1) + ': ' + nn(m) + (m === lo ? ' (lower)' : ' (upper)') + (r.b.skip ? ' — skipped' : '') + '</title></circle>'; });
        });
        // the sonority's notes: dots with their names (data-i = the note's index in the sonority — a pair remembers it, Q3), draggable onto a row
        const byPitch = {}; this.chord.forEach((n, idx) => { (byPitch[n.midi] = byPitch[n.midi] || []).push(idx); });
        Object.keys(byPitch).forEach(p => {
            const m = +p; if (m < R.lo || m > R.hi) return;
            const pc = ((m % 12) + 12) % 12, col = this.pcColor(pc), cy = keyY(m) + h / 2, k = byPitch[p].length, idx = byPitch[p][0];
            const held = this.rows.some(r => r.b.noteIndex != null && byPitch[p].includes(r.b.noteIndex));
            s += '<circle class="bpDot" data-m="' + m + '" data-i="' + idx + '" cx="' + KB.dotX + '" cy="' + cy + '" r="' + (3.2 + Math.min(2, k - 1)) + '" fill="' + col + '" stroke="' + (this.armed === m || held ? '#fff' : col) + '" stroke-width="' + (this.armed === m ? 2.2 : held ? 1.4 : 1) + '" style="cursor:crosshair"><title>' + nn(m) + (k > 1 ? ' ×' + k : '') + (this.chord[idx].midi0 != null && this.chord[idx].midi0 !== m ? ' (voiced from ' + nn(this.chord[idx].midi0) + ')' : '') + ' — double-click to arm, then a pair\'s node; or drag it onto a pair</title></circle>';
            s += '<text x="' + KB.nameX + '" y="' + (cy + 3) + '" font-size="10" fill="' + col + '" text-anchor="end">' + nn(m) + '</text>';
        });
        const above = this.chord.filter(n => n.midi > R.hi).length, below = this.chord.filter(n => n.midi < R.lo).length;
        if (above) s += '<text x="' + (KB.dotX - 6) + '" y="' + (KB.top - 5) + '" fill="#e88" font-size="11">▲' + above + '</text>';
        if (below) s += '<text x="' + (KB.dotX - 6) + '" y="' + (H - 2) + '" fill="#e88" font-size="11">▼' + below + '</text>';
        if (this.armed != null && this.armed >= R.lo && this.armed <= R.hi) s += '<rect x="' + (KB.keyX - 2) + '" y="' + (keyY(this.armed) - 0.5) + '" width="' + (KB.whiteW + 4) + '" height="' + (h + 1) + '" fill="none" stroke="#fff" stroke-width="1.2" pointer-events="none"/>';
        svg.innerHTML = s;
        svg.querySelectorAll('.bpKey').forEach(k => { k.addEventListener('click', () => this.keyClick(+k.dataset.m)); k.addEventListener('dblclick', ev => { ev.preventDefault(); this.arm(+k.dataset.m, this.indexAt(+k.dataset.m)); }); });
        svg.querySelectorAll('.bpDot').forEach(d => {
            d.addEventListener('click', ev => { ev.stopPropagation(); this.keyClick(+d.dataset.m); });
            d.addEventListener('dblclick', ev => { ev.stopPropagation(); ev.preventDefault(); this.arm(+d.dataset.m, +d.dataset.i); });   // CN-36: "double click a note on the keyboard and then click a node connected to a pair"
            d.addEventListener('mousedown', ev => { ev.preventDefault(); this.startDotDrag(+d.dataset.m, ev); });
        });
    },
    indexAt(m) { const i = this.chord.findIndex(n => n.midi === m); return i >= 0 ? i : null; },
    arm(m, idx) { this.armed = m; this.armedIdx = idx != null ? idx : this.indexAt(m); this.rootMode = false; this.focus = 'chord'; this.render(); this.setStatus(nn(m) + ' armed — click a pair\'s node (or anywhere on its row) to give it the note; the pair folds it as one unit to the nearest octave both reach; ESC disarms'); },
    keyClick(m) {
        if (this.rootMode) { const rb = this.el.querySelector('#bpRoot'); if (rb) rb.value = nn(m); this.rootMode = false; this.deal(m); return; }
        this.armed = this.armed === m ? null : m; this.armedIdx = this.armed != null ? this.indexAt(m) : null; this.focus = 'chord';
        this.render();
        if (this.armed != null) { const r = this.rows[this.activeRow], f = r ? this.rowFold(r, m) : null; this.setStatus(nn(m) + ' armed — click a pair\'s node to give it the note, ESC or click it again to disarm' + (r ? (f ? (f.k ? ' · the active pair would fold it to ' + nn(f.pitch) + BC_().foldMark(f.k) : ' · the active pair holds it as written') : ' · no octave where the active pair both reach it — the row will offer the ways out') : '')); }
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
        const onUp = ev => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); rows.forEach((r, i) => r.removeEventListener('mouseover', overs[i])); ghost.remove(); rows.forEach(r => { r.style.outline = ''; }); if (moved && over) this.assign(+over.dataset.row, m, this.indexAt(m)); else if (!moved) this.keyClick(m); };
        window.addEventListener('mousemove', onMove); window.addEventListener('mouseup', onUp);
    },
    // the note becomes the pair's note — its index in the sonority remembered (Q3) — and the pair folds it as one unit (§180); never
    // refused: when no octave serves both, the row shows the ladder
    assign(i, m, idx) {
        const row = this.rows[i]; if (!row) return;
        const useIdx = idx != null ? idx : (this.armed === m && this.armedIdx != null ? this.armedIdx : this.indexAt(m));
        this.armed = null; this.armedIdx = null; this.activeRow = i;
        row.b.noteIndex = (useIdx != null && this.chord[useIdx] && this.chord[useIdx].midi === m) ? useIdx : null;
        row.b.srcPitch = m; row.b.skip = false;
        this.refold(row); this.render(); this.sayFold(row, i);
    },
    sayFold(row, i) {
        const BC = BC_(), T = TRK(), b = row.b, RP = this.rowPitches(row), iv = BC.INTERVALS[b.interval] || BC.INTERVALS.unison;
        const me = T[row.layer] ? T[row.layer].short : '?', pt = b.partnerLayer != null && T[b.partnerLayer] ? T[b.partnerLayer].short : '?';
        if (b.partnerLayer == null) { this.setStatus('pair ' + (i + 1) + ' on ' + nn(RP.src) + ' — no partner yet: pick one in the row (every player is listed, with what it would sound)', true); return; }
        if (!this.rowFold(row, RP.src)) { this.setStatus('pair ' + (i + 1) + ': no octave where ' + me + ' and ' + pt + ' both reach ' + nn(RP.src) + ' at ' + iv.label + ' — the row offers the ways out (an interval, another player, skip); nothing applied', true); return; }
        this.setStatus('pair ' + (i + 1) + ' on ' + nn(RP.src) + (RP.k ? ' → ' + nn(b.pitch) + RP.mark + ' (' + Math.abs(RP.k) + ' octave' + (Math.abs(RP.k) > 1 ? 's' : '') + (RP.k > 0 ? ' up' : ' down') + ', both players)' : ' as written') + ' · ' + (RP.me ? me + ' ' + nn(RP.me.pitch) : '') + (RP.partner ? ' · ' + pt + ' ' + nn(RP.partner.pitch) : '') + (iv.semitones ? ' (' + iv.label + ')' : ''));
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
            const f = this.rowFold(row, target);   // the pair's fold (§180): the nearest octave both reach, a tie down
            if (!f) { skipped.push('pair ' + (i + 1)); return; }
            row.b.noteIndex = null; row.b.srcPitch = target; row.b.skip = false; this.refold(row);
            placed.push('pair ' + (i + 1) + ' ' + nn(f.pitch) + BC_().foldMark(f.k));
        });
        this.rootMode = false; this.render();
        this.setStatus('dealt ' + (RELATIONS.find(r => r[0] === rel) || [])[1] + ' from ' + nn(root) + ': ' + placed.join(' · ') + (skipped.length ? ' · out of reach: ' + skipped.join(', ') : ''), !!skipped.length);
    },

    // ------------------------------------------------------------------ the audition: all pairs, timestamped, through the tick's event path
    async play() { return this.playRows(this.rows, 'the sequence', false); },
    async playRow(i) { const row = this.rows[i]; if (row) return this.playRows([row], 'pair ' + (i + 1), true); },
    // the rows given, at their offsets (a pair alone from its own start), timestamped through the tick's event path
    async playRows(list, label, alone) {
        const C = C_(); if (!C || !list.length) return;
        this.stop();
        const events = [], slots = new Map();
        let firstPort = null, firstCh = 1;
        const firstStart = Math.min.apply(null, list.filter(r => r.zone).map(r => r.zone.startTime).concat([Infinity]));
        for (const row of list) {
            const z = row.zone || { id: 'bp-row-' + this.rows.indexOf(row), type: 'zone', layer: row.layer, startTime: 0, endTime: row.length, beating: row.b };
            const s = C.regenerateBeating(z); if (!s) continue;
            if (row.zone) C.renderZone(row.zone);
            if (!firstPort) { firstPort = s.port; firstCh = s.channel; }
            const off = alone ? 0 : (row.zone ? (isFinite(firstStart) ? (row.zone.startTime - firstStart) * 1000 : 0) : (row.offset || 0) * 1000);   // a bound group plays at its own offsets
            s.events.forEach(e => events.push(Object.assign({}, e, { onsetMs: e.onsetMs + off, port: e.port || s.port, channel: e.channel || s.channel })));
            s.slots.forEach(q => slots.set(q.port + '|' + q.channel, q));
        }
        if (!events.length) { this.setStatus('nothing to play' + (list.some(r => r.b.skip) ? ' — the pair is skipped' : ''), true); return; }
        events.sort((a, c) => a.onsetMs - c.onsetMs);
        const fake = { id: 'bp-pattern', midiSnippet: { port: firstPort, channel: firstCh, events, slots: [...slots.values()], source: 'beating' } };
        await C.playBeatingEvents(fake, events, null, null);
        this._aud = C._beatingAud;
        const btn = this.el.querySelector('#bpPlay'); if (btn) btn.textContent = '■ playing ' + label;
        const last = events.reduce((m, e) => Math.max(m, e.onsetMs + (e.durations ? e.durations[0] : 0)), 0);
        clearTimeout(this._audTimer); this._audTimer = setTimeout(() => { this._aud = null; if (btn) btn.innerHTML = '&#9654; sequence'; }, last + C.BEATING_CENTRE_MS + 100);
        this.setStatus('playing ' + label + ' · ' + list.length + ' pair' + (list.length > 1 ? 's' : '') + ' · ' + events.length + ' events · SPACE stops');
    },
    stop() { const C = C_(); if (C) C.stopBeatingAudition(); this._aud = null; clearTimeout(this._audTimer); const btn = this.el && this.el.querySelector('#bpPlay'); if (btn) btn.innerHTML = '&#9654; sequence'; },

    // ------------------------------------------------------------------ the sequence strip (2026-09-07): a track per pair, the pair a zone
    // drawn with its heard-beating curve — the body dragged moves it in time, the right edge stretches it (the pair's own length, its
    // shapes kept), the left edge starts it later keeping its end; a bound zone moves in the score too. The rows follow live.
    drawSeq() {
        const svg = this.el && this.el.querySelector('#bpSeq'), wrap = this.el && this.el.querySelector('#bpSeqWrap'); if (!svg || !wrap) return;
        const rows = this.rows; if (!rows.length) { wrap.style.display = 'none'; return; } wrap.style.display = '';
        const BC = BC_(), ns = 'http://www.w3.org/2000/svg', mk = (t, a) => { const e = document.createElementNS(ns, t); for (const k in a) e.setAttribute(k, a[k]); return e; };
        const W2 = Math.max(400, (wrap.clientWidth || W) - 2), seq = this.seqLength(), L = Math.max(1, seq * 1.15), H = 16 + rows.length * SEQ_H + 4;
        const x0 = PADL, x1 = W2 - PADR, X = t => x0 + (t / L) * (x1 - x0), secPerPx = L / (x1 - x0);
        svg.setAttribute('width', W2); svg.setAttribute('height', H); svg.style.width = W2 + 'px'; svg.style.height = H + 'px'; svg.innerHTML = '';
        const step = L > 40 ? 10 : L > 16 ? 5 : 1;
        for (let t = 0; t <= L + 1e-6; t += step) { svg.appendChild(mk('line', { x1: X(t), x2: X(t), y1: 12, y2: H, stroke: '#2e2e36' })); const tx = mk('text', { x: X(t) + 2, y: 10, fill: '#777', 'font-size': 10 }); tx.textContent = t + ' s'; svg.appendChild(tx); }
        const lbl = mk('text', { x: 2, y: 10, fill: '#9a9', 'font-size': 10 }); lbl.textContent = 'sequence ' + seq + ' s'; svg.appendChild(lbl);
        rows.forEach((row, i) => {
            const out = row.out || this.rowOut(row), col = ROW_COLORS[i % ROW_COLORS.length], y = 16 + i * SEQ_H, h = SEQ_H - 4, active = i === this.activeRow;
            const xa = X(row.offset || 0), xb = X((row.offset || 0) + row.length);
            svg.appendChild(mk('line', { x1: x0, x2: x1, y1: y + h / 2, y2: y + h / 2, stroke: '#2a2a32' }));
            const body = mk('rect', { x: xa, y, width: Math.max(2, xb - xa), height: h, rx: 3, fill: col, 'fill-opacity': active ? 0.3 : 0.16, stroke: col, 'stroke-width': active ? 1.5 : 1 });
            body.style.cursor = 'move'; body.innerHTML = '<title>pair ' + (i + 1) + ' — drag to move it in time; the edges stretch it</title>'; svg.appendChild(body);
            const mb = out.maxBeat || 1, d = out.samples.map((s, k) => (k ? 'L' : 'M') + (xa + (s.t / Math.max(0.1, row.length)) * (xb - xa)).toFixed(1) + ' ' + (y + h - 2 - (s.beat / mb) * (h - 4)).toFixed(1)).join(' ');
            svg.appendChild(mk('path', { d, fill: 'none', stroke: col, 'stroke-width': 1.2, 'pointer-events': 'none', opacity: row.b.skip ? 0.3 : 0.9 }));
            const t = mk('text', { x: xa + 5, y: y + 11, fill: '#ddd', 'font-size': 10, 'pointer-events': 'none' });
            t.textContent = 'pair ' + (i + 1) + ' · ' + (out.players.lower || '?').slice(0, 5) + ' + ' + (out.players.upper || '?').slice(0, 5) + ' · ' + nn(row.b.pitch) + ' · ' + row.length + ' s' + (row.offset ? ' @ ' + row.offset + ' s' : '') + (row.b.skip ? ' · skipped' : '');
            svg.appendChild(t);
            const edgeL = mk('rect', { x: xa - 3, y, width: 6, height: h, fill: col, 'fill-opacity': 0.02 }); edgeL.style.cursor = 'ew-resize'; edgeL.innerHTML = '<title>start later, the end kept</title>';
            const edgeR = mk('rect', { x: xb - 3, y, width: 6, height: h, fill: col, 'fill-opacity': 0.02 }); edgeR.style.cursor = 'ew-resize'; edgeR.innerHTML = '<title>the pair\'s length — its shapes kept over it</title>';
            svg.appendChild(edgeL); svg.appendChild(edgeR);
            const drag = (mode, e0) => {
                e0.preventDefault(); e0.stopPropagation(); this.activeRow = i; this.setFocus('pair');
                const o0 = row.offset || 0, l0 = row.length, xs = e0.clientX;
                const onMove = ev => {
                    const dt = (ev.clientX - xs) * secPerPx;
                    let off = o0, len = l0;
                    if (mode === 'move') off = Math.max(0, o0 + dt);
                    else if (mode === 'right') len = Math.max(0.5, l0 + dt);
                    else { off = clamp(o0 + dt, 0, o0 + l0 - 0.5); len = o0 + l0 - off; }
                    off = r3(Math.round(off / 0.05) * 0.05); len = r3(Math.max(0.5, Math.round(len / 0.05) * 0.05));
                    if (len !== row.length) { const s = BC.stretch({ length: row.length, slide: row.b.slide, breath: row.b.breath }, len); row.b.slide = s.slide; row.b.breath = s.breath; row.length = len; }
                    row.offset = off; this.placeZone(row); this.rowOut(row); this.drawSeq();
                };
                const onUp = () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); this.changed(row, true); this.render(); this.setStatus('pair ' + (i + 1) + ' @ ' + (row.offset || 0) + ' s · ' + row.length + ' s' + (row.zone ? ' — the zone moved in the score' : '')); };
                window.addEventListener('mousemove', onMove); window.addEventListener('mouseup', onUp);
            };
            body.addEventListener('mousedown', e => drag('move', e)); edgeR.addEventListener('mousedown', e => drag('right', e)); edgeL.addEventListener('mousedown', e => drag('left', e));
        });
    },

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
        const rowsSpec = this.rows.map(r => ({ layer: r.layer, b: JSON.parse(JSON.stringify(r.b)), offset: r.zone && isFinite(groupStart) ? r3(r.zone.startTime - groupStart) : (r.offset || 0), length: r.zone ? r3(r.zone.endTime - r.zone.startTime) : r.length }));
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
        const pat = BC.renderPattern({ length: this.seqLength(), pairs: rowsSpec.map(rs => Object.assign({}, C.beatingSpec({ layer: rs.layer, startTime: 0, endTime: rs.length, beating: rs.b }), { length: rs.length })), offsets: rowsSpec.map(rs => rs.offset) }, INST());
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
    state() { return { length: this.seqLength(), harmony: this.harmony ? { bank: this.harmony.bank, id: this.harmony.id } : null, voicing: JSON.parse(JSON.stringify(this.voicing)), rows: this.rows.map(r => ({ layer: r.layer, offset: r.offset, length: r.length, locked: r.locked, scale: r.scale, b: JSON.parse(JSON.stringify(r.b)) })) }; },
    applyState(st) {
        if (!st || !Array.isArray(st.rows)) return;
        this.voicing = Object.assign(VOICING_DEFAULTS(), st.voicing || {});   // the voicing saves with the take (2026-09-07); the rows' note indices survive where the voiced note matches
        if (st.harmony && st.harmony.bank && st.harmony.id) this.loadDb().then(() => this.pickHarmony(st.harmony.bank, st.harmony.id));   // the harmony chosen saves with the take (CN-36)
        const seqLen = r3(+st.length || 6);
        if (this.bound) {   // a bound zone takes the FIRST row's block; its length stretches the zone
            const r0 = st.rows[0]; if (!r0) return;
            Object.assign(this.bound.beating, r0.b, { partnerLayer: r0.b.partnerLayer });
            const len = r3(+r0.length || seqLen);
            this.bound.endTime = r3(this.bound.startTime + len);
            this.rows = [this.mkRow(this.bound.layer, this.bound.beating, 0, this.bound, len)]; this.rows[0].locked = r0.locked !== false; this.rows[0].scale = r0.scale || 6;
            this.changed(this.rows[0], true);
        } else {
            this.rows = st.rows.slice(0, MAX_ROWS).map(r => { const row = this.mkRow(r.layer, JSON.parse(JSON.stringify(r.b)), r.offset || 0, null, r.length || seqLen); row.locked = r.locked !== false; row.scale = r.scale || 6; return row; });
        }
        this.render();
    },
    // ---- the pair takes (2026-09-07, "a save for individual pairs settings"): one row's settings under a name, the beatingPairs bucket ----
    pairState(row) { return { layer: row.layer, length: row.length, locked: row.locked, scale: row.scale, b: JSON.parse(JSON.stringify(row.b)) }; },
    async savePair(i, name) {
        const row = this.rows[i]; if (!row) return;
        const d = new Date(), pad = x => String(x).padStart(2, '0');
        name = (name || '').trim() || ('pair ' + d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) + ' ' + pad(d.getHours()) + pad(d.getMinutes()));
        if (!TAKE_NAME.test(name)) { this.setStatus('pair take not saved: a name is 1–64 letters, digits, dot, underscore, space or hyphen', true); return; }
        const T = TRK(), b = row.b;
        try { const r = await this.postTake({ name, comment: (T[row.layer] || {}).short + '+' + (T[b.partnerLayer] || {}).short + ' ' + nn(b.pitch) + ' ' + b.interval + ' · ' + (b.shape || 'drawn') + ' to ' + (+b.rateTo || 0) + '/s · ' + row.length + ' s', state: this.pairState(row) }, PAIRS_PANEL); await this.refreshTakes(); this.render(); this.setStatus('pair take saved: ' + name + (r.existed ? ' (replaced)' : '')); }
        catch (e) { this.setStatus('pair take not saved: ' + e.message, true); }
    },
    // into a row: the curves, the level, the breaths, the interval, the length, the lock and the axis; the row's players and its note stay
    loadPair(i, name) {
        const t = this.pairTakes[name], row = this.rows[i]; if (!t || !row || !t.state || !t.state.b) { this.setStatus('no pair take named "' + name + '"', true); return; }
        const nb = JSON.parse(JSON.stringify(t.state.b)), keep = ['partnerLayer', 'pitch', 'srcPitch', 'noteIndex', 'fold', 'launchedFrom'];
        keep.forEach(k => { delete nb[k]; });
        Object.assign(row.b, nb); row.locked = t.state.locked !== false; row.scale = t.state.scale || row.scale;
        this.setRowLength(row, +t.state.length || row.length);
        this.refold(row); this.render();
        this.setStatus('pair take "' + name + '" loaded into pair ' + (i + 1) + ': its curves, level, breaths, interval and length — the players and the note kept');
    },
    async refreshTakes() {
        try { const file = await fetch('/api/snapshots', { cache: 'no-store' }).then(x => x.json()); this.takeList = (file && file.panels && file.panels[TAKES_PANEL]) || {}; this.pairTakes = (file && file.panels && file.panels[PAIRS_PANEL]) || {}; }
        catch (e) { this.takeList = {}; this.pairTakes = {}; }
        this.fillTakes();
    },
    takeNames() { const t = this.takeList; return Object.keys(t).sort((a, b) => String(t[b].saved || '').localeCompare(String(t[a].saved || ''))); },
    fillTakes() { const sel = this.el && this.el.querySelector('#bpTakeSel'); if (!sel) return; sel.innerHTML = '<option value="">load take…</option>' + this.takeNames().map(n => '<option value="' + esc(n) + '">' + esc(n) + '</option>').join(''); },
    async postTake(body, panel) { const r = await fetch('/api/snapshots', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(Object.assign({ panel: panel || TAKES_PANEL }, body)) }).then(x => x.json()); if (!r.success) throw new Error(r.error || '?'); return r; },
    takeComment() { const v = this.voicing; return (this.harmony ? this.harmony.bank + ' ' + this.harmony.id + ' · ' : '') + ((v.preset !== 'original' || v.oct || v.below || v.above) ? v.preset + (v.oct ? ' oct' + (v.oct > 0 ? '+' : '') + v.oct : '') + ((v.below || v.above) ? ' −' + v.below + '…+' + v.above : '') + ' seed ' + v.seed + ' · ' : '') + this.rows.map(r => (TRK()[r.layer] || {}).short + '+' + (TRK()[r.b.partnerLayer] || {}).short + ' ' + nn(r.b.pitch) + ' ' + r.b.interval + ' ' + r.length + 's' + (r.offset ? '@' + r.offset : '')).join(' · ') + ' · ' + this.seqLength() + ' s'; },
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
