import { MeasurementValue } from "@noorddev/vlak-react";
import { UseField, UseType, UseBody, UseStack, UseKicker } from "../use-frame";

export function Use() {
  return <UseField name="measurement-value"><UseType>Weighing record</UseType><UseBody><UseStack>
    <UseKicker>Sample 042 / Balance record</UseKicker>
    <MeasurementValue label="Sample mass" value="1.230" unit="g" uncertainty={0.005} uncertaintyLabel="Expanded uncertainty supplied with the record" source="Balance 03, 6 September" />
    <MeasurementValue label="Replicate measurement" status="pending" description="The next reading has not been received" />
  </UseStack></UseBody></UseField>;
}
