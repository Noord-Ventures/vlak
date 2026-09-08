"use client";

import * as React from "react";
import { CalendarPopover, type CalendarPopoverProps } from "@noorddev/vlak-react";
import { isDate, isWallTime } from "./model";

/** Keep unfinished typing in the field while the schedule retains its last valid date. */
export function CalendarDateField({ value = "", onValueChange, type = "date", ...props }: CalendarPopoverProps) {
  const [field, setField] = React.useState({ source: value, draft: value });
  if (field.source !== value) setField({ source: value, draft: value });
  const draft = field.source === value ? field.draft : value;
  return <CalendarPopover {...props} type={type} value={draft} onValueChange={next => {
    setField({ source: value, draft: next });
    if (type === "date" ? isDate(next) : isWallTime(next)) onValueChange?.(next);
  }} />;
}
