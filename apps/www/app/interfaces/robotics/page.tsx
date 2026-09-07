import type { Metadata } from "next";
import { InterfaceShell } from "../shell";
import { engineeringStudies } from "../engineering-studies";
import { RoboticsBoard } from "./board";
import "../interfaces.css";
import "./scene.css";

export const metadata: Metadata = { title: engineeringStudies[0].title, description: engineeringStudies[0].law };
export default function Page() { return <InterfaceShell slug="robotics"><RoboticsBoard /></InterfaceShell>; }
