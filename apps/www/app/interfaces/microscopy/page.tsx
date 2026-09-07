import { pageMetadata } from "@/lib/page-metadata";
import { InterfaceShell } from "../shell";
import { MicroscopyBoard } from "./board";
import "../interfaces.css";
import "./scene.css";

export const metadata = pageMetadata("/interfaces/microscopy", {
  title: "Microscopy acquisition planner",
  description: "Plan stage positions, exposure sequences and multidimensional stacks before an acquisition.",
});
export default function Page() { return <InterfaceShell slug="microscopy"><MicroscopyBoard /></InterfaceShell>; }
