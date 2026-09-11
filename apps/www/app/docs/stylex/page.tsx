import { pageMetadata } from "@/lib/page-metadata";
import type { Metadata } from "next";
import { CodeBlock } from "@/components/code-block";
import { StylexCompileExample } from "@/components/docs-examples/foundations";
import { DocsExample } from "@/components/docs-examples/frame";
import { DocsShell } from "@/components/docs-shell";
import { DOOR } from "../../specimen";

export const metadata: Metadata = pageMetadata("/docs/stylex", {
  title: "StyleX",
  description: "Write your own leaves against Vlak tokens, compile them with Vite or Next, or skip the compiler.",
  alternates: { canonical: `${DOOR}/docs/stylex/` },
});

const leaf = `import * as stylex from "@stylexjs/stylex";
import { vlak, mq } from "@noorddev/vlak-react/tokens.stylex";

const styles = stylex.create({
  panel: {
    borderTopWidth: vlak.hairline,
    borderTopStyle: "solid",
    borderTopColor: vlak.divider,
    padding: vlak.pad,
    color: vlak.ink,
    backgroundColor: vlak.paper,
    [mq.phone]: { padding: 12 },
    [mq.reduce]: { transition: "none" },
  },
});

export function Panel(props: React.HTMLAttributes<HTMLDivElement>) {
  return <div {...props} {...stylex.props(styles.panel)} />;
}`;

const vars = [
  ["paper, ink, gray", "--bg, --text, --text-secondary"],
  ["divider, dividerSubtle, gridLine, tableAlt", "the four grays"],
  ["controlBorder", "--control-border, 3:1 against the ground"],
  ["radiusSm, radius, radiusChrome, radiusIn", "the radius family"],
  ["pad, gutter, module", "--pad, --gutter, --grid-size"],
  ["hit, controlH, controlFs, controlLabel", "the control scale"],
  ["durationSnap, duration, durationConfirm, ease, transition", "motion"],
  ["textScale, hairline", "--text-scale and the literal 1px"],
];

const mqs = [
  ["phone", "max-width: 640px"],
  ["mobileGrid", "max-width: 480px"],
  ["at900, at899", "the rail boundary"],
  ["rail", "min-width: 1024px"],
  ["wide", "min-width: 1440px"],
  ["reduce", "prefers-reduced-motion: reduce"],
  ["touch", "hover: none"],
  ["forcedColors", "forced-colors: active"],
];

const vite = `// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import stylex from "@stylexjs/unplugin";

export default defineConfig({
  plugins: [
    // Finds packages that depend on @stylexjs/stylex, @noorddev/vlak-react
    // included, and compiles their StyleX along with yours.
    stylex.vite({ useCSSLayers: true }),
    react(),
  ],
});`;

const nextConfig = `// next.config.mjs (what vlak.dev does)
// A Babel pre-loader runs @stylexjs/babel-plugin on app/ and components/
// only. SWC keeps everything else. Vlak arrives precompiled from
// node_modules, so it is not in the include list.
const stylexBabelOptions = {
  dev: false,
  runtimeInjection: false,
  treeshakeCompensation: true,
  unstable_moduleResolution: { type: "commonJS", rootDir: process.cwd() },
};

const stylexRule = (test, isTSX) => ({
  test,
  enforce: "pre",
  include: [path.join(here, "app"), path.join(here, "components")],
  use: [{
    loader: "babel-loader",
    options: {
      babelrc: false,
      configFile: false,
      plugins: [
        ["@babel/plugin-syntax-typescript", { isTSX }],
        "@babel/plugin-syntax-jsx",
        ["@stylexjs/babel-plugin", stylexBabelOptions],
      ],
    },
  }],
});

export default {
  output: "export",
  webpack: (config) => {
    config.module.rules.unshift(stylexRule(/\\.tsx$/, true), stylexRule(/\\.ts$/, false));
    return config;
  },
};`;

const postcss = `// postcss.config.cjs: extracts the compiled CSS into the file that holds "@stylex;"
module.exports = {
  plugins: {
    "@stylexjs/postcss-plugin": {
      include: ["app/**/*.{js,jsx,ts,tsx}", "components/**/*.{js,jsx,ts,tsx}"],
      babelConfig: {
        babelrc: false,
        parserOpts: { plugins: ["typescript", "jsx"] },
        plugins: [["@stylexjs/babel-plugin", stylexBabelOptions]],
      },
      useCSSLayers: false,
    },
  },
};

/* app/stylex.css */
@stylex;`;

const vendor = `npx @noorddev/vlak-cli add button dialog

components/vlak/
  button.tsx          the leaf: stylex.create + rs-* classes
  dialog.tsx
  cx.ts, rs.ts        shared helpers, installed once
  tokens.stylex.ts    the same vars, local to your compile
styles/vlak/
  button.css          the CSS projection, if you would rather not compile`;

export default function StylexPage() {
  return (
    <DocsShell
      title="StyleX"
      summary="The components are StyleX leaves. Use the tokens in your own leaves, compile with Vite or Next, or run no compiler at all."
    >
      <DocsExample
        flush
        title="Leaf to simplified output"
        description="Switch views to follow the concept from token references into layered atomic CSS."
      >
        <StylexCompileExample />
      </DocsExample>

      <h2 className="section-label">Writing a leaf</h2>
      <CodeBlock code={leaf} />
      <p className="rs-t-body">
        <code className="rs-code">vlak</code> is a <code className="rs-code">defineVars</code> set
        that aliases the CSS custom properties; it is not a second scale. Change a token in CSS and
        the leaf follows. <code className="rs-code">mq</code> is a{" "}
        <code className="rs-code">defineConsts</code> set of media queries, so the compiler folds
        them and your breakpoints match the kit&apos;s.
      </p>
      <div className="docs-table" tabIndex={0}>
        <table className="rs-table">
          <thead>
            <tr className="rs-table-row">
              <th className="rs-table-th">vlak.*</th>
              <th className="rs-table-th">Aliases</th>
            </tr>
          </thead>
          <tbody>
            {vars.map(([k, v]) => (
              <tr key={k} className="rs-table-row">
                <td className="rs-table-td">
                  <code>{k}</code>
                </td>
                <td className="rs-table-td">{v}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="docs-table" tabIndex={0}>
        <table className="rs-table">
          <thead>
            <tr className="rs-table-row">
              <th className="rs-table-th">mq.*</th>
              <th className="rs-table-th">Query</th>
            </tr>
          </thead>
          <tbody>
            {mqs.map(([k, v]) => (
              <tr key={k} className="rs-table-row">
                <td className="rs-table-td">
                  <code>{k}</code>
                </td>
                <td className="rs-table-td">
                  <code>{v}</code>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="rs-t-body">
        <code className="rs-code">vlakFont</code> and <code className="rs-code">vlakMono</code>{" "}
        export the two font stacks as strings.
      </p>

      <h2 className="section-label">Include the tokens in your compile</h2>
      <p className="rs-t-body">
        StyleX resolves <code className="rs-code">defineVars</code> at compile time, so the file that
        defines them must pass through your compiler. <code className="rs-code">
          @noorddev/vlak-react/tokens.stylex
        </code>{" "}
        ships uncompiled for that reason; its hashes match the package&apos;s own compiled leaves. The
        rest of the package is already compiled and needs nothing.
      </p>

      <h2 className="section-label">Vite</h2>
      <CodeBlock code={vite} />
      <p className="rs-t-body">
        <code className="rs-code">@stylexjs/unplugin</code> discovers installed packages that depend
        on <code className="rs-code">@stylexjs/stylex</code> and transforms them. If a package is
        missed, list it under <code className="rs-code">externalPackages</code>. The compiled CSS is
        appended to your bundle&apos;s CSS asset.
      </p>

      <h2 className="section-label">Next.js</h2>
      <CodeBlock code={nextConfig} />
      <CodeBlock code={postcss} />
      <p className="rs-t-body">
        Two halves: a Babel pass that rewrites <code className="rs-code">stylex.*</code> calls, and
        the PostCSS plugin that collects the CSS. Both read the same options so class hashes match.
        This site compiles its own leaves this way and consumes Vlak precompiled. The{" "}
        <code className="rs-code">@stylexjs/nextjs-plugin</code> package is the shorter road if you
        are not on a static export.
      </p>

      <h2 className="section-label">No compiler</h2>
      <CodeBlock code={`import "@noorddev/vlak-react/css";\nimport { Button } from "@noorddev/vlak-react";`} />
      <p className="rs-t-body">
        The package works with no StyleX toolchain at all: the leaves are compiled at publish time
        and the stylesheet carries the result. Add a compiler only when you write leaves of your
        own.
      </p>

      <h2 className="section-label">Vendoring leaves</h2>
      <CodeBlock code={vendor} />
      <p className="rs-t-body">
        <code className="rs-code">add</code> copies the source leaf, its registry dependencies, and
        the shared helpers once. From there the file is yours: edit it, and your compiler owns the
        output. Vendored leaves import a local{" "}
        <code className="rs-code">tokens.stylex.ts</code>, so the same rules about including it in
        the compile apply. The CSS projection lands next to it for pages that skip React.
      </p>
    </DocsShell>
  );
}
