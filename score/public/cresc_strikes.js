// cresc_strikes.js — A PIANO STRIKE AT THE END OF EVERY CRESCENDO (composer 2026-09-10, RUNNING_LOG §356/§358).
//
// His ask: *"I'd like a piano strike at the end of each of those Crescendos using the Crescendos pitch, but in the the five six
// octave ... make that two f's and eighty five milliseconds. Whatever the quickest way to this is, probably console score."*
//
// It was first given to him as a console paste and it did not reach him — *"the console script not working; pls try to give me
// non-buggy code, I'm trying to advance the composition work and avoid troubleshooting."* The logic was verified correct in the
// running app (23 notes, field-for-field identical to a real strike), so the fault was never in the code: a long one-liner pasted
// into DevTools is blocked by Chrome until the words `allow pasting` are typed, and nothing says so unless you look for it.
// THE LESSON, and it is §355's again: an answer that needs him to paste is an answer with a failure mode he has to debug. A file
// loaded by the page has none. So this is a file.
(function (root) {
    'use strict';
    const TAG = 'grp-cresc-strike';
    const NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const nm = m => NAMES[((m % 12) + 12) % 12] + (Math.floor(m / 12) - 1);
    // `Composer` and `Cresc` are top-level `const`s in composer.html — a lexical global, NOT properties of `window` (note_card.js
    // says the same; it is walked into once per file otherwise).
    const C = () => (typeof Composer !== 'undefined' ? Composer : root.Composer);
    const CR = () => (typeof Cresc !== 'undefined' ? Cresc : root.Cresc);

    function run(opts) {
        const o = opts || {}, Cp = C();
        if (!Cp) { console.log('the score is not loaded yet'); return; }
        const dyn = o.dyn || 'ff';
        const lenS = (o.ms != null ? o.ms : 85) / 1000;
        const lo = o.lo != null ? o.lo : 72, hi = o.hi != null ? o.hi : 95;   // the 5–6 octave band: C5 … B6
        const lane = o.lane != null ? o.lane : Cp.cueLane();
        const tech = o.tech || 'main';
        const lvl = (CR() && CR().dynHeight && CR().dynHeight(dyn) != null) ? CR().dynHeight(dyn) : 8.6;
        const vel = Math.max(1, Math.min(127, Math.round(lvl / 10 * 127)));
        const fold = p => { p = +p; while (p < lo) p += 12; while (p > hi) p -= 12; return p; };

        const cres = Cp.objects.filter(x => x.properties && x.properties.cresc && x.sonifyNote != null);
        if (!cres.length) { console.log('no crescendos with a pitch in this score — is the right one loaded?'); return; }
        const already = Cp.objects.filter(x => x.groupId === TAG).length;
        if (already) { console.log(already + ' strikes are already here — crescStrikes.clear() first, or they will double'); return; }

        Cp.pushUndoState();
        const seen = new Set(), rows = [];
        cres.forEach(c => {
            const t = Math.round(c.endSeconds * 1000) / 1000, p = fold(c.sonifyNote), k = t + ':' + p;
            if (seen.has(k)) return;                    // two crescendos ending together on the same pitch make ONE strike
            seen.add(k);
            const wc = {
                id: Cp.generateId('wc'), type: 'waveCurve', layer: lane, groupId: TAG,
                startSeconds: t, endSeconds: t + lenS,
                nodes: [{ pos: 0, y: lvl, smooth: 0.25 }, { pos: 1, y: lvl, smooth: 0.25 }],
                segments: [{ model: 'power', slope: 0 }],
                color: '#C9A05A', fillMode: 'bottom', opacity: 0.55,
                performanceNotes: 'strike at the end of ' + c.id, properties: {},
                srcKind: 'strike', sonifyNote: p, technique: tech, sonifyMode: 'plain', recVel: vel
            };
            Cp.objects.push(wc);
            Cp.renderWaveCurve(wc);
            rows.push({ at: t, note: nm(p), from: nm(c.sonifyNote) + ' lane ' + c.layer });
        });
        Cp.markDirty();
        if (Cp.scheduleConflictRefresh) Cp.scheduleConflictRefresh();
        console.log(rows.length + ' piano strikes on lane ' + lane + '  ·  ' + tech + '  ·  ' + dyn + ' (level ' + lvl + ', velocity ' + vel + ')  ·  ' + Math.round(lenS * 1000) + ' ms');
        if (console.table) console.table(rows);
        return rows.length;
    }

    // CHANGE THEM ALL AT ONCE (composer 2026-09-10: *"can I do global changes to the strikes? change all to plucked and lower
    // dynamic to f"*). They all carry the group tag, so this reaches exactly the strikes and nothing else of his in the score.
    // Any subset of `tech` / `dyn` / `ms` — what is not named is left alone.
    //
    // A VOICE CHANGE IS ALSO A CHANNEL CHANGE — piano main is MIDI ch 1, plucked ch 2 (a different library in the same Kontakt
    // instance) — and the channel map is CACHED. `curveDirty()` drops it, exactly as the note card does on its own voice change;
    // without it the new voice would be written to the old voice's channel and the strike would come out of the Steinway still.
    run.set = function (opts) {
        const o = opts || {}, Cp = C();
        const list = Cp.objects.filter(x => x.groupId === TAG);
        if (!list.length) { console.log('no crescendo strikes in this score — crescStrikes() first'); return 0; }

        let lvl = null, vel = null;
        if (o.dyn) {
            lvl = CR() && CR().dynHeight ? CR().dynHeight(o.dyn) : null;
            if (lvl == null) { console.log('unknown dynamic "' + o.dyn + '" — one of ppp pp p mp mf f ff fff'); return 0; }
            vel = Math.max(1, Math.min(127, Math.round(lvl / 10 * 127)));
        }
        if (o.tech) {
            const techs = (Cp.trackTechniques(list[0].layer) || []).map(t => t.key);
            if (techs.indexOf(o.tech) < 0) { console.log('unknown voice "' + o.tech + '" — this lane has: ' + techs.join(' · ')); return 0; }
        }

        Cp.pushUndoState();
        list.forEach(wc => {
            if (o.tech) wc.technique = o.tech;
            if (lvl != null) { (wc.nodes || []).forEach(nd => { nd.y = lvl; }); wc.recVel = vel; }
            if (o.ms != null) wc.endSeconds = wc.startSeconds + Math.max(0.02, o.ms / 1000);
            Cp.renderWaveCurve(wc);
        });
        if (o.tech && Cp.curveDirty) Cp.curveDirty();   // the channel map is cached; a voice change must re-derive it
        Cp.markDirty();
        if (Cp.scheduleConflictRefresh) Cp.scheduleConflictRefresh();
        const said = [];
        if (o.tech) said.push('voice ' + o.tech);
        if (lvl != null) said.push(o.dyn + ' (level ' + lvl + ', velocity ' + vel + ')');
        if (o.ms != null) said.push(Math.round(o.ms) + ' ms');
        console.log(list.length + ' strikes changed  ·  ' + (said.join('  ·  ') || 'nothing named'));
        return list.length;
    };

    // "how do I take out what I just put in" was SWEEP_LIST #3's complaint. Every strike carries the group tag, so this removes
    // exactly its own and nothing of his. CTRL+Z does it too — the whole run is one undo state.
    run.clear = function () {
        const Cp = C(), gone = Cp.objects.filter(x => x.groupId === TAG);
        if (!gone.length) { console.log('none to clear'); return 0; }
        Cp.pushUndoState();
        gone.forEach(x => {
            const el = Cp.elementCache.get(x.id);
            if (el && el.remove) el.remove();
            Cp.elementCache.delete(x.id);
        });
        Cp.objects = Cp.objects.filter(x => x.groupId !== TAG);
        if (Cp.deselectAll) Cp.deselectAll();
        Cp.markDirty();
        if (Cp.scheduleConflictRefresh) Cp.scheduleConflictRefresh();
        console.log('cleared ' + gone.length);
        return gone.length;
    };

    root.crescStrikes = run;
})(window);
