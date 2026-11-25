import type { ComponentProps } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";

type Picture = { src?: string; alt?: string; title?: string };
type Rest<T extends keyof React.JSX.IntrinsicElements> = ComponentProps<T> & { node?: unknown };

function Figure({ src = "", alt = "", title, lead }: Picture & { lead: boolean }) {
  const size = /-(\d+)x(\d+)\.[a-z]+$/.exec(src);
  return (
    <figure className="my-7">
      {/* biome-ignore lint/performance/noImgElement: the file name carries the size, and the page stays static */}
      <img
        className="block h-auto w-full rounded-[0.6rem] border border-rule"
        src={src}
        alt={alt}
        width={size ? Number(size[1]) : undefined}
        height={size ? Number(size[2]) : undefined}
        {...(lead ? { fetchPriority: "high" as const } : { loading: "lazy" as const })}
        decoding="async"
      />
      {title && <figcaption className="mt-2 text-[0.85rem] text-pretty text-muted">{title}</figcaption>}
    </figure>
  );
}

export const SECTION_HEADING =
  "mt-10 mb-4 flex items-center gap-4 text-[0.95rem] font-bold tracking-[0.06em] uppercase after:h-[2px] after:flex-1 after:bg-rule after:content-[''] print:mt-4 print:mb-2 print:text-[9.5pt]";

function components(): Components {
  let pictures = 0;
  return {
    p({ node, children }) {
      const only = node?.children.length === 1 ? node.children[0] : undefined;
      if (only?.type === "element" && only.tagName === "img") {
        return <Figure {...(only.properties as Picture)} lead={pictures++ === 0} />;
      }
      return <p className="my-2 text-pretty">{children}</p>;
    },
    h2: ({ node: _, ...props }: Rest<"h2">) => <h2 className={SECTION_HEADING} {...props} />,
    h3: ({ node: _, ...props }: Rest<"h3">) => (
      <h3 className="mt-7 mb-[0.1rem] text-[1.05rem] font-semibold text-balance print:m-0 print:break-after-avoid" {...props} />
    ),
    ul: ({ node: _, ...props }: Rest<"ul">) => <ul className="my-2 list-disc pl-[1.1rem]" {...props} />,
    ol: ({ node: _, ...props }: Rest<"ol">) => <ol className="my-4 list-decimal pl-[40px]" {...props} />,
    li: ({ node: _, ...props }: Rest<"li">) => (
      <li className="my-[0.3rem] text-pretty marker:text-accent print:my-[0.12rem] print:break-inside-avoid" {...props} />
    ),
    a: ({ node: _, ...props }: Rest<"a">) => (
      <a className="touch-manipulation text-accent underline underline-offset-2 print:no-underline" {...props} />
    ),
    strong: ({ node: _, ...props }: Rest<"strong">) => <strong className="font-semibold" {...props} />,
    code: ({ node: _, ...props }: Rest<"code">) => (
      <code className="rounded-[4px] bg-chip px-[0.35em] py-[0.1em] font-mono text-[0.9em]" {...props} />
    ),
    table: ({ node: _, ...props }: Rest<"table">) => (
      <div className="overflow-x-auto">
        <table className="my-4 w-full border-collapse text-[0.95rem]" {...props} />
      </div>
    ),
    thead: ({ node: _, ...props }: Rest<"thead">) => <thead className="hidden" {...props} />,
    th: ({ node: _, ...props }: Rest<"th">) => <th className="p-px" {...props} />,
    td: ({ node: _, ...props }: Rest<"td">) => (
      <td className="border-b border-rule py-[0.45rem] align-top first:w-[55%] first:pr-4 first:text-muted phone:first:w-auto" {...props} />
    ),
  };
}

export function Markdown({ source }: { source: string }) {
  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={components()}>
      {source}
    </ReactMarkdown>
  );
}
