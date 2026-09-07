# Eight specialist interfaces

The interface gallery grows from 13 to 21 studies. The eight additions appear first in the gallery and navigation, with component links, implementation notes, an agent brief, source links and a focused mobile composition for each study.

| Interface | Implemented journey |
| --- | --- |
| Microbiology notebook | Select a culture and plate record, inspect a colony, save contextual observations and request a local review. Original counts, missing coordinates and recorded zero remain distinct. |
| Genome mapping workspace | Open a bounded reference region, inspect supplied coverage and aligned bases, select a locus, save annotations and export their actual JSON records. Coverage and alignment share the selected reference position. |
| Protein sequence workbench | Edit a deliberately nonfunctional toy sequence, inspect residues, save immutable variants, compare exact substitutions and review explicit local constraints. The ribbon is an illustration and does not change with sequence edits. |
| Robotics workspace | Pause, resume or step a deterministic telemetry stream; inspect a joint, draft and request a target, confirm it separately in the simulator, and inspect missions or diagnostic events. Reported, requested and confirmed values remain separate. |
| Circuit board workspace | Inspect pads and supplied nets, use a supported prompt template, edit and apply a structured proposal, and inspect its history or assembly flags. Applying a proposal checks the original value; imported rule findings remain supplied records after edits. |
| Identity application | Validate fictional applicant details, attach or remove sample evidence, review the record and create a local receipt. Browser storage success or failure is shown accurately. |
| Patient dashboard | Inspect sample readings and care records, update local care or dose records, and save a visit note and communication preference. Activity rings show personal targets. Changes persist in the browser when storage is available. |
| Music session | Launch clips or scenes, edit sixteen-step patterns and root notes, adjust tempo and channel mix, play synthesized audio, save session JSON and export a stereo WAV. |

## Composition

Ordinary controls use Vlak Button, Input, Textarea, Select, NumberField and ToggleGroup. Domain components supply plate and culture inspection, genomic evidence, robot controls, board records, civic documents, care records and musical controls. Specialized artwork and grids keep the structure useful to their domain.

The eight specimens adapt between 612 and 816px tall on desktop. Internal regions scroll independently, keeping navigation and main actions reachable. Phones use focused screens and the shared viewport-based frame, with a 480px minimum. Switching screens preserves the selected item and local drafts. Back restores focus to its originating control. Gallery crops keep text within their cards while allowing artwork to be cropped.

## Working audio

The music interface synthesizes four instruments locally: kick, closed hats, bass and keys. Sixteen clips form four scenes. The audio clock schedules notes ahead; the visual playhead and real channel meters follow it independently. ChannelStrip controls gain, pan, mute and solo; ParameterKnob changes the instrument tone. There are no downloaded samples or new runtime dependencies.

Stop cancels both active and scheduled voices and disconnects their nodes. Hiding the document stops playback; browser audio suspension returns the UI to a resumable Play state. Clip undo restores only the last edited clip, preserving unrelated tempo and mixer changes.

Export renders four bars of the active clips through OfflineAudioContext and writes 44.1kHz, 16-bit stereo PCM WAV. The export includes the longest instrument release, including the 2.5-beat keys tail at 60 bpm. Save session writes the actual current editable session as JSON.

## Boundaries

Scientific, medical, civic and engineering records are fictional, supplied local fixtures. No lab analysis, sequence mapping, folding model, medical interpretation, identity verification, government submission or physical robot connection runs. Circuitry implements two explicit local prompt templates, a net rename and a Pilot assembly population change; it does not connect a remote model or change trace geometry. These boundaries are stated in each study's interface and build notes.

The implementation adds no runtime dependency. It remains part of the draft component expansion; no npm version is published.

## Verification

- Production static export and site typecheck pass. Biome reports no errors.
- The shared gallery and all 21 interface routes pass layout, navigation and build-with-Vlak checks. The suite covers 320, 390, 768, 1024 and 1440px and includes light and dark themes.
- The eight specialist routes pass 64 full-page light/dark accessibility and layout checks across 320, 390, 1024 and 1440px. Checks include one main landmark and page heading, unique region names, heading order, contrast, 44px targets and page/specimen overflow.
- Complete local journeys run at all four widths, including keyboard editing, focus return, review, persistence, exact data changes and real downloads. Engineering flows also exercise a 620px specimen inside a 1024px page. Keyboard helpers wait for intentional heading focus before sending the next key.
- Music checks confirm clock progress and real audio signal, pattern edits, undo preserving tempo, scene changes, mute, saved JSON and nonempty stereo WAV output. A 60 bpm step-16 keys export lasts 18.5 seconds and retains signal after the former truncated tail. A Chromium engine harness confirms active and scheduled voice cancellation and silent rapid restart with empty clips. The actual exported UI also resumes playback and its audio clock after browser audio suspension.
- Manual review covers desktop and phone specimens and gallery crops. The component packages are unchanged from the preceding checkpoint, which passed 1,091 unit/integrity tests, React 18/19 consumers, 528 byte-stable generated files and the 188-page component browser suite.

Run `node apps/www/scripts/e2e-specialist-interfaces.mjs` and `node apps/www/scripts/e2e-interfaces.mjs` against a fresh export with `SITE_URL` set to the local server. Set `PLAYWRIGHT_EXECUTABLE_PATH` when using a system Chromium. Domain helpers remain separately callable for focused journeys.
