import { StackNavigator } from "@noorddev/vlak-react";
import { UseField, UseType, UseBody, UseStack, UseKicker } from "../use-frame";

export function Use() {
  return <UseField name="stack-navigator"><UseType>Inspect a stack</UseType><UseBody><UseStack>
    <UseKicker>Sample 042 / Recorded image stack</UseKicker>
    <StackNavigator label="Recorded coordinates" description="Select an existing plane in the supplied stack" axes={[
      { id: "depth", label: "Depth", unit: "µm", positions: [{ value: -1 }, { value: 0 }, { value: 1 }] },
      { id: "time", label: "Time", unit: "s", positions: [{ value: 0 }, { value: 5 }, { value: 10 }] },
      { id: "channel", label: "Channel", positions: [{ value: "Phase" }, { value: "Channel 2" }] },
      { id: "stage", label: "Stage position", unit: "µm", positions: [{ value: "x 12.5, y -1.5" }, { value: "x 14.5, y -1.5" }] },
    ]} defaultValue={{ depth: 1, time: 0, channel: 0, stage: 0 }} />
  </UseStack></UseBody></UseField>;
}
