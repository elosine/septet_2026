#!/usr/bin/env node
// qr_spots.js — QR codes for the composer's iPad: one labelled sheet (SVG) that opens
// the stand at chosen spots on the box. The design sitting's check spots are the
// default (for_seven_tubas RUNNING_LOG 112–113). Send the SVG with SendUserFile;
// it renders inline. No server needed.
//
//   node tools/qr_spots.js                                  the four seam spots, four rows a screen
//   node tools/qr_spots.js 6:40:"Viola · 0:40":"a note at the row start" 1:136:"Flute · 2:16"
//        part:seconds[:title[:what]] — any number of spots; a title defaults to "part N · m:ss"
//   --rows 4     rows a screen (default 4, the composer's ruling of day 49)
//   --base URL   the stand's origin (default the box)
//   --out FILE   where the SVG goes (default testkit/results/qr/spots.svg)
//   --png        also one PNG per spot beside the SVG (plain codes, no labels)

const fs = require('fs');
const path = require('path');
const QR = require('qrcode');

const ROOT = path.join(__dirname, '..');
const argv = process.argv.slice(2);
const opt = (name, dflt) => { const i = argv.indexOf('--' + name); if (i >= 0) { const v = argv[i + 1]; argv.splice(i, 2); return v; } return dflt; };
const flag = name => { const i = argv.indexOf('--' + name); if (i >= 0) { argv.splice(i, 1); return true; } return false; };
const ROWS = opt('rows', '4');
const BASE = opt('base', 'https://scattered-substance.justinwenloyang.com').replace(/\/$/, '');
const OUT = path.resolve(ROOT, opt('out', path.join('testkit', 'results', 'qr', 'spots.svg')));
const PNG = flag('png');
const mss = t => Math.floor(t / 60) + ':' + String(Math.floor(t % 60)).padStart(2, '0');

const DEFAULT = [
  { part: 1, t: 136, title: 'Flute · 2:16', what: 'tr pushed left at the row end' },
  { part: 6, t: 40, title: 'Viola · 0:40', what: 'next row opens with ♯ + head' },
  { part: 2, t: 512, title: 'Bass Cl. · 8:32', what: 'beam cut at the row end' },
  { part: 3, t: 583.65, title: 'Piano · 9:44', what: 'beams cut at the row end' },
];
const spots = argv.length ? argv.map(a => {
  const [part, t, title, what] = a.split(':');
  if (!(+part >= 1 && +part <= 7) || !isFinite(+t)) throw new Error('a spot is part:seconds[:title[:what]] — got ' + a);
  return { part: +part, t: +t, title: title || ('part ' + part + ' · ' + mss(+t)), what: what || '' };
}) : DEFAULT;

(async () => {
  const cell = 300, pad = 24, W = spots.length * cell + pad, H = 400;
  const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
  let out = '<svg xmlns="http://www.w3.org/2000/svg" width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + ' ' + H + '"><rect width="100%" height="100%" fill="#fff"/>';
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  for (let i = 0; i < spots.length; i++) {
    const s = spots[i];
    const url = BASE + '/notation/app/stand.html?part=' + s.part + '&t=' + s.t + '&rows=' + ROWS;
    const svg = await QR.toString(url, { type: 'svg', margin: 1, errorCorrectionLevel: 'M' });
    const vb = svg.match(/viewBox="([^"]+)"/)[1];
    const inner = svg.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '');
    const x = pad + i * cell;
    out += '<text x="' + (x + 126) + '" y="40" font-family="Segoe UI, sans-serif" font-size="26" font-weight="600" text-anchor="middle">' + (i + 1) + '. ' + esc(s.title) + '</text>';
    out += '<svg x="' + x + '" y="56" width="252" height="252" viewBox="' + vb + '">' + inner + '</svg>';
    out += '<text x="' + (x + 126) + '" y="340" font-family="Segoe UI, sans-serif" font-size="18" text-anchor="middle" fill="#333">' + esc(s.what) + '</text>';
    console.log((i + 1) + '. ' + s.title + '  ' + url);
    if (PNG) await QR.toFile(path.join(path.dirname(OUT), 'spot' + (i + 1) + '.png'), url, { type: 'png', width: 360, margin: 2 });
  }
  out += '</svg>';
  fs.writeFileSync(OUT, out);
  console.log('sheet: ' + OUT);
})().catch(e => { console.error('!! ' + e.message); process.exit(1); });
