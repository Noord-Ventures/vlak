import { pageMetadata } from "@/lib/page-metadata";
import type { Metadata } from "next";
import { interfaceBySlug } from "../catalog";
import { InterfaceShell } from "../shell";
import { AgentsBoard } from "./board";
import "../interfaces.css";
import "./scene.css";

const study = interfaceBySlug("agents")!;

export const metadata: Metadata = pageMetadata("/interfaces/agents", {
  title: study.title,
  description: study.law,
});

export default function Page() {
  return <InterfaceShell slug="agents"><AgentsBoard /></InterfaceShell>;
}
