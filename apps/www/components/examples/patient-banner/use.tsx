import { PatientBanner } from "@noorddev/vlak-react";
import { UseBody, UseCopy, UseField, UseStack, UseType } from "../use-frame";

export function Use() {
  return <UseField name="patient-banner"><UseType>Before the visit</UseType><UseBody><UseStack>
    <UseCopy>A fictional record. Unknown context stays visible until someone reviews it.</UseCopy>
    <PatientBanner patientName="Robin Ellis" identifiers={[{ id: "record", label: "Patient ID", value: "Demo 042" }, { id: "birth", label: "Date of birth", value: "12 March 1988" }]} contextItems={[{ id: "allergies", label: "Allergies", value: "Not reviewed" }, { id: "language", label: "Preferred language", value: "English, as recorded" }, { id: "access", label: "Access requirements", value: "None recorded" }]} />
  </UseStack></UseBody></UseField>;
}
