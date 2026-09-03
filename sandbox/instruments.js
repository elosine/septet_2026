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
  // ---- FLUTE — IRCAM Solo Instruments 2 "Flute in C" (UVI, one part per PRESET) ----
  // Re-rostered 2026-09-03 (PLAN 0e R3, RUNNING_LOG §20). The composer's UVI browser shows 19
  // Flute presets: 10 single-technique patches and 9 "KS" patches holding 2–3 techniques each,
  // chosen by a keyswitch note (SI2 manual pp. 10–12, "Layers & Keyswitches – Flute"). One UVI
  // part per PRESET, loaded in the browser's alphabetical order: 16 on "Flute" (A1–A16), the last
  // three on "Fluteb" (A1–A3; 13 slots free for the curve copies of 0c.7). A technique KEY names
  // what the player does; `preset` names the UVI patch; a KS mode carries `ks` = the switch note
  // the prelude latches before the note (`tech.ks`, wired at 0c.7 — until then the object's own
  // `ksNote`, the tuba path). KEYSWITCH NUMBERS: the manual's note names are scientific (C4 = 60),
  // but the FLUTE's switches sit an octave above the tuba's: the composer's UVI screenshot at R3
  // (A1, Aeolian KS) shows the red key at display C1 = MIDI 36, just under the tan extended range
  // that starts at C#1 — SI2 puts each instrument's KS zone under its own range. So manual C1 → 36,
  // C#1 → 37, D1 → 38; Durations KS (manual C2/C#2) → 48/49. Each KS preset is checked on its red
  // keys as it loads. Range: sounding C4–C7, B3 with the extension
  // → MIDI 59–96 (manual p. 51); per-preset ranges are read from the UVI GUI at 0c, never
  // ear-scanned. Multiphonics Menu: one multiphonic per key, display C3–F5 = MIDI 60–89 (manual
  // "FLUTE Multiphonics"). Piccolo / bass flute are NOT here yet — undecided (D6; CN-2, CN-4).
  flute: {
    label: "Flute",
    port: "Flute",
    rangeLow: 59,
    rangeHigh: 96,
    techniques: [
      // A1 · Flute Aeolian KS
      { key: "aeolian_and_ord", label: "Aeolian & Ordinario",        preset: "Flute Aeolian KS",            channel: 1,  ks: 36, rangeLow: 60, rangeHigh: 83 },   // native C3–B4 (UVI) = MIDI 60–83; tan extension 37–59 and 84+ (screenshot 2026-09-03)
      { key: "aeolian",         label: "Aeolian",                    preset: "Flute Aeolian KS",            channel: 1,  ks: 37, rangeLow: 60, rangeHigh: 83 },   // C#1 red? — composer to confirm (manual: second switch)
      // A2 · Flute Chromatic Scale
      { key: "chrom_scale",     label: "Chromatic Scale",            preset: "Flute Chromatic Scale",       channel: 2,  rangeLow: 48, rangeHigh: 96 },   // A2 screenshot: white C2→ past C5 (right end cut; 96 = the instrument top, provisional); no red keys; purple at C3 + C4 — meaning not in the manual legend; no tan
      // A3 · Flute Cresc & Decrescendo KS
      { key: "cresc",           label: "Crescendo",                  preset: "Flute Cresc & Decrescendo KS", channel: 3, ks: 36, rangeLow: 60, rangeHigh: 96 },   // A3 screenshot: red C1 + C#1; white C3→C6 and beyond (cut ~D6); grey below C3, no tan
      { key: "cresc_decresc",   label: "Crescendo to Decrescendo",   preset: "Flute Cresc & Decrescendo KS", channel: 3, ks: 37, rangeLow: 60, rangeHigh: 96 },
      { key: "decresc",         label: "Decrescendo",                preset: "Flute Cresc & Decrescendo KS", channel: 3, ks: 38, rangeLow: 60, rangeHigh: 96 },   // D1 looked GREY in the A3 screenshot, not red — the manual's third switch; verify by pressing it
      // A4 · Flute Durations KS (fixed-length notes; manual: C2 / C#2)
      { key: "dur_0_5s",        label: "Duration 0.5 s",             preset: "Flute Durations KS",          channel: 4,  ks: 48, rangeLow: 60, rangeHigh: 96 },   // A4 screenshot: red C2 (48) ✓ manual; C#2 looked black (second switch unconfirmed); white C3→C6+, grey below, no tan
      { key: "dur_1s",          label: "Duration 1 s",               preset: "Flute Durations KS",          channel: 4,  ks: 49, rangeLow: 60, rangeHigh: 96 },   // C#2 — verify (not red on screen)
      // A5 · Flute FX KS
      { key: "jet_whistle",     label: "Jet Whistle",                preset: "Flute FX KS",                 channel: 5,  ks: 36, rangeLow: 48, rangeHigh: 83 },   // A5 screenshot: red C1 + C#1; tan D1–B1 (38–47) and C5+ (84+); white C2–B4 native; PURPLE C4
      { key: "key_click",       label: "Key Click",                  preset: "Flute FX KS",                 channel: 5,  ks: 37, rangeLow: 48, rangeHigh: 83 },
      { key: "tongue_ram",      label: "Tongue Ram",                 preset: "Flute FX KS",                 channel: 5,  ks: 38, rangeLow: 48, rangeHigh: 83 },   // D1 is TAN on screen, not red — the manual's third switch (tongue ram); verify by pressing
      // A6 · Flute Finger Modes KS
      { key: "harmonic_fing",   label: "Harmonic Fingering",         preset: "Flute Finger Modes KS",       channel: 6,  ks: 36, rangeLow: 79, rangeHigh: 96 },   // A6 screenshot: red C1; white only from ≈G4 (display) → C6+ = MIDI ≈79–96 (upper register); grey elsewhere, no tan
      { key: "discolored_fing", label: "Discolored Fingering",       preset: "Flute Finger Modes KS",       channel: 6,  ks: 37, rangeLow: 79, rangeHigh: 96 },   // C#1 not red on screen — verify
      // A7 · Flute Flatterzunge
      { key: "flz",             label: "Flatterzunge",               preset: "Flute Flatterzunge",          channel: 7,  rangeLow: 60, rangeHigh: 96 },   // A7 screenshot: no red keys; white C3→C6 (60–96), grey beyond C6 — the top is C6 display = MIDI 96; no tan
      // A8 · Flute Fortepiano
      { key: "fortepiano",      label: "Fortepiano",                 preset: "Flute Fortepiano",            channel: 8,  rangeLow: 60, rangeHigh: 96 },   // A8 screenshot: no red keys; white C3→C6 (60–96), grey beyond; no tan
      // A9 · Flute Multiphonics Menu (one multiphonic per key)
      { key: "multiphonics",    label: "Multiphonics Menu",          preset: "Flute Multiphonics Menu",     channel: 9,  rangeLow: 60, rangeHigh: 89 },   // A9 screenshot: no red keys; white C3→F5 DISPLAY = MIDI 60–89, one multiphonic per key (30, = the manual's table C3..F5 read as display names); tan below C3 and above F5
      // A10 · Flute Ord & Aeolian KS (the two transitions)
      { key: "ord_to_aeolian",  label: "Ordinario to Aeolian",       preset: "Flute Ord & Aeolian KS",      channel: 10, ks: 36, rangeLow: 60, rangeHigh: 96 },   // A10 screenshot: red C1; C#1 not red; white C3→C6 (60–96); grey elsewhere, no tan
      { key: "aeolian_to_ord",  label: "Aeolian to Ordinario",       preset: "Flute Ord & Aeolian KS",      channel: 10, ks: 37, rangeLow: 60, rangeHigh: 96 },   // C#1 — verify
      // A11 · Flute Ord & Flatterzunge KS (the two transitions)
      { key: "ord_to_flz",      label: "Ordinario to Flatterzunge",  preset: "Flute Ord & Flatterzunge KS", channel: 11, ks: 36, rangeLow: 60, rangeHigh: 96 },   // A11 screenshot: as A10 — red C1, white C3→C6, grey elsewhere
      { key: "flz_to_ord",      label: "Flatterzunge to Ordinario",  preset: "Flute Ord & Flatterzunge KS", channel: 11, ks: 37, rangeLow: 60, rangeHigh: 96 },   // C#1 — verify
      // A12 · Flute Ordinario
      { key: "ord",             label: "Ordinario",                  preset: "Flute Ordinario",             channel: 12, rangeLow: 60, rangeHigh: 96 },   // A12 screenshot: no red keys; white C3→C6 (60–96); B2 grey (the manual's B3 extension is not in this patch); no tan
      // A13 · Flute Pizzicato
      { key: "pizzicato",       label: "Pizzicato",                  preset: "Flute Pizzicato",             channel: 13, rangeLow: 60, rangeHigh: 84 },   // A13 screenshot: no red keys; white C3→C5 native (60–84); tan below C3 and above C5 (stretched)
      // A14 · Flute Play & Sing KS
      { key: "play_sing",       label: "Play and Sing (sung C4)",    preset: "Flute Play & Sing KS",        channel: 14, ks: 36, rangeLow: 60, rangeHigh: 96 },   // A14 screenshot: red C1; C#1 not red; tan C#1–B2 (37–59) below; white from C3 (60), right end cut in the frame (top provisional 96)
      { key: "play_sing_unison",label: "Play and Sing Unison",       preset: "Flute Play & Sing KS",        channel: 14, ks: 37, rangeLow: 60, rangeHigh: 96 },   // C#1 — verify
      // A15 · Flute Quartertones Ordinario
      { key: "ord_1q",          label: "Ordinario quarter-tone",     preset: "Flute Quartertones Ordinario", channel: 15, rangeLow: 60, rangeHigh: 96 },   // A15 screenshot: no red keys; white C3→C6 (60–96), grey elsewhere, no tan. Which quarter-tone each key sounds (above? below?) — 0c, by ear
      // A16 · Flute Sforzando
      { key: "sforzando",       label: "Sforzando",                  preset: "Flute Sforzando",             channel: 16, rangeLow: 60, rangeHigh: 96 },   // A16 screenshot: no red keys; white C3→C6 (60–96); grey elsewhere, no tan
      // ---- second instance "Fluteb" (A1–A3) ----
      { key: "staccato",        label: "Staccato",                   preset: "Flute Staccato",              port: "Fluteb", channel: 1, rangeLow: 60, rangeHigh: 96 },   // Fluteb A1 screenshot: no red keys; white C3→C6 (60–96) native; tan below C3 and above C6 (stretched)
      { key: "trill_m2",        label: "Trill minor 2nd",            preset: "Flute Trills KS",             port: "Fluteb", channel: 2, ks: 36, rangeLow: 60, rangeHigh: 96 },   // Fluteb A2 screenshot: red C1; C#1 not red; white C3→C6 (60–96); grey elsewhere, no tan
      { key: "trill_M2",        label: "Trill major 2nd",            preset: "Flute Trills KS",             port: "Fluteb", channel: 2, ks: 37, rangeLow: 60, rangeHigh: 96 },   // C#1 — verify
      { key: "whistle_tones",   label: "Whistle Tones",              preset: "Flute Whistle Tones",         port: "Fluteb", channel: 3, rangeLow: 48, rangeHigh: 84 },   // Fluteb A3 screenshot: no red keys; white C2→C5 (48–84) native; tan below C2 and above C5
    ],
  },
  // ---- BASS CLARINET — Xsample (Kontakt), CC#0 selects the preset (preset N => CC#0 N-1) ----
  // THE KEYSWITCH ZONE, decoded 2026-09-03 at R5 from the composer's Kontakt screenshots + the AIL
  // Extended Scripting manual (#3 docs/manuals/extracted/Xsample_AIL_Extended_Scripting.txt, pp. 3, 8, 22).
  // Manual names are scientific (C4 = 60); Kontakt DISPLAYS one octave lower (C3 = 60). MIDI numbers:
  //   21 22 23  (Kontakt A-1 A#-1 B-1, GREEN)  velocity-sensitive function keys — LOW velocity: select
  //             Key Switch Bank 1 / 2 / 3; HIGH velocity: A-1 = Tune Base Note mode, A#-1 = Toggle
  //             Switch mode, B-1 = Trill & Slide mode.
  //   24–33     (Kontakt C0–A0, RED) 10 key switches per bank, 3 banks = 30 preset slots (Store KS).
  //   Tune Base Note mode: keys 22–33 set the base note of the current tuning (pure tunings).
  //   Toggle Switch mode (or CC#0 121): MAGENTA keys 28–33 (E0–A0) toggle sound slots 1–6 on/off
  //             (the <1>/<0> row above the slots); 24–27 stay key switches.
  //   Trill & Slide mode (or CC#0 122): 27 (D#0) half-tone trill · 28 (E0) whole-tone trill (aftertouch =
  //             speed) · 29 (F0, yellow) slot round-robin counter reset · 30 slide down / 31 slide up
  //             (release switch) · 32 slide down / 33 slide up (legato); 24–26 stay key switches.
  //   Preset Mode off = Phrase Mode on (button, blue A#7, or CC#0 126/127): the yellow keys play the
  //             Phrase Designer's phrases (monophonic).
  // CC#0 covers all of it without a key: 0–87 presets 1–88 · 88–117 keyswitch-bank presets 1–30 ·
  //   118/119/120 bank 1/2/3 · 121 toggle mode · 122 slide & trill mode · 126/127 preset/phrase mode;
  //   round robin by CC#82 (0–20 on repetition · 21–41 off · 42–62 random · 63–83 always).
  // THE FLOOR RULE follows: playable A#0–F4 on the display = MIDI 34–65; nothing below 34 is ever sent
  //   as a note (21–33 are switches and function keys). Candidate techniques for 0c: the two trills and
  //   the four slides — CC#0 122 + the function key, then CC#0 118 to leave the mode.
  // Copied from piece #3 sandbox/instruments.js `bass_clarinet_xs` (its 13 starter presets);
  // the deep map is #3/docs/XSAMPLE_BASSCL_map.md. Floor rule: never send below MIDI 34.
  bass_clarinet: {
    label: "Bass Clarinet",
    port: "BassCl",
    rangeLow: 34,   // floor rule: never send below MIDI 34 (keyswitch/function zone)
    rangeHigh: 65,  // standard zone per XSAMPLE_BASSCL_map §6d
    mechanism: "cc0",
    techniques: [
      { key: "senza_mw",    label: "Senza Vibrato MW (#1)",         channel: 1, cc0: 0, rangeLow: 34, rangeHigh: 65 },   // GUI low A#0 / high F4 (composer screenshot, R5)
      { key: "natural_vib_mw", label: "Natural Vibrato MW (#2)",    channel: 1, cc0: 1, rangeLow: 34, rangeHigh: 65 },   // GUI A#0–F4 (screenshot, R5); the sampled vibrato, vs the curve-channel CC4 width
      { key: "flutter_mw",  label: "Flutter Tongue MW (#5)",        channel: 1, cc0: 4, rangeLow: 34, rangeHigh: 60 },   // GUI high C4 — the flutters stop a fourth short (screenshot, R5)
      { key: "slap",        label: "Slap Tongue (#6)",              channel: 1, cc0: 5, rangeLow: 34, rangeHigh: 65 },   // #3 map §6d, GUI-read 2026-08-08
      { key: "gliss_undef", label: "Glissando Undefined (#7)",      channel: 1, cc0: 6, rangeLow: 34, rangeHigh: 42 },
      { key: "key_noises",  label: "Key Noises (#9)",               channel: 1, cc0: 8, rangeLow: 34, rangeHigh: 65 },   // #3 map §6d
      { key: "mp_short",    label: "Multiphonics short (#10)",      channel: 1, cc0: 9,  rangeLow: 34, rangeHigh: 46 },
      { key: "air_noises",  label: "Air Noises (#11)",              channel: 1, cc0: 10, rangeLow: 34, rangeHigh: 65 },   // GUI A#0–F4 (screenshot, R5) + #3 map
      { key: "cresc",       label: "Crescendo (#12)",               channel: 1, cc0: 11, rangeLow: 34, rangeHigh: 65 },   // #3 map §6d
      { key: "morph_vxmw",  label: "Senza+Flutter Vel×MW (#15)",    channel: 1, cc0: 14, rangeLow: 34, rangeHigh: 60 },   // GUI high C4 (screenshot, R5) — the flutter layer caps it, like #5 / #16
      { key: "flutter_vel", label: "Flutter Tongue Velocity (#16)", channel: 1, cc0: 15, rangeLow: 34, rangeHigh: 60 },   // GUI high C4 (screenshot, R5)
      { key: "triple16",    label: "Triple Tongue 16T (#18)",       channel: 1, cc0: 17, rangeLow: 34, rangeHigh: 65 },   // #3 map §6d
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
