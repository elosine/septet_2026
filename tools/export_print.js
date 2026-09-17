#!/usr/bin/env node
// export_print.js — THE PRINT SCORE. Paginated, static, vector PDF.
//
// Day 37. The print score was parked on day 36 with its format decided
// (`docs/PRINT_AND_COVER.md`: TABLOID LANDSCAPE 17 x 11) and nothing built.
//
// WHY THIS IS SMALL: the notation engine is already resolution-independent.
// `Layout.layoutSection` returns a model in STAFF-SPACE units and
// `Coords.makeView` maps it onto a canvas, so a print page is the same model
// at a different view — not a second engine. The page itself comes from
// `notation/lib/static_page.js`, the SAME module the video exporter draws
// through, so the printed page and the approved film cannot drift.
//
// WHAT PRINT ADDS that the video does not have:
//   1. a TIME RULER. The video has a moving cursor; paper does not. This is a
//      proportional score, so without a time reference the page cannot be read
//      in time at all. Ticks every second, numbered every five.
//   2. SECTION MARKS. Derived from the score's own ACT- markers, never from the
//      raw working marks (which is what ir.hideMarkers exists to suppress).
//   3. FOLIOS, and an optional cover page from print/cover/.
//
// PDF: Chrome headless --print-to-pdf. Measured day 37 — MediaBox [0 0 1224
// 792] exactly, fonts embedded as FontFile2, ZERO raster images, real path
// operators. No new dependency; the repo still has exactly one (resvg, D77).
//
// usage:
//   node tools/export_print.js --ir db1 --out print/score/BCB-score.pdf
//   node tools/export_print.js --sec 15 --pages 1-4 --out proof.pdf
//   node tools/export_print.js --htmlOnly --out proof.html
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const ROOT = path.join(__dirname, '..');
const Coords = require(path.join(ROOT, 'notation', 'lib', 'coords.js'));
const Layout = require(path.join(ROOT, 'notation', 'lib', 'layout.js'));
const Splice = require(path.join(ROOT, 'notation', 'lib', 'splice.js'));
const StaticPage = require(path.join(ROOT, 'notation', 'lib', 'static_page.js'));

// ---------------------------------------------------------------- args
function arg(name, def) { const i = process.argv.indexOf('--' + name); return i >= 0 ? process.argv[i + 1] : def; }
function flag(name) { return process.argv.indexOf('--' + name) >= 0; }
const irId = arg('ir', 'db1');
const outFile = arg('out', null);
// [PLAN 2b.2.1 — 2026-09-17] A3 LANDSCAPE IS THE DEFAULT. The call, verbatim: "The score as an Adobe PDF document with a
// maximum size of DIN A3 (297 x 420 mm)". Tabloid — #4's format, and this tool's old default — is 431.8 mm long: 11.8 mm OVER.
const formatName = arg('format', 'a3-landscape');
const marginIn = parseFloat(arg('margin', '0.5'));
const secArg = arg('sec', null);
const pagesArg = arg('pages', null);
const atArg = arg('at', null);        // select the page(s) CONTAINING this second — a comma list makes a proof PDF (2b.3)
const wantRuler = arg('ruler', 'on') !== 'off';
const wantCover = arg('cover', 'off') !== 'off';
const wantInstructions = arg('instructions', 'off') !== 'off';
const htmlOnly = flag('htmlOnly');
const quiet = flag('quiet');

if (!outFile) {
  console.error('usage: export_print.js --out <file.pdf> [--ir db1] [--sec N] [--pages a-b] [--at SEC]');
  console.error('       [--format a3-landscape|tabloid-landscape|letter-landscape] [--margin 0.5]');
  console.error('       [--ruler on|off] [--cover on|off] [--instructions on|off] [--htmlOnly]');
  process.exit(2);
}

// UNIT BASIS = CSS PIXELS AT 96/inch, not points.
// An SVG's width/height attributes are UNITLESS, which means CSS px. Page
// geometry in pt therefore rendered the music at 72/96 = 75 % of the block
// while pt-measured furniture (the folio) spanned it fully — caught on the
// first screenshot, not by reading. @page still carries the physical size in
// inches, so the PDF is a true 17 x 11 regardless.
const PX = 96;
// `css` is what @page gets: A3 is a metric sheet and 420 mm is exact where
// 16.5354 in is a rounding — Chrome sizes the MediaBox from this string.
//
// A3 IS A CEILING, NOT A TARGET (the call: "a maximum size of DIN A3"), and
// Chrome does not honour the box exactly: `size:420mm 297mm` measured out as
// MediaBox 1191.12 x 841.92 pt = 420.2 x 297.0 mm — two tenths of a millimetre
// OVER the sheet it is meant to be. A checker that reads the box would call that
// a bigger-than-A3 score. So the drawn sheet is a fifth of a millimetre under the
// ceiling and Chrome's rounding lands inside it. (Shrinking @page alone does not
// work: the page DIV keeps its old height and every page spills onto a second —
// measured, 8 pages for 4. Both come from these numbers, which is why they live here.)
const FORMATS = {
  // name                    w x h INCHES, landscape
  'a3-landscape': { w: 419.7 / 25.4, h: 296.8 / 25.4, css: '419.7mm 296.8mm', label: 'A3 landscape (419.7 x 296.8 mm drawn, inside DIN A3 420 x 297)' },
  'tabloid-landscape': { w: 17, h: 11, css: '17in 11in', label: 'Tabloid landscape 17 x 11 in' },
  'letter-landscape': { w: 11, h: 8.5, css: '11in 8.5in', label: 'Letter landscape 11 x 8.5 in' },
};
const FMT = FORMATS[formatName];
if (!FMT) { console.error('unknown --format ' + formatName + '; have: ' + Object.keys(FORMATS).join(', ')); process.exit(2); }

// ---------------------------------------------------------------- load
const rd = p => JSON.parse(fs.readFileSync(path.join(ROOT, p), 'utf8'));
const glyphs = rd('notation/lib/glyphs.json');
const pageRules = rd('notation/registry/page_rules.json');
const C = rd('notation/registry/container.json');
// [PLAN 2k, D55 / M5 — 2026-09-16] the ensemble, REALIZED: this export is the presentation score (a full score read together), so the
// bass clarinet is in C on a bass clef (registry realizations.video-jury.ensemble); the working page keeps the default B♭ treble.
const ens = rd('notation/registry/ensemble.json');
const T = rd('notation/registry/techniques.json');
const ir = rd(path.join('notation', 'ir', irId + '.ir.json'));

// [PLAN 2b.1.1 — 2026-09-17] THE FRAME'S PARTS COME FROM THE REALIZED ENSEMBLE, exactly as the video's do. They came from
// `ir.source.parts` — the parts the IR happens to carry — which is why the print drew six systems and no piano: the grand
// staff's systems are keyed '2:0' / '2:1' and no part number 2 was ever in the frame (RUNNING_LOG §552).
const ENS = Layout.ensembleFor(ens, (C.realizations || {})['video-jury']);
const ensPart = p => (ENS && ENS.parts.find(q => q.part === p)) || null;
const FRAME_PARTS = ENS ? ENS.parts.map(p => p.part) : ir.source.parts.slice();
const model = Layout.layoutSection(ir, glyphs, Object.assign(
  { m4AttackLines: false, frameParts: FRAME_PARTS, ensemble: ENS, techniques: T },
  (C.engraving && C.engraving.layout) || {}));
const srcEnd = ir.source.window[1];

// ------------------------------------------------- geometry
// The lane proportions come from the SAME registry block the video uses, so a
// printed lane is the video lane scaled — not a second set of numbers to keep
// in sync. Verified day 37: this derivation reproduces PRINT_AND_COVER's
// measured 26.7 mm lane and ~8 mm staff without either being typed in here.
const rz = (C.realizations || {})['video-jury'] || {};
const lanes = rz.lanes || { padTopPx: 8, padBotPx: 8, gapPx: 4 };
const VH = (C.frame && C.frame.heightPx) || 1080;
const VW = (C.frame && C.frame.widthPx) || 1920;
const staffHeightPx = (C.staff && C.staff.staffHeightPx) || 31.6;
const videoPageSeconds = (C.timeScale && C.timeScale.defaults && C.timeScale.defaults.trance) || 12;

const pageW = FMT.w * PX, pageH = FMT.h * PX;
const margin = marginIn * PX;
const headerPx = wantRuler ? 32 : 0;                   // the time-ruler strip
const footerPx = 19;                                   // folio
const blockW = pageW - 2 * margin;
const blockH = pageH - 2 * margin - headerPx - footerPx;
if (!(blockW > 0 && blockH > 0)) { console.error('margins leave no room for music'); process.exit(2); }

// [PLAN 2b.1.2 / 2b.1.4 — 2026-09-17] THE BAND: the same function the video calls (Coords.ensembleFrame) — weighted lanes
// (the piano 1.576), each lane's staff scale by its weight, the grand staff's two staves at the registry's gap. It is computed
// in the VIDEO's frame height and used here at the print block's, which is sound because a lane is a FRACTION and ssPerSystem
// is a RATIO (lane height / one staff space) — this is what keeps the printed staff proportional to the filmed one.
const N = FRAME_PARTS.length;
const FRAME = Coords.ensembleFrame(FRAME_PARTS, {
  heightPx: VH, lanes, staffHeightPx,
  grandStaff: ((C.engraving || {}).layout || {}).grandStaff,
  weightOf: ENS ? (p => (ensPart(p) && ensPart(p).weight) || 1) : undefined,
  stavesOf: p => (ensPart(p) && ensPart(p).staves && ensPart(p).staves.length) || 1,
});
const systems = FRAME.systems, ssPerSystem = FRAME.ssPerSystem;
const laneFrac = FRAME.lanePx / VH;              // ONE WEIGHT UNIT — a player's lane
const lanePx = laneFrac * blockH;
const ssPx = lanePx / ssPerSystem;
const staffPx = 4 * ssPx;
const mm = px => px / PX * 25.4;

// SECONDS PER PAGE. Default = the density the composer approved on screen:
// the video lays down (pxPerSecond / ssPx) staff-spaces per second, and we hold
// that constant so a printed bar looks like the filmed bar, only larger.
const videoDensitySsPerSec = (VW / videoPageSeconds) / ((laneFrac * VH) / ssPerSystem);
const defaultSec = blockW / (videoDensitySsPerSec * ssPx);
const pageSeconds = secArg != null ? parseFloat(secArg) : defaultSec;
if (!(pageSeconds > 0)) { console.error('--sec must be positive'); process.exit(2); }

// ------------------------------------------------- IR-vs-score staleness HINT
// The print score is drawn from the IR, not from the save file. So editing the
// score and re-running THIS tool renders the OLD notation, silently. That is the
// failure this notice exists to prevent.
//
// It is a HINT, not a verdict, and deliberately so: D75 records that a save
// file's timestamp is NOT evidence of its currency (a `-work` copy was three
// days NEWER than the archive and missing an entire playability pass). A newer
// mtime here means "check", never "stale".
try {
  const irPath = path.join(ROOT, 'notation', 'ir', irId + '.ir.json');
  const scPath = path.join(ROOT, 'scores', ir.source.score + '.json');
  if (fs.existsSync(scPath)) {
    const irM = fs.statSync(irPath).mtimeMs, scM = fs.statSync(scPath).mtimeMs;
    if (scM > irM) {
      console.log('  ! NOTE  ' + ir.source.score + '.json is NEWER than ' + irId + '.ir.json.');
      console.log('          The print score is drawn from the IR, so score edits do not appear');
      console.log('          until the IR is rebuilt:   bash print/score/build.sh --rebuild-ir');
      console.log('          (a timestamp is a hint, not proof — D75. Rebuild to be sure.)');
    }
  }
} catch (e) { /* a missing score is not an error; marks just go quiet */ }

// ---------------------------------------------------------------- pages
const pages = Splice.planPages(ir, pageRules, pageSeconds);
let sel = pages.map((_, i) => i);
if (atArg != null) {
  // the page containing a given second — the page plan changes with --sec, so
  // a fixed --pages number does NOT show the same music at two densities.
  // [2b.3] a COMMA LIST gives one PDF of those pages — the proof sheet, one
  // page per section, which is what the composer is asked to look at.
  const pageAt = t => { let best = 0; for (let i = 0; i < pages.length; i++) if (pages[i].t0 <= t) best = i; else break; return best; };
  sel = [...new Set(String(atArg).split(',').filter(s => s.trim() !== '').map(s => pageAt(parseFloat(s))))].sort((a, b) => a - b);
}
if (pagesArg) {
  const m = /^(\d+)(?:-(\d+))?$/.exec(pagesArg.trim());
  if (!m) { console.error('--pages wants N or A-B (1-indexed)'); process.exit(2); }
  const a = parseInt(m[1], 10), b = m[2] ? parseInt(m[2], 10) : a;
  sel = sel.filter(i => i + 1 >= a && i + 1 <= b);
  if (!sel.length) { console.error('--pages ' + pagesArg + ' selects nothing (have 1-' + pages.length + ')'); process.exit(2); }
}

// [PLAN 2b.1.5 — 2026-09-17; §404 on the page] THE BUFFER AFTER THE CLEF. A page break can land on a note's own onset and the
// unit hangs LEFT of its go line, so every window opens page_rules.musicStartBufferSs staff spaces early (never before the IR's
// own start) — the page, the app and the video all do it; the print did not, so a first note could sit in the gutter.
// ss -> seconds through THIS page's own scale, which is why it is computed here and not carried over from the video.
const bufSs = pageRules.musicStartBufferSs || 0;
const pxPerSecPage = (blockW - ((C.prefatory && C.prefatory.gutterPx) || 0)) / pageSeconds;
const bufSec = bufSs > 0 && ssPerSystem > 0 ? bufSs * ssPx / pxPerSecPage : 0;
const pageT0Of = i => Math.max(ir.source.window[0], pages[i].t0 - bufSec);

function viewFor(i) {
  // THE LAST PAGE REACHES THE PIECE'S END. Measured day 37: with the default
  // density the last window ended at 752.92 against srcEnd 753, so the true
  // final barline fell 0.08 s outside the page and the score would have ended
  // with no final bar once the right-edge bar was removed. The last page's
  // window is therefore stretched to srcEnd — 11.49 s instead of 11.41, a 0.7 %
  // spacing difference on one page, in exchange for a correct final barline.
  const isLast = i === pages.length - 1;
  const t0 = pageT0Of(i);
  const w1 = isLast ? Math.max(t0 + pageSeconds, srcEnd) : t0 + pageSeconds;
  return Coords.makeView({
    widthPx: blockW, heightPx: blockH,
    window: [t0, w1],
    gutterPx: (C.prefatory && C.prefatory.gutterPx) || 0,
    systems, ssPerSystem,
  });
}

// ------------------------------------------------- section marks: NONE
// [PLAN 2b.2.3, D58 — 2026-09-17] The composer, asked what the marks above the
// music should say: "no marks". So there are none, and the derivation that made
// them is GONE rather than switched off — it was the tuba's (its ACT- markers
// and the trance's numeric marks), it found nothing in this score anyway
// ("marks NONE FOUND", §606), and a dead derivation in a live tool is a trap.
// The strip above the music now carries the time ruler alone.

// ------------------------------------------------- furniture
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const clock = t => {
  const s = Math.round(t);
  return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
};
// The ruler is drawn in its own strip but shares the music view's x mapping, so
// a tick and the note under it cannot disagree.
function rulerSvg(view) {
  const [t0, t1] = view.window;
  const p = ['<svg xmlns="http://www.w3.org/2000/svg" width="' + blockW.toFixed(2) + '" height="' + headerPx +
    '" viewBox="0 0 ' + blockW.toFixed(2) + ' ' + headerPx + '">'];
  const yBase = headerPx - 0.5;
  if (wantRuler) {
    p.push('<line x1="0" y1="' + yBase + '" x2="' + blockW.toFixed(2) + '" y2="' + yBase + '" stroke="#8a8a8a" stroke-width="0.4"/>');
    const first = Math.ceil(t0), last = Math.floor(Math.min(t1, srcEnd));
    for (let t = first; t <= last; t++) {
      const x = view.xOfSeconds(t);
      if (x < 0 || x > blockW) continue;
      const five = t % 5 === 0;
      p.push('<line x1="' + x.toFixed(2) + '" y1="' + (yBase - (five ? 5 : 2.5)).toFixed(2) + '" x2="' + x.toFixed(2) +
        '" y2="' + yBase + '" stroke="#8a8a8a" stroke-width="' + (five ? 0.6 : 0.35) + '"/>');
      if (five) p.push('<text x="' + x.toFixed(2) + '" y="' + (yBase - 7).toFixed(2) +
        '" font-size="6.5" font-family="\'Crimson Pro Light\', serif" fill="#8a8a8a" text-anchor="middle">' + clock(t) + '</text>');
    }
  }
  p.push('</svg>');
  return p.join('');
}

// ---------------------------------------------------------------- html
const fontB64 = f => fs.readFileSync(path.join(ROOT, 'notation', 'app', 'fonts', f)).toString('base64');
const faces = [
  { file: 'CrimsonPro-Light.ttf', style: 'normal' },
  { file: 'CrimsonPro-LightItalic.ttf', style: 'italic' },
].map(f => "@font-face{font-family:'Crimson Pro Light';font-style:" + f.style +
  ";src:url(data:font/ttf;base64," + fontB64(f.file) + ") format('truetype');}").join('\n');

function coverSvg() {
  if (!wantCover) return null;
  const p = path.join(ROOT, 'print', 'cover', 'cover-D-tabloid-landscape-1line.svg');
  if (!fs.existsSync(p)) { console.error('  ! --cover on but ' + path.relative(ROOT, p) + ' is missing; skipping cover'); return null; }
  return fs.readFileSync(p, 'utf8');
}

// ------------------------------------------------- performance instructions
// Page 2 of the print score (day 40, composer: "separate the performance
// instructions into two columns and lay them out as a second page of the
// print score"). ONE SOURCE: docs/notation_instructions/index.html — the
// dictation mock page IS the front matter; this function only re-dresses it
// for paper (two CSS columns, the score's Crimson faces, images inlined so
// the SVGs' own 'Crimson Pro Light' <text> resolves against the embedded
// fonts — an <img> would isolate them and fall back).
function instructionsHtml() {
  if (!wantInstructions) return null;
  const src = path.join(ROOT, 'docs', 'notation_instructions', 'index.html');
  if (!fs.existsSync(src)) { console.error('  ! --instructions on but docs/notation_instructions/index.html is missing; skipping'); return null; }
  let body = /<body>([\s\S]*)<\/body>/.exec(fs.readFileSync(src, 'utf8'))[1];
  body = body.replace(/<!--[\s\S]*?-->/g, '');            // regen-command comments
  // title block spans both columns; the rest flows
  const tm = /<h1>([\s\S]*?)<\/h1>\s*<p class="subtitle">([\s\S]*?)<\/p>/.exec(body);
  const title = tm ? tm[1] : 'Performance Instructions';
  const subtitle = tm ? tm[2] : '';
  if (tm) body = body.replace(tm[0], '');
  // inline every image (all SVG, all with viewBox — they scale by CSS width).
  // Per-figure widths, % of the column: the two big panels (the 3-lane
  // multitempo shot, the beating chart) cannot ride at full column width or
  // the page overflows — measured day 40, content ran 0.55 of a column over.
  const FIGW = {
    multitempo_530_T8T9T10: 66, beating_sequence_chart: 72,
    curve_cresc_691_T2: 90, clusters_37_T9: 85, beating_notation_224_T7: 85,
  };
  body = body.replace(/<img\s+src="([^"]+)"[^>]*>/g, (_, rel) => {
    const p = path.join(ROOT, 'docs', 'notation_instructions', rel);
    if (!fs.existsSync(p)) { console.error('  ! instructions image missing: ' + rel); return ''; }
    const svg = fs.readFileSync(p, 'utf8').replace(/^<\?xml[^>]*\?>\s*/, '');
    const w = FIGW[path.basename(rel, '.svg')];
    return '<div class="figwrap"' + (w ? ' style="width:' + w + '%"' : '') + '>' + svg + '</div>';
  });
  return '<div class="page ins"><div class="insframe">' +
    '<div class="institle"><span class="t">' + title + '</span><span class="s">' + subtitle + '</span></div>' +
    '<div class="cols">' + body + '</div></div></div>';
}

function buildHtml() {
  const out = [];
  out.push('<!doctype html><meta charset="utf-8"><title>' + esc(irId) + ' — print score</title>');
  out.push('<style>' + faces + '\n' +
    '@page{size:' + FMT.css + ';margin:0;}\n' +
    'html,body{margin:0;padding:0;background:#fff;}\n' +
    '.page{position:relative;width:' + pageW + 'px;height:' + pageH + 'px;overflow:hidden;break-after:page;page-break-after:always;background:#fff;}\n' +
    '.page:last-child{break-after:auto;page-break-after:auto;}\n' +
    '.hdr{position:absolute;left:' + margin + 'px;top:' + margin + 'px;}\n' +
    '.mus{position:absolute;left:' + margin + 'px;top:' + (margin + headerPx) + 'px;}\n' +
    '.fol{position:absolute;left:' + margin + 'px;width:' + blockW + 'px;top:' + (pageH - margin - footerPx + 3) + 'px;' +
    'font:11px "Crimson Pro Light",serif;color:#8a8a8a;display:flex;justify-content:space-between;}\n' +
    '.cov svg{display:block;}\n' +
    // ---- the performance-instructions page (page 2) ----
    '.insframe{position:absolute;left:' + margin + 'px;top:' + margin + 'px;width:' + blockW + 'px;height:' + (pageH - 2 * margin) + 'px;' +
    "font-family:'Crimson Pro Light',serif;color:#111;}\n" +
    '.institle{display:flex;align-items:baseline;gap:18px;border-bottom:0.75px solid #111;padding-bottom:4px;margin-bottom:9px;}\n' +
    '.institle .t{font-size:21px;letter-spacing:3px;}\n' +
    '.institle .s{font-size:12px;font-style:italic;color:#444;}\n' +
    '.cols{column-count:2;column-gap:36px;height:' + (pageH - 2 * margin - 46) + 'px;font-size:10.4px;line-height:1.36;}\n' +
    '.cols h3{font-size:12.5px;letter-spacing:1.5px;margin:7px 0 3px;}\n' +
    '.cols p{margin:0 0 5px;}\n' +
    '.cols ul{margin:0 0 5px 16px;padding:0;}\n' +
    '.cols li{break-inside:avoid;}\n' +
    '.cols a{color:inherit;text-decoration:none;}\n' +
    '.cols figure{margin:0;}\n' +
    '.cols .pair{display:flex;gap:8px;margin:2px 0 5px;width:92%;}\n' +
    '.figwrap{break-inside:avoid;margin:2px 0 5px;}\n' +
    '.figwrap svg{display:block;width:100%;height:auto;}\n' +
    '</style>');

  const cov = coverSvg();
  if (cov) out.push('<div class="page cov">' + cov + '</div>');
  const ins = instructionsHtml();
  if (ins) out.push(ins);

  sel.forEach((i, n) => {
    const view = viewFor(i);
    const svg = StaticPage.staticPageSvg({
      model, view, glyphs, C, srcEnd,
      reshow: pages[i].reshow, ownsEnd: i === pages.length - 1,
      ensemble: ENS,        // [PLAN 2b.1.4] the part labels, the winds' and strings' brackets, the piano's brace (§558)
      // composer, day 37: no bar line at the right of every page. On paper the
      // page edge is not a musical event; the bar draws only at the true end.
      edgeBar: false,
    });
    const t0 = view.window[0], t1 = Math.min(view.window[1], srcEnd);   // the folio reads the DRAWN window (2b.1.5's buffer included)
    out.push('<div class="page">');
    if (headerPx) out.push('<div class="hdr">' + rulerSvg(view) + '</div>');
    out.push('<div class="mus">' + svg + '</div>');
    out.push('<div class="fol"><span>' + esc(clock(t0)) + ' – ' + esc(clock(t1)) + '</span>' +
      '<span>' + (i + 1) + '</span></div>');
    out.push('</div>');
  });
  return out.join('\n');
}

// ---------------------------------------------------------------- chrome
function findChrome() {
  const envd = process.env.CHROME_PATH;
  const cands = [envd,
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
    process.env.LOCALAPPDATA ? process.env.LOCALAPPDATA + '/Google/Chrome/Application/chrome.exe' : null,
    '/usr/bin/google-chrome', '/usr/bin/chromium', '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  ].filter(Boolean);
  for (const c of cands) { try { if (fs.existsSync(c)) return c; } catch (e) { } }
  return null;
}

// ---------------------------------------------------------------- go
const outAbs = path.isAbsolute(outFile) ? outFile : path.join(ROOT, outFile);
fs.mkdirSync(path.dirname(outAbs), { recursive: true });
const html = buildHtml();

if (!quiet) {
  console.log('export_print: ' + irId + ' · ' + FMT.label);
  console.log('  page      ' + mm(pageW).toFixed(0) + ' x ' + mm(pageH).toFixed(0) + ' mm · margin ' + mm(margin).toFixed(1) + ' mm');
  console.log('  music     ' + mm(blockW).toFixed(0) + ' x ' + mm(blockH).toFixed(0) + ' mm');
  console.log('  ' + N + ' lanes  lane ' + mm(lanePx).toFixed(1) + ' mm  STAFF ' + mm(staffPx).toFixed(2) + ' mm');
  console.log('  ' + pageSeconds.toFixed(2) + ' s/page' + (secArg == null ? '  [default = the video\'s approved density]' : '') +
    ' → ' + pages.length + ' pages for ' + srcEnd + ' s');
  console.log('  frame     ' + (ENS ? FRAME_PARTS.map(p => (ensPart(p) || {}).short || p).join(' · ') + '   buffer ' + bufSec.toFixed(3) + ' s'
    : FRAME_PARTS.length + ' parts, NO ENSEMBLE'));
  if (sel.length !== pages.length) {
    const w = viewFor(sel[0]).window;
    console.log('  writing   pages ' + (sel[0] + 1) + '-' + (sel[sel.length - 1] + 1) + ' only (' + sel.length + ')' +
      '   first window ' + w[0].toFixed(2) + '–' + w[1].toFixed(2) + ' s');
  }
}

if (htmlOnly || /\.html?$/i.test(outAbs)) {
  fs.writeFileSync(outAbs, html);
  console.log('wrote ' + path.relative(ROOT, outAbs) + '  (' + (fs.statSync(outAbs).size / 1024).toFixed(0) + ' KB)');
  process.exit(0);
}

const chrome = findChrome();
if (!chrome) {
  const alt = outAbs.replace(/\.pdf$/i, '.html');
  fs.writeFileSync(alt, html);
  console.error('Chrome not found (set CHROME_PATH). Wrote HTML instead: ' + path.relative(ROOT, alt));
  console.error('Open it and print to PDF, or install Chrome and re-run.');
  process.exit(3);
}
const tmpHtml = outAbs.replace(/\.pdf$/i, '') + '.__print.html';
fs.writeFileSync(tmpHtml, html);
const r = spawnSync(chrome, ['--headless', '--disable-gpu', '--no-pdf-header-footer',
  '--print-to-pdf=' + outAbs, 'file:///' + tmpHtml.replace(/\\/g, '/')], { encoding: 'utf8' });
try { fs.unlinkSync(tmpHtml); } catch (e) { }
if (!fs.existsSync(outAbs)) {
  console.error('chrome did not write a pdf');
  console.error((r.stderr || '').split('\n').slice(-6).join('\n'));
  process.exit(1);
}
console.log('wrote ' + path.relative(ROOT, outAbs) + '  (' + (fs.statSync(outAbs).size / 1024 / 1024).toFixed(1) + ' MB, ' +
  (sel.length + (wantCover && coverSvg() ? 1 : 0) + (wantInstructions && instructionsHtml() ? 1 : 0)) + ' pages)');
