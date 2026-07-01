"""
Generate a large library (~100) of soft, designer-grade UI/UX sound effects
for the AI video channel.

Everything is synthesized from scratch (sine partials, pitch sweeps, band-
limited noise + envelopes) -> 100% original, royalty-free, safe to monetize.
Each file is loudness-matched to a common target (BS.1770 K-weighting, FFT)
with a soft peak limiter, so nothing needs manual gain in the editor.

Output: 48 kHz, 16-bit stereo WAV in public/sfx/ (folder is wiped first).

Run:  python scripts/gen_sfx.py
"""
import os
import shutil
import wave
import numpy as np

SR = 48000
OUT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "public", "sfx"))

TARGET_LUFS = -19.0
CEILING = 10 ** (-1.0 / 20)            # -1 dBFS

# Pleasant pentatonic-ish palette (C5..E6), keeps everything musical.
PALETTE = [523.25, 587.33, 659.25, 783.99, 880.0, 1046.5, 1174.66, 1318.51]


# --------------------------------------------------------------- primitives
def t(dur):
    return np.linspace(0, dur, int(SR * dur), endpoint=False)


def expdec(n, k=6.0):
    return np.exp(-k * np.linspace(0, 1, n))


def fade(x, a=0.002, r=0.01):
    n = len(x)
    a_n, r_n = int(SR * a), int(SR * r)
    e = np.ones(n)
    if a_n:
        e[:a_n] = np.linspace(0, 1, a_n)
    if r_n:
        e[-r_n:] = np.linspace(1, 0, r_n)
    return x * e


def tone(freq, dur, decay=8.0, harmonics=(1.0,), detune=0.0):
    x = t(dur)
    n = len(x)
    out = np.zeros(n)
    for i, amp in enumerate(harmonics, start=1):
        f = freq * i * (1 + detune * (i - 1))
        out += amp * np.sin(2 * np.pi * f * x)
    return out * expdec(n, decay)


def sweep(f0, f1, dur, decay=8.0, curve=25.0):
    x = t(dur)
    n = len(x)
    f = f1 + (f0 - f1) * np.exp(-curve * np.linspace(0, 1, n))
    phase = 2 * np.pi * np.cumsum(f) / SR
    return np.sin(phase) * expdec(n, decay)


def band_noise(dur, lo, hi, decay=20.0, seed=0):
    """Band-limited noise burst via spectral mask (vectorized)."""
    n = int(SR * dur)
    rng = np.random.default_rng(seed)
    x = rng.standard_normal(n)
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(n, 1 / SR)
    mask = ((f >= lo) & (f <= hi)).astype(float)
    # soft edges
    mask = np.convolve(mask, np.ones(31) / 31, mode="same")
    y = np.fft.irfft(X * mask, n=n)
    return y * expdec(n, decay)


def airy_sweep(dur, decay_env=True, seed=0, rev=False):
    """Wind/whoosh: noise through a moving one-pole lowpass."""
    n = int(SR * dur)
    rng = np.random.default_rng(seed)
    noise = rng.standard_normal(n)
    env = np.sin(np.pi * np.linspace(0, 1, n)) ** 2
    sweep_env = env[::-1] if rev else env
    cutoff = 0.02 + 0.28 * sweep_env
    y = np.zeros(n)
    prev = 0.0
    for i in range(n):
        prev += cutoff[i] * (noise[i] - prev)
        y[i] = prev
    return y * env


def tail(x, amount=0.16, delay=0.04, n=4):
    out = x.copy()
    d = int(SR * delay)
    for i in range(1, n + 1):
        g = amount * (0.6 ** i)
        s = np.zeros_like(x)
        if d * i < len(x):
            s[d * i:] = x[: len(x) - d * i]
        out += g * s
    return out


def seq(notes):
    """notes = [(freq, start_s, dur_s, decay), ...] -> mixed mono."""
    total = max(s + d for _, s, d, _ in notes)
    n = int(SR * total) + 1
    out = np.zeros(n)
    for f, start, dur, dec in notes:
        sig = fade(tone(f, dur, dec, (1.0, 0.4, 0.18)))
        i0 = int(SR * start)
        out[i0:i0 + len(sig)] += sig[: n - i0]
    return out


# --------------------------------------------------------------- loudness
def _biquad_mag(freqs, b, a):
    w = 2 * np.pi * freqs / SR
    z = np.exp(-1j * w)
    num = b[0] + b[1] * z + b[2] * z ** 2
    den = a[0] + a[1] * z + a[2] * z ** 2
    return np.abs(num / den)


def _k_mag(freqs):
    b1 = [1.53512485958697, -2.69169618940638, 1.19839281085285]
    a1 = [1.0, -1.69065929318241, 0.73248077421585]
    b2 = [1.0, -2.0, 1.0]
    a2 = [1.0, -1.99004745483398, 0.99007225036621]
    return _biquad_mag(freqs, b1, a1) * _biquad_mag(freqs, b2, a2)


def lufs(mono):
    n = len(mono)
    if n < 16:
        return -120.0
    X = np.fft.rfft(mono)
    f = np.fft.rfftfreq(n, 1 / SR)
    p = (np.abs(X) * _k_mag(f)) ** 2
    scale = np.full(len(p), 2.0)
    scale[0] = 1.0
    if n % 2 == 0:
        scale[-1] = 1.0
    ms = np.sum(p * scale) / n ** 2
    return -120.0 if ms <= 0 else -0.691 + 10 * np.log10(ms)


def soft_limit(x, ceiling):
    if np.max(np.abs(x)) <= ceiling:
        return x
    return ceiling * np.tanh(x / ceiling)


# --------------------------------------------------------------- output
def save(name, mono, width=0.0):
    mono = fade(mono)
    g = 10 ** ((TARGET_LUFS - lufs(mono)) / 20)
    mono = soft_limit(mono * g, CEILING)
    if width > 0:                       # tiny Haas-ish stereo spread
        d = int(SR * 0.006 * width)
        right = np.zeros_like(mono)
        right[d:] = mono[: len(mono) - d]
        left = mono
    else:
        left = right = mono
    inter = np.empty(left.size + right.size)
    inter[0::2] = np.clip(left, -1, 1)
    inter[1::2] = np.clip(right, -1, 1)
    pcm = (inter * 32767).astype("<i2").tobytes()
    with wave.open(os.path.join(OUT, name + ".wav"), "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm)


# --------------------------------------------------------------- families
def build():
    s = {}

    # clicks: tight tonal + noise transient, brightness sweep
    for i in range(6):
        base = 1100 + i * 320
        body = tone(base, 0.05, 30, (1.0, 0.3))
        tr = band_noise(0.05, base * 0.8, 9000, 70, seed=10 + i) * 0.5
        s[f"click_{i+1:02d}"] = body + tr

    # pops: pitch blip down + click body
    for i in range(6):
        base = 360 + i * 110
        s[f"pop_{i+1:02d}"] = soft_limit(
            sweep(base + 520, base, 0.13, 9, 40)
            + band_noise(0.13, 1500, 8000, 90, seed=20 + i) * 0.18, 1.0)

    # taps: soft high ticks
    for i in range(5):
        f = 780 + i * 220
        s[f"tap_{i+1:02d}"] = tone(f, 0.07, 32, (1.0, 0.4))

    # ticks: two-partial micro click
    for i in range(5):
        f = 950 + i * 260
        s[f"tick_{i+1:02d}"] = tone(f, 0.045, 40, (1.0, 0.5, 0.25))

    # hovers: very soft short blip
    for i in range(5):
        f = PALETTE[i + 1]
        s[f"hover_{i+1:02d}"] = tone(f, 0.09, 16, (1.0, 0.25)) * 0.8

    # toggles: on = up sweep, off = down sweep
    for i in range(3):
        lo, hi = 440 + i * 60, 880 + i * 90
        s[f"toggle_on_{i+1:02d}"] = sweep(lo, hi, 0.12, 12, 30)
        s[f"toggle_off_{i+1:02d}"] = sweep(hi, lo, 0.12, 12, 30)

    # blips: clean musical beeps
    for i in range(6):
        s[f"blip_{i+1:02d}"] = tone(PALETTE[i], 0.11, 14, (1.0, 0.2))

    # bloops: low warm confirm
    for i in range(5):
        base = 150 + i * 45
        s[f"bloop_{i+1:02d}"] = soft_limit(sweep(base + 130, base, 0.2, 7, 22), 1.0)

    # errors: descending / gently dissonant
    s["error_01"] = seq([(440, 0, 0.3, 6), (370, 0.1, 0.45, 6)])
    s["error_02"] = seq([(330, 0, 0.3, 6), (247, 0.1, 0.5, 6)])
    s["error_03"] = (tone(220, 0.3, 8, (1.0, 0.5)) + tone(233, 0.3, 8, (0.7,)))
    s["error_04"] = seq([(523.25, 0, 0.25, 7), (392, 0.12, 0.5, 6)])
    s["error_05"] = soft_limit(sweep(500, 180, 0.35, 7, 18), 1.0)

    # back / dismiss: soft downward
    for i in range(4):
        hi = 700 + i * 120
        s[f"back_{i+1:02d}"] = sweep(hi, hi * 0.55, 0.16, 10, 26)

    # keypresses: mechanical-ish soft clicks
    for i in range(6):
        seed = 60 + i
        body = tone(2200 + i * 200, 0.03, 60, (1.0,)) * 0.6
        n1 = band_noise(0.03, 1500, 12000, 120, seed=seed) * 0.7
        s[f"keypress_{i+1:02d}"] = body + n1

    return s


# Removed families (not generated anymore): bell, chime, confirm, notify, select,
# success, swipe, whoosh.
WIDE = ()


def main():
    if os.path.isdir(OUT):
        shutil.rmtree(OUT)
    os.makedirs(OUT)
    print("Generating into", OUT)
    sounds = build()
    for name, sig in sounds.items():
        width = 0.6 if name.split("_")[0] in WIDE else 0.0
        save(name, sig, width=width)
    print(f"Done: {len(sounds)} sounds at {TARGET_LUFS} LUFS.")


if __name__ == "__main__":
    main()
