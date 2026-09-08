import type { Metadata } from "next";
import { pageMetadata } from "@/lib/page-metadata";
import { InterfaceShell } from "../shell";
import { CalendarBoard } from "./board";
import "../interfaces.css";

export const metadata: Metadata = pageMetadata("/interfaces/calendar", {
  title: "Calendar app",
  description: "A local calendar with month, week, day and agenda views, editable events, recurring schedules and iCalendar import and export.",
});

export default function Page() { return <InterfaceShell slug="calendar"><CalendarBoard /></InterfaceShell>; }
