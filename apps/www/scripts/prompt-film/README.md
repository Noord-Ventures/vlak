# Prompt to interface film

A 40-second, 1080p film using Vlak's native Textarea, Button, Spinner, Card,
Callout, icons, and the original AgentsBoard. The opening is an unbranded native
form containing only the prompt field and send button. On submission, that same
textarea becomes a solid, read-only message bubble, retaining its value, position,
size and typography. Thinking and the reply share the former Send row.
The browser frame uses
the shared Vlak Button, Input, and InputGroup composition. Film motion changes geometry and
timing; the components retain their original paint and native state transitions.

The sequence types and submits a prompt, shows the assistant thinking and
replying, assembles the workspace in 3.75 seconds, and walks through reviewing
output, pausing an agent, and creating a task. The browser and its controls move
together through every camera zoom. The closing copy, “Generate instant interface with Vlak.dev”, intentionally
overprints the interface in huge left-aligned type with short irregular flashes.
All lines share one native CardTitle, font size, weight, and line-height (1.08).
Two complete light/dark cycles change the full scene through Vlak’s native theme
tokens; `themeChanges` supplies both the visual cuts and Cuelume timing.
This is a choreographed product film; the assistant response is scripted and no
generation backend is called.

## Render

From the repository root, with dependencies installed, Chrome, FFmpeg, and
Python 3 with NumPy available:

```sh
python3 apps/www/scripts/prompt-film/music.py
node apps/www/scripts/render-prompt-film.mjs --proof --stills
node apps/www/scripts/render-prompt-film.mjs --sound
node apps/www/scripts/render-prompt-film.mjs --reel --sound
```

Output defaults to `~/Movies/Vlak/prompt-to-interface`. `VLAK_VIDEO_OUTPUT`
changes the destination, `VLAK_FFMPEG` selects the encoder, and `VLAK_MUSIC`
selects the existing music WAV. The renderer retains a silent master, the
effects stem, review frames, a cover, and a JSON report beside the final MP4.

The Reel master is composed at 1080×1920 in 9:16. The prompt, attached browser
camera, captions, and closing type have independent portrait positions and
sizes. It is not a cropped or letterboxed copy of the landscape export.

## Sound

`music.py` synthesizes an original drone soundscape. Sustained sub pressure,
slow minor and suspended harmonics, filtered air, diffuse metallic clouds, and
irregular granular movement build toward the reveal. Texture enters at 9.375
and 13.125 seconds, swells into 31.875, and rings out after 37.5. There are no
arpeggios, melodic hooks, drumbeats, or sampled recordings.

`sound.mjs` maps the original Cuelume 0.2.2 effects to the retimed native
interactions and component contacts. Prompt typing cues correspond to actual
character changes at 30 fps. The Cuelume stem has no tonal bed; the final mix
uses fixed gains and a peak limiter to preserve the music's crescendo. A native
Cuelume release marks the prompt-to-bubble change. Four toggle/page cues follow
the light/dark changes, with measured levels audible under the drone. All 195
effects use the verified, unmodified Cuelume recipes.
See `../agent-film/vendor/cuelume/provenance.json` for the MIT source provenance.

Full renders exercise the original interface assertions and submit the native
form. Reports retain the bubble’s node identity and geometry, the payoff’s
uniform computed typography, and all four theme changes. Film capture disables
wall-clock CSS transitions so theme switches occur on the exact frame.
Proofs expose the same deterministic film clock and support rewind. Verify the closing text and frame spacing in the saved review PNGs,
and fully decode the final MP4 before publishing it to the film collection.
