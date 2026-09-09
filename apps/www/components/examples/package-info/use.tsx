"use client";

import { PackageInfoPreview } from "../../previews/ai-code";
import { UseField } from "../use-frame";

export function Use() {
  return <UseField name="package-info"><h3 className="rs-use-type">Compare versions and inspect dependencies</h3><div className="rs-use-body"><PackageInfoPreview /></div></UseField>;
}
