# Cuelume 0.2.2

These files are copied byte for byte from the official [`cuelume@0.2.2` npm release](https://registry.npmjs.org/cuelume/0.2.2), published from commit `b879b72c01f3b3fa74c45c9b20bbd064baffb282` in [Danilaa1/cuelume](https://github.com/Danilaa1/cuelume). The release tarball's SHA-512 integrity and each retained file's SHA-256 digest are recorded in [provenance.json](provenance.json).

Copyright (c) 2026 Daniel Belyi. Distributed under the [MIT license](LICENSE). The original license is retained without changes. These scripts belong to the film renderer and are not added to Vlak's production UI or packages.

The film's [offline adapter](../../cuelume-offline.mjs) verifies every vendored file before rendering. Its temporary local server appends an export for the engine's existing `renderRecipe` function, the same function invoked by public `play()`. The adapter executes the original recipes, envelopes, filters, oscillators, shimmer feedback and shared compressor in Chrome's `OfflineAudioContext`.

Only transport is adapted: a proxy supplies each cue's film time, a seeded uniform noise stream replaces `Math.random()` during graph construction, and cleanup callbacks run on the offline audio clock at the next 128-sample render boundary. No cue is recreated with alternate synthesis code or replaced by a similar recording.

The adapter was checked against public `play()` for all seventeen cues with the same offline clock and noise seed. The resulting stereo WAVs were byte-identical, including overlapping tails and shared compression. Full-film timing and noise are repeatable; native browser graph summation can vary the final PCM bit in a fading tail. Two complete 40-second renders differed by one PCM unit at one stereo sample, below −90 dBFS.

To update, fetch the official pinned npm release, verify its integrity, replace the original files and license together, and update `provenance.json`. Do not format the vendored JavaScript; its hashes intentionally match the published package.
