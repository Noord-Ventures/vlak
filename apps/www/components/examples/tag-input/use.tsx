"use client";

import { TagInput } from "@noorddev/vlak-react";
import { UseField } from "../use-frame";

export function Use() {
  return <UseField name="tag-input"><h3 className="rs-use-type">Name the work</h3><div className="rs-use-body"><div className="rs-use-stack"><p className="rs-use-kicker">Project keywords</p><p className="rs-use-copy">Create a few useful labels. Paste a comma-separated list to add several at once.</p><TagInput label="Tags" name="tags" defaultValue={["Research", "Design"]} maxTags={5} validate={(tag) => tag.length > 24 ? "Use 24 characters or fewer" : undefined} /></div></div></UseField>;
}
