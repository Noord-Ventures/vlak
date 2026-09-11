import test from "node:test";
import assert from "node:assert/strict";
import { initialSession } from "../app/interfaces/music/engine.ts";
import { parseMusicProject, validateSession } from "../app/interfaces/music/project.ts";
import { makeWallpapers, parseWallpaperProject } from "../app/interfaces/concepts/wallpaper-project.ts";

test("music accepts the canonical envelope and rejects malformed nested limits", () => {
  const session = initialSession();
  const clipIds = session.tracks.flatMap(track => track.clips.map(clip => clip.id));
  assert.equal(clipIds.length, 16); assert.equal(new Set(clipIds).size, 16);
  const envelope = { schema: "vlak.project", envelopeVersion: 1, kind: "music", documentVersion: 1, payload: session };
  assert.deepEqual(parseMusicProject(envelope), session);
  assert.throws(() => parseMusicProject({ ...session, playing: true }), /unsupported shape/);
  const bad = structuredClone(session);
  bad.tracks[0].clips[0].steps.push(false);
  assert.throws(() => validateSession(bad), /16 booleans/);
  const duplicate = structuredClone(session);
  duplicate.tracks[1].clips[0].id = duplicate.tracks[0].clips[0].id;
  assert.throws(() => validateSession(duplicate), /clip IDs must be unique/);
  assert.throws(() => parseMusicProject({ ...session, tracks: [] }), /4 tracks/);
});

test("legacy music clips receive deterministic IDs that remain stable through edits and envelopes", () => {
  const canonical = initialSession();
  const legacy = structuredClone(canonical);
  for (const track of legacy.tracks) for (const clip of track.clips) delete clip.id;
  const migrated = parseMusicProject(legacy);
  assert.deepEqual(migrated, canonical);
  assert.deepEqual(parseMusicProject(structuredClone(legacy)), migrated, "raw legacy migration is deterministic");
  assert.deepEqual(parseMusicProject({ schema: "vlak.project", envelopeVersion: 1, kind: "music", documentVersion: 1, payload: legacy }), migrated, "legacy envelope migration is deterministic");
  const edited = structuredClone(migrated);
  edited.tracks[0].clips[0].name = "Renamed rhythm";
  edited.tracks[0].clips[0].steps[1] = !edited.tracks[0].clips[0].steps[1];
  assert.equal(parseMusicProject(edited).tracks[0].clips[0].id, migrated.tracks[0].clips[0].id, "editing does not regenerate clip identity");
  edited.tracks[0].clips.reverse();
  assert.deepEqual(parseMusicProject(edited).tracks[0].clips.map(clip => clip.id), edited.tracks[0].clips.map(clip => clip.id), "reordering keeps IDs attached to clips");
});

test("wallpaper generation is deterministic and the parser rejects SVG-shaped imports", () => {
  const first = makeWallpapers("quiet field", 42, 3);
  assert.deepEqual(makeWallpapers("quiet field", 42, 3), first);
  const payload = { prompt: "quiet field", variation: 42, generation: 3, selected: 0, format: "desktop", results: first, generatorVersion: 1, rendererVersion: 1 };
  assert.deepEqual(parseWallpaperProject({ schema: "vlak.project", envelopeVersion: 1, kind: "wallpaper", documentVersion: 1, payload }), payload);
  assert.throws(() => parseWallpaperProject({ ...payload, results: [{ svg: "<svg />" }, ...first.slice(1)] }), /unsupported/);
  assert.throws(() => parseWallpaperProject({ ...payload, generation: 1_000_001 }), /unsupported payload values/);
  assert.throws(() => parseWallpaperProject({ ...payload, generatorVersion: 2 }), /unsupported generator/);
  assert.throws(() => parseWallpaperProject({ ...payload, results: [{ ...first[0], id: first[1].id }, ...first.slice(1)] }), /IDs must be unique/);
  assert.throws(() => parseWallpaperProject({ ...payload, results: [{ ...first[0], horizon: Number.NaN }, ...first.slice(1)] }), /out of range/);
  const legacy = { prompt: payload.prompt, variation: payload.variation, generation: payload.generation, selected: payload.selected, format: payload.format, results: payload.results };
  assert.equal(parseWallpaperProject(legacy).generatorVersion, 1, "legacy payloads take the explicit migration path");
});
