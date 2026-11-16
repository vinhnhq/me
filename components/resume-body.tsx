import type { Entry, Section } from "@/lib/markdown";

/** A job or a degree: dates in a narrow left column on a wide screen, stacked on a phone and on paper. */
function EntryRow({ entry: e }: { entry: Entry }) {
  return (
    // Source order is the phone's and the paper's: title, dates, text. The wide
    // layout lifts the dates into a left column with grid placement alone.
    <div className="entry">
      <h3>
        {e.title} <span className="entry-org">· {e.org}</span>
      </h3>
      <p className="entry-when">
        <span>{e.when}</span>
        {e.where && <span>{e.where}</span>}
      </p>
      <div className="entry-text" dangerouslySetInnerHTML={{ __html: e.html }} />
      {e.moreHtml && (
        // folded on the web; the print sheet and the PDF route open it
        <details className="more">
          <summary>All {e.count} highlights</summary>
          <div dangerouslySetInnerHTML={{ __html: e.moreHtml }} />
        </details>
      )}
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
