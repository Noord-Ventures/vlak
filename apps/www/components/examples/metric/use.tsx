import { Metric } from "@noorddev/vlak-react";

export function Use() {
  return <Metric label="Estimated range" value={386} unit="km" description="Ready for your next journey" comparison="18 km more than yesterday" />;
}
