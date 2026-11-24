"""Calm, minimal lo-fi bed for the repair timelapse (royalty free, synthesised).
Usage: python3 scripts/make_minimal_bgm.py public/sfx/bgm_minimal.wav
"""
import sys, wave
import numpy as np
from scipy.signal import lfilter

SR = 48000
rng = np.random.default_rng(3)
BPM = 84
beat = 60 / BPM
BARS = 28  # ~80s
L = int(BARS * 4 * beat * SR) + SR * 2
mix = np.zeros((L, 2))


def t(d):
    return np.arange(int(d * SR)) / SR


def lp(x, fc):
    a = np.exp(-2 * np.pi * fc / SR)
    return lfilter([1 - a], [1, -a], x)


def place(sig, at, gain=1.0, pan=0.0):
    s = int(at * SR)
    if s >= L:
        return
    sig = sig if sig.ndim == 2 else np.stack([sig * (1 - pan) ** 0.5, sig * (1 + pan) ** 0.5], 1) / 1.0
    e = min(L, s + len(sig))
    mix[s:e] += sig[: e - s] * gain


hz = lambda m: 440 * 2 ** ((m - 69) / 12)


def keys(freq, d):
    """soft electric-piano: sine + bell partial, slow decay, gentle tremolo"""
    tt = t(d)
    body = np.sin(2 * np.pi * freq * tt) + 0.25 * np.sin(2 * np.pi * freq * 2 * tt) * np.exp(-tt * 3)
    bell = 0.12 * np.sin(2 * np.pi * freq * 7.0 * tt) * np.exp(-tt * 9)
    env = np.minimum(1, tt / 0.01) * np.exp(-tt * 0.9)
    trem = 1 + 0.12 * np.sin(2 * np.pi * 4.2 * tt)
    return lp((body + bell) * env * trem, 3200)


def kick():
    tt = t(0.4)
    f = 48 + 70 * np.exp(-tt * 30)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 9)


def shaker():
    n = int(0.08 * SR)
    x = rng.standard_normal(n)
    x = x - lp(x, 6000)
    return x * np.sin(np.pi * np.arange(n) / n) ** 2


def rim():
    tt = t(0.06)
    return (np.sin(2 * np.pi * 1700 * tt) * 0.5 + lp(rng.standard_normal(len(tt)), 3000) * 0.5) * np.exp(-tt * 70)


def sub(freq, d):
    tt = t(d)
    return np.sin(2 * np.pi * freq * tt) * np.minimum(1, tt / 0.03) * np.minimum(1, (d - tt) / 0.08)


# Cmaj9 - Am9 - Fmaj9 - G6/9  (warm, unresolved, loops cleanly)
prog = [[48, 55, 59, 62, 64], [45, 52, 55, 59, 60], [41, 48, 52, 55, 57], [43, 50, 52, 57, 59]]
roots = [36, 33, 29, 31]
mel = [76, 74, 71, 72, 74, 67, 69, 71]

for bar in range(BARS):
    b0 = bar * 4 * beat
    ch = bar % 4
    drums = 2 <= bar < BARS - 2
    for i, m in enumerate(prog[ch]):
        place(keys(hz(m), 4 * beat + 0.6), b0 + i * 0.018, 0.10, pan=(i - 2) * 0.15)
    place(keys(hz(prog[ch][2] + 12), 2 * beat), b0 + 2.5 * beat, 0.05, pan=0.3)
    if bar >= 1:
        place(sub(hz(roots[ch]), 2 * beat), b0, 0.22)
        place(sub(hz(roots[ch]), 1.5 * beat), b0 + 2.5 * beat, 0.18)
    if drums:
        for k in (0, 2.5):
            place(kick(), b0 + k * beat, 0.45)
        for k in (1, 3):
            place(rim(), b0 + k * beat, 0.16, pan=-0.2)
        for i in range(8):
            place(shaker(), b0 + i * beat / 2 + (0.02 if i % 2 else 0), 0.05 if i % 2 else 0.035, pan=0.35)
    if bar % 2 == 1 and 4 <= bar < BARS - 2:
        for i, m in enumerate(mel):
            if i % 3 != 2:
                place(keys(hz(m), beat), b0 + i * beat / 2, 0.045, pan=0.2)

# vinyl-ish air
air = lp(rng.standard_normal(L), 2500) * 0.006
mix += np.stack([air, np.roll(air, 300)], 1)
# simple stereo room
for d, g in ((0.023, 0.18), (0.037, 0.14), (0.051, 0.1)):
    n = int(d * SR)
    mix[n:, 0] += mix[:-n, 1] * g
    mix[n:, 1] += mix[:-n, 0] * g
fade = int(3 * SR)
mix[-fade:] *= np.linspace(1, 0, fade)[:, None]
mix = np.tanh(mix * 1.5)
mix = mix / np.abs(mix).max() * 0.89
with wave.open(sys.argv[1], 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((mix * 32767).astype(np.int16).tobytes())
print('ok', L / SR)
