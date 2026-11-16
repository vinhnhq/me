/** A post's three tags, as a quiet line of #words. Labels, not links: there are no tag pages. */
export function Tags({ tags }: { tags: readonly string[] }) {
  return (
    <ul className="tags" aria-label="Tags">
      {tags.map((t) => (
        <li key={t}>#{t}</li>
      ))}
    </ul>
  );
}
