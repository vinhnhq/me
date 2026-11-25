export function Tags({ tags, className = "mt-2", item = "" }: { tags: readonly string[]; className?: string; item?: string }) {
  return (
    <ul
      className={`m-0 flex list-none flex-wrap gap-x-[0.9rem] gap-y-[0.15rem] p-0 font-mono text-[0.78rem] text-muted ${className}`}
      aria-label="Tags"
    >
      {tags.map((t) => (
        <li key={t} className={`m-0 text-pretty ${item}`}>
          #{t}
        </li>
      ))}
    </ul>
  );
}
