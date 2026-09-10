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
                srcKind: 'strike', sonifyNote: p, technique: 'main', sonifyMode: 'plain', recVel: vel
            };
            Cp.objects.push(wc);
            Cp.renderWaveCurve(wc);
            rows.push({ at: t, note: nm(p), from: nm(c.sonifyNote) + ' lane ' + c.layer });
        });
        Cp.markDirty();
        if (Cp.scheduleConflictRefresh) Cp.scheduleConflictRefresh();
        console.log(rows.length + ' piano strikes on lane ' + lane + '  ·  ' + dyn + ' (level ' + lvl + ', velocity ' + vel + ')  ·  ' + Math.round(lenS * 1000) + ' ms');
        if (console.table) console.table(rows);
        return rows.length;
    }

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
