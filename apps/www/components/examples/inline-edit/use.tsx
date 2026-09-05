"use client";

import { InlineEdit } from "@noorddev/vlak-react";
import { UseField } from "../use-frame";

export function Use() {
  return <UseField name="inline-edit"><h3 className="rs-use-type">Change a detail</h3><div className="rs-use-body"><div className="rs-use-stack"><p className="rs-use-kicker">Project settings</p><p className="rs-use-copy">Edit where the value lives. Save commits it; Escape leaves it as it was.</p><InlineEdit label="Project name" name="project" defaultValue="Field study" validate={(value) => value.trim() ? undefined : "Enter a project name"} /></div></div></UseField>;
}
