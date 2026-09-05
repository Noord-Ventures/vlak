"use client";

import { useState } from "react";
import { DropdownMenu } from "@noorddev/vlak-react";
import { UseField } from "../use-frame";

export function Use() {
  const [includeNotes, setIncludeNotes] = useState(true);
  const [message, setMessage] = useState("Choose a format for your export.");
  return (
    <UseField name="dropdown-menu">
      <h3 className="rs-use-type">File</h3>
      <div className="rs-use-body">
        <DropdownMenu
          label="Export"
          items={[
            { label: "Document", items: [
              { label: "Portable document", onSelect: () => setMessage("Portable document selected.") },
              { label: "Plain text", onSelect: () => setMessage("Plain text selected.") },
            ] },
            { label: "Vector image", onSelect: () => setMessage("Vector image selected.") },
            { separator: true },
            { label: "Include notes", checked: includeNotes, onCheckedChange: setIncludeNotes },
          ]}
        />
        <p role="status">{message} Notes are {includeNotes ? "included" : "excluded"}.</p>
      </div>
    </UseField>
  );
}
