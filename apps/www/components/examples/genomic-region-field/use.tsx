import { GenomicRegionField, Button } from "@noorddev/vlak-react";
import { UseField, UseType, UseBody, UseStack, UseKicker } from "../use-frame";

export function Use() {
  return <UseField name="genomic-region-field"><UseType>Choose a reference region</UseType><UseBody><UseStack>
    <UseKicker>Sample 042 / Region of interest</UseKicker>
    <form><UseStack><GenomicRegionField label="Region to inspect" name="region" reference="Example reference" contigs={[{ id: "chr7", length: 100000 }, { id: "chr8", length: 80000 }]} defaultValue={{ contig: "chr7", start: 101, end: 105 }} description="Coordinates apply to the named reference and contig" required /><Button type="reset" variant="ghost">Reset region</Button></UseStack></form>
  </UseStack></UseBody></UseField>;
}
