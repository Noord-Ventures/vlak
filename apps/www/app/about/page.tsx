import type { Metadata } from "next";
import type { ReactNode } from "react";
import { CopyControl } from "@/components/code-block";
import { sx } from "@/lib/sx";
import { DOOR } from "../specimen";
import {
  era,
  featured,
  field,
  history,
  lead,
  license,
  noord,
  person,
  program,
  specimen,
  typeface,
  usage,
} from "./facts";
import { AboutNotes } from "./about-notes";
import { about } from "./about.stylex";
import "./about.css";

export const metadata: Metadata = {
  title: "About",
  description: "The method, design lineage, and practical constraints behind Vlak.",
  alternates: { canonical: `${DOOR}/about/` },
};

function Kicker({ children, id, nav }: { children: ReactNode; id?: string; nav?: boolean }) {
  return (
    <p id={id} {...sx("field-kicker", about.kicker, nav ? about.kickerNav : null)}>
      {children}
    </p>
  );
}

function Copy({ children, wide }: { children: ReactNode; wide?: boolean }) {
  return (
    <div {...sx(wide ? "field-copy field-copy-wide" : "field-copy", about.copy, wide ? about.copyWide : null)}>
      {children}
    </div>
  );
}

function CopyP({ children }: { children: ReactNode }) {
  return <p {...sx("", about.copyP)}>{children}</p>;
}

function Mark({ children }: { children: ReactNode }) {
  return <p {...sx("field-mark", about.mark)}>{children}</p>;
}

function WorkStill({ src, alt }: { src: string; alt: string }) {
  return (
    <div {...sx("field-work", about.work)}>
      <img src={src} alt={alt} loading="lazy" decoding="async" {...sx("", about.workImg)} />
    </div>
  );
}

export default function AboutPage() {
  return (
    <main id="main" {...sx("field-page", about.page)} aria-label="About Vlak">
      <div {...sx("field", about.field)}>
        <section
          {...sx("field-cell field-cell-era", about.cell, about.cellTall, about.cellEnd)}
          aria-labelledby="era-heading"
        >
          <Kicker>{era.kicker}</Kicker>
          <h1 id="era-heading" {...sx("field-face", about.face)}>
            {era.heading}
          </h1>
        </section>

        <section {...sx("field-cell field-cell-lead", about.cell, about.cellLead)}>
          <Kicker nav>{lead.kicker}</Kicker>
          <Copy>
            <CopyP>{lead.what}</CopyP>
            <CopyP>{lead.who}</CopyP>
          </Copy>
        </section>

        <section
          {...sx("field-cell field-cell-use", about.cell, about.cellTall, about.cellStart)}
          aria-labelledby="usage-heading"
        >
          <Kicker id="usage-heading">{usage.kicker}</Kicker>
          <Copy>
            <CopyP>{usage.intro}</CopyP>
          </Copy>
          <div {...sx("field-code-stack", about.codeStack)}>
            <div {...sx("field-step", about.step)}>
              <Kicker>{usage.commandWhere}</Kicker>
              <div {...sx("field-code-row", about.codeRow)}>
                <pre {...sx("field-code", about.code)}>
                  <code>{usage.command}</code>
                </pre>
                <CopyControl text={usage.command} />
              </div>
            </div>
            <div {...sx("field-step", about.step)}>
              <Kicker>{usage.htmlWhere}</Kicker>
              <div {...sx("field-code-row", about.codeRow)}>
                <pre {...sx("field-code", about.code)}>
                  <code>{usage.html}</code>
                </pre>
                <CopyControl text={usage.html} />
              </div>
            </div>
            <div {...sx("field-step", about.step)}>
              <Kicker>{usage.controlWhere}</Kicker>
              <div {...sx("field-code-row", about.codeRow)}>
                <pre {...sx("field-code", about.code)}>
                  <code>{usage.control}</code>
                </pre>
                <CopyControl text={usage.control} />
              </div>
            </div>
          </div>
          <Copy>
            <CopyP>{usage.landing}</CopyP>
            <CopyP>{usage.files}</CopyP>
          </Copy>
          <Mark>{usage.after}</Mark>
        </section>

        <section {...sx("field-cell field-cell-free", about.cell)}>
          <Kicker>{license.kicker}</Kicker>
          <Copy>
            <CopyP>{license.body}</CopyP>
            <CopyP>
              {license.type}{" "}
              <a href={typeface.url} {...sx("", about.link)}>
                {typeface.url.replace("https://", "")}
              </a>
            </CopyP>
          </Copy>
        </section>

        <section
          {...sx("field-cell field-cell-spec", about.cell, about.cellTall, about.cellStart)}
          aria-labelledby="specimen-heading"
        >
          <Kicker id="specimen-heading">{specimen.kicker}</Kicker>
          <p {...sx("field-spec-type", about.specType)} aria-hidden="true">
            Vlak
          </p>
          <Copy wide>
            <CopyP>{specimen.body}</CopyP>
            <CopyP>{specimen.mid}</CopyP>
            <CopyP>{specimen.long}</CopyP>
          </Copy>
        </section>

        <section {...sx("field-cell field-cell-mod", about.cell)} aria-label="Grid system">
          <Kicker>{program.module.kicker}</Kicker>
          <div
            {...sx("field-spec field-spec-module", about.spec, about.specModule)}
            role="img"
            aria-label="204 module: 184 column and 20 gutter"
          >
            <div {...sx("field-mod204", about.mod204)}>
              <div {...sx("field-col184", about.col184)} />
              <div {...sx("field-gut20", about.gut20)} />
            </div>
            <div {...sx("field-mod-dim", about.modDim)}>
              <span>184</span>
              <span>20</span>
            </div>
          </div>
          <Mark>{program.module.law}</Mark>
        </section>

        <section {...sx("field-cell field-cell-hair", about.cell)} aria-label="Hairlines">
          <Kicker>{program.hairline.kicker}</Kicker>
          <div {...sx("field-spec field-spec-hair", about.spec, about.specHair)} aria-hidden="true" />
          <Mark>{program.hairline.law}</Mark>
        </section>

        <section {...sx("field-cell field-cell-flush", about.cell)} aria-label="Flush cells">
          <Kicker>{program.flush.kicker}</Kicker>
          <div {...sx("field-spec field-spec-flush", about.spec, about.specFlush)} aria-hidden="true">
            <div {...sx("field-flush-row", about.flushRow)} />
            <div {...sx("field-flush-row", about.flushRow)} />
            <div {...sx("field-flush-row", about.flushRow)} />
          </div>
          <Mark>{program.flush.law}</Mark>
        </section>

        <section {...sx("field-cell field-cell-grot", about.cell, about.cellTall)} aria-label="Grotesque">
          <Kicker>{program.grotesque.kicker}</Kicker>
          <p {...sx("field-grotesque", about.grotesque)} aria-hidden="true">
            {program.grotesque.mark}
          </p>
          <Mark>{program.grotesque.law}</Mark>
        </section>

        <section {...sx("field-cell field-cell-hist", about.cell)}>
          <Kicker>{history.kicker}</Kicker>
          <Copy>
            <CopyP>{history.body}</CopyP>
            <CopyP>{history.dutch}</CopyP>
            <CopyP>{history.now}</CopyP>
          </Copy>
        </section>

        {featured.map((figure) => (
          <section
            key={figure.id}
            {...sx(
              `field-cell field-cell-${figure.id}${figure.work ? " field-cell-has-work" : ""}`,
              about.cell,
              figure.work ? about.cellWork : null,
            )}
            aria-label={figure.name}
          >
            {figure.work ? <WorkStill src={figure.work.src} alt={figure.work.alt} /> : null}
            {figure.work ? (
              <div {...sx("field-matter", about.matter)}>
                <Kicker>
                  {figure.years} · {figure.place}
                </Kicker>
                <h2 {...sx("field-name field-name-feature", about.name, about.nameFeature)}>{figure.name}</h2>
                <Mark>{figure.mark}</Mark>
              </div>
            ) : (
              <>
                <Kicker>
                  {figure.years} · {figure.place}
                </Kicker>
                <h2 {...sx("field-name field-name-feature", about.name, about.nameFeature)}>{figure.name}</h2>
                <Mark>{figure.mark}</Mark>
              </>
            )}
          </section>
        ))}

        {field.map((entry, i) => {
          const work = "work" in entry ? entry.work : undefined;
          return (
            <section
              key={entry.name}
              {...sx(
                `field-cell field-cell-n${String(i + 1).padStart(2, "0")}${work ? " field-cell-has-work" : ""}`,
                about.cell,
                work ? about.cellWork : null,
              )}
              aria-label={entry.name}
            >
              {work ? <WorkStill src={work.src} alt={work.alt} /> : null}
              {work ? (
                <div {...sx("field-matter", about.matter)}>
                  <Kicker>
                    {entry.years} · {entry.place}
                  </Kicker>
                  <h2 {...sx("field-name", about.name)}>{entry.name}</h2>
                  <Mark>{entry.mark}</Mark>
                </div>
              ) : (
                <>
                  <Kicker>
                    {entry.years} · {entry.place}
                  </Kicker>
                  <h2 {...sx("field-name", about.name)}>{entry.name}</h2>
                  <Mark>{entry.mark}</Mark>
                </>
              )}
            </section>
          );
        })}

        <section {...sx("field-cell field-cell-faq", about.cell, about.cellStart)} aria-labelledby="notes-heading">
          <Kicker id="notes-heading">Practical notes</Kicker>
          <div {...sx("field-notes", about.notes)}>
            <AboutNotes />
          </div>
        </section>

        <section {...sx("field-cell field-cell-colophon", about.cell, about.cellStart)} aria-label="Colophon">
          <Kicker>Colophon</Kicker>
          <div {...sx("field-colophon", about.colophon)}>
            <p {...sx("", about.colophonP)}>
              <a href={noord.url} {...sx("", about.link)}>{noord.heading}</a> · {noord.span}
            </p>
            <p {...sx("", about.colophonP)}>
              {noord.built} <a href={person.url} {...sx("", about.link)}>{person.heading}</a>.
            </p>
            <p {...sx("", about.colophonP)}>
              Vlak logo designed by <a href="https://www.liannedias.com" {...sx("", about.link)}>Li-Anne Dias</a>.
            </p>
            <p {...sx("", about.colophonP)}>
              {typeface.name}, {typeface.license} · {typeface.designer}. {typeface.ofl}.{" "}
              <a href={typeface.url} {...sx("", about.link)}>
                {typeface.url.replace("https://", "")}
              </a>
            </p>
            <p {...sx("", about.colophonP)}>{noord.packages.join(" · ")}</p>
            <p {...sx("", about.colophonP)}>
              <a href={noord.door} {...sx("", about.link)}>
                {noord.door.replace("https://", "")}
              </a>
              {" · "}
              <a href={noord.host} {...sx("", about.link)}>
                {noord.host.replace("https://", "")}
              </a>
              {" · "}
              <a href={person.repo} {...sx("", about.link)}>
                github.com/Noord-Ventures/vlak
              </a>
            </p>
            <p {...sx("", about.colophonP)}>
              {person.copyright}, {person.year}.
            </p>
            <p {...sx("", about.colophonP)}>
              <code className="rs-code">{noord.command}</code>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
