import { ReferenceRange } from "@noorddev/vlak-react";
import { UseField, UseType, UseBody, UseStack, UseKicker, UseCopy } from "../use-frame";

export function Use() {
  return <UseField name="reference-range"><UseType>Read an interval</UseType><UseBody><UseStack>
    <UseKicker>Report viewer / Example data</UseKicker>
    <ReferenceRange label="Reported measurement" value={24} minimum={20} maximum={30} unit="units" rangeLabel="Interval supplied with this report" />
    <ReferenceRange label="One-sided reference" value={8} maximum={10} unit="units" />
    <UseCopy>The report supplies the units and bounds. These synthetic values demonstrate the display.</UseCopy>
  </UseStack></UseBody></UseField>;
}
