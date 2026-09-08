import { pageMetadata } from "@/lib/page-metadata";
import type { Metadata } from "next";
import { InterfaceShell } from "../shell";
import { Board } from "./board";
import "../interfaces.css";

export const metadata: Metadata = pageMetadata("/interfaces/desktop-os", {
  title: "Desktop OS",
  description: "Four working desktops in Vlak: Mac OS, Windows, Linux and BeOS, with window management, persistent files, text editing, a terminal and everyday apps.",
});
export default function Page() { return <InterfaceShell slug="desktop-os"><Board /></InterfaceShell>; }
