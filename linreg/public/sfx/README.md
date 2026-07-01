# SFX pack — UI/UX sounds for the AI video channel

59 original sounds, fully synthesized (no third-party samples) → **royalty-free,
safe to monetize**. Every file is loudness-matched to **−19 LUFS** with a −1 dBFS
peak ceiling, so you don't need to ride gain per clip in the editor.

Each sound ships as **`.wav`** (lossless, for editing) and **`.mp3`** (light).

## Categories

| Category | Count | Use for |
|----------|-------|---------|
| click    | 6 | button / element click |
| tap      | 5 | soft scene tick |
| tick     | 5 | micro accent |
| pop      | 6 | text / thought appears |
| hover    | 5 | hover / focus |
| toggle   | 6 | switch on/off (`toggle_on_*`, `toggle_off_*`) |
| blip     | 6 | clean musical beep / accent |
| bloop    | 5 | low warm confirm / number |
| error    | 5 | error / wrong |
| back     | 4 | back / scene change |
| keypress | 6 | typing / keystroke |

> Use the family files only (e.g. `pop_03.mp3`, `blip_03.mp3`). Removed families:
> `bell`, `chime`, `confirm`, `notify`, `select`, `success`, `swipe`, `whoosh` —
> and all `_preview_*` files. Don't reference them.

## Regenerating / tweaking
```bash
python scripts/gen_sfx.py        # wipes & regenerates this folder (normalized)
```
Tune frequencies, decays, counts or `TARGET_LUFS` in `scripts/gen_sfx.py`.

## Using in Remotion (linreg)
The pack is mirrored into `linreg/public/sfx/`:
```tsx
import { Audio, staticFile, Sequence } from "remotion";

<Sequence from={45} durationInFrames={30}>
  <Audio src={staticFile("sfx/pop_03.mp3")} volume={0.7} />
</Sequence>
```
