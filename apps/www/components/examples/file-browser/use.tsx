"use client";
import { useState } from "react";
import { FileBrowser } from "@noorddev/vlak-react";
import { UseField, UseType, UseBody, UseStack, UseCopy } from "../use-frame";
const entries = [{ id: "proofs", name: "Proofs", kind: "folder" as const, children: [{ id: "cover", name: "Cover.pdf", kind: "file" as const, size: "1.2 MB" }, { id: "inside", name: "Inside pages.pdf", kind: "file" as const, size: "4.8 MB" }] }, { id: "readme", name: "Read me.txt", kind: "file" as const, size: "2 KB" }];
export function Use() {
  const [opened, setOpened] = useState("");
  return <UseField name="file-browser"><UseType>The working files</UseType><UseBody><UseStack><FileBrowser entries={entries} label="Studio files" onOpen={file => setOpened(file.name)} />{opened && <UseCopy>Opened: {opened}</UseCopy>}</UseStack></UseBody></UseField>;
}
