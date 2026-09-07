import { pageMetadata } from "@/lib/page-metadata";
import type { Metadata } from "next";
import { careStudies } from "../care-studies";
import { InterfaceShell } from "../shell";
import { IdentityBoard } from "./board";
import "../interfaces.css";
import "./scene.css";

const study = careStudies[0];
export const metadata: Metadata = pageMetadata("/interfaces/identity", { title: study.title, description: study.law });

export default function Page() {
  return <InterfaceShell slug="identity"><IdentityBoard /></InterfaceShell>;
}
