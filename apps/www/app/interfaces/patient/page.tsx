import type { Metadata } from "next";
import { careStudies } from "../care-studies";
import { InterfaceShell } from "../shell";
import { PatientBoard } from "./board";
import "../interfaces.css";
import "./scene.css";

const study = careStudies[1];
export const metadata: Metadata = { title: study.title, description: study.law };

export default function Page() {
  return <InterfaceShell slug="patient"><PatientBoard /></InterfaceShell>;
}
