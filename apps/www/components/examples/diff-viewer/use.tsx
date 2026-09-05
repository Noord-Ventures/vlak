import { DiffViewer } from "@noorddev/vlak-react";

export function Use() {
  return <DiffViewer label="Configuration changes" before={"range: 368\nbattery: 84"} after={"range: 386\nbattery: 84"} />;
}
