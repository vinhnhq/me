export function Tags({ tags }: { tags: readonly string[] }) {
  return (
    <ul className="tags" aria-label="Tags">
      {tags.map((t) => (
        <li key={t}>#{t}</li>
      ))}
    </ul>
  );
}
