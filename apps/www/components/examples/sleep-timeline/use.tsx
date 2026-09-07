import { SleepTimeline } from "@noorddev/vlak-react";
import { UseField, UseType, UseBody, UseStack, UseKicker } from "../use-frame";

export function Use() {
  return <UseField name="sleep-timeline"><UseType>A record of the night</UseType><UseBody><UseStack><UseKicker>6–7 September 2026</UseKicker><SleepTimeline label="Recorded sleep" description="Local time, including a gap in the recording" start={0} end={480} startLabel="22:30" endLabel="06:30" intervals={[
    { id: "first", start: 0, end: 225, startLabel: "22:30", endLabel: "02:15", state: "asleep" },
    { id: "awake", start: 225, end: 240, startLabel: "02:15", endLabel: "02:30", state: "awake" },
    { id: "second", start: 255, end: 480, startLabel: "02:45", endLabel: "06:30", state: "asleep" },
  ]} /></UseStack></UseBody></UseField>;
}
