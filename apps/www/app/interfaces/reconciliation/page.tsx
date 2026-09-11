import { pageMetadata } from "@/lib/page-metadata";
import { InterfaceShell } from "../shell";
import "../interfaces.css";
import { ReconciliationBoard } from "./board";
import "./scene.css";

export const metadata = pageMetadata("/interfaces/reconciliation", {
  title: "CSV reconciliation workspace",
  description: "Compare two local CSV exports by exact text keys, review every exception, and export a reusable recipe and reconciled result.",
});

export default function Page() { return <InterfaceShell slug="reconciliation"><ReconciliationBoard /></InterfaceShell>; }
