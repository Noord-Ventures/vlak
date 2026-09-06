"use client";

import { useState } from "react";
import { RasterBandMixer } from "@noorddev/vlak-react";
import type { RasterBandConfiguration } from "@noorddev/vlak-react";
import { UseField, UseType, UseBody, UseStack, UseKicker, UseCopy } from "../use-frame";

export function Use() {
  const [configuration, setConfiguration] = useState<RasterBandConfiguration>({ mode: "rgb", stretch: "none", red: { bandId: "b3", minimum: 0, maximum: 255 }, green: { bandId: "b2", minimum: 0, maximum: 255 }, blue: { bandId: "b1", minimum: 0, maximum: 255 }, single: { bandId: "b4", minimum: 0, maximum: 4095 } });
  return <UseField name="raster-band-mixer"><UseType>Configure the raster display</UseType><UseBody><UseStack>
    <UseKicker>Survey tile / Example acquisition</UseKicker>
    <RasterBandMixer label="Band mapping" name="raster" bands={[{ id: "b1", label: "Band 1 · Blue", unit: "counts", noDataValue: 0 }, { id: "b2", label: "Band 2 · Green", unit: "counts", noDataValue: 0 }, { id: "b3", label: "Band 3 · Red", unit: "counts", noDataValue: 0 }, { id: "b4", label: "Band 4 · Near infrared", unit: "counts", noDataValue: null }]} value={configuration} onValueChange={setConfiguration} />
    <UseCopy>{configuration.mode === "single" ? `Single-band mapping: ${configuration.single.bandId ?? "not assigned"}` : `Three-channel mapping: ${[configuration.red.bandId, configuration.green.bandId, configuration.blue.bandId].map(band => band ?? "not assigned").join(" / ")}`}. This example edits configuration; image rendering belongs to the consuming application.</UseCopy>
  </UseStack></UseBody></UseField>;
}
