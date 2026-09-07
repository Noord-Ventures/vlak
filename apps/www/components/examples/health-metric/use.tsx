import { HealthMetric } from "@noorddev/vlak-react";
import { UseField, UseType, UseBody, UseStack, UseKicker } from "../use-frame";

export function Use() {
  return <UseField name="health-metric"><UseType>Morning check-in</UseType><UseBody><UseStack>
    <UseKicker>Wearable sync / 6 September</UseKicker>
    <HealthMetric label="Resting heart rate" value={64} unit="bpm" dateTime="2026-09-06T07:20:00+02:00" timeLabel="Today, 07:20 CEST" source="Wrist sensor" />
    <HealthMetric label="Sleep duration" value="7 h 35 min" status="stale" dateTime="2026-09-05T07:00:00+02:00" timeLabel="Yesterday, 07:00 CEST" source="Sleep log" description="Today's sleep record has not synced yet" />
  </UseStack></UseBody></UseField>;
}
