import { pageMetadata } from "@/lib/page-metadata";
import type { Metadata } from "next";
import { InterfaceShell } from "../shell";
import { DocumentationBoard } from "./board";
import "../interfaces.css";
import "./scene.css";

export const metadata: Metadata = pageMetadata("/interfaces/documentation", { title: "Documentation", description: "A quiet documentation index and reader with contents navigation and local reading preferences." });
export default function Page() { return <InterfaceShell slug="documentation"><DocumentationBoard /></InterfaceShell>; }
