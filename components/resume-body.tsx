import { Markdown } from "@/components/markdown";
import type { Entry, Section } from "@/lib/markdown";

function EntryRow({ entry: e }: { entry: Entry }) {
  return (
    <div className="entry">
      <h3>
        {e.title} <span className="entry-org">· {e.org}</span>
      </h3>
      <p className="entry-when">
        <span>{e.when}</span>
        {e.where && <span>{e.where}</span>}
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
          <h2>{s.title}</h2>
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
