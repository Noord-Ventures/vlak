import { AudioMeter } from "@noorddev/vlak-react";
import { UseField, UseType, UseBody, UseStack, UseKicker, UseCopy } from "../use-frame";

export function Use() {
  return <UseField name="audio-meter"><UseType>Read the output</UseType><UseBody><UseStack><UseKicker>Mix bus · supplied snapshot</UseKicker><AudioMeter label="Stereo output" channels={[{ id: "left", label: "Left", level: -12.4, peak: -3.2 }, { id: "right", label: "Right", level: -14.1, peak: -4.8 }]} /><UseCopy>Levels and peaks come from the audio host.</UseCopy></UseStack></UseBody></UseField>;
}
