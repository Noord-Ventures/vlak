"use client";

import { useState } from "react";
import type { ComponentType } from "react";
import { CoordinateReferenceField, DatumTransformPicker, RasterBandMixer } from "@noorddev/vlak-react";
import type { CoordinateReferenceValue, RasterBandConfiguration } from "@noorddev/vlak-react";

function CoordinatePreview() {
  const [point, setPoint] = useState<CoordinateReferenceValue>({ reference: "site", coordinates: { east: 120.5, north: 48.25 } });
  return <CoordinateReferenceField label="Recorded survey point" axes={[{ id: "east", label: "Easting", unit: "m" }, { id: "north", label: "Northing", unit: "m" }]} references={[{ value: "site", label: "Site grid" }, { value: "project", label: "Project grid" }]} value={point} onValueChange={setPoint} />;
}

function DatumPreview() {
  const [operation, setOperation] = useState<string | null>("parameter");
  return <DatumTransformPicker label="Coordinate operation" sourceReference="Site grid" destinationReference="Project grid" value={operation} onValueChange={setOperation} transformations={[{ id: "grid", label: "Grid correction", available: true, accuracy: "0.05 m", area: "Site survey extent", grids: [{ id: "grid", label: "Correction grid", available: false }], unavailableReason: "The correction grid is missing" }, { id: "parameter", label: "Parameter transform", available: true, accuracy: "1.5 m", area: "Project extent", grids: [] }]} />;
}

function RasterPreview() {
  const [configuration, setConfiguration] = useState<RasterBandConfiguration>({ mode: "rgb", stretch: "none", red: { bandId: "b3", minimum: 0, maximum: 255 }, green: { bandId: "b2", minimum: 0, maximum: 255 }, blue: { bandId: "b1", minimum: 0, maximum: 255 }, single: { bandId: "b4", minimum: 0, maximum: 4095 } });
  return <RasterBandMixer label="Band mapping" bands={[{ id: "b1", label: "Band 1 · Blue", noDataValue: 0, unit: "counts" }, { id: "b2", label: "Band 2 · Green", noDataValue: 0, unit: "counts" }, { id: "b3", label: "Band 3 · Red", noDataValue: 0, unit: "counts" }, { id: "b4", label: "Band 4 · Near infrared", noDataValue: null, unit: "counts" }]} value={configuration} onValueChange={setConfiguration} />;
}

export const geospatialPreviews: Record<string, ComponentType> = {
  "coordinate-reference-field": CoordinatePreview,
  "datum-transform-picker": DatumPreview,
  "raster-band-mixer": RasterPreview,
};
