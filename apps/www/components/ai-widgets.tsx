"use client";

import { useState } from "react";
import { Checkbox, DescriptionList, Toggle, Widget, WidgetEmbed } from "@noorddev/vlak-react";
import { useCalendarTheme } from "./widgets/use-calendar-theme";

const tasks = ["Agree on the first release", "Assign a decision owner", "Link the supporting sources"];

/** Local state demonstrates application content inside the same frame as an integration. */
export function ProjectWidget() {
  const [checked, setChecked] = useState<string[]>([]);
  return <Widget title="Launch checklist" provider="Project workspace" statusLabel={`${checked.length} of ${tasks.length}`} footer="Changes stay in this example.">
    {tasks.map(task => <Checkbox key={task} label={task} checked={checked.includes(task)} onCheckedChange={next => setChecked(current => next ? [...current, task] : current.filter(item => item !== task))} />)}
  </Widget>;
}

/** A provider adapter supplies the record and handles selection; the shared frame stays the same. */
export function CalendarWidget() {
  const [selected, setSelected] = useState(false);
  return <Widget title="Design review" provider="Calendar · Example integration" statusLabel="30 min" actions={<Toggle variant="subtle" aria-label="Select this time" pressed={selected} onPressedChange={setSelected}>{selected ? "Time selected" : "Select this time"}</Toggle>} footer={<span role="status">{selected ? "Time selected locally. No calendar event was created." : "Sample provider data. No account is connected."}</span>}>
    <DescriptionList items={[
      { id: "when", label: "When", value: "Thursday, 10:00–10:30" },
      { id: "with", label: "With", value: "Design team" },
    ]} />
  </Widget>;
}

/** A separate document demonstrates an iframe provider without an external account. */
export function EmbeddedCalendarWidget() {
  const syncTheme = useCalendarTheme();
  return <Widget title="Available times" provider="Calendar · Embedded example" footer="Selection stays inside this embedded example.">
    <WidgetEmbed title="Calendar time selection example" src="/widgets/calendar-demo.html" height={268} sandbox="" onLoad={syncTheme} style={{ colorScheme: "inherit" }} />
  </Widget>;
}
