(function () {
  const TAG = 'grp-cresc-strike';
  function run(opts) {
    const o = opts || {};
    const dyn = o.dyn || 'ff', lenS = (o.ms != null ? o.ms : 85) / 1000;
    const lo = o.lo != null ? o.lo : 72, hi = o.hi != null ? o.hi : 95;   // the 5-6 octave band: C5(72) .. B6(95)
    const lane = Composer.cueLane();
    const lvl = (typeof Cresc !== 'undefined' && Cresc.dynHeight) ? Cresc.dynHeight(dyn) : 8.6;
    const vel = Math.max(1, Math.min(127, Math.round(lvl / 10 * 127)));
    const fold = p => { p = +p; while (p < lo) p += 12; while (p > hi) p -= 12; return p; };
    const NAMES = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
    const nm = m => NAMES[((m % 12) + 12) % 12] + (Math.floor(m / 12) - 1);
    const cres = Composer.objects.filter(x => x.properties && x.properties.cresc && x.sonifyNote != null);
    if (!cres.length) { console.log('no crescendos with a pitch in this score'); return; }
    Composer.pushUndoState();
    const seen = new Set(); let n = 0; const rows = [];
    cres.forEach(c => {
      const t = Math.round(c.endSeconds * 1000) / 1000, p = fold(c.sonifyNote);
      const k = t + ':' + p; if (seen.has(k)) return; seen.add(k);
      const wc = {
        id: Composer.generateId('wc'), type: 'waveCurve', layer: lane, groupId: TAG,
        startSeconds: t, endSeconds: t + lenS,
        nodes: [{ pos: 0, y: lvl, smooth: 0.25 }, { pos: 1, y: lvl, smooth: 0.25 }],
        segments: [{ model: 'power', slope: 0 }],
        color: '#C9A05A', fillMode: 'bottom', opacity: 0.55,
        performanceNotes: 'strike at the end of ' + c.id, properties: {},
        srcKind: 'strike', sonifyNote: p, technique: 'main', sonifyMode: 'plain', recVel: vel
      };
      Composer.objects.push(wc); Composer.renderWaveCurve(wc); n++;
      rows.push({ at: t, note: nm(p), from: nm(c.sonifyNote) + ' lane ' + c.layer });
    });
    Composer.markDirty();
    if (Composer.scheduleConflictRefresh) Composer.scheduleConflictRefresh();
    console.log(n + ' piano strikes  ·  ' + dyn + ' (level ' + lvl + ', vel ' + vel + ')  ·  ' + (lenS * 1000) + ' ms  ·  lane ' + lane);
    console.table(rows);
  }
  run.clear = function () {
    const gone = Composer.objects.filter(x => x.groupId === TAG);
    if (!gone.length) { console.log('none to clear'); return; }
    Composer.pushUndoState();
    gone.forEach(x => { const el = Composer.elementCache.get(x.id); if (el) el.remove(); Composer.elementCache.delete(x.id); });
    Composer.objects = Composer.objects.filter(x => x.groupId !== TAG);
    Composer.deselectAll(); Composer.markDirty();
    if (Composer.scheduleConflictRefresh) Composer.scheduleConflictRefresh();
    console.log('cleared ' + gone.length);
  };
  window.crescStrikes = run;
  console.log('crescStrikes() ready  ·  crescStrikes.clear() removes them  ·  crescStrikes({dyn:"fff", ms:120}) to vary');
})();
