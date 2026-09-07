import { pageMetadata } from "@/lib/page-metadata";
import type { Metadata } from "next";
import { interfaceBySlug } from "../catalog";
import { ConceptBoard } from "../concepts/board";
import "../concepts/scene.css";
import "../interfaces.css";
import { InterfaceShell } from "../shell";

const proto = interfaceBySlug("frontier")!;

export const metadata: Metadata = pageMetadata("/interfaces/frontier", { title: proto.title, description: proto.law });

export default function Page() {
  return <InterfaceShell slug="frontier"><ConceptBoard kind="frontier" /></InterfaceShell>;
}
