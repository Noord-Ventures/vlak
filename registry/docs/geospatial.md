# Geospatial

Controls for coordinate reference assignment, datum transformation selection and raster band configuration.

## Coordinates and transformations

Keep coordinate values, axis order and reference identity together; select a supplied transformation with its accuracy and grid availability.

- [Coordinate reference field](https://vlak.dev/docs/coordinate-reference-field.md): Two or three numeric coordinate axes with supplied units and a reference selector that preserves entered values when assigning a reference.
- [Datum transform picker](https://vlak.dev/docs/datum-transform-picker.md): A Vlak transformation selector with source and destination references, supplied accuracy and area, and visible support-grid availability.

## Raster display

Assign source bands to display channels and edit explicit stretch bounds without modifying source pixels.

- [Raster band mixer](https://vlak.dev/docs/raster-band-mixer.md): A raster configuration editor with source-band mapping, single or three-channel modes, supplied stretch bounds and explicit missing-data metadata.

## Data and action contracts

### Assignment is distinct from reprojection

Changing the selected reference leaves entered coordinates unchanged. The host owns validated reprojection, axis-order conversion, reference lookup and any transformation grid files.

### Explain unavailable transformations

Supply source and destination references, candidate operations, accuracy labels, area-of-use context and grid availability. Missing prerequisites remain visible with reasons rather than silently selecting a fallback.

### Keep rendering in the host

RasterBandMixer emits band and stretch configuration. The application loads pixels, handles no-data values, computes statistics and renders the image. Unit changes and displayed limits never imply a conversion of source values.

## Install

```sh
npm install @noorddev/vlak-react
# Or vendor an individual component
npx @noorddev/vlak-cli add coordinate-reference-field
```
