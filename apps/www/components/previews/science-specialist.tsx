"use client";

import { useState } from "react";
import type { ComponentType } from "react";
import { StackNavigator, AcquisitionSequencer, SequenceAlignment, CoverageInspector, GenomicRegionField } from "@noorddev/vlak-react";
import type { AcquisitionStep } from "@noorddev/vlak-react";

function AcquisitionPreview() {
  const [steps, setSteps] = useState<readonly AcquisitionStep[]>([
    { id: "baseline", label: "Baseline", exposure: 10, exposureUnit: "ms", time: 0, timeUnit: "s", depth: -1, depthUnit: "µm", channel: "phase", status: "Not run", actions: [{ id: "review", label: "Record plan review" }] },
    { id: "followup", label: "Follow-up", exposure: 20, exposureUnit: "ms", time: 5, timeUnit: "s", depth: 0, depthUnit: "µm", channel: "phase", status: "Not run" },
  ]);
  return <AcquisitionSequencer label="Capture plan" steps={steps} channels={[{ id: "phase", label: "Phase" }, { id: "channel2", label: "Channel 2" }]} onStepsChange={setSteps} onAction={id => setSteps(current => current.map(step => step.id === id ? { ...step, confirmedLabel: "Plan review recorded; capture has not run", actions: [] } : step))} />;
}

export const scienceSpecialistPreviews: Record<string, ComponentType> = {
  "stack-navigator": () => <StackNavigator label="Stack coordinates" axes={[
    { id: "depth", label: "Depth", unit: "µm", positions: [{ value: -1 }, { value: 0 }, { value: 1 }] },
    { id: "time", label: "Time", unit: "s", positions: [{ value: 0 }, { value: 5 }, { value: 10 }] },
    { id: "channel", label: "Channel", positions: [{ value: "Phase" }, { value: "Channel 2" }] },
    { id: "stage", label: "Stage position", unit: "µm", positions: [{ value: "x 12.5, y -1.5" }, { value: "x 14.5, y -1.5" }] },
  ]} defaultValue={{ depth: 1, time: 0, channel: 0, stage: 0 }} />,
  "acquisition-sequencer": AcquisitionPreview,
  "sequence-alignment": () => <SequenceAlignment label="Read alignment" contig="chr7" referenceLabel="Example reference" referenceSequence="AC-GT" positions={[101, 102, null, 103, 104]} reads={[{ id: "read1", label: "Read 001", sequence: "ACAGT" }, { id: "read2", label: "Read 002", sequence: "AC-GT" }]} defaultValue={{ startColumn: 1, endColumn: 2 }} />,
  "coverage-inspector": () => <CoverageInspector label="Supplied coverage" reference="Example reference" contig="chr7" defaultValue={103} loci={[{ position: 101, depth: 0, bases: { A: 0, C: 0 }, forward: 0, reverse: 0 }, { position: 102, depth: null }, { position: 103, depth: 24, bases: { A: 20, C: 4 }, forward: 12, reverse: 12 }, { position: 104, depth: 18, forward: 10, reverse: 8 }, { position: 105, depth: 22, forward: 11, reverse: 11 }]} />,
  "genomic-region-field": () => <GenomicRegionField label="Reference region" reference="Example reference" contigs={[{ id: "chr7", length: 100000 }, { id: "chr8", length: 80000 }]} defaultValue={{ contig: "chr7", start: 101, end: 105 }} required />,
};
