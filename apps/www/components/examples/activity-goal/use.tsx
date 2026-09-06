import { ActivityGoal } from "@noorddev/vlak-react";
import { UseField, UseType, UseBody, UseStack, UseKicker } from "../use-frame";

export function Use() {
  return <UseField name="activity-goal"><UseType>Work toward your own goal</UseType><UseBody><UseStack><UseKicker>Today</UseKicker><ActivityGoal label="Walking" description="Your personal daily target" current={24} target={30} unit="min" /></UseStack></UseBody></UseField>;
}
