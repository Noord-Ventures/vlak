"use client";

import { Button, Icon, Select } from "@noorddev/vlak-react";
import type { IconName } from "@noorddev/vlak-react";
import { PlatformGlyph } from "./platform-glyph";
import { PlatformRange, PlatformSwitch } from "./platform-controls";

type SettingsProps = {
  deviceName?: string; androidVersion?: string;
  screen: string; navigate: (screen: string) => void;
  search: string; onSearch: (search: string) => void;
  appearance: string; setAppearance: (value: string) => void;
  textSize: number; setTextSize: (value: number) => void;
  brightness: number; setBrightness: (value: number) => void;
  wifi: boolean; setWifi: (value: boolean) => void;
  bluetooth: boolean; setBluetooth: (value: boolean) => void;
  airplane: boolean; setAirplane: (value: boolean) => void;
  lowPower: boolean; setLowPower: (value: boolean) => void;
  focus: boolean; setFocus: (value: boolean) => void;
};

export const androidSettingsTitles: Record<string, string> = { network: "Network & internet", connected: "Connected devices", display: "Display", battery: "Battery", notifications: "Notifications", about: "About phone" };
const categories: { id: string; icon: IconName; subtitle: string }[] = [
  { id: "network", icon: "wifi", subtitle: "Wi-Fi, mobile, data usage and hotspot" },
  { id: "connected", icon: "phone", subtitle: "Bluetooth, pairing" },
  { id: "notifications", icon: "bell", subtitle: "Notification history, conversations" },
  { id: "battery", icon: "power", subtitle: "84% · Battery Saver" },
  { id: "display", icon: "sun", subtitle: "Dark theme, font size, brightness" },
  { id: "about", icon: "info", subtitle: "Device, version, storage" },
];
function SettingSwitch({ title, detail, checked, onChange }: { title: string; detail?: string; checked: boolean; onChange: (value: boolean) => void }) {
  return <div className="mo-setting-switch"><span>{title}{detail && <small>{detail}</small>}</span><PlatformSwitch aria-label={title} checked={checked} onCheckedChange={onChange} /></div>;
}

export function AndroidSettings(p: SettingsProps) {
  if (!p.screen) return <><div className="mo-android-search-field"><Icon name="search" size={24} /><input type="search" className="mo-android-settings-search" aria-label="Search settings" placeholder="Search settings" value={p.search} onChange={event => p.onSearch(event.target.value)} /></div><div className="mo-android-settings-list">{categories.filter(row => `${androidSettingsTitles[row.id]} ${row.subtitle}`.toLowerCase().includes(p.search.toLowerCase())).map(row => <Button className="mo-android-setting-row" variant="ghost" key={row.id} onClick={() => p.navigate(row.id)}>{row.id === "battery" ? <PlatformGlyph name="battery" /> : <Icon name={row.icon} size={24} />}<span><strong>{androidSettingsTitles[row.id]}</strong><small>{row.id === "about" ? p.deviceName ?? "Pixel 11" : row.subtitle}</small></span><Icon name="chevron-right" size={24} /></Button>)}</div></>;
  if (p.screen === "network") return <div className="mo-settings-section"><SettingSwitch title="Use Wi-Fi" checked={p.wifi} onChange={p.setWifi} /><div className="mo-data-row"><span>Studio network</span><span>{p.wifi ? "Connected" : "Off"}</span></div><SettingSwitch title="Airplane mode" checked={p.airplane} onChange={p.setAirplane} /><p className="mo-caption">Sample connections. Your device network is not changed.</p></div>;
  if (p.screen === "connected") return <div className="mo-settings-section"><SettingSwitch title="Use Bluetooth" checked={p.bluetooth} onChange={p.setBluetooth} /><div className="mo-data-row"><span>Studio headphones</span><span>{p.bluetooth ? "Available" : "Off"}</span></div><p className="mo-caption">No Bluetooth connection is made.</p></div>;
  if (p.screen === "display") return <div className="mo-settings-section"><div className="mo-field"><span>Brightness level · {p.brightness}%</span><PlatformRange aria-label="Display brightness" min={30} max={100} value={p.brightness} onValueChange={p.setBrightness} /></div><SettingSwitch title="Dark theme" checked={p.appearance === "dark"} onChange={value => p.setAppearance(value ? "dark" : "light")} /><div className="mo-field"><span>Color scheme</span><Select fullWidth aria-label="Appearance" value={p.appearance} options={[{ value: "system", label: "Follow website" }, { value: "light", label: "Light" }, { value: "dark", label: "Dark" }]} onValueChange={p.setAppearance} /></div><div className="mo-field"><span>Font size</span><PlatformRange aria-label="Text size" min={100} max={125} step={5} value={p.textSize} onValueChange={p.setTextSize} /></div><p className="mo-android-text-sample">The quick brown fox jumps over the lazy dog.</p></div>;
  if (p.screen === "battery") return <div className="mo-settings-section"><div className="mo-android-battery-summary"><strong>84<span>%</span></strong><p>Sample battery level</p></div><SettingSwitch title="Battery Saver" detail="Reduce background activity" checked={p.lowPower} onChange={p.setLowPower} /><p className="mo-caption">This setting only changes the sample phone.</p></div>;
  if (p.screen === "notifications") return <div className="mo-settings-section"><SettingSwitch title="Do Not Disturb" detail="Pause interruptions" checked={p.focus} onChange={p.setFocus} /><p className="mo-caption">Notifications are generated locally in this example.</p></div>;
  return <div className="mo-settings-section"><div className="mo-data-row"><span>Device name</span><strong>{p.deviceName ?? "Pixel 11"}</strong></div><div className="mo-data-row"><span>Android version</span><strong>{p.androidVersion ?? "17"}</strong></div><div className="mo-data-row"><span>Interface</span><strong>Material 3 Expressive</strong></div><div className="mo-data-row"><span>Storage</span><span>This browser tab</span></div><p className="mo-caption">A fictional local device. No Google Account is connected.</p></div>;
}
