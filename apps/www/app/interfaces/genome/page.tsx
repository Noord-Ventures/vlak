import { pageMetadata } from "@/lib/page-metadata";
import type { Metadata } from "next";
import { InterfaceShell } from "../shell";
import { GenomeBoard } from "./board";
import "../interfaces.css";
import "./scene.css";

export const metadata: Metadata = pageMetadata("/interfaces/genome", { title: "Genome mapping workspace", description: "Inspect a fictional reference, aligned reads, and local locus annotations." });

export default function Page() {
  return <InterfaceShell slug="genome"><GenomeBoard /></InterfaceShell>;
}
