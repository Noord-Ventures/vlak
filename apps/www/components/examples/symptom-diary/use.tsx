import { SymptomDiary } from "@noorddev/vlak-react";
import { UseField, UseType, UseBody, UseStack, UseKicker } from "../use-frame";

export function Use() {
  return <UseField name="symptom-diary"><UseType>The past two days</UseType><UseBody><UseStack>
    <UseKicker>Personal journal / Self-reported</UseKicker>
    <SymptomDiary aria-label="Recent symptom entries" entries={[
      { id: "morning", symptom: "Headache", dateTime: "2026-09-06T09:00:00+02:00", timeLabel: "Today, 09:00 CEST", intensity: "Mild", notes: "Recorded after breakfast", details: "Slept later than usual. Added this note before leaving for work." },
      { id: "evening", symptom: "Fatigue", dateTime: "2026-09-05T18:30:00+02:00", timeLabel: "Yesterday, 18:30 CEST", intensity: "Noticeable", notes: "Recorded at the end of the workday" },
    ]} />
  </UseStack></UseBody></UseField>;
}
