# Interface starters

Five standalone Vite and React projects are exported from the interface studies: iPhone Duo, Android, calendar, CSV reconciliation and AI conversation.

Download them at [vlak.dev/starters](https://vlak.dev/starters/). Each ZIP contains source, CSS, local sample assets, a package manifest and a README. After extracting one:

```sh
npm install
npm run dev
```

`npm run build` creates a static `dist/` directory. `npm run typecheck` checks the source. Node 22.12 or newer is required. All dependencies install from npm. No workspace links, vendored packages or monorepo installation are needed.

The generator reads the matching core and React package versions and pins those exact versions in every download. Deploy the downloads only after that release is published and registry verification passes. A staged preview can contain starters for the next release, but that does not mean its packages are already available from npm.

## Source ownership

The source of each study remains in `apps/www/app/interfaces/`. The generator follows its local imports, includes workers and asset files, rewrites site aliases, and replaces site analytics with a no-op. Mobile exports use native system font stacks. No analytics endpoint or site navigation is included.

The catalog is `apps/www/app/starters/catalog.ts`. It supplies both the site links and the export definitions. Change a study once, then regenerate its starter:

```sh
node --experimental-strip-types scripts/build-interface-starters.mjs
```

ZIPs are written to the ignored `apps/www/public/starter/` directory during the site build. Files are ordered and ZIP timestamps fixed, so unchanged source produces byte-identical downloads. Editable projects can also be exported for local inspection:

```sh
node --experimental-strip-types scripts/build-interface-starters.mjs --out /tmp/vlak-starter-exports
```

The output path must be absent or empty. The generator never cleans an existing directory.

## Verification

```sh
node --experimental-strip-types scripts/verify-interface-starters.mjs --registry
```

Registry verification exports the ZIP files, extracts the actual archives, installs each project's declared dependencies from npm, and runs TypeScript and a production Vite build. It fails if the required release is not published. It keeps the directory and prints its path so the exact outputs can be inspected. No dependency is resolved through the workspace.

Before publication, build the packages with `pnpm build` and verify their actual release tarballs:

```sh
node --experimental-strip-types scripts/verify-interface-starters.mjs --candidate
# Or use existing pnpm pack outputs:
node --experimental-strip-types scripts/verify-interface-starters.mjs --candidate-dir /absolute/release/tarballs
```

Candidate mode is the default. It requires a complete matching package build, uses `pnpm pack`, and compares packed manifests, core props and runtime files to that build before and after testing. It temporarily changes only the extracted test projects to install those tarballs. It does not change the distributed ZIP manifests or bundle packages into downloads. It is a release preparation check, not proof of a successful npm publication. Run registry mode after publishing. Repository verification requires `pnpm` and `unzip`; downloaded starters only require Node and npm.

Run the browser smoke test against that directory to exercise each exported build, including the reconciliation worker:

```sh
node --experimental-strip-types scripts/smoke-interface-starters.mjs /absolute/export/directory
node --experimental-strip-types scripts/smoke-interface-starters.mjs /absolute/export/directory /my-prototype/
```

This uses the site's Playwright dependency and installed Chromium. The optional prefix verifies hosting under a subdirectory, including mobile image assets. Set `PLAYWRIGHT_EXECUTABLE_PATH` to use another installed Chromium executable. Screenshots are kept with the exported projects.

## Boundaries

These are editable interface studies. They do not provide authentication, hosted storage or a backend. The mobile system apps use sample data. The AI conversation uses local reply templates. Calendar and reconciliation retain the existing local file and browser-storage behaviors. Each export documents its starting file and the behavior that still needs a product-specific implementation.
