# Prompt to interface film

A 40-second, 1080p film using Vlak's native MessageComposer, Spinner, Card,
Callout, icons, and the original AgentsBoard. The browser frame uses the shared
Vlak Button, Input, and InputGroup composition. Film motion changes geometry and
timing; the components retain their original paint and native state transitions.

The sequence types and submits a prompt, shows the assistant thinking and
replying, assembles the workspace in 3.75 seconds, and walks through reviewing
output, pausing an agent, and creating a task. The closing copy reads
“Generate instant interface with Vlak.dev”. This is a choreographed product film;
the assistant response is scripted and no generation backend is called.

## Render

From the repository root, with dependencies installed, Chrome, FFmpeg, and
Python 3 with NumPy available:

```sh
python3 apps/www/scripts/prompt-film/music.py
node apps/www/scripts/render-prompt-film.mjs --proof --stills
node apps/www/scripts/render-prompt-film.mjs --sound
```

Output defaults to `~/Movies/Vlak/prompt-to-interface`. `VLAK_VIDEO_OUTPUT`
changes the destination, `VLAK_FFMPEG` selects the encoder, and `VLAK_MUSIC`
selects the existing music WAV. The renderer retains a silent master, the
effects stem, review frames, a cover, and a JSON report beside the final MP4.

## Sound

`music.py` composes and synthesizes an original 128 BPM electronic crescendo.
Stereo glass plucks, warm pads, bass, and programmed percussion grow from an
intimate opening into the final reveal. Rhythm enters at 9.375 seconds, the
melodic lift at 13.125, the payoff chord at 31.875, and the ringout at 37.5.
There are no sampled recordings or borrowed melodies.

`sound.mjs` maps the original Cuelume 0.2.2 effects to the retimed native
interactions and component contacts. Prompt typing cues correspond to actual
character changes at 30 fps. The Cuelume stem has no tonal bed; the final mix
uses fixed gains and a peak limiter to preserve the music's crescendo.
See `../agent-film/vendor/cuelume/provenance.json` for the MIT source provenance.

Full renders exercise the original interface assertions and submit the real
MessageComposer. Proofs expose the same deterministic film clock and support
rewind. Verify the closing text and frame spacing in the saved review PNGs,
and fully decode the final MP4 before publishing it to the film collection.
