import { getMatchFormat, type MatchFormat } from "../utils";

const FORMAT_META = {
  test: {
    label: "Test",
    headline: "4 innings",
    detail: "4 innings",
    description: "Declarations, follow-on and draws.",
    badge: "border-amber-400/30 bg-amber-400/10 text-amber-300",
    dot: "bg-amber-400",
    card: "border-amber-400/15 bg-amber-400/[0.03]",
  },
  t15: {
    label: "T15",
    headline: "2 innings · 15 overs",
    detail: "15 overs",
    description: "Powerplay, middle and death phases.",
    badge: "border-sky-400/30 bg-sky-400/10 text-sky-300",
    dot: "bg-sky-400",
    card: "border-sky-400/15 bg-sky-400/[0.03]",
  },
} as const;

type FormatBadgeProps = {
  match?: any;
  format?: MatchFormat;
  detail?: boolean;
  className?: string;
};

export function FormatBadge({ match, format, detail = false, className = "" }: FormatBadgeProps) {
  const key = format ?? getMatchFormat(match);
  const meta = FORMAT_META[key];

  return (
    <span
      aria-label={`${meta.label} format: ${meta.headline}`}
      className={`inline-flex items-center gap-1.5 rounded-sm border px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] ${meta.badge} ${className}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} aria-hidden="true" />
      {meta.label}
      {detail && (
        <span className="font-normal normal-case tracking-normal opacity-75">· {meta.detail}</span>
      )}
    </span>
  );
}

export function FormatLegend() {
  return (
    <div className="mb-6">
      <p className="mb-2 font-mono text-[10px] font-semibold uppercase tracking-[0.24em] text-ashes-very-muted">
        Match formats
      </p>
      <div className="grid gap-3 sm:grid-cols-2" role="group" aria-label="Match formats">
        {(Object.keys(FORMAT_META) as MatchFormat[]).map((key) => {
          const meta = FORMAT_META[key];
          return (
            <div key={key} className={`flex items-start gap-3 rounded-lg border p-4 ${meta.card}`}>
              <FormatBadge format={key} className="shrink-0" />
              <div className="min-w-0">
                <p className="text-sm font-medium text-white">{meta.headline}</p>
                <p className="mt-0.5 text-xs leading-relaxed text-ashes-muted">{meta.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
