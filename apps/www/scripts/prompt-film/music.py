#!/usr/bin/env python3
"""An original forty-second electronic score for Vlak's prompt film.

All notes, synthesis, percussion, effects, and arrangement are authored here.
No recordings, samples, borrowed melody, or third-party sound recipes are used.
Run with Python 3 and NumPy; the default output is a stereo 24-bit / 48kHz WAV.
"""

from __future__ import annotations

import argparse
import json
import math
from pathlib import Path
import wave

import numpy as np


RATE = 48000
DURATION = 40.0
BPM = 128
BEAT = 60 / BPM
BAR = 4 * BEAT
SIZE = round(DURATION * RATE)
RNG = np.random.default_rng(604912)
TAU = 2 * np.pi


def frequency(note):
    return 440 * 2 ** ((note - 69) / 12)


def times(seconds):
    return np.arange(round(seconds * RATE), dtype=np.float64) / RATE


def taper(audio, attack=0.003, release=0.035):
    audio = np.array(audio, copy=True)
    a = min(len(audio), max(2, round(attack * RATE)))
    r = min(len(audio), max(2, round(release * RATE)))
    audio[:a] *= np.sin(np.linspace(0, np.pi / 2, a)) ** 2
    audio[-r:] *= np.sin(np.linspace(np.pi / 2, 0, r)) ** 2
    return audio


def band_noise(seconds, low, high):
    noise = RNG.normal(0, 1, round(seconds * RATE))
    spectrum = np.fft.rfft(noise)
    f = np.fft.rfftfreq(len(noise), 1 / RATE)
    response = (1 - np.exp(-(f / low) ** 4)) * np.exp(-(f / high) ** 6)
    shaped = np.fft.irfft(spectrum * response, len(noise))
    return shaped / max(np.std(shaped), 0.001)


def add(bus, audio, at, gain=1, pan=0):
    start = round(at * RATE)
    end = min(SIZE, start + len(audio))
    if start >= SIZE or end <= start:
        return
    audio = audio[:end - start]
    if audio.ndim == 2:
        bus[start:end] += audio * gain
    else:
        angle = (np.clip(pan, -1, 1) + 1) * np.pi / 4
        bus[start:end, 0] += audio * gain * np.cos(angle)
        bus[start:end, 1] += audio * gain * np.sin(angle)


def glass(note, velocity=1, soft=False):
    """A rounded mallet attack followed by a lightly inharmonic glass tail."""
    t = times(1.18 if soft else 0.92)
    f = frequency(note)
    env = (1 - np.exp(-t * 950)) * np.exp(-t / (0.27 if soft else 0.19))
    wobble = 0.0015 * np.sin(TAU * 4.1 * t)
    audio = np.sin(TAU * f * t + wobble) * env
    audio += 0.30 * np.sin(TAU * f * 2.002 * t) * np.exp(-t / 0.082)
    audio += 0.13 * np.sin(TAU * f * 3.006 * t) * np.exp(-t / 0.042)
    audio += 0.055 * np.sin(TAU * f * 4.01 * t) * np.exp(-t / 0.035)
    audio += 0.012 * RNG.normal(0, 1, len(t)) * np.exp(-t / 0.0025)
    return taper(audio * velocity, 0.002, 0.09)


def lead(note, length):
    t = times(length + 0.38)
    f = frequency(note)
    env = (1 - np.exp(-t * 120)) * np.exp(-t / (length * 1.35))
    env *= np.exp(-np.maximum(0, t - length) / 0.11)
    vibrato = 0.004 * (1 - np.exp(-t / 0.2)) * np.sin(TAU * 5.2 * t)
    audio = 0.64 * np.sin(TAU * f * t + vibrato)
    audio += 0.26 * np.sin(TAU * f * 1.002 * t + 0.3)
    audio += 0.12 * np.sin(TAU * f * 2 * t) * np.exp(-t / 0.22)
    audio += 0.065 * np.sin(TAU * f * 3 * t) * np.exp(-t / 0.13)
    return taper(audio * env, 0.008, 0.11)


def bass(note, length, strength=1):
    t = times(length + 0.10)
    f = frequency(note)
    phase = TAU * f * t
    audio = np.sin(phase)
    for h in range(2, 9):
        audio += (0.26 / h ** 1.28) * np.sin(h * phase) * np.exp(-t / (0.2 / h + 0.03))
    audio += 0.11 * np.sin(phase / 2)
    envelope = (1 - np.exp(-t * 300)) * (0.64 + 0.36 * np.exp(-t / 0.12))
    envelope *= np.exp(-np.maximum(0, t - length + 0.07) / 0.028)
    return taper(np.tanh(audio * 1.05) * envelope * strength, 0.004, 0.04)


def pad(notes, seconds, brightness=1):
    t = times(seconds + 1.40)
    stereo = np.zeros((len(t), 2), dtype=np.float64)
    attack = 0.48
    env = (1 - np.exp(-t / attack)) * np.exp(-np.maximum(0, t - seconds) / 0.45)
    for voice, note in enumerate(notes):
        f = frequency(note)
        for channel, detune in enumerate((-0.0018, 0.0018)):
            phase = TAU * f * (1 + detune) * t + voice * 0.63
            vibrato = 0.045 * np.sin(TAU * (0.18 + voice * 0.031) * t + channel)
            for harmonic in range(1, 11):
                weight = np.exp(-(f * harmonic / (1150 * brightness)) ** 1.4) / harmonic ** 1.7
                stereo[:, channel] += weight * np.sin(harmonic * phase + vibrato)
    stereo *= env[:, None] / max(1, len(notes))
    stereo *= (0.96 + 0.04 * np.sin(TAU * 0.39 * t))[:, None]
    return stereo


def kick():
    t = times(0.47)
    phase = TAU * (48 * t + 88 * 0.024 * (1 - np.exp(-t / 0.024)))
    body = np.sin(phase) * np.exp(-t / 0.13)
    attack = band_noise(0.47, 1600, 6800) * np.exp(-t / 0.004)
    audio = 0.92 * body + 0.025 * attack
    return taper(np.tanh(audio * 1.15), 0.0012, 0.04)


def snare():
    t = times(0.32)
    body = 0.38 * np.sin(TAU * 183 * t) * np.exp(-t / 0.035)
    wire = 0.31 * band_noise(0.32, 950, 8300) * np.exp(-t / 0.058)
    clap = np.zeros_like(t)
    raw = band_noise(0.32, 1400, 6100)
    for offset, gain in ((0, 0.13), (0.011, 0.11), (0.022, 0.075)):
        clap += gain * raw * np.exp(-np.maximum(0, t - offset) / 0.020) * (t >= offset)
    return taper(body + wire + clap, 0.001, 0.05)


def hat(opened=False):
    seconds = 0.22 if opened else 0.075
    t = times(seconds)
    noise = band_noise(seconds, 5400, 14000)
    metal = sum(np.sin(TAU * f * t) for f in (6037, 8311, 10661)) / 3
    envelope = np.exp(-t / (0.048 if opened else 0.013))
    return taper((noise * 0.70 + metal * 0.07) * envelope, 0.0006, 0.012)


def rim():
    t = times(0.085)
    audio = (np.sin(TAU * 1623 * t) + 0.45 * np.sin(TAU * 2174 * t)) * np.exp(-t / 0.008)
    return taper(audio, 0.0006, 0.02)


def delay(source, step, wet=0.2, repeats=4):
    output = np.zeros_like(source)
    for repeat in range(1, repeats + 1):
        n = round(step * repeat * RATE)
        if n >= SIZE:
            break
        echo = source[:-n, ::-1] if repeat % 2 else source[:-n]
        output[n:] += echo * wet * 0.46 ** (repeat - 1)
    return output


def reverb(source, seconds=1.65):
    length = round(seconds * RATE)
    t = np.arange(length) / RATE
    output = np.zeros_like(source)
    fft_length = 1 << (SIZE + length - 1).bit_length()
    for channel in range(2):
        impulse = band_noise(seconds, 390, 6400) * np.exp(-t / 0.30)
        impulse *= (1 - np.exp(-np.maximum(0, t - 0.025) / 0.028)) * (t > 0.025)
        impulse *= 0.009
        for offset, gain in ((0.017, 0.26), (0.037, 0.18), (0.061, 0.14), (0.093, 0.09)):
            impulse[round((offset + channel * 0.004) * RATE)] += gain
        input_channel = source[:, channel] * 0.8 + source[:, 1 - channel] * 0.2
        wet = np.fft.irfft(np.fft.rfft(input_channel, fft_length) * np.fft.rfft(impulse, fft_length), fft_length)
        output[:, channel] = wet[:SIZE]
    return output


def write_pcm24(destination, samples):
    pcm = np.rint(np.clip(samples, -1, 1 - 1 / 8388608) * 8388608).astype(np.int32).reshape(-1)
    packed = np.empty((len(pcm), 3), dtype=np.uint8)
    packed[:, 0] = pcm & 255
    packed[:, 1] = (pcm >> 8) & 255
    packed[:, 2] = (pcm >> 16) & 255
    with wave.open(str(destination), "wb") as stream:
        stream.setnchannels(2)
        stream.setsampwidth(3)
        stream.setframerate(RATE)
        stream.writeframes(packed.tobytes())


def compose(destination):
    buses = {name: np.zeros((SIZE, 2), dtype=np.float64) for name in ("plucks", "pads", "bass", "drums", "lead", "air")}
    # Individually voice-led four-note chords, one bar apiece. These notes and
    # motifs were composed for this film rather than transcribed from a song.
    chords = [
        ([62, 66, 69, 76], 38), ([62, 66, 69, 73], 38),
        ([59, 62, 66, 73], 35), ([59, 62, 66, 69], 35),
        ([59, 62, 66, 69], 31), ([61, 64, 69, 71], 33),
        ([59, 62, 66, 73], 35), ([59, 62, 67, 69], 31),
        ([62, 66, 69, 76], 38), ([61, 64, 69, 71], 33),
        ([59, 62, 66, 73], 35), ([59, 62, 67, 69], 31),
        ([57, 62, 66, 69], 30), ([57, 61, 64, 71], 28),
        ([59, 62, 66, 73], 35), ([59, 62, 67, 74], 31),
        ([61, 64, 69, 71], 33), ([62, 66, 69, 76], 38),
        ([59, 62, 67, 74], 31), ([62, 66, 69, 71], 38),
    ]
    left_pattern = [0, 3, 5, 8, 11, 14]
    right_pattern = [2, 6, 9, 12, 15]
    note_order = [0, 2, 1, 3, 2, 1]
    kick_sample, snare_sample, rim_sample = kick(), snare(), rim()
    kick_events = []
    for bar, (voicing, root_note) in enumerate(chords):
        at = bar * BAR
        energy = 0.62 if bar < 5 else 0.79 if bar < 7 else 0.91 if bar < 17 else 1
        if bar == 19:
            energy = 0.93
        add(buses["pads"], pad(voicing, BAR, 0.78 + energy * 0.42), at, 0.25 * energy)
        for hand, slots in enumerate((left_pattern, right_pattern)):
            for index, slot in enumerate(slots):
                if bar == 0 and hand == 1 and slot < 8:
                    continue
                if bar < 3 and index > 3:
                    continue
                if bar == 19 and slot > 8:
                    continue
                chord_index = note_order[(index + hand + bar % 3) % len(note_order)]
                note = voicing[chord_index] + (12 if hand else 0)
                velocity = (0.88 + 0.12 * RNG.random()) * (1 if slot % 4 == 0 else 0.82)
                jitter = 0 if slot % 4 == 0 else RNG.uniform(-0.002, 0.002)
                add(buses["plucks"], glass(note, velocity, soft=hand == 0), at + slot * BEAT / 4 + jitter,
                    0.088 * energy * (0.81 if hand else 1), -0.52 if hand == 0 else 0.52)
        if bar >= 4:
            bass_hits = [(0, root_note, 1.30), (1.5, root_note + 12, 0.35), (2.5, root_note, 0.85), (3.5, root_note + 7, 0.38)]
            if bar == 4:
                bass_hits = [(0, root_note, 3.75)]
            if bar == 19:
                bass_hits = [(0, root_note, 3.90)]
            for beat, note, length in bass_hits:
                add(buses["bass"], bass(note, BEAT * length), at + beat * BEAT, 0.21 * energy)
        # Drums enter exactly with the first UI assembly. Offbeats are lightly
        # swung by eight milliseconds; velocity varies deterministically.
        if 5 <= bar < 19:
            kicks = [0, 1.75, 2.5] if bar < 7 else [0, 1.5, 2, 3.5]
            if bar in (15, 16):
                kicks = [0, 1, 2, 2.75, 3.5]
            if bar >= 17:
                kicks = [0, 1.5, 2, 2.75, 3.5]
            for beat in kicks:
                when = at + beat * BEAT
                add(buses["drums"], kick_sample, when, 0.41 * energy)
                kick_events.append(when)
            for beat in (1, 3):
                add(buses["drums"], snare_sample, at + beat * BEAT + 0.004, 0.31 * energy, 0.04)
            for subdivision in range(8):
                if bar == 5 and subdivision < 2:
                    continue
                when = at + subdivision * BEAT / 2 + (0.008 if subdivision % 2 else 0)
                strength = (0.037 if subdivision % 2 == 0 else 0.058) * energy
                add(buses["drums"], hat(opened=subdivision in (3, 7) and bar >= 7), when, strength,
                    -0.28 if subdivision % 2 else 0.32)
            if bar >= 7:
                for subdivision in (3, 11, 14):
                    add(buses["drums"], hat(), at + subdivision * BEAT / 4 + 0.008,
                        0.021 * energy, 0.48 if subdivision == 11 else -0.42)
            if bar % 2:
                add(buses["drums"], rim_sample, at + 2.75 * BEAT, 0.045, -0.38)
        if bar in (6, 10, 14, 16):
            for index, subdivision in enumerate((12, 14, 15)):
                add(buses["drums"], snare_sample, at + subdivision * BEAT / 4,
                    0.043 + index * 0.026, -0.20 + index * 0.20)

    # Fresh, breath-spaced top-line. A six-note idea changes contour and rests
    # with each harmony; its final ascent resolves into the overview at31.875s.
    melody = {
        7: [(0.5, 74, 0.7), (1.5, 71, 0.45), (2.25, 69, 0.45), (3.25, 74, 0.65)],
        8: [(0, 78, 1.2), (1.5, 76, 0.5), (2.5, 73, 0.9)],
        9: [(0.75, 71, 0.65), (1.75, 73, 0.5), (3, 76, 0.7)],
        10: [(0.25, 78, 0.65), (1.25, 76, 0.45), (2, 73, 1.1)],
        11: [(0.5, 74, 0.7), (2, 71, 0.9), (3.25, 69, 0.55)],
        12: [(0.25, 66, 0.65), (1.5, 69, 0.75), (2.75, 74, 0.85)],
        13: [(0.75, 73, 1.0), (2.25, 71, 0.7), (3.25, 69, 0.65)],
        14: [(0, 73, 0.75), (1.25, 78, 1.0), (2.75, 76, 0.8)],
        15: [(0.5, 74, 0.75), (1.75, 78, 0.65), (3, 81, 0.65)],
        16: [(0, 76, 0.65), (1, 78, 0.7), (2, 81, 0.7), (3, 85, 0.75)],
        17: [(0, 86, 2.0), (2.5, 81, 1.2)],
        18: [(0.5, 83, 1.25), (2.5, 81, 1.0)],
        19: [(0, 78, 0.9), (1.25, 76, 0.8), (2.5, 74, 2.8)],
    }
    for bar, notes in melody.items():
        for index, (beat, note, length) in enumerate(notes):
            gain = 0.082 if bar < 15 else 0.095 if bar < 17 else 0.115
            add(buses["lead"], lead(note, length * BEAT), bar * BAR + beat * BEAT, gain,
                0.13 * math.sin(index * 1.3 + bar))
    # Delicate reverse breath into harmonic arrivals; no dramatic trailer boom.
    for arrival, gain in ((9.375, 0.018), (13.125, 0.025), (31.875, 0.043)):
        seconds = 1.35 if arrival < 30 else 2.25
        t = times(seconds)
        rising = band_noise(seconds, 1800, 9000) * (t / seconds) ** 3
        add(buses["air"], taper(rising, 0.15, 0.022), arrival - seconds, gain, -0.1)
        hit_t = times(1.6)
        shimmer = band_noise(1.6, 5100, 14000) * np.exp(-hit_t / 0.26)
        add(buses["air"], taper(shimmer, 0.003, 0.2), arrival, gain * 0.67, 0.25)
    # Final quiet downbeat grounds the landing then gives the interface space.
    add(buses["drums"], kick_sample, 19 * BAR, 0.34)
    kick_events.append(19 * BAR)
    add(buses["pads"], pad([50, 62, 66, 69, 74, 76], 2.85, 1.15), 19 * BAR, 0.21)

    # Side-chain breathing follows the actual kicks, leaving crisp contact SFX
    # room in the midrange. Only music buses are processed here.
    duck = np.ones(SIZE)
    for when in kick_events:
        i = round(when * RATE)
        t = times(0.28)
        end = min(SIZE, i + len(t))
        shape = 1 - 0.18 * np.exp(-t[:end - i] / 0.08)
        duck[i:end] = np.minimum(duck[i:end], shape)
    buses["pads"] *= duck[:, None]
    buses["bass"] *= (0.55 + 0.45 * duck)[:, None]
    buses["plucks"] *= (0.65 + 0.35 * duck)[:, None]

    mix = sum(buses.values())
    mix += delay(buses["plucks"], BEAT * 0.75, 0.23, 5)
    mix += delay(buses["lead"], BEAT * 0.75, 0.27, 5)
    mix += reverb(buses["plucks"] * 0.25 + buses["lead"] * 0.31 + buses["pads"] * 0.20)
    mix += reverb(buses["drums"] * 0.075, 0.72)

    # A barely audible analog soft knee gives peaks cohesion before generous
    # final headroom. Slow fade retains the last chord's natural release.
    mix = np.tanh(mix * 1.15) / 1.15
    fade = np.ones(SIZE)
    fade[:round(0.025 * RATE)] = np.linspace(0, 1, round(0.025 * RATE)) ** 2
    tail = round(2.05 * RATE)
    fade[-tail:] = np.cos(np.linspace(0, np.pi / 2, tail)) ** 1.6
    mix *= fade[:, None]
    mix -= np.mean(mix, axis=0)
    # -3.4dB sample peak leaves additional margin for codec / intersample peaks.
    mix *= 10 ** (-3.4 / 20) / np.max(np.abs(mix))
    assert np.isfinite(mix).all()
    destination.parent.mkdir(parents=True, exist_ok=True)
    write_pcm24(destination, mix)
    stages = [("intimate", 0, 9.375), ("assembly", 9.375, 13.125), ("lift", 13.125, 26.25),
              ("crescendo", 26.25, 31.875), ("payoff", 31.875, 37.5), ("ringout", 37.5, 40)]
    summary = {
        "file": str(destination), "duration": DURATION, "sampleRate": RATE,
        "channels": 2, "bitDepth": 24, "bpm": BPM,
        "composition": "Original Vlak prompt-to-interface score",
        "key": "D major / B minor", "samples": "All synthesized, no external recordings",
        "peakDbfs": float(20 * np.log10(np.max(np.abs(mix)))),
        "stages": [{"name": name, "start": start, "end": end,
                    "rmsDbfs": float(20 * np.log10(np.sqrt(np.mean(mix[round(start * RATE):round(end * RATE)] ** 2)) + 1e-12))}
                   for name, start, end in stages],
    }
    destination.with_suffix(".json").write_text(json.dumps(summary, indent=2) + "\n")
    print(json.dumps(summary, indent=2))


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output", type=Path, default=Path.home() / "Movies/Vlak/prompt-to-interface/vlak-prompt-music.wav")
    compose(parser.parse_args().output)
