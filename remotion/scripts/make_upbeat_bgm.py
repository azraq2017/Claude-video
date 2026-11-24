"""Upbeat, clean house-pop bed (112 BPM) for the repair timelapse. Royalty free, synthesised.
Usage: python3 scripts/make_upbeat_bgm.py public/sfx/bgm_upbeat.wav
"""
import sys, wave
import numpy as np
from scipy.signal import lfilter

SR = 48000
rng = np.random.default_rng(11)
BPM = 112
beat = 60 / BPM
BARS = 38  # ~81s
L = int(BARS * 4 * beat * SR) + SR * 2
mix = np.zeros((L, 2))


def t(d):
    return np.arange(int(d * SR)) / SR


def lp(x, fc):
    if np.isscalar(fc):
        a = np.exp(-2 * np.pi * fc / SR)
        return lfilter([1 - a], [1, -a], x)
    # time-varying cutoff (short notes only): one-pole loop
    a = np.exp(-2 * np.pi * np.asarray(fc) / SR)
    y = np.empty_like(x); acc = 0.0
    for i in range(len(x)):
        acc = (1 - a[i]) * x[i] + a[i] * acc
        y[i] = acc
    return y


def hp(x, fc):
    return x - lp(x, fc)


def place(sig, at, gain=1.0, pan=0.0):
    s = int(at * SR)
    if s >= L or s < 0:
        return
    if sig.ndim == 1:
        sig = np.stack([sig * np.sqrt(1 - pan), sig * np.sqrt(1 + pan)], 1)
    e = min(L, s + len(sig))
    mix[s:e] += sig[: e - s] * gain


hz = lambda m: 440 * 2 ** ((m - 69) / 12)


def kick():
    tt = t(0.35)
    f = 50 + 120 * np.exp(-tt * 40)
    return np.tanh(1.6 * np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 8)) + 0.2 * hp(rng.standard_normal(len(tt)), 3000) * np.exp(-tt * 200)


def clap():
    n = int(0.25 * SR)
    x = hp(lp(rng.standard_normal(n), 4000), 900)
    tt = np.arange(n) / SR
    e = sum(np.exp(-np.maximum(0, tt - o) * 120) * (tt >= o) for o in (0, 0.008, 0.017)) / 2 + 0.5 * np.exp(-tt * 18)
    return x * e


def hat(open_=False):
    n = int((0.16 if open_ else 0.04) * SR)
    x = hp(rng.standard_normal(n), 8000)
    return x * np.exp(-np.arange(n) / SR * (22 if open_ else 110))


def bass(freq, d):
    tt = t(d)
    saw = sum(np.sin(2 * np.pi * freq * k * tt) / k for k in range(1, 6))
    env = np.minimum(1, tt / 0.004) * np.exp(-tt * 5)
    return np.tanh(lp(saw, 300 + 900 * np.exp(-tt * 18)) * env * 1.4)


def stab(freqs, d):
    tt = t(d)
    s = sum(np.sign(np.sin(2 * np.pi * f * tt)) * 0.5 + np.sin(2 * np.pi * f * 1.004 * tt) for f in freqs) / len(freqs)
    env = np.minimum(1, tt / 0.003) * np.exp(-tt * 9)
    return lp(s * env, 1400 + 2600 * np.exp(-tt * 14))


def pluck(freq, d):
    tt = t(d)
    s = np.sin(2 * np.pi * freq * tt) + 0.35 * np.sin(2 * np.pi * 2 * freq * tt) + 0.1 * np.sin(2 * np.pi * 3 * freq * tt)
    return s * np.minimum(1, tt / 0.002) * np.exp(-tt * 7)


def pad(freqs, d):
    tt = t(d)
    s = sum(np.sin(2 * np.pi * f * tt) + 0.5 * np.sin(2 * np.pi * f * 1.006 * tt) for f in freqs) / len(freqs)
    return lp(s * np.minimum(1, tt / 0.25) * np.minimum(1, (d - tt) / 0.25), 1600)


def riser(d):
    tt = t(d)
    x = tt / d
    return hp(rng.standard_normal(len(tt)), 2000) * x ** 2.5 * 0.5


# Am - F - C - G  (bright, driving)
prog = [[57, 60, 64, 67], [53, 57, 60, 64], [48, 52, 55, 60], [55, 59, 62, 67]]
roots = [45, 41, 36, 43]
hook = [76, 0, 79, 76, 74, 0, 72, 74, 76, 0, 74, 72, 69, 0, 72, 0]  # 16th-ish line, 0 = rest

for bar in range(BARS):
    b0 = bar * 4 * beat
    ch = bar % 4
    intro = bar < 2
    outro = bar >= BARS - 2
    full = 8 <= bar < 24 or 28 <= bar < BARS - 2  # extra layers in the music-only stretch
    place(pad([hz(m) for m in prog[ch]], 4 * beat), b0, 0.10)
    # chord stabs on the off-beats
    for k in (0.5, 1.5, 2.5, 3.5) if not intro else (0.5, 2.5):
        place(stab([hz(m + 12) for m in prog[ch]], beat * 0.4), b0 + k * beat, 0.11, pan=0.25)
    for i in range(8):
        place(hat(open_=(i % 2 == 1)), b0 + i * beat / 2, 0.08 if i % 2 else 0.05, pan=-0.3)
    if not intro and not outro:
        for k in range(4):
            place(kick(), b0 + k * beat, 0.55)
        for k in (1, 3):
            place(clap(), b0 + k * beat, 0.22, pan=0.1)
        # syncopated bass
        for k, dur in ((0, 0.45), (0.75, 0.25), (1.5, 0.45), (2.5, 0.25), (3, 0.45), (3.5, 0.3)):
            place(bass(hz(roots[ch] - 12 + (12 if k == 3.5 else 0)), beat * dur * 2), b0 + k * beat, 0.30)
        if full:
            for i, m in enumerate(hook):
                if m:
                    place(pluck(hz(m), beat * 0.6), b0 + i * beat / 4, 0.07, pan=0.35 if i % 2 else -0.35)
            for i in range(16):
                place(hat(), b0 + i * beat / 4, 0.025, pan=0.5)
    if bar == 7:
        place(riser(4 * beat), b0, 0.6)

# light stereo room
for d, g in ((0.019, 0.12), (0.031, 0.09)):
    n = int(d * SR)
    mix[n:, 0] += mix[:-n, 1] * g
    mix[n:, 1] += mix[:-n, 0] * g
fade = int(2.5 * SR)
mix[-fade:] *= np.linspace(1, 0, fade)[:, None]
mix = np.tanh(mix * 1.4)
mix = mix / np.abs(mix).max() * 0.89
with wave.open(sys.argv[1], 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((mix * 32767).astype(np.int16).tobytes())
print('ok', L / SR)
