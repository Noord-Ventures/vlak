import { parseStore } from "./model.ts";
import type { CalendarStore } from "./types.ts";

function fields(value: unknown, allowed: string[], label: string): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error(`${label} must be an object.`);
  const data = value as Record<string, unknown>;
  if (Object.keys(data).some(key => !allowed.includes(key))) throw new Error(`${label} contains unsupported fields. The project was not replaced.`);
  return data;
}
/** Project import must reject unknown data rather than silently stripping it. */
export function parseCalendarProject(value: unknown): CalendarStore {
  const data = fields(value, ["version", "calendars", "events", "view", "weekStartsOn"], "Calendar project");
  if (Array.isArray(data.calendars)) for (const calendar of data.calendars) fields(calendar, ["id", "name", "visible"], "Calendar");
  if (Array.isArray(data.events)) for (const event of data.events) {
    const item = fields(event, ["id", "calendarId", "title", "description", "location", "start", "end", "allDay", "recurrence", "exclusions"], "Event");
    if (item.recurrence !== undefined) fields(item.recurrence, ["frequency", "interval", "until", "count", "weekdays"], "Recurrence");
  }
  const parsed = parseStore(JSON.stringify(value));
  if (!parsed) throw new Error("This calendar project is not a valid calendar store.");
  return parsed;
}
