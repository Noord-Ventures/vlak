import { DocsShell } from "@/components/docs-shell";
import { pageMetadata } from "@/lib/page-metadata";

export const metadata = pageMetadata("/docs/projects", { title: "Project files", description: "Save, reopen and recover local Vlak workspaces with portable project files and browser revisions." });

export default function Page() {
  return <DocsShell title="Project files" summary="Keep the work you make, and return to it later.">
    <p className="rs-t-body">Calendar, CSV reconciliation, Microscopy, Music, Wallpaper and the modernization brief share project controls. A project contains the workspace’s actual records and settings. Music projects reopen stopped; wallpaper projects retain the generated geometry.</p>
    <h2 className="section-label">Save and reopen</h2>
    <p className="rs-t-body">Choose Save project file for a portable JSON copy, or Save in browser to enable saves as you work. Recent projects opens copies stored in this browser. A file import shows a confirmation before replacing the work on screen; save the current file first if you want to keep it.</p>
    <p className="rs-t-body">Browser storage keeps up to 20 projects per workspace and 20 revisions per project. Clearing site data removes those copies. Project files are limited to 8 MiB; the workspace reports an export or storage failure without claiming the work was saved.</p>
    <h2 className="section-label">Conflicts and recovery</h2>
    <p className="rs-t-body">When another tab has saved the same project, a later save stops instead of replacing it. Open the latest revision or save your work as a separate copy. History opens an earlier revision as a copy, keeping the current saved project.</p>
    <p className="rs-t-body">Download recovery data from Recent projects before clearing damaged storage. Open that JSON file with Open project to inspect recoverable entries. Unsupported entries remain in the original recovery file. A browser backup is useful; a downloaded file is the copy you control outside the browser.</p>
    <h2 className="section-label">Projects and exports</h2>
    <p className="rs-t-body">Project files retain editable work. PNG and WAV exports are finished artifacts. Calendar’s iCalendar export and reconciliation’s CSV export serve other tools; their supported fields and formatting choices are separate from a full project backup. Microscopy exports describe a plan and never imply an acquisition occurred.</p>
    <p className="rs-t-body"><a className="rs-link" href="/interfaces/">Explore the workspaces</a> · <a className="rs-link" href="/services/">Prepare a modernization brief</a></p>
  </DocsShell>;
}
