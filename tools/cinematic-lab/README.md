# Cinematic 2.5D Lab

A CPU renderer for silent vertical essays made from local illustrated scenes. It adds camera pushes and pullbacks, depth-dependent horizontal drift, animated foreground paper, orbiting glass symbols, moving light paths, hinged door panels, dust, cuts and large bottom captions. Text stays independent of the source artwork and is fitted to the available width.

This is a **2.5D motion compositor**. It does not generate continuous human motion, facial acting, lip sync or physically accurate 3D geometry. Supply well-directed scenes with distinct poses, then use the timeline to cut between them. Detailed raster artwork improves surface realism but does not increase its original pixel resolution when exported at 1080p.

## Run

Requires Node 20+, FFmpeg with libx264 and DejaVu Sans Bold. `CINEMATIC_FONT` can point to another installed font file.

```sh
cd tools/cinematic-lab
npm install
node render.mjs example.json example.mp4
node render.mjs example.json poster.png --still=1.5 --width=720
```

The neutral example uses a local SVG solely to make the renderer runnable. Real production scenes can use local PNG/JPEG art. Keep subject-specific images, captions, timelines and exports outside this public repository.

The default export is 1080×1920, 30 FPS, H.264/yuv420p, without an audio stream. A unique temporary MP4 is atomically renamed after encoding succeeds. The output directory must be writable. Independent render jobs may run concurrently. If they target the same output, the last successful render wins; use distinct filenames to keep both.

## Timeline format

`duration` is in seconds. Each shot has `start`, exclusive `end`, `image` relative to the JSON file, and `focus: [x,y]` (0–1). The focus controls the crop anchor, not a facial landmark. `zoom: [from,to]`, `pan`, and `motion` are optional. Use contiguous, nonoverlapping shots spanning the entire duration.

Motion names: `particles`, `papers`, `orbits`, `focus`, `network`, `scan`, `doors`, `paths`.

Each caption has `start`, `end`, one or two `lines`, an optional highlighted line index, `size`, `note`, and `source`. Main text is near the bottom; source and note are smaller. Shorten text rather than relying on tiny fitted type. Check current destination-app overlays before publication.

Top `label`, `kicker`, and bottom `source` are editable. All animation uses timeline time, with no random seed, wall-clock timers, network fetches or paid generation calls. Image generation is a separate production step, and its cost is not included in CPU render timing.

## Validation

The production path rendered three private 30-second timelines with eight shots each. Each encoded movie fully decoded without errors, with 900 counted frames, 1080×1920 dimensions and zero audio streams. The first parallel CPU run took about 48–50 seconds per movie in the authoring environment; this is an observation, not a benchmark.

Inspect encoded frames from every shot, transitions, subtitles and final fade. The earlier SVG cutout renderer and its Remotion adapter remain separate; this new compositor does not require a browser or Remotion.
