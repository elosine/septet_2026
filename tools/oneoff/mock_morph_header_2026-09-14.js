// Kept for the record (RUNNING_LOG §467 / §471). A one-off of 2026-09-14; paths point at this repo's root. Not a tool.
// mock_header.js — M1's header for two parts with BOTH an arrowed natural and a cents number (his ask, 2026-09-14).
// The engine's own glyph paths (glyphs.json, Emmentaler) placed by Stamps.toSvg, at the header geometry of layout.js
// (day 35): heads · gliss line · accidental · the dynamic row (niente · arrow · end mark). The arrow on the natural and the
// cents text are drawn by hand here — the engine has no arrowed accidental glyph yet. A MOCK, not the engine's page.
const fs = require('fs'), path = require('path');
const ROOT = 'C:/Users/jwloy/GitHub/septet_2026';
const G = require(ROOT + '/notation/lib/glyphs.json');
const Stamps = require(ROOT + '/notation/lib/stamps.js');
const S = Stamps.makeStamps(G);
const { Resvg } = require(ROOT + '/node_modules/@resvg/resvg-js');

const ss = 14;                       // px per staff space
const W = 620, H = 420;
const parts = [];
const A = { lenSs: 2.0, headSs: 0.45, gapSs: 0.45, thickSs: 0.13 }, DIA = 0.4695, DYN_Y = -4.6, ACC_GAP = 0.25;
const ORANGE = '#F04B00', LIME = '#99FF00';

function staff(x0, x1, midY) {
  const out = [];
  for (let i = -2; i <= 2; i++) out.push(`<line x1="${x0}" y1="${midY + i * ss}" x2="${x1}" y2="${midY + i * ss}" stroke="#000" stroke-width="1"/>`);
  return out.join('');
}
function header(opts) {
  // opts: {midY, goX, clef, ySs (head position, + up), dir: 'up'|'down', cents, label, ledger}
  const { midY, goX, clef, ySs, dir, cents, label, ledger } = opts;
  const Y = y => midY - y * ss, X = dx => goX + dx * ss;
  const out = [];
  out.push(`<text x="18" y="${midY - 3.2 * ss}" font-family="Georgia, serif" font-size="13" fill="#333" transform="translate(0 -32)">${label}</text>`);
  out.push(staff(40, W - 20, midY));
  // clef
  const cl = clef === 'bass' ? { st: S.clef('bass'), align: 'fLine', line: 1 } : { st: S.clef('treble'), align: 'gLine', line: -1 };
  out.push(Stamps.toSvg(cl.st, { xPx: 48, yPx: Y(cl.line), ssPx: ss, align: cl.align }));
  // the go line (dashed, the tuba's 5,4)
  out.push(`<line x1="${goX}" y1="${midY - 3.6 * ss}" x2="${goX}" y2="${midY + 5.4 * ss}" stroke="#000" stroke-width="1.2" stroke-dasharray="5,4"/>`);
  // the dynamic row: niente · arrow · fff (the tuba's end mark; the mark itself is held decision 2)
  const mg = G.dynamic.fff;
  const markC = -A.gapSs - mg.wSs / 2, arrR = markC - mg.wSs / 2 - A.gapSs, arrL = arrR - A.lenSs, cirC = arrL - A.gapSs - DIA / 2;
  const y = Y(DYN_Y);
  out.push(`<circle cx="${X(cirC)}" cy="${y}" r="${DIA / 2 * ss}" fill="none" stroke="#000" stroke-width="${A.thickSs * ss}"/>`);
  out.push(`<line x1="${X(arrL)}" y1="${y}" x2="${X(arrR) - A.headSs * ss}" y2="${y}" stroke="#000" stroke-width="${A.thickSs * ss}"/>`);
  out.push(`<polygon points="${X(arrR)},${y} ${X(arrR) - A.headSs * ss},${y - A.headSs * ss * 0.45} ${X(arrR) - A.headSs * ss},${y + A.headSs * ss * 0.45}" fill="#000"/>`);
  out.push(Stamps.toSvg(S.dynamic ? S.dynamic('fff') : { kind: 'd', wSs: mg.wSs, hSs: mg.hSs, anchors: { center: { x: mg.wSs / 2, y: mg.hSs / 2 } }, prims: [{ type: 'path', d: mg.path }] }, { xPx: X(markC), yPx: y, ssPx: ss, align: 'center' }));
  // the pitch figure
  const hw = G.notehead.open.wSs, glissLen = G.notehead.open.wSs * 2, acc = G.accidental.natural;
  const h2R = -A.gapSs, h2L = h2R - hw;
  const low = dir === 'down';
  const accR = low ? h2L : h2L - ACC_GAP, accL = low ? h2L : accR - acc.wSs;
  const glR = accL - A.gapSs, glL = glR - glissLen;
  const h1R = glL - A.gapSs, h1L = h1R - hw;
  const yP = Y(ySs);
  if (ledger) for (const cx of [X(h1L + hw / 2), X(h2L + hw / 2)]) out.push(`<line x1="${cx - 0.85 * ss}" y1="${yP}" x2="${cx + 0.85 * ss}" y2="${yP}" stroke="#000" stroke-width="1"/>`);
  out.push(Stamps.toSvg(S.noteheadOpen(), { xPx: X(h1L + hw / 2), yPx: yP, ssPx: ss, align: 'center' }));
  out.push(`<line x1="${X(glL)}" y1="${yP}" x2="${X(glR)}" y2="${yP}" stroke="#000" stroke-width="${A.thickSs * ss}"/>`);
  out.push(Stamps.toSvg(S.noteheadOpen(), { xPx: X(h2L + hw / 2), yPx: yP, ssPx: ss, align: 'center' }));
  // the arrowed natural: before the HIGH head when rising, before the LOW head when falling
  const ax = low ? (h1L - ACC_GAP - acc.wSs / 2) : (accL + acc.wSs / 2);
  out.push(Stamps.toSvg(S.accidental('natural'), { xPx: X(ax), yPx: yP, ssPx: ss, align: 'center' }));
  // the arrow, drawn by hand on the natural's right (up) / left (down) stroke — Emmentaler's arrowed naturals look like this
  const stemX = low ? X(ax) - 0.12 * ss : X(ax) + 0.12 * ss;
  const top = yP - acc.hSs / 2 * ss, bot = yP + acc.hSs / 2 * ss, L = 0.8 * ss, hd = 0.42 * ss;
  if (!low) { out.push(`<line x1="${stemX}" y1="${top}" x2="${stemX}" y2="${top - L}" stroke="#000" stroke-width="${0.11 * ss}"/>`); out.push(`<polygon points="${stemX},${top - L - hd} ${stemX - hd * 0.7},${top - L + 0.05 * ss} ${stemX + hd * 0.7},${top - L + 0.05 * ss}" fill="#000"/>`); }
  else { out.push(`<line x1="${stemX}" y1="${bot}" x2="${stemX}" y2="${bot + L}" stroke="#000" stroke-width="${0.11 * ss}"/>`); out.push(`<polygon points="${stemX},${bot + L + hd} ${stemX - hd * 0.7},${bot + L - 0.05 * ss} ${stemX + hd * 0.7},${bot + L - 0.05 * ss}" fill="#000"/>`); }
  // the cents, small, above the altered head
  const cx = low ? X(h1L + hw / 2) : X(h2L + hw / 2);
  const cy = Math.min(yP, midY - 2 * ss) - 1.1 * ss;
  out.push(`<text x="${cx}" y="${cy}" text-anchor="middle" font-family="Georgia, serif" font-size="${0.95 * ss}" fill="#000">${cents}</text>`);
  // the first stretch of the two curves, the D42 look (orange top half, lime bottom half), just to place the header in its score
  const laneTop = midY - 3.4 * ss, laneBot = midY + 3.4 * ss, laneMid = (laneTop + laneBot) / 2;
  const x0 = goX, x1 = W - 20;
  const curve = (yBase, yFull, color, dirSign) => {
    const pts = []; const n = 40;
    for (let i = 0; i <= n; i++) { const u = i / n; const v = 0.05 + 0.6 * Math.pow(u, 1.6); pts.push([x0 + u * (x1 - x0), yBase + dirSign * v * Math.abs(yFull - yBase)]); }
    const d = 'M' + pts.map(p => p[0].toFixed(1) + ',' + p[1].toFixed(1)).join(' L') + ` L${x1},${yBase} L${x0},${yBase} Z`;
    return `<path d="${d}" fill="${color}" fill-opacity="0.3" stroke="${color}" stroke-width="2" opacity="0.3"/>`;
  };
  out.push(curve(laneMid, laneTop, ORANGE, -1));
  out.push(curve(laneBot, laneMid, LIME, -1));
  return out.join('');
}
const svg = [`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><rect width="${W}" height="${H}" fill="#fff"/>`];
// the cello: C4 in the bass clef = the first ledger line above the staff (ySs +3.0), rising → C → C♮↑, +25
svg.push(header({ midY: 125, goX: 250, clef: 'bass', ySs: 3.0, dir: 'up', cents: '+25', label: 'Vc — C4 rising an eighth tone: C → C♮↑ (+25)', ledger: true }));
// the bass clarinet, written pitch (+M9): sounding C4 = written D5, the treble staff's 4th line (ySs +1.0), falling → D♮↓ → D, −25
svg.push(header({ midY: 315, goX: 250, clef: 'treble', ySs: 1.0, dir: 'down', cents: '−25', label: 'BCl (written, +M9) — D5 falling an eighth tone: D♮↓ → D (−25)', ledger: false }));
svg.push(`<text x="18" y="${H - 8}" font-family="Georgia, serif" font-size="10" fill="#666">mock: the engine's glyphs and header geometry; the arrow on the natural and the cents are drawn by hand; the end mark fff is the tuba's (held decision 2)</text>`);
svg.push('</svg>');
const out = path.dirname(__filename) + '/mock_header';
fs.writeFileSync(out + '.svg', svg.join(''));
const png = new Resvg(svg.join(''), { fitTo: { mode: 'zoom', value: 2 } }).render().asPng();
fs.writeFileSync(out + '.png', png);
console.log('wrote', out + '.svg', out + '.png', png.length, 'bytes');
