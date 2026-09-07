import { SpectrumPlot } from "@noorddev/vlak-react";
import { UseField, UseType, UseBody, UseStack, UseKicker } from "../use-frame";

export function Use() {
  return <UseField name="spectrum-plot"><UseType>Inspect the signal</UseType><UseBody><UseStack>
    <UseKicker>Acquisition 042 / Synthetic example</UseKicker>
    <SpectrumPlot label="Recorded spectrum" xLabel="Wavelength" xUnit="nm" yLabel="Signal" yUnit="counts" points={[{ x: 400, y: 1 }, { x: 440, y: 2 }, { x: 480, y: 9 }, { x: 500, y: 15 }, { x: 520, y: 4 }, { x: 560, y: 2 }, { x: 600, y: 1 }]} peaks={[{ id: "feature", label: "Feature marked in the record", x: 500, y: 15 }]} />
  </UseStack></UseBody></UseField>;
}
