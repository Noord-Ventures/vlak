/** Calendar dates use local wall time (YYYY-MM-DDTHH:mm), including exclusive all-day ends. */
export type CalendarView = "month" | "week" | "day" | "agenda";
export type Frequency = "daily" | "weekly" | "monthly" | "yearly";
export interface Recurrence {
  frequency: Frequency;
  interval: number;
  /** Inclusive local date. Omit for an ongoing series. */
  until?: string;
  count?: number;
  /** Sunday is 0. Weekly rules only. */
  weekdays?: number[];
}
export interface CalendarEvent {
  id: string;
  calendarId: string;
  title: string;
  description: string;
  location: string;
  start: string;
  end: string;
  allDay: boolean;
  recurrence?: Recurrence;
  /** Original occurrence start wall times excluded from this series. */
  exclusions?: string[];
}
export interface CalendarCollection { id: string; name: string; visible: boolean }
export interface CalendarStore {
  version: 1;
  calendars: CalendarCollection[];
  events: CalendarEvent[];
  view: CalendarView;
  weekStartsOn: 0 | 1;
}
export interface Occurrence {
  key: string;
  eventId: string;
  /** Original start identifies one occurrence when moving or removing it. */
  originalStart: string;
  start: string;
  end: string;
  event: CalendarEvent;
}
export interface CalendarViewsProps {
  view: CalendarView;
  date: string;
  today: string;
  weekStartsOn: 0 | 1;
  occurrences: Occurrence[];
  calendars: CalendarCollection[];
  onDate: (date: string) => void;
  onCreate: (start: string, allDay?: boolean) => void;
  onOpen: (occurrence: Occurrence) => void;
  /** Receives the new local start; the board preserves duration and asks series scope. */
  onMove: (occurrence: Occurrence, start: string) => void;
}
