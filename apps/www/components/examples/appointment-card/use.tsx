"use client";

import * as React from "react";
import { AppointmentCard, Button } from "@noorddev/vlak-react";
import { UseBody, UseCopy, UseField, UseStack, UseType } from "../use-frame";

export function Use() {
  const [detailsOpen, setDetailsOpen] = React.useState(false);
  const detailsId = React.useId();
  return <UseField name="appointment-card"><UseType>Next visit</UseType><UseBody><UseStack>
    <UseCopy>A fictional booking with a supplied timezone and confirmation status.</UseCopy>
    <AppointmentCard appointmentTitle="Care team check-in" dateLabel="18 September 2026" timeLabel="10:30–11:00" timeZone="Europe/Amsterdam, UTC+02:00" dateTime="2026-09-18T10:30:00+02:00" clinician="Alex Morgan" location="Room 04, demo clinic" status="Confirmed">
      <Button variant="ghost" aria-expanded={detailsOpen} aria-controls={detailsId} onClick={() => setDetailsOpen(open => !open)}>{detailsOpen ? "Hide booking details" : "View booking details"}</Button>
    </AppointmentCard>
    <div id={detailsId} hidden={!detailsOpen}><UseCopy>Booking reference: Demo 204. This example does not connect to a clinic.</UseCopy></div>
  </UseStack></UseBody></UseField>;
}
