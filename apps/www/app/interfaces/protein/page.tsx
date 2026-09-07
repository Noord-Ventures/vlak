import type { Metadata } from "next";
import { InterfaceShell } from "../shell";
import { ProteinBoard } from "./board";
import "../interfaces.css";
import "./scene.css";

export const metadata: Metadata = { title: "Protein sequence workbench", description: "Edit a nonfunctional toy sequence and compare local variants." };

export default function Page() {
  return <InterfaceShell slug="protein"><ProteinBoard /></InterfaceShell>;
}
