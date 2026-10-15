# Cutout Lab: silent, editable vertical cartoons

An optional companion to the existing Remotion engine. Original SVG puppets and props are animated as a pure function of time. A small CPU renderer produces silent H.264 MP4s without a browser, GPU, external video API, music, or image assets.

This is a **limited-animation prototype**, not a text-to-video model or a full character animation editor. It provides controlled motion and editable typography; it does not generate photorealistic footage.

## Run the neutral example

Requirements: Node 20+, FFmpeg with libx264, and DejaVu Sans fonts installed.

```sh
cd tools/cutout-lab
npm install
node render.mjs example.mjs example.mp4
node render.mjs example.mjs poster.png --still=7 --width=720
```

Default output: 1080×1920, 30 FPS, yuv420p, H.264, no audio stream, faststart. Each render writes to a unique temporary MP4 and atomically renames it after FFmpeg exits successfully; overlapping jobs cannot corrupt the destination by interleaving writes.
`--width=720` produces a smaller 720×1280 render. The rasterizer renders the SVG directly at the requested density, preserving sharp vector typography at 1080×1920.

## Private compositions

Keep actual episodes, subjects, scripts, captions and renders outside public git, consistent with the repository README. The generic engine and neutral example are the only committed content.

A trusted local `.mjs` file exports:

```js
export const duration = 30;
export function renderSvg(seconds) {
  return '<svg xmlns="http://www.w3.org/2000/svg" width="720" height="1280">...</svg>';
}
```

`renderSvg(t)` must return the same frame irrespective of previous calls. No wall-clock timers, `Math.random()`, remote assets, or implicit browser state. Do not pass an untrusted module to the renderer: ES module imports execute code.

`art.mjs` contains editable primitives, typography, body/face variants, props, and a six-beat page shell. Its layout is deliberately separate from the old talking-head template because a silent cartoon does not need the old voice, music or face reservation. Existing templates and compositions are untouched.

## Remotion integration

`RemotionCutout.tsx` accepts the same `renderSvg` function. Import it into a **local** composition and register it in a local entrypoint. Example:

```tsx
import {Composition, registerRoot} from 'remotion';
import {RemotionCutout} from './tools/cutout-lab/RemotionCutout';
import {duration, renderSvg} from './private-content/episode.mjs';

const Episode = () => <RemotionCutout renderSvg={renderSvg}/>;
const Root = () => <Composition id="cutout" component={Episode}
  width={1080} height={1920} fps={30} durationInFrames={duration*30}/>;
registerRoot(Root);
```

Adjust import paths to the actual local entrypoint. This adapter was reviewed but not executed in the Remotion runtime in the authoring environment; the SVG/Sharp/FFmpeg path was executed for three complete 30-second episodes. Install the same font on both render machines. Browser SVG text and librsvg may differ slightly.

## Visual QA

Check at least the first readable frame, every beat midpoint, transition boundaries, and the final frame. Inspect a contact sheet and an actual video sample. Check typography fits, sources remain readable, no accidental factual claims are implied by a prop, and motion is meaningful. Use ffprobe to confirm frame count, duration, dimensions and absence of audio.

The supplied shell is a visual-review layout. Before publishing, test each social app's current UI overlay; there is no universal safe zone for every phone, caption length and app version.

## Why not only diffusion?

For explainers, a known character, precise caption, chart and repeated prop are easier to maintain in SVG/React. Use generated video only for selected shots where fluid motion is the actual value. Account for rejected generations, not only the advertised per-second cost.

Useful upstreams: [Remotion](https://github.com/remotion-dev/remotion), [agent skills](https://github.com/remotion-dev/skills), [Motion Canvas](https://github.com/motion-canvas/motion-canvas), [Manim Community](https://github.com/ManimCommunity/manim), [Hairline](https://github.com/lucasmarkes/hairline), [Anymotion](https://github.com/anymotion-agent/anymotion).
