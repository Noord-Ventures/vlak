import { pageMetadata } from "@/lib/page-metadata";
import type { Metadata } from "next";
import { interfaceBySlug } from "../catalog";
import { RenderBoard } from "../concepts/render";
import "../concepts/render.css";
import "../interfaces.css";
import { InterfaceShell } from "../shell";

const proto = interfaceBySlug("render")!;

export const metadata: Metadata = pageMetadata("/interfaces/render", { title: proto.title, description: proto.law });

export default function Page() {
  return <InterfaceShell slug="render"><RenderBoard /></InterfaceShell>;
}
