#!/usr/bin/env bash
# bloom_demos.sh — the Bloom practice videos (PLAN 2h.7.4, 2026-09-17; docs/plans/BLOOM_PRACTICE_VIDEOS.md). Ported from piece #4's
# notation/video/renders/demos.sh (day 40): export_video.js draws every frame (the still via --probe, the section via --t0/--t1 with
# --parts), ffmpeg puts the label on the still and joins the two.
#
#   bash notation/video/renders/bloom_demos.sh bclvc        one pair (bclvc · vn1va · flvn2)
#   bash notation/video/renders/bloom_demos.sh all          all three
#   FORCE=1 bash …                                          re-render the section playback even if it exists
#
# Every number comes from midi/demo-bloom-heldmax/picked.json (tools/pick_bloom_takes.js): the lanes, the still's instant, the held
# take and its gain, the section's span and its audio, the label (the chart's figure, read from the chart SVG).
#
# Each video (his shape, RUNNING_LOG §596 — the tuba's final form, Bloom only):
#   [the static, 30 s — the pair's two lanes at the peak instant, the label ON the image; the held dyad under it]
#   [the whole Bloom, the two lanes animated, the pair's own recording]
set -euo pipefail
cd "$(dirname "$0")/../../.."   # repo root

OUT=notation/video/renders/demos
TMP=$OUT/tmp
PICK=midi/demo-bloom-heldmax/picked.json
HELD=notation/audio/raw/demo-bloom-heldmax-float.wav
mkdir -p "$TMP"
[ -f "$PICK" ] || { echo "!! missing $PICK — run tools/pick_bloom_takes.js"; exit 1; }
[ -f "$HELD" ] || { echo "!! missing $HELD — render the held dyads"; exit 1; }
# fontfile referenced RELATIVE so the filtergraph never sees a drive colon (the tuba's lesson)
cp -n /c/Windows/Fonts/georgia.ttf "$TMP/georgia.ttf" 2>/dev/null || true
FONT="$TMP/georgia.ttf"

build_pair() {
  local ID=$1 LINE
  LINE=$(node -e "
    const p = require('./$PICK').pairs.find(x => x.id === '$ID'); if (!p) process.exit(3);
    require('fs').writeFileSync('$TMP/$ID-label.txt', p.label);
    console.log([p.parts, p.still.t, p.static.from, p.static.seconds, p.static.gainDb, p.section.t0, p.section.t1, p.section.audio].join(' '));") \
    || { echo "!! no pair '$ID' in $PICK"; exit 1; }
  # shellcheck disable=SC2086
  set -- $LINE
  local PARTS=$1 STILL_T=$2 FROM=$3 SECS=$4 GAIN=$5 T0=$6 T1=$7 WAV=$8
  [ -f "$WAV" ] || { echo "!! missing $WAV"; exit 1; }
  echo "=== $ID · lanes $PARTS · still $STILL_T s · held $FROM+$SECS s at ${GAIN} dB · section $T0–$T1 s · $(cat "$TMP/$ID-label.txt") ==="

  # ---- 1. the still at the peak instant
  local STEM; STEM=$(node -e "console.log('piece-septet_video_t' + (+'$STILL_T').toFixed(3).replace('.', '-'))")
  node tools/export_video.js --ir piece-septet --view video --parts "$PARTS" --probe "$STILL_T" --probeDir "$TMP" | tail -1
  mv -f "$TMP/$STEM.png" "$TMP/$ID-still.png"

  # ---- 2. the static: the label on the still, the held dyad (one plain gain, 20 ms in / 500 ms out so the cuts do not click)
  local FADE_AT; FADE_AT=$(node -e "console.log($SECS - 0.5)")
  ffmpeg -y -v error -loop 1 -framerate 30 -t "$SECS" -i "$TMP/$ID-still.png" -ss "$FROM" -t "$SECS" -i "$HELD" \
    -filter_complex "[0:v]drawtext=textfile=$TMP/$ID-label.txt:fontfile=$FONT:fontsize=58:fontcolor=black:x=70:y=48,format=yuv420p[v];[1:a]volume=${GAIN}dB,afade=t=in:d=0.02,afade=t=out:st=$FADE_AT:d=0.5,aformat=sample_rates=48000:channel_layouts=stereo[a]" \
    -map "[v]" -map "[a]" -c:v libx264 -preset medium -crf 16 -r 30 -c:a aac -b:a 256k -shortest "$TMP/$ID-static.mp4"

  # ---- 3. the section playback (skipped when already rendered, unless FORCE=1)
  if [ ! -f "$TMP/$ID-section.mp4" ] || [ "${FORCE:-0}" = "1" ]; then
    node tools/export_video.js --ir piece-septet --view video --fps 30 --parts "$PARTS" --t0 "$T0" --t1 "$T1" --audio "$WAV" \
      --out "$TMP/$ID-section.mp4" 2>&1 | grep --line-buffered -E "^done|pages" | tail -2
  fi

  # ---- 4. join
  ffmpeg -y -v error -i "$TMP/$ID-static.mp4" -i "$TMP/$ID-section.mp4" \
    -filter_complex "[0:v][0:a][1:v][1:a]concat=n=2:v=1:a=1[v][a]" \
    -map "[v]" -map "[a]" -c:v libx264 -preset medium -crf 16 -pix_fmt yuv420p -c:a aac -b:a 256k -ar 48000 "$OUT/bloom-$ID.mp4"
  echo "=== $OUT/bloom-$ID.mp4 DONE ==="
}

ARG="${1:-}"
case "$ARG" in
  bclvc|vn1va|flvn2) build_pair "$ARG" ;;
  all) for id in flvn2 vn1va bclvc; do build_pair "$id"; done ;;
  *) echo "usage: bloom_demos.sh bclvc|vn1va|flvn2|all"; exit 2 ;;
esac
