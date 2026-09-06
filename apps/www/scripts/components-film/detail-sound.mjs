// Original deterministic tactile score for the 32-second component detail film.
// No samples, recordings, external synthesis service, or licensed music.
import { writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';

export const scoreCuts = [0, 2.6, 3.3, 6, 8, 12.5, 15.8, 19, 22.5, 26.5, 29.5, 30.7];
const detents = [2.6, 3.25, 3.67, 4.09, 4.18, 4.44, 6.0, 6.7, 8.1, 9.4, 10.5, 12.8, 13.2, 13.6, 15.8, 17.1, 17.8, 19.6, 20.0, 20.4, 22.5, 24.0, 24.8, 26.5, 27.5, 29.5, 30.7];
const notes = [220, 293.6648, 329.6276, 440, 329.6276, 246.9417, 293.6648, 164.8138];
const clamp = x => Math.max(0, Math.min(1, x));

/** 48 kHz stereo PCM, restrained body pulses and close mechanical detents. */
export async function writeScore(file, duration = 32) {
  if (!Number.isFinite(duration) || duration <= 0 || duration > 3600) throw new Error('Score duration must be between zero and one hour');
  const rate = 48000, length = Math.round(duration * rate);
  const wav = Buffer.alloc(44 + length * 4);
  wav.write('RIFF', 0); wav.writeUInt32LE(wav.length - 8, 4);
  wav.write('WAVEfmt ', 8); wav.writeUInt32LE(16, 16);
  wav.writeUInt16LE(1, 20); wav.writeUInt16LE(2, 22);
  wav.writeUInt32LE(rate, 24); wav.writeUInt32LE(rate * 4, 28);
  wav.writeUInt16LE(4, 32); wav.writeUInt16LE(16, 34);
  wav.write('data', 36); wav.writeUInt32LE(length * 4, 40);
  let seed = 6090632, low = 0, air = 0;
  const tau = Math.PI * 2;
  for (let i = 0; i < length; i++) {
    const t = i / rate;
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    const noise = seed / 2147483648 - 1;
    low += (noise - low) * .035;
    air += (noise - air) * .19;
    const grain = air - low;
    const envelope = clamp(t / .6) * clamp((duration - t) / 1.1);
    const calm = 1 - clamp((t - 29.45) / 1.8) * .72;
    const beatIndex = Math.floor(t / .65), beat = t % .65;
    const frequency = notes[beatIndex % notes.length];
    const pluck = .009 * Math.exp(-beat * 4.6) * clamp(beat * 180)
      * (Math.sin(tau * frequency * beat) + .17 * Math.sin(tau * frequency * 2.005 * beat));
    const pad = .019 * (Math.sin(tau * 110 * t) + .26 * Math.sin(tau * 164.8138 * t))
      * (.74 + .26 * Math.sin(t * .33));
    const pulse = t < 29.5 ? .044 * Math.exp(-beat * 16)
      * Math.sin(tau * (48 * beat + 1.8 * (1 - Math.exp(-beat * 45)))) : 0;
    let impact = 0, swish = 0, hapticLeft = 0, hapticRight = 0;
    for (let n = 0; n < scoreCuts.length; n++) {
      const d = t - scoreCuts[n];
      if (d >= 0 && d < .5) {
        const attack = clamp(d * 180);
        impact += attack * (.032 * Math.sin(tau * (83 * d + .28 * (1 - Math.exp(-d * 60)))) * Math.exp(-d * 17)
          + .043 * low * Math.exp(-d * 20));
      }
      if (d > -.48 && d < .17) {
        const u = (d + .48) / .65;
        swish += .051 * grain * Math.sin(Math.PI * clamp(u)) ** 2 * (n === 0 ? .3 : 1);
      }
    }
    for (let n = 0; n < detents.length; n++) {
      const d = t - detents[n];
      if (d < 0 || d > .12) continue;
      // Millisecond snap, damped mid-body and a quieter return make a small press.
      const snap = .065 * grain * Math.exp(-d * 560)
        + .028 * Math.sin(tau * 1730 * d) * Math.exp(-d * 360);
      const body = .064 * Math.sin(tau * 146 * d) * Math.exp(-d * 65) * clamp(d * 1900);
      const returnTap = d > .037 ? .014 * Math.sin(tau * 1020 * (d - .037)) * Math.exp(-(d - .037) * 240) : 0;
      const pan = Math.sin(n * 1.43) * .24;
      hapticLeft += (snap + body + returnTap) * (1 - pan);
      hapticRight += (snap + body + returnTap) * (1 + pan);
    }
    const stereo = Math.sin(beatIndex * 1.3) * .18;
    const bed = (pad + pulse + swish) * calm + impact;
    const left = Math.tanh((bed + hapticLeft + pluck * (1 - stereo) * calm) * 1.35) * envelope;
    const right = Math.tanh((bed + hapticRight + pluck * (1 + stereo) * calm) * 1.35) * envelope;
    wav.writeInt16LE(Math.round(Math.max(-1, Math.min(1, left)) * 32767), 44 + i * 4);
    wav.writeInt16LE(Math.round(Math.max(-1, Math.min(1, right)) * 32767), 46 + i * 4);
  }
  await writeFile(file, wav);
  return file;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  if (!process.argv[2]) throw new Error('Pass an output WAV path');
  console.log(await writeScore(process.argv[2], process.argv[3] ? Number(process.argv[3]) : 32));
}
