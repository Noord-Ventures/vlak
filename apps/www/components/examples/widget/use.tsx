"use client";

import { useId, useState } from "react";
import * as stylex from "@stylexjs/stylex";
import { Button, ButtonGroup, DescriptionList, Widget, WidgetEmbed, type WidgetStatus } from "@noorddev/vlak-react";
import { UseField } from "../use-frame";
import { useCalendarTheme } from "../../widgets/use-calendar-theme";

const states: { value: WidgetStatus; label: string }[] = [
  { value: "ready", label: "Ready" },
  { value: "loading", label: "Loading" },
  { value: "empty", label: "Empty" },
  { value: "error", label: "Error" },
];

const styles = stylex.create({
  stateGrid: {
    gridTemplateColumns: {
      default: "repeat(4, minmax(0, 1fr))",
      "@media (max-width: 640px)": "repeat(2, minmax(0, 1fr))",
    },
  },
});

export function Use() {
  const syncTheme = useCalendarTheme();
  const [status, setStatus] = useState<WidgetStatus>("ready");
  const [opened, setOpened] = useState(false);
  const summaryId = useId();
  const stateGrid = stylex.props(styles.stateGrid);

  return <UseField name="widget">
    <h3 className="rs-use-type">Workspace and connected results</h3>
    <div className="rs-use-body"><div className="rs-use-stack" style={{ gap: 24 }}>
      <p className="rs-use-copy">Workspace data, a connected result, and an embedded page share the same widget structure. These examples use recorded results; no service is connected.</p>
      <Widget title="Launch checklist" provider="This workspace" footer="Updated in this example">
        <DescriptionList items={[
          { id: "owner", label: "Owner", value: "Mina" },
          { id: "next", label: "Next step", value: "Review the final brief" },
        ]} />
      </Widget>
      <ButtonGroup
        {...stateGrid}
        aria-label="Connected widget state"
        style={{ ...stateGrid.style, display: "grid", width: "100%" }}
      >
        {states.map(state => <Button key={state.value} variant="subtle" size="sm" aria-pressed={status === state.value} onClick={() => { setStatus(state.value); setOpened(false); }}>{state.label}</Button>)}
      </ButtonGroup>
      <Widget
        title="Recent project files"
        provider="Acme Drive · example provider"
        status={status}
        emptyMessage="No files match this project."
        errorMessage="The drive could not be reached."
        onRetry={() => setStatus("ready")}
        actions={<Button variant="subtle" size="sm" aria-expanded={opened} aria-controls={opened ? summaryId : undefined} onClick={() => setOpened(value => !value)}>{opened ? "Close summary" : "Open summary"}</Button>}
        footer="Recorded source data. Try again restores the ready state."
      >
        <DescriptionList items={[
          { id: "brief", label: "Project brief", value: "Ready for review" },
          { id: "notes", label: "Research notes", value: "Three supporting sources" },
        ]} />
        {opened && <p className="rs-use-copy" id={summaryId}>The latest brief names the owner and next step. The research notes support each decision.</p>}
      </Widget>
      <Widget title="Available times" provider="Calendar · Embedded example" footer="Selection stays inside this embedded example. No calendar event is created.">
        <WidgetEmbed title="Calendar time selection example" src="/widgets/calendar-demo.html" height={268} sandbox="" onLoad={syncTheme} />
      </Widget>
    </div></div>
  </UseField>;
}
