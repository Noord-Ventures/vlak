"use client";
import * as React from "react";
import { IOSTabBar, Icon } from "@noorddev/vlak-react";
import { UseField } from "../use-frame";
export function Use() {
  const [tab, setTab] = React.useState("library");
  const base = React.useId();
  const items = [{ id: "library", label: "Library", icon: <Icon name="music" size={24} /> }, { id: "favorites", label: "Favorites", icon: <Icon name="star" size={24} /> }, { id: "search", label: "Search", icon: <Icon name="search" size={24} /> }];
  return <UseField name="ios-tab-bar"><h3 className="rs-use-type">Music</h3><div className="rs-use-stack"><div id={`${base}-panel`} role="tabpanel" aria-labelledby={`${base}-${tab}`} className="rs-use-stack"><p className="rs-use-kicker">{items.find(item => item.id === tab)?.label}</p><p className="rs-use-copy">{tab === "library" ? "Three records for the afternoon." : tab === "favorites" ? "The tracks you return to." : "Find an artist, album or track."}</p></div><IOSTabBar label="Music" value={tab} onValueChange={setTab} items={items.map(item => ({ ...item, buttonId: `${base}-${item.id}`, panelId: `${base}-panel` }))} /></div></UseField>;
}
