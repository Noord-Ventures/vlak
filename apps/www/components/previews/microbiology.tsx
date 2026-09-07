"use client";

import { useState } from "react";
import type { ComponentType } from "react";
import { ColonyPlate, CultureLog } from "@noorddev/vlak-react";

function CulturePreview() {
  const [reviewed, setReviewed] = useState(false);
  return <CultureLog label="Culture observations" cultureId="C-042" sampleId="S-042" medium="Agar medium A" status={reviewed ? "Record review noted" : "Awaiting record review"} conditions={[{ id: "batch", label: "Medium batch", value: "M-17" }]} observations={[
    { id: "received", label: "Sample record received", dateTime: "2026-09-07T09:00:00+02:00", timeLabel: "7 September, 09:00", status: "Recorded" },
    { id: "image", label: "Plate image attached", dateTime: "2026-09-07T10:30:00+02:00", timeLabel: "7 September, 10:30", status: "Recorded", notes: "Image and source annotations attached" },
  ]} actions={reviewed ? [] : [{ id: "review", label: "Record review" }]} onAction={() => setReviewed(true)} />;
}

export const microbiologyPreviews: Record<string, ComponentType> = {
  "colony-plate": () => <ColonyPlate label="Colony annotations" plateId="P-042" recordedCount={12} source="Imported source count and four annotated records" markers={[
    { id: "c1", label: "Colony 01", x: 28, y: 32, description: "Source annotation: circular outline" },
    { id: "c2", label: "Colony 02", x: 62, y: 26, description: "Source annotation: raised center" },
    { id: "c3", label: "Colony 03", x: 55, y: 68 },
    { id: "c4", label: "Colony 04", x: null, y: null },
  ]} defaultValue="c2" />,
  "culture-log": CulturePreview,
};
