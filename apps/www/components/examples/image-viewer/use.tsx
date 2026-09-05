import { ImageViewer } from "@noorddev/vlak-react";
import { UseField, UseType, UseBody } from "../use-frame";
export function Use() {
  return <UseField name="image-viewer"><UseType>On press</UseType><UseBody><ImageViewer label="Print proofs" images={[{ src: "/interfaces/threads/press-sheet.webp", alt: "Printed sheets laid out for review", caption: "The press sheet" }, { src: "/interfaces/threads/posters.webp", alt: "A collection of printed posters", caption: "The finished posters" }]} /></UseBody></UseField>;
}
