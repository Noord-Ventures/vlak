#!/usr/bin/env python3
"""Original, sample-free drone soundscape for Vlak's forty-second prompt film.

Python 3 + NumPy. Sustained, slowly evolving synthesis; no melody, arpeggio,
conventional drum pattern, or recorded source. Stereo 24-bit PCM at 48 kHz.
"""
from __future__ import annotations

import argparse
import json
from pathlib import Path
import wave

import numpy as np

RATE = 48000
DURATION = 40.0
SIZE = round(RATE * DURATION)
TAU = 2 * np.pi
RNG = np.random.default_rng(9062604)


def frequency(note):
    return 440 * 2 ** ((note - 69) / 12)


def times(seconds):
    return np.arange(round(seconds * RATE), dtype=np.float64) / RATE


def transition(time, start, end):
    p = np.clip((time - start) / (end - start), 0, 1)
    return p * p * p * (p * (p * 6 - 15) + 10)


def curve(time, points):
    result = np.full_like(time, points[0][1])
    for (start, value), (end, next_value) in zip(points, points[1:]):
        result += (next_value - value) * transition(time, start, end)
    return result


def band_noise(seconds, low=40, high=10000, pinkness=0):
    n = round(seconds * RATE)
    spectrum = np.fft.rfft(RNG.normal(0, 1, n))
    bins = np.fft.rfftfreq(n, 1 / RATE)
    response = (1 - np.exp(-(bins / low) ** 4)) * np.exp(-(bins / high) ** 6)
    response *= (np.maximum(bins, low) / 1000) ** (-pinkness / 2)
    response[0] = 0
    noise = np.fft.irfft(spectrum * response, n)
    return noise / max(0.0001, np.std(noise))


def add(bus, audio, at, gain=1, pan=0):
    start = round(at * RATE)
    end = min(SIZE, start + len(audio))
    if start >= SIZE or end <= start:
        return
    source = audio[:end - start]
    if source.ndim == 2:
        bus[start:end] += source * gain
    else:
        angle = (np.clip(pan, -1, 1) + 1) * np.pi / 4
        bus[start:end, 0] += source * gain * np.cos(angle)
        bus[start:end, 1] += source * gain * np.sin(angle)


def air_layer(time, energy):
    """Dark broad air with independent, slowly moving stereo filter bands."""
    out = np.zeros((SIZE, 2))
    opening = transition(time, 8, 32)
    for channel in range(2):
        lower = band_noise(DURATION, 230, 1600, 1.1)
        middle = band_noise(DURATION, 950, 5200, 0.7)
        upper = band_noise(DURATION, 3900, 10500, 0.2)
        motion = 0.76 + 0.14 * np.sin(TAU * 0.063 * time + channel * 1.6)
        motion += 0.10 * np.sin(TAU * 0.109 * time + 0.8 + channel)
        out[:, channel] = energy * motion * (
            lower * 0.027 + middle * (0.023 + 0.029 * opening)
            + upper * (0.007 + 0.010 * opening))
    return out


def harmonic_drone(time, energy):
    """Open D/A foundation with suspended C/F shadows and minute analog drift."""
    out = np.zeros((SIZE, 2))
    # Sustained voice-leading is spectral, not a chord progression. The upper
    # minor colours emerge from existing harmonics without discrete note attacks.
    voices = [(50, 1.0, 0), (57, 0.53, 3), (60, 0.25, 8.2),
              (65, 0.18, 13.125), (64, 0.11, 22.5), (62, 0.15, 30)]
    for voice, (note, gain, arrival) in enumerate(voices):
        f = frequency(note)
        exposure = transition(time, arrival, arrival + (2.8 if arrival else 1.7))
        if note in (60, 64, 65):
            exposure *= 1 - 0.48 * transition(time, 31.875, 36.5)
        for channel, detune in enumerate((-0.0012, 0.0013)):
            phase = TAU * f * (1 + detune) * time + voice * 0.87
            drift = 0.43 * np.sin(TAU * (0.018 + voice * 0.004) * time + channel)
            partial = np.sin(phase + drift)
            for harmonic in range(2, 8):
                partial += (0.29 / harmonic ** 1.5) * np.sin(harmonic * phase + drift)
            breath = 0.91 + 0.09 * np.sin(TAU * (0.038 + voice * 0.007) * time + voice)
            out[:, channel] += partial * exposure * breath * gain * energy * 0.094
    return out


def metallic_cloud(seconds, base, brightness, pan):
    """Bowed, diffuse metal: slow attack and inharmonic resonances, never a bell."""
    time = times(seconds)
    envelope = np.sin(np.pi * np.minimum(time / seconds, 1)) ** 1.7
    envelope *= 0.78 + 0.22 * np.sin(TAU * 0.11 * time + 0.5)
    wave = np.zeros_like(time)
    for index, ratio in enumerate((1, 1.417, 1.913, 2.331, 3.119, 4.207, 5.131)):
        f = base * ratio
        phase = TAU * f * time + RNG.uniform(0, TAU)
        mod = 0.24 * np.sin(TAU * (0.031 + index * 0.017) * time + index)
        wave += np.sin(phase + mod) * np.exp(-(f / brightness) ** 1.4) / (index + 1) ** 0.9
    wave += band_noise(seconds, 1200, 7300, 0.6) * 0.10
    angle = (pan + 1) * np.pi / 4
    side = band_noise(seconds, 950, 4800, 0.8) * 0.025
    return np.stack((wave * np.cos(angle) + side, wave * np.sin(angle) - side), axis=1) * envelope[:, None]


def grain(seconds, low, high):
    time = times(seconds)
    # Broad soft-edged granular breath instead of a rhythmic transient.
    envelope = np.sin(np.pi * time / seconds) ** (2.3 if seconds < 0.5 else 1.4)
    noise = band_noise(seconds, low, high, 0.9)
    slow_ring = np.sin(TAU * RNG.uniform(95, 210) * time + RNG.uniform(0, TAU))
    return (noise * 0.9 + slow_ring * 0.10) * envelope


def diffuse(source, seconds=4.3):
    """A stereo synthetic chamber with dark early reflections and dense tail."""
    out = np.zeros_like(source)
    count = round(seconds * RATE)
    time = np.arange(count) / RATE
    fft_size = 1 << (SIZE + count - 1).bit_length()
    for channel in range(2):
        impulse = band_noise(seconds, 190, 5200, 0.65)
        impulse *= np.exp(-time / 0.90) * (1 - np.exp(-np.maximum(0, time - 0.031) / 0.060))
        impulse *= (time > 0.031) * 0.0067
        for at, gain in ((0.031, 0.17), (0.057, 0.13), (0.103, 0.10), (0.179, 0.065), (0.293, 0.04)):
            impulse[round((at + channel * 0.008) * RATE)] += gain
        signal = source[:, channel] * 0.77 + source[:, 1 - channel] * 0.23
        out[:, channel] = np.fft.irfft(
            np.fft.rfft(signal, fft_size) * np.fft.rfft(impulse, fft_size), fft_size)[:SIZE]
    return out


def write_pcm24(path, samples):
    ints = np.rint(np.clip(samples, -1, 1 - 1 / 8388608) * 8388608).astype(np.int32).reshape(-1)
    packed = np.empty((len(ints), 3), dtype=np.uint8)
    packed[:, 0] = ints & 255
    packed[:, 1] = (ints >> 8) & 255
    packed[:, 2] = (ints >> 16) & 255
    with wave.open(str(path), "wb") as stream:
        stream.setnchannels(2)
        stream.setsampwidth(3)
        stream.setframerate(RATE)
        stream.writeframes(packed.tobytes())


def compose(destination):
    time = times(DURATION)
    energy = curve(time, [(0, 0.16), (4, 0.19), (8, 0.22), (9.375, 0.31),
                          (13.125, 0.48), (20, 0.51), (25, 0.57), (29, 0.76),
                          (31.875, 1), (34.4, 1.05), (36.4, 0.93),
                          (37.5, 0.67), (39.3, 0.11), (40, 0)])
    # Broad air is comparatively closer than the drone at the beginning, making
    # the opening feel like a real room rather than silence before a music cue.
    air_energy = energy * 0.82 + 0.11 * (1 - transition(time, 6, 13.125))
    drone = harmonic_drone(time, energy)
    air = air_layer(time, air_energy)
    sub = np.zeros((SIZE, 2))
    pressure = curve(time, [(0, 0.17), (8, 0.19), (9.375, 0.28), (13.125, 0.43),
                            (25, 0.50), (31.875, 0.85), (34.8, 0.90),
                            (37.5, 0.51), (40, 0)])
    # Mono low end is stable on headphones and survives a mono social preview.
    f = frequency(26)
    phase = TAU * f * time + 0.13 * np.sin(TAU * 0.029 * time)
    floor = np.sin(phase) + 0.24 * np.sin(phase * 2 + 0.35)
    floor += 0.095 * np.sin(TAU * frequency(33) * time)
    floor *= pressure * (0.96 + 0.04 * np.sin(TAU * 0.041 * time)) * 0.125
    sub[:, 0] = sub[:, 1] = floor

    clouds = np.zeros((SIZE, 2))
    for at, seconds, base, gain, pan in (
        (0.0, 10.5, 111, 0.015, -0.30),
        (5.8, 9.0, 147, 0.030, 0.26),
        (10.2, 10.5, 131, 0.039, -0.22),
        (17.0, 11.8, 165, 0.040, 0.33),
        (24.0, 12.7, 147, 0.064, -0.23),
        (28.4, 11.6, 196, 0.051, 0.22),
    ):
        add(clouds, metallic_cloud(seconds, base, 2100 if at < 20 else 3300, pan), at, gain)
    particles = np.zeros((SIZE, 2))
    when = 1.2
    grains = []
    while when < 37:
        level = float(energy[min(SIZE - 1, round(when * RATE))])
        seconds = RNG.uniform(0.28, 1.10)
        low = RNG.uniform(450, 1700)
        high = low + RNG.uniform(1400, 4300)
        pan = RNG.uniform(-0.74, 0.74)
        gain = (0.008 + level * 0.018) * RNG.uniform(0.65, 1.1)
        add(particles, grain(seconds, low, high), when, gain, pan)
        grains.append({"time": round(when, 3), "duration": round(seconds, 3)})
        # Irregular arrivals have no beat grid and overlap into a continuous veil.
        when += RNG.uniform(0.32, 1.75) / (0.60 + level * 0.85)
    # The build is a spectral inhale, not a riser effect with a hard impact.
    inhale = np.zeros((SIZE, 2))
    for at, seconds, gain in ((7.35, 4.8, 0.010), (11.1, 5.6, 0.014), (27.5, 9.4, 0.025)):
        t = times(seconds)
        swell = np.sin(np.pi * t / seconds) ** 2
        for channel in range(2):
            texture = band_noise(seconds, 620, 6100 + channel * 650, 1.0) * swell
            add(inhale, texture, at, gain, (-0.55 if channel == 0 else 0.55))

    # Ends of source gestures recede; their chamber persists through the final
    # shot, with a clean terminal fade so repeated playback never clicks.
    source = drone + clouds + particles + air + inhale
    source *= (1 - transition(time, 37.0, 39.5))[:, None]
    reverberant = diffuse(source * 0.53)
    mix = source + sub + reverberant
    mix = np.tanh(mix * 1.20) / 1.20
    fade_in = transition(time, 0, 0.24)
    tail = 1 - transition(time, 38.1, 40)
    mix *= (fade_in * tail)[:, None]
    # Finite zero-ended PCM, with DC correction underneath the same terminal fade.
    mean = np.mean(mix, axis=0)
    mix -= mean[None, :] * (fade_in * tail)[:, None]
    mix *= 10 ** (-3.5 / 20) / np.max(np.abs(mix))
    assert np.isfinite(mix).all()
    destination.parent.mkdir(parents=True, exist_ok=True)
    write_pcm24(destination, mix)
    stages = [("restrained", 0, 9.375), ("first expansion", 9.375, 13.125),
              ("immersive", 13.125, 26.25), ("crescendo", 26.25, 31.875),
              ("vast payoff", 31.875, 37.5), ("reverberant tail", 37.5, 40)]
    report = {
        "file": str(destination), "composition": "Vlak, pressure and air",
        "version": "drone soundscape", "duration": DURATION, "sampleRate": RATE,
        "channels": 2, "bitDepth": 24, "tonalCentre": "D, open fifths with slow minor/suspended spectral colours",
        "source": "Entirely original numerical synthesis; no samples, melody transcription, or recordings",
        "arrangement": "Sustained analog drift, mono sub pressure, filtered stereo air, bowed metallic clouds, irregular granular breath, dark synthetic chamber",
        "beatGrid": None, "melodicHooks": False, "conventionalDrums": False,
        "peakDbfs": float(20 * np.log10(np.max(np.abs(mix)))),
        "granularEvents": len(grains),
        "stages": [{"name": name, "start": start, "end": end,
                    "rmsDbfs": round(float(20 * np.log10(np.sqrt(np.mean(mix[round(start * RATE):round(end * RATE)] ** 2)) + 1e-12)), 3)}
                   for name, start, end in stages],
    }
    destination.with_suffix(".json").write_text(json.dumps(report, indent=2) + "\n")
    print(json.dumps(report, indent=2))


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output", type=Path, default=Path.home() / "Movies/Vlak/prompt-to-interface/vlak-prompt-music.wav")
    compose(parser.parse_args().output)
