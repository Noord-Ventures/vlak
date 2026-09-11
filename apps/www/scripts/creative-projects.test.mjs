import test from "node:test";
import assert from "node:assert/strict";
import { initialSession } from "../app/interfaces/music/engine.ts";
import { parseMusicProject, validateSession } from "../app/interfaces/music/project.ts";
import { makeWallpapers, parseWallpaperProject } from "../app/interfaces/concepts/wallpaper-project.ts";

test("music accepts the canonical envelope and rejects malformed nested limits", () => {
  const session = initialSession();
  const envelope = { schema: "vlak.project", envelopeVersion: 1, kind: "music", documentVersion: 1, payload: session };
  assert.deepEqual(parseMusicProject(envelope), session);
  assert.throws(() => parseMusicProject({ ...session, playing: true }), /unsupported shape/);
  const bad = structuredClone(session);
  bad.tracks[0].clips[0].steps.push(false);
  assert.throws(() => validateSession(bad), /16 booleans/);
  assert.throws(() => parseMusicProject({ ...session, tracks: [] }), /4 tracks/);
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
