"use client";

import { TimeField } from "@noorddev/vlak-react";
import { UseField } from "../use-frame";

export function Use() {
  return <UseField name="time-field"><h3 className="rs-use-type">A place in the day</h3><div className="rs-use-body"><div className="rs-use-stack"><p className="rs-use-kicker">Studio visit</p><p className="rs-use-copy">The browser handles local time formatting and keyboard editing.</p><TimeField label="Start time" name="start-time" defaultValue="09:30" min="09:00" max="18:00" step={900} hint="Appointments start every 15 minutes" /></div></div></UseField>;
}
