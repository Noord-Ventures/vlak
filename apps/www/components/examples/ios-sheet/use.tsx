"use client";
import * as React from "react";
import { IOSSheet, IOSList, IOSListRow, IOSSwitch, Button, Input } from "@noorddev/vlak-react";
import { UseField } from "../use-frame";
export function Use() {
  const [open, setOpen] = React.useState(false); const [name, setName] = React.useState("Studio"); const [saved, setSaved] = React.useState("Studio"); const id = React.useId();
  return <UseField name="ios-sheet"><h3 className="rs-use-type">Edit a focus</h3><div className="rs-use-stack"><p className="rs-use-copy">{saved}</p><Button onClick={() => setOpen(true)}>Edit focus</Button></div><IOSSheet title="Edit focus" description="Choose a name and notification preference." open={open} onOpenChange={setOpen}><form className="rs-use-stack" onSubmit={event => { event.preventDefault(); setSaved(name.trim()); setOpen(false); }}><label htmlFor={`${id}-name`}>Name</label><Input id={`${id}-name`} required value={name} onChange={event => setName(event.currentTarget.value)} /><IOSList><IOSListRow label={<label htmlFor={`${id}-quiet`}>Quiet notifications</label>} trailing={<IOSSwitch id={`${id}-quiet`} defaultChecked />} /></IOSList><Button type="submit">Save focus</Button></form></IOSSheet></UseField>;
}
