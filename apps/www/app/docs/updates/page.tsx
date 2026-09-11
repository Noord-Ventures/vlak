import { CodeBlock } from "@/components/code-block";
import { UpdatesExample } from "@/components/docs-examples/guides";
import { DocsShell } from "@/components/docs-shell";
import { pageMetadata } from "@/lib/page-metadata";

export const metadata = pageMetadata("/docs/updates", { title: "Safe source updates", description: "Review installed Vlak source, preserve local edits and recover interrupted CLI updates using pinned plans." });

export default function Page() {
  return <DocsShell title="Safe source updates" summary="Review what will change before replacing installed source.">
    <UpdatesExample />
    <p className="rs-t-body">The repository CLI records source baselines when init or add writes a file. Keep its .vlak directory with your project. Files that existed and were skipped are not adopted automatically. This workflow is for copied source; package imports still follow your package manager’s update process.</p>
    <h2 className="section-label">Review and apply</h2>
    <p className="rs-t-body">Build the CLI from this checkout with <code>pnpm --filter @noorddev/vlak-cli build</code>. Run the built executable from your application directory. The commands below use <code>vlak</code> to denote that executable; check a published release’s help before assuming it includes these commands.</p>
    <CodeBlock code={"vlak status\nvlak diff\nvlak update-plan --output vlak-update.json\n# Review the diff and plan, then:\nvlak update --plan vlak-update.json"} />
    <p className="rs-t-body">The plan captures the exact incoming bytes and the current file hashes. Apply does not fetch newer source or run package scripts. Files edited after planning stop the update. Local-only edits are preserved; changes made both locally and upstream require you to reconcile them and create a new plan.</p>
    <p className="rs-t-body">For a custom registry, specify <code>--registry</code> explicitly while generating the plan. A missing component is not assumed to be a request for deletion. Keep a source-control checkpoint when reviewing dependency or integration changes.</p>
    <h2 className="section-label">Interrupted writes</h2>
    <CodeBlock code={"vlak recover\n# After reviewing the reported paths:\nvlak recover --rollback"} />
    <p className="rs-t-body">Each file is replaced through a temporary file. The complete update uses a recovery journal rather than claiming filesystem-wide atomicity. Rollback restores recognized original bytes; later unrecognized edits stop recovery before any replacements. Preserve the journal and those edits for manual recovery if necessary.</p>
    <p className="rs-t-body"><a className="rs-link" href="https://github.com/Noord-Ventures/vlak/tree/main/packages/cli">CLI source and command reference</a> · <a className="rs-link" href="/workflows/">Workflow kits</a></p>
  </DocsShell>;
}
