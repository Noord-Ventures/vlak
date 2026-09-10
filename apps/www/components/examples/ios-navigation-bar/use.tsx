"use client";
import * as React from "react";
import { IOSNavigationBar, IOSSegmentedControl, Icon } from "@noorddev/vlak-react";
import { UseField } from "../use-frame";
export function Use() {
  const [orientation, setOrientation] = React.useState("horizontal");
  const [page, setPage] = React.useState("Notes");
  return <UseField name="ios-navigation-bar"><h3 className="rs-use-type">Navigation</h3><div className="rs-use-stack"><IOSSegmentedControl label="Navigation placement" value={orientation} onValueChange={setOrientation} items={[{ id: "horizontal", label: "Top" }, { id: "vertical", label: "Side" }]} /><IOSNavigationBar title={page} orientation={orientation === "vertical" ? "vertical" : "horizontal"} onBack={page === "New note" ? () => setPage("Notes") : undefined} actions={[{ id: "compose", label: "New note", icon: <Icon name="plus" size={24} />, onClick: () => setPage("New note") }]} /><p className="rs-use-copy" aria-live="polite">{page === "Notes" ? "Your notes, in one place." : "A new note is ready. Back returns to the list."}</p></div></UseField>;
}
