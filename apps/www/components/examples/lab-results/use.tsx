import { LabResults } from "@noorddev/vlak-react";
import { UseField, UseType, UseBody, UseStack, UseKicker } from "../use-frame";

export function Use() {
  return <UseField name="lab-results"><UseType>Report received</UseType><UseBody><UseStack>
    <UseKicker>Laboratory inbox / Example data</UseKicker>
    <LabResults label="Results in the latest report" results={[
      { id: "measurement", name: "Reported measurement", value: 24, unit: "units", minimum: 20, maximum: 30, status: "amended", dateTime: "2026-09-06T10:15:00+02:00", timeLabel: "Updated 6 Sep, 10:15 CEST", note: "This amended result replaces the earlier report" },
      { id: "analysis", name: "Additional analysis", status: "pending", note: "The laboratory has not released this result" },
      { id: "sample", name: "Sample analysis", status: "unavailable", note: "No result was included in the report" },
    ]} />
  </UseStack></UseBody></UseField>;
}
