"use client";
import * as React from "react";
import { IOSSegmentedControl, IOSList, IOSListRow } from "@noorddev/vlak-react";
import { UseField } from "../use-frame";
export function Use() {
  const [period, setPeriod] = React.useState("day");
  return <UseField name="ios-segmented-control"><h3 className="rs-use-type">Your schedule</h3><div className="rs-use-stack"><IOSSegmentedControl label="Calendar view" value={period} onValueChange={setPeriod} items={[{ id: "day", label: "Day" }, { id: "week", label: "Week" }, { id: "month", label: "Month" }]} /><IOSList><IOSListRow label="Studio review" trailing="10:30" />{period !== "day" && <IOSListRow label="Material delivery" trailing="Thursday" />}{period === "month" && <IOSListRow label="Open studio" trailing="24 September" />}</IOSList></div></UseField>;
}
