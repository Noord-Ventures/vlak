import { ActivityRings } from "@noorddev/vlak-react";
import { UseField, UseType, UseBody, UseStack, UseKicker } from "../use-frame";

export function Use() {
  return <UseField name="activity-rings"><UseType>One day, three goals</UseType><UseBody><UseStack><UseKicker>Sunday, 6 September</UseKicker><ActivityRings label="Your activity" goals={[
    { id: "walk", label: "Walking", current: 32, target: 30, unit: "minutes" },
    { id: "move", label: "Movement breaks", current: 5, target: 8, unit: "breaks" },
    { id: "stand", label: "Standing", current: 7, target: 10, unit: "hours" },
  ]} description="Targets chosen by you. Walking includes the extra two minutes." /></UseStack></UseBody></UseField>;
}
