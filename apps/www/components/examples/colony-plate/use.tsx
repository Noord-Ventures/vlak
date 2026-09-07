import { ColonyPlate } from "@noorddev/vlak-react";
import { UseField, UseType, UseBody, UseStack, UseKicker } from "../use-frame";

export function Use() {
  return <UseField name="colony-plate"><UseType>Inspect supplied colony records</UseType><UseBody><UseStack>
    <UseKicker>Sample 042 / Plate review</UseKicker>
    <ColonyPlate label="Sample 042 colony record" plateId="P-042" recordedCount={12} source="Imported source count and four annotated records" markers={[
      { id: "c1", label: "Colony 01", x: 28, y: 32, description: "Source annotation: circular outline" },
      { id: "c2", label: "Colony 02", x: 62, y: 26, description: "Source annotation: raised center" },
      { id: "c3", label: "Colony 03", x: 55, y: 68, description: "Review note attached" },
      { id: "c4", label: "Colony 04", x: null, y: null, description: "Coordinate annotation not yet supplied" },
    ]} defaultValue="c2" />
  </UseStack></UseBody></UseField>;
}
