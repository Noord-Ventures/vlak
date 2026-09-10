"use client";

import { useState, type ComponentType } from "react";
import { Button, Icon, IOSNavigationBar, IOSTabBar, IOSSearchField, IOSSwitch, IOSList, IOSListRow, IOSSegmentedControl, IOSSlider, IOSSheet } from "@noorddev/vlak-react";

function NavigationPreview() {
  const [title, setTitle] = useState("Messages");
  return <IOSNavigationBar title={title} onBack={() => setTitle("Inbox")} actions={[{ id: "compose", label: "New message", icon: <Icon name="edit" size={24} />, onClick: () => setTitle("New message") }]} />;
}
function TabBarPreview() {
  return <IOSTabBar label="Music sections" defaultValue="library" items={[{ id: "library", label: "Library", icon: <Icon name="music" size={24} /> }, { id: "search", label: "Search", icon: <Icon name="search" size={24} /> }, { id: "radio", label: "Radio", icon: <Icon name="headphones" size={24} /> }]} />;
}
function ListPreview() {
  const [wifi, setWifi] = useState(true);
  return <IOSList title="Connectivity"><IOSListRow label="Wi-Fi" leading={<Icon name="wifi" />} trailing={<IOSSwitch aria-label="Wi-Fi" checked={wifi} onCheckedChange={setWifi} />} /><IOSListRow label="Network" description={wifi ? "Studio" : "Not connected"} /></IOSList>;
}
function SheetPreview() {
  const [open, setOpen] = useState(false);
  return <><Button variant="ghost" onClick={() => setOpen(true)}>Open preferences</Button><IOSSheet open={open} onOpenChange={setOpen} title="Preferences" description="Choose when to receive updates."><IOSList><IOSListRow label="Notifications" trailing={<IOSSwitch aria-label="Notifications" defaultChecked />} /></IOSList></IOSSheet></>;
}
export const iosPreviews: Record<string, ComponentType> = {
  "ios-navigation-bar": NavigationPreview,
  "ios-tab-bar": TabBarPreview,
  "ios-search-field": () => <IOSSearchField aria-label="Search contacts" placeholder="Search contacts" defaultValue="Mara" />,
  "ios-switch": () => <IOSSwitch aria-label="Notifications" defaultChecked />,
  "ios-list": ListPreview,
  "ios-segmented-control": () => <IOSSegmentedControl label="Calendar view" defaultValue="week" items={[{ id: "day", label: "Day" }, { id: "week", label: "Week" }, { id: "month", label: "Month" }]} />,
  "ios-slider": () => <IOSSlider aria-label="Volume" defaultValue={64} />,
  "ios-sheet": SheetPreview,
};
