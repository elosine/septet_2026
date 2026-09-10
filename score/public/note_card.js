// note_card.js — THE NOTE CARD (composer 2026-09-09).
//
// His ask, after an afternoon lost to the interface: *"I want to be able to select a note, choose a different instrument, and maybe
// choose a different pitch, and then drag the block so I can edit the duration or location. but none of that is working right now.
// So let's get something expedient in place as soon as possible."*
//
// So this is one card with exactly those four controls and nothing else, opened by selecting a note. It is deliberately its own file
// and its own DOM — it does not touch the properties panel, the drag code or anything else that might already be misbehaving, so it
// cannot be broken by them and they cannot be broken by it.
//
// THE ONE DESIGN DECISION WORTH STATING: **every change is auditioned the instant it is made.** A voice that does not speak is the
// thing that cost him the afternoon, and no amount of correct-looking UI tells him whether a sound came out. The card plays the note
// on every edit and prints the MIDI channel it went out on, so silence is diagnosable in one glance instead of an hour — the piano's
// four voices are four different channels (main 1 · plucked 2 · harmonics 3 · muted 5) reaching two different plugins, and if nothing
// is loaded on that channel in the rack the app is behaving correctly and still making no sound.
(function (root) {
    'use strict';
    const NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const nm = m => NAMES[((m % 12) + 12) % 12] + (Math.floor(m / 12) - 1);
    // `Composer` and `Cresc` are top-level `const`s in composer.html — a lexical global, NOT a property of `window`, so `root.Composer`
    // is undefined. Documented in the journal and walked into anyway; named here so the next file does not.
    const C = () => (typeof Composer !== 'undefined' ? Composer : root.Composer);
    const CR = () => (typeof Cresc !== 'undefined' ? Cresc : root.Cresc);

    const CARD = {
        el: null,
        wc: null,
        _timer: null,

        // ---- the audition, which is the point ----------------------------------------------------
        // Straight to the port the note itself would use, so what is heard is what the score will play. No engine, no scheduler: a
        // note-on, CC7 full, and a note-off after its own length (capped, so a long note does not hold the card hostage).
        route(wc) {
            const Cp = C(), inst = Cp.trackInstrument(wc.layer);
            if (!inst) return null;
            const techs = Cp.trackTechniques(wc.layer) || [];
            const tech = techs.find(t => t.key === wc.technique) || techs[0] || null;
            const r = Cp.routeForNote(wc, tech, inst);
            const out = Cp._zoneMidiOutputs[r.port];
            return out ? { out: out, ch: r.ch, tech: tech, port: r.port } : { out: null, ch: r.ch, tech: tech, port: r.port };
        },
        async hear(wc) {
            const Cp = C();
            if (!Cp._zoneMidiInited && Cp.initZoneMidi) await Cp.initZoneMidi();
            const r = this.route(wc);
            this.say(r);
            if (!r || !r.out) return;
            if (this._timer) { clearTimeout(this._timer); this._timer = null; }
            if (this._last) { try { this._last.out.send([0x80 | this._last.ch, this._last.key, 0]); } catch (e) {} }
            try {
                if (r.tech && r.tech.cc0 != null) r.out.send([0xB0 | r.ch, 0, r.tech.cc0]);
                r.out.send([0xB0 | r.ch, 7, 127]);
                r.out.send([0x90 | r.ch, wc.sonifyNote, wc.recVel != null ? wc.recVel : 100]);
            } catch (e) { return; }
            this._last = { out: r.out, ch: r.ch, key: wc.sonifyNote };
            const ms = Math.min(2500, Math.max(250, (wc.endSeconds - wc.startSeconds) * 1000));
            this._timer = setTimeout(() => {
                this._timer = null;
                try { r.out.send([0x80 | r.ch, wc.sonifyNote, 0]); } catch (e) {}
                this._last = null;
            }, ms);
        },
        // the line that makes silence diagnosable: which port, which channel, and whether that port exists at all
        say(r) {
            const s = this.el && this.el.querySelector('#ncWhere');
            if (!s) return;
            if (!r) { s.textContent = 'no instrument on this lane'; s.style.color = '#e06666'; return; }
            const known = !!r.out;
            s.innerHTML = 'out: <b>' + (r.port || '?') + '</b> · MIDI ch <b>' + (r.ch + 1) + '</b>' +
                (known ? '' : ' — <span style="color:#e06666">that port is not open</span>');
            s.style.color = known ? '#8a9' : '#e06666';
        },

        // ---- open / close -------------------------------------------------------------------------
        open(wc, ev) {
            const Cp = C();
            if (!wc || wc.type !== 'waveCurve' || wc.sonifyNote == null) return this.close();
            this.wc = wc;
            if (!this.el) this.build();
            this.el.style.display = '';
            if (ev) {
                this.el.style.left = Math.min(ev.clientX + 14, window.innerWidth - 300) + 'px';
                this.el.style.top = Math.min(ev.clientY + 10, window.innerHeight - 260) + 'px';
            }
            this.paint();
        },
        close() {
            this.wc = null;
            if (this.el) this.el.style.display = 'none';
        },

        build() {
            const d = document.createElement('div');
            d.id = 'noteCard';
            d.style.cssText = 'position:fixed; z-index:9998; left:120px; top:140px; width:264px; background:#1c1c22;' +
                'border:1px solid #5E8C7A; border-radius:7px; padding:8px 9px; box-shadow:0 6px 22px rgba(0,0,0,.55);' +
                'font:12px system-ui,Segoe UI,sans-serif; color:#ddd; display:none';
            d.innerHTML =
                '<div id="ncHead" style="display:flex;justify-content:space-between;align-items:center;cursor:move;margin:-2px 0 6px">' +
                  '<b style="color:#8fb3a5">NOTE</b><span id="ncClose" style="cursor:pointer;color:#888;padding:0 3px">&times;</span></div>' +
                '<div id="ncStack" style="color:#c08a3e;font-size:11px;margin:0 0 5px;display:none"></div>' +
                '<div style="display:flex;align-items:center;gap:6px;margin:3px 0">' +
                  '<span style="color:#9a9;width:52px">voice</span><select id="ncTech" style="flex:1;min-width:0;background:#141419;color:#ddd;border:1px solid #444;padding:2px"></select></div>' +
                '<div style="display:flex;align-items:center;gap:6px;margin:3px 0">' +
                  '<span style="color:#9a9;width:52px">pitch</span>' +
                  '<button id="ncDn" style="width:22px">&minus;</button>' +
                  '<input id="ncPitch" type="number" min="0" max="127" style="width:56px;background:#141419;color:#ddd;border:1px solid #444;padding:2px">' +
                  '<button id="ncUp" style="width:22px">+</button>' +
                  '<b id="ncName" style="color:#8fb3a5;margin-left:2px"></b></div>' +
                // THE DYNAMIC (2026-09-09, his *"also no ability to change dynamic in panel"*). One value underneath, the drawn
                // height 0-10, shown three ways because each is what he wants at a different moment: the ensemble's own ppp…fff
                // scale (Cresc.DYN, so the card cannot drift from the crescendos), the height the tile is drawn at, and the MIDI
                // velocity a captured note actually replays with — a `plain` note is struck at `recVel` and its CC7 stays full.
                '<div style="display:flex;align-items:center;gap:6px;margin:3px 0">' +
                  '<span style="color:#9a9;width:52px">dyn</span>' +
                  '<select id="ncDyn" style="width:58px;background:#141419;color:#ddd;border:1px solid #444;padding:2px"></select>' +
                  '<input id="ncLevel" type="number" step="0.1" min="0" max="10" style="width:52px;background:#141419;color:#ddd;border:1px solid #444;padding:2px">' +
                  '<span style="color:#666">of 10</span>' +
                  '<span id="ncVel" style="color:#8a9;font-size:11px;margin-left:auto"></span></div>' +
                '<div style="display:flex;align-items:center;gap:6px;margin:3px 0">' +
                  '<span style="color:#9a9;width:52px">start</span>' +
                  '<input id="ncStart" type="number" step="0.01" style="width:74px;background:#141419;color:#ddd;border:1px solid #444;padding:2px">' +
                  '<span style="color:#9a9">len</span>' +
                  '<input id="ncLen" type="number" step="0.01" min="0.02" style="width:64px;background:#141419;color:#ddd;border:1px solid #444;padding:2px">' +
                  '<span style="color:#666">s</span></div>' +
                '<div style="display:flex;align-items:center;gap:8px;margin:7px 0 3px">' +
                  '<button id="ncPlay" style="padding:2px 10px">&#9654; hear</button>' +
                  '<button id="ncDup" style="padding:2px 10px" title="copy this note one length later (CTRL+drag the note does the same)">duplicate</button>' +
                  '<span id="ncWhere" style="font-size:11px;color:#8a9"></span></div>' +
                '<div style="color:#666;font-size:10px;margin-top:5px;line-height:1.35">' +
                  '&uarr;&darr; in the pitch box moves by a semitone &middot; every change is heard at once<br>' +
                  'notes stacked here: click the same spot again to cycle down &middot; CTRL+drag a note copies it</div>';
            document.body.appendChild(d);
            this.el = d;

            d.querySelector('#ncClose').addEventListener('click', () => this.close());
            // drag by the header
            const head = d.querySelector('#ncHead');
            head.addEventListener('mousedown', (e) => {
                if (e.target.id === 'ncClose') return;
                const r = d.getBoundingClientRect(), ox = e.clientX - r.left, oy = e.clientY - r.top;
                const mv = (ev) => { d.style.left = (ev.clientX - ox) + 'px'; d.style.top = (ev.clientY - oy) + 'px'; };
                const up = () => { window.removeEventListener('mousemove', mv); window.removeEventListener('mouseup', up); };
                window.addEventListener('mousemove', mv); window.addEventListener('mouseup', up);
                e.preventDefault();
            });

            const commit = (fn) => {
                if (!this.wc) return;
                fn(this.wc);
                const Cp = C();
                Cp._curveCh = null;                 // the channel map is cached; a voice change must re-derive it
                Cp.renderWaveCurve(this.wc);
                Cp.markDirty();
                if (Cp.scheduleConflictRefresh) Cp.scheduleConflictRefresh();
                this.paint();
                this.hear(this.wc);
            };

            d.querySelector('#ncTech').addEventListener('change', (e) => commit(wc => { wc.technique = e.target.value; }));
            const setPitch = v => commit(wc => { wc.sonifyNote = Math.max(0, Math.min(127, Math.round(v))); });
            d.querySelector('#ncPitch').addEventListener('change', (e) => setPitch(+e.target.value));
            d.querySelector('#ncPitch').addEventListener('keydown', (e) => {
                if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                    e.preventDefault(); e.stopPropagation();
                    setPitch((this.wc ? this.wc.sonifyNote : 60) + (e.key === 'ArrowUp' ? 1 : -1));
                }
            });
            d.querySelector('#ncUp').addEventListener('click', () => setPitch((this.wc ? this.wc.sonifyNote : 60) + 1));
            d.querySelector('#ncDn').addEventListener('click', () => setPitch((this.wc ? this.wc.sonifyNote : 60) - 1));
            // one setter for all three faces of the dynamic: the tile's drawn height IS the value, and a captured note's replay
            // velocity is kept in step with it so what is seen and what is heard cannot disagree
            const setLevel = (l) => commit(wc => {
                const v = Math.max(0, Math.min(10, Math.round(l * 10) / 10));
                (wc.nodes || []).forEach(nd => { nd.y = v; });
                if (wc.sonifyMode === 'plain' || wc.recVel != null) wc.recVel = Math.max(1, Math.min(127, Math.round(v / 10 * 127)));
            });
            d.querySelector('#ncDyn').addEventListener('change', (e) => {
                const h = CR() && CR().dynHeight ? CR().dynHeight(e.target.value) : null;
                if (h != null) setLevel(h);
            });
            d.querySelector('#ncLevel').addEventListener('change', (e) => setLevel(+e.target.value));
            d.querySelector('#ncStart').addEventListener('change', (e) => commit(wc => {
                const len = wc.endSeconds - wc.startSeconds;
                wc.startSeconds = Math.max(0, +e.target.value || 0);
                wc.endSeconds = wc.startSeconds + len;
            }));
            d.querySelector('#ncLen').addEventListener('change', (e) => commit(wc => {
                wc.endSeconds = wc.startSeconds + Math.max(0.02, +e.target.value || 0.02);
            }));
            d.querySelector('#ncPlay').addEventListener('click', () => this.wc && this.hear(this.wc));
            // DUPLICATE (2026-09-10). One click: a copy one length later, selected, and the card follows it — so a run of
            // repeated notes is click, click, click without ever leaving the card. The score's CTRL+drag is the same call.
            d.querySelector('#ncDup').addEventListener('click', () => {
                if (!this.wc) return;
                const copy = C().duplicateNote(this.wc);   // selectObject reopens this card on the copy
                if (copy) this.hear(copy);
            });
            // typing in the card must never reach the score's keyboard shortcuts
            d.addEventListener('keydown', (e) => e.stopPropagation());
        },

        paint() {
            const wc = this.wc, Cp = C();
            if (!wc || !this.el) return;
            const techs = Cp.trackTechniques(wc.layer) || [];
            const sel = this.el.querySelector('#ncTech');
            // the CHANNEL is shown against every voice, because that is the fact that explains a silent one
            sel.innerHTML = '';
            techs.forEach(t => {
                const o = document.createElement('option');
                o.value = t.key;
                o.textContent = (t.label || t.key) + '  [ch ' + (t.channel || 1) + ']';
                if (t.key === wc.technique) o.selected = true;
                sel.appendChild(o);
            });
            if (!techs.some(t => t.key === wc.technique) && techs.length) sel.value = techs[0].key;
            // the dynamic, read back off the tile itself
            const ys = (wc.nodes || []).map(x => +x.y).filter(y => !isNaN(y));
            const lvl = ys.length ? Math.max.apply(null, ys) : 5;
            const dsel = this.el.querySelector('#ncDyn');
            const scale = (CR() && CR().DYN) || ['ppp', 'pp', 'p', 'mp', 'mf', 'f', 'ff', 'fff'];
            if (dsel.options.length !== scale.length) {
                dsel.innerHTML = '';
                scale.forEach(nme => { const o = document.createElement('option'); o.value = nme; o.textContent = nme; dsel.appendChild(o); });
            }
            dsel.value = CR() && CR().dynName ? CR().dynName(lvl) : scale[Math.round(lvl / 10 * 7)];
            this.el.querySelector('#ncLevel').value = Math.round(lvl * 10) / 10;
            this.el.querySelector('#ncVel').textContent =
                wc.sonifyMode === 'plain' ? 'vel ' + (wc.recVel != null ? wc.recVel : 100) : 'drawn';
            this.el.querySelector('#ncPitch').value = wc.sonifyNote;
            this.el.querySelector('#ncName').textContent = nm(wc.sonifyNote);
            this.el.querySelector('#ncStart').value = Math.round(wc.startSeconds * 100) / 100;
            this.el.querySelector('#ncLen').value = Math.round((wc.endSeconds - wc.startSeconds) * 100) / 100;
            // how many notes are stacked under this one, so he knows there is something to cycle to
            const stack = Cp.stackAt ? Cp.stackAt(wc.startSeconds + (wc.endSeconds - wc.startSeconds) / 2, wc.layer) : [];
            const s = this.el.querySelector('#ncStack');
            if (stack.length > 1) {
                const i = stack.findIndex(o => o.id === wc.id);
                s.style.display = '';
                s.textContent = (i + 1) + ' of ' + stack.length + ' stacked here — click the same spot again for the next';
            } else s.style.display = 'none';
            this.say(this.route(wc));
        },
    };

    root.NoteCard = CARD;
})(typeof window !== 'undefined' ? window : this);
