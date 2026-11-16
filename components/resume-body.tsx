import type { Entry, Section } from "@/lib/markdown";

/** A job or a degree: title, the dates on one line, then the text. */
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
      <div className="entry-text" dangerouslySetInnerHTML={{ __html: e.html }} />
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
            <div dangerouslySetInnerHTML={{ __html: s.html ?? "" }} />
          )}
        </section>
      ))}
    </article>
  );
}
