import type { ReactNode } from "react";

type PageHeaderProps = {
  kicker?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
};

export function PageHeader({ kicker, title, description, actions }: PageHeaderProps) {
  return (
    <header className="mb-8 border-b border-rule pb-6 md:mb-10">
      {kicker && <p className="label text-ball">{kicker}</p>}
      <div className="mt-2 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="min-w-0">
          <h1 className="display text-4xl leading-[0.95] sm:text-5xl">{title}</h1>
          {description && (
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-paper-mute">{description}</p>
          )}
        </div>
        {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
      </div>
    </header>
  );
}
