// seams.js — THE STAND'S SEAMS (the design sitting, day 46 — for_seven_tubas
// RUNNING_LOG 111; the rules as data in registry/page_rules.json `stand`).
//
// The composer's principle, "Matisse": a part is one long strip of paper, drawn
// linearly, and CUT at each row's end. Time-bound ink — the GC's arc and ball,
// the beam, the long curves, the ring bar, the brick, the go line — stays where
// time puts it and is cut at the seam, both halves shown (render.js, opts.clamp).
// What this module decides is WHERE the cut falls:
//   · the target, pageSeconds after the row's start — unless
//   · it would fall inside a HEAD UNIT's ink (the head with its accidentals,
//     ledger lines, stem, flag, dot; a chord's heads; a group's rests): a head
//     is never cut and never moved, so the seam moves LEFT to the unit's ink
//     start — the row is shortened by at most the unit's hang; or
//   · it falls inside a BEAM: the beam is cut, with at least one notehead's
//     width of beam on each side of the seam where the group can give it (the
//     seam steps back a note to get it) — and snipped anyway, the heads whole,
//     where the group cannot (the composer's catch for a quick group: "we just
//     decide to snip the beam, as long as the noteheads are clear"); or
//   · it falls inside a CURVE (the surge's, the trill's, the morph's — never the GC
//     arc, which is cut at any length): THE HALF-SECOND RULE (day 49, for_seven_tubas
//     RUNNING_LOG 114 — the composer: "0.5 sec rule good for the curve") — the next
//     row must get at least curveMinSeconds of the curve, so the seam moves LEFT to
//     the curve's end minus that; the curve stays cut, and the row before keeps the
//     head, the go line and whatever curve is left, even a sliver (it hangs off its
//     own go line and reads as "continues"); the whole curve never moves over, for
//     the header's cost ("we are cutting the curve anyways at the end of lines").
//     A curve shorter than the minimum cannot give that: it is not cut at all — the
//     seam moves to its head's ink start and it opens the next row whole.
// A trill's column sits AFTER its go line and is clamped left by the drawing,
// not avoided here (the composer: "it can go to the left … I don't think we
// need to shorten the row"); a section header is static ink, clamped likewise.
// Seams are planned for THE PARTS DRAWN: one part on a stand, every part on
// the display (the composer: "the seams chosen for this part alone").
// Pure, dual-load; the extents come from render.js (one geometry).
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(require('./render.js'), require('./stamps.js'));
  else root.NotationSeams = factory(root.NotationRender, root.NotationStamps);
})(typeof self !== 'undefined' ? self : this, function (Render, Stamps) {

  const EPS = 1e-6;
  const CURVE_KINDS = new Set(['envcurve', 'cresccurve', 'glisscurve']);   // the curves the half-second rule governs (never 'gc')

  // THE INK MAP of the parts drawn, from the layout model: every head unit's
  // ink span in staff spaces relative to its own time, every beam's tips, and every curve's span.
  //   -> { units: [{ t, x0Ss, x1Ss, part, trill?, hdr? }] by t, beams: [{ part, group, tips: [{ t, dxSs }] }], curves: [{ part, a, b, k }] by a }
  function inkMap(model, glyphs, parts) {
    const S = Stamps.makeStamps(glyphs);
    const set = new Set(parts);
    const units = [], beams = [], curves = [];
    for (const sm of model.systems) {
      if (!set.has(sm.part)) continue;
      const byT = new Map();
      const unitAt = t => { let u = byT.get(t); if (!u) { u = { t, x0Ss: Infinity, x1Ss: -Infinity, part: sm.part }; byT.set(t, u); } return u; };
      for (const it of sm.items || []) {
        if (CURVE_KINDS.has(it.k)) { if (it.t1 > it.t0 + EPS) curves.push({ part: sm.part, a: it.t0, b: it.t1, k: it.k, ev: it.ev }); continue; }
        if (it.k === 'beam' && !it.stub) {
          if (/-b\d+$/.test(it.group || '') || !it.tips || it.tips.length < 2) continue;   // a secondary beam shares the primary's tips
          beams.push({ part: sm.part, group: it.group || '', tips: it.tips.map(p => ({ t: p.t, dxSs: p.dxSs || 0 })) });
          continue;
        }
        if (!(it.hdr || Render.isUnitItem(it))) continue;
        const t = it.k === 'beam' ? it.tips[0].t : it.t;
        const e = Render.inkExtentSs(it, S, glyphs, {}, null);
        if (!e || t === undefined) continue;
        const u = unitAt(t);
        u.x0Ss = Math.min(u.x0Ss, e[0]); u.x1Ss = Math.max(u.x1Ss, e[1]);
        if (it.k === 'glyph' && it.g === 'accidental-leftParen') u.trill = true;   // the trill's column: the parenthesised neighbour marks it
        if (it.hdr) u.hdr = true;
      }
      for (const u of byT.values()) if (u.x1Ss > u.x0Ss) units.push(u);
    }
    units.sort((a, b) => a.t - b.t);
    curves.sort((p, q) => p.a - q.a);
    return { units, beams, curves };
  }

  // the spans in seconds: the forbidden units (never cut) and the beam segments
  function spans(ink, secPerSs) {
    const F = ink.units.filter(u => !u.trill && !u.hdr)
      .map(u => ({ a: u.t + u.x0Ss * secPerSs, b: u.t + u.x1Ss * secPerSs, t: u.t, part: u.part }))
      .sort((p, q) => p.a - q.a);
    const SEG = [];
    for (const bm of ink.beams) {
      const xs = bm.tips.map(p => p.t + p.dxSs * secPerSs);
      for (let i = 1; i < xs.length; i++) if (xs[i] > xs[i - 1] + EPS) SEG.push({ p: xs[i - 1], q: xs[i], beam: bm, i });
    }
    SEG.sort((a, b) => a.p - b.p);
    const C = (ink.curves || []).slice().sort((p, q) => p.a - q.a);   // the curves, by start
    return { F, SEG, C };
  }

  // the half-second rule's minimum (day 49): what the next row must get of a cut curve
  function minCurveSeconds(rules) {
    return (rules.stand && rules.stand.curveMinSeconds != null) ? rules.stand.curveMinSeconds : 0.5;
  }

  function minStubSeconds(rules, glyphs, secPerSs) {
    const heads = (rules.stand && rules.stand.beamStubMinHeads != null) ? rules.stand.beamStubMinHeads : 1;
    return heads * glyphs.notehead.filled.wSs * secPerSs;
  }

  // planSeams(ir, rules, pageSeconds, ink, secPerSs, glyphs) -> [{ t0, t1, reason, short, reshow }]
  //   reason: target · head · beam · beam-stub · beam-back · beam-catch · curve · curve-whole · slack · end
  //   short:  how much earlier than the target the seam fell, in seconds
  function planSeams(ir, rules, pageSeconds, ink, secPerSs, glyphs) {
    if (!(isFinite(pageSeconds) && pageSeconds > 0)) throw new Error('seams: pageSeconds must be a finite number > 0');
    const [w0, w1] = ir.source.window;
    const slack = rules.cutSlackSeconds, minPage = rules.minPageSeconds;
    const minStub = minStubSeconds(rules, glyphs, secPerSs);
    const minCurve = minCurveSeconds(rules);
    const { F, SEG, C } = spans(ink, secPerSs);
    const inUnit = s => { for (const u of F) { if (u.a >= s - EPS) break; if (s < u.b - EPS) return u; } return null; };
    const inSeg = s => { for (const g of SEG) { if (g.p >= s - EPS) break; if (s < g.q - EPS) return g; } return null; };
    // the start of the unit that holds a tip (its head's ink), or the tip itself
    const unitStartAt = q => { for (const u of F) { if (u.a > q + EPS) break; if (q <= u.b + EPS) return u.a; } return q; };
    // inside segment g at s: s itself when both stubs are long enough; else the latest point of
    // this segment or an earlier one of the same group that gives both; else the catch
    function beamPoint(g, s) {
      if (s - g.p >= minStub - EPS && g.q - s >= minStub - EPS) return { s, reason: 'beam' };
      const segs = SEG.filter(x => x.beam === g.beam && x.i <= g.i).sort((a, b) => b.i - a.i);
      for (const x of segs) {
        const top = Math.min(x === g ? s : x.q, unitStartAt(x.q), x.q - minStub);
        if (top - x.p >= minStub - EPS) return { s: top, reason: x === g ? 'beam-stub' : 'beam-back' };
      }
      const top = Math.min(s, unitStartAt(g.q));
      return { s: Math.max(g.p + EPS, Math.min(top, (g.p + g.q) / 2)), reason: 'beam-catch' };
    }
    // the ink start of the head unit AT time t (a curve's head sits at its onset), or t itself
    const headStartAt = t => { let s = t; for (const u of F) if (Math.abs(u.t - t) < 1e-6) s = Math.min(s, u.a); return s; };
    // THE HALF-SECOND RULE (day 49): the first curve crossing s that leaves the next row less than
    // the minimum — the seam moves to the curve's end minus the minimum; a curve shorter than the
    // minimum is not cut at all (the seam to its head's ink start)
    function curveFix(s) {
      for (const c of C) {
        if (c.a >= s - EPS) break;
        if (s >= c.b - EPS) continue;
        if (c.b - c.a < minCurve - EPS) return { s: Math.min(s, headStartAt(c.a) - 0.5 * secPerSs), reason: 'curve-whole' };   // half a staff space before the head's ink, so the go line travels with its curve (a go line ON the seam would stay on the row before)
        if (c.b - s < minCurve - EPS) return { s: c.b - minCurve, reason: 'curve' };
      }
      return null;
    }
    function adjust(target, lo) {
      let s = target, reason = 'target', guard = 0;
      while (guard++ < 40) {
        const u = inUnit(s);
        if (u) { s = u.a; reason = 'head'; continue; }
        const g = inSeg(s);
        if (g) {
          const r = beamPoint(g, s);
          if (r.s < s - EPS) { s = r.s; reason = r.reason; continue; }
          reason = r.reason;
        }
        const c = curveFix(s);
        if (c && c.s < s - EPS) { s = c.s; reason = c.reason; continue; }
        break;
      }
      if (s < lo) { s = lo; reason = 'slack'; }
      return { s, reason };
    }
    const pages = [];
    let t = w0, guard = 0;
    while (t < w1 - EPS) {
      if (++guard > 10000) throw new Error('seams: page planning did not converge');
      const target = t + pageSeconds;
      let cut, reason;
      if (target >= w1 - minPage) { cut = w1; reason = 'end'; }
      else {
        const lo = Math.max(t + minPage, target - slack);
        const r = adjust(Math.min(target, w1 - minPage), lo);
        cut = r.s; reason = r.reason;
      }
      if (!(cut > t + EPS)) throw new Error('seams: cut did not advance past ' + t);
      pages.push({ t0: t, t1: cut, kind: reason, reason, short: +(target - cut).toFixed(4), reshow: [] });
      t = cut;
    }
    return pages;
  }

  // audit(pages, ink, secPerSs, rules, glyphs): the invariants, for the checks
  function audit(pages, ink, secPerSs, rules, glyphs) {
    const { F, SEG, C } = spans(ink, secPerSs);
    const minStub = minStubSeconds(rules, glyphs, secPerSs);
    const minCurve = minCurveSeconds(rules);
    const out = { seams: Math.max(0, pages.length - 1), insideUnit: [], shortStub: [], shortCurve: [], shortCurveSlack: [], slackBound: 0, catches: 0, byReason: {}, minStubS: +minStub.toFixed(4), minCurveS: +minCurve.toFixed(4) };
    for (let i = 0; i < pages.length - 1; i++) {
      const pg = pages[i], s = pg.t1;
      out.byReason[pg.reason] = (out.byReason[pg.reason] || 0) + 1;
      const u = F.find(f => f.a < s - EPS && s < f.b - EPS);
      if (u) out.insideUnit.push({ seam: s, unit: [u.a, u.b], row: i });
      const g = SEG.find(x => x.p < s - EPS && s < x.q - EPS);
      if (g) {
        if (pg.reason === 'beam-catch') out.catches++;
        else if (s - g.p < minStub - 1e-4 || g.q - s < minStub - 1e-4) out.shortStub.push({ seam: s, left: +(s - g.p).toFixed(4), right: +(g.q - s).toFixed(4), row: i, reason: pg.reason });
      }
      // the half-second rule: a curve crossing the seam gives the next row at least the minimum — unless the
      // seam is SLACK-BOUND (the display, every part at once: the curves of seven parts can chain past the
      // slack; the planner did what the slack allows, and the shortfall is recorded, not failed)
      if (pg.reason === 'slack') out.slackBound++;
      for (const c of C) if (c.a < s - EPS && s < c.b - EPS && c.b - s < minCurve - 1e-4) (pg.reason === 'slack' ? out.shortCurveSlack : out.shortCurve).push({ seam: +s.toFixed(4), curve: [+c.a.toFixed(3), +c.b.toFixed(3)], next: +(c.b - s).toFixed(4), row: i, kind: c.k, reason: pg.reason });
    }
    return out;
  }

  return { inkMap, planSeams, audit, spans, minStubSeconds, minCurveSeconds };
});
