import type { Session, Track, Clip } from "./engine.ts";

const keys = (value: object) => Object.keys(value).sort();
const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === "object" && value !== null && !Array.isArray(value);
const finite = (value: unknown): value is number => typeof value === "number" && Number.isFinite(value);
function exact(value: object, allowed: string[]) { return keys(value).every(key => allowed.includes(key)); }
function fail(message: string): never { throw new Error(`Invalid music project: ${message}`); }

function readClip(value: unknown, path: string): Clip {
  if (!isRecord(value) || !exact(value, ["name", "root", "steps"])) fail(`${path} is not a clip`);
  if (typeof value.name !== "string" || value.name.length > 48) fail(`${path}.name is invalid`);
  if (!finite(value.root) || !Number.isInteger(value.root) || value.root < 36 || value.root > 60) fail(`${path}.root is invalid`);
  if (!Array.isArray(value.steps) || value.steps.length !== 16 || value.steps.some(step => typeof step !== "boolean")) fail(`${path}.steps must contain 16 booleans`);
  return { name: value.name, root: value.root, steps: [...value.steps] };
}

function readTrack(value: unknown, index: number): Track {
  if (!isRecord(value) || !exact(value, ["active", "channel", "clips", "id", "instrument", "name", "tone"])) fail(`tracks[${index}] has an unsupported shape`);
  if (typeof value.id !== "string" || !value.id || value.id.length > 64 || typeof value.name !== "string" || value.name.length > 48) fail(`tracks[${index}] identity is invalid`);
  if (!(["kick", "hat", "bass", "keys"] as const).includes(value.instrument as never)) fail(`tracks[${index}].instrument is invalid`);
  if (!Number.isInteger(value.active) || (value.active as number) < 0 || (value.active as number) > 3) fail(`tracks[${index}].active is invalid`);
  if (!finite(value.tone) || value.tone < 0 || value.tone > 100) fail(`tracks[${index}].tone is invalid`);
  if (!isRecord(value.channel) || !exact(value.channel, ["gain", "muted", "pan", "solo"])) fail(`tracks[${index}].channel is invalid`);
  if (!finite(value.channel.gain) || value.channel.gain < -60 || value.channel.gain > 12 || !finite(value.channel.pan) || value.channel.pan < -100 || value.channel.pan > 100 || typeof value.channel.muted !== "boolean" || typeof value.channel.solo !== "boolean") fail(`tracks[${index}].channel values are invalid`);
  if (!Array.isArray(value.clips) || value.clips.length !== 4) fail(`tracks[${index}].clips must contain 4 clips`);
  return { id: value.id, name: value.name, instrument: value.instrument as Track["instrument"], active: value.active as number, tone: value.tone as number, channel: { gain: value.channel.gain as number, pan: value.channel.pan as number, muted: value.channel.muted as boolean, solo: value.channel.solo as boolean }, clips: value.clips.map((clip, clipIndex) => readClip(clip, `tracks[${index}].clips[${clipIndex}]`)) };
}

export function validateSession(value: unknown): Session {
  if (!isRecord(value) || !exact(value, ["name", "tempo", "tracks"])) fail("session has an unsupported shape");
  if (typeof value.name !== "string" || value.name.length > 48) fail("name is invalid");
  if (!finite(value.tempo) || value.tempo < 60 || value.tempo > 180) fail("tempo must be between 60 and 180");
  if (!Array.isArray(value.tracks) || value.tracks.length !== 4) fail("tracks must contain 4 tracks");
  const tracks = value.tracks.map(readTrack);
  if (new Set(tracks.map(track => track.id)).size !== 4) fail("track IDs must be unique");
  return { name: value.name, tempo: value.tempo, tracks };
}

export function parseMusicProject(value: unknown): Session {
  if (!isRecord(value)) fail("project must be an object");
  if (value.schema === "vlak.project" && value.kind === "music") {
    if (value.envelopeVersion !== 1 || !Number.isInteger(value.documentVersion) || value.documentVersion !== 1 || !isRecord(value.payload)) fail("unsupported envelope version or payload");
    return validateSession(value.payload);
  }
  // The existing download is a raw Session. Accept only this exact recognized shape.
  return validateSession(value);
}
