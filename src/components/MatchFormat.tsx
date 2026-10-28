import { getMatchFormat, type MatchFormat } from "../utils";

const FORMAT_META = {
  test: {
    label: "Test",
    mark: "T",
    detail: "4 innings",
    note: "Four innings. Declarations, follow-on and draws are in play.",
    markClass: "border-test/50 bg-test/10 text-test",
    textClass: "text-test",
  },
  t15: {
    label: "T15",
    mark: "15",
    detail: "15 overs",
    note: "Two innings of 15 overs. Boundaries are limited by phase.",
    markClass: "border-t15/50 bg-t15/10 text-t15",
    textClass: "text-t15",
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
      aria-label={`${meta.label} format: ${meta.detail}`}
      className={`inline-flex items-center gap-2 whitespace-nowrap ${className}`}
    >
      <span
        aria-hidden="true"
        className={`flex h-5 min-w-5 items-center justify-center border px-1 font-mono text-[9px] font-semibold leading-none ${meta.markClass}`}
      >
        {meta.mark}
      </span>
      <span className={`font-mono text-[10px] font-semibold uppercase leading-none tracking-[0.16em] ${meta.textClass}`}>
        {meta.label}
      </span>
      {detail && (
        <span className="font-mono text-[10px] leading-none text-paper-mute">· {meta.detail}</span>
      )}
    </span>
  );
}

export function FormatKey() {
  return (
    <section aria-labelledby="format-key-heading">
      <h2 id="format-key-heading" className="label mb-2">
        Format key
      </h2>
      <div className="border-y border-rule">
        {(Object.keys(FORMAT_META) as MatchFormat[]).map((key) => {
          const meta = FORMAT_META[key];
          return (
            <div
              key={key}
              className="grid gap-2 border-b border-rule-soft py-3 last:border-b-0 sm:grid-cols-[150px_minmax(0,1fr)] sm:items-baseline"
            >
              <FormatBadge format={key} />
              <p className="text-sm leading-relaxed text-paper-mute">{meta.note}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
