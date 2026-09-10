"use client";

import Link from "next/link";
import { useId, useState } from "react";
import { Field, FieldLabel, Input } from "@noorddev/vlak-react";
import type { AiPageGroup } from "@/lib/ai-catalog";
import { filterAiPageGroups } from "@/lib/ai-catalog-search";

/** The complete linked catalogue is rendered before JavaScript; filtering is local. */
export function AiCatalog({ groups }: { groups: AiPageGroup[] }) {
  const [query, setQuery] = useState("");
  const inputId = useId();
  const visible = filterAiPageGroups(groups, query);
  const count = visible.reduce((total, group) => total + group.pages.length, 0);

  return <div data-ai-catalog>
    <Field>
      <FieldLabel htmlFor={inputId}>Find a component</FieldLabel>
      <Input id={inputId} type="search" value={query} placeholder="Search names, features, or aliases" autoComplete="off"
        aria-controls={`${inputId}-results`} onChange={event => setQuery(event.target.value)}
        onKeyDown={event => { if (event.key === "Escape") { event.preventDefault(); setQuery(""); } }} />
      <p className="rs-t-body" role="status" aria-live="polite">{query.trim() ? `${count} ${count === 1 ? "result" : "results"}` : `${count} components and patterns`}</p>
    </Field>
    <div id={`${inputId}-results`}>
      {visible.map(group => <div className="ai-catalog-group" key={group.title}>
        <h3 className="section-label">{group.title}</h3>
        <ul className="ai-component-list">
          {group.pages.map(page => <li key={page.href}>
            <Link href={`${page.href}/`}><strong>{page.title}</strong><span>{page.description}</span></Link>
          </li>)}
        </ul>
      </div>)}
      {count === 0 && <p className="rs-t-body">No matching components. Try a different name or feature.</p>}
    </div>
  </div>;
}
