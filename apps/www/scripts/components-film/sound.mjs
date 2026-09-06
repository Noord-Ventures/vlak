// Original, deterministic electronic score. No samples or licensed recordings.
import { writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';

export async function writeScore(file, duration = 27) {
  const rate = 48000;
  const length = Math.round(rate * duration);
  const output = Buffer.alloc(44 + length * 4);
  output.write('RIFF', 0); output.writeUInt32LE(output.length - 8, 4);
  output.write('WAVEfmt ', 8); output.writeUInt32LE(16, 16);
  output.writeUInt16LE(1, 20); output.writeUInt16LE(2, 22);
  output.writeUInt32LE(rate, 24); output.writeUInt32LE(rate * 4, 28);
  output.writeUInt16LE(4, 32); output.writeUInt16LE(16, 34);
  output.write('data', 36); output.writeUInt32LE(length * 4, 40);
  const cuts = [0, 4.5, 9.5, 14.5, 19, 23, 23.9, 24.45];
  const notes = [220, 329.6276, 440, 493.8833, 659.2551, 440, 329.6276, 246.9417];
  let seed = 62026, low = 0;
  for (let i = 0; i < length; i++) {
    const t = i / rate;
    seed = (Math.imul(seed, 1664525) + 1013904223) | 0;
    const noise = (seed >>> 0) / 2147483648 - 1;
    low += (noise - low) * .08;
    const fade = Math.min(1, t / .6, (duration - t) / 1.4);
    const beat = t % .6;
    const beatIndex = Math.floor(t / .6);
    const pulse = t < 23 ? .115 * Math.exp(-beat * 20) * Math.sin(2 * Math.PI * (46 * beat + 20 * (1 - Math.exp(-beat * 24)))) : 0;
    const click = t < 23 ? .012 * Math.exp(-(t % .3) * 170) * (noise - low) : 0;
    const pluck = .018 * Math.exp(-beat * 3.2) * Math.min(1, beat * 170)
      * (Math.sin(2 * Math.PI * notes[beatIndex % notes.length] * t)
      + .25 * Math.sin(2 * Math.PI * notes[beatIndex % notes.length] * 2.003 * t));
    const pad = .028 * (Math.sin(2 * Math.PI * 110 * t) + .34 * Math.sin(2 * Math.PI * 164.8138 * t))
      * (.72 + .28 * Math.sin(t * .41));
    let foley = 0;
    for (const cut of cuts) {
      const d = t - cut;
      if (d >= 0 && d < .55) foley += .055 * Math.exp(-d * 17) * low + .038 * Math.sin(2 * Math.PI * 75 * d) * Math.exp(-d * 13);
      if (d < 0 && d > -.35) foley += .018 * low * ((d + .35) / .35) ** 2;
    }
    const pan = Math.sin(beatIndex * 1.7) * .22;
    const common = pad + pulse + click + foley;
    const left = Math.tanh((common + pluck * (1 - pan)) * 1.45) * fade;
    const right = Math.tanh((common + pluck * (1 + pan)) * 1.45) * fade;
    output.writeInt16LE(Math.round(Math.max(-1, Math.min(1, left)) * 32767), 44 + i * 4);
    output.writeInt16LE(Math.round(Math.max(-1, Math.min(1, right)) * 32767), 46 + i * 4);
  }
  await writeFile(file, output);
  return file;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  if (!process.argv[2]) throw new Error('Pass an output WAV path');
  console.log(await writeScore(process.argv[2]));
}
