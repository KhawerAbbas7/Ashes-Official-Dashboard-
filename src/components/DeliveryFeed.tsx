import { useEffect, useId, useState } from "react";
import { ChevronDown } from "lucide-react";
import { fetchMatchDeliveries } from "../api";
import { StateTag } from "./StateTag";

type DeliveryFilter =
  | "all"
  | "batter-can-do-0"
  | "batter-cant-do-0"
  | "bowler-can-do-0"
  | "fours"
  | "sixes"
  | "wickets"
  | "afk"
  | "non-afk";

const FILTERS: { value: DeliveryFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "batter-can-do-0", label: "Batter can do 0" },
  { value: "batter-cant-do-0", label: "Batter can't do 0" },
  { value: "bowler-can-do-0", label: "Bowler can do 0" },
  { value: "fours", label: "4s" },
  { value: "sixes", label: "6s" },
  { value: "wickets", label: "Wickets" },
  { value: "afk", label: "AFK" },
  { value: "non-afk", label: "Non-AFK" },
];

function outcomeLabel(delivery: any) {
  if (delivery.isAfk) return "AFK";
  if (delivery.isWicket) return "W";
  return String(delivery.runs ?? 0);
}

function outcomeAria(delivery: any) {
  if (delivery.isAfk) return "AFK delivery";
  if (delivery.isWicket) {
    return delivery.runs > 0 ? `Wicket, ${delivery.runs} runs credited` : "Wicket";
  }
  return `${delivery.runs} run${delivery.runs === 1 ? "" : "s"}`;
}

function afkLabel(side: string | null) {
  if (side === "both") return "Both players AFK";
  if (side === "batter") return "Batter AFK";
  if (side === "bowler") return "Bowler AFK";
  return "AFK";
}

type DeliveryFeedProps = {
  matchId: string;
  inningNo: number;
  format: string;
  batters?: any[];
  bowlers?: any[];
  key?: string | number;
};

export function DeliveryFeed({ matchId, inningNo, format, batters = [], bowlers = [] }: DeliveryFeedProps) {
  const [filter, setFilter] = useState<DeliveryFilter>("all");
  const [batterId, setBatterId] = useState("");
  const [bowlerId, setBowlerId] = useState("");
  const [page, setPage] = useState(1);
  const [loadedPage, setLoadedPage] = useState(0);
  const [retry, setRetry] = useState(0);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const batterSelectId = useId();
  const bowlerSelectId = useId();

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);

    fetchMatchDeliveries(matchId, inningNo, page, filter, 20, batterId, bowlerId)
      .then((res) => {
        if (cancelled) return;
        setLoadedPage(page);
        setData((previous: any) => {
          if (page === 1) return res;
          return {
            ...res,
            deliveries: [...(previous?.deliveries || []), ...(res.deliveries || [])],
          };
        });
      })
      .catch(() => {
        if (!cancelled) setError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [matchId, inningNo, page, filter, batterId, bowlerId, retry]);

  const resetFeed = () => {
    setPage(1);
    setLoadedPage(0);
    setRetry(0);
    setData(null);
  };

  const changeFilter = (next: DeliveryFilter) => {
    if (next === filter) return;
    setFilter(next);
    resetFeed();
  };

  const changeBatter = (next: string) => {
    setBatterId(next);
    resetFeed();
  };

  const changeBowler = (next: string) => {
    setBowlerId(next);
    resetFeed();
  };

  const loadOlder = () => {
    if (error) {
      setRetry((value) => value + 1);
      return;
    }
    setPage(loadedPage + 1);
  };

  const deliveries = data?.deliveries || [];

  return (
    <section aria-labelledby="deliveries-heading">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 id="deliveries-heading" className="display text-2xl">
          Deliveries
        </h3>
        {data && (
          <span className="label">
            {deliveries.length} of {data.total}
          </span>
        )}
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor={batterSelectId} className="label">
            Batter
          </label>
          <div className="relative mt-1.5">
            <select
              id={batterSelectId}
              value={batterId}
              onChange={(event) => changeBatter(event.target.value)}
              className="select py-2 text-xs"
            >
              <option value="">All batters</option>
              {batters.map((batter: any) => (
                <option key={batter.playerId} value={batter.playerId}>
                  {batter.playerName}
                </option>
              ))}
            </select>
            <ChevronDown
              className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-paper-mute"
              aria-hidden="true"
            />
          </div>
        </div>

        <div>
          <label htmlFor={bowlerSelectId} className="label">
            Bowler
          </label>
          <div className="relative mt-1.5">
            <select
              id={bowlerSelectId}
              value={bowlerId}
              onChange={(event) => changeBowler(event.target.value)}
              className="select py-2 text-xs"
            >
              <option value="">All bowlers</option>
              {bowlers.map((bowler: any) => (
                <option key={bowler.playerId} value={bowler.playerId}>
                  {bowler.playerName}
                </option>
              ))}
            </select>
            <ChevronDown
              className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-paper-mute"
              aria-hidden="true"
            />
          </div>
        </div>
      </div>

      <div className="scroll-x mt-3 flex gap-5 border-b border-rule" role="group" aria-label="Filter deliveries">
        {FILTERS.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => changeFilter(option.value)}
            aria-pressed={filter === option.value}
            className="tab"
          >
            {option.label}
          </button>
        ))}
      </div>

      {error && !data ? (
        <div className="border-b border-rule py-10 text-center">
          <p className="label text-ball">Deliveries unavailable</p>
          <button
            type="button"
            onClick={() => setRetry((value) => value + 1)}
            className="btn btn-quiet mt-4"
          >
            Retry
          </button>
        </div>
      ) : loading && !data ? (
        <p className="label py-10 text-center">Loading deliveries…</p>
      ) : deliveries.length === 0 ? (
        <div className="border-b border-rule py-10 text-center">
          <p className="label">
            {filter === "all" && !batterId && !bowlerId
              ? "No deliveries recorded for this innings"
              : "No deliveries match these filters"}
          </p>
        </div>
      ) : (
        <>
          <ol className="mt-2">
            {deliveries.map((delivery: any, index: number) => (
              <li
                key={delivery.ballId || `${delivery.ball}-${index}`}
                className="grid gap-3 border-b border-rule-soft py-4 sm:grid-cols-[4rem_minmax(0,1fr)_auto] sm:gap-5"
              >
                <div className="flex items-center justify-between gap-2 sm:block">
                  <span className="num text-sm text-paper">{delivery.ball}</span>
                  <span className="label sm:mt-1 sm:block">Ov {delivery.over}</span>
                </div>

                <div className="min-w-0">
                  <p className="flex flex-wrap items-baseline gap-x-2 gap-y-1 text-sm">
                    <span className="font-medium text-paper">{delivery.bowler?.name || "—"}</span>
                    <span className="text-paper-mute">to</span>
                    <span className="font-medium text-paper">{delivery.batter?.name || "—"}</span>
                    {delivery.isAfk && <StateTag tone="accent">AFK</StateTag>}
                    {delivery.isWicket && <StateTag tone="alert">Wicket</StateTag>}
                  </p>

                  <p className="mt-1 text-sm leading-snug text-paper-soft">
                    {delivery.isAfk ? (
                      <span>{afkLabel(delivery.afkSide)}</span>
                    ) : (
                      <span>
                        Batter <span className="num text-paper">{delivery.batterNum ?? "—"}</span>
                        <span className="text-paper-mute"> · </span>
                        Bowler <span className="num text-paper">{delivery.bowlerNum ?? "—"}</span>
                      </span>
                    )}
                    <span className="text-paper-mute"> · </span>
                    <span className="num text-paper">{delivery.inningScore}</span>{" "}
                    <span className="num text-paper-mute">({delivery.inningOvers})</span>
                  </p>

                  <p className="mt-1 text-sm leading-snug text-paper-mute">{delivery.matchStatus}</p>

                  {format === "test" && delivery.day && (
                    <p className="label mt-1">
                      Day {delivery.day} · Session {delivery.session ?? "—"}
                    </p>
                  )}

                  <div className="mt-2 flex flex-wrap gap-1">
                    {!delivery.isAfk && (
                      <>
                        <StateTag tone={delivery.batterCanDo0 ? "quiet" : "alert"}>
                          {delivery.batterCanDo0 ? "Can do 0" : "Can't do 0"}
                        </StateTag>
                        <StateTag tone={delivery.batterCanDoBoundary ? "quiet" : "alert"}>
                          {delivery.batterCanDoBoundary ? "Can hit 4/6" : "Can't hit 4/6"}
                        </StateTag>
                        {delivery.bowlerCanDo0 && (
                          <StateTag tone="alert">Bowler can do 0</StateTag>
                        )}
                      </>
                    )}
                    {delivery.isWicket && delivery.runs > 0 && (
                      <StateTag tone="accent">{delivery.runs} credited</StateTag>
                    )}
                  </div>
                </div>

                <div className="flex items-start justify-end">
                  <span className="sr-only">{outcomeAria(delivery)}</span>
                  <span
                    aria-hidden="true"
                    className={`num text-2xl leading-none ${
                      delivery.isAfk
                        ? "text-lobby"
                        : delivery.isWicket
                          ? "text-ball"
                          : delivery.runs >= 4
                            ? "text-test"
                            : "text-paper"
                    }`}
                  >
                    {outcomeLabel(delivery)}
                  </span>
                </div>
              </li>
            ))}
          </ol>

          {error && (
            <p className="pt-3 text-center text-sm text-ball">
              Could not load older deliveries.
            </p>
          )}

          {data?.hasMore ? (
            <div className="border-t border-rule pt-4 text-center">
              <button
                type="button"
                onClick={loadOlder}
                disabled={loading}
                className="btn btn-quiet"
              >
                {loading ? "Loading…" : "Load older deliveries"}
              </button>
            </div>
          ) : (
            <p className="label border-t border-rule pt-4 text-center">End of innings</p>
          )}
        </>
      )}
    </section>
  );
}
