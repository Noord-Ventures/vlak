"use client";
import * as React from "react";
import { IOSList, IOSListRow, IOSSwitch, IOSSheet, Icon } from "@noorddev/vlak-react";
import { UseField } from "../use-frame";
export function Use() {
  const [open, setOpen] = React.useState(false); const id = React.useId();
  return <UseField name="ios-list"><h3 className="rs-use-type">Connections</h3><IOSList title="This device" footer="Your settings stay with this example."><IOSListRow leading={<Icon name="wifi" size={24} />} label={<label htmlFor={id}>Wi-Fi</label>} trailing={<IOSSwitch id={id} defaultChecked />} /><IOSListRow leading={<Icon name="info" size={24} />} label="Network details" trailing="Studio" disclosure onClick={() => setOpen(true)} /></IOSList><IOSSheet title="Studio network" open={open} onOpenChange={setOpen}><IOSList><IOSListRow label="Connection" trailing="Wi-Fi" /><IOSListRow label="Address" trailing="192.168.1.24" /></IOSList></IOSSheet></UseField>;
}
