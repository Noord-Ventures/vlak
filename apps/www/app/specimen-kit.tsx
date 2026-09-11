import Link from "next/link";
import { catalogComponents } from "@noorddev/vlak";
import { Preview } from "@/components/preview";
import { sx } from "@/lib/sx";
import { KIT } from "./specimen";
import { specimen } from "./specimen.stylex";

const slots = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l"] as const;

export function SpecimenKit() {
  const shown = new Set<string>(KIT);
  const more = catalogComponents.filter((component) => !shown.has(component.name)).length;

  return (
    <>
      <h2 className="rs-sr">The kit</h2>
      {KIT.map((name, i) => {
        const component = catalogComponents.find((c) => c.name === name);
        if (!component) return null;
        const slot = slots[i] ?? "a";
        return (
          <section
            key={component.name}
            {...sx(
              `specimen-cell specimen-cell-demo specimen-cell-kit-${slot} specimen-cell-kit-${component.name}`,
              specimen.cell,
            )}
            aria-label={component.title}
          >
            <p className="specimen-kit-name">
              <Link href={`/components/${component.name}`} prefetch={false}>{component.title}</Link>
            </p>
            <div className="specimen-kit-live">
              <Preview name={component.name} snippet={component.snippet} defer />
            </div>
          </section>
        );
      })}
      <section {...sx("specimen-cell specimen-cell-more", specimen.cell)} aria-label="More components">
        <p className="specimen-more">
          <Link href="/components" prefetch={false}>Browse {more} more components</Link>
        </p>
      </section>
    </>
  );
}
