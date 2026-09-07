import type { Metadata } from "next";
import { interfaceBySlug } from "../catalog";
import { InterfaceShell } from "../shell";
import { MusicBoard } from "./board";
import "../interfaces.css";
import "./scene.css";

const study = interfaceBySlug("music")!;
export const metadata: Metadata = { title: study.title, description: study.law };
export default function Page() { return <InterfaceShell slug="music"><MusicBoard /></InterfaceShell>; }
