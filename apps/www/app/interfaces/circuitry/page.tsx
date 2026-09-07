import type { Metadata } from "next";
import { InterfaceShell } from "../shell";
import { engineeringStudies } from "../engineering-studies";
import { CircuitryBoard } from "./board";
import "../interfaces.css";
import "./scene.css";

export const metadata: Metadata = { title: engineeringStudies[1].title, description: engineeringStudies[1].law };
export default function Page() { return <InterfaceShell slug="circuitry"><CircuitryBoard /></InterfaceShell>; }
