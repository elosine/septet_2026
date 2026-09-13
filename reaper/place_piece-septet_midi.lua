-- place_piece-septet_midi.lua — written by tools/export_midi.js (2026-09-13T23:55; RUNNING_LOG §453).
-- Run INSIDE the render project (a copy of the rack): Actions → Show action list → New action → Load ReaScript → this file → Run.
-- Sets the tempo to 60 BPM (the files are 60 BPM / 960 PPQ), then builds each part's MIDI item on the track of the SAME NAME at 0:00 —
-- by name, never by position (piece #4's trap: a duplicated track shifts a positional drop) — directly, with no MIDI import and so
-- no import prompt (tools/reaper_midi_place.js). Undo reverses all of it. tools/render_reaper.js does the same through the bridge.
local function place(tr, name, evt, itemEnd)
  local item = reaper.CreateNewMIDIItemInProj(tr, 0, itemEnd, false)
  local take = reaper.GetActiveTake(item)
  reaper.GetSetMediaItemTakeInfo_String(take, 'P_NAME', name, true)
  local parts, last = {}, 0
  for line in io.lines(evt) do
    local t, st, a, b = line:match('^(%d+) (%d+) (%d+) (%d+)$')
    if t then
      st, a, b = tonumber(st), tonumber(a), tonumber(b)
      local ppq = math.floor(reaper.MIDI_GetPPQPosFromProjTime(take, tonumber(t) / 960) + 0.5)
      local hi = st & 0xF0
      local msg = (hi == 0xC0 or hi == 0xD0) and string.char(st, a) or string.char(st, a, b)
      parts[#parts + 1] = string.pack('<i4Bi4', ppq - last, 0, #msg) .. msg
      last = ppq
    end
  end
  local endppq = math.floor(reaper.MIDI_GetPPQPosFromProjTime(take, itemEnd) + 0.5)
  parts[#parts + 1] = string.pack('<i4Bi4', math.max(0, endppq - last), 0, 3) .. string.char(0xB0, 123, 0)
  reaper.MIDI_SetAllEvts(take, table.concat(parts))
  reaper.MIDI_Sort(take)
  local _, notes, ccs = reaper.MIDI_CountEvts(take)
  return notes, ccs
end
local files = {
  { [[Flute SI2]], [[C:\Users\jwloy\GitHub\septet_2026\midi\piece-septet\01 Flute SI2.evt]], 462 },
  { [[Flute strikes]], [[C:\Users\jwloy\GitHub\septet_2026\midi\piece-septet\02 Flute strikes.evt]], 0 },
  { [[Fluteb SI2]], [[C:\Users\jwloy\GitHub\septet_2026\midi\piece-septet\03 Fluteb SI2.evt]], 44 },
  { [[Bass Clarinet XS]], [[C:\Users\jwloy\GitHub\septet_2026\midi\piece-septet\04 Bass Clarinet XS.evt]], 518 },
  { [[Bass Clarinet XS]], [[C:\Users\jwloy\GitHub\septet_2026\midi\piece-septet\05 Bass Clarinet XS.evt]], 518 },
  { [[BassCl strikes]], [[C:\Users\jwloy\GitHub\septet_2026\midi\piece-septet\06 BassCl strikes.evt]], 0 },
  { [[Piano Kontakt]], [[C:\Users\jwloy\GitHub\septet_2026\midi\piece-septet\07 Piano Kontakt.evt]], 772 },
  { [[PianoPlucked Kontakt]], [[C:\Users\jwloy\GitHub\septet_2026\midi\piece-septet\08 PianoPlucked Kontakt.evt]], 772 },
  { [[PianoMute PP2]], [[C:\Users\jwloy\GitHub\septet_2026\midi\piece-septet\09 PianoMute PP2.evt]], 772 },
  { [[PianoHarm PP2]], [[C:\Users\jwloy\GitHub\septet_2026\midi\piece-septet\10 PianoHarm PP2.evt]], 772 },
  { [[Vn1 XS]], [[C:\Users\jwloy\GitHub\septet_2026\midi\piece-septet\11 Vn1 XS.evt]], 487 },
  { [[Vn2 XS]], [[C:\Users\jwloy\GitHub\septet_2026\midi\piece-septet\12 Vn2 XS.evt]], 485 },
  { [[Va XS]], [[C:\Users\jwloy\GitHub\septet_2026\midi\piece-septet\13 Va XS.evt]], 500 },
  { [[Vc XS]], [[C:\Users\jwloy\GitHub\septet_2026\midi\piece-septet\14 Vc XS.evt]], 537 },
}
reaper.Undo_BeginBlock()
reaper.PreventUIRefresh(1)
reaper.SetCurrentBPM(0, 60, true)
local used, report, bad = {}, {}, 0
for _, f in ipairs(files) do
  local target, targetIdx = nil, nil
  for i = 0, reaper.CountTracks(0) - 1 do
    local tr = reaper.GetTrack(0, i)
    local _, name = reaper.GetTrackName(tr)
    if name == f[1] and not used[i] then target = tr; targetIdx = i; used[i] = true; break end
  end
  if not target then
    bad = bad + 1; report[#report + 1] = "NO TRACK named " .. f[1]
  else
    local before = reaper.CountTrackMediaItems(target)
    local okp, notes = pcall(place, target, f[1], f[2], 633.117)
    if okp and reaper.CountTrackMediaItems(target) == before + 1 and notes == f[3] then report[#report + 1] = "ok  " .. f[1] .. "  (" .. notes .. " notes)"
    else bad = bad + 1; report[#report + 1] = "FAILED  " .. f[1] .. "  " .. tostring(notes) .. " of " .. f[3] .. " notes" end
  end
end
reaper.SetEditCurPos(0, false, false)
reaper.PreventUIRefresh(-1)
reaper.UpdateArrange()
reaper.Undo_EndBlock("Place piece-septet MIDI (60 BPM, by track name)", -1)
reaper.ShowMessageBox((bad == 0 and "All parts placed at 0:00, tempo 60 BPM.\n\n" or (bad .. " PROBLEM(S) — see below.\n\n")) .. table.concat(report, "\n"), "piece-septet MIDI", 0)
