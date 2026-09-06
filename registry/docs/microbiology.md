# Microbiology

Components for well plates, supplied colony annotations and culture observation records.

## Plates and annotations

Select a supplied well or colony marker while retaining exact recorded sample and source-count context.

- [Well plate](https://vlak.dev/docs/well-plate.md): A labelled laboratory plate with supplied well states, 44px selection controls and keyboard navigation across up to 1536 wells.
- [Colony plate](https://vlak.dev/docs/colony-plate.md): A bounded plate diagram and keyboard-selectable list of supplied colony markers, with the source count kept separate from annotation totals.

## Culture observations

Keep sample identity, supplied medium and condition labels, dated observations and recording actions together.

- [Culture log](https://vlak.dev/docs/culture-log.md): A culture and sample record with supplied medium, conditions, chronological observations and host-owned recording actions.

## Data and action contracts

### Distinguish annotations from source counts

A colony marker is an annotation, not a detected organism. The supplied source count remains separate from marker totals. Missing coordinates or counts are not zero, and no segmentation or colony detection runs in the view.

### Preserve observation provenance

The host supplies sample and culture identity, observation timestamps, status and conditions. Sorting requires explicit timestamp offsets; unknown times remain explicit. These components do not infer contamination, species or culture outcomes.

### Record through the host

Actions request application work. The host owns recording, audit history and confirmed status. Example cultures and conditions are supplied display records, not laboratory procedures or recommendations.

## Install

```sh
npm install @noorddev/vlak-react
# Or vendor an individual component
npx @noorddev/vlak-cli add well-plate
```
