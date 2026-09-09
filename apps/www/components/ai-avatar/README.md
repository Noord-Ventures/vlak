# AI avatar

`AiAvatar` is a decorative, monochrome adaptation of Orbkit Mosaic (`shdr-29`) by zzzzshawn. It belongs beside a response that names its assistant. Keep one live instance on the latest assistant turn; an orb owns a WebGL context even when its animation is paused.

```tsx
<AiAvatar size={28} state={generating ? "thinking" : "idle"} />
```

Use `speaking` only while audio is playing. The default is `idle`. The wrapper also accepts `className`.

The original shader is retained. Its `lit` and `wall` colors are white and gray, with `confetti: 0` to disable colored tiles. Its transparent canvas works over light and dark surfaces. A static mosaic appears before the first frame, if WebGL is unavailable, or while a context is lost. Forced colors uses that mosaic in the inherited text color. Reduced motion draws one representative shader frame. The runtime pauses rendering offscreen and frees its GPU resources on unmount.

## Source and license

- [Upstream repository](https://github.com/zzzzshawn/orbkit)
- [Requested registry item](https://orbkit.zzzzshawn.cloud/r/shdr-29.json), retrieved 2026-09-09
- [Original runtime](https://github.com/zzzzshawn/orbkit/blob/main/orbs/core/orbkit-core.tsx)
- [Original shader](https://github.com/zzzzshawn/orbkit/blob/main/orbs/orbs/shdr-29.tsx)
- [MIT license](./LICENSE), copyright 2026 zzzzshawn

The registry item contains both source files and requires only React. The local runtime omits unused ornamental wrappers, reports whether a frame is ready for the host fallback, catches unavailable-context errors, and observes changes to reduced motion. The shader's only source change is its local import. No shadcn or Tailwind runtime is required.
