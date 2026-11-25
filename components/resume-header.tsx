import type { ReactNode } from "react";
import { Markdown } from "@/components/markdown";
import type { Resume } from "@/lib/markdown";
import { HEADING } from "@/lib/styles";

const stroke = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

const Icon = ({ children, solid }: { children: ReactNode; solid?: boolean }) => (
  <svg
    className="flex-none align-baseline print:size-[10pt]"
    viewBox="0 0 24 24"
    width="16"
    height="16"
    aria-hidden="true"
    {...(solid ? { fill: "currentColor" } : stroke)}
  >
    {children}
  </svg>
);

const icons = {
  github: (
    <Icon solid>
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </Icon>
  ),
};

const LI = "m-0 flex items-center gap-[0.4rem] text-pretty pointer-coarse:min-h-touch phone:first:basis-full phone:last:basis-full";
const LINK =
  "touch-manipulation text-inherit underline decoration-rule underline-offset-[3px] hover:text-fg hover:decoration-current pointer-coarse:inline-flex pointer-coarse:min-h-touch pointer-coarse:items-center";

export function ResumeHeader({ resume: r }: { resume: Resume }) {
  return (
    <header>
      <div className="mt-2 mb-3 flex items-start gap-8 text-[1.05rem] print:gap-[6mm] phone:flex-col phone:items-center phone:gap-4">
        {/* biome-ignore lint/performance/noImgElement: one small local file, printed as it is by the PDF */}
        <img
          className="m-[3px] size-38 max-w-none flex-none rounded-[50%] border-4 border-bg object-cover align-baseline outline-[3px] outline-accent print:size-[30mm] print:border-[1mm] print:outline-[0.7mm] phone:size-30"
          src="/vinh-nguyen.jpg"
          alt={r.name}
          width={160}
          height={160}
          fetchPriority="high"
        />
        <div>
          <h1 className={`${HEADING} phone:mx-auto phone:text-center`}>{r.name}</h1>
          <p className="mt-0 mb-2 text-[1.2rem] text-pretty text-accent print:mb-[0.3rem] print:text-[11.5pt] phone:text-center">
            {r.headline}
          </p>
          <div className="[&_p]:m-0 [&_p+p]:mt-[0.6rem] print:[&_p+p]:mt-1">
            <Markdown source={r.summary} />
          </div>
          {r.values.length > 0 && (
            <p className="mt-[0.9rem] mb-0 flex flex-wrap items-baseline gap-x-[0.6rem] gap-y-[0.15rem] text-pretty print:mt-[0.35rem] phone:mt-5 phone:justify-center phone:gap-y-[0.35rem]">
              <span className="mr-[0.4rem] font-mono text-[0.75rem] tracking-[0.14em] text-muted uppercase print:text-[7pt] phone:mr-0 phone:basis-full phone:text-center">
                Values
              </span>
              {r.values.map((v, i) => (
                <strong key={v} className="font-bold phone:text-[0.95rem]">
                  {i > 0 && (
                    <span className="mr-[0.6rem] font-normal text-muted" aria-hidden="true">
                      ·
                    </span>
                  )}
                  {v}
                </strong>
              ))}
            </p>
          )}
        </div>
      </div>
      <ul className="mt-6 mb-0 flex list-none flex-wrap items-center gap-x-6 gap-y-[0.35rem] p-0 font-mono text-[0.8rem] text-muted print:mt-[0.7rem] print:gap-x-[1.1rem] print:gap-y-[0.2rem] print:text-[8.4pt] pointer-coarse:gap-y-0 phone:gap-y-0">
        <li className={LI}>{r.location}</li>
        <li className={LI}>
          <a className={LINK} href={`tel:${r.phone.replace(/\s/g, "")}`}>
            {r.phone}
          </a>
        </li>
        <li className={LI}>
          <a className={LINK} href={`mailto:${r.email}`}>
            {r.email}
          </a>
        </li>
        <li className={LI}>
          {icons.github}
          <a className={LINK} href={`https://github.com/${r.github}`} aria-label={`GitHub: ${r.github}`}>
            {r.github}
          </a>
        </li>
      </ul>
    </header>
  );
}
