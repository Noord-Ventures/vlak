# Releases

The site and downloadable starters must use public packages that contain the components they demonstrate. Package builds in a workspace do not establish that those APIs are available from npm.

## Prepare a candidate

Keep the root, four public package manifests, website manifest, server descriptor, portable and Claude plugin manifests, and Claude marketplace listing on one version. Pin the stdio plugin's MCP command and the Vite/Next.js example dependencies to that version. Add an unreleased changelog entry without inventing a publication date.

```sh
pnpm check:release
node --test scripts/release.test.mjs
pnpm build
pnpm typecheck
node scripts/check-release.mjs --generated
pnpm test
pnpm smoke
pnpm check:starters
pnpm --filter www build
```

`check:starters` may validate the unpublished candidate using freshly packed local tarballs in isolated test projects. The downloadable ZIPs themselves must specify exact public package versions, without a vendor directory or private package alias. Its registry mode verifies the same ZIPs against npm after publication.

Commit regenerated CSS, props, tokens, registry data, and docs with the release. Local and preview site builds are allowed for review before npm publication. They are not publication evidence.

Build packages before typechecking on a clean checkout. Workspace consumers, including the workflow examples, resolve generated package declarations. The core build generates the registry before dependent CLI and MCP builds copy it. For a single package and its prerequisites, use the dependency filter, for example `pnpm --filter @noorddev/vlak-cli... build`.

Workflow examples use `workspace:*` in the repository so checks exercise the current React package. Registry generation replaces that specifier with the exact public release in exported kits. The generated release check verifies both the standalone manifest and the CLI/MCP copies.

## Publish and deploy

1. Review and push the candidate commit. Create and push its matching version tag, such as `v0.5.0`, only when publication is intended. Pushing a version tag triggers the Release workflow and publishes all four packages. A manual dry run can use a branch; a manual publish must run on the matching tag.
2. Let package checks and consumer tarball tests pass. The workflow checks the tag against every manifest and checks bundled registry versions before publishing with provenance.
3. Verify all four exact versions exist on npm and are each tagged `latest`. The post-publication check verifies SHA-512 tarball integrity, export maps, dependencies, runtime files, declarations, CSS, tokens, props, and bundled registry content against the release checkout. Sourcemaps are excluded because they are not consumed APIs and can contain build paths.
4. Let all five starters install and build using the public registry. Run `node --experimental-strip-types scripts/verify-interface-starters.mjs --registry` to repeat this check.
5. Redeploy that verified checkout to production. No deploy hook is assumed. The Vercel production build runs the same published-release check after building packages; it stops if publication is incomplete or the site source has advanced beyond the package release.
6. Record the actual npm publication date in the release notes and shared updates feed only after verification. Keep old feed IDs and dates unchanged.

```sh
node scripts/check-published-release.mjs
```

The published check is read-only against the official npm registry. It never publishes, installs a remote package, runs package scripts, or extracts a tarball onto disk. It has no production bypass flag.

## Failed or partial publication

Keep the existing production deployment while investigating. A missing package, old `latest` tag, unexpected export map, integrity failure, or stale payload must fail the production gate. A successful local build does not override it.

If npm propagation is delayed, repeat the read-only check before redeploying. If only some packages published, inspect which immutable versions exist before retrying the release workflow on the same reviewed tag. Do not republish changed bytes under an existing version. Fix a faulty published release with a new coordinated version and repeat the checks.

If the site needs new package APIs, release those packages first. Site-only copy and layout changes may deploy under the current version when their package payload remains identical to the published release.
