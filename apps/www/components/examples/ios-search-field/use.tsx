"use client";
import * as React from "react";
import { IOSSearchField, IOSList, IOSListRow } from "@noorddev/vlak-react";
import { UseField } from "../use-frame";
const notes = ["Studio measurements", "Braun reference", "Weekend route"];
export function Use() {
  const [query, setQuery] = React.useState("");
  const filtered = notes.filter(note => note.toLowerCase().includes(query.toLowerCase()));
  return <UseField name="ios-search-field"><h3 className="rs-use-type">Find a note</h3><div className="rs-use-stack"><IOSSearchField aria-label="Search notes" placeholder="Search" value={query} onValueChange={setQuery} /><IOSList>{filtered.map(note => <IOSListRow key={note} label={note} />)}</IOSList><p className="rs-use-copy" role="status">{filtered.length} {filtered.length === 1 ? "note" : "notes"}</p></div></UseField>;
}
