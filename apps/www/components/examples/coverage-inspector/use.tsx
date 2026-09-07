import { CoverageInspector } from "@noorddev/vlak-react";
import { UseField, UseType, UseBody, UseStack, UseKicker } from "../use-frame";

export function Use() {
  return <UseField name="coverage-inspector"><UseType>Inspect coverage records</UseType><UseBody><UseStack>
    <UseKicker>Sample 042 / Recorded counts</UseKicker>
    <CoverageInspector label="Sample 042 coverage" reference="Example reference" contig="chr7" defaultValue={103} loci={[
      { position: 101, depth: 0, bases: { A: 0, C: 0, G: 0, T: 0 }, forward: 0, reverse: 0 },
      { position: 102, depth: null },
      { position: 103, depth: 24, bases: { A: 20, C: 4, G: 0, T: 0 }, forward: 12, reverse: 12 },
      { position: 104, depth: 18, bases: { A: 0, C: 0, G: 18, T: 0 }, forward: 10, reverse: 8 },
      { position: 105, depth: 22, bases: { A: 0, C: 0, G: 0, T: 22 }, forward: 11, reverse: 11 },
    ]} />
  </UseStack></UseBody></UseField>;
}
