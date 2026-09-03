// Rendering-recipe config — septet 2026 (PLAN 0b skeleton, 2026-09-03; PLAN 0c fills it in).
//
// One entry per TRACK (score/public/composer.html TRACKS[].instKey). Schema, inherited from
// pieces #3/#4: { label, port, rangeLow, rangeHigh, mechanism?, techniques: [{ key, label,
// channel, port?, cc0?, ks?, rangeLow?, rangeHigh? }] }.
//   - `port` is the loopMIDI port (case-exact); a technique's own `port` overrides it — the
//     overflow-instance pattern for UVI instruments with more than 16 techniques (piece #4).
//   - `channel` is 1-based. `cc0` = Xsample articulation select, sent as a prelude before the
//     note (piece #3's mechanism, kept in the app: composer.html sends CC#0 wherever tech.cc0
//     is set). `ks` = keyswitch notes. `oneShot: true` marks Xsample presets that revert to
//     the base mode after one note (piece #1's cc_mapping_registry state rules).
//   - Ranges are MIDI numbers, middle C = 60. Per-technique ranges override the instrument's.
//
// STATUS: every channel number and range below is PROVISIONAL until PLAN 0e (the rack build)
// and 0c (the recipes) confirm it against the actual UVI / Kontakt builds. Sources per entry.
// Libraries (journal D7): SI2 flute · Xsample bass clarinet · 8Dio Steinway + IRCAM Prepared
// Piano 2 · Xsample Contemporary Solo Strings.
const INSTRUMENTS = {
  // ---- FLUTE — IRCAM Solo Instruments 2 "Flute in C" (UVI, channel-per-technique) ----
  // Technique roster = the SI2 manual's list (28). 16 on the primary instance "Flute", the rest
  // on an overflow instance "Fluteb" (the piece #4 tuba pattern). ORDER IS PROVISIONAL: the
  // composer's UVI slot order is the ground truth, transcribed at 0e as for the tubas.
  // Range: SI2 gives C4–C7 (+), B3 with the extension -> MIDI 59–96. Piccolo / bass flute are
  // NOT here yet — undecided (journal D6, CN-2); they enter as switch techniques on this track.
  flute: {
    label: "Flute",
    port: "Flute",
    rangeLow: 59,
    rangeHigh: 96,
    techniques: [
      { key: "ord",              label: "Ordinario",                    channel: 1 },
      { key: "staccato",         label: "Staccato",                     channel: 2 },
      { key: "sforzando",        label: "Sforzando",                    channel: 3 },
      { key: "flz",              label: "Flatterzunge",                 channel: 4 },
      { key: "flz_to_ord",       label: "Flatterzunge to Ordinario",    channel: 5 },
      { key: "ord_to_flz",       label: "Ordinario to Flatterzunge",    channel: 6 },
      { key: "aeolian",          label: "Aeolian",                      channel: 7 },
      { key: "aeolian_to_ord",   label: "Aeolian to Ordinario",         channel: 8 },
      { key: "ord_to_aeolian",   label: "Ordinario to Aeolian",         channel: 9 },
      { key: "cresc",            label: "Crescendo",                    channel: 10 },
      { key: "decresc",          label: "Decrescendo",                  channel: 11 },
      { key: "cresc_decresc",    label: "Crescendo to Decrescendo",     channel: 12 },
      { key: "key_click",        label: "Key Click",                    channel: 13 },
      { key: "tongue_ram",       label: "Tongue Ram",                   channel: 14 },
      { key: "pizzicato",        label: "Pizzicato",                    channel: 15 },
      { key: "jet_whistle",      label: "Jet Whistle",                  channel: 16 },
      // overflow instance "Fluteb" (port Fluteb): slots restart at A1
      { key: "harmonic_fing",    label: "Harmonic Fingering",           channel: 1,  port: "Fluteb" },
      { key: "discolored_fing",  label: "Discolored Fingering",         channel: 2,  port: "Fluteb" },
      { key: "whistle_tones",    label: "Whistle Tones",                channel: 3,  port: "Fluteb" },
      { key: "whistle_sweep",    label: "Whistle Tones Sweeping",       channel: 4,  port: "Fluteb" },
      { key: "play_sing",        label: "Play and Sing",                channel: 5,  port: "Fluteb" },
      { key: "play_sing_unison", label: "Play and Sing Unison",         channel: 6,  port: "Fluteb" },
      { key: "trill_m2",         label: "Trill minor 2nd up",           channel: 7,  port: "Fluteb" },
      { key: "trill_M2",         label: "Trill major 2nd up",           channel: 8,  port: "Fluteb" },
      { key: "chrom_scale",      label: "Chromatic Scale",              channel: 9,  port: "Fluteb" },
      { key: "ord_1q",           label: "Ordinario quarter-tone",       channel: 10, port: "Fluteb" },
      { key: "aeolian_and_ord",  label: "Aeolian and Ordinario",        channel: 11, port: "Fluteb" },
      { key: "note_durations",   label: "Note Durations",               channel: 12, port: "Fluteb" },
    ],
  },

  // ---- BASS CLARINET — Xsample (Kontakt), CC#0 selects the preset (preset N => CC#0 N-1) ----
  // Copied from piece #3 sandbox/instruments.js `bass_clarinet_xs` (its 13 starter presets);
  // the deep map is #3/docs/XSAMPLE_BASSCL_map.md. Floor rule: never send below MIDI 34.
  bass_clarinet: {
    label: "Bass Clarinet",
    port: "BassCl",
    rangeLow: 34,   // floor rule: never send below MIDI 34 (keyswitch/function zone)
    rangeHigh: 65,  // standard zone per XSAMPLE_BASSCL_map §6d
    mechanism: "cc0",
    techniques: [
      { key: "senza_mw",    label: "Senza Vibrato MW (#1)",         channel: 1, cc0: 0 },
      { key: "flutter_mw",  label: "Flutter Tongue MW (#5)",        channel: 1, cc0: 4 },
      { key: "slap",        label: "Slap Tongue (#6)",              channel: 1, cc0: 5 },
      { key: "gliss_undef", label: "Glissando Undefined (#7)",      channel: 1, cc0: 6, rangeLow: 34, rangeHigh: 42 },
      { key: "key_noises",  label: "Key Noises (#9)",               channel: 1, cc0: 8 },
      { key: "mp_short",    label: "Multiphonics short (#10)",      channel: 1, cc0: 9,  rangeLow: 34, rangeHigh: 46 },
      { key: "air_noises",  label: "Air Noises (#11)",              channel: 1, cc0: 10 },
      { key: "cresc",       label: "Crescendo (#12)",               channel: 1, cc0: 11 },
      { key: "morph_vxmw",  label: "Senza+Flutter Vel×MW (#15)",    channel: 1, cc0: 14 },
      { key: "flutter_vel", label: "Flutter Tongue Velocity (#16)", channel: 1, cc0: 15 },
      { key: "triple16",    label: "Triple Tongue 16T (#18)",       channel: 1, cc0: 17 },
      { key: "mp_loop",     label: "Multiphonics looping (#22)",    channel: 1, cc0: 21, rangeLow: 34, rangeHigh: 46 },
      { key: "flutter_lock",label: "Flutter LOCK bright (#34)",     channel: 1, cc0: 33 },
    ],
  },

  // ---- PIANO — 8Dio Steinway Grand (Kontakt) + IRCAM Prepared Piano 2 (UVI) on ONE port ----
  // From piece #2 docs/instrument_map.json (port "Piano1", channels 1–5): main ch 1 (velocity,
  // CC64 pedal) · harmonics ch 3 (+ch 4 second layer; CC21 pitch shift, 19.048 cents/step,
  // 85 ms CC lead; sounding cap MIDI 101) · muted ch 5. Preparations are TECHNIQUES of one
  // piano track. Plucked piano had no library in #2 ("TBD") — not listed until it has one.
  piano: {
    label: "Piano",
    port: "Piano",
    rangeLow: 21,
    rangeHigh: 108,
    techniques: [
      { key: "main",      label: "Steinway (8Dio)",                  channel: 1 },
      { key: "harmonics", label: "Harmonics (Prepared Piano 2)",     channel: 3, rangeLow: 21, rangeHigh: 77 },
      { key: "muted",     label: "Muted strings (Prepared Piano 2)", channel: 5 },
    ],
  },

  // ---- STRINGS — Xsample Contemporary Solo Strings (Kontakt), CC#0 articulation select ----
  // Values from piece #1 docs/cc_mapping_registry.json (the quartet's proven set): persistent
  // modes (arco senza vib 89, pizz 95) and one-shots that revert to the base mode after one
  // note (pizz open 71, Bartók 97, molto vib arco 2 / pizz 70, open string arco 6, behind the
  // bridge pizz 80). Gliss keyswitches (B0 mode, G#1 down, A1 up) and CC68/24 legato come in
  // at 0c. Ranges: SI2 manual's sounding ranges as placeholders (vn G3–G7, va C3–C6, vc C2–C6)
  // — Xsample's own ranges are read off the GUI at 0e. Channel banks return only if PLAN 0d
  // finds CC7 state must be isolated (the quartet's three-bank workaround).
  violin1: { label: "Violin 1", port: "Vn1", rangeLow: 55, rangeHigh: 103, mechanism: "cc0", techniques: xsStringTechs() },
  violin2: { label: "Violin 2", port: "Vn2", rangeLow: 55, rangeHigh: 103, mechanism: "cc0", techniques: xsStringTechs() },
  viola:   { label: "Viola",    port: "Va",  rangeLow: 48, rangeHigh: 84,  mechanism: "cc0", techniques: xsStringTechs() },
  cello:   { label: "Cello",    port: "Vc",  rangeLow: 36, rangeHigh: 84,  mechanism: "cc0", techniques: xsStringTechs() },
};

// One roster for the four Xsample strings (fresh arrays per instrument so per-instrument
// edits at 0c never bleed across). Hoisted function declaration, so the table above may use it.
function xsStringTechs() {
  return [
    { key: "arco",           label: "Arco senza vib. (CC0 89)",         channel: 1, cc0: 89 },
    { key: "pizz",           label: "Pizzicato (CC0 95)",               channel: 1, cc0: 95 },
    { key: "pizz_open",      label: "Pizz. open string (CC0 71)",       channel: 1, cc0: 71, oneShot: true },
    { key: "bartok",         label: "Bartok pizz. (CC0 97)",            channel: 1, cc0: 97, oneShot: true },
    { key: "molto_vib_arco", label: "Molto vibrato, arco (CC0 2)",      channel: 1, cc0: 2,  oneShot: true },
    { key: "molto_vib_pizz", label: "Molto vibrato, pizz (CC0 70)",     channel: 1, cc0: 70, oneShot: true },
    { key: "open_arco",      label: "Open string, arco (CC0 6)",        channel: 1, cc0: 6,  oneShot: true },
    { key: "bb_pizz",        label: "Behind the bridge pizz (CC0 80)",  channel: 1, cc0: 80, oneShot: true },
  ];
}

// Hardware capture input. Keystation 88 MK3 exposes "Keystation 88 MK3" (keys) and
// "MIDIIN2 (Keystation 88 MK3)" (DAW control - never bind). See piece #3's SAMPLER_QUIRKS.md.
const INPUT_MATCH = /keystation/i;
const INPUT_EXCLUDE = /^MIDIIN\d+/i;
