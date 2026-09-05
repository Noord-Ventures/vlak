"use client";

import { FileUpload } from "@noorddev/vlak-react";
import { UseField } from "../use-frame";

export function Use() {
  return <UseField name="file-upload"><h3 className="rs-use-type">Attach the context</h3><div className="rs-use-body"><div className="rs-use-stack"><p className="rs-use-kicker">Project files</p><p className="rs-use-copy">Add a brief or notes. This example keeps the selected files on your device.</p><FileUpload label="Choose project files" name="attachments" accept=".pdf,.txt" maxFiles={5} maxSize={10 * 1024 * 1024} description="PDF or text, up to 10 MB each" /></div></div></UseField>;
}
