import { JSONViewer } from "@noorddev/vlak-react";

export function Use() {
  return <JSONViewer label="Vehicle data" data={{ vehicle: { range: 386, battery: 84 }, connected: true }} />;
}
