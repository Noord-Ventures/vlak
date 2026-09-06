import { IdentityDocument } from "@noorddev/vlak-react";
import { UseBody, UseCopy, UseField, UseStack, UseType } from "../use-frame";

export function Use() {
  return <UseField name="identity-document"><UseType>Your document record</UseType><UseBody><UseStack>
    <UseCopy>A fictional credential. Only the already-masked identifier reaches this view.</UseCopy>
    <IdentityDocument documentTitle="Residence document" holderName="Robin Ellis" maskedIdentifier="•••• 2048" issuer="Example civic office" issuedLabel="12 June 2025" expiresLabel="12 June 2030" status="Verification pending" statusDetail="The issuing authority has not supplied a verification decision." />
  </UseStack></UseBody></UseField>;
}
