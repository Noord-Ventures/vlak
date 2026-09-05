import { ActivityTimeline } from "@noorddev/vlak-react";

export function Use() {
  return <ActivityTimeline events={[{ id: "release", title: "Revision published", dateTime: "2026-09-05T10:00:00Z", actor: "Studio", description: "Updated the vehicle controls", details: "Numeric baselines and playback spacing are now shared." }]} />;
}
