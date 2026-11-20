"""Synthesise SFX pack + background music (no external samples, royalty free).
Usage: python3 scripts/make_audio.py public/sfx
"""
import sys, os, wave
import numpy as np

SR = 48000
OUT = sys.argv[1]
os.makedirs(OUT, exist_ok=True)
rng = np.random.default_rng(7)


def t(d):
    return np.arange(int(d * SR)) / SR


def env(n, a=0.005, r=0.2, shape=4.0):
    x = np.arange(n) / SR
    e = np.minimum(1, x / max(a, 1e-4)) * np.exp(-shape * np.maximum(0, x - a) / max(r, 1e-4))
    return e


def lp(x, cutoff):
    """one-pole lowpass with time-varying cutoff (array or scalar)"""
    if np.isscalar(cutoff):
        from scipy.signal import lfilter
        a = np.exp(-2 * np.pi * cutoff / SR)
        return lfilter([1 - a], [1, -a], x)
    c = np.broadcast_to(np.asarray(cutoff, float), x.shape)
    a = np.exp(-2 * np.pi * c / SR)
    y = np.zeros_like(x)
    acc = 0.0
    for i in range(len(x)):
        acc = (1 - a[i]) * x[i] + a[i] * acc
        y[i] = acc
    return y


def bp(x, f):
    return lp(x, f * 1.6) - lp(x, f * 0.6)


def stereo(m, width=0.0):
    if width:
        d = int(width * SR)
        r = np.concatenate([np.zeros(d), m[:-d]]) if d else m
        return np.stack([m, r], 1)
    return np.stack([m, m], 1)


def rev(x, mix=0.25):
    """cheap stereo reverb from a few comb delays"""
    out = np.zeros((len(x) + SR, 2))
    out[: len(x)] += x if x.ndim == 2 else stereo(x)
    mono = x.mean(1) if x.ndim == 2 else x
    for ch, delays in enumerate([(0.029, 0.037, 0.043, 0.051), (0.031, 0.041, 0.047, 0.057)]):
        for d in delays:
            n = int(d * SR)
            buf = np.zeros(len(out))
            buf[: len(mono)] = mono
            y = np.zeros(len(out))
            for k in range(1, 18):
                s = n * k
                if s >= len(out):
                    break
                y[s:] += buf[: len(out) - s] * (0.72 ** k)
            out[:, ch] += lp(y, 5000) * mix / 4
    return out


def norm(x, peak=0.89):
    m = np.abs(x).max()
    return x / m * peak if m > 0 else x


def save(name, x):
    x = norm(x if x.ndim == 2 else stereo(x))
    # trim trailing silence
    nz = np.where(np.abs(x).max(1) > 1e-4)[0]
    x = x[: nz[-1] + 1] if len(nz) else x
    fade = min(len(x), 400)
    x[-fade:] *= np.linspace(1, 0, fade)[:, None]
    with wave.open(os.path.join(OUT, name), "wb") as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((np.clip(x, -1, 1) * 32767).astype(np.int16).tobytes())


# ---------- SFX ----------
def whoosh(d=0.55, up=True):
    n = int(d * SR)
    x = np.arange(n) / n
    noise = rng.standard_normal(n)
    sweep = (300 + 5500 * (x if up else 1 - x) ** 1.5)
    body = lp(noise, sweep) - lp(noise, sweep * 0.35)
    e = np.sin(np.pi * x) ** 1.6
    m = body * e
    pan = np.linspace(-0.6, 0.6, n)
    return rev(np.stack([m * (1 - pan) / 2 + m / 2, m * (1 + pan) / 2 + m / 2], 1), 0.18)


def pop():
    tt = t(0.12)
    f = 900 * np.exp(-tt * 30) + 350
    ph = 2 * np.pi * np.cumsum(f) / SR
    return np.sin(ph) * env(len(tt), 0.001, 0.05, 1) + 0.15 * rng.standard_normal(len(tt)) * env(len(tt), 0.0005, 0.006, 1)


def click():
    tt = t(0.05)
    return (np.sin(2 * np.pi * 2400 * tt) * 0.6 + rng.standard_normal(len(tt)) * 0.4) * env(len(tt), 0.0003, 0.012, 1)


def bell(freqs, d=1.6, amps=None, decay=1.0):
    tt = t(d)
    amps = amps or [1] * len(freqs)
    s = sum(a * np.sin(2 * np.pi * f * tt) * np.exp(-tt * (2.2 + i * 1.3) / decay) for i, (f, a) in enumerate(zip(freqs, amps)))
    return s * np.minimum(1, tt / 0.002)


def kaching():
    # drawer clunk + coin bells
    n = int(1.4 * SR)
    out = np.zeros(n)
    clunk = lp(rng.standard_normal(int(0.09 * SR)), 1200) * env(int(0.09 * SR), 0.001, 0.03, 1) * 3
    clunk += np.sin(2 * np.pi * 110 * t(0.09)) * env(int(0.09 * SR), 0.001, 0.04, 1)
    out[: len(clunk)] += clunk
    b1 = bell([2093, 2637, 3520, 5274], 1.2, [1, .6, .4, .25])
    b2 = bell([2637, 3136, 4186, 6272], 1.2, [1, .6, .4, .2])
    s1, s2 = int(0.07 * SR), int(0.16 * SR)
    out[s1:s1 + len(b1)] += 0.5 * b1[: n - s1]
    out[s2:s2 + len(b2)] += 0.55 * b2[: n - s2]
    shimmer = bp(rng.standard_normal(n), 7000) * np.exp(-np.arange(n) / SR * 5) * 0.4
    out += shimmer
    return rev(stereo(out, 0.004), 0.25)


def impact():
    tt = t(1.4)
    f = 120 * np.exp(-tt * 6) + 38
    sub = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 3.0)
    crack = lp(rng.standard_normal(len(tt)), 2500) * np.exp(-tt * 28)
    m = np.tanh((sub * 1.3 + crack * 0.8) * 1.6)
    return rev(stereo(m), 0.22)


def riser(d=1.2):
    tt = t(d)
    x = tt / d
    f = 200 + 1600 * x ** 2
    tone = np.sin(2 * np.pi * np.cumsum(f) / SR) * 0.25 + np.sin(2 * np.pi * np.cumsum(f * 1.5) / SR) * 0.12
    noise = lp(rng.standard_normal(len(tt)), 400 + 9000 * x ** 2) * 0.7
    m = (tone + noise) * x ** 2.2
    return rev(stereo(m, 0.003), 0.2)


def ding():
    return rev(stereo(bell([1568, 3136, 4704], 1.3, [1, .35, .15], 0.8) * 0.8, 0.002), 0.3)


def notif():
    a = bell([1319, 2637], 0.5, [1, .3], 0.6)
    b = bell([1976, 3951], 0.9, [1, .3], 0.8)
    n = int(1.1 * SR); out = np.zeros(n)
    out[: len(a)] += a; s = int(0.11 * SR); out[s:s + len(b)] += b[: n - s]
    return rev(stereo(out), 0.25)


def sparkle():
    n = int(1.0 * SR); out = np.zeros(n)
    for i, f in enumerate([2637, 3136, 3951, 4699, 5274, 6272]):
        b = bell([f, f * 2.01], 0.5, [1, .3], 0.5) * 0.35
        s = int(i * 0.045 * SR)
        out[s:s + len(b)] += b[: n - s]
    return rev(stereo(out, 0.003), 0.35)


def swipe():
    return whoosh(0.28, up=False) * 0.8


save("whoosh.wav", whoosh())
save("swipe.wav", swipe())
save("pop.wav", pop())
save("click.wav", click())
save("kaching.wav", kaching())
save("impact.wav", impact())
save("riser.wav", riser())
save("ding.wav", ding())
save("notif.wav", notif())
save("sparkle.wav", sparkle())

# ---------- BGM: bouncy modern trap/pop, 100 BPM, F minor-ish ----------
BPM = 100
beat = 60 / BPM
bars = 16
L = int(bars * 4 * beat * SR)
mix = np.zeros((L, 2))


def place(sig, time, gain=1.0):
    s = int(time * SR)
    if s >= L:
        return
    sig = sig if sig.ndim == 2 else stereo(sig)
    e = min(L, s + len(sig))
    mix[s:e] += sig[: e - s] * gain


def kick():
    tt = t(0.45)
    f = 50 + 110 * np.exp(-tt * 35)
    return np.tanh(2 * np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 7))


def clap():
    n = int(0.3 * SR); x = bp(rng.standard_normal(n), 1500)
    e = np.zeros(n)
    for o in (0, 0.01, 0.02):
        e += env(n, 0.001, 0.02, 1) * np.roll(np.ones(n), int(o * SR)) * (np.arange(n) >= o * SR)
    e += 0.6 * env(n, 0.001, 0.12, 1)
    return rev(stereo(x * e), 0.3)


def hat(open_=False):
    n = int((0.18 if open_ else 0.05) * SR)
    x = rng.standard_normal(n); x = x - lp(x, 7000)
    return x * env(n, 0.0005, 0.08 if open_ else 0.015, 1)


def pluck(freq, d):
    tt = t(d)
    s = sum(np.sign(np.sin(2 * np.pi * freq * k * tt)) / k for k in (1, 2))
    s = lp(s * 0.4, 600 + 3000 * np.exp(-tt * 9))
    return s * env(len(tt), 0.003, d * 0.6, 3)


def pad(freqs, d):
    tt = t(d)
    s = sum(np.sin(2 * np.pi * f * tt + np.sin(2 * np.pi * 0.3 * tt)) + 0.5 * np.sin(2 * np.pi * f * 1.003 * tt) for f in freqs)
    a = np.minimum(1, tt / 0.3) * np.minimum(1, (d - tt) / 0.3)
    return lp(s * a / len(freqs), 1800)


def bass808(freq, d):
    tt = t(d)
    f = freq * (1 + 0.6 * np.exp(-tt * 40))
    return np.tanh(1.8 * np.sin(2 * np.pi * np.cumsum(f) / SR)) * np.minimum(1, tt / 0.005) * np.exp(-tt * 1.5)


hz = lambda m: 440 * 2 ** ((m - 69) / 12)
# Fm - Db - Ab - Eb
prog = [[53, 56, 60, 63], [49, 53, 56, 60], [56, 60, 63, 67], [51, 55, 58, 62]]
roots = [41, 37, 44, 39]
melody = [72, 75, 77, 75, 72, 70, 68, 70]

for bar in range(bars):
    b0 = bar * 4 * beat
    ch = bar % 4
    intro = bar < 1
    place(rev(stereo(pad([hz(m) for m in prog[ch]], 4 * beat), 0.01), 0.3), b0, 0.18)
    if not intro:
        for k in (0, 1.5, 2.5) if bar % 2 else (0, 2.75):
            place(kick(), b0 + k * beat, 0.9)
        for k in (1, 3):
            place(clap(), b0 + k * beat, 0.45)
        for i in range(8):
            place(hat(i == 7), b0 + i * beat / 2, 0.16 if i % 2 else 0.24)
        if bar % 4 == 3:
            for i in range(6):
                place(hat(), b0 + 3 * beat + i * beat / 6, 0.12)
        place(bass808(hz(roots[ch] - 12), 4 * beat), b0, 0.45)
    for i, m in enumerate(melody):
        place(rev(stereo(pluck(hz(m + (0 if ch < 2 else -2)), beat * 0.5), 0.006), 0.35), b0 + i * beat / 2, 0.16)

# master: gentle glue + limiter
mix = np.tanh(mix * 1.3) / 1.3
save("bgm.wav", mix)
print("ok", L / SR)
