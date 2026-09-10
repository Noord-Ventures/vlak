"use client";

import { useState, type ComponentType } from "react";
import {
  AndroidAppBar, AndroidAppBarAction, AndroidNavigation, AndroidSearchBar,
  AndroidSwitch, AndroidList, AndroidListRow, AndroidChip, AndroidFab,
  AndroidSheet, AndroidSheetTitle, AndroidSheetBody, Button, Icon,
} from "@noorddev/vlak-react";

function AppBarPreview() {
  const [title, setTitle] = useState("Messages");
  return <AndroidAppBar title={title}
    navigation={<AndroidAppBarAction aria-label="Back to inbox" onClick={() => setTitle("Inbox")}><Icon name="arrow-left" size={24} /></AndroidAppBarAction>}
    actions={<AndroidAppBarAction aria-label="Search messages" onClick={() => setTitle("Search messages")}><Icon name="search" size={24} /></AndroidAppBarAction>} />;
}

function NavigationPreview() {
  return <AndroidNavigation aria-label="Music sections" defaultValue="library" items={[
    { value: "library", label: "Library", icon: <Icon name="music" size={24} /> },
    { value: "search", label: "Search", icon: <Icon name="search" size={24} /> },
    { value: "radio", label: "Radio", icon: <Icon name="headphones" size={24} /> },
  ]} />;
}

function ListPreview() {
  const [wifi, setWifi] = useState(true);
  return <AndroidList aria-label="Connectivity">
    <AndroidListRow headline="Wi-Fi" supportingText={wifi ? "Connected to Studio" : "Off"} leading={<Icon name="wifi" size={24} />}
      trailing={<AndroidSwitch aria-label="Wi-Fi" checked={wifi} onCheckedChange={setWifi} />} />
    <AndroidListRow headline="Network" supportingText={wifi ? "Studio" : "Not connected"} />
  </AndroidList>;
}

function FabPreview() {
  const [created, setCreated] = useState(false);
  return <AndroidFab icon={<Icon name={created ? "check" : "plus"} size={24} />} onClick={() => setCreated(value => !value)}>
    {created ? "Note added" : "New note"}
  </AndroidFab>;
}

function SheetPreview() {
  const [open, setOpen] = useState(false);
  return <><Button variant="ghost" onClick={() => setOpen(true)}>Open preferences</Button>
    <AndroidSheet open={open} onOpenChange={setOpen}>
      <AndroidSheetTitle>Preferences</AndroidSheetTitle>
      <AndroidSheetBody>Choose when to receive updates.</AndroidSheetBody>
      <AndroidList aria-label="Notification preferences"><AndroidListRow headline="Notifications" trailing={<AndroidSwitch aria-label="Notifications" defaultChecked />} /></AndroidList>
    </AndroidSheet>
  </>;
}

export const androidPreviews: Record<string, ComponentType> = {
  "android-app-bar": AppBarPreview,
  "android-navigation": NavigationPreview,
  "android-search-bar": () => <AndroidSearchBar aria-label="Search contacts" placeholder="Search contacts" defaultValue="Mara" />,
  "android-switch": () => <AndroidSwitch aria-label="Notifications" defaultChecked />,
  "android-list": ListPreview,
  "android-chip": () => <AndroidChip defaultSelected>Downloaded</AndroidChip>,
  "android-fab": FabPreview,
  "android-sheet": SheetPreview,
};
