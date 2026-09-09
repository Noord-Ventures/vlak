# AI avatar

`AiAvatar` is Vlak's original decorative dot orb. A staggered point field samples a sphere; slow, overlapping currents move its dots and shading. It is written from scratch in SVG and React, with no shader, canvas, copied artwork, or renderer dependency.

```tsx
<AiAvatar size={28} state={generating ? "thinking" : "idle"} />
```

Use `speaking` while audio is playing. The default is `idle`. States blend without restarting the animation clock. The wrapper accepts `className`; its dots inherit the surrounding text color on light and dark surfaces. Pair it with a response that names its assistant, because the avatar is decorative and hidden from assistive technology.

`paused` freezes the current image. `static` renders a still orb without a visibility observer or animation clock, suitable for older messages. Keep a live instance on the latest assistant turn.

The initial SVG is rendered on the server and remains visible without JavaScript. Reduced motion, forced colors, hidden tabs, and offscreen placement stop animation. Forced colors also makes every dot opaque. Resuming continues from the held image, without a time jump. Unmounting cancels the frame and removes listeners and observers.

The implementation is original Vlak code under the repository's MIT license. It replaces the previously vendored avatar; no third-party avatar source or runtime remains in this folder.
