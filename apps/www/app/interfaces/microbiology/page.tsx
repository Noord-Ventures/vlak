import type { Metadata } from "next";
import { InterfaceShell } from "../shell";
import { MicrobiologyBoard } from "./board";
import "../interfaces.css";
import "./scene.css";

export const metadata: Metadata = { title: "Microbiology notebook", description: "Culture records, colony inspection, and a local observation notebook." };

export default function Page() {
  return <InterfaceShell slug="microbiology"><MicrobiologyBoard /></InterfaceShell>;
}
