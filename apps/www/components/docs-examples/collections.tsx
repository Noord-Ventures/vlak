"use client";

import { useState, type ComponentType } from "react";
import { AlarmPanel, AudioMeter, CheckIn, CoordinateReferenceField, CultureLog, ExperimentRun, HealthMetric, JointPanel, PadInspector, TaxSummary } from "@noorddev/vlak-react";
import type { AlarmRecord, CoordinateReferenceValue, ExperimentStep, JointTargets } from "@noorddev/vlak-react";
import { DocsExample } from "@/components/docs-examples/frame";

function CivicPreview() {
  return <TaxSummary label="Annual assessment" periodLabel="2025" reference="Example 204" status="Provisional" items={[{ id: "assessment", label: "Assessed amount", amount: "€ 300.00" }, { id: "paid", label: "Payment received", amount: "− € 60.00" }]} totals={[{ id: "payable", label: "Amount payable", amount: "€ 240.00" }]} dueLabel="Payment date not supplied" />;
}
function SciencePreview() {
  const [steps, setSteps] = useState<ExperimentStep[]>([{ id: "acquire", label: "Acquire readings", status: "Recorded" }, { id: "review", label: "Review acquisition", status: "Not reviewed", actions: [{ id: "review", label: "Record review" }] }]);
  return <ExperimentRun label="Optical measurement" runId="042" status={steps[1]?.status === "Reviewed" ? "Review recorded" : "Awaiting review"} conditions={[{ id: "temperature", label: "Recorded temperature", value: "21.4 °C" }]} steps={steps} onAction={id => setSteps(current => current.map(step => step.id === id ? { ...step, status: "Reviewed", actions: [] } : step))} />;
}
function CreativePreview() {
  return <AudioMeter label="Output" channels={[{ id: "left", label: "Left", level: -12, peak: -3 }, { id: "right", label: "Right", level: -15, peak: -4 }]} />;
}
function EngineeringPreview() {
  const [alarms, setAlarms] = useState<AlarmRecord[]>([{ id: "flow", label: "Cooling flow", source: "Circulation loop", priority: "Medium", condition: "cleared", acknowledgement: "unacknowledged", shelving: "unshelved", actions: ["acknowledge", "shelve"] }, { id: "sensor", label: "Sensor connection", source: "Example instrument", condition: "active", acknowledgement: "acknowledged", shelving: "shelved", shelvedUntilLabel: "15:00, local plant time", actions: ["unshelve"] }]);
  return <AlarmPanel label="Plant alarms" alarms={alarms} onAction={(id, action) => setAlarms(current => current.map(alarm => alarm.id !== id ? alarm : action === "acknowledge" ? { ...alarm, acknowledgement: "acknowledged", actions: alarm.actions?.filter(item => item !== "acknowledge") } : { ...alarm, shelving: action === "shelve" ? "shelved" : "unshelved", shelvedUntilLabel: action === "shelve" ? "15:00, local plant time" : undefined, actions: alarm.actions?.map(item => item === "shelve" ? "unshelve" : item === "unshelve" ? "shelve" : item) }))} />;
}
function GeospatialPreview() {
  const [point, setPoint] = useState<CoordinateReferenceValue>({ reference: "site", coordinates: { east: 120.5, north: 48.25 } });
  return <CoordinateReferenceField label="Recorded survey point" axes={[{ id: "east", label: "Easting", unit: "m" }, { id: "north", label: "Northing", unit: "m" }]} references={[{ value: "site", label: "Site grid" }, { value: "project", label: "Project grid" }]} value={point} onValueChange={setPoint} />;
}
function RoboticsPreview() {
  const [targets, setTargets] = useState<JointTargets>({ shoulder: 15, slide: 0 });
  const [confirmation, setConfirmation] = useState<string>();
  return <JointPanel label="Joint targets" timeLabel="12:00:00.125" joints={[{ id: "shoulder", label: "Shoulder", unit: "deg", reported: 12.5, minimum: -90, maximum: 90 }, { id: "slide", label: "Slide", unit: "m", reported: 0, minimum: 0, maximum: 0.5 }]} value={targets} onValueChange={next => { setTargets(next); setConfirmation(undefined); }} onRequestTargets={() => setConfirmation("Draft received locally; no motion executed")} confirmedLabel={confirmation} />;
}
function ElectronicsPreview() {
  const [pad, setPad] = useState<string | null>("pad-a");
  return <PadInspector label="Connector pads" boardLabel="Example board, revision C" value={pad} onValueChange={setPad} pads={[{ id: "pad-a", reference: "J1", number: "1", net: "Supply", layers: ["Front copper", "Back copper"], type: "Through hole", shape: "Circle", geometry: [{ id: "diameter", label: "Pad diameter", value: "1.80", unit: "mm" }, { id: "drill", label: "Drill diameter", value: "0.90", unit: "mm" }] }, { id: "pad-b", reference: "J1", number: "2", net: "Return", layers: ["Front copper", "Back copper"], type: "Through hole", shape: "Oval", geometry: [{ id: "width", label: "Pad width", value: "2.20", unit: "mm" }, { id: "height", label: "Pad height", value: "1.80", unit: "mm" }] }]} />;
}
function MicrobiologyPreview() {
  const [reviewed, setReviewed] = useState(false);
  return <CultureLog label="Culture observations" cultureId="C-042" sampleId="S-042" medium="Agar medium A" status={reviewed ? "Record review noted" : "Awaiting record review"} conditions={[{ id: "batch", label: "Medium batch", value: "M-17" }]} observations={[{ id: "received", label: "Sample record received", dateTime: "2026-09-07T09:00:00+02:00", timeLabel: "7 September, 09:00", status: "Recorded" }, { id: "image", label: "Plate image attached", dateTime: "2026-09-07T10:30:00+02:00", timeLabel: "7 September, 10:30", status: "Recorded", notes: "Image and source annotations attached" }]} actions={reviewed ? [] : [{ id: "review", label: "Record review" }]} onAction={() => setReviewed(true)} />;
}

const examples: Record<string, { title: string; description: string; Preview: ComponentType }> = {
  civic: { title: "A supplied public record", description: "Fictional example data. The host application supplies the assessment and status.", Preview: CivicPreview },
  science: { title: "A recorded experimental run", description: "Synthetic readings show the run state and a review request; no instrument action runs here.", Preview: SciencePreview },
  creative: { title: "Recorded channel levels", description: "Synthetic levels show the meter surface without connecting to a media engine.", Preview: CreativePreview },
  engineering: { title: "Reported plant alarms", description: "Fictional operator records keep condition, acknowledgement, and shelving separate.", Preview: EngineeringPreview },
  geospatial: { title: "A recorded survey point", description: "Example coordinates stay paired with their supplied reference system.", Preview: GeospatialPreview },
  robotics: { title: "Joint targets and reported state", description: "Fictional readings show a target draft alongside independent controller state.", Preview: RoboticsPreview },
  electronics: { title: "Board pad inspection", description: "Example geometry and nets are supplied records; no board calculation runs here.", Preview: ElectronicsPreview },
  microbiology: { title: "A culture observation log", description: "Fictional observations retain sample, medium, and review status as supplied records.", Preview: MicrobiologyPreview },
};

export function CollectionExample({ collection }: { collection: string }) {
  const example = examples[collection];
  if (!example) return null;
  const Preview = example.Preview;
  return <DocsExample title={example.title} description={example.description}><Preview /></DocsExample>;
}

export function HealthExample() {
  return <DocsExample title="A check-in beside a reading" description="Fictional demonstration data. A product supplies the question, measurement, source, and time context."><div><CheckIn label="How is your energy?" options={[{ value: "low", label: "Low" }, { value: "steady", label: "Steady" }, { value: "high", label: "High" }]} /><HealthMetric label="Resting heart rate" value={64} unit="bpm" timeLabel="Today, 08:30 CEST" dateTime="2026-09-06T06:30:00Z" source="Wearable" /></div></DocsExample>;
}
