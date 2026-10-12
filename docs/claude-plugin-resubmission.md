# Claude plugin resubmission

Prepared on 2026-10-11 in response to the rejected September 10 submission. This is for the Claude Code and Cowork Plugin Directory, not the separate MCP Connectors Directory.

## Submission values

- Name: Vlak
- Repository: https://github.com/Noord-Ventures/vlak
- Plugin folder: `plugins/vlak`
- Manifest: `plugins/vlak/.claude-plugin/plugin.json`
- Website: https://vlak.dev
- Contact: renn@noord.vc
- Description: A constraint-first design system for building accessible product interfaces with React, CSS, StyleX, a shadcn-compatible registry, and machine-readable component guidance.

Do not submit `.`. The repository root contains a marketplace definition; the usable plugin manifest is in `plugins/vlak`.

## Corrections prepared

- The Claude launcher continues to use the published `@noorddev/vlak-mcp@0.5.0` package.
- The skill uses `@noorddev/vlak-cli@0.5.0` and `shadcn@4.21.4` for executable commands. Both are published versions. The shadcn path requires Node 20.18.1 or newer.
- The skill pins Vlak React and CSS installation to `0.5.0`. Import paths remain unversioned.
- The README's direct MCP installation command is pinned to `0.5.0`.
- The skill requires the same reviewed runner pins when following older MCP output or linked documentation, and does not authorize picking additional executable package versions automatically.
- CI and release validation scan the entire plugin directory for unpinned package runners and reject Vlak pins that drift from the plugin manifest's release.

## Validation

Run from the repository root:

```sh
node scripts/check-plugin-package-pins.mjs
node --test scripts/plugin-package-pins.test.mjs scripts/release.test.mjs
pnpm check:agents
pnpm --filter @noorddev/vlak-mcp test
pnpm --filter @noorddev/vlak-mcp typecheck
pnpm --filter @noorddev/vlak-mcp build
```

## Publication boundary

These corrections must be committed and pushed before submitting the GitHub folder again. Runtime changes to MCP-generated CLI and shadcn commands are a separate release concern and are not part of this submission fix. They do not modify the existing npm `0.5.0` package. Shipping those runtime changes requires a new release and updating the plugin's pin; do not attempt to republish `0.5.0` or point the plugin at an unpublished version. Until then, the corrected skill explicitly supplies the reviewed runner versions for older MCP command examples.

## Resubmit

1. Push the reviewed plugin corrections and confirm they are present at the repository's submitted revision.
2. Open https://platform.claude.com/plugins/submissions and choose **New submission**. Leave the rejected entry intact.
3. Review the current Software Directory Terms before accepting the form's agreement.
4. Use the values above, especially `plugins/vlak` for the folder.
5. Submit only after the remote files contain the fixes. Record the resulting status; submission is not approval or publication.

If the form provides a reviewer note field:

> Corrected the plugin folder to plugins/vlak, which contains .claude-plugin/plugin.json. The MCP launcher and executable package commands in the plugin skill and README use exact published versions. Added automated checks to prevent unpinned commands and release-version drift. Please scan this folder rather than the repository root.
