import { Markdown, SECTION_HEADING } from "@/components/markdown";
import type { Entry, Section } from "@/lib/markdown";

function EntryRow({ entry: e }: { entry: Entry }) {
  return (
    <div className="mt-7 print:mt-[0.8rem]">
      <h3 className="mt-0 mb-[0.1rem] text-[1.05rem] font-semibold text-balance print:m-0 print:break-after-avoid">
        {e.title} <span className="font-normal text-muted">· {e.org}</span>
      </h3>
      <p className="mt-[0.1rem] mb-[0.4rem] font-mono text-[0.8rem] leading-normal text-pretty text-muted print:m-0 print:text-[8.6pt] print:[font-family:inherit]">
        <span className="text-fg print:text-muted">{e.when}</span>
        {e.where && <span className="before:content-['_·_']">{e.where}</span>}
      </p>
      <div className="[&>:first-child]:mt-[0.35rem] print:[&>ul:last-child]:mb-0">
        <Markdown source={e.text} />
      </div>
    </div>
  );
}

export function ResumeBody({ sections }: { sections: readonly Section[] }) {
  return (
    <article>
      {sections.map((s) => (
        <section key={s.title}>
          <h2 className={SECTION_HEADING}>{s.title}</h2>
          {s.entries ? (
            s.entries.map((e) => <EntryRow key={`${e.title} ${e.when}`} entry={e} />)
          ) : (
            <div>
              <Markdown source={s.text ?? ""} />
            </div>
          )}
        </section>
      ))}
    </article>
  );
}
