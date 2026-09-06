"use client";

import { useState } from "react";
import { CultureLog } from "@noorddev/vlak-react";
import { UseField, UseType, UseBody, UseStack, UseKicker } from "../use-frame";

export function Use() {
  const [reviewed, setReviewed] = useState(false);
  return <UseField name="culture-log"><UseType>Review a culture record</UseType><UseBody><UseStack>
    <UseKicker>Sample 042 / Notebook</UseKicker>
    <CultureLog label="Culture 042 observations" cultureId="C-042" sampleId="S-042" medium="Agar medium A" status={reviewed ? "Record review noted" : "Awaiting record review"} conditions={[{ id: "batch", label: "Medium batch", value: "M-17" }, { id: "station", label: "Recorded station", value: "Bench 2" }]} observations={[
      { id: "received", label: "Sample record received", dateTime: "2026-09-07T09:00:00+02:00", timeLabel: "7 September, 09:00", status: "Recorded", notes: "Sample identity and medium batch copied from the source record" },
      { id: "image", label: "Plate image attached", dateTime: "2026-09-07T10:30:00+02:00", timeLabel: "7 September, 10:30", status: "Recorded", notes: "Image P-042 and supplied colony annotations are available for review" },
    ]} actions={reviewed ? [] : [{ id: "review", label: "Record review" }]} onAction={() => setReviewed(true)} />
  </UseStack></UseBody></UseField>;
}
