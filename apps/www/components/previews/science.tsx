"use client";

import { useState } from "react";
import type { ComponentType } from "react";
import { MeasurementValue, QuantityField, WellPlate, ExperimentRun, SpectrumPlot } from "@noorddev/vlak-react";
import type { ExperimentStep, QuantityValue } from "@noorddev/vlak-react";

function QuantityPreview() {
  const [quantity, setQuantity] = useState<QuantityValue>({ amount: 250, unit: "ul" });
  return <QuantityField label="Sample volume" units={[{ value: "ul", label: "µL" }, { value: "ml", label: "mL" }]} value={quantity} onValueChange={next => {
    if (next.unit && quantity.unit && next.unit !== quantity.unit && quantity.amount != null) setQuantity({ amount: next.unit === "ml" ? quantity.amount / 1000 : quantity.amount * 1000, unit: next.unit });
    else setQuantity(next);
  }} description="Change the unit to express the same entered volume" />;
}

function ExperimentPreview() {
  const [steps, setSteps] = useState<ExperimentStep[]>([{ id: "acquire", label: "Acquire readings", status: "Recorded" }, { id: "review", label: "Review acquisition", status: "Not reviewed", actions: [{ id: "review", label: "Record review" }] }]);
  return <ExperimentRun label="Optical measurement" runId="042" status={steps[1]?.status === "Reviewed" ? "Review recorded" : "Awaiting review"} conditions={[{ id: "temperature", label: "Recorded temperature", value: "21.4 °C" }]} steps={steps} onAction={id => setSteps(current => current.map(step => step.id === id ? { ...step, status: "Reviewed", actions: [] } : step))} />;
}

export const sciencePreviews: Record<string, ComponentType> = {
  "measurement-value": () => <MeasurementValue label="Sample mass" value="1.230" uncertainty={0.005} unit="g" source="Balance record, sample 042" />,
  "quantity-field": QuantityPreview,
  "well-plate": () => <WellPlate label="Plate 042" rows={["A", "B", "C"]} columns={["1", "2", "3", "4"]} wells={[{ row: "A", column: "1", label: "Control", status: "Loaded" }, { row: "A", column: "2", label: "Sample 042", status: "Loaded" }, { row: "B", column: "1", status: "Reserved", disabled: true }]} defaultValue={{ row: "A", column: "1" }} />,
  "experiment-run": ExperimentPreview,
  "spectrum-plot": () => <SpectrumPlot label="Supplied spectrum" description="Synthetic example data" xLabel="Wavelength" xUnit="nm" yLabel="Signal" yUnit="counts" points={[{ x: 400, y: 1 }, { x: 440, y: 2 }, { x: 480, y: 9 }, { x: 500, y: 15 }, { x: 520, y: 4 }, { x: 560, y: 2 }, { x: 600, y: 1 }]} peaks={[{ id: "feature", label: "Marked feature", x: 500, y: 15 }]} />,
};
