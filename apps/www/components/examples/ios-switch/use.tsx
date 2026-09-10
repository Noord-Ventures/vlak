"use client";
import * as React from "react";
import { IOSSwitch, IOSList, IOSListRow } from "@noorddev/vlak-react";
import { UseField } from "../use-frame";
export function Use() {
  const [enabled, setEnabled] = React.useState(true); const id = React.useId();
  return <UseField name="ios-switch"><h3 className="rs-use-type">A quiet moment</h3><div className="rs-use-stack"><IOSList title="Focus"><IOSListRow label={<label htmlFor={id}>Do not disturb</label>} description="Keep notifications quiet" trailing={<IOSSwitch id={id} checked={enabled} onCheckedChange={setEnabled} />} /></IOSList><p className="rs-use-copy" role="status">{enabled ? "Notifications are quiet." : "Notifications are allowed."}</p></div></UseField>;
}
