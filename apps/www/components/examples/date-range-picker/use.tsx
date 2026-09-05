"use client";

import { DateRangePicker } from "@noorddev/vlak-react";
import { UseField } from "../use-frame";

export function Use() {
  return <UseField name="date-range-picker"><h3 className="rs-use-type">Time away</h3><div className="rs-use-body"><div className="rs-use-stack"><p className="rs-use-kicker">Dates, without time zones</p><p className="rs-use-copy">The end follows the start. Your device provides the calendar picker.</p><DateRangePicker label="Stay" name="stay" defaultValue={{ start: "2026-09-08", end: "2026-09-12" }} min="2026-09-01" required /></div></div></UseField>;
}
