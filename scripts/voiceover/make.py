#!/usr/bin/env python3
"""
Автоозвучка ролика голосом Brian (ElevenLabs) в тайминг субтитров + микс поверх
уже готового mp4 (в котором лежит фоновая музыка Radiohead + SFX).

ЛОГИКА:
  1. Берём субтитры блока из linreg/src/blocks/<block>/timeline.ts  (start-кадр + текст).
     Для lang=kk текст берём из scripts/voiceover/captions/<block>.kk.json
     (порядок/кол-во строк совпадает с CAPS).
  2. Каждую реплику озвучиваем Brian (модель eleven_v3 — единственная с казахским).
  3. Длину клипа подгоняем под «слот» до следующей реплики через atempo (макс 1.7x),
     ставим точно на start-кадр (fps=30) → голос синхронен субтитрам.
  4. Приглушаем оригинальную дорожку (музыку) под голос и подмешиваем голос.
  5. Видео копируем без перекодирования → на выходе <block>.<lang>.voiced.mp4

ЗАПУСК:
  python scripts/voiceover/make.py --block clickhouse --lang ru
  python scripts/voiceover/make.py --block clickhouse --lang kk --src clickhouse.mp4

Требуется: ffmpeg/ffprobe в PATH, ключ в .env (ELEVENLABS_API_KEY).
"""
import argparse, json, os, re, subprocess, sys, tempfile, urllib.request, urllib.error

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
FPS = 30

# Какой mp4 соответствует какому блоку (готовый рендер в корне проекта).
BLOCK_MP4 = {
    "clickhouse": "clickhouse.mp4",
    "forecast": "out-forecast.mp4",
    "llm": "llm.mp4",
    "rag": "rag.mp4",
    "rocauc": "rocauc.mp4",
    "taxonomy": "taxonomy.mp4",
    "kolmogorov": "kk-metric.mp4",
    "ai": "ai-origins.mp4",
    "nvidia": "silicon-coal.mp4",
}


def load_env():
    path = os.path.join(ROOT, ".env")
    env = {}
    if os.path.exists(path):
        for line in open(path, encoding="utf-8"):
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                k, v = line.split("=", 1)
                env[k.strip()] = v.strip()
    return env


def strip_markup(text):
    """Убираем *звёздочки* акцента и лишние пробелы — для чистой озвучки."""
    return re.sub(r"\*([^*]+)\*", r"\1", text).strip()


def read_captions(block, lang):
    """Возвращает [(start_frame:int, text:str)] из timeline.ts (+ kk-перевод)."""
    tl = os.path.join(ROOT, "linreg", "src", "blocks", block, "timeline.ts")
    if not os.path.exists(tl):
        # infographics-блоки лежат глубже
        alt = os.path.join(ROOT, "linreg", "src", "blocks", "infographics", block, "timeline.ts")
        tl = alt if os.path.exists(alt) else tl
    src = open(tl, encoding="utf-8").read()
    # Вырезаем массив CAPS, чтобы не зацепить start в CUES.
    m = re.search(r"CAPS\s*:\s*Cap\[\]\s*=\s*\[(.*?)\]\s*;", src, re.S)
    body = m.group(1) if m else src
    pairs = re.findall(
        r"start\s*:\s*(\d+)\s*,\s*end\s*:\s*\d+\s*,\s*text\s*:\s*\"((?:[^\"\\]|\\.)*)\"",
        body,
    )
    starts = [int(s) for s, _ in pairs]
    ru_texts = [t for _, t in pairs]
    if lang == "kk":
        kkp = os.path.join(os.path.dirname(__file__), "captions", f"{block}.kk.json")
        if not os.path.exists(kkp):
            sys.exit(f"Нет казахского перевода: {kkp}\nСоздай его (строки в порядке CAPS).")
        kk = json.load(open(kkp, encoding="utf-8"))["lines"]
        if len(kk) != len(starts):
            sys.exit(f"KZ строк {len(kk)} != субтитров {len(starts)} в {block}. Синхронизируй.")
        texts = kk
    else:
        texts = ru_texts
    return [(s, strip_markup(t)) for s, t in zip(starts, texts)]


def tts(text, out_mp3, api_key, voice_id, model):
    url = f"https://api.elevenlabs.io/v1/text-to-speech/{voice_id}"
    body = json.dumps({
        "text": text,
        "model_id": model,
        "voice_settings": {"stability": 0.4, "similarity_boost": 0.8, "style": 0.3},
    }).encode()
    req = urllib.request.Request(url, data=body, headers={
        "xi-api-key": api_key, "Content-Type": "application/json", "Accept": "audio/mpeg"})
    try:
        with urllib.request.urlopen(req) as r:
            open(out_mp3, "wb").write(r.read())
    except urllib.error.HTTPError as e:
        sys.exit(f"ElevenLabs {e.code}: {e.read().decode()[:300]}")


def probe_dur(path):
    out = subprocess.check_output([
        "ffprobe", "-v", "error", "-show_entries", "format=duration",
        "-of", "default=noprint_wrappers=1:nokey=1", path])
    return float(out.strip())


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--block", required=True)
    ap.add_argument("--lang", choices=["ru", "kk"], default="ru")
    ap.add_argument("--src", help="исходный mp4 (по умолчанию по маппингу блока)")
    ap.add_argument("--out")
    ap.add_argument("--music-vol", type=float, default=0.35, help="громкость фоновой музыки под голосом")
    ap.add_argument("--max-tempo", type=float, default=1.7)
    args = ap.parse_args()

    env = load_env()
    api_key = env.get("ELEVENLABS_API_KEY") or os.environ.get("ELEVENLABS_API_KEY")
    if not api_key:
        sys.exit("Нет ELEVENLABS_API_KEY в .env")
    voice_id = env.get("ELEVEN_VOICE_ID", "nPczCjzI2devNBz1zQrb")
    model = env.get("ELEVEN_MODEL", "eleven_v3")

    src = args.src or BLOCK_MP4.get(args.block)
    if not src:
        sys.exit(f"Не знаю mp4 для блока {args.block}; укажи --src")
    src = src if os.path.isabs(src) else os.path.join(ROOT, src)
    if not os.path.exists(src):
        sys.exit(f"Нет исходного видео: {src}")
    out = args.out or os.path.join(ROOT, f"{args.block}.{args.lang}.voiced.mp4")

    caps = read_captions(args.block, args.lang)
    total = probe_dur(src)
    print(f"[{args.block}/{args.lang}] {len(caps)} реплик, видео {total:.1f}s, голос {voice_id} ({model})")

    tmp = tempfile.mkdtemp(prefix="vo_")
    clips = []  # (start_sec, mp3_path, tempo)
    for i, (start_f, text) in enumerate(caps):
        start_s = start_f / FPS
        next_s = caps[i + 1][0] / FPS if i + 1 < len(caps) else total
        slot = max(0.5, next_s - start_s)
        mp3 = os.path.join(tmp, f"c{i:02d}.mp3")
        tts(text, mp3, api_key, voice_id, model)
        dur = probe_dur(mp3)
        tempo = 1.0
        if dur > slot * 0.98:
            tempo = min(dur / (slot * 0.95), args.max_tempo)
        clips.append((start_s, mp3, tempo))
        print(f"  {i:02d} @{start_s:5.1f}s slot={slot:4.1f}s dur={dur:4.1f}s tempo={tempo:.2f}  {text[:42]}")

    # Собираем ffmpeg filter_complex.
    inputs = ["-i", src]
    for _, mp3, _ in clips:
        inputs += ["-i", mp3]
    parts = []
    labels = []
    for k, (start_s, _, tempo) in enumerate(clips, start=1):
        delay = int(start_s * 1000)
        parts.append(f"[{k}:a]atempo={tempo:.4f},adelay={delay}:all=1[v{k}]")
        labels.append(f"[v{k}]")
    n = len(clips)
    if n == 1:
        voice_lbl = labels[0]
    else:
        parts.append("".join(labels) + f"amix=inputs={n}:normalize=0[voice]")
        voice_lbl = "[voice]"
    parts.append(f"[0:a]volume={args.music_vol}[bg]")
    parts.append(f"[bg]{voice_lbl}amix=inputs=2:normalize=0:duration=first[aout]")
    fc = ";".join(parts)

    cmd = ["ffmpeg", "-y", *inputs, "-filter_complex", fc,
           "-map", "0:v", "-map", "[aout]",
           "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-shortest", out]
    print("  ffmpeg…")
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode != 0:
        print(r.stderr[-1500:])
        sys.exit("ffmpeg упал")
    print(f"ГОТОВО → {out}")


if __name__ == "__main__":
    main()
