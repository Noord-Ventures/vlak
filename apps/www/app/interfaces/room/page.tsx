import { pageMetadata } from "@/lib/page-metadata";
import type { Metadata } from "next";
import { interfaceBySlug } from "../catalog";
import { InterfaceShell } from "../shell";
import "../interfaces.css";
import "./scene.css";
import { Board } from "./board";

const proto = interfaceBySlug("room")!;

export const metadata: Metadata = pageMetadata("/interfaces/room", {
  title: proto.title,
  description: proto.law,
});

export default function Page() {
  return (
    <InterfaceShell slug="room">
      <Board />
    </InterfaceShell>
  );
}
