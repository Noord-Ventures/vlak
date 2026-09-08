"use client";

import { useState } from "react";
import { CalendarPopover } from "@noorddev/vlak-react";
import { UseBody, UseCopy, UseField, UseKicker, UseStack, UseType } from "../use-frame";

export function Use() {
  const [date, setDate] = useState("2026-07-24");
  const [review, setReview] = useState("2026-07-23T10:30");

  return (
    <UseField name="calendar-popover">
      <UseType>Schedule</UseType>
      <UseBody>
        <UseStack>
          <UseKicker>Print run</UseKicker>
          <UseCopy>Type a date or open the calendar. The review also includes a local time.</UseCopy>
          <CalendarPopover label="Print date" value={date} onValueChange={setDate} />
          <CalendarPopover
            label="Proof review"
            type="datetime-local"
            value={review}
            onValueChange={setReview}
            hint="Local date and time, without a time zone."
          />
        </UseStack>
      </UseBody>
    </UseField>
  );
}
