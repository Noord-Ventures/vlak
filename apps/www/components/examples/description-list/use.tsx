import { DescriptionList } from "@noorddev/vlak-react";

export function Use() {
  return <DescriptionList items={[{ id: "range", label: "Estimated range", value: "386 km" }, { id: "battery", label: "Battery", value: "84%" }]} />;
}
