import { SequenceAlignment } from "@noorddev/vlak-react";
import { UseField, UseType, UseBody, UseStack, UseKicker } from "../use-frame";

export function Use() {
  return <UseField name="sequence-alignment"><UseType>Inspect aligned reads</UseType><UseBody><UseStack>
    <UseKicker>Sample 042 / Supplied alignment</UseKicker>
    <SequenceAlignment label="Sample 042 read alignment" contig="chr7" referenceLabel="Example reference" referenceSequence="AC-GT" positions={[101, 102, null, 103, 104]} reads={[{ id: "read1", label: "Read 001", sequence: "ACAGT" }, { id: "read2", label: "Read 002", sequence: "AC-GT" }]} defaultValue={{ startColumn: 1, endColumn: 2 }} />
  </UseStack></UseBody></UseField>;
}
