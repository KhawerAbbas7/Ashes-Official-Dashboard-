import type { ReactNode } from "react";

type PageHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  children?: ReactNode;
};

export function PageHeader({ eyebrow, title, description, children }: PageHeaderProps) {
  return (
    <div className="mb-8 flex flex-col gap-4 border-b border-ashes-border pb-6 md:flex-row md:items-end md:justify-between">
      <div>
        {eyebrow && (
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.28em] text-ashes-red">
            {eyebrow}
          </p>
        )}
        <h1 className="mt-1.5 font-bebas text-3xl tracking-wide text-white md:text-4xl">{title}</h1>
        {description && (
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-ashes-muted">{description}</p>
        )}
      </div>
      {children}
    </div>
  );
}
