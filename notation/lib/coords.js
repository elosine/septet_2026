// coords.js — THE coordinate module (Phase B2, plan DB-2; architecture §5).
// ONE module owns every translation between units; every other module CALLS
// it; nothing duplicates the math; mirrors are a smell (piece #2
// COORDINATE_SYSTEM_VISION §5). Pure, dual-load, no state, no DOM.
//
// The three-layer stack (architecture §5):
//   1. score time in SECONDS   — canonical, persistent (the strip)
//   2. lane-relative units     — persistent, viewport-invariant:
//        · lane FRACTION places SYSTEMS (the meta-structure level)
//        · STAFF-SPACE (ss) is the unit inside a system (glyph metrics)
//   3. pixels                  — exist only through a View, stored nowhere
//
// SZ-7 lesson adopted: ss is LANE-RELATIVE — ssPx derives from the system
// band's height (ssPerSystem vertical ss per band), so a resize rescales
// everything coherently and no absolute-pixel calibration can break.
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.NotationCoords = factory();
})(typeof self !== 'undefined' ? self : this, function () {

  const DEFAULTS = {
    ssPerSystem: 12,   // vertical ss a system band spans (staff 4ss + air above/below)
  };

  // Band meta-structure: N parts stacked top to bottom with fractional
  // padding and gaps. Returns [{part, laneFrac0, laneFrac1}] — laneFrac 0 is
  // the TOP of the viewport, 1 the bottom (screen convention, stated once).
  // [A21/V1] opts.weights: per-part height weights (heights proportional;
  // equal bands when omitted) — irregular track heights are a lane-config
  // edit, never a layout change.
  function systemsForParts(parts, opts) {
    const o = Object.assign({ topPad: 0.02, botPad: 0.02, gap: 0.01 }, opts || {});
    const n = parts.length;
    const usable = 1 - o.topPad - o.botPad - o.gap * (n - 1);
    if (usable <= 0) throw new Error('coords: padding/gaps leave no room for ' + n + ' systems');
    const w = o.weights;
    if (w) {
      if (w.length !== n) throw new Error('coords: weights length ' + w.length + ' != parts length ' + n);
      if (w.some(x => !(x > 0))) throw new Error('coords: weights must be positive');
    }
    const total = w ? w.reduce((a, b) => a + b, 0) : n;
    let f = o.topPad;
    return parts.map((part, i) => {
      const h = usable * (w ? w[i] : 1) / total;
      const s = { part, laneFrac0: f, laneFrac1: f + h };
      f += h + o.gap;
      return s;
    });
  }

  // [2a.1, the septet — 2026-09-11] A part of TWO OR MORE STAVES (the
  // piano's grand staff) is ONE lane: one label, one solo, one brace. The
  // lane entry stays as it is (whole-lane consumers — the GC's landing,
  // the followers, the solo dim — keep finding it by its part number), and
  // each staff is added as a sub-system keyed '<part>:<i>', an equal slice
  // of the lane from the top, with its share of the lane's staff scale, so
  // every staff in the frame is the same size. stavesOf(part) -> count.
  // [§401k, 2026-09-11] opts.interStaffGapSs (or centreToCentreFrac): the distance between the middle lines of
  // adjacent staves of ONE part, as a fraction of the frame height — the grand staff's
  // inter-staff gap made data (registry engraving.layout.grandStaff.interStaffGapSs, 6 ss =
  // piece #2's locked LilyPond measurement; LilyPond's own PianoStaff default is 5). The
  // staves are placed at that distance, CENTRED IN THE LANE; each keeps its half-lane band
  // (the GC's impact stays at the gap's middle) and gets a `midFrac` the view honours for
  // its middle line. Without opts: each staff centred in its own share, as before.
  function withStaves(systems, stavesOf, opts) {
    const out = [];
    for (const s of systems) {
      out.push(s);
      const n = (typeof s.part === 'number' && stavesOf(s.part)) || 1;
      if (n < 2) continue;
      const h = (s.laneFrac1 - s.laneFrac0) / n;
      for (let i = 0; i < n; i++) {
        // the gap in ss becomes a frame fraction through THIS lane's own scale (ss per lane
        // height), so the same number holds in the video frame, the zoom and any export
        const c2c = opts && opts.interStaffGapSs > 0 && s.ssPerSystem > 0
          ? (opts.interStaffGapSs + 4) * (s.laneFrac1 - s.laneFrac0) / s.ssPerSystem
          : (opts && opts.centreToCentreFrac > 0 ? opts.centreToCentreFrac : null);
        const laneMid = (s.laneFrac0 + s.laneFrac1) / 2;
        out.push(Object.assign({}, s, {
          part: s.part + ':' + i, lane: s.part, staff: i,
          laneFrac0: s.laneFrac0 + i * h, laneFrac1: s.laneFrac0 + (i + 1) * h,
          ssPerSystem: s.ssPerSystem ? s.ssPerSystem / n : undefined,
        }, c2c ? { midFrac: laneMid + (i - (n - 1) / 2) * c2c } : {}));
      }
    }
    return out;
  }

  // A View binds the persistent layers to one viewport. All px appear here
  // and only here.
  //   cfg: { widthPx, heightPx, window: [t0, t1], systems, ssPerSystem?,
  //          gutterPx? }
  // [A21c/V1] gutterPx: UNTIMED prefatory space at the left edge — time
  // maps onto [gutterPx, widthPx]; x < gutterPx is dead space (clef, part
  // labels; the cursor enters at xOfSeconds(t0) = gutterPx).
  // [A21/V1] a systems entry may carry its own ssPerSystem — lane height
  // and staff scale are independent ("taller lane, same staff, more air").
  function makeView(cfg) {
    const { widthPx, heightPx } = cfg;
    const [t0, t1] = cfg.window;
    if (!(t1 > t0)) throw new Error('coords: window must increase');
    if (!(widthPx > 0 && heightPx > 0)) throw new Error('coords: viewport must be positive');
    const ssPerSystem = cfg.ssPerSystem || DEFAULTS.ssPerSystem;
    const gutterPx = cfg.gutterPx || 0;
    if (!(gutterPx >= 0 && gutterPx < widthPx)) throw new Error('coords: gutter must leave music room');
    const pxPerSecond = (widthPx - gutterPx) / (t1 - t0);

    const xOfSeconds = t => gutterPx + (t - t0) * pxPerSecond;
    const secondsOfX = x => t0 + (x - gutterPx) / pxPerSecond;
    const yOfLaneFrac = f => f * heightPx;
    const laneFracOfY = y => y / heightPx;

    const systems = cfg.systems.map(s => {
      const yTopPx = yOfLaneFrac(s.laneFrac0);
      const yBotPx = yOfLaneFrac(s.laneFrac1);
      const hPx = yBotPx - yTopPx;
      const ssSys = s.ssPerSystem || ssPerSystem;     // per-lane staff scale
      const ssPx = hPx / ssSys;                       // SZ-7: lane-relative
      const yMidPx = s.midFrac != null ? yOfLaneFrac(s.midFrac) : (yTopPx + yBotPx) / 2;   // staff middle line ([§401k] a staff of a grand staff sits where its part's gap puts it)
      return {
        part: s.part,
        yTopPx, yBotPx, heightPx: hPx, ssPx, yMidPx, ssPerSystem: ssSys,
        // vertical position from a ss offset relative to the staff middle
        // line; +ss goes UP on the page (musical convention), so px go down.
        yOfSs: ss => yMidPx - ss * ssPx,
        ssOfY: y => (yMidPx - y) / ssPx,
        pxOfSs: ss => ss * ssPx,                      // lengths (unsigned)
      };
    });
    const byPart = new Map(systems.map(s => [s.part, s]));

    return {
      widthPx, heightPx, window: [t0, t1], pxPerSecond, ssPerSystem, gutterPx,
      xOfSeconds, secondsOfX, yOfLaneFrac, laneFracOfY,
      systems,
      system: part => {
        const s = byPart.get(part);
        if (!s) throw new Error('coords: no system for part ' + part);
        return s;
      },
    };
  }

  // [V1] The PP-6 zoom, encoded ONCE: a uniform ×Z magnification of the
  // SAME geometry. Every scale doubles — ssPx (via heightPx×Z), pxPerSecond
  // and the gutter — so every drawn coordinate is exactly ×Z, provable.
  // The window RE-CUTS to what still fits full-width: span' =
  // (widthPx − Z·gutter) / (Z·pxPerSecond). (Naive span/Z is exact only at
  // gutter 0.) Vertical overflow is the zoom shell's scroll, by design.
  function zoomCfg(cfg, Z, t0) {
    if (!(Z > 0)) throw new Error('coords: zoom factor must be positive');
    const [b0, b1] = cfg.window;
    const G = cfg.gutterPx || 0;
    const basePps = (cfg.widthPx - G) / (b1 - b0);
    const start = t0 === undefined ? b0 : t0;
    const span = (cfg.widthPx - Z * G) / (Z * basePps);
    if (!(span > 0)) throw new Error('coords: zoom leaves no music width');
    return Object.assign({}, cfg, {
      heightPx: cfg.heightPx * Z,
      gutterPx: G * Z,
      window: [start, start + span],
    });
  }

  return { makeView, systemsForParts, withStaves, zoomCfg, DEFAULTS };
});
