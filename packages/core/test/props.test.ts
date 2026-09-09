import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { catalogComponents, vlakComponents } from "../src/registry";
import type { VlakPropsJson } from "../src/schema";

const pkgDir = join(import.meta.dirname, "..");
const props = JSON.parse(readFileSync(join(pkgDir, "props/props.json"), "utf8")) as VlakPropsJson;
const version = (JSON.parse(readFileSync(join(pkgDir, "package.json"), "utf8")) as { version: string }).version;
const reactIndex = readFileSync(join(pkgDir, "../react/src/index.ts"), "utf8");

const KINDS = new Set(["component", "hook", "function", "type"]);

describe("props.json", () => {
  it("carries the package version", () => {
    expect(props.version).toBe(version);
  });

  it("has at least one export for every catalog component with a React entry", () => {
    for (const c of catalogComponents) {
      if (!c.react) continue;
      const entry = props.components[c.name];
      expect(entry, `${c.name}: missing from props.json`).toBeTruthy();
      expect(entry!.exports.length, `${c.name}: no exports`).toBeGreaterThan(0);
    }
  });

  it("names only registry components", () => {
    const names = new Set(vlakComponents.map((c) => c.name));
    for (const name of Object.keys(props.components)) expect(names.has(name), `${name} is not in the registry`).toBe(true);
  });

  it("validates against the VlakPropsJson shape", () => {
    for (const [name, entry] of Object.entries(props.components)) {
      expect(Array.isArray(entry.exports), `${name}.exports`).toBe(true);
      for (const e of entry.exports) {
        expect(typeof e.name, `${name}: export name`).toBe("string");
        expect(KINDS.has(e.kind), `${name}.${e.name}: kind "${e.kind}"`).toBe(true);
        expect(Array.isArray(e.props), `${name}.${e.name}: props`).toBe(true);
        if (e.extends !== undefined) expect(typeof e.extends).toBe("string");
        if (e.ref !== undefined) expect(/^[A-Z]\w+Element$/.test(e.ref), `${name}.${e.name}: ref "${e.ref}"`).toBe(true);
        if (e.description !== undefined) expect(typeof e.description).toBe("string");
        for (const p of e.props) {
          expect(typeof p.name, `${name}.${e.name}.${p.name}`).toBe("string");
          expect(typeof p.type, `${name}.${e.name}.${p.name}: type`).toBe("string");
          expect(p.type.length, `${name}.${e.name}.${p.name}: empty type`).toBeGreaterThan(0);
          expect(typeof p.required, `${name}.${e.name}.${p.name}: required`).toBe("boolean");
          if (p.default !== undefined) expect(typeof p.default).toBe("string");
          if (p.description !== undefined) expect(typeof p.description).toBe("string");
        }
      }
    }
  });

  it("lists only exports that the React package exports", () => {
    for (const [name, entry] of Object.entries(props.components)) {
      const component = vlakComponents.find(component => component.name === name)!;
      const exportSource = component.reactImport && component.react ? readFileSync(join(pkgDir, "../react/src", component.react), "utf8") : reactIndex;
      for (const e of entry.exports) {
        expect(new RegExp(`\\b${e.name}\\b`).test(exportSource), `${name}.${e.name} is not exported from its public entry`).toBe(true);
      }
    }
  });

  it("never lists inherited DOM attributes as own props", () => {
    for (const [name, entry] of Object.entries(props.components)) {
      for (const e of entry.exports) {
        const names = e.props.map((p) => p.name);
        for (const inherited of ["className", "style", "onClick", "id"]) {
          if (e.extends) expect(names, `${name}.${e.name} lists ${inherited}`).not.toContain(inherited);
        }
        expect(new Set(names).size, `${name}.${e.name}: duplicate props`).toBe(names.length);
      }
    }
  });
});
